// UEH Merch Store - Profile Page JavaScript

// Sample order data for demonstration
const sampleOrders = [
    {
        id: 'ORD-2024-001',
        date: '2024-03-15',
        status: 'completed',
        total: 1125000,
        items: [
            { name: 'UEH Classic Hoodie', quantity: 1, price: 1125000, image: 'shirt.png' },
            { name: 'UEH Economics Tee', quantity: 1, price: 625000, image: 'shirt.png' }
        ]
    },
    {
        id: 'ORD-2024-002',
        date: '2024-03-20',
        status: 'shipping',
        total: 875000,
        items: [
            { name: 'UEH Varsity Cap', quantity: 1, price: 550000, image: 'shirt.png' },
            { name: 'UEH Water Bottle', quantity: 1, price: 450000, image: 'shirt.png' }
        ]
    },
    {
        id: 'ORD-2024-003',
        date: '2024-03-25',
        status: 'pending',
        total: 800000,
        items: [
            { name: 'UEH Business Tote', quantity: 1, price: 875000, image: 'shirt.png' }
        ]
    }
];

// Global variables
let currentUser = JSON.parse(localStorage.getItem('ueh-user')) || null;
let userProfile = JSON.parse(localStorage.getItem('ueh-profile')) || {};
let userOrders = JSON.parse(localStorage.getItem('ueh-orders')) || sampleOrders;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    loadProfileData();
    setupEventListeners();
    renderOrderHistory();
});

// Check if user is authenticated
function checkAuth() {
    if (!currentUser) {
        // Redirect to login if not authenticated
        window.location.href = 'login.html';
        return;
    }
    
    // Update header information
    updateHeaderInfo();
}

// Update header information
function updateHeaderInfo() {
    const profileAvatar = document.getElementById('profileAvatar');
    const headerName = document.getElementById('headerName');
    const headerEmail = document.getElementById('headerEmail');
    
    if (currentUser) {
        const firstName = userProfile.firstName || currentUser.fullName?.split(' ')[0] || currentUser.email.split('@')[0];
        const fullName = userProfile.firstName && userProfile.lastName 
            ? `${userProfile.firstName} ${userProfile.lastName}` 
            : currentUser.fullName || firstName;
        
        profileAvatar.textContent = firstName.charAt(0).toUpperCase();
        headerName.textContent = fullName;
        headerEmail.textContent = currentUser.email;
    }
}

// Load profile data into form
function loadProfileData() {
    if (currentUser) {
        // Parse full name if available
        const nameParts = currentUser.fullName ? currentUser.fullName.split(' ') : [];
        
        document.getElementById('firstName').value = userProfile.firstName || nameParts[0] || '';
        document.getElementById('lastName').value = userProfile.lastName || nameParts.slice(1).join(' ') || '';
        document.getElementById('email').value = currentUser.email || '';
        document.getElementById('phone').value = userProfile.phone || '';
        document.getElementById('studentId').value = userProfile.studentId || '';
        document.getElementById('faculty').value = userProfile.faculty || '';
        document.getElementById('address').value = userProfile.address || '';
    }
}

// Setup event listeners
function setupEventListeners() {
    // Personal info form
    document.getElementById('personalInfoForm').addEventListener('submit', savePersonalInfo);
    
    // Change password form
    document.getElementById('changePasswordForm').addEventListener('submit', changePassword);
    
    // Order filter
    document.getElementById('orderFilter').addEventListener('change', filterOrders);
    
    // Notification preferences
    document.getElementById('emailNotifications').addEventListener('change', saveNotificationPreferences);
    document.getElementById('promotionalEmails').addEventListener('change', saveNotificationPreferences);
}

// Save personal information
function savePersonalInfo(e) {
    e.preventDefault();
    
    const formData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        studentId: document.getElementById('studentId').value,
        faculty: document.getElementById('faculty').value,
        address: document.getElementById('address').value
    };
    
    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.email) {
        showToast('Please fill in all required fields', 'error');
        return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        showToast('Please enter a valid email address', 'error');
        return;
    }
    
    // Validate phone number
    if (formData.phone && !/^[\+]?[0-9\s\-\(\)]{10,}$/.test(formData.phone)) {
        showToast('Please enter a valid phone number', 'error');
        return;
    }
    
    // Save to localStorage
    userProfile = { ...userProfile, ...formData };
    localStorage.setItem('ueh-profile', JSON.stringify(userProfile));
    
    // Update current user info
    currentUser.email = formData.email;
    currentUser.fullName = `${formData.firstName} ${formData.lastName}`;
    localStorage.setItem('ueh-user', JSON.stringify(currentUser));
    
    // Update header
    updateHeaderInfo();
    
    showToast('Profile updated successfully!', 'success');
}

