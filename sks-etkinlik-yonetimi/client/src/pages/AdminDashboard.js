import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, CircularProgress,
  Alert, Snackbar, IconButton
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import RefreshIcon from '@mui/icons-material/Refresh';

function AdminDashboard() {
  const { user } = useAuth();
  const [pendingEvents, setPendingEvents] = useState([]);
  const [loading, setLoading] = useState({ events: true, action: false });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchPendingEvents = async () => {
    try {
      setLoading(prev => ({ ...prev, events: true }));
      const res = await axios.get('/api/events/admin/pending-events');
      
      if (res.data?.success && Array.isArray(res.data.data)) {
        setPendingEvents(res.data.data);
      } else {
        throw new Error('Geçersiz veri formatı');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Bekleyen etkinlikler yüklenemedi');
    } finally {
      setLoading(prev => ({ ...prev, events: false }));
    }
  };

  const approveEvent = async (eventId) => {
    try {
      setLoading(prev => ({ ...prev, action: true }));
      await axios.put(`/api/events/admin/approve-event/${eventId}`);
      fetchPendingEvents();
    } catch (err) {
      setError(err.response?.data?.message || 'Etkinlik onaylanamadı');
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchPendingEvents();
    } else {
      navigate('/');
    }
  }, [user, navigate]);

  if (user?.role !== 'admin') {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Bu sayfaya erişim yetkiniz yok</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Admin Paneli
      </Typography>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Bekleyen Etkinlikler</Typography>
        <IconButton onClick={fetchPendingEvents}>
          <RefreshIcon />
        </IconButton>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading.events ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Etkinlik Adı</TableCell>
                <TableCell>Tarih</TableCell>
                <TableCell>Oluşturan</TableCell>
                <TableCell>Birim</TableCell>
                <TableCell>İşlem</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingEvents.length > 0 ? (
                pendingEvents.map((event) => (
                  <TableRow key={event._id}>
                    <TableCell>{event.title}</TableCell>
                    <TableCell>{new Date(event.date).toLocaleString()}</TableCell>
                    <TableCell>{event.createdBy?.name}</TableCell>
                    <TableCell>{event.unit?.name}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => approveEvent(event._id)}
                        disabled={loading.action}
                      >
                        Onayla
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Bekleyen etkinlik bulunamadı
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

export default AdminDashboard;