// Admin JavaScript - Complete Dashboard Management System
// Uses apiService from api-service.js for all API calls

// ===== GLOBAL VARIABLES =====
let products = [];
let orders = [];
let users = [];
let revenueChart = null;
let orderStatusChart = null;
let currentAdminId = null;

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin Dashboard initializing...');
    
    // Get admin info from token
    initializeAdminInfo();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize tabs
    initializeTabs();
    
    // Load dashboard
    loadDashboardFromAPI();
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
        console.error('Error initializing admin info:', error);
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
    
    // Refresh dashboard button
    window.refreshDashboard = function() {
        loadDashboardFromAPI();
        showToast('Đã làm mới dữ liệu', 'success');
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

// ===== DASHBOARD FUNCTIONS =====
function formatMoney(x) {
    const n = Number(x ?? 0);
    return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

async function loadDashboardFromAPI() {
    try {
        // Show loading state
        const cards = ['card_total_revenue', 'card_total_orders', 'card_total_users', 'card_total_products'];
        cards.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = 'Loading...';
        });

        // 1) Call parallel APIs: overview, revenue series, order status breakdown
        const [dash, rev, orders] = await Promise.all([
            apiService.getDashboardStats(),
            apiService.getRevenueStats({ period: 'day', limit: 30 }),
            apiService.getOrderStats()
        ]);

        // 2) Populate cards (overview)
        const ov = dash?.data?.overview || {};
        const revenueEl = document.getElementById('card_total_revenue');
        const ordersEl = document.getElementById('card_total_orders');
        const usersEl = document.getElementById('card_total_users');
        const productsEl = document.getElementById('card_total_products');

        if (revenueEl) revenueEl.textContent = formatMoney(ov.total_revenue) + ' ₫';
        if (ordersEl) ordersEl.textContent = ov.total_orders ?? '-';
        if (usersEl) usersEl.textContent = ov.total_users ?? '-';
        if (productsEl) productsEl.textContent = ov.total_products ?? '-';

        // 3) Revenue chart
        const revData = rev?.data?.data || [];
        const revLabels = revData.map(p => p.period || p.date || p.label);
        const revValues = revData.map(p => Number(p.revenue || p.total_revenue || p.amount || 0));

        updateRevenueChart(revLabels, revValues);

        // 4) Order status doughnut
        const breakdown = (orders?.data?.order_status_breakdown || []).map(x => ({
            label: x.status_label || x.status, 
            value: Number(x.count ?? 0)
        }));
        
        updateOrderStatusChart(breakdown);

        // 5) Load top products
        await loadTopProducts();

        // 6) Load recent orders
        await loadRecentOrders();

        showToast('Đã tải dữ liệu dashboard từ API', 'success');

    } catch (err) {
        console.error('Dashboard API Error:', err);
        if (err.message && (err.message.includes('401') || err.message.includes('403'))) {
            showToast('Bạn cần đăng nhập với tài khoản Admin để xem dashboard.', 'error');
        } else {
            showToast('Không thể tải dashboard. Vui lòng thử lại.', 'error');
        }
    }
}

