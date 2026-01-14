// ============================================
// FILE: Users.jsx
// ============================================
//
// DESKRIPSI:
// Page untuk CRUD user management (ADMIN only)
// PHASE 3.2: Frontend User Management
//
// ============================================

import { useState, useEffect } from "react";
import api from "../api/axiosInstance.js";
import toast from "react-hot-toast";
import Modal from "../components/Modal.jsx";
import { isAdmin } from "../utils/roleGuard.js";
import { useAuth } from "../context/AuthContext.jsx";

const roleOptions = [
  { value: "ADMIN", label: "Administrator" },
  { value: "OPERATOR", label: "Operator" },
  { value: "PUBLIK", label: "Publik" },
];

const Users = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [resettingPasswordId, setResettingPasswordId] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    nama: "",
    role: "OPERATOR",
  });
  const [resetPasswordData, setResetPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (isAdmin(user)) {
      fetchUsers();
    }
  }, [pagination.page, search, user]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: search || undefined,
      };

      Object.keys(params).forEach((key) => {
        if (params[key] === undefined || params[key] === null || params[key] === "") {
          delete params[key];
        }
      });

      const response = await api.get("/api/users", { params });

      if (response.data.success) {
        setUsers(response.data.data.users);
        setPagination(response.data.data.pagination);
      }
    } catch (error) {
      toast.error("Gagal mengambil data user");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (userId = null) => {
    if (userId) {
      const userToEdit = users.find((u) => u.id === userId);
      setEditingId(userId);
      setFormData({
        username: userToEdit.username,
        email: userToEdit.email,
        password: "",
        nama: userToEdit.nama,
        role: userToEdit.role,
      });
    } else {
      setEditingId(null);
      setFormData({
        username: "",
        email: "",
        password: "",
        nama: "",
        role: "OPERATOR",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
      username: "",
      email: "",
      password: "",
      nama: "",
      role: "OPERATOR",
    });
  };

  const handleOpenResetPasswordModal = (userId) => {
    setResettingPasswordId(userId);
    setResetPasswordData({
      newPassword: "",
      confirmPassword: "",
    });
    setIsResetPasswordModalOpen(true);
  };

  const handleCloseResetPasswordModal = () => {
    setIsResetPasswordModalOpen(false);
    setResettingPasswordId(null);
    setResetPasswordData({
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        // Update user (tidak perlu kirim password jika kosong)
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }

        await api.put(`/api/users/${editingId}`, updateData);
        toast.success("User berhasil diupdate");
      } else {
        // Create user baru (password wajib)
        if (!formData.password || formData.password.length < 6) {
          toast.error("Password minimal 6 karakter");
          return;
        }

        await api.post("/api/users", formData);
        toast.success("User berhasil ditambahkan");
      }

      handleCloseModal();
      fetchUsers();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Gagal menyimpan user"
      );
      console.error(error);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Apakah Anda yakin ingin menonaktifkan user ini?")) {
      return;
    }

    try {
      await api.delete(`/api/users/${userId}`);
      toast.success("User berhasil dinonaktifkan");
      fetchUsers();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Gagal menonaktifkan user"
      );
      console.error(error);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
      toast.error("Password dan konfirmasi password tidak sama");
      return;
    }

    if (resetPasswordData.newPassword.length < 6) {
      toast.error("Password minimal 6 karakter");
      return;
    }

    try {
      await api.patch(`/api/users/${resettingPasswordId}/reset-password`, {
        newPassword: resetPasswordData.newPassword,
      });
      toast.success("Password berhasil direset");
      handleCloseResetPasswordModal();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Gagal reset password"
      );
      console.error(error);
    }
  };

  // Jika bukan admin, redirect
  if (!isAdmin(user)) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">
            Anda tidak memiliki akses untuk halaman ini. Hanya Administrator yang dapat mengakses User Management.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
        <p className="mt-2 text-sm text-slate-600">
          Kelola user dan hak akses sistem
        </p>
      </div>

      {/* Actions */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Cari user (username, email, nama)..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPagination({ ...pagination, page: 1 });
            }}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn btn-primary"
        >
          + Tambah User
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-600 border-r-transparent mx-auto"></div>
          <p className="mt-4 text-sm text-slate-600">Memuat data...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-slate-600">Tidak ada data user</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Nama
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {users.map((userItem) => (
                  <tr key={userItem.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      {userItem.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {userItem.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {userItem.nama}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          userItem.role === "ADMIN"
                            ? "bg-purple-100 text-purple-800"
                            : userItem.role === "OPERATOR"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {userItem.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          userItem.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {userItem.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(userItem.id)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleOpenResetPasswordModal(userItem.id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Reset Password
                        </button>
                        {userItem.id !== user.id && (
                          <button
                            onClick={() => handleDelete(userItem.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            {userItem.isActive ? "Nonaktifkan" : "Aktifkan"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-4 flex justify-between items-center">
              <p className="text-sm text-slate-600">
                Menampilkan {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} dari {pagination.total} user
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setPagination({ ...pagination, page: pagination.page - 1 })
                  }
                  disabled={pagination.page === 1}
                  className="btn btn-sm btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sebelumnya
                </button>
                <button
                  onClick={() =>
                    setPagination({ ...pagination, page: pagination.page + 1 })
                  }
                  disabled={pagination.page >= pagination.totalPages}
                  className="btn btn-sm btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingId ? "Edit User" : "Tambah User"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Username *
            </label>
            <input
              type="text"
              required
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password {!editingId && "*"}
            </label>
            <input
              type="password"
              required={!editingId}
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder={editingId ? "Kosongkan jika tidak ingin mengubah password" : ""}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            {editingId && (
              <p className="mt-1 text-xs text-slate-500">
                Kosongkan jika tidak ingin mengubah password
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nama *
            </label>
            <input
              type="text"
              required
              value={formData.nama}
              onChange={(e) =>
                setFormData({ ...formData, nama: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Role *
            </label>
            <select
              required
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={handleCloseModal}
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

      {/* Reset Password Modal */}
      <Modal
        isOpen={isResetPasswordModalOpen}
        onClose={handleCloseResetPasswordModal}
        title="Reset Password"
      >
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password Baru *
            </label>
            <input
              type="password"
              required
              value={resetPasswordData.newPassword}
              onChange={(e) =>
                setResetPasswordData({
                  ...resetPasswordData,
                  newPassword: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <p className="mt-1 text-xs text-slate-500">
              Minimal 6 karakter
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Konfirmasi Password *
            </label>
            <input
              type="password"
              required
              value={resetPasswordData.confirmPassword}
              onChange={(e) =>
                setResetPasswordData({
                  ...resetPasswordData,
                  confirmPassword: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={handleCloseResetPasswordModal}
              className="btn btn-secondary"
            >
              Batal
            </button>
            <button type="submit" className="btn btn-primary">
              Reset Password
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Users;
