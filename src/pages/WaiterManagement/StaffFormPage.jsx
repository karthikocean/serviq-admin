import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppState } from '../../config/AppContext';
import ShowNotifications from '../../helper/ShowNotifications';
import { sanitizeMobile, validateMobile } from '../../helper/ValidationHelper';

export default function StaffFormPage() {
  const navigate = useNavigate();
  const { staffId } = useParams();
  const { activeRestaurant, addStaff, updateStaff, selectedBranchId, currentUser } = useAppState();

  const roleStr = typeof currentUser?.role === 'object' && currentUser?.role !== null
    ? (currentUser?.role?.roleName || currentUser?.role?.name || '')
    : (typeof currentUser?.role === 'string' ? currentUser.role : '');
  const userTypeStr = typeof currentUser?.userType === 'string' ? currentUser.userType : '';

  const userRole = (roleStr || '').toLowerCase();
  const userType = (userTypeStr || '').toUpperCase();
  const isAdminOrOwner = userRole === 'admin' || userRole === 'super admin' || userRole === 'owner' || userRole === 'restaurant_owner' || userType === 'ADMIN' || userType === 'SUPER ADMIN' || userType === 'SUPER_ADMIN' || userType === 'RESTAURANT_OWNER' || userType === 'OWNER';

  const rawBranches = activeRestaurant?.branches || [];
  const branches = (selectedBranchId && selectedBranchId !== 'ALL')
    ? rawBranches.filter(b => String(b.id || b._id) === String(selectedBranchId))
    : rawBranches;
  const isEdit = !!staffId;
  const existingStaff = isEdit && activeRestaurant?.staff
    ? activeRestaurant.staff.find(s => s.id === staffId || s.id === parseInt(staffId))
    : null;

  const [form, setForm] = useState({
    name: '',
    branchId: (selectedBranchId && selectedBranchId !== 'ALL') ? selectedBranchId : (branches.length > 0 ? (branches[0].id || branches[0]._id) : 'BR-001'),
    role: 'Waiter',
    phone: '',
    email: '',
    password: '',
    status: 'On Duty'
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (existingStaff) {
      setForm({
        name: existingStaff.name || '',
        branchId: existingStaff.branchId || (selectedBranchId || 'BR-001'),
        role: existingStaff.role || 'Waiter',
        phone: existingStaff.phone || '',
        email: existingStaff.email || '',
        password: existingStaff.password || '',
        status: existingStaff.status || 'On Duty'
      });
    }
  }, [existingStaff, selectedBranchId]);

  const validate = () => {
    const errors = {};
    if (!form.name.trim()) {
      errors.name = 'Full Name is required.';
    } else if (!/^[a-zA-Z\s.]+$/.test(form.name.trim())) {
      errors.name = 'Full Name should contain letters only.';
    }

    const mobileErr = validateMobile(form.phone);
    if (mobileErr) {
      errors.phone = mobileErr;
    }

    if (!form.email.trim()) {
      errors.email = 'Email Address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!form.password.trim()) {
      errors.password = 'Password is required.';
    } else if (form.password.length < 4) {
      errors.password = 'Password must be at least 4 characters.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (isEdit) {
      if (updateStaff) {
        updateStaff(activeRestaurant.id, {
          id: existingStaff ? existingStaff.id : staffId,
          ...form
        });
      }
      ShowNotifications.showAlertNotification(`Staff member "${form.name}" updated successfully.`, true);
    } else {
      if (addStaff) {
        addStaff(activeRestaurant.id, {
          id: `ST-${Date.now()}`,
          ...form
        });
      }
      ShowNotifications.showAlertNotification(`Staff member "${form.name}" created successfully.`, true);
    }

    navigate('/staff');
  };

  return (
    <section className="panel-view active" style={{ padding: '0 0 24px 0', width: '100%' }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        padding: '24px 32px',
        marginBottom: '24px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            type="button"
            onClick={() => navigate('/staff')}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px',
              borderRadius: '50%',
              color: '#0f172a'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
              {isEdit ? 'Edit Staff Member' : 'Add New Staff Member'}
            </h2>
          </div>
        </div>
      </div>

      <div style={{ background: '#ffffff', borderRadius: '16px', padding: '36px 40px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <form onSubmit={handleSubmit} noValidate style={{ width: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
                Full Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => {
                  setForm({ ...form, name: e.target.value });
                  if (formErrors.name) setFormErrors({ ...formErrors, name: '' });
                }}
                placeholder="e.g. Ramesh Kumar"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: formErrors.name ? '1.5px solid #ef4444' : '1px solid #e2e8f0',
                  fontSize: '14px',
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
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
                Branch Assignment <span style={{ color: '#ef4444' }}>*</span>
              </label>
              {isAdminOrOwner ? (
                <select
                  value={form.branchId || ''}
                  onChange={e => setForm({ ...form, branchId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                    fontWeight: 600,
                    outline: 'none',
                    backgroundColor: '#ffffff',
                    color: '#0f172a',
                    cursor: 'pointer',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">-- Select Branch --</option>
                  {(rawBranches || []).map(b => (
                    <option key={b._id || b.id} value={b._id || b.id}>
                      {b.branchName || b.name} {b.branchCode ? `(${b.branchCode})` : ''}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={(() => {
                    const bObj = (branches || []).find(b => String(b.id || b._id) === String(form.branchId))
                      || (branches && branches.length > 0 ? branches[0] : null);
                    return bObj
                      ? `${bObj.branchName || bObj.name || 'Branch'}${bObj.branchCode ? ` (${bObj.branchCode})` : ''}`
                      : (selectedBranchId || 'Default Branch');
                  })()}
                  readOnly
                  disabled
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '14px',
                    fontWeight: 600,
                    outline: 'none',
                    backgroundColor: '#f8fafc',
                    color: '#64748b',
                    cursor: 'not-allowed',
                    boxSizing: 'border-box'
                  }}
                />
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
                Role <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', backgroundColor: '#ffffff', boxSizing: 'border-box' }}
              >
                <option value="Waiter">Waiter</option>
                <option value="Kitchen">Kitchen Staff</option>
                <option value="Manager">Branch Manager</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
                Phone Number <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                maxLength={10}
                inputMode="numeric"
                value={form.phone}
                onChange={(e) => {
                  const val = sanitizeMobile(e.target.value);
                  setForm({ ...form, phone: val });
                  if (formErrors.phone) setFormErrors({ ...formErrors, phone: '' });
                }}
                placeholder="10 digit mobile number"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: formErrors.phone ? '1.5px solid #ef4444' : '1px solid #e2e8f0',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              {formErrors.phone && (
                <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                  {formErrors.phone}
                </span>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
                Email Address <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                value={form.email}
                onChange={(e) => {
                  setForm({ ...form, email: e.target.value });
                  if (formErrors.email) setFormErrors({ ...formErrors, email: '' });
                }}
                placeholder="e.g. ramesh@serviq.com"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: formErrors.email ? '1.5px solid #ef4444' : '1px solid #e2e8f0',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              {formErrors.email && (
                <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                  {formErrors.email}
                </span>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
                Password <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                value={form.password}
                onChange={(e) => {
                  setForm({ ...form, password: e.target.value });
                  if (formErrors.password) setFormErrors({ ...formErrors, password: '' });
                }}
                placeholder="e.g. waiter123"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: formErrors.password ? '1.5px solid #ef4444' : '1px solid #e2e8f0',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              {formErrors.password && (
                <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                  {formErrors.password}
                </span>
              )}
            </div>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
              Duty Status
            </label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', backgroundColor: '#ffffff', boxSizing: 'border-box' }}
            >
              <option value="On Duty">On Duty</option>
              <option value="Off Duty">Off Duty</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="button"
              onClick={() => navigate('/staff')}
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#0f172a',
                fontWeight: 700,
                borderRadius: '8px',
                padding: '10px 24px',
                fontSize: '14px',
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
                padding: '10px 24px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              {isEdit ? 'Save Changes' : 'Create Staff Member'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
