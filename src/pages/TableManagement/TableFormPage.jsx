import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAppState } from '../../config/AppContext';
import ShowNotifications from '../../helper/ShowNotifications';
import TableApi from '../../api/Table';
import StaffApi from '../../api/Staff';
import UserApi from '../../api/User';
import BranchApi from '../../api/Branch';
import SearchableSelect from '../../components/SearchableSelect.jsx';

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
  const [allStaff, setAllStaff] = useState(() => {
    if (Array.isArray(activeRestaurant?.staff) && activeRestaurant.staff.length > 0) return activeRestaurant.staff;
    if (Array.isArray(activeRestaurant?.users) && activeRestaurant.users.length > 0) return activeRestaurant.users;
    return [];
  });
  const [existingTablesList, setExistingTablesList] = useState([]);
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
    fetchExistingTables(form.branchId);
  }, [form.branchId]);

  const fetchStaff = async (branchId) => {
    try {
      const res = await StaffApi.getStaff(branchId);
      let staffData = [];
      if (res?.status && res.response) {
        if (Array.isArray(res.response?.data)) staffData = res.response.data;
        else if (Array.isArray(res.response?.users)) staffData = res.response.users;
        else if (Array.isArray(res.response?.staff)) staffData = res.response.staff;
        else if (Array.isArray(res.response)) staffData = res.response;
      }
      if (staffData.length === 0) {
        try {
          const uRes = await UserApi.getUsers({ branchId: branchId && branchId !== 'ALL' ? branchId : undefined, limit: 10 });
          if (uRes?.status && uRes.response) {
            const ud = uRes.response?.data || uRes.response?.users || (Array.isArray(uRes.response) ? uRes.response : []);
            if (Array.isArray(ud) && ud.length > 0) staffData = ud;
          }
        } catch (e) {}
      }
      if (staffData.length === 0) {
        const localStaff = activeRestaurant?.staff || activeRestaurant?.users || [];
        if (localStaff.length > 0) staffData = localStaff;
      }
      if (staffData.length > 0) {
        setAllStaff(staffData);
      }
    } catch (e) {
      console.error("fetchStaff error in TableFormPage:", e);
    }
  };

  const fetchExistingTables = async (branchId) => {
    try {
      const branchParam = branchId && branchId !== 'ALL' ? { branchId } : { branchId: 'ALL' };
      const res = await TableApi.getTables(branchParam);
      if (res?.status && res.response) {
        const td = res.response?.data || res.response?.tables || (Array.isArray(res.response) ? res.response : []);
        setExistingTablesList(Array.isArray(td) ? td : []);
      }
    } catch (e) {
      console.error("Fetch existing tables error in TableFormPage:", e);
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

  // Filter waiters by role and branch (Waiters ONLY)
  const isOnlyWaiter = (s) => {
    if (!s) return false;
    const roleName = String(
      (typeof s.roleId === 'object' && s.roleId !== null ? (s.roleId?.roleName || s.roleId?.name) : (s.roleId && !String(s.roleId).match(/^[0-9a-fA-F]{24}$/) ? s.roleId : '')) ||
      (typeof s.role === 'object' && s.role !== null ? (s.role?.roleName || s.role?.name) : (s.role && !String(s.role).match(/^[0-9a-fA-F]{24}$/) ? s.role : '')) ||
      s.roleName ||
      s.designation ||
      s.title ||
      ''
    ).toLowerCase().trim();
    const userType = String(s.userType || '').toUpperCase().trim();

    if (
      roleName.includes('kitchen') ||
      roleName.includes('chef') ||
      roleName.includes('cook') ||
      roleName.includes('manager') ||
      roleName.includes('admin') ||
      roleName.includes('owner') ||
      roleName.includes('station') ||
      roleName.includes('cashier') ||
      roleName.includes('accountant') ||
      roleName.includes('inventory') ||
      roleName.includes('helper') ||
      roleName.includes('cleaner') ||
      userType === 'STATION' ||
      userType === 'BRANCH_ADMIN' ||
      userType === 'ADMIN' ||
      userType === 'SUPER_ADMIN' ||
      userType === 'RESTAURANT_OWNER' ||
      userType === 'OWNER'
    ) {
      return false;
    }
    return (
      roleName.includes('waiter') ||
      roleName.includes('server') ||
      roleName === 'waiter' ||
      userType === 'WAITER' ||
      userType === 'SERVER'
    );
  };

  const filteredWaiters = allStaff.filter(isOnlyWaiter);
  // Fallback: if no staff specifically match 'waiter' role, allow all non-admin staff
  const allWaiters = filteredWaiters.length > 0 ? filteredWaiters : allStaff;

  const availableWaiters = allWaiters.filter(s => {
    if (!form.branchId || form.branchId === 'ALL') return true;
    const staffBranchId = s.branchId?._id || s.branchId || s.branch?._id || s.branch;
    if (!staffBranchId || staffBranchId === 'ALL') return true;
    return String(staffBranchId) === String(form.branchId);
  });

  // Build map of waiters assigned to existing tables
  const waiterAssignedTableMap = {};
  existingTablesList.forEach(t => {
    const tId = String(t._id || t.id || '');
    if (isEdit && tableId && (tId === String(tableId) || String(t.tableNumber || t.tableNo) === String(form.id))) {
      return; // Exclude table currently being edited
    }
    const tNum = t.tableNumber || t.tableNo || t.id || t._id;
    let assignedId = null;
    let assignedName = null;
    if (t.assignedWaiter && typeof t.assignedWaiter === 'object') {
      assignedId = t.assignedWaiter._id || t.assignedWaiter.id;
      assignedName = t.assignedWaiter.name;
    } else if (typeof t.assignedWaiter === 'string') {
      if (t.assignedWaiter.match(/^[0-9a-fA-F]{24}$/)) assignedId = t.assignedWaiter;
      else assignedName = t.assignedWaiter;
    }
    if (t.assignedWaiterId) {
      if (typeof t.assignedWaiterId === 'object') {
        assignedId = t.assignedWaiterId._id || t.assignedWaiterId.id;
        assignedName = assignedName || t.assignedWaiterId.name;
      } else {
        assignedId = assignedId || t.assignedWaiterId;
      }
    }
    if (t.assignedWaiterName) {
      assignedName = assignedName || t.assignedWaiterName;
    }

    if (assignedId) {
      waiterAssignedTableMap[String(assignedId)] = tNum;
    }
    if (assignedName && assignedName !== 'Unassigned') {
      waiterAssignedTableMap[String(assignedName).trim().toLowerCase()] = tNum;
    }
  });

  // Separate unassigned and assigned waiters
  const unassignedWaiters = [];
  const assignedWaiters = [];
  availableWaiters.forEach(w => {
    const wId = String(w._id || w.id || '');
    const wName = String(w.name || '').trim().toLowerCase();
    const assignedTableNum = waiterAssignedTableMap[wId] || waiterAssignedTableMap[wName];
    if (assignedTableNum) {
      assignedWaiters.push({
        ...w,
        assignedTableNum
      });
    } else {
      unassignedWaiters.push(w);
    }
  });

  const waiterOptions = [
    { value: '', label: '-- None (Unassigned) --' },
    ...unassignedWaiters.map(w => ({
      value: w._id || w.id || w.name,
      label: `${w.name} (Unassigned)`
    })),
    ...assignedWaiters.map(w => ({
      value: w._id || w.id || w.name,
      label: `${w.name} (Assigned to Table ${w.assignedTableNum})`
    }))
  ];

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

    const token = sessionStorage.getItem("userToken") || sessionStorage.getItem("token");
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
                    <SearchableSelect
                      value={effectiveVal}
                      onChange={e => setForm(prev => ({ ...prev, branchId: e.target.value }))}
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
              <SearchableSelect
                value={form.section}
                onChange={(e) => setForm({ ...form, section: e.target.value })}
                options={[
                  { value: 'Main Dining', label: 'Main Dining' },
                  { value: 'Main Hall', label: 'Main Hall' },
                  { value: 'AC Dining', label: 'AC Dining' },
                  { value: 'AC Hall', label: 'AC Hall' },
                  { value: 'Family Section', label: 'Family Section' },
                  { value: 'Outdoor Terrace', label: 'Outdoor Terrace' },
                  { value: 'Garden View', label: 'Garden View' },
                  { value: 'VIP Lounge', label: 'VIP Lounge' }
                ]}
                placeholder="Select Section..."
              />
            </div>
          </div>

          {/* Row 3: Assign Waiter & (Occupancy Status if edit) */}
          <div style={{ display: 'grid', gridTemplateColumns: isEdit ? '1fr 1fr' : '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
                Assign Waiter (Optional)
              </label>
              <SearchableSelect
                value={form.assignedWaiterId || ''}
                onChange={(e) => setForm({ ...form, assignedWaiterId: e.target.value })}
                options={waiterOptions}
                placeholder="Select Waiter..."
              />
            </div>

            {isEdit ? (
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
                  Occupancy Status
                </label>
                <SearchableSelect
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  options={[
                    { value: 'Free', label: 'Free (Available)' },
                    { value: 'Occupied', label: 'Occupied' }
                  ]}
                  placeholder="Select Status..."
                />
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
