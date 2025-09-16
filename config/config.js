// Configuration constants for the UEH Merch application
const CONFIG = {
    // API Configuration
    API_BASE_URL: 'http://localhost:3000/api',
    
    // Asset paths
    IMAGE_BASE_PATH: './assets/images/products/',
    HERO_IMAGE_PATH: './assets/images/hero/',
    CSS_PATH: './assets/css/',
    JS_PATH: './assets/js/',
    
    // Route configurations
    ROUTES: {
        HOME: './index.html',
        LOGIN: './pages/auth/login.html',
        REGISTER: './pages/auth/register.html',
        PROFILE: './pages/user/profile.html',
        ORDERS: './pages/user/orders.html',
        PRODUCT_DETAIL: './pages/products/product-detail.html'
    },
    
    // Application settings
    APP_NAME: 'UEH Merch',
    ITEMS_PER_PAGE: 12,
    DEFAULT_CURRENCY: 'USD',
    
    // Local storage keys
    STORAGE_KEYS: {
        USER_TOKEN: 'ueh_merch_token',
        CART_ITEMS: 'ueh_merch_cart',
        USER_PREFERENCES: 'ueh_merch_preferences'
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}