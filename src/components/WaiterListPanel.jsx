import React from 'react';
import { Badge } from './Badge';

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

const iconBtnEditStyle = {
  ...iconBtnStyle,
  color: 'var(--primary)',
  backgroundColor: 'var(--primary-light)',
  marginRight: '8px'
};

const iconBtnDeleteStyle = {
  ...iconBtnStyle,
  color: '#ef4444'
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
  activeRestaurant = {},
  updateStaff,
  deleteStaff,
  openAddStaffModal,
  openEditStaffModal,
  handleOpenAssignTablesModal
}) {
  const waiters = staff.filter(s => s.role === 'Waiter');
  const onDutyCount = waiters.filter(w => w.status === 'On Duty').length;
  const offDutyCount = waiters.filter(w => w.status === 'Off Duty').length;

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
      <div className="panel-header-flex" style={{ marginBottom: '20px' }}>
        <div className="panel-title-desc">
          <h2 className="panel-inner-title">Waiter Management</h2>
          <p className="panel-inner-desc">Manage your waiter staff, track their status, and control table coverage assignments.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-outline" onClick={() => handleOpenAssignTablesModal()}>
            Assign Tables
          </button>
          <button className="btn btn-black" onClick={() => openAddStaffModal('Waiter')}>
            Add New Waiter
          </button>
        </div>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div className="stat-card" style={{ borderLeft: '5px solid var(--primary)' }}>
          <div className="stat-main-row">
            <div className="stat-info">
              <div className="stat-label" style={{ color: '#64748b' }}>Total Waiters</div>
              <h3 style={{ color: 'var(--black)', marginTop: '4px', marginBottom: '4px', fontSize: '20px', fontWeight: '700' }}>{waiters.length}</h3>
              <div className="stat-sub-label green-label">Service team</div>
            </div>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '5px solid #10b981' }}>
          <div className="stat-main-row">
            <div className="stat-info">
              <div className="stat-label" style={{ color: '#64748b' }}>On Duty</div>
              <h3 style={{ color: 'var(--black)', marginTop: '4px', marginBottom: '4px', fontSize: '20px', fontWeight: '700' }}>{onDutyCount}</h3>
              <div className="stat-sub-label green-label">Active on floor</div>
            </div>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '5px solid #ef4444' }}>
          <div className="stat-main-row">
            <div className="stat-info">
              <div className="stat-label" style={{ color: '#64748b' }}>Off Duty</div>
              <h3 style={{ color: 'var(--black)', marginTop: '4px', marginBottom: '4px', fontSize: '20px', fontWeight: '700' }}>{offDutyCount}</h3>
              <div className="stat-sub-label red-label">Standby</div>
            </div>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '5px solid #3b82f6' }}>
          <div className="stat-main-row">
            <div className="stat-info">
              <div className="stat-label" style={{ color: '#64748b' }}>Assigned Tables</div>
              <h3 style={{ color: 'var(--black)', marginTop: '4px', marginBottom: '4px', fontSize: '20px', fontWeight: '700' }}>
                {tables.filter(t => t.assignedWaiterId).length}
              </h3>
              <div className="stat-sub-label blue-label">Tables covered</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--border)', borderRadius: 'var(--border-radius-sm)', padding: '24px', boxShadow: 'var(--card-shadow)' }}>
        <div className="menu-table-wrapper" style={{ overflowX: 'auto' }}>
          <table className="menu-items-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1.5px solid var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
                <th style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>WAITER ID</th>
                <th style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>NAME</th>
                <th style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>PHONE</th>
                <th style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>LOGIN EMAIL</th>
                <th style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>ASSIGNED TABLES</th>
                <th style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>STATUS</th>
                <th style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {waiters.map(s => {
                const assigned = getAssignedTables(s.id);
                return (
                  <tr key={s.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontSize: '13px' }}>{s.id}</td>
                    <td style={{ padding: '12px 14px', fontWeight: 600, fontSize: '13px' }}>{s.name}</td>
                    <td style={{ padding: '12px 14px', fontSize: '13px' }}>{s.phone}</td>
                    <td style={{ padding: '12px 14px', fontSize: '13px' }}>{s.email}</td>
                    <td style={{ padding: '12px 14px' }}>
                      {assigned.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {assigned.map(tId => {
                            const isCover = tId.includes('(Cover)');
                            return (
                              <span key={tId} style={{
                                fontSize: '11px',
                                backgroundColor: isCover ? '#fef3c7' : 'var(--bg-tertiary)',
                                color: isCover ? '#d97706' : 'var(--text-main)',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontWeight: '600',
                                border: isCover ? '1px solid #fde68a' : 'none'
                              }}>
                                {tId}
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '13px', fontStyle: 'italic' }}>None</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <Badge 
                        status={s.status} 
                        onClick={() => handleToggleDuty(s)} 
                        title="Click to toggle duty status" 
                      />
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button
                        className="table-action-btn"
                        onClick={() => handleOpenAssignTablesModal(s.id)}
                        style={{
                          padding: '5px 10px',
                          fontSize: '12px',
                          marginRight: '8px',
                          backgroundColor: 'var(--bg-primary)',
                          border: '1px solid var(--border)',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          display: 'inline-flex',
                          alignItems: 'center'
                        }}
                      >
                        <LinkIcon size={12} /> Assign
                      </button>
                      <IconBtn icon={<PencilIcon size={18} />} tooltip="Edit Waiter" style={iconBtnEditStyle} onClick={() => openEditStaffModal(s)} />
                      <IconBtn icon={<TrashIcon size={18} />} tooltip="Delete Waiter" style={iconBtnDeleteStyle} onClick={() => {
                        if (window.confirm(`Are you sure you want to delete waiter ${s.name}?`)) {
                          deleteStaff(activeRestaurant.id, s.id);
                        }
                      }} />
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
    </section>
  );
}
