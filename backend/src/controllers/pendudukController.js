// ============================================
// FILE: pendudukController.js
// ============================================
//
// DESKRIPSI:
// Controller untuk CRUD data penduduk
// HUMAN TOUCH: Validasi NIK 16 digit, validasi tanggal lahir, dll
//
// ALUR DATA:
// 1. Create: Validasi input → Validasi NIK → Cek duplicate → Save ke DB
// 2. Read: Get semua penduduk atau by ID dengan pagination & filter
// 3. Update: Validasi input → Cek data exist → Update
// 4. Delete: Soft delete (ubah status) atau hard delete
//
// ALASAN DESAIN:
// - Human touch: Validasi NIK, tanggal lahir sesuai aturan resmi
// - Error handling: Pesan error jelas
// - Pagination: Untuk performa saat data banyak
// - Filter: Cari berdasarkan nama, NIK, status
//
// VALIDASI HUMAN TOUCH:
// - NIK harus 16 digit, unique
// - Tanggal lahir tidak boleh di masa depan
// - Status kependudukan: Aktif, Meninggal, Pindah
//
// PENGGUNAAN:
// GET /api/penduduk - Get semua penduduk (dengan pagination)
// GET /api/penduduk/:id - Get penduduk by ID
// POST /api/penduduk - Create penduduk baru
// PUT /api/penduduk/:id - Update penduduk
// DELETE /api/penduduk/:id - Delete penduduk
//
// ============================================

import prisma from "../config/database.js";
import {
  validateNIK,
  validateTanggalLahir,
  calculateUmur,
} from "../utils/validators.js";
import { ERROR_MESSAGES, sendErrorResponse } from "../utils/errorMessages.js";
import { logActivity, formatDataForAudit } from "../services/auditLogService.js";

/**
 * Get semua penduduk dengan pagination dan filter
 *
 * @route GET /api/penduduk
 * @access Private (ADMIN, OPERATOR bisa akses)
 *
 * @query {number} page - Halaman (default: 1)
 * @query {number} limit - Jumlah data per halaman (default: 10)
 * @query {string} search - Search by nama atau NIK
 * @query {string} statusKependudukan - Filter by status (Aktif, Meninggal, Pindah)
 *
 * @returns {Object} { success, message, data: { penduduk, pagination } }
 */
