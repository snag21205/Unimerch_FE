// Main Products Script - API Integrated
(function() {
    'use strict';
    
    // ===== GLOBAL VARIABLES =====
    let products = []; // Will be loaded from API
    let isLoading = false;
    
    // ===== API INTEGRATION =====
    async function loadProductsFromAPI() {
        if (isLoading) return;
        
('🔄 Loading products from API...');
        isLoading = true;
        
        try {
            // Check if apiService is available
            if (typeof window.apiService === 'undefined') {
                throw new Error('API Service not available. Please ensure api-service.js is loaded first.');
            }
            
            // Show loading state
            showLoadingState();
            
            // Use API service to get products
            const response = await window.apiService.getProducts();
('📦 API Response:', response);
            
            if (response.success && response.data && Array.isArray(response.data.products)) {
                products = response.data.products.map(transformProductData);
('✅ Products loaded from API:', products.length, 'products');
            } else {
                throw new Error('Invalid API response format: expected data.products array');
            }
            
        } catch (error) {
('❌ Failed to load products from API:', error);
            
            // Fallback to sample data for development
('🔄 Using fallback sample data...');
            products = getSampleProducts();
            
            // Show user-friendly error message
            if (window.UiUtils) {
                UiUtils.showToast('Using sample products. API connection failed.', 'warning');
            }
            
        } finally {
            isLoading = false;
            hideLoadingState();
            
            // Load ratings for all products
            await loadProductRatings();
            
            // Render products after loading (only if not on all-products page or index page)
            if (!window.location.pathname.includes('all-products.html') && 
                !window.location.pathname.endsWith('index.html') && 
                window.location.pathname !== '/') {
                //renderProducts();
            }
        }
    }
    
    // Load ratings for all products
    async function loadProductRatings() {
        if (!products || products.length === 0) return;
        
        try {
('🔄 Loading product ratings...');
            
            // Load ratings for each product
            const ratingPromises = products.map(async (product) => {
                try {
                    const response = await window.apiService.getProductReviewStats(product.id);
                    if (response.success && response.data) {
                        product.rating = response.data.average_rating || 0;
                        product.reviews = response.data.total_reviews || 0;
                    }
                } catch (error) {
(`Failed to load rating for product ${product.id}:`, error);
                    // Keep default values
                }
            });
            
            await Promise.all(ratingPromises);
('✅ Product ratings loaded');
            
        } catch (error) {
('Failed to load product ratings:', error);
        }
    }
    
    // Transform API product data to match UI expectations
    function transformProductData(apiProduct) {
        // Handle image URL - support both full URLs and relative paths
        let imageUrl = apiProduct.image_url || apiProduct.image || 'demo.png';
        
        // Validate and clean image URL
        if (imageUrl && imageUrl.trim()) {
            // If it's already a full URL (starts with http), use as is
            if (imageUrl.startsWith('http')) {
                // Validate URL format
                try {
                    new URL(imageUrl);
                } catch {
                    // Invalid URL, fallback to demo
                    imageUrl = 'assets/images/products/demo.png';
                }
            } else {
                // Remove any leading path separators and construct proper path
                const filename = imageUrl.replace(/^.*[\\\/]/, ''); // Get just filename
                if (filename === 'demo.png') {
                    // Always use correct path for demo.png
                    imageUrl = 'assets/images/products/demo.png';
                } else {
                    imageUrl = filename ? `assets/images/products/${filename}` : 'assets/images/products/demo.png';
                }
            }
        } else {
            // No image URL provided
            imageUrl = 'assets/images/products/demo.png';
        }
        
        // API returns prices in correct VND format, no conversion needed
        let price = parseFloat(apiProduct.price) || 0;
        let discountPrice = apiProduct.discount_price ? parseFloat(apiProduct.discount_price) : null;
        
        return {
            id: apiProduct.id,
            name: apiProduct.name || apiProduct.title || 'Unknown Product',
            description: apiProduct.description || 'No description available',
            price: price,
            discount_price: discountPrice,
            quantity: apiProduct.quantity || apiProduct.stock || 0,
            image_url: imageUrl,
            category_id: apiProduct.category_id,
            category: apiProduct.category || 'General',
            status: apiProduct.status || 'available',
            created_at: apiProduct.created_at,
            updated_at: apiProduct.updated_at,
            
            rating: apiProduct.average_rating || 0,
            reviews: apiProduct.total_reviews || 0,
            sizes: apiProduct.sizes || ["S", "M", "L", "XL"],
            colors: apiProduct.colors || ["black", "white"],
            type: apiProduct.type || determineProductType(apiProduct.name)
        };
    }
    
    // Determine product type from name
    function determineProductType(name) {
        const lowerName = name.toLowerCase();
        if (lowerName.includes('hoodie') || lowerName.includes('sweater')) return 'hoodie';
        if (lowerName.includes('tee') || lowerName.includes('shirt')) return 'tee';
        if (lowerName.includes('cap') || lowerName.includes('hat')) return 'accessory';
        if (lowerName.includes('bag') || lowerName.includes('bottle')) return 'accessory';
        return 'other';
    }
    
    // Show loading state
    function showLoadingState() {
        const grid = document.getElementById('productsGrid');
        if (grid) {
            grid.innerHTML = `
                <div class="col-12 text-center py-5">
                    <div class="spinner-border text-primary mb-3" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="text-muted">Loading products...</p>
                </div>
            `;
        }
    }
    
    // Hide loading state
    function hideLoadingState() {
        // Loading state will be replaced by renderProducts()
    }
    
    // Fallback sample data (same as before but as function)
    function getSampleProducts() {
        return [
        {
            id: 1,
            name: "Black Dashers",
            description: "The Black Dasher reimagines the traditional running shoe with natural materials engineered for serious performance.",
            price: 64.00,
            discount_price: null,
            quantity: 15,
            image_url: "demo.png",
            category_id: 3, // Accessories category
            seller_id: 1,
            status: "available",
            created_at: "2024-01-15T10:30:00Z",
            updated_at: "2024-01-15T10:30:00Z",
            // UI specific data (để tương thích với UI hiện tại)
            category: "Men's shoes",
            rating: 4,
            reviews: 56,
            sizes: ["5", "6", "7", "8", "9"],
            colors: ["black", "blue"],
            type: "accessory"
        },
        {
            id: 2,
            name: "UEH Classic Hoodie",
            description: "Premium cotton hoodie with embroidered UEH logo. Perfect for campus life and beyond.",
            price: 45.00,
            discount_price: 39.99,
            quantity: 25,
            image_url: "SP-04.png",
            category_id: 1, // Hoodies category
            seller_id: 1,
            status: "available",
            created_at: "2024-01-10T09:15:00Z",
            updated_at: "2024-01-20T14:30:00Z",
            // UI specific data
            category: "Men's clothing",
            rating: 5,
            reviews: 128,
            sizes: ["S", "M", "L", "XL"],
            colors: ["black", "white", "blue"],
            type: "hoodie"
        },
        {
            id: 3,
            name: "UEH Essential Tee",
            description: "Soft, comfortable t-shirt made from organic cotton with subtle UEH branding.",
            price: 25.00,
            discount_price: null,
            quantity: 40,
            image_url: "shirt.png",
            category_id: 2, // Tees category
            seller_id: 1,
            status: "available",
            created_at: "2024-01-05T16:45:00Z",
            updated_at: "2024-01-05T16:45:00Z",
            // UI specific data
            category: "Unisex clothing",
            rating: 4,
            reviews: 89,
            sizes: ["XS", "S", "M", "L", "XL"],
            colors: ["white", "black", "blue"],
            type: "tee"
        },
        {
            id: 4,
            name: "UEH Campus Backpack",
            description: "Durable backpack designed for student life. Multiple compartments and laptop sleeve included.",
            price: 75.00,
            discount_price: 65.00,
            quantity: 8,
            image_url: "SP-25.png",
            category_id: 3, // Accessories category
            seller_id: 1,
            status: "available",
            created_at: "2024-01-12T11:20:00Z",
            updated_at: "2024-01-25T09:10:00Z",
            // UI specific data
            category: "Accessories",
            rating: 5,
            reviews: 203,
            sizes: ["One Size"],
            colors: ["black", "blue"],
            type: "accessory"
        },
        {
            id: 5,
            name: "UEH Varsity Jacket",
            description: "Classic varsity jacket with premium materials and authentic UEH styling.",
            price: 89.00,
            discount_price: null,
            quantity: 12,
            image_url: "demo.png",
            category_id: 1, // Hoodies category
            seller_id: 1,
            status: "available",
            created_at: "2024-01-08T13:30:00Z",
            updated_at: "2024-01-08T13:30:00Z",
            // UI specific data
            category: "Men's clothing",
            rating: 4,
            reviews: 67,
            sizes: ["S", "M", "L", "XL"],
            colors: ["black", "blue", "red"],
            type: "hoodie"
        },
        {
            id: 6,
            name: "UEH Sport Cap",
            description: "Adjustable cap with embroidered UEH logo. Perfect for sports and casual wear.",
            price: 22.00,
            discount_price: null,
            quantity: 30,
            image_url: "demo.png",
            category_id: 3, // Accessories category
            seller_id: 1,
            status: "available",
            created_at: "2024-01-18T08:45:00Z",
            updated_at: "2024-01-18T08:45:00Z",
            // UI specific data
            category: "Accessories",
            rating: 4,
            reviews: 94,
            sizes: ["One Size"],
            colors: ["black", "white", "blue"],
            type: "accessory"
        },
        {
            id: 7,
            name: "UEH Premium Polo",
            description: "Elegant polo shirt with UEH emblem. Perfect for formal and casual occasions.",
            price: 55.00,
            discount_price: 45.00,
            quantity: 18,
            image_url: "demo.png",
            category_id: 2, // Tees category
            seller_id: 1,
            status: "available",
            created_at: "2024-01-14T15:20:00Z",
            updated_at: "2024-01-28T10:15:00Z",
            // UI specific data
            category: "Men's clothing",
            rating: 5,
            reviews: 112,
            sizes: ["S", "M", "L", "XL", "XXL"],
            colors: ["white", "black", "blue"],
            type: "tee"
        },
        {
            id: 8,
            name: "UEH Winter Scarf",
            description: "Warm and stylish scarf featuring UEH colors. Essential for winter campus days.",
            price: 28.00,
            discount_price: null,
            quantity: 5,
            image_url: "demo.png",
            category_id: 3, // Accessories category
            seller_id: 1,
            status: "available",
            created_at: "2024-01-22T12:10:00Z",
            updated_at: "2024-01-22T12:10:00Z",
            // UI specific data
            category: "Accessories",
            rating: 4,
            reviews: 76,
            sizes: ["One Size"],
            colors: ["blue", "black", "red"],
            type: "accessory"
        },
        {
            id: 9,
            name: "UEH Track Pants",
            description: "Comfortable track pants for sports and leisure. Made with moisture-wicking fabric.",
            price: 42.00,
            discount_price: null,
            quantity: 22,
            image_url: "demo.png",
            category_id: 1, // Hoodies category
            seller_id: 1,
            status: "available",
            created_at: "2024-01-16T14:25:00Z",
            updated_at: "2024-01-16T14:25:00Z",
            // UI specific data
            category: "Unisex clothing",
            rating: 4,
            reviews: 158,
            sizes: ["XS", "S", "M", "L", "XL"],
            colors: ["black", "blue"],
            type: "hoodie"
        },
        {
            id: 10,
            name: "UEH Business Card Holder",
            description: "Professional card holder with UEH logo. Perfect for networking events.",
            price: 18.00,
            discount_price: null,
            quantity: 35,
            image_url: "demo.png",
            category_id: 3, // Accessories category
            seller_id: 1,
            status: "available",
            created_at: "2024-01-20T09:40:00Z",
            updated_at: "2024-01-20T09:40:00Z",
            // UI specific data
            category: "Accessories",
            rating: 5,
            reviews: 43,
            sizes: ["One Size"],
            colors: ["black"],
            type: "accessory"
        },
        {
            id: 11,
            name: "UEH Long Sleeve Tee",
            description: "Comfortable long sleeve tee with subtle UEH branding. Great for layering.",
            price: 32.00,
            discount_price: 28.99,
            quantity: 28,
            image_url: "demo.png",
            category_id: 2, // Tees category
            seller_id: 1,
            status: "available",
            created_at: "2024-01-11T11:30:00Z",
            updated_at: "2024-01-29T16:20:00Z",
            // UI specific data
            category: "Unisex clothing",
            rating: 4,
            reviews: 87,
            sizes: ["XS", "S", "M", "L", "XL"],
            colors: ["white", "black", "blue"],
            type: "tee"
        },
        {
            id: 12,
            name: "UEH Graduation Bear",
            description: "Adorable graduation bear wearing UEH cap and gown. Perfect graduation gift.",
            price: 35.00,
            discount_price: null,
            quantity: 0,
            image_url: "demo.png",
            category_id: 3, // Accessories category
            seller_id: 1,
            status: "out_of_stock",
            created_at: "2024-01-07T17:15:00Z",
            updated_at: "2024-01-30T14:45:00Z",
            // UI specific data
            category: "Accessories",
            rating: 5,
            reviews: 124,
            sizes: ["One Size"],
            colors: ["brown"],
            type: "accessory"
        }
    ];
    }
    
    // ===== HELPER FUNCTIONS =====
    function formatPrice(price) {
        // Support for both number and string
        let n = typeof price === 'number' ? price : parseFloat(price);
        
        // Format price as VND currency (API already returns correct VND amount)
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(n);
    }
    
    function generateStars(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                stars += `<svg class="me-1" style="width: 16px; height: 16px; color: #ffc107;" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon>
                          </svg>`;
            } else {
                stars += `<svg class="me-1" style="width: 16px; height: 16px; color: #e5e7eb;" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon>
                          </svg>`;
            }
        }
        return stars;
    }
    
