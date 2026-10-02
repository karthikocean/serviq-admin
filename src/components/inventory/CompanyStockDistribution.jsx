import React, { useState, useEffect, useCallback } from 'react';
import { SearchIcon, EyeIcon, filterInputStyle, formInputStyle, formLabelStyle, PaginationBar, preventSpaceInput, actionIconBtnStyle } from './InventoryCommon';
import InventoryApi from '../../api/Inventory';

// Icons for Stock Distribution Summary Cards
const CheckCircleIcon = ({ size = 22, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

const TruckIcon = ({ size = 22, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13"></rect>
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
    <circle cx="5.5" cy="18.5" r="2.5"></circle>
    <circle cx="18.5" cy="18.5" r="2.5"></circle>
  </svg>
);

const PackageIcon = ({ size = 22, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
    <line x1="12" y1="22.08" x2="12" y2="12"></line>
  </svg>
);

export default function CompanyStockDistribution({ distributions: initialDistributions = [] }) {
  const [requestsList, setRequestsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(0);

  // Modals & Forms state
  const [selectedDistItem, setSelectedDistItem] = useState(null); // Detail view modal
  const [distributeModalItem, setDistributeModalItem] = useState(null); // Distribute stock modal

  // Distribute Form State
  const [distForm, setDistForm] = useState({
    givenQty: '',
    distDate: new Date().toISOString().split('T')[0],
    remarks: ''
  });
  const [distErrors, setDistErrors] = useState({});

  // Fetch Requests dynamically from Backend
  const fetchDistributionData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await InventoryApi.getStockRequests();
      if (res?.status && res?.response) {
        const rawReqs = res.response.data || res.response || [];
        if (Array.isArray(rawReqs)) {
          const formatted = rawReqs.map(r => {
            const reqQ = r.reqQty || 0;
            const distQ = r.distQty || 0;
            const remQ = Math.max(0, reqQ - distQ);
            return {
              id: r._id || r.id,
              _id: r._id || r.id,
              requestNo: r.requestNo || `BR-REQ-${String(r._id || '').slice(-3).toUpperCase()}`,
              distNo: `DIST-${String(r.requestNo || r._id || '').replace('BR-REQ-', '')}`,
              branch: r.branchName || (typeof r.branchId === 'object' ? (r.branchId?.branchName || r.branchId?.name) : '') || r.branch || 'Branch Unit',
              item: r.itemName || (typeof r.itemId === 'object' ? r.itemId?.name : '') || r.item || 'General Material',
              reqQty: reqQ,
              appQty: r.appQty !== undefined ? r.appQty : reqQ,
              distQty: distQ,
              remainingQty: remQ,
              unit: r.unit || 'kg',
              date: r.requestDate ? new Date(r.requestDate).toISOString().split('T')[0] : (r.date || new Date().toISOString().split('T')[0]),
              status: r.status || 'Pending',
              remarks: r.remarks || ''
            };
          }).filter(r => ['Approved', 'Partially Dispatched', 'Dispatched', 'Completed'].includes(r.status));

          setRequestsList(formatted);
        }
      }
    } catch (err) {
      console.warn('Distribution data load note:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDistributionData();
  }, [fetchDistributionData]);

  // Combine fetched requests with initial distributions fallback
  const displayItems = requestsList.length > 0 ? requestsList : initialDistributions.map((d, idx) => ({
    id: d.id || idx,
    _id: d.id || idx,
    requestNo: d.requestNo || `BR-REQ-${String(idx + 1).padStart(3, '0')}`,
    distNo: d.distNo || `DIST-${String(idx + 1).padStart(3, '0')}`,
    branch: d.branch || 'Serviq Outlet',
    item: d.item || 'Material Item',
    reqQty: d.requestedQty || d.reqQty || d.distQty || 10,
    appQty: d.approvedQty || d.appQty || d.distQty || 10,
    distQty: d.distQty || 0,
    remainingQty: Math.max(0, (d.requestedQty || d.reqQty || d.distQty || 10) - (d.distQty || 0)),
    unit: d.unit || 'kg',
    date: d.date || new Date().toISOString().split('T')[0],
    status: d.status || 'Approved',
    remarks: d.remarks || ''
  }));

  // Dynamic filter lists
  const branchesList = ['All', ...new Set(displayItems.map(d => d.branch).filter(Boolean))];
  const statusesList = ['All', 'Approved', 'Partially Dispatched', 'Dispatched', 'Completed'];

  // Filtering
  const filteredDists = displayItems.filter(d => {
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch = !q ||
      (d.distNo && d.distNo.toLowerCase().includes(q)) ||
      (d.requestNo && d.requestNo.toLowerCase().includes(q)) ||
      (d.branch && d.branch.toLowerCase().includes(q)) ||
      (d.item && d.item.toLowerCase().includes(q));

    const matchesBranch = branchFilter === 'All' || d.branch === branchFilter;
    const matchesStatus = statusFilter === 'All' || d.status === statusFilter;

    return matchesSearch && matchesBranch && matchesStatus;
  });

  const PAGE_SIZE = 10;
  const paginatedDists = filteredDists.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  // Metrics calculation
  const approvedTotalCount = displayItems.filter(d => d.status === 'Approved').length;
  const partialDistCount = displayItems.filter(d => d.status === 'Partially Dispatched').length;
  const dispatchedTotalCount = displayItems.filter(d => d.status === 'Dispatched' || d.status === 'Completed').length;
  const totalQtyDistributed = displayItems.reduce((acc, curr) => acc + Number(curr.distQty || 0), 0);

  // Open Distribute Modal
  const handleOpenDistributeModal = (item) => {
    setDistributeModalItem(item);
    const defaultGiven = item.remainingQty > 0 ? item.remainingQty : item.reqQty;
    setDistForm({
      givenQty: defaultGiven,
      distDate: new Date().toISOString().split('T')[0],
      remarks: item.remarks || ''
    });
    setDistErrors({});
  };

  // Validate Distribute
  const validateDistribute = () => {
    const errors = {};
    const given = Number(distForm.givenQty);
    const rem = Number(distributeModalItem?.remainingQty || distributeModalItem?.reqQty || 0);

    if (!distForm.givenQty || given <= 0) {
      errors.givenQty = 'Given Quantity must be greater than 0';
    } else if (rem > 0 && given > rem) {
      errors.givenQty = `Given Quantity (${given}) cannot exceed Remaining Requested Qty (${rem})`;
    }
    setDistErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Distribute Submit
  const handleDistributeSubmit = async (e) => {
    e.preventDefault();
    if (!validateDistribute()) return;

    setIsSubmitting(true);
    try {
      if (distributeModalItem?._id) {
        await InventoryApi.distributeStockRequest(distributeModalItem._id, {
          givenQty: Number(distForm.givenQty),
          distQty: Number(distForm.givenQty),
          remarks: distForm.remarks
        });
      }
      setDistributeModalItem(null);
      fetchDistributionData();
    } catch (err) {
      console.error('Distribute error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'Approved') return { bg: '#fef3c7', color: '#d97706', label: 'Approved (Pending Dist.)' };
    if (status === 'Partially Dispatched') return { bg: '#e0f2fe', color: '#0284c7', label: 'Partially Dispatched' };
    if (status === 'Dispatched' || status === 'Completed') return { bg: '#e6f4ea', color: '#16a34a', label: 'Dispatched / Completed' };
    return { bg: '#f1f5f9', color: '#64748b', label: status || 'Pending' };
  };

  return (
    <div style={{ width: '100%', boxSizing: 'border-box' }}>
      
      {/* 1. Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        {/* Approved Pending Distribution */}
        <div
          onClick={() => { setStatusFilter('Approved'); setCurrentPage(0); }}
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: statusFilter === 'Approved' ? '2px solid #d97706' : '1px solid #e2e8f0',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <div>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Approved Requests
            </span>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#d97706', marginTop: '6px', lineHeight: 1.1 }}>
              {approvedTotalCount}
            </div>
            <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
              Awaiting stock distribution
            </span>
          </div>
          <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706', flexShrink: 0 }}>
            <CheckCircleIcon size={24} />
          </div>
        </div>

        {/* Partially Dispatched */}
        <div
          onClick={() => { setStatusFilter('Partially Dispatched'); setCurrentPage(0); }}
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: statusFilter === 'Partially Dispatched' ? '2px solid #0284c7' : '1px solid #e2e8f0',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <div>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Partial Distributions
            </span>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#0284c7', marginTop: '6px', lineHeight: 1.1 }}>
              {partialDistCount}
            </div>
            <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
              Partial stock dispatched
            </span>
          </div>
          <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7', flexShrink: 0 }}>
            <PackageIcon size={24} />
          </div>
        </div>

        {/* Dispatched & Completed */}
        <div
          onClick={() => { setStatusFilter('Dispatched'); setCurrentPage(0); }}
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: statusFilter === 'Dispatched' ? '2px solid #16a34a' : '1px solid #e2e8f0',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <div>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Fully Dispatched
            </span>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#16a34a', marginTop: '6px', lineHeight: 1.1 }}>
              {dispatchedTotalCount}
            </div>
            <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
              Fulfilled stock requests
            </span>
          </div>
          <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#e6f4ea', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a', flexShrink: 0 }}>
            <TruckIcon size={24} />
          </div>
        </div>
      </div>

      {/* 2. Main Table Container */}
      <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', padding: '24px', width: '100%', boxSizing: 'border-box' }}>
        
        {/* Header & Description */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>
              Stock Distribution Management
            </h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
              Track approved branch requests, manage given vs requested stock quantities, and dispatch central inventory
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '20px', background: '#f8fafc', padding: '14px 18px', borderRadius: '12px', border: '1px solid #edf2f7' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', flex: 1, minWidth: '280px' }}>
            
            {/* Search Box */}
            <div style={{ position: 'relative', minWidth: '220px', flex: 1, maxWidth: '340px' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
                <SearchIcon size={14} color="#94a3b8" />
              </span>
              <input
                type="text"
                placeholder="Search by req no, dist no, branch, item..."
                value={searchTerm}
                onKeyDown={preventSpaceInput}
                onChange={e => { setSearchTerm(e.target.value.replace(/\s/g, '')); setCurrentPage(0); }}
                style={{ ...filterInputStyle, paddingLeft: '34px', width: '100%' }}
              />
            </div>

            {/* Branch Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>Branch:</span>
              <select
                value={branchFilter}
                onChange={e => { setBranchFilter(e.target.value); setCurrentPage(0); }}
                style={filterInputStyle}
              >
                {branchesList.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>Status:</span>
              <select
                value={statusFilter}
                onChange={e => { setStatusFilter(e.target.value); setCurrentPage(0); }}
                style={filterInputStyle}
              >
                {statusesList.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch', paddingBottom: '6px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1150px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px' }}>
                <th style={{ padding: '12px 14px', fontWeight: 800, width: '45px', whiteSpace: 'nowrap' }}>S.No</th>
                <th style={{ padding: '12px 14px', fontWeight: 800, whiteSpace: 'nowrap' }}>Request No.</th>
                <th style={{ padding: '12px 14px', fontWeight: 800, whiteSpace: 'nowrap' }}>Branch</th>
                <th style={{ padding: '12px 14px', fontWeight: 800, whiteSpace: 'nowrap' }}>Item</th>
                <th style={{ padding: '12px 14px', fontWeight: 800, textAlign: 'center', whiteSpace: 'nowrap' }}>Requested Qty</th>
                <th style={{ padding: '12px 14px', fontWeight: 800, textAlign: 'center', whiteSpace: 'nowrap' }}>Given Qty</th>
                <th style={{ padding: '12px 14px', fontWeight: 800, textAlign: 'center', whiteSpace: 'nowrap' }}>Remaining Qty</th>
                <th style={{ padding: '12px 14px', fontWeight: 800, textAlign: 'center', whiteSpace: 'nowrap' }}>Status</th>
                <th style={{ padding: '12px 14px', fontWeight: 800, textAlign: 'right', whiteSpace: 'nowrap' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedDists.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ padding: '36px 14px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                    No approved stock distributions found. Approve requests in the Branch Requests screen.
                  </td>
                </tr>
              ) : (
                paginatedDists.map((d, index) => {
                  const badge = getStatusBadge(d.status);
                  const isDistributable = d.status === 'Approved' || d.status === 'Partially Dispatched' || d.remainingQty > 0;
                  return (
                    <tr
                      key={d.id || index}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
                    >
                      <td style={{ padding: '14px 14px', fontSize: '12.5px', color: '#64748b', whiteSpace: 'nowrap' }}>
                        {currentPage * PAGE_SIZE + index + 1}
                      </td>
                      <td style={{ padding: '14px 14px', fontSize: '13px', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap' }}>
                        {d.requestNo}
                      </td>
                      <td style={{ padding: '14px 14px', fontSize: '13px', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}>
                        {d.branch}
                      </td>
                      <td style={{ padding: '14px 14px', fontSize: '13px', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap' }}>
                        {d.item}
                      </td>
                      <td style={{ padding: '14px 14px', fontSize: '13px', fontWeight: 800, color: '#0f172a', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        {d.reqQty} {d.unit}
                      </td>
                      <td style={{ padding: '14px 14px', fontSize: '13px', fontWeight: 800, color: '#16a34a', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        {d.distQty} {d.unit}
                      </td>
                      <td style={{ padding: '14px 14px', fontSize: '13px', fontWeight: 800, color: d.remainingQty > 0 ? '#ff5a1f' : '#64748b', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        {d.remainingQty} {d.unit}
                      </td>
                      <td style={{ padding: '14px 14px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 800,
                          whiteSpace: 'nowrap',
                          background: badge.bg,
                          color: badge.color
                        }}>
                          {badge.label}
                        </span>
                      </td>
                      <td style={{ padding: '14px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                          {isDistributable && (
                            <button
                              type="button"
                              onClick={() => handleOpenDistributeModal(d)}
                              title="Give / Distribute Stock"
                              style={{
                                background: '#16a34a',
                                color: '#ffffff',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                boxShadow: '0 2px 6px rgba(22, 163, 74, 0.2)'
                              }}
                            >
                              Distribute Stock
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setSelectedDistItem(d)}
                            title="View Distribution Details"
                            style={{
                              ...actionIconBtnStyle,
                              background: '#eff6ff',
                              color: '#2563eb',
                              border: '1px solid #bfdbfe'
                            }}
                          >
                            <EyeIcon size={15} color="#2563eb" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <PaginationBar
          totalItems={filteredDists.length}
          pageSize={PAGE_SIZE}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* 3. Distribute Stock Modal */}
      {distributeModalItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '520px', width: '100%', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>
                Distribute Stock: {distributeModalItem.requestNo}
              </h3>
              <button
                type="button"
                onClick={() => setDistributeModalItem(null)}
                style={{ background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDistributeSubmit} style={{ padding: '24px' }}>
              {/* Request Info Summary */}
              <div style={{ background: '#eff6ff', borderRadius: '10px', padding: '16px', marginBottom: '20px', border: '1px solid #bfdbfe', fontSize: '13px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '8px' }}>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>Branch</span>
                    <strong style={{ color: '#0f172a' }}>{distributeModalItem.branch}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>Requested Item</span>
                    <strong style={{ color: '#0f172a' }}>{distributeModalItem.item}</strong>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', paddingTop: '10px', borderTop: '1px dashed #bfdbfe', marginTop: '8px' }}>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>Requested Qty</span>
                    <strong style={{ color: '#0f172a' }}>{distributeModalItem.reqQty} {distributeModalItem.unit}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>Given Qty</span>
                    <strong style={{ color: '#16a34a' }}>{distributeModalItem.distQty} {distributeModalItem.unit}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>Remaining Qty</span>
                    <strong style={{ color: '#ff5a1f' }}>{distributeModalItem.remainingQty} {distributeModalItem.unit}</strong>
                  </div>
                </div>
              </div>

              {/* Form Input: Given Quantity (This batch) */}
              <div style={{ marginBottom: '20px' }}>
                <label style={formLabelStyle}>
                  Given Quantity (This Dispatch Batch) <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="number"
                  placeholder={`e.g. ${distributeModalItem.remainingQty || distributeModalItem.reqQty}`}
                  value={distForm.givenQty}
                  onChange={e => setDistForm({ ...distForm, givenQty: e.target.value })}
                  style={{ ...formInputStyle, borderColor: distErrors.givenQty ? '#ef4444' : '#cbd5e1' }}
                />
                {distErrors.givenQty && (
                  <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', display: 'block', fontWeight: 600 }}>
                    {distErrors.givenQty}
                  </span>
                )}
                <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                  Enter full or partial quantity to distribute. Remaining balance can be dispatched later.
                </span>
              </div>

              {/* Dispatch Date */}
              <div style={{ marginBottom: '20px' }}>
                <label style={formLabelStyle}>Dispatch Date</label>
                <input
                  type="date"
                  value={distForm.distDate}
                  onChange={e => setDistForm({ ...distForm, distDate: e.target.value })}
                  style={formInputStyle}
                />
              </div>

              {/* Remarks */}
              <div style={{ marginBottom: '24px' }}>
                <label style={formLabelStyle}>Dispatch Remarks / Transport Details</label>
                <input
                  type="text"
                  placeholder="e.g. Sent 5kg via morning delivery truck"
                  value={distForm.remarks}
                  onChange={e => setDistForm({ ...distForm, remarks: e.target.value })}
                  style={formInputStyle}
                />
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                <button
                  type="button"
                  onClick={() => setDistributeModalItem(null)}
                  style={{
                    background: '#ffffff',
                    color: '#0f172a',
                    border: '1px solid #cbd5e1',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    background: '#16a34a',
                    color: '#ffffff',
                    border: 'none',
                    padding: '10px 24px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(22, 163, 74, 0.25)',
                    opacity: isSubmitting ? 0.7 : 1
                  }}
                >
                  {isSubmitting ? 'Distributing...' : 'Confirm Stock Distribution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Detail Modal */}
      {selectedDistItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '480px', width: '100%', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ padding: '18px 22px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                Stock Distribution Details
              </h3>
              <button
                type="button"
                onClick={() => setSelectedDistItem(null)}
                style={{ background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Request No:</span>
                <span style={{ fontWeight: 800, color: '#0f172a' }}>{selectedDistItem.requestNo}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Branch Outlet:</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{selectedDistItem.branch}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Item Name:</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{selectedDistItem.item}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Requested Quantity:</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{selectedDistItem.reqQty} {selectedDistItem.unit}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Given Quantity:</span>
                <span style={{ fontWeight: 800, color: '#16a34a', fontSize: '14px' }}>{selectedDistItem.distQty} {selectedDistItem.unit}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Remaining Quantity:</span>
                <span style={{ fontWeight: 800, color: selectedDistItem.remainingQty > 0 ? '#ff5a1f' : '#64748b', fontSize: '14px' }}>{selectedDistItem.remainingQty} {selectedDistItem.unit}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Request Date:</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{selectedDistItem.date}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Status:</span>
                <span style={{ fontWeight: 700, color: getStatusBadge(selectedDistItem.status).color }}>{selectedDistItem.status}</span>
              </div>
              {selectedDistItem.remarks && (
                <div style={{ marginTop: '8px', padding: '10px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>Remarks:</span>
                  <span style={{ color: '#64748b' }}>{selectedDistItem.remarks}</span>
                </div>
              )}
            </div>
            <div style={{ padding: '14px 22px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setSelectedDistItem(null)}
                style={{ background: '#0f172a', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '8px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
