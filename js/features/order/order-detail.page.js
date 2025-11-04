// Order Detail Page JavaScript

// Check if user is logged in
if (localStorage.getItem('isLoggedIn') !== 'true') {
    alert('Vui lòng đăng nhập để truy cập trang này');
    window.location.href = '../auth/login.html';
}

let currentOrder = null;

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

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    const orderId = getOrderIdFromUrl();
    if (orderId) {
        loadOrderDetail(orderId);
    } else {
        showErrorState('Không tìm thấy ID đơn hàng');
    }
});

// Get order ID from URL
function getOrderIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Load order detail
async function loadOrderDetail(orderId) {
    try {
        showLoadingState();

        if (window.orderService) {
            const orderData = await orderService.getOrderDetail(orderId);
            
            if (orderData) {
                currentOrder = orderData;
                renderOrderDetail(orderData);
                hideLoadingState();
            } else {
                throw new Error('Không tìm thấy đơn hàng');
            }
        } else {
            throw new Error('Không thể kết nối đến dịch vụ đơn hàng');
        }
        
    } catch (error) {
        hideLoadingState();
        showErrorState(error.message || 'Có lỗi xảy ra khi tải chi tiết đơn hàng');
    }
}

// Show loading state
function showLoadingState() {
    document.getElementById('loadingState').classList.remove('d-none');
    document.getElementById('orderDetailContent').classList.add('d-none');
    document.getElementById('errorState').classList.add('d-none');
}

// Hide loading state
function hideLoadingState() {
    document.getElementById('loadingState').classList.add('d-none');
    document.getElementById('orderDetailContent').classList.remove('d-none');
}

// Show error state
function showErrorState(message) {
    document.getElementById('loadingState').classList.add('d-none');
    document.getElementById('orderDetailContent').classList.add('d-none');
    document.getElementById('errorState').classList.remove('d-none');
    
    const errorMessage = document.querySelector('#errorState p');
    if (errorMessage) {
        errorMessage.textContent = message;
    }
}

// Render order detail
function renderOrderDetail(order) {
    // Update document title
    document.title = `Đơn hàng #${order.id} - Unimerch`;
    
    // Render header
    renderOrderHeader(order);
    
    // Render progress
    renderOrderProgress(order);
    
    // Render items
    renderOrderItems(order);
    
    // Render summary
    renderOrderSummary(order);
    
    // Render shipping & payment info
    renderShippingPaymentInfo(order);
    
    // Render actions
    renderOrderActions(order);
}

// Render order header
function renderOrderHeader(order) {
    document.getElementById('orderIdDisplay').textContent = `#${order.id}`;
    document.getElementById('orderDateDisplay').textContent = formatDate(order.created_at);
    
    const statusBadge = document.getElementById('orderStatusBadge');
    const statusConfig = getStatusConfig(order.status);
    statusBadge.textContent = statusConfig.label;
    statusBadge.className = `badge fs-6 px-3 py-2 rounded-pill ${statusConfig.class}`;
}

// Render order progress
function renderOrderProgress(order) {
    const progressContainer = document.getElementById('orderProgress');
    const status = order.status;
    
    const steps = [
        { key: 'pending', label: 'Đơn hàng đã đặt', icon: '📝' },
        { key: 'processing', label: 'Đang vận chuyển', icon: '🚚' },
        { key: 'shipped', label: 'Chờ giao hàng', icon: '⌛' },
        { key: 'delivered', label: 'Đã giao hàng', icon: '✅' }
    ];
    
    const statusOrder = ['pending', 'processing', 'shipped', 'delivered'];
    const currentIndex = statusOrder.indexOf(status);
    
    let progressHtml = '<div class="d-flex justify-content-between align-items-center">';
    
    steps.forEach((step, index) => {
        const isCompleted = index <= currentIndex;
        const isActive = index === currentIndex;
        
        progressHtml += `
            <div class="text-center flex-fill">
                <div class="progress-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''} mx-auto mb-2">
                    <span class="step-icon">${step.icon}</span>
                </div>
                <small class="text-light">${step.label}</small>
            </div>
        `;
        
        if (index < steps.length - 1) {
            progressHtml += `
                <div class="progress-line ${isCompleted && index < currentIndex ? 'completed' : ''}"></div>
            `;
        }
    });
    
    progressHtml += '</div>';
    progressContainer.innerHTML = progressHtml;
}

// Render order items
function renderOrderItems(order) {
    const itemsContainer = document.getElementById('orderItems');
    const items = order.items || [];
    
    if (items.length === 0) {
        itemsContainer.innerHTML = '<p class="text-light">Không có sản phẩm nào</p>';
        return;
    }
    
    const itemsHtml = items.map(item => `
        <div class="d-flex align-items-center py-3 border-bottom">
            <img src="${transformImageUrl(item.image || item.product_image)}" 
                 alt="${item.product_name || item.name}" 
                 class="rounded me-3"
                 style="width: 80px; height: 80px; object-fit: cover;"
                 onerror="this.src='../../assets/images/products/demo.png'">
            <div class="flex-grow-1">
                <h6 class="mb-1">${item.product_name || item.name}</h6>
                <p class="text-light mb-1 small">Số lượng: x${item.quantity}</p>
                <p class="mb-0">
                    <span class="fw-semibold">${formatPrice(item.price)}</span>
                    ${item.quantity > 1 ? `<small class="text-light ms-2">Tổng: ${formatPrice(item.price * item.quantity)}</small>` : ''}
                </p>
            </div>
        </div>
    `).join('');
    
    itemsContainer.innerHTML = itemsHtml;
}

