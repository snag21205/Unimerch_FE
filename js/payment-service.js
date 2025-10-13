/**
 * Payment Service for Unimerch Frontend
 * Handles payment creation and management according to API v2.0
 */

class PaymentService {
    constructor() {
        // Don't initialize apiService in constructor
        this.apiService = null;
    }

    /**
     * Get API service instance
     */
    getApiService() {
        if (!this.apiService && window.apiService) {
            this.apiService = window.apiService;
        }
        
        if (!this.apiService) {
            throw new Error('API Service not available. Please ensure API service is loaded.');
        }
        
        return this.apiService;
    }

    /**
     * Create a payment for an existing order
     * @param {number} orderId - Order ID
     * @param {string} paymentMethod - Payment method
     * @param {string} transactionId - Transaction ID (optional for COD)
     * @returns {Promise<Object>} Payment creation response
     */
    async createPayment(orderId, paymentMethod, transactionId = null) {
        try {
            const apiService = this.getApiService();

            const payload = {
                order_id: orderId,
                payment_method: this.normalizePaymentMethod(paymentMethod)
            };

            // Add transaction ID if provided (not required for COD)
            if (transactionId && paymentMethod.toLowerCase() !== 'cod') {
                payload.transaction_id = transactionId;
            }

            console.log('💳 Creating payment:', payload);

            const response = await apiService.createPayment(payload);
            
            if (response.success) {
                console.log('✅ Payment created successfully:', response.data);
                return response;
            } else {
                throw new Error(response.message || 'Failed to create payment');
            }
        } catch (error) {
            console.error('❌ Error creating payment:', error);
            throw error;
        }
    }

    /**
     * Get payments for a specific order
     * @param {number} orderId - Order ID
     * @returns {Promise<Array>} List of payments
     */
    async getOrderPayments(orderId) {
        try {
            const apiService = this.getApiService();

            const response = await apiService.getOrderPayments(orderId);
            
            if (response.success) {
                return response.data || [];
            } else {
                throw new Error(response.message || 'Failed to get order payments');
            }
        } catch (error) {
            console.error('❌ Error getting order payments:', error);
            throw error;
        }
    }

    /**
     * Get payment details by payment ID
     * @param {number} paymentId - Payment ID
     * @returns {Promise<Object>} Payment details
     */
    async getPaymentDetails(paymentId) {
        try {
            const apiService = this.getApiService();

            const response = await apiService.getPaymentDetail(paymentId);
            
            if (response.success) {
                return response.data;
            } else {
                throw new Error(response.message || 'Failed to get payment details');
            }
        } catch (error) {
            console.error('❌ Error getting payment details:', error);
            throw error;
        }
    }

    /**
     * Update payment status
     * @param {number} paymentId - Payment ID
     * @param {string} status - New status (pending, completed, failed, refunded)
     * @param {string} transactionId - Updated transaction ID (optional)
     * @returns {Promise<Object>} Update response
     */
    async updatePaymentStatus(paymentId, status, transactionId = null) {
        try {
            const apiService = this.getApiService();

            console.log('🔄 Updating payment status:', { paymentId, status, transactionId });

            const response = await apiService.updatePaymentStatus(paymentId, status, transactionId);
            
            if (response.success) {
                console.log('✅ Payment status updated:', response.data);
                return response;
            } else {
                throw new Error(response.message || 'Failed to update payment status');
            }
        } catch (error) {
            console.error('❌ Error updating payment status:', error);
            throw error;
        }
    }

    /**
     * Get user's payment history
     * @param {Object} options - Query options (page, limit, status)
     * @returns {Promise<Object>} Paginated payment history
     */
    async getUserPayments(options = {}) {
        try {
            const apiService = this.getApiService();

            const queryParams = {};
            
            if (options.page) queryParams.page = options.page;
            if (options.limit) queryParams.limit = options.limit;
            if (options.status) queryParams.status = options.status;

            const response = await apiService.getUserPayments(queryParams);
            
            if (response.success) {
                return response.data;
            } else {
                throw new Error(response.message || 'Failed to get user payments');
            }
        } catch (error) {
            console.error('❌ Error getting user payments:', error);
            throw error;
        }
    }

