// Admin JavaScript - Complete Dashboard Management System
// Uses apiService from api-service.js for all API calls

// ===== GLOBAL VARIABLES =====
let products = [];
let orders = [];
let users = [];
let revenueChart = null;
let orderStatusChart = null;
let currentAdminId = null;

// Admin Products Management
let adminProducts = [];
let adminCurrentPage = 1;
let adminTotalPages = 1;
let adminProductsPerPage = 10;
let adminSearchQuery = '';
let adminProductToDelete = null;

// Admin Orders Management
let adminOrders = [];
let adminOrdersCurrentPage = 1;
let adminOrdersTotalPages = 1;
let adminOrdersPerPage = 10;
let adminOrdersSearchQuery = '';
let adminOrdersStatusFilter = '';
let adminOrderToUpdate = null;

// Admin Users Management
let adminUsers = [];
let adminUsersCurrentPage = 1;
let adminUsersTotalPages = 1;
let adminUsersPerPage = 10;
let adminUsersSearchQuery = '';
let adminUsersRoleFilter = '';
let adminUserToDelete = null;

// ===== ADMIN REVIEWS MANAGEMENT =====
let adminReviews = [];
let adminReviewsCurrentPage = 1;
let adminReviewsTotalPages = 1;
let adminReviewsPerPage = 10;
let adminReviewsSearchQuery = '';
let adminReviewsRatingFilter = '';
let adminReviewsProductFilter = '';
let adminReviewToDelete = null;

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

        // 5) Load top products using dedicated API
        await loadTopProducts();

        // 6) Load recent orders
        await loadRecentOrders();

        // 7) Load recent activity
        await loadRecentActivity();

        // 8) Load featured products
        await loadFeaturedProducts();

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

