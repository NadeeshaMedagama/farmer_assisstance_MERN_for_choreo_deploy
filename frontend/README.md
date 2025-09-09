# Farmer Assistance Frontend

A modern, professional React frontend application for the Farmer Assistance platform. Built with TypeScript, Material-UI, and React Router for a seamless user experience.

## 🌟 Features

### Authentication
- **User Registration**: Complete registration form with validation
- **User Login**: Secure login with JWT token authentication
- **Profile Management**: Update user profile information
- **Protected Routes**: Secure navigation with authentication guards

### Dashboard
- **Overview Cards**: Quick stats for crops, weather, market data, and notifications
- **Weather Widget**: Current weather conditions and recommendations
- **Recent Activity**: Latest crops and notifications
- **Quick Actions**: Easy navigation to main features

### Crop Management
- **Add/Edit Crops**: Full CRUD operations for crop tracking
- **Crop Status**: Track planting, growing, and harvest stages
- **Location Tracking**: Record crop locations
- **Notes System**: Add detailed notes for each crop

### Weather Information
- **Current Weather**: Real-time weather data
- **Historical Data**: 7-day weather trends with charts
- **Weather Statistics**: Min/max temperatures, humidity, precipitation
- **Smart Alerts**: Weather-based farming recommendations

### Market Prices
- **Price Tracking**: Current market prices for various crops
- **Search & Filter**: Find specific crops and locations
- **Price Trends**: Visual trend indicators
- **External Data**: Integration with external market APIs

### Community Forum
- **Discussion Threads**: Create and participate in farming discussions
- **Reply System**: Engage with community members
- **User Profiles**: See author information and timestamps
- **Real-time Updates**: Latest discussions and replies

## 🛠️ Technology Stack

- **React 19** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Material-UI (MUI)** - Professional UI components
- **React Router** - Client-side routing
- **React Hook Form** - Form management with validation
- **Yup** - Schema validation
- **Axios** - HTTP client for API calls
- **Recharts** - Data visualization
- **Emotion** - CSS-in-JS styling

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.tsx      # Main layout with navigation
│   └── LoadingSpinner.tsx
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication state management
├── hooks/              # Custom React hooks
├── pages/              # Page components
│   ├── Dashboard.tsx   # Main dashboard
│   ├── LoginPage.tsx   # User login
│   ├── RegisterPage.tsx # User registration
│   ├── CropsPage.tsx   # Crop management
│   ├── WeatherPage.tsx # Weather information
│   ├── MarketPage.tsx  # Market prices
│   ├── ForumPage.tsx   # Community forum
│   └── ProfilePage.tsx # User profile
├── services/           # API services
│   └── api.ts         # Centralized API client
├── types/              # TypeScript type definitions
│   └── index.ts       # Shared types
├── utils/              # Utility functions
└── App.tsx            # Main application component
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API running on port 5000

### Installation

1. **Clone the repository**
   ```bash
   cd /home/nadeeshame/Documents/FarmerAssisstance/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_ENVIRONMENT=development
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

### Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## 🎨 Design System

### Color Palette
- **Primary**: Green (#2e7d32) - Agriculture theme
- **Secondary**: Orange (#ff9800) - Accent color
- **Background**: Light gray (#f5f5f5)
- **Paper**: White (#ffffff)

### Typography
- **Font Family**: Roboto, Helvetica, Arial
- **Headings**: Bold weights (500-600)
- **Body**: Regular weight (400)

### Components
- **Cards**: Elevated with rounded corners
- **Buttons**: Rounded with gradient effects
- **Forms**: Clean inputs with validation
- **Navigation**: Sidebar with active states

## 🔐 Authentication Flow

1. **Registration**: Users create accounts with email verification
2. **Login**: JWT token-based authentication
3. **Protected Routes**: Automatic redirect to login for unauthenticated users
4. **Token Management**: Automatic token refresh and logout on expiration
5. **Profile Updates**: Real-time user data synchronization

## 📱 Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Breakpoints**: 
  - xs: 0px
  - sm: 600px
  - md: 960px
  - lg: 1280px
  - xl: 1920px
- **Navigation**: Collapsible sidebar on mobile
- **Cards**: Responsive grid layouts

## 🔌 API Integration

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/me` - Update profile

### Feature Endpoints
- `GET /api/crops` - Get user crops
- `POST /api/crops` - Create new crop
- `PUT /api/crops/:id` - Update crop
- `DELETE /api/crops/:id` - Delete crop
- `GET /api/weather` - Current weather
- `GET /api/weather/historical` - Historical weather
- `GET /api/market` - Market prices
- `GET /api/forum` - Forum threads
- `POST /api/forum` - Create thread
- `POST /api/forum/:id/replies` - Reply to thread

## 🚨 Error Handling

- **Form Validation**: Real-time validation with helpful error messages
- **API Errors**: User-friendly error messages for failed requests
- **Network Issues**: Graceful handling of connectivity problems
- **Loading States**: Visual feedback during data fetching

## 🎯 User Experience Features

- **Loading Spinners**: Visual feedback during operations
- **Success Messages**: Confirmation of successful actions
- **Error Alerts**: Clear error communication
- **Empty States**: Helpful messages when no data is available
- **Search & Filter**: Easy data discovery
- **Responsive Tables**: Mobile-friendly data display

## 🔧 Development

### Code Style
- **TypeScript**: Strict type checking
- **ESLint**: Code quality enforcement
- **Prettier**: Code formatting (recommended)
- **Component Structure**: Functional components with hooks

### State Management
- **React Context**: Global authentication state
- **Local State**: Component-level state with useState
- **Form State**: React Hook Form for complex forms
- **API State**: Axios interceptors for global API handling

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Environment Variables for Production
```env
REACT_APP_API_URL=https://your-api-domain.com/api
REACT_APP_ENVIRONMENT=production
```

### Deployment Options
- **Netlify**: Drag and drop build folder
- **Vercel**: Connect GitHub repository
- **AWS S3**: Upload build folder to S3 bucket
- **Docker**: Containerize the application

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is part of the Farmer Assistance platform and follows the same licensing terms.

## 🆘 Support

For support and questions:
- Check the backend API documentation
- Review the component documentation
- Open an issue in the repository

---

**Built with ❤️ for the farming community**