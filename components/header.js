// Header Component JavaScript
// Handle authentication state display in header

document.addEventListener('DOMContentLoaded', function() {
    // Load header component first
    loadHeaderComponent();
});

// Load header component
function loadHeaderComponent() {
    // Determine the correct path to header component based on current page location
    const currentPath = window.location.pathname;
    let headerPath = '';
    let isIndexPage = false;
    
    if (currentPath.includes('/pages/')) {
        headerPath = '../../components/header.html';
    } else {
        // This is index page
        headerPath = 'components/header.html';
        isIndexPage = true;
    }
    
    fetch(headerPath)
        .then(response => response.text())
        .then(html => {
            console.log('Original HTML length:', html.length);
            
            if (isIndexPage) {
                // For index page, adjust the paths in the header HTML
                html = html.replace(/\.\.\/\.\.\//g, '');  // Remove relative path prefixes
                html = html.replace(/\.\.\/auth\//g, 'pages/auth/');
                html = html.replace(/\.\.\/user\//g, 'pages/user/');
                console.log('Applied index page path replacements');
            }
            
            console.log('Final HTML length:', html.length);
            console.log('HTML contains loggedIn:', html.includes('id="loggedIn"'));
            
            // Insert header at the beginning of body
            document.body.insertAdjacentHTML('afterbegin', html);
            console.log('Header HTML inserted into DOM');
            
            // Check if elements were inserted
            setTimeout(() => {
                const loggedIn = document.getElementById('loggedIn');
                const notLoggedIn = document.getElementById('notLoggedIn');
                console.log('Post-insertion check:', {
                    loggedIn: !!loggedIn,
                    notLoggedIn: !!notLoggedIn
                });
            }, 50);
            
            // Initialize header functionality after loading
            initializeHeader();
        })
        .catch(error => {
            console.error('Error loading header component:', error);
        });
}

// Initialize header functionality
function initializeHeader() {
    // Add delay to ensure DOM is ready
    setTimeout(() => {
        console.log('Initializing header...');
        
        // Check and fix auth elements first
        const loggedIn = document.getElementById('loggedIn');
        if (!loggedIn) {
            console.log('loggedIn element missing during init, fixing...');
            fixAuthElements();
        }
        
        updateAuthDisplay();
        setupEventListeners();
        updateCartUI();
        
        // Debug: Check if elements exist
        const notLoggedIn = document.getElementById('notLoggedIn');
        const loggedInCheck = document.getElementById('loggedIn');
        console.log('Elements found after init:', {
            notLoggedIn: !!notLoggedIn,
            loggedIn: !!loggedInCheck
        });
        
    }, 100);
}

// Fix missing auth elements during initialization
function fixAuthElements() {
    const authSection = document.getElementById('authSection');
    if (authSection && !authSection.querySelector('#loggedIn')) {
        console.log('Adding missing loggedIn element during initialization...');
        const loggedInHTML = `
            <div id="loggedIn" class="d-none">
                <a href="../user/profile.html" class="btn btn-link p-0 border-0 d-flex align-items-center gap-2 text-decoration-none logged-in-btn" style="color: #374151;">
                    <div class="d-flex align-items-center justify-content-center rounded-circle" style="
                        width: 32px; 
                        height: 32px; 
                        background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
                        color: white;
                        font-size: 14px;
                        font-weight: 600;
                    " id="userAvatar">
                        U
                    </div>
                    <span class="fw-medium d-none d-lg-inline" id="username" style="font-size: 14px;">User</span>
                </a>
            </div>
        `;
        authSection.insertAdjacentHTML('beforeend', loggedInHTML);
        console.log('loggedIn element added automatically');
    }
}

// Update authentication display based on login status (based on app.js logic)
function updateAuthDisplay() {
    const notLoggedIn = document.getElementById('notLoggedIn');
    const loggedIn = document.getElementById('loggedIn');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    console.log('Header - Auth State Check:', {
        isLoggedIn: isLoggedIn,
        username: localStorage.getItem('username'),
        notLoggedInElement: !!notLoggedIn,
        loggedInElement: !!loggedIn,
        notLoggedInClasses: notLoggedIn ? notLoggedIn.className : 'Not found',
        loggedInClasses: loggedIn ? loggedIn.className : 'Not found',
        allElementsWithAuthIds: {
            notLoggedInById: document.querySelector('#notLoggedIn'),
            loggedInById: document.querySelector('#loggedIn'),
            authSection: document.querySelector('#authSection')
        }
    });
    
    if (!notLoggedIn || !loggedIn) {
        console.error('Auth elements not found! Elements in DOM:');
        const allDivs = document.querySelectorAll('div[id*="logged"]');
        console.log('Divs with "logged" in ID:', allDivs);
        
        // Try one more time with longer delay
        const retryCount = window.authRetryCount || 0;
        if (retryCount < 5) {
            window.authRetryCount = retryCount + 1;
            console.log(`Retry attempt ${retryCount + 1}/5`);
            setTimeout(() => {
                updateAuthDisplay();
            }, 500);
        } else {
            console.error('Max retries reached. Auth elements still not found.');
        }
        return;
    }
    
    // Reset retry counter
    window.authRetryCount = 0;
    
    if (isLoggedIn) {
        // User is logged in
        notLoggedIn.classList.add('d-none');
        loggedIn.classList.remove('d-none');
        console.log('Showing logged in state');
        
        // Update user info
        updateUserDisplay();
    } else {
        // User is not logged in
        notLoggedIn.classList.remove('d-none');
        loggedIn.classList.add('d-none');
        console.log('Showing not logged in state');
    }
}

// Update user display (based on app.js logic)
function updateUserDisplay() {
    const username = localStorage.getItem('username');
    const userEmail = localStorage.getItem('userEmail');
    
    console.log('Updating user display:', { username, userEmail });
    
    if (!username) {
        console.warn('No username found in localStorage');
        return;
    }
    
    // Update avatar
    const userAvatar = document.getElementById('userAvatar');
    if (userAvatar) {
        const firstLetter = username.charAt(0).toUpperCase();
        userAvatar.textContent = firstLetter;
        console.log('Updated avatar to:', firstLetter);
    } else {
        console.error('userAvatar element not found!');
    }
    
    // Update username
    const usernameElement = document.getElementById('username');
    if (usernameElement) {
        usernameElement.textContent = username;
        console.log('Updated username to:', username);
    } else {
        console.error('username element not found!');
    }
}

// Setup event listeners for header functionality
function setupEventListeners() {
    // Navigation scroll effect
    window.addEventListener('scroll', handleScroll);
    
    // Cart button click
    const cartBtn = document.getElementById('cartBtn');
    if (cartBtn) {
        cartBtn.addEventListener('click', function() {
            // Handle cart button click
            console.log('Cart button clicked');
        });
    }
    
    // Search button click
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            // Handle search button click
            console.log('Search button clicked');
        });
    }
}