// Change password
function changePassword(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validate inputs
    if (!currentPassword || !newPassword || !confirmPassword) {
        showToast('Please fill in all password fields', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showToast('New passwords do not match', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        showToast('New password must be at least 6 characters long', 'error');
        return;
    }
    
    // In a real app, you would verify the current password with the server
    // For demo purposes, we'll just simulate success
    showToast('Password updated successfully!', 'success');
    
    // Clear form
    document.getElementById('changePasswordForm').reset();
}

// Save notification preferences
function saveNotificationPreferences() {
    const preferences = {
        emailNotifications: document.getElementById('emailNotifications').checked,
        promotionalEmails: document.getElementById('promotionalEmails').checked
    };
    
    userProfile.notifications = preferences;
    localStorage.setItem('ueh-profile', JSON.stringify(userProfile));
    
    showToast('Notification preferences saved', 'success');
}

// Render order history
function renderOrderHistory(orders = userOrders) {
    const ordersList = document.getElementById('ordersList');
    
    if (orders.length === 0) {
        ordersList.innerHTML = `
            <div class="text-center py-5">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" class="text-muted mb-3">
                    <circle cx="8" cy="21" r="1"></circle>
                    <circle cx="19" cy="21" r="1"></circle>
                    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57L20.5 9H5.12"></path>
                </svg>
                <h6 class="text-muted">No orders found</h6>
                <p class="text-muted mb-0">You haven't placed any orders yet.</p>
            </div>
        `;
        return;
    }
    
    ordersList.innerHTML = orders.map(order => `
        <div class="order-item p-4 mb-3">
            <div class="d-flex justify-content-between align-items-start mb-3">
                <div>
                    <h6 class="mb-1">Order ${order.id}</h6>
                    <small class="text-muted">${formatDate(order.date)}</small>
                </div>
                <span class="order-status status-${order.status}">${capitalizeFirst(order.status)}</span>
            </div>
            
            <div class="row">
                <div class="col-md-8">
                    <div class="order-items">
                        ${order.items.map(item => `
                            <div class="d-flex align-items-center mb-2">
                                <img src="${item.image}" alt="${item.name}" class="rounded me-3" style="width: 50px; height: 50px; object-fit: cover;">
                                <div class="flex-grow-1">
                                    <div class="fw-medium">${item.name}</div>
                                    <small class="text-muted">Quantity: ${item.quantity}</small>
                                </div>
                                <div class="text-end">
                                    <div class="fw-medium">${formatPrice(item.price)}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="col-md-4 text-md-end">
                    <div class="mb-2">
                        <strong>Total: ${formatPrice(order.total)}</strong>
                    </div>
                    <div class="d-flex flex-md-column gap-2">
                        <button class="btn btn-outline-primary btn-sm" onclick="viewOrderDetails('${order.id}')">View Details</button>
                        ${order.status === 'completed' ? '<button class="btn btn-outline-secondary btn-sm" onclick="reorderItems(\'' + order.id + '\')">Reorder</button>' : ''}
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Filter orders
function filterOrders() {
    const filterValue = document.getElementById('orderFilter').value;
    const filteredOrders = filterValue === 'all' 
        ? userOrders 
        : userOrders.filter(order => order.status === filterValue);
    
    renderOrderHistory(filteredOrders);
}

// Helper functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price);
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    const toastId = 'toast-' + Date.now();
    
    const toastHtml = `
        <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header">
                <div class="rounded me-2" style="width: 20px; height: 20px; background-color: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};"></div>
                <strong class="me-auto">UEH Merch</strong>
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

// Order actions
function viewOrderDetails(orderId) {
    const order = userOrders.find(o => o.id === orderId);
    if (order) {
        alert(`Order Details for ${orderId}:\n\nStatus: ${order.status}\nDate: ${formatDate(order.date)}\nTotal: ${formatPrice(order.total)}\n\nItems:\n${order.items.map(item => `- ${item.name} (${item.quantity}x)`).join('\n')}`);
    }
}

function reorderItems(orderId) {
    const order = userOrders.find(o => o.id === orderId);
    if (order) {
        // In a real app, you would add these items to the cart
        showToast(`${order.items.length} items added to cart from order ${orderId}`, 'success');
    }
}

function confirmDeleteAccount() {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        // In a real app, you would make an API call to delete the account
        localStorage.removeItem('ueh-user');
        localStorage.removeItem('ueh-profile');
        localStorage.removeItem('ueh-orders');
        alert('Account deleted successfully. You will be redirected to the home page.');
        window.location.href = 'index.html';
    }
}

// Global functions
window.viewOrderDetails = viewOrderDetails;
window.reorderItems = reorderItems;
window.confirmDeleteAccount = confirmDeleteAccount;