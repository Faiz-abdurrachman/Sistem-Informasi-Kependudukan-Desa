// ============================================
// FILE: app.js
// ============================================
//
// DESKRIPSI:
// Konfigurasi Express application
// File ini mengatur middleware, routes, dan error handling
//
// ALUR DATA:
// 1. Request masuk → CORS → Body parser → Routes → Controller → Response
// 2. Error → Error handler middleware → Response error
//
// ALASAN DESAIN:
// - Separation of concerns: app.js hanya konfigurasi, server.js untuk start server
// - Middleware order: CORS → Body parser → Routes → Error handler
// - Error handling: Centralized error handler untuk semua error
// - Security: CORS config untuk allow frontend
//
// MIDDLEWARE ORDER:
// 1. CORS (Cross-Origin Resource Sharing)
// 2. Body parser (JSON, URL encoded)
// 3. Routes (API endpoints)
// 4. Error handler (catch semua error)
//
// PENGGUNAAN:
// import app from './app.js';
// app.listen(PORT, () => console.log('Server running'));
//
// ============================================

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import pendudukRoutes from "./routes/pendudukRoutes.js";
import kkRoutes from "./routes/kkRoutes.js";
import suratRoutes from "./routes/suratRoutes.js";
import statistikRoutes from "./routes/statistikRoutes.js";
import importRoutes from "./routes/importRoutes.js";
import trendRoutes from "./routes/trendRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import laporanRoutes from "./routes/laporanRoutes.js";
import dataQualityRoutes from "./routes/dataQualityRoutes.js";

// Load environment variables
dotenv.config();

const app = express();

// ============================================
// MIDDLEWARE
// ============================================

/**
 * CORS Configuration
 * Allow frontend untuk akses API
 */
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/**
 * Body Parser Middleware
 * Parse JSON dan URL-encoded request body
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Request Logger Middleware (Development only)
 * Log semua request untuk debugging
 */
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
    next();
  });
}

// ============================================
// ROUTES
// ============================================

/**
 * Root Route
 * Informasi API dan health check
 */
app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Sistem Informasi Kependudukan Desa API",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      auth: "/api/auth",
      users: "/api/users",
      penduduk: "/api/penduduk",
      kk: "/api/kk",
      surat: "/api/surat",
      statistik: "/api/statistik",
      laporan: "/api/laporan",
      import: "/api/import",
      trend: "/api/trend",
    },
    timestamp: new Date().toISOString(),
  });
});

/**
 * Health Check Route
 * Untuk cek apakah server running
 */
app.get("/api/health", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

/**
 * API Routes
 * Semua API endpoint diorganisir per feature
 */
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/penduduk", pendudukRoutes);
app.use("/api/kk", kkRoutes);
app.use("/api/surat", suratRoutes);
app.use("/api/statistik", statistikRoutes);
app.use("/api/laporan", laporanRoutes);
app.use("/api/data-quality", dataQualityRoutes);
app.use("/api/import", importRoutes);
app.use("/api/trend", trendRoutes);

// ============================================
// ERROR HANDLING
// ============================================

/**
 * 404 Not Found Handler
 * Handle route yang tidak ditemukan
 */
app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "Route tidak ditemukan",
    path: req.path,
  });
});

/**
 * Global Error Handler
 * Catch semua error yang tidak di-handle
 */
app.use((err, req, res, next) => {
  console.error("Error:", err);

  return res.status(err.status || 500).json({
    success: false,
    message: err.message || "Terjadi kesalahan pada server",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

export default app;
