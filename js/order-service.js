/**
 * Order Service for Unimerch Frontend
 * Manages order-related API calls and business logic
 */

class OrderService {
    constructor() {
        this.orders = [];
        this.listeners = [];
    }

    /**
     * Add event listener for order updates
     */
    addEventListener(callback) {
        this.listeners.push(callback);
    }

    /**
     * Notify all listeners about order updates
     */
    notifyListeners(data) {
        this.listeners.forEach(callback => callback(data));
    }

    /**
     * Get user orders from API
     */
    async getUserOrders(queryParams = {}) {
        try {
            // Use the apiService to get orders
            const response = await window.apiService.getOrders(queryParams);
            
            if (response.success) {
                this.orders = response.data.orders || [];
                this.notifyListeners({ orders: this.orders, pagination: response.data.pagination });
                return response.data;
            } else {
                throw new Error(response.message || 'Failed to fetch orders');
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error);
            
            // Return mock data for development/fallback
            const mockData = this.getMockOrders();
            this.orders = mockData.orders;
            this.notifyListeners(mockData);
            return mockData;
        }
    }

    /**
     * Get order details by ID
     */
    async getOrderDetail(orderId) {
        try {
            const response = await window.apiService.getOrderDetail(orderId);
            
            if (response.success) {
                return response.data;
            } else {
                throw new Error(response.message || 'Failed to fetch order details');
            }
        } catch (error) {
            console.error('Failed to fetch order details:', error);
            
            // Return mock data for development
            return this.getMockOrderDetail(orderId);
        }
    }

    /**
     * Create new order
     */
    async createOrder(orderData) {
        try {
            console.log('📦 Creating order with data:', orderData);
            
            // Validate required fields before calling API
            if (!orderData.shipping_address || orderData.shipping_address.trim() === '') {
                throw new Error('Địa chỉ giao hàng là bắt buộc');
            }

            if (!orderData.payment_method) {
                orderData.payment_method = 'COD'; // Default to COD
            }

            // Clean up the data
            const cleanOrderData = {
                ...orderData,
                shipping_address: orderData.shipping_address.trim()
            };

            const response = await window.apiService.createOrder(cleanOrderData);
            
            if (response.success && response.data) {
                // Refresh orders list
                this.getUserOrders().catch(err => console.warn('Failed to refresh orders:', err));
                return response.data;
            } else {
                throw new Error(response.message || 'Không thể tạo đơn hàng');
            }
        } catch (error) {
            console.error('❌ Failed to create order:', error);
            
            // If it's a validation error, throw it directly
            if (error.message.includes('hợp lệ') || error.message.includes('bắt buộc')) {
                throw error;
            }
            
            // For API errors, provide user-friendly message
            if (error.message.includes('422')) {
                throw new Error('Dữ liệu đơn hàng không hợp lệ. Vui lòng kiểm tra lại thông tin.');
            }
            
            if (error.message.includes('401')) {
                throw new Error('Bạn cần đăng nhập để tạo đơn hàng.');
            }
            
            if (error.message.includes('403')) {
                throw new Error('Bạn không có quyền tạo đơn hàng.');
            }
            
            // Generic error for other cases
            throw new Error('Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại sau.');
        }
    }

    /**
     * Create order from cart
     */
    async createOrderFromCart(shippingAddress, paymentMethod = 'COD') {
        // Validate required fields
        if (!shippingAddress || shippingAddress.trim() === '') {
            throw new Error('Địa chỉ giao hàng không được để trống');
        }

        // Normalize payment method
        const normalizedPaymentMethod = window.paymentService ? 
            paymentService.normalizePaymentMethod(paymentMethod) : 
            paymentMethod;

        const orderData = {
            shipping_address: shippingAddress.trim(),
            payment_method: normalizedPaymentMethod,
            from_cart: true
        };

        console.log('🛒 Creating order from cart with data:', JSON.stringify(orderData, null, 2));
        return await this.createOrder(orderData);
    }

    /**
     * Create direct order (from product detail)
     */
    async createDirectOrder(items, shippingAddress, paymentMethod = 'COD') {
        // Validate required fields
        if (!items || !Array.isArray(items) || items.length === 0) {
            throw new Error('Danh sách sản phẩm không được để trống');
        }

        if (!shippingAddress || shippingAddress.trim() === '') {
            throw new Error('Địa chỉ giao hàng không được để trống');
        }

        // Validate items structure
        const validItems = items.map(item => {
            if (!item.product_id || !item.quantity) {
                throw new Error('Thông tin sản phẩm không hợp lệ');
            }
            
            const validItem = {
                product_id: parseInt(item.product_id),
                quantity: parseInt(item.quantity)
            };

            // Only include size and color if they exist and are not null/empty
            if (item.size && item.size !== null && item.size !== '') {
                validItem.size = item.size;
            }
            if (item.color && item.color !== null && item.color !== '') {
                validItem.color = item.color;
            }

            return validItem;
        });

        // Normalize payment method
        const normalizedPaymentMethod = window.paymentService ? 
            paymentService.normalizePaymentMethod(paymentMethod) : 
            paymentMethod;

        const orderData = {
            items: validItems,
            shipping_address: shippingAddress.trim(),
            payment_method: normalizedPaymentMethod
        };

        console.log('🛒 Creating direct order with data:', JSON.stringify(orderData, null, 2));
        return await this.createOrder(orderData);
    }