async function loadRecentActivity() {
    try {
        const response = await apiService.getRecentActivity(5);
        const activities = response?.data?.activities || [];
        
        const container = document.getElementById('recentActivityList');
        if (container) {
            if (activities.length === 0) {
                container.innerHTML = '<p class="text-muted text-center">Không có hoạt động gần đây</p>';
                return;
            }
            
            container.innerHTML = activities.map(activity => `
                <div class="d-flex align-items-center mb-3">
                    <div class="activity-icon me-3">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12,6 12,12 16,14"></polyline>
                        </svg>
                    </div>
                    <div class="flex-grow-1">
                        <div class="fw-semibold">${activity.description || 'Hoạt động'}</div>
                        <small class="text-muted">${formatDate(activity.created_at)}</small>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading recent activity:', error);
    }
}

async function loadFeaturedProducts() {
    try {
        const response = await apiService.getFeaturedProducts(5);
        const featuredProducts = response?.data?.products || [];
        
        const container = document.getElementById('featuredProductsList');
        if (container) {
            if (featuredProducts.length === 0) {
                container.innerHTML = '<p class="text-muted text-center">Không có sản phẩm nổi bật</p>';
                return;
            }
            
            container.innerHTML = featuredProducts.map((product, index) => `
                <div class="d-flex align-items-center mb-3">
                    <div class="me-3">
                        <span class="badge bg-primary rounded-circle d-flex align-items-center justify-content-center" style="width: 30px; height: 30px;">
                            ${index + 1}
                        </span>
                    </div>
                    <div class="flex-grow-1">
                        <div class="fw-semibold">${product.name || 'N/A'}</div>
                        <small class="text-muted">${formatMoney(product.price || 0)} ₫</small>
                    </div>
                    <div class="text-end">
                        <small class="text-success">⭐ ${product.avg_rating || '0.0'}</small>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading featured products:', error);
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

// ===== ADMIN PRODUCTS MANAGEMENT =====
async function loadAdminProducts() {
    const loading = document.getElementById('adminProductsLoading');
    const tableContainer = document.getElementById('adminProductsTableContainer');
    const emptyState = document.getElementById('adminProductsEmptyState');
    
    try {
        // Show loading
        loading.classList.remove('d-none');
        tableContainer.classList.add('d-none');
        emptyState.classList.add('d-none');
        
        // Get ALL products from API
        const response = await apiService.getProducts({ limit: 100 });
        
        adminProducts = response?.data?.products || [];
        
        // Hide loading
        loading.classList.add('d-none');
        
        if (adminProducts.length === 0) {
            emptyState.classList.remove('d-none');
        } else {
            tableContainer.classList.remove('d-none');
            renderAdminProductsTable();
        }
        
    } catch (error) {
        console.error('Error loading products:', error);
        loading.classList.add('d-none');
        showToast('Không thể tải danh sách sản phẩm', 'error');
    }
}

function renderAdminProductsTable() {
    const tbody = document.getElementById('adminProductsTableBody');
    const pagination = document.getElementById('adminProductsPagination');
    
    if (!tbody) return;
    
    // Filter products by search query
    let filteredProducts = adminProducts;
    if (adminSearchQuery) {
        filteredProducts = adminProducts.filter(p => 
            p.name.toLowerCase().includes(adminSearchQuery) ||
            (p.description && p.description.toLowerCase().includes(adminSearchQuery)) ||
            (p.seller_name && p.seller_name.toLowerCase().includes(adminSearchQuery))
        );
    }
    
    // Calculate pagination
    adminTotalPages = Math.ceil(filteredProducts.length / adminProductsPerPage);
    const startIndex = (adminCurrentPage - 1) * adminProductsPerPage;
    const endIndex = startIndex + adminProductsPerPage;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
    
    // Render table rows
    if (paginatedProducts.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-4 text-muted">
                    ${adminSearchQuery ? 'Không tìm thấy sản phẩm phù hợp' : 'Chưa có sản phẩm nào'}
                </td>
            </tr>
        `;
        pagination.classList.add('d-none');
        return;
    }
    
    tbody.innerHTML = paginatedProducts.map((product, index) => {
        const globalIndex = startIndex + index + 1;
        const statusBadge = getProductStatusBadge(product.status || 'available');
        const sellerName = product.seller_name || `User #${product.seller_id || 'N/A'}`;
        
        return `
            <tr>
                <td>${globalIndex}</td>
                <td>
                    <img src="${product.image_url || '../../assets/images/products/demo.png'}" 
                         alt="${product.name}" 
                         class="rounded"
                         style="width: 50px; height: 50px; object-fit: cover;"
                         onerror="this.src='../../assets/images/products/demo.png'">
                </td>
                <td>
                    <div class="fw-semibold">${product.name}</div>
                    ${product.description ? `<small class="text-muted">${product.description.substring(0, 50)}${product.description.length > 50 ? '...' : ''}</small>` : ''}
                </td>
                <td>
                    <small class="text-muted">${sellerName}</small>
                </td>
                <td>
                    <div class="fw-semibold">${formatMoney(product.price)} ₫</div>
                    ${product.discount_price ? `<small class="text-success">${formatMoney(product.discount_price)} ₫</small>` : ''}
                </td>
                <td>
                    <span class="badge ${product.quantity > 0 ? 'bg-success' : 'bg-danger'}">${product.quantity}</span>
                </td>
                <td>${statusBadge}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="showAdminEditProductModal(${product.id})" title="Chỉnh sửa">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="showAdminDeleteProductModal(${product.id}, '${product.name.replace(/'/g, "\\'")}')  " title="Xóa">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    // Setup pagination
    if (adminTotalPages > 1) {
        setupAdminProductsPagination(adminTotalPages);
        pagination.classList.remove('d-none');
    } else {
        pagination.classList.add('d-none');
    }
}

function setupAdminProductsPagination(totalPages) {
    const paginationList = document.getElementById('adminProductsPaginationList');
    if (!paginationList) return;
    
    let paginationHTML = '';
    
    // Previous button
    paginationHTML += `
        <li class="page-item ${adminCurrentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changeAdminPage(${adminCurrentPage - 1}); return false;">Trước</a>
        </li>
    `;
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= adminCurrentPage - 1 && i <= adminCurrentPage + 1)) {
            paginationHTML += `
                <li class="page-item ${i === adminCurrentPage ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="changeAdminPage(${i}); return false;">${i}</a>
                </li>
            `;
        } else if (i === adminCurrentPage - 2 || i === adminCurrentPage + 2) {
            paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
    }
    
    // Next button
    paginationHTML += `
        <li class="page-item ${adminCurrentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changeAdminPage(${adminCurrentPage + 1}); return false;">Sau</a>
        </li>
    `;
    
    paginationList.innerHTML = paginationHTML;
}

window.changeAdminPage = function(page) {
    if (page < 1 || page > adminTotalPages) return;
    adminCurrentPage = page;
    renderAdminProductsTable();
};

window.showAdminAddProductModal = function() {
    // Reset form
    document.getElementById('adminProductForm').reset();
    document.getElementById('adminProductId').value = '';
    document.getElementById('adminProductImagePreviewContainer').style.display = 'none';
    
    // Update modal title
    document.getElementById('adminProductModalTitle').textContent = 'Thêm Sản Phẩm Mới';
    
    // Remove validation classes
    const form = document.getElementById('adminProductForm');
    form.classList.remove('was-validated');
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('adminProductModal'));
    modal.show();
};

window.showAdminEditProductModal = async function(productId) {
    try {
        // Find product in local array
        const product = adminProducts.find(p => p.id === productId);
        
        if (!product) {
            showToast('Không tìm thấy sản phẩm', 'error');
            return;
        }
        
        // Fill form
        document.getElementById('adminProductId').value = product.id;
        document.getElementById('adminProductName').value = product.name;
        document.getElementById('adminProductDescription').value = product.description || '';
        document.getElementById('adminProductPrice').value = product.price;
        document.getElementById('adminProductDiscountPrice').value = product.discount_price || '';
        document.getElementById('adminProductQuantity').value = product.quantity;
        document.getElementById('adminProductImageUrl').value = product.image_url || '';
        document.getElementById('adminProductCategory').value = product.category_id || '';
        document.getElementById('adminProductStatus').value = product.status || 'available';
        
        // Show image preview if has URL
        if (product.image_url) {
            const preview = document.getElementById('adminProductImagePreview');
            preview.src = product.image_url;
            preview.onload = function() {
                document.getElementById('adminProductImagePreviewContainer').style.display = 'block';
            };
        }
        
        // Update modal title
        document.getElementById('adminProductModalTitle').textContent = 'Chỉnh Sửa Sản Phẩm';
        
        // Remove validation classes
        const form = document.getElementById('adminProductForm');
        form.classList.remove('was-validated');
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('adminProductModal'));
        modal.show();
        
    } catch (error) {
        console.error('Error showing edit modal:', error);
        showToast('Không thể tải thông tin sản phẩm', 'error');
    }
};

window.saveAdminProduct = async function() {
    const form = document.getElementById('adminProductForm');
    
    // Validate form
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }
    
    try {
        // Get form data
        const productId = document.getElementById('adminProductId').value;
        const productData = {
            name: document.getElementById('adminProductName').value.trim(),
            description: document.getElementById('adminProductDescription').value.trim(),
            price: parseFloat(document.getElementById('adminProductPrice').value),
            discount_price: document.getElementById('adminProductDiscountPrice').value ? parseFloat(document.getElementById('adminProductDiscountPrice').value) : null,
            quantity: parseInt(document.getElementById('adminProductQuantity').value),
            image_url: document.getElementById('adminProductImageUrl').value.trim(),
            category_id: parseInt(document.getElementById('adminProductCategory').value),
            status: document.getElementById('adminProductStatus').value
        };
        
        // Show loading
        const saveButton = event.target;
        const originalText = saveButton.innerHTML;
        saveButton.disabled = true;
        saveButton.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Đang lưu...';
        
        let response;
        if (productId) {
            // Update existing product
            response = await apiService.updateProduct(productId, productData);
            showToast('Cập nhật sản phẩm thành công', 'success');
        } else {
            // Create new product
            response = await apiService.createProduct(productData);
            showToast('Thêm sản phẩm thành công', 'success');
        }
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('adminProductModal'));
        modal.hide();
        
        // Reload products
        await loadAdminProducts();
        
        // Restore button
        saveButton.disabled = false;
        saveButton.innerHTML = originalText;
        
    } catch (error) {
        console.error('Error saving product:', error);
        showToast(error.message || 'Không thể lưu sản phẩm', 'error');
        
        // Restore button
        const saveButton = event.target;
        saveButton.disabled = false;
        saveButton.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="me-1"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>Lưu';
    }
};

window.showAdminDeleteProductModal = function(productId, productName) {
    adminProductToDelete = productId;
    document.getElementById('adminDeleteProductName').textContent = productName;
    
    const modal = new bootstrap.Modal(document.getElementById('adminDeleteProductModal'));
    modal.show();
};

window.confirmAdminDeleteProduct = async function() {
    if (!adminProductToDelete) return;
    
    try {
        // Show loading
        const deleteButton = event.target;
        const originalText = deleteButton.innerHTML;
        deleteButton.disabled = true;
        deleteButton.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Đang xóa...';
        
        // Delete product
        await apiService.deleteProduct(adminProductToDelete);
        
        showToast('Xóa sản phẩm thành công', 'success');
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('adminDeleteProductModal'));
        modal.hide();
        
        // Reload products
        await loadAdminProducts();
        
        adminProductToDelete = null;
        
        // Restore button
        deleteButton.disabled = false;
        deleteButton.innerHTML = originalText;
        
    } catch (error) {
        console.error('Error deleting product:', error);
        showToast(error.message || 'Không thể xóa sản phẩm', 'error');
        
        // Restore button
        const deleteButton = event.target;
        deleteButton.disabled = false;
        deleteButton.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="me-1"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>Xóa';
    }
};

function getProductStatusBadge(status) {
    const statusMap = {
        'available': { text: 'Còn hàng', class: 'bg-success' },
        'out_of_stock': { text: 'Hết hàng', class: 'bg-danger' },
        'discontinued': { text: 'Ngừng KD', class: 'bg-secondary' }
    };
    
    const statusInfo = statusMap[status] || statusMap['available'];
    return `<span class="badge ${statusInfo.class}">${statusInfo.text}</span>`;
}

// ===== ADMIN ORDERS MANAGEMENT =====
async function loadAdminOrders() {
    const loading = document.getElementById('adminOrdersLoading');
    const tableContainer = document.getElementById('adminOrdersTableContainer');
    const emptyState = document.getElementById('adminOrdersEmptyState');
    
    try {
        // Show loading
        loading.classList.remove('d-none');
        tableContainer.classList.add('d-none');
        emptyState.classList.add('d-none');
        
        // Get ALL orders from API
        const queryParams = {
            page: adminOrdersCurrentPage,
            limit: adminOrdersPerPage
        };
        
        // Only add status filter if it has a value
        if (adminOrdersStatusFilter && adminOrdersStatusFilter.trim() !== '') {
            queryParams.status = adminOrdersStatusFilter;
        }
        
        const response = await apiService.getAdminOrders(queryParams);
        
        adminOrders = response?.data?.orders || [];
        
        // Update pagination info
        if (response?.data?.pagination) {
            adminOrdersTotalPages = response.data.pagination.total_pages || 1;
            adminOrdersCurrentPage = response.data.pagination.current_page || 1;
        }
        
        // Hide loading
        loading.classList.add('d-none');
        
        if (adminOrders.length === 0) {
            emptyState.classList.remove('d-none');
        } else {
            tableContainer.classList.remove('d-none');
            renderAdminOrdersTable();
        }
        
    } catch (error) {
        console.error('Error loading orders:', error);
        loading.classList.add('d-none');
        showToast('Không thể tải danh sách đơn hàng', 'error');
    }
}

function renderAdminOrdersTable() {
    const tbody = document.getElementById('adminOrdersTableBody');
    const pagination = document.getElementById('adminOrdersPagination');
    
    if (!tbody) return;
    
    // Render table rows (no client-side filtering for server-side pagination)
    if (adminOrders.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-4 text-muted">
                    ${adminOrdersSearchQuery || adminOrdersStatusFilter ? 'Không tìm thấy đơn hàng phù hợp' : 'Chưa có đơn hàng nào'}
                </td>
            </tr>
        `;
        pagination.classList.add('d-none');
        return;
    }
    
    tbody.innerHTML = adminOrders.map((order, index) => {
        const globalIndex = (adminOrdersCurrentPage - 1) * adminOrdersPerPage + index + 1;
        const statusBadge = getOrderStatusBadge(order.status);
        const customerName = `User #${order.user_id || 'N/A'}`;
        const sellerName = `User #${order.seller_id || 'N/A'}`;
        
        return `
            <tr>
                <td>${globalIndex}</td>
                <td><strong>#${order.id}</strong></td>
                <td>
                    <div class="fw-semibold">${customerName}</div>
                    <small class="text-muted">-</small>
                </td>
                <td>
                    <small class="text-muted">${sellerName}</small>
                </td>
                <td>
                    <div class="fw-semibold">${formatMoney(order.total_amount)} ₫</div>
                </td>
                <td>${statusBadge}</td>
                <td>
                    <small class="text-muted">${formatDate(order.created_at)}</small>
                </td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-info me-1" onclick="showAdminOrderDetail(${order.id})" title="Xem chi tiết">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    </button>
                    <button class="btn btn-sm btn-outline-warning" onclick="showAdminUpdateOrderStatusModal(${order.id}, '${order.status}')" title="Cập nhật trạng thái">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    // Setup pagination
    if (adminOrdersTotalPages > 1) {
        setupAdminOrdersPagination(adminOrdersTotalPages);
        pagination.classList.remove('d-none');
    } else {
        pagination.classList.add('d-none');
    }
}

function setupAdminOrdersPagination(totalPages) {
    const paginationList = document.getElementById('adminOrdersPaginationList');
    if (!paginationList) return;
    
    let paginationHTML = '';
    
    // Previous button
    paginationHTML += `
        <li class="page-item ${adminOrdersCurrentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changeAdminOrdersPage(${adminOrdersCurrentPage - 1}); return false;">Trước</a>
        </li>
    `;
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= adminOrdersCurrentPage - 1 && i <= adminOrdersCurrentPage + 1)) {
            paginationHTML += `
                <li class="page-item ${i === adminOrdersCurrentPage ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="changeAdminOrdersPage(${i}); return false;">${i}</a>
                </li>
            `;
        } else if (i === adminOrdersCurrentPage - 2 || i === adminOrdersCurrentPage + 2) {
            paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
    }
    
    // Next button
    paginationHTML += `
        <li class="page-item ${adminOrdersCurrentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changeAdminOrdersPage(${adminOrdersCurrentPage + 1}); return false;">Sau</a>
        </li>
    `;
    
    paginationList.innerHTML = paginationHTML;
}

window.changeAdminOrdersPage = function(page) {
    if (page < 1 || page > adminOrdersTotalPages) return;
    adminOrdersCurrentPage = page;
    loadAdminOrders();
};

window.showAdminOrderDetail = async function(orderId) {
    try {
        // Get order details from API
        const response = await apiService.getOrderDetail(orderId);
        const order = response.data;
        
        // Enrich order detail with user info
        await enrichOrderDetailWithUserInfo(order);
        
        // Fill order info
        document.getElementById('adminOrderDetailId').textContent = `#${order.id}`;
        document.getElementById('adminOrderDetailStatus').innerHTML = getOrderStatusBadge(order.status);
        document.getElementById('adminOrderDetailDate').textContent = formatDate(order.created_at);
        document.getElementById('adminOrderDetailCustomer').textContent = order.customer_name || `User #${order.user_id}`;
        document.getElementById('adminOrderDetailEmail').textContent = order.customer_email || '-';
        document.getElementById('adminOrderDetailPhone').textContent = order.customer_phone || '-';
        document.getElementById('adminOrderDetailTotal').textContent = `${formatMoney(order.total_amount)} ₫`;
        
        // Fill seller info
        document.getElementById('adminOrderDetailSeller').textContent = order.seller_name || `User #${order.seller_id || 'N/A'}`;
        document.getElementById('adminOrderDetailSellerEmail').textContent = order.seller_email || '-';
        document.getElementById('adminOrderDetailAddress').textContent = order.shipping_address || '-';
        
        // Fill order items
        const itemsTbody = document.getElementById('adminOrderItemsTableBody');
        itemsTbody.innerHTML = order.items.map(item => `
            <tr>
                <td>
                    <div class="d-flex align-items-center">
                        <img src="${item.product_image || '../../assets/images/products/demo.png'}" 
                             alt="${item.product_name}" 
                             class="rounded me-2"
                             style="width: 40px; height: 40px; object-fit: cover;"
                             onerror="this.src='../../assets/images/products/demo.png'">
                        <div>
                            <div class="fw-semibold">${item.product_name}</div>
                            <small class="text-muted">${item.product_description || ''}</small>
                        </div>
                    </div>
                </td>
                <td>${item.quantity}</td>
                <td>${formatMoney(item.price)} ₫</td>
                <td>${formatMoney(item.price * item.quantity)} ₫</td>
            </tr>
        `).join('');
        
        // Setup status actions
        const statusActions = document.getElementById('adminOrderStatusActions');
        statusActions.innerHTML = `
            <button class="btn btn-warning" onclick="showAdminUpdateOrderStatusModal(${order.id}, '${order.status}')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="me-1">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                Cập Nhật Trạng Thái
            </button>
        `;
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('adminOrderDetailModal'));
        modal.show();
        
    } catch (error) {
        console.error('Error loading order details:', error);
        showToast('Không thể tải chi tiết đơn hàng', 'error');
    }
};

window.showAdminUpdateOrderStatusModal = function(orderId, currentStatus) {
    adminOrderToUpdate = orderId;
    
    // Set current order ID
    document.getElementById('adminUpdateOrderId').textContent = `#${orderId}`;
    
    // Set current status in select
    const statusSelect = document.getElementById('adminNewOrderStatus');
    statusSelect.value = currentStatus;
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('adminUpdateOrderStatusModal'));
    modal.show();
};

window.confirmAdminUpdateOrderStatus = async function() {
    if (!adminOrderToUpdate) return;
    
    try {
        const newStatus = document.getElementById('adminNewOrderStatus').value;
        
        // Show loading
        const updateButton = event.target;
        const originalText = updateButton.innerHTML;
        updateButton.disabled = true;
        updateButton.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Đang cập nhật...';
        
        // Update order status
        await apiService.updateOrderStatus(adminOrderToUpdate, newStatus);
        
        showToast('Cập nhật trạng thái đơn hàng thành công', 'success');
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('adminUpdateOrderStatusModal'));
        modal.hide();
        
        // Reload orders
        await loadAdminOrders();
        
        adminOrderToUpdate = null;
        
        // Restore button
        updateButton.disabled = false;
        updateButton.innerHTML = originalText;
        
    } catch (error) {
        console.error('Error updating order status:', error);
        showToast(error.message || 'Không thể cập nhật trạng thái đơn hàng', 'error');
        
        // Restore button
        const updateButton = event.target;
        updateButton.disabled = false;
        updateButton.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="me-1"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>Cập Nhật';
    }
};

function getOrderStatusBadge(status) {
    const statusMap = {
        'pending': { text: 'Chờ xử lý', class: 'bg-warning' },
        'processing': { text: 'Đang xử lý', class: 'bg-info' },
        'shipped': { text: 'Đã gửi', class: 'bg-primary' },
        'delivered': { text: 'Đã giao', class: 'bg-success' },
        'cancelled': { text: 'Đã hủy', class: 'bg-danger' }
    };
    
    const statusInfo = statusMap[status] || statusMap['pending'];
    return `<span class="badge ${statusInfo.class}">${statusInfo.text}</span>`;
}

// ===== UTILITY FUNCTIONS =====

// Enrich single order detail with user info
async function enrichOrderDetailWithUserInfo(order) {
    try {
        // Get user info
        if (order.user_id) {
            const userResponse = await apiService.getUserById(order.user_id);
            if (userResponse?.data) {
                order.customer_name = userResponse.data.username || userResponse.data.fullName;
                order.customer_email = userResponse.data.email;
                order.customer_phone = userResponse.data.phone;
            }
        }
        
        // Get seller info (if different from user)
        if (order.seller_id && order.seller_id !== order.user_id) {
            const sellerResponse = await apiService.getUserById(order.seller_id);
            if (sellerResponse?.data) {
                order.seller_name = sellerResponse.data.username || sellerResponse.data.fullName;
                order.seller_email = sellerResponse.data.email;
            }
        }
    } catch (error) {
        console.warn(`Failed to get user info for order detail ${order.id}:`, error);
    }
}

// ===== ADMIN USERS MANAGEMENT =====
async function loadAdminUsers() {
    const loading = document.getElementById('adminUsersLoading');
    const tableContainer = document.getElementById('adminUsersTableContainer');
    const emptyState = document.getElementById('adminUsersEmptyState');
    
    try {
        // Show loading
        loading.classList.remove('d-none');
        tableContainer.classList.add('d-none');
        emptyState.classList.add('d-none');
        
        // Get ALL users from API (no server-side role filter)
        const queryParams = {
            page: adminUsersCurrentPage,
            limit: adminUsersPerPage
        };
        
        // Note: Backend doesn't support role filter, so we'll filter client-side
        
        const response = await apiService.getUsers(queryParams);
        
        adminUsers = response?.data?.users || [];
        
        // Update pagination info
        if (response?.data?.pagination) {
            adminUsersTotalPages = response.data.pagination.total_pages || 1;
            adminUsersCurrentPage = response.data.pagination.current_page || 1;
        }
        
        // Hide loading
        loading.classList.add('d-none');
        
        if (adminUsers.length === 0) {
            emptyState.classList.remove('d-none');
        } else {
            tableContainer.classList.remove('d-none');
            renderAdminUsersTable();
        }
        
    } catch (error) {
        console.error('Error loading users:', error);
        loading.classList.add('d-none');
        showToast('Không thể tải danh sách người dùng', 'error');
    }
}

function renderAdminUsersTable() {
    const tbody = document.getElementById('adminUsersTableBody');
    const pagination = document.getElementById('adminUsersPagination');
    
    if (!tbody) return;
    
    // Filter users by search query and role
    let filteredUsers = adminUsers;
    
    // Filter by search query
    if (adminUsersSearchQuery) {
        filteredUsers = filteredUsers.filter(user => 
            (user.username && user.username.toLowerCase().includes(adminUsersSearchQuery)) ||
            (user.email && user.email.toLowerCase().includes(adminUsersSearchQuery)) ||
            (user.fullName && user.fullName.toLowerCase().includes(adminUsersSearchQuery))
        );
    }
    
    // Filter by role
    if (adminUsersRoleFilter && adminUsersRoleFilter.trim() !== '') {
        filteredUsers = filteredUsers.filter(user => user.role === adminUsersRoleFilter);
    }
    
    // Render table rows
    if (filteredUsers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-4 text-muted">
                    ${adminUsersSearchQuery || adminUsersRoleFilter ? 'Không tìm thấy người dùng phù hợp' : 'Chưa có người dùng nào'}
                </td>
            </tr>
        `;
        pagination.classList.add('d-none');
        return;
    }
    
    tbody.innerHTML = filteredUsers.map((user, index) => {
        const globalIndex = (adminUsersCurrentPage - 1) * adminUsersPerPage + index + 1;
        const roleBadge = getUserRoleBadge(user.role);
        const statusBadge = getUserStatusBadge(user.status);
        const avatarUrl = user.avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNmOGY5ZmEiLz4KPHBhdGggZD0iTTIwIDEwQzIyLjc2MTQgMTAgMjUgMTIuMjM4NiAyNSAxNUMyNSAxNy43NjE0IDIyLjc2MTQgMjAgMjAgMjBDMTcuMjM4NiAyMCAxNSAxNy43NjE0IDE1IDE1QzE1IDEyLjIzODYgMTcuMjM4NiAxMCAyMCAxMFoiIGZpbGw9IiM5Y2EzYWYiLz4KPHBhdGggZD0iTTEyIDMwQzEyIDI2LjY4NjMgMTUuNjg2MyAyMyAyMCAyM0MyNC4zMTM3IDIzIDI4IDI2LjY4NjMgMjggMzBWMzJIMTJWMzBaIiBmaWxsPSIjOWNhM2FmIi8+Cjwvc3ZnPgo=';
        
        return `
            <tr>
                <td>${globalIndex}</td>
                <td>
                    <img src="${avatarUrl}" 
                         alt="${user.username}" 
                         class="rounded-circle"
                         style="width: 40px; height: 40px; object-fit: cover;"
                         onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNmOGY5ZmEiLz4KPHBhdGggZD0iTTIwIDEwQzIyLjc2MTQgMTAgMjUgMTIuMjM4NiAyNSAxNUMyNSAxNy43NjE0IDIyLjc2MTQgMjAgMjAgMjBDMTcuMjM4NiAyMCAxNSAxNy43NjE0IDE1IDE1QzE1IDEyLjIzODYgMTcuMjM4NiAxMCAyMCAxMFoiIGZpbGw9IiM5Y2EzYWYiLz4KPHBhdGggZD0iTTEyIDMwQzEyIDI2LjY4NjMgMTUuNjg2MyAyMyAyMCAyM0MyNC4zMTM3IDIzIDI4IDI2LjY4NjMgMjggMzBWMzJIMTJWMzBaIiBmaWxsPSIjOWNhM2FmIi8+Cjwvc3ZnPgo='">
                </td>
                <td>
                    <div class="fw-semibold">${user.username || 'N/A'}</div>
                    ${user.fullName ? `<small class="text-muted">${user.fullName}</small>` : ''}
                </td>
                <td>
                    <small class="text-muted">${user.email || '-'}</small>
                </td>
                <td>${roleBadge}</td>
                <td>${statusBadge}</td>
                <td>
                    <small class="text-muted">${formatDate(user.created_at)}</small>
                </td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="showAdminEditUserModal(${user.id})" title="Chỉnh sửa">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="showAdminDeleteUserModal(${user.id}, '${user.username}')" title="Xóa">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    // Setup pagination
    if (adminUsersTotalPages > 1) {
        setupAdminUsersPagination(adminUsersTotalPages);
        pagination.classList.remove('d-none');
    } else {
        pagination.classList.add('d-none');
    }
}

function setupAdminUsersPagination(totalPages) {
    const paginationList = document.getElementById('adminUsersPaginationList');
    if (!paginationList) return;
    
    let paginationHTML = '';
    
    // Previous button
    paginationHTML += `
        <li class="page-item ${adminUsersCurrentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changeAdminUsersPage(${adminUsersCurrentPage - 1}); return false;">Trước</a>
        </li>
    `;
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= adminUsersCurrentPage - 1 && i <= adminUsersCurrentPage + 1)) {
            paginationHTML += `
                <li class="page-item ${i === adminUsersCurrentPage ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="changeAdminUsersPage(${i}); return false;">${i}</a>
                </li>
            `;
        } else if (i === adminUsersCurrentPage - 2 || i === adminUsersCurrentPage + 2) {
            paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
    }
    
    // Next button
    paginationHTML += `
        <li class="page-item ${adminUsersCurrentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changeAdminUsersPage(${adminUsersCurrentPage + 1}); return false;">Sau</a>
        </li>
    `;
    
    paginationList.innerHTML = paginationHTML;
}

window.changeAdminUsersPage = function(page) {
    if (page < 1 || page > adminUsersTotalPages) return;
    adminUsersCurrentPage = page;
    loadAdminUsers();
};

window.showAdminAddUserModal = function() {
    // Reset form
    document.getElementById('adminUserForm').reset();
    document.getElementById('adminUserId').value = '';
    document.getElementById('adminUserModalTitle').textContent = 'Thêm Người Dùng Mới';
    
    // Show password fields for new user
    document.getElementById('adminUserPasswordField').style.display = 'block';
    document.getElementById('adminUserPasswordConfirmField').style.display = 'block';
    document.getElementById('adminUserPassword').required = true;
    document.getElementById('adminUserPasswordConfirm').required = true;
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('adminUserModal'));
    modal.show();
};

