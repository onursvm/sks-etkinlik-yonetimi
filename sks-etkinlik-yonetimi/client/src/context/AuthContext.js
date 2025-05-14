import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
    navigate('/login');
  }, [navigate]);

  const getUserData = useCallback(async () => {
  try {
    const res = await axios.get('/api/auth/me');
    if (res.data?.success) {
      setUser(res.data.data);
    } else {
      throw new Error('Kullanıcı bilgileri alınamadı');
    }
  } catch (err) {
    logout();
  } finally {
    setLoading(false);
  }
}, [logout]);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      getUserData();
    } else {
      setLoading(false);
    }
  }, [token, getUserData]);

  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      
      if (!res.data?.user || !res.data?.token) {
        throw new Error('Geçersiz sunucu yanıtı');
      }

      // Role bilgisi garantisi
      const userData = {
        ...res.data.user,
        role: res.data.user.role || 'user'
      };

      setToken(res.data.token);
      localStorage.setItem('token', res.data.token);
      setUser(userData);
      
      return { 
        success: true, 
        data: {
          user: userData,
          token: res.data.token
        }
      };
    } catch (err) {
      return { 
        success: false, 
        message: err.response?.data?.message || err.message || 'Giriş başarısız' 
      };
    }
  };

  const register = async (name, email, password, role = 'user', unit = '') => {
    try {
      const res = await axios.post('/api/auth/register', { 
        name, 
        email, 
        password, 
        role, 
        unit 
      });
      return { 
        success: true, 
        data: res.data 
      };
    } catch (err) {
      return { 
        success: false, 
        message: err.response?.data?.message || 'Kayıt başarısız' 
      };
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        token, 
        loading, 
        login, 
        register, 
        logout,
        isAdmin: () => user?.role === 'admin',
        isSKS: () => user?.role === 'sks',
        isManagement: () => user?.role === 'management'
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => React.useContext(AuthContext);