    /**
     * Cancel order
     */
    async cancelOrder(orderId, reason = '') {
        try {
            const response = await window.apiService.cancelOrder(orderId);
            
            if (response.success) {
                // Refresh orders list
                await this.getUserOrders();
                return response.data;
            } else {
                throw new Error(response.message || 'Failed to cancel order');
            }
        } catch (error) {
            console.error('Failed to cancel order:', error);
            throw error;
        }
    }

    /**
     * Update order status (for testing)
     */
    async updateOrderStatus(orderId, status) {
        try {
            // This would call admin/seller API in real implementation
            console.log(`Updating order ${orderId} status to ${status}`);
            
            // For now, just refresh the orders
            await this.getUserOrders();
            return { success: true };
        } catch (error) {
            console.error('Failed to update order status:', error);
            throw error;
        }
    }

    /**
     * Transform API order data to UI format
     */
    transformOrderData(apiOrder) {
        // Map API status to UI status
        const statusMap = {
            'pending': 'CHO_XAC_NHAN',
            'processing': 'CHO_XAC_NHAN',
            'shipped': 'VAN_CHUYEN',
            'delivered': 'HOAN_THANH',
            'cancelled': 'DA_HUY'
        };

        return {
            id: apiOrder.id,
            orderDate: apiOrder.created_at,
            status: statusMap[apiOrder.status] || 'CHO_XAC_NHAN',
            items: apiOrder.items || [],
            subtotal: parseFloat(apiOrder.total_amount || 0),
            shippingFee: 30000, // Default shipping fee
            total: parseFloat(apiOrder.total_amount || 0) + 30000,
            paymentMethod: this.formatPaymentMethod(apiOrder.payment_method),
            shippingMethod: 'Giao tận nơi',
            shippingAddress: apiOrder.shipping_address,
            eta: this.calculateETA(apiOrder.status, apiOrder.created_at)
        };
    }

    /**
     * Format payment method for display
     */
    formatPaymentMethod(method) {
        const methodMap = {
            'cod': 'COD',
            'credit_card': 'Thẻ tín dụng',
            'bank_transfer': 'Chuyển khoản',
            'momo': 'MoMo',
            'zalopay': 'ZaloPay',
            'vnpay': 'VNPay'
        };
        return methodMap[method] || 'COD';
    }

    /**
     * Calculate estimated delivery time
     */
    calculateETA(status, createdAt) {
        const created = new Date(createdAt);
        const now = new Date();
        
        switch (status) {
            case 'pending':
            case 'processing':
                return '2-3 ngày';
            case 'shipped':
                const deliveryDate = new Date(created);
                deliveryDate.setDate(deliveryDate.getDate() + 3);
                return `Dự kiến giao: ${deliveryDate.toLocaleDateString('vi-VN')}`;
            case 'delivered':
                return 'Đã giao';
            case 'cancelled':
                return 'Đã hủy';
            default:
                return '2-3 ngày';
        }
    }

    /**
     * Get mock orders for fallback/development
     */
    getMockOrders() {
        return {
            orders: [
                {
                    id: 1,
                    total_amount: 500000,
                    status: 'pending',
                    created_at: new Date().toISOString(),
                    items: [
                        {
                            product_id: 1,
                            product_name: 'UEH Essential Tee',
                            quantity: 2,
                            price: 250000
                        }
                    ],
                    shipping_address: '123 Nguyễn Đình Chiểu, Q.3, TP.HCM',
                    payment_method: 'COD'
                }
            ],
            pagination: {
                current_page: 1,
                total_pages: 1,
                total_orders: 1
            }
        };
    }

    /**
     * Get mock order detail for fallback
     */
    getMockOrderDetail(orderId) {
        return {
            id: orderId,
            total_amount: 500000,
            status: 'pending',
            created_at: new Date().toISOString(),
            items: [
                {
                    product_id: 1,
                    product_name: 'UEH Essential Tee',
                    quantity: 2,
                    price: 250000
                }
            ],
            shipping_address: '123 Nguyễn Đình Chiểu, Q.3, TP.HCM',
            payment_method: 'COD'
        };
    }
}

// Create global instance
const orderService = new OrderService();

// Make it available globally
window.orderService = orderService;