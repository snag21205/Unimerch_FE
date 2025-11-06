// All Products Page JavaScript
// Handles product listing, search, filtering, sorting, and pagination

// Global variables
let currentPage = 1;
let currentLimit = 12; // 12 products per page
let currentFilters = {
    search: '',
    category: 'all',
    sort: 'newest',
    minPrice: null,
    maxPrice: null
};
let allProducts = []; // All products from API
let filteredProducts = []; // Products after filtering
let displayProducts = []; // Products to display on current page
let totalProducts = 0;
let totalPages = 0;
let allCategories = [];

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    
    // Check authentication state
    checkAuthState();
    
    // Initialize page
    initializePage();
    
    // Load categories first, then setup and load products
    loadCategories().then(() => {
        setupEventListeners();
        loadProducts();
    });
});

// Load categories from API
async function loadCategories() {
    try {
        const response = await window.apiService.getCategories();
        allCategories = response?.data || [];
        
        // Render category filter buttons
        renderCategoryFilters();
        
        // Render footer category links
        renderFooterCategoryLinks();
    } catch (error) {
        console.error('Error loading categories:', error);
        // Use empty array if API fails
        allCategories = [];
    }
}

// Render category filter buttons
function renderCategoryFilters() {
    const filterContainer = document.querySelector('.filter-scroll-wrapper');
    if (!filterContainer) return;
    
    // Keep the label if it exists
    const label = filterContainer.querySelector('span');
    
    // Clear existing filters except the label
    filterContainer.innerHTML = '';
    if (label) {
        filterContainer.appendChild(label);
    }
    
    // Add "All" button
    const allButton = document.createElement('button');
    allButton.className = 'btn rounded-pill filter-btn active';
    allButton.setAttribute('data-filter', 'all');
    allButton.textContent = 'Tất cả';
    allButton.style.cssText = `
        background: var(--accent);
        border: 2px solid var(--accent);
        color: var(--bg-dark);
        font-weight: 700;
        font-size: 0.75rem;
        letter-spacing: 0.5px;
        transition: all 0.3s ease;
        text-transform: uppercase;
        padding: 0.35rem 0.75rem;
        white-space: nowrap;
        flex-shrink: 0;
    `;
    filterContainer.appendChild(allButton);
    
    // Add category buttons
    allCategories.forEach(category => {
        const button = document.createElement('button');
        button.className = 'btn rounded-pill filter-btn';
        button.setAttribute('data-filter', category.id || category.category_id);
        button.textContent = category.name || category.category_name;
        button.style.cssText = `
            background: rgba(255,255,255,0.08);
            border: 2px solid rgba(255,255,255,0.2);
            color: var(--text-light);
            font-weight: 600;
            font-size: 0.75rem;
            letter-spacing: 0.5px;
            transition: all 0.3s ease;
            text-transform: uppercase;
            padding: 0.35rem 0.75rem;
            white-space: nowrap;
            flex-shrink: 0;
        `;
        button.addEventListener('mouseover', function() {
            if (!this.classList.contains('active')) {
                this.style.background = 'rgba(255,255,255,0.15)';
                this.style.borderColor = 'var(--accent)';
                this.style.color = 'var(--accent)';
            }
        });
        button.addEventListener('mouseout', function() {
            if (!this.classList.contains('active')) {
                this.style.background = 'rgba(255,255,255,0.08)';
                this.style.borderColor = 'rgba(255,255,255,0.2)';
                this.style.color = 'var(--text-light)';
            }
        });
        filterContainer.appendChild(button);
    });
}

