// Configuración de scroll suave con Lenis
if (typeof Lenis !== 'undefined') {
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
}

// Global products array (will be loaded from Firebase)
let productsData = {
    living: [],
    dormitorio: [],
    cocina: []
};

// Load products from Firebase
async function loadProductsFromFirebase() {
    if (!window.firebaseDB || !window.firebaseGetDocs || !window.firebaseCollection) {
        console.warn('Firebase not initialized, using fallback products');
        // Use fallback data
        productsData = JSON.parse(JSON.stringify(fallbackProductsData));
        return;
    }

    try {
        const querySnapshot = await window.firebaseGetDocs(
            window.firebaseCollection(window.firebaseDB, 'products')
        );
        
        console.log('Firebase products found:', querySnapshot.size);
        
        // If Firebase has products, use them
        if (querySnapshot.size > 0) {
            // Clear current data
            productsData = {
                living: [],
                dormitorio: [],
                cocina: [],
            };
            
            querySnapshot.forEach((doc) => {
                const product = {
                    firebaseId: doc.id, // Store Firebase document ID
                    ...doc.data()
                };
                
                console.log('Producto cargado:', product.name, 'Categoría:', product.category);
                
                // Add to appropriate category
                if (productsData[product.category]) {
                    productsData[product.category].push(product);
                } else {
                    console.warn('Categoría desconocida:', product.category);
                }
            });
            
            console.log('Products loaded from Firebase:', productsData);
        } else {
            console.warn('No products in Firebase, using fallback data');
            // Use fallback data if Firebase is empty
            productsData = JSON.parse(JSON.stringify(fallbackProductsData));
        }
        
        // Reload UI with data
        loadFeaturedProducts();
        loadSaleProducts();
        
    } catch (error) {
        console.error('Error loading products from Firebase:', error);
        console.warn('Using fallback products due to error');
        // Use fallback data on error
        productsData = JSON.parse(JSON.stringify(fallbackProductsData));
    }
}

// Products Database (fallback - will be replaced by Firebase data)
const fallbackProductsData = {
    living: [
        {
            id: 1,
            name: 'Sofá Elegance',
            description: 'Sofá moderno de tres plazas, tapizado en tela premium',
            price: 89990,
            image: 'images/sillon.jpg',
            category: 'living',
            stock: 10
        },
        {
            id: 2,
            name: 'Mesa Ratona Nordic',
            description: 'Mesa de centro con diseño escandinavo, madera natural',
            price: 34990,
            image: 'images/mesa-ratona.jpg',
            category: 'living',
            stock: 10
        },
        {
            id: 3,
            name: 'Estante Modular',
            description: 'Biblioteca moderna con compartimentos ajustables',
            price: 45990,
            image: 'images/estante.jpg',
            category: 'living',
            stock: 10
        },
        {
            id: 4,
            name: 'Living Completo',
            description: 'Set completo para living con diseño contemporáneo',
            price: 124990,
            image: 'images/living-room.jpg',
            category: 'living',
            stock: 10
        }
    ],
    dormitorio: [
        {
            id: 5,
            name: 'Cama King Deluxe',
            description: 'Cama king size con cabecera acolchada premium',
            price: 119990,
            image: 'images/cama.jpg',
            category: 'dormitorio',
            stock: 10
        },
        {
            id: 6,
            name: 'Dormitorio Completo',
            description: 'Set completo de dormitorio con cama, mesas de luz y placard',
            price: 189990,
            image: 'images/dormitorio.jpg',
            category: 'dormitorio',
            stock: 10
        },
        {
            id: 7,
            name: 'Decoración Minimalista',
            description: 'Set de elementos decorativos para dormitorio moderno',
            price: 24990,
            image: 'images/decoracion.jpg',
            category: 'dormitorio',
            stock: 10
        }
    ],
    cocina: [
        {
            id: 8,
            name: 'Cocina Integral Premium',
            description: 'Módulos de cocina completos con terminación premium',
            price: 249990,
            image: 'images/cocina.jpg',
            category: 'cocina',
            stock: 10
        },
        {
            id: 9,
            name: 'Living-Comedor Integrado',
            description: 'Diseño de espacios integrados para máximo confort',
            price: 159990,
            image: 'images/Living-comedor-fondo.jpg',
            category: 'cocina',
            stock: 10
        },
        {
            id: 10,
            name: 'Mesa Comedor Elegance',
            description: 'Mesa de comedor extensible para 6-8 personas',
            price: 67990,
            image: 'images/Living-comedor-fondo2.jpg',
            category: 'cocina',
            stock: 10
        }
    ]
};