// Handle scroll effect for navbar
function handleScroll() {
    const navbar = document.getElementById('mainNav');
    if (navbar) {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
}

// Update cart UI (based on app.js logic)
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

// Logout function (global function that can be called from HTML)
function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('ueh-user');
    localStorage.removeItem('ueh-profile');
    localStorage.removeItem('ueh-cart');
    
    // Redirect to home page - adjust path based on current location
    const currentPath = window.location.pathname;
    if (currentPath.includes('/pages/')) {
        window.location.href = '../../index.html';
    } else {
        window.location.href = 'index.html';
    }
}

// Language toggle function (if needed)
function toggleLanguage(lang) {
    // Language toggle functionality
    console.log('Language changed to:', lang);
    // You can implement language switching logic here
}

// Listen for storage changes (when user logs in from another tab)
window.addEventListener('storage', function(e) {
    if (e.key === 'isLoggedIn' || e.key === 'username') {
        updateAuthDisplay();
    }
    if (e.key === 'ueh-cart') {
        updateCartUI();
    }
});

// Make functions globally available
window.logout = logout;
window.toggleLanguage = toggleLanguage;

// Debug function to test login state
window.testLogin = function() {
    console.log('Testing login...');
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('username', 'Test User');
    localStorage.setItem('userEmail', 'test@ueh.edu.vn');
    
    // Ensure elements exist first
    const loggedIn = document.getElementById('loggedIn');
    if (!loggedIn) {
        console.log('loggedIn missing, fixing first...');
        fixAuthElements();
    }
    
    // Force update
    setTimeout(() => {
        updateAuthDisplay();
        console.log('Login test complete - check if avatar is visible');
    }, 100);
};

