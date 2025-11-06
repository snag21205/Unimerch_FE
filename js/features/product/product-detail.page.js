// Product Detail Page JavaScript
let currentProduct = {};
let selectedSize = '';
let selectedColor = '';
let quantity = 1;
let productReviews = [];
let reviewStats = {};
let currentUserReview = null;
let isEditing = false;
let editingReviewId = null;

// Get product ID from URL or default to first product
function getProductIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return parseInt(urlParams.get('id')) || 1;
}

// Sample product data - CẬP NHẬT THEO SCHEMA DATABASE
const productData = {
    1: {
        id: 1,
        name: "Black Dashers",
        description: "The Black Dasher reimagines the traditional running shoe with natural materials engineered for serious performance.",
        price: 64.00,
        discount_price: null,
        quantity: 15,
        image_url: "../../assets/images/products/demo.png",
        category_id: 3,
        seller_id: 1,
        status: "available",
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-15T10:30:00Z",
        // UI specific data
        category: "Men's shoes", 
        rating: 4,
        reviews: 56,
        sizes: ["5", "6", "7", "8", "9"],
        colors: ["black", "blue"],
        type: "accessory"
    },
    2: {
        id: 2,
        name: "UEH Classic Hoodie",
        description: "Premium cotton hoodie with embroidered UEH logo. Perfect for campus life and beyond.",
        price: 45.00,
        discount_price: 39.99,
        quantity: 25,
        image_url: "../../assets/images/products/SP-04.png",
        category_id: 1,
        seller_id: 1,
        status: "available",
        created_at: "2024-01-10T09:15:00Z",
        updated_at: "2024-01-20T14:30:00Z",
        category: "Men's clothing",
        rating: 5,
        reviews: 128,
        sizes: ["S", "M", "L", "XL"],
        colors: ["black", "white", "blue"],
        type: "hoodie"
    },
    3: {
        id: 3,
        name: "UEH Essential Tee",
        description: "Soft, comfortable t-shirt made from organic cotton with subtle UEH branding.",
        price: 25.00,
        discount_price: null,
        quantity: 50,
        image_url: "../../assets/images/products/shirt.png",
        category_id: 2,
        seller_id: 1,
        status: "available",
        created_at: "2024-01-05T12:00:00Z",
        updated_at: "2024-01-15T12:00:00Z",
        category: "Unisex clothing",
        rating: 4,
        reviews: 89,
        sizes: ["XS", "S", "M", "L", "XL"],
        colors: ["white", "black", "blue"],
        type: "tee"
    },
    4: {
        id: 4,
        name: "UEH Campus Backpack",
        description: "Durable backpack designed for student life. Multiple compartments and laptop sleeve included.",
        price: 75.00,
        discount_price: null,
        quantity: 20,
        image_url: "../../assets/images/products/SP-25.png",
        category_id: 3,
        seller_id: 1,
        status: "available",
        created_at: "2024-01-08T08:00:00Z",
        updated_at: "2024-01-18T08:00:00Z",
        category: "Accessories",
        rating: 5,
        reviews: 203,
        sizes: ["One Size"],
        colors: ["black", "blue"],
        type: "accessory"
    },
    5: {
        id: 5,
        name: "UEH Varsity Jacket",
        description: "Classic varsity jacket with premium materials and authentic UEH styling.",
        price: 89.00,
        discount_price: null,
        quantity: 10,
        image_url: "../../assets/images/products/demo.png",
        category_id: 1,
        seller_id: 1,
        status: "available",
        created_at: "2024-01-12T10:00:00Z",
        updated_at: "2024-01-22T10:00:00Z",
        category: "Men's clothing",
        rating: 4,
        reviews: 67,
        sizes: ["S", "M", "L", "XL"],
        colors: ["black", "blue", "red"],
        type: "hoodie"
    },
    6: {
        id: 6,
        name: "UEH Sport Cap",
        description: "Adjustable cap with embroidered UEH logo. Perfect for sports and casual wear.",
        price: 22.00,
        discount_price: null,
        quantity: 30,
        image_url: "../../assets/images/products/demo.png",
        category_id: 3,
        seller_id: 1,
        status: "available",
        created_at: "2024-01-09T11:00:00Z",
        updated_at: "2024-01-19T11:00:00Z",
        category: "Accessories",
        rating: 4,
        reviews: 94,
        sizes: ["One Size"],
        colors: ["black", "white", "blue"],
        type: "accessory"
    },
    7: {
        id: 7,
        name: "UEH Premium Polo",
        description: "Elegant polo shirt with UEH emblem. Perfect for formal and casual occasions.",
        price: 55.00,
        discount_price: null,
        quantity: 40,
        image_url: "../../assets/images/products/demo.png",
        category_id: 1,
        seller_id: 1,
        status: "available",
        created_at: "2024-01-11T13:00:00Z",
        updated_at: "2024-01-21T13:00:00Z",
        category: "Men's clothing",
        rating: 5,
        reviews: 112,
        sizes: ["S", "M", "L", "XL", "XXL"],
        colors: ["white", "black", "blue"],
        type: "tee"
    },
    8: {
        id: 8,
        name: "UEH Winter Scarf",
        description: "Warm and stylish scarf featuring UEH colors. Essential for winter campus days.",
        price: 28.00,
        discount_price: null,
        quantity: 25,
        image_url: "../../assets/images/products/demo.png",
        category_id: 3,
        seller_id: 1,
        status: "available",
        created_at: "2024-01-06T15:00:00Z",
        updated_at: "2024-01-16T15:00:00Z",
        category: "Accessories",
        rating: 4,
        reviews: 76,
        sizes: ["One Size"],
        colors: ["blue", "black", "red"],
        type: "accessory"
    },
    9: {
        id: 9,
        name: "UEH Track Pants",
        description: "Comfortable track pants for sports and leisure. Made with moisture-wicking fabric.",
        price: 42.00,
        discount_price: null,
        quantity: 35,
        image_url: "../../assets/images/products/demo.png",
        category_id: 2,
        seller_id: 1,
        status: "available",
        created_at: "2024-01-13T14:00:00Z",
        updated_at: "2024-01-23T14:00:00Z",
        category: "Unisex clothing",
        rating: 4,
        reviews: 158,
        sizes: ["XS", "S", "M", "L", "XL"],
        colors: ["black", "blue"],
        type: "hoodie"
    },
    10: {
        id: 10,
        name: "UEH Business Card Holder",
        description: "Professional card holder with UEH logo. Perfect for networking events.",
        price: 18.00,
        discount_price: null,
        quantity: 50,
        image_url: "../../assets/images/products/demo.png",
        category_id: 3,
        seller_id: 1,
        status: "available",
        created_at: "2024-01-14T16:00:00Z",
        updated_at: "2024-01-24T16:00:00Z",
        category: "Accessories",
        rating: 5,
        reviews: 43,
        sizes: ["One Size"],
        colors: ["black"],
        type: "accessory"
    },
    11: {
        id: 11,
        name: "UEH Long Sleeve Tee",
        description: "Comfortable long sleeve tee with subtle UEH branding. Great for layering.",
        price: 32.00,
        discount_price: null,
        quantity: 45,
        image_url: "../../assets/images/products/demo.png",
        category_id: 2,
        seller_id: 1,
        status: "available",
        created_at: "2024-01-04T10:00:00Z",
        updated_at: "2024-01-14T10:00:00Z",
        category: "Unisex clothing",
        rating: 4,
        reviews: 87,
        sizes: ["XS", "S", "M", "L", "XL"],
        colors: ["white", "black", "blue"],
        type: "tee"
    },
    12: {
        id: 12,
        name: "UEH Graduation Bear",
        description: "Adorable graduation bear wearing UEH cap and gown. Perfect graduation gift.",
        price: 35.00,
        discount_price: null,
        quantity: 0,
        image_url: "../../assets/images/products/demo.png",
        category_id: 3,
        seller_id: 1,
        status: "out_of_stock",
        created_at: "2024-01-07T17:15:00Z",
        updated_at: "2024-01-30T14:45:00Z",
        category: "Accessories",
        rating: 5,
        reviews: 124,
        sizes: ["One Size"],
        colors: ["brown"],
        type: "accessory"
    }
};

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    const productId = getProductIdFromUrl();
    loadProductFromAPI(productId);
    // Review functionality will be initialized after product is loaded
});

