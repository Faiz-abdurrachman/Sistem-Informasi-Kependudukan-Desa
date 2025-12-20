// ============================================
// FILE: vite.config.js
// ============================================
// 
// DESKRIPSI:
// Konfigurasi Vite untuk development dan build
// Vite adalah build tool yang sangat cepat untuk React
//
// ============================================

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});