// Render order summary
function renderOrderSummary(order) {
    const summaryContainer = document.getElementById('orderSummary');
    
    const subtotal = parseFloat(order.total_amount || 0);
    const shippingFee = 30000; // Default shipping fee
    const total = subtotal + shippingFee;
    
    summaryContainer.innerHTML = `
        <div class="d-flex justify-content-between mb-2">
            <span>Tạm tính:</span>
            <span>${formatPrice(subtotal)}</span>
        </div>
        <div class="d-flex justify-content-between mb-2">
            <span>Phí vận chuyển:</span>
            <span>${formatPrice(shippingFee)}</span>
        </div>
        <hr>
        <div class="d-flex justify-content-between fw-bold">
            <span>Tổng thanh toán:</span>
            <span class="text-primary">${formatPrice(total)}</span>
        </div>
    `;
}

// Render shipping & payment info
function renderShippingPaymentInfo(order) {
    const infoContainer = document.getElementById('shippingPaymentInfo');
    
    infoContainer.innerHTML = `
        <div class="mb-3">
            <h6 class="mb-2">📍 Địa chỉ giao hàng</h6>
            <p class="mb-0 small">${order.shipping_address || 'Chưa có thông tin'}</p>
        </div>
        <div class="mb-3">
            <h6 class="mb-2">💳 Phương thức thanh toán</h6>
            <p class="mb-0 small">${formatPaymentMethod(order.payment_method)}</p>
        </div>
        <div>
            <h6 class="mb-2">🚚 Phương thức giao hàng</h6>
            <p class="mb-0 small">Giao hàng tiêu chuẩn</p>
        </div>
    `;
}

// Render order actions
function renderOrderActions(order) {
    const actionsContainer = document.getElementById('orderActions');
    const status = order.status;
    
    let actionsHtml = '';
    
    switch (status) {
        case 'pending':
        case 'processing':
            actionsHtml += `
                <button class="btn btn-outline-danger" onclick="cancelOrder(${order.id})">
                    Hủy đơn hàng
                </button>
            `;
            break;
        case 'shipped':
            actionsHtml += `
                <button class="btn btn-outline-primary" onclick="trackOrder('${order.tracking_code || order.id}')">
                    Theo dõi vận đơn
                </button>
            `;
            break;
        case 'delivered':
            actionsHtml += `
                <button class="btn btn-outline-warning me-2" onclick="rateOrder(${order.id})">
                    Đánh giá
                </button>
                <button class="btn btn-success" onclick="reorder(${order.id})">
                    Mua lại
                </button>
            `;
            break;
        case 'cancelled':
            actionsHtml += `
                <button class="btn btn-success" onclick="reorder(${order.id})">
                    Mua lại
                </button>
            `;
            break;
    }
    
    actionsHtml += `
        <button class="btn btn-outline-secondary ms-auto" onclick="window.location.href='orders.html'">
            Quay lại danh sách
        </button>
    `;
    
    actionsContainer.innerHTML = actionsHtml;
}

// Action functions
async function cancelOrder(orderId) {
    if (confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
        try {
            if (window.orderService) {
                await orderService.cancelOrder(orderId);
                
                UiUtils.showToast('Đã hủy đơn hàng thành công!', 'success');
                
                // Reload order detail
                setTimeout(() => {
                    loadOrderDetail(orderId);
                }, 1000);
            } else {
                alert('Chức năng hủy đơn hàng tạm thời không khả dụng');
            }
        } catch (error) {
            UiUtils.showToast('Có lỗi xảy ra khi hủy đơn hàng', 'error');
        }
    }
}

function trackOrder(trackingCode) {
    if (trackingCode && trackingCode !== 'undefined') {
        alert(`Mã vận đơn: ${trackingCode}\nVui lòng truy cập website của đơn vị vận chuyển để theo dõi.`);
    } else {
        alert('Mã vận đơn chưa được cập nhật.');
    }
}

function rateOrder(orderId) {
    alert(`Chức năng đánh giá đơn hàng #${orderId} sẽ được cập nhật sớm!`);
}

function reorder(orderId) {
    if (confirm('Bạn muốn mua lại các sản phẩm trong đơn hàng này?')) {
        alert('Đã thêm sản phẩm vào giỏ hàng!');
        window.location.href = '../../index.html';
    }
}

// Utility functions
function getStatusConfig(status) {
    const configs = {
        'pending': { label: 'Chờ xác nhận', class: 'bg-warning text-dark' },
        'processing': { label: 'Đang vận chuyển', class: 'bg-info text-white' },
        'shipped': { label: 'Chờ giao hàng', class: 'bg-primary text-white' },
        'delivered': { label: 'Đã giao hàng', class: 'bg-success text-white' },
        'cancelled': { label: 'Đã hủy', class: 'bg-danger text-white' }
    };
    return configs[status] || { label: status, class: 'bg-secondary text-white' };
}

function formatPaymentMethod(method) {
    const methodMap = {
        'cod': 'COD (Thanh toán khi nhận hàng)',
        'credit_card': 'Thẻ tín dụng',
        'bank_transfer': 'Chuyển khoản ngân hàng',
        'momo': 'Ví MoMo',
        'zalopay': 'ZaloPay',
        'vnpay': 'VNPay'
    };
    return methodMap[method] || method || 'COD';
}

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