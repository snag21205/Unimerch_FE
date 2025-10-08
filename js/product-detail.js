// Product Detail Page JavaScript
let currentProduct = {};
let selectedSize = '';
let selectedColor = '';
let quantity = 1;

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
});

// Load product data from API
async function loadProductFromAPI(productId) {
    console.log('🔍 Loading product ID from API:', productId);
    
    try {
        // Check if apiService is available
        if (typeof window.apiService === 'undefined') {
            throw new Error('API Service not available');
        }
        
        // Show loading state
        showLoadingState();
        
        // Call API to get product detail
        const response = await window.apiService.getProductDetail(productId);
        console.log('📦 API Response:', response);
        
        if (response.success && response.data) {
            // Transform API data to match UI expectations
            currentProduct = transformProductData(response.data);
            console.log('✅ Current product loaded from API:', currentProduct);
            
            // Update DOM elements
            updateProductUI();
            
        } else {
            throw new Error('Invalid API response or product not found');
        }
        
    } catch (error) {
        console.error('❌ Failed to load product from API:', error);
        
        // Fallback to sample data
        console.log('🔄 Using fallback sample data...');
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
        discount_price: apiProduct.discount_price ? parseFloat(apiProduct.discount_price) : null,
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

// Update product UI elements
function updateProductUI() {
    const productImage = document.getElementById('productImage');
    const productTitle = document.getElementById('productTitle');
    const productCategory = document.getElementById('productCategory');
    const productDescription = document.getElementById('productDescription');
    const totalPrice = document.getElementById('totalPrice');
    
    if (productImage) {
        productImage.src = currentProduct.image_url;
        
        // Add error handling for image loading
        productImage.onerror = function() {
            console.warn('Failed to load image:', currentProduct.image_url);
            console.log('Falling back to demo.png');
            this.src = '../../assets/images/products/demo.png';
        };
        
        productImage.onload = function() {
            console.log('✅ Product image loaded successfully');
        };
    }
    
    if (productTitle) productTitle.textContent = currentProduct.name;
    if (productCategory) productCategory.textContent = currentProduct.category;
    if (productDescription) productDescription.textContent = currentProduct.description;
    if (totalPrice) totalPrice.textContent = `$${currentProduct.price}`;
    
    console.log('✅ Basic elements updated');
    
    // Generate rating stars
    generateRatingStars();
    
    // Generate size options
    console.log('🔧 Generating size options...');
    generateSizeOptions();
    
    // Generate color options
    console.log('🎨 Generating color options...');
    generateColorOptions();
    
    // Set default selections only if the product has valid options
    const hasValidSizes = currentProduct.sizes && 
                         currentProduct.sizes.length > 0 && 
                         !(currentProduct.sizes.length === 1 && currentProduct.sizes[0] === "One Size");
    const hasValidColors = currentProduct.colors && 
                          currentProduct.colors.length > 0 &&
                          !currentProduct.colors.every(color => !color || color === null);
    
    selectedSize = hasValidSizes ? currentProduct.sizes[0] : null;
    selectedColor = hasValidColors ? currentProduct.colors[0] : null;
    
    console.log('✅ Default selections:', { selectedSize, selectedColor });
    
    // Update UI
    updateTotalPrice();
    updateSelections();
    
    // Update document title
    document.title = `${currentProduct.name} - UEH Merch`;
    
    console.log('🎯 Product load complete!');
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
        }, 300);
    }
}

// Legacy load product function (fallback)
function loadProduct(productId) {
    console.log('🔍 Loading product ID (fallback):', productId);
    currentProduct = productData[productId] || productData[1];
    console.log('📦 Current product (fallback):', currentProduct);
    
    updateProductUI();
}

// Generate rating stars
function generateRatingStars() {
    const ratingContainer = document.getElementById('productRating');
    let starsHtml = '';
    
    for (let i = 1; i <= 5; i++) {
        if (i <= currentProduct.rating) {
            starsHtml += `<svg class="rating-star" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon>
                          </svg>`;
        } else {
            starsHtml += `<svg class="rating-star empty" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon>
                          </svg>`;
        }
    }
    
    ratingContainer.innerHTML = starsHtml;
}

