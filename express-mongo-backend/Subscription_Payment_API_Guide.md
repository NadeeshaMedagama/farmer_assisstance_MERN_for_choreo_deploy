# Farmer Assistance - Subscription & Payment System API Guide

## Overview

This document provides comprehensive documentation for the subscription and payment system APIs in the Farmer Assistance platform. The system includes subscription plans, user subscriptions, payment methods, and payment processing.

## Base URL
```
http://localhost:5000/api
```

## Authentication

Most endpoints require authentication using Bearer token:
```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### 1. Subscription Plans

#### Get All Plans
```http
GET /subscription-plans
```

**Query Parameters:**
- `type` (optional): Filter by plan type (basic, premium, enterprise, custom)
- `active` (optional): Filter by active status (true/false)
- `popular` (optional): Filter by popular status (true/false)

**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "plan_id",
      "name": "Basic Plan",
      "description": "Essential features for small farms",
      "type": "basic",
      "price": {
        "amount": 19.99,
        "currency": "USD",
        "billingCycle": "monthly"
      },
      "features": [...],
      "limits": {...},
      "trialDays": 14,
      "isActive": true,
      "isPopular": false,
      "formattedPrice": "USD 19.99/monthly"
    }
  ]
}
```

#### Get Single Plan
```http
GET /subscription-plans/:id
```

#### Get Plan Features
```http
GET /subscription-plans/:id/features
```

#### Create Plan (Admin Only)
```http
POST /subscription-plans
Authorization: Bearer <admin-token>
```

**Request Body:**
```json
{
  "name": "Professional Plan",
  "description": "Advanced features for professional farmers",
  "type": "premium",
  "price": {
    "amount": 49.99,
    "currency": "USD",
    "billingCycle": "monthly"
  },
  "features": [
    {
      "name": "crop_management",
      "description": "Advanced crop management tools",
      "included": true,
      "limits": {
        "maxCrops": 50
      }
    }
  ],
  "limits": {
    "maxApiCalls": 5000,
    "maxUsers": 5,
    "maxFarms": 3,
    "storageLimit": 500
  },
  "trialDays": 14,
  "isPopular": true,
  "sortOrder": 2
}
```

### 2. Subscriptions

#### Get My Subscriptions
```http
GET /subscriptions/my-subscriptions
Authorization: Bearer <user-token>
```

#### Get Single Subscription
```http
GET /subscriptions/:id
Authorization: Bearer <user-token>
```

#### Create Subscription
```http
POST /subscriptions
Authorization: Bearer <user-token>
```

**Request Body:**
```json
{
  "planId": "plan_id",
  "paymentMethodId": "payment_method_id",
  "startTrial": true
}
```

#### Cancel Subscription
```http
PUT /subscriptions/:id/cancel
Authorization: Bearer <user-token>
```

**Request Body:**
```json
{
  "reason": "Found a better solution",
  "effectiveDate": "2024-12-31T23:59:59.000Z"
}
```

#### Get Subscription Usage
```http
GET /subscriptions/:id/usage
Authorization: Bearer <user-token>
```

#### Update Subscription Usage
```http
PUT /subscriptions/:id/usage
Authorization: Bearer <user-token>
```

**Request Body:**
```json
{
  "apiCalls": 150,
  "loginCount": 5
}
```

### 3. Payment Methods

#### Get My Payment Methods
```http
GET /payments/methods/my-methods
Authorization: Bearer <user-token>
```

#### Add Payment Method
```http
POST /payments/methods
Authorization: Bearer <user-token>
```

**Request Body:**
```json
{
  "type": "credit_card",
  "provider": "stripe",
  "details": {
    "last4": "4242",
    "brand": "visa",
    "expMonth": 12,
    "expYear": 2025
  },
  "isDefault": true,
  "metadata": {
    "stripePaymentMethodId": "pm_1234567890",
    "stripeCustomerId": "cus_1234567890"
  }
}
```

#### Update Payment Method
```http
PUT /payments/methods/:id
Authorization: Bearer <user-token>
```

#### Delete Payment Method
```http
DELETE /payments/methods/:id
Authorization: Bearer <user-token>
```

### 4. Payments

#### Get My Payments
```http
GET /payments/my-payments
Authorization: Bearer <user-token>
```

**Query Parameters:**
- `status` (optional): Filter by payment status
- `type` (optional): Filter by payment type
- `limit` (optional): Number of results per page (default: 20)
- `page` (optional): Page number (default: 1)

#### Get Single Payment
```http
GET /payments/:id
Authorization: Bearer <user-token>
```

#### Create Payment
```http
POST /payments
Authorization: Bearer <user-token>
```

**Request Body:**
```json
{
  "subscriptionId": "subscription_id",
  "paymentMethodId": "payment_method_id",
  "amount": 49.99,
  "description": "Monthly subscription payment",
  "type": "subscription"
}
```

#### Update Payment Status
```http
PUT /payments/:id/status
Authorization: Bearer <user-token>
```

**Request Body:**
```json
{
  "status": "completed",
  "providerData": {
    "transactionId": "txn_1234567890",
    "chargeId": "ch_1234567890",
    "paymentIntentId": "pi_1234567890"
  }
}
```

#### Process Refund
```http
PUT /payments/:id/refund
Authorization: Bearer <user-token>
```

**Request Body:**
```json
{
  "amount": 49.99,
  "reason": "Customer requested refund"
}
```

### 5. Trial Conversion

#### Convert Trial to Paid Subscription
```http
PUT /trial/convert/:email
```

**Request Body:**
```json
{
  "planId": "plan_id",
  "paymentMethodId": "payment_method_id",
  "paymentDetails": "Credit Card ending in 4242"
}
```

