// Admin Products Management Module
// Handles product CRUD operations, table rendering, and pagination

// ===== PRODUCTS VARIABLES =====
let adminProducts = [];
let adminCurrentPage = 1;
let adminTotalPages = 1;
let adminProductsPerPage = 10;
let adminSearchQuery = '';
let adminProductToDelete = null;

// ===== PRODUCTS FUNCTIONS =====
async function loadAdminProducts() {
    const loading = document.getElementById('adminProductsLoading');
    const tableContainer = document.getElementById('adminProductsTableContainer');
    const emptyState = document.getElementById('adminProductsEmptyState');
    
    try {
        // Show loading
        loading.classList.remove('d-none');
        tableContainer.classList.add('d-none');
        emptyState.classList.add('d-none');
        
        // Get ALL products from API
        const response = await apiService.getProducts({ limit: 100 });
        
        adminProducts = response?.data?.products || [];
        
        // Hide loading
        loading.classList.add('d-none');
        
        if (adminProducts.length === 0) {
            emptyState.classList.remove('d-none');
        } else {
            tableContainer.classList.remove('d-none');
            renderAdminProductsTable();
        }
        
    } catch (error) {
        loading.classList.add('d-none');
        showToast('Không thể tải danh sách sản phẩm', 'error');
    }
}

function renderAdminProductsTable() {
    const tbody = document.getElementById('adminProductsTableBody');
    const pagination = document.getElementById('adminProductsPagination');
    
    if (!tbody) return;
    
    // Filter products by search query
    let filteredProducts = adminProducts;
    if (adminSearchQuery) {
        filteredProducts = adminProducts.filter(p => 
            p.name.toLowerCase().includes(adminSearchQuery) ||
            (p.description && p.description.toLowerCase().includes(adminSearchQuery)) ||
            (p.seller_name && p.seller_name.toLowerCase().includes(adminSearchQuery))
        );
    }
    
    // Calculate pagination
    adminTotalPages = Math.ceil(filteredProducts.length / adminProductsPerPage);
    const startIndex = (adminCurrentPage - 1) * adminProductsPerPage;
    const endIndex = startIndex + adminProductsPerPage;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
    
    // Render table rows
    if (paginatedProducts.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-4 text-muted">
                    ${adminSearchQuery ? 'Không tìm thấy sản phẩm phù hợp' : 'Chưa có sản phẩm nào'}
                </td>
            </tr>
        `;
        pagination.classList.add('d-none');
        return;
    }
    
    tbody.innerHTML = paginatedProducts.map((product, index) => {
        const globalIndex = startIndex + index + 1;
        const statusBadge = getProductStatusBadge(product.status || 'available');
        const sellerName = product.seller_name || `User #${product.seller_id || 'N/A'}`;
        
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
                    <small class="text-muted">${sellerName}</small>
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
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="showAdminEditProductModal(${product.id})" title="Chỉnh sửa">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="showAdminDeleteProductModal(${product.id}, '${product.name.replace(/'/g, "\\'")}')  " title="Xóa">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3,6 5,6 21,6"></polyline>
                            <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                        </svg>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    // Setup pagination
    if (adminTotalPages > 1) {
        setupAdminProductsPagination(adminTotalPages);
        pagination.classList.remove('d-none');
    } else {
        pagination.classList.add('d-none');
    }
}

function setupAdminProductsPagination(totalPages) {
    const paginationList = document.getElementById('adminProductsPaginationList');
    if (!paginationList) return;
    
    let paginationHTML = '';
    
    // Previous button
    paginationHTML += `
        <li class="page-item ${adminCurrentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changeAdminPage(${adminCurrentPage - 1}); return false;">Trước</a>
        </li>
    `;
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= adminCurrentPage - 1 && i <= adminCurrentPage + 1)) {
            paginationHTML += `
                <li class="page-item ${i === adminCurrentPage ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="changeAdminPage(${i}); return false;">${i}</a>
                </li>
            `;
        } else if (i === adminCurrentPage - 2 || i === adminCurrentPage + 2) {
            paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
    }
    
    // Next button
    paginationHTML += `
        <li class="page-item ${adminCurrentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changeAdminPage(${adminCurrentPage + 1}); return false;">Sau</a>
        </li>
    `;
    
    paginationList.innerHTML = paginationHTML;
}

window.changeAdminPage = function(page) {
    if (page < 1 || page > adminTotalPages) return;
    adminCurrentPage = page;
    renderAdminProductsTable();
};

window.showAdminAddProductModal = function() {
    // Reset form
    document.getElementById('adminProductForm').reset();
    document.getElementById('adminProductId').value = '';
    document.getElementById('adminProductImagePreviewContainer').style.display = 'none';
    
    // Update modal title
    document.getElementById('adminProductModalTitle').textContent = 'Thêm Sản Phẩm Mới';
    
    // Remove validation classes
    const form = document.getElementById('adminProductForm');
    form.classList.remove('was-validated');
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('adminProductModal'));
    modal.show();
};

