// ============================================
// FILE: authController.js
// ============================================
// 
// DESKRIPSI:
// Controller untuk authentication (login, register, get profile)
// Menggunakan JWT untuk authentication dan bcrypt untuk hash password
//
// ALUR DATA:
// 1. Register: Input username, email, password → Hash password → Save ke DB → Return user
// 2. Login: Input username/email, password → Verify password → Generate JWT → Return token
// 3. Get Profile: Extract user dari req.user (dari authMiddleware) → Return user data
//
// ALASAN DESAIN:
// - Security: Password di-hash dengan bcrypt (salt rounds: 10)
// - JWT: Stateless authentication, tidak perlu session
// - Error handling: Pesan error jelas untuk user
// - Validation: Input validation menggunakan express-validator
//
// KEAMANAN:
// - Password tidak pernah dikembalikan ke client
// - JWT token expire dalam 7 hari
// - Password hash menggunakan bcrypt dengan salt
//
// PENGGUNAAN:
// POST /api/auth/register - Register user baru
// POST /api/auth/login - Login user
// GET /api/auth/profile - Get profile user (butuh auth)
//
// ============================================

import bcrypt from 'bcryptjs';
import prisma from '../config/database.js';
import { generateToken } from '../config/jwt.js';
import { validateEmail } from '../utils/validators.js';

/**
 * Register user baru
 * 
 * @route POST /api/auth/register
 * @access Public
 * 
 * @param {Object} req.body - Request body
 * @param {string} req.body.username - Username (unique)
 * @param {string} req.body.email - Email (unique)
 * @param {string} req.body.password - Password (min 6 karakter)
 * @param {string} req.body.nama - Nama lengkap
 * @param {string} req.body.role - Role (ADMIN, OPERATOR, PUBLIK) - default: PUBLIK
 * 
 * @returns {Object} { success, message, data: { user, token } }
 */
export const register = async (req, res) => {
  try {
    const { username, email, password, nama, role = 'PUBLIK' } = req.body;

    // Validasi input
    if (!username || !email || !password || !nama) {
      return res.status(400).json({
        success: false,
        message: 'Semua field wajib diisi: username, email, password, nama',
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
        message: 'Email sudah terdaftar. Silakan gunakan email lain atau login.',
      });
    }

    // Hash password dengan bcrypt (salt rounds: 10)
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

    // Generate JWT token
    const token = generateToken({
      userId: newUser.id,
      role: newUser.role,
    });

    return res.status(201).json({
      success: true,
      message: 'Registrasi berhasil. Silakan login untuk melanjutkan.',
      data: {
        user: newUser,
        token,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat registrasi. Silakan coba lagi.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Login user
 * 
 * @route POST /api/auth/login
 * @access Public
 * 
 * @param {Object} req.body - Request body
 * @param {string} req.body.username - Username atau email
 * @param {string} req.body.password - Password
 * 
 * @returns {Object} { success, message, data: { user, token } }
 */
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validasi input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username/email dan password wajib diisi',
      });
    }

    // Cari user by username atau email
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email: username },
        ],
      },
    });

    // Jika user tidak ditemukan
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Username/email atau password salah',
      });
    }

    // Cek apakah user aktif
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Akun Anda telah dinonaktifkan. Hubungi administrator.',
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Username/email atau password salah',
      });
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      role: user.role,
    });

    // Return user data (tanpa password)
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      nama: user.nama,
      role: user.role,
      isActive: user.isActive,
    };

    return res.status(200).json({
      success: true,
      message: 'Login berhasil',
      data: {
        user: userData,
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat login. Silakan coba lagi.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get profile user yang sedang login
 * 
 * @route GET /api/auth/profile
 * @access Private (butuh authentication)
 * 
 * @param {Object} req.user - User data dari authMiddleware
 * 
 * @returns {Object} { success, message, data: { user } }
 */
export const getProfile = async (req, res) => {
  try {
    // req.user sudah di-attach oleh authMiddleware
    const userId = req.user.id;

    // Get user data dari database (untuk memastikan data terbaru)
    const user = await prisma.user.findUnique({
      where: { id: userId },
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
        message: 'User tidak ditemukan',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile berhasil diambil',
      data: {
        user,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil profile. Silakan coba lagi.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

