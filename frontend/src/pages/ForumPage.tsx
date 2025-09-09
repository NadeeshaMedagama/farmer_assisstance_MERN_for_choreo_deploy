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
  Alert,
  LinearProgress,
  Avatar,
  Chip,
  Divider,
  IconButton,
  Paper,
  MenuItem,
} from '@mui/material';
import { Grid } from '@mui/material';
import {
  Add as AddIcon,
  Forum as ForumIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Reply as ReplyIcon,
  ThumbUp as ThumbUpIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { apiService } from '../services/api';
import { ForumThread, ForumReply, CreateThreadRequest } from '../types';

const threadSchema = yup.object({
  title: yup.string().required('Title is required'),
  content: yup.string().required('Content is required'),
  category: yup
    .mixed<ForumThread['category']>()
    .oneOf([
      'general','crop_management','pest_control','soil_health','weather','market_prices','equipment','organic_farming','irrigation','fertilizers','harvesting','storage','other'
    ])
    .required('Category is required'),
});

const replySchema = yup.object({
  content: yup.string().required('Reply content is required'),
});

interface ThreadFormData {
  title: string;
  content: string;
  category: ForumThread['category'];
}

interface ReplyFormData {
  content: string;
}

const ForumPage: React.FC = () => {
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<ForumThread | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [threadDialogOpen, setThreadDialogOpen] = useState(false);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);

  const {
    control: threadControl,
    handleSubmit: handleThreadSubmit,
    reset: resetThread,
    formState: { errors: threadErrors },
  } = useForm<ThreadFormData>({
    resolver: yupResolver(threadSchema),
    defaultValues: {
      title: '',
      content: '',
      category: 'general',
    },
  });

  const {
    control: replyControl,
    handleSubmit: handleReplySubmit,
    reset: resetReply,
    formState: { errors: replyErrors },
  } = useForm<ReplyFormData>({
    resolver: yupResolver(replySchema),
    defaultValues: {
      content: '',
    },
  });

  useEffect(() => {
    fetchThreads();
  }, []);

  const fetchThreads = async () => {
    try {
      setLoading(true);
      const threadsData = await apiService.getForumThreads();
      setThreads(threadsData);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to fetch forum threads');
    } finally {
      setLoading(false);
    }
  };

  const fetchThread = async (threadId: string) => {
    try {
      const thread = await apiService.getForumThread(threadId);
      setSelectedThread(thread);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to fetch thread details');
    }
  };

  const handleCreateThread = async (data: ThreadFormData) => {
    try {
      setError('');
      const payload: CreateThreadRequest = {
        title: data.title,
        content: data.content,
        category: data.category,
      };
      await apiService.createForumThread(payload);
      await fetchThreads();
      setThreadDialogOpen(false);
      resetThread();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to create thread');
    }
  };

  const handleReply = async (data: ReplyFormData) => {
    if (!selectedThread) return;
    
    try {
      setError('');
      await apiService.replyToThread(selectedThread._id, data.content);
      await fetchThread(selectedThread._id);
      setReplyDialogOpen(false);
      resetReply();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to post reply');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    const firstInitial = firstName && firstName.length > 0 ? firstName.charAt(0) : 'U';
    const lastInitial = lastName && lastName.length > 0 ? lastName.charAt(0) : 'N';
    return `${firstInitial}${lastInitial}`.toUpperCase();
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
            Community Forum
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Connect with fellow farmers and share knowledge
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setThreadDialogOpen(true)}
          sx={{ textTransform: 'none' }}
        >
          New Thread
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {/* Threads List */}
        <Box sx={{ flex: '2 1 400px', minWidth: '400px' }}>
          {threads.length === 0 ? (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 8 }}>
                <ForumIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No discussions yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Be the first to start a conversation in the community forum
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setThreadDialogOpen(true)}
                  sx={{ textTransform: 'none' }}
                >
                  Start First Thread
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Box>
              {threads.map((thread) => (
                <Card key={thread._id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Box flex={1}>
                        <Typography
                          variant="h6"
                          component="h2"
                          sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                          onClick={() => fetchThread(thread._id)}
                        >
                          {thread.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {thread.content.length > 150 
                            ? `${thread.content.substring(0, 150)}...` 
                            : thread.content
                          }
                        </Typography>
                      </Box>
                    </Box>

                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                          {getInitials(thread.author?.firstName, thread.author?.lastName)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {thread.author?.firstName || 'Unknown'} {thread.author?.lastName || 'User'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(thread.createdAt)}
                          </Typography>
                        </Box>
                      </Box>

                      <Box display="flex" alignItems="center" gap={1}>
                        <Chip
                          icon={<ReplyIcon />}
                          label={thread.replies.length}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          icon={<VisibilityIcon />}
                          label="View"
                          size="small"
                          variant="outlined"
                          onClick={() => fetchThread(thread._id)}
                          sx={{ cursor: 'pointer' }}
                        />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Box>

        {/* Thread Details */}
        <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
          {selectedThread ? (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {selectedThread.title}
                </Typography>
                
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main', mr: 2 }}>
                    {getInitials(selectedThread.author?.firstName, selectedThread.author?.lastName)}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {selectedThread.author?.firstName || 'Unknown'} {selectedThread.author?.lastName || 'User'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(selectedThread.createdAt)}
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="body1" sx={{ mb: 3 }}>
                  {selectedThread.content}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">
                    Replies ({selectedThread.replies.length})
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<ReplyIcon />}
                    onClick={() => setReplyDialogOpen(true)}
                    sx={{ textTransform: 'none' }}
                  >
                    Reply
                  </Button>
                </Box>

                {selectedThread.replies.length > 0 ? (
                  <Box>
                    {selectedThread.replies.map((reply, index) => (
                      <Paper key={reply._id} sx={{ p: 2, mb: 2 }}>
                        <Box display="flex" alignItems="center" mb={1}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main', mr: 2 }}>
                            {getInitials(reply.author?.firstName, reply.author?.lastName)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {reply.author?.firstName || 'Unknown'} {reply.author?.lastName || 'User'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(reply.createdAt)}
                            </Typography>
                          </Box>
                        </Box>
                        <Typography variant="body2">
                          {reply.content}
                        </Typography>
                      </Paper>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                    No replies yet. Be the first to respond!
                  </Typography>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <ForumIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Select a Thread
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Click on a thread to view its details and replies
                </Typography>
              </CardContent>
            </Card>
          )}
        </Box>
      </Box>

      {/* Create Thread Dialog */}
      <Dialog open={threadDialogOpen} onClose={() => setThreadDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Thread</DialogTitle>
        <form onSubmit={handleThreadSubmit(handleCreateThread)}>
          <DialogContent>
            <Controller
              name="title"
              control={threadControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Thread Title"
                  fullWidth
                  margin="normal"
                  error={!!threadErrors.title}
                  helperText={threadErrors.title?.message}
                />
              )}
            />
            <Controller
              name="category"
              control={threadControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Category"
                  fullWidth
                  margin="normal"
                  select
                  error={!!threadErrors.category}
                  helperText={threadErrors.category?.message}
                >
                  {[
                    'general','crop_management','pest_control','soil_health','weather','market_prices','equipment','organic_farming','irrigation','fertilizers','harvesting','storage','other'
                  ].map((cat) => (
                    <MenuItem key={cat} value={cat}>{cat.replace(/_/g,' ')}</MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Controller
              name="content"
              control={threadControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Content"
                  fullWidth
                  multiline
                  rows={6}
                  margin="normal"
                  error={!!threadErrors.content}
                  helperText={threadErrors.content?.message}
                />
              )}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setThreadDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              Create Thread
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Reply Dialog */}
      <Dialog open={replyDialogOpen} onClose={() => setReplyDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reply to Thread</DialogTitle>
        <form onSubmit={handleReplySubmit(handleReply)}>
          <DialogContent>
            <Controller
              name="content"
              control={replyControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Your Reply"
                  fullWidth
                  multiline
                  rows={4}
                  margin="normal"
                  error={!!replyErrors.content}
                  helperText={replyErrors.content?.message}
                />
              )}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setReplyDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              Post Reply
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default ForumPage;


