import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PlusIcon, SearchIcon, EyeIcon, ArrowLeftIcon, filterInputStyle, formInputStyle, formLabelStyle, PaginationBar, preventSpaceInput, actionIconBtnStyle } from './InventoryCommon';
import InventoryApi from '../../api/Inventory';
import BranchApi from '../../api/Branch';
import { useAppState } from '../../config/AppContext';
import { isUserCompanyUser, getUserAssignedBranchId } from '../../helper/BranchHelper';

const CheckIcon = ({ size = 15, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const XIcon = ({ size = 15, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const TruckIcon = ({ size = 15, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13"></rect>
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
    <circle cx="5.5" cy="18.5" r="2.5"></circle>
    <circle cx="18.5" cy="18.5" r="2.5"></circle>
  </svg>
);

const InboxIcon = ({ size = 15, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline>
    <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>
  </svg>
);

export default function BranchTransfer({ transfers: initialTransfers, items: initialItems, onSaveTransfer, hasPermission }) {
  const { currentUser, activeRestaurant, selectedBranchId } = useAppState();

  const canAdd = typeof hasPermission === 'function' ? hasPermission('inventory_branch_transfer', 'add') : true;
  const canView = typeof hasPermission === 'function' ? hasPermission('inventory_branch_transfer', 'view') : true;
  const canEdit = typeof hasPermission === 'function' ? hasPermission('inventory_branch_transfer', 'edit') : true;

  const [liveBranches, setLiveBranches] = useState([]);

  useEffect(() => {
    const loadBranches = async () => {
      try {
        const res = await BranchApi.getBranches({ limit: 100 });
        if (res?.status && res?.response) {
          const list = Array.isArray(res.response)
            ? res.response
            : (Array.isArray(res.response.data) ? res.response.data : (Array.isArray(res.response.branches) ? res.response.branches : []));
          if (list.length > 0) setLiveBranches(list);
        }
      } catch (e) {}
    };
    loadBranches();
  }, []);

  const allBranches = useMemo(() => {
    return (liveBranches && liveBranches.length > 0) ? liveBranches : (activeRestaurant?.branches || []);
  }, [liveBranches, activeRestaurant?.branches]);

  const mainRestaurantName = activeRestaurant?.name || activeRestaurant?.restaurantName || activeRestaurant?.businessName || 'Main Branch';
  const isCompanyUser = isUserCompanyUser(currentUser);
  const userAssignedBranchId = getUserAssignedBranchId(currentUser);
  const isCompanyScope = !selectedBranchId || selectedBranchId === 'ALL' || selectedBranchId === 'All' || String(selectedBranchId).toUpperCase() === 'COMPANY';
  const isCompanyFilter = isCompanyUser && isCompanyScope;

  const loginRestaurantName = useMemo(() => {
    if (userAssignedBranchId) {
      const bObj = allBranches.find(b =>
        String(b._id || b.id) === String(userAssignedBranchId) ||
        String(b.branchCode) === String(userAssignedBranchId)
      );
      if (bObj) return bObj.branchName || bObj.name || mainRestaurantName;
    }
    if (selectedBranchId && selectedBranchId !== 'ALL' && selectedBranchId !== 'All' && String(selectedBranchId).toUpperCase() !== 'COMPANY') {
      const bObj = allBranches.find(b =>
        String(b._id || b.id) === String(selectedBranchId) ||
        String(b.branchCode) === String(selectedBranchId)
      );
      if (bObj) return bObj.branchName || bObj.name || mainRestaurantName;
    }
    return currentUser?.branchName || mainRestaurantName;
  }, [userAssignedBranchId, selectedBranchId, allBranches, currentUser?.branchName, mainRestaurantName]);

  const availableBranches = useMemo(() => {
    const names = allBranches.map(b => b.branchName || b.name).filter(Boolean);
    if (names.length === 0) {
      return [mainRestaurantName, 'Serviq Chennai Branch', 'Serviq Madurai Branch', 'Serviq Coimbatore Outlet', 'Serviq Trichy Branch'];
    }
    if (!names.includes(mainRestaurantName)) {
      return [mainRestaurantName, ...names];
    }
    return names;
  }, [allBranches, mainRestaurantName]);

  const [transfersList, setTransfersList] = useState(initialTransfers || []);
  const [itemsList, setItemsList] = useState(initialItems || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);

  // View States: null | 'ADD' | 'VIEW_DETAIL'
  const [viewState, setViewState] = useState(null);
  const [selectedTransfer, setSelectedTransfer] = useState(null);

  useEffect(() => {
    if (initialTransfers && initialTransfers.length > 0) {
      setTransfersList(initialTransfers);
    }
  }, [initialTransfers]);

  // Form state
  const [trfForm, setTrfForm] = useState({
    fromBranch: loginRestaurantName,
    toBranch: '',
    item: '',
    quantity: '',
    unit: 'kg',
    remarks: ''
  });
  const [trfErrors, setTrfErrors] = useState({});

  useEffect(() => {
    if (!isCompanyFilter) {
      setTrfForm(prev => {
        const dest = (prev.toBranch && prev.toBranch !== loginRestaurantName)
          ? prev.toBranch
          : (availableBranches.find(b => b !== loginRestaurantName) || '');
        return {
          ...prev,
          fromBranch: loginRestaurantName,
          toBranch: dest
        };
      });
    } else {
      setTrfForm(prev => {
        const currentFrom = prev.fromBranch || availableBranches[0] || loginRestaurantName;
        const currentTo = (prev.toBranch && prev.toBranch !== currentFrom)
          ? prev.toBranch
          : (availableBranches.find(b => b !== currentFrom) || '');
        return {
          ...prev,
          fromBranch: currentFrom,
          toBranch: currentTo
        };
      });
    }
  }, [isCompanyFilter, loginRestaurantName, availableBranches]);

  const fetchItems = useCallback(async () => {
    try {
      const res = await InventoryApi.getItems({ limit: 100 });
      if (res?.status && res?.response) {
        const rawItems = res.response.data || res.response.items || (Array.isArray(res.response) ? res.response : []);
        if (Array.isArray(rawItems) && rawItems.length > 0) {
          const formatted = rawItems.map(i => ({
            id: i._id || i.id || i.name,
            name: i.name || i.itemName || i.item || '',
            unit: i.unit || i.unitOfMeasurement || 'kg'
          })).filter(i => Boolean(i.name));

          setItemsList(formatted);
          if (formatted.length > 0) {
            setTrfForm(prev => ({
              ...prev,
              item: prev.item || formatted[0].name,
              unit: prev.item ? prev.unit : (formatted[0].unit || 'kg')
            }));
          }
        }
      }
    } catch (err) {
      console.warn('Branch transfer items load error:', err);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const displayItems = itemsList.length > 0 ? itemsList : (initialItems || []);

  const handleItemSelect = (itemName) => {
    const matched = displayItems.find(i => (typeof i === 'string' ? i : (i.name || i.itemName)) === itemName);
    const unit = typeof matched === 'object' && matched ? (matched.unit || matched.unitOfMeasurement || 'kg') : 'kg';
    setTrfForm(prev => ({
      ...prev,
      item: itemName,
      unit: unit
    }));
  };

  const handleUpdateStatus = (id, newStatus) => {
    setTransfersList(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    if (selectedTransfer && selectedTransfer.id === id) {
      setSelectedTransfer(prev => ({ ...prev, status: newStatus }));
    }
  };

  const filteredTransfers = transfersList.filter(t => {
    return !searchTerm.trim() ||
      (t.transferNo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.item || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.fromBranch || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.toBranch || '').toLowerCase().includes(searchTerm.toLowerCase());
  });

  const PAGE_SIZE = 10;
  const totalPages = Math.max(1, Math.ceil(filteredTransfers.length / PAGE_SIZE));

  useEffect(() => {
    if (currentPage >= totalPages && totalPages > 0) {
      setCurrentPage(Math.max(0, totalPages - 1));
    }
  }, [totalPages, currentPage]);

  const paginatedTransfers = filteredTransfers.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  const validate = () => {
    const errors = {};
    const effectiveFromBranch = isCompanyFilter ? trfForm.fromBranch : loginRestaurantName;
    if (!effectiveFromBranch || !effectiveFromBranch.trim()) errors.fromBranch = 'From Branch is required';
    if (!trfForm.item) errors.item = 'Item selection is required';
    if (!trfForm.quantity || Number(trfForm.quantity) <= 0) errors.quantity = 'Valid Required Quantity is required';
    if (effectiveFromBranch === trfForm.toBranch) errors.toBranch = 'Destination Branch must be different from Source Branch';
    setTrfErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const effectiveFromBranch = isCompanyFilter ? trfForm.fromBranch : loginRestaurantName;
    const newTrf = {
      id: `TRF-${Date.now().toString().slice(-4)}`,
      transferNo: `TRF-2026-${Date.now().toString().slice(-3)}`,
      date: new Date().toISOString().split('T')[0],
      ...trfForm,
      fromBranch: effectiveFromBranch,
      quantity: Number(trfForm.quantity),
      status: 'Pending'
    };
    setTransfersList(prev => [newTrf, ...prev]);
    if (onSaveTransfer) onSaveTransfer(newTrf);
    setViewState(null);
  };

  // Render View Transfer Detail Page View
  if (viewState === 'VIEW_DETAIL' && selectedTransfer) {
    return (
      <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '32px 40px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', paddingBottom: '20px', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              type="button"
              onClick={() => setViewState(null)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#0f172a',
                fontSize: '16px',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              ←
            </button>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>
              Transfer Request Details: {selectedTransfer.transferNo}
            </h2>
          </div>

          <span style={{
            padding: '6px 16px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 800,
            background: selectedTransfer.status === 'Completed' || selectedTransfer.status === 'Received' ? '#e6f4ea' : selectedTransfer.status === 'Rejected' ? '#fee2e2' : '#fef3c7',
            color: selectedTransfer.status === 'Completed' || selectedTransfer.status === 'Received' ? '#16a34a' : selectedTransfer.status === 'Rejected' ? '#dc2626' : '#d97706'
          }}>
            {selectedTransfer.status || 'Pending'}
          </span>
        </div>

        <div style={{ background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '28px', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', fontSize: '14px', marginBottom: '24px' }}>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '12px', marginBottom: '4px' }}>Transfer No.</span>
              <strong style={{ color: '#0f172a', fontSize: '16px' }}>{selectedTransfer.transferNo}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '12px', marginBottom: '4px' }}>Request Date</span>
              <span style={{ color: '#0f172a', fontWeight: 600 }}>{selectedTransfer.date}</span>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '12px', marginBottom: '4px' }}>From Branch</span>
              <strong style={{ color: '#0f172a', fontSize: '15px' }}>{selectedTransfer.fromBranch}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '12px', marginBottom: '4px' }}>To Branch</span>
              <strong style={{ color: '#ff5a1f', fontSize: '15px' }}>{selectedTransfer.toBranch}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '12px', marginBottom: '4px' }}>Item</span>
              <span style={{ color: '#0f172a', fontWeight: 800 }}>{selectedTransfer.item}</span>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '12px', marginBottom: '4px' }}>Quantity</span>
              <span style={{ color: '#ff5a1f', fontWeight: 700 }}>{selectedTransfer.quantity} {selectedTransfer.unit}</span>
            </div>
          </div>

          <div style={{ paddingTop: '20px', borderTop: '1px solid #cbd5e1' }}>
            <span style={{ color: '#64748b', display: 'block', fontSize: '12px', marginBottom: '6px', fontWeight: 700 }}>Reason / Remarks</span>
            <p style={{ margin: 0, fontSize: '14px', color: '#0f172a', background: '#ffffff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              {selectedTransfer.remarks || 'No remarks provided.'}
            </p>
          </div>

          {/* Action Buttons: 165. View, 166. Approve, 167. Reject, 168. Dispatch, 169. Receive */}
          {canEdit && (
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #cbd5e1' }}>
            {selectedTransfer.status === 'Pending' && (
              <>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedTransfer.id, 'Approved')}
                  style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '8px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedTransfer.id, 'Rejected')}
                  style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', padding: '8px 18px', borderRadius: '8px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
                >
                  Reject
                </button>
              </>
            )}
            {selectedTransfer.status === 'Approved' && (
              <button
                type="button"
                onClick={() => handleUpdateStatus(selectedTransfer.id, 'Dispatched')}
                style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '8px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
              >
                Dispatch
              </button>
            )}
            {selectedTransfer.status === 'Dispatched' && (
              <button
                type="button"
                onClick={() => handleUpdateStatus(selectedTransfer.id, 'Received')}
                style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '8px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
              >
                Receive
              </button>
            )}
          </div>
          )}
        </div>
      </div>
    );
  }

  // Render Add Transfer Request Page View
  if (viewState === 'ADD') {
    return (
      <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '32px 40px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', paddingBottom: '20px', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              type="button"
              onClick={() => setViewState(null)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#0f172a',
                fontSize: '16px',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              ←
            </button>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>
              Initiate Inter-Branch Transfer Request
            </h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          {/* Row 1: From Branch & To Branch */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={formLabelStyle}>
                From Branch <span style={{ color: '#ef4444' }}>*</span>
              </label>
              {isCompanyFilter ? (
                <select
                  value={trfForm.fromBranch}
                  onChange={e => {
                    const newFrom = e.target.value;
                    setTrfForm(prev => {
                      const nextTo = prev.toBranch === newFrom
                        ? (availableBranches.find(b => b !== newFrom) || '')
                        : prev.toBranch;
                      return { ...prev, fromBranch: newFrom, toBranch: nextTo };
                    });
                  }}
                  style={{ ...formInputStyle, borderColor: trfErrors.fromBranch ? '#ef4444' : '#cbd5e1' }}
                >
                  {availableBranches.map(br => (
                    <option key={br} value={br}>{br}</option>
                  ))}
                </select>
              ) : (
                <>
                  <input
                    type="text"
                    value={loginRestaurantName}
                    readOnly
                    disabled
                    style={{
                      ...formInputStyle,
                      background: '#f8fafc',
                      color: '#475569',
                      cursor: 'not-allowed',
                      borderColor: '#cbd5e1',
                      fontWeight: 600
                    }}
                    title="From Branch is locked to your login restaurant / branch"
                  />
                  <span style={{ color: '#64748b', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                    Locked to your login restaurant / branch
                  </span>
                </>
              )}
              {trfErrors.fromBranch && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', display: 'block', fontWeight: 600 }}>{trfErrors.fromBranch}</span>}
            </div>

            <div>
              <label style={formLabelStyle}>
                To Branch (Destination) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={trfForm.toBranch}
                onChange={e => setTrfForm({ ...trfForm, toBranch: e.target.value })}
                style={{ ...formInputStyle, borderColor: trfErrors.toBranch ? '#ef4444' : '#cbd5e1' }}
              >
                <option value="">-- Select Destination Branch --</option>
                {availableBranches
                  .filter(br => br !== (isCompanyFilter ? trfForm.fromBranch : loginRestaurantName))
                  .map(br => (
                    <option key={br} value={br}>{br}</option>
                  ))}
              </select>
              {trfErrors.toBranch && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', display: 'block', fontWeight: 600 }}>{trfErrors.toBranch}</span>}
            </div>
          </div>

          {/* Row 2: Item Name & Required Quantity */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={formLabelStyle}>
                Item Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={trfForm.item}
                onChange={e => handleItemSelect(e.target.value)}
                style={{ ...formInputStyle, borderColor: trfErrors.item ? '#ef4444' : '#cbd5e1' }}
              >
                <option value="">-- Select Item --</option>
                {displayItems.map((i, idx) => {
                  const itemName = typeof i === 'string' ? i : (i.name || i.itemName || '');
                  const keyVal = typeof i === 'string' ? `${i}-${idx}` : (i.id || i._id || itemName || idx);
                  if (!itemName) return null;
                  return (
                    <option key={keyVal} value={itemName}>{itemName}</option>
                  );
                })}
              </select>
              {trfErrors.item && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', display: 'block', fontWeight: 600 }}>{trfErrors.item}</span>}
            </div>

            <div>
              <label style={formLabelStyle}>
                Required Quantity <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="number"
                placeholder="e.g. 20"
                value={trfForm.quantity}
                onChange={e => setTrfForm({ ...trfForm, quantity: e.target.value })}
                style={{ ...formInputStyle, borderColor: trfErrors.quantity ? '#ef4444' : '#cbd5e1' }}
              />
              {trfErrors.quantity && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', display: 'block', fontWeight: 600 }}>{trfErrors.quantity}</span>}
            </div>
          </div>

          {/* Row 3: Unit */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={formLabelStyle}>
                Unit
              </label>
              <select
                value={trfForm.unit}
                onChange={e => setTrfForm({ ...trfForm, unit: e.target.value })}
                style={{ ...formInputStyle }}
              >
                <option value="kg">kg (Kilogram)</option>
                <option value="Ltr">Ltr (Liter)</option>
                <option value="g">g (Gram)</option>
                <option value="pcs">pcs (Pieces)</option>
                <option value="pkt">pkt (Packets)</option>
                <option value="box">box (Boxes)</option>
              </select>
            </div>
            <div></div>
          </div>

          {/* Row 3: Reason / Remarks */}
          <div style={{ marginBottom: '32px' }}>
            <label style={formLabelStyle}>
              Reason / Remarks
            </label>
            <textarea
              rows="3"
              placeholder="e.g. Urgent stock transfer needed for evening catering event"
              value={trfForm.remarks}
              onChange={e => setTrfForm({ ...trfForm, remarks: e.target.value })}
              style={{ ...formInputStyle, height: 'auto', padding: '12px 16px' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '14px', paddingTop: '24px', borderTop: '1px solid #f1f5f9' }}>
            <button
              type="button"
              onClick={() => setViewState(null)}
              style={{
                background: '#ffffff',
                color: '#0f172a',
                border: '1px solid #cbd5e1',
                padding: '12px 28px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                background: '#ff5a1f',
                color: '#ffffff',
                border: 'none',
                padding: '12px 32px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(255, 90, 31, 0.25)'
              }}
            >
              Submit Transfer Request
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Render Branch Transfer Table View
  return (
    <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ position: 'relative', width: '260px' }}>
          <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}>
            <SearchIcon size={14} />
          </span>
          <input
            type="text"
            placeholder="Search transfer requests..."
            value={searchTerm}
            onKeyDown={preventSpaceInput}
            onChange={e => { setSearchTerm(e.target.value.replace(/\s/g, '')); setCurrentPage(0); }}
            style={{ ...filterInputStyle, paddingLeft: '32px' }}
          />
        </div>

        {canAdd && (
        <button
          type="button"
          onClick={() => { setViewState('ADD'); setTrfErrors({}); }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#ff5a1f',
            color: '#ffffff',
            border: 'none',
            padding: '10px 18px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(255, 90, 31, 0.25)'
          }}
        >
          <PlusIcon size={15} />
          <span>New Transfer Request</span>
        </button>
        )}
      </div>

      <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', paddingBottom: '4px' }}>
        <table style={{ width: '100%', minWidth: '950px', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f95e10', color: '#ffffff' }}>
              <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap' }}>S.No</th>
              <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap' }}>Transfer No.</th>
              <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap' }}>From Branch</th>
              <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap' }}>To Branch</th>
              <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap' }}>Request Date</th>
              <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap' }}>Item</th>
              <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap' }}>Quantity</th>
              <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap' }}>Status</th>
              <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTransfers.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                  No branch transfer records found.
                </td>
              </tr>
            ) : (
              paginatedTransfers.map((t, index) => (
                <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: '#64748b' }}>
                    {currentPage * PAGE_SIZE + index + 1}
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: 800, color: '#0f172a' }}>{t.transferNo}</td>
                  <td style={{ padding: '14px 16px', fontWeight: 600, color: '#0f172a' }}>{t.fromBranch}</td>
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: '#ff5a1f' }}>{t.toBranch}</td>
                  <td style={{ padding: '14px 16px', color: '#64748b' }}>{t.date}</td>
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0f172a' }}>{t.item}</td>
                  <td style={{ padding: '14px 16px', color: '#0f172a' }}>{t.quantity} {t.unit}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      padding: '3px 10px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 700,
                      background: t.status === 'Completed' || t.status === 'Received' ? '#e6f4ea' : t.status === 'Rejected' ? '#fee2e2' : '#fef3c7',
                      color: t.status === 'Completed' || t.status === 'Received' ? '#16a34a' : t.status === 'Rejected' ? '#dc2626' : '#d97706'
                    }}>
                      {t.status || 'Pending'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      {canView && (
                      <button
                        type="button"
                        onClick={() => { setSelectedTransfer(t); setViewState('VIEW_DETAIL'); }}
                        title="View Transfer Details"
                        style={{
                          ...actionIconBtnStyle,
                          background: '#eff6ff',
                          border: '1px solid #bfdbfe',
                          color: '#2563eb'
                        }}
                      >
                        <EyeIcon size={15} color="#2563eb" />
                      </button>
                      )}

                      {canEdit && t.status === 'Pending' && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(t.id, 'Approved')}
                            title="Approve Transfer"
                            style={{
                              ...actionIconBtnStyle,
                              background: '#f0fdf4',
                              border: '1px solid #86efac',
                              color: '#16a34a'
                            }}
                          >
                            <CheckIcon size={15} color="#16a34a" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(t.id, 'Rejected')}
                            title="Reject Transfer"
                            style={{
                              ...actionIconBtnStyle,
                              background: '#fef2f2',
                              border: '1px solid #fca5a5',
                              color: '#dc2626'
                            }}
                          >
                            <XIcon size={15} color="#dc2626" />
                          </button>
                        </>
                      )}

                      {canEdit && t.status === 'Approved' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(t.id, 'Dispatched')}
                          title="Dispatch Transfer"
                          style={{
                            ...actionIconBtnStyle,
                            background: '#eff6ff',
                            border: '1px solid #93c5fd',
                            color: '#2563eb'
                          }}
                        >
                          <TruckIcon size={15} color="#2563eb" />
                        </button>
                      )}

                      {canEdit && t.status === 'Dispatched' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(t.id, 'Received')}
                          title="Receive Transfer"
                          style={{
                            ...actionIconBtnStyle,
                            background: '#f0fdf4',
                            border: '1px solid #86efac',
                            color: '#16a34a'
                          }}
                        >
                          <InboxIcon size={15} color="#16a34a" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <PaginationBar
        currentPage={currentPage}
        totalItems={filteredTransfers.length}
        pageSize={PAGE_SIZE}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
