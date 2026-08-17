import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState, DEFAULT_ROLES } from '../../config/AppContext';
import TablesPanel from '../../components/TablesPanel';
import { Modal } from '../../components/Modal';
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

  const rawTables = activeRestaurant.tables || [];
  const rawStaff = activeRestaurant.staff || [];
  const rawOrders = activeRestaurant.orders || [];

  const tables = selectedBranchId ? rawTables.filter(t => t.branchId === selectedBranchId) : rawTables;
  const staff = selectedBranchId ? rawStaff.filter(s => s.branchId === selectedBranchId) : rawStaff;
  const orders = selectedBranchId ? rawOrders.filter(o => o.branchId === selectedBranchId) : rawOrders;

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
      const assignedTables = tables.filter(t => t.assignedWaiterId === waiterId);
      setModalTableIds(assignedTables.map(t => t.id));
      const firstTableWithCover = assignedTables.find(t => t.tempWaiterId);
      setModalCoverWaiterId(firstTableWithCover ? firstTableWithCover.tempWaiterId : '');
    } else {
      setModalTableIds([]);
      setModalCoverWaiterId('');
    }
  };

  const handleOpenAssignTablesModal = (waiterId) => {
    const waiters = staff.filter(s => s.role === 'Waiter');
    const targetId = waiterId || (waiters.length > 0 ? waiters[0].id : '');
    loadWaiterAssignments(targetId);
    setShowAssignTablesModal(true);
  };

  const handleSaveAssignments = () => {
    if (!modalWaiterId) return;
    assignTablesToWaiter(activeRestaurant.id, modalWaiterId, modalTableIds, modalCoverWaiterId);
    setShowAssignTablesModal(false);
  };

  return (
    <>
      <TablesPanel
        tables={tables}
        staff={staff}
        orders={orders}
        activeRestaurant={activeRestaurant}
        updateDiningTable={updateDiningTable}
        deleteDiningTable={deleteDiningTable}
        handleOpenAssignTablesModal={handleOpenAssignTablesModal}
        setAddTableForm={(formState) => {
          if (formState?.id) {
            navigate(`/tables/edit/${formState.id}`);
          } else {
            navigate('/tables/add');
          }
        }}
        setActivePage={(page) => {
          if (page === 'table-form') navigate('/tables/add');
          else if (page === 'waiter-list') navigate('/waiter/list');
        }}
        hasPermission={hasPermission}
        generateQrCode={generateQrCode}
        assignQrCode={assignQrCode}
        revokeQrCode={revokeQrCode}
        deleteQrCode={deleteQrCode}
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
              {staff.filter(s => s.role === 'Waiter').map(s => (
                <option key={s.id} value={s.name}>
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
              {tables.map(table => {
                const isChecked = modalTableIds.includes(table.id);
                const currentlyAssigned = table.assignedWaiterId ? staff.find(s => s.id === table.assignedWaiterId) : null;
                const isAssignedToOther = currentlyAssigned && currentlyAssigned.id !== modalWaiterId;

                return (
                  <label
                    key={table.id}
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
                        if (e.target.checked) {
                          setModalTableIds([...modalTableIds, table.id]);
                        } else {
                          setModalTableIds(modalTableIds.filter(id => id !== table.id));
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
                      <span>{table.id} <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>({table.seats} seats)</span></span>
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
                .filter(s => s.role === 'Waiter' && s.id !== modalWaiterId)
                .map(s => (
                  <option key={s.id} value={s.id}>
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
