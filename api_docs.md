# UniMerch API Documentation

**Version:** 1.0  
**Base URL:** `http://localhost:3000` | `https://api.unimerch.space`  
**Content-Type:** `application/json`

## Overview

UniMerch is a comprehensive e-commerce API platform designed for university merchandise trading. This documentation provides detailed information about all available endpoints, authentication requirements, request/response formats, and error handling.

### Key Features
- 🔐 JWT-based authentication with role-based access control
- 👥 User management (Admin, Seller, Customer roles)
- 🛍️ Product catalog management
- 🛒 Shopping cart functionality
- 📦 Order processing and tracking
- 💳 Payment processing with multiple methods
- 📊 Analytics and reporting

---

## 📋 Table of Contents

### Core APIs
- [Authentication](#authentication)
- [User Management](#user-management)
- [Product Management](#product-management)
- [Shopping Cart](#shopping-cart)
- [Order Management](#order-management)
- [Payment Management](#payment-management)

### Reference
- [Error Responses](#error-responses)
- [Testing Guide](#testing-guide)
- [Status Codes](#status-codes)

---

## Authentication

### Register User

**Endpoint:** `POST /api/auth/register`  
**Description:** Create a new user account  
**Authentication:** None required  

#### Request Body

```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "MyPassword123",
  "fullName": "Nguyễn Văn John",
  "studentId": "SV2024001",        // Optional
  "phone": "0987654321",           // Optional
  "address": "123 Đường ABC, Quận 1, TP.HCM"  // Optional
}
```

#### Response

**Success (201 Created):**
```json
{
  "success": true,
  "message": "Đăng ký thành công",
  "data": {
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "fullName": "Nguyễn Văn John",
      "studentId": "SV2024001",
      "phone": "0987654321",
      "address": "123 Đường ABC, Quận 1, TP.HCM",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### Login User

**Endpoint:** `POST /api/auth/login`  
**Description:** Authenticate user and receive JWT token  
**Authentication:** None required  

#### Request Body

```json
{
  "email": "john@example.com",
  "password": "MyPassword123"
}
```

#### Response

**Success (200 OK):**
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "fullName": "Nguyễn Văn John",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### Logout User

**Endpoint:** `POST /api/auth/logout`  
**Description:** Invalidate current JWT token  
**Authentication:** Bearer token required  

#### Headers

```
Authorization: Bearer <JWT_TOKEN>
```

#### Response

**Success (200 OK):**
```json
{
  "success": true,
  "message": "Đăng xuất thành công",
  "data": null
}
```

---

### Forgot Password

**Endpoint:** `POST /api/auth/forgot-password`  
**Description:** Send password reset email  
**Authentication:** None required  

#### Request Body

```json
{
  "email": "john@example.com"
}
```

#### Response

**Success (200 OK):**
```json
{
  "success": true,
  "message": "Email hướng dẫn reset mật khẩu đã được gửi",
  "data": null
}
```

> **Note:** Reset link expires in 15 minutes

---

## User Management

### � User Profile APIs

> **Authentication Required:** Bearer token

#### Get Current User Profile

**Endpoint:** `GET /api/users/profile`  
**Description:** Retrieve current user's profile information  

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Lấy thông tin profile thành công",
  "data": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "fullName": "Nguyễn Văn John",
    "studentId": "SV2024001",
    "phone": "0987654321",
    "address": "123 Đường ABC, Quận 1, TP.HCM",
    "role": "user",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

#### Update User Profile

**Endpoint:** `PUT /api/users/profile`  
**Description:** Update current user's profile information  

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "fullName": "Nguyễn Văn An",
  "studentId": "SV2024001",
  "phone": "0123456789",
  "address": "123 Đường ABC, Quận 1, TP.HCM"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Cập nhật profile thành công",
  "data": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "fullName": "Nguyễn Văn An",
    "studentId": "SV2024001",
    "phone": "0123456789",
    "address": "123 Đường ABC, Quận 1, TP.HCM",
    "role": "user",
    "updatedAt": "2025-01-01T12:00:00.000Z"
  }
}
```

#### Change Password

**Endpoint:** `PUT /api/users/change-password`  
**Description:** Change user's password  

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "currentPassword": "MyOldPassword123",
  "newPassword": "MyNewPassword456",
  "confirmPassword": "MyNewPassword456"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Đổi mật khẩu thành công",
  "data": null
}
```

---

### 👨‍💼 Admin APIs

> **Authentication Required:** Admin role + Bearer token

#### List All Users

**Endpoint:** `GET /api/users`  
**Description:** Get paginated list of all users (Admin only)  

**Headers:**
```
Authorization: Bearer <ADMIN_JWT_TOKEN>
```

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 20)
- `search` (string, optional): Search by username, email, or fullName

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Lấy danh sách users thành công",
  "data": {
    "users": [
      {
        "id": 1,
        "username": "john_doe",
        "email": "john@example.com",
        "fullName": "Nguyễn Văn John",
        "studentId": "SV2024001",
        "phone": "0987654321",
        "address": "123 Đường ABC, Quận 1, TP.HCM",
        "role": "user",
        "createdAt": "2025-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalUsers": 50,
      "usersPerPage": 10
    }
  }
}
```

#### Get User by ID

**Endpoint:** `GET /api/users/:id`  
**Description:** Get user information by ID (Admin only)  

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Lấy thông tin user thành công",
  "data": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "fullName": "Nguyễn Văn John",
    "role": "user",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

#### Update User by ID

**Endpoint:** `PUT /api/users/:id`  
**Description:** Update user information by ID (Admin only)  

**Request Body:**
```json
{
  "fullName": "Nguyễn Văn An Updated",
  "studentId": "SV2024001",
  "phone": "0123456789",
  "address": "456 Đường XYZ, Quận 2, TP.HCM",
  "role": "seller"
}
```

#### Delete User

**Endpoint:** `DELETE /api/users/:id`  
**Description:** Delete user by ID (Admin only)  

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Xóa user thành công",
  "data": {
    "deletedUserId": 1,
    "deletedUserInfo": {
      "username": "john_doe",
      "email": "john@example.com",
      "fullName": "Nguyễn Văn John"
    }
  }
}
```

---

## Product Management

### 📦 Product Endpoints

#### List Products

**Endpoint:** `GET /api/products`  
**Description:** Get paginated list of products with filtering options  
**Authentication:** None required  

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 20)
- `category_id` (number, optional): Filter by category
- `status` (string, optional): Filter by status (`available`, `out_of_stock`, `discontinued`)
- `search` (string, optional): Search by name or description
- `min_price` (number, optional): Minimum price filter
- `max_price` (number, optional): Maximum price filter
- `seller_id` (number, optional): Filter by seller

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Lấy danh sách sản phẩm thành công",
  "data": {
    "products": [
      {
        "id": 1,
        "name": "iPhone 15",
        "description": "Điện thoại iPhone 15 mới nhất",
        "price": 25000000,
        "discount_price": 23000000,
        "quantity": 10,
        "image_url": "https://example.com/iphone15.jpg",
        "status": "available",
        "category_name": "Điện thoại",
        "seller_name": "seller1"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

#### Get Product Details

**Endpoint:** `GET /api/products/:id`  
**Description:** Get detailed information about a specific product  
**Authentication:** None required  

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Lấy thông tin sản phẩm thành công",
  "data": {
    "id": 1,
    "name": "iPhone 15",
    "description": "Điện thoại iPhone 15 mới nhất",
    "price": 25000000,
    "discount_price": 23000000,
    "quantity": 10,
    "image_url": "https://example.com/iphone15.jpg",
    "status": "available",
    "category_name": "Điện thoại",
    "seller_name": "seller1",
    "seller_full_name": "Nguyễn Văn A"
  }
}
```

#### Get Featured Products

**Endpoint:** `GET /api/products/featured`  
**Description:** Get list of featured products  
**Authentication:** None required  

**Query Parameters:**
- `limit` (number, optional): Number of products (default: 10)

#### Get Products by Seller

**Endpoint:** `GET /api/products/seller/:seller_id`  
**Description:** Get products by specific seller  
**Authentication:** None required  

**Query Parameters:**
- `page` (number, optional): Page number
- `limit` (number, optional): Items per page
- `status` (string, optional): Filter by status

---

### 🛍️ Seller/Admin Product APIs

> **Authentication Required:** Seller/Admin role + Bearer token

#### Create Product

**Endpoint:** `POST /api/products`  
**Description:** Create a new product (Seller/Admin only)  

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "iPhone 15",
  "description": "Điện thoại iPhone 15 mới nhất",
  "price": 25000000,
  "discount_price": 23000000,
  "quantity": 10,
  "image_url": "https://example.com/iphone15.jpg",
  "category_id": 1
}
```

#### Update Product

**Endpoint:** `PUT /api/products/:id`  
**Description:** Update product information (Seller/Admin only)  

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "iPhone 15 Pro",
  "description": "Điện thoại iPhone 15 Pro",
  "price": 30000000,
  "discount_price": 28000000,
  "quantity": 5,
  "image_url": "https://example.com/iphone15pro.jpg",
  "category_id": 1,
  "status": "available"
}
```

#### Delete Product

**Endpoint:** `DELETE /api/products/:id`  
**Description:** Delete a product (Seller/Admin only)  

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Xóa sản phẩm thành công",
  "data": null
}
```

### 🛒 Cart Management APIs

> **Authentication Required:** Bearer token

#### Add to Cart

**Endpoint:** `POST /api/cart/add`  
**Description:** Add product to shopping cart  

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "product_id": 1,
  "quantity": 2
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Thêm sản phẩm vào giỏ hàng thành công",
  "data": {
    "id": 1,
    "user_id": 1,
    "product_id": 1,
    "quantity": 2,
    "product_name": "iPhone 15",
    "product_price": 25000000,
    "product_discount_price": 23000000
  }
}
```

#### Get Cart Items

**Endpoint:** `GET /api/cart`  
**Description:** Get all items in user's shopping cart  

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Lấy giỏ hàng thành công",
  "data": {
    "items": [
      {
        "id": 1,
        "product_id": 1,
        "product_name": "iPhone 15",
        "product_price": 25000000,
        "discount_price": 23000000,
        "quantity": 2,
        "subtotal": 46000000
      }
    ],
    "summary": {
      "total_items": 5,
      "total_amount": 1150000,
      "item_count": 3
    }
  }
}
```

#### Update Cart Item

**Endpoint:** `PUT /api/cart/update/:id`  
**Description:** Update quantity of item in cart  

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "quantity": 3
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Cập nhật số lượng thành công",
  "data": {
    "id": 1,
    "quantity": 3,
    "updated_at": "2025-01-01T12:00:00.000Z"
  }
}
```

#### Remove from Cart

**Endpoint:** `DELETE /api/cart/remove/:id`  
**Description:** Remove specific item from cart  

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Xóa sản phẩm khỏi giỏ hàng thành công",
  "data": {
    "removed_item_id": 1
  }
}
```

#### Clear Cart

**Endpoint:** `DELETE /api/cart/clear`  
**Description:** Remove all items from cart  

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Đã xóa 3 sản phẩm khỏi giỏ hàng",
  "data": {
    "removed_items": 3
  }
}
```

#### Validate Cart

**Endpoint:** `GET /api/cart/validate`  
**Description:** Check cart items availability and pricing  

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Kiểm tra giỏ hàng thành công",
  "data": {
    "valid_items": [
      {
        "id": 1,
        "product_id": 1,
        "is_available": true,
        "current_price": 25000000,
        "quantity_available": 10
      }
    ],
    "invalid_items": [],
    "is_valid": true,
    "summary": {
      "total_items": 3,
      "valid_count": 3,
      "invalid_count": 0
    }
  }
}
```

#### Get Cart Count

**Endpoint:** `GET /api/cart/count`  
**Description:** Get number of items in cart  

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Lấy số lượng items thành công",
  "data": {
    "total_items": 5,
    "unique_products": 3
  }
}
```

#### Get Cart Total

**Endpoint:** `GET /api/cart/total`  
**Description:** Get total amount of cart  

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Lấy tổng tiền giỏ hàng thành công",
  "data": {
    "total_amount": 1150000,
    "currency": "VND"
  }
}
```

---

## Order Management

### � Order APIs

> **Authentication Required:** Bearer token

#### Create Order

**Endpoint:** `POST /api/orders`  
**Description:** Create a new order from cart or direct items  

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body (from cart):**
```json
{
  "shipping_address": "123 Đường ABC, Quận 1, TP.HCM",
  "payment_method": "cod",
  "from_cart": true
}
```

**Request Body (direct order):**
```json
{
  "items": [
    {
      "product_id": 1,
      "quantity": 2
    },
    {
      "product_id": 2,
      "quantity": 1
    }
  ],
  "shipping_address": "123 Đường ABC, Quận 1, TP.HCM",
  "payment_method": "banking",
  "from_cart": false
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Tạo đơn hàng thành công",
  "data": {
    "id": 1,
    "user_id": 1,
    "total_amount": 500000,
    "shipping_address": "123 Đường ABC, Quận 1, TP.HCM",
    "payment_method": "cod",
    "status": "pending",
    "created_at": "2025-01-01T00:00:00.000Z",
    "items": [
      {
        "product_id": 1,
        "product_name": "iPhone 15",
        "quantity": 2,
        "price": 250000
      }
    ]
  }
}
```

#### Get User Orders

**Endpoint:** `GET /api/orders`  
**Description:** Get paginated list of user's orders  

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Orders per page (default: 10)
- `status` (string, optional): Filter by status

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Lấy danh sách đơn hàng thành công",
  "data": {
    "orders": [
      {
        "id": 1,
        "total_amount": 500000,
        "status": "pending",
        "created_at": "2025-01-01T00:00:00.000Z",
        "items_count": 2
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_orders": 50,
      "has_next": true,
      "has_prev": false
    }
  }
}
```

#### Get Order Details

**Endpoint:** `GET /api/orders/:id`  
**Description:** Get detailed information about specific order  

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Lấy chi tiết đơn hàng thành công",
  "data": {
    "id": 1,
    "user_id": 1,
    "total_amount": 500000,
    "shipping_address": "123 Đường ABC, Quận 1, TP.HCM",
    "payment_method": "cod",
    "status": "pending",
    "created_at": "2025-01-01T00:00:00.000Z",
    "items": [
      {
        "id": 1,
        "product_id": 1,
        "product_name": "iPhone 15",
        "quantity": 2,
        "price": 250000
      }
    ],
    "payments": [
      {
        "id": 1,
        "payment_method": "cod",
        "payment_status": "pending",
        "amount": 500000
      }
    ]
  }
}
```

#### Update Order Status

**Endpoint:** `PUT /api/orders/:id/status`  
**Description:** Update order status  

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "processing"
}
```

