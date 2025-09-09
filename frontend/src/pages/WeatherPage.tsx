import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  LinearProgress,
  Chip,
  Paper,
  TextField,
} from '@mui/material';
import { Grid } from '@mui/material';
import {
  Cloud as CloudIcon,
  Water as WaterIcon,
  Air as AirIcon,
  Thermostat as ThermostatIcon,
  Visibility as VisibilityIcon,
  Compress as CompressIcon,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { apiService } from '../services/api';
import { WeatherData } from '../types';

const WeatherPage: React.FC = () => {
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [historicalWeather, setHistoricalWeather] = useState<WeatherData[]>([]);
  const [weatherStats, setWeatherStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [lat, setLat] = useState<string>('');
  const [lon, setLon] = useState<string>('');

  useEffect(() => {
    // Wait for user to provide lat/lon before fetching
    setLoading(false);
  }, []);

  const fetchWeatherData = async () => {
    try {
      setError('');
      if (!lat || !lon) {
        setError('Latitude and longitude are required');
        return;
      }
      const latNum = Number(lat);
      const lonNum = Number(lon);
      if (Number.isNaN(latNum) || Number.isNaN(lonNum)) {
        setError('Latitude and longitude must be valid numbers');
        return;
      }
      setLoading(true);
      const [current, historical, stats] = await Promise.all([
        apiService.getCurrentWeather(latNum, lonNum),
        apiService.getHistoricalWeather(latNum, lonNum),
        apiService.getWeatherStats(latNum, lonNum),
      ]);

      setCurrentWeather(current);
      setHistoricalWeather(historical);
      setWeatherStats(stats);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (description?: string) => {
    const desc = (description || '').toLowerCase();
    if (desc.includes('sun') || desc.includes('clear')) return '☀️';
    if (desc.includes('cloud')) return '☁️';
    if (desc.includes('rain')) return '🌧️';
    if (desc.includes('storm')) return '⛈️';
    if (desc.includes('snow')) return '❄️';
    if (desc.includes('fog') || desc.includes('mist')) return '🌫️';
    return '🌤️';
  };

  const getTemperatureColor = (temp: number) => {
    if (temp < 0) return 'info';
    if (temp < 10) return 'primary';
    if (temp < 25) return 'success';
    if (temp < 35) return 'warning';
    return 'error';
  };

  const formatChartData = (data: WeatherData[]) => {
    return data.slice(-7).map(item => ({
      date: new Date(item.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      temperature: item.temperature,
      humidity: item.humidity,
      precipitation: item.precipitation,
    }));
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Weather Information
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Current conditions and historical weather data for your location
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            label="Latitude"
            type="number"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            size="small"
          />
          <TextField
            label="Longitude"
            type="number"
            value={lon}
            onChange={(e) => setLon(e.target.value)}
            size="small"
          />
          <Button
            variant="outlined"
            onClick={fetchWeatherData}
            sx={{ textTransform: 'none' }}
          >
            Fetch
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {currentWeather ? (
        <Grid container spacing={3}>
          {/* Current Weather Card */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Current Weather
                </Typography>
                <Box display="flex" alignItems="center" mb={3}>
                  <Typography variant="h2" sx={{ mr: 2 }}>
                    {getWeatherIcon(currentWeather.description)}
                  </Typography>
                  <Box>
                    <Typography variant="h3" component="span">
                      {currentWeather.temperature}°C
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ ml: 1 }}>
                      {currentWeather.description}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Location: {currentWeather.location}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Last updated: {new Date(currentWeather.timestamp).toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Weather Details */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Weather Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={6}>
                    <Box display="flex" alignItems="center" mb={2}>
                      <WaterIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Humidity
                        </Typography>
                        <Typography variant="h6">
                          {currentWeather.humidity}%
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid size={6}>
                    <Box display="flex" alignItems="center" mb={2}>
                      <AirIcon sx={{ mr: 1, color: 'info.main' }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Wind Speed
                        </Typography>
                        <Typography variant="h6">
                          {currentWeather.windSpeed} km/h
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid size={6}>
                    <Box display="flex" alignItems="center" mb={2}>
                      <VisibilityIcon sx={{ mr: 1, color: 'success.main' }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Precipitation
                        </Typography>
                        <Typography variant="h6">
                          {currentWeather.precipitation}mm
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid size={6}>
                    <Box display="flex" alignItems="center" mb={2}>
                      <CompressIcon sx={{ mr: 1, color: 'warning.main' }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Pressure
                        </Typography>
                        <Typography variant="h6">
                          -- hPa
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Temperature Trend Chart */}
          <Grid size={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  7-Day Temperature Trend
                </Typography>
                {historicalWeather.length > 0 ? (
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={formatChartData(historicalWeather)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="temperature"
                          stroke="#2e7d32"
                          strokeWidth={3}
                          dot={{ fill: '#2e7d32', strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                ) : (
                  <Box textAlign="center" py={8}>
                    <CloudIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography color="text.secondary">
                      No historical weather data available
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Weather Statistics */}
          {weatherStats && (
            <Grid size={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Weather Statistics
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <ThermostatIcon sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
                        <Typography variant="h6">
                          {weatherStats.maxTemperature || '--'}°C
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Max Temperature
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <ThermostatIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                        <Typography variant="h6">
                          {weatherStats.minTemperature || '--'}°C
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Min Temperature
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <WaterIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                        <Typography variant="h6">
                          {weatherStats.avgHumidity || '--'}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Avg Humidity
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <VisibilityIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                        <Typography variant="h6">
                          {weatherStats.totalPrecipitation || '--'}mm
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Precipitation
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Weather Alerts */}
          <Grid size={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Weather Alerts & Recommendations
                </Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  {currentWeather.temperature > 35 && (
                    <Alert severity="warning">
                      High temperature alert! Consider providing extra water to your crops and shade if possible.
                    </Alert>
                  )}
                  {currentWeather.temperature < 5 && (
                    <Alert severity="info">
                      Low temperature warning! Protect sensitive crops from frost damage.
                    </Alert>
                  )}
                  {currentWeather.humidity > 80 && (
                    <Alert severity="info">
                      High humidity detected. Monitor for fungal diseases and ensure good air circulation.
                    </Alert>
                  )}
                  {currentWeather.precipitation > 20 && (
                    <Alert severity="success">
                      Good rainfall! You may reduce irrigation for the next few days.
                    </Alert>
                  )}
                  {currentWeather.windSpeed > 30 && (
                    <Alert severity="warning">
                      Strong winds detected. Secure any loose equipment and check for wind damage.
                    </Alert>
                  )}
                  {!currentWeather.temperature || currentWeather.temperature < 35 && currentWeather.temperature > 5 && currentWeather.humidity < 80 && currentWeather.precipitation < 20 && currentWeather.windSpeed < 30 && (
                    <Alert severity="success">
                      Weather conditions are favorable for farming activities.
                    </Alert>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ) : (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <CloudIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Weather data unavailable
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Unable to fetch current weather information. Please try again later.
            </Typography>
            <Button
              variant="contained"
              onClick={fetchWeatherData}
              sx={{ textTransform: 'none' }}
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default WeatherPage;


