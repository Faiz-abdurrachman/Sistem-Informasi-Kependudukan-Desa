// ============================================
// FILE: statistikController.js
// ============================================
//
// DESKRIPSI:
// Controller untuk statistik kependudukan
// Menyediakan data statistik untuk dashboard
//
// ALUR DATA:
// 1. Get statistik: Query database → Aggregate data → Return statistik
// 2. Cache statistik: Simpan statistik ke tabel Statistik untuk performa
// 3. Update cache: Update cache saat ada perubahan data
//
// ALASAN DESAIN:
// - Performance: Cache statistik untuk menghindari query kompleks berulang
// - Real-time: Bisa get statistik real-time atau dari cache
// - Comprehensive: Statistik lengkap untuk dashboard
//
// STATISTIK YANG DISEDIAKAN:
// - Total penduduk
// - Total Kartu Keluarga
// - Penduduk per jenis kelamin
// - Penduduk per status kependudukan
// - Penduduk per agama
// - Penduduk per pendidikan
// - Penduduk per pekerjaan
// - Statistik per RT/RW
//
// PENGGUNAAN:
// GET /api/statistik - Get semua statistik
// GET /api/statistik/refresh - Refresh cache statistik
//
// ============================================

import prisma from "../config/database.js";

/**
 * Get semua statistik kependudukan
 *
 * @route GET /api/statistik
 * @access Private (ADMIN, OPERATOR, PUBLIK bisa akses)
 *
 * @query {boolean} useCache - Gunakan cache atau real-time (default: true)
 *
 * @returns {Object} { success, message, data: { statistik } }
 */
export const getAllStatistik = async (req, res) => {
  try {
    const useCache = req.query.useCache !== "false"; // Default: true

    // Jika use cache, ambil dari tabel Statistik
    if (useCache) {
      const cachedStatistik = await prisma.statistik.findMany();

      // Jika cache ada, return cache
      if (cachedStatistik.length > 0) {
        const statistikMap = {};
        cachedStatistik.forEach((stat) => {
          statistikMap[stat.jenis] = stat.nilai;
        });

        return res.status(200).json({
          success: true,
          message: "Statistik berhasil diambil (dari cache)",
          data: {
            statistik: statistikMap,
            cached: true,
          },
        });
      }
    }

    // Jika tidak use cache atau cache kosong, hitung real-time
    const [
      totalPenduduk,
      totalKK,
      pendudukLakiLaki,
      pendudukPerempuan,
      pendudukAktif,
      pendudukMeninggal,
      pendudukPindah,
      totalSurat,
    ] = await Promise.all([
      // Total penduduk
      prisma.penduduk.count(),

      // Total Kartu Keluarga
      prisma.kartuKeluarga.count(),

      // Penduduk laki-laki
      prisma.penduduk.count({
        where: { jenisKelamin: "Laki-laki" },
      }),

      // Penduduk perempuan
      prisma.penduduk.count({
        where: { jenisKelamin: "Perempuan" },
      }),

      // Penduduk aktif
      prisma.penduduk.count({
        where: { statusKependudukan: "Aktif" },
      }),

      // Penduduk meninggal
      prisma.penduduk.count({
        where: { statusKependudukan: "Meninggal" },
      }),

      // Penduduk pindah
      prisma.penduduk.count({
        where: { statusKependudukan: "Pindah" },
      }),

      // Total surat
      prisma.surat.count(),
    ]);

    // Get statistik per agama (dengan error handling)
    let statistikAgama = [];
    try {
      statistikAgama = await prisma.penduduk.groupBy({
        by: ["agama"],
        _count: {
          id: true,
        },
        where: {
          agama: { not: null },
        },
      });
    } catch (error) {
      console.error("Error getting statistik agama:", error);
      statistikAgama = [];
    }

    // Get statistik per pendidikan (dengan error handling)
    let statistikPendidikan = [];
    try {
      statistikPendidikan = await prisma.penduduk.groupBy({
        by: ["pendidikan"],
        _count: {
          id: true,
        },
        where: {
          pendidikan: { not: null },
        },
      });
    } catch (error) {
      console.error("Error getting statistik pendidikan:", error);
      statistikPendidikan = [];
    }

    // Get statistik per RT (dengan error handling)
    let statistikRT = [];
    try {
      statistikRT = await prisma.penduduk.groupBy({
        by: ["rt"],
        _count: {
          id: true,
        },
        where: {
          rt: { not: null },
        },
      });
    } catch (error) {
      console.error("Error getting statistik RT:", error);
      statistikRT = [];
    }

    // Get statistik per RW (dengan error handling)
    let statistikRW = [];
    try {
      statistikRW = await prisma.penduduk.groupBy({
        by: ["rw"],
        _count: {
          id: true,
        },
        where: {
          rw: { not: null },
        },
      });
    } catch (error) {
      console.error("Error getting statistik RW:", error);
      statistikRW = [];
    }

    // Format statistik
    const statistik = {
      totalPenduduk,
      totalKK,
      totalSurat,
      jenisKelamin: {
        lakiLaki: pendudukLakiLaki,
        perempuan: pendudukPerempuan,
      },
      statusKependudukan: {
        aktif: pendudukAktif,
        meninggal: pendudukMeninggal,
        pindah: pendudukPindah,
      },
      agama: statistikAgama.map((s) => ({
        nama: s.agama,
        jumlah: s._count.id,
      })),
      pendidikan: statistikPendidikan.map((s) => ({
        nama: s.pendidikan,
        jumlah: s._count.id,
      })),
      rt: statistikRT.map((s) => ({
        rt: s.rt,
        jumlah: s._count.id,
      })),
      rw: statistikRW.map((s) => ({
        rw: s.rw,
        jumlah: s._count.id,
      })),
    };

    return res.status(200).json({
      success: true,
      message: "Statistik berhasil diambil (real-time)",
      data: {
        statistik,
        cached: false,
      },
    });
  } catch (error) {
    console.error("Get statistik error:", error);
    console.error("Error stack:", error.stack);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil statistik.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
      details:
        process.env.NODE_ENV === "development"
          ? {
              name: error.name,
              code: error.code,
              meta: error.meta,
            }
          : undefined,
    });
  }
};

