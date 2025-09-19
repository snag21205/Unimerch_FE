// Function to handle sign in
async function handleSignIn() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Validate input
    if (!username || !password) {
        alert('Please enter both username and password');
        return;
    }
    
    try {
        const response = await fetch('https://api.unimerch.space/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: username,
                password: password
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error("Login failed: " + (data.message || response.statusText));
        }
        
        
        
        // Store auth token from data.data.token
        if (data.data && data.data.token) {
            localStorage.setItem('authToken', data.data.token);
        }

      
        
        
        // Store user info from API response (data.data.user)
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userInfo', JSON.stringify(data.data.user || { email: username }));
        localStorage.setItem('username', data.data.user?.fullName || data.data.user?.username || username);
        localStorage.setItem('userEmail', data.data.user?.email || username);
        
        alert('Login successful! Welcome back!');
        window.location.href = '../../index.html';
    

}
    catch (error) {
            console.error('Error during login:', error);
            alert('Login failed: ' + error.message);
        }
}

// Form validation and submission
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    handleSignIn();
});

// Toggle password visibility
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
}

