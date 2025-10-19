/**
 * Cart Service for Unimerch Frontend
 * Manages cart state, API integration, and localStorage sync
 */

class CartService {
    constructor() {
        this.cart = {
            items: [],
            summary: {
                total_items: 0,
                total_amount: 0,
                item_count: 0
            }
        };
        this.listeners = [];
        this.isLoaded = false;
        
        // Initialize cart
        this.init();
    }

    /**
     * Initialize cart service
     */
    async init() {
        // Load cart from localStorage first (for offline/guest state)
        this.loadFromLocalStorage();
        
        // If user is authenticated, sync with server
        if (apiService.isAuthenticated()) {
            await this.syncWithServer();
        }
        
        this.isLoaded = true;
        this.notifyListeners();
    }

    /**
     * Add event listener for cart changes
     */
    addEventListener(callback) {
        this.listeners.push(callback);
    }

    /**
     * Remove event listener
     */
    removeEventListener(callback) {
        this.listeners = this.listeners.filter(listener => listener !== callback);
    }

    /**
     * Notify all listeners of cart changes
     */
    notifyListeners() {
        this.listeners.forEach(callback => callback(this.cart));
    }

    /**
     * Load cart from localStorage
     */
    loadFromLocalStorage() {
        try {
            const storedCart = localStorage.getItem('unimerch-cart');
            if (storedCart) {
                this.cart = JSON.parse(storedCart);
            }
        } catch (error) {
            // Silent fail
        }
    }

    /**
     * Save cart to localStorage
     */
    saveToLocalStorage() {
        try {
            localStorage.setItem('unimerch-cart', JSON.stringify(this.cart));
        } catch (error) {
            // Silent fail
        }
    }

    /**
     * Sync cart with server
     */
    async syncWithServer() {
        if (!apiService.isAuthenticated()) {
            return;
        }

        try {
            // Get server cart
            const response = await apiService.getCart();
            if (response.success) {
                this.cart = response.data;
                this.saveToLocalStorage();
                this.notifyListeners();
            }
        } catch (error) {
            // Continue with local cart if server sync fails
        }
    }

    /**
     * Add item to cart
     */
    async addToCart(productId, quantity = 1, productData = null) {
        try {
            if (apiService.isAuthenticated()) {
                // Add to server cart
                const response = await apiService.addToCart(productId, quantity);
                if (response.success) {
                    // Refresh cart from server
                    await this.syncWithServer();
                    this.showToast('Đã thêm sản phẩm vào giỏ hàng', 'success');
                    return response;
                }
            } else {
                // Add to local cart for guest users
                this.addToLocalCart(productId, quantity, productData);
                this.showToast('Đã thêm sản phẩm vào giỏ hàng', 'success');
            }
        } catch (error) {
            this.showToast('Lỗi khi thêm vào giỏ hàng', 'error');
            throw error;
        }
    }

    /**
     * Add to local cart (for guest users)
     */
    addToLocalCart(productId, quantity, productData) {
        const existingItemIndex = this.cart.items.findIndex(item => item.product_id == productId);
        
        if (existingItemIndex >= 0) {
            // Update existing item
            this.cart.items[existingItemIndex].quantity += quantity;
        } else {
            // Add new item
            const newItem = {
                id: Date.now(), // Temporary ID for local cart
                product_id: productId,
                quantity: quantity,
                ...productData
            };
            this.cart.items.push(newItem);
        }

        this.updateLocalCartSummary();
        this.saveToLocalStorage();
        this.notifyListeners();
    }

    /**
     * Update cart item quantity
     */
    async updateCartItem(itemId, quantity) {
        try {
            if (apiService.isAuthenticated()) {
                const response = await apiService.updateCartItem(itemId, quantity);
                if (response.success) {
                    await this.syncWithServer();
                    this.showToast('Đã cập nhật số lượng', 'success');
                    return response;
                }
            } else {
                this.updateLocalCartItem(itemId, quantity);
                this.showToast('Đã cập nhật số lượng', 'success');
            }
        } catch (error) {
            this.showToast('Lỗi khi cập nhật giỏ hàng', 'error');
            throw error;
        }
    }

    /**
     * Update local cart item
     */
    updateLocalCartItem(itemId, quantity) {
        const itemIndex = this.cart.items.findIndex(item => item.id == itemId);
        if (itemIndex >= 0) {
            if (quantity > 0) {
                this.cart.items[itemIndex].quantity = quantity;
            } else {
                this.cart.items.splice(itemIndex, 1);
            }
            this.updateLocalCartSummary();
            this.saveToLocalStorage();
            this.notifyListeners();
        }
    }

