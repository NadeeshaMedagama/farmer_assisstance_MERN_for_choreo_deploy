# Admin Dashboard API Guide

## Overview

The Admin Dashboard provides comprehensive system-wide data aggregation and analytics exclusively for users with admin privileges. This feature allows administrators to view all system data in a single, organized interface with real-time statistics and insights.

## Features

### 🔐 Security
- **Role-based Access Control**: Only users with `admin` role can access
- **JWT Authentication**: Requires valid authentication token
- **Audit Logging**: All admin actions are logged for security monitoring
- **Content Type Validation**: Enhanced security middleware

### 📊 Data Aggregation
- **Real-time Statistics**: Live data from all system collections
- **Performance Metrics**: System health and performance monitoring
- **User Analytics**: Registration trends and user behavior insights
- **Financial Overview**: Revenue, payments, and subscription analytics

## API Endpoints

### 1. Admin Dashboard Overview
```http
GET /api/admin/dashboard
```

**Description**: Retrieves comprehensive system overview with all data aggregated into a single response.

**Authentication**: Required (Admin only)

**Response Structure**:
```json
{
  "success": true,
  "message": "Admin dashboard data retrieved successfully",
  "data": {
    "overview": {
      "totalUsers": 150,
      "totalCrops": 89,
      "totalForums": 234,
      "totalMarkets": 45,
      "totalSubscriptions": 67,
      "totalPayments": 123,
      "totalRevenue": 45678.90,
      "userGrowthRate": 12.5,
      "responseTime": 245
    },
    "statistics": {
      "users": [
        {
          "_id": "farmer",
          "count": 120,
          "verified": 95,
          "unverified": 25
        }
      ],
      "crops": [
        {
          "_id": "planted",
          "count": 45,
          "totalArea": 234.5,
          "totalRevenue": 12345.67,
          "totalCost": 8901.23,
          "totalProfit": 3444.44
        }
      ],
      "forums": [
        {
          "_id": "crop_management",
          "count": 67,
          "totalViews": 1234,
          "totalLikes": 89,
          "totalReplies": 156
        }
      ],
      "markets": [
        {
          "_id": "vegetable",
          "count": 23,
          "avgWholesalePrice": 2.45,
          "avgRetailPrice": 3.67,
          "totalVolume": 1234.5
        }
      ],
      "subscriptions": [
        {
          "_id": "active",
          "count": 45,
          "totalRevenue": 2345.67,
          "totalPaid": 2100.00
        }
      ],
      "payments": [
        {
          "_id": "completed",
          "count": 98,
          "totalAmount": 12345.67
        }
      ],
      "purchases": [...],
      "notifications": [...],
      "contacts": [...],
      "subscribers": [...],
      "trials": [...],
      "weather": [...]
    },
    "recentActivity": {
      "users": [
        {
          "_id": "...",
          "firstName": "John",
          "lastName": "Doe",
          "email": "john@example.com",
          "role": "farmer",
          "isVerified": true,
          "createdAt": "2024-01-15T10:30:00Z",
          "lastLogin": "2024-01-20T14:22:00Z"
        }
      ],
      "crops": [...],
      "forums": [...],
      "payments": [...]
    },
    "systemHealth": {
      "databaseConnected": true,
      "lastUpdated": "2024-01-20T15:30:00Z",
      "dataFreshness": "real-time"
    }
  }
}
```

### 2. User Analytics
```http
GET /api/admin/analytics/users?timeframe=30d
```

**Description**: Get detailed user analytics with time-based filtering.

**Authentication**: Required (Admin only)

**Query Parameters**:
- `timeframe` (optional): Time period for analytics
  - `7d`: Last 7 days
  - `30d`: Last 30 days (default)
  - `90d`: Last 90 days
  - `1y`: Last 1 year

**Response Structure**:
```json
{
  "success": true,
  "message": "User analytics retrieved successfully",
  "data": {
    "timeframe": "30d",
    "analytics": [
      {
        "_id": {
          "date": "2024-01-15",
          "role": "farmer"
        },
        "count": 5,
        "verified": 4
      }
    ]
  }
}
```

