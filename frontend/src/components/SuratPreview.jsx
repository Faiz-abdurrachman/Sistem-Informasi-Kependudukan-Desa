// ============================================
// FILE: SuratPreview.jsx
// ============================================
// 
// DESKRIPSI:
// Component untuk preview surat sebelum print
// Template surat resmi dengan kop surat desa
//
// ALASAN DESAIN:
// - User perlu lihat surat sebelum print
// - Template harus profesional dan sesuai standar administrasi
// - Bisa print langsung dari browser
// - Bisa download sebagai PDF
//
// SYNTAX:
// <SuratPreview surat={suratData} onClose={() => {}} />
//
// ============================================

import { useState, useEffect } from 'react';
import { exportSuratToPDF } from '../utils/exportPDF.js';
import { generateSuratQRCode } from '../utils/qrCodeGenerator.js';

const SuratPreview = ({ surat, onClose }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  
  if (!surat) return null;

  /**
   * Generate QR Code saat component mount
   * ALASAN: QR code untuk verifikasi surat
   */
  useEffect(() => {
    const loadQRCode = async () => {
      try {
        const qrUrl = await generateSuratQRCode(surat);
        setQrCodeUrl(qrUrl);
      } catch (error) {
        console.error('QR Code generation error:', error);
      }
    };
    loadQRCode();
  }, [surat]);

  /**
   * Format tanggal ke format Indonesia
   * ALASAN: Format tanggal Indonesia lebih familiar untuk user
   */
  const formatTanggal = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  /**
   * Handle print surat
   * ALASAN: User bisa print langsung dari browser tanpa download
   */
  const handlePrint = () => {
    window.print();
  };

  /**
   * Handle download surat sebagai PDF
   * ALASAN: User bisa simpan surat sebagai file PDF
   */
  const handleDownloadPDF = () => {
    try {
      exportSuratToPDF(surat, surat.nomorSurat);
    } catch (error) {
      console.error('Download PDF error:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        {/* Header Modal */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Preview Surat</h2>
          <div className="flex space-x-2">
            <button
              onClick={handleDownloadPDF}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Download PDF
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              Print
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
            >
              Tutup
            </button>
          </div>
        </div>

        {/* Content Surat - Template Resmi */}
        <div className="p-8 print:p-4" id="surat-content">
          {/* Kop Surat */}
          <div className="text-center mb-6">
            <div className="text-lg font-bold">PEMERINTAH DESA</div>
            <div className="text-base font-bold mt-1">SISTEM INFORMASI KEPENDUDUKAN DESA</div>
            <div className="text-sm text-gray-600 mt-1">
              Jl. Raya Desa No. 123, Telp: (021) 123456
            </div>
            <div className="border-t border-gray-400 mt-2 pt-2"></div>
          </div>

          {/* Nomor & Tanggal Surat */}
          <div className="text-right mb-6">
            <div className="text-sm font-semibold">Nomor: {surat.nomorSurat}</div>
            <div className="text-sm">
              Tanggal: {formatTanggal(surat.tanggalSurat)}
            </div>
          </div>

          {/* Judul Surat */}
          <div className="text-center mb-6">
            <div className="text-base font-bold uppercase">
              {surat.jenisSurat === 'SKD' && 'SURAT KETERANGAN DOMISILI'}
              {surat.jenisSurat === 'KET' && 'SURAT KETERANGAN'}
              {surat.jenisSurat === 'SKTM' && 'SURAT KETERANGAN TIDAK MAMPU'}
              {surat.jenisSurat === 'SKU' && 'SURAT KETERANGAN USAHA'}
              {surat.jenisSurat === 'SKP' && 'SURAT KETERANGAN PINDAH'}
              {surat.jenisSurat === 'SKM' && 'SURAT KETERANGAN MENINGGAL'}
            </div>
          </div>

          {/* Isi Surat */}
          <div className="text-justify mb-6 space-y-4">
            <p className="text-sm leading-relaxed">
              Yang bertanda tangan di bawah ini, <strong>{surat.penandatangan}</strong>,{' '}
              <strong>{surat.jabatan}</strong>, menerangkan bahwa:
            </p>

            {surat.penduduk && (
              <div className="ml-6 space-y-2 text-sm">
                <p>
                  <strong>Nama:</strong> {surat.penduduk.nama}
                </p>
                <p>
                  <strong>NIK:</strong> {surat.penduduk.nik}
                </p>
                <p>
                  <strong>Tempat/Tanggal Lahir:</strong> {surat.penduduk.tempatLahir},{' '}
                  {surat.penduduk.tanggalLahir
                    ? new Date(surat.penduduk.tanggalLahir).toLocaleDateString('id-ID')
                    : '-'}
                </p>
                <p>
                  <strong>Jenis Kelamin:</strong> {surat.penduduk.jenisKelamin}
                </p>
                <p>
                  <strong>Alamat:</strong> {surat.penduduk.alamat}
                </p>
                <p>
                  <strong>RT/RW:</strong> {surat.penduduk.rt || '-'}/{surat.penduduk.rw || '-'}
                </p>
                <p>
                  <strong>Desa/Kelurahan:</strong> {surat.penduduk.desa || '-'}
                </p>
                <p>
                  <strong>Kecamatan:</strong> {surat.penduduk.kecamatan || '-'}
                </p>
                <p>
                  <strong>Kabupaten/Kota:</strong> {surat.penduduk.kabupaten || '-'}
                </p>
                <p>
                  <strong>Provinsi:</strong> {surat.penduduk.provinsi || '-'}
                </p>
              </div>
            )}

            {surat.keterangan && (
              <p className="text-sm leading-relaxed mt-4">
                {surat.keterangan}
              </p>
            )}

            <p className="text-sm leading-relaxed mt-6">
              Demikian surat keterangan ini dibuat dengan sebenarnya untuk dapat dipergunakan
              sebagaimana mestinya.
            </p>
          </div>

          {/* QR Code & Tanda Tangan */}
          <div className="mt-12 flex justify-between items-end">
            {/* QR Code untuk Verifikasi */}
            {qrCodeUrl && (
              <div className="text-center">
                <div className="text-xs text-gray-600 mb-2">Scan untuk Verifikasi</div>
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code" 
                  className="w-24 h-24 border border-gray-300"
                />
              </div>
            )}
            
            {/* Tanda Tangan */}
            <div className="text-center w-64">
              <div className="text-sm mb-16">
                {surat.desa || 'Desa'}, {formatTanggal(surat.tanggalSurat)}
              </div>
              <div className="text-sm font-semibold mb-2">{surat.jabatan}</div>
              <div className="mb-16"></div>
              <div className="text-sm font-semibold border-t border-gray-400 pt-2 inline-block px-8">
                {surat.penandatangan}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles - Hanya muncul saat print */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #surat-content,
          #surat-content * {
            visibility: visible;
          }
          #surat-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          button {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default SuratPreview;