// Render footer category links
function renderFooterCategoryLinks() {
    // Find the footer "Cửa hàng" section
    const footerShopSection = document.querySelector('footer .col-md-3:first-child ul');
    if (!footerShopSection) return;
    
    // Get existing links to preserve
    const existingLinks = footerShopSection.innerHTML;
    
    // Clear and rebuild with dynamic categories
    footerShopSection.innerHTML = '';
    
    // Add featured and all products links
    footerShopSection.innerHTML = `
        <li class="mb-2"><a href="../../index.html#featured" class="text-light text-decoration-none" style="font-size: 0.95rem; opacity: 0.8; transition: all 0.3s ease;" onmouseover="this.style.opacity='1'; this.style.color='#0F766E'" onmouseout="this.style.opacity='0.8'; this.style.color='#f8f9fa'">Sản phẩm nổi bật</a></li>
        <li class="mb-2"><a href="all-products.html" class="text-light text-decoration-none" style="font-size: 0.95rem; opacity: 0.8; transition: all 0.3s ease;" onmouseover="this.style.opacity='1'; this.style.color='#0F766E'" onmouseout="this.style.opacity='0.8'; this.style.color='#f8f9fa'">Tất cả sản phẩm</a></li>
    `;
    
    // Add category links dynamically
    allCategories.forEach(category => {
        const li = document.createElement('li');
        li.className = 'mb-2';
        li.innerHTML = `<a href="all-products.html?category=${category.id || category.category_id}" class="text-light text-decoration-none" style="font-size: 0.95rem; opacity: 0.8; transition: all 0.3s ease;" onmouseover="this.style.opacity='1'; this.style.color='#0F766E'" onmouseout="this.style.opacity='0.8'; this.style.color='#f8f9fa'">${category.name || category.category_name}</a>`;
        footerShopSection.appendChild(li);
    });
}

// Initialize page components
function initializePage() {
    
    // Parse URL parameters
    parseURLParameters();
    
    // Show loading spinner
    showLoading(true);
    
    // Initialize cart UI
    if (window.cartUI && typeof window.cartUI.updateCartDisplay === 'function') {
        window.cartUI.updateCartDisplay();
    } else if (window.cartService && typeof window.cartService.updateCartDisplay === 'function') {
        window.cartService.updateCartDisplay();
    }
}

// Parse URL parameters and apply initial filters
function parseURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Get category from URL
    const category = urlParams.get('category');
    if (category) {
        currentFilters.category = category;
        
        // Update filter button
        const categoryBtn = document.querySelector(`[data-filter="${category}"]`);
        if (categoryBtn) {
            updateActiveFilter(categoryBtn);
        }
    }
    
    // Get search term from URL
    const search = urlParams.get('search');
    if (search) {
        currentFilters.search = search;
        
        // Update search input
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = search;
        }
    }
    
    // Get sort from URL
    const sort = urlParams.get('sort');
    if (sort) {
        currentFilters.sort = sort;
        
        // Update sort dropdown
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.value = sort;
        }
    }
    
}

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 500));
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
    }
    
    if (searchBtn) {
        searchBtn.addEventListener('click', handleSearch);
    }
    
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.dataset.filter;
            handleCategoryFilter(category);
            updateActiveFilter(this);
        });
    });
    
    // Sort dropdown
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            handleSort(this.value);
        });
    }
    
    // Clear filters button
    const clearFiltersBtn = document.getElementById('clearFiltersBtn');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearAllFilters);
    }
    
    // Navigation scroll effect
    window.addEventListener('scroll', handleScroll);
}

