// ============================================
// FILE: auditLogService.js
// ============================================
//
// DESKRIPSI:
// Service untuk audit log system
// WAJIB PEMERINTAH: Mencatat semua aktivitas perubahan data
//
// FUNGSI UTAMA:
// - logActivity: Mencatat aktivitas user ke audit log
// - Helper function untuk format data sebelum/sesudah
//
// PENGGUNAAN:
// - Dipanggil dari controller setelah CREATE, UPDATE, DELETE
// - Mencatat: userId, aksi, entity, entityId, beforeData, afterData
// - Mencatat: ipAddress, userAgent dari request
//
// ============================================

import prisma from "../config/database.js";

/**
 * Log aktivitas ke audit log
 *
 * @param {number} userId - ID user yang melakukan aksi
 * @param {string} aksi - Aksi yang dilakukan (CREATE, UPDATE, DELETE, VIEW)
 * @param {string} entity - Nama entity (Penduduk, KartuKeluarga, Surat, User)
 * @param {number|null} entityId - ID entity yang diubah (null untuk CREATE sebelum id dibuat)
 * @param {Object|null} beforeData - Data sebelum perubahan (untuk UPDATE)
 * @param {Object|null} afterData - Data setelah perubahan
 * @param {Object|null} req - Request object (untuk ambil ipAddress, userAgent)
 * @param {string|null} keterangan - Keterangan tambahan (opsional)
 *
 * @returns {Promise<Object>} AuditLog record yang dibuat
 */
export const logActivity = async (
  userId,
  aksi,
  entity,
  entityId = null,
  beforeData = null,
  afterData = null,
  req = null,
  keterangan = null
) => {
  try {
    // Extract IP address dan user agent dari request
    const ipAddress = req
      ? req.ip || req.connection?.remoteAddress || req.headers?.["x-forwarded-for"]?.split(",")[0] || null
      : null;

    const userAgent = req ? req.headers?.["user-agent"] || null : null;

    // Create audit log record
    const auditLog = await prisma.auditLog.create({
      data: {
        userId,
        aksi,
        entity,
        entityId,
        beforeData: beforeData ? JSON.parse(JSON.stringify(beforeData)) : null, // Deep clone untuk menghindari reference issue
        afterData: afterData ? JSON.parse(JSON.stringify(afterData)) : null, // Deep clone
        ipAddress,
        userAgent,
        keterangan,
      },
    });

    return auditLog;
  } catch (error) {
    // Log error tapi jangan throw (audit log tidak boleh menghalangi operasi utama)
    console.error("Error logging activity to audit log:", error);
    return null;
  }
};

/**
 * Helper: Format data untuk audit log (hapus sensitive data)
 *
 * @param {Object} data - Data yang akan diformat
 * @param {string} entity - Nama entity
 *
 * @returns {Object} Data yang sudah diformat (tanpa sensitive data)
 */
export const formatDataForAudit = (data, entity) => {
  if (!data) return null;

  // Deep clone data
  const formatted = JSON.parse(JSON.stringify(data));

  // Hapus sensitive data berdasarkan entity
  if (entity === "User") {
    // Hapus password dari user data
    if (formatted.password) delete formatted.password;
  }

  // Hapus field internal yang tidak perlu di-log
  delete formatted.createdAt;
  delete formatted.updatedAt;

  return formatted;
};

/**
 * Helper: Get aksi type dari HTTP method
 *
 * @param {string} method - HTTP method (POST, PUT, PATCH, DELETE)
 *
 * @returns {string} Aksi type (CREATE, UPDATE, DELETE)
 */
export const getAksiFromMethod = (method) => {
  const methodUpper = method.toUpperCase();
  switch (methodUpper) {
    case "POST":
      return "CREATE";
    case "PUT":
    case "PATCH":
      return "UPDATE";
    case "DELETE":
      return "DELETE";
    default:
      return "VIEW";
  }
};

