// ============================================
// FILE: trendRoutes.js
// ============================================
// 
// DESKRIPSI:
// Routes untuk trend & time series data
//
// ============================================

import express from 'express';
import { getPendudukTrend, getSuratTrend } from '../controllers/trendController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/trend/penduduk - Get trend pertumbuhan penduduk
router.get('/penduduk', authMiddleware, getPendudukTrend);

// GET /api/trend/surat - Get trend surat yang dibuat
router.get('/surat', authMiddleware, getSuratTrend);

export default router;

