import React, { useState, useEffect, useCallback } from 'react';
import { Modal } from './Modal';
import ShowNotifications from '../helper/ShowNotifications';
import MenuApi from '../api/Menu.js';
import BranchApi from '../api/Branch.js';
import UploadApi from '../api/Upload.js';
import { useAppState } from '../config/AppContext';
import SearchableSelect from './SearchableSelect.jsx';
import { isBranchMatch } from '../helper/BranchHelper.js';
import { cleanRelativeImagePath, getImageUrl } from '../helper/ImageHelper.js';
import { isMongoId } from '../config/initialData';

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
  const [liveBranches, setLiveBranches] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const limit = 10;

  const fetchBranches = useCallback(async () => {
    try {
      const res = await BranchApi.getBranches();
      if (res?.status) {
        const rawBranches = res.response?.data || (Array.isArray(res.response) ? res.response : []);
        setLiveBranches(rawBranches);
      } else if (activeRestaurant?.branches) {
        setLiveBranches(activeRestaurant.branches);
      }
    } catch (e) {
      if (activeRestaurant?.branches) {
        setLiveBranches(activeRestaurant.branches);
      }
    }
  }, [activeRestaurant]);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  const branches = liveBranches.length > 0 ? liveBranches : (activeRestaurant?.branches || []);

  const fetchCategoriesData = async () => {
    if (!activeRestaurant) return;
    try {
      const params = {
        search: searchQuery ? searchQuery.trim() : undefined
      };
      if (selectedBranchId && selectedBranchId !== 'ALL' && String(selectedBranchId).toUpperCase() !== 'COMPANY' && isMongoId(selectedBranchId)) {
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

  const isBranchFiltered = selectedBranchId && selectedBranchId !== 'ALL' && selectedBranchId !== 'All';
  const displayCategories = isBranchFiltered
    ? allCategories.filter(c => isBranchMatch(c, selectedBranchId, branches))
    : allCategories;

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

  const [viewMode, setViewMode] = useState('list'); // 'list' | 'form'
  const [viewingCategory, setViewingCategory] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form states as requested by Category specs: Category Name*, Category Image*, Description (Optional), Display Order*, Status*
  const [formName, setFormName] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formDisplayOrder, setFormDisplayOrder] = useState(1);
  const [formStatus, setFormStatus] = useState('AVAILABLE');
  const [formBranchId, setFormBranchId] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormName('');
    setFormImage('');
    setFormDesc('');
    setFormDisplayOrder(allCategories.length + 1);
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
    setFormName(item.name || '');
    setFormImage(item.image || '');
    setFormDesc(item.description || '');
    setFormDisplayOrder(item.displayOrder || item.order || 1);
    setFormStatus(item.status || 'AVAILABLE');
    const itemBranch = item.branchId?._id || item.branchId?.id || item.branchId || (selectedBranchId && selectedBranchId !== 'ALL' ? selectedBranchId : (currentUser?.activeBranchId || currentUser?.branchId || (branches.length > 0 ? (branches[0]._id || branches[0].id) : '')));
    setFormBranchId(itemBranch || '');
    setFormErrors({});
    setViewMode('form');
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    const errors = {};
    if (!formName.trim()) {
      errors.name = 'Category Name is required.';
    } else if (/\d/.test(formName)) {
      errors.name = 'Numbers are not allowed in Category Name.';
    } else if (formName.trim().length < 2) {
      errors.name = 'Category Name must be at least 2 characters.';
    }

    if (!formImage) {
      errors.image = 'Category Image is required.';
    }

    const orderNum = parseInt(formDisplayOrder);
    if (!formDisplayOrder || isNaN(orderNum) || orderNum < 1) {
      errors.displayOrder = 'Please enter a valid Display Order (at least 1).';
    }

    if (isRestaurantOwner && branches.length > 0 && !formBranchId) {
      errors.branchId = 'Branch selection is required.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    const candidateBranch = (isMongoId(formBranchId) ? formBranchId : null) || 
                            (selectedBranchId && selectedBranchId !== 'ALL' && String(selectedBranchId).toUpperCase() !== 'COMPANY' && isMongoId(selectedBranchId) ? selectedBranchId : null) || 
                            (isMongoId(currentUser?.activeBranchId) ? currentUser.activeBranchId : null) || 
                            (isMongoId(currentUser?.branchId) ? currentUser.branchId : null);
    const payload = {
      name: formName.trim(),
      image: cleanRelativeImagePath(formImage),
      description: formDesc.trim(),
      displayOrder: orderNum,
      order: orderNum,
      status: formStatus || 'AVAILABLE'
    };
    if (candidateBranch) {
      payload.branchId = candidateBranch;
    }

    try {
      if (editingItem) {
        if (editingItem._id) {
          const res = await MenuApi.updateCategory(editingItem._id, payload);
          if (res?.status) {
            ShowNotifications.showAlertNotification(`Category "${formName.trim()}" updated successfully!`, true);
            if (refreshCategories) refreshCategories();
            fetchCategoriesData();
            setViewMode('list');
          } else {
            const errMsg = res?.response?.data?.message || res?.response?.message || 'Failed to update category';
            ShowNotifications.showAlertNotification(errMsg, false);
          }
        } else {
          ShowNotifications.showAlertNotification('Cannot update default placeholder category. Delete and create a new one.', false);
        }
      } else {
        const res = await MenuApi.createCategory(payload);
        if (res?.status) {
          ShowNotifications.showAlertNotification(`Category "${formName.trim()}" added successfully!`, true);
          if (refreshCategories) refreshCategories();
          fetchCategoriesData();
          setViewMode('list');
        } else {
          const errMsg = res?.response?.data?.message || res?.response?.message || 'Failed to create category';
          ShowNotifications.showAlertNotification(errMsg, false);
        }
      }
    } catch (err) {
      console.error("Error saving category:", err);
      ShowNotifications.showAlertNotification('Failed to save category. Please try again.', false);
    } finally {
      setIsSubmitting(false);
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
            
            {/* Category Image Uploader */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>
                Category Image <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div
                onClick={() => document.getElementById('category-image-input').click()}
                style={{
                  width: '100%',
                  height: '140px',
                  border: formErrors.image ? '1.5px solid #ef4444' : '2px dashed #cbd5e1',
                  borderRadius: '12px',
                  background: '#f8fafc',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  position: 'relative',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => { if (!formErrors.image) { e.currentTarget.style.borderColor = '#ff5a1f'; e.currentTarget.style.background = '#fff7ed'; } }}
                onMouseLeave={e => { if (!formErrors.image) { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = '#f8fafc'; } }}
              >
                <input
                  id="category-image-input"
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setIsUploadingImage(true);
                      const res = await UploadApi.uploadImage(file, "category", "image");
                      setIsUploadingImage(false);
                      if (res?.status) {
                        const finalPath = res.path || res.data?.path || cleanRelativeImagePath(res.url);
                        if (finalPath) {
                          setFormImage(finalPath);
                          if (formErrors.image) setFormErrors({ ...formErrors, image: '' });
                        }
                      }
                    }
                  }}
                  style={{ display: 'none' }}
                />
                {isUploadingImage ? (
                  <div style={{ fontWeight: 600, color: '#ff5a1f', fontSize: '13px' }}>Uploading...</div>
                ) : formImage ? (
                  <>
                    <img src={getImageUrl(formImage)} alt="Category" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.5)', padding: '4px', textAlign: 'center', color: '#fff', fontSize: '11px', fontWeight: 600 }}>
                      Click to Change Category Image
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '10px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Upload Category Image</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>PNG, JPG or WEBP accepted</div>
                  </div>
                )}
              </div>
              {formErrors.image && (
                <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                  {formErrors.image}
                </span>
              )}
            </div>

            {/* Category Name & Display Order */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>
                  Category Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={e => {
                    const val = e.target.value;
                    const cleaned = val.replace(/[0-9]/g, '');
                    setFormName(cleaned);
                    if (val !== cleaned) {
                      setFormErrors({ ...formErrors, name: 'Numbers are not allowed in Category Name.' });
                    } else if (formErrors.name) {
                      setFormErrors({ ...formErrors, name: '' });
                    }
                  }}
                  onKeyDown={e => {
                    if (/[0-9]/.test(e.key)) {
                      e.preventDefault();
                      setFormErrors({ ...formErrors, name: 'Numbers are not allowed in Category Name.' });
                    }
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

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>
                  Display Order <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={formDisplayOrder}
                  onChange={e => {
                    setFormDisplayOrder(e.target.value);
                    if (formErrors.displayOrder) setFormErrors({ ...formErrors, displayOrder: '' });
                  }}
                  placeholder="1"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: formErrors.displayOrder ? '1.5px solid #ef4444' : '1px solid #e2e8f0',
                    fontSize: '14px',
                    color: '#0f172a',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                {formErrors.displayOrder && (
                  <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                    {formErrors.displayOrder}
                  </span>
                )}
              </div>
            </div>

            {/* Branch Assignment */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>
                Branch Assignment {branches.length > 0 && <span style={{ color: '#ef4444' }}>*</span>}
              </label>
              {(() => {
                const roleStr = typeof currentUser?.role === 'object' && currentUser?.role !== null
                  ? (currentUser?.role?.roleName || currentUser?.role?.name || '')
                  : (typeof currentUser?.role === 'string' ? currentUser.role : '');
                const userTypeStr = typeof currentUser?.userType === 'string' ? currentUser.userType : '';
                const userRole = (roleStr || '').toLowerCase().trim();
                const userType = (userTypeStr || '').toUpperCase().trim();
                const isCompanyUser =
                  userType === 'RESTAURANT_OWNER' ||
                  userType === 'OWNER' ||
                  userType === 'SUPER ADMIN' ||
                  userType === 'SUPER_ADMIN' ||
                  userType === 'ADMIN' ||
                  userRole === 'restaurant_owner' ||
                  userRole === 'restaurant owner' ||
                  userRole === 'owner' ||
                  userRole === 'super admin' ||
                  userRole === 'super_admin' ||
                  userRole === 'admin' ||
                  (!currentUser?.branchId && !currentUser?.activeBranchId);

                const userBranchId = (typeof currentUser?.branchId === 'object' && currentUser?.branchId !== null
                  ? (currentUser?.branchId?._id || currentUser?.branchId?.id)
                  : (currentUser?.branchId || currentUser?.activeBranchId)) || '';

                const isBranchLogin = !isCompanyUser && Boolean(userBranchId && userBranchId !== 'ALL' && String(userBranchId).toUpperCase() !== 'COMPANY');
                const isLocked = isBranchLogin;

                const allBranchesList = (branches && branches.length > 0) ? branches : (activeRestaurant?.branches || []);

                let currentBranchVal = formBranchId;
                if (isBranchLogin && userBranchId) {
                  currentBranchVal = userBranchId;
                } else if (currentBranchVal === 'COMPANY' || currentBranchVal === 'ALL' || currentBranchVal === 'all') {
                  currentBranchVal = '';
                }

                const currentBranchObj = currentBranchVal 
                  ? (allBranchesList.find(b => String(b._id || b.id) === String(currentBranchVal)) || allBranchesList.find(b => String(b.branchCode) === String(currentBranchVal)))
                  : null;
                let effectiveVal = currentBranchObj ? (currentBranchObj._id || currentBranchObj.id) : (currentBranchVal || '');

                const branchOptions = [
                  { value: '', label: activeRestaurant?.name || activeRestaurant?.restaurantName || activeRestaurant?.businessName || 'Main Branch' },
                  ...allBranchesList.map(b => ({
                    value: b._id || b.id,
                    label: `${b.branchName || b.name || 'Branch'}${b.branchCode ? ` (${b.branchCode})` : ''}`
                  }))
                ];

                return (
                  <div>
                    <SearchableSelect
                      value={effectiveVal}
                      onChange={e => {
                        setFormBranchId(e.target.value);
                        if (formErrors.branchId) setFormErrors({ ...formErrors, branchId: '' });
                      }}
                      isDisabled={isLocked}
                      options={branchOptions}
                      placeholder="Select Branch..."
                    />
                    {isLocked && (
                      <span style={{ color: '#64748b', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                        Branch is locked to your assigned branch.
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

            {/* Description (Optional) */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>
                Description (Optional)
              </label>
              <textarea
                rows="3"
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

            {/* Status * */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>
                Status <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <SearchableSelect
                value={formStatus}
                onChange={e => setFormStatus(e.target.value)}
                options={[
                  { value: 'AVAILABLE', label: 'Available (Active)' },
                  { value: 'UNAVAILABLE', label: 'Unavailable (Inactive)' }
                ]}
                placeholder="Select Status..."
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
              <button
                type="button"
                className="btn btn-outline"
                disabled={isSubmitting}
                onClick={() => setViewMode('list')}
                style={{ padding: '10px 24px' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  background: isSubmitting ? '#94a3b8' : '#ff5a1f',
                  border: 'none',
                  color: '#ffffff',
                  fontWeight: '700',
                  padding: '10px 26px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 6px rgba(255, 90, 31, 0.25)',
                  opacity: isSubmitting ? 0.8 : 1
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
    <section className="panel-view active" style={{ padding: '0 24px 24px 24px' }}>
      {/* Top Header Row */}
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
          <table style={{ width: '100%', minWidth: '1000px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f95e10', color: '#ffffff' }}>
                <th style={{ padding: '14px 16px', fontSize: '11px', fontWeight: '700', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', width: '50px' }}>
                  S.NO
                </th>
                <th style={{ padding: '14px 16px', fontSize: '11px', fontWeight: '700', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', width: '80px' }}>
                  IMAGE
                </th>
                <th style={{ padding: '14px 16px', fontSize: '11px', fontWeight: '700', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  CATEGORY NAME
                </th>
                <th style={{ padding: '14px 16px', fontSize: '11px', fontWeight: '700', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', width: '130px' }}>
                  DISPLAY ORDER
                </th>
                <th style={{ padding: '14px 16px', fontSize: '11px', fontWeight: '700', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  DESCRIPTION
                </th>
                <th style={{ padding: '14px 16px', fontSize: '11px', fontWeight: '700', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', width: '120px' }}>
                  STATUS
                </th>
                <th style={{ padding: '14px 16px', fontSize: '11px', fontWeight: '700', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right', width: '110px' }}>
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedCategories.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '48px 20px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                    No categories found. Click <strong>Add Category</strong> to create one.
                  </td>
                </tr>
              ) : (
                paginatedCategories.map((item, index) => {
                  const isAvailable = item.status?.toUpperCase() !== 'UNAVAILABLE' && item.status?.toUpperCase() !== 'INACTIVE';
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
                    <td style={{ padding: '14px 16px', fontWeight: 800, fontSize: '12px', color: '#0f172a', fontFamily: 'monospace' }}>
                      {page * limit + index + 1}
                    </td>

                    {/* IMAGE */}
                    <td style={{ padding: '14px 16px' }}>
                      {item.image ? (
                        <img
                          src={getImageUrl(item.image)}
                          alt={item.name}
                          style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover', display: 'block', border: '1px solid #e2e8f0' }}
                        />
                      ) : (
                        <div style={{ width: '40px', height: '40px', background: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#64748b', fontWeight: 700 }}>
                          No Image
                        </div>
                      )}
                    </td>

                    {/* CATEGORY NAME */}
                    <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>
                      {item.name}
                    </td>

                    {/* DISPLAY ORDER */}
                    <td style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '700', color: '#0f172a', textAlign: 'center' }}>
                      <span style={{ background: '#f1f5f9', padding: '4px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                        #{item.displayOrder || item.order || (index + 1)}
                      </span>
                    </td>

                    {/* DESCRIPTION */}
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#64748b', fontWeight: '400' }}>
                      {item.description || 'No description'}
                    </td>

                    {/* STATUS */}
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
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
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
            {viewingCategory.image && (
              <div style={{ width: '100%', height: '140px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                <img src={getImageUrl(viewingCategory.image)} alt={viewingCategory.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Category Name</span>
              <span style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>{viewingCategory.name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Display Order</span>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>#{viewingCategory.displayOrder || viewingCategory.order || 1}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Status</span>
              <span style={{
                padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 800,
                backgroundColor: viewingCategory.status?.toUpperCase() !== 'UNAVAILABLE' ? '#e6f4ea' : '#fef2f2',
                color: viewingCategory.status?.toUpperCase() !== 'UNAVAILABLE' ? '#16a34a' : '#dc2626'
              }}>
                {viewingCategory.status?.toUpperCase() !== 'UNAVAILABLE' ? 'AVAILABLE' : 'UNAVAILABLE'}
              </span>
            </div>
            <div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Description</span>
              <div style={{ fontSize: '13px', color: '#334155', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                {viewingCategory.description || 'No description provided.'}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button type="button" className="btn btn-outline" onClick={() => setViewingCategory(null)} style={{ padding: '8px 20px' }}>Close</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Category Modal */}
      {categoryToDelete && (
        <Modal
          isOpen={!!categoryToDelete}
          onClose={() => setCategoryToDelete(null)}
          title="Confirm Category Deletion"
          maxWidth="400px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#1e293b' }}>
              Are you sure you want to delete category <strong>"{categoryToDelete.name}"</strong>?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" className="btn btn-outline" onClick={() => setCategoryToDelete(null)} disabled={isDeleting}>Cancel</button>
              <button type="button" className="btn btn-black" onClick={handleConfirmDelete} disabled={isDeleting} style={{ background: '#dc2626', borderColor: '#dc2626', color: '#fff' }}>
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </Modal>
      )}

    </section>
  );
}
