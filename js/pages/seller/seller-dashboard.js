// Seller Dashboard JavaScript - Complete Management System
// Uses apiService from api-service.js for all API calls

// ===== GLOBAL VARIABLES =====
let myProducts = [];
let myOrders = [];
let revenueChart = null;
let currentSellerId = null;
let currentPage = 1;
let totalPages = 1;
let productsPerPage = 10;
let searchQuery = '';
let productToDelete = null;

// Orders Management
let ordersCurrentPage = 1;
let ordersTotalPages = 1;
let ordersPerPage = 10;
let ordersSearchQuery = '';
let ordersStatusFilter = '';
let orderToUpdate = null;

// Reviews Management
let myReviews = [];
let reviewsCurrentPage = 1;
let reviewsTotalPages = 1;
let reviewsPerPage = 10;
let reviewsSearchQuery = '';
let reviewsRatingFilter = '';
let reviewsProductFilter = '';

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    // Get seller info from token
    initializeSellerInfo();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize tabs
    initializeTabs();
    
    // Load dashboard data
    loadDashboard();
    
    // Load seller products for review filter
    loadSellerProductsForReviewFilter();
});

// ===== SELLER INFO =====
function initializeSellerInfo() {
    try {
        const token = apiService.getToken();
        if (token) {
            const sellerId = apiService.getCurrentUserId();
            currentSellerId = sellerId;
            
            // Get user info from localStorage
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            const sellerName = userInfo.fullName || userInfo.username || 'Người Bán';
            const sellerEmail = userInfo.email || 'seller@ueh.edu.vn';
            
            // Update UI
            document.getElementById('sellerName').textContent = sellerName;
            document.getElementById('sellerEmail').textContent = sellerEmail;
            
            // Update initial
            const initial = sellerName.charAt(0).toUpperCase();
            document.getElementById('userInitial').textContent = initial;
        }
    } catch (error) {
        console.error('Error initializing seller info:', error);
    }
}

// ===== EVENT LISTENERS SETUP =====
function setupEventListeners() {
    // Logout functionality
    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            handleLogout();
        });
    }
    
    // Mobile sidebar toggle
    window.toggleSidebar = function() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.toggle('show');
        }
    };
    
    // Refresh data button
    window.refreshData = function() {
        loadDashboard();
        showToast('Đã làm mới dữ liệu', 'success');
    };
    
    // Product search
    const productSearchInput = document.getElementById('productSearchInput');
    if (productSearchInput) {
        productSearchInput.addEventListener('input', function() {
            searchQuery = this.value.toLowerCase();
            currentPage = 1;
            renderProductsTable();
        });
    }
    
    // Image preview
    const imageUrlInput = document.getElementById('productImageUrl');
    if (imageUrlInput) {
        imageUrlInput.addEventListener('input', function() {
            const url = this.value;
            const preview = document.getElementById('productImagePreview');
            const container = document.getElementById('productImagePreviewContainer');
            
            if (url && url.startsWith('http')) {
                preview.src = url;
                preview.onerror = function() {
                    container.style.display = 'none';
                };
                preview.onload = function() {
                    container.style.display = 'block';
                };
            } else {
                container.style.display = 'none';
            }
        });
    }
    
    // Orders search
    const orderSearchInput = document.getElementById('orderSearchInput');
    if (orderSearchInput) {
        orderSearchInput.addEventListener('input', function() {
            ordersSearchQuery = this.value.toLowerCase();
            ordersCurrentPage = 1;
            renderOrdersTable();
        });
    }
    
    // Orders status filter
    const orderStatusFilter = document.getElementById('orderStatusFilter');
    if (orderStatusFilter) {
        orderStatusFilter.addEventListener('change', function() {
            ordersStatusFilter = this.value;
            ordersCurrentPage = 1;
            renderOrdersTable();
        });
    }
    
    // Reviews search
    const sellerReviewSearchInput = document.getElementById('sellerReviewSearchInput');
    if (sellerReviewSearchInput) {
        sellerReviewSearchInput.addEventListener('input', function() {
            reviewsSearchQuery = this.value.toLowerCase();
            reviewsCurrentPage = 1;
            renderSellerReviewsTable();
        });
    }
    
    // Reviews rating filter
    const sellerReviewRatingFilter = document.getElementById('sellerReviewRatingFilter');
    if (sellerReviewRatingFilter) {
        sellerReviewRatingFilter.addEventListener('change', function() {
            reviewsRatingFilter = this.value;
            reviewsCurrentPage = 1;
            renderSellerReviewsTable();
        });
    }
    
    // Reviews product filter
    const sellerReviewProductFilter = document.getElementById('sellerReviewProductFilter');
    if (sellerReviewProductFilter) {
        sellerReviewProductFilter.addEventListener('change', function() {
            reviewsProductFilter = this.value;
            reviewsCurrentPage = 1;
            renderSellerReviewsTable();
        });
    }
}

// ===== LOGOUT =====
async function handleLogout() {
    try {
        await apiService.logout();
        localStorage.clear();
        window.location.href = '../auth/login.html';
    } catch (error) {
        console.error('Logout error:', error);
        localStorage.clear();
        window.location.href = '../auth/login.html';
    }
}

