import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Events from './pages/Events';
import EventCreate from './pages/EventCreate';
import EventDetail from './pages/EventDetail';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import SKSDashboard from './pages/SKSDashboard';
import ChangePassword from './pages/ChangePassword';
import ManagementDashboard from './pages/ManagementDashboard';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' }
  }
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/create" element={<EventCreate />} />
            <Route path="/events/:id" element={<EventDetail />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/management" element={<ManagementDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/sks" element={<SKSDashboard />} />
            <Route path="/change-password" element={<ChangePassword />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
