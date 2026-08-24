import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAppState } from '../../config/AppContext';
import ShowNotifications from '../../helper/ShowNotifications';
import TableApi from '../../api/Table';
import StaffApi from '../../api/Staff';
import BranchApi from '../../api/Branch';

export default function TableFormPage() {
  const navigate = useNavigate();
  const { tableId } = useParams();
  const location = useLocation();
  const { activeRestaurant, selectedBranchId, currentUser } = useAppState();

  const roleStr = typeof currentUser?.role === 'object' && currentUser?.role !== null
    ? (currentUser?.role?.roleName || currentUser?.role?.name || '')
    : (typeof currentUser?.role === 'string' ? currentUser.role : '');
  const userTypeStr = typeof currentUser?.userType === 'string' ? currentUser.userType : '';

  const userRole = (roleStr || '').toLowerCase();
  const userType = (userTypeStr || '').toUpperCase();
  const isAdminOrOwner = userRole === 'admin' || userRole === 'super admin' || userRole === 'owner' || userRole === 'restaurant_owner' || userType === 'ADMIN' || userType === 'SUPER ADMIN' || userType === 'SUPER_ADMIN' || userType === 'RESTAURANT_OWNER' || userType === 'OWNER';
  const isBranchLocked = !isAdminOrOwner;

  const [branches, setBranches] = useState([]);
  const [allStaff, setAllStaff] = useState([]);
  const isEdit = !!tableId;
  const [existingTable, setExistingTable] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Get default physical branch from localStorage
  const localUser = JSON.parse(localStorage.getItem('serviq_user') || '{}');
  const defaultBranchId = localUser.activeBranchId || (selectedBranchId !== 'ALL' ? selectedBranchId : '');

  const [form, setForm] = useState({
    id: tableId ? (tableId.startsWith('T-') ? tableId : `T-${tableId}`) : '',
    branchId: defaultBranchId,
    name: '',
    seats: 4,
    section: 'Main Dining',
    status: 'Free',
    assignedWaiterId: ''
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchBranches();
    if (isEdit) {
      fetchTable();
    } else if (location.state?.table) {
      setExistingTable(location.state.table);
    } else {
      // Auto-generate next available Table ID from live backend tables
      const fetchTablesForIdGen = async () => {
        if (!defaultBranchId) return; // Wait for user to select a branch if no active branch is found
        
        try {
          const res = await TableApi.getNextTableId({ branchId: defaultBranchId });
          if (res.status && res.response?.data?.nextId) {
            setForm(prev => ({
              ...prev,
              id: res.response.data.nextId
            }));
          }
        } catch (e) {
          console.error(e);
        }
      };
      fetchTablesForIdGen();
    }
  }, [tableId]);

  useEffect(() => {
    fetchStaff(form.branchId);
  }, [form.branchId]);

  const fetchStaff = async (branchId) => {
    const res = await StaffApi.getStaff(branchId);
    if (res.status && res.response?.data) {
      setAllStaff(res.response.data);
    }
  };

  const fetchBranches = async () => {
    const res = await BranchApi.getBranches();
    if (res.status && res.response?.data) {
      setBranches(res.response.data);
    }
  };

  const fetchTable = async () => {
    setIsLoading(true);
    const res = await TableApi.getTableDetails(tableId);
    if (res.status && res.response?.data) {
      setExistingTable(res.response.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (existingTable) {
      setForm({
        id: existingTable.tableNumber || existingTable.tableNum || existingTable.id || '',
        branchId: existingTable.branchId || selectedBranchId || '',
        name: existingTable.name || '',
        seats: existingTable.seatingCapacity ?? existingTable.seats ?? 4,
        section: existingTable.section || 'Main Dining',
        status: existingTable.status || 'Free',
        assignedWaiterId: existingTable.assignedWaiter?._id || existingTable.assignedWaiter || existingTable.assignedWaiterId || ''
      });
    }
  }, [existingTable, selectedBranchId]);

  // Filter waiters by role and branch
  const allWaiters = allStaff.filter(s => s.role === 'Waiter' || s.role?.name === 'Waiter' || (s.roleId && s.roleId.roleName === 'Waiter') || s.userType === 'STAFF');
  const availableWaiters = form.branchId
    ? allWaiters.filter(s => {
      const staffBranchId = s.branchId?._id || s.branchId;
      return staffBranchId === form.branchId || staffBranchId === 'ALL';
    })
    : [];

  const validate = () => {
    const errors = {};
    const idTrimmed = form.id.trim();
    if (!idTrimmed) {
      errors.id = 'Table Number / ID is required.';
    }

    const seatsNum = parseInt(form.seats);
    if (isNaN(seatsNum) || seatsNum < 1) {
      errors.seats = 'Please enter a valid seating capacity (at least 1 seat).';
    } else if (seatsNum > 50) {
      errors.seats = 'Seating capacity cannot exceed 50.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const idStr = form.id.trim();
    const selectedWaiterObj = allStaff.find(s => String(s.id) === String(form.assignedWaiterId));
    const assignedWaiterName = selectedWaiterObj ? selectedWaiterObj.name : null;

    if (isEdit) {
      const res = await TableApi.updateTable(tableId, {
        branchId: form.branchId,
        seatingCapacity: parseInt(form.seats) || 4,
        status: form.status,
        section: form.section,
        tableNumber: idStr,
        assignedWaiter: form.assignedWaiterId || null
      });
      if (res.status) {
        navigate('/tables');
      }
    } else {
      const res = await TableApi.createTable({
        restaurantId: activeRestaurant._id,
        branchId: form.branchId,
        seatingCapacity: parseInt(form.seats) || 4,
        status: form.status,
        section: form.section,
        tableNumber: idStr,
        assignedWaiter: form.assignedWaiterId || null
      });
      if (res.status) {
        navigate('/tables');
      }
    }
  };

  return (
    <section className="panel-view active" style={{ padding: '0 0 24px 0', width: '100%' }}>
      {/* Top Header Card */}
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
            onClick={() => navigate('/tables')}
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
              {isEdit ? 'Edit Dining Table' : 'Add Dining Table'}
            </h2>

          </div>
        </div>
      </div>

      {/* Main Form Card */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        padding: '36px 40px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
      }}>
        <form onSubmit={handleSubmit} noValidate style={{ width: '100%' }}>
          {/* Row 1: Branch Assignment & Table Number */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
                Branch Assignment <span style={{ color: '#ef4444' }}>*</span>
              </label>
              {isAdminOrOwner ? (
                <select
                  value={form.branchId || ''}
                  onChange={e => setForm(prev => ({ ...prev, branchId: e.target.value }))}
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
                  {(branches || []).map(b => (
                    <option key={b._id || b.id} value={b._id || b.id}>
                      {b.branchName || b.name} {b.branchCode ? `(${b.branchCode})` : ''}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={(() => {
                    const bObj = (branches || []).find(b => String(b._id || b.id) === String(form.branchId))
                      || (branches || []).find(b => String(b._id || b.id) === String(selectedBranchId))
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

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>
                  Table Number / ID <span style={{ color: '#ef4444' }}>*</span>
                </label>
              </div>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type="text"
                  value={form.id}
                  disabled={true}
                  onChange={(e) => {
                    setForm({ ...form, id: e.target.value });
                    if (formErrors.id) setFormErrors({ ...formErrors, id: '' });
                  }}
                  placeholder="e.g. TBL-A-001"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: formErrors.id ? '1.5px solid #ef4444' : '1px solid #e2e8f0',
                    fontSize: '14px',
                    fontWeight: 700,
                    outline: 'none',
                    backgroundColor: '#f8fafc',
                    cursor: 'not-allowed',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              {formErrors.id && (
                <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                  {formErrors.id}
                </span>
              )}
            </div>
          </div>


          {/* Row 2: Seating Capacity & Section */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
                Seating Capacity <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={form.seats}
                onChange={(e) => {
                  setForm({ ...form, seats: e.target.value });
                  if (formErrors.seats) setFormErrors({ ...formErrors, seats: '' });
                }}
                placeholder="4"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: formErrors.seats ? '1.5px solid #ef4444' : '1px solid #e2e8f0',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              {formErrors.seats && (
                <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                  {formErrors.seats}
                </span>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
                Section / Area
              </label>
              <select
                value={form.section}
                onChange={(e) => setForm({ ...form, section: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '14px',
                  outline: 'none',
                  backgroundColor: '#ffffff',
                  boxSizing: 'border-box'
                }}
              >
                <option value="Main Dining">Main Dining</option>
                <option value="Main Hall">Main Hall</option>
                <option value="AC Dining">AC Dining</option>
                <option value="AC Hall">AC Hall</option>
                <option value="Family Section">Family Section</option>
                <option value="Outdoor Terrace">Outdoor Terrace</option>
                <option value="Garden View">Garden View</option>
                <option value="VIP Lounge">VIP Lounge</option>
              </select>
            </div>
          </div>

          {/* Row 3: Assign Waiter & (Occupancy Status if edit) */}
          <div style={{ display: 'grid', gridTemplateColumns: isEdit ? '1fr 1fr' : '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
                Assign Waiter (Optional)
              </label>
              <select
                value={form.assignedWaiterId || ''}
                onChange={(e) => setForm({ ...form, assignedWaiterId: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '14px',
                  outline: 'none',
                  backgroundColor: '#ffffff',
                  boxSizing: 'border-box'
                }}
              >
                <option value="">-- None (Unassigned) --</option>
                {availableWaiters.map(w => (
                  <option key={w._id || w.id} value={w._id || w.id}>
                    🤵 {w.name} ({w.status || 'Active'})
                  </option>
                ))}
              </select>
            </div>

            {isEdit ? (
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
                  Occupancy Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: '#ffffff',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="Free">Free (Available)</option>
                  <option value="Occupied">Occupied</option>
                </select>
              </div>
            ) : (
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#64748b', marginBottom: '8px' }}>
                  Initial Table Status
                </label>
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#16a34a',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a' }}></span>
                  Free (Ready for Guests)
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
            <button
              type="button"
              onClick={() => navigate('/tables')}
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
              {isEdit ? 'Save Changes' : 'Create Table'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
