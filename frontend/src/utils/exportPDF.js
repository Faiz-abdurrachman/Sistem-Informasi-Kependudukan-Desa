// ============================================
// FILE: exportPDF.js
// ============================================
// 
// DESKRIPSI:
// Utility untuk export data ke PDF menggunakan library jsPDF
// 
// ALASAN PAKAI jsPDF:
// - Library populer untuk generate PDF di JavaScript
// - Support text, images, tables, styling
// - Tidak perlu backend, pure frontend
// - Ringan dan cepat
// - Bisa custom layout sesuai kebutuhan
//
// CARA KERJA:
// 1. Buat instance jsPDF (document PDF)
// 2. Tambah konten (text, table, dll)
// 3. Download sebagai file .pdf
//
// SYNTAX:
// import { exportToPDF } from './utils/exportPDF.js';
// exportToPDF(title, content, filename);
//
// ============================================

import jsPDF from 'jspdf';

/**
 * Export laporan statistik ke PDF
 * 
 * @param {Object} statistik - Data statistik
 * @param {string} filename - Nama file (tanpa extension)
 * 
 * ALASAN DESAIN:
 * - Header dengan kop surat desa (profesional)
 * - Layout rapi dengan margin yang tepat
 * - Font yang readable
 * - Table untuk data statistik
 * 
 * SYNTAX:
 * exportStatistikToPDF(statistikData, 'Laporan Statistik');
 */
