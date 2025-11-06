/**
 * Navbar Component
 * Reusable navbar component for UniMerch
 */

class NavbarComponent {
    constructor() {
        this.isInitialized = false;
        this.navbarElement = null;
    }

    /**
     * Initialize the navbar component
     * @param {string} containerId - ID of the container to insert navbar
     */
    async init(containerId = 'navbar-container') {
        if (this.isInitialized) return;

        try {
            // Load navbar HTML
            await this.loadNavbarHTML(containerId);
            
            // Initialize auth functionality
            this.initAuth();
            
            // Initialize scroll effects
            this.initScrollEffects();
            
            // Initialize cart functionality
            this.initCart();
            
            // Initialize dropdowns with proper config
            this.initDropdowns();
            
            this.isInitialized = true;
        } catch (error) {
            console.error('Failed to initialize navbar component:', error);
        }
    }

    /**
     * Get navbar HTML template (embedded to avoid fetch issues)
     */
    getNavbarHTML() {
        return `<!-- Navbar Component -->
<nav class="navbar navbar-expand-lg navbar-custom navbar-dark fixed-top" 
     id="mainNav"
     role="navigation"
     aria-label="Main navigation">
    <div class="container">
        <!-- Brand -->
        <a class="navbar-brand" href="#">UNIMERCH</a>
        
        <!-- Toggle button for mobile -->
        <button class="navbar-toggler border-0" 
                type="button" 
                data-bs-toggle="collapse" 
                data-bs-target="#navbarNav"
                aria-controls="navbarNav"
                aria-expanded="false"
                aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
        
        <!-- Navigation items -->
        <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav mx-auto">
                <li class="nav-item">
                    <a class="nav-link" href="#featured" aria-current="page">Trang chủ</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="pages/products/all-products.html">Tất cả sản phẩm</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="pages/user/orders.html">ĐƠN HÀNG</a>
                </li>
            </ul>
            
            <!-- Right side controls -->
            <div class="d-flex align-items-center gap-3">
               
                
                <!-- Cart Button -->
                <button class="btn btn-link p-0 border-0 position-relative" 
                        id="cartBtn" 
                        data-bs-toggle="offcanvas" 
                        data-bs-target="#cartOffcanvas"
                        aria-label="Giỏ hàng">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" 
                         stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <circle cx="8" cy="21" r="1"></circle>
                        <circle cx="19" cy="21" r="1"></circle>
                        <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57L20.5 9H5.12"></path>
                    </svg>
                    <span class="badge bg-white text-dark rounded-pill position-absolute top-0 start-100 translate-middle d-none" 
                          id="cartCount" 
                          style="font-weight: 600;"
                          aria-live="polite"
                          aria-atomic="true">0</span>
                </button>
                
                <!-- Auth Section -->
                <div id="authSection">
                    <!-- Not logged in state -->
                    <div id="notLoggedIn" class="d-flex align-items-center gap-2">
                        <a href="pages/user/profile.html" 
                           class="btn btn-link p-0 border-0" 
                           title="Profile"
                           aria-label="Trang cá nhân">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" 
                                 stroke="currentColor" stroke-width="2" aria-hidden="true">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                        </a>
                        <a href="pages/auth/login.html" 
                           class="btn btn-primary-custom btn-sm rounded-pill px-3" 
                           style="font-size: 14px; font-weight: 500;">
                            Đăng nhập
                        </a>
                    </div>
                    
                    <!-- Logged in state -->
                    <div id="loggedIn" class="d-none">
                        <div class="dropdown">
                            <button class="btn btn-link dropdown-toggle p-0 border-0 d-flex align-items-center gap-2" 
                                    type="button" 
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                    aria-haspopup="true"
                                    aria-label="Menu người dùng"
                                    style="color: var(--text-light);">
                                <div class="d-flex align-items-center justify-content-center rounded-circle" 
                                     style="width: 32px; height: 32px; background: var(--accent); color: white; font-size: 14px; font-weight: 600;" 
                                     id="userAvatar">
                                </div>
                                <span class="fw-medium d-none d-lg-inline" id="username" style="font-size: 14px;">User</span>
                            </button>
                            <ul class="dropdown-menu dropdown-menu-end shadow" style="min-width: 200px;">
                                <li>
                                    <div class="dropdown-header">
                                        <div class="fw-semibold" style="font-size: 14px;" id="userFullName">Chào mừng trở lại!</div>
                                        <small class="text-light" id="userEmail">user@ueh.edu.vn</small>
                                    </div>
                                </li>
                                <li><hr class="dropdown-divider"></li>
                                <!-- Dashboard link (shown for admin/seller only) -->
                                <li id="dashboardMenuItem" class="d-none">
                                    <a class="dropdown-item d-flex align-items-center gap-2" 
                                       href="#" 
                                       id="dashboardLink" 
                                       style="padding: 0.5rem 1rem; font-size: 14px;">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" 
                                             stroke="currentColor" stroke-width="2" aria-hidden="true">
                                            <rect x="3" y="3" width="7" height="7"></rect>
                                            <rect x="14" y="3" width="7" height="7"></rect>
                                            <rect x="14" y="14" width="7" height="7"></rect>
                                            <rect x="3" y="14" width="7" height="7"></rect>
                                        </svg>
                                        <span id="dashboardLinkText">Dashboard</span>
                                    </a>
                                </li>
                                <li id="dashboardDivider" class="d-none"><hr class="dropdown-divider"></li>
                                <li>
                                    <a class="dropdown-item d-flex align-items-center gap-2" 
                                       href="pages/user/profile.html" 
                                       style="padding: 0.5rem 1rem; font-size: 14px;">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" 
                                             stroke="currentColor" stroke-width="2" aria-hidden="true">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                            <circle cx="12" cy="7" r="4"></circle>
                                        </svg>
                                        Hồ sơ của tôi
                                    </a>
                                </li>
                                <li>
                                    <a class="dropdown-item d-flex align-items-center gap-2" 
                                       href="pages/user/orders.html" 
                                       style="padding: 0.5rem 1rem; font-size: 14px;">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" 
                                             stroke="currentColor" stroke-width="2" aria-hidden="true">
                                            <circle cx="8" cy="21" r="1"></circle>
                                            <circle cx="19" cy="21" r="1"></circle>
                                            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57L20.5 9H5.12"></path>
                                        </svg>
                                        Đơn hàng của tôi
                                    </a>
                                </li>
                                <li><hr class="dropdown-divider"></li>
                                <li>
                                    <button class="dropdown-item d-flex align-items-center gap-2 text-secondary" 
                                            onclick="logout()" 
                                            style="padding: 0.5rem 1rem; font-size: 14px; border: none; background: none; width: 100%; text-align: left;">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" 
                                             stroke="currentColor" stroke-width="2" aria-hidden="true">
                                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                            <polyline points="16,17 21,12 16,7"></polyline>
                                            <line x1="21" y1="12" x2="9" y2="12"></line>
                                        </svg>
                                        Đăng xuất
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</nav>`;
    }

