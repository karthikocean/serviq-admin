import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState, DEFAULT_INVENTORY_CATEGORIES } from '../config/AppContext';
import InventoryApi from '../api/Inventory';
import InventoryCategoryApi from '../api/InventoryCategory';
import { Modal } from './Modal';
import ShowNotifications from '../helper/ShowNotifications';
import SearchableSelect from './SearchableSelect.jsx';
import { formatDateDMY, formatDateTimeDMY } from '../helper/DateHelper.js';

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
  const [reductionToDelete, setReductionToDelete] = useState(null);
  const [purchaseToDelete, setPurchaseToDelete] = useState(null);
  const [apiStats, setApiStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Categories, Items, Stats, and Logs from API
  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = { limit: 1000 };
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

  // Helper to check if a string is a raw MongoDB ObjectId or UUID
  const isMongoId = (str) => {
    if (!str || typeof str !== 'string') return false;
    return /^[a-fA-F0-9]{24}$/.test(str.trim()) || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str.trim());
  };

  // Helper to get clean human-readable item name (never shows raw backend _id)
  const getItemDisplayName = (rawName, itemId) => {
    if (rawName && typeof rawName === 'string' && !isMongoId(rawName) && rawName !== '—') {
      return rawName;
    }
    const targetId = (typeof itemId === 'object' ? (itemId?._id || itemId?.id) : itemId) || (isMongoId(rawName) ? rawName : null);
    if (targetId) {
      const matched = rawInventory.find(i => (
        (i._id && String(i._id) === String(targetId)) ||
        (i.id && String(i.id) === String(targetId)) ||
        (i.sku && String(i.sku) === String(targetId))
      ));
      if (matched) {
        if (matched.name && !isMongoId(matched.name)) return matched.name;
        if (matched.itemName && !isMongoId(matched.itemName)) return matched.itemName;
        if (matched.sku) return `Item (${matched.sku})`;
      }
    }
    if (typeof itemId === 'object' && itemId?.name && !isMongoId(itemId.name)) {
      return itemId.name;
    }
    return 'Item';
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

  // View and Modals state
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'reduce-form' | 'purchase-form'
  const [selectedItemForReduction, setSelectedItemForReduction] = useState(null);

  // Form: Reduce Stock
  const [reduceForm, setReduceForm] = useState({
    itemId: '',
    quantity: '',
    reason: 'Kitchen Usage',
    notes: '',
    date: new Date().toISOString().slice(0, 16)
  });
  const [reduceErrors, setReduceErrors] = useState({});

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
  const [purchaseErrors, setPurchaseErrors] = useState({});

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
    setReduceErrors({});
    setViewMode('reduce-form');
  };

  const handleItemSelectChange = (itemId) => {
    const item = inventory.find(i => (i._id === itemId || i.id === itemId));
    setSelectedItemForReduction(item || null);
    setReduceForm(prev => ({ ...prev, itemId }));
    if (reduceErrors.itemId) setReduceErrors(prev => ({ ...prev, itemId: '' }));
  };

  const handleReduceSubmit = async (e) => {
    if (e) e.preventDefault();
    const errors = {};

    if (!reduceForm.itemId) {
      errors.itemId = 'Please select an inventory item.';
    }

    const currentItem = inventory.find(i => (i._id === reduceForm.itemId || i.id === reduceForm.itemId));
    const qtyNum = parseFloat(reduceForm.quantity);

    if (!reduceForm.quantity || isNaN(qtyNum) || qtyNum <= 0) {
      errors.quantity = 'Please enter a valid reduction quantity greater than 0.';
    } else {
      const availableStock = Number(currentItem?.currentStock) || 0;
      if (currentItem && qtyNum > availableStock) {
        errors.quantity = `Reduction quantity (${qtyNum} ${currentItem.unit || 'unit'}) exceeds available stock (${availableStock} ${currentItem.unit || 'unit'})!`;
      }
    }

    if (!reduceForm.reason) {
      errors.reason = 'Please select a reason for reduction.';
    }

    if (Object.keys(errors).length > 0) {
      setReduceErrors(errors);
      return;
    }

    setReduceErrors({});
    setIsSubmitting(true);
    const itemId = currentItem?._id || currentItem?.id || reduceForm.itemId;
    const itemCost = Number(currentItem?.costPerUnit) || 0;
    const reductionValue = qtyNum * itemCost;

    const rawBranch = currentItem?.branchId || (selectedBranchId && selectedBranchId !== 'ALL' ? selectedBranchId : undefined);
    const cleanBranchId = typeof rawBranch === 'object' ? (rawBranch?._id || rawBranch?.id) : rawBranch;

    const payload = {
      itemId: itemId,
      quantity: qtyNum,
      quantityToReduce: qtyNum,
      reductionQuantity: qtyNum,
      reason: reduceForm.reason,
      details: reduceForm.notes || '',
      notes: reduceForm.notes || '',
      value: reductionValue,
      branchId: cleanBranchId
    };

    try {
      const res = await InventoryApi.reduceStock(payload);
      if (res?.status) {
        if (itemId) {
          await InventoryApi.updateItem(itemId, {
            currentStock: Math.max(0, (Number(currentItem?.currentStock) || 0) - qtyNum)
          }).catch(() => {});
        }
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
        setViewMode('list');
        ShowNotifications.showAlertNotification('Stock reduction recorded successfully!', true);
      } else {
        setReduceErrors({
          general: res?.response?.message || 'Failed to record stock reduction.'
        });
      }
    } catch (err) {
      console.error("Reduce stock error:", err);
      setReduceErrors({
        general: 'Failed to record stock reduction. Please check connection and try again.'
      });
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
    setPurchaseErrors({});
    setViewMode('purchase-form');
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
    setPurchaseErrors(prev => ({ ...prev, itemId: '', itemName: '' }));
  };

  const handlePurchaseSubmit = async (e) => {
    if (e) e.preventDefault();
    const errors = {};

    if (!purchaseForm.itemName || !purchaseForm.itemName.trim()) {
      errors.itemName = 'Please enter or select an item name.';
    }

    if (purchaseForm.supplierPhone && purchaseForm.supplierPhone.trim()) {
      if (!/^\d{10}$/.test(purchaseForm.supplierPhone.trim())) {
        errors.supplierPhone = 'Please enter a valid 10-digit phone number.';
      }
    }

    const qtyNum = parseFloat(purchaseForm.quantity);
    if (!purchaseForm.quantity || isNaN(qtyNum) || qtyNum <= 0) {
      errors.quantity = 'Please enter a valid quantity greater than 0.';
    }

    const rateNum = parseFloat(purchaseForm.unitPrice);
    if (purchaseForm.unitPrice === '' || isNaN(rateNum) || rateNum < 0) {
      errors.unitPrice = 'Please enter a valid unit cost price (0 or greater).';
    }

    if (Object.keys(errors).length > 0) {
      setPurchaseErrors(errors);
      return;
    }

    setPurchaseErrors({});
    setIsSubmitting(true);

    const totalAmt = qtyNum * (rateNum || 0);
    let currentItem = inventory.find(i => (i._id === purchaseForm.itemId || i.id === purchaseForm.itemId || i.name.toLowerCase() === purchaseForm.itemName.toLowerCase()));
    let itemId = currentItem?._id || currentItem?.id;

    // If custom entry and item does not exist, create the item first
    if ((!itemId || purchaseForm.itemId === 'CUSTOM') && purchaseForm.itemName.trim()) {
      try {
        const rawBranch = selectedBranchId && selectedBranchId !== 'ALL' ? selectedBranchId : undefined;
        const cleanBranchId = typeof rawBranch === 'object' ? (rawBranch?._id || rawBranch?.id) : rawBranch;
        
        const createRes = await InventoryApi.createItem({
          name: purchaseForm.itemName.trim(),
          category: purchaseForm.category || 'General',
          unit: purchaseForm.unit || 'kg',
          costPerUnit: rateNum || 0,
          currentStock: 0,
          minStockThreshold: 5,
          idealStockLevel: 50,
          supplierName: purchaseForm.supplierName.trim() || undefined,
          supplierPhone: purchaseForm.supplierPhone.trim() || undefined,
          branchId: cleanBranchId
        });
        if (createRes?.status && createRes?.response?.data) {
          itemId = createRes.response.data._id || createRes.response.data.id;
        }
      } catch (createErr) {
        console.error("Auto create item error:", createErr);
      }
    }

    const rawBranch = currentItem?.branchId || (selectedBranchId && selectedBranchId !== 'ALL' ? selectedBranchId : undefined);
    const cleanBranchId = typeof rawBranch === 'object' ? (rawBranch?._id || rawBranch?.id) : rawBranch;

    const payload = {
      itemId: itemId || undefined,
      supplierName: purchaseForm.supplierName.trim() || 'Direct Vendor',
      supplierPhone: purchaseForm.supplierPhone.trim(),
      purchaseQty: qtyNum,
      unitPrice: rateNum,
      totalAmount: totalAmt,
      invoiceNumber: purchaseForm.invoiceNumber.trim() || `INV-${Date.now().toString().slice(-5)}`,
      purchaseDate: purchaseForm.purchaseDate ? new Date(purchaseForm.purchaseDate).toISOString() : new Date().toISOString(),
      branchId: cleanBranchId
    };

    try {
      const res = await InventoryApi.recordPurchase(payload);
      if (res?.status) {
        if (itemId) {
          await InventoryApi.updateItem(itemId, {
            currentStock: (Number(currentItem?.currentStock) || 0) + qtyNum
          }).catch(() => {});
        }
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
        setViewMode('list');
        ShowNotifications.showAlertNotification('Purchase record saved and stock added!', true);
      } else {
        setPurchaseErrors({
          general: res?.response?.message || 'Failed to record purchase. Please check the entered values.'
        });
      }
    } catch (err) {
      console.error("Record purchase error:", err);
      setPurchaseErrors({
        general: 'Failed to record purchase. Please check connection and try again.'
      });
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
        `"${r.createdAt ? formatDateTimeDMY(r.createdAt) : (r.date || '')}"`,
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
        p.purchaseDate ? formatDateDMY(p.purchaseDate) : (p.createdAt ? formatDateDMY(p.createdAt) : ''),
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
    const matchedItem = rawInventory.find(i => (i._id === r.itemId || i.id === r.itemId || i.sku === r.itemId || i._id === r.itemId?._id));
    const rName = getItemDisplayName(r.itemName || (typeof r.itemId === 'object' ? (r.itemId?.name || r.itemId?.itemName) : ''), r.itemId);
    const rReason = r.reason || '';
    const rUser = typeof r.reducedBy === 'object' ? (r.reducedBy?.name || '') : (r.reducedBy || '');
    const rNotes = r.details || r.notes || '';
    const rCat = (typeof r.itemId === 'object' && r.itemId?.categoryId) ? (rawCategories.find(c => (c._id === r.itemId.categoryId || c.id === r.itemId.categoryId))?.name || 'General') : (matchedItem ? getCategoryName(matchedItem) : (r.category || 'General'));

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
    const matchedItem = rawInventory.find(i => (i._id === p.itemId || i.id === p.itemId || i.sku === p.itemId || i._id === p.itemId?._id));
    const pName = getItemDisplayName(p.itemName || (typeof p.itemId === 'object' ? (p.itemId?.name || p.itemId?.itemName) : ''), p.itemId);
    const pInv = p.invoiceNumber || '';
    const pSupplier = p.supplierName || '';
    const pUser = typeof p.addedBy === 'object' ? (p.addedBy?.name || '') : (p.addedBy || '');
    const pCat = (typeof p.itemId === 'object' && p.itemId?.categoryId) ? (rawCategories.find(c => (c._id === p.itemId.categoryId || c.id === p.itemId.categoryId))?.name || 'General') : (matchedItem ? getCategoryName(matchedItem) : (p.category || 'General'));

    const matchesSearch = pName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          pInv.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          pSupplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          pUser.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || pCat === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Filtered Inventory for Quick Actions Tab
  const filteredInventory = inventory.filter(i => {
    const itemName = getItemDisplayName(i.name || i.itemName, i._id || i.id);
    const catName = getCategoryName(i);
    const matchesSearch = (itemName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

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

  if (viewMode === 'reduce-form') {
    return (
      <section className="panel-view active" style={{ padding: '0 24px 24px 24px', width: '100%', boxSizing: 'border-box' }}>
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '20px 28px',
          marginBottom: '24px',
          border: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '18px',
                fontWeight: 800,
                color: '#0f172a',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
            >
              ←
            </button>
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>
                Reduce Inventory Stock
              </h2>
            </div>
          </div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '32px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', width: '100%', boxSizing: 'border-box' }}>
          <form onSubmit={handleReduceSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {reduceErrors.general && (
              <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '13px', fontWeight: 600 }}>
                {reduceErrors.general}
              </div>
            )}

            {/* Select Item */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                Select Item <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <SearchableSelect
                isDisabled={isSubmitting}
                value={reduceForm.itemId}
                onChange={e => handleItemSelectChange(e.target.value)}
                options={inventory.map(item => ({
                  value: item._id || item.id,
                  label: `${item.name} (${item.currentStock} ${item.unit} available)`
                }))}
                placeholder="Select Item..."
              />
              {reduceErrors.itemId && (
                <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                  {reduceErrors.itemId}
                </span>
              )}
            </div>

            {/* Current Stock Banner */}
            {selectedItemForReduction && (
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Available Stock Balance</span>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', marginTop: '2px' }}>
                    {selectedItemForReduction.currentStock} {selectedItemForReduction.unit}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Min Threshold Alert</span>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#d97706', marginTop: '2px' }}>
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
                onChange={e => {
                  setReduceForm({ ...reduceForm, quantity: e.target.value });
                  if (reduceErrors.quantity) setReduceErrors(prev => ({ ...prev, quantity: '' }));
                }}
                placeholder="e.g. 5"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: reduceErrors.quantity ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              {reduceErrors.quantity && (
                <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                  {reduceErrors.quantity}
                </span>
              )}
            </div>

            {/* Reason */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                Reason for Reduction <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <SearchableSelect
                isDisabled={isSubmitting}
                value={reduceForm.reason}
                onChange={e => {
                  setReduceForm({ ...reduceForm, reason: e.target.value });
                  if (reduceErrors.reason) setReduceErrors(prev => ({ ...prev, reason: '' }));
                }}
                options={REDUCTION_REASONS.map(r => ({
                  value: r.id,
                  label: `${r.label} — ${r.desc}`
                }))}
                placeholder="Select Reason..."
              />
              {reduceErrors.reason && (
                <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                  {reduceErrors.reason}
                </span>
              )}
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
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
              <button
                type="button"
                disabled={isSubmitting}
                className="btn btn-outline"
                onClick={() => setViewMode('list')}
                style={{ padding: '10px 24px' }}
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
                  padding: '10px 26px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 8px rgba(255,90,31,0.25)'
                }}
              >
                {isSubmitting ? 'Reducing...' : 'Confirm Reduction'}
              </button>
            </div>
          </form>
        </div>
      </section>
    );
  }

  if (viewMode === 'purchase-form') {
    return (
      <section className="panel-view active" style={{ padding: '0 24px 24px 24px', width: '100%', boxSizing: 'border-box' }}>
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '20px 28px',
          marginBottom: '24px',
          border: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '18px',
                fontWeight: 800,
                color: '#0f172a',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
            >
              ←
            </button>
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>
                Record Inbound Purchase (Vendor Restock)
              </h2>
            </div>
          </div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '32px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', width: '100%', boxSizing: 'border-box' }}>
          <form onSubmit={handlePurchaseSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {purchaseErrors.general && (
              <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '13px', fontWeight: 600 }}>
                {purchaseErrors.general}
              </div>
            )}

            {/* Row 1: Item Source Selection */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  Inventory Item <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <SearchableSelect
                  isDisabled={isSubmitting}
                  value={purchaseForm.itemId}
                  onChange={e => handlePurchaseItemSelect(e.target.value)}
                  options={[
                    ...inventory.map(item => ({
                      value: item._id || item.id,
                      label: `${item.name} (${getCategoryName(item)})`
                    })),
                    { value: 'CUSTOM', label: '+ New / Unlisted Item' }
                  ]}
                  placeholder="Select or Enter Item..."
                />
                {(purchaseErrors.itemId || purchaseErrors.itemName) && (
                  <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                    {purchaseErrors.itemId || purchaseErrors.itemName}
                  </span>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  Item Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  disabled={isSubmitting || purchaseForm.itemId !== 'CUSTOM'}
                  value={purchaseForm.itemName}
                  onChange={e => {
                    setPurchaseForm({ ...purchaseForm, itemName: e.target.value });
                    if (purchaseErrors.itemName) setPurchaseErrors(prev => ({ ...prev, itemName: '' }));
                  }}
                  placeholder="e.g. Basmati Rice 25kg"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: purchaseErrors.itemName ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                    fontSize: '14px',
                    backgroundColor: purchaseForm.itemId !== 'CUSTOM' ? '#f8fafc' : '#ffffff',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                {purchaseErrors.itemName && purchaseForm.itemId === 'CUSTOM' && (
                  <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                    {purchaseErrors.itemName}
                  </span>
                )}
              </div>
            </div>

            {/* Row 2: Supplier Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  Supplier / Vendor Name
                </label>
                <input
                  type="text"
                  disabled={isSubmitting}
                  value={purchaseForm.supplierName}
                  onChange={e => {
                    setPurchaseForm({ ...purchaseForm, supplierName: e.target.value });
                    if (purchaseErrors.supplierName) setPurchaseErrors(prev => ({ ...prev, supplierName: '' }));
                  }}
                  placeholder="e.g. Metro Cash & Carry"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: purchaseErrors.supplierName ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                {purchaseErrors.supplierName && (
                  <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                    {purchaseErrors.supplierName}
                  </span>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  Supplier Phone Number
                </label>
                <input
                  type="text"
                  maxLength={10}
                  inputMode="numeric"
                  disabled={isSubmitting}
                  value={purchaseForm.supplierPhone}
                  onChange={e => {
                    const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                    setPurchaseForm({ ...purchaseForm, supplierPhone: val });
                    if (purchaseErrors.supplierPhone) setPurchaseErrors(prev => ({ ...prev, supplierPhone: '' }));
                  }}
                  placeholder="10 digit mobile number"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: purchaseErrors.supplierPhone ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                {purchaseErrors.supplierPhone && (
                  <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                    {purchaseErrors.supplierPhone}
                  </span>
                )}
              </div>
            </div>

            {/* Row 3: Quantity, Unit & Unit Price */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
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
                  onChange={e => {
                    setPurchaseForm({ ...purchaseForm, quantity: e.target.value });
                    if (purchaseErrors.quantity) setPurchaseErrors(prev => ({ ...prev, quantity: '' }));
                  }}
                  placeholder="10"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: purchaseErrors.quantity ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                {purchaseErrors.quantity && (
                  <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                    {purchaseErrors.quantity}
                  </span>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  Unit
                </label>
                <SearchableSelect
                  isDisabled={isSubmitting}
                  value={purchaseForm.unit}
                  onChange={e => setPurchaseForm({ ...purchaseForm, unit: e.target.value })}
                  options={[
                    { value: 'kg', label: 'kg (Kilogram)' },
                    { value: 'g', label: 'g (Grams)' },
                    { value: 'L', label: 'L (Liter)' },
                    { value: 'ml', label: 'ml (Milliliter)' },
                    { value: 'pcs', label: 'pcs (Pieces)' },
                    { value: 'box', label: 'box (Boxes)' },
                    { value: 'bag', label: 'bag (Bags)' },
                    { value: 'pack', label: 'pack (Packets)' }
                  ]}
                  placeholder="Select Unit..."
                />
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
                  onChange={e => {
                    setPurchaseForm({ ...purchaseForm, unitPrice: e.target.value });
                    if (purchaseErrors.unitPrice) setPurchaseErrors(prev => ({ ...prev, unitPrice: '' }));
                  }}
                  placeholder="100"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: purchaseErrors.unitPrice ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                {purchaseErrors.unitPrice && (
                  <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                    {purchaseErrors.unitPrice}
                  </span>
                )}
              </div>
            </div>

            {/* Row 4: Invoice Number & Date */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  Invoice / Bill Number
                </label>
                <input
                  type="text"
                  disabled={isSubmitting}
                  value={purchaseForm.invoiceNumber}
                  onChange={e => {
                    setPurchaseForm({ ...purchaseForm, invoiceNumber: e.target.value });
                    if (purchaseErrors.invoiceNumber) setPurchaseErrors(prev => ({ ...prev, invoiceNumber: '' }));
                  }}
                  placeholder="e.g. INV-90821"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: purchaseErrors.invoiceNumber ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                {purchaseErrors.invoiceNumber && (
                  <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                    {purchaseErrors.invoiceNumber}
                  </span>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  Purchase Date
                </label>
                <input
                  type="date"
                  disabled={isSubmitting}
                  value={purchaseForm.purchaseDate}
                  onChange={e => {
                    setPurchaseForm({ ...purchaseForm, purchaseDate: e.target.value });
                    if (purchaseErrors.purchaseDate) setPurchaseErrors(prev => ({ ...prev, purchaseDate: '' }));
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: purchaseErrors.purchaseDate ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: '#ffffff',
                    boxSizing: 'border-box'
                  }}
                />
                {purchaseErrors.purchaseDate && (
                  <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                    {purchaseErrors.purchaseDate}
                  </span>
                )}
              </div>
            </div>

            {/* Total Calculation Banner */}
            <div style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '10px',
              padding: '16px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#166534' }}>Estimated Invoice Total:</span>
              <span style={{ fontSize: '20px', fontWeight: 900, color: '#15803d' }}>
                ₹{((parseFloat(purchaseForm.quantity) || 0) * (parseFloat(purchaseForm.unitPrice) || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
              <button
                type="button"
                disabled={isSubmitting}
                className="btn btn-outline"
                onClick={() => setViewMode('list')}
                style={{ padding: '10px 24px' }}
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
                  padding: '10px 26px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 6px rgba(15,23,42,0.25)'
                }}
              >
                {isSubmitting ? 'Recording...' : 'Record Purchase & Restock'}
              </button>
            </div>
          </form>
        </div>
      </section>
    );
  }

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
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: '220px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>View:</label>
              <div style={{ flex: 1 }}>
                <SearchableSelect
                  value={activeTab}
                  onChange={e => { setActiveTab(e.target.value); setCurrentPage(1); }}
                  options={[
                    { value: 'reductions', label: `Stock Reduction Items (${inventory.length})` },
                    { value: 'history', label: `Reduction History Logs (${reductions.length})` },
                    { value: 'purchases', label: `Purchase Records (${purchases.length})` }
                  ]}
                  placeholder="Select View..."
                />
              </div>
            </div>

            {/* Category Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: '180px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>Category:</label>
              <div style={{ flex: 1 }}>
                <SearchableSelect
                  value={categoryFilter}
                  onChange={e => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                  options={[
                    { value: 'All', label: 'All Categories' },
                    ...rawCategories
                      .filter(c => c.status !== 'UNAVAILABLE' && c.status !== 'Inactive' && c.status !== 'Disabled' && c.status !== false)
                      .map(c => ({
                        value: c.name,
                        label: c.name
                      }))
                  ]}
                  placeholder="Select Category..."
                />
              </div>
            </div>

            {/* Reason Filter (Only for history view) */}
            {activeTab === 'history' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: '180px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>Reason:</label>
                <div style={{ flex: 1 }}>
                  <SearchableSelect
                    value={reasonFilter}
                    onChange={e => { setReasonFilter(e.target.value); setCurrentPage(1); }}
                    options={[
                      { value: 'All', label: 'All Reasons' },
                      ...REDUCTION_REASONS.map(r => ({
                        value: r.id,
                        label: r.label
                      }))
                    ]}
                    placeholder="Select Reason..."
                  />
                </div>
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
        <div style={{ width: '100%', overflowX: 'auto', paddingBottom: '6px' }}>
          
          {/* TAB 1: QUICK REDUCTION ITEMS */}
          {activeTab === 'reductions' && (
            <table style={{ width: '100%', minWidth: '950px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
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
                          <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '14px' }}>
                            {getItemDisplayName(item.name || item.itemName, item._id || item.id)}
                          </div>
                          <div style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>SKU: {item.sku || 'N/A'}</div>
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
            <table style={{ width: '100%', minWidth: '1050px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#000000', borderBottom: '3px solid #ff5a1f', color: '#ffffff' }}>
                  <th style={{ padding: '14px 18px', fontWeight: 800, width: '50px' }}>S.NO.</th>
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
                    <td colSpan="8" style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                      Loading reduction logs...
                    </td>
                  </tr>
                ) : paginatedData.length > 0 ? (
                  paginatedData.map((record, idx) => {
                    const dateFormatted = record.createdAt ? formatDateTimeDMY(record.createdAt) : (record.date || '—');
                    const itemName = getItemDisplayName(record.itemName || (typeof record.itemId === 'object' ? (record.itemId?.name || record.itemId?.itemName) : ''), record.itemId);
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
                        <td style={{ padding: '14px 18px', color: '#64748b', fontWeight: 700 }}>
                          {(currentPage - 1) * rowsPerPage + idx + 1}
                        </td>
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
                            onClick={() => setReductionToDelete({ record, itemName })}
                            style={{
                              background: '#fef2f2',
                              border: '1px solid #fecaca',
                              color: '#dc2626',
                              padding: '5px 8px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            title="Delete Record"
                          >
                            <TrashIcon size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                      No reduction logs recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {/* TAB 3: PURCHASE RECORDS */}
          {activeTab === 'purchases' && (
            <table style={{ width: '100%', minWidth: '1100px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#000000', borderBottom: '3px solid #ff5a1f', color: '#ffffff' }}>
                  <th style={{ padding: '14px 18px', fontWeight: 800, width: '50px' }}>S.NO.</th>
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
                    <td colSpan="8" style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                      Loading purchase records...
                    </td>
                  </tr>
                ) : paginatedData.length > 0 ? (
                  paginatedData.map((p, idx) => {
                    const invoiceNum = p.invoiceNumber || `INV-${(p._id || '').slice(-5)}`;
                    const dateFormatted = p.purchaseDate ? formatDateDMY(p.purchaseDate) : (p.createdAt ? formatDateDMY(p.createdAt) : '—');
                    const itemName = getItemDisplayName(p.itemName || (typeof p.itemId === 'object' ? (p.itemId?.name || p.itemId?.itemName) : ''), p.itemId);
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
                        <td style={{ padding: '14px 18px', color: '#64748b', fontWeight: 700 }}>
                          {(currentPage - 1) * rowsPerPage + idx + 1}
                        </td>
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
                            onClick={() => setPurchaseToDelete({ purchase: p, invoiceNum })}
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
        {/* Pagination Controls */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '20px',
          paddingTop: '16px',
          borderTop: '1px solid #f1f5f9',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
            Showing {activeDataList.length === 0 ? 0 : ((currentPage - 1) * rowsPerPage) + 1} to {Math.min(currentPage * rowsPerPage, activeDataList.length)} of {activeDataList.length} entries
          </div>

          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: currentPage === 1 ? '#f8fafc' : '#ffffff',
                color: currentPage === 1 ? '#cbd5e1' : '#334155',
                fontSize: '13px',
                fontWeight: 600,
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Prev
            </button>

            {getPageNumbers().map(pageNum => (
              <button
                key={pageNum}
                type="button"
                onClick={() => setCurrentPage(pageNum)}
                style={{
                  minWidth: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: currentPage === pageNum ? 700 : 500,
                  border: currentPage === pageNum ? 'none' : '1px solid #e2e8f0',
                  background: currentPage === pageNum ? '#000000' : '#ffffff',
                  color: currentPage === pageNum ? '#ffffff' : '#334155',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {pageNum}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages || totalPages === 0}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: (currentPage >= totalPages || totalPages === 0) ? '#f8fafc' : '#ffffff',
                color: (currentPage >= totalPages || totalPages === 0) ? '#cbd5e1' : '#334155',
                fontSize: '13px',
                fontWeight: 600,
                cursor: (currentPage >= totalPages || totalPages === 0) ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Delete Reduction Log Confirmation Modal */}
      {reductionToDelete && (
        <Modal
          isOpen={!!reductionToDelete}
          onClose={() => setReductionToDelete(null)}
          title="Confirm Reduction Log Deletion"
          maxWidth="440px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '8px' }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#1e293b', lineHeight: '1.5' }}>
              Are you sure you want to delete reduction log for <strong>"{reductionToDelete.itemName}"</strong>?
            </p>
            <div style={{ fontSize: '12px', color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', padding: '10px 14px', borderRadius: '8px' }}>
              ⚠️ Warning: This action cannot be undone.
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setReductionToDelete(null)}
                style={{ padding: '8px 18px' }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-black"
                onClick={() => {
                  if (deleteReductionRecord && activeRestaurant?.id && reductionToDelete) {
                    deleteReductionRecord(activeRestaurant.id, reductionToDelete.record.id || reductionToDelete.record._id);
                    fetchAllData();
                  }
                  setReductionToDelete(null);
                }}
                style={{ padding: '8px 20px', background: '#dc2626', borderColor: '#dc2626', color: '#ffffff', fontWeight: 700 }}
              >
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Purchase Record Confirmation Modal */}
      {purchaseToDelete && (
        <Modal
          isOpen={!!purchaseToDelete}
          onClose={() => setPurchaseToDelete(null)}
          title="Confirm Purchase Record Deletion"
          maxWidth="440px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '8px' }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#1e293b', lineHeight: '1.5' }}>
              Are you sure you want to delete purchase record <strong>#{purchaseToDelete.invoiceNum}</strong>?
            </p>
            <div style={{ fontSize: '12px', color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', padding: '10px 14px', borderRadius: '8px' }}>
              ⚠️ Warning: This action cannot be undone.
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setPurchaseToDelete(null)}
                style={{ padding: '8px 18px' }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-black"
                onClick={() => {
                  if (deletePurchaseRecord && activeRestaurant?.id && purchaseToDelete) {
                    deletePurchaseRecord(activeRestaurant.id, purchaseToDelete.purchase.id || purchaseToDelete.purchase._id);
                    ShowNotifications.showAlertNotification("Purchase record removed.", true);
                    fetchAllData();
                  }
                  setPurchaseToDelete(null);
                }}
                style={{ padding: '8px 20px', background: '#dc2626', borderColor: '#dc2626', color: '#ffffff', fontWeight: 700 }}
              >
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}