// ===== TAB MANAGEMENT =====
function initializeTabs() {
    const navLinks = document.querySelectorAll('.nav-link[data-tab]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const tabName = this.getAttribute('data-tab');
            if (tabName) {
                switchTab(tabName);
                
                // Update active nav link
                navLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });
}

function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('[id$="-tab"]').forEach(tab => {
        tab.classList.add('d-none');
    });
    
    // Show selected tab
    const targetTab = document.getElementById(tabName + '-tab');
    if (targetTab) {
        targetTab.classList.remove('d-none');
        
        // Update header title
        const titles = {
            'dashboard': 'Bảng Điều Khiển',
            'stats': 'Thống Kê',
            'products': 'Sản Phẩm Của Tôi',
            'orders': 'Đơn Hàng',
            'reviews': 'Đánh Giá'
        };
        
        const headerTitle = document.querySelector('.header-title');
        if (headerTitle && titles[tabName]) {
            headerTitle.textContent = titles[tabName];
        }
        
        // Load tab content
        switch(tabName) {
            case 'dashboard':
                loadDashboard();
                break;
            case 'products':
                loadMyProducts();
                break;
            case 'orders':
                loadMyOrders();
                break;
            case 'reviews':
                loadMyReviews();
                break;
        }
    }
}

// Make switchTab available globally
window.switchTab = switchTab;

// ===== DASHBOARD FUNCTIONS =====
async function loadDashboard() {
    try {
        showLoading();
        
        // Load stats cards
        await loadSellerStats();
        
        // Load charts
        await loadRevenueChart();
        
        // Load top products
        await loadTopSellingProducts();
        
        // Load recent orders
        await loadRecentOrders();
        
        hideLoading();
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showToast('Không thể tải dữ liệu dashboard', 'error');
        hideLoading();
    }
}

async function loadSellerStats() {
    try {
        // Get products by seller using getProducts API (getProductsBySeller returns 404)
        const productsResponse = await apiService.getProducts({ 
            seller_id: currentSellerId,
            limit: 100 
        });
        
        const products = productsResponse?.data?.products || [];
        const totalProducts = products.length;
        const activeProducts = products.filter(p => p.status === 'available').length;
        
        // Get seller orders to calculate real stats
        const ordersResponse = await apiService.getSellerOrders({ limit: 100 });
        const orders = ordersResponse?.data?.orders || [];
        
        // Calculate real revenue and orders
        let totalRevenue = 0;
        let totalOrders = orders.length;
        let totalSold = 0;
        
        orders.forEach(order => {
            if (order.status === 'delivered') {
                totalRevenue += order.total_amount || 0;
            }
            order.items?.forEach(item => {
                totalSold += item.quantity || 0;
            });
        });
        
        // Calculate average rating from reviews
        let avgRating = 0;
        if (myReviews && myReviews.length > 0) {
            const totalRating = myReviews.reduce((sum, review) => sum + (review.rating || 0), 0);
            avgRating = totalRating / myReviews.length;
        }
        
        // Update cards
        document.getElementById('card_total_revenue').textContent = formatMoney(totalRevenue) + ' ₫';
        document.getElementById('card_total_products').textContent = totalProducts;
        document.getElementById('card_total_orders').textContent = totalOrders;
        document.getElementById('card_avg_rating').textContent = `⭐ ${avgRating.toFixed(1)}`;
        
    } catch (error) {
        console.error('Error loading seller stats:', error);
        // Set default values
        document.getElementById('card_total_revenue').textContent = '0 ₫';
        document.getElementById('card_total_products').textContent = '0';
        document.getElementById('card_total_orders').textContent = '0';
        document.getElementById('card_avg_rating').textContent = '⭐ 0.0';
    }
}

async function loadRevenueChart() {
    try {
        // Get seller orders to calculate real revenue data
        const ordersResponse = await apiService.getSellerOrders({ limit: 100 });
        const orders = ordersResponse?.data?.orders || [];
        
        // Group orders by date for last 30 days
        const labels = [];
        const data = [];
        
        // Generate last 30 days
        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            labels.push(date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }));
            
            // Calculate revenue for this date
            const dayRevenue = orders
                .filter(order => order.created_at?.startsWith(dateStr) && order.status === 'delivered')
                .reduce((sum, order) => sum + (order.total_amount || 0), 0);
            
            data.push(dayRevenue);
        }
        
        updateRevenueChart(labels, data);
    } catch (error) {
        console.error('Error loading revenue chart:', error);
        // Fallback to sample data
        const labels = [];
        const data = [];
        
        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }));
            data.push(0);
        }
        
        updateRevenueChart(labels, data);
    }
}

function updateRevenueChart(labels, data) {
    const ctx = document.getElementById('revenueChart');
    if (ctx) {
        if (!revenueChart) {
        revenueChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Doanh Thu (₫)',
                    data: data,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return 'Doanh thu: ' + formatMoney(context.parsed.y) + ' ₫';
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return formatMoney(value) + ' ₫';
                            }
                        }
                    }
                }
            }
        });
        } else {
            revenueChart.data.labels = labels;
            revenueChart.data.datasets[0].data = data;
            revenueChart.update();
        }
    }
}

