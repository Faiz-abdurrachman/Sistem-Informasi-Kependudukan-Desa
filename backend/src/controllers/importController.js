// ============================================
// FILE: importController.js
// ============================================
// 
// DESKRIPSI:
// Controller untuk import data dari file CSV
// Menggunakan multer untuk handle file upload
//
// ALUR DATA:
// 1. Upload file CSV → Save ke temporary folder
// 2. Parse dan validasi CSV
// 3. Import data ke database
// 4. Delete temporary file
// 5. Return hasil import
//
// ALASAN DESAIN:
// - File upload: Menggunakan multer untuk handle multipart/form-data
// - Validation: Validasi data sebelum import
// - Error handling: Report error untuk setiap baris yang gagal
// - Cleanup: Hapus temporary file setelah import
//
// PENGGUNAAN:
// POST /api/import/penduduk - Import data penduduk dari CSV
//
// ============================================

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { importPendudukFromCSV } from '../utils/csvParser.js';
import { importKKFromCSV } from '../utils/kkParser.js';

// Konfigurasi multer untuk upload file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'temp');
    
    // Buat folder jika belum ada
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `import-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// Filter file: terima CSV dan Excel
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const validExtensions = ['.csv', '.xlsx', '.xls'];
  const validMimeTypes = [
    'text/csv',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
  ];

  if (
    validExtensions.includes(ext) ||
    validMimeTypes.includes(file.mimetype)
  ) {
    cb(null, true);
  } else {
    cb(new Error('Hanya file CSV atau Excel yang diizinkan'), false);
  }
};

// Multer middleware
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
});

/**
 * Import data penduduk dari CSV
 * 
 * @route POST /api/import/penduduk
 * @access Private (ADMIN, OPERATOR bisa akses)
 * 
 * @param {File} req.file - File CSV yang akan diimport
 * 
 * @returns {Object} { success, message, data: { imported, failed, errors } }
 */
export const importPenduduk = async (req, res) => {
  let filePath = null;

  try {
    // Cek apakah file diupload
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'File CSV tidak ditemukan. Pastikan file diupload dengan field name "file".',
      });
    }

    filePath = req.file.path;

    // Import data dari CSV
    const result = await importPendudukFromCSV(filePath);

    // Hapus temporary file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Return hasil import
    const statusCode = result.success ? 200 : 400;
    return res.status(statusCode).json({
      success: result.success,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    console.error('Import penduduk error:', error);

    // Hapus temporary file jika ada
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat import data.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Import data Kartu Keluarga dari CSV
 * 
 * @route POST /api/import/kk
 * @access Private (ADMIN, OPERATOR bisa akses)
 * 
 * @param {File} req.file - File CSV yang akan diimport
 * 
 * @returns {Object} { success, message, data: { imported, failed, errors } }
 */
export const importKK = async (req, res) => {
  let filePath = null;

  try {
    // Cek apakah file diupload
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'File CSV tidak ditemukan. Pastikan file diupload dengan field name "file".',
      });
    }

    filePath = req.file.path;

    // Import data dari CSV
    const result = await importKKFromCSV(filePath);

    // Hapus temporary file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Return hasil import
    const statusCode = result.success ? 200 : 400;
    return res.status(statusCode).json({
      success: result.success,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    console.error('Import KK error:', error);

    // Hapus temporary file jika ada
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat import data.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

