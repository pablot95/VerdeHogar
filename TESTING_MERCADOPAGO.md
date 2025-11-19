# 🧪 Testing de Integración MercadoPago

## ✅ Correcciones Implementadas

### 1. **Problema de Clave del Carrito** - SOLUCIONADO
- ❌ **Antes**: `localStorage.removeItem('cart')`
- ✅ **Ahora**: `localStorage.removeItem('hogarverdeCart')` + `cart = []`
- **Ubicaciones corregidas**:
  - Checkout de MercadoPago (línea 388)
  - Checkout de WhatsApp (línea 505)

### 2. **Logs Mejorados en Checkout** - IMPLEMENTADO
Ahora la consola muestra:
```javascript
- result completo (JSON stringificado)
- result.data
- result.data.initPoint
- result.data.sandboxInitPoint
- result.data.preferenceId
- Claves disponibles si hay error
```

### 3. **Logs Mejorados en Backend** - IMPLEMENTADO
La función `createPaymentPreference` ahora registra:
```javascript
- ID de preferencia creada
- init_point recibido de MercadoPago
- sandbox_init_point recibido de MercadoPago
- Objeto completo que se retorna al cliente
```

### 4. **Región de Functions** - VERIFICADO
- ✅ Las funciones están en `us-central1` (región por defecto)
- ✅ El frontend usa la región correcta automáticamente
- ✅ No se necesita especificar región en `firebase-init.js`

---

## 🔍 Cómo Probar

### Paso 1: Abrir la consola del navegador
1. Ve a https://hogarverde-489e9.web.app
2. Presiona `F12` para abrir DevTools
3. Ve a la pestaña **Console**

### Paso 2: Agregar productos al carrito
1. Navega a "Productos"
2. Agrega al menos un producto al carrito
3. Ve al checkout

### Paso 3: Completar el formulario
```
Nombre: Test User
Email: test@example.com
Teléfono: 1234567890
Dirección: Calle Falsa 123
Ciudad: Buenos Aires
Código Postal: 1000
Zona de Envío: Capital Federal
```

### Paso 4: Seleccionar método de pago
- ✅ **Opción 1**: MercadoPago (para probar la integración)
- ✅ **Opción 2**: WhatsApp (siempre funciona como alternativa)

### Paso 5: Ver los logs en consola

#### Si funciona correctamente (MercadoPago):
```
1. ✅ Firebase verificado
2. ✅ Orden ID creado: ORDER-1234567890
3. ✅ Datos de orden preparados
4. ✅ Guardando orden en Firebase...
5. ✅ Orden guardada con ID: abc123
6. ✅ Llamando a createPaymentPreference...
7. ✅ Función obtenida, ejecutando...
8. ✅ Resultado de Mercado Pago:
   - result.data.initPoint: https://www.mercadopago.com/...
   - result.data.sandboxInitPoint: https://sandbox.mercadopago.com/...
   - result.data.preferenceId: 123456789-abc...
9. ✅ Redirigiendo a Mercado Pago...
   URL: https://sandbox.mercadopago.com/...
```

Luego deberías ser redirigido a la página de pago de MercadoPago.

#### Si hay un error:

##### Error 1: `functions/not-found`
```
❌ La función de pago no está disponible en el servidor.
```
**Causa**: La función no está desplegada o tiene nombre incorrecto
**Solución**: Ya desplegada ✅

##### Error 2: `No se recibió URL de pago`
```
❌ No se recibió URL de pago de Mercado Pago
Claves disponibles en result.data: ["preferenceId", "init_point", "sandbox_init_point"]
```
**Causa**: La función devuelve snake_case en lugar de camelCase
**Solución**: Ya corregida en functions/index.js ✅

##### Error 3: `Invalid credentials`
```
Error al crear preferencia de pago: Invalid credentials
```
**Causa**: Access Token no configurado o incorrecto
**Solución**: Verificar con `firebase functions:config:get`

---

## 🔧 Verificar Configuración del Access Token

```powershell
firebase functions:config:get
```

Debería mostrar:
```json
{
  "mercadopago": {
    "access_token": "APP_USR-5713293345399410-111717-..."
  }
}
```

