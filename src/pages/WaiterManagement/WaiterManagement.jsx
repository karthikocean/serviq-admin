import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppState } from '../../config/AppContext';
import WaiterListPanel from '../../components/WaiterListPanel';
import WaiterReportsPanel from '../../components/WaiterReportsPanel';
import { Modal } from '../../components/Modal';
import SearchableSelect from '../../components/SearchableSelect.jsx';

export default function WaiterManagement({ isReports = false }) {
  const {
    activeRestaurant,
    updateStaff,
    deleteStaff,
    assignTablesToWaiter,
    selectedBranchId
  } = useAppState();

  const location = useLocation();
  const navigate = useNavigate();

  // Waiter assignment modal states
  const [showAssignTablesModal, setShowAssignTablesModal] = useState(false);
  const [modalWaiterId, setModalWaiterId] = useState('');
  const [modalTableIds, setModalTableIds] = useState([]);
  const [modalCoverWaiterId, setModalCoverWaiterId] = useState('');

  if (!activeRestaurant) return null;

  const rawStaff = activeRestaurant.staff || [];
  const rawTables = activeRestaurant.tables || [];
  const rawOrders = activeRestaurant.orders || [];

  const staff = selectedBranchId ? rawStaff.filter(s => s.branchId === selectedBranchId) : rawStaff;
  const tables = selectedBranchId ? rawTables.filter(t => t.branchId === selectedBranchId) : rawTables;
  const orders = selectedBranchId ? rawOrders.filter(o => o.branchId === selectedBranchId) : rawOrders;

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
    const targetId = waiterId || (waiters.length > 0 ? waiters[0].id : '');
    loadWaiterAssignments(targetId);
    setShowAssignTablesModal(true);
  };

  const handleSaveAssignments = () => {
    if (!modalWaiterId) return;
    assignTablesToWaiter(activeRestaurant.id, modalWaiterId, modalTableIds, modalCoverWaiterId);
    setShowAssignTablesModal(false);
  };

  const showReports = isReports || location.pathname.includes('/reports');

  return (
    <>
      {showReports ? (
        <WaiterReportsPanel
          orders={orders}
          staff={staff}
          tables={tables}
        />
      ) : (
        <WaiterListPanel
          staff={staff}
          tables={tables}
          orders={orders}
          activeRestaurant={activeRestaurant}
          updateStaff={updateStaff}
          deleteStaff={deleteStaff}
          handleOpenAssignTablesModal={handleOpenAssignTablesModal}
          openAddStaffModal={() => navigate('/waiter/add')}
          openEditStaffModal={(staffMember) => navigate(`/waiter/edit/${staffMember.id}`)}
        />
      )}

      {/* MODAL OVERLAY FOR ASSIGN TABLES */}
      <Modal
        isOpen={showAssignTablesModal}
        onClose={() => setShowAssignTablesModal(false)}
        title="Assign Tables to Waiter"
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
    </>
  );
}
