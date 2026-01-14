# 📁 Data Dummy untuk Import

## File yang Tersedia

### 1. `template_penduduk_kepala_keluarga.csv` ⭐ **UNTUK IMPORT KK**

**Deskripsi:** Data dummy untuk import Penduduk (50 kepala keluarga yang dibutuhkan untuk KK)

**Isi:**

- 50 data penduduk yang menjadi kepala keluarga di template_kk.csv
- NIK sesuai dengan kepalaKeluargaNIK di template_kk.csv
- Data lengkap: tempat lahir, tanggal lahir, jenis kelamin, agama, pendidikan, pekerjaan, status perkawinan, alamat lengkap

**Cara Pakai:**

1. **IMPORT INI DULU** sebelum import KK!
2. Buka halaman **Penduduk** (`/penduduk`)
3. Klik **"Import Data"**
4. Upload file `template_penduduk_kepala_keluarga.csv`
5. Klik **"Import Data"**
6. ✅ 50 kepala keluarga berhasil di-import

**Catatan:**

- NIK: 3201010101010001, 3201010101010003, 3201010101010005, dll (sesuai dengan kepalaKeluargaNIK di template_kk.csv)
- Semua data sudah valid dan siap di-import
- **PENTING:** Import ini dulu sebelum import KK!

---

### 2. `template_penduduk.csv`

**Deskripsi:** Data dummy untuk import Penduduk (150 data)

**Isi:**

- 150 data penduduk dengan NIK valid (16 digit)
- Nama Indonesia yang realistic
- Data lengkap: tempat lahir, tanggal lahir, jenis kelamin, agama, pendidikan, pekerjaan, status perkawinan, alamat lengkap
- Format sesuai template import
- **Variasi lengkap untuk dashboard:**
  - Agama: Islam (mayoritas), Kristen, Hindu
  - Pendidikan: SD, SMP, SMA, SMK, S1, S2
  - Pekerjaan: PNS, Guru, Dokter, Wiraswasta, Petani, Buruh, Karyawan, Perawat, Insinyur, Arsitek, Dosen, Pengusaha, Sopir, Tukang, Mekanik, Pedagang, Ibu Rumah Tangga, Pelajar, Mahasiswa
  - RT: 01-30 (distribusi merata)
  - RW: 02, 03, 04 (3 RW)
  - Umur: 1975-2002 (variasi umur untuk statistik)
  - Status: Semua Aktif

**Cara Pakai:**

1. Buka halaman **Penduduk** (`/penduduk`)
2. Klik **"Import Data"**
3. Upload file `template_penduduk.csv`
4. Klik **"Import Data"**

**Catatan:**

- NIK: 3201010101010001 - 3201010101010150
- Semua data sudah valid dan siap di-import
- Tidak ada duplicate NIK
- Data variatif untuk membuat dashboard lebih informatif

---

### 2. `template_kk.csv`

**Deskripsi:** Data dummy untuk import Kartu Keluarga (50 data)

**Isi:**

- 50 data Kartu Keluarga dengan nomor KK valid (16 digit)
- Kepala keluarga menggunakan NIK dari data penduduk (harus sudah ada di database)
- Alamat lengkap dengan RT/RW
- Distribusi merata di berbagai RT/RW

**Cara Pakai:**

1. **PENTING:** Import `template_penduduk.csv` terlebih dahulu!
2. Buka halaman **Kartu Keluarga** (`/kk`)
3. Klik **"Import Data"**
4. Upload file `template_kk.csv`
5. Klik **"Import Data"**

**Catatan:**

- Nomor KK: 3201010101011001 - 3201010101011050
- Kepala keluarga NIK: Menggunakan NIK dari data penduduk yang sudah terdaftar
- Pastikan penduduk dengan NIK tersebut sudah terdaftar sebelum import KK

---

## Urutan Import yang Benar

### **Opsi 1: Import Cepat (Hanya untuk KK)** ⭐ **RECOMMENDED**

**Untuk import KK saja dengan cepat:**

#### Step 1: Import Kepala Keluarga DULU

```
1. Buka /penduduk
2. Klik "Import Data"
3. Upload template_penduduk_kepala_keluarga.csv
4. Import → 50 kepala keluarga berhasil ✅
```

#### Step 2: Import Kartu Keluarga

```
1. Buka /kk
2. Klik "Import Data"
3. Upload template_kk.csv
4. Import → 50 data berhasil ✅
```

**Hasil:**

- ✅ 50 kepala keluarga terdaftar
- ✅ 50 KK terdaftar
- ✅ Kepala keluarga otomatis jadi anggota KK

---

### **Opsi 2: Import Lengkap (150 Penduduk + 50 KK)**

**Untuk import semua data:**

#### Step 1: Import Penduduk Lengkap

```
1. Buka /penduduk
2. Klik "Import Data"
3. Upload template_penduduk.csv
4. Import → 150 data berhasil ✅
```

#### Step 2: Import Kartu Keluarga

```
1. Buka /kk
2. Klik "Import Data"
3. Upload template_kk.csv
4. Import → 50 data berhasil ✅
```

**Hasil:**

- ✅ 150 penduduk terdaftar
- ✅ 50 KK terdaftar
- ✅ Kepala keluarga otomatis jadi anggota KK

---

### **Opsi 3: Import dengan Auto-Add ke KK**

**Untuk import penduduk yang otomatis masuk ke KK:**

