# 📱 Configurar WhatsApp para Pagos

## ⚠️ IMPORTANTE - Cambiar Número de WhatsApp

Para que funcione el pago por WhatsApp, debes cambiar el número en `checkout.html`:

### Línea 371 de checkout.html:

```javascript
const whatsappNumber = '5491234567890'; // CAMBIAR POR TU NÚMERO
```

### Formato del número:

- **Argentina:** `549` + código de área (sin 0) + número
- **Ejemplo Buenos Aires:** `5491134567890` (11 es CABA)
- **Ejemplo Córdoba:** `5493514567890` (351 es Córdoba)

### Pasos para configurar:

1. Abre `checkout.html`
2. Busca la línea 371 (Ctrl + G en VS Code)
3. Reemplaza `5491234567890` con tu número en formato internacional
4. Guarda el archivo
5. Ejecuta: `firebase deploy --only hosting`

## ✅ Ventajas del Pago por WhatsApp

- ✨ **Funciona siempre** - No depende de Mercado Pago
- 💬 **Comunicación directa** con el cliente
- 🔄 **Flexible** - Puedes coordinar cualquier método de pago
- 📊 **Guardado** - El pedido se guarda igual en Firebase

## 🧪 Probar WhatsApp

1. Ve a: https://hogarverde-489e9.web.app/checkout.html
2. Completa el formulario
3. Selecciona "📱 WhatsApp (Coordinar pago)"
4. Haz clic en "Continuar al Pago"
5. Se abrirá WhatsApp con el resumen del pedido

## 🔍 Depurar Mercado Pago

Si quieres seguir usando Mercado Pago, ahora hay MUCHO MÁS debugging:

1. Ve al checkout
2. Abre la consola del navegador (F12)
3. Intenta hacer un pedido con Mercado Pago
4. Verás logs detallados de cada paso:
   - ✓ Verificando Firebase...
   - ✓ Orden ID creado
   - ✓ Datos preparados
   - ✓ Guardando en Firebase
   - ✓ Llamando a createPaymentPreference
   - ✓ Resultado de Mercado Pago
   - ✓ Redirigiendo...

5. Si hay un error, verás exactamente dónde falló
6. Envíame la captura de los logs de la consola

## 📞 Número Recomendado

Usa un número de WhatsApp Business para:
- Respuestas automáticas
- Catálogo de productos
- Etiquetas para pedidos
- Métricas
