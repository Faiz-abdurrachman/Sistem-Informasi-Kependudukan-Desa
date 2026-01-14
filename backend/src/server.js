// ============================================
// FILE: server.js
// ============================================
// 
// DESKRIPSI:
// Entry point untuk start Express server
// File ini menginisialisasi database connection dan start server
//
// ALUR DATA:
// 1. Load environment variables
// 2. Test database connection
// 3. Start Express server
// 4. Handle graceful shutdown
//
// ALASAN DESAIN:
// - Separation of concerns: server.js untuk start, app.js untuk config
// - Error handling: Handle error saat start server
// - Graceful shutdown: Close database connection saat shutdown
//
// PENGGUNAAN:
// node src/server.js
// atau
// npm start (production)
// npm run dev (development dengan nodemon)
//
// ============================================

import dotenv from 'dotenv';
import app from './app.js';
import { testConnection, disconnectDatabase } from './config/database.js';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Start server
 * Test database connection terlebih dahulu, lalu start Express server
 */
const startServer = async () => {
  try {
    // Test database connection
    console.log('🔄 Testing database connection...');
    const isConnected = await testConnection();

    if (!isConnected) {
      console.error('❌ Database connection failed. Server will not start.');
      process.exit(1);
    }

    // Start Express server
    app.listen(PORT, () => {
      console.log('===========================================');
      console.log('🚀 SERVER BERHASIL DIMULAI');
      console.log('===========================================');
      console.log(`📍 Environment: ${NODE_ENV}`);
      console.log(`🌐 Server running on: http://localhost:${PORT}`);
      console.log(`📡 API Health Check: http://localhost:${PORT}/api/health`);
      console.log('===========================================');
    });
  } catch (error) {
    console.error('❌ Error starting server:', error);
    process.exit(1);
  }
};

/**
 * Graceful Shutdown Handler
 * Close database connection saat server shutdown
 */
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  
  try {
    await disconnectDatabase();
    console.log('✅ Server shutdown complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  gracefulShutdown('UNHANDLED_REJECTION');
});

// Start server
startServer();

