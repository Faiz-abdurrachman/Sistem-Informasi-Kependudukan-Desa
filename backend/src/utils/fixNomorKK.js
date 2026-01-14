// ============================================
// FILE: fixNomorKK.js
// ============================================
// 
// DESKRIPSI:
// Script untuk memperbaiki konsistensi nomorKK di tabel Penduduk
// Script ini akan sync nomorKK di Penduduk berdasarkan data di AnggotaKeluarga
//
// PHASE 1.3: Migration script untuk fix data existing
//
// ALASAN:
// - Field nomorKK di Penduduk bisa tidak sinkron dengan data di AnggotaKeluarga
// - Script ini memperbaiki inkonsistensi data yang sudah ada
//
// CARA PAKAI:
// node src/utils/fixNomorKK.js
//
// ============================================

import prisma from '../config/database.js';

/**
 * Fix konsistensi nomorKK di Penduduk berdasarkan AnggotaKeluarga
 * 
 * LOGIC:
 * 1. Ambil semua penduduk yang aktif
 * 2. Cek apakah penduduk ada di AnggotaKeluarga
 * 3. Jika ada, update nomorKK di Penduduk dengan nomorKK dari KK
 * 4. Jika tidak ada, set nomorKK menjadi null (atau warning jika status aktif)
 */
const fixNomorKK = async () => {
  try {
    console.log('🔍 Memulai proses perbaikan konsistensi nomorKK...\n');

    // 1. Get semua penduduk aktif
    const pendudukAktif = await prisma.penduduk.findMany({
      where: {
        statusKependudukan: 'Aktif',
      },
      include: {
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
    });

    console.log(`📊 Total penduduk aktif: ${pendudukAktif.length}`);

    let fixed = 0;
    let errors = 0;
    let warnings = 0;
    const issues = [];

    // 2. Process setiap penduduk
    for (const penduduk of pendudukAktif) {
      try {
        // Cek apakah penduduk ada di AnggotaKeluarga
        if (penduduk.anggotaKeluarga.length === 0) {
          // Penduduk aktif tidak ada di KK manapun - ini masalah!
          issues.push({
            pendudukId: penduduk.id,
            nik: penduduk.nik,
            nama: penduduk.nama,
            issue: 'Penduduk aktif tidak terdaftar di Kartu Keluarga manapun',
          });
          warnings++;
          continue;
        }

        // Jika penduduk ada di lebih dari 1 KK (ini juga masalah, tapi kita ambil yang pertama)
        if (penduduk.anggotaKeluarga.length > 1) {
          issues.push({
            pendudukId: penduduk.id,
            nik: penduduk.nik,
            nama: penduduk.nama,
            issue: `Penduduk terdaftar di ${penduduk.anggotaKeluarga.length} Kartu Keluarga (seharusnya hanya 1)`,
          });
          warnings++;
        }

        // Ambil nomorKK dari KK pertama (atau yang aktif)
        const nomorKKBaru = penduduk.anggotaKeluarga[0].kartuKeluarga.nomorKK;

        // Cek apakah nomorKK sudah benar
        if (penduduk.nomorKK === nomorKKBaru) {
          // Sudah benar, skip
          continue;
        }

        // Update nomorKK
        await prisma.penduduk.update({
          where: { id: penduduk.id },
          data: {
            nomorKK: nomorKKBaru,
          },
        });

        console.log(
          `✅ Penduduk ${penduduk.nik} (${penduduk.nama}) - nomorKK diperbaiki: ${penduduk.nomorKK || 'NULL'} → ${nomorKKBaru}`
        );
        fixed++;
      } catch (error) {
        console.error(
          `❌ Error fix penduduk ${penduduk.nik} (${penduduk.nama}):`,
          error.message
        );
        errors++;
      }
    }

    // 3. Handle penduduk non-aktif (set nomorKK menjadi null jika tidak ada di KK)
    const pendudukNonAktif = await prisma.penduduk.findMany({
      where: {
        statusKependudukan: { not: 'Aktif' },
        nomorKK: { not: null },
      },
      include: {
        anggotaKeluarga: {
          where: {
            status: 'Aktif',
          },
        },
      },
    });

    for (const penduduk of pendudukNonAktif) {
      try {
        // Jika tidak ada di KK aktif, set nomorKK menjadi null
        if (penduduk.anggotaKeluarga.length === 0) {
          await prisma.penduduk.update({
            where: { id: penduduk.id },
            data: {
              nomorKK: null,
            },
          });

          console.log(
            `✅ Penduduk non-aktif ${penduduk.nik} (${penduduk.nama}) - nomorKK dihapus (tidak ada di KK aktif)`
          );
          fixed++;
        }
      } catch (error) {
        console.error(
          `❌ Error fix penduduk non-aktif ${penduduk.nik}:`,
          error.message
        );
        errors++;
      }
    }

    // 4. Summary
    console.log('\n📊 Hasil:');
    console.log(`✅ Berhasil diperbaiki: ${fixed} penduduk`);
    console.log(`⚠️  Warning: ${warnings} penduduk`);
    console.log(`❌ Error: ${errors} penduduk`);

    if (issues.length > 0) {
      console.log('\n⚠️  ISSUES YANG PERLU DIPERHATIKAN:');
      issues.forEach((issue, index) => {
        console.log(
          `${index + 1}. ${issue.nama} (NIK: ${issue.nik}) - ${issue.issue}`
        );
      });
    }

    console.log('\n✨ Selesai!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

// Run script
fixNomorKK();
