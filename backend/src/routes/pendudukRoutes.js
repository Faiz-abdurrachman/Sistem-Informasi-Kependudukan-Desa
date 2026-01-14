// ============================================
// FILE: pendudukRoutes.js
// ============================================
// 
// DESKRIPSI:
// Routes untuk CRUD data penduduk
// Menggunakan Express Router dengan middleware authentication dan role-based access
//
// ALUR DATA:
// 1. Request → authMiddleware (verify token) → roleMiddleware (cek role) → Controller
// 2. Hanya ADMIN dan OPERATOR yang bisa akses (PUBLIK tidak bisa)
//
// ALASAN DESAIN:
// - Protected routes: Semua route butuh authentication
// - RBAC: Hanya ADMIN dan OPERATOR yang bisa CRUD
// - RESTful: Mengikuti standar REST API
//
// ROUTES:
// GET /api/penduduk - Get semua penduduk (dengan pagination)
// GET /api/penduduk/:id - Get penduduk by ID
// POST /api/penduduk - Create penduduk baru
// PUT /api/penduduk/:id - Update penduduk
// DELETE /api/penduduk/:id - Delete penduduk
//
// PENGGUNAAN:
// import pendudukRoutes from './routes/pendudukRoutes.js';
// app.use('/api/penduduk', pendudukRoutes);
//
// ============================================

import express from 'express';
import {
  getAllPenduduk,
  getPendudukById,
  createPenduduk,
  updatePenduduk,
  deletePenduduk,
} from '../controllers/pendudukController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';

const router = express.Router();

// Semua route butuh authentication dan role ADMIN atau OPERATOR
router.use(authMiddleware);
router.use(roleMiddleware(['ADMIN', 'OPERATOR']));

/**
 * GET /api/penduduk
 * Get semua penduduk dengan pagination dan filter
 * Query params: page, limit, search, statusKependudukan
 */
router.get('/', getAllPenduduk);

/**
 * GET /api/penduduk/:id
 * Get penduduk by ID
 */
router.get('/:id', getPendudukById);

/**
 * POST /api/penduduk
 * Create penduduk baru
 */
router.post('/', createPenduduk);

/**
 * PUT /api/penduduk/:id
 * Update penduduk
 */
router.put('/:id', updatePenduduk);

/**
 * DELETE /api/penduduk/:id
 * Delete penduduk
 */
router.delete('/:id', deletePenduduk);

export default router;

