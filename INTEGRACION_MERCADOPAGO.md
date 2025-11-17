# Integración de Mercado Pago en HogarVerde

## 📋 Requisitos previos

1. **Crear cuenta de desarrollador**: https://www.mercadopago.com.ar/developers
2. **Crear una aplicación** en el panel de Mercado Pago
3. **Obtener credenciales**:
   - Public Key: `TEST-xxxxx` o `APP_USR-xxxxx`
   - Access Token: `TEST-xxxxx` o `APP_USR-xxxxx`

---

## 🔧 Opción 1: Checkout Pro (Recomendado - Más simple)

Mercado Pago maneja todo el flujo de pago en su propia página.

### **1. Agregar SDK en checkout.html**

```html
<!-- Agregar antes de </body> -->
<script src="https://sdk.mercadopago.com/js/v2"></script>
```

### **2. Modificar el formulario de checkout**

Reemplaza el botón "Confirmar Pedido" por:

```html
<button type="button" class="submit-order-btn" id="checkout-btn">
    Pagar con Mercado Pago
</button>
<div id="mercadopago-button"></div>
```

### **3. Código JavaScript para inicializar**

```javascript
// Agregar en checkout.html después de cargar script.js
const mp = new MercadoPago('TU_PUBLIC_KEY_AQUI', {
    locale: 'es-AR'
});

document.getElementById('checkout-btn').addEventListener('click', async () => {
    // Validar formulario
    const form = document.getElementById('checkoutForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    // Preparar datos del pedido
    const orderData = {
        items: cart.map(item => ({
            title: item.name,
            description: item.description,
            picture_url: item.image,
            category_id: item.category,
            quantity: item.quantity,
            unit_price: item.price
        })),
        payer: {
            name: document.getElementById('fullName').value,
            email: document.getElementById('email').value,
            phone: {
                area_code: '',
                number: document.getElementById('phone').value
            },
            address: {
                street_name: document.getElementById('address').value,
                zip_code: document.getElementById('zipCode').value,
                city_name: document.getElementById('city').value
            }
        },
        back_urls: {
            success: window.location.origin + '/success.html',
            failure: window.location.origin + '/checkout.html',
            pending: window.location.origin + '/pending.html'
        },
        auto_return: 'approved',
        notification_url: 'TU_SERVIDOR/webhooks/mercadopago', // Requiere servidor
        statement_descriptor: 'HogarVerde'
    };
    
    try {
        // Llamar a tu servidor para crear la preferencia
        const response = await fetch('/api/create-preference', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });
        
        const preference = await response.json();
        
        // Redirigir a Mercado Pago
        mp.checkout({
            preference: {
                id: preference.id
            }
        });
        
    } catch (error) {
        console.error('Error al crear preferencia:', error);
        alert('Error al procesar el pago. Por favor intenta nuevamente.');
    }
});
```

---

## 🔧 Opción 2: Checkout API (Personalizado)

Procesar pagos directamente en tu página sin redirección.

### **1. Agregar SDK en checkout.html**

```html
<script src="https://sdk.mercadopago.com/js/v2"></script>
```

### **2. Crear formulario de tarjeta**

```html
<div class="mp-payment-form">
    <div class="form-group">
        <label>Número de tarjeta</label>
        <div id="form-checkout__cardNumber"></div>
    </div>
    
    <div class="form-row">
        <div class="form-group">
            <label>Vencimiento</label>
            <div id="form-checkout__expirationDate"></div>
        </div>
        <div class="form-group">
            <label>CVV</label>
            <div id="form-checkout__securityCode"></div>
        </div>
    </div>
    
    <div class="form-group">
        <label>Titular de la tarjeta</label>
        <input type="text" id="form-checkout__cardholderName" required>
    </div>
    
    <div class="form-group">
        <label>Email</label>
        <input type="email" id="form-checkout__email" required>
    </div>
    
    <div class="form-group">
        <label>Tipo de documento</label>
        <select id="form-checkout__identificationType">
            <option value="DNI">DNI</option>
            <option value="CUIL">CUIL</option>
            <option value="CUIT">CUIT</option>
        </select>
    </div>
    
    <div class="form-group">
        <label>Número de documento</label>
        <input type="text" id="form-checkout__identificationNumber" required>
    </div>
    
    <input type="hidden" id="form-checkout__issuer">
    <input type="hidden" id="form-checkout__installments" value="1">
    
    <button type="submit" id="form-checkout__submit">Pagar</button>
</div>
```

### **3. JavaScript para Checkout API**

