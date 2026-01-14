// ============================================
// FILE: AutocompleteSelect.jsx
// ============================================
// 
// DESKRIPSI:
// Component dropdown dengan autocomplete
// Bisa pilih dari list atau ketik sendiri (custom input)
//
// ============================================

import { useState, useRef, useEffect } from 'react';

const AutocompleteSelect = ({
  options = [],
  value,
  onChange,
  placeholder = 'Pilih atau ketik...',
  allowCustom = true,
  className = '',
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const wrapperRef = useRef(null);

  // Filter options berdasarkan search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = options.filter((opt) => {
        const label = opt.label || opt.value || opt;
        return label.toLowerCase().includes(searchTerm.toLowerCase());
      });
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions(options);
    }
  }, [searchTerm, options]);

  // Close dropdown saat klik di luar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get display value
  const getDisplayValue = () => {
    if (!value) return '';
    const selectedOption = options.find((opt) => {
      const optValue = opt.value || opt;
      return optValue === value;
    });
    return selectedOption ? (selectedOption.label || selectedOption.value || selectedOption) : value;
  };

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    setSearchTerm(inputValue);
    setIsOpen(true);

    // Jika allowCustom dan user ketik sesuatu yang tidak ada di list
    if (allowCustom && inputValue) {
      // Biarkan user ketik custom value
      onChange(inputValue);
    }
  };

  const handleInputBlur = () => {
    // Jika allowCustom dan ada value yang diketik, keep it
    if (allowCustom && searchTerm && !options.find((opt) => (opt.value || opt) === searchTerm)) {
      onChange(searchTerm);
    }
  };

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      <div className="relative">
        <input
          type="text"
          value={isOpen ? searchTerm : getDisplayValue()}
          onChange={handleInputChange}
          onFocus={() => {
            setIsOpen(true);
            setSearchTerm(getDisplayValue());
          }}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          required={required}
          className="input w-full pr-10"
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
        >
          <svg
            className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => {
              const optionValue = option.value || option;
              const optionLabel = option.label || option.value || option;
              const isSelected = value === optionValue;

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelect(optionValue)}
                  className={`w-full text-left px-4 py-2 hover:bg-primary-50 transition-colors ${
                    isSelected ? 'bg-primary-100 text-primary-700' : 'text-gray-700'
                  }`}
                >
                  {optionLabel}
                </button>
              );
            })
          ) : (
            <div className="px-4 py-2 text-gray-500 text-sm">
              {allowCustom ? 'Ketik untuk menambah pilihan baru' : 'Tidak ada pilihan'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AutocompleteSelect;

