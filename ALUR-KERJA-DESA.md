# 🏛️ ALUR KERJA DESA
## Sistem Informasi Kependudukan Desa (SIKD)

Dokumen ini menjelaskan bagaimana sistem ini digunakan dalam kehidupan sehari-hari di desa.

---

## 📖 NARASI SISTEM

Sistem Informasi Kependudukan Desa (SIKD) adalah sistem yang membantu administrasi desa dalam:
1. **Mengelola Data Kependudukan** - Menyimpan dan mengelola data penduduk desa
2. **Mengelola Kartu Keluarga** - Mengorganisir penduduk berdasarkan keluarga
3. **Membuat Surat Administrasi** - Mempermudah pembuatan surat-surat resmi untuk warga
4. **Membuat Laporan** - Menyediakan data statistik dan laporan untuk kebutuhan desa

Sistem ini dirancang untuk digunakan oleh **petugas administrasi desa** dalam melayani warga.

---

## 👥 PERAN & TUGAS

### 1. ADMIN (Kepala Desa / Sekretaris Desa)

**Peran dalam Dunia Nyata:**
- Kepala desa atau sekretaris desa yang memiliki wewenang penuh
- Bertanggung jawab atas seluruh data kependudukan
- Mengelola petugas administrasi (operator)

**Tugas Harian:**
1. **Mengelola Petugas**
   - Membuat akun untuk operator baru
   - Mengatur hak akses operator
   - Menonaktifkan akun operator yang tidak aktif lagi

2. **Review & Approval**
   - Memeriksa data penting (perubahan data penduduk, hapus data)
   - Approve perubahan yang signifikan

3. **Laporan & Statistik**
   - Melihat dashboard statistik kependudukan
   - Membuat laporan untuk rapat desa
   - Export laporan ke atasan (kecamatan/kabupaten)

4. **Membuat Surat Penting**
   - Membuat surat-surat penting untuk warga
   - Menandatangani surat (secara digital/system)

**Contoh Skenario:**
```
Hari Senin pagi, Pak Kepala Desa login ke sistem.
- Lihat dashboard: ada 5 penduduk baru bulan ini
- Review laporan statistik untuk rapat desa hari ini
- Buat surat keterangan domisili untuk warga yang akan pindah
- Approve perubahan data penduduk yang diusulkan operator
```

---

### 2. OPERATOR (Petugas Administrasi)

**Peran dalam Dunia Nyata:**
- Petugas administrasi yang melayani warga sehari-hari
- Orang yang bertemu langsung dengan warga
- Input data dan membuat surat untuk warga

**Tugas Harian:**
1. **Melayani Warga**
   - Menerima warga yang datang ke kantor desa
   - Mencari data penduduk yang diminta warga
   - Membuat surat administrasi (SKD, KET, SKTM, dll)

2. **Input Data Baru**
   - Mencatat penduduk baru (bayi lahir, pendatang baru)
   - Update data penduduk (perubahan alamat, status)
   - Mengelola Kartu Keluarga (tambah anggota, update data)

3. **Pembuatan Surat**
   - Mencari data penduduk di sistem
   - Membuat surat dengan nomor otomatis
   - Print surat untuk warga

**Contoh Skenario:**
```
Hari kerja biasa di kantor desa.

09:00 - Ibu Siti datang minta surat keterangan domisili
        → Operator login, cari data Ibu Siti
        → Buat surat SKD, print, berikan ke Ibu Siti

10:30 - Pak Ahmad datang untuk update data (pindah alamat)
        → Operator cari data Pak Ahmad
        → Update alamat di sistem
        → Konfirmasi perubahan

14:00 - Ada bayi baru lahir, perlu didaftarkan
        → Operator input data bayi baru
        → Tambahkan bayi ke Kartu Keluarga orangtua
        → Data tersimpan

16:00 - Buat laporan harian: berapa surat yang dibuat hari ini
        → Lihat dashboard, catat statistik
```

---

### 3. PUBLIK (Warga / Tamu)

**Peran dalam Dunia Nyata:**
- Warga desa yang ingin melihat informasi publik
- Tidak punya akses untuk mengubah data
- Hanya bisa melihat statistik umum

**Tugas (jika ada akses):**
1. **Melihat Informasi Publik**
   - Melihat statistik kependudukan umum
   - Melihat informasi desa (jumlah penduduk, dll)

**Catatan:**
- Dalam praktiknya, role PUBLIK mungkin tidak terlalu digunakan
- Warga biasanya datang langsung ke kantor desa
- Jika ada portal publik, bisa digunakan untuk melihat info umum

---

## 🔄 ALUR KERJA UTAMA

### A. Alur Input Data Penduduk Baru

**Skenario:** Bayi baru lahir, perlu didaftarkan

