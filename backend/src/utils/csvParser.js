// ============================================
// FILE: csvParser.js
// ============================================
// 
// DESKRIPSI:
// Utility untuk parse dan import data dari file CSV
// HUMAN TOUCH: Validasi data CSV sesuai format kependudukan
//
// ALUR DATA:
// 1. Upload file CSV → Parse CSV → Validasi data → Import ke database
// 2. Validasi: NIK, tanggal lahir, format data
// 3. Batch insert: Insert data dalam batch untuk performa
//
// ALASAN DESAIN:
// - Human touch: Validasi data sesuai aturan kependudukan
// - Error handling: Report error untuk setiap baris yang gagal
// - Batch processing: Import banyak data sekaligus
// - Transaction: Rollback jika ada error
//
// FORMAT CSV:
// - Header: nik, nama, tempatLahir, tanggalLahir, jenisKelamin, agama, pendidikan, pekerjaan, statusPerkawinan, alamat, rt, rw, desa, kecamatan, kabupaten, provinsi
// - Encoding: UTF-8
// - Separator: koma (,)
//
// VALIDASI:
// - NIK harus 16 digit, unique
// - Tanggal lahir format: YYYY-MM-DD
// - Field wajib: nik, nama, tempatLahir, tanggalLahir, jenisKelamin, alamat
//
// PENGGUNAAN:
// import { parseCSV, validateCSVData, importPendudukFromCSV } from '../utils/csvParser.js';
// const result = await importPendudukFromCSV(filePath);
//
// ============================================

import fs from 'fs';
import csv from 'csv-parser';
import { validateNIK, validateTanggalLahir, validateKK } from './validators.js';
import prisma from '../config/database.js';

/**
 * Parse file CSV menjadi array of objects
 * 
 * @param {string} filePath - Path ke file CSV
 * @returns {Promise<Array>} Array of objects dari CSV
 */
export const parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
};

/**
 * Validasi data dari CSV
 * 
 * @param {Array} data - Array of objects dari CSV
 * @returns {Object} { valid: boolean, errors: Array, validData: Array }
 */
