// ============================================
// FILE: Modal.jsx
// ============================================
//
// DESKRIPSI:
// Reusable Modal component
// Untuk form create/edit dan konfirmasi dialog
//
// ============================================

const Modal = ({ isOpen, onClose, title, children, size = "md" }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto animate-fade-in">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900 bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className={`inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-lg transform transition-all sm:my-8 sm:align-middle animate-slide-up ${sizeClasses[size]} w-full`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="border-b border-slate-200 px-6 py-4 flex justify-between items-center bg-white">
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md hover:bg-slate-100"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="bg-white px-6 py-6">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
