import React, { useState } from 'react';
import { PlusIcon, SearchIcon, EyeIcon, TrashIcon, ArrowLeftIcon, filterInputStyle, formInputStyle, formLabelStyle, PaginationBar, preventSpaceInput, actionIconBtnStyle } from './InventoryCommon';

export default function BranchStockReceipt({ receipts, distributions, transfers, items, onSaveReceipt, onDeleteReceipt }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);

  // View States: null | 'ADD' | 'VIEW_DETAIL'
  const [viewState, setViewState] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // Stock Receipt - Form
  const [recForm, setRecForm] = useState({
    reqTrfNo: '',
    source: 'Central Warehouse',
    item: items.length > 0 ? items[0].name : '',
    sentQty: '',
    receivedQty: '',
    receivedDate: new Date().toISOString().split('T')[0],
    remarks: ''
  });
  const [recErrors, setRecErrors] = useState({});

  const handleReqTrfSelect = (no) => {
    const matchedDist = distributions.find(d => d.distNo === no || d.requestNo === no);
    if (matchedDist) {
      setRecForm(prev => ({
        ...prev,
        reqTrfNo: no,
        source: 'Central Warehouse',
        item: matchedDist.item,
        sentQty: matchedDist.distQty,
        receivedQty: matchedDist.distQty
      }));
      return;
    }

    const matchedTrf = transfers.find(t => t.transferNo === no);
    if (matchedTrf) {
      setRecForm(prev => ({
        ...prev,
        reqTrfNo: no,
        source: matchedTrf.fromBranch,
        item: matchedTrf.item,
        sentQty: matchedTrf.quantity,
        receivedQty: matchedTrf.quantity
      }));
      return;
    }

    setRecForm(prev => ({ ...prev, reqTrfNo: no }));
  };

  const filteredReceipts = receipts.filter(r => {
    const ref = r.reqTrfNo || r.refNo || r.requestNo || '';
    return !searchTerm.trim() ||
      r.receiptNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ref.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.item.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const PAGE_SIZE = 10;
  const paginatedReceipts = filteredReceipts.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  const validate = () => {
    const errors = {};
    if (!recForm.reqTrfNo.trim()) errors.reqTrfNo = 'Request/Transfer No is required';
    if (!recForm.receivedQty || Number(recForm.receivedQty) <= 0) errors.receivedQty = 'Valid Received Quantity is required';
    if (!recForm.receivedDate) errors.receivedDate = 'Received Date is required';
    if (recForm.sentQty && Number(recForm.receivedQty) > Number(recForm.sentQty)) {
      errors.receivedQty = `Received Quantity (${recForm.receivedQty}) cannot exceed Sent Quantity (${recForm.sentQty})`;
    }
    setRecErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSaveReceipt(recForm);
    setViewState(null);
  };

  // Render View Receipt Detail Page View
  if (viewState === 'VIEW_DETAIL' && selectedReceipt) {
    const refNumber = selectedReceipt.reqTrfNo || selectedReceipt.refNo || 'N/A';
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
              Stock Receipt Details: {selectedReceipt.receiptNo}
            </h2>
          </div>

          <span style={{
            padding: '6px 16px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 800,
            background: '#e6f4ea',
            color: '#16a34a'
          }}>
            {selectedReceipt.status || 'Received'}
          </span>
        </div>

        <div style={{ background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '28px', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', fontSize: '14px', marginBottom: '24px' }}>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '12px', marginBottom: '4px' }}>Receipt No</span>
              <strong style={{ color: '#0f172a', fontSize: '16px' }}>{selectedReceipt.receiptNo}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '12px', marginBottom: '4px' }}>Request/Transfer No</span>
              <strong style={{ color: '#ff5a1f', fontSize: '16px' }}>{refNumber}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '12px', marginBottom: '4px' }}>Source</span>
              <span style={{ color: '#0f172a', fontWeight: 700 }}>{selectedReceipt.source}</span>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '12px', marginBottom: '4px' }}>Received Date</span>
              <span style={{ color: '#0f172a', fontWeight: 600 }}>{selectedReceipt.date || selectedReceipt.receivedDate}</span>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '12px', marginBottom: '4px' }}>Item Name</span>
              <span style={{ color: '#0f172a', fontWeight: 800 }}>{selectedReceipt.item}</span>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '12px', marginBottom: '4px' }}>Sent vs Received Qty</span>
              <span style={{ color: '#16a34a', fontWeight: 700 }}>{selectedReceipt.sentQty || selectedReceipt.recQty} sent / {selectedReceipt.recQty} received</span>
            </div>
          </div>

          <div style={{ paddingTop: '20px', borderTop: '1px solid #cbd5e1' }}>
            <span style={{ color: '#64748b', display: 'block', fontSize: '12px', marginBottom: '6px', fontWeight: 700 }}>Remarks</span>
            <p style={{ margin: 0, fontSize: '14px', color: '#0f172a', background: '#ffffff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              {selectedReceipt.remarks || 'No remarks provided.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Render Add Stock Receipt Form Page View
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
              Record Inbound Stock Receipt
            </h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          {/* Row 1: Request/Transfer No & Source */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
            <div>
              <label style={formLabelStyle}>
                Request/Transfer No <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. BR-REQ-001 or DIST-2026-001"
                value={recForm.reqTrfNo}
                onChange={e => handleReqTrfSelect(e.target.value)}
                style={{ ...formInputStyle, borderColor: recErrors.reqTrfNo ? '#ef4444' : '#cbd5e1' }}
              />
              {recErrors.reqTrfNo && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', display: 'block', fontWeight: 600 }}>{recErrors.reqTrfNo}</span>}
            </div>

            <div>
              <label style={formLabelStyle}>
                Source Warehouse / Branch
              </label>
              <input
                type="text"
                placeholder="e.g. Central Warehouse"
                value={recForm.source}
                onChange={e => setRecForm({ ...recForm, source: e.target.value })}
                style={{ ...formInputStyle }}
              />
            </div>
          </div>

          {/* Row 2: Item Name & Sent Quantity */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
            <div>
              <label style={formLabelStyle}>
                Item Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={recForm.item}
                onChange={e => setRecForm({ ...recForm, item: e.target.value })}
                style={{ ...formInputStyle }}
              >
                {items.map(i => (
                  <option key={i.id} value={i.name}>{i.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={formLabelStyle}>
                Sent Quantity
              </label>
              <input
                type="number"
                placeholder="e.g. 50"
                value={recForm.sentQty}
                onChange={e => setRecForm({ ...recForm, sentQty: e.target.value })}
                style={{ ...formInputStyle }}
              />
            </div>
          </div>

          {/* Row 3: Received Quantity & Received Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
            <div>
              <label style={formLabelStyle}>
                Received Quantity <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="number"
                placeholder="e.g. 50"
                value={recForm.receivedQty}
                onChange={e => setRecForm({ ...recForm, receivedQty: e.target.value })}
                style={{ ...formInputStyle, borderColor: recErrors.receivedQty ? '#ef4444' : '#cbd5e1' }}
              />
              {recErrors.receivedQty && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', display: 'block', fontWeight: 600 }}>{recErrors.receivedQty}</span>}
            </div>

            <div>
              <label style={formLabelStyle}>
                Received Date <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="date"
                value={recForm.receivedDate}
                onChange={e => setRecForm({ ...recForm, receivedDate: e.target.value })}
                style={{ ...formInputStyle, borderColor: recErrors.receivedDate ? '#ef4444' : '#cbd5e1' }}
              />
              {recErrors.receivedDate && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', display: 'block', fontWeight: 600 }}>{recErrors.receivedDate}</span>}
            </div>
          </div>

          {/* Row 4: Remarks */}
          <div style={{ marginBottom: '32px' }}>
            <label style={formLabelStyle}>
              Remarks / Inspection Notes
            </label>
            <textarea
              rows="3"
              placeholder="e.g. Items verified and intact without damage"
              value={recForm.remarks}
              onChange={e => setRecForm({ ...recForm, remarks: e.target.value })}
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
              Confirm & Save Stock Receipt
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Render Table View
  return (
    <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ position: 'relative', width: '260px' }}>
          <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}>
            <SearchIcon size={14} />
          </span>
          <input
            type="text"
            placeholder="Search stock receipts..."
            value={searchTerm}
            onKeyDown={preventSpaceInput}
            onChange={e => { setSearchTerm(e.target.value.replace(/\s/g, '')); setCurrentPage(0); }}
            style={{ ...filterInputStyle, paddingLeft: '32px' }}
          />
        </div>

        <button
          type="button"
          onClick={() => { setViewState('ADD'); setRecErrors({}); }}
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
          <span>Add Stock Receipt</span>
        </button>
      </div>

      <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', paddingBottom: '4px' }}>
        <table style={{ width: '100%', minWidth: '950px', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f95e10', color: '#ffffff' }}>
              <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap' }}>S.No</th>
              <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap' }}>Receipt No</th>
              <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap' }}>Request/Transfer No</th>
              <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap' }}>Source</th>
              <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap' }}>Item</th>
              <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap' }}>Sent Qty</th>
              <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap' }}>Received Qty</th>
              <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap' }}>Date</th>
              <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap' }}>Status</th>
              <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedReceipts.length === 0 ? (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                  No stock receipt records found.
                </td>
              </tr>
            ) : (
              paginatedReceipts.map((r, index) => {
                const refNum = r.reqTrfNo || r.refNo || r.requestNo || 'N/A';
                return (
                  <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#64748b' }}>
                      {currentPage * PAGE_SIZE + index + 1}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 800, color: '#0f172a' }}>{r.receiptNo}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 800, color: '#ff5a1f' }}>{refNum}</td>
                    <td style={{ padding: '14px 16px', color: '#475569' }}>{r.source}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0f172a' }}>{r.item}</td>
                    <td style={{ padding: '14px 16px', color: '#64748b' }}>{r.sentQty}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 800, color: '#16a34a' }}>{r.recQty}</td>
                    <td style={{ padding: '14px 16px', color: '#64748b' }}>{r.date || r.receivedDate}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        padding: '3px 10px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 700,
                        background: '#e6f4ea',
                        color: '#16a34a'
                      }}>
                        {r.status || 'Received'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => { setSelectedReceipt(r); setViewState('VIEW_DETAIL'); }}
                          title="View Receipt Details"
                          style={{
                            ...actionIconBtnStyle,
                            background: '#eff6ff',
                            border: '1px solid #bfdbfe',
                            color: '#2563eb'
                          }}
                        >
                          <EyeIcon size={15} color="#2563eb" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteReceipt(r)}
                          title="Delete Stock Receipt"
                          style={{
                            ...actionIconBtnStyle,
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            color: '#dc2626'
                          }}
                        >
                          <TrashIcon size={15} color="#dc2626" />
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

      <PaginationBar
        currentPage={currentPage}
        totalItems={filteredReceipts.length}
        pageSize={PAGE_SIZE}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
