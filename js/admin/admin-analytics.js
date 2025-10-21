// Admin Analytics Module - Dashboard stats and charts
// Handles dashboard overview, revenue charts, order status charts, and activity feeds

// ===== ANALYTICS VARIABLES =====
let revenueChart = null;
let orderStatusChart = null;

// ===== ANALYTICS FUNCTIONS =====
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
        // Error loading recent activity
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
        // Error loading featured products
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
        const container = document.getElementById('recentOrdersList');
        if (container) {
            container.innerHTML = '<div class="list-group list-group-flush"><div class="list-group-item border-0 py-3 text-center text-danger">Không thể tải dữ liệu đơn hàng</div></div>';
        }
    }
}

// Export functions for use in main dashboard
window.loadDashboardFromAPI = loadDashboardFromAPI;
window.refreshDashboard = function() {
    loadDashboardFromAPI();
    showToast('Đã làm mới dữ liệu', 'success');
};
