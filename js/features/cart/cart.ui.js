/**
 * Cart UI Components for Unimerch Frontend
 * Manages cart display and interactions
 */

class CartUI {
    constructor() {
        this.cartOffcanvas = null;
        this.cartItemsContainer = null;
        this.cartFooter = null;
        this.cartCount = null;
        this.cartSubtotal = null;
        this.selectedItems = new Set(); // Track selected items
        
        this.init();
    }

    /**
     * Initialize cart UI
     */
    init() {
        // Get DOM elements
        this.cartOffcanvas = document.getElementById('cartOffcanvas');
        this.cartItemsContainer = document.getElementById('cartItems');
        this.cartFooter = document.getElementById('cartFooter');
        this.cartCount = document.getElementById('cartCount');
        this.cartSubtotal = document.getElementById('cartSubtotal');

        // Listen to cart changes
        if (window.cartService) {
            cartService.addEventListener(this.handleCartUpdate.bind(this));
        }

        // Setup event listeners
        this.setupEventListeners();

        // Initial render
        this.render();
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Cart button click
        const cartBtn = document.getElementById('cartBtn');
        if (cartBtn) {
            cartBtn.addEventListener('click', () => {
                this.render(); // Refresh cart display when opened
            });
        }
    }

    /**
     * Handle cart updates from cart service
     */
    handleCartUpdate(cartData) {
        this.render(cartData);
    }

    /**
     * Render cart UI
     */
    render(cartData = null) {
        if (!cartData && window.cartService) {
            cartData = cartService.getCart();
        }

        if (!cartData) {
            cartData = { items: [], summary: { total_items: 0, total_amount: 0 } };
        }

        // Update cart count badge
        this.updateCartCount(cartData.summary.total_items);

        // Update cart items
        this.updateCartItems(cartData.items);

        // Update cart footer
        this.updateCartFooter(cartData.summary);
    }

    /**
     * Update cart count badge
     */
    updateCartCount(count) {
        if (this.cartCount) {
            if (count > 0) {
                this.cartCount.textContent = count;
                this.cartCount.classList.remove('d-none');
            } else {
                this.cartCount.classList.add('d-none');
            }
        }
    }

    /**
     * Update cart items display
     */
    updateCartItems(items) {
        if (!this.cartItemsContainer) return;

        if (!items || items.length === 0) {
            this.cartItemsContainer.innerHTML = `
                <div class="text-center py-5">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-muted mb-3">
                        <circle cx="8" cy="21" r="1"></circle>
                        <circle cx="19" cy="21" r="1"></circle>
                        <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57L20.5 9H5.12"></path>
                    </svg>
                    <p class="text-muted mb-0">Giỏ hàng của bạn đang trống</p>
                    <small class="text-muted">Thêm sản phẩm để bắt đầu mua sắm</small>
                </div>
            `;
            this.selectedItems.clear();
        } else {
            // Initialize all items as unselected by default
            this.selectedItems.clear();
            
            this.cartItemsContainer.innerHTML = `
                <div class="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                    <div class="form-check">
                        <input type="checkbox" 
                               class="form-check-input" 
                               id="selectAllItems"
                               onchange="cartUI.toggleSelectAll(this.checked)">
                        <label class="form-check-label fw-semibold" for="selectAllItems">
                            Chọn tất cả (${items.length})
                        </label>
                    </div>
                </div>
                ${items.map(item => this.createCartItemHTML(item)).join('')}
            `;
            
            // Auto-select for buy now flow
            this.autoSelectForBuyNow();
        }
    }