window.testLogout = function() {
    console.log('Testing logout...');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    localStorage.removeItem('userEmail');
    
    // Force update
    setTimeout(() => {
        updateAuthDisplay();
    }, 100);
    
    console.log('Test user logged out');
};

// Debug function to check current state
window.checkHeader = function() {
    console.log('=== Header Debug ===');
    const notLoggedIn = document.getElementById('notLoggedIn');
    const loggedIn = document.getElementById('loggedIn');
    const userAvatar = document.getElementById('userAvatar');
    const username = document.getElementById('username');
    
    console.log('Elements:', {
        notLoggedIn: !!notLoggedIn,
        loggedIn: !!loggedIn,
        userAvatar: !!userAvatar,
        username: !!username
    });
    
    console.log('localStorage:', {
        isLoggedIn: localStorage.getItem('isLoggedIn'),
        username: localStorage.getItem('username'),
        userEmail: localStorage.getItem('userEmail')
    });
    
    if (loggedIn) {
        console.log('loggedIn classes:', loggedIn.className);
        console.log('loggedIn visible:', !loggedIn.classList.contains('d-none'));
    }
    
    // Show all elements with auth-related IDs
    const authElements = document.querySelectorAll('[id*="logged"], [id*="auth"], [id*="user"]');
    console.log('All auth-related elements:', authElements);
};

// Manual fix function
window.fixAuth = function() {
    console.log('Attempting to fix auth display...');
    
    // First check if elements exist
    let notLoggedIn = document.getElementById('notLoggedIn');
    let loggedIn = document.getElementById('loggedIn');
    
    console.log('Current state:', {
        notLoggedIn: !!notLoggedIn,
        loggedIn: !!loggedIn,
        authSection: !!document.getElementById('authSection')
    });
    
    if (!loggedIn) {
        console.log('loggedIn element missing, checking auth section content...');
        const authSection = document.getElementById('authSection');
        if (authSection) {
            console.log('Auth section HTML:', authSection.innerHTML.substring(0, 200));
            
            // Try to manually add the loggedIn element if missing
            if (!authSection.querySelector('#loggedIn')) {
                console.log('Adding missing loggedIn element...');
                const loggedInHTML = `
                    <div id="loggedIn" class="d-none">
                        <a href="../user/profile.html" class="btn btn-link p-0 border-0 d-flex align-items-center gap-2 text-decoration-none logged-in-btn" style="color: #374151;">
                            <div class="d-flex align-items-center justify-content-center rounded-circle" style="
                                width: 32px; 
                                height: 32px; 
                                background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
                                color: white;
                                font-size: 14px;
                                font-weight: 600;
                            " id="userAvatar">
                                U
                            </div>
                            <span class="fw-medium d-none d-lg-inline" id="username" style="font-size: 14px;">User</span>
                        </a>
                    </div>
                `;
                authSection.insertAdjacentHTML('beforeend', loggedInHTML);
                console.log('Added loggedIn element manually');
                
                // Retry auth display
                setTimeout(() => {
                    updateAuthDisplay();
                }, 100);
                return;
            }
        } else {
            console.log('Auth section not found - header may not be loaded');
            // Try to reload header
            setTimeout(() => {
                loadHeaderComponent();
            }, 100);
            return;
        }
    }
    
    // Force show logged in state
    if (localStorage.getItem('isLoggedIn') === 'true') {
        if (notLoggedIn) notLoggedIn.classList.add('d-none');
        if (loggedIn) {
            loggedIn.classList.remove('d-none');
            console.log('Manually showed logged in element');
        }
        updateUserDisplay();
    }
};