// ============================================
// FILE: options.js
// ============================================
//
// DESKRIPSI:
// Data pilihan untuk dropdown form
// Berisi semua opsi yang bisa dipilih user
//
// ============================================

/**
 * Pilihan Jenis Kelamin
 */
export const jenisKelaminOptions = [
  { value: "Laki-laki", label: "Laki-laki" },
  { value: "Perempuan", label: "Perempuan" },
];

/**
 * Pilihan Agama
 */
export const agamaOptions = [
  { value: "Islam", label: "Islam" },
  { value: "Kristen", label: "Kristen" },
  { value: "Katolik", label: "Katolik" },
  { value: "Hindu", label: "Hindu" },
  { value: "Buddha", label: "Buddha" },
  { value: "Konghucu", label: "Konghucu" },
  { value: "Kepercayaan", label: "Kepercayaan" },
];

/**
 * Pilihan Pendidikan
 */
export const pendidikanOptions = [
  { value: "Tidak Sekolah", label: "Tidak Sekolah" },
  { value: "SD/Sederajat", label: "SD/Sederajat" },
  { value: "SMP/Sederajat", label: "SMP/Sederajat" },
  { value: "SMA/Sederajat", label: "SMA/Sederajat" },
  { value: "D1", label: "D1" },
  { value: "D2", label: "D2" },
  { value: "D3", label: "D3" },
  { value: "D4", label: "D4" },
  { value: "S1", label: "S1" },
  { value: "S2", label: "S2" },
  { value: "S3", label: "S3" },
];

/**
 * Pilihan Pekerjaan
 */
export const pekerjaanOptions = [
  { value: "Tidak Bekerja", label: "Tidak Bekerja" },
  { value: "Pelajar/Mahasiswa", label: "Pelajar/Mahasiswa" },
  { value: "PNS", label: "PNS" },
  { value: "TNI", label: "TNI" },
  { value: "Polri", label: "Polri" },
  { value: "Karyawan Swasta", label: "Karyawan Swasta" },
  { value: "Wiraswasta", label: "Wiraswasta" },
  { value: "Petani", label: "Petani" },
  { value: "Nelayan", label: "Nelayan" },
  { value: "Buruh", label: "Buruh" },
  { value: "Pedagang", label: "Pedagang" },
  { value: "Guru", label: "Guru" },
  { value: "Dosen", label: "Dosen" },
  { value: "Dokter", label: "Dokter" },
  { value: "Perawat", label: "Perawat" },
  { value: "Bidan", label: "Bidan" },
  { value: "Pengacara", label: "Pengacara" },
  { value: "Notaris", label: "Notaris" },
  { value: "Arsitek", label: "Arsitek" },
  { value: "Insinyur", label: "Insinyur" },
  { value: "Pilot", label: "Pilot" },
  { value: "Pramugari", label: "Pramugari" },
  { value: "Sopir", label: "Sopir" },
  { value: "Tukang", label: "Tukang" },
  { value: "Penjahit", label: "Penjahit" },
  { value: "Tukang Cukur", label: "Tukang Cukur" },
  { value: "Tukang Las", label: "Tukang Las" },
  { value: "Tukang Kayu", label: "Tukang Kayu" },
  { value: "Tukang Batu", label: "Tukang Batu" },
  { value: "Tukang Listrik", label: "Tukang Listrik" },
  { value: "Tukang AC", label: "Tukang AC" },
  { value: "Tukang Service", label: "Tukang Service" },
  { value: "Satpam", label: "Satpam" },
  { value: "Security", label: "Security" },
  { value: "Cleaning Service", label: "Cleaning Service" },
  { value: "Driver", label: "Driver" },
  { value: "Ojek Online", label: "Ojek Online" },
  { value: "Kurir", label: "Kurir" },
  { value: "Penjaga Toko", label: "Penjaga Toko" },
  { value: "Kasir", label: "Kasir" },
  { value: "Koki", label: "Koki" },
  { value: "Pelayan", label: "Pelayan" },
  { value: "Penata Rambut", label: "Penata Rambut" },
  { value: "Fotografer", label: "Fotografer" },
  { value: "Videografer", label: "Videografer" },
  { value: "Desainer", label: "Desainer" },
  { value: "Programmer", label: "Programmer" },
  { value: "Content Creator", label: "Content Creator" },
  { value: "Youtuber", label: "Youtuber" },
  { value: "Influencer", label: "Influencer" },
  { value: "Artis", label: "Artis" },
  { value: "Musisi", label: "Musisi" },
  { value: "Penulis", label: "Penulis" },
  { value: "Wartawan", label: "Wartawan" },
  { value: "Penyiar", label: "Penyiar" },
  { value: "Pensiunan", label: "Pensiunan" },
  { value: "Ibu Rumah Tangga", label: "Ibu Rumah Tangga" },
  { value: "Lainnya", label: "Lainnya" },
];

