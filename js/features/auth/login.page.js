/**
 * Login Page Logic
 * Handles form validation and user authentication with real-time feedback
 */

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== Login page initialized ===');
    
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) {
        console.error('❌ Login form not found!');
        return;
    }
    
    // Find inputs within the login form to avoid conflicts with navbar username
    const usernameInput = loginForm.querySelector('#username');
    const passwordInput = loginForm.querySelector('#password');
    const submitButton = loginForm.querySelector('button[type="submit"]');
    
    console.log('Elements found:', {
        loginForm: !!loginForm,
        usernameInput: !!usernameInput,
        passwordInput: !!passwordInput,
        submitButton: !!submitButton
    });
    
    if (!loginForm) {
        console.error('❌ Login form not found!');
        return;
    }
    
    console.log('✅ Login form found, attaching event listeners');
    
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
    
    // Form submission - use both submit and click events for reliability
    console.log('✅ Attaching submit listener to form');
    loginForm.addEventListener('submit', async function(e) {
        console.log('📝 Form submit event triggered');
        e.preventDefault(); // Always prevent default to handle manually
        e.stopPropagation();
        
        loginForm.dataset.submitted = 'true';
        
        try {
            console.log('▶️ Calling handleLoginSubmit...');
            await handleLoginSubmit(e);
        } catch (error) {
            console.error('❌ Error in form submit handler:', error);
            loginForm.dataset.submitted = '';
            
            // Use custom alert if available
            if (window.UiUtils && window.UiUtils.alert) {
                await UiUtils.alert('Có lỗi xảy ra khi xử lý đăng nhập: ' + error.message);
            } else {
                alert('Có lỗi xảy ra khi xử lý đăng nhập: ' + error.message);
            }
        }
    });
    
    // Also listen to button click as backup - directly trigger form submit
    if (submitButton) {
        console.log('✅ Attaching click listener to submit button');
        submitButton.addEventListener('click', function(e) {
            console.log('🔘 Submit button clicked!');
            e.preventDefault();
            e.stopPropagation();
            
            // Manually trigger form submit event
            const form = e.target.closest('form') || loginForm;
            if (form) {
                console.log('📤 Triggering form submit from button click');
                const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
                form.dispatchEvent(submitEvent);
            } else {
                console.error('❌ Could not find form element');
            }
        });
    } else {
        console.error('❌ Submit button not found!');
    }
    
    console.log('✅ Event listeners attached successfully');
    console.log('=== Initialization complete ===');
});

/**
 * Validate username in real-time
 */
function validateUsernameRealTime() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;
    
    const usernameField = loginForm.querySelector('#username');
    if (!usernameField) return;
    
    const username = (usernameField.value || '').trim();
    
    // If empty, clear validation
    if (!username) {
        clearFieldError('username');
        usernameField.style.borderColor = '';
        usernameField.style.backgroundColor = '';
        return;
    }
    
    // If has value, show green
    usernameField.classList.remove('is-invalid');
    usernameField.style.borderColor = '';
    usernameField.style.backgroundColor = '';
    clearFieldError('username');
}

/**
 * Validate password in real-time
 */
function validatePasswordRealTime() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;
    
    const passwordField = loginForm.querySelector('#password');
    if (!passwordField) return;
    
    const password = passwordField.value || '';
    
    // If empty, clear validation
    if (!password) {
        clearFieldError('password');
        passwordField.style.borderColor = '';
        passwordField.style.backgroundColor = '';
        return;
    }
    
    // If has value, show green
    passwordField.classList.remove('is-invalid');
    passwordField.style.borderColor = '';
    passwordField.style.backgroundColor = '';
    clearFieldError('password');
}

/**
 * Show field error with red highlighting
 */
function showFieldError(fieldId, message) {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) {
        console.error('Login form not found for error display');
        return;
    }
    
    // Find field within the login form to avoid conflicts
    const field = loginForm.querySelector(`#${fieldId}`) || document.getElementById(fieldId);
    if (!field) {
        console.error(`Field ${fieldId} not found for error display`);
        return;
    }
    
    console.log(`Showing error for ${fieldId}:`, message);
    
    // Add is-invalid class to turn field red (CSS will handle styling)
    field.classList.add('is-invalid');
    
    // Find existing feedback or create new one
    let feedback = field.parentElement?.querySelector('.invalid-feedback');
    
    // If not found, try looking in the closest .mb-4 container
    if (!feedback) {
        const container = field.closest('.mb-4') || field.parentElement;
        feedback = container?.querySelector('.invalid-feedback');
    }
    
    // If still not found, create one
    if (!feedback) {
        feedback = document.createElement('div');
        feedback.className = 'invalid-feedback';
        const container = field.closest('.mb-4') || field.parentElement;
        if (container) {
            container.appendChild(feedback);
        } else {
            field.parentElement?.appendChild(feedback);
        }
    }
    
    feedback.textContent = message;
    feedback.style.display = 'block';
    feedback.style.color = '#f87171'; // Ensure error color is visible
    
    console.log(`Error displayed for ${fieldId}`);
}

/**
 * Clear field error
 */
