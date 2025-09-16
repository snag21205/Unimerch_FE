// UEH Merch Store JavaScript - Simplified and Fixed

// Authentication management
let currentUser = JSON.parse(localStorage.getItem('ueh-user')) || null;

// Product data
const products = [
    {
        id: 1,
        name: "UEH Classic Hoodie",
        price: 45.00,
        tags: ["new", "hoodie", "winter"],
        colors: ["#1f2937", "#374151", "#0F766E"],
        sizes: ["XS", "S", "M", "L", "XL"],
        description: "Premium cotton blend hoodie with embroidered UEH logo. Perfect for campus life.",
        category: "hoodie"
    },
    {
        id: 2,
        name: "UEH Economics Tee",
        price: 25.00,
        tags: ["tee", "bestseller"],
        colors: ["#ffffff", "#111827", "#0F766E"],
        sizes: ["XS", "S", "M", "L", "XL"],
        description: "Soft cotton t-shirt featuring the School of Economics logo.",
        category: "tee"
    },
    {
        id: 3,
        name: "UEH Varsity Cap",
        price: 22.00,
        tags: ["accessory", "cap"],
        colors: ["#1f2937", "#ffffff"],
        sizes: ["One Size"],
        description: "Adjustable cap with classic UEH embroidery.",
        category: "accessory"
    },
    {
        id: 4,
        name: "UEH Business Tote",
        price: 35.00,
        tags: ["accessory", "bag", "limited"],
        colors: ["#1f2937", "#374151"],
        sizes: ["One Size"],
        description: "Durable canvas tote bag perfect for textbooks and laptops.",
        category: "accessory"
    },
    {
        id: 5,
        name: "UEH Water Bottle",
        price: 18.00,
        tags: ["accessory", "sustainable"],
        colors: ["#0F766E", "#ffffff", "#1f2937"],
        sizes: ["500ml"],
        description: "Insulated stainless steel water bottle with UEH branding.",
        category: "accessory"
    },
    {
        id: 6,
        name: "UEH Notebook Set",
        price: 15.00,
        tags: ["accessory", "study"],
        colors: ["#0F766E", "#ffffff"],
        sizes: ["A5"],
        description: "Set of 3 premium notebooks with UEH cover design.",
        category: "accessory"
    },
    {
        id: 7,
        name: "UEH Winter Hoodie",
        price: 55.00,
        tags: ["hoodie", "winter", "premium"],
        colors: ["#1f2937", "#6b7280"],
        sizes: ["S", "M", "L", "XL"],
        description: "Heavyweight hoodie with fleece lining for maximum warmth.",
        category: "hoodie"
    },
    {
        id: 8,
        name: "UEH Vintage Tee",
        price: 28.00,
        tags: ["tee", "vintage", "sale"],
        colors: ["#fef3c7", "#f3f4f6"],
        sizes: ["S", "M", "L", "XL"],
        description: "Retro-style t-shirt celebrating UEH's heritage.",
        category: "tee"
    },
    {
        id: 9,
        name: "UEH Zip Hoodie",
        price: 48.00,
        tags: ["hoodie", "new"],
        colors: ["#374151", "#0F766E"],
        sizes: ["XS", "S", "M", "L", "XL"],
        description: "Full-zip hoodie with kangaroo pocket and drawstring hood.",
        category: "hoodie"
    },
    {
        id: 10,
        name: "UEH Long Sleeve Tee",
        price: 30.00,
        tags: ["tee", "long-sleeve"],
        colors: ["#ffffff", "#1f2937", "#0F766E"],
        sizes: ["S", "M", "L", "XL"],
        description: "Comfortable long-sleeve tee with subtle UEH branding.",
        category: "tee"
    },
    {
        id: 11,
        name: "UEH Laptop Sleeve",
        price: 32.00,
        tags: ["accessory", "tech", "new"],
        colors: ["#1f2937", "#6b7280"],
        sizes: ["13\"", "15\""],
        description: "Padded laptop sleeve with UEH logo and secure zipper.",
        category: "accessory"
    },
    {
        id: 12,
        name: "UEH Alumni Polo",
        price: 42.00,
        tags: ["polo", "alumni", "limited"],
        colors: ["#ffffff", "#0F766E", "#1f2937"],
        sizes: ["S", "M", "L", "XL", "XXL"],
        description: "Classic polo shirt designed exclusively for UEH alumni.",
        category: "tee"
    }
];

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
    console.log('Products array:', products);
    
    // Check authentication state
    checkAuthState();
    
    // renderProducts(); // VÔ HIỆU HÓA - để product-card.js handle
    setupEventListeners();
});

// Main render function - Clean design with proper Bootstrap grid
function renderProducts(productsToRender = products) {
    // VÔ HIỆU HÓA FUNCTION NÀY - để product-card.js xử lý
    console.log('app.js renderProducts() đã bị vô hiệu hóa');
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
    const filteredProducts = category === 'all' 
        ? products 
        : products.filter(product => product.category === category);
    
    renderProducts(filteredProducts);
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
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: productId,
            name: product.name,
            price: product.price,
            image: 'shirt.png',
            quantity: 1
        });
    }
    
    localStorage.setItem('ueh-cart', JSON.stringify(cart));
    updateCartUI();
    alert(`${product.name} đã được thêm vào giỏ hàng!`);
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

function logout() {
    // Clear user data
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('authToken');
    
    // Update UI
    checkAuthState();
    
    // Show success message
    showToast('Logged out successfully!', 'success');
}

function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    const toastId = 'toast-' + Date.now();
    
    const toastHtml = `
        <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header">
                <div class="rounded me-2" style="width: 20px; height: 20px; background-color: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};"></div>
                <strong class="me-auto">UEH Merch</strong>
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