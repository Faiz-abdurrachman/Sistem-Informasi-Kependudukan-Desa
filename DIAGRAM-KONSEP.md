# 📐 DIAGRAM KONSEP SISTEM
## Sistem Informasi Kependudukan Desa (SIKD)

Dokumen ini menjelaskan konsep, arsitektur, dan alur data dalam sistem.

---

## 1. ENTITY RELATIONSHIP DIAGRAM (ERD)

```
┌─────────────────────────────────────────────────────────────────┐
│                    ENTITY RELATIONSHIP DIAGRAM                   │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐
│    USER      │
│──────────────│
│ id (PK)      │◄──────────────────┐
│ username     │                   │
│ email        │                   │ N
│ password     │                   │
│ role         │                   │
│ nama         │                   │
│ isActive     │                   │
└──────────────┘                   │
                                   │
                           ┌───────┴───────┐
                           │     SURAT     │
                           │───────────────│
                           │ id (PK)       │
                           │ nomorSurat    │
                           │ jenisSurat    │
                           │ pendudukId(FK)├──┐
                           │ userId (FK)   │  │
                           │ keterangan    │  │
                           │ penandatangan │  │
                           │ jabatan       │  │
                           │ tanggalSurat  │  │
                           │ status        │  │
                           └───────────────┘  │
                                              │
                                              │
          ┌───────────────────────────────────┼───────────────────┐
          │                                   │                   │
          │ N                                 │                   1
          │                                   │                   │
          │                            ┌──────▼────────┐         │
          │                            │   PENDUDUK    │         │
          │                            │───────────────│         │
          │                            │ id (PK)       │         │
          │                            │ nik (UNIQUE)  │         │
          │                            │ nama          │         │
          │                            │ tempatLahir   │         │
          │                            │ tanggalLahir  │         │
          │                            │ jenisKelamin  │         │
          │                            │ agama         │         │
          │                            │ pendidikan    │         │
          │                            │ pekerjaan     │         │
          │                            │ statusPerk... │         │
          │                            │ alamat        │         │
          │                            │ rt            │         │
          │                            │ rw            │         │
          │                            │ desa          │         │
          │                            │ kecamatan     │         │
          │                            │ kabupaten     │         │
          │                            │ provinsi      │         │
          │                            │ golonganDarah │         │
          │                            │ statusKepend..│         │
          │                            │ nomorKK (?)   │◄────────┼─── OPTIONAL, bisa dihapus
          │                            └──────┬────────┘         │
          │                                   │                  │
          │                             1     │     N            │
          │                                   │                  │
          │                            ┌──────┴──────────────────┴──────┐
          │                            │   ANGGOTA KELUARGA             │
          │                            │   (Junction Table)             │
          │                            │──────────────────────────────│
          │                            │ id (PK)                      │
          │                            │ kartuKeluargaId (FK)         │
          │                            │ pendudukId (FK)              │
          │                            │ hubungan                      │
          │                            │ status                        │
          │                            │ UNIQUE(kartuKeluargaId,      │
          │                            │         pendudukId)           │
          │                            └──────┬───────────────────────┘
          │                                   │
          │                              N    │     1
          │                                   │
          │                            ┌──────▼──────────┐
          │                            │ KARTU KELUARGA  │
          │                            │─────────────────│
          │                            │ id (PK)         │
          │                            │ nomorKK(UNIQUE) │
          │                            │ kepalaKeluargaId│
          │                            │      (FK)       │──┐
          │                            │ alamat          │  │
          │                            │ rt              │  │
          │                            │ rw              │  │
          │                            │ desa            │  │
          │                            │ kecamatan       │  │
          │                            │ kabupaten       │  │
          │                            │ provinsi        │  │
          │                            │ kodePos         │  │
          │                            └─────────────────┘  │
          │                                                 │
          │                                                 1
          │                                                 │
          │                                    (kepalaKeluargaId)
          └─────────────────────────────────────────────────┘

KETERANGAN:
- PK = Primary Key
- FK = Foreign Key
- N = Many (banyak)
- 1 = One (satu)
- (?) = Optional (bisa dihapus atau dibuat computed)
```

---

## 2. RELASI DATA UTAMA

### A. Relasi Penduduk ↔ Kartu Keluarga

