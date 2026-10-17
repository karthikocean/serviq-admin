import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { SearchIcon, EyeIcon, ArrowLeftIcon, getStockStatus, filterInputStyle, PaginationBar, actionIconBtnStyle } from './InventoryCommon';
import InventoryApi from '../../api/Inventory';
import ShowNotifications from '../../helper/ShowNotifications';
import { useAppState } from '../../config/AppContext';
import { isBranchMatch } from '../../helper/BranchHelper';

// Inline SVGs for Summary Cards
const PackageIcon = ({ size = 22, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16.5 9.4 7.55 4.24a1.78 1.78 0 0 0-1.8 0L2.5 6.1a1.8 1.8 0 0 0-.9 1.56v8.68c0 .64.34 1.23.9 1.56l3.25 1.86a1.78 1.78 0 0 0 1.8 0l8.95-5.16a1.8 1.8 0 0 0 .9-1.56V11a1.8 1.8 0 0 0-.9-1.6Z"/>
    <polyline points="3.29 7 12 12 20.71 7"/>
    <line x1="12" y1="22" x2="12" y2="12"/>
  </svg>
);

const LayersIcon = ({ size = 22, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
    <polyline points="2 17 12 22 22 17"></polyline>
    <polyline points="2 12 12 17 22 12"></polyline>
  </svg>
);

const AlertTriangleIcon = ({ size = 22, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);

const AlertOctagonIcon = ({ size = 22, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon>
    <line x1="15" y1="9" x2="9" y2="15"></line>
    <line x1="9" y1="9" x2="15" y2="15"></line>
  </svg>
);

export default function CompanyCentralStock({ items: initialItems, onUpdateStock, hasPermission }) {
  const { selectedBranchId, activeRestaurant } = useAppState();
  const branches = activeRestaurant?.branches || [];
  const isBranchFiltered = Boolean(selectedBranchId && selectedBranchId !== 'ALL' && selectedBranchId !== 'All' && String(selectedBranchId).toUpperCase() !== 'COMPANY');

  const canView = typeof hasPermission === 'function' ? hasPermission('inventory_central_stock', 'view') : true;
  const canEdit = typeof hasPermission === 'function' ? hasPermission('inventory_central_stock', 'edit') : true;
  const [itemsList, setItemsList] = useState(initialItems || []);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [itemFilter, setItemFilter] = useState('All');
  const [stockStatusFilter, setStockStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(0);

  // Detail View State (null | item)
  const [viewingItem, setViewingItem] = useState(null);
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustMinStock, setAdjustMinStock] = useState('');
  const [adjustReason, setAdjustReason] = useState('Stock Audit');

  const PAGE_SIZE = 10;
  const [totalItemsCount, setTotalItemsCount] = useState(0);

  const fetchCentralStock = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = {
        branchId: isBranchFiltered ? selectedBranchId : undefined,
        limit: 100
      };

      const res = await InventoryApi.getItems(queryParams);
      if (res?.status && res?.response) {
        const rawItems = res.response.data || res.response.items || (Array.isArray(res.response) ? res.response : []);
        const serverTotal = res.response.totalItems ?? res.response.total ?? res.response.totalRecords ?? res.response.count ?? (Array.isArray(rawItems) ? rawItems.length : 0);
        if (Array.isArray(rawItems)) {
          const formatted = rawItems.map(i => {
            const currentStockNum = i.currentStock !== undefined ? Number(i.currentStock) : Number(i.centralStock || 0);
            const minStockNum = i.minAlertLevel !== undefined ? Number(i.minAlertLevel) : Number(i.minStock || 0);
            return {
              id: i._id || i.id,
              _id: i._id || i.id,
              branchId: i.branchId || i.branch?._id || i.branch?.id || i.branch,
              branchName: i.branchName || (typeof i.branchId === 'object' ? (i.branchId?.branchName || i.branchId?.name) : '') || i.branch || '',
              itemCode: i.itemCode || i.sku || `INV-${String(i._id || '').slice(-3).toUpperCase()}`,
              name: i.name,
              category: i.category || (typeof i.categoryId === 'object' ? i.categoryId?.name : i.categoryId) || 'General',
              unit: i.unit || 'kg',
              centralStock: currentStockNum,
              currentStock: currentStockNum,
              minStock: minStockNum,
              minAlertLevel: minStockNum,
              status: i.status || 'Active'
            };
          });
          setItemsList(formatted);
          setTotalItemsCount(Number(serverTotal) || formatted.length);
        }
      }
    } catch (err) {
      console.warn('Central stock load note:', err);
    } finally {
      setLoading(false);
    }
  }, [isBranchFiltered, selectedBranchId]);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchCentralStock();
    }, 300);
    return () => clearTimeout(handler);
  }, [fetchCentralStock]);

  useEffect(() => {
    if (Array.isArray(initialItems) && initialItems.length > 0) {
      setItemsList(prev => {
        const existingIds = new Set(prev.map(p => String(p.id || p._id || p.name)));
        const newFromProps = initialItems.filter(r => !existingIds.has(String(r.id || r._id || r.name)));
        return [...newFromProps, ...prev];
      });
    }
  }, [initialItems]);

  const displayItems = itemsList.length > 0 ? itemsList : (initialItems || []);

  // Category and Item Options for dropdown filters
  const categories = useMemo(() => {
    const defaultCats = ['Grains', 'Oils', 'Spices', 'Meat', 'Dairy', 'Vegetables', 'Beverages', 'Packaging'];
    const fromItems = displayItems.map(i => i.category).filter(Boolean);
    const set = new Set([...defaultCats, ...fromItems]);
    return ['All', ...Array.from(set).filter(c => c !== 'All')];
  }, [displayItems]);

  const itemOptions = useMemo(() => {
    const names = new Set(displayItems.map(i => i.name).filter(Boolean));
    return Array.from(names).sort();
  }, [displayItems]);

  // Client-side filtering guarantees instant, reliable multi-field filtering
  const filteredItems = useMemo(() => {
    return displayItems.filter(item => {
      // 1. Search filter
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch = !q ||
        (item.name || '').toLowerCase().includes(q) ||
        (item.itemCode || '').toLowerCase().includes(q) ||
        (item.category || '').toLowerCase().includes(q);

      // 2. Category filter
      const matchesCategory = categoryFilter === 'All' ||
        String(item.category || '').toLowerCase() === categoryFilter.toLowerCase();

      // 3. Item filter
      const matchesItem = itemFilter === 'All' ||
        String(item.name || '').toLowerCase() === itemFilter.toLowerCase();

      // 4. Stock status filter (dynamic check)
      const curStock = Number(item.currentStock !== undefined ? item.currentStock : (item.centralStock || 0));
      const minStock = Number(item.minStock !== undefined ? item.minStock : (item.minAlertLevel || 0));
      const statusInfo = getStockStatus(curStock, minStock);
      const itemStatusLabel = (statusInfo?.label || '').toLowerCase(); // 'in stock', 'low stock', 'out of stock'

      let matchesStockStatus = true;
      if (stockStatusFilter !== 'All') {
        matchesStockStatus = itemStatusLabel === stockStatusFilter.toLowerCase();
      }

      // 5. Branch filter
      const matchesBranch = !isBranchFiltered || isBranchMatch(item, selectedBranchId, branches) || isBranchMatch(item.branchId || item.branch, selectedBranchId, branches);

      return matchesSearch && matchesCategory && matchesItem && matchesStockStatus && matchesBranch;
    });
  }, [displayItems, searchTerm, categoryFilter, itemFilter, stockStatusFilter, isBranchFiltered, selectedBranchId, branches]);

  // Summary Metrics for Central Stock
  const totalStockQty = displayItems.reduce((acc, item) => {
    const val = item.currentStock !== undefined ? item.currentStock : (item.centralStock || 0);
    return acc + (Number(val) || 0);
  }, 0);
  const lowStockCount = displayItems.filter(item => {
    const stock = Number(item.currentStock !== undefined ? item.currentStock : (item.centralStock || 0));
    const min = Number(item.minStock || 0);
    return stock > 0 && stock <= min;
  }).length;
  const outOfStockCount = displayItems.filter(item => {
    const stock = Number(item.currentStock !== undefined ? item.currentStock : (item.centralStock || 0));
    return stock <= 0;
  }).length;

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));

  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm, categoryFilter, itemFilter, stockStatusFilter, selectedBranchId]);

  useEffect(() => {
    if (currentPage >= totalPages && totalPages > 0) {
      setCurrentPage(Math.max(0, totalPages - 1));
    }
  }, [totalPages, currentPage]);

  const paginatedItems = filteredItems.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  const handleOpenView = (item) => {
    setViewingItem(item);
    setAdjustQty((item.currentStock !== undefined ? item.currentStock : item.centralStock || 0).toString());
    setAdjustMinStock((item.minStock !== undefined ? item.minStock : (item.minAlertLevel || 0)).toString());
    setAdjustReason('Stock Audit');
  };

  const handleSaveStockAdjust = async (e) => {
    e.preventDefault();
    if (adjustQty === '' || isNaN(adjustQty)) {
      ShowNotifications.showAlertNotification('Please enter a valid stock quantity.', false);
      return;
    }
    const targetId = viewingItem._id || viewingItem.id;
    const newQty = Number(adjustQty);
    const newMin = adjustMinStock !== '' && !isNaN(adjustMinStock) ? Number(adjustMinStock) : Number(viewingItem.minStock || 0);

    setIsSaving(true);
    try {
      // 1. Immediately update viewingItem so Stock Information card displays the change instantly
      setViewingItem(prev => ({
        ...prev,
        centralStock: newQty,
        currentStock: newQty,
        minStock: newMin,
        minAlertLevel: newMin
      }));

      // 2. Immediately update local itemsList
      setItemsList(prev => prev.map(i => {
        if (String(i.id || i._id) === String(targetId)) {
          return {
            ...i,
            centralStock: newQty,
            currentStock: newQty,
            minStock: newMin,
            minAlertLevel: newMin
          };
        }
        return i;
      }));

      // 3. Notify parent callback
      if (onUpdateStock) {
        onUpdateStock(targetId, newQty, adjustReason, newMin);
      }

      // 4. Persist to API
      await InventoryApi.updateItem(targetId, {
        centralStock: newQty,
        currentStock: newQty,
        minStock: newMin,
        minAlertLevel: newMin,
        minStockThreshold: newMin
      });

      ShowNotifications.showAlertNotification(`Stock for "${viewingItem.name}" updated successfully!`, true);
    } catch (err) {
      console.warn('Save stock adjust note:', err);
      ShowNotifications.showAlertNotification('Stock count updated locally.', true);
    } finally {
      setIsSaving(false);
    }
  };

  // Render Stock Adjustment / Item Detail Page View
  if (viewingItem) {
    const currentStockNum = viewingItem.currentStock !== undefined ? viewingItem.currentStock : viewingItem.centralStock;
    const minStockNum = viewingItem.minStock !== undefined ? viewingItem.minStock : (viewingItem.minAlertLevel || 0);
    const statusProps = getStockStatus(currentStockNum, minStockNum);
    return (
      <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              onClick={() => setViewingItem(null)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#475569',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <ArrowLeftIcon size={16} />
              <span>Back to Central Stock</span>
            </button>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
              Central Stock Details: {viewingItem.name}
            </h2>
          </div>
        </div>

        {/* Details Card */}
        <div style={{ display: 'grid', gridTemplateColumns: canEdit ? '1fr 1fr' : '1fr', gap: '24px', maxWidth: canEdit ? '850px' : '500px', marginBottom: '32px' }}>
          <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: '0 0 14px 0', fontSize: '15px', color: '#0f172a', fontWeight: 800 }}>Stock Information</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Item Code:</span>
                <strong style={{ color: '#0f172a' }}>{viewingItem.itemCode && !String(viewingItem.itemCode).match(/^[0-9a-fA-F]{24}$/) ? viewingItem.itemCode : (viewingItem.id && !String(viewingItem.id).match(/^[0-9a-fA-F]{24}$/) ? viewingItem.id : 'INV-001')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Category:</span>
                <span style={{ color: '#0f172a', fontWeight: 600 }}>{viewingItem.category}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Unit:</span>
                <span style={{ color: '#0f172a', fontWeight: 600 }}>{viewingItem.unit}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Current Stock:</span>
                <strong style={{ color: '#ff5a1f', fontSize: '16px', fontWeight: 800 }}>
                  {(viewingItem.currentStock !== undefined ? viewingItem.currentStock : viewingItem.centralStock)} {viewingItem.unit}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Minimum Stock:</span>
                <strong style={{ color: '#0f172a', fontSize: '14px', fontWeight: 700 }}>
                  {(viewingItem.minStock !== undefined ? viewingItem.minStock : (viewingItem.minAlertLevel || 0))} {viewingItem.unit}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b' }}>Stock Status:</span>
                <span style={{
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 800,
                  background: statusProps.bg,
                  color: statusProps.color
                }}>
                  {statusProps.label}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Adjustment Form */}
          {canEdit && (
            <div style={{ background: '#ffffff', padding: '20px', borderRadius: '10px', border: '1px solid #cbd5e1', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
              <h4 style={{ margin: '0 0 14px 0', fontSize: '15px', color: '#0f172a', fontWeight: 800 }}>Quick Stock & Minimum Count Adjustment</h4>
              <form onSubmit={handleSaveStockAdjust}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    New Current Stock Quantity ({viewingItem.unit}) <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="number"
                    value={adjustQty}
                    placeholder={(viewingItem.currentStock !== undefined ? viewingItem.currentStock : viewingItem.centralStock).toString()}
                    onChange={e => setAdjustQty(e.target.value)}
                    style={{ ...filterInputStyle, height: '40px' }}
                    required
                  />
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Minimum Stock Alert Level ({viewingItem.unit}) <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="number"
                    value={adjustMinStock}
                    placeholder={(viewingItem.minStock !== undefined ? viewingItem.minStock : (viewingItem.minAlertLevel || 0)).toString()}
                    onChange={e => setAdjustMinStock(e.target.value)}
                    style={{ ...filterInputStyle, height: '40px' }}
                    required
                  />
                </div>

                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Adjustment Reason
                  </label>
                  <select
                    value={adjustReason}
                    onChange={e => setAdjustReason(e.target.value)}
                    style={{ ...filterInputStyle, height: '40px' }}
                  >
                    <option value="Stock Audit">Physical Stock Audit</option>
                    <option value="Damaged Stock">Damaged / Expired Goods</option>
                    <option value="Vendor Return">Vendor Return</option>
                    <option value="Correction">Manual Correction</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  style={{
                    width: '100%',
                    background: '#16a34a',
                    color: '#ffffff',
                    border: 'none',
                    padding: '11px 16px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                    opacity: isSaving ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 2px 8px rgba(22, 163, 74, 0.25)'
                  }}
                >
                  {isSaving ? 'Updating...' : 'Update Stock & Minimum Count'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* SUMMARY CARDS FOR CENTRAL STOCK */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        {/* 1. Total Items */}
        <div
          onClick={() => { setStockStatusFilter('All'); setCurrentPage(0); }}
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: stockStatusFilter === 'All' ? '2px solid #3b82f6' : '1px solid #e2e8f0',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          title="Click to view all items"
        >
          <div>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total Items
            </span>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', marginTop: '6px', lineHeight: 1.1 }}>
              {totalItemsCount}
            </div>
            <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
              Items in Central Catalog
            </span>
          </div>
          <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', flexShrink: 0 }}>
            <PackageIcon size={24} />
          </div>
        </div>

        {/* 2. Total Stock */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total Stock
            </span>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', marginTop: '6px', lineHeight: 1.1 }}>
              {totalStockQty.toLocaleString()}
            </div>
            <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
              Units in Central Warehouse
            </span>
          </div>
          <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a', flexShrink: 0 }}>
            <LayersIcon size={24} />
          </div>
        </div>

        {/* 3. Low Stock */}
        <div
          onClick={() => { setStockStatusFilter('low stock'); setCurrentPage(0); }}
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: stockStatusFilter.toLowerCase() === 'low stock' ? '2px solid #d97706' : '1px solid #e2e8f0',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          title="Click to filter Low Stock items"
        >
          <div>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Low Stock
            </span>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#d97706', marginTop: '6px', lineHeight: 1.1 }}>
              {lowStockCount}
            </div>
            <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
              Below minimum threshold
            </span>
          </div>
          <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706', flexShrink: 0 }}>
            <AlertTriangleIcon size={24} />
          </div>
        </div>

        {/* 4. Out of Stock */}
        <div
          onClick={() => { setStockStatusFilter('out of stock'); setCurrentPage(0); }}
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: stockStatusFilter.toLowerCase() === 'out of stock' ? '2px solid #dc2626' : '1px solid #e2e8f0',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          title="Click to filter Out of Stock items"
        >
          <div>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Out of Stock
            </span>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#dc2626', marginTop: '6px', lineHeight: 1.1 }}>
              {outOfStockCount}
            </div>
            <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
              Zero quantity available
            </span>
          </div>
          <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626', flexShrink: 0 }}>
            <AlertOctagonIcon size={24} />
          </div>
        </div>
      </div>

      {/* CENTRAL STOCK CARD & TABLE */}
      <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
        {/* Filters Bar: Category, Item, Stock status */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Search */}
            <div style={{ position: 'relative', width: '220px' }}>
              <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}>
                <SearchIcon size={14} />
              </span>
              <input
                type="text"
                placeholder="Search Central Stock..."
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(0); }}
                style={{ ...filterInputStyle, paddingLeft: '32px' }}
              />
            </div>

            {/* Filter: Category */}
            <div style={{ width: '150px' }}>
              <select
                value={categoryFilter}
                onChange={e => { setCategoryFilter(e.target.value); setCurrentPage(0); }}
                style={filterInputStyle}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
                ))}
              </select>
            </div>

            {/* Filter: Item */}
            <div style={{ width: '160px' }}>
              <select
                value={itemFilter}
                onChange={e => { setItemFilter(e.target.value); setCurrentPage(0); }}
                style={filterInputStyle}
              >
                <option value="All">All Items</option>
                {itemOptions.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>

            {/* Filter: Stock Status */}
            <div style={{ width: '150px' }}>
              <select
                value={stockStatusFilter}
                onChange={e => { setStockStatusFilter(e.target.value); setCurrentPage(0); }}
                style={filterInputStyle}
              >
                <option value="All">All Stock Status</option>
                <option value="in stock">In Stock</option>
                <option value="low stock">Low Stock</option>
                <option value="out of stock">Out of Stock</option>
              </select>
            </div>

            {(searchTerm || categoryFilter !== 'All' || itemFilter !== 'All' || stockStatusFilter !== 'All') && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('All');
                  setItemFilter('All');
                  setStockStatusFilter('All');
                  setCurrentPage(0);
                }}
                style={{
                  background: '#f8fafc',
                  color: '#64748b',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '7px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Central Stock — Table */}
        <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', paddingBottom: '4px' }}>
          <table style={{ width: '100%', minWidth: '950px', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f95e10', color: '#ffffff' }}>
                <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap', width: '60px' }}>S.No</th>
                <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap' }}>Item Name</th>
                <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap' }}>Category</th>
                <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap' }}>Unit</th>
                <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap' }}>Current Stock</th>
                <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap' }}>Minimum Stock</th>
                <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap' }}>Stock Status</th>
                <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '36px 16px', color: '#64748b' }}>
                    No central stock items match the selected filters.
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item, index) => {
                  const currentStockVal = item.currentStock !== undefined ? item.currentStock : (item.centralStock || 0);
                  const minStockVal = item.minStock || 0;
                  const statusProps = getStockStatus(currentStockVal, minStockVal);
                  const sNo = currentPage * PAGE_SIZE + index + 1;

                  return (
                    <tr key={item.id || item._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: '#64748b' }}>
                        {sNo}
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 800, color: '#0f172a' }}>
                        <div>{item.name}</div>
                        {item.itemCode && !String(item.itemCode).match(/^[0-9a-fA-F]{24}$/) && (
                          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500 }}>
                            {item.itemCode}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#475569', fontWeight: 500 }}>
                        {item.category}
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
                          {item.unit || 'kg'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 800, color: '#0f172a', fontSize: '14px' }}>
                        {currentStockVal}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#64748b', fontWeight: 600 }}>
                        {minStockVal}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 700,
                          background: statusProps.bg,
                          color: statusProps.color,
                          display: 'inline-block'
                        }}>
                          {statusProps.label}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        {canView && (
                        <button
                          type="button"
                          onClick={() => handleOpenView(item)}
                          title="View / Adjust Stock"
                          style={{
                            ...actionIconBtnStyle,
                            background: '#eff6ff',
                            border: '1px solid #bfdbfe',
                            color: '#2563eb'
                          }}
                        >
                          <EyeIcon size={15} />
                        </button>
                        )}
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
          totalItems={filteredItems.length}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