// Load products from API
async function loadProducts() {
    try {
        
        // Build query parameters - get ALL products (no pagination on API side)
        const params = new URLSearchParams({
            page: 1,
            limit: 1000 // Get all products
        });
        
        // Add search parameter
        if (currentFilters.search) {
            params.append('search', currentFilters.search);
        }
        
        // Add category filter
        if (currentFilters.category && currentFilters.category !== 'all') {
            params.append('category_id', currentFilters.category);
        }
        
        // Add price filters
        if (currentFilters.minPrice) {
            params.append('min_price', currentFilters.minPrice);
        }
        if (currentFilters.maxPrice) {
            params.append('max_price', currentFilters.maxPrice);
        }
        
        // Make API request
        const response = await window.apiService.getProducts(params);
        
        if (response.success && response.data) {
            
            // Get all products from response
            allProducts = response.data.products || response.data;
            
            // Apply client-side filtering and sorting
            applyFiltersAndSort();
            
            // Calculate pagination based on filtered products
            totalProducts = filteredProducts.length;
            totalPages = Math.ceil(totalProducts / currentLimit);
            
            // Get products for current page
            const startIndex = (currentPage - 1) * currentLimit;
            const endIndex = startIndex + currentLimit;
            displayProducts = filteredProducts.slice(startIndex, endIndex);
            
            
            // Render products for current page
            renderProducts();
            
            // Update pagination
            updatePagination();
            
            // Update results info
            updateResultsInfo();
            
        } else {
            showError('Không thể tải sản phẩm. Vui lòng thử lại sau.');
        }
        
    } catch (error) {
        console.error('Error loading products:', error);
        showError('Có lỗi xảy ra khi tải sản phẩm.');
    } finally {
        showLoading(false);
    }
}

// Apply filters and sorting to products
function applyFiltersAndSort() {
    // Start with all products
    filteredProducts = [...allProducts];
    
    // Apply sorting
    applySorting();
}

// Handle search
function handleSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput ? searchInput.value.trim() : '';
    
    
    currentFilters.search = searchTerm;
    currentPage = 1; // Reset to first page
    
    // Show clear filters button if search term exists
    updateClearFiltersButton();
    
    loadProducts();
}

// Handle category filter
function handleCategoryFilter(category) {
    
    currentFilters.category = category;
    currentPage = 1; // Reset to first page
    
    // Show clear filters button if not showing all
    updateClearFiltersButton();
    
    loadProducts();
}

