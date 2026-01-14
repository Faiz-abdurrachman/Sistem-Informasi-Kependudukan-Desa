// ============================================
// FILE: userRoutes.js
// ============================================
//
// DESKRIPSI:
// Routes untuk user management (ADMIN only)
// PHASE 3.1: User Management Backend
//
// ALUR DATA:
// 1. Request → authMiddleware (verify token) → roleMiddleware (cek ADMIN) → Controller
// 2. Hanya ADMIN yang bisa akses semua route
//
// ALASAN DESAIN:
// - Protected routes: Semua route butuh authentication
// - RBAC: Hanya ADMIN yang bisa manage user
// - RESTful: Mengikuti standar REST API
//
// ROUTES:
// GET /api/users - Get semua user (dengan pagination)
// GET /api/users/:id - Get user by ID
// POST /api/users - Create user baru
// PUT /api/users/:id - Update user
// DELETE /api/users/:id - Soft delete user (set isActive = false)
// PATCH /api/users/:id/reset-password - Reset password user
//
// PENGGUNAAN:
// import userRoutes from './routes/userRoutes.js';
// app.use('/api/users', userRoutes);
//
// ============================================

import express from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  resetPassword,
} from '../controllers/userController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';

const router = express.Router();

// Semua route butuh authentication dan role ADMIN
router.use(authMiddleware);
router.use(roleMiddleware(['ADMIN']));

/**
 * GET /api/users
 * Get semua user dengan pagination dan filter
 * Query params: page, limit, search, role, isActive
 */
router.get('/', getAllUsers);

/**
 * GET /api/users/:id
 * Get user by ID
 */
router.get('/:id', getUserById);

/**
 * POST /api/users
 * Create user baru
 */
router.post('/', createUser);

/**
 * PUT /api/users/:id
 * Update user
 */
router.put('/:id', updateUser);

/**
 * DELETE /api/users/:id
 * Soft delete user (set isActive = false)
 */
router.delete('/:id', deleteUser);

/**
 * PATCH /api/users/:id/reset-password
 * Reset password user
 */
router.patch('/:id/reset-password', resetPassword);

export default router;