**Valid Status Transitions:**
- `pending` → `processing` → `shipped` → `delivered`
- Any status → `cancelled` (with restrictions)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Cập nhật trạng thái đơn hàng thành công",
  "data": {
    "id": 1,
    "status": "processing",
    "updated_at": "2025-01-01T12:00:00.000Z"
  }
}
```

#### Cancel Order

**Endpoint:** `DELETE /api/orders/:id`  
**Description:** Cancel an order  

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Hủy đơn hàng thành công",
  "data": {
    "id": 1,
    "status": "cancelled"
  }
}
```

#### Get Order Items

**Endpoint:** `GET /api/orders/:id/items`  
**Description:** Get list of items in specific order  

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Lấy danh sách items thành công",
  "data": [
    {
      "id": 1,
      "order_id": 1,
      "product_id": 1,
      "quantity": 2,
      "price": 250000,
      "product_name": "iPhone 15"
    }
  ]
}
```

#### Get Order Statistics

**Endpoint:** `GET /api/orders/stats`  
**Description:** Get user's order statistics  

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Lấy thống kê đơn hàng thành công",
  "data": [
    {
      "status": "pending",
      "count": 5,
      "total_amount": 1500000
    },
    {
      "status": "completed",
      "count": 10,
      "total_amount": 5000000
    }
  ]
}
```

