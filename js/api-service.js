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
            payments: {
                create: '/api/payments',
                orderPayments: '/api/payments/:orderId',
                detail: '/api/payments/detail/:id',
                updateStatus: '/api/payments/:id/status',
                userPayments: '/api/payments/user',
                refund: '/api/payments/:id/refund'
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
                console.error('🔍 400 Bad Request details:', JSON.stringify(data, null, 2));
                const errorMessage = data?.errors ? data.errors.join(', ') : data?.message;
                throw new Error(errorMessage || 'Dữ liệu không hợp lệ.');
            }
            
            if (response.status === 422) {
                console.error('🔍 422 Validation Error details:', JSON.stringify(data, null, 2));
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
            console.log('🌐 Making request to:', url);
            console.log('🌐 Request config:', JSON.stringify(config, null, 2));
            const response = await fetch(url, config);
            console.log('🌐 Response status:', response.status);
            return await this.handleResponse(response);
        } catch (error) {
            console.error('API Request failed:', error);
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

    async resetPassword(token, newPassword) {
        return this.request(this.endpoints.auth.resetPassword, {
            method: 'POST',
            body: { token, newPassword }
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
            console.warn('Logout API call failed:', error);
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
        console.log('🔍 API createOrder called with data:', JSON.stringify(orderData, null, 2));
        console.log('🔍 Is authenticated:', this.isAuthenticated());
        console.log('🔍 Token exists:', !!this.getToken());
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

    async getOrderStats() {
        return this.request(this.endpoints.orders.stats, {
            requireAuth: true
        });
    }

    // Payment Methods
    async createPayment(paymentData) {
        return this.request(this.endpoints.payments.create, {
            method: 'POST',
            body: paymentData,
            requireAuth: true
        });
    }

    async getOrderPayments(orderId) {
        return this.request(this.endpoints.payments.orderPayments, {
            params: { orderId: orderId },
            requireAuth: true
        });
    }

    async getPaymentDetail(paymentId) {
        return this.request(this.endpoints.payments.detail, {
            params: { id: paymentId },
            requireAuth: true
        });
    }

    async updatePaymentStatus(paymentId, status, transactionId) {
        return this.request(this.endpoints.payments.updateStatus, {
            method: 'PUT',
            body: { status, transaction_id: transactionId },
            params: { id: paymentId },
            requireAuth: true
        });
    }

    async getUserPayments(queryParams = {}) {
        const query = new URLSearchParams(queryParams).toString();
        const endpoint = this.endpoints.payments.userPayments + (query ? `?${query}` : '');
        return this.request(endpoint, {
            requireAuth: true
        });
    }

    async processRefund(paymentId, reason) {
        return this.request(this.endpoints.payments.refund, {
            method: 'POST',
            body: { reason },
            params: { id: paymentId },
            requireAuth: true
        });
    }
}

// Create global instance
const apiService = new ApiService();

// Make it available globally
window.apiService = apiService;