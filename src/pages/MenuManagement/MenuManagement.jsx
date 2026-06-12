import React, { useState } from 'react';
import { useAppState, DEFAULT_ROLES } from '../../config/AppContext';
import MenuPanel from '../../components/MenuPanel';
import './MenuManagement.css';

export default function MenuManagement() {
  const {
    currentUser,
    activeRestaurant,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem
  } = useAppState();

  const [activePage, setActivePage] = useState(null); // null | 'menu-form'
  const [menuForm, setMenuForm] = useState({ id: '', name: '', desc: '', price: '', category: 'Starters', image: '' });

  if (!activeRestaurant) return null;

  const { plan = 'Standard', menu = [] } = activeRestaurant;

  // Permission checks
  const role = currentUser?.role || 'Waiter';
  const hasPermission = (moduleName, action = 'view') => {
    if (role === 'Admin') return true;
    const rolesConfig = activeRestaurant.roles || DEFAULT_ROLES;
    const userRoleConfig = rolesConfig[role] || DEFAULT_ROLES[role] || { permissions: {} };
    const modulePermissions = userRoleConfig.permissions?.[moduleName] || {};
    return !!modulePermissions[action];
  };

  const openAddMenuModal = () => {
    if (!hasPermission('menu', 'add')) {
      alert('Action not allowed: You do not have permission to add menu items.');
      return;
    }
    setMenuForm({ id: '', name: '', desc: '', price: '', category: 'Starters', image: '' });
    setActivePage('menu-form');
  };

  const openEditMenuModal = (item) => {
    if (!hasPermission('menu', 'edit')) {
      alert('Action not allowed: You do not have permission to edit menu items.');
      return;
    }
    setMenuForm({
      id: item.id,
      name: item.name,
      desc: item.desc || '',
      price: item.price,
      category: item.category,
      image: item.image || ''
    });
    setActivePage('menu-form');
  };

  const handleDeleteMenu = (itemId) => {
    if (!hasPermission('menu', 'delete')) {
      alert('Action not allowed: You do not have permission to delete menu items.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      deleteMenuItem(activeRestaurant.id, itemId);
    }
  };

  const handleMenuSubmit = (e) => {
    e.preventDefault();
    const itemData = {
      name: menuForm.name,
      desc: menuForm.desc,
      price: parseFloat(menuForm.price),
      category: menuForm.category,
      image: menuForm.image,
      available: true,
      veg: true,
      bestseller: false
    };

    if (menuForm.id) {
      updateMenuItem(activeRestaurant.id, {
        ...itemData,
        id: menuForm.id
      });
      alert('Menu item updated successfully!');
    } else {
      const newId = 'menu-' + Math.floor(1000 + Math.random() * 9000);
      addMenuItem(activeRestaurant.id, {
        ...itemData,
        id: newId
      });
      alert('Menu item added successfully!');
    }
    setActivePage(null);
  };

  const sty = {
    pageInlineHeader: { display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '2px solid var(--primary-light)' },
    pageBackBtn: { background: '#fff', border: '1.5px solid var(--border)', borderRadius: '10px', width: '38px', height: '38px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '16px', transition: 'all 0.2s', flexShrink: 0 },
    pageCard: { background: '#fff', borderRadius: '16px', padding: '32px', border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' },
    formGrid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' },
  };

  const PageHeader = ({ title, subtitle }) => (
    <div style={sty.pageInlineHeader}>
      <button style={sty.pageBackBtn} onClick={() => setActivePage(null)}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'inherit'; }}
      >→</button>
      <div>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, fontFamily: "'Outfit', sans-serif" }}>{title}</h2>
        {subtitle && <span style={{ fontSize: '12px', color: '#64748b' }}>{subtitle}</span>}
      </div>
    </div>
  );

  return (
    <div style={{ width: '100%' }}>
      {activePage === 'menu-form' ? (
        <section>
          <div style={{ width: '100%' }}>
            <PageHeader
              title={menuForm.id ? 'Edit Menu Item' : 'Add New Menu Item'}
              subtitle={menuForm.id ? 'Modify menu item details' : 'Create a new dish for the menu'}
            />
            <div style={sty.pageCard}>
              <form onSubmit={handleMenuSubmit} style={{ width: '100%' }}>
                <div
                  className="menu-item-cover-banner"
                  onClick={() => document.getElementById('menu-item-image-file').click()}
                  style={{ cursor: 'pointer' }}
                >
                  {menuForm.image ? (
                    <>
                      <img src={menuForm.image} alt={menuForm.name} />
                      <div className="menu-item-cover-overlay">
                        <span>Change Cover Photo</span>
                      </div>
                    </>
                  ) : (
                    <div className="menu-item-cover-banner-placeholder">
                      <span className="text">Click to upload cover photo</span>
                    </div>
                  )}
                </div>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label>Item Name</label>
                  <input
                    type="text"
                    value={menuForm.name}
                    onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
                    required
                    placeholder="e.g. Chicken Biryani"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#000000' }}>Item Image</label>
                  <div
                    onClick={() => document.getElementById('menu-item-image-file').click()}
                    style={{
                      border: '2px dashed var(--border)',
                      borderRadius: '12px',
                      padding: '24px 20px',
                      textAlign: 'center',
                      background: '#f8fafc',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'var(--primary-light)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = '#f8fafc'; }}
                  >
                    <input
                      id="menu-item-image-file"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setMenuForm({ ...menuForm, image: reader.result });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      style={{ display: 'none' }}
                    />
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary)' }}>
                      {menuForm.image ? 'Change Selected Image' : 'Upload from folder'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                      Supports JPG, JPEG, PNG, GIF
                    </div>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label>Description</label>
                  <textarea
                    rows="3"
                    value={menuForm.desc}
                    onChange={(e) => setMenuForm({ ...menuForm, desc: e.target.value })}
                    placeholder="Item description..."
                  ></textarea>
                </div>

                <div style={sty.formGrid2}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Price (₹)</label>
                    <input
                      type="number"
                      value={menuForm.price}
                      onChange={(e) => setMenuForm({ ...menuForm, price: e.target.value })}
                      required
                      placeholder="320"
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Category</label>
                    <select
                      value={menuForm.category}
                      onChange={(e) => {
                        if (e.target.value === 'custom') {
                          const newCat = prompt('Enter new category name:');
                          if (newCat && newCat.trim()) {
                            setMenuForm({ ...menuForm, category: newCat.trim() });
                          }
                        } else {
                          setMenuForm({ ...menuForm, category: e.target.value });
                        }
                      }}
                      required
                    >
                      {Array.from(new Set([...['Starters', 'Rice Meals', 'Tiffin', 'Rotis', 'Desserts', 'Drinks'], ...menu.map(i => i.category).filter(Boolean)])).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                      <option value="custom">+ Add Custom Category...</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                  <button type="button" className="btn btn-outline" style={{ padding: '10px 24px' }} onClick={() => setActivePage(null)}>Cancel</button>
                  <button type="submit" className="btn btn-black" style={{ padding: '10px 24px' }}>Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        </section>
      ) : (
        <MenuPanel
          menu={menu}
          activeRestaurant={activeRestaurant}
          openAddMenuModal={openAddMenuModal}
          openEditMenuModal={openEditMenuModal}
          handleDeleteMenu={handleDeleteMenu}
          hasPermission={hasPermission}
        />
      )}
    </div>
  );
}
