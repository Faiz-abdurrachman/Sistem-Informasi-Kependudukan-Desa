// ============================================
// FILE: laporanController.js
// ============================================
//
// DESKRIPSI:
// Controller untuk laporan rekap penduduk dan surat
// PHASE 4.1 & 4.2: Laporan Backend
//
// ALUR DATA:
// 1. Get rekap penduduk: Query dengan filter → Group by → Return rekap
// 2. Get rekap surat: Query dengan filter → Group by → Return rekap
//
// ALASAN DESAIN:
// - Comprehensive: Laporan lengkap dengan berbagai grouping
// - Flexible: Filter yang fleksibel untuk berbagai kebutuhan
// - Performance: Query yang efisien dengan index
//
// PENGGUNAAN:
// GET /api/laporan/penduduk/rekap - Rekap penduduk
// GET /api/laporan/surat/rekap - Rekap surat
//
// ============================================

import prisma from '../config/database.js';
import { calculateUmur } from '../utils/validators.js';

/**
 * Get rekap penduduk dengan grouping
 *
 * @route GET /api/laporan/penduduk/rekap
 * @access Private (ADMIN, OPERATOR bisa akses)
 *
 * @query {string} rt - Filter by RT
 * @query {string} rw - Filter by RW
 * @query {string} statusKependudukan - Filter by status
 * @query {number} usiaMin - Filter usia minimal
 * @query {number} usiaMax - Filter usia maksimal
 * @query {string} jenisKelamin - Filter by jenis kelamin
 * @query {string} agama - Filter by agama
 * @query {string} pendidikan - Filter by pendidikan
 *
 * @returns {Object} { success, message, data: { rekap, summary } }
 */
