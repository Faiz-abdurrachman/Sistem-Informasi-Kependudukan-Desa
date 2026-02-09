# Sistem Informasi Kependudukan Desa (SIKD)

Sistem informasi kependudukan desa berbasis web yang dibangun dengan arsitektur modern dan standar enterprise. Aplikasi ini dirancang untuk mengelola data penduduk, kartu keluarga, dan administrasi surat menyurat di tingkat desa dengan fokus pada keamanan, skalabilitas, dan kemudahan penggunaan.

---

## Daftar Isi

- [Fitur Utama](#fitur-utama)
- [Arsitektur Sistem](#arsitektur-sistem)
- [Kebutuhan Sistem](#kebutuhan-sistem)
- [Instalasi dan Konfigurasi](#instalasi-dan-konfigurasi)
  - [Opsi A: Windows dengan Laragon](#opsi-a-windows-dengan-laragon)
  - [Opsi B: Linux/macOS dengan Docker](#opsi-b-linuxmacos-dengan-docker)
- [Menjalankan Aplikasi](#menjalankan-aplikasi)
- [Dokumentasi API](#dokumentasi-api)
- [Fitur Keamanan](#fitur-keamanan)
- [Struktur Project](#struktur-project)
- [Pemecahan Masalah](#pemecahan-masalah)
- [Dokumentasi Tambahan](#dokumentasi-tambahan)

---

## Fitur Utama

### Manajemen Data Kependudukan

| Fitur              | Deskripsi                                              |
| ------------------ | ------------------------------------------------------ |
| CRUD Penduduk      | Kelola data penduduk dengan validasi NIK 16 digit      |
| Kartu Keluarga     | Manajemen KK dengan relasi kepala dan anggota keluarga |
| Surat Administrasi | Pembuatan surat otomatis dengan penomoran resmi        |
| Import Data        | Import data penduduk dari file CSV dengan validasi     |
| Statistik          | Dashboard statistik kependudukan dengan visualisasi    |

### Sistem Autentikasi dan Otorisasi

| Fitur                     | Deskripsi                                             |
| ------------------------- | ----------------------------------------------------- |
| JWT Authentication        | Autentikasi berbasis token dengan masa berlaku 7 hari |
| Role-Based Access Control | Tiga level akses: ADMIN, OPERATOR, PUBLIK             |
| Rate Limiting             | Perlindungan terhadap brute force attack              |
| Security Headers          | Konfigurasi keamanan HTTP dengan Helmet.js            |

### Fitur Administratif

| Fitur                    | Deskripsi                                        |
| ------------------------ | ------------------------------------------------ |
| Penomoran Surat Otomatis | Format: NOMOR/JENIS/TAHUN (contoh: 001/SKD/2024) |
| Audit Log                | Pencatatan aktivitas pengguna untuk keamanan     |
| Soft Delete              | Penghapusan data dengan pemulihan                |
| Export Data              | Export ke PDF dan Excel                          |

---

## Arsitektur Sistem

### Technology Stack

**Backend**

| Teknologi          | Fungsi              |
| ------------------ | ------------------- |
| Node.js v18+       | Runtime JavaScript  |
| Express.js         | Framework REST API  |
| Prisma             | ORM untuk MySQL     |
| MySQL 8.0          | Database relasional |
| JWT                | Token autentikasi   |
| bcrypt             | Enkripsi password   |
| Helmet.js          | Security headers    |
| express-rate-limit | Rate limiting       |

**Frontend**

| Teknologi    | Fungsi                    |
| ------------ | ------------------------- |
| React.js 18  | UI Framework              |
| Vite         | Build tool dan dev server |
| Tailwind CSS | Styling framework         |
| React Router | Client-side routing       |
| Axios        | HTTP client               |
| Recharts     | Visualisasi data          |

---

## Kebutuhan Sistem

### Software yang Diperlukan

| Software | Versi Minimum | Cara Verifikasi  |
| -------- | ------------- | ---------------- |
| Node.js  | v18.0.0       | `node --version` |
| npm      | v8.0.0        | `npm --version`  |
| Git      | Versi terbaru | `git --version`  |

### Kebutuhan Tambahan Berdasarkan Platform

**Windows**

- Laragon (sudah termasuk MySQL dan Apache)
- Download: https://laragon.org/download/

**Linux/macOS**

- Docker dan Docker Compose
- Instalasi sesuai distribusi masing-masing

---

## Instalasi dan Konfigurasi

### Langkah Awal (Semua Platform)

```bash
# Clone repository
git clone https://github.com/Faiz-abdurrachman/Sistem-Informasi-Kependudukan-Desa.git

# Masuk ke direktori project
cd Sistem-Informasi-Kependudukan-Desa
```

---

### Opsi A: Windows dengan Laragon

#### A1. Instalasi Laragon

1. Download Laragon dari https://laragon.org/download/
2. Jalankan installer dan ikuti petunjuk instalasi
3. Buka Laragon dan klik tombol **Start All** untuk menjalankan Apache dan MySQL

#### A2. Membuat Database

1. Klik kanan pada icon Laragon di system tray
2. Pilih **MySQL** > **Open HeidiSQL**
3. Buat koneksi baru dengan klik **New**
4. Jalankan query berikut:

```sql
CREATE DATABASE sikd_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### A3. Konfigurasi Backend

```bash
# Masuk ke direktori backend
cd backend

# Install dependencies
npm install

# Salin file konfigurasi
copy env.template .env
```

Edit file `.env` dengan konfigurasi berikut:

```env
# Database Configuration
DATABASE_URL="mysql://root:@localhost:3306/sikd_db"

# JWT Configuration
JWT_SECRET=sikd-super-secret-key-change-in-production-min-32-chars
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5000
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

Lanjutkan dengan migrasi database:

```bash
# Generate Prisma Client
npm run prisma:generate

# Jalankan migrasi database
npm run prisma:migrate
```

#### A4. Konfigurasi Frontend

```bash
# Masuk ke direktori frontend
cd ../frontend

# Install dependencies
npm install
```

Buat file `.env` di direktori frontend:

```env
VITE_API_URL=http://localhost:5000
```

#### A5. Membuat User Admin

```bash
# Kembali ke direktori backend
cd ../backend

# Jalankan script pembuatan admin
npm run create:admin
```

Kredensial default:

- **Username:** admin
- **Password:** admin123

---

### Opsi B: Linux/macOS dengan Docker

#### B1. Instalasi Docker

**Arch Linux**

```bash
# Install Docker dan Docker Compose
sudo pacman -S docker docker-compose

# Jalankan dan aktifkan service Docker
sudo systemctl start docker
sudo systemctl enable docker

# Tambahkan user ke group docker (agar tidak perlu sudo)
sudo usermod -aG docker $USER

# Logout dan login kembali agar perubahan group berlaku
```

**Ubuntu/Debian**

```bash
# Update package index
sudo apt update

# Install Docker
sudo apt install docker.io docker-compose-v2 -y

# Jalankan service Docker
sudo systemctl start docker
sudo systemctl enable docker

# Tambahkan user ke group docker
sudo usermod -aG docker $USER

# Logout dan login kembali
```

**macOS**

1. Download Docker Desktop dari https://www.docker.com/products/docker-desktop/
2. Install dan jalankan Docker Desktop
3. Pastikan Docker sudah berjalan (icon Docker muncul di menu bar)

#### B2. Menjalankan Database dengan Docker

```bash
# Pastikan berada di root directory project
cd Sistem-Informasi-Kependudukan-Desa

# Jalankan container MySQL dan phpMyAdmin
docker compose up -d

# Verifikasi container berjalan
docker compose ps
```

Informasi akses:

| Service    | URL                   | Kredensial          |
| ---------- | --------------------- | ------------------- |
| MySQL      | localhost:3307        | root / rootpassword |
| phpMyAdmin | http://localhost:8080 | root / rootpassword |

#### B3. Konfigurasi Backend

```bash
# Masuk ke direktori backend
cd backend

# Install dependencies
npm install

# Salin file konfigurasi Docker
cp .env.docker .env
```

Konfigurasi `.env` untuk Docker:

```env
# Database Configuration (Docker)
DATABASE_URL="mysql://root:rootpassword@localhost:3307/sikd_db"

# JWT Configuration
JWT_SECRET=sikd-super-secret-key-change-in-production-min-32-chars
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5001
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

Jalankan migrasi:

```bash
# Generate Prisma Client
npm run prisma:generate

# Jalankan migrasi database
npm run prisma:migrate
```

#### B4. Konfigurasi Frontend

```bash
# Masuk ke direktori frontend
cd ../frontend

# Install dependencies
npm install
```

Buat file `.env`:

```env
VITE_API_URL=http://localhost:5001
```

#### B5. Membuat User Admin

```bash
cd ../backend
npm run create:admin
```

#### B6. Perintah Docker yang Berguna

| Perintah                    | Fungsi                                         |
| --------------------------- | ---------------------------------------------- |
| `docker compose up -d`      | Menjalankan container di background            |
| `docker compose down`       | Menghentikan container                         |
| `docker compose down -v`    | Menghentikan dan menghapus volume (reset data) |
| `docker compose logs -f db` | Melihat log MySQL secara real-time             |
| `docker compose ps`         | Melihat status container                       |
| `docker compose restart`    | Restart semua container                        |

---

## Menjalankan Aplikasi

### Mode Development

Buka dua terminal terpisah:

**Terminal 1 - Backend**

```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend**

```bash
cd frontend
npm run dev
```

### URL Akses Aplikasi

| Service       | Windows (Laragon)     | Linux/macOS (Docker)  |
| ------------- | --------------------- | --------------------- |
| Frontend      | http://localhost:5173 | http://localhost:5173 |
| Backend API   | http://localhost:5000 | http://localhost:5001 |
| phpMyAdmin    | -                     | http://localhost:8080 |
| Prisma Studio | http://localhost:5555 | http://localhost:5555 |

Untuk membuka Prisma Studio (database GUI):

```bash
cd backend
npm run prisma:studio
```

### Mode Production

**Backend**

```bash
cd backend
npm start
```

**Frontend**

```bash
cd frontend
npm run build
npm run preview
```

---

## Dokumentasi API

### Base URL

| Environment          | URL                         |
| -------------------- | --------------------------- |
| Windows (Laragon)    | `http://localhost:5000/api` |
| Linux/macOS (Docker) | `http://localhost:5001/api` |

### Header Autentikasi

Untuk endpoint yang memerlukan autentikasi, sertakan header:

```
Authorization: Bearer <token>
```

### Endpoint Authentication

#### POST /api/auth/register

Mendaftarkan user baru.

**Request Body:**

```json
{
  "username": "operator1",
  "email": "operator1@desa.local",
  "password": "password123",
  "nama": "Operator Desa",
  "role": "OPERATOR"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Registrasi berhasil",
  "data": {
    "user": {
      "id": 2,
      "username": "operator1",
      "email": "operator1@desa.local",
      "nama": "Operator Desa",
      "role": "OPERATOR"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### POST /api/auth/login

Login user.

**Request Body:**

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

### Endpoint Penduduk

| Method | Endpoint          | Deskripsi                    | Akses           |
| ------ | ----------------- | ---------------------------- | --------------- |
| GET    | /api/penduduk     | Daftar penduduk (pagination) | Semua role      |
| GET    | /api/penduduk/:id | Detail penduduk              | Semua role      |
| POST   | /api/penduduk     | Tambah penduduk              | ADMIN, OPERATOR |
| PUT    | /api/penduduk/:id | Update penduduk              | ADMIN, OPERATOR |
| DELETE | /api/penduduk/:id | Hapus penduduk               | ADMIN           |

### Endpoint Kartu Keluarga

| Method | Endpoint                       | Deskripsi                | Akses           |
| ------ | ------------------------------ | ------------------------ | --------------- |
| GET    | /api/kk                        | Daftar KK                | Semua role      |
| GET    | /api/kk/:id                    | Detail KK dengan anggota | Semua role      |
| POST   | /api/kk                        | Tambah KK                | ADMIN, OPERATOR |
| PUT    | /api/kk/:id                    | Update KK                | ADMIN, OPERATOR |
| DELETE | /api/kk/:id                    | Hapus KK                 | ADMIN           |
| POST   | /api/kk/:id/anggota            | Tambah anggota KK        | ADMIN, OPERATOR |
| DELETE | /api/kk/:id/anggota/:anggotaId | Hapus anggota KK         | ADMIN, OPERATOR |

### Endpoint Surat

| Method | Endpoint              | Deskripsi           | Akses           |
| ------ | --------------------- | ------------------- | --------------- |
| GET    | /api/surat            | Daftar surat        | Semua role      |
| GET    | /api/surat/:id        | Detail surat        | Semua role      |
| POST   | /api/surat            | Buat surat baru     | ADMIN, OPERATOR |
| PUT    | /api/surat/:id        | Update surat        | ADMIN, OPERATOR |
| PATCH  | /api/surat/:id/status | Update status surat | ADMIN, OPERATOR |
| DELETE | /api/surat/:id        | Hapus surat         | ADMIN           |

### Endpoint Statistik

| Method | Endpoint               | Deskripsi               | Akses           |
| ------ | ---------------------- | ----------------------- | --------------- |
| GET    | /api/statistik         | Statistik kependudukan  | Semua role      |
| GET    | /api/statistik/refresh | Refresh cache statistik | ADMIN, OPERATOR |

---

## Fitur Keamanan

### Konfigurasi Keamanan yang Diterapkan

| Fitur                    | Implementasi       | Deskripsi                                              |
| ------------------------ | ------------------ | ------------------------------------------------------ |
| Security Headers         | Helmet.js          | Content-Security-Policy, HSTS, X-Frame-Options         |
| Rate Limiting            | express-rate-limit | 100 request/15 menit (umum), 5 request/15 menit (auth) |
| Password Hashing         | bcrypt             | Salt rounds: 10                                        |
| Token Authentication     | JWT                | Expiration: 7 hari, dengan issuer dan audience         |
| SQL Injection Prevention | Prisma ORM         | Parameterized queries                                  |
| CORS                     | cors middleware    | Hanya izinkan origin yang terdaftar                    |

### Konfigurasi Rate Limiting

| Endpoint       | Limit       | Window   |
| -------------- | ----------- | -------- |
| /api/\* (umum) | 100 request | 15 menit |
| /api/auth/\*   | 5 request   | 15 menit |

### Praktik Keamanan Produksi

1. **JWT_SECRET**: Gunakan string random minimal 32 karakter

   ```bash
   openssl rand -base64 32
   ```

2. **HTTPS**: Pastikan menggunakan HTTPS di production

3. **Environment Variables**: Jangan commit file `.env` ke repository

4. **Database**: Lakukan backup berkala

---

## Struktur Project

```
Sistem-Informasi-Kependudukan-Desa/
├── backend/
│   ├── src/
│   │   ├── app.js                 # Konfigurasi Express
│   │   ├── server.js              # Entry point server
│   │   ├── config/
│   │   │   ├── database.js        # Konfigurasi Prisma
│   │   │   └── jwt.js             # Konfigurasi JWT
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js  # Autentikasi JWT
│   │   │   └── roleMiddleware.js  # Otorisasi berbasis role
│   │   ├── controllers/           # Business logic
│   │   ├── routes/                # Definisi endpoint API
│   │   ├── services/              # Service layer
│   │   └── utils/                 # Fungsi utilitas
│   ├── prisma/
│   │   └── schema.prisma          # Schema database
│   ├── package.json
│   └── .env.docker
│
├── frontend/
│   ├── src/
│   │   ├── api/                   # Konfigurasi Axios
│   │   ├── components/            # Komponen React
│   │   ├── context/               # React Context
│   │   ├── pages/                 # Halaman aplikasi
│   │   ├── utils/                 # Fungsi utilitas
│   │   ├── App.jsx                # Root component
│   │   └── main.jsx               # Entry point
│   ├── package.json
│   └── vite.config.js
│
├── docker-compose.yml             # Konfigurasi Docker
└── README.md
```

---

## Pemecahan Masalah

### Error: Database Connection Failed

**Penyebab:** Database tidak bisa diakses.

**Solusi:**

1. Pastikan MySQL/Docker sudah berjalan
2. Periksa konfigurasi `DATABASE_URL` di file `.env`
3. Verifikasi kredensial database

```bash
# Untuk Docker
docker compose ps
docker compose logs db
```

### Error: Port Already in Use

**Penyebab:** Port sudah digunakan oleh aplikasi lain.

**Solusi:**

```bash
# Linux/macOS - Cari dan hentikan proses
lsof -ti:5001 | xargs kill -9

# Windows - Cari proses
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

Atau ubah port di file `.env`.

### Error: CORS Policy

**Penyebab:** Frontend URL tidak sesuai dengan konfigurasi backend.

**Solusi:**

1. Periksa `FRONTEND_URL` di `.env` backend
2. Pastikan URL sesuai dengan tempat frontend berjalan
3. Restart backend server

### Error: Module Not Found

**Penyebab:** Dependencies tidak terinstall dengan benar.

**Solusi:**

```bash
# Hapus node_modules dan install ulang
rm -rf node_modules package-lock.json
npm install
```

### Error: Too Many Requests (429)

**Penyebab:** Rate limiter aktif karena terlalu banyak request.

**Solusi:**

1. Tunggu 15 menit untuk reset limit
2. Untuk development, bisa sementara disable rate limiter

### Error: Prisma Migration Failed

**Penyebab:** Masalah dengan migrasi database.

**Solusi:**

```bash
# Reset database (HATI-HATI: menghapus semua data)
npm run prisma:migrate reset

# Atau force push schema
npm run prisma:db push
```

---

## Dokumentasi Tambahan

Dokumentasi teknis tambahan tersedia di dalam repository:

| Dokumen                           | Deskripsi                              |
| --------------------------------- | -------------------------------------- |
| ANALISIS-DAN-RENCANA-PERBAIKAN.md | Analisis masalah dan rencana perbaikan |
| MODEL-ADMINISTRATIF-STATUS.md     | Model administratif berbasis status    |
| TESTING-VALIDASI-ADMINISTRATIF.md | Panduan testing validasi               |
| DIAGRAM-KONSEP.md                 | ERD, diagram alur, dan arsitektur      |
| ALUR-KERJA-DESA.md                | Narasi sistem dan use case             |
| ROLE-PERMISSION.md                | Matrix permission dan security         |

---

## Kontribusi

1. Fork repository ini
2. Buat branch fitur (`git checkout -b fitur-baru`)
3. Commit perubahan (`git commit -m 'Menambahkan fitur baru'`)
4. Push ke branch (`git push origin fitur-baru`)
5. Buat Pull Request

---

## Lisensi

Project ini dibuat untuk keperluan akademik dan dapat digunakan sebagai referensi pengembangan sistem informasi desa.

---

## Informasi Kontak

Untuk pertanyaan atau masalah, silakan buat issue di repository ini.
