// ============================================
// FILE: roleMiddleware.js
// ============================================
// 
// DESKRIPSI:
// Middleware untuk Role-Based Access Control (RBAC)
// Middleware ini memeriksa apakah user memiliki role yang diizinkan
// untuk mengakses route tertentu
//
// ALUR DATA:
// 1. authMiddleware sudah attach req.user dengan role
// 2. roleMiddleware cek apakah req.user.role ada di allowedRoles
// 3. Jika ya, lanjut ke controller
// 4. Jika tidak, return 403 Forbidden
//
// ALASAN DESAIN:
// - RBAC: kontrol akses berdasarkan role
// - Flexible: bisa allow multiple roles dalam 1 route
// - Secure: double check role setelah authentication
// - Clear error: pesan error jelas untuk user
//
// ROLE HIERARKI:
// - ADMIN: Full access (manage user, CRUD semua data)
// - OPERATOR: CRUD data penduduk, KK, surat (tidak bisa manage user)
// - PUBLIK: Read only (hanya lihat data publik)
//
// PENGGUNAAN:
// import roleMiddleware from './middleware/roleMiddleware.js';
// router.post('/admin-only', authMiddleware, roleMiddleware(['ADMIN']), controller);
// router.get('/operator', authMiddleware, roleMiddleware(['ADMIN', 'OPERATOR']), controller);
//
// ============================================

/**
 * Middleware untuk memeriksa role user
 * 
 * CATATAN PENTING:
 * - Middleware ini HARUS dipanggil SETELAH authMiddleware
 * - authMiddleware sudah attach req.user dengan role
 * 
 * @param {string[]} allowedRoles - Array role yang diizinkan mengakses route
 * @returns {Function} Express middleware function
 * 
 * @example
 * // Hanya ADMIN yang bisa akses
 * router.post('/users', authMiddleware, roleMiddleware(['ADMIN']), createUser);
 * 
 * @example
 * // ADMIN dan OPERATOR bisa akses
 * router.post('/penduduk', authMiddleware, roleMiddleware(['ADMIN', 'OPERATOR']), createPenduduk);
 */
const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    try {
      // Cek apakah req.user sudah ada (harus dipanggil setelah authMiddleware)
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required. Pastikan authMiddleware dipanggil terlebih dahulu.',
        });
      }

      // Cek apakah user role ada di allowedRoles
      const userRole = req.user.role;

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: `Akses ditolak. Role '${userRole}' tidak memiliki izin untuk mengakses resource ini. Role yang diizinkan: ${allowedRoles.join(', ')}`,
        });
      }

      // User memiliki role yang diizinkan, lanjut ke controller
      next();
    } catch (error) {
      console.error('Role middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan pada server saat memeriksa izin akses.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  };
};

/**
 * Helper function untuk cek apakah user adalah ADMIN
 * Bisa digunakan di controller untuk conditional logic
 * 
 * @param {Object} user - User object dari req.user
 * @returns {boolean} true jika user adalah ADMIN
 */
export const isAdmin = (user) => {
  return user && user.role === 'ADMIN';
};

/**
 * Helper function untuk cek apakah user adalah OPERATOR atau ADMIN
 * 
 * @param {Object} user - User object dari req.user
 * @returns {boolean} true jika user adalah OPERATOR atau ADMIN
 */
export const isOperatorOrAdmin = (user) => {
  return user && (user.role === 'OPERATOR' || user.role === 'ADMIN');
};

export default roleMiddleware;

