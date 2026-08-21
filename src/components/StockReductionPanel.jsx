import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState, DEFAULT_INVENTORY_CATEGORIES } from '../config/AppContext';
import InventoryApi from '../api/Inventory';
import InventoryCategoryApi from '../api/InventoryCategory';
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

const SearchIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
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

const RefreshIcon = ({ size = 15, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
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

  const rawPurchases = activeRestaurant?.inventoryPurchases || [];
  const rawReductions = activeRestaurant?.inventoryReductions || [];
  
  // Live API States
  const [liveCategories, setLiveCategories] = useState([]);
  const [liveItems, setLiveItems] = useState([]);
  const [livePurchases, setLivePurchases] = useState([]);
  const [liveReductions, setLiveReductions] = useState([]);
  const [apiStats, setApiStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Categories, Items, Stats, and Logs from API
  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (selectedBranchId && selectedBranchId !== 'ALL') {
        params.branchId = selectedBranchId;
      }
      const [catsRes, itemsRes, statsRes, purchaseLogsRes, reductionLogsRes] = await Promise.all([
        InventoryCategoryApi.getCategories(params),
        InventoryApi.getItems(params),
        InventoryApi.getStats(params),
        InventoryApi.getLogs({ ...params, type: 'purchase' }),
        InventoryApi.getLogs({ ...params, type: 'reduction' })
      ]);

      if (catsRes?.status) {
        const rawData = catsRes.response?.data || catsRes.response?.categories || catsRes.response || [];
        const list = (Array.isArray(rawData) ? rawData : (Array.isArray(rawData?.data) ? rawData.data : [])).filter(item => !item?.isDelete);
        if (list.length > 0) setLiveCategories(list);
      }

      if (itemsRes?.status) {
        const rawData = itemsRes.response?.data || itemsRes.response?.items || itemsRes.response || [];
        const list = (Array.isArray(rawData) ? rawData : (Array.isArray(rawData?.data) ? rawData.data : [])).filter(item => !item?.isDelete);
        if (list.length > 0) setLiveItems(list);
      }

      if (statsRes?.status && statsRes.response?.data) {
        setApiStats(statsRes.response.data);
      }

      if (purchaseLogsRes?.status) {
        const rawData = purchaseLogsRes.response?.data || purchaseLogsRes.response?.logs || purchaseLogsRes.response || [];
        const list = (Array.isArray(rawData) ? rawData : (Array.isArray(rawData?.data) ? rawData.data : [])).filter(item => !item?.isDelete);
        setLivePurchases(list);
      }

      if (reductionLogsRes?.status) {
        const rawData = reductionLogsRes.response?.data || reductionLogsRes.response?.logs || reductionLogsRes.response || [];
        const list = (Array.isArray(rawData) ? rawData : (Array.isArray(rawData?.data) ? rawData.data : [])).filter(item => !item?.isDelete);
        setLiveReductions(list);
      }
    } catch (err) {
      console.error("Failed to load inventory data in stock reduction panel:", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedBranchId]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const rawCategories = liveCategories.length > 0 ? liveCategories : (activeRestaurant?.inventoryCategories || DEFAULT_INVENTORY_CATEGORIES);
  const rawInventory = liveItems.length > 0 ? liveItems : (activeRestaurant?.inventory || []);

  // Helper to extract category name from item
  const getCategoryName = (item) => {
    if (item.categoryId && typeof item.categoryId === 'object') {
      return item.categoryId.name || 'General';
    }
    if (item.categoryId) {
      const match = rawCategories.find(c => (c._id === item.categoryId || c.id === item.categoryId));
      if (match) return match.name;
    }
    return item.category || 'General';
  };

  // Filter items and logs by selected branch if set
  const inventory = selectedBranchId
    ? rawInventory.filter(item => item.branchId === selectedBranchId || item.branchId === 'ALL')
    : rawInventory;

  const purchases = livePurchases.length > 0
    ? livePurchases
    : (selectedBranchId ? rawPurchases.filter(p => p.branchId === selectedBranchId || p.branchId === 'ALL') : rawPurchases);

  const reductions = liveReductions.length > 0
    ? liveReductions
    : (selectedBranchId ? rawReductions.filter(r => r.branchId === selectedBranchId || r.branchId === 'ALL') : rawReductions);

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
      itemId: targetItem ? (targetItem._id || targetItem.id) : '',
      quantity: '1',
      reason: 'Kitchen Usage',
      notes: '',
      date: new Date().toISOString().slice(0, 16)
    });
    setIsReduceModalOpen(true);
  };

  const handleItemSelectChange = (itemId) => {
    const item = inventory.find(i => (i._id === itemId || i.id === itemId));
    setSelectedItemForReduction(item || null);
    setReduceForm(prev => ({ ...prev, itemId }));
  };

  const handleReduceSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!reduceForm.itemId) {
      ShowNotifications.showAlertNotification("Please select an inventory item.", false);
      return;
    }

    const currentItem = inventory.find(i => (i._id === reduceForm.itemId || i.id === reduceForm.itemId));
    const qtyNum = parseFloat(reduceForm.quantity);

    if (isNaN(qtyNum) || qtyNum <= 0) {
      ShowNotifications.showAlertNotification("Please enter a valid reduction quantity greater than 0.", false);
      return;
    }

    const availableStock = Number(currentItem?.currentStock) || 0;
    if (currentItem && qtyNum > availableStock) {
      ShowNotifications.showAlertNotification(`Reduction quantity (${qtyNum} ${currentItem.unit}) exceeds available stock (${availableStock} ${currentItem.unit})!`, false);
      return;
    }

    setIsSubmitting(true);
    const itemId = currentItem?._id || currentItem?.id || reduceForm.itemId;
    const itemCost = Number(currentItem?.costPerUnit) || 0;
    const reductionValue = qtyNum * itemCost;

    const payload = {
      itemId: itemId,
      quantityToReduce: qtyNum,
      reason: reduceForm.reason,
      details: reduceForm.notes || '',
      value: reductionValue,
      branchId: currentItem?.branchId || (selectedBranchId && selectedBranchId !== 'ALL' ? selectedBranchId : undefined)
    };

    try {
      const res = await InventoryApi.reduceStock(payload);
      if (res?.status) {
        await fetchAllData();
        if (reduceInventoryStock && activeRestaurant?.id) {
          reduceInventoryStock(activeRestaurant.id, {
            itemId: itemId,
            itemName: currentItem?.name,
            quantity: qtyNum,
            reason: reduceForm.reason,
            notes: reduceForm.notes,
            date: new Date(reduceForm.date).toLocaleString(),
            reducedBy: currentUser?.name || 'Admin',
            branchId: currentItem?.branchId || selectedBranchId || 'BR-001'
          });
        }
        setIsReduceModalOpen(false);
      }
    } catch (err) {
      console.error("Reduce stock error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handlers for Purchase Record Modal
  const handleOpenPurchaseModal = () => {
    const firstItem = inventory[0];
    setPurchaseForm({
      itemId: firstItem ? (firstItem._id || firstItem.id) : '',
      itemName: firstItem?.name || '',
      category: firstItem ? getCategoryName(firstItem) : (rawCategories[0]?.name || 'General'),
      supplierName: firstItem?.supplierName || '',
      supplierPhone: firstItem?.supplierPhone || '',
      supplierEmail: '',
      quantity: '10',
      unit: firstItem?.unit || 'kg',
      unitPrice: firstItem?.costPerUnit || '100',
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
      const match = inventory.find(i => (i._id === itemId || i.id === itemId));
      if (match) {
        setPurchaseForm(prev => ({
          ...prev,
          itemId: match._id || match.id,
          itemName: match.name,
          category: getCategoryName(match),
          unit: match.unit,
          unitPrice: match.costPerUnit || '',
          supplierName: match.supplierName || prev.supplierName,
          supplierPhone: match.supplierPhone || prev.supplierPhone
        }));
      }
    }
  };

  const handlePurchaseSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!purchaseForm.itemName.trim()) {
      ShowNotifications.showAlertNotification("Please enter or select an item name.", false);
      return;
    }

    const qtyNum = parseFloat(purchaseForm.quantity);
    const rateNum = parseFloat(purchaseForm.unitPrice) || 0;
    const totalAmt = qtyNum * rateNum;

    if (isNaN(qtyNum) || qtyNum <= 0) {
      ShowNotifications.showAlertNotification("Please enter a valid purchase quantity greater than 0.", false);
      return;
    }

    setIsSubmitting(true);
    const currentItem = inventory.find(i => (i._id === purchaseForm.itemId || i.id === purchaseForm.itemId || i.name.toLowerCase() === purchaseForm.itemName.toLowerCase()));
    const itemId = currentItem?._id || currentItem?.id || purchaseForm.itemId;

    const payload = {
      itemId: itemId && itemId !== 'CUSTOM' ? itemId : undefined,
      supplierName: purchaseForm.supplierName.trim(),
      supplierPhone: purchaseForm.supplierPhone.trim(),
      purchaseQty: qtyNum,
      unitPrice: rateNum,
      totalAmount: totalAmt,
      invoiceNumber: purchaseForm.invoiceNumber || `INV-${Date.now().toString().slice(-5)}`,
      purchaseDate: purchaseForm.purchaseDate ? new Date(purchaseForm.purchaseDate).toISOString() : new Date().toISOString(),
      branchId: selectedBranchId && selectedBranchId !== 'ALL' ? selectedBranchId : (currentItem?.branchId || undefined)
    };

    try {
      const res = await InventoryApi.recordPurchase(payload);
      if (res?.status) {
        await fetchAllData();
        if (addPurchaseRecord && activeRestaurant?.id) {
          addPurchaseRecord(activeRestaurant.id, {
            ...purchaseForm,
            quantity: qtyNum,
            unitPrice: rateNum,
            totalAmount: totalAmt,
            branchId: selectedBranchId || 'BR-001',
            addedBy: currentUser?.name || 'Admin'
          });
        }
        setIsPurchaseModalOpen(false);
      }
    } catch (err) {
      console.error("Record purchase error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Export to CSV Functionality
  const handleExportCSV = (type) => {
    let headers = [];
    let rows = [];
    let filename = '';

    if (type === 'reductions') {
      headers = ['ID', 'Item Name', 'Category', 'Quantity', 'Unit', 'Reason', 'Date', 'Reduced By', 'Details'];
      rows = reductions.map(r => [
        r._id || r.id,
        `"${typeof r.itemId === 'object' ? r.itemId?.name : (r.itemName || '')}"`,
        r.category || 'General',
        r.quantityToReduce !== undefined ? r.quantityToReduce : r.quantity,
        (typeof r.itemId === 'object' && r.itemId?.unit) ? r.itemId.unit : (r.unit || 'unit'),
        r.reason || 'Kitchen Usage',
        `"${r.createdAt ? new Date(r.createdAt).toLocaleString('en-IN') : (r.date || '')}"`,
        `"${typeof r.reducedBy === 'object' ? r.reducedBy?.name : (r.reducedBy || 'Admin')}"`,
        `"${r.details || r.notes || ''}"`
      ]);
      filename = `Stock_Reductions_${new Date().toISOString().split('T')[0]}.csv`;
    } else {
      headers = ['Invoice #', 'Item Name', 'Category', 'Supplier Name', 'Phone', 'Quantity', 'Unit', 'Unit Price', 'Total Amount', 'Purchase Date', 'Status', 'Added By'];
      rows = purchases.map(p => [
        p.invoiceNumber || '',
        `"${typeof p.itemId === 'object' ? p.itemId?.name : (p.itemName || '')}"`,
        p.category || 'General',
        `"${p.supplierName || ''}"`,
        p.supplierPhone || '',
        p.purchaseQty !== undefined ? p.purchaseQty : p.quantity,
        (typeof p.itemId === 'object' && p.itemId?.unit) ? p.itemId.unit : (p.unit || 'kg'),
        p.unitPrice || 0,
        p.totalAmount || 0,
        p.purchaseDate ? new Date(p.purchaseDate).toLocaleDateString('en-IN') : (p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-IN') : ''),
        p.paymentStatus || 'Paid',
        `"${typeof p.addedBy === 'object' ? p.addedBy?.name : (p.addedBy || 'Admin')}"`
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

  // KPI calculations with backend API stats integration
  const totalReductionInstances = apiStats?.totalReductionsCount !== undefined ? apiStats.totalReductionsCount : reductions.length;
  const totalKitchenUsageCount = reductions.filter(r => r.reason === 'Kitchen Usage').length;
  const totalWastageValue = apiStats?.totalReductionsValue !== undefined
    ? Number(apiStats.totalReductionsValue)
    : reductions.reduce((sum, r) => {
        if (r.reason === 'Wastage' || r.reason === 'Damage' || r.reason === 'Expired') {
          const match = rawInventory.find(i => (i.id === r.itemId || i._id === r.itemId));
          const rate = match ? (match.costPerUnit || 50) : 50;
          return sum + ((r.quantityToReduce !== undefined ? r.quantityToReduce : r.quantity) * rate);
        }
        return sum;
      }, 0);
  const totalPurchasesAmount = apiStats?.totalPurchasesValue !== undefined
    ? Number(apiStats.totalPurchasesValue)
    : purchases.reduce((sum, p) => sum + (Number(p.totalAmount) || 0), 0);
  const totalPurchasesCount = apiStats?.totalPurchasesCount !== undefined ? apiStats.totalPurchasesCount : purchases.length;
  const activeItemsCount = apiStats?.activeItemsCount !== undefined ? apiStats.activeItemsCount : inventory.length;

  // Filtered Reductions for History Tab
  const filteredReductions = reductions.filter(r => {
    const rName = typeof r.itemId === 'object' ? (r.itemId?.name || '') : (r.itemName || '');
    const rReason = r.reason || '';
    const rUser = typeof r.reducedBy === 'object' ? (r.reducedBy?.name || '') : (r.reducedBy || '');
    const rNotes = r.details || r.notes || '';
    const rCat = (typeof r.itemId === 'object' && r.itemId?.categoryId) ? (rawCategories.find(c => (c._id === r.itemId.categoryId || c.id === r.itemId.categoryId))?.name || 'General') : (r.category || 'General');

    const matchesSearch = rName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          rReason.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          rUser.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          rNotes.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesReason = reasonFilter === 'All' || rReason === reasonFilter;
    const matchesCategory = categoryFilter === 'All' || rCat === categoryFilter;
    return matchesSearch && matchesReason && matchesCategory;
  });

  // Filtered Purchases for Purchase Records Tab
  const filteredPurchases = purchases.filter(p => {
    const pName = typeof p.itemId === 'object' ? (p.itemId?.name || '') : (p.itemName || '');
    const pInv = p.invoiceNumber || '';
    const pSupplier = p.supplierName || '';
    const pUser = typeof p.addedBy === 'object' ? (p.addedBy?.name || '') : (p.addedBy || '');
    const pCat = (typeof p.itemId === 'object' && p.itemId?.categoryId) ? (rawCategories.find(c => (c._id === p.itemId.categoryId || c.id === p.itemId.categoryId))?.name || 'General') : (p.category || 'General');

    const matchesSearch = pName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          pInv.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          pSupplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          pUser.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || pCat === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Filtered Inventory for Quick Actions Tab
  const filteredInventory = inventory.filter(i => {
    const catName = getCategoryName(i);
    const matchesSearch = (i.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (i.sku || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || catName === categoryFilter;
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
                background: 'linear-gradient(135deg, #ff5a1f 0%, #ea580c 100%)',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 800,
                padding: '3px 8px',
                borderRadius: '6px',
                letterSpacing: '0.6px'
              }}>
                LIVE API
              </span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
              Log kitchen usage, waste, supplier restock shipments, and audit ledger entries
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={fetchAllData}
            disabled={isLoading}
            title="Refresh stats and records"
            style={{
              background: '#ffffff',
              color: '#475569',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '9px 14px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RefreshIcon size={14} color={isLoading ? '#94a3b8' : '#475569'} />
            <span>Refresh</span>
          </button>

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
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.4px' }}>TOTAL REDUCTIONS VALUE</div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#dc2626', marginTop: '4px', fontFamily: "'Outfit', sans-serif" }}>
            ₹{totalWastageValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
            Usage, Waste & Spoilage
          </div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '18px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.4px' }}>TOTAL PURCHASES</div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#16a34a', marginTop: '4px', fontFamily: "'Outfit', sans-serif" }}>
            ₹{totalPurchasesAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
            {totalPurchasesCount} Recorded Invoices
          </div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '18px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#ea580c', textTransform: 'uppercase', letterSpacing: '0.4px' }}>ACTIVE RAW MATERIALS</div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', marginTop: '4px', fontFamily: "'Outfit', sans-serif" }}>
            {activeItemsCount} <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Items</span>
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
            {inventory.filter(i => {
              const min = Number(i.minAlertLevel !== undefined ? i.minAlertLevel : i.minStockLevel) || 0;
              return (Number(i.currentStock) || 0) <= min;
            }).length} Require Restocking
          </div>
        </div>
      </div>

      {/* 3. FILTER BAR & CONTENT */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        padding: '24px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
      }}>
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
            width: '280px',
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

          {/* Filter Controls & Actions */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* View / Section Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>View:</label>
              <select
                value={activeTab}
                onChange={e => { setActiveTab(e.target.value); setCurrentPage(1); }}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '12px',
                  fontWeight: 600,
                  outline: 'none',
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  cursor: 'pointer'
                }}
              >
                <option value="reductions">Stock Reduction Items ({inventory.length})</option>
                <option value="history">Reduction History Logs ({reductions.length})</option>
                <option value="purchases">Purchase Records ({purchases.length})</option>
              </select>
            </div>

            {/* Category Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>Category:</label>
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
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  cursor: 'pointer'
                }}
              >
                <option value="All">All Categories</option>
                {rawCategories.map(c => (
                  <option key={c.id || c._id || c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Reason Filter (Only for history view) */}
            {activeTab === 'history' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>Reason:</label>
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
                    backgroundColor: '#ffffff',
                    color: '#0f172a',
                    cursor: 'pointer'
                  }}
                >
                  <option value="All">All Reasons</option>
                  {REDUCTION_REASONS.map(r => (
                    <option key={r.id} value={r.id}>{r.label}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Export CSV Button */}
            <button
              type="button"
              onClick={() => handleExportCSV(activeTab === 'purchases' ? 'purchases' : 'reductions')}
              style={{
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                color: '#334155',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <DownloadIcon size={14} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* 4. TABLE VIEWS */}
        <div style={{ width: '100%', overflowX: 'auto' }}>
          
          {/* TAB 1: QUICK REDUCTION ITEMS */}
          {activeTab === 'reductions' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#000000', borderBottom: '3px solid #ff5a1f', color: '#ffffff' }}>
                  <th style={{ padding: '14px 18px', fontWeight: 800 }}>S.NO</th>
                  <th style={{ padding: '14px 18px', fontWeight: 800 }}>RAW MATERIAL ITEM</th>
                  <th style={{ padding: '14px 18px', fontWeight: 800 }}>CATEGORY</th>
                  <th style={{ padding: '14px 18px', fontWeight: 800 }}>CURRENT STOCK</th>
                  <th style={{ padding: '14px 18px', fontWeight: 800 }}>MIN THRESHOLD</th>
                  <th style={{ padding: '14px 18px', fontWeight: 800 }}>STATUS</th>
                  <th style={{ padding: '14px 18px', fontWeight: 800, textAlign: 'right' }}>QUICK ACTION</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                      Loading reduction items...
                    </td>
                  </tr>
                ) : paginatedData.length > 0 ? (
                  paginatedData.map((item, idx) => {
                    const minLevel = Number(item.minAlertLevel !== undefined ? item.minAlertLevel : item.minStockLevel) || 0;
                    const curStock = Number(item.currentStock) || 0;
                    const isLow = curStock <= minLevel;
                    const isOut = curStock <= 0;
                    const catName = getCategoryName(item);

                    return (
                      <tr
                        key={item._id || item.id || idx}
                        style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '14px 18px', color: '#64748b', fontWeight: 700 }}>
                          {(currentPage - 1) * rowsPerPage + idx + 1}
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '14px' }}>{item.name}</div>
                          <div style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>SKU: {item.sku}</div>
                        </td>
                        <td style={{ padding: '14px 18px', fontWeight: 600, color: '#334155' }}>
                          {catName}
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <span style={{
                            fontSize: '14px',
                            fontWeight: 800,
                            color: isOut ? '#dc2626' : isLow ? '#d97706' : '#16a34a'
                          }}>
                            {curStock} {item.unit}
                          </span>
                        </td>
                        <td style={{ padding: '14px 18px', color: '#64748b', fontWeight: 600 }}>
                          {minLevel} {item.unit}
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 800,
                            background: isOut ? '#fee2e2' : isLow ? '#fef3c7' : '#ecfdf5',
                            color: isOut ? '#dc2626' : isLow ? '#d97706' : '#059669'
                          }}>
                            {isOut ? 'OUT OF STOCK' : isLow ? 'LOW STOCK' : 'OPTIMAL'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                          <button
                            type="button"
                            onClick={() => handleOpenReduceModal(item)}
                            disabled={isOut}
                            style={{
                              background: isOut ? '#f1f5f9' : '#fff7ed',
                              border: `1px solid ${isOut ? '#cbd5e1' : '#fed7aa'}`,
                              color: isOut ? '#94a3b8' : '#ea580c',
                              fontWeight: 800,
                              fontSize: '12px',
                              padding: '6px 14px',
                              borderRadius: '8px',
                              cursor: isOut ? 'not-allowed' : 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              transition: 'all 0.15s'
                            }}
                          >
                            <TrendingDownIcon size={14} color={isOut ? '#94a3b8' : '#ea580c'} />
                            <span>Reduce</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                      No inventory items found matching your filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {/* TAB 2: REDUCTION HISTORY LOGS */}
          {activeTab === 'history' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#000000', borderBottom: '3px solid #ff5a1f', color: '#ffffff' }}>
                  <th style={{ padding: '14px 18px', fontWeight: 800 }}>DATE & TIME</th>
                  <th style={{ padding: '14px 18px', fontWeight: 800 }}>RAW MATERIAL ITEM</th>
                  <th style={{ padding: '14px 18px', fontWeight: 800 }}>QTY REDUCED</th>
                  <th style={{ padding: '14px 18px', fontWeight: 800 }}>REASON</th>
                  <th style={{ padding: '14px 18px', fontWeight: 800 }}>LOGGED BY</th>
                  <th style={{ padding: '14px 18px', fontWeight: 800 }}>NOTES / REMARKS</th>
                  <th style={{ padding: '14px 18px', fontWeight: 800, textAlign: 'right' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                      Loading reduction logs...
                    </td>
                  </tr>
                ) : paginatedData.length > 0 ? (
                  paginatedData.map((record, idx) => {
                    const dateFormatted = record.createdAt ? new Date(record.createdAt).toLocaleString('en-IN') : (record.date || '—');
                    const itemName = typeof record.itemId === 'object' ? (record.itemId?.name || '—') : (rawInventory.find(i => (i._id === record.itemId || i.id === record.itemId))?.name || record.itemName || '—');
                    const catName = (typeof record.itemId === 'object' && record.itemId?.categoryId)
                      ? (rawCategories.find(c => (c._id === record.itemId.categoryId || c.id === record.itemId.categoryId))?.name || 'General')
                      : (record.category || 'General');
                    const qty = record.quantityToReduce !== undefined ? record.quantityToReduce : record.quantity;
                    const unit = (typeof record.itemId === 'object' && record.itemId?.unit) ? record.itemId.unit : (record.unit || 'unit');
                    const userLabel = typeof record.reducedBy === 'object' ? (record.reducedBy?.name || 'Staff') : (record.reducedBy || 'Admin');
                    const notes = record.details || record.notes || '—';

                    return (
                      <tr
                        key={record._id || record.id || idx}
                        style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '14px 18px', color: '#64748b', whiteSpace: 'nowrap' }}>
                          {dateFormatted}
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ fontWeight: 800, color: '#0f172a' }}>{itemName}</div>
                          <div style={{ fontSize: '11px', color: '#94a3b8' }}>{catName}</div>
                        </td>
                        <td style={{ padding: '14px 18px', fontWeight: 800, color: '#dc2626' }}>
                          -{qty} {unit}
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          {getReasonBadge(record.reason || 'Kitchen Usage')}
                        </td>
                        <td style={{ padding: '14px 18px', fontWeight: 600, color: '#334155' }}>
                          {userLabel}
                        </td>
                        <td style={{ padding: '14px 18px', color: '#64748b', maxWidth: '240px' }}>
                          {notes}
                        </td>
                        <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Delete reduction log for ${itemName}?`)) {
                                if (deleteReductionRecord && activeRestaurant?.id) {
                                  deleteReductionRecord(activeRestaurant.id, record.id || record._id);
                                  ShowNotifications.showAlertNotification("Reduction log deleted.", true);
                                }
                              }
                            }}
                            style={{
                              background: '#fee2e2',
                              border: '1px solid #fecaca',
                              borderRadius: '6px',
                              padding: '6px 8px',
                              cursor: 'pointer',
                              color: '#dc2626'
                            }}
                            title="Delete log entry"
                          >
                            <TrashIcon size={13} color="#dc2626" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                      No reduction logs recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {/* TAB 3: PURCHASE RECORDS */}
          {activeTab === 'purchases' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#000000', borderBottom: '3px solid #ff5a1f', color: '#ffffff' }}>
                  <th style={{ padding: '14px 18px', fontWeight: 800 }}>INVOICE / DATE</th>
                  <th style={{ padding: '14px 18px', fontWeight: 800 }}>ITEM & CATEGORY</th>
                  <th style={{ padding: '14px 18px', fontWeight: 800 }}>SUPPLIER VENDOR</th>
                  <th style={{ padding: '14px 18px', fontWeight: 800 }}>QTY & RATE</th>
                  <th style={{ padding: '14px 18px', fontWeight: 800 }}>TOTAL AMOUNT</th>
                  <th style={{ padding: '14px 18px', fontWeight: 800 }}>STATUS</th>
                  <th style={{ padding: '14px 18px', fontWeight: 800, textAlign: 'right' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                      Loading purchase records...
                    </td>
                  </tr>
                ) : paginatedData.length > 0 ? (
                  paginatedData.map((p, idx) => {
                    const invoiceNum = p.invoiceNumber || `INV-${(p._id || '').slice(-5)}`;
                    const dateFormatted = p.purchaseDate ? new Date(p.purchaseDate).toLocaleDateString('en-IN') : (p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-IN') : '—');
                    const itemName = typeof p.itemId === 'object' ? (p.itemId?.name || '—') : (rawInventory.find(i => (i._id === p.itemId || i.id === p.itemId))?.name || p.itemName || '—');
                    const catName = (typeof p.itemId === 'object' && p.itemId?.categoryId)
                      ? (rawCategories.find(c => (c._id === p.itemId.categoryId || c.id === p.itemId.categoryId))?.name || 'General')
                      : (p.category || 'General');
                    const qty = p.purchaseQty !== undefined ? p.purchaseQty : p.quantity;
                    const unit = (typeof p.itemId === 'object' && p.itemId?.unit) ? p.itemId.unit : (p.unit || 'kg');
                    const rate = p.unitPrice || 0;
                    const totalAmt = p.totalAmount !== undefined ? p.totalAmount : (qty * rate);

                    return (
                      <tr
                        key={p._id || p.id || idx}
                        style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ fontWeight: 800, color: '#0f172a', fontFamily: 'monospace' }}>{invoiceNum}</div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>{dateFormatted}</div>
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ fontWeight: 800, color: '#0f172a' }}>{itemName}</div>
                          <div style={{ fontSize: '11px', color: '#94a3b8' }}>{catName}</div>
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ fontWeight: 700, color: '#334155' }}>{p.supplierName || '—'}</div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>{p.supplierPhone || '—'}</div>
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ fontWeight: 800, color: '#16a34a' }}>+{qty} {unit}</div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>@ ₹{rate}/{unit}</div>
                        </td>
                        <td style={{ padding: '14px 18px', fontWeight: 800, color: '#0f172a', fontSize: '14px' }}>
                          ₹{Number(totalAmt).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 800,
                            background: '#ecfdf5',
                            color: '#059669'
                          }}>
                            {p.paymentStatus || 'PAID'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Delete purchase record #${invoiceNum}?`)) {
                                if (deletePurchaseRecord && activeRestaurant?.id) {
                                  deletePurchaseRecord(activeRestaurant.id, p.id || p._id);
                                  ShowNotifications.showAlertNotification("Purchase record removed.", true);
                                }
                              }
                            }}
                            style={{
                              background: '#fee2e2',
                              border: '1px solid #fecaca',
                              borderRadius: '6px',
                              padding: '6px 8px',
                              cursor: 'pointer',
                              color: '#dc2626'
                            }}
                            title="Delete purchase entry"
                          >
                            <TrashIcon size={13} color="#dc2626" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                      No purchase invoices recorded yet. Click "+ Record Purchase" above to add new vendor stock.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Controls */}
        {activeDataList.length > rowsPerPage && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '1px solid #f1f5f9',
            fontSize: '12px',
            color: '#64748b'
          }}>
            <div>
              Showing {((currentPage - 1) * rowsPerPage) + 1} to {Math.min(currentPage * rowsPerPage, activeDataList.length)} of {activeDataList.length} entries
            </div>

            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: currentPage === 1 ? '#f8fafc' : '#ffffff',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  fontWeight: 700
                }}
              >
                Previous
              </button>

              <span style={{ fontWeight: 800, color: '#0f172a', padding: '0 8px' }}>
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: currentPage === totalPages ? '#f8fafc' : '#ffffff',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  fontWeight: 700
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 5. MODAL: REDUCE STOCK */}
      <Modal
        isOpen={isReduceModalOpen}
        onClose={() => !isSubmitting && setIsReduceModalOpen(false)}
        title="Reduce Inventory Stock"
        maxWidth="500px"
      >
        <form onSubmit={handleReduceSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
          {/* Select Item */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
              Select Item <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select
              disabled={isSubmitting}
              value={reduceForm.itemId}
              onChange={e => handleItemSelectChange(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                backgroundColor: '#ffffff',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            >
              {inventory.map(item => (
                <option key={item._id || item.id} value={item._id || item.id}>
                  {item.name} ({item.currentStock} {item.unit} available)
                </option>
              ))}
            </select>
          </div>

          {/* Current Stock Banner */}
          {selectedItemForReduction && (
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '12px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Available Ledger Balance</span>
                <div style={{ fontSize: '16px', fontWeight: 900, color: '#0f172a' }}>
                  {selectedItemForReduction.currentStock} {selectedItemForReduction.unit}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Min Alert Threshold</span>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#d97706' }}>
                  {selectedItemForReduction.minAlertLevel !== undefined ? selectedItemForReduction.minAlertLevel : (selectedItemForReduction.minStockLevel || 5)} {selectedItemForReduction.unit}
                </div>
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
              Reduction Quantity ({selectedItemForReduction?.unit || 'unit'}) <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="number"
              disabled={isSubmitting}
              step="0.1"
              min="0.1"
              value={reduceForm.quantity}
              onChange={e => setReduceForm({ ...reduceForm, quantity: e.target.value })}
              placeholder="e.g. 5"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Reason */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
              Reason for Reduction <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select
              disabled={isSubmitting}
              value={reduceForm.reason}
              onChange={e => setReduceForm({ ...reduceForm, reason: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                backgroundColor: '#ffffff',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            >
              {REDUCTION_REASONS.map(r => (
                <option key={r.id} value={r.id}>{r.label} — {r.desc}</option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
              Reference / Kitchen Notes
            </label>
            <input
              type="text"
              disabled={isSubmitting}
              value={reduceForm.notes}
              onChange={e => setReduceForm({ ...reduceForm, notes: e.target.value })}
              placeholder="e.g. Biryani preparation batch #12 or Expired batch drop"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Modal Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button
              type="button"
              disabled={isSubmitting}
              className="btn btn-outline"
              onClick={() => setIsReduceModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                background: isSubmitting ? '#cbd5e1' : '#ff5a1f',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                padding: '10px 20px',
                borderRadius: '8px',
                fontSize: '13px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 8px rgba(255,90,31,0.25)'
              }}
            >
              {isSubmitting ? 'Reducing...' : 'Confirm Reduction'}
            </button>
          </div>
        </form>
      </Modal>

      {/* 6. MODAL: RECORD PURCHASE */}
      <Modal
        isOpen={isPurchaseModalOpen}
        onClose={() => !isSubmitting && setIsPurchaseModalOpen(false)}
        title="Record Inbound Purchase (Vendor Restock)"
        maxWidth="600px"
      >
        <form onSubmit={handlePurchaseSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
          {/* Row 1: Item Source Selection */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                Inventory Item <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                disabled={isSubmitting}
                value={purchaseForm.itemId}
                onChange={e => handlePurchaseItemSelect(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              >
                {inventory.map(item => (
                  <option key={item._id || item.id} value={item._id || item.id}>
                    {item.name} ({getCategoryName(item)})
                  </option>
                ))}
                <option value="CUSTOM">+ Add as New Custom Item...</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                Item Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                disabled={isSubmitting}
                value={purchaseForm.itemName}
                onChange={e => setPurchaseForm({ ...purchaseForm, itemName: e.target.value })}
                placeholder="e.g. Basmati Rice"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Row 2: Supplier Details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                Supplier / Vendor Name
              </label>
              <input
                type="text"
                disabled={isSubmitting}
                value={purchaseForm.supplierName}
                onChange={e => setPurchaseForm({ ...purchaseForm, supplierName: e.target.value })}
                placeholder="e.g. Metro Cash & Carry"
                style={{
                  width: '100%',
                  padding: '10px 14px',
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
                Supplier Phone Number
              </label>
              <input
                type="text"
                disabled={isSubmitting}
                value={purchaseForm.supplierPhone}
                onChange={e => setPurchaseForm({ ...purchaseForm, supplierPhone: e.target.value })}
                placeholder="e.g. +91 98765 43210"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Row 3: Quantity, Unit & Unit Price */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                Quantity Received <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="number"
                disabled={isSubmitting}
                step="0.1"
                min="0.1"
                value={purchaseForm.quantity}
                onChange={e => setPurchaseForm({ ...purchaseForm, quantity: e.target.value })}
                placeholder="10"
                style={{
                  width: '100%',
                  padding: '10px 14px',
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
                Unit
              </label>
              <select
                disabled={isSubmitting}
                value={purchaseForm.unit}
                onChange={e => setPurchaseForm({ ...purchaseForm, unit: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              >
                <option value="kg">kg (Kilogram)</option>
                <option value="g">g (Grams)</option>
                <option value="L">L (Liter)</option>
                <option value="ml">ml (Milliliter)</option>
                <option value="pcs">pcs (Pieces)</option>
                <option value="box">box (Boxes)</option>
                <option value="bag">bag (Bags)</option>
                <option value="pack">pack (Packets)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                Unit Cost Price (₹) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="number"
                disabled={isSubmitting}
                step="0.01"
                min="0"
                value={purchaseForm.unitPrice}
                onChange={e => setPurchaseForm({ ...purchaseForm, unitPrice: e.target.value })}
                placeholder="100"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Row 4: Invoice Number & Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                Invoice / Bill Number
              </label>
              <input
                type="text"
                disabled={isSubmitting}
                value={purchaseForm.invoiceNumber}
                onChange={e => setPurchaseForm({ ...purchaseForm, invoiceNumber: e.target.value })}
                placeholder="e.g. INV-90821"
                style={{
                  width: '100%',
                  padding: '10px 14px',
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
                disabled={isSubmitting}
                value={purchaseForm.purchaseDate}
                onChange={e => setPurchaseForm({ ...purchaseForm, purchaseDate: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 14px',
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

          {/* Total Calculation Banner */}
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '8px',
            padding: '12px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#166534' }}>Estimated Invoice Total:</span>
            <span style={{ fontSize: '18px', fontWeight: 900, color: '#15803d' }}>
              ₹{((parseFloat(purchaseForm.quantity) || 0) * (parseFloat(purchaseForm.unitPrice) || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* Modal Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
            <button
              type="button"
              disabled={isSubmitting}
              className="btn btn-outline"
              onClick={() => setIsPurchaseModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                background: isSubmitting ? '#cbd5e1' : '#0f172a',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                padding: '10px 22px',
                borderRadius: '8px',
                fontSize: '13px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 6px rgba(15,23,42,0.25)'
              }}
            >
              {isSubmitting ? 'Recording...' : 'Record Purchase & Restock'}
            </button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
