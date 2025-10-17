// Seller Dashboard JavaScript - Complete Management System
// Uses apiService from api-service.js for all API calls

// ===== GLOBAL VARIABLES =====
let myProducts = [];
let myOrders = [];
let revenueChart = null;
let currentSellerId = null;

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('Seller Dashboard initializing...');
    
    // Get seller info from token
    initializeSellerInfo();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize tabs
    initializeTabs();
    
    // Load dashboard data
    loadDashboard();
});

// ===== SELLER INFO =====
function initializeSellerInfo() {
    try {
        const token = apiService.getToken();
        if (token) {
            const sellerId = apiService.getCurrentUserId();
            currentSellerId = sellerId;
            
            // Get user info from localStorage
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            const sellerName = userInfo.fullName || userInfo.username || 'Người Bán';
            const sellerEmail = userInfo.email || 'seller@ueh.edu.vn';
            
            // Update UI
            document.getElementById('sellerName').textContent = sellerName;
            document.getElementById('sellerEmail').textContent = sellerEmail;
            
            // Update initial
            const initial = sellerName.charAt(0).toUpperCase();
            document.getElementById('userInitial').textContent = initial;
        }
    } catch (error) {
        console.error('Error initializing seller info:', error);
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
    
    // Refresh data button
    window.refreshData = function() {
        loadDashboard();
        showToast('Đã làm mới dữ liệu', 'success');
    };
    
    // Add product button
    window.showAddProductModal = function() {
        showToast('Tính năng thêm sản phẩm sẽ được triển khai sớm', 'info');
    };
}

// ===== LOGOUT =====
async function handleLogout() {
    try {
        await apiService.logout();
        localStorage.clear();
        window.location.href = '../auth/login.html';
    } catch (error) {
        console.error('Logout error:', error);
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
            if (tabName) {
                switchTab(tabName);
                
                // Update active nav link
                navLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
            }
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
            'stats': 'Thống Kê',
            'products': 'Sản Phẩm Của Tôi',
            'orders': 'Đơn Hàng',
            'reviews': 'Đánh Giá'
        };
        
        const headerTitle = document.querySelector('.header-title');
        if (headerTitle && titles[tabName]) {
            headerTitle.textContent = titles[tabName];
        }
        
        // Load tab content
        switch(tabName) {
            case 'dashboard':
                loadDashboard();
                break;
            case 'products':
                loadMyProducts();
                break;
            case 'orders':
                loadMyOrders();
                break;
            case 'reviews':
                loadMyReviews();
                break;
        }
    }
}

// Make switchTab available globally
window.switchTab = switchTab;

// ===== DASHBOARD FUNCTIONS =====
async function loadDashboard() {
    try {
        showLoading();
        
        // Load stats cards
        await loadSellerStats();
        
        // Load charts
        await loadRevenueChart();
        
        // Load top products
        await loadTopSellingProducts();
        
        // Load recent orders
        await loadRecentOrders();
        
        hideLoading();
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showToast('Không thể tải dữ liệu dashboard', 'error');
        hideLoading();
    }
}

async function loadSellerStats() {
    try {
        // Get products by seller
        const productsResponse = await apiService.getProducts({ 
            seller_id: currentSellerId,
            limit: 1000 
        });
        
        const products = productsResponse?.data?.products || [];
        const totalProducts = products.length;
        const activeProducts = products.filter(p => p.status === 'available').length;
        
        // Calculate revenue and orders from products
        let totalRevenue = 0;
        let totalOrders = 0;
        let totalSold = 0;
        
        // Note: API doesn't provide direct seller stats, so we use sample data
        // In production, you should call a dedicated seller stats endpoint
        
        // Update cards
        document.getElementById('card_total_revenue').textContent = formatMoney(totalRevenue) + ' ₫';
        document.getElementById('card_total_products').textContent = totalProducts;
        document.getElementById('card_total_orders').textContent = totalOrders;
        document.getElementById('card_avg_rating').textContent = '⭐ 0.0';
        
    } catch (error) {
        console.error('Error loading seller stats:', error);
        // Set default values
        document.getElementById('card_total_revenue').textContent = '0 ₫';
        document.getElementById('card_total_products').textContent = '0';
        document.getElementById('card_total_orders').textContent = '0';
        document.getElementById('card_avg_rating').textContent = '⭐ 0.0';
    }
}

