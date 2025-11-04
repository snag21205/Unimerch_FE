// Seller Dashboard Main Controller
// Handles initialization, tab management, dashboard stats, and common utilities

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
    
    // Load dashboard by default
    loadSellerDashboardFromAPI();
    
    // Load products and reviews filter after seller info is initialized
    setTimeout(() => {
        loadSellerProductsForReviewFilter();
    }, 100);
});

// ===== SELLER INFO =====
function initializeSellerInfo() {
    try {
        const token = apiService.getToken();
        if (token) {
            const sellerId = apiService.getCurrentUserId();
            currentSellerId = sellerId;
            
            // Set global variable for other modules
            window.currentSellerId = sellerId;
            
            // Get user info from localStorage
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            const sellerName = userInfo.fullName || userInfo.username || 'Người Bán';
            const sellerEmail = userInfo.email || 'seller@ueh.edu.vn';
            
            // Update UI
            document.getElementById('sellerName').textContent = sellerName;
            document.getElementById('sellerEmail').textContent = sellerEmail;
            
            // Update initial
            const initial = (sellerName.charAt(0) || 'S').toUpperCase();
            document.getElementById('userInitial').textContent = initial;
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
    const productSearchInput = document.getElementById('productSearchInput');
    if (productSearchInput) {
        productSearchInput.addEventListener('input', function() {
            sellerSearchQuery = this.value.toLowerCase();
            sellerCurrentPage = 1;
            if (typeof renderSellerProductsTable === 'function') {
                renderSellerProductsTable();
            }
        });
    }
    
    // Seller image preview
    const imageUrlInput = document.getElementById('productImageUrl');
    if (imageUrlInput) {
        imageUrlInput.addEventListener('input', function() {
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
    const orderSearchInput = document.getElementById('orderSearchInput');
    if (orderSearchInput) {
        orderSearchInput.addEventListener('input', function() {
            sellerOrdersSearchQuery = this.value.toLowerCase();
            sellerOrdersCurrentPage = 1;
            if (typeof renderSellerOrdersTable === 'function') {
                renderSellerOrdersTable();
            }
        });
    }
    
    // Seller orders status filter
    const orderStatusFilter = document.getElementById('orderStatusFilter');
    if (orderStatusFilter) {
        orderStatusFilter.addEventListener('change', function() {
            sellerOrdersStatusFilter = this.value;
            sellerOrdersCurrentPage = 1;
            if (typeof loadMyOrders === 'function') {
                loadMyOrders();
            }
        });
    }
    
    // Seller reviews search
    const reviewSearchInput = document.getElementById('sellerReviewSearchInput');
    if (reviewSearchInput) {
        reviewSearchInput.addEventListener('input', function() {
            sellerReviewsSearchQuery = this.value.toLowerCase();
            sellerReviewsCurrentPage = 1;
            if (typeof renderSellerReviewsTable === 'function') {
                renderSellerReviewsTable();
            }
        });
    }
    
    // Seller reviews rating filter
    const reviewRatingFilter = document.getElementById('sellerReviewRatingFilter');
    if (reviewRatingFilter) {
        reviewRatingFilter.addEventListener('change', function() {
            sellerReviewsRatingFilter = this.value;
            sellerReviewsCurrentPage = 1;
            if (typeof renderSellerReviewsTable === 'function') {
                renderSellerReviewsTable();
            }
        });
    }
    
    // Seller reviews product filter
    const reviewProductFilter = document.getElementById('sellerReviewProductFilter');
    if (reviewProductFilter) {
        reviewProductFilter.addEventListener('change', function() {
            sellerReviewsProductFilter = this.value;
            sellerReviewsCurrentPage = 1;
            if (typeof renderSellerReviewsTable === 'function') {
                renderSellerReviewsTable();
            }
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
    const navLinks = document.querySelectorAll('.nav-link[data-tab]');
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
            'dashboard': 'Bảng Điều Khiển',
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
            case 'dashboard':
                loadSellerDashboardFromAPI();
                break;
            case 'products':
                if (typeof loadMyProducts === 'function') {
                    loadMyProducts();
                }
                break;
            case 'orders':
                if (typeof loadMyOrders === 'function') {
                    loadMyOrders();
                }
                break;
            case 'reviews':
                if (typeof loadSellerReviews === 'function') {
                    loadSellerReviews();
                }
                break;
        }
    }
}

// Make switchTab available globally
window.switchTab = switchTab;

// ===== UTILITY FUNCTIONS =====
function showToast(message, type = 'info') {
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
        toastContainer.style.zIndex = '1080';
        document.body.appendChild(toastContainer);
    }
    const toastId = 'toast-' + Date.now();
    const icons = {
      success: `<i class="bi bi-check-circle-fill toast-icon" style="color:#10b981;"></i>`,
      danger: `<i class="bi bi-x-circle-fill toast-icon" style="color:#ef4444;"></i>`,
      warning: `<i class="bi bi-exclamation-circle-fill toast-icon" style="color:#f59e0b;"></i>`,
      info: `<i class="bi bi-info-circle-fill toast-icon" style="color:#18b0b4;"></i>`
    };
    const titles = {
      success: 'Thành công', danger: 'Lỗi', warning: 'Cảnh báo', info: 'Thông báo'
    };
    const toastHTML = `
    <div id="${toastId}" class="toast fade show" role="alert" aria-live="assertive" aria-atomic="true" style="min-width:280px;max-width:370px;">
      <div class="toast-header">
        ${icons[type] || ''}
        <strong class="me-auto" style="color: var(--accent); font-size:1rem; font-family:'Montserrat',sans-serif;">${titles[type] || 'Thông báo'}</strong>
        <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
      <div class="toast-body" style="font-family:'Be Vietnam Pro',sans-serif;">
        ${message}
      </div>
    </div>`;
    toastContainer.insertAdjacentHTML('beforeend', toastHTML);
    const toastElem = document.getElementById(toastId);
    const bsToast = new bootstrap.Toast(toastElem, { delay: 3000 });
    bsToast.show();
    toastElem.addEventListener('hidden.bs.toast', function() {
      toastElem.remove();
    });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
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