// Load product data from API
async function loadProductFromAPI(productId) {
    
    try {
        // Check if apiService is available
        if (typeof window.apiService === 'undefined') {
            throw new Error('API Service not available');
        }
        
        // Show loading state
        showLoadingState();
        
        // Call API to get product detail
        const response = await window.apiService.getProductDetail(productId);
        
        if (response.success && response.data) {
            // Transform API data to match UI expectations
            currentProduct = transformProductData(response.data);
            
    // Update basic DOM elements first
    updateBasicProductUI();
    
    // Load reviews and ratings
    await loadProductReviews(productId);
    await loadProductReviewStats(productId);
    
    // Update rating display after stats are loaded
    updateRatingDisplay();
    
    // Initialize review functionality after product is loaded
    initializeReviewFunctionality();        } else {
            throw new Error('Invalid API response or product not found');
        }
        
    } catch (error) {
        
        // Fallback to sample data
        loadProduct(productId);
        
        // Show user-friendly error message
        if (window.UiUtils) {
            UiUtils.showToast('Unable to load product details. Using cached data.', 'warning');
        }
        
    } finally {
        hideLoadingState();
    }
}

// Transform API product data to match UI expectations
function transformProductData(apiProduct) {
    // Handle image URL - support both full URLs and relative paths
    let imageUrl = apiProduct.image_url || 'demo.png';
    
    // If it's already a full URL (starts with http), use as is
    // Otherwise, construct local path
    if (!imageUrl.startsWith('http')) {
        // Remove any leading path separators and construct proper path
        const filename = imageUrl.replace(/^.*[\\\/]/, ''); // Get just filename
        imageUrl = `../../assets/images/products/${filename}`;
    }
    
    return {
        id: apiProduct.id,
        name: apiProduct.name || 'Unknown Product',
        description: apiProduct.description || 'No description available',
        price: parseFloat(apiProduct.price) || 0,
        discount_price: (apiProduct.discount_price !== null && apiProduct.discount_price !== undefined) 
            ? parseFloat(apiProduct.discount_price) 
            : null,
        quantity: apiProduct.quantity || 0,
        image_url: imageUrl,
        category_id: apiProduct.category_id,
        category: apiProduct.category_name || apiProduct.category || 'General',
        rating: apiProduct.rating || Math.floor(Math.random() * 2) + 4, // 4-5 stars
        reviews: apiProduct.reviews || Math.floor(Math.random() * 100) + 10,
        sizes: apiProduct.sizes || ["S", "M", "L", "XL"],
        colors: apiProduct.colors || ["black", "white"],
        type: apiProduct.type || determineProductType(apiProduct.name),
        status: apiProduct.status || 'available',
        seller_name: apiProduct.seller_name || 'Unimerch'
    };
}

