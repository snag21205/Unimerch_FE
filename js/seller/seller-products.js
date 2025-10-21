// Seller Products Management Module
// Handles product CRUD operations, table rendering, and pagination

// ===== PRODUCTS VARIABLES =====
let sellerProducts = [];
let sellerCurrentPage = 1;
let sellerTotalPages = 1;
let sellerProductsPerPage = 10;
let sellerSearchQuery = '';
let sellerProductToDelete = null;

// ===== PRODUCTS FUNCTIONS =====
async function loadMyProducts() {
    const loading = document.getElementById('productsLoading');
    const tableContainer = document.getElementById('productsTableContainer');
    const emptyState = document.getElementById('productsEmptyState');
    
    try {
        // Show loading
        loading.classList.remove('d-none');
        tableContainer.classList.add('d-none');
        emptyState.classList.add('d-none');
        
        // Get products for current seller
        const sellerId = window.currentSellerId;
        if (!sellerId) {
            console.warn('Seller ID not available yet, retrying...');
            setTimeout(() => loadMyProducts(), 200);
            return;
        }
        
        console.log('Loading products for seller ID:', sellerId);
        
        // Get ALL products from API with seller_id filter
        const response = await apiService.getProducts({ 
            seller_id: sellerId, 
            limit: 100 
        });
        
        console.log('Products response:', response);
        
        sellerProducts = response?.data?.products || [];
        
        console.log('Products loaded:', sellerProducts.length);
        
        // Hide loading
        loading.classList.add('d-none');
        
        if (sellerProducts.length === 0) {
            emptyState.classList.remove('d-none');
        } else {
            tableContainer.classList.remove('d-none');
            renderSellerProductsTable();
        }
        
    } catch (error) {
        loading.classList.add('d-none');
        showToast('Không thể tải danh sách sản phẩm', 'error');
    }
}

function renderSellerProductsTable() {
    const tbody = document.getElementById('productsTableBody');
    const pagination = document.getElementById('productsPagination');
    
    if (!tbody) return;
    
    // Filter products by search query
    let filteredProducts = sellerProducts;
    if (sellerSearchQuery) {
        filteredProducts = sellerProducts.filter(p => 
            p.name.toLowerCase().includes(sellerSearchQuery) ||
            (p.description && p.description.toLowerCase().includes(sellerSearchQuery))
        );
    }
    
    // Calculate pagination
    sellerTotalPages = Math.ceil(filteredProducts.length / sellerProductsPerPage);
    const startIndex = (sellerCurrentPage - 1) * sellerProductsPerPage;
    const endIndex = startIndex + sellerProductsPerPage;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
    
    // Render table rows
    if (paginatedProducts.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4 text-muted">
                    ${sellerSearchQuery ? 'Không tìm thấy sản phẩm phù hợp' : 'Chưa có sản phẩm nào'}
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
                    <button class="btn btn-sm btn-outline-danger" onclick="showDeleteProductModal(${product.id}, '${product.name.replace(/'/g, "\\'")}')" title="Xóa">
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
    if (sellerTotalPages > 1) {
        setupSellerProductsPagination(sellerTotalPages);
        pagination.classList.remove('d-none');
    } else {
        pagination.classList.add('d-none');
    }
}

function setupSellerProductsPagination(totalPages) {
    const paginationList = document.getElementById('sellerProductsPaginationList');
    if (!paginationList) return;
    
    let paginationHTML = '';
    
    // Previous button
    paginationHTML += `
        <li class="page-item ${sellerCurrentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changeSellerPage(${sellerCurrentPage - 1}); return false;">Trước</a>
        </li>
    `;
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= sellerCurrentPage - 1 && i <= sellerCurrentPage + 1)) {
            paginationHTML += `
                <li class="page-item ${i === sellerCurrentPage ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="changeSellerPage(${i}); return false;">${i}</a>
                </li>
            `;
        } else if (i === sellerCurrentPage - 2 || i === sellerCurrentPage + 2) {
            paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
    }
    
    // Next button
    paginationHTML += `
        <li class="page-item ${sellerCurrentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changeSellerPage(${sellerCurrentPage + 1}); return false;">Sau</a>
        </li>
    `;
    
    paginationList.innerHTML = paginationHTML;
}

window.changeSellerPage = function(page) {
    if (page < 1 || page > sellerTotalPages) return;
    sellerCurrentPage = page;
    renderSellerProductsTable();
};

window.showAddProductModal = function() {
    // Reset form
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('productImagePreviewContainer').style.display = 'none';
    
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
        const product = sellerProducts.find(p => p.id === productId);
        
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
        showToast('Không thể tải thông tin sản phẩm', 'error');
    }
};

window.saveProduct = async function(event) {
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
            category_id: parseInt(document.getElementById('productCategory').value),
            status: document.getElementById('productStatus').value
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
        const modal = bootstrap.Modal.getInstance(document.getElementById('productModal'));
        modal.hide();
        
        // Reload products
        await loadMyProducts();
        
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

window.showDeleteProductModal = function(productId, productName) {
    sellerProductToDelete = productId;
    document.getElementById('deleteProductName').textContent = productName;
    
    const modal = new bootstrap.Modal(document.getElementById('deleteProductModal'));
    modal.show();
};

window.confirmDeleteProduct = async function(event) {
    if (!sellerProductToDelete) return;
    
    try {
        // Show loading
        const deleteButton = event.target;
        const originalText = deleteButton.innerHTML;
        deleteButton.disabled = true;
        deleteButton.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Đang xóa...';
        
        // Delete product
        await apiService.deleteProduct(sellerProductToDelete);
        
        showToast('Xóa sản phẩm thành công', 'success');
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteProductModal'));
        modal.hide();
        
        // Reload products
        await loadMyProducts();
        
        sellerProductToDelete = null;
        
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
window.loadMyProducts = loadMyProducts;
