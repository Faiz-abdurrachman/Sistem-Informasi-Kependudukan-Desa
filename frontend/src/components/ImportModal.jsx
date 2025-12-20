// ============================================
// FILE: ImportModal.jsx
// ============================================
// 
// DESKRIPSI:
// Component modal untuk import data dari file Excel/CSV
// Support import untuk Penduduk, Kartu Keluarga, dan Surat
//
// ALASAN DESAIN:
// - User butuh import data dalam jumlah besar
// - Support format Excel (.xlsx) dan CSV (.csv)
// - Validasi dan error reporting
// - Progress indicator
//
// SYNTAX:
// <ImportModal 
//   type="penduduk" | "kk" | "surat"
//   isOpen={true}
//   onClose={() => {}}
//   onSuccess={() => {}}
// />
//
// ============================================

import { useState } from 'react';
import api from '../api/axiosInstance.js';
import toast from 'react-hot-toast';

const ImportModal = ({ type, isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [importResult, setImportResult] = useState(null);

  /**
   * Handle file selection
   * ALASAN: Validasi file sebelum upload
   */
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Validasi file extension
    const validExtensions = ['.csv', '.xlsx', '.xls'];
    const fileExtension = selectedFile.name
      .substring(selectedFile.name.lastIndexOf('.'))
      .toLowerCase();

    if (!validExtensions.includes(fileExtension)) {
      toast.error('Format file tidak valid. Gunakan CSV atau Excel (.xlsx, .xls)');
      return;
    }

    // Validasi file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file terlalu besar. Maksimal 5MB');
      return;
    }

    setFile(selectedFile);
    setImportResult(null);
  };

  /**
   * Handle import
   * ALASAN: Upload file dan import ke database
   */
  const handleImport = async () => {
    if (!file) {
      toast.error('Pilih file terlebih dahulu');
      return;
    }

    try {
      setLoading(true);
      setImportResult(null);

      // Buat FormData untuk upload file
      const formData = new FormData();
      formData.append('file', file);

      // Endpoint sesuai type
      const endpoint = `/api/import/${type}`;

      // Upload dan import
      const response = await api.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        const result = response.data.data;
        setImportResult(result);
        
        if (result.imported > 0) {
          toast.success(
            `Import berhasil! ${result.imported} data berhasil diimport. ${result.failed} data gagal.`
          );
          if (onSuccess) {
            onSuccess();
          }
        } else {
          toast.error(`Import gagal. ${result.failed} data gagal.`);
        }
      } else {
        toast.error(response.data.message || 'Import gagal');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Terjadi kesalahan saat import');
      console.error('Import error:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Download template file
   * ALASAN: User butuh template untuk format data yang benar
   */
  const handleDownloadTemplate = () => {
    // Template akan dibuat sebagai file CSV sederhana
    const headers = getTemplateHeaders(type);
    const csvContent = headers.join(',') + '\n';
    
    // Buat blob dan download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `template_${type}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Template berhasil di-download');
  };

  /**
   * Get template headers berdasarkan type
   */
  const getTemplateHeaders = (type) => {
    switch (type) {
      case 'penduduk':
        return [
          'nik',
          'nama',
          'tempatLahir',
          'tanggalLahir',
          'jenisKelamin',
          'agama',
          'pendidikan',
          'pekerjaan',
          'statusPerkawinan',
          'alamat',
          'rt',
          'rw',
          'desa',
          'kecamatan',
          'kabupaten',
          'provinsi',
          'golonganDarah',
          'statusKependudukan',
          'nomorKK',
          'hubungan',
        ];
      case 'kk':
        return [
          'nomorKK',
          'kepalaKeluargaNIK',
          'alamat',
          'rt',
          'rw',
          'desa',
          'kecamatan',
          'kabupaten',
          'provinsi',
          'kodePos',
        ];
      case 'surat':
        return [
          'jenisSurat',
          'pendudukNIK',
          'keterangan',
          'penandatangan',
          'jabatan',
          'tanggalSurat',
        ];
      default:
        return [];
    }
  };

  /**
   * Get type label
   */
  const getTypeLabel = (type) => {
    switch (type) {
      case 'penduduk':
        return 'Penduduk';
      case 'kk':
        return 'Kartu Keluarga';
      case 'surat':
        return 'Surat';
      default:
        return '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            Import Data {getTypeLabel(type)}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Cara Import:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
            <li>Download template CSV untuk format yang benar</li>
            <li>Isi data sesuai template (format Excel/CSV)</li>
            {type === 'penduduk' && (
              <li className="font-semibold text-blue-900">
                💡 Tips: Tambahkan kolom nomorKK dan hubungan untuk auto-add ke KK!
              </li>
            )}
            <li>Upload file yang sudah diisi</li>
            <li>Sistem akan validasi dan import data</li>
            {type === 'penduduk' && (
              <li className="font-semibold text-blue-900">
                ✅ Penduduk akan otomatis ditambahkan ke KK jika nomorKK diisi
              </li>
            )}
          </ol>
          </div>

          {/* Download Template */}
          <div>
            <button
              onClick={handleDownloadTemplate}
              className="btn btn-secondary w-full"
            >
              Download Template CSV
            </button>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pilih File (CSV atau Excel)
            </label>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              disabled={loading}
            />
            {file && (
              <p className="mt-2 text-sm text-gray-600">
                File terpilih: <strong>{file.name}</strong> (
                {(file.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>

          {/* Import Result */}
          {importResult && (
            <div
              className={`border rounded-lg p-4 ${
                importResult.imported > 0
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <h3 className="font-semibold mb-2">
                Hasil Import:
              </h3>
              <div className="space-y-1 text-sm">
                <p>
                  <strong>Berhasil:</strong> {importResult.imported} data
                </p>
                {importResult.kkAdded > 0 && (
                  <p className="text-green-700 font-semibold">
                    <strong>Auto-Add ke KK:</strong> {importResult.kkAdded} penduduk otomatis ditambahkan ke Kartu Keluarga
                  </p>
                )}
                <p>
                  <strong>Gagal:</strong> {importResult.failed} data
                </p>
              </div>

              {/* Error List */}
              {importResult.errors && importResult.errors.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold text-sm mb-2">Error Detail:</h4>
                  <div className="max-h-40 overflow-y-auto space-y-1 text-xs">
                    {importResult.errors.slice(0, 10).map((error, index) => (
                      <div key={index} className="bg-white p-2 rounded border">
                        <p>
                          <strong>Baris {error.row || 'N/A'}:</strong>{' '}
                          {error.error || error.errors?.join(', ')}
                        </p>
                        {error.nik && <p>NIK: {error.nik}</p>}
                        {error.nama && <p>Nama: {error.nama}</p>}
                      </div>
                    ))}
                    {importResult.errors.length > 10 && (
                      <p className="text-gray-500 italic">
                        ... dan {importResult.errors.length - 10} error lainnya
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              Tutup
            </button>
            <button
              onClick={handleImport}
              className="btn btn-primary"
              disabled={loading || !file}
            >
              {loading ? 'Mengimport...' : 'Import Data'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportModal;

