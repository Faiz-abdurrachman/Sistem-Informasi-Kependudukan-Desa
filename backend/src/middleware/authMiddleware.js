// ============================================
// FILE: authMiddleware.js
// ============================================
// 
// DESKRIPSI:
// Middleware untuk authentication menggunakan JWT
// Middleware ini memverifikasi token JWT dari request header
// dan menambahkan data user ke request object untuk digunakan di controller
//
// ALUR DATA:
// 1. Client kirim request dengan header: Authorization: Bearer <token>
// 2. Middleware extract token dari header
// 3. Verify token menggunakan verifyToken()
// 4. Jika valid, attach userId dan role ke req.user
// 5. Jika invalid, return 401 Unauthorized
//
// ALASAN DESAIN:
// - Reusable: bisa dipakai di semua route yang butuh auth
// - Secure: verify token sebelum akses route
// - Standard: menggunakan Bearer token format
// - Error handling: return error message yang jelas
//
// PENGGUNAAN:
// import authMiddleware from './middleware/authMiddleware.js';
// router.get('/protected', authMiddleware, controller);
//
// ============================================

import { verifyToken } from '../config/jwt.js';
import prisma from '../config/database.js';

/**
 * Middleware untuk memverifikasi JWT token
 * 
 * CARA KERJA:
 * 1. Extract token dari header Authorization
 * 2. Verify token menggunakan verifyToken()
 * 3. Cek apakah user masih aktif di database
 * 4. Attach user data ke req.user untuk digunakan di controller
 * 
 * FORMAT HEADER:
 * Authorization: Bearer <token>
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
const authMiddleware = async (req, res, next) => {
  try {
    // 1. Extract token dari header Authorization
    const authHeader = req.headers.authorization;

    // Cek apakah header Authorization ada
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Token tidak ditemukan. Silakan login terlebih dahulu.',
      });
    }

    // Extract token dari format "Bearer <token>"
    const token = authHeader.split(' ')[1]; // Split "Bearer <token>" dan ambil index 1

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Format token tidak valid. Gunakan format: Bearer <token>',
      });
    }

    // 2. Verify token
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: error.message || 'Token tidak valid atau telah kadaluarsa',
      });
    }

    // 3. Cek apakah user masih ada dan aktif di database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        nama: true,
        isActive: true,
      },
    });

    // Jika user tidak ditemukan
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User tidak ditemukan. Token mungkin sudah tidak valid.',
      });
    }

    // Jika user tidak aktif
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Akun Anda telah dinonaktifkan. Hubungi administrator.',
      });
    }

    // 4. Attach user data ke request object
    // Data ini bisa diakses di controller dengan req.user
    req.user = {
      id: user.id,
      userId: user.id, // Alias untuk konsistensi
      username: user.username,
      email: user.email,
      role: user.role,
      nama: user.nama,
    };

    // Lanjut ke middleware/controller berikutnya
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server saat memverifikasi token.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

export default authMiddleware;

