import React, { useState, useEffect, useCallback } from 'react';
import { PlusIcon, SearchIcon, EyeIcon, ArrowLeftIcon, filterInputStyle, formInputStyle, formLabelStyle, PaginationBar } from './InventoryCommon';
import InventoryApi from '../../api/Inventory';

export default function BranchTransfer({ transfers, items: initialItems, onSaveTransfer }) {
  const [itemsList, setItemsList] = useState(initialItems || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);

  // View States: null | 'ADD' | 'VIEW_DETAIL'
  const [viewState, setViewState] = useState(null);
  const [selectedTransfer, setSelectedTransfer] = useState(null);

  // Form state
  const [trfForm, setTrfForm] = useState({
    fromBranch: 'Serviq Chennai Branch',
    toBranch: 'Serviq Madurai Branch',
    item: '',
    quantity: '',
    unit: 'kg',
    remarks: ''
  });
  const [trfErrors, setTrfErrors] = useState({});

  const availableBranches = [
    'Serviq Chennai Branch',
    'Serviq Madurai Branch',
    'Serviq Coimbatore Outlet',
    'Serviq Trichy Branch'
  ];

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

  const filteredTransfers = transfers.filter(t => {
    return !searchTerm.trim() ||
      t.transferNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.fromBranch.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.toBranch.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const PAGE_SIZE = 10;
  const paginatedTransfers = filteredTransfers.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  const validate = () => {
    const errors = {};
    if (!trfForm.fromBranch.trim()) errors.fromBranch = 'From Branch is required';
    if (!trfForm.item) errors.item = 'Item selection is required';
    if (!trfForm.quantity || Number(trfForm.quantity) <= 0) errors.quantity = 'Valid Required Quantity is required';
    if (trfForm.fromBranch === trfForm.toBranch) errors.toBranch = 'Destination Branch must be different from Source Branch';
    setTrfErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSaveTransfer(trfForm);
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
            background: selectedTransfer.status === 'Completed' ? '#e6f4ea' : '#fef3c7',
            color: selectedTransfer.status === 'Completed' ? '#16a34a' : '#d97706'
          }}>
            {selectedTransfer.status || 'Pending'}
          </span>
        </div>

        <div style={{ background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '28px', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', fontSize: '14px', marginBottom: '24px' }}>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '12px', marginBottom: '4px' }}>Transfer No</span>
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
              <span style={{ color: '#64748b', display: 'block', fontSize: '12px', marginBottom: '4px' }}>Quantity & Unit</span>
              <span style={{ color: '#ff5a1f', fontWeight: 700 }}>{selectedTransfer.quantity} {selectedTransfer.unit}</span>
            </div>
          </div>

          <div style={{ paddingTop: '20px', borderTop: '1px solid #cbd5e1' }}>
            <span style={{ color: '#64748b', display: 'block', fontSize: '12px', marginBottom: '6px', fontWeight: 700 }}>Reason / Remarks</span>
            <p style={{ margin: 0, fontSize: '14px', color: '#0f172a', background: '#ffffff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              {selectedTransfer.remarks || 'No remarks provided.'}
            </p>
          </div>
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
              <select
                value={trfForm.fromBranch}
                onChange={e => setTrfForm({ ...trfForm, fromBranch: e.target.value })}
                style={{ ...formInputStyle, borderColor: trfErrors.fromBranch ? '#ef4444' : '#cbd5e1' }}
              >
                {availableBranches.map(br => (
                  <option key={br} value={br}>{br}</option>
                ))}
              </select>
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
                {availableBranches.map(br => (
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
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(0); }}
            style={{ ...filterInputStyle, paddingLeft: '32px' }}
          />
        </div>

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
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px' }}>
              <th style={{ padding: '12px 16px', fontWeight: 800 }}>Transfer No</th>
              <th style={{ padding: '12px 16px', fontWeight: 800 }}>From Branch</th>
              <th style={{ padding: '12px 16px', fontWeight: 800 }}>To Branch</th>
              <th style={{ padding: '12px 16px', fontWeight: 800 }}>Item</th>
              <th style={{ padding: '12px 16px', fontWeight: 800 }}>Qty</th>
              <th style={{ padding: '12px 16px', fontWeight: 800 }}>Request Date</th>
              <th style={{ padding: '12px 16px', fontWeight: 800 }}>Status</th>
              <th style={{ padding: '12px 16px', fontWeight: 800, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTransfers.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                  No branch transfer records found.
                </td>
              </tr>
            ) : (
              paginatedTransfers.map(t => (
                <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 800, color: '#0f172a' }}>{t.transferNo}</td>
                  <td style={{ padding: '14px 16px', fontWeight: 600, color: '#0f172a' }}>{t.fromBranch}</td>
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: '#ff5a1f' }}>{t.toBranch}</td>
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0f172a' }}>{t.item}</td>
                  <td style={{ padding: '14px 16px', color: '#0f172a' }}>{t.quantity} {t.unit}</td>
                  <td style={{ padding: '14px 16px', color: '#64748b' }}>{t.date}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      padding: '3px 10px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 700,
                      background: t.status === 'Completed' ? '#e6f4ea' : '#fef3c7',
                      color: t.status === 'Completed' ? '#16a34a' : '#d97706'
                    }}>
                      {t.status || 'Pending'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <button
                      type="button"
                      onClick={() => { setSelectedTransfer(t); setViewState('VIEW_DETAIL'); }}
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
                        gap: '4px'
                      }}
                    >
                      <EyeIcon size={13} />
                      <span>View</span>
                    </button>
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
