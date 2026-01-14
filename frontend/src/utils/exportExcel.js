// ============================================
// FILE: exportExcel.js
// ============================================
// 
// DESKRIPSI:
// Utility untuk export data ke Excel menggunakan library XLSX
// 
// ALASAN PAKAI XLSX:
// - Library paling populer untuk export Excel di JavaScript
// - Support format .xlsx (Excel modern)
// - Bisa styling (header, width, colors)
// - Ringan dan cepat
// - Tidak perlu backend, pure frontend
//
// CARA KERJA:
// 1. Convert data JavaScript ke format Excel (worksheet)
// 2. Buat workbook (file Excel)
// 3. Download sebagai file .xlsx
//
// SYNTAX:
// import { exportToExcel } from './utils/exportExcel.js';
// exportToExcel(data, filename, headers);
//
// ============================================

import * as XLSX from 'xlsx';

/**
 * Export data ke Excel
 * 
 * @param {Array} data - Array of objects (data yang akan di-export)
 * @param {string} filename - Nama file (tanpa extension)
 * @param {Array} headers - Array of objects { key: 'field', label: 'Label' }
 * @param {string} sheetName - Nama sheet (default: 'Data')
 * 
 * CONTOH PENGGUNAAN:
 * const data = [
 *   { nama: 'Budi', nik: '1234567890123456', alamat: 'Jl. Raya' },
 *   { nama: 'Siti', nik: '1234567890123457', alamat: 'Jl. Merdeka' }
 * ];
 * 
 * const headers = [
 *   { key: 'nama', label: 'Nama Lengkap' },
 *   { key: 'nik', label: 'NIK' },
 *   { key: 'alamat', label: 'Alamat' }
 * ];
 * 
 * exportToExcel(data, 'Data Penduduk', headers);
 */
export const exportToExcel = (data, filename = 'export', headers = null, sheetName = 'Data') => {
  try {
    // Jika headers tidak diberikan, ambil dari keys object pertama
    if (!headers && data.length > 0) {
      headers = Object.keys(data[0]).map(key => ({
        key,
        label: key.charAt(0).toUpperCase() + key.slice(1), // Capitalize first letter
      }));
    }

    // Map data sesuai headers
    // ALASAN: Kita perlu urutkan kolom sesuai headers yang diberikan
    const mappedData = data.map(item => {
      const row = {};
      headers.forEach(header => {
        // Ambil value dari data, jika tidak ada pakai empty string
        row[header.label] = item[header.key] || '';
      });
      return row;
    });

    // Buat worksheet dari data
    // XLSX.utils.json_to_sheet() = Convert array of objects ke Excel worksheet
    const worksheet = XLSX.utils.json_to_sheet(mappedData);

    // Set column width (auto-width berdasarkan panjang data)
    // ALASAN: Supaya kolom tidak terlalu sempit/lebar
    const columnWidths = headers.map(header => {
      const maxLength = Math.max(
        header.label.length, // Panjang header
        ...mappedData.map(row => String(row[header.label] || '').length) // Panjang data terpanjang
      );
      return { wch: Math.min(maxLength + 2, 50) }; // Max width 50, min sesuai data
    });
    worksheet['!cols'] = columnWidths;

    // Style header (bold, background color)
    // ALASAN: Header harus menonjol supaya jelas
    const headerRange = XLSX.utils.decode_range(worksheet['!ref']);
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!worksheet[cellAddress]) continue;
      
      // Set style: bold
      worksheet[cellAddress].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: 'E0E0E0' } }, // Gray background
        alignment: { horizontal: 'center', vertical: 'center' },
      };
    }

    // Buat workbook (file Excel)
    // ALASAN: Excel file = workbook yang berisi 1 atau lebih worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Download file
    // XLSX.writeFile() = Generate file Excel dan trigger download
    XLSX.writeFile(workbook, `${filename}.xlsx`);

    return true;
  } catch (error) {
    console.error('Export Excel error:', error);
    throw new Error('Gagal export data ke Excel: ' + error.message);
  }
};

/**
 * Export data Penduduk ke Excel dengan format khusus
 * 
 * SYNTAX:
 * exportPendudukToExcel(pendudukData);
 */
export const exportPendudukToExcel = (pendudukData) => {
  const headers = [
    { key: 'nik', label: 'NIK' },
    { key: 'nama', label: 'Nama Lengkap' },
    { key: 'tempatLahir', label: 'Tempat Lahir' },
    { key: 'tanggalLahir', label: 'Tanggal Lahir' },
    { key: 'jenisKelamin', label: 'Jenis Kelamin' },
    { key: 'agama', label: 'Agama' },
    { key: 'pendidikan', label: 'Pendidikan' },
    { key: 'pekerjaan', label: 'Pekerjaan' },
    { key: 'statusPerkawinan', label: 'Status Perkawinan' },
    { key: 'alamat', label: 'Alamat' },
    { key: 'rt', label: 'RT' },
    { key: 'rw', label: 'RW' },
    { key: 'desa', label: 'Desa' },
    { key: 'kecamatan', label: 'Kecamatan' },
    { key: 'kabupaten', label: 'Kabupaten' },
    { key: 'provinsi', label: 'Provinsi' },
    { key: 'golonganDarah', label: 'Golongan Darah' },
    { key: 'statusKependudukan', label: 'Status Kependudukan' },
  ];

  // Format tanggal
  const formattedData = pendudukData.map(item => ({
    ...item,
    tanggalLahir: item.tanggalLahir 
      ? new Date(item.tanggalLahir).toLocaleDateString('id-ID')
      : '',
  }));

  return exportToExcel(formattedData, 'Data Penduduk', headers, 'Penduduk');
};

/**
 * Export data Kartu Keluarga ke Excel
 * 
 * SYNTAX:
 * exportKKToExcel(kkData);
 */
export const exportKKToExcel = (kkData) => {
  const headers = [
    { key: 'nomorKK', label: 'Nomor KK' },
    { key: 'kepalaKeluarga', label: 'Kepala Keluarga' },
    { key: 'alamat', label: 'Alamat' },
    { key: 'rt', label: 'RT' },
    { key: 'rw', label: 'RW' },
    { key: 'desa', label: 'Desa' },
    { key: 'kecamatan', label: 'Kecamatan' },
    { key: 'kabupaten', label: 'Kabupaten' },
    { key: 'provinsi', label: 'Provinsi' },
    { key: 'kodePos', label: 'Kode Pos' },
    { key: 'jumlahAnggota', label: 'Jumlah Anggota' },
  ];

  // Format data: extract nama kepala keluarga
  const formattedData = kkData.map(item => ({
    ...item,
    kepalaKeluarga: item.kepalaKeluarga?.nama || '',
    jumlahAnggota: item._count?.anggotaKeluarga || 0,
  }));

  return exportToExcel(formattedData, 'Data Kartu Keluarga', headers, 'Kartu Keluarga');
};

export default {
  exportToExcel,
  exportPendudukToExcel,
  exportKKToExcel,
};

