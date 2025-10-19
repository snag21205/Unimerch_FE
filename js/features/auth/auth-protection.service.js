// Auth Protection Script
// Enhanced version with role-based access control

/**
 * Parse JWT token to get user information including role
 */
function parseJWTToken(token) {
    try {
        if (!token) return null;
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(atob(base64));
        return payload;
        } catch (error) {
            return null;
        }
}

/**
 * Get user role from token
 */
function getUserRole() {
    const token = localStorage.getItem('token');
    const tokenPayload = parseJWTToken(token);
    return tokenPayload?.role || 'user';
}

/**
 * Check if user is authenticated
 */
function isAuthenticated() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const token = localStorage.getItem('token');
    return isLoggedIn && token;
}

/**
 * Protect page based on required role
 * @param {string|array} allowedRoles - Single role or array of allowed roles
 */
function protectPage(allowedRoles) {
    // Check authentication
    if (!isAuthenticated()) {
        alert('Vui lòng đăng nhập để truy cập trang này');
        window.location.href = '/pages/auth/login.html';
        return false;
    }
    
    // Convert single role to array
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    
    // Get current user role
    const userRole = getUserRole();
    
    // Check if user has permission
    if (!roles.includes(userRole)) {
        alert(`Bạn không có quyền truy cập trang này. Yêu cầu quyền: ${roles.join(' hoặc ')}`);
        // Redirect based on user role
        switch(userRole) {
            case 'admin':
                window.location.href = '/pages/admin/admin.html';
                break;
            case 'seller':
                window.location.href = '/pages/seller/seller.html';
                break;
            default:
                window.location.href = '/index.html';
        }
        return false;
    }
    
    return true;
}

// Make functions available globally
window.protectPage = protectPage;
window.getUserRole = getUserRole;
window.isAuthenticated = isAuthenticated;