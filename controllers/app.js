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
    console.log('DOM loaded, initializing...');
    console.log('Products will be loaded by main-products.js from API');
    
    // Check authentication state
    checkAuthState();
    
    // Products are handled by main-products.js via API integration
    setupEventListeners();
});

// Main render function - Now handled by main-products.js
function renderProducts(productsToRender = []) {
    // This function is disabled - main-products.js handles all product rendering via API
    console.log('app.js renderProducts() has been disabled - main-products.js handles product rendering');
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
    console.log('Filtering by category:', category);
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

// Cart functions (simplified)
function addToCart(productId) {
    console.log('Adding product to cart:', productId);
    
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
        console.error('API service not available');
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
    console.log('Opening quick view for product:', productId);
    alert('Quick view feature - Product ID: ' + productId);
}

// Authentication functions
function checkAuthState() {
    const notLoggedIn = document.getElementById('notLoggedIn');
    const loggedIn = document.getElementById('loggedIn');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    if (isLoggedIn) {
        // User is logged in
        notLoggedIn.classList.add('d-none');
        loggedIn.classList.remove('d-none');
        
        // Update user info
        updateUserDisplay();
    } else {
        // User is not logged in
        notLoggedIn.classList.remove('d-none');
        loggedIn.classList.add('d-none');
    }
}

function updateUserDisplay() {
    const username = localStorage.getItem('username');
    const userEmail = localStorage.getItem('userEmail');
    const userInfo = localStorage.getItem('userInfo');
    
    if (!username) return;
    
    // Update avatar
    const userAvatar = document.getElementById('userAvatar');
    const firstLetter = username.charAt(0).toUpperCase();
    userAvatar.textContent = firstLetter;
    
    // Update username
    const usernameElement = document.getElementById('username');
    usernameElement.textContent = username;
    
    // Update full name and email in dropdown
    const userFullName = document.getElementById('userFullName');
    userFullName.textContent = username || 'Welcome back!';
    
    const userEmailElement = document.getElementById('userEmail');
    userEmailElement.textContent = userEmail || username;
}



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
window.logout = logout;
window.showToast = showToast;