// Determine product type from name (helper function)
function determineProductType(name) {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('hoodie') || lowerName.includes('sweater')) return 'hoodie';
    if (lowerName.includes('tee') || lowerName.includes('shirt')) return 'tee';
    if (lowerName.includes('cap') || lowerName.includes('hat')) return 'accessory';
    if (lowerName.includes('bag') || lowerName.includes('bottle')) return 'accessory';
    return 'other';
}

// Update basic product UI elements
function updateBasicProductUI() {
    const productImage = document.getElementById('productImage');
    const productTitle = document.getElementById('productTitle');
    const productCategory = document.getElementById('productCategory');
    const productDescription = document.getElementById('productDescription');
    const totalPrice = document.getElementById('totalPrice');
    
    if (productImage) {
        productImage.src = currentProduct.image_url;
        
        // Add error handling for image loading
        productImage.onerror = function() {
            this.src = '../../assets/images/products/demo.png';
        };
        
        productImage.onload = function() {
        };
    }
    
    if (productTitle) productTitle.textContent = currentProduct.name;
    if (productCategory) productCategory.textContent = currentProduct.category;
    if (productDescription) productDescription.textContent = currentProduct.description;
    
    // Update price with discount logic
    updatePriceDisplay();
    
    // Update price UI
    updateTotalPrice();
    
    // Update document title
    document.title = `${currentProduct.name} - UEH Merch`;
}

