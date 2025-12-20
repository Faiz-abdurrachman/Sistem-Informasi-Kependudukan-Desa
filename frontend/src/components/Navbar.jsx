// ============================================
// FILE: Navbar.jsx
// ============================================
//
// DESKRIPSI:
// Navigation bar component
// Menampilkan menu navigasi dan user info
//
// ============================================

import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getRoleDisplayName } from "../utils/roleGuard.js";
import { NavIcon } from "./icons/NavIcon.jsx";

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: "dashboard" },
    {
      path: "/penduduk",
      label: "Penduduk",
      icon: "penduduk",
      roles: ["ADMIN", "OPERATOR"],
    },
    {
      path: "/kk",
      label: "Kartu Keluarga",
      icon: "kk",
      roles: ["ADMIN", "OPERATOR"],
    },
    {
      path: "/surat",
      label: "Surat",
      icon: "surat",
      roles: ["ADMIN", "OPERATOR"],
    },
  ];

  const filteredNavItems = navItems.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(user?.role);
  });

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-slate-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <div className="hidden sm:block">
                <span className="text-lg font-semibold text-slate-900">
                  SIKD
                </span>
                <p className="text-xs text-slate-500">
                  Sistem Informasi Kependudukan Desa
                </p>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {filteredNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? "bg-primary-50 text-primary-700"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <NavIcon type={item.icon} className="w-4 h-4 mr-2" />
                {item.label}
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:block text-right border-r border-slate-200 pr-4">
              <p className="text-sm font-medium text-slate-900">{user?.nama}</p>
              <p className="text-xs text-slate-500">
                {getRoleDisplayName(user?.role)}
              </p>
            </div>
            <button onClick={logout} className="btn btn-sm btn-secondary">
              Keluar
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className="md:hidden border-t border-slate-200 bg-white">
        <div className="px-4 py-2 space-y-1">
          {filteredNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium ${
                isActive(item.path)
                  ? "bg-primary-50 text-primary-700"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <NavIcon type={item.icon} className="w-4 h-4 mr-2" />
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
