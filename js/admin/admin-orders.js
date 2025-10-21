// Admin Orders Management Module
// Handles order management, status updates, and order details

// ===== ORDERS VARIABLES =====
let adminOrders = [];
let adminOrdersCurrentPage = 1;
let adminOrdersTotalPages = 1;
let adminOrdersPerPage = 10;
let adminOrdersSearchQuery = '';
let adminOrdersStatusFilter = '';
let adminOrderToUpdate = null;

// ===== ORDERS FUNCTIONS =====
async function loadAdminOrders() {
    const loading = document.getElementById('adminOrdersLoading');
    const tableContainer = document.getElementById('adminOrdersTableContainer');
    const emptyState = document.getElementById('adminOrdersEmptyState');
    
    try {
        // Show loading
        loading.classList.remove('d-none');
        tableContainer.classList.add('d-none');
        emptyState.classList.add('d-none');
        
        // Get ALL orders from API
        const queryParams = {
            page: adminOrdersCurrentPage,
            limit: adminOrdersPerPage
        };
        
        // Only add status filter if it has a value
        if (adminOrdersStatusFilter && adminOrdersStatusFilter.trim() !== '') {
            queryParams.status = adminOrdersStatusFilter;
        }
        
        const response = await apiService.getAdminOrders(queryParams);
        
        adminOrders = response?.data?.orders || [];
        
        // Update pagination info
        if (response?.data?.pagination) {
            adminOrdersTotalPages = response.data.pagination.total_pages || 1;
            adminOrdersCurrentPage = response.data.pagination.current_page || 1;
        }
        
        // Hide loading
        loading.classList.add('d-none');
        
        if (adminOrders.length === 0) {
            emptyState.classList.remove('d-none');
        } else {
            tableContainer.classList.remove('d-none');
            renderAdminOrdersTable();
        }
        
    } catch (error) {
        loading.classList.add('d-none');
        showToast('Không thể tải danh sách đơn hàng', 'error');
    }
}