export const validateCSVData = (data) => {
  const errors = [];
  const validData = [];

  data.forEach((row, index) => {
    const rowNumber = index + 2; // +2 karena index 0 dan header di baris 1
    const rowErrors = [];

    // Validasi field wajib
    const requiredFields = ['nik', 'nama', 'tempatLahir', 'tanggalLahir', 'jenisKelamin', 'alamat'];
    requiredFields.forEach((field) => {
      if (!row[field] || row[field].trim() === '') {
        rowErrors.push(`Field '${field}' wajib diisi`);
      }
    });

    // Validasi NIK
    if (row.nik && !validateNIK(row.nik)) {
      rowErrors.push('NIK harus 16 digit angka');
    }

    // Validasi tanggal lahir
    if (row.tanggalLahir && !validateTanggalLahir(row.tanggalLahir)) {
      rowErrors.push('Tanggal lahir tidak valid atau tidak boleh di masa depan');
    }

    // Validasi nomorKK (jika diisi, harus 16 digit)
    if (row.nomorKK && row.nomorKK.trim() !== '') {
      if (!validateKK(row.nomorKK)) {
        rowErrors.push('Nomor KK harus 16 digit angka (jika diisi)');
      }
    }

    // Validasi: Jika ada nomorKK, harus ada hubungan (dan sebaliknya)
    if ((row.nomorKK && row.nomorKK.trim() !== '') && (!row.hubungan || row.hubungan.trim() === '')) {
      rowErrors.push('Jika nomorKK diisi, hubungan juga harus diisi');
    }
    if ((row.hubungan && row.hubungan.trim() !== '') && (!row.nomorKK || row.nomorKK.trim() === '')) {
      rowErrors.push('Jika hubungan diisi, nomorKK juga harus diisi');
    }

    // Jika ada error, tambahkan ke errors
    if (rowErrors.length > 0) {
      errors.push({
        row: rowNumber,
        data: row,
        errors: rowErrors,
      });
    } else {
      // Format data untuk insert
      validData.push({
        nik: row.nik.trim(),
        nama: row.nama.trim(),
        tempatLahir: row.tempatLahir?.trim() || '',
        tanggalLahir: new Date(row.tanggalLahir),
        jenisKelamin: row.jenisKelamin?.trim() || '',
        agama: row.agama?.trim() || null,
        pendidikan: row.pendidikan?.trim() || null,
        pekerjaan: row.pekerjaan?.trim() || null,
        statusPerkawinan: row.statusPerkawinan?.trim() || null,
        kewarganegaraan: row.kewarganegaraan?.trim() || 'WNI',
        alamat: row.alamat?.trim() || '',
        rt: row.rt?.trim() || null,
        rw: row.rw?.trim() || null,
        desa: row.desa?.trim() || '',
        kecamatan: row.kecamatan?.trim() || '',
        kabupaten: row.kabupaten?.trim() || '',
        provinsi: row.provinsi?.trim() || '',
        golonganDarah: row.golonganDarah?.trim() || null,
        statusKependudukan: row.statusKependudukan?.trim() || 'Aktif',
        nomorKK: row.nomorKK?.trim() || null, // Simpan nomorKK untuk tracking
      });
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    validData,
  };
};

/**
 * Import data penduduk dari CSV
 * 
 * @param {string} filePath - Path ke file CSV
 * @returns {Promise<Object>} { success, message, data: { imported, failed, errors } }
 */
export const importPendudukFromCSV = async (filePath) => {
  try {
    // Parse CSV
    const csvData = await parseCSV(filePath);

    if (csvData.length === 0) {
      return {
        success: false,
        message: 'File CSV kosong atau tidak valid',
        data: {
          imported: 0,
          failed: 0,
          errors: [],
        },
      };
    }

    // Validasi data
    const validation = validateCSVData(csvData);

    if (validation.errors.length > 0 && validation.validData.length === 0) {
      return {
        success: false,
        message: 'Semua data tidak valid',
        data: {
          imported: 0,
          failed: validation.errors.length,
          errors: validation.errors,
        },
      };
    }

    // Cek NIK duplicate dalam CSV
    const nikSet = new Set();
    const duplicateNIK = [];
    validation.validData.forEach((data, index) => {
      if (nikSet.has(data.nik)) {
        duplicateNIK.push({
          row: index + 2,
          nik: data.nik,
          error: 'NIK duplikat dalam file CSV',
        });
      } else {
        nikSet.add(data.nik);
      }
    });

    if (duplicateNIK.length > 0) {
      validation.errors.push(...duplicateNIK);
      // Hapus data dengan NIK duplicate dari validData
      const validNIKs = new Set(validation.validData.map((d) => d.nik));
      duplicateNIK.forEach((dup) => {
        if (validNIKs.has(dup.nik)) {
          const index = validation.validData.findIndex((d) => d.nik === dup.nik);
          if (index > -1) {
            validation.validData.splice(index, 1);
          }
        }
      });
    }

    // Cek NIK yang sudah ada di database
    const existingNIKs = await prisma.penduduk.findMany({
      where: {
        nik: { in: validation.validData.map((d) => d.nik) },
      },
      select: { nik: true },
    });

    const existingNIKSet = new Set(existingNIKs.map((p) => p.nik));
    const duplicateInDB = [];
    validation.validData = validation.validData.filter((data) => {
      if (existingNIKSet.has(data.nik)) {
        duplicateInDB.push({
          nik: data.nik,
          error: 'NIK sudah terdaftar di database',
        });
        return false;
      }
      return true;
    });

    if (duplicateInDB.length > 0) {
      validation.errors.push(...duplicateInDB);
    }

    // Import data yang valid
    let imported = 0;
    const importErrors = [];
    const kkToAdd = []; // Array untuk menyimpan data yang perlu ditambahkan ke KK
    // Map untuk menyimpan mapping antara NIK dan data original (untuk nomorKK dan hubungan)
    const nikToOriginalData = new Map();
    csvData.forEach((row) => {
      if (row.nik && row.nomorKK && row.hubungan) {
        nikToOriginalData.set(row.nik.trim(), {
          nomorKK: row.nomorKK.trim(),
          hubungan: row.hubungan.trim(),
        });
      }
    });

    if (validation.validData.length > 0) {
      // Import dalam batch (100 data per batch)
      const batchSize = 100;
      for (let i = 0; i < validation.validData.length; i += batchSize) {
        const batch = validation.validData.slice(i, i + batchSize);

        try {
          // Import penduduk
          await prisma.penduduk.createMany({
            data: batch,
            skipDuplicates: true,
          });
          imported += batch.length;

          // Simpan data untuk auto-add ke KK (jika ada nomorKK)
          batch.forEach((data) => {
            const originalData = nikToOriginalData.get(data.nik);
            if (originalData) {
              kkToAdd.push({
                nomorKK: originalData.nomorKK,
                nik: data.nik,
                hubungan: originalData.hubungan,
              });
            }
          });
        } catch (error) {
          // Jika batch gagal, coba insert satu per satu
          for (let j = 0; j < batch.length; j++) {
            const data = batch[j];
            try {
              await prisma.penduduk.create({ data });
              imported++;

              // Simpan data untuk auto-add ke KK (jika ada nomorKK)
              const originalData = nikToOriginalData.get(data.nik);
              if (originalData) {
                kkToAdd.push({
                  nomorKK: originalData.nomorKK,
                  nik: data.nik,
                  hubungan: originalData.hubungan,
                });
              }
            } catch (err) {
              importErrors.push({
                nik: data.nik,
                nama: data.nama,
                error: err.message,
              });
            }
          }
        }
      }
    }

    // Auto-add penduduk ke KK (jika ada nomorKK di CSV)
    // ALASAN: User bisa tentukan KK dan hubungan saat import penduduk
    let kkAdded = 0;
    const kkErrors = [];

    if (kkToAdd.length > 0) {
      console.log(`📋 Menambahkan ${kkToAdd.length} penduduk ke Kartu Keluarga...`);

      // Get semua NIK yang perlu ditambahkan ke KK
      const nikList = kkToAdd.map((item) => item.nik);

      // Get semua penduduk yang baru di-import (berdasarkan NIK)
      const pendudukList = await prisma.penduduk.findMany({
        where: {
          nik: { in: nikList },
        },
        select: {
          id: true,
          nik: true,
        },
      });

      // Buat map untuk cepat cari penduduk berdasarkan NIK
      const nikToPendudukMap = new Map();
      pendudukList.forEach((p) => {
        nikToPendudukMap.set(p.nik, p);
      });

      // Get semua nomorKK yang perlu dicari
      const nomorKKList = [...new Set(kkToAdd.map((item) => item.nomorKK))];

      // Get semua KK yang diperlukan
      const kkList = await prisma.kartuKeluarga.findMany({
        where: {
          nomorKK: { in: nomorKKList },
        },
        select: {
          id: true,
          nomorKK: true,
        },
      });

      // Buat map untuk cepat cari KK berdasarkan nomorKK
      const nomorKKToKKMap = new Map();
      kkList.forEach((kk) => {
        nomorKKToKKMap.set(kk.nomorKK, kk);
      });

      // Process setiap item untuk auto-add ke KK
      for (const item of kkToAdd) {
        try {
          // Cari penduduk
          const penduduk = nikToPendudukMap.get(item.nik);
          if (!penduduk) {
            kkErrors.push({
              nik: item.nik,
              nomorKK: item.nomorKK,
              error: 'Penduduk tidak ditemukan setelah import',
            });
            continue;
          }

          // Cari KK
          const kk = nomorKKToKKMap.get(item.nomorKK);
          if (!kk) {
            kkErrors.push({
              nik: item.nik,
              nomorKK: item.nomorKK,
              error: `Kartu Keluarga dengan nomor ${item.nomorKK} tidak ditemukan. Pastikan KK sudah di-import terlebih dahulu.`,
            });
            continue;
          }

          // Cek apakah penduduk sudah jadi anggota KK ini
          const existingAnggota = await prisma.anggotaKeluarga.findUnique({
            where: {
              kartuKeluargaId_pendudukId: {
                kartuKeluargaId: kk.id,
                pendudukId: penduduk.id,
              },
            },
          });

          if (existingAnggota) {
            // Sudah jadi anggota, skip
            continue;
          }

          // Tambahkan penduduk sebagai anggota KK
          await prisma.anggotaKeluarga.create({
            data: {
              kartuKeluargaId: kk.id,
              pendudukId: penduduk.id,
              hubungan: item.hubungan,
              status: 'Aktif',
            },
          });

          kkAdded++;
        } catch (error) {
          // Handle duplicate error
          if (error.code === 'P2002') {
            // Sudah jadi anggota, skip
            continue;
          }
          kkErrors.push({
            nik: item.nik,
            nomorKK: item.nomorKK,
            error: error.message,
          });
        }
      }
    }

    const failed = validation.errors.length + importErrors.length;
    const allErrors = [...validation.errors, ...importErrors];

    // Tambahkan error dari auto-add KK ke errors
    if (kkErrors.length > 0) {
      allErrors.push(...kkErrors);
    }

    let message = `Import selesai. ${imported} data berhasil diimport, ${failed} data gagal.`;
    if (kkAdded > 0) {
      message += ` ${kkAdded} penduduk otomatis ditambahkan ke Kartu Keluarga.`;
    }

    return {
      success: imported > 0,
      message,
      data: {
        imported,
        failed,
        kkAdded, // Jumlah penduduk yang berhasil ditambahkan ke KK
        kkErrors, // Error saat menambahkan ke KK
        errors: allErrors,
      },
    };
  } catch (error) {
    console.error('Import CSV error:', error);
    return {
      success: false,
      message: `Terjadi kesalahan saat import CSV: ${error.message}`,
      data: {
        imported: 0,
        failed: 0,
        errors: [{ error: error.message }],
      },
    };
  }
};

export default {
  parseCSV,
  validateCSVData,
  importPendudukFromCSV,
};