    /**
     * Normalize payment method values for API consistency
     * @param {string} method - Frontend payment method value
     * @returns {string} Normalized payment method for API
     */
    normalizePaymentMethod(method) {
        // Map to backend's ACTUAL expected values (based on error message)
        const methodMap = {
            'cod': 'COD',
            'COD': 'COD',
            'cash_on_delivery': 'COD',
            
            'bank_transfer': 'Banking',
            'Banking': 'Banking',
            'banking': 'Banking',
            
            'credit_card': 'Credit Card',
            'Credit Card': 'Credit Card',
            'card': 'Credit Card',
            'debit_card': 'Credit Card',
            
            'momo': 'E-Wallet',
            'zalopay': 'E-Wallet',
            'vnpay': 'E-Wallet',
            'paypal': 'E-Wallet',
            'stripe': 'E-Wallet',
            'E-Wallet': 'E-Wallet',
            'E_Wallet': 'E-Wallet',
            'e_wallet': 'E-Wallet'
        };

        return methodMap[method] || 'COD'; // Default to COD if not found
    }

    /**
     * Format payment method for display
     * @param {string} method - API payment method value
     * @returns {string} User-friendly payment method name
     */
    formatPaymentMethod(method) {
        const methodNames = {
            'COD': 'Thanh toán khi nhận hàng (COD)',
            'Banking': 'Chuyển khoản ngân hàng',
            'Credit Card': 'Thẻ tín dụng/ghi nợ',
            'E-Wallet': 'Ví điện tử (MoMo, ZaloPay, VNPay, PayPal)',
            
            // Also handle frontend values for backward compatibility
            'cod': 'Thanh toán khi nhận hàng (COD)',
            'bank_transfer': 'Chuyển khoản ngân hàng',
            'credit_card': 'Thẻ tín dụng',
            'debit_card': 'Thẻ ghi nợ',
            'momo': 'Ví MoMo',
            'zalopay': 'ZaloPay',
            'vnpay': 'VNPay',
            'paypal': 'PayPal',
            'stripe': 'Stripe'
        };

        return methodNames[method] || method;
    }

    /**
     * Format payment status for display
     * @param {string} status - Payment status
     * @returns {Object} Formatted status with badge class
     */
    formatPaymentStatus(status) {
        const statusMap = {
            'pending': { 
                text: 'Chờ thanh toán', 
                class: 'badge-warning',
                icon: '⏳'
            },
            'completed': { 
                text: 'Đã thanh toán', 
                class: 'badge-success',
                icon: '✅'
            },
            'failed': { 
                text: 'Thanh toán thất bại', 
                class: 'badge-danger',
                icon: '❌'
            },
            'refunded': { 
                text: 'Đã hoàn tiền', 
                class: 'badge-info',
                icon: '↩️'
            }
        };

        return statusMap[status?.toLowerCase()] || { 
            text: status, 
            class: 'badge-secondary',
            icon: '❓'
        };
    }

    /**
     * Generate transaction ID for non-COD payments
     * @param {string} paymentMethod - Payment method
     * @param {number} orderId - Order ID
     * @returns {string} Generated transaction ID
     */
    generateTransactionId(paymentMethod, orderId) {
        const timestamp = Date.now();
        const normalizedMethod = this.normalizePaymentMethod(paymentMethod);
        
        const methodPrefix = {
            'COD': 'COD',
            'Banking': 'BT',
            'Credit Card': 'CC',
            'E-Wallet': 'EW'
        };

        const prefix = methodPrefix[normalizedMethod] || 'TXN';
        return `${prefix}_${orderId}_${timestamp}`;
    }

    /**
     * Validate payment method
     * @param {string} method - Payment method to validate
     * @returns {boolean} Whether the payment method is supported
     */
    isValidPaymentMethod(method) {
        const supportedMethods = [
            // Backend accepted format
            'COD', 'Banking', 'Credit Card', 'E-Wallet',
            // Frontend format for backward compatibility
            'cod', 'bank_transfer', 'credit_card', 'debit_card',
            'momo', 'zalopay', 'vnpay', 'paypal', 'stripe'
        ];

        return supportedMethods.includes(method);
    }

    /**
     * Check if payment method requires transaction ID
     * @param {string} method - Payment method
     * @returns {boolean} Whether transaction ID is required
     */
    requiresTransactionId(method) {
        const normalizedMethod = this.normalizePaymentMethod(method);
        return normalizedMethod !== 'COD'; // COD doesn't need transaction ID
    }
}

// Initialize global payment service immediately but don't throw errors if apiService not ready
window.paymentService = new PaymentService();

console.log('💳 Payment Service initialized (API service will be loaded on demand)');