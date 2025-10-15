// Index Page Authentication Logic
// This handles auth display for the main index.html page

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication state for index page
    checkAuthState();
    
    // Listen for storage changes
    window.addEventListener('storage', function(e) {
        if (e.key === 'isLoggedIn' || e.key === 'username' || e.key === 'token') {
            checkAuthState();
        }
    });
    
    // Listen for auth state changes to handle cart sync
    // This will be called when user logs in
    window.addEventListener('user-logged-in', function() {
        if (window.cartService) {
            cartService.handleUserLogin();
        }
    });
    
    // This will be called when user logs out
    window.addEventListener('user-logged-out', function() {
        if (window.cartService) {
            cartService.handleUserLogout();
        }
    });
});

// Authentication functions (based on app.js)
function checkAuthState() {
    const notLoggedIn = document.getElementById('notLoggedIn');
    const loggedIn = document.getElementById('loggedIn');
    const isLoggedIn = apiService && apiService.isAuthenticated();
    
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