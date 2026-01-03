# 📊 ANALISIS SISTEM & RENCANA PERBAIKAN
## Sistem Informasi Kependudukan Desa (SIKD)

**Tanggal Analisis:** 2024  
**Status:** Sistem berfungsi, namun perlu peningkatan untuk menjadi "sistem desa yang hidup"

---

## 🔍 I. ANALISIS MASALAH

### 1. **Masalah Konseptual: Data Belum "Hidup"**

#### ❌ Masalah yang Ditemukan:

**A. Relasi Penduduk ↔ Kartu Keluarga Tidak Konsisten**

Masalah:
- Penduduk memiliki field `nomorKK` (optional) di schema
- Tapi relasi sebenarnya ada di tabel `AnggotaKeluarga`
- Bisa terjadi: Penduduk punya `nomorKK` tapi tidak ada di `AnggotaKeluarga`
- Bisa terjadi: Penduduk ada di `AnggotaKeluarga` tapi `nomorKK` di Penduduk null/salah

**Dampak:**
- Data tidak sinkron
- Sulit untuk validasi "semua penduduk harus punya KK"
- Query menjadi kompleks dan error-prone

**Solusi yang Diperlukan:**
- Field `nomorKK` di Penduduk sebaiknya dihapus atau dibuat sebagai computed field
- Validasi ketat: Penduduk yang aktif HARUS menjadi anggota minimal 1 KK
- Auto-sync `nomorKK` di Penduduk saat ditambahkan ke KK

---

**B. Tidak Ada Narasi Sistem**

Masalah:
- Sistem masih terasa seperti "tugas coding"
- Tidak ada dokumentasi alur kerja desa
- Tidak jelas bagaimana sistem ini digunakan dalam kehidupan sehari-hari

**Yang Perlu:**
- Dokumentasi alur kerja: "Warga datang minta surat → Operator cek data → Buat surat → Cetak"
- Narasi use case: "Bagaimana sistem membantu desa dalam administrasi?"
- Dokumentasi peran setiap role dalam sistem

---

**C. Role User Belum Jelas**

Masalah:
- Ada 3 role: ADMIN, OPERATOR, PUBLIK
- Tapi tidak jelas:
  - Apa yang bisa dilakukan PUBLIK?
  - Bagaimana ADMIN manage user?
  - Apa perbedaan tugas ADMIN vs OPERATOR di dunia nyata?

**Yang Perlu:**
- Dokumentasi lengkap per role
- User management page untuk ADMIN
- Clear permission matrix

---

**D. Output Desa Belum Kuat**

Masalah:
- Dashboard ada tapi basic
- Surat ada tapi belum jelas jenis-jenisnya dan kapan digunakan
- Tidak ada laporan yang bisa di-export (kecuali statistik)
- Tidak ada rekap data yang berguna untuk desa

**Yang Perlu:**
- Laporan rekap penduduk (per RT/RW, per usia, per status)
- Export laporan ke Excel/PDF
- Dashboard yang lebih informatif
- Tracking surat yang lebih detail

---

### 2. **Masalah Teknis**

#### A. Validasi Relasi Tidak Ketat

**Masalah:**
```javascript
// Saat create Penduduk, tidak ada validasi bahwa penduduk HARUS punya KK
// Penduduk bisa dibuat tanpa menjadi anggota KK manapun
```

**Solusi:**
- Validasi: Penduduk aktif HARUS menjadi anggota minimal 1 KK
- Atau buat status "Belum Terdaftar di KK" untuk penduduk baru

---

#### B. Inkonsistensi Data

**Masalah:**
- Field `nomorKK` di Penduduk bisa berbeda dengan `nomorKK` di KartuKeluarga yang sebenarnya
- Tidak ada trigger/constraint untuk menjaga konsistensi

**Solusi:**
- Hapus field `nomorKK` dari Penduduk, atau
- Buat computed field berdasarkan `AnggotaKeluarga`
- Auto-update saat penduduk ditambahkan/dikeluarkan dari KK

