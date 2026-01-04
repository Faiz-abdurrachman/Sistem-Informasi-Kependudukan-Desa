// ============================================
// FILE: errorMessages.js
// ============================================
//
// DESKRIPSI:
// Utility untuk error messages yang lebih jelas dan user-friendly
// PHASE 5.3: Error messages yang lebih jelas
//
// ALASAN DESAIN:
// - User-friendly: Pesan error mudah dipahami user
// - Consistent: Format error message konsisten di seluruh aplikasi
// - Informative: Memberikan informasi yang cukup untuk troubleshooting
//
// PENGGUNAAN:
// import { formatError, getErrorMessage } from '../utils/errorMessages.js';
//
// ============================================

/**
 * Format error message untuk response
 * 
 * @param {Error} error - Error object
 * @param {string} defaultMessage - Default message jika error tidak dikenali
 * @param {Object} customMessages - Custom messages untuk error tertentu
 * @returns {Object} { message, details }
 */
export const formatError = (error, defaultMessage = 'Terjadi kesalahan pada server', customMessages = {}) => {
  // Custom messages (prioritas tertinggi)
  if (customMessages[error.code]) {
    return {
      message: customMessages[error.code],
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    };
  }

  // Prisma errors
  if (error.code) {
    switch (error.code) {
      case 'P2002':
        // Unique constraint violation
        const target = error.meta?.target || [];
        if (target.includes('nik')) {
          return {
            message: 'NIK sudah terdaftar. NIK harus unik dan tidak boleh duplikat.',
            details: 'Silakan gunakan NIK yang berbeda atau cek data yang sudah ada.',
          };
        }
        if (target.includes('nomorKK')) {
          return {
            message: 'Nomor Kartu Keluarga sudah terdaftar. Nomor KK harus unik.',
            details: 'Silakan gunakan nomor KK yang berbeda atau cek data yang sudah ada.',
          };
        }
        if (target.includes('username')) {
          return {
            message: 'Username sudah digunakan. Silakan pilih username lain.',
            details: 'Username harus unik. Coba gunakan username yang berbeda.',
          };
        }
        if (target.includes('email')) {
          return {
            message: 'Email sudah terdaftar. Silakan gunakan email lain.',
            details: 'Email harus unik. Jika email ini milik Anda, silakan login.',
          };
        }
        return {
          message: 'Data yang Anda masukkan sudah ada di sistem. Pastikan data unik.',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        };

      case 'P2003':
        // Foreign key constraint violation
        return {
          message: 'Data yang Anda pilih tidak valid atau tidak ditemukan.',
          details: 'Pastikan data yang Anda pilih sudah terdaftar di sistem.',
        };

      case 'P2025':
        // Record not found
        return {
          message: 'Data yang Anda cari tidak ditemukan.',
          details: 'Pastikan ID atau data yang Anda cari sudah benar.',
        };

      default:
        return {
          message: defaultMessage,
          details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        };
    }
  }

  // Validation errors
  if (error.name === 'ValidationError') {
    return {
      message: 'Data yang Anda masukkan tidak valid.',
      details: error.message || 'Silakan periksa kembali data yang Anda masukkan.',
    };
  }

  // Default
  return {
    message: error.message || defaultMessage,
    details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
  };
};

/**
 * Get user-friendly error message
 * 
 * @param {Error} error - Error object
 * @param {string} context - Context error (e.g., 'penduduk', 'kk', 'surat')
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (error, context = '') => {
  const formatted = formatError(error);

  // Add context if provided
  if (context) {
    return `${formatted.message} (${context})`;
  }

  return formatted.message;
};

/**
 * Common error messages untuk berbagai skenario
 */
