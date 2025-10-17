# 📁 JavaScript Structure Documentation

## Tổng quan

Thư mục `js/` đã được tổ chức lại theo cấu trúc **feature-based** (dựa trên tính năng) để dễ dàng quản lý và mở rộng.

## 🗂️ Cấu trúc thư mục

```
js/
├── core/                           # 🔧 Core Services
│   ├── api.service.js             # API service - quản lý tất cả API calls
│   └── utils.js                   # Utilities (UiUtils, ValidationUtils, StorageUtils, AuthUtils)
│
├── features/                       # ✨ Features (Tính năng)
│   ├── auth/                      # 🔐 Authentication
│   │   ├── auth-protection.service.js   # Role-based access control
│   │   ├── forgot-password.page.js      # Trang quên mật khẩu
│   │   ├── index-auth.js                # Auth logic cho trang chủ
│   │   ├── login.page.js                # Trang đăng nhập
│   │   ├── logout.service.js            # Service đăng xuất
│   │   └── register.page.js             # Trang đăng ký
│   │
│   ├── cart/                      # 🛒 Cart (Giỏ hàng)
│   │   ├── cart.service.js              # Cart service - logic quản lý giỏ hàng
│   │   └── cart.ui.js                   # Cart UI components
│   │
│   ├── order/                     # 📦 Orders (Đơn hàng)
│   │   ├── order.service.js             # Order service - logic quản lý đơn hàng
│   │   ├── create-order.page.js         # Trang tạo đơn hàng
│   │   ├── order-detail.page.js         # Trang chi tiết đơn hàng
│   │   └── orders-list.page.js          # Trang danh sách đơn hàng
│   │
│   ├── product/                   # 🏷️ Products (Sản phẩm)
│   │   └── product-detail.page.js       # Trang chi tiết sản phẩm (với reviews)
│   │
│   └── user/                      # 👤 User (Người dùng)
│       └── profile.page.js              # Trang hồ sơ người dùng
│
└── pages/                          # 📄 Special Pages
    ├── admin/                      # 👨‍💼 Admin
    │   └── admin-dashboard.js           # Dashboard quản trị viên
    ├── seller/                     # 🏪 Seller  
    │   └── seller-dashboard.js          # Dashboard người bán
    └── home/                       # 🏠 Home
        └── index.js                     # Logic trang chủ
```

## 📋 Quy ước đặt tên

### Service Files
- **Pattern**: `[name].service.js`
- **Ví dụ**: `api.service.js`, `cart.service.js`, `order.service.js`
- **Mục đích**: Chứa business logic, quản lý state, gọi API

### Page Files
- **Pattern**: `[name].page.js` hoặc `[name]-[description].page.js`
- **Ví dụ**: `login.page.js`, `create-order.page.js`, `product-detail.page.js`
- **Mục đích**: Logic cho một trang cụ thể, xử lý UI và events

### Dashboard Files
- **Pattern**: `[role]-dashboard.js`
- **Ví dụ**: `admin-dashboard.js`, `seller-dashboard.js`
- **Mục đích**: Dashboard cho các role đặc biệt

## 📦 Module Dependencies

### Core (Luôn load đầu tiên)
```html
<script src="js/core/utils.js"></script>
<script src="js/core/api.service.js"></script>
```

### Feature Services (Load sau core)
```html
<!-- Cart -->
<script src="js/features/cart/cart.service.js"></script>
<script src="js/features/cart/cart.ui.js"></script>

<!-- Order -->
<script src="js/features/order/order.service.js"></script>

<!-- Auth -->
<script src="js/features/auth/auth-protection.service.js"></script>
```

### Page Scripts (Load cuối cùng)
```html
<script src="js/features/auth/login.page.js"></script>
<script src="js/features/order/create-order.page.js"></script>
```

## 🎯 Mapping từ cấu trúc cũ sang mới

| File cũ | File mới | Loại |
|---------|----------|------|
| `api-service.js` | `core/api.service.js` | Core Service |
| `utils.js` | `core/utils.js` | Core Utilities |
| `login.js` | `features/auth/login.page.js` | Auth Page |
| `register.js` | `features/auth/register.page.js` | Auth Page |
| `forgot-password.js` | `features/auth/forgot-password.page.js` | Auth Page |
| `logout.js` | `features/auth/logout.service.js` | Auth Service |
| `auth-protection.js` | `features/auth/auth-protection.service.js` | Auth Service |
| `index-auth.js` | `features/auth/index-auth.js` | Auth Logic |
| `cart-service.js` | `features/cart/cart.service.js` | Cart Service |
| `cart-ui.js` | `features/cart/cart.ui.js` | Cart UI |
| `order-service.js` | `features/order/order.service.js` | Order Service |
| `create-order.js` | `features/order/create-order.page.js` | Order Page |
| `order-detail.js` | `features/order/order-detail.page.js` | Order Page |
| `orders-management.js` | `features/order/orders-list.page.js` | Order Page |
| `product-detail.js` | `features/product/product-detail.page.js` | Product Page |
| `profile.js` | `features/user/profile.page.js` | User Page |
| `admin.js` | `pages/admin/admin-dashboard.js` | Admin Dashboard |
| `seller.js` | `pages/seller/seller-dashboard.js` | Seller Dashboard |
| `app.js` | `pages/home/index.js` | Home Page |
| `register-validation.js` | ❌ **Đã xóa** (file trống) | - |

## 💡 Lợi ích của cấu trúc mới

1. **Dễ tìm kiếm**: Code được nhóm theo tính năng, dễ dàng tìm thấy file liên quan
2. **Dễ bảo trì**: Các file liên quan được đặt gần nhau, dễ maintain
3. **Dễ mở rộng**: Thêm tính năng mới chỉ cần tạo thư mục mới trong `features/`
4. **Tên file rõ ràng**: Pattern `.service.js` và `.page.js` giúp phân biệt vai trò của file
5. **Tránh conflict**: Giảm khả năng trùng tên file khi project phát triển

## 🚀 Cách thêm tính năng mới

### Ví dụ: Thêm tính năng Chat

1. Tạo thư mục mới:
```bash
js/features/chat/
```

2. Tạo các file:
```
js/features/chat/
├── chat.service.js      # Service quản lý chat
├── chat.ui.js           # UI components
└── chat-room.page.js    # Page cho phòng chat
```

3. Import trong HTML:
```html
<script src="js/features/chat/chat.service.js"></script>
<script src="js/features/chat/chat.ui.js"></script>
<script src="js/features/chat/chat-room.page.js"></script>
```

## 📝 Notes

- **Core services** (`core/`) được dùng chung bởi nhiều features
- **Feature services** (`features/`) độc lập với nhau, tránh dependencies trực tiếp
- **Page scripts** (`pages/`) cho các trang đặc biệt (admin, seller dashboard)
- Luôn load `core/` trước, sau đó `features/`, cuối cùng là `pages/`

## 🔄 Migration Status

✅ Tất cả file đã được di chuyển thành công  
✅ Tất cả HTML files đã được cập nhật đường dẫn  
✅ File không cần thiết đã được xóa  
✅ Cấu trúc đã được test và hoạt động ổn định

---

**Cập nhật lần cuối**: 2025-10-17  
**Người thực hiện**: AI Assistant