```
STEP 1: Warga Datang ke Kantor Desa
   └─> Orangtua bayi datang dengan dokumen (akta kelahiran)

STEP 2: Operator Input Data Bayi
   └─> Operator login ke sistem
   └─> Buka halaman "Penduduk"
   └─> Klik "Tambah Penduduk"
   └─> Input data:
       - NIK (dari dokumen)
       - Nama
       - Tempat & Tanggal Lahir
       - Jenis Kelamin
       - Data lainnya
   └─> Validasi: NIK harus 16 digit, unique
   └─> Simpan

STEP 3: Tambahkan ke Kartu Keluarga
   └─> Buka halaman "Kartu Keluarga"
   └─> Cari KK orangtua
   └─> Klik "Kelola Anggota"
   └─> Klik "Tambah Anggota"
   └─> Pilih bayi yang baru didaftarkan
   └─> Pilih hubungan: "Anak"
   └─> Simpan

STEP 4: Selesai
   └─> Data bayi sudah tersimpan
   └─> Bayi sudah jadi anggota KK orangtua
   └─> Sistem update otomatis (nomorKK, statistik)
```

---

### B. Alur Pembuatan Surat untuk Warga

**Skenario:** Warga minta surat keterangan domisili (SKD)

```
STEP 1: Warga Datang
   └─> Warga datang ke kantor desa
   └─> Minta surat keterangan domisili
   └─> Menyerahkan KTP/NIK

STEP 2: Operator Cari Data
   └─> Operator login ke sistem
   └─> Buka halaman "Surat"
   └─> Klik "Buat Surat Baru"
   └─> Cari penduduk (by NIK atau nama)
   └─> Pilih penduduk yang sesuai

STEP 3: Buat Surat
   └─> Pilih jenis surat: "SKD" (Surat Keterangan Domisili)
   └─> Isi keterangan (jika perlu)
   └─> Pilih penandatangan: "Kepala Desa" atau "Sekretaris Desa"
   └─> Klik "Simpan"
   └─> Sistem generate nomor surat otomatis (contoh: 001/SKD/2024)

STEP 4: Review & Print
   └─> Operator review surat yang sudah dibuat
   └─> Klik "Preview" untuk melihat
   └─> Jika sudah benar, klik "Print"
   └─> Update status: "Dicetak"
   └─> Berikan surat ke warga

STEP 5: Selesai
   └─> Surat sudah dibuat dan diberikan ke warga
   └─> Data tersimpan untuk tracking
   └─> Bisa dicari kembali jika diperlukan
```

---

### C. Alur Update Data Penduduk

**Skenario:** Warga pindah alamat, perlu update data

```
STEP 1: Warga Datang
   └─> Warga datang dengan dokumen (surat keterangan pindah)

STEP 2: Operator Cari Data
   └─> Buka halaman "Penduduk"
   └─> Cari penduduk (by NIK atau nama)
   └─> Klik "Edit"

STEP 3: Update Data
   └─> Update alamat baru
   └─> Update RT/RW baru (jika berubah)
   └─> Update data lainnya (jika perlu)
   └─> Simpan

STEP 4: Update Kartu Keluarga (jika perlu)
   └─> Jika seluruh keluarga pindah, update alamat di KK juga
   └─> Buka halaman "Kartu Keluarga"
   └─> Cari KK yang sesuai
   └─> Edit alamat KK

STEP 5: Selesai
   └─> Data sudah ter-update
   └─> Sistem update otomatis (statistik, dll)
```

---

### D. Alur Laporan Bulanan

**Skenario:** Setiap akhir bulan, buat laporan untuk rapat desa

```
STEP 1: Admin/Operator Buka Dashboard
   └─> Login sebagai Admin atau Operator
   └─> Buka halaman "Dashboard"
   └─> Lihat statistik:
       - Total penduduk
       - Penduduk baru bulan ini
       - Penduduk pindah
       - Statistik per RT/RW
       - Statistik per usia, jenis kelamin, dll

STEP 2: Export Laporan
   └─> Klik "Export PDF" atau "Export Excel"
   └─> Sistem generate laporan dengan format standar
   └─> Download file

STEP 3: Gunakan untuk Rapat
   └─> Print laporan (jika perlu)
   └─> Presentasi di rapat desa
   └─> Laporkan ke atasan (kecamatan/kabupaten)
```

---

## 📋 USE CASE DETAIL

### Use Case 1: Penduduk Baru (Bayi Lahir)

**Actor:** Operator  
**Precondition:** Operator sudah login

**Main Flow:**
1. Operator buka halaman "Penduduk"
2. Klik "Tambah Penduduk"
3. Input data bayi (NIK, nama, tanggal lahir, dll)
4. Validasi NIK (harus 16 digit, unique)
5. Simpan
6. Buka halaman "Kartu Keluarga"
7. Cari KK orangtua
8. Tambahkan bayi sebagai anggota (hubungan: "Anak")
9. Selesai

**Alternative Flow:**
- Jika NIK sudah ada: tampilkan error, minta cek ulang
- Jika KK orangtua tidak ditemukan: buat KK baru dulu

**Postcondition:**
- Bayi sudah terdaftar sebagai penduduk
- Bayi sudah jadi anggota KK orangtua
- Statistik ter-update otomatis

---

### Use Case 2: Warga Minta Surat

**Actor:** Operator, Warga  
**Precondition:** Operator sudah login, warga datang ke kantor

