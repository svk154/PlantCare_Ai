import { useState, useEffect, useCallback } from 'react';
import {
  Button, Box, Typography, Card, CardContent, TextField, InputAdornment,
  MenuItem, Select, FormControl, InputLabel, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton, Alert
} from '@mui/material';
import { Plus, Trash2, Edit, Check, X, Calculator } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { cacheInvalidate } from '../utils/cache';
import { isAuthenticated } from '../utils/auth';
import { useLanguage } from '../utils/languageContext';

const categories = [
  'Seeds', 'Fertilizer', 'Pesticide', 'Labor', 'Irrigation',
  'Machinery', 'Fuel', 'Transport', 'Crop Protection', 'Other'
];

export default function FarmLedger() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  // API base URL from environment or default

  // API base URL from environment or default
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Individual entry state
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Expense log state
  const [expenses, setExpenses] = useState([]);

  // Memoize fetch function to avoid unnecessary re-renders
  const fetchTransactions = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/profile/transactions?all=true`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        setExpenses(data.transactions || []);
        setError('');
      } else {
        // We don't need the error data details here, just set a generic error message
        // const errorData = await response.json();
        
        setError('Failed to load farm ledger entries. Please try again.');
      }
    } catch (err) {
      
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [API_URL, navigate, setError, setExpenses, setLoading]); // Include all external dependencies

  // Fetch transactions on mount
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]); // Now we can safely depend on fetchTransactions

  const [editingId, setEditingId] = useState(null);
  const [editVals, setEditVals] = useState({});

  // Add expense
  const handleAdd = async () => {
    setError('');
    setLoading(true);

    // Validate inputs
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      setError('Enter a valid positive amount');
      setLoading(false);
      return;
    }
    if (!category) {
      setError('Choose a category');
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('You must be logged in to add entries');
      navigate('/login');
      return;
    }

    // Transaction body
    const txnBody = {
      amount: Number(amount),
      category,
      note,
      transaction_date: date, // Use proper API field name
      transaction_type: 'expense'
    };

    try {
      
      
      
      // Add the transaction to the API
      const res = await fetch(`${API_URL}/api/profile/transactions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(txnBody)
      });
      
      if (res.ok) {
        // Parse response but we don't need to use the data here since we're refreshing expenses
        await res.json();
        
        
        // Reset form
        setAmount('');
        setCategory('');
        setNote('');
        setDate(new Date().toISOString().slice(0, 10));
        
        // Invalidate cache for transactions and refresh
        try { cacheInvalidate((k) => k.includes('/api/profile/transactions')); } catch (_) {}
        fetchTransactions();
      } else {
        const errorData = await res.json();
        
        setError(errorData.message || 'Failed to add entry. Please try again.');
      }
    } catch (err) {
      
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Start editing
  const handleEdit = (expense) => {
    setEditingId(expense.id);
    setEditVals({
      amount: expense.amount,
      category: expense.category,
      note: expense.note,
      date: expense.transaction_date ? expense.transaction_date.split('T')[0] : new Date().toISOString().slice(0, 10)
    });
  };

  // Save edit
  const handleSaveEdit = async (id) => {
    setLoading(true);
    setError('');

    // Validate inputs
    if (!editVals.amount || isNaN(editVals.amount) || Number(editVals.amount) <= 0) {
      setError('Enter a valid positive amount');
      setLoading(false);
      return;
    }
    if (!editVals.category) {
      setError('Choose a category');
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('You must be logged in to edit entries');
      navigate('/login');
      return;
    }

    // Transaction body for update
    const txnBody = {
      amount: Number(editVals.amount),
      category: editVals.category,
      note: editVals.note,
      transaction_date: editVals.date,
      transaction_type: 'expense' // Maintain the type
    };

    try {
      // Update the transaction in the API
      const res = await fetch(`${API_URL}/api/profile/transactions/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(txnBody)
      });
      
      if (res.ok) {
        
        setEditingId(null);
        setEditVals({});
        
        // Invalidate cache for transactions and refresh
        try { cacheInvalidate((k) => k.includes('/api/profile/transactions')); } catch (_) {}
        fetchTransactions();
      } else {
        const errorData = await res.json();
        
        setError(errorData.message || 'Failed to update entry. Please try again.');
      }
    } catch (err) {
      
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditVals({});
    setError('');
  };

  // Delete transaction
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this farm ledger entry?')) {
      return;
    }

    setLoading(true);
    setError('');

    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('You must be logged in to delete entries');
      navigate('/login');
      return;
    }

    try {
      // Delete the transaction from the API
      const res = await fetch(`${API_URL}/api/profile/transactions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (res.ok) {
        
        
        // Invalidate cache for transactions and refresh
        try { cacheInvalidate((k) => k.includes('/api/profile/transactions')); } catch (_) {}
        fetchTransactions();
      } else {
        const errorData = await res.json();
        
        setError(errorData.message || 'Failed to delete entry. Please try again.');
      }
    } catch (err) {
      
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Sort expenses by date (newest first)
  const sortedExpenses = [...expenses].sort((a, b) => {
    return new Date(b.transaction_date || b.date) - new Date(a.transaction_date || a.date);
  });

  // Calculate total expenses
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  // Store total expense in localStorage for use in profit calculator
  useEffect(() => {
    if (totalExpenses > 0) {
      localStorage.setItem("plantcare_latestTotalExpense", totalExpenses.toString());
    }
  }, [totalExpenses]);

  const isLoggedIn = isAuthenticated();

  return (
    <Layout isLoggedIn={isLoggedIn}>
      <Box sx={{ minHeight: '100vh', backgroundColor: '#f7f9fb', pt: 2 }}>

      {/* Main Content */}
      <Box sx={{ maxWidth: 900, mx: 'auto', p: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
          {t('farmFinancialLedger')}
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Add New Entry Form */}
        <Card sx={{ mb: 4, boxShadow: 2, borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              {t('addNewEntry')}
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <TextField
                  label={t('amount')}
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                  sx={{ flex: 1, minWidth: '180px' }}
                  disabled={loading}
                />
                
                <FormControl sx={{ flex: 1, minWidth: '180px' }}>
                  <InputLabel>{t('category')}</InputLabel>
                  <Select
                    value={category}
                    label={t('category')}
                    onChange={(e) => setCategory(e.target.value)}
                    disabled={loading}
                  >
                    {categories.map((cat) => (
                      <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <TextField
                  label={t('date')}
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  sx={{ flex: 1, minWidth: '180px' }}
                  InputLabelProps={{ shrink: true }}
                  disabled={loading}
                />
              </Box>
              
              <TextField
                label={t('note')}
                multiline
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t('optionalDetails')}
                disabled={loading}
              />
              
              <Button
                variant="contained"
                color="primary"
                onClick={handleAdd}
                disabled={loading}
                startIcon={<Plus />}
                sx={{ 
                  alignSelf: 'flex-start',
                  px: 3,
                  py: 1
                }}
              >
                {t('addEntry')}
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Summary Card */}
        <Card sx={{ mb: 4, boxShadow: 2, borderRadius: 2, bgcolor: '#e8f5e9' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {t('totalFarmExpenses')}
              </Typography>
              
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#2e7d32' }}>
                ₹{totalExpenses.toFixed(2)}
              </Typography>
            </Box>
            
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                color="primary"
                size="small"
                startIcon={<Calculator />}
                onClick={() => navigate('/calculator-profit')}
              >
                Profitability Calculator
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Expense List Table */}
        <Card sx={{ boxShadow: 2, borderRadius: 2 }}>
          <CardContent sx={{ pb: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Recent Entries ({expenses.length})
            </Typography>
            
            {expenses.length > 0 ? (
              <TableContainer component={Paper} sx={{ borderRadius: 2, mb: 2, maxHeight: 300, overflow: 'auto' }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ bgcolor: '#f1f8e9', fontWeight: 600 }}>Date</TableCell>
                      <TableCell sx={{ bgcolor: '#f1f8e9', fontWeight: 600 }}>Category</TableCell>
                      <TableCell sx={{ bgcolor: '#f1f8e9', fontWeight: 600 }}>Note</TableCell>
                      <TableCell align="right" sx={{ bgcolor: '#f1f8e9', fontWeight: 600 }}>Amount</TableCell>
                      <TableCell align="right" sx={{ bgcolor: '#f1f8e9', fontWeight: 600, minWidth: '120px' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sortedExpenses.map((expense) => (
                      <TableRow key={expense.id} hover>
                        {editingId === expense.id ? (
                          // Edit mode
                          <>
                            <TableCell>
                              <TextField
                                type="date"
                                value={editVals.date}
                                onChange={(e) => setEditVals({...editVals, date: e.target.value})}
                                InputLabelProps={{ shrink: true }}
                                size="small"
                                sx={{ width: '140px' }}
                              />
                            </TableCell>
                            <TableCell>
                              <FormControl size="small" sx={{ minWidth: '120px' }}>
                                <Select
                                  value={editVals.category}
                                  onChange={(e) => setEditVals({...editVals, category: e.target.value})}
                                  displayEmpty
                                >
                                  {categories.map((cat) => (
                                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </TableCell>
                            <TableCell>
                              <TextField
                                value={editVals.note}
                                onChange={(e) => setEditVals({...editVals, note: e.target.value})}
                                size="small"
                                fullWidth
                                multiline
                                maxRows={2}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <TextField
                                type="number"
                                value={editVals.amount}
                                onChange={(e) => setEditVals({...editVals, amount: e.target.value})}
                                size="small"
                                InputProps={{
                                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                }}
                                sx={{ width: '120px' }}
                              />
                            </TableCell>
                          </>
                        ) : (
                          // Display mode
                          <>
                            <TableCell>
                              {new Date(expense.transaction_date || expense.date).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Box sx={{ 
                                bgcolor: '#e3f2fd', 
                                px: 1, 
                                py: 0.5, 
                                borderRadius: 1, 
                                display: 'inline-block',
                                fontSize: '0.875rem'
                              }}>
                                {expense.category}
                              </Box>
                            </TableCell>
                            <TableCell sx={{ maxWidth: '200px' }}>
                              <Typography variant="body2" sx={{ 
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}>
                                {expense.note || '-'}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" sx={{ fontWeight: 600, color: '#d32f2f' }}>
                                ₹{expense.amount.toFixed(2)}
                              </Typography>
                            </TableCell>
                          </>
                        )}
                        <TableCell align="right">
                          {editingId === expense.id ? (
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                              <IconButton 
                                color="primary" 
                                size="small"
                                onClick={() => handleSaveEdit(expense.id)}
                                disabled={loading}
                                sx={{ bgcolor: 'primary.light', '&:hover': { bgcolor: 'primary.main' } }}
                              >
                                <Check size={16} />
                              </IconButton>
                              <IconButton 
                                color="error" 
                                size="small"
                                onClick={handleCancelEdit}
                                disabled={loading}
                                sx={{ bgcolor: 'error.light', '&:hover': { bgcolor: 'error.main' } }}
                              >
                                <X size={16} />
                              </IconButton>
                            </Box>
                          ) : (
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                              <IconButton 
                                color="primary" 
                                size="small"
                                onClick={() => handleEdit(expense)}
                                disabled={loading}
                                sx={{ '&:hover': { bgcolor: 'primary.light' } }}
                              >
                                <Edit size={16} />
                              </IconButton>
                              <IconButton 
                                color="error" 
                                size="small"
                                onClick={() => handleDelete(expense.id)}
                                disabled={loading}
                                sx={{ '&:hover': { bgcolor: 'error.light' } }}
                              >
                                <Trash2 size={16} />
                              </IconButton>
                            </Box>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ 
                height: '200px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: '#f9f9f9',
                borderRadius: 2,
                border: '2px dashed #ddd'
              }}>
                <Typography color="textSecondary" variant="h6">
                  No entries yet. Add your first farm expense above.
                </Typography>
              </Box>
            )}
            
            {/* Total Expenses Summary */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 2, pt: 2, borderTop: '1px solid #e0e0e0' }}>
              <Typography fontSize={15} fontWeight={700} mr={1}>Total Expenses:</Typography>
              <Typography fontSize={18} fontWeight={900} color="#dc2626">₹{totalExpenses.toFixed(2)}</Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
    </Layout>
  );
}
