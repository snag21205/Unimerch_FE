// Seller Dashboard Main Controller
// Handles initialization, tab management, and common utilities

// ===== GLOBAL VARIABLES =====
let currentSellerId = null;

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    // Get seller info from token first
    initializeSellerInfo();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize tabs
    initializeTabs();
    
    // Load products and reviews filter after seller info is initialized
    setTimeout(() => {
        loadMyProducts();
        loadSellerProductsForReviewFilter();
    }, 100);
});

// ===== SELLER INFO =====
function initializeSellerInfo() {
    try {
        const token = apiService.getToken();
        console.log('Token:', token ? 'exists' : 'not found');
        
        if (token) {
            const sellerId = apiService.getCurrentUserId();
            console.log('Seller ID from token:', sellerId);
            currentSellerId = sellerId;
            
            // Set global variable for other modules
            window.currentSellerId = sellerId;
            console.log('Global currentSellerId set to:', window.currentSellerId);
            
            // Get user info from localStorage
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            const sellerName = userInfo.fullName || userInfo.username || 'Người Bán';
            const sellerEmail = userInfo.email || 'seller@ueh.edu.vn';
            
            // Update UI
            document.getElementById('sellerName').textContent = sellerName;
            document.getElementById('sellerEmail').textContent = sellerEmail;
        }
    } catch (error) {
        // Error initializing seller info
    }
}

// ===== EVENT LISTENERS SETUP =====
function setupEventListeners() {
    // Logout functionality
    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            handleLogout();
        });
    }
    
    // Mobile sidebar toggle
    window.toggleSidebar = function() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.toggle('show');
        }
    };
    
    // Seller product search
    const sellerProductSearchInput = document.getElementById('sellerProductSearchInput');
    if (sellerProductSearchInput) {
        sellerProductSearchInput.addEventListener('input', function() {
            sellerSearchQuery = this.value.toLowerCase();
            sellerCurrentPage = 1;
            renderSellerProductsTable();
        });
    }
    
    // Seller image preview
    const sellerImageUrlInput = document.getElementById('productImageUrl');
    if (sellerImageUrlInput) {
        sellerImageUrlInput.addEventListener('input', function() {
            const url = this.value;
            const preview = document.getElementById('productImagePreview');
            const container = document.getElementById('productImagePreviewContainer');
            
            if (url && url.startsWith('http')) {
                preview.src = url;
                preview.onerror = function() {
                    container.style.display = 'none';
                };
                preview.onload = function() {
                    container.style.display = 'block';
                };
            } else {
                container.style.display = 'none';
            }
        });
    }
    
    // Seller orders search
    const sellerOrderSearchInput = document.getElementById('sellerOrderSearchInput');
    if (sellerOrderSearchInput) {
        sellerOrderSearchInput.addEventListener('input', function() {
            sellerOrdersSearchQuery = this.value.toLowerCase();
            sellerOrdersCurrentPage = 1;
            renderSellerOrdersTable();
        });
    }
    
    // Seller orders status filter
    const sellerOrderStatusFilter = document.getElementById('sellerOrderStatusFilter');
    if (sellerOrderStatusFilter) {
        sellerOrderStatusFilter.addEventListener('change', function() {
            sellerOrdersStatusFilter = this.value;
            sellerOrdersCurrentPage = 1;
            loadMyOrders();
        });
    }
    
    // Seller reviews search
    const sellerReviewSearchInput = document.getElementById('sellerReviewSearchInput');
    if (sellerReviewSearchInput) {
        sellerReviewSearchInput.addEventListener('input', function() {
            sellerReviewsSearchQuery = this.value.toLowerCase();
            sellerReviewsCurrentPage = 1;
            renderSellerReviewsTable();
        });
    }
    
    // Seller reviews rating filter
    const sellerReviewRatingFilter = document.getElementById('sellerReviewRatingFilter');
    if (sellerReviewRatingFilter) {
        sellerReviewRatingFilter.addEventListener('change', function() {
            sellerReviewsRatingFilter = this.value;
            sellerReviewsCurrentPage = 1;
            renderSellerReviewsTable();
        });
    }
    
    // Seller reviews product filter
    const sellerReviewProductFilter = document.getElementById('sellerReviewProductFilter');
    if (sellerReviewProductFilter) {
        sellerReviewProductFilter.addEventListener('change', function() {
            sellerReviewsProductFilter = this.value;
            sellerReviewsCurrentPage = 1;
            renderSellerReviewsTable();
        });
    }
}

// ===== LOGOUT =====
async function handleLogout() {
    try {
        await apiService.logout();
        localStorage.clear();
        window.location.href = '../auth/login.html';
    } catch (error) {
        localStorage.clear();
        window.location.href = '../auth/login.html';
    }
}

// ===== TAB MANAGEMENT =====
function initializeTabs() {
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link[data-tab], .nav-link[data-tab]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const tabName = this.getAttribute('data-tab');
            switchTab(tabName);
            
            // Update active nav link
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('[id$="-tab"]').forEach(tab => {
        tab.classList.add('d-none');
    });
    
    // Show selected tab
    const targetTab = document.getElementById(tabName + '-tab');
    if (targetTab) {
        targetTab.classList.remove('d-none');
        
        // Update header title
        const titles = {
            'products': 'Quản Lý Sản Phẩm',
            'orders': 'Quản Lý Đơn Hàng',
            'reviews': 'Quản Lý Đánh Giá'
        };
        
        const headerTitle = document.querySelector('.header-title');
        if (headerTitle && titles[tabName]) {
            headerTitle.textContent = titles[tabName];
        }
        
        // Load tab content based on tab name
        switch(tabName) {
            case 'products':
                loadMyProducts();
                break;
            case 'orders':
                loadMyOrders();
                break;
            case 'reviews':
                loadSellerReviews();
                break;
        }
    }
}

// Make switchTab available globally
window.switchTab = switchTab;

// ===== UTILITY FUNCTIONS =====
function showToast(message, type = 'info') {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
        toastContainer.style.zIndex = '1080';
        document.body.appendChild(toastContainer);
    }
    
    const toastId = 'toast-' + Date.now();
    const toastHTML = `
        <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header">
                <div class="rounded me-2" style="width: 12px; height: 12px; background-color: ${getToastColor(type)};"></div>
                <strong class="me-auto">Thông Báo</strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        </div>
    `;
    
    toastContainer.insertAdjacentHTML('beforeend', toastHTML);
    
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
    
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}

function getToastColor(type) {
    const colors = {
        'success': '#10b981',
        'error': '#ef4444',
        'warning': '#f59e0b',
        'info': '#3b82f6'
    };
    return colors[type] || colors.info;
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatMoney(x) {
    const n = Number(x ?? 0);
    return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

// Export utility functions globally
window.showToast = showToast;
window.formatDate = formatDate;
window.formatMoney = formatMoney;
window.currentSellerId = currentSellerId;