export const ERROR_MESSAGES = {
  // Validation
  REQUIRED_FIELD: (field) => `Field ${field} wajib diisi.`,
  INVALID_FORMAT: (field) => `Format ${field} tidak valid.`,
  MIN_LENGTH: (field, min) => `${field} minimal ${min} karakter.`,
  MAX_LENGTH: (field, max) => `${field} maksimal ${max} karakter.`,

  // Data
  NOT_FOUND: (resource) => `Data ${resource} tidak ditemukan.`,
  ALREADY_EXISTS: (resource) => `Data ${resource} sudah ada di sistem.`,
  INVALID_ID: 'ID yang Anda masukkan tidak valid.',

  // Business Logic - Administrative Rules (WAJIB)
  PENDUDUK_AKTIF_MUST_HAVE_KK: 'Penduduk dengan status "Aktif" harus terdaftar di Kartu Keluarga. Silakan tambahkan penduduk ke KK terlebih dahulu, atau gunakan status "Belum Terdaftar di KK" jika belum memiliki KK.',
  PENDUDUK_AKTIF_CANNOT_CREATE_WITHOUT_KK: 'Tidak dapat membuat penduduk dengan status "Aktif" tanpa Kartu Keluarga. Penduduk aktif harus terdaftar di Kartu Keluarga. Silakan gunakan status "Belum Terdaftar di KK" atau "Pendatang Sementara" jika belum memiliki KK.',
  PENDUDUK_AKTIF_CANNOT_UPDATE_WITHOUT_KK: 'Tidak dapat mengubah status menjadi "Aktif". Penduduk harus terdaftar di Kartu Keluarga terlebih dahulu. Silakan tambahkan penduduk ke KK sebelum mengubah status menjadi "Aktif".',
  PENDUDUK_AKTIF_CANNOT_CREATE_SURAT: 'Tidak dapat membuat surat untuk penduduk ini. Penduduk dengan status "Aktif" harus terdaftar di Kartu Keluarga. Silakan daftarkan penduduk ke KK terlebih dahulu.',
  KEPALA_KELUARGA_CANNOT_BE_MEMBER: 'Kepala keluarga tidak boleh menjadi anggota Kartu Keluarga lain.',
  PENDUDUK_ALREADY_IN_KK: 'Penduduk sudah terdaftar sebagai anggota Kartu Keluarga lain.',
  ONE_PENDUDUK_ONE_KK: 'Penduduk ini sudah terdaftar di Kartu Keluarga lain. Satu penduduk aktif hanya dapat terdaftar di satu Kartu Keluarga. Jika ingin memindahkan, keluarkan dulu dari KK sebelumnya.',

  // Authentication
  UNAUTHORIZED: 'Anda tidak memiliki izin untuk mengakses resource ini.',
  FORBIDDEN: 'Akses ditolak. Role Anda tidak memiliki izin untuk melakukan aksi ini.',
  TOKEN_INVALID: 'Token tidak valid atau telah kadaluarsa. Silakan login kembali.',
  TOKEN_MISSING: 'Token tidak ditemukan. Silakan login terlebih dahulu.',

  // User
  USER_NOT_FOUND: 'User tidak ditemukan.',
  USER_INACTIVE: 'Akun Anda telah dinonaktifkan. Hubungi administrator.',
  CANNOT_DELETE_SELF: 'Tidak dapat menonaktifkan akun sendiri.',

  // Server
  INTERNAL_ERROR: 'Terjadi kesalahan pada server. Silakan coba lagi nanti.',
  DATABASE_ERROR: 'Terjadi kesalahan pada database. Silakan hubungi administrator.',
};

/**
 * Create error response object
 * 
 * @param {Object} res - Express response object
 * @param {Error} error - Error object
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {string} defaultMessage - Default message
 * @returns {Object} Error response
 */
export const sendErrorResponse = (res, error, statusCode = 500, defaultMessage = 'Terjadi kesalahan pada server') => {
  const formatted = formatError(error, defaultMessage);

  return res.status(statusCode).json({
    success: false,
    message: formatted.message,
    error: formatted.details,
  });
};

export default {
  formatError,
  getErrorMessage,
  ERROR_MESSAGES,
  sendErrorResponse,
};
