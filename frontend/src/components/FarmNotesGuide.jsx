// FarmNotesGuide.jsx
import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent,
  Button,
  IconButton
} from '@mui/material';
import { FileText, X } from 'lucide-react';
import { motion } from 'framer-motion';

const FarmNotesGuide = ({ onClose }) => {
  const [visible, setVisible] = useState(true);

  const handleClose = () => {
    setVisible(false);
    if (onClose) onClose();
    // Store in localStorage to not show again
    localStorage.setItem('farmNotesGuideShown', 'true');
  };

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        sx={{ 
          borderRadius: 3, 
          border: '1px solid #e5e7eb',
          borderLeft: '4px solid #3b82f6',
          mb: 3,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box display="flex" gap={2} alignItems="center">
              <Box 
                sx={{ 
                  backgroundColor: '#eff6ff', 
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 1
                }}
              >
                <FileText size={24} color="#2563eb" />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  New: Farm Notes Feature
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={0.5}>
                  Keep track of observations, tasks, and reminders for each of your farms.
                </Typography>
              </Box>
            </Box>
            <IconButton size="small" onClick={handleClose}>
              <X size={18} />
            </IconButton>
          </Box>

          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'flex-end',
              alignItems: 'center', 
              mt: 2,
              gap: 2
            }}
          >
            <Button
              variant="text"
              onClick={handleClose}
              sx={{ color: '#6b7280', fontWeight: 500 }}
            >
              Dismiss
            </Button>
            <Button
              variant="contained"
              onClick={handleClose}
              startIcon={<FileText size={16} />}
              sx={{ 
                bgcolor: '#3b82f6',
                '&:hover': { bgcolor: '#2563eb' },
                fontWeight: 600,
                borderRadius: 2
              }}
            >
              Try it now
            </Button>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FarmNotesGuide;
