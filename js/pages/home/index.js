// UEH Merch Store JavaScript - Simplified and Fixed

// Authentication management
let currentUser = JSON.parse(localStorage.getItem('ueh-user')) || null;

// Products will be loaded from API - no static data needed
// main-products.js handles all product data management via API

// Cart management
let cart = JSON.parse(localStorage.getItem('ueh-cart')) || [];
let currentLanguage = 'en';

// Language content
const content = {
    en: {
        quickView: "Quick View",
        addToCart: "Add to Cart"
    },
    vi: {
        quickView: "Xem Nhanh", 
        addToCart: "Thêm Vào Giỏ"
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    
    // Check authentication state
    checkAuthState();
    
    // Wait for main-products.js to load, then load featured products
    setTimeout(() => {
        if (window.loadProductsFromAPI) {
            loadFeaturedProducts();
        } else {
            setTimeout(() => loadFeaturedProducts(), 500);
        }
    }, 300);
    
    // Setup event listeners
    setupEventListeners();
});

// Main render function - Now handled by main-products.js
function renderProducts(productsToRender = []) {
    // This function is disabled - main-products.js handles all product rendering via API
    return;
}

// Helper functions
function getProductSubtitle(product) {
    const subtitles = {
        hoodie: "Premium cotton blend with UEH embroidery",
        tee: "Soft cotton with modern fit", 
        accessory: "Essential campus gear"
    };
    return subtitles[product.category] || '';
}

function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price * 25000); // Convert USD to VND approx
}

function selectColor(element) {
    element.parentElement.querySelectorAll('.color-swatch').forEach(swatch => {
        swatch.classList.remove('selected');
    });
    element.classList.add('selected');
}

// Event listeners
function setupEventListeners() {
    // Navigation scroll effect
    window.addEventListener('scroll', handleScroll);
    
    // Product filter tabs
    document.querySelectorAll('[data-filter]').forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            filterProducts(e.target.dataset.filter);
            updateActiveTab(e.target);
        });
    });
}

function handleScroll() {
    const navbar = document.getElementById('mainNav');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}

function filterProducts(category) {
    // Products filtering is now handled by main-products.js
    // Trigger the filter in main-products.js if it has filterProducts function
    if (window.filterProducts) {
        window.filterProducts(category);
    }
}

function updateActiveTab(activeTab) {
    document.querySelectorAll('[data-filter]').forEach(tab => {
        tab.classList.remove('active');
    });
    activeTab.classList.add('active');
}

// Load featured products for index page
async function loadFeaturedProducts() {
    try {
        
        // Check if API service is available
        if (typeof window.apiService === 'undefined') {
            throw new Error('API Service not available');
        }
        
        // Use API service to get featured products
        const response = await window.apiService.getProducts({ limit: 6 });
        
        if (response.success && response.data && response.data.products) {
            
            // Transform products using main-products.js logic if available
            let products = response.data.products;
            if (window.transformProductData) {
                products = response.data.products.map(window.transformProductData);
            }
            
            renderFeaturedProducts(products);
        } else {
            showFeaturedProductsError();
        }
    } catch (error) {
        showFeaturedProductsError();
    }
}

