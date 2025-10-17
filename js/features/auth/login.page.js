// Function to handle sign in
async function handleSignIn() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Validate input
    if (!username || !password) {
        alert('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu');
        return;
    }
    
    try {
        // Use API service for login
        const data = await apiService.login({
            email: username,
            password: password
        });
        
        // Store auth token using API service
        if (data.data && data.data.token) {
            apiService.setToken(data.data.token);
        }
        
        // Store user info from API response (data.data.user)
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userInfo', JSON.stringify(data.data.user || { email: username }));
        localStorage.setItem('username', data.data.user?.fullName || data.data.user?.username || username);
        localStorage.setItem('userEmail', data.data.user?.email || username);
        
        // Dispatch login event for cart sync
        window.dispatchEvent(new CustomEvent('user-logged-in', {
            detail: data.data.user
        }));
        
        // Get user role and redirect accordingly
        const userRole = data.data.user?.role || 'user';
        let redirectUrl = '../../index.html';
        
        switch(userRole) {
            case 'admin':
                redirectUrl = '../admin/admin.html';
                alert('Đăng nhập thành công! Chào mừng Admin!');
                break;
            case 'seller':
                redirectUrl = '../seller/seller.html';
                alert('Đăng nhập thành công! Chào mừng Người bán!');
                break;
            default:
                redirectUrl = '../../index.html';
                alert('Đăng nhập thành công! Chào mừng trở lại!');
        }
        
        window.location.href = redirectUrl;
    } catch (error) {
        console.error('Error during login:', error);
        alert('Đăng nhập thất bại: ' + error.message);
    }
}

// Form validation and submission
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    handleSignIn();
});

// Toggle password visibility
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
}

