import React, { useState, useRef, useEffect } from 'react';
import { useAppState } from '../config/AppContext';

const StoreFrontIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const SearchIcon = ({ size = 14, color = '#94a3b8' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const ChevronDownIcon = ({ size = 12, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const CheckIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ClearIcon = ({ size = 12, color = '#94a3b8' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export default function BranchSearchDropdown() {
  const { activeRestaurant, selectedBranchId, setSelectedBranchId } = useAppState();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  const branches = activeRestaurant?.branches || [];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedBranch = branches.find(b => b.id === selectedBranchId);

  const filteredBranches = branches.filter(b => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      (b.branchName && b.branchName.toLowerCase().includes(query)) ||
      (b.branchCode && b.branchCode.toLowerCase().includes(query)) ||
      (b.city && b.city.toLowerCase().includes(query)) ||
      (b.state && b.state.toLowerCase().includes(query))
    );
  });

  const handleSelectBranch = (branchId) => {
    setSelectedBranchId(branchId);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="branch-search-container" ref={dropdownRef}>
      {/* TRIGGER BUTTON */}
      <button
        type="button"
        className={`branch-search-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Filter modules by branch"
      >
        <div className="branch-search-trigger-content">
          <StoreFrontIcon size={16} color={selectedBranchId ? 'var(--primary)' : '#64748b'} />
          <div className="branch-search-trigger-text">
            <span className="branch-search-label">Branch Filter</span>
            <span className="branch-search-value">
              {selectedBranch ? selectedBranch.branchName : 'All Branches'}
            </span>
          </div>
        </div>
        <ChevronDownIcon size={12} color="#94a3b8" />
      </button>

      {/* DROPDOWN POPUP */}
      {isOpen && (
        <div className="branch-search-popup">
          {/* SEARCH INPUT */}
          <div className="branch-search-input-wrapper">
            <SearchIcon size={14} color="#94a3b8" />
            <input
              type="text"
              className="branch-search-input"
              placeholder="Search branch by name, code or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                className="branch-search-clear-btn"
                onClick={() => setSearchQuery('')}
              >
                <ClearIcon size={12} color="#94a3b8" />
              </button>
            )}
          </div>

          {/* OPTIONS LIST */}
          <div className="branch-search-options-list">
            {/* ALL BRANCHES OPTION */}
            {(!searchQuery || 'all branches'.includes(searchQuery.toLowerCase())) && (
              <div
                className={`branch-search-option ${selectedBranchId === null ? 'selected' : ''}`}
                onClick={() => handleSelectBranch(null)}
              >
                <div className="branch-option-info">
                  <span className="branch-option-name">All Branches</span>
                  <span className="branch-option-subtext">Show aggregated data across all locations</span>
                </div>
                {selectedBranchId === null && <CheckIcon size={14} color="var(--primary)" />}
              </div>
            )}

            {/* INDIVIDUAL BRANCHES */}
            {filteredBranches.length > 0 ? (
              filteredBranches.map((branch) => {
                const isSelected = selectedBranchId === branch.id;
                return (
                  <div
                    key={branch.id}
                    className={`branch-search-option ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelectBranch(branch.id)}
                  >
                    <div className="branch-option-info">
                      <div className="branch-option-title-row">
                        <span className="branch-option-name">{branch.branchName}</span>
                        {branch.branchCode && (
                          <span className="branch-option-code">{branch.branchCode}</span>
                        )}
                      </div>
                      <span className="branch-option-subtext">
                        {branch.city ? `${branch.city}, ${branch.state || ''}` : branch.address || 'Active Branch'} • {branch.totalTables || 10} Tables
                      </span>
                    </div>
                    {isSelected && <CheckIcon size={14} color="var(--primary)" />}
                  </div>
                );
              })
            ) : (
              <div className="branch-search-no-results">
                No branches match "{searchQuery}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
