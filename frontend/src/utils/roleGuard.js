// ============================================
// FILE: roleGuard.js
// ============================================
// 
// DESKRIPSI:
// Utility functions untuk role-based access control (RBAC)
// Helper functions untuk cek role user
//
// ALUR DATA:
// 1. Get user dari context
// 2. Cek role user
// 3. Return true/false berdasarkan role yang diizinkan
//
// ALASAN DESAIN:
// - Reusable: Bisa dipakai di component atau route guard
// - Type-safe: Helper functions untuk cek role
// - Clear: Function names jelas untuk setiap role check
//
// PENGGUNAAN:
// import { isAdmin, isOperatorOrAdmin } from '../utils/roleGuard.js';
// if (isAdmin(user)) { ... }
//
// ============================================

/**
 * Cek apakah user adalah ADMIN
 * 
 * @param {Object} user - User object dari auth context
 * @returns {boolean} true jika user adalah ADMIN
 */
export const isAdmin = (user) => {
  return user && user.role === 'ADMIN';
};

/**
 * Cek apakah user adalah OPERATOR atau ADMIN
 * 
 * @param {Object} user - User object dari auth context
 * @returns {boolean} true jika user adalah OPERATOR atau ADMIN
 */
export const isOperatorOrAdmin = (user) => {
  return user && (user.role === 'OPERATOR' || user.role === 'ADMIN');
};

/**
 * Cek apakah user adalah PUBLIK
 * 
 * @param {Object} user - User object dari auth context
 * @returns {boolean} true jika user adalah PUBLIK
 */
export const isPublik = (user) => {
  return user && user.role === 'PUBLIK';
};

/**
 * Cek apakah user memiliki role yang diizinkan
 * 
 * @param {Object} user - User object dari auth context
 * @param {string[]} allowedRoles - Array role yang diizinkan
 * @returns {boolean} true jika user memiliki salah satu role yang diizinkan
 */
export const hasRole = (user, allowedRoles) => {
  return user && allowedRoles.includes(user.role);
};

/**
 * Get role display name
 * 
 * @param {string} role - Role code (ADMIN, OPERATOR, PUBLIK)
 * @returns {string} Role display name
 */
export const getRoleDisplayName = (role) => {
  const roleNames = {
    ADMIN: 'Administrator',
    OPERATOR: 'Operator',
    PUBLIK: 'Publik',
  };

  return roleNames[role] || role;
};

export default {
  isAdmin,
  isOperatorOrAdmin,
  isPublik,
  hasRole,
  getRoleDisplayName,
};

