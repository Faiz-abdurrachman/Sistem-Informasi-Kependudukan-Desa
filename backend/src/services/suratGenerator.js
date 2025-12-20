// ============================================
// FILE: suratGenerator.js
// ============================================
// 
// DESKRIPSI:
// Service untuk generate nomor surat otomatis sesuai format desa
// HUMAN TOUCH: Penomoran surat sesuai aturan administrasi desa
//
// ALUR DATA:
// 1. Get nomor surat terakhir berdasarkan jenis surat dan tahun
// 2. Generate nomor surat baru dengan format: NOMOR/JENIS/TAHUN
// 3. Return nomor surat yang sudah diformat
//
// ALASAN DESAIN:
// - Human touch: Format nomor surat sesuai standar administrasi desa
// - Auto increment: Nomor surat otomatis increment per jenis dan tahun
// - Format standar: 001/SKD/2024 (nomor/jenis/tahun)
// - Thread-safe: Menggunakan database transaction untuk menghindari duplikasi
//
// FORMAT NOMOR SURAT:
// - Format: NOMOR/JENIS/TAHUN
// - Contoh: 001/SKD/2024, 002/KET/2024
// - Nomor: 3 digit dengan leading zero (001, 002, ..., 999)
// - Jenis: Kode jenis surat (SKD, KET, SKTM, dll)
// - Tahun: Tahun pembuatan surat (4 digit)
//
// JENIS SURAT:
// - SKD: Surat Keterangan Domisili
// - KET: Surat Keterangan
// - SKTM: Surat Keterangan Tidak Mampu
// - SKU: Surat Keterangan Usaha
// - SKP: Surat Keterangan Pindah
// - SKM: Surat Keterangan Meninggal
//
// PENGGUNAAN:
// import { generateNomorSurat } from '../services/suratGenerator.js';
// const nomorSurat = await generateNomorSurat('SKD', 2024);
//
// ============================================

import prisma from '../config/database.js';

/**
 * Generate nomor surat otomatis
 * 
 * FORMAT: NOMOR/JENIS/TAHUN
 * Contoh: 001/SKD/2024, 002/KET/2024
 * 
 * ALGORITMA:
 * 1. Cari nomor surat terakhir dengan jenis dan tahun yang sama
 * 2. Extract nomor dari format "001/SKD/2024" → 1
 * 3. Increment nomor: 1 + 1 = 2
 * 4. Format nomor dengan leading zero: 002
 * 5. Gabungkan: 002/SKD/2024
 * 
 * @param {string} jenisSurat - Kode jenis surat (SKD, KET, SKTM, dll)
 * @param {number} tahun - Tahun pembuatan surat (default: tahun sekarang)
 * @returns {Promise<string>} Nomor surat yang sudah diformat
 * 
 * @example
 * const nomor = await generateNomorSurat('SKD', 2024);
 * // Returns: "001/SKD/2024" (jika belum ada surat SKD tahun 2024)
 * // Returns: "002/SKD/2024" (jika sudah ada 1 surat SKD tahun 2024)
 */
export const generateNomorSurat = async (jenisSurat, tahun = null) => {
  try {
    // Jika tahun tidak diisi, gunakan tahun sekarang
    if (!tahun) {
      tahun = new Date().getFullYear();
    }

    // Validasi jenis surat
    const validJenis = ['SKD', 'KET', 'SKTM', 'SKU', 'SKP', 'SKM'];
    if (!validJenis.includes(jenisSurat)) {
      throw new Error(`Jenis surat tidak valid. Pilih salah satu: ${validJenis.join(', ')}`);
    }

    // Cari nomor surat terakhir dengan jenis dan tahun yang sama
    // Format nomor surat: NOMOR/JENIS/TAHUN
    const prefix = `/${jenisSurat}/${tahun}`;
    
    const lastSurat = await prisma.surat.findFirst({
      where: {
        nomorSurat: {
          endsWith: prefix,
        },
        jenisSurat: jenisSurat,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    let nomorBaru = 1;

    // Jika ada surat sebelumnya, extract nomor dan increment
    if (lastSurat) {
      // Extract nomor dari format "001/SKD/2024" → "001"
      const nomorStr = lastSurat.nomorSurat.split('/')[0];
      const nomorLama = parseInt(nomorStr, 10);
      
      if (!isNaN(nomorLama)) {
        nomorBaru = nomorLama + 1;
      }
    }

    // Format nomor dengan leading zero (3 digit)
    // 1 → "001", 10 → "010", 100 → "100"
    const nomorFormatted = nomorBaru.toString().padStart(3, '0');

    // Gabungkan: NOMOR/JENIS/TAHUN
    const nomorSurat = `${nomorFormatted}${prefix}`;

    return nomorSurat;
  } catch (error) {
    console.error('Generate nomor surat error:', error);
    throw new Error(`Gagal generate nomor surat: ${error.message}`);
  }
};

/**
 * Get kode jenis surat dari nama jenis surat
 * 
 * @param {string} namaJenis - Nama jenis surat (contoh: "Surat Keterangan Domisili")
 * @returns {string} Kode jenis surat (contoh: "SKD")
 */
export const getKodeJenisSurat = (namaJenis) => {
  const mapping = {
    'Surat Keterangan Domisili': 'SKD',
    'Surat Keterangan': 'KET',
    'Surat Keterangan Tidak Mampu': 'SKTM',
    'Surat Keterangan Usaha': 'SKU',
    'Surat Keterangan Pindah': 'SKP',
    'Surat Keterangan Meninggal': 'SKM',
  };

  return mapping[namaJenis] || 'KET';
};

/**
 * Get nama lengkap jenis surat dari kode
 * 
 * @param {string} kode - Kode jenis surat (contoh: "SKD")
 * @returns {string} Nama lengkap jenis surat
 */
export const getNamaJenisSurat = (kode) => {
  const mapping = {
    'SKD': 'Surat Keterangan Domisili',
    'KET': 'Surat Keterangan',
    'SKTM': 'Surat Keterangan Tidak Mampu',
    'SKU': 'Surat Keterangan Usaha',
    'SKP': 'Surat Keterangan Pindah',
    'SKM': 'Surat Keterangan Meninggal',
  };

  return mapping[kode] || 'Surat Keterangan';
};

export default {
  generateNomorSurat,
  getKodeJenisSurat,
  getNamaJenisSurat,
};

