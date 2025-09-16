async function logout() {
    try {
        const token = localStorage.getItem('authToken');
        
        if (token) {
            // Try to logout via API
            const response = await fetch('https://api.unimerch.space/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                console.warn('Server logout failed, but continuing with local logout');
            }
        }
    } catch (error) {
        console.warn('Logout API call failed:', error);
        // Continue with local logout even if server call fails
    }

    // Always clear local data regardless of server response
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('authToken');

    // Update UI
    if (typeof checkAuthState === 'function') {
        checkAuthState();
    }

    // Show success message and redirect
    alert('Logged out successfully!');
    window.location.href = '../../index.html';
}