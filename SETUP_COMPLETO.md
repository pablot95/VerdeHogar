# 🚀 Guía de Despliegue Rápido - Mercado Pago

## ✅ Ya Configurado:
- Public Key: `APP_USR-6c98f692-1f6f-461a-8f87-e41588f81cf7` ✓
- Access Token: `APP_USR-5713293345399410-111717-...` ✓ (guardado de forma segura)

---

## 📦 Paso 1: Instalar Firebase CLI

```powershell
npm install -g firebase-tools
```

## 🔐 Paso 2: Iniciar Sesión en Firebase

```powershell
firebase login
```

Esto abrirá tu navegador para autenticarte con Google.

## 📂 Paso 3: Ir a la Carpeta del Proyecto

```powershell
cd "c:\Users\pablo\OneDrive\Escritorio\Goky.net\HogarVerde"
```

## 🎯 Paso 4: Inicializar Firebase Functions (si no está inicializado)

```powershell
firebase init functions
```

Cuando te pregunte:
- **Select a Firebase project**: Elige `hogarverde-489e9`
- **What language would you like to use?**: Elige `JavaScript`
- **Do you want to use ESLint?**: Elige `No`
- **Do you want to install dependencies now?**: Elige `Yes`

## 📦 Paso 5: Instalar Dependencias

```powershell
cd functions
npm install
cd ..
```

## 🔒 Paso 6: Configurar Access Token de Forma Segura

```powershell
firebase functions:config:set mercadopago.access_token="APP_USR-5713293345399410-111717-59c57f2da4de4c64fe97f1523750aa8f-2998483119"
```

## ✅ Paso 7: Verificar Configuración

```powershell
firebase functions:config:get
```

Deberías ver:
```json
{
  "mercadopago": {
    "access_token": "APP_USR-5713293345399410..."
  }
}
```

## 🚀 Paso 8: Desplegar Functions

```powershell
firebase deploy --only functions
```

Esto tardará 2-3 minutos. Al terminar verás:
```
✔  functions: Finished running predeploy script.
✔  functions[createPaymentPreference(us-central1)]: Successful create operation.
✔  functions[mercadopagoWebhook(us-central1)]: Successful create operation.

Function URL (createPaymentPreference): https://us-central1-hogarverde-489e9.cloudfunctions.net/createPaymentPreference
Function URL (mercadopagoWebhook): https://us-central1-hogarverde-489e9.cloudfunctions.net/mercadopagoWebhook
```

## 🔔 Paso 9: Configurar Webhook en Mercado Pago

1. Ve a: https://www.mercadopago.com.ar/developers/panel
2. Selecciona tu aplicación
3. Ve a "Webhooks" en el menú lateral
4. Click en "Agregar webhook"
5. Pega la URL: `https://us-central1-hogarverde-489e9.cloudfunctions.net/mercadopagoWebhook`
6. Selecciona eventos: **"Pagos"**
7. Guarda

## 🧪 Paso 10: Probar con Tarjetas de Prueba

### Tarjetas de Prueba Argentina:

**Visa Aprobada:**
- Número: `4509 9535 6623 3704`
- CVV: `123`
- Vencimiento: `11/25`
- Nombre: Cualquiera
- DNI: Cualquiera

**Mastercard Aprobada:**
- Número: `5031 7557 3453 0604`
- CVV: `123`
- Vencimiento: `11/25`

**Visa Rechazada (sin fondos):**
- Número: `4097 4597 0492 8864`

### Flujo de Prueba:
1. Abre tu sitio en el navegador
2. Agrega productos al carrito
3. Ve a checkout y llena el formulario
4. Click en "Continuar al Pago"
5. Serás redirigido a Mercado Pago
6. Usa una tarjeta de prueba
7. Deberías regresar a `success.html` ✅

## 📊 Paso 11: Verificar que Funciona

### Ver logs en tiempo real:
```powershell
firebase functions:log --only createPaymentPreference,mercadopagoWebhook
```

### Verificar en Firebase Console:
1. Ve a: https://console.firebase.google.com/project/hogarverde-489e9/firestore/data
2. Abre la colección `orders`
3. Deberías ver las órdenes con:
   - `paymentStatus: 'pending'` → luego cambia a `'approved'`
   - `paymentId`: ID del pago de Mercado Pago
   - `paymentMethod`: Tipo de tarjeta usada

### Verificar reducción de stock:
1. En Firestore, abre la colección `products`
2. Verifica que el `stock` se redujo correctamente

---

## 🎯 ¡Listo para Producción!

Cuando todo funcione bien con las tarjetas de prueba, puedes activar el modo producción:

### Solo necesitas:
1. Obtener credenciales de producción en Mercado Pago
2. Actualizar el config:
```powershell
firebase functions:config:set mercadopago.access_token="TU_ACCESS_TOKEN_DE_PRODUCCION"
```
3. Actualizar Public Key en `checkout.html`
4. Redesplegar:
```powershell
firebase deploy --only functions
```

---

## ❗ Solución de Problemas

### Error: "Firebase CLI not found"
```powershell
npm install -g firebase-tools
```

### Error: "Not authorized"
```powershell
firebase login --reauth
```

### Error: "Functions region not configured"
En `firebase.json`, asegúrate de tener:
```json
{
  "functions": {
    "source": "functions"
  }
}
```

### El webhook no se ejecuta
- Espera 1-2 minutos después del pago
- Verifica logs: `firebase functions:log`
- Asegúrate de configurar la URL correcta en Mercado Pago

---

## 📞 Comandos Útiles

```powershell
# Ver configuración actual
firebase functions:config:get

# Ver logs en tiempo real
firebase functions:log --only createPaymentPreference

# Redesplegar después de cambios
firebase deploy --only functions

# Ver estado de las functions
firebase functions:list
```

---

## ✅ Checklist Final

- [ ] Firebase CLI instalado
- [ ] Login en Firebase completado
- [ ] Dependencias instaladas (`npm install` en `/functions`)
- [ ] Access Token configurado con `functions:config:set`
- [ ] Functions desplegadas con `firebase deploy --only functions`
- [ ] URL de webhook configurada en Mercado Pago
- [ ] Probado con tarjeta de prueba
- [ ] Verificado que se crean órdenes en Firestore
- [ ] Verificado que se reduce el stock

---

## 🎉 ¡Todo Listo!

Una vez completados todos los pasos, tu sitio estará 100% funcional con pagos reales de Mercado Pago! 🚀