---

#### C. Tidak Ada User Management

**Masalah:**
- ADMIN tidak bisa manage user melalui UI
- Harus manual lewat database atau script

**Solusi:**
- Buat page User Management untuk ADMIN
- CRUD user dengan validasi role

---

## 📋 II. DOKUMENTASI ALUR KERJA DESA

### A. Alur Kerja Umum

```
┌─────────────────────────────────────────────────────────────┐
│                   ALUR KERJA SISTEM DESA                     │
└─────────────────────────────────────────────────────────────┘

1. PENGELOLAAN DATA PENDUDUK
   ┌──────────────────────────────────────────────────┐
   │ Operator/Admin → Input Data Penduduk            │
   │                 → Validasi NIK (16 digit)        │
   │                 → Pastikan Penduduk jadi anggota │
   │                    minimal 1 Kartu Keluarga      │
   │                 → Data siap digunakan            │
   └──────────────────────────────────────────────────┘

2. PENGELOLAAN KARTU KELUARGA
   ┌──────────────────────────────────────────────────┐
   │ Operator/Admin → Buat Kartu Keluarga            │
   │                 → Pilih Kepala Keluarga         │
   │                 → Tambahkan Anggota Keluarga    │
   │                 → Validasi: 1 KK = 1 Kepala     │
   │                    + Banyak Anggota             │
   │                 → KK siap untuk validasi        │
   └──────────────────────────────────────────────────┘

3. PEMBUATAN SURAT ADMINISTRASI
   ┌──────────────────────────────────────────────────┐
   │ Warga datang minta surat                        │
   │ Operator cek data penduduk di sistem            │
   │ Operator buat surat (nomor otomatis)            │
   │ Surat status: Draft → Selesai → Dicetak        │
   │ Warga terima surat                              │
   └──────────────────────────────────────────────────┘

4. LAPORAN & STATISTIK
   ┌──────────────────────────────────────────────────┐
   │ Admin/Operator → Lihat Dashboard                │
   │                → Export laporan ke PDF/Excel    │
   │                → Gunakan untuk rapat desa       │
   │                → Laporan ke atasan              │
   └──────────────────────────────────────────────────┘
```

---

### B. Role & Permission

#### 1. ADMIN (Kepala Desa / Sekretaris Desa)

**Tugas:**
- Mengelola semua data kependudukan
- Mengelola user (tambah, edit, hapus operator)
- Membuat surat administrasi
- Melihat laporan dan statistik
- Approve perubahan data penting

**Akses:**
- ✅ Full CRUD: Penduduk, KK, Surat
- ✅ User Management (CRUD user)
- ✅ Import/Export data
- ✅ Lihat semua laporan
- ✅ Hapus data (dengan validasi)

---

#### 2. OPERATOR (Petugas Administrasi)

**Tugas:**
- Input data penduduk baru
- Update data penduduk
- Kelola Kartu Keluarga
- Membuat surat untuk warga
- Melihat laporan (read-only)

**Akses:**
- ✅ CRUD: Penduduk, KK, Surat
- ❌ User Management
- ✅ Import data
- ✅ Export laporan
- ❌ Hapus data penting (hanya soft delete/ubah status)

---

#### 3. PUBLIK (Warga / Tamu)

**Tugas:**
- Melihat data publik (statistik umum)
- Request surat (jika ada fitur request)

**Akses:**
- ✅ Lihat dashboard publik (statistik umum saja)
- ❌ CRUD data
- ❌ Lihat data penduduk detail
- ✅ Request surat (jika ada fitur ini)

---

## 🔄 III. DIAGRAM KONSEP SISTEM

### A. Entity Relationship (Konseptual)

