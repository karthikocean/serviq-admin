import React, { useState, useEffect, useCallback } from 'react';
import { SearchIcon, EyeIcon, ArrowLeftIcon, filterInputStyle, formInputStyle, formLabelStyle, PaginationBar } from './InventoryCommon';
import InventoryApi from '../../api/Inventory';

export default function CompanyBranchRequests({ branchRequests: initialRequests, onApprove, onReject, onDistribute }) {
  const [requestsList, setRequestsList] = useState(initialRequests || []);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(0);

  // View States: null | 'VIEW_PAGE' | 'DISTRIBUTE_FORM'
  const [viewState, setViewState] = useState(null);
  const [selectedReq, setSelectedReq] = useState(null);

  // Distribute Form State
  const [distForm, setDistForm] = useState({
    requestNo: '',
    branch: '',
    item: '',
    requestedQty: 0,
    approvedQty: 0,
    distributedQty: '',
    distDate: new Date().toISOString().split('T')[0],
    remarks: ''
  });
  const [distErrors, setDistErrors] = useState({});

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
            requestNo: r.requestNo || `BR-REQ-${String(r._id || '').slice(-3).toUpperCase()}`,
            branch: r.branchName || (typeof r.branchId === 'object' ? (r.branchId?.branchName || r.branchId?.name) : '') || r.branch || 'Branch Unit',
            item: r.itemName || (typeof r.itemId === 'object' ? r.itemId?.name : '') || r.item || 'General Material',
            reqQty: r.reqQty || 0,
            appQty: r.appQty !== undefined ? r.appQty : (r.reqQty || 0),
            distQty: r.distQty || 0,
            unit: r.unit || 'kg',
            date: r.requestDate ? new Date(r.requestDate).toISOString().split('T')[0] : (r.date || new Date().toISOString().split('T')[0]),
            status: r.status || 'Pending',
            remarks: r.remarks || ''
          }));
          setRequestsList(formatted);
        }
      }
    } catch (err) {
      console.warn('Stock requests load note:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const displayRequests = requestsList.length > 0 ? requestsList : initialRequests;
  const branches = ['All', ...Array.from(new Set(displayRequests.map(r => r.branch)))];

  const filteredRequests = displayRequests.filter(r => {
    const matchesSearch = !searchTerm.trim() ||
      (r.requestNo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.branch || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.item || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesBranch = branchFilter === 'All' || r.branch === branchFilter;
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;

    return matchesSearch && matchesBranch && matchesStatus;
  });

  const PAGE_SIZE = 10;
  const paginatedRequests = filteredRequests.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  const handleOpenView = (req) => {
    setSelectedReq(req);
    setViewState('VIEW_PAGE');
  };

  const handleApproveAction = async (req) => {
    setIsSubmitting(true);
    try {
      if (req?._id || req?.id) {
        await InventoryApi.approveStockRequest(req._id || req.id, {
          distributedQty: Number(req.reqQty || 0),
          distQty: Number(req.reqQty || 0),
          remarks: req.remarks || 'Stock Request Approved'
        });
      }
      if (onApprove) onApprove(req);
      setSelectedReq(prev => prev ? { ...prev, status: 'Approved' } : null);
      fetchRequests();
    } catch (err) {
      console.error('Approve request error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectAction = async (req) => {
    setIsSubmitting(true);
    try {
      if (req?._id || req?.id) {
        await InventoryApi.rejectStockRequest(req._id || req.id);
      }
      if (onReject) onReject(req);
      setViewState(null);
      fetchRequests();
    } catch (err) {
      console.error('Reject request error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDistributeForm = (req) => {
    setSelectedReq(req);
    setDistForm({
      requestNo: req.requestNo,
      branch: req.branch,
      item: req.item,
      requestedQty: req.reqQty,
      approvedQty: req.appQty || req.reqQty,
      distributedQty: req.appQty || req.reqQty,
      distDate: new Date().toISOString().split('T')[0],
      remarks: req.remarks || ''
    });
    setDistErrors({});
    setViewState('DISTRIBUTE_FORM');
  };

  const validateDistribute = () => {
    const errors = {};
    const app = Number(distForm.approvedQty);
    const dist = Number(distForm.distributedQty);
    if (!distForm.distributedQty || dist <= 0) errors.distributedQty = 'Distributed Quantity must be greater than 0';
    if (dist > app) errors.distributedQty = `Distributed Quantity (${dist}) cannot exceed Approved Quantity (${app})`;
    setDistErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveDistribute = async (e) => {
    e.preventDefault();
    if (!validateDistribute()) return;

    setIsSubmitting(true);
    try {
      if (selectedReq?._id) {
        // CALL BACKEND API TO DECREASE CENTRAL STOCK AUTOMATICALLY (- distributedQty)
        await InventoryApi.approveStockRequest(selectedReq._id, {
          distributedQty: Number(distForm.distributedQty),
          distQty: Number(distForm.distributedQty),
          remarks: distForm.remarks
        });
      }

      if (onDistribute) onDistribute(distForm, selectedReq);
      setViewState(null);
      fetchRequests();
    } catch (err) {
      console.error('Distribute stock error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'Approved') return { bg: '#e0f2fe', color: '#0369a1', label: 'Approved' };
    if (status === 'Distributed' || status === 'Dispatched' || status === 'Completed') return { bg: '#e6f4ea', color: '#16a34a', label: status };
    if (status === 'Rejected') return { bg: '#fef2f2', color: '#dc2626', label: 'Rejected' };
    return { bg: '#fef3c7', color: '#d97706', label: 'Pending' };
  };

  // Render Distribute Form Page View
  if (viewState === 'DISTRIBUTE_FORM' && selectedReq) {
    return (
      <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '32px 40px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', paddingBottom: '20px', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              type="button"
              onClick={() => setViewState('VIEW_PAGE')}
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
              Distribute Stock for Request: {selectedReq.requestNo}
            </h2>
          </div>
        </div>

        <form onSubmit={handleSaveDistribute} style={{ width: '100%' }}>
          {/* Row 1: Request Number & Destination Branch */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
            <div>
              <label style={formLabelStyle}>Request Number</label>
              <input
                type="text"
                readOnly
                value={distForm.requestNo}
                style={{ ...formInputStyle, background: '#f8fafc', fontWeight: 700 }}
              />
            </div>
            <div>
              <label style={formLabelStyle}>Destination Branch</label>
              <input
                type="text"
                readOnly
                value={distForm.branch}
                style={{ ...formInputStyle, background: '#f8fafc', fontWeight: 700 }}
              />
            </div>
          </div>

          {/* Row 2: Item Name & Requested Quantity */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={formLabelStyle}>Item Name</label>
              <input
                type="text"
                readOnly
                value={distForm.item}
                style={{ ...formInputStyle, background: '#f8fafc', fontWeight: 700 }}
              />
            </div>
            <div>
              <label style={formLabelStyle}>Requested Quantity</label>
              <input
                type="text"
                readOnly
                value={`${distForm.requestedQty} ${selectedReq.unit || 'kg'}`}
                style={{ ...formInputStyle, background: '#f8fafc' }}
              />
            </div>
          </div>

          {/* Row 3: Approved Quantity & Dispatch Quantity */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={formLabelStyle}>Approved Quantity</label>
              <input
                type="text"
                readOnly
                value={`${distForm.approvedQty} ${selectedReq.unit || 'kg'}`}
                style={{ ...formInputStyle, background: '#f8fafc', fontWeight: 700, color: '#0284c7' }}
              />
            </div>
            <div>
              <label style={formLabelStyle}>
                Dispatch / Distribute Quantity <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="number"
                value={distForm.distributedQty}
                onChange={e => setDistForm({ ...distForm, distributedQty: e.target.value })}
                style={{ ...formInputStyle, borderColor: distErrors.distributedQty ? '#ef4444' : '#cbd5e1' }}
              />
              {distErrors.distributedQty && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', display: 'block', fontWeight: 600 }}>{distErrors.distributedQty}</span>}
            </div>
          </div>

          {/* Row 4: Distribution Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={formLabelStyle}>
                Distribution Date <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="date"
                value={distForm.distDate}
                onChange={e => setDistForm({ ...distForm, distDate: e.target.value })}
                style={{ ...formInputStyle }}
              />
            </div>
            <div></div>
          </div>

          {/* Row 4: Remarks */}
          <div style={{ marginBottom: '32px' }}>
            <label style={formLabelStyle}>
              Dispatch Remarks / Vehicle Details
            </label>
            <textarea
              rows="3"
              placeholder="e.g. Sent via Express Logistics Van #TN01-AX-9900"
              value={distForm.remarks}
              onChange={e => setDistForm({ ...distForm, remarks: e.target.value })}
              style={{ ...formInputStyle, height: 'auto', padding: '12px 16px' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '14px', paddingTop: '24px', borderTop: '1px solid #f1f5f9' }}>
            <button
              type="button"
              onClick={() => setViewState('VIEW_PAGE')}
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
                background: '#16a34a',
                color: '#ffffff',
                border: 'none',
                padding: '12px 32px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(22, 163, 74, 0.25)'
              }}
            >
              Confirm & Dispatch Stock
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Render View Request Page View
  if (viewState === 'VIEW_PAGE' && selectedReq) {
    const badge = getStatusBadge(selectedReq.status);
    const isPending = selectedReq.status === 'Pending';
    const isApproved = selectedReq.status === 'Approved';
    const isCompletedOrDistributed = selectedReq.status === 'Distributed' || selectedReq.status === 'Dispatched' || selectedReq.status === 'Completed' || selectedReq.status === 'Rejected';

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
              Branch Request Details: {selectedReq.requestNo}
            </h2>
          </div>

          <span style={{
            padding: '6px 16px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 800,
            background: badge.bg,
            color: badge.color
          }}>
            {badge.label}
          </span>
        </div>

        <div style={{ background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '28px', width: '100%', boxSizing: 'border-box', marginBottom: '28px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', fontSize: '14px', marginBottom: '24px' }}>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '12px', marginBottom: '4px' }}>Request Number</span>
              <strong style={{ color: '#0f172a', fontSize: '16px' }}>{selectedReq.requestNo}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '12px', marginBottom: '4px' }}>Request Date</span>
              <span style={{ color: '#0f172a', fontWeight: 600 }}>{selectedReq.date}</span>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '12px', marginBottom: '4px' }}>Requesting Branch</span>
              <strong style={{ color: '#0f172a', fontSize: '15px' }}>{selectedReq.branch}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '12px', marginBottom: '4px' }}>Requested Item</span>
              <strong style={{ color: '#0f172a', fontSize: '15px' }}>{selectedReq.item}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '12px', marginBottom: '4px' }}>Requested Quantity</span>
              <span style={{ color: '#0f172a', fontWeight: 700 }}>{selectedReq.reqQty} {selectedReq.unit || 'kg'}</span>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '12px', marginBottom: '4px' }}>Approved Quantity</span>
              <span style={{ color: '#0284c7', fontWeight: 700 }}>{selectedReq.appQty || selectedReq.reqQty} {selectedReq.unit || 'kg'}</span>
            </div>
          </div>

          <div style={{ paddingTop: '20px', borderTop: '1px solid #cbd5e1' }}>
            <span style={{ color: '#64748b', display: 'block', fontSize: '12px', marginBottom: '6px', fontWeight: 700 }}>Branch Remarks</span>
            <p style={{ margin: 0, fontSize: '14px', color: '#0f172a', background: '#ffffff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              {selectedReq.remarks || 'No remarks provided.'}
            </p>
          </div>
        </div>

        {/* STATUS ACTIONS */}
        <div style={{ paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
          <h4 style={{ margin: '0 0 14px 0', fontSize: '14px', color: '#334155', fontWeight: 800 }}>Available Status Actions</h4>
          
          {isPending && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleApproveAction(selectedReq)}
                style={{
                  background: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px 28px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)',
                  opacity: isSubmitting ? 0.7 : 1
                }}
              >
                {isSubmitting ? 'Processing...' : 'Approve Request'}
              </button>

              <button
                type="button"
                onClick={() => handleOpenDistributeForm(selectedReq)}
                style={{
                  background: '#16a34a',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px 28px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(22, 163, 74, 0.25)'
                }}
              >
                Distribute Stock
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleRejectAction(selectedReq)}
                style={{
                  background: '#fef2f2',
                  color: '#dc2626',
                  border: '1px solid #fecaca',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  opacity: isSubmitting ? 0.7 : 1
                }}
              >
                Reject Request
              </button>
            </div>
          )}

          {isApproved && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <button
                type="button"
                onClick={() => handleOpenDistributeForm(selectedReq)}
                style={{
                  background: '#16a34a',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px 28px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(22, 163, 74, 0.25)'
                }}
              >
                Distribute Stock
              </button>
              <span style={{ fontSize: '13px', color: '#0284c7', fontWeight: 600 }}>
                ✓ Request Approved. Only Distribute action is now available.
              </span>
            </div>
          )}

          {isCompletedOrDistributed && (
            <div style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#64748b', fontSize: '13px' }}>
              No further actions available for this {selectedReq.status.toLowerCase()} request.
            </div>
          )}
        </div>
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
              placeholder="Search branch requests..."
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(0); }}
              style={{ ...filterInputStyle, paddingLeft: '32px' }}
            />
          </div>

          <div style={{ width: '180px' }}>
            <select
              value={branchFilter}
              onChange={e => { setBranchFilter(e.target.value); setCurrentPage(0); }}
              style={filterInputStyle}
            >
              <option value="All">All Branches</option>
              {branches.filter(b => b !== 'All').map(br => (
                <option key={br} value={br}>{br}</option>
              ))}
            </select>
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
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px' }}>
              <th style={{ padding: '12px 16px', fontWeight: 800 }}>Request No</th>
              <th style={{ padding: '12px 16px', fontWeight: 800 }}>Branch</th>
              <th style={{ padding: '12px 16px', fontWeight: 800 }}>Date</th>
              <th style={{ padding: '12px 16px', fontWeight: 800 }}>Item</th>
              <th style={{ padding: '12px 16px', fontWeight: 800 }}>Req Qty</th>
              <th style={{ padding: '12px 16px', fontWeight: 800 }}>App Qty</th>
              <th style={{ padding: '12px 16px', fontWeight: 800 }}>Status</th>
              <th style={{ padding: '12px 16px', fontWeight: 800, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRequests.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                  No branch requests found.
                </td>
              </tr>
            ) : (
              paginatedRequests.map(req => {
                const badge = getStatusBadge(req.status);
                return (
                  <tr key={req.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 800, color: '#0f172a' }}>{req.requestNo}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: '#0f172a' }}>{req.branch}</td>
                    <td style={{ padding: '14px 16px', color: '#64748b' }}>{req.date}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0f172a' }}>{req.item}</td>
                    <td style={{ padding: '14px 16px', color: '#0f172a' }}>{req.reqQty} {req.unit || 'kg'}</td>
                    <td style={{ padding: '14px 16px', color: '#0284c7', fontWeight: 700 }}>{req.appQty || req.reqQty} {req.unit || 'kg'}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        padding: '3px 10px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 700,
                        background: badge.bg,
                        color: badge.color
                      }}>
                        {badge.label}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => handleOpenView(req)}
                        style={{
                          background: '#f1f5f9',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          color: '#0f172a',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <EyeIcon size={13} />
                        <span>View / Process</span>
                      </button>
                    </td>
                  </tr>
                );
              })
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
