import React, { useState, useEffect, useCallback } from 'react';
import { PlusIcon, SearchIcon, PencilIcon, TrashIcon, filterInputStyle, formInputStyle, formLabelStyle, PaginationBar, preventSpaceInput, actionIconBtnStyle } from './InventoryCommon';
import InventoryApi from '../../api/Inventory';

export default function CompanyInventoryItems({ items: initialItems, onSaveItem, onDeleteItem, hasPermission }) {
  const canAdd = typeof hasPermission === 'function' ? hasPermission('inventory_items', 'add') : true;
  const canEdit = typeof hasPermission === 'function' ? hasPermission('inventory_items', 'edit') : true;
  const canDelete = typeof hasPermission === 'function' ? hasPermission('inventory_items', 'delete') : true;
  const [itemsList, setItemsList] = useState(initialItems || []);
  const [totalItemsCount, setTotalItemsCount] = useState(initialItems?.length || 0);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(0);

  // Form View State: null | 'ADD' | 'EDIT'
  const [viewState, setViewState] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [itemForm, setItemForm] = useState({
    name: '',
    category: 'Grains',
    unit: 'kg',
    minStock: '',
    isActive: true
  });
  const [itemErrors, setItemErrors] = useState({});

  const categories = ['All', 'Grains', 'Oils', 'Spices', 'Meat', 'Dairy', 'Vegetables', 'Beverages', 'Packaging'];

  const PAGE_SIZE = 10;

  // -------------------------------------------------------------
  // DYNAMIC API FETCH
  // -------------------------------------------------------------
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await InventoryApi.getItems({
        search: searchTerm,
        category: categoryFilter !== 'All' ? categoryFilter : undefined,
        page: currentPage,
        limit: PAGE_SIZE
      });

      if (res?.status && res?.response) {
        const payload = res.response.data || res.response.items || (Array.isArray(res.response) ? res.response : []);
        const formatted = (Array.isArray(payload) ? payload : []).map(i => ({
          id: i._id || i.id,
          _id: i._id || i.id,
          itemCode: i.itemCode || i.sku || `INV-${String(i._id || '').slice(-3).toUpperCase()}`,
          name: i.name || '',
          category: i.category || (typeof i.categoryId === 'object' ? i.categoryId?.name : i.categoryId) || 'Grains',
          unit: i.unit || 'kg',
          centralStock: i.currentStock !== undefined ? i.currentStock : (i.centralStock || 0),
          currentStock: i.currentStock !== undefined ? i.currentStock : (i.centralStock || 0),
          minAlertLevel: i.minAlertLevel !== undefined ? i.minAlertLevel : (i.minStock !== undefined ? i.minStock : 0),
          isActive: i.isActive !== undefined ? Boolean(i.isActive) : true
        }));
        setItemsList(formatted);

        if (res.response.totalCount !== undefined) {
          setTotalItemsCount(res.response.totalCount);
        } else if (res.response.total !== undefined) {
          setTotalItemsCount(res.response.total);
        } else if (res.response.totalDocs !== undefined) {
          setTotalItemsCount(res.response.totalDocs);
        } else {
          setTotalItemsCount(formatted.length);
        }
      } else {
        const fallback = Array.isArray(initialItems) ? initialItems : [];
        setItemsList(fallback);
        setTotalItemsCount(fallback.length);
      }
    } catch (err) {
      console.error('Fetch items error:', err);
      const fallback = Array.isArray(initialItems) ? initialItems : [];
      setItemsList(fallback);
      setTotalItemsCount(fallback.length);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, categoryFilter, currentPage, initialItems]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm, categoryFilter]);

  // Client-side fallback filter if API returns full unpaginated list
  const filteredItems = itemsList.filter(i => {
    const matchesSearch = !searchTerm.trim() || 
      i.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (i.itemCode && i.itemCode.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'All' || i.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const isServerPaginated = Boolean(totalItemsCount > 0 && itemsList.length <= PAGE_SIZE && totalItemsCount > itemsList.length);
  const effectiveTotal = isServerPaginated ? totalItemsCount : filteredItems.length;
  const totalPages = Math.max(1, Math.ceil(effectiveTotal / PAGE_SIZE));

  useEffect(() => {
    if (currentPage >= totalPages && totalPages > 0) {
      setCurrentPage(Math.max(0, totalPages - 1));
    }
  }, [totalPages, currentPage]);

  const paginatedItems = isServerPaginated 
    ? filteredItems 
    : filteredItems.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  // -------------------------------------------------------------
  // INPUT HANDLERS WITH STRICT VALIDATION
  // -------------------------------------------------------------
  // Item Name: Block numbers (digits 0-9)
  const handleNameChange = (e) => {
    const rawVal = e.target.value;
    const cleanedVal = rawVal.replace(/[0-9]/g, '');
    setItemForm(prev => ({ ...prev, name: cleanedVal }));

    if (rawVal !== cleanedVal) {
      setItemErrors(prev => ({ ...prev, name: 'Numbers are not allowed in Item Name' }));
    } else if (!cleanedVal.trim()) {
      setItemErrors(prev => ({ ...prev, name: 'Item Name is required' }));
    } else {
      setItemErrors(prev => ({ ...prev, name: '' }));
    }
  };

  // Min Stock Alert Level: Allow ONLY numbers
  const handleMinStockChange = (e) => {
    const rawVal = e.target.value;
    const cleanedVal = rawVal.replace(/[^0-9]/g, '');
    setItemForm(prev => ({ ...prev, minStock: cleanedVal }));

    if (!cleanedVal) {
      setItemErrors(prev => ({ ...prev, minStock: 'Minimum Stock Level is required' }));
    } else {
      setItemErrors(prev => ({ ...prev, minStock: '' }));
    }
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setItemForm({ name: '', category: 'Grains', unit: 'kg', minStock: '', isActive: true });
    setItemErrors({});
    setViewState('ADD');
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setItemForm({
      name: item.name ? item.name.replace(/[0-9]/g, '') : '',
      category: item.category || 'Grains',
      unit: item.unit || 'kg',
      minStock: item.minAlertLevel !== undefined && item.minAlertLevel !== null ? String(item.minAlertLevel) : '',
      isActive: item.isActive !== undefined ? Boolean(item.isActive) : true
    });
    setItemErrors({});
    setViewState('EDIT');
  };

  const validate = () => {
    const errors = {};

    // 1. Item Name validation (Required & No Numbers)
    if (!itemForm.name.trim()) {
      errors.name = 'Item Name is required';
    } else if (/\d/.test(itemForm.name)) {
      errors.name = 'Numbers are not allowed in Item Name';
    }

    // 2. Category validation
    if (!itemForm.category.trim()) {
      errors.category = 'Category is required';
    }

    // 3. Unit validation
    if (!itemForm.unit.trim()) {
      errors.unit = 'Unit is required';
    }

    // 4. Min Stock Alert Level validation (Text field, Only numbers allowed, Required)
    if (itemForm.minStock === '' || itemForm.minStock === null || itemForm.minStock === undefined) {
      errors.minStock = 'Minimum Stock Level is required';
    } else if (isNaN(Number(itemForm.minStock)) || Number(itemForm.minStock) < 0) {
      errors.minStock = 'Please enter a valid number for Minimum Stock Level';
    }

    setItemErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        name: itemForm.name.trim(),
        category: itemForm.category,
        unit: itemForm.unit,
        minAlertLevel: Number(itemForm.minStock),
        minStock: Number(itemForm.minStock),
        isActive: Boolean(itemForm.isActive)
      };

      let res;
      if (viewState === 'EDIT' && editingItem) {
        const itemId = editingItem._id || editingItem.id;
        res = await InventoryApi.updateItem(itemId, payload);
      } else {
        res = await InventoryApi.createItem(payload);
      }

      if (res?.status) {
        if (onSaveItem) {
          onSaveItem(itemForm, editingItem);
        }
        setViewState(null);
        await fetchItems();
      }
    } catch (err) {
      console.error('Submit item error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Are you sure you want to delete "${item.name}"?`)) return;

    try {
      const itemId = item._id || item.id;
      const res = await InventoryApi.deleteItem(itemId);
      if (res?.status) {
        if (onDeleteItem) {
          onDeleteItem(item);
        }
        await fetchItems();
      }
    } catch (err) {
      console.error('Delete item error:', err);
    }
  };

  // -------------------------------------------------------------
  // RENDER ADD / EDIT FORM VIEW
  // -------------------------------------------------------------
  if (viewState === 'ADD' || viewState === 'EDIT') {
    return (
      <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '32px 40px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        {/* Top Header */}
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
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
            >
              ←
            </button>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>
              {viewState === 'ADD' ? 'Add New Inventory Item' : `Edit Inventory Item: ${editingItem?.name}`}
            </h2>
          </div>
        </div>

        {/* Form Layout */}
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          {/* Row 1: Item Name & Category */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={formLabelStyle}>
                Item Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Basmati Rice (Letters only)"
                value={itemForm.name}
                onChange={handleNameChange}
                style={{ ...formInputStyle, borderColor: itemErrors.name ? '#ef4444' : '#cbd5e1' }}
              />
              {itemErrors.name ? (
                <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', display: 'block', fontWeight: 600 }}>
                  {itemErrors.name}
                </span>
              ) : (
                <span style={{ color: '#64748b', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                  Numbers are not allowed in Item Name.
                </span>
              )}
            </div>

            <div>
              <label style={formLabelStyle}>
                Category <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={itemForm.category}
                onChange={e => setItemForm({ ...itemForm, category: e.target.value })}
                style={{ ...formInputStyle }}
              >
                {categories.filter(c => c !== 'All').map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Unit of Measure & Min Stock Level */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={formLabelStyle}>
                Unit of Measure <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={itemForm.unit}
                onChange={e => setItemForm({ ...itemForm, unit: e.target.value })}
                style={{ ...formInputStyle }}
              >
                <option value="kg">kg (Kilogram)</option>
                <option value="Ltr">Ltr (Liter)</option>
                <option value="g">g (Gram)</option>
                <option value="pcs">pcs (Pieces)</option>
                <option value="pkt">pkt (Packets)</option>
                <option value="box">box (Boxes)</option>
              </select>
            </div>

            <div>
              <label style={formLabelStyle}>
                Min Stock Level <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="e.g. 50"
                value={itemForm.minStock}
                onChange={handleMinStockChange}
                style={{ ...formInputStyle, borderColor: itemErrors.minStock ? '#ef4444' : '#cbd5e1' }}
              />
              {itemErrors.minStock ? (
                <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', display: 'block', fontWeight: 600 }}>
                  {itemErrors.minStock}
                </span>
              ) : (
                <span style={{ color: '#64748b', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                  Numbers only allowed for Minimum Stock Level.
                </span>
              )}
            </div>
          </div>

          {/* Row 3: Status (isActive key) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>
            <div>
              <label style={formLabelStyle}>
                Status <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={itemForm.isActive ? 'true' : 'false'}
                onChange={e => setItemForm({ ...itemForm, isActive: e.target.value === 'true' })}
                style={{ ...formInputStyle }}
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <div></div>
          </div>

          {/* Action Buttons */}
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
                background: '#ff5a1f',
                color: '#ffffff',
                border: 'none',
                padding: '12px 32px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.7 : 1,
                boxShadow: '0 2px 8px rgba(255, 90, 31, 0.25)'
              }}
            >
              {isSubmitting ? 'Saving...' : (viewState === 'ADD' ? 'Save Inventory Item' : 'Update Item Details')}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER TABLE / LIST VIEW
  // -------------------------------------------------------------
  return (
    <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
      {/* Top Filter & Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '240px' }}>
            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}>
              <SearchIcon size={14} />
            </span>
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onKeyDown={preventSpaceInput}
              onChange={e => { setSearchTerm(e.target.value.replace(/\s/g, '')); setCurrentPage(0); }}
              style={{ ...filterInputStyle, paddingLeft: '32px' }}
            />
          </div>

          <div style={{ width: '160px' }}>
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
        </div>

        {canAdd && (
        <button
          type="button"
          onClick={handleOpenAdd}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#ff5a1f',
            color: '#ffffff',
            border: 'none',
            padding: '10px 18px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(255, 90, 31, 0.25)'
          }}
        >
          <PlusIcon size={15} />
          <span>Add Inventory Item</span>
        </button>
        )}
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', paddingBottom: '4px' }}>
        <table style={{ width: '100%', minWidth: '950px', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f95e10', color: '#ffffff' }}>
              <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap', width: '60px' }}>S.No</th>
              <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap' }}>Item Name</th>
              <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap' }}>Category</th>
              <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap' }}>Unit</th> 
              <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap' }}>Minimum Stock Level</th>
              <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap' }}>Status</th>
              <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: '#ff5a1f', fontWeight: 700 }}>
                  Loading inventory items...
                </td>
              </tr>
            ) : paginatedItems.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                  No inventory items found.
                </td>
              </tr>
            ) : (
              paginatedItems.map((item, index) => (
                <tr key={item._id || item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: '#64748b' }}>
                    {currentPage * PAGE_SIZE + index + 1}
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: 800, color: '#0f172a' }}>
                    <div>{item.name}</div>
                    {item.itemCode && (
                      <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500 }}>
                        {item.itemCode}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '14px 16px', color: '#475569' }}>{item.category}</td>
                  <td style={{ padding: '14px 16px', color: '#475569', fontWeight: 600 }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      background: '#f1f5f9',
                      borderRadius: '6px',
                      fontSize: '12px',
                      color: '#334155'
                    }}>
                      {item.unit}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0f172a' }}>{item.minAlertLevel} {item.unit}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '3px 10px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 700,
                      background: !item.isActive ? '#f1f5f9' : '#e6f4ea',
                      color: !item.isActive ? '#64748b' : '#16a34a'
                    }}>
                      {item.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      {canEdit && (
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(item)}
                        title="Edit Item"
                        style={{
                          ...actionIconBtnStyle,
                          background: '#eff6ff',
                          border: '1px solid #bfdbfe',
                          color: '#2563eb'
                        }}
                      >
                        <PencilIcon size={14} />
                      </button>
                      )}
                      {canDelete && (
                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        title="Delete Item"
                        style={{
                          ...actionIconBtnStyle,
                          background: '#fef2f2',
                          border: '1px solid #fecaca',
                          color: '#dc2626'
                        }}
                      >
                        <TrashIcon size={14} />
                      </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <PaginationBar
        currentPage={currentPage}
        totalItems={totalItemsCount || filteredItems.length}
        pageSize={PAGE_SIZE}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
