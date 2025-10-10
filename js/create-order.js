// Create Order Page JavaScript

// Check if user is logged in
if (localStorage.getItem('isLoggedIn') !== 'true') {
    alert('Vui lòng đăng nhập để tạo đơn hàng');
    window.location.href = '../auth/login.html';
}

let orderData = {
    items: [],
    fromCart: false,
    subtotal: 0,
    shippingFee: 30000,
    total: 0
};

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    loadOrderData();
    setupEventListeners();
    loadUserProfile();
});

// Load order data from URL parameters or cart
async function loadOrderData() {
    try {
        showLoadingState();

        const urlParams = new URLSearchParams(window.location.search);
        const fromCart = urlParams.get('from') === 'cart';
        const productId = urlParams.get('productId') || urlParams.get('product_id'); // Support both
        const quantity = urlParams.get('quantity');
        const size = urlParams.get('size');
        const color = urlParams.get('color');

        if (fromCart) {
            // Load from cart
            await loadFromCart();
        } else if (productId && quantity) {
            // Load single product with optional size and color
            await loadSingleProduct(productId, quantity, size, color);
        } else {
            throw new Error('Không có thông tin sản phẩm để tạo đơn hàng');
        }

        hideLoadingState();
        renderOrderItems();
        calculateTotal();

    } catch (error) {
        console.error('❌ Failed to load order data:', error);
        showErrorState(error.message);
    }
}

// Helper function to transform image URL (similar to product-detail.js)
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

// Load items from cart
async function loadFromCart() {
    try {
        if (window.cartService) {
            const cartData = cartService.getCart();
            console.log('🛒 Local cart data:', JSON.stringify(cartData, null, 2));
            
            if (!cartData.items || cartData.items.length === 0) {
                throw new Error('Giỏ hàng của bạn đang trống');
            }

            // Also check server cart to make sure it's in sync
            if (window.apiService && window.apiService.isAuthenticated()) {
                try {
                    const serverCart = await apiService.getCart();
                    console.log('🛒 Server cart data:', JSON.stringify(serverCart, null, 2));
                } catch (error) {
                    console.warn('⚠️ Could not fetch server cart:', error);
                }
            }

            orderData.items = cartData.items.map(item => {
                const orderItem = {
                    product_id: item.product_id,
                    product_name: item.product_name || item.name,
                    quantity: item.quantity,
                    price: parseFloat(item.product_price || item.price),
                    discount_price: item.product_discount_price || item.discount_price,
                    image: transformImageUrl(item.product_image || item.image)
                };

                // Only include size and color if they exist in cart
                if (item.size && item.size !== null && item.size !== '') {
                    orderItem.size = item.size;
                }
                if (item.color && item.color !== null && item.color !== '') {
                    orderItem.color = item.color;
                }

                return orderItem;
            });
            orderData.fromCart = true;

        } else {
            throw new Error('Không thể truy cập giỏ hàng');
        }
    } catch (error) {
        throw new Error('Không thể tải thông tin từ giỏ hàng: ' + error.message);
    }
}

// Load single product
async function loadSingleProduct(productId, quantity, size = null, color = null) {
    try {
        if (window.apiService) {
            const response = await apiService.getProductDetail(productId);
            if (response.success && response.data) {
                const product = response.data;
                const item = {
                    product_id: parseInt(productId),
                    product_name: product.name,
                    quantity: parseInt(quantity),
                    price: parseFloat(product.price),
                    discount_price: product.discount_price ? parseFloat(product.discount_price) : null,
                    image: transformImageUrl(product.image_url)
                };

                // Only add size and color if they were provided (product has these options)
                if (size) {
                    item.size = size;
                }
                if (color) {
                    item.color = color;
                }

                orderData.items = [item];
                orderData.fromCart = false;
            } else {
                throw new Error('Không tìm thấy sản phẩm');
            }
        } else {
            throw new Error('Không thể tải thông tin sản phẩm');
        }
    } catch (error) {
        throw new Error('Không thể tải thông tin sản phẩm: ' + error.message);
    }
}