    /**
     * Auto-select cart items for buy now flow
     */
    autoSelectForBuyNow() {
        // Check if coming from buy now flow or cart after product purchase
        const urlParams = new URLSearchParams(window.location.search);
        const fromProduct = urlParams.get('from') === 'product' || urlParams.get('from') === 'buy-now';
        
        // Also check if we're on the cart page after adding from product detail
        const isCartPage = window.location.pathname.includes('cart');
        const fromCreateOrder = window.location.pathname.includes('create-order');
        const wasBuyNow = sessionStorage.getItem('lastAction') === 'buyNow';
        
        if (fromProduct || (isCartPage && wasBuyNow) || fromCreateOrder) {
            const cartItems = cartService.getCart().items;
            if (cartItems && cartItems.length > 0) {
                
                let targetItem = null;
                
                // Try to find the exact product that was purchased
                const buyNowProductId = sessionStorage.getItem('buyNowProductId');
                const buyNowSize = sessionStorage.getItem('buyNowSize') || '';
                const buyNowColor = sessionStorage.getItem('buyNowColor') || '';
                
                if (buyNowProductId) {
                    
                    // Find item with matching product_id and optional size/color
                    targetItem = cartItems.find(item => {
                        const productIdMatch = item.product_id.toString() === buyNowProductId;
                        const sizeMatch = !buyNowSize || (item.size || '') === buyNowSize;
                        const colorMatch = !buyNowColor || (item.color || '') === buyNowColor;
                        
                        return productIdMatch && sizeMatch && colorMatch;
                    });
                    
                    // If exact match not found, try to find by product_id only
                    if (!targetItem) {
                        targetItem = cartItems.find(item => 
                            item.product_id.toString() === buyNowProductId
                        );
                    }
                }
                
                // Fallback to the most recently added item (last item)
                if (!targetItem) {
                    targetItem = cartItems[cartItems.length - 1];
                }
                
                if (targetItem) {
                    this.selectedItems.add(targetItem.id);
                    
                    // Update checkbox for target item
                    const checkbox = document.querySelector(`input[data-item-id="${targetItem.id}"]`);
                    if (checkbox) {
                        checkbox.checked = true;
                    }
                    
                    // Update select all checkbox state
                    this.updateSelectAllCheckbox();
                    
                    // Update cart footer
                    if (window.cartService) {
                        const cartData = cartService.getCart();
                        this.updateCartFooter(cartData.summary);
                    }
                }
                
                // Clear the session flag for cart UI (but keep for create-order)
                if (isCartPage) {
                    sessionStorage.removeItem('lastAction');
                    sessionStorage.removeItem('buyNowProductId');
                    sessionStorage.removeItem('buyNowSize');
                    sessionStorage.removeItem('buyNowColor');
                }
            }
        }
    }

    /**
     * Create HTML for a cart item
     */
    createCartItemHTML(item) {
        // Get original price from either field - handle string conversion
        const originalPrice = parseFloat(item.product_price || item.price || 0);
        
        // Get discount price - check multiple possible field names and convert to number
        const rawDiscountPrice = item.product_discount_price || item.discount_price || null;
        const discountPrice = rawDiscountPrice ? parseFloat(rawDiscountPrice) : null;
        
        // Use discount price if available and valid
        const currentPrice = (discountPrice && discountPrice > 0) ? discountPrice : originalPrice;
        const subtotal = currentPrice * item.quantity;

        // Get image URL - handle different field names
        let imageUrl = item.product_image || item.image || item.image_url || item.product_image || 'assets/images/products/demo.png';
        
        // If image doesn't start with http or assets, assume it's a filename
        if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('assets')) {
            // Remove any leading path separators and construct proper path
            const filename = imageUrl.replace(/^.*[\\\/]/, ''); // Get just filename
            if (filename === 'demo.png') {
                // Always use correct path for demo.png based on current page context
                if (window.location.pathname.includes('all-products.html')) {
                    imageUrl = '../../assets/images/products/demo.png';
                } else {
                    imageUrl = 'assets/images/products/demo.png';
                }
            } else {
                imageUrl = `assets/images/products/${filename}`;
            }
        }
        
        // Clean up any double path issues
        if (imageUrl.includes('/pages/products/')) {
            imageUrl = imageUrl.replace('/pages/products/', '');
        }

        // Check if we have a valid discount
        const hasValidDiscount = discountPrice && discountPrice > 0 && discountPrice < originalPrice;

