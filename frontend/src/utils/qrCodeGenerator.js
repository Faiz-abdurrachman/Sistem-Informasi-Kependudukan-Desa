// ============================================
// FILE: qrCodeGenerator.js
// ============================================
// 
// DESKRIPSI:
// Utility untuk generate QR Code menggunakan library qrcode
// 
// ALASAN PAKAI QRCODE:
// - Library populer untuk generate QR code di JavaScript
// - Support berbagai format (PNG, SVG, dll)
// - Ringan dan cepat
// - Tidak perlu backend
//
// CARA KERJA:
// 1. Generate QR code dari data (nomor surat, link verifikasi)
// 2. Convert ke data URL (base64)
// 3. Return sebagai image URL
//
// SYNTAX:
// import { generateQRCode } from './utils/qrCodeGenerator.js';
// const qrCodeUrl = await generateQRCode(data);
//
// ============================================

import QRCode from 'qrcode';

/**
 * Generate QR Code dari data
 * 
 * @param {string} data - Data yang akan di-encode ke QR code
 * @param {Object} options - Options untuk QR code (size, error correction, dll)
 * @returns {Promise<string>} Data URL (base64) untuk image QR code
 * 
 * ALASAN PARAMETER:
 * - data: String yang akan di-encode (bisa nomor surat, URL, dll)
 * - options: Customize size, error correction level, dll
 * 
 * CONTOH PENGGUNAAN:
 * const qrCodeUrl = await generateQRCode('001/SKD/2024');
 * // Returns: "data:image/png;base64,iVBORw0KGgoAAAANS..."
 */
export const generateQRCode = async (data, options = {}) => {
  try {
    // Default options
    const defaultOptions = {
      width: 200,              // Ukuran QR code (pixels)
      margin: 2,                // Margin (modules)
      color: {
        dark: '#000000',        // Warna dark (default: black)
        light: '#FFFFFF',       // Warna light (default: white)
      },
      errorCorrectionLevel: 'M', // Error correction level (L, M, Q, H)
      ...options,               // Override dengan options yang diberikan
    };

    // Generate QR code sebagai data URL (base64)
    // ALASAN: Data URL bisa langsung dipakai di <img src>
    const dataUrl = await QRCode.toDataURL(data, defaultOptions);
    
    return dataUrl;
  } catch (error) {
    console.error('Generate QR Code error:', error);
    throw new Error('Gagal generate QR code: ' + error.message);
  }
};

/**
 * Generate QR Code untuk surat
 * 
 * ALASAN:
 * - QR code berisi nomor surat dan link verifikasi
 * - Bisa di-scan untuk verifikasi keaslian surat
 * 
 * @param {Object} surat - Data surat
 * @returns {Promise<string>} Data URL untuk QR code
 * 
 * SYNTAX:
 * const qrCodeUrl = await generateSuratQRCode(suratData);
 */
export const generateSuratQRCode = async (surat) => {
  // Data yang di-encode ke QR code
  // Format: nomor_surat|link_verifikasi
  const qrData = JSON.stringify({
    nomorSurat: surat.nomorSurat,
    jenisSurat: surat.jenisSurat,
    tanggalSurat: surat.tanggalSurat,
    verifikasiUrl: `${window.location.origin}/verify/${surat.nomorSurat}`, // Link verifikasi
  });

  return await generateQRCode(qrData, {
    width: 150, // Ukuran lebih kecil untuk print di surat
  });
};

/**
 * Generate QR Code sebagai SVG (untuk print yang lebih jelas)
 * 
 * ALASAN:
 * - SVG lebih jelas saat print
 * - Tidak blur saat di-scale
 * 
 * @param {string} data - Data yang akan di-encode
 * @returns {Promise<string>} SVG string
 */
export const generateQRCodeSVG = async (data) => {
  try {
    const svgString = await QRCode.toString(data, {
      type: 'svg',
      width: 200,
      margin: 2,
    });
    return svgString;
  } catch (error) {
    console.error('Generate QR Code SVG error:', error);
    throw new Error('Gagal generate QR code SVG: ' + error.message);
  }
};

export default {
  generateQRCode,
  generateSuratQRCode,
  generateQRCodeSVG,
};

