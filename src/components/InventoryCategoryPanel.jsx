import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState, DEFAULT_INVENTORY_CATEGORIES } from '../config/AppContext';
import InventoryCategoryApi from '../api/InventoryCategory';
import { Modal } from './Modal';
import ShowNotifications from '../helper/ShowNotifications';

const PencilIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    <path d="m15 5 4 4" />
  </svg>
);

const EyeIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const TrashIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
);

const LayersIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
    <polyline points="2 17 12 22 22 17"></polyline>
    <polyline points="2 12 12 17 22 12"></polyline>
  </svg>
);

const SearchIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const RefreshIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
  </svg>
);

export default function InventoryCategoryPanel() {
  const navigate = useNavigate();
  const {
    activeRestaurant,
    selectedBranchId,
    addInventoryCategory,
    updateInventoryCategory,
    deleteInventoryCategory
  } = useAppState();

  const inventoryItems = activeRestaurant?.inventory || [];

  // API State
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // View and Form States
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'form'
  const [viewingCategory, setViewingCategory] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formStatus, setFormStatus] = useState('AVAILABLE');
  const [formErrors, setFormErrors] = useState({});

  // Fetch Categories from Backend API
  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (selectedBranchId && selectedBranchId !== 'ALL') {
        params.branchId = selectedBranchId;
      }
      const res = await InventoryCategoryApi.getCategories(params);
      if (res?.status) {
        const rawData = res.response?.data || res.response?.categories || res.response || [];
        const list = (Array.isArray(rawData) ? rawData : (Array.isArray(rawData?.data) ? rawData.data : [])).filter(item => !item?.isDelete);
        setCategories(list);
      } else {
        // Fallback to local default if API is unreachable
        if (categories.length === 0 && activeRestaurant?.inventoryCategories) {
          setCategories(activeRestaurant.inventoryCategories);
        }
      }
    } catch (error) {
      console.error("Failed to fetch inventory categories:", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedBranchId, activeRestaurant]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Client-side search and status filtering
  const filteredCategories = categories.filter(c => {
    const matchesSearch =
      (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'ALL' ||
      (c.status || 'AVAILABLE').toUpperCase() === statusFilter.toUpperCase();
    return matchesSearch && matchesStatus;
  });

  const getItemCountForCategory = (catName) => {
    return inventoryItems.filter(i => (i.category || '').toLowerCase() === (catName || '').toLowerCase()).length;
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormName('');
    setFormDesc('');
    setFormStatus('AVAILABLE');
    setFormErrors({});
    setViewMode('form');
  };

  const handleOpenEdit = (cat) => {
    setEditingItem(cat);
    setFormName(cat.name || '');
    setFormDesc(cat.description || '');
    setFormStatus(cat.status || 'AVAILABLE');
    setFormErrors({});
    setViewMode('form');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormErrors({ name: 'Category Name is required.' });
      return;
    }

    setIsSubmitting(true);
    const payload = {
      name: formName.trim(),
      description: formDesc.trim(),
      status: formStatus || 'AVAILABLE',
      branchId: selectedBranchId && selectedBranchId !== 'ALL' ? selectedBranchId : undefined
    };

    try {
      if (editingItem) {
        const catId = editingItem._id || editingItem.id;
        const res = await InventoryCategoryApi.updateCategory(catId, payload);
        if (res?.status) {
          await fetchCategories();
          if (updateInventoryCategory && activeRestaurant?.id) {
            updateInventoryCategory(activeRestaurant.id, catId, payload);
          }
          setViewMode('list');
          ShowNotifications.showAlertNotification('Category updated successfully!', true);
        }
      } else {
        const res = await InventoryCategoryApi.createCategory(payload);
        if (res?.status) {
          await fetchCategories();
          if (addInventoryCategory && activeRestaurant?.id) {
            addInventoryCategory(activeRestaurant.id, res.response?.data || payload);
          }
          setViewMode('list');
          ShowNotifications.showAlertNotification('New category added successfully!', true);
        }
      }
    } catch (err) {
      console.error("Save category error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (cat) => {
    const catId = cat._id || cat.id;
    const count = getItemCountForCategory(cat.name);
    const msg = count > 0
      ? `Are you sure you want to delete category "${cat.name}"? It is currently used by ${count} inventory item(s).`
      : `Are you sure you want to delete category "${cat.name}"?`;

    if (window.confirm(msg)) {
      const res = await InventoryCategoryApi.deleteCategory(catId);
      if (res?.status) {
        await fetchCategories();
        if (deleteInventoryCategory && activeRestaurant?.id) {
          deleteInventoryCategory(activeRestaurant.id, catId);
        }
      }
    }
  };

  const handleToggleStatus = async (cat) => {
    const catId = cat._id || cat.id;
    const nextStatus = (cat.status || 'AVAILABLE').toUpperCase() === 'AVAILABLE' ? 'UNAVAILABLE' : 'AVAILABLE';
    const res = await InventoryCategoryApi.updateCategory(catId, { status: nextStatus });
    if (res?.status) {
      setCategories(prev => prev.map(c => ((c._id === catId || c.id === catId) ? { ...c, status: nextStatus } : c)));
      if (updateInventoryCategory && activeRestaurant?.id) {
        updateInventoryCategory(activeRestaurant.id, catId, { status: nextStatus });
      }
    }
  };

  if (viewMode === 'form') {
    return (
      <section className="panel-view active" style={{ padding: '0 24px 24px 24px', width: '100%', boxSizing: 'border-box' }}>
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
              {editingItem ? 'Edit Inventory Category' : 'Add Inventory Category'}
            </h2>
            
          </div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '32px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', width: '100%', boxSizing: 'border-box' }}>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>
                Category Name <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="text"
                value={formName}
                onChange={e => {
                  setFormName(e.target.value);
                  if (formErrors.name) setFormErrors({ ...formErrors, name: '' });
                }}
                placeholder="e.g. Dairy, Spices, Grains, Vegetables..."
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: formErrors.name ? '1.5px solid #dc2626' : '1px solid #cbd5e1',
                  outline: 'none',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
              {formErrors.name && (
                <span style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                  {formErrors.name}
                </span>
              )}
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>
                Description
              </label>
              <textarea
                rows={4}
                value={formDesc}
                onChange={e => setFormDesc(e.target.value)}
                placeholder="Brief summary of items in this category..."
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  outline: 'none',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  resize: 'vertical'
                }}
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>
                Status
              </label>
              <select
                value={formStatus}
                onChange={e => setFormStatus(e.target.value)}
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  outline: 'none',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  background: '#ffffff'
                }}
              >
                <option value="AVAILABLE">AVAILABLE (Active)</option>
                <option value="UNAVAILABLE">UNAVAILABLE (Disabled)</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setViewMode('list')}
                className="btn btn-outline"
                style={{ padding: '10px 24px' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  padding: '10px 26px',
                  borderRadius: '8px',
                  border: 'none',
                  background: isSubmitting ? '#cbd5e1' : '#ff5a1f',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 6px rgba(255, 90, 31, 0.25)'
                }}
              >
                {isSubmitting ? 'Saving...' : (editingItem ? 'Save Changes' : 'Add Category')}
              </button>
            </div>
          </form>
        </div>
      </section>
    );
  }

  return (
    <section className="panel-view active" style={{ padding: '0 24px 24px 24px', width: '100%', boxSizing: 'border-box' }}>
      {/* 1. TOP HEADER */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        paddingTop: '8px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: 0, fontFamily: "'Outfit', sans-serif" }}>
                Inventory Categories
              </h2>
              <span style={{
                background: 'linear-gradient(135deg, #ff5a1f 0%, #ea580c 100%)',
                color: '#ffffff',
                fontSize: '10px',
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

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => navigate('/inventory')}
            style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              padding: '10px 18px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '700',
              color: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              transition: 'all 0.2s'
            }}
          >
            ← Back to Stock Items
          </button>

          <button
            type="button"
            onClick={fetchCategories}
            disabled={isLoading}
            title="Refresh list from server"
            style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '700',
              color: '#475569',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            <RefreshIcon size={14} color={isLoading ? '#94a3b8' : '#475569'} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            style={{
              background: '#ff5a1f',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '700',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(255, 90, 31, 0.25)',
              transition: 'all 0.2s'
            }}
          >
            + Add Category
          </button>
        </div>
      </div>

      {/* 2. SEARCH & FILTER BAR */}
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
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', flex: 1 }}>
          {/* Search Input */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            padding: '8px 12px',
            width: '320px',
            boxSizing: 'border-box'
          }}>
            <SearchIcon size={15} color="#64748b" />
            <input
              type="text"
              placeholder="Search inventory categories..."
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

          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>Status:</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
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
              <option value="ALL">All Statuses</option>
              <option value="AVAILABLE">Available (Active)</option>
              <option value="UNAVAILABLE">Unavailable (Disabled)</option>
            </select>
          </div>
        </div>

        <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>
          Showing {filteredCategories.length} Categories ({categories.length} Total)
        </div>
      </div>

      {/* 3. CATEGORIES TABLE */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
        padding: '20px',
        overflow: 'hidden'
      }}>
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#000000', borderBottom: '3px solid #ff5a1f' }}>
                <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '700', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', width: '70px' }}>
                  S.NO
                </th>
                <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '700', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  CATEGORY NAME
                </th>
                <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '700', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  DESCRIPTION
                </th>
                <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '700', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
                  STOCK ITEMS
                </th>
                <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '700', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  STATUS
                </th>
                <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '700', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="6" style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600 }}>Loading inventory categories...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b' }}>
                    <LayersIcon size={36} color="#cbd5e1" />
                    <p style={{ margin: '8px 0 0 0', fontWeight: 600, fontSize: '14px' }}>No categories found</p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>Try adjusting your search or click "+ Add Category" to create one.</p>
                  </td>
                </tr>
              ) : (
                filteredCategories.map((item, index) => {
                  const isAvailable = (item.status || 'AVAILABLE').toUpperCase() !== 'UNAVAILABLE';
                  const itemCount = getItemCountForCategory(item.name);
                  return (
                    <tr
                      key={item._id || item.id || index}
                      style={{
                        borderBottom: index < filteredCategories.length - 1 ? '1px solid #f1f5f9' : 'none',
                        transition: 'background 0.15s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '14px 20px', fontSize: '13px', fontWeight: '700', color: '#64748b' }}>
                        {index + 1}
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff5a1f' }}></span>
                          <span>{item.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: '13px', color: '#475569', maxWidth: '300px' }}>
                        {item.description || '—'}
                      </td>
                      <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                        <span style={{
                          background: '#f1f5f9',
                          color: '#0f172a',
                          fontSize: '12px',
                          fontWeight: 700,
                          padding: '4px 10px',
                          borderRadius: '12px'
                        }}>
                          {itemCount} {itemCount === 1 ? 'item' : 'items'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(item)}
                          title="Click to toggle status"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: '800',
                            letterSpacing: '0.4px',
                            background: isAvailable ? '#ecfdf5' : '#fef2f2',
                            color: isAvailable ? '#059669' : '#dc2626',
                            border: `1px solid ${isAvailable ? '#a7f3d0' : '#fecaca'}`,
                            cursor: 'pointer',
                            transition: 'all 0.15s'
                          }}
                        >
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isAvailable ? '#10b981' : '#ef4444' }}></span>
                          {isAvailable ? 'AVAILABLE' : 'UNAVAILABLE'}
                        </button>
                      </td>
                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                          <button
                            type="button"
                            onClick={() => setViewingCategory(item)}
                            title="View Category Details"
                            style={{
                              background: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              borderRadius: '6px',
                              padding: '6px 10px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              color: '#64748b',
                              transition: 'all 0.15s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
                            onMouseLeave={e => e.currentTarget.style.background = '#f8fafc'}
                          >
                            <EyeIcon size={14} color="#64748b" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            title="Edit Category"
                            style={{
                              background: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              borderRadius: '6px',
                              padding: '6px 10px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              color: '#0284c7',
                              transition: 'all 0.15s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#e0f2fe'}
                            onMouseLeave={e => e.currentTarget.style.background = '#f8fafc'}
                          >
                            <PencilIcon size={14} color="#0284c7" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            title="Delete Category"
                            style={{
                              background: '#fef2f2',
                              border: '1px solid #fecaca',
                              borderRadius: '6px',
                              padding: '6px 10px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              color: '#dc2626',
                              transition: 'all 0.15s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
                            onMouseLeave={e => e.currentTarget.style.background = '#fef2f2'}
                          >
                            <TrashIcon size={14} color="#dc2626" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. VIEW CATEGORY MODAL POPUP */}
      {viewingCategory && (
        <Modal
          isOpen={!!viewingCategory}
          onClose={() => setViewingCategory(null)}
          title="Inventory Category Details"
          maxWidth="460px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '8px' }}>
            <div>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Category Name</span>
              <h3 style={{ margin: '2px 0 0 0', fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                {viewingCategory.name}
              </h3>
            </div>

            <div>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Description</span>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#334155', lineHeight: '1.5' }}>
                {viewingCategory.description || 'No description provided.'}
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>Linked Stock Items:</span>
              <span style={{ fontWeight: 800, color: '#ff5a1f', fontSize: '14px' }}>
                {getItemCountForCategory(viewingCategory.name)} items
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>Status:</span>
              <span style={{
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: '700',
                backgroundColor: (viewingCategory.status || 'AVAILABLE').toUpperCase() === 'AVAILABLE' ? '#e6f4ea' : '#fef2f2',
                color: (viewingCategory.status || 'AVAILABLE').toUpperCase() === 'AVAILABLE' ? '#16a34a' : '#dc2626'
              }}>
                {(viewingCategory.status || 'AVAILABLE').toUpperCase()}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setViewingCategory(null)}
                style={{ padding: '8px 18px' }}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-black"
                onClick={() => {
                  const cat = viewingCategory;
                  setViewingCategory(null);
                  handleOpenEdit(cat);
                }}
                style={{ padding: '8px 18px', background: '#ff5a1f', borderColor: '#ff5a1f' }}
              >
                Edit Category
              </button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}