        return `
            <div class="cart-item mb-3 pb-3 border-bottom" data-item-id="${item.id}">
                <div class="d-flex gap-3 position-relative">
                    <!-- Checkbox moved to top right -->
                    <div class="position-absolute top-0 end-0">
                        <input type="checkbox" 
                               class="form-check-input cart-item-checkbox" 
                               data-item-id="${item.id}"
                               onchange="cartUI.handleItemSelection(${item.id}, this.checked)">
                    </div>
                    
                    <div class="cart-item-image">
                        <img src="${imageUrl}" 
                             alt="${item.product_name || item.name}" 
                             class="rounded" 
                             style="width: 64px; height: 64px; object-fit: cover;"
                             onerror="this.src=window.location.pathname.includes('all-products.html') ? '../../assets/images/products/demo.png' : 'assets/images/products/demo.png'">
                    </div>
                    <div class="cart-item-details flex-grow-1" style="padding-right: 30px;">
                        <h6 class="mb-1 fw-semibold">${item.product_name || item.name}</h6>
                        <div class="d-flex align-items-center justify-content-between mb-2">
                            <div class="price-info">
                                ${hasValidDiscount ? `
                                    <span class="text-decoration-line-through text-muted small me-2">${this.formatPrice(originalPrice)}</span>
                                    <span class="text-danger fw-semibold">${this.formatPrice(discountPrice)}</span>
                                ` : `
                                    <span class="text-muted">${this.formatPrice(originalPrice)}</span>
                                `}
                            </div>
                            <button class="btn btn-link btn-sm text-danger p-0" 
                                    onclick="cartUI.removeItem(${item.id})"
                                    title="Xóa sản phẩm">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="3,6 5,6 21,6"></polyline>
                                    <path d="m19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"></path>
                                </svg>
                            </button>
                        </div>
                        <div class="d-flex align-items-center justify-content-between">
                            <div class="quantity-controls d-flex align-items-center">
                                <button class="btn btn-outline-secondary btn-sm" 
                                        onclick="cartUI.updateQuantity(${item.id}, ${item.quantity - 1})"
                                        ${item.quantity <= 1 ? 'disabled' : ''}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <line x1="5" y1="12" x2="19" y2="12"></line>
                                    </svg>
                                </button>
                                <span class="mx-2 fw-semibold">${item.quantity}</span>
                                <button class="btn btn-outline-secondary btn-sm" 
                                        onclick="cartUI.updateQuantity(${item.id}, ${item.quantity + 1})">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <line x1="12" y1="5" x2="12" y2="19"></line>
                                        <line x1="5" y1="12" x2="19" y2="12"></line>
                                    </svg>
                                </button>
                            </div>
                            <strong class="text-primary">${this.formatPrice(subtotal)}</strong>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Update cart footer
     */
    updateCartFooter(summary) {
        if (!this.cartFooter) return;

        if (summary.total_items > 0) {
            this.cartFooter.classList.remove('d-none');
            
            // Calculate selected items totals
            const selectedTotals = this.calculateSelectedTotals();
            
            if (this.cartSubtotal) {
                this.cartSubtotal.textContent = this.formatPrice(selectedTotals.amount);
            }
            
            // Update selected count info
            const selectedCountElement = this.cartFooter.querySelector('.selected-count');
            if (selectedCountElement) {
                selectedCountElement.textContent = `${selectedTotals.items} sản phẩm được chọn`;
            }
            
            // Update checkout button text
            const checkoutButtonCount = this.cartFooter.querySelector('.selected-items-count');
            if (checkoutButtonCount) {
                checkoutButtonCount.textContent = selectedTotals.items;
            }
        } else {
            this.cartFooter.classList.add('d-none');
        }
    }

    /**
     * Handle item selection change
     */
    handleItemSelection(itemId, isSelected) {
        if (isSelected) {
            this.selectedItems.add(itemId);
        } else {
            this.selectedItems.delete(itemId);
        }
        
        // Update select all checkbox
        this.updateSelectAllCheckbox();
        
        // Update cart footer with new totals
        if (window.cartService) {
            const cartData = cartService.getCart();
            this.updateCartFooter(cartData.summary);
        }
    }

    /**
     * Toggle select all items
     */
    toggleSelectAll(selectAll) {
        const checkboxes = document.querySelectorAll('.cart-item-checkbox');
        
        if (selectAll) {
            this.selectedItems.clear();
            checkboxes.forEach(checkbox => {
                checkbox.checked = true;
                this.selectedItems.add(parseInt(checkbox.dataset.itemId));
            });
        } else {
            checkboxes.forEach(checkbox => {
                checkbox.checked = false;
            });
            this.selectedItems.clear();
        }
        
        // Update cart footer with new totals
        if (window.cartService) {
            const cartData = cartService.getCart();
            this.updateCartFooter(cartData.summary);
        }
    }

    /**
     * Update select all checkbox state
     */
    updateSelectAllCheckbox() {
        const selectAllCheckbox = document.getElementById('selectAllItems');
        const allCheckboxes = document.querySelectorAll('.cart-item-checkbox');
        
        if (selectAllCheckbox && allCheckboxes.length > 0) {
            const checkedCount = this.selectedItems.size;
            const totalCount = allCheckboxes.length;
            
            if (checkedCount === 0) {
                selectAllCheckbox.checked = false;
                selectAllCheckbox.indeterminate = false;
            } else if (checkedCount === totalCount) {
                selectAllCheckbox.checked = true;
                selectAllCheckbox.indeterminate = false;
            } else {
                selectAllCheckbox.checked = false;
                selectAllCheckbox.indeterminate = true;
            }
        }
    }

    /**
     * Calculate totals for selected items only
     */
    calculateSelectedTotals() {
        if (!window.cartService) {
            return { count: 0, amount: 0, items: 0 };
        }

        const cartData = cartService.getCart();
        let selectedCount = 0;
        let selectedAmount = 0;
        let selectedItemsCount = 0;

        cartData.items.forEach(item => {
            if (this.selectedItems.has(item.id)) {
                // Use same pricing logic as createCartItemHTML
                const originalPrice = parseFloat(item.product_price || item.price || 0);
                const rawDiscountPrice = item.product_discount_price || item.discount_price || null;
                const discountPrice = rawDiscountPrice ? parseFloat(rawDiscountPrice) : null;
                const currentPrice = (discountPrice && discountPrice > 0 && discountPrice < originalPrice) ? discountPrice : originalPrice;
                
                selectedCount += item.quantity;
                selectedAmount += currentPrice * item.quantity;
                selectedItemsCount++;
            }
        });

        return {
            count: selectedCount,
            amount: selectedAmount,
            items: selectedItemsCount
        };
    }

    /**
     * Get selected items for checkout
     */
    getSelectedItems() {
        if (!window.cartService) return [];
        
        const cartData = cartService.getCart();
        return cartData.items.filter(item => this.selectedItems.has(item.id));
    }

    /**
     * Update item quantity
     */
    async updateQuantity(itemId, newQuantity) {
        if (newQuantity < 1) {
            await this.removeItem(itemId);
            return;
        }

        try {
            if (window.cartService) {
                await cartService.updateCartItem(itemId, newQuantity);
            }
        } catch (error) {
            // Silent fail
        }
    }

    /**
     * Remove item from cart
     */
    async removeItem(itemId) {
        try {
            if (window.cartService) {
                await cartService.removeFromCart(itemId);
            }
        } catch (error) {
            // Silent fail
        }
    }

    /**
     * Clear entire cart
     */
    async clearCart() {
        if (confirm('Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng?')) {
            try {
                if (window.cartService) {
                    await cartService.clearCart();
                }
            } catch (error) {
                // Silent fail
            }
        }
    }

    /**
     * Format price to VND
     */
    formatPrice(price) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    }

    /**
     * Show cart offcanvas
     */
    showCart() {
        if (this.cartOffcanvas && window.bootstrap) {
            const offcanvas = new bootstrap.Offcanvas(this.cartOffcanvas);
            offcanvas.show();
        }
    }

    /**
     * Hide cart offcanvas
     */
    hideCart() {
        if (this.cartOffcanvas && window.bootstrap) {
            const offcanvas = bootstrap.Offcanvas.getInstance(this.cartOffcanvas);
            if (offcanvas) {
                offcanvas.hide();
            }
        }
    }
}

/**
 * Global function to create order from cart
 */
async function createOrderFromCart() {
    // Check if user is authenticated
    if (!apiService.isAuthenticated()) {
            alert('Vui lòng đăng nhập để tạo đơn hàng');
        window.location.href = '/pages/auth/login.html';
        return;
    }

    // Check if cart is empty
    if (cartService.isEmpty()) {
            alert('Giỏ hàng của bạn đang trống');
        return;
    }

    // Get selected items
    const selectedItems = cartUI.getSelectedItems();
    if (selectedItems.length === 0) {
            alert('Vui lòng chọn ít nhất một sản phẩm để tạo đơn hàng');
        return;
    }

    // Store selected item IDs in sessionStorage for the order page
    const selectedItemIds = selectedItems.map(item => item.id);
    sessionStorage.setItem('selectedCartItems', JSON.stringify(selectedItemIds));

    // Redirect to create order page
    window.location.href = '/pages/user/create-order.html?from=cart';
}

/**
 * Legacy checkout function for backward compatibility
 */
function checkout() {
    // Redirect to new function
    createOrderFromCart();
}

/**
 * Global function to add to cart from product pages
 */
async function addToCart(productId, quantity = 1, productData = null) {
    try {
        if (window.cartService) {
            await cartService.addToCart(productId, quantity, productData);
            
            // Show cart after adding
            if (window.cartUI) {
                cartUI.showCart();
            }
        }
    } catch (error) {
        // Silent fail
    }
}

// Initialize cart UI when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Create global cart UI instance
    window.cartUI = new CartUI();
});

// Make CartUI available globally
window.CartUI = CartUI;