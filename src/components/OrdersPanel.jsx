import React from 'react';
import { Badge } from './Badge';

const EyeIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
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

const PrintIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <polyline points="6 9 6 2 18 2 18 9" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect x="6" y="14" width="12" height="8" />
  </svg>
);

const PlayIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

const BellIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const CheckIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default function OrdersPanel({
  orders = [],
  staff = [],
  orderFilter = 'All',
  setOrderFilter,
  selectedWaiterFilter = 'All Waiters',
  setSelectedWaiterFilter,
  waiterDropdownOpen = false,
  setWaiterDropdownOpen,
  setActiveViewOrder,
  setActivePage,
  setActiveEditOrder,
  setEditOrderForm,
  deleteOrder,
  activeRestaurant = {},
  updateOrderStatus,
  plan = 'Standard'
}) {
  const waitersList = staff.filter(s => s.role === 'Waiter').map(s => s.name);
  
  let filteredOrders = [...orders].reverse();
  if (orderFilter !== 'All') {
    filteredOrders = filteredOrders.filter(o => o.status === orderFilter.toLowerCase());
  }
  if (selectedWaiterFilter !== 'All Waiters') {
    filteredOrders = filteredOrders.filter(o => o.waiter === selectedWaiterFilter);
  }

  const handleOrderStatusUpdate = (orderId, currentStatus) => {
    let nextStatus = 'preparing';
    if (currentStatus === 'new') nextStatus = 'preparing';
    else if (currentStatus === 'preparing') nextStatus = 'ready';
    else if (currentStatus === 'ready') nextStatus = 'done';

    updateOrderStatus(activeRestaurant.id, orderId, nextStatus);
  };

  return (
    <section className="panel-view active">
      {/* Search and filter header block */}
      <div className="settings-card" style={{ background: 'var(--bg-secondary)', borderRadius: '16px', padding: '24px', border: '1px solid var(--border)', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 className="panel-inner-title" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--black)', margin: 0 }}>Incoming Orders</h2>
            <p className="panel-inner-desc" style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
              Manage and process active client sessions and dispatch statuses
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Waiter Option Dropdown Filter */}
            <div style={{ position: 'relative' }}>
              <button 
                type="button"
                onClick={() => setWaiterDropdownOpen(!waiterDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  padding: '8px 16px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1.5px solid var(--border)',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  minWidth: '160px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  {selectedWaiterFilter}
                </span>
                <span style={{ fontSize: '9px', transition: 'transform 0.2s', transform: waiterDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
              </button>
              {waiterDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  left: 0,
                  width: '100%',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1.5px solid var(--border)',
                  borderRadius: '10px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                  zIndex: 1000,
                  overflow: 'hidden'
                }}>
                  {['All Waiters', ...waitersList].map((w, idx) => {
                    const isSelected = selectedWaiterFilter === w;
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          setSelectedWaiterFilter(w);
                          setWaiterDropdownOpen(false);
                        }}
                        style={{
                          padding: '10px 16px',
                          fontSize: '13px',
                          fontWeight: '500',
                          backgroundColor: isSelected ? 'var(--primary)' : 'var(--bg-secondary)',
                          color: isSelected ? '#ffffff' : 'var(--text-main)',
                          cursor: 'pointer',
                          transition: 'background-color 0.15s, color 0.15s'
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                        }}
                      >
                        {w}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Status filters row */}
            <div className="filter-tabs-row" style={{ display: 'flex', gap: '4px', background: 'var(--bg-tertiary)', padding: '4px', borderRadius: '8px' }}>
              {['All', 'New', 'Preparing', 'Ready', 'Done'].map(tab => (
                <button
                  key={tab}
                  type="button"
                  className={`filter-btn ${orderFilter === tab ? 'active' : ''}`}
                  onClick={() => setOrderFilter(tab)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: orderFilter === tab ? 'var(--primary)' : 'transparent',
                    color: orderFilter === tab ? '#ffffff' : 'var(--text-main)',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* TABLE LIST VIEW */}
      <div className="menu-table-wrapper" style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <table className="menu-items-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr>
              <th style={{ padding: '14px', width: '100px' }}>ORDER ID</th>
              <th style={{ padding: '14px', width: '110px' }}>TABLE</th>
              <th style={{ padding: '14px' }}>ITEMS</th>
              <th style={{ padding: '14px', width: '180px' }}>TIME / ELAPSED</th>
              <th style={{ padding: '14px', width: '140px' }}>ASSIGNED WAITER</th>
              <th style={{ padding: '14px', width: '120px' }}>STATUS</th>
              <th style={{ padding: '14px', textAlign: 'right', width: '220px' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(ord => {
              const itemSummary = ord.items.map(i => `${i.name} × ${i.qty}`).join(', ');
              return (
                <tr key={ord.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background-color 0.15s' }}>
                  
                  {/* 1. Order ID */}
                  <td style={{ padding: '14px', fontWeight: 700, color: 'var(--text-main)', fontSize: '13px' }}>#ORD-{ord.id}</td>

                  {/* 2. Table */}
                  <td style={{ padding: '14px' }}>
                    <span style={{ 
                      display: 'inline-flex', 
                      background: 'var(--primary-light)', 
                      color: 'var(--primary)', 
                      padding: '4px 10px', 
                      borderRadius: '6px', 
                      fontSize: '13px', 
                      fontWeight: 700 
                    }}>
                      Table {ord.table}
                    </span>
                  </td>

                  {/* 3. Items */}
                  <td style={{ padding: '14px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', maxWidth: '350px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={itemSummary}>
                      {itemSummary}
                    </div>
                    {ord.notes && (
                      <div style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 600, marginTop: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '4px', marginTop: '2px'}}><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                          <span>Note: {ord.notes}</span>
                        </div>
                      </div>
                    )}
                  </td>

                  {/* 4. Time */}
                  <td style={{ padding: '14px', fontSize: '13px', color: 'var(--text-muted)' }}>
                    <div>{ord.time}</div>
                    <div style={{ fontWeight: 600, color: 'var(--primary)', marginTop: '2px' }}>{ord.timeAgo}</div>
                  </td>

                  {/* 5. Waiter */}
                  <td style={{ padding: '14px' }}>
                    <span style={{ 
                      display: 'inline-flex', 
                      padding: '4px 10px', 
                      borderRadius: '6px', 
                      fontSize: '13px', 
                      background: 'var(--bg-tertiary)', 
                      color: 'var(--text-main)',
                      fontWeight: 600
                    }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '4px'}}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        {ord.waiter || 'Unassigned'}
                      </span>
                    </span>
                  </td>

                  {/* 6. Status badge */}
                  <td style={{ padding: '14px' }}>
                    <Badge status={ord.status} />
                  </td>

                  {/* 7. Action buttons */}
                  <td style={{ padding: '14px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                      <button 
                        type="button" 
                        title="View Details"
                        className="btn btn-outline" 
                        style={{ padding: '6px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}
                        onClick={() => { setActiveViewOrder(ord); setActivePage('order-view'); }}
                      >
                        <EyeIcon size={14} />
                      </button>
                      <button 
                        type="button" 
                        title="Edit Order"
                        className="btn btn-outline" 
                        style={{ padding: '6px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}
                        onClick={() => {
                          setActiveEditOrder(ord);
                          setEditOrderForm({
                            table: ord.table,
                            notes: ord.notes || '',
                            waiter: ord.waiter || 'Unassigned'
                          });
                          setActivePage('order-edit-form');
                        }}
                      >
                        <PencilIcon size={14} />
                      </button>
                      <button 
                        type="button" 
                        title="Cancel Order"
                        className="btn btn-outline" 
                        style={{ padding: '6px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', border: '1px solid var(--border)' }}
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to cancel order #ORD-${ord.id}?`)) {
                            deleteOrder(activeRestaurant.id, ord.id);
                          }
                        }}
                      >
                        <TrashIcon size={14} />
                      </button>

                      {/* Print and kitchen control triggers */}
                      <button 
                        type="button" 
                        title="Print Receipt"
                        onClick={() => alert(`Printing receipt for order #ORD-${ord.id}`)}
                        style={{
                          padding: '6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '6px',
                          border: '1px solid var(--border)',
                          background: 'var(--bg-secondary)',
                          cursor: 'pointer'
                        }}
                      >
                        <PrintIcon size={14} />
                      </button>

                      {ord.status === 'done' ? (
                        <span style={{ 
                          fontSize: '11px', 
                          color: '#15803d', 
                          backgroundColor: '#dcfce7', 
                          padding: '4px 10px', 
                          borderRadius: '6px',
                          fontWeight: 700, 
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <CheckIcon size={12} />
                          Served
                        </span>
                      ) : (
                        <button
                          type="button"
                          title={
                            ord.status === 'new' ? 'Start Preparing' :
                            ord.status === 'preparing' ? 'Mark as Ready' :
                            'Serve Customer / Complete'
                          }
                          onClick={() => handleOrderStatusUpdate(ord.id, ord.status)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: ord.status === 'new' ? '1.5px solid var(--primary)' : '1.5px solid #16a34a',
                            background: ord.status === 'new' ? 'var(--primary-light)' : '#f0fdf4',
                            color: ord.status === 'new' ? 'var(--primary)' : '#16a34a',
                            cursor: 'pointer',
                            fontSize: '11px',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          {ord.status === 'new' && (
                            <>
                              <PlayIcon size={10} />
                              Start
                            </>
                          )}
                          {ord.status === 'preparing' && (
                            <>
                              <BellIcon size={10} />
                              Ready
                            </>
                          )}
                          {ord.status === 'ready' && (
                            <>
                              <CheckIcon size={10} />
                              Serve
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>No orders match selected criteria.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
