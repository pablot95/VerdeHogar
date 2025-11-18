# 🛒 Guía de Configuración de Mercado Pago para HogarVerde

## Estado Actual

Tu código de Mercado Pago está correctamente implementado. Si no funciona, sigue estos pasos:

## Paso 1: Verificar que Firebase Functions estén desplegadas

```bash
firebase deploy --only functions
```

Deberías ver:
- ✅ createPaymentPreference
- ✅ mercadopagoWebhook

## Paso 2: Configurar el Access Token en Firebase

Necesitas configurar tu Access Token de Mercado Pago como variable de entorno en Firebase:

```bash
firebase functions:config:set mercadopago.access_token="APP_USR-5713293345399410-111717-59c57f2da4de4c64fe97f1523750aa8f-2998483119"
```

Luego, vuelve a desplegar las Functions:

```bash
firebase deploy --only functions
```

## Paso 3: Verificar la configuración

Para ver la configuración actual:

```bash
firebase functions:config:get
```

Deberías ver algo como:
```json
{
  "mercadopago": {
    "access_token": "APP_USR-5713293345399410..."
  }
}
```

## Paso 4: Probar el Flujo de Pago

1. Abre tu sitio: https://hogarverde-489e9.web.app
2. Agrega productos al carrito (primero ejecuta `agregar-productos.html`)
3. Ve a Checkout
4. Completa el formulario
5. Haz clic en "Continuar al Pago"

### Tarjetas de Prueba (Modo Test)

**Tarjeta Aprobada:**
- Número: `4509 9535 6623 3704`
- CVV: `123`
- Vencimiento: `11/25`
- Nombre: Cualquier nombre

**Tarjeta Rechazada:**
- Número: `4000 0000 0000 0002`
- CVV: `123`
- Vencimiento: `11/25`

## Paso 5: Configurar Webhook (Opcional pero Recomendado)

Para que Mercado Pago notifique automáticamente cuando un pago es aprobado:

1. Ve a: https://www.mercadopago.com.ar/developers/panel/app
2. Selecciona tu aplicación
3. En "Webhooks" agrega:
   - URL: `https://us-central1-hogarverde-489e9.cloudfunctions.net/mercadopagoWebhook`
   - Eventos: Selecciona "Pagos"

## Verificar Logs

Para ver si hay errores en las Functions:

```bash
firebase functions:log
```

## Errores Comunes

### Error: "Function not found"
- Las Functions no están desplegadas
- Solución: `firebase deploy --only functions`

### Error: "Access token is required"
- El Access Token no está configurado
- Solución: Ejecuta el comando del Paso 2

### Error: "Invalid credentials"
- El Access Token es incorrecto o expiró
- Solución: Verifica tu Access Token en https://www.mercadopago.com.ar/developers

### El botón no hace nada
- Abre la consola del navegador (F12)
- Busca mensajes de error
- Verifica que Firebase Functions esté inicializado correctamente

## Flujo Completo

1. Usuario completa formulario → Click en "Continuar al Pago"
2. Frontend llama a `createPaymentPreference` (Firebase Function)
3. Function crea preferencia en Mercado Pago
4. Function retorna URL de pago
5. Usuario es redirigido a Mercado Pago
6. Usuario completa el pago
7. Mercado Pago redirige a success.html/pending.html
8. Mercado Pago notifica via webhook
9. Webhook actualiza orden en Firebase
10. Webhook reduce stock de productos

## Soporte

Si sigues teniendo problemas:
1. Verifica que el plan de Firebase sea Blaze (tiene Functions habilitadas)
2. Revisa los logs: `firebase functions:log`
3. Verifica en la consola del navegador (F12) si hay errores JavaScript
4. Asegúrate de que la Public Key en checkout.html sea correcta
