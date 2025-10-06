// Auth Protection Script
// Check if user is logged in
if (localStorage.getItem('isLoggedIn') !== 'true') {
    alert('Please login to access this page');
    window.location.href = '../auth/login.html';
}