async function loadTopSellingProducts() {
    const container = document.getElementById('topProductsList');
    
    try {
        // Get seller's products using getProducts API (getProductsBySeller returns 404)
        const response = await apiService.getProducts({ 
            seller_id: currentSellerId,
            limit: 5
        });
        
        const products = response?.data?.products || [];
        
        if (products.length === 0) {
            container.innerHTML = '<div class="list-group-item border-0 py-3 text-center text-muted">Chưa có sản phẩm nào</div>';
            return;
        }
        
        container.innerHTML = products.map((product, index) => `
            <div class="list-group-item">
                <div class="product-item">
                    <img src="${product.image_url || '../../assets/images/products/demo.png'}" 
                         alt="${product.name}" 
                         class="rounded">
                    <div class="product-info">
                        <div class="product-name">${product.name}</div>
                        <div class="product-stats">
                            ${formatMoney(product.price)} ₫
                            ${product.discount_price ? ` • <span class="text-success">${formatMoney(product.discount_price)} ₫</span>` : ''}
                        </div>
                    </div>
                    <div class="badge bg-primary">#${index + 1}</div>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading top products:', error);
        container.innerHTML = '<div class="list-group-item border-0 py-3 text-center text-danger">Không thể tải dữ liệu</div>';
    }
}

async function loadRecentOrders() {
    const tbody = document.querySelector('#recentOrdersTable tbody');
    
    try {
        // Note: API doesn't have a seller-specific orders endpoint yet
        // You should create one in the backend
        // For now, we'll show a message
        
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-muted">
                    Chưa có đơn hàng nào
                </td>
            </tr>
        `;
        
    } catch (error) {
        console.error('Error loading recent orders:', error);
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-danger">
                    Không thể tải dữ liệu đơn hàng
                </td>
            </tr>
        `;
    }
}

// ===== TAB CONTENT LOADERS =====
async function loadMyProducts() {
    const loading = document.getElementById('productsLoading');
    const tableContainer = document.getElementById('productsTableContainer');
    const emptyState = document.getElementById('productsEmptyState');
    
    try {
        // Show loading
        loading.classList.remove('d-none');
        tableContainer.classList.add('d-none');
        emptyState.classList.add('d-none');
        
        // Get seller's products using getProducts API (getProductsBySeller returns 404)
        const response = await apiService.getProducts({ 
            seller_id: currentSellerId,
            limit: 100 
        });
        
        myProducts = response?.data?.products || [];
        
        // Hide loading
        loading.classList.add('d-none');
        
        if (myProducts.length === 0) {
            emptyState.classList.remove('d-none');
        } else {
            tableContainer.classList.remove('d-none');
            renderProductsTable();
        }
        
    } catch (error) {
        console.error('Error loading products:', error);
        loading.classList.add('d-none');
        showToast('Không thể tải danh sách sản phẩm', 'error');
    }
}

async function loadMyReviews() {
    await loadSellerReviews();
}

// ===== PRODUCT MANAGEMENT FUNCTIONS =====
function renderProductsTable() {
    const tbody = document.getElementById('productsTableBody');
    const pagination = document.getElementById('productsPagination');
    
    if (!tbody) return;
    
    // Filter products by search query
    let filteredProducts = myProducts;
    if (searchQuery) {
        filteredProducts = myProducts.filter(p => 
            p.name.toLowerCase().includes(searchQuery) ||
            (p.description && p.description.toLowerCase().includes(searchQuery))
        );
    }
    
    // Calculate pagination
    totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
    
    // Render table rows
    if (paginatedProducts.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4 text-muted">
                    ${searchQuery ? 'Không tìm thấy sản phẩm phù hợp' : 'Chưa có sản phẩm nào'}
                </td>
            </tr>
        `;
        pagination.classList.add('d-none');
        return;
    }
    
    tbody.innerHTML = paginatedProducts.map((product, index) => {
        const globalIndex = startIndex + index + 1;
        const statusBadge = getProductStatusBadge(product.status || 'available');
        
        return `
            <tr>
                <td>${globalIndex}</td>
                <td>
                    <img src="${product.image_url || '../../assets/images/products/demo.png'}" 
                         alt="${product.name}" 
                         class="rounded"
                         style="width: 50px; height: 50px; object-fit: cover;"
                         onerror="this.src='../../assets/images/products/demo.png'">
                </td>
                <td>
                    <div class="fw-semibold">${product.name}</div>
                    ${product.description ? `<small class="text-muted">${product.description.substring(0, 50)}${product.description.length > 50 ? '...' : ''}</small>` : ''}
                </td>
                <td>
                    <div class="fw-semibold">${formatMoney(product.price)} ₫</div>
                    ${product.discount_price ? `<small class="text-success">${formatMoney(product.discount_price)} ₫</small>` : ''}
                </td>
                <td>
                    <span class="badge ${product.quantity > 0 ? 'bg-success' : 'bg-danger'}">${product.quantity}</span>
                </td>
                <td>${statusBadge}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="showEditProductModal(${product.id})" title="Chỉnh sửa">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="showDeleteProductModal(${product.id}, '${product.name.replace(/'/g, "\\'")}')  " title="Xóa">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    // Setup pagination
    if (totalPages > 1) {
        setupProductsPagination(totalPages);
        pagination.classList.remove('d-none');
    } else {
        pagination.classList.add('d-none');
    }
}

function setupProductsPagination(totalPages) {
    const paginationList = document.getElementById('productsPaginationList');
    if (!paginationList) return;
    
    let paginationHTML = '';
    
    // Previous button
    paginationHTML += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${currentPage - 1}); return false;">Trước</a>
        </li>
    `;
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            paginationHTML += `
                <li class="page-item ${i === currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="changePage(${i}); return false;">${i}</a>
                </li>
            `;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
    }
    
    // Next button
    paginationHTML += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${currentPage + 1}); return false;">Sau</a>
        </li>
    `;
    
    paginationList.innerHTML = paginationHTML;
}

window.changePage = function(page) {
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    renderProductsTable();
};

window.showAddProductModal = function() {
    // Reset form
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('productImagePreviewContainer').style.display = 'none';
    document.getElementById('editProductStatus').style.display = 'none';
    
    // Update modal title
    document.getElementById('productModalTitle').textContent = 'Thêm Sản Phẩm Mới';
    
    // Remove validation classes
    const form = document.getElementById('productForm');
    form.classList.remove('was-validated');
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('productModal'));
    modal.show();
};

window.showEditProductModal = async function(productId) {
    try {
        // Find product in local array
        const product = myProducts.find(p => p.id === productId);
        
        if (!product) {
            showToast('Không tìm thấy sản phẩm', 'error');
            return;
        }
        
        // Fill form
        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productDescription').value = product.description || '';
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productDiscountPrice').value = product.discount_price || '';
        document.getElementById('productQuantity').value = product.quantity;
        document.getElementById('productImageUrl').value = product.image_url || '';
        document.getElementById('productCategory').value = product.category_id || '';
        document.getElementById('productStatus').value = product.status || 'available';
        
        // Show status field for edit
        document.getElementById('editProductStatus').style.display = 'block';
        
        // Show image preview if has URL
        if (product.image_url) {
            const preview = document.getElementById('productImagePreview');
            preview.src = product.image_url;
            preview.onload = function() {
                document.getElementById('productImagePreviewContainer').style.display = 'block';
            };
        }
        
        // Update modal title
        document.getElementById('productModalTitle').textContent = 'Chỉnh Sửa Sản Phẩm';
        
        // Remove validation classes
        const form = document.getElementById('productForm');
        form.classList.remove('was-validated');
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('productModal'));
        modal.show();
        
    } catch (error) {
        console.error('Error showing edit modal:', error);
        showToast('Không thể tải thông tin sản phẩm', 'error');
    }
};

window.saveProduct = async function() {
    const form = document.getElementById('productForm');
    
    // Validate form
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }
    
    try {
        // Get form data
        const productId = document.getElementById('productId').value;
        const productData = {
            name: document.getElementById('productName').value.trim(),
            description: document.getElementById('productDescription').value.trim(),
            price: parseFloat(document.getElementById('productPrice').value),
            discount_price: document.getElementById('productDiscountPrice').value ? parseFloat(document.getElementById('productDiscountPrice').value) : null,
            quantity: parseInt(document.getElementById('productQuantity').value),
            image_url: document.getElementById('productImageUrl').value.trim(),
            category_id: parseInt(document.getElementById('productCategory').value)
        };
        
        // Add status if editing
        if (productId) {
            productData.status = document.getElementById('productStatus').value;
        }
        
        // Show loading
        const saveButton = event.target;
        const originalText = saveButton.innerHTML;
        saveButton.disabled = true;
        saveButton.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Đang lưu...';
        
        let response;
        if (productId) {
            // Update existing product
            response = await apiService.updateProduct(productId, productData);
            showToast('Cập nhật sản phẩm thành công', 'success');
        } else {
            // Create new product
            response = await apiService.createProduct(productData);
            showToast('Thêm sản phẩm thành công', 'success');
        }
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('productModal'));
        modal.hide();
        
        // Reload products
        await loadMyProducts();
        
        // Restore button
        saveButton.disabled = false;
        saveButton.innerHTML = originalText;
        
    } catch (error) {
        console.error('Error saving product:', error);
        showToast(error.message || 'Không thể lưu sản phẩm', 'error');
        
        // Restore button
        const saveButton = event.target;
        saveButton.disabled = false;
        saveButton.innerHTML = originalText;
    }
};

window.showDeleteProductModal = function(productId, productName) {
    productToDelete = productId;
    document.getElementById('deleteProductName').textContent = productName;
    
    const modal = new bootstrap.Modal(document.getElementById('deleteProductModal'));
    modal.show();
};

window.confirmDeleteProduct = async function() {
    if (!productToDelete) return;
    
    try {
        // Show loading
        const deleteButton = event.target;
        const originalText = deleteButton.innerHTML;
        deleteButton.disabled = true;
        deleteButton.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Đang xóa...';
        
        // Delete product
        await apiService.deleteProduct(productToDelete);
        
        showToast('Xóa sản phẩm thành công', 'success');
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteProductModal'));
        modal.hide();
        
        // Reload products
        await loadMyProducts();
        
        productToDelete = null;
        
        // Restore button
        deleteButton.disabled = false;
        deleteButton.innerHTML = originalText;
        
    } catch (error) {
        console.error('Error deleting product:', error);
        showToast(error.message || 'Không thể xóa sản phẩm', 'error');
        
        // Restore button
        const deleteButton = event.target;
        deleteButton.disabled = false;
        deleteButton.innerHTML = originalText;
    }
};

function getProductStatusBadge(status) {
    const statusMap = {
        'available': { text: 'Còn hàng', class: 'bg-success' },
        'out_of_stock': { text: 'Hết hàng', class: 'bg-danger' },
        'discontinued': { text: 'Ngừng KD', class: 'bg-secondary' }
    };
    
    const statusInfo = statusMap[status] || statusMap['available'];
    return `<span class="badge ${statusInfo.class}">${statusInfo.text}</span>`;
}

// ===== ORDERS MANAGEMENT =====
async function loadMyOrders() {
    const loading = document.getElementById('ordersLoading');
    const tableContainer = document.getElementById('ordersTableContainer');
    const emptyState = document.getElementById('ordersEmptyState');
    
    try {
        // Show loading
        loading.classList.remove('d-none');
        tableContainer.classList.add('d-none');
        emptyState.classList.add('d-none');
        
        // Get seller orders from API
        const queryParams = {
            page: ordersCurrentPage,
            limit: ordersPerPage
        };
        
        // Only add status filter if it has a value
        if (ordersStatusFilter && ordersStatusFilter.trim() !== '') {
            queryParams.status = ordersStatusFilter;
        }
        
        const response = await apiService.getSellerOrders(queryParams);
        
        myOrders = response?.data?.orders || [];
        
        // Update pagination info
        if (response?.data?.pagination) {
            ordersTotalPages = response.data.pagination.total_pages || 1;
            ordersCurrentPage = response.data.pagination.current_page || 1;
        }
        
        // Hide loading
        loading.classList.add('d-none');
        
        if (myOrders.length === 0) {
            emptyState.classList.remove('d-none');
        } else {
            tableContainer.classList.remove('d-none');
            renderOrdersTable();
        }
        
    } catch (error) {
        console.error('Error loading orders:', error);
        loading.classList.add('d-none');
        showToast('Không thể tải danh sách đơn hàng', 'error');
    }
}

function renderOrdersTable() {
    const tbody = document.getElementById('ordersTableBody');
    const pagination = document.getElementById('ordersPagination');
    
    if (!tbody) return;
    
    // Render table rows (no client-side filtering for server-side pagination)
    if (myOrders.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4 text-muted">
                    ${ordersSearchQuery || ordersStatusFilter ? 'Không tìm thấy đơn hàng phù hợp' : 'Chưa có đơn hàng nào'}
                </td>
            </tr>
        `;
        pagination.classList.add('d-none');
        return;
    }
    
    tbody.innerHTML = myOrders.map((order, index) => {
        const globalIndex = (ordersCurrentPage - 1) * ordersPerPage + index + 1;
        const statusBadge = getOrderStatusBadge(order.status);
        const customerName = `User #${order.user_id || 'N/A'}`;
        
        return `
            <tr>
                <td>${globalIndex}</td>
                <td><strong>#${order.id}</strong></td>
                <td>
                    <div class="fw-semibold">${customerName}</div>
                    <small class="text-muted">-</small>
                </td>
                <td>
                    <div class="fw-semibold">${formatMoney(order.total_amount)} ₫</div>
                </td>
                <td>${statusBadge}</td>
                <td>
                    <small class="text-muted">${formatDate(order.created_at)}</small>
                </td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-info me-1" onclick="showOrderDetail(${order.id})" title="Xem chi tiết">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    </button>
                    ${canUpdateOrderStatus(order.status) ? `
                        <button class="btn btn-sm btn-outline-warning" onclick="showUpdateOrderStatusModal(${order.id}, '${order.status}')" title="Cập nhật trạng thái">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                    ` : ''}
                </td>
            </tr>
        `;
    }).join('');
    
    // Setup pagination
    if (ordersTotalPages > 1) {
        setupOrdersPagination(ordersTotalPages);
        pagination.classList.remove('d-none');
    } else {
        pagination.classList.add('d-none');
    }
}