export const getRekapPenduduk = async (req, res) => {
  try {
    const {
      rt,
      rw,
      statusKependudukan,
      usiaMin,
      usiaMax,
      jenisKelamin,
      agama,
      pendidikan,
    } = req.query;

    // Build where clause
    const where = {};

    if (rt) where.rt = { contains: rt };
    if (rw) where.rw = { contains: rw };
    if (statusKependudukan) where.statusKependudukan = statusKependudukan;
    if (jenisKelamin) where.jenisKelamin = jenisKelamin;
    if (agama) where.agama = { contains: agama };
    if (pendidikan) where.pendidikan = { contains: pendidikan };

    // Get semua penduduk yang sesuai filter
    const penduduk = await prisma.penduduk.findMany({
      where,
      select: {
        id: true,
        nik: true,
        nama: true,
        tanggalLahir: true,
        jenisKelamin: true,
        agama: true,
        pendidikan: true,
        pekerjaan: true,
        statusKependudukan: true,
        rt: true,
        rw: true,
      },
    });

    // Filter by usia jika ada
    let filteredPenduduk = penduduk;
    if (usiaMin || usiaMax) {
      filteredPenduduk = penduduk.filter((p) => {
        const umur = calculateUmur(p.tanggalLahir);
        if (usiaMin && umur < parseInt(usiaMin)) return false;
        if (usiaMax && umur > parseInt(usiaMax)) return false;
        return true;
      });
    }

    // Grouping data
    const rekap = {
      total: filteredPenduduk.length,
      perJenisKelamin: {},
      perStatus: {},
      perAgama: {},
      perPendidikan: {},
      perRT: {},
      perRW: {},
      perUsia: {
        '0-5': 0,
        '6-17': 0,
        '18-60': 0,
        '60+': 0,
      },
    };

    filteredPenduduk.forEach((p) => {
      const umur = calculateUmur(p.tanggalLahir);

      // Per jenis kelamin
      rekap.perJenisKelamin[p.jenisKelamin] =
        (rekap.perJenisKelamin[p.jenisKelamin] || 0) + 1;

      // Per status
      rekap.perStatus[p.statusKependudukan] =
        (rekap.perStatus[p.statusKependudukan] || 0) + 1;

      // Per agama
      if (p.agama) {
        rekap.perAgama[p.agama] = (rekap.perAgama[p.agama] || 0) + 1;
      }

      // Per pendidikan
      if (p.pendidikan) {
        rekap.perPendidikan[p.pendidikan] =
          (rekap.perPendidikan[p.pendidikan] || 0) + 1;
      }

      // Per RT
      if (p.rt) {
        rekap.perRT[p.rt] = (rekap.perRT[p.rt] || 0) + 1;
      }

      // Per RW
      if (p.rw) {
        rekap.perRW[p.rw] = (rekap.perRW[p.rw] || 0) + 1;
      }

      // Per usia
      if (umur >= 0 && umur <= 5) rekap.perUsia['0-5']++;
      else if (umur >= 6 && umur <= 17) rekap.perUsia['6-17']++;
      else if (umur >= 18 && umur <= 60) rekap.perUsia['18-60']++;
      else if (umur > 60) rekap.perUsia['60+']++;
    });

    // Summary
    const summary = {
      total: rekap.total,
      lakiLaki: rekap.perJenisKelamin['Laki-laki'] || 0,
      perempuan: rekap.perJenisKelamin['Perempuan'] || 0,
      aktif: rekap.perStatus['Aktif'] || 0,
      meninggal: rekap.perStatus['Meninggal'] || 0,
      pindah: rekap.perStatus['Pindah'] || 0,
    };

    return res.status(200).json({
      success: true,
      message: 'Rekap penduduk berhasil diambil',
      data: {
        rekap,
        summary,
        detail: filteredPenduduk,
      },
    });
  } catch (error) {
    console.error('Get rekap penduduk error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil rekap penduduk.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get rekap surat dengan grouping
 *
 * @route GET /api/laporan/surat/rekap
 * @access Private (ADMIN, OPERATOR bisa akses)
 *
 * @query {string} jenisSurat - Filter by jenis surat
 * @query {string} tanggalDari - Filter tanggal dari (YYYY-MM-DD)
 * @query {string} tanggalSampai - Filter tanggal sampai (YYYY-MM-DD)
 * @query {number} userId - Filter by user yang membuat
 * @query {string} status - Filter by status
 *
 * @returns {Object} { success, message, data: { rekap, summary } }
 */
export const getRekapSurat = async (req, res) => {
  try {
    const { jenisSurat, tanggalDari, tanggalSampai, userId, status } =
      req.query;

    // Build where clause
    const where = {};

    if (jenisSurat) where.jenisSurat = jenisSurat;
    if (status) where.status = status;
    if (userId) where.userId = parseInt(userId);

    // Filter by tanggal
    if (tanggalDari || tanggalSampai) {
      where.tanggalSurat = {};
      if (tanggalDari) {
        where.tanggalSurat.gte = new Date(tanggalDari);
      }
      if (tanggalSampai) {
        where.tanggalSurat.lte = new Date(tanggalSampai);
      }
    }

    // Get semua surat yang sesuai filter
    const surat = await prisma.surat.findMany({
      where,
      include: {
        penduduk: {
          select: {
            id: true,
            nik: true,
            nama: true,
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            nama: true,
          },
        },
      },
      orderBy: { tanggalSurat: 'desc' },
    });

    // Grouping data
    const rekap = {
      total: surat.length,
      perJenisSurat: {},
      perStatus: {},
      perUser: {},
      perBulan: {},
    };

    surat.forEach((s) => {
      // Per jenis surat
      rekap.perJenisSurat[s.jenisSurat] =
        (rekap.perJenisSurat[s.jenisSurat] || 0) + 1;

      // Per status
      rekap.perStatus[s.status] = (rekap.perStatus[s.status] || 0) + 1;

      // Per user
      const userName = s.user.nama || s.user.username;
      rekap.perUser[userName] = (rekap.perUser[userName] || 0) + 1;

      // Per bulan (format: YYYY-MM)
      const bulan = s.tanggalSurat.toISOString().substring(0, 7);
      rekap.perBulan[bulan] = (rekap.perBulan[bulan] || 0) + 1;
    });

    // Summary
    const summary = {
      total: rekap.total,
      draft: rekap.perStatus['Draft'] || 0,
      selesai: rekap.perStatus['Selesai'] || 0,
      dicetak: rekap.perStatus['Dicetak'] || 0,
    };

    return res.status(200).json({
      success: true,
      message: 'Rekap surat berhasil diambil',
      data: {
        rekap,
        summary,
        detail: surat,
      },
    });
  } catch (error) {
    console.error('Get rekap surat error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil rekap surat.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
