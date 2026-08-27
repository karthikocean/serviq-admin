import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppState } from '../../config/AppContext';
import ShowNotifications from '../../helper/ShowNotifications';
import { sanitizeMobile, validateMobile } from '../../helper/ValidationHelper';
import SearchableSelect from '../../components/SearchableSelect.jsx';

export default function StaffFormPage() {
  const navigate = useNavigate();
  const { staffId } = useParams();
  const { activeRestaurant, addStaff, updateStaff, selectedBranchId, currentUser, assignTablesToWaiter } = useAppState();

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

  const allTables = activeRestaurant?.tables || [];

  const [form, setForm] = useState({
    name: '',
    branchId: (selectedBranchId && selectedBranchId !== 'ALL') ? selectedBranchId : (branches.length > 0 ? (branches[0].id || branches[0]._id) : 'BR-001'),
    role: 'Waiter',
    phone: '',
    email: '',
    password: '',
    status: 'On Duty',
    assignedTableIds: []
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (existingStaff) {
      const staffAssignedTables = allTables
        .filter(t => t.assignedWaiterId === existingStaff.id || t.assignedWaiterId === staffId)
        .map(t => t.id);

      setForm({
        name: existingStaff.name || '',
        branchId: existingStaff.branchId || (selectedBranchId || 'BR-001'),
        role: existingStaff.role || 'Waiter',
        phone: existingStaff.phone || '',
        email: existingStaff.email || '',
        password: existingStaff.password || '',
        status: existingStaff.status || 'On Duty',
        assignedTableIds: staffAssignedTables
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

    const targetStaffId = existingStaff ? existingStaff.id : (isEdit ? staffId : `ST-${Date.now()}`);

    if (isEdit) {
      if (updateStaff) {
        updateStaff(activeRestaurant.id, {
          id: targetStaffId,
          ...form
        });
      }
      if (assignTablesToWaiter && form.role === 'Waiter') {
        assignTablesToWaiter(activeRestaurant.id, targetStaffId, form.assignedTableIds || []);
      }
      ShowNotifications.showAlertNotification(`Staff member "${form.name}" updated successfully.`, true);
    } else {
      if (addStaff) {
        addStaff(activeRestaurant.id, {
          id: targetStaffId,
          ...form
        });
      }
      if (assignTablesToWaiter && form.role === 'Waiter') {
        assignTablesToWaiter(activeRestaurant.id, targetStaffId, form.assignedTableIds || []);
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
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: 0, fontFamily: "'Outfit', sans-serif" }}>
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
              {(() => {
                const allBranchesList = (rawBranches && rawBranches.length > 0) ? rawBranches : (activeRestaurant?.branches || []);
                const isLocked = !isAdminOrOwner || (selectedBranchId && selectedBranchId !== 'ALL');
                const headerBranchObj = (selectedBranchId && selectedBranchId !== 'ALL')
                  ? allBranchesList.find(b => String(b.id || b._id) === String(selectedBranchId) || String(b.branchCode) === String(selectedBranchId))
                  : null;
                const currentBranchObj = headerBranchObj 
                  || allBranchesList.find(b => String(b.id || b._id) === String(form.branchId))
                  || allBranchesList.find(b => String(b.branchCode) === String(form.branchId))
                  || (allBranchesList.length > 0 ? allBranchesList[0] : null);
                const effectiveVal = currentBranchObj ? (currentBranchObj.id || currentBranchObj._id) : (form.branchId || '');

                return (
                  <div>
                    <SearchableSelect
                      value={effectiveVal}
                      onChange={e => setForm({ ...form, branchId: e.target.value })}
                      isDisabled={isLocked}
                      options={allBranchesList.length === 0 ? [
                        { value: '', label: 'Main Branch' }
                      ] : allBranchesList.map(b => ({
                        value: b._id || b.id,
                        label: `${b.branchName || b.name} ${b.branchCode ? `(${b.branchCode})` : ''}`
                      }))}
                      placeholder="Select Branch..."
                    />
                    {isLocked && (
                      <span style={{ color: '#64748b', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                        Branch is locked to currently selected branch.
                      </span>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
                Role <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <SearchableSelect
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                options={[
                  { value: 'Branch manager', label: 'Branch manager' },
                  { value: 'Kitchen', label: 'Kitchen' },
                  { value: 'Waiter', label: 'Waiter' }
                ]}
                placeholder="Select Role..."
              />
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

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
              Duty Status
            </label>
            <SearchableSelect
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              options={[
                { value: 'On Duty', label: 'On Duty' },
                { value: 'Off Duty', label: 'Off Duty' }
              ]}
              placeholder="Select Status..."
            />
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
