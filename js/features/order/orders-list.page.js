// Orders Page JavaScript

// Check if user is logged in
if (localStorage.getItem('isLoggedIn') !== 'true') {
    alert('Please login to access this page');
    window.location.href = '../auth/login.html';
}

// Current active status and order data
let currentStatus = 'CHO_XAC_NHAN';
let allOrders = [];
let ordersByStatus = {};

// Status mapping from API to UI
const statusMapping = {
    'pending': 'CHO_XAC_NHAN',      // Pending → Chờ xác nhận
    'processing': 'VAN_CHUYEN',     // Processing → Vận chuyển  
    'shipped': 'CHO_GIAO_HANG',     // Shipped → Chờ giao hàng
    'delivered': 'HOAN_THANH',      // Delivered → Hoàn thành
    'cancelled': 'DA_HUY'           // Cancelled → Đã huỷ
};

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    setupTabSwitching();
    loadOrders();
});

// Load orders from API
async function loadOrders() {
    try {
        // Show loading state
        showLoadingState();

        // Check if order service is available
        if (window.orderService) {
            const ordersData = await orderService.getUserOrders();
            
            if (ordersData && ordersData.orders) {
                // Transform API data to UI format
                allOrders = ordersData.orders.map(order => transformApiOrder(order));
                
                // Group orders by status
                groupOrdersByStatus();
                
                // Update tab counts
                updateTabCounts();
                
                // Render current status
                renderOrders(currentStatus);
                
            }
        } else {
            throw new Error('Order service not available');
        }
        
    } catch (error) {
        
        // Fallback to mock data
        loadMockOrders();
    } finally {
        hideLoadingState();
    }
}

// Transform API order to UI format
function transformApiOrder(apiOrder) {
    // Map API status to UI status
    const uiStatus = statusMapping[apiOrder.status] || 'CHO_XAC_NHAN';
    
    return {
        id: apiOrder.id,
        orderDate: apiOrder.created_at,
        status: uiStatus,
        items: apiOrder.items || [],
        subtotal: parseFloat(apiOrder.total_amount || 0),
        shippingFee: 30000, // Default shipping fee
        total: parseFloat(apiOrder.total_amount || 0),
        paymentMethod: formatPaymentMethod(apiOrder.payment_method),
        shippingMethod: 'Giao tận nơi',
        shippingAddress: apiOrder.shipping_address,
        eta: calculateETA(apiOrder.status, apiOrder.created_at)
    };
}

// Format payment method for display
function formatPaymentMethod(method) {
    const methodMap = {
        'cod': 'COD',
        'credit_card': 'Thẻ tín dụng', 
        'bank_transfer': 'Chuyển khoản',
        'momo': 'MoMo',
        'zalopay': 'ZaloPay',
        'vnpay': 'VNPay'
    };
    return methodMap[method] || 'COD';
}

// Calculate ETA based on status and creation date
function calculateETA(status, createdAt) {
    const created = new Date(createdAt);
    
    switch (status) {
        case 'pending':
        case 'processing':
            return '2-3 ngày';
        case 'shipped':
            const deliveryDate = new Date(created);
            deliveryDate.setDate(deliveryDate.getDate() + 3);
            return `Dự kiến giao: ${deliveryDate.toLocaleDateString('vi-VN')}`;
        case 'delivered':
            return 'Đã giao';
        case 'cancelled':
            return 'Đã hủy';
        default:
            return '2-3 ngày';
    }
}

// Group orders by status
function groupOrdersByStatus() {
    ordersByStatus = {
        CHO_XAC_NHAN: [],
        VAN_CHUYEN: [],
        CHO_GIAO_HANG: [],
        HOAN_THANH: [],
        DA_HUY: [],
        TRA_HOAN_TIEN: []
    };
    
    allOrders.forEach(order => {
        if (ordersByStatus[order.status]) {
            ordersByStatus[order.status].push(order);
        }
    });
}

// Update tab counts
function updateTabCounts() {
    const tabs = document.querySelectorAll('.order-tab');
    tabs.forEach(tab => {
        const status = tab.dataset.status;
        const count = ordersByStatus[status] ? ordersByStatus[status].length : 0;
        const countElement = tab.querySelector('.order-count');
        if (countElement) {
            countElement.textContent = count;
        }
    });
}

// Show loading state
function showLoadingState() {
    const container = document.getElementById('ordersContainer');
    const emptyState = document.getElementById('emptyState');
    
    if (container) {
        container.innerHTML = `
            <div class="text-center py-5">
                <div class="spinner-border text-primary mb-3" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="text-light">Đang tải đơn hàng...</p>
            </div>
        `;
    }
    
    if (emptyState) {
        emptyState.classList.add('d-none');
    }
}