// Initialize fallback data if Firebase is not available
if (Object.keys(productsData.living).length === 0) {
    productsData = fallbackProductsData;
}

// Cart Management
let cart = JSON.parse(localStorage.getItem('hogarverdeCart')) || [];

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    // Load products from Firebase first
    await loadProductsFromFirebase();
    
    loadFeaturedProducts();
    loadSaleProducts();
    updateCartCount();
    initializeCart();
    initializeScrollAnimations();
    initializeSearch();
    initializeCheckout();
    initializeProductsPage();
});

// Load Featured Products
function loadFeaturedProducts() {
    const featuredGrid = document.getElementById('featuredProductsGrid');
    if (!featuredGrid) return;
    
    // Clear existing products to avoid duplicates
    featuredGrid.innerHTML = '';
    
    // Select 8 featured products (2 rows of 4)
    const featuredProducts = [
        productsData.living[0],     // Sofá Elegance
        productsData.dormitorio[0], // Cama King Deluxe
        productsData.cocina[0],     // Cocina Integral Premium
        productsData.dormitorio[1],       // Vanitory Moderno
        productsData.living[1]     // Mesa Ratona Nordic
    ];
    
    featuredProducts.forEach(product => {
        if (product) {
            const productCard = createProductCard(product);
            featuredGrid.appendChild(productCard);
        }
    });
}

// Load Sale Products
function loadSaleProducts() {
    const saleGrid = document.getElementById('saleProductsGrid');
    if (!saleGrid) return;
    
    // Clear existing products to avoid duplicates
    saleGrid.innerHTML = '';
    
    // Select 4 products for sale
    const saleProducts = [
        productsData.living[0],     // Estante Modular
        productsData.dormitorio[0], // Dormitorio Completo
        productsData.cocina[0],     // Mesa Comedor
        productsData.dormitorio[1]        // Espejo con Luz LED
    ];
    
    saleProducts.forEach(product => {
        if (product) {
            const productCard = createProductCard(product);
            saleGrid.appendChild(productCard);
        }
    });
}

// Navigate to Products Page
function goToProducts(category = 'all') {
    window.location.href = `productos.html?category=${category}`;
}

// Load Products by Category
function loadProductsByCategory(category) {
    const productsGrid = document.getElementById('allProductsGrid');
    productsGrid.innerHTML = '';
    
    if (category === 'all') {
        Object.keys(productsData).forEach(cat => {
            productsData[cat].forEach(product => {
                const productCard = createProductCard(product);
                productsGrid.appendChild(productCard);
            });
        });
    } else {
        if (productsData[category]) {
            productsData[category].forEach(product => {
                const productCard = createProductCard(product);
                productsGrid.appendChild(productCard);
            });
        }
    }
    
    updateProductsCount();
    applyPriceFilter();
}

// Update Products Count
function updateProductsCount() {
    const visibleProducts = document.querySelectorAll('.product-card:not([style*="display: none"])');
    const count = visibleProducts.length;
    const countElement = document.getElementById('productsCount');
    if (countElement) {
        countElement.textContent = `${count} producto${count !== 1 ? 's' : ''}`;
    }
}

// Filter by Category
function filterByCategory(category) {
    loadProductsByCategory(category);
}

// Asegurar scope global
window.filterByCategory = filterByCategory;

// Filter by Price
function filterByPrice() {
    applyPriceFilter();
}

// Asegurar scope global
window.filterByPrice = filterByPrice;