---

### 👨‍💼 Admin Order APIs

> **Authentication Required:** Admin role + Bearer token

#### Get All Orders

**Endpoint:** `GET /api/admin/orders`  
**Description:** Get all orders (Admin only)  

**Headers:**
```
Authorization: Bearer <ADMIN_JWT_TOKEN>
```

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Orders per page (default: 20)
- `status` (string, optional): Filter by status
- `user_id` (number, optional): Filter by user

---

### 🏪 Seller Order APIs

> **Authentication Required:** Seller role + Bearer token

#### Get Seller Orders

**Endpoint:** `GET /api/seller/orders`  
**Description:** Get orders containing seller's products  

**Headers:**
```
Authorization: Bearer <SELLER_JWT_TOKEN>
```

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Orders per page (default: 20)
- `status` (string, optional): Filter by status

---

## Payment Management

### ⚠️ Important Payment Flow

> **Version 2.0 Update:** Orders and Payments are now separate entities to prevent duplication

**Correct Flow:**
1. **Create Order** → Does not automatically create payment
2. **Create Payment** → For specific order
3. **Update Payment Status** → Automatically updates order status

---

### 💰 Payment APIs

> **Authentication Required:** Bearer token

#### Create Payment

**Endpoint:** `POST /api/payments`  
**Description:** Create payment for an existing order  

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "order_id": 6,
  "payment_method": "credit_card",
  "transaction_id": "TXN_CC_123456"
}
```

**Supported Payment Methods:**
- `cod` - Cash on Delivery (no transaction_id required)
- `credit_card` - Credit Card
- `debit_card` - Debit Card  
- `momo` - MoMo Wallet
- `zalopay` - ZaloPay
- `vnpay` - VNPay
- `bank_transfer` - Bank Transfer
- `paypal` - PayPal
- `stripe` - Stripe

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Tạo payment thành công",
  "data": {
    "id": 1,
    "order_id": 6,
    "payment_method": "credit_card",
    "payment_status": "pending",
    "transaction_id": "TXN_CC_123456",
    "amount": "150000.00",
    "created_at": "2025-01-15T10:30:00.000Z"
  }
}
```