```
┌─────────────┐
│    USER     │
│─────────────│
│ - id        │
│ - username  │
│ - role      │ 1
│ - nama      │ │
└─────────────┘ │
                │
                │ N
         ┌──────┴──────┐
         │    SURAT    │
         │─────────────│
         │ - id        │
         │ - nomorSurat│
         │ - jenisSurat│
         │ - pendudukId│──┐
         │ - userId    │  │
         └─────────────┘  │
                          │
                          │
┌─────────────────────────┼─────────────────────────┐
│                         │                         │
│                  ┌──────▼──────┐                  │
│                  │  PENDUDUK   │                  │
│                  │─────────────│                  │
│                  │ - id        │                  │
│                  │ - nik       │                  │
│                  │ - nama      │                  │
│                  │ - ...       │                  │
│                  └──────┬──────┘                  │
│                         │                         │
│                   N     │     1                   │
│         ┌───────────────┴───────────────┐         │
│         │   ANGGOTA KELUARGA (Junction) │         │
│         │───────────────────────────────│         │
│         │ - kartuKeluargaId             │         │
│         │ - pendudukId                  │         │
│         │ - hubungan                    │         │
│         │ - status                      │         │
│         └───────────────┬───────────────┘         │
│                         │                         │
│                    N    │     1                   │
│                  ┌──────▼──────┐                  │
│                  │KARTU KELUARGA                  │
│                  │─────────────│                  │
│                  │ - id        │                  │
│                  │ - nomorKK   │                  │
│                  │ - kepala... │──┐               │
│                  │ - alamat    │  │               │
│                  └─────────────┘  │               │
│                                   │               │
│                                   1               │
│                                   │               │
│                          (kepalaKeluargaId)       │
└───────────────────────────────────────────────────┘

KUNCI KONSEP:
- 1 Penduduk bisa jadi anggota banyak KK? 
  → TIDAK! 1 Penduduk aktif HARUS jadi anggota tepat 1 KK
- 1 KK punya 1 Kepala Keluarga (harus penduduk yang sudah ada)
- 1 KK punya banyak Anggota Keluarga
- Penduduk dibuat DULU, baru ditambahkan ke KK
- Surat dibuat untuk Penduduk tertentu
```

---

### B. Alur Data Penduduk → KK

```
┌──────────────────────────────────────────────────────┐
│          ALUR: PENDAFTARAN PENDUDUK BARU             │
└──────────────────────────────────────────────────────┘

STEP 1: Input Data Penduduk
   ┌─────────────────┐
   │ Operator input  │
   │ data penduduk   │
   └────────┬────────┘
            │
            ▼
   ┌─────────────────┐
   │ Validasi NIK    │
   │ (16 digit,      │
   │  unique)        │
   └────────┬────────┘
            │
            ▼
   ┌─────────────────┐
   │ Save ke DB      │
   │ (status:        │
   │ "Belum Terdaftar│
   │  di KK"?)       │
   └────────┬────────┘
            │
            ▼
STEP 2: Tambah ke Kartu Keluarga
   ┌─────────────────┐
   │ Operator pilih  │
   │ KK yang sesuai  │
   └────────┬────────┘
            │
            ▼
   ┌─────────────────┐
   │ Tambahkan sebagai│
   │ Anggota Keluarga│
   │ (hubungan:      │
   │  Kepala/Istri/  │
   │  Anak/dll)      │
   └────────┬────────┘
            │
            ▼
   ┌─────────────────┐
   │ Auto-update?    │
   │ penduduk.nomorKK│
   │ = KK.nomorKK    │
   └─────────────────┘
```

---

### C. Alur Pembuatan Surat

