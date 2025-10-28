/**
 * Register Page Logic
 * Handles form validation and user registration with real-time feedback
 */

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    
    // Add real-time username validation
    if (usernameInput) {
        usernameInput.addEventListener('input', validateUsernameRealTime);
        usernameInput.addEventListener('blur', function() {
            if (this.value.trim()) {
                validateUsernameRealTime();
            }
        });
    }
    
    // Add real-time password validation
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            validatePasswordRequirementsRealTime(this.value);
            validatePasswordMatch();
        });
        passwordInput.addEventListener('blur', function() {
            if (this.value.trim()) {
                validatePasswordRequirementsRealTime(this.value);
            }
        });
    }
    
    // Add real-time confirm password validation
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', validatePasswordMatch);
        confirmPasswordInput.addEventListener('blur', function() {
            if (this.value.trim()) {
                validatePasswordMatch();
            }
        });
    }
    
    // Form submission
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegisterSubmit);
    }
});

/**
 * Validate username requirements in real-time
 */
function validateUsernameRealTime() {
    const usernameField = document.getElementById('username');
    const username = usernameField.value.trim();
    
    // If empty, clear all validation
    if (!username) {
        clearFieldError('username');
        removeUsernameRequirements();
        return;
    }
    
    const requirements = {
        length: username.length >= 3 && username.length <= 20,
        noSpaces: !/\s/.test(username)
    };
    
    // Create or show requirements if not exist
    showUsernameRequirements(requirements);
    
    // Update field state
    if (requirements.length && requirements.noSpaces) {
        usernameField.classList.remove('is-invalid');
        usernameField.style.borderColor = '#10b981'; // Green
        usernameField.style.backgroundColor = '#f0fdf4'; // Light green
        clearFieldError('username');
    } else {
        usernameField.classList.add('is-invalid');
        usernameField.style.borderColor = '#dc3545'; // Red
        usernameField.style.backgroundColor = '#fff5f5'; // Light red
    }
}

/**
 * Show username requirements indicators
 */
function showUsernameRequirements(requirements) {
    let container = document.getElementById('usernameRequirementsContainer');
    
    if (!container) {
        const usernameField = document.getElementById('username');
        container = document.createElement('div');
        container.id = 'usernameRequirementsContainer';
        container.className = 'mt-2 mb-2';
        usernameField.parentElement.appendChild(container);
    }
    
    container.innerHTML = `
        <small class="d-block" style="font-size: 0.75rem;">
            <span id="username-length-req" class="requirement ${requirements.length ? 'text-success fw-medium' : 'text-danger fw-medium'}">
                ${requirements.length ? '✓' : '✗'} Độ dài 3-20 ký tự
            </span>
            <br>
            <span id="username-spaces-req" class="requirement ${requirements.noSpaces ? 'text-success fw-medium' : 'text-danger fw-medium'}">
                ${requirements.noSpaces ? '✓' : '✗'} Không chứa khoảng trắng
            </span>
        </small>
    `;
    
    container.style.display = 'block';
}

/**
 * Remove username requirements container
 */
function removeUsernameRequirements() {
    const container = document.getElementById('usernameRequirementsContainer');
    if (container) {
        container.remove();
    }
}

/**
 * Validate password requirements and update UI in real-time
 */
function validatePasswordRequirementsRealTime(password) {
    const passwordField = document.getElementById('password');
    const requirementsContainer = document.getElementById('passwordRequirementsContainer');
    
    // If empty, clear validation
    if (!password) {
        clearFieldError('password');
        if (requirementsContainer) {
            requirementsContainer.style.display = 'none';
        }
        passwordField.style.borderColor = '#e5e7eb';
        passwordField.style.backgroundColor = '#fafafa';
        return;
    }
    
    const requirements = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    // Show password requirements UI with colors
    if (requirementsContainer) {
        requirementsContainer.style.display = 'block';
        updatePasswordRequirementDisplay(requirements);
    }
    
    // Update field state - ngay lập tức khi nhập
    const allMet = Object.values(requirements).every(req => req);
    
    if (allMet) {
        // Tất cả điều kiện được thỏa mãn - XANH LỤC
        passwordField.classList.remove('is-invalid');
        passwordField.style.borderColor = '#10b981'; // Green
        passwordField.style.backgroundColor = '#f0fdf4'; // Light green
        clearFieldError('password');
    } else {
        // Còn thiếu điều kiện - ĐỎ
        passwordField.classList.add('is-invalid');
        passwordField.style.borderColor = '#dc3545'; // Red
        passwordField.style.backgroundColor = '#fff5f5'; // Light red
    }
    
    return allMet;
}

