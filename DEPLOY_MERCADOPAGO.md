# Pasos para Desplegar Mercado Pago

## 🚀 Configuración Completa

### 1. Obtener el Access Token del Cliente

**IMPORTANTE:** Necesitas el **Access Token** que corresponde a la Public Key que me diste.

1. Tu cliente debe ir a: https://www.mercadopago.com.ar/developers
2. Seleccionar su aplicación
3. Ir a "Credenciales"
4. Copiar el **Access Token de prueba** (TEST-xxxxx)

### 2. Instalar Firebase CLI y dependencias

```powershell
# Instalar Firebase CLI globalmente
npm install -g firebase-tools

# Navegar a la carpeta del proyecto
cd "c:\Users\pablo\OneDrive\Escritorio\Goky.net\HogarVerde"

# Iniciar sesión en Firebase
firebase login

# Inicializar Functions (si no está inicializado)
firebase init functions

# Instalar dependencias en la carpeta functions
cd functions
npm install
cd ..
```

### 3. Configurar el Access Token en Firebase

```powershell
# Configurar el Access Token (reemplazar con el real)
firebase functions:config:set mercadopago.access_token="TEST-XXXXXXXX-XXXXXX-XXXXXX-XXXXXXXX"

# Verificar que se guardó correctamente
firebase functions:config:get
```

### 4. Actualizar el Access Token en functions/index.js

Abre `functions/index.js` y reemplaza esta línea:

```javascript
mercadopago.configure({
    access_token: 'APP_USR-XXXXXXXX-XXXXXX-XXXXXX-XXXXXXXX-XXXXXXXX' 
});
```

Por:

```javascript
mercadopago.configure({
    access_token: functions.config().mercadopago.access_token
});
```

### 5. Desplegar las Functions

```powershell
# Desplegar solo las functions
firebase deploy --only functions

# O desplegar todo (hosting + functions)
firebase deploy
```

### 6. Configurar la URL del Webhook en Mercado Pago

Después del deploy, Firebase te dará una URL como:
```
https://us-central1-hogarverde-489e9.cloudfunctions.net/mercadopagoWebhook
```

1. Ir al panel de Mercado Pago: https://www.mercadopago.com.ar/developers
2. Seleccionar tu aplicación
3. Ir a "Webhooks"
4. Agregar esta URL como webhook
5. Seleccionar eventos: "Pagos"

## 🧪 Probar con Tarjetas de Prueba

Una vez desplegado, puedes probar con estas tarjetas:

### Tarjetas de Prueba para Argentina:

**Visa (Aprobada):**
- Número: 4509 9535 6623 3704
- CVV: 123
- Vencimiento: 11/25

**Mastercard (Aprobada):**
- Número: 5031 7557 3453 0604
- CVV: 123
- Vencimiento: 11/25

**Visa (Rechazada por fondos insuficientes):**
- Número: 4509 9535 6623 3704
- CVV: 123
- Vencimiento: 11/25

**Cualquier nombre y DNI de prueba funcionan**

## 📋 Checklist Final

- [ ] Access Token obtenido del cliente
- [ ] Firebase CLI instalado
- [ ] Dependencias instaladas en `/functions`
- [ ] Access Token configurado con `firebase functions:config:set`
- [ ] Access Token actualizado en `functions/index.js`
- [ ] Functions desplegadas con `firebase deploy --only functions`
- [ ] URL de webhook configurada en Mercado Pago
- [ ] Public Key configurada en `checkout.html` (ya está: APP_USR-6c98f692-1f6f-461a-8f87-e41588f81cf7)

## 🔍 Verificar que Todo Funciona

1. **Probar el flujo completo:**
   - Agregar productos al carrito
   - Ir a checkout
   - Llenar el formulario
   - Click en "Continuar al Pago"
   - Serás redirigido a Mercado Pago
   - Usar tarjeta de prueba
   - Deberías regresar a `success.html`

2. **Verificar logs en Firebase:**
```powershell
firebase functions:log
```

3. **Verificar en Firebase Console:**
   - Ir a Firestore → colección `orders`
   - Verificar que se creó la orden con `paymentStatus: 'pending'`
   - Después del pago exitoso, debería cambiar a `paymentStatus: 'approved'`
   - El stock de los productos debería reducirse

## ❗ Solución de Problemas Comunes

### Error: "Access Token inválido"
- Verificar que usaste el Access Token correcto (no el Public Key)
- Debe empezar con `TEST-` para pruebas o `APP_USR-` para producción

### Error: "Function not found"
- Verificar que desplegaste con `firebase deploy --only functions`
- Esperar 1-2 minutos después del deploy

### El webhook no se ejecuta
- Verificar que configuraste la URL correcta en Mercado Pago
- La URL debe ser accesible públicamente (no localhost)

### El pago se aprueba pero no reduce stock
- Verificar logs: `firebase functions:log`
- Asegurarte que el webhook está configurado
- Verificar que los productos tienen campo `firebaseId`

## 🎯 Para Pasar a Producción

Cuando esté todo funcionando con credenciales TEST:

1. Tu cliente debe activar su cuenta de Mercado Pago para producción
2. Obtener credenciales de PRODUCCIÓN (APP_USR-xxxxx)
3. Actualizar la configuración:
```powershell
firebase functions:config:set mercadopago.access_token="APP_USR-xxxxx-PRODUCCION"
```
4. Actualizar Public Key en `checkout.html`
5. Redesplegar: `firebase deploy --only functions`
6. Actualizar webhook en Mercado Pago con la misma URL

---

## 📞 Siguiente Paso Inmediato

**Necesito que tu cliente te proporcione el Access Token que corresponde a la Public Key:**
`APP_USR-6c98f692-1f6f-461a-8f87-e41588f81cf7`

Una vez lo tengas, ejecuta:
```powershell
firebase functions:config:set mercadopago.access_token="EL_ACCESS_TOKEN_REAL"
firebase deploy --only functions
```

¡Y estará listo para probar! 🚀
