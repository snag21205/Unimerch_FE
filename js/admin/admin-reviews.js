// Admin Reviews Management Module
// Handles review management, table rendering, and pagination

// ===== REVIEWS VARIABLES =====
let adminReviews = [];
let adminReviewsCurrentPage = 1;
let adminReviewsTotalPages = 1;
let adminReviewsPerPage = 10;
let adminReviewsSearchQuery = '';
let adminReviewsRatingFilter = '';
let adminReviewsProductFilter = '';
let adminReviewToDelete = null;

// ===== REVIEWS FUNCTIONS =====
async function loadAdminReviews() {
    const loading = document.getElementById('adminReviewsLoading');
    const tableContainer = document.getElementById('adminReviewsTableContainer');
    const emptyState = document.getElementById('adminReviewsEmptyState');
    
    try {
        // Show loading
        loading.classList.remove('d-none');
        tableContainer.classList.add('d-none');
        emptyState.classList.add('d-none');
        
        // Get ALL reviews from API
        const queryParams = {
            page: adminReviewsCurrentPage,
            limit: adminReviewsPerPage
        };
        
        const response = await apiService.getReviews(queryParams);
        
        adminReviews = response?.data?.reviews || [];
        
        if (response?.data?.pagination) {
            adminReviewsTotalPages = response.data.pagination.totalPages || 1;
            adminReviewsCurrentPage = response.data.pagination.currentPage || 1;
        }
        
        // Hide loading
        loading.classList.add('d-none');
        
        if (adminReviews.length === 0) {
            emptyState.classList.remove('d-none');
        } else {
            tableContainer.classList.remove('d-none');
            renderAdminReviewsTable();
        }
        
    } catch (error) {
        loading.classList.add('d-none');
        showToast('Không thể tải danh sách đánh giá', 'error');
    }
}

function renderAdminReviewsTable() {
    const tbody = document.getElementById('adminReviewsTableBody');
    const pagination = document.getElementById('adminReviewsPagination');
    
    if (!tbody) return;
    
    // Filter reviews by search query, rating, and product
    let filteredReviews = adminReviews;
    
    // Filter by search query
    if (adminReviewsSearchQuery) {
        filteredReviews = filteredReviews.filter(review => 
            (review.comment && review.comment.toLowerCase().includes(adminReviewsSearchQuery)) ||
            (review.username && review.username.toLowerCase().includes(adminReviewsSearchQuery)) ||
            (review.product_name && review.product_name.toLowerCase().includes(adminReviewsSearchQuery))
        );
    }
    
    // Filter by rating
    if (adminReviewsRatingFilter && adminReviewsRatingFilter.trim() !== '') {
        filteredReviews = filteredReviews.filter(review => review.rating == adminReviewsRatingFilter);
    }
    
    // Filter by product
    if (adminReviewsProductFilter && adminReviewsProductFilter.trim() !== '') {
        filteredReviews = filteredReviews.filter(review => review.product_id == adminReviewsProductFilter);
    }
    
    // Render table rows
    if (filteredReviews.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4 text-muted">
                    ${adminReviewsSearchQuery || adminReviewsRatingFilter || adminReviewsProductFilter ? 'Không tìm thấy đánh giá phù hợp' : 'Chưa có đánh giá nào'}
                </td>
            </tr>
        `;
        pagination.classList.add('d-none');
        return;
    }
    
    tbody.innerHTML = filteredReviews.map((review, index) => {
        const globalIndex = (adminReviewsCurrentPage - 1) * adminReviewsPerPage + index + 1;
        const ratingStars = getRatingStars(review.rating);
        
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
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="showAdminReviewDetail(${review.id})" title="Xem chi tiết">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="showAdminDeleteReviewModal(${review.id})" title="Xóa đánh giá">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3,6 5,6 21,6"></polyline>
                            <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                        </svg>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    if (adminReviewsTotalPages > 1) {
        setupAdminReviewsPagination(adminReviewsTotalPages);
        pagination.classList.remove('d-none');
    } else {
        pagination.classList.add('d-none');
    }
}

function setupAdminReviewsPagination(totalPages) {
    const paginationList = document.getElementById('adminReviewsPaginationList');
    if (!paginationList) return;
    
    let paginationHTML = '';
    
    // Previous button
    if (adminReviewsCurrentPage > 1) {
        paginationHTML += `
            <li class="page-item">
                <a class="page-link" href="#" onclick="changeAdminReviewsPage(${adminReviewsCurrentPage - 1})">Trước</a>
            </li>
        `;
    }
    
    // Page numbers
    const startPage = Math.max(1, adminReviewsCurrentPage - 2);
    const endPage = Math.min(totalPages, adminReviewsCurrentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <li class="page-item ${i === adminReviewsCurrentPage ? 'active' : ''}">
                <a class="page-link" href="#" onclick="changeAdminReviewsPage(${i})">${i}</a>
            </li>
        `;
    }
    
    // Next button
    if (adminReviewsCurrentPage < totalPages) {
        paginationHTML += `
            <li class="page-item">
                <a class="page-link" href="#" onclick="changeAdminReviewsPage(${adminReviewsCurrentPage + 1})">Sau</a>
            </li>
        `;
    }
    
    paginationList.innerHTML = paginationHTML;
}