#### Get Order Payments

**Endpoint:** `GET /api/payments/:orderId`  
**Description:** Get all payments for a specific order  

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Lấy thông tin payments thành công",
  "data": [
    {
      "id": 1,
      "order_id": 6,
      "payment_method": "credit_card",
      "payment_status": "completed",
      "transaction_id": "TXN_CC_123456_CONFIRMED",
      "amount": "150000.00",
      "created_at": "2025-01-15T10:30:00.000Z",
      "updated_at": "2025-01-15T11:00:00.000Z"
    }
  ]
}
```

#### Get Payment Details

**Endpoint:** `GET /api/payments/detail/:id`  
**Description:** Get detailed payment information by payment ID  

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Lấy thông tin payment thành công",
  "data": {
    "id": 1,
    "order_id": 6,
    "payment_method": "credit_card",
    "payment_status": "completed",
    "transaction_id": "TXN_CC_123456_CONFIRMED",
    "amount": "150000.00",
    "user_id": 7,
    "order_total": "150000.00"
  }
}
```

#### Update Payment Status

**Endpoint:** `PUT /api/payments/:id/status`  
**Description:** Update payment status and transaction details  

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "completed",
  "transaction_id": "TXN_CC_123456_CONFIRMED"
}
```

**Valid Status Transitions:**
- `pending` → `completed` | `failed`
- `failed` → `pending` (retry allowed)
- `completed` → `refunded` (admin only)
- `refunded` → **Final State**

**Auto Order Status Updates:**
- Payment `completed` → Order status: `processing`
- Payment `refunded` → Order status: `cancelled`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Cập nhật trạng thái payment thành công",
  "data": {
    "id": 1,
    "payment_status": "completed",
    "transaction_id": "TXN_CC_123456_CONFIRMED",
    "updated_at": "2025-01-15T11:00:00.000Z"
  }
}
```

#### Get User Payments

**Endpoint:** `GET /api/payments/user`  
**Description:** Get all payments for current user  

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10)
- `status` (string, optional): Filter by status

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Lấy danh sách payments thành công",
  "data": {
    "payments": [
      {
        "id": 1,
        "order_id": 6,
        "payment_method": "credit_card",
        "payment_status": "completed",
        "amount": "150000.00",
        "created_at": "2025-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 3,
      "total_payments": 25,
      "has_next": true,
      "has_prev": false
    }
  }
}
```

---

### 👨‍💼 Admin Payment APIs

> **Authentication Required:** Admin role + Bearer token

#### Get All Payments

**Endpoint:** `GET /api/admin/payments`  
**Description:** Get all payments system-wide (Admin only)  

**Headers:**
```
Authorization: Bearer <ADMIN_JWT_TOKEN>
```

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 20)
- `status` (string, optional): Filter by status
- `start_date` (string, optional): Filter from date (YYYY-MM-DD)
- `end_date` (string, optional): Filter to date (YYYY-MM-DD)

#### Get Payment Statistics

**Endpoint:** `GET /api/payments/stats`  
**Description:** Get payment statistics (Admin only)  

**Headers:**
```
Authorization: Bearer <ADMIN_JWT_TOKEN>
```

**Query Parameters:**
- `start_date` (string, optional): From date (YYYY-MM-DD)
- `end_date` (string, optional): To date (YYYY-MM-DD)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Lấy thống kê payments thành công",
  "data": [
    {
      "payment_status": "completed",
      "payment_method": "credit_card",
      "count": 15,
      "total_amount": "2250000.00"
    },
    {
      "payment_status": "pending",
      "payment_method": "momo",
      "count": 5,
      "total_amount": "750000.00"
    }
  ]
}
```

#### Get Revenue Data

**Endpoint:** `GET /api/payments/revenue`  
**Description:** Get revenue data over time (Admin only)  

**Headers:**
```
Authorization: Bearer <ADMIN_JWT_TOKEN>
```

**Query Parameters:**
- `period` (string, optional): Time period - `hour`, `day`, `week`, `month`, `year` (default: day)
- `limit` (number, optional): Number of periods (default: 30)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Lấy doanh thu thành công",
  "data": {
    "period": "day",
    "data": [
      {
        "period": "2025-01-15",
        "transaction_count": 10,
        "total_revenue": "1500000.00",
        "successful_count": 8,
        "successful_revenue": "1200000.00"
      }
    ],
    "summary": {
      "total_periods": 30,
      "total_revenue": 45000000,
      "total_transactions": 150
    }
  }
}
```

#### Process Refund

**Endpoint:** `POST /api/payments/:id/refund`  
**Description:** Process payment refund (Admin only)  

**Headers:**
```
Authorization: Bearer <ADMIN_JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "reason": "Khách hàng yêu cầu hoàn tiền do sản phẩm lỗi"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Hoàn tiền thành công",
  "data": {
    "id": 1,
    "payment_status": "refunded",
    "refund_reason": "Khách hàng yêu cầu hoàn tiền do sản phẩm lỗi",
    "updated_at": "2025-01-15T15:00:00.000Z"
  }
}
```



## 📝 Review APIs

### 1. GET /api/reviews - Lấy danh sách tất cả reviews
```
Method: GET
URL: {{base_url}}/api/reviews
Headers: None (public endpoint)

Query Parameters (optional):
- page: 1
- limit: 20
- product_id: 1
- user_id: 1
- rating: 5

Expected Response (200):
{
  "success": true,
  "message": "Lấy danh sách reviews thành công",
  "data": {
    "reviews": [...],
    "pagination": {...}
  }
}
```

### 2. GET /api/reviews/:id - Lấy review theo ID
```
Method: GET
URL: {{base_url}}/api/reviews/1
Headers: None