    /**
     * Remove item from cart
     */
    async removeFromCart(itemId) {
        try {
            if (apiService.isAuthenticated()) {
                const response = await apiService.removeFromCart(itemId);
                if (response.success) {
                    await this.syncWithServer();
                    this.showToast('Đã xóa sản phẩm khỏi giỏ hàng', 'success');
                    return response;
                }
            } else {
                this.removeFromLocalCart(itemId);
                this.showToast('Đã xóa sản phẩm khỏi giỏ hàng', 'success');
            }
        } catch (error) {
            this.showToast('Lỗi khi xóa khỏi giỏ hàng', 'error');
            throw error;
        }
    }

    /**
     * Remove multiple items from cart by IDs
     */
    async removeMultipleFromCart(itemIds) {
        try {
            if (apiService.isAuthenticated()) {
                // Remove items one by one from server
                for (const itemId of itemIds) {
                    try {
                        await apiService.removeFromCart(itemId);
                        } catch (error) {
                            // Silent fail for individual items
                        }
                }
                // Sync with server after all removals
                await this.syncWithServer();
                this.showToast(`Đã xóa ${itemIds.length} sản phẩm khỏi giỏ hàng`, 'success');
            } else {
                // Remove from local cart
                this.cart.items = this.cart.items.filter(item => !itemIds.includes(item.id));
                this.updateLocalCartSummary();
                this.saveToLocalStorage();
                this.notifyListeners();
                this.showToast(`Đã xóa ${itemIds.length} sản phẩm khỏi giỏ hàng`, 'success');
            }
        } catch (error) {
            this.showToast('Lỗi khi xóa sản phẩm khỏi giỏ hàng', 'error');
            throw error;
        }
    }

    /**
     * Remove from local cart
     */
    removeFromLocalCart(itemId) {
        this.cart.items = this.cart.items.filter(item => item.id != itemId);
        this.updateLocalCartSummary();
        this.saveToLocalStorage();
        this.notifyListeners();
    }

    /**
     * Clear entire cart
     */
    async clearCart() {
        try {
            if (apiService.isAuthenticated()) {
                const response = await apiService.clearCart();
                if (response.success) {
                    this.cart = { items: [], summary: { total_items: 0, total_amount: 0, item_count: 0 } };
                    this.saveToLocalStorage();
                    this.notifyListeners();
                    this.showToast('Đã xóa toàn bộ giỏ hàng', 'success');
                    return response;
                }
            } else {
                this.cart = { items: [], summary: { total_items: 0, total_amount: 0, item_count: 0 } };
                this.saveToLocalStorage();
                this.notifyListeners();
                this.showToast('Đã xóa toàn bộ giỏ hàng', 'success');
            }
        } catch (error) {
            this.showToast('Lỗi khi xóa giỏ hàng', 'error');
            throw error;
        }
    }

    /**
     * Update local cart summary
     */
    updateLocalCartSummary() {
        this.cart.summary = {
            total_items: this.cart.items.reduce((sum, item) => sum + item.quantity, 0),
            total_amount: this.cart.items.reduce((sum, item) => {
                // Use same pricing logic: check for product_discount_price first, then discount_price
                const originalPrice = parseFloat(item.product_price || item.price || 0);
                const rawDiscountPrice = item.product_discount_price || item.discount_price || null;
                const discountPrice = rawDiscountPrice ? parseFloat(rawDiscountPrice) : null;
                const currentPrice = (discountPrice && discountPrice > 0 && discountPrice < originalPrice) ? discountPrice : originalPrice;
                return sum + (currentPrice * item.quantity);
            }, 0),
            item_count: this.cart.items.length
        };
    }

    /**
     * Get cart data
     */
    getCart() {
        return this.cart;
    }

    /**
     * Get cart count
     */
    getCartCount() {
        return this.cart.summary.total_items || 0;
    }

    /**
     * Get cart total
     */
    getCartTotal() {
        return this.cart.summary.total_amount || 0;
    }

    /**
     * Check if cart is empty
     */
    isEmpty() {
        return !this.cart.items || this.cart.items.length === 0;
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
     * Show toast notification
     */
    showToast(message, type = 'info') {
        // Use existing toast system if available
        if (window.UiUtils && window.UiUtils.showToast) {
            window.UiUtils.showToast(message, type);
        } else if (window.showToast) {
            window.showToast(message, type);
        } else {
(`${type.toUpperCase()}: ${message}`);
        }
    }

    /**
     * Handle user login - sync local cart with server
     */
    async handleUserLogin() {
        if (this.cart.items.length > 0) {
            // If there are items in local cart, try to merge with server cart
            try {
                for (const item of this.cart.items) {
                    await apiService.addToCart(item.product_id, item.quantity);
                }
                } catch (error) {
                    // Silent fail
                }
        }
        
        // Sync with server cart
        await this.syncWithServer();
    }

    /**
     * Handle user logout - keep cart in localStorage
     */
    handleUserLogout() {
        // Keep cart in localStorage but reset to local-only mode
        this.saveToLocalStorage();
    }
}

// Create global cart service instance
const cartService = new CartService();

// Make it available globally
window.cartService = cartService;