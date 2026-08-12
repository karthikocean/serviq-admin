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

const defaultWaitersList = [
  { id: 'S-01', name: 'Ramesh Kumar', phone: '9876543210', email: 'ramesh@serviq.com', assignedTables: [], activeOrders: 0, completedOrders: 0, status: 'Active' },
  { id: 'S-02', name: 'Anitha Selvam', phone: '9876543212', email: 'anitha@serviq.com', assignedTables: ['T-04'], activeOrders: 1, completedOrders: 0, status: 'Active' },
  { id: 'S-03', name: 'Vikram Rathore', phone: '9876543213', email: 'vikram@serviq.com', assignedTables: [], activeOrders: 0, completedOrders: 0, status: 'Inactive' },
  { id: 'S-04', name: 'Ravi M.', phone: '9876543215', email: 'ravi@serviq.com', assignedTables: ['T-07'], activeOrders: 1, completedOrders: 1, status: 'Active' },
  { id: 'S-05', name: 'Rahul S.', phone: '9876543216', email: 'rahul@serviq.com', assignedTables: ['T-01'], activeOrders: 1, completedOrders: 0, status: 'Active' },
  { id: 'S-06', name: 'Arjun K.', phone: '9876543217', email: 'arjun@serviq.com', assignedTables: ['T-05'], activeOrders: 1, completedOrders: 0, status: 'Active' }
];

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

  // Map real staff or fallback to reference image list
  const realWaiters = staff.filter(s => s.role === 'Waiter');

  const getAssignedTableBadges = (waiterName, waiterId) => {
    const assigned = tables.filter(t => t.assignedWaiterId === waiterId || t.assignedWaiter === waiterName || t.assignedWaiterName === waiterName);
    return assigned.map(t => {
      const num = t.id.replace(/\D/g, '');
      return `T-${num ? num.padStart(2, '0') : '01'}`;
    });
  };

  const displayWaiters = realWaiters.length > 0
    ? realWaiters.map((s, idx) => {
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
      })
    : defaultWaitersList.map((w, idx) => ({ ...w, sno: idx + 1 }));

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
        

        
      </div>

      {/* Section Sub-Header Row */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#000000', fontFamily: "'Outfit', sans-serif" }}>
          waiters list
        </h2>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            type="button"
            onClick={() => handleOpenAssignTablesModal ? handleOpenAssignTablesModal() : null}
            style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: 700,
              color: '#0f172a',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              transition: 'all 0.15s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
            onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
          >
            Assign Tables
          </button>

          <button 
            type="button"
            onClick={() => openAddStaffModal ? openAddStaffModal('Waiter') : (setActivePage && setActivePage('staff-form'))}
            style={{
              background: '#ff5a1f',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: 700,
              color: '#ffffff',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(255, 90, 31, 0.25)',
              transition: 'all 0.15s'
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
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#000000', borderBottom: '3px solid #ff5a1f' }}>
                <th style={{ padding: '14px 18px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', width: '60px' }}>
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
                <th style={{ padding: '14px 18px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  ACTIVE ORDERS
                </th>
                <th style={{ padding: '14px 18px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  COMPLETED ORDERS
                </th>
                <th style={{ padding: '14px 18px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  STATUS
                </th>
                <th style={{ padding: '14px 18px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {displayWaiters.map((w, index) => {
                const isActive = w.status === 'Active';

                return (
                  <tr 
                    key={w.id || index}
                    style={{
                      borderBottom: index < displayWaiters.length - 1 ? '1px solid #f1f5f9' : 'none',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
                  >
                    {/* S.NO */}
                    <td style={{ padding: '16px 18px', fontSize: '13px', color: '#64748b', fontWeight: '500' }}>
                      {w.sno || index + 1}
                    </td>

                    {/* WAITER NAME */}
                    <td style={{ padding: '16px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <WaiterAvatarIcon isActive={isActive} size={14} />
                        <span style={{ fontWeight: '700', fontSize: '14px', color: '#0f172a' }}>
                          {w.name}
                        </span>
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
                    <td style={{ padding: '16px 18px', fontSize: '14px', fontWeight: '700', color: w.activeOrders > 0 ? '#ff5a1f' : '#0f172a' }}>
                      {w.activeOrders}
                    </td>

                    {/* COMPLETED ORDERS */}
                    <td style={{ padding: '16px 18px', fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>
                      {w.completedOrders}
                    </td>

                    {/* STATUS */}
                    <td style={{ padding: '16px 18px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '700',
                        backgroundColor: isActive ? '#f0fdf4' : '#fef2f2',
                        border: isActive ? '1.5px solid #86efac' : '1.5px solid #fca5a5',
                        color: isActive ? '#16a34a' : '#dc2626'
                      }}>
                        {isActive ? 'Active' : 'Inactive'}
                      </span>
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
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
