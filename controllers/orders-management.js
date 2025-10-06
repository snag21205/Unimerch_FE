// Orders Page JavaScript

// Check if user is logged in
if (localStorage.getItem('isLoggedIn') !== 'true') {
    alert('Please login to access this page');
    window.location.href = '../auth/login.html';
}

// Mock Orders Data
const ordersData = {
    CHO_XAC_NHAN: [
        {
            id: "DH001",
            orderDate: "2025-09-14T10:30:00",
            status: "CHO_XAC_NHAN",
            items: [
                {
                    id: 1,
                    name: "Áo Thun Nam Basic",
                    variant: "Size: L, Màu: Đen",
                    quantity: 2,
                    price: 299000,
                    image: "/assets/images/products/shirt.png"
                },
                {
                    id: 2,
                    name: "Quần Jeans Slim Fit",
                    variant: "Size: 32, Màu: Xanh đậm",
                    quantity: 1,
                    price: 599000,
                    image: "/assets/images/products/SP-04.png"
                }
            ],
            subtotal: 1197000,
            shippingFee: 30000,
            total: 1227000,
            paymentMethod: "COD",
            shippingMethod: "Giao tận nơi",
            eta: "2-3 ngày"
        },
        {
            id: "DH002",
            orderDate: "2025-09-13T15:20:00",
            status: "CHO_XAC_NHAN",
            items: [
                {
                    id: 3,
                    name: "Áo Sơ Mi Công Sở",
                    variant: "Size: M, Màu: Trắng",
                    quantity: 1,
                    price: 449000,
                    image: "/assets/images/products/SP-25.png"
                }
            ],
            subtotal: 449000,
            shippingFee: 25000,
            total: 474000,
            paymentMethod: "Chuyển khoản",
            shippingMethod: "Nhận tại trường",
            eta: "1-2 ngày"
        }
    ],
    VAN_CHUYEN: [
        {
            id: "DH003",
            orderDate: "2025-09-12T09:15:00",
            status: "VAN_CHUYEN",
            items: [
                {
                    id: 4,
                    name: "Hoodie Unisex",
                    variant: "Size: L, Màu: Xám",
                    quantity: 1,
                    price: 699000,
                    image: "/assets/images/products/shirt.png"
                }
            ],
            subtotal: 699000,
            shippingFee: 30000,
            total: 729000,
            paymentMethod: "Chuyển khoản",
            shippingMethod: "Giao tận nơi",
            eta: "Dự kiến giao: 15/09/2025",
            trackingCode: "VN123456789"
        }
    ],
    CHO_GIAO_HANG: [
        {
            id: "DH004",
            orderDate: "2025-09-11T14:45:00",
            status: "CHO_GIAO_HANG",
            items: [
                {
                    id: 5,
                    name: "Váy Midi Hoa",
                    variant: "Size: S, Màu: Hồng",
                    quantity: 1,
                    price: 399000,
                    image: "/assets/images/products/SP-04.png"
                }
            ],
            subtotal: 399000,
            shippingFee: 25000,
            total: 424000,
            paymentMethod: "COD",
            shippingMethod: "Giao tận nơi",
            eta: "Hôm nay (14/09)",
            shipperPhone: "0912345678"
        }
    ],
    HOAN_THANH: [
        {
            id: "DH005",
            orderDate: "2025-09-08T11:20:00",
            deliveredDate: "2025-09-10T16:30:00",
            status: "HOAN_THANH",
            items: [
                {
                    id: 6,
                    name: "Blazer Nữ Công Sở",
                    variant: "Size: M, Màu: Đen",
                    quantity: 1,
                    price: 899000,
                    image: "/assets/images/products/SP-25.png"
                }
            ],
            subtotal: 899000,
            shippingFee: 30000,
            total: 929000,
            paymentMethod: "Chuyển khoản",
            shippingMethod: "Giao tận nơi"
        }
    ],
    DA_HUY: [
        {
            id: "DH006",
            orderDate: "2025-09-07T13:10:00",
            cancelledDate: "2025-09-07T18:00:00",
            status: "DA_HUY",
            items: [
                {
                    id: 7,
                    name: "Áo Khoác Denim",
                    variant: "Size: L, Màu: Xanh nhạt",
                    quantity: 1,
                    price: 799000,
                    image: "/assets/images/products/shirt.png"
                }
            ],
            subtotal: 799000,
            shippingFee: 30000,
            total: 829000,
            paymentMethod: "COD",
            shippingMethod: "Giao tận nơi",
            cancelReason: "Khách hàng đổi ý"
        }
    ],
    TRA_HOAN_TIEN: [
        {
            id: "DH007",
            orderDate: "2025-09-05T16:25:00",
            returnDate: "2025-09-12T10:00:00",
            status: "TRA_HOAN_TIEN",
            items: [
                {
                    id: 8,
                    name: "Chân Váy Xòe",
                    variant: "Size: M, Màu: Đỏ",
                    quantity: 1,
                    price: 349000,
                    image: "/assets/images/products/SP-04.png"
                }
            ],
            subtotal: 349000,
            shippingFee: 25000,
            total: 374000,
            paymentMethod: "Chuyển khoản",
            shippingMethod: "Giao tận nơi",
            returnReason: "Sản phẩm bị lỗi",
            refundStatus: "Đang xử lý"
        }
    ]
};

// Current active status
let currentStatus = 'CHO_XAC_NHAN';

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    setupTabSwitching();
    renderOrders(currentStatus);
});

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
    const orders = ordersData[status] || [];

    if (orders.length === 0) {
        container.innerHTML = '';
        emptyState.classList.remove('d-none');
        return;
    }

    emptyState.classList.add('d-none');
    container.innerHTML = orders.map(order => createOrderCard(order)).join('');
}

// Create order card HTML
function createOrderCard(order) {
    const statusConfig = getStatusConfig(order.status);
    const itemsHtml = order.items.map(item => `
        <div class="order-item">
            <img src="${item.image}" alt="${item.name}" class="item-image">
            <div class="item-details">
                <h6 class="item-name">${item.name}</h6>
                <p class="item-variant">${item.variant}</p>
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
                        <span>${formatPrice(order.shippingFee)}</span>
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
                    </div>
                    
                    <div class="order-actions">
                        ${actionsHtml}
                        <a href="#" class="btn btn-link order-detail-link">Xem chi tiết đơn</a>
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
            return '<button class="btn btn-outline-danger btn-sm">Huỷ đơn</button>';
        case 'VAN_CHUYEN':
            return '<button class="btn btn-outline-primary btn-sm">Theo dõi vận đơn</button>';
        case 'CHO_GIAO_HANG':
            return '<button class="btn btn-outline-primary btn-sm">Liên hệ shipper</button>';
        case 'HOAN_THANH':
            return `
                <button class="btn btn-outline-warning btn-sm me-2">Đánh giá</button>
                <button class="btn btn-primary btn-sm">Mua lại</button>
            `;
        case 'DA_HUY':
            return '<button class="btn btn-primary btn-sm">Mua lại</button>';
        case 'TRA_HOAN_TIEN':
            return '<button class="btn btn-outline-info btn-sm">Xem tiến trình hoàn tiền</button>';
        default:
            return '';
    }
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