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
                updateProfile: '/api/users/profile'
            },
            products: {
                list: '/api/products',
                detail: '/api/products/:id',
                search: '/api/products/search'
            },
            cart: {
                get: '/api/cart',
                add: '/api/cart/add',
                update: '/api/cart/update',
                remove: '/api/cart/remove',
                clear: '/api/cart/clear'
            },
            orders: {
                list: '/api/orders',
                create: '/api/orders',
                detail: '/api/orders/:id',
                cancel: '/api/orders/:id/cancel'
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
        const data = await response.json();

        if (!response.ok) {
            // Handle different error types
            if (response.status === 401) {
                this.removeToken();
                window.location.href = '/pages/auth/login.html';
            }
            
            throw new Error(data.message || `HTTP error! status: ${response.status}`);
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
            await this.request(this.endpoints.auth.logout, {
                method: 'POST',
                requireAuth: true
            });
        } catch (error) {
            console.warn('Logout API call failed:', error);
        } finally {
            this.removeToken();
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
            body: { productId, quantity, ...options },
            requireAuth: true
        });
    }

    async updateCartItem(itemId, quantity) {
        return this.request(this.endpoints.cart.update, {
            method: 'PUT',
            body: { itemId, quantity },
            requireAuth: true
        });
    }

    async removeFromCart(itemId) {
        return this.request(this.endpoints.cart.remove, {
            method: 'DELETE',
            body: { itemId },
            requireAuth: true
        });
    }

    async clearCart() {
        return this.request(this.endpoints.cart.clear, {
            method: 'DELETE',
            requireAuth: true
        });
    }

    // Order Methods
    async getOrders() {
        return this.request(this.endpoints.orders.list, {
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

    async cancelOrder(orderId) {
        return this.request(this.endpoints.orders.cancel, {
            method: 'POST',
            params: { id: orderId },
            requireAuth: true
        });
    }
}

// Create global instance
const apiService = new ApiService();

// Make it available globally
window.apiService = apiService;