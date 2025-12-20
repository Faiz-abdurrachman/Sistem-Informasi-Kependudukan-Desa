// ============================================
// FILE: fixAnggotaKK.js
// ============================================
// 
// DESKRIPSI:
// Script untuk memperbaiki data KK yang sudah di-import
// Menambahkan kepala keluarga sebagai anggota untuk KK yang belum punya anggota
//
// ALASAN:
// - Import KK sebelumnya tidak otomatis menambahkan kepala keluarga sebagai anggota
// - Script ini memperbaiki data yang sudah ada
//
// CARA PAKAI:
// node src/utils/fixAnggotaKK.js
//
// ============================================

import prisma from '../config/database.js';

/**
 * Fix semua KK yang belum punya anggota
 * Tambahkan kepala keluarga sebagai anggota dengan hubungan "Kepala Keluarga"
 */
const fixAnggotaKK = async () => {
  try {
    console.log('🔍 Mencari KK yang belum punya anggota...');

    // Get semua KK
    const allKK = await prisma.kartuKeluarga.findMany({
      include: {
        anggotaKeluarga: {
          select: {
            id: true,
          },
        },
        kepalaKeluarga: {
          select: {
            id: true,
            nik: true,
            nama: true,
          },
        },
      },
    });

    console.log(`📊 Total KK: ${allKK.length}`);

    // Filter KK yang belum punya anggota
    const kkWithoutAnggota = allKK.filter((kk) => kk.anggotaKeluarga.length === 0);

    console.log(`⚠️  KK tanpa anggota: ${kkWithoutAnggota.length}`);

    if (kkWithoutAnggota.length === 0) {
      console.log('✅ Semua KK sudah punya anggota. Tidak ada yang perlu diperbaiki.');
      return;
    }

    // Fix setiap KK
    let fixed = 0;
    let errors = 0;

    for (const kk of kkWithoutAnggota) {
      try {
        // Cek apakah kepala keluarga sudah jadi anggota
        const existingAnggota = await prisma.anggotaKeluarga.findUnique({
          where: {
            kartuKeluargaId_pendudukId: {
              kartuKeluargaId: kk.id,
              pendudukId: kk.kepalaKeluargaId,
            },
          },
        });

        if (existingAnggota) {
          console.log(`⏭️  KK ${kk.nomorKK} - Kepala keluarga sudah jadi anggota`);
          continue;
        }

        // Tambahkan kepala keluarga sebagai anggota
        await prisma.anggotaKeluarga.create({
          data: {
            kartuKeluargaId: kk.id,
            pendudukId: kk.kepalaKeluargaId,
            hubungan: 'Kepala Keluarga',
            status: 'Aktif',
          },
        });

        console.log(`✅ KK ${kk.nomorKK} - Kepala keluarga (${kk.kepalaKeluarga.nama}) ditambahkan sebagai anggota`);
        fixed++;
      } catch (error) {
        console.error(`❌ Error fix KK ${kk.nomorKK}:`, error.message);
        errors++;
      }
    }

    console.log('\n📊 Hasil:');
    console.log(`✅ Berhasil diperbaiki: ${fixed} KK`);
    console.log(`❌ Error: ${errors} KK`);
    console.log('\n✨ Selesai!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

// Run script
fixAnggotaKK();

