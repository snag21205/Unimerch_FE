/**
 * Utilities for Unimerch Frontend
 * Common functions for UI, validation, and state management
 */

// Store native functions BEFORE override (for fallback)
// These are stored at module level to be accessible in all functions
let nativeAlert = null;
let nativeConfirm = null;

// Initialize native functions reference (only if not already overridden)
if (window.alert && typeof window.alert === 'function') {
    try {
        // Try to get native alert by checking if it's the browser's native one
        const alertString = window.alert.toString();
        if (!alertString.includes('[native code]') && !alertString.includes('UiUtils')) {
            // It's already been overridden, we'll handle it differently
            nativeAlert = null;
        } else {
            nativeAlert = window.alert.bind(window);
        }
    } catch (e) {
        nativeAlert = window.alert.bind(window);
    }
}

if (window.confirm && typeof window.confirm === 'function') {
    try {
        const confirmString = window.confirm.toString();
        if (!confirmString.includes('[native code]') && !confirmString.includes('UiUtils')) {
            nativeConfirm = null;
        } else {
            nativeConfirm = window.confirm.bind(window);
        }
    } catch (e) {
        nativeConfirm = window.confirm.bind(window);
    }
}

class UiUtils {
    /**
     * Show Bootstrap toast notification with dark theme styling
     */
    static showToast(message, type = 'info', duration = 3000) {
        // Remove any existing toasts
        const existingToasts = document.querySelectorAll('.toast');
        existingToasts.forEach(toast => toast.remove());

        // Create toast HTML
        const toastId = `toast-${Date.now()}`;
        
        // Icon and color classes based on type
        const iconClass = {
            'success': 'bi-check-circle-fill',
            'error': 'bi-exclamation-triangle-fill',
            'warning': 'bi-exclamation-triangle-fill',
            'info': 'bi-info-circle-fill'
        }[type] || 'bi-info-circle-fill';

        // Dark theme colors to match website design - solid backgrounds
        const colorStyles = {
            'success': 'background: #18b0b4; border: 1px solid #18b0b4; color: #ffffff;',
            'error': 'background: #ef4444; border: 1px solid #ef4444; color: #ffffff;',
            'warning': 'background: #f59e0b; border: 1px solid #f59e0b; color: #ffffff;',
            'info': 'background: #16181d; border: 1px solid rgba(255, 255, 255, 0.2); color: #f1f3f5;'
        }[type] || 'background: #16181d; border: 1px solid rgba(255, 255, 255, 0.2); color: #f1f3f5;';

        const toastHtml = `
            <div class="toast align-items-center" id="${toastId}" role="alert" aria-live="assertive" aria-atomic="true" 
                 data-bs-delay="${duration}" 
                 style="${colorStyles} border-radius: 12px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5); min-width: 250px; font-weight: 500;">
                <div class="d-flex">
                    <div class="toast-body d-flex align-items-center" style="padding: 1rem 1.5rem;">
                        <i class="bi ${iconClass} me-2 fs-5"></i>
                        ${message}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close" style="opacity: 0.5;"></button>
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
     * Show custom alert dialog (Chrome-like style)
     * @param {string} message - Alert message
     * @param {string} title - Alert title (optional)
     * @returns {Promise} Resolves when user clicks OK
     */
    static async alert(message, title = 'Thông báo') {
        return new Promise((resolve) => {
            // Wait for Bootstrap to be available
            if (typeof bootstrap === 'undefined') {
                console.warn('Bootstrap not loaded, using native alert');
                if (nativeAlert) {
                    nativeAlert(message);
                } else {
                    // Last resort: try to use browser's native alert
                    // This is a fallback if we can't get the native function
                    const iframe = document.createElement('iframe');
                    iframe.style.display = 'none';
                    document.body.appendChild(iframe);
                    iframe.contentWindow.alert(message);
                    document.body.removeChild(iframe);
                }
                resolve();
                return;
            }

            // Remove any existing alert
            const existingAlert = document.getElementById('custom-alert-modal');
            if (existingAlert) {
                existingAlert.remove();
            }

            const alertId = 'custom-alert-modal';
            const alertHtml = `
                <div class="modal fade" id="${alertId}" tabindex="-1" aria-labelledby="${alertId}Label" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
                    <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content" style="background: var(--card-dark); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);">
                            <div class="modal-header border-0 pb-2" style="border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;">
                                <h5 class="modal-title" id="${alertId}Label" style="color: var(--text-light); font-weight: 600; font-size: 1.1rem;">${title}</h5>
                                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close" style="opacity: 0.5;"></button>
                            </div>
                            <div class="modal-body pt-3 pb-3" style="color: var(--text-light);">
                                <p class="mb-0" style="font-size: 0.95rem; line-height: 1.6;">${message}</p>
                            </div>
                            <div class="modal-footer border-0 pt-2">
                                <button type="button" class="btn btn-primary-custom" data-bs-dismiss="modal" id="${alertId}-ok-btn" style="
                                    background: var(--accent);
                                    color: white;
                                    border: none;
                                    padding: 0.5rem 1.5rem;
                                    border-radius: 8px;
                                    font-weight: 600;
                                    font-size: 0.9rem;
                                    transition: all 0.3s ease;
                                ">
                                    OK
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            document.body.insertAdjacentHTML('beforeend', alertHtml);