// Load user profile
async function loadUserProfile() {
    try {
        if (window.apiService) {
            const response = await apiService.getUserProfile();
            if (response.success && response.data) {
                const user = response.data;
                
                // Fill form with user data
                document.getElementById('fullName').value = user.fullName || '';
                document.getElementById('phone').value = user.phone || '';
                document.getElementById('email').value = user.email || '';
                document.getElementById('address').value = user.address || '';
            }
        }
    } catch (error) {
        console.warn('Could not load user profile:', error);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Create order button
    document.getElementById('createOrderBtn').addEventListener('click', handleCreateOrder);
    
    // Form validation
    const form = document.getElementById('shippingForm');
    form.addEventListener('input', validateForm);
}

// Render order items
function renderOrderItems() {
    const container = document.getElementById('orderItems');
    
    if (!orderData.items || orderData.items.length === 0) {
        container.innerHTML = '<p class="text-muted">Không có sản phẩm nào</p>';
        return;
    }

    const itemsHtml = orderData.items.map(item => {
        const currentPrice = (item.discount_price && item.discount_price < item.price) 
            ? item.discount_price 
            : item.price;
        
        // Create size and color display
        const variants = [];
        if (item.size) variants.push(`Size: ${item.size}`);
        if (item.color) variants.push(`Màu: ${item.color}`);
        const variantText = variants.length > 0 ? `<small class="text-muted d-block">${variants.join(' • ')}</small>` : '';
        
        return `
            <div class="d-flex align-items-center mb-3 pb-3 border-bottom">
                <img src="${item.image}" 
                     alt="${item.product_name}" 
                     class="rounded me-3"
                     style="width: 60px; height: 60px; object-fit: cover;"
                     onerror="this.src='../../assets/images/products/demo.png'">
                <div class="flex-grow-1">
                    <h6 class="mb-1 fw-semibold">${item.product_name}</h6>
                    ${variantText}
                    <div class="d-flex justify-content-between align-items-center">
                        <small class="text-muted">Số lượng: ${item.quantity}</small>
                        <div class="text-end">
                            ${item.discount_price && item.discount_price < item.price ? 
                                `<small class="text-decoration-line-through text-muted">${formatPrice(item.price)}</small><br>
                                 <span class="fw-semibold text-primary">${formatPrice(currentPrice)}</span>` :
                                `<span class="fw-semibold">${formatPrice(currentPrice)}</span>`
                            }
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = itemsHtml;
}

// Calculate total
function calculateTotal() {
    orderData.subtotal = orderData.items.reduce((total, item) => {
        const currentPrice = (item.discount_price && item.discount_price < item.price) 
            ? item.discount_price 
            : item.price;
        return total + (currentPrice * item.quantity);
    }, 0);

    orderData.total = orderData.subtotal + orderData.shippingFee;

    // Update UI
    document.getElementById('subtotal').textContent = formatPrice(orderData.subtotal);
    document.getElementById('shippingFee').textContent = formatPrice(orderData.shippingFee);
    document.getElementById('totalAmount').textContent = formatPrice(orderData.total);
}

// Validate form
function validateForm() {
    const fullName = document.getElementById('fullName').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();
    
    const isValid = fullName !== '' && phone !== '' && address !== '';
    
    document.getElementById('createOrderBtn').disabled = !isValid;
    
    return isValid;
}

// Handle create order
async function handleCreateOrder() {
    try {
        if (!validateForm()) {
            UiUtils.showToast('Vui lòng điền đầy đủ thông tin bắt buộc', 'warning');
            return;
        }

        // Show loading state
        const createBtn = document.getElementById('createOrderBtn');
        const originalText = createBtn.innerHTML;
        createBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status"></span>Đang tạo đơn hàng...';
        createBtn.disabled = true;

        // Collect form data
        const formData = {
            fullName: document.getElementById('fullName').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            email: document.getElementById('email').value.trim(),
            address: document.getElementById('address').value.trim(),
            notes: document.getElementById('notes').value.trim(),
            paymentMethod: document.querySelector('input[name="paymentMethod"]:checked').value
        };

        // Prepare order data - use form data again since payment method is fixed
        const orderPayload = {
            shipping_address: formData.address,
            payment_method: formData.paymentMethod
        };

        // Always include items array instead of using from_cart flag
        orderPayload.items = orderData.items.map(item => {
            const orderItem = {
                product_id: parseInt(item.product_id), // Ensure it's a number
                quantity: parseInt(item.quantity)      // Ensure it's a number
            };

            // Only include size and color if they exist
            if (item.size && item.size !== null && item.size !== '') {
                orderItem.size = item.size;
            }
            if (item.color && item.color !== null && item.color !== '') {
                orderItem.color = item.color;
            }

            return orderItem;
        });

        console.log('🔍 Form data collected:', JSON.stringify(formData, null, 2));
        console.log('🔍 Order payload prepared:', JSON.stringify(orderPayload, null, 2));

        // If this was from cart, try to sync cart with server first
        if (orderData.fromCart && window.cartService) {
            try {
                console.log('🔄 Syncing local cart with server...');
                await cartService.syncWithServer();
            } catch (error) {
                console.warn('⚠️ Could not sync cart with server:', error);
            }
        }

        // Create order - always use direct order approach with explicit items
        let response;
        if (window.orderService) {
            response = await orderService.createDirectOrder(
                orderPayload.items,
                orderPayload.shipping_address,
                orderPayload.payment_method
            );
        } else {
            response = await window.apiService.createOrder(orderPayload);
            if (response.success) {
                response = response.data;
            } else {
                throw new Error(response.message || 'Không thể tạo đơn hàng');
            }
        }

        // Success
        UiUtils.showToast('Tạo đơn hàng thành công!', 'success');
        
        // Clear cart if order was from cart
        if (orderData.fromCart && window.cartService) {
            try {
                await cartService.clearCart();
            } catch (error) {
                console.warn('Could not clear cart:', error);
            }
        }

        // Redirect to order detail
        setTimeout(() => {
            window.location.href = `order-detail.html?id=${response.id}`;
        }, 1000);

    } catch (error) {
        console.error('❌ Failed to create order:', error);
        UiUtils.showToast(error.message || 'Có lỗi xảy ra khi tạo đơn hàng', 'error');

        // Restore button
        const createBtn = document.getElementById('createOrderBtn');
        createBtn.innerHTML = '<i class="bi bi-check-circle me-2"></i>Đặt hàng';
        createBtn.disabled = false;
    }
}

// Show loading state
function showLoadingState() {
    document.getElementById('loadingState').classList.remove('d-none');
    document.getElementById('createOrderContent').classList.add('d-none');
    document.getElementById('errorState').classList.add('d-none');
}

// Hide loading state
function hideLoadingState() {
    document.getElementById('loadingState').classList.add('d-none');
    document.getElementById('createOrderContent').classList.remove('d-none');
}

// Show error state
function showErrorState(message) {
    document.getElementById('loadingState').classList.add('d-none');
    document.getElementById('createOrderContent').classList.add('d-none');
    document.getElementById('errorState').classList.remove('d-none');
    document.getElementById('errorMessage').textContent = message;
}

// Utility function
function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);
}