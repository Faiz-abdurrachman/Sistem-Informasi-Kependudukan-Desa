// ============================================
// FILE: suratController.js
// ============================================
//
// DESKRIPSI:
// Controller untuk CRUD data surat administrasi desa
// HUMAN TOUCH: Penomoran surat otomatis, penandatanganan pejabat
//
// ALUR DATA:
// 1. Create: Generate nomor surat → Validasi data → Create surat
// 2. Read: Get semua surat atau by ID dengan pagination & filter
// 3. Update: Update data surat (nomor surat tidak bisa diubah)
// 4. Delete: Hapus surat
//
// ALASAN DESAIN:
// - Human touch: Penomoran surat sesuai aturan administrasi desa
// - Auto numbering: Nomor surat otomatis increment per jenis dan tahun
// - Pejabat: Tracking siapa yang menandatangani surat
// - Status: Draft, Selesai, Dicetak untuk tracking workflow
//
// VALIDASI HUMAN TOUCH:
// - Nomor surat otomatis generate (tidak bisa diubah manual)
// - Penandatangan harus pejabat desa (Kepala Desa, Sekretaris Desa)
// - Status surat: Draft → Selesai → Dicetak
//
// PENGGUNAAN:
// GET /api/surat - Get semua surat (dengan pagination)
// GET /api/surat/:id - Get surat by ID
// POST /api/surat - Create surat baru
// PUT /api/surat/:id - Update surat
// DELETE /api/surat/:id - Delete surat
// PATCH /api/surat/:id/status - Update status surat
//
// ============================================

import prisma from "../config/database.js";
import {
  generateNomorSurat,
  getKodeJenisSurat,
} from "../services/suratGenerator.js";

/**
 * Get semua surat dengan pagination dan filter
 *
 * @route GET /api/surat
 * @access Private (ADMIN, OPERATOR bisa akses)
 *
 * @query {number} page - Halaman (default: 1)
 * @query {number} limit - Jumlah data per halaman (default: 10)
 * @query {string} search - Search by nomor surat atau nama penduduk
 * @query {string} jenisSurat - Filter by jenis surat
 * @query {string} status - Filter by status (Draft, Selesai, Dicetak)
 *
 * @returns {Object} { success, message, data: { surat, pagination } }
 */
