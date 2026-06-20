import React from 'react';
import { Modal } from './Modal';

const WaiterAvatarIcon = ({ size = 16, color = '#ea580c' }) => (
  <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#ffedd5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '10px' }}>
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  </div>
);

const PencilIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    <path d="m15 5 4 4" />
  </svg>
);

const TrashIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    <line x1="10" x2="10" y1="11" y2="17" />
    <line x1="14" x2="14" y1="11" y2="17" />
  </svg>
);

const LinkIcon = ({ size = 12, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }}>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

const CycleIcon = ({ size = 12, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }}>
    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
  </svg>
);

const iconBtnStyle = {
  background: 'none',
  border: 'none',
  padding: '6px',
  cursor: 'pointer',
  borderRadius: '6px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--text-main)',
  transition: 'all 0.2s ease'
};

const iconBtnDeleteStyle = {
  ...iconBtnStyle,
  color: '#94a3b8'
};

const iconBtnEditStyle = {
  ...iconBtnStyle,
  color: '#94a3b8',
  marginRight: '8px'
};

const IconBtn = ({ icon, tooltip, style, onClick }) => {
  const isDelete = style?.color === '#ef4444';
  return (
    <button 
      title={tooltip} 
      style={style} 
      onClick={onClick}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'scale(1.15)';
        e.currentTarget.style.backgroundColor = isDelete ? '#fef2f2' : '#f1f5f9';
        if (isDelete) {
          e.currentTarget.style.color = '#dc2626';
        } else {
          e.currentTarget.style.color = '#1e293b';
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.backgroundColor = 'transparent';
        e.currentTarget.style.color = style?.color;
      }}
    >
      {icon}
    </button>
  );
};

