// ============================================
// FILE: suratRoutes.js
// ============================================
// 
// DESKRIPSI:
// Routes untuk CRUD data surat administrasi desa
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
// GET /api/surat - Get semua surat (dengan pagination)
// GET /api/surat/:id - Get surat by ID
// POST /api/surat - Create surat baru
// PUT /api/surat/:id - Update surat
// PATCH /api/surat/:id/status - Update status surat
// DELETE /api/surat/:id - Delete surat
//
// PENGGUNAAN:
// import suratRoutes from './routes/suratRoutes.js';
// app.use('/api/surat', suratRoutes);
//
// ============================================

import express from 'express';
import {
  getAllSurat,
  getSuratById,
  createSurat,
  updateSurat,
  updateStatusSurat,
  deleteSurat,
} from '../controllers/suratController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';

const router = express.Router();

// Semua route butuh authentication dan role ADMIN atau OPERATOR
router.use(authMiddleware);
router.use(roleMiddleware(['ADMIN', 'OPERATOR']));

/**
 * GET /api/surat
 * Get semua surat dengan pagination dan filter
 * Query params: page, limit, search, jenisSurat, status
 */
router.get('/', getAllSurat);

/**
 * GET /api/surat/:id
 * Get surat by ID
 */
router.get('/:id', getSuratById);

/**
 * POST /api/surat
 * Create surat baru
 */
router.post('/', createSurat);

/**
 * PUT /api/surat/:id
 * Update surat
 */
router.put('/:id', updateSurat);

/**
 * PATCH /api/surat/:id/status
 * Update status surat
 */
router.patch('/:id/status', updateStatusSurat);

/**
 * DELETE /api/surat/:id
 * Delete surat
 */
router.delete('/:id', deleteSurat);

export default router;

