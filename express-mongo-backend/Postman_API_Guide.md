# Farmer Assistance API - Postman Testing Guide

## 🚀 Setup Instructions

### 1. **Base URL**
```
http://localhost:5000
```

### 2. **Environment Variables in Postman**
Create a new environment in Postman with these variables:
- `baseUrl`: `http://localhost:5000`
- `token`: (will be set after login)

### 3. **Start Your Server**
```bash
cd /home/nadeeshame/Documents/FarmerAssisstance/express-mongo-backend
npm start
```

---

## 📋 Complete API Endpoints

### **Health Check**
- **GET** `/health` - Server health check
- **GET** `/api/health` - API health check

---

## 🔐 Authentication APIs

### **POST** `/api/auth/register`
**Description**: Register a new user
**Headers**: `Content-Type: application/json`
**Body**:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "location": {
    "address": "123 Farm St",
    "city": "Colombo",
    "state": "Western",
    "country": "Sri Lanka"
  }
}
```

### **POST** `/api/auth/login`
**Description**: Login user
**Headers**: `Content-Type: application/json`
**Body**:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
**Response**: Copy the `token` from response and set it in Postman environment

### **GET** `/api/auth/me`
**Description**: Get current user profile
**Headers**: `Authorization: Bearer {{token}}`

### **PUT** `/api/auth/me`
**Description**: Update user profile
**Headers**: 
- `Authorization: Bearer {{token}}`
- `Content-Type: application/json`
**Body**:
```json
{
  "firstName": "John Updated",
  "lastName": "Doe Updated",
  "phone": "+1234567890"
}
```

### **POST** `/api/auth/forgot-password`
**Description**: Request password reset
**Headers**: `Content-Type: application/json`
**Body**:
```json
{
  "email": "john@example.com"
}
```

### **POST** `/api/auth/reset-password`
**Description**: Reset password with token
**Headers**: `Content-Type: application/json`
**Body**:
```json
{
  "password": "newpassword123",
  "token": "reset_token_here"
}
```

---

## 🌱 Crop Management APIs

### **POST** `/api/crops`
**Description**: Create a new crop
**Headers**: 
- `Authorization: Bearer {{token}}`
- `Content-Type: application/json`
**Body**:
```json
{
  "name": "Rice",
  "type": "grain",
  "plantingDate": "2025-01-15",
  "expectedHarvestDate": "2025-10-15",
  "area": 1000,
  "unit": "square_meters",
  "location": {
    "city": "Colombo"
  },
  "yield": {
    "expected": 1000
  }
}
```

### **GET** `/api/crops`
**Description**: List all crops for user
**Headers**: `Authorization: Bearer {{token}}`

### **GET** `/api/crops/:id`
**Description**: Get specific crop
**Headers**: `Authorization: Bearer {{token}}`
**URL**: `/api/crops/64f8a1b2c3d4e5f6a7b8c9d0`

### **PUT** `/api/crops/:id`
**Description**: Update crop
**Headers**: 
- `Authorization: Bearer {{token}}`
- `Content-Type: application/json`
**Body**:
```json
{
  "name": "Updated Rice",
  "status": "growing"
}
```

### **DELETE** `/api/crops/:id`
**Description**: Delete crop
**Headers**: `Authorization: Bearer {{token}}`

---

## 🛒 Market Price APIs

### **GET** `/api/market`
**Description**: List market prices
**Query Parameters**:
- `crop`: Filter by crop name
- `city`: Filter by city
- `limit`: Number of results (default: 50)

**Example**: `/api/market?crop=rice&city=colombo&limit=10`

### **POST** `/api/market`
**Description**: Add market price (Farmer/Expert/Admin)
**Headers**: 
- `Authorization: Bearer {{token}}`
- `Content-Type: application/json`
**Body** (Simple format):
```json
{
  "productName": "Rice",
  "price": 150,
  "unit": "kg",
  "location": "Colombo",
  "date": "2025-01-15",
  "source": "Market Survey"
}
```

**Body** (Complex format for experts):
```json
{
  "crop": {
    "name": "Rice",
    "type": "grain",
    "grade": "premium"
  },
  "location": {
    "market": "Colombo Central Market",
    "city": "Colombo",
    "state": "Western",
    "country": "Sri Lanka"
  },
  "prices": {
    "wholesale": {
      "min": 120,
      "max": 180,
      "average": 150,
      "unit": "kg"
    }
  },
  "demand": {
    "level": "high",
    "trend": "increasing"
  },
  "supply": {
    "level": "medium",
    "trend": "stable"
  }
}
```

### **GET** `/api/market/external`
**Description**: External market lookup
**Query Parameters**:
- `name`: Product name to search

**Example**: `/api/market/external?name=rice`

---

## 🌤️ Weather APIs

### **GET** `/api/weather`
**Description**: Get current weather
**Headers**: `Content-Type: application/json`
**Query Parameters**:
- `lat`: Latitude
- `lon`: Longitude
- `city`: City name

**Example**: `/api/weather?city=Colombo`

---

## 💬 Forum APIs

### **GET** `/api/forum`
**Description**: List forum threads
**Headers**: `Authorization: Bearer {{token}}`

### **POST** `/api/forum`
**Description**: Create new forum thread
**Headers**: 
- `Authorization: Bearer {{token}}`
- `Content-Type: application/json`
**Body**:
```json
{
  "title": "Best rice farming practices",
  "content": "What are the best practices for rice farming in Sri Lanka?",
  "category": "farming_tips"
}
```

### **GET** `/api/forum/:id`
**Description**: Get specific forum thread
**Headers**: `Authorization: Bearer {{token}}`

### **POST** `/api/forum/:id/replies`
**Description**: Reply to forum thread
**Headers**: 
- `Authorization: Bearer {{token}}`
- `Content-Type: application/json`
**Body**:
```json
{
  "content": "Great question! Here are some tips..."
}
```

---

## 🔔 Notification APIs

### **GET** `/api/notifications`
**Description**: List notifications
**Headers**: `Authorization: Bearer {{token}}`

### **PUT** `/api/notifications/:id/read`
**Description**: Mark notification as read
**Headers**: `Authorization: Bearer {{token}}`

---

## 🛍️ Purchase APIs

### **GET** `/api/purchases`
**Description**: List purchases
**Headers**: `Authorization: Bearer {{token}}`

### **POST** `/api/purchases`
**Description**: Create purchase
**Headers**: 
- `Authorization: Bearer {{token}}`
- `Content-Type: application/json`
**Body**:
```json
{
  "dateOfPurchase": "2025-01-15",
  "deliveryTime": "10 AM",
  "deliveryDistrict": "Colombo",
  "productName": "Rice Seeds",
  "quantity": 2,
  "message": "Leave at gate"
}
```

---

## 🛒 E-commerce APIs

### **GET** `/api/products`
**Description**: List products
**Headers**: `Content-Type: application/json`

### **GET** `/api/cart`
**Description**: Get cart items
**Headers**: `Authorization: Bearer {{token}}`

### **POST** `/api/cart`
**Description**: Add item to cart
**Headers**: 
- `Authorization: Bearer {{token}}`
- `Content-Type: application/json`

### **GET** `/api/orders`
**Description**: List orders
**Headers**: `Authorization: Bearer {{token}}`

---

## 📞 Contact & Support APIs

### **POST** `/api/contact`
**Description**: Send contact message
**Headers**: `Content-Type: application/json`
**Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Support Request",
  "message": "I need help with my crops"
}
```

