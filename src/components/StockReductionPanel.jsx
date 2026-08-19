import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState, DEFAULT_INVENTORY_CATEGORIES } from '../config/AppContext';
import { Modal } from './Modal';
import ShowNotifications from '../helper/ShowNotifications';

// Clean SVG Icons
const TrendingDownIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>
    <polyline points="17 18 23 18 23 12"></polyline>
  </svg>
);

const ShoppingBagIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <path d="M16 10a4 4 0 0 1-8 0"></path>
  </svg>
);

const HistoryIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

const SearchIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const PlusIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const DownloadIcon = ({ size = 15, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

const TrashIcon = ({ size = 15, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18"></path>
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
  </svg>
);

const AlertCircleIcon = ({ size = 15, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>
);

export const REDUCTION_REASONS = [
  { id: 'Kitchen Usage', label: '🍳 Kitchen Usage', desc: 'Daily food & recipe dish preparation', color: '#0284c7', bg: '#e0f2fe' },
  { id: 'Wastage', label: '🗑️ Wastage', desc: 'Preparation loss, trimming & spillage', color: '#ea580c', bg: '#ffedd5' },
  { id: 'Damage', label: '💥 Damage', desc: 'Broken packaging, drops, transit harm', color: '#dc2626', bg: '#fee2e2' },
  { id: 'Expired', label: '⏰ Expired', desc: 'Exceeded shelf life or freshness window', color: '#9333ea', bg: '#f3e8ff' },
  { id: 'Manual Adjustment', label: '⚙️ Manual Adjustment', desc: 'Inventory audit or scale recount correction', color: '#475569', bg: '#f1f5f9' }
];

export default function StockReductionPanel() {
  const navigate = useNavigate();
  const {
    activeRestaurant,
    currentUser,
    selectedBranchId,
    reduceInventoryStock,
    addPurchaseRecord,
    deletePurchaseRecord,
    deleteReductionRecord
  } = useAppState();

  const rawInventory = activeRestaurant?.inventory || [];
  const rawPurchases = activeRestaurant?.inventoryPurchases || [];
  const rawReductions = activeRestaurant?.inventoryReductions || [];
  const rawCategories = activeRestaurant?.inventoryCategories || DEFAULT_INVENTORY_CATEGORIES;

  // Filter items and logs by selected branch if set
  const inventory = selectedBranchId
    ? rawInventory.filter(item => item.branchId === selectedBranchId || item.branchId === 'ALL')
    : rawInventory;

  const purchases = selectedBranchId
    ? rawPurchases.filter(p => p.branchId === selectedBranchId || p.branchId === 'ALL')
    : rawPurchases;

  const reductions = selectedBranchId
    ? rawReductions.filter(r => r.branchId === selectedBranchId || r.branchId === 'ALL')
    : rawReductions;

  // Active view tab: 'reductions' | 'history' | 'purchases'
  const [activeTab, setActiveTab] = useState('reductions');

  // Search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [reasonFilter, setReasonFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Modals state
  const [isReduceModalOpen, setIsReduceModalOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [selectedItemForReduction, setSelectedItemForReduction] = useState(null);

  // Form: Reduce Stock
  const [reduceForm, setReduceForm] = useState({
    itemId: '',
    quantity: '',
    reason: 'Kitchen Usage',
    notes: '',
    date: new Date().toISOString().slice(0, 16)
  });

  // Form: New Purchase Record
  const [purchaseForm, setPurchaseForm] = useState({
    itemId: '',
    itemName: '',
    category: 'General',
    supplierName: '',
    supplierPhone: '',
    supplierEmail: '',
    quantity: '',
    unit: 'kg',
    unitPrice: '',
    invoiceNumber: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    paymentStatus: 'Paid',
    notes: ''
  });

  // Handlers for Reduce Stock Modal
  const handleOpenReduceModal = (item = null) => {
    const targetItem = item || inventory[0] || null;
    setSelectedItemForReduction(targetItem);
    setReduceForm({
      itemId: targetItem ? targetItem.id : '',
      quantity: '1',
      reason: 'Kitchen Usage',
      notes: '',
      date: new Date().toISOString().slice(0, 16)
    });
    setIsReduceModalOpen(true);
  };

  const handleItemSelectChange = (itemId) => {
    const item = inventory.find(i => i.id === itemId);
    setSelectedItemForReduction(item || null);
    setReduceForm(prev => ({ ...prev, itemId }));
  };

  const handleReduceSubmit = (e) => {
    if (e) e.preventDefault();
    if (!reduceForm.itemId) {
      ShowNotifications.showAlertNotification("Please select an inventory item.", false);
      return;
    }

    const currentItem = inventory.find(i => i.id === reduceForm.itemId);
    const qtyNum = parseFloat(reduceForm.quantity);

    if (isNaN(qtyNum) || qtyNum <= 0) {
      ShowNotifications.showAlertNotification("Please enter a valid reduction quantity greater than 0.", false);
      return;
    }

    if (currentItem && qtyNum > currentItem.currentStock) {
      ShowNotifications.showAlertNotification(`Reduction quantity (${qtyNum} ${currentItem.unit}) exceeds available stock (${currentItem.currentStock} ${currentItem.unit})!`, false);
      return;
    }

    if (reduceInventoryStock && activeRestaurant?.id) {
      reduceInventoryStock(activeRestaurant.id, {
        itemId: reduceForm.itemId,
        itemName: currentItem?.name,
        quantity: qtyNum,
        reason: reduceForm.reason,
        notes: reduceForm.notes,
        date: new Date(reduceForm.date).toLocaleString(),
        reducedBy: currentUser?.name || 'Admin',
        branchId: currentItem?.branchId || selectedBranchId || 'BR-001'
      });

      ShowNotifications.showAlertNotification(`Stock reduced: -${qtyNum} ${currentItem?.unit || ''} of ${currentItem?.name} (${reduceForm.reason})`, true);
      setIsReduceModalOpen(false);
    }
  };

  // Handlers for Purchase Record Modal
  const handleOpenPurchaseModal = () => {
    setPurchaseForm({
      itemId: inventory[0]?.id || '',
      itemName: inventory[0]?.name || '',
      category: inventory[0]?.category || 'General',
      supplierName: inventory[0]?.supplierName || '',
      supplierPhone: inventory[0]?.supplierPhone || '',
      supplierEmail: '',
      quantity: '10',
      unit: inventory[0]?.unit || 'kg',
      unitPrice: inventory[0]?.costPerUnit || '100',
      invoiceNumber: `INV-${Date.now().toString().slice(-5)}`,
      purchaseDate: new Date().toISOString().split('T')[0],
      paymentStatus: 'Paid',
      notes: ''
    });
    setIsPurchaseModalOpen(true);
  };

  const handlePurchaseItemSelect = (itemId) => {
    if (itemId === 'CUSTOM' || itemId === 'NEW') {
      setPurchaseForm(prev => ({
        ...prev,
        itemId: 'CUSTOM',
        itemName: '',
        category: rawCategories[0]?.name || 'General',
        unit: 'kg',
        unitPrice: ''
      }));
    } else {
      const match = inventory.find(i => i.id === itemId);
      if (match) {
        setPurchaseForm(prev => ({
          ...prev,
          itemId: match.id,
          itemName: match.name,
          category: match.category,
          unit: match.unit,
          unitPrice: match.costPerUnit || '',
          supplierName: match.supplierName || prev.supplierName,
          supplierPhone: match.supplierPhone || prev.supplierPhone
        }));
      }
    }
  };

  const handlePurchaseSubmit = (e) => {
    if (e) e.preventDefault();
    if (!purchaseForm.itemName.trim()) {
      ShowNotifications.showAlertNotification("Please enter or select an item name.", false);
      return;
    }

    const qtyNum = parseFloat(purchaseForm.quantity);
    const rateNum = parseFloat(purchaseForm.unitPrice) || 0;

    if (isNaN(qtyNum) || qtyNum <= 0) {
      ShowNotifications.showAlertNotification("Please enter a valid purchase quantity greater than 0.", false);
      return;
    }

    if (addPurchaseRecord && activeRestaurant?.id) {
      addPurchaseRecord(activeRestaurant.id, {
        ...purchaseForm,
        quantity: qtyNum,
        unitPrice: rateNum,
        totalAmount: qtyNum * rateNum,
        branchId: selectedBranchId || 'BR-001',
        addedBy: currentUser?.name || 'Admin'
      });

      ShowNotifications.showAlertNotification(`Purchase recorded! +${qtyNum} ${purchaseForm.unit} of ${purchaseForm.itemName} added to inventory.`, true);
      setIsPurchaseModalOpen(false);
    }
  };

  // Export to CSV Functionality
  const handleExportCSV = (type) => {
    let headers = [];
    let rows = [];
    let filename = '';

    if (type === 'reductions') {
      headers = ['ID', 'Item Name', 'Category', 'Quantity', 'Unit', 'Remaining Stock', 'Reason', 'Date', 'Reduced By', 'Notes'];
      rows = reductions.map(r => [
        r.id,
        `"${r.itemName}"`,
        r.category || 'General',
        r.quantity,
        r.unit,
        r.remainingStock,
        r.reason,
        `"${r.date}"`,
        `"${r.reducedBy || 'Admin'}"`,
        `"${r.notes || ''}"`
      ]);
      filename = `Stock_Reductions_${new Date().toISOString().split('T')[0]}.csv`;
    } else {
      headers = ['Invoice #', 'Item Name', 'Category', 'Supplier Name', 'Phone', 'Quantity', 'Unit', 'Unit Price', 'Total Amount', 'Purchase Date', 'Status', 'Added By'];
      rows = purchases.map(p => [
        p.invoiceNumber,
        `"${p.itemName}"`,
        p.category || 'General',
        `"${p.supplierName || ''}"`,
        p.supplierPhone || '',
        p.quantity,
        p.unit,
        p.unitPrice,
        p.totalAmount,
        p.purchaseDate,
        p.paymentStatus || 'Paid',
        `"${p.addedBy || 'Admin'}"`
      ]);
      filename = `Purchase_Records_${new Date().toISOString().split('T')[0]}.csv`;
    }

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    ShowNotifications.showAlertNotification(`${filename} exported successfully!`, true);
  };

  // KPI calculations
  const totalReductionInstances = reductions.length;
  const totalKitchenUsageCount = reductions.filter(r => r.reason === 'Kitchen Usage').length;
  const totalWastageValue = reductions.reduce((sum, r) => {
    if (r.reason === 'Wastage' || r.reason === 'Damage' || r.reason === 'Expired') {
      const match = rawInventory.find(i => i.id === r.itemId);
      const rate = match ? (match.costPerUnit || 50) : 50;
      return sum + (r.quantity * rate);
    }
    return sum;
  }, 0);
  const totalPurchasesAmount = purchases.reduce((sum, p) => sum + (Number(p.totalAmount) || 0), 0);

  // Filtered Reductions for History Tab
  const filteredReductions = reductions.filter(r => {
    const matchesSearch = (r.itemName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (r.reason || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (r.reducedBy || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (r.notes || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesReason = reasonFilter === 'All' || r.reason === reasonFilter;
    const matchesCategory = categoryFilter === 'All' || r.category === categoryFilter;
    return matchesSearch && matchesReason && matchesCategory;
  });

  // Filtered Purchases for Purchase Records Tab
  const filteredPurchases = purchases.filter(p => {
    const matchesSearch = (p.itemName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (p.invoiceNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (p.supplierName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (p.addedBy || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Filtered Inventory for Quick Actions Tab
  const filteredInventory = inventory.filter(i => {
    const matchesSearch = (i.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (i.sku || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || i.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Pagination slicing
  const activeDataList = activeTab === 'reductions' 
    ? filteredInventory 
    : activeTab === 'history' 
      ? filteredReductions 
      : filteredPurchases;

  const totalPages = Math.ceil(activeDataList.length / rowsPerPage) || 1;
  const paginatedData = activeDataList.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const getReasonBadge = (reason) => {
    const rConfig = REDUCTION_REASONS.find(r => r.id === reason) || REDUCTION_REASONS[4];
    return (
      <span style={{
        background: rConfig.bg,
        color: rConfig.color,
        border: `1px solid ${rConfig.color}40`,
        padding: '3px 8px',
        borderRadius: '6px',
        fontSize: '11px',
        fontWeight: 700,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        whiteSpace: 'nowrap'
      }}>
        {rConfig.label}
      </span>
    );
  };

  return (
    <section className="panel-view active" style={{ padding: '0 0 40px 0', width: '100%' }}>
      
      {/* 1. TOP HEADER & SUB-NAV SWITCHER */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        padding: '24px 32px',
        marginBottom: '24px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', margin: 0, fontFamily: "'Outfit', sans-serif" }}>
                Stock Reduction & Purchase Logs
              </h1>
              <span style={{
                background: '#ffedd5',
                color: '#ea580c',
                fontSize: '11px',
                fontWeight: 800,
                padding: '3px 8px',
                borderRadius: '6px',
                letterSpacing: '0.6px'
              }}>
                PREMIUM
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleOpenPurchaseModal}
            style={{
              background: '#0f172a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '9px 16px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 6px rgba(15,23,42,0.2)'
            }}
          >
            <ShoppingBagIcon size={15} color="#ffffff" />
            <span>+ Record Purchase</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenReduceModal()}
            style={{
              background: '#ff5a1f',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '9px 18px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(255,90,31,0.25)'
            }}
          >
            <TrendingDownIcon size={16} color="#ffffff" />
            <span>- Reduce Stock</span>
          </button>
        </div>
      </div>

      {/* 2. STATS KPI METRICS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '18px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.4px' }}>TOTAL REDUCTIONS</div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', marginTop: '4px', fontFamily: "'Outfit', sans-serif" }}>
            {totalReductionInstances} <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Entries</span>
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
            🍳 {totalKitchenUsageCount} Kitchen Usage Logs
          </div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '18px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.4px' }}>WASTAGE / DAMAGE VALUE</div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#dc2626', marginTop: '4px', fontFamily: "'Outfit', sans-serif" }}>
            ₹{totalWastageValue.toFixed(2)}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
            Waste, Spoilage & Transit Damage
          </div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '18px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.4px' }}>TOTAL PURCHASES</div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#16a34a', marginTop: '4px', fontFamily: "'Outfit', sans-serif" }}>
            ₹{totalPurchasesAmount.toFixed(2)}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
            {purchases.length} Recorded Invoices
          </div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '18px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#ea580c', textTransform: 'uppercase', letterSpacing: '0.4px' }}>ACTIVE RAW MATERIALS</div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', marginTop: '4px', fontFamily: "'Outfit', sans-serif" }}>
            {inventory.length} <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Items</span>
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
            {inventory.filter(i => i.status === 'Low Stock' || i.status === 'Out of Stock').length} Require Restocking
          </div>
        </div>
      </div>

      {/* 3. VIEW TABS & FILTER BAR */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        padding: '24px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
      }}>
        {/* Navigation Tabs Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '16px',
          marginBottom: '20px'
        }}>
          {/* Main Module Tabs */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => { setActiveTab('reductions'); setCurrentPage(1); }}
              style={{
                background: activeTab === 'reductions' ? '#ff5a1f' : '#f8fafc',
                color: activeTab === 'reductions' ? '#ffffff' : '#475569',
                border: activeTab === 'reductions' ? 'none' : '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s'
              }}
            >
              <TrendingDownIcon size={14} color={activeTab === 'reductions' ? '#ffffff' : '#64748b'} />
              <span>Stock Reduction Items ({inventory.length})</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('history'); setCurrentPage(1); }}
              style={{
                background: activeTab === 'history' ? '#ff5a1f' : '#f8fafc',
                color: activeTab === 'history' ? '#ffffff' : '#475569',
                border: activeTab === 'history' ? 'none' : '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s'
              }}
            >
              <HistoryIcon size={14} color={activeTab === 'history' ? '#ffffff' : '#64748b'} />
              <span>Reduction History Logs ({reductions.length})</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('purchases'); setCurrentPage(1); }}
              style={{
                background: activeTab === 'purchases' ? '#ff5a1f' : '#f8fafc',
                color: activeTab === 'purchases' ? '#ffffff' : '#475569',
                border: activeTab === 'purchases' ? 'none' : '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s'
              }}
            >
              <ShoppingBagIcon size={14} color={activeTab === 'purchases' ? '#ffffff' : '#64748b'} />
              <span>Purchase Records ({purchases.length})</span>
            </button>
          </div>

          {/* Export CSV Button */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => handleExportCSV(activeTab === 'purchases' ? 'purchases' : 'reductions')}
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '12px',
                fontWeight: 700,
                color: '#0f172a',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
              }}
            >
              <DownloadIcon size={13} color="#475569" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '20px'
        }}>
          {/* Search Box */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            padding: '8px 14px',
            width: '320px',
            boxSizing: 'border-box'
          }}>
            <SearchIcon size={15} color="#64748b" />
            <input
              type="text"
              placeholder={activeTab === 'purchases' ? "Search invoice #, supplier, item..." : "Search items, reason, user..."}
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: '13px',
                width: '100%',
                color: '#0f172a'
              }}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '12px' }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {activeTab === 'history' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>Reason:</label>
                <select
                  value={reasonFilter}
                  onChange={e => { setReasonFilter(e.target.value); setCurrentPage(1); }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '12px',
                    fontWeight: 600,
                    outline: 'none',
                    backgroundColor: '#ffffff'
                  }}
                >
                  <option value="All">All Reasons</option>
                  {REDUCTION_REASONS.map(r => (
                    <option key={r.id} value={r.id}>{r.label}</option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>Category:</label>
              <select
                value={categoryFilter}
                onChange={e => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '12px',
                  fontWeight: 600,
                  outline: 'none',
                  backgroundColor: '#ffffff'
                }}
              >
                <option value="All">All Categories</option>
                {rawCategories.map(c => (
                  <option key={c.id || c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Rows per page */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>Show:</label>
              <select
                value={rowsPerPage}
                onChange={e => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                style={{
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '12px',
                  fontWeight: 600,
                  outline: 'none',
                  backgroundColor: '#ffffff'
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>

        {/* 4. TABLE CONTENT BASED ON TAB */}
        {activeTab === 'reductions' && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Item & SKU</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Category</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Current Stock</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Min Threshold</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Unit Cost</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                      No inventory items found.
                    </td>
                  </tr>
                ) : (
                  paginatedData.map(item => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '13px' }}>{item.name}</div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{item.sku || item.id}</div>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '13px', color: '#475569' }}>
                        <span style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600 }}>
                          {item.category}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontSize: '15px', fontWeight: 900, color: item.currentStock <= (item.minStockLevel || 5) ? '#dc2626' : '#0f172a' }}>
                          {item.currentStock} {item.unit}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '13px', color: '#64748b' }}>
                        {item.minStockLevel || 5} {item.unit}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '11px',
                          fontWeight: 800,
                          background: item.status === 'In Stock' ? '#dcfce7' : item.status === 'Low Stock' ? '#fef3c7' : '#fee2e2',
                          color: item.status === 'In Stock' ? '#16a34a' : item.status === 'Low Stock' ? '#d97706' : '#dc2626'
                        }}>
                          {item.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                        ₹{item.costPerUnit || 0}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenReduceModal(item)}
                          disabled={item.currentStock <= 0}
                          style={{
                            background: item.currentStock <= 0 ? '#f1f5f9' : '#fff7ed',
                            color: item.currentStock <= 0 ? '#94a3b8' : '#ea580c',
                            border: item.currentStock <= 0 ? '1px solid #e2e8f0' : '1px solid #fed7aa',
                            padding: '6px 14px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: item.currentStock <= 0 ? 'not-allowed' : 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.15s'
                          }}
                        >
                          <TrendingDownIcon size={13} color={item.currentStock <= 0 ? '#94a3b8' : '#ea580c'} />
                          <span>Reduce</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'history' && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Log ID</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Item Name</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Reduced Qty</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Remaining</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Reason</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Date & Time</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Reduced By</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Notes</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                      No reduction history logs found.
                    </td>
                  </tr>
                ) : (
                  paginatedData.map(r => (
                    <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 16px', fontSize: '12px', fontWeight: 700, color: '#64748b' }}>
                        {r.id}
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 800, color: '#0f172a', fontSize: '13px' }}>
                        {r.itemName}
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 800, color: '#dc2626', fontSize: '14px' }}>
                        -{r.quantity} {r.unit}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                        {r.remainingStock !== undefined ? `${r.remainingStock} ${r.unit}` : '-'}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {getReasonBadge(r.reason)}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '12px', color: '#64748b' }}>
                        {r.date}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                        {r.reducedBy || 'Admin'}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '12px', color: '#64748b', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.notes || '-'}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Delete reduction log ${r.id}?`)) {
                              deleteReductionRecord(activeRestaurant.id, r.id);
                              ShowNotifications.showAlertNotification("Reduction log deleted.", true);
                            }
                          }}
                          style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                          title="Delete log record"
                        >
                          <TrashIcon size={14} color="#94a3b8" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'purchases' && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Invoice #</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Item Name</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Supplier Details</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Quantity</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Unit Price</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Total (₹)</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Purchase Date</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Added By</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                      No purchase records found. Click "+ Record Purchase" to log a supplier bill.
                    </td>
                  </tr>
                ) : (
                  paginatedData.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 16px', fontSize: '13px', fontWeight: 800, color: '#ff5a1f' }}>
                        {p.invoiceNumber}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '13px' }}>{p.itemName}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{p.category}</div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '13px' }}>{p.supplierName || 'General Supplier'}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{p.supplierPhone || '-'}</div>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: 800, color: '#16a34a' }}>
                        +{p.quantity} {p.unit}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                        ₹{p.unitPrice}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: 900, color: '#0f172a' }}>
                        ₹{(p.totalAmount || (p.quantity * p.unitPrice)).toFixed(2)}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '12px', color: '#64748b' }}>
                        {p.purchaseDate}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                        {p.addedBy || 'Admin'}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Delete purchase record #${p.invoiceNumber}?`)) {
                              deletePurchaseRecord(activeRestaurant.id, p.id);
                              ShowNotifications.showAlertNotification("Purchase record removed.", true);
                            }
                          }}
                          style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                          title="Delete purchase entry"
                        >
                          <TrashIcon size={14} color="#94a3b8" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. PAGINATION FOOTER */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '20px',
          paddingTop: '16px',
          borderTop: '1px solid #e2e8f0',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ fontSize: '13px', color: '#64748b' }}>
            Showing {activeDataList.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, activeDataList.length)} of {activeDataList.length} entries
          </div>

          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: currentPage === 1 ? '#f8fafc' : '#ffffff',
                color: currentPage === 1 ? '#94a3b8' : '#0f172a',
                fontSize: '12px',
                fontWeight: 700,
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 5).map(pageNum => (
              <button
                key={pageNum}
                type="button"
                onClick={() => setCurrentPage(pageNum)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  border: currentPage === pageNum ? 'none' : '1px solid #cbd5e1',
                  background: currentPage === pageNum ? '#ff5a1f' : '#ffffff',
                  color: currentPage === pageNum ? '#ffffff' : '#0f172a',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {pageNum}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: currentPage === totalPages ? '#f8fafc' : '#ffffff',
                color: currentPage === totalPages ? '#94a3b8' : '#0f172a',
                fontSize: '12px',
                fontWeight: 700,
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
              }}
            >
              Next
            </button>
          </div>
        </div>

      </div>

      {/* MODAL: REDUCE STOCK */}
      {isReduceModalOpen && (
        <Modal
          isOpen={isReduceModalOpen}
          onClose={() => setIsReduceModalOpen(false)}
          title="Reduce Stock Quantity"
          maxWidth="520px"
        >
          <form onSubmit={handleReduceSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '6px' }}>
            
            {/* Item Selector */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                Select Raw Material Item <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={reduceForm.itemId}
                onChange={e => handleItemSelectChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  fontWeight: 600,
                  outline: 'none',
                  backgroundColor: '#ffffff',
                  boxSizing: 'border-box'
                }}
              >
                {inventory.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.currentStock} {item.unit} available)
                  </option>
                ))}
              </select>
            </div>

            {/* Current Stock vs Remaining Preview Card */}
            {selectedItemForReduction && (
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '12px 16px',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
                textAlign: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>CURRENT STOCK</div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                    {selectedItemForReduction.currentStock} {selectedItemForReduction.unit}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: '#dc2626', fontWeight: 700 }}>REDUCTION QTY</div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#dc2626', marginTop: '2px' }}>
                    -{parseFloat(reduceForm.quantity) || 0} {selectedItemForReduction.unit}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: 700 }}>EST. REMAINING</div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: (selectedItemForReduction.currentStock - (parseFloat(reduceForm.quantity) || 0) <= 0) ? '#dc2626' : '#16a34a', marginTop: '2px' }}>
                    {Math.max(0, (selectedItemForReduction.currentStock - (parseFloat(reduceForm.quantity) || 0))).toFixed(2)} {selectedItemForReduction.unit}
                  </div>
                </div>
              </div>
            )}

            {/* Reduction Qty & Reason */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  Quantity to Reduce <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={selectedItemForReduction?.currentStock || 1000}
                    value={reduceForm.quantity}
                    onChange={e => setReduceForm({ ...reduceForm, quantity: e.target.value })}
                    placeholder="e.g. 2.5"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      fontWeight: 700,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <span style={{ position: 'absolute', right: '10px', fontSize: '12px', color: '#64748b', fontWeight: 700 }}>
                    {selectedItemForReduction?.unit || 'unit'}
                  </span>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  Reason for Reduction <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  value={reduceForm.reason}
                  onChange={e => setReduceForm({ ...reduceForm, reason: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    fontWeight: 600,
                    outline: 'none',
                    backgroundColor: '#ffffff',
                    boxSizing: 'border-box'
                  }}
                >
                  {REDUCTION_REASONS.map(r => (
                    <option key={r.id} value={r.id}>{r.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notes / Comments */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                Reduction Details & Reason Description
              </label>
              <textarea
                rows={2}
                placeholder="e.g. 5 portions of butter chicken gravy batch, trimming prep loss, spoiled seal..."
                value={reduceForm.notes}
                onChange={e => setReduceForm({ ...reduceForm, notes: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setIsReduceModalOpen(false)}
                style={{ padding: '9px 18px', borderRadius: '8px', fontSize: '13px' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  background: '#ff5a1f',
                  color: '#ffffff',
                  border: 'none',
                  padding: '9px 22px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(255,90,31,0.25)'
                }}
              >
                Confirm Reduction
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL: RECORD NEW PURCHASE */}
      {isPurchaseModalOpen && (
        <Modal
          isOpen={isPurchaseModalOpen}
          onClose={() => setIsPurchaseModalOpen(false)}
          title="Record Supplier Inventory Purchase"
          maxWidth="560px"
        >
          <form onSubmit={handlePurchaseSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '6px' }}>
            
            {/* Row 1: Item Name & Category */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  Item Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  value={purchaseForm.itemId || 'CUSTOM'}
                  onChange={e => handlePurchaseItemSelect(e.target.value)}
                  style={{
                    width: '100%',
                    height: '42px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    fontWeight: 600,
                    outline: 'none',
                    backgroundColor: '#ffffff',
                    boxSizing: 'border-box'
                  }}
                >
                  {inventory.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                  <option value="CUSTOM">+ New / Custom Item</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  Category
                </label>
                <select
                  value={purchaseForm.category}
                  onChange={e => setPurchaseForm({ ...purchaseForm, category: e.target.value })}
                  style={{
                    width: '100%',
                    height: '42px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    outline: 'none',
                    backgroundColor: '#ffffff',
                    boxSizing: 'border-box'
                  }}
                >
                  {rawCategories.map(c => (
                    <option key={c.id || c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Custom Item Name input if + New / Custom Item is chosen */}
            {purchaseForm.itemId === 'CUSTOM' && (
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  Enter New Item Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Organic Almond Milk"
                  value={purchaseForm.itemName}
                  onChange={e => setPurchaseForm({ ...purchaseForm, itemName: e.target.value })}
                  style={{
                    width: '100%',
                    height: '42px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            )}

            {/* Row 2: Supplier Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  Supplier Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Royal Wholesale Mart"
                  value={purchaseForm.supplierName}
                  onChange={e => setPurchaseForm({ ...purchaseForm, supplierName: e.target.value })}
                  style={{
                    width: '100%',
                    height: '42px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  Supplier Phone / Contact
                </label>
                <input
                  type="text"
                  placeholder="e.g. +91 98765 43210"
                  value={purchaseForm.supplierPhone}
                  onChange={e => setPurchaseForm({ ...purchaseForm, supplierPhone: e.target.value })}
                  style={{
                    width: '100%',
                    height: '42px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* Row 3: Quantity & Unit | Unit Price */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  Purchase Qty & Unit <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="Qty"
                    value={purchaseForm.quantity}
                    onChange={e => setPurchaseForm({ ...purchaseForm, quantity: e.target.value })}
                    style={{
                      flex: 1.2,
                      height: '42px',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      fontWeight: 700,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <select
                    value={purchaseForm.unit}
                    onChange={e => setPurchaseForm({ ...purchaseForm, unit: e.target.value })}
                    style={{
                      flex: 1,
                      height: '42px',
                      padding: '10px 8px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '12px',
                      fontWeight: 600,
                      outline: 'none',
                      backgroundColor: '#ffffff',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="kg">kg (Kg)</option>
                    <option value="g">g (Grams)</option>
                    <option value="L">L (Liters)</option>
                    <option value="ml">ml (ml)</option>
                    <option value="pcs">pcs (Pcs)</option>
                    <option value="box">box (Boxes)</option>
                    <option value="can">can (Cans)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  Unit Price (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 150"
                  value={purchaseForm.unitPrice}
                  onChange={e => setPurchaseForm({ ...purchaseForm, unitPrice: e.target.value })}
                  style={{
                    width: '100%',
                    height: '42px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                    fontWeight: 700,
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* Row 4: Invoice # & Purchase Date */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  Invoice Number <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. INV-8891"
                  value={purchaseForm.invoiceNumber}
                  onChange={e => setPurchaseForm({ ...purchaseForm, invoiceNumber: e.target.value })}
                  style={{
                    width: '100%',
                    height: '42px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  Purchase Date
                </label>
                <input
                  type="date"
                  value={purchaseForm.purchaseDate}
                  onChange={e => setPurchaseForm({ ...purchaseForm, purchaseDate: e.target.value })}
                  style={{
                    width: '100%',
                    height: '42px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    outline: 'none',
                    backgroundColor: '#ffffff',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* Total Amount Summary */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '14px 18px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748b' }}>Calculated Total Amount:</span>
              <span style={{ fontSize: '20px', fontWeight: 900, color: '#ff5a1f' }}>
                ₹{((parseFloat(purchaseForm.quantity) || 0) * (parseFloat(purchaseForm.unitPrice) || 0)).toFixed(2)}
              </span>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setIsPurchaseModalOpen(false)}
                style={{ padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  background: '#ff5a1f',
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px 24px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(255,90,31,0.25)'
                }}
              >
                Save Purchase & Restock
              </button>
            </div>
          </form>
        </Modal>
      )}

    </section>
  );
}