export const getAllPenduduk = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";

    // Build where clause untuk filter
    const where = {};

    // Filter by search (nama atau NIK)
    // Note: MySQL tidak support mode: 'insensitive', jadi pakai contains saja
    if (search) {
      where.OR = [
        { nama: { contains: search } },
        { nik: { contains: search } },
      ];
    }

    // Advanced Filters - Multi-kriteria
    // ALASAN: User butuh filter yang lebih fleksibel untuk data besar
    if (req.query.agama) {
      where.agama = { contains: req.query.agama };
    }
    if (req.query.pendidikan) {
      where.pendidikan = { contains: req.query.pendidikan };
    }
    if (req.query.pekerjaan) {
      where.pekerjaan = { contains: req.query.pekerjaan };
    }
    if (req.query.statusKependudukan) {
      where.statusKependudukan = req.query.statusKependudukan;
    }
    if (req.query.jenisKelamin) {
      where.jenisKelamin = req.query.jenisKelamin;
    }
    if (req.query.rt) {
      where.rt = { contains: req.query.rt };
    }
    if (req.query.rw) {
      where.rw = { contains: req.query.rw };
    }
    
    // Filter by date range (tanggal lahir)
    if (req.query.tanggalLahirDari || req.query.tanggalLahirSampai) {
      where.tanggalLahir = {};
      if (req.query.tanggalLahirDari) {
        where.tanggalLahir.gte = new Date(req.query.tanggalLahirDari);
      }
      if (req.query.tanggalLahirSampai) {
        where.tanggalLahir.lte = new Date(req.query.tanggalLahirSampai);
      }
    }

    // Get penduduk dengan pagination
    const [penduduk, total] = await Promise.all([
      prisma.penduduk.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          kepalaKeluarga: {
            select: {
              id: true,
              nomorKK: true,
            },
          },
          _count: {
            select: {
              anggotaKeluarga: true,
            },
          },
        },
      }),
      prisma.penduduk.count({ where }),
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return res.status(200).json({
      success: true,
      message: "Data penduduk berhasil diambil",
      data: {
        penduduk,
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
    console.error("Get all penduduk error:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil data penduduk.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get penduduk by ID
 *
 * @route GET /api/penduduk/:id
 * @access Private (ADMIN, OPERATOR bisa akses)
 *
 * @param {number} req.params.id - ID penduduk
 *
 * @returns {Object} { success, message, data: { penduduk } }
 */
export const getPendudukById = async (req, res) => {
  try {
    const { id } = req.params;

    const penduduk = await prisma.penduduk.findUnique({
      where: { id: parseInt(id) },
      include: {
        kepalaKeluarga: {
          include: {
            anggotaKeluarga: {
              include: {
                penduduk: {
                  select: {
                    id: true,
                    nik: true,
                    nama: true,
                    hubungan: true,
                  },
                },
              },
            },
          },
        },
        anggotaKeluarga: {
          include: {
            kartuKeluarga: {
              select: {
                id: true,
                nomorKK: true,
                alamat: true,
              },
            },
          },
        },
      },
    });

    if (!penduduk) {
      return res.status(404).json({
        success: false,
        message: "Data penduduk tidak ditemukan",
      });
    }

    // Calculate umur
    const umur = calculateUmur(penduduk.tanggalLahir);

    return res.status(200).json({
      success: true,
      message: "Data penduduk berhasil diambil",
      data: {
        penduduk: {
          ...penduduk,
          umur,
        },
      },
    });
  } catch (error) {
    console.error("Get penduduk by ID error:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil data penduduk.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Create penduduk baru
 *
 * @route POST /api/penduduk
 * @access Private (ADMIN, OPERATOR bisa akses)
 *
 * @param {Object} req.body - Data penduduk
 *
 * @returns {Object} { success, message, data: { penduduk } }
 */
export const createPenduduk = async (req, res) => {
  try {
    const {
      nik,
      nama,
      tempatLahir,
      tanggalLahir,
      jenisKelamin,
      agama,
      pendidikan,
      pekerjaan,
      statusPerkawinan,
      kewarganegaraan = "WNI",
      alamat,
      rt,
      rw,
      desa,
      kecamatan,
      kabupaten,
      provinsi,
      golonganDarah,
      statusKependudukan = "Aktif",
    } = req.body;

    // Validasi field wajib
    if (
      !nik ||
      !nama ||
      !tempatLahir ||
      !tanggalLahir ||
      !jenisKelamin ||
      !alamat
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Field wajib: nik, nama, tempatLahir, tanggalLahir, jenisKelamin, alamat",
      });
    }

    // HUMAN TOUCH: Validasi NIK 16 digit
    if (!validateNIK(nik)) {
      return res.status(400).json({
        success: false,
        message: "NIK harus 16 digit angka. Pastikan NIK yang Anda masukkan benar.",
      });
    }

    // HUMAN TOUCH: Validasi tanggal lahir
    if (!validateTanggalLahir(tanggalLahir)) {
      return res.status(400).json({
        success: false,
        message: "Tanggal lahir tidak valid. Tanggal lahir tidak boleh di masa depan dan harus dalam format yang benar (YYYY-MM-DD).",
      });
    }

    // Cek apakah NIK sudah ada (HUMAN TOUCH: NIK harus unique)
    const existingPenduduk = await prisma.penduduk.findUnique({
      where: { nik },
    });

    if (existingPenduduk) {
      return res.status(400).json({
        success: false,
        message: `NIK ${nik} sudah terdaftar di sistem untuk penduduk: ${existingPenduduk.nama}. NIK harus unik dan tidak boleh duplikat.`,
      });
    }

    // MODEL ADMINISTRATIF: Validasi Ketat - Penduduk AKTIF HARUS punya KK
    // ATURAN ADMINISTRATIF: Penduduk dengan status AKTIF tidak boleh dibuat tanpa KK
    // Status AKTIF = Status administratif resmi, HARUS terdaftar di KK
    if (statusKependudukan === "Aktif") {
      // Penduduk baru tidak bisa langsung AKTIF tanpa KK
      // Status yang diizinkan untuk penduduk baru tanpa KK:
      // - "Belum Terdaftar di KK" (atau "Pindah" jika dari desa lain)
      // - "Pendatang Sementara" (opsional, jika ada)
      return res.status(400).json({
        success: false,
        message: ERROR_MESSAGES.PENDUDUK_AKTIF_CANNOT_CREATE_WITHOUT_KK,
        details: "Penduduk dengan status 'Aktif' adalah penduduk resmi desa yang harus terdaftar di Kartu Keluarga. Untuk penduduk baru, gunakan status 'Belum Terdaftar di KK' atau 'Pindah' terlebih dahulu, kemudian tambahkan ke KK dan ubah status menjadi 'Aktif' setelah terdaftar di KK.",
      });
    }

    // Create penduduk (hanya jika status bukan AKTIF)
    const newPenduduk = await prisma.penduduk.create({
      data: {
        nik,
        nama,
        tempatLahir,
        tanggalLahir: new Date(tanggalLahir),
        jenisKelamin,
        agama,
        pendidikan,
        pekerjaan,
        statusPerkawinan,
        kewarganegaraan,
        alamat,
        rt,
        rw,
        desa,
        kecamatan,
        kabupaten,
        provinsi,
        golonganDarah,
        statusKependudukan,
      },
    });

    // WAJIB PEMERINTAH: Audit Log - Catat aktivitas CREATE
    const userId = req.user?.id;
    if (userId) {
      await logActivity(
        userId,
        "CREATE",
        "Penduduk",
        newPenduduk.id,
        null, // beforeData (tidak ada karena CREATE)
        formatDataForAudit(newPenduduk, "Penduduk"), // afterData
        req,
        `Membuat data penduduk baru: ${newPenduduk.nama} (NIK: ${newPenduduk.nik})`
      );
    }

    return res.status(201).json({
      success: true,
      message: "Data penduduk berhasil ditambahkan",
      data: {
        penduduk: newPenduduk,
      },
      info: statusKependudukan !== "Aktif"
        ? "Untuk mengubah status menjadi 'Aktif', penduduk harus ditambahkan ke Kartu Keluarga terlebih dahulu."
        : undefined,
    });
  } catch (error) {
    console.error("Create penduduk error:", error);
    return sendErrorResponse(
      res,
      error,
      500,
      "Terjadi kesalahan saat menambahkan data penduduk. Silakan coba lagi atau hubungi administrator jika masalah berlanjut."
    );
  }
};

/**
 * Update penduduk
 *
 * @route PUT /api/penduduk/:id
 * @access Private (ADMIN, OPERATOR bisa akses)
 *
 * @param {number} req.params.id - ID penduduk
 * @param {Object} req.body - Data penduduk yang akan di-update
 *
 * @returns {Object} { success, message, data: { penduduk } }
 */
export const updatePenduduk = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Cek apakah penduduk ada
    const existingPenduduk = await prisma.penduduk.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingPenduduk) {
      return res.status(404).json({
        success: false,
        message: "Data penduduk tidak ditemukan",
      });
    }

    // Jika NIK di-update, validasi NIK
    if (updateData.nik && updateData.nik !== existingPenduduk.nik) {
      if (!validateNIK(updateData.nik)) {
        return res.status(400).json({
          success: false,
          message: "NIK harus 16 digit angka",
        });
      }

      // Cek apakah NIK baru sudah digunakan
      const nikExists = await prisma.penduduk.findUnique({
        where: { nik: updateData.nik },
      });

      if (nikExists) {
        return res.status(400).json({
          success: false,
          message: "NIK sudah terdaftar. NIK harus unique.",
        });
      }
    }

    // Jika tanggal lahir di-update, validasi
    if (updateData.tanggalLahir) {
      if (!validateTanggalLahir(updateData.tanggalLahir)) {
        return res.status(400).json({
          success: false,
          message: "Tanggal lahir tidak valid atau tidak boleh di masa depan",
        });
      }
      updateData.tanggalLahir = new Date(updateData.tanggalLahir);
    }

    // MODEL ADMINISTRATIF: Validasi Ketat - Penduduk AKTIF HARUS punya KK
    // ATURAN ADMINISTRATIF: Tidak boleh mengubah status menjadi AKTIF tanpa KK
    const newStatus = updateData.statusKependudukan || existingPenduduk.statusKependudukan;
    if (newStatus === "Aktif") {
      const anggotaKK = await prisma.anggotaKeluarga.findFirst({
        where: {
          pendudukId: parseInt(id),
          status: "Aktif",
        },
        include: {
          kartuKeluarga: {
            select: {
              nomorKK: true,
            },
          },
        },
      });

      if (!anggotaKK) {
        return res.status(400).json({
          success: false,
          message: ERROR_MESSAGES.PENDUDUK_AKTIF_CANNOT_UPDATE_WITHOUT_KK,
          details: "Status 'Aktif' adalah status administratif resmi yang mengharuskan penduduk terdaftar di Kartu Keluarga. Silakan tambahkan penduduk ke KK terlebih dahulu, kemudian ubah status menjadi 'Aktif'.",
        });
      }
    }

    // Update penduduk
    const updatedPenduduk = await prisma.penduduk.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    // WAJIB PEMERINTAH: Audit Log - Catat aktivitas UPDATE
    const userId = req.user?.id;
    if (userId) {
      await logActivity(
        userId,
        "UPDATE",
        "Penduduk",
        parseInt(id),
        formatDataForAudit(existingPenduduk, "Penduduk"), // beforeData
        formatDataForAudit(updatedPenduduk, "Penduduk"), // afterData
        req,
        `Mengupdate data penduduk: ${updatedPenduduk.nama} (NIK: ${updatedPenduduk.nik})`
      );
    }

    return res.status(200).json({
      success: true,
      message: "Data penduduk berhasil diupdate",
      data: {
        penduduk: updatedPenduduk,
      },
    });
  } catch (error) {
    console.error("Update penduduk error:", error);

    if (error.code === "P2002") {
      return res.status(400).json({
        success: false,
        message: "NIK sudah terdaftar. NIK harus unique.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengupdate data penduduk.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Delete penduduk
 *
 * @route DELETE /api/penduduk/:id
 * @access Private (ADMIN, OPERATOR bisa akses)
 *
 * @param {number} req.params.id - ID penduduk
 *
 * @returns {Object} { success, message }
 */
export const deletePenduduk = async (req, res) => {
  try {
    const { id } = req.params;

    // Cek apakah penduduk ada
    const existingPenduduk = await prisma.penduduk.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingPenduduk) {
      return res.status(404).json({
        success: false,
        message: "Data penduduk tidak ditemukan",
      });
    }

    // Cek apakah penduduk adalah kepala keluarga
    const isKepalaKeluarga = await prisma.kartuKeluarga.findFirst({
      where: { kepalaKeluargaId: parseInt(id) },
    });

    if (isKepalaKeluarga) {
      return res.status(400).json({
        success: false,
        message:
          "Tidak dapat menghapus penduduk yang menjadi kepala keluarga. Ubah kepala keluarga terlebih dahulu.",
      });
    }

    // PHASE 0.2: SOFT DELETE POLICY
    // Penduduk tidak dihapus, tetapi statusKependudukan diubah menjadi "Pindah"
    // Prinsip administratif: Data TIDAK dihapus, tetapi DINONAKTIFKAN atau DIUBAH STATUSNYA

    // Update status menjadi "Pindah" (soft delete)
    const updatedPenduduk = await prisma.penduduk.update({
      where: { id: parseInt(id) },
      data: {
        statusKependudukan: "Pindah",
      },
    });

    // WAJIB PEMERINTAH: Audit Log - Catat aktivitas DELETE (soft delete)
    const userId = req.user?.id;
    if (userId) {
      await logActivity(
        userId,
        "DELETE",
        "Penduduk",
        parseInt(id),
        formatDataForAudit(existingPenduduk, "Penduduk"), // beforeData
        formatDataForAudit(updatedPenduduk, "Penduduk"), // afterData (statusKependudukan = "Pindah")
        req,
        `Menghapus data penduduk (soft delete): ${existingPenduduk.nama} (NIK: ${existingPenduduk.nik}) - Status diubah menjadi "Pindah"`
      );
    }

    return res.status(200).json({
      success: true,
      message: "Data penduduk berhasil dihapus (status diubah menjadi 'Pindah')",
    });
  } catch (error) {
    console.error("Delete penduduk error:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat menghapus data penduduk.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
