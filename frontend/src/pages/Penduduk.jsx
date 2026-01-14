// ============================================
// FILE: Penduduk.jsx
// ============================================
//
// DESKRIPSI:
// Page untuk CRUD data penduduk
// Menampilkan tabel penduduk dengan fitur create, edit, delete
//
// ============================================

import { useState, useEffect } from "react";
import api from "../api/axiosInstance.js";
import toast from "react-hot-toast";
import Modal from "../components/Modal.jsx";
import AutocompleteSelect from "../components/AutocompleteSelect.jsx";
import AdvancedFilter from "../components/AdvancedFilter.jsx";
import ImportModal from "../components/ImportModal.jsx";
import { exportPendudukToExcel } from "../utils/exportExcel.js";
import {
  jenisKelaminOptions,
  agamaOptions,
  pendidikanOptions,
  pekerjaanOptions,
  statusPerkawinanOptions,
  golonganDarahOptions,
  statusKependudukanOptions,
  provinsiOptions,
  kabupatenOptions,
  getKabupatenByProvinsi,
} from "../data/options.js";

const Penduduk = () => {
  const [penduduk, setPenduduk] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nik: "",
    nama: "",
    tempatLahir: "",
    tanggalLahir: "",
    jenisKelamin: "",
    agama: "",
    pendidikan: "",
    pekerjaan: "",
    statusPerkawinan: "",
    alamat: "",
    rt: "",
    rw: "",
    desa: "",
    kecamatan: "",
    kabupaten: "",
    provinsi: "",
    golonganDarah: "",
    statusKependudukan: "Belum Terdaftar di KK", // MODEL ADMINISTRATIF: Default status untuk penduduk baru
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({});
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  useEffect(() => {
    fetchPenduduk();
  }, [pagination.page, search, filters]);

  const fetchPenduduk = async () => {
    try {
      setLoading(true);
      // Build params dengan filter
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: search || undefined,
        ...filters, // Spread filters ke params
      };

      // Remove undefined values
      Object.keys(params).forEach((key) => {
        if (
          params[key] === undefined ||
          params[key] === null ||
          params[key] === ""
        ) {
          delete params[key];
        }
      });

      const response = await api.get("/api/penduduk", { params });

      if (response.data.success) {
        setPenduduk(response.data.data.penduduk);
        setPagination(response.data.data.pagination);
      }
    } catch (error) {
      toast.error("Gagal mengambil data penduduk");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        // Update
        const response = await api.put(`/api/penduduk/${editingId}`, formData);
        if (response.data.success) {
          toast.success("Data penduduk berhasil diupdate");
          setIsModalOpen(false);
          setEditingId(null);
          resetForm();
          fetchPenduduk();
        }
      } else {
        // Create
        const response = await api.post("/api/penduduk", formData);
        if (response.data.success) {
          toast.success("Data penduduk berhasil ditambahkan");
          setIsModalOpen(false);
          resetForm();
          fetchPenduduk();
        }
      }
    } catch (error) {
      // Error sudah di-handle di axios interceptor
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      nik: item.nik,
      nama: item.nama,
      tempatLahir: item.tempatLahir,
      tanggalLahir: item.tanggalLahir.split("T")[0],
      jenisKelamin: item.jenisKelamin,
      agama: item.agama || "",
      pendidikan: item.pendidikan || "",
      pekerjaan: item.pekerjaan || "",
      statusPerkawinan: item.statusPerkawinan || "",
      alamat: item.alamat,
      rt: item.rt || "",
      rw: item.rw || "",
      desa: item.desa || "",
      kecamatan: item.kecamatan || "",
      kabupaten: item.kabupaten || "",
      provinsi: item.provinsi || "",
      golonganDarah: item.golonganDarah || "",
      statusKependudukan: item.statusKependudukan || "Aktif",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus data ini?")) return;

    try {
      const response = await api.delete(`/api/penduduk/${id}`);
      if (response.data.success) {
        toast.success("Data penduduk berhasil dihapus");
        fetchPenduduk();
      }
    } catch (error) {
      // Error sudah di-handle di axios interceptor
    }
  };

  const resetForm = () => {
    setFormData({
      nik: "",
      nama: "",
      tempatLahir: "",
      tanggalLahir: "",
      jenisKelamin: "",
      agama: "",
      pendidikan: "",
      pekerjaan: "",
      statusPerkawinan: "",
      alamat: "",
      rt: "",
      rw: "",
      desa: "",
      kecamatan: "",
      kabupaten: "",
      provinsi: "",
      golonganDarah: "",
      statusKependudukan: "Belum Terdaftar di KK", // MODEL ADMINISTRATIF: Default status untuk penduduk baru
    });
    setEditingId(null);
  };

  /**
   * Export data penduduk ke Excel
   *
   * ALASAN:
   * - User butuh export untuk laporan
   * - Format Excel mudah dibuka di Microsoft Excel/LibreOffice
   * - Bisa di-edit setelah di-export
   *
   * CARA KERJA:
   * 1. Fetch semua data penduduk (tanpa pagination)
   * 2. Panggil exportPendudukToExcel() dengan data
   * 3. File Excel otomatis terdownload
   */
  const handleExportExcel = async () => {
    try {
      toast.loading("Menyiapkan data untuk export...", { id: "export" });

      // Fetch semua data (limit besar untuk ambil semua)
      const response = await api.get("/api/penduduk", {
        params: { limit: 10000 }, // Ambil semua data
      });

      if (response.data.success && response.data.data.penduduk.length > 0) {
        // Export ke Excel
        exportPendudukToExcel(response.data.data.penduduk);
        toast.success("Data berhasil di-export ke Excel", { id: "export" });
      } else {
        toast.error("Tidak ada data untuk di-export", { id: "export" });
      }
    } catch (error) {
      toast.error("Gagal export data ke Excel", { id: "export" });
      console.error("Export error:", error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-slate-50 min-h-screen">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Data Penduduk
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Kelola data penduduk desa
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
            disabled={loading || penduduk.length === 0}
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

      {/* Advanced Search & Filter */}
      <AdvancedFilter
        filters={filters}
        onFilterChange={(newFilters) => {
          setFilters(newFilters);
          setPagination({ ...pagination, page: 1 }); // Reset ke page 1 saat filter berubah
        }}
        onSearch={(searchValue) => {
          setSearch(searchValue);
          setPagination({ ...pagination, page: 1 });
        }}
        showDateRange={true}
      />

      {/* Table */}
      <div className="card overflow-x-auto p-0">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-r-transparent mx-auto"></div>
            <p className="mt-3 text-sm text-slate-600">Memuat data...</p>
          </div>
        ) : penduduk.length === 0 ? (
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
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <p className="mt-3 text-sm text-slate-500">
              Tidak ada data penduduk
            </p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>NIK</th>
                <th>Nama</th>
                <th>Jenis Kelamin</th>
                <th>Alamat</th>
                <th>Status</th>
                <th className="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {penduduk.map((item) => (
                <tr key={item.id}>
                  <td className="font-mono text-xs">{item.nik}</td>
                  <td className="font-medium">{item.nama}</td>
                  <td>{item.jenisKelamin}</td>
                  <td className="max-w-xs truncate">{item.alamat}</td>
                  <td>
                    <span
                      className={`badge ${
                        item.statusKependudukan === "Aktif"
                          ? "badge-success"
                          : item.statusKependudukan === "Meninggal"
                          ? "badge-danger"
                          : "badge-warning"
                      }`}
                    >
                      {item.statusKependudukan}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        Edit
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-200 flex justify-between items-center bg-slate-50">
            <p className="text-sm text-slate-600">
              Menampilkan{" "}
              <span className="font-medium">
                {(pagination.page - 1) * pagination.limit + 1}
              </span>{" "}
              -{" "}
              <span className="font-medium">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{" "}
              dari <span className="font-medium">{pagination.total}</span>
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() =>
                  setPagination({ ...pagination, page: pagination.page - 1 })
                }
                disabled={!pagination.hasPrevPage}
                className="btn btn-sm btn-secondary"
              >
                Sebelumnya
              </button>
              <button
                onClick={() =>
                  setPagination({ ...pagination, page: pagination.page + 1 })
                }
                disabled={!pagination.hasNextPage}
                className="btn btn-sm btn-secondary"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingId ? "Edit Penduduk" : "Tambah Penduduk"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label label-required">NIK</label>
              <input
                type="text"
                required
                className="input"
                value={formData.nik}
                onChange={(e) =>
                  setFormData({ ...formData, nik: e.target.value })
                }
                maxLength={16}
                placeholder="16 digit NIK"
              />
            </div>
            <div>
              <label className="label label-required">Nama</label>
              <input
                type="text"
                required
                className="input"
                value={formData.nama}
                onChange={(e) =>
                  setFormData({ ...formData, nama: e.target.value })
                }
                placeholder="Nama lengkap"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tempat Lahir *
              </label>
              <input
                type="text"
                required
                className="input"
                value={formData.tempatLahir}
                onChange={(e) =>
                  setFormData({ ...formData, tempatLahir: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Lahir *
              </label>
              <input
                type="date"
                required
                className="input"
                value={formData.tanggalLahir}
                onChange={(e) =>
                  setFormData({ ...formData, tanggalLahir: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jenis Kelamin *
              </label>
              <select
                required
                className="input"
                value={formData.jenisKelamin}
                onChange={(e) =>
                  setFormData({ ...formData, jenisKelamin: e.target.value })
                }
              >
                <option value="">Pilih...</option>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Agama
              </label>
              <AutocompleteSelect
                options={agamaOptions}
                value={formData.agama}
                onChange={(value) => setFormData({ ...formData, agama: value })}
                placeholder="Pilih atau ketik agama..."
                allowCustom={true}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pendidikan
              </label>
              <AutocompleteSelect
                options={pendidikanOptions}
                value={formData.pendidikan}
                onChange={(value) =>
                  setFormData({ ...formData, pendidikan: value })
                }
                placeholder="Pilih atau ketik pendidikan..."
                allowCustom={true}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pekerjaan
              </label>
              <AutocompleteSelect
                options={pekerjaanOptions}
                value={formData.pekerjaan}
                onChange={(value) =>
                  setFormData({ ...formData, pekerjaan: value })
                }
                placeholder="Pilih atau ketik pekerjaan..."
                allowCustom={true}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status Perkawinan
              </label>
              <select
                className="input"
                value={formData.statusPerkawinan}
                onChange={(e) =>
                  setFormData({ ...formData, statusPerkawinan: e.target.value })
                }
              >
                <option value="">Pilih...</option>
                <option value="Belum Kawin">Belum Kawin</option>
                <option value="Kawin">Kawin</option>
                <option value="Cerai Hidup">Cerai Hidup</option>
                <option value="Cerai Mati">Cerai Mati</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Golongan Darah
              </label>
              <select
                className="input"
                value={formData.golonganDarah}
                onChange={(e) =>
                  setFormData({ ...formData, golonganDarah: e.target.value })
                }
              >
                <option value="">Pilih...</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="AB">AB</option>
                <option value="O">O</option>
              </select>
            </div>
            <div>
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
                Status Kependudukan
              </label>
              <select
                className="input"
                value={formData.statusKependudukan}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    statusKependudukan: e.target.value,
                  })
                }
              >
                {statusKependudukanOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {!editingId && formData.statusKependudukan === "Aktif" && (
                <p className="mt-1 text-xs text-amber-600">
                  ⚠️ Status "Aktif" hanya untuk penduduk yang sudah terdaftar di Kartu Keluarga. Penduduk baru harus menggunakan "Belum Terdaftar di KK" terlebih dahulu.
                </p>
              )}
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
                placeholder="Ketik nama desa..."
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
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
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
              {editingId ? "Simpan Perubahan" : "Simpan"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Import Modal */}
      <ImportModal
        type="penduduk"
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => {
          fetchPenduduk();
          setIsImportModalOpen(false);
        }}
      />
    </div>
  );
};

export default Penduduk;
