import React, { useState } from 'react';
import { Modal } from './Modal';
import ShowNotifications from '../helper/ShowNotifications';

const WaiterAvatarIcon = ({ isActive = true, size = 14 }) => (
  <div style={{
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: isActive ? '#fff7ed' : '#f1f5f9',
    border: isActive ? '1px solid #fed7aa' : '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  }}>
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={isActive ? '#ff5a1f' : '#94a3b8'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  </div>
);

const PencilIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    <path d="m15 5 4 4" />
  </svg>
);

export default function WaiterListPanel({
  staff = [],
  tables = [],
  orders = [],
  activeRestaurant = {},
  updateStaff,
  deleteStaff,
  openAddStaffModal,
  openEditStaffModal,
  handleOpenAssignTablesModal,
  setActivePage
}) {
  const [waiterToDelete, setWaiterToDelete] = useState(null);
  const [page, setPage] = useState(0);
  const limit = 10;

  // Map real staff from active restaurant
  const realWaiters = staff.filter(s => s.role === 'Waiter');

  const getAssignedTableBadges = (waiterName, waiterId) => {
    const assigned = tables.filter(t => {
      const assignedObj = typeof t.assignedWaiter === 'object' ? t.assignedWaiter : (typeof t.assignedWaiterId === 'object' ? t.assignedWaiterId : null);
      const rawWId = assignedObj?._id || assignedObj?.id || t.assignedWaiterId || (typeof t.assignedWaiter === 'string' ? t.assignedWaiter : null);
      const rawWName = assignedObj?.name || t.assignedWaiterName || (typeof t.assignedWaiter === 'string' ? t.assignedWaiter : null);

      if (waiterId && rawWId && String(rawWId) === String(waiterId)) return true;
      if (waiterName && rawWName && String(rawWName).trim().toLowerCase() === String(waiterName).trim().toLowerCase()) return true;
      if (waiterId && rawWName && String(rawWName).trim().toLowerCase() === String(waiterId).trim().toLowerCase()) return true;
      return false;
    });

    return assigned.map(t => {
      const tName = t.tableNumber || t.tableNo || t.id || t._id;
      return tName.startsWith('Table') ? tName : `Table ${tName}`;
    });
  };

  const displayWaiters = realWaiters.map((s, idx) => {
    const assigned = getAssignedTableBadges(s.name, s.id);
    const activeOrdersCount = orders.filter(o => o.waiter === s.name && ['new', 'preparing', 'ready'].includes(o.status)).length;
    const completedOrdersCount = orders.filter(o => o.waiter === s.name && o.status === 'completed').length;
    const isActive = s.status !== 'Off Duty' && s.status !== 'Inactive';

    return {
      raw: s,
      sno: idx + 1,
      id: s.id,
      name: s.name,
      phone: s.phone || '9876543210',
      email: s.email || `${s.name.toLowerCase().replace(/\s+/g, '')}@serviq.com`,
      assignedTables: assigned,
      activeOrders: activeOrdersCount,
      completedOrders: completedOrdersCount,
      status: isActive ? 'Active' : 'Inactive'
    };
  });

  const totalPages = Math.ceil(displayWaiters.length / limit) || 1;
  const paginatedWaiters = displayWaiters.slice(page * limit, (page + 1) * limit);

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

  return (
    <section className="panel-view active" style={{ width: '100%', paddingBottom: '24px' }}>
      {/* Top Header matching reference screenshot */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: '14px',
        marginBottom: '24px',
        borderBottom: '1.5px solid #fdba74'
      }}>
        <div>
          <h2 className="panel-inner-title" style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>Waiter list</h2>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
            Manage waiters, live table assignments, and shift status
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {handleOpenAssignTablesModal && (
            <button
              type="button"
              onClick={() => handleOpenAssignTablesModal()}
              style={{
                background: '#ffffff',
                color: '#ff5a1f',
                border: '1.5px solid #ff5a1f',
                fontWeight: 700,
                borderRadius: '8px',
                padding: '10px 18px',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#fff7ed'}
              onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
            >
              Assign Tables
            </button>
          )}
          <button
            type="button"
            onClick={() => openAddStaffModal ? openAddStaffModal('Waiter') : (setActivePage && setActivePage('staff-form'))}
            style={{
              background: '#ff5a1f',
              color: '#ffffff',
              border: 'none',
              fontWeight: 700,
              borderRadius: '8px',
              padding: '10px 18px',
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(255, 90, 31, 0.25)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#e04d16'}
            onMouseLeave={e => e.currentTarget.style.background = '#ff5a1f'}
          >
            Add Waiter
          </button>
        </div>
      </div>

      {/* Main Table Card matching reference image */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
        overflow: 'hidden'
      }}>
        <div style={{ width: '100%', overflowX: 'auto', paddingBottom: '6px' }}>
          <table style={{ width: '100%', minWidth: '950px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#000000', borderBottom: '3px solid #ff5a1f' }}>
                <th style={{ padding: '14px 18px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', width: '50px' }}>
                  S.NO.
                </th>
                <th style={{ padding: '14px 18px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  WAITER NAME
                </th>
                <th style={{ padding: '14px 18px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  PHONE NUMBER
                </th>
                <th style={{ padding: '14px 18px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  EMAIL ADDRESS
                </th>
                <th style={{ padding: '14px 18px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  ASSIGNED TABLES
                </th>
                <th style={{ padding: '14px 18px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
                  ACTIVE ORDERS
                </th>
                <th style={{ padding: '14px 18px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
                  COMPLETED ORDERS
                </th>
                <th style={{ padding: '14px 18px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', width: '130px' }}>
                  DUTY STATUS
                </th>
                <th style={{ padding: '14px 18px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedWaiters.map((w, index) => {
                const globalIndex = page * limit + index;
                const isActive = w.status === 'Active';

                return (
                  <tr 
                    key={w.id || index}
                    style={{
                      borderBottom: index < paginatedWaiters.length - 1 ? '1px solid #f1f5f9' : 'none',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
                  >
                    {/* S.NO */}
                    <td style={{ padding: '16px 18px', fontSize: '13px', color: '#64748b', fontWeight: 700 }}>
                      {globalIndex + 1}
                    </td>

                    {/* WAITER NAME */}
                    <td style={{ padding: '16px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <WaiterAvatarIcon isActive={isActive} />
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{w.name}</div>
                          <div style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>ID: {w.id}</div>
                        </div>
                      </div>
                    </td>

                    {/* PHONE NUMBER */}
                    <td style={{ padding: '16px 18px', fontSize: '13px', fontWeight: '500', color: '#334155' }}>
                      {w.phone}
                    </td>

                    {/* EMAIL ADDRESS */}
                    <td style={{ padding: '16px 18px', fontSize: '13px', fontWeight: '400', color: '#64748b' }}>
                      {w.email}
                    </td>

                    {/* ASSIGNED TABLES */}
                    <td style={{ padding: '16px 18px' }}>
                      {w.assignedTables && w.assignedTables.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {w.assignedTables.map((tName, i) => (
                            <span 
                              key={i} 
                              style={{
                                fontSize: '11px',
                                backgroundColor: '#ff5a1f',
                                color: '#ffffff',
                                padding: '3px 10px',
                                borderRadius: '12px',
                                fontWeight: '700',
                                display: 'inline-block'
                              }}
                            >
                              {tName}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '13px', fontStyle: 'italic', fontWeight: '500' }}>
                          None
                        </span>
                      )}
                    </td>

                    {/* ACTIVE ORDERS */}
                    <td style={{ padding: '16px 18px', fontSize: '14px', fontWeight: '700', color: w.activeOrders > 0 ? '#ff5a1f' : '#0f172a', textAlign: 'center' }}>
                      {w.activeOrders}
                    </td>

                    {/* COMPLETED ORDERS */}
                    <td style={{ padding: '16px 18px', fontSize: '14px', fontWeight: '700', color: '#0f172a', textAlign: 'center' }}>
                      {w.completedOrders}
                    </td>

                    {/* DUTY STATUS */}
                    <td style={{ padding: '16px 18px', textAlign: 'center', verticalAlign: 'middle' }}>
                      <button
                        type="button"
                        onClick={() => {
                          const nextStatus = isActive ? 'Off Duty' : 'On Duty';
                          if (updateStaff && activeRestaurant?.id) {
                            updateStaff(activeRestaurant.id, {
                              ...(w.raw || w),
                              status: nextStatus
                            });
                          }
                        }}
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

                    {/* ACTIONS */}
                    <td style={{ padding: '16px 18px', textAlign: 'right' }}>
                      <button 
                        type="button"
                        onClick={() => openEditStaffModal ? openEditStaffModal(w.raw || w) : null}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#64748b',
                          cursor: 'pointer',
                          padding: '6px',
                          borderRadius: '6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.15s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.color = '#0f172a'}
                        onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
                        title="Edit Waiter"
                      >
                        <PencilIcon size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {displayWaiters.length === 0 && (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No waiters registered. Click "Add Waiter" to start.
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
            Showing {displayWaiters.length === 0 ? 0 : page * limit + 1} to {Math.min((page + 1) * limit, displayWaiters.length)} of {displayWaiters.length} entries
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
    </section>
  );
}