```
┌──────────────────────────────────────────────────────┐
│           ALUR: PEMBUATAN SURAT ADMINISTRASI         │
└──────────────────────────────────────────────────────┘

   Warga datang
        │
        ▼
   ┌─────────────────┐
   │ Operator cari   │
   │ data penduduk   │
   │ (by NIK/Nama)   │
   └────────┬────────┘
            │
            ▼
   ┌─────────────────┐
   │ Validasi:       │
   │ - Penduduk ada? │
   │ - Status aktif? │
   │ - Ada di KK?    │
   └────────┬────────┘
            │
            ▼
   ┌─────────────────┐
   │ Buat surat      │
   │ - Pilih jenis   │
   │ - Isi keterangan│
   │ - Nomor otomatis│
   └────────┬────────┘
            │
            ▼
   ┌─────────────────┐
   │ Status: DRAFT   │
   └────────┬────────┘
            │
            ▼
   ┌─────────────────┐
   │ Review & Edit   │
   │ (jika perlu)    │
   └────────┬────────┘
            │
            ▼
   ┌─────────────────┐
   │ Status: SELESAI │
   └────────┬────────┘
            │
            ▼
   ┌─────────────────┐
   │ Print/Cetak     │
   └────────┬────────┘
            │
            ▼
   ┌─────────────────┐
   │ Status: DICETAK │
   │ Warga terima    │
   └─────────────────┘
```

---

## 🛠️ IV. RENCANA PERBAIKAN

### Priority 1: Fix Data Integrity (KRITIS)

#### 1.1. Sinkronkan Penduduk ↔ KK

**Masalah:**
- Field `nomorKK` di Penduduk optional dan bisa tidak sinkron

**Solusi:**
```javascript
// Option A: Hapus field nomorKK dari Penduduk
// Gunakan query join untuk get nomorKK dari AnggotaKeluarga

// Option B: Buat computed field/getter
// Saat get penduduk, join dengan AnggotaKeluarga untuk get nomorKK

// Option C: Auto-sync nomorKK saat tambah/hapus anggota
// Saat addAnggotaKeluarga, update penduduk.nomorKK = kk.nomorKK
```

**Rekomendasi: Option C** (auto-sync) karena:
- Backward compatible
- Query lebih cepat (tidak perlu join setiap kali)
- Tetap konsisten

---

#### 1.2. Validasi: Penduduk Harus Punya KK

**Solusi:**
```javascript
// Saat create Penduduk:
// - Allow create tanpa KK (untuk data baru)
// - Tapi saat get penduduk aktif, wajib cek ada di AnggotaKeluarga

// Atau:
// - Buat status "Belum Terdaftar di KK"
// - Validasi: Penduduk aktif HARUS jadi anggota minimal 1 KK
```

---

### Priority 2: Dokumentasi & Narasi (PENTING)

#### 2.1. Buat Dokumentasi Alur Kerja

File: `ALUR-KERJA-DESA.md`

Isi:
- Narasi bagaimana sistem digunakan
- Use case per role
- Alur pembuatan surat
- Alur input data

---

#### 2.2. Buat Diagram Konsep

File: `DIAGRAM-KONSEP.md`

Isi:
- Entity Relationship Diagram (text-based)
- Flowchart alur kerja
- Sequence diagram (jika perlu)

---

### Priority 3: User Management (PENTING)

#### 3.1. Buat Page User Management (ADMIN only)

Fitur:
- List semua user
- Tambah user baru
- Edit user (termasuk role)
- Deactivate user (soft delete)
- Reset password

Endpoint:
- `GET /api/users` - List users (ADMIN only)
- `POST /api/users` - Create user (ADMIN only)
- `PUT /api/users/:id` - Update user (ADMIN only)
- `DELETE /api/users/:id` - Deactivate user (ADMIN only)

---

### Priority 4: Output Desa yang Lebih Kuat (PENTING)

#### 4.1. Laporan Rekap Penduduk

Fitur:
- Rekap per RT/RW
- Rekap per usia (0-5, 6-17, 18-60, 60+)
- Rekap per jenis kelamin
- Rekap per status kependudukan
- Export ke Excel/PDF

---

#### 4.2. Dashboard yang Lebih Informatif

Fitur:
- Widget: Penduduk baru bulan ini
- Widget: Surat dibuat hari ini
- Widget: Data yang perlu perhatian (penduduk tanpa KK, dll)
- Chart: Trend penduduk per bulan
- Chart: Jenis surat yang paling banyak dibuat

---

#### 4.3. Laporan Surat

Fitur:
- Rekap surat per jenis
- Rekap surat per periode
- Rekap surat per operator
- Export ke Excel/PDF

