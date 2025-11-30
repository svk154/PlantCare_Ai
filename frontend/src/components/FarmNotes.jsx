// FarmNotes.jsx
import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  TextField, 
  Button, 
  IconButton, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Divider
} from '@mui/material';
import { FileText, Trash2, X } from 'lucide-react';
import { createApiRequest } from '../utils/apiConfig';

const FarmNotes = ({ farmId, farmName, open, onClose }) => {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && farmId) {
      fetchNotes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, farmId]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await createApiRequest(`farms/${farmId}/notes`, {
        method: 'GET'
      });

      if (response.ok) {
        const data = await response.json();
        setNotes(data.notes || []);
      } else {
        throw new Error('Failed to fetch notes');
      }
    } catch (error) {
      
      setError('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    try {
      setLoading(true);
      const response = await createApiRequest(`farms/${farmId}/notes`, {
        method: 'POST',
        body: JSON.stringify({ content: newNote })
      });

      if (response.ok) {
        const data = await response.json();
        setNotes([data.note, ...notes]);
        setNewNote('');
      } else {
        throw new Error('Failed to add note');
      }
    } catch (error) {
      
      setError('Failed to add note');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      setLoading(true);
      const response = await createApiRequest(`farms/${farmId}/notes/${noteId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setNotes(notes.filter(note => note.id !== noteId));
      } else {
        throw new Error('Failed to delete note');
      }
    } catch (error) {
      
      setError('Failed to delete note');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        p: 3,
        pb: 2
      }}>
        <Box display="flex" alignItems="center">
          <FileText size={20} color="#16a34a" style={{ marginRight: '12px' }} />
          <Typography variant="h6" fontWeight={600}>
            {farmName ? `Notes - ${farmName}` : 'Farm Notes'}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <X size={20} />
        </IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Add a new observation, reminder or note about this farm..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            variant="outlined"
            sx={{
              mb: 1,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          />
          <Button 
            fullWidth 
            variant="contained" 
            disabled={loading || !newNote.trim()} 
            onClick={handleAddNote}
            sx={{
              bgcolor: '#16a34a',
              '&:hover': {
                bgcolor: '#15803d'
              },
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              py: 1
            }}
          >
            Add Note
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <Box>
          <Typography variant="subtitle1" fontWeight={600} mb={1}>
            {notes.length > 0 ? 'Previous Notes' : 'No notes yet'}
          </Typography>

          <Box 
            sx={{ 
              maxHeight: '300px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}
          >
            {notes.map((note) => (
              <Card key={note.id} sx={{ borderRadius: 2, bgcolor: '#f9fafb' }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Typography variant="body2" color="text.secondary" fontSize={12}>
                      {formatDate(note.created_at)}
                    </Typography>
                    <IconButton 
                      size="small" 
                      onClick={() => handleDeleteNote(note.id)}
                      sx={{ color: '#ef4444', p: 0.5 }}
                    >
                      <Trash2 size={14} />
                    </IconButton>
                  </Box>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mt: 1 }}>
                    {note.content}
                  </Typography>
                </CardContent>
              </Card>
            ))}

            {notes.length === 0 && (
              <Box 
                sx={{ 
                  p: 3, 
                  bgcolor: '#f9fafb', 
                  borderRadius: 2, 
                  textAlign: 'center',
                  border: '1px dashed #d1d5db' 
                }}
              >
                <FileText size={24} color="#9ca3af" style={{ marginBottom: '8px', display: 'inline-block' }} />
                <Typography color="#6b7280" mb={2}>
                  No notes have been added to this farm yet.
                </Typography>
                
                {/* Quick Start Guide */}
                <Box sx={{ mt: 3, textAlign: 'left', px: 1 }}>
                  <Typography variant="subtitle2" fontWeight={600} color="#374151" mb={1}>
                    How to use Farm Notes:
                  </Typography>
                  <Box component="ol" sx={{ pl: 2, color: "#4b5563" }}>
                    <li>
                      <Typography fontSize={14} mb={0.5}>
                        Click the notes icon <FileText size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> on any farm card
                      </Typography>
                    </li>
                    <li>
                      <Typography fontSize={14} mb={0.5}>
                        Enter observations, tasks, or reminders in the text field
                      </Typography>
                    </li>
                    <li>
                      <Typography fontSize={14} mb={0.5}>
                        Click "Add Note" to save your entry
                      </Typography>
                    </li>
                    <li>
                      <Typography fontSize={14}>
                        Use the <Trash2 size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> icon to delete old notes
                      </Typography>
                    </li>
                  </Box>
                </Box>
                
                <Typography fontSize={14} fontStyle="italic" color="#6b7280" mt={3}>
                  Start by adding your first note above!
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button 
          onClick={onClose}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 500
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FarmNotes;
