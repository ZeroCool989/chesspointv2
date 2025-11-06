import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';

interface FeedbackThread {
  id: string;
  title: string;
  message: string;
  category: string;
  userId: string;
  userName: string;
  createdAt: string;
  comments: Comment[];
}

interface Comment {
  id: string;
  message: string;
  userId: string;
  userName: string;
  createdAt: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`feedback-tabpanel-${index}`}
      aria-labelledby={`feedback-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function FeedbackPage() {
  const { user, accessToken } = useAuth();
  const isAuthenticated = !!user;
  const [tabValue, setTabValue] = useState(0);
  const [threads, setThreads] = useState<FeedbackThread[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Thread creation form
  const [threadForm, setThreadForm] = useState({
    title: '',
    message: '',
    category: 'feature',
  });

  // Comment form
  const [commentForm, setCommentForm] = useState({
    threadId: '',
    message: '',
  });

  // Guest feedback form
  const [guestForm, setGuestForm] = useState({
    category: 'feature',
    message: '',
    email: '',
    name: '',
  });

  // Load threads on component mount
  useEffect(() => {
    loadThreads();
  }, []);

  const loadThreads = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/feedback/threads', {
        method: 'GET',
        cache: 'no-store',
      });
      const data = await response.json();
      
      if (response.ok) {
        setThreads(data.threads || []);
      } else {
        setError(data.error || 'Failed to load feedback threads');
      }
    } catch (err) {
      setError('Failed to load feedback threads');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setError('Please log in to create feedback threads');
      return;
    }

    try {
      setLoading(true);
      
      if (!accessToken) {
        setError('Authentication token not available');
        return;
      }
      
      const response = await fetch('/api/feedback/threads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(threadForm),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Feedback thread created successfully!');
        setThreadForm({ title: '', message: '', category: 'feature' });
        loadThreads();
      } else {
        setError(data.error || 'Failed to create thread');
      }
    } catch (err) {
      setError('Failed to create feedback thread');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (threadId: string, message: string) => {
    if (!isAuthenticated) {
      setError('Please log in to add comments');
      return;
    }

    try {
      setLoading(true);
      
      if (!accessToken) {
        setError('Authentication token not available');
        return;
      }
      
      const response = await fetch('/api/feedback/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ threadId, message }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Comment added successfully!');
        loadThreads();
      } else {
        setError(data.error || 'Failed to add comment');
      }
    } catch (err) {
      setError('Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const response = await fetch('/api/feedback/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(guestForm),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Guest feedback sent successfully!');
        setGuestForm({ category: 'feature', message: '', email: '', name: '' });
      } else {
        setError(data.error || 'Failed to send feedback');
      }
    } catch (err) {
      setError('Failed to send guest feedback');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'bug': return 'error';
      case 'feature': return 'primary';
      case 'ui': return 'secondary';
      default: return 'default';
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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ 
          background: 'linear-gradient(135deg, #7B5AF0 0%, #A78BFA 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 700,
        }}>
          Feedback & Support
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Share your thoughts, report bugs, or suggest new features
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={tabValue}
          onChange={(_e, newValue) => setTabValue(newValue)}
          aria-label="feedback tabs"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="View Feedback" />
          <Tab label="Create Thread" disabled={!isAuthenticated} />
          <Tab label="Guest Feedback" />
        </Tabs>

        {/* View Feedback Tab */}
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h5" gutterBottom>
            Community Feedback
          </Typography>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : threads.length === 0 ? (
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              No feedback threads yet. Be the first to start a discussion!
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {threads.map((thread) => (
                <Card key={thread.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" component="h3">
                        {thread.title}
                      </Typography>
                      <Chip 
                        label={thread.category} 
                        color={getCategoryColor(thread.category) as any}
                        size="small"
                      />
                    </Box>
                    
                    <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                      {thread.message}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        by {thread.userName} • {formatDate(thread.createdAt)}
                      </Typography>
                    </Box>

                    {thread.comments.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Comments ({thread.comments.length})
                        </Typography>
                        {thread.comments.map((comment) => (
                          <Box key={comment.id} sx={{ ml: 2, mb: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                              {comment.message}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              by {comment.userName} • {formatDate(comment.createdAt)}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    )}

                    {isAuthenticated && (
                      <Box sx={{ mt: 2 }}>
                        <TextField
                          fullWidth
                          multiline
                          rows={2}
                          placeholder="Add a comment..."
                          value={commentForm.threadId === thread.id ? commentForm.message : ''}
                          onChange={(e) => setCommentForm({ threadId: thread.id, message: e.target.value })}
                          sx={{ mb: 1 }}
                        />
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => {
                            if (commentForm.message.trim()) {
                              handleAddComment(thread.id, commentForm.message);
                              setCommentForm({ threadId: '', message: '' });
                            }
                          }}
                          disabled={loading || !commentForm.message.trim()}
                          sx={{
                            background: 'linear-gradient(135deg, #7B5AF0 0%, #A78BFA 100%)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #6D4EDB 0%, #9C7BFA 100%)',
                            },
                          }}
                        >
                          Add Comment
                        </Button>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </TabPanel>

        {/* Create Thread Tab */}
        <TabPanel value={tabValue} index={1}>
          {!isAuthenticated ? (
            <Alert severity="info">
              Please log in to create feedback threads and participate in discussions.
            </Alert>
          ) : (
            <Box>
              <Typography variant="h5" gutterBottom>
                Create New Feedback Thread
              </Typography>
              
              <form onSubmit={handleCreateThread}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={threadForm.category}
                    onChange={(e) => setThreadForm({ ...threadForm, category: e.target.value })}
                    label="Category"
                  >
                    <MenuItem value="bug">Bug Report</MenuItem>
                    <MenuItem value="feature">Feature Request</MenuItem>
                    <MenuItem value="ui">UI/UX Feedback</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Title"
                  value={threadForm.title}
                  onChange={(e) => setThreadForm({ ...threadForm, title: e.target.value })}
                  sx={{ mb: 2 }}
                  required
                />

                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  label="Message"
                  value={threadForm.message}
                  onChange={(e) => setThreadForm({ ...threadForm, message: e.target.value })}
                  sx={{ mb: 2 }}
                  required
                />

                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading || !threadForm.title.trim() || !threadForm.message.trim()}
                  sx={{
                    background: 'linear-gradient(135deg, #7B5AF0 0%, #A78BFA 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #6D4EDB 0%, #9C7BFA 100%)',
                    },
                  }}
                >
                  {loading ? <CircularProgress size={20} /> : 'Create Thread'}
                </Button>
              </form>
            </Box>
          )}
        </TabPanel>

        {/* Guest Feedback Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box>
            <Typography variant="h5" gutterBottom>
              Send Guest Feedback
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Not logged in? No problem! Send us your feedback via email.
            </Typography>
            
            <form onSubmit={handleGuestFeedback}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={guestForm.category}
                  onChange={(e) => setGuestForm({ ...guestForm, category: e.target.value })}
                  label="Category"
                >
                  <MenuItem value="bug">Bug Report</MenuItem>
                  <MenuItem value="feature">Feature Request</MenuItem>
                  <MenuItem value="ui">UI/UX Feedback</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Name (Optional)"
                value={guestForm.name}
                onChange={(e) => setGuestForm({ ...guestForm, name: e.target.value })}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Email (Optional)"
                type="email"
                value={guestForm.email}
                onChange={(e) => setGuestForm({ ...guestForm, email: e.target.value })}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                multiline
                rows={6}
                label="Message"
                value={guestForm.message}
                onChange={(e) => setGuestForm({ ...guestForm, message: e.target.value })}
                sx={{ mb: 2 }}
                required
              />

              <Button
                type="submit"
                variant="contained"
                disabled={loading || !guestForm.message.trim()}
                sx={{
                  background: 'linear-gradient(135deg, #7B5AF0 0%, #A78BFA 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #6D4EDB 0%, #9C7BFA 100%)',
                  },
                }}
              >
                {loading ? <CircularProgress size={20} /> : 'Send Feedback'}
              </Button>
            </form>
          </Box>
        </TabPanel>
      </Paper>
    </Container>
  );
}