#### Step 1: Import KK DULU

```
1. Buka /kk
2. Klik "Import Data"
3. Upload template_kk.csv
4. Import → 50 data berhasil ✅
```

**⚠️ PENTING:** Pastikan kepala keluarga sudah ada! Import `template_penduduk_kepala_keluarga.csv` dulu!

#### Step 2: Import Penduduk dengan Auto-Add

```
1. Buka /penduduk
2. Klik "Import Data"
3. Upload template_penduduk_with_kk.csv
4. Import → 30 data berhasil ✅
5. ✅ Penduduk otomatis jadi anggota KK!
```

**Hasil:**

- ✅ 50 KK terdaftar
- ✅ 30 penduduk terdaftar
- ✅ 30 penduduk otomatis jadi anggota KK sesuai nomorKK & hubungan

---

**⚠️ PENTING:**

- Jangan import KK sebelum import kepala keluarga!
- Gunakan `template_penduduk_kepala_keluarga.csv` untuk import cepat kepala keluarga

---

## Data yang Tersedia

### Penduduk (150 data):

- **NIK:** 3201010101010001 - 3201010101010150
- **Nama:** Budi Santoso, Siti Nurhaliza, Agus Wijaya, dll (150 nama unik)
- **Jenis Kelamin:** Laki-laki & Perempuan (distribusi seimbang)
- **Agama:** Islam (mayoritas), Kristen, Hindu
- **Pendidikan:** SD, SMP, SMA, SMK, S1, S2 (variasi lengkap)
- **Pekerjaan:** PNS, Guru, Dokter, Wiraswasta, Petani, Buruh, Karyawan, Perawat, Insinyur, Arsitek, Dosen, Pengusaha, Sopir, Tukang, Mekanik, Pedagang, Ibu Rumah Tangga, Pelajar, Mahasiswa
- **Status:** Semua Aktif
- **RT:** 01-30 (distribusi merata)
- **RW:** 02, 03, 04 (3 RW)
- **Umur:** 1975-2002 (variasi umur untuk statistik)

### Kartu Keluarga (50 data):

- **Nomor KK:** 3201010101011001 - 3201010101011050
- **Kepala Keluarga:** 50 penduduk yang sudah terdaftar
- **Alamat:** Jl. Raya Merdeka No. 123-272
- **RT/RW:** 01-30 / 02-04 (distribusi merata)

---

## Manfaat untuk Dashboard

Dengan 150 data penduduk dan 50 KK, dashboard akan menampilkan:

✅ **Grafik Agama** - Islam (mayoritas), Kristen, Hindu
✅ **Grafik Pendidikan** - SD, SMP, SMA, SMK, S1, S2
✅ **Grafik Pekerjaan** - 19 jenis pekerjaan berbeda
✅ **Grafik RT/RW** - 30 RT di 3 RW
✅ **Statistik Umur** - Variasi dari 1975-2002
✅ **Statistik Jenis Kelamin** - Distribusi seimbang
✅ **Total Penduduk** - 150 orang
✅ **Total KK** - 50 Kartu Keluarga

---

## Tips

1. **Test Import:**

   - Import 1-2 data dulu untuk test
   - Jika berhasil, baru import semua

2. **Cek Data:**

   - Setelah import, cek di halaman Penduduk/KK
   - Pastikan data muncul dengan benar
   - Cek dashboard untuk melihat grafik

3. **Error Handling:**

   - Jika ada error, cek error detail di modal import
   - Perbaiki data yang error, lalu import lagi

4. **Backup:**
   - Backup database sebelum import besar
   - Gunakan export untuk backup data

---

## Format File

- **Encoding:** UTF-8
- **Separator:** Koma (,)
- **Header:** Baris pertama (wajib)
- **Data:** Mulai baris kedua

---

## Fitur Auto-Add ke KK ⭐ NEW

### Cara Kerja:

1. Tambahkan kolom `nomorKK` dan `hubungan` di CSV penduduk
2. Saat import, sistem akan:
   - Import penduduk ke database
   - Otomatis cari KK berdasarkan nomorKK
   - Tambahkan penduduk sebagai anggota KK dengan hubungan yang ditentukan

### Format CSV dengan Auto-Add:

```csv
nik,nama,...,nomorKK,hubungan
3201010101010001,Budi Santoso,...,3201010101011001,Kepala Keluarga
3201010101010002,Siti Nurhaliza,...,3201010101011001,Istri
3201010101010003,Putra Ramadhan,...,3201010101011001,Anak
```

### Hubungan yang Valid:

- Kepala Keluarga
- Istri
- Anak
- Menantu
- Cucu
- Orang Tua
- Mertua
- Famili Lain
- Pembantu
- Lainnya

### Catatan:

- Kolom `nomorKK` dan `hubungan` **opsional**
- Jika tidak diisi, penduduk tetap di-import (tapi tidak ditambahkan ke KK)
- Jika `nomorKK` diisi tapi `hubungan` kosong → Error
- Jika `hubungan` diisi tapi `nomorKK` kosong → Error
- Nomor KK harus sudah ada di database (import KK dulu!)

---

**Selamat Mencoba!** 🚀

**Setelah import, dashboard akan terlihat lebih informatif dengan grafik yang bervariasi!**

**Tips:** Gunakan `template_penduduk_with_kk.csv` untuk import yang lebih mudah - penduduk otomatis masuk ke KK yang sesuai!
