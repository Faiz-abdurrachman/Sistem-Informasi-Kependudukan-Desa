// ============================================
// FILE: jwt.js
// ============================================
// 
// DESKRIPSI:
// Konfigurasi JWT (JSON Web Token) untuk authentication
// Menggunakan library jsonwebtoken untuk generate dan verify token
//
// ALUR DATA:
// 1. Generate token: User login → create JWT dengan payload (userId, role)
// 2. Verify token: Request masuk → verify JWT → extract payload
// 3. Token disimpan di client (localStorage/cookie) dan dikirim via header
//
// ALASAN DESAIN:
// - Stateless authentication: tidak perlu session di server
// - Secure: token di-sign dengan secret key
// - Expiration: token punya masa berlaku (7 hari default)
// - Payload minimal: hanya userId dan role untuk efisiensi
//
// KEAMANAN:
// - JWT_SECRET harus kuat dan tidak boleh di-commit ke git
// - Token expiration mencegah token lama digunakan
// - Role-based: payload include role untuk RBAC
//
// PENGGUNAAN:
// import { generateToken, verifyToken } from './config/jwt.js';
// const token = generateToken({ userId: 1, role: 'ADMIN' });
// const decoded = verifyToken(token);
//
// ============================================

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Secret key untuk sign JWT token
 * WAJIB diubah di production dengan string random yang kuat
 */
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate JWT token untuk user yang berhasil login
 * 
 * @param {Object} payload - Data yang akan di-encode ke token
 * @param {number} payload.userId - ID user
 * @param {string} payload.role - Role user (ADMIN, OPERATOR, PUBLIK)
 * @returns {string} JWT token yang sudah di-sign
 * 
 * @example
 * const token = generateToken({ userId: 1, role: 'ADMIN' });
 */
export const generateToken = (payload) => {
  try {
    const token = jwt.sign(
      {
        userId: payload.userId,
        role: payload.role,
      },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRES_IN,
        issuer: 'sikd-backend',
        audience: 'sikd-frontend',
      }
    );
    return token;
  } catch (error) {
    throw new Error(`Failed to generate token: ${error.message}`);
  }
};

/**
 * Verify dan decode JWT token
 * 
 * @param {string} token - JWT token yang akan di-verify
 * @returns {Object} Decoded payload (userId, role, exp, iat)
 * @throws {Error} Jika token invalid, expired, atau tidak ter-verify
 * 
 * @example
 * try {
 *   const decoded = verifyToken(token);
 *   console.log(decoded.userId, decoded.role);
 * } catch (error) {
 *   console.error('Invalid token');
 * }
 */
export const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'sikd-backend',
      audience: 'sikd-frontend',
    });
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token telah kadaluarsa');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Token tidak valid');
    } else {
      throw new Error(`Token verification failed: ${error.message}`);
    }
  }
};

/**
 * Decode token tanpa verify (untuk debugging saja)
 * HATI-HATI: Jangan gunakan untuk authentication!
 * 
 * @param {string} token - JWT token
 * @returns {Object} Decoded payload tanpa verify
 */
export const decodeToken = (token) => {
  return jwt.decode(token);
};

export default {
  generateToken,
  verifyToken,
  decodeToken,
};

