// Admin Users Management Module
// Handles user CRUD operations, table rendering, and pagination

// ===== USERS VARIABLES =====
let adminUsers = [];
let adminUsersCurrentPage = 1;
let adminUsersTotalPages = 1;
let adminUsersPerPage = 10;
let adminUsersSearchQuery = '';
let adminUsersRoleFilter = '';
let adminUserToDelete = null;

// ===== USERS FUNCTIONS =====
async function loadAdminUsers() {
    const loading = document.getElementById('adminUsersLoading');
    const tableContainer = document.getElementById('adminUsersTableContainer');
    const emptyState = document.getElementById('adminUsersEmptyState');
    
    try {
        // Show loading
        loading.classList.remove('d-none');
        tableContainer.classList.add('d-none');
        emptyState.classList.add('d-none');
        
        // Get ALL users from API (no server-side role filter)
        const queryParams = {
            page: adminUsersCurrentPage,
            limit: adminUsersPerPage
        };
        
        // Note: Backend doesn't support role filter, so we'll filter client-side
        
        const response = await apiService.getUsers(queryParams);
        
        adminUsers = response?.data?.users || [];
        
        // Update pagination info
        if (response?.data?.pagination) {
            adminUsersTotalPages = response.data.pagination.total_pages || 1;
            adminUsersCurrentPage = response.data.pagination.current_page || 1;
        }
        
        // Hide loading
        loading.classList.add('d-none');
        
        if (adminUsers.length === 0) {
            emptyState.classList.remove('d-none');
        } else {
            tableContainer.classList.remove('d-none');
            renderAdminUsersTable();
        }
        
    } catch (error) {
        loading.classList.add('d-none');
        showToast('Không thể tải danh sách người dùng', 'error');
    }
}

