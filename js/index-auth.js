// Index Page Authentication Logic
// This handles auth display for the main index.html page

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication state for index page
    checkAuthState();
    updateCartUI();
    
    // Listen for storage changes
    window.addEventListener('storage', function(e) {
        if (e.key === 'isLoggedIn' || e.key === 'username') {
            checkAuthState();
        }
        if (e.key === 'ueh-cart') {
            updateCartUI();
        }
    });
});

// Authentication functions (based on app.js)
function checkAuthState() {
    const notLoggedIn = document.getElementById('notLoggedIn');
    const loggedIn = document.getElementById('loggedIn');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    if (isLoggedIn) {
        // User is logged in
        if (notLoggedIn) notLoggedIn.classList.add('d-none');
        if (loggedIn) loggedIn.classList.remove('d-none');
        
        // Update user info
        updateUserDisplay();
    } else {
        // User is not logged in
        if (notLoggedIn) notLoggedIn.classList.remove('d-none');
        if (loggedIn) loggedIn.classList.add('d-none');
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

// Update cart UI
function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    const cart = JSON.parse(localStorage.getItem('ueh-cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    if (cartCount) {
        if (totalItems > 0) {
            cartCount.textContent = totalItems;
            cartCount.classList.remove('d-none');
        } else {
            cartCount.classList.add('d-none');
        }
    }
}

// Logout function for index page
function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('ueh-user');
    localStorage.removeItem('ueh-profile');
    localStorage.removeItem('ueh-cart');
    
    // Refresh the page to update auth state
    window.location.reload();
}

// Language toggle function
function toggleLanguage(lang) {
    console.log('Language changed to:', lang);
    // Implement language switching logic here
}

// Make functions globally available
window.logout = logout;
window.toggleLanguage = toggleLanguage;