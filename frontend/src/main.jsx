// ============================================
// FILE: main.jsx
// ============================================
// 
// DESKRIPSI:
// Entry point untuk React application
// File ini menginisialisasi React dan render App component
//
// ============================================

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