```
PENDUDUK (1) ────< ANGGOTA_KELUARGA >─── (N) KARTU_KELUARGA

KONSEP:
- 1 Penduduk bisa jadi anggota BANYAK KK? 
  → TIDAK! Dalam praktik desa: 1 Penduduk aktif HARUS jadi anggota tepat 1 KK
  
- 1 KK punya BANYAK anggota (kepala + istri + anak + dll)
- 1 KK punya tepat 1 Kepala Keluarga (yang juga anggota)
- Kepala Keluarga adalah Penduduk yang sudah ada

RULE BISNIS:
1. Penduduk dibuat DULU (belum tentu ada di KK)
2. Penduduk ditambahkan ke KK sebagai anggota
3. Penduduk aktif HARUS jadi anggota minimal 1 KK
4. Saat penduduk ditambahkan ke KK, field nomorKK di Penduduk bisa di-update (optional)
```

---

### B. Relasi User ↔ Surat

```
USER (1) ────< (N) SURAT

- 1 User (ADMIN/OPERATOR) bisa membuat banyak surat
- Setiap surat dicatat siapa yang membuat (untuk audit)
```

---

### C. Relasi Penduduk ↔ Surat

```
PENDUDUK (1) ────< (N) SURAT

- 1 Penduduk bisa punya banyak surat (SKD, KET, SKTM, dll)
- Surat dibuat untuk penduduk tertentu
```

---

## 3. ARSITEKTUR SISTEM

```
┌──────────────────────────────────────────────────────────────┐
│                      ARSITEKTUR SISTEM                        │
└──────────────────────────────────────────────────────────────┘

┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   FRONTEND  │         │   BACKEND   │         │  DATABASE   │
│   (React)   │◄───────►│  (Express)  │◄───────►│   (MySQL)   │
│             │  HTTP   │             │  Prisma │             │
│ - Pages     │  REST   │ - Routes    │  ORM    │ - Tables    │
│ - Components│  API    │ - Controllers│         │ - Relations │
│ - Context   │         │ - Services  │         │ - Indexes   │
│ - Utils     │         │ - Middleware│         │             │
└─────────────┘         └─────────────┘         └─────────────┘

FLOW DATA:
1. User interaksi di Frontend (React)
2. Frontend kirim request HTTP ke Backend (Express)
3. Backend validasi & proses (Controller)
4. Backend akses database via Prisma ORM
5. Database return data
6. Backend kirim response ke Frontend
7. Frontend render UI
```

---

## 4. ALUR DATA: CREATE PENDUDUK → TAMBAH KE KK

```
┌─────────────────────────────────────────────────────────────┐
│     ALUR DATA: PENDAFTARAN PENDUDUK & KARTU KELUARGA        │
└─────────────────────────────────────────────────────────────┘

STEP 1: CREATE PENDUDUK
┌──────────────┐
│  OPERATOR    │
│  Input Data  │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────┐
│ VALIDASI:                            │
│ - NIK 16 digit                       │
│ - NIK unique                         │
│ - Tanggal lahir valid                │
│ - Field wajib terisi                 │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ SAVE KE DATABASE:                    │
│ INSERT INTO penduduk (...)           │
│ - statusKependudukan = "Aktif"       │
│ - nomorKK = NULL (belum ada)         │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ PENDUDUK DIBUAT                      │
│ (Tapi belum jadi anggota KK)         │
└──────────────────────────────────────┘


STEP 2: TAMBAH KE KARTU KELUARGA
┌──────────────┐
│  OPERATOR    │
│  Pilih KK    │
│  yang sesuai │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────┐
│ VALIDASI:                            │
│ - KK ada?                            │
│ - Penduduk belum jadi anggota KK ini?│
│ - Hubungan valid?                    │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ SAVE KE DATABASE:                    │
│ INSERT INTO anggota_keluarga (...)   │
│ - kartuKeluargaId = X                │
│ - pendudukId = Y                     │
│ - hubungan = "Kepala/Istri/Anak"     │
│ - status = "Aktif"                   │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ AUTO-SYNC (OPTIONAL):                │
│ UPDATE penduduk                      │
│ SET nomorKK = (SELECT nomorKK        │
│                FROM kartu_keluarga   │
│                WHERE id = X)         │
│ WHERE id = Y                         │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ DATA KONSISTEN                       │
│ - Penduduk ada di AnggotaKeluarga    │
│ - Penduduk.nomorKK = KK.nomorKK      │
└──────────────────────────────────────┘
```

---

## 5. ALUR DATA: PEMBUATAN SURAT

