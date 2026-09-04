import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAppState } from '../../config/AppContext';
import { isModuleAllowedForPlan } from '../../config/initialData';
import StaffManagementPanel from '../../components/StaffManagementPanel';
import { Modal } from '../../components/Modal';
import SearchableSelect from '../../components/SearchableSelect.jsx';
import { validatePassword } from '../../helper/ValidationHelper';

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

  const currentPlan = activeRestaurant?.subscription?.planName || activeRestaurant?.plan || 'Standard';
  if (!isModuleAllowedForPlan('staff_management', activeRestaurant || currentPlan)) {
    return <Navigate to="/plans-management" replace />;
  }

  const rawStaff = activeRestaurant.staff || [];
  const rawTables = activeRestaurant.tables || [];
  const rawOrders = activeRestaurant.orders || [];
  const rawBranches = activeRestaurant.branches || [];

  const isBranchFiltered = selectedBranchId && selectedBranchId !== 'ALL';
  const staff = isBranchFiltered ? rawStaff.filter(s => s.branchId === selectedBranchId) : rawStaff;
  const tables = isBranchFiltered ? rawTables.filter(t => t.branchId === selectedBranchId) : rawTables;
  const orders = isBranchFiltered ? rawOrders.filter(o => o.branchId === selectedBranchId) : rawOrders;
  const branches = rawBranches;

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
      setModalTableIds(assignedTables.map(t => t.id || t._id));
      const firstTableWithCover = assignedTables.find(t => t.tempWaiterId || t.coverWaiterId);
      setModalCoverWaiterId(firstTableWithCover ? (firstTableWithCover.tempWaiterId || firstTableWithCover.coverWaiterId) : '');
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
    const pErr = validatePassword(kitchenPasswordInput, 'Kitchen Station Password');
    if (pErr) {
      setKitchenError(pErr);
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
            <SearchableSelect
              value={modalWaiterId}
              onChange={e => loadWaiterAssignments(e.target.value)}
              options={staff.filter(s => s.role === 'Waiter').map(s => ({
                value: s.id,
                label: `${s.name} (${s.status === 'On Duty' ? 'On Duty' : 'Off Duty'})`
              }))}
              placeholder="Select a Waiter..."
            />
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
                const tId = table.id || table._id;
                const currentlyAssigned = resolveTableAssignedWaiter(table, staff);
                const selectedWaiter = staff.find(s => String(s._id || s.id) === String(modalWaiterId) || String(s.name) === String(modalWaiterId));
                const isAssignedToThisWaiter = currentlyAssigned && (
                  String(currentlyAssigned.id) === String(modalWaiterId) ||
                  (selectedWaiter && String(currentlyAssigned.name).trim().toLowerCase() === String(selectedWaiter.name).trim().toLowerCase())
                );
                const isAssignedToOther = currentlyAssigned && !isAssignedToThisWaiter;
                const isChecked = modalTableIds.includes(tId);
                const tableNameStr = `Table ${table.tableNumber || table.tableNo || tId}`;

                return (
                  <div
                    key={tId}
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
                        if (isAssignedToOther) {
                          ShowNotifications.showAlertNotification(`${tableNameStr} is already assigned to waiter "${currentlyAssigned.name}".`, false);
                          return;
                        }
                        if (e.target.checked) {
                          setModalTableIds([...modalTableIds, tId]);
                        } else {
                          setModalTableIds(modalTableIds.filter(id => id !== tId));
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
                          {table.seats || table.seatingCapacity || 2} seats
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
              placeholder="••••••••••••"
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
