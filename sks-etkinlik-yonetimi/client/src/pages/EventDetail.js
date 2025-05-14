import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Box, Paper, Button, Alert, Chip } from '@mui/material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await axios.get(`/api/events/${id}`);
        setEvent(res.data);
      } catch (err) {
        console.error('Etkinlik detayları yüklenemedi:', err);
        setError(err.response?.data?.message || 'Etkinlik yüklenemedi');
      }
    };
    fetchEvent();
  }, [id]);

  const getStatusText = (status) => {
    switch(status) {
      case 'pending': return 'Admin Onayı Bekliyor';
      case 'approvedByAdmin': return 'SKS Onayı Bekliyor';
      case 'approvedBySKS': return 'Onaylandı';
      case 'rejected': return 'Reddedildi';
      default: return status;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'warning';
      case 'approvedByAdmin': return 'info';
      case 'approvedBySKS': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!event) return <Typography>Yükleniyor...</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          {event.title}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Typography variant="subtitle1">Durum:</Typography>
          <Chip 
            label={getStatusText(event.status)} 
            color={getStatusColor(event.status)}
          />
        </Box>
        
        <Typography variant="subtitle1" gutterBottom>
          Tarih: {new Date(event.date).toLocaleString()}
        </Typography>
        
        {event.unit?.name && (
          <Typography variant="subtitle1" gutterBottom>
            Birim: {event.unit.name}
          </Typography>
        )}
        
        <Typography variant="body1" paragraph>
          {event.description}
        </Typography>

        {event.adminApprovedAt && (
          <Typography variant="body2" color="text.secondary">
            Admin Onay Tarihi: {new Date(event.adminApprovedAt).toLocaleString()}
          </Typography>
        )}
        
        {event.sksApprovedAt && (
          <Typography variant="body2" color="text.secondary">
            SKS Onay Tarihi: {new Date(event.sksApprovedAt).toLocaleString()}
          </Typography>
        )}

        {user?.role === 'admin' && event.status === 'pending' && (
          <Button variant="contained" sx={{ mt: 2 }}>
            Onayla
          </Button>
        )}
      </Paper>
    </Box>
  );
}

export default EventDetail;