// Update price display with discount logic
function updatePriceDisplay() {
    const priceContainer = document.getElementById('priceContainer');
    if (!priceContainer || !currentProduct) return;
    
    const hasDiscount = currentProduct.discount_price !== null && 
                       currentProduct.discount_price !== undefined && 
                       currentProduct.discount_price > 0 && 
                       currentProduct.discount_price < currentProduct.price;
    
    const displayPrice = hasDiscount ? currentProduct.discount_price : currentProduct.price;
    
    if (hasDiscount) {
        // Hiển thị giá giảm ở trên, giá gốc gạch ở dưới
        priceContainer.innerHTML = `
            <div class="d-flex flex-column gap-2">
                <div id="totalPrice" class="price-display" style="color: var(--accent);">
                    ${formatPrice(displayPrice)}
                </div>
                <div class="text-decoration-line-through" style="font-size: 1.5rem; color: rgba(255,255,255,0.5);">
                    ${formatPrice(currentProduct.price)}
                </div>
            </div>
        `;
    } else {
        // Chỉ hiển thị giá gốc
        priceContainer.innerHTML = `
            <div id="totalPrice" class="price-display">
                ${formatPrice(displayPrice)}
            </div>
        `;
    }
}

// Update rating display after stats are loaded
function updateRatingDisplay() {
    const ratingContainer = document.getElementById('productRating');
    if (ratingContainer && reviewStats.average_rating) {
        ratingContainer.innerHTML = generateStarsHTML(reviewStats.average_rating);
    } else {
    }
}

// Show loading state
function showLoadingState() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.remove('fade-out');
        overlay.style.display = 'flex';
    }
}

// Hide loading state
function hideLoadingState() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.add('fade-out');
        
        // Remove overlay after animation completes
        setTimeout(() => {
            overlay.style.display = 'none';
            document.body.classList.remove('loading');
        }, 300);
    }
}

// Legacy load product function (fallback)
function loadProduct(productId) {
    currentProduct = productData[productId] || productData[1];
    
    updateProductUI();
}

// Generate rating stars
function generateRatingStars() {
    const ratingContainer = document.getElementById('productRating');
    if (ratingContainer) {
        ratingContainer.innerHTML = generateStarsHTML(currentProduct.rating || 0);
    }
}

function formatPrice(price) {
    // Support for both number and string
    let n = typeof price === 'number' ? price : parseFloat(price);
    return n.toLocaleString('vi-VN') + 'đ';
}

// Change quantity
function changeQuantity(change) {
    const quantityInput = document.getElementById('quantity');
    let newQuantity = parseInt(quantityInput.value) + change;
    
    if (newQuantity < 1) newQuantity = 1;
    if (newQuantity > 10) newQuantity = 10;
    
    quantity = newQuantity;
    quantityInput.value = quantity;
    updateTotalPrice();
}

// Update total price
function updateTotalPrice() {
    // Use discount price if available, otherwise use regular price
    const pricePerUnit = (currentProduct.discount_price !== null && 
                          currentProduct.discount_price !== undefined && 
                          currentProduct.discount_price > 0 && 
                          currentProduct.discount_price < currentProduct.price)
        ? currentProduct.discount_price 
        : currentProduct.price;
    
    const total = pricePerUnit * quantity;
    const totalPriceElement = document.getElementById('totalPrice');
    
    if (totalPriceElement) {
        totalPriceElement.textContent = formatPrice(total);
    }
}

// Add to cart
function addToCart() {
    // Check if cart service is available
    if (window.cartService) {
        // Prepare product data for cart
        const productData = {
            product_name: currentProduct.name,
            product_price: currentProduct.price,
            discount_price: currentProduct.discount_price,
            image: currentProduct.image_url,
            name: currentProduct.name,
            price: currentProduct.price
        };
        
        // Add to cart using cart service
        cartService.addToCart(currentProduct.id, quantity, productData);
        
        // Show cart after adding
        if (window.cartUI) {
            setTimeout(() => {
                cartUI.showCart();
            }, 500); // Small delay to let the cart update
        }
    } else {
        // Fallback for when cart service is not available
        const cartItem = {
            id: currentProduct.id,
            name: currentProduct.name,
            price: currentProduct.price,
            quantity: quantity,
            image: currentProduct.image_url
        };
        
        
        // Create display message
        const message = `Added ${cartItem.name} x${cartItem.quantity} to cart!`;
        alert(message);
    }
}