// Handle sort
function handleSort(sortValue) {
    
    currentFilters.sort = sortValue;
    
    // Re-apply filters and sorting
    applyFiltersAndSort();
    
    // Recalculate pagination
    totalProducts = filteredProducts.length;
    totalPages = Math.ceil(totalProducts / currentLimit);
    
    // Get products for current page
    const startIndex = (currentPage - 1) * currentLimit;
    const endIndex = startIndex + currentLimit;
    displayProducts = filteredProducts.slice(startIndex, endIndex);
    
    // Re-render
    renderProducts();
    updatePagination();
    
    // Scroll to top of products section
    const productsSection = document.querySelector('section.py-5');
    if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Apply sorting to products
function applySorting() {
    if (!filteredProducts || filteredProducts.length === 0) return;
    
    switch (currentFilters.sort) {
        case 'newest':
            filteredProducts.sort((a, b) => new Date(b.created_at || b.updated_at) - new Date(a.created_at || a.updated_at));
            break;
        case 'oldest':
            filteredProducts.sort((a, b) => new Date(a.created_at || a.updated_at) - new Date(b.created_at || b.updated_at));
            break;
        case 'price_low':
            filteredProducts.sort((a, b) => (a.discount_price || a.price) - (b.discount_price || b.price));
            break;
        case 'price_high':
            filteredProducts.sort((a, b) => (b.discount_price || b.price) - (a.discount_price || a.price));
            break;
        case 'name_asc':
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name_desc':
            filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
            break;
        default:
            // Default to newest
            filteredProducts.sort((a, b) => new Date(b.created_at || b.updated_at) - new Date(a.created_at || a.updated_at));
    }
}

// Render products
function renderProducts() {
    const container = document.getElementById('productsGrid');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const noResults = document.getElementById('noResults');
    
    if (!container) {
        return;
    }
    
    // Hide loading spinner
    if (loadingSpinner) {
        loadingSpinner.classList.add('d-none');
    }
    
    if (!displayProducts || displayProducts.length === 0) {
        container.innerHTML = '';
        container.classList.add('d-none');
        if (noResults) {
            noResults.classList.remove('d-none');
        }
        return;
    }
    
    // Show products grid and hide no results
    container.classList.remove('d-none');
    container.classList.remove('loaded');
    if (noResults) {
        noResults.classList.add('d-none');
    }
    
    // Render product cards with mobile optimization
    container.innerHTML = displayProducts.map((product, index) => {
        // Convert prices to numbers for proper comparison
        const price = parseFloat(product.price) || 0;
        const discountPrice = product.discount_price ? parseFloat(product.discount_price) : null;
        
        // Check if product has valid discount
        const hasDiscount = discountPrice !== null && 
                           discountPrice > 0 && 
                           discountPrice < price;
        
        const displayPrice = hasDiscount ? discountPrice : price;
        const discountPercent = hasDiscount ? 
            Math.round(((price - discountPrice) / price) * 100) : 0;
        const isOutOfStock = product.quantity === 0 || product.status === 'out_of_stock';
        
        return `
            <div class="col-6 col-md-4 col-lg-3">
                <div class="product-card-simple" onclick="goToProductDetail(${product.id})">
                    
                    <!-- Product Image Section -->
                    <div class="position-relative overflow-hidden product-image-container">
                        ${hasDiscount ? `
                            <div class="position-absolute discount-badge">
                                <span class="badge bg-danger text-white px-2 py-1 rounded-pill">
                                    -${discountPercent}%
                                </span>
                            </div>
                        ` : ''}
                        
                        <img src="${getProductImageUrl(product)}" 
                             alt="${product.name}" 
                             class="product-image" 
                             onerror="this.src='../../assets/images/products/demo.png'; this.onerror=null;">
                    </div>

                    <!-- Product Content -->
                    <div class="product-content">
                        
                        <!-- Product Title -->
                        <h5 class="product-title fw-bold mb-2">${product.name}</h5>
                        
                        <!-- Price Section -->
                        <div class="mb-2 product-price">
                            ${hasDiscount ? `
                                <div class="d-flex flex-column gap-1">
                                    <span class="fw-bold price-main">${formatPrice(displayPrice)}</span>
                                    <span class="price-old text-decoration-line-through">${formatPrice(price)}</span>
                                </div>
                            ` : `
                                <span class="fw-bold price-main">${formatPrice(displayPrice)}</span>
                            `}
                        </div>
                        
                        <!-- Action Button -->
                        <button class="btn w-100 product-btn" 
                                onclick="addToCart(${product.id}, event)" 
                                ${isOutOfStock ? 'disabled' : ''}>
                            ${isOutOfStock ? 'Hết hàng' : 'Thêm vào giỏ'}
                        </button>
                    </div>
                    
                    <!-- Stock Status Overlay -->
                    ${isOutOfStock ? `
                        <div class="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center stock-overlay">
                            <div class="text-center">
                                <div class="badge bg-white text-dark px-3 py-2 rounded-pill mb-2">
                                    Hết hàng
                                </div>
                                <p class="text-white mb-0 small">Sẽ cập nhật sớm</p>
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
    
    // Trigger fade-in animation
    setTimeout(() => {
        container.classList.add('loaded');
    }, 50);
}


// Update pagination
function updatePagination() {
    const pagination = document.getElementById('pagination');
    
    if (!pagination) {
        console.warn('Pagination element not found!');
        return;
    }
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Previous button
    if (currentPage > 1) {
        paginationHTML += `
            <li class="page-item">
                <a class="page-link" href="#" onclick="goToPage(${currentPage - 1}); return false;">
                    <i class="bi bi-chevron-left"></i> Trước
                </a>
            </li>
        `;
    } else {
        paginationHTML += `
            <li class="page-item disabled">
                <span class="page-link">
                    <i class="bi bi-chevron-left"></i> Trước
                </span>
            </li>
        `;
    }
    
    // First page
    if (currentPage > 3) {
        paginationHTML += `
            <li class="page-item">
                <a class="page-link" href="#" onclick="goToPage(1); return false;">1</a>
            </li>
        `;
        if (currentPage > 4) {
            paginationHTML += `
                <li class="page-item disabled">
                    <span class="page-link">...</span>
                </li>
            `;
        }
    }
    
    // Page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" onclick="goToPage(${i}); return false;">${i}</a>
            </li>
        `;
    }
    
    // Last page
    if (currentPage < totalPages - 2) {
        if (currentPage < totalPages - 3) {
            paginationHTML += `
                <li class="page-item disabled">
                    <span class="page-link">...</span>
                </li>
            `;
        }
        paginationHTML += `
            <li class="page-item">
                <a class="page-link" href="#" onclick="goToPage(${totalPages}); return false;">${totalPages}</a>
            </li>
        `;
    }
    
    // Next button
    if (currentPage < totalPages) {
        paginationHTML += `
            <li class="page-item">
                <a class="page-link" href="#" onclick="goToPage(${currentPage + 1}); return false;">
                    Sau <i class="bi bi-chevron-right"></i>
                </a>
            </li>
        `;
    } else {
        paginationHTML += `
            <li class="page-item disabled">
                <span class="page-link">
                    Sau <i class="bi bi-chevron-right"></i>
                </span>
            </li>
        `;
    }
    
    pagination.innerHTML = paginationHTML;
}

// Go to specific page
function goToPage(page) {
    event.preventDefault(); // Prevent default anchor behavior
    
    currentPage = page;
    
    // Get products for new page
    const startIndex = (currentPage - 1) * currentLimit;
    const endIndex = startIndex + currentLimit;
    displayProducts = filteredProducts.slice(startIndex, endIndex);
    
    
    // Re-render products and pagination
    renderProducts();
    updatePagination();
    updateResultsInfo();
    
    // Scroll to top of products section smoothly
    const productsSection = document.querySelector('section.py-5');
    if (productsSection) {
        const offset = 100; // Offset for fixed navbar
        const elementPosition = productsSection.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}

// Update results info
function updateResultsInfo() {
    const resultsInfo = document.getElementById('resultsInfo');
    
    if (!resultsInfo) return;
    
    const startItem = (currentPage - 1) * currentLimit + 1;
    const endItem = Math.min(currentPage * currentLimit, totalProducts);
    
    let infoText = `Hiển thị ${startItem}-${endItem} trong tổng số ${totalProducts} sản phẩm`;
    
    // Add filter info
    if (currentFilters.search) {
        infoText += ` cho "${currentFilters.search}"`;
    }
    
    if (currentFilters.category && currentFilters.category !== 'all') {
        // Find category name from loaded categories
        const category = allCategories.find(c => (c.id || c.category_id) == currentFilters.category);
        const categoryName = category ? (category.name || category.category_name) : currentFilters.category;
        infoText += ` trong danh mục ${categoryName}`;
    }
    
    resultsInfo.textContent = infoText;
}

// Update active filter button
function updateActiveFilter(activeButton) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.style.cssText = `
            background: rgba(255,255,255,0.08);
            border: 2px solid rgba(255,255,255,0.2);
            color: var(--text-light);
            font-weight: 600;
            font-size: 0.75rem;
            letter-spacing: 0.5px;
            transition: all 0.3s ease;
            text-transform: uppercase;
            padding: 0.35rem 0.75rem;
            white-space: nowrap;
            flex-shrink: 0;
        `;
    });
    
    activeButton.classList.add('active');
    activeButton.style.cssText = `
        background: var(--accent);
        border: 2px solid var(--accent);
        color: var(--bg-dark);
        font-weight: 700;
        font-size: 0.75rem;
        letter-spacing: 0.5px;
        transition: all 0.3s ease;
        text-transform: uppercase;
        padding: 0.35rem 0.75rem;
        white-space: nowrap;
        flex-shrink: 0;
    `;
}

// Update clear filters button visibility
function updateClearFiltersButton() {
    const clearBtn = document.getElementById('clearFiltersBtn');
    
    if (!clearBtn) return;
    
    const hasActiveFilters = currentFilters.search || 
                           (currentFilters.category && currentFilters.category !== 'all');
    
    if (hasActiveFilters) {
        clearBtn.classList.remove('d-none');
    } else {
        clearBtn.classList.add('d-none');
    }
}

// Clear all filters
function clearAllFilters() {
    
    // Reset filters
    currentFilters = {
        search: '',
        category: 'all',
        sort: 'newest',
        minPrice: null,
        maxPrice: null
    };
    
    // Reset page
    currentPage = 1;
    
    // Clear search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = '';
    }
    
    // Reset sort dropdown
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.value = 'newest';
    }
    
    // Reset filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active', 'btn-dark');
        btn.classList.add('btn-outline-dark');
    });
    
    // Activate "All" filter
    const allFilter = document.querySelector('[data-filter="all"]');
    if (allFilter) {
        updateActiveFilter(allFilter);
    }
    
    // Hide clear filters button
    updateClearFiltersButton();
    
    // Reload products
    loadProducts();
}

// Show/hide loading spinner
function showLoading(show) {
    const loadingSpinner = document.getElementById('loadingSpinner');
    const productsGrid = document.getElementById('productsGrid');
    
    if (loadingSpinner) {
        if (show) {
            loadingSpinner.classList.remove('d-none');
        } else {
            loadingSpinner.classList.add('d-none');
        }
    }
    
    if (productsGrid) {
        if (show) {
            productsGrid.classList.add('d-none');
        } else {
            productsGrid.classList.remove('d-none');
        }
    }
}

// Show error message
function showError(message) {
    const container = document.getElementById('productsGrid');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const noResults = document.getElementById('noResults');
    
    if (loadingSpinner) {
        loadingSpinner.style.display = 'none';
    }
    
    if (container) {
        container.style.display = 'none';
    }
    
    if (noResults) {
        noResults.style.display = 'block';
        noResults.innerHTML = `
            <div class="alert alert-danger" role="alert">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px;">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                ${message}
            </div>
        `;
    }
}

// Handle scroll for navbar
function handleScroll() {
    const navbar = document.getElementById('mainNav');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}

// Format price
function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price);
}

// Get product image URL with correct path
function getProductImageUrl(product) {
    let imageUrl = product.image_url || 'demo.png';
    
    // If it's already a full URL (starts with http), use as is
    if (imageUrl.startsWith('http')) {
        return imageUrl;
    }
    
    // If it's just a filename, construct the correct path based on current page
    if (!imageUrl.includes('/')) {
        // For demo.png and other default images, always use the correct path for all-products page
        if (imageUrl === 'demo.png') {
            return '../../assets/images/products/demo.png';
        }
        // For other filenames, use relative path from all-products page
        return `../../assets/images/products/${imageUrl}`;
    }
    
    // If it already has path, clean it up to avoid double paths
    if (imageUrl.includes('/pages/products/')) {
        return imageUrl.replace('/pages/products/', '');
    }
    
    // If it's a relative path starting with assets, make it relative to all-products page
    if (imageUrl.startsWith('assets/')) {
        return `../../${imageUrl}`;
    }
    
    return imageUrl;
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add to cart function using cart.service
function addToCart(productId, event) {
    if (event) {
        event.stopPropagation();
    }
    
    // Find product data
    const product = allProducts.find(p => p.id === productId);
    if (!product) {
        return;
    }
    
    
    // Use cart service if available
    if (window.cartService) {
        const productData = {
            product_name: product.name,
            product_price: product.price,
            discount_price: product.discount_price,
            image: getProductImageUrl(product),
            name: product.name,
            price: product.discount_price || product.price
        };
        
        cartService.addToCart(productId, 1, productData);
        
    } else {
        if (window.showToast) {
            window.showToast('Không thể thêm vào giỏ hàng. Vui lòng thử lại.', 'error');
        }
    }
}

// Go to product detail function
function goToProductDetail(productId) {
    window.location.href = `product-detail.html?id=${productId}`;
}

// Global functions for onclick handlers
window.goToPage = goToPage;
window.clearAllFilters = clearAllFilters;
window.addToCart = addToCart;
window.goToProductDetail = goToProductDetail;
