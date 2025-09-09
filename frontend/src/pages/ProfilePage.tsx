import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Alert,
  Avatar,
  Divider,
  Paper,
  Chip,
} from '@mui/material';
import { Grid } from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { User } from '../types';

const schema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string().required('Phone number is required'),
});

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

const ProfilePage: React.FC = () => {
  const { user, login } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const updatedUser = await apiService.updateProfile(data);
      
      // Update the auth context with new user data
      const token = localStorage.getItem('token');
      if (token) {
        await login({ email: data.email, password: '' }); // This will update the user in context
      }
      
      setSuccess('Profile updated successfully!');
      setEditing(false);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    reset({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
    });
    setEditing(false);
    setError('');
    setSuccess('');
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    const firstInitial = firstName && firstName.length > 0 ? firstName.charAt(0) : 'U';
    const lastInitial = lastName && lastName.length > 0 ? lastName.charAt(0) : 'N';
    return `${firstInitial}${lastInitial}`.toUpperCase();
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'error';
      case 'expert': return 'warning';
      case 'farmer': return 'success';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!user) {
    return (
      <Box>
        <Alert severity="error">User data not available</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            My Profile
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your account information and preferences
          </Typography>
        </Box>
        {!editing && (
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => setEditing(true)}
            sx={{ textTransform: 'none' }}
          >
            Edit Profile
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {/* Profile Overview */}
        <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  bgcolor: 'primary.main',
                  fontSize: '3rem',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                {getInitials(user?.firstName, user?.lastName)}
              </Avatar>
              
              <Typography variant="h5" gutterBottom>
                {user.firstName} {user.lastName}
              </Typography>
              
              <Chip
                label={user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}
                color={getRoleColor(user.role) as any}
                sx={{ mb: 2 }}
              />
              
              <Box display="flex" alignItems="center" justifyContent="center" mb={1}>
                <EmailIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>
              </Box>
              
              <Box display="flex" alignItems="center" justifyContent="center" mb={1}>
                <PhoneIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {user.phone}
                </Typography>
              </Box>
              
              <Box display="flex" alignItems="center" justifyContent="center" mb={1}>
                <CalendarIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  Member since {formatDate(user.createdAt)}
                </Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box display="flex" alignItems="center" justifyContent="center">
                <Typography variant="body2" color="text.secondary">
                  Email Status: 
                </Typography>
                <Chip
                  label={user.isEmailVerified ? 'Verified' : 'Unverified'}
                  color={user.isEmailVerified ? 'success' : 'warning'}
                  size="small"
                  sx={{ ml: 1 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Profile Form */}
        <Box sx={{ flex: '2 1 400px', minWidth: '400px' }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
              
              <form onSubmit={handleSubmit(onSubmit)}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                    <Controller
                      name="firstName"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="First Name"
                          fullWidth
                          disabled={!editing}
                          error={!!errors.firstName}
                          helperText={errors.firstName?.message}
                        />
                      )}
                    />
                  </Box>
                  
                  <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                    <Controller
                      name="lastName"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Last Name"
                          fullWidth
                          disabled={!editing}
                          error={!!errors.lastName}
                          helperText={errors.lastName?.message}
                        />
                      )}
                    />
                  </Box>
                  
                  <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                    <Controller
                      name="email"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Email Address"
                          type="email"
                          fullWidth
                          disabled={!editing}
                          error={!!errors.email}
                          helperText={errors.email?.message}
                        />
                      )}
                    />
                  </Box>
                  
                  <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                    <Controller
                      name="phone"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Phone Number"
                          fullWidth
                          disabled={!editing}
                          error={!!errors.phone}
                          helperText={errors.phone?.message}
                        />
                      )}
                    />
                  </Box>
                </Box>

                {editing && (
                  <Box display="flex" gap={2} mt={3}>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<SaveIcon />}
                      disabled={loading}
                      sx={{ textTransform: 'none' }}
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<CancelIcon />}
                      onClick={handleCancel}
                      disabled={loading}
                      sx={{ textTransform: 'none' }}
                    >
                      Cancel
                    </Button>
                  </Box>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Account Information
              </Typography>
              
               <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      User ID
                    </Typography>
                    <Typography variant="body1" fontFamily="monospace">
                      {user._id}
                    </Typography>
                  </Paper>
                </Box>
                
                <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Account Type
                    </Typography>
                    <Typography variant="body1">
                      {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}
                    </Typography>
                  </Paper>
                </Box>
                
                <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Created At
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(user.createdAt)}
                    </Typography>
                  </Paper>
                </Box>
                
                <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Last Updated
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(user.updatedAt)}
                    </Typography>
                  </Paper>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default ProfilePage;


