const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');

admin.initializeApp();

// Configurar Mercado Pago con Access Token desde variables de entorno
const client = new MercadoPagoConfig({
    accessToken: functions.config().mercadopago.access_token
});

const preferenceClient = new Preference(client);
const paymentClient = new Payment(client);

/**
 * Función para procesar pago directamente con Checkout API
 * Se llama desde el frontend cuando el usuario envía el formulario de pago
 */
exports.createPayment = functions.https.onCall(async (data, context) => {
    try {
        console.log('Creating payment for order:', data.orderId);
        
        // Validar datos recibidos
        if (!data.token) {
            throw new functions.https.HttpsError('invalid-argument', 'Token de pago no proporcionado');
        }
        
        if (!data.items || data.items.length === 0) {
            throw new functions.https.HttpsError('invalid-argument', 'No hay items en el carrito');
        }
        
        if (!data.payer || !data.payer.email) {
            throw new functions.https.HttpsError('invalid-argument', 'Información del comprador incompleta');
        }
        
        // Calcular total
        const total = data.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) + (data.shipping || 0);
        
        // Crear pago
        const paymentData = {
            transaction_amount: total,
            token: data.token,
            description: `Orden ${data.orderId} - HogarVerde`,
            installments: parseInt(data.installments) || 1,
            payment_method_id: data.paymentMethodId,
            payer: {
                email: data.payer.email,
                identification: {
                    type: data.payer.identificationType || 'DNI',
                    number: data.payer.identificationNumber || '00000000'
                }
            },
            external_reference: data.orderId,
            statement_descriptor: 'HOGARVERDE',
            metadata: {
                order_id: data.orderId,
                items: data.items.map(item => ({
                    id: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price
                }))
            }
        };
        
        // Solo agregar issuer_id si existe y no está vacío
        if (data.issuerId && data.issuerId !== '') {
            paymentData.issuer_id = data.issuerId;
        }
        
        console.log('Creating payment with data:', JSON.stringify(paymentData, null, 2));
        
        // Crear pago en Mercado Pago
        const payment = await paymentClient.create({ body: paymentData });
        
        console.log('Payment created successfully');
        console.log('- ID:', payment.id);
        console.log('- Status:', payment.status);
        console.log('- Status Detail:', payment.status_detail);
        
        // Retornar resultado
        const responseData = { 
            id: payment.id,
            status: payment.status,
            statusDetail: payment.status_detail,
            paymentMethodId: payment.payment_method_id,
            transactionAmount: payment.transaction_amount
        };
        
        console.log('Returning to client:', JSON.stringify(responseData, null, 2));
        
        return responseData;
        
    } catch (error) {
        console.error('Error creating payment:', error);
        throw new functions.https.HttpsError(
            'internal', 
            `Error al procesar el pago: ${error.message}`
        );
    }
});

/**
 * Webhook para recibir notificaciones de Mercado Pago
 * Se ejecuta automáticamente cuando cambia el estado de un pago
 */
exports.mercadopagoWebhook = functions.https.onRequest(async (req, res) => {
    try {
        console.log('Webhook received:', JSON.stringify(req.body));
        
        const { type, data } = req.body;
        
        // Mercado Pago envía notificaciones de diferentes tipos
        if (type === 'payment') {
            const paymentId = data.id;
            
            console.log('Processing payment notification:', paymentId);
            
            // Obtener detalles del pago desde Mercado Pago
            const payment = await paymentClient.get({ id: paymentId });
            
            console.log('Payment status:', payment.status);
            console.log('External reference:', payment.external_reference);
            
            // Buscar la orden en Firestore usando el external_reference
            const ordersRef = admin.firestore().collection('orders');
            const ordersQuery = ordersRef.where('orderId', '==', payment.external_reference);
            const ordersSnapshot = await ordersQuery.get();
            
            if (ordersSnapshot.empty) {
                console.error('Order not found:', payment.external_reference);
                res.sendStatus(404);
                return;
            }
            
            const orderDoc = ordersSnapshot.docs[0];
            const orderRef = orderDoc.ref;
            const order = orderDoc.data();
            
            // Actualizar estado de la orden
            await orderRef.update({
                paymentStatus: payment.status,
                paymentId: paymentId,
                paymentMethod: payment.payment_method_id || 'unknown',
                transactionAmount: payment.transaction_amount || 0,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            
            console.log('Order updated with payment status:', payment.status);
            
            // Si el pago fue aprobado, reducir stock de productos
            if (payment.status === 'approved') {
                console.log('Payment approved, reducing stock...');
                
                const batch = admin.firestore().batch();
                
                for (const item of order.items) {
                    if (item.firebaseId) {
                        const productRef = admin.firestore()
                            .collection('products')
                            .doc(item.firebaseId);
                        
                        batch.update(productRef, {
                            stock: admin.firestore.FieldValue.increment(-item.quantity)
                        });
                        
                        console.log(`Reducing stock for ${item.name}: -${item.quantity}`);
                    }
                }
                
                await batch.commit();
                console.log('Stock reduced successfully');
            }
        }
        
        res.sendStatus(200);
        
    } catch (error) {
        console.error('Webhook error:', error);
        res.sendStatus(500);
    }
});
