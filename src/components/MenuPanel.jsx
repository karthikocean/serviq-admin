import React, { useState } from 'react';
import { useAppState } from '../config/AppContext';
import { Modal } from './Modal';
import CategoryListPanel from './CategoryListPanel';

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

export default function MenuPanel({
  menu = [],
  menuCategory = 'All Items',
  setMenuCategory,
  menuSearch = '',
  setMenuSearch,
  menuSort = 'name',
  setMenuSort,
  openAddMenuModal,
  openEditMenuModal,
  handleDeleteMenu,
  onOpenCategoriesPage,
  onOpenCategoryPanel,
  currency = '₹'
}) {
  const { activeRestaurant, updateMenuCategories } = useAppState();
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [showCategoryPanel, setShowCategoryPanel] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  const defaultCategories = ['Starters', 'Rice Meals', 'Tiffin', 'Rotis', 'Desserts', 'Drinks'];
  const storedCategories = activeRestaurant?.categories || defaultCategories;

  const uniqueCategories = Array.from(new Set(menu.map(item => item.category).filter(Boolean)));
  const combinedCategories = Array.from(new Set([...storedCategories, ...uniqueCategories]));
  const categoriesList = ['All Items', ...combinedCategories];

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
        categories={storedCategories}
        onBack={() => setShowCategoryPanel(false)}
        onUpdateCategories={(newCats) => {
          if (updateMenuCategories && activeRestaurant) {
            updateMenuCategories(activeRestaurant.id, newCats);
          }
        }}
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

  let filteredMenu = menu;
  if (menuCategory !== 'All Items') {
    filteredMenu = filteredMenu.filter(item => item.category === menuCategory);
  }
  if (menuSearch) {
    filteredMenu = filteredMenu.filter(item => item.name.toLowerCase().includes(menuSearch.toLowerCase()));
  }

  filteredMenu = [...filteredMenu].sort((a, b) => {
    if (menuSort === 'name') return a.name.localeCompare(b.name);
    if (menuSort === 'price-asc') return a.price - b.price;
    if (menuSort === 'price-desc') return b.price - a.price;
    return 0;
  });

  return (
    <section className="panel-view active">
      {/* Upper header section with title, subtitle, and action buttons */}
      <div className="settings-card" style={{ background: 'var(--bg-secondary)', borderRadius: '16px', padding: '24px', border: '1px solid var(--border)', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 className="panel-inner-title" style={{ margin: 0 }}>Menu List</h2>
            <p className="panel-inner-desc" style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
              • {menu.length} items actively listed
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
            onChange={(e) => setMenuSearch(e.target.value)}
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

      {/* FILTER PILLS AND SORT BY ROW */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        {/* Rounded Category pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {categoriesList.map(cat => {
            const isSelected = menuCategory === cat;
            const displayLabel = cat === 'All Items' ? 'All' : cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setMenuCategory(cat)}
                style={{
                  padding: '6px 16px',
                  borderRadius: '20px',
                  border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border)',
                  backgroundColor: isSelected ? 'var(--primary)' : 'var(--bg-secondary)',
                  color: isSelected ? '#ffffff' : 'var(--text-main)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isSelected ? '0 4px 12px rgba(255, 122, 0, 0.2)' : 'none'
                }}
              >
                {displayLabel}
              </button>
            );
          })}
        </div>

        {/* Sort Select */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Sort by</span>
          <select
            value={menuSort}
            onChange={(e) => setMenuSort(e.target.value)}
            style={{ 
              padding: '6px 12px', 
              fontSize: '12px', 
              borderRadius: '8px', 
              border: '1.5px solid var(--border)', 
              background: 'var(--bg-secondary)',
              fontWeight: 600,
              color: 'var(--text-main)'
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
        <table className="menu-items-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', tableLayout: 'fixed' }}>
          <thead>
            <tr>
              <th style={{ width: '5%', padding: '14px 16px' }}>S.NO</th>
              <th style={{ width: '7%', padding: '14px 16px' }}>IMAGE</th>
              <th style={{ width: '25%', padding: '14px 16px' }}>NAME</th>
              <th style={{ width: '15%', padding: '14px 16px' }}>CATEGORY</th>
              <th style={{ width: '10%', padding: '14px 16px', textAlign: 'right' }}>PRICE</th>
              <th style={{ width: '10%', padding: '14px 16px', textAlign: 'center' }}>PREP TIME</th>
              <th style={{ width: '10%', padding: '14px 16px', textAlign: 'center' }}>TYPE</th>
              <th style={{ width: '10%', padding: '14px 16px', textAlign: 'center' }}>STATUS</th>
              <th style={{ width: '8%', padding: '14px 16px', textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredMenu.map((item, index) => (
              <tr key={item._id || item.id} style={{ borderBottom: '1px solid #e2e8f0', height: '56px', transition: 'background-color 0.15s' }}>
                <td style={{ padding: '12px 16px', fontWeight: 800, fontSize: '12px', color: '#0f172a', fontFamily: 'monospace' }}>{index + 1}</td>
                {/* 1. Image */}
                <td style={{ padding: '12px 16px' }}>
                  {item.image ? (
                    <img
                      src={item.image}
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
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{item.name}</div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.desc || 'No description provided.'}
                  </div>
                </td>

                {/* 3. Category */}
                <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>{item.category}</td>

                {/* 4. Price */}
                <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 800, color: '#0f172a', textAlign: 'right' }}>{currency}{item.price}</td>

                {/* 5. Prep Time */}
                <td style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#64748b', textAlign: 'center' }}>15 mins</td>

                {/* 6. Type */}
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
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

                {/* 7. Status */}
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  <span style={{
                    display: 'inline-flex',
                    padding: '3px 8px',
                    borderRadius: '12px',
                    fontSize: '10px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    background: item.available ? '#e6f4ea' : '#f1f5f9',
                    color: item.available ? '#16a34a' : '#64748b'
                  }}>
                    {item.available ? 'AVAILABLE' : 'OUT OF STOCK'}
                  </span>
                </td>

                {/* 8. Actions */}
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
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
            ))}
            {filteredMenu.length === 0 && (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>No menu items found matching filters.</td>
              </tr>
            )}
          </tbody>
        </table>
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