// Apply Price Filter
function applyPriceFilter() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"][value]');
    const selectedRanges = Array.from(checkboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);
    
    const products = document.querySelectorAll('.product-card');
    
    if (selectedRanges.length === 0) {
        // Show all products
        products.forEach(card => {
            card.style.display = 'block';
        });
    } else {
        // Filter by price range
        products.forEach(card => {
            const priceText = card.querySelector('.product-price').textContent;
            const price = parseInt(priceText.replace(/[^0-9]/g, ''));
            
            let showProduct = false;
            
            if (selectedRanges.includes('low') && price <= 30000) {
                showProduct = true;
            }
            if (selectedRanges.includes('medium') && price > 30000 && price <= 80000) {
                showProduct = true;
            }
            if (selectedRanges.includes('high') && price > 80000) {
                showProduct = true;
            }
            
            card.style.display = showProduct ? 'block' : 'none';
        });
    }
    
    updateProductsCount();
}

// Clear Filters
function clearFilters() {
    // Clear category (set to "all")
    const allRadio = document.querySelector('input[name="category"][value="all"]');
    if (allRadio) {
        allRadio.checked = true;
    }
    
    // Clear price checkboxes
    const priceCheckboxes = document.querySelectorAll('input[type="checkbox"]');
    priceCheckboxes.forEach(cb => {
        cb.checked = false;
    });
    
    // Reload all products
    loadProductsByCategory('all');
}

// Asegurar scope global
window.clearFilters = clearFilters;

// Update Checkout Main Button
function updateCheckoutMainButton() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const countElement = document.getElementById('checkoutMainCount');
    if (countElement) {
        countElement.textContent = count;
    }
}

// Go to Checkout from Products
function goToCheckoutFromProducts() {
    if (cart.length === 0) {
        alert('Tu carrito está vacío');
        return;
    }
    
    document.getElementById('productsPage').classList.remove('active');
    document.getElementById('checkoutPage').classList.add('active');
    renderCheckoutSummary();
}

// Create Product Card
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.productId = product.id;
    card.dataset.firebaseId = product.firebaseId || '';
    
    // Check if product is in cart
    const cartItem = cart.find(item => item.id === product.id);
    const inCart = cartItem ? cartItem.quantity : 0;
    
    // Get stock (use 0 if not set, don't default to 10)
    const stock = typeof product.stock === 'number' ? product.stock : 0;
    const stockClass = stock <= 5 ? 'low-stock' : '';
    const stockText = stock === 0 ? 'Sin stock' : (stock <= 5 ? `Solo quedan ${stock}` : `Stock: ${stock}`);
    const isOutOfStock = stock === 0;
    
    // Fix image URL - Use proxy for Imgur to bypass hotlinking protection
    let imageUrl = product.image;
    
    if (imageUrl && imageUrl.includes('imgur.com')) {
        // Extract Imgur ID from various formats
        const imgurMatch = imageUrl.match(/imgur\.com\/([a-zA-Z0-9]+)\.?(\w+)?/);
        if (imgurMatch) {
            const imgurId = imgurMatch[1];
            const ext = imgurMatch[2] || 'jpeg';
            // Use wsrv.nl proxy (same as weserv but shorter domain)
            imageUrl = `https://wsrv.nl/?url=i.imgur.com/${imgurId}.${ext}&output=webp`;
        }
    }

    card.innerHTML = `
        <div class="product-image">
            <img src="${imageUrl}" alt="${product.name}" loading="lazy" onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect fill=%22%23e0e0e0%22 width=%22400%22 height=%22300%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23999%22 font-size=%2218%22%3EImagen No Disponible%3C/text%3E%3C/svg%3E';">
            ${isOutOfStock ? '<div class="stock-badge out-of-stock">Sin Stock</div>' : (stock <= 5 ? '<div class="stock-badge">Últimas unidades</div>' : '')}
        </div>
        <div class="product-info">
            <h3 class="product-name">${product.name}</h3>
            <p class="product-description">${product.description}</p>
            <div class="product-stock ${stockClass}">${stockText}</div>
            <div class="product-footer">
                <span class="product-price">$${product.price.toLocaleString()}</span>
                <div class="product-actions">
                    <div class="product-quantity">
                        <button class="qty-control-btn" onclick="decreaseQuantity(${product.id})" ${isOutOfStock ? 'disabled' : ''}>-</button>
                        <span class="qty-display" id="qty-${product.id}">1</span>
                        <button class="qty-control-btn" onclick="increaseQuantity(${product.id})" ${isOutOfStock ? 'disabled' : ''}>+</button>
                    </div>
                    <button class="add-to-cart-btn" onclick="addToCartWithQuantity(${product.id})" id="add-${product.id}" ${isOutOfStock ? 'disabled' : ''}>
                        ${isOutOfStock ? 'Sin stock' : 'Agregar'}
                    </button>
                </div>
            </div>

        </div>
    `;
    return card;
}

