// ============================================
// FILE: trendController.js
// ============================================
// 
// DESKRIPSI:
// Controller untuk data trend & time series
// Menyediakan data perkembangan kependudukan dari waktu ke waktu
//
// ALASAN DESAIN:
// - User perlu lihat perkembangan data dari waktu ke waktu
// - Data lebih informatif dengan grafik trend
// - Membantu perencanaan dan analisis
//
// DATA YANG DISEDIAKAN:
// - Pertumbuhan penduduk per bulan/tahun
// - Trend surat yang dibuat per bulan/tahun
// - Perbandingan tahun ke tahun
//
// PENGGUNAAN:
// GET /api/trend/penduduk?period=month - Trend penduduk per bulan
// GET /api/trend/surat?period=month - Trend surat per bulan
//
// ============================================

import prisma from "../config/database.js";

/**
 * Get trend pertumbuhan penduduk
 * 
 * @route GET /api/trend/penduduk
 * @access Private
 * 
 * @query {string} period - Period (month, year) - default: month
 * @query {number} months - Jumlah bulan terakhir (default: 12)
 * 
 * @returns {Object} { success, message, data: { trend } }
 * 
 * ALASAN:
 * - User perlu lihat perkembangan penduduk dari waktu ke waktu
 * - Data untuk grafik line chart
 */
export const getPendudukTrend = async (req, res) => {
  try {
    const period = req.query.period || 'month'; // month atau year
    const months = parseInt(req.query.months) || 12; // Jumlah bulan terakhir

    // Hitung tanggal awal (N bulan yang lalu)
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    // Get semua penduduk yang dibuat dalam periode tersebut
    const penduduk = await prisma.penduduk.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group by period (month atau year)
    const trendMap = {};
    
    penduduk.forEach((p) => {
      const date = new Date(p.createdAt);
      let key;
      
      if (period === 'year') {
        key = `${date.getFullYear()}`;
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }
      
      if (!trendMap[key]) {
        trendMap[key] = 0;
      }
      trendMap[key]++;
    });

    // Convert ke array format untuk chart
    const trend = Object.keys(trendMap)
      .sort()
      .map((key) => ({
        period: key,
        count: trendMap[key],
      }));

    // Calculate cumulative (running total)
    let cumulative = 0;
    const trendWithCumulative = trend.map((item) => {
      cumulative += item.count;
      return {
        ...item,
        cumulative,
      };
    });

    return res.status(200).json({
      success: true,
      message: "Trend penduduk berhasil diambil",
      data: {
        trend: trendWithCumulative,
        period,
      },
    });
  } catch (error) {
    console.error("Get penduduk trend error:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil trend penduduk.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get trend surat yang dibuat
 * 
 * @route GET /api/trend/surat
 * @access Private
 * 
 * @query {string} period - Period (month, year) - default: month
 * @query {number} months - Jumlah bulan terakhir (default: 12)
 * 
 * @returns {Object} { success, message, data: { trend } }
 */
export const getSuratTrend = async (req, res) => {
  try {
    const period = req.query.period || 'month';
    const months = parseInt(req.query.months) || 12;

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const surat = await prisma.surat.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        createdAt: true,
        jenisSurat: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group by period
    const trendMap = {};
    
    surat.forEach((s) => {
      const date = new Date(s.createdAt);
      let key;
      
      if (period === 'year') {
        key = `${date.getFullYear()}`;
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }
      
      if (!trendMap[key]) {
        trendMap[key] = { total: 0, byJenis: {} };
      }
      trendMap[key].total++;
      
      if (!trendMap[key].byJenis[s.jenisSurat]) {
        trendMap[key].byJenis[s.jenisSurat] = 0;
      }
      trendMap[key].byJenis[s.jenisSurat]++;
    });

    // Convert ke array format
    const trend = Object.keys(trendMap)
      .sort()
      .map((key) => ({
        period: key,
        total: trendMap[key].total,
        byJenis: trendMap[key].byJenis,
      }));

    return res.status(200).json({
      success: true,
      message: "Trend surat berhasil diambil",
      data: {
        trend,
        period,
      },
    });
  } catch (error) {
    console.error("Get surat trend error:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil trend surat.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