window.showAdminEditUserModal = async function(userId) {
    try {
        // Get user details
        const response = await apiService.getUserById(userId);
        const user = response.data;
        
        // Fill form
        document.getElementById('adminUserId').value = user.id;
        document.getElementById('adminUserUsername').value = user.username || '';
        document.getElementById('adminUserEmail').value = user.email || '';
        document.getElementById('adminUserFullName').value = user.fullName || '';
        document.getElementById('adminUserPhone').value = user.phone || '';
        document.getElementById('adminUserRole').value = user.role || '';
        document.getElementById('adminUserStatus').value = user.status || 'active';
        
        // Set modal title
        document.getElementById('adminUserModalTitle').textContent = 'Chỉnh Sửa Người Dùng';
        
        // Hide password fields for edit
        document.getElementById('adminUserPasswordField').style.display = 'none';
        document.getElementById('adminUserPasswordConfirmField').style.display = 'none';
        document.getElementById('adminUserPassword').required = false;
        document.getElementById('adminUserPasswordConfirm').required = false;
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('adminUserModal'));
        modal.show();
        
    } catch (error) {
        console.error('Error loading user details:', error);
        showToast('Không thể tải thông tin người dùng', 'error');
    }
};

window.saveAdminUser = async function() {
    try {
        const form = document.getElementById('adminUserForm');
        const formData = new FormData(form);
        
        // Validate form
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }
        
        // Check password confirmation for new user
        const userId = document.getElementById('adminUserId').value;
        const password = document.getElementById('adminUserPassword').value;
        const passwordConfirm = document.getElementById('adminUserPasswordConfirm').value;
        
        if (!userId && password !== passwordConfirm) {
            document.getElementById('adminUserPasswordConfirm').setCustomValidity('Mật khẩu xác nhận không khớp');
            form.classList.add('was-validated');
            return;
        }
        
        // Collect data
        const userData = {
            username: formData.get('username'),
            email: formData.get('email'),
            fullName: formData.get('fullName'),
            phone: formData.get('phone'),
            role: formData.get('role'),
            status: formData.get('status')
        };
        
        // Add password for new user
        if (!userId && password) {
            userData.password = password;
        }
        
        // Show loading
        const saveButton = event.target;
        const originalText = saveButton.innerHTML;
        saveButton.disabled = true;
        saveButton.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Đang lưu...';
        
        // Save user
        if (userId) {
            await apiService.updateUser(userId, userData);
            showToast('Cập nhật người dùng thành công', 'success');
        } else {
            await apiService.createUser(userData);
            showToast('Thêm người dùng thành công', 'success');
        }
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('adminUserModal'));
        modal.hide();
        
        // Reload users
        await loadAdminUsers();
        
        // Restore button
        saveButton.disabled = false;
        saveButton.innerHTML = originalText;
        
    } catch (error) {
        console.error('Error saving user:', error);
        showToast(error.message || 'Không thể lưu người dùng', 'error');
        
        // Restore button
        const saveButton = event.target;
        saveButton.disabled = false;
        saveButton.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="me-1"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17,21 17,13 7,13 7,21"></polyline><polyline points="7,3 7,8 15,8"></polyline></svg>Lưu';
    }
};