// Update product card cart button
function updateProductCardCartButton(productId) {
    const cartActions = document.getElementById(`cart-actions-${productId}`);
    const cartCountElement = document.getElementById(`cart-count-${productId}`);
    
    if (!cartActions) return;
    
    const cartItem = cart.find(item => item.id === productId);
    const inCart = cartItem ? cartItem.quantity : 0;
    
    if (inCart > 0) {
        cartActions.style.display = 'block';
        if (cartCountElement) {
            cartCountElement.textContent = inCart;
        }
    } else {
        cartActions.style.display = 'none';
    }
}

// Product quantity controls
let productQuantities = {};

function increaseQuantity(productId) {
    const qtyDisplay = document.getElementById(`qty-${productId}`);
    let currentQty = parseInt(qtyDisplay.textContent);
    
    // Find product and check stock
    const product = findProductById(productId);
    const maxStock = typeof product?.stock === 'number' ? product.stock : 0;
    
    // If no stock, don't allow any increase
    if (maxStock === 0) return;
    
    // Check if already in cart
    const cartItem = cart.find(item => item.id === productId);
    const inCart = cartItem ? cartItem.quantity : 0;
    const availableStock = maxStock - inCart;
    
    if (currentQty < availableStock) {
        currentQty++;
        qtyDisplay.textContent = currentQty;
        productQuantities[productId] = currentQty;
    } else {
        // Show feedback that max stock reached
        const btn = qtyDisplay.nextElementSibling;
        if (btn) {
            btn.style.opacity = '0.5';
            setTimeout(() => btn.style.opacity = '1', 200);
        }
    }
}

function decreaseQuantity(productId) {
    const qtyDisplay = document.getElementById(`qty-${productId}`);
    let currentQty = parseInt(qtyDisplay.textContent);
    if (currentQty > 1) {
        currentQty--;
        qtyDisplay.textContent = currentQty;
        productQuantities[productId] = currentQty;
    }
}

// Asegurar que estén en scope global
window.increaseQuantity = increaseQuantity;
window.decreaseQuantity = decreaseQuantity;

function openCart() {
    document.getElementById('cartModal').classList.add('active');
    renderCart();
}

// Add to Cart with Quantity
function addToCartWithQuantity(productId) {
    const product = findProductById(productId);
    if (!product) return;

    const quantity = productQuantities[productId] || parseInt(document.getElementById(`qty-${productId}`).textContent);
    const existingItem = cart.find(item => item.id === productId);
    
    // Check stock availability (no default, use 0 if undefined)
    const maxStock = typeof product.stock === 'number' ? product.stock : 0;
    
    if (maxStock === 0) {
        alert('Este producto no tiene stock disponible.');
        return;
    }
    const currentInCart = existingItem ? existingItem.quantity : 0;
    const newTotal = currentInCart + quantity;
    
    if (newTotal > maxStock) {
        alert(`Solo hay ${maxStock} unidades disponibles. Ya tienes ${currentInCart} en el carrito.`);
        return;
    }
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ ...product, quantity: quantity });
    }
    
    saveCart();
    updateCartCount();
    updateCheckoutMainButton();
    renderCart();
    
    // Update the product card to show cart button
    updateProductCardCartButton(productId);
    
    // Animation feedback on Add button
    const addBtn = document.getElementById(`add-${productId}`);
    if (addBtn) {
        const originalText = addBtn.textContent;
        const originalBg = addBtn.style.background;
        
        addBtn.textContent = '¡Agregado!';
        addBtn.style.background = '#8BC34A';
        
        setTimeout(() => {
            addBtn.textContent = originalText;
            addBtn.style.background = originalBg;
            // Reset quantity
            document.getElementById(`qty-${productId}`).textContent = '1';
            productQuantities[productId] = 1;
        }, 2000);
    }
}

