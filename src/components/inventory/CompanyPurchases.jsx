import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, SearchIcon, EyeIcon, TrashIcon, PencilIcon, filterInputStyle, formInputStyle, formLabelStyle, PaginationBar, preventSpaceInput, actionIconBtnStyle } from './InventoryCommon';
import InventoryApi from '../../api/Inventory';
import ShowNotifications from '../../helper/ShowNotifications';

export default function CompanyPurchases({ purchases: initialPurchases, items: initialItems, onSavePurchase, onDeletePurchase }) {
  const navigate = useNavigate();
  const [purchasesList, setPurchasesList] = useState(initialPurchases || []);
  const [itemsList, setItemsList] = useState(initialItems || []);
  const [vendorsList, setVendorsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [itemFilter, setItemFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(0);

  // View States: null | 'ADD_PURCHASE' | 'VIEW_PURCHASE' | 'VENDOR_MODAL'
  const [viewState, setViewState] = useState(null);
  const [selectedPurchase, setSelectedPurchase] = useState(null);

  // Vendor Management Modal State
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [vendorForm, setVendorForm] = useState({
    vendorCode: 'VEN-001',
    name: '',
    companyName: '',
    phone: '',
    status: 'ACTIVE'
  });
  const [vendorErrors, setVendorErrors] = useState({});

  // Purchase Form State - Fields strictly matched to reference layout
  const [purchaseForm, setPurchaseForm] = useState({
    purchaseType: 'Material Purchase (Ingredients / Stock)',
    supplier: '',
    vendorId: '',
    item: '',
    itemId: '',
    invoiceNo: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    unit: 'kg',
    quantity: '',
    rate: '',
    remarks: ''
  });
  const [purchaseErrors, setPurchaseErrors] = useState({});

  // -------------------------------------------------------------
  // API FETCH FOR PURCHASES, ITEMS & VENDORS
  // -------------------------------------------------------------
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {

      // 2. Fetch Items
      const itemsRes = await InventoryApi.getItems({ limit: 100 });
      if (itemsRes?.status && itemsRes?.response) {
        const rawItems = itemsRes.response.data || itemsRes.response.items || (Array.isArray(itemsRes.response) ? itemsRes.response : []);
        if (Array.isArray(rawItems) && rawItems.length > 0) {
          const formattedItems = rawItems.map(i => ({
            id: i._id || i.id,
            _id: i._id || i.id,
            name: i.name,
            unit: i.unit || 'kg',
            category: i.category || 'General'
          }));
          setItemsList(formattedItems);
        }
      }

      // 3. Fetch Purchases
      const purRes = await InventoryApi.getPurchases();
      if (purRes?.status && purRes?.response) {
        const rawPurchases = purRes.response.data || purRes.response || [];
        if (Array.isArray(rawPurchases) && rawPurchases.length > 0) {
          const formattedPur = rawPurchases.map(p => ({
            id: p._id || p.id,
            _id: p._id || p.id,
            purchaseNo: p.purchaseNo || `PU-${String(p._id || '').slice(-3).toUpperCase()}`,
            purchaseType: p.purchaseType || 'Material Purchase',
            supplier: p.supplierName || p.supplier || (typeof p.vendorId === 'object' ? p.vendorId?.name : '') || 'General Vendor',
            supplierName: p.supplierName || p.supplier || '',
            date: p.purchaseDate ? new Date(p.purchaseDate).toISOString().split('T')[0] : (p.date || new Date().toISOString().split('T')[0]),
            purchaseDate: p.purchaseDate ? new Date(p.purchaseDate).toISOString().split('T')[0] : (p.date || new Date().toISOString().split('T')[0]),
            invoiceNo: p.invoiceNumber || p.invoiceNo || 'N/A',
            item: p.itemName || (typeof p.itemId === 'object' ? p.itemId?.name : '') || p.item || 'N/A',
            quantity: p.purchaseQty !== undefined ? p.purchaseQty : (p.quantity || 0),
            unit: p.unit || (typeof p.itemId === 'object' ? p.itemId?.unit : 'kg') || 'kg',
            rate: p.unitPrice !== undefined ? p.unitPrice : (p.rate || 0),
            total: p.totalAmount !== undefined ? p.totalAmount : (p.total || 0),
            remarks: p.remarks || p.notes || ''
          }));
          setPurchasesList(formattedPur);
        }
      }
    } catch (err) {
      console.warn('Inventory purchase data load note:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Combined dropdown list sources
  const displayItems = itemsList.length > 0 ? itemsList : initialItems;
  const displayPurchases = purchasesList.length > 0 ? purchasesList : initialPurchases;

  const suppliers = ['All', ...Array.from(new Set([
    ...vendorsList.map(v => v.name),
    ...displayPurchases.map(p => p.supplier || p.supplierName).filter(Boolean)
  ]))];

  const purchaseTypes = [
    'All',
    'Material Purchase (Ingredients / Stock)',
    'Vendor Direct Purchase (Supplies / Goods)',
    'Asset / Equipment Purchase'
  ];

  // Auto handle item selection
  const handleItemSelect = (itemName) => {
    const matched = displayItems.find(i => i.name === itemName || i.id === itemName);
    setPurchaseForm(prev => ({
      ...prev,
      item: matched ? matched.name : itemName,
      itemId: matched ? (matched._id || matched.id) : '',
      unit: matched ? matched.unit : (prev.unit || 'kg')
    }));
  };

  // Auto handle vendor selection
  const handleVendorSelect = (vendorVal) => {
    if (vendorVal === 'ADD_NEW_VENDOR') {
      openAddVendor();
      return;
    }
    const matched = vendorsList.find(v => v.name === vendorVal || v._id === vendorVal || v.vendorCode === vendorVal);
    setPurchaseForm(prev => ({
      ...prev,
      supplier: matched ? matched.name : vendorVal,
      vendorId: matched ? matched._id : ''
    }));
  };

  // Filter purchase list
  const filteredPurchases = displayPurchases.filter(p => {
    const purNo = p.purchaseNo || p.id || '';
    const supp = p.supplier || p.supplierName || '';
    const itm = p.item || p.itemName || '';
    const inv = p.invoiceNo || p.invoiceNumber || '';
    const pType = p.purchaseType || 'Material Purchase';

    const matchesSearch = !searchTerm.trim() ||
      purNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supp.toLowerCase().includes(searchTerm.toLowerCase()) ||
      itm.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.toLowerCase().includes(searchTerm.toLowerCase());

    const pDate = p.purchaseDate || p.date || '';
    const matchesStartDate = !startDate || (pDate >= startDate);
    const matchesEndDate = !endDate || (pDate <= endDate);

    const matchesSupplier = supplierFilter === 'All' || supp === supplierFilter;
    const matchesType = typeFilter === 'All' || pType === typeFilter || pType.includes(typeFilter);
    const matchesItem = itemFilter === 'All' || itm === itemFilter;

    return matchesSearch && matchesSupplier && matchesType && matchesItem && matchesStartDate && matchesEndDate;
  });

  const PAGE_SIZE = 10;
  const paginatedPurchases = filteredPurchases.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  // -------------------------------------------------------------
  // VENDOR MANAGEMENT HANDLERS
  // -------------------------------------------------------------
  const openAddVendor = () => {
    const nextNum = vendorsList.length + 1;
    setVendorForm({
      vendorCode: `VEN-${String(nextNum).padStart(3, '0')}`,
      name: '',
      companyName: '',
      phone: '',
      status: 'ACTIVE'
    });
    setEditingVendor(null);
    setVendorErrors({});
    setShowVendorModal(true);
  };

  const openEditVendor = (v) => {
    setEditingVendor(v);
    setVendorForm({
      vendorCode: v.vendorCode || `VEN-001`,
      name: v.name || '',
      companyName: v.companyName || '',
      phone: v.phone || '',
      status: v.status || 'ACTIVE'
    });
    setVendorErrors({});
    setShowVendorModal(true);
  };

  const validateVendor = () => {
    const errors = {};
    if (!vendorForm.name.trim()) errors.name = 'Vendor / Contact Name is required';
    if (!vendorForm.companyName.trim()) errors.companyName = 'Company Name is required';
    if (!vendorForm.phone.trim()) errors.phone = 'Phone Number is required';
    setVendorErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleVendorSubmit = async (e) => {
    e.preventDefault();
    if (!validateVendor()) return;

    setIsSubmitting(true);
    try {
      if (editingVendor) {
        const res = await InventoryApi.updateVendor(editingVendor._id || editingVendor.id, vendorForm);
        if (res?.status) {
          setShowVendorModal(false);
          fetchData();
        }
      } else {
        const res = await InventoryApi.createVendor(vendorForm);
        if (res?.status) {
          setShowVendorModal(false);
          // Auto select newly created vendor if in purchase form
          if (res.response?.data?.name) {
            setPurchaseForm(prev => ({
              ...prev,
              supplier: res.response.data.name,
              vendorId: res.response.data._id
            }));
          }
          fetchData();
        }
      }
    } catch (err) {
      ShowNotifications.showAlertNotification('Failed to save vendor details', false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteVendor = async (v) => {
    if (window.confirm(`Are you sure you want to delete vendor "${v.name}"?`)) {
      const res = await InventoryApi.deleteVendor(v._id || v.id);
      if (res?.status) {
        fetchData();
      }
    }
  };


  const validatePurchase = () => {
    const errors = {};
    if (!purchaseForm.supplier.trim()) errors.supplier = 'Vendor / Supplier Name is required';
    if (!purchaseForm.item) errors.item = 'Material / Ingredient Item selection is required';
    if (!purchaseForm.purchaseDate) errors.purchaseDate = 'Purchase Date is required';
    if (!purchaseForm.quantity || Number(purchaseForm.quantity) <= 0) errors.quantity = 'Valid Purchase Quantity is required';
    if (!purchaseForm.rate || Number(purchaseForm.rate) <= 0) errors.rate = 'Valid Rate per Unit is required';
    setPurchaseErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePurchaseSubmit = async (e) => {
    e.preventDefault();
    if (!validatePurchase()) return;

    setIsSubmitting(true);
    try {
      const matchedItem = displayItems.find(i => i.name === purchaseForm.item);
      const payload = {
        purchaseType: purchaseForm.purchaseType,
        supplierName: purchaseForm.supplier,
        supplier: purchaseForm.supplier,
        vendorId: purchaseForm.vendorId || undefined,
        itemId: purchaseForm.itemId || (matchedItem ? matchedItem.id : undefined),
        item: purchaseForm.item,
        invoiceNumber: purchaseForm.invoiceNo,
        invoiceNo: purchaseForm.invoiceNo,
        purchaseDate: purchaseForm.purchaseDate,
        unit: purchaseForm.unit || 'kg',
        purchaseQty: Number(purchaseForm.quantity),
        quantity: Number(purchaseForm.quantity),
        unitPrice: Number(purchaseForm.rate),
        rate: Number(purchaseForm.rate),
        totalAmount: Number(purchaseForm.quantity) * Number(purchaseForm.rate),
        remarks: purchaseForm.remarks
      };

      const res = await InventoryApi.recordPurchase(payload);

      if (res?.status) {
        setViewState(null);
        if (onSavePurchase) onSavePurchase(purchaseForm);
        fetchData();
      }
    } catch (err) {
      ShowNotifications.showAlertNotification('Failed to record purchase', false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (p) => {
    if (window.confirm(`Are you sure you want to delete purchase ${p.purchaseNo || p.id}?`)) {
      if (p._id) {
        const res = await InventoryApi.deletePurchase(p._id);
        if (res?.status) {
          fetchData();
        }
      } else {
        if (onDeletePurchase) onDeletePurchase(p);
        setPurchasesList(prev => prev.filter(item => item.id !== p.id));
      }
    }
  };

  const getTypeBadgeStyle = (typeStr) => {
    if (typeStr && typeStr.includes('Material')) {
      return { bg: '#ecfdf5', text: '#047857', border: '#a7f3d0', label: 'Material Purchase' };
    } else if (typeStr && typeStr.includes('Vendor')) {
      return { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe', label: 'Vendor Direct Purchase' };
    }
    return { bg: '#fef3c7', text: '#b45309', border: '#fde68a', label: typeStr || 'Purchase' };
  };

  if (viewState === 'VIEW_PURCHASE' && selectedPurchase) {
    const typeInfo = getTypeBadgeStyle(selectedPurchase.purchaseType || 'Material Purchase');
    const suppName = selectedPurchase.supplier || selectedPurchase.supplierName || 'General Supplier';
    const itemTitle = selectedPurchase.item || selectedPurchase.itemName;
    const purCode = selectedPurchase.purchaseNo || selectedPurchase.id;
    const invCode = selectedPurchase.invoiceNo || selectedPurchase.invoiceNumber || 'N/A';
    const purTotal = selectedPurchase.total ? selectedPurchase.total : (selectedPurchase.totalAmount ? selectedPurchase.totalAmount : (selectedPurchase.quantity || 0) * (selectedPurchase.rate || 0));

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
                Purchase Record: {purCode}
              </h2>
              <span style={{ fontSize: '13px', color: '#64748b' }}>Vendor Purchase Order & Material Valuation Log</span>
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
              <span style={{ color: '#64748b', display: 'block', fontSize: '12px', marginBottom: '4px' }}>Invoice / Bill Reference</span>
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
              <span style={{ color: '#64748b', display: 'block', fontSize: '12px', marginBottom: '4px' }}>Material Item</span>
              <span style={{ color: '#0f172a', fontWeight: 800 }}>{itemTitle}</span>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '12px', marginBottom: '4px' }}>Quantity & Unit</span>
              <span style={{ color: '#0f172a', fontWeight: 700 }}>{selectedPurchase.quantity} {selectedPurchase.unit}</span>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '12px', marginBottom: '4px' }}>Unit Purchase Rate</span>
              <span style={{ color: '#0f172a', fontWeight: 600 }}>₹{selectedPurchase.rate || 0}</span>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '12px', marginBottom: '4px' }}>Total Purchase Valuation</span>
              <strong style={{ color: '#16a34a', fontSize: '18px' }}>₹{Number(purTotal).toLocaleString('en-IN')}</strong>
            </div>
          </div>

          <div style={{ paddingTop: '20px', borderTop: '1px solid #cbd5e1' }}>
            <span style={{ color: '#64748b', display: 'block', fontSize: '12px', marginBottom: '6px', fontWeight: 700 }}>Remarks / Vendor Notes</span>
            <p style={{ margin: 0, fontSize: '14px', color: '#0f172a', background: '#ffffff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              {selectedPurchase.remarks || selectedPurchase.notes || 'No extra purchase remarks logged.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW: RECORD NEW PURCHASE (MATCHING SCREENSHOT LAYOUT)
  // -------------------------------------------------------------
  if (viewState === 'ADD_PURCHASE') {
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
                Record Vendor / Material Purchase
              </h2>
              <span style={{ fontSize: '13px', color: '#64748b' }}>Generates sequential Purchase Code (e.g. PU-001) & updates stock inventory</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/inventory/vendors')}
            style={{
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              color: '#0f172a',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <PlusIcon size={14} />
            <span>Manage Vendors</span>
          </button>
        </div>

        <form onSubmit={handlePurchaseSubmit} style={{ width: '100%' }}>
          {/* Row 1: Purchase Category / Type & Vendor / Supplier Name */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={formLabelStyle}>
                Purchase Category / Type <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={purchaseForm.purchaseType}
                onChange={e => setPurchaseForm({ ...purchaseForm, purchaseType: e.target.value })}
                style={{ ...formInputStyle }}
              >
                <option value="Material Purchase (Ingredients / Stock)">Material Purchase (Ingredients / Stock)</option>
                <option value="Vendor Direct Purchase (Supplies / Goods)">Vendor Direct Purchase (Supplies / Goods)</option>
                <option value="Asset / Equipment Purchase">Asset / Equipment Purchase</option>
              </select>
            </div>

            <div>
              <label style={formLabelStyle}>
                Vendor / Supplier Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={purchaseForm.supplier}
                onChange={e => handleVendorSelect(e.target.value)}
                style={{ ...formInputStyle, borderColor: purchaseErrors.supplier ? '#ef4444' : '#cbd5e1' }}
              >
                <option value="">-- Select Vendor / Supplier --</option>
                {vendorsList.map(v => (
                  <option key={v._id || v.vendorCode} value={v.name}>
                    {v.vendorCode ? `[${v.vendorCode}] ${v.name}` : v.name} {v.companyName ? `(${v.companyName})` : ''}
                  </option>
                ))}
                <option value="ADD_NEW_VENDOR" style={{ fontWeight: 800, color: '#ff5a1f' }}>
                  + Add New Vendor...
                </option>
              </select>
              {purchaseErrors.supplier && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', display: 'block', fontWeight: 600 }}>{purchaseErrors.supplier}</span>}
            </div>
          </div>

          {/* Row 2: Material / Ingredient Item & Invoice No / Vendor Bill Ref */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={formLabelStyle}>
                Material / Ingredient Item <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={purchaseForm.item}
                onChange={e => handleItemSelect(e.target.value)}
                style={{ ...formInputStyle, borderColor: purchaseErrors.item ? '#ef4444' : '#cbd5e1' }}
              >
                <option value="">-- Select Material Item --</option>
                {displayItems.map(i => (
                  <option key={i.id || i._id} value={i.name}>{i.name}</option>
                ))}
              </select>
              {purchaseErrors.item && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', display: 'block', fontWeight: 600 }}>{purchaseErrors.item}</span>}
            </div>

            <div>
              <label style={formLabelStyle}>
                Invoice No / Vendor Bill Ref
              </label>
              <input
                type="text"
                placeholder="e.g. INV-8891 / BILL-102"
                value={purchaseForm.invoiceNo}
                onChange={e => setPurchaseForm({ ...purchaseForm, invoiceNo: e.target.value })}
                style={{ ...formInputStyle }}
              />
            </div>
          </div>

          {/* Row 3: Purchase Date & Unit of Measure */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={formLabelStyle}>
                Purchase Date <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="date"
                value={purchaseForm.purchaseDate}
                onChange={e => setPurchaseForm({ ...purchaseForm, purchaseDate: e.target.value })}
                style={{ ...formInputStyle, borderColor: purchaseErrors.purchaseDate ? '#ef4444' : '#cbd5e1' }}
              />
              {purchaseErrors.purchaseDate && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', display: 'block', fontWeight: 600 }}>{purchaseErrors.purchaseDate}</span>}
            </div>

            <div>
              <label style={formLabelStyle}>
                Unit of Measure
              </label>
              <input
                type="text"
                value={purchaseForm.unit}
                onChange={e => setPurchaseForm({ ...purchaseForm, unit: e.target.value })}
                placeholder="kg"
                style={{ ...formInputStyle }}
              />
            </div>
          </div>

          {/* Row 4: Purchase Quantity, Rate per Unit & Total Valuation */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={formLabelStyle}>
                Purchase Quantity <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="number"
                placeholder="e.g. 100"
                value={purchaseForm.quantity}
                onChange={e => setPurchaseForm({ ...purchaseForm, quantity: e.target.value })}
                style={{ ...formInputStyle, borderColor: purchaseErrors.quantity ? '#ef4444' : '#cbd5e1' }}
              />
              {purchaseErrors.quantity && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', display: 'block', fontWeight: 600 }}>{purchaseErrors.quantity}</span>}
            </div>

            <div>
              <label style={formLabelStyle}>
                Rate per Unit (₹) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="number"
                placeholder="e.g. 90"
                value={purchaseForm.rate}
                onChange={e => setPurchaseForm({ ...purchaseForm, rate: e.target.value })}
                style={{ ...formInputStyle, borderColor: purchaseErrors.rate ? '#ef4444' : '#cbd5e1' }}
              />
              {purchaseErrors.rate && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', display: 'block', fontWeight: 600 }}>{purchaseErrors.rate}</span>}
            </div>

            <div>
              <label style={formLabelStyle}>
                Total Valuation (₹)
              </label>
              <input
                type="text"
                readOnly
                value={purchaseForm.quantity && purchaseForm.rate ? `₹${(Number(purchaseForm.quantity) * Number(purchaseForm.rate)).toLocaleString('en-IN')}` : '₹0'}
                style={{ ...formInputStyle, background: '#f8fafc', fontWeight: 800, color: '#16a34a' }}
              />
            </div>
          </div>

          {/* Row 5: Remarks / Purchase Order Notes */}
          <div style={{ marginBottom: '32px' }}>
            <label style={formLabelStyle}>
              Remarks / Purchase Order Notes
            </label>
            <textarea
              rows="3"
              placeholder="e.g. Vendor bulk discount applied, quality check verified at receiving bay..."
              value={purchaseForm.remarks}
              onChange={e => setPurchaseForm({ ...purchaseForm, remarks: e.target.value })}
              style={{ ...formInputStyle, height: 'auto', padding: '12px 16px' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '14px', paddingTop: '24px', borderTop: '1px solid #f1f5f9' }}>
            <button
              type="button"
              onClick={() => setViewState(null)}
              disabled={isSubmitting}
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
              disabled={isSubmitting}
              style={{
                background: 'linear-gradient(135deg, #ff5a1f 0%, #ea580c 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '12px 32px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(255, 90, 31, 0.3)',
                opacity: isSubmitting ? 0.7 : 1
              }}
            >
              {isSubmitting ? 'Recording Purchase...' : 'Save & Record Purchase Order'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  const formatDateDDMMYYYY = (dateStr) => {
    if (!dateStr) return '';
    const cleanStr = String(dateStr).split('T')[0];
    const parts = cleanStr.split('-');
    if (parts.length === 3 && parts[0].length === 4) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  };

  // -------------------------------------------------------------
  // RENDER MAIN TABLE / LIST VIEW
  // -------------------------------------------------------------
  return (
    <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
      {/* Top Filter and Action Bar: Row 1 (Buttons) & Row 2 (Full Width Search & Inputs) */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '14px' }}>

        {/* ROW 1: Vendors & Record New Purchase buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => navigate('/inventory/vendors')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#ffffff',
              color: '#0f172a',
              border: '1px solid #cbd5e1',
              padding: '9px 18px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}
          >
            <span>Vendors ({vendorsList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setViewState('ADD_PURCHASE');
              setPurchaseErrors({});
              setPurchaseForm({
                purchaseType: 'Material Purchase (Ingredients / Stock)',
                supplier: vendorsList.length > 0 ? vendorsList[0].name : '',
                vendorId: vendorsList.length > 0 ? vendorsList[0]._id : '',
                item: displayItems.length > 0 ? displayItems[0].name : '',
                itemId: displayItems.length > 0 ? (displayItems[0]._id || displayItems[0].id) : '',
                invoiceNo: '',
                purchaseDate: new Date().toISOString().split('T')[0],
                unit: displayItems.length > 0 ? displayItems[0].unit : 'kg',
                quantity: '',
                rate: '',
                remarks: ''
              });
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #ff5a1f 0%, #ea580c 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '9px 20px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(255, 90, 31, 0.3)'
            }}
          >
            <PlusIcon size={15} />
            <span>Record New Purchase</span>
          </button>
        </div>

        {/* ROW 2: Full Width Search & Filter Controls */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
          width: '100%',
          background: '#f8fafc',
          padding: '12px 16px',
          borderRadius: '10px',
          border: '1px solid #edf2f7',
          boxSizing: 'border-box'
        }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1 1 220px', minWidth: '200px' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
              <SearchIcon size={14} color="#94a3b8" />
            </span>
            <input
              type="text"
              placeholder="Search code, supplier..."
              value={searchTerm}
              onKeyDown={preventSpaceInput}
              onChange={e => { setSearchTerm(e.target.value.replace(/\s/g, '')); setCurrentPage(0); }}
              style={{ ...filterInputStyle, paddingLeft: '34px', width: '100%' }}
            />
          </div>

          {/* All Suppliers Dropdown */}
          <div style={{ flex: '1 1 160px', minWidth: '150px' }}>
            <select
              value={supplierFilter}
              onChange={e => { setSupplierFilter(e.target.value); setCurrentPage(0); }}
              style={{ ...filterInputStyle, width: '100%' }}
            >
              <option value="All">All Suppliers</option>
              {suppliers.filter(s => s !== 'All').map(sup => (
                <option key={sup} value={sup}>{sup}</option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'nowrap' }}>
            <input
              type="date"
              value={startDate}
              onChange={e => { setStartDate(e.target.value); setCurrentPage(0); }}
              style={{ ...filterInputStyle, width: '140px' }}
              title="From Date"
            />
            <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 600 }}>to</span>
            <input
              type="date"
              value={endDate}
              onChange={e => { setEndDate(e.target.value); setCurrentPage(0); }}
              style={{ ...filterInputStyle, width: '140px' }}
              title="To Date"
            />
          </div>

          {/* All Items Dropdown */}
          <div style={{ flex: '1 1 150px', minWidth: '140px' }}>
            <select
              value={itemFilter}
              onChange={e => { setItemFilter(e.target.value); setCurrentPage(0); }}
              style={{ ...filterInputStyle, width: '100%' }}
            >
              <option value="All">All Items</option>
              {displayItems.map(i => (
                <option key={i.id || i._id} value={i.name}>{i.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Purchases — Table */}
      <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', paddingBottom: '4px' }}>
        <table style={{ width: '100%', minWidth: '1050px', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f95e10', color: '#ffffff' }}>
              <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap', width: '50px' }}>S.No</th>
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
            {loading ? (
              <tr>
                <td colSpan="11" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                  Loading purchase records from server...
                </td>
              </tr>
            ) : paginatedPurchases.length === 0 ? (
              <tr>
                <td colSpan="11" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                  No purchase records found matching criteria.
                </td>
              </tr>
            ) : (
              paginatedPurchases.map((p, index) => {
                const purCode = p.purchaseNo || p.id;
                const suppName = p.supplier || p.supplierName || 'General Supplier';
                const itemTitle = p.item || p.itemName;
                const purTotal = p.total ? p.total : (p.totalAmount ? p.totalAmount : (p.quantity || 0) * (p.rate || 0));

                return (
                  <tr key={p.id || p._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#64748b' }}>
                      {currentPage * PAGE_SIZE + index + 1}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '12px', whiteSpace: 'nowrap' }}>
                      {formatDateDDMMYYYY(p.purchaseDate || p.date)}
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
                    <td style={{ padding: '14px 16px', color: '#475569', fontWeight: 600 }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        background: '#f1f5f9',
                        borderRadius: '6px',
                        fontSize: '12px',
                        color: '#334155'
                      }}>
                        {p.unit || 'kg'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#0f172a', fontWeight: 600 }}>
                      ₹{Number(p.rate || 0).toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 900, color: '#16a34a' }}>
                      ₹{Number(purTotal).toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 700,
                        background: '#e6f4ea',
                        color: '#16a34a',
                        display: 'inline-block'
                      }}>
                        {p.status || 'Received'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => { setSelectedPurchase(p); setViewState('VIEW_PURCHASE'); }}
                          title="View Purchase"
                          style={{
                            ...actionIconBtnStyle,
                            background: '#eff6ff',
                            border: '1px solid #bfdbfe',
                            color: '#2563eb'
                          }}
                        >
                          <EyeIcon size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(p)}
                          title="Delete Purchase"
                          style={{
                            ...actionIconBtnStyle,
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            color: '#dc2626'
                          }}
                        >
                          <TrashIcon size={15} />
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
        totalItems={filteredPurchases.length}
        pageSize={PAGE_SIZE}
        onPageChange={setCurrentPage}
      />

    </div>
  );
}
