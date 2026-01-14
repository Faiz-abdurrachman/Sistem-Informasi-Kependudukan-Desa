// ============================================
// FILE: createAdmin.js
// ============================================
// 
// DESKRIPSI:
// Script untuk membuat user admin pertama
// Jalankan script ini sekali untuk membuat user admin default
//
// PENGGUNAAN:
// node src/utils/createAdmin.js
//
// ============================================

import bcrypt from 'bcryptjs';
import prisma from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Create admin user pertama
 */
const createAdmin = async () => {
  try {
    console.log('🔄 Membuat user admin...');

    // Cek apakah sudah ada admin
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });

    if (existingAdmin) {
      console.log('⚠️  Admin sudah ada. Username:', existingAdmin.username);
      console.log('   Gunakan user yang sudah ada atau hapus terlebih dahulu.');
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@desa.local',
        password: hashedPassword,
        nama: 'Administrator',
        role: 'ADMIN',
        isActive: true,
      },
    });

    console.log('✅ User admin berhasil dibuat!');
    console.log('');
    console.log('📋 Credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('   Email: admin@desa.local');
    console.log('');
    console.log('⚠️  PENTING: Ubah password setelah login pertama kali!');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

// Run script
createAdmin();