// Buy now - Add to cart then redirect to create order page
async function buyNow() {
    // Check if user is logged in
    if (!window.apiService?.isAuthenticated()) {
        if (confirm('Bạn cần đăng nhập để mua hàng. Chuyển đến trang đăng nhập?')) {
            window.location.href = '../auth/login.html';
        }
        return;
    }

    try {
        // Show loading state
        const buyButton = document.querySelector('button[onclick="buyNow()"]');
        const originalText = buyButton.innerHTML;
        buyButton.disabled = true;
        buyButton.innerHTML = `
            <span class="spinner-border spinner-border-sm me-2" role="status"></span>
            Đang xử lý...
        `;

        // Prepare product data for cart
        const productData = {
            product_id: currentProduct.id,
            product_name: currentProduct.name,
            product_price: currentProduct.price,
            product_discount_price: currentProduct.discount_price,
            product_image: currentProduct.image_url
        };

        // Add to cart first
        if (window.cartService) {
            await cartService.addToCart(currentProduct.id, quantity, productData);
            
            // Set session flag for buy now action with product info
            sessionStorage.setItem('lastAction', 'buyNow');
            sessionStorage.setItem('buyNowProductId', currentProduct.id.toString());
        } else {
            throw new Error('Cart service not available');
        }

        // Wait a moment for cart to update
        await new Promise(resolve => setTimeout(resolve, 500));

        // Now redirect to create order page from cart with buy-now flag
        window.location.href = '../user/create-order.html?from=cart&buyNow=true';

    } catch (error) {
        alert('Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng. Vui lòng thử lại.');
        
        // Restore button
        const buyButton = document.querySelector('button[onclick="buyNow()"]');
        buyButton.disabled = false;
        buyButton.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="me-2">
                <path d="M9 12l2 2 4-4"></path>
                <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"></path>
            </svg>
            Mua
        `;
    }
}


// Quantity input change handler
document.addEventListener('DOMContentLoaded', function() {
    const quantityInput = document.getElementById('quantity');
    if (quantityInput) {
        quantityInput.addEventListener('change', function() {
            quantity = parseInt(this.value) || 1;
            if (quantity < 1) quantity = 1;
            if (quantity > 10) quantity = 10;
            this.value = quantity;
            updateTotalPrice();
        });
    }
});

// Load product reviews
async function loadProductReviews(productId) {
    try {
        const response = await window.apiService.getProductReviews(productId, { page: 1, limit: 20 });
        
        if (response.success && response.data) {
            productReviews = response.data.reviews || [];
            renderReviews();
        }
    } catch (error) {
        productReviews = [];
    }
}

// Load product review stats
async function loadProductReviewStats(productId) {
    try {
        const response = await window.apiService.getProductReviewStats(productId);
        
        if (response.success && response.data) {
            reviewStats = response.data;
            renderReviewStats();
        }
    } catch (error) {
        reviewStats = {};
    }
}

// Render review stats
function renderReviewStats() {
    const averageRating = document.getElementById('averageRating');
    const ratingStars = document.getElementById('ratingStars');
    const totalReviews = document.getElementById('totalReviews');
    const ratingDistribution = document.getElementById('ratingDistribution');
    
    // Safely update each element only if it exists
    if (averageRating) {
        averageRating.textContent = reviewStats.average_rating ? reviewStats.average_rating.toFixed(1) : '0.0';
    }
    
    if (ratingStars) {
        ratingStars.innerHTML = generateStarsHTML(reviewStats.average_rating || 0);
    }
    
    if (totalReviews) {
        totalReviews.textContent = `${reviewStats.total_reviews || 0} reviews`;
    }
    
    if (ratingDistribution && reviewStats.rating_distribution) {
        let distributionHTML = '';
        for (let i = 5; i >= 1; i--) {
            const count = reviewStats.rating_distribution[i] || 0;
            const percentage = reviewStats.total_reviews > 0 ? (count / reviewStats.total_reviews) * 100 : 0;
            
            distributionHTML += `
                <div class="d-flex align-items-center mb-2">
                    <div class="me-2" style="width: 20px; text-align: center; font-size: 0.8rem;">${i}</div>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" class="me-2" style="color: #ffc107;">
                        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon>
                    </svg>
                    <div class="flex-grow-1 me-2">
                        <div class="progress" style="height: 8px;">
                            <div class="progress-bar bg-warning" style="width: ${percentage}%"></div>
                        </div>
                    </div>
                    <div style="width: 40px; text-align: right; font-size: 0.8rem; color: #6b7280;">${count}</div>
                </div>
            `;
        }
        ratingDistribution.innerHTML = distributionHTML;
    }
}

// Render reviews list
function renderReviews() {
    const reviewsList = document.getElementById('reviewsList');
    const noReviews = document.getElementById('noReviews');
    
    if (!reviewsList) return;
    
    if (productReviews.length === 0) {
        reviewsList.innerHTML = '';
        if (noReviews) noReviews.style.display = 'block';
        return;
    }
    
    if (noReviews) noReviews.style.display = 'none';
    
    const currentUserId = window.apiService?.getCurrentUserId?.();
    
    let reviewsHTML = '';
    productReviews.forEach(review => {
        const isOwnReview = currentUserId && Number(review.user_id) === Number(currentUserId);
        
        const actionButtons = isOwnReview ? `
            <div class="d-flex gap-2">
                <button class="btn btn-outline-primary btn-sm" onclick="editReview(${review.id})">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="me-1">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    Sửa
                </button>
                <button class="btn btn-outline-danger btn-sm" onclick="deleteReview(${review.id})">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="me-1">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    Xóa
                </button>
            </div>
        ` : '';
        
        reviewsHTML += `
            <div class="border-bottom p-3">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <div>
                        <div class="fw-semibold">${review.user_full_name || review.username || 'Anonymous'}</div>
                        <div class="d-flex align-items-center">
                            ${generateStarsHTML(review.rating)}
                            <span class="text-light ms-2" style="font-size: 0.8rem;">
                                ${new Date(review.created_at).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                    ${actionButtons}
                </div>
                <div class="text-light">
                    ${review.comment || 'No comment provided'}
                </div>
            </div>
        `;
    });
    
    reviewsList.innerHTML = reviewsHTML;
}

// Generate stars HTML
function generateStarsHTML(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="color: #ffc107;">
                        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon>
                      </svg>`;
        } else {
            stars += `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="color: #e5e7eb;">
                        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon>
                      </svg>`;
        }
    }
    return stars;
}

