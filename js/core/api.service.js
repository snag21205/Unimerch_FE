/**
 * API Service for Unimerch Frontend
 * Centralized management for all API calls
 */

class ApiService {
    constructor() {
        this.baseURL = 'https://api.unimerch.space';
        this.endpoints = {
            auth: {
                login: '/api/auth/login',
                register: '/api/auth/register', 
                forgotPassword: '/api/auth/forgot-password',
                resetPassword: '/api/auth/reset-password',
                logout: '/api/auth/logout'
            },
            users: {
                profile: '/api/users/profile',
                updateProfile: '/api/users/profile',
                changePassword: '/api/users/change-password'
            },
            products: {
                list: '/api/products',
                detail: '/api/products/:id',
                search: '/api/products/search'
            },
            cart: {
                get: '/api/cart',
                add: '/api/cart/add',
                update: '/api/cart/update/:id',
                remove: '/api/cart/remove/:id',
                clear: '/api/cart/clear',
                count: '/api/cart/count',
                total: '/api/cart/total',
                validate: '/api/cart/validate'
            },
            orders: {
                list: '/api/orders',
                create: '/api/orders',
                detail: '/api/orders/:id',
                updateStatus: '/api/orders/:id/status',
                cancel: '/api/orders/:id',
                items: '/api/orders/:id/items',
                stats: '/api/orders/stats'
            },

            reviews: {
                list: '/api/reviews',
                detail: '/api/reviews/:id',
                productReviews: '/api/reviews/product/:productId',
                productStats: '/api/reviews/product/:productId/stats',
                myReviews: '/api/reviews/my-reviews',
                checkReview: '/api/reviews/check/:productId',
                topProducts: '/api/reviews/top-products',
                create: '/api/reviews',
                update: '/api/reviews/:id',
                delete: '/api/reviews/:id'
            },
            admin: {
                // User Management
                users: '/api/users',
                userDetail: '/api/users/:id',
                updateUser: '/api/users/:id',
                deleteUser: '/api/users/:id',
                
                // Order Management
                orders: '/api/admin/orders',
                
                // Payment Management
                payments: '/api/admin/payments',
                refund: '/api/payments/:id/refund',
                
                // Statistics & Analytics
                dashboard: '/api/admin/stats/dashboard',
                recentActivity: '/api/admin/stats/recent-activity',
                revenue: '/api/admin/stats/revenue',
                revenueCompare: '/api/admin/stats/revenue/compare',
                paymentMethods: '/api/admin/stats/payment-methods',
                productStats: '/api/admin/stats/products',
                sellerStats: '/api/admin/stats/sellers',
                orderStats: '/api/admin/stats/orders',
                userGrowth: '/api/admin/stats/users/growth',
                completeStats: '/api/admin/stats/complete',
                summary: '/api/admin/stats/summary'
            },
            
            seller: {
                // Order Management
                orders: '/api/seller/orders'
            }
        };
    }

    /**
     * Get auth token from localStorage
     */
    getToken() {
        return localStorage.getItem('token');
    }

    /**
     * Set auth token to localStorage
     */
    setToken(token) {
        localStorage.setItem('token', token);
    }

    /**
     * Remove auth token from localStorage
     */
    removeToken() {
        localStorage.removeItem('token');
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return !!this.getToken();
    }

    /**
     * Get default headers for API requests
     */
    getHeaders(includeAuth = false) {
        const headers = {
            'Content-Type': 'application/json'
        };

        if (includeAuth && this.isAuthenticated()) {
            headers['Authorization'] = `Bearer ${this.getToken()}`;
        }

        return headers;
    }

    /**
     * Build full URL from endpoint
     */
    buildUrl(endpoint, params = {}) {
        let url = this.baseURL + endpoint;
        
        // Replace path parameters (e.g., :id)
        Object.keys(params).forEach(key => {
            url = url.replace(`:${key}`, params[key]);
        });

        return url;
    }

    /**
     * Handle API response
     */
    async handleResponse(response) {
        let data;
        
        try {
            data = await response.json();
        } catch (error) {
            throw new Error(`Lỗi phân tích phản hồi từ server: ${error.message}`);
        }

        if (!response.ok) {
            // Handle different error types
            if (response.status === 401) {
                this.removeToken();
                localStorage.setItem('isLoggedIn', 'false');
                window.location.href = '/pages/auth/login.html';
                throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            }
            
            if (response.status === 403) {
                throw new Error('Bạn không có quyền thực hiện thao tác này.');
            }
            
            if (response.status === 404) {
                throw new Error('Không tìm thấy dữ liệu yêu cầu.');
            }
            
        if (response.status === 400) {
            const errorMessage = data?.errors ? data.errors.join(', ') : data?.message;
            throw new Error(errorMessage || 'Dữ liệu không hợp lệ.');
        }
        
        if (response.status === 422) {
            const errorMessage = data?.errors ? data.errors.join(', ') : data?.message;
            throw new Error(errorMessage || 'Dữ liệu không hợp lệ.');
        }
            
            if (response.status >= 500) {
                throw new Error('Lỗi server. Vui lòng thử lại sau.');
            }
            
            throw new Error(data?.message || `Lỗi HTTP: ${response.status}`);
        }

        return data;
    }

