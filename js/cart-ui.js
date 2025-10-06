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
        } else {
            this.cartItemsContainer.innerHTML = items.map(item => this.createCartItemHTML(item)).join('');
        }
    }

    /**
     * Create HTML for a cart item
     */
    createCartItemHTML(item) {
        const price = item.discount_price || item.product_price || item.price || 0;
        const subtotal = price * item.quantity;

        // Get image URL - handle different field names
        let imageUrl = item.image || item.image_url || item.product_image || 'assets/images/products/demo.png';
        
        // Debug log
        console.log('Cart item image debug:', {
            item,
            originalImage: item.image,
            imageUrl: item.image_url,
            productImage: item.product_image,
            finalImageUrl: imageUrl
        });
        
        // If image doesn't start with http or assets, assume it's a filename
        if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('assets')) {
            // Remove any leading path separators and construct proper path
            const filename = imageUrl.replace(/^.*[\\\/]/, ''); // Get just filename
            imageUrl = `assets/images/products/${filename}`;
        }

        return `
            <div class="cart-item mb-3 pb-3 border-bottom" data-item-id="${item.id}">
                <div class="d-flex gap-3">
                    <div class="cart-item-image">
                        <img src="${imageUrl}" 
                             alt="${item.product_name || item.name}" 
                             class="rounded" 
                             style="width: 64px; height: 64px; object-fit: cover;"
                             onerror="this.src='assets/images/products/demo.png'">
                    </div>
                    <div class="cart-item-details flex-grow-1">
                        <h6 class="mb-1 fw-semibold">${item.product_name || item.name}</h6>
                        <div class="d-flex align-items-center justify-content-between mb-2">
                            <span class="text-muted small">${this.formatPrice(price)}</span>
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
            if (this.cartSubtotal) {
                this.cartSubtotal.textContent = this.formatPrice(summary.total_amount);
            }
        } else {
            this.cartFooter.classList.add('d-none');
        }
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
            console.error('Error updating quantity:', error);
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
            console.error('Error removing item:', error);
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
                console.error('Error clearing cart:', error);
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
 * Global function to handle checkout
 */
function checkout() {
    // Check if user is authenticated
    if (!apiService.isAuthenticated()) {
        alert('Vui lòng đăng nhập để tiến hành thanh toán');
        window.location.href = '/pages/auth/login.html';
        return;
    }

    // Check if cart is empty
    if (cartService.isEmpty()) {
        alert('Giỏ hàng của bạn đang trống');
        return;
    }

    // Redirect to checkout page (to be implemented)
    console.log('Proceeding to checkout...');
    // window.location.href = '/pages/checkout.html';
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
        console.error('Error adding to cart:', error);
    }
}

// Initialize cart UI when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Create global cart UI instance
    window.cartUI = new CartUI();
});

// Make CartUI available globally
window.CartUI = CartUI;