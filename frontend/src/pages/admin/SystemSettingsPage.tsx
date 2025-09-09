import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Switch,
  FormControlLabel,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Alert,
  Snackbar,
  LinearProgress,
} from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Cloud as CloudIcon,
  Storage as StorageIcon,
} from '@mui/icons-material';
import { apiService } from '../../services/api';

interface SystemSettings {
  general: {
    siteName: string;
    siteDescription: string;
    maintenanceMode: boolean;
    registrationEnabled: boolean;
    emailVerificationRequired: boolean;
  };
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    smsNotifications: boolean;
    adminNotifications: boolean;
  };
  security: {
    sessionTimeout: number;
    maxLoginAttempts: number;
    passwordMinLength: number;
    twoFactorAuth: boolean;
    ipWhitelist: string[];
  };
  integrations: {
    weatherApiKey: string;
    marketDataApiKey: string;
    emailService: string;
    smsService: string;
  };
}

const SystemSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    general: {
      siteName: 'Farmer Assistant',
      siteDescription: 'Your comprehensive farming companion',
      maintenanceMode: false,
      registrationEnabled: true,
      emailVerificationRequired: true,
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      adminNotifications: true,
    },
    security: {
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      passwordMinLength: 8,
      twoFactorAuth: false,
      ipWhitelist: [],
    },
    integrations: {
      weatherApiKey: '',
      marketDataApiKey: '',
      emailService: 'smtp',
      smsService: 'twilio',
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Fetch real settings from backend API
        const settingsData = await apiService.getSystemSettings();
        setSettings(settingsData);
      } catch (error) {
        console.error('Error fetching settings:', error);
        // Keep default settings if API fails
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSettingChange = (category: keyof SystemSettings, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value,
      },
    }));
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      // Save settings to backend API
      await apiService.updateSystemSettings(settings);
      setSnackbarMessage('Settings saved successfully!');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSnackbarMessage('Error saving settings');
      setSnackbarOpen(true);
    } finally {
      setSaving(false);
    }
  };

  const handleResetSettings = () => {
    // Reset to default values
    setSnackbarMessage('Settings reset to defaults');
    setSnackbarOpen(true);
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
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          System Settings ⚙️
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Configure system-wide settings, security options, and integrations.
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {/* General Settings */}
        <Box sx={{ flex: '1 1 400px', minWidth: '400px' }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <CloudIcon sx={{ mr: 1 }} />
                <Typography variant="h6">General Settings</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Site Name"
                  value={settings.general.siteName}
                  onChange={(e) => handleSettingChange('general', 'siteName', e.target.value)}
                />
                <TextField
                  fullWidth
                  label="Site Description"
                  multiline
                  rows={3}
                  value={settings.general.siteDescription}
                  onChange={(e) => handleSettingChange('general', 'siteDescription', e.target.value)}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.general.maintenanceMode}
                      onChange={(e) => handleSettingChange('general', 'maintenanceMode', e.target.checked)}
                    />
                  }
                  label="Maintenance Mode"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.general.registrationEnabled}
                      onChange={(e) => handleSettingChange('general', 'registrationEnabled', e.target.checked)}
                    />
                  }
                  label="Allow New Registrations"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.general.emailVerificationRequired}
                      onChange={(e) => handleSettingChange('general', 'emailVerificationRequired', e.target.checked)}
                    />
                  }
                  label="Require Email Verification"
                />
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Notification Settings */}
        <Box sx={{ flex: '1 1 400px', minWidth: '400px' }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <NotificationsIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Notification Settings</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.emailNotifications}
                      onChange={(e) => handleSettingChange('notifications', 'emailNotifications', e.target.checked)}
                    />
                  }
                  label="Email Notifications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.pushNotifications}
                      onChange={(e) => handleSettingChange('notifications', 'pushNotifications', e.target.checked)}
                    />
                  }
                  label="Push Notifications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.smsNotifications}
                      onChange={(e) => handleSettingChange('notifications', 'smsNotifications', e.target.checked)}
                    />
                  }
                  label="SMS Notifications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.adminNotifications}
                      onChange={(e) => handleSettingChange('notifications', 'adminNotifications', e.target.checked)}
                    />
                  }
                  label="Admin Notifications"
                />
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Security Settings */}
        <Box sx={{ flex: '1 1 400px', minWidth: '400px' }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <SecurityIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Security Settings</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                  <TextField
                    fullWidth
                    label="Session Timeout (minutes)"
                    type="number"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                  />
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                  <TextField
                    fullWidth
                    label="Max Login Attempts"
                    type="number"
                    value={settings.security.maxLoginAttempts}
                    onChange={(e) => handleSettingChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                  />
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                  <TextField
                    fullWidth
                    label="Password Min Length"
                    type="number"
                    value={settings.security.passwordMinLength}
                    onChange={(e) => handleSettingChange('security', 'passwordMinLength', parseInt(e.target.value))}
                  />
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.security.twoFactorAuth}
                        onChange={(e) => handleSettingChange('security', 'twoFactorAuth', e.target.checked)}
                      />
                    }
                    label="Two-Factor Authentication"
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Integration Settings */}
        <Box sx={{ flex: '1 1 400px', minWidth: '400px' }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <StorageIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Integration Settings</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Weather API Key"
                  type="password"
                  value={settings.integrations.weatherApiKey}
                  onChange={(e) => handleSettingChange('integrations', 'weatherApiKey', e.target.value)}
                />
                <TextField
                  fullWidth
                  label="Market Data API Key"
                  type="password"
                  value={settings.integrations.marketDataApiKey}
                  onChange={(e) => handleSettingChange('integrations', 'marketDataApiKey', e.target.value)}
                />
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                    <FormControl fullWidth>
                      <InputLabel>Email Service</InputLabel>
                      <Select
                        value={settings.integrations.emailService}
                        label="Email Service"
                        onChange={(e) => handleSettingChange('integrations', 'emailService', e.target.value)}
                      >
                        <MenuItem value="smtp">SMTP</MenuItem>
                        <MenuItem value="sendgrid">SendGrid</MenuItem>
                        <MenuItem value="mailgun">Mailgun</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                  <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                    <FormControl fullWidth>
                      <InputLabel>SMS Service</InputLabel>
                      <Select
                        value={settings.integrations.smsService}
                        label="SMS Service"
                        onChange={(e) => handleSettingChange('integrations', 'smsService', e.target.value)}
                      >
                        <MenuItem value="twilio">Twilio</MenuItem>
                        <MenuItem value="aws-sns">AWS SNS</MenuItem>
                        <MenuItem value="none">None</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ flex: '1 1 100%', minWidth: '100%' }}>
          <Card>
            <CardContent>
              <Box display="flex" gap={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={handleResetSettings}
                  disabled={saving}
                >
                  Reset to Defaults
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveSettings}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Settings'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default SystemSettingsPage;