Expected Response (200):
{
  "success": true,
  "message": "Lấy thông tin review thành công",
  "data": {
    "id": 1,
    "product_id": 1,
    "user_id": 1,
    "rating": 5,
    "comment": "Sản phẩm rất tốt!",
    "created_at": "2024-01-01T00:00:00.000Z",
    "username": "user123",
    "user_full_name": "Nguyễn Văn A",
    "product_name": "Áo thun nam"
  }
}
```

### 3. GET /api/reviews/product/:product_id - Lấy reviews theo sản phẩm
```
Method: GET
URL: {{base_url}}/api/reviews/product/1
Headers: None

Query Parameters (optional):
- page: 1
- limit: 20
- rating: 5

Expected Response (200):
{
  "success": true,
  "message": "Lấy danh sách reviews của sản phẩm thành công",
  "data": {
    "reviews": [...],
    "pagination": {...}
  }
}
```

### 4. GET /api/reviews/product/:product_id/stats - Thống kê rating sản phẩm
```
Method: GET
URL: {{base_url}}/api/reviews/product/1/stats
Headers: None

Expected Response (200):
{
  "success": true,
  "message": "Lấy thống kê rating sản phẩm thành công",
  "data": {
    "total_reviews": 25,
    "average_rating": 4.2,
    "rating_distribution": {
      "5": 10,
      "4": 8,
      "3": 5,
      "2": 1,
      "1": 1
    }
  }
}
```

### 5. GET /api/reviews/my-reviews - Lấy reviews của user hiện tại
```
Method: GET
URL: {{base_url}}/api/reviews/my-reviews
Headers: Authorization: Bearer {{token}}

Query Parameters (optional):
- page: 1
- limit: 20

Expected Response (200):
{
  "success": true,
  "message": "Lấy danh sách reviews của bạn thành công",
  "data": {
    "reviews": [...],
    "pagination": {...}
  }
}
```

### 6. GET /api/reviews/check/:product_id - Kiểm tra đã review chưa
```
Method: GET
URL: {{base_url}}/api/reviews/check/1
Headers: Authorization: Bearer {{token}}

Expected Response (200):
{
  "success": true,
  "message": "Kiểm tra trạng thái review thành công",
  "data": {
    "has_reviewed": false
  }
}
```

### 7. GET /api/reviews/top-products - Sản phẩm rating cao nhất
```
Method: GET
URL: {{base_url}}/api/reviews/top-products
Headers: None

Query Parameters (optional):
- limit: 10

Expected Response (200):
{
  "success": true,
  "message": "Lấy danh sách sản phẩm có rating cao nhất thành công",
  "data": [
    {
      "id": 1,
      "name": "Áo thun nam",
      "image_url": "...",
      "price": 199000,
      "discount_price": 150000,
      "average_rating": 4.8,
      "total_reviews": 50
    }
  ]
}
```

### 8. POST /api/reviews - Tạo review mới
```
Method: POST
URL: {{base_url}}/api/reviews
Headers: 
- Authorization: Bearer {{token}}
- Content-Type: application/json

Body (JSON):
{
  "product_id": 1,
  "rating": 5,
  "comment": "Sản phẩm tuyệt vời, chất lượng rất tốt!"
}

Expected Response (201):
{
  "success": true,
  "message": "Tạo review thành công",
  "data": {
    "id": 1,
    "product_id": 1,
    "user_id": 1,
    "rating": 5,
    "comment": "Sản phẩm tuyệt vời, chất lượng rất tốt!"
  }
}

Test Cases:
✓ Valid data → 201 Created
✗ Missing product_id → 400 Bad Request
✗ Invalid rating (not 1-5) → 400 Bad Request
✗ Product not exists → 404 Not Found
✗ Already reviewed → 400 Bad Request
✗ No auth token → 401 Unauthorized
```

### 9. PUT /api/reviews/:id - Cập nhật review
```
Method: PUT
URL: {{base_url}}/api/reviews/1
Headers: 
- Authorization: Bearer {{token}}
- Content-Type: application/json

Body (JSON):
{
  "rating": 4,
  "comment": "Cập nhật: Sản phẩm khá tốt"
}

Expected Response (200):
{
  "success": true,
  "message": "Cập nhật review thành công",
  "data": {
    "id": 1,
    "product_id": 1,
    "user_id": 1,
    "rating": 4,
    "comment": "Cập nhật: Sản phẩm khá tốt"
  }
}

Test Cases:
✓ Owner updates own review → 200 OK
✓ Admin updates any review → 200 OK
✗ User updates others' review → 403 Forbidden
✗ Review not exists → 404 Not Found
✗ Invalid rating → 400 Bad Request
✗ No auth token → 401 Unauthorized
```

### 10. DELETE /api/reviews/:id - Xóa review
```
Method: DELETE
URL: {{base_url}}/api/reviews/1
Headers: Authorization: Bearer {{token}}

Expected Response (200):
{
  "success": true,
  "message": "Xóa review thành công",
  "data": null
}

Test Cases:
✓ Owner deletes own review → 200 OK
✓ Admin deletes any review → 200 OK  
✗ User deletes others' review → 403 Forbidden
✗ Review not exists → 404 Not Found
✗ No auth token → 401 Unauthorized
```

### 11. GET /api/reviews/user/:user_id - Reviews của user (Admin only)
```
Method: GET
URL: {{base_url}}/api/reviews/user/1
Headers: Authorization: Bearer {{admin_token}}

Query Parameters (optional):
- page: 1
- limit: 20

Expected Response (200):
{
  "success": true,
  "message": "Lấy danh sách reviews của người dùng thành công",
  "data": {
    "reviews": [...],
    "pagination": {...}
  }
}


