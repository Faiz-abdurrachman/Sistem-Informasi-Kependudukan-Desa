// ============================================
// FILE: userController.js
// ============================================
//
// DESKRIPSI:
// Controller untuk CRUD user management (ADMIN only)
// PHASE 3.1: User Management Backend
//
// ALUR DATA:
// 1. List Users: Get semua user dengan pagination
// 2. Get User: Get user by ID
// 3. Create User: Create user baru (ADMIN only)
// 4. Update User: Update user (termasuk role)
// 5. Delete User: Soft delete (set isActive = false)
// 6. Reset Password: Reset password user
//
// ALASAN DESAIN:
// - Hanya ADMIN yang bisa manage user
// - Soft delete untuk menjaga data history
// - Validasi role dan email/username unique
// - Password di-hash dengan bcrypt
//
// VALIDASI:
// - Hanya ADMIN yang bisa akses semua endpoint
// - Validasi role (ADMIN, OPERATOR, PUBLIK)
// - Validasi username/email unique
// - Password minimal 6 karakter
//
// PENGGUNAAN:
// GET /api/users - List users (ADMIN only)
// GET /api/users/:id - Get user by ID (ADMIN only)
// POST /api/users - Create user (ADMIN only)
// PUT /api/users/:id - Update user (ADMIN only)
// DELETE /api/users/:id - Soft delete user (ADMIN only)
// PATCH /api/users/:id/reset-password - Reset password (ADMIN only)
//
// ============================================

import bcrypt from 'bcryptjs';
import prisma from '../config/database.js';
import { validateEmail } from '../utils/validators.js';
import { logActivity, formatDataForAudit } from '../services/auditLogService.js';

/**
 * Get semua user dengan pagination dan filter
 *
 * @route GET /api/users
 * @access Private (ADMIN only)
 *
 * @query {number} page - Halaman (default: 1)
 * @query {number} limit - Jumlah data per halaman (default: 10)
 * @query {string} search - Search by username, email, atau nama
 * @query {string} role - Filter by role (ADMIN, OPERATOR, PUBLIK)
 * @query {boolean} isActive - Filter by status aktif
 *
 * @returns {Object} { success, message, data: { users, pagination } }
 */
