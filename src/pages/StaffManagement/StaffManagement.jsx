import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../../config/AppContext';
import StaffManagementPanel from '../../components/StaffManagementPanel';
import { Modal } from '../../components/Modal';

export default function StaffManagement() {
  const {
    activeRestaurant,
    updateStaff,
    deleteStaff,
    assignTablesToWaiter,
    updateKitchenPassword,
    selectedBranchId
  } = useAppState();

  const navigate = useNavigate();

  // Waiter assignment modal states
  const [showAssignTablesModal, setShowAssignTablesModal] = useState(false);
  const [modalWaiterId, setModalWaiterId] = useState('');
  const [modalTableIds, setModalTableIds] = useState([]);
  const [modalCoverWaiterId, setModalCoverWaiterId] = useState('');

  // Kitchen settings modal states
  const [showKitchenModal, setShowKitchenModal] = useState(false);
  const [kitchenPasswordInput, setKitchenPasswordInput] = useState('');
  const [kitchenError, setKitchenError] = useState('');

  if (!activeRestaurant) return null;

  const rawStaff = activeRestaurant.staff || [];
  const rawTables = activeRestaurant.tables || [];
  const rawOrders = activeRestaurant.orders || [];
  const rawBranches = activeRestaurant.branches || [];

  const staff = selectedBranchId ? rawStaff.filter(s => s.branchId === selectedBranchId) : rawStaff;
  const tables = selectedBranchId ? rawTables.filter(t => t.branchId === selectedBranchId) : rawTables;
  const orders = selectedBranchId ? rawOrders.filter(o => o.branchId === selectedBranchId) : rawOrders;
  const branches = rawBranches;

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
    if (waiters.length === 0) {
      ShowNotifications.showAlertNotification("No waiters available to assign tables.", false);
      return;
    }
    loadWaiterAssignments(waiterId || waiters[0].id);
    setShowAssignTablesModal(true);
  };

  const handleSaveAssignments = () => {
    if (!modalWaiterId) {
      ShowNotifications.showAlertNotification("Please select a waiter.", false);
      return;
    }
    if (assignTablesToWaiter && activeRestaurant?.id) {
      assignTablesToWaiter(activeRestaurant.id, modalWaiterId, modalTableIds, modalCoverWaiterId);
      ShowNotifications.showAlertNotification("Table assignments saved successfully!", true);
      setShowAssignTablesModal(false);
    }
  };

  const handleOpenKitchenSettings = () => {
    setKitchenPasswordInput(activeRestaurant?.kitchenLogin?.password || '');
    setKitchenError('');
    setShowKitchenModal(true);
  };

  const handleSaveKitchenPassword = (e) => {
    e.preventDefault();
    if (!kitchenPasswordInput.trim()) {
      setKitchenError('Password is required.');
      return;
    }
    if (kitchenPasswordInput.trim().length < 4) {
      setKitchenError('Password must be at least 4 characters.');
      return;
    }
    if (updateKitchenPassword) {
      updateKitchenPassword(activeRestaurant.id, kitchenPasswordInput.trim());
      ShowNotifications.showAlertNotification('Kitchen password updated successfully.', true);
      setShowKitchenModal(false);
    }
  };

  return (
    <>
      <StaffManagementPanel
        staff={staff}
        tables={tables}
        orders={orders}
        branches={branches}
        activeRestaurant={activeRestaurant}
        updateStaff={updateStaff}
        deleteStaff={deleteStaff}
        handleOpenAssignTablesModal={handleOpenAssignTablesModal}
        openKitchenSettingsModal={handleOpenKitchenSettings}
        openAddStaffModal={() => navigate('/staff/add')}
        openEditStaffModal={(staffMember) => navigate(`/staff/edit/${staffMember.id}`)}
      />

      {/* ASSIGN TABLES MODAL */}
      <Modal
        isOpen={showAssignTablesModal}
        onClose={() => setShowAssignTablesModal(false)}
        title="Assign Dining Tables to Waiter"
        maxWidth="500px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', color: 'var(--text-main)', marginTop: '10px' }}>
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
                <option key={s.id} value={s.id}>
                  {s.name} ({s.status === 'On Duty' ? 'On Duty' : 'Off Duty'})
                </option>
              ))}
            </select>
          </div>

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
                const tableNameStr = `Table ${table.tableNumber || table.id}`;

                return (
                  <div
                    key={table.id}
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
                      gap: '8px',
                      fontSize: '13px',
                      fontWeight: '600',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: isAssignedToOther ? '1.5px solid #fecaca' : (isChecked ? '1.5px solid #ff7a00' : '1px solid var(--border)'),
                      backgroundColor: isAssignedToOther ? '#fef2f2' : (isChecked ? '#fff7ed' : '#ffffff'),
                      cursor: isAssignedToOther ? 'not-allowed' : 'pointer',
                      transition: 'all 0.15s ease',
                      opacity: isAssignedToOther ? 0.75 : 1
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      disabled={isAssignedToOther}
                      onChange={e => {
                        if (isAssignedToOther) {
                          ShowNotifications.showAlertNotification(`${tableNameStr} is already assigned to waiter "${currentlyAssigned.name}".`, false);
                          return;
                        }
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
                        cursor: isAssignedToOther ? 'not-allowed' : 'pointer'
                      }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <span style={{ color: isAssignedToOther ? '#991b1b' : 'var(--text-main)' }}>
                          {tableNameStr}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {table.seats} seats
                        </span>
                      </div>
                      {isAssignedToOther && (
                        <span style={{ fontSize: '10px', color: '#dc2626', fontWeight: 700, marginTop: '2px' }}>
                          🚫 Already assigned to {currentlyAssigned.name}
                        </span>
                      )}
                      {!isAssignedToOther && isChecked && (
                        <span style={{ fontSize: '10px', color: '#ea580c', fontWeight: 700, marginTop: '2px' }}>
                          ✓ Assigned to this waiter
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

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

      {/* KITCHEN SETTINGS MODAL */}
      <Modal
        isOpen={showKitchenModal}
        onClose={() => setShowKitchenModal(false)}
        title="Kitchen Station Credentials"
        maxWidth="440px"
      >
        <form onSubmit={handleSaveKitchenPassword} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>
              Kitchen Station Email
            </label>
            <input
              type="email"
              value={activeRestaurant?.kitchenLogin?.email || ''}
              readOnly
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '13px',
                backgroundColor: '#f8fafc',
                color: '#64748b',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>
              Kitchen Station Password <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              value={kitchenPasswordInput}
              onChange={(e) => {
                setKitchenPasswordInput(e.target.value);
                if (kitchenError) setKitchenError('');
              }}
              placeholder="e.g. kitchen123"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: kitchenError ? '1.5px solid #ef4444' : '1.5px solid #fdba74',
                fontSize: '14px',
                fontWeight: 600,
                outline: 'none',
                backgroundColor: '#fff',
                boxSizing: 'border-box'
              }}
            />
            {kitchenError && (
              <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                {kitchenError}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setShowKitchenModal(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-black"
            >
              Save Password
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
