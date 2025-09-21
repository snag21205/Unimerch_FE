// Register Page JavaScript - API Integration

// API Configuration
const API_BASE_URL = 'https://api.unimerch.space';

// Form validation and submission
document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Check if passwords match
    if (password !== confirmPassword) {
        document.getElementById('confirmPassword').setCustomValidity('Passwords do not match');
    } else {
        document.getElementById('confirmPassword').setCustomValidity('');
    }
    
    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
        document.getElementById('password').setCustomValidity('Password does not meet all requirements');
        showToast('Password must contain at least 8 characters, 1 uppercase letter, 1 number, and 1 special character.', 'error');
        this.classList.add('was-validated');
        return;
    } else {
        document.getElementById('password').setCustomValidity('');
    }
    
    // Validate form
    if (!this.checkValidity()) {
        e.stopPropagation();
        this.classList.add('was-validated');
        return;
    }
    
    // Collect form data
    const formData = {
        username: document.getElementById('username').value.trim(),
        email: document.getElementById('email').value.trim(),
        password: password,
        fullName: document.getElementById('fullName').value.trim()
    };
    
    // Add optional fields if provided
    const studentId = document.getElementById('studentId').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();
    
    if (studentId) formData.studentId = studentId;
    if (phone) formData.phone = phone;
    if (address) formData.address = address;
    
    // Show loading state
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
        <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
        Creating Account...
    `;
    
    try {
        // Call register API using API service
        const data = await apiService.register(formData);
        
        // Handle successful registration
        if (data.success && data.data) {
            // Store auth token and user info using API service
            apiService.setToken(data.data.token);
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userInfo', JSON.stringify(data.data.user));
            localStorage.setItem('username', data.data.user.fullName || data.data.user.username);
            localStorage.setItem('userEmail', data.data.user.email);
            
            // Show success message
            showToast('Account created successfully! Welcome to Unimerch!', 'success');
            
            // Redirect after short delay
            setTimeout(() => {
                window.location.href = '../../index.html';
            }, 1500);
        } else {
            throw new Error('Invalid response format');
        }
        
    } catch (error) {
        console.error('Registration error:', error);
        
        // Handle specific error messages
        let errorMessage = error.message;
        
        // Handle validation errors
        if (error.message.includes('Email đã được sử dụng') || error.message.includes('email already exists')) {
            errorMessage = 'This email is already registered. Please use a different email or try logging in.';
            document.getElementById('email').classList.add('is-invalid');
        } else if (error.message.includes('Username đã tồn tại') || error.message.includes('username already exists')) {
            errorMessage = 'This username is already taken. Please choose a different username.';
            document.getElementById('username').classList.add('is-invalid');
        } else if (error.message.includes('validation') || error.message.includes('invalid')) {
            errorMessage = 'Please check your input and try again.';
        }
        
        showToast(`Registration failed: ${errorMessage}`, 'error');
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
});

// Toggle password visibility
function togglePassword(inputId) {
    const passwordInput = document.getElementById(inputId);
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    
    // Update icon
    const button = passwordInput.nextElementSibling;
    const svg = button.querySelector('svg');
    
    if (type === 'text') {
        svg.innerHTML = `
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
            <line x1="1" y1="1" x2="23" y2="23"></line>
        `;
    } else {
        svg.innerHTML = `
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
        `;
    }
}

// Real-time password confirmation validation
document.getElementById('confirmPassword').addEventListener('input', function() {
    const password = document.getElementById('password').value;
    const confirmPassword = this.value;
    
    if (password !== confirmPassword) {
        this.setCustomValidity('Passwords do not match');
        this.classList.add('is-invalid');
    } else {
        this.setCustomValidity('');
        this.classList.remove('is-invalid');
    }
});

// Clear validation errors on input
['username', 'email', 'fullName', 'password'].forEach(fieldId => {
    document.getElementById(fieldId).addEventListener('input', function() {
        this.classList.remove('is-invalid');
    });
});

// Email format validation
document.getElementById('email').addEventListener('blur', function() {
    const email = this.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (email && !emailRegex.test(email)) {
        this.setCustomValidity('Please enter a valid email address');
        this.classList.add('is-invalid');
    } else {
        this.setCustomValidity('');
        this.classList.remove('is-invalid');
    }
});

// Password strength validation
document.getElementById('password').addEventListener('input', function() {
    const password = this.value;
    const isValid = validatePasswordStrength(password);
    
    if (password && !isValid.valid) {
        this.setCustomValidity('Password does not meet all requirements');
        this.classList.add('is-invalid');
    } else {
        this.setCustomValidity('');
        this.classList.remove('is-invalid');
    }
    
    // Update visual indicators
    updatePasswordRequirements(password);
});

// Password strength validation function
function validatePasswordStrength(password) {
    const requirements = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };
    
    const valid = Object.values(requirements).every(req => req);
    
    return {
        valid,
        requirements
    };
}

// Update password requirements visual indicators
function updatePasswordRequirements(password) {
    const validation = validatePasswordStrength(password);
    const requirements = validation.requirements;
    
    // Update each requirement indicator
    updateRequirementIndicator('length-req', requirements.length);
    updateRequirementIndicator('uppercase-req', requirements.uppercase);
    updateRequirementIndicator('number-req', requirements.number);
    updateRequirementIndicator('special-req', requirements.special);
}

// Helper function to update individual requirement indicator
function updateRequirementIndicator(elementId, isValid) {
    const element = document.getElementById(elementId);
    if (element) {
        const originalText = element.textContent.replace(/^[✓✗•]\s*/, '');
        
        if (isValid) {
            element.className = 'text-success';
            element.innerHTML = `<span style="color: #10b981; font-weight: bold;">✓</span> ${originalText}`;
        } else {
            element.className = 'text-muted';
            element.innerHTML = `<span style="color: #6b7280;">•</span> ${originalText}`;
        }
    }
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

// Make functions global for HTML onclick handlers
window.togglePassword = togglePassword;