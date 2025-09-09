import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Paper,
  LinearProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Agriculture as AgricultureIcon,
  Forum as ForumIcon,
  Store as StoreIcon,
  Cloud as CloudIcon,
} from '@mui/icons-material';
import { apiService } from '../../services/api';

interface AnalyticsData {
  userGrowth: {
    total: number;
    monthly: number;
    weekly: number;
  };
  platformUsage: {
    totalCrops: number;
    totalForumPosts: number;
    totalMarketEntries: number;
    weatherRequests: number;
  };
  engagement: {
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
    averageSessionTime: string;
  };
  revenue: {
    totalRevenue: number;
    monthlyRevenue: number;
    growthRate: number;
  };
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
  }[];
}

const AnalyticsPage: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    userGrowth: { total: 0, monthly: 0, weekly: 0 },
    platformUsage: { totalCrops: 0, totalForumPosts: 0, totalMarketEntries: 0, weatherRequests: 0 },
    engagement: { dailyActiveUsers: 0, weeklyActiveUsers: 0, monthlyActiveUsers: 0, averageSessionTime: '0m' },
    revenue: { totalRevenue: 0, monthlyRevenue: 0, growthRate: 0 },
  });
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        // Fetch real analytics data from backend API
        const analyticsData = await apiService.getAdminAnalytics(timeRange);
        setAnalyticsData(analyticsData);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        // Fallback to empty data if API fails
        setAnalyticsData({
          userGrowth: { total: 0, monthly: 0, weekly: 0 },
          platformUsage: { totalCrops: 0, totalForumPosts: 0, totalMarketEntries: 0, weatherRequests: 0 },
          engagement: { dailyActiveUsers: 0, weeklyActiveUsers: 0, monthlyActiveUsers: 0, averageSessionTime: '0m' },
          revenue: { totalRevenue: 0, monthlyRevenue: 0, growthRate: 0 },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [timeRange]);

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box mb={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4" component="h1">
            Analytics Dashboard 📊
          </Typography>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="7d">Last 7 days</MenuItem>
              <MenuItem value="30d">Last 30 days</MenuItem>
              <MenuItem value="90d">Last 90 days</MenuItem>
              <MenuItem value="1y">Last year</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Comprehensive analytics and insights for platform performance and user engagement.
        </Typography>
      </Box>

      {/* Key Metrics */}
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 4 }}>
        <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Users
                  </Typography>
                  <Typography variant="h4">
                    {analyticsData.userGrowth.total.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    +{analyticsData.userGrowth.monthly} this month
                  </Typography>
                </Box>
                <PeopleIcon sx={{ fontSize: 40, color: 'primary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Daily Active Users
                  </Typography>
                  <Typography variant="h4">
                    {analyticsData.engagement.dailyActiveUsers}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {analyticsData.engagement.weeklyActiveUsers} weekly
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 40, color: 'success.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Crops
                  </Typography>
                  <Typography variant="h4">
                    {analyticsData.platformUsage.totalCrops.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Platform content
                  </Typography>
                </Box>
                <AgricultureIcon sx={{ fontSize: 40, color: 'info.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Revenue Growth
                  </Typography>
                  <Typography variant="h4">
                    {analyticsData.revenue.growthRate}%
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    ${analyticsData.revenue.monthlyRevenue.toLocaleString()}/month
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 40, color: 'warning.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Platform Usage */}
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 4 }}>
        <Box sx={{ flex: '1 1 400px', minWidth: '400px' }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Platform Usage Statistics
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Box display="flex" alignItems="center">
                    <AgricultureIcon sx={{ mr: 1, color: 'success.main' }} />
                    <Typography variant="body2">Crop Management</Typography>
                  </Box>
                  <Typography variant="h6">
                    {analyticsData.platformUsage.totalCrops.toLocaleString()}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Box display="flex" alignItems="center">
                    <ForumIcon sx={{ mr: 1, color: 'info.main' }} />
                    <Typography variant="body2">Forum Posts</Typography>
                  </Box>
                  <Typography variant="h6">
                    {analyticsData.platformUsage.totalForumPosts.toLocaleString()}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Box display="flex" alignItems="center">
                    <StoreIcon sx={{ mr: 1, color: 'warning.main' }} />
                    <Typography variant="body2">Market Entries</Typography>
                  </Box>
                  <Typography variant="h6">
                    {analyticsData.platformUsage.totalMarketEntries.toLocaleString()}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box display="flex" alignItems="center">
                    <CloudIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body2">Weather Requests</Typography>
                  </Box>
                  <Typography variant="h6">
                    {analyticsData.platformUsage.weatherRequests.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 400px', minWidth: '400px' }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                User Engagement Metrics
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="body2">Daily Active Users</Typography>
                  <Typography variant="h6">
                    {analyticsData.engagement.dailyActiveUsers}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="body2">Weekly Active Users</Typography>
                  <Typography variant="h6">
                    {analyticsData.engagement.weeklyActiveUsers}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="body2">Monthly Active Users</Typography>
                  <Typography variant="h6">
                    {analyticsData.engagement.monthlyActiveUsers}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">Average Session Time</Typography>
                  <Typography variant="h6">
                    {analyticsData.engagement.averageSessionTime}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Charts Placeholder */}
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        <Box sx={{ flex: '1 1 400px', minWidth: '400px' }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                User Growth Trend
              </Typography>
              <Box 
                sx={{ 
                  height: 300, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  backgroundColor: 'grey.50',
                  borderRadius: 1,
                  border: '2px dashed',
                  borderColor: 'grey.300'
                }}
              >
                <Typography color="text.secondary">
                  📈 Chart visualization would go here
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 400px', minWidth: '400px' }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Platform Usage Distribution
              </Typography>
              <Box 
                sx={{ 
                  height: 300, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  backgroundColor: 'grey.50',
                  borderRadius: 1,
                  border: '2px dashed',
                  borderColor: 'grey.300'
                }}
              >
                <Typography color="text.secondary">
                  🥧 Pie chart visualization would go here
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default AnalyticsPage;