// Asegurar que esté en scope global
window.addToCartWithQuantity = addToCartWithQuantity;

// Add to Cart (legacy function for compatibility)
function addToCart(productId) {
    addToCartWithQuantity(productId);
}

// Find Product by ID
function findProductById(id) {
    for (let category in productsData) {
        const product = productsData[category].find(p => p.id === id);
        if (product) return product;
    }
    return null;
}

// Update Cart Count
function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountEl = document.getElementById('cartCount');
    if (cartCountEl) {
        cartCountEl.textContent = count;
    }
    updateCheckoutMainButton();
    
    // Update all product card cart buttons
    cart.forEach(item => {
        updateProductCardCartButton(item.id);
    });
}

// Save Cart
function saveCart() {
    localStorage.setItem('hogarverdeCart', JSON.stringify(cart));
}

// Render Cart
function renderCart() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="cart-empty">Tu carrito está vacío</div>';
        cartTotal.textContent = '$0';
        return;
    }
    
    let html = '';
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        // Get current stock (no default, use 0 if undefined)
        const product = findProductById(item.id);
        const currentStock = typeof product?.stock === 'number' ? product.stock : 0;
        const stockWarning = currentStock === 0 ? `<span class="stock-warning">Sin stock</span>` : (currentStock <= 5 ? `<span class="stock-warning">Solo quedan ${currentStock}</span>` : '');
        
        html += `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">$${item.price.toLocaleString()} ${stockWarning}</div>
                    <div class="cart-item-quantity">
                        <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)" ${item.quantity >= currentStock ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>+</button>
                    </div>
                    <button class="remove-item" onclick="removeFromCart(${item.id})">Eliminar</button>
                </div>
            </div>
        `;
    });
    
    cartItems.innerHTML = html;
    cartTotal.textContent = `$${total.toLocaleString()}`;
}

// Update Quantity
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;
    
    // Find product to check stock (no default, use 0 if undefined)
    const product = findProductById(productId);
    const maxStock = typeof product?.stock === 'number' ? product.stock : 0;
    
    const newQuantity = item.quantity + change;
    
    // Validate stock when increasing
    if (change > 0 && newQuantity > maxStock) {
        alert(`Solo hay ${maxStock} unidades disponibles de este producto.`);
        return;
    }
    
    // Remove if quantity reaches 0
    if (newQuantity <= 0) {
        removeFromCart(productId);
        return;
    }
    
    item.quantity = newQuantity;
    
    saveCart();
    updateCartCount();
    updateCheckoutMainButton();
    renderCart();
    updateProductCardCartButton(productId);
}

// Remove from Cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartCount();
    updateCheckoutMainButton();
    renderCart();
    updateProductCardCartButton(productId);
}

// Initialize Cart
function initializeCart() {
    const cartIcon = document.getElementById('cartIcon');
    const cartModal = document.getElementById('cartModal');
    const closeCart = document.getElementById('closeCart');
    
    // Validar que los elementos existen (no están en checkout.html)
    if (!cartIcon || !cartModal || !closeCart) {
        console.log('⚠️ initializeCart: Elementos del carrito no encontrados (probablemente estamos en checkout)');
        return;
    }
    
    cartIcon.addEventListener('click', () => {
        cartModal.classList.add('active');
        renderCart();
    });
    
    closeCart.addEventListener('click', () => {
        cartModal.classList.remove('active');
    });
    
    // Close on outside click
    cartModal.addEventListener('click', (e) => {
        if (e.target === cartModal) {
            cartModal.classList.remove('active');
        }
    });
}

// Initialize Scroll Animations
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, observerOptions);
    
    // Observar elementos con animaciones normales
    document.querySelectorAll('.reveal-left, .reveal-right, .reveal-fade').forEach(el => {
        observer.observe(el);
    });
    
    // Observador especial para lifestyle sections con efecto parallax
    const lifestyleObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.2,
        rootMargin: '0px'
    });
    
    // Observar todas las lifestyle sections
    document.querySelectorAll('.lifestyle-fullscreen').forEach(el => {
        lifestyleObserver.observe(el);
    });
}

