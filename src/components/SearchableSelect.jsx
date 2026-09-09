import React, { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import Select, { components } from 'react-select';

const CustomMenu = (props) => {
  const { onMenuMouseEnter, onMenuMouseLeave } = props.selectProps || {};
  return (
    <div
      onMouseEnter={onMenuMouseEnter}
      onMouseLeave={onMenuMouseLeave}
    >
      <components.Menu {...props} />
    </div>
  );
};

/**
 * Universal Searchable / Autocomplete Select Box for Serviq Admin Panel
 * Powered by react-select with Serviq brand styling, viewport collision detection,
 * and modal-safe portal rendering so menus never jump off-screen.
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
  const containerRef = useRef(null);
  const selectRef = useRef(null);
  const timeoutRef = useRef(null);
  const [dynamicPlacement, setDynamicPlacement] = useState('bottom');
  const [dynamicMaxHeight, setDynamicMaxHeight] = useState(220);

  const handleMouseEnter = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (selectRef.current) {
        selectRef.current.blur();
      }
    }, 250);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Calculate available space in viewport to prevent dropdown from jumping off screen
  const updatePlacementAndHeight = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight || (typeof document !== 'undefined' ? document.documentElement.clientHeight : 800);
    const spaceBelow = viewportHeight - rect.bottom - 16;
    const spaceAbove = rect.top - 16;

    // If space below is cramped (< 230px) and there's more space above, open upwards
    const shouldPlaceTop = spaceBelow < 230 && spaceAbove > spaceBelow;
    const chosenPlacement = shouldPlaceTop ? 'top' : 'bottom';
    const availableSpace = shouldPlaceTop ? spaceAbove : spaceBelow;
    const safeMaxHeight = Math.max(120, Math.min(220, Math.floor(availableSpace) - 20));

    setDynamicPlacement(chosenPlacement);
    setDynamicMaxHeight(safeMaxHeight);
  }, []);

  useEffect(() => {
    updatePlacementAndHeight();
  }, [updatePlacementAndHeight]);

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

  // Custom styles for Serviq design system with responsive bounds
  const customStyles = useMemo(() => ({
    control: (provided, state) => ({
      ...provided,
      minHeight: '40px',
      borderRadius: '10px',
      borderWidth: '1.5px',
      borderColor: (state.selectProps?.menuIsOpen || state.isFocused) ? '#ff5a1f' : '#cbd5e1',
      boxShadow: state.selectProps?.menuIsOpen ? '0 0 0 1px #ff5a1f' : (state.isFocused ? '0 0 0 2px rgba(255, 90, 31, 0.15)' : 'none'),
      backgroundColor: state.isDisabled ? '#f8fafc' : '#ffffff',
      fontSize: '13px',
      fontWeight: '700',
      color: '#0f172a',
      transition: 'all 0.15s ease',
      cursor: state.isDisabled ? 'not-allowed' : 'pointer',
      '&:hover': {
        borderColor: '#ff5a1f'
      },
      ...style
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: '2px 14px'
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#0f172a',
      fontWeight: '700',
      fontSize: '13px'
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#94a3b8',
      fontSize: '13px',
      fontWeight: '600'
    }),
    input: (provided) => ({
      ...provided,
      color: '#0f172a',
      fontSize: '13px',
      fontWeight: '600'
    }),
    menu: (provided) => ({
      ...provided,
      borderRadius: '12px',
      boxShadow: '0 12px 28px -4px rgba(0, 0, 0, 0.14), 0 8px 10px -6px rgba(0, 0, 0, 0.08)',
      border: '1px solid #e2e8f0',
      zIndex: 99999,
      overflow: 'hidden',
      padding: '6px',
      marginTop: '4px',
      marginBottom: '4px',
      backgroundColor: '#ffffff',
      boxSizing: 'border-box'
    }),
    menuPortal: (provided) => ({
      ...provided,
      zIndex: 99999
    }),
    menuList: (provided) => ({
      ...provided,
      padding: '2px',
      maxHeight: `${dynamicMaxHeight}px`,
      overflowY: 'auto',
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
      borderRadius: '8px',
      padding: '10px 14px',
      fontSize: '13px',
      fontWeight: state.isSelected ? '700' : '600',
      backgroundColor: state.isSelected
        ? '#ff5a1f'
        : state.isFocused
        ? '#fff7ed'
        : 'transparent',
      color: state.isSelected
        ? '#ffffff'
        : state.isFocused
        ? '#ea580c'
        : '#334155',
      cursor: 'pointer',
      transition: 'all 0.12s ease',
      marginBottom: '3px',
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
      color: (state.selectProps?.menuIsOpen || state.isFocused) ? '#ff5a1f' : '#ea580c',
      padding: '6px 10px',
      transition: 'all 0.15s ease',
      transform: state.selectProps?.menuIsOpen ? 'rotate(180deg)' : 'none',
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
  }), [style, dynamicMaxHeight]);

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
      onChange(syntheticEvent, selected);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === ' ' && (!e.target?.value || !e.target.value.trim())) {
      e.preventDefault();
    }
    if (rest.onKeyDown) {
      rest.onKeyDown(e);
    }
  };

  const handleInputChange = (inputValue, actionMeta) => {
    if (actionMeta && actionMeta.action === 'input-change') {
      const sanitized = inputValue.replace(/^\s+/, '');
      if (rest.onInputChange) {
        return rest.onInputChange(sanitized, actionMeta);
      }
      return sanitized;
    }
    if (rest.onInputChange) {
      return rest.onInputChange(inputValue, actionMeta);
    }
    return inputValue;
  };

  const effectivePlacement = menuPlacement !== 'auto' ? menuPlacement : dynamicPlacement;

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ width: '100%' }}
    >
      <Select
        ref={selectRef}
        id={id || name}
        name={name}
        options={normalizedOptions}
        value={selectedOption}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onInputChange={handleInputChange}
        onMenuOpen={() => {
          updatePlacementAndHeight();
          if (rest.onMenuOpen) rest.onMenuOpen();
        }}
        onFocus={(e) => {
          updatePlacementAndHeight();
          if (rest.onFocus) rest.onFocus(e);
        }}
        onMenuMouseEnter={handleMouseEnter}
        onMenuMouseLeave={handleMouseLeave}
        components={{
          Menu: CustomMenu,
          ...(rest.components || {})
        }}
        placeholder={placeholder}
        isClearable={isClearable}
        isDisabled={isDisabled}
        isSearchable={isSearchable}
        isMulti={isMulti}
        styles={customStyles}
        menuPlacement={effectivePlacement}
        maxMenuHeight={dynamicMaxHeight}
        menuShouldScrollIntoView={false}
        menuPosition="fixed"
        menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
        noOptionsMessage={noOptionsMessage}
        className={`serviq-searchable-select ${className}`}
        classNamePrefix="serviq-select"
        {...rest}
      />
    </div>
  );
}