    /**
     * Generic request method
     */
    async request(endpoint, options = {}) {
        const { 
            method = 'GET', 
            body, 
            params = {}, 
            requireAuth = false 
        } = options;

        const url = this.buildUrl(endpoint, params);
        const headers = this.getHeaders(requireAuth);

        const config = {
            method,
            headers
        };

        if (body && method !== 'GET') {
            config.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(url, config);
            return await this.handleResponse(response);
        } catch (error) {
            throw error;
        }
    }

    // Authentication Methods
    async login(credentials) {
        return this.request(this.endpoints.auth.login, {
            method: 'POST',
            body: credentials
        });
    }

    async register(userData) {
        return this.request(this.endpoints.auth.register, {
            method: 'POST',
            body: userData
        });
    }

    async forgotPassword(email) {
        return this.request(this.endpoints.auth.forgotPassword, {
            method: 'POST',
            body: { email }
        });
    }

    async resetPassword(resetToken, newPassword) {
        return this.request(this.endpoints.auth.resetPassword, {
            method: 'POST',
            body: { resetToken, newPassword }
        });
    }

    async logout() {
        try {
            const token = this.getToken();
            const response = await this.request(this.endpoints.auth.logout, {
                method: 'POST',
                requireAuth: true,
                body: { token } // Send token in body as well
            });
            
            // Remove token after successful API call
            this.removeToken();
            
            // Return the actual server response
            return response;
        } catch (error) {
            // Still remove token locally even if API fails
            this.removeToken();
            
            // Re-throw the error so logout.js can handle it
            throw error;
        }
    }

    // User Methods
    async getUserProfile() {
        return this.request(this.endpoints.users.profile, {
            requireAuth: true
        });
    }

    async updateUserProfile(profileData) {
        return this.request(this.endpoints.users.updateProfile, {
            method: 'PUT',
            body: profileData,
            requireAuth: true
        });
    }

    async changePassword(passwordData) {
        return this.request(this.endpoints.users.changePassword, {
            method: 'PUT',
            body: passwordData,
            requireAuth: true
        });
    }

    // Product Methods
    async getProducts(queryParams = {}) {
        const query = new URLSearchParams(queryParams).toString();
        const endpoint = this.endpoints.products.list + (query ? `?${query}` : '');
        return this.request(endpoint);
    }

    async getProductDetail(productId) {
        return this.request(this.endpoints.products.detail, {
            params: { id: productId }
        });
    }

    async searchProducts(searchTerm, filters = {}) {
        const queryParams = { q: searchTerm, ...filters };
        const query = new URLSearchParams(queryParams).toString();
        const endpoint = this.endpoints.products.search + `?${query}`;
        return this.request(endpoint);
    }

    async createProduct(productData) {
        return this.request(this.endpoints.products.list, {
            method: 'POST',
            body: productData,
            requireAuth: true
        });
    }

    async updateProduct(productId, productData) {
        return this.request(this.endpoints.products.detail, {
            method: 'PUT',
            params: { id: productId },
            body: productData,
            requireAuth: true
        });
    }

    async deleteProduct(productId) {
        return this.request(this.endpoints.products.detail, {
            method: 'DELETE',
            params: { id: productId },
            requireAuth: true
        });
    }

    async getFeaturedProducts(limit = 10) {
        const query = new URLSearchParams({ limit }).toString();
        const endpoint = '/api/products/featured' + `?${query}`;
        return this.request(endpoint);
    }

    // Cart Methods
    async getCart() {
        return this.request(this.endpoints.cart.get, {
            requireAuth: true
        });
    }

    async addToCart(productId, quantity = 1, options = {}) {
        return this.request(this.endpoints.cart.add, {
            method: 'POST',
            body: { product_id: productId, quantity, ...options },
            requireAuth: true
        });
    }

    async updateCartItem(itemId, quantity) {
        return this.request(this.endpoints.cart.update, {
            method: 'PUT',
            body: { quantity },
            params: { id: itemId },
            requireAuth: true
        });
    }

    async removeFromCart(itemId) {
        return this.request(this.endpoints.cart.remove, {
            method: 'DELETE',
            params: { id: itemId },
            requireAuth: true
        });
    }

    async clearCart() {
        return this.request(this.endpoints.cart.clear, {
            method: 'DELETE',
            requireAuth: true
        });
    }

