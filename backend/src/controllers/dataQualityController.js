// ============================================
// FILE: dataQualityController.js
// ============================================
//
// DESKRIPSI:
// Controller untuk data quality warnings
// PHASE 3.1: Data Quality Warning System
//
// ALUR DATA:
// 1. Check data quality: Query database → Detect issues → Return warnings
// 2. Warnings ditampilkan di Dashboard dan page Data Quality
//
// ALASAN DESAIN:
// - Proaktif: Mendeteksi data quality issues sebelum jadi masalah
// - Informasi: Warnings bersifat informasi, bukan error blocking
// - Comprehensive: Check berbagai aspek data quality
//
// WARNINGS YANG DICARI:
// - Penduduk aktif tanpa KK
// - KK tanpa kepala keluarga
// - Penduduk di lebih dari 1 KK (aktif)
// - Kepala keluarga berusia < 17 tahun
// - NIK duplikat
// - KK tanpa anggota (kecuali kepala keluarga)
//
// PENGGUNAAN:
// GET /api/data-quality/warnings - Get semua warnings
//
// ============================================

import prisma from '../config/database.js';
import { calculateUmur } from '../utils/validators.js';

/**
 * Get data quality warnings
 *
 * @route GET /api/data-quality/warnings
 * @access Private (ADMIN, OPERATOR bisa akses)
 *
 * @returns {Object} { success, message, data: { warnings, summary } }
 */
