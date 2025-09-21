// Forgot Password Page JavaScript - API Integration

// API Configuration
const API_BASE_URL = 'https://api.unimerch.space';

// Form submission handler
document.getElementById('forgotPasswordForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    
    // Validate email format
    if (!isValidEmail(email)) {
        showFieldError('email', 'Please enter a valid email address');
        return;
    }
    
    // Clear any previous errors
    clearFieldError('email');
    
    // Show loading state
    setLoadingState(true);
    
    try {
        // Call forgot password API using API service
        const data = await apiService.forgotPassword(email);
        
        // Handle successful response
        if (data.success) {
            showSuccessMessage();
            
            // Optional: Show additional feedback with toast
            showToast('Password reset email sent successfully!', 'success');
            
            // Disable the form to prevent spam
            disableForm();
            
            // Optional: Redirect after delay
            setTimeout(() => {
                // You can redirect to login or keep on same page
                // window.location.href = 'login.html';
            }, 3000);
            
        } else {
            throw new Error('Invalid response format');
        }
        
    } catch (error) {
        console.error('Forgot password error:', error);
        
        // Handle specific error messages
        let errorMessage = error.message;
        
        if (error.message.includes('không tìm thấy') || error.message.includes('not found')) {
            errorMessage = 'No account found with this email address. Please check your email or create a new account.';
            showFieldError('email', errorMessage);
        } else if (error.message.includes('email không hợp lệ') || error.message.includes('invalid email')) {
            errorMessage = 'Please enter a valid email address.';
            showFieldError('email', errorMessage);
        } else {
            errorMessage = `Failed to send reset email: ${errorMessage}`;
        }
        
        showToast(errorMessage, 'error');
    } finally {
        // Reset loading state
        setLoadingState(false);
    }
});

// Email validation function
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Real-time email validation
document.getElementById('email').addEventListener('blur', function() {
    const email = this.value.trim();
    
    if (email && !isValidEmail(email)) {
        showFieldError('email', 'Please enter a valid email address');
    } else {
        clearFieldError('email');
    }
});

// Clear validation error on input
document.getElementById('email').addEventListener('input', function() {
    clearFieldError('email');
});

// Show field-specific error
function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const feedback = field.nextElementSibling;
    
    field.classList.add('is-invalid');
    if (feedback && feedback.classList.contains('invalid-feedback')) {
        feedback.textContent = message;
    }
}

// Clear field error
function clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    field.classList.remove('is-invalid');
}

// Set loading state
function setLoadingState(loading) {
    const button = document.querySelector('button[type="submit"]');
    const btnText = button.querySelector('.btn-text');
    const btnLoading = button.querySelector('.btn-loading');
    
    if (loading) {
        button.disabled = true;
        btnText.classList.add('d-none');
        btnLoading.classList.remove('d-none');
    } else {
        button.disabled = false;
        btnText.classList.remove('d-none');
        btnLoading.classList.add('d-none');
    }
}

// Show success message
function showSuccessMessage() {
    const successMessage = document.getElementById('successMessage');
    const form = document.getElementById('forgotPasswordForm');
    
    // Hide form elements and show success message
    const formElements = form.querySelectorAll('.mb-4');
    formElements.forEach(element => {
        if (element.id !== 'successMessage') {
            element.style.display = 'none';
        }
    });
    
    successMessage.classList.remove('d-none');
    
    // Add animation
    successMessage.style.opacity = '0';
    successMessage.style.transform = 'translateY(10px)';
    setTimeout(() => {
        successMessage.style.transition = 'all 0.3s ease';
        successMessage.style.opacity = '1';
        successMessage.style.transform = 'translateY(0)';
    }, 100);
    
    // Scroll to success message
    successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Show resend option after 30 seconds
    setTimeout(() => {
        showResendOption();
    }, 30000);
}

// Show resend option
function showResendOption() {
    const successMessage = document.getElementById('successMessage');
    const resendHtml = `
        <div class="mt-3 pt-3 border-top">
            <p class="text-muted mb-2 small">Didn't receive the email?</p>
            <button type="button" class="btn btn-outline-primary btn-sm" onclick="resendEmail()">
                Resend Reset Code
            </button>
        </div>
    `;
    successMessage.insertAdjacentHTML('beforeend', resendHtml);
}

// Resend email function
async function resendEmail() {
    const email = document.getElementById('email').value.trim();
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            showToast('Reset code sent again! Please check your email.', 'success');
            
            // Hide resend button temporarily
            const resendBtn = event.target;
            resendBtn.disabled = true;
            resendBtn.textContent = 'Sent!';
            
            setTimeout(() => {
                resendBtn.disabled = false;
                resendBtn.textContent = 'Resend Reset Code';
            }, 60000); // 1 minute cooldown
        } else {
            throw new Error(data.message || 'Failed to resend email');
        }
    } catch (error) {
        showToast('Failed to resend email. Please try again.', 'error');
    }
}

// Make resendEmail global
window.resendEmail = resendEmail;

// Disable form after successful submission
function disableForm() {
    const form = document.getElementById('forgotPasswordForm');
    const inputs = form.querySelectorAll('input, button');
    
    inputs.forEach(input => {
        input.disabled = true;
    });
}

// Toast notification function
function showToast(message, type = 'info') {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
        toastContainer.style.zIndex = '9999';
        document.body.appendChild(toastContainer);
    }
    
    const toastId = 'toast-' + Date.now();
    const toastHtml = `
        <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header">
                <div class="rounded me-2" style="width: 20px; height: 20px; background-color: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};"></div>
                <strong class="me-auto">Unimerch</strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        </div>
    `;
    
    toastContainer.insertAdjacentHTML('beforeend', toastHtml);
    
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
    
    // Remove toast element after it's hidden
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Focus on email input
    document.getElementById('email').focus();
    
    // Check if there's an email from URL parameters (optional)
    const urlParams = new URLSearchParams(window.location.search);
    const emailParam = urlParams.get('email');
    if (emailParam) {
        document.getElementById('email').value = emailParam;
    }
});

// Handle browser back button
window.addEventListener('beforeunload', function(e) {
    // Optional: Warn user if they're navigating away after successful submission
    const successMessage = document.getElementById('successMessage');
    if (!successMessage.classList.contains('d-none')) {
        const confirmationMessage = 'You have successfully requested a password reset. Are you sure you want to leave?';
        e.returnValue = confirmationMessage;
        return confirmationMessage;
    }
});