function setupOrdersPagination(totalPages) {
    const paginationList = document.getElementById('ordersPaginationList');
    if (!paginationList) return;
    
    let paginationHTML = '';
    
    // Previous button
    paginationHTML += `
        <li class="page-item ${ordersCurrentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changeOrdersPage(${ordersCurrentPage - 1}); return false;">Trước</a>
        </li>
    `;
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= ordersCurrentPage - 1 && i <= ordersCurrentPage + 1)) {
            paginationHTML += `
                <li class="page-item ${i === ordersCurrentPage ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="changeOrdersPage(${i}); return false;">${i}</a>
                </li>
            `;
        } else if (i === ordersCurrentPage - 2 || i === ordersCurrentPage + 2) {
            paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
    }
    
    // Next button
    paginationHTML += `
        <li class="page-item ${ordersCurrentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changeOrdersPage(${ordersCurrentPage + 1}); return false;">Sau</a>
        </li>
    `;
    
    paginationList.innerHTML = paginationHTML;
}

window.changeOrdersPage = function(page) {
    if (page < 1 || page > ordersTotalPages) return;
    ordersCurrentPage = page;
    loadMyOrders();
};

window.showOrderDetail = async function(orderId) {
    try {
        // Get order details from API
        const response = await apiService.getOrderDetail(orderId);
        const order = response.data;
        
        // Enrich order detail with user info
        await enrichOrderDetailWithUserInfo(order);
        
        // Fill order info
        document.getElementById('orderDetailId').textContent = `#${order.id}`;
        document.getElementById('orderDetailStatus').innerHTML = getOrderStatusBadge(order.status);
        document.getElementById('orderDetailDate').textContent = formatDate(order.created_at);
        document.getElementById('orderDetailCustomer').textContent = order.customer_name || `User #${order.user_id}`;
        document.getElementById('orderDetailEmail').textContent = order.customer_email || '-';
        document.getElementById('orderDetailPhone').textContent = order.customer_phone || '-';
        document.getElementById('orderDetailTotal').textContent = `${formatMoney(order.total_amount)} ₫`;
        
        // Fill order items
        const itemsTbody = document.getElementById('orderItemsTableBody');
        itemsTbody.innerHTML = order.items.map(item => `
            <tr>
                <td>
                    <div class="d-flex align-items-center">
                        <img src="${item.product_image || '../../assets/images/products/demo.png'}" 
                             alt="${item.product_name}" 
                             class="rounded me-2"
                             style="width: 40px; height: 40px; object-fit: cover;"
                             onerror="this.src='../../assets/images/products/demo.png'">
                        <div>
                            <div class="fw-semibold">${item.product_name}</div>
                            <small class="text-muted">${item.product_description || ''}</small>
                        </div>
                    </div>
                </td>
                <td>${item.quantity}</td>
                <td>${formatMoney(item.price)} ₫</td>
                <td>${formatMoney(item.price * item.quantity)} ₫</td>
            </tr>
        `).join('');
        
        // Setup status actions
        const statusActions = document.getElementById('orderStatusActions');
        if (canUpdateOrderStatus(order.status)) {
            statusActions.innerHTML = `
                <button class="btn btn-warning" onclick="showUpdateOrderStatusModal(${order.id}, '${order.status}')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="me-1">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    Cập Nhật Trạng Thái
                </button>
            `;
        } else {
            statusActions.innerHTML = '';
        }
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('orderDetailModal'));
        modal.show();
        
    } catch (error) {
        console.error('Error loading order details:', error);
        showToast('Không thể tải chi tiết đơn hàng', 'error');
    }
};