```

## 📝 Search APIs

Link to postman collection: https://bom.so/LGfOns


## 📊 Admin Stats Endpoints

### 1. Dashboard Overview

**Endpoint:** `GET /api/admin/stats/dashboard`  
**Description:** Lấy thống kê tổng quan cho Admin Dashboard  

**Headers:**
```
Authorization: Bearer <ADMIN_JWT_TOKEN>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Lấy thống kê dashboard thành công",
  "data": {
    "overview": {
      "total_users": 150,
      "total_sellers": 25,
      "total_admins": 3,
      "total_products": 500,
      "available_products": 450,
      "total_categories": 12,
      "total_orders": 300,
      "completed_orders": 250,
      "total_reviews": 180,
      "total_revenue": "15000000.00",
      "successful_payments": 245,
      "conversion_rate": 83.33,
      "average_order_value": "60000.00",
      "payment_success_rate": 81.67
    },
    "calculated_at": "2025-01-15T10:30:00.000Z"
  }
}
```

### 2. Recent Activity

**Endpoint:** `GET /api/admin/stats/recent-activity`  
**Description:** Lấy hoạt động gần đây trong hệ thống  

**Query Parameters:**
- `limit` (number, optional): Số lượng hoạt động (default: 20, max: 100)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Lấy hoạt động gần đây thành công",
  "data": {
    "activities": [
      {
        "activity_type": "user_registered",
        "title": "Nguyễn Văn A",
        "description": "Người dùng mới: john_doe (john@example.com)",
        "timestamp": "2025-01-15T10:25:00.000Z",
        "entity_id": 151,
        "time_ago": "5 phút trước"
      },
      {
        "activity_type": "order_created",
        "title": "Đơn hàng #301",
        "description": "Đơn hàng mới: 150000 VND",
        "timestamp": "2025-01-15T10:20:00.000Z",
        "entity_id": 301,
        "time_ago": "10 phút trước"
      }
    ],
    "total": 20,
    "fetched_at": "2025-01-15T10:30:00.000Z"
  }
}
```

### 3. Revenue Analytics

**Endpoint:** `GET /api/admin/stats/revenue`  
**Description:** Thống kê doanh thu theo thời gian  

**Query Parameters:**
- `period` (string, optional): Khoảng thời gian - `hour`, `day`, `week`, `month`, `year` (default: day)
- `limit` (number, optional): Số kỳ thống kê (default: 30, max: 365)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Lấy thống kê doanh thu thành công",
  "data": {
    "period": "day",
    "data": [
      {
        "period": "2025-01-15",
        "total_orders": 15,
        "completed_orders": 12,
        "revenue": "1800000.00",
        "avg_order_value": "150000.00"
      },
      {
        "period": "2025-01-14",
        "total_orders": 18,
        "completed_orders": 15,
        "revenue": "2250000.00",
        "avg_order_value": "150000.00"
      }
    ],
    "summary": {
      "total_revenue": "54000000.00",
      "total_orders": 450,
      "completed_orders": 360,
      "avg_order_value": "150000.00",
      "conversion_rate": 80.00,
      "periods_count": 30
    },
    "generated_at": "2025-01-15T10:30:00.000Z"
  }
}
```

### 4. Revenue Comparison

**Endpoint:** `GET /api/admin/stats/revenue/compare`  
**Description:** So sánh doanh thu giữa các kỳ  

**Query Parameters:**
- `current_period` (string, optional): Kỳ hiện tại (default: day)
- `comparison_period` (string, optional): Kỳ so sánh (default: day)  
- `limit` (number, optional): Số kỳ (default: 30, max: 365)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "So sánh doanh thu thành công",
  "data": {
    "current_period": {
      "period": "day",
      "data": [...],
      "summary": {
        "total_revenue": "54000000.00",
        "total_orders": 450,
        "completed_orders": 360,
        "avg_order_value": "150000.00",
        "conversion_rate": 80.00
      }
    },
    "previous_period": {
      "period": "day",
      "summary": {
        "total_revenue": "48000000.00",
        "total_orders": 400,
        "completed_orders": 320,
        "avg_order_value": "150000.00",
        "conversion_rate": 80.00
      }
    },
    "growth_metrics": {
      "revenue_growth": 12.5,
      "orders_growth": 12.5,
      "avg_order_value_growth": 0,
      "conversion_rate_growth": 0
    },
    "generated_at": "2025-01-15T10:30:00.000Z"
  }
}
```

### 5. Payment Method Analytics

**Endpoint:** `GET /api/admin/stats/payment-methods`  
**Description:** Thống kê phương thức thanh toán  

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Lấy thống kê phương thức thanh toán thành công",
  "data": {
    "payment_methods": [
      {
        "payment_method": "cod",
        "transaction_count": 150,
        "successful_count": 145,
        "failed_count": 5,
        "total_amount": "21750000.00",
        "avg_amount": "150000.00",
        "success_rate": 96.67,
        "percentage_of_revenue": "40.28",
        "percentage_of_transactions": "50.00"
      },
      {
        "payment_method": "momo",
        "transaction_count": 100,
        "successful_count": 95,
        "failed_count": 5,
        "total_amount": "14250000.00",
        "avg_amount": "150000.00",
        "success_rate": 95.00,
        "percentage_of_revenue": "26.39",
        "percentage_of_transactions": "33.33"
      }
    ],
    "summary": {
      "total_amount": "54000000.00",
      "total_transactions": 300,
      "overall_success_rate": "95.00"
    },
    "generated_at": "2025-01-15T10:30:00.000Z"
  }
}
```

### 6. Product Analytics

**Endpoint:** `GET /api/admin/stats/products`  
**Description:** Thống kê sản phẩm và danh mục  

**Query Parameters:**
- `limit` (number, optional): Số sản phẩm top (default: 10, max: 50)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Lấy thống kê sản phẩm thành công",
  "data": {
    "top_products": [
      {
        "id": 1,
        "name": "iPhone 15",
        "price": 25000000.00,
        "discount_price": 23000000.00,
        "image_url": "https://example.com/iphone15.jpg",
        "category_name": "Điện thoại",
        "seller_name": "seller1",
        "total_sold": 50,
        "total_revenue": "1150000000.00",
        "order_count": 45,
        "avg_revenue_per_order": "25555555.56"
      }
    ],
    "category_analysis": [
      {
        "id": 1,
        "name": "Điện thoại",
        "description": "Các loại điện thoại thông minh",
        "product_count": 25,
        "available_products": 22,
        "total_sold": 150,
        "total_revenue": "3750000000.00",
        "avg_rating": 4.5,
        "review_count": 120,
        "avg_revenue_per_product": "150000000.00",
        "revenue_percentage": "69.44"
      }
    ],
    "summary": {
      "total_categories": 12,
      "total_revenue_all_categories": "5400000000.00",
      "best_performing_category": "Điện thoại",
      "avg_products_per_category": "20.8"
    },
    "generated_at": "2025-01-15T10:30:00.000Z"
  }
}
```