// Generate size options
function generateSizeOptions() {
    const sizeContainer = document.getElementById('sizeOptions');
    const sizeSection = sizeContainer?.closest('.mb-3');
    
    console.log('📏 Size container found:', !!sizeContainer);
    console.log('📏 Available sizes:', currentProduct.sizes);
    
    if (!sizeContainer) {
        console.error('❌ Size container #sizeOptions not found!');
        return;
    }
    
    // Check if product has valid sizes (not null/empty/just ["One Size"])
    const hasValidSizes = currentProduct.sizes && 
                         currentProduct.sizes.length > 0 && 
                         !(currentProduct.sizes.length === 1 && currentProduct.sizes[0] === "One Size");
    
    if (!hasValidSizes) {
        // Hide size section or show disabled state
        if (sizeSection) {
            sizeSection.style.opacity = '0.5';
            sizeSection.style.pointerEvents = 'none';
        }
        sizeContainer.innerHTML = '<span class="text-muted">Không có tùy chọn kích thước</span>';
        selectedSize = null; // No size selection needed
        return;
    }
    
    // Show size section normally
    if (sizeSection) {
        sizeSection.style.opacity = '1';
        sizeSection.style.pointerEvents = 'auto';
    }
    
    let sizesHtml = '';
    currentProduct.sizes.forEach((size, index) => {
        sizesHtml += `<button class="btn btn-outline-secondary btn-sm ${index === 0 ? 'active' : ''}" 
                               onclick="selectSize('${size}')"
                               style="padding: 0.4rem 0.8rem; border-radius: 8px; font-size: 13px; min-width: 42px; ${size === 'One Size' ? 'min-width: 52px;' : ''}">${size}</button>`;
    });
    
    console.log('📏 Generated HTML:', sizesHtml);
    sizeContainer.innerHTML = sizesHtml;
    console.log('✅ Size options rendered');
}

// Generate color options
function generateColorOptions() {
    const colorContainer = document.getElementById('colorOptions');
    const colorSection = colorContainer?.closest('.mb-3');
    
    console.log('🎨 Color container found:', !!colorContainer);
    console.log('🎨 Available colors:', currentProduct.colors);
    
    if (!colorContainer) {
        console.error('❌ Color container #colorOptions not found!');
        return;
    }
    
    // Check if product has valid colors (not null/empty)
    const hasValidColors = currentProduct.colors && 
                          currentProduct.colors.length > 0 &&
                          !currentProduct.colors.every(color => !color || color === null);
    
    if (!hasValidColors) {
        // Hide color section or show disabled state
        if (colorSection) {
            colorSection.style.opacity = '0.5';
            colorSection.style.pointerEvents = 'none';
        }
        colorContainer.innerHTML = '<span class="text-muted">Không có tùy chọn màu sắc</span>';
        selectedColor = null; // No color selection needed
        return;
    }
    
    // Show color section normally
    if (colorSection) {
        colorSection.style.opacity = '1';
        colorSection.style.pointerEvents = 'auto';
    }
    
    let colorsHtml = '';
    currentProduct.colors.forEach((color, index) => {
        const colorValue = getColorValue(color);
        colorsHtml += `<div class="rounded-circle ${index === 0 ? 'border border-dark border-2' : 'border border-transparent border-2'}" 
                            onclick="selectColor('${color}')" 
                            title="${color}"
                            style="width: 28px; height: 28px; cursor: pointer; transition: all 0.2s ease; background-color: ${colorValue}; ${color === 'white' ? 'border: 2px solid rgba(0, 0, 0, 0.2) !important;' : ''}">
                       </div>`;
    });
    
    console.log('🎨 Generated HTML:', colorsHtml);
    colorContainer.innerHTML = colorsHtml;
    console.log('✅ Color options rendered');
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

// Select size
function selectSize(size) {
    selectedSize = size;
    updateSelections();
}

// Select color
function selectColor(color) {
    selectedColor = color;
    updateSelections();
}

// Update visual selections
function updateSelections() {
    // Update size selections
    document.querySelectorAll('#sizeOptions .btn').forEach(option => {
        option.classList.remove('active');
        if (option.textContent === selectedSize) {
            option.classList.add('active');
        }
    });
    
    // Update color selections
    document.querySelectorAll('#colorOptions > div').forEach((option, index) => {
        option.classList.remove('border-dark');
        option.classList.add('border-transparent');
        if (currentProduct.colors[index] === selectedColor) {
            option.classList.remove('border-transparent');
            option.classList.add('border-dark');
        }
    });
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
    const total = currentProduct.price * quantity;
    document.getElementById('totalPrice').textContent = `$${total}`;
}

// Add to cart
function addToCart() {
    // Check if size/color selection is required and valid
    const hasValidSizes = currentProduct.sizes && 
                         currentProduct.sizes.length > 0 && 
                         !(currentProduct.sizes.length === 1 && currentProduct.sizes[0] === "One Size");
    const hasValidColors = currentProduct.colors && 
                          currentProduct.colors.length > 0 &&
                          !currentProduct.colors.every(color => !color || color === null);

    // Only validate selections if the product actually has these options
    let finalSize = null;
    let finalColor = null;

    if (hasValidSizes) {
        const selectedSizeElement = document.querySelector('#sizeOptions .btn.active');
        if (!selectedSizeElement) {
            alert('Vui lòng chọn kích thước');
            return;
        }
        finalSize = selectedSizeElement.textContent;
    }

    if (hasValidColors) {
        const selectedColorElement = document.querySelector('#colorOptions .border-dark');
        if (!selectedColorElement) {
            alert('Vui lòng chọn màu sắc');
            return;
        }
        const colorIndex = Array.from(selectedColorElement.parentNode.children).indexOf(selectedColorElement);
        finalColor = currentProduct.colors[colorIndex];
    }

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

        // Only add size/color if the product has these options
        if (finalSize) productData.size = finalSize;
        if (finalColor) productData.color = finalColor;
        
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

        // Only add size/color if the product has these options
        if (finalSize) cartItem.size = finalSize;
        if (finalColor) cartItem.color = finalColor;
        
        console.log('Adding to cart:', cartItem);
        
        // Create display message with or without size/color
        let message = `Added ${cartItem.name}`;
        if (finalSize || finalColor) {
            const details = [];
            if (finalSize) details.push(finalSize);
            if (finalColor) details.push(finalColor);
            message += ` (${details.join(', ')})`;
        }
        message += ` x${cartItem.quantity} to cart!`;
        
        alert(message);
    }
}

