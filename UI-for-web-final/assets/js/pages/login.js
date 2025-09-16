// Form validation and submission
        document.getElementById('loginForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (!this.checkValidity()) {
                e.stopPropagation();
                this.classList.add('was-validated');
                return;
            }
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            // Simple validation (replace with real authentication)
            if (username && password) {
                // Store login state
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('username', username);
                
                // Show success message and redirect
                alert('Login successful! Welcome back!');
                window.location.href = '../../index.html';
            }
        });
        
        // Toggle password visibility
        function togglePassword() {
            const passwordInput = document.getElementById('password');
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
        }