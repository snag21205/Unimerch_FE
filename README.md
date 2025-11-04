# 🎓 Unimerch - Nền tảng Thương mại Điện tử Hàng Hóa Đại học

<div align="center">

![Unimerch Banner](https://img.shields.io/badge/Unimerch-2025-0F766E?style=for-the-badge)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![Version](https://img.shields.io/badge/Version-1.0.0-green.svg?style=for-the-badge)](package.json)

**Nền tảng mua sắm trực tuyến dành cho sinh viên UEH - Bộ sưu tập Campus 2025**

[Tính năng](#-tính-năng-chính) • [Cài đặt](#-cài-đặt) • [Cấu trúc](#-cấu-trúc-dự-án) • [API](#-api-tích-hợp) • [Đóng góp](#-đóng-góp)

</div>

---

## 📋 Mục Lục

- [Giới thiệu](#-giới-thiệu)
- [Tính năng chính](#-tính-năng-chính)
- [Demo & Screenshots](#-demo--screenshots)
- [Công nghệ sử dụng](#️-công-nghệ-sử-dụng)
- [Yêu cầu hệ thống](#-yêu-cầu-hệ-thống)
- [Cài đặt](#-cài-đặt)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [API tích hợp](#-api-tích-hợp)
- [Hướng dẫn phát triển](#-hướng-dẫn-phát-triển)
- [Vai trò người dùng](#-vai-trò-người-dùng)
- [Tính năng theo vai trò](#-tính-năng-theo-vai-trò)
- [Triển khai](#-triển-khai)
- [Troubleshooting](#-troubleshooting)
- [Đóng góp](#-đóng-góp)
- [License](#-license)
- [Liên hệ](#-liên-hệ)

---

## 🎯 Giới thiệu

**Unimerch** là nền tảng thương mại điện tử hiện đại được thiết kế đặc biệt cho sinh viên Đại học Kinh tế TP. Hồ Chí Minh (UEH). Dự án cung cấp giải pháp mua sắm trực tuyến toàn diện với các sản phẩm chính thức của trường, từ trang phục, phụ kiện đến đồ dùng học tập.

### 🎨 Thiết kế & Trải nghiệm

- **Modern UI/UX**: Giao diện hiện đại với hiệu ứng parallax và animations mượt mà
- **Responsive Design**: Tối ưu hoàn hảo trên mọi thiết bị (Desktop, Tablet, Mobile)
- **Performance Optimized**: Tải trang nhanh với lazy loading và code splitting
- **Accessibility**: Tuân thủ WCAG 2.1 guidelines

---

## ✨ Tính năng chính

### 🛍️ Người dùng (Customer)

- ✅ **Xác thực & Bảo mật**
  - Đăng ký/Đăng nhập với JWT authentication
  - Quên mật khẩu & đặt lại mật khẩu
  - Quản lý thông tin cá nhân
  - Đổi mật khẩu an toàn

- 🛒 **Mua sắm**
  - Duyệt sản phẩm với bộ lọc & tìm kiếm thông minh
  - Xem chi tiết sản phẩm với gallery ảnh
  - Thêm vào giỏ hàng & quản lý giỏ hàng
  - Đặt hàng trực tiếp hoặc từ giỏ hàng
  - Theo dõi đơn hàng real-time

- ⭐ **Đánh giá & Review**
  - Viết đánh giá sản phẩm đã mua
  - Xem rating & reviews của người khác
  - Quản lý reviews cá nhân

### 🏪 Người bán (Seller)

- 📦 **Quản lý sản phẩm**
  - Tạo, chỉnh sửa, xóa sản phẩm
  - Upload & quản lý hình ảnh
  - Quản lý kho hàng (số lượng, trạng thái)
  - Thiết lập giá & giảm giá

- 📊 **Quản lý đơn hàng**
  - Xem đơn hàng của sản phẩm
  - Cập nhật trạng thái đơn hàng
  - Thống kê doanh thu

- 📈 **Dashboard & Analytics**
  - Thống kê sản phẩm bán chạy
  - Báo cáo doanh thu
  - Phân tích đánh giá sản phẩm

### 👨‍💼 Quản trị viên (Admin)

- 👥 **Quản lý người dùng**
  - Xem danh sách tất cả users
  - Phân quyền (Customer/Seller/Admin)
  - Khóa/Mở khóa tài khoản
  - Xem chi tiết & lịch sử người dùng

- 🗂️ **Quản lý danh mục**
  - CRUD categories
  - Tổ chức phân cấp danh mục

- 📦 **Quản lý sản phẩm**
  - Duyệt tất cả sản phẩm trong hệ thống
  - Kiểm duyệt sản phẩm mới
  - Xóa sản phẩm vi phạm

- 💳 **Quản lý thanh toán**
  - Xem tất cả giao dịch
  - Xử lý hoàn tiền
  - Báo cáo tài chính chi tiết

- 📊 **Dashboard & Analytics**
  - Tổng quan hệ thống (users, products, orders)
  - Biểu đồ doanh thu theo thời gian
  - Thống kê sản phẩm & danh mục
  - Hoạt động gần đây
  - Phân tích conversion rate

---

## 📸 Demo & Screenshots

### Trang chủ
![Homepage](assets/screenshots/homepage.png)
*Giao diện trang chủ với thiết kế hiện đại và hero section ấn tượng*

### Sản phẩm
![Products](assets/screenshots/products.png)
*Trang danh sách sản phẩm với bộ lọc thông minh*

### Admin Dashboard
![Admin Dashboard](assets/screenshots/admin-dashboard.png)
*Dashboard quản trị với thống kê chi tiết*

---

## 🛠️ Công nghệ sử dụng

### Frontend Core
- **HTML5** - Semantic markup
- **CSS3** - Modern styling với CSS Variables, Flexbox, Grid
- **JavaScript (ES6+)** - Vanilla JS, no framework dependency

### UI Framework & Libraries
- **Bootstrap 5.3.0** - Responsive framework
- **Bootstrap Icons 1.11.0** - Icon library
- **Google Fonts** - Be Vietnam Pro & Montserrat

### Tools & Services
- **API Service** - Centralized API management
- **JWT Authentication** - Secure token-based auth
- **LocalStorage** - Client-side data persistence
- **Fetch API** - HTTP requests

### Backend Integration
- **REST API** - [Unimerch API](https://api.unimerch.space)
- **JSON Web Tokens** - Authorization
- **CORS** - Cross-Origin Resource Sharing

---

## 💻 Yêu cầu hệ thống

### Môi trường phát triển
- **Browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Text Editor**: VS Code (khuyến nghị), Sublime Text, hoặc tương tự
- **Node.js**: v14+ (cho development server - tùy chọn)
- **Git**: v2.30+ (cho version control)

### Kết nối mạng
- **Internet**: Cần kết nối để tải CDN resources
- **API Access**: Truy cập được `https://api.unimerch.space`

---

## 📥 Cài đặt

### Phương pháp 1: Clone từ Git (Khuyến nghị)

```bash
# Clone repository
git clone https://github.com/snag21205/Unimerch_FE.git

# Di chuyển vào thư mục dự án
cd Unimerch_FE-1

# Mở với trình duyệt
# Windows
start index.html

# macOS
open index.html

# Linux
xdg-open index.html
```

### Phương pháp 2: Sử dụng Live Server (Khuyến nghị cho Development)

#### VS Code + Live Server Extension

1. **Cài đặt VS Code Live Server**
   - Mở VS Code
   - Vào Extensions (Ctrl+Shift+X)
   - Tìm "Live Server" by Ritwick Dey
   - Click Install

2. **Chạy dự án**
   ```bash
   # Mở folder trong VS Code
   code .
   
   # Right-click vào index.html → "Open with Live Server"
   # Hoặc nhấn Alt+L Alt+O
   ```

3. **Truy cập**
   - Server sẽ chạy tại: `http://127.0.0.1:5500`
   - Live reload tự động khi thay đổi code

#### Sử dụng Node.js HTTP Server

```bash
# Cài đặt http-server globally
npm install -g http-server

# Chạy server trong thư mục dự án
http-server -p 8080

# Truy cập tại http://localhost:8080
```

#### Sử dụng Python Simple Server

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Truy cập tại http://localhost:8000
```

### Phương pháp 3: Deploy lên Hosting

#### Netlify (Miễn phí)

1. **Kết nối Git**
   - Đăng ký tại [netlify.com](https://netlify.com)
   - New site from Git → Choose repository
   - Build settings: Để trống (static site)
   - Deploy site

2. **Drag & Drop**
   - Kéo thả folder vào Netlify Dashboard
   - Site được deploy tự động

#### Vercel (Miễn phí)

```bash
# Cài đặt Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### GitHub Pages

```bash
# Push code lên GitHub
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main

# Vào Settings → Pages
# Source: main branch
# Site sẽ có tại: https://username.github.io/repository-name
```

---

## 📁 Cấu trúc dự án

```
Unimerch_FE-1/
├── 📄 index.html                 # Trang chủ
├── 📄 README.md                  # File tài liệu này
├── 📄 api_docs.md                # Tài liệu API chi tiết
│
├── 📁 assets/                    # Tài nguyên tĩnh
│   └── 📁 images/
│       ├── hero/                 # Hình ảnh hero section
│       └── products/             # Hình ảnh sản phẩm
│
├── 📁 components/                # Component tái sử dụng
│   ├── header.html              # Header component
│   ├── header.js                # Header logic
│   ├── navbar.html              # Navbar component
│   ├── navbar.js                # Navbar logic
│   ├── product-card.js          # Product card component
│   └── main-products.js         # Main products display
│
├── 📁 css/                       # Stylesheets
│   ├── admin.css                # Admin styles
│   ├── home.css                 # Homepage styles
│   ├── navbar.css               # Navigation styles
│   ├── orders.css               # Order pages styles
│   ├── profile.css              # User profile styles
│   └── seller.css               # Seller dashboard styles
│
├── 📁 js/                        # JavaScript modules
│   │
│   ├── 📁 admin/                # Admin features
│   │   ├── admin-analytics.js   # Analytics & charts
│   │   ├── admin-categories.js  # Category management
│   │   ├── admin-dashboard.js   # Main dashboard
│   │   ├── admin-orders.js      # Order management
│   │   ├── admin-products.js    # Product management
│   │   ├── admin-reviews.js     # Review moderation
│   │   └── admin-users.js       # User management
│   │
│   ├── 📁 features/             # Feature modules
│   │   ├── 📁 auth/             # Authentication
│   │   │   ├── auth-protection.service.js
│   │   │   ├── forgot-password.page.js
│   │   │   ├── index-auth.js
│   │   │   ├── login.page.js
│   │   │   ├── logout.service.js
│   │   │   ├── register.page.js
│   │   │   └── reset-password.page.js
│   │   │
│   │   ├── 📁 cart/             # Shopping cart
│   │   │   ├── cart.service.js
│   │   │   └── cart.ui.js
│   │   │
│   │   ├── 📁 order/            # Order management
│   │   │   ├── create-order.page.js
│   │   │   ├── order-detail.page.js
│   │   │   ├── order.service.js
│   │   │   └── orders-list.page.js
│   │   │
│   │   ├── 📁 product/          # Product features
│   │   │   ├── all-products.page.js
│   │   │   └── product-detail.page.js
│   │   │
│   │   └── 📁 user/             # User features
│   │       └── profile.page.js
│   │
│   ├── 📁 home/                 # Homepage scripts
│   │   └── index.js
│   │
│   ├── 📁 seller/               # Seller features
│   │   ├── seller-dashboard.js  # Seller dashboard
│   │   ├── seller-orders.js     # Order management
│   │   ├── seller-products.js   # Product management
│   │   └── seller-reviews.js    # Review management
│   │
│   └── 📁 shared/               # Shared utilities
│       ├── api.service.js       # API service (CORE)
│       └── utils.js             # Utility functions
│
└── 📁 pages/                     # HTML pages
    ├── 📁 admin/
    │   └── admin.html           # Admin dashboard
    │
    ├── 📁 auth/                 # Authentication pages
    │   ├── forgot-password.html
    │   ├── login.html
    │   ├── register.html
    │   └── reset-password.html
    │
    ├── 📁 products/             # Product pages
    │   ├── all-products.html
    │   └── product-detail.html
    │
    ├── 📁 seller/               # Seller pages
    │   └── seller.html
    │
    └── 📁 user/                 # User pages
        ├── create-order.html
        ├── order-detail.html
        ├── orders.html
        └── profile.html
```

---

## 🔌 API tích hợp

### API Base URL

```javascript
Production: https://api.unimerch.space
Development: http://localhost:3000
```

### Cấu hình API

File: `js/shared/api.service.js`

```javascript
class ApiService {
    constructor() {
        this.baseURL = 'https://api.unimerch.space';
        // ...endpoints configuration
    }
}
```

### Authentication Headers

```javascript
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Main API Endpoints

#### Authentication
```
POST   /api/auth/register        - Đăng ký
POST   /api/auth/login           - Đăng nhập
POST   /api/auth/logout          - Đăng xuất
POST   /api/auth/forgot-password - Quên mật khẩu
POST   /api/auth/reset-password  - Đặt lại mật khẩu
```

#### Products
```
GET    /api/products             - Danh sách sản phẩm
GET    /api/products/:id         - Chi tiết sản phẩm
POST   /api/products             - Tạo sản phẩm (Seller/Admin)
PUT    /api/products/:id         - Cập nhật sản phẩm
DELETE /api/products/:id         - Xóa sản phẩm
GET    /api/products/featured    - Sản phẩm nổi bật
```

#### Cart
```
GET    /api/cart                 - Lấy giỏ hàng
POST   /api/cart/add            - Thêm vào giỏ
PUT    /api/cart/update/:id     - Cập nhật số lượng
DELETE /api/cart/remove/:id     - Xóa khỏi giỏ
DELETE /api/cart/clear           - Xóa toàn bộ giỏ
```

#### Orders
```
GET    /api/orders               - Danh sách đơn hàng
POST   /api/orders               - Tạo đơn hàng
GET    /api/orders/:id           - Chi tiết đơn hàng
PUT    /api/orders/:id/status    - Cập nhật trạng thái
DELETE /api/orders/:id           - Hủy đơn hàng
```

#### Admin
```
GET    /api/admin/stats/dashboard       - Thống kê tổng quan
GET    /api/admin/stats/revenue         - Doanh thu
GET    /api/admin/stats/recent-activity - Hoạt động gần đây
GET    /api/users                       - Quản lý users
GET    /api/admin/orders                - Quản lý orders
GET    /api/admin/payments              - Quản lý payments
```

### API Response Format

#### Success Response
```json
{
  "success": true,
  "message": "Thao tác thành công",
  "data": {
    // Response data
  }
}
```

#### Error Response
```json
{
  "success": false,
  "message": "Lỗi xảy ra",
  "errors": ["Chi tiết lỗi"]
}
```

### Tài liệu API đầy đủ

Xem file [`api_docs.md`](./api_docs.md) để biết chi tiết về:
- Tất cả endpoints có sẵn
- Request/Response examples
- Authentication requirements
- Error codes & handling
- Rate limiting
- Best practices

---

## 🔧 Hướng dẫn phát triển

### 1. Setup môi trường

```bash
# Clone repository
git clone https://github.com/snag21205/Unimerch_FE.git
cd Unimerch_FE-1

# Mở với VS Code
code .

# Cài đặt extensions khuyến nghị
# - Live Server
# - ES7+ React/Redux/React-Native snippets
# - Prettier - Code formatter
# - ESLint
```

### 2. Cấu trúc code

#### Naming Conventions

```javascript
// Variables & Functions - camelCase
const productList = [];
function getProducts() {}

// Classes - PascalCase
class ApiService {}

// Constants - UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.unimerch.space';

// Files
// - Components: component-name.js
// - Pages: page-name.page.js
// - Services: service-name.service.js
```

#### Code Organization

```javascript
// 1. Imports (if using modules)
import { apiService } from './shared/api.service.js';

// 2. Constants
const PAGE_SIZE = 20;

// 3. State variables
let currentPage = 1;

// 4. Main functions
async function loadProducts() {
    // Implementation
}

// 5. Helper functions
function formatPrice(price) {
    // Implementation
}

// 6. Event handlers
function handleAddToCart(productId) {
    // Implementation
}

// 7. Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
});
```

### 3. API Service Usage

```javascript
// Import API service
// <script src="/js/shared/api.service.js"></script>

// Use global instance
const api = window.apiService;

// Example: Get products
try {
    const response = await api.getProducts({ page: 1, limit: 20 });
    const products = response.data.products;
    // Render products
} catch (error) {
    console.error('Error:', error);
    showErrorMessage(error.message);
}

// Example: Add to cart (requires auth)
try {
    await api.addToCart(productId, quantity);
    showSuccessMessage('Thêm vào giỏ hàng thành công');
    updateCartCount();
} catch (error) {
    showErrorMessage(error.message);
}
```

### 4. Authentication Flow

```javascript
// Login
async function login(email, password) {
    try {
        const response = await apiService.login({ email, password });
        
        // Save token
        apiService.setToken(response.data.token);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Redirect based on role
        const role = response.data.user.role;
        if (role === 'admin') {
            window.location.href = '/pages/admin/admin.html';
        } else if (role === 'seller') {
            window.location.href = '/pages/seller/seller.html';
        } else {
            window.location.href = '/index.html';
        }
    } catch (error) {
        showErrorMessage(error.message);
    }
}

// Logout
async function logout() {
    try {
        await apiService.logout();
        apiService.removeToken();
        localStorage.clear();
        window.location.href = '/pages/auth/login.html';
    } catch (error) {
        // Still logout locally even if API fails
        apiService.removeToken();
        localStorage.clear();
        window.location.href = '/pages/auth/login.html';
    }
}

// Check authentication
function checkAuth() {
    if (!apiService.isAuthenticated()) {
        window.location.href = '/pages/auth/login.html';
        return false;
    }
    return true;
}
```

### 5. Error Handling

```javascript
// Global error handler
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled error:', event.reason);
    showErrorMessage('Đã có lỗi xảy ra. Vui lòng thử lại sau.');
});

// Try-catch pattern
async function performAction() {
    try {
        // API call
        const result = await api.someMethod();
        showSuccessMessage('Thành công');
        return result;
    } catch (error) {
        // Log error
        console.error('Action failed:', error);
        
        // Show user-friendly message
        showErrorMessage(error.message || 'Có lỗi xảy ra');
        
        // Return default value
        return null;
    }
}
```

### 6. Best Practices

#### Performance
```javascript
// Debounce search input
let searchTimeout;
function handleSearch(query) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        performSearch(query);
    }, 300);
}

// Lazy load images
<img data-src="image.jpg" class="lazy-load" alt="Product">

// Pagination for large datasets
const PAGE_SIZE = 20;
async function loadPage(page) {
    const response = await api.getProducts({ page, limit: PAGE_SIZE });
    renderProducts(response.data.products);
}
```

#### Security
```javascript
// Sanitize user input
function sanitizeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Validate before API call
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Use HTTPS only
if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
    location.replace(`https:${location.href.substring(location.protocol.length)}`);
}
```

#### Accessibility
```html
<!-- Use semantic HTML -->
<nav aria-label="Main navigation">
<main role="main">
<button aria-label="Add to cart">

<!-- Keyboard navigation -->
<div tabindex="0" role="button" onkeypress="handleKeyPress(event)">

<!-- Screen reader support -->
<span class="sr-only">Loading...</span>
```

---

## 👥 Vai trò người dùng

### 🛍️ Customer (Khách hàng)
- Người dùng thông thường
- Quyền mua hàng và đánh giá sản phẩm
- Quản lý đơn hàng cá nhân

### 🏪 Seller (Người bán)
- Có thể đăng bán sản phẩm
- Quản lý sản phẩm của mình
- Xem thống kê bán hàng
- Xử lý đơn hàng

### 👨‍💼 Admin (Quản trị viên)
- Toàn quyền quản lý hệ thống
- Quản lý users, products, orders
- Xem thống kê toàn hệ thống
- Kiểm duyệt nội dung

---

## 🎭 Tính năng theo vai trò

### Customer Features

| Tính năng | Mô tả | File liên quan |
|-----------|-------|----------------|
| Xem sản phẩm | Duyệt danh sách sản phẩm với filter | `pages/products/all-products.html` |
| Chi tiết sản phẩm | Xem thông tin chi tiết, reviews | `pages/products/product-detail.html` |
| Giỏ hàng | Quản lý giỏ hàng | `js/features/cart/` |
| Đặt hàng | Tạo đơn hàng từ giỏ hoặc trực tiếp | `pages/user/create-order.html` |
| Quản lý đơn hàng | Xem lịch sử & trạng thái đơn hàng | `pages/user/orders.html` |
| Profile | Cập nhật thông tin cá nhân | `pages/user/profile.html` |
| Reviews | Đánh giá sản phẩm đã mua | Integrated in product pages |

### Seller Features

| Tính năng | Mô tả | File liên quan |
|-----------|-------|----------------|
| Dashboard | Tổng quan bán hàng | `pages/seller/seller.html` |
| Quản lý sản phẩm | CRUD sản phẩm | `js/seller/seller-products.js` |
| Quản lý đơn hàng | Xử lý đơn hàng sản phẩm | `js/seller/seller-orders.js` |
| Quản lý reviews | Xem & phản hồi đánh giá | `js/seller/seller-reviews.js` |
| Thống kê | Analytics bán hàng | `js/seller/seller-dashboard.js` |

### Admin Features

| Tính năng | Mô tả | File liên quan |
|-----------|-------|----------------|
| Dashboard | Tổng quan toàn hệ thống | `pages/admin/admin.html` |
| User Management | Quản lý users & phân quyền | `js/admin/admin-users.js` |
| Product Management | Kiểm duyệt & quản lý sản phẩm | `js/admin/admin-products.js` |
| Category Management | CRUD danh mục | `js/admin/admin-categories.js` |
| Order Management | Quản lý tất cả đơn hàng | `js/admin/admin-orders.js` |
| Review Moderation | Kiểm duyệt reviews | `js/admin/admin-reviews.js` |
| Analytics | Thống kê chi tiết | `js/admin/admin-analytics.js` |

---

## 🚀 Triển khai

### Production Checklist

- [ ] **Environment Variables**
  ```javascript
  // Change API base URL in api.service.js
  this.baseURL = 'https://api.unimerch.space'; // Production
  ```

- [ ] **Optimization**
  - [ ] Minify CSS/JS files
  - [ ] Compress images (WebP format)
  - [ ] Enable GZIP compression
  - [ ] Add cache headers
  - [ ] Remove console.logs

- [ ] **Security**
  - [ ] Enable HTTPS
  - [ ] Add CSP headers
  - [ ] Implement rate limiting
  - [ ] Sanitize all inputs
  - [ ] Update CORS settings

- [ ] **SEO**
  - [ ] Add meta tags
  - [ ] Create sitemap.xml
  - [ ] Add robots.txt
  - [ ] Optimize images alt text
  - [ ] Add structured data

### Build for Production

```bash
# 1. Minify CSS
# Sử dụng online tool hoặc:
npm install -g clean-css-cli
cleancss -o dist/css/main.min.css css/*.css

# 2. Minify JS
npm install -g terser
terser js/**/*.js -o dist/js/main.min.js

# 3. Optimize images
npm install -g imagemin-cli
imagemin assets/images/* --out-dir=dist/images

# 4. Test production build
http-server dist -p 8080
```

---

## 🐛 Troubleshooting

### Vấn đề thường gặp

#### 1. CORS Error
```
❌ Access to fetch at 'https://api.unimerch.space' has been blocked by CORS policy
```

**Giải pháp:**
- Không mở file trực tiếp bằng `file://`
- Sử dụng local server (Live Server, http-server)
- Kiểm tra API có enable CORS cho domain của bạn

#### 2. 401 Unauthorized
```
❌ Request failed with status 401
```

**Giải pháp:**
```javascript
// Kiểm tra token
console.log(apiService.getToken());

// Đăng nhập lại
apiService.removeToken();
window.location.href = '/pages/auth/login.html';
```

#### 3. Products không hiển thị
```javascript
// Debug trong Console
async function debug() {
    const response = await apiService.getProducts();
    console.log('API Response:', response);
    console.log('Products:', response.data.products);
}
debug();
```

#### 4. Cart không cập nhật
```javascript
// Kiểm tra authentication
if (!apiService.isAuthenticated()) {
    console.error('User not logged in');
    window.location.href = '/pages/auth/login.html';
}

// Force reload cart
async function reloadCart() {
    const cart = await apiService.getCart();
    console.log('Cart:', cart);
}
```

#### 5. Images không tải
```html
<!-- Kiểm tra path -->
<img src="/assets/images/products/product1.jpg" alt="Product">

<!-- Fallback image -->
<img src="/assets/images/products/product1.jpg" 
     onerror="this.src='/assets/images/placeholder.png'" 
     alt="Product">
```

### Debug Mode

```javascript
// Bật debug mode trong console
localStorage.setItem('debug', 'true');

// API service sẽ log tất cả requests
class ApiService {
    async request(endpoint, options = {}) {
        if (localStorage.getItem('debug') === 'true') {
            console.log('API Request:', endpoint, options);
        }
        // ... rest of code
    }
}
```

---

## 🤝 Đóng góp

### Hướng dẫn đóng góp

1. **Fork repository**
   ```bash
   # Click "Fork" trên GitHub
   ```

2. **Clone fork của bạn**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Unimerch_FE.git
   cd Unimerch_FE-1
   ```

3. **Tạo branch mới**
   ```bash
   git checkout -b feature/ten-tinh-nang
   # hoặc
   git checkout -b fix/ten-bug
   ```

4. **Commit changes**
   ```bash
   git add .
   git commit -m "feat: Thêm tính năng XYZ"
   ```

5. **Push lên fork**
   ```bash
   git push origin feature/ten-tinh-nang
   ```

6. **Tạo Pull Request**
   - Vào GitHub repository của bạn
   - Click "New Pull Request"
   - Điền mô tả chi tiết

### Commit Message Convention

```
feat: Thêm tính năng mới
fix: Sửa bug
docs: Cập nhật documentation
style: Format code, không ảnh hưởng logic
refactor: Refactor code
test: Thêm tests
chore: Cập nhật dependencies, config
```

### Code Review Guidelines

- [ ] Code tuân thủ style guide
- [ ] Không có console.log trong production code
- [ ] Có error handling đầy đủ
- [ ] Code được comment rõ ràng
- [ ] Responsive trên mọi thiết bị
- [ ] Không có security vulnerabilities

---

## 📜 License

Dự án được phát hành dưới [MIT License](LICENSE).

```
MIT License

Copyright (c) 2025 Unimerch Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software...
```

---

## 📞 Liên hệ

### Development Team

- **Project Lead**: [Your Name]
- **Frontend Developer**: [Your Name]
- **Backend API**: [Backend Team]
- **UI/UX Designer**: [Designer Name]

### Support Channels

- 📧 **Email**: support@unimerch.space
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/snag21205/Unimerch_FE/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/snag21205/Unimerch_FE/discussions)
- 📘 **Documentation**: [Wiki](https://github.com/snag21205/Unimerch_FE/wiki)

### Social Media

- 🌐 **Website**: https://unimerch.space
- 📱 **Facebook**: [Unimerch UEH](https://facebook.com/unimerch)
- 📸 **Instagram**: [@unimerch_ueh](https://instagram.com/unimerch_ueh)

---

## 🙏 Acknowledgments

Cảm ơn các thư viện và công cụ đã hỗ trợ dự án:

- [Bootstrap](https://getbootstrap.com/) - UI Framework
- [Bootstrap Icons](https://icons.getbootstrap.com/) - Icon library
- [Google Fonts](https://fonts.google.com/) - Typography
- [VS Code](https://code.visualstudio.com/) - Code editor
- [GitHub](https://github.com/) - Version control & hosting

Cảm ơn cộng đồng sinh viên UEH đã tin tưởng và sử dụng sản phẩm! 🎓

---

<div align="center">

**Made with ❤️ by Unimerch Team**

⭐ Hãy star repository nếu bạn thấy dự án hữu ích!

[Báo cáo lỗi](https://github.com/snag21205/Unimerch_FE/issues) • [Đề xuất tính năng](https://github.com/snag21205/Unimerch_FE/issues/new)

</div>
