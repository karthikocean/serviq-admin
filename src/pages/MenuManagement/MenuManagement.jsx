import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState, DEFAULT_ROLES } from '../../config/AppContext';
import MenuPanel from '../../components/MenuPanel';
import { Modal } from '../../components/Modal';
import ShowNotifications from '../../helper/ShowNotifications.js';
import './MenuManagement.css';

export default function MenuManagement() {
  const {
    currentUser,
    activeRestaurant,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem
  } = useAppState();

  const navigate = useNavigate();
  const [activePage, setActivePage] = useState(null); // null | 'menu-form'
  const [menuForm, setMenuForm] = useState({
    _id: '',
    name: '',
    desc: '',
    price: '',
    gst: 5,
    category: 'Starters',
    image: '',
    veg: true,
    available: true,
    bestseller: false
  });
  const [formErrors, setFormErrors] = useState({});
  const [showCustomCategoryModal, setShowCustomCategoryModal] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [customCategoryError, setCustomCategoryError] = useState('');
  const [previousCategory, setPreviousCategory] = useState('Starters');

  if (!activeRestaurant) return null;

  const { menu = [] } = activeRestaurant;

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
      ShowNotifications.showAlertNotification('Action not allowed: You do not have permission to add menu items.', false);
      return;
    }
    setMenuForm({
      _id: '',
      name: '',
      desc: '',
      price: '',
      gst: 5,
      category: 'Starters',
      image: '',
      veg: true,
      available: true,
      bestseller: false
    });
    setFormErrors({});
    setActivePage('menu-form');
  };

  const openEditMenuModal = (item) => {
    if (!hasPermission('menu', 'edit')) {
      ShowNotifications.showAlertNotification('Action not allowed: You do not have permission to edit menu items.', false);
      return;
    }
    setMenuForm({
      _id: item._id || item.id,
      name: item.name,
      desc: item.desc || '',
      price: item.price,
      gst: item.gst !== undefined ? item.gst : 5,
      category: item.category,
      image: item.image || '',
      veg: item.veg !== undefined ? item.veg : true,
      available: item.available !== undefined ? item.available : true,
      bestseller: item.bestseller !== undefined ? item.bestseller : false
    });
    setFormErrors({});
    setActivePage('menu-form');
  };

  const handleDeleteMenu = (itemId) => {
    if (!hasPermission('menu', 'delete')) {
      ShowNotifications.showAlertNotification('Action not allowed: You do not have permission to delete menu items.', false);
      return;
    }
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      deleteMenuItem(activeRestaurant.id, itemId);
    }
  };

  const validate = () => {
    const errors = {};
    if (!menuForm.name || !menuForm.name.trim()) {
      errors.name = 'Item Name is required.';
    }

    const priceNum = parseFloat(menuForm.price);
    if (menuForm.price === '' || isNaN(priceNum) || priceNum <= 0) {
      errors.price = 'Please enter a valid base price greater than 0.';
    }

    if (!menuForm.category) {
      errors.category = 'Please select a category.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleMenuSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const itemData = {
      name: menuForm.name.trim(),
      desc: menuForm.desc ? menuForm.desc.trim() : '',
      price: parseFloat(menuForm.price) || 0,
      gst: parseFloat(menuForm.gst) !== undefined ? parseFloat(menuForm.gst) : 5,
      category: menuForm.category,
      image: menuForm.image,
      available: menuForm.available,
      veg: menuForm.veg,
      bestseller: menuForm.bestseller
    };

    if (menuForm._id) {
      await updateMenuItem(activeRestaurant.id, menuForm._id, itemData);
      ShowNotifications.showAlertNotification(`Menu item "${itemData.name}" updated successfully.`, true);
    } else {
      await addMenuItem(activeRestaurant.id, itemData);
      ShowNotifications.showAlertNotification(`Menu item "${itemData.name}" created successfully.`, true);
    }
    setActivePage(null);
  };

  const sty = {
    pageInlineHeader: { display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '2px solid var(--primary-light)' },
    pageBackBtn: { background: '#fff', border: '1.5px solid var(--border)', borderRadius: '10px', width: '38px', height: '38px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '16px', transition: 'all 0.2s', flexShrink: 0 },
    pageCard: { background: '#fff', borderRadius: '16px', padding: '32px', border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' },
    formGrid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' },
    formGrid3: { display: 'grid', gridTemplateColumns: '1.2fr 1fr 1.2fr', gap: '14px', marginBottom: '16px' },
  };

  const PageHeader = ({ title = 'Menu Item', subtitle = '' }) => (
    <div style={sty.pageInlineHeader}>
      <button style={sty.pageBackBtn} onClick={() => setActivePage(null)}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'inherit'; }}
      >←</button>
      <div>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, fontFamily: "'Outfit', sans-serif" }}>{title}</h2>
        {subtitle && <span style={{ fontSize: '12px', color: '#64748b' }}>{subtitle}</span>}
      </div>
    </div>
  );

  const basePriceNum = parseFloat(menuForm.price) || 0;
  const gstRateNum = parseFloat(menuForm.gst) || 0;
  const gstAmount = (basePriceNum * gstRateNum) / 100;
  const totalCustomerPrice = basePriceNum + gstAmount;

  return (
    <div style={{ width: '100%' }}>
      {activePage === 'menu-form' ? (
        <section>
          <div style={{ width: '100%' }}>
            <PageHeader title={menuForm._id ? 'Edit Menu Item' : 'Add Menu Item'} />
            <div style={sty.pageCard}>
              <form onSubmit={handleMenuSubmit} noValidate style={{ width: '100%' }}>
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
                  <label>
                    Item Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={menuForm.name}
                    onChange={(e) => {
                      setMenuForm({ ...menuForm, name: e.target.value });
                      if (formErrors.name) setFormErrors({ ...formErrors, name: '' });
                    }}
                    placeholder="e.g. Chicken Biryani"
                    style={{
                      borderColor: formErrors.name ? '#ef4444' : undefined
                    }}
                  />
                  {formErrors.name && (
                    <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                      {formErrors.name}
                    </span>
                  )}
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

                {/* Price, GST, Category Grid */}
                <div style={sty.formGrid3}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#0f172a' }}>
                      Base Price (₹) <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={menuForm.price}
                      onChange={(e) => {
                        setMenuForm({ ...menuForm, price: e.target.value });
                        if (formErrors.price) setFormErrors({ ...formErrors, price: '' });
                      }}
                      placeholder="e.g. 180"
                      style={{
                        borderColor: formErrors.price ? '#ef4444' : undefined
                      }}
                    />
                    {formErrors.price && (
                      <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                        {formErrors.price}
                      </span>
                    )}
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#0f172a' }}>
                      GST Rate (%) <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <select
                      value={menuForm.gst}
                      onChange={(e) => setMenuForm({ ...menuForm, gst: parseFloat(e.target.value) || 0 })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px', background: '#fff', fontWeight: 600 }}
                    >
                      <option value="5">5% GST (Standard Food - CGST 2.5% + SGST 2.5%)</option>
                      <option value="12">12% GST (Packaged / Drinks)</option>
                      <option value="18">18% GST (AC / Premium Food Service)</option>
                      <option value="0">0% (GST Exempt)</option>
                      <option value="28">28% GST</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#0f172a' }}>
                      Category <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <select
                      value={menuForm.category}
                      onChange={(e) => {
                        if (e.target.value === 'custom') {
                          setPreviousCategory(menuForm.category || 'Starters');
                          setCustomCategoryInput('');
                          setCustomCategoryError('');
                          setShowCustomCategoryModal(true);
                        } else {
                          setMenuForm({ ...menuForm, category: e.target.value });
                        }
                      }}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px', background: '#fff', fontWeight: 600 }}
                    >
                      {Array.from(new Set([...['Starters', 'Rice Meals', 'Tiffin', 'Rotis', 'Desserts', 'Drinks'], ...menu.map(i => i.category).filter(Boolean)])).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                      <option value="custom">+ Add Custom Category...</option>
                    </select>
                  </div>
                </div>

                {/* GST & Final Price Live Summary Box */}
                {menuForm.price !== '' && !isNaN(parseFloat(menuForm.price)) && (
                  <div style={{
                    marginTop: '16px',
                    marginBottom: '16px',
                    padding: '14px 18px',
                    background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
                    border: '1.5px solid #fdba74',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                      <div>
                        <span style={{ fontSize: '11px', color: '#9a3412', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Base Price:</span>
                        <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>₹{basePriceNum.toFixed(2)}</div>
                      </div>
                      <div style={{ fontSize: '16px', color: '#ea580c', fontWeight: 900 }}>+</div>
                      <div>
                        <span style={{ fontSize: '11px', color: '#9a3412', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          GST ({menuForm.gst}%):
                        </span>
                        <div style={{ fontSize: '15px', fontWeight: 800, color: '#ea580c' }}>
                          ₹{gstAmount.toFixed(2)}
                          <span style={{ fontSize: '10px', color: '#9a3412', marginLeft: '6px', fontWeight: 600 }}>
                            (CGST {(gstRateNum / 2).toFixed(1)}% + SGST {(gstRateNum / 2).toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ background: '#ffffff', padding: '8px 16px', borderRadius: '10px', border: '1px solid #fed7aa', textAlign: 'right' }}>
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Customer Total Price:</span>
                      <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--primary)', fontFamily: "'Outfit', sans-serif" }}>
                        ₹{totalCustomerPrice.toFixed(2)}
                        <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', marginLeft: '4px' }}>incl. GST</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Dietary Type, Availability, Bestseller */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '16px', marginTop: '16px', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>Food Dietary Type</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => setMenuForm({ ...menuForm, veg: true })}
                        style={{
                          flex: 1,
                          padding: '8px 10px',
                          borderRadius: '8px',
                          border: menuForm.veg ? '1.5px solid #16a34a' : '1px solid #cbd5e1',
                          background: menuForm.veg ? '#dcfce7' : '#ffffff',
                          color: menuForm.veg ? '#166534' : '#64748b',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '5px'
                        }}
                      >
                        🟢 Veg
                      </button>
                      <button
                        type="button"
                        onClick={() => setMenuForm({ ...menuForm, veg: false })}
                        style={{
                          flex: 1,
                          padding: '8px 10px',
                          borderRadius: '8px',
                          border: !menuForm.veg ? '1.5px solid #ea4335' : '1px solid #cbd5e1',
                          background: !menuForm.veg ? '#fee2e2' : '#ffffff',
                          color: !menuForm.veg ? '#991b1b' : '#64748b',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '5px'
                        }}
                      >
                        🔴 Non-Veg
                      </button>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>Stock Availability</label>
                    <button
                      type="button"
                      onClick={() => setMenuForm({ ...menuForm, available: !menuForm.available })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: menuForm.available ? '1.5px solid #16a34a' : '1.5px solid #cbd5e1',
                        background: menuForm.available ? '#f0fdf4' : '#f8fafc',
                        color: menuForm.available ? '#166534' : '#64748b',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {menuForm.available ? '✓ In Stock (Available)' : '✕ Out of Stock'}
                    </button>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>Featured Tag</label>
                    <button
                      type="button"
                      onClick={() => setMenuForm({ ...menuForm, bestseller: !menuForm.bestseller })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: menuForm.bestseller ? '1.5px solid #f59e0b' : '1px solid #cbd5e1',
                        background: menuForm.bestseller ? '#fef3c7' : '#ffffff',
                        color: menuForm.bestseller ? '#b45309' : '#64748b',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {menuForm.bestseller ? '⭐ Bestseller Item' : 'Standard Item'}
                    </button>
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
          onOpenCategoriesPage={() => navigate('/menu/categories')}
        />
      )}

      <Modal
        isOpen={showCustomCategoryModal}
        onClose={() => {
          setShowCustomCategoryModal(false);
          setMenuForm({ ...menuForm, category: previousCategory });
        }}
        title="Add Custom Category"
        maxWidth="400px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '8px', color: '#000' }}>
              Enter new category name: <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              value={customCategoryInput}
              onChange={(e) => {
                setCustomCategoryInput(e.target.value);
                if (customCategoryError) setCustomCategoryError('');
              }}
              placeholder="e.g. Rice Platters"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: customCategoryError ? '1.5px solid #ef4444' : '1px solid var(--border)',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
              autoFocus
            />
            {customCategoryError && (
              <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                {customCategoryError}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <button
              type="button"
              className="btn btn-outline"
              style={{ padding: '8px 16px', fontSize: '13px' }}
              onClick={() => {
                setShowCustomCategoryModal(false);
                setMenuForm({ ...menuForm, category: previousCategory });
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-black"
              style={{ padding: '8px 16px', fontSize: '13px' }}
              onClick={() => {
                if (customCategoryInput.trim()) {
                  setMenuForm({ ...menuForm, category: customCategoryInput.trim() });
                  setShowCustomCategoryModal(false);
                } else {
                  setCustomCategoryError('Please enter a valid category name.');
                }
              }}
            >
              OK
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
