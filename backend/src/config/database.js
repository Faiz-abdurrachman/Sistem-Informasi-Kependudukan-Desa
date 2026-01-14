// ============================================
// FILE: database.js
// ============================================
// 
// DESKRIPSI:
// Konfigurasi koneksi database MySQL menggunakan Prisma Client
// File ini menginisialisasi Prisma Client sebagai singleton
// untuk digunakan di seluruh aplikasi backend.
//
// ALUR DATA:
// 1. Import PrismaClient dari @prisma/client
// 2. Buat instance PrismaClient
// 3. Handle connection pooling dan error handling
// 4. Export instance untuk digunakan di controller/service
//
// ALASAN DESAIN:
// - Singleton pattern: hanya 1 instance PrismaClient untuk efisiensi
// - Connection pooling: Prisma otomatis manage koneksi database
// - Error handling: catch error saat koneksi gagal
// - Best practice: sesuai dokumentasi Prisma
//
// PENGGUNAAN:
// import prisma from './config/database.js';
// const users = await prisma.user.findMany();
//
// ============================================

import { PrismaClient } from '@prisma/client';

/**
 * Instance Prisma Client untuk koneksi database
 * Menggunakan singleton pattern untuk efisiensi resource
 */
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  errorFormat: 'pretty',
});

/**
 * Fungsi untuk test koneksi database
 * Digunakan saat aplikasi pertama kali start
 * 
 * @returns {Promise<boolean>} true jika koneksi berhasil
 */
export const testConnection = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

/**
 * Fungsi untuk disconnect database
 * Dipanggil saat aplikasi shutdown (graceful shutdown)
 */
export const disconnectDatabase = async () => {
  try {
    await prisma.$disconnect();
    console.log('✅ Database disconnected');
  } catch (error) {
    console.error('❌ Error disconnecting database:', error.message);
  }
};

// Export default instance Prisma Client
export default prisma;