## Data Models

### SubscriptionPlan
```json
{
  "_id": "ObjectId",
  "name": "String",
  "description": "String",
  "type": "basic|premium|enterprise|custom",
  "price": {
    "amount": "Number",
    "currency": "String",
    "billingCycle": "monthly|quarterly|yearly|lifetime"
  },
  "features": [
    {
      "name": "String",
      "description": "String",
      "included": "Boolean",
      "limits": "Mixed"
    }
  ],
  "limits": {
    "maxApiCalls": "Number",
    "maxUsers": "Number",
    "maxFarms": "Number",
    "storageLimit": "Number"
  },
  "trialDays": "Number",
  "isActive": "Boolean",
  "isPopular": "Boolean",
  "sortOrder": "Number",
  "metadata": {
    "stripePriceId": "String",
    "stripeProductId": "String",
    "paypalPlanId": "String"
  },
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Subscription
```json
{
  "_id": "ObjectId",
  "user": "ObjectId (ref: User)",
  "plan": "ObjectId (ref: SubscriptionPlan)",
  "status": "active|inactive|cancelled|expired|past_due|trialing",
  "billing": {
    "startDate": "Date",
    "endDate": "Date",
    "nextBillingDate": "Date",
    "billingCycle": "String",
    "amount": "Number",
    "currency": "String"
  },
  "trial": {
    "isTrial": "Boolean",
    "trialStartDate": "Date",
    "trialEndDate": "Date",
    "trialDays": "Number",
    "daysRemaining": "Number (virtual)"
  },
  "payment": {
    "method": "String",
    "paymentMethodId": "String",
    "lastPaymentDate": "Date",
    "nextPaymentDate": "Date",
    "totalPaid": "Number",
    "failedPayments": "Number"
  },
  "features": [
    {
      "name": "String",
      "enabled": "Boolean",
      "usage": "Number",
      "limit": "Number"
    }
  ],
  "usage": {
    "apiCalls": "Number",
    "lastActive": "Date",
    "loginCount": "Number"
  },
  "cancellation": {
    "requestedAt": "Date",
    "cancelledAt": "Date",
    "reason": "String",
    "effectiveDate": "Date"
  },
  "metadata": {
    "stripeSubscriptionId": "String",
    "stripeCustomerId": "String",
    "paypalSubscriptionId": "String",
    "notes": "String"
  },
  "isActive": "Boolean",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### PaymentMethod
```json
{
  "_id": "ObjectId",
  "user": "ObjectId (ref: User)",
  "type": "credit_card|debit_card|paypal|bank_account|crypto_wallet",
  "provider": "stripe|paypal|razorpay|square|other",
  "details": {
    "last4": "String",
    "brand": "String",
    "expMonth": "Number",
    "expYear": "Number",
    "bankName": "String",
    "accountType": "String",
    "paypalEmail": "String",
    "walletAddress": "String",
    "cryptoType": "String"
  },
  "isDefault": "Boolean",
  "isActive": "Boolean",
  "metadata": {
    "stripePaymentMethodId": "String",
    "stripeCustomerId": "String",
    "paypalPaymentMethodId": "String",
    "externalId": "String"
  },
  "verification": {
    "status": "pending|verified|failed",
    "verifiedAt": "Date",
    "failedAt": "Date",
    "failureReason": "String"
  },
  "maskedNumber": "String (virtual)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Payment
```json
{
  "_id": "ObjectId",
  "user": "ObjectId (ref: User)",
  "subscription": "ObjectId (ref: Subscription)",
  "paymentMethod": "ObjectId (ref: PaymentMethod)",
  "amount": "Number",
  "currency": "String",
  "status": "pending|processing|completed|failed|cancelled|refunded|partially_refunded",
  "type": "subscription|one_time|refund|chargeback|adjustment",
  "description": "String",
  "provider": "stripe|paypal|razorpay|square|manual",
  "providerData": {
    "transactionId": "String",
    "chargeId": "String",
    "paymentIntentId": "String",
    "refundId": "String",
    "rawResponse": "Mixed"
  },
  "billing": {
    "billingPeriodStart": "Date",
    "billingPeriodEnd": "Date",
    "invoiceNumber": "String",
    "dueDate": "Date"
  },
  "failure": {
    "reason": "String",
    "code": "String",
    "message": "String",
    "retryCount": "Number",
    "nextRetryAt": "Date"
  },
  "refund": {
    "amount": "Number",
    "reason": "String",
    "processedAt": "Date",
    "refundId": "String"
  },
  "metadata": {
    "notes": "String",
    "tags": ["String"],
    "customFields": "Mixed"
  },
  "processedAt": "Date",
  "isActive": "Boolean",
  "formattedAmount": "String (virtual)",
  "statusDisplay": "String (virtual)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information (optional)"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Testing with Postman

1. Import the `Subscription_Payment_System.postman_collection.json` file
2. Set the `baseUrl` variable to your server URL
3. Run the "Authentication" requests first to get a token
4. Use the token in subsequent requests
5. Follow the workflow: Plans → Payment Methods → Subscriptions → Payments

## Sample Workflow

1. **Register/Login** to get authentication token
2. **Get subscription plans** to see available options
3. **Add payment method** for the user
4. **Create subscription** with a plan and payment method
5. **Create payment** for the subscription
6. **Update payment status** to completed
7. **Monitor usage** and manage subscription as needed

## Security Notes

- All user-specific endpoints require authentication
- Admin endpoints require admin role
- Payment data is encrypted and PCI-compliant
- Rate limiting is applied to prevent abuse
- Input validation and sanitization are enforced


