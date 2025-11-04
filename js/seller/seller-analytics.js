// Seller Analytics Module - Dashboard stats and charts
// Handles dashboard overview, revenue charts, order status charts, and activity feeds
// Same logic as admin-analytics.js but for seller

// ===== ANALYTICS VARIABLES =====
let sellerRevenueChart = null;
let sellerOrderStatusChart = null;

// ===== ANALYTICS FUNCTIONS =====
function formatMoney(x) {
    const n = Number(x ?? 0);
    return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

async function loadSellerDashboardFromAPI() {
    try {
        // Show loading state
        const cards = ['card_total_revenue', 'card_total_orders', 'card_total_products', 'card_total_reviews'];
        cards.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = 'Loading...';
        });

        const sellerId = window.currentSellerId;
        if (!sellerId) {
            setTimeout(() => loadSellerDashboardFromAPI(), 200);
            return;
        }

        // Try to call admin APIs first (same as admin - backend will filter by seller role)
        let dash = null;
        let rev = null;
        let orders = null;
        let productStats = null;
        
        try {
            [dash, rev, orders, productStats] = await Promise.all([
                apiService.getDashboardStats(),
                apiService.getRevenueStats({ period: 'day', limit: 30 }),
                apiService.getOrderStats(),
                apiService.getProductStats({ limit: 5 })
            ]);
            console.log('✅ Admin APIs loaded:', { dash, rev, orders, productStats });
        } catch (apiError) {
            console.log('❌ Admin stats APIs not available, using fallback logic:', apiError);
            // Will use fallback logic below
        }

        // Fetch seller's actual data for fallback (if needed) or verification
        let sellerProducts = [];
        let sellerOrders = [];
        let allReviews = [];
        
        try {
            // Fetch all data in parallel for better performance
            const [productsResp, reviewsResp] = await Promise.all([
                apiService.getProducts({ seller_id: sellerId, limit: 100 }).catch(() => ({ data: { products: [] } })),
                apiService.getReviews({ limit: 100 }).catch(() => ({ data: { reviews: [] } }))
            ]);
            
            sellerProducts = productsResp?.data?.products || [];
            allReviews = reviewsResp?.data?.reviews || [];
        } catch (error) {
            console.error('Error loading seller products/reviews:', error);
        }
        
        try {
            // Get ALL seller orders (fetch all pages) for fallback
            let currentPage = 1;
            let hasMorePages = true;
            
            while (hasMorePages && currentPage <= 100) {
                try {
                    const sellerOrdersResp = await apiService.getSellerOrders({ page: currentPage, limit: 100 });
                    const pageOrders = sellerOrdersResp?.data?.orders || [];
                    
                    if (pageOrders.length === 0) {
                        hasMorePages = false;
                        break;
                    }
                    
                    sellerOrders = sellerOrders.concat(pageOrders);
                    
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
                } catch (error) {
                    console.error(`Error loading seller orders page ${currentPage}:`, error);
                    hasMorePages = false;
                    break;
                }
            }
        } catch (error) {
            console.error('Error loading seller orders:', error);
        }

        // Populate cards - use API data if available, otherwise calculate from actual data
        const ov = dash?.data?.overview || {};
        const revenueEl = document.getElementById('card_total_revenue');
        const ordersEl = document.getElementById('card_total_orders');
        const productsEl = document.getElementById('card_total_products');
        const reviewsEl = document.getElementById('card_total_reviews');

        // Calculate stats from actual data (fallback)
        let totalRevenue = 0;
        sellerOrders.forEach(order => {
            if (order.status === 'delivered' && order.total_amount) {
                totalRevenue += parseFloat(order.total_amount);
            }
        });

        const totalOrders = sellerOrders.length;
        const totalProducts = sellerProducts.length;
        
        // Get reviews count for seller's products
        const productIds = sellerProducts.map(p => p.id);
        const totalReviews = allReviews.filter(r => productIds.includes(r.product_id)).length;

        // Use API data if available (even if 0), otherwise use calculated values
        // Check if API data exists (not null/undefined), not just falsy
        const hasApiData = dash && dash.data && dash.data.overview;
        
        console.log('📊 Dashboard data:', {
            hasApiData,
            apiOverview: ov,
            calculated: { totalRevenue, totalOrders, totalProducts, totalReviews },
            sellerOrdersCount: sellerOrders.length,
            sellerProductsCount: sellerProducts.length
        });
        
        if (revenueEl) {
            const revenue = hasApiData && ov.total_revenue !== undefined ? ov.total_revenue : totalRevenue;
            console.log('💰 Revenue:', { api: ov.total_revenue, calculated: totalRevenue, final: revenue });
            revenueEl.textContent = formatMoney(revenue) + ' ₫';
        }
        if (ordersEl) {
            const orders = hasApiData && ov.total_orders !== undefined ? ov.total_orders : totalOrders;
            console.log('📦 Orders:', { api: ov.total_orders, calculated: totalOrders, final: orders });
            ordersEl.textContent = orders || 0;
        }
        if (productsEl) {
            const products = hasApiData && ov.total_products !== undefined ? ov.total_products : totalProducts;
            console.log('🛍️ Products:', { api: ov.total_products, calculated: totalProducts, final: products });
            productsEl.textContent = products || 0;
        }
        if (reviewsEl) {
            const reviews = hasApiData && ov.total_reviews !== undefined ? ov.total_reviews : totalReviews;
            console.log('⭐ Reviews:', { api: ov.total_reviews, calculated: totalReviews, final: reviews });
            reviewsEl.textContent = reviews || 0;
        }

        // Revenue chart - use API data if available, otherwise calculate
        if (rev?.data?.data && rev.data.data.length > 0) {
            const revData = rev.data.data;
            const revLabels = revData.map(p => p.period || p.date || p.label);
            const revValues = revData.map(p => Number(p.revenue || p.total_revenue || p.amount || 0));
            updateSellerRevenueChart(revLabels, revValues);
        } else {
            // Calculate from actual orders
            const revenueData = calculateRevenueByDate(sellerOrders);
            if (revenueData.labels.length > 0 && revenueData.values.length > 0) {
                updateSellerRevenueChart(revenueData.labels, revenueData.values);
            } else {
                updateSellerRevenueChart(['Không có dữ liệu'], [0]);
            }
        }

        // Order status chart - use API data if available, otherwise calculate
        if (orders?.data?.order_status_breakdown && orders.data.order_status_breakdown.length > 0) {
            const breakdown = orders.data.order_status_breakdown.map(x => ({
                label: x.status_label || x.status, 
                value: Number(x.count ?? 0)
            }));
            updateSellerOrderStatusChart(breakdown);
        } else {
            // Calculate from actual orders
            const breakdown = calculateOrderStatusBreakdown(sellerOrders);
            if (breakdown.length > 0) {
                updateSellerOrderStatusChart(breakdown);
            } else {
                updateSellerOrderStatusChart([{ label: 'Chưa có đơn hàng', value: 1 }]);
            }
        }

        // Load top products - use API if available, otherwise calculate
        if (productStats?.data?.top_products && productStats.data.top_products.length > 0) {
            const topProducts = productStats.data.top_products;
            // Filter to seller's products if needed
            const sellerTopProducts = topProducts.filter(p => sellerProducts.some(sp => sp.id === p.id));
            if (sellerTopProducts.length > 0) {
                await loadSellerTopProductsFromAPI(sellerTopProducts);
            } else {
                await loadSellerTopProductsFromOrders(sellerProducts, sellerOrders);
            }
        } else {
            // Fallback: calculate from orders
            await loadSellerTopProductsFromOrders(sellerProducts, sellerOrders);
        }

        // Load recent orders
        await loadSellerRecentOrders(sellerOrders);

    } catch (err) {
        console.error('Error loading seller dashboard:', err);
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
    const rctx = document.getElementById('revenueChart');
    if (rctx) {
        if (!sellerRevenueChart) {
            sellerRevenueChart = new Chart(rctx, {
                type: 'line',
                data: { 
                    labels: labels, 
                    datasets: [{ 
                        label: 'Revenue', 
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
    const sctx = document.getElementById('orderStatusChart');
    if (sctx) {
        if (!sellerOrderStatusChart) {
            sellerOrderStatusChart = new Chart(sctx, {
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

async function loadSellerTopProductsFromOrders(products, orders) {
    try {
        // Calculate sales for each product from order items
        const productSales = {};
        
        // Limit to most recent 100 orders to avoid performance issues
        const recentOrders = orders.slice(0, 100);
        
        // First, get order details with items (only if needed)
        for (const order of recentOrders) {
            try {
                let orderItems = order.items;
                
                // If order doesn't have items, try to fetch order detail (only for first 20 orders to avoid too many API calls)
                if ((!orderItems || orderItems.length === 0) && recentOrders.indexOf(order) < 20) {
                    try {
                        const orderDetail = await apiService.getOrderDetail(order.id);
                        orderItems = orderDetail?.data?.items || [];
                    } catch (error) {
                        // If can't fetch detail, skip this order
                        continue;
                    }
                }
                
                // Calculate sales from order items
                if (orderItems && orderItems.length > 0) {
                    orderItems.forEach(item => {
                        if (!productSales[item.product_id]) {
                            productSales[item.product_id] = {
                                totalSold: 0,
                                totalRevenue: 0,
                                product: products.find(p => p.id === item.product_id)
                            };
                        }
                        productSales[item.product_id].totalSold += item.quantity || 0;
                        productSales[item.product_id].totalRevenue += (item.price || 0) * (item.quantity || 0);
                    });
                }
            } catch (error) {
                // Skip orders that can't be loaded
                continue;
            }
        }
        
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
        console.error('Error calculating top products:', error);
        const tbody = document.getElementById('topProductsTable');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center text-muted">Chưa có dữ liệu sản phẩm</td></tr>';
        }
    }
}

async function loadSellerRecentOrders(orders = []) {
    try {
        let recentOrders = orders;
        
        // If orders not provided, fetch from API
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
                    // Try to get items count from order or calculate
                    let itemsCount = order.items_count || 0;
                    if (!itemsCount && order.items) {
                        itemsCount = order.items.length;
                    }
                    if (!itemsCount && order.item_count) {
                        itemsCount = order.item_count;
                    }
                    
                    return `
                        <div class="list-group-item border-0 py-3">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <div class="fw-semibold">#${order.id}</div>
                                    <small class="text-muted">${order.user_name || 'Khách hàng'} • ${itemsCount} sản phẩm</small>
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
        console.error('Error loading recent orders:', error);
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

// Export functions for use in main dashboard
window.loadSellerDashboardFromAPI = loadSellerDashboardFromAPI;
window.refreshSellerDashboard = function() {
    loadSellerDashboardFromAPI();
    showToast('Đã làm mới dữ liệu', 'success');
};

