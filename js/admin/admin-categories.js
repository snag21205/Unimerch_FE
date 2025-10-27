// Admin Categories Management Module
// Handles category CRUD operations via API

// ===== CATEGORIES VARIABLES =====
let adminCategories = [];
let adminCategoriesLoaded = false;

// ===== CATEGORIES FUNCTIONS =====

/**
 * Load categories from API with product counts
 */
async function loadAdminCategories() {
    const loading = document.getElementById('adminCategoriesLoading');
    const tableContainer = document.getElementById('adminCategoriesTableContainer');
    const emptyState = document.getElementById('adminCategoriesEmptyState');
    
    try {
        // Show loading
        if (loading) loading.classList.remove('d-none');
        if (tableContainer) tableContainer.classList.add('d-none');
        if (emptyState) emptyState.classList.add('d-none');
        
        // Get categories from API
        const response = await apiService.getCategories();
        adminCategories = response.data || [];
        
        // Try to get product counts from stats API
        try {
            const statsResponse = await apiService.getProductStats();
            const categoryAnalysis = statsResponse.data?.category_analysis || [];
            
            // Merge product counts into categories
            adminCategories = adminCategories.map(category => {
                // Find matching category in stats by id or name
                const stats = categoryAnalysis.find(stat => 
                    stat.category_id === category.id || 
                    stat.category_name === category.name ||
                    stat.id === category.id
                );
                
                return {
                    ...category,
                    product_count: stats ? (stats.product_count || stats.total_products || 0) : 0
                };
            });
        } catch (statsError) {
            console.warn('Could not load product counts from stats API:', statsError);
            // Continue with categories but without product counts
            adminCategories = adminCategories.map(category => ({
                ...category,
                product_count: 0
            }));
        }
        
        // Hide loading
        if (loading) loading.classList.add('d-none');
        
        if (adminCategories.length === 0) {
            if (emptyState) emptyState.classList.remove('d-none');
        } else {
            if (tableContainer) tableContainer.classList.remove('d-none');
            renderAdminCategoriesTable();
        }
        
        adminCategoriesLoaded = true;
        
        // Update product form dropdown
        updateProductCategoryDropdown();
        
    } catch (error) {
        console.error('Error loading categories:', error);
        if (loading) loading.classList.add('d-none');
        showToast('Không thể tải danh sách danh mục', 'error');
    }
}

/**
 * Render categories table
 */
