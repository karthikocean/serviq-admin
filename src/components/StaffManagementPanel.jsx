import React, { useState } from 'react';
import { Modal } from './Modal';
import ShowNotifications from '../helper/ShowNotifications';

const PencilIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    <path d="m15 5 4 4" />
  </svg>
);

const TrashIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    <line x1="10" x2="10" y1="11" y2="17" />
    <line x1="14" x2="14" y1="11" y2="17" />
  </svg>
);

const TableAssignIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M4 6h16" />
    <path d="M5 6v12" />
    <path d="M19 6v12" />
    <path d="M10 6v6" />
    <path d="M14 6v6" />
  </svg>
);

const KeyIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <circle cx="7.5" cy="15.5" r="5.5" />
    <path d="m21 2-9.6 9.6" />
    <path d="m15.5 7.5 3 3L22 7l-3-3" />
  </svg>
);

export default function StaffManagementPanel({
  staff = [],
  tables = [],
  orders = [],
  branches = [],
  activeRestaurant = {},
  updateStaff,
  deleteStaff,
  openAddStaffModal,
  openEditStaffModal,
  handleOpenAssignTablesModal,
  openKitchenSettingsModal
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [staffToDelete, setStaffToDelete] = useState(null);

  // Compute helpers
  const getAssignedTableBadges = (waiterName, waiterId) => {
    const assigned = tables.filter(t => t.assignedWaiterId === waiterId || t.assignedWaiter === waiterName || t.assignedWaiterName === waiterName);
    return assigned.map(t => {
      const num = t.id.replace(/\D/g, '');
      return `T-${num ? num.padStart(2, '0') : '01'}`;
    });
  };

  const allStaffList = staff.map((s, idx) => {
    const isWaiter = s.role === 'Waiter';
    const assignedTables = isWaiter ? getAssignedTableBadges(s.name, s.id) : [];
    const activeOrdersCount = orders.filter(o => (o.waiter === s.name || isWaiter) && ['new', 'preparing', 'ready'].includes(o.status)).length;
    const completedOrdersCount = orders.filter(o => o.waiter === s.name && o.status === 'completed').length;
    const branchInfo = branches.find(b => b.id === s.branchId);

    return {
      raw: s,
      sno: idx + 1,
      id: s.id,
      name: s.name,
      role: s.role || 'Waiter',
      branchId: s.branchId,
      branchName: branchInfo ? branchInfo.branchName : 'Main Branch',
      phone: s.phone || '9876543210',
      email: s.email || `${s.name.toLowerCase().replace(/\s+/g, '')}@serviq.com`,
      assignedTables,
      activeOrders: activeOrdersCount,
      completedOrders: completedOrdersCount,
      status: s.status === 'Off Duty' ? 'Off Duty' : 'On Duty'
    };
  });

  // Filter based on inputs
  const filteredStaff = allStaffList.filter(s => {
    // Role dropdown filter
    if (filterRole !== 'All' && s.role !== filterRole) return false;

    // Status dropdown filter
    if (filterStatus !== 'All' && s.status !== filterStatus) return false;

    // Search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchName = s.name.toLowerCase().includes(query);
      const matchEmail = s.email.toLowerCase().includes(query);
      const matchPhone = s.phone.includes(query);
      const matchBranch = s.branchName.toLowerCase().includes(query);
      if (!matchName && !matchEmail && !matchPhone && !matchBranch) return false;
    }

    return true;
  });

  // KPI Metrics
  const totalStaffCount = staff.length;
  const waitersCount = staff.filter(s => s.role === 'Waiter').length;
  const waitersOnDuty = staff.filter(s => s.role === 'Waiter' && s.status === 'On Duty').length;
  const kitchenStaffCount = staff.filter(s => s.role === 'Kitchen').length;
  const kitchenOnDuty = staff.filter(s => s.role === 'Kitchen' && s.status === 'On Duty').length;
  const totalAssignedTables = tables.filter(t => t.assignedWaiterId || t.assignedWaiter).length;

  const handleToggleDuty = (staffMember) => {
    const nextStatus = staffMember.status === 'On Duty' ? 'Off Duty' : 'On Duty';
    if (updateStaff) {
      updateStaff(activeRestaurant.id, {
        ...staffMember.raw,
        status: nextStatus
      });
      ShowNotifications.showAlertNotification(`${staffMember.name} is now ${nextStatus}.`, true);
    }
  };

  const handleConfirmDelete = () => {
    if (staffToDelete && deleteStaff) {
      deleteStaff(activeRestaurant.id, staffToDelete.id);
      ShowNotifications.showAlertNotification(`Staff member "${staffToDelete.name}" deleted.`, true);
      setStaffToDelete(null);
    }
  };

  return (
    <section className="panel-view active" style={{ width: '100%', paddingBottom: '24px' }}>
      {/* Top Header & Quick Action Buttons */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: '16px',
        marginBottom: '20px',
        borderBottom: '1.5px solid #fdba74',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>
            Staff Management
          </h2>
          
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={openKitchenSettingsModal}
            style={{
              padding: '9px 16px',
              fontSize: '13px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              borderRadius: '8px',
              background: '#fff'
            }}
          >
            <KeyIcon size={15} color="#ea580c" />
            Kitchen Station Settings
          </button>

          <button
            type="button"
            className="btn btn-outline"
            onClick={() => handleOpenAssignTablesModal()}
            style={{
              padding: '9px 16px',
              fontSize: '13px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              borderRadius: '8px',
              background: '#fff'
            }}
          >
            <TableAssignIcon size={15} color="var(--primary)" />
            Assign Tables
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={openAddStaffModal}
            style={{
              padding: '9px 18px',
              fontSize: '13px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              borderRadius: '8px'
            }}
          >
            + Add Staff Member
          </button>
        </div>
      </div>

      {/* KPI Stats Overview Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', borderLeft: '4px solid var(--primary)' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Staff Members</div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', marginTop: '6px', fontFamily: "'Outfit', sans-serif" }}>{totalStaffCount}</div>
          <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600, marginTop: '2px' }}>{waitersCount} Waiters · {kitchenStaffCount} Kitchen</div>
        </div>

        <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', borderLeft: '4px solid #16a34a' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Waiters On Duty</div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#16a34a', marginTop: '6px', fontFamily: "'Outfit', sans-serif" }}>{waitersOnDuty} <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 600 }}>/ {waitersCount}</span></div>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>Ready for table service</div>
        </div>

        <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', borderLeft: '4px solid #ea580c' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Kitchen Staff On Duty</div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#ea580c', marginTop: '6px', fontFamily: "'Outfit', sans-serif" }}>{kitchenOnDuty} <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 600 }}>/ {kitchenStaffCount}</span></div>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>Active food preparation</div>
        </div>

        <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', borderLeft: '4px solid #3b82f6' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Assigned Dining Tables</div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#3b82f6', marginTop: '6px', fontFamily: "'Outfit', sans-serif" }}>{totalAssignedTables} <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 600 }}>/ {tables.length}</span></div>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>Covered by on-duty waiters</div>
        </div>
      </div>

      {/* Search & Filtering Bar */}
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        padding: '16px 20px',
        marginBottom: '20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
      }}>
        {/* Search & Filter Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search by staff name, email, phone, branch..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 14px 9px 36px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '13px',
                outline: 'none',
                backgroundColor: '#f8fafc'
              }}
            />
            <svg
              style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }}
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>

          <div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '13px',
                fontWeight: 600,
                backgroundColor: '#fff'
              }}
            >
              <option value="All">All Roles</option>
              <option value="Waiter">Waiters</option>
              <option value="Kitchen">Kitchen Staff</option>
              <option value="Manager">Managers</option>
            </select>
          </div>

          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '13px',
                fontWeight: 600,
                backgroundColor: '#fff'
              }}
            >
              <option value="All">All Duty Statuses</option>
              <option value="On Duty">On Duty</option>
              <option value="Off Duty">Off Duty</option>
            </select>
          </div>

          {(searchQuery || filterRole !== 'All' || filterStatus !== 'All') && (
            <button
              type="button"
              onClick={() => { setSearchQuery(''); setFilterRole('All'); setFilterStatus('All'); }}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#f1f5f9',
                color: '#475569',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Staff Unified Table */}
      <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <table style={{ width: '100%', minWidth: '980px', borderCollapse: 'collapse', textAlign: 'left', tableLayout: 'fixed' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0' }}>
              <th style={{ width: '5%', padding: '14px 12px', fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>S.NO</th>
              <th style={{ width: '22%', padding: '14px 14px', fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>STAFF MEMBER</th>
              <th style={{ width: '12%', padding: '14px 12px', fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>ROLE</th>
              <th style={{ width: '13%', padding: '14px 12px', fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>BRANCH</th>
              <th style={{ width: '12%', padding: '14px 12px', fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>PHONE</th>
              <th style={{ width: '15%', padding: '14px 12px', fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>ASSIGNMENTS / STATION</th>
              <th style={{ width: '11%', padding: '14px 10px', fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', textAlign: 'center' }}>DUTY STATUS</th>
              <th style={{ width: '10%', padding: '14px 12px', fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredStaff.map((member, index) => {
              const isWaiter = member.role === 'Waiter';
              const isKitchen = member.role === 'Kitchen';
              const isOnDuty = member.status === 'On Duty';

              return (
                <tr key={member.id} style={{ borderBottom: '1px solid #f1f5f9', height: '58px', transition: 'background-color 0.15s' }}>
                  {/* 1. S.No */}
                  <td style={{ padding: '12px 12px', fontWeight: 800, fontSize: '12px', color: '#0f172a', fontFamily: 'monospace' }}>
                    {index + 1}
                  </td>

                  {/* 2. Staff Member (Avatar, Name, Email) */}
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: isWaiter ? '#ecfdf5' : (isKitchen ? '#ffedd5' : '#eff6ff'),
                        border: isWaiter ? '1px solid #a7f3d0' : (isKitchen ? '1px solid #fed7aa' : '1px solid #bfdbfe'),
                        color: isWaiter ? '#166534' : (isKitchen ? '#ea580c' : '#1d4ed8'),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '13px',
                        fontWeight: 800,
                        flexShrink: 0
                      }}>
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {member.name}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {member.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* 3. Role */}
                  <td style={{ padding: '12px 12px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 800,
                      background: isWaiter ? '#dcfce7' : (isKitchen ? '#ffedd5' : '#f1f5f9'),
                      color: isWaiter ? '#166534' : (isKitchen ? '#c2410c' : '#334155')
                    }}>
                      {isWaiter ? '🤵 Waiter' : (isKitchen ? '👨‍🍳 Kitchen Staff' : `💼 ${member.role}`)}
                    </span>
                  </td>

                  {/* 4. Branch */}
                  <td style={{ padding: '12px 12px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                    {member.branchName}
                  </td>

                  {/* 5. Phone */}
                  <td style={{ padding: '12px 12px', fontSize: '12px', fontWeight: 600, color: '#475569', fontFamily: 'monospace' }}>
                    {member.phone}
                  </td>

                  {/* 6. Assignments / Station */}
                  <td style={{ padding: '12px 12px' }}>
                    {isWaiter ? (
                      member.assignedTables.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {member.assignedTables.map(tb => (
                            <span key={tb} style={{
                              background: '#fff7ed',
                              border: '1px solid #fed7aa',
                              color: '#c2410c',
                              fontSize: '10px',
                              fontWeight: 800,
                              padding: '2px 6px',
                              borderRadius: '4px'
                            }}>
                              {tb}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic' }}>
                          No tables assigned
                        </span>
                      )
                    ) : isKitchen ? (
                      <span style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        color: '#64748b',
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '4px'
                      }}>
                        Kitchen KDS Screen
                      </span>
                    ) : (
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>General Duty</span>
                    )}
                  </td>

                  {/* 7. Duty Status with Toggle */}
                  <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => handleToggleDuty(member)}
                      title="Click to toggle duty status"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '10px',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        border: isOnDuty ? '1px solid #86efac' : '1px solid #cbd5e1',
                        background: isOnDuty ? '#dcfce7' : '#f1f5f9',
                        color: isOnDuty ? '#166534' : '#64748b',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      <span style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: isOnDuty ? '#16a34a' : '#94a3b8'
                      }}></span>
                      {isOnDuty ? 'ON DUTY' : 'OFF DUTY'}
                    </button>
                  </td>

                  {/* 8. Actions */}
                  <td style={{ padding: '12px 12px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }}>
                      {isWaiter && (
                        <button
                          type="button"
                          title="Assign Dining Tables"
                          onClick={() => handleOpenAssignTablesModal(member.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--primary)',
                            cursor: 'pointer',
                            padding: '6px',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                          onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#fff7ed'; }}
                          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                        >
                          <TableAssignIcon size={16} />
                        </button>
                      )}

                      <button
                        type="button"
                        title="Edit Staff Member"
                        onClick={() => openEditStaffModal(member.raw)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#64748b',
                          cursor: 'pointer',
                          padding: '6px',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#0f172a'; e.currentTarget.style.backgroundColor = '#f1f5f9'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                      >
                        <PencilIcon size={16} />
                      </button>

                      <button
                        type="button"
                        title="Delete Staff Member"
                        onClick={() => setStaffToDelete(member)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#ea4335',
                          cursor: 'pointer',
                          padding: '6px',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#b91c1c'; e.currentTarget.style.backgroundColor = '#fee2e2'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = '#ea4335'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                      >
                        <TrashIcon size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {filteredStaff.length === 0 && (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                  No staff members found matching your search or filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!staffToDelete}
        onClose={() => setStaffToDelete(null)}
        title="Delete Staff Member"
        maxWidth="420px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#334155', lineHeight: '1.5' }}>
            Are you sure you want to remove <strong>{staffToDelete?.name}</strong> ({staffToDelete?.role}) from the restaurant staff list?
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setStaffToDelete(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-black"
              style={{ background: '#dc2626', borderColor: '#dc2626' }}
              onClick={handleConfirmDelete}
            >
              Delete Staff
            </button>
          </div>
        </div>
      </Modal>
    </section>
  );
}