// Initialize review functionality
function initializeReviewFunctionality() {
    
    // Rating input handlers
    document.querySelectorAll('.rating-input button').forEach(button => {
        button.addEventListener('click', function() {
            const rating = parseInt(this.dataset.rating);
            selectRating(rating);
        });
    });
    
    // Review form handler
    const reviewForm = document.getElementById('reviewForm');
    if (reviewForm) {
        reviewForm.addEventListener('submit', handleReviewSubmit);
    }
    
    // Filter handlers
    const ratingFilter = document.getElementById('ratingFilter');
    const sortFilter = document.getElementById('sortFilter');
    
    if (ratingFilter) {
        ratingFilter.addEventListener('change', filterReviews);
    }
    
    if (sortFilter) {
        sortFilter.addEventListener('change', sortReviews);
    }
    
    // Always check user review status - this function will handle both
    // authenticated and non-authenticated cases
    checkUserReviewStatus();
}

// Select rating for review
function selectRating(rating) {
    const ratingInput = document.getElementById('selectedRating');
    if (ratingInput) {
        ratingInput.value = rating;
    }
    
    // Update visual state
    document.querySelectorAll('.rating-input button').forEach((button, index) => {
        if (index < rating) {
            button.classList.remove('btn-outline-warning');
            button.classList.add('btn-warning');
        } else {
            button.classList.remove('btn-warning');
            button.classList.add('btn-outline-warning');
        }
    });
}