// Hide loading state
function hideLoadingState() {
    // Loading state will be replaced by renderOrders()
}

// Fallback to mock data
function loadMockOrders() {
    allOrders = getMockOrdersData();
    groupOrdersByStatus();
    updateTabCounts();
    renderOrders(currentStatus);
}

// Setup tab switching functionality
function setupTabSwitching() {
    const tabs = document.querySelectorAll('.order-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Get status and render orders
            currentStatus = this.dataset.status;
            renderOrders(currentStatus);
        });
    });
}

// Render orders based on status
function renderOrders(status) {
    const container = document.getElementById('ordersContainer');
    const emptyState = document.getElementById('emptyState');
    const orders = ordersByStatus[status] || [];

    if (orders.length === 0) {
        container.innerHTML = '';
        emptyState.classList.remove('d-none');
        return;
    }

    emptyState.classList.add('d-none');
    container.innerHTML = orders.map(order => createOrderCard(order)).join('');
}

// Helper function to transform image URL
function transformImageUrl(imageUrl) {
    if (!imageUrl) {
        return '../../assets/images/products/demo.png';
    }
    
    // If it's already a full URL (starts with http), use as is
    if (imageUrl.startsWith('http')) {
        return imageUrl;
    }
    
    // If it's a relative path, construct proper local path
    const filename = imageUrl.replace(/^.*[\\\/]/, ''); // Get just filename
    return `../../assets/images/products/${filename}`;
}

