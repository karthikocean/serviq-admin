import React, { useState } from 'react';
import { useAppState, DEFAULT_ROLES } from '../../config/AppContext';
import TablesPanel from '../../components/TablesPanel';
import WaiterListPanel from '../../components/WaiterListPanel';
import { Modal } from '../../components/Modal';
import ShowNotifications from '../../helper/ShowNotifications.js';
import './TableManagement.css';

export default function TableManagement() {
  const {
    currentUser,
    activeRestaurant,
    addDiningTable,
    updateDiningTable,
    deleteDiningTable,
    assignTablesToWaiter
  } = useAppState();

  const [activePage, setActivePage] = useState(null); // null | 'table-form'
  const [addTableForm, setAddTableForm] = useState({ id: '', seats: 4 });
  const [showAssignTablesModal, setShowAssignTablesModal] = useState(false);
  const [modalWaiterId, setModalWaiterId] = useState('');
  const [modalTableIds, setModalTableIds] = useState([]);
  const [modalCoverWaiterId, setModalCoverWaiterId] = useState('');

  if (!activeRestaurant) return null;

  const { tables = [], staff = [], orders = [] } = activeRestaurant;

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

  const handleAddTableSubmit = async (e) => {
    e.preventDefault();
    const tableId = addTableForm.id.trim();
    if (!tableId) return;

    const seats = parseInt(addTableForm.seats) || 4;
    
    if (addTableForm.isEdit) {
      updateDiningTable(activeRestaurant.id, tableId, {
        seats: seats,
        status: addTableForm.status || 'Free'
      });
      setAddTableForm({ id: '', seats: 4 });
      setActivePage(null);
    } else {
      const success = await addDiningTable(activeRestaurant.id, {
        id: tableId,
        status: 'Free',
        seats: seats
      });

      if (success) {
        setAddTableForm({ id: '', seats: 4 });
        setActivePage(null);
      }
    }
  };

  const sty = {
    pageInlineHeader: { display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '2px solid var(--primary-light)' },
    pageBackBtn: { background: '#fff', border: '1.5px solid var(--border)', borderRadius: '10px', width: '38px', height: '38px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '16px', transition: 'all 0.2s', flexShrink: 0 },
    pageCard: { background: '#fff', borderRadius: '16px', padding: '32px', border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' },
  };

  const PageHeader = ({ title, subtitle }) => (
    <div style={sty.pageInlineHeader}>
      <button style={sty.pageBackBtn} onClick={() => setActivePage(null)}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'inherit'; }}
      >→</button>
      <div>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, fontFamily: "'Outfit', sans-serif" }}>{title}</h2>
        {subtitle && <span style={{ fontSize: '12px', color: '#64748b' }}>{subtitle}</span>}
      </div>
    </div>
  );

  return (
    <div style={{ width: '100%' }}>
      {activePage === 'table-form' ? (
        <section style={{ width: '100%' }}>
          {/* Header Row matching Image 2 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
            <button 
              type="button"
              onClick={() => setActivePage(null)}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '18px',
                fontWeight: '700',
                color: '#0f172a',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                flexShrink: 0
              }}
            >
              ←
            </button>
            <div>
              <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>
                {addTableForm.isEdit ? 'Edit Dining Table' : 'Add Dining Table'}
              </h2>

            </div>
          </div>

          {/* Form Card matching Image 2 */}
          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '36px 40px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <form onSubmit={handleAddTableSubmit} style={{ width: '100%' }}>
              {/* Field 1: Table Number / ID */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
                  Table Number / ID
                </label>
                <input
                  type="text"
                  value={addTableForm.id}
                  onChange={(e) => setAddTableForm({ ...addTableForm, id: e.target.value })}
                  placeholder="e.g. T-06"
                  required
                  disabled={addTableForm.isEdit}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '14px',
                    outline: 'none',
                    color: '#0f172a',
                    backgroundColor: '#ffffff'
                  }}
                />
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: '6px 0 0 0' }}>
                  Recommended format: T-XX (e.g. T-06, T-07)
                </p>
              </div>

              {/* Field 2: Table Name */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
                  Table Name
                </label>
                <input
                  type="text"
                  value={addTableForm.name || ''}
                  onChange={(e) => setAddTableForm({ ...addTableForm, name: e.target.value })}
                  placeholder="e.g. Window Seat 1"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '14px',
                    outline: 'none',
                    color: '#0f172a',
                    backgroundColor: '#ffffff'
                  }}
                />
              </div>

              {/* Field 3 & 4: Seating Capacity + Area / Section */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
                    Seating Capacity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={addTableForm.seats || 4}
                    onChange={(e) => setAddTableForm({ ...addTableForm, seats: parseInt(e.target.value) || 4 })}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      fontSize: '14px',
                      outline: 'none',
                      color: '#0f172a',
                      backgroundColor: '#ffffff'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
                    Area / Section
                  </label>
                  <input
                    type="text"
                    value={addTableForm.section || 'Main Dining'}
                    onChange={(e) => setAddTableForm({ ...addTableForm, section: e.target.value })}
                    placeholder="Main Dining"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      fontSize: '14px',
                      outline: 'none',
                      color: '#0f172a',
                      backgroundColor: '#ffffff'
                    }}
                  />
                </div>
              </div>

              {addTableForm.isEdit && (
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>Status</label>
                  <select
                    value={addTableForm.status || 'Free'}
                    onChange={(e) => setAddTableForm({ ...addTableForm, status: e.target.value })}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', fontSize: '14px', color: '#0f172a' }}
                  >
                    <option value="Free">Free</option>
                    <option value="Occupied">Occupied</option>
                  </select>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setActivePage(null)}
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
                    background: '#0f0f0f',
                    border: 'none',
                    color: '#ffffff',
                    fontWeight: 700,
                    borderRadius: '8px',
                    padding: '10px 24px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  {addTableForm.isEdit ? 'Update Table' : 'Create Table'}
                </button>
              </div>
            </form>
          </div>
        </section>
      ) : activePage === 'waiter-list' ? (
        <WaiterListPanel
          staff={staff}
          tables={tables}
          orders={orders}
          activeRestaurant={activeRestaurant}
          updateStaff={updateStaff}
          deleteStaff={deleteStaff}
          handleOpenAssignTablesModal={handleOpenAssignTablesModal}
          setActivePage={setActivePage}
        />
      ) : (
        <TablesPanel
          tables={tables}
          staff={staff}
          orders={orders}
          activeRestaurant={activeRestaurant}
          updateDiningTable={updateDiningTable}
          deleteDiningTable={deleteDiningTable}
          handleOpenAssignTablesModal={handleOpenAssignTablesModal}
          setAddTableForm={setAddTableForm}
          setActivePage={setActivePage}
          hasPermission={hasPermission}
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
                // Check if currently assigned to another waiter
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

          {/* Form Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1.5px solid var(--border)', paddingTop: '16px', marginTop: '10px' }}>
            <button
              type="button"
              className="btn btn-outline"
              style={{ padding: '10px 20px' }}
              onClick={() => setShowAssignTablesModal(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-black"
              style={{ padding: '10px 24px' }}
              onClick={handleSaveAssignments}
            >
              Save Assignments
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
