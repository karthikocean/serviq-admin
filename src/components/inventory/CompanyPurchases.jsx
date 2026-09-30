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
      // 1. Fetch Vendors
      const vendorRes = await InventoryApi.getVendors();
      if (vendorRes?.status && vendorRes?.response) {
        const rawVendors = vendorRes.response.data || vendorRes.response || [];
        if (Array.isArray(rawVendors) && rawVendors.length > 0) {
          setVendorsList(rawVendors);
        }
      }

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
      navigate('/inventory/vendors');
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

  // -------------------------------------------------------------
  // PURCHASE FORM HANDLERS
  // -------------------------------------------------------------
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

  // -------------------------------------------------------------
  // VENDOR MODAL COMPONENT
  // -------------------------------------------------------------
  const renderVendorModal = () => {
    if (!showVendorModal) return null;
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.5)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}>
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '650px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '28px 32px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                {editingVendor ? 'Edit Vendor Details' : 'Register New Vendor'}
              </h3>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Manage supplier credentials and active status</span>
            </div>
            <button
              type="button"
              onClick={() => setShowVendorModal(false)}
              style={{ background: 'none', border: 'none', fontSize: '22px', color: '#64748b', cursor: 'pointer', fontWeight: 700 }}
            >
              ×
            </button>
          </div>

          {!editingVendor && vendorsList.length > 0 && (
            <div style={{ marginBottom: '24px', background: '#f8fafc', borderRadius: '10px', padding: '14px 18px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Registered Vendors ({vendorsList.length})
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '100px', overflowY: 'auto' }}>
                {vendorsList.map(v => (
                  <div key={v._id || v.vendorCode} style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '4px 10px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 800, color: '#ff5a1f' }}>{v.vendorCode}</span>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>{v.name}</span>
                    <span style={{ fontSize: '10px', background: v.status === 'ACTIVE' ? '#dcfce7' : '#fef2f2', color: v.status === 'ACTIVE' ? '#16a34a' : '#dc2626', padding: '2px 6px', borderRadius: '10px', fontWeight: 800 }}>
                      {v.status || 'ACTIVE'}
                    </span>
                    <button
                      type="button"
                      onClick={() => openEditVendor(v)}
                      style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', padding: 0 }}
                    >
                      <PencilIcon size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteVendor(v)}
                      style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', padding: 0 }}
                    >
                      <TrashIcon size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleVendorSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={formLabelStyle}>
                Vendor ID / Code
              </label>
              <input
                type="text"
                readOnly
                value={vendorForm.vendorCode}
                style={{ ...formInputStyle, background: '#f1f5f9', fontWeight: 800, color: '#ff5a1f' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={formLabelStyle}>
                  Vendor / Contact Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Metro Wholesale / Rajan"
                  value={vendorForm.name}
                  onChange={e => setVendorForm({ ...vendorForm, name: e.target.value })}
                  style={{ ...formInputStyle, borderColor: vendorErrors.name ? '#ef4444' : '#cbd5e1' }}
                />
                {vendorErrors.name && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{vendorErrors.name}</span>}
              </div>

              <div>
                <label style={formLabelStyle}>
                  Company Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Metro Cash & Carry Pvt Ltd"
                  value={vendorForm.companyName}
                  onChange={e => setVendorForm({ ...vendorForm, companyName: e.target.value })}
                  style={{ ...formInputStyle, borderColor: vendorErrors.companyName ? '#ef4444' : '#cbd5e1' }}
                />
                {vendorErrors.companyName && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{vendorErrors.companyName}</span>}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={formLabelStyle}>
                  Contact Number <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. +91 9876543210"
                  value={vendorForm.phone}
                  onChange={e => setVendorForm({ ...vendorForm, phone: e.target.value })}
                  style={{ ...formInputStyle, borderColor: vendorErrors.phone ? '#ef4444' : '#cbd5e1' }}
                />
                {vendorErrors.phone && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{vendorErrors.phone}</span>}
              </div>

              <div>
                <label style={formLabelStyle}>
                  Vendor Status
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', height: '42px' }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: 700, color: vendorForm.status === 'ACTIVE' ? '#16a34a' : '#64748b' }}>
                    <input
                      type="radio"
                      name="vendorStatus"
                      value="ACTIVE"
                      checked={vendorForm.status === 'ACTIVE'}
                      onChange={() => setVendorForm({ ...vendorForm, status: 'ACTIVE' })}
                    />
                    Active
                  </label>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: 700, color: vendorForm.status === 'INACTIVE' ? '#dc2626' : '#64748b' }}>
                    <input
                      type="radio"
                      name="vendorStatus"
                      value="INACTIVE"
                      checked={vendorForm.status === 'INACTIVE'}
                      onChange={() => setVendorForm({ ...vendorForm, status: 'INACTIVE' })}
                    />
                    Inactive
                  </label>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
              <button
                type="button"
                onClick={() => setShowVendorModal(false)}
                style={{ background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
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
                  padding: '10px 24px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  opacity: isSubmitting ? 0.7 : 1
                }}
              >
                {isSubmitting ? 'Saving...' : (editingVendor ? 'Update Vendor' : 'Save Vendor')}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // -------------------------------------------------------------
  // VIEW: VIEW PURCHASE DETAIL
  // -------------------------------------------------------------
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
        {renderVendorModal()}
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
        {showVendorModal && renderVendorModal()}
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER MAIN TABLE / LIST VIEW
  // -------------------------------------------------------------
  return (
    <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
      {/* Top Filter and Action Bar: Supplier, Date Range, Item */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', width: '200px' }}>
            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}>
              <SearchIcon size={14} />
            </span>
            <input
              type="text"
              placeholder="Search code, supplier..."
              value={searchTerm}
              onKeyDown={preventSpaceInput}
              onChange={e => { setSearchTerm(e.target.value.replace(/\s/g, '')); setCurrentPage(0); }}
              style={{ ...filterInputStyle, paddingLeft: '32px' }}
            />
          </div>

          {/* Filter 1: Supplier */}
          <div style={{ width: '160px' }}>
            <select
              value={supplierFilter}
              onChange={e => { setSupplierFilter(e.target.value); setCurrentPage(0); }}
              style={filterInputStyle}
            >
              <option value="All">All Suppliers</option>
              {suppliers.filter(s => s !== 'All').map(sup => (
                <option key={sup} value={sup}>{sup}</option>
              ))}
            </select>
          </div>

          {/* Filter 2: Date Range */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <input
              type="date"
              value={startDate}
              onChange={e => { setStartDate(e.target.value); setCurrentPage(0); }}
              style={{ ...filterInputStyle, width: '135px' }}
              title="From Date"
            />
            <span style={{ color: '#94a3b8', fontSize: '12px' }}>to</span>
            <input
              type="date"
              value={endDate}
              onChange={e => { setEndDate(e.target.value); setCurrentPage(0); }}
              style={{ ...filterInputStyle, width: '135px' }}
              title="To Date"
            />
          </div>

          {/* Filter 3: Item */}
          <div style={{ width: '150px' }}>
            <select
              value={itemFilter}
              onChange={e => { setItemFilter(e.target.value); setCurrentPage(0); }}
              style={filterInputStyle}
            >
              <option value="All">All Items</option>
              {displayItems.map(i => (
                <option key={i.id || i._id} value={i.name}>{i.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Vendor Management Page Link */}
          <button
            type="button"
            onClick={() => navigate('/inventory/vendors')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#f8fafc',
              color: '#0f172a',
              border: '1px solid #cbd5e1',
              padding: '10px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <span>Vendors ({vendorsList.length})</span>
          </button>

          {/* Record New Purchase Button */}
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
              padding: '10px 20px',
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
      </div>

      {/* Purchases — Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px' }}>
              <th style={{ padding: '12px 16px', fontWeight: 800, width: '50px' }}>S.No</th>
              <th style={{ padding: '12px 16px', fontWeight: 800 }}>Purchase Date</th>
              <th style={{ padding: '12px 16px', fontWeight: 800 }}>Purchase No.</th>
              <th style={{ padding: '12px 16px', fontWeight: 800 }}>Supplier</th>
              <th style={{ padding: '12px 16px', fontWeight: 800 }}>Item</th>
              <th style={{ padding: '12px 16px', fontWeight: 800 }}>Quantity</th>
              <th style={{ padding: '12px 16px', fontWeight: 800 }}>Unit</th>
              <th style={{ padding: '12px 16px', fontWeight: 800 }}>Purchase Rate</th>
              <th style={{ padding: '12px 16px', fontWeight: 800 }}>Total Amount</th>
              <th style={{ padding: '12px 16px', fontWeight: 800 }}>Status</th>
              <th style={{ padding: '12px 16px', fontWeight: 800, textAlign: 'right' }}>Actions</th>
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
                      {p.purchaseDate || p.date}
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

      {renderVendorModal()}
    </div>
  );
}
