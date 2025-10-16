// Admin JavaScript - Complete Product Management System
const BASE_URL = 'https://api.unimerch.space'
const TOKEN_KEY = 'um_token'; // Lưu JWT admin ở localStorage

function getToken() { return localStorage.getItem(TOKEN_KEY); }
function authHeader() {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

async function http(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...authHeader(), ...(opts.headers || {}) };
  const res = await fetch(`${BASE_URL}${path}`, { ...opts, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) { throw { status: res.status, data }; }
  return data;
}

const AdminAPI = {
    dashboard:       () => http('/api/admin/stats/dashboard'), // overview
    recentActivity:  (limit=20) => http(`/api/admin/stats/recent-activity?limit=${limit}`),
    revenue:         (period='day', limit=30) => http(`/api/admin/stats/revenue?period=${period}&limit=${limit}`),
    orderStats:      () => http('/api/admin/stats/orders'),
    products:        () => http('/api/admin/products'),
    orders:          () => http('/api/admin/orders'),
    customers:       () => http('/api/admin/customers')
};

// ===== GLOBAL VARIABLES =====
let products = [];
let orders = [];
let customers = [];
let categories = [];
let sizes = [];
let colors = [];
let filteredProducts = [];
let filteredOrders = [];
let filteredCustomers = [];
let currentPage = 1;
const itemsPerPage = 10;

// Chart instances
let revenueChart = null;
let orderStatusChart = null;
let customerGrowthChart = null;

// Dashboard data
let dashboardData = {
    period: 30,
    chartType: 'daily'
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    // Initialize sample data for fallback
    initializeSampleData();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize tabs
    initializeTabs();
    
    // Load dashboard by default
    switchTab('dashboard');
    
    // Initialize dashboard with API data
    loadDashboardFromAPI();
    
    showToast('Admin dashboard loaded successfully!', 'success');
});

// ===== SAMPLE DATA INITIALIZATION =====
function initializeSampleData() {
    // ...existing sample data...
    products = JSON.parse(localStorage.getItem('admin_products')) || [
        {
            id: 1,
            name: "Black Dashers",
            description: "The Black Dasher reimagines the traditional running shoe with natural materials engineered for serious performance.",
            price: 64.00,
            discount_price: null,
            quantity: 15,
            image_url: "demo.png",
            category_id: 3,
            seller_id: 1,
            status: "available",
            created_at: "2024-01-15T10:30:00Z",
            updated_at: "2024-01-15T10:30:00Z",
            category: "Men's shoes",
            rating: 4,
            reviews: 56,
            sizes: ["5", "6", "7", "8", "9"],
            colors: ["black", "blue"],
            type: "accessory"
        }
        // ... other sample products
    ];
    
    // Initialize other sample data
    categories = JSON.parse(localStorage.getItem('admin_categories')) || [
        { id: 1, name: "Hoodies & Jackets", type: "hoodie", description: "Comfortable hoodies and jackets" },
        { id: 2, name: "T-Shirts & Tees", type: "tee", description: "Essential t-shirts and tees" },
        { id: 3, name: "Accessories", type: "accessory", description: "Bags, caps, and other accessories" }
    ];
}