```
┌─────────────────────────────────────────────────────────────┐
│              ALUR DATA: PEMBUATAN SURAT ADMINISTRASI         │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐
│ WARGA DATANG │
│ Minta Surat  │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────┐
│ OPERATOR CARI DATA PENDUDUK          │
│ GET /api/penduduk?search=NIK/nama    │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ VALIDASI:                            │
│ - Penduduk ada?                      │
│ - Status aktif?                      │
│ - Ada di KK? (opsional validasi)     │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ BUAT SURAT                           │
│ POST /api/surat                      │
│ {                                    │
│   jenisSurat: "SKD",                 │
│   pendudukId: 123,                   │
│   keterangan: "...",                 │
│   penandatangan: "Kepala Desa",      │
│   jabatan: "Kepala Desa"             │
│ }                                    │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ BACKEND GENERATE NOMOR SURAT         │
│ - Cari nomor terakhir per jenis      │
│ - Increment: 001/SKD/2024            │
│ - Save ke database                   │
│ - Status: "Draft"                    │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ OPERATOR REVIEW & EDIT               │
│ PUT /api/surat/:id                   │
│ (Jika perlu perubahan)               │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ UPDATE STATUS                        │
│ PATCH /api/surat/:id/status          │
│ { status: "Selesai" }                │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ PRINT/CETAK                          │
│ PATCH /api/surat/:id/status          │
│ { status: "Dicetak" }                │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ WARGA TERIMA SURAT                   │
│ Data tersimpan untuk tracking        │
└──────────────────────────────────────┘
```

---

## 6. SEQUENCE DIAGRAM: LOGIN → BUAT SURAT

```
┌─────────────────────────────────────────────────────────────┐
│     SEQUENCE DIAGRAM: LOGIN → BUAT SURAT ADMINISTRASI       │
└─────────────────────────────────────────────────────────────┘

ACTOR          FRONTEND         BACKEND         DATABASE
  │                │                │                │
  │───LOGIN────────►│                │                │
  │                │───POST /auth───►│                │
  │                │                │───QUERY USER───►│
  │                │                │◄───USER DATA───│
  │                │◄───JWT TOKEN───│                │
  │◄───LOGGED IN───│                │                │
  │                │                │                │
  │───REQUEST──────►│                │                │
  │   SURAT        │                │                │
  │                │───GET /penduduk►│                │
  │                │   ?search=...  │                │
  │                │                │───QUERY───────►│
  │                │                │◄───DATA───────│
  │                │◄───PENDUDUK───│                │
  │◄───SHOW DATA───│                │                │
  │                │                │                │
  │───CREATE───────►│                │                │
  │   SURAT        │                │                │
  │                │───POST /surat──►│                │
  │                │  (with JWT)    │                │
  │                │                │───GENERATE─────►│
  │                │                │   NOMOR        │
  │                │                │───INSERT───────►│
  │                │                │                │
  │                │                │◄───SUCCESS─────│
  │                │◄───SURAT DATA──│                │
  │◄───SUCCESS─────│                │                │
  │                │                │                │
```

---

## 7. DATA FLOW: DASHBOARD STATISTIK

```
┌─────────────────────────────────────────────────────────────┐
│            DATA FLOW: DASHBOARD STATISTIK                    │
└─────────────────────────────────────────────────────────────┘

FRONTEND                    BACKEND                    DATABASE
   │                           │                           │
   │───GET /statistik─────────►│                           │
   │                           │                           │
   │                           │───CHECK CACHE────────────►│
   │                           │   (tabel statistik)       │
   │                           │                           │
   │                           │◄───CACHE HIT?─────────────│
   │                           │                           │
   │                           │───IF NO: QUERY───────────►│
   │                           │   SELECT COUNT(*)         │
   │                           │   GROUP BY ...            │
   │                           │                           │
   │                           │◄───AGGREGATED DATA────────│
   │                           │                           │
   │                           │───UPDATE CACHE───────────►│
   │                           │   (tabel statistik)       │
   │                           │                           │
   │◄───STATISTIK DATA─────────│                           │
   │                           │                           │
   │───RENDER CHARTS───────────│                           │
   │   (recharts)              │                           │
   │                           │                           │
```

---

## 8. KONSEP ROLE & PERMISSION