/**
 * Refresh cache statistik
 *
 * @route GET /api/statistik/refresh
 * @access Private (ADMIN, OPERATOR bisa akses)
 *
 * @returns {Object} { success, message }
 */
export const refreshStatistik = async (req, res) => {
  try {
    // Hitung statistik real-time
    const [
      totalPenduduk,
      totalKK,
      pendudukLakiLaki,
      pendudukPerempuan,
      pendudukAktif,
      pendudukMeninggal,
      pendudukPindah,
      totalSurat,
    ] = await Promise.all([
      prisma.penduduk.count(),
      prisma.kartuKeluarga.count(),
      prisma.penduduk.count({ where: { jenisKelamin: "Laki-laki" } }),
      prisma.penduduk.count({ where: { jenisKelamin: "Perempuan" } }),
      prisma.penduduk.count({ where: { statusKependudukan: "Aktif" } }),
      prisma.penduduk.count({ where: { statusKependudukan: "Meninggal" } }),
      prisma.penduduk.count({ where: { statusKependudukan: "Pindah" } }),
      prisma.surat.count(),
    ]);

    // Update atau create cache statistik
    const statistikData = [
      { jenis: "total_penduduk", nilai: totalPenduduk },
      { jenis: "total_kk", nilai: totalKK },
      { jenis: "penduduk_laki_laki", nilai: pendudukLakiLaki },
      { jenis: "penduduk_perempuan", nilai: pendudukPerempuan },
      { jenis: "penduduk_aktif", nilai: pendudukAktif },
      { jenis: "penduduk_meninggal", nilai: pendudukMeninggal },
      { jenis: "penduduk_pindah", nilai: pendudukPindah },
      { jenis: "total_surat", nilai: totalSurat },
    ];

    // Upsert statistik (update jika ada, create jika tidak ada)
    await Promise.all(
      statistikData.map((stat) =>
        prisma.statistik.upsert({
          where: { jenis: stat.jenis },
          update: { nilai: stat.nilai },
          create: stat,
        })
      )
    );

    return res.status(200).json({
      success: true,
      message: "Cache statistik berhasil di-refresh",
    });
  } catch (error) {
    console.error("Refresh statistik error:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat refresh cache statistik.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