function renderAdminOrdersTable() {
    const tbody = document.getElementById('adminOrdersTableBody');
    const pagination = document.getElementById('adminOrdersPagination');
    
    if (!tbody) return;
    
    // Render table rows (no client-side filtering for server-side pagination)
    if (adminOrders.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-4 text-muted">
                    ${adminOrdersSearchQuery || adminOrdersStatusFilter ? 'Không tìm thấy đơn hàng phù hợp' : 'Chưa có đơn hàng nào'}
                </td>
            </tr>
        `;
        pagination.classList.add('d-none');
        return;
    }
    
    tbody.innerHTML = adminOrders.map((order, index) => {
        const globalIndex = (adminOrdersCurrentPage - 1) * adminOrdersPerPage + index + 1;
        const statusBadge = getOrderStatusBadge(order.status);
        const customerName = `User #${order.user_id || 'N/A'}`;
        const sellerName = `User #${order.seller_id || 'N/A'}`;
        
        return `
            <tr>
                <td>${globalIndex}</td>
                <td><strong>#${order.id}</strong></td>
                <td>
                    <div class="fw-semibold">${customerName}</div>
                    <small class="text-muted">-</small>
                </td>
                <td>
                    <small class="text-muted">${sellerName}</small>
                </td>
                <td>
                    <div class="fw-semibold">${formatMoney(order.total_amount)} ₫</div>
                </td>
                <td>${statusBadge}</td>
                <td>
                    <small class="text-muted">${formatDate(order.created_at)}</small>
                </td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-info me-1" onclick="showAdminOrderDetail(${order.id})" title="Xem chi tiết">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    </button>
                    <button class="btn btn-sm btn-outline-warning" onclick="showAdminUpdateOrderStatusModal(${order.id}, '${order.status}')" title="Cập nhật trạng thái">
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
    if (adminOrdersTotalPages > 1) {
        setupAdminOrdersPagination(adminOrdersTotalPages);
        pagination.classList.remove('d-none');
    } else {
        pagination.classList.add('d-none');
    }
}

function setupAdminOrdersPagination(totalPages) {
    const paginationList = document.getElementById('adminOrdersPaginationList');
    if (!paginationList) return;
    
    let paginationHTML = '';
    
    // Previous button
    paginationHTML += `
        <li class="page-item ${adminOrdersCurrentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changeAdminOrdersPage(${adminOrdersCurrentPage - 1}); return false;">Trước</a>
        </li>
    `;
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= adminOrdersCurrentPage - 1 && i <= adminOrdersCurrentPage + 1)) {
            paginationHTML += `
                <li class="page-item ${i === adminOrdersCurrentPage ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="changeAdminOrdersPage(${i}); return false;">${i}</a>
                </li>
            `;
        } else if (i === adminOrdersCurrentPage - 2 || i === adminOrdersCurrentPage + 2) {
            paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
    }
    
    // Next button
    paginationHTML += `
        <li class="page-item ${adminOrdersCurrentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changeAdminOrdersPage(${adminOrdersCurrentPage + 1}); return false;">Sau</a>
        </li>
    `;
    
    paginationList.innerHTML = paginationHTML;
}

window.changeAdminOrdersPage = function(page) {
    if (page < 1 || page > adminOrdersTotalPages) return;
    adminOrdersCurrentPage = page;
    loadAdminOrders();
};

window.showAdminOrderDetail = async function(orderId) {
    try {
        // Get order details from API
        const response = await apiService.getOrderDetail(orderId);
        const order = response.data;
        
        // Enrich order detail with user info
        await enrichOrderDetailWithUserInfo(order);
        
        // Fill order info
        document.getElementById('adminOrderDetailId').textContent = `#${order.id}`;
        document.getElementById('adminOrderDetailStatus').innerHTML = getOrderStatusBadge(order.status);
        document.getElementById('adminOrderDetailDate').textContent = formatDate(order.created_at);
        document.getElementById('adminOrderDetailCustomer').textContent = order.customer_name || `User #${order.user_id}`;
        document.getElementById('adminOrderDetailEmail').textContent = order.customer_email || '-';
        document.getElementById('adminOrderDetailPhone').textContent = order.customer_phone || '-';
        document.getElementById('adminOrderDetailTotal').textContent = `${formatMoney(order.total_amount)} ₫`;
        
        // Fill seller info
        document.getElementById('adminOrderDetailSeller').textContent = order.seller_name || `User #${order.seller_id || 'N/A'}`;
        document.getElementById('adminOrderDetailSellerEmail').textContent = order.seller_email || '-';
        document.getElementById('adminOrderDetailAddress').textContent = order.shipping_address || '-';
        
        // Fill order items
        const itemsTbody = document.getElementById('adminOrderItemsTableBody');
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
        const statusActions = document.getElementById('adminOrderStatusActions');
        statusActions.innerHTML = `
            <button class="btn btn-warning" onclick="showAdminUpdateOrderStatusModal(${order.id}, '${order.status}')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="me-1">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                Cập Nhật Trạng Thái
            </button>
        `;
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('adminOrderDetailModal'));
        modal.show();
        
    } catch (error) {
        showToast('Không thể tải chi tiết đơn hàng', 'error');
    }
};

window.showAdminUpdateOrderStatusModal = function(orderId, currentStatus) {
    adminOrderToUpdate = orderId;
    
    // Set current order ID
    document.getElementById('adminUpdateOrderId').textContent = `#${orderId}`;
    
    // Set current status in select
    const statusSelect = document.getElementById('adminNewOrderStatus');
    statusSelect.value = currentStatus;
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('adminUpdateOrderStatusModal'));
    modal.show();
};

window.confirmAdminUpdateOrderStatus = async function(event) {
    if (!adminOrderToUpdate) return;
    
    try {
        const newStatus = document.getElementById('adminNewOrderStatus').value;
        
        // Show loading
        const updateButton = event.target;
        const originalText = updateButton.innerHTML;
        updateButton.disabled = true;
        updateButton.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Đang cập nhật...';
        
        // Update order status
        await apiService.updateOrderStatus(adminOrderToUpdate, newStatus);
        
        showToast('Cập nhật trạng thái đơn hàng thành công', 'success');
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('adminUpdateOrderStatusModal'));
        modal.hide();
        
        // Reload orders
        await loadAdminOrders();
        
        adminOrderToUpdate = null;
        
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
        
        // Get seller info (if different from user)
        if (order.seller_id && order.seller_id !== order.user_id) {
            const sellerResponse = await apiService.getUserById(order.seller_id);
            if (sellerResponse?.data) {
                order.seller_name = sellerResponse.data.username || sellerResponse.data.fullName;
                order.seller_email = sellerResponse.data.email;
            }
        }
    } catch (error) {
        // Failed to get user info for order detail
    }
}

// Export functions for use in main dashboard
window.loadAdminOrders = loadAdminOrders;
