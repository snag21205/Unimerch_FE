// Seller Dashboard Main Controller
// Handles initialization, tab management, dashboard stats, and common utilities

// ===== GLOBAL VARIABLES =====
let currentSellerId = null;
let sellerRevenueChart = null;
let sellerOrderStatusChart = null;

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    // Get seller info from token first
    initializeSellerInfo();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize tabs
    initializeTabs();
    
    // Load dashboard by default
    loadSellerDashboard();
    
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
                loadSellerDashboard();
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

// ===== DASHBOARD FUNCTIONS =====
async function loadSellerDashboard() {
    try {
        // Show loading state
        const cards = ['card_total_revenue', 'card_total_orders', 'card_total_products', 'card_total_reviews'];
        cards.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = 'Loading...';
        });

        // Use same API logic as admin - backend will filter by seller role
        const [dash, rev, orders, productsResp] = await Promise.all([
            apiService.getDashboardStats().catch(() => null),
            apiService.getRevenueStats({ period: 'day', limit: 30 }).catch(() => null),
            apiService.getOrderStats().catch(() => null),
            apiService.getProducts({ limit: 100 }).catch(() => null)
        ]);

        // Get seller's products and orders
        const sellerId = window.currentSellerId;
        let sellerProducts = [];
        
        // Try to get seller products - filter by seller_id
        if (productsResp?.data?.products) {
            sellerProducts = productsResp.data.products.filter(p => p.seller_id == sellerId);
        }
        
        // If no products found, try to fetch directly with seller_id filter
        if (sellerProducts.length === 0 && sellerId) {
            try {
                const sellerProductsResp = await apiService.getProducts({ seller_id: sellerId, limit: 100 });
                sellerProducts = sellerProductsResp?.data?.products || [];
            } catch (error) {
                // Error loading seller products
            }
        }
        
        // Try to get seller orders - fetch all pages like admin
        let sellerOrders = [];
        try {
            // Fetch all pages of seller orders
            let currentPage = 1;
            let hasMorePages = true;
            sellerOrders = [];
            
            while (hasMorePages && currentPage <= 100) {
                const sellerOrdersResp = await apiService.getSellerOrders({ page: currentPage, limit: 100 });
                const pageOrders = sellerOrdersResp?.data?.orders || [];
                
                if (pageOrders.length === 0) {
                    hasMorePages = false;
                    break;
                }
                
                sellerOrders = sellerOrders.concat(pageOrders);
                
                // Check pagination
                if (sellerOrdersResp?.data?.pagination) {
                    const totalPages = sellerOrdersResp.data.pagination.total_pages || 1;
                    if (currentPage >= totalPages) {
                        hasMorePages = false;
                    }
                } else {
                    if (pageOrders.length < 100) {
                        hasMorePages = false;
                    }
                }
                
                currentPage++;
            }
        } catch (error) {
            // Fallback: use admin orders if available
            if (orders?.data?.orders) {
                sellerOrders = orders.data.orders.filter(o => o.seller_id == sellerId);
            }
        }

        // Populate cards - use API data if available, otherwise calculate
        const ov = dash?.data?.overview || {};
        const revenueEl = document.getElementById('card_total_revenue');
        const ordersEl = document.getElementById('card_total_orders');
        const productsEl = document.getElementById('card_total_products');
        const reviewsEl = document.getElementById('card_total_reviews');

        // Calculate revenue from delivered orders if API doesn't provide
        let totalRevenue = 0;
        if (ov.total_revenue) {
            totalRevenue = parseFloat(ov.total_revenue);
        } else {
            sellerOrders.forEach(order => {
                if (order.status === 'delivered' && order.total_amount) {
                    totalRevenue += parseFloat(order.total_amount);
                }
            });
        }

        const totalOrders = ov.total_orders || sellerOrders.length || 0;
        const totalProducts = ov.total_products || sellerProducts.length || 0;
        
        // Get reviews count
        let totalReviews = ov.total_reviews || 0;
        if (!totalReviews) {
            try {
                const reviewsResponse = await apiService.getReviews({ limit: 100 });
                const allReviews = reviewsResponse?.data?.reviews || [];
                const productIds = sellerProducts.map(p => p.id);
                totalReviews = allReviews.filter(r => productIds.includes(r.product_id)).length;
            } catch (error) {
                // Error loading reviews
            }
        }

        if (revenueEl) revenueEl.textContent = formatMoney(totalRevenue) + ' ₫';
        if (ordersEl) ordersEl.textContent = totalOrders;
        if (productsEl) productsEl.textContent = totalProducts;
        if (reviewsEl) reviewsEl.textContent = totalReviews;

        // Revenue chart - use API data if available
        if (rev?.data?.data && rev.data.data.length > 0) {
            const revData = rev.data.data;
            const revLabels = revData.map(p => p.period || p.date || p.label);
            const revValues = revData.map(p => Number(p.revenue || p.total_revenue || p.amount || 0));
            updateSellerRevenueChart(revLabels, revValues);
        } else {
            // Fallback: calculate from orders
            const revenueData = calculateRevenueByDate(sellerOrders);
            updateSellerRevenueChart(revenueData.labels, revenueData.values);
        }

        // Order status chart - use API data if available
        if (orders?.data?.order_status_breakdown && orders.data.order_status_breakdown.length > 0) {
            const breakdown = orders.data.order_status_breakdown.map(x => ({
                label: x.status_label || x.status, 
                value: Number(x.count ?? 0)
            }));
            updateSellerOrderStatusChart(breakdown);
        } else {
            // Fallback: calculate from orders
            const orderStatusData = calculateOrderStatusBreakdown(sellerOrders);
            updateSellerOrderStatusChart(orderStatusData);
        }

        // Load top products using API if available
        try {
            const productStatsResp = await apiService.getProductStats({ limit: 5 });
            const topProducts = productStatsResp?.data?.top_products || [];
            // Filter to seller's products
            const sellerTopProducts = topProducts.filter(p => sellerProducts.some(sp => sp.id === p.id));
            if (sellerTopProducts.length > 0) {
                await loadSellerTopProductsFromAPI(sellerTopProducts);
            } else {
                await loadSellerTopProducts(sellerProducts, sellerOrders);
            }
        } catch (error) {
            // Fallback: calculate from orders
            await loadSellerTopProducts(sellerProducts, sellerOrders);
        }

        // Load recent orders
        await loadSellerRecentOrders(sellerOrders);

    } catch (error) {
        console.error('Error loading seller dashboard:', error);
        showToast('Không thể tải dashboard. Vui lòng thử lại.', 'error');
    }
}

