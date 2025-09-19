// Register Page JavaScript

// Form validation and submission
document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Check if passwords match
    if (password !== confirmPassword) {
        document.getElementById('confirmPassword').setCustomValidity('Passwords do not match');
    } else {
        document.getElementById('confirmPassword').setCustomValidity('');
    }
    
    if (!this.checkValidity()) {
        e.stopPropagation();
        this.classList.add('was-validated');
        return;
    }
    
    const username = document.getElementById('username').value;
    
    // Simple registration (replace with real registration)
    if (username && password && confirmPassword) {
        // Store registration data
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', username);
        
        // Show success message and redirect
        alert('Account created successfully! Welcome to UEH Merch!');
        window.location.href = 'index.html';
    }
});

// Toggle password visibility
function togglePassword(inputId) {
    const passwordInput = document.getElementById(inputId);
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
}

// Real-time password confirmation validation
document.getElementById('confirmPassword').addEventListener('input', function() {
    const password = document.getElementById('password').value;
    const confirmPassword = this.value;
    
    if (password !== confirmPassword) {
        this.setCustomValidity('Passwords do not match');
    } else {
        this.setCustomValidity('');
    }
});