// Create order card HTML
function createOrderCard(order) {
    const statusConfig = getStatusConfig(order.status);
    const itemsHtml = order.items.map(item => `
        <div class="order-item">
            <img src="${transformImageUrl(item.image || item.product_image)}" 
                 alt="${item.product_name || item.name}" 
                 class="item-image"
                 onerror="this.src='../../assets/images/products/demo.png'">
            <div class="item-details">
                <h6 class="item-name">${item.product_name || item.name}</h6>
                <p class="item-variant">${item.variant || `Số lượng: ${item.quantity}`}</p>
            </div>
            <div class="item-quantity">x${item.quantity}</div>
            <div class="item-price">${formatPrice(item.price)}</div>
            <div class="item-total">${formatPrice(item.price * item.quantity)}</div>
        </div>
    `).join('');

    const actionsHtml = getActionButtons(order);

    return `
        <div class="order-card">
            <!-- Order Header -->
            <div class="order-header">
                <div class="order-info">
                    <span class="order-id">Đơn hàng #${order.id}</span>
                    <span class="order-date">${formatDate(order.orderDate)}</span>
                </div>
                <span class="order-status-chip ${statusConfig.class}">${statusConfig.label}</span>
            </div>

            <!-- Order Items -->
            <div class="order-items">
                ${itemsHtml}
            </div>

            <!-- Order Footer -->
            <div class="order-footer">
                <div class="order-summary">
                    <div class="summary-row">
                        <span>Tạm tính:</span>
                        <span>${formatPrice(order.subtotal)}</span>
                    </div>
                    <div class="summary-row">
                        <span>Phí vận chuyển:</span>
                        <span>${formatPrice(order.shippingFee || 0)}</span>
                    </div>
                    <div class="summary-row total">
                        <span>Tổng thanh toán:</span>
                        <span>${formatPrice(order.total)}</span>
                    </div>
                </div>
                
                <div class="order-details">
                    <div class="payment-shipping-info">
                        <span><strong>Thanh toán:</strong> ${order.paymentMethod}</span>
                        <span><strong>Giao hàng:</strong> ${order.shippingMethod}</span>
                        ${order.eta ? `<span><strong>Dự kiến:</strong> ${order.eta}</span>` : ''}
                        ${order.shippingAddress ? `<span><strong>Địa chỉ:</strong> ${order.shippingAddress}</span>` : ''}
                    </div>
                    
                    <div class="order-actions">
                        ${actionsHtml}
                        <button class="btn btn-link order-detail-link" onclick="viewOrderDetail(${order.id})">Xem chi tiết đơn</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Get status configuration
function getStatusConfig(status) {
    const configs = {
        CHO_XAC_NHAN: { label: 'Chờ xác nhận', class: 'status-pending' },
        VAN_CHUYEN: { label: 'Đang vận chuyển', class: 'status-shipping' },
        CHO_GIAO_HANG: { label: 'Chờ giao hàng', class: 'status-ready' },
        HOAN_THANH: { label: 'Hoàn thành', class: 'status-completed' },
        DA_HUY: { label: 'Đã huỷ', class: 'status-cancelled' },
        TRA_HOAN_TIEN: { label: 'Trả hàng/Hoàn tiền', class: 'status-refund' }
    };
    return configs[status] || { label: status, class: 'status-default' };
}

// Get action buttons based on order status
function getActionButtons(order) {
    switch (order.status) {
        case 'CHO_XAC_NHAN':
            return `<button class="btn btn-outline-danger btn-sm" onclick="cancelOrder(${order.id})">Huỷ đơn</button>`;
        case 'VAN_CHUYEN':
            return `<button class="btn btn-outline-primary btn-sm" onclick="trackOrder('${order.trackingCode || order.id}')">Theo dõi vận đơn</button>`;
        case 'CHO_GIAO_HANG':
            return `<button class="btn btn-outline-primary btn-sm" onclick="contactShipper('${order.shipperPhone || ''}')">Liên hệ shipper</button>`;
        case 'HOAN_THANH':
            return `
                <button class="btn btn-outline-warning btn-sm me-2" onclick="rateOrder(${order.id})">Đánh giá</button>
                <button class="btn btn-primary btn-sm" onclick="reorder(${order.id})">Mua lại</button>
            `;
        case 'DA_HUY':
            return `<button class="btn btn-primary btn-sm" onclick="reorder(${order.id})">Mua lại</button>`;
        case 'TRA_HOAN_TIEN':
            return `<button class="btn btn-outline-info btn-sm" onclick="viewRefundStatus(${order.id})">Xem tiến trình hoàn tiền</button>`;
        default:
            return '';
    }
}

// Order action functions
async function cancelOrder(orderId) {
    if (confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
        try {
            if (window.orderService) {
                await orderService.cancelOrder(orderId);
                
                // Show success message
                if (window.UiUtils) {
                    UiUtils.showToast('Đã hủy đơn hàng thành công!', 'success');
                } else {
                    alert('Đã hủy đơn hàng thành công!');
                }
                
                // Reload orders
                await loadOrders();
            } else {
                alert('Chức năng hủy đơn hàng tạm thời không khả dụng');
            }
        } catch (error) {
            alert('Có lỗi xảy ra khi hủy đơn hàng. Vui lòng thử lại!');
        }
    }
}

function trackOrder(trackingCode) {
    if (trackingCode && trackingCode !== 'undefined') {
        alert(`Mã vận đơn: ${trackingCode}\nVui lòng truy cập website của đơn vị vận chuyển để theo dõi.`);
    } else {
        alert('Mã vận đơn chưa được cập nhật. Vui lòng liên hệ hỗ trợ.');
    }
}

function contactShipper(phone) {
    if (phone && phone !== 'undefined') {
        if (confirm(`Gọi cho shipper: ${phone}?`)) {
            window.open(`tel:${phone}`);
        }
    } else {
        alert('Thông tin liên hệ shipper chưa được cập nhật.');
    }
}

function viewOrderDetail(orderId) {
    // Navigate to order detail page
    window.location.href = `order-detail.html?id=${orderId}`;
}

function rateOrder(orderId) {
    alert(`Chức năng đánh giá đơn hàng #${orderId} sẽ được cập nhật sớm!`);
}

function reorder(orderId) {
    if (confirm('Bạn muốn mua lại các sản phẩm trong đơn hàng này?')) {
        // This would typically add the items back to cart
        alert('Đã thêm sản phẩm vào giỏ hàng!');
        window.location.href = '../../index.html';
    }
}

function viewRefundStatus(orderId) {
    alert(`Xem trạng thái hoàn tiền cho đơn hàng #${orderId}`);
}

// Utility functions
function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Mock data for fallback
function getMockOrdersData() {
    return [
        {
            id: 1,
            orderDate: new Date().toISOString(),
            status: 'CHO_XAC_NHAN',
            items: [
                {
                    product_name: 'UEH Essential Tee',
                    quantity: 2,
                    price: 250000,
                    image: '../../assets/images/products/shirt.png'
                }
            ],
            subtotal: 500000,
            shippingFee: 30000,
            total: 530000,
            paymentMethod: 'COD',
            shippingMethod: 'Giao tận nơi',
            eta: '2-3 ngày',
            shippingAddress: '123 Nguyễn Đình Chiểu, Q.3, TP.HCM'
        }
    ];
}