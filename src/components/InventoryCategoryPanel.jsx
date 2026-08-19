import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState, DEFAULT_INVENTORY_CATEGORIES } from '../config/AppContext';
import { Modal } from './Modal';
import ShowNotifications from '../helper/ShowNotifications';

const PencilIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    <path d="m15 5 4 4" />
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

export default function InventoryCategoryPanel() {
  const navigate = useNavigate();
  const {
    activeRestaurant,
    addInventoryCategory,
    updateInventoryCategory,
    deleteInventoryCategory
  } = useAppState();

  const categories = activeRestaurant?.inventoryCategories || DEFAULT_INVENTORY_CATEGORIES;
  const inventoryItems = activeRestaurant?.inventory || [];

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formStatus, setFormStatus] = useState('AVAILABLE');
  const [formErrors, setFormErrors] = useState({});

  const filteredCategories = categories.filter(c =>
    (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getItemCountForCategory = (catName) => {
    return inventoryItems.filter(i => (i.category || '').toLowerCase() === (catName || '').toLowerCase()).length;
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormName('');
    setFormDesc('');
    setFormStatus('AVAILABLE');
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingItem(cat);
    setFormName(cat.name || '');
    setFormDesc(cat.description || '');
    setFormStatus(cat.status || 'AVAILABLE');
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormErrors({ name: 'Category Name is required.' });
      return;
    }

    const payload = {
      name: formName.trim(),
      description: formDesc.trim(),
      status: formStatus
    };

    if (editingItem) {
      if (updateInventoryCategory && activeRestaurant?.id) {
        updateInventoryCategory(activeRestaurant.id, editingItem.id, payload);
        ShowNotifications.showAlertNotification(`Category "${formName.trim()}" updated successfully!`, true);
      }
    } else {
      if (addInventoryCategory && activeRestaurant?.id) {
        addInventoryCategory(activeRestaurant.id, payload);
        ShowNotifications.showAlertNotification(`Category "${formName.trim()}" added successfully!`, true);
      }
    }

    setIsModalOpen(false);
  };

  const handleDelete = (cat) => {
    const count = getItemCountForCategory(cat.name);
    const msg = count > 0
      ? `Are you sure you want to delete category "${cat.name}"? It is currently used by ${count} inventory item(s).`
      : `Are you sure you want to delete category "${cat.name}"?`;

    if (window.confirm(msg)) {
      if (deleteInventoryCategory && activeRestaurant?.id) {
        deleteInventoryCategory(activeRestaurant.id, cat.id);
        ShowNotifications.showAlertNotification(`Category "${cat.name}" deleted!`, true);
      }
    }
  };

  return (
    <section className="panel-view active" style={{ padding: '0 24px 24px 24px', width: '100%', boxSizing: 'border-box' }}>
      {/* 1. TOP HEADER & VIEW NAVIGATION TABS */}
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
                Inventory Management
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
                PREMIUM
              </span>
            </div>
          
          </div>

          {/* Module Sub-Navigation Switcher (Category vs Item Name vs Stock Reduction) */}
          <div style={{
            display: 'inline-flex',
            background: '#f1f5f9',
            padding: '4px',
            borderRadius: '10px',
            gap: '4px',
            marginLeft: '8px'
          }}>
            <button
              type="button"
              style={{
                border: 'none',
                padding: '7px 16px',
                borderRadius: '7px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                background: '#ffffff',
                color: '#0f172a',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
              }}
            >
              Category
            </button>
            <button
              type="button"
              onClick={() => navigate('/inventory')}
              style={{
                border: 'none',
                padding: '7px 16px',
                borderRadius: '7px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                background: 'transparent',
                color: '#64748b',
                transition: 'all 0.15s'
              }}
            >
              Item Name
            </button>
            <button
              type="button"
              onClick={() => navigate('/inventory/stock-reduction')}
              style={{
                border: 'none',
                padding: '7px 16px',
                borderRadius: '7px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                background: 'transparent',
                color: '#64748b',
                transition: 'all 0.15s'
              }}
            >
              Stock Reduction
            </button>
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

      {/* 2. SEARCH BAR */}
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        padding: '12px 18px',
        marginBottom: '18px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '12px'
      }}>
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

        <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>
          Showing {filteredCategories.length} Categories ({inventoryItems.length} Total Stock Items)
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
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b' }}>
                    <LayersIcon size={36} color="#cbd5e1" />
                    <p style={{ margin: '8px 0 0 0', fontWeight: 600, fontSize: '14px' }}>No categories found</p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>Try adjusting your search or add a new category.</p>
                  </td>
                </tr>
              ) : (
                filteredCategories.map((item, index) => {
                  const isAvailable = (item.status || 'AVAILABLE').toUpperCase() !== 'UNAVAILABLE';
                  const itemCount = getItemCountForCategory(item.name);
                  return (
                    <tr
                      key={item.id || index}
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
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '11px',
                          fontWeight: '800',
                          letterSpacing: '0.4px',
                          background: isAvailable ? '#ecfdf5' : '#fef2f2',
                          color: isAvailable ? '#059669' : '#dc2626'
                        }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isAvailable ? '#10b981' : '#ef4444' }}></span>
                          {isAvailable ? 'AVAILABLE' : 'UNAVAILABLE'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
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

      {/* 4. ADD / EDIT CATEGORY MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Inventory Category' : 'Add Inventory Category'}
      >
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '13px', color: '#0f172a' }}>
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
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: formErrors.name ? '1px solid #dc2626' : '1px solid #cbd5e1',
                outline: 'none',
                fontSize: '13px',
                boxSizing: 'border-box'
              }}
            />
            {formErrors.name && (
              <span style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                {formErrors.name}
              </span>
            )}
          </div>

          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '13px', color: '#0f172a' }}>
              Description
            </label>
            <textarea
              rows={3}
              value={formDesc}
              onChange={e => setFormDesc(e.target.value)}
              placeholder="Brief summary of items in this category..."
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                outline: 'none',
                fontSize: '13px',
                boxSizing: 'border-box',
                resize: 'vertical'
              }}
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '13px', color: '#0f172a' }}>
              Status
            </label>
            <select
              value={formStatus}
              onChange={e => setFormStatus(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                outline: 'none',
                fontSize: '13px',
                boxSizing: 'border-box',
                background: '#ffffff'
              }}
            >
              <option value="AVAILABLE">AVAILABLE (Active)</option>
              <option value="UNAVAILABLE">UNAVAILABLE (Disabled)</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              style={{
                padding: '9px 18px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#475569',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '9px 20px',
                borderRadius: '8px',
                border: 'none',
                background: '#ff5a1f',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(255, 90, 31, 0.25)'
              }}
            >
              {editingItem ? 'Save Changes' : 'Add Category'}
            </button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
