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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Avatar,
} from '@mui/material';
import { Grid } from '@mui/material';
import {
  Store as StoreIcon,
  Search as SearchIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { apiService } from '../services/api';
import { MarketData } from '../types';

const MarketPage: React.FC = () => {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [externalData, setExternalData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [sortBy, setSortBy] = useState<'price' | 'date' | 'crop'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchMarketData();
  }, []);

  const fetchMarketData = async () => {
    try {
      setLoading(true);
      const [localData, externalData] = await Promise.all([
        apiService.getMarketData(),
        apiService.getExternalMarketData(),
      ]);

      setMarketData(localData);
      setExternalData(externalData);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to fetch market data');
    } finally {
      setLoading(false);
    }
  };

  const filteredData = [...marketData, ...externalData]
    .filter(item => 
      item.cropName.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (locationFilter === '' || item.location.toLowerCase().includes(locationFilter.toLowerCase()))
    )
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'date':
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case 'crop':
          aValue = a.cropName.toLowerCase();
          bValue = b.cropName.toLowerCase();
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const getUniqueLocations = () => {
    const locations = [...marketData, ...externalData].map(item => item.location);
    return Array.from(new Set(locations));
  };

  const getUniqueCrops = () => {
    const crops = [...marketData, ...externalData].map(item => item.cropName);
    return Array.from(new Set(crops));
  };

  const getAveragePrice = (cropName: string) => {
    const cropData = [...marketData, ...externalData].filter(item => item.cropName === cropName);
    if (cropData.length === 0) return 0;
    const total = cropData.reduce((sum, item) => sum + item.price, 0);
    return total / cropData.length;
  };

  const getPriceTrend = (cropName: string) => {
    const cropData = [...marketData, ...externalData]
      .filter(item => item.cropName === cropName)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    if (cropData.length < 2) return 'stable';
    
    const latest = cropData[cropData.length - 1].price;
    const previous = cropData[cropData.length - 2].price;
    
    if (latest > previous) return 'up';
    if (latest < previous) return 'down';
    return 'stable';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUpIcon color="success" />;
      case 'down': return <TrendingDownIcon color="error" />;
      default: return <TrendingUpIcon color="disabled" />;
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Market Prices
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Current market prices and trends for agricultural products
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchMarketData}
          sx={{ textTransform: 'none' }}
        >
          Refresh Data
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Search and Filter Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <TextField
                fullWidth
                placeholder="Search crops..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                helperText={!searchTerm ? 'Name is required' : ' '}
                error={!searchTerm}
              />
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <FormControl fullWidth>
                <InputLabel>Location</InputLabel>
                <Select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  label="Location"
                >
                  <MenuItem value="">All Locations</MenuItem>
                  {getUniqueLocations().map((location) => (
                    <MenuItem key={location} value={location}>
                      {location}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <FormControl fullWidth>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  label="Sort By"
                >
                  <MenuItem value="date">Date</MenuItem>
                  <MenuItem value="price">Price</MenuItem>
                  <MenuItem value="crop">Crop Name</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <FormControl fullWidth>
                <InputLabel>Order</InputLabel>
                <Select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as any)}
                  label="Order"
                >
                  <MenuItem value="desc">Descending</MenuItem>
                  <MenuItem value="asc">Ascending</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Market Overview Cards */}
      <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
        <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Crops
                  </Typography>
                  <Typography variant="h4">
                    {getUniqueCrops().length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <StoreIcon />
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
                    Total Markets
                  </Typography>
                  <Typography variant="h4">
                    {getUniqueLocations().length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <LocationIcon />
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
                    Price Updates
                  </Typography>
                  <Typography variant="h4">
                    {filteredData.length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <CalendarIcon />
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
                    Avg Price Range
                  </Typography>
                  <Typography variant="h4">
                    ${Math.round(Math.min(...filteredData.map(item => item.price)))} - ${Math.round(Math.max(...filteredData.map(item => item.price)))}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <TrendingUpIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Box>
        </Box>

      {/* Crop Price Summary */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Crop Price Summary
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {getUniqueCrops().slice(0, 6).map((crop) => (
              <Box key={crop} sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <Paper sx={{ p: 2 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="h6">{crop}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Avg: ${getAveragePrice(crop).toFixed(2)}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center">
                      {getTrendIcon(getPriceTrend(crop))}
                    </Box>
                  </Box>
                </Paper>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Market Data Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Market Data
          </Typography>
          {filteredData.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Crop</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell>Unit</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Source</TableCell>
                    <TableCell>Trend</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {item.cropName}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="h6" color="primary">
                          ${item.price}
                        </Typography>
                      </TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <LocationIcon sx={{ mr: 1, fontSize: 16 }} />
                          {item.location}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {new Date(item.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={item.source}
                          size="small"
                          color={item.source === 'external' ? 'secondary' : 'primary'}
                        />
                      </TableCell>
                      <TableCell>
                        {getTrendIcon(getPriceTrend(item.cropName))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box textAlign="center" py={8}>
              <StoreIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No market data found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your search criteria or check back later for updates.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default MarketPage;