    async getCartCount() {
        return this.request(this.endpoints.cart.count, {
            requireAuth: true
        });
    }

    async getCartTotal() {
        return this.request(this.endpoints.cart.total, {
            requireAuth: true
        });
    }

    async validateCart() {
        return this.request(this.endpoints.cart.validate, {
            requireAuth: true
        });
    }

    // Order Methods
    async getOrders(queryParams = {}) {
        const query = new URLSearchParams(queryParams).toString();
        const endpoint = this.endpoints.orders.list + (query ? `?${query}` : '');
        return this.request(endpoint, {
            requireAuth: true
        });
    }

    async createOrder(orderData) {
        return this.request(this.endpoints.orders.create, {
            method: 'POST',
            body: orderData,
            requireAuth: true
        });
    }

    async getOrderDetail(orderId) {
        return this.request(this.endpoints.orders.detail, {
            params: { id: orderId },
            requireAuth: true
        });
    }

    async getSellerOrders(queryParams = {}) {
        const query = new URLSearchParams(queryParams).toString();
        const endpoint = this.endpoints.seller.orders + (query ? `?${query}` : '');
        return this.request(endpoint, {
            requireAuth: true
        });
    }

    async updateOrderStatus(orderId, status) {
        return this.request(this.endpoints.orders.updateStatus, {
            method: 'PUT',
            body: { status },
            params: { id: orderId },
            requireAuth: true
        });
    }

    async cancelOrder(orderId) {
        return this.request(this.endpoints.orders.cancel, {
            method: 'DELETE',
            params: { id: orderId },
            requireAuth: true
        });
    }

    async getOrderItems(orderId) {
        return this.request(this.endpoints.orders.items, {
            params: { id: orderId },
            requireAuth: true
        });
    }

    async getUserById(userId) {
        return this.request(`/api/users/${userId}`, {
            requireAuth: true
        });
    }

    // Admin User Management
    async getUsers(queryParams = {}) {
        const query = new URLSearchParams(queryParams).toString();
        const endpoint = '/api/users' + (query ? `?${query}` : '');
        return this.request(endpoint, {
            requireAuth: true
        });
    }

    async createUser(userData) {
        return this.request('/api/users', {
            method: 'POST',
            body: userData,
            requireAuth: true
        });
    }

    async updateUser(userId, userData) {
        return this.request(`/api/users/${userId}`, {
            method: 'PUT',
            body: userData,
            requireAuth: true
        });
    }

    async deleteUser(userId) {
        return this.request(`/api/users/${userId}`, {
            method: 'DELETE',
            requireAuth: true
        });
    }



    // Review Methods
    async getReviews(queryParams = {}) {
        const query = new URLSearchParams(queryParams).toString();
        const endpoint = this.endpoints.reviews.list + (query ? `?${query}` : '');
        return this.request(endpoint);
    }

    async getReviewDetail(reviewId) {
        return this.request(this.endpoints.reviews.detail, {
            params: { id: reviewId }
        });
    }

    async getProductReviews(productId, queryParams = {}) {
        const query = new URLSearchParams(queryParams).toString();
        const endpoint = this.endpoints.reviews.productReviews + (query ? `?${query}` : '');
        return this.request(endpoint, {
            params: { productId: productId }
        });
    }

    async getProductReviewStats(productId) {
        return this.request(this.endpoints.reviews.productStats, {
            params: { productId: productId }
        });
    }

    async getMyReviews(queryParams = {}) {
        const query = new URLSearchParams(queryParams).toString();
        const endpoint = this.endpoints.reviews.myReviews + (query ? `?${query}` : '');
        return this.request(endpoint, {
            requireAuth: true
        });
    }

    async checkProductReview(productId) {
        return this.request(this.endpoints.reviews.checkReview, {
            params: { productId: productId },
            requireAuth: true
        });
    }

    async getTopProducts(limit = 10) {
        const query = new URLSearchParams({ limit }).toString();
        const endpoint = this.endpoints.reviews.topProducts + `?${query}`;
        return this.request(endpoint);
    }

    async createReview(reviewData) {
        return this.request(this.endpoints.reviews.create, {
            method: 'POST',
            body: reviewData,
            requireAuth: true
        });
    }

    async updateReview(reviewId, reviewData) {
        return this.request(this.endpoints.reviews.update, {
            method: 'PUT',
            body: reviewData,
            params: { id: reviewId },
            requireAuth: true
        });
    }

    async deleteReview(reviewId) {
        return this.request(this.endpoints.reviews.delete, {
            method: 'DELETE',
            params: { id: reviewId },
            requireAuth: true
        });
    }

