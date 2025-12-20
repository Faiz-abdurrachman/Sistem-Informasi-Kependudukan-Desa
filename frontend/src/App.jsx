// ============================================
// FILE: App.jsx
// ============================================
//
// DESKRIPSI:
// Main App component dengan routing
// Menggunakan React Router untuk navigation
//
// ALUR DATA:
// 1. App start → AuthProvider wrap → Router setup → Route rendering
// 2. Protected routes: Cek authentication sebelum render
// 3. Public routes: Bisa diakses tanpa authentication
//
// ALASAN DESAIN:
// - Routing: React Router untuk SPA navigation
// - Protected routes: Route guard untuk protect routes yang butuh auth
// - Layout: Shared layout untuk semua pages
//
// ROUTES:
// /login - Login page (public)
// /dashboard - Dashboard (protected)
// /penduduk - Data penduduk (protected, ADMIN/OPERATOR)
// /kk - Kartu Keluarga (protected, ADMIN/OPERATOR)
// /surat - Surat administrasi (protected, ADMIN/OPERATOR)
//
// ============================================

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Penduduk from "./pages/Penduduk.jsx";
import KartuKeluarga from "./pages/KartuKeluarga.jsx";
import Surat from "./pages/Surat.jsx";
import Navbar from "./components/Navbar.jsx";
import { isOperatorOrAdmin } from "./utils/roleGuard.js";

/**
 * Protected Route Component
 * Redirect ke login jika user tidak authenticated
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-600 border-r-transparent mx-auto"></div>
          <p className="mt-4 text-sm text-slate-600">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

/**
 * Admin/Operator Only Route Component
 * Redirect jika user bukan ADMIN atau OPERATOR
 */
const OperatorRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-600 border-r-transparent mx-auto"></div>
          <p className="mt-4 text-sm text-slate-600">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isOperatorOrAdmin(user)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

/**
 * Main App Component
 */
function AppContent() {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        {/* Navbar hanya muncul jika user sudah login */}
        {isAuthenticated && <Navbar />}

        {/* Main Content */}
        <main className={isAuthenticated ? "pt-16" : ""}>
          <Routes>
            {/* Public Routes */}
            <Route
              path="/login"
              element={
                isAuthenticated ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Login />
                )
              }
            />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Admin/Operator Only Routes */}
            <Route
              path="/penduduk"
              element={
                <OperatorRoute>
                  <Penduduk />
                </OperatorRoute>
              }
            />

            <Route
              path="/kk"
              element={
                <OperatorRoute>
                  <KartuKeluarga />
                </OperatorRoute>
              }
            />

            <Route
              path="/surat"
              element={
                <OperatorRoute>
                  <Surat />
                </OperatorRoute>
              }
            />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>

        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#363636",
              color: "#fff",
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: "#10b981",
                secondary: "#fff",
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: "#ef4444",
                secondary: "#fff",
              },
            },
          }}
        />
      </div>
    </Router>
  );
}

/**
 * App Component dengan AuthProvider
 */
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
