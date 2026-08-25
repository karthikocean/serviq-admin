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
  const { activeRestaurant, selectedBranchId, currentUser, addDiningTable, updateDiningTable } = useAppState();

  const roleStr = typeof currentUser?.role === 'object' && currentUser?.role !== null
    ? (currentUser?.role?.roleName || currentUser?.role?.name || '')
    : (typeof currentUser?.role === 'string' ? currentUser.role : '');
  const userTypeStr = typeof currentUser?.userType === 'string' ? currentUser.userType : '';

  const userRole = (roleStr || '').toLowerCase();
  const userType = (userTypeStr || '').toUpperCase();
  const isAdminOrOwner = userRole === 'admin' || userRole === 'super admin' || userRole === 'owner' || userRole === 'restaurant_owner' || userType === 'ADMIN' || userType === 'SUPER ADMIN' || userType === 'SUPER_ADMIN' || userType === 'RESTAURANT_OWNER' || userType === 'OWNER';
  const isBranchLocked = !isAdminOrOwner;

  const [branches, setBranches] = useState(() => activeRestaurant?.branches || []);
  const [allStaff, setAllStaff] = useState([]);
  const isEdit = !!tableId;
  const [existingTable, setExistingTable] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Get default branch from context
  const defaultBranchId = currentUser?.activeBranchId || currentUser?.branchId || (selectedBranchId !== 'ALL' ? selectedBranchId : '');

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
  }, [existingTable]);

  // Filter waiters by role and branch
  const allWaiters = allStaff.filter(s => {
    const roleName = s.roleId?.roleName || s.role?.name || s.role || '';
    return roleName.toLowerCase() === 'waiter' || s.userType === 'STAFF';
  });
  const availableWaiters = form.branchId
    ? allWaiters.filter(s => {
      const staffBranchId = s.branchId?._id || s.branchId;
      return staffBranchId === form.branchId || staffBranchId === 'ALL';
    })
    : allWaiters;

  const validate = () => {
    const errors = {};

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

    const idStr = form.id ? form.id.trim() : '';
    const restaurantId = activeRestaurant?._id || activeRestaurant?.id || currentUser?.restaurantId;
    const effectiveBranchId = form.branchId && form.branchId !== 'ALL'
      ? form.branchId
      : (selectedBranchId && selectedBranchId !== 'ALL' ? selectedBranchId : (branches[0]?._id || branches[0]?.id || currentUser?.activeBranchId || undefined));

    const payload = {
      restaurantId: restaurantId,
      branchId: effectiveBranchId,
      seatingCapacity: parseInt(form.seats) || 4,
      status: form.status || 'Free',
      section: form.section || 'Main Dining',
      assignedWaiter: form.assignedWaiterId || null
    };

    if (idStr && idStr !== 'Auto-generated') {
      payload.tableNumber = idStr;
    }

    const token = localStorage.getItem("userToken") || localStorage.getItem("token");
    const isMock = token && token.startsWith("mock_");

    if (isEdit) {
      const res = await TableApi.updateTable(tableId, payload);
      if (res?.status || isMock) {
        if (updateDiningTable && activeRestaurant?.id) {
          updateDiningTable(activeRestaurant.id, tableId, {
            seats: payload.seatingCapacity,
            status: payload.status,
            section: payload.section
          });
        }
        navigate('/tables');
      }
    } else {
      const res = await TableApi.createTable(payload);
      if (res?.status || isMock) {
        if (addDiningTable && activeRestaurant?.id) {
          addDiningTable(activeRestaurant.id, {
            id: res?.response?.data?.tableNumber || idStr || `T-${Date.now().toString().slice(-3)}`,
            seats: payload.seatingCapacity,
            status: payload.status,
            section: payload.section,
            branchId: payload.branchId
          });
        }
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
              {(() => {
                const allBranchesList = (branches && branches.length > 0) ? branches : (activeRestaurant?.branches || []);
                const isLocked = !isAdminOrOwner || (selectedBranchId && selectedBranchId !== 'ALL');
                const headerBranchObj = (selectedBranchId && selectedBranchId !== 'ALL')
                  ? allBranchesList.find(b => String(b._id || b.id) === String(selectedBranchId) || String(b.branchCode) === String(selectedBranchId))
                  : null;
                const currentBranchObj = headerBranchObj 
                  || allBranchesList.find(b => String(b._id || b.id) === String(form.branchId))
                  || allBranchesList.find(b => String(b.branchCode) === String(form.branchId))
                  || (allBranchesList.length > 0 ? allBranchesList[0] : null);
                const effectiveVal = currentBranchObj ? (currentBranchObj._id || currentBranchObj.id) : (form.branchId || '');

                return (
                  <div>
                    <select
                      value={effectiveVal}
                      onChange={e => setForm(prev => ({ ...prev, branchId: e.target.value }))}
                      disabled={isLocked}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '14px',
                        fontWeight: 600,
                        outline: 'none',
                        backgroundColor: isLocked ? '#f8fafc' : '#ffffff',
                        color: isLocked ? '#64748b' : '#0f172a',
                        cursor: isLocked ? 'not-allowed' : 'pointer',
                        boxSizing: 'border-box'
                      }}
                    >
                      {allBranchesList.length === 0 ? (
                        <option value="">Main Branch</option>
                      ) : (
                        allBranchesList.map(b => (
                          <option key={b._id || b.id} value={b._id || b.id}>
                            {b.branchName || b.name} {b.branchCode ? `(${b.branchCode})` : ''}
                          </option>
                        ))
                      )}
                    </select>
                    {isLocked && (
                      <span style={{ color: '#64748b', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                        Branch is locked to currently selected branch.
                      </span>
                    )}
                  </div>
                );
              })()}
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>
                  Table Number
                </label>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>
                  Auto Generated
                </span>
              </div>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type="text"
                  value={form.id || (isEdit ? '' : 'Auto-generated')}
                  disabled={true}
                  readOnly
                  placeholder="Auto-generated"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                    fontWeight: 600,
                    outline: 'none',
                    backgroundColor: '#f8fafc',
                    color: '#64748b',
                    cursor: 'not-allowed',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
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