// Handle review form submission
async function handleReviewSubmit(event) {
    event.preventDefault();
    
    if (!window.apiService?.isAuthenticated()) {
        alert('Bạn cần đăng nhập để viết đánh giá');
        return;
    }
    
    const formData = new FormData(event.target);
    const reviewData = {
        product_id: currentProduct.id,
        rating: parseInt(formData.get('rating')),
        comment: formData.get('comment')
    };
    
    // Validate rating
    if (!reviewData.rating || reviewData.rating < 1 || reviewData.rating > 5) {
        alert('Vui lòng chọn số sao đánh giá (1-5)');
        return;
    }
    
    try {
        let response;
        const wasEditing = isEditing;
        
        if (isEditing && editingReviewId) {
            // Update existing review
            response = await window.apiService.updateReview(editingReviewId, reviewData);
        } else {
            // Create new review
            response = await window.apiService.createReview(reviewData);
        }
        
        // Only proceed if API confirms success
        if (response.success) {
            // Reset form
            event.target.reset();
            selectRating(0); // Reset star rating visual
            
            // Hide form
            const writeReviewSection = document.getElementById('writeReviewSection');
            if (writeReviewSection) {
                writeReviewSection.style.display = 'none';
                
                // Reset form title and submit button
                const formTitle = writeReviewSection.querySelector('.card-header h6');
                if (formTitle) {
                    formTitle.textContent = 'Viết đánh giá';
                }
            }
            
            const submitButton = document.querySelector('#reviewForm button[type="submit"]');
            if (submitButton) {
                submitButton.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="me-2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    Gửi đánh giá
                `;
            }
            
            // Reset editing state
            isEditing = false;
            editingReviewId = null;
            
            // Reload reviews and update UI (AJAX style - no page reload)
            await loadProductReviews(currentProduct.id);
            await loadProductReviewStats(currentProduct.id);
            
            // Update rating display safely
            updateRatingDisplay();
            
            // Show success message AFTER everything is updated
            if (wasEditing) {
                alert('Đánh giá đã được cập nhật thành công!');
            } else {
                alert('Đánh giá của bạn đã được gửi thành công!');
                
                // Hide write review button after first review
                const writeReviewButton = document.getElementById('writeReviewButton');
                if (writeReviewButton) {
                    writeReviewButton.style.display = 'none';
                }
            }
        } else {
            // Show specific error message from API if available
            const errorMessage = response.message || 'Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại.';
            alert(errorMessage);
        }
    } catch (error) {
        // Only show error if there's an actual error
        const errorMessage = error.message || 'Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại.';
        alert(errorMessage);
    }
}

// Display login message if not authenticated
function displayLoginMessage() {
    const noReviewsSection = document.getElementById('noReviews');
    if (noReviewsSection && !window.apiService?.isAuthenticated()) {
        noReviewsSection.innerHTML = `
            <div class="text-light">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="mb-3">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <h6>Đăng nhập để viết đánh giá</h6>
                <p class="mb-0">
                    <a href="../auth/login.html" class="text-primary text-decoration-none">Đăng nhập</a>
                    để chia sẻ trải nghiệm của bạn về sản phẩm này!
                </p>
            </div>
        `;
    }
}

// Check if user can write review
async function checkUserReviewStatus() {
    const writeReviewSection = document.getElementById('writeReviewSection');
    const writeReviewButton = document.getElementById('writeReviewButton');
    
    // Hide both by default
    writeReviewSection.style.display = 'none';
    writeReviewButton.style.display = 'none';
    
    // Add click handler to button to scroll to form
    if (writeReviewButton && !writeReviewButton.hasAttribute('data-listener')) {
        writeReviewButton.setAttribute('data-listener', 'true');
        writeReviewButton.addEventListener('click', function() {
            writeReviewSection.style.display = 'block';
            writeReviewSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    }
    
    // First check if user is authenticated
    if (!window.apiService?.isAuthenticated()) {
        displayLoginMessage();
        return;
    }
    
    try {
        const response = await window.apiService.checkProductReview(currentProduct.id);
        
        if (response.success) {
            if (!response.data.has_reviewed) {
                // Show button instead of section
                writeReviewButton.style.display = 'inline-block';
                // Don't auto-scroll on page load
            } else {
            }
        }
    } catch (error) {
    }
}

// Filter reviews by rating
function filterReviews() {
    const ratingFilter = document.getElementById('ratingFilter');
    const selectedRating = ratingFilter.value;
    
    if (!selectedRating) {
        renderReviews();
        return;
    }
    
    const filteredReviews = productReviews.filter(review => review.rating == selectedRating);
    renderFilteredReviews(filteredReviews);
}

// Sort reviews
function sortReviews() {
    const sortFilter = document.getElementById('sortFilter');
    const sortBy = sortFilter.value;
    
    let sortedReviews = [...productReviews];
    
    switch (sortBy) {
        case 'newest':
            sortedReviews.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            break;
        case 'oldest':
            sortedReviews.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            break;
        case 'highest':
            sortedReviews.sort((a, b) => b.rating - a.rating);
            break;
        case 'lowest':
            sortedReviews.sort((a, b) => a.rating - b.rating);
            break;
    }
    
    renderFilteredReviews(sortedReviews);
}

// Render filtered reviews
function renderFilteredReviews(reviews) {
    const reviewsList = document.getElementById('reviewsList');
    const noReviews = document.getElementById('noReviews');
    
    if (!reviewsList) return;
    
    if (reviews.length === 0) {
        reviewsList.innerHTML = '';
        if (noReviews) noReviews.style.display = 'block';
        return;
    }
    
    if (noReviews) noReviews.style.display = 'none';
    
    const currentUserId = window.apiService?.getCurrentUserId?.();
    let reviewsHTML = '';
    
    reviews.forEach(review => {
        const isOwnReview = currentUserId && review.user_id === currentUserId;
        
        const actionButtons = isOwnReview ? `
            <div class="d-flex gap-2">
                <button class="btn btn-outline-primary btn-sm" onclick="editReview(${review.id})">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="me-1">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    Sửa
                </button>
                <button class="btn btn-outline-danger btn-sm" onclick="deleteReview(${review.id})">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="me-1">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    Xóa
                </button>
            </div>
        ` : '';

        reviewsHTML += `
            <div class="border-bottom p-3" data-review-id="${review.id}">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <div>
                        <div class="fw-semibold">${review.user_full_name || review.username || 'Anonymous'}</div>
                        <div class="d-flex align-items-center">
                            ${generateStarsHTML(review.rating)}
                            <span class="text-light ms-2" style="font-size: 0.8rem;">
                                ${new Date(review.created_at).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                    ${actionButtons}
                </div>
                <div class="text-light">
                    ${review.comment || 'No comment provided'}
                </div>
            </div>
        `;
    });
    
    reviewsList.innerHTML = reviewsHTML;
}

// Edit review
async function editReview(reviewId) {
    if (!window.apiService?.isAuthenticated()) {
        alert('Bạn cần đăng nhập để sửa đánh giá');
        return;
    }

    try {
        const review = productReviews.find(r => r.id === reviewId);
        if (!review) {
            alert('Không tìm thấy đánh giá');
            return;
        }

        // Set form to edit mode
        isEditing = true;
        editingReviewId = reviewId;
        
        // Show the review form
        const writeReviewSection = document.getElementById('writeReviewSection');
        if (!writeReviewSection) {
            alert('Không tìm thấy form đánh giá');
            return;
        }
        
        writeReviewSection.style.display = 'block';
        
        // Update form title
        const formTitle = writeReviewSection.querySelector('.card-header h6');
        if (formTitle) {
            formTitle.textContent = 'Sửa đánh giá';
        }
        
        // Fill in existing review data
        const ratingInput = document.getElementById('selectedRating');
        const commentInput = document.getElementById('reviewComment');
        
        if (ratingInput) {
            ratingInput.value = review.rating;
        }
        
        if (commentInput) {
            commentInput.value = review.comment || '';
        }
        
        // Update rating stars
        selectRating(review.rating);
        
        // Scroll to form
        writeReviewSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Update submit button text
        const submitButton = document.querySelector('#reviewForm button[type="submit"]');
        if (submitButton) {
            submitButton.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="me-2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                Cập nhật đánh giá
            `;
        }
    } catch (error) {
        alert('Có lỗi xảy ra khi chuẩn bị sửa đánh giá. Vui lòng thử lại.');
    }
}

// Delete review
async function deleteReview(reviewId) {
    if (!window.apiService?.isAuthenticated()) {
        alert('Bạn cần đăng nhập để xóa đánh giá');
        return;
    }

    if (!confirm('Bạn có chắc chắn muốn xóa đánh giá này không?')) {
        return;
    }

    try {
        const response = await window.apiService.deleteReview(reviewId);
        if (response.success) {
            // Remove from local array
            productReviews = productReviews.filter(r => r.id !== reviewId);
            
            // Refresh stats first
            await loadProductReviewStats(currentProduct.id);
            
            // Update UI
            renderReviews();
            updateRatingDisplay();
            
            // Update reviews stats section
            const ratingStars = document.getElementById('ratingStars');
            if (ratingStars) {
                ratingStars.innerHTML = generateStarsHTML(reviewStats.average_rating || 0);
            }
            
            // Check if user can write review again (show button if they deleted their only review)
            await checkUserReviewStatus();
            
            alert('Đã xóa đánh giá thành công');
        } else {
            const errorMessage = response.message || 'Có lỗi xảy ra khi xóa đánh giá';
            alert(errorMessage);
        }
    } catch (error) {
        const errorMessage = error.message || 'Có lỗi xảy ra khi xóa đánh giá';
        alert(errorMessage);
    }
}
