# Página de Detalle de Producto

## Descripción
Se ha agregado una nueva funcionalidad que permite a los usuarios ver los detalles completos de cada producto en una página dedicada.

## Características Implementadas

### 1. Navegación a la Página de Detalle
- **Click en Tarjeta de Producto**: Al hacer click en cualquier tarjeta de producto (exceptuando los botones de acción), el usuario es redirigido a `producto-detalle.html?id=X`
- **Indicador Visual**: Al pasar el cursor sobre una tarjeta de producto, aparece un overlay con el texto "👁️ Ver detalles"

### 2. Página de Detalle del Producto (`producto-detalle.html`)
La página muestra:
- **Imagen Grande**: Imagen principal del producto en alta calidad
- **Información Detallada**:
  - Categoría del producto
  - Nombre del producto
  - Precio
  - Estado de stock (disponible, últimas unidades, sin stock)
  - Descripción completa
  - Características del producto
  - Código del producto

### 3. Funcionalidad de Compra
- **Selector de Cantidad**: Control para aumentar/disminuir cantidad a agregar
- **Botón "Agregar al Carrito"**: Agrega el producto con la cantidad seleccionada
- **Botón "Comprar Ahora"**: Agrega al carrito y redirige directamente al checkout
- **Validación de Stock**: No permite agregar más unidades de las disponibles
- **Indicador de Carrito**: Muestra si el producto ya está en el carrito y cuántas unidades

### 4. Productos Relacionados
- Muestra hasta 4 productos relacionados de la misma categoría
- Si no hay suficientes productos en la categoría, completa con productos de otras categorías
- Cada producto relacionado también es clicable para ver su detalle

### 5. Navegación
- **Botón "Volver"**: Regresa a la página anterior usando `window.history.back()`
- **Carrito Modal**: Accesible desde la página de detalle

## Archivos Modificados/Creados

### Nuevos Archivos
1. **producto-detalle.html**: Página HTML para mostrar el detalle del producto
2. **PRODUCTO_DETALLE.md**: Esta documentación

### Archivos Modificados
1. **script.js**:
   - Modificada función `createProductCard()` para hacer las tarjetas clicables
   - Se agregó event listener para redirigir al hacer click (excepto en botones)

2. **styles.css**:
   - Agregados estilos para `.product-detail-page`
   - Agregados estilos para `.product-detail-grid`
   - Agregados estilos para controles de cantidad en detalle
   - Agregados estilos para botones de acción en detalle
   - Agregado efecto hover "Ver detalles" en las tarjetas de producto
   - Estilos responsive para móviles

## Uso

### Para el Usuario
1. Navegar a la página de productos o inicio
2. Hacer click en cualquier tarjeta de producto
3. Ver los detalles completos del producto
4. Seleccionar cantidad deseada
5. Agregar al carrito o comprar directamente
6. Ver productos relacionados si desea continuar comprando

### Flujo de URLs
- Inicio: `index.html`
- Productos: `productos.html?category=XXX`
- Detalle: `producto-detalle.html?id=123`
- Checkout: `checkout.html`

## Validaciones Implementadas

1. **Stock**: No permite agregar más cantidad de la disponible
2. **ID de Producto**: Redirige a productos.html si el ID no es válido
3. **Producto No Encontrado**: Muestra alerta y redirige si el producto no existe
4. **Botones Deshabilitados**: Los productos sin stock tienen botones deshabilitados

## Responsive Design

La página de detalle es completamente responsive:
- **Desktop** (>968px): Layout de 2 columnas (imagen | información)
- **Tablet** (641px-968px): Layout de 1 columna con imagen arriba
- **Mobile** (<640px): Optimizado para pantallas pequeñas con padding reducido

## Beneficios

1. **Mejor Experiencia de Usuario**: Permite ver todos los detalles antes de comprar
2. **Mayor Conversión**: Los usuarios pueden tomar decisiones más informadas
3. **Navegación Intuitiva**: Click directo en la tarjeta es más natural
4. **Cross-selling**: Los productos relacionados fomentan compras adicionales
5. **Información Completa**: Toda la información del producto en un solo lugar
