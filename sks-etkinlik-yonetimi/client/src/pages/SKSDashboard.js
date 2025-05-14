import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  CircularProgress,
  Alert,
  Snackbar,
  IconButton
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import RefreshIcon from '@mui/icons-material/Refresh';

function SKSDashboard() {
  const { user, isSKS } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState({
    events: true,
    action: false
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const navigate = useNavigate();

  const fetchEvents = async () => {
    try {
      setLoading(prev => ({ ...prev, events: true }));
      const res = await axios.get('/api/events/admin-approved');
      
      if (res.data?.success && Array.isArray(res.data.data)) {
        setEvents(res.data.data);
      } else {
        throw new Error('Geçersiz veri formatı');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Etkinlikler yüklenirken hata oluştu');
    } finally {
      setLoading(prev => ({ ...prev, events: false }));
    }
  };

  const approveEvent = async (eventId) => {
    try {
      setLoading(prev => ({ ...prev, action: true }));
      await axios.put(`/api/events/sks-approve/${eventId}`);
      
      setSuccess('Etkinlik başarıyla onaylandı ve PDF oluşturuldu');
      setOpenSnackbar(true);
      fetchEvents();
    } catch (err) {
      setError(err.response?.data?.message || 'Etkinlik onaylanırken hata oluştu');
      setOpenSnackbar(true);
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  useEffect(() => {
    if (!isSKS()) {
      navigate('/');
    } else {
      fetchEvents();
    }
  }, [isSKS, navigate]);

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  if (!isSKS()) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Bu sayfaya erişim yetkiniz yok</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        SKS Yönetim Paneli
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Admin Onaylı Etkinlikler</Typography>
        <IconButton onClick={fetchEvents} disabled={loading.events}>
          <RefreshIcon />
        </IconButton>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {loading.events ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress size={60} />
        </Box>
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
              {events.length > 0 ? (
                events.map((event) => (
                  <TableRow key={event._id}>
                    <TableCell>{event.title}</TableCell>
                    <TableCell>
                      {new Date(event.date).toLocaleString('tr-TR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </TableCell>
                    <TableCell>{event.createdBy?.name || 'Bilinmiyor'}</TableCell>
                    <TableCell>{event.unit?.name || 'Bilinmiyor'}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => approveEvent(event._id)}
                        disabled={loading.action || event.status === 'approvedBySKS'}
                      >
                        {loading.action ? (
                          <CircularProgress size={24} />
                        ) : event.status === 'approvedBySKS' ? (
                          'Onaylandı'
                        ) : (
                          'Onayla ve PDF Oluştur'
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Onay bekleyen etkinlik bulunamadı
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={error ? 'error' : 'success'}
          sx={{ width: '100%' }}
        >
          {error || success}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default SKSDashboard;