function renderAdminUsersTable() {
    const tbody = document.getElementById('adminUsersTableBody');
    const pagination = document.getElementById('adminUsersPagination');
    
    if (!tbody) return;
    
    // Filter users by search query and role
    let filteredUsers = adminUsers;
    
    // Filter by search query
    if (adminUsersSearchQuery) {
        filteredUsers = filteredUsers.filter(user => 
            (user.username && user.username.toLowerCase().includes(adminUsersSearchQuery)) ||
            (user.email && user.email.toLowerCase().includes(adminUsersSearchQuery)) ||
            (user.fullName && user.fullName.toLowerCase().includes(adminUsersSearchQuery))
        );
    }
    
    // Filter by role
    if (adminUsersRoleFilter && adminUsersRoleFilter.trim() !== '') {
        filteredUsers = filteredUsers.filter(user => user.role === adminUsersRoleFilter);
    }
    
    // Render table rows
    if (filteredUsers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-4 text-muted">
                    ${adminUsersSearchQuery || adminUsersRoleFilter ? 'Không tìm thấy người dùng phù hợp' : 'Chưa có người dùng nào'}
                </td>
            </tr>
        `;
        pagination.classList.add('d-none');
        return;
    }
    
    tbody.innerHTML = filteredUsers.map((user, index) => {
        const globalIndex = (adminUsersCurrentPage - 1) * adminUsersPerPage + index + 1;
        const roleBadge = getUserRoleBadge(user.role);
        const statusBadge = getUserStatusBadge(user.status);
        const avatarUrl = user.avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNmOGY5ZmEiLz4KPHBhdGggZD0iTTIwIDEwQzIyLjc2MTQgMTAgMjUgMTIuMjM4NiAyNSAxNUMyNSAxNy43NjE0IDIyLjc2MTQgMjAgMjAgMjBDMTcuMjM4NiAyMCAxNSAxNy43NjE0IDE1IDE1QzE1IDEyLjIzODYgMTcuMjM4NiAxMCAyMCAxMFoiIGZpbGw9IiM5Y2EzYWYiLz4KPHBhdGggZD0iTTEyIDMwQzEyIDI2LjY4NjMgMTUuNjg2MyAyMyAyMCAyM0MyNC4zMTM3IDIzIDI4IDI2LjY4NjMgMjggMzBWMzJIMTJWMzBaIiBmaWxsPSIjOWNhM2FmIi8+Cjwvc3ZnPgo=';
        
        return `
            <tr>
                <td>${globalIndex}</td>
                <td>
                    <img src="${avatarUrl}" 
                         alt="${user.username}" 
                         class="rounded-circle"
                         style="width: 40px; height: 40px; object-fit: cover;"
                         onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNmOGY5ZmEiLz4KPHBhdGggZD0iTTIwIDEwQzIyLjc2MTQgMTAgMjUgMTIuMjM4NiAyNSAxNUMyNSAxNy43NjE0IDIyLjc2MTQgMjAgMjAgMjBDMTcuMjM4NiAyMCAxNSAxNy43NjE0IDE1IDE1QzE1IDEyLjIzODYgMTcuMjM4NiAxMCAyMCAxMFoiIGZpbGw9IiM5Y2EzYWYiLz4KPHBhdGggZD0iTTEyIDMwQzEyIDI2LjY4NjMgMTUuNjg2MyAyMyAyMCAyM0MyNC4zMTM3IDIzIDI4IDI2LjY4NjMgMjggMzBWMzJIMTJWMzBaIiBmaWxsPSIjOWNhM2FmIi8+Cjwvc3ZnPgo='">
                </td>
                <td>
                    <div class="fw-semibold">${user.username || 'N/A'}</div>
                    ${user.fullName ? `<small class="text-muted">${user.fullName}</small>` : ''}
                </td>
                <td>
                    <small class="text-muted">${user.email || '-'}</small>
                </td>
                <td>${roleBadge}</td>
                <td>${statusBadge}</td>
                <td>
                    <small class="text-muted">${formatDate(user.created_at)}</small>
                </td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="showAdminEditUserModal(${user.id})" title="Chỉnh sửa">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="showAdminDeleteUserModal(${user.id}, '${user.username}')" title="Xóa">
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
    if (adminUsersTotalPages > 1) {
        setupAdminUsersPagination(adminUsersTotalPages);
        pagination.classList.remove('d-none');
    } else {
        pagination.classList.add('d-none');
    }
}

function setupAdminUsersPagination(totalPages) {
    const paginationList = document.getElementById('adminUsersPaginationList');
    if (!paginationList) return;
    
    let paginationHTML = '';
    
    // Previous button
    paginationHTML += `
        <li class="page-item ${adminUsersCurrentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changeAdminUsersPage(${adminUsersCurrentPage - 1}); return false;">Trước</a>
        </li>
    `;
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= adminUsersCurrentPage - 1 && i <= adminUsersCurrentPage + 1)) {
            paginationHTML += `
                <li class="page-item ${i === adminUsersCurrentPage ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="changeAdminUsersPage(${i}); return false;">${i}</a>
                </li>
            `;
        } else if (i === adminUsersCurrentPage - 2 || i === adminUsersCurrentPage + 2) {
            paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
    }
    
    // Next button
    paginationHTML += `
        <li class="page-item ${adminUsersCurrentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changeAdminUsersPage(${adminUsersCurrentPage + 1}); return false;">Sau</a>
        </li>
    `;
    
    paginationList.innerHTML = paginationHTML;
}

window.changeAdminUsersPage = function(page) {
    if (page < 1 || page > adminUsersTotalPages) return;
    adminUsersCurrentPage = page;
    loadAdminUsers();
};

window.showAdminAddUserModal = function() {
    // Reset form
    document.getElementById('adminUserForm').reset();
    document.getElementById('adminUserId').value = '';
    document.getElementById('adminUserModalTitle').textContent = 'Thêm Người Dùng Mới';
    
    // Show password fields for new user
    document.getElementById('adminUserPasswordField').style.display = 'block';
    document.getElementById('adminUserPasswordConfirmField').style.display = 'block';
    document.getElementById('adminUserPassword').required = true;
    document.getElementById('adminUserPasswordConfirm').required = true;
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('adminUserModal'));
    modal.show();
};

window.showAdminEditUserModal = async function(userId) {
    try {
        // Get user details
        const response = await apiService.getUserById(userId);
        const user = response.data;
        
        // Fill form
        document.getElementById('adminUserId').value = user.id;
        document.getElementById('adminUserUsername').value = user.username || '';
        document.getElementById('adminUserEmail').value = user.email || '';
        document.getElementById('adminUserFullName').value = user.fullName || '';
        document.getElementById('adminUserPhone').value = user.phone || '';
        document.getElementById('adminUserRole').value = user.role || '';
        document.getElementById('adminUserStatus').value = user.status || 'active';
        
        // Set modal title
        document.getElementById('adminUserModalTitle').textContent = 'Chỉnh Sửa Người Dùng';
        
        // Hide password fields for edit
        document.getElementById('adminUserPasswordField').style.display = 'none';
        document.getElementById('adminUserPasswordConfirmField').style.display = 'none';
        document.getElementById('adminUserPassword').required = false;
        document.getElementById('adminUserPasswordConfirm').required = false;
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('adminUserModal'));
        modal.show();
        
    } catch (error) {
        showToast('Không thể tải thông tin người dùng', 'error');
    }
};