/**
 * Update password requirement display with colors
 */
function updatePasswordRequirementDisplay(requirements) {
    const lengthReq = document.getElementById('password-length-req');
    const uppercaseReq = document.getElementById('password-uppercase-req');
    const numberReq = document.getElementById('password-number-req');
    const specialReq = document.getElementById('password-special-req');
    
    updatePasswordReq(lengthReq, requirements.length, 'Ít nhất 8 ký tự');
    updatePasswordReq(uppercaseReq, requirements.uppercase, 'Ít nhất 1 chữ cái in hoa (A-Z)');
    updatePasswordReq(numberReq, requirements.number, 'Ít nhất 1 số (0-9)');
    updatePasswordReq(specialReq, requirements.special, 'Ít nhất 1 ký tự đặc biệt (!@#$%^&*)');
}

/**
 * Update single password requirement element
 */
function updatePasswordReq(element, isMet, text) {
    if (isMet) {
        // ✓ XANH LỤC - Thỏa mãn điều kiện
        element.className = 'requirement text-success fw-medium';
        element.style.color = '#10b981';
        element.innerHTML = `✓ ${text}`;
    } else {
        // ✗ ĐỎ - Chưa thỏa mãn điều kiện
        element.className = 'requirement text-danger fw-medium';
        element.style.color = '#dc3545';
        element.innerHTML = `✗ ${text}`;
    }
}

/**
 * Validate password match in real-time
 */