export const getAllSurat = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";
    const jenisSurat = req.query.jenisSurat;
    const status = req.query.status;

    // Build where clause untuk filter
    const where = {};

    // Filter by search (nomor surat atau nama penduduk)
    // Note: MySQL tidak support mode: 'insensitive', jadi pakai contains saja
    if (search) {
      where.OR = [
        { nomorSurat: { contains: search } },
        { penduduk: { nama: { contains: search } } },
      ];
    }

    // Filter by jenis surat
    if (jenisSurat) {
      where.jenisSurat = jenisSurat;
    }

    // Filter by status
    if (status) {
      where.status = status;
    }

    // Get surat dengan pagination
    const [surat, total] = await Promise.all([
      prisma.surat.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
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
      }),
      prisma.surat.count({ where }),
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return res.status(200).json({
      success: true,
      message: "Data surat berhasil diambil",
      data: {
        surat,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage,
          hasPrevPage,
        },
      },
    });
  } catch (error) {
    console.error("Get all surat error:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil data surat.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get surat by ID
 *
 * @route GET /api/surat/:id
 * @access Private (ADMIN, OPERATOR bisa akses)
 *
 * @param {number} req.params.id - ID surat
 *
 * @returns {Object} { success, message, data: { surat } }
 */
export const getSuratById = async (req, res) => {
  try {
    const { id } = req.params;

    const surat = await prisma.surat.findUnique({
      where: { id: parseInt(id) },
      include: {
        penduduk: {
          select: {
            id: true,
            nik: true,
            nama: true,
            tempatLahir: true,
            tanggalLahir: true,
            jenisKelamin: true,
            alamat: true,
            rt: true,
            rw: true,
            desa: true,
            kecamatan: true,
            kabupaten: true,
            provinsi: true,
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            nama: true,
            role: true,
          },
        },
      },
    });

    if (!surat) {
      return res.status(404).json({
        success: false,
        message: "Data surat tidak ditemukan",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Data surat berhasil diambil",
      data: {
        surat,
      },
    });
  } catch (error) {
    console.error("Get surat by ID error:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil data surat.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Create surat baru
 *
 * @route POST /api/surat
 * @access Private (ADMIN, OPERATOR bisa akses)
 *
 * @param {Object} req.body - Data surat
 * @param {string} req.body.jenisSurat - Jenis surat (SKD, KET, SKTM, dll)
 * @param {number} req.body.pendudukId - ID penduduk (opsional)
 * @param {string} req.body.keterangan - Keterangan surat
 * @param {string} req.body.penandatangan - Nama pejabat penandatangan
 * @param {string} req.body.jabatan - Jabatan penandatangan
 *
 * @returns {Object} { success, message, data: { surat } }
 */
export const createSurat = async (req, res) => {
  try {
    const {
      jenisSurat,
      pendudukId,
      keterangan,
      penandatangan,
      jabatan,
      tanggalSurat,
    } = req.body;

    // Validasi field wajib
    if (!jenisSurat || !penandatangan || !jabatan) {
      return res.status(400).json({
        success: false,
        message: "Field wajib: jenisSurat, penandatangan, jabatan",
      });
    }

    // Validasi jenis surat
    const validJenis = ["SKD", "KET", "SKTM", "SKU", "SKP", "SKM"];
    if (!validJenis.includes(jenisSurat)) {
      return res.status(400).json({
        success: false,
        message: `Jenis surat tidak valid. Pilih salah satu: ${validJenis.join(
          ", "
        )}`,
      });
    }

    // Jika pendudukId diisi, cek apakah penduduk ada
    if (pendudukId) {
      const penduduk = await prisma.penduduk.findUnique({
        where: { id: parseInt(pendudukId) },
      });

      if (!penduduk) {
        return res.status(404).json({
          success: false,
          message: "Data penduduk tidak ditemukan",
        });
      }
    }

    // HUMAN TOUCH: Generate nomor surat otomatis
    const tahun = tanggalSurat
      ? new Date(tanggalSurat).getFullYear()
      : new Date().getFullYear();
    const nomorSurat = await generateNomorSurat(jenisSurat, tahun);

    // Get user ID dari req.user (dari authMiddleware)
    const userId = req.user.id;

    // Create surat
    const newSurat = await prisma.surat.create({
      data: {
        nomorSurat,
        jenisSurat,
        pendudukId: pendudukId ? parseInt(pendudukId) : null,
        userId,
        keterangan,
        penandatangan,
        jabatan,
        tanggalSurat: tanggalSurat ? new Date(tanggalSurat) : new Date(),
        status: "Draft",
      },
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
    });

    return res.status(201).json({
      success: true,
      message: "Surat berhasil dibuat",
      data: {
        surat: newSurat,
      },
    });
  } catch (error) {
    console.error("Create surat error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Terjadi kesalahan saat membuat surat.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Update surat
 *
 * @route PUT /api/surat/:id
 * @access Private (ADMIN, OPERATOR bisa akses)
 *
 * @param {number} req.params.id - ID surat
 * @param {Object} req.body - Data yang akan di-update
 *
 * @returns {Object} { success, message, data: { surat } }
 */
export const updateSurat = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Cek apakah surat ada
    const existingSurat = await prisma.surat.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingSurat) {
      return res.status(404).json({
        success: false,
        message: "Data surat tidak ditemukan",
      });
    }

    // Nomor surat tidak bisa diubah (HUMAN TOUCH: nomor surat sudah final)
    if (
      updateData.nomorSurat &&
      updateData.nomorSurat !== existingSurat.nomorSurat
    ) {
      return res.status(400).json({
        success: false,
        message: "Nomor surat tidak dapat diubah. Nomor surat sudah final.",
      });
    }

    // Jika jenis surat diubah, validasi
    if (updateData.jenisSurat) {
      const validJenis = ["SKD", "KET", "SKTM", "SKU", "SKP", "SKM"];
      if (!validJenis.includes(updateData.jenisSurat)) {
        return res.status(400).json({
          success: false,
          message: `Jenis surat tidak valid. Pilih salah satu: ${validJenis.join(
            ", "
          )}`,
        });
      }
    }

    // Jika pendudukId diubah, cek apakah penduduk ada
    if (updateData.pendudukId) {
      const penduduk = await prisma.penduduk.findUnique({
        where: { id: parseInt(updateData.pendudukId) },
      });

      if (!penduduk) {
        return res.status(404).json({
          success: false,
          message: "Data penduduk tidak ditemukan",
        });
      }
    }

    // Update surat
    const updatedSurat = await prisma.surat.update({
      where: { id: parseInt(id) },
      data: updateData,
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
    });

    return res.status(200).json({
      success: true,
      message: "Surat berhasil diupdate",
      data: {
        surat: updatedSurat,
      },
    });
  } catch (error) {
    console.error("Update surat error:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengupdate surat.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Update status surat
 *
 * @route PATCH /api/surat/:id/status
 * @access Private (ADMIN, OPERATOR bisa akses)
 *
 * @param {number} req.params.id - ID surat
 * @param {Object} req.body - Status baru
 * @param {string} req.body.status - Status baru (Draft, Selesai, Dicetak)
 *
 * @returns {Object} { success, message, data: { surat } }
 */
export const updateStatusSurat = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validasi status
    const validStatus = ["Draft", "Selesai", "Dicetak"];
    if (!status || !validStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status tidak valid. Pilih salah satu: ${validStatus.join(
          ", "
        )}`,
      });
    }

    // Cek apakah surat ada
    const existingSurat = await prisma.surat.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingSurat) {
      return res.status(404).json({
        success: false,
        message: "Data surat tidak ditemukan",
      });
    }

    // Update status
    const updatedSurat = await prisma.surat.update({
      where: { id: parseInt(id) },
      data: { status },
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
    });

    return res.status(200).json({
      success: true,
      message: "Status surat berhasil diupdate",
      data: {
        surat: updatedSurat,
      },
    });
  } catch (error) {
    console.error("Update status surat error:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengupdate status surat.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Delete surat
 *
 * @route DELETE /api/surat/:id
 * @access Private (ADMIN, OPERATOR bisa akses)
 *
 * @param {number} req.params.id - ID surat
 *
 * @returns {Object} { success, message }
 */
export const deleteSurat = async (req, res) => {
  try {
    const { id } = req.params;

    // Cek apakah surat ada
    const existingSurat = await prisma.surat.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingSurat) {
      return res.status(404).json({
        success: false,
        message: "Data surat tidak ditemukan",
      });
    }

    // Delete surat
    await prisma.surat.delete({
      where: { id: parseInt(id) },
    });

    return res.status(200).json({
      success: true,
      message: "Surat berhasil dihapus",
    });
  } catch (error) {
    console.error("Delete surat error:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat menghapus surat.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
