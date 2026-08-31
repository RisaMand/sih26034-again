import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [activeRuleVersion, setActiveRuleVersion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 5000);
  };

  const fetchActiveRules = async () => {
    try {
      const res = await apiClient('/api/v1/rules/active');
      if (res.data?.version) {
        setActiveRuleVersion(res.data.version);
      }
    } catch (err) {
      console.warn('Failed to fetch active rules:', err.message);
    }
  };

  const restoreSession = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await apiClient('/api/v1/auth/me');
      setUser(res.data);
      await fetchActiveRules();
    } catch (err) {
      showToast(err.message || 'Session expired.');
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    restoreSession();

    const handleUnauthorized = () => {
      logout();
      showToast('Session expired. Please login again.');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (email, password) => {
    const res = await apiClient('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    const jwt = res.data.token;
    localStorage.setItem('token', jwt);
    setToken(jwt);
    setUser(res.data.user);
    await fetchActiveRules();
    return res;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, activeRuleVersion, login, logout, showToast, toastMessage }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);