// Buy now - Redirect to create order page
async function buyNow() {
    // Check if user is logged in
    if (!window.apiService?.isAuthenticated()) {
        if (confirm('Bạn cần đăng nhập để mua hàng. Chuyển đến trang đăng nhập?')) {
            window.location.href = '../auth/login.html';
        }
        return;
    }

    // Check if size/color selection is required and valid
    const hasValidSizes = currentProduct.sizes && 
                         currentProduct.sizes.length > 0 && 
                         !(currentProduct.sizes.length === 1 && currentProduct.sizes[0] === "One Size");
    const hasValidColors = currentProduct.colors && 
                          currentProduct.colors.length > 0 &&
                          !currentProduct.colors.every(color => !color || color === null);

    // Only validate selections if the product actually has these options
    if (hasValidSizes) {
        const selectedSizeElement = document.querySelector('#sizeOptions .btn.active');
        if (!selectedSizeElement) {
            alert('Vui lòng chọn kích thước');
            return;
        }
        selectedSize = selectedSizeElement.textContent;
    }

    if (hasValidColors) {
        const selectedColorElement = document.querySelector('#colorOptions .border-dark');
        if (!selectedColorElement) {
            alert('Vui lòng chọn màu sắc');
            return;
        }
        const colorIndex = Array.from(selectedColorElement.parentNode.children).indexOf(selectedColorElement);
        selectedColor = currentProduct.colors[colorIndex];
    }

    // Create URL with product parameters (only include size/color if product has them)
    const params = new URLSearchParams({
        from: 'product',
        productId: currentProduct.id,
        quantity: quantity
    });

    if (hasValidSizes && selectedSize) {
        params.append('size', selectedSize);
    }
    
    if (hasValidColors && selectedColor) {
        params.append('color', selectedColor);
    }

    // Redirect to create order page
    window.location.href = `../user/create-order.html?${params.toString()}`;
}

// Add to wishlist
function addToWishlist() {
    console.log('Adding to wishlist:', currentProduct);
    alert(`Added ${currentProduct.name} to wishlist!`);
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