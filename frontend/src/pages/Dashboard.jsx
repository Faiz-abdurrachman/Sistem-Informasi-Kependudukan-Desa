// ============================================
// FILE: Dashboard.jsx
// ============================================
//
// DESKRIPSI:
// Dashboard page dengan charts dan visualisasi data
// Design natural tanpa emoji, menggunakan SVG icons
//
// ============================================

import { useState, useEffect } from "react";
import api from "../api/axiosInstance.js";
import toast from "react-hot-toast";
import StatCard from "../components/StatCard.jsx";
import { exportStatistikToPDF } from "../utils/exportPDF.js";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const Dashboard = () => {
  const [statistik, setStatistik] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistik();
  }, []);

  const fetchStatistik = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/statistik");

      if (response.data.success) {
        setStatistik(response.data.data.statistik);
      }
    } catch (error) {
      toast.error("Gagal mengambil statistik");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Export laporan statistik ke PDF
   *
   * ALASAN:
   * - User butuh laporan PDF untuk presentasi/laporan ke atasan
   * - Format PDF tidak bisa di-edit (aman untuk laporan resmi)
   * - Bisa di-print langsung
   *
   * CARA KERJA:
   * 1. Panggil exportStatistikToPDF() dengan data statistik
   * 2. jsPDF generate PDF dengan kop surat dan data statistik
   * 3. File PDF otomatis terdownload
   */
  const handleExportPDF = () => {
    try {
      if (!statistik) {
        toast.error("Data statistik belum tersedia");
        return;
      }

      toast.loading("Menyiapkan laporan PDF...", { id: "export-pdf" });

      // Export ke PDF
      exportStatistikToPDF(statistik, "Laporan Statistik Kependudukan");

      toast.success("Laporan berhasil di-export ke PDF", { id: "export-pdf" });
    } catch (error) {
      toast.error("Gagal export laporan ke PDF", { id: "export-pdf" });
      console.error("Export PDF error:", error);
    }
  };

  // Prepare data for charts
  const agamaData =
    statistik?.statistikAgama?.map((item) => ({
      name: item.agama || "Tidak Diketahui",
      value: item._count?.id || 0,
    })) || [];

  const pendidikanData =
    statistik?.statistikPendidikan?.map((item) => ({
      name: item.pendidikan || "Tidak Diketahui",
      value: item._count?.id || 0,
    })) || [];

  const pekerjaanData =
    statistik?.statistikPekerjaan?.slice(0, 10).map((item) => ({
      name: item.pekerjaan || "Tidak Diketahui",
      value: item._count?.id || 0,
    })) || [];

  const jenisKelaminData = [
    {
      name: "Laki-laki",
      value: statistik?.jenisKelamin?.lakiLaki || 0,
    },
    {
      name: "Perempuan",
      value: statistik?.jenisKelamin?.perempuan || 0,
    },
  ];

  const statusData = [
    {
      name: "Aktif",
      value: statistik?.statusKependudukan?.aktif || 0,
    },
    {
      name: "Meninggal",
      value: statistik?.statusKependudukan?.meninggal || 0,
    },
    {
      name: "Pindah",
      value: statistik?.statusKependudukan?.pindah || 0,
    },
  ];

  // Color palette natural
  const COLORS = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#EC4899",
    "#06B6D4",
    "#84CC16",
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-solid border-primary-600 border-r-transparent"></div>
          <p className="mt-4 text-slate-600 text-sm">
            Memuat data dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600">
            Ringkasan data kependudukan desa
          </p>
        </div>
        {statistik && (
          <button onClick={handleExportPDF} className="btn btn-secondary">
            Export PDF
          </button>
        )}
      </div>

      {/* Stat Cards */}
      {statistik && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Penduduk"
            value={(statistik.totalPenduduk || 0).toLocaleString("id-ID")}
            icon="penduduk"
            color="blue"
          />
          <StatCard
            title="Kartu Keluarga"
            value={(statistik.totalKK || 0).toLocaleString("id-ID")}
            icon="kk"
            color="green"
          />
          <StatCard
            title="Total Surat"
            value={(statistik.totalSurat || 0).toLocaleString("id-ID")}
            icon="surat"
            color="purple"
          />
          <StatCard
            title="Penduduk Aktif"
            value={(statistik.statusKependudukan?.aktif || 0).toLocaleString(
              "id-ID"
            )}
            icon="aktif"
            color="orange"
          />
        </div>
      )}

      {/* PHASE 4.5: Widget Baru */}
      {statistik?.widgets && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card p-6 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 mb-1">
                  Penduduk Baru Bulan Ini
                </p>
                <p className="text-3xl font-bold text-blue-900">
                  {(statistik.widgets.pendudukBaruBulanIni || 0).toLocaleString("id-ID")}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="card p-6 bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 mb-1">
                  Surat Dibuat Hari Ini
                </p>
                <p className="text-3xl font-bold text-green-900">
                  {(statistik.widgets.suratHariIni || 0).toLocaleString("id-ID")}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="card p-6 bg-gradient-to-br from-red-50 to-red-100 border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600 mb-1">
                  Penduduk Tanpa KK
                </p>
                <p className="text-3xl font-bold text-red-900">
                  {(statistik.widgets.pendudukTanpaKK || 0).toLocaleString("id-ID")}
                </p>
                {statistik.widgets.pendudukTanpaKK > 0 && (
                  <p className="text-xs text-red-600 mt-1">
                    Perlu perhatian
                  </p>
                )}
              </div>
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Jenis Kelamin Chart */}
        {jenisKelaminData.length > 0 && (
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">
              Distribusi Jenis Kelamin
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={jenisKelaminData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {jenisKelaminData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Status Kependudukan Chart */}
        {statusData.length > 0 && (
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">
              Status Kependudukan
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="value" fill="#3B82F6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Agama & Pendidikan Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Agama Chart */}
        {agamaData.length > 0 && (
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">
              Distribusi Agama
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={agamaData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    percent > 0.05
                      ? `${name}: ${(percent * 100).toFixed(0)}%`
                      : ""
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {agamaData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Pendidikan Chart */}
        {pendidikanData.length > 0 && (
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">
              Tingkat Pendidikan
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pendidikanData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" stroke="#6b7280" />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="#6b7280"
                  width={120}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="value" fill="#10B981" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Pekerjaan Chart */}
      {pekerjaanData.length > 0 && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">
            Top 10 Pekerjaan
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={pekerjaanData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="name"
                stroke="#6b7280"
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="value" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Quick Stats */}
      {statistik && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="card p-6">
            <h3 className="text-sm font-medium text-slate-600 mb-2">
              Rata-rata Anggota per KK
            </h3>
            <p className="text-2xl font-semibold text-slate-900">
              {statistik.totalKK > 0
                ? (statistik.totalPenduduk / statistik.totalKK || 0).toFixed(1)
                : "0"}
            </p>
          </div>
          <div className="card p-6">
            <h3 className="text-sm font-medium text-slate-600 mb-2">
              Persentase Penduduk Aktif
            </h3>
            <p className="text-2xl font-semibold text-slate-900">
              {statistik.totalPenduduk > 0
                ? (
                    ((statistik.statusKependudukan?.aktif || 0) /
                      statistik.totalPenduduk) *
                    100
                  ).toFixed(1)
                : "0"}
              %
            </p>
          </div>
          <div className="card p-6">
            <h3 className="text-sm font-medium text-slate-600 mb-2">
              Total Surat
            </h3>
            <p className="text-2xl font-semibold text-slate-900">
              {(statistik.totalSurat || 0).toLocaleString("id-ID")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
