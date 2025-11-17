# Configuración de Mercado Pago para Cliente

## 📋 Pasos que debe hacer tu cliente:

### 1. Crear cuenta de vendedor
1. Ir a https://www.mercadopago.com.ar/
2. Crear cuenta o usar existente
3. Ir a https://www.mercadopago.com.ar/developers
4. Crear una aplicación nueva

### 2. Obtener credenciales

En el panel de desarrolladores verá:

**Modo TEST (para pruebas):**
- Public Key: `TEST-xxxxx-xxxxx-xxxxx-xxxxx`
- Access Token: `TEST-xxxxx-xxxxx-xxxxx-xxxxx`

**Modo PRODUCCIÓN (real):**
- Public Key: `APP_USR-xxxxx-xxxxx-xxxxx-xxxxx`
- Access Token: `APP_USR-xxxxx-xxxxx-xxxxx-xxxxx`

### 3. Compartir credenciales contigo

El cliente te debe dar:
- ✅ Public Key (se usa en el frontend - checkout.html)
- ✅ Access Token (se usa en el backend/servidor - NUNCA en frontend)

---

## 🔒 Seguridad: Dónde guardar las credenciales

### ❌ NO HACER:
```javascript
// NUNCA pongas el Access Token en el HTML/JavaScript
const accessToken = 'TEST-xxxxx'; // ❌ INSEGURO
```

### ✅ HACER:

#### **Para Firebase (Recomendado):**

1. **Guardar Access Token en Firebase Functions Config:**

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Configurar credenciales
firebase functions:config:set mercadopago.access_token="ACCESS_TOKEN_DEL_CLIENTE"
firebase functions:config:set mercadopago.public_key="PUBLIC_KEY_DEL_CLIENTE"
```

2. **Crear Firebase Function:**

```javascript
// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const mercadopago = require('mercadopago');

admin.initializeApp();

// Configurar Mercado Pago con credenciales del cliente
mercadopago.configure({
    access_token: functions.config().mercadopago.access_token
});

// Función para crear preferencia de pago
exports.createPaymentPreference = functions.https.onCall(async (data, context) => {
    try {
        const preference = {
            items: data.items.map(item => ({
                title: item.name,
                description: item.description,
                picture_url: item.image,
                category_id: item.category,
                quantity: item.quantity,
                unit_price: item.price
            })),
            payer: {
                name: data.payer.name,
                email: data.payer.email,
                phone: {
                    area_code: '',
                    number: data.payer.phone
                },
                address: {
                    street_name: data.payer.address,
                    zip_code: data.payer.zipCode,
                    city_name: data.payer.city
                }
            },
            back_urls: {
                success: `${data.baseUrl}/success.html`,
                failure: `${data.baseUrl}/checkout.html`,
                pending: `${data.baseUrl}/pending.html`
            },
            auto_return: 'approved',
            statement_descriptor: 'HOGARVERDE',
            external_reference: data.orderId // Para trackear en Firebase
        };
        
        const response = await mercadopago.preferences.create(preference);
        
        return { 
            preferenceId: response.body.id,
            initPoint: response.body.init_point // URL de pago
        };
        
    } catch (error) {
        console.error('Error creating preference:', error);
        throw new functions.https.HttpsError('internal', 'Error al crear preferencia de pago');
    }
});

// Webhook para recibir notificaciones de pago
exports.mercadopagoWebhook = functions.https.onRequest(async (req, res) => {
    try {
        const { type, data } = req.body;
        
        if (type === 'payment') {
            const paymentId = data.id;
            
            // Obtener detalles del pago
            const payment = await mercadopago.payment.get(paymentId);
            const paymentData = payment.body;
            
            // Actualizar orden en Firestore
            const orderRef = admin.firestore()
                .collection('orders')
                .doc(paymentData.external_reference);
            
            await orderRef.update({
                paymentStatus: paymentData.status,
                paymentId: paymentId,
                paymentMethod: paymentData.payment_method_id,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            
            // Si el pago fue aprobado, reducir stock
            if (paymentData.status === 'approved') {
                const orderDoc = await orderRef.get();
                const order = orderDoc.data();
                
                // Reducir stock de cada producto
                for (const item of order.items) {
                    if (item.firebaseId) {
                        const productRef = admin.firestore()
                            .collection('products')
                            .doc(item.firebaseId);
                        
                        await productRef.update({
                            stock: admin.firestore.FieldValue.increment(-item.quantity)
                        });
                    }
                }
            }
        }
        
        res.sendStatus(200);
        
    } catch (error) {
        console.error('Webhook error:', error);
        res.sendStatus(500);
    }
});
```

3. **Desplegar Functions:**

```bash
firebase deploy --only functions
```

---

## 🌐 Código Frontend (checkout.html)

El Public Key SÍ va en el frontend:

```javascript
// En checkout.html, agregar después de cargar script.js

// Public Key del cliente (seguro ponerlo aquí)
const MP_PUBLIC_KEY = 'TEST-xxxxx-xxxxx'; // O usar variable de Firebase Hosting config

const mp = new MercadoPago(MP_PUBLIC_KEY, {
    locale: 'es-AR'
});

// Modificar el submit del formulario
document.getElementById('checkoutForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Crear orden temporal en Firebase
    const orderId = Date.now().toString();
    const orderData = {
        orderId: orderId,
        items: cart,
        payer: {
            name: document.getElementById('fullName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value,
            city: document.getElementById('city').value,
            zipCode: document.getElementById('zipCode').value
        },
        baseUrl: window.location.origin,
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    
    // Guardar orden en Firebase
    await window.firebaseAddDoc(
        window.firebaseCollection(window.firebaseDB, 'orders'),
        orderData
    );
    
    try {
        // Llamar a Firebase Function para crear preferencia
        const createPayment = firebase.functions().httpsCallable('createPaymentPreference');
        const result = await createPayment(orderData);
        
        // Redirigir a Mercado Pago
        window.location.href = result.data.initPoint;
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al procesar el pago. Por favor intenta nuevamente.');
    }
});
```

---

## 💰 Configuración de comisiones (Opcional)

Si quieres cobrar una comisión por cada venta:

```javascript
// En Firebase Function
const preference = {
    // ... otros campos
    marketplace_fee: Math.round(totalAmount * 0.05), // 5% de comisión
    // El dinero irá a la cuenta del cliente menos tu comisión
};
```

---

## 📱 URLs de notificación

Necesitas configurar una URL pública para el webhook:

```javascript
notification_url: 'https://us-central1-TU-PROJECT-ID.cloudfunctions.net/mercadopagoWebhook'
```

---

## 🎯 Resumen para implementar:

### Tu cliente necesita hacer:
1. ✅ Crear cuenta en Mercado Pago
2. ✅ Crear aplicación en panel de desarrolladores
3. ✅ Compartir Public Key y Access Token contigo

### Tú necesitas hacer:
1. ✅ Configurar Firebase Functions
2. ✅ Guardar Access Token en Firebase config (seguro)
3. ✅ Usar Public Key en el frontend
4. ✅ Crear función para generar preferencias de pago
5. ✅ Implementar webhook para notificaciones
6. ✅ Actualizar órdenes según estado de pago

---

## 🧪 Testing

**Para pruebas usa credenciales TEST:**
- No se cobra dinero real
- Usa tarjetas de prueba de Mercado Pago

**Para producción usa credenciales APP_USR:**
- Se cobra dinero real a tarjetas reales
- Va directo a la cuenta del cliente

---

¿Quieres que implemente el código completo con Firebase Functions para tu cliente?