window.showUpdateOrderStatusModal = function(orderId, currentStatus) {
    orderToUpdate = orderId;
    
    // Set current order ID
    document.getElementById('updateOrderId').textContent = `#${orderId}`;
    
    // Set current status in select
    const statusSelect = document.getElementById('newOrderStatus');
    statusSelect.value = currentStatus;
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('updateOrderStatusModal'));
    modal.show();
};

window.confirmUpdateOrderStatus = async function() {
    if (!orderToUpdate) return;
    
    try {
        const newStatus = document.getElementById('newOrderStatus').value;
        
        // Show loading
        const updateButton = event.target;
        const originalText = updateButton.innerHTML;
        updateButton.disabled = true;
        updateButton.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Đang cập nhật...';
        
        // Update order status
        await apiService.updateOrderStatus(orderToUpdate, newStatus);
        
        showToast('Cập nhật trạng thái đơn hàng thành công', 'success');
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('updateOrderStatusModal'));
        modal.hide();
        
        // Reload orders
        await loadMyOrders();
        
        orderToUpdate = null;
        
        // Restore button
        updateButton.disabled = false;
        updateButton.innerHTML = originalText;
        
    } catch (error) {
        console.error('Error updating order status:', error);
        showToast(error.message || 'Không thể cập nhật trạng thái đơn hàng', 'error');
        
        // Restore button
        const updateButton = event.target;
        updateButton.disabled = false;
        updateButton.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="me-1"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>Cập Nhật';
    }
};