function calculateRevenueByDate(orders) {
    const deliveredOrders = orders.filter(o => o.status === 'delivered');
    const revenueMap = {};
    
    deliveredOrders.forEach(order => {
        const date = new Date(order.created_at).toLocaleDateString('vi-VN');
        if (!revenueMap[date]) {
            revenueMap[date] = 0;
        }
        revenueMap[date] += parseFloat(order.total_amount || 0);
    });
    
    const labels = Object.keys(revenueMap).sort();
    const values = labels.map(label => revenueMap[label]);
    
    // Limit to last 30 days
    return {
        labels: labels.slice(-30),
        values: values.slice(-30)
    };
}

function calculateOrderStatusBreakdown(orders) {
    const statusMap = {
        'pending': { text: 'Chờ xử lý', count: 0 },
        'processing': { text: 'Đang xử lý', count: 0 },
        'shipped': { text: 'Đã gửi', count: 0 },
        'delivered': { text: 'Đã giao', count: 0 },
        'cancelled': { text: 'Đã hủy', count: 0 }
    };
    
    orders.forEach(order => {
        const status = order.status || 'pending';
        if (statusMap[status]) {
            statusMap[status].count++;
        }
    });
    
    return Object.entries(statusMap).map(([status, data]) => ({
        label: data.text,
        value: data.count
    })).filter(item => item.value > 0);
}

