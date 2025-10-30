// Admin Dashboard Main Controller
// Handles initialization, tab management, and common utilities

// ===== GLOBAL VARIABLES =====
let currentAdminId = null;

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    // Get admin info from token
    initializeAdminInfo();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize tabs
    initializeTabs();
    
    // Load dashboard
    loadDashboardFromAPI();
    
    // Load products for review filter
    loadProductsForReviewFilter();
});

// ===== ADMIN INFO =====
function initializeAdminInfo() {
    try {
        const token = apiService.getToken();
        if (token) {
            const adminId = apiService.getCurrentUserId();
            currentAdminId = adminId;
            
            // Get user info from localStorage
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            const adminName = userInfo.fullName || userInfo.username || 'Quản Trị Viên';
            const adminEmail = userInfo.email || 'admin@ueh.edu.vn';
            
            // Update UI
            document.getElementById('adminName').textContent = adminName;
            document.getElementById('adminEmail').textContent = adminEmail;
        }
    } catch (error) {
        // Error initializing admin info
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
    
    // Admin product search
    const adminProductSearchInput = document.getElementById('adminProductSearchInput');
    if (adminProductSearchInput) {
        adminProductSearchInput.addEventListener('input', function() {
            adminSearchQuery = this.value.toLowerCase();
            adminCurrentPage = 1;
            renderAdminProductsTable();
        });
    }
    
    // Admin image preview
    const adminImageUrlInput = document.getElementById('adminProductImageUrl');
    if (adminImageUrlInput) {
        adminImageUrlInput.addEventListener('input', function() {
            const url = this.value;
            const preview = document.getElementById('adminProductImagePreview');
            const container = document.getElementById('adminProductImagePreviewContainer');
            
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
    
    // Admin orders search
    const adminOrderSearchInput = document.getElementById('adminOrderSearchInput');
    if (adminOrderSearchInput) {
        adminOrderSearchInput.addEventListener('input', function() {
            adminOrdersSearchQuery = this.value.toLowerCase();
            adminOrdersCurrentPage = 1;
            renderAdminOrdersTable();
        });
    }
    
    // Admin orders status filter
    const adminOrderStatusFilter = document.getElementById('adminOrderStatusFilter');
    if (adminOrderStatusFilter) {
        adminOrderStatusFilter.addEventListener('change', function() {
            adminOrdersStatusFilter = this.value;
            adminOrdersCurrentPage = 1;
            loadAdminOrders();
        });
    }
    
    // Admin users search
    const adminUserSearchInput = document.getElementById('adminUserSearchInput');
    if (adminUserSearchInput) {
        adminUserSearchInput.addEventListener('input', function() {
            adminUsersSearchQuery = this.value.toLowerCase();
            adminUsersCurrentPage = 1;
            renderAdminUsersTable();
        });
    }
    
    // Admin users role filter
    const adminUserRoleFilter = document.getElementById('adminUserRoleFilter');
    if (adminUserRoleFilter) {
        adminUserRoleFilter.addEventListener('change', function() {
            adminUsersRoleFilter = this.value;
            adminUsersCurrentPage = 1;
            // Don't reload from API, just re-render with client-side filter
            renderAdminUsersTable();
        });
    }
    
    // Admin reviews search
    const adminReviewSearchInput = document.getElementById('adminReviewSearchInput');
    if (adminReviewSearchInput) {
        adminReviewSearchInput.addEventListener('input', function() {
            adminReviewsSearchQuery = this.value.toLowerCase();
            adminReviewsCurrentPage = 1;
            renderAdminReviewsTable();
        });
    }
    
    // Admin reviews rating filter
    const adminReviewRatingFilter = document.getElementById('adminReviewRatingFilter');
    if (adminReviewRatingFilter) {
        adminReviewRatingFilter.addEventListener('change', function() {
            adminReviewsRatingFilter = this.value;
            adminReviewsCurrentPage = 1;
            renderAdminReviewsTable();
        });
    }
    
    // Admin reviews product filter
    const adminReviewProductFilter = document.getElementById('adminReviewProductFilter');
    if (adminReviewProductFilter) {
        adminReviewProductFilter.addEventListener('change', function() {
            adminReviewsProductFilter = this.value;
            adminReviewsCurrentPage = 1;
            renderAdminReviewsTable();
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
            'dashboard': 'Bảng Điều Khiển',
            'users': 'Quản Lý Người Dùng',
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
                loadDashboardFromAPI();
                break;
            case 'users':
                loadAdminUsers();
                break;
            case 'products':
                loadAdminProducts();
                break;
            case 'orders':
                loadAdminOrders();
                break;
            case 'reviews':
                loadAdminReviews();
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

// Export utility functions globally
window.showToast = showToast;
window.formatDate = formatDate;
window.formatMoney = formatMoney;