### **POST** `/api/subscribe`
**Description**: Subscribe to newsletter
**Headers**: `Content-Type: application/json`
**Body**:
```json
{
  "email": "john@example.com",
  "name": "John Doe"
}
```

---

## 🧪 Demo & Trial APIs

### **GET** `/api/demo`
**Description**: Demo endpoint
**Headers**: `Content-Type: application/json`

### **POST** `/api/trial`
**Description**: Start trial
**Headers**: `Content-Type: application/json`

### **POST** `/api/register`
**Description**: Register for trial
**Headers**: `Content-Type: application/json`

### **POST** `/api/consultations`
**Description**: Request consultation
**Headers**: `Content-Type: application/json`

### **GET** `/api/community`
**Description**: Community features
**Headers**: `Content-Type: application/json`

---

## 🔑 OIDC APIs

### **GET** `/api/oidc/profile`
**Description**: Get OIDC profile
**Headers**: `Authorization: Bearer {{token}}`

### **GET** `/api/oidc/options`
**Description**: Get OIDC options

### **POST** `/api/oidc/purchases`
**Description**: Create OIDC purchase
**Headers**: 
- `Authorization: Bearer {{token}}`
- `Content-Type: application/json`

### **GET** `/api/oidc/purchases`
**Description**: List OIDC purchases
**Headers**: `Authorization: Bearer {{token}}`

### **GET** `/api/oidc/logout-url`
**Description**: Get logout URL

---

## 📝 Testing Workflow

### 1. **Start with Health Check**
- Test `/health` and `/api/health`

### 2. **Register/Login**
- Register a new user
- Login and copy the token
- Set token in Postman environment

### 3. **Test Protected Routes**
- Test user profile endpoints
- Create a crop
- Add market price
- Create forum thread

### 4. **Test Public Routes**
- Weather API
- Market listing
- Contact form

---

## ⚠️ Important Notes

1. **Authentication**: Most APIs require `Authorization: Bearer {{token}}` header
2. **Content-Type**: Always set `Content-Type: application/json` for POST/PUT requests
3. **Rate Limiting**: API has rate limiting (100 requests per 15 minutes)
4. **Validation**: All inputs are validated - check error messages for requirements
5. **Database**: Make sure MongoDB is running (local or cloud)

---

## 🐛 Common Issues

1. **401 Unauthorized**: Check if token is set correctly
2. **403 Forbidden**: Check user role permissions
3. **400 Bad Request**: Check request body format and validation
4. **500 Server Error**: Check server logs and database connection

---

## 📊 Response Format

All APIs return responses in this format:
```json
{
  "success": true/false,
  "message": "Description",
  "data": { ... }
}
```

Error responses:
```json
{
  "success": false,
  "message": "Error description",
  "stack": "Error stack trace (development only)"
}
```