Si está vacío o incorrecto:
```powershell
firebase functions:config:set mercadopago.access_token="TU_ACCESS_TOKEN"
firebase deploy --only functions
```

---

## 📊 Verificar en Firebase Console

### Ver logs de la función en tiempo real:
1. Ve a: https://console.firebase.google.com/project/hogarverde-489e9/functions
2. Click en `createPaymentPreference`
3. Pestaña **Logs**
4. Deberías ver:
   ```
   Creating payment preference for order: ORDER-123...
   Creating preference with data: {...}
   Preference created successfully
   - ID: 123456789-abc...
   - init_point: https://www.mercadopago.com/...
   - sandbox_init_point: https://sandbox.mercadopago.com/...
   Returning to client: {
     "preferenceId": "123456789-abc...",
     "initPoint": "https://www.mercadopago.com/...",
     "sandboxInitPoint": "https://sandbox.mercadopago.com/..."
   }
   ```

### Ver órdenes en Firestore:
1. Ve a: https://console.firebase.google.com/project/hogarverde-489e9/firestore
2. Colección: `orders`
3. Deberías ver las órdenes creadas con:
   - `orderId`: ORDER-...
   - `status`: pending
   - `paymentStatus`: pending
   - `items`: array de productos
   - `payer`: datos del comprador

---

## 🎯 Casos de Prueba

### Caso 1: Flujo Completo MercadoPago ✅
1. Agregar productos
2. Ir al checkout
3. Completar formulario
4. Seleccionar "MercadoPago"
5. Click "Continuar al Pago"
6. **Esperado**: Redirección a MercadoPago
7. **Esperado**: Carrito vacío después de redirección

### Caso 2: Flujo WhatsApp ✅
1. Agregar productos
2. Ir al checkout
3. Completar formulario
4. Seleccionar "WhatsApp"
5. Click "Continuar al Pago"
6. **Esperado**: Abrir WhatsApp con mensaje pre-llenado
7. **Esperado**: Alerta de confirmación
8. **Esperado**: Redirección a index.html
9. **Esperado**: Carrito vacío

### Caso 3: Carrito Vacío
1. Ir directamente a /checkout.html sin productos
2. **Esperado**: Alerta "Tu carrito está vacío"
3. **Esperado**: Redirección a productos.html

### Caso 4: Error de Validación
1. Ir al checkout con productos
2. NO completar el campo "Zona de Envío"
3. Click "Continuar al Pago"
4. **Esperado**: Error "Por favor selecciona una zona de envío"

---

## 🐛 Debugging Avanzado

### Ver requests de red:
1. DevTools > Pestaña **Network**
2. Filtrar por: `createPaymentPreference`
3. Ver el request y response

### Ver el payload enviado:
```javascript
// En consola del navegador antes de hacer checkout:
console.log = new Proxy(console.log, {
  apply: function(target, thisArg, args) {
    target.apply(thisArg, args);
    if (args[0] && args[0].includes('preparados')) {
      window.lastOrderData = args[1];
    }
  }
});

// Después del checkout, revisar:
console.log(window.lastOrderData);
```

### Simular error en la función:
En `functions/index.js` temporalmente:
```javascript
exports.createPaymentPreference = functions.https.onCall(async (data, context) => {
    throw new functions.https.HttpsError('internal', 'Error de prueba');
});
```

---

## ✨ Próximos Pasos

1. **Probar con tarjetas de prueba de MercadoPago**:
   - https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/additional-content/test-cards

2. **Configurar Webhook para notificaciones de pago**:
   - La URL ya está configurada: `https://us-central1-hogarverde-489e9.cloudfunctions.net/mercadopagoWebhook`
   - Agregar en el panel de MercadoPago: https://www.mercadopago.com.ar/developers/panel/app

3. **Migrar de functions.config() a .env** (antes de marzo 2026):
   - Ver: https://firebase.google.com/docs/functions/config-env#migrate-to-dotenv

---

## 📞 Soporte

Si después de probar ves errores:
1. Copia los logs de la consola
2. Copia los logs de Firebase Functions Console
3. Copia el mensaje de error exacto
4. Comparte toda esa información para debug específico

**¡Todo debería funcionar ahora! 🎉**