window.showAdminEditProductModal = async function(productId) {
    try {
        // Find product in local array
        const product = adminProducts.find(p => p.id === productId);
        
        if (!product) {
            showToast('Không tìm thấy sản phẩm', 'error');
            return;
        }
        
        // Fill form
        document.getElementById('adminProductId').value = product.id;
        document.getElementById('adminProductName').value = product.name;
        document.getElementById('adminProductDescription').value = product.description || '';
        document.getElementById('adminProductPrice').value = product.price;
        document.getElementById('adminProductDiscountPrice').value = product.discount_price || '';
        document.getElementById('adminProductQuantity').value = product.quantity;
        document.getElementById('adminProductImageUrl').value = product.image_url || '';
        document.getElementById('adminProductCategory').value = product.category_id || '';
        document.getElementById('adminProductStatus').value = product.status || 'available';
        
        // Show image preview if has URL
        if (product.image_url) {
            const preview = document.getElementById('adminProductImagePreview');
            preview.src = product.image_url;
            preview.onload = function() {
                document.getElementById('adminProductImagePreviewContainer').style.display = 'block';
            };
        }
        
        // Update modal title
        document.getElementById('adminProductModalTitle').textContent = 'Chỉnh Sửa Sản Phẩm';
        
        // Remove validation classes
        const form = document.getElementById('adminProductForm');
        form.classList.remove('was-validated');
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('adminProductModal'));
        modal.show();
        
    } catch (error) {
        showToast('Không thể tải thông tin sản phẩm', 'error');
    }
};

window.saveAdminProduct = async function(event) {
    const form = document.getElementById('adminProductForm');
    
    // Validate form
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }
    
    try {
        // Get form data
        const productId = document.getElementById('adminProductId').value;
        const productData = {
            name: document.getElementById('adminProductName').value.trim(),
            description: document.getElementById('adminProductDescription').value.trim(),
            price: parseFloat(document.getElementById('adminProductPrice').value),
            discount_price: document.getElementById('adminProductDiscountPrice').value ? parseFloat(document.getElementById('adminProductDiscountPrice').value) : null,
            quantity: parseInt(document.getElementById('adminProductQuantity').value),
            image_url: document.getElementById('adminProductImageUrl').value.trim(),
            category_id: parseInt(document.getElementById('adminProductCategory').value),
            status: document.getElementById('adminProductStatus').value
        };
        
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
        const modal = bootstrap.Modal.getInstance(document.getElementById('adminProductModal'));
        modal.hide();
        
        // Reload products
        await loadAdminProducts();
        
        // Restore button
        saveButton.disabled = false;
        saveButton.innerHTML = originalText;
        
    } catch (error) {
        showToast(error.message || 'Không thể lưu sản phẩm', 'error');
        
        // Restore button
        const saveButton = event.target;
        saveButton.disabled = false;
        saveButton.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="me-1"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>Lưu';
    }
};

window.showAdminDeleteProductModal = function(productId, productName) {
    adminProductToDelete = productId;
    document.getElementById('adminDeleteProductName').textContent = productName;
    
    const modal = new bootstrap.Modal(document.getElementById('adminDeleteProductModal'));
    modal.show();
};

window.confirmAdminDeleteProduct = async function(event) {
    if (!adminProductToDelete) return;
    
    try {
        // Show loading
        const deleteButton = event.target;
        const originalText = deleteButton.innerHTML;
        deleteButton.disabled = true;
        deleteButton.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Đang xóa...';
        
        // Delete product
        await apiService.deleteProduct(adminProductToDelete);
        
        showToast('Xóa sản phẩm thành công', 'success');
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('adminDeleteProductModal'));
        modal.hide();
        
        // Reload products
        await loadAdminProducts();
        
        adminProductToDelete = null;
        
        // Restore button
        deleteButton.disabled = false;
        deleteButton.innerHTML = originalText;
        
    } catch (error) {
        console.error('Error deleting product:', error);
        
        // Show specific error message
        let errorMessage = 'Không thể xóa sản phẩm';
        if (error.message.includes('500')) {
            errorMessage = 'Lỗi server. Sản phẩm có thể đang được sử dụng trong đơn hàng.';
        } else if (error.message.includes('403')) {
            errorMessage = 'Bạn không có quyền xóa sản phẩm này.';
        } else if (error.message.includes('404')) {
            errorMessage = 'Sản phẩm không tồn tại.';
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        showToast(errorMessage, 'error');
        
        // Restore button
        const deleteButton = event.target;
        deleteButton.disabled = false;
        deleteButton.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="me-1"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>Xóa';
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

// Export functions for use in main dashboard
window.loadAdminProducts = loadAdminProducts;