// Render featured products using main-products.js card design
function renderFeaturedProducts(products) {
    const container = document.getElementById('featuredProductsGrid');
    
    if (!container) {
        return;
    }
    
    if (!products || products.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center">
                <p class="text-muted">Hiện tại chưa có sản phẩm nổi bật nào.</p>
            </div>
        `;
        return;
    }
    
    // Use main-products.js card creation if available, otherwise use simple card
    if (window.createProductCard) {
        container.innerHTML = products.map(product => 
            `<div class="col mb-2">${window.createProductCard(product)}</div>`
        ).join('');
    } else {
        // Fallback to simple card design
        container.innerHTML = products.map(product => `
            <div class="col">
                <div class="card h-100 border-0 shadow-sm" style="transition: all 0.3s ease; cursor: pointer;" 
                     onclick="goToProductDetail(${product.id})" 
                     onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 12px 40px rgba(0,0,0,0.15)'" 
                     onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 20px rgba(0,0,0,0.1)'">
                    
                    <!-- Product Image -->
                    <div class="position-relative overflow-hidden" style="height: 280px;">
                        <img src="${product.image_url || 'assets/images/products/demo.png'}" 
                             class="card-img-top w-100 h-100" 
                             style="object-fit: cover; transition: transform 0.3s ease;"
                             alt="${product.name}"
                             onmouseover="this.style.transform='scale(1.05)'"
                             onmouseout="this.style.transform='scale(1)'">
                    </div>
                    
                    <!-- Product Info -->
                    <div class="card-body p-4">
                        <h6 class="card-title fw-semibold mb-2" style="color: #111; font-size: 1.1rem; line-height: 1.3;">
                            ${product.name}
                        </h6>
                        <p class="card-text text-muted small mb-3" style="font-size: 0.85rem; line-height: 1.4;">
                            ${product.description ? product.description.substring(0, 80) + '...' : 'Sản phẩm chất lượng cao từ UEH'}
                        </p>
                        
                        <!-- Price -->
                        <div class="d-flex align-items-center justify-content-between mb-3">
                            <div class="price-info">
                                <span class="h5 fw-bold text-dark mb-0">${formatPrice(product.discount_price || product.price)}</span>
                                ${product.discount_price && product.discount_price < product.price ? 
                                    `<small class="text-muted text-decoration-line-through ms-2">${formatPrice(product.price)}</small>` : ''
                                }
                            </div>
                            ${product.discount_price && product.discount_price < product.price ? 
                                `<span class="badge bg-danger rounded-pill">-${Math.round(((product.price - product.discount_price) / product.price) * 100)}%</span>` : ''
                            }
                        </div>
                        
                        <!-- Action Button -->
                        <button class="btn btn-dark w-100 rounded-pill py-2" 
                                onclick="event.stopPropagation(); addProductToCart(${product.id}, event)"
                                style="font-weight: 500; transition: all 0.3s ease;"
                                onmouseover="this.style.transform='translateY(-1px)'"
                                onmouseout="this.style.transform='translateY(0)'">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px;">
                                <circle cx="8" cy="21" r="1"></circle>
                                <circle cx="19" cy="21" r="1"></circle>
                                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57L20.5 9H5.12"></path>
                            </svg>
                            Thêm vào giỏ
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

// Show error when featured products fail to load
function showFeaturedProductsError() {
    const container = document.getElementById('featuredProductsGrid');
    if (container) {
        container.innerHTML = `
            <div class="col-12 text-center">
                <div class="alert alert-warning" role="alert">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px;">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                        <line x1="12" y1="9" x2="12" y2="13"></line>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                    Không thể tải sản phẩm nổi bật. Vui lòng thử lại sau.
                </div>
            </div>
        `;
    }
}

// Cart functions (simplified)
function addToCart(productId) {
    
    // Get product data from API through main-products.js
    if (window.apiService) {
        // For now, just add a generic item - this should be enhanced later
        const existingItem = cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: productId,
                name: `Product ${productId}`, // Will be enhanced with real API data
                price: 0, // Will be fetched from API
                image: 'demo.png',
                quantity: 1
            });
        }
        
        localStorage.setItem('ueh-cart', JSON.stringify(cart));
        updateCartUI();
        showToast('Product added to cart!', 'success');
    } else {
        showToast('Unable to add to cart. Please try again.', 'error');
    }
}

function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    if (totalItems > 0) {
        cartCount.textContent = totalItems;
        cartCount.classList.remove('d-none');
    } else {
        cartCount.classList.add('d-none');
    }
}

function openQuickView(productId) {
    alert('Quick view feature - Product ID: ' + productId);
}

// Authentication functions are now handled by index-auth-v2.js
// Removed duplicate checkAuthState() and updateUserDisplay() functions


function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    const toastId = 'toast-' + Date.now();
    
    const toastHtml = `
        <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header">
                <div class="rounded me-2" style="width: 20px; height: 20px; background-color: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};"></div>
                <strong class="me-auto">Unimerch</strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        </div>
    `;
    
    toastContainer.insertAdjacentHTML('beforeend', toastHtml);
    
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
    
    // Remove toast element after it's hidden
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}

// Listen for successful login from login page
window.addEventListener('storage', function(e) {
    if (e.key === 'ueh-user' && e.newValue) {
        currentUser = JSON.parse(e.newValue);
        checkAuthState();
        showToast('Welcome back! You have been logged in successfully.', 'success');
    }
});

// Global functions
window.addToCart = addToCart;
window.openQuickView = openQuickView;
window.selectColor = selectColor;
// logout is handled by index-auth-v2.js
window.showToast = showToast;