### 7. Seller Analytics

**Endpoint:** `GET /api/admin/stats/sellers`  
**Description:** Thống kê người bán hàng  

**Query Parameters:**
- `limit` (number, optional): Số seller top (default: 10, max: 50)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Lấy thống kê người bán thành công",
  "data": {
    "top_sellers": [
      {
        "id": 5,
        "username": "seller1",
        "full_name": "Nguyễn Văn Seller",
        "email": "seller1@example.com",
        "created_at": "2024-06-01T00:00:00.000Z",
        "product_count": 50,
        "active_products": 45,
        "total_sold": 200,
        "total_revenue": "30000000.00",
        "order_count": 180,
        "avg_rating": 4.8,
        "review_count": 150,
        "avg_revenue_per_product": "600000.00",
        "avg_revenue_per_order": "166666.67",
        "product_activity_rate": "90.00"
      }
    ],
    "summary": {
      "total_sellers_analyzed": 10,
      "total_revenue_all_sellers": "150000000.00",
      "total_products_all_sellers": 250,
      "avg_revenue_per_seller": "15000000.00",
      "avg_products_per_seller": "25.0",
      "best_seller": "seller1"
    },
    "generated_at": "2025-01-15T10:30:00.000Z"
  }
}
```

### 8. Order Status Analytics

**Endpoint:** `GET /api/admin/stats/orders`  
**Description:** Thống kê đơn hàng theo trạng thái  

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Lấy thống kê đơn hàng thành công",
  "data": {
    "order_status_breakdown": [
      {
        "status": "pending",
        "count": 50,
        "total_amount": "7500000.00",
        "avg_amount": "150000.00",
        "percentage_of_orders": "16.67",
        "percentage_of_revenue": "13.89",
        "status_label": "Chờ xử lý"
      },
      {
        "status": "delivered",
        "count": 200,
        "total_amount": "30000000.00",
        "avg_amount": "150000.00",
        "percentage_of_orders": "66.67",
        "percentage_of_revenue": "55.56",
        "status_label": "Đã giao hàng"
      }
    ],
    "conversion_funnel": {
      "pending_to_processing": "20.00",
      "processing_to_shipped": "16.67",
      "shipped_to_delivered": "66.67",
      "overall_completion": "66.67",
      "cancellation_rate": "10.00"
    },
    "summary": {
      "total_orders": 300,
      "total_revenue": "54000000.00",
      "avg_order_value": "180000.00",
      "completion_rate": "66.67"
    },
    "generated_at": "2025-01-15T10:30:00.000Z"
  }
}
```

### 9. User Growth Analytics

**Endpoint:** `GET /api/admin/stats/users/growth`  
**Description:** Thống kê tăng trưởng người dùng  

**Query Parameters:**
- `period` (string, optional): Khoảng thời gian (default: day)
- `limit` (number, optional): Số kỳ (default: 30, max: 365)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Lấy thống kê tăng trưởng người dùng thành công",
  "data": {
    "period": "day",
    "growth_data": [
      {
        "period": "2025-01-15",
        "new_users": 5,
        "new_sellers": 1
      },
      {
        "period": "2025-01-14",
        "new_users": 8,
        "new_sellers": 2
      }
    ],
    "summary": {
      "total_new_users": 150,
      "total_new_sellers": 30,
      "avg_new_users_per_period": "5.0",
      "peak_registration_period": {
        "period": "2025-01-10",
        "new_users": 15,
        "new_sellers": 3
      }
    },
    "generated_at": "2025-01-15T10:30:00.000Z"
  }
}
```

### 10. Complete Admin Stats

**Endpoint:** `GET /api/admin/stats/complete`  
**Description:** Thống kê tổng hợp toàn bộ cho dashboard chính  

**Query Parameters:**
- `include_overview` (boolean, optional): Bao gồm overview (default: true)
- `include_revenue` (boolean, optional): Bao gồm revenue stats (default: true)
- `include_business` (boolean, optional): Bao gồm business stats (default: true)
- `revenue_period` (string, optional): Period cho revenue (default: day)
- `revenue_limit` (number, optional): Limit cho revenue (default: 30)
- `product_limit` (number, optional): Limit cho products (default: 10)
- `seller_limit` (number, optional): Limit cho sellers (default: 10)
- `growth_period` (string, optional): Period cho user growth (default: day)
- `growth_limit` (number, optional): Limit cho user growth (default: 30)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Lấy thống kê tổng hợp thành công",
  "data": {
    "overview": {
      "overview": {...},
      "calculated_at": "2025-01-15T10:30:00.000Z"
    },
    "revenue": {
      "period": "day",
      "data": [...],
      "summary": {...}
    },
    "payment_methods": {
      "payment_methods": [...],
      "summary": {...}
    },
    "products": {
      "top_products": [...],
      "category_analysis": [...]
    },
    "sellers": {
      "top_sellers": [...],
      "summary": {...}
    },
    "orders": {
      "order_status_breakdown": [...],
      "conversion_funnel": {...}
    },
    "user_growth": {
      "period": "day",
      "growth_data": [...],
      "summary": {...}
    },
    "generated_at": "2025-01-15T10:30:00.000Z",
    "cache_duration": "5 minutes"
  }
}
```

### 11. Stats Summary

**Endpoint:** `GET /api/admin/stats/summary`  
**Description:** Tóm tắt các chỉ số quan trọng cho widgets  

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Lấy tóm tắt thống kê thành công",
  "data": {
    "key_metrics": {
      "total_revenue": "54000000.00",
      "total_orders": 300,
      "total_users": 150,
      "total_products": 500,
      "conversion_rate": 83.33,
      "average_order_value": "180000.00"
    },
    "growth_indicators": {
      "revenue_growth_7d": 12.5,
      "weekly_revenue": "10500000.00",
      "orders_this_week": 70
    },
    "order_status_summary": [
      {
        "status": "pending",
        "count": 50,
        "percentage": "16.67"
      },
      {
        "status": "delivered",
        "count": 200,
        "percentage": "66.67"
      }
    ],
    "generated_at": "2025-01-15T10:30:00.000Z"
  }
}














