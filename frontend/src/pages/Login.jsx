// ============================================
// FILE: Login.jsx
// ============================================
//
// DESKRIPSI:
// Login page component
// Form untuk user login dengan username/email dan password
//
// ============================================

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import toast from "react-hot-toast";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error("Username/email dan password wajib diisi");
      return;
    }

    setLoading(true);

    try {
      const result = await login(username, password);

      if (result.success) {
        toast.success("Login berhasil");
        navigate("/dashboard");
      } else {
        toast.error(result.message || "Login gagal");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-lg mb-4">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">SIKD</h1>
          <p className="mt-1 text-sm text-slate-600">
            Sistem Informasi Kependudukan Desa
          </p>
        </div>

        {/* Login Card */}
        <div className="card p-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">
            Masuk ke Akun
          </h2>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="label">
                Username / Email
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="input"
                placeholder="Masukkan username atau email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="label">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="input"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn btn-primary"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Memproses...
                  </span>
                ) : (
                  "Masuk"
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-xs text-slate-500 text-center">
              Default credentials untuk testing:
            </p>
            <p className="mt-1 text-xs text-slate-600 text-center font-mono">
              Admin: admin / admin123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
