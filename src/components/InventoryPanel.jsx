import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState, DEFAULT_INVENTORY_CATEGORIES } from '../config/AppContext';
import InventoryApi from '../api/Inventory';
import InventoryCategoryApi from '../api/InventoryCategory';
import BranchApi from '../api/Branch';
import { Modal } from './Modal';
import ShowNotifications from '../helper/ShowNotifications';

// Clean SVG Icons
const BoxIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
    <line x1="12" y1="22.08" x2="12" y2="12"></line>
  </svg>
);

const AlertTriangleIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);

const TrendingUpIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
    <polyline points="17 6 23 6 23 12"></polyline>
  </svg>
);

const LayersIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
    <polyline points="2 17 12 22 22 17"></polyline>
    <polyline points="2 12 12 17 22 12"></polyline>
  </svg>
);

const PlusIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const SearchIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const PencilIcon = ({ size = 15, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
    <path d="m15 5 4 4"></path>
  </svg>
);

const TrashIcon = ({ size = 15, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18"></path>
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
  </svg>
);

const HistoryIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

const RefreshIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
  </svg>
);

const ArrowDownLeftIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="17" y1="7" x2="7" y2="17"></line>
    <polyline points="17 17 7 17 7 7"></polyline>
  </svg>
);

const ArrowUpRightIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="7" y1="17" x2="17" y2="7"></line>
    <polyline points="7 7 17 7 17 17"></polyline>
  </svg>
);