function renderAdminCategoriesTable() {
    const tbody = document.getElementById('adminCategoriesTableBody');
    if (!tbody) return;
    
    if (adminCategories.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center py-4 text-muted">
                    Chưa có danh mục nào trong hệ thống
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = adminCategories.map((category, index) => {
        const productCount = category.product_count || 0;
        
        return `
            <tr>
                <td>${index + 1}</td>
                <td>
                    <div class="fw-semibold">${category.name}</div>
                    ${category.description ? `<small class="text-muted">${category.description}</small>` : ''}
                </td>
                <td>
                    <span class="badge ${productCount > 0 ? 'bg-primary' : 'bg-secondary'}">${productCount} sản phẩm</span>
                </td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="showEditCategoryModal(${category.id})" title="Chỉnh sửa">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteCategory(${category.id})" title="Xóa">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * Show categories modal
 */
window.showAdminCategoriesModal = async function() {
    // Load categories if not loaded yet
    if (!adminCategoriesLoaded) {
        await loadAdminCategories();
    } else {
        renderAdminCategoriesTable();
    }
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('adminCategoriesModal'));
    modal.show();
};

/**
 * Show add category modal
 */
window.showAddCategoryModal = function() {
    // Reset form
    document.getElementById('adminCategoryForm').reset();
    document.getElementById('adminCategoryId').value = '';
    document.getElementById('adminCategoryFormTitle').textContent = 'Thêm danh mục mới';
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('adminCategoryFormModal'));
    modal.show();
};

/**
 * Show edit category modal
 */
window.showEditCategoryModal = function(categoryId) {
    // Find category
    const category = adminCategories.find(c => c.id === categoryId);
    
    if (!category) {
        showToast('Không tìm thấy danh mục', 'error');
        return;
    }
    
    // Fill form
    document.getElementById('adminCategoryId').value = category.id;
    document.getElementById('adminCategoryName').value = category.name;
    document.getElementById('adminCategoryDescription').value = category.description || '';
    document.getElementById('adminCategoryFormTitle').textContent = 'Chỉnh sửa danh mục';
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('adminCategoryFormModal'));
    modal.show();
};

/**
 * Save category form (add or edit)
 */
window.saveCategoryForm = async function() {
    const form = document.getElementById('adminCategoryForm');
    
    // Validate
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }
    
    const saveBtn = document.querySelector('#adminCategoryFormModal .btn-primary');
    const originalText = saveBtn.innerHTML;
    
    try {
        const categoryId = document.getElementById('adminCategoryId').value;
        const categoryData = {
            name: document.getElementById('adminCategoryName').value.trim(),
            description: document.getElementById('adminCategoryDescription').value.trim()
        };
        
        // Show loading
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Đang lưu...';
        
        if (categoryId) {
            // Update category
            await apiService.updateCategory(categoryId, categoryData);
            showToast('Đã cập nhật danh mục', 'success');
        } else {
            // Create new category
            await apiService.createCategory(categoryData);
            showToast('Đã thêm danh mục mới', 'success');
        }
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('adminCategoryFormModal'));
        modal.hide();
        
        // Reload categories
        adminCategoriesLoaded = false;
        await loadAdminCategories();
        
    } catch (error) {
        console.error('Error saving category:', error);
        showToast(error.message || 'Không thể lưu danh mục', 'error');
    } finally {
        // Restore button
        saveBtn.disabled = false;
        saveBtn.innerHTML = originalText;
    }
};

/**
 * Delete category
 */
window.deleteCategory = async function(categoryId) {
    if (!confirm('Bạn có chắc chắn muốn xóa danh mục này?\n\nLưu ý: Không thể xóa nếu danh mục có sản phẩm.')) {
        return;
    }
    
    try {
        await apiService.deleteCategory(categoryId);
        showToast('Đã xóa danh mục', 'success');
        
        // Reload categories
        adminCategoriesLoaded = false;
        await loadAdminCategories();
        
    } catch (error) {
        console.error('Error deleting category:', error);
        let errorMessage = 'Không thể xóa danh mục';
        
        if (error.message.includes('400')) {
            errorMessage = 'Không thể xóa danh mục có sản phẩm. Vui lòng xóa hoặc chuyển sản phẩm trước.';
        } else if (error.message.includes('404')) {
            errorMessage = 'Không tìm thấy danh mục.';
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        showToast(errorMessage, 'error');
    }
};

/**
 * Refresh categories from server
 */
window.refreshAdminCategories = async function() {
    adminCategoriesLoaded = false;
    await loadAdminCategories();
    showToast('Đã làm mới danh sách danh mục', 'success');
};

/**
 * Update product category dropdown
 */
function updateProductCategoryDropdown() {
    const dropdown = document.getElementById('adminProductCategory');
    if (!dropdown) return;
    
    // Build options HTML
    let optionsHTML = '<option value="">Chọn danh mục...</option>';
    
    adminCategories.forEach(category => {
        optionsHTML += `<option value="${category.id}">${category.name}</option>`;
    });
    
    dropdown.innerHTML = optionsHTML;
}

/**
 * Format money helper
 */
function formatMoney(amount) {
    if (!amount) return '0';
    return new Intl.NumberFormat('vi-VN').format(amount);
}

// Auto load categories when page loads (after a small delay to ensure DOM is ready)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => {
            loadAdminCategories();
        }, 500);
    });
} else {
    setTimeout(() => {
        loadAdminCategories();
    }, 500);
}

// Export functions for use in other modules
window.loadAdminCategories = loadAdminCategories;
window.updateProductCategoryDropdown = updateProductCategoryDropdown;

