import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, SearchIcon, EyeIcon, PencilIcon, TrashIcon, filterInputStyle, formInputStyle, formLabelStyle, PaginationBar, preventSpaceInput, actionIconBtnStyle } from './InventoryCommon';
import InventoryApi from '../../api/Inventory';
import ShowNotifications from '../../helper/ShowNotifications';

export default function CompanyVendors() {
  const navigate = useNavigate();
  const [vendorsList, setVendorsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(0);

  // View States: null (LIST) | 'ADD_VENDOR' | 'EDIT_VENDOR' | 'VIEW_PROFILE'
  const [viewState, setViewState] = useState(null);
  const [viewingVendor, setViewingVendor] = useState(null);
  const [editingVendor, setEditingVendor] = useState(null);

  const [vendorForm, setVendorForm] = useState({
    vendorCode: 'VEN-001',
    name: '',
    companyName: '',
    phone: '',
    status: 'ACTIVE'
  });
  const [vendorErrors, setVendorErrors] = useState({});

  // -------------------------------------------------------------
  // API FETCH
  // -------------------------------------------------------------
  const fetchVendors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await InventoryApi.getVendors();
      if (res?.status && res?.response) {
        const raw = res.response.data || res.response || [];
        if (Array.isArray(raw)) {
          setVendorsList(raw);
        }
      }
    } catch (err) {
      console.warn('Vendor list load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  // Filter vendors
  const filteredVendors = vendorsList.filter(v => {
    const code = (v.vendorCode || '').toLowerCase();
    const name = (v.name || '').toLowerCase();
    const comp = (v.companyName || '').toLowerCase();
    const phone = (v.phone || '').toLowerCase();
    const query = searchTerm.toLowerCase().trim();

    const matchesSearch = !query || code.includes(query) || name.includes(query) || comp.includes(query) || phone.includes(query);
    const matchesStatus = statusFilter === 'All' || (v.status || 'ACTIVE').toUpperCase() === statusFilter.toUpperCase();

    return matchesSearch && matchesStatus;
  });

  const PAGE_SIZE = 10;
  const paginatedVendors = filteredVendors.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  // -------------------------------------------------------------
  // FORM HANDLERS
  // -------------------------------------------------------------
  const openAddVendor = () => {
    const nextNum = vendorsList.length + 1;
    setVendorForm({
      vendorCode: `VEN-${String(nextNum).padStart(3, '0')}`,
      name: '',
      companyName: '',
      phone: '',
      status: 'ACTIVE'
    });
    setEditingVendor(null);
    setViewingVendor(null);
    setVendorErrors({});
    setViewState('ADD_VENDOR');
  };

  const openEditVendor = (v) => {
    setEditingVendor(v);
    setVendorForm({
      vendorCode: v.vendorCode || 'VEN-001',
      name: v.name || '',
      companyName: v.companyName || '',
      phone: v.phone || '',
      status: v.status || 'ACTIVE'
    });
    setVendorErrors({});
    setViewState('EDIT_VENDOR');
  };

  const validate = () => {
    const errors = {};
    if (!vendorForm.name.trim()) errors.name = 'Vendor / Contact Name is required';
    if (!vendorForm.companyName.trim()) errors.companyName = 'Company Name is required';
    if (!vendorForm.phone.trim()) errors.phone = 'Phone Number is required';
    setVendorErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (editingVendor) {
        const res = await InventoryApi.updateVendor(editingVendor._id || editingVendor.id, vendorForm);
        if (res?.status) {
          setViewState(null);
          fetchVendors();
        }
      } else {
        const res = await InventoryApi.createVendor(vendorForm);
        if (res?.status) {
          setViewState(null);
          fetchVendors();
        }
      }
    } catch (err) {
      ShowNotifications.showAlertNotification('Failed to save vendor details', false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (v) => {
    if (window.confirm(`Are you sure you want to delete vendor "${v.name}"?`)) {
      const res = await InventoryApi.deleteVendor(v._id || v.id);
      if (res?.status) {
        fetchVendors();
      }
    }
  };

  const handleToggleStatus = async (v) => {
    const newStatus = v.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const res = await InventoryApi.updateVendor(v._id || v.id, { ...v, status: newStatus });
    if (res?.status) {
      fetchVendors();
    }
  };

  // -------------------------------------------------------------
  // VIEW: VENDOR PROFILE VIEW (FULL PAGE)
  // -------------------------------------------------------------
  if (viewState === 'VIEW_PROFILE' && viewingVendor) {
    return (
      <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '32px 40px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', paddingBottom: '20px', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              type="button"
              onClick={() => setViewState(null)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#0f172a',
                fontSize: '16px',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              ←
            </button>
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>
                Vendor Profile: {viewingVendor.name}
              </h2>
              <span style={{ fontSize: '13px', color: '#64748b' }}>Supplier credentials and account status</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => openEditVendor(viewingVendor)}
            style={{
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              color: '#0f172a',
              padding: '8px 18px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <PencilIcon size={14} />
            <span>Edit Vendor</span>
          </button>
        </div>

        <div style={{ background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '28px', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', fontSize: '14px' }}>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '12px', marginBottom: '4px' }}>Vendor Code</span>
              <strong style={{ color: '#ff5a1f', fontSize: '18px', fontWeight: 900 }}>{viewingVendor.vendorCode}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '12px', marginBottom: '4px' }}>Contact Name</span>
              <strong style={{ color: '#0f172a', fontSize: '16px' }}>{viewingVendor.name}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '12px', marginBottom: '4px' }}>Company Name</span>
              <span style={{ color: '#0f172a', fontWeight: 800, fontSize: '15px' }}>{viewingVendor.companyName || '—'}</span>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '12px', marginBottom: '4px' }}>Contact Number</span>
              <span style={{ color: '#0f172a', fontWeight: 700 }}>{viewingVendor.phone || '—'}</span>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '12px', marginBottom: '4px' }}>Account Status</span>
              <span style={{
                background: viewingVendor.status === 'ACTIVE' ? '#dcfce7' : '#fef2f2',
                color: viewingVendor.status === 'ACTIVE' ? '#16a34a' : '#dc2626',
                border: `1px solid ${viewingVendor.status === 'ACTIVE' ? '#bbf7d0' : '#fecaca'}`,
                padding: '4px 12px',
                borderRadius: '16px',
                fontSize: '12px',
                fontWeight: 800
              }}>
                {viewingVendor.status || 'ACTIVE'}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW: REGISTER / EDIT VENDOR FORM (FULL PAGE, NO MODAL)
  // -------------------------------------------------------------
  if (viewState === 'ADD_VENDOR' || viewState === 'EDIT_VENDOR') {
    return (
      <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '32px 40px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', paddingBottom: '20px', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              type="button"
              onClick={() => setViewState(null)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#0f172a',
                fontSize: '16px',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              ←
            </button>
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>
                {viewState === 'EDIT_VENDOR' ? `Edit Vendor Details: ${editingVendor?.name}` : 'Register New Vendor'}
              </h2>
              <span style={{ fontSize: '13px', color: '#64748b' }}>Manage supplier credentials and active status</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          {/* Contact Name & Company Name */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '20px' }}>
            <div>
              <label style={formLabelStyle}>
                Vendor / Contact Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Metro Wholesale / Rajan"
                value={vendorForm.name}
                onChange={e => setVendorForm({ ...vendorForm, name: e.target.value })}
                style={{ ...formInputStyle, borderColor: vendorErrors.name ? '#ef4444' : '#cbd5e1' }}
              />
              {vendorErrors.name && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', display: 'block', fontWeight: 600 }}>{vendorErrors.name}</span>}
            </div>

            <div>
              <label style={formLabelStyle}>
                Company Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Metro Cash & Carry Pvt Ltd"
                value={vendorForm.companyName}
                onChange={e => setVendorForm({ ...vendorForm, companyName: e.target.value })}
                style={{ ...formInputStyle, borderColor: vendorErrors.companyName ? '#ef4444' : '#cbd5e1' }}
              />
              {vendorErrors.companyName && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', display: 'block', fontWeight: 600 }}>{vendorErrors.companyName}</span>}
            </div>
          </div>

          {/* Phone & Status */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
            <div>
              <label style={formLabelStyle}>
                Contact Number <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. +91 9876543210"
                value={vendorForm.phone}
                onChange={e => setVendorForm({ ...vendorForm, phone: e.target.value })}
                style={{ ...formInputStyle, borderColor: vendorErrors.phone ? '#ef4444' : '#cbd5e1' }}
              />
              {vendorErrors.phone && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', display: 'block', fontWeight: 600 }}>{vendorErrors.phone}</span>}
            </div>

            <div>
              <label style={formLabelStyle}>Vendor Status</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', height: '42px' }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer', fontWeight: 700, color: vendorForm.status === 'ACTIVE' ? '#16a34a' : '#64748b' }}>
                  <input
                    type="radio"
                    name="vendorStatusPageFull"
                    value="ACTIVE"
                    checked={vendorForm.status === 'ACTIVE'}
                    onChange={() => setVendorForm({ ...vendorForm, status: 'ACTIVE' })}
                  />
                  Active
                </label>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer', fontWeight: 700, color: vendorForm.status === 'INACTIVE' ? '#dc2626' : '#64748b' }}>
                  <input
                    type="radio"
                    name="vendorStatusPageFull"
                    value="INACTIVE"
                    checked={vendorForm.status === 'INACTIVE'}
                    onChange={() => setVendorForm({ ...vendorForm, status: 'INACTIVE' })}
                  />
                  Inactive
                </label>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '14px', paddingTop: '24px', borderTop: '1px solid #f1f5f9' }}>
            <button
              type="button"
              onClick={() => setViewState(null)}
              disabled={isSubmitting}
              style={{ background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', padding: '12px 28px', borderRadius: '8px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                background: 'linear-gradient(135deg, #ff5a1f 0%, #ea580c 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '12px 32px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 800,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.7 : 1,
                boxShadow: '0 4px 12px rgba(255, 90, 31, 0.3)'
              }}
            >
              {isSubmitting ? 'Saving Vendor...' : (editingVendor ? 'Update Vendor' : 'Save Vendor')}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER MAIN VENDOR TABLE LIST VIEW
  // -------------------------------------------------------------
  return (
    <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
      {/* Top Filter and Action Bar */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', width: '260px' }}>
            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}>
              <SearchIcon size={14} />
            </span>
            <input
              type="text"
              placeholder="Search code, name, company, phone..."
              value={searchTerm}
              onKeyDown={preventSpaceInput}
              onChange={e => { setSearchTerm(e.target.value.replace(/\s/g, '')); setCurrentPage(0); }}
              style={{ ...filterInputStyle, paddingLeft: '32px' }}
            />
          </div>

          {/* Status Filter */}
          <div style={{ width: '160px' }}>
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setCurrentPage(0); }}
              style={filterInputStyle}
            >
              <option value="All">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>

        {/* Buttons: Back to Purchases & Add Vendor */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={() => navigate('/inventory/purchases')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#f8fafc',
              color: '#0f172a',
              border: '1px solid #cbd5e1',
              padding: '10px 18px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            ← Back to Purchases
          </button>

          <button
            type="button"
            onClick={openAddVendor}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #ff5a1f 0%, #ea580c 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(255, 90, 31, 0.3)'
            }}
          >
            <PlusIcon size={15} />
            <span>Register New Vendor</span>
          </button>
        </div>
      </div>

      {/* Vendors Table */}
      <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', paddingBottom: '4px' }}>
        <table style={{ width: '100%', minWidth: '850px', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f95e10', color: '#ffffff' }}>
              <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap' }}>Vendor Code</th>
              <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap' }}>Contact Person</th>
              <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap' }}>Company Name</th>
              <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap' }}>Contact Number</th>
              <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap' }}>Status</th>
              <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                  Loading vendors from database...
                </td>
              </tr>
            ) : paginatedVendors.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                  No vendor records found matching criteria.
                </td>
              </tr>
            ) : (
              paginatedVendors.map(v => (
                <tr key={v._id || v.vendorCode} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 900, color: '#ff5a1f' }}>
                    {v.vendorCode}
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: 800, color: '#0f172a' }}>
                    {v.name}
                  </td>
                  <td style={{ padding: '14px 16px', color: '#475569', fontWeight: 600 }}>
                    {v.companyName || '—'}
                  </td>
                  <td style={{ padding: '14px 16px', color: '#64748b' }}>
                    {v.phone || '—'}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(v)}
                      style={{
                        background: v.status === 'ACTIVE' ? '#dcfce7' : '#fef2f2',
                        color: v.status === 'ACTIVE' ? '#16a34a' : '#dc2626',
                        border: `1px solid ${v.status === 'ACTIVE' ? '#bbf7d0' : '#fecaca'}`,
                        padding: '3px 10px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 800,
                        cursor: 'pointer'
                      }}
                    >
                      {v.status || 'ACTIVE'}
                    </button>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => { setViewingVendor(v); setViewState('VIEW_PROFILE'); }}
                        title="View Vendor Profile"
                        style={{
                          ...actionIconBtnStyle,
                          background: '#eff6ff',
                          border: '1px solid #bfdbfe',
                          color: '#2563eb'
                        }}
                      >
                        <EyeIcon size={15} color="#2563eb" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditVendor(v)}
                        title="Edit Vendor"
                        style={{
                          ...actionIconBtnStyle,
                          background: '#eff6ff',
                          border: '1px solid #bfdbfe',
                          color: '#2563eb'
                        }}
                      >
                        <PencilIcon size={15} color="#2563eb" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(v)}
                        title="Delete Vendor"
                        style={{
                          ...actionIconBtnStyle,
                          background: '#fef2f2',
                          border: '1px solid #fecaca',
                          color: '#dc2626'
                        }}
                      >
                        <TrashIcon size={15} color="#dc2626" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <PaginationBar
        currentPage={currentPage}
        totalItems={filteredVendors.length}
        pageSize={PAGE_SIZE}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
