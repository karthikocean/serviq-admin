import React, { useState } from 'react';
import { Badge } from './Badge';
import { Modal } from './Modal';

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

const KitchenAvatarIcon = ({ size = 16, color = '#ea580c' }) => (
  <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#ffedd5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '10px' }}>
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  </div>
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
  color: '#94a3b8',
  marginRight: '8px'
};

const iconBtnDeleteStyle = {
  ...iconBtnStyle,
  color: '#94a3b8'
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

export default function KitchenListPanel({
  staff = [],
  activeRestaurant = {},
  updateStaff,
  deleteStaff,
  openAddStaffModal,
  openEditStaffModal
}) {
  const [staffToDelete, setStaffToDelete] = React.useState(null);
  const [page, setPage] = React.useState(0);
  const limit = 10;

  const kitchenStaff = staff.filter(s => s.role === 'Kitchen');
  const totalPages = Math.ceil(kitchenStaff.length / limit) || 1;
  const paginatedStaff = kitchenStaff.slice(page * limit, (page + 1) * limit);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    const current = page + 1;
    let startPage = Math.max(1, current - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const handleToggleDuty = (staffMember) => {
    const nextStatus = staffMember.status === 'On Duty' ? 'Off Duty' : 'On Duty';
    updateStaff(activeRestaurant.id, {
      ...staffMember,
      status: nextStatus
    });
  };

  return (
    <section className="panel-view active">
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="panel-inner-title">Kitchen list</h2>
        <button style={{ background: '#ff5a1f', color: '#ffffff', border: 'none', fontWeight: 700, borderRadius: '8px', padding: '10px 20px', fontSize: '13px', cursor: 'pointer' }} onClick={() => openAddStaffModal('Kitchen')}>
          Add Kitchen Staff
        </button>
      </div>

      <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <div className="menu-table-wrapper" style={{ overflowX: 'auto', paddingBottom: '6px' }}>
          <table className="menu-items-table" style={{ width: '100%', minWidth: '950px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#000000', borderBottom: '3px solid #ff5a1f' }}>
                <th style={{ padding: '14px 14px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', width: '50px' }}>S.NO.</th>
                <th style={{ padding: '14px 14px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>KITCHEN STAFF NAME</th>
                <th style={{ padding: '14px 14px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>PHONE NUMBER</th>
                <th style={{ padding: '14px 14px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>EMAIL ADDRESS</th>
                <th style={{ padding: '14px 14px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>ACTIVE ORDERS</th>
                <th style={{ padding: '14px 14px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>COMPLETED ORDERS</th>
                <th style={{ padding: '14px 14px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', width: '130px' }}>DUTY STATUS</th>
                <th style={{ padding: '14px 14px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {paginatedStaff.map((s, index) => {
                const globalIndex = page * limit + index;
                const activeOrdersCount = globalIndex === 0 ? 3 : globalIndex === 1 ? 2 : globalIndex + 1;
                const completedOrdersCount = globalIndex === 0 ? 0 : globalIndex === 1 ? 1 : globalIndex;
                const isActive = s.status === 'On Duty' || s.status === 'Active';

                return (
                  <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}>
                    <td style={{ padding: '16px 14px', fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                      {globalIndex + 1}
                    </td>
                    <td style={{ padding: '16px 14px', fontWeight: 700, fontSize: '13px', color: '#0f172a', display: 'flex', alignItems: 'center' }}>
                      <KitchenAvatarIcon />
                      {s.name}
                    </td>
                    <td style={{ padding: '16px 14px', fontSize: '12px', fontWeight: 500, color: '#475569' }}>{s.phone}</td>
                    <td style={{ padding: '16px 14px', fontSize: '12px', fontWeight: 500, color: '#475569' }}>{s.email}</td>
                    <td style={{ padding: '16px 14px', textAlign: 'center', fontSize: '13px', fontWeight: 800, color: '#ea580c' }}>
                      {activeOrdersCount}
                    </td>
                    <td style={{ padding: '16px 14px', textAlign: 'center', fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                      {completedOrdersCount}
                    </td>
                    <td style={{ padding: '16px 14px', textAlign: 'center', verticalAlign: 'middle' }}>
                      <button
                        type="button"
                        onClick={() => handleToggleDuty(s)}
                        title="Click to toggle duty status"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '6px 14px',
                          borderRadius: '20px',
                          fontSize: '11px',
                          fontWeight: 800,
                          letterSpacing: '0.3px',
                          color: isActive ? '#166534' : '#64748b',
                          background: isActive ? '#dcfce7' : '#f1f5f9',
                          border: isActive ? '1.5px solid #86efac' : '1.5px solid #cbd5e1',
                          cursor: 'pointer',
                          minWidth: '95px',
                          transition: 'all 0.15s ease',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                        }}
                      >
                        <span style={{
                          width: '7px',
                          height: '7px',
                          borderRadius: '50%',
                          backgroundColor: isActive ? '#16a34a' : '#94a3b8',
                          display: 'inline-block'
                        }}></span>
                        {isActive ? 'ON DUTY' : 'OFF DUTY'}
                      </button>
                    </td>
                    <td style={{ padding: '16px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <IconBtn icon={<PencilIcon size={16} />} tooltip="Edit Kitchen Staff" style={iconBtnEditStyle} onClick={() => openEditStaffModal(s)} />
                    </td>
                  </tr>
                );
              })}
              {kitchenStaff.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No kitchen staff registered. Click "Add Kitchen Staff" to start.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '20px',
          paddingTop: '16px',
          borderTop: '1px solid #f1f5f9',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
            Showing {kitchenStaff.length === 0 ? 0 : page * limit + 1} to {Math.min((page + 1) * limit, kitchenStaff.length)} of {kitchenStaff.length} entries
          </div>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: page === 0 ? '#f8fafc' : '#ffffff',
                color: page === 0 ? '#cbd5e1' : '#334155',
                fontSize: '13px',
                fontWeight: 600,
                cursor: page === 0 ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Prev
            </button>

            {getPageNumbers().map(pageNum => (
              <button
                key={pageNum}
                type="button"
                onClick={() => setPage(pageNum - 1)}
                style={{
                  minWidth: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: page + 1 === pageNum ? 700 : 500,
                  border: page + 1 === pageNum ? 'none' : '1px solid #e2e8f0',
                  background: page + 1 === pageNum ? '#000000' : '#ffffff',
                  color: page + 1 === pageNum ? '#ffffff' : '#334155',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {pageNum}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1 || totalPages === 0}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: (page >= totalPages - 1 || totalPages === 0) ? '#f8fafc' : '#ffffff',
                color: (page >= totalPages - 1 || totalPages === 0) ? '#cbd5e1' : '#334155',
                fontSize: '13px',
                fontWeight: 600,
                cursor: (page >= totalPages - 1 || totalPages === 0) ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
      <Modal
        isOpen={!!staffToDelete}
        onClose={() => setStaffToDelete(null)}
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
              <p style={{ margin: 0, fontWeight: 600, color: 'var(--black)', fontSize: '15px' }}>Delete Kitchen Staff</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b', lineHeight: '1.5' }}>
                Are you sure you want to delete kitchen staff {staffToDelete?.name}? This action cannot be undone.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
            <button 
              className="btn btn-outline" 
              style={{ padding: '8px 16px', fontSize: '13px' }}
              onClick={() => setStaffToDelete(null)}
            >
              Cancel
            </button>
            <button 
              className="btn btn-black" 
              style={{ padding: '8px 16px', fontSize: '13px', backgroundColor: '#dc2626', borderColor: '#dc2626', color: '#fff' }}
              onClick={() => {
                if (staffToDelete) {
                  deleteStaff(activeRestaurant.id, staffToDelete.id);
                  setStaffToDelete(null);
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
