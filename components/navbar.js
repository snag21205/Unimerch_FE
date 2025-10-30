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
            console.log('Navbar component initialized successfully');
        } catch (error) {
            console.error('Failed to initialize navbar component:', error);
        }
    }

    /**
     * Load navbar HTML from component file
     */
    async loadNavbarHTML(containerId) {
        try {
            // Determine the correct path based on current location
            const currentPath = window.location.pathname;
            let navbarPath = 'components/navbar.html';
            
            // If we're in a subdirectory, adjust the path
            if (currentPath.includes('/pages/')) {
                navbarPath = '../../components/navbar.html';
            }
            
            const response = await fetch(navbarPath);
            let html = await response.text();
            
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
            html = html.replace(/href="#about"/g, `href="${prefix}index.html#about"`);
            html = html.replace(/href="#"/g, `href="${prefix}index.html"`);
            
            // Fix brand link (without hash)
            html = html.replace(/<a class="navbar-brand" href="#">/g, `<a class="navbar-brand" href="${prefix}index.html">`);
        }
        
        return html;
    }

    /**
     * Initialize Bootstrap dropdowns with proper configuration
     */
    initDropdowns() {
        // Wait for DOM to be fully ready
        setTimeout(() => {
            const dropdownElementList = document.querySelectorAll('.dropdown-toggle');
            
            dropdownElementList.forEach((dropdownToggleEl) => {
                // Initialize each dropdown with custom config
                new bootstrap.Dropdown(dropdownToggleEl, {
                    popperConfig: function(defaultBsPopperConfig) {
                        // Modify default config to use fixed strategy
                        return {
                            ...defaultBsPopperConfig,
                            strategy: 'fixed',
                            modifiers: [
                                ...(defaultBsPopperConfig.modifiers || []),
                                {
                                    name: 'offset',
                                    options: {
                                        offset: [0, 8]
                                    }
                                },
                                {
                                    name: 'preventOverflow',
                                    options: {
                                        boundary: 'viewport'
                                    }
                                }
                            ]
                        };
                    }
                });
            });
            
            console.log('Dropdowns initialized with custom config');
        }, 200);
    }

    /**
     * Initialize authentication functionality
     */
    initAuth() {
        // Check if auth scripts are loaded
        if (typeof checkAuthState === 'function') {
            checkAuthState();
        } else {
            // Fallback auth check
            this.checkAuthStateFallback();
        }

        // Listen for auth state changes
        window.addEventListener('user-logged-in', () => {
            if (typeof checkAuthState === 'function') {
                checkAuthState();
            }
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
            userEmailElement.textContent = userEmail || `${username.toLowerCase()}@ueh.edu.vn`;
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
