# Sistem Informasi Kependudukan Desa (SIKD)

Sistem informasi kependudukan desa yang dibangun dengan teknologi modern dan standar profesional untuk keperluan skripsi, PKL, atau project client desa.

## 📋 Daftar Isi

- [Fitur Utama](#fitur-utama)
- [Tech Stack](#tech-stack)
- [Struktur Project](#struktur-project)
- [Instalasi & Setup](#instalasi--setup)
- [Cara Menjalankan](#cara-menjalankan)
- [Dokumentasi API](#dokumentasi-api)
- [Human Touch Features](#human-touch-features)
- [Keamanan](#keamanan)
- [Troubleshooting](#troubleshooting)
- [📚 Dokumentasi Lengkap](#-dokumentasi-lengkap)

## ✨ Fitur Utama

### 1. Authentication & Authorization
- ✅ JWT Authentication
- ✅ Role-Based Access Control (RBAC)
- ✅ 3 Level Role: ADMIN, OPERATOR, PUBLIK
- ✅ Protected Routes

### 2. Data Kependudukan
- ✅ CRUD Data Penduduk
- ✅ Validasi NIK 16 digit (Human Touch)
- ✅ Validasi tanggal lahir
- ✅ Status kependudukan (Aktif, Meninggal, Pindah)

### 3. Kartu Keluarga
- ✅ CRUD Kartu Keluarga
- ✅ Validasi nomor KK 16 digit (Human Touch)
- ✅ Relasi kepala keluarga dan anggota keluarga
- ✅ Manajemen anggota keluarga

### 4. Surat Administrasi
- ✅ Pembuatan surat otomatis
- ✅ Penomoran surat otomatis sesuai format desa (Human Touch)
- ✅ Format: NOMOR/JENIS/TAHUN (contoh: 001/SKD/2024)
- ✅ Tracking status surat (Draft, Selesai, Dicetak)
- ✅ Penandatanganan pejabat

### 5. Import Data
- ✅ Import data penduduk dari CSV
- ✅ Validasi data CSV
- ✅ Error reporting per baris

### 6. Statistik & Dashboard
- ✅ Dashboard statistik kependudukan
- ✅ Statistik per jenis kelamin
- ✅ Statistik per status kependudukan
- ✅ Statistik per agama, pendidikan, pekerjaan
- ✅ Statistik per RT/RW

## 🛠 Tech Stack

### Backend
- **Node.js** + **Express.js** - REST API
- **Prisma** - ORM untuk MySQL
- **MySQL** - Database (Laragon)
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **express-validator** - Input validation
- **multer** - File upload
- **csv-parser** - CSV parsing

### Frontend
- **React.js** - UI Framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **Axios** - HTTP client
- **React Hot Toast** - Notifications

### Development Tools
- **Laragon** - Local server (Apache + MySQL)
- **Nodemon** - Auto-reload backend
- **Prisma Studio** - Database GUI

## 📁 Struktur Project

```
sikd/
├── backend/                 # Backend Express.js
│   ├── src/
│   │   ├── app.js          # Express app configuration
│   │   ├── server.js       # Server entry point
│   │   ├── config/         # Configuration files
│   │   │   ├── database.js # Prisma client
│   │   │   └── jwt.js      # JWT config
│   │   ├── middleware/     # Express middleware
│   │   │   ├── authMiddleware.js
│   │   │   └── roleMiddleware.js
│   │   ├── controllers/    # Route controllers
│   │   │   ├── authController.js
│   │   │   ├── pendudukController.js
│   │   │   ├── kkController.js
│   │   │   ├── suratController.js
│   │   │   ├── statistikController.js
│   │   │   └── importController.js
│   │   ├── routes/         # API routes
│   │   │   ├── authRoutes.js
│   │   │   ├── pendudukRoutes.js
│   │   │   ├── kkRoutes.js
│   │   │   ├── suratRoutes.js
│   │   │   ├── statistikRoutes.js
│   │   │   └── importRoutes.js
│   │   ├── services/        # Business logic
│   │   │   └── suratGenerator.js
│   │   └── utils/          # Utility functions
│   │       ├── validators.js
│   │       └── csvParser.js
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   ├── package.json
│   └── .env.example
│
├── frontend/                # Frontend React.js
│   ├── src/
│   │   ├── api/
│   │   │   └── axiosInstance.js
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── Modal.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Penduduk.jsx
│   │   │   ├── KartuKeluarga.jsx
│   │   │   └── Surat.jsx
│   │   ├── utils/
│   │   │   └── roleGuard.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

## 🚀 Instalasi & Setup

### Prerequisites

1. **Node.js** (v18 atau lebih baru)
   - Download: https://nodejs.org/
   - Verify: `node --version`

2. **Laragon** (untuk MySQL)
   - Download: https://laragon.org/
   - Install dan start MySQL

3. **Git** (opsional)
   - Download: https://git-scm.com/

### Step 1: Clone atau Download Project

```bash
# Jika menggunakan git
git clone <repository-url>
cd sikd

# Atau extract zip file
```

### Step 2: Setup Backend

```bash
# Masuk ke folder backend
cd backend

# Install dependencies
npm install

# Copy .env.example menjadi .env
copy .env.example .env  # Windows
# atau
cp .env.example .env    # Linux/Mac

# Edit file .env dan sesuaikan konfigurasi:
# - DATABASE_URL: sesuaikan dengan MySQL Laragon
# - JWT_SECRET: generate random string (penting untuk production!)
# - PORT: default 5000
# - FRONTEND_URL: default http://localhost:5173

# Generate Prisma Client
npm run prisma:generate

# Jalankan migration database
npm run prisma:migrate

# (Opsional) Buka Prisma Studio untuk melihat database
npm run prisma:studio
```

**Konfigurasi .env untuk Laragon:**

```env
DATABASE_URL="mysql://root:@localhost:3306/sikd_db"
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
PORT=5000
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### Step 3: Setup Frontend

```bash
# Masuk ke folder frontend
cd frontend

# Install dependencies
npm install

# (Opsional) Buat file .env jika perlu custom API URL
# VITE_API_URL=http://localhost:5000
```

### Step 4: Setup Database

1. Buka Laragon dan start MySQL
2. Buat database baru (atau gunakan yang sudah ada):
   ```sql
   CREATE DATABASE sikd_db;
   ```
3. Pastikan `DATABASE_URL` di `.env` sudah benar
4. Jalankan migration:
   ```bash
   cd backend
   npm run prisma:migrate
   ```

### Step 5: Create User Admin (Opsional)

Setelah migration, buat user admin pertama:

```bash
# Buka Prisma Studio
cd backend
npm run prisma:studio

# Atau gunakan SQL langsung di Laragon:
INSERT INTO users (username, email, password, nama, role, isActive, createdAt, updatedAt)
VALUES ('admin', 'admin@desa.local', '$2a$10$...', 'Administrator', 'ADMIN', true, NOW(), NOW());
```

**Password hash untuk "admin123":**
```
$2a$10$rK8Q8Q8Q8Q8Q8Q8Q8Q8QeK8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q
```

Atau gunakan endpoint register untuk membuat user pertama.

## 🏃 Cara Menjalankan

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Server berjalan di http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Frontend berjalan di http://localhost:5173
```

### Production Mode

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## 📚 Dokumentasi API

### Base URL
```
http://localhost:5000/api
```

### Authentication

#### POST /api/auth/register
Register user baru

**Request:**
```json
{
  "username": "admin",
  "email": "admin@desa.local",
  "password": "admin123",
  "nama": "Administrator",
  "role": "ADMIN"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registrasi berhasil",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### POST /api/auth/login
Login user

**Request:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### GET /api/auth/profile
Get profile user (butuh authentication)

**Headers:**
```
Authorization: Bearer <token>
```

### Penduduk

#### GET /api/penduduk
Get semua penduduk (dengan pagination)

**Query Params:**
- `page` (default: 1)
- `limit` (default: 10)
- `search` (optional)
- `statusKependudukan` (optional)

**Headers:**
```
Authorization: Bearer <token>
```

#### GET /api/penduduk/:id
Get penduduk by ID

#### POST /api/penduduk
Create penduduk baru

**Request:**
```json
{
  "nik": "3201010101010001",
  "nama": "John Doe",
  "tempatLahir": "Jakarta",
  "tanggalLahir": "1990-01-01",
  "jenisKelamin": "Laki-laki",
  "alamat": "Jl. Contoh No. 123",
  ...
}
```

#### PUT /api/penduduk/:id
Update penduduk

#### DELETE /api/penduduk/:id
Delete penduduk

### Kartu Keluarga

#### GET /api/kk
Get semua Kartu Keluarga

#### GET /api/kk/:id
Get Kartu Keluarga by ID

#### POST /api/kk
Create Kartu Keluarga baru

#### PUT /api/kk/:id
Update Kartu Keluarga

#### DELETE /api/kk/:id
Delete Kartu Keluarga

#### POST /api/kk/:id/anggota
Tambah anggota keluarga

#### DELETE /api/kk/:id/anggota/:anggotaId
Hapus anggota keluarga

### Surat

#### GET /api/surat
Get semua surat

#### GET /api/surat/:id
Get surat by ID

#### POST /api/surat
Create surat baru (nomor surat otomatis generate)

#### PUT /api/surat/:id
Update surat

#### PATCH /api/surat/:id/status
Update status surat

#### DELETE /api/surat/:id
Delete surat

### Statistik

#### GET /api/statistik
Get statistik kependudukan

**Query Params:**
- `useCache` (default: true)

#### GET /api/statistik/refresh
Refresh cache statistik (ADMIN/OPERATOR only)

### Import

#### POST /api/import/penduduk
Import data penduduk dari CSV

**Request:**
- Content-Type: `multipart/form-data`
- Field: `file` (CSV file)

## 🎯 Human Touch Features

### 1. Validasi NIK & KK
- ✅ NIK harus 16 digit angka, unique
- ✅ Nomor KK harus 16 digit angka, unique
- ✅ Validasi format sesuai aturan resmi

### 2. Penomoran Surat Otomatis
- ✅ Format: `NOMOR/JENIS/TAHUN`
- ✅ Contoh: `001/SKD/2024`, `002/KET/2024`
- ✅ Auto increment per jenis surat dan tahun
- ✅ Nomor surat tidak bisa diubah setelah dibuat

### 3. Penandatanganan Pejabat
- ✅ Tracking siapa yang menandatangani surat
- ✅ Jabatan penandatangan (Kepala Desa, Sekretaris Desa)

### 4. Validasi Data
- ✅ Tanggal lahir tidak boleh di masa depan
- ✅ Status kependudukan: Aktif, Meninggal, Pindah
- ✅ Validasi relasi data (kepala keluarga, anggota keluarga)

### 5. Kebijakan Data
- ✅ Soft delete untuk data penting
- ✅ Tracking perubahan data (createdAt, updatedAt)
- ✅ Status aktif/nonaktif untuk user

## 🔒 Keamanan

### Authentication & Authorization
- ✅ JWT token dengan expiration (7 hari)
- ✅ Password hashing dengan bcrypt (salt rounds: 10)
- ✅ Role-Based Access Control (RBAC)
- ✅ Protected routes dengan middleware

### Input Validation
- ✅ Validasi input di backend
- ✅ Sanitization data
- ✅ SQL injection protection (Prisma ORM)

### Error Handling
- ✅ Centralized error handling
- ✅ Error messages yang user-friendly
- ✅ Tidak expose sensitive information di production

## 🐛 Troubleshooting

### Database Connection Error

**Error:** `Database connection failed`

**Solusi:**
1. Pastikan Laragon MySQL sudah running
2. Cek `DATABASE_URL` di `.env` sudah benar
3. Pastikan database sudah dibuat
4. Test koneksi dengan Prisma Studio: `npm run prisma:studio`

### Port Already in Use

**Error:** `Port 5000 is already in use`

**Solusi:**
1. Ubah `PORT` di `.env` backend
2. Atau kill process yang menggunakan port tersebut:
   ```bash
   # Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   
   # Linux/Mac
   lsof -ti:5000 | xargs kill
   ```

### CORS Error

**Error:** `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solusi:**
1. Pastikan `FRONTEND_URL` di `.env` backend sudah benar
2. Restart backend server

### Prisma Migration Error

**Error:** `Migration failed`

**Solusi:**
1. Pastikan database sudah dibuat
2. Pastikan `DATABASE_URL` benar
3. Reset database jika perlu:
   ```bash
   npm run prisma:migrate reset
   ```

### Module Not Found

**Error:** `Cannot find module 'xxx'`

**Solusi:**
```bash
# Install ulang dependencies
rm -rf node_modules package-lock.json
npm install
```

## 📚 Dokumentasi Lengkap

Untuk dokumentasi lebih lengkap tentang sistem, silakan baca:

1. **[SETUP-DAN-INSTALASI.md](./SETUP-DAN-INSTALASI.md)** ⭐ **WAJIB BACA PERTAMA!**
   - Setup lengkap step-by-step dari awal
   - Troubleshooting common issues
   - Verifikasi instalasi
   - Catatan penting untuk production

2. **[FITUR-DAN-PERBAIKAN.md](./FITUR-DAN-PERBAIKAN.md)**
   - Daftar lengkap semua fitur
   - Detail perbaikan yang telah dilakukan
   - Statistik implementasi
   - Checklist perbaikan

3. **[PANDUAN-PRESENTASI-CLIENT.md](./PANDUAN-PRESENTASI-CLIENT.md)**
   - Panduan lengkap presentasi ke client
   - Struktur presentasi (30-45 menit)
   - Demo script untuk setiap fitur
   - Q&A preparation

4. **[ALUR-KERJA-DESA.md](./ALUR-KERJA-DESA.md)**
   - Narasi sistem
   - Alur kerja sehari-hari
   - Use case detail
   - Contoh kasus nyata

5. **[ROLE-PERMISSION.md](./ROLE-PERMISSION.md)**
   - Permission matrix lengkap
   - Detail peran setiap role
   - Security considerations
   - Implementation notes

6. **[DIAGRAM-KONSEP.md](./DIAGRAM-KONSEP.md)**
   - Entity Relationship Diagram (ERD)
   - Diagram alur data
   - Arsitektur sistem
   - Security layers

7. **[ANALISIS-DAN-RENCANA-PERBAIKAN.md](./ANALISIS-DAN-RENCANA-PERBAIKAN.md)**
   - Analisis masalah yang ditemukan
   - Rencana perbaikan dengan prioritas
   - Checklist perbaikan
   - Prompt untuk implementasi

8. **[ANALISIS-FINAL.md](./ANALISIS-FINAL.md)**
   - Status implementasi final
   - Checklist completion
   - Code quality analysis
   - Production readiness

---

## 📝 Catatan Penting

1. **JWT_SECRET**: WAJIB diubah di production dengan string random yang kuat!
   ```bash
   # Generate random string
   openssl rand -base64 32
   ```

2. **Database**: Pastikan backup database secara berkala

3. **Environment Variables**: Jangan commit file `.env` ke git (sudah ada di .gitignore)

4. **Production**: Set `NODE_ENV=production` di production

## 📄 License

Project ini dibuat untuk keperluan akademik (skripsi, PKL) atau project client desa.

## 👨‍💻 Developer Notes

### Arsitektur
- **Backend**: RESTful API dengan Express.js
- **Frontend**: SPA dengan React.js
- **Database**: MySQL dengan Prisma ORM
- **Authentication**: JWT stateless

### Best Practices
- ✅ Clean code dengan dokumentasi lengkap
- ✅ Separation of concerns
- ✅ Controller-Service-Route pattern
- ✅ Error handling yang konsisten
- ✅ Input validation
- ✅ Security best practices

### Untuk Presentasi
1. Jelaskan arsitektur sistem (frontend-backend separation)
2. Highlight human touch features (validasi NIK, penomoran surat)
3. Jelaskan keamanan (JWT, RBAC, password hashing)
4. Demo fitur-fitur utama
5. Tunjukkan dokumentasi code yang lengkap

---

**Selamat menggunakan Sistem Informasi Kependudukan Desa! 🎉**