/**
 * Pilihan Status Perkawinan
 */
export const statusPerkawinanOptions = [
  { value: "Belum Kawin", label: "Belum Kawin" },
  { value: "Kawin", label: "Kawin" },
  { value: "Cerai Hidup", label: "Cerai Hidup" },
  { value: "Cerai Mati", label: "Cerai Mati" },
];

/**
 * Pilihan Golongan Darah
 */
export const golonganDarahOptions = [
  { value: "A", label: "A" },
  { value: "B", label: "B" },
  { value: "AB", label: "AB" },
  { value: "O", label: "O" },
];

/**
 * Pilihan Status Kependudukan
 * MODEL ADMINISTRATIF: Status "Aktif" hanya bisa dipilih jika penduduk sudah di KK
 * Untuk penduduk baru, gunakan "Belum Terdaftar di KK"
 */
export const statusKependudukanOptions = [
  { value: "Belum Terdaftar di KK", label: "Belum Terdaftar di KK" },
  { value: "Aktif", label: "Aktif" },
  { value: "Pindah", label: "Pindah" },
  { value: "Meninggal", label: "Meninggal" },
];

/**
 * Pilihan Hubungan dalam Keluarga
 */
export const hubunganKeluargaOptions = [
  { value: "Kepala Keluarga", label: "Kepala Keluarga" },
  { value: "Istri", label: "Istri" },
  { value: "Anak", label: "Anak" },
  { value: "Menantu", label: "Menantu" },
  { value: "Cucu", label: "Cucu" },
  { value: "Orang Tua", label: "Orang Tua" },
  { value: "Mertua", label: "Mertua" },
  { value: "Famili Lain", label: "Famili Lain" },
  { value: "Pembantu", label: "Pembantu" },
  { value: "Lainnya", label: "Lainnya" },
];

/**
 * Pilihan Jenis Surat
 */
export const jenisSuratOptions = [
  { value: "SKD", label: "SKD - Surat Keterangan Domisili" },
  { value: "KET", label: "KET - Surat Keterangan" },
  { value: "SKTM", label: "SKTM - Surat Keterangan Tidak Mampu" },
  { value: "SKU", label: "SKU - Surat Keterangan Usaha" },
  { value: "SKP", label: "SKP - Surat Keterangan Pindah" },
  { value: "SKM", label: "SKM - Surat Keterangan Meninggal" },
];

/**
 * Pilihan Status Surat
 */
export const statusSuratOptions = [
  { value: "Draft", label: "Draft" },
  { value: "Selesai", label: "Selesai" },
  { value: "Dicetak", label: "Dicetak" },
];

/**
 * Pilihan Jabatan Penandatangan
 */