```javascript
const mp = new MercadoPago('TU_PUBLIC_KEY_AQUI', {
    locale: 'es-AR'
});

// Crear campos de tarjeta
const cardNumber = mp.fields.create('cardNumber', {
    placeholder: '0000 0000 0000 0000'
}).mount('form-checkout__cardNumber');

const expirationDate = mp.fields.create('expirationDate', {
    placeholder: 'MM/AA'
}).mount('form-checkout__expirationDate');

const securityCode = mp.fields.create('securityCode', {
    placeholder: '123'
}).mount('form-checkout__securityCode');

// Obtener tipos de documento
(async function getIdentificationTypes() {
    try {
        const response = await mp.getIdentificationTypes();
        const select = document.getElementById('form-checkout__identificationType');
        response.forEach(type => {
            const option = document.createElement('option');
            option.value = type.id;
            option.text = type.name;
            select.appendChild(option);
        });
    } catch (e) {
        console.error('Error getting identification types: ', e);
    }
})();

// Obtener emisor y cuotas
cardNumber.on('binChange', async (data) => {
    try {
        const { results } = await mp.getIssuers({ bin: data.bin });
        document.getElementById('form-checkout__issuer').value = results[0].id;
    } catch (e) {
        console.error('Error getting issuer: ', e);
    }
});

// Procesar pago
document.getElementById('form-checkout__submit').addEventListener('click', async (e) => {
    e.preventDefault();
    
    try {
        const token = await mp.fields.createCardToken({
            cardholderName: document.getElementById('form-checkout__cardholderName').value,
            identificationType: document.getElementById('form-checkout__identificationType').value,
            identificationNumber: document.getElementById('form-checkout__identificationNumber').value
        });
        
        // Enviar token a tu servidor
        const response = await fetch('/api/process-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                token: token.id,
                transaction_amount: calculateTotal(),
                description: 'Compra en HogarVerde',
                installments: 1,
                payment_method_id: token.payment_method_id,
                issuer_id: document.getElementById('form-checkout__issuer').value,
                payer: {
                    email: document.getElementById('form-checkout__email').value,
                    identification: {
                        type: document.getElementById('form-checkout__identificationType').value,
                        number: document.getElementById('form-checkout__identificationNumber').value
                    }
                }
            })
        });
        
        const result = await response.json();
        
        if (result.status === 'approved') {
            // Guardar orden en Firebase
            await saveOrderToFirebase(result);
            alert('¡Pago exitoso!');
            window.location.href = 'success.html';
        } else {
            alert('El pago fue rechazado. Por favor intenta nuevamente.');
        }
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al procesar el pago');
    }
});

function calculateTotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) + 5000;
}
```

---

## 🖥️ Código del Servidor (Node.js + Express)

Necesitas un servidor para procesar pagos de forma segura.

### **Instalar dependencias**

```bash
npm install express mercadopago dotenv cors
```

### **server.js**

```javascript
const express = require('express');
const mercadopago = require('mercadopago');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Configurar Mercado Pago
mercadopago.configure({
    access_token: process.env.MP_ACCESS_TOKEN
});

// Crear preferencia de pago (Checkout Pro)
app.post('/api/create-preference', async (req, res) => {
    try {
        const preference = {
            items: req.body.items,
            payer: req.body.payer,
            back_urls: req.body.back_urls,
            auto_return: req.body.auto_return,
            notification_url: req.body.notification_url,
            statement_descriptor: req.body.statement_descriptor
        };
        
        const response = await mercadopago.preferences.create(preference);
        res.json({ id: response.body.id });
        
    } catch (error) {
        console.error('Error creating preference:', error);
        res.status(500).json({ error: 'Error creating payment preference' });
    }
});

// Procesar pago (Checkout API)
app.post('/api/process-payment', async (req, res) => {
    try {
        const payment_data = {
            transaction_amount: req.body.transaction_amount,
            token: req.body.token,
            description: req.body.description,
            installments: req.body.installments,
            payment_method_id: req.body.payment_method_id,
            issuer_id: req.body.issuer_id,
            payer: req.body.payer
        };
        
        const response = await mercadopago.payment.create(payment_data);
        res.json(response.body);
        
    } catch (error) {
        console.error('Error processing payment:', error);
        res.status(500).json({ error: 'Error processing payment' });
    }
});

// Webhook para notificaciones
app.post('/webhooks/mercadopago', async (req, res) => {
    try {
        const { type, data } = req.body;
        
        if (type === 'payment') {
            const payment = await mercadopago.payment.get(data.id);
            
            // Actualizar orden en Firebase según estado del pago
            console.log('Payment status:', payment.body.status);
            
            // TODO: Actualizar Firebase con el estado del pago
        }
        
        res.sendStatus(200);
        
    } catch (error) {
        console.error('Webhook error:', error);
        res.sendStatus(500);
    }
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
```

### **.env**

```
MP_ACCESS_TOKEN=TU_ACCESS_TOKEN_AQUI
MP_PUBLIC_KEY=TU_PUBLIC_KEY_AQUI
```

---

## 📄 Páginas de resultado

### **success.html**

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Pago Exitoso - HogarVerde</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="success-container">
        <h1>✅ ¡Pago Exitoso!</h1>
        <p>Tu pedido ha sido confirmado.</p>
        <p>Recibirás un email con los detalles de tu compra.</p>
        <a href="index.html" class="btn">Volver al inicio</a>
    </div>
</body>
</html>
```

---

## 🧪 Modo Test

Usa estas tarjetas de prueba:

### **Tarjetas aprobadas**
- **Mastercard**: 5031 7557 3453 0604
- **Visa**: 4509 9535 6623 3704
- CVV: 123
- Fecha: 11/25
- Nombre: APRO (para aprobar)

### **Tarjetas rechazadas**
- Nombre: OCHO (sin fondos)
- Nombre: CONT (tarjeta robada)

---

## 📊 Alternativa sin servidor: Firebase Functions

Si no quieres mantener un servidor, usa Firebase Functions:

```javascript
// functions/index.js
const functions = require('firebase-functions');
const mercadopago = require('mercadopago');

mercadopago.configure({
    access_token: functions.config().mercadopago.access_token
});

exports.createPreference = functions.https.onCall(async (data, context) => {
    const preference = await mercadopago.preferences.create(data);
    return { id: preference.body.id };
});
```

---

## 🎯 Recomendación

Para empezar rápido: **Usa Checkout Pro** (Opción 1)
- Más simple
- Mercado Pago maneja la seguridad
- Menos código
- Soporte para todos los medios de pago

Para mayor control: **Usa Checkout API** (Opción 2)
- Pagos en tu página
- Personalización total
- Requiere más código

---

¿Quieres que implemente alguna de estas opciones en tu código?
