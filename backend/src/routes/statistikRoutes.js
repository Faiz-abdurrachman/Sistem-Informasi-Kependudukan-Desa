// ============================================
// FILE: statistikRoutes.js
// ============================================
// 
// DESKRIPSI:
// Routes untuk statistik kependudukan
// Menggunakan Express Router dengan middleware authentication
//
// ALUR DATA:
// 1. Request → authMiddleware (verify token) → Controller
// 2. Semua role bisa akses (ADMIN, OPERATOR, PUBLIK)
//
// ALASAN DESAIN:
// - Protected routes: Semua route butuh authentication
// - Public access: Semua role bisa lihat statistik
// - RESTful: Mengikuti standar REST API
//
// ROUTES:
// GET /api/statistik - Get semua statistik
// GET /api/statistik/refresh - Refresh cache statistik (ADMIN, OPERATOR only)
//
// PENGGUNAAN:
// import statistikRoutes from './routes/statistikRoutes.js';
// app.use('/api/statistik', statistikRoutes);
//
// ============================================

import express from 'express';
import { getAllStatistik, refreshStatistik } from '../controllers/statistikController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';

const router = express.Router();

// Semua route butuh authentication
router.use(authMiddleware);

/**
 * GET /api/statistik
 * Get semua statistik kependudukan
 * Access: Semua role (ADMIN, OPERATOR, PUBLIK)
 * Query params: useCache (default: true)
 */
router.get('/', getAllStatistik);

/**
 * GET /api/statistik/refresh
 * Refresh cache statistik
 * Access: ADMIN, OPERATOR only
 */
router.get('/refresh', roleMiddleware(['ADMIN', 'OPERATOR']), refreshStatistik);

export default router;