window.changeAdminReviewsPage = function(page) {
    if (page < 1 || page > adminReviewsTotalPages) return;
    adminReviewsCurrentPage = page;
    loadAdminReviews();
};

window.showAdminReviewDetail = async function(reviewId) {
    try {
        const response = await apiService.getReviewDetail(reviewId);
        const review = response.data;
        
        // Fill modal with review data
        document.getElementById('adminReviewProductName').textContent = review.product_name || 'N/A';
        document.getElementById('adminReviewProductPrice').textContent = review.product_price ? formatMoney(review.product_price) + ' ₫' : '-';
        
        document.getElementById('adminReviewUserName').textContent = review.username || 'N/A';
        document.getElementById('adminReviewUserEmail').textContent = review.user_email || '-';
        document.getElementById('adminReviewUserAvatar').src = review.user_avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjUiIGN5PSIyNSIgcj0iMjUiIGZpbGw9IiNmOGY5ZmEiLz4KPHBhdGggZD0iTTI1IDEzQzI4LjMxMzcgMTMgMzEgMTUuNjg2MyAzMSAxOUMyMSAyMi4zMTM3IDI4LjMxMzcgMjUgMjUgMjVDMjEuNjg2MyAyNSAxOSAyMi4zMTM3IDE5IDE5QzE5IDE1LjY4NjMgMjEuNjg2MyAxMyAyNSAxM1oiIGZpbGw9IiM5Y2EzYWYiLz4KPHBhdGggZD0iTTE1IDM4QzE1IDM0LjY4NjMgMTguNjg2MyAzMSAyMiAzMUMyNS4zMTM3IDMxIDI5IDM0LjY4NjMgMjkgMzhWMzBIMTVWMzhaIiBmaWxsPSIjOWNhM2FmIi8+Cjwvc3ZnPgo=';
        
        document.getElementById('adminReviewRating').innerHTML = getRatingStars(review.rating);
        document.getElementById('adminReviewCreatedAt').textContent = formatDate(review.created_at);
        document.getElementById('adminReviewComment').textContent = review.comment || 'Không có nội dung';
        
        // Store review ID for delete action
        adminReviewToDelete = reviewId;
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('adminReviewDetailModal'));
        modal.show();
        
    } catch (error) {
        showToast('Không thể tải chi tiết đánh giá', 'error');
    }
};

window.showAdminDeleteReviewModal = function(reviewId) {
    adminReviewToDelete = reviewId;
    const modal = new bootstrap.Modal(document.getElementById('adminDeleteReviewModal'));
    modal.show();
};

window.confirmAdminDeleteReview = async function() {
    if (!adminReviewToDelete) return;
    
    const deleteButton = document.querySelector('#adminDeleteReviewModal .btn-danger');
    const originalText = deleteButton.innerHTML;
    
    try {
        // Show loading
        deleteButton.disabled = true;
        deleteButton.innerHTML = `
            <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
            Đang xóa...
        `;
        
        await apiService.deleteReview(adminReviewToDelete);
        
        showToast('Xóa đánh giá thành công', 'success');
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('adminDeleteReviewModal'));
        modal.hide();
        
        // Reload reviews
        await loadAdminReviews();
        
        adminReviewToDelete = null;
        
    } catch (error) {
        showToast('Không thể xóa đánh giá', 'error');
    } finally {
        // Restore button
        deleteButton.disabled = false;
        deleteButton.innerHTML = originalText;
    }
};

function getRatingStars(rating) {
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

// Load products for filter dropdown
async function loadProductsForReviewFilter() {
    try {
        const response = await apiService.getProducts({ limit: 100 }); // Get products with pagination
        const products = response?.data?.products || [];
        
        const productFilter = document.getElementById('adminReviewProductFilter');
        if (productFilter) {
            // Clear existing options except first one
            productFilter.innerHTML = '<option value="">Tất cả sản phẩm</option>';
            
            // Add product options
            products.forEach(product => {
                const option = document.createElement('option');
                option.value = product.id;
                option.textContent = product.name;
                productFilter.appendChild(option);
            });
        }
    } catch (error) {
        // Error loading products for filter
    }
}

// Export functions for use in main dashboard
window.loadAdminReviews = loadAdminReviews;
window.loadProductsForReviewFilter = loadProductsForReviewFilter;
