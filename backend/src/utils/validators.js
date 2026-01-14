// ============================================
// FILE: validators.js
// ============================================
// 
// DESKRIPSI:
// Utility functions untuk validasi data
// HUMAN TOUCH: Validasi NIK, KK, dan data kependudukan sesuai aturan resmi
//
// ALUR DATA:
// 1. Input data dari request
// 2. Validasi menggunakan fungsi-fungsi di file ini
// 3. Return true jika valid, throw error jika tidak valid
//
// ALASAN DESAIN:
// - Reusable: bisa dipakai di controller dan middleware
// - Centralized: semua validasi di 1 tempat
// - Human touch: validasi sesuai aturan resmi Indonesia
// - Clear error: pesan error jelas untuk user
//
// VALIDASI HUMAN TOUCH:
// - NIK: 16 digit, harus unique
// - KK: 16 digit, harus unique
// - Tanggal lahir: tidak boleh di masa depan
// - Umur: validasi berdasarkan tanggal lahir
//
// PENGGUNAAN:
// import { validateNIK, validateKK } from '../utils/validators.js';
// if (!validateNIK(nik)) throw new Error('NIK tidak valid');
//
// ============================================

/**
 * Validasi NIK (Nomor Induk Kependudukan)
 * 
 * RULES:
 * - Harus 16 digit angka
 * - Tidak boleh mengandung huruf atau karakter khusus
 * - Format: 16 digit angka
 * 
 * @param {string} nik - NIK yang akan divalidasi
 * @returns {boolean} true jika valid, false jika tidak valid
 * 
 * @example
 * validateNIK('3201010101010001') // true
 * validateNIK('320101010101000') // false (kurang 1 digit)
 * validateNIK('3201010101010001a') // false (ada huruf)
 */
export const validateNIK = (nik) => {
  if (!nik || typeof nik !== 'string') {
    return false;
  }

  // Hapus spasi jika ada
  const cleanNIK = nik.trim();

  // Cek panjang: harus 16 digit
  if (cleanNIK.length !== 16) {
    return false;
  }

  // Cek apakah semua karakter adalah angka
  const nikRegex = /^\d{16}$/;
  return nikRegex.test(cleanNIK);
};

/**
 * Validasi Nomor Kartu Keluarga (KK)
 * 
 * RULES:
 * - Harus 16 digit angka
 * - Tidak boleh mengandung huruf atau karakter khusus
 * - Format: 16 digit angka
 * 
 * @param {string} kk - Nomor KK yang akan divalidasi
 * @returns {boolean} true jika valid, false jika tidak valid
 * 
 * @example
 * validateKK('3201010101010002') // true
 * validateKK('32010101010100') // false (kurang digit)
 */
export const validateKK = (kk) => {
  if (!kk || typeof kk !== 'string') {
    return false;
  }

  // Hapus spasi jika ada
  const cleanKK = kk.trim();

  // Cek panjang: harus 16 digit
  if (cleanKK.length !== 16) {
    return false;
  }

  // Cek apakah semua karakter adalah angka
  const kkRegex = /^\d{16}$/;
  return kkRegex.test(cleanKK);
};

/**
 * Validasi tanggal lahir
 * 
 * RULES:
 * - Harus format tanggal yang valid
 * - Tidak boleh di masa depan
 * - Tidak boleh terlalu lama di masa lalu (misal > 150 tahun)
 * 
 * @param {Date|string} tanggalLahir - Tanggal lahir yang akan divalidasi
 * @returns {boolean} true jika valid, false jika tidak valid
 */
export const validateTanggalLahir = (tanggalLahir) => {
  if (!tanggalLahir) {
    return false;
  }

  const tanggal = new Date(tanggalLahir);
  const sekarang = new Date();
  const tahunLahir = tanggal.getFullYear();
  const tahunSekarang = sekarang.getFullYear();

  // Cek apakah tanggal valid
  if (isNaN(tanggal.getTime())) {
    return false;
  }

  // Cek apakah tanggal di masa depan
  if (tanggal > sekarang) {
    return false;
  }

  // Cek apakah umur tidak lebih dari 150 tahun (sanity check)
  if (tahunSekarang - tahunLahir > 150) {
    return false;
  }

  return true;
};

/**
 * Hitung umur dari tanggal lahir
 * 
 * @param {Date|string} tanggalLahir - Tanggal lahir
 * @returns {number} Umur dalam tahun
 */
export const calculateUmur = (tanggalLahir) => {
  if (!validateTanggalLahir(tanggalLahir)) {
    return null;
  }

  const lahir = new Date(tanggalLahir);
  const sekarang = new Date();
  let umur = sekarang.getFullYear() - lahir.getFullYear();
  const bulan = sekarang.getMonth() - lahir.getMonth();

  // Jika belum ulang tahun tahun ini, kurangi 1
  if (bulan < 0 || (bulan === 0 && sekarang.getDate() < lahir.getDate())) {
    umur--;
  }

  return umur;
};

/**
 * Validasi email
 * 
 * @param {string} email - Email yang akan divalidasi
 * @returns {boolean} true jika valid
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Validasi nomor telepon Indonesia
 * Format: 08xx atau +628xx
 * 
 * @param {string} phone - Nomor telepon
 * @returns {boolean} true jika valid
 */
export const validatePhone = (phone) => {
  if (!phone || typeof phone !== 'string') {
    return false;
  }

  const cleanPhone = phone.trim().replace(/\s/g, '');
  // Format: 08xx (10-13 digit) atau +628xx
  const phoneRegex = /^(\+62|62|0)[0-9]{9,13}$/;
  return phoneRegex.test(cleanPhone);
};

/**
 * Format NIK dengan spasi untuk readability (opsional)
 * Format: 32 01 01 01 01 01 0001
 * 
 * @param {string} nik - NIK 16 digit
 * @returns {string} NIK yang sudah diformat
 */
export const formatNIK = (nik) => {
  if (!validateNIK(nik)) {
    return nik; // Return as is jika tidak valid
  }

  // Format: XX XX XX XX XX XX XXXX
  return nik.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(\d{4})/, '$1 $2 $3 $4 $5 $6 $7');
};

/**
 * Format nomor KK dengan spasi untuk readability (opsional)
 * 
 * @param {string} kk - Nomor KK 16 digit
 * @returns {string} KK yang sudah diformat
 */
export const formatKK = (kk) => {
  if (!validateKK(kk)) {
    return kk; // Return as is jika tidak valid
  }

  // Format: XX XX XX XX XX XX XXXX
  return kk.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(\d{4})/, '$1 $2 $3 $4 $5 $6 $7');
};

