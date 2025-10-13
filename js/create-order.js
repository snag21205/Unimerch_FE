// Create Order Page JavaScript

// Check if user is logged in
if (localStorage.getItem('isLoggedIn') !== 'true') {
    alert('Vui lòng đăng nhập để tạo đơn hàng');
    window.location.href = '../auth/login.html';
}

let orderData = {
    items: [],
    fromCart: false,
    selectedItemIds: [], // Track selected cart item IDs
    subtotal: 0,
    shippingFee: 30000,
    total: 0
};

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    loadOrderData();
    setupEventListeners();
    loadUserProfile();
    
    // Clean up sessionStorage if not from cart
    const urlParams = new URLSearchParams(window.location.search);
    const fromCart = urlParams.get('from') === 'cart';
    if (!fromCart) {
        sessionStorage.removeItem('selectedCartItems');
    }
});

// Load order data from URL parameters or cart
async function loadOrderData() {
    try {
        showLoadingState();

        const urlParams = new URLSearchParams(window.location.search);
        const fromCart = urlParams.get('from') === 'cart' || !urlParams.has('from');
        const isBuyNow = urlParams.get('buyNow') === 'true';
        
        if (fromCart) {
            // Load from cart (main flow)
            await loadFromCart(isBuyNow);
        } else {
            // Fallback - redirect to cart if not from cart
            console.log('Not from cart, redirecting to cart page');
            window.location.href = 'cart.html';
            return;
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
async function loadFromCart(isBuyNow = false) {
    try {
        if (window.cartService) {
            const cartData = cartService.getCart();
            console.log('🛒 Local cart data:', JSON.stringify(cartData, null, 2));
            
            if (!cartData.items || cartData.items.length === 0) {
                throw new Error('Giỏ hàng của bạn đang trống');
            }

            // Get selected items from sessionStorage (if coming from cart with selections)
            const selectedItemIds = JSON.parse(sessionStorage.getItem('selectedCartItems') || '[]');
            console.log('🎯 Selected item IDs:', selectedItemIds);

            let itemsToOrder;
            if (selectedItemIds.length > 0) {
                // Filter only selected items
                itemsToOrder = cartData.items.filter(item => selectedItemIds.includes(item.id));
                // Store the selected IDs for later use when removing items
                orderData.selectedItemIds = selectedItemIds;
            } else if (isBuyNow && cartData.items.length > 0) {
                // If this is from buy now, find the exact product that was purchased
                const buyNowProductId = sessionStorage.getItem('buyNowProductId');
                const buyNowSize = sessionStorage.getItem('buyNowSize') || '';
                const buyNowColor = sessionStorage.getItem('buyNowColor') || '';
                
                console.log('🎯 Looking for buy now product:', { buyNowProductId, buyNowSize, buyNowColor });
                
                // Find the matching item in cart
                let targetItem = null;
                
                if (buyNowProductId) {
                    // Find item with matching product_id and optional size/color
                    targetItem = cartData.items.find(item => {
                        const productIdMatch = item.product_id.toString() === buyNowProductId;
                        const sizeMatch = !buyNowSize || (item.size || '') === buyNowSize;
                        const colorMatch = !buyNowColor || (item.color || '') === buyNowColor;
                        
                        return productIdMatch && sizeMatch && colorMatch;
                    });
                }
                
                // If exact match not found, try to find by product_id only (fallback)
                if (!targetItem && buyNowProductId) {
                    targetItem = cartData.items.find(item => 
                        item.product_id.toString() === buyNowProductId
                    );
                }
                
                // If still not found, use the last item as fallback
                if (!targetItem) {
                    targetItem = cartData.items[cartData.items.length - 1];
                    console.warn('⚠️ Could not find exact buy now product, using last item');
                }
                
                if (targetItem) {
                    itemsToOrder = [targetItem];
                    orderData.selectedItemIds = [targetItem.id];
                    console.log('✅ Auto-selected buy now item:', targetItem);
                } else {
                    throw new Error('Không tìm thấy sản phẩm vừa thêm vào giỏ hàng');
                }
                
                // Clear session storage
                sessionStorage.removeItem('buyNowProductId');
                sessionStorage.removeItem('buyNowSize');
                sessionStorage.removeItem('buyNowColor');
            } else {
                // If no selection info, use all items (backward compatibility)
                itemsToOrder = cartData.items;
            }

            if (itemsToOrder.length === 0) {
                throw new Error('Không có sản phẩm nào được chọn');
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

            orderData.items = itemsToOrder.map(item => {
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
            orderData.fromCart = true; // Always use cart flow now

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
                orderData.fromCart = false; // Direct product order, not from cart
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

        console.log('🔍 Form data collected:', JSON.stringify(formData, null, 2));

        let tempRemovedItems = []; // Track temporarily removed items

        try {
            // If this order is from cart with selected items, we need to manipulate cart temporarily
            if (orderData.fromCart && orderData.selectedItemIds && orderData.selectedItemIds.length > 0) {
                // Get current cart
                await cartService.syncWithServer();
                const currentCart = cartService.getCart();
                
                // Find items to temporarily remove (not selected)
                const itemsToTempRemove = currentCart.items.filter(item => 
                    !orderData.selectedItemIds.includes(item.id)
                );
                
                // Remove unselected items temporarily
                for (const item of itemsToTempRemove) {
                    try {
                        await apiService.removeFromCart(item.id);
                        tempRemovedItems.push({
                            product_id: item.product_id,
                            quantity: item.quantity,
                            size: item.size,
                            color: item.color
                        });
                    } catch (error) {
                        console.warn('Failed to remove item temporarily:', error);
                    }
                }
            }

            // Prepare order payload - use from_cart when from cart, direct when from product
            // Normalize payment method for backend compatibility
            const normalizedPaymentMethod = window.paymentService ? 
                paymentService.normalizePaymentMethod(formData.paymentMethod) : 
                formData.paymentMethod;

            const orderPayload = {
                shipping_address: formData.address,
                payment_method: normalizedPaymentMethod
            };

            console.log('🔍 Payment method normalized:', {
                original: formData.paymentMethod,
                normalized: normalizedPaymentMethod
            });

            // Decide approach based on source
            if (orderData.fromCart) {
                // From cart - use from_cart approach (cart now contains only selected items)
                orderPayload.from_cart = true;
                console.log('� Using from_cart approach');
            } else {
                // From product detail - use direct order
                orderPayload.items = orderData.items.map(item => {
                    const orderItem = {
                        product_id: parseInt(item.product_id),
                        quantity: parseInt(item.quantity)
                    };

                    if (item.size && item.size !== null && item.size !== '') {
                        orderItem.size = item.size;
                    }
                    if (item.color && item.color !== null && item.color !== '') {
                        orderItem.color = item.color;
                    }

                    return orderItem;
                });
            }

            console.log('🔍 Order payload prepared:', JSON.stringify(orderPayload, null, 2));

            // Step 1: Create order (without payment)
            let orderResponse;
            if (orderPayload.from_cart && window.orderService) {
                orderResponse = await orderService.createOrderFromCart(
                    orderPayload.shipping_address,
                    orderPayload.payment_method
                );
            } else if (orderPayload.items && window.orderService) {
                orderResponse = await orderService.createDirectOrder(
                    orderPayload.items,
                    orderPayload.shipping_address,
                    orderPayload.payment_method
                );
            } else {
                orderResponse = await window.apiService.createOrder(orderPayload);
                if (orderResponse.success) {
                    orderResponse = orderResponse.data;
                } else {
                    throw new Error(orderResponse.message || 'Không thể tạo đơn hàng');
                }
            }

            console.log('✅ Order created successfully:', orderResponse);

            // Step 2: Create payment for the order (API v2.0 requirement)
            if (window.paymentService && orderResponse.id) {
                try {
                    console.log('💳 Creating payment for order:', orderResponse.id);
                    
                    // Generate transaction ID for non-COD payments
                    let transactionId = null;
                    if (paymentService.requiresTransactionId(formData.paymentMethod)) {
                        transactionId = paymentService.generateTransactionId(
                            normalizedPaymentMethod, // Use normalized method
                            orderResponse.id
                        );
                    }

                    const paymentResponse = await paymentService.createPayment(
                        orderResponse.id,
                        normalizedPaymentMethod, // Use normalized payment method
                        transactionId
                    );

                    console.log('✅ Payment created successfully:', paymentResponse.data);

                    // For COD, automatically mark as pending (default)
                    // For other methods, would need real payment gateway integration
                    if (normalizedPaymentMethod.toLowerCase() !== 'cod' && transactionId) {
                        // Simulate payment processing (in real app, this would be payment gateway callback)
                        setTimeout(async () => {
                            try {
                                await paymentService.updatePaymentStatus(
                                    paymentResponse.data.id,
                                    'completed',
                                    transactionId + '_CONFIRMED'
                                );
                                console.log('💳 Payment status updated to completed');
                            } catch (error) {
                                console.warn('Failed to update payment status:', error);
                            }
                        }, 2000);
                    }

                } catch (paymentError) {
                    console.warn('⚠️ Payment creation failed (API endpoints may not be implemented yet):', paymentError.message);
                    // Don't fail the entire process if payment creation fails
                    // Order is still valid, payment can be created later manually if needed
                    
                    if (paymentError.message.includes('API Service not available')) {
                        console.warn('⚠️ API Service not ready, skipping payment creation');
                    }
                }
            } else {
                console.warn('⚠️ Payment service not available or order ID missing, skipping payment creation');
            }

            // Success
            UiUtils.showToast('Tạo đơn hàng thành công!', 'success');

            // If from cart: backend already cleared cart, no need to manually clear
            // If from product: no cart manipulation needed

            // Clean up sessionStorage
            sessionStorage.removeItem('selectedCartItems');

            // Redirect to order detail
            setTimeout(() => {
                window.location.href = `order-detail.html?id=${orderResponse.id}`;
            }, 1000);

        } finally {
            // Restore temporarily removed items back to cart
            if (tempRemovedItems.length > 0) {
                for (const item of tempRemovedItems) {
                    try {
                        await apiService.addToCart(item.product_id, item.quantity);
                    } catch (error) {
                        console.warn('Failed to restore item:', error);
                    }
                }
                // Sync cart after restoration
                await cartService.syncWithServer();
            }
        }

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