---

### Priority 5: Validasi & Business Logic (PENTING)

#### 5.1. Validasi Ketat Penduduk ↔ KK

Rules:
- 1 Penduduk aktif HARUS jadi anggota tepat 1 KK
- Kepala Keluarga tidak boleh jadi anggota KK lain (sebagai anggota, bukan kepala)
- Saat tambah anggota, validasi penduduk belum jadi anggota KK lain

---

#### 5.2. Validasi Umur untuk Hubungan Keluarga

Rules:
- Kepala Keluarga: minimal 17 tahun
- Istri: relatif dengan kepala (biasanya usia lebih muda atau sama)
- Anak: relatif dengan kepala (biasanya lebih muda)
- (Validasi ini bisa fleksibel, tapi bisa ditambahkan untuk data quality)

---

## 📝 V. CHECKLIST PERBAIKAN

### Phase 1: Fix Critical Issues (Week 1)

- [ ] **1.1** Auto-sync `nomorKK` di Penduduk saat add/remove anggota KK
- [ ] **1.2** Validasi: Penduduk aktif harus jadi anggota minimal 1 KK
- [ ] **1.3** Migration script untuk fix data yang sudah ada (jika ada)

---

### Phase 2: Dokumentasi (Week 1-2)

- [ ] **2.1** Buat file `ALUR-KERJA-DESA.md`
- [ ] **2.2** Buat file `DIAGRAM-KONSEP.md`
- [ ] **2.3** Update `README.md` dengan link ke dokumentasi baru
- [ ] **2.4** Buat file `ROLE-PERMISSION.md` dengan detail per role

---

### Phase 3: User Management (Week 2)

- [ ] **3.1** Backend: Endpoint user management (ADMIN only)
- [ ] **3.2** Frontend: Page User Management
- [ ] **3.3** Testing: Test CRUD user dengan berbagai role

---

### Phase 4: Output Desa (Week 3-4)

- [ ] **4.1** Backend: Endpoint laporan rekap penduduk
- [ ] **4.2** Frontend: Page Laporan dengan filter
- [ ] **4.3** Export laporan ke Excel/PDF
- [ ] **4.4** Dashboard: Widget dan chart tambahan
- [ ] **4.5** Laporan surat

---

### Phase 5: Validasi & Polish (Week 4)

- [ ] **5.1** Validasi: 1 penduduk = 1 KK (untuk aktif)
- [ ] **5.2** Validasi: Kepala keluarga tidak bisa jadi anggota KK lain
- [ ] **5.3** Error messages yang lebih jelas
- [ ] **5.4** Testing end-to-end

---

## 🎯 VI. PROMPT UNTUK IMPLEMENTASI

### Prompt untuk Phase 1 (Fix Data Integrity):

```
Saya perlu fix konsistensi data antara Penduduk dan Kartu Keluarga.

Masalah:
1. Penduduk punya field nomorKK (optional) yang bisa tidak sinkron dengan data di AnggotaKeluarga
2. Saat penduduk ditambahkan ke KK, nomorKK di Penduduk tidak otomatis ter-update
3. Tidak ada validasi bahwa penduduk aktif HARUS jadi anggota minimal 1 KK

Yang perlu dilakukan:
1. Auto-sync penduduk.nomorKK saat addAnggotaKeluarga() dan removeAnggotaKeluarga()
2. Validasi saat create/update penduduk: jika status aktif, pastikan ada di AnggotaKeluarga
3. Buat migration/script untuk fix data yang sudah ada (jika ada inkonsistensi)

File yang perlu diubah:
- backend/src/controllers/kkController.js (addAnggotaKeluarga, removeAnggotaKeluarga)
- backend/src/controllers/pendudukController.js (createPenduduk, updatePenduduk)
- (Opsional) Migration script untuk fix data existing
```

---

### Prompt untuk Phase 2 (Dokumentasi):

