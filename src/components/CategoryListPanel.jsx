import React, { useState } from 'react';
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

const defaultCategoryData = [
  { id: 'cat-1', name: 'Starters', description: 'Appetizers and quick bites', status: 'AVAILABLE' },
  { id: 'cat-2', name: 'Rice Meals', description: 'Main course rice dishes', status: 'AVAILABLE' },
  { id: 'cat-3', name: 'Tiffin', description: 'South Indian tiffins', status: 'AVAILABLE' },
  { id: 'cat-4', name: 'Rotis', description: 'Indian breads', status: 'AVAILABLE' },
  { id: 'cat-5', name: 'Desserts', description: 'Sweets and ice creams', status: 'AVAILABLE' },
  { id: 'cat-6', name: 'Drinks', description: 'Beverages', status: 'AVAILABLE' }
];

export default function CategoryListPanel({
  categories = [],
  onBack,
  onUpdateCategories,
  activeRestaurant
}) {
  // Convert simple array or object array to standard items
  const initialItems = React.useMemo(() => {
    if (!categories || categories.length === 0) return defaultCategoryData;
    return categories.map((c, idx) => {
      if (typeof c === 'string') {
        const foundDef = defaultCategoryData.find(d => d.name.toLowerCase() === c.toLowerCase());
        return {
          id: `cat-${idx + 1}`,
          name: c,
          description: foundDef ? foundDef.description : 'Menu item category',
          status: 'AVAILABLE'
        };
      }
      return {
        id: c.id || `cat-${idx + 1}`,
        name: c.name || 'Category',
        description: c.description || 'Menu item category',
        status: c.status || 'AVAILABLE'
      };
    });
  }, [categories]);

  const [categoryItems, setCategoryItems] = useState(initialItems);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formStatus, setFormStatus] = useState('AVAILABLE');
  const [formErrors, setFormErrors] = useState({});

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormName('');
    setFormDesc('');
    setFormStatus('AVAILABLE');
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormDesc(item.description);
    setFormStatus(item.status || 'AVAILABLE');
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e?.preventDefault();
    if (!formName.trim()) {
      setFormErrors({ name: 'Category Name is required.' });
      return;
    }

    let updated;
    if (editingItem) {
      updated = categoryItems.map(item =>
        item.id === editingItem.id
          ? { ...item, name: formName.trim(), description: formDesc.trim(), status: formStatus }
          : item
      );
      ShowNotifications.showAlertNotification(`Category "${formName.trim()}" updated successfully!`, true);
    } else {
      const newItem = {
        id: `cat-${Date.now()}`,
        name: formName.trim(),
        description: formDesc.trim() || 'Menu item category',
        status: formStatus
      };
      updated = [...categoryItems, newItem];
      ShowNotifications.showAlertNotification(`Category "${formName.trim()}" added successfully!`, true);
    }

    setCategoryItems(updated);
    if (onUpdateCategories) {
      onUpdateCategories(updated);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete category "${name}"?`)) {
      const updated = categoryItems.filter(item => item.id !== id);
      setCategoryItems(updated);
      if (onUpdateCategories) {
        onUpdateCategories(updated);
      }
      ShowNotifications.showAlertNotification(`Category "${name}" deleted!`, true);
    }
  };

  return (
    <section className="panel-view active" style={{ padding: '0 24px 24px 24px' }}>
      {/* Top Header Row matching Reference Image */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        paddingTop: '8px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: 0, fontFamily: "'Outfit', sans-serif" }}>
            Menu Categories
          </h2>
        
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          {onBack && (
            <button 
              type="button"
              onClick={onBack}
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                padding: '10px 18px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '700',
                color: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
              onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
            >
              ← Back to Menu
            </button>
          )}
          
          <button 
            type="button"
            onClick={handleOpenAdd}
            style={{
              background: '#ff5a1f',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '700',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(255, 90, 31, 0.25)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#e04d16'}
            onMouseLeave={e => e.currentTarget.style.background = '#ff5a1f'}
          >
            Add Category
          </button>
        </div>
      </div>

      {/* Main White Card Container */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
        padding: '24px',
        overflow: 'hidden'
      }}>
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#000000', borderBottom: '3px solid #ff5a1f' }}>
                <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '700', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', width: '80px' }}>
                  S.NO
                </th>
                <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '700', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  CATEGORY NAME
                </th>
                <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '700', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  DESCRIPTION
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
              {categoryItems.map((item, index) => {
                const isAvailable = item.status?.toUpperCase() !== 'UNAVAILABLE';
                return (
                  <tr 
                    key={item.id || index}
                    style={{
                      borderBottom: index < categoryItems.length - 1 ? '1px solid #f1f5f9' : 'none',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
                  >
                    {/* S.NO */}
                    <td style={{ padding: '16px 20px', fontSize: '14px', color: '#64748b', fontWeight: '500' }}>
                      {index + 1}
                    </td>

                    {/* CATEGORY NAME */}
                    <td style={{ padding: '16px 20px', fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>
                      {item.name}
                    </td>

                    {/* DESCRIPTION */}
                    <td style={{ padding: '16px 20px', fontSize: '14px', color: '#64748b', fontWeight: '400' }}>
                      {item.description || 'No description'}
                    </td>

                    {/* STATUS */}
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '700',
                        backgroundColor: isAvailable ? '#e6f4ea' : '#fef2f2',
                        color: isAvailable ? '#16a34a' : '#dc2626',
                        letterSpacing: '0.5px'
                      }}>
                        {isAvailable ? 'AVAILABLE' : 'UNAVAILABLE'}
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button 
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#64748b',
                            cursor: 'pointer',
                            padding: '6px',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.15s'
                          }}
                          onMouseEnter={e => e.currentTarget.style.color = '#0f172a'}
                          onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
                          title="Edit Category"
                        >
                          <PencilIcon size={16} />
                        </button>
                        <button 
                          type="button"
                          onClick={() => handleDelete(item.id, item.name)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            padding: '6px',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.15s'
                          }}
                          onMouseEnter={e => e.currentTarget.style.color = '#b91c1c'}
                          onMouseLeave={e => e.currentTarget.style.color = '#ef4444'}
                          title="Delete Category"
                        >
                          <TrashIcon size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Category Modal Popup */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Category' : 'Add Category'}
        maxWidth="440px"
      >
        <form onSubmit={handleSave} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>
              Category Name <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input 
              type="text" 
              value={formName}
              onChange={e => {
                setFormName(e.target.value);
                if (formErrors.name) setFormErrors({ ...formErrors, name: '' });
              }}
              placeholder="e.g. Starters"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: formErrors.name ? '1.5px solid #ef4444' : '1px solid #e2e8f0',
                fontSize: '14px',
                color: '#0f172a',
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
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>
              Description
            </label>
            <textarea 
              rows="3"
              value={formDesc}
              onChange={e => setFormDesc(e.target.value)}
              placeholder="e.g. Appetizers and quick bites"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '14px',
                color: '#0f172a',
                outline: 'none',
                resize: 'vertical',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>
              Status
            </label>
            <select
              value={formStatus}
              onChange={e => setFormStatus(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '14px',
                color: '#0f172a',
                backgroundColor: '#ffffff',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            >
              <option value="AVAILABLE">AVAILABLE</option>
              <option value="UNAVAILABLE">UNAVAILABLE</option>
            </select>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            borderTop: '1px solid #f1f5f9',
            paddingTop: '16px',
            marginTop: '8px'
          }}>
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)}
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#0f172a',
                fontWeight: 700,
                borderRadius: '8px',
                padding: '10px 22px',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button 
              type="submit"
              style={{
                background: '#ff5a1f',
                border: 'none',
                color: '#ffffff',
                fontWeight: 700,
                borderRadius: '8px',
                padding: '10px 22px',
                fontSize: '13px',
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
