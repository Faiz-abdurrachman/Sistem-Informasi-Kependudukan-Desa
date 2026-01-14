// ============================================
// FILE: kkRoutes.js
// ============================================
// 
// DESKRIPSI:
// Routes untuk CRUD data Kartu Keluarga (KK)
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
// GET /api/kk - Get semua KK (dengan pagination)
// GET /api/kk/:id - Get KK by ID dengan anggota keluarga
// POST /api/kk - Create KK baru
// PUT /api/kk/:id - Update KK
// DELETE /api/kk/:id - Delete KK
// POST /api/kk/:id/anggota - Tambah anggota keluarga
// DELETE /api/kk/:id/anggota/:anggotaId - Hapus anggota keluarga
//
// PENGGUNAAN:
// import kkRoutes from './routes/kkRoutes.js';
// app.use('/api/kk', kkRoutes);
//
// ============================================

import express from 'express';
import {
  getAllKK,
  getKKById,
  createKK,
  updateKK,
  deleteKK,
  addAnggotaKeluarga,
  removeAnggotaKeluarga,
} from '../controllers/kkController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';

const router = express.Router();

// Semua route butuh authentication dan role ADMIN atau OPERATOR
router.use(authMiddleware);
router.use(roleMiddleware(['ADMIN', 'OPERATOR']));

/**
 * GET /api/kk
 * Get semua Kartu Keluarga dengan pagination dan filter
 * Query params: page, limit, search
 */
router.get('/', getAllKK);

/**
 * GET /api/kk/:id
 * Get Kartu Keluarga by ID dengan detail lengkap
 */
router.get('/:id', getKKById);

/**
 * POST /api/kk
 * Create Kartu Keluarga baru
 */
router.post('/', createKK);

/**
 * PUT /api/kk/:id
 * Update Kartu Keluarga
 */
router.put('/:id', updateKK);

/**
 * DELETE /api/kk/:id
 * Delete Kartu Keluarga
 */
router.delete('/:id', deleteKK);

/**
 * POST /api/kk/:id/anggota
 * Tambah anggota keluarga ke Kartu Keluarga
 */
router.post('/:id/anggota', addAnggotaKeluarga);

/**
 * DELETE /api/kk/:id/anggota/:anggotaId
 * Hapus anggota keluarga dari Kartu Keluarga
 */
router.delete('/:id/anggota/:anggotaId', removeAnggotaKeluarga);

export default router;

