import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Paper,
  LinearProgress,
} from '@mui/material';
import { Grid } from '@mui/material';
import {
  Agriculture as AgricultureIcon,
  Cloud as CloudIcon,
  Store as StoreIcon,
  Forum as ForumIcon,
  TrendingUp as TrendingUpIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { Crop, WeatherData, MarketData, Notification } from '../types';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect admin users to admin dashboard
  useEffect(() => {
    if (user?.role === 'admin') {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [cropsData, weatherData, marketData, notificationsData] = await Promise.all([
          apiService.getCrops(),
          apiService.getCurrentWeather(),
          apiService.getMarketData(),
          apiService.getNotifications(),
        ]);

        setCrops(cropsData);
        setWeather(weatherData);
        setMarketData(marketData.slice(0, 5)); // Show only top 5
        setNotifications(notificationsData.slice(0, 5)); // Show only top 5
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getCropStatusColor = (status: string) => {
    switch (status) {
      case 'planted': return 'info';
      case 'growing': return 'success';
      case 'harvested': return 'warning';
      default: return 'default';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'warning': return <NotificationsIcon color="warning" />;
      case 'success': return <NotificationsIcon color="success" />;
      case 'error': return <NotificationsIcon color="error" />;
      default: return <NotificationsIcon color="info" />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Welcome Section */}
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          {getGreeting()}, {user?.firstName}! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome to your farming dashboard. Here's what's happening with your farm today.
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {/* Quick Stats */}
        <Box sx={{ flex: '2 1 400px', minWidth: '400px' }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography color="text.secondary" gutterBottom>
                        Total Crops
                      </Typography>
                      <Typography variant="h4">
                        {crops.length}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <AgricultureIcon />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Box>

            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography color="text.secondary" gutterBottom>
                        Temperature
                      </Typography>
                      <Typography variant="h4">
                        {weather ? `${weather.temperature}°C` : '--'}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'info.main' }}>
                      <CloudIcon />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Box>

            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography color="text.secondary" gutterBottom>
                        Market Prices
                      </Typography>
                      <Typography variant="h4">
                        {marketData.length}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'success.main' }}>
                      <StoreIcon />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Box>

            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography color="text.secondary" gutterBottom>
                        Notifications
                      </Typography>
                      <Typography variant="h4">
                        {notifications.filter(n => !n.isRead).length}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'warning.main' }}>
                      <NotificationsIcon />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </Box>

        {/* Weather Card */}
        <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Current Weather
              </Typography>
              {weather ? (
                <Box>
                  <Box display="flex" alignItems="center" mb={2}>
                    <CloudIcon sx={{ mr: 1, fontSize: 40 }} />
                    <Box>
                      <Typography variant="h4">
                        {weather.temperature}°C
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {weather.description}
                      </Typography>
                    </Box>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Humidity:</Typography>
                    <Typography variant="body2">{weather.humidity}%</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Wind Speed:</Typography>
                    <Typography variant="body2">{weather.windSpeed} km/h</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">Precipitation:</Typography>
                    <Typography variant="body2">{weather.precipitation}mm</Typography>
                  </Box>
                </Box>
              ) : (
                <Typography color="text.secondary">Weather data unavailable</Typography>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* Recent Crops */}
        <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Recent Crops</Typography>
                <Button
                  size="small"
                  onClick={() => navigate('/crops')}
                  sx={{ textTransform: 'none' }}
                >
                  View All
                </Button>
              </Box>
              {crops.length > 0 ? (
                <List>
                  {crops.slice(0, 5).map((crop, index) => (
                    <React.Fragment key={crop._id}>
                      <ListItem>
                        <ListItemIcon>
                          <AgricultureIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={crop.name}
                          secondary={`Planted: ${new Date(crop.plantingDate).toLocaleDateString()}`}
                        />
                        <Chip
                          label={crop.status}
                          color={getCropStatusColor(crop.status) as any}
                          size="small"
                        />
                      </ListItem>
                      {index < crops.slice(0, 5).length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box textAlign="center" py={4}>
                  <AgricultureIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography color="text.secondary" gutterBottom>
                    No crops yet
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/crops')}
                    sx={{ textTransform: 'none' }}
                  >
                    Add Your First Crop
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* Recent Notifications */}
        <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Recent Notifications</Typography>
                <Button
                  size="small"
                  onClick={() => navigate('/notifications')}
                  sx={{ textTransform: 'none' }}
                >
                  View All
                </Button>
              </Box>
              {notifications.length > 0 ? (
                <List>
                  {notifications.map((notification, index) => (
                    <React.Fragment key={notification._id}>
                      <ListItem>
                        <ListItemIcon>
                          {getNotificationIcon(notification.type)}
                        </ListItemIcon>
                        <ListItemText
                          primary={notification.title}
                          secondary={notification.message}
                        />
                      </ListItem>
                      {index < notifications.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box textAlign="center" py={4}>
                  <NotificationsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography color="text.secondary">
                    No notifications
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* Quick Actions */}
        <Box sx={{ flex: '1 1 100%', minWidth: '100%' }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<AgricultureIcon />}
                    onClick={() => navigate('/crops')}
                    sx={{ py: 2, textTransform: 'none' }}
                  >
                    Manage Crops
                  </Button>
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<CloudIcon />}
                    onClick={() => navigate('/weather')}
                    sx={{ py: 2, textTransform: 'none' }}
                  >
                    Check Weather
                  </Button>
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<StoreIcon />}
                    onClick={() => navigate('/market')}
                    sx={{ py: 2, textTransform: 'none' }}
                  >
                    View Market
                  </Button>
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<ForumIcon />}
                    onClick={() => navigate('/forum')}
                    sx={{ py: 2, textTransform: 'none' }}
                  >
                    Join Forum
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;


