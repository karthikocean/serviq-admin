import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState, DEFAULT_INVENTORY_CATEGORIES } from '../config/AppContext';
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

  const branches = activeRestaurant?.branches || [];
  const rawInventory = activeRestaurant?.inventory || [];
  const rawLogs = activeRestaurant?.inventoryLogs || [];
  const rawCategories = activeRestaurant?.inventoryCategories || DEFAULT_INVENTORY_CATEGORIES;

  // Filter inventory by branch if a branch is selected in the global header
  const inventory = selectedBranchId
    ? rawInventory.filter(item => item.branchId === selectedBranchId || item.branchId === 'ALL')
    : rawInventory;

  const logs = selectedBranchId
    ? rawLogs.filter(log => {
      const matchItem = rawInventory.find(i => i.id === log.itemId);
      return !matchItem || matchItem.branchId === selectedBranchId || matchItem.branchId === 'ALL';
    })
    : rawLogs;

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

  // Dynamic Unique Categories & Items List for Dropdowns
  const dynamicCatNames = Array.from(new Set([
    ...rawCategories.map(c => c.name),
    ...rawInventory.map(i => i.category)
  ].filter(Boolean))).sort();
  const categoriesList = ['All', ...dynamicCatNames];

  const uniqueItemNames = Array.from(new Set(inventory.map(i => i.name).filter(Boolean))).sort();

  // Form states for Add / Edit Item
  const [formState, setFormState] = useState({
    id: '',
    name: '',
    sku: '',
    category: dynamicCatNames[0] || 'Dairy',
    branchId: selectedBranchId || (branches.length > 0 ? branches[0].id : 'BR-001'),
    currentStock: '',
    minStockLevel: '',
    unit: 'kg',
    costPerUnit: '',
    supplierName: '',
    supplierPhone: ''
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

  // Metrics
  const totalItemsCount = inventory.length;
  const lowStockCount = inventory.filter(i => i.status === 'Low Stock' || i.status === 'Out of Stock').length;
  const totalValuation = inventory.reduce((sum, item) => sum + ((Number(item.currentStock) || 0) * (Number(item.costPerUnit) || 0)), 0);
  const categoriesCount = new Set(inventory.map(i => i.category)).size;

  // Filter items
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.sku || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.supplierName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.category || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesItemName = itemNameFilter === 'All' || item.name === itemNameFilter;
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;

    const matchesStatus = statusFilter === 'All'
      ? true
      : statusFilter === 'Low Stock'
        ? (item.status === 'Low Stock' || item.status === 'Out of Stock')
        : item.status === statusFilter;

    return matchesSearch && matchesItemName && matchesCategory && matchesStatus;
  });

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormState({
      id: '',
      name: '',
      sku: `ING-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      category: 'Dairy',
      branchId: selectedBranchId || (branches.length > 0 ? branches[0].id : 'BR-001'),
      currentStock: '',
      minStockLevel: '',
      unit: 'kg',
      costPerUnit: '',
      supplierName: '',
      supplierPhone: ''
    });
    setFormErrors({});
    setIsAddEditModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setFormState({
      id: item.id,
      name: item.name || '',
      sku: item.sku || '',
      category: item.category || 'Dairy',
      branchId: item.branchId || (selectedBranchId || 'BR-001'),
      currentStock: item.currentStock !== undefined ? item.currentStock : '',
      minStockLevel: item.minStockLevel !== undefined ? item.minStockLevel : '',
      unit: item.unit || 'kg',
      costPerUnit: item.costPerUnit !== undefined ? item.costPerUnit : '',
      supplierName: item.supplierName || '',
      supplierPhone: item.supplierPhone || ''
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
    if (formState.minStockLevel === '' || isNaN(Number(formState.minStockLevel)) || Number(formState.minStockLevel) < 0) {
      errors.minStockLevel = 'Please enter a valid min stock threshold (0 or more).';
    }
    if (formState.costPerUnit === '' || isNaN(Number(formState.costPerUnit)) || Number(formState.costPerUnit) < 0) {
      errors.costPerUnit = 'Please enter a valid unit cost (0 or more).';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveItem = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingItem) {
      if (updateInventoryItem && activeRestaurant?.id) {
        updateInventoryItem(activeRestaurant.id, editingItem.id, {
          name: formState.name.trim(),
          sku: formState.sku.trim(),
          category: formState.category,
          branchId: formState.branchId,
          currentStock: Number(formState.currentStock),
          minStockLevel: Number(formState.minStockLevel),
          unit: formState.unit,
          costPerUnit: Number(formState.costPerUnit),
          supplierName: formState.supplierName.trim(),
          supplierPhone: formState.supplierPhone.trim()
        });
        ShowNotifications.showAlertNotification(`Inventory item "${formState.name}" updated!`, true);
      }
    } else {
      if (addInventoryItem && activeRestaurant?.id) {
        addInventoryItem(activeRestaurant.id, {
          name: formState.name.trim(),
          sku: formState.sku.trim(),
          category: formState.category,
          branchId: formState.branchId,
          currentStock: Number(formState.currentStock),
          minStockLevel: Number(formState.minStockLevel),
          unit: formState.unit,
          costPerUnit: Number(formState.costPerUnit),
          supplierName: formState.supplierName.trim(),
          supplierPhone: formState.supplierPhone.trim()
        });
        ShowNotifications.showAlertNotification(`New item "${formState.name}" added to inventory!`, true);
      }
    }

    setIsAddEditModalOpen(false);
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

  const handleSaveAdjustment = (e) => {
    e.preventDefault();
    const qty = Number(adjustState.quantity);
    if (!adjustState.quantity || isNaN(qty) || qty <= 0) {
      setAdjustErrors({ quantity: 'Please enter a valid quantity greater than 0.' });
      return;
    }

    if (adjustState.type === 'Stock Out' && qty > adjustTargetItem.currentStock) {
      setAdjustErrors({ quantity: `Cannot issue more than current available stock (${adjustTargetItem.currentStock} ${adjustTargetItem.unit}).` });
      return;
    }

    if (adjustStock && activeRestaurant?.id && adjustTargetItem) {
      adjustStock(
        activeRestaurant.id,
        adjustTargetItem.id,
        adjustState.type,
        qty,
        adjustState.reason,
        adjustState.notes
      );
      ShowNotifications.showAlertNotification(
        `${adjustState.type} of ${qty} ${adjustTargetItem.unit} logged for ${adjustTargetItem.name}!`,
        true
      );
      setIsAdjustModalOpen(false);
    }
  };

  const handleDeleteConfirm = () => {
    if (itemToDelete && deleteInventoryItem && activeRestaurant?.id) {
      deleteInventoryItem(activeRestaurant.id, itemToDelete.id);
      ShowNotifications.showAlertNotification(`Item "${itemToDelete.name}" removed from inventory.`, true);
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
                PREMIUM
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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

        {/* Card 2: Low Stock Alerts */}
        <div style={{
          background: '#ffffff',
          borderRadius: '14px',
          padding: '20px',
          border: lowStockCount > 0 ? '1.5px solid #fecaca' : '1px solid #e2e8f0',
          boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: lowStockCount > 0 ? '#fef2f2' : '#f0fdf4', color: lowStockCount > 0 ? '#dc2626' : '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangleIcon size={24} color={lowStockCount > 0 ? '#dc2626' : '#16a34a'} />
          </div>
          <div>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Low Stock Alerts
            </span>
            <h3 style={{ fontSize: '24px', fontWeight: 800, color: lowStockCount > 0 ? '#dc2626' : '#0f172a', margin: '4px 0 0 0' }}>
              {lowStockCount} {lowStockCount > 0 && <span style={{ fontSize: '12px', fontWeight: 700, color: '#dc2626' }}>(Action Required)</span>}
            </h3>
          </div>
        </div>

        {/* Card 3: Total Stock Valuation */}
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
              <option value="All">All Item Names ({inventory.length})</option>
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
            { id: 'In Stock', label: `In Stock (${inventory.filter(i => i.status === 'In Stock').length})` }
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
              {filteredInventory.length > 0 ? (
                filteredInventory.map((item, index) => {
                  const isOut = item.currentStock <= 0;
                  const isLow = item.currentStock > 0 && item.currentStock <= item.minStockLevel;
                  const statusBg = isOut ? '#fef2f2' : isLow ? '#fffbeb' : '#f0fdf4';
                  const statusText = isOut ? '#dc2626' : isLow ? '#d97706' : '#16a34a';
                  const statusLabel = isOut ? 'OUT OF STOCK' : isLow ? 'LOW STOCK' : 'IN STOCK';
                  const itemValue = (Number(item.currentStock) || 0) * (Number(item.costPerUnit) || 0);
                  const progressPct = Math.min(100, Math.round(((item.currentStock || 0) / ((item.minStockLevel || 1) * 2)) * 100));

                  return (
                    <tr 
                      key={item.id || index}
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
                              ID: {item.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 2. Category & Branch */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <span style={{ fontWeight: 700, color: '#334155' }}>
                            {item.category}
                          </span>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>
                            {item.branchId || 'BR-001'}
                          </span>
                        </div>
                      </td>

                      {/* 3. Stock Level & Progress */}
                      <td style={{ padding: '14px 16px', minWidth: '140px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 800, color: isOut ? '#dc2626' : '#0f172a', fontSize: '13px' }}>
                              {item.currentStock} {item.unit}
                            </span>
                            <span style={{ fontSize: '11px', color: '#64748b' }}>
                              Min: {item.minStockLevel} {item.unit}
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
        onClose={() => setIsAddEditModalOpen(false)}
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
                value={formState.category}
                onChange={e => setFormState({ ...formState, category: e.target.value })}
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
                {categoriesList.filter(c => c !== 'All').map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                Branch Assignment
              </label>
              <select
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
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.branchName} ({b.branchCode})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Current Stock, Min Level & Unit */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                Current Stock <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="number"
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
                step="0.1"
                min="0"
                value={formState.minStockLevel}
                onChange={e => {
                  setFormState({ ...formState, minStockLevel: e.target.value });
                  if (formErrors.minStockLevel) setFormErrors({ ...formErrors, minStockLevel: '' });
                }}
                placeholder="5"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: formErrors.minStockLevel ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              {formErrors.minStockLevel && (
                <span style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                  {formErrors.minStockLevel}
                </span>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                Unit of Measure
              </label>
              <select
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
              className="btn btn-outline"
              onClick={() => setIsAddEditModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-black"
            >
              {editingItem ? 'Save Changes' : 'Add Item'}
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
            This item and its historical metrics will be removed from your stock ledger.
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