export const jabatanOptions = [
  { value: "Kepala Desa", label: "Kepala Desa" },
  { value: "Sekretaris Desa", label: "Sekretaris Desa" },
  { value: "Kasi Pemerintahan", label: "Kasi Pemerintahan" },
  { value: "Kasi Kesejahteraan", label: "Kasi Kesejahteraan" },
  { value: "Kasi Pelayanan", label: "Kasi Pelayanan" },
  { value: "Kaur Keuangan", label: "Kaur Keuangan" },
  { value: "Kaur Umum", label: "Kaur Umum" },
  { value: "Kaur Perencanaan", label: "Kaur Perencanaan" },
];

/**
 * Data Provinsi Indonesia (34 Provinsi)
 */
export const provinsiOptions = [
  { value: "Aceh", label: "Aceh" },
  { value: "Sumatera Utara", label: "Sumatera Utara" },
  { value: "Sumatera Barat", label: "Sumatera Barat" },
  { value: "Riau", label: "Riau" },
  { value: "Jambi", label: "Jambi" },
  { value: "Sumatera Selatan", label: "Sumatera Selatan" },
  { value: "Bengkulu", label: "Bengkulu" },
  { value: "Lampung", label: "Lampung" },
  { value: "Kepulauan Bangka Belitung", label: "Kepulauan Bangka Belitung" },
  { value: "Kepulauan Riau", label: "Kepulauan Riau" },
  { value: "DKI Jakarta", label: "DKI Jakarta" },
  { value: "Jawa Barat", label: "Jawa Barat" },
  { value: "Jawa Tengah", label: "Jawa Tengah" },
  { value: "DI Yogyakarta", label: "DI Yogyakarta" },
  { value: "Jawa Timur", label: "Jawa Timur" },
  { value: "Banten", label: "Banten" },
  { value: "Bali", label: "Bali" },
  { value: "Nusa Tenggara Barat", label: "Nusa Tenggara Barat" },
  { value: "Nusa Tenggara Timur", label: "Nusa Tenggara Timur" },
  { value: "Kalimantan Barat", label: "Kalimantan Barat" },
  { value: "Kalimantan Tengah", label: "Kalimantan Tengah" },
  { value: "Kalimantan Selatan", label: "Kalimantan Selatan" },
  { value: "Kalimantan Timur", label: "Kalimantan Timur" },
  { value: "Kalimantan Utara", label: "Kalimantan Utara" },
  { value: "Sulawesi Utara", label: "Sulawesi Utara" },
  { value: "Sulawesi Tengah", label: "Sulawesi Tengah" },
  { value: "Sulawesi Selatan", label: "Sulawesi Selatan" },
  { value: "Sulawesi Tenggara", label: "Sulawesi Tenggara" },
  { value: "Gorontalo", label: "Gorontalo" },
  { value: "Sulawesi Barat", label: "Sulawesi Barat" },
  { value: "Maluku", label: "Maluku" },
  { value: "Maluku Utara", label: "Maluku Utara" },
  { value: "Papua Barat", label: "Papua Barat" },
  { value: "Papua", label: "Papua" },
  { value: "Papua Selatan", label: "Papua Selatan" },
  { value: "Papua Tengah", label: "Papua Tengah" },
  { value: "Papua Pegunungan", label: "Papua Pegunungan" },
];

/**
 * Data Kabupaten/Kota Populer (untuk autocomplete)
 * Note: Bisa ditambah lebih lengkap jika perlu
 */
