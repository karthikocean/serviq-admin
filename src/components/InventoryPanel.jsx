import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState, DEFAULT_INVENTORY_CATEGORIES } from '../config/AppContext';
import InventoryApi from '../api/Inventory';
import InventoryCategoryApi from '../api/InventoryCategory';
import BranchApi from '../api/Branch';
import { Modal } from './Modal';
import ShowNotifications from '../helper/ShowNotifications';
import SearchableSelect from './SearchableSelect.jsx';
import { formatDateTimeDMY } from '../helper/DateHelper.js';

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

const ChevronDownIcon = ({ size = 12, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <polyline points="6 9 12 15 18 9"></polyline>
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

const EyeIcon = ({ size = 15, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
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
    currentUser,
    activeRestaurant,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    adjustStock,
    selectedBranchId
  } = useAppState();

  const roleStr = typeof currentUser?.role === 'object' && currentUser?.role !== null
    ? (currentUser?.role?.roleName || currentUser?.role?.name || '')
    : (typeof currentUser?.role === 'string' ? currentUser.role : '');
  const userTypeStr = typeof currentUser?.userType === 'string' ? currentUser.userType : '';

  const userType = (userTypeStr || roleStr || '').toUpperCase();
  const userRoleLower = (roleStr || '').toLowerCase();
  const isRestaurantOwner =
    userTypeStr === 'RESTAURANT_OWNER' ||
    roleStr === 'RESTAURANT_OWNER' ||
    userType === 'RESTAURANT_OWNER' ||
    userType === 'ADMIN' ||
    userType === 'SUPER ADMIN' ||
    userType === 'SUPER_ADMIN' ||
    userType === 'OWNER' ||
    userRoleLower === 'admin' ||
    userRoleLower === 'owner' ||
    userRoleLower === 'super admin' ||
    userRoleLower === 'restaurant_owner' ||
    userRoleLower === 'restaurant owner';

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

  // Modals and View state
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'form'
  const [viewingItem, setViewingItem] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustTargetItem, setAdjustTargetItem] = useState(null);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [logFilterItemName, setLogFilterItemName] = useState('All');
  const [logFilterType, setLogFilterType] = useState('All'); // 'All' | 'Stock In' | 'Stock Out'
  const [logSearchTerm, setLogSearchTerm] = useState('');

  // Custom Scrollable Dropdown states
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [catDropdownSearch, setCatDropdownSearch] = useState('');
  const catDropdownRef = useRef(null);

  const [isItemDropdownOpen, setIsItemDropdownOpen] = useState(false);
  const [itemDropdownSearch, setItemDropdownSearch] = useState('');
  const itemDropdownRef = useRef(null);

  // Close custom dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (catDropdownRef.current && !catDropdownRef.current.contains(event.target)) {
        setIsCategoryDropdownOpen(false);
      }
      if (itemDropdownRef.current && !itemDropdownRef.current.contains(event.target)) {
        setIsItemDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      const params = { limit: 1000 };
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
      const params = { limit: 1000 };
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
        if (activeRestaurant?.inventory) {
          setItems(activeRestaurant.inventory);
        }
      }
    } catch (err) {
      console.error("Failed to fetch inventory items:", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedBranchId]);

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
          date: p.purchaseDate ? formatDateTimeDMY(p.purchaseDate) : (p.createdAt ? formatDateTimeDMY(p.createdAt) : '—'),
          rawDate: p.purchaseDate || p.createdAt,
          itemId: typeof p.itemId === 'object' ? (p.itemId?._id || p.itemId?.id) : p.itemId,
          rawItemName: typeof p.itemId === 'object' ? (p.itemId?.name || p.itemId?.itemName) : p.itemName,
          type: 'Stock In',
          quantity: p.purchaseQty !== undefined ? p.purchaseQty : p.quantity,
          unit: (typeof p.itemId === 'object' && p.itemId?.unit) ? p.itemId.unit : (p.unit || 'unit'),
          reason: `Supplier: ${p.supplierName || 'Purchase'}`,
          notes: p.invoiceNumber ? `Invoice: ${p.invoiceNumber}` : '',
          user: typeof p.addedBy === 'object' ? (p.addedBy?.name || 'Staff') : (p.addedBy || 'Admin')
        })),
        ...rList.map(r => ({
          id: r._id || r.id,
          date: r.createdAt ? formatDateTimeDMY(r.createdAt) : (r.date ? formatDateTimeDMY(r.date) : '—'),
          rawDate: r.createdAt || r.date,
          itemId: typeof r.itemId === 'object' ? (r.itemId?._id || r.itemId?.id) : r.itemId,
          rawItemName: typeof r.itemId === 'object' ? (r.itemId?.name || r.itemId?.itemName) : r.itemName,
          type: 'Stock Out',
          quantity: r.quantityToReduce !== undefined ? r.quantityToReduce : r.quantity,
          unit: (typeof r.itemId === 'object' && r.itemId?.unit) ? r.itemId.unit : (r.unit || 'unit'),
          reason: r.reason || 'Kitchen Usage',
          notes: r.details || r.notes || '',
          user: typeof r.reducedBy === 'object' ? (r.reducedBy?.name || 'Staff') : (r.reducedBy || 'Admin')
        }))
      ].sort((a, b) => new Date(b.rawDate || 0) - new Date(a.rawDate || 0));

      setLiveLogs(combined);
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
  }, [selectedBranchId, fetchCategories, fetchBranches, fetchStats, fetchItems, fetchLogs]);

  // Unified available branches list - if filtered by header, show only that branch
  const allBranchesList = liveBranches.length > 0 ? liveBranches : (activeRestaurant?.branches || []);
  const availableBranches = (selectedBranchId && selectedBranchId !== 'ALL')
    ? allBranchesList.filter(b => String(b._id || b.id) === String(selectedBranchId))
    : allBranchesList;
  const allRawCategories = liveCategories.length > 0 ? liveCategories : rawCategories;
  const availableCategories = allRawCategories.filter(c => c.status !== 'UNAVAILABLE' && c.status !== 'Inactive' && c.status !== 'Disabled' && c.status !== false);

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
    const targetId = itemId || (isMongoId(rawName) ? rawName : null);
    if (targetId) {
      const matched = items.find(i => (
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
    return 'Item';
  };

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

  const uniqueItemNames = Array.from(new Set(
    items.map(i => getItemDisplayName(i.name || i.itemName, i._id || i.id)).filter(name => name && !isMongoId(name))
  )).sort();

  // Metrics
  const totalItemsCount = items.length;
  const outOfStockCount = items.filter(i => {
    const cur = Number(i.currentStock) || 0;
    return cur <= 0;
  }).length;
  const lowStockCount = items.filter(i => {
    const min = Number(i.minAlertLevel !== undefined ? i.minAlertLevel : i.minStockLevel) || 0;
    const cur = Number(i.currentStock) || 0;
    return cur > 0 && cur <= min;
  }).length;
  const inStockCount = items.filter(i => {
    const min = Number(i.minAlertLevel !== undefined ? i.minAlertLevel : i.minStockLevel) || 0;
    const cur = Number(i.currentStock) || 0;
    return cur > min;
  }).length;
  const totalValuation = items.reduce((sum, item) => sum + ((Number(item.currentStock) || 0) * (Number(item.costPerUnit) || 0)), 0);
  const categoriesCount = new Set(items.map(i => getCategoryName(i))).size;

  // Logs filtered by selected branch with clean resolved item names
  const baseLogs = liveLogs.length > 0
    ? liveLogs
    : (selectedBranchId
      ? rawLogs.filter(log => {
        const matchItem = items.find(i => (i._id === log.itemId || i.id === log.itemId));
        return !matchItem || matchItem.branchId === selectedBranchId || matchItem.branchId === 'ALL';
      })
      : rawLogs);

  const logs = baseLogs.map(log => ({
    ...log,
    itemName: getItemDisplayName(log.rawItemName || log.itemName, log.itemId)
  }));

  // Filter items
  const filteredInventory = items.filter(item => {
    const itemName = getItemDisplayName(item.name || item.itemName, item._id || item.id);
    const catName = getCategoryName(item);
    const minLevel = Number(item.minAlertLevel !== undefined ? item.minAlertLevel : item.minStockLevel) || 0;
    const curStock = Number(item.currentStock) || 0;

    const matchesSearch = (itemName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.sku || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.supplierName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      catName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesItemName = itemNameFilter === 'All' || itemName === itemNameFilter;
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

  // Pagination for inventory items
  const [page, setPage] = useState(1);
  const limit = 10;
  const totalPages = Math.ceil(filteredInventory.length / limit) || 1;
  const paginatedInventory = filteredInventory.slice((page - 1) * limit, page * limit);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  useEffect(() => {
    setPage(1);
  }, [searchTerm, itemNameFilter, categoryFilter, statusFilter]);

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
    setViewMode('form');
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
    setViewMode('form');
  };

  const validateForm = () => {
    const errors = {};
    if (!formState.name.trim()) errors.name = 'Item Name is required.';
    if (!formState.sku.trim()) errors.sku = 'SKU code is required.';
    if (isRestaurantOwner && !formState.branchId) {
      errors.branchId = 'Branch selection is required.';
    }
    if (formState.currentStock === '' || isNaN(Number(formState.currentStock)) || Number(formState.currentStock) < 0) {
      errors.currentStock = 'Please enter a valid stock quantity (0 or more).';
    }
    if (formState.minAlertLevel === '' || isNaN(Number(formState.minAlertLevel)) || Number(formState.minAlertLevel) < 0) {
      errors.minAlertLevel = 'Please enter a valid min alert threshold (0 or more).';
    }
    if (formState.costPerUnit === '' || isNaN(Number(formState.costPerUnit)) || Number(formState.costPerUnit) < 0) {
      errors.costPerUnit = 'Please enter a valid cost per unit (0 or more).';
    }
    return errors;
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);

    const resolvedCatId = formState.categoryId || availableCategories[0]?._id || availableCategories[0]?.id;

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
          setViewMode('list');
          ShowNotifications.showAlertNotification('Inventory item updated successfully!', true);
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
          setViewMode('list');
          ShowNotifications.showAlertNotification('New inventory item added successfully!', true);
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

  const handleOpenItemLogs = (item) => {
    setLogFilterItemName(item.name);
    setLogFilterType('All');
    setLogSearchTerm('');
    setIsLogsModalOpen(true);
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
      const rawBranch = adjustTargetItem?.branchId || (selectedBranchId && selectedBranchId !== 'ALL' ? selectedBranchId : undefined);
      const cleanBranchId = typeof rawBranch === 'object' ? (rawBranch?._id || rawBranch?.id) : rawBranch;

      if (adjustState.type === 'Stock In') {
        const payload = {
          itemId: itemId,
          supplierName: adjustTargetItem.supplierName || 'Direct Purchase',
          supplierPhone: adjustTargetItem.supplierPhone || '',
          purchaseQty: qty,
          unitPrice: Number(adjustTargetItem.costPerUnit) || 0,
          totalAmount: qty * (Number(adjustTargetItem.costPerUnit) || 0),
          invoiceNumber: adjustState.notes ? adjustState.notes : `STOCK-IN-${Date.now().toString().slice(-4)}`,
          purchaseDate: new Date().toISOString(),
          branchId: cleanBranchId
        };
        await InventoryApi.recordPurchase(payload);
      } else {
        // Stock Out
        const payload = {
          itemId: itemId,
          quantity: qty,
          quantityToReduce: qty,
          reductionQuantity: qty,
          reason: adjustState.reason || 'Kitchen Usage',
          details: adjustState.notes || '',
          notes: adjustState.notes || '',
          value: qty * (Number(adjustTargetItem.costPerUnit) || 0),
          branchId: cleanBranchId
        };
        await InventoryApi.reduceStock(payload);
      }

      await InventoryApi.updateItem(itemId, {
        currentStock: newStock
      });

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

      await Promise.all([fetchItems(), fetchLogs(), fetchStats()]);
      ShowNotifications.showAlertNotification(
        `${adjustState.type} of ${qty} ${adjustTargetItem.unit} recorded! New stock: ${newStock} ${adjustTargetItem.unit}`,
        true
      );
      setIsAdjustModalOpen(false);
    } catch (err) {
      console.error("Adjust stock error:", err);
      ShowNotifications.showAlertNotification('Failed to record stock adjustment', false);
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

  if (viewMode === 'form') {
    return (
      <section className="panel-view active" style={{ padding: '0 24px 24px 24px', width: '100%' }}>
        {/* Header with Back button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', paddingTop: '8px' }}>
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
            <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>
              {editingItem ? 'Edit Stock Item' : 'Add New Stock Item'}
            </h2>
            
          </div>
        </div>

        {/* Card Form */}
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '32px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', width: '100%', boxSizing: 'border-box' }}>
          <form onSubmit={handleSaveItem} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Row 1: Name & SKU */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
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
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: formErrors.name ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                    fontSize: '14px',
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
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: formErrors.sku ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                    fontSize: '14px',
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

            {/* Row 2: Category & Branch Assignment */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  Category
                </label>
                <SearchableSelect
                  isDisabled={isSubmitting}
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
                  options={availableCategories.map(cat => ({
                    value: cat._id || cat.id,
                    label: cat.name
                  }))}
                  placeholder="Select Category..."
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  Branch Assignment <span style={{ color: '#ef4444' }}>*</span>
                </label>
                {(() => {
                  const branchesArr = (allBranchesList && allBranchesList.length > 0) ? allBranchesList : (availableBranches || []);
                  const isLocked = !isRestaurantOwner || (selectedBranchId && selectedBranchId !== 'ALL');
                  const headerBranchObj = (selectedBranchId && selectedBranchId !== 'ALL')
                    ? branchesArr.find(b => String(b._id || b.id) === String(selectedBranchId) || String(b.branchCode) === String(selectedBranchId))
                    : null;
                  const currentBranchObj = headerBranchObj 
                    || branchesArr.find(b => String(b._id || b.id) === String(formState.branchId))
                    || branchesArr.find(b => String(b.branchCode) === String(formState.branchId))
                    || (branchesArr.length > 0 ? branchesArr[0] : null);
                  const effectiveVal = currentBranchObj ? (currentBranchObj._id || currentBranchObj.id) : (formState.branchId || '');

                  return (
                    <div>
                      <SearchableSelect
                        isDisabled={isSubmitting || isLocked}
                        value={effectiveVal}
                        onChange={e => {
                          setFormState({ ...formState, branchId: e.target.value });
                          if (formErrors.branchId) setFormErrors({ ...formErrors, branchId: '' });
                        }}
                        options={branchesArr.length === 0 ? [
                          { value: '', label: 'Main Branch' }
                        ] : branchesArr.map(b => ({
                          value: b._id || b.id,
                          label: `${b.branchName || b.name || 'Branch'}${b.branchCode ? ` (${b.branchCode})` : ''}`
                        }))}
                        placeholder="Select Branch..."
                      />
                      {isLocked && (
                        <span style={{ color: '#64748b', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                          Branch is locked to currently selected branch.
                        </span>
                      )}
                      {formErrors.branchId && (
                        <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                          {formErrors.branchId}
                        </span>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Row 3: Current Stock, Min Alert Level & Unit */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
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
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: formErrors.currentStock ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                    fontSize: '14px',
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
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: formErrors.minAlertLevel ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                    fontSize: '14px',
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
                <SearchableSelect
                  isDisabled={isSubmitting}
                  value={formState.unit}
                  onChange={e => setFormState({ ...formState, unit: e.target.value })}
                  options={[
                    { value: 'kg', label: 'kg (Kilogram)' },
                    { value: 'g', label: 'g (Grams)' },
                    { value: 'L', label: 'L (Liter)' },
                    { value: 'ml', label: 'ml (Milliliter)' },
                    { value: 'pcs', label: 'pcs (Pieces)' },
                    { value: 'box', label: 'box (Boxes)' },
                    { value: 'bag', label: 'bag (Bags / Sacks)' },
                    { value: 'pack', label: 'pack (Packets)' },
                    { value: 'can', label: 'can (Cans)' },
                    { value: 'dozen', label: 'dozen (Dozens)' },
                    { value: 'bundle', label: 'bundle (Bundles)' }
                  ]}
                  placeholder="Select Unit..."
                />
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
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: formErrors.costPerUnit ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                  fontSize: '14px',
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
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
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
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
                  maxLength={10}
                  inputMode="numeric"
                  disabled={isSubmitting}
                  value={formState.supplierPhone}
                  onChange={e => {
                    const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                    setFormState({ ...formState, supplierPhone: val });
                  }}
                  placeholder="10 digit mobile number"
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
            </div>

            {/* Footer Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
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
                  boxShadow: '0 2px 6px rgba(255, 90, 31, 0.25)'
                }}
              >
                {isSubmitting ? 'Saving...' : (editingItem ? 'Save Changes' : 'Add Item')}
              </button>
            </div>
          </form>
        </div>
      </section>
    );
  }

  // 2. PAGE FORM: QUICK STOCK IN / STOCK OUT ADJUSTMENT
  if (isAdjustModalOpen) {
    return (
      <section className="panel-view active" style={{ padding: '0 24px 40px 24px', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', paddingTop: '8px' }}>
          <button
            type="button"
            onClick={() => setIsAdjustModalOpen(false)}
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
            <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>
              {adjustState.type === 'Stock In' ? `Stock In (Receive Purchase): ${adjustTargetItem?.name}` : `Stock Out (Issue / Usage): ${adjustTargetItem?.name}`}
            </h2>
            <span style={{ fontSize: '13px', color: '#64748b' }}>
              Record inbound restock or outbound kitchen deduction for inventory tracking
            </span>
          </div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '32px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', width: '100%', boxSizing: 'border-box' }}>
          <form onSubmit={handleSaveAdjustment} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Current Stock Banner */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '16px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 600 }}>Current Available Stock:</span>
              <span style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>
                {adjustTargetItem?.currentStock} {adjustTargetItem?.unit}
              </span>
            </div>

            {/* Adjustment Type Switch */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                Adjustment Type
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setAdjustState({ ...adjustState, type: 'Stock In', reason: 'Supplier Purchase' })}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    border: adjustState.type === 'Stock In' ? '2px solid #10b981' : '1px solid #cbd5e1',
                    background: adjustState.type === 'Stock In' ? '#ecfdf5' : '#ffffff',
                    color: adjustState.type === 'Stock In' ? '#065f46' : '#475569',
                    fontWeight: 800,
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  + Stock In (Add)
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustState({ ...adjustState, type: 'Stock Out', reason: 'Kitchen Issue' })}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    border: adjustState.type === 'Stock Out' ? '2px solid #ef4444' : '1px solid #cbd5e1',
                    background: adjustState.type === 'Stock Out' ? '#fef2f2' : '#ffffff',
                    color: adjustState.type === 'Stock Out' ? '#991b1b' : '#475569',
                    fontWeight: 800,
                    fontSize: '14px',
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
                  padding: '12px 16px',
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
              <SearchableSelect
                value={adjustState.reason}
                onChange={e => setAdjustState({ ...adjustState, reason: e.target.value })}
                options={adjustState.type === 'Stock In' ? [
                  { value: 'Supplier Purchase', label: 'Supplier Purchase / Inbound Shipment' },
                  { value: 'Branch Transfer In', label: 'Branch Transfer In' },
                  { value: 'Inventory Audit Adjustment', label: 'Inventory Audit Count Correction (+)' },
                  { value: 'Returned Items', label: 'Customer / Kitchen Return' }
                ] : [
                  { value: 'Kitchen Issue', label: 'Kitchen Production / Daily Usage' },
                  { value: 'Wastage / Spoilage', label: 'Spoilage / Expired / Damaged' },
                  { value: 'Branch Transfer Out', label: 'Branch Transfer Out' },
                  { value: 'Inventory Audit Adjustment', label: 'Inventory Audit Count Correction (-)' }
                ]}
                placeholder="Select Reason..."
              />
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
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Footer Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setIsAdjustModalOpen(false)}
                style={{ padding: '10px 24px' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  background: adjustState.type === 'Stock In' ? '#10b981' : '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 800,
                  padding: '10px 26px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  boxShadow: adjustState.type === 'Stock In' ? '0 2px 8px rgba(16, 185, 129, 0.3)' : '0 2px 8px rgba(239, 68, 68, 0.3)'
                }}
              >
                Confirm {adjustState.type}
              </button>
            </div>
          </form>
        </div>
      </section>
    );
  }

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
        padding: '12px 18px',
        marginBottom: '18px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Left Side: Search + Category + Item Name Dropdowns (Single Line) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'nowrap', flexShrink: 0 }}>
          {/* Search Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            padding: '7px 10px',
            width: '190px',
            boxSizing: 'border-box'
          }}>
            <SearchIcon size={14} color="#64748b" />
            <input
              type="text"
              placeholder="Search items, SKU..."
              value={searchTerm}
              onKeyDown={e => {
                if (e.key === ' ' && !e.currentTarget.value) {
                  e.preventDefault();
                }
              }}
              onChange={e => {
                const val = e.target.value.replace(/^\s+/, '');
                setSearchTerm(val);
              }}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: '12px',
                width: '100%',
                color: '#0f172a'
              }}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '11px', padding: 0 }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Custom Stylized Scrollable Category Dropdown Filter */}
          <div ref={catDropdownRef} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>
              Category:
            </label>
            <button
              type="button"
              onClick={() => {
                setIsCategoryDropdownOpen(prev => !prev);
                setIsItemDropdownOpen(false);
                setCatDropdownSearch('');
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                padding: '7px 12px',
                borderRadius: '8px',
                border: categoryFilter !== 'All' ? '1.5px solid #ff5a1f' : '1px solid #cbd5e1',
                background: categoryFilter !== 'All' ? '#fff7ed' : '#f8fafc',
                fontSize: '12px',
                fontWeight: 600,
                color: categoryFilter !== 'All' ? '#c2410c' : '#0f172a',
                cursor: 'pointer',
                minWidth: '150px',
                maxWidth: '200px',
                boxSizing: 'border-box',
                transition: 'all 0.15s ease'
              }}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {categoryFilter === 'All' ? `All Categories (${dynamicCatNames.length})` : categoryFilter}
              </span>
              <ChevronDownIcon size={12} color={categoryFilter !== 'All' ? '#c2410c' : '#64748b'} />
            </button>

            {/* Scrollable Category Dropdown Menu */}
            {isCategoryDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                left: '60px',
                minWidth: '220px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '10px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
                zIndex: 1000,
                padding: '8px',
                boxSizing: 'border-box'
              }}>
                {dynamicCatNames.length > 5 && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    padding: '5px 8px',
                    marginBottom: '6px'
                  }}>
                    <SearchIcon size={12} color="#94a3b8" />
                    <input
                      type="text"
                      placeholder="Search categories..."
                      value={catDropdownSearch}
                      onChange={e => setCatDropdownSearch(e.target.value)}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        outline: 'none',
                        fontSize: '11px',
                        width: '100%',
                        color: '#0f172a'
                      }}
                      autoFocus
                    />
                  </div>
                )}

                <div style={{
                  maxHeight: '200px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  scrollbarWidth: 'thin'
                }}>
                  <button
                    type="button"
                    onClick={() => {
                      setCategoryFilter('All');
                      setIsCategoryDropdownOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '7px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      background: categoryFilter === 'All' ? '#fff7ed' : 'transparent',
                      color: categoryFilter === 'All' ? '#ea580c' : '#334155',
                      fontSize: '12px',
                      fontWeight: categoryFilter === 'All' ? 700 : 500,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.1s'
                    }}
                    onMouseEnter={e => { if (categoryFilter !== 'All') e.currentTarget.style.background = '#f8fafc'; }}
                    onMouseLeave={e => { if (categoryFilter !== 'All') e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span>All Categories</span>
                    <span style={{ fontSize: '11px', color: '#94a3b8', background: '#f1f5f9', padding: '1px 6px', borderRadius: '10px' }}>
                      {items.length}
                    </span>
                  </button>

                  {dynamicCatNames
                    .filter(cat => !catDropdownSearch || cat.toLowerCase().includes(catDropdownSearch.toLowerCase().trim()))
                    .map(cat => {
                      const count = items.filter(i => getCategoryName(i) === cat).length;
                      const isSelected = categoryFilter === cat;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            setCategoryFilter(cat);
                            setIsCategoryDropdownOpen(false);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '7px 10px',
                            borderRadius: '6px',
                            border: 'none',
                            background: isSelected ? '#fff7ed' : 'transparent',
                            color: isSelected ? '#ea580c' : '#334155',
                            fontSize: '12px',
                            fontWeight: isSelected ? 700 : 500,
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'background 0.1s'
                          }}
                          onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#f8fafc'; }}
                          onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                        >
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>
                            {cat}
                          </span>
                          <span style={{ fontSize: '11px', color: isSelected ? '#ea580c' : '#94a3b8', background: isSelected ? '#fed7aa' : '#f1f5f9', padding: '1px 6px', borderRadius: '10px' }}>
                            {count}
                          </span>
                        </button>
                      );
                    })
                  }
                </div>
              </div>
            )}
          </div>

          {/* Custom Stylized Scrollable Item Name Dropdown Filter */}
          <div ref={itemDropdownRef} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>
              Item Name:
            </label>
            <button
              type="button"
              onClick={() => {
                setIsItemDropdownOpen(prev => !prev);
                setIsCategoryDropdownOpen(false);
                setItemDropdownSearch('');
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                padding: '7px 12px',
                borderRadius: '8px',
                border: itemNameFilter !== 'All' ? '1.5px solid #ff5a1f' : '1px solid #cbd5e1',
                background: itemNameFilter !== 'All' ? '#fff7ed' : '#f8fafc',
                fontSize: '12px',
                fontWeight: 600,
                color: itemNameFilter !== 'All' ? '#c2410c' : '#0f172a',
                cursor: 'pointer',
                minWidth: '150px',
                maxWidth: '200px',
                boxSizing: 'border-box',
                transition: 'all 0.15s ease'
              }}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {itemNameFilter === 'All' ? `All Item Names (${uniqueItemNames.length})` : itemNameFilter}
              </span>
              <ChevronDownIcon size={12} color={itemNameFilter !== 'All' ? '#c2410c' : '#64748b'} />
            </button>

            {/* Scrollable Item Name Dropdown Menu */}
            {isItemDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                left: '70px',
                minWidth: '220px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '10px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
                zIndex: 1000,
                padding: '8px',
                boxSizing: 'border-box'
              }}>
                {uniqueItemNames.length > 5 && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    padding: '5px 8px',
                    marginBottom: '6px'
                  }}>
                    <SearchIcon size={12} color="#94a3b8" />
                    <input
                      type="text"
                      placeholder="Search item names..."
                      value={itemDropdownSearch}
                      onChange={e => setItemDropdownSearch(e.target.value)}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        outline: 'none',
                        fontSize: '11px',
                        width: '100%',
                        color: '#0f172a'
                      }}
                      autoFocus
                    />
                  </div>
                )}

                <div style={{
                  maxHeight: '200px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  scrollbarWidth: 'thin'
                }}>
                  <button
                    type="button"
                    onClick={() => {
                      setItemNameFilter('All');
                      setIsItemDropdownOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '7px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      background: itemNameFilter === 'All' ? '#fff7ed' : 'transparent',
                      color: itemNameFilter === 'All' ? '#ea580c' : '#334155',
                      fontSize: '12px',
                      fontWeight: itemNameFilter === 'All' ? 700 : 500,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.1s'
                    }}
                    onMouseEnter={e => { if (itemNameFilter !== 'All') e.currentTarget.style.background = '#f8fafc'; }}
                    onMouseLeave={e => { if (itemNameFilter !== 'All') e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span>All Item Names</span>
                    <span style={{ fontSize: '11px', color: '#94a3b8', background: '#f1f5f9', padding: '1px 6px', borderRadius: '10px' }}>
                      {items.length}
                    </span>
                  </button>

                  {uniqueItemNames
                    .filter(name => !itemDropdownSearch || name.toLowerCase().includes(itemDropdownSearch.toLowerCase().trim()))
                    .map(name => {
                      const isSelected = itemNameFilter === name;
                      const matchItem = items.find(i => i.name === name);
                      return (
                        <button
                          key={name}
                          type="button"
                          onClick={() => {
                            setItemNameFilter(name);
                            setIsItemDropdownOpen(false);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '7px 10px',
                            borderRadius: '6px',
                            border: 'none',
                            background: isSelected ? '#fff7ed' : 'transparent',
                            color: isSelected ? '#ea580c' : '#334155',
                            fontSize: '12px',
                            fontWeight: isSelected ? 700 : 500,
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'background 0.1s'
                          }}
                          onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#f8fafc'; }}
                          onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                        >
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>
                            {name}
                          </span>
                          {matchItem && (
                            <span style={{ fontSize: '10px', color: isSelected ? '#ea580c' : '#94a3b8', background: isSelected ? '#fed7aa' : '#f1f5f9', padding: '1px 5px', borderRadius: '8px' }}>
                              {matchItem.currentStock} {matchItem.unit}
                            </span>
                          )}
                        </button>
                      );
                    })
                  }
                </div>
              </div>
            )}
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
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                padding: '4px 6px',
                textDecoration: 'underline',
                whiteSpace: 'nowrap'
              }}
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Right Side: Status Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { id: 'All', label: `All (${totalItemsCount})` },
            { id: 'In Stock', label: `In Stock (${inStockCount})` },
            { id: 'Low Stock', label: `Low Stock (${lowStockCount})` },
            { id: 'Out of Stock', label: `Out of Stock (${outOfStockCount})` }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              style={{
                padding: '6px 12px',
                borderRadius: '7px',
                border: 'none',
                background: statusFilter === tab.id
                  ? (tab.id === 'Out of Stock' ? '#dc2626' : tab.id === 'Low Stock' ? '#d97706' : tab.id === 'In Stock' ? '#16a34a' : '#0f172a')
                  : '#f1f5f9',
                color: statusFilter === tab.id ? '#ffffff' : '#475569',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 5. INVENTORY TABLE & LIST */}
      <div style={{
        background: '#ffffff',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
        overflow: 'hidden'
      }}>
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: '1060px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#000000', borderBottom: '3px solid #ff5a1f', color: '#ffffff' }}>
                <th style={{ padding: '14px 12px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', width: '50px', verticalAlign: 'middle' }}>S.NO.</th>
                <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: '170px', verticalAlign: 'middle' }}>ITEM DETAILS</th>
                <th style={{ padding: '14px 14px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: '140px', verticalAlign: 'middle' }}>CATEGORY & BRANCH</th>
                <th style={{ padding: '14px 14px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: '130px', verticalAlign: 'middle' }}>STOCK LEVEL</th>
                <th style={{ padding: '14px 14px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', minWidth: '110px', verticalAlign: 'middle' }}>STATUS</th>
                <th style={{ padding: '14px 14px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: '120px', verticalAlign: 'middle' }}>UNIT COST / VALUE</th>
                <th style={{ padding: '14px 14px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: '140px', verticalAlign: 'middle' }}>SUPPLIER</th>
                <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', minWidth: '220px', verticalAlign: 'middle' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '48px 20px', color: '#64748b' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600 }}>Loading inventory items from server...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredInventory.length > 0 ? (
                paginatedInventory.map((item, index) => {
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
                  const displayName = getItemDisplayName(item.name || item.itemName, item._id || item.id);

                  return (
                    <tr
                      key={item._id || item.id || index}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {/* S.NO */}
                      <td style={{ padding: '14px 12px', fontWeight: 700, fontSize: '12px', color: '#0f172a', fontFamily: 'monospace', textAlign: 'center', verticalAlign: 'middle' }}>
                        {(page - 1) * limit + index + 1}
                      </td>

                      {/* 1. Item Details */}
                      <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            background: '#fff7ed',
                            color: '#ff5a1f',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '13px',
                            flexShrink: 0,
                            border: '1px solid #fed7aa'
                          }}>
                            {displayName ? displayName.charAt(0).toUpperCase() : 'I'}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                            <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '13px', lineHeight: 1.3, whiteSpace: 'nowrap' }}>
                              {displayName}
                            </span>
                            <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#64748b', background: '#f1f5f9', padding: '1px 6px', borderRadius: '4px', marginTop: '3px', width: 'fit-content', whiteSpace: 'nowrap' }}>
                              SKU: {item.sku || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 2. Category & Branch */}
                      <td style={{ padding: '14px 14px', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <span style={{
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            color: '#334155',
                            fontSize: '12px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '6px',
                            display: 'inline-flex',
                            width: 'fit-content',
                            whiteSpace: 'nowrap'
                          }}>
                            {catName}
                          </span>
                          <span style={{ fontSize: '11px', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '3px', whiteSpace: 'nowrap' }}>
                            📍 {branchLabel}
                          </span>
                        </div>
                      </td>

                      {/* 3. Stock Level & Mini Progress Bar */}
                      <td style={{ padding: '14px 14px', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                            <span style={{ fontWeight: 800, fontSize: '14px', color: isOut ? '#dc2626' : '#0f172a' }}>
                              {curStock}
                            </span>
                            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                              {item.unit}
                            </span>
                          </div>
                          {/* Progress bar to visual threshold */}
                          <div style={{ width: '100px', height: '5px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{
                              width: `${progressPct}%`,
                              height: '100%',
                              background: isOut ? '#ef4444' : isLow ? '#f59e0b' : '#10b981',
                              borderRadius: '4px'
                            }} />
                          </div>
                          <span style={{ fontSize: '10px', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                            Min alert: {minLevel} {item.unit}
                          </span>
                        </div>
                      </td>

                      {/* 4. Status Badge */}
                      <td style={{ padding: '14px 14px', textAlign: 'center', verticalAlign: 'middle' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '11px',
                          fontWeight: 800,
                          background: statusBg,
                          color: statusText,
                          letterSpacing: '0.3px',
                          whiteSpace: 'nowrap'
                        }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: statusText }}></span>
                          {statusLabel}
                        </span>
                      </td>

                      {/* 5. Unit Cost / Value */}
                      <td style={{ padding: '14px 14px', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '13px', whiteSpace: 'nowrap' }}>
                            ₹{itemValue.toLocaleString('en-IN')}
                          </span>
                          <span style={{ fontSize: '11px', color: '#64748b', whiteSpace: 'nowrap' }}>
                            ₹{item.costPerUnit} / {item.unit}
                          </span>
                        </div>
                      </td>

                      {/* 6. Supplier */}
                      <td style={{ padding: '14px 14px', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '13px', whiteSpace: 'nowrap' }}>
                            {item.supplierName || 'Direct Local Purchase'}
                          </span>
                          <span style={{ fontSize: '11px', color: '#64748b', whiteSpace: 'nowrap' }}>
                            {item.supplierPhone || '—'}
                          </span>
                        </div>
                      </td>

                      {/* 7. Quick Actions */}
                      <td style={{ padding: '14px 16px', textAlign: 'center', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
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
                              display: 'inline-flex',
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
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            title="Quick Issue / Stock Out (-)"
                          >
                            <ArrowUpRightIcon size={12} color="#ea580c" />
                            Out
                          </button>

                          {/* View Item History */}
                          <button
                            type="button"
                            onClick={() => handleOpenItemLogs(item)}
                            style={{
                              background: '#f8fafc',
                              border: '1px solid #cbd5e1',
                              color: '#334155',
                              padding: '6px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            title="View Stock Out & Stock In History"
                          >
                            <HistoryIcon size={14} color="#334155" />
                          </button>

                          {/* View Item Details */}
                          <button
                            type="button"
                            onClick={() => setViewingItem(item)}
                            style={{
                              background: '#f8fafc',
                              border: '1px solid #cbd5e1',
                              color: '#475569',
                              padding: '6px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            title="View Item Details"
                          >
                            <EyeIcon size={14} />
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
                              display: 'inline-flex',
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
                              display: 'inline-flex',
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

      {/* Pagination Controls */}
      {filteredInventory.length > 0 && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '20px',
          padding: '12px 20px',
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
            Showing {filteredInventory.length === 0 ? 0 : (page - 1) * limit + 1} to {Math.min(page * limit, filteredInventory.length)} of {filteredInventory.length} items
          </div>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: page <= 1 ? '#f8fafc' : '#ffffff',
                color: page <= 1 ? '#cbd5e1' : '#334155',
                fontSize: '13px',
                fontWeight: 600,
                cursor: page <= 1 ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Prev
            </button>

            {getPageNumbers().map(pageNum => (
              <button
                key={pageNum}
                type="button"
                onClick={() => setPage(pageNum)}
                style={{
                  minWidth: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: page === pageNum ? 700 : 500,
                  border: page === pageNum ? 'none' : '1px solid #e2e8f0',
                  background: page === pageNum ? '#000000' : '#ffffff',
                  color: page === pageNum ? '#ffffff' : '#334155',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {pageNum}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || totalPages === 0}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: (page >= totalPages || totalPages === 0) ? '#f8fafc' : '#ffffff',
                color: (page >= totalPages || totalPages === 0) ? '#cbd5e1' : '#334155',
                fontSize: '13px',
                fontWeight: 600,
                cursor: (page >= totalPages || totalPages === 0) ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* 6. MODAL: VIEW INVENTORY ITEM DETAILS */}
      {viewingItem && (
        <Modal
          isOpen={!!viewingItem}
          onClose={() => setViewingItem(null)}
          title="Inventory Item Details"
          maxWidth="560px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', paddingTop: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                  {getItemDisplayName(viewingItem.name || viewingItem.itemName, viewingItem._id || viewingItem.id)}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <span style={{ fontSize: '11px', fontFamily: 'monospace', background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                    SKU: {viewingItem.sku || 'N/A'}
                  </span>
                </div>
              </div>

              {(() => {
                const min = Number(viewingItem.minAlertLevel !== undefined ? viewingItem.minAlertLevel : viewingItem.minStockLevel) || 0;
                const cur = Number(viewingItem.currentStock) || 0;
                const isOut = cur <= 0;
                const isLow = cur > 0 && cur <= min;
                const bg = isOut ? '#fef2f2' : isLow ? '#fffbeb' : '#f0fdf4';
                const color = isOut ? '#dc2626' : isLow ? '#d97706' : '#16a34a';
                const label = isOut ? 'OUT OF STOCK' : isLow ? 'LOW STOCK' : 'IN STOCK';
                return (
                  <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800, background: bg, color: color }}>
                    {label}
                  </span>
                );
              })()}
            </div>

            {/* Quick Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', padding: '14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Current Stock</span>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                  {viewingItem.currentStock} {viewingItem.unit}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Min Threshold</span>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#ea580c', marginTop: '2px' }}>
                  {viewingItem.minAlertLevel !== undefined ? viewingItem.minAlertLevel : viewingItem.minStockLevel} {viewingItem.unit}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Unit Cost</span>
                <div style={{ fontSize: '16px', fontWeight: 900, color: '#0f172a', marginTop: '2px' }}>
                  ₹{(Number(viewingItem.costPerUnit) || 0).toFixed(2)}
                </div>
              </div>
            </div>

            {/* Information Rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#ffffff', border: '1px solid #f1f5f9', borderRadius: '8px' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Category:</span>
                <strong style={{ color: '#0f172a' }}>{getCategoryName(viewingItem)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#ffffff', border: '1px solid #f1f5f9', borderRadius: '8px' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Branch Assignment:</span>
                <strong style={{ color: '#0f172a' }}>{getBranchLabel(viewingItem.branchId)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#ffffff', border: '1px solid #f1f5f9', borderRadius: '8px' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Total Inventory Valuation:</span>
                <strong style={{ color: '#059669', fontWeight: 800 }}>
                  ₹{((Number(viewingItem.currentStock) || 0) * (Number(viewingItem.costPerUnit) || 0)).toFixed(2)}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#ffffff', border: '1px solid #f1f5f9', borderRadius: '8px' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Supplier:</span>
                <strong style={{ color: '#0f172a' }}>{viewingItem.supplierName || 'Direct Local Purchase'} ({viewingItem.supplierPhone || 'No Phone'})</strong>
              </div>
            </div>

            {/* Stock Movement & Out of Stock History for this Item */}
            {(() => {
              const itemLogs = logs.filter(l => (
                (viewingItem._id && (l.itemId === viewingItem._id || l.id === viewingItem._id)) ||
                (viewingItem.id && (l.itemId === viewingItem.id || l.id === viewingItem.id)) ||
                (l.itemName && viewingItem.name && l.itemName.toLowerCase() === viewingItem.name.toLowerCase())
              ));

              return (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                      Stock Movement History ({itemLogs.length} entries)
                    </span>
                    {itemLogs.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          const itm = viewingItem;
                          setViewingItem(null);
                          handleOpenItemLogs(itm);
                        }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#ff5a1f',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          textDecoration: 'underline'
                        }}
                      >
                        View Full Logs →
                      </button>
                    )}
                  </div>

                  {itemLogs.length > 0 ? (
                    <div style={{ maxHeight: '160px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <th style={{ padding: '8px 10px', color: '#64748b', fontWeight: 700 }}>DATE</th>
                            <th style={{ padding: '8px 10px', color: '#64748b', fontWeight: 700 }}>TYPE</th>
                            <th style={{ padding: '8px 10px', color: '#64748b', fontWeight: 700 }}>QTY</th>
                            <th style={{ padding: '8px 10px', color: '#64748b', fontWeight: 700 }}>REASON</th>
                            <th style={{ padding: '8px 10px', color: '#64748b', fontWeight: 700 }}>LOGGED BY</th>
                          </tr>
                        </thead>
                        <tbody>
                          {itemLogs.slice(0, 10).map((log, lIdx) => (
                            <tr key={log.id || lIdx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '7px 10px', color: '#64748b' }}>{log.date}</td>
                              <td style={{ padding: '7px 10px' }}>
                                <span style={{
                                  padding: '2px 6px',
                                  borderRadius: '10px',
                                  fontSize: '10px',
                                  fontWeight: 800,
                                  background: log.type === 'Stock In' ? '#ecfdf5' : '#fef2f2',
                                  color: log.type === 'Stock In' ? '#059669' : '#dc2626'
                                }}>
                                  {log.type}
                                </span>
                              </td>
                              <td style={{ padding: '7px 10px', fontWeight: 800, color: log.type === 'Stock In' ? '#059669' : '#dc2626' }}>
                                {log.type === 'Stock In' ? `+${log.quantity}` : `-${log.quantity}`} {log.unit}
                              </td>
                              <td style={{ padding: '7px 10px', color: '#334155' }}>{log.reason}</td>
                              <td style={{ padding: '7px 10px', color: '#64748b' }}>{log.user || 'Admin'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div style={{ padding: '14px', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1', color: '#94a3b8', fontSize: '12px' }}>
                      No stock movement history recorded yet for this item.
                    </div>
                  )}
                </div>
              );
            })()}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setViewingItem(null)}
                style={{ padding: '8px 18px' }}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-black"
                onClick={() => {
                  const itm = viewingItem;
                  setViewingItem(null);
                  handleOpenEditModal(itm);
                }}
                style={{ padding: '8px 18px', background: '#ff5a1f', borderColor: '#ff5a1f' }}
              >
                Edit Item
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 8. MODAL: STOCK MOVEMENT & AUDIT LOGS */}
      <Modal
        isOpen={isLogsModalOpen}
        onClose={() => {
          setIsLogsModalOpen(false);
          setLogFilterItemName('All');
          setLogFilterType('All');
          setLogSearchTerm('');
        }}
        title="Inventory Stock Movement & History Logs"
        maxWidth="850px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '8px' }}>
          {/* Filter Toolbar inside Modal */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px',
            background: '#f8fafc',
            padding: '10px 14px',
            borderRadius: '10px',
            border: '1px solid #e2e8f0'
          }}>
            {/* Search Input */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              padding: '6px 10px',
              width: '200px'
            }}>
              <SearchIcon size={13} color="#64748b" />
              <input
                type="text"
                placeholder="Search logs..."
                value={logSearchTerm}
                onChange={e => setLogSearchTerm(e.target.value)}
                style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '12px', width: '100%', color: '#0f172a' }}
              />
              {logSearchTerm && (
                <button type="button" onClick={() => setLogSearchTerm('')} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8', fontSize: '11px' }}>✕</button>
              )}
            </div>

            {/* Filter by Item Name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: '180px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>Item:</label>
              <div style={{ flex: 1 }}>
                <SearchableSelect
                  value={logFilterItemName}
                  onChange={e => setLogFilterItemName(e.target.value)}
                  options={[
                    { value: 'All', label: `All Items (${uniqueItemNames.length})` },
                    ...uniqueItemNames.map(name => ({ value: name, label: name }))
                  ]}
                  placeholder="Filter Item..."
                />
              </div>
            </div>

            {/* Filter by Type */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {[
                { id: 'All', label: 'All Movements' },
                { id: 'Stock Out', label: 'Stock Out' },
                { id: 'Stock In', label: 'Stock In' }
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setLogFilterType(t.id)}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    background: logFilterType === t.id ? (t.id === 'Stock Out' ? '#ef4444' : t.id === 'Stock In' ? '#10b981' : '#0f172a') : '#ffffff',
                    color: logFilterType === t.id ? '#ffffff' : '#475569',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filtered Logs Rendering */}
          {(() => {
            const filteredModalLogs = logs.filter(log => {
              const matchesItem = logFilterItemName === 'All' || log.itemName === logFilterItemName;
              const matchesType = logFilterType === 'All' || log.type === logFilterType;
              const q = logSearchTerm.toLowerCase().trim();
              const matchesSearch = !q ||
                (log.itemName || '').toLowerCase().includes(q) ||
                (log.reason || '').toLowerCase().includes(q) ||
                (log.notes || '').toLowerCase().includes(q) ||
                (log.user || '').toLowerCase().includes(q);
              return matchesItem && matchesType && matchesSearch;
            });

            return (
              <div style={{ maxHeight: '420px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                {filteredModalLogs.length > 0 ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#000000', borderBottom: '3px solid #ff5a1f', color: '#ffffff', position: 'sticky', top: 0, zIndex: 2 }}>
                        <th style={{ padding: '12px 14px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase' }}>DATE / TIME</th>
                        <th style={{ padding: '12px 14px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase' }}>ITEM NAME</th>
                        <th style={{ padding: '12px 14px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase' }}>TYPE</th>
                        <th style={{ padding: '12px 14px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase' }}>QUANTITY</th>
                        <th style={{ padding: '12px 14px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase' }}>REASON & DETAILS</th>
                        <th style={{ padding: '12px 14px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase' }}>LOGGED BY</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredModalLogs.map((log, idx) => {
                        const isIn = log.type === 'Stock In';
                        const itemName = log.itemName !== '—' ? log.itemName : ((items || []).find(i => (i._id === log.itemId || i.id === log.itemId))?.name || 'Item');
                        return (
                          <tr key={log.id || idx} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                            <td style={{ padding: '10px 14px', color: '#64748b', whiteSpace: 'nowrap' }}>
                              {log.date}
                            </td>
                            <td style={{ padding: '10px 14px', fontWeight: 700, color: '#0f172a' }}>
                              {itemName}
                            </td>
                            <td style={{ padding: '10px 14px' }}>
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
                            <td style={{ padding: '10px 14px', fontWeight: 800, color: isIn ? '#059669' : '#dc2626' }}>
                              {isIn ? `+${log.quantity}` : `-${log.quantity}`} {log.unit}
                            </td>
                            <td style={{ padding: '10px 14px' }}>
                              <span style={{ fontWeight: 600, color: '#334155' }}>{log.reason}</span>
                              {log.notes && <span style={{ color: '#94a3b8', display: 'block', fontSize: '11px' }}>{log.notes}</span>}
                            </td>
                            <td style={{ padding: '10px 14px', color: '#64748b' }}>
                              {log.user || 'Admin'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                    <HistoryIcon size={28} color="#94a3b8" />
                    <p style={{ margin: '8px 0 0 0', fontWeight: 600, color: '#334155' }}>No movement history found</p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
                      {logFilterItemName !== 'All' ? `No Stock Out or Stock In logs recorded for "${logFilterItemName}".` : 'No logs match your filter criteria.'}
                    </p>
                  </div>
                )}
              </div>
            );
          })()}
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