**Main Flow:**
1. Warga datang, minta surat (SKD/KET/SKTM)
2. Warga berikan NIK/KTP
3. Operator buka halaman "Surat"
4. Operator cari data penduduk (by NIK/nama)
5. Operator klik "Buat Surat Baru"
6. Pilih jenis surat
7. Isi keterangan (jika perlu)
8. Pilih penandatangan
9. Simpan (sistem generate nomor otomatis)
10. Operator review surat
11. Print surat
12. Berikan ke warga

**Alternative Flow:**
- Jika penduduk tidak ditemukan: minta warga daftar dulu
- Jika surat perlu revisi: edit sebelum print

**Postcondition:**
- Surat sudah dibuat dengan nomor resmi
- Surat sudah diberikan ke warga
- Data tersimpan untuk tracking

---

### Use Case 3: Admin Manage User

**Actor:** Admin  
**Precondition:** Admin sudah login

**Main Flow:**
1. Admin buka halaman "Users" (hanya muncul untuk Admin)
2. Lihat list semua user
3. Klik "Tambah User" untuk operator baru
4. Input data:
   - Username
   - Email
   - Password
   - Nama
   - Role: "OPERATOR"
5. Simpan
6. Operator baru bisa login

**Alternative Flow:**
- Jika username sudah ada: tampilkan error
- Jika perlu edit user: klik edit, ubah data, simpan
- Jika perlu deactivate: klik deactivate, user tidak bisa login lagi

**Postcondition:**
- User baru sudah dibuat
- User bisa login dengan credential yang diberikan

---

## 🔍 CONTOH KASUS NYATA

### Kasus 1: Penduduk Baru dari Luar Desa

**Situasi:**
- Keluarga Pak Budi pindah dari desa lain
- Perlu didaftarkan sebagai penduduk baru

**Alur:**
1. Pak Budi datang ke kantor desa dengan dokumen (KTP, KK, surat pindah)
2. Operator input data Pak Budi (sebagai kepala keluarga)
3. Buat Kartu Keluarga baru dengan Pak Budi sebagai kepala
4. Input data istri dan anak-anak (jika ada)
5. Tambahkan istri dan anak sebagai anggota KK
6. Update status: penduduk aktif
7. Selesai, keluarga Pak Budi sudah terdaftar

---

### Kasus 2: Warga Minta Surat untuk Kebutuhan Administrasi

**Situasi:**
- Ibu Siti perlu surat keterangan domisili untuk daftar sekolah anak
- Datang ke kantor desa

**Alur:**
1. Ibu Siti datang, berikan KTP
2. Operator cari data Ibu Siti di sistem (by NIK)
3. Data ditemukan, status aktif
4. Operator buat surat SKD
   - Nomor: 045/SKD/2024 (otomatis)
   - Untuk: Ibu Siti (NIK: 320101...)
   - Penandatangan: Kepala Desa
5. Print surat
6. Berikan ke Ibu Siti
7. Ibu Siti bisa gunakan untuk daftar sekolah

---

### Kasus 3: Penduduk Meninggal

**Situasi:**
- Pak Ahmad meninggal dunia
- Perlu update status di sistem

**Alur:**
1. Keluarga datang ke kantor desa dengan akta kematian
2. Operator cari data Pak Ahmad
3. Edit status kependudukan: "Meninggal"
4. Update status di Kartu Keluarga (jika Pak Ahmad kepala keluarga, mungkin perlu ganti kepala keluarga)
5. Selesai, data ter-update
6. Statistik otomatis ter-update (penduduk aktif berkurang 1)

---

## 📊 METRIK & TRACKING

**Data yang Bisa Ditrack:**
1. **Jumlah Penduduk**
   - Total penduduk
   - Penduduk baru (bulan ini, tahun ini)
   - Penduduk pindah
   - Penduduk meninggal

2. **Kartu Keluarga**
   - Total KK
   - Rata-rata anggota per KK
   - KK baru (bulan ini)

3. **Surat Administrasi**
   - Jumlah surat dibuat (hari ini, bulan ini)
   - Jenis surat yang paling banyak
   - Operator yang paling aktif

4. **Layanan Warga**
   - Warga yang dilayani hari ini
   - Waktu rata-rata pembuatan surat
   - Kepuasan (jika ada sistem feedback)

---

## ✅ BEST PRACTICES

1. **Input Data**
   - Pastikan NIK valid (16 digit, unique)
   - Validasi tanggal lahir
   - Pastikan penduduk aktif ada di Kartu Keluarga

2. **Pembuatan Surat**
   - Selalu cek data penduduk sebelum buat surat
   - Review surat sebelum print
   - Update status surat dengan benar (Draft → Selesai → Dicetak)

3. **Keamanan**
   - Jangan share password
   - Logout setelah selesai
   - Jangan biarkan sistem terbuka tanpa pengawasan

4. **Backup**
   - Export data secara berkala
   - Backup database secara rutin
   - Simpan backup di tempat aman

---

**Dokumen ini menjelaskan bagaimana sistem digunakan dalam praktik sehari-hari.**
**Update terakhir: 2024**