export const kabupatenOptions = [
  // Jawa Barat
  { value: "Bandung", label: "Bandung", provinsi: "Jawa Barat" },
  { value: "Bekasi", label: "Bekasi", provinsi: "Jawa Barat" },
  { value: "Depok", label: "Depok", provinsi: "Jawa Barat" },
  { value: "Bogor", label: "Bogor", provinsi: "Jawa Barat" },
  { value: "Tangerang", label: "Tangerang", provinsi: "Jawa Barat" },
  { value: "Cimahi", label: "Cimahi", provinsi: "Jawa Barat" },
  { value: "Tasikmalaya", label: "Tasikmalaya", provinsi: "Jawa Barat" },
  { value: "Cirebon", label: "Cirebon", provinsi: "Jawa Barat" },
  { value: "Sukabumi", label: "Sukabumi", provinsi: "Jawa Barat" },
  { value: "Karawang", label: "Karawang", provinsi: "Jawa Barat" },
  // DKI Jakarta
  { value: "Jakarta Pusat", label: "Jakarta Pusat", provinsi: "DKI Jakarta" },
  { value: "Jakarta Utara", label: "Jakarta Utara", provinsi: "DKI Jakarta" },
  { value: "Jakarta Barat", label: "Jakarta Barat", provinsi: "DKI Jakarta" },
  {
    value: "Jakarta Selatan",
    label: "Jakarta Selatan",
    provinsi: "DKI Jakarta",
  },
  { value: "Jakarta Timur", label: "Jakarta Timur", provinsi: "DKI Jakarta" },
  // Jawa Tengah
  { value: "Semarang", label: "Semarang", provinsi: "Jawa Tengah" },
  { value: "Surakarta", label: "Surakarta", provinsi: "Jawa Tengah" },
  { value: "Yogyakarta", label: "Yogyakarta", provinsi: "DI Yogyakarta" },
  // Jawa Timur
  { value: "Surabaya", label: "Surabaya", provinsi: "Jawa Timur" },
  { value: "Malang", label: "Malang", provinsi: "Jawa Timur" },
  { value: "Sidoarjo", label: "Sidoarjo", provinsi: "Jawa Timur" },
  // Banten
  { value: "Serang", label: "Serang", provinsi: "Banten" },
  { value: "Tangerang", label: "Tangerang", provinsi: "Banten" },
  // Bali
  { value: "Denpasar", label: "Denpasar", provinsi: "Bali" },
  { value: "Badung", label: "Badung", provinsi: "Bali" },
  // Sumatera Utara
  { value: "Medan", label: "Medan", provinsi: "Sumatera Utara" },
  // Sumatera Barat
  { value: "Padang", label: "Padang", provinsi: "Sumatera Barat" },
  // Riau
  { value: "Pekanbaru", label: "Pekanbaru", provinsi: "Riau" },
  // Sumatera Selatan
  { value: "Palembang", label: "Palembang", provinsi: "Sumatera Selatan" },
  // Kalimantan Timur
  { value: "Samarinda", label: "Samarinda", provinsi: "Kalimantan Timur" },
  { value: "Balikpapan", label: "Balikpapan", provinsi: "Kalimantan Timur" },
  // Sulawesi Selatan
  { value: "Makassar", label: "Makassar", provinsi: "Sulawesi Selatan" },
  // Sulawesi Utara
  { value: "Manado", label: "Manado", provinsi: "Sulawesi Utara" },
];

/**
 * Helper function untuk get kabupaten berdasarkan provinsi
 */
export const getKabupatenByProvinsi = (provinsi) => {
  if (!provinsi) return kabupatenOptions;
  return kabupatenOptions.filter((kab) => kab.provinsi === provinsi);
};

/**
 * Helper function untuk create autocomplete options
 * Bisa pilih dari list atau ketik sendiri
 */
export const createAutocompleteOptions = (options, allowCustom = true) => {
  return {
    options: options.map((opt) => ({
      value: opt.value || opt,
      label: opt.label || opt,
    })),
    allowCustom,
  };
};

export default {
  jenisKelaminOptions,
  agamaOptions,
  pendidikanOptions,
  pekerjaanOptions,
  statusPerkawinanOptions,
  golonganDarahOptions,
  statusKependudukanOptions,
  hubunganKeluargaOptions,
  jenisSuratOptions,
  statusSuratOptions,
  jabatanOptions,
  provinsiOptions,
  kabupatenOptions,
  getKabupatenByProvinsi,
  createAutocompleteOptions,
};
