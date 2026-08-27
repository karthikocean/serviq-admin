import React, { useMemo } from 'react';
import Select from 'react-select';

/**
 * Universal Searchable / Autocomplete Select Box for Serviq Admin Panel
 * Powered by react-select with Serviq brand styling and modal-safe portal rendering.
 */
export default function SearchableSelect({
  options = [],
  value,
  onChange,
  placeholder = 'Select option...',
  isClearable = false,
  isDisabled = false,
  isSearchable = true,
  isMulti = false,
  name,
  id,
  style = {},
  className = '',
  menuPlacement = 'auto',
  noOptionsMessage = () => 'No options found',
  ...rest
}) {
  // Normalize options array into [{ value, label }] format
  const normalizedOptions = useMemo(() => {
    if (!Array.isArray(options)) return [];
    return options.map(opt => {
      if (opt === null || opt === undefined) return { value: '', label: '' };
      if (typeof opt === 'string' || typeof opt === 'number') {
        return { value: opt, label: String(opt) };
      }
      if (typeof opt === 'object') {
        const val = opt.value !== undefined ? opt.value : (opt._id || opt.id || opt.name || '');
        const lbl = opt.label !== undefined ? opt.label : (opt.name || opt.title || String(val));
        return { ...opt, value: val, label: lbl };
      }
      return { value: String(opt), label: String(opt) };
    });
  }, [options]);

  // Find currently selected option object
  const selectedOption = useMemo(() => {
    if (value === undefined || value === null || value === '') {
      return isMulti ? [] : null;
    }
    if (isMulti) {
      if (Array.isArray(value)) {
        return normalizedOptions.filter(opt => 
          value.includes(opt.value) || value.some(v => typeof v === 'object' && v.value === opt.value)
        );
      }
      return [];
    }
    if (typeof value === 'object' && value !== null && value.value !== undefined) {
      return normalizedOptions.find(opt => String(opt.value) === String(value.value)) || value;
    }
    return normalizedOptions.find(opt => String(opt.value) === String(value)) || { value, label: String(value) };
  }, [value, normalizedOptions, isMulti]);

  // Custom styles for Serviq design system
  const customStyles = useMemo(() => ({
    control: (provided, state) => ({
      ...provided,
      minHeight: '42px',
      borderRadius: '8px',
      borderColor: state.isFocused ? '#ff5a1f' : '#cbd5e1',
      boxShadow: state.isFocused ? '0 0 0 2px rgba(255, 90, 31, 0.2)' : 'none',
      backgroundColor: state.isDisabled ? '#f8fafc' : '#ffffff',
      fontSize: '13px',
      fontWeight: '600',
      color: '#0f172a',
      transition: 'all 0.15s ease',
      cursor: state.isDisabled ? 'not-allowed' : 'pointer',
      '&:hover': {
        borderColor: state.isFocused ? '#ff5a1f' : '#94a3b8'
      },
      ...style
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: '2px 12px'
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#0f172a',
      fontWeight: '600',
      fontSize: '13px'
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#94a3b8',
      fontSize: '13px',
      fontWeight: '500'
    }),
    input: (provided) => ({
      ...provided,
      color: '#0f172a',
      fontSize: '13px',
      fontWeight: '600'
    }),
    menu: (provided) => ({
      ...provided,
      borderRadius: '10px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06)',
      border: '1px solid #e2e8f0',
      zIndex: 99999,
      overflow: 'hidden',
      padding: '4px'
    }),
    menuPortal: (provided) => ({
      ...provided,
      zIndex: 99999
    }),
    menuList: (provided) => ({
      ...provided,
      padding: '4px',
      maxHeight: '220px',
      '&::-webkit-scrollbar': {
        width: '6px'
      },
      '&::-webkit-scrollbar-thumb': {
        background: '#cbd5e1',
        borderRadius: '4px'
      }
    }),
    option: (provided, state) => ({
      ...provided,
      borderRadius: '6px',
      padding: '8px 12px',
      fontSize: '13px',
      fontWeight: state.isSelected ? '700' : '500',
      backgroundColor: state.isSelected
        ? '#ff5a1f'
        : state.isFocused
        ? '#fff7ed'
        : 'transparent',
      color: state.isSelected
        ? '#ffffff'
        : state.isFocused
        ? '#ea580c'
        : '#1e293b',
      cursor: 'pointer',
      transition: 'all 0.12s ease',
      marginBottom: '2px',
      '&:active': {
        backgroundColor: '#ff5a1f',
        color: '#ffffff'
      }
    }),
    indicatorSeparator: () => ({
      display: 'none'
    }),
    dropdownIndicator: (provided, state) => ({
      ...provided,
      color: state.isFocused ? '#ff5a1f' : '#64748b',
      padding: '6px 8px',
      transition: 'all 0.15s ease',
      transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'none',
      '&:hover': {
        color: '#ff5a1f'
      }
    }),
    clearIndicator: (provided) => ({
      ...provided,
      color: '#94a3b8',
      padding: '6px',
      cursor: 'pointer',
      '&:hover': {
        color: '#ef4444'
      }
    })
  }), [style]);

  // Handle value change supporting both direct string/value or standard event object
  const handleChange = (selected) => {
    if (!onChange) return;
    if (isMulti) {
      const values = Array.isArray(selected) ? selected.map(s => s.value) : [];
      onChange(values, selected);
    } else {
      const val = selected ? selected.value : '';
      const syntheticEvent = {
        target: { name: name || id || '', value: val },
        currentTarget: { name: name || id || '', value: val }
      };
      // Pass synthetic event as 1st arg if needed or value
      onChange(syntheticEvent, selected);
    }
  };

  return (
    <Select
      id={id || name}
      name={name}
      options={normalizedOptions}
      value={selectedOption}
      onChange={handleChange}
      placeholder={placeholder}
      isClearable={isClearable}
      isDisabled={isDisabled}
      isSearchable={isSearchable}
      isMulti={isMulti}
      styles={customStyles}
      menuPlacement={menuPlacement}
      menuPosition="fixed"
      menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
      noOptionsMessage={noOptionsMessage}
      className={`serviq-searchable-select ${className}`}
      classNamePrefix="serviq-select"
      {...rest}
    />
  );
}
