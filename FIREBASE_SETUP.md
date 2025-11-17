# Configuración de Firebase - HogarVerde

## 1. Crear la colección de productos en Firestore

Ve a tu consola de Firebase: https://console.firebase.google.com/project/hogarverde-489e9/firestore

### Estructura de cada documento en la colección `products`:

```javascript
{
  id: 1,                    // Number - ID único del producto
  name: "Sofá Elegance",    // String - Nombre del producto
  description: "Sofá moderno de tres plazas, tapizado en tela premium", // String
  price: 89990,             // Number - Precio en pesos
  image: "images/sillon.jpg", // String - URL o ruta de la imagen
  category: "living",       // String - Categoría: "living", "dormitorio", "cocina", "bano"
  stock: 15                 // Number - Cantidad disponible en stock
}
```

## 2. Productos de ejemplo para cargar en Firestore

### Living (4 productos)
```json
[
  {
    "id": 1,
    "name": "Sofá Elegance",
    "description": "Sofá moderno de tres plazas, tapizado en tela premium",
    "price": 89990,
    "image": "images/sillon.jpg",
    "category": "living",
    "stock": 15
  },
  {
    "id": 2,
    "name": "Mesa Ratona Nordic",
    "description": "Mesa de centro con diseño escandinavo, madera natural",
    "price": 34990,
    "image": "images/mesa-ratona.jpg",
    "category": "living",
    "stock": 20
  },
  {
    "id": 3,
    "name": "Estante Modular",
    "description": "Biblioteca moderna con compartimentos ajustables",
    "price": 45990,
    "image": "images/estante.jpg",
    "category": "living",
    "stock": 10
  },
  {
    "id": 4,
    "name": "Living Completo",
    "description": "Set completo para living con diseño contemporáneo",
    "price": 124990,
    "image": "images/living-room.jpg",
    "category": "living",
    "stock": 5
  }
]
```

### Dormitorio (3 productos)
```json
[
  {
    "id": 5,
    "name": "Cama King Deluxe",
    "description": "Cama king size con cabecera acolchada premium",
    "price": 119990,
    "image": "images/cama.jpg",
    "category": "dormitorio",
    "stock": 8
  },
  {
    "id": 6,
    "name": "Dormitorio Completo",
    "description": "Set completo de dormitorio con cama, mesas de luz y placard",
    "price": 189990,
    "image": "images/dormitorio.jpg",
    "category": "dormitorio",
    "stock": 3
  },
  {
    "id": 7,
    "name": "Cómoda Minimalista",
    "description": "Cómoda de 6 cajones con diseño moderno y funcional",
    "price": 42990,
    "image": "images/comoda.jpg",
    "category": "dormitorio",
    "stock": 12
  }
]
```

### Cocina (3 productos)
```json
[
  {
    "id": 8,
    "name": "Cocina Integral Premium",
    "description": "Muebles de cocina completos con electrodomésticos",
    "price": 249990,
    "image": "images/cocina.jpg",
    "category": "cocina",
    "stock": 4
  },
  {
    "id": 9,
    "name": "Barra Desayunadora",
    "description": "Isla de cocina con banquetas incluidas",
    "price": 78990,
    "image": "images/Living-comedor-fondo2.jpg",
    "category": "cocina",
    "stock": 6
  },
  {
    "id": 10,
    "name": "Mesa Comedor Elegance",
    "description": "Mesa de comedor extensible para 6-8 personas",
    "price": 67990,
    "image": "images/Living-comedor-fondo2.jpg",
    "category": "cocina",
    "stock": 9
  }
]
```

### Baño (3 productos)
```json
[
  {
    "id": 11,
    "name": "Vanitory Moderno",
    "description": "Mueble de baño con bacha y espejo incluido",
    "price": 54990,
    "image": "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=500",
    "category": "bano",
    "stock": 11
  },
  {
    "id": 12,
    "name": "Set Accesorios Baño",
    "description": "Kit completo de accesorios cromados premium",
    "price": 18990,
    "image": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500",
    "category": "bano",
    "stock": 25
  },
  {
    "id": 13,
    "name": "Espejo con Luz LED",
    "description": "Espejo panorámico con iluminación LED integrada",
    "price": 29990,
    "image": "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=500",
    "category": "bano",
    "stock": 14
  }
]
```

## 3. Cómo cargar los productos manualmente en Firestore

1. Ve a Firebase Console → Firestore Database
2. Crea una nueva colección llamada `products`
3. Para cada producto, haz clic en "Agregar documento"
4. Deja que Firebase genere el ID del documento automáticamente
5. Agrega cada campo manualmente según la estructura arriba

## 4. Script para cargar productos automáticamente (Opcional)

Puedes ejecutar este código en la consola del navegador mientras estás en tu página:

```javascript
// Productos a cargar
const allProducts = [
  // Copia aquí todos los productos del JSON de arriba
];

// Función para cargar productos
async function uploadProducts() {
  for (const product of allProducts) {
    try {
      await window.firebaseAddDoc(
        window.firebaseCollection(window.firebaseDB, 'products'),
        product
      );
      console.log(`✓ Producto cargado: ${product.name}`);
    } catch (error) {
      console.error(`✗ Error cargando ${product.name}:`, error);
    }
  }
  console.log('¡Todos los productos fueron cargados!');
}

// Ejecutar
uploadProducts();
```

## 5. Funcionalidades implementadas

✅ **Carga de productos desde Firebase** - Los productos se obtienen de Firestore al cargar la página
✅ **Mostrar stock disponible** - Cada producto muestra su stock actual
✅ **Badge de "Últimas unidades"** - Productos con stock ≤5 muestran un badge rojo
✅ **Stock bajo destacado** - Texto rojo cuando quedan pocas unidades
✅ **Botón deshabilitado sin stock** - Los productos sin stock no se pueden agregar al carrito
✅ **Actualización automática de stock** - Al confirmar una compra, el stock se reduce en Firebase
✅ **Recarga de productos** - Después de cada compra, los productos se recargan para mostrar stock actualizado

## 6. Reglas de seguridad recomendadas para Firestore

En Firebase Console → Firestore → Reglas, agrega:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir lectura de productos a todos
    match /products/{productId} {
      allow read: if true;
      allow write: if false; // Solo admin puede modificar productos
    }
    
    // Permitir crear órdenes
    match /orders/{orderId} {
      allow create: if true;
      allow read, update, delete: if false; // Solo admin
    }
  }
}
```

## 7. Verificar que funciona

1. Recarga tu página web
2. Abre la consola del navegador (F12)
3. Deberías ver: `Products loaded from Firebase: {living: [...], dormitorio: [...], ...}`
4. Los productos deberían mostrar su stock
5. Al realizar una compra, el stock debería disminuir