export const exportStatistikToPDF = (statistik, filename = 'Laporan Statistik') => {
  try {
    // Buat instance jsPDF
    // Parameter: orientation ('portrait' atau 'landscape'), unit ('mm', 'pt', dll), format ('a4', 'letter', dll)
    const doc = new jsPDF('portrait', 'mm', 'a4');

    // Set font
    doc.setFont('helvetica');

    // Header dengan kop surat
    // ALASAN: Supaya terlihat resmi dan profesional
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('PEMERINTAH DESA', 105, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.text('SISTEM INFORMASI KEPENDUDUKAN DESA', 105, 28, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Jl. Raya Desa No. 123, Telp: (021) 123456', 105, 34, { align: 'center' });
    
    // Garis pemisah
    doc.setLineWidth(0.5);
    doc.line(20, 40, 190, 40);

    // Judul laporan
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('LAPORAN STATISTIK KEPENDUDUKAN', 105, 50, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const date = new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    doc.text(`Tanggal: ${date}`, 105, 56, { align: 'center' });

    // Spacing
    let yPosition = 70;

    // Statistik Umum
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('STATISTIK UMUM', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Penduduk: ${(statistik.totalPenduduk || 0).toLocaleString('id-ID')}`, 25, yPosition);
    yPosition += 7;
    doc.text(`Total Kartu Keluarga: ${(statistik.totalKK || 0).toLocaleString('id-ID')}`, 25, yPosition);
    yPosition += 7;
    doc.text(`Total Surat: ${(statistik.totalSurat || 0).toLocaleString('id-ID')}`, 25, yPosition);
    yPosition += 7;
    doc.text(`Penduduk Aktif: ${(statistik.statusKependudukan?.aktif || 0).toLocaleString('id-ID')}`, 25, yPosition);
    yPosition += 15;

    // Jenis Kelamin
    if (statistik.jenisKelamin) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('JENIS KELAMIN', 20, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Laki-laki: ${(statistik.jenisKelamin.lakiLaki || 0).toLocaleString('id-ID')}`, 25, yPosition);
      yPosition += 7;
      doc.text(`Perempuan: ${(statistik.jenisKelamin.perempuan || 0).toLocaleString('id-ID')}`, 25, yPosition);
      yPosition += 15;
    }

    // Status Kependudukan
    if (statistik.statusKependudukan) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('STATUS KEPENDUDUKAN', 20, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Aktif: ${(statistik.statusKependudukan.aktif || 0).toLocaleString('id-ID')}`, 25, yPosition);
      yPosition += 7;
      doc.text(`Meninggal: ${(statistik.statusKependudukan.meninggal || 0).toLocaleString('id-ID')}`, 25, yPosition);
      yPosition += 7;
      doc.text(`Pindah: ${(statistik.statusKependudukan.pindah || 0).toLocaleString('id-ID')}`, 25, yPosition);
      yPosition += 15;
    }

    // Footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 105, pageHeight - 20, { align: 'center' });
    doc.text('Sistem Informasi Kependudukan Desa', 105, pageHeight - 15, { align: 'center' });

    // Download file
    // ALASAN: save() method untuk download file PDF
    doc.save(`${filename}.pdf`);

    return true;
  } catch (error) {
    console.error('Export PDF error:', error);
    throw new Error('Gagal export data ke PDF: ' + error.message);
  }
};

/**
 * Export surat ke PDF dengan template resmi
 * 
 * @param {Object} surat - Data surat
 * @param {string} filename - Nama file (tanpa extension)
 * 
 * SYNTAX:
 * exportSuratToPDF(suratData, 'Surat Keterangan Domisili');
 */
export const exportSuratToPDF = (surat, filename = null) => {
  try {
    const doc = new jsPDF('portrait', 'mm', 'a4');
    const filenameFinal = filename || surat.nomorSurat;

    // Kop surat
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('PEMERINTAH DESA', 105, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.text('SISTEM INFORMASI KEPENDUDUKAN DESA', 105, 28, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Jl. Raya Desa No. 123, Telp: (021) 123456', 105, 34, { align: 'center' });
    
    doc.setLineWidth(0.5);
    doc.line(20, 40, 190, 40);

    // Nomor surat
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Nomor: ${surat.nomorSurat}`, 150, 50, { align: 'right' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const tanggalSurat = new Date(surat.tanggalSurat).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    doc.text(`Tanggal: ${tanggalSurat}`, 150, 56, { align: 'right' });

    // Judul surat
    let yPos = 70;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(surat.jenisSurat, 105, yPos, { align: 'center' });
    yPos += 15;

    // Isi surat
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    if (surat.penduduk) {
      doc.text(`Yang bertanda tangan di bawah ini, ${surat.penandatangan}, ${surat.jabatan},`, 20, yPos);
      yPos += 7;
      doc.text(`menerangkan bahwa:`, 20, yPos);
      yPos += 10;
      doc.text(`Nama: ${surat.penduduk.nama}`, 25, yPos);
      yPos += 7;
      doc.text(`NIK: ${surat.penduduk.nik}`, 25, yPos);
      yPos += 7;
      doc.text(`Alamat: ${surat.penduduk.alamat}`, 25, yPos);
      yPos += 10;
    }

    if (surat.keterangan) {
      doc.text(surat.keterangan, 20, yPos, { maxWidth: 170 });
      yPos += 20;
    }

    // Tanda tangan
    const pageHeight = doc.internal.pageSize.height;
    doc.text('Demikian surat keterangan ini dibuat untuk dapat dipergunakan sebagaimana mestinya.', 20, pageHeight - 60);
    
    doc.text('Desa, ' + new Date(surat.tanggalSurat).toLocaleDateString('id-ID'), 150, pageHeight - 40);
    doc.text(surat.jabatan, 105, pageHeight - 30, { align: 'center' });
    doc.text('', 105, pageHeight - 20, { align: 'center' });
    doc.text('', 105, pageHeight - 15, { align: 'center' });
    doc.text(surat.penandatangan, 105, pageHeight - 10, { align: 'center' });
    doc.setFont('helvetica', 'bold');

    doc.save(`${filenameFinal}.pdf`);
    return true;
  } catch (error) {
    console.error('Export Surat PDF error:', error);
    throw new Error('Gagal export surat ke PDF: ' + error.message);
  }
};

/**
 * Export Kartu Keluarga ke PDF dengan semua anggota
 * 
 * @param {Object} kk - Data Kartu Keluarga lengkap dengan anggota
 * @param {string} filename - Nama file (tanpa extension)
 * 
 * SYNTAX:
 * exportKKToPDF(kkData, 'Kartu Keluarga 1234567890123456');
 */
export const exportKKToPDF = (kk, filename = null) => {
  try {
    const doc = new jsPDF('portrait', 'mm', 'a4');
    const filenameFinal = filename || `KK-${kk.nomorKK}`;

    // Kop surat
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('PEMERINTAH DESA', 105, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.text('KARTU KELUARGA', 105, 28, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`${kk.desa || 'Desa'}, ${kk.kecamatan || 'Kecamatan'}, ${kk.kabupaten || 'Kabupaten'}, ${kk.provinsi || 'Provinsi'}`, 105, 34, { align: 'center' });
    
    doc.setLineWidth(0.5);
    doc.line(20, 40, 190, 40);

    let yPos = 50;

    // Info KK
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Nomor Kartu Keluarga:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(kk.nomorKK, 70, yPos);
    
    yPos += 7;
    doc.setFont('helvetica', 'bold');
    doc.text('Alamat:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(kk.alamat, 70, yPos, { maxWidth: 120 });
    
    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('RT/RW:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(`${kk.rt || '-'}/${kk.rw || '-'}`, 70, yPos);

    yPos += 15;

    // Kepala Keluarga
    if (kk.kepalaKeluarga) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('KEPALA KELUARGA', 20, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`NIK: ${kk.kepalaKeluarga.nik}`, 25, yPos);
      yPos += 6;
      doc.text(`Nama: ${kk.kepalaKeluarga.nama}`, 25, yPos);
      yPos += 6;
      doc.text(`Tempat/Tanggal Lahir: ${kk.kepalaKeluarga.tempatLahir}, ${new Date(kk.kepalaKeluarga.tanggalLahir).toLocaleDateString('id-ID')}`, 25, yPos);
      yPos += 6;
      doc.text(`Jenis Kelamin: ${kk.kepalaKeluarga.jenisKelamin}`, 25, yPos);
      yPos += 6;
      doc.text(`Agama: ${kk.kepalaKeluarga.agama || '-'}`, 25, yPos);
      yPos += 6;
      doc.text(`Pendidikan: ${kk.kepalaKeluarga.pendidikan || '-'}`, 25, yPos);
      yPos += 6;
      doc.text(`Pekerjaan: ${kk.kepalaKeluarga.pekerjaan || '-'}`, 25, yPos);
      yPos += 10;
    }

    // Anggota Keluarga
    if (kk.anggotaKeluarga && kk.anggotaKeluarga.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`ANGGOTA KELUARGA (${kk.anggotaKeluarga.length} orang)`, 20, yPos);
      yPos += 8;

      // Table header
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('No', 25, yPos);
      doc.text('NIK', 35, yPos);
      doc.text('Nama', 70, yPos);
      doc.text('Hubungan', 120, yPos);
      doc.text('JK', 150, yPos);
      yPos += 6;
      doc.line(20, yPos, 190, yPos);
      yPos += 4;

      // Table rows
      doc.setFont('helvetica', 'normal');
      kk.anggotaKeluarga.forEach((anggota, index) => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        doc.text((index + 1).toString(), 25, yPos);
        doc.text(anggota.penduduk?.nik || '-', 35, yPos);
        doc.text(anggota.penduduk?.nama || '-', 70, yPos, { maxWidth: 45 });
        doc.text(anggota.hubungan || '-', 120, yPos, { maxWidth: 25 });
        doc.text(anggota.penduduk?.jenisKelamin || '-', 150, yPos);
        yPos += 6;
      });
    }

    // Footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 105, pageHeight - 10, { align: 'center' });

    doc.save(`${filenameFinal}.pdf`);
    return true;
  } catch (error) {
    console.error('Export KK PDF error:', error);
    throw new Error('Gagal export KK ke PDF: ' + error.message);
  }
};

export default {
  exportStatistikToPDF,
  exportSuratToPDF,
  exportKKToPDF,
};

