import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState, DEFAULT_ROLES } from '../../config/AppContext';
import MenuPanel from '../../components/MenuPanel';
import { Modal } from '../../components/Modal';
import ShowNotifications from '../../helper/ShowNotifications.js';
import MenuApi from '../../api/Menu.js';
import UploadApi from '../../api/Upload.js';
import { server } from '../../config/index.js';
import './MenuManagement.css';

export default function MenuManagement() {
  const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${server}${path}`;
  };
  const {
    currentUser,
    activeRestaurant,
    selectedBranchId,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem
  } = useAppState();

  const navigate = useNavigate();
  const [activePage, setActivePage] = useState(null); // null | 'menu-form'
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [menuForm, setMenuForm] = useState({
    _id: '',
    name: '',
    desc: '',
    price: '',
    gst: 5,
    category: '',
    image: '',
    coverImage: '',
    veg: true,
    available: true,
    bestseller: false,
    branchId: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [showCustomCategoryModal, setShowCustomCategoryModal] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [customCategoryError, setCustomCategoryError] = useState('');
  const [previousCategory, setPreviousCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  React.useEffect(() => {
    fetchCategories();
    fetchMenuItems();
  }, [activeRestaurant, selectedBranchId, refreshTrigger]);

  const fetchMenuItems = async () => {
    const params = {};
    if (selectedBranchId) {
      params.branchId = selectedBranchId;
    } else {
      params.branchId = 'all';
    }

    const res = await MenuApi.getMenuItems(params);
    if (res?.status && res.response) {
      if (res.response.data && res.response.data.items) {
        setMenuItems(res.response.data.items);
      } else {
        const arr = Array.isArray(res.response.data) ? res.response.data : (Array.isArray(res.response) ? res.response : []);
        setMenuItems(arr);
      }
    }
  };

  const fetchCategories = async () => {
    const params = selectedBranchId ? { branchId: selectedBranchId } : {};
    const res = await MenuApi.getCategories(params);
    if (res?.status && res.response) {
      const catArray = Array.isArray(res.response.data) ? res.response.data : (Array.isArray(res.response) ? res.response : []);
      setCategories(catArray);
      if (catArray.length > 0 && !menuForm.category) {
        setMenuForm(prev => ({ ...prev, category: catArray[0]._id }));
      }
    }
  };

  if (!activeRestaurant) return null;

  const menu = menuItems;

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
    setMenuForm({
      _id: '',
      name: '',
      desc: '',
      price: '',
      gst: 5,
      category: categories.length > 0 ? categories[0]._id : '',
      image: '',
      coverImage: '',
      veg: true,
      available: true,
      bestseller: false,
      branchId: selectedBranchId || (activeRestaurant.branches?.length > 0 ? activeRestaurant.branches[0]._id : '')
    });
    setFormErrors({});
    setActivePage('menu-form');
  };

  const openEditMenuModal = (item) => {

    setMenuForm({
      _id: item._id || item.id,
      name: item.name,
      desc: item.desc || '',
      price: item.price,
      gst: item.gst !== undefined ? item.gst : 5,
      category: item.category?._id || item.category || '',
      image: item.image || '',
      coverImage: item.coverImage || '',
      veg: item.veg !== undefined ? item.veg : true,
      available: item.available !== undefined ? item.available : true,
      bestseller: item.bestseller !== undefined ? item.bestseller : false,
      branchId: item.branchId || selectedBranchId
    });
    setFormErrors({});
    setActivePage('menu-form');
  };

  const handleDeleteMenu = async (itemId) => {

    if (window.confirm('Are you sure you want to delete this menu item?')) {
      await deleteMenuItem(activeRestaurant.id, itemId);
      setRefreshTrigger(prev => prev + 1);
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
      coverImage: menuForm.coverImage,
      available: menuForm.available,
      veg: menuForm.veg,
      bestseller: menuForm.bestseller,
      branchId: menuForm.branchId
    };

    if (menuForm._id) {
      await updateMenuItem(activeRestaurant.id, menuForm._id, itemData);
      ShowNotifications.showAlertNotification(`Menu item "${itemData.name}" updated successfully.`, true);
    } else {
      await addMenuItem(activeRestaurant.id, itemData);
      ShowNotifications.showAlertNotification(`Menu item "${itemData.name}" created successfully.`, true);
    }
    setRefreshTrigger(prev => prev + 1);
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
                {/* --- TOP: COVER PHOTO BANNER --- */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>Cover Photo (Banner)</label>
                  <div
                    onClick={() => document.getElementById('menu-item-cover-file').click()}
                    style={{
                      cursor: 'pointer',
                      position: 'relative',
                      width: '100%',
                      height: '140px',
                      background: '#f8fafc',
                      borderRadius: '16px',
                      border: '2px dashed #cbd5e1',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = '#fff7ed'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = '#f8fafc'; }}
                  >
                    <input
                      id="menu-item-cover-file"
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setIsUploadingCover(true);
                          const res = await UploadApi.uploadImage(file);
                          setIsUploadingCover(false);
                          if (res?.status && res.response?.data?.url) {
                            setMenuForm({ ...menuForm, coverImage: res.response.data.url });
                          }
                        }
                      }}
                      style={{ display: 'none' }}
                    />
                    {isUploadingCover ? (
                      <div style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '14px' }}>Uploading...</div>
                    ) : menuForm.coverImage ? (
                      <>
                        <img src={getImageUrl(menuForm.coverImage)} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.5)', padding: '6px', textAlign: 'center', color: '#fff', fontSize: '12px', fontWeight: 600, backdropFilter: 'blur(2px)' }}>
                          Click to Change Cover Photo
                        </div>
                      </>
                    ) : (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#64748b' }}>Upload Cover Photo</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Landscape recommended (e.g. 1200x400)</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* --- MIDDLE: ITEM IMAGE + NAME/DESC --- */}
                <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap' }}>

                  {/* Left: Item Square Image */}
                  <div style={{ flexShrink: 0 }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>Item Image</label>
                    <div
                      onClick={() => document.getElementById('menu-item-image-file').click()}
                      style={{
                        width: '160px',
                        height: '160px',
                        border: '2px dashed #cbd5e1',
                        borderRadius: '16px',
                        background: '#f8fafc',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        position: 'relative',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = '#fff7ed'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = '#f8fafc'; }}
                    >
                      <input
                        id="menu-item-image-file"
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setIsUploadingImage(true);
                            const res = await UploadApi.uploadImage(file);
                            setIsUploadingImage(false);
                            if (res?.status && res.response?.data?.url) {
                              setMenuForm({ ...menuForm, image: res.response.data.url });
                            }
                          }
                        }}
                        style={{ display: 'none' }}
                      />
                      {isUploadingImage ? (
                        <div style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '13px' }}>Uploading...</div>
                      ) : menuForm.image ? (
                        <>
                          <img src={getImageUrl(menuForm.image)} alt="Item" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.5)', padding: '4px', textAlign: 'center', color: '#fff', fontSize: '11px', fontWeight: 600, backdropFilter: 'blur(2px)' }}>
                            Change Image
                          </div>
                        </>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '10px' }}>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Upload Image</div>
                          <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>Square aspect ratio</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Name & Description */}
                  <div style={{ flex: 1, minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>
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
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: formErrors.name ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                          fontSize: '14px',
                          outline: 'none',
                          transition: 'border-color 0.2s'
                        }}
                        onFocus={e => { if (!formErrors.name) e.currentTarget.style.borderColor = 'var(--primary)'; }}
                        onBlur={e => { if (!formErrors.name) e.currentTarget.style.borderColor = '#cbd5e1'; }}
                      />
                      {formErrors.name && (
                        <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                          {formErrors.name}
                        </span>
                      )}
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>
                        Description
                      </label>
                      <textarea
                        rows="3"
                        value={menuForm.desc}
                        onChange={(e) => setMenuForm({ ...menuForm, desc: e.target.value })}
                        placeholder="Briefly describe the item (ingredients, flavor, size)..."
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '14px',
                          outline: 'none',
                          resize: 'vertical',
                          minHeight: '86px',
                          transition: 'border-color 0.2s'
                        }}
                        onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                        onBlur={e => e.currentTarget.style.borderColor = '#cbd5e1'}
                      ></textarea>
                    </div>
                  </div>
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

                  {(currentUser?.role === 'Admin' || currentUser?.role === 'RESTAURANT_OWNER' || currentUser?.userType === 'RESTAURANT_OWNER') && activeRestaurant.branches?.length > 0 && (
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#0f172a' }}>
                        Branch <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <select
                        value={menuForm.branchId}
                        onChange={(e) => setMenuForm({ ...menuForm, branchId: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px', background: '#fff', fontWeight: 600 }}
                      >
                        {activeRestaurant.branches.map(b => (
                          <option key={b.id} value={b.id}>{b.branchName}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#0f172a' }}>
                      Category <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <select
                      value={menuForm.category}
                      onChange={(e) => {
                        if (e.target.value === 'custom') {
                          setPreviousCategory(menuForm.category || (categories[0] ? categories[0]._id : ''));
                          setCustomCategoryInput('');
                          setCustomCategoryError('');
                          setShowCustomCategoryModal(true);
                        } else {
                          setMenuForm({ ...menuForm, category: e.target.value });
                        }
                      }}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px', background: '#fff', fontWeight: 600 }}
                    >
                      {categories.map(cat => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
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
                  <button type="submit" className="btn btn-black" style={{ padding: '10px 24px' }}>Add item </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      ) : (
        <MenuPanel
          menu={menu}
          categories={categories}
          refreshCategories={fetchCategories}
          refreshTrigger={refreshTrigger}
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
