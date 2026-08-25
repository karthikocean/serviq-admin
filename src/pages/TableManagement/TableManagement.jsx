import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState, DEFAULT_ROLES } from '../../config/AppContext';
import TablesPanel from '../../components/TablesPanel';
import { Modal } from '../../components/Modal';
import TableApi from '../../api/Table';
import StaffApi from '../../api/Staff';
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

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const params = selectedBranchId ? { branchId: selectedBranchId } : { branchId: 'ALL' };
      const tablesRes = await TableApi.getTables(params);
      if (tablesRes.status && tablesRes.response?.data) {
        setTables(tablesRes.response.data);
      }
      const staffRes = await StaffApi.getStaff(params.branchId);
      if (staffRes.status && staffRes.response?.data) {
        setStaff(staffRes.response.data);
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

  const loadWaiterAssignments = (waiterId) => {
    setModalWaiterId(waiterId);
    if (waiterId) {
      const assignedTables = tables.filter(t => t.assignedWaiter === waiterId);
      setModalTableIds(assignedTables.map(t => t._id || t.id));
      const firstTableWithCover = assignedTables.find(t => t.tempWaiterId);
      setModalCoverWaiterId(firstTableWithCover ? firstTableWithCover.tempWaiterId : '');
    } else {
      setModalTableIds([]);
      setModalCoverWaiterId('');
    }
  };

  const handleOpenAssignTablesModal = (waiterId) => {
    const waiters = staff.filter(s => s.role === 'Waiter');
    const targetId = waiterId || (waiters.length > 0 ? waiters[0]._id || waiters[0].id : '');
    loadWaiterAssignments(targetId);
    setShowAssignTablesModal(true);
  };

  const handleSaveAssignments = async () => {
    if (!modalWaiterId) return;

    // Find tables to unassign (currently assigned to this waiter but not in modalTableIds)
    const toUnassign = tables.filter(t => t.assignedWaiter === modalWaiterId && !modalTableIds.includes(t._id || t.id));

    // Find tables to assign (in modalTableIds but not currently assigned to this waiter)
    const toAssign = tables.filter(t => modalTableIds.includes(t._id || t.id) && t.assignedWaiter !== modalWaiterId);

    // Call API for each
    const promises = [];
    for (const t of toUnassign) {
      promises.push(TableApi.updateTable(t._id || t.id, { assignedWaiter: null }));
    }
    for (const t of toAssign) {
      promises.push(TableApi.updateTable(t._id || t.id, { assignedWaiter: modalWaiterId }));
    }

    await Promise.all(promises);

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
            <select
              value={modalWaiterId}
              onChange={e => loadWaiterAssignments(e.target.value)}
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1.5px solid var(--border)',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-main)',
                fontSize: '14px',
                fontWeight: '600',
                outline: 'none',
                width: '100%'
              }}
            >
              <option value="" disabled>Select a Waiter</option>
              {staff.filter(s => s.role === 'Waiter').map((s, sIdx) => (
                <option key={s._id || s.id || `waiter-${sIdx}`} value={s.name}>
                  {s.name} ({s.status === 'On Duty' ? 'On Duty' : 'Off Duty'})
                </option>
              ))}
            </select>
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
                const tableIdent = table.id || table._id || table.tableNumber;
                const isChecked = modalTableIds.includes(table._id || table.id || tableIdent);
                const currentlyAssigned = table.assignedWaiterId ? staff.find(s => (s._id || s.id) === table.assignedWaiterId) : null;
                const isAssignedToOther = currentlyAssigned && (currentlyAssigned._id || currentlyAssigned.id) !== modalWaiterId;

                return (
                  <label
                    key={tableKey}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      padding: '4px 0',
                      color: 'var(--text-main)'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={e => {
                        const targetId = table._id || table.id || tableIdent;
                        if (e.target.checked) {
                          setModalTableIds([...modalTableIds, targetId]);
                        } else {
                          setModalTableIds(modalTableIds.filter(id => id !== targetId));
                        }
                      }}
                      style={{
                        accentColor: 'var(--primary)',
                        width: '16px',
                        height: '16px',
                        cursor: 'pointer'
                      }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span>{tableIdent} <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>({table.seats || 4} seats)</span></span>
                      {isAssignedToOther && (
                        <span style={{ fontSize: '10px', color: '#f59e0b', fontWeight: '500' }}>
                          Assigned: {currentlyAssigned.name}
                        </span>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Cover Waiter Selection */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--black)' }}>
              Cover Waiter <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'normal' }}>(Optional)</span>
            </label>
            <select
              value={modalCoverWaiterId}
              onChange={e => setModalCoverWaiterId(e.target.value)}
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1.5px solid var(--border)',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-main)',
                fontSize: '14px',
                fontWeight: '600',
                outline: 'none',
                width: '100%'
              }}
            >
              <option value="">No Cover Waiter</option>
              {staff
                .filter(s => s.role === 'Waiter' && (s._id || s.id) !== modalWaiterId)
                .map((s, sIdx) => (
                  <option key={s._id || s.id || `cover-${sIdx}`} value={s._id || s.id}>
                    {s.name} ({s.status === 'On Duty' ? 'On Duty' : 'Off Duty'})
                  </option>
                ))}
            </select>
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