window.showAdminDeleteUserModal = function(userId, username) {
    adminUserToDelete = userId;
    document.getElementById('adminDeleteUserName').textContent = username;
    
    const modal = new bootstrap.Modal(document.getElementById('adminDeleteUserModal'));
    modal.show();
};

window.confirmAdminDeleteUser = async function() {
    if (!adminUserToDelete) return;
    
    try {
        // Show loading
        const deleteButton = event.target;
        const originalText = deleteButton.innerHTML;
        deleteButton.disabled = true;
        deleteButton.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Đang xóa...';
        
        // Delete user
        await apiService.deleteUser(adminUserToDelete);
        
        showToast('Xóa người dùng thành công', 'success');
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('adminDeleteUserModal'));
        modal.hide();
        
        // Reload users
        await loadAdminUsers();
        
        adminUserToDelete = null;
        
        // Restore button
        deleteButton.disabled = false;
        deleteButton.innerHTML = originalText;
        
    } catch (error) {
        console.error('Error deleting user:', error);
        showToast(error.message || 'Không thể xóa người dùng', 'error');
        
        // Restore button
        const deleteButton = event.target;
        deleteButton.disabled = false;
        deleteButton.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="me-1"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>Xóa';
    }
};

function getUserRoleBadge(role) {
    const roleMap = {
        'user': { text: 'Người dùng', class: 'bg-primary' },
        'seller': { text: 'Người bán', class: 'bg-success' },
        'admin': { text: 'Quản trị viên', class: 'bg-danger' }
    };
    
    const roleInfo = roleMap[role] || roleMap['user'];
    return `<span class="badge ${roleInfo.class}">${roleInfo.text}</span>`;
}

