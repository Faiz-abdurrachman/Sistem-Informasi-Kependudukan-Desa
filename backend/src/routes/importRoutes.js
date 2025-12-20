// ============================================
// FILE: importRoutes.js
// ============================================
// 
// DESKRIPSI:
// Routes untuk import data dari file CSV
// Menggunakan Express Router dengan middleware authentication dan role-based access
//
// ALUR DATA:
// 1. Request → authMiddleware → roleMiddleware → upload middleware → Controller
// 2. Hanya ADMIN dan OPERATOR yang bisa import
//
// ALASAN DESAIN:
// - Protected routes: Semua route butuh authentication
// - RBAC: Hanya ADMIN dan OPERATOR yang bisa import
// - File upload: Menggunakan multer untuk handle file
//
// ROUTES:
// POST /api/import/penduduk - Import data penduduk dari CSV
//
// PENGGUNAAN:
// import importRoutes from './routes/importRoutes.js';
// app.use('/api/import', importRoutes);
//
// ============================================

import express from 'express';
import { importPenduduk, importKK, upload } from '../controllers/importController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';

const router = express.Router();

// Semua route butuh authentication dan role ADMIN atau OPERATOR
router.use(authMiddleware);
router.use(roleMiddleware(['ADMIN', 'OPERATOR']));

/**
 * POST /api/import/penduduk
 * Import data penduduk dari file CSV
 */
router.post('/penduduk', upload.single('file'), importPenduduk);

/**
 * POST /api/import/kk
 * Import data Kartu Keluarga dari file CSV
 */
router.post('/kk', upload.single('file'), importKK);

export default router;

