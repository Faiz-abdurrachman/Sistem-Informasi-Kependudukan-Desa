// ============================================
// FILE: KKPreview.jsx
// ============================================
// 
// DESKRIPSI:
// Component untuk preview dan print Kartu Keluarga lengkap
// dengan semua anggota keluarga
//
// ALASAN DESAIN:
// - User butuh print KK dengan semua anggota
// - Format resmi KK sesuai standar administrasi
// - Bisa print langsung atau download PDF
//
// SYNTAX:
// <KKPreview kk={kkData} onClose={() => {}} />
//
// ============================================

import { exportKKToPDF } from '../utils/exportPDF.js';

const KKPreview = ({ kk, onClose }) => {
  if (!kk) return null;

  /**
   * Format tanggal ke format Indonesia
   */
  const formatTanggal = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  /**
   * Handle print KK
   */
  const handlePrint = () => {
    window.print();
  };

  /**
   * Handle download KK sebagai PDF
   */
  const handleDownloadPDF = () => {
    try {
      exportKKToPDF(kk);
    } catch (error) {
      console.error('Download PDF error:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-auto">
        {/* Header Modal */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Preview Kartu Keluarga</h2>
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

        {/* Content KK - Template Resmi */}
        <div className="p-8 print:p-4" id="kk-content">
          {/* Kop Surat */}
          <div className="text-center mb-6">
            <div className="text-lg font-bold">PEMERINTAH DESA</div>
            <div className="text-base font-bold mt-1">KARTU KELUARGA</div>
            <div className="text-sm text-gray-600 mt-1">
              {kk.desa || 'Desa'}, {kk.kecamatan || 'Kecamatan'}, {kk.kabupaten || 'Kabupaten'}, {kk.provinsi || 'Provinsi'}
            </div>
            <div className="border-t border-gray-400 mt-2 pt-2"></div>
          </div>

          {/* Info KK */}
          <div className="mb-6 space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong>Nomor Kartu Keluarga:</strong> {kk.nomorKK}
              </div>
              <div>
                <strong>Alamat:</strong> {kk.alamat}
              </div>
              <div>
                <strong>RT/RW:</strong> {kk.rt || '-'}/{kk.rw || '-'}
              </div>
              <div>
                <strong>Kode Pos:</strong> {kk.kodePos || '-'}
              </div>
            </div>
          </div>

          {/* Kepala Keluarga */}
          <div className="mb-6">
            <h3 className="font-bold text-base mb-3 border-b border-gray-300 pb-2">
              KEPALA KELUARGA
            </h3>
            {kk.kepalaKeluarga && (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>NIK:</strong> {kk.kepalaKeluarga.nik}</div>
                <div><strong>Nama:</strong> {kk.kepalaKeluarga.nama}</div>
                <div><strong>Tempat/Tanggal Lahir:</strong> {kk.kepalaKeluarga.tempatLahir}, {formatTanggal(kk.kepalaKeluarga.tanggalLahir)}</div>
                <div><strong>Jenis Kelamin:</strong> {kk.kepalaKeluarga.jenisKelamin}</div>
                <div><strong>Agama:</strong> {kk.kepalaKeluarga.agama || '-'}</div>
                <div><strong>Pendidikan:</strong> {kk.kepalaKeluarga.pendidikan || '-'}</div>
                <div><strong>Pekerjaan:</strong> {kk.kepalaKeluarga.pekerjaan || '-'}</div>
                <div><strong>Status Perkawinan:</strong> {kk.kepalaKeluarga.statusPerkawinan || '-'}</div>
              </div>
            )}
          </div>

          {/* Anggota Keluarga */}
          {kk.anggotaKeluarga && kk.anggotaKeluarga.length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold text-base mb-3 border-b border-gray-300 pb-2">
                ANGGOTA KELUARGA ({kk.anggotaKeluarga.length} orang)
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300 text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border border-gray-300 px-3 py-2 text-left">No</th>
                      <th className="border border-gray-300 px-3 py-2 text-left">NIK</th>
                      <th className="border border-gray-300 px-3 py-2 text-left">Nama</th>
                      <th className="border border-gray-300 px-3 py-2 text-left">Hubungan</th>
                      <th className="border border-gray-300 px-3 py-2 text-left">Jenis Kelamin</th>
                      <th className="border border-gray-300 px-3 py-2 text-left">Tempat/Tgl Lahir</th>
                      <th className="border border-gray-300 px-3 py-2 text-left">Agama</th>
                      <th className="border border-gray-300 px-3 py-2 text-left">Pendidikan</th>
                      <th className="border border-gray-300 px-3 py-2 text-left">Pekerjaan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kk.anggotaKeluarga.map((anggota, index) => (
                      <tr key={anggota.id}>
                        <td className="border border-gray-300 px-3 py-2">{index + 1}</td>
                        <td className="border border-gray-300 px-3 py-2 font-mono">{anggota.penduduk?.nik}</td>
                        <td className="border border-gray-300 px-3 py-2">{anggota.penduduk?.nama}</td>
                        <td className="border border-gray-300 px-3 py-2">{anggota.hubungan}</td>
                        <td className="border border-gray-300 px-3 py-2">{anggota.penduduk?.jenisKelamin}</td>
                        <td className="border border-gray-300 px-3 py-2">
                          {anggota.penduduk?.tempatLahir}, {formatTanggal(anggota.penduduk?.tanggalLahir)}
                        </td>
                        <td className="border border-gray-300 px-3 py-2">{anggota.penduduk?.agama || '-'}</td>
                        <td className="border border-gray-300 px-3 py-2">{anggota.penduduk?.pendidikan || '-'}</td>
                        <td className="border border-gray-300 px-3 py-2">{anggota.penduduk?.pekerjaan || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 text-sm text-gray-600">
            <p>Dicetak pada: {new Date().toLocaleString('id-ID')}</p>
          </div>
        </div>

        {/* Print Styles */}
        <style>{`
          @media print {
            body * {
              visibility: hidden;
            }
            #kk-content,
            #kk-content * {
              visibility: visible;
            }
            #kk-content {
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
    </div>
  );
};

export default KKPreview;