export const getDataQualityWarnings = async (req, res) => {
  try {
    const warnings = [];

    // 1. Penduduk aktif tanpa KK
    const pendudukAktifTanpaKK = await prisma.penduduk.findMany({
      where: {
        statusKependudukan: 'Aktif',
        OR: [
          { nomorKK: null },
          {
            anggotaKeluarga: {
              none: {
                status: 'Aktif',
              },
            },
          },
        ],
      },
      select: {
        id: true,
        nik: true,
        nama: true,
        statusKependudukan: true,
        nomorKK: true,
      },
      take: 50, // Limit untuk performa
    });

    if (pendudukAktifTanpaKK.length > 0) {
      warnings.push({
        type: 'PENDUDUK_AKTIF_TANPA_KK',
        severity: 'HIGH',
        title: 'Penduduk Aktif Tanpa Kartu Keluarga',
        description: 'Penduduk dengan status "Aktif" harus terdaftar di Kartu Keluarga',
        count: pendudukAktifTanpaKK.length,
        items: pendudukAktifTanpaKK.map((p) => ({
          id: p.id,
          nik: p.nik,
          nama: p.nama,
          nomorKK: p.nomorKK,
          detail: 'Penduduk aktif tidak terdaftar di Kartu Keluarga manapun',
        })),
      });
    }

    // 2. KK tanpa kepala keluarga (kepalaKeluargaId tidak ada atau kepala keluarga tidak ditemukan)
    const allKK = await prisma.kartuKeluarga.findMany({
      where: {
        isActive: true,
      },
      include: {
        kepalaKeluarga: {
          select: {
            id: true,
            nik: true,
            nama: true,
          },
        },
      },
      take: 1000,
    });

    const kkTanpaKepala = allKK
      .filter((kk) => !kk.kepalaKeluarga || !kk.kepalaKeluargaId)
      .slice(0, 50);

    if (kkTanpaKepala.length > 0) {
      warnings.push({
        type: 'KK_TANPA_KEPALA',
        severity: 'HIGH',
        title: 'Kartu Keluarga Tanpa Kepala Keluarga',
        description: 'Kartu Keluarga harus memiliki kepala keluarga',
        count: kkTanpaKepala.length,
        items: kkTanpaKepala.map((kk) => ({
          id: kk.id,
          nomorKK: kk.nomorKK,
          kepalaKeluargaId: kk.kepalaKeluargaId,
          detail: 'Kartu Keluarga tidak memiliki kepala keluarga yang valid',
        })),
      });
    }

    // 3. Penduduk di lebih dari 1 KK (aktif)
    const pendudukMultiKK = await prisma.anggotaKeluarga.groupBy({
      by: ['pendudukId'],
      where: {
        status: 'Aktif',
        penduduk: {
          statusKependudukan: 'Aktif',
        },
      },
      _count: {
        id: true,
      },
      having: {
        id: {
          _count: {
            gt: 1,
          },
        },
      },
    });

    if (pendudukMultiKK.length > 0) {
      const pendudukIds = pendudukMultiKK.map((a) => a.pendudukId);
      const pendudukDetails = await prisma.penduduk.findMany({
        where: {
          id: { in: pendudukIds },
        },
        select: {
          id: true,
          nik: true,
          nama: true,
          anggotaKeluarga: {
            where: {
              status: 'Aktif',
            },
            include: {
              kartuKeluarga: {
                select: {
                  nomorKK: true,
                },
              },
            },
          },
        },
        take: 50,
      });

      warnings.push({
        type: 'PENDUDUK_MULTI_KK',
        severity: 'HIGH',
        title: 'Penduduk Terdaftar di Lebih dari Satu KK',
        description: 'Satu penduduk aktif hanya dapat terdaftar di satu Kartu Keluarga',
        count: pendudukDetails.length,
        items: pendudukDetails.map((p) => ({
          id: p.id,
          nik: p.nik,
          nama: p.nama,
          detail: `Terdaftar di ${p.anggotaKeluarga.length} KK: ${p.anggotaKeluarga.map((a) => a.kartuKeluarga.nomorKK).join(', ')}`,
        })),
      });
    }

    // 4. Kepala keluarga berusia < 17 tahun
    const kepalaKeluargaMuda = await prisma.kartuKeluarga.findMany({
      where: {
        isActive: true,
        kepalaKeluarga: {
          tanggalLahir: {
            gte: new Date(new Date().setFullYear(new Date().getFullYear() - 17)),
          },
        },
      },
      include: {
        kepalaKeluarga: {
          select: {
            id: true,
            nik: true,
            nama: true,
            tanggalLahir: true,
          },
        },
      },
      take: 50,
    });

    const kepalaKeluargaMudaFiltered = kepalaKeluargaMuda.filter((kk) => {
      if (!kk.kepalaKeluarga || !kk.kepalaKeluarga.tanggalLahir) return false;
      const umur = calculateUmur(kk.kepalaKeluarga.tanggalLahir);
      return umur < 17;
    });

    if (kepalaKeluargaMudaFiltered.length > 0) {
      warnings.push({
        type: 'KEPALA_KELUARGA_MUDA',
        severity: 'MEDIUM',
        title: 'Kepala Keluarga Berusia Kurang dari 17 Tahun',
        description: 'Kepala keluarga umumnya berusia minimal 17 tahun (bisa ada pengecualian)',
        count: kepalaKeluargaMudaFiltered.length,
        items: kepalaKeluargaMudaFiltered.map((kk) => {
          const umur = calculateUmur(kk.kepalaKeluarga.tanggalLahir);
          return {
            id: kk.kepalaKeluarga.id,
            nik: kk.kepalaKeluarga.nik,
            nama: kk.kepalaKeluarga.nama,
            nomorKK: kk.nomorKK,
            umur,
            detail: `Kepala keluarga berusia ${umur} tahun (kurang dari 17 tahun)`,
          };
        }),
      });
    }

    // 5. NIK duplikat (harusnya tidak mungkin, tapi dicek untuk safety)
    const nikDuplikat = await prisma.penduduk.groupBy({
      by: ['nik'],
      _count: {
        id: true,
      },
      having: {
        id: {
          _count: {
            gt: 1,
          },
        },
      },
      take: 50,
    });

    if (nikDuplikat.length > 0) {
      const nikList = nikDuplikat.map((n) => n.nik);
      const pendudukDuplikat = await prisma.penduduk.findMany({
        where: {
          nik: { in: nikList },
        },
        select: {
          id: true,
          nik: true,
          nama: true,
        },
        take: 100, // Limit untuk performa
      });

      warnings.push({
        type: 'NIK_DUPLIKAT',
        severity: 'CRITICAL',
        title: 'NIK Duplikat',
        description: 'NIK harus unik, tidak boleh ada duplikat',
        count: nikDuplikat.length,
        items: pendudukDuplikat.map((p) => ({
          id: p.id,
          nik: p.nik,
          nama: p.nama,
          detail: 'NIK duplikat ditemukan',
        })),
      });
    }

    // 6. KK tanpa anggota (hanya kepala keluarga, tidak ada anggota lain)
    const kkTanpaAnggota = await prisma.kartuKeluarga.findMany({
      where: {
        isActive: true,
        anggotaKeluarga: {
          none: {
            status: 'Aktif',
          },
        },
      },
      include: {
        kepalaKeluarga: {
          select: {
            id: true,
            nik: true,
            nama: true,
          },
        },
      },
      take: 50,
    });

    if (kkTanpaAnggota.length > 0) {
      warnings.push({
        type: 'KK_TANPA_ANGGOTA',
        severity: 'LOW',
        title: 'Kartu Keluarga Tanpa Anggota',
        description: 'Kartu Keluarga hanya memiliki kepala keluarga, tidak ada anggota lain (bisa normal untuk keluarga single)',
        count: kkTanpaAnggota.length,
        items: kkTanpaAnggota.map((kk) => ({
          id: kk.id,
          nomorKK: kk.nomorKK,
          kepalaKeluarga: kk.kepalaKeluarga
            ? `${kk.kepalaKeluarga.nama} (NIK: ${kk.kepalaKeluarga.nik})`
            : 'Tidak ada',
          detail: 'KK hanya memiliki kepala keluarga',
        })),
      });
    }

    // Summary
    const summary = {
      total: warnings.length,
      critical: warnings.filter((w) => w.severity === 'CRITICAL').length,
      high: warnings.filter((w) => w.severity === 'HIGH').length,
      medium: warnings.filter((w) => w.severity === 'MEDIUM').length,
      low: warnings.filter((w) => w.severity === 'LOW').length,
      totalItems: warnings.reduce((sum, w) => sum + w.count, 0),
    };

    return res.status(200).json({
      success: true,
      message: 'Data quality warnings berhasil diambil',
      data: {
        warnings,
        summary,
      },
    });
  } catch (error) {
    console.error('Get data quality warnings error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data quality warnings.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

