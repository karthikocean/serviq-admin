import React, { useState, useEffect, useCallback } from 'react';
import { SearchIcon, EyeIcon, ArrowLeftIcon, getStockStatus, filterInputStyle, PaginationBar } from './InventoryCommon';
import InventoryApi from '../../api/Inventory';

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

  const displayItems = itemsList.length > 0 ? itemsList : initialItems;

  const filteredItems = displayItems.filter(item => {
    const matchesSearch = !searchTerm.trim() || item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    const matchesItem = itemFilter === 'All' || item.name === itemFilter;

    const statusProps = getStockStatus(item.branchStock, item.minStock);
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
    <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
      {/* 3 Filters Bar: I) category, II) Item, III) Stock status */}
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
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(0); }}
              style={{ ...filterInputStyle, paddingLeft: '32px' }}
            />
          </div>

          {/* Filter I: Category */}
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

          {/* Filter II: Item */}
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

          {/* Filter III: Stock Status */}
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

      {/* Table --> Actions */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px' }}>
              <th style={{ padding: '12px 16px', fontWeight: 800 }}>Item ID</th>
              <th style={{ padding: '12px 16px', fontWeight: 800 }}>Item Name</th>
              <th style={{ padding: '12px 16px', fontWeight: 800 }}>Category</th>
              <th style={{ padding: '12px 16px', fontWeight: 800 }}>Branch Stock</th>
              <th style={{ padding: '12px 16px', fontWeight: 800 }}>Min Stock</th>
              <th style={{ padding: '12px 16px', fontWeight: 800 }}>Status</th>
              <th style={{ padding: '12px 16px', fontWeight: 800, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                  No branch stock items found matching filters.
                </td>
              </tr>
            ) : (
              paginatedItems.map((item, index) => {
                const statusProps = getStockStatus(item.branchStock, item.minStock);
                const codeDisplay = item.itemCode && !String(item.itemCode).match(/^[0-9a-fA-F]{24}$/) ? item.itemCode : `INV-${String(index + 1).padStart(3, '0')}`;
                return (
                  <tr key={item.id || item._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0f172a' }}>{codeDisplay}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 800, color: '#0f172a' }}>{item.name}</td>
                    <td style={{ padding: '14px 16px', color: '#475569' }}>{item.category}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 800, color: '#0f172a' }}>{item.branchStock} {item.unit}</td>
                    <td style={{ padding: '14px 16px', color: '#64748b' }}>{item.minStock} {item.unit}</td>
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
                        onClick={() => { setViewingItem(item); setAdjustQty(item.branchStock.toString()); }}
                        style={{
                          background: '#f1f5f9',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          color: '#0f172a',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <EyeIcon size={14} />
                        <span>View / Adjust</span>
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
  );
}
