import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axios.get('/profile', { withCredentials: true });
      setUser(response.data);
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('/login', { email, password }, { withCredentials: true });
      setUser(response.data);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('/register', userData, { withCredentials: true });
      setUser(response.data);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Registration failed' };
    }
  };

  const logout = async () => {
    try {
      await axios.post('/logout', {}, { withCredentials: true });
      setUser(null);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Logout failed' };
    }
  };

  const guestLogin = () => {
    setUser({ role: 'guest', name: 'Guest User' });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, guestLogin }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 