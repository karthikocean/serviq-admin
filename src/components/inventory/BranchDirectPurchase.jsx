import React, { useState, useEffect, useCallback } from 'react';
import { PlusIcon, SearchIcon, EyeIcon, TrashIcon, filterInputStyle, formInputStyle, formLabelStyle, PaginationBar, preventSpaceInput, actionIconBtnStyle } from './InventoryCommon';
import InventoryApi from '../../api/Inventory';

export default function BranchDirectPurchase({ purchases, items: initialItems, onSaveDirectPurchase, onDeletePurchase, hasPermission }) {
  const canAdd = typeof hasPermission === 'function' ? hasPermission('inventory_direct_purchase', 'add') : true;
  const canView = typeof hasPermission === 'function' ? hasPermission('inventory_direct_purchase', 'view') : true;
  const canDelete = typeof hasPermission === 'function' ? hasPermission('inventory_direct_purchase', 'delete') : true;
  const [itemsList, setItemsList] = useState(initialItems || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(0);

  // View States: null | 'ADD' | 'VIEW_DETAIL'
  const [viewState, setViewState] = useState(null);
  const [selectedPurchase, setSelectedPurchase] = useState(null);

  // Direct Purchase form
  const [purForm, setPurForm] = useState({
    supplier: '',
    purchaseType: 'Vendor Direct Purchase',
    purchaseDate: new Date().toISOString().split('T')[0],
    invoiceNo: '',
    item: '',
    quantity: '',
    unit: 'kg',
    rate: '',
    remarks: ''
  });
  const [purErrors, setPurErrors] = useState({});

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
            setPurForm(prev => ({
              ...prev,
              item: prev.item || formatted[0].name,
              unit: prev.item ? prev.unit : (formatted[0].unit || 'kg')
            }));
          }
        }
      }
    } catch (err) {
      console.warn('Branch direct purchase items load error:', err);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const displayItems = itemsList.length > 0 ? itemsList : (initialItems || []);

  const handleItemSelect = (itemName) => {
    const matched = displayItems.find(i => (typeof i === 'string' ? i : (i.name || i.itemName)) === itemName);
    const unit = typeof matched === 'object' && matched ? (matched.unit || matched.unitOfMeasurement || 'kg') : 'kg';
    setPurForm(prev => ({
      ...prev,
      item: itemName,
      unit: unit
    }));
  };

  const filteredPurchases = purchases.filter(p => {
    const purNo = p.purchaseNo || p.id || '';
    const supp = p.supplier || p.supplierName || '';
    const itm = p.item || p.itemName || '';
    const pType = p.purchaseType || 'Vendor Direct Purchase';

    const matchesSearch = !searchTerm.trim() ||
      purNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supp.toLowerCase().includes(searchTerm.toLowerCase()) ||
      itm.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'All' || pType === typeFilter;

    return matchesSearch && matchesType;
  });

  const PAGE_SIZE = 10;
  const totalPages = Math.max(1, Math.ceil(filteredPurchases.length / PAGE_SIZE));

  useEffect(() => {
    if (currentPage >= totalPages && totalPages > 0) {
      setCurrentPage(Math.max(0, totalPages - 1));
    }
  }, [totalPages, currentPage]);

  const paginatedPurchases = filteredPurchases.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  const validate = () => {
    const errors = {};
    if (!purForm.supplier.trim()) errors.supplier = 'Vendor / Supplier Name is required';
    if (!purForm.purchaseDate) errors.purchaseDate = 'Purchase Date is required';
    if (!purForm.item) errors.item = 'Item selection is required';
    if (!purForm.quantity || Number(purForm.quantity) <= 0) errors.quantity = 'Valid Quantity is required';
    if (!purForm.rate || Number(purForm.rate) <= 0) errors.rate = 'Valid Purchase Rate is required';
    setPurErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSaveDirectPurchase(purForm);
    setViewState(null);
  };

  const getTypeBadgeStyle = (typeStr) => {
    if (typeStr === 'Material Purchase') {
      return { bg: '#ecfdf5', text: '#047857', border: '#a7f3d0', label: 'Material Purchase' };
    } else if (typeStr === 'Vendor Direct Purchase' || typeStr === 'Direct Purchase') {
      return { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe', label: 'Vendor Direct Purchase' };
    }
    return { bg: '#fef3c7', text: '#b45309', border: '#fde68a', label: typeStr || 'Direct Purchase' };
  };

  // Render View Direct Purchase Detail Page View
  if (viewState === 'VIEW_DETAIL' && selectedPurchase) {
    const typeInfo = getTypeBadgeStyle(selectedPurchase.purchaseType || 'Vendor Direct Purchase');
    const suppName = selectedPurchase.supplier || selectedPurchase.supplierName || 'Local Vendor';
    const itemTitle = selectedPurchase.item || selectedPurchase.itemName;
    const purCode = selectedPurchase.purchaseNo || selectedPurchase.id;
    const invCode = selectedPurchase.invoiceNo || selectedPurchase.invoiceNumber || 'BILL-DIRECT';
    const purTotal = selectedPurchase.total ? selectedPurchase.total : (selectedPurchase.totalAmount ? selectedPurchase.totalAmount : selectedPurchase.quantity * (selectedPurchase.rate || selectedPurchase.unitPrice || 0));

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
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>
                Direct Vendor Purchase Order: {purCode}
              </h2>
              <span style={{ fontSize: '13px', color: '#64748b' }}>Outlet Emergency Vendor Purchase & Stock Credit</span>
            </div>
          </div>

          <span style={{
            background: typeInfo.bg,
            color: typeInfo.text,
            border: `1px solid ${typeInfo.border}`,
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {typeInfo.label}
          </span>
        </div>

        <div style={{ background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '28px', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', fontSize: '14px', marginBottom: '24px' }}>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '12px', marginBottom: '4px' }}>Purchase Code</span>
              <strong style={{ color: '#ff5a1f', fontSize: '18px', fontWeight: 900 }}>{purCode}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '12px', marginBottom: '4px' }}>Vendor Bill Ref</span>
              <strong style={{ color: '#0f172a', fontSize: '15px' }}>{invCode}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '12px', marginBottom: '4px' }}>Vendor / Supplier</span>
              <span style={{ color: '#0f172a', fontWeight: 800, fontSize: '15px' }}>{suppName}</span>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '12px', marginBottom: '4px' }}>Purchase Date</span>
              <span style={{ color: '#0f172a', fontWeight: 600 }}>{selectedPurchase.date || selectedPurchase.purchaseDate}</span>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '12px', marginBottom: '4px' }}>Stock Item</span>
              <span style={{ color: '#0f172a', fontWeight: 800 }}>{itemTitle}</span>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '12px', marginBottom: '4px' }}>Quantity & Unit</span>
              <span style={{ color: '#0f172a', fontWeight: 700 }}>{selectedPurchase.quantity} {selectedPurchase.unit}</span>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '12px', marginBottom: '4px' }}>Unit Purchase Rate</span>
              <span style={{ color: '#0f172a', fontWeight: 600 }}>₹{selectedPurchase.rate || selectedPurchase.unitPrice || 0}</span>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '12px', marginBottom: '4px' }}>Total Amount Paid</span>
              <strong style={{ color: '#16a34a', fontSize: '18px' }}>₹{Number(purTotal).toLocaleString('en-IN')}</strong>
            </div>
          </div>

          <div style={{ paddingTop: '20px', borderTop: '1px solid #cbd5e1' }}>
            <span style={{ color: '#64748b', display: 'block', fontSize: '12px', marginBottom: '6px', fontWeight: 700 }}>Remarks & Reason</span>
            <p style={{ margin: 0, fontSize: '14px', color: '#0f172a', background: '#ffffff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              {selectedPurchase.remarks || selectedPurchase.notes || 'No remarks provided.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Render Direct Purchase Form Page View
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
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>
                Add Direct Vendor Purchase
              </h2>
              <span style={{ fontSize: '13px', color: '#64748b' }}>Records direct vendor purchase at branch level with code (e.g. PU-001) & credits branch stock</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          {/* Row 1: Supplier * (170) & Purchase Date * (171) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={formLabelStyle}>
                Supplier <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Local Fresh Market Vendor"
                value={purForm.supplier}
                onChange={e => setPurForm({ ...purForm, supplier: e.target.value })}
                style={{ ...formInputStyle, borderColor: purErrors.supplier ? '#ef4444' : '#cbd5e1' }}
              />
              {purErrors.supplier && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', display: 'block', fontWeight: 600 }}>{purErrors.supplier}</span>}
            </div>

            <div>
              <label style={formLabelStyle}>
                Purchase Date <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="date"
                value={purForm.purchaseDate}
                onChange={e => setPurForm({ ...purForm, purchaseDate: e.target.value })}
                style={{ ...formInputStyle, borderColor: purErrors.purchaseDate ? '#ef4444' : '#cbd5e1' }}
              />
              {purErrors.purchaseDate && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', display: 'block', fontWeight: 600 }}>{purErrors.purchaseDate}</span>}
            </div>
          </div>

          {/* Row 2: Invoice Number (172) & Item * (173) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={formLabelStyle}>
                Invoice Number
              </label>
              <input
                type="text"
                placeholder="e.g. INV-9041"
                value={purForm.invoiceNo}
                onChange={e => setPurForm({ ...purForm, invoiceNo: e.target.value })}
                style={{ ...formInputStyle }}
              />
            </div>

            <div>
              <label style={formLabelStyle}>
                Item <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={purForm.item}
                onChange={e => handleItemSelect(e.target.value)}
                style={{ ...formInputStyle, borderColor: purErrors.item ? '#ef4444' : '#cbd5e1' }}
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
              {purErrors.item && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', display: 'block', fontWeight: 600 }}>{purErrors.item}</span>}
            </div>
          </div>

          {/* Row 3: Quantity * (174) & Unit (175) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={formLabelStyle}>
                Quantity <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="number"
                placeholder="e.g. 15"
                value={purForm.quantity}
                onChange={e => setPurForm({ ...purForm, quantity: e.target.value })}
                style={{ ...formInputStyle, borderColor: purErrors.quantity ? '#ef4444' : '#cbd5e1' }}
              />
              {purErrors.quantity && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', display: 'block', fontWeight: 600 }}>{purErrors.quantity}</span>}
            </div>

            <div>
              <label style={formLabelStyle}>
                Unit
              </label>
              <input
                type="text"
                value={purForm.unit}
                onChange={e => setPurForm({ ...purForm, unit: e.target.value })}
                placeholder="e.g. kg, Ltr, pcs"
                style={{ ...formInputStyle }}
              />
            </div>
          </div>

          {/* Row 4: Purchase Rate * (176) & Total Amount — Auto (177) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={formLabelStyle}>
                Purchase Rate <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="number"
                placeholder="e.g. 120"
                value={purForm.rate}
                onChange={e => setPurForm({ ...purForm, rate: e.target.value })}
                style={{ ...formInputStyle, borderColor: purErrors.rate ? '#ef4444' : '#cbd5e1' }}
              />
              {purErrors.rate && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', display: 'block', fontWeight: 600 }}>{purErrors.rate}</span>}
            </div>

            <div>
              <label style={formLabelStyle}>
                Total Amount — Auto
              </label>
              <input
                type="text"
                readOnly
                value={purForm.quantity && purForm.rate ? `₹${(Number(purForm.quantity) * Number(purForm.rate)).toLocaleString('en-IN')}` : '₹0'}
                style={{ ...formInputStyle, background: '#f8fafc', fontWeight: 800, color: '#16a34a' }}
              />
            </div>
          </div>

          {/* Row 5: Remarks (178) */}
          <div style={{ marginBottom: '32px' }}>
            <label style={formLabelStyle}>
              Remarks
            </label>
            <textarea
              rows="3"
              placeholder="e.g. Direct local purchase for immediate stock"
              value={purForm.remarks}
              onChange={e => setPurForm({ ...purForm, remarks: e.target.value })}
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
                background: 'linear-gradient(135deg, #ff5a1f 0%, #ea580c 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '12px 32px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(255, 90, 31, 0.3)'
              }}
            >
              Save & Credit Branch Stock
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '240px' }}>
            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}>
              <SearchIcon size={14} />
            </span>
            <input
              type="text"
              placeholder="Search code, vendor..."
              value={searchTerm}
              onKeyDown={preventSpaceInput}
              onChange={e => { setSearchTerm(e.target.value.replace(/\s/g, '')); setCurrentPage(0); }}
              style={{ ...filterInputStyle, paddingLeft: '32px' }}
            />
          </div>

          <div style={{ width: '180px' }}>
            <select
              value={typeFilter}
              onChange={e => { setTypeFilter(e.target.value); setCurrentPage(0); }}
              style={filterInputStyle}
            >
              <option value="All">All Purchase Types</option>
              <option value="Vendor Direct Purchase">Vendor Direct Purchase</option>
              <option value="Material Purchase">Material Purchase</option>
            </select>
          </div>
        </div>

        {canAdd && (
        <button
          type="button"
          onClick={() => { setViewState('ADD'); setPurErrors({}); }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, #ff5a1f 0%, #ea580c 100%)',
            color: '#ffffff',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 2px 10px rgba(255, 90, 31, 0.3)'
          }}
        >
          <PlusIcon size={15} />
          <span>Add Direct Purchase</span>
        </button>
        )}
      </div>

      <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', paddingBottom: '4px' }}>
        <table style={{ width: '100%', minWidth: '950px', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f95e10', color: '#ffffff' }}>
              <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap' }}>S.No</th>
              <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap' }}>Purchase Date</th>
              <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap' }}>Purchase No.</th>
              <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap' }}>Supplier</th>
              <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap' }}>Item</th>
              <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap' }}>Quantity</th>
              <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap' }}>Unit</th>
              <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap' }}>Purchase Rate</th>
              <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap' }}>Total Amount</th>
              <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap' }}>Status</th>
              <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedPurchases.length === 0 ? (
              <tr>
                <td colSpan="11" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                  No direct purchase records found.
                </td>
              </tr>
            ) : (
              paginatedPurchases.map((p, index) => {
                const purCode = p.purchaseNo || p.id;
                const suppName = p.supplier || p.supplierName || 'Local Vendor';
                const itemTitle = p.item || p.itemName;
                const purRate = p.rate || p.unitPrice || 0;
                const purTotal = p.total ? p.total : (p.totalAmount ? p.totalAmount : p.quantity * purRate);
                const status = p.status || 'Received';

                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#64748b' }}>
                      {currentPage * PAGE_SIZE + index + 1}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '12px' }}>
                      {p.date || p.purchaseDate}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 900, color: '#ff5a1f' }}>
                      {purCode}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0f172a' }}>
                      {suppName}
                      {p.invoiceNo && (
                        <span style={{ display: 'block', fontSize: '11px', color: '#64748b', fontWeight: 500 }}>
                          #{p.invoiceNo || p.invoiceNumber}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 800, color: '#0f172a' }}>
                      {itemTitle}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#0f172a', fontWeight: 700 }}>
                      {p.quantity}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#475569' }}>
                      {p.unit || 'kg'}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#0f172a' }}>
                      ₹{Number(purRate).toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 900, color: '#16a34a' }}>
                      ₹{Number(purTotal).toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        background: '#e6f4ea',
                        color: '#16a34a',
                        padding: '3px 10px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 700
                      }}>
                        {status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        {canView && (
                        <button
                          type="button"
                          onClick={() => { setSelectedPurchase(p); setViewState('VIEW_DETAIL'); }}
                          title="View Purchase Details"
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
                        {canDelete && (
                        <button
                          type="button"
                          onClick={() => onDeletePurchase(p)}
                          title="Delete Direct Purchase"
                          style={{
                            ...actionIconBtnStyle,
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            color: '#dc2626'
                          }}
                        >
                          <TrashIcon size={15} color="#dc2626" />
                        </button>
                        )}
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
        totalItems={filteredPurchases.length}
        pageSize={PAGE_SIZE}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