function getOrderStatusBadge(status) {
    const statusMap = {
        'pending': { text: 'Chờ xử lý', class: 'bg-warning' },
        'processing': { text: 'Đang xử lý', class: 'bg-info' },
        'shipped': { text: 'Đã gửi', class: 'bg-primary' },
        'delivered': { text: 'Đã giao', class: 'bg-success' },
        'cancelled': { text: 'Đã hủy', class: 'bg-danger' }
    };
    
    const statusInfo = statusMap[status] || statusMap['pending'];
    return `<span class="badge ${statusInfo.class}">${statusInfo.text}</span>`;
}

function canUpdateOrderStatus(currentStatus) {
    // Seller can update status for orders that are not delivered or cancelled
    return !['delivered', 'cancelled'].includes(currentStatus);
}

// ===== UTILITY FUNCTIONS =====

// Enrich single order detail with user info
async function enrichOrderDetailWithUserInfo(order) {
    try {
        // Get user info
        if (order.user_id) {
            const userResponse = await apiService.getUserById(order.user_id);
            if (userResponse?.data) {
                order.customer_name = userResponse.data.username || userResponse.data.fullName;
                order.customer_email = userResponse.data.email;
                order.customer_phone = userResponse.data.phone;
            }
        }
    } catch (error) {
        console.warn(`Failed to get user info for order detail ${order.id}:`, error);
    }
}