export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const role = req.query.role;
    const isActive = req.query.isActive;

    // Build where clause untuk filter
    const where = {};

    // Filter by search (username, email, atau nama)
    if (search) {
      where.OR = [
        { username: { contains: search } },
        { email: { contains: search } },
        { nama: { contains: search } },
      ];
    }

    // Filter by role
    if (role) {
      where.role = role;
    }

    // Filter by isActive
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    // Get users dengan pagination
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          username: true,
          email: true,
          nama: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return res.status(200).json({
      success: true,
      message: 'Data user berhasil diambil',
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage,
          hasPrevPage,
        },
      },
    });
  } catch (error) {
    console.error('Get all users error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data user.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get user by ID
 *
 * @route GET /api/users/:id
 * @access Private (ADMIN only)
 *
 * @param {number} req.params.id - ID user
 *
 * @returns {Object} { success, message, data: { user } }
 */
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        username: true,
        email: true,
        nama: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Data user tidak ditemukan',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Data user berhasil diambil',
      data: {
        user,
      },
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data user.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Create user baru
 *
 * @route POST /api/users
 * @access Private (ADMIN only)
 *
 * @param {Object} req.body - Data user
 * @param {string} req.body.username - Username (unique)
 * @param {string} req.body.email - Email (unique)
 * @param {string} req.body.password - Password (min 6 karakter)
 * @param {string} req.body.nama - Nama lengkap
 * @param {string} req.body.role - Role (ADMIN, OPERATOR, PUBLIK)
 *
 * @returns {Object} { success, message, data: { user } }
 */
export const createUser = async (req, res) => {
  try {
    const { username, email, password, nama, role = 'OPERATOR' } = req.body;

    // Validasi field wajib
    if (!username || !email || !password || !nama) {
      return res.status(400).json({
        success: false,
        message: 'Field wajib: username, email, password, nama',
      });
    }

    // Validasi email format
    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Format email tidak valid',
      });
    }

    // Validasi password minimal 6 karakter
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password minimal 6 karakter',
      });
    }

    // Validasi role
    const validRoles = ['ADMIN', 'OPERATOR', 'PUBLIK'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Role tidak valid. Pilih salah satu: ${validRoles.join(', ')}`,
      });
    }

    // Cek apakah username sudah ada
    const existingUserByUsername = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUserByUsername) {
      return res.status(400).json({
        success: false,
        message: 'Username sudah digunakan. Silakan pilih username lain.',
      });
    }

    // Cek apakah email sudah ada
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUserByEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email sudah terdaftar. Silakan gunakan email lain.',
      });
    }

    // Hash password dengan bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user baru
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        nama,
        role,
        isActive: true,
      },
      select: {
        id: true,
        username: true,
        email: true,
        nama: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    // WAJIB PEMERINTAH: Audit Log - Catat aktivitas CREATE
    const userId = req.user?.id;
    if (userId) {
      await logActivity(
        userId,
        'CREATE',
        'User',
        newUser.id,
        null, // beforeData (tidak ada karena CREATE)
        formatDataForAudit(newUser, 'User'), // afterData
        req,
        `Membuat user baru: ${newUser.username} (Role: ${newUser.role})`
      );
    }

    return res.status(201).json({
      success: true,
      message: 'User berhasil ditambahkan',
      data: {
        user: newUser,
      },
    });
  } catch (error) {
    console.error('Create user error:', error);

    // Handle Prisma unique constraint error
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'Username atau email sudah terdaftar.',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menambahkan user.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Update user
 *
 * @route PUT /api/users/:id
 * @access Private (ADMIN only)
 *
 * @param {number} req.params.id - ID user
 * @param {Object} req.body - Data user yang akan di-update
 *
 * @returns {Object} { success, message, data: { user } }
 */
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Cek apakah user ada (dengan select untuk menghindari password)
    const existingUser = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        username: true,
        email: true,
        nama: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'Data user tidak ditemukan',
      });
    }

    // Validasi email format jika di-update
    if (updateData.email && !validateEmail(updateData.email)) {
      return res.status(400).json({
        success: false,
        message: 'Format email tidak valid',
      });
    }

    // Validasi role jika di-update
    if (updateData.role) {
      const validRoles = ['ADMIN', 'OPERATOR', 'PUBLIK'];
      if (!validRoles.includes(updateData.role)) {
        return res.status(400).json({
          success: false,
          message: `Role tidak valid. Pilih salah satu: ${validRoles.join(', ')}`,
        });
      }
    }

    // Cek apakah username sudah digunakan (jika di-update)
    if (updateData.username && updateData.username !== existingUser.username) {
      const usernameExists = await prisma.user.findUnique({
        where: { username: updateData.username },
      });

      if (usernameExists) {
        return res.status(400).json({
          success: false,
          message: 'Username sudah digunakan. Silakan pilih username lain.',
        });
      }
    }

    // Cek apakah email sudah digunakan (jika di-update)
    if (updateData.email && updateData.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: updateData.email },
      });

      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email sudah terdaftar. Silakan gunakan email lain.',
        });
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        nama: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });

    // WAJIB PEMERINTAH: Audit Log - Catat aktivitas UPDATE
    const userId = req.user?.id;
    if (userId) {
      await logActivity(
        userId,
        'UPDATE',
        'User',
        parseInt(id),
        formatDataForAudit(existingUser, 'User'), // beforeData
        formatDataForAudit(updatedUser, 'User'), // afterData
        req,
        `Mengupdate user: ${updatedUser.username} (Role: ${updatedUser.role})`
      );
    }

    return res.status(200).json({
      success: true,
      message: 'User berhasil diupdate',
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    console.error('Update user error:', error);

    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'Username atau email sudah terdaftar.',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengupdate user.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Delete user (soft delete - set isActive = false)
 *
 * @route DELETE /api/users/:id
 * @access Private (ADMIN only)
 *
 * @param {number} req.params.id - ID user
 *
 * @returns {Object} { success, message }
 */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Cek apakah user ada (dengan select untuk menghindari password)
    const existingUser = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        username: true,
        email: true,
        nama: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'Data user tidak ditemukan',
      });
    }

    // Cek apakah user yang akan dihapus adalah user yang sedang login
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Tidak dapat menonaktifkan akun sendiri.',
      });
    }

    // WAJIB PEMERINTAH: Audit Log - Catat aktivitas DELETE (soft delete)
    const userId = req.user?.id;
    if (userId) {
      // Get updated user data untuk afterData
      const updatedUserAfterSoftDelete = {
        ...existingUser,
        isActive: false,
      };
      
      await logActivity(
        userId,
        'DELETE',
        'User',
        parseInt(id),
        formatDataForAudit(existingUser, 'User'), // beforeData
        formatDataForAudit(updatedUserAfterSoftDelete, 'User'), // afterData (soft delete: isActive = false)
        req,
        `Menonaktifkan user: ${existingUser.username} (Soft Delete)`
      );
    }

    // Soft delete (set isActive = false)
    await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        isActive: false,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'User berhasil dinonaktifkan',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menonaktifkan user.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Reset password user
 *
 * @route PATCH /api/users/:id/reset-password
 * @access Private (ADMIN only)
 *
 * @param {number} req.params.id - ID user
 * @param {Object} req.body - Request body
 * @param {string} req.body.newPassword - Password baru (min 6 karakter)
 *
 * @returns {Object} { success, message }
 */
export const resetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    // Validasi input
    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Field wajib: newPassword',
      });
    }

    // Validasi password minimal 6 karakter
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password minimal 6 karakter',
      });
    }

    // Cek apakah user ada
    const existingUser = await prisma.user.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'Data user tidak ditemukan',
      });
    }

    // Hash password baru
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        password: hashedPassword,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Password berhasil direset',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat reset password.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