### 3. System Metrics
```http
GET /api/admin/metrics/system
```

**Description**: Get system performance and health metrics.

**Authentication**: Required (Admin only)

**Response Structure**:
```json
{
  "success": true,
  "message": "System metrics retrieved successfully",
  "data": {
    "database": {
      "collections": [150, 89, 234, 45, 67, 123, 45, 234, 12, 34, 23, 456]
    },
    "performance": {
      "memoryUsage": {
        "rss": 45678912,
        "heapTotal": 23456789,
        "heapUsed": 12345678,
        "external": 1234567
      },
      "uptime": 1234567.89,
      "nodeVersion": "v18.17.0",
      "platform": "linux"
    },
    "timestamp": "2024-01-20T15:30:00Z"
  }
}
```

## Authentication

### Required Headers
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### User Role Requirement
The user must have `role: "admin"` in their profile to access these endpoints.

## Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "User role farmer is not authorized to access this route"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error retrieving admin dashboard data",
  "error": "Detailed error message (development only)"
}
```

## Usage Examples

### Using cURL
```bash
# Get admin dashboard
curl -X GET http://localhost:5000/api/admin/dashboard \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"

# Get user analytics for last 7 days
curl -X GET "http://localhost:5000/api/admin/analytics/users?timeframe=7d" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"

# Get system metrics
curl -X GET http://localhost:5000/api/admin/metrics/system \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Using JavaScript/Fetch
```javascript
const token = 'your_jwt_token_here';

// Get admin dashboard
const dashboardResponse = await fetch('/api/admin/dashboard', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const dashboardData = await dashboardResponse.json();
console.log('Dashboard Data:', dashboardData);

// Get user analytics
const analyticsResponse = await fetch('/api/admin/analytics/users?timeframe=30d', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const analyticsData = await analyticsResponse.json();
console.log('User Analytics:', analyticsData);
```

## Data Collections Included

The admin dashboard aggregates data from the following collections:

1. **Users** - User accounts, roles, verification status
2. **Crops** - Crop management data, yields, costs, profits
3. **Forums** - Community discussions, categories, engagement
4. **Markets** - Market prices, supply/demand, locations
5. **Subscriptions** - Subscription plans, billing, status
6. **Payments** - Payment transactions, amounts, methods
7. **Purchases** - Purchase history, amounts, status
8. **Notifications** - System notifications, read status
9. **Contacts** - Contact form submissions, status
10. **Subscribers** - Newsletter subscribers, status
11. **Trials** - Trial accounts, status, conversions
12. **Weather** - Weather data, locations, conditions

## Performance Considerations

- **Parallel Data Fetching**: All database queries run in parallel for optimal performance
- **Response Time Monitoring**: Built-in response time tracking
- **Memory Usage**: Efficient aggregation pipelines to minimize memory usage
- **Caching**: Consider implementing Redis caching for production environments

## Security Features

- **Audit Logging**: All admin actions are logged with timestamps and user information
- **Role Verification**: Double-checked admin role verification
- **Input Validation**: Content type and input validation
- **Error Handling**: Secure error messages (detailed errors only in development)

## Monitoring and Logging

All admin dashboard access is logged with:
- User ID and role
- Request timestamp
- Response time
- Data points accessed
- Success/failure status

Logs are available in:
- Application logs (`logs/combined.log`)
- Error logs (`logs/error.log`)
- Audit logs (via audit logger)

## Future Enhancements

Potential future features:
- Real-time data updates via WebSocket
- Custom date range filtering
- Export functionality (CSV, PDF)
- Advanced analytics and reporting
- Dashboard customization
- Alert system for critical metrics
- Data visualization endpoints

## Support

For technical support or questions about the admin dashboard:
1. Check the application logs for detailed error information
2. Verify user has admin role and valid JWT token
3. Ensure database connectivity
4. Review audit logs for access patterns

---

**Note**: This feature is designed for administrative use only. Ensure proper access controls are in place and regularly audit admin user accounts.
