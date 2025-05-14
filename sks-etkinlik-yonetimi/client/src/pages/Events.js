import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, List, ListItem, ListItemText,
  Button, CircularProgress, Alert, TextField,
  Grid, InputAdornment, Chip, Paper
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

function Events() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    title: '',
    unit: ''
  });

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/events');
        
        // Veri yapısını kontrol et ve düzelt
        const eventsData = res.data?.data || [];
        if (!Array.isArray(eventsData)) {
          throw new Error('Geçersiz veri formatı');
        }

        setEvents(eventsData);
        setError('');
      } catch (err) {
        console.error('Etkinlikler yüklenemedi:', err);
        setError(err.response?.data?.message || 'Etkinlikler yüklenirken hata oluştu');
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, []);

  const filteredEvents = events.filter(event => {
    const titleMatch = event.title?.toLowerCase().includes(filters.title.toLowerCase());
    const unitMatch = filters.unit === '' || 
      (event.unit?.name?.toLowerCase().includes(filters.unit.toLowerCase()));
    return titleMatch && unitMatch;
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Etkinlikler
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Etkinlik Ara"
              value={filters.title}
              onChange={(e) => setFilters({...filters, title: e.target.value})}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Birim Filtrele"
              value={filters.unit}
              onChange={(e) => setFilters({...filters, unit: e.target.value})}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      {user?.role === 'user' && (
        <Button 
          variant="contained" 
          component={Link} 
          to="/events/create" 
          sx={{ mb: 3 }}
        >
          Yeni Etkinlik Oluştur
        </Button>
      )}

      <Paper elevation={3}>
        <List>
          {filteredEvents.length > 0 ? (
            filteredEvents.map(event => (
              <ListItem
                key={event._id}
                button
                component={Link}
                to={`/events/${event._id}`}
                sx={{
                  '&:hover': { backgroundColor: 'action.hover' },
                  borderBottom: '1px solid #eee'
                }}
              >
                <ListItemText
                  primary={event.title}
                  secondary={
                    <>
                      <Box component="span" display="block">
                        {new Date(event.date).toLocaleString('tr-TR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Box>
                      <Box display="flex" alignItems="center" gap={1} mt={1}>
                        <Chip
                          label={
                            event.status === 'pending' ? 'Onay Bekliyor' :
                            event.status === 'approvedByAdmin' ? 'SKS Onayında' :
                            event.status === 'approvedBySKS' ? 'Onaylandı' : 'Reddedildi'
                          }
                          color={
                            event.status === 'pending' ? 'warning' :
                            event.status === 'approvedByAdmin' ? 'info' :
                            event.status === 'approvedBySKS' ? 'success' : 'error'
                          }
                          size="small"
                        />
                        {event.unit?.name && (
                          <Typography variant="body2" color="text.secondary">
                            {event.unit.name}
                          </Typography>
                        )}
                      </Box>
                    </>
                  }
                />
              </ListItem>
            ))
          ) : (
            <Box p={3} textAlign="center">
              <Typography variant="body1">
                {filters.title || filters.unit 
                  ? 'Filtreyle eşleşen etkinlik bulunamadı' 
                  : 'Henüz etkinlik eklenmedi'}
              </Typography>
            </Box>
          )}
        </List>
      </Paper>
    </Box>
  );
}

export default Events;