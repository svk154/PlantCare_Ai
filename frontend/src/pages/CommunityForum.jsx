import { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Button, Chip, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem, 
  Avatar, FormControl, CircularProgress, Alert, InputAdornment,
  Pagination, InputLabel, Divider, Collapse,
  Tooltip, IconButton, FormControlLabel, Checkbox
} from '@mui/material';

import { 
  Search, Send, Plus, X, MessageCircle, ThumbsUp, ThumbsDown, Eye,
  SortDesc, Edit, Trash2, FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { getApiBaseUrl } from '../utils/apiConfig';

// Enhanced categories list
const CATEGORIES = [
  "Crop Problems",
  "Fertilizer & Pesticide",
  "Irrigation",
  "Machinery",
  "Best Practices",
  "Success Stories",
  "Ask an Expert",
  "Organic Farming",  // New category
  "Climate & Weather", // New category
  "Marketplace" // New category
];

export default function CommunityForum() {
  const navigate = useNavigate();
  const API_URL = getApiBaseUrl();

  // Enhanced forum state with pagination and sorting
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // newest, popular, activity
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal and form state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [qTitle, setQTitle] = useState('');
  const [qMessage, setQMessage] = useState('');
  const [qCategory, setQCategory] = useState('');
  const [qExpert, setQExpert] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  
  // Reply state
  const [replyContents, setReplyContents] = useState({});
  const [replyErrors, setReplyErrors] = useState({});
  const [showReplyField, setShowReplyField] = useState({});
  
  // User management state
  const [currentUserId, setCurrentUserId] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [editingReply, setEditingReply] = useState(null);
  const [editPostData, setEditPostData] = useState({ title: '', content: '', category: '' });
  const [editReplyData, setEditReplyData] = useState({ content: '' });
  const [showMyComments, setShowMyComments] = useState(false);
  const [myComments, setMyComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  
  // State for my posts
  const [showMyPosts, setShowMyPosts] = useState(false);
  const [myPosts, setMyPosts] = useState([]);
  const [loadingMyPosts, setLoadingMyPosts] = useState(false);
  
  // State for tracking user votes on posts
  const [userVotes, setUserVotes] = useState({}); // {postId: 'upvote'|'downvote'|null}
  
  // Fetch posts with filtering and pagination
  useEffect(() => {
    fetchPosts();
    getCurrentUser();
    // eslint-disable-next-line
  }, [page, selectedCategory, sortBy, searchQuery]);

  const getCurrentUser = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      
      const response = await fetch(`${API_URL}/profile/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCurrentUserId(data.user?.id);
      }
    } catch (err) {
      
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams({
        page: page,
        per_page: 10 // Fixed page size
      });
      
      if (selectedCategory) params.append('category', selectedCategory);
      if (sortBy) params.append('sort_by', sortBy);
      if (searchQuery) params.append('search', searchQuery);
      
      const response = await fetch(`${API_URL}/forum/posts?${params.toString()}`);
      const data = await response.json();
      
      if (response.ok) {
        const postsData = data.posts || [];
        setPosts(postsData);
        setTotalPages(data.pagination?.pages || 1);
        
        // Fetch user vote statuses for the loaded posts
        const postIds = postsData.map(post => post.id);
        if (postIds.length > 0) {
          fetchUserVoteStatuses(postIds);
        }
      } else {
        setError(data.error || 'Failed to load posts');
      }
    } catch (err) {
      
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get reply text for specific post
  const getReplyText = (postId) => {
    return replyContents[postId] || '';
  };

  // Set reply text for specific post
  const setReplyText = (postId, text) => {
    setReplyContents({...replyContents, [postId]: text});
  };

  // Toggle reply field
  const toggleReplyField = (postId) => {
    // Find the post to check if user owns it
    const post = posts.find(p => p.id === postId);
    if (post && currentUserId && post.user_id === currentUserId) {
      alert('You cannot reply to your own post.');
      return;
    }
    
    setShowReplyField({
      ...showReplyField,
      [postId]: !showReplyField[postId]
    });
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Validate post form
  const validatePostForm = () => {
    const errors = {};
    
    if (!qTitle) {
      errors.title = "Title is required";
    } else if (qTitle.length < 5) {
      errors.title = "Title must be at least 5 characters";
    }
    
    if (!qCategory) {
      errors.category = "Category is required";
    }
    
    if (!qMessage) {
      errors.content = "Content is required";
    } else if (qMessage.length < 10) {
      errors.content = "Content must be at least 10 characters";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Validate reply
  const validateReply = (postId, text) => {
    if (!text) {
      setReplyErrors({...replyErrors, [postId]: "Reply cannot be empty"});
      return false;
    }
    
    if (text.length < 5) {
      setReplyErrors({...replyErrors, [postId]: "Reply must be at least 5 characters"});
      return false;
    }
    
    setReplyErrors({...replyErrors, [postId]: null});
    return true;
  };

  // Ask question handler with enhanced validation
  const handleAsk = async () => {
    if (!validatePostForm()) return;
    
    try {
      setSubmitting(true);
      const token = localStorage.getItem('access_token');
      if (!token) {
        alert('You must be logged in to post a question');
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_URL}/forum/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: qTitle,
          content: qMessage,
          category: qCategory,
          is_expert_question: qExpert
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Success - refresh posts
        setDialogOpen(false);
        setQTitle('');
        setQMessage('');
        setQCategory('');
        setQExpert(false);
        fetchPosts();
        
        // Add to beginning of posts list for immediate display
        if (data.post) {
          setPosts([data.post, ...posts]);
        }
      } else {
        setFormErrors({...formErrors, submit: data.error || 'Failed to post question'});
      }
    } catch (err) {
      
      setFormErrors({...formErrors, submit: 'Network error. Please try again.'});
    } finally {
      setSubmitting(false);
    }
  };
  
  // Submit reply handler
  const handleReply = async (postId) => {
    const replyText = getReplyText(postId);
    if (!validateReply(postId, replyText)) return;
    
    // Check if user is trying to reply to their own post
    const post = posts.find(p => p.id === postId);
    if (post && currentUserId && post.user_id === currentUserId) {
      setReplyErrors({...replyErrors, [postId]: 'You cannot reply to your own post.'});
      return;
    }
    
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        alert('You must be logged in to reply');
        navigate('/login');
        return;
      }
      
      const response = await fetch(`${API_URL}/forum/posts/${postId}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: replyText
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Success - update post with new reply
        setReplyText(postId, '');
        setShowReplyField({...showReplyField, [postId]: false});
        
        // Update post with new reply if returned
        if (data.reply) {
          const updatedPosts = posts.map(post => {
            if (post.id === postId) {
              return {
                ...post,
                replies: [...(post.replies || []), data.reply],
                reply_count: (post.reply_count || 0) + 1
              };
            }
            return post;
          });
          setPosts(updatedPosts);
        } else {
          // If no reply data returned, just refresh
          fetchPosts();
        }
      } else {
        setReplyErrors({...replyErrors, [postId]: data.error || 'Failed to post reply'});
      }
    } catch (err) {
      
      setReplyErrors({...replyErrors, [postId]: 'Network error. Please try again.'});
    }
  };
  
  // Vote on post
  const handleVote = async (postId, voteType) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        alert('You must be logged in to vote');
        navigate('/login');
        return;
      }
      
      const response = await fetch(`${API_URL}/forum/posts/${postId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ vote_type: voteType })
      });
      
      if (response.ok) {
        const result = await response.json();
        
        // Update posts with new vote counts
        const updatedPosts = posts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              upvotes: result.upvotes,
              downvotes: result.downvotes
            };
          }
          return post;
        });
        setPosts(updatedPosts);
        
        // Update user vote state
        setUserVotes(prev => ({
          ...prev,
          [postId]: result.user_vote
        }));
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to vote');
      }
    } catch (err) {
      
      alert('Network error. Please try again.');
    }
  };
  
  // Fetch user vote status for posts
  const fetchUserVoteStatuses = async (postIds) => {
    const token = localStorage.getItem('access_token');
    if (!token || postIds.length === 0) return;
    
    try {
      const votePromises = postIds.map(async (postId) => {
        const response = await fetch(`${API_URL}/forum/posts/${postId}/vote`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const result = await response.json();
          return { postId, userVote: result.user_vote };
        }
        return { postId, userVote: null };
      });
      
      const voteResults = await Promise.all(votePromises);
      const voteMap = {};
      voteResults.forEach(({ postId, userVote }) => {
        voteMap[postId] = userVote;
      });
      
      setUserVotes(voteMap);
    } catch (err) {
      
    }
  };
  
  // Get category color
  const getCategoryColor = (category) => {
    const colorMap = {
      "Crop Problems": "#dc2626",
      "Fertilizer & Pesticide": "#16a34a",
      "Irrigation": "#0284c7",
      "Machinery": "#7c3aed",
      "Best Practices": "#f59e0b",
      "Success Stories": "#059669",
      "Ask an Expert": "#0891b2",
      "Organic Farming": "#65a30d",
      "Climate & Weather": "#0ea5e9",
      "Marketplace": "#db2777",
    };
    
    return colorMap[category] || "#6b7280";
  };
  
  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      setPage(1); // Reset to first page on new search
      setSearchQuery(e.target.value);
    }
  };
  
  // Reset search
  const clearSearch = () => {
    setSearchQuery('');
    setPage(1);
  };

  // Edit post functions
  const startEditPost = (post) => {
    setEditingPost(post.id);
    setEditPostData({
      title: post.title,
      content: post.content,
      category: post.category
    });
  };

  const cancelEditPost = () => {
    setEditingPost(null);
    setEditPostData({ title: '', content: '', category: '' });
  };

  const saveEditPost = async (postId) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        alert('You must be logged in to edit posts');
        return;
      }

      const response = await fetch(`${API_URL}/forum/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editPostData)
      });

      const data = await response.json();

      if (response.ok) {
        // Update the post in the local state
        setPosts(posts.map(post => 
          post.id === postId ? { ...post, ...editPostData, edited_at: new Date().toISOString(), edit_count: (post.edit_count || 0) + 1 } : post
        ));
        setEditingPost(null);
        setEditPostData({ title: '', content: '', category: '' });
      } else {
        alert(data.error || 'Failed to edit post');
      }
    } catch (err) {
      alert('Network error. Please try again.');
    }
  };

  const deletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post? This will also delete ALL replies to this post!')) {
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        alert('You must be logged in to delete posts');
        return;
      }

      const response = await fetch(`${API_URL}/forum/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Remove the post from local state
        setPosts(posts.filter(post => post.id !== postId));
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete post');
      }
    } catch (err) {
      alert('Network error. Please try again.');
    }
  };

  // Edit reply functions
  const startEditReply = (reply) => {
    setEditingReply(reply.id);
    setEditReplyData({ content: reply.content });
  };

  const cancelEditReply = () => {
    setEditingReply(null);
    setEditReplyData({ content: '' });
  };

  const saveEditReply = async (replyId) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        alert('You must be logged in to edit replies');
        return;
      }

      const response = await fetch(`${API_URL}/forum/replies/${replyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editReplyData)
      });

      const data = await response.json();

      if (response.ok) {
        // Update the reply in the local state
        setPosts(posts.map(post => ({
          ...post,
          replies: post.replies?.map(reply => 
            reply.id === replyId 
              ? { ...reply, content: editReplyData.content, edited_at: new Date().toISOString(), edit_count: (reply.edit_count || 0) + 1 }
              : reply
          )
        })));
        setEditingReply(null);
        setEditReplyData({ content: '' });
      } else {
        alert(data.error || 'Failed to edit reply');
      }
    } catch (err) {
      alert('Network error. Please try again.');
    }
  };

  const deleteReply = async (replyId) => {
    if (!window.confirm('Are you sure you want to delete this reply?')) {
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        alert('You must be logged in to delete replies');
        return;
      }

      const response = await fetch(`${API_URL}/forum/replies/${replyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Remove the reply from local state and update reply count
        setPosts(posts.map(post => ({
          ...post,
          replies: post.replies?.filter(reply => reply.id !== replyId),
          reply_count: Math.max(0, (post.reply_count || 0) - 1)
        })));
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete reply');
      }
    } catch (err) {
      alert('Network error. Please try again.');
    }
  };

  // My Comments functionality
  const fetchMyComments = async () => {
    try {
      setLoadingComments(true);
      const token = localStorage.getItem('access_token');
      if (!token) {
        alert('You must be logged in to view your comments');
        return;
      }

      const response = await fetch(`${API_URL}/forum/my-comments`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setMyComments(data.comments || []);
        setShowMyComments(true);
      } else {
        alert(data.error || 'Failed to load your comments');
      }
    } catch (err) {
      alert('Network error. Please try again.');
    } finally {
      setLoadingComments(false);
    }
  };

  // My Posts functionality
  const fetchMyPosts = async () => {
    try {
      setLoadingMyPosts(true);
      const token = localStorage.getItem('access_token');
      if (!token) {
        alert('You must be logged in to view your posts');
        return;
      }

      const response = await fetch(`${API_URL}/forum/my-posts`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setMyPosts(data.posts || []);
        setShowMyPosts(true);
      } else {
        alert(data.error || 'Failed to load your posts');
      }
    } catch (err) {
      alert('Network error. Please try again.');
    } finally {
      setLoadingMyPosts(false);
    }
  };

  return (
    <Layout isLoggedIn={true}>
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg,#f0fdf4 0%,#f0f9ff 100%)',
          padding: { xs: 1, sm: 2, md: 3 },
          minHeight: '100vh',
          // Green scrollbar styling
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#4ade80',
            borderRadius: '4px',
            '&:hover': {
              background: '#22c55e',
            },
          },
        }}
      >
        {/* Content Container */}
        <Box 
          maxWidth="xl" 
          mx="auto"
          sx={{
            // Global green scrollbar styling for all child elements
            '& *::-webkit-scrollbar': {
              width: '8px',
            },
            '& *::-webkit-scrollbar-track': {
              background: '#f1f1f1',
              borderRadius: '4px',
            },
            '& *::-webkit-scrollbar-thumb': {
              background: '#4ade80',
              borderRadius: '4px',
              '&:hover': {
                background: '#22c55e',
              },
            },
          }}
        >
          {/* Page Header */}
          <Box mb={4}>
            <Typography variant="h4" fontWeight="bold" mb={1}>Community Forum</Typography>
            <Typography color="text.secondary">
              Connect with fellow farmers, share knowledge, and get answers to your farming questions
            </Typography>
          </Box>
          
          {/* Search & Filters */}
          <Box 
            mb={3}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}
          >
            {/* Top Row: Search bar & Category filter */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
                alignItems: { xs: 'stretch', sm: 'center' }
              }}
            >
              {/* Search Box */}
              <TextField
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleSearch}
                fullWidth
                variant="outlined"
                size="small"
                autoComplete="search"
                sx={{
                  bgcolor: '#ffffff',
                  borderRadius: 1,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={18} color="#6b7280" />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery ? (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={clearSearch}>
                        <X size={16} />
                      </IconButton>
                    </InputAdornment>
                  ) : null
                }}
              />
              
              {/* Category Filter */}
              <FormControl 
                variant="outlined" 
                size="small"
                sx={{ 
                  minWidth: { xs: '100%', sm: 180 },
                  bgcolor: '#ffffff',
                  borderRadius: 1
                }}
              >
                <Select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setPage(1); // Reset to page 1 on filter change
                  }}
                  displayEmpty
                  sx={{ borderRadius: 1 }}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {CATEGORIES.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            
            {/* Bottom Row: Action Buttons in 2x2 Grid for Mobile */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { 
                  xs: 'repeat(2, 1fr)', // 2 columns on mobile
                  sm: 'repeat(4, 1fr)'  // 4 columns on larger screens
                },
                gap: 2,
                alignItems: 'center'
              }}
            >
              {/* Sort Dropdown */}
              <FormControl 
                variant="outlined" 
                size="small" 
                sx={{ 
                  bgcolor: '#ffffff',
                  borderRadius: 1
                }}
              >
                <Select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setPage(1); // Reset to page 1 on sort change
                  }}
                  startAdornment={<SortDesc size={16} style={{marginRight: 8}} />}
                  sx={{ borderRadius: 1 }}
                >
                  <MenuItem value="newest">Newest</MenuItem>
                  <MenuItem value="popular">Popular</MenuItem>
                  <MenuItem value="activity">Recent Activity</MenuItem>
                </Select>
              </FormControl>
              
              {/* Ask Question Button */}
              <Button
                variant="contained"
                color="primary"
                startIcon={<Plus size={18} />}
                onClick={() => setDialogOpen(true)}
                sx={{
                  bgcolor: '#16a34a',
                  '&:hover': {
                    bgcolor: '#15803d'
                  },
                  fontWeight: 600,
                  borderRadius: 1,
                  whiteSpace: 'nowrap'
                }}
              >
                Ask Question
              </Button>
              
              {/* My Comments Button */}
              <Button
                variant="outlined"
                startIcon={<MessageCircle size={18} />}
                onClick={fetchMyComments}
                disabled={loadingComments}
                sx={{
                  borderColor: '#16a34a',
                  color: '#16a34a',
                  '&:hover': {
                    borderColor: '#15803d',
                    color: '#15803d',
                    bgcolor: 'rgba(22, 163, 74, 0.04)'
                  },
                  fontWeight: 600,
                  borderRadius: 1,
                  whiteSpace: 'nowrap'
                }}
              >
                {loadingComments ? 'Loading...' : 'My Comments'}
              </Button>
              
              {/* My Posts Button */}
              <Button
                variant="outlined"
                startIcon={<FileText size={18} />}
                onClick={fetchMyPosts}
                disabled={loadingMyPosts}
                sx={{
                  borderColor: '#16a34a',
                  color: '#16a34a',
                  '&:hover': {
                    borderColor: '#15803d',
                    color: '#15803d',
                    bgcolor: 'rgba(22, 163, 74, 0.04)'
                  },
                  fontWeight: 600,
                  borderRadius: 1,
                  whiteSpace: 'nowrap'
                }}
              >
                {loadingMyPosts ? 'Loading...' : 'My Posts'}
              </Button>
            </Box>
          </Box>
          
          {/* Posts List */}
          {loading ? (
            <Card elevation={2} sx={{ borderRadius: 3, p: 3, textAlign: 'center', mb: 3 }}>
              <CircularProgress size={40} sx={{ color: '#16a34a' }} />
              <Typography mt={2}>Loading posts...</Typography>
            </Card>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
          ) : posts.length === 0 ? (
            <Card elevation={2} sx={{ borderRadius: 3, p: 4, textAlign: 'center', mb: 3 }}>
              <Typography variant="h6" color="text.secondary">No posts found</Typography>
              <Typography color="text.secondary" mt={1}>
                {searchQuery 
                  ? 'Try a different search term or clear filters'
                  : 'Be the first to ask a question!'}
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<Plus size={18} />}
                onClick={() => setDialogOpen(true)}
                sx={{
                  mt: 3,
                  bgcolor: '#16a34a',
                  '&:hover': { bgcolor: '#15803d' }
                }}
              >
                Ask a Question
              </Button>
            </Card>
          ) : (
            <Box 
              sx={{
                height: { xs: '60vh', sm: '65vh', md: '70vh' }, // Fixed height for scrolling
                overflowY: 'auto',
                overflowX: 'hidden',
                p: 2, // Padding inside the container
                mb: 2, // Margin bottom for pagination
                border: '1px solid #e5e7eb',
                borderRadius: 2,
                backgroundColor: '#fafafa',
                '&::-webkit-scrollbar': {
                  width: '8px'
                },
                '&::-webkit-scrollbar-track': {
                  background: '#f1f1f1',
                  borderRadius: '4px'
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#4ade80',
                  borderRadius: '4px',
                  '&:hover': {
                    background: '#22c55e',
                  },
                },
              }}
            >
              {posts.map((post) => (
                <Card 
                  key={post.id} 
                  elevation={2} 
                  sx={{
                    borderRadius: 2,
                    mb: 2,
                    overflow: 'visible',
                    position: 'relative',
                    backgroundColor: 'white'
                  }}
                >
                  {post.is_expert_question && (
                    <Chip
                      label="Expert Help"
                      color="secondary"
                      size="small"
                      sx={{ 
                        position: 'absolute', 
                        top: -10, 
                        right: 20,
                        fontWeight: 'bold',
                        bgcolor: '#f59e0b',
                        color: 'white'
                      }}
                    />
                  )}
                  
                  <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    {/* Post Header */}
                    <Box 
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: { xs: 2, sm: 0 }
                      }}
                    >
                      {/* Title and Category */}
                      <Box>
                        <Typography 
                          variant="h6" 
                          fontWeight="bold" 
                          sx={{ wordBreak: 'break-word' }}
                        >
                          {post.title}
                        </Typography>
                        
                        <Box mt={1} display="flex" alignItems="center" gap={2}>
                          <Chip 
                            label={post.category}
                            size="small"
                            sx={{
                              bgcolor: getCategoryColor(post.category),
                              color: 'white',
                              fontWeight: 600
                            }}
                          />
                          
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(post.created_at)}
                          </Typography>
                        </Box>
                      </Box>
                      
                      {/* Post Stats */}
                      <Box 
                        sx={{
                          display: 'flex',
                          gap: 3,
                          alignItems: 'center'
                        }}
                      >
                        {/* Views Count */}
                        <Tooltip title="Views">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Eye size={16} color="#6b7280" />
                            <Typography variant="body2" color="text.secondary">
                              {post.views || 0}
                            </Typography>
                          </Box>
                        </Tooltip>
                        
                        {/* Reply Count */}
                        <Tooltip title="Replies">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <MessageCircle size={16} color="#6b7280" />
                            <Typography variant="body2" color="text.secondary">
                              {post.reply_count || 0}
                            </Typography>
                          </Box>
                        </Tooltip>
                        
                        {/* Voting */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {/* Upvote Button */}
                          <Button 
                            onClick={() => handleVote(post.id, 'upvote')}
                            startIcon={<ThumbsUp size={16} />}
                            color={userVotes[post.id] === 'upvote' ? "primary" : "inherit"}
                            size="small"
                            sx={{ 
                              minWidth: 'auto',
                              color: userVotes[post.id] === 'upvote' ? '#16a34a' : '#6b7280',
                              '&:hover': {
                                color: '#16a34a',
                                bgcolor: 'rgba(22, 163, 74, 0.04)'
                              }
                            }}
                          >
                            <Typography 
                              variant="body2" 
                              color={userVotes[post.id] === 'upvote' ? "#16a34a" : "text.secondary"}
                              fontWeight={userVotes[post.id] === 'upvote' ? "bold" : "regular"}
                            >
                              {post.upvotes || 0}
                            </Typography>
                          </Button>
                          
                          {/* Downvote Button */}
                          <Button 
                            onClick={() => handleVote(post.id, 'downvote')}
                            startIcon={<ThumbsDown size={16} />}
                            color={userVotes[post.id] === 'downvote' ? "error" : "inherit"}
                            size="small"
                            sx={{ 
                              minWidth: 'auto',
                              color: userVotes[post.id] === 'downvote' ? '#dc2626' : '#6b7280',
                              '&:hover': {
                                color: '#dc2626',
                                bgcolor: 'rgba(220, 38, 38, 0.04)'
                              }
                            }}
                          >
                            <Typography 
                              variant="body2" 
                              color={userVotes[post.id] === 'downvote' ? "#dc2626" : "text.secondary"}
                              fontWeight={userVotes[post.id] === 'downvote' ? "bold" : "regular"}
                            >
                              {post.downvotes || 0}
                            </Typography>
                          </Button>
                        </Box>
                      </Box>
                    </Box>
                    
                    {/* Post Content or Edit Form */}
                    <Box mt={2}>
                      {editingPost === post.id ? (
                        // Edit Form
                        <Box sx={{ bgcolor: '#f9fafb', p: 2, borderRadius: 1 }}>
                          <TextField
                            fullWidth
                            label="Title"
                            value={editPostData.title}
                            onChange={(e) => setEditPostData({...editPostData, title: e.target.value})}
                            sx={{ mb: 2 }}
                          />
                          <TextField
                            fullWidth
                            multiline
                            rows={4}
                            label="Content"
                            value={editPostData.content}
                            onChange={(e) => setEditPostData({...editPostData, content: e.target.value})}
                            sx={{ mb: 2 }}
                          />
                          <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Category</InputLabel>
                            <Select
                              value={editPostData.category}
                              label="Category"
                              onChange={(e) => setEditPostData({...editPostData, category: e.target.value})}
                            >
                              {CATEGORIES.map((category) => (
                                <MenuItem key={category} value={category}>
                                  {category}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          <Box display="flex" gap={1}>
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => saveEditPost(post.id)}
                              sx={{ bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' } }}
                            >
                              Save
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={cancelEditPost}
                              sx={{ color: '#6b7280', borderColor: '#6b7280' }}
                            >
                              Cancel
                            </Button>
                          </Box>
                        </Box>
                      ) : (
                        // Normal Content Display
                        <>
                          <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
                            {post.content}
                          </Typography>
                          {post.edited_at && (
                            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', mt: 1, display: 'block' }}>
                              Edited {post.edit_count || 1} time{(post.edit_count || 1) !== 1 ? 's' : ''} • Last edited {new Date(post.edited_at).toLocaleDateString()}
                            </Typography>
                          )}
                        </>
                      )}
                    </Box>
                    
                    {/* Post Author */}
                    <Box 
                      mt={2} 
                      display="flex" 
                      alignItems="center" 
                      justifyContent="space-between"
                    >
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar 
                          src={post.user_avatar}
                          sx={{ 
                            width: 28, 
                            height: 28,
                            bgcolor: '#16a34a' 
                          }}
                        >
                          {post.username ? post.username.charAt(0) : 'U'}
                        </Avatar>
                        <Typography variant="body2" color="text.secondary">
                          {post.username || 'Anonymous'}
                          {post.is_expert && (
                            <Chip 
                              size="small" 
                              label="Expert" 
                              sx={{ 
                                ml: 1, 
                                height: 20, 
                                fontSize: '0.6rem',
                                bgcolor: '#16a34a',
                                color: 'white'
                              }}
                            />
                          )}
                        </Typography>
                      </Box>
                      
                      {/* Action Buttons */}
                      <Box display="flex" alignItems="center" gap={1}>
                        {/* Edit/Delete buttons for post owner */}
                        {currentUserId && post.user_id === currentUserId && (
                          <>
                            <IconButton
                              size="small"
                              onClick={() => startEditPost(post)}
                              sx={{ color: '#6b7280' }}
                            >
                              <Edit size={16} />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => deletePost(post.id)}
                              sx={{ color: '#dc2626' }}
                            >
                              <Trash2 size={16} />
                            </IconButton>
                          </>
                        )}
                        
                        {/* Reply Button */}
                        <Button
                          size="small"
                          startIcon={<MessageCircle size={16} />}
                          onClick={() => toggleReplyField(post.id)}
                          disabled={currentUserId && post.user_id === currentUserId}
                          sx={{
                            color: currentUserId && post.user_id === currentUserId ? '#9ca3af' : '#16a34a',
                            textTransform: 'none',
                            '&.Mui-disabled': {
                              color: '#9ca3af'
                            }
                          }}
                          title={currentUserId && post.user_id === currentUserId ? "You cannot reply to your own post" : "Reply to this post"}
                        >
                          Reply
                        </Button>
                      </Box>
                    </Box>
                    
                    {/* Reply Form */}
                    <Collapse in={showReplyField[post.id]} timeout="auto">
                      <Box mt={3}>
                        <TextField
                          multiline
                          rows={3}
                          variant="outlined"
                          fullWidth
                          placeholder="Write your reply..."
                          value={getReplyText(post.id)}
                          onChange={(e) => setReplyText(post.id, e.target.value)}
                          error={!!replyErrors[post.id]}
                          helperText={replyErrors[post.id]}
                          sx={{
                            bgcolor: '#f9fafb',
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 1
                            }
                          }}
                        />
                        
                        <Box mt={1} display="flex" justifyContent="flex-end" gap={1}>
                          <Button 
                            size="small"
                            onClick={() => {
                              setShowReplyField({...showReplyField, [post.id]: false});
                              setReplyText(post.id, '');
                            }}
                            sx={{ color: '#6b7280' }}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<Send size={14} />}
                            onClick={() => handleReply(post.id)}
                            sx={{
                              bgcolor: '#16a34a',
                              '&:hover': { bgcolor: '#15803d' }
                            }}
                          >
                            Post Reply
                          </Button>
                        </Box>
                      </Box>
                    </Collapse>
                    
                    {/* Show Replies if any */}
                    {post.replies && post.replies.length > 0 && (
                      <Box mt={3}>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle2" fontWeight="bold" mb={2}>
                          Replies ({post.replies.length})
                        </Typography>
                        
                        {post.replies.map((reply, index) => (
                          <Box 
                            key={reply.id || index} 
                            mb={2} 
                            sx={{
                              ml: 1,
                              pl: 2,
                              borderLeft: '2px solid #e5e7eb'
                            }}
                          >
                            {/* Reply content or edit form */}
                            {editingReply === reply.id ? (
                              // Edit Form for Reply
                              <Box sx={{ bgcolor: '#f3f4f6', p: 2, borderRadius: 1, mb: 2 }}>
                                <TextField
                                  fullWidth
                                  multiline
                                  rows={3}
                                  value={editReplyData.content}
                                  onChange={(e) => setEditReplyData({content: e.target.value})}
                                  sx={{ mb: 2 }}
                                />
                                <Box display="flex" gap={1}>
                                  <Button
                                    variant="contained"
                                    size="small"
                                    onClick={() => saveEditReply(reply.id)}
                                    sx={{ bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' } }}
                                  >
                                    Save
                                  </Button>
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={cancelEditReply}
                                    sx={{ color: '#6b7280', borderColor: '#6b7280' }}
                                  >
                                    Cancel
                                  </Button>
                                </Box>
                              </Box>
                            ) : (
                              <>
                                <Typography variant="body2">
                                  {reply.content}
                                </Typography>
                                {reply.edited_at && (
                                  <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', mt: 0.5, display: 'block' }}>
                                    Edited {reply.edit_count || 1} time{(reply.edit_count || 1) !== 1 ? 's' : ''}
                                  </Typography>
                                )}
                              </>
                            )}
                            
                            {/* Reply author, date & actions */}
                            <Box mt={1} display="flex" alignItems="center" justifyContent="space-between">
                              <Box display="flex" alignItems="center" gap={1}>
                                <Avatar
                                  src={reply.user_avatar}
                                  sx={{
                                    width: 24,
                                    height: 24,
                                    bgcolor: '#65a30d'
                                  }}
                                >
                                  {reply.username ? reply.username.charAt(0) : 'U'}
                                </Avatar>
                                <Typography variant="caption" color="text.secondary">
                                  {reply.username || 'Anonymous'}
                                  {reply.is_expert && (
                                    <Chip 
                                      size="small" 
                                      label="Expert" 
                                      sx={{ 
                                        ml: 1, 
                                        height: 18, 
                                        fontSize: '0.6rem',
                                        bgcolor: '#16a34a',
                                        color: 'white'
                                      }}
                                    />
                                  )}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  • {formatDate(reply.created_at)}
                                </Typography>
                              </Box>
                              
                              {/* Edit/Delete buttons for reply owner */}
                              {currentUserId && reply.user_id === currentUserId && (
                                <Box display="flex" gap={0.5}>
                                  <IconButton
                                    size="small"
                                    onClick={() => startEditReply(reply)}
                                    sx={{ color: '#6b7280', padding: '2px' }}
                                  >
                                    <Edit size={14} />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={() => deleteReply(reply.id)}
                                    sx={{ color: '#dc2626', padding: '2px' }}
                                  >
                                    <Trash2 size={14} />
                                  </IconButton>
                                </Box>
                              )}
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
          
          {/* Pagination - Outside the scrollable container but still conditional */}
          {!loading && !error && posts.length > 0 && totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={2}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, newPage) => setPage(newPage)}
                color="primary"
                shape="rounded"
              />
            </Box>
          )}
        </Box>
        
        {/* Ask Question Dialog */}
        <Dialog 
          open={dialogOpen} 
          onClose={() => setDialogOpen(false)}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: {
              borderRadius: 3
            }
          }}
        >
          <DialogTitle sx={{ fontWeight: 'bold' }}>
            Ask a Question
          </DialogTitle>
          
          <DialogContent>
            {formErrors.submit && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {formErrors.submit}
              </Alert>
            )}
            
            <TextField
              label="Title"
              fullWidth
              variant="outlined"
              margin="normal"
              value={qTitle}
              onChange={(e) => setQTitle(e.target.value)}
              error={!!formErrors.title}
              helperText={formErrors.title}
              placeholder="e.g. How to prevent tomato leaf curl?"
              autoComplete="off"
            />
            
            <FormControl fullWidth margin="normal" error={!!formErrors.category}>
              <InputLabel>Category</InputLabel>
              <Select
                value={qCategory}
                onChange={(e) => setQCategory(e.target.value)}
                label="Category"
              >
                {CATEGORIES.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
              {formErrors.category && (
                <Typography color="error" variant="caption">
                  {formErrors.category}
                </Typography>
              )}
            </FormControl>
            
            <TextField
              label="Your Question"
              fullWidth
              variant="outlined"
              margin="normal"
              multiline
              rows={5}
              value={qMessage}
              onChange={(e) => setQMessage(e.target.value)}
              error={!!formErrors.content}
              helperText={formErrors.content}
              autoComplete="off"
              placeholder="Describe your question in detail. Include information like plant type, symptoms, growing conditions, etc."
            />
            
            <FormControl fullWidth margin="normal">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={qExpert}
                    onChange={(e) => setQExpert(e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2">
                      Request Expert Assistance
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Your question will be highlighted for our agricultural experts to answer
                    </Typography>
                  </Box>
                }
              />
            </FormControl>
          </DialogContent>
          
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button 
              onClick={() => setDialogOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAsk}
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={20} /> : <Send size={16} />}
              sx={{
                bgcolor: '#16a34a',
                '&:hover': { bgcolor: '#15803d' }
              }}
            >
              {submitting ? 'Posting...' : 'Post Question'}
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* My Comments Dialog */}
        <Dialog
          open={showMyComments}
          onClose={() => setShowMyComments(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="h6">My Comments</Typography>
              <IconButton onClick={() => setShowMyComments(false)}>
                <X size={20} />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            {loadingComments ? (
              <Box textAlign="center" py={3}>
                <CircularProgress size={40} sx={{ color: '#16a34a' }} />
                <Typography mt={2}>Loading your comments...</Typography>
              </Box>
            ) : myComments.length === 0 ? (
              <Box textAlign="center" py={3}>
                <Typography color="text.secondary">No comments found</Typography>
              </Box>
            ) : (
              <Box>
                {myComments.map((comment) => (
                  <Card key={comment.id} sx={{ mb: 2, borderRadius: 2 }}>
                    <CardContent>
                      <Box mb={1}>
                        <Typography variant="body2" color="primary" fontWeight="bold">
                          {comment.post_title}
                        </Typography>
                        <Chip 
                          size="small" 
                          label={comment.post_category} 
                          sx={{ 
                            ml: 1, 
                            bgcolor: getCategoryColor(comment.post_category) + '20',
                            color: getCategoryColor(comment.post_category)
                          }} 
                        />
                      </Box>
                      
                      {/* Comment content or edit form */}
                      {editingReply === comment.id ? (
                        <Box sx={{ bgcolor: '#f3f4f6', p: 2, borderRadius: 1, mb: 2 }}>
                          <TextField
                            fullWidth
                            multiline
                            rows={3}
                            value={editReplyData.content}
                            onChange={(e) => setEditReplyData({content: e.target.value})}
                            sx={{ mb: 2 }}
                          />
                          <Box display="flex" gap={1}>
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => saveEditReply(comment.id)}
                              sx={{ bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' } }}
                            >
                              Save
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={cancelEditReply}
                              sx={{ color: '#6b7280', borderColor: '#6b7280' }}
                            >
                              Cancel
                            </Button>
                          </Box>
                        </Box>
                      ) : (
                        <Typography variant="body2" sx={{ mb: 2 }}>
                          {comment.content}
                        </Typography>
                      )}
                      
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" color="text.secondary">
                          Posted {formatDate(comment.created_at)}
                          {comment.edited_at && ` • Edited ${comment.edit_count || 1} time${(comment.edit_count || 1) !== 1 ? 's' : ''}`}
                        </Typography>
                        
                        <Box display="flex" gap={1}>
                          <Button
                            size="small"
                            startIcon={<Edit size={14} />}
                            onClick={() => startEditReply(comment)}
                            sx={{ color: '#6b7280' }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="small"
                            startIcon={<Trash2 size={14} />}
                            onClick={() => deleteReply(comment.id)}
                            sx={{ color: '#dc2626' }}
                          >
                            Delete
                          </Button>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </DialogContent>
        </Dialog>
        
        {/* My Posts Dialog */}
        <Dialog
          open={showMyPosts}
          onClose={() => setShowMyPosts(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="h6">My Posts</Typography>
              <IconButton onClick={() => setShowMyPosts(false)}>
                <X size={20} />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            {loadingMyPosts ? (
              <Box textAlign="center" py={3}>
                <CircularProgress size={40} sx={{ color: '#16a34a' }} />
                <Typography mt={2}>Loading your posts...</Typography>
              </Box>
            ) : myPosts.length === 0 ? (
              <Box textAlign="center" py={3}>
                <Typography color="text.secondary">No posts found</Typography>
              </Box>
            ) : (
              <Box>
                {myPosts.map((post) => (
                  <Card key={post.id} sx={{ mb: 2, borderRadius: 2 }}>
                    <CardContent>
                      {/* Post content or edit form */}
                      {editingPost === post.id ? (
                        <Box sx={{ bgcolor: '#f3f4f6', p: 2, borderRadius: 1, mb: 2 }}>
                          <TextField
                            fullWidth
                            label="Title"
                            value={editPostData.title}
                            onChange={(e) => setEditPostData({...editPostData, title: e.target.value})}
                            sx={{ mb: 2 }}
                          />
                          <TextField
                            fullWidth
                            multiline
                            rows={4}
                            label="Content"
                            value={editPostData.content}
                            onChange={(e) => setEditPostData({...editPostData, content: e.target.value})}
                            sx={{ mb: 2 }}
                          />
                          <Box display="flex" gap={1}>
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => saveEditPost(post.id)}
                              sx={{ bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' } }}
                            >
                              Save
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={cancelEditPost}
                              sx={{ color: '#6b7280', borderColor: '#6b7280' }}
                            >
                              Cancel
                            </Button>
                          </Box>
                        </Box>
                      ) : (
                        <Box>
                          <Typography variant="h6" sx={{ mb: 1 }}>
                            {post.title}
                          </Typography>
                          <Chip 
                            size="small" 
                            label={post.category} 
                            sx={{ 
                              mb: 2,
                              bgcolor: getCategoryColor(post.category) + '20',
                              color: getCategoryColor(post.category)
                            }} 
                          />
                          <Typography variant="body2" sx={{ mb: 2 }}>
                            {post.content}
                          </Typography>
                        </Box>
                      )}
                      
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Posted {formatDate(post.created_at)}
                            {post.edited_at && ` • Edited ${post.edit_count || 1} time${(post.edit_count || 1) !== 1 ? 's' : ''}`}
                          </Typography>
                          <Box display="flex" alignItems="center" gap={2} mt={1}>
                            <Typography variant="caption" color="text.secondary">
                              <ThumbsUp size={12} style={{marginRight: 4}} />
                              {post.upvotes || 0} upvotes
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              <MessageCircle size={12} style={{marginRight: 4}} />
                              {post.reply_count || 0} replies
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Box display="flex" gap={1}>
                          <Button
                            size="small"
                            startIcon={<Edit size={14} />}
                            onClick={() => startEditPost(post)}
                            sx={{ color: '#6b7280' }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="small"
                            startIcon={<Trash2 size={14} />}
                            onClick={() => deletePost(post.id)}
                            sx={{ color: '#dc2626' }}
                          >
                            Delete
                          </Button>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </DialogContent>
        </Dialog>
      </Box>
    </Layout>
  );
}