// Initialize Search
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.querySelector('.search-btn');
    
    // Validar que los elementos existen
    if (!searchInput || !searchBtn) {
        console.log('⚠️ initializeSearch: Elementos de búsqueda no encontrados');
        return;
    }
    
    function performSearch() {
        const query = searchInput.value.toLowerCase().trim();
        if (!query) return;
        
        // Get all product cards
        const allProducts = document.querySelectorAll('.product-card');
        let foundCount = 0;
        
        allProducts.forEach(card => {
            const name = card.querySelector('.product-name').textContent.toLowerCase();
            const description = card.querySelector('.product-description').textContent.toLowerCase();
            
            if (name.includes(query) || description.includes(query)) {
                card.style.display = 'block';
                card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                foundCount++;
                
                // Highlight effect
                card.style.border = '2px solid #8BC34A';
                setTimeout(() => {
                    card.style.border = '';
                }, 2000);
                
                if (foundCount === 1) return; // Stop after first match
            }
        });
    }
    
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });
}

// Initialize Products Page
function initializeProductsPage() {
    const backToHome = document.getElementById('backToHome');
    const productsPage = document.getElementById('productsPage');
    const productsGrid = document.getElementById('allProductsGrid');
    
    // Validar que los elementos existen
    if (!backToHome || !productsPage) {
        console.log('⚠️ initializeProductsPage: Elementos no encontrados');
        return;
    }
    
    backToHome.addEventListener('click', () => {
        productsPage.classList.remove('active');
        document.getElementById('cartModal').classList.remove('active');
        document.body.style.overflow = 'auto';
    });
    
    // Event delegation for dynamically created buttons
    if (productsGrid) {
        productsGrid.addEventListener('click', (e) => {
            // Handle "Ir al Carrito" button clicks
            if (e.target.closest('.go-to-cart-btn')) {
                e.preventDefault();
                e.stopPropagation();
                openCart();
            }
        });
    }
}

// Initialize Checkout
function initializeCheckout() {
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    // Redirigir a checkout.html cuando se hace click en Finalizar Compra
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                alert('Tu carrito está vacío');
                return;
            }
            
            // Redirigir a la página de checkout
            window.location.href = 'checkout.html';
        });
    }
    
    // El resto del código solo se ejecuta si estamos en index.html con el checkout viejo
    const checkoutPage = document.getElementById('checkoutPage');
    const backToShop = document.getElementById('backToShop');
    const checkoutForm = document.getElementById('checkoutForm');
    const paymentRadios = document.querySelectorAll('input[name="payment"]');
    const cardFields = document.getElementById('cardFields');
    
    if (!checkoutPage) return; // Si no existe el checkout viejo, salir
    
    // Este código ya no se usa pero lo dejamos por si acaso
    if (backToShop) {
        backToShop.addEventListener('click', () => {
            checkoutPage.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    }
    
    
    // Toggle card fields based on payment method (solo si existen)
    if (paymentRadios && cardFields) {
        paymentRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.value === 'card') {
                    cardFields.style.display = 'block';
                } else {
                    cardFields.style.display = 'none';
                }
            });
        });
    }
    
    // Handle form submission (solo si existe el formulario)
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleCheckoutSubmit();
        });
    }
}

