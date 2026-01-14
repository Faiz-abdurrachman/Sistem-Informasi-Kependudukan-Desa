// ============================================
// FILE: Laporan.jsx
// ============================================
//
// DESKRIPSI:
// Page untuk laporan rekap penduduk dan surat
// PHASE 4.4: Frontend Page Laporan dengan filter dan export
//
// ============================================

import { useState, useEffect } from "react";
import api from "../api/axiosInstance.js";
import toast from "react-hot-toast";
import { exportPendudukToExcel } from "../utils/exportExcel.js";
import { exportStatistikToPDF } from "../utils/exportPDF.js";

const Laporan = () => {
  const [activeTab, setActiveTab] = useState("penduduk"); // "penduduk" or "surat"
  const [loading, setLoading] = useState(false);
  const [rekapPenduduk, setRekapPenduduk] = useState(null);
  const [rekapSurat, setRekapSurat] = useState(null);

  // Filter untuk laporan penduduk
  const [filtersPenduduk, setFiltersPenduduk] = useState({
    rt: "",
    rw: "",
    statusKependudukan: "",
    usiaMin: "",
    usiaMax: "",
    jenisKelamin: "",
    agama: "",
    pendidikan: "",
  });

  // Filter untuk laporan surat
  const [filtersSurat, setFiltersSurat] = useState({
    jenisSurat: "",
    tanggalDari: "",
    tanggalSampai: "",
    status: "",
  });

  useEffect(() => {
    if (activeTab === "penduduk") {
      fetchRekapPenduduk();
    } else {
      fetchRekapSurat();
    }
  }, [activeTab]);

  const fetchRekapPenduduk = async () => {
    try {
      setLoading(true);
      const params = { ...filtersPenduduk };
      
      // Remove empty values
      Object.keys(params).forEach((key) => {
        if (params[key] === "" || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await api.get("/api/laporan/penduduk/rekap", { params });

      if (response.data.success) {
        setRekapPenduduk(response.data.data);
      }
    } catch (error) {
      toast.error("Gagal mengambil rekap penduduk");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRekapSurat = async () => {
    try {
      setLoading(true);
      const params = { ...filtersSurat };
      
      // Remove empty values
      Object.keys(params).forEach((key) => {
        if (params[key] === "" || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await api.get("/api/laporan/surat/rekap", { params });

      if (response.data.success) {
        setRekapSurat(response.data.data);
      }
    } catch (error) {
      toast.error("Gagal mengambil rekap surat");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterPenduduk = () => {
    fetchRekapPenduduk();
  };

  const handleFilterSurat = () => {
    fetchRekapSurat();
  };

  const handleResetFilterPenduduk = () => {
    setFiltersPenduduk({
      rt: "",
      rw: "",
      statusKependudukan: "",
      usiaMin: "",
      usiaMax: "",
      jenisKelamin: "",
      agama: "",
      pendidikan: "",
    });
    setTimeout(() => fetchRekapPenduduk(), 100);
  };

  const handleResetFilterSurat = () => {
    setFiltersSurat({
      jenisSurat: "",
      tanggalDari: "",
      tanggalSampai: "",
      status: "",
    });
    setTimeout(() => fetchRekapSurat(), 100);
  };

  const handleExportExcelPenduduk = () => {
    if (!rekapPenduduk?.detail || rekapPenduduk.detail.length === 0) {
      toast.error("Tidak ada data untuk di-export");
      return;
    }

    try {
      exportPendudukToExcel(rekapPenduduk.detail, "Laporan Rekap Penduduk");
      toast.success("Laporan berhasil di-export ke Excel");
    } catch (error) {
      toast.error("Gagal export laporan ke Excel");
      console.error(error);
    }
  };

  const handleExportPDFPenduduk = () => {
    if (!rekapPenduduk) {
      toast.error("Tidak ada data untuk di-export");
      return;
    }

    try {
      // Format data untuk PDF
      const pdfData = {
        totalPenduduk: rekapPenduduk.summary.total,
        jenisKelamin: {
          lakiLaki: rekapPenduduk.summary.lakiLaki,
          perempuan: rekapPenduduk.summary.perempuan,
        },
        statusKependudukan: {
          aktif: rekapPenduduk.summary.aktif,
          meninggal: rekapPenduduk.summary.meninggal,
          pindah: rekapPenduduk.summary.pindah,
        },
      };

      exportStatistikToPDF(pdfData, "Laporan Rekap Penduduk");
      toast.success("Laporan berhasil di-export ke PDF");
    } catch (error) {
      toast.error("Gagal export laporan ke PDF");
      console.error(error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Laporan</h1>
        <p className="mt-2 text-sm text-slate-600">
          Laporan rekap penduduk dan surat administrasi
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-slate-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("penduduk")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "penduduk"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            Laporan Penduduk
          </button>
          <button
            onClick={() => setActiveTab("surat")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "surat"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            Laporan Surat
          </button>
        </nav>
      </div>

      {/* Laporan Penduduk */}
      {activeTab === "penduduk" && (
        <div>
          {/* Filter */}
          <div className="card p-6 mb-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Filter Laporan
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  RT
                </label>
                <input
                  type="text"
                  value={filtersPenduduk.rt}
                  onChange={(e) =>
                    setFiltersPenduduk({ ...filtersPenduduk, rt: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="RT"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  RW
                </label>
                <input
                  type="text"
                  value={filtersPenduduk.rw}
                  onChange={(e) =>
                    setFiltersPenduduk({ ...filtersPenduduk, rw: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="RW"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Status Kependudukan
                </label>
                <select
                  value={filtersPenduduk.statusKependudukan}
                  onChange={(e) =>
                    setFiltersPenduduk({
                      ...filtersPenduduk,
                      statusKependudukan: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Semua</option>
                  <option value="Aktif">Aktif</option>
                  <option value="Meninggal">Meninggal</option>
                  <option value="Pindah">Pindah</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Jenis Kelamin
                </label>
                <select
                  value={filtersPenduduk.jenisKelamin}
                  onChange={(e) =>
                    setFiltersPenduduk({
                      ...filtersPenduduk,
                      jenisKelamin: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Semua</option>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Usia Min
                </label>
                <input
                  type="number"
                  value={filtersPenduduk.usiaMin}
                  onChange={(e) =>
                    setFiltersPenduduk({
                      ...filtersPenduduk,
                      usiaMin: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Usia Max
                </label>
                <input
                  type="number"
                  value={filtersPenduduk.usiaMax}
                  onChange={(e) =>
                    setFiltersPenduduk({
                      ...filtersPenduduk,
                      usiaMax: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Agama
                </label>
                <input
                  type="text"
                  value={filtersPenduduk.agama}
                  onChange={(e) =>
                    setFiltersPenduduk({
                      ...filtersPenduduk,
                      agama: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Agama"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Pendidikan
                </label>
                <input
                  type="text"
                  value={filtersPenduduk.pendidikan}
                  onChange={(e) =>
                    setFiltersPenduduk({
                      ...filtersPenduduk,
                      pendidikan: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Pendidikan"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button onClick={handleFilterPenduduk} className="btn btn-primary">
                Terapkan Filter
              </button>
              <button
                onClick={handleResetFilterPenduduk}
                className="btn btn-secondary"
              >
                Reset
              </button>
              {rekapPenduduk && (
                <>
                  <button
                    onClick={handleExportExcelPenduduk}
                    className="btn btn-secondary"
                  >
                    Export Excel
                  </button>
                  <button
                    onClick={handleExportPDFPenduduk}
                    className="btn btn-secondary"
                  >
                    Export PDF
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Summary */}
          {rekapPenduduk && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="card p-4">
                <p className="text-sm text-slate-600 mb-1">Total Penduduk</p>
                <p className="text-2xl font-bold text-slate-900">
                  {rekapPenduduk.summary.total.toLocaleString("id-ID")}
                </p>
              </div>
              <div className="card p-4">
                <p className="text-sm text-slate-600 mb-1">Laki-laki</p>
                <p className="text-2xl font-bold text-slate-900">
                  {rekapPenduduk.summary.lakiLaki.toLocaleString("id-ID")}
                </p>
              </div>
              <div className="card p-4">
                <p className="text-sm text-slate-600 mb-1">Perempuan</p>
                <p className="text-2xl font-bold text-slate-900">
                  {rekapPenduduk.summary.perempuan.toLocaleString("id-ID")}
                </p>
              </div>
              <div className="card p-4">
                <p className="text-sm text-slate-600 mb-1">Aktif</p>
                <p className="text-2xl font-bold text-slate-900">
                  {rekapPenduduk.summary.aktif.toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          )}

          {/* Rekap Table */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-600 border-r-transparent mx-auto"></div>
              <p className="mt-4 text-sm text-slate-600">Memuat data...</p>
            </div>
          ) : rekapPenduduk ? (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Rekap Detail
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                        Kategori
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                        Jumlah
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {/* Per RT */}
                    {Object.entries(rekapPenduduk.rekap.perRT || {}).map(
                      ([rt, jumlah]) => (
                        <tr key={`rt-${rt}`}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                            RT {rt}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                            {jumlah.toLocaleString("id-ID")}
                          </td>
                        </tr>
                      )
                    )}

                    {/* Per RW */}
                    {Object.entries(rekapPenduduk.rekap.perRW || {}).map(
                      ([rw, jumlah]) => (
                        <tr key={`rw-${rw}`}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                            RW {rw}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                            {jumlah.toLocaleString("id-ID")}
                          </td>
                        </tr>
                      )
                    )}

                    {/* Per Usia */}
                    {Object.entries(rekapPenduduk.rekap.perUsia || {}).map(
                      ([usia, jumlah]) => (
                        <tr key={`usia-${usia}`}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                            Usia {usia} tahun
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                            {jumlah.toLocaleString("id-ID")}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Laporan Surat */}
      {activeTab === "surat" && (
        <div>
          {/* Filter */}
          <div className="card p-6 mb-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Filter Laporan
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Jenis Surat
                </label>
                <input
                  type="text"
                  value={filtersSurat.jenisSurat}
                  onChange={(e) =>
                    setFiltersSurat({ ...filtersSurat, jenisSurat: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Jenis Surat"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tanggal Dari
                </label>
                <input
                  type="date"
                  value={filtersSurat.tanggalDari}
                  onChange={(e) =>
                    setFiltersSurat({
                      ...filtersSurat,
                      tanggalDari: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tanggal Sampai
                </label>
                <input
                  type="date"
                  value={filtersSurat.tanggalSampai}
                  onChange={(e) =>
                    setFiltersSurat({
                      ...filtersSurat,
                      tanggalSampai: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Status
                </label>
                <select
                  value={filtersSurat.status}
                  onChange={(e) =>
                    setFiltersSurat({ ...filtersSurat, status: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Semua</option>
                  <option value="Draft">Draft</option>
                  <option value="Selesai">Selesai</option>
                  <option value="Dicetak">Dicetak</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button onClick={handleFilterSurat} className="btn btn-primary">
                Terapkan Filter
              </button>
              <button
                onClick={handleResetFilterSurat}
                className="btn btn-secondary"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Summary */}
          {rekapSurat && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="card p-4">
                <p className="text-sm text-slate-600 mb-1">Total Surat</p>
                <p className="text-2xl font-bold text-slate-900">
                  {rekapSurat.summary.total.toLocaleString("id-ID")}
                </p>
              </div>
              <div className="card p-4">
                <p className="text-sm text-slate-600 mb-1">Draft</p>
                <p className="text-2xl font-bold text-slate-900">
                  {rekapSurat.summary.draft.toLocaleString("id-ID")}
                </p>
              </div>
              <div className="card p-4">
                <p className="text-sm text-slate-600 mb-1">Selesai</p>
                <p className="text-2xl font-bold text-slate-900">
                  {rekapSurat.summary.selesai.toLocaleString("id-ID")}
                </p>
              </div>
              <div className="card p-4">
                <p className="text-sm text-slate-600 mb-1">Dicetak</p>
                <p className="text-2xl font-bold text-slate-900">
                  {rekapSurat.summary.dicetak.toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          )}

          {/* Rekap Table */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-600 border-r-transparent mx-auto"></div>
              <p className="mt-4 text-sm text-slate-600">Memuat data...</p>
            </div>
          ) : rekapSurat ? (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Rekap Per Jenis Surat
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                        Jenis Surat
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                        Jumlah
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {Object.entries(rekapSurat.rekap.perJenisSurat || {}).map(
                      ([jenis, jumlah]) => (
                        <tr key={jenis}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                            {jenis}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                            {jumlah.toLocaleString("id-ID")}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default Laporan;
