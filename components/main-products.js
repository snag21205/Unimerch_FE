// Main Products Script - API Integrated
(function() {
    'use strict';
    
    // ===== GLOBAL VARIABLES =====
    let products = []; // Will be loaded from API
    let isLoading = false;
    
    // ===== API INTEGRATION =====
    async function loadProductsFromAPI() {
        if (isLoading) return;
        
        console.log('🔄 Loading products from API...');
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
            console.log('📦 API Response:', response);
            
            if (response.success && response.data && Array.isArray(response.data.products)) {
                products = response.data.products.map(transformProductData);
                console.log('✅ Products loaded from API:', products.length, 'products');
            } else {
                throw new Error('Invalid API response format: expected data.products array');
            }
            
        } catch (error) {
            console.error('❌ Failed to load products from API:', error);
            
            // Fallback to sample data for development
            console.log('🔄 Using fallback sample data...');
            products = getSampleProducts();
            
            // Show user-friendly error message
            if (window.UiUtils) {
                UiUtils.showToast('Using sample products. API connection failed.', 'warning');
            }
            
        } finally {
            isLoading = false;
            hideLoadingState();
            
            // Render products after loading
            renderProducts();
        }
    }
    
    // Transform API product data to match UI expectations
    function transformProductData(apiProduct) {
        // Handle image URL - support both full URLs and relative paths
        let imageUrl = apiProduct.image_url || apiProduct.image || 'demo.png';
        
        // If it's already a full URL (starts with http), use as is
        // Otherwise, construct local path
        if (!imageUrl.startsWith('http')) {
            // Remove any leading path separators and construct proper path
            const filename = imageUrl.replace(/^.*[\\\/]/, ''); // Get just filename
            imageUrl = `assets/images/products/${filename}`;
        }
        
        return {
            id: apiProduct.id,
            name: apiProduct.name || apiProduct.title || 'Unknown Product',
            description: apiProduct.description || 'No description available',
            price: parseFloat(apiProduct.price) || 0,
            discount_price: apiProduct.discount_price ? parseFloat(apiProduct.discount_price) : null,
            quantity: apiProduct.quantity || apiProduct.stock || 0,
            image_url: imageUrl,
            category_id: apiProduct.category_id,
            category: apiProduct.category || 'General',
            status: apiProduct.status || 'available',
            created_at: apiProduct.created_at,
            updated_at: apiProduct.updated_at,
            
            // UI specific data with defaults
            rating: apiProduct.rating || Math.floor(Math.random() * 2) + 4, // 4-5 stars
            reviews: apiProduct.reviews || Math.floor(Math.random() * 100) + 10,
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
    
    // ===== MODERN PRODUCT CARD COMPONENT - REDESIGNED =====
    function createProductCard(product) {
        // Tính giá hiển thị (discount nếu có)
        const displayPrice = product.discount_price || product.price;
        const hasDiscount = product.discount_price !== null;
        const discountPercent = hasDiscount ? Math.round(((product.price - product.discount_price) / product.price) * 100) : 0;
        
        return `
            <div class="product-card-modern position-relative overflow-hidden" onclick="goToProductDetail(${product.id})" style="
                cursor: pointer; 
                border-radius: 24px; 
                background: white;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                border: 1px solid rgba(0, 0, 0, 0.05);
                max-width: 380px;
                margin: 0 auto;
            ">
                <!-- Discount Badge -->
                ${hasDiscount ? `
                    <div class="position-absolute" style="top: 16px; left: 16px; z-index: 10;">
                        <div class="badge bg-danger text-white px-3 py-2 rounded-pill" style="font-size: 0.75rem; font-weight: 600; box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);">
                            -${discountPercent}%
                        </div>
                    </div>
                ` : ''}
                
                <!-- Wishlist Button -->
                <div class="position-absolute" style="top: 16px; right: 16px; z-index: 10;">
                    <button class="btn btn-light rounded-circle p-2 border-0" onclick="toggleWishlist(${product.id}, event)" style="
                        width: 40px; 
                        height: 40px; 
                        backdrop-filter: blur(10px);
                        background: rgba(255, 255, 255, 0.9);
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                        transition: all 0.3s ease;
                    ">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                    </button>
                </div>
                
                <!-- Product Image Section -->
                <div class="position-relative overflow-hidden" style="
                    background: #e3f2fd;
                    padding: 2rem;
                    height: 280px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">
                    <!-- Product Image -->
                    <div class="product-image-container position-relative" style="
                        width: 200px;
                        height: 200px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: transform 0.4s ease;
                    ">
                        <img src="${product.image_url}" alt="${product.name}" class="img-fluid" 
                             onerror="this.src='assets/images/products/demo.png'" style="
                            max-width: 100%;
                            max-height: 100%;
                            object-fit: contain;
                            filter: drop-shadow(0 8px 24px rgba(0, 0, 0, 0.12));
                            transition: all 0.4s ease;
                        ">
                    </div>
                </div>
                
                <!-- Product Content -->
                <div class="p-4" style="background: white; min-height: 300px; display: flex; flex-direction: column;">
                    <!-- Category Badge -->
                    <div class="mb-2">
                        <span class="badge text-muted px-3 py-1 rounded-pill" style="
                            background: rgba(107, 114, 128, 0.1);
                            font-size: 0.7rem;
                            font-weight: 500;
                            letter-spacing: 0.5px;
                        ">${product.category}</span>
                    </div>
                    
                    <!-- Product Title -->
                    <h5 class="fw-bold mb-2 product-title" style="
                        font-size: 1.25rem;
                        line-height: 1.3;
                        color: #1f2937;
                        font-family: 'Inter', sans-serif;
                        transition: all 0.3s ease;
                    ">${product.name}</h5>
                    
                    <!-- Rating -->
                    <div class="d-flex align-items-center mb-3">
                        <div class="d-flex me-2">
                            ${generateStars(product.rating)}
                        </div>
                        <span class="text-muted" style="font-size: 0.8rem;">(${product.reviews})</span>
                        <div class="ms-auto">
                            <span class="badge bg-success bg-opacity-10 text-success px-2 py-1 rounded-pill" style="font-size: 0.7rem;">
                                ${product.quantity > 0 ? `${product.quantity} left` : 'Out of stock'}
                            </span>
                        </div>
                    </div>
                    
                    <!-- Price Section -->
                    <div class="d-flex align-items-baseline mb-3">
                        <div class="me-auto">
                            ${hasDiscount ? `
                                <div class="d-flex align-items-baseline gap-2">
                                    <span class="h5 fw-bold text-danger mb-0" style="font-size: 1.5rem;">$${displayPrice}</span>
                                    <span class="text-muted text-decoration-line-through" style="font-size: 1rem;">$${product.price}</span>
                                </div>
                            ` : `
                                <span class="h5 fw-bold mb-0" style="font-size: 1.5rem; color: #1f2937;">$${displayPrice}</span>
                            `}
                        </div>
                    </div>
                    
                    <!-- Size Selection -->
                    <div class="mb-3 mt-auto">
                        <div class="d-flex gap-1 mb-2 flex-wrap">
                            ${product.sizes.slice(0, 4).map((size, index) => `
                                <button class="btn btn-outline-dark btn-sm ${index === 0 ? 'active' : ''}" 
                                        onclick="selectProductSize(this, '${size}', event)"
                                        style="
                                            min-width: 36px; 
                                            height: 36px; 
                                            padding: 0; 
                                            font-size: 0.75rem; 
                                            border-radius: 8px;
                                            font-weight: 500;
                                            ${size === 'One Size' ? 'min-width: 60px; padding: 0 8px;' : ''}
                                        ">${size}</button>
                            `).join('')}
                            ${product.sizes.length > 4 ? `<span class="align-self-center text-muted" style="font-size: 0.75rem;">+${product.sizes.length - 4}</span>` : ''}
                        </div>
                        
                        <!-- Color Selection -->
                        <div class="d-flex gap-2 align-items-center">
                            ${product.colors.slice(0, 5).map((color, index) => `
                                <div class="color-swatch rounded-circle ${index === 0 ? 'selected' : ''}" 
                                     onclick="selectProductColor(this, '${color}', event)" 
                                     title="${color}"
                                     style="
                                        width: 24px; 
                                        height: 24px; 
                                        cursor: pointer; 
                                        transition: all 0.3s ease; 
                                        background-color: ${getColorValue(color)};
                                        border: 2px solid ${index === 0 ? '#1f2937' : 'transparent'};
                                        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                                     ">
                                </div>
                            `).join('')}
                            ${product.colors.length > 5 ? `<span class="text-muted" style="font-size: 0.75rem;">+${product.colors.length - 5}</span>` : ''}
                        </div>
                    </div>
                    
                    <!-- Action Button -->
                    <div class="mt-2">
                        <button class="btn btn-dark w-100 rounded-pill" 
                                onclick="addProductToCart(${product.id}, event)" 
                                style="
                                    font-size: 0.85rem; 
                                    font-weight: 600; 
                                    padding: 12px 24px;
                                    background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
                                    border: none;
                                    transition: all 0.3s ease;
                                ">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="me-2">
                                <circle cx="8" cy="21" r="1"></circle>
                                <circle cx="19" cy="21" r="1"></circle>
                                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57L20.5 9H5.12"></path>
                            </svg>
                            Add to cart
                        </button>
                    </div>
                </div>
                
                <!-- Stock Status Overlay -->
                ${product.status === 'out_of_stock' ? `
                    <div class="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style="
                        background: rgba(255, 255, 255, 0.95); 
                        z-index: 15;
                        backdrop-filter: blur(4px);
                    ">
                        <div class="text-center">
                            <div class="badge bg-white text-dark px-4 py-2 rounded-pill mb-2" style="font-size: 0.9rem; border: 1px solid #e5e7eb; font-weight: 600;">
                                Out of Stock
                            </div>
                            <p class="text-muted mb-0" style="font-size: 0.8rem;">Notify when available</p>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    // Helper function to get color values
    function getColorValue(color) {
        const colorMap = {
            'black': '#000',
            'blue': '#007AFF', 
            'brown': '#8B4513',
            'red': '#FF3B30',
            'white': '#fff'
        };
        return colorMap[color] || '#ccc';
    }
    
    // ===== MAIN RENDER FUNCTION =====
    function renderProducts() {
        console.log('🚀 Rendering products with Bootstrap cards...');
        
        const grid = document.getElementById('productsGrid');
        if (!grid) {
            console.error('❌ Grid element #productsGrid not found!');
            return;
        }
        
        // Khôi phục Bootstrap classes với khoảng cách nhỏ
        grid.className = 'row row-cols-1 row-cols-md-2 row-cols-lg-3 g-2 justify-content-center';
        
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
        console.log('✅ Products rendered with Bootstrap design:', products.length, 'products');
    }
    
    // ===== EVENT HANDLERS =====
    function toggleWishlist(productId, event) {
        event.stopPropagation();
        const product = products.find(p => p.id === productId);
        if (product) {
            console.log('Toggle wishlist:', product.name);
            showToast(`Added "${product.name}" to wishlist!`, 'success');
            
            // Toggle heart icon
            const heartIcon = event.target.closest('button').querySelector('svg path');
            if (heartIcon) {
                const isLiked = heartIcon.getAttribute('fill') === 'currentColor';
                heartIcon.setAttribute('fill', isLiked ? 'none' : 'currentColor');
                heartIcon.style.color = isLiked ? 'inherit' : '#ef4444';
            }
        }
    }
    
    function quickView(productId, event) {
        event.stopPropagation();
        const product = products.find(p => p.id === productId);
        if (product) {
            console.log('Quick view:', product.name);
            showToast(`Opening quick view for "${product.name}"`, 'info');
            // Có thể mở modal hoặc offcanvas ở đây
        }
    }

    function selectProductSize(element, size, event) {
        event.stopPropagation();
        
        // Remove active class from all size buttons in the same card
        element.parentNode.querySelectorAll('.btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Add active class to clicked button
        element.classList.add('active');
        
        console.log('Selected size:', size);
    }
    
    function selectProductColor(element, color, event) {
        event.stopPropagation();
        
        // Remove selected border from all color swatches in the same card
        element.parentNode.querySelectorAll('.color-swatch').forEach(swatch => {
            swatch.style.borderColor = 'transparent';
            swatch.classList.remove('selected');
        });
        
        // Add selected border to clicked swatch
        element.style.borderColor = '#1f2937';
        element.classList.add('selected');
        
        console.log('Selected color:', color);
    }

    function addProductToCart(productId, event) {
        event.stopPropagation();
        
        const product = products.find(p => p.id === productId);
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
        }, 3000);
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
        console.log('✅ Filtered products:', filter, '|', filteredProducts.length, 'products');
    }
    
    // ===== GLOBAL FUNCTIONS =====
    window.selectProductSize = selectProductSize;
    window.selectProductColor = selectProductColor;
    window.addProductToCart = addProductToCart;
    window.goToProductDetail = goToProductDetail;
    window.showToast = showToast;
    window.renderProducts = renderProducts;
    window.toggleWishlist = toggleWishlist;
    window.quickView = quickView;
    window.filterProducts = filterProducts; // Export filter function for app.js
    
    // ===== INITIALIZATION =====
    function initialize() {
        console.log('🚀 Main Products Script - Initializing...');
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                setTimeout(() => {
                    waitForApiServiceAndLoad();
                    initializeFilters();
                }, 200); // Increased delay to ensure api-service.js loads
            });
        } else {
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
            console.log('⏳ Waiting for API Service to load...');
            setTimeout(waitForApiServiceAndLoad, 100);
        }
    }
    
    initialize();
    console.log('📦 Main Products Script loaded successfully');
})();