window.saveAdminUser = async function(event) {
    try {
        const form = document.getElementById('adminUserForm');
        const formData = new FormData(form);
        
        // Validate form
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }
        
        // Check password confirmation for new user
        const userId = document.getElementById('adminUserId').value;
        const password = document.getElementById('adminUserPassword').value;
        const passwordConfirm = document.getElementById('adminUserPasswordConfirm').value;
        
        if (!userId && password !== passwordConfirm) {
            document.getElementById('adminUserPasswordConfirm').setCustomValidity('Mật khẩu xác nhận không khớp');
            form.classList.add('was-validated');
            return;
        }
        
        // Collect data
        const userData = {
            username: formData.get('username'),
            email: formData.get('email'),
            fullName: formData.get('fullName'),
            phone: formData.get('phone'),
            role: formData.get('role'),
            status: formData.get('status')
        };
        
        // Add password for new user
        if (!userId && password) {
            userData.password = password;
        }
        
        // Show loading
        const saveButton = event.target;
        const originalText = saveButton.innerHTML;
        saveButton.disabled = true;
        saveButton.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Đang lưu...';
        
        // Save user
        if (userId) {
            await apiService.updateUser(userId, userData);
            showToast('Cập nhật người dùng thành công', 'success');
        } else {
            await apiService.createUser(userData);
            showToast('Thêm người dùng thành công', 'success');
        }
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('adminUserModal'));
        modal.hide();
        
        // Reload users
        await loadAdminUsers();
        
        // Restore button
        saveButton.disabled = false;
        saveButton.innerHTML = originalText;
        
    } catch (error) {
        showToast(error.message || 'Không thể lưu người dùng', 'error');
        
        // Restore button
        const saveButton = event.target;
        saveButton.disabled = false;
        saveButton.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="me-1"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17,21 17,13 7,13 7,21"></polyline><polyline points="7,3 7,8 15,8"></polyline></svg>Lưu';
    }
};

window.showAdminDeleteUserModal = function(userId, username) {
    adminUserToDelete = userId;
    document.getElementById('adminDeleteUserName').textContent = username;
    
    const modal = new bootstrap.Modal(document.getElementById('adminDeleteUserModal'));
    modal.show();
};

window.confirmAdminDeleteUser = async function(event) {
    if (!adminUserToDelete) return;
    
    try {
        // Show loading
        const deleteButton = event.target;
        const originalText = deleteButton.innerHTML;
        deleteButton.disabled = true;
        deleteButton.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Đang xóa...';
        
        // Delete user
        await apiService.deleteUser(adminUserToDelete);
        
        showToast('Xóa người dùng thành công', 'success');
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('adminDeleteUserModal'));
        modal.hide();
        
        // Reload users
        await loadAdminUsers();
        
        adminUserToDelete = null;
        
        // Restore button
        deleteButton.disabled = false;
        deleteButton.innerHTML = originalText;
        
    } catch (error) {
        showToast(error.message || 'Không thể xóa người dùng', 'error');
        
        // Restore button
        const deleteButton = event.target;
        deleteButton.disabled = false;
        deleteButton.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="me-1"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>Xóa';
    }
};

function getUserRoleBadge(role) {
    const roleMap = {
        'user': { text: 'Người dùng', class: 'bg-primary' },
        'seller': { text: 'Người bán', class: 'bg-success' },
        'admin': { text: 'Quản trị viên', class: 'bg-danger' }
    };
    
    const roleInfo = roleMap[role] || roleMap['user'];
    return `<span class="badge ${roleInfo.class}">${roleInfo.text}</span>`;
}

function getUserStatusBadge(status) {
    const statusMap = {
        'active': { text: 'Hoạt động', class: 'bg-success' },
        'inactive': { text: 'Không hoạt động', class: 'bg-secondary' },
        'banned': { text: 'Bị cấm', class: 'bg-danger' }
    };
    
    const statusInfo = statusMap[status] || statusMap['active'];
    return `<span class="badge ${statusInfo.class}">${statusInfo.text}</span>`;
}

// Export functions for use in main dashboard
window.loadAdminUsers = loadAdminUsers;
