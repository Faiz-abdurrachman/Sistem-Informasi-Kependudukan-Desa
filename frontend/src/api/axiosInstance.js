// ============================================
// FILE: axiosInstance.js
// ============================================
// 
// DESKRIPSI:
// Konfigurasi Axios instance untuk API calls
// Menggunakan interceptors untuk attach JWT token dan handle errors
//
// ALUR DATA:
// 1. Request: Attach JWT token dari localStorage ke header Authorization
// 2. Response: Return data langsung
// 3. Error: Handle error response dan redirect ke login jika 401
//
// ALASAN DESAIN:
// - Centralized config: Semua API calls menggunakan instance yang sama
// - Auto attach token: JWT token otomatis di-attach ke setiap request
// - Error handling: Handle error response secara konsisten
// - Base URL: Set base URL untuk semua API calls
//
// PENGGUNAAN:
// import api from '../api/axiosInstance.js';
// const response = await api.get('/api/penduduk');
//
// ============================================

import axios from 'axios';
import toast from 'react-hot-toast';

// Base URL untuk API (sesuai dengan backend)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach JWT token ke setiap request
api.interceptors.request.use(
  (config) => {
    // Get token dari localStorage
    const token = localStorage.getItem('token');

    // Jika token ada, attach ke header Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Handle error response
api.interceptors.response.use(
  (response) => {
    // Return data langsung jika success
    return response;
  },
  (error) => {
    // Handle error response
    if (error.response) {
      const { status, data } = error.response;

      // Jika 401 Unauthorized, hapus token dan redirect ke login
      if (status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Redirect ke login jika tidak sedang di halaman login
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
          toast.error('Session expired. Silakan login kembali.');
        }
      } else if (status === 403) {
        // 403 Forbidden: User tidak punya akses
        toast.error(data.message || 'Akses ditolak');
      } else if (status >= 500) {
        // Server error
        toast.error('Terjadi kesalahan pada server. Silakan coba lagi.');
      } else {
        // Client error (400, 404, dll)
        toast.error(data.message || 'Terjadi kesalahan');
      }
    } else if (error.request) {
      // Request dibuat tapi tidak ada response (network error)
      toast.error('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
    } else {
      // Error saat setup request
      toast.error('Terjadi kesalahan. Silakan coba lagi.');
    }

    return Promise.reject(error);
  }
);

export default api;

