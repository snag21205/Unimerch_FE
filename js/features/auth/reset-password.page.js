/**
 * Reset Password Page Logic
 * Handles password reset form validation and submission
 */

document.addEventListener('DOMContentLoaded', function() {
    const resetPasswordForm = document.getElementById('resetPasswordForm');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    
    // Check if reset token exists
    const token = getTokenFromURL();
    if (!token) {
        showError('Token không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu đặt lại mật khẩu mới.');
        if (resetPasswordForm) resetPasswordForm.style.display = 'none';
        return;
    }
    
    // Add real-time password validation
    if (newPasswordInput) {
        newPasswordInput.addEventListener('input', validatePasswordRequirements);
        newPasswordInput.addEventListener('input', validatePasswordMatch);
    }
    
    // Add real-time confirm password validation
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', validatePasswordMatch);
    }
    
    // Form submission
    if (resetPasswordForm) {
        resetPasswordForm.addEventListener('submit', handleResetPasswordSubmit);
    }
});

/**
 * Get token from URL parameters
 */
function getTokenFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('token');
}

/**
 * Validate password requirements
 */
function validatePasswordRequirements(e) {
    const password = e.target.value;
    const newPasswordField = document.getElementById('newPassword');
    const requirementsContainer = document.getElementById('passwordRequirementsContainer');
    
    // If empty, clear validation
    if (!password) {
        clearFieldError('newPassword');
        if (requirementsContainer) {
            requirementsContainer.style.display = 'none';
        }
        newPasswordField.style.borderColor = '#e5e7eb';
        newPasswordField.style.backgroundColor = '#fafafa';
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
    
    // Update field state
    const allMet = Object.values(requirements).every(req => req);
    
    if (allMet) {
        // Tất cả điều kiện được thỏa mãn - XANH LỤC
        newPasswordField.classList.remove('is-invalid');
        newPasswordField.style.borderColor = '#10b981'; // Green
        newPasswordField.style.backgroundColor = '#f0fdf4'; // Light green
        clearFieldError('newPassword');
    } else {
        // Còn thiếu điều kiện - ĐỎ
        newPasswordField.classList.add('is-invalid');
        newPasswordField.style.borderColor = '#dc3545'; // Red
        newPasswordField.style.backgroundColor = '#fff5f5'; // Light red
    }
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
 * Validate password match
 */
function validatePasswordMatch() {
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const confirmField = document.getElementById('confirmPassword');
    
    if (!confirmPassword) {
        clearFieldError('confirmPassword');
        confirmField.style.borderColor = '#e5e7eb';
        confirmField.style.backgroundColor = '#fafafa';
        confirmField.classList.remove('is-invalid');
        return true;
    }
    
    if (newPassword !== confirmPassword) {
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
    
    // Add Bootstrap validation classes
    field.classList.add('is-invalid');
    field.style.borderColor = '#dc3545';
    field.style.backgroundColor = '#fff5f5';
    
    // Update feedback message
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
 * Validate form before submission
 */
function validateResetPasswordForm() {
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Clear previous errors
    clearFieldError('newPassword');
    clearFieldError('confirmPassword');
    
    let isValid = true;
    
    // Validate new password
    if (!newPassword) {
        showFieldError('newPassword', 'Vui lòng nhập mật khẩu mới.');
        isValid = false;
    } else if (newPassword.length < 8) {
        showFieldError('newPassword', 'Mật khẩu phải có ít nhất 8 ký tự.');
        isValid = false;
    } else if (!/[A-Z]/.test(newPassword)) {
        showFieldError('newPassword', 'Mật khẩu phải chứa ít nhất một chữ cái in hoa.');
        isValid = false;
    } else if (!/[0-9]/.test(newPassword)) {
        showFieldError('newPassword', 'Mật khẩu phải chứa ít nhất một số.');
        isValid = false;
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
        showFieldError('newPassword', 'Mật khẩu phải chứa ít nhất một ký tự đặc biệt.');
        isValid = false;
    }
    
    // Validate confirm password
    if (!confirmPassword) {
        showFieldError('confirmPassword', 'Vui lòng xác nhận mật khẩu.');
        isValid = false;
    } else if (newPassword !== confirmPassword) {
        showFieldError('confirmPassword', 'Mật khẩu xác nhận không khớp.');
        isValid = false;
    }
    
    return isValid;
}

/**
 * Handle reset password form submission
 */
async function handleResetPasswordSubmit(e) {
    e.preventDefault();
    
    // Hide previous messages
    hideMessages();
    
    // Validate form
    if (!validateResetPasswordForm()) {
        return;
    }
    
    const newPassword = document.getElementById('newPassword').value;
    const token = getTokenFromURL();
    
    // Validate token
    if (!token) {
        showError('Token không hợp lệ hoặc đã hết hạn.');
        return;
    }
    
    // Show loading state
    setLoadingState(true);
    
    try {
        // Call reset password API
        const response = await apiService.resetPassword(token, newPassword);
        
        if (response.success || response.data) {
            showSuccess();
            
            // Redirect to login page after 3 seconds
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 3000);
        } else {
            throw new Error(response.message || 'Có lỗi xảy ra khi đặt lại mật khẩu');
        }
    } catch (error) {
        console.error('Reset password error:', error);
        
        let errorMessage = 'Có lỗi xảy ra khi đặt lại mật khẩu. Vui lòng thử lại.';
        
        if (error.message.includes('token')) {
            errorMessage = 'Token không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu đặt lại mật khẩu mới.';
        } else if (error.message.includes('password')) {
            errorMessage = 'Mật khẩu không hợp lệ. Vui lòng kiểm tra và thử lại.';
        }
        
        showError(errorMessage);
    } finally {
        setLoadingState(false);
    }
}

/**
 * Set loading state for submit button
 */
function setLoadingState(isLoading) {
    const submitBtn = document.querySelector('button[type="submit"]');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    
    if (isLoading) {
        if (btnText) btnText.classList.add('d-none');
        if (btnLoading) btnLoading.classList.remove('d-none');
        submitBtn.disabled = true;
    } else {
        if (btnText) btnText.classList.remove('d-none');
        if (btnLoading) btnLoading.classList.add('d-none');
        submitBtn.disabled = false;
    }
}

/**
 * Show success message
 */
function showSuccess() {
    const successMsg = document.getElementById('successMessage');
    if (successMsg) {
        successMsg.classList.remove('d-none');
        successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

/**
 * Show error message
 */
function showError(message) {
    const errorMsg = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorMessageText');
    
    if (errorMsg && errorText) {
        errorText.textContent = message;
        errorMsg.classList.remove('d-none');
        errorMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

/**
 * Hide all messages
 */
function hideMessages() {
    const successMsg = document.getElementById('successMessage');
    const errorMsg = document.getElementById('errorMessage');
    
    if (successMsg) successMsg.classList.add('d-none');
    if (errorMsg) errorMsg.classList.add('d-none');
}

/**
 * Toggle password visibility
 */
function togglePasswordVisibility(inputId, button) {
    const input = document.getElementById(inputId);
    const eyeOpen = button.querySelector('.eye-open');
    const eyeClosed = button.querySelector('.eye-closed');
    
    if (input.type === 'password') {
        input.type = 'text';
        if (eyeOpen) eyeOpen.classList.add('d-none');
        if (eyeClosed) eyeClosed.classList.remove('d-none');
    } else {
        input.type = 'password';
        if (eyeOpen) eyeOpen.classList.remove('d-none');
        if (eyeClosed) eyeClosed.classList.add('d-none');
    }
}
