// ============================================
// FILE: authRoutes.js
// ============================================
// 
// DESKRIPSI:
// Routes untuk authentication (register, login, profile)
// Menggunakan Express Router untuk mengorganisir route
//
// ALUR DATA:
// 1. Client request → Route → Middleware (jika ada) → Controller → Response
// 2. Register/Login: Public route (tidak butuh auth)
// 3. Profile: Private route (butuh authMiddleware)
//
// ALASAN DESAIN:
// - Separation of concerns: Route hanya handle routing, logic di controller
// - Modular: Route terpisah per feature
// - Middleware: authMiddleware untuk protect route
// - RESTful: Mengikuti standar REST API
//
// ROUTES:
// POST /api/auth/register - Register user baru
// POST /api/auth/login - Login user
// GET /api/auth/profile - Get profile (protected)
//
// PENGGUNAAN:
// import authRoutes from './routes/authRoutes.js';
// app.use('/api/auth', authRoutes);
//
// ============================================

import express from 'express';
import { register, login, getProfile } from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * POST /api/auth/register
 * Register user baru
 * Access: Public (tidak butuh authentication)
 */
router.post('/register', register);

/**
 * POST /api/auth/login
 * Login user
 * Access: Public (tidak butuh authentication)
 */
router.post('/login', login);

/**
 * GET /api/auth/profile
 * Get profile user yang sedang login
 * Access: Private (butuh authentication)
 * Middleware: authMiddleware (verify JWT token)
 */
router.get('/profile', authMiddleware, getProfile);

export default router;

