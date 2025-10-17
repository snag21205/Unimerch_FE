async function logout() {
    try {
        // Use ApiService for logout
        if (window.apiService) {
            const response = await window.apiService.logout();
            
            // Show success message if API call succeeded
            if (response && response.success) {
                alert(response.message || 'Đăng xuất thành công!');
            } else {
                alert('Đăng xuất thành công!');
            }
        } else {
            // Fallback: manual token removal if apiService not available
            localStorage.removeItem('authToken');
            alert('Đăng xuất thành công!');
        }
    } catch (error) {
        console.warn('Logout failed:', error);
        // Still clear local data even if API fails
        localStorage.removeItem('authToken');
        alert('Đăng xuất thành công!');
    }

    // Clear all local data (apiService.logout() already removes token)
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userInfo');

    // Update UI
    if (typeof checkAuthState === 'function') {
        checkAuthState();
    }

    // Redirect to home
    window.location.href = '../../index.html';
}