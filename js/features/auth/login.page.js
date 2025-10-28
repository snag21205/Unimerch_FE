/**
 * Login Page Logic
 * Handles form validation and user authentication with real-time feedback
 */

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    
    // Add real-time username validation
    if (usernameInput) {
        usernameInput.addEventListener('input', function() {
            validateUsernameRealTime();
        });
    }
    
    // Add real-time password validation
    if (passwordInput) {
        passwordInput.addEventListener('input', validatePasswordRealTime);
    }
    
    // Form submission
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }
});

/**
 * Validate username in real-time
 */
function validateUsernameRealTime() {
    const usernameField = document.getElementById('username');
    const username = usernameField.value.trim();
    
    // If empty, clear validation
    if (!username) {
        clearFieldError('username');
        usernameField.style.borderColor = '#e5e7eb';
        usernameField.style.backgroundColor = '#fafafa';
        return;
    }
    
    // If has value, show green
    usernameField.classList.remove('is-invalid');
    usernameField.style.borderColor = '#10b981'; // Green
    usernameField.style.backgroundColor = '#f0fdf4'; // Light green
    clearFieldError('username');
}

/**
 * Validate password in real-time
 */
function validatePasswordRealTime() {
    const passwordField = document.getElementById('password');
    const password = passwordField.value;
    
    // If empty, clear validation
    if (!password) {
        clearFieldError('password');
        passwordField.style.borderColor = '#e5e7eb';
        passwordField.style.backgroundColor = '#fafafa';
        return;
    }
    
    // If has value, show green
    passwordField.classList.remove('is-invalid');
    passwordField.style.borderColor = '#10b981'; // Green
    passwordField.style.backgroundColor = '#f0fdf4'; // Light green
    clearFieldError('password');
}

/**
 * Show field error with red highlighting
 */
function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    
    // Add is-invalid class to turn field red
    field.classList.add('is-invalid');
    field.style.borderColor = '#dc3545';
    field.style.backgroundColor = '#fff5f5';
    
    // Update or create feedback message
    let feedback = field.closest('.mb-4')?.querySelector('.invalid-feedback');
    if (!feedback) {
        feedback = document.createElement('div');
        feedback.className = 'invalid-feedback';
        field.parentElement?.appendChild(feedback);
    }
    
    feedback.textContent = message;
    feedback.style.display = 'block';
}

/**
 * Clear field error
 */
function clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    
    field.classList.remove('is-invalid');
    field.style.borderColor = '';
    field.style.backgroundColor = '';
    
    const feedback = field.closest('.mb-4')?.querySelector('.invalid-feedback');
    if (feedback) {
        feedback.style.display = 'none';
    }
}

/**
 * Validate login form
 */
function validateLoginForm() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    
    // Clear previous errors
    clearFieldError('username');
    clearFieldError('password');
    
    let isValid = true;
    
    // Validate username
    if (!username) {
        showFieldError('username', 'Vui lòng nhập tên đăng nhập hoặc email.');
        isValid = false;
    }
    
    // Validate password
    if (!password) {
        showFieldError('password', 'Vui lòng nhập mật khẩu.');
        isValid = false;
    } else if (password.length < 6) {
        showFieldError('password', 'Mật khẩu không hợp lệ.');
        isValid = false;
    }
    
    return isValid;
}

/**
 * Handle login form submission
 */
async function handleLoginSubmit(e) {
    e.preventDefault();
    
    // Clear previous messages
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');
    if (successMessage) successMessage.style.display = 'none';
    if (errorMessage) errorMessage.style.display = 'none';
    
    // Clear any field errors
    clearFieldError('username');
    clearFieldError('password');
    
    // Validate form
    if (!validateLoginForm()) {
        return;
    }
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    
    // Disable submit button
    const submitButton = document.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = `
        <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
        Đang đăng nhập...
    `;
    
    try {
        console.log('Attempting login with:', username);
        
        // Use API service for login
        const data = await apiService.login({
            email: username,
            password: password
        });
        
        console.log('Login response:', data);
        
        // Check if response has success/data
        if (!data || (!data.success && !data.data)) {
            throw new Error(data?.message || 'Dữ liệu phản hồi không hợp lệ');
        }
        
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
        
        // Show success message
        if (successMessage) {
            successMessage.style.display = 'block';
            successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
        // Get user role and redirect accordingly
        const userRole = data.data.user?.role || 'user';
        let redirectUrl = '../../index.html';
        
        switch(userRole) {
            case 'admin':
                redirectUrl = '../admin/admin.html';
                break;
            case 'seller':
                redirectUrl = '../seller/seller.html';
                break;
            default:
                redirectUrl = '../../index.html';
        }
        
        // Redirect after 2 seconds
        setTimeout(() => {
            window.location.href = redirectUrl;
        }, 2000);
        
    } catch (error) {
        console.error('Login error:', error);
        
        let errorMsg = 'Vui lòng kiểm tra lại tên đăng nhập và mật khẩu.';
        
        // Parse different error types
        const errStr = error.message || error.toString();
        if (errStr.includes('401') || errStr.includes('không đúng')) {
            errorMsg = 'Tên đăng nhập hoặc mật khẩu không đúng.';
        } else if (errStr.includes('không tìm thấy') || errStr.includes('404')) {
            errorMsg = 'Tài khoản không tồn tại.';
        } else if (errStr.includes('Network') || errStr.includes('fetch')) {
            errorMsg = 'Lỗi kết nối. Vui lòng kiểm tra internet và thử lại.';
        } else if (errStr.includes('server') || errStr.includes('500')) {
            errorMsg = 'Lỗi server. Vui lòng thử lại sau.';
        } else {
            errorMsg = errStr;
        }
        
        // Show error message on page
        if (errorMessage && document.getElementById('errorMessageText')) {
            document.getElementById('errorMessageText').textContent = errorMsg;
            errorMessage.style.display = 'block';
            errorMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
        // Also show field error
        showFieldError('password', errorMsg);
    } finally {
        // Re-enable submit button
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
    }
}

/**
 * Toggle password visibility
 */
function togglePassword() {
    const passwordInput = document.getElementById('password');
    if (!passwordInput) return;
    
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    
    // Update button icon
    const button = passwordInput.nextElementSibling;
    if (button && button.classList.contains('btn-link')) {
        const svgs = button.querySelectorAll('svg');
        svgs.forEach(svg => svg.classList.toggle('d-none'));
    }
}

/**
 * Handle sign in (backward compatibility)
 */
async function handleSignIn() {
    const form = document.getElementById('loginForm');
    const event = new Event('submit');
    form.dispatchEvent(event);
}

