import React, { useState, useEffect } from 'react';
import { 
  TextField, Button, Container, Typography, Box, 
  Alert, FormControl, InputLabel, Select, MenuItem 
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function EventCreate() {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    description: '',
    unit: ''
  });
  const [units, setUnits] = useState([]);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  // Birimleri yükle
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const res = await axios.get('/api/units');
        setUnits(res.data.data);
      } catch (err) {
        setError('Birimler yüklenemedi');
      }
    };
    fetchUnits();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validasyon
      if (!formData.title || !formData.date || !formData.unit) {
        setError('Başlık, tarih ve birim zorunlu alanlardır');
        return;
      }

      const res = await axios.post('/api/events', {
        ...formData,
        createdBy: user._id // Kullanıcı ID'sini ekleyin
      });
      
      if (res.data.success) {
        navigate('/events');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Etkinlik oluşturulamadı');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 3 }}>
        <Typography variant="h5" gutterBottom>
          Yeni Etkinlik Oluştur
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Etkinlik Adı"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            type="datetime-local"
            InputLabelProps={{ shrink: true }}
            label="Tarih"
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
          />
          
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Birim</InputLabel>
            <Select
              value={formData.unit}
              label="Birim"
              onChange={(e) => setFormData({...formData, unit: e.target.value})}
            >
              {units.map((unit) => (
                <MenuItem key={unit._id} value={unit._id}>
                  {unit.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
            margin="normal"
            fullWidth
            multiline
            rows={4}
            label="Açıklama"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Oluştur
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default EventCreate;