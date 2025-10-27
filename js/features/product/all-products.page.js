// All Products Page JavaScript
// Handles product listing, search, filtering, sorting, and pagination

// Global variables
let currentPage = 1;
let currentLimit = 12;
let currentFilters = {
    search: '',
    category: 'all',
    sort: 'newest',
    minPrice: null,
    maxPrice: null
};
let allProducts = [];
let filteredProducts = [];
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
    const filterContainer = document.querySelector('.d-flex.flex-wrap.gap-2');
    if (!filterContainer) return;
    
    // Clear existing filters
    filterContainer.innerHTML = '';
    
    // Add "All" button
    const allButton = document.createElement('button');
    allButton.className = 'btn btn-outline-dark rounded-pill px-3 py-2 filter-btn active';
    allButton.setAttribute('data-filter', 'all');
    allButton.textContent = 'Tất cả';
    filterContainer.appendChild(allButton);
    
    // Add category buttons
    allCategories.forEach(category => {
        const button = document.createElement('button');
        button.className = 'btn btn-outline-dark rounded-pill px-3 py-2 filter-btn';
        button.setAttribute('data-filter', category.id || category.category_id);
        button.textContent = category.name || category.category_name;
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
        
        // Build query parameters
        const params = new URLSearchParams({
            page: currentPage,
            limit: currentLimit
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
            
            allProducts = response.data.products || response.data;
            totalProducts = response.data.total || allProducts.length;
            totalPages = Math.ceil(totalProducts / currentLimit);
            
            // Apply sorting
            applySorting();
            
            // Render products
            renderProducts();
            
            // Update pagination
            updatePagination();
            
            // Update results info
            updateResultsInfo();
            
        } else {
            showError('Không thể tải sản phẩm. Vui lòng thử lại sau.');
        }
        
    } catch (error) {
        showError('Có lỗi xảy ra khi tải sản phẩm.');
    } finally {
        showLoading(false);
    }
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
    applySorting();
    renderProducts();
    
    // Scroll to top of products section
    const productsSection = document.querySelector('section.py-5');
    if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Apply sorting to products
function applySorting() {
    if (!allProducts || allProducts.length === 0) return;
    
    switch (currentFilters.sort) {
        case 'newest':
            allProducts.sort((a, b) => new Date(b.created_at || b.updated_at) - new Date(a.created_at || a.updated_at));
            break;
        case 'oldest':
            allProducts.sort((a, b) => new Date(a.created_at || a.updated_at) - new Date(b.created_at || b.updated_at));
            break;
        case 'price_low':
            allProducts.sort((a, b) => (a.discount_price || a.price) - (b.discount_price || b.price));
            break;
        case 'price_high':
            allProducts.sort((a, b) => (b.discount_price || b.price) - (a.discount_price || a.price));
            break;
        case 'name_asc':
            allProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name_desc':
            allProducts.sort((a, b) => b.name.localeCompare(a.name));
            break;
        default:
            // Default to newest
            allProducts.sort((a, b) => new Date(b.created_at || b.updated_at) - new Date(a.created_at || a.updated_at));
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
        loadingSpinner.style.display = 'none';
    }
    
    if (!allProducts || allProducts.length === 0) {
        // Clear old products and show no results message
        container.innerHTML = '';
        container.style.display = 'none';
        if (noResults) {
            noResults.style.display = 'block';
        }
        return;
    }
    
    // Show products grid and hide no results
    container.style.display = 'flex';
    if (noResults) {
        noResults.style.display = 'none';
    }
    
    // Render product cards - always use consistent design
    container.innerHTML = allProducts.map(product => `
        <div class="col">
            <div class="card h-100 border-0 shadow-sm" style="transition: all 0.3s ease; cursor: pointer;" 
                 onclick="goToProductDetail(${product.id})" 
                 onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 12px 40px rgba(0,0,0,0.15)'" 
                 onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 20px rgba(0,0,0,0.1)'">
                
                <!-- Product Image -->
                <div class="position-relative overflow-hidden" style="height: 250px;">
                    <img src="${getProductImageUrl(product)}" 
                         class="card-img-top w-100 h-100" 
                         style="object-fit: cover; transition: transform 0.3s ease;"
                         alt="${product.name}"
                         onmouseover="this.style.transform='scale(1.05)'"
                         onmouseout="this.style.transform='scale(1)'"
                         onerror="this.src='../../assets/images/products/demo.png'; this.onerror=null;">
                </div>
                
                <!-- Product Info -->
                <div class="card-body p-3">
                    <h6 class="card-title fw-semibold mb-2" style="color: #111; font-size: 1rem; line-height: 1.3;">
                        ${product.name}
                    </h6>
                    <p class="card-text text-muted small mb-3" style="font-size: 0.8rem; line-height: 1.4; height: 2.4em; overflow: hidden;">
                        ${product.description ? product.description.substring(0, 60) + '...' : 'Sản phẩm chất lượng cao từ UEH'}
                    </p>
                    
                    <!-- Price -->
                    <div class="d-flex align-items-center justify-content-between mb-3">
                        <div class="price-info">
                            <span class="h6 fw-bold text-dark mb-0">${formatPrice(product.discount_price || product.price)}</span>
                            ${product.discount_price && product.discount_price < product.price ? 
                                `<small class="text-muted text-decoration-line-through ms-2">${formatPrice(product.price)}</small>` : ''
                            }
                        </div>
                        ${product.discount_price && product.discount_price < product.price ? 
                            `<span class="badge bg-danger rounded-pill" style="font-size: 0.7rem;">-${Math.round(((product.price - product.discount_price) / product.price) * 100)}%</span>` : ''
                        }
                    </div>
                    
                    <!-- Action Button -->
                    <button class="btn btn-dark w-100 rounded-pill py-2" 
                            onclick="addToCart(${product.id}, event)"
                            style="font-weight: 500; transition: all 0.3s ease; font-size: 0.9rem;"
                            onmouseover="this.style.transform='translateY(-1px)'"
                            onmouseout="this.style.transform='translateY(0)'">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px;">
                            <circle cx="8" cy="21" r="1"></circle>
                            <circle cx="19" cy="21" r="1"></circle>
                            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57L20.5 9H5.12"></path>
                        </svg>
                        Thêm vào giỏ
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Update pagination
function updatePagination() {
    const pagination = document.getElementById('pagination');
    
    if (!pagination || totalPages <= 1) {
        if (pagination) {
            pagination.innerHTML = '';
        }
        return;
    }
    
    let paginationHTML = '';
    
    // Previous button
    if (currentPage > 1) {
        paginationHTML += `
            <li class="page-item">
                <a class="page-link" href="#" onclick="goToPage(${currentPage - 1})">Trước</a>
            </li>
        `;
    }
    
    // Page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" onclick="goToPage(${i})">${i}</a>
            </li>
        `;
    }
    
    // Next button
    if (currentPage < totalPages) {
        paginationHTML += `
            <li class="page-item">
                <a class="page-link" href="#" onclick="goToPage(${currentPage + 1})">Sau</a>
            </li>
        `;
    }
    
    pagination.innerHTML = paginationHTML;
}

// Go to specific page
function goToPage(page) {
    currentPage = page;
    loadProducts();
    
    // Scroll to top of products section
    const productsSection = document.querySelector('section.py-5');
    if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth' });
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
        btn.classList.remove('active', 'btn-dark');
        btn.classList.add('btn-outline-dark');
    });
    
    activeButton.classList.remove('btn-outline-dark');
    activeButton.classList.add('active', 'btn-dark');
}

// Update clear filters button visibility
function updateClearFiltersButton() {
    const clearBtn = document.getElementById('clearFiltersBtn');
    
    if (!clearBtn) return;
    
    const hasActiveFilters = currentFilters.search || 
                           (currentFilters.category && currentFilters.category !== 'all');
    
    clearBtn.style.display = hasActiveFilters ? 'inline-block' : 'none';
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
        loadingSpinner.style.display = show ? 'block' : 'none';
    }
    
    if (productsGrid) {
        productsGrid.style.display = show ? 'none' : 'flex';
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
