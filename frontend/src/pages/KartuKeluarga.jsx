// ============================================
// FILE: KartuKeluarga.jsx
// ============================================
//
// DESKRIPSI:
// Page untuk CRUD data Kartu Keluarga
//
// ============================================

import { useState, useEffect } from "react";
import api from "../api/axiosInstance.js";
import toast from "react-hot-toast";
import Modal from "../components/Modal.jsx";
import AutocompleteSelect from "../components/AutocompleteSelect.jsx";
import ImportModal from "../components/ImportModal.jsx";
import KKPreview from "../components/KKPreview.jsx";
import { exportKKToExcel } from "../utils/exportExcel.js";
import {
  provinsiOptions,
  getKabupatenByProvinsi,
  hubunganKeluargaOptions,
} from "../data/options.js";

const KartuKeluarga = () => {
  const [kk, setKK] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nomorKK: "",
    kepalaKeluargaId: "",
    alamat: "",
    rt: "",
    rw: "",
    desa: "",
    kecamatan: "",
    kabupaten: "",
    provinsi: "",
    kodePos: "",
  });
  const [pendudukList, setPendudukList] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });
  const [isAnggotaModalOpen, setIsAnggotaModalOpen] = useState(false);
  const [isAddAnggotaModalOpen, setIsAddAnggotaModalOpen] = useState(false);
  const [selectedKK, setSelectedKK] = useState(null);
  const [anggotaList, setAnggotaList] = useState([]);
  const [newAnggota, setNewAnggota] = useState({
    pendudukId: "",
    hubungan: "",
  });
  const [previewKK, setPreviewKK] = useState(null);
  const [isPreviewKKOpen, setIsPreviewKKOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  useEffect(() => {
    fetchKK();
    fetchPenduduk();
  }, [pagination.page]);

  const fetchKK = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/kk", {
        params: { page: pagination.page, limit: pagination.limit },
      });
      if (response.data.success) {
        setKK(response.data.data.kk);
        setPagination(response.data.data.pagination);
      }
    } catch (error) {
      toast.error("Gagal mengambil data Kartu Keluarga");
    } finally {
      setLoading(false);
    }
  };

  const fetchPenduduk = async () => {
    try {
      const response = await api.get("/api/penduduk", {
        params: { limit: 1000 },
      });
      if (response.data.success) {
        setPendudukList(response.data.data.penduduk);
      }
    } catch (error) {
      // Silent fail
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const response = await api.put(`/api/kk/${editingId}`, formData);
        if (response.data.success) {
          toast.success("Data berhasil diupdate");
          setIsModalOpen(false);
          resetForm();
          fetchKK();
        }
      } else {
        const response = await api.post("/api/kk", formData);
        if (response.data.success) {
          toast.success("Data berhasil ditambahkan");
          setIsModalOpen(false);
          resetForm();
          fetchKK();
        }
      }
    } catch (error) {
      // Error handled by interceptor
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      nomorKK: item.nomorKK,
      kepalaKeluargaId: item.kepalaKeluargaId.toString(),
      alamat: item.alamat,
      rt: item.rt,
      rw: item.rw,
      desa: item.desa,
      kecamatan: item.kecamatan,
      kabupaten: item.kabupaten,
      provinsi: item.provinsi,
      kodePos: item.kodePos || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus data ini?")) return;
    try {
      const response = await api.delete(`/api/kk/${id}`);
      if (response.data.success) {
        toast.success("Data berhasil dihapus");
        fetchKK();
      }
    } catch (error) {
      // Error handled by interceptor
    }
  };

  const resetForm = () => {
    setFormData({
      nomorKK: "",
      kepalaKeluargaId: "",
      alamat: "",
      rt: "",
      rw: "",
      desa: "",
      kecamatan: "",
      kabupaten: "",
      provinsi: "",
      kodePos: "",
    });
    setEditingId(null);
  };

  const handleKelolaAnggota = async (kkId) => {
    try {
      const response = await api.get(`/api/kk/${kkId}`);
      if (response.data.success) {
        setSelectedKK(response.data.data.kk);
        setAnggotaList(response.data.data.kk.anggotaKeluarga || []);
        setIsAnggotaModalOpen(true);
      }
    } catch (error) {
      toast.error("Gagal mengambil data anggota keluarga");
    }
  };

  const handleAddAnggota = async (e) => {
    e.preventDefault();
    if (!newAnggota.pendudukId || !newAnggota.hubungan) {
      toast.error("Penduduk dan hubungan wajib diisi");
      return;
    }

    try {
      const response = await api.post(`/api/kk/${selectedKK.id}/anggota`, {
        pendudukId: parseInt(newAnggota.pendudukId),
        hubungan: newAnggota.hubungan,
      });
      if (response.data.success) {
        toast.success("Anggota keluarga berhasil ditambahkan");
        setIsAddAnggotaModalOpen(false);
        setNewAnggota({ pendudukId: "", hubungan: "" });
        handleKelolaAnggota(selectedKK.id); // Refresh data
      }
    } catch (error) {
      // Error handled by interceptor
    }
  };

  const handleRemoveAnggota = async (anggotaId) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus anggota ini?"))
      return;
    try {
      const response = await api.delete(
        `/api/kk/${selectedKK.id}/anggota/${anggotaId}`
      );
      if (response.data.success) {
        toast.success("Anggota keluarga berhasil dihapus");
        handleKelolaAnggota(selectedKK.id); // Refresh data
      }
    } catch (error) {
      // Error handled by interceptor
    }
  };

  /**
   * Export data Kartu Keluarga ke Excel
   *
   * ALASAN:
   * - User butuh export untuk laporan
   * - Format Excel mudah dibuka dan di-edit
   *
   * CARA KERJA:
   * 1. Fetch semua data KK (tanpa pagination)
   * 2. Panggil exportKKToExcel() dengan data
   * 3. File Excel otomatis terdownload
   */
  const handleExportExcel = async () => {
    try {
      toast.loading("Menyiapkan data untuk export...", { id: "export" });

      // Fetch semua data
      const response = await api.get("/api/kk", {
        params: { limit: 10000 }, // Ambil semua data
      });

      if (response.data.success && response.data.data.kk.length > 0) {
        // Export ke Excel
        exportKKToExcel(response.data.data.kk);
        toast.success("Data berhasil di-export ke Excel", { id: "export" });
      } else {
        toast.error("Tidak ada data untuk di-export", { id: "export" });
      }
    } catch (error) {
      toast.error("Gagal export data ke Excel", { id: "export" });
      console.error("Export error:", error);
    }
  };

  /**
   * Handle preview & print Kartu Keluarga
   *
   * ALASAN:
   * - User butuh print KK dengan semua anggota
   * - Format resmi KK
   *
   * CARA KERJA:
   * 1. Fetch detail KK lengkap (dengan semua anggota)
   * 2. Set previewKK state
   * 3. Buka modal preview
   */
  const handlePreviewKK = async (kkId) => {
    try {
      const response = await api.get(`/api/kk/${kkId}`);
      if (response.data.success) {
        setPreviewKK(response.data.data.kk);
        setIsPreviewKKOpen(true);
      }
    } catch (error) {
      toast.error("Gagal mengambil data Kartu Keluarga");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-slate-50 min-h-screen">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Kartu Keluarga
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Kelola data Kartu Keluarga
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="btn btn-secondary btn-sm"
          >
            Import
          </button>
          <button
            onClick={handleExportExcel}
            className="btn btn-secondary btn-sm"
            disabled={loading || kk.length === 0}
          >
            Export
          </button>
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="btn btn-primary btn-sm"
          >
            + Tambah
          </button>
        </div>
      </div>

      <div className="card overflow-x-auto p-0">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-r-transparent mx-auto"></div>
            <p className="mt-3 text-sm text-slate-600">Memuat data...</p>
          </div>
        ) : kk.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <p className="mt-3 text-sm text-slate-500">
              Tidak ada data Kartu Keluarga
            </p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Nomor KK
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Kepala Keluarga
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Alamat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Anggota
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {kk.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                    {item.nomorKK}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {item.kepalaKeluarga?.nama}
                  </td>
                  <td className="px-6 py-4 text-sm">{item.alamat}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {item._count?.anggotaKeluarga || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handlePreviewKK(item.id)}
                      className="text-purple-600 hover:text-purple-900 mr-3"
                      title="Preview & Print"
                    >
                      Print
                    </button>
                    <button
                      onClick={() => handleKelolaAnggota(item.id)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      title="Kelola Anggota"
                    >
                      Anggota
                    </button>
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-primary-600 hover:text-primary-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingId ? "Edit Kartu Keluarga" : "Tambah Kartu Keluarga"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nomor KK *
              </label>
              <input
                type="text"
                required
                className="input"
                value={formData.nomorKK}
                onChange={(e) =>
                  setFormData({ ...formData, nomorKK: e.target.value })
                }
                maxLength={16}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kepala Keluarga *
              </label>
              <select
                required
                className="input"
                value={formData.kepalaKeluargaId}
                onChange={(e) =>
                  setFormData({ ...formData, kepalaKeluargaId: e.target.value })
                }
              >
                <option value="">Pilih...</option>
                {pendudukList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nama} - {p.nik}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alamat *
              </label>
              <textarea
                required
                className="input"
                rows={3}
                value={formData.alamat}
                onChange={(e) =>
                  setFormData({ ...formData, alamat: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                RT
              </label>
              <input
                type="text"
                className="input"
                value={formData.rt}
                onChange={(e) =>
                  setFormData({ ...formData, rt: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                RW
              </label>
              <input
                type="text"
                className="input"
                value={formData.rw}
                onChange={(e) =>
                  setFormData({ ...formData, rw: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Desa
              </label>
              <input
                type="text"
                className="input"
                value={formData.desa}
                onChange={(e) =>
                  setFormData({ ...formData, desa: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kecamatan
              </label>
              <input
                type="text"
                className="input"
                value={formData.kecamatan}
                onChange={(e) =>
                  setFormData({ ...formData, kecamatan: e.target.value })
                }
                placeholder="Ketik nama kecamatan..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Provinsi
              </label>
              <AutocompleteSelect
                options={provinsiOptions}
                value={formData.provinsi}
                onChange={(value) =>
                  setFormData({ ...formData, provinsi: value })
                }
                placeholder="Pilih atau ketik provinsi..."
                allowCustom={true}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kabupaten
              </label>
              <AutocompleteSelect
                options={getKabupatenByProvinsi(formData.provinsi)}
                value={formData.kabupaten}
                onChange={(value) =>
                  setFormData({ ...formData, kabupaten: value })
                }
                placeholder="Pilih atau ketik kabupaten..."
                allowCustom={true}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kode Pos
              </label>
              <input
                type="text"
                className="input"
                value={formData.kodePos}
                onChange={(e) =>
                  setFormData({ ...formData, kodePos: e.target.value })
                }
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
              className="btn btn-secondary"
            >
              Batal
            </button>
            <button type="submit" className="btn btn-primary">
              {editingId ? "Update" : "Simpan"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Kelola Anggota Keluarga */}
      <Modal
        isOpen={isAnggotaModalOpen}
        onClose={() => {
          setIsAnggotaModalOpen(false);
          setSelectedKK(null);
          setAnggotaList([]);
        }}
        title={`Anggota Keluarga - ${selectedKK?.nomorKK}`}
        size="lg"
      >
        <div className="space-y-4">
          {/* Info KK */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Kepala Keluarga</p>
            <p className="font-semibold text-gray-900">
              {selectedKK?.kepalaKeluarga?.nama}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              NIK: {selectedKK?.kepalaKeluarga?.nik}
            </p>
          </div>

          {/* Daftar Anggota */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-900">
                Daftar Anggota Keluarga
              </h3>
              <button
                onClick={() => setIsAddAnggotaModalOpen(true)}
                className="btn btn-primary text-sm"
              >
                + Tambah Anggota
              </button>
            </div>

            {anggotaList.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Belum ada anggota keluarga
              </div>
            ) : (
              <div className="space-y-2">
                {anggotaList.map((anggota) => (
                  <div
                    key={anggota.id}
                    className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {anggota.penduduk?.nama}
                      </p>
                      <p className="text-sm text-gray-600">
                        NIK: {anggota.penduduk?.nik} | Hubungan:{" "}
                        {anggota.hubungan}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveAnggota(anggota.id)}
                      className="text-red-600 hover:text-red-900 text-sm px-3 py-1"
                    >
                      Hapus
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Modal Tambah Anggota */}
      <Modal
        isOpen={isAddAnggotaModalOpen}
        onClose={() => {
          setIsAddAnggotaModalOpen(false);
          setNewAnggota({ pendudukId: "", hubungan: "" });
        }}
        title="Tambah Anggota Keluarga"
        size="md"
      >
        <form onSubmit={handleAddAnggota} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Penduduk *
            </label>
            <select
              required
              className="input"
              value={newAnggota.pendudukId}
              onChange={(e) =>
                setNewAnggota({ ...newAnggota, pendudukId: e.target.value })
              }
            >
              <option value="">Pilih penduduk...</option>
              {pendudukList
                .filter(
                  (p) =>
                    p.id !== selectedKK?.kepalaKeluargaId &&
                    !anggotaList.some((a) => a.pendudukId === p.id)
                )
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nama} - {p.nik}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hubungan dengan Kepala Keluarga *
            </label>
            <AutocompleteSelect
              options={hubunganKeluargaOptions}
              value={newAnggota.hubungan}
              onChange={(value) =>
                setNewAnggota({ ...newAnggota, hubungan: value })
              }
              placeholder="Pilih hubungan..."
              allowCustom={false}
              required={true}
            />
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => {
                setIsAddAnggotaModalOpen(false);
                setNewAnggota({ pendudukId: "", hubungan: "" });
              }}
              className="btn btn-secondary"
            >
              Batal
            </button>
            <button type="submit" className="btn btn-primary">
              Tambah
            </button>
          </div>
        </form>
      </Modal>

      {/* Preview KK Modal */}
      {isPreviewKKOpen && previewKK && (
        <KKPreview
          kk={previewKK}
          onClose={() => {
            setIsPreviewKKOpen(false);
            setPreviewKK(null);
          }}
        />
      )}

      {/* Import Modal */}
      <ImportModal
        type="kk"
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => {
          fetchKK();
          setIsImportModalOpen(false);
        }}
      />
    </div>
  );
};

export default KartuKeluarga;