function validatePasswordMatch() {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const confirmField = document.getElementById('confirmPassword');
    
    if (!confirmPassword) {
        clearFieldError('confirmPassword');
        confirmField.style.borderColor = '#e5e7eb';
        confirmField.style.backgroundColor = '#fafafa';
        confirmField.classList.remove('is-invalid');
        return true;
    }
    
    if (password !== confirmPassword) {
        // Mật khẩu không khớp - ĐỎ
        showFieldError('confirmPassword', 'Mật khẩu xác nhận không khớp.');
        confirmField.style.borderColor = '#dc3545';
        confirmField.style.backgroundColor = '#fff5f5';
        confirmField.classList.add('is-invalid');
        return false;
    } else {
        // Mật khẩu khớp - XANH LỤC
        clearFieldError('confirmPassword');
        confirmField.classList.remove('is-invalid');
        confirmField.style.borderColor = '#10b981';
        confirmField.style.backgroundColor = '#f0fdf4';
        return true;
    }
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
 * Clear all form errors
 */
function clearAllErrors() {
    const form = document.getElementById('registerForm');
    const fields = form.querySelectorAll('input[type="text"], input[type="email"], input[type="password"], textarea');
    
    fields.forEach(field => {
        clearFieldError(field.id);
    });
}

/**
 * Validate all form fields
 */
function validateForm() {
    const form = document.getElementById('registerForm');
    clearAllErrors();
    
    const fullName = document.getElementById('fullName').value.trim();
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const agreeTerms = document.getElementById('agreeTerms').checked;
    
    let isValid = true;
    
    // Validate Full Name
    if (!fullName) {
        showFieldError('fullName', 'Vui lòng nhập họ tên.');
        isValid = false;
    } else if (fullName.length < 2) {
        showFieldError('fullName', 'Họ tên phải có ít nhất 2 ký tự.');
        isValid = false;
    } else if (fullName.length > 50) {
        showFieldError('fullName', 'Họ tên không được vượt quá 50 ký tự.');
        isValid = false;
    }
    
    // Validate Username
    if (!username) {
        showFieldError('username', 'Vui lòng nhập tên đăng nhập.');
        isValid = false;
    } else if (username.length < 3) {
        showFieldError('username', 'Tên đăng nhập phải có ít nhất 3 ký tự.');
        isValid = false;
    } else if (username.length > 20) {
        showFieldError('username', 'Tên đăng nhập không được vượt quá 20 ký tự.');
        isValid = false;
    }
    
    // Validate Email
    if (!email) {
        showFieldError('email', 'Vui lòng nhập địa chỉ email.');
        isValid = false;
    } else if (!ValidationUtils.isValidEmail(email)) {
        showFieldError('email', 'Vui lòng nhập một địa chỉ email hợp lệ.');
        isValid = false;
    }
    
    // Validate Password
    if (!password) {
        showFieldError('password', 'Vui lòng nhập mật khẩu.');
        isValid = false;
    } else if (password.length < 8) {
        showFieldError('password', 'Mật khẩu phải có ít nhất 8 ký tự.');
        isValid = false;
    } else if (!/[A-Z]/.test(password)) {
        showFieldError('password', 'Mật khẩu phải chứa ít nhất một chữ cái in hoa.');
        isValid = false;
    } else if (!/[0-9]/.test(password)) {
        showFieldError('password', 'Mật khẩu phải chứa ít nhất một số.');
        isValid = false;
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        showFieldError('password', 'Mật khẩu phải chứa ít nhất một ký tự đặc biệt.');
        isValid = false;
    }
    
    // Validate Confirm Password
    if (!confirmPassword) {
        showFieldError('confirmPassword', 'Vui lòng xác nhận mật khẩu.');
        isValid = false;
    } else if (password !== confirmPassword) {
        showFieldError('confirmPassword', 'Mật khẩu xác nhận không khớp.');
        isValid = false;
    }
    
    // Validate Terms Agreement
    if (!agreeTerms) {
        const agreeField = document.getElementById('agreeTerms');
        agreeField.classList.add('is-invalid');
        const feedback = agreeField.closest('.mb-4')?.querySelector('.invalid-feedback');
        if (feedback) {
            feedback.style.display = 'block';
        }
        isValid = false;
    }
    
    return isValid;
}

/**
 * Handle register form submission
 */
async function handleRegisterSubmit(e) {
    e.preventDefault();
    
    // Clear previous messages
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');
    if (successMessage) successMessage.style.display = 'none';
    if (errorMessage) errorMessage.style.display = 'none';
    
    // Validate form
    if (!validateForm()) {
        console.log('Form validation failed');
        return;
    }
    
    // Gather form data
    const formData = {
        fullName: document.getElementById('fullName').value.trim(),
        username: document.getElementById('username').value.trim(),
        email: document.getElementById('email').value.trim(),
        password: document.getElementById('password').value,
        studentId: document.getElementById('studentId').value.trim() || null,
        phone: document.getElementById('phone').value.trim() || null,
        address: document.getElementById('address').value.trim() || null
    };
    
    // Disable submit button
    const submitButton = document.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = `
        <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
        Đang tạo tài khoản...
    `;
    
    try {
        // Call register API
        const response = await apiService.register(formData);
        
        if (response.success || response.data) {
            // Show success message
            if (successMessage) {
                successMessage.style.display = 'block';
                successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                UiUtils.showToast('Đăng ký thành công! Vui lòng đăng nhập.', 'success');
            }
            
            // Redirect to login after 2 seconds
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            throw new Error(response.message || 'Đăng ký thất bại');
        }
    } catch (error) {
        console.error('Registration error:', error);
        
        // Handle specific error messages
        let errorMessage = 'Đăng ký thất bại. Vui lòng thử lại.';
        
        if (error.message.includes('email')) {
            errorMessage = 'Email này đã được đăng ký. Vui lòng sử dụng email khác.';
            showFieldError('email', errorMessage);
        } else if (error.message.includes('username')) {
            errorMessage = 'Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác.';
            showFieldError('username', errorMessage);
        } else if (error.message.includes('Dữ liệu không hợp lệ')) {
            errorMessage = error.message;
            UiUtils.showToast(errorMessage, 'error');
        } else {
            errorMessage = error.message || 'Đã xảy ra lỗi. Vui lòng thử lại sau.';
            UiUtils.showToast(errorMessage, 'error');
        }
    } finally {
        // Re-enable submit button
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
    }
}

/**
 * Toggle password visibility
 */
function togglePassword(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    
    const type = field.getAttribute('type') === 'password' ? 'text' : 'password';
    field.setAttribute('type', type);
    
    // Update button icon
    const button = field.nextElementSibling;
    if (button && button.classList.contains('btn-link')) {
        const svgs = button.querySelectorAll('svg');
        svgs.forEach(svg => svg.classList.toggle('d-none'));
    }
}
