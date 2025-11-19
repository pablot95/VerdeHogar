# 🌿 HogarVerde

E-commerce de productos para el hogar con integración de Firebase y Mercado Pago.

## 🚀 Tecnologías

- **Frontend**: HTML5, CSS3, JavaScript
- **Backend**: Firebase Functions
- **Base de Datos**: Cloud Firestore
- **Pagos**: Mercado Pago (Checkout Pro)
- **Hosting**: Vercel

## 📦 Instalación

```bash
# Clonar repositorio
git clone https://github.com/pablot95/VerdeHogar.git

# Instalar dependencias de Firebase Functions
cd functions
npm install
```

## ⚙️ Configuración

1. **Firebase**: Configurar credenciales en `firebase-init.js`
2. **Mercado Pago**: Configurar Access Token en Firebase Functions:
   ```bash
   firebase functions:config:set mercadopago.access_token="TU_TOKEN"
   ```

## 🔒 Seguridad

- Credenciales de Firebase (frontend): Públicas por diseño
- Credenciales de Mercado Pago: Solo en Firebase Functions (backend)
- Security Rules configuradas en Firestore

## 📄 Licencia

MIT