export default function WaiterListPanel({
  staff = [],
  tables = [],
  orders = [],
  activeRestaurant = {},
  updateStaff,
  deleteStaff,
  openAddStaffModal,
  openEditStaffModal,
  handleOpenAssignTablesModal
}) {
  const [waiterToDelete, setWaiterToDelete] = React.useState(null);
  const waiters = staff.filter(s => s.role === 'Waiter');

  // Find all dining tables assigned to a waiter
  const getAssignedTables = (waiterId) => {
    const primary = tables.filter(t => t.assignedWaiterId === waiterId).map(t => t.id);
    const cover = tables.filter(t => t.tempWaiterId === waiterId).map(t => t.id + ' (Cover)');
    return [...primary, ...cover];
  };

  const handleToggleDuty = (waiter) => {
    const nextStatus = waiter.status === 'On Duty' ? 'Off Duty' : 'On Duty';
    updateStaff(activeRestaurant.id, {
      ...waiter,
      status: nextStatus
    });
  };

  return (
    <section className="panel-view active">
      <div className="panel-header-flex" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 900, color: 'var(--black)', margin: 0 }}>waiters list</h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={{ background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', fontWeight: 700, borderRadius: '8px', padding: '10px 20px', fontSize: '13px', cursor: 'pointer' }} onClick={() => handleOpenAssignTablesModal()}>
            Assign Tables
          </button>
          <button style={{ background: '#ff5a1f', color: '#ffffff', border: 'none', fontWeight: 700, borderRadius: '8px', padding: '10px 20px', fontSize: '13px', cursor: 'pointer' }} onClick={() => openAddStaffModal('Waiter')}>
            Add Waiter
          </button>
        </div>
      </div>

      <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <div className="menu-table-wrapper" style={{ overflowX: 'auto' }}>
          <table className="menu-items-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#111111', borderTop: '4px solid #ea580c' }}>
                <th style={{ padding: '16px 14px', fontSize: '10px', fontWeight: 800, color: '#ffffff' }}>S.NO.</th>
                <th style={{ padding: '16px 14px', fontSize: '10px', fontWeight: 800, color: '#ffffff' }}>WAITER NAME</th>
                <th style={{ padding: '16px 14px', fontSize: '10px', fontWeight: 800, color: '#ffffff' }}>PHONE NUMBER</th>
                <th style={{ padding: '16px 14px', fontSize: '10px', fontWeight: 800, color: '#ffffff' }}>EMAIL ADDRESS</th>
                <th style={{ padding: '16px 14px', fontSize: '10px', fontWeight: 800, color: '#ffffff', textAlign: 'center' }}>ASSIGNED TABLES</th>
                <th style={{ padding: '16px 14px', fontSize: '10px', fontWeight: 800, color: '#ffffff', textAlign: 'center' }}>ACTIVE ORDERS</th>
                <th style={{ padding: '16px 14px', fontSize: '10px', fontWeight: 800, color: '#ffffff', textAlign: 'center' }}>COMPLETED ORDERS</th>
                <th style={{ padding: '16px 14px', fontSize: '10px', fontWeight: 800, color: '#ffffff', textAlign: 'center' }}>STATUS</th>
                <th style={{ padding: '16px 14px', fontSize: '10px', fontWeight: 800, color: '#ffffff', textAlign: 'center' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {waiters.map((s, index) => {
                const assigned = getAssignedTables(s.id);
                const activeOrdersCount = orders.filter(o => o.waiter === s.name && ['new', 'preparing', 'ready'].includes(o.status)).length;
                const completedOrdersCount = orders.filter(o => o.waiter === s.name && o.status === 'done').length;
                const isActive = s.status === 'On Duty' || s.status === 'Active';

                return (
                  <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '18px 14px', fontSize: '12px', fontWeight: 600, color: '#334155' }}>{index + 1}</td>
                    <td style={{ padding: '18px 14px', fontWeight: 700, fontSize: '13px', color: '#0f172a', display: 'flex', alignItems: 'center' }}>
                      <WaiterAvatarIcon />
                      {s.name}
                    </td>
                    <td style={{ padding: '18px 14px', fontSize: '12px', fontWeight: 500, color: '#475569' }}>{s.phone}</td>
                    <td style={{ padding: '18px 14px', fontSize: '12px', fontWeight: 500, color: '#475569' }}>{s.email}</td>
                    <td style={{ padding: '18px 14px', textAlign: 'center' }}>
                      {assigned.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
                          {assigned.map(tId => (
                            <span key={tId} style={{
                              fontSize: '11px',
                              backgroundColor: '#ea580c',
                              color: '#ffffff',
                              padding: '4px 10px',
                              borderRadius: '12px',
                              fontWeight: '800'
                            }}>
                              {tId.replace(' (Cover)', '')}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '12px', fontStyle: 'italic', fontWeight: 500 }}>None</span>
                      )}
                    </td>
                    <td style={{ padding: '18px 14px', textAlign: 'center', fontSize: '13px', fontWeight: 800, color: '#ea580c' }}>
                      {activeOrdersCount}
                    </td>
                    <td style={{ padding: '18px 14px', textAlign: 'center', fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                      {completedOrdersCount}
                    </td>
                    <td style={{ padding: '18px 14px', textAlign: 'center' }}>
                      <span 
                        onClick={() => handleToggleDuty(s)}
                        style={{
                          display: 'inline-block',
                          padding: '4px 16px',
                          border: isActive ? '1.5px solid #10b981' : '1.5px solid #ef4444',
                          color: isActive ? '#10b981' : '#ef4444',
                          borderRadius: '20px',
                          fontSize: '11px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          backgroundColor: '#ffffff'
                        }}
                      >
                        {isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '18px 14px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <IconBtn icon={<PencilIcon size={16} />} tooltip="Edit Waiter" style={iconBtnEditStyle} onClick={() => openEditStaffModal(s)} />
                      <IconBtn icon={<TrashIcon size={16} />} tooltip="Delete Waiter" style={iconBtnDeleteStyle} onClick={() => setWaiterToDelete(s)} />
                    </td>
                  </tr>
                );
              })}
              {waiters.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No waiters registered. Click "Add New Waiter" to start.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <Modal
        isOpen={!!waiterToDelete}
        onClose={() => setWaiterToDelete(null)}
        title="Confirm Deletion"
        maxWidth="400px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#fef2f2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 600, color: 'var(--black)', fontSize: '15px' }}>Delete Waiter Staff</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b', lineHeight: '1.5' }}>
                Are you sure you want to delete waiter {waiterToDelete?.name}? This action cannot be undone.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
            <button 
              className="btn btn-outline" 
              style={{ padding: '8px 16px', fontSize: '13px' }}
              onClick={() => setWaiterToDelete(null)}
            >
              Cancel
            </button>
            <button 
              className="btn btn-black" 
              style={{ padding: '8px 16px', fontSize: '13px', backgroundColor: '#dc2626', borderColor: '#dc2626', color: '#fff' }}
              onClick={() => {
                if (waiterToDelete) {
                  deleteStaff(activeRestaurant.id, waiterToDelete.id);
                  setWaiterToDelete(null);
                }
              }}
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </section>
  );
}
