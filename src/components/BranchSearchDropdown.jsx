import React, { useState, useRef, useEffect } from 'react';
import { useAppState } from '../config/AppContext';
import BranchApi from '../api/Branch.js';
import UserApi from '../api/User.js';
import { 
  resolveBranchManagerName, 
  resolveBranchContactNumber,
  isUserCompanyUser,
  getUserAssignedBranchId,
  isSubBranchUser
} from '../helper/BranchHelper.js';

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

const BuildingIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
    <path d="M9 22v-4h6v4"></path>
    <line x1="8" y1="6" x2="10" y2="6"></line>
    <line x1="14" y1="6" x2="16" y2="6"></line>
    <line x1="8" y1="10" x2="10" y2="10"></line>
    <line x1="14" y1="10" x2="16" y2="10"></line>
    <line x1="8" y1="14" x2="10" y2="14"></line>
    <line x1="14" y1="14" x2="16" y2="14"></line>
  </svg>
);

export default function BranchSearchDropdown() {
  const { activeRestaurant, currentUser, selectedBranchId, setSelectedBranchId, fetchBranches: contextFetchBranches } = useAppState();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  // Load branches via AppContext if not already available
  const loadBranches = async () => {
    try {
      if (typeof contextFetchBranches === 'function') {
        contextFetchBranches({ limit: 10 });
      }
    } catch (e) {
      console.warn("Branch fetch error in dropdown:", e);
    }
  };

  // Only trigger fetch on mount if branches are not yet loaded in context
  useEffect(() => {
    if (!activeRestaurant?.branches || activeRestaurant.branches.length === 0) {
      loadBranches();
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadBranches();
    }
  }, [isOpen]);

  const rawBranches = activeRestaurant?.branches || [];

  const branches = rawBranches.map(b => ({
    ...b,
    id: b._id || b.id,
    _id: b._id || b.id,
    branchName: b.branchName || b.name,
    branchCode: b.branchCode || b.code
  }));
  
  // Hierarchy check using centralized BranchHelper helpers
  const isCompanyUser = isUserCompanyUser(currentUser);
  const userBranchId = getUserAssignedBranchId(currentUser);
  const isBranchLocked = !isCompanyUser;

  // Automatically lock branch ONLY if user is a sub-branch user
  useEffect(() => {
    if (isBranchLocked && userBranchId && selectedBranchId !== userBranchId) {
      setSelectedBranchId(userBranchId);
    }
  }, [isBranchLocked, userBranchId, selectedBranchId, setSelectedBranchId]);

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

  const isAllBranchesSelected = !selectedBranchId || selectedBranchId === 'COMPANY' || selectedBranchId === 'ALL' || selectedBranchId === 'All' || String(selectedBranchId).toLowerCase() === 'all branches';

  const selectedBranch = isAllBranchesSelected
    ? (isCompanyUser ? { branchName: 'All Branches', name: 'All Branches' } : null)
    : branches.find(b => 
        String(b.id || b._id) === String(selectedBranchId) || 
        String(b.branchCode) === String(selectedBranchId) ||
        String(b.branchName || b.name || '').toLowerCase() === String(selectedBranchId).toLowerCase()
      );

  const assignedBranchObj = isBranchLocked
    ? (branches.find(b => String(b.id || b._id) === String(userBranchId) || String(b.branchCode) === String(userBranchId)) ||
       (currentUser?.branch && typeof currentUser.branch === 'object' ? currentUser.branch : null))
    : null;
  const assignedBranchName = assignedBranchObj
    ? (assignedBranchObj.branchName || assignedBranchObj.name || assignedBranchObj.branchCode)
    : (currentUser?.branchName || (userBranchId ? `Branch (${userBranchId})` : 'Assigned Branch'));

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
    if ((branchId === 'COMPANY' || branchId === 'ALL' || String(branchId).toLowerCase() === 'all branches') && !isCompanyUser) return;
    setSelectedBranchId(branchId);
    try {
      if (branchId) {
        sessionStorage.setItem('selectedBranchId', String(branchId));
      } else {
        sessionStorage.setItem('selectedBranchId', '');
      }
    } catch (e) {}
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
        title={isBranchLocked ? `Branch selection is disabled for your account (Locked to ${assignedBranchName})` : "Filter modules by branch"}
        style={isBranchLocked ? { cursor: 'not-allowed', opacity: 0.85, background: '#f8fafc', borderColor: '#e2e8f0' } : {}}
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
            {isCompanyUser && isAllBranchesSelected ? (
              <BuildingIcon size={15} color="var(--primary)" />
            ) : (
              <StoreFrontIcon size={15} color={isBranchLocked ? '#64748b' : (selectedBranchId ? 'var(--primary)' : '#64748b')} />
            )}
          </div>
          <div className="branch-search-trigger-text">
            <span className="branch-search-label">
              {isBranchLocked ? 'Assigned Branch' : 'Branch Filter'}
            </span>
            <span className="branch-search-value">
              {isBranchLocked 
                ? assignedBranchName 
                : (isAllBranchesSelected ? 'All Branches' : (selectedBranch ? (selectedBranch.branchName || selectedBranch.name) : 'All Branches'))}
            </span>
          </div>
        </div>
        {isBranchLocked ? (
          <div title="Branch locked to assigned branch" style={{ display: 'flex', alignItems: 'center', marginLeft: '4px' }}>
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
            {/* 1. ALL BRANCHES OPTION - STRICTLY FOR COMPANY USERS ONLY */}
            {isCompanyUser && (!searchQuery || 
              'all branches'.includes(searchQuery.toLowerCase()) || 
              'all'.includes(searchQuery.toLowerCase()) || 
              'company'.includes(searchQuery.toLowerCase()) || 
              'corporate'.includes(searchQuery.toLowerCase())
            ) && (
              <div
                className={`branch-search-option ${isAllBranchesSelected ? 'selected' : ''}`}
                onClick={() => handleSelectBranch('COMPANY')}
              >
                <div className="branch-option-left-icon">
                  <BuildingIcon size={16} color={isAllBranchesSelected ? 'var(--primary)' : '#64748b'} />
                </div>
                <div className="branch-option-info">
                  <div className="branch-option-title-row">
                    <span className="branch-option-name">All Branches</span>
                    <span className="branch-badge-total" style={{ background: '#f1f5f9', color: '#475569' }}>COMPANY HQ</span>
                  </div>
                  <span className="branch-option-subtext">Enterprise Company Overview Scope (All Branches)</span>
                </div>
                <div className="branch-option-action">
                  {isAllBranchesSelected && <CheckIcon size={15} color="var(--primary)" />}
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