// Render Checkout Summary
function renderCheckoutSummary() {
    const summaryItems = document.getElementById('summaryItems');
    const summarySubtotal = document.getElementById('summarySubtotal');
    const summaryShipping = document.getElementById('summaryShipping');
    const summaryTotal = document.getElementById('summaryTotal');
    
    if (!summaryItems) {
        console.log('⚠️ renderCheckoutSummary: elementos del DOM no encontrados');
        return;
    }
    
    console.log('📊 renderCheckoutSummary - cart:', cart);
    console.log('📊 cart.length:', cart?.length || 0);
    
    if (!cart || cart.length === 0) {
        summaryItems.innerHTML = '<div class="empty-cart-message">Tu carrito está vacío</div>';
        if (summarySubtotal) summarySubtotal.textContent = '$0';
        if (summaryShipping) summaryShipping.textContent = '$0';
        if (summaryTotal) summaryTotal.textContent = '$0';
        return;
    }
    
    let html = '';
    let subtotal = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        html += `
            <div class="summary-item">
                <img src="${item.image}" alt="${item.name}" class="summary-item-image">
                <div class="summary-item-info">
                    <div class="summary-item-name">${item.name}</div>
                    <div class="summary-item-details">
                        <span>Cant: ${item.quantity}</span>
                        <span>$${itemTotal.toLocaleString()}</span>
                    </div>
                </div>
            </div>
        `;
    });
    
    const shipping = 5000;
    const total = subtotal + shipping;
    
    summaryItems.innerHTML = html;
    if (summarySubtotal) summarySubtotal.textContent = `$${subtotal.toLocaleString()}`;
    if (summaryShipping) summaryShipping.textContent = `$${shipping.toLocaleString()}`;
    if (summaryTotal) summaryTotal.textContent = `$${total.toLocaleString()}`;
    
    console.log('✅ renderCheckoutSummary completado - subtotal:', subtotal);
}

// Asegurar que esté en scope global
window.renderCheckoutSummary = renderCheckoutSummary;

// Handle Checkout Submit
async function handleCheckoutSubmit() {
    const formData = {
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value,
        city: document.getElementById('city').value,
        zipCode: document.getElementById('zipCode').value,
        paymentMethod: document.querySelector('input[name="payment"]:checked').value,
        items: cart,
        subtotal: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        shipping: 5000,
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) + 5000,
        timestamp: new Date().toISOString(),
        status: 'pending'
    };
    
    // Save to Firebase
    if (window.firebaseDB && window.firebaseAddDoc && window.firebaseCollection) {
        try {
            // Save order
            const docRef = await window.firebaseAddDoc(
                window.firebaseCollection(window.firebaseDB, 'orders'), 
                {
                    ...formData,
                    createdAt: window.firebaseServerTimestamp()
                }
            );
            
            console.log('Order saved to Firebase with ID:', docRef.id);
            
            // Update stock for each product in cart
            for (const item of cart) {
                if (item.firebaseId) {
                    try {
                        const productRef = window.firebaseDoc(window.firebaseDB, 'products', item.firebaseId);
                        await window.firebaseUpdateDoc(productRef, {
                            stock: window.firebaseIncrement(-item.quantity)
                        });
                        console.log(`Stock updated for product ${item.firebaseId}: -${item.quantity}`);
                    } catch (stockError) {
                        console.error('Error updating stock:', stockError);
                    }
                }
            }
            
            // Reload products to show updated stock
            await loadProductsFromFirebase();
            
            // Show success message
            alert(`¡Pedido realizado con éxito! 
            
Tu número de orden es: ${docRef.id}
Recibirás un email de confirmación en breve.`);
            
            // Clear cart
            cart = [];
            saveCart();
            updateCartCount();
            
            // Close checkout
            document.getElementById('checkoutPage').classList.remove('active');
            document.body.style.overflow = 'auto';
            
            // Reset form
            document.getElementById('checkoutForm').reset();
            
        } catch (error) {
            console.error('Error saving order to Firebase:', error);
            alert('Hubo un error al procesar tu pedido. Por favor intenta nuevamente.');
        }
    } else {
        console.warn('Firebase not initialized. Order data:', formData);
        alert('¡Pedido realizado con éxito! (Modo de prueba - Firebase no conectado)');
        
        // Clear cart
        cart = [];
        saveCart();
        updateCartCount();
        
        // Close checkout
        document.getElementById('checkoutPage').classList.remove('active');
        document.body.style.overflow = 'auto';
        
        // Reset form
        document.getElementById('checkoutForm').reset();
    }
}

// Smooth scroll for category sections
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        if (targetSection) {
            // Close products page if open
            const productsPage = document.getElementById('productsPage');
            if (productsPage.classList.contains('active')) {
                productsPage.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
            
            targetSection.scrollIntoView({ behavior: 'smooth' });
        }
    });
});
