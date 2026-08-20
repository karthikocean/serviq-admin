import React, { useState } from 'react';
import { useAppState } from '../config/AppContext';
import { Modal } from './Modal';
import CategoryListPanel from './CategoryListPanel';
import { server } from '../config/index.js';
import { StarIcon, ChefHatIcon, ClockIcon } from './Icons';

const PencilIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    <path d="m15 5 4 4" />
  </svg>
);

const TrashIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    <line x1="10" x2="10" y1="11" y2="17" />
    <line x1="14" x2="14" y1="11" y2="17" />
  </svg>
);

const PlateIcon = ({ size = 18, color = 'var(--text-muted)' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="2" x2="12" y2="22" />
  </svg>
);

const SettingsIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const PlusIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

import MenuApi from '../api/Menu.js';

export default function MenuPanel({
  categories = [],
  refreshCategories,
  openAddMenuModal,
  openEditMenuModal,
  handleDeleteMenu,
  onOpenCategoriesPage,
  onOpenCategoryPanel,
  currency = '₹',
  refreshTrigger
}) {
  const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${server}${path}`;
  };
  const { activeRestaurant, updateMenuCategories, selectedBranchId } = useAppState();
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [showCategoryPanel, setShowCategoryPanel] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  const [menuCategory, setMenuCategory] = useState('All Items');
  const [menuSearch, setMenuSearch] = useState('');
  const [menuSort, setMenuSort] = useState('name');

  const [paginatedMenu, setPaginatedMenu] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [totalPages, setTotalPages] = useState(1);

  React.useEffect(() => {
    fetchPaginatedMenu();
  }, [page, menuSearch, menuCategory, activeRestaurant, refreshTrigger, selectedBranchId]);

  const fetchPaginatedMenu = async () => {
    if (!activeRestaurant) return;
    const params = {
      page,
      limit,
      search: menuSearch || undefined,
      category: menuCategory === 'All Items' ? undefined : menuCategory,
    };
    if (selectedBranchId) {
      params.branchId = selectedBranchId;
    }
    const res = await MenuApi.getMenuItems(params);
    if (res?.status && res.response) {
      setPaginatedMenu(res.response.data || []);
      setTotalItems(res.response.total || 0);
      setTotalPages(res.response.totalPages || 1);
    }
  };

  const combinedCategories = categories;
  const categoriesList = ['All Items', ...combinedCategories.map(c => c._id)];

  const [editableCategories, setEditableCategories] = useState(combinedCategories);

  const handleOpenCategoriesModal = () => {
    if (onOpenCategoriesPage) {
      onOpenCategoriesPage();
    } else if (onOpenCategoryPanel) {
      onOpenCategoryPanel();
    } else {
      setShowCategoryPanel(true);
    }
  };

  if (showCategoryPanel) {
    return (
      <CategoryListPanel
        categories={categories}
        onBack={() => setShowCategoryPanel(false)}
        refreshCategories={refreshCategories}
        activeRestaurant={activeRestaurant}
      />
    );
  }


  const handleSaveCategories = () => {
    if (activeRestaurant) {
      updateMenuCategories(activeRestaurant.id, editableCategories);
    }
    setIsCategoryModalOpen(false);
  };

  return (
    <section className="panel-view active">
      {/* Upper header section with title, subtitle, and action buttons */}
      <div className="settings-card" style={{ background: 'var(--bg-secondary)', borderRadius: '16px', padding: '24px', border: '1px solid var(--border)', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 className="panel-inner-title" style={{ margin: 0 }}>Menu List</h2>
            <p className="panel-inner-desc" style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
              • {totalItems} items actively listed
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              className="btn btn-outline"
              style={{ padding: '8px 16px', fontSize: '13px', fontWeight: 600, border: '1.5px solid var(--border)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              onClick={handleOpenCategoriesModal}
            >
              <SettingsIcon size={14} />
              Manage Categories
            </button>
            <button
              type="button"
              className="btn btn-black"
              style={{ padding: '8px 20px', fontSize: '13px', fontWeight: 700, border: 'none', background: 'var(--primary)', color: 'white', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              onClick={openAddMenuModal}
            >
              <PlusIcon size={14} />
              Add Menu Item
            </button>
          </div>
        </div>

        {/* Row for Search input */}
        <div style={{ marginTop: '20px', maxWidth: '320px' }} className="menu-search-wrapper">
          <input
            type="text"
            placeholder="Search menu items..."
            value={menuSearch}
            onChange={(e) => {
              setMenuSearch(e.target.value);
              setPage(1);
            }}
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              fontSize: '13px',
              border: '1.5px solid var(--border)',
              borderRadius: '8px'
            }}
          />
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </span>
        </div>
      </div>

      {/* FILTER DROPDOWN AND SORT BY ROW */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        {/* Category Filter Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>Category:</label>
          <select
            value={menuCategory}
            onChange={(e) => {
              setMenuCategory(e.target.value);
              setPage(1); // Reset page on filter
            }}
            style={{
              padding: '8px 14px',
              fontSize: '13px',
              borderRadius: '8px',
              border: '1.5px solid var(--border)',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-main)',
              fontWeight: 600,
              cursor: 'pointer',
              minWidth: '180px',
              outline: 'none',
              transition: 'border-color 0.2s ease'
            }}
          >
            <option value="All Items">All Categories ({totalItems})</option>
            {combinedCategories.map(cat => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Select */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>Sort by:</label>
          <select
            value={menuSort}
            onChange={(e) => setMenuSort(e.target.value)}
            style={{
              padding: '8px 14px',
              fontSize: '13px',
              borderRadius: '8px',
              border: '1.5px solid var(--border)',
              backgroundColor: 'var(--bg-secondary)',
              fontWeight: 600,
              color: 'var(--text-main)',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="name">Name</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* SINGLE UNIFIED FULL-WIDTH TABLE LIST VIEW */}
      <div className="menu-table-wrapper" style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#ffffff', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <table className="menu-items-table" style={{ width: '100%', minWidth: '980px', borderCollapse: 'collapse', textAlign: 'left', tableLayout: 'fixed' }}>
          <thead>
            <tr>
              <th style={{ width: '4%', padding: '14px 12px' }}>S.NO</th>
              <th style={{ width: '6%', padding: '14px 12px' }}>IMAGE</th>
              <th style={{ width: '21%', padding: '14px 14px' }}>NAME</th>
              <th style={{ width: '12%', padding: '14px 12px' }}>CATEGORY</th>
              <th style={{ width: '10%', padding: '14px 12px', textAlign: 'right' }}>BASE PRICE</th>
              <th style={{ width: '11%', padding: '14px 12px', textAlign: 'center' }}>GST RATE</th>
              <th style={{ width: '13%', padding: '14px 12px', textAlign: 'right' }}>TOTAL (INCL. GST)</th>
              <th style={{ width: '8%', padding: '14px 10px', textAlign: 'center' }}>TYPE</th>
              <th style={{ width: '9%', padding: '14px 10px', textAlign: 'center' }}>STATUS</th>
              <th style={{ width: '6%', padding: '14px 12px', textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {paginatedMenu.map((item, index) => {
              const basePrice = Number(item.price) || 0;
              const gstRate = item.gst !== undefined ? Number(item.gst) : 5;
              const gstAmt = (basePrice * gstRate) / 100;
              const finalPrice = basePrice + gstAmt;

              return (
                <tr key={item._id || item.id} style={{ borderBottom: '1px solid #e2e8f0', height: '56px', transition: 'background-color 0.15s' }}>
                  <td style={{ padding: '12px 12px', fontWeight: 800, fontSize: '12px', color: '#0f172a', fontFamily: 'monospace' }}>{index + 1}</td>
                  {/* 1. Image */}
                  <td style={{ padding: '12px 12px' }}>
                    {item.image ? (
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.name}
                        style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover', display: 'block', border: '1px solid #e2e8f0' }}
                      />
                    ) : (
                      <div style={{ width: '40px', height: '40px', background: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <PlateIcon size={18} color="#64748b" />
                      </div>
                    )}
                  </td>

                  {/* 2. Name & description */}
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span>{item.name}</span>
                      {item.bestseller && (
                        <span style={{ background: '#fef3c7', color: '#b45309', fontSize: '9px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', border: '1px solid #fde68a', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <StarIcon size={10} color="#b45309" fill="#b45309" /> BESTSELLER
                        </span>
                      )}
                      {item.chefSpecial && (
                        <span style={{ background: '#f3e8ff', color: '#6d28d9', fontSize: '9px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', border: '1px solid #ddd6fe', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <ChefHatIcon size={11} color="#6d28d9" /> CHEF'S SPECIAL
                        </span>
                      )}
                      {item.prepTime && (
                        <span style={{ background: '#eff6ff', color: '#1d4ed8', fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', border: '1px solid #bfdbfe', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <ClockIcon size={10} color="#1d4ed8" /> {item.prepTime}m
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.desc || 'No description provided.'}
                    </div>
                  </td>

                  {/* 3. Category */}
                  <td style={{ padding: '12px 12px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                    {item.category?.name || item.category || 'Unknown'}
                  </td>

                  {/* 4. Base Price */}
                  <td style={{ padding: '12px 12px', fontSize: '13px', fontWeight: 700, color: '#0f172a', textAlign: 'right' }}>
                    {currency}{basePrice.toFixed(2)}
                  </td>

                  {/* 5. GST Rate */}
                  <td style={{ padding: '12px 12px', textAlign: 'center' }}>
                    <span style={{
                      background: '#fff7ed',
                      border: '1px solid #fed7aa',
                      color: '#c2410c',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 800
                    }}>
                      {gstRate}% GST
                    </span>
                    <div style={{ fontSize: '10px', color: '#9a3412', marginTop: '2px', fontWeight: 600 }}>
                      +₹{gstAmt.toFixed(2)}
                    </div>
                  </td>

                  {/* 6. Total with GST */}
                  <td style={{ padding: '12px 12px', textAlign: 'right' }}>
                    <div style={{ fontSize: '14px', fontWeight: 900, color: 'var(--primary)', fontFamily: "'Outfit', sans-serif" }}>
                      {currency}{finalPrice.toFixed(2)}
                    </div>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>incl. GST</div>
                  </td>

                  {/* 7. Type */}
                  <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-flex',
                      padding: '3px 8px',
                      borderRadius: '12px',
                      fontSize: '10px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      background: item.veg ? '#e6f4ea' : '#fce8e6',
                      color: item.veg ? '#16a34a' : '#ea4335'
                    }}>
                      {item.veg ? 'VEG' : 'NON-VEG'}
                    </span>
                  </td>

                  {/* 8. Status */}
                  <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-flex',
                      padding: '3px 8px',
                      borderRadius: '12px',
                      fontSize: '10px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      background: (item.available && (item.stockQuantity === undefined || item.stockQuantity > 0)) ? '#e6f4ea' : '#fee2e2',
                      color: (item.available && (item.stockQuantity === undefined || item.stockQuantity > 0)) ? '#16a34a' : '#b91c1c'
                    }}>
                      {(item.available && (item.stockQuantity === undefined || item.stockQuantity > 0)) ? 'AVAILABLE' : 'OUT OF STOCK'}
                    </span>
                  </td>

                  {/* 9. Actions */}
                  <td style={{ padding: '12px 12px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                      <button
                        type="button"
                        title="Edit Item"
                        style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center' }}
                        onClick={() => openEditMenuModal(item)}
                        onMouseEnter={e => e.currentTarget.style.color = '#0f172a'}
                        onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
                      >
                        <PencilIcon size={16} />
                      </button>
                      <button
                        type="button"
                        title="Delete Item"
                        style={{ background: 'transparent', border: 'none', color: '#ea4335', cursor: 'pointer', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center' }}
                        onClick={() => handleDeleteMenu(item._id || item.id)}
                        onMouseEnter={e => e.currentTarget.style.color = '#b91c1c'}
                        onMouseLeave={e => e.currentTarget.style.color = '#ea4335'}
                      >
                        <TrashIcon size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {paginatedMenu.length === 0 && (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>No menu items found matching filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', padding: '10px 20px', background: '#fff', borderRadius: '10px', border: '1px solid var(--border)' }}>
        <div style={{ fontSize: '13px', color: '#64748b' }}>
          Showing {(page - 1) * limit + (totalItems > 0 ? 1 : 0)} to {Math.min(page * limit, totalItems)} of {totalItems} entries
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{
              padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 600,
              border: '1px solid #e2e8f0', background: '#fff',
              color: page === 1 ? '#cbd5e1' : '#64748b', cursor: page === 1 ? 'not-allowed' : 'pointer'
            }}
          >
            Prev
          </button>
          
          <button
            style={{
              minWidth: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '6px', fontSize: '13px', fontWeight: 700,
              border: 'none', background: '#000', color: '#fff', cursor: 'default'
            }}
          >
            {page}
          </button>

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || totalPages === 0}
            style={{
              padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 600,
              border: '1px solid #e2e8f0', background: '#fff',
              color: page === totalPages || totalPages === 0 ? '#cbd5e1' : '#64748b', cursor: page === totalPages || totalPages === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            Next
          </button>
        </div>
      </div>

      {/* MANAGE CATEGORIES MODAL */}
      <Modal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} title="Manage Menu Categories">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px 0 0 0' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Add new category..."
              style={{ flex: 1, padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '8px' }}
            />
            <button
              className="btn btn-black"
              onClick={() => {
                if (newCategory.trim() && !editableCategories.includes(newCategory.trim())) {
                  setEditableCategories([...editableCategories, newCategory.trim()]);
                  setNewCategory('');
                }
              }}
              style={{ padding: '8px 16px', borderRadius: '8px' }}
            >
              Add
            </button>
          </div>

          <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '8px' }}>
            {editableCategories.length === 0 && (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No categories found.</div>
            )}
            {editableCategories.map((cat, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderBottom: idx < editableCategories.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{cat}</span>
                <button
                  onClick={() => setEditableCategories(editableCategories.filter(c => c !== cat))}
                  style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px' }}
                  title="Remove Category"
                >
                  <TrashIcon size={14} color="currentColor" />
                </button>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <button className="btn btn-outline" onClick={() => setIsCategoryModalOpen(false)} style={{ padding: '8px 16px' }}>Cancel</button>
            <button className="btn btn-black" onClick={handleSaveCategories} style={{ padding: '8px 16px' }}>Save Categories</button>
          </div>
        </div>
      </Modal>
    </section>
  );
}
