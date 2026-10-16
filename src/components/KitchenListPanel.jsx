import React, { useState } from 'react';
import { Badge } from './Badge';
import { Modal } from './Modal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { useAppState } from '../config/AppContext';

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
  const { hasPermission } = useAppState();
  const [staffToDelete, setStaffToDelete] = React.useState(null);
  const [page, setPage] = React.useState(0);
  const limit = 10;

  const kitchenStaff = staff.filter(s => s.role === 'Kitchen');
  const totalPages = Math.ceil(kitchenStaff.length / limit) || 1;

  React.useEffect(() => {
    if (page >= totalPages && totalPages > 0) {
      setPage(Math.max(0, totalPages - 1));
    }
  }, [totalPages, page]);

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
        {hasPermission('staff', 'add') && (
        <button style={{ background: '#ff5a1f', color: '#ffffff', border: 'none', fontWeight: 700, borderRadius: '8px', padding: '10px 20px', fontSize: '13px', cursor: 'pointer' }} onClick={() => openAddStaffModal('Kitchen')}>
          Add Kitchen Staff
        </button>
        )}
      </div>

      <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <div className="menu-table-wrapper" style={{ overflowX: 'auto', paddingBottom: '6px' }}>
          <table className="menu-items-table" style={{ width: '100%', minWidth: '950px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f95e10', color: '#ffffff' }}>
                <th style={{ padding: '14px 14px', color: '#ffffff', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', width: '50px' }}>S.NO.</th>
                <th style={{ padding: '14px 14px', color: '#ffffff', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>KITCHEN STAFF NAME</th>
                <th style={{ padding: '14px 14px', color: '#ffffff', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>PHONE NUMBER</th>
                <th style={{ padding: '14px 14px', color: '#ffffff', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>ACTIVE ORDERS</th>
                <th style={{ padding: '14px 14px', color: '#ffffff', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>COMPLETED ORDERS</th>
                <th style={{ padding: '14px 14px', color: '#ffffff', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', width: '130px' }}>DUTY STATUS</th>
                <th style={{ padding: '14px 14px', color: '#ffffff', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>ACTIONS</th>
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
                    <td style={{ padding: '16px 14px', textAlign: 'center', fontSize: '13px', fontWeight: 800, color: '#ea580c' }}>
                      {activeOrdersCount}
                    </td>
                    <td style={{ padding: '16px 14px', textAlign: 'center', fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                      {completedOrdersCount}
                    </td>
                    <td style={{ padding: '16px 14px', textAlign: 'center', verticalAlign: 'middle' }}>
                      <button
                        type="button"
                        disabled={!hasPermission('staff', 'edit')}
                        onClick={() => handleToggleDuty(s)}
                        title={hasPermission('staff', 'edit') ? "Click to toggle duty status" : "Permission required to change duty status"}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          borderRadius: '20px',
                          fontSize: '11px',
                          fontWeight: 800,
                          letterSpacing: '0.3px',
                          color: isActive ? '#166534' : '#64748b',
                          background: isActive ? '#dcfce7' : '#f1f5f9',
                          border: isActive ? '1.5px solid #86efac' : '1.5px solid #cbd5e1',
                          cursor: hasPermission('staff', 'edit') ? 'pointer' : 'not-allowed',
                          opacity: hasPermission('staff', 'edit') ? 1 : 0.7,
                          width: '105px',
                          minWidth: '105px',
                          whiteSpace: 'nowrap',
                          boxSizing: 'border-box',
                          flexShrink: 0,
                          transition: 'all 0.15s ease',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                        }}
                      >
                        <span style={{
                          width: '7px',
                          height: '7px',
                          borderRadius: '50%',
                          backgroundColor: isActive ? '#16a34a' : '#94a3b8',
                          display: 'inline-block',
                          flexShrink: 0
                        }}></span>
                        {isActive ? 'ON DUTY' : 'OFF DUTY'}
                      </button>
                    </td>
                    <td style={{ padding: '16px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      {hasPermission('staff', 'edit') && (
                      <IconBtn icon={<PencilIcon size={16} />} tooltip="Edit Kitchen Staff" style={iconBtnEditStyle} onClick={() => openEditStaffModal(s)} />
                      )}
                    </td>
                  </tr>
                );
              })}
              {kitchenStaff.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
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
      <DeleteConfirmationModal
        isOpen={!!staffToDelete}
        onClose={() => setStaffToDelete(null)}
        onConfirm={() => {
          if (staffToDelete) {
            deleteStaff(activeRestaurant.id, staffToDelete.id);
            setStaffToDelete(null);
          }
        }}
        title="Confirm Staff Deletion"
        itemType="kitchen staff"
        itemName={staffToDelete?.name}
        confirmText="Delete Staff"
      />
    </section>
  );
}
