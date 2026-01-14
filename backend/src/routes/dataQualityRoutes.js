// ============================================
// FILE: dataQualityRoutes.js
// ============================================
//
// DESKRIPSI:
// Routes untuk data quality warnings
// PHASE 3.1: Data Quality Warning System
//
// ALUR DATA:
// 1. Request → authMiddleware (verify token) → roleMiddleware (cek role) → Controller
// 2. Hanya ADMIN dan OPERATOR yang bisa akses
//
// ALASAN DESAIN:
// - Protected routes: Semua route butuh authentication
// - RBAC: Hanya ADMIN dan OPERATOR yang bisa akses
// - RESTful: Mengikuti standar REST API
//
// ROUTES:
// GET /api/data-quality/warnings - Get semua data quality warnings
//
// PENGGUNAAN:
// import dataQualityRoutes from './routes/dataQualityRoutes.js';
// app.use('/api/data-quality', dataQualityRoutes);
//
// ============================================

import express from 'express';
import { getDataQualityWarnings } from '../controllers/dataQualityController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';

const router = express.Router();

// Semua route butuh authentication dan role ADMIN atau OPERATOR
router.use(authMiddleware);
router.use(roleMiddleware(['ADMIN', 'OPERATOR']));

/**
 * GET /api/data-quality/warnings
 * Get semua data quality warnings
 */
router.get('/warnings', getDataQualityWarnings);

export default router;

