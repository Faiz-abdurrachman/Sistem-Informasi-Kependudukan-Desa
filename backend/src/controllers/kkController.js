// ============================================
// FILE: kkController.js
// ============================================
//
// DESKRIPSI:
// Controller untuk CRUD data Kartu Keluarga (KK)
// HUMAN TOUCH: Validasi nomor KK 16 digit, relasi anggota keluarga
//
// ALUR DATA:
// 1. Create: Validasi nomor KK → Validasi kepala keluarga → Create KK → Tambah anggota
// 2. Read: Get semua KK atau by ID dengan relasi anggota keluarga
// 3. Update: Update data KK atau tambah/kurang anggota
// 4. Delete: Hapus KK dan relasi anggota (cascade)
//
// ALASAN DESAIN:
// - Human touch: Validasi KK sesuai aturan resmi (16 digit, unique)
// - Relasi kompleks: KK punya kepala keluarga dan banyak anggota
// - Data integrity: Cascade delete untuk menjaga konsistensi data
// - Error handling: Pesan error jelas untuk user
//
// VALIDASI HUMAN TOUCH:
// - Nomor KK harus 16 digit, unique
// - Kepala keluarga harus sudah terdaftar sebagai penduduk
// - Anggota keluarga tidak boleh duplikat dalam 1 KK
//
// PENGGUNAAN:
// GET /api/kk - Get semua KK (dengan pagination)
// GET /api/kk/:id - Get KK by ID dengan anggota keluarga
// POST /api/kk - Create KK baru
// PUT /api/kk/:id - Update KK
// DELETE /api/kk/:id - Delete KK
// POST /api/kk/:id/anggota - Tambah anggota keluarga
// DELETE /api/kk/:id/anggota/:anggotaId - Hapus anggota keluarga
//
// ============================================

import prisma from "../config/database.js";
import { validateKK } from "../utils/validators.js";
import { ERROR_MESSAGES, sendErrorResponse } from "../utils/errorMessages.js";

/**
 * Get semua Kartu Keluarga dengan pagination dan filter
 *
 * @route GET /api/kk
 * @access Private (ADMIN, OPERATOR bisa akses)
 *
 * @query {number} page - Halaman (default: 1)
 * @query {number} limit - Jumlah data per halaman (default: 10)
 * @query {string} search - Search by nomor KK atau nama kepala keluarga
 *
 * @returns {Object} { success, message, data: { kk, pagination } }
 */
