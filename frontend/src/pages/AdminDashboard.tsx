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
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  AdminPanelSettings as AdminIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  Agriculture as AgricultureIcon,
  Forum as ForumIcon,
  Store as StoreIcon,
  Cloud as CloudIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  Analytics as AnalyticsIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { User, Crop, MarketData, ForumThread } from '../types';

interface AdminStats {
  totalUsers: number;
  totalCrops: number;
  totalForumThreads: number;
  totalMarketEntries: number;
  newUsersThisMonth: number;
  activeUsers: number;
}

interface SystemHealth {
  apiStatus: 'healthy' | 'warning' | 'error';
  databaseStatus: 'healthy' | 'warning' | 'error';
  lastBackup: string;
  uptime: string;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalCrops: 0,
    totalForumThreads: 0,
    totalMarketEntries: 0,
    newUsersThisMonth: 0,
    activeUsers: 0,
  });
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    apiStatus: 'healthy',
    databaseStatus: 'healthy',
    lastBackup: '2024-01-15',
    uptime: '99.9%',
  });
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [recentCrops, setRecentCrops] = useState<Crop[]>([]);
  const [recentForumThreads, setRecentForumThreads] = useState<ForumThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        // Fetch real data from backend API
        const [statsData, healthData, usersData, cropsData, threadsData] = await Promise.all([
          apiService.getAdminStats(),
          apiService.getSystemHealth(),
          apiService.getAllUsers(),
          apiService.getCrops(),
          apiService.getForumThreads()
        ]);

        setStats(statsData);
        setSystemHealth(healthData);
        setRecentUsers(usersData.slice(0, 5)); // Show only first 5 users
        setRecentCrops(cropsData.slice(0, 5)); // Show only first 5 crops
        setRecentForumThreads(threadsData.slice(0, 5)); // Show only first 5 threads
      } catch (error) {
        console.error('Error fetching admin data:', error);
        // Fallback to mock data if API fails
        const mockStats: AdminStats = {
          totalUsers: 0,
          totalCrops: 0,
          totalForumThreads: 0,
          totalMarketEntries: 0,
          newUsersThisMonth: 0,
          activeUsers: 0,
        };

        const mockHealth: SystemHealth = {
          apiStatus: 'error',
          databaseStatus: 'error',
          lastBackup: 'N/A',
          uptime: 'N/A',
        };

        setStats(mockStats);
        setSystemHealth(mockHealth);
        setRecentUsers([]);
        setRecentCrops([]);
        setRecentForumThreads([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'error';
      case 'expert': return 'warning';
      case 'farmer': return 'success';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const handleUserAction = (action: string, userId: string) => {
    console.log(`${action} user ${userId}`);
    // Implement user management actions
  };

  const handleUserDialogOpen = (user: User) => {
    setSelectedUser(user);
    setUserDialogOpen(true);
  };

  const handleUserDialogClose = () => {
    setUserDialogOpen(false);
    setSelectedUser(null);
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
          {getGreeting()}, Admin {user?.firstName}! 👨‍💼
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome to the admin dashboard. Manage users, monitor system health, and oversee platform operations.
        </Typography>
      </Box>

      {/* System Health Overview */}
      <Box mb={4}>
        <Typography variant="h5" gutterBottom>
          System Health
        </Typography>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      API Status
                    </Typography>
                    <Chip
                      label={systemHealth.apiStatus}
                      color={getStatusColor(systemHealth.apiStatus) as any}
                      size="small"
                    />
                  </Box>
                  <Avatar sx={{ bgcolor: 'success.main' }}>
                    <SecurityIcon />
                  </Avatar>
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
                      Database
                    </Typography>
                    <Chip
                      label={systemHealth.databaseStatus}
                      color={getStatusColor(systemHealth.databaseStatus) as any}
                      size="small"
                    />
                  </Box>
                  <Avatar sx={{ bgcolor: 'info.main' }}>
                    <AnalyticsIcon />
                  </Avatar>
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
                      Uptime
                    </Typography>
                    <Typography variant="h6">
                      {systemHealth.uptime}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <TrendingUpIcon />
                  </Avatar>
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
                      Last Backup
                    </Typography>
                    <Typography variant="body2">
                      {new Date(systemHealth.lastBackup).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'warning.main' }}>
                    <SettingsIcon />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>

      {/* Statistics Overview */}
      <Box mb={4}>
        <Typography variant="h5" gutterBottom>
          Platform Statistics
        </Typography>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 150px', minWidth: '150px' }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      Total Users
                    </Typography>
                    <Typography variant="h4">
                      {stats.totalUsers.toLocaleString()}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <PeopleIcon />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: '1 1 150px', minWidth: '150px' }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      Total Crops
                    </Typography>
                    <Typography variant="h4">
                      {stats.totalCrops.toLocaleString()}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'success.main' }}>
                    <AgricultureIcon />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: '1 1 150px', minWidth: '150px' }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      Forum Threads
                    </Typography>
                    <Typography variant="h4">
                      {stats.totalForumThreads.toLocaleString()}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'info.main' }}>
                    <ForumIcon />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: '1 1 150px', minWidth: '150px' }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      Market Entries
                    </Typography>
                    <Typography variant="h4">
                      {stats.totalMarketEntries.toLocaleString()}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'warning.main' }}>
                    <StoreIcon />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: '1 1 150px', minWidth: '150px' }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      New Users (Month)
                    </Typography>
                    <Typography variant="h4">
                      {stats.newUsersThisMonth}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'secondary.main' }}>
                    <AddIcon />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: '1 1 150px', minWidth: '150px' }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      Active Users
                    </Typography>
                    <Typography variant="h4">
                      {stats.activeUsers.toLocaleString()}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'success.main' }}>
                    <TrendingUpIcon />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {/* Recent Users */}
        <Box sx={{ flex: '1 1 400px', minWidth: '400px' }}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Recent Users</Typography>
                <Button
                  size="small"
                  onClick={() => navigate('/admin/users')}
                  sx={{ textTransform: 'none' }}
                >
                  Manage Users
                </Button>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentUsers.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: 'primary.main' }}>
                              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {user.firstName} {user.lastName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {user.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={user.role}
                            color={getRoleColor(user.role) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={user.isEmailVerified ? 'Verified' : 'Pending'}
                            color={user.isEmailVerified ? 'success' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => handleUserDialogOpen(user)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleUserAction('edit', user._id)}
                          >
                            <EditIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Box>

        {/* Recent Forum Activity */}
        <Box sx={{ flex: '1 1 400px', minWidth: '400px' }}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Recent Forum Activity</Typography>
                <Button
                  size="small"
                  onClick={() => navigate('/admin/forum')}
                  sx={{ textTransform: 'none' }}
                >
                  Moderate Forum
                </Button>
              </Box>
              {recentForumThreads.length > 0 ? (
                <List>
                  {recentForumThreads.map((thread, index) => (
                    <React.Fragment key={thread._id}>
                      <ListItem>
                        <ListItemIcon>
                          <ForumIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={thread.title}
                          secondary={`By ${thread.author.firstName} ${thread.author.lastName} • ${new Date(thread.createdAt).toLocaleDateString()}`}
                        />
                        <Chip
                          label={thread.category}
                          size="small"
                          variant="outlined"
                        />
                      </ListItem>
                      {index < recentForumThreads.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box textAlign="center" py={4}>
                  <ForumIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography color="text.secondary">
                    No recent forum activity
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* Quick Admin Actions */}
        <Box sx={{ flex: '1 1 100%', minWidth: '100%' }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Admin Actions
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  startIcon={<PeopleIcon />}
                  onClick={() => navigate('/admin/users')}
                  sx={{ textTransform: 'none' }}
                >
                  Manage Users
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ForumIcon />}
                  onClick={() => navigate('/admin/forum')}
                  sx={{ textTransform: 'none' }}
                >
                  Moderate Forum
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<AnalyticsIcon />}
                  onClick={() => navigate('/admin/analytics')}
                  sx={{ textTransform: 'none' }}
                >
                  View Analytics
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<SettingsIcon />}
                  onClick={() => navigate('/admin/settings')}
                  sx={{ textTransform: 'none' }}
                >
                  System Settings
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<SecurityIcon />}
                  onClick={() => navigate('/admin/security')}
                  sx={{ textTransform: 'none' }}
                >
                  Security Logs
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* User Details Dialog */}
      <Dialog open={userDialogOpen} onClose={handleUserDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>User Details</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box>
              <Box display="flex" alignItems="center" mb={3}>
                <Avatar sx={{ width: 64, height: 64, mr: 2, bgcolor: 'primary.main' }}>
                  {selectedUser.firstName.charAt(0)}{selectedUser.lastName.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </Typography>
                  <Typography color="text.secondary">
                    {selectedUser.email}
                  </Typography>
                  <Chip
                    label={selectedUser.role}
                    color={getRoleColor(selectedUser.role) as any}
                    size="small"
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                  <TextField
                    label="Phone"
                    value={selectedUser.phone}
                    fullWidth
                    disabled
                  />
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                  <FormControl fullWidth>
                    <InputLabel>Role</InputLabel>
                    <Select
                      value={selectedUser.role}
                      label="Role"
                      disabled
                    >
                      <MenuItem value="farmer">Farmer</MenuItem>
                      <MenuItem value="expert">Expert</MenuItem>
                      <MenuItem value="admin">Admin</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                  <TextField
                    label="Email Verified"
                    value={selectedUser.isEmailVerified ? 'Yes' : 'No'}
                    fullWidth
                    disabled
                  />
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                  <TextField
                    label="Member Since"
                    value={new Date(selectedUser.createdAt).toLocaleDateString()}
                    fullWidth
                    disabled
                  />
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleUserDialogClose}>Close</Button>
          <Button variant="contained" onClick={() => {
            if (selectedUser) {
              handleUserAction('edit', selectedUser._id);
            }
            handleUserDialogClose();
          }}>
            Edit User
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;
