// ============================================
// FILE: AuthContext.jsx
// ============================================
// 
// DESKRIPSI:
// Context untuk authentication state management
// Menyediakan user state dan auth functions ke seluruh aplikasi
//
// ALUR DATA:
// 1. Initialize: Load user dan token dari localStorage saat app start
// 2. Login: Save token dan user ke localStorage, update state
// 3. Logout: Clear localStorage dan state
// 4. Update user: Update user state saat ada perubahan
//
// ALASAN DESAIN:
// - Global state: User state bisa diakses dari mana saja
// - Persistence: Token dan user disimpan di localStorage
// - React Context: Menggunakan Context API untuk state management
//
// PENGGUNAAN:
// import { useAuth } from '../context/AuthContext';
// const { user, login, logout } = useAuth();
//
// ============================================

import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axiosInstance.js';

// Create Auth Context
const AuthContext = createContext(null);

/**
 * AuthProvider Component
 * Menyediakan authentication state dan functions ke child components
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize: Load user dari localStorage saat app start
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');

        if (token && userStr) {
          // Set user dari localStorage
          setUser(JSON.parse(userStr));

          // Verify token dengan API call
          try {
            const response = await api.get('/api/auth/profile');
            if (response.data.success) {
              setUser(response.data.data.user);
              localStorage.setItem('user', JSON.stringify(response.data.data.user));
            } else {
              // Token invalid, clear storage
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setUser(null);
            }
          } catch (error) {
            // Token invalid, clear storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Init auth error:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * Login function
   * @param {string} username - Username atau email
   * @param {string} password - Password
   * @returns {Promise<Object>} User data dan token
   */
  const login = async (username, password) => {
    try {
      const response = await api.post('/api/auth/login', {
        username,
        password,
      });

      if (response.data.success) {
        const { user, token } = response.data.data;

        // Save ke localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        // Update state
        setUser(user);

        return { success: true, user, token };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login gagal. Silakan coba lagi.',
      };
    }
  };

  /**
   * Logout function
   * Clear localStorage dan state
   */
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  /**
   * Update user function
   * Update user state (misal setelah update profile)
   */
  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const value = {
    user,
    loading,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * useAuth Hook
 * Custom hook untuk mengakses auth context
 * 
 * @returns {Object} { user, loading, login, logout, updateUser, isAuthenticated }
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
};

export default AuthContext;