async function loadRevenueChart() {
    try {
        // Sample data for revenue chart
        // In production, call seller-specific revenue API
        const labels = [];
        const data = [];
        
        // Generate last 30 days
        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }));
            data.push(Math.floor(Math.random() * 500000));
        }
        
        updateRevenueChart(labels, data);
    } catch (error) {
        console.error('Error loading revenue chart:', error);
    }
}

function updateRevenueChart(labels, data) {
    const ctx = document.getElementById('revenueChart');
    if (ctx) {
        if (revenueChart) {
            revenueChart.destroy();
        }
        
        revenueChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Doanh Thu (₫)',
                    data: data,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return 'Doanh thu: ' + formatMoney(context.parsed.y) + ' ₫';
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return formatMoney(value) + ' ₫';
                            }
                        }
                    }
                }
            }
        });
    }
}

async function loadTopSellingProducts() {
    const container = document.getElementById('topProductsList');
    
    try {
        // Get seller's products
        const response = await apiService.getProducts({ 
            seller_id: currentSellerId,
            limit: 5
        });
        
        const products = response?.data?.products || [];
        
        if (products.length === 0) {
            container.innerHTML = '<div class="list-group-item border-0 py-3 text-center text-muted">Chưa có sản phẩm nào</div>';
            return;
        }
        
        container.innerHTML = products.map((product, index) => `
            <div class="list-group-item">
                <div class="product-item">
                    <img src="${product.image_url || '../../assets/images/products/demo.png'}" 
                         alt="${product.name}" 
                         class="rounded">
                    <div class="product-info">
                        <div class="product-name">${product.name}</div>
                        <div class="product-stats">
                            ${formatMoney(product.price)} ₫
                            ${product.discount_price ? ` • <span class="text-success">${formatMoney(product.discount_price)} ₫</span>` : ''}
                        </div>
                    </div>
                    <div class="badge bg-primary">#${index + 1}</div>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading top products:', error);
        container.innerHTML = '<div class="list-group-item border-0 py-3 text-center text-danger">Không thể tải dữ liệu</div>';
    }
}

async function loadRecentOrders() {
    const tbody = document.querySelector('#recentOrdersTable tbody');
    
    try {
        // Note: API doesn't have a seller-specific orders endpoint yet
        // You should create one in the backend
        // For now, we'll show a message
        
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-muted">
                    Chưa có đơn hàng nào
                </td>
            </tr>
        `;
        
    } catch (error) {
        console.error('Error loading recent orders:', error);
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-danger">
                    Không thể tải dữ liệu đơn hàng
                </td>
            </tr>
        `;
    }
}

// ===== TAB CONTENT LOADERS =====
async function loadMyProducts() {
    console.log('Loading my products...');
    showToast('Trang quản lý sản phẩm đang được phát triển', 'info');
}

async function loadMyOrders() {
    console.log('Loading my orders...');
    showToast('Trang quản lý đơn hàng đang được phát triển', 'info');
}

async function loadMyReviews() {
    console.log('Loading my reviews...');
    showToast('Trang quản lý đánh giá đang được phát triển', 'info');
}

// ===== UTILITY FUNCTIONS =====
function formatMoney(amount) {
    const num = Number(amount ?? 0);
    return num.toLocaleString('vi-VN', { maximumFractionDigits: 0 });
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getStatusBadge(status) {
    const statusMap = {
        'pending': 'Chờ xử lý',
        'processing': 'Đang xử lý',
        'shipped': 'Đã gửi',
        'delivered': 'Đã giao',
        'cancelled': 'Đã hủy'
    };
    
    return `<span class="badge status-${status}">${statusMap[status] || status}</span>`;
}

function showLoading() {
    // Show loading state if needed
    document.body.classList.add('loading');
}

function hideLoading() {
    document.body.classList.remove('loading');
}

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
    const toastColors = {
        'success': '#10b981',
        'error': '#ef4444',
        'warning': '#f59e0b',
        'info': '#3b82f6'
    };
    
    const toastHTML = `
        <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header">
                <div class="rounded me-2" style="width: 12px; height: 12px; background-color: ${toastColors[type] || toastColors.info};"></div>
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

// ===== EXPORT FUNCTIONS =====
window.sellerDashboard = {
    loadDashboard,
    loadMyProducts,
    loadMyOrders,
    loadMyReviews,
    refreshData: loadDashboard
};