            // Use setTimeout to ensure DOM is ready
            setTimeout(() => {
                const modalElement = document.getElementById(alertId);
                if (!modalElement) {
                    console.error('Failed to create alert modal');
                    resolve();
                    return;
                }

                const modal = new bootstrap.Modal(modalElement);
                
                // Handle OK button click
                const okBtn = document.getElementById(`${alertId}-ok-btn`);
                if (okBtn) {
                    okBtn.addEventListener('click', () => {
                        resolve();
                    });
                }

                // Handle modal close events
                modalElement.addEventListener('hidden.bs.modal', () => {
                    modalElement.remove();
                    resolve();
                });

                // Add hover effect to OK button
                if (okBtn) {
                    okBtn.addEventListener('mouseenter', function() {
                        this.style.background = '#1ac4c9';
                        this.style.transform = 'translateY(-1px)';
                    });
                    okBtn.addEventListener('mouseleave', function() {
                        this.style.background = 'var(--accent)';
                        this.style.transform = 'translateY(0)';
                    });
                }

                // Show modal
                modal.show();
            }, 10);
        });
    }

    /**
     * Show custom confirm dialog (Chrome-like style)
     * @param {string} message - Confirm message
     * @param {string} title - Confirm title (optional)
     * @returns {Promise<boolean>} Resolves with true if OK, false if Cancel
     */
    static async confirm(message, title = 'Xác nhận') {
        return new Promise((resolve) => {
            // Remove any existing confirm
            const existingConfirm = document.getElementById('custom-confirm-modal');
            if (existingConfirm) {
                existingConfirm.remove();
            }

            const confirmId = 'custom-confirm-modal';
            const confirmHtml = `
                <div class="modal fade" id="${confirmId}" tabindex="-1" aria-labelledby="${confirmId}Label" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
                    <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content" style="background: var(--card-dark); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);">
                            <div class="modal-header border-0 pb-2" style="border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;">
                                <h5 class="modal-title" id="${confirmId}Label" style="color: var(--text-light); font-weight: 600; font-size: 1.1rem;">${title}</h5>
                                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close" style="opacity: 0.5;"></button>
                            </div>
                            <div class="modal-body pt-3 pb-3" style="color: var(--text-light);">
                                <p class="mb-0" style="font-size: 0.95rem; line-height: 1.6;">${message}</p>
                            </div>
                            <div class="modal-footer border-0 pt-2 d-flex justify-content-end gap-2">
                                <button type="button" class="btn" data-bs-dismiss="modal" id="${confirmId}-cancel-btn" style="
                                    background: rgba(255, 255, 255, 0.05);
                                    color: var(--text-light);
                                    border: 1px solid rgba(255, 255, 255, 0.2);
                                    padding: 0.5rem 1.5rem;
                                    border-radius: 8px;
                                    font-weight: 600;
                                    font-size: 0.9rem;
                                    transition: all 0.3s ease;
                                ">
                                    Hủy
                                </button>
                                <button type="button" class="btn btn-primary-custom" data-bs-dismiss="modal" id="${confirmId}-ok-btn" style="
                                    background: var(--accent);
                                    color: white;
                                    border: none;
                                    padding: 0.5rem 1.5rem;
                                    border-radius: 8px;
                                    font-weight: 600;
                                    font-size: 0.9rem;
                                    transition: all 0.3s ease;
                                ">
                                    OK
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            document.body.insertAdjacentHTML('beforeend', confirmHtml);

            const modalElement = document.getElementById(confirmId);
            const modal = new bootstrap.Modal(modalElement);
            
            let resolved = false;
            
            // Handle OK button click
            const okBtn = document.getElementById(`${confirmId}-ok-btn`);
            okBtn.addEventListener('click', () => {
                if (!resolved) {
                    resolved = true;
                    resolve(true);
                }
            });

            // Handle Cancel button click
            const cancelBtn = document.getElementById(`${confirmId}-cancel-btn`);
            cancelBtn.addEventListener('click', () => {
                if (!resolved) {
                    resolved = true;
                    resolve(false);
                }
            });

            // Handle modal close events
            modalElement.addEventListener('hidden.bs.modal', () => {
                modalElement.remove();
                if (!resolved) {
                    resolved = true;
                    resolve(false);
                }
            });

            // Add hover effects
            okBtn.addEventListener('mouseenter', function() {
                this.style.background = '#1ac4c9';
                this.style.transform = 'translateY(-1px)';
            });
            okBtn.addEventListener('mouseleave', function() {
                this.style.background = 'var(--accent)';
                this.style.transform = 'translateY(0)';
            });

            cancelBtn.addEventListener('mouseenter', function() {
                this.style.background = 'rgba(255, 255, 255, 0.1)';
            });
            cancelBtn.addEventListener('mouseleave', function() {
                this.style.background = 'rgba(255, 255, 255, 0.05)';
            });

            // Show modal
            modal.show();
        });
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

// Override native alert and confirm with custom dialogs
// Note: These are async, so use await when needed
window.alert = function(message) {
    // Check if Bootstrap is available
    if (typeof bootstrap === 'undefined') {
        // Fallback to native alert if Bootstrap not loaded
        if (nativeAlert) {
            return nativeAlert(message);
        }
        // Last resort: try iframe method
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        iframe.contentWindow.alert(message);
        document.body.removeChild(iframe);
        return;
    }
    return UiUtils.alert(message);
};

window.confirm = function(message) {
    // Check if Bootstrap is available
    if (typeof bootstrap === 'undefined') {
        // Fallback to native confirm if Bootstrap not loaded
        if (nativeConfirm) {
            return nativeConfirm(message);
        }
        // Last resort: try iframe method
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        const result = iframe.contentWindow.confirm(message);
        document.body.removeChild(iframe);
        return result;
    }
    return UiUtils.confirm(message);
};