function formatMoney(amount) {
    const num = Number(amount ?? 0);
    return num.toLocaleString('vi-VN', { maximumFractionDigits: 0 });
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getStatusBadge(status) {
    const statusMap = {
        'pending': 'Chờ xử lý',
        'processing': 'Đang xử lý',
        'shipped': 'Đã gửi',
        'delivered': 'Đã giao',
        'cancelled': 'Đã hủy'
    };
    
    return `<span class="badge status-${status}">${statusMap[status] || status}</span>`;
}

function showLoading() {
    // Show loading state if needed
    document.body.classList.add('loading');
}

function hideLoading() {
    document.body.classList.remove('loading');
}

function showToast(message, type = 'info') {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
        toastContainer.style.zIndex = '1080';
        document.body.appendChild(toastContainer);
    }
    
    const toastId = 'toast-' + Date.now();
    const toastColors = {
        'success': '#10b981',
        'error': '#ef4444',
        'warning': '#f59e0b',
        'info': '#3b82f6'
    };
    
    const toastHTML = `
        <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header">
                <div class="rounded me-2" style="width: 12px; height: 12px; background-color: ${toastColors[type] || toastColors.info};"></div>
                <strong class="me-auto">Thông Báo</strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        </div>
    `;
    
    toastContainer.insertAdjacentHTML('beforeend', toastHTML);
    
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
    
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}

// ===== EXPORT FUNCTIONS =====
window.sellerDashboard = {
    loadDashboard,
    loadMyProducts,
    loadMyOrders,
    loadMyReviews,
    refreshData: loadDashboard
};

// ===== SELLER REVIEWS MANAGEMENT =====
async function loadSellerReviews() {
    const loading = document.getElementById('sellerReviewsLoading');
    const tableContainer = document.getElementById('sellerReviewsTableContainer');
    const emptyState = document.getElementById('sellerReviewsEmptyState');
    
    try {
        // Show loading
        loading.classList.remove('d-none');
        tableContainer.classList.add('d-none');
        emptyState.classList.add('d-none');
        
        // Get reviews for seller's products
        const queryParams = {
            page: reviewsCurrentPage,
            limit: reviewsPerPage
        };
        
        const response = await apiService.getReviews(queryParams);
        
        // Filter reviews to only show reviews for seller's products
        const allReviews = response?.data?.reviews || [];
        const sellerProductIds = myProducts.map(product => product.id);
        myReviews = allReviews.filter(review => sellerProductIds.includes(review.product_id));
        
        if (response?.data?.pagination) {
            reviewsTotalPages = response.data.pagination.totalPages || 1;
            reviewsCurrentPage = response.data.pagination.currentPage || 1;
        }
        
        // Hide loading
        loading.classList.add('d-none');
        
        if (myReviews.length === 0) {
            emptyState.classList.remove('d-none');
        } else {
            tableContainer.classList.remove('d-none');
            renderSellerReviewsTable();
        }
        
    } catch (error) {
        console.error('Error loading seller reviews:', error);
        loading.classList.add('d-none');
        showToast('Không thể tải danh sách đánh giá', 'error');
    }
}

function renderSellerReviewsTable() {
    const tbody = document.getElementById('sellerReviewsTableBody');
    const pagination = document.getElementById('sellerReviewsPagination');
    
    if (!tbody) return;
    
    // Filter reviews by search query, rating, and product
    let filteredReviews = myReviews;
    
    // Filter by search query
    if (reviewsSearchQuery) {
        filteredReviews = filteredReviews.filter(review => 
            (review.comment && review.comment.toLowerCase().includes(reviewsSearchQuery)) ||
            (review.username && review.username.toLowerCase().includes(reviewsSearchQuery)) ||
            (review.product_name && review.product_name.toLowerCase().includes(reviewsSearchQuery))
        );
    }
    
    // Filter by rating
    if (reviewsRatingFilter && reviewsRatingFilter.trim() !== '') {
        filteredReviews = filteredReviews.filter(review => review.rating == reviewsRatingFilter);
    }
    
    // Filter by product
    if (reviewsProductFilter && reviewsProductFilter.trim() !== '') {
        filteredReviews = filteredReviews.filter(review => review.product_id == reviewsProductFilter);
    }
    
    // Render table rows
    if (filteredReviews.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4 text-muted">
                    ${reviewsSearchQuery || reviewsRatingFilter || reviewsProductFilter ? 'Không tìm thấy đánh giá phù hợp' : 'Chưa có đánh giá nào cho sản phẩm của bạn'}
                </td>
            </tr>
        `;
        pagination.classList.add('d-none');
        return;
    }
    
    tbody.innerHTML = filteredReviews.map((review, index) => {
        const globalIndex = (reviewsCurrentPage - 1) * reviewsPerPage + index + 1;
        const ratingStars = getSellerRatingStars(review.rating);
        
        return `
            <tr>
                <td>${globalIndex}</td>
                <td>
                    <div class="fw-semibold">${review.product_name || 'N/A'}</div>
                    <small class="text-muted">ID: ${review.product_id}</small>
                </td>
                <td>
                    <div class="fw-semibold">${review.username || 'N/A'}</div>
                    <small class="text-muted">${review.user_full_name || '-'}</small>
                </td>
                <td>${ratingStars}</td>
                <td>
                    <div class="text-truncate" style="max-width: 200px;" title="${review.comment || ''}">
                        ${review.comment || '-'}
                    </div>
                </td>
                <td>
                    <small class="text-muted">${formatDate(review.created_at)}</small>
                </td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-primary" onclick="showSellerReviewDetail(${review.id})" title="Xem chi tiết">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    if (reviewsTotalPages > 1) {
        setupSellerReviewsPagination(reviewsTotalPages);
        pagination.classList.remove('d-none');
    } else {
        pagination.classList.add('d-none');
    }
}

