import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState, DEFAULT_ROLES } from '../../config/AppContext';
import TablesPanel from '../../components/TablesPanel';
import { Modal } from '../../components/Modal';
import TableApi from '../../api/Table';
import StaffApi from '../../api/Staff';
import SearchableSelect from '../../components/SearchableSelect.jsx';
import './TableManagement.css';

export default function TableManagement() {
  const {
    currentUser,
    activeRestaurant,
    updateDiningTable,
    deleteDiningTable,
    assignTablesToWaiter,
    generateQrCode,
    assignQrCode,
    revokeQrCode,
    deleteQrCode,
    selectedBranchId
  } = useAppState();

  const navigate = useNavigate();
  const [showAssignTablesModal, setShowAssignTablesModal] = useState(false);
  const [modalWaiterId, setModalWaiterId] = useState('');
  const [modalTableIds, setModalTableIds] = useState([]);
  const [modalCoverWaiterId, setModalCoverWaiterId] = useState('');

  if (!activeRestaurant) return null;

  const [tables, setTables] = useState([]);
  const [staff, setStaff] = useState([]);
  const [orders, setOrders] = useState([]); // Or fetch from OrderApi if needed later
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (activeRestaurant) {
      fetchData();
    }
  }, [activeRestaurant, selectedBranchId]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchData = async (filters = {}) => {
    setIsLoading(true);
    try {
      const activeSearch = filters.search !== undefined ? filters.search : searchTerm;
      const activeStatus = filters.status !== undefined ? filters.status : statusFilter;
      const params = {
        branchId: selectedBranchId && selectedBranchId !== 'ALL' ? selectedBranchId : undefined,
        search: activeSearch ? activeSearch.trim() : undefined,
        status: activeStatus !== 'All' ? activeStatus : undefined
      };
      const tablesRes = await TableApi.getTables(params);
      if (tablesRes.status && tablesRes.response?.data) {
        setTables(tablesRes.response.data);
      }
      const staffRes = await StaffApi.getStaff(params.branchId);
      let staffData = [];
      if (staffRes?.status && staffRes.response) {
        if (Array.isArray(staffRes.response?.data)) staffData = staffRes.response.data;
        else if (Array.isArray(staffRes.response?.users)) staffData = staffRes.response.users;
        else if (Array.isArray(staffRes.response?.staff)) staffData = staffRes.response.staff;
        else if (Array.isArray(staffRes.response)) staffData = staffRes.response;
      }
      if (staffData.length === 0) {
        const localStaff = activeRestaurant?.staff || activeRestaurant?.users || [];
        if (localStaff.length > 0) staffData = localStaff;
      }
      if (staffData.length > 0) {
        setStaff(staffData);
      }
      // Orders dummy for now
      const rawOrders = activeRestaurant.orders || [];
      const branchOrders = selectedBranchId ? rawOrders.filter(o => o.branchId === selectedBranchId) : rawOrders;
      setOrders(branchOrders);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateDiningTable = async (id, payload) => {
    // We will override the context update with API later
  };

  const handleDeleteDiningTable = async (tableOrId, maybeId) => {
    const targetId = (typeof tableOrId === 'object' && tableOrId !== null)
      ? (tableOrId._id || tableOrId.id)
      : (tableOrId && tableOrId !== 'undefined' ? tableOrId : maybeId);

    if (!targetId || targetId === 'undefined') {
      console.error("Delete table called without a valid _id:", tableOrId, maybeId);
      return;
    }

    const res = await TableApi.deleteTable(targetId);
    if (res.status) {
      fetchData();
    }
  };



  // Permission checks
  const role = currentUser?.role || 'Waiter';
  const hasPermission = (moduleName, action = 'view') => {
    if (role === 'Admin') return true;
    const rolesConfig = activeRestaurant.roles || DEFAULT_ROLES;
    const userRoleConfig = rolesConfig[role] || DEFAULT_ROLES[role] || { permissions: {} };
    const modulePermissions = userRoleConfig.permissions?.[moduleName] || {};
    return !!modulePermissions[action];
  };

  // Filter waiters by role (Waiters ONLY)
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

  const resolveTableAssignedWaiter = (table, staffList = staff) => {
    if (!table) return null;
    if (table.assignedWaiter && typeof table.assignedWaiter === 'object') {
      const id = table.assignedWaiter._id || table.assignedWaiter.id;
      const name = table.assignedWaiter.name;
      if (id || name) {
        return {
          id: id || name,
          name: name || (id && staffList?.find(u => String(u._id || u.id) === String(id))?.name) || 'Assigned Waiter'
        };
      }
    }
    if (table.assignedWaiterId && typeof table.assignedWaiterId === 'object') {
      const id = table.assignedWaiterId._id || table.assignedWaiterId.id;
      const name = table.assignedWaiterId.name;
      if (id || name) {
        return {
          id: id || name,
          name: name || (id && staffList?.find(u => String(u._id || u.id) === String(id))?.name) || 'Assigned Waiter'
        };
      }
    }

    const rawId = table.assignedWaiterId || (typeof table.assignedWaiter === 'string' ? table.assignedWaiter : null) || table.waiterId;
    const rawName = table.assignedWaiterName || (typeof table.assignedWaiter === 'string' ? table.assignedWaiter : null);

    if (!rawId && !rawName) return null;

    if (staffList && staffList.length > 0) {
      const found = staffList.find(u => {
        const uId = String(u._id || u.id || '');
        const uName = String(u.name || '').trim().toLowerCase();
        if (rawId && uId === String(rawId)) return true;
        if (rawName && uName === String(rawName).trim().toLowerCase()) return true;
        if (rawId && uName === String(rawId).trim().toLowerCase()) return true;
        return false;
      });
      if (found) {
        return {
          id: found._id || found.id,
          name: found.name
        };
      }
    }

    if (rawName && rawName !== 'Unassigned' && rawName !== 'null' && rawName !== 'undefined') {
      return { id: rawId || rawName, name: rawName };
    }
    if (rawId && isNaN(rawId) && typeof rawId === 'string' && !rawId.match(/^[0-9a-fA-F]{24}$/)) {
      return { id: rawId, name: rawId };
    }

    return null;
  };

  const loadWaiterAssignments = (waiterId) => {
    setModalWaiterId(waiterId);
    if (waiterId) {
      const selectedWaiter = staff.find(s => String(s._id || s.id) === String(waiterId) || String(s.name) === String(waiterId));
      const assignedTables = tables.filter(t => {
        const assigned = resolveTableAssignedWaiter(t, staff);
        if (!assigned) return false;
        return String(assigned.id) === String(waiterId) || 
          (selectedWaiter && String(assigned.name).trim().toLowerCase() === String(selectedWaiter.name).trim().toLowerCase());
      });
      setModalTableIds(assignedTables.map(t => t._id || t.id));
      const firstTableWithCover = assignedTables.find(t => t.tempWaiterId || t.coverWaiterId);
      setModalCoverWaiterId(firstTableWithCover ? (firstTableWithCover.tempWaiterId || firstTableWithCover.coverWaiterId) : '');
    } else {
      setModalTableIds([]);
      setModalCoverWaiterId('');
    }
  };

  const handleOpenAssignTablesModal = (waiterId) => {
    const waiters = staff.filter(s => s.role === 'Waiter');
    const targetId = waiterId || (waiters.length > 0 ? (waiters[0]._id || waiters[0].id || waiters[0].name) : '');
    loadWaiterAssignments(targetId);
    setShowAssignTablesModal(true);
  };

  const handleSaveAssignments = async () => {
    if (!modalWaiterId) return;

    try {
      const selectedWaiter = staff.find(s => String(s._id || s.id) === String(modalWaiterId) || String(s.name) === String(modalWaiterId));
      const targetWaiterId = selectedWaiter?._id || selectedWaiter?.id || modalWaiterId;

      await TableApi.assignWaiter({
        waiterId: targetWaiterId,
        tableIds: modalTableIds,
        coverWaiterId: modalCoverWaiterId || null
      });
    } catch (e) {
      console.error(e);
    }

    setShowAssignTablesModal(false);
    fetchData(); // Refresh tables
  };

  return (
    <>
      <TablesPanel
        tables={tables}
        staff={staff}
        orders={orders}
        activeRestaurant={activeRestaurant}
        updateDiningTable={handleUpdateDiningTable}
        deleteDiningTable={handleDeleteDiningTable}
        handleOpenAssignTablesModal={handleOpenAssignTablesModal}
        setAddTableForm={(formState) => {
          const tableId = formState?._id || formState?.id;
          if (tableId) {
            navigate(`/tables/edit/${tableId}`);
          } else {
            navigate('/tables/add');
          }
        }}
        setActivePage={(page) => {
          // table-form navigation is handled by setAddTableForm callback
          if (page === 'waiter-list') navigate('/waiter/list');
        }}
        hasPermission={hasPermission}

      />

      {/* MODAL OVERLAY FOR ASSIGN TABLES */}
      <Modal
        isOpen={showAssignTablesModal}
        onClose={() => setShowAssignTablesModal(false)}
        title="Assign Tables to Waiter"
        maxWidth="500px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', color: 'var(--text-main)', marginTop: '10px' }}>
          {/* Waiter Selection */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--black)' }}>Select Waiter</label>
            <SearchableSelect
              value={modalWaiterId}
              onChange={e => loadWaiterAssignments(e.target.value)}
              options={((staff.filter(isOnlyWaiter).length > 0 ? staff.filter(isOnlyWaiter) : staff)).map((s, sIdx) => ({
                value: s.name,
                label: `${s.name} (${s.status === 'On Duty' ? 'On Duty' : (s.status || 'Active')})`
              }))}
              placeholder="Select a Waiter..."
            />
          </div>

          {/* Tables Selection */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--black)' }}>Select Tables to Assign</label>
            <div style={{
              maxHeight: '180px',
              overflowY: 'auto',
              border: '1.5px solid var(--border)',
              borderRadius: '8px',
              padding: '12px',
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '10px',
              backgroundColor: 'var(--bg-primary)'
            }}>
              {tables.map((table, tIdx) => {
                const tableKey = table._id || table.id || `table-${tIdx}`;
                const tId = table._id || table.id;
                const tableIdent = table.tableNumber || table.tableNo || table.id || table._id;
                const isChecked = modalTableIds.includes(tId) || modalTableIds.includes(tableIdent);
                const currentlyAssigned = resolveTableAssignedWaiter(table, staff);
                const selectedWaiter = staff.find(s => String(s._id || s.id) === String(modalWaiterId) || String(s.name) === String(modalWaiterId));
                const isAssignedToThisWaiter = currentlyAssigned && (
                  String(currentlyAssigned.id) === String(modalWaiterId) ||
                  (selectedWaiter && String(currentlyAssigned.name).trim().toLowerCase() === String(selectedWaiter.name).trim().toLowerCase())
                );
                const isAssignedToOther = currentlyAssigned && !isAssignedToThisWaiter;
                const tableNameStr = `Table ${tableIdent}`;

                return (
                  <div
                    key={tableKey}
                    onClick={(e) => {
                      if (isAssignedToOther) {
                        e.preventDefault();
                        e.stopPropagation();
                        ShowNotifications.showAlertNotification(`${tableNameStr} is already assigned to waiter "${currentlyAssigned.name}".`, false);
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontSize: '13px',
                      fontWeight: '600',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: isAssignedToOther ? '1.5px solid #fecaca' : (isChecked ? '1.5px solid #ff7a00' : '1px solid var(--border)'),
                      backgroundColor: isAssignedToOther ? '#fef2f2' : (isChecked ? '#fff7ed' : '#ffffff'),
                      cursor: isAssignedToOther ? 'not-allowed' : 'pointer',
                      transition: 'all 0.15s ease',
                      opacity: isAssignedToOther ? 0.85 : 1
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      disabled={isAssignedToOther}
                      onChange={e => {
                        const targetId = tId || tableIdent;
                        if (isAssignedToOther) {
                          ShowNotifications.showAlertNotification(`${tableNameStr} is already assigned to waiter "${currentlyAssigned.name}".`, false);
                          return;
                        }
                        if (e.target.checked) {
                          setModalTableIds([...modalTableIds, targetId]);
                        } else {
                          setModalTableIds(modalTableIds.filter(id => id !== targetId && id !== tId && id !== tableIdent));
                        }
                      }}
                      style={{
                        accentColor: 'var(--primary)',
                        width: '16px',
                        height: '16px',
                        cursor: isAssignedToOther ? 'not-allowed' : 'pointer',
                        flexShrink: 0
                      }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '6px' }}>
                        <span style={{ color: isAssignedToOther ? '#991b1b' : 'var(--text-main)', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {tableNameStr}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', flexShrink: 0 }}>
                          {table.seats || table.seatingCapacity || 4} seats
                        </span>
                      </div>
                      {isAssignedToOther && (
                        <span style={{ fontSize: '10px', color: '#dc2626', fontWeight: 700, marginTop: '2px', lineHeight: '1.2' }}>
                          🚫 Already assigned to {currentlyAssigned.name}
                        </span>
                      )}
                      {!isAssignedToOther && isChecked && (
                        <span style={{ fontSize: '10px', color: '#ea580c', fontWeight: 700, marginTop: '2px', lineHeight: '1.2' }}>
                          ✓ Assigned to this waiter
                        </span>
                      )}
                      {!isAssignedToOther && !isChecked && (
                        <span style={{ fontSize: '10px', color: '#16a34a', fontWeight: 600, marginTop: '2px', lineHeight: '1.2' }}>
                          Available
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Save Action */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setShowAssignTablesModal(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-black"
              onClick={handleSaveAssignments}
            >
              Save Assignments
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
