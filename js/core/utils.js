/**
 * Utilities for Unimerch Frontend
 * Common functions for UI, validation, and state management
 */

class UiUtils {
    /**
     * Show Bootstrap toast notification
     */
    static showToast(message, type = 'info', duration = 5000) {
        // Remove any existing toasts
        const existingToasts = document.querySelectorAll('.toast');
        existingToasts.forEach(toast => toast.remove());

        // Create toast HTML
        const toastId = `toast-${Date.now()}`;
        const iconClass = {
            'success': 'bi-check-circle-fill text-success',
            'error': 'bi-exclamation-triangle-fill text-danger',
            'warning': 'bi-exclamation-triangle-fill text-warning',
            'info': 'bi-info-circle-fill text-info'
        }[type] || 'bi-info-circle-fill text-info';

        const toastHtml = `
            <div class="toast align-items-center border-0" id="${toastId}" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="${duration}">
                <div class="d-flex">
                    <div class="toast-body d-flex align-items-center">
                        <i class="bi ${iconClass} me-2 fs-5"></i>
                        ${message}
                    </div>
                    <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>
        `;

        // Create or get toast container
        let toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
            toastContainer.style.zIndex = '9999';
            document.body.appendChild(toastContainer);
        }

        // Add toast to container
        toastContainer.insertAdjacentHTML('beforeend', toastHtml);

        // Initialize and show toast
        const toastElement = document.getElementById(toastId);
        const bsToast = new bootstrap.Toast(toastElement);
        bsToast.show();

        // Auto remove from DOM after hide
        toastElement.addEventListener('hidden.bs.toast', () => {
            toastElement.remove();
        });

        return bsToast;
    }

    /**
     * Show loading overlay
     */
    static showLoading(target = 'body', message = 'Loading...') {
        const loadingId = 'loading-overlay';
        const existingLoading = document.getElementById(loadingId);
        
        if (existingLoading) {
            existingLoading.remove();
        }

        const loadingHtml = `
            <div id="${loadingId}" class="loading-overlay position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style="background: rgba(0,0,0,0.5); z-index: 10000;">
                <div class="bg-white rounded p-4 text-center">
                    <div class="spinner-border text-primary mb-3" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <div class="fw-medium">${message}</div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', loadingHtml);
    }

    /**
     * Hide loading overlay
     */
    static hideLoading() {
        const loading = document.getElementById('loading-overlay');
        if (loading) {
            loading.remove();
        }
    }

    /**
     * Set button loading state
     */
    static setButtonLoading(button, loading = true, loadingText = 'Loading...') {
        if (loading) {
            button.dataset.originalText = button.innerHTML;
            button.disabled = true;
            button.innerHTML = `
                <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                ${loadingText}
            `;
        } else {
            button.disabled = false;
            button.innerHTML = button.dataset.originalText || 'Submit';
            delete button.dataset.originalText;
        }
    }

    /**
     * Show field error
     */
    static showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const feedback = field.parentElement.querySelector('.invalid-feedback') || 
                        field.parentElement.querySelector('.error-message');
        
        field.classList.add('is-invalid');
        
        if (feedback) {
            feedback.textContent = message;
            feedback.style.display = 'block';
        } else {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'invalid-feedback error-message';
            errorDiv.textContent = message;
            field.parentElement.appendChild(errorDiv);
        }
    }

    /**
     * Clear field error
     */
    static clearFieldError(fieldId) {
        const field = document.getElementById(fieldId);
        const feedback = field.parentElement.querySelector('.invalid-feedback') || 
                        field.parentElement.querySelector('.error-message');
        
        field.classList.remove('is-invalid');
        
        if (feedback) {
            feedback.style.display = 'none';
        }
    }

    /**
     * Clear all form errors
     */
    static clearFormErrors(form) {
        const fields = form.querySelectorAll('.is-invalid');
        const feedbacks = form.querySelectorAll('.invalid-feedback, .error-message');
        
        fields.forEach(field => field.classList.remove('is-invalid'));
        feedbacks.forEach(feedback => feedback.style.display = 'none');
    }
}

class ValidationUtils {
    /**
     * Validate email format
     */
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Validate password strength
     */
    static validatePassword(password) {
        const result = {
            isValid: true,
            errors: [],
            strength: 'weak'
        };

        if (password.length < 8) {
            result.isValid = false;
            result.errors.push('Password must be at least 8 characters long');
        }

        if (!/[A-Z]/.test(password)) {
            result.isValid = false;
            result.errors.push('Password must contain at least one uppercase letter');
        }

        if (!/[0-9]/.test(password)) {
            result.isValid = false;
            result.errors.push('Password must contain at least one number');
        }

        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            result.isValid = false;
            result.errors.push('Password must contain at least one special character');
        }

        // Calculate strength
        let score = 0;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

        if (score >= 4) result.strength = 'strong';
        else if (score >= 3) result.strength = 'medium';
        else result.strength = 'weak';

        return result;
    }

    /**
     * Validate phone number (Vietnamese format)
     */
    static isValidPhone(phone) {
        const phoneRegex = /^(0|\+84)[3-9]\d{8}$/;
        return phoneRegex.test(phone);
    }

    /**
     * Validate required field
     */
    static isRequired(value) {
        return value && value.trim().length > 0;
    }

    /**
     * Validate student ID format
     */
    static isValidStudentId(studentId) {
        // Assuming format like: 20210001, 2021001, etc.
        const studentIdRegex = /^\d{6,8}$/;
        return studentIdRegex.test(studentId);
    }
}

class StorageUtils {
    /**
     * Set item in localStorage with error handling
     */
    static setItem(key, value) {
        try {
            const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
            localStorage.setItem(key, serializedValue);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Get item from localStorage with error handling
     */
    static getItem(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            if (item === null) return defaultValue;
            
            // Try to parse as JSON, fallback to string
            try {
                return JSON.parse(item);
            } catch {
                return item;
            }
        } catch (error) {
            return defaultValue;
        }
    }

    /**
     * Remove item from localStorage
     */
    static removeItem(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Clear all localStorage data
     */
    static clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            return false;
        }
    }
}

class AuthUtils {
    /**
     * Check if user is authenticated
     */
    static isAuthenticated() {
        return apiService ? apiService.isAuthenticated() : !!localStorage.getItem('token');
    }

    /**
     * Get current user info
     */
    static getCurrentUser() {
        return StorageUtils.getItem('userInfo', null);
    }

    /**
     * Logout user and redirect
     */
    static async logout(redirectUrl = '/pages/auth/login.html') {
        try {
            if (apiService) {
                await apiService.logout();
            } else {
                localStorage.removeItem('token');
                localStorage.removeItem('userInfo');
                localStorage.removeItem('isLoggedIn');
            }
        } catch (error) {
            // Silent fail
        } finally {
            window.location.href = redirectUrl;
        }
    }

    /**
     * Redirect to login if not authenticated
     */
    static requireAuth(redirectUrl = '/pages/auth/login.html') {
        if (!this.isAuthenticated()) {
            window.location.href = redirectUrl;
            return false;
        }
        return true;
    }
}

// Make utilities available globally
window.UiUtils = UiUtils;
window.ValidationUtils = ValidationUtils;
window.StorageUtils = StorageUtils;
window.AuthUtils = AuthUtils;

// Legacy function aliases for backward compatibility
window.showToast = UiUtils.showToast;
window.isValidEmail = ValidationUtils.isValidEmail;
window.showFieldError = UiUtils.showFieldError;
window.clearFieldError = UiUtils.clearFieldError;