import React from 'react';
import { AppBar, Toolbar, Typography, Button, Container } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate(); // Kullanılmadı uyarısını gidermek için

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
              SKS Etkinlik
            </Link>
          </Typography>
          {user ? (
            <>
              <Button color="inherit" component={Link} to="/events">
                Etkinlikler
              </Button>
              <Button color="inherit" component={Link} to="/profile">
                Profil
              </Button>
              {user.role === 'admin' && (
                <Button color="inherit" component={Link} to="/admin">
                  Admin Paneli
                </Button>
              )}
              {user.role === 'sks' && (
                <Button color="inherit" component={Link} to="/sks">
                  SKS Paneli
                </Button>
              )}
              {user.role === 'management' && (
      <Button color="inherit" component={Link} to="/management">
        Yönetim Paneli
      </Button>
    )}
              <Button color="inherit" onClick={logout}>
                Çıkış
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/login">
                Giriş
              </Button>
              <Button color="inherit" component={Link} to="/register">
                Kayıt
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>
      <Container sx={{ py: 4 }}>{children}</Container>
    </>
  );
}

export default Layout;
