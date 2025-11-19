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
 * Función para crear preferencia de pago en Mercado Pago
 * Se llama desde el frontend cuando el usuario confirma el pedido
 */
exports.createPaymentPreference = functions.https.onCall(async (data, context) => {
    try {
        console.log('Creating payment preference for order:', data.orderId);
        
        // Validar datos recibidos
        if (!data.items || data.items.length === 0) {
            throw new functions.https.HttpsError('invalid-argument', 'No hay items en el carrito');
        }
        
        if (!data.payer || !data.payer.email) {
            throw new functions.https.HttpsError('invalid-argument', 'Información del comprador incompleta');
        }
        
        // Calcular total
        const total = data.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Crear preferencia de pago
        const preference = {
            items: data.items.map(item => ({
                title: item.name || 'Producto',
                description: item.description || '',
                picture_url: item.image || '',
                category_id: item.category || 'others',
                quantity: parseInt(item.quantity),
                unit_price: parseFloat(item.price)
            })),
            payer: {
                name: data.payer.name || '',
                email: data.payer.email,
                phone: {
                    area_code: '',
                    number: data.payer.phone || ''
                },
                address: {
                    street_name: data.payer.address || '',
                    zip_code: data.payer.zipCode || '',
                    city_name: data.payer.city || ''
                }
            },
            back_urls: {
                success: `${data.baseUrl}/success.html`,
                failure: `${data.baseUrl}/checkout.html`,
                pending: `${data.baseUrl}/pending.html`
            },
            auto_return: 'approved',
            statement_descriptor: 'HOGARVERDE',
            external_reference: data.orderId,
            notification_url: `${data.baseUrl}/mercadopagoWebhook` // URL para webhook
        };
        
        console.log('Creating preference with data:', JSON.stringify(preference, null, 2));
        
        // Crear preferencia en Mercado Pago
        const response = await preferenceClient.create({ body: preference });
        
        console.log('Preference created successfully');
        console.log('- ID:', response.id);
        console.log('- init_point:', response.init_point);
        console.log('- sandbox_init_point:', response.sandbox_init_point);
        
        // Retornar con las claves en camelCase que espera el frontend
        const responseData = { 
            preferenceId: response.id,
            initPoint: response.init_point,
            sandboxInitPoint: response.sandbox_init_point
        };
        
        console.log('Returning to client:', JSON.stringify(responseData, null, 2));
        
        return responseData;
        
    } catch (error) {
        console.error('Error creating payment preference:', error);
        throw new functions.https.HttpsError(
            'internal', 
            `Error al crear preferencia de pago: ${error.message}`
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
