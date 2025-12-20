// ============================================
// FILE: clearDatabase.js
// ============================================
// 
// DESKRIPSI:
// Script untuk menghapus semua data dari database
// HATI-HATI: Script ini akan menghapus SEMUA data!
//
// PENGGUNAAN:
// node src/utils/clearDatabase.js
//
// ============================================

import prisma from '../config/database.js';

/**
 * Hapus semua data dari database
 * HATI-HATI: Script ini akan menghapus SEMUA data!
 */
async function clearDatabase() {
  try {
    console.log('⚠️  PERINGATAN: Script ini akan menghapus SEMUA data dari database!');
    console.log('Memulai proses penghapusan data...\n');

    // Hapus dalam urutan yang benar (untuk menghindari foreign key constraint error)
    // Urutan: Hapus data yang punya relasi dulu, baru data utama

    console.log('1. Menghapus data Anggota Keluarga...');
    const deletedAnggota = await prisma.anggotaKeluarga.deleteMany({});
    console.log(`   ✅ ${deletedAnggota.count} data Anggota Keluarga dihapus`);

    console.log('2. Menghapus data Surat...');
    const deletedSurat = await prisma.surat.deleteMany({});
    console.log(`   ✅ ${deletedSurat.count} data Surat dihapus`);

    console.log('3. Menghapus data Kartu Keluarga...');
    const deletedKK = await prisma.kartuKeluarga.deleteMany({});
    console.log(`   ✅ ${deletedKK.count} data Kartu Keluarga dihapus`);

    console.log('4. Menghapus data Penduduk...');
    const deletedPenduduk = await prisma.penduduk.deleteMany({});
    console.log(`   ✅ ${deletedPenduduk.count} data Penduduk dihapus`);

    console.log('5. Menghapus data Statistik...');
    const deletedStatistik = await prisma.statistik.deleteMany({});
    console.log(`   ✅ ${deletedStatistik.count} data Statistik dihapus`);

    // User tidak dihapus (untuk keamanan)
    console.log('\n✅ Proses penghapusan data selesai!');
    console.log('\n📊 Ringkasan:');
    console.log(`   - Anggota Keluarga: ${deletedAnggota.count} data dihapus`);
    console.log(`   - Surat: ${deletedSurat.count} data dihapus`);
    console.log(`   - Kartu Keluarga: ${deletedKK.count} data dihapus`);
    console.log(`   - Penduduk: ${deletedPenduduk.count} data dihapus`);
    console.log(`   - Statistik: ${deletedStatistik.count} data dihapus`);
    console.log('\n💡 Catatan: Data User tidak dihapus (untuk keamanan)');
    console.log('💡 Database sekarang bersih dan siap untuk import data baru!');
  } catch (error) {
    console.error('❌ Error saat menghapus data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Jalankan script
clearDatabase()
  .then(() => {
    console.log('\n✅ Script selesai!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script gagal:', error);
    process.exit(1);
  });

