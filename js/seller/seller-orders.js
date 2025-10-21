// Seller Orders Management Module
// Handles order management, status updates, and order details

// ===== ORDERS VARIABLES =====
let sellerOrders = [];
let sellerOrdersCurrentPage = 1;
let sellerOrdersTotalPages = 1;
let sellerOrdersPerPage = 10;
let sellerOrdersSearchQuery = '';
let sellerOrdersStatusFilter = '';
let sellerOrderToUpdate = null;

// ===== ORDERS FUNCTIONS =====
async function loadMyOrders() {
    const loading = document.getElementById('ordersLoading');
    const tableContainer = document.getElementById('ordersTableContainer');
    const emptyState = document.getElementById('ordersEmptyState');
    
    try {
        // Show loading
        loading.classList.remove('d-none');
        tableContainer.classList.add('d-none');
        emptyState.classList.add('d-none');
        
        // Get orders for current seller using seller API
        const queryParams = {
            page: sellerOrdersCurrentPage,
            limit: sellerOrdersPerPage
        };
        
        // Only add status filter if it has a value
        if (sellerOrdersStatusFilter && sellerOrdersStatusFilter.trim() !== '') {
            queryParams.status = sellerOrdersStatusFilter;
        }
        
        console.log('Loading orders with params:', queryParams);
        
        const response = await apiService.getSellerOrders(queryParams);
        
        console.log('Orders response:', response);
        
        sellerOrders = response?.data?.orders || [];
        
        console.log('Orders loaded:', sellerOrders.length);
        
        // Update pagination info
        if (response?.data?.pagination) {
            sellerOrdersTotalPages = response.data.pagination.total_pages || 1;
            sellerOrdersCurrentPage = response.data.pagination.current_page || 1;
        }
        
        // Hide loading
        loading.classList.add('d-none');
        
        if (sellerOrders.length === 0) {
            emptyState.classList.remove('d-none');
        } else {
            tableContainer.classList.remove('d-none');
            renderSellerOrdersTable();
        }
        
    } catch (error) {
        loading.classList.add('d-none');
        showToast('Không thể tải danh sách đơn hàng', 'error');
    }
}

function renderSellerOrdersTable() {
    const tbody = document.getElementById('ordersTableBody');
    const pagination = document.getElementById('ordersPagination');
    
    if (!tbody) return;
    
    // Render table rows (no client-side filtering for server-side pagination)
    if (sellerOrders.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4 text-muted">
                    ${sellerOrdersSearchQuery || sellerOrdersStatusFilter ? 'Không tìm thấy đơn hàng phù hợp' : 'Chưa có đơn hàng nào'}
                </td>
            </tr>
        `;
        pagination.classList.add('d-none');
        return;
    }
    
    tbody.innerHTML = sellerOrders.map((order, index) => {
        const globalIndex = (sellerOrdersCurrentPage - 1) * sellerOrdersPerPage + index + 1;
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
                    <button class="btn btn-sm btn-outline-warning" onclick="showUpdateOrderStatusModal(${order.id}, '${order.status}')" title="Cập nhật trạng thái">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    // Setup pagination
    if (sellerOrdersTotalPages > 1) {
        setupSellerOrdersPagination(sellerOrdersTotalPages);
        pagination.classList.remove('d-none');
    } else {
        pagination.classList.add('d-none');
    }
}

function setupSellerOrdersPagination(totalPages) {
    const paginationList = document.getElementById('ordersPaginationList');
    if (!paginationList) return;
    
    let paginationHTML = '';
    
    // Previous button
    paginationHTML += `
        <li class="page-item ${sellerOrdersCurrentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changeSellerOrdersPage(${sellerOrdersCurrentPage - 1}); return false;">Trước</a>
        </li>
    `;
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= sellerOrdersCurrentPage - 1 && i <= sellerOrdersCurrentPage + 1)) {
            paginationHTML += `
                <li class="page-item ${i === sellerOrdersCurrentPage ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="changeSellerOrdersPage(${i}); return false;">${i}</a>
                </li>
            `;
        } else if (i === sellerOrdersCurrentPage - 2 || i === sellerOrdersCurrentPage + 2) {
            paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
    }
    
    // Next button
    paginationHTML += `
        <li class="page-item ${sellerOrdersCurrentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changeSellerOrdersPage(${sellerOrdersCurrentPage + 1}); return false;">Sau</a>
        </li>
    `;
    
    paginationList.innerHTML = paginationHTML;
}

window.changeSellerOrdersPage = function(page) {
    if (page < 1 || page > sellerOrdersTotalPages) return;
    sellerOrdersCurrentPage = page;
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
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('orderDetailModal'));
        modal.show();
        
    } catch (error) {
        showToast('Không thể tải chi tiết đơn hàng', 'error');
    }
};

window.showUpdateOrderStatusModal = function(orderId, currentStatus) {
    sellerOrderToUpdate = orderId;
    
    // Set current order ID
    document.getElementById('updateOrderId').textContent = `#${orderId}`;
    
    // Set current status in select
    const statusSelect = document.getElementById('newOrderStatus');
    statusSelect.value = currentStatus;
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('updateOrderStatusModal'));
    modal.show();
};

window.confirmUpdateOrderStatus = async function(event) {
    if (!sellerOrderToUpdate) return;
    
    try {
        const newStatus = document.getElementById('newOrderStatus').value;
        
        // Show loading
        const updateButton = event.target;
        const originalText = updateButton.innerHTML;
        updateButton.disabled = true;
        updateButton.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Đang cập nhật...';
        
        // Update order status
        await apiService.updateOrderStatus(sellerOrderToUpdate, newStatus);
        
        showToast('Cập nhật trạng thái đơn hàng thành công', 'success');
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('updateOrderStatusModal'));
        modal.hide();
        
        // Reload orders
        await loadMyOrders();
        
        sellerOrderToUpdate = null;
        
        // Restore button
        updateButton.disabled = false;
        updateButton.innerHTML = originalText;
        
    } catch (error) {
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
        // Failed to get user info for order detail
    }
}

// Export functions for use in main dashboard
window.loadMyOrders = loadMyOrders;