function updateRevenueChart(labels, values) {
    const rctx = document.getElementById('revenueChart');
    if (rctx) {
        if (!revenueChart) {
            revenueChart = new Chart(rctx, {
                type: 'line',
                data: { 
                    labels: labels, 
                    datasets: [{ 
                        label: 'Revenue', 
                        data: values,
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4
                    }] 
                },
                options: { 
                    responsive: true, 
                    maintainAspectRatio: false, 
                    plugins: { legend: { display: false } },
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
        } else {
            revenueChart.data.labels = labels;
            revenueChart.data.datasets[0].data = values;
            revenueChart.update();
        }
    }
}

function updateOrderStatusChart(breakdown) {
    const sctx = document.getElementById('orderStatusChart');
    if (sctx && breakdown.length > 0) {
        if (!orderStatusChart) {
            orderStatusChart = new Chart(sctx, {
                type: 'doughnut',
                data: { 
                    labels: breakdown.map(b => b.label), 
                    datasets: [{ 
                        data: breakdown.map(b => b.value),
                        backgroundColor: [
                            '#10b981',
                            '#3b82f6', 
                            '#f59e0b',
                            '#ef4444',
                            '#6b7280'
                        ]
                    }] 
                },
                options: { 
                    responsive: true, 
                    maintainAspectRatio: false, 
                    plugins: { legend: { display: false } }
                }
            });
        } else {
            orderStatusChart.data.labels = breakdown.map(b => b.label);
            orderStatusChart.data.datasets[0].data = breakdown.map(b => b.value);
            orderStatusChart.update();
        }
    }
}

async function loadTopProducts() {
    try {
        const response = await apiService.getProductStats({ limit: 5 });
        const topProducts = response?.data?.top_products || [];
        
        const tbody = document.getElementById('topProductsTable');
        if (tbody) {
            if (topProducts.length === 0) {
                tbody.innerHTML = '<tr><td colspan="3" class="text-center text-muted">Chưa có dữ liệu sản phẩm</td></tr>';
                return;
            }
            
            tbody.innerHTML = topProducts.map(product => `
                <tr>
                    <td>
                        <div class="d-flex align-items-center">
                            <img src="${product.image_url || '../../assets/images/products/demo.png'}" 
                                 alt="${product.name}" 
                                 class="rounded me-3" 
                                 style="width: 40px; height: 40px; object-fit: cover;">
                            <div>
                                <div class="fw-semibold">${product.name || 'Không rõ'}</div>
                                <small class="text-muted">${product.category_name || 'Chưa phân loại'}</small>
                            </div>
                        </div>
                    </td>
                    <td>${product.total_sold || 0}</td>
                    <td class="fw-semibold">${formatMoney(product.total_revenue || 0)} ₫</td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading top products:', error);
        const tbody = document.getElementById('topProductsTable');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center text-danger">Không thể tải dữ liệu sản phẩm</td></tr>';
        }
    }
}

async function loadRecentOrders() {
    try {
        const response = await apiService.getAdminOrders({ page: 1, limit: 5 });
        const orders = response?.data?.orders || [];
        
        const container = document.getElementById('recentOrdersList');
        if (container) {
            if (orders.length === 0) {
                container.innerHTML = '<div class="list-group list-group-flush"><div class="list-group-item border-0 py-3 text-center text-muted">Chưa có đơn hàng nào</div></div>';
                return;
            }
            
            container.innerHTML = '<div class="list-group list-group-flush">' +
                orders.map(order => `
                    <div class="list-group-item border-0 py-3">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <div class="fw-semibold">#${order.id}</div>
                                <small class="text-muted">${order.user_name || 'Khách hàng'} • ${order.items_count || 0} sản phẩm</small>
                            </div>
                            <div class="text-end">
                                <div class="fw-semibold">${formatMoney(order.total_amount || 0)} ₫</div>
                                <span class="badge status-${order.status}">${order.status || 'pending'}</span>
                            </div>
                        </div>
                    </div>
                `).join('') +
            '</div>';
        }
    } catch (error) {
        console.error('Error loading recent orders:', error);
        const container = document.getElementById('recentOrdersList');
        if (container) {
            container.innerHTML = '<div class="list-group list-group-flush"><div class="list-group-item border-0 py-3 text-center text-danger">Không thể tải dữ liệu đơn hàng</div></div>';
        }
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
            'analytics': 'Phân Tích',
            'users': 'Quản Lý Người Dùng',
            'products': 'Quản Lý Sản Phẩm',
            'orders': 'Quản Lý Đơn Hàng',
            'payments': 'Quản Lý Thanh Toán',
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
                showToast('Trang quản lý người dùng đang được phát triển', 'info');
                break;
            case 'products':
                showToast('Trang quản lý sản phẩm đang được phát triển', 'info');
                break;
            case 'orders':
                showToast('Trang quản lý đơn hàng đang được phát triển', 'info');
                break;
            case 'payments':
                showToast('Trang quản lý thanh toán đang được phát triển', 'info');
                break;
            case 'reviews':
                showToast('Trang quản lý đánh giá đang được phát triển', 'info');
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


