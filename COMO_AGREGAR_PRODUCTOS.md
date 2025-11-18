# 📦 Cómo Agregar Productos a Firebase

## ❗ Problema: No se ven productos en la página

Si entras a `productos.html` y no ves ningún producto, es porque **no hay productos en Firebase Firestore**.

## ✅ Solución: Agregar productos manualmente

### Opción 1: Desde Firebase Console (Recomendado)

1. **Ve a Firebase Console:**
   https://console.firebase.google.com/project/hogarverde-489e9/firestore

2. **Click en "Firestore Database"** en el menú lateral

3. **Click en "Iniciar colección"** (si no existe) o busca la colección `products`

4. **Crear colección `products`** (si no existe):
   - ID de colección: `products`
   - Click en "Siguiente"

5. **Agregar un documento de producto:**
   - ID del documento: (dejar auto-generado) o poner un ID personalizado
   - Agregar los siguientes campos:

   ```
   Campo           | Tipo    | Valor de ejemplo
   ---------------|---------|------------------
   name           | string  | "Sofá Elegance"
   description    | string  | "Sofá moderno de tres plazas"
   price          | number  | 89990
   image          | string  | "https://i.imgur.com/ejemplo.jpg"
   category       | string  | "living"
   stock          | number  | 10
   ```

6. **Click en "Guardar"**

7. **Repetir para más productos**

### Categorías disponibles:
- `living`
- `dormitorio`
- `cocina`

### Opción 2: Script para agregar productos de prueba

Crea un archivo HTML temporal para agregar productos:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Agregar Productos</title>
</head>
<body>
    <h1>Agregar Productos a Firebase</h1>
    <button onclick="addSampleProducts()">Agregar Productos de Prueba</button>
    <div id="status"></div>

    <script type="module">
        import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
        import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

        const firebaseConfig = {
            apiKey: "AIzaSyB8RmLCZkzPDNTy5R9FjPEwIt0KBv3emxA",
            authDomain: "hogarverde-489e9.firebaseapp.com",
            projectId: "hogarverde-489e9",
            storageBucket: "hogarverde-489e9.firebasestorage.app",
            messagingSenderId: "624499647908",
            appId: "1:624499647908:web:88d9699f38c60bd7080d31"
        };

        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);

        window.addSampleProducts = async function() {
            const status = document.getElementById('status');
            status.innerHTML = 'Agregando productos...';

            const products = [
                {
                    name: 'Sofá Elegance',
                    description: 'Sofá moderno de tres plazas, tapizado en tela premium',
                    price: 89990,
                    image: 'https://via.placeholder.com/300x300?text=Sofa',
                    category: 'living',
                    stock: 10
                },
                {
                    name: 'Mesa Ratona Nordic',
                    description: 'Mesa de centro con diseño escandinavo',
                    price: 34990,
                    image: 'https://via.placeholder.com/300x300?text=Mesa',
                    category: 'living',
                    stock: 15
                },
                {
                    name: 'Cama King Size',
                    description: 'Cama matrimonial con respaldo acolchado',
                    price: 125000,
                    image: 'https://via.placeholder.com/300x300?text=Cama',
                    category: 'dormitorio',
                    stock: 8
                },
                {
                    name: 'Mesa de Comedor',
                    description: 'Mesa extensible para 6-8 personas',
                    price: 78000,
                    image: 'https://via.placeholder.com/300x300?text=Mesa+Comedor',
                    category: 'cocina',
                    stock: 12
                }
            ];

            try {
                for (const product of products) {
                    await addDoc(collection(db, 'products'), product);
                    status.innerHTML += `<br>✅ Agregado: ${product.name}`;
                }
                status.innerHTML += '<br><br><strong>¡Productos agregados exitosamente!</strong>';
            } catch (error) {
                status.innerHTML = `❌ Error: ${error.message}`;
                console.error(error);
            }
        };
    </script>
</body>
</html>
```

**Pasos:**
1. Copia el código arriba en un archivo `agregar-productos.html`
2. Ábrelo en el navegador
3. Click en "Agregar Productos de Prueba"
4. Espera a que termine
5. Recarga tu página `productos.html`

### Opción 3: Verificar si hay productos

Abre la consola del navegador en `productos.html` (F12) y deberías ver:
```
Productos page: Iniciando carga...
Productos cargados desde Firebase: {living: Array(X), dormitorio: Array(Y), cocina: Array(Z)}
```

Si ves arrays vacíos `[]`, significa que no hay productos en Firebase.

---

## 🔍 Debug adicional

Si los productos siguen sin aparecer:

1. **Verificar reglas de Firestore:**
   Ve a: https://console.firebase.google.com/project/hogarverde-489e9/firestore/rules
   
   Deberían permitir lectura:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /products/{productId} {
         allow read: if true;
         allow write: if request.auth != null;
       }
     }
   }
   ```

2. **Verificar consola del navegador:**
   - Abre F12 → Console
   - Busca errores en rojo
   - Los logs te dirán exactamente qué está pasando

3. **Verificar que Firebase esté inicializado:**
   En la consola debería aparecer: "Firebase SDK loaded"

---

## 📸 Imágenes de productos

Para las imágenes puedes usar:
- **Imgur**: Sube a https://imgur.com y usa la URL directa
- **Firebase Storage**: Sube a Firebase y obtén la URL pública
- **URLs externas**: Cualquier URL pública de imagen
- **Placeholders**: https://via.placeholder.com/300x300?text=Producto

---

¿Necesitas ayuda? Revisa los logs en la consola del navegador (F12).
