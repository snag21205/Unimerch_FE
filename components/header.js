// Header Component JavaScript
// Simple header component for all pages except index

document.addEventListener('DOMContentLoaded', function() {
    // Only load header if not on index page
    const currentPath = window.location.pathname;
    const isIndexPage = currentPath.endsWith('index.html') || currentPath === '/' || currentPath.endsWith('/');
    
    if (!isIndexPage) {
        loadHeaderComponent();
    }
});

// Load header component
function loadHeaderComponent() {
    // Determine the correct path to header component based on current page location
    const currentPath = window.location.pathname;
    let headerPath = '';
    
    if (currentPath.includes('/pages/')) {
        headerPath = '../../components/header.html';
    } else {
        // For other locations, adjust as needed
        headerPath = 'views/components/header.html';
    }
    
    fetch(headerPath)
        .then(response => response.text())
        .then(html => {
('Loading header component...');
            
            // Adjust paths based on current location
            if (!currentPath.includes('/pages/')) {
                // For non-pages locations, adjust paths
                html = html.replace(/\.\.\/\.\.\//g, '');
                html = html.replace(/\.\.\/auth\//g, 'views/pages/auth/');
                html = html.replace(/\.\.\/user\//g, 'views/pages/user/');
            }
            
            // Insert header at the beginning of body
            document.body.insertAdjacentHTML('afterbegin', html);
('Header component loaded successfully');
            
            // Initialize header functionality
            initializeHeader();
        })
        .catch(error => {
('Error loading header component:', error);
        });
}

// Initialize header functionality
function initializeHeader() {
('Initializing simple header...');
    
    // Setup navigation scroll effect
    setupScrollEffect();
    
    // Setup responsive navigation
    setupMobileNav();
    
('Header initialization complete');
}

// Handle scroll effect for navbar
function setupScrollEffect() {
    window.addEventListener('scroll', function() {
        const navbar = document.getElementById('mainNav');
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
    });
}

// Setup mobile navigation
function setupMobileNav() {
    // Bootstrap handles most of the mobile nav functionality
    // This is for any additional custom behavior if needed
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    
    if (navbarToggler && navbarCollapse) {
        // Close mobile menu when clicking on a link
        const navLinks = navbarCollapse.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                // Close mobile menu
                const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
                if (bsCollapse) {
                    bsCollapse.hide();
                }
            });
        });
    }
}

// Make header available globally for manual loading if needed
window.loadHeaderComponent = loadHeaderComponent;