```
┌─────────────────────────────────────────────────────────────┐
│                 ROLE & PERMISSION MATRIX                     │
└─────────────────────────────────────────────────────────────┘

RESOURCE          ADMIN       OPERATOR      PUBLIK
─────────────────────────────────────────────────────
Penduduk
  - Read          ✅          ✅            ❌
  - Create        ✅          ✅            ❌
  - Update        ✅          ✅            ❌
  - Delete        ✅          ⚠️*           ❌

Kartu Keluarga
  - Read          ✅          ✅            ❌
  - Create        ✅          ✅            ❌
  - Update        ✅          ✅            ❌
  - Delete        ✅          ⚠️*           ❌

Surat
  - Read          ✅          ✅            ❌
  - Create        ✅          ✅            ❌
  - Update        ✅          ✅            ❌
  - Delete        ✅          ✅            ❌

User Management
  - Read          ✅          ❌            ❌
  - Create        ✅          ❌            ❌
  - Update        ✅          ❌            ❌
  - Delete        ✅          ❌            ❌

Laporan
  - View          ✅          ✅            ⚠️**
  - Export        ✅          ✅            ❌

Dashboard
  - View          ✅          ✅            ⚠️**
  - Full Stats    ✅          ✅            ❌

Import/Export
  - Import        ✅          ✅            ❌
  - Export        ✅          ✅            ❌

─────────────────────────────────────────────────────
* OPERATOR: Soft delete (ubah status) atau dengan approval
** PUBLIK: Hanya statistik umum, tidak detail per penduduk

KETERANGAN:
✅ = Full Access
⚠️ = Limited Access
❌ = No Access
```

---

## 9. STATE MANAGEMENT (Frontend)

```
┌─────────────────────────────────────────────────────────────┐
│              STATE MANAGEMENT DI FRONTEND                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────┐
│  AuthContext    │
│─────────────────│
│ - user          │◄───────┐
│ - token         │        │
│ - isAuthenticated│       │
│ - login()       │        │
│ - logout()      │        │
└─────────────────┘        │
        │                  │
        │                  │
        ▼                  │
┌──────────────────────────┴─────────────────────────┐
│              PAGES (Local State)                    │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Dashboard.jsx                                      │
│  - statistik (useState)                            │
│  - loading (useState)                              │
│                                                     │
│  Penduduk.jsx                                       │
│  - penduduk (useState[])                           │
│  - formData (useState)                             │
│  - pagination (useState)                           │
│  - filters (useState)                              │
│                                                     │
│  KartuKeluarga.jsx                                  │
│  - kk (useState[])                                  │
│  - formData (useState)                             │
│  - anggotaList (useState[])                        │
│                                                     │
│  Surat.jsx                                          │
│  - surat (useState[])                              │
│  - formData (useState)                             │
│                                                     │
└─────────────────────────────────────────────────────┘

PATTERN:
- Global state: AuthContext (user, token)
- Local state: useState di setiap page (data, form, loading)
- API calls: axios instance dengan interceptor (auto attach token)
```

---

## 10. ERROR HANDLING FLOW

```
┌─────────────────────────────────────────────────────────────┐
│                  ERROR HANDLING FLOW                         │
└─────────────────────────────────────────────────────────────┘

FRONTEND                    BACKEND                    DATABASE
   │                           │                           │
   │───REQUEST────────────────►│                           │
   │                           │───QUERY───────────────────►│
   │                           │                           │
   │                           │◄───ERROR──────────────────│
   │                           │   (DB error)              │
   │                           │                           │
   │                           │───CATCH ERROR─────────────│
   │                           │───LOG ERROR───────────────│
   │                           │───FORMAT ERROR────────────│
   │                           │   {                       │
   │                           │     success: false,       │
   │                           │     message: "...",       │
   │                           │     error: "..."          │
   │                           │   }                       │
   │                           │                           │
   │◄───ERROR RESPONSE─────────│                           │
   │    (400/404/500)          │                           │
   │                           │                           │
   │───AXIOS INTERCEPTOR───────│                           │
   │───TOAST ERROR─────────────│                           │
   │   (react-hot-toast)       │                           │
   │                           │                           │
   │───USER SEES ERROR─────────│                           │
   │    (friendly message)     │                           │
   │                           │                           │
```

---

## 11. SECURITY LAYERS

```
┌─────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                           │
└─────────────────────────────────────────────────────────────┘

LAYER 1: AUTHENTICATION
┌─────────────────────┐
│  Login              │
│  - Username/Password│
│  - Bcrypt hash      │
│  - JWT token        │
└─────────────────────┘
         │
         ▼
LAYER 2: AUTHORIZATION
┌─────────────────────┐
│  Middleware         │
│  - authMiddleware   │
│    (verify JWT)     │
│  - roleMiddleware   │
│    (check role)     │
└─────────────────────┘
         │
         ▼
LAYER 3: VALIDATION
┌─────────────────────┐
│  Input Validation   │
│  - express-validator│
│  - Custom validators│
│  - SQL injection    │
│    (Prisma ORM)     │
└─────────────────────┘
         │
         ▼
LAYER 4: DATABASE
┌─────────────────────┐
│  Database Security  │
│  - Foreign keys     │
│  - Unique constraints│
│  - Indexes          │
└─────────────────────┘
```

---

**Dokumen ini menjelaskan konsep dan arsitektur sistem secara visual.**
**Update terakhir: 2024**

