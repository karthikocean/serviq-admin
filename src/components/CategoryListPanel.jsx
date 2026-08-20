import React, { useState } from 'react';
import { Modal } from './Modal';
import ShowNotifications from '../helper/ShowNotifications';
import MenuApi from '../api/Menu.js';
import { useAppState } from '../config/AppContext';

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



export default function CategoryListPanel({
  categories = [],
  onBack,
  refreshCategories,
  activeRestaurant
}) {
  const { currentUser, selectedBranchId } = useAppState();
  const [paginatedCategories, setPaginatedCategories] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [totalPages, setTotalPages] = useState(1);

  React.useEffect(() => {
    fetchPaginatedCategories();
  }, [page, activeRestaurant, selectedBranchId]);

  const fetchPaginatedCategories = async () => {
    if (!activeRestaurant) return;
    const params = { page, limit };
    if (selectedBranchId) {
      params.branchId = selectedBranchId;
    } else {
      params.branchId = 'all';
    }
    const res = await MenuApi.getCategories(params);
    if (res?.status && res.response) {
      if (res.response.data && res.response.data.items) {
        setPaginatedCategories(res.response.data.items);
        setTotalItems(res.response.data.total || 0);
        setTotalPages(Math.ceil((res.response.data.total || 0) / limit) || 1);
      } else {
        const arr = Array.isArray(res.response.data) ? res.response.data : (Array.isArray(res.response) ? res.response : []);
        setPaginatedCategories(arr);
        setTotalItems(arr.length);
        setTotalPages(Math.ceil(arr.length / limit) || 1);
      }
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
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
    setFormBranchId(selectedBranchId || (activeRestaurant?.branches?.length > 0 ? activeRestaurant.branches[0]._id : ''));
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormDesc(item.description);
    setFormStatus(item.status || 'AVAILABLE');
    setFormBranchId(item.branchId || selectedBranchId);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    if (!formName.trim()) {
      setFormErrors({ name: 'Category Name is required.' });
      return;
    }

    const payload = {
      name: formName.trim(),
      description: formDesc.trim(),
      status: formStatus,
      branchId: formBranchId
    };

    if (editingItem) {
      if (editingItem._id) {
        const res = await MenuApi.updateCategory(editingItem._id, payload);
        if (res.status) {
          ShowNotifications.showAlertNotification(`Category "${formName.trim()}" updated successfully!`, true);
          if (refreshCategories) refreshCategories();
          fetchPaginatedCategories();
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
        fetchPaginatedCategories();
      } else {
        ShowNotifications.showAlertNotification('Failed to create category', false);
      }
    }

    setIsModalOpen(false);
  };

  const handleDelete = async (item) => {
    if (window.confirm(`Are you sure you want to delete category "${item.name}"?`)) {
      if (item._id) {
        const res = await MenuApi.deleteCategory(item._id);
        if (res.status) {
          ShowNotifications.showAlertNotification(`Category "${item.name}" deleted!`, true);
          if (refreshCategories) refreshCategories();
          fetchPaginatedCategories();
        } else {
          ShowNotifications.showAlertNotification('Failed to delete category', false);
        }
      } else {
        ShowNotifications.showAlertNotification('Cannot delete default placeholder category', false);
      }
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
              {paginatedCategories.map((item, index) => {
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
                      {(page - 1) * limit + index + 1}
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
              })}
            </tbody>
          </table>
        </div>
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

          {(currentUser?.role === 'Admin' || currentUser?.role === 'RESTAURANT_OWNER' || currentUser?.userType === 'RESTAURANT_OWNER') && activeRestaurant?.branches?.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>
                Branch
              </label>
              <select
                value={formBranchId}
                onChange={e => setFormBranchId(e.target.value)}
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
                {activeRestaurant.branches.map(b => (
                  <option key={b.id} value={b.id}>{b.branchName}</option>
                ))}
              </select>
            </div>
          )}

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