// ===== SIMPLE PRODUCT CARD - CLEAN DESIGN =====
function createProductCard(product) {
    // Tính giá hiển thị (discount nếu có)
    const displayPrice = product.discount_price || product.price;
    const hasDiscount = product.discount_price !== null;
    const discountPercent = hasDiscount ? Math.round(((product.price - product.discount_price) / product.price) * 100) : 0;
    const isOutOfStock = product.quantity === 0 || product.status === 'out_of_stock';
    
    return `
        <div class="product-card-simple" onclick="goToProductDetail(${product.id})" style="
            cursor: pointer; 
 border: 1px solid #444;
            border-radius: 18px;
            background: #1a1a1a;
            overflow: hidden;
            transition: transform 0.3s ease;
            max-width: 315px;
            margin: 0 auto;
        " onmouseover="this.style.transform='translateY(-5px)'" 
           onmouseout="this.style.transform='translateY(0)'">
            
            <!-- Product Image Section -->
            <div class="position-relative overflow-hidden" style="
                background: #1a1a1a;
                height: 400px;
            ">
                ${hasDiscount ? `
                    <div class="position-absolute" style="top: 16px; right: 16px; z-index: 10;">
                        <div class="badge bg-danger text-white px-3 py-2 rounded-pill" style="font-size: 0.75rem; font-weight: 600;">
                            -${discountPercent}%
                        </div>
                    </div>
                ` : ''}
                
                <img src="${product.image_url}" 
                     alt="${product.name}" 
                     class="product-image" 
                     onerror="this.src='../../assets/images/products/demo.png'; this.onerror=null;"
                     style="
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                        object-position: center;
                        transition: transform 0.4s ease;
                " onmouseover="this.style.transform='scale(1.05)'"
                   onmouseout="this.style.transform='scale(1)'">
            </div>

            <!-- Product Content -->
            <div class="p-4" style="background: #16181d; color: white;">
                
                <!-- Product Title -->
                <h5 class="fw-bold mb-3" style="
                    font-size: 1.3rem;
                    line-height: 1.4;
                    color: white;
                ">${product.name}</h5>
                
             
                
                <!-- Price Section -->
                <div class="mb-3">
                    ${hasDiscount ? `
                        <div class="d-flex align-items-baseline gap-2">
                            <span class="fw-bold" style="font-size: 1.5rem; color: white;">${formatPrice(displayPrice)}</span>
                            <span class="text-decoration-line-through" style="font-size: 1rem; color: #666;">${formatPrice(product.price)}</span>
                        </div>
                    ` : `
                        <span class="fw-bold" style="font-size: 1.5rem; color: white;">${formatPrice(displayPrice)}</span>
                    `}
                </div>
                
                <!-- Action Button -->
                <button class="btn w-100" 
                        onclick="addProductToCart(${product.id}, event)" 
                        ${isOutOfStock ? 'disabled' : ''}
                        style="
                            font-size: 1rem; 
                            font-weight: 600; 
                            padding: 14px;
                            background: #2a2a2a;
                            color: white;
                            border: 1px solid #444;
                            border-radius: 12px;
                            transition: all 0.3s ease;
                            ${isOutOfStock ? 'opacity: 0.5; cursor: not-allowed;' : ''}
                        " 
                        onmouseover="if(!this.disabled) this.style.background='#18b0b4'" 
                        onmouseout="if(!this.disabled) this.style.background='#2a2a2a'">
                    ${isOutOfStock ? 'Hết hàng' : 'Thêm vào giỏ'}
                </button>
            </div>
            
            <!-- Stock Status Overlay -->
            ${isOutOfStock ? `
                <div class="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style="
                    background: rgba(0, 0, 0, 0.8); 
                    z-index: 15;
                    backdrop-filter: blur(4px);
                ">
                    <div class="text-center">
                        <div class="badge bg-white text-dark px-4 py-2 rounded-pill mb-2" style="font-size: 0.9rem; font-weight: 600;">
                            Hết hàng
                        </div>
                        <p class="text-white mb-0" style="font-size: 0.8rem;">Sẽ cập nhật sớm</p>
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}


    
    // ===== MAIN RENDER FUNCTION =====
    function renderProducts() {
('🚀 Rendering products with Bootstrap cards...');
        
        // Check if we're on all-products page or index page and prevent rendering
        if (window.location.pathname.includes('all-products.html') || 
            window.location.pathname.endsWith('index.html') || 
            window.location.pathname.endsWith('landing-page.html') || 
            window.location.pathname === '/') {
('⏸️ Skipping renderProducts() on all-products or index page');
            return;
        }
        
        // Try to find products grid - check both possible IDs
        let grid = document.getElementById('productsGrid');
        if (!grid) {
            grid = document.getElementById('featuredProductsGrid');
        }
        
        if (!grid) {
('❌ Grid element #productsGrid or #featuredProductsGrid not found!');
            return;
        }
        
        // Khôi phục Bootstrap classes với khoảng cách nhỏ
        grid.className = 'row row-cols-1 row-cols-md-2 row-cols-lg-4 g-2 justify-content-center';
        
        // Render products với Bootstrap cols
        let html = '';
        
        if (products.length === 0) {
            html = `
                <div class="col-12 text-center py-5">
                    <div class="text-muted">
                        <h5>No products available</h5>
                        <p>Please check back later or try refreshing the page.</p>
                    </div>
                </div>
            `;
        } else {
            products.forEach(product => {
                html += `<div class="col mb-2">${createProductCard(product)}</div>`;
            });
        }
        
        grid.innerHTML = html;
        
        // Setup image error handling after DOM is updated
        setupImageErrorHandling();
        
('✅ Products rendered with Bootstrap design:', products.length, 'products');
    }

    // Setup image error handling with better performance
    function setupImageErrorHandling() {
        const productImages = document.querySelectorAll('.product-image');
        productImages.forEach(img => {
            // Remove any existing error handlers
            img.onerror = null;
            
            // Add optimized error handler
            img.addEventListener('error', function() {
                // Only try fallback once
                if (!this.dataset.fallbackAttempted) {
                    this.dataset.fallbackAttempted = 'true';
                    this.src = 'assets/images/products/demo.png';
                } else {
                    // If even fallback fails, hide image and show placeholder
                    this.style.display = 'none';
                    const container = this.parentElement;
                    if (container && !container.querySelector('.image-placeholder')) {
                        const placeholder = document.createElement('div');
                        placeholder.className = 'image-placeholder d-flex align-items-center justify-content-center';
                        placeholder.style.cssText = `
                            width: 100%;
                            height: 100%;
                            background: #f1f3f4;
                            border-radius: 8px;
                            color: #6b7280;
                            font-size: 0.875rem;
                        `;
                        placeholder.innerHTML = `
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                <polyline points="21,15 16,10 5,21"></polyline>
                            </svg>
                        `;
                        container.appendChild(placeholder);
                    }
                }
            });
        });
    }
    
    // ===== EVENT HANDLERS =====
    function quickView(productId, event) {
        event.stopPropagation();
        const product = products.find(p => p.id === productId);
        if (product) {
('Quick view:', product.name);
            showToast(`Opening quick view for "${product.name}"`, 'info');
            // Có thể mở modal hoặc offcanvas ở đây
        }
    }


    function addProductToCart(productId, event) {
        event.stopPropagation();
        
        // First try to find product in local products array
        let product = products.find(p => p.id === productId);
        
        // If not found locally, try to get from API
        if (!product && window.apiService) {
            // Use async function to get product from API
            apiService.getProductDetail(productId)
                .then(response => {
                    const apiProduct = response?.data;
                    if (apiProduct) {
                        // Use cart service if available
                        if (window.cartService) {
                            const productData = {
                                product_name: apiProduct.name,
                                product_price: apiProduct.price,
                                discount_price: apiProduct.discount_price,
                                image: apiProduct.image_url,
                                name: apiProduct.name,
                                price: apiProduct.discount_price || apiProduct.price
                            };
                            cartService.addToCart(productId, 1, productData);
                        } else {
                            // Fallback to simple toast
                            showToast(`"${apiProduct.name}" đã được thêm vào giỏ hàng!`, 'success');
                        }
                    } else {
                        showToast('Không tìm thấy thông tin sản phẩm', 'error');
                    }
                })
                .catch(error => {
                    console.error('Error getting product details:', error);
                    showToast('Có lỗi xảy ra khi thêm vào giỏ hàng', 'error');
                });
            return; // Exit early for API call
        }
        
        // Handle local product
        if (product) {
            console.log('Adding to cart:', product.name);
            
            // Check if cart service is available
            if (window.cartService) {
                // Prepare product data for cart
                const productData = {
                    product_name: product.name,
                    product_price: product.price,
                    discount_price: product.discount_price,
                    image: product.image_url,
                    name: product.name,
                    price: product.price
                };
                
                // Add to cart using cart service
                cartService.addToCart(productId, 1, productData);
            } else {
                // Fallback to simple toast
                showToast(`Added "${product.name}" to cart!`, 'success');
            }
        } else {
            showToast('Không tìm thấy sản phẩm', 'error');
        }
    }
    
    function goToProductDetail(productId) {
        window.location.href = `pages/products/product-detail.html?id=${productId}`;
    }
    
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `alert alert-${type === 'success' ? 'success' : 'info'} position-fixed`;
        toast.style.top = '20px';
        toast.style.right = '20px';
        toast.style.zIndex = '9999';
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 500);
    }
    
    // ===== FILTER FUNCTIONALITY =====
    function initializeFilters() {
        const filterBtns = document.querySelectorAll('#productTabs .nav-link');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                filterBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                const filter = this.getAttribute('data-filter');
                filterProducts(filter);
            });
        });
    }
    
    function filterProducts(filter) {
        let filteredProducts = products;
        
        if (filter !== 'all') {
            filteredProducts = products.filter(product => product.type === filter);
        }
        
        const grid = document.getElementById('productsGrid');
        if (!grid) return;
        
        let html = '';
        filteredProducts.forEach(product => {
            html += `<div class="col mb-2">${createProductCard(product)}</div>`;
        });
        
        grid.innerHTML = html;
('✅ Filtered products:', filter, '|', filteredProducts.length, 'products');
    }
    
    // ===== GLOBAL FUNCTIONS =====
    window.addProductToCart = addProductToCart;
    window.goToProductDetail = goToProductDetail;
    window.showToast = showToast;
    window.renderProducts = renderProducts;
    window.quickView = quickView;
    window.filterProducts = filterProducts; // Export filter function for app.js
    window.transformProductData = transformProductData; // Export transform function
    window.loadProductsFromAPI = loadProductsFromAPI; // Export load function
    window.createProductCard = createProductCard; // Export card creation function
    window.formatPrice = formatPrice; // Export formatPrice function
    
    // ===== INITIALIZATION =====
    function initialize() {
('🚀 Main Products Script - Initializing...');
        
        // Check if auto-rendering should be prevented
        if (window.preventAutoRender) {
('⏸️ Auto-rendering prevented for this page');
            return;
        }
        
        // Check if we're on index page - always skip main-products.js initialization
        if (window.location.pathname === '/' || window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('landing-page.html')) {
('⏸️ Skipping main-products.js initialization on index page - featured products handled by index.js');
            return;
        }
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                // Preload fallback image to avoid delays
                const fallbackImg = new Image();
                fallbackImg.src = 'assets/images/products/demo.png';
                
                setTimeout(() => {
                    waitForApiServiceAndLoad();
                    initializeFilters();
                }, 200); // Increased delay to ensure api-service.js loads
            });
        } else {
            // Preload fallback image to avoid delays
            const fallbackImg = new Image();
            fallbackImg.src = 'assets/images/products/demo.png';
            
            setTimeout(() => {
                waitForApiServiceAndLoad();
                initializeFilters();
            }, 200);
        }
    }
    
    // Wait for apiService to be available before loading products
    function waitForApiServiceAndLoad() {
        if (typeof window.apiService !== 'undefined') {
            loadProductsFromAPI();
        } else {
('⏳ Waiting for API Service to load...');
            setTimeout(waitForApiServiceAndLoad, 100);
        }
    }
    
    initialize();
('📦 Main Products Script loaded successfully');
})();