// Index Page Authentication Logic
// This handles auth display for the main index.html page

/**
 * Parse JWT token to get user role
 */
function parseJWTToken(token) {
    try {
        if (!token) return null;
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(atob(base64));
        return payload;
    } catch (error) {
        console.error('Error parsing JWT token:', error);
        return null;
    }
}

/**
 * Update dashboard link based on user role
 */
function updateDashboardLink() {
    const token = localStorage.getItem('token');
    
    if (!token) return;
    
    const tokenPayload = parseJWTToken(token);
    const userRole = tokenPayload?.role || 'user';
    
    const dashboardMenuItem = document.getElementById('dashboardMenuItem');
    const dashboardDivider = document.getElementById('dashboardDivider');
    const dashboardLink = document.getElementById('dashboardLink');
    const dashboardLinkText = document.getElementById('dashboardLinkText');
    
    if (!dashboardMenuItem || !dashboardLink) {
        return;
    }
    
    // Only show for admin and seller
    if (userRole === 'admin') {
        dashboardMenuItem.classList.remove('d-none');
        if (dashboardDivider) dashboardDivider.classList.remove('d-none');
        
        // Check if we're in all-products page and adjust path accordingly
        const currentPath = window.location.pathname;
        if (currentPath.includes('all-products.html')) {
            dashboardLink.href = '../../pages/admin/admin.html';
        } else {
            dashboardLink.href = 'pages/admin/admin.html';
        }
        
        if (dashboardLinkText) dashboardLinkText.textContent = '👨‍💼 Trang Quản Trị';
    } else if (userRole === 'seller') {
        dashboardMenuItem.classList.remove('d-none');
        if (dashboardDivider) dashboardDivider.classList.remove('d-none');
        
        // Check if we're in all-products page and adjust path accordingly
        const currentPath = window.location.pathname;
        if (currentPath.includes('all-products.html')) {
            dashboardLink.href = '../../pages/seller/seller.html';
        } else {
            dashboardLink.href = 'pages/seller/seller.html';
        }
        
        if (dashboardLinkText) dashboardLinkText.textContent = '🏪 Trang Người Bán';
    } else {
        // Hide for regular users
        dashboardMenuItem.classList.add('d-none');
        if (dashboardDivider) dashboardDivider.classList.add('d-none');
    }
}

function updateUserDisplay() {
    const username = localStorage.getItem('username');
    const userEmail = localStorage.getItem('userEmail');
    
    if (!username) return;
    
    // Update avatar
    const userAvatar = document.getElementById('userAvatar');
    if (userAvatar) {
        const firstLetter = username.charAt(0).toUpperCase();
        userAvatar.textContent = firstLetter;
    }
    
    // Update username
    const usernameElement = document.getElementById('username');
    if (usernameElement) {
        usernameElement.textContent = username;
    }
    
    // Update full name and email in dropdown
    const userFullName = document.getElementById('userFullName');
    if (userFullName) {
        userFullName.textContent = `Welcome back, ${username}!`;
    }
    
    const userEmailElement = document.getElementById('userEmail');
    if (userEmailElement) {
        userEmailElement.textContent = userEmail || `${username.toLowerCase()}@ueh.edu.vn`;
    }
    
    // Show dashboard link for admin/seller
    updateDashboardLink();
    
    // Retry after a short delay if elements not found (DOM might not be ready)
    setTimeout(() => {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const tokenPayload = parseJWTToken(token);
        const userRole = tokenPayload?.role || 'user';
        
        // Only retry if user is admin/seller and dashboard menu is not visible
        if ((userRole === 'admin' || userRole === 'seller')) {
            const dashboardMenuItem = document.getElementById('dashboardMenuItem');
            if (!dashboardMenuItem || dashboardMenuItem.classList.contains('d-none')) {
                updateDashboardLink();
            }
        }
    }, 100);
}

// Authentication functions (based on app.js)
function checkAuthState() {
    const notLoggedIn = document.getElementById('notLoggedIn');
    const loggedIn = document.getElementById('loggedIn');
    
    // Check if apiService is available
    if (typeof apiService === 'undefined' || !apiService) {
        return;
    }
    
    const isLoggedIn = apiService.isAuthenticated();
    
    if (isLoggedIn) {
        // User is logged in
        if (notLoggedIn) notLoggedIn.classList.add('d-none');
        if (loggedIn) loggedIn.classList.remove('d-none');
        
        // Update user info
        updateUserDisplay();
        
        // Sync cart if cart service is available
        if (window.cartService && !cartService.isLoaded) {
            cartService.init();
        }
    } else {
        // User is not logged in
        if (notLoggedIn) notLoggedIn.classList.remove('d-none');
        if (loggedIn) loggedIn.classList.add('d-none');
        
        // Still initialize cart service for guest users
        if (window.cartService && !cartService.isLoaded) {
            cartService.init();
        }
    }
}

// Update cart UI (now delegated to cart service)
function updateCartUI() {
    // This function is now handled by cart service
    // Keep for backward compatibility
    if (window.cartService) {
        const cartData = cartService.getCart();
        const cartCount = document.getElementById('cartCount');
        
        if (cartCount) {
            const totalItems = cartData.summary ? cartData.summary.total_items : 0;
            if (totalItems > 0) {
                cartCount.textContent = totalItems;
                cartCount.classList.remove('d-none');
            } else {
                cartCount.classList.add('d-none');
            }
        }
    }
}

// Logout function for index page
function logout() {
    // Use API service logout if available
    if (window.apiService) {
        apiService.logout().catch(error => {
            console.warn('API logout failed:', error);
        });
    }
    
    // Clear local storage
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('ueh-user');
    localStorage.removeItem('ueh-profile');
    localStorage.removeItem('token');
    
    // Handle cart logout
    if (window.cartService) {
        cartService.handleUserLogout();
    }
    
    // Dispatch logout event
    window.dispatchEvent(new CustomEvent('user-logged-out'));
    
    // Refresh the page to update auth state
    window.location.reload();
}

// Make functions globally available
window.logout = logout;
window.checkAuthState = checkAuthState;
window.updateUserDisplay = updateUserDisplay;
window.updateDashboardLink = updateDashboardLink;

// Set up event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication state for index page
    checkAuthState();
    
    // Also retry after a delay to ensure everything is loaded
    setTimeout(() => {
        checkAuthState();
    }, 200);
    
    // Listen for storage changes
    window.addEventListener('storage', function(e) {
        if (e.key === 'isLoggedIn' || e.key === 'username' || e.key === 'token') {
            checkAuthState();
        }
    });
    
    // Listen for auth state changes to handle cart sync
    window.addEventListener('user-logged-in', function() {
        if (window.cartService) {
            cartService.handleUserLogin();
        }
        checkAuthState();
    });
    
    window.addEventListener('user-logged-out', function() {
        if (window.cartService) {
            cartService.handleUserLogout();
        }
        checkAuthState();
    });
});
