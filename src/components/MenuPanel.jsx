import React, { useState } from 'react';
import { useAppState } from '../config/AppContext';
import { Modal } from './Modal';
import CategoryListPanel from './CategoryListPanel';
import { server } from '../config/index.js';

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

const EyeIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
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
  const [viewingMenuItem, setViewingMenuItem] = useState(null);

  const [menuCategory, setMenuCategory] = useState('All Items');
  const [menuSearch, setMenuSearch] = useState('');
  const [menuSort, setMenuSort] = useState('name');

  const [paginatedMenu, setPaginatedMenu] = useState([]);
  const [liveCategories, setLiveCategories] = useState(Array.isArray(categories) ? categories : []);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [totalPages, setTotalPages] = useState(1);

  const activeCategoryList = liveCategories.length > 0 ? liveCategories : (Array.isArray(categories) ? categories : []);
  const combinedCategories = activeCategoryList.filter(c => c.status !== 'UNAVAILABLE' && c.status !== 'Inactive' && c.status !== 'Disabled' && c.status !== false && !c.isDelete);
  const categoriesList = ['All Items', ...combinedCategories.map(c => c._id || c.id)];

  const [editableCategories, setEditableCategories] = useState(combinedCategories);

  const fetchLiveCategories = React.useCallback(async () => {
    if (!activeRestaurant) return;
    try {
      const params = { limit: 1000 };
      if (selectedBranchId && selectedBranchId !== 'ALL') {
        params.branchId = selectedBranchId;
      } else {
        params.branchId = 'all';
      }
      const res = await MenuApi.getCategories(params);
      if (res?.status && res.response) {
        const catArray = Array.isArray(res.response.data)
          ? res.response.data
          : (Array.isArray(res.response.data?.items)
              ? res.response.data.items
              : (Array.isArray(res.response) ? res.response : (Array.isArray(res.response.categories) ? res.response.categories : [])));
        const cleanList = catArray.filter(c => !c?.isDelete);
        setLiveCategories(cleanList);
      } else if (Array.isArray(categories) && categories.length > 0) {
        setLiveCategories(categories);
      }
    } catch (err) {
      console.error("Failed to fetch menu categories:", err);
      if (Array.isArray(categories) && categories.length > 0) {
        setLiveCategories(categories);
      }
    }
  }, [activeRestaurant, selectedBranchId, categories]);

  React.useEffect(() => {
    fetchLiveCategories();
  }, [fetchLiveCategories, refreshTrigger]);

  React.useEffect(() => {
    fetchPaginatedMenu();
  }, [page, menuSearch, menuCategory, activeRestaurant, refreshTrigger, selectedBranchId, liveCategories]);

  const fetchPaginatedMenu = async () => {
    if (!activeRestaurant) return;
    const trimmed = (menuSearch || '').trim();

    // Check if the search term matches any category name
    const matchedCategory = combinedCategories.find(c =>
      (c.name || '').toLowerCase().includes(trimmed.toLowerCase())
    );

    const params = {
      page,
      limit,
      search: trimmed || undefined,
    };

    if (matchedCategory && trimmed.length > 0) {
      params.categoryId = matchedCategory._id || matchedCategory.id;
    }

    if (selectedBranchId && selectedBranchId !== 'ALL') {
      params.branchId = selectedBranchId;
    }
    const res = await MenuApi.getMenuItems(params);
    if (res?.status && res.response) {
      if (res.response.data && res.response.data.items) {
        setPaginatedMenu(res.response.data.items);
        setTotalItems(res.response.data.total || 0);
        setTotalPages(Math.ceil((res.response.data.total || 0) / limit) || 1);
      } else {
        const arr = Array.isArray(res.response.data) ? res.response.data : (Array.isArray(res.response) ? res.response : []);
        setPaginatedMenu(arr);
        setTotalItems(res.response.total || arr.length);
        setTotalPages(res.response.totalPages || Math.ceil(arr.length / limit) || 1);
      }
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

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
            placeholder="Search menu items or categories..."
            value={menuSearch}
            onKeyDown={(e) => {
              if (e.key === ' ' && !e.currentTarget.value) {
                e.preventDefault();
              }
            }}
            onChange={(e) => {
              const val = e.target.value.replace(/^\s+/, '');
              setMenuSearch(val);
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

      {/* SINGLE UNIFIED FULL-WIDTH TABLE LIST VIEW */}
      <div className="menu-table-wrapper" style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#ffffff', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <table className="menu-items-table" style={{ width: '100%', minWidth: '1300px', borderCollapse: 'collapse', textAlign: 'left', tableLayout: 'fixed' }}>
          <thead>
            <tr>
              <th className="sticky-col-1" style={{ padding: '14px 12px' }}>S.NO</th>
              <th className="sticky-col-2" style={{ padding: '14px 12px' }}>IMAGE</th>
              <th className="sticky-col-3" style={{ padding: '14px 14px' }}>NAME</th>
              <th style={{ width: '150px', padding: '14px 12px' }}>CATEGORY</th>
              <th style={{ width: '120px', padding: '14px 12px', textAlign: 'right' }}>BASE PRICE</th>
              <th style={{ width: '130px', padding: '14px 12px', textAlign: 'center' }}>GST RATE</th>
              <th style={{ width: '160px', padding: '14px 12px', textAlign: 'right' }}>TOTAL (INCL. GST)</th>
              <th style={{ width: '100px', padding: '14px 10px', textAlign: 'center' }}>TYPE</th>
              <th style={{ width: '120px', padding: '14px 10px', textAlign: 'center' }}>STATUS</th>
              <th className="sticky-col-action" style={{ padding: '14px 12px' }}>ACTIONS</th>
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
                  <td className="sticky-col-1" style={{ padding: '12px 12px', fontWeight: 800, fontSize: '12px', color: '#0f172a', fontFamily: 'monospace' }}>
                    {(page - 1) * limit + index + 1}
                  </td>
                  {/* 1. Image */}
                  <td className="sticky-col-2" style={{ padding: '12px 12px' }}>
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
                  <td className="sticky-col-3" style={{ padding: '12px 14px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>{item.name}</span>
                      {item.bestseller && (
                        <span style={{ background: '#fef3c7', color: '#b45309', fontSize: '9px', fontWeight: 800, padding: '1px 5px', borderRadius: '4px' }}>
                          ★ BESTSELLER
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.desc || 'No description provided.'}
                    </div>
                  </td>

                  {/* 3. Category */}
                  <td style={{ padding: '12px 12px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                    {(() => {
                      if (item.category && typeof item.category === 'object') {
                        return item.category.name || item.category.categoryName || 'General';
                      }
                      const foundCat = combinedCategories.find(c => (c._id === item.category || c.id === item.category));
                      if (foundCat) return foundCat.name;
                      return item.category || 'General';
                    })()}
                  </td>

                  {/* 4. Base Price */}
                  <td style={{ padding: '12px 12px', fontSize: '13px', fontWeight: 700, color: '#0f172a', textAlign: 'right' }}>
                    {currency}{basePrice.toFixed(2)}
                  </td>

                  {/* 5. GST Rate */}
                  <td style={{ padding: '12px 12px', textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-block',
                      background: '#fff7ed',
                      border: '1px solid #fed7aa',
                      color: '#c2410c',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 800,
                      marginBottom: '4px'
                    }}>
                      {gstRate}% GST
                    </span>
                    <div style={{ fontSize: '10px', color: '#9a3412', fontWeight: 600 }}>
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
                      background: item.available ? '#e6f4ea' : '#f1f5f9',
                      color: item.available ? '#16a34a' : '#64748b'
                    }}>
                      {item.available ? 'AVAILABLE' : 'OUT OF STOCK'}
                    </span>
                  </td>

                  {/* 9. Actions */}
                  <td className="sticky-col-action" style={{ padding: '12px 12px' }}>
                    <div style={{ display: 'inline-flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                      <button
                        type="button"
                        title="View Details"
                        style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center' }}
                        onClick={() => setViewingMenuItem(item)}
                        onMouseEnter={e => e.currentTarget.style.color = '#0f172a'}
                        onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
                      >
                        <EyeIcon size={16} />
                      </button>
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
          Showing {totalItems === 0 ? 0 : (page - 1) * limit + 1} to {Math.min(page * limit, totalItems)} of {totalItems} entries
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{
              padding: '6px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
              border: '1px solid #e2e8f0', background: page === 1 ? '#f8fafc' : '#ffffff',
              color: page === 1 ? '#cbd5e1' : '#334155', cursor: page === 1 ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Prev
          </button>

          {getPageNumbers().map(pageNum => (
            <button
              key={pageNum}
              type="button"
              onClick={() => setPage(pageNum)}
              style={{
                minWidth: '32px',
                height: '32px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: page === pageNum ? 700 : 500,
                border: page === pageNum ? 'none' : '1px solid #e2e8f0',
                background: page === pageNum ? '#000000' : '#ffffff',
                color: page === pageNum ? '#ffffff' : '#334155',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {pageNum}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || totalPages === 0}
            style={{
              padding: '6px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
              border: '1px solid #e2e8f0', background: (page === totalPages || totalPages === 0) ? '#f8fafc' : '#ffffff',
              color: (page === totalPages || totalPages === 0) ? '#cbd5e1' : '#334155', cursor: (page === totalPages || totalPages === 0) ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Next
          </button>
        </div>
      </div>

      {/* VIEW MENU ITEM MODAL */}
      {viewingMenuItem && (
        <Modal
          isOpen={!!viewingMenuItem}
          onClose={() => setViewingMenuItem(null)}
          title="Menu Item Details"
          maxWidth="560px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', paddingTop: '8px' }}>
            {/* Images Preview */}
            <div style={{ position: 'relative', width: '100%', height: '140px', borderRadius: '12px', overflow: 'hidden', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {viewingMenuItem.coverImage ? (
                <img
                  src={getImageUrl(viewingMenuItem.coverImage)}
                  alt={viewingMenuItem.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 600 }}>No Cover Banner</span>
              )}

              {/* Float Square Image */}
              <div style={{
                position: 'absolute',
                bottom: '10px',
                left: '16px',
                width: '64px',
                height: '64px',
                borderRadius: '10px',
                border: '3px solid #ffffff',
                boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                overflow: 'hidden',
                background: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {viewingMenuItem.image ? (
                  <img
                    src={getImageUrl(viewingMenuItem.image)}
                    alt={viewingMenuItem.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <span style={{ fontSize: '24px' }}>🍽️</span>
                )}
              </div>
            </div>

            {/* Title & Badges */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                  {viewingMenuItem.name}
                </h3>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                  Category: {viewingMenuItem.category?.name || viewingMenuItem.category || 'General'}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 700,
                  background: viewingMenuItem.veg !== false ? '#dcfce7' : '#fee2e2',
                  color: viewingMenuItem.veg !== false ? '#166534' : '#991b1b',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: viewingMenuItem.veg !== false ? '#16a34a' : '#ef4444' }}></span>
                  {viewingMenuItem.veg !== false ? 'Veg' : 'Non-Veg'}
                </span>

                {viewingMenuItem.bestseller && (
                  <span style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, background: '#fef3c7', color: '#92400e' }}>
                    ⭐ Bestseller
                  </span>
                )}

                <span style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 700,
                  background: viewingMenuItem.available !== false ? '#e6f4ea' : '#f1f5f9',
                  color: viewingMenuItem.available !== false ? '#16a34a' : '#64748b'
                }}>
                  {viewingMenuItem.available !== false ? 'AVAILABLE' : 'OUT OF STOCK'}
                </span>
              </div>
            </div>

            {/* Pricing Details Breakdown */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px',
              padding: '14px',
              background: '#f8fafc',
              borderRadius: '10px',
              border: '1px solid #e2e8f0'
            }}>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Base Price</span>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                  ₹{(Number(viewingMenuItem.price) || 0).toFixed(2)}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                  GST ({viewingMenuItem.gst !== undefined ? viewingMenuItem.gst : 5}%)
                </span>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#ea580c', marginTop: '2px' }}>
                  ₹{(((Number(viewingMenuItem.price) || 0) * (Number(viewingMenuItem.gst !== undefined ? viewingMenuItem.gst : 5))) / 100).toFixed(2)}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Total Customer Price</span>
                <div style={{ fontSize: '16px', fontWeight: 900, color: 'var(--primary)', marginTop: '2px' }}>
                  ₹{((Number(viewingMenuItem.price) || 0) * (1 + (Number(viewingMenuItem.gst !== undefined ? viewingMenuItem.gst : 5) / 100))).toFixed(2)}
                </div>
              </div>
            </div>

            {/* Description */}
            {viewingMenuItem.desc && (
              <div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '4px' }}>Description</span>
                <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: '1.5', background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  {viewingMenuItem.desc}
                </p>
              </div>
            )}

            {/* Action Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setViewingMenuItem(null)}
                style={{ padding: '8px 18px' }}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-black"
                onClick={() => {
                  const itm = viewingMenuItem;
                  setViewingMenuItem(null);
                  openEditMenuModal(itm);
                }}
                style={{ padding: '8px 18px' }}
              >
                Edit Item
              </button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}