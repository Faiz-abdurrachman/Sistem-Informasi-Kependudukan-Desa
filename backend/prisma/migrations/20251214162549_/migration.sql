-- AlterTable
ALTER TABLE `penduduk` ADD COLUMN `nomorKK` VARCHAR(16) NULL;

-- CreateIndex
CREATE INDEX `penduduk_nomorKK_idx` ON `penduduk`(`nomorKK`);