function clearFieldError(fieldId) {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;
    
    // Find field within the login form to avoid conflicts
    const field = loginForm.querySelector(`#${fieldId}`) || document.getElementById(fieldId);
    if (!field) return;
    
    field.classList.remove('is-invalid');
    field.style.borderColor = '';
    field.style.backgroundColor = '';
    
    // Find feedback in parent or closest .mb-4
    let feedback = field.parentElement?.querySelector('.invalid-feedback');
    if (!feedback) {
        const container = field.closest('.mb-4');
        feedback = container?.querySelector('.invalid-feedback');
    }
    
    if (feedback) {
        feedback.style.display = 'none';
        feedback.textContent = '';
    }
}

/**
 * Validate login form
 */
function validateLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) {
        console.error('Login form not found');
        return false;
    }
    
    // Find fields within the login form to avoid conflicts
    const usernameField = loginForm.querySelector('#username') || document.getElementById('username');
    const passwordField = loginForm.querySelector('#password') || document.getElementById('password');
    
    if (!usernameField || !passwordField) {
        console.error('Username or password field not found', {
            usernameField: !!usernameField,
            passwordField: !!passwordField
        });
        return false;
    }
    
    // Get raw values
    const usernameRaw = usernameField.value || '';
    const passwordRaw = passwordField.value || '';
    
    // Debug: log actual values
    console.log('🔍 Field values:', {
        usernameRaw: usernameRaw,
        usernameRawLength: usernameRaw.length,
        passwordRawLength: passwordRaw.length,
        usernameFieldType: usernameField.type,
        usernameFieldId: usernameField.id,
        usernameFieldInForm: loginForm.contains(usernameField)
    });
    
    const username = usernameRaw.trim();
    const password = passwordRaw;
    
    console.log('Validating:', { 
        username: username || 'empty', 
        usernameLength: username.length,
        password: password ? 'filled' : 'empty', 
        passwordLength: password.length
    });
    
    // Clear previous errors
    clearFieldError('username');
    clearFieldError('password');
    
    let isValid = true;
    
    // Validate username
    if (!username) {
        console.log('❌ Username is empty - showing error');
        showFieldError('username', 'Vui lòng nhập tên đăng nhập hoặc email.');
        isValid = false;
    } else {
        console.log('✅ Username is valid');
    }
    
    // Validate password
    if (!password) {
        console.log('❌ Password is empty - showing error');
        showFieldError('password', 'Vui lòng nhập mật khẩu.');
        isValid = false;
    } else if (password.length < 6) {
        console.log('❌ Password too short - showing error');
        showFieldError('password', 'Mật khẩu phải có ít nhất 6 ký tự.');
        isValid = false;
    } else {
        console.log('✅ Password is valid');
    }
    
    console.log('Validation result:', isValid);
    if (!isValid) {
        console.log('⚠️ Form validation failed - errors should be visible');
    }
    return isValid;
}

/**
 * Handle login form submission
 */
async function handleLoginSubmit(e) {
    console.log('Login form submitted - handleLoginSubmit called');
    
    // Clear previous messages
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');
    if (successMessage) successMessage.style.display = 'none';
    if (errorMessage) errorMessage.style.display = 'none';
    
    // Clear any field errors
    clearFieldError('username');
    clearFieldError('password');
    
    // Validate form FIRST - show errors if invalid
    console.log('Validating form...');
    if (!validateLoginForm()) {
        console.log('Form validation failed - showing errors');
        // Validation errors are already shown by validateLoginForm
        return;
    }
    
    console.log('Form validation passed');
    
    try {
        const loginForm = document.getElementById('loginForm');
        if (!loginForm) {
            throw new Error('Login form not found');
        }
        
        // Find fields within the login form to avoid conflicts
        const usernameField = loginForm.querySelector('#username') || document.getElementById('username');
        const passwordField = loginForm.querySelector('#password') || document.getElementById('password');
        
        if (!usernameField || !passwordField) {
            throw new Error('Không tìm thấy trường username hoặc password');
        }
        
        // Get raw values
        const usernameRaw = usernameField.value || '';
        const passwordRaw = passwordField.value || '';
        
        // Debug: log actual values
        console.log('🔍 Login attempt - Field values:', {
            usernameRaw: usernameRaw,
            usernameRawLength: usernameRaw.length,
            passwordRawLength: passwordRaw.length
        });
        
        const username = usernameRaw.trim();
        const password = passwordRaw;
        
        console.log('Attempting login with username:', username, 'length:', username.length);
        
        // Disable submit button
        const submitButton = document.querySelector('button[type="submit"]');
        if (!submitButton) {
            throw new Error('Không tìm thấy nút submit');
        }
        
        const originalButtonText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = `
            <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Đang đăng nhập...
        `;
        
        // Check if apiService is available
        if (!window.apiService) {
            throw new Error('API Service chưa được tải. Vui lòng tải lại trang.');
        }
        
        // Use API service for login
        const data = await window.apiService.login({
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
            window.apiService.setToken(data.data.token);
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
        
        // Reset form submitted flag
        const form = document.getElementById('loginForm');
        if (form) {
            form.dataset.submitted = '';
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
        
        // Re-enable submit button on error
        const submitButton = document.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.innerHTML = 'Đăng nhập';
        }
        
        // Reset form submitted flag
        const form = document.getElementById('loginForm');
        if (form) {
            form.dataset.submitted = '';
        }
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