function getUserStatusBadge(status) {
    const statusMap = {
        'active': { text: 'Hoạt động', class: 'bg-success' },
        'inactive': { text: 'Không hoạt động', class: 'bg-secondary' },
        'banned': { text: 'Bị cấm', class: 'bg-danger' }
    };
    
    const statusInfo = statusMap[status] || statusMap['active'];
    return `<span class="badge ${statusInfo.class}">${statusInfo.text}</span>`;
}

// ===== ADMIN REVIEWS MANAGEMENT =====
async function loadAdminReviews() {
    const loading = document.getElementById('adminReviewsLoading');
    const tableContainer = document.getElementById('adminReviewsTableContainer');
    const emptyState = document.getElementById('adminReviewsEmptyState');
    
    try {
        // Show loading
        loading.classList.remove('d-none');
        tableContainer.classList.add('d-none');
        emptyState.classList.add('d-none');
        
        // Get ALL reviews from API
        const queryParams = {
            page: adminReviewsCurrentPage,
            limit: adminReviewsPerPage
        };
        
        const response = await apiService.getReviews(queryParams);
        
        adminReviews = response?.data?.reviews || [];
        
        if (response?.data?.pagination) {
            adminReviewsTotalPages = response.data.pagination.totalPages || 1;
            adminReviewsCurrentPage = response.data.pagination.currentPage || 1;
        }
        
        // Hide loading
        loading.classList.add('d-none');
        
        if (adminReviews.length === 0) {
            emptyState.classList.remove('d-none');
        } else {
            tableContainer.classList.remove('d-none');
            renderAdminReviewsTable();
        }
        
    } catch (error) {
        console.error('Error loading reviews:', error);
        loading.classList.add('d-none');
        showToast('Không thể tải danh sách đánh giá', 'error');
    }
}

