// ============================================
// FILE: generate-jwt-secret.js
// ============================================
//
// DESKRIPSI:
// Script untuk generate JWT secret key yang kuat
//
// PENGGUNAAN:
// node generate-jwt-secret.js
//
// ============================================

import crypto from "crypto";

// Generate random string 64 karakter
const secret = crypto.randomBytes(32).toString("base64");

console.log("===========================================");
console.log("🔐 JWT SECRET KEY GENERATED");
console.log("===========================================");
console.log("");
console.log("Copy secret ini ke file .env:");
console.log("");
console.log(`JWT_SECRET=${secret}`);
console.log("");
console.log("===========================================");
console.log("⚠️  PENTING:");
console.log("1. Jangan share secret ini ke siapa pun!");
console.log("2. Simpan dengan aman");
console.log("3. Jangan commit ke git");
console.log("===========================================");