    /**
     * Load navbar HTML from component file
     */
    async loadNavbarHTML(containerId) {
        try {
            // Use embedded HTML template instead of fetching
            let html = this.getNavbarHTML();
            
            // Fix navigation links based on current path
            html = this.fixNavigationLinks(html);
            
            // Insert navbar HTML
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = html;
                this.navbarElement = container.querySelector('#mainNav');
            } else {
                // If no container specified, insert at the beginning of body
                document.body.insertAdjacentHTML('afterbegin', html);
                this.navbarElement = document.querySelector('#mainNav');
            }
            
            // Hide cart button if not on allowed pages (after DOM insertion)
            this.hideCartButtonIfNeeded();
        } catch (error) {
            console.error('Failed to load navbar HTML:', error);
            throw error;
        }
    }
    
    /**
     * Fix navigation links based on current page location
     */
    fixNavigationLinks(html) {
        const currentPath = window.location.pathname;
        const isInSubfolder = currentPath.includes('/pages/');
        
        if (isInSubfolder) {
            // Determine depth - how many levels deep are we?
            const pathParts = currentPath.split('/').filter(p => p);
            const depth = pathParts.indexOf('pages');
            const prefix = depth >= 0 ? '../../' : '';
            
            // Fix all navigation links
            html = html.replace(/href="pages\//g, `href="${prefix}pages/`);
            html = html.replace(/href="#featured"/g, `href="${prefix}index.html#featured"`);
            
            // Fix brand link specifically (don't touch cart offcanvas links)
            html = html.replace(/<a class="navbar-brand" href="#">/g, `<a class="navbar-brand" href="${prefix}index.html">`);
        }
        
        return html;
    }
    
    /**
     * Hide cart button if not on allowed pages (DOM manipulation)
     */
    hideCartButtonIfNeeded() {
        const currentPath = window.location.pathname;
        const currentPage = currentPath.split('/').pop() || 'index.html';
        
        // Allowed pages: index.html, all-products.html
        const allowedPages = ['index.html', 'all-products.html'];
        const isAllowedPage = allowedPages.includes(currentPage) || 
                             currentPath.endsWith('/') || 
                             currentPath === '/' ||
                             currentPath.includes('/index.html') ||
                             currentPath.includes('/all-products.html');
        
        const cartBtn = document.getElementById('cartBtn');
        if (cartBtn) {
            if (!isAllowedPage) {
                cartBtn.style.display = 'none';
            } else {
                cartBtn.style.display = '';
            }
        }
    }

    /**
     * Initialize Bootstrap dropdowns with proper configuration
     */
    initDropdowns() {
        // Wait for Bootstrap to be loaded and DOM to be ready
        const initDropdownsInternal = () => {
            // Check if Bootstrap is available
            if (typeof bootstrap === 'undefined' || !bootstrap.Dropdown) {
                console.warn('Bootstrap not loaded yet, retrying dropdown initialization...');
                setTimeout(initDropdownsInternal, 100);
                return;
            }

            // Find dropdown within the navbar to avoid conflicts
            const navbar = document.getElementById('mainNav');
            if (!navbar) {
                console.warn('Navbar not found');
                setTimeout(initDropdownsInternal, 100);
                return;
            }

            const dropdownElementList = navbar.querySelectorAll('.dropdown-toggle');
            
            if (dropdownElementList.length === 0) {
                // Check if loggedIn div is visible - if not, wait for it
                const loggedInDiv = document.getElementById('loggedIn');
                if (loggedInDiv && loggedInDiv.classList.contains('d-none')) {
                    setTimeout(initDropdownsInternal, 200);
                    return;
                }
                
                console.warn('No dropdown elements found in navbar');
                setTimeout(initDropdownsInternal, 200);
                return;
            }
            
            dropdownElementList.forEach((dropdownToggleEl) => {
                // Check if dropdown is already initialized
                const existingInstance = bootstrap.Dropdown.getInstance(dropdownToggleEl);
                if (existingInstance) {
                    // Dispose existing instance before re-initializing
                    existingInstance.dispose();
                }
                
                try {
                    // Initialize each dropdown - use simpler config for better compatibility
                    const dropdownInstance = new bootstrap.Dropdown(dropdownToggleEl);
                    
                } catch (error) {
                    console.error('❌ Error initializing dropdown:', error);
                    // Fallback: try using data attributes only (Bootstrap auto-init)
                    console.log('Trying fallback: using data attributes only...');
                    dropdownToggleEl.setAttribute('data-bs-toggle', 'dropdown');
                }
            });
            
        };

        // Start initialization after a short delay to ensure DOM is ready
        setTimeout(initDropdownsInternal, 300);
        
        // Also set up a MutationObserver to watch for loggedIn div visibility changes
        const loggedInDiv = document.getElementById('loggedIn');
        if (loggedInDiv && typeof MutationObserver !== 'undefined') {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                        const target = mutation.target;
                        if (target.id === 'loggedIn' && !target.classList.contains('d-none')) {
                            setTimeout(initDropdownsInternal, 100);
                        }
                    }
                });
            });
            
            observer.observe(loggedInDiv, {
                attributes: true,
                attributeFilter: ['class']
            });
        }
    }

    /**
     * Initialize authentication functionality
     */
    initAuth() {
        // Wait for DOM to be ready
        setTimeout(() => {
            // Check if auth scripts are loaded
            if (typeof checkAuthState === 'function') {
                checkAuthState();
            } else {
                // Fallback auth check
                this.checkAuthStateFallback();
            }
            
            // Force update display
            setTimeout(() => {
                if (typeof updateUserDisplay === 'function') {
                    updateUserDisplay();
                } else {
                    this.updateUserDisplay();
                }
                
                // Force update dashboard link
                if (typeof updateDashboardLink === 'function') {
                    updateDashboardLink();
                }
                
                // Re-initialize dropdowns after auth state update
                this.initDropdowns();
            }, 100);
        }, 100);

        // Listen for auth state changes
        window.addEventListener('user-logged-in', () => {
            if (typeof checkAuthState === 'function') {
                checkAuthState();
            }
            setTimeout(() => {
                if (typeof updateUserDisplay === 'function') {
                    updateUserDisplay();
                }
                if (typeof updateDashboardLink === 'function') {
                    updateDashboardLink();
                }
                // Re-initialize dropdowns after auth state update
                this.initDropdowns();
            }, 100);
        });

        window.addEventListener('user-logged-out', () => {
            if (typeof checkAuthState === 'function') {
                checkAuthState();
            }
        });
    }

    /**
     * Fallback auth state check
     */
    checkAuthStateFallback() {
        const notLoggedIn = document.getElementById('notLoggedIn');
        const loggedIn = document.getElementById('loggedIn');
        const token = localStorage.getItem('token');
        
        if (token) {
            if (notLoggedIn) notLoggedIn.classList.add('d-none');
            if (loggedIn) loggedIn.classList.remove('d-none');
            this.updateUserDisplay();
        } else {
            if (notLoggedIn) notLoggedIn.classList.remove('d-none');
            if (loggedIn) loggedIn.classList.add('d-none');
        }
    }

    /**
     * Update user display information
     */
    updateUserDisplay() {
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
            const emailText = userEmail || `${username.toLowerCase()}@ueh.edu.vn`;
            userEmailElement.textContent = emailText;
        }
    }

    /**
     * Initialize scroll effects
     */
    initScrollEffects() {
        const navbar = this.navbarElement;
        if (!navbar) return;

        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    /**
     * Initialize cart functionality
     */
    initCart() {
        // Update cart count if cart service is available
        if (window.cartService) {
            this.updateCartCount();
            
            // Listen for cart updates
            window.addEventListener('cart-updated', () => {
                this.updateCartCount();
            });
        }
    }

    /**
     * Update cart count display
     */
    updateCartCount() {
        const cartCount = document.getElementById('cartCount');
        if (!cartCount || !window.cartService) return;

        const cartData = window.cartService.getCart();
        const totalItems = cartData.summary ? cartData.summary.total_items : 0;
        
        if (totalItems > 0) {
            cartCount.textContent = totalItems;
            cartCount.classList.remove('d-none');
        } else {
            cartCount.classList.add('d-none');
        }
    }

    /**
     * Update navigation links based on current page
     */
    updateNavigationLinks() {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            
            // Remove active class from all links
            link.classList.remove('active');
            
            // Add active class to current page link
            if (href === currentPath || 
                (href === '#featured' && currentPath.includes('index.html')) ||
                (href === '#about' && currentPath.includes('landing_page.html'))) {
                link.classList.add('active');
            }
        });
    }

    /**
     * Destroy the navbar component
     */
    destroy() {
        if (this.navbarElement) {
            this.navbarElement.remove();
        }
        this.isInitialized = false;
    }
}

// Create global instance
window.navbarComponent = new NavbarComponent();

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize navbar component
    window.navbarComponent.init();
    
    // Update navigation links
    setTimeout(() => {
        window.navbarComponent.updateNavigationLinks();
    }, 100);
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavbarComponent;
}
