import React from 'react';
import { Typography, Box, Paper, Button } from '@mui/material';
import { useAuth } from '../context/AuthContext';

function Profile() {
  const { user, logout } = useAuth();

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Profil Bilgileri
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Ad:</strong> {user?.name}
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Email:</strong> {user?.email}
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Rol:</strong> {user?.role}
        </Typography>
        <Button
          variant="contained"
          color="error"
          onClick={logout}
          sx={{ mt: 2 }}
        >
          Çıkış Yap
        </Button>
      </Paper>
    </Box>
  );
}

export default Profile;