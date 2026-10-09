import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAppState } from '../../config/AppContext';
import ShowNotifications from '../../helper/ShowNotifications';
import TableApi from '../../api/Table';
import StaffApi from '../../api/Staff';
import UserApi from '../../api/User';
import BranchApi from '../../api/Branch';
import RoleApi from '../../api/Role';
import SearchableSelect from '../../components/SearchableSelect.jsx';
import { isUserCompanyUser, getUserAssignedBranchId } from '../../helper/BranchHelper.js';

export default function TableFormPage() {
  const navigate = useNavigate();
  const { tableId } = useParams();
  const location = useLocation();
  const { activeRestaurant, selectedBranchId, currentUser, addDiningTable, updateDiningTable } = useAppState();

  const isCompanyUser = isUserCompanyUser(currentUser);
  const userBranchId = getUserAssignedBranchId(currentUser);
  const isBranchLogin = !isCompanyUser && Boolean(userBranchId);

  // Get default branch from context
  const cleanSelectedBranch = (selectedBranchId && selectedBranchId !== 'ALL' && String(selectedBranchId).toUpperCase() !== 'COMPANY')
    ? selectedBranchId
    : '';

  // Determine Company vs Branch scope:
  const isCompanyScope = isCompanyUser && (!cleanSelectedBranch);
  const isBranchLocked = !isCompanyScope;

  const [branches, setBranches] = useState(() => activeRestaurant?.branches || []);
  const [allRoles, setAllRoles] = useState([]);
  const [allStaff, setAllStaff] = useState(() => {
    if (Array.isArray(activeRestaurant?.staff) && activeRestaurant.staff.length > 0) return activeRestaurant.staff;
    if (Array.isArray(activeRestaurant?.users) && activeRestaurant.users.length > 0) return activeRestaurant.users;
    return [];
  });
  const [existingTablesList, setExistingTablesList] = useState([]);
  const isEdit = !!tableId;
  const [existingTable, setExistingTable] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const defaultBranchId = isBranchLogin ? userBranchId : cleanSelectedBranch;

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

  // Sync form branch and next Table ID when locked to a branch
  useEffect(() => {
    if (isBranchLocked) {
      const lockedBranch = isBranchLogin ? userBranchId : cleanSelectedBranch;
      if (lockedBranch && form.branchId !== lockedBranch) {
        setForm(prev => ({ ...prev, branchId: lockedBranch }));
        if (!isEdit) {
          TableApi.getNextTableId({ branchId: lockedBranch })
            .then(res => {
              if (res?.status && res.response?.data?.nextId) {
                setForm(prev => ({ ...prev, id: res.response.data.nextId }));
              }
            })
            .catch(console.error);
        }
      }
    }
  }, [isBranchLocked, cleanSelectedBranch, userBranchId, isBranchLogin, isEdit]);

  const handleBranchChange = async (newBranchId) => {
    setForm(prev => ({ ...prev, branchId: newBranchId }));
    if (formErrors.branchId) {
      setFormErrors(prev => ({ ...prev, branchId: '' }));
    }
    if (!isEdit && newBranchId) {
      try {
        const res = await TableApi.getNextTableId({ branchId: newBranchId });
        if (res?.status && res.response?.data?.nextId) {
          setForm(prev => ({ ...prev, id: res.response.data.nextId }));
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

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
      const cleanBranchId = branchId && branchId !== 'ALL' ? branchId : undefined;
      const [staffRes, userRes, rolesRes] = await Promise.all([
        StaffApi.getStaff({ branchId: cleanBranchId, limit: 10 }),
        UserApi.getUsers({ branchId: cleanBranchId, limit: 10 }),
        RoleApi.getRoles({ limit: 10 })
      ]);

      let staffData = [];
      if (staffRes?.status && staffRes.response) {
        const raw = staffRes.response?.data || staffRes.response?.users || staffRes.response?.staff || (Array.isArray(staffRes.response) ? staffRes.response : []);
        if (Array.isArray(raw)) staffData = [...raw];
      }
      if (userRes?.status && userRes.response) {
        const uRaw = userRes.response?.data || userRes.response?.users || (Array.isArray(userRes.response) ? userRes.response : []);
        if (Array.isArray(uRaw)) {
          uRaw.forEach(u => {
            const exists = staffData.some(s => String(s._id || s.id) === String(u._id || u.id));
            if (!exists) staffData.push(u);
          });
        }
      }
      if (rolesRes?.status && rolesRes.response) {
        const rRaw = rolesRes.response?.data || (Array.isArray(rolesRes.response) ? rolesRes.response : []);
        if (Array.isArray(rRaw)) setAllRoles(rRaw);
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
      const wId = (typeof existingTable.assignedWaiter === 'object' && existingTable.assignedWaiter !== null)
        ? (existingTable.assignedWaiter._id || existingTable.assignedWaiter.id)
        : (existingTable.assignedWaiter || existingTable.assignedWaiterId?._id || existingTable.assignedWaiterId || '');
      
      const wName = (typeof existingTable.assignedWaiter === 'object' && existingTable.assignedWaiter !== null)
        ? (existingTable.assignedWaiter.name || existingTable.assignedWaiter.fullName)
        : (existingTable.assignedWaiterName || (typeof existingTable.assignedWaiterId === 'object' ? existingTable.assignedWaiterId.name : null));

      setForm(prev => ({
        ...prev,
        id: existingTable.tableNumber || existingTable.tableNum || existingTable.id || '',
        branchId: existingTable.branchId || selectedBranchId || '',
        name: existingTable.name || '',
        seats: existingTable.seatingCapacity ?? existingTable.seats ?? 4,
        section: existingTable.section || 'Main Dining',
        status: existingTable.status || 'Free',
        assignedWaiterId: wId ? String(wId) : ''
      }));

      // If existingTable has assigned waiter object, immediately register in allStaff if missing
      if (wId && wName) {
        setAllStaff(prev => {
          const exists = prev.some(s => String(s._id || s.id) === String(wId));
          if (!exists) {
            return [...prev, { _id: String(wId), id: String(wId), name: wName, role: 'Waiter', branchId: existingTable.branchId }];
          }
          return prev;
        });
      }
    }
  }, [existingTable, selectedBranchId]);

  // Filter waiters by role and branch (Waiters ONLY)
  const isOnlyWaiter = (s) => {
    if (!s) return false;
    const roleIdStr = typeof s.roleId === 'object' && s.roleId !== null ? (s.roleId?._id || s.roleId?.id) : s.roleId;
    const roleFromList = allRoles.find(r => String(r._id || r.id) === String(roleIdStr));
    const roleName = String(
      (typeof s.roleId === 'object' && s.roleId !== null ? (s.roleId?.roleName || s.roleId?.name) : '') ||
      (roleFromList?.roleName || roleFromList?.name || '') ||
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
      roleName.includes('steward') ||
      roleName.includes('captain') ||
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
    const staffBranchId = typeof s.branchId === 'object' && s.branchId !== null 
      ? (s.branchId._id || s.branchId.id) 
      : (s.branchId || (typeof s.branch === 'object' ? s.branch?._id : s.branch));
    if (!staffBranchId || staffBranchId === 'ALL') return true;
    return String(staffBranchId) === String(form.branchId);
  });

  // If the table currently has an assigned waiter, ensure that waiter is ALWAYS available in the options
  const currentAssignedId = String(form.assignedWaiterId || '');
  if (currentAssignedId && currentAssignedId !== 'Unassigned' && currentAssignedId !== 'null') {
    const isAlreadyPresent = availableWaiters.some(w => String(w._id || w.id || w.name) === currentAssignedId);
    if (!isAlreadyPresent) {
      const foundInAll = allStaff.find(s => String(s._id || s.id || s.name) === currentAssignedId);
      const fallbackName = (typeof existingTable?.assignedWaiter === 'object' ? existingTable.assignedWaiter?.name : null) || 
        existingTable?.assignedWaiterName || 
        foundInAll?.name || 
        'Assigned Waiter';
      
      availableWaiters.push({
        _id: currentAssignedId,
        id: currentAssignedId,
        name: fallbackName,
        role: 'Waiter'
      });
    }
  }

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
    const assignedTableNum = waiterAssignedTableMap[wId] || (wName ? waiterAssignedTableMap[wName] : null);
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
    ...unassignedWaiters.map(w => {
      const displayName = w.name || w.fullName || w.email || 'Waiter';
      return {
        value: String(w._id || w.id || w.name),
        label: `${displayName} (Unassigned)`
      };
    }),
    ...assignedWaiters.map(w => {
      const displayName = w.name || w.fullName || w.email || 'Waiter';
      const isCurrentTable = String(w.assignedTableNum) === String(form.id);
      return {
        value: String(w._id || w.id || w.name),
        label: isCurrentTable
          ? `${displayName} (Assigned to this table)`
          : `${displayName} (Assigned to Table ${w.assignedTableNum})`
      };
    })
  ];

  const validate = () => {
    const errors = {};

    if (!isBranchLocked && !form.branchId) {
      errors.branchId = 'Please select a branch.';
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

    const idStr = form.id ? form.id.trim() : '';
    const restaurantId = activeRestaurant?._id || activeRestaurant?.id || currentUser?.restaurantId;
    const effectiveBranchId = isBranchLocked
      ? (isBranchLogin && userBranchId ? userBranchId : (cleanSelectedBranch || form.branchId))
      : (form.branchId && form.branchId !== 'ALL' ? form.branchId : (branches[0]?._id || branches[0]?.id || currentUser?.activeBranchId || undefined));

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

    if (isEdit) {
      const res = await TableApi.updateTable(tableId, payload);
      if (res?.status) {
        if (updateDiningTable && activeRestaurant?.id) {
          updateDiningTable(activeRestaurant.id, tableId, {
            seats: payload.seatingCapacity,
            status: payload.status,
            section: payload.section
          }, true);
        }
        navigate('/tables');
      }
    } else {
      const res = await TableApi.createTable(payload);
      if (res?.status) {
        if (addDiningTable && activeRestaurant?.id) {
          addDiningTable(activeRestaurant.id, {
            id: res?.response?.data?.tableNumber || idStr || res?.response?.data?._id,
            seats: payload.seatingCapacity,
            status: payload.status,
            section: payload.section,
            branchId: payload.branchId
          }, true);
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
                const isLocked = isBranchLocked;

                let currentBranchVal = form.branchId;
                if (isBranchLocked) {
                  currentBranchVal = isBranchLogin && userBranchId ? userBranchId : (cleanSelectedBranch || form.branchId);
                } else if (currentBranchVal === 'COMPANY' || currentBranchVal === 'ALL' || currentBranchVal === 'all') {
                  currentBranchVal = '';
                }

                const currentBranchObj = currentBranchVal 
                  ? (allBranchesList.find(b => String(b._id || b.id) === String(currentBranchVal)) || allBranchesList.find(b => String(b.branchCode) === String(currentBranchVal)))
                  : null;
                let effectiveVal = currentBranchObj ? (currentBranchObj._id || currentBranchObj.id) : (currentBranchVal || '');

                const branchOptions = [
                  ...(isCompanyScope ? [{ value: '', label: 'Select Branch...' }] : [{ value: '', label: activeRestaurant?.name || activeRestaurant?.restaurantName || activeRestaurant?.businessName || 'Main Branch' }]),
                  ...allBranchesList.map(b => ({
                    value: b._id || b.id,
                    label: `${b.branchName || b.name} ${b.branchCode ? `(${b.branchCode})` : ''}`
                  }))
                ];

                return (
                  <div>
                    <SearchableSelect
                      value={effectiveVal}
                      onChange={e => handleBranchChange(e.target.value)}
                      isDisabled={isLocked}
                      options={branchOptions}
                      placeholder="Select Branch..."
                    />
                    {isLocked && (
                      <span style={{ color: '#64748b', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                        {isBranchLogin ? 'Branch is locked to your assigned branch.' : 'Branch is locked to currently selected branch.'}
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

          {/* Row 3: Assign Waiter & (Status if edit) */}
          <div style={{ display: 'grid', gridTemplateColumns: isEdit ? '1fr 1fr' : '1fr', gap: '20px', marginBottom: '24px' }}>
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

            {isEdit && (
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
                  Table Status
                </label>
                <SearchableSelect
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  options={[
                    { value: 'Free', label: 'Free' },
                    { value: 'Occupied', label: 'Occupied' },
                    { value: 'Reserved', label: 'Reserved' },
                    { value: 'Maintenance / Unavailable', label: 'Maintenance / Unavailable' }
                  ]}
                  placeholder="Select Status..."
                />
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