function setupSellerReviewsPagination(totalPages) {
    const paginationList = document.getElementById('sellerReviewsPaginationList');
    if (!paginationList) return;
    
    let paginationHTML = '';
    
    // Previous button
    if (reviewsCurrentPage > 1) {
        paginationHTML += `
            <li class="page-item">
                <a class="page-link" href="#" onclick="changeSellerReviewsPage(${reviewsCurrentPage - 1})">Trước</a>
            </li>
        `;
    }
    
    // Page numbers
    const startPage = Math.max(1, reviewsCurrentPage - 2);
    const endPage = Math.min(totalPages, reviewsCurrentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <li class="page-item ${i === reviewsCurrentPage ? 'active' : ''}">
                <a class="page-link" href="#" onclick="changeSellerReviewsPage(${i})">${i}</a>
            </li>
        `;
    }
    
    // Next button
    if (reviewsCurrentPage < totalPages) {
        paginationHTML += `
            <li class="page-item">
                <a class="page-link" href="#" onclick="changeSellerReviewsPage(${reviewsCurrentPage + 1})">Sau</a>
            </li>
        `;
    }
    
    paginationList.innerHTML = paginationHTML;
}

window.changeSellerReviewsPage = function(page) {
    if (page < 1 || page > reviewsTotalPages) return;
    reviewsCurrentPage = page;
    loadSellerReviews();
};

window.showSellerReviewDetail = async function(reviewId) {
    try {
        const response = await apiService.getReviewDetail(reviewId);
        const review = response.data;
        
        // Fill modal with review data
        document.getElementById('sellerReviewProductName').textContent = review.product_name || 'N/A';
        document.getElementById('sellerReviewProductPrice').textContent = review.product_price ? formatMoney(review.product_price) + ' ₫' : '-';
        
        document.getElementById('sellerReviewUserName').textContent = review.username || 'N/A';
        document.getElementById('sellerReviewUserEmail').textContent = review.user_email || '-';
        document.getElementById('sellerReviewUserAvatar').src = review.user_avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjUiIGN5PSIyNSIgcj0iMjUiIGZpbGw9IiNmOGY5ZmEiLz4KPHBhdGggZD0iTTI1IDEzQzI4LjMxMzcgMTMgMzEgMTUuNjg2MyAzMSAxOUMyMSAyMi4zMTM3IDI4LjMxMzcgMjUgMjUgMjVDMjEuNjg2MyAyNSAxOSAyMi4zMTM3IDE5IDE5QzE5IDE1LjY4NjMgMjEuNjg2MyAxMyAyNSAxM1oiIGZpbGw9IiM5Y2EzYWYiLz4KPHBhdGggZD0iTTE1IDM4QzE1IDM0LjY4NjMgMTguNjg2MyAzMSAyMiAzMUMyNS4zMTM3IDMxIDI5IDM0LjY4NjMgMjkgMzhWMzBIMTVWMzhaIiBmaWxsPSIjOWNhM2FmIi8+Cjwvc3ZnPgo=';
        
        document.getElementById('sellerReviewRating').innerHTML = getSellerRatingStars(review.rating);
        document.getElementById('sellerReviewCreatedAt').textContent = formatDate(review.created_at);
        document.getElementById('sellerReviewComment').textContent = review.comment || 'Không có nội dung';
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('sellerReviewDetailModal'));
        modal.show();
        
    } catch (error) {
        console.error('Error loading seller review detail:', error);
        showToast('Không thể tải chi tiết đánh giá', 'error');
    }
};

function getSellerRatingStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let starsHTML = '';
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
        starsHTML += '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" class="text-warning me-1"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon></svg>';
    }
    
    // Half star
    if (hasHalfStar) {
        starsHTML += '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" class="text-warning me-1"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon></svg>';
    }
    
    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
        starsHTML += '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-warning me-1"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon></svg>';
    }
    
    return starsHTML;
}

// Load products for seller review filter dropdown
async function loadSellerProductsForReviewFilter() {
    try {
        const sellerProductIds = myProducts.map(product => product.id);
        
        const productFilter = document.getElementById('sellerReviewProductFilter');
        if (productFilter) {
            // Clear existing options except first one
            productFilter.innerHTML = '<option value="">Tất cả sản phẩm</option>';
            
            // Add seller's product options
            myProducts.forEach(product => {
                const option = document.createElement('option');
                option.value = product.id;
                option.textContent = product.name;
                productFilter.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading seller products for filter:', error);
    }
}