```
Saya perlu dokumentasi lengkap tentang alur kerja sistem.

Yang perlu dibuat:
1. File ALUR-KERJA-DESA.md
   - Narasi bagaimana sistem digunakan dalam kehidupan sehari-hari
   - Alur input data penduduk
   - Alur pembuatan surat
   - Use case per role (ADMIN, OPERATOR, PUBLIK)

2. File DIAGRAM-KONSEP.md
   - Entity Relationship Diagram (text-based)
   - Flowchart alur kerja utama
   - Diagram alur data

3. File ROLE-PERMISSION.md
   - Detail peran setiap role
   - Permission matrix
   - Contoh use case

Gunakan format markdown dengan diagram ASCII art jika perlu.
```

---

### Prompt untuk Phase 3 (User Management):

```
Saya perlu fitur User Management untuk ADMIN.

Backend:
1. Endpoint GET /api/users (ADMIN only) - List semua user dengan pagination
2. Endpoint POST /api/users (ADMIN only) - Create user baru
3. Endpoint PUT /api/users/:id (ADMIN only) - Update user
4. Endpoint DELETE /api/users/:id (ADMIN only) - Soft delete user (set isActive = false)
5. Endpoint PATCH /api/users/:id/reset-password (ADMIN only) - Reset password user

Validasi:
- Hanya ADMIN yang bisa akses semua endpoint
- Validasi role (ADMIN, OPERATOR, PUBLIK)
- Validasi username/email unique

Frontend:
1. Page Users (hanya muncul untuk ADMIN)
2. Table list users dengan pagination
3. Modal create/edit user
4. Action: Edit, Deactivate, Reset Password

Gunakan design yang konsisten dengan page lain (Penduduk, KK, Surat).
```

---

### Prompt untuk Phase 4 (Output Desa):

```
Saya perlu laporan dan dashboard yang lebih informatif.

Backend:
1. Endpoint GET /api/laporan/penduduk/rekap
   - Query params: rt, rw, statusKependudukan, usiaMin, usiaMax
   - Return: rekap data penduduk dengan grouping

2. Endpoint GET /api/laporan/surat/rekap
   - Query params: jenisSurat, tanggalDari, tanggalSampai, userId
   - Return: rekap surat dengan grouping

3. Endpoint GET /api/dashboard/stats (improve existing)
   - Return: widget data (penduduk baru, surat hari ini, dll)

Frontend:
1. Page Laporan Penduduk
   - Filter: RT, RW, Status, Rentang Usia
   - Table rekap dengan grouping
   - Export ke Excel/PDF

2. Page Laporan Surat
   - Filter: Jenis, Periode, Operator
   - Table rekap
   - Export ke Excel/PDF

3. Dashboard improvements
   - Widget: Penduduk baru bulan ini
   - Widget: Surat dibuat hari ini
   - Chart: Trend penduduk per bulan
   - Chart: Jenis surat yang paling banyak

Gunakan chart library yang sudah ada (recharts) dan design yang konsisten.
```

---

## ✅ VII. KESIMPULAN

### Yang Sudah Bagus:
✅ Struktur database sudah baik  
✅ Validasi NIK dan KK sudah ada  
✅ CRUD Penduduk, KK, Surat sudah lengkap  
✅ Authentication & Authorization sudah ada  
✅ Dashboard basic sudah ada  

### Yang Perlu Diperbaiki:
❌ Konsistensi data Penduduk ↔ KK  
❌ Dokumentasi alur kerja  
❌ User management untuk ADMIN  
❌ Output/laporan yang lebih lengkap  
❌ Validasi business rule yang lebih ketat  

### Prioritas:
1. **PRIORITY 1 (KRITIS):** Fix data integrity
2. **PRIORITY 2 (PENTING):** Dokumentasi
3. **PRIORITY 3 (PENTING):** User management
4. **PRIORITY 4 (PENTING):** Output/laporan
5. **PRIORITY 5 (NICE TO HAVE):** Validasi tambahan

---

**Dibuat untuk membantu developer memahami sistem dan merencanakan perbaikan.**
**Update terakhir: 2024**

