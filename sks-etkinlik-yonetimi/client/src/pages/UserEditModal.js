import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';

export default function UserEditModal({ open, user, onClose, onSave, units, currentUser }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user',
    unit: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        unit: user.unit?._id || ''
      });
    }
  }, [user]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Admin güncellerken birim zorunlu, diğerleri için currentUser'ın birimi kullanılacak
      const updatedData = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
      unit: formData.role === 'admin' ? formData.unit : currentUser.unit
    };
    if (!updatedData.name || !updatedData.email || !updatedData.role || 
        (updatedData.role === 'admin' && !updatedData.unit)) {
      alert('Lütfen tüm zorunlu alanları doldurun');
      return;
    }
      onSave({
        ...user,
        ...updatedData,
        unit: {
          _id: updatedData.unit,
          name: units.find(u => u._id === updatedData.unit)?.name || ''
        }
      });
    } catch (error) {
      console.error('Güncelleme başarısız:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (role) => {
    setFormData(prev => ({
      ...prev,
      role,
      unit: role === 'admin' ? '' : currentUser.unit
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Kullanıcı Düzenle</DialogTitle>
      <DialogContent>
        <TextField
          margin="dense"
          label="Ad Soyad"
          fullWidth
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
        />
        <TextField
          margin="dense"
          label="Email"
          type="email"
          fullWidth
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          sx={{ mt: 2 }}
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>Rol</InputLabel>
          <Select
            value={formData.role}
            label="Rol"
            onChange={(e) => handleRoleChange(e.target.value)}
          >
            <MenuItem value="user">Kullanıcı</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="sks">SKS</MenuItem>
            <MenuItem value="management">Yönetim</MenuItem>
          </Select>
        </FormControl>
        
        {formData.role === 'admin' && (
          <FormControl fullWidth margin="normal">
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
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>İptal</Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !formData.name || !formData.email || (formData.role === 'admin' && !formData.unit)}
        >
          {loading ? <CircularProgress size={24} /> : 'Kaydet'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}