export default function InventoryPanel() {
  const navigate = useNavigate();
  const {
    activeRestaurant,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    adjustStock,
    selectedBranchId
  } = useAppState();

  const rawLogs = activeRestaurant?.inventoryLogs || [];
  const rawCategories = activeRestaurant?.inventoryCategories || DEFAULT_INVENTORY_CATEGORIES;

  // Live API States
  const [items, setItems] = useState([]);
  const [liveCategories, setLiveCategories] = useState([]);
  const [liveBranches, setLiveBranches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [itemNameFilter, setItemNameFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Low Stock' | 'Out of Stock' | 'In Stock'

  // Modals state
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustTargetItem, setAdjustTargetItem] = useState(null);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Form states for Add / Edit Item
  const [formState, setFormState] = useState({
    id: '',
    name: '',
    sku: '',
    categoryId: '',
    category: '',
    branchId: '',
    currentStock: '',
    minAlertLevel: '',
    unit: 'kg',
    costPerUnit: '',
    supplierName: '',
    supplierPhone: '',
    status: 'AVAILABLE'
  });

  const [formErrors, setFormErrors] = useState({});

  // Adjustment form state
  const [adjustState, setAdjustState] = useState({
    type: 'Stock In', // 'Stock In' | 'Stock Out'
    quantity: '',
    reason: 'Supplier Purchase',
    notes: ''
  });
  const [adjustErrors, setAdjustErrors] = useState({});

  const [apiStats, setApiStats] = useState(null);

  // 1. Fetch Categories
  const fetchCategories = useCallback(async () => {
    try {
      const params = {};
      if (selectedBranchId && selectedBranchId !== 'ALL') {
        params.branchId = selectedBranchId;
      }
      const res = await InventoryCategoryApi.getCategories(params);
      if (res?.status) {
        const rawData = res.response?.data || res.response?.categories || res.response || [];
        const list = (Array.isArray(rawData) ? rawData : (Array.isArray(rawData?.data) ? rawData.data : [])).filter(item => !item?.isDelete);
        setLiveCategories(list);
      }
    } catch (err) {
      console.error("Failed to load inventory categories:", err);
    }
  }, [selectedBranchId]);

  // 2. Fetch Branches
  const fetchBranches = useCallback(async () => {
    try {
      const res = await BranchApi.getBranches();
      if (res?.status) {
        const rawData = res.response?.data || res.response?.branches || res.response || [];
        const list = Array.isArray(rawData) ? rawData : (Array.isArray(rawData?.data) ? rawData.data : []);
        setLiveBranches(list);
      }
    } catch (err) {
      console.error("Failed to load branches:", err);
    }
  }, []);

  // 3. Fetch Stats from Backend API
  const fetchStats = useCallback(async () => {
    try {
      const params = {};
      if (selectedBranchId && selectedBranchId !== 'ALL') {
        params.branchId = selectedBranchId;
      }
      const res = await InventoryApi.getStats(params);
      if (res?.status && res.response?.data) {
        setApiStats(res.response.data);
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  }, [selectedBranchId]);

  // 4. Fetch Items from Backend API
  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (selectedBranchId && selectedBranchId !== 'ALL') {
        params.branchId = selectedBranchId;
      }
      const res = await InventoryApi.getItems(params);
      if (res?.status) {
        const rawData = res.response?.data || res.response?.items || res.response || [];
        const list = (Array.isArray(rawData) ? rawData : (Array.isArray(rawData?.data) ? rawData.data : [])).filter(item => !item?.isDelete);
        setItems(list);
      } else {
        // Fallback to local context data if API is unreachable
        if (activeRestaurant?.inventory && items.length === 0) {
          setItems(activeRestaurant.inventory);
        }
      }
    } catch (err) {
      console.error("Failed to fetch inventory items:", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedBranchId, activeRestaurant, items.length]);

  const [liveLogs, setLiveLogs] = useState([]);

  // 5. Fetch Logs from Backend API
  const fetchLogs = useCallback(async () => {
    try {
      const params = {};
      if (selectedBranchId && selectedBranchId !== 'ALL') {
        params.branchId = selectedBranchId;
      }
      const [purchaseRes, reduceRes] = await Promise.all([
        InventoryApi.getLogs({ ...params, type: 'purchase' }),
        InventoryApi.getLogs({ ...params, type: 'reduction' })
      ]);

      const pList = (purchaseRes?.status && (purchaseRes.response?.data || purchaseRes.response?.logs || [])) || [];
      const rList = (reduceRes?.status && (reduceRes.response?.data || reduceRes.response?.logs || [])) || [];

      const combined = [
        ...pList.map(p => ({
          id: p._id || p.id,
          date: p.purchaseDate ? new Date(p.purchaseDate).toLocaleString('en-IN') : (p.createdAt ? new Date(p.createdAt).toLocaleString('en-IN') : '—'),
          rawDate: p.purchaseDate || p.createdAt,
          itemName: typeof p.itemId === 'object' ? p.itemId?.name : (p.itemName || '—'),
          type: 'Stock In',
          quantity: p.purchaseQty !== undefined ? p.purchaseQty : p.quantity,
          unit: (typeof p.itemId === 'object' && p.itemId?.unit) ? p.itemId.unit : (p.unit || 'unit'),
          reason: `Supplier: ${p.supplierName || 'Purchase'}`,
          notes: p.invoiceNumber ? `Invoice: ${p.invoiceNumber}` : '',
          user: typeof p.addedBy === 'object' ? (p.addedBy?.name || 'Staff') : (p.addedBy || 'Admin')
        })),
        ...rList.map(r => ({
          id: r._id || r.id,
          date: r.createdAt ? new Date(r.createdAt).toLocaleString('en-IN') : (r.date || '—'),
          rawDate: r.createdAt || r.date,
          itemName: typeof r.itemId === 'object' ? r.itemId?.name : (r.itemName || '—'),
          type: 'Stock Out',
          quantity: r.quantityToReduce !== undefined ? r.quantityToReduce : r.quantity,
          unit: (typeof r.itemId === 'object' && r.itemId?.unit) ? r.itemId.unit : (r.unit || 'unit'),
          reason: r.reason || 'Kitchen Usage',
          notes: r.details || r.notes || '',
          user: typeof r.reducedBy === 'object' ? (r.reducedBy?.name || 'Staff') : (r.reducedBy || 'Admin')
        }))
      ].sort((a, b) => new Date(b.rawDate || 0) - new Date(a.rawDate || 0));

      if (combined.length > 0) {
        setLiveLogs(combined);
      }
    } catch (err) {
      console.error("Failed to fetch logs in InventoryPanel:", err);
    }
  }, [selectedBranchId]);

  useEffect(() => {
    fetchCategories();
    fetchBranches();
    fetchStats();
    fetchItems();
    fetchLogs();
  }, [fetchCategories, fetchBranches, fetchStats, fetchItems, fetchLogs]);

  // Unified available branches list
  const availableBranches = liveBranches.length > 0 ? liveBranches : (activeRestaurant?.branches || []);
  const availableCategories = liveCategories.length > 0 ? liveCategories : rawCategories;

  // Helper to extract category name from item
  const getCategoryName = (item) => {
    if (item.categoryId && typeof item.categoryId === 'object') {
      return item.categoryId.name || 'General';
    }
    if (item.categoryId) {
      const match = liveCategories.find(c => (c._id === item.categoryId || c.id === item.categoryId));
      if (match) return match.name;
    }
    return item.category || 'General';
  };

  // Helper to get branch label from item
  const getBranchLabel = (branchId) => {
    if (!branchId) return 'Main Branch';
    const match = availableBranches.find(b => (b._id === branchId || b.id === branchId));
    return match ? (match.branchName || match.name) : branchId;
  };

  // Dynamic Unique Categories & Items List for Dropdowns
  const dynamicCatNames = Array.from(new Set([
    ...availableCategories.map(c => c.name),
    ...items.map(i => getCategoryName(i))
  ].filter(Boolean))).sort();
  const categoriesList = ['All', ...dynamicCatNames];

  const uniqueItemNames = Array.from(new Set(items.map(i => i.name).filter(Boolean))).sort();

  // Metrics
  const totalItemsCount = items.length;
  const lowStockCount = items.filter(i => {
    const min = Number(i.minAlertLevel !== undefined ? i.minAlertLevel : i.minStockLevel) || 0;
    const cur = Number(i.currentStock) || 0;
    return cur <= min;
  }).length;
  const inStockCount = items.filter(i => {
    const min = Number(i.minAlertLevel !== undefined ? i.minAlertLevel : i.minStockLevel) || 0;
    const cur = Number(i.currentStock) || 0;
    return cur > min;
  }).length;
  const totalValuation = items.reduce((sum, item) => sum + ((Number(item.currentStock) || 0) * (Number(item.costPerUnit) || 0)), 0);
  const categoriesCount = new Set(items.map(i => getCategoryName(i))).size;

  // Logs filtered by selected branch
  const logs = liveLogs.length > 0
    ? liveLogs
    : (selectedBranchId
      ? rawLogs.filter(log => {
        const matchItem = items.find(i => (i._id === log.itemId || i.id === log.itemId));
        return !matchItem || matchItem.branchId === selectedBranchId || matchItem.branchId === 'ALL';
      })
      : rawLogs);

  // Filter items
  const filteredInventory = items.filter(item => {
    const catName = getCategoryName(item);
    const minLevel = Number(item.minAlertLevel !== undefined ? item.minAlertLevel : item.minStockLevel) || 0;
    const curStock = Number(item.currentStock) || 0;

    const matchesSearch = (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.sku || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.supplierName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      catName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesItemName = itemNameFilter === 'All' || item.name === itemNameFilter;
    const matchesCategory = categoryFilter === 'All' || catName === categoryFilter;

    let matchesStatus = true;
    if (statusFilter === 'Low Stock') {
      matchesStatus = curStock <= minLevel && curStock > 0;
    } else if (statusFilter === 'Out of Stock') {
      matchesStatus = curStock <= 0;
    } else if (statusFilter === 'In Stock') {
      matchesStatus = curStock > minLevel;
    }

    return matchesSearch && matchesItemName && matchesCategory && matchesStatus;
  });

  const handleOpenAddModal = () => {
    setEditingItem(null);
    const defaultCat = availableCategories[0];
    const defaultBranch = selectedBranchId && selectedBranchId !== 'ALL'
      ? selectedBranchId
      : (availableBranches[0]?._id || availableBranches[0]?.id || 'BR-001');

    setFormState({
      id: '',
      name: '',
      sku: `ING-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      categoryId: defaultCat?._id || defaultCat?.id || '',
      category: defaultCat?.name || 'General',
      branchId: defaultBranch,
      currentStock: '',
      minAlertLevel: '',
      unit: 'kg',
      costPerUnit: '',
      supplierName: '',
      supplierPhone: '',
      status: 'AVAILABLE'
    });
    setFormErrors({});
    setIsAddEditModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    const itemCatId = (item.categoryId && typeof item.categoryId === 'object')
      ? item.categoryId._id
      : (item.categoryId || '');
    const itemCatName = getCategoryName(item);

    setFormState({
      id: item._id || item.id,
      name: item.name || '',
      sku: item.sku || '',
      categoryId: itemCatId,
      category: itemCatName,
      branchId: item.branchId || (selectedBranchId && selectedBranchId !== 'ALL' ? selectedBranchId : (availableBranches[0]?._id || 'BR-001')),
      currentStock: item.currentStock !== undefined ? item.currentStock : '',
      minAlertLevel: (item.minAlertLevel !== undefined ? item.minAlertLevel : item.minStockLevel) !== undefined ? (item.minAlertLevel !== undefined ? item.minAlertLevel : item.minStockLevel) : '',
      unit: item.unit || 'kg',
      costPerUnit: item.costPerUnit !== undefined ? item.costPerUnit : '',
      supplierName: item.supplierName || '',
      supplierPhone: item.supplierPhone || '',
      status: item.status || 'AVAILABLE'
    });
    setFormErrors({});
    setIsAddEditModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formState.name.trim()) errors.name = 'Item Name is required.';
    if (!formState.sku.trim()) errors.sku = 'SKU code is required.';
    if (formState.currentStock === '' || isNaN(Number(formState.currentStock)) || Number(formState.currentStock) < 0) {
      errors.currentStock = 'Please enter a valid stock quantity (0 or more).';
    }
    if (formState.minAlertLevel === '' || isNaN(Number(formState.minAlertLevel)) || Number(formState.minAlertLevel) < 0) {
      errors.minAlertLevel = 'Please enter a valid min alert threshold (0 or more).';
    }
    if (formState.costPerUnit === '' || isNaN(Number(formState.costPerUnit)) || Number(formState.costPerUnit) < 0) {
      errors.costPerUnit = 'Please enter a valid unit cost (0 or more).';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    let resolvedCatId = formState.categoryId;
    if (!resolvedCatId) {
      const match = availableCategories.find(c => c.name === formState.category);
      resolvedCatId = match?._id || match?.id || undefined;
    }

    const payload = {
      name: formState.name.trim(),
      sku: formState.sku.trim(),
      categoryId: resolvedCatId || undefined,
      currentStock: Number(formState.currentStock),
      minAlertLevel: Number(formState.minAlertLevel),
      unit: formState.unit,
      costPerUnit: Number(formState.costPerUnit),
      supplierName: formState.supplierName.trim(),
      supplierPhone: formState.supplierPhone.trim(),
      status: formState.status || 'AVAILABLE',
      branchId: formState.branchId || (selectedBranchId && selectedBranchId !== 'ALL' ? selectedBranchId : undefined)
    };

    try {
      if (editingItem) {
        const itemId = editingItem._id || editingItem.id;
        const res = await InventoryApi.updateItem(itemId, payload);
        if (res?.status) {
          await fetchItems();
          if (updateInventoryItem && activeRestaurant?.id) {
            updateInventoryItem(activeRestaurant.id, itemId, {
              ...payload,
              category: formState.category,
              minStockLevel: payload.minAlertLevel
            });
          }
          setIsAddEditModalOpen(false);
        }
      } else {
        const res = await InventoryApi.createItem(payload);
        if (res?.status) {
          await fetchItems();
          if (addInventoryItem && activeRestaurant?.id) {
            addInventoryItem(activeRestaurant.id, {
              ...(res.response?.data || payload),
              category: formState.category,
              minStockLevel: payload.minAlertLevel
            });
          }
          setIsAddEditModalOpen(false);
        }
      }
    } catch (err) {
      console.error("Save inventory item error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenAdjustModal = (item, defaultType = 'Stock In') => {
    setAdjustTargetItem(item);
    setAdjustState({
      type: defaultType,
      quantity: '',
      reason: defaultType === 'Stock In' ? 'Supplier Purchase' : 'Kitchen Issue',
      notes: ''
    });
    setAdjustErrors({});
    setIsAdjustModalOpen(true);
  };

  const handleSaveAdjustment = async (e) => {
    e.preventDefault();
    const qty = Number(adjustState.quantity);
    if (!adjustState.quantity || isNaN(qty) || qty <= 0) {
      setAdjustErrors({ quantity: 'Please enter a valid quantity greater than 0.' });
      return;
    }

    const currentStock = Number(adjustTargetItem.currentStock) || 0;
    if (adjustState.type === 'Stock Out' && qty > currentStock) {
      setAdjustErrors({ quantity: `Cannot issue more than current available stock (${currentStock} ${adjustTargetItem.unit}).` });
      return;
    }

    const newStock = adjustState.type === 'Stock In'
      ? currentStock + qty
      : Math.max(0, currentStock - qty);

    try {
      const itemId = adjustTargetItem._id || adjustTargetItem.id;
      const res = await InventoryApi.updateItem(itemId, {
        currentStock: newStock
      });
      if (res?.status) {
        if (adjustStock && activeRestaurant?.id) {
          adjustStock(
            activeRestaurant.id,
            itemId,
            adjustState.type,
            qty,
            adjustState.reason,
            adjustState.notes
          );
        }
        await fetchItems();
        ShowNotifications.showAlertNotification(
          `${adjustState.type} of ${qty} ${adjustTargetItem.unit} recorded! New stock: ${newStock} ${adjustTargetItem.unit}`,
          true
        );
        setIsAdjustModalOpen(false);
      }
    } catch (err) {
      console.error("Adjust stock error:", err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    const itemId = itemToDelete._id || itemToDelete.id;
    try {
      const res = await InventoryApi.deleteItem(itemId);
      if (res?.status) {
        await fetchItems();
        if (deleteInventoryItem && activeRestaurant?.id) {
          deleteInventoryItem(activeRestaurant.id, itemId);
        }
      }
    } catch (err) {
      console.error("Delete item error:", err);
    } finally {
      setItemToDelete(null);
    }
  };

  return (
    <section className="panel-view active" style={{ padding: '0 0 32px 0', width: '100%' }}>
      {/* 1. TOP HEADER ACTION ROW */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0, fontFamily: "'Outfit', sans-serif" }}>
                Inventory Management
              </h2>
              <span style={{
                background: 'linear-gradient(135deg, #ff5a1f 0%, #ea580c 100%)',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 800,
                padding: '3px 8px',
                borderRadius: '6px',
                letterSpacing: '0.5px'
              }}>
                LIVE API
              </span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
              Real-time stock tracking, valuation, minimum threshold alerts, and supplier records
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            onClick={() => navigate('/inventory/categories')}
            style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#0f172a',
              fontWeight: 700,
              padding: '10px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}
          >
            <LayersIcon size={16} color="#64748b" />
            Manage Categories ({availableCategories.length})
          </button>

          <button
            type="button"
            onClick={() => setIsLogsModalOpen(true)}
            style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#0f172a',
              fontWeight: 700,
              padding: '10px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}
          >
            <HistoryIcon size={16} color="#64748b" />
            Stock Logs ({logs.length})
          </button>

          <button
            type="button"
            onClick={fetchItems}
            disabled={isLoading}
            title="Refresh inventory items"
            style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#475569',
              fontWeight: 700,
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RefreshIcon size={14} color={isLoading ? '#94a3b8' : '#475569'} />
            Refresh
          </button>

          <button
            type="button"
            onClick={handleOpenAddModal}
            style={{
              background: '#ff5a1f',
              border: 'none',
              color: '#ffffff',
              fontWeight: 700,
              padding: '10px 20px',
              borderRadius: '8px',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 8px rgba(255, 90, 31, 0.25)'
            }}
          >
            <PlusIcon size={16} color="#ffffff" />
            Add Stock Item
          </button>
        </div>
      </div>

      {/* 2. STATS & METRICS GRID */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {/* Card 1: Total Items */}
        <div style={{
          background: '#ffffff',
          borderRadius: '14px',
          padding: '20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BoxIcon size={24} color="#2563eb" />
          </div>
          <div>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total Stock Items
            </span>
            <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: '4px 0 0 0' }}>
              {totalItemsCount}
            </h3>
          </div>
        </div>

        {/* Card 2: Low Stock Alert */}
        <div style={{
          background: '#ffffff',
          borderRadius: '14px',
          padding: '20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangleIcon size={24} color="#ea580c" />
          </div>
          <div>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Low Stock Alerts
            </span>
            <h3 style={{ fontSize: '24px', fontWeight: 800, color: lowStockCount > 0 ? '#dc2626' : '#0f172a', margin: '4px 0 0 0' }}>
              {lowStockCount}
            </h3>
          </div>
        </div>

        {/* Card 3: Stock Valuation */}
        <div style={{
          background: '#ffffff',
          borderRadius: '14px',
          padding: '20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUpIcon size={24} color="#059669" />
          </div>
          <div>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total Stock Valuation
            </span>
            <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: '4px 0 0 0' }}>
              ₹{totalValuation.toLocaleString('en-IN')}
            </h3>
          </div>
        </div>

        {/* Card 4: Categories */}
        <div style={{
          background: '#ffffff',
          borderRadius: '14px',
          padding: '20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#faf5ff', color: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LayersIcon size={24} color="#9333ea" />
          </div>
          <div>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Active Categories
            </span>
            <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: '4px 0 0 0' }}>
              {categoriesCount}
            </h3>
          </div>
        </div>
      </div>

      {/* 3. SEARCH & DROPDOWN FILTERS BAR */}
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        padding: '14px 18px',
        marginBottom: '18px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        {/* Left Side: Search + Dropdowns */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', flex: 1 }}>
          {/* Search Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            padding: '8px 12px',
            minWidth: '220px',
            boxSizing: 'border-box'
          }}>
            <SearchIcon size={15} color="#64748b" />
            <input
              type="text"
              placeholder="Search items, SKU, suppliers..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
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
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '12px', padding: 0 }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Dropdown Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>
              Category:
            </label>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: categoryFilter !== 'All' ? '1.5px solid #ff5a1f' : '1px solid #cbd5e1',
                background: categoryFilter !== 'All' ? '#fff7ed' : '#f8fafc',
                fontSize: '13px',
                fontWeight: 600,
                color: categoryFilter !== 'All' ? '#c2410c' : '#0f172a',
                outline: 'none',
                cursor: 'pointer',
                minWidth: '150px'
              }}
            >
              {categoriesList.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? `All Categories (${categoriesList.length - 1})` : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Item Name Dropdown Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>
              Item Name:
            </label>
            <select
              value={itemNameFilter}
              onChange={e => setItemNameFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: itemNameFilter !== 'All' ? '1.5px solid #ff5a1f' : '1px solid #cbd5e1',
                background: itemNameFilter !== 'All' ? '#fff7ed' : '#f8fafc',
                fontSize: '13px',
                fontWeight: 600,
                color: itemNameFilter !== 'All' ? '#c2410c' : '#0f172a',
                outline: 'none',
                cursor: 'pointer',
                minWidth: '160px',
                maxWidth: '220px'
              }}
            >
              <option value="All">All Item Names ({items.length})</option>
              {uniqueItemNames.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          {/* Reset Filters button if any filter is applied */}
          {(itemNameFilter !== 'All' || categoryFilter !== 'All' || searchTerm || statusFilter !== 'All') && (
            <button
              type="button"
              onClick={() => {
                setItemNameFilter('All');
                setCategoryFilter('All');
                setSearchTerm('');
                setStatusFilter('All');
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ff5a1f',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                padding: '6px 8px',
                textDecoration: 'underline'
              }}
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Right Side: Status Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { id: 'All', label: `All Items (${totalItemsCount})` },
            { id: 'Low Stock', label: `Low Stock (${lowStockCount})` },
            { id: 'In Stock', label: `In Stock (${inStockCount})` }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              style={{
                padding: '6px 14px',
                borderRadius: '7px',
                border: 'none',
                background: statusFilter === tab.id ? '#0f172a' : '#f1f5f9',
                color: statusFilter === tab.id ? '#ffffff' : '#475569',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. CATEGORY HORIZONTAL FILTER PILLS */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '12px',
        marginBottom: '16px'
      }}>
        {categoriesList.map(cat => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategoryFilter(cat)}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: categoryFilter === cat ? '1px solid #ff5a1f' : '1px solid #e2e8f0',
              background: categoryFilter === cat ? '#fff7ed' : '#ffffff',
              color: categoryFilter === cat ? '#ff5a1f' : '#64748b',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 5. INVENTORY TABLE & LIST */}
      <div style={{
        background: '#ffffff',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
        overflow: 'hidden'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#0f172a', color: '#ffffff', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '14px 18px', fontWeight: 800 }}>ITEM DETAILS</th>
                <th style={{ padding: '14px 16px', fontWeight: 800 }}>CATEGORY & BRANCH</th>
                <th style={{ padding: '14px 16px', fontWeight: 800 }}>STOCK LEVEL</th>
                <th style={{ padding: '14px 16px', fontWeight: 800 }}>STATUS</th>
                <th style={{ padding: '14px 16px', fontWeight: 800 }}>UNIT COST / VALUE</th>
                <th style={{ padding: '14px 16px', fontWeight: 800 }}>SUPPLIER</th>
                <th style={{ padding: '14px 18px', fontWeight: 800, textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '48px 20px', color: '#64748b' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600 }}>Loading inventory items from server...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredInventory.length > 0 ? (
                filteredInventory.map((item, index) => {
                  const minLevel = Number(item.minAlertLevel !== undefined ? item.minAlertLevel : item.minStockLevel) || 0;
                  const curStock = Number(item.currentStock) || 0;
                  const isOut = curStock <= 0;
                  const isLow = curStock > 0 && curStock <= minLevel;
                  const statusBg = isOut ? '#fef2f2' : isLow ? '#fffbeb' : '#f0fdf4';
                  const statusText = isOut ? '#dc2626' : isLow ? '#d97706' : '#16a34a';
                  const statusLabel = isOut ? 'OUT OF STOCK' : isLow ? 'LOW STOCK' : 'IN STOCK';
                  const itemValue = curStock * (Number(item.costPerUnit) || 0);
                  const progressPct = Math.min(100, Math.round((curStock / ((minLevel || 1) * 2)) * 100));
                  const catName = getCategoryName(item);
                  const branchLabel = getBranchLabel(item.branchId);

                  return (
                    <tr
                      key={item._id || item.id || index}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background 0.15s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {/* 1. Item Name & SKU */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '14px' }}>
                            {item.name}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                            <span style={{ fontSize: '11px', fontFamily: 'monospace', background: '#f1f5f9', color: '#475569', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                              {item.sku}
                            </span>
                            <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                              ID: {(item._id || item.id || '').substring(0, 8)}...
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 2. Category & Branch */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <span style={{ fontWeight: 700, color: '#334155' }}>
                            {catName}
                          </span>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>
                            {branchLabel}
                          </span>
                        </div>
                      </td>

                      {/* 3. Stock Level & Progress */}
                      <td style={{ padding: '14px 16px', minWidth: '140px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 800, color: isOut ? '#dc2626' : '#0f172a', fontSize: '13px' }}>
                              {curStock} {item.unit}
                            </span>
                            <span style={{ fontSize: '11px', color: '#64748b' }}>
                              Min: {minLevel} {item.unit}
                            </span>
                          </div>
                          {/* Mini Progress Bar */}
                          <div style={{ width: '100%', height: '5px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{
                              width: `${progressPct}%`,
                              height: '100%',
                              background: isOut ? '#dc2626' : isLow ? '#f59e0b' : '#16a34a',
                              borderRadius: '3px'
                            }}></div>
                          </div>
                        </div>
                      </td>

                      {/* 4. Status Badge */}
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '11px',
                          fontWeight: 800,
                          backgroundColor: statusBg,
                          color: statusText
                        }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: statusText }}></span>
                          {statusLabel}
                        </span>
                      </td>

                      {/* 5. Cost & Valuation */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 800, color: '#0f172a' }}>
                            ₹{itemValue.toLocaleString('en-IN')}
                          </span>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>
                            ₹{item.costPerUnit} / {item.unit}
                          </span>
                        </div>
                      </td>

                      {/* 6. Supplier */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 600, color: '#0f172a' }}>
                            {item.supplierName || 'Direct Local Purchase'}
                          </span>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>
                            {item.supplierPhone || '—'}
                          </span>
                        </div>
                      </td>

                      {/* 7. Quick Actions */}
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                          {/* Stock In Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenAdjustModal(item, 'Stock In')}
                            style={{
                              background: '#ecfdf5',
                              border: '1px solid #a7f3d0',
                              color: '#059669',
                              fontWeight: 700,
                              fontSize: '11px',
                              padding: '5px 8px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            title="Quick Stock In (+)"
                          >
                            <ArrowDownLeftIcon size={12} color="#059669" />
                            In
                          </button>

                          {/* Stock Out Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenAdjustModal(item, 'Stock Out')}
                            style={{
                              background: '#fff7ed',
                              border: '1px solid #fed7aa',
                              color: '#ea580c',
                              fontWeight: 700,
                              fontSize: '11px',
                              padding: '5px 8px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            title="Quick Issue / Stock Out (-)"
                          >
                            <ArrowUpRightIcon size={12} color="#ea580c" />
                            Out
                          </button>

                          {/* Edit Item */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(item)}
                            style={{
                              background: '#f8fafc',
                              border: '1px solid #cbd5e1',
                              color: '#475569',
                              padding: '6px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            title="Edit Item"
                          >
                            <PencilIcon size={14} />
                          </button>

                          {/* Delete Item */}
                          <button
                            type="button"
                            onClick={() => setItemToDelete(item)}
                            style={{
                              background: '#fef2f2',
                              border: '1px solid #fecaca',
                              color: '#dc2626',
                              padding: '6px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            title="Delete Item"
                          >
                            <TrashIcon size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '48px 20px', color: '#64748b' }}>
                    <div style={{ maxWidth: '320px', margin: '0 auto' }}>
                      <BoxIcon size={32} color="#94a3b8" />
                      <p style={{ margin: '8px 0 0 0', fontWeight: 600, color: '#334155' }}>No inventory items found</p>
                      <p style={{ margin: '4px 0 16px 0', fontSize: '12px', color: '#94a3b8' }}>Try adjusting your search or category filter</p>
                      <button
                        type="button"
                        onClick={handleOpenAddModal}
                        style={{
                          background: '#ff5a1f',
                          border: 'none',
                          color: '#ffffff',
                          fontWeight: 700,
                          padding: '8px 16px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        Add First Stock Item
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. MODAL: ADD / EDIT INVENTORY ITEM */}
      <Modal
        isOpen={isAddEditModalOpen}
        onClose={() => !isSubmitting && setIsAddEditModalOpen(false)}
        title={editingItem ? 'Edit Stock Item' : 'Add New Stock Item'}
        maxWidth="600px"
      >
        <form onSubmit={handleSaveItem} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
          {/* Row 1: Name & SKU */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                Item Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                disabled={isSubmitting}
                value={formState.name}
                onChange={e => {
                  setFormState({ ...formState, name: e.target.value });
                  if (formErrors.name) setFormErrors({ ...formErrors, name: '' });
                }}
                placeholder="e.g. Fresh Paneer"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: formErrors.name ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              {formErrors.name && (
                <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                  {formErrors.name}
                </span>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                SKU / Item Code <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                disabled={isSubmitting}
                value={formState.sku}
                onChange={e => {
                  setFormState({ ...formState, sku: e.target.value });
                  if (formErrors.sku) setFormErrors({ ...formErrors, sku: '' });
                }}
                placeholder="e.g. ING-PNR-01"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: formErrors.sku ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              {formErrors.sku && (
                <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                  {formErrors.sku}
                </span>
              )}
            </div>
          </div>

          {/* Row 2: Category & Branch */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                Category
              </label>
              <select
                disabled={isSubmitting}
                value={formState.categoryId || ''}
                onChange={e => {
                  const selectedId = e.target.value;
                  const catObj = availableCategories.find(c => (c._id === selectedId || c.id === selectedId));
                  setFormState({
                    ...formState,
                    categoryId: selectedId,
                    category: catObj ? catObj.name : formState.category
                  });
                }}
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
              >
                {availableCategories.map(cat => (
                  <option key={cat._id || cat.id} value={cat._id || cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                Branch Assignment
              </label>
              <select
                disabled={isSubmitting}
                value={formState.branchId}
                onChange={e => setFormState({ ...formState, branchId: e.target.value })}
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
              >
                {availableBranches.map(b => (
                  <option key={b._id || b.id} value={b._id || b.id}>
                    {b.branchName || b.name} {b.branchCode ? `(${b.branchCode})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Current Stock, Min Alert Level & Unit */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                Current Stock <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="number"
                disabled={isSubmitting}
                step="0.1"
                min="0"
                value={formState.currentStock}
                onChange={e => {
                  setFormState({ ...formState, currentStock: e.target.value });
                  if (formErrors.currentStock) setFormErrors({ ...formErrors, currentStock: '' });
                }}
                placeholder="10"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: formErrors.currentStock ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              {formErrors.currentStock && (
                <span style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                  {formErrors.currentStock}
                </span>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                Min Alert Level <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="number"
                disabled={isSubmitting}
                step="0.1"
                min="0"
                value={formState.minAlertLevel}
                onChange={e => {
                  setFormState({ ...formState, minAlertLevel: e.target.value });
                  if (formErrors.minAlertLevel) setFormErrors({ ...formErrors, minAlertLevel: '' });
                }}
                placeholder="5"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: formErrors.minAlertLevel ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              {formErrors.minAlertLevel && (
                <span style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                  {formErrors.minAlertLevel}
                </span>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                Unit of Measure
              </label>
              <select
                disabled={isSubmitting}
                value={formState.unit}
                onChange={e => setFormState({ ...formState, unit: e.target.value })}
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
              >
                <option value="kg">kg (Kilogram)</option>
                <option value="g">g (Grams)</option>
                <option value="L">L (Liter)</option>
                <option value="ml">ml (Milliliter)</option>
                <option value="pcs">pcs (Pieces)</option>
                <option value="box">box (Boxes)</option>
                <option value="bag">bag (Bags / Sacks)</option>
                <option value="pack">pack (Packets)</option>
                <option value="can">can (Cans)</option>
                <option value="dozen">dozen (Dozens)</option>
                <option value="bundle">bundle (Bundles)</option>
              </select>
            </div>
          </div>

          {/* Row 4: Cost per Unit */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
              Cost per Unit (₹) <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="number"
              disabled={isSubmitting}
              step="0.01"
              min="0"
              value={formState.costPerUnit}
              onChange={e => {
                setFormState({ ...formState, costPerUnit: e.target.value });
                if (formErrors.costPerUnit) setFormErrors({ ...formErrors, costPerUnit: '' });
              }}
              placeholder="e.g. 320"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: formErrors.costPerUnit ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                fontSize: '13px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            {formErrors.costPerUnit && (
              <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                {formErrors.costPerUnit}
              </span>
            )}
          </div>

          {/* Row 5: Supplier Name & Contact */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                Supplier / Vendor Name
              </label>
              <input
                type="text"
                disabled={isSubmitting}
                value={formState.supplierName}
                onChange={e => setFormState({ ...formState, supplierName: e.target.value })}
                placeholder="e.g. Nandini Dairy Supplies"
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
                value={formState.supplierPhone}
                onChange={e => setFormState({ ...formState, supplierPhone: e.target.value })}
                placeholder="e.g. +91 98450 12345"
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

          {/* Footer Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
            <button
              type="button"
              disabled={isSubmitting}
              className="btn btn-outline"
              onClick={() => setIsAddEditModalOpen(false)}
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
                padding: '10px 22px',
                borderRadius: '8px',
                fontSize: '13px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 6px rgba(255, 90, 31, 0.25)'
              }}
            >
              {isSubmitting ? 'Saving...' : (editingItem ? 'Save Changes' : 'Add Item')}
            </button>
          </div>
        </form>
      </Modal>

      {/* 7. MODAL: QUICK STOCK IN / STOCK OUT ADJUSTMENT */}
      <Modal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        title={adjustState.type === 'Stock In' ? `Stock In (Receive Purchase): ${adjustTargetItem?.name}` : `Stock Out (Issue / Usage): ${adjustTargetItem?.name}`}
        maxWidth="460px"
      >
        <form onSubmit={handleSaveAdjustment} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
          {/* Current Stock Banner */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '12px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ fontSize: '13px', color: '#64748b' }}>Current Available Stock:</span>
            <span style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
              {adjustTargetItem?.currentStock} {adjustTargetItem?.unit}
            </span>
          </div>

          {/* Adjustment Type Switch */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
              Adjustment Type
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setAdjustState({ ...adjustState, type: 'Stock In', reason: 'Supplier Purchase' })}
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  border: adjustState.type === 'Stock In' ? '1.5px solid #10b981' : '1px solid #cbd5e1',
                  background: adjustState.type === 'Stock In' ? '#ecfdf5' : '#ffffff',
                  color: adjustState.type === 'Stock In' ? '#065f46' : '#475569',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                + Stock In (Add)
              </button>
              <button
                type="button"
                onClick={() => setAdjustState({ ...adjustState, type: 'Stock Out', reason: 'Kitchen Issue' })}
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  border: adjustState.type === 'Stock Out' ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                  background: adjustState.type === 'Stock Out' ? '#fef2f2' : '#ffffff',
                  color: adjustState.type === 'Stock Out' ? '#991b1b' : '#475569',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                - Stock Out (Deduct)
              </button>
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
              Quantity ({adjustTargetItem?.unit}) <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              value={adjustState.quantity}
              onChange={e => {
                setAdjustState({ ...adjustState, quantity: e.target.value });
                if (adjustErrors.quantity) setAdjustErrors({ ...adjustErrors, quantity: '' });
              }}
              placeholder={`e.g. 5 ${adjustTargetItem?.unit || ''}`}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: adjustErrors.quantity ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            {adjustErrors.quantity && (
              <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                {adjustErrors.quantity}
              </span>
            )}
          </div>

          {/* Reason */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
              Reason / Movement Purpose
            </label>
            <select
              value={adjustState.reason}
              onChange={e => setAdjustState({ ...adjustState, reason: e.target.value })}
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
            >
              {adjustState.type === 'Stock In' ? (
                <>
                  <option value="Supplier Purchase">Supplier Purchase / Inbound Shipment</option>
                  <option value="Branch Transfer In">Branch Transfer In</option>
                  <option value="Inventory Audit Adjustment">Inventory Audit Count Correction (+)</option>
                  <option value="Returned Items">Customer / Kitchen Return</option>
                </>
              ) : (
                <>
                  <option value="Kitchen Issue">Kitchen Production / Daily Usage</option>
                  <option value="Wastage / Spoilage">Spoilage / Expired / Damaged</option>
                  <option value="Branch Transfer Out">Branch Transfer Out</option>
                  <option value="Inventory Audit Adjustment">Inventory Audit Count Correction (-)</option>
                </>
              )}
            </select>
          </div>

          {/* Notes / Invoice Ref */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
              Reference / Invoice / Notes
            </label>
            <input
              type="text"
              value={adjustState.notes}
              onChange={e => setAdjustState({ ...adjustState, notes: e.target.value })}
              placeholder="e.g. Invoice #NDS-9912 or Chef Suresh issue"
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

          {/* Footer Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setIsAdjustModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                background: adjustState.type === 'Stock In' ? '#10b981' : '#ef4444',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                padding: '10px 20px',
                borderRadius: '8px',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              Confirm {adjustState.type}
            </button>
          </div>
        </form>
      </Modal>

      {/* 8. MODAL: STOCK MOVEMENT & AUDIT LOGS */}
      <Modal
        isOpen={isLogsModalOpen}
        onClose={() => setIsLogsModalOpen(false)}
        title="Inventory Stock Movement & Audit Logs"
        maxWidth="750px"
      >
        <div style={{ maxHeight: '450px', overflowY: 'auto', marginTop: '12px' }}>
          {logs.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', color: '#475569' }}>
                  <th style={{ padding: '10px 12px', fontWeight: 800 }}>DATE / TIME</th>
                  <th style={{ padding: '10px 12px', fontWeight: 800 }}>ITEM NAME</th>
                  <th style={{ padding: '10px 12px', fontWeight: 800 }}>TYPE</th>
                  <th style={{ padding: '10px 12px', fontWeight: 800 }}>QUANTITY</th>
                  <th style={{ padding: '10px 12px', fontWeight: 800 }}>REASON & NOTES</th>
                  <th style={{ padding: '10px 12px', fontWeight: 800 }}>LOGGED BY</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, idx) => {
                  const isIn = log.type === 'Stock In';
                  return (
                    <tr key={log.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 12px', color: '#64748b', whiteSpace: 'nowrap' }}>
                        {log.date}
                      </td>
                      <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0f172a' }}>
                        {log.itemName}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 800,
                          background: isIn ? '#ecfdf5' : '#fef2f2',
                          color: isIn ? '#059669' : '#dc2626'
                        }}>
                          {log.type}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', fontWeight: 800, color: '#0f172a' }}>
                        {isIn ? `+${log.quantity}` : `-${log.quantity}`} {log.unit}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ fontWeight: 600, color: '#334155' }}>{log.reason}</span>
                        {log.notes && <span style={{ color: '#94a3b8', display: 'block', fontSize: '11px' }}>{log.notes}</span>}
                      </td>
                      <td style={{ padding: '10px 12px', color: '#64748b' }}>
                        {log.user || 'Admin'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
              No stock movement logs recorded yet.
            </div>
          )}
        </div>
      </Modal>

      {/* 9. MODAL: DELETE CONFIRMATION */}
      <Modal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        title="Confirm Delete Item"
        maxWidth="400px"
      >
        <div style={{ padding: '12px 0' }}>
          <p style={{ margin: 0, color: '#334155', fontSize: '14px', lineHeight: 1.5 }}>
            Are you sure you want to delete <strong>{itemToDelete?.name}</strong> ({itemToDelete?.sku})?
          </p>
          <p style={{ margin: '8px 0 0 0', color: '#ef4444', fontSize: '12px', fontWeight: 600 }}>
            This item will be permanently removed from your stock ledger.
          </p>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setItemToDelete(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteConfirm}
              style={{
                background: '#dc2626',
                border: 'none',
                color: '#ffffff',
                fontWeight: 700,
                padding: '10px 20px',
                borderRadius: '8px',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              Delete Item
            </button>
          </div>
        </div>
      </Modal>
    </section>
  );
}
