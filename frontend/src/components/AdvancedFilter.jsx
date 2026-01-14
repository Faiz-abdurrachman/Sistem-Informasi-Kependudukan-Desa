// ============================================
// FILE: AdvancedFilter.jsx
// ============================================
// 
// DESKRIPSI:
// Component untuk advanced search & filter dengan multi-kriteria
// 
// ALASAN PAKAI COMPONENT TERPISAH:
// - Reusable di banyak halaman (Penduduk, KK, Surat)
// - Code lebih clean dan maintainable
// - Bisa di-customize per halaman
//
// SYNTAX:
// <AdvancedFilter 
//   filters={filterConfig}
//   onFilterChange={(filters) => {}}
//   onSearch={(search) => {}}
// />
//
// ============================================

import { useState } from 'react';
import AutocompleteSelect from './AutocompleteSelect.jsx';
import {
  agamaOptions,
  pendidikanOptions,
  pekerjaanOptions,
  statusKependudukanOptions,
} from '../data/options.js';

const AdvancedFilter = ({ 
  filters = {}, 
  onFilterChange, 
  onSearch,
  showDateRange = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);
  const [searchTerm, setSearchTerm] = useState('');

  /**
   * Handle perubahan filter
   * ALASAN: Update state lokal dulu, baru trigger callback
   */
  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  /**
   * Handle search input
   * ALASAN: Debounce search untuk performa (bisa ditambah nanti)
   */
  const handleSearch = (value) => {
    setSearchTerm(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  /**
   * Reset semua filter
   * ALASAN: User butuh cara cepat untuk clear filter
   */
  const handleReset = () => {
    const emptyFilters = {};
    setLocalFilters(emptyFilters);
    setSearchTerm('');
    if (onFilterChange) {
      onFilterChange(emptyFilters);
    }
    if (onSearch) {
      onSearch('');
    }
  };

  return (
    <div className="mb-6">
      {/* Search Bar & Toggle Filter */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Cari nama, NIK, atau alamat..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="input w-full"
          />
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="btn btn-secondary"
        >
          {isOpen ? 'Sembunyikan Filter' : 'Filter Lanjutan'}
        </button>
        {(Object.keys(localFilters).length > 0 || searchTerm) && (
          <button
            onClick={handleReset}
            className="btn btn-secondary text-red-600 hover:text-red-700"
          >
            Reset
          </button>
        )}
      </div>

      {/* Advanced Filters Panel */}
      {isOpen && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Filter Agama */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Agama
              </label>
              <AutocompleteSelect
                options={agamaOptions}
                value={localFilters.agama || ''}
                onChange={(value) => handleFilterChange('agama', value || null)}
                placeholder="Semua agama..."
                allowCustom={false}
              />
            </div>

            {/* Filter Pendidikan */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pendidikan
              </label>
              <AutocompleteSelect
                options={pendidikanOptions}
                value={localFilters.pendidikan || ''}
                onChange={(value) => handleFilterChange('pendidikan', value || null)}
                placeholder="Semua pendidikan..."
                allowCustom={false}
              />
            </div>

            {/* Filter Pekerjaan */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pekerjaan
              </label>
              <AutocompleteSelect
                options={pekerjaanOptions}
                value={localFilters.pekerjaan || ''}
                onChange={(value) => handleFilterChange('pekerjaan', value || null)}
                placeholder="Semua pekerjaan..."
                allowCustom={false}
              />
            </div>

            {/* Filter Status Kependudukan */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <AutocompleteSelect
                options={statusKependudukanOptions}
                value={localFilters.statusKependudukan || ''}
                onChange={(value) => handleFilterChange('statusKependudukan', value || null)}
                placeholder="Semua status..."
                allowCustom={false}
              />
            </div>

            {/* Filter RT */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                RT
              </label>
              <input
                type="text"
                value={localFilters.rt || ''}
                onChange={(e) => handleFilterChange('rt', e.target.value || null)}
                placeholder="Semua RT..."
                className="input"
              />
            </div>

            {/* Filter RW */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                RW
              </label>
              <input
                type="text"
                value={localFilters.rw || ''}
                onChange={(e) => handleFilterChange('rw', e.target.value || null)}
                placeholder="Semua RW..."
                className="input"
              />
            </div>

            {/* Filter Jenis Kelamin */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jenis Kelamin
              </label>
              <select
                value={localFilters.jenisKelamin || ''}
                onChange={(e) => handleFilterChange('jenisKelamin', e.target.value || null)}
                className="input"
              >
                <option value="">Semua</option>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>

            {/* Date Range (opsional) */}
            {showDateRange && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Lahir Dari
                  </label>
                  <input
                    type="date"
                    value={localFilters.tanggalLahirDari || ''}
                    onChange={(e) => handleFilterChange('tanggalLahirDari', e.target.value || null)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Lahir Sampai
                  </label>
                  <input
                    type="date"
                    value={localFilters.tanggalLahirSampai || ''}
                    onChange={(e) => handleFilterChange('tanggalLahirSampai', e.target.value || null)}
                    className="input"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedFilter;

