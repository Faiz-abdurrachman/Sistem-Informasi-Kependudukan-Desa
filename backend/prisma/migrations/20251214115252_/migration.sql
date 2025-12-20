-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(50) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `role` ENUM('ADMIN', 'OPERATOR', 'PUBLIK') NOT NULL DEFAULT 'PUBLIK',
    `nama` VARCHAR(100) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_username_key`(`username`),
    UNIQUE INDEX `users_email_key`(`email`),
    INDEX `users_username_idx`(`username`),
    INDEX `users_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `penduduk` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nik` VARCHAR(16) NOT NULL,
    `nama` VARCHAR(100) NOT NULL,
    `tempatLahir` VARCHAR(50) NOT NULL,
    `tanggalLahir` DATE NOT NULL,
    `jenisKelamin` VARCHAR(10) NOT NULL,
    `agama` VARCHAR(50) NOT NULL,
    `pendidikan` VARCHAR(50) NOT NULL,
    `pekerjaan` VARCHAR(100) NOT NULL,
    `statusPerkawinan` VARCHAR(20) NOT NULL,
    `kewarganegaraan` VARCHAR(10) NOT NULL DEFAULT 'WNI',
    `alamat` TEXT NOT NULL,
    `rt` VARCHAR(3) NOT NULL,
    `rw` VARCHAR(3) NOT NULL,
    `desa` VARCHAR(100) NOT NULL,
    `kecamatan` VARCHAR(100) NOT NULL,
    `kabupaten` VARCHAR(100) NOT NULL,
    `provinsi` VARCHAR(100) NOT NULL,
    `golonganDarah` VARCHAR(2) NULL,
    `statusKependudukan` VARCHAR(20) NOT NULL DEFAULT 'Aktif',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `penduduk_nik_key`(`nik`),
    INDEX `penduduk_nik_idx`(`nik`),
    INDEX `penduduk_nama_idx`(`nama`),
    INDEX `penduduk_statusKependudukan_idx`(`statusKependudukan`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kartu_keluarga` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nomorKK` VARCHAR(16) NOT NULL,
    `kepalaKeluargaId` INTEGER NOT NULL,
    `alamat` TEXT NOT NULL,
    `rt` VARCHAR(3) NOT NULL,
    `rw` VARCHAR(3) NOT NULL,
    `desa` VARCHAR(100) NOT NULL,
    `kecamatan` VARCHAR(100) NOT NULL,
    `kabupaten` VARCHAR(100) NOT NULL,
    `provinsi` VARCHAR(100) NOT NULL,
    `kodePos` VARCHAR(10) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `kartu_keluarga_nomorKK_key`(`nomorKK`),
    INDEX `kartu_keluarga_nomorKK_idx`(`nomorKK`),
    INDEX `kartu_keluarga_kepalaKeluargaId_idx`(`kepalaKeluargaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `anggota_keluarga` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `kartuKeluargaId` INTEGER NOT NULL,
    `pendudukId` INTEGER NOT NULL,
    `hubungan` VARCHAR(50) NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'Aktif',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `anggota_keluarga_kartuKeluargaId_idx`(`kartuKeluargaId`),
    INDEX `anggota_keluarga_pendudukId_idx`(`pendudukId`),
    UNIQUE INDEX `anggota_keluarga_kartuKeluargaId_pendudukId_key`(`kartuKeluargaId`, `pendudukId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `surat` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nomorSurat` VARCHAR(50) NOT NULL,
    `jenisSurat` VARCHAR(50) NOT NULL,
    `pendudukId` INTEGER NULL,
    `userId` INTEGER NOT NULL,
    `keterangan` TEXT NULL,
    `penandatangan` VARCHAR(100) NOT NULL,
    `jabatan` VARCHAR(100) NOT NULL,
    `tanggalSurat` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `filePath` VARCHAR(255) NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'Draft',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `surat_nomorSurat_key`(`nomorSurat`),
    INDEX `surat_nomorSurat_idx`(`nomorSurat`),
    INDEX `surat_jenisSurat_idx`(`jenisSurat`),
    INDEX `surat_pendudukId_idx`(`pendudukId`),
    INDEX `surat_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `statistik` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `jenis` VARCHAR(50) NOT NULL,
    `nilai` INTEGER NOT NULL DEFAULT 0,
    `keterangan` TEXT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `statistik_jenis_key`(`jenis`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `kartu_keluarga` ADD CONSTRAINT `kartu_keluarga_kepalaKeluargaId_fkey` FOREIGN KEY (`kepalaKeluargaId`) REFERENCES `penduduk`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `anggota_keluarga` ADD CONSTRAINT `anggota_keluarga_kartuKeluargaId_fkey` FOREIGN KEY (`kartuKeluargaId`) REFERENCES `kartu_keluarga`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `anggota_keluarga` ADD CONSTRAINT `anggota_keluarga_pendudukId_fkey` FOREIGN KEY (`pendudukId`) REFERENCES `penduduk`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `surat` ADD CONSTRAINT `surat_pendudukId_fkey` FOREIGN KEY (`pendudukId`) REFERENCES `penduduk`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `surat` ADD CONSTRAINT `surat_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
