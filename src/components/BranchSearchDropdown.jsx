import React, { useState, useRef, useEffect } from 'react';
import { useAppState } from '../config/AppContext';
import BranchApi from '../api/Branch.js';

const StoreFrontIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const SearchIcon = ({ size = 14, color = '#94a3b8' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const ChevronDownIcon = ({ size = 12, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const CheckIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ClearIcon = ({ size = 12, color = '#94a3b8' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const MapPinIcon = ({ size = 11, color = '#64748b' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const UserIcon = ({ size = 11, color = '#64748b' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const TableIcon = ({ size = 11, color = '#64748b' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M4 6h16" />
    <path d="M5 6v12" />
    <path d="M19 6v12" />
    <path d="M10 6v6" />
    <path d="M14 6v6" />
  </svg>
);

const LockIcon = ({ size = 12, color = '#94a3b8' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);

export default function BranchSearchDropdown() {
  const { activeRestaurant, currentUser, selectedBranchId, setSelectedBranchId, fetchBranches: contextFetchBranches } = useAppState();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [localBranches, setLocalBranches] = useState([]);
  const dropdownRef = useRef(null);

  // Fetch branches from API
  const loadBranches = async () => {
    try {
      if (contextFetchBranches) {
        await contextFetchBranches();
      }
      const res = await BranchApi.getBranches();
      if (res && res.status && res.response) {
        const branchArray = Array.isArray(res.response) 
          ? res.response 
          : (Array.isArray(res.response.data) ? res.response.data : (res.response.branches || []));
        if (Array.isArray(branchArray) && branchArray.length > 0) {
          const mapped = branchArray.map(b => ({
            id: b._id || b.id,
            _id: b._id || b.id,
            branchName: b.branchName || b.name,
            branchCode: b.branchCode || b.code,
            branchManager: b.managerName || b.branchManager || '',
            mobileNumber: b.contactNumber || b.mobileNumber || '',
            email: b.email || '',
            address: b.address?.street || b.address || '',
            city: b.address?.city || b.city || '',
            state: b.address?.state || b.state || '',
            status: b.status || 'Active',
            totalTables: b.totalTables || 10
          }));
          setLocalBranches(mapped);
        }
      }
    } catch (e) {
      console.warn("Branch fetch error in dropdown:", e);
    }
  };

  useEffect(() => {
    loadBranches();
  }, []);

  const rawBranches = (activeRestaurant?.branches && activeRestaurant.branches.length > 0)
    ? activeRestaurant.branches
    : localBranches;

  const branches = rawBranches.map(b => ({
    ...b,
    id: b._id || b.id,
    _id: b._id || b.id,
    branchName: b.branchName || b.name,
    branchCode: b.branchCode || b.code
  }));
  
  // Check if user is Restaurant Owner ONLY
  const roleStr = typeof currentUser?.role === 'object' && currentUser?.role !== null
    ? (currentUser?.role?.roleName || currentUser?.role?.name || '')
    : (typeof currentUser?.role === 'string' ? currentUser.role : '');
  const userTypeStr = typeof currentUser?.userType === 'string' ? currentUser.userType : '';

  const userRole = (roleStr || '').toLowerCase().trim();
  const userType = (userTypeStr || '').toUpperCase().trim();

  // Admin / Restaurant Owner can switch branches freely and default to All Branches (HQ)
  const isAdminOrOwner =
    userType === 'RESTAURANT_OWNER' ||
    userType === 'OWNER' ||
    userType === 'ADMIN' ||
    userType === 'SUPER ADMIN' ||
    userType === 'SUPER_ADMIN' ||
    userRole === 'restaurant_owner' ||
    userRole === 'restaurant owner' ||
    userRole === 'owner' ||
    userRole === 'admin' ||
    userRole === 'super admin';

  const isBranchLocked = !isAdminOrOwner;

  // Automatically lock branch ONLY if user is a branch-scoped staff (non-admin)
  useEffect(() => {
    if (isBranchLocked) {
      const lockId = currentUser?.activeBranchId || (typeof currentUser?.branchId === 'object' ? currentUser?.branchId?._id : currentUser?.branchId);
      if (lockId && lockId !== 'ALL' && selectedBranchId !== lockId) {
        setSelectedBranchId(lockId);
      }
    }
  }, [isBranchLocked, currentUser, selectedBranchId, setSelectedBranchId]);

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

  const selectedBranch = branches.find(b => 
    String(b.id || b._id) === String(selectedBranchId) || 
    String(b.branchCode) === String(selectedBranchId)
  );

  const filteredBranches = branches.filter(b => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      (b.branchName && b.branchName.toLowerCase().includes(query)) ||
      (b.branchCode && b.branchCode.toLowerCase().includes(query)) ||
      (b.city && b.city.toLowerCase().includes(query)) ||
      (b.state && b.state.toLowerCase().includes(query)) ||
      (b.branchManager && b.branchManager.toLowerCase().includes(query))
    );
  });

  const handleSelectBranch = (branchId) => {
    if (isBranchLocked) return;
    setSelectedBranchId(branchId);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="branch-search-container" ref={dropdownRef}>
      {/* TRIGGER BUTTON */}
      <button
        type="button"
        disabled={isBranchLocked}
        className={`branch-search-trigger ${isOpen ? 'active' : ''} ${isBranchLocked ? 'disabled' : ''}`}
        onClick={() => {
          if (!isBranchLocked) {
            setIsOpen(!isOpen);
            if (!isOpen && branches.length === 0) {
              loadBranches();
            }
          }
        }}
        title={isBranchLocked ? `Branch selection is disabled for your role (Locked to ${selectedBranch?.branchName || 'Assigned Branch'})` : "Filter modules by branch"}
        style={isBranchLocked ? { cursor: 'not-allowed', opacity: 0.75, background: '#f8fafc', borderColor: '#e2e8f0' } : {}}
      >
        <div className="branch-search-trigger-content">
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            background: isBranchLocked ? '#f1f5f9' : (selectedBranchId ? 'rgba(255, 122, 0, 0.1)' : '#f1f5f9'),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isBranchLocked ? '#64748b' : (selectedBranchId ? 'var(--primary)' : '#64748b')
          }}>
            <StoreFrontIcon size={15} color={isBranchLocked ? '#64748b' : (selectedBranchId ? 'var(--primary)' : '#64748b')} />
          </div>
          <div className="branch-search-trigger-text">
            <span className="branch-search-label">
              {isBranchLocked ? 'Assigned Branch' : 'Branch Filter'}
            </span>
            <span className="branch-search-value">
              {selectedBranch ? (selectedBranch.branchName || selectedBranch.name) : 'All Branches'}
            </span>
          </div>
        </div>
        {isBranchLocked ? (
          <div title="Branch locked for non-admin" style={{ display: 'flex', alignItems: 'center', marginLeft: '4px' }}>
            <LockIcon size={13} color="#94a3b8" />
          </div>
        ) : (
          <ChevronDownIcon size={12} color="#94a3b8" />
        )}
      </button>

      {/* DROPDOWN POPUP */}
      {isOpen && !isBranchLocked && (
        <div className="branch-search-popup">
          {/* SEARCH INPUT BAR */}
          <div className="branch-search-input-wrapper">
            <SearchIcon size={15} color="#94a3b8" />
            <input
              type="text"
              className="branch-search-input"
              placeholder="Search branch by name, code or city..."
              value={searchQuery}
              onKeyDown={e => {
                if (e.key === ' ' && !e.currentTarget.value) {
                  e.preventDefault();
                }
              }}
              onChange={(e) => {
                const val = e.target.value.replace(/^\s+/, '');
                setSearchQuery(val);
              }}
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                className="branch-search-clear-btn"
                onClick={() => setSearchQuery('')}
                title="Clear search"
              >
                <ClearIcon size={12} color="#94a3b8" />
              </button>
            )}
          </div>

          <div style={{ padding: '8px 14px 4px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.6px', textTransform: 'uppercase' }}>
              Select Location Scope
            </span>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
              {branches.length} Locations
            </span>
          </div>

          {/* OPTIONS LIST */}
          <div className="branch-search-options-list">
            {/* ALL BRANCHES OPTION */}
            {(!searchQuery || 'all branches'.includes(searchQuery.toLowerCase())) && (
              <div
                className={`branch-search-option ${selectedBranchId === null || selectedBranchId === 'ALL' ? 'selected' : ''}`}
                onClick={() => handleSelectBranch(null)}
              >
                <div className="branch-option-left-icon">
                  <StoreFrontIcon size={16} color={selectedBranchId === null || selectedBranchId === 'ALL' ? 'var(--primary)' : '#64748b'} />
                </div>
                <div className="branch-option-info">
                  <div className="branch-option-title-row">
                    <span className="branch-option-name">All Branches (HQ)</span>
                    <span className="branch-badge-total">{branches.length} TOTAL</span>
                  </div>
                  <span className="branch-option-subtext">Aggregated data across all active outlets</span>
                </div>
                <div className="branch-option-action">
                  {(selectedBranchId === null || selectedBranchId === 'ALL') && <CheckIcon size={15} color="var(--primary)" />}
                </div>
              </div>
            )}

            {/* INDIVIDUAL BRANCHES */}
            {filteredBranches.length > 0 ? (
              filteredBranches.map((branch) => {
                const branchId = branch._id || branch.id;
                const isSelected = String(selectedBranchId) === String(branchId) || String(selectedBranchId) === String(branch.branchCode);
                const isActive = branch.status === 'Active';
                return (
                  <div
                    key={branchId}
                    className={`branch-search-option ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelectBranch(branchId)}
                  >
                    <div className="branch-option-left-icon">
                      <StoreFrontIcon size={16} color={isSelected ? 'var(--primary)' : '#64748b'} />
                    </div>
                    <div className="branch-option-info">
                      {/* Top title and badges row */}
                      <div className="branch-option-title-row">
                        <span className="branch-option-name">{branch.branchName || branch.name}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          {branch.branchCode && (
                            <span className="branch-option-code">{branch.branchCode}</span>
                          )}
                          <span className={`branch-status-pill ${isActive ? 'active' : 'inactive'}`}>
                            {branch.status || 'Active'}
                          </span>
                        </div>
                      </div>

                      {/* Bottom meta row */}
                      <div className="branch-option-meta-row">
                        <span className="branch-meta-item">
                          <MapPinIcon size={11} color="#64748b" />
                          <span>{branch.city || 'Tamil Nadu'}</span>
                        </span>
                        {branch.branchManager && (
                          <span className="branch-meta-item">
                            <UserIcon size={11} color="#64748b" />
                            <span>{branch.branchManager}</span>
                          </span>
                        )}
                        <span className="branch-meta-item">
                          <TableIcon size={11} color="#64748b" />
                          <span>{branch.totalTables || 10} Tables</span>
                        </span>
                      </div>
                    </div>
                    
                    <div className="branch-option-action">
                      {isSelected && <CheckIcon size={15} color="var(--primary)" />}
                    </div>
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