    /**
     * Get current user ID
     */
    getCurrentUserId() {
        try {
            const token = this.getToken();
            if (!token) return null;

            // Parse JWT token
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(atob(base64));
            
            return payload.id;
        } catch (error) {
            return null;
        }
    }

    // ===== ADMIN METHODS =====

    // User Management
    async getAllUsers(queryParams = {}) {
        const query = new URLSearchParams(queryParams).toString();
        const endpoint = this.endpoints.admin.users + (query ? `?${query}` : '');
        return this.request(endpoint, {
            requireAuth: true
        });
    }

    async getUserById(userId) {
        return this.request(this.endpoints.admin.userDetail, {
            params: { id: userId },
            requireAuth: true
        });
    }

    async updateUserById(userId, userData) {
        return this.request(this.endpoints.admin.updateUser, {
            method: 'PUT',
            body: userData,
            params: { id: userId },
            requireAuth: true
        });
    }

    async deleteUserById(userId) {
        return this.request(this.endpoints.admin.deleteUser, {
            method: 'DELETE',
            params: { id: userId },
            requireAuth: true
        });
    }

    // Order Management
    async getAdminOrders(queryParams = {}) {
        const query = new URLSearchParams(queryParams).toString();
        const endpoint = this.endpoints.admin.orders + (query ? `?${query}` : '');
        return this.request(endpoint, {
            requireAuth: true
        });
    }

    // Payment Management
    async getAdminPayments(queryParams = {}) {
        const query = new URLSearchParams(queryParams).toString();
        const endpoint = this.endpoints.admin.payments + (query ? `?${query}` : '');
        return this.request(endpoint, {
            requireAuth: true
        });
    }

    async processRefund(paymentId, refundData) {
        return this.request(this.endpoints.admin.refund, {
            method: 'POST',
            body: refundData,
            params: { id: paymentId },
            requireAuth: true
        });
    }

    // Statistics & Analytics
    async getDashboardStats() {
        return this.request(this.endpoints.admin.dashboard, {
            requireAuth: true
        });
    }

    async getRecentActivity(limit = 20) {
        const query = new URLSearchParams({ limit }).toString();
        const endpoint = this.endpoints.admin.recentActivity + `?${query}`;
        return this.request(endpoint, {
            requireAuth: true
        });
    }

    async getRevenueStats(queryParams = {}) {
        const query = new URLSearchParams(queryParams).toString();
        const endpoint = this.endpoints.admin.revenue + (query ? `?${query}` : '');
        return this.request(endpoint, {
            requireAuth: true
        });
    }

    async getRevenueComparison(queryParams = {}) {
        const query = new URLSearchParams(queryParams).toString();
        const endpoint = this.endpoints.admin.revenueCompare + (query ? `?${query}` : '');
        return this.request(endpoint, {
            requireAuth: true
        });
    }

    async getPaymentMethodStats() {
        return this.request(this.endpoints.admin.paymentMethods, {
            requireAuth: true
        });
    }

    async getProductStats(queryParams = {}) {
        const query = new URLSearchParams(queryParams).toString();
        const endpoint = this.endpoints.admin.productStats + (query ? `?${query}` : '');
        return this.request(endpoint, {
            requireAuth: true
        });
    }

    async getSellerStats(queryParams = {}) {
        const query = new URLSearchParams(queryParams).toString();
        const endpoint = this.endpoints.admin.sellerStats + (query ? `?${query}` : '');
        return this.request(endpoint, {
            requireAuth: true
        });
    }

    async getOrderStats() {
        return this.request(this.endpoints.admin.orderStats, {
            requireAuth: true
        });
    }

    async getRecentActivity(limit = 10) {
        const query = new URLSearchParams({ limit }).toString();
        const endpoint = this.endpoints.admin.recentActivity + `?${query}`;
        return this.request(endpoint, {
            requireAuth: true
        });
    }

    async getSellerStats(queryParams = {}) {
        const query = new URLSearchParams(queryParams).toString();
        const endpoint = this.endpoints.admin.sellerStats + (query ? `?${query}` : '');
        return this.request(endpoint, {
            requireAuth: true
        });
    }

    async getUserGrowthStats(queryParams = {}) {
        const query = new URLSearchParams(queryParams).toString();
        const endpoint = this.endpoints.admin.userGrowth + (query ? `?${query}` : '');
        return this.request(endpoint, {
            requireAuth: true
        });
    }

    async getCompleteStats(queryParams = {}) {
        const query = new URLSearchParams(queryParams).toString();
        const endpoint = this.endpoints.admin.completeStats + (query ? `?${query}` : '');
        return this.request(endpoint, {
            requireAuth: true
        });
    }

    async getStatsSummary() {
        return this.request(this.endpoints.admin.summary, {
            requireAuth: true
        });
    }
}

// Create global instance
const apiService = new ApiService();

// Make it available globally
window.apiService = apiService;