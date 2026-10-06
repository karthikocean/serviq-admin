import React, { useState, useEffect, useCallback } from 'react';
import { SearchIcon, EyeIcon, ArrowLeftIcon, getStockStatus, filterInputStyle, PaginationBar, preventSpaceInput, actionIconBtnStyle } from './InventoryCommon';
import InventoryApi from '../../api/Inventory';

// Icons for My Stock Summary Cards
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

export default function BranchMyStock({ items: initialItems, onUpdateBranchStock }) {
  const [itemsList, setItemsList] = useState(initialItems || []);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [itemFilter, setItemFilter] = useState('All');
  const [stockStatusFilter, setStockStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(0);

  // View / Adjust Detail State
  const [viewingItem, setViewingItem] = useState(null);
  const [adjustQty, setAdjustQty] = useState('');

  const categories = ['All', 'Grains', 'Oils', 'Spices', 'Meat', 'Dairy', 'Vegetables', 'Beverages', 'Packaging'];

  const fetchBranchStock = useCallback(async () => {
    setLoading(true);
    try {
      const res = await InventoryApi.getItems({ limit: 100 });
      if (res?.status && res?.response) {
        const rawItems = res.response.data || res.response.items || (Array.isArray(res.response) ? res.response : []);
        if (Array.isArray(rawItems)) {
          const formatted = rawItems.map(i => ({
            id: i._id || i.id,
            _id: i._id || i.id,
            itemCode: i.itemCode || i.sku || `INV-${String(i._id || '').slice(-3).toUpperCase()}`,
            name: i.name,
            category: i.category || (typeof i.categoryId === 'object' ? i.categoryId?.name : i.categoryId) || 'General',
            unit: i.unit || 'kg',
            branchStock: i.currentStock !== undefined ? i.currentStock : (i.branchStock || 0),
            currentStock: i.currentStock !== undefined ? i.currentStock : (i.branchStock || 0),
            minStock: i.minAlertLevel !== undefined ? i.minAlertLevel : (i.minStock || 0),
            status: i.status || 'Active'
          }));
          setItemsList(formatted);
        }
      }
    } catch (err) {
      console.warn('Branch stock load note:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBranchStock();
  }, [fetchBranchStock]);

  const displayItems = itemsList.length > 0 ? itemsList : (initialItems || []);

  // Summary Metrics for Branch My Stock
  const totalItemsCount = displayItems.length;
  const availableStockQty = displayItems.reduce((acc, item) => {
    const val = item.currentStock !== undefined ? item.currentStock : (item.branchStock || 0);
    return acc + (Number(val) || 0);
  }, 0);
  const lowStockCount = displayItems.filter(item => {
    const stock = Number(item.currentStock !== undefined ? item.currentStock : (item.branchStock || 0));
    const min = Number(item.minStock || 0);
    return stock > 0 && stock <= min;
  }).length;
  const outOfStockCount = displayItems.filter(item => {
    const stock = Number(item.currentStock !== undefined ? item.currentStock : (item.branchStock || 0));
    return stock <= 0;
  }).length;

  const filteredItems = displayItems.filter(item => {
    const matchesSearch = !searchTerm.trim() || item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    const matchesItem = itemFilter === 'All' || item.name === itemFilter;

    const currentStockVal = item.currentStock !== undefined ? item.currentStock : (item.branchStock || 0);
    const minStockVal = item.minStock || 0;
    const statusProps = getStockStatus(currentStockVal, minStockVal);
    const matchesStatus = stockStatusFilter === 'All' || statusProps.label.toLowerCase() === stockStatusFilter.toLowerCase();

    return matchesSearch && matchesCategory && matchesItem && matchesStatus;
  });

  const PAGE_SIZE = 10;
  const paginatedItems = filteredItems.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  const handleSaveStockAdjust = (e) => {
    e.preventDefault();
    if (!adjustQty || isNaN(adjustQty)) return;
    if (onUpdateBranchStock) onUpdateBranchStock(viewingItem.id, Number(adjustQty));
    setItemsList(prev => prev.map(i => i.id === viewingItem.id ? { ...i, branchStock: Number(adjustQty), currentStock: Number(adjustQty) } : i));
    setViewingItem(null);
  };

  // Render View / Adjust Branch Stock Page View
  if (viewingItem) {
    const statusProps = getStockStatus(viewingItem.branchStock, viewingItem.minStock);
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
              <span>Back to My Stock</span>
            </button>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
              Branch Stock Details: {viewingItem.name}
            </h2>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', maxWidth: '800px', marginBottom: '32px' }}>
          <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: '0 0 14px 0', fontSize: '15px', color: '#0f172a', fontWeight: 800 }}>Branch Stock Summary</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Item ID:</span>
                <strong style={{ color: '#0f172a' }}>{viewingItem.id}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Category:</span>
                <span style={{ color: '#0f172a', fontWeight: 600 }}>{viewingItem.category}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Available Branch Stock:</span>
                <strong style={{ color: '#ff5a1f', fontSize: '15px' }}>{viewingItem.branchStock} {viewingItem.unit}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Reorder Threshold (Min):</span>
                <span style={{ color: '#0f172a', fontWeight: 600 }}>{viewingItem.minStock} {viewingItem.unit}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b' }}>Stock Status:</span>
                <span style={{
                  padding: '3px 10px',
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

          <div style={{ background: '#ffffff', padding: '20px', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
            <h4 style={{ margin: '0 0 14px 0', fontSize: '15px', color: '#0f172a', fontWeight: 800 }}>Branch Kitchen Adjustment</h4>
            <form onSubmit={handleSaveStockAdjust}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Update Branch Stock Quantity ({viewingItem.unit})
                </label>
                <input
                  type="number"
                  value={adjustQty}
                  placeholder={viewingItem.branchStock.toString()}
                  onChange={e => setAdjustQty(e.target.value)}
                  style={{ ...filterInputStyle, height: '40px' }}
                  required
                />
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  background: '#ff5a1f',
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Save Branch Stock
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Summary Cards: 127. Total Items, 128. Available Stock, 129. Low Stock, 130. Out of Stock */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Items</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>{totalItemsCount}</div>
          </div>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
            <PackageIcon size={22} color="#3b82f6" />
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Available Stock</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>{availableStockQty}</div>
          </div>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
            <LayersIcon size={22} color="#16a34a" />
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Low Stock</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#d97706', marginTop: '4px' }}>{lowStockCount}</div>
          </div>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
            <AlertTriangleIcon size={22} color="#d97706" />
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Out of Stock</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#dc2626', marginTop: '4px' }}>{outOfStockCount}</div>
          </div>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }}>
            <AlertOctagonIcon size={22} color="#dc2626" />
          </div>
        </div>
      </div>

      <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
        {/* Filters Bar: Category, Item, Stock Status */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Search */}
            <div style={{ position: 'relative', width: '220px' }}>
              <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}>
                <SearchIcon size={14} />
              </span>
              <input
                type="text"
                placeholder="Search My Stock..."
                value={searchTerm}
                onKeyDown={preventSpaceInput}
                onChange={e => { setSearchTerm(e.target.value.replace(/\s/g, '')); setCurrentPage(0); }}
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
                {displayItems.map(i => (
                  <option key={i.id || i._id} value={i.name}>{i.name}</option>
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
          </div>
        </div>

        {/* Table: S.No, Item Name, Category, Unit, Current Stock, Minimum Stock, Stock Status, Actions */}
        <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', paddingBottom: '4px' }}>
          <table style={{ width: '100%', minWidth: '950px', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f95e10', color: '#ffffff' }}>
                <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap' }}>S.No</th>
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
                  <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                    No branch stock items found matching filters.
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item, index) => {
                  const currentStockVal = item.currentStock !== undefined ? item.currentStock : (item.branchStock || 0);
                  const minStockVal = item.minStock || 0;
                  const statusProps = getStockStatus(currentStockVal, minStockVal);
                  return (
                    <tr key={item.id || item._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: '#64748b' }}>
                        {currentPage * PAGE_SIZE + index + 1}
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 800, color: '#0f172a' }}>{item.name}</td>
                      <td style={{ padding: '14px 16px', color: '#475569' }}>{item.category}</td>
                      <td style={{ padding: '14px 16px', color: '#475569' }}>{item.unit}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 800, color: '#0f172a' }}>{currentStockVal}</td>
                      <td style={{ padding: '14px 16px', color: '#64748b' }}>{minStockVal}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          padding: '3px 10px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 700,
                          background: statusProps.bg,
                          color: statusProps.color
                        }}>
                          {statusProps.label}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => { setViewingItem(item); setAdjustQty(currentStockVal.toString()); }}
                          title="View / Adjust Stock"
                          style={{
                            ...actionIconBtnStyle,
                            background: '#eff6ff',
                            border: '1px solid #bfdbfe',
                            color: '#2563eb'
                          }}
                        >
                          <EyeIcon size={15} color="#2563eb" />
                        </button>
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