> **Note:** When refunding, order status automatically changes to `cancelled`

---

## Error Responses

### HTTP Status Codes

UniMerch API uses conventional HTTP response codes to indicate the success or failure of requests.

#### Success Codes
- **200 OK** - Request successful
- **201 Created** - Resource created successfully
- **204 No Content** - Request successful, no content to return

#### Client Error Codes
- **400 Bad Request** - Invalid request data
- **401 Unauthorized** - Authentication required or invalid
- **403 Forbidden** - Insufficient permissions
- **404 Not Found** - Resource not found
- **409 Conflict** - Resource conflict (duplicate data)
- **422 Unprocessable Entity** - Validation errors

#### Server Error Codes
- **500 Internal Server Error** - Server error
- **503 Service Unavailable** - Service temporarily unavailable

---

### Error Response Format

All error responses follow a consistent format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error messages (optional)"]
}
```

---

### Common Error Examples

#### 400 - Validation Error
```json
{
  "success": false,
  "message": "Dữ liệu không hợp lệ",
  "errors": [
    "Tên đầy đủ không được để trống",
    "Email không hợp lệ",
    "Mật khẩu phải có ít nhất 8 ký tự"
  ]
}
```

#### 401 - Authentication Error
```json
{
  "success": false,
  "message": "Token không được cung cấp"
}
```

```json
{
  "success": false,
  "message": "Token không hợp lệ hoặc đã hết hạn"
}
```

#### 403 - Authorization Error
```json
{
  "success": false,
  "message": "Không có quyền truy cập. Chỉ admin mới có thể thực hiện thao tác này"
}
```

```json
{
  "success": false,
  "message": "Bạn chỉ có thể chỉnh sửa sản phẩm của chính mình"
}
```

#### 404 - Not Found
```json
{
  "success": false,
  "message": "Không tìm thấy người dùng"
}
```

```json
{
  "success": false,
  "message": "Sản phẩm không tồn tại"
}
```

#### 409 - Conflict
```json
{
  "success": false,
  "message": "Email đã được sử dụng"
}
```

```json
{
  "success": false,
  "message": "Username đã tồn tại"
}
```

#### 422 - Validation Error
```json
{
  "success": false,
  "message": "Số lượng sản phẩm không đủ",
  "errors": [
    "Sản phẩm 'iPhone 15' chỉ còn 3 chiếc, không thể thêm 5 chiếc vào giỏ"
  ]
}
```

#### 500 - Server Error
```json
{
  "success": false,
  "message": "Lỗi server nội bộ"
}
```


---

## Testing Guide

### Postman Setup

#### Environment Variables
Create a Postman environment with the following variables:

```
baseURL: http://localhost:3000  (or https://api.unimerch.space)
token: (JWT token after login)
adminToken: (Admin JWT token)
sellerToken: (Seller JWT token)
```

#### Authentication Setup
1. **Login first** to get JWT token
2. **Set token in environment** variable
3. **Use `{{token}}`** in Authorization header for subsequent requests

---

### Test Sequence

#### 1. Authentication Flow
```
POST {{baseURL}}/api/auth/register
POST {{baseURL}}/api/auth/login
POST {{baseURL}}/api/auth/logout
POST {{baseURL}}/api/auth/forgot-password
```

#### 2. User Management
```
GET {{baseURL}}/api/users/profile
PUT {{baseURL}}/api/users/profile
PUT {{baseURL}}/api/users/change-password
```

#### 3. Product Operations
```
GET {{baseURL}}/api/products
GET {{baseURL}}/api/products/1
POST {{baseURL}}/api/products
PUT {{baseURL}}/api/products/1
DELETE {{baseURL}}/api/products/1
```

#### 4. Shopping Cart
```
POST {{baseURL}}/api/cart/add
GET {{baseURL}}/api/cart
PUT {{baseURL}}/api/cart/update/1
DELETE {{baseURL}}/api/cart/remove/1
DELETE {{baseURL}}/api/cart/clear
```

#### 5. Order Process
```
POST {{baseURL}}/api/orders
GET {{baseURL}}/api/orders
GET {{baseURL}}/api/orders/1
PUT {{baseURL}}/api/orders/1/status
```

#### 6. Payment Flow
```
POST {{baseURL}}/api/payments
GET {{baseURL}}/api/payments/1
PUT {{baseURL}}/api/payments/1/status
```

---

### Headers Template

For authenticated requests, use:
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

For admin requests:
```
Authorization: Bearer {{adminToken}}
Content-Type: application/json
```

---

## Status Codes

### Order Status Flow
```
pending → processing → shipped → delivered
       ↘              ↘
        cancelled    cancelled
```

### Payment Status Flow
```
pending → completed
       ↘  ↗
        failed
       
completed → refunded (admin only)
```

### Product Status
- `available` - Product is available for purchase
- `out_of_stock` - Product is temporarily unavailable
- `discontinued` - Product is permanently unavailable

### User Roles
- `user` - Regular customer (default)
- `seller` - Can manage own products
- `admin` - Full system access

---

## Additional Notes

### Security Features
- **JWT Tokens** expire in 7 days
- **Password hashing** using bcrypt
- **Role-based access control** for all endpoints
- **Input validation** on all requests

### Data Constraints
- **Email and username** must be unique
- **Optional fields** during registration: `studentId`, `phone`, `address`
- **Price validation** ensures positive values
- **Quantity validation** prevents overselling

### Rate Limiting
- Authentication endpoints: 5 requests per minute
- General API endpoints: 100 requests per minute
- Admin endpoints: 200 requests per minute

### Pagination
All list endpoints support pagination with:
- `page` parameter (default: 1)
- `limit` parameter (default: 10-20 depending on endpoint)
- Response includes pagination metadata

---

**Documentation Version:** 1.0  
**Last Updated:** September 16, 2025  
**API Base URL:** `http://localhost:3000` | `https://api.unimerch.space`