// ===== EVENT LISTENERS SETUP =====
function setupEventListeners() {
    // Add any global event listeners here
    document.addEventListener('click', function(e) {
        if (e.target.matches('[data-bs-dismiss="toast"]')) {
            const toast = e.target.closest('.toast');
            if (toast) {
                bootstrap.Toast.getInstance(toast)?.hide();
            }
        }
    });
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

        // 1) Gọi song song 3 API: overview, revenue series, order status breakdown
        const [dash, rev, orders] = await Promise.all([
            AdminAPI.dashboard(),
            AdminAPI.revenue('day', 30),
            AdminAPI.orderStats()
        ]);

        // 2) Đổ cards (overview)
        const ov = dash?.data?.overview || {};
        const revenueEl = document.getElementById('card_total_revenue');
        const ordersEl = document.getElementById('card_total_orders');
        const usersEl = document.getElementById('card_total_users');
        const productsEl = document.getElementById('card_total_products');

        if (revenueEl) revenueEl.textContent = formatMoney(ov.total_revenue);
        if (ordersEl) ordersEl.textContent = ov.total_orders ?? '-';
        if (usersEl) usersEl.textContent = ov.total_users ?? '-';
        if (productsEl) productsEl.textContent = ov.total_products ?? '-';

        // 3) Revenue chart
        const points = (rev?.data?.revenue || rev?.data?.points || rev?.data?.series || [])
            .map(p => ({
                label: p.period || p.date || p.label,
                value: Number(p.total_revenue ?? p.revenue ?? p.amount ?? 0)
            }));
        const revLabels = points.map(p => p.label);
        const revValues = points.map(p => p.value);

        const rctx = document.getElementById('revenueChart');
        if (rctx) {
            if (!revenueChart) {
                revenueChart = new Chart(rctx, {
                    type: 'line',
                    data: { 
                        labels: revLabels, 
                        datasets: [{ 
                            label: 'Revenue', 
                            data: revValues,
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
                                        return '$' + value.toFixed(0);
                                    }
                                }
                            }
                        }
                    }
                });
            } else {
                revenueChart.data.labels = revLabels;
                revenueChart.data.datasets[0].data = revValues;
                revenueChart.update();
            }
        }

        // 4) Order status doughnut
        const breakdown = (orders?.data?.order_status_breakdown || []).map(x => ({
            label: x.status_label || x.status, 
            value: Number(x.count ?? 0)
        }));
        
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

        showToast('Dashboard data loaded from API', 'success');

    } catch (err) {
        console.error('Dashboard API Error:', err);
        if (err.status === 401 || err.status === 403) {
            showToast('Bạn cần đăng nhập bằng ADMIN token trước khi xem dashboard.', 'error');
            // Fallback to sample data
            initializeFallbackDashboard();
        } else {
            showToast('Load dashboard lỗi. Sử dụng dữ liệu mẫu.', 'warning');
            initializeFallbackDashboard();
        }
    }
}

function initializeFallbackDashboard() {
    // Use sample data for dashboard
    document.getElementById('card_total_revenue').textContent = '45,231';
    document.getElementById('card_total_orders').textContent = '128';
    document.getElementById('card_total_users').textContent = '89';
    document.getElementById('card_total_products').textContent = '24';

    // Initialize sample charts
    initializeSampleCharts();
}

function initializeSampleCharts() {
    // Sample revenue chart
    const rctx = document.getElementById('revenueChart');
    if (rctx && !revenueChart) {
        revenueChart = new Chart(rctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Revenue',
                    data: [12000, 19000, 15000, 25000, 22000, 30000],
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
                                return '$' + value.toFixed(0);
                            }
                        }
                    }
                }
            }
        });
    }

    // Sample order status chart
    const sctx = document.getElementById('orderStatusChart');
    if (sctx && !orderStatusChart) {
        orderStatusChart = new Chart(sctx, {
            type: 'doughnut',
            data: {
                labels: ['Completed', 'Processing', 'Pending'],
                datasets: [{
                    data: [68, 22, 10],
                    backgroundColor: ['#10b981', '#3b82f6', '#f59e0b']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
            }
        });
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
            'dashboard': 'Dashboard',
            'products': 'Product Management',
            'orders': 'Order Management', 
            'customers': 'Customer Management',
            'categories': 'Category Management',
            'attributes': 'Attributes Management'
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
            case 'products':
                loadProducts();
                break;
            case 'orders':
                loadOrders();
                break;
            case 'customers':
                loadCustomers();
                break;
            case 'categories':
                loadCategories();
                break;
            case 'attributes':
                loadSizesAndColors();
                break;
        }
    }
}

// ===== PLACEHOLDER FUNCTIONS =====
function loadProducts() {
    console.log('Loading products...');
    // Implementation will follow
}

function loadOrders() {
    console.log('Loading orders...');
    // Implementation will follow
}

function loadCustomers() {
    console.log('Loading customers...');
    // Implementation will follow
}

function loadCategories() {
    console.log('Loading categories...');
    // Implementation will follow
}

function loadSizesAndColors() {
    console.log('Loading attributes...');
    // Implementation will follow
}

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
                <strong class="me-auto">Admin Panel</strong>
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

// ===== MOBILE SIDEBAR TOGGLE =====
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('show');
    }
}

// Make function globally available
window.toggleSidebar = toggleSidebar;