function renderAdminReviewsTable() {
    const tbody = document.getElementById('adminReviewsTableBody');
    const pagination = document.getElementById('adminReviewsPagination');
    
    if (!tbody) return;
    
    // Filter reviews by search query, rating, and product
    let filteredReviews = adminReviews;
    
    // Filter by search query
    if (adminReviewsSearchQuery) {
        filteredReviews = filteredReviews.filter(review => 
            (review.comment && review.comment.toLowerCase().includes(adminReviewsSearchQuery)) ||
            (review.username && review.username.toLowerCase().includes(adminReviewsSearchQuery)) ||
            (review.product_name && review.product_name.toLowerCase().includes(adminReviewsSearchQuery))
        );
    }
    
    // Filter by rating
    if (adminReviewsRatingFilter && adminReviewsRatingFilter.trim() !== '') {
        filteredReviews = filteredReviews.filter(review => review.rating == adminReviewsRatingFilter);
    }
    
    // Filter by product
    if (adminReviewsProductFilter && adminReviewsProductFilter.trim() !== '') {
        filteredReviews = filteredReviews.filter(review => review.product_id == adminReviewsProductFilter);
    }
    
    // Render table rows
    if (filteredReviews.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4 text-muted">
                    ${adminReviewsSearchQuery || adminReviewsRatingFilter || adminReviewsProductFilter ? 'Không tìm thấy đánh giá phù hợp' : 'Chưa có đánh giá nào'}
                </td>
            </tr>
        `;
        pagination.classList.add('d-none');
        return;
    }
    
    tbody.innerHTML = filteredReviews.map((review, index) => {
        const globalIndex = (adminReviewsCurrentPage - 1) * adminReviewsPerPage + index + 1;
        const ratingStars = getRatingStars(review.rating);
        
        return `
            <tr>
                <td>${globalIndex}</td>
                <td>
                    <div class="fw-semibold">${review.product_name || 'N/A'}</div>
                    <small class="text-muted">ID: ${review.product_id}</small>
                </td>
                <td>
                    <div class="fw-semibold">${review.username || 'N/A'}</div>
                    <small class="text-muted">${review.user_full_name || '-'}</small>
                </td>
                <td>${ratingStars}</td>
                <td>
                    <div class="text-truncate" style="max-width: 200px;" title="${review.comment || ''}">
                        ${review.comment || '-'}
                    </div>
                </td>
                <td>
                    <small class="text-muted">${formatDate(review.created_at)}</small>
                </td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="showAdminReviewDetail(${review.id})" title="Xem chi tiết">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="showAdminDeleteReviewModal(${review.id})" title="Xóa đánh giá">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3,6 5,6 21,6"></polyline>
                            <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                        </svg>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    if (adminReviewsTotalPages > 1) {
        setupAdminReviewsPagination(adminReviewsTotalPages);
        pagination.classList.remove('d-none');
    } else {
        pagination.classList.add('d-none');
    }
}

function setupAdminReviewsPagination(totalPages) {
    const paginationList = document.getElementById('adminReviewsPaginationList');
    if (!paginationList) return;
    
    let paginationHTML = '';
    
    // Previous button
    if (adminReviewsCurrentPage > 1) {
        paginationHTML += `
            <li class="page-item">
                <a class="page-link" href="#" onclick="changeAdminReviewsPage(${adminReviewsCurrentPage - 1})">Trước</a>
            </li>
        `;
    }
    
    // Page numbers
    const startPage = Math.max(1, adminReviewsCurrentPage - 2);
    const endPage = Math.min(totalPages, adminReviewsCurrentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <li class="page-item ${i === adminReviewsCurrentPage ? 'active' : ''}">
                <a class="page-link" href="#" onclick="changeAdminReviewsPage(${i})">${i}</a>
            </li>
        `;
    }
    
    // Next button
    if (adminReviewsCurrentPage < totalPages) {
        paginationHTML += `
            <li class="page-item">
                <a class="page-link" href="#" onclick="changeAdminReviewsPage(${adminReviewsCurrentPage + 1})">Sau</a>
            </li>
        `;
    }
    
    paginationList.innerHTML = paginationHTML;
}

window.changeAdminReviewsPage = function(page) {
    if (page < 1 || page > adminReviewsTotalPages) return;
    adminReviewsCurrentPage = page;
    loadAdminReviews();
};

window.showAdminReviewDetail = async function(reviewId) {
    try {
        const response = await apiService.getReviewDetail(reviewId);
        const review = response.data;
        
        // Fill modal with review data
        document.getElementById('adminReviewProductName').textContent = review.product_name || 'N/A';
        document.getElementById('adminReviewProductPrice').textContent = review.product_price ? formatMoney(review.product_price) + ' ₫' : '-';
        
        document.getElementById('adminReviewUserName').textContent = review.username || 'N/A';
        document.getElementById('adminReviewUserEmail').textContent = review.user_email || '-';
        document.getElementById('adminReviewUserAvatar').src = review.user_avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjUiIGN5PSIyNSIgcj0iMjUiIGZpbGw9IiNmOGY5ZmEiLz4KPHBhdGggZD0iTTI1IDEzQzI4LjMxMzcgMTMgMzEgMTUuNjg2MyAzMSAxOUMyMSAyMi4zMTM3IDI4LjMxMzcgMjUgMjUgMjVDMjEuNjg2MyAyNSAxOSAyMi4zMTM3IDE5IDE5QzE5IDE1LjY4NjMgMjEuNjg2MyAxMyAyNSAxM1oiIGZpbGw9IiM5Y2EzYWYiLz4KPHBhdGggZD0iTTE1IDM4QzE1IDM0LjY4NjMgMTguNjg2MyAzMSAyMiAzMUMyNS4zMTM3IDMxIDI5IDM0LjY4NjMgMjkgMzhWMzBIMTVWMzhaIiBmaWxsPSIjOWNhM2FmIi8+Cjwvc3ZnPgo=';
        
        document.getElementById('adminReviewRating').innerHTML = getRatingStars(review.rating);
        document.getElementById('adminReviewCreatedAt').textContent = formatDate(review.created_at);
        document.getElementById('adminReviewComment').textContent = review.comment || 'Không có nội dung';
        
        // Store review ID for delete action
        adminReviewToDelete = reviewId;
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('adminReviewDetailModal'));
        modal.show();
        
    } catch (error) {
        console.error('Error loading review detail:', error);
        showToast('Không thể tải chi tiết đánh giá', 'error');
    }
};

window.showAdminDeleteReviewModal = function(reviewId) {
    adminReviewToDelete = reviewId;
    const modal = new bootstrap.Modal(document.getElementById('adminDeleteReviewModal'));
    modal.show();
};

window.confirmAdminDeleteReview = async function() {
    if (!adminReviewToDelete) return;
    
    const deleteButton = document.querySelector('#adminDeleteReviewModal .btn-danger');
    const originalText = deleteButton.innerHTML;
    
    try {
        // Show loading
        deleteButton.disabled = true;
        deleteButton.innerHTML = `
            <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
            Đang xóa...
        `;
        
        await apiService.deleteReview(adminReviewToDelete);
        
        showToast('Xóa đánh giá thành công', 'success');
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('adminDeleteReviewModal'));
        modal.hide();
        
        // Reload reviews
        await loadAdminReviews();
        
        adminReviewToDelete = null;
        
    } catch (error) {
        console.error('Error deleting review:', error);
        showToast('Không thể xóa đánh giá', 'error');
    } finally {
        // Restore button
        deleteButton.disabled = false;
        deleteButton.innerHTML = originalText;
    }
};

function getRatingStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let starsHTML = '';
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
        starsHTML += '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" class="text-warning me-1"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon></svg>';
    }
    
    // Half star
    if (hasHalfStar) {
        starsHTML += '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" class="text-warning me-1"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon></svg>';
    }
    
    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
        starsHTML += '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-warning me-1"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon></svg>';
    }
    
    return starsHTML;
}

// Load products for filter dropdown
async function loadProductsForReviewFilter() {
    try {
        const response = await apiService.getProducts({ limit: 100 }); // Get products with pagination
        const products = response?.data?.products || [];
        
        const productFilter = document.getElementById('adminReviewProductFilter');
        if (productFilter) {
            // Clear existing options except first one
            productFilter.innerHTML = '<option value="">Tất cả sản phẩm</option>';
            
            // Add product options
            products.forEach(product => {
                const option = document.createElement('option');
                option.value = product.id;
                option.textContent = product.name;
                productFilter.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading products for filter:', error);
    }
}


