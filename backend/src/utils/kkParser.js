// ============================================
// FILE: kkParser.js
// ============================================
// 
// DESKRIPSI:
// Utility untuk parse dan import data Kartu Keluarga dari CSV
//
// ============================================

import fs from 'fs';
import csv from 'csv-parser';
import prisma from '../config/database.js';
import { validateKK } from './validators.js';

/**
 * Import data Kartu Keluarga dari CSV
 */
export const importKKFromCSV = async (filePath) => {
  try {
    // Parse CSV
    const results = [];
    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', resolve)
        .on('error', reject);
    });

    if (results.length === 0) {
      return {
        success: false,
        message: 'File CSV kosong atau tidak valid',
        data: { imported: 0, failed: 0, errors: [] },
      };
    }

    // Validasi dan import
    const errors = [];
    const validData = [];
    const existingKKs = await prisma.kartuKeluarga.findMany({
      select: { nomorKK: true },
    });
    const existingKKSet = new Set(existingKKs.map((kk) => kk.nomorKK));

    // Get semua NIK kepala keluarga yang diperlukan (untuk batch query)
    const kepalaKeluargaNIKs = [...new Set(results.map((row) => row.kepalaKeluargaNIK?.trim()).filter(Boolean))];
    const existingPenduduk = await prisma.penduduk.findMany({
      where: {
        nik: { in: kepalaKeluargaNIKs },
      },
      select: { id: true, nik: true },
    });
    const nikToPendudukMap = new Map();
    existingPenduduk.forEach((p) => {
      nikToPendudukMap.set(p.nik, p);
    });

    for (let i = 0; i < results.length; i++) {
      const row = results[i];
      const rowNumber = i + 2;
      const rowErrors = [];

      // Validasi field wajib
      if (!row.nomorKK || !row.nomorKK.trim()) {
        rowErrors.push('Nomor KK wajib diisi');
      }
      if (!row.kepalaKeluargaNIK || !row.kepalaKeluargaNIK.trim()) {
        rowErrors.push('NIK Kepala Keluarga wajib diisi');
      }

      // Validasi nomor KK
      if (row.nomorKK && !validateKK(row.nomorKK.trim())) {
        rowErrors.push('Nomor KK harus 16 digit angka');
      }

      // Cek duplicate
      if (row.nomorKK && existingKKSet.has(row.nomorKK.trim())) {
        rowErrors.push(`Nomor KK ${row.nomorKK.trim()} sudah terdaftar di database`);
      }

      // Cek kepala keluarga ada (menggunakan map untuk performa)
      if (row.kepalaKeluargaNIK) {
        const kepalaKeluarga = nikToPendudukMap.get(row.kepalaKeluargaNIK.trim());
        if (!kepalaKeluarga) {
          rowErrors.push(`Penduduk dengan NIK ${row.kepalaKeluargaNIK.trim()} tidak ditemukan. Pastikan penduduk sudah di-import terlebih dahulu.`);
        }
      }

      if (rowErrors.length > 0) {
        errors.push({ 
          row: rowNumber, 
          errors: rowErrors, 
          data: {
            nomorKK: row.nomorKK?.trim() || '',
            kepalaKeluargaNIK: row.kepalaKeluargaNIK?.trim() || '',
          }
        });
      } else {
        // Cari kepala keluarga dari map (sudah di-query sebelumnya)
        const kepalaKeluarga = nikToPendudukMap.get(row.kepalaKeluargaNIK.trim());
        
        if (!kepalaKeluarga) {
          errors.push({
            row: rowNumber,
            errors: [`Penduduk dengan NIK ${row.kepalaKeluargaNIK.trim()} tidak ditemukan setelah validasi`],
            data: {
              nomorKK: row.nomorKK?.trim() || '',
              kepalaKeluargaNIK: row.kepalaKeluargaNIK?.trim() || '',
            }
          });
          continue;
        }

        validData.push({
          nomorKK: row.nomorKK.trim(),
          kepalaKeluargaId: kepalaKeluarga.id,
          alamat: row.alamat?.trim() || '',
          rt: row.rt?.trim() || null,
          rw: row.rw?.trim() || null,
          desa: row.desa?.trim() || '',
          kecamatan: row.kecamatan?.trim() || '',
          kabupaten: row.kabupaten?.trim() || '',
          provinsi: row.provinsi?.trim() || '',
          kodePos: row.kodePos?.trim() || null,
        });
      }
    }

    // Import data yang valid
    let imported = 0;
    for (const data of validData) {
      try {
        // Buat Kartu Keluarga dengan transaction untuk memastikan konsistensi
        // ALASAN: Jika create KK berhasil tapi create anggota gagal, data tidak konsisten
        await prisma.$transaction(async (tx) => {
          // 1. Buat Kartu Keluarga
          const kk = await tx.kartuKeluarga.create({ data });
          
          // 2. Otomatis tambahkan kepala keluarga sebagai anggota dengan hubungan "Kepala Keluarga"
          // ALASAN: Kepala keluarga harus otomatis jadi anggota KK (sama seperti create manual)
          await tx.anggotaKeluarga.create({
            data: {
              kartuKeluargaId: kk.id,
              pendudukId: data.kepalaKeluargaId,
              hubungan: 'Kepala Keluarga',
              status: 'Aktif',
            },
          });
        });
        
        imported++;
      } catch (error) {
        // Handle error khusus untuk duplicate
        if (error.code === 'P2002') {
          errors.push({
            data,
            error: 'Nomor KK atau anggota keluarga sudah terdaftar',
          });
        } else {
          errors.push({
            data,
            error: error.message,
          });
        }
      }
    }

    // Jika semua data gagal, return error yang lebih jelas
    if (imported === 0 && errors.length > 0) {
      const firstError = errors[0];
      const errorMessage = firstError.errors?.[0] || 'Semua data gagal diimport';
      
      return {
        success: false,
        message: `Import gagal. ${errors.length} data gagal. Error: ${errorMessage}`,
        data: {
          imported: 0,
          failed: errors.length,
          errors: errors.slice(0, 10), // Limit error untuk response (max 10)
        },
      };
    }

    return {
      success: imported > 0,
      message: `Import selesai. ${imported} data berhasil diimport, ${errors.length} data gagal.`,
      data: {
        imported,
        failed: errors.length,
        errors: errors.slice(0, 10), // Limit error untuk response (max 10)
      },
    };
  } catch (error) {
    console.error('Import KK error:', error);
    return {
      success: false,
      message: `Terjadi kesalahan saat import CSV: ${error.message}`,
      data: { imported: 0, failed: 0, errors: [{ error: error.message }] },
    };
  }
};