export const getAllKK = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";

    // Build where clause untuk filter
    const where = {};

    // Filter by search (nomor KK atau nama kepala keluarga)
    // Note: MySQL tidak support mode: 'insensitive', jadi pakai contains saja
    if (search) {
      where.OR = [
        { nomorKK: { contains: search } },
        { kepalaKeluarga: { nama: { contains: search } } },
      ];
    }

    // Get KK dengan pagination
    // Simplified query untuk avoid error dengan relasi kompleks
    const [kk, total] = await Promise.all([
      prisma.kartuKeluarga.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          kepalaKeluarga: {
            select: {
              id: true,
              nik: true,
              nama: true,
              jenisKelamin: true,
            },
          },
          _count: {
            select: {
              anggotaKeluarga: true,
            },
          },
        },
      }),
      prisma.kartuKeluarga.count({ where }),
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return res.status(200).json({
      success: true,
      message: "Data Kartu Keluarga berhasil diambil",
      data: {
        kk,
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
    console.error("Get all KK error:", error);
    console.error("Error stack:", error.stack);
    console.error("Error details:", {
      name: error.name,
      code: error.code,
      meta: error.meta,
    });
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil data Kartu Keluarga.",
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
 * Get Kartu Keluarga by ID dengan detail lengkap
 *
 * @route GET /api/kk/:id
 * @access Private (ADMIN, OPERATOR bisa akses)
 *
 * @param {number} req.params.id - ID Kartu Keluarga
 *
 * @returns {Object} { success, message, data: { kk } }
 */
export const getKKById = async (req, res) => {
  try {
    const { id } = req.params;

    const kk = await prisma.kartuKeluarga.findUnique({
      where: { id: parseInt(id) },
      include: {
        kepalaKeluarga: {
          select: {
            id: true,
            nik: true,
            nama: true,
            tempatLahir: true,
            tanggalLahir: true,
            jenisKelamin: true,
            agama: true,
            pendidikan: true,
            pekerjaan: true,
            statusPerkawinan: true,
            alamat: true,
            rt: true,
            rw: true,
          },
        },
        anggotaKeluarga: {
          include: {
            penduduk: {
              select: {
                id: true,
                nik: true,
                nama: true,
                tempatLahir: true,
                tanggalLahir: true,
                jenisKelamin: true,
                agama: true,
                pendidikan: true,
                pekerjaan: true,
                statusPerkawinan: true,
              },
            },
          },
          orderBy: [
            { hubungan: "asc" }, // Kepala Keluarga dulu
            { createdAt: "asc" },
          ],
        },
      },
    });

    if (!kk) {
      return res.status(404).json({
        success: false,
        message: "Data Kartu Keluarga tidak ditemukan",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Data Kartu Keluarga berhasil diambil",
      data: {
        kk,
      },
    });
  } catch (error) {
    console.error("Get KK by ID error:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil data Kartu Keluarga.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Create Kartu Keluarga baru
 *
 * @route POST /api/kk
 * @access Private (ADMIN, OPERATOR bisa akses)
 *
 * @param {Object} req.body - Data Kartu Keluarga
 * @param {string} req.body.nomorKK - Nomor KK (16 digit, unique)
 * @param {number} req.body.kepalaKeluargaId - ID penduduk sebagai kepala keluarga
 * @param {string} req.body.alamat - Alamat lengkap
 * @param {string} req.body.rt - RT
 * @param {string} req.body.rw - RW
 * @param {string} req.body.desa - Nama desa
 * @param {string} req.body.kecamatan - Nama kecamatan
 * @param {string} req.body.kabupaten - Nama kabupaten
 * @param {string} req.body.provinsi - Nama provinsi
 * @param {string} req.body.kodePos - Kode pos (opsional)
 * @param {Array} req.body.anggotaKeluarga - Array anggota keluarga (opsional)
 *
 * @returns {Object} { success, message, data: { kk } }
 */
export const createKK = async (req, res) => {
  try {
    const {
      nomorKK,
      kepalaKeluargaId,
      alamat,
      rt,
      rw,
      desa,
      kecamatan,
      kabupaten,
      provinsi,
      kodePos,
      anggotaKeluarga = [],
    } = req.body;

    // Validasi field wajib
    if (
      !nomorKK ||
      !kepalaKeluargaId ||
      !alamat ||
      !rt ||
      !rw ||
      !desa ||
      !kecamatan ||
      !kabupaten ||
      !provinsi
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Field wajib: nomorKK, kepalaKeluargaId, alamat, rt, rw, desa, kecamatan, kabupaten, provinsi",
      });
    }

    // HUMAN TOUCH: Validasi nomor KK 16 digit
    if (!validateKK(nomorKK)) {
      return res.status(400).json({
        success: false,
        message: "Nomor KK harus 16 digit angka",
      });
    }

    // Cek apakah nomor KK sudah ada
    const existingKK = await prisma.kartuKeluarga.findUnique({
      where: { nomorKK },
    });

    if (existingKK) {
      return res.status(400).json({
        success: false,
        message: "Nomor KK sudah terdaftar. Nomor KK harus unique.",
      });
    }

    // Cek apakah kepala keluarga ada
    const kepalaKeluarga = await prisma.penduduk.findUnique({
      where: { id: parseInt(kepalaKeluargaId) },
    });

    if (!kepalaKeluarga) {
      return res.status(404).json({
        success: false,
        message:
          "Data kepala keluarga tidak ditemukan. Pastikan penduduk sudah terdaftar.",
      });
    }

    // PHASE 5.2: Validasi kepala keluarga tidak boleh jadi anggota KK lain
    if (kepalaKeluarga.statusKependudukan === "Aktif") {
      const existingAnggota = await prisma.anggotaKeluarga.findFirst({
        where: {
          pendudukId: parseInt(kepalaKeluargaId),
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

      if (existingAnggota) {
        return res.status(400).json({
          success: false,
          message: `Penduduk yang dipilih sebagai kepala keluarga sudah terdaftar sebagai anggota Kartu Keluarga ${existingAnggota.kartuKeluarga.nomorKK}. Kepala keluarga tidak boleh menjadi anggota Kartu Keluarga lain.`,
        });
      }
    }

    // Create KK dengan anggota keluarga dalam transaction
    const newKK = await prisma.$transaction(async (tx) => {
      // 1. Create KK
      const kk = await tx.kartuKeluarga.create({
        data: {
          nomorKK,
          kepalaKeluargaId: parseInt(kepalaKeluargaId),
          alamat,
          rt,
          rw,
          desa,
          kecamatan,
          kabupaten,
          provinsi,
          kodePos,
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
      });

      // 2. Tambah kepala keluarga sebagai anggota (dengan hubungan "Kepala Keluarga")
      await tx.anggotaKeluarga.create({
        data: {
          kartuKeluargaId: kk.id,
          pendudukId: parseInt(kepalaKeluargaId),
          hubungan: "Kepala Keluarga",
          status: "Aktif",
        },
      });

      // 3. Tambah anggota keluarga lainnya jika ada
      if (Array.isArray(anggotaKeluarga) && anggotaKeluarga.length > 0) {
        // Validasi anggota tidak duplikat
        const anggotaIds = anggotaKeluarga.map((a) => a.pendudukId);
        const uniqueAnggotaIds = [...new Set(anggotaIds)];

        if (anggotaIds.length !== uniqueAnggotaIds.length) {
          throw new Error(
            "Terdapat duplikasi anggota keluarga dalam data yang dikirim"
          );
        }

        // Cek apakah kepala keluarga tidak ada di anggota
        if (anggotaIds.includes(parseInt(kepalaKeluargaId))) {
          throw new Error(
            "Kepala keluarga tidak perlu ditambahkan sebagai anggota. Sudah otomatis ditambahkan."
          );
        }

        // Cek apakah semua anggota ada di database
        const anggotaPenduduk = await tx.penduduk.findMany({
          where: {
            id: { in: anggotaIds.map((id) => parseInt(id)) },
          },
          select: {
            id: true,
            statusKependudukan: true,
          },
        });

        if (anggotaPenduduk.length !== anggotaIds.length) {
          throw new Error(
            "Beberapa data anggota keluarga tidak ditemukan. Pastikan semua penduduk sudah terdaftar."
          );
        }

        // PHASE 1.1 & 5.1: Validasi penduduk aktif tidak boleh jadi anggota KK lain
        const pendudukAktif = anggotaPenduduk.filter(
          (p) => p.statusKependudukan === "Aktif"
        );
        if (pendudukAktif.length > 0) {
          const existingAnggota = await tx.anggotaKeluarga.findMany({
            where: {
              pendudukId: { in: pendudukAktif.map((p) => p.id) },
              status: "Aktif",
            },
          });

          if (existingAnggota.length > 0) {
            const pendudukIds = existingAnggota.map((a) => a.pendudukId);
            const pendudukNames = await tx.penduduk.findMany({
              where: { id: { in: pendudukIds } },
              select: { nama: true },
            });
            throw new Error(
              `Beberapa penduduk aktif sudah terdaftar sebagai anggota Kartu Keluarga lain: ${pendudukNames.map((p) => p.nama).join(", ")}`
            );
          }
        }

        // Tambah anggota keluarga
        await tx.anggotaKeluarga.createMany({
          data: anggotaKeluarga.map((anggota) => ({
            kartuKeluargaId: kk.id,
            pendudukId: parseInt(anggota.pendudukId),
            hubungan: anggota.hubungan || "Anggota",
            status: anggota.status || "Aktif",
          })),
        });

        // PHASE 1.1: Auto-sync nomorKK untuk semua anggota yang ditambahkan
        await tx.penduduk.updateMany({
          where: {
            id: { in: anggotaIds.map((id) => parseInt(id)) },
          },
          data: {
            nomorKK: kk.nomorKK,
          },
        });
      }

      // PHASE 1.1: Auto-sync nomorKK untuk kepala keluarga
      await tx.penduduk.update({
        where: { id: parseInt(kepalaKeluargaId) },
        data: {
          nomorKK: kk.nomorKK,
        },
      });

      // 4. Get KK dengan semua anggota
      return await tx.kartuKeluarga.findUnique({
        where: { id: kk.id },
        include: {
          kepalaKeluarga: {
            select: {
              id: true,
              nik: true,
              nama: true,
            },
          },
          anggotaKeluarga: {
            include: {
              penduduk: {
                select: {
                  id: true,
                  nik: true,
                  nama: true,
                },
              },
            },
          },
        },
      });
    });

    return res.status(201).json({
      success: true,
      message: "Data Kartu Keluarga berhasil ditambahkan",
      data: {
        kk: newKK,
      },
    });
  } catch (error) {
    console.error("Create KK error:", error);

    // Handle Prisma unique constraint error
    if (error.code === "P2002") {
      return res.status(400).json({
        success: false,
        message: "Nomor KK sudah terdaftar. Nomor KK harus unique.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Terjadi kesalahan saat menambahkan data Kartu Keluarga.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Update Kartu Keluarga
 *
 * @route PUT /api/kk/:id
 * @access Private (ADMIN, OPERATOR bisa akses)
 *
 * @param {number} req.params.id - ID Kartu Keluarga
 * @param {Object} req.body - Data yang akan di-update
 *
 * @returns {Object} { success, message, data: { kk } }
 */
export const updateKK = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Cek apakah KK ada
    const existingKK = await prisma.kartuKeluarga.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingKK) {
      return res.status(404).json({
        success: false,
        message: "Data Kartu Keluarga tidak ditemukan",
      });
    }

    // Jika nomor KK di-update, validasi
    if (updateData.nomorKK && updateData.nomorKK !== existingKK.nomorKK) {
      if (!validateKK(updateData.nomorKK)) {
        return res.status(400).json({
          success: false,
          message: "Nomor KK harus 16 digit angka",
        });
      }

      // Cek apakah nomor KK baru sudah digunakan
      const kkExists = await prisma.kartuKeluarga.findUnique({
        where: { nomorKK: updateData.nomorKK },
      });

      if (kkExists) {
        return res.status(400).json({
          success: false,
          message: "Nomor KK sudah terdaftar. Nomor KK harus unique.",
        });
      }
    }

    // Jika kepala keluarga di-update, cek apakah ada
    if (updateData.kepalaKeluargaId) {
      const kepalaKeluarga = await prisma.penduduk.findUnique({
        where: { id: parseInt(updateData.kepalaKeluargaId) },
      });

      if (!kepalaKeluarga) {
        return res.status(404).json({
          success: false,
          message: "Data kepala keluarga tidak ditemukan",
        });
      }

      // PHASE 5.2: Validasi kepala keluarga tidak boleh jadi anggota KK lain
      if (kepalaKeluarga.statusKependudukan === "Aktif") {
        const existingAnggota = await prisma.anggotaKeluarga.findFirst({
          where: {
            pendudukId: parseInt(updateData.kepalaKeluargaId),
            kartuKeluargaId: { not: parseInt(id) },
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

        if (existingAnggota) {
          return res.status(400).json({
            success: false,
            message: `Penduduk yang dipilih sebagai kepala keluarga sudah terdaftar sebagai anggota Kartu Keluarga ${existingAnggota.kartuKeluarga.nomorKK}. Kepala keluarga tidak boleh menjadi anggota Kartu Keluarga lain.`,
          });
        }
      }
    }

    // Update KK
    const updatedKK = await prisma.kartuKeluarga.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        kepalaKeluarga: {
          select: {
            id: true,
            nik: true,
            nama: true,
          },
        },
        anggotaKeluarga: {
          include: {
            penduduk: {
              select: {
                id: true,
                nik: true,
                nama: true,
              },
            },
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: "Data Kartu Keluarga berhasil diupdate",
      data: {
        kk: updatedKK,
      },
    });
  } catch (error) {
    console.error("Update KK error:", error);

    if (error.code === "P2002") {
      return res.status(400).json({
        success: false,
        message: "Nomor KK sudah terdaftar. Nomor KK harus unique.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengupdate data Kartu Keluarga.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Delete Kartu Keluarga
 *
 * @route DELETE /api/kk/:id
 * @access Private (ADMIN, OPERATOR bisa akses)
 *
 * @param {number} req.params.id - ID Kartu Keluarga
 *
 * @returns {Object} { success, message }
 */
export const deleteKK = async (req, res) => {
  try {
    const { id } = req.params;

    // Cek apakah KK ada
    const existingKK = await prisma.kartuKeluarga.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingKK) {
      return res.status(404).json({
        success: false,
        message: "Data Kartu Keluarga tidak ditemukan",
      });
    }

    // Delete KK (anggota keluarga akan terhapus otomatis karena cascade)
    await prisma.kartuKeluarga.delete({
      where: { id: parseInt(id) },
    });

    return res.status(200).json({
      success: true,
      message: "Data Kartu Keluarga berhasil dihapus",
    });
  } catch (error) {
    console.error("Delete KK error:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat menghapus data Kartu Keluarga.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Tambah anggota keluarga ke KK
 *
 * @route POST /api/kk/:id/anggota
 * @access Private (ADMIN, OPERATOR bisa akses)
 *
 * @param {number} req.params.id - ID Kartu Keluarga
 * @param {Object} req.body - Data anggota
 * @param {number} req.body.pendudukId - ID penduduk
 * @param {string} req.body.hubungan - Hubungan dengan kepala keluarga
 * @param {string} req.body.status - Status anggota (default: Aktif)
 *
 * @returns {Object} { success, message, data: { anggota } }
 */
export const addAnggotaKeluarga = async (req, res) => {
  try {
    const { id } = req.params;
    const { pendudukId, hubungan, status = "Aktif" } = req.body;

    // Validasi input
    if (!pendudukId || !hubungan) {
      return res.status(400).json({
        success: false,
        message: "Field wajib: pendudukId, hubungan",
      });
    }

    // Cek apakah KK ada
    const kk = await prisma.kartuKeluarga.findUnique({
      where: { id: parseInt(id) },
    });

    if (!kk) {
      return res.status(404).json({
        success: false,
        message: "Data Kartu Keluarga tidak ditemukan",
      });
    }

    // Cek apakah penduduk ada
    const penduduk = await prisma.penduduk.findUnique({
      where: { id: parseInt(pendudukId) },
    });

    if (!penduduk) {
      return res.status(404).json({
        success: false,
        message: "Data penduduk tidak ditemukan",
      });
    }

    // Cek apakah penduduk sudah menjadi anggota KK ini
    const existingAnggota = await prisma.anggotaKeluarga.findUnique({
      where: {
        kartuKeluargaId_pendudukId: {
          kartuKeluargaId: parseInt(id),
          pendudukId: parseInt(pendudukId),
        },
      },
    });

    if (existingAnggota) {
      return res.status(400).json({
        success: false,
        message:
          "Penduduk sudah terdaftar sebagai anggota keluarga di Kartu Keluarga ini",
      });
    }

    // PHASE 1.1: Auto-sync nomorKK di Penduduk saat tambah anggota
    // Validasi: Cek apakah penduduk sudah jadi anggota KK lain (untuk penduduk aktif)
    const pendudukData = await prisma.penduduk.findUnique({
      where: { id: parseInt(pendudukId) },
      select: {
        id: true,
        nik: true,
        nama: true,
        statusKependudukan: true,
      },
    });

    // PHASE 5.2: Validasi kepala keluarga tidak boleh jadi anggota KK lain
    const isKepalaKeluarga = await prisma.kartuKeluarga.findFirst({
      where: {
        kepalaKeluargaId: parseInt(pendudukId),
      },
      select: {
        nomorKK: true,
      },
    });

    if (isKepalaKeluarga) {
      return res.status(400).json({
        success: false,
        message: ERROR_MESSAGES.KEPALA_KELUARGA_CANNOT_BE_MEMBER,
        details: `Penduduk yang dipilih adalah kepala keluarga dari Kartu Keluarga ${isKepalaKeluarga.nomorKK}. Jika ingin memindahkan, ubah kepala keluarga di KK tersebut terlebih dahulu.`,
      });
    }

    // Jika penduduk aktif, cek apakah sudah jadi anggota KK lain
    if (pendudukData.statusKependudukan === "Aktif") {
      const existingAnggotaLain = await prisma.anggotaKeluarga.findFirst({
        where: {
          pendudukId: parseInt(pendudukId),
          kartuKeluargaId: { not: parseInt(id) },
          status: "Aktif",
        },
      });

      if (existingAnggotaLain) {
        return res.status(400).json({
          success: false,
          message: ERROR_MESSAGES.ONE_PENDUDUK_ONE_KK,
          details: "Satu penduduk aktif hanya bisa menjadi anggota satu Kartu Keluarga. Jika penduduk perlu pindah KK, hapus dulu dari KK sebelumnya.",
        });
      }
    }

    // Tambah anggota dan auto-sync nomorKK dalam transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Tambah anggota
      const anggota = await tx.anggotaKeluarga.create({
        data: {
          kartuKeluargaId: parseInt(id),
          pendudukId: parseInt(pendudukId),
          hubungan,
          status,
        },
        include: {
          penduduk: {
            select: {
              id: true,
              nik: true,
              nama: true,
            },
          },
        },
      });

      // 2. Auto-sync nomorKK di Penduduk
      await tx.penduduk.update({
        where: { id: parseInt(pendudukId) },
        data: {
          nomorKK: kk.nomorKK,
        },
      });

      return anggota;
    });

    return res.status(201).json({
      success: true,
      message: "Anggota keluarga berhasil ditambahkan",
      data: {
        anggota: result,
      },
    });
  } catch (error) {
    console.error("Add anggota keluarga error:", error);

    if (error.code === "P2002") {
      return res.status(400).json({
        success: false,
        message:
          "Penduduk sudah terdaftar sebagai anggota keluarga di Kartu Keluarga ini",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat menambahkan anggota keluarga.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Hapus anggota keluarga dari KK
 *
 * @route DELETE /api/kk/:id/anggota/:anggotaId
 * @access Private (ADMIN, OPERATOR bisa akses)
 *
 * @param {number} req.params.id - ID Kartu Keluarga
 * @param {number} req.params.anggotaId - ID anggota keluarga
 *
 * @returns {Object} { success, message }
 */
export const removeAnggotaKeluarga = async (req, res) => {
  try {
    const { id, anggotaId } = req.params;

    // Cek apakah anggota ada
    const anggota = await prisma.anggotaKeluarga.findUnique({
      where: { id: parseInt(anggotaId) },
    });

    if (!anggota) {
      return res.status(404).json({
        success: false,
        message: "Data anggota keluarga tidak ditemukan",
      });
    }

    // Cek apakah anggota termasuk dalam KK yang dimaksud
    if (anggota.kartuKeluargaId !== parseInt(id)) {
      return res.status(400).json({
        success: false,
        message: "Anggota keluarga tidak termasuk dalam Kartu Keluarga ini",
      });
    }

    // Cek apakah anggota adalah kepala keluarga
    const kk = await prisma.kartuKeluarga.findUnique({
      where: { id: parseInt(id) },
    });

    if (kk.kepalaKeluargaId === anggota.pendudukId) {
      return res.status(400).json({
        success: false,
        message:
          "Tidak dapat menghapus kepala keluarga. Ubah kepala keluarga terlebih dahulu.",
      });
    }

    // PHASE 1.1: Auto-sync nomorKK di Penduduk saat hapus anggota
    // Hapus anggota dan update nomorKK dalam transaction
    await prisma.$transaction(async (tx) => {
      // 1. Hapus anggota
      await tx.anggotaKeluarga.delete({
        where: { id: parseInt(anggotaId) },
      });

      // 2. Cek apakah penduduk masih jadi anggota KK lain
      const anggotaLain = await tx.anggotaKeluarga.findFirst({
        where: {
          pendudukId: anggota.pendudukId,
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

      // 3. Update nomorKK di Penduduk
      // Jika masih ada di KK lain, update dengan nomorKK yang baru
      // Jika tidak ada lagi, set nomorKK menjadi null
      await tx.penduduk.update({
        where: { id: anggota.pendudukId },
        data: {
          nomorKK: anggotaLain ? anggotaLain.kartuKeluarga.nomorKK : null,
        },
      });
    });

    return res.status(200).json({
      success: true,
      message: "Anggota keluarga berhasil dihapus",
    });
  } catch (error) {
    console.error("Remove anggota keluarga error:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat menghapus anggota keluarga.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
