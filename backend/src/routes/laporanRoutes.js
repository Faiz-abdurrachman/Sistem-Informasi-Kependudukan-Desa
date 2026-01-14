// ============================================
// FILE: laporanRoutes.js
// ============================================
//
// DESKRIPSI:
// Routes untuk laporan rekap penduduk dan surat
// PHASE 4.1 & 4.2: Laporan Backend
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
// GET /api/laporan/penduduk/rekap - Rekap penduduk
// GET /api/laporan/surat/rekap - Rekap surat
//
// PENGGUNAAN:
// import laporanRoutes from './routes/laporanRoutes.js';
// app.use('/api/laporan', laporanRoutes);
//
// ============================================

import express from 'express';
import { getRekapPenduduk, getRekapSurat } from '../controllers/laporanController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';

const router = express.Router();

// Semua route butuh authentication dan role ADMIN atau OPERATOR
router.use(authMiddleware);
router.use(roleMiddleware(['ADMIN', 'OPERATOR']));

/**
 * GET /api/laporan/penduduk/rekap
 * Get rekap penduduk dengan grouping
 * Query params: rt, rw, statusKependudukan, usiaMin, usiaMax, jenisKelamin, agama, pendidikan
 */
router.get('/penduduk/rekap', getRekapPenduduk);

/**
 * GET /api/laporan/surat/rekap
 * Get rekap surat dengan grouping
 * Query params: jenisSurat, tanggalDari, tanggalSampai, userId, status
 */
router.get('/surat/rekap', getRekapSurat);

export default router;
