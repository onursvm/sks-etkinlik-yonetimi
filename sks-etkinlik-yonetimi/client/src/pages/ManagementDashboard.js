import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Grid,
  InputAdornment,
  IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import UserEditModal from './UserEditModal';

export default function ManagementDashboard() {
  const { user: currentUser } = useAuth();
  const [units, setUnits] = useState([]);
  const [newUnit, setNewUnit] = useState('');
  const [loading, setLoading] = useState({
    fetch: false,
    add: false,
    delete: false,
    users: false
  });
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [users, setUsers] = useState([]);
  const [editUser, setEditUser] = useState(null);
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    unit: ''
  });
  const [activeTab, setActiveTab] = useState(0);
  const [unitFilter, setUnitFilter] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const fetchUnits = async () => {
    try {
      setLoading(prev => ({ ...prev, fetch: true }));
      const { data } = await axios.get('/api/units');
      setUnits(data.data);
    } catch (error) {
      showNotification('Birimler yüklenemedi', 'error');
    } finally {
      setLoading(prev => ({ ...prev, fetch: false }));
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(prev => ({ ...prev, users: true }));
      const { data } = await axios.get('/api/users');
      setUsers(data.data);
    } catch (error) {
      console.error('Kullanıcılar yüklenemedi:', error);
      showNotification('Kullanıcılar yüklenirken bir hata oluştu', 'error');
    } finally {
      setLoading(prev => ({ ...prev, users: false }));
    }
  };

  const handleAddUnit = async () => {
    try {
      setLoading(prev => ({ ...prev, add: true }));
      const { data } = await axios.post('/api/units', { name: newUnit });
      setNewUnit('');
      showNotification(`${data.data.name} birimi eklendi`, 'success');
      fetchUnits();
    } catch (error) {
      const message = error.response?.data?.message || 'Topluluk eklenemedi';
      showNotification(message, 'error');
    } finally {
      setLoading(prev => ({ ...prev, add: false }));
    }
  };

  const handleDeleteUnit = async (unitId) => {
    if (!window.confirm('Bu birimi silmek istediğinize emin misiniz?')) return;

    try {
      setLoading(prev => ({ ...prev, delete: true }));
      await axios.delete(`/api/units/${unitId}`);
      showNotification('Topluluk başarıyla silindi', 'success');
      fetchUnits();
    } catch (error) {
      const message = error.response?.data?.message || 'Topluluk silinemedi';
      showNotification(message, 'error');
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };

  const handleCreateUser = async () => {
    try {
      setLoading(prev => ({ ...prev, add: true }));
      
      const userData = {
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        role: newUser.role,
        isVerified: true
      };

      if (newUser.role === 'admin') {
        if (!newUser.unit) {
          showNotification('Admin kullanıcılar için birim seçimi zorunludur', 'error');
          return;
        }
        userData.unit = newUser.unit;
      } else {
        userData.unit = currentUser.unit;
      }

      if (!userData.name || !userData.email || !userData.password || !userData.role) {
        showNotification('Lütfen tüm zorunlu alanları doldurun', 'error');
        return;
      }

      const { data } = await axios.post('/api/auth/register', userData);
      setOpenUserDialog(false);
      setNewUser({
        name: '',
        email: '',
        password: '',
        role: 'user',
        unit: ''
      });
      fetchUsers();
      showNotification('Kullanıcı başarıyla oluşturuldu', 'success');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                         error.message || 
                         'Kullanıcı oluşturulamadı';
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(prev => ({ ...prev, add: false }));
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) return;

    try {
      await axios.delete(`/api/users/${userId}`);
      fetchUsers();
      showNotification('Kullanıcı başarıyla silindi', 'success');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                         error.message || 
                         'Kullanıcı silinirken bir hata oluştu';
      showNotification(errorMessage, 'error');
    }
  };

  const handleUpdateUser = async (updatedUser) => {
    try {
      const userData = {
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        unit: updatedUser.role === 'admin' ? updatedUser.unit : currentUser.unit
      };

      await axios.put(`/api/users/${updatedUser._id}`, userData);
      fetchUsers();
      setEditUser(null);
      showNotification('Kullanıcı başarıyla güncellendi', 'success');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                         error.message || 
                         'Kullanıcı güncellenirken bir hata oluştu';
      showNotification(errorMessage, 'error');
    }
  };

  const showNotification = (message, severity) => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleRoleChange = (role) => {
    setNewUser(prev => ({
      ...prev,
      role,
      unit: role === 'admin' ? '' : currentUser.unit
    }));
  };

  const filteredUnits = units.filter(unit =>
    unit.name.toLowerCase().includes(unitFilter.toLowerCase())
  );

  const filteredUsers = users.filter(user => {
    const matchesName = user.name.toLowerCase().includes(nameFilter.toLowerCase());
    const matchesUnit = unitFilter === '' || 
      (user.unit?.name && user.unit.name.toLowerCase().includes(unitFilter.toLowerCase()));
    const matchesRole = roleFilter === '' || user.role === roleFilter;
    return matchesName && matchesUnit && matchesRole;
  });

  useEffect(() => {
    fetchUnits();
    fetchUsers();
  }, []);

  if (!currentUser || currentUser.role !== 'management') {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Bu sayfaya erişim yetkiniz yok
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom>
        Yönetim Paneli
      </Typography>

      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Topluluk Yönetimi" />
        <Tab label="Kullanıcı Yönetimi" />
      </Tabs>

      {activeTab === 0 && (
        <>
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={8}>
                <TextField
                  label="Topluluk Ara"
                  fullWidth
                  value={unitFilter}
                  onChange={(e) => setUnitFilter(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <TextField
                    label="Topluluk Adı"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    fullWidth
                    disabled={loading.add}
                  />
                  <Button
                    variant="contained"
                    onClick={handleAddUnit}
                    disabled={!newUnit.trim() || loading.add}
                    sx={{ height: 56 }}
                    startIcon={<AddIcon />}
                  >
                    {loading.add ? <CircularProgress size={24} /> : 'Ekle'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Topluluk Listesi ({filteredUnits.length})
            </Typography>

            {loading.fetch ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : filteredUnits.length === 0 ? (
              <Alert severity="info">
                {unitFilter ? 'Filtreye uygun birim bulunamadı' : 'Henüz birim eklenmedi'}
              </Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Topluluk Adı</TableCell>
                      <TableCell>Oluşturulma Tarihi</TableCell>
                      <TableCell>İşlemler</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredUnits.map((unit) => (
                      <TableRow key={unit._id}>
                        <TableCell>{unit.name}</TableCell>
                        <TableCell>
                          {new Date(unit.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <IconButton
                            edge="end"
                            aria-label="delete"
                            onClick={() => handleDeleteUnit(unit._id)}
                            disabled={loading.delete}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </>
      )}

      {activeTab === 1 && (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Kullanıcı Adı Ara"
                  fullWidth
                  value={nameFilter}
                  onChange={(e) => setNameFilter(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Birime Göre Filtrele"
                  fullWidth
                  value={unitFilter}
                  onChange={(e) => setUnitFilter(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Rol Filtrele</InputLabel>
                  <Select
                    value={roleFilter}
                    label="Rol Filtrele"
                    onChange={(e) => setRoleFilter(e.target.value)}
                  >
                    <MenuItem value="">Tüm Roller</MenuItem>
                    <MenuItem value="user">Kullanıcı</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="sks">SKS</MenuItem>
                    <MenuItem value="management">Yönetim</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Kullanıcı Listesi ({filteredUsers.length})
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenUserDialog(true)}
            >
              Yeni Kullanıcı
            </Button>
          </Box>

          {loading.users ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : filteredUsers.length === 0 ? (
            <Alert severity="info">
              {nameFilter || unitFilter || roleFilter ? 'Filtreye uygun kullanıcı bulunamadı' : 'Henüz kullanıcı eklenmedi'}
            </Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Ad</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Rol</TableCell>
                    <TableCell>Topluluk</TableCell>
                    <TableCell>İşlemler</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {user.role === 'admin' && 'Admin'}
                        {user.role === 'sks' && 'SKS'}
                        {user.role === 'management' && 'Yönetim'}
                        {user.role === 'user' && 'Kullanıcı'}
                      </TableCell>
                      <TableCell>{user.unit?.name || '-'}</TableCell>
                      <TableCell>
                        <IconButton 
                          onClick={() => setEditUser(user)}
                          disabled={user._id === currentUser._id}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          onClick={() => handleDeleteUser(user._id)} 
                          color="error"
                          disabled={user._id === currentUser._id}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}

      <Dialog open={openUserDialog} onClose={() => setOpenUserDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Yeni Kullanıcı Ekle</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Ad Soyad"
            fullWidth
            value={newUser.name}
            onChange={(e) => setNewUser({...newUser, name: e.target.value})}
            required
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            value={newUser.email}
            onChange={(e) => setNewUser({...newUser, email: e.target.value})}
            sx={{ mt: 2 }}
            required
          />
          <TextField
            margin="dense"
            label="Şifre"
            type="password"
            fullWidth
            value={newUser.password}
            onChange={(e) => setNewUser({...newUser, password: e.target.value})}
            sx={{ mt: 2 }}
            required
          />
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Rol</InputLabel>
            <Select
              value={newUser.role}
              label="Rol"
              onChange={(e) => handleRoleChange(e.target.value)}
            >
              <MenuItem value="user">Kullanıcı</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="sks">SKS</MenuItem>
              <MenuItem value="management">Yönetim</MenuItem>
            </Select>
          </FormControl>
          
          {newUser.role === 'admin' && (
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Topluluk</InputLabel>
              <Select
                value={newUser.unit}
                label="Topluluk"
                onChange={(e) => setNewUser({...newUser, unit: e.target.value})}
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
          <Button onClick={() => setOpenUserDialog(false)}>İptal</Button>
          <Button 
            onClick={handleCreateUser}
            variant="contained"
            disabled={
              loading.add || 
              !newUser.name || 
              !newUser.email || 
              !newUser.password || 
              !newUser.role || 
              (newUser.role === 'admin' && !newUser.unit)
            }
          >
            {loading.add ? <CircularProgress size={24} /> : 'Oluştur'}
          </Button>
        </DialogActions>
      </Dialog>

      <UserEditModal
        open={Boolean(editUser)}
        user={editUser}
        onClose={() => setEditUser(null)}
        onSave={handleUpdateUser}
        units={units}
        currentUser={currentUser}
      />

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
