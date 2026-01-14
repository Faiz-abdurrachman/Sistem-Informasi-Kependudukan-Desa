// ============================================
// FILE: Surat.jsx
// ============================================
//
// DESKRIPSI:
// Page untuk CRUD data surat administrasi
//
// ============================================

import { useState, useEffect } from "react";
import api from "../api/axiosInstance.js";
import toast from "react-hot-toast";
import Modal from "../components/Modal.jsx";
import AutocompleteSelect from "../components/AutocompleteSelect.jsx";
import SuratPreview from "../components/SuratPreview.jsx";
import { jenisSuratOptions, jabatanOptions } from "../data/options.js";

const Surat = () => {
  const [surat, setSurat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    jenisSurat: "SKD",
    pendudukId: "",
    keterangan: "",
    penandatangan: "",
    jabatan: "",
    tanggalSurat: new Date().toISOString().split("T")[0],
  });
  const [pendudukList, setPendudukList] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });
  const [previewSurat, setPreviewSurat] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    fetchSurat();
    fetchPenduduk();
  }, [pagination.page]);

  const fetchSurat = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/surat", {
        params: { page: pagination.page, limit: pagination.limit },
      });
      if (response.data.success) {
        setSurat(response.data.data.surat);
        setPagination(response.data.data.pagination);
      }
    } catch (error) {
      toast.error("Gagal mengambil data surat");
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
        const response = await api.put(`/api/surat/${editingId}`, formData);
        if (response.data.success) {
          toast.success("Surat berhasil diupdate");
          setIsModalOpen(false);
          resetForm();
          fetchSurat();
        }
      } else {
        const response = await api.post("/api/surat", formData);
        if (response.data.success) {
          toast.success("Surat berhasil dibuat");
          setIsModalOpen(false);
          resetForm();
          fetchSurat();
        }
      }
    } catch (error) {
      // Error handled by interceptor
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      jenisSurat: item.jenisSurat,
      pendudukId: item.pendudukId?.toString() || "",
      keterangan: item.keterangan || "",
      penandatangan: item.penandatangan,
      jabatan: item.jabatan,
      tanggalSurat: item.tanggalSurat.split("T")[0],
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus surat ini?")) return;
    try {
      const response = await api.delete(`/api/surat/${id}`);
      if (response.data.success) {
        toast.success("Surat berhasil dihapus");
        fetchSurat();
      }
    } catch (error) {
      // Error handled by interceptor
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const response = await api.patch(`/api/surat/${id}/status`, { status });
      if (response.data.success) {
        toast.success("Status surat berhasil diupdate");
        fetchSurat();
      }
    } catch (error) {
      // Error handled by interceptor
    }
  };

  const resetForm = () => {
    setFormData({
      jenisSurat: "SKD",
      pendudukId: "",
      keterangan: "",
      penandatangan: "",
      jabatan: "",
      tanggalSurat: new Date().toISOString().split("T")[0],
    });
    setEditingId(null);
  };

  /**
   * Handle preview surat
   *
   * ALASAN:
   * - User perlu lihat surat sebelum print
   * - Memastikan format surat sudah benar
   *
   * CARA KERJA:
   * 1. Fetch detail surat lengkap (dengan data penduduk)
   * 2. Set previewSurat state
   * 3. Buka modal preview
   */
  const handlePreview = async (suratItem) => {
    try {
      // Fetch detail surat lengkap
      const response = await api.get(`/api/surat/${suratItem.id}`);
      if (response.data.success) {
        setPreviewSurat(response.data.data.surat);
        setIsPreviewOpen(true);
      }
    } catch (error) {
      toast.error("Gagal mengambil data surat");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-slate-50 min-h-screen">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Surat Administrasi
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Kelola surat-surat administrasi desa
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="btn btn-primary btn-sm"
        >
          + Buat Surat
        </button>
      </div>

      <div className="card overflow-x-auto p-0">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-r-transparent mx-auto"></div>
            <p className="mt-3 text-sm text-slate-600">Memuat data...</p>
          </div>
        ) : surat.length === 0 ? (
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="mt-3 text-sm text-slate-500">Tidak ada data surat</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Nomor Surat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Jenis
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Penduduk
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Penandatangan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {surat.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                    {item.nomorSurat}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {item.jenisSurat}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {item.penduduk?.nama || "-"}
                  </td>
                  <td className="px-6 py-4 text-sm">{item.penandatangan}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={item.status}
                      onChange={(e) =>
                        handleUpdateStatus(item.id, e.target.value)
                      }
                      className={`text-xs px-2 py-1 rounded-full border-0 ${
                        item.status === "Dicetak"
                          ? "bg-green-100 text-green-800"
                          : item.status === "Selesai"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <option value="Draft">Draft</option>
                      <option value="Selesai">Selesai</option>
                      <option value="Dicetak">Dicetak</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-primary-600 hover:text-primary-900 mr-4"
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
        title={editingId ? "Edit Surat" : "Buat Surat"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jenis Surat *
              </label>
              <AutocompleteSelect
                options={jenisSuratOptions}
                value={formData.jenisSurat}
                onChange={(value) =>
                  setFormData({ ...formData, jenisSurat: value })
                }
                placeholder="Pilih jenis surat..."
                allowCustom={false}
                required={true}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Penduduk (Opsional)
              </label>
              <select
                className="input"
                value={formData.pendudukId}
                onChange={(e) =>
                  setFormData({ ...formData, pendudukId: e.target.value })
                }
              >
                <option value="">Pilih penduduk...</option>
                {pendudukList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nama} - {p.nik}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Penandatangan *
              </label>
              <input
                type="text"
                required
                className="input"
                value={formData.penandatangan}
                onChange={(e) =>
                  setFormData({ ...formData, penandatangan: e.target.value })
                }
                placeholder="Nama pejabat"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jabatan *
              </label>
              <AutocompleteSelect
                options={jabatanOptions}
                value={formData.jabatan}
                onChange={(value) =>
                  setFormData({ ...formData, jabatan: value })
                }
                placeholder="Pilih atau ketik jabatan..."
                allowCustom={true}
                required={true}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Surat
              </label>
              <input
                type="date"
                className="input"
                value={formData.tanggalSurat}
                onChange={(e) =>
                  setFormData({ ...formData, tanggalSurat: e.target.value })
                }
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Keterangan
              </label>
              <textarea
                className="input"
                rows={4}
                value={formData.keterangan}
                onChange={(e) =>
                  setFormData({ ...formData, keterangan: e.target.value })
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
              {editingId ? "Update" : "Buat Surat"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Preview Surat Modal */}
      {isPreviewOpen && previewSurat && (
        <SuratPreview
          surat={previewSurat}
          onClose={() => {
            setIsPreviewOpen(false);
            setPreviewSurat(null);
          }}
        />
      )}
    </div>
  );
};

export default Surat;
