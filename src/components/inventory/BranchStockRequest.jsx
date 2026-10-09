import React, { useState, useEffect, useCallback } from 'react';
import { PlusIcon, SearchIcon, EyeIcon, ArrowLeftIcon, filterInputStyle, formInputStyle, formLabelStyle, PaginationBar, preventSpaceInput, actionIconBtnStyle } from './InventoryCommon';
import InventoryApi from '../../api/Inventory';
import { useAppState } from '../../config/AppContext';
import { isBranchMatch } from '../../helper/BranchHelper';

export default function BranchStockRequest({ requests: initialRequests, items: initialItems, onSaveStockRequest, hasPermission }) {
  const { selectedBranchId, activeRestaurant } = useAppState();
  const branches = activeRestaurant?.branches || [];
  const isBranchFiltered = Boolean(selectedBranchId && selectedBranchId !== 'ALL' && selectedBranchId !== 'All' && String(selectedBranchId).toUpperCase() !== 'COMPANY');

  const canAdd = typeof hasPermission === 'function' ? hasPermission('inventory_stock_request', 'add') : true;
  const canView = typeof hasPermission === 'function' ? hasPermission('inventory_stock_request', 'view') : true;
  const [requestsList, setRequestsList] = useState(initialRequests || []);
  const [itemsList, setItemsList] = useState(initialItems || []);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(0);

  // View States: null | 'ADD' | 'VIEW_DETAIL'
  const [viewState, setViewState] = useState(null);
  const [selectedReq, setSelectedReq] = useState(null);

  // Form State
  const [reqForm, setReqForm] = useState({
    item: '',
    reqQty: '',
    unit: 'kg',
    remarks: ''
  });
  const [reqErrors, setReqErrors] = useState({});

  // Fetch Items dynamically
  const fetchItems = useCallback(async () => {
    try {
      const res = await InventoryApi.getItems({ limit: 100, branchId: isBranchFiltered ? selectedBranchId : undefined });
      if (res?.status && res?.response) {
        const rawItems = res.response.data || res.response.items || (Array.isArray(res.response) ? res.response : []);
        if (Array.isArray(rawItems) && rawItems.length > 0) {
          const formatted = rawItems.map(i => ({
            id: i._id || i.id || i.name,
            _id: i._id || i.id || i.name,
            name: i.name || i.itemName || i.item || '',
            unit: i.unit || i.unitOfMeasurement || 'kg'
          })).filter(i => Boolean(i.name));

          setItemsList(formatted);
          if (formatted.length > 0) {
            setReqForm(prev => ({
              ...prev,
              item: prev.item || formatted[0].name,
              unit: prev.item ? prev.unit : (formatted[0].unit || 'kg')
            }));
          }
        }
      }
    } catch (err) {
      console.warn('Branch items load error:', err);
    }
  }, [isBranchFiltered, selectedBranchId]);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await InventoryApi.getStockRequests();
      if (res?.status && res?.response) {
        const rawReqs = res.response.data || res.response || [];
        if (Array.isArray(rawReqs) && rawReqs.length > 0) {
          const formatted = rawReqs.map(r => ({
            id: r._id || r.id,
            _id: r._id || r.id,
            branchId: r.branchId || r.branch?._id || r.branch?.id || r.branch,
            branchName: r.branchName || r.branch || '',
            requestNo: r.requestNo || `BR-REQ-${String(r._id || '').slice(-3).toUpperCase()}`,
            item: r.itemName || (typeof r.itemId === 'object' ? r.itemId?.name : '') || r.item || 'General Material',
            reqQty: r.reqQty || 0,
            unit: r.unit || 'kg',
            date: r.requestDate ? new Date(r.requestDate).toISOString().split('T')[0] : (r.date || new Date().toISOString().split('T')[0]),
            status: r.status || 'Pending',
            remarks: r.remarks || ''
          }));
          setRequestsList(formatted);
        }
      }
    } catch (err) {
      console.warn('Branch stock requests load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
    fetchItems();
  }, [fetchRequests, fetchItems]);

  const displayItems = itemsList.length > 0 ? itemsList : (initialItems || []);

  const handleItemSelect = (itemName) => {
    const matched = displayItems.find(i => (typeof i === 'string' ? i : (i.name || i.itemName)) === itemName);
    const unit = typeof matched === 'object' && matched ? (matched.unit || matched.unitOfMeasurement || 'kg') : 'kg';
    setReqForm(prev => ({
      ...prev,
      item: itemName,
      unit: unit
    }));
  };

  const displayRequests = requestsList.length > 0 ? requestsList : initialRequests;
  const branchScopedRequests = isBranchFiltered
    ? displayRequests.filter(r => isBranchMatch(r, selectedBranchId, branches))
    : displayRequests;

  const filteredRequests = branchScopedRequests.filter(r => {
    const matchesSearch = !searchTerm.trim() ||
      (r.requestNo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.item || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const PAGE_SIZE = 10;
  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / PAGE_SIZE));

  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm, statusFilter, selectedBranchId]);

  useEffect(() => {
    if (currentPage >= totalPages && totalPages > 0) {
      setCurrentPage(Math.max(0, totalPages - 1));
    }
  }, [totalPages, currentPage]);

  const paginatedRequests = filteredRequests.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  const validate = () => {
    const errors = {};
    if (!reqForm.item) errors.item = 'Item selection is required';
    if (!reqForm.reqQty || Number(reqForm.reqQty) <= 0) errors.reqQty = 'Valid Required Quantity is required';
    if (!reqForm.unit.trim()) errors.unit = 'Unit is required';
    setReqErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      const targetBranchId = isBranchFiltered ? selectedBranchId : (branches[0]?._id || branches[0]?.id || undefined);
      const matchedBranch = branches.find(b => String(b._id || b.id) === String(targetBranchId));
      await InventoryApi.createStockRequest({
        ...reqForm,
        branchId: targetBranchId,
        branchName: matchedBranch ? (matchedBranch.branchName || matchedBranch.name) : undefined,
        branch: matchedBranch ? (matchedBranch.branchName || matchedBranch.name) : undefined
      });
      fetchRequests();
    } catch (err) {
      console.warn('Submit stock request error:', err);
    }
    if (onSaveStockRequest) onSaveStockRequest(reqForm);
    setViewState(null);
  };

  // Render View Request Detail Page View
  if (viewState === 'VIEW_DETAIL' && selectedReq) {
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
              Stock Request Details: {selectedReq.requestNo}
            </h2>
          </div>

          <span style={{
            padding: '6px 16px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 800,
            background: selectedReq.status === 'Completed' || selectedReq.status === 'Dispatched' ? '#e6f4ea' : '#fef3c7',
            color: selectedReq.status === 'Completed' || selectedReq.status === 'Dispatched' ? '#16a34a' : '#d97706'
          }}>
            {selectedReq.status || 'Pending'}
          </span>
        </div>

        <div style={{ background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '28px', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', fontSize: '14px', marginBottom: '24px' }}>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '12px', marginBottom: '4px' }}>Request No</span>
              <strong style={{ color: '#0f172a', fontSize: '16px' }}>{selectedReq.requestNo}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '12px', marginBottom: '4px' }}>Request Date</span>
              <span style={{ color: '#0f172a', fontWeight: 600 }}>{selectedReq.date}</span>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '12px', marginBottom: '4px' }}>Item Requested</span>
              <strong style={{ color: '#0f172a', fontSize: '15px' }}>{selectedReq.item}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '12px', marginBottom: '4px' }}>Requested Qty & Unit</span>
              <strong style={{ color: '#ff5a1f', fontSize: '16px' }}>{selectedReq.reqQty} {selectedReq.unit || 'kg'}</strong>
            </div>
          </div>

          <div style={{ paddingTop: '20px', borderTop: '1px solid #cbd5e1' }}>
            <span style={{ color: '#64748b', display: 'block', fontSize: '12px', marginBottom: '6px', fontWeight: 700 }}>Remarks / Justification</span>
            <p style={{ margin: 0, fontSize: '14px', color: '#0f172a', background: '#ffffff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              {selectedReq.remarks || 'No remarks.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Render Add Request Page View
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
              Create Stock Replenishment Request
            </h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          {/* Row 1: Item Name & Required Quantity */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
            <div>
              <label style={formLabelStyle}>
                Item Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={reqForm.item}
                onChange={e => handleItemSelect(e.target.value)}
                style={{ ...formInputStyle, borderColor: reqErrors.item ? '#ef4444' : '#cbd5e1' }}
              >
                <option value="">-- Select Material Item --</option>
                {displayItems.map((i, idx) => {
                  const itemName = typeof i === 'string' ? i : (i.name || i.itemName || '');
                  const keyVal = typeof i === 'string' ? `${i}-${idx}` : (i.id || i._id || itemName || idx);
                  if (!itemName) return null;
                  return (
                    <option key={keyVal} value={itemName}>{itemName}</option>
                  );
                })}
              </select>
            </div>

            <div>
              <label style={formLabelStyle}>
                Required Quantity <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="number"
                placeholder="e.g. 50"
                value={reqForm.reqQty}
                onChange={e => setReqForm({ ...reqForm, reqQty: e.target.value })}
                style={{ ...formInputStyle, borderColor: reqErrors.reqQty ? '#ef4444' : '#cbd5e1' }}
              />
              {reqErrors.reqQty && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', display: 'block', fontWeight: 600 }}>{reqErrors.reqQty}</span>}
            </div>
          </div>

          {/* Row 2: Unit & Reason/Remarks */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
            <div>
              <label style={formLabelStyle}>
                Unit <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={reqForm.unit}
                onChange={e => setReqForm({ ...reqForm, unit: e.target.value })}
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

            <div>
              <label style={formLabelStyle}>
                Reason / Remarks
              </label>
              <input
                type="text"
                placeholder="e.g. Weekend Rush Demand"
                value={reqForm.remarks}
                onChange={e => setReqForm({ ...reqForm, remarks: e.target.value })}
                style={{ ...formInputStyle }}
              />
            </div>
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
              Submit Request to Central HQ
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Render Table / List View
  return (
    <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '220px' }}>
            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}>
              <SearchIcon size={14} />
            </span>
            <input
              type="text"
              placeholder="Search stock requests..."
              value={searchTerm}
              onKeyDown={preventSpaceInput}
              onChange={e => { setSearchTerm(e.target.value.replace(/\s/g, '')); setCurrentPage(0); }}
              style={{ ...filterInputStyle, paddingLeft: '32px' }}
            />
          </div>

          <div style={{ width: '150px' }}>
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setCurrentPage(0); }}
              style={filterInputStyle}
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Dispatched">Dispatched</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        {canAdd && (
        <button
          type="button"
          onClick={() => { setViewState('ADD'); setReqErrors({}); }}
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
          <span>New Stock Request</span>
        </button>
        )}
      </div>

      <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', paddingBottom: '4px' }}>
        <table style={{ width: '100%', minWidth: '950px', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f95e10', color: '#ffffff' }}>
              <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap' }}>S.No</th>
              <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap' }}>Request No.</th>
              <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap' }}>Request Date</th>
              <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap' }}>Item</th>
              <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap' }}>Requested Quantity</th>
              <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap' }}>Unit</th>
              <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap' }}>Status</th>
              <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRequests.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                  No stock request records found.
                </td>
              </tr>
            ) : (
              paginatedRequests.map((r, index) => (
                <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: '#64748b' }}>
                    {currentPage * PAGE_SIZE + index + 1}
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: 800, color: '#0f172a' }}>{r.requestNo}</td>
                  <td style={{ padding: '14px 16px', color: '#64748b' }}>{r.date}</td>
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0f172a' }}>{r.item}</td>
                  <td style={{ padding: '14px 16px', color: '#0f172a', fontWeight: 700 }}>{r.reqQty}</td>
                  <td style={{ padding: '14px 16px', color: '#475569' }}>{r.unit || 'kg'}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      padding: '3px 10px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 700,
                      background: r.status === 'Completed' || r.status === 'Dispatched' ? '#e6f4ea' : '#fef3c7',
                      color: r.status === 'Completed' || r.status === 'Dispatched' ? '#16a34a' : '#d97706'
                    }}>
                      {r.status || 'Pending'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    {canView && (
                    <button
                      type="button"
                      onClick={() => { setSelectedReq(r); setViewState('VIEW_DETAIL'); }}
                      title="View Stock Request Details"
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
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <PaginationBar
        currentPage={currentPage}
        totalItems={filteredRequests.length}
        pageSize={PAGE_SIZE}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
