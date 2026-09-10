import React, { useState } from 'react';
import { Modal } from './Modal';
import ShowNotifications from '../helper/ShowNotifications';
import MenuApi from '../api/Menu.js';
import { useAppState } from '../config/AppContext';
import SearchableSelect from './SearchableSelect.jsx';

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



export default function CategoryListPanel({
  categories = [],
  onBack,
  refreshCategories,
  activeRestaurant
}) {
  const { currentUser, selectedBranchId } = useAppState();
  const [allCategories, setAllCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const limit = 10;

  const fetchCategoriesData = async () => {
    if (!activeRestaurant) return;
    try {
      const params = {
        limit: 1000,
        search: searchQuery ? searchQuery.trim() : undefined
      };
      if (selectedBranchId && selectedBranchId !== 'ALL') {
        params.branchId = selectedBranchId;
      }
      const res = await MenuApi.getCategories(params);
      if (res?.status && res.response) {
        const rawData = res.response.data || res.response.categories || res.response || [];
        const arr = (Array.isArray(rawData) ? rawData : (Array.isArray(rawData?.items) ? rawData.items : (Array.isArray(rawData?.data) ? rawData.data : []))).filter(c => !c?.isDelete);
        setAllCategories(arr);
      } else if (Array.isArray(categories) && categories.length > 0) {
        setAllCategories(categories.filter(c => !c?.isDelete));
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
      if (Array.isArray(categories) && categories.length > 0) {
        setAllCategories(categories.filter(c => !c?.isDelete));
      }
    }
  };

  React.useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCategoriesData();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [activeRestaurant, selectedBranchId, searchQuery]);

  React.useEffect(() => {
    if (Array.isArray(categories) && categories.length > 0) {
      setAllCategories(categories.filter(c => !c?.isDelete));
    }
  }, [categories]);

  const displayCategories = allCategories;

  const totalItems = displayCategories.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const paginatedCategories = displayCategories.slice(page * limit, (page + 1) * limit);

  React.useEffect(() => {
    setPage(0);
  }, [searchQuery, selectedBranchId]);

  React.useEffect(() => {
    if (page >= totalPages && totalPages > 0) {
      setPage(totalPages - 1);
    }
  }, [totalPages, page]);

  React.useEffect(() => {
    setPage(0);
  }, [selectedBranchId]);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    const current = page + 1;
    let startPage = Math.max(1, current - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const roleStr = typeof currentUser?.role === 'object' && currentUser?.role !== null
    ? (currentUser?.role?.roleName || currentUser?.role?.name || '')
    : (typeof currentUser?.role === 'string' ? currentUser.role : '');
  const userTypeStr = typeof currentUser?.userType === 'string' ? currentUser.userType : '';

  const userType = (userTypeStr || roleStr || '').toUpperCase();
  const userRoleLower = (roleStr || '').toLowerCase();
  const isRestaurantOwner =
    userTypeStr === 'RESTAURANT_OWNER' ||
    roleStr === 'RESTAURANT_OWNER' ||
    userType === 'RESTAURANT_OWNER' ||
    userType === 'ADMIN' ||
    userType === 'SUPER ADMIN' ||
    userType === 'SUPER_ADMIN' ||
    userType === 'OWNER' ||
    userRoleLower === 'admin' ||
    userRoleLower === 'owner' ||
    userRoleLower === 'super admin' ||
    userRoleLower === 'restaurant_owner' ||
    userRoleLower === 'restaurant owner';

  const branches = activeRestaurant?.branches || [];

  const [viewMode, setViewMode] = useState('list'); // 'list' | 'form'
  const [viewingCategory, setViewingCategory] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formStatus, setFormStatus] = useState('AVAILABLE');
  const [formBranchId, setFormBranchId] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormName('');
    setFormDesc('');
    setFormStatus('AVAILABLE');
    const defaultBranch = (selectedBranchId && selectedBranchId !== 'ALL')
      ? selectedBranchId
      : (currentUser?.activeBranchId || currentUser?.branchId || (branches.length > 0 ? (branches[0]._id || branches[0].id) : ''));
    setFormBranchId(defaultBranch || '');
    setFormErrors({});
    setViewMode('form');
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormDesc(item.description);
    setFormStatus(item.status || 'AVAILABLE');
    const itemBranch = item.branchId?._id || item.branchId?.id || item.branchId || (selectedBranchId !== 'ALL' ? selectedBranchId : (currentUser?.activeBranchId || currentUser?.branchId || (branches.length > 0 ? (branches[0]._id || branches[0].id) : '')));
    setFormBranchId(itemBranch || '');
    setFormErrors({});
    setViewMode('form');
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    const errors = {};
    if (!formName.trim()) {
      errors.name = 'Category Name is required.';
    } else if (formName.trim().length < 2) {
      errors.name = 'Category Name must be at least 2 characters.';
    }

    if (isRestaurantOwner && !formBranchId) {
      errors.branchId = 'Branch selection is required.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const payload = {
      name: formName.trim(),
      description: formDesc.trim(),
      status: formStatus,
      branchId: formBranchId || (selectedBranchId && selectedBranchId !== 'ALL' ? selectedBranchId : undefined)
    };

    if (editingItem) {
      if (editingItem._id) {
        const res = await MenuApi.updateCategory(editingItem._id, payload);
        if (res.status) {
          ShowNotifications.showAlertNotification(`Category "${formName.trim()}" updated successfully!`, true);
          if (refreshCategories) refreshCategories();
          fetchCategoriesData();
          setViewMode('list');
        } else {
          ShowNotifications.showAlertNotification('Failed to update category', false);
        }
      } else {
        ShowNotifications.showAlertNotification('Cannot update default placeholder category. Delete and create a new one.', false);
      }
    } else {
      const res = await MenuApi.createCategory(payload);
      if (res.status) {
        ShowNotifications.showAlertNotification(`Category "${formName.trim()}" added successfully!`, true);
        if (refreshCategories) refreshCategories();
        fetchCategoriesData();
        setViewMode('list');
      } else {
        ShowNotifications.showAlertNotification('Failed to create category', false);
      }
    }
  };

  const handleDelete = (item) => {
    setCategoryToDelete(item);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    setIsDeleting(true);
    if (categoryToDelete._id) {
      const res = await MenuApi.deleteCategory(categoryToDelete._id);
      if (res.status) {
        ShowNotifications.showAlertNotification(`Category "${categoryToDelete.name}" deleted!`, true);
        if (refreshCategories) refreshCategories();
        fetchCategoriesData();
        setCategoryToDelete(null);
      } else {
        ShowNotifications.showAlertNotification('Failed to delete category', false);
      }
    } else {
      ShowNotifications.showAlertNotification('Cannot delete default placeholder category', false);
      setCategoryToDelete(null);
    }
    setIsDeleting(false);
  };

  if (viewMode === 'form') {
    return (
      <section className="panel-view active" style={{ padding: '0 24px 24px 24px', width: '100%', boxSizing: 'border-box' }}>
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '20px 28px',
          marginBottom: '24px',
          border: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>
                {editingItem ? 'Edit Category' : 'Add Category'}
              </h2>
            </div>
          </div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '32px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', width: '100%', boxSizing: 'border-box' }}>
          <form onSubmit={handleSave} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
                placeholder="e.g. Starters, Main Course, Beverages..."
                style={{
                  width: '100%',
                  padding: '12px 16px',
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

            {/* Branch Assignment Field */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>
                Branch Assignment <span style={{ color: '#ef4444' }}>*</span>
              </label>
              {(() => {
                const allBranchesList = (branches && branches.length > 0) ? branches : (activeRestaurant?.branches || []);
                const isLocked = !isRestaurantOwner || (selectedBranchId && selectedBranchId !== 'ALL');
                const headerBranchObj = (selectedBranchId && selectedBranchId !== 'ALL')
                  ? allBranchesList.find(b => String(b._id || b.id) === String(selectedBranchId) || String(b.branchCode) === String(selectedBranchId))
                  : null;
                const currentBranchObj = headerBranchObj 
                  || allBranchesList.find(b => String(b._id || b.id) === String(formBranchId))
                  || allBranchesList.find(b => String(b.branchCode) === String(formBranchId))
                  || (allBranchesList.length > 0 ? allBranchesList[0] : null);
                const effectiveVal = currentBranchObj ? (currentBranchObj._id || currentBranchObj.id) : (formBranchId || '');

                return (
                  <div>
                    <SearchableSelect
                      value={effectiveVal}
                      onChange={e => {
                        setFormBranchId(e.target.value);
                        if (formErrors.branchId) setFormErrors({ ...formErrors, branchId: '' });
                      }}
                      isDisabled={isLocked}
                      options={allBranchesList.length === 0 ? [
                        { value: '', label: 'Main Branch' }
                      ] : allBranchesList.map(b => ({
                        value: b._id || b.id,
                        label: `${b.branchName || b.name || 'Branch'}${b.branchCode ? ` (${b.branchCode})` : ''}`
                      }))}
                      placeholder="Select Branch..."
                    />
                    {isLocked && (
                      <span style={{ color: '#64748b', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                        Branch is locked to currently selected branch.
                      </span>
                    )}
                    {formErrors.branchId && (
                      <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                        {formErrors.branchId}
                      </span>
                    )}
                  </div>
                );
              })()}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>
                Description
              </label>
              <textarea
                rows="4"
                value={formDesc}
                onChange={e => setFormDesc(e.target.value)}
                placeholder="e.g. Appetizers and quick bites"
                style={{
                  width: '100%',
                  padding: '12px 16px',
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
              <SearchableSelect
                value={formStatus}
                onChange={e => setFormStatus(e.target.value)}
                options={[
                  { value: 'AVAILABLE', label: 'Available' },
                  { value: 'UNAVAILABLE', label: 'Unavailable' }
                ]}
                placeholder="Select Status..."
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setViewMode('list')}
                style={{ padding: '10px 24px' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  background: '#ff5a1f',
                  border: 'none',
                  color: '#ffffff',
                  fontWeight: '700',
                  padding: '10px 26px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(255, 90, 31, 0.25)'
                }}
              >
                {editingItem ? 'Save Changes' : 'Add Category'}
              </button>
            </div>
          </form>
        </div>
      </section>
    );
  }

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
        <div style={{ width: '100%', overflowX: 'auto', paddingBottom: '6px' }}>
          <table style={{ width: '100%', minWidth: '950px', borderCollapse: 'collapse', textAlign: 'left' }}>
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
              {paginatedCategories.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '48px 20px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                    No categories found. Click <strong>Add Category</strong> to create one.
                  </td>
                </tr>
              ) : (
                paginatedCategories.map((item, index) => {
                  const isAvailable = item.status?.toUpperCase() !== 'UNAVAILABLE';
                  return (
                    <tr
                      key={item._id || index}
                      style={{
                        borderBottom: index < paginatedCategories.length - 1 ? '1px solid #f1f5f9' : 'none',
                        transition: 'background 0.15s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
                    >
                    {/* S.NO */}
                    <td style={{ padding: '16px', fontWeight: 800, fontSize: '12px', color: '#0f172a', fontFamily: 'monospace', width: '5%' }}>
                      {page * limit + index + 1}
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
                          onClick={() => setViewingCategory(item)}
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
                          title="View Category Details"
                        >
                          <EyeIcon size={16} />
                        </button>
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
                          onClick={() => handleDelete(item)}
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
              })
            )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', padding: '10px 20px', background: '#fff', borderRadius: '10px', border: '1px solid var(--border)' }}>
        <div style={{ fontSize: '13px', color: '#64748b' }}>
          Showing {totalItems === 0 ? 0 : page * limit + 1} to {Math.min((page + 1) * limit, totalItems)} of {totalItems} entries
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            style={{
              padding: '6px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
              border: '1px solid #e2e8f0', background: page === 0 ? '#f8fafc' : '#ffffff',
              color: page === 0 ? '#cbd5e1' : '#334155', cursor: page === 0 ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Prev
          </button>

          {getPageNumbers().map(pageNum => (
            <button
              key={pageNum}
              type="button"
              onClick={() => setPage(pageNum - 1)}
              style={{
                minWidth: '32px',
                height: '32px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: page + 1 === pageNum ? 700 : 500,
                border: page + 1 === pageNum ? 'none' : '1px solid #e2e8f0',
                background: page + 1 === pageNum ? '#000000' : '#ffffff',
                color: page + 1 === pageNum ? '#ffffff' : '#334155',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {pageNum}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1 || totalPages === 0}
            style={{
              padding: '6px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
              border: '1px solid #e2e8f0', background: (page >= totalPages - 1 || totalPages === 0) ? '#f8fafc' : '#ffffff',
              color: (page >= totalPages - 1 || totalPages === 0) ? '#cbd5e1' : '#334155', cursor: (page >= totalPages - 1 || totalPages === 0) ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Next
          </button>
        </div>
      </div>

      {/* View Category Modal Popup */}
      {viewingCategory && (
        <Modal
          isOpen={!!viewingCategory}
          onClose={() => setViewingCategory(null)}
          title="Category Details"
          maxWidth="440px"
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
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>Status:</span>
              <span style={{
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: '700',
                backgroundColor: viewingCategory.status?.toUpperCase() !== 'UNAVAILABLE' ? '#e6f4ea' : '#fef2f2',
                color: viewingCategory.status?.toUpperCase() !== 'UNAVAILABLE' ? '#16a34a' : '#dc2626'
              }}>
                {viewingCategory.status?.toUpperCase() !== 'UNAVAILABLE' ? 'AVAILABLE' : 'UNAVAILABLE'}
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

      {/* Delete Category Confirmation Modal Popup */}
      {categoryToDelete && (
        <Modal
          isOpen={!!categoryToDelete}
          onClose={() => !isDeleting && setCategoryToDelete(null)}
          title="Confirm Category Deletion"
          maxWidth="440px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '8px' }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#1e293b', lineHeight: '1.5' }}>
              Are you sure you want to delete category <strong>"{categoryToDelete?.name}"</strong>?
            </p>
            <div style={{ fontSize: '12px', color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', padding: '10px 14px', borderRadius: '8px' }}>
              ⚠️ Warning: This action cannot be undone.
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setCategoryToDelete(null)}
                disabled={isDeleting}
                style={{ padding: '8px 18px' }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-black"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                style={{ padding: '8px 20px', background: '#dc2626', borderColor: '#dc2626', color: '#ffffff', fontWeight: 700 }}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}