function updateSellerRevenueChart(labels, values) {
    const ctx = document.getElementById('revenueChart');
    if (ctx) {
        if (!sellerRevenueChart) {
            sellerRevenueChart = new Chart(ctx, {
                type: 'line',
                data: { 
                    labels: labels, 
                    datasets: [{ 
                        label: 'Doanh Thu', 
                        data: values,
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
            sellerRevenueChart.data.labels = labels;
            sellerRevenueChart.data.datasets[0].data = values;
            sellerRevenueChart.update();
        }
    }
}

function updateSellerOrderStatusChart(breakdown) {
    const ctx = document.getElementById('orderStatusChart');
    if (ctx && breakdown.length > 0) {
        if (!sellerOrderStatusChart) {
            sellerOrderStatusChart = new Chart(ctx, {
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
            sellerOrderStatusChart.data.labels = breakdown.map(b => b.label);
            sellerOrderStatusChart.data.datasets[0].data = breakdown.map(b => b.value);
            sellerOrderStatusChart.update();
        }
    }
}

async function loadSellerTopProductsFromAPI(topProducts) {
    try {
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
                                 style="width: 40px; height: 40px; object-fit: cover;"
                                 onerror="this.src='../../assets/images/products/demo.png'">
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
        const tbody = document.getElementById('topProductsTable');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center text-danger">Không thể tải dữ liệu sản phẩm</td></tr>';
        }
    }
}

async function loadSellerTopProducts(products, orders) {
    try {
        // Calculate sales for each product
        const productSales = {};
        
        orders.forEach(order => {
            if (order.items) {
                order.items.forEach(item => {
                    if (!productSales[item.product_id]) {
                        productSales[item.product_id] = {
                            totalSold: 0,
                            totalRevenue: 0,
                            product: products.find(p => p.id === item.product_id)
                        };
                    }
                    productSales[item.product_id].totalSold += item.quantity;
                    productSales[item.product_id].totalRevenue += item.price * item.quantity;
                });
            }
        });
        
        // Sort by total revenue
        const topProducts = Object.values(productSales)
            .filter(p => p.product)
            .sort((a, b) => b.totalRevenue - a.totalRevenue)
            .slice(0, 5);
        
        const tbody = document.getElementById('topProductsTable');
        if (tbody) {
            if (topProducts.length === 0) {
                tbody.innerHTML = '<tr><td colspan="3" class="text-center text-muted">Chưa có dữ liệu sản phẩm</td></tr>';
                return;
            }
            
            tbody.innerHTML = topProducts.map(item => `
                <tr>
                    <td>
                        <div class="d-flex align-items-center">
                            <img src="${item.product.image_url || '../../assets/images/products/demo.png'}" 
                                 alt="${item.product.name}" 
                                 class="rounded me-3" 
                                 style="width: 40px; height: 40px; object-fit: cover;"
                                 onerror="this.src='../../assets/images/products/demo.png'">
                            <div>
                                <div class="fw-semibold">${item.product.name || 'Không rõ'}</div>
                            </div>
                        </div>
                    </td>
                    <td>${item.totalSold || 0}</td>
                    <td class="fw-semibold">${formatMoney(item.totalRevenue || 0)} ₫</td>
                </tr>
            `).join('');
        }
    } catch (error) {
        const tbody = document.getElementById('topProductsTable');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center text-danger">Không thể tải dữ liệu sản phẩm</td></tr>';
        }
    }
}

async function loadSellerRecentOrders(orders) {
    try {
        // If orders is empty, try to load from API
        let recentOrders = orders;
        if (!recentOrders || recentOrders.length === 0) {
            try {
                const response = await apiService.getSellerOrders({ page: 1, limit: 5 });
                recentOrders = response?.data?.orders || [];
            } catch (error) {
                recentOrders = [];
            }
        }
        
        // Sort by date (newest first) and take top 5
        recentOrders = recentOrders
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 5);
        
        const container = document.getElementById('recentOrdersList');
        if (container) {
            if (recentOrders.length === 0) {
                container.innerHTML = '<div class="list-group list-group-flush"><div class="list-group-item border-0 py-3 text-center text-muted">Chưa có đơn hàng nào</div></div>';
                return;
            }
            
            container.innerHTML = '<div class="list-group list-group-flush">' +
                recentOrders.map(order => {
                    const statusBadge = getOrderStatusBadge(order.status);
                    return `
                        <div class="list-group-item border-0 py-3">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <div class="fw-semibold">#${order.id}</div>
                                    <small class="text-muted">${order.user_name || 'Khách hàng'} • ${order.items_count || 0} sản phẩm</small>
                                </div>
                                <div class="text-end">
                                    <div class="fw-semibold">${formatMoney(order.total_amount || 0)} ₫</div>
                                    ${statusBadge}
                                </div>
                            </div>
                        </div>
                    `;
                }).join('') +
            '</div>';
        }
    } catch (error) {
        const container = document.getElementById('recentOrdersList');
        if (container) {
            container.innerHTML = '<div class="list-group list-group-flush"><div class="list-group-item border-0 py-3 text-center text-danger">Không thể tải dữ liệu đơn hàng</div></div>';
        }
    }
}

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
window.loadSellerDashboard = loadSellerDashboard;
