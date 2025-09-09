import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Fab,
  Alert,
  LinearProgress,
} from '@mui/material';
import { Grid } from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Agriculture as AgricultureIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { apiService } from '../services/api';
import { Crop, CropFormData, CreateCropRequest } from '../types';

const schema: yup.ObjectSchema<CropFormData> = yup.object({
  name: yup.string().required('Crop name is required'),
  type: yup.string().required('Crop type is required'),
  plantingDate: yup.string().required('Planting date is required'),
  expectedHarvestDate: yup.string().required('Expected harvest date is required'),
  area: yup.number().typeError('Area must be a number').required('Area is required').min(0, 'Area cannot be negative'),
  unit: yup.mixed<'acres' | 'hectares' | 'square_meters'>().oneOf(['acres','hectares','square_meters']).required('Unit is required'),
  status: yup.string().oneOf(['planted', 'growing', 'harvested']).required('Status is required'),
  location: yup.string().optional(),
  notes: yup.string().optional(),
});


const CropsPage: React.FC = () => {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingCrop, setEditingCrop] = useState<Crop | null>(null);
  const [error, setError] = useState<string>('');

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CropFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      type: '',
      plantingDate: '',
      expectedHarvestDate: '',
      area: 0,
      unit: 'acres',
      status: 'planted',
      location: '',
      notes: '',
    },
  });

  useEffect(() => {
    fetchCrops();
  }, []);

  const fetchCrops = async () => {
    try {
      setLoading(true);
      const cropsData = await apiService.getCrops();
      setCrops(cropsData);
    } catch (error) {
      setError('Failed to fetch crops');
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (crop?: Crop) => {
    if (crop) {
      setEditingCrop(crop);
      reset({
        name: crop.name,
        type: crop.type,
        plantingDate: crop.plantingDate.split('T')[0],
        expectedHarvestDate: crop.harvestDate ? crop.harvestDate.split('T')[0] : '',
        area: 0,
        unit: 'acres',
        status: crop.status,
        location: crop.location,
        notes: crop.notes || '',
      });
    } else {
      setEditingCrop(null);
      reset({
        name: '',
        type: '',
        plantingDate: '',
        expectedHarvestDate: '',
        area: 0,
        unit: 'acres',
        status: 'planted',
        location: '',
        notes: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingCrop(null);
    reset();
  };

  const onSubmit = async (data: CropFormData) => {
    try {
      setError('');
      if (editingCrop) {
        await apiService.updateCrop(editingCrop._id, data as any);
      } else {
        const payload: CreateCropRequest = {
          name: data.name,
          type: data.type as any,
          plantingDate: data.plantingDate,
          expectedHarvestDate: data.expectedHarvestDate,
          area: Number(data.area),
          unit: data.unit,
          status: data.status as any,
          notes: data.notes,
        };
        await apiService.createCrop(payload);
      }
      await fetchCrops();
      handleClose();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to save crop');
    }
  };

  const handleDelete = async (cropId: string) => {
    if (window.confirm('Are you sure you want to delete this crop?')) {
      try {
        await apiService.deleteCrop(cropId);
        await fetchCrops();
      } catch (error) {
        setError('Failed to delete crop');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planted': return 'info';
      case 'growing': return 'success';
      case 'harvested': return 'warning';
      default: return 'default';
    }
  };

  const getDaysSincePlanted = (plantingDate: string) => {
    const today = new Date();
    const planted = new Date(plantingDate);
    const diffTime = Math.abs(today.getTime() - planted.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
            My Crops
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and track your agricultural crops
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
          sx={{ textTransform: 'none' }}
        >
          Add Crop
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {crops.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <AgricultureIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No crops yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Start by adding your first crop to track its growth and progress
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpen()}
              sx={{ textTransform: 'none' }}
            >
              Add Your First Crop
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {crops.map((crop) => (
            <Box key={crop._id} sx={{ flex: '1 1 300px', minWidth: '300px' }}>
              <Card sx={{ height: '100%', position: 'relative' }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Typography variant="h6" component="h2">
                      {crop.name}
                    </Typography>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => handleOpen(crop)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(crop._id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  <Chip
                    label={crop.status}
                    color={getStatusColor(crop.status) as any}
                    size="small"
                    sx={{ mb: 2 }}
                  />

                  <Box display="flex" alignItems="center" mb={1}>
                    <AgricultureIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {crop.type}
                    </Typography>
                  </Box>

                  <Box display="flex" alignItems="center" mb={1}>
                    <LocationIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {crop.location}
                    </Typography>
                  </Box>

                  <Box display="flex" alignItems="center" mb={1}>
                    <CalendarIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Planted {getDaysSincePlanted(crop.plantingDate)} days ago
                    </Typography>
                  </Box>

                  {crop.notes && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      {crop.notes}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      )}

      {/* Add/Edit Crop Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCrop ? 'Edit Crop' : 'Add New Crop'}
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Crop Name"
                      fullWidth
                      error={!!errors.name}
                      helperText={errors.name?.message}
                    />
                  )}
                />
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Crop Type"
                      fullWidth
                      error={!!errors.type}
                      helperText={errors.type?.message}
                    />
                  )}
                />
              </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <Controller
                  name="plantingDate"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Planting Date"
                      type="date"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.plantingDate}
                      helperText={errors.plantingDate?.message}
                    />
                  )}
                />
              </Box>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <Controller
                  name="expectedHarvestDate"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Expected Harvest Date"
                      type="date"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.expectedHarvestDate}
                      helperText={errors.expectedHarvestDate?.message}
                    />
                  )}
                />
              </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <Controller
                  name="area"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Area"
                      type="number"
                      fullWidth
                      error={!!errors.area}
                      helperText={errors.area?.message}
                    />
                  )}
                />
              </Box>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <Controller
                  name="unit"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.unit}>
                      <InputLabel>Unit</InputLabel>
                      <Select {...field} label="Unit">
                        <MenuItem value="acres">Acres</MenuItem>
                        <MenuItem value="hectares">Hectares</MenuItem>
                        <MenuItem value="square_meters">Square meters</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.status}>
                      <InputLabel>Status</InputLabel>
                      <Select {...field} label="Status">
                        <MenuItem value="planted">Planted</MenuItem>
                        <MenuItem value="growing">Growing</MenuItem>
                        <MenuItem value="harvested">Harvested</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <Controller
                  name="location"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Location"
                      fullWidth
                      error={!!errors.location}
                      helperText={errors.location?.message}
                    />
                  )}
                />
              </Box>
              </Box>
              <Box>
                <Controller
                  name="notes"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Notes (Optional)"
                      fullWidth
                      multiline
                      rows={3}
                      error={!!errors.notes}
                      helperText={errors.notes?.message}
                    />
                  )}
                />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingCrop ? 'Update' : 'Add'} Crop
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default CropsPage;


