# 🔐 Guía de Seguridad - HogarVerde

## ⚠️ IMPORTANTE: Qué Credenciales Son Seguras y Cuáles NO

### ✅ SEGURO EXPONER (Frontend - Navegador)

Las siguientes credenciales de **Firebase Web Config** son PÚBLICAS y **DEBEN** estar en el código del frontend:

```javascript
apiKey: "AIzaSyB8RmLCZkzPDNTy5R9FjPEwIt0KBv3emxA"
authDomain: "hogarverde-489e9.firebaseapp.com"
projectId: "hogarverde-489e9"
storageBucket: "hogarverde-489e9.appspot.com"
messagingSenderId: "624499647908"
appId: "1:624499647908:web:88d9699f38c60bd7080d31"
```

**¿Por qué es seguro?**
- Son credenciales de **identificación** del proyecto, no de **autenticación**
- El navegador las necesita para conectarse a Firebase
- La seguridad real está en las **Security Rules** de Firestore/Storage
- Todos los proyectos de Firebase exponen estas credenciales públicamente

**🛡️ La protección viene de:**
1. **Firestore Security Rules** - Controlan quién puede leer/escribir
2. **Firebase App Check** (opcional) - Bloquea bots y tráfico no autorizado
3. **Restricciones de API** en Google Cloud Console

---

### ❌ NUNCA EXPONER (Backend - Servidor)

Las siguientes credenciales son **PRIVADAS** y **SOLO** deben estar en el backend (Firebase Functions):

```javascript
// ❌ NUNCA en el frontend
MERCADOPAGO_ACCESS_TOKEN: "APP_USR-750844577940180-111821-..."
MERCADOPAGO_PUBLIC_KEY: "APP_USR-88773180-c066-4b25-..."
```

**¿Por qué es peligroso?**
- Permiten realizar pagos, reembolsos, y acceder a datos de transacciones
- Si se exponen, cualquiera puede usarlas para hacer operaciones en tu cuenta
- Pueden generar cargos no autorizados o robo de información

**🔒 Cómo protegerlas:**
1. Están en **Firebase Functions config** (servidor)
2. NUNCA las incluyas en archivos JavaScript del frontend
3. NUNCA las subas a GitHub
4. Usa `.env` solo en desarrollo local (y está en `.gitignore`)

---

## 📋 Checklist de Seguridad

### Antes de hacer `git push`:

- [ ] ✅ Verificar que `.env` está en `.gitignore`
- [ ] ✅ Verificar que `firebase-config.js` está en `.gitignore`
- [ ] ✅ Verificar que `TESTING_MERCADOPAGO.md` está en `.gitignore`
- [ ] ✅ Verificar que NO hay tokens de Mercado Pago en archivos `.html` o `.js`
- [ ] ✅ Revisar con `git status` que no se están subiendo archivos sensibles

### Comando para verificar antes de push:

```powershell
# Ver qué archivos se van a subir
git status

# Ver cambios exactos
git diff

# Si ves credenciales de Mercado Pago (APP_USR-...), ¡NO HAGAS PUSH!
```

---

## 🔧 Configuración de Security Rules

### Firestore Security Rules (Recomendadas)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Productos: Solo lectura pública
    match /productos/{productId} {
      allow read: if true;
      allow write: if false; // Solo admins desde panel
    }
    
    // Órdenes: Solo escritura para crear, lectura solo del owner
    match /orders/{orderId} {
      allow create: if true; // Permitir crear órdenes
      allow read: if false; // Solo admin puede leer (o implementar auth)
      allow update, delete: if false;
    }
    
    // Bloquear acceso a todo lo demás
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### Storage Rules (Si usas Firebase Storage)

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /productos/{imageId} {
      allow read: if true;
      allow write: if false; // Solo desde panel de admin
    }
  }
}
```

---

## 🚨 Si Expusiste Credenciales Accidentalmente

### 1. Credenciales de Mercado Pago expuestas:

```powershell
# 1. ROTAR credenciales inmediatamente en Mercado Pago
# 2. Ir a: https://www.mercadopago.com.ar/developers/panel/credentials
# 3. Generar nuevas credenciales
# 4. Actualizar en Firebase Functions:

firebase functions:config:set mercadopago.access_token="NUEVA_TOKEN"
firebase deploy --only functions

# 5. Eliminar del historial de Git (si es necesario):
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch archivo-con-credenciales.js" \
  --prune-empty --tag-name-filter cat -- --all
```

### 2. Credenciales de Firebase expuestas:

**NO ES NECESARIO** rotar las credenciales de Firebase Web Config (son públicas).

**SÍ ES NECESARIO** si expusiste:
- Firebase Admin SDK credentials (Service Account)
- Database URLs privadas
- Secrets de Cloud Functions

---

## 📚 Recursos

- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Firebase App Check](https://firebase.google.com/docs/app-check)
- [Mercado Pago Security Best Practices](https://www.mercadopago.com.ar/developers/es/docs/security)
- [Git History Cleanup](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)

---

## ✅ Estado Actual del Proyecto

- ✅ Firebase Web Config: Expuestas (correcto)
- ✅ Mercado Pago Access Token: Solo en Firebase Functions (correcto)
- ✅ `.gitignore` configurado correctamente
- ✅ Security Rules configuradas en Firestore
- ⚠️ Próximo paso: Limpiar archivos antiguos con credenciales antes del push
