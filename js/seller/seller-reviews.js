// Seller Reviews Management Module
// Handles review management, table rendering, and pagination

// ===== REVIEWS VARIABLES =====
let sellerReviews = [];
let sellerReviewsCurrentPage = 1;
let sellerReviewsTotalPages = 1;
let sellerReviewsPerPage = 10;
let sellerReviewsSearchQuery = '';
let sellerReviewsRatingFilter = '';
let sellerReviewsProductFilter = '';

// ===== REVIEWS FUNCTIONS =====
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
            page: sellerReviewsCurrentPage,
            limit: sellerReviewsPerPage
        };
        
        const response = await apiService.getReviews(queryParams);
        
        // Filter reviews to only show those for seller's products
        const allReviews = response?.data?.reviews || [];
        const sellerId = window.currentSellerId;
        
        // Get seller's products first
        const productsResponse = await apiService.getProducts({ seller_id: sellerId, limit: 100 });
        const sellerProducts = productsResponse?.data?.products || [];
        
        sellerReviews = allReviews.filter(review => {
            // Check if this review is for one of seller's products
            return sellerProducts.some(product => product.id === review.product_id);
        });
        
        if (response?.data?.pagination) {
            sellerReviewsTotalPages = response.data.pagination.totalPages || 1;
            sellerReviewsCurrentPage = response.data.pagination.currentPage || 1;
        }
        
        // Hide loading
        loading.classList.add('d-none');
        
        if (sellerReviews.length === 0) {
            emptyState.classList.remove('d-none');
        } else {
            tableContainer.classList.remove('d-none');
            renderSellerReviewsTable();
        }
        
    } catch (error) {
        loading.classList.add('d-none');
        showToast('Không thể tải danh sách đánh giá', 'error');
    }
}

function renderSellerReviewsTable() {
    const tbody = document.getElementById('sellerReviewsTableBody');
    const pagination = document.getElementById('sellerReviewsPagination');
    
    if (!tbody) return;
    
    // Filter reviews by search query, rating, and product
    let filteredReviews = sellerReviews;
    
    // Filter by search query
    if (sellerReviewsSearchQuery) {
        filteredReviews = filteredReviews.filter(review => 
            (review.comment && review.comment.toLowerCase().includes(sellerReviewsSearchQuery)) ||
            (review.username && review.username.toLowerCase().includes(sellerReviewsSearchQuery)) ||
            (review.product_name && review.product_name.toLowerCase().includes(sellerReviewsSearchQuery))
        );
    }
    
    // Filter by rating
    if (sellerReviewsRatingFilter && sellerReviewsRatingFilter.trim() !== '') {
        filteredReviews = filteredReviews.filter(review => review.rating == sellerReviewsRatingFilter);
    }
    
    // Filter by product
    if (sellerReviewsProductFilter && sellerReviewsProductFilter.trim() !== '') {
        filteredReviews = filteredReviews.filter(review => review.product_id == sellerReviewsProductFilter);
    }
    
    // Render table rows
    if (filteredReviews.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4 text-muted">
                    ${sellerReviewsSearchQuery || sellerReviewsRatingFilter || sellerReviewsProductFilter ? 'Không tìm thấy đánh giá phù hợp' : 'Chưa có đánh giá nào'}
                </td>
            </tr>
        `;
        pagination.classList.add('d-none');
        return;
    }
    
    tbody.innerHTML = filteredReviews.map((review, index) => {
        const globalIndex = (sellerReviewsCurrentPage - 1) * sellerReviewsPerPage + index + 1;
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
    
    if (sellerReviewsTotalPages > 1) {
        setupSellerReviewsPagination(sellerReviewsTotalPages);
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
    if (sellerReviewsCurrentPage > 1) {
        paginationHTML += `
            <li class="page-item">
                <a class="page-link" href="#" onclick="changeSellerReviewsPage(${sellerReviewsCurrentPage - 1})">Trước</a>
            </li>
        `;
    }
    
    // Page numbers
    const startPage = Math.max(1, sellerReviewsCurrentPage - 2);
    const endPage = Math.min(totalPages, sellerReviewsCurrentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <li class="page-item ${i === sellerReviewsCurrentPage ? 'active' : ''}">
                <a class="page-link" href="#" onclick="changeSellerReviewsPage(${i})">${i}</a>
            </li>
        `;
    }
    
    // Next button
    if (sellerReviewsCurrentPage < totalPages) {
        paginationHTML += `
            <li class="page-item">
                <a class="page-link" href="#" onclick="changeSellerReviewsPage(${sellerReviewsCurrentPage + 1})">Sau</a>
            </li>
        `;
    }
    
    paginationList.innerHTML = paginationHTML;
}

window.changeSellerReviewsPage = function(page) {
    if (page < 1 || page > sellerReviewsTotalPages) return;
    sellerReviewsCurrentPage = page;
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

// Load seller products for filter dropdown
async function loadSellerProductsForReviewFilter() {
    try {
        const sellerId = window.currentSellerId;
        if (!sellerId) {
            console.warn('Seller ID not found - user not logged in, retrying...');
            setTimeout(() => loadSellerProductsForReviewFilter(), 200);
            return;
        }
        
        const response = await apiService.getProducts({ seller_id: sellerId, limit: 100 });
        const products = response?.data?.products || [];
        
        const productFilter = document.getElementById('sellerReviewProductFilter');
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
window.loadSellerReviews = loadSellerReviews;
window.loadSellerProductsForReviewFilter = loadSellerProductsForReviewFilter;
