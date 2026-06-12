import React, { useState } from 'react';
import { Badge } from './Badge';
import { Modal } from './Modal';

const EyeIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const DollarIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
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

const iconBtnViewStyle = {
  ...iconBtnStyle,
  color: 'var(--primary)',
  backgroundColor: 'var(--primary-light)',
  marginRight: '8px'
};

const IconBtn = ({ icon, tooltip, style, onClick }) => {
  const isDelete = style?.color === '#ef4444';
  const isGreen = style?.color === '#10b981';
  return (
    <button 
      title={tooltip} 
      style={style} 
      onClick={onClick}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'scale(1.15)';
        if (isDelete) {
          e.currentTarget.style.backgroundColor = '#fef2f2';
          e.currentTarget.style.color = '#dc2626';
        } else if (isGreen) {
          e.currentTarget.style.backgroundColor = '#ecfdf5';
          e.currentTarget.style.color = '#059669';
        } else {
          e.currentTarget.style.backgroundColor = '#f1f5f9';
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

export default function WaiterReportsPanel({
  orders = [],
  staff = [],
  updateOrder,
  activeRestaurant = {}
}) {
  // Filters local states
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [filterWaiter, setFilterWaiter] = useState('All');
  const [filterTable, setFilterTable] = useState('All');
  const [filterSource, setFilterSource] = useState('All');
  const [filterPaymentMode, setFilterPaymentMode] = useState('All');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('All');
  const [filterOrderStatus, setFilterOrderStatus] = useState('All');

  // Modals local states
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [selectedTimelineOrder, setSelectedTimelineOrder] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentOrder, setSelectedPaymentOrder] = useState(null);
  const [offlinePaymentType, setOfflinePaymentType] = useState('Cash');

  // Helper date functions
  const addMinutes = (timeStr, mins) => {
    if (!timeStr) return '';
    try {
      const match = timeStr.match(/^(\d+):(\d+)\s*(AM|PM)?$/i);
      if (!match) return timeStr;
      let hours = parseInt(match[1]);
      let minutes = parseInt(match[2]);
      const ampm = match[3];
      
      if (ampm) {
        if (ampm.toUpperCase() === 'PM' && hours < 12) hours += 12;
        if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
      }
      
      minutes += mins;
      hours += Math.floor(minutes / 60);
      minutes = minutes % 60;
      hours = hours % 24;
      
      let returnAmpm = '';
      if (ampm) {
        returnAmpm = hours >= 12 ? ' PM' : ' AM';
        hours = hours % 12;
        if (hours === 0) hours = 12;
      }
      
      const pad = (num) => String(num).padStart(2, '0');
      return `${hours}:${pad(minutes)}${returnAmpm}`;
    } catch (e) {
      return timeStr;
    }
  };

  const getOrderDate = (ord) => {
    if (ord.date) return ord.date;
    const idNum = parseInt(ord.id) || 0;
    const offset = (847 - idNum) % 7;
    if (offset >= 0 && idNum >= 840) {
      const d = new Date(2026, 5, 10);
      d.setDate(d.getDate() - offset);
      return d.toISOString().split('T')[0];
    }
    return ord.date || new Date().toISOString().split('T')[0];
  };

  // Filter lists
  const waitersList = staff.filter(s => s.role === 'Waiter').map(s => s.name);
  const uniqueTables = Array.from(new Set(orders.map(o => o.table).filter(Boolean))).sort();

  // Get filtered orders
  const filteredWaiterReports = orders.filter(ord => {
    const date = getOrderDate(ord);
    const waiter = ord.waiter || 'Unassigned';
    const table = ord.table || '';
    const source = ord.source || (parseInt(ord.id) % 2 === 0 ? 'Dine-In' : 'Website');
    const paymentMode = ord.paymentMode || (ord.billingStatus === 'paid' ? 'UPI' : 'Pending');
    const paymentStatus = ord.billingStatus || 'unpaid';
    const orderStatus = ord.status || 'new';

    if (dateStart && date < dateStart) return false;
    if (dateEnd && date > dateEnd) return false;
    if (filterWaiter !== 'All' && waiter !== filterWaiter) return false;
    if (filterTable !== 'All' && table !== filterTable) return false;
    if (filterSource !== 'All' && source !== filterSource) return false;
    if (filterPaymentMode !== 'All') {
      if (filterPaymentMode === 'Pending' && paymentMode !== 'Pending') return false;
      if (filterPaymentMode !== 'Pending' && paymentMode !== filterPaymentMode) return false;
    }
    if (filterPaymentStatus !== 'All' && paymentStatus.toLowerCase() !== filterPaymentStatus.toLowerCase()) return false;
    if (filterOrderStatus !== 'All' && orderStatus.toLowerCase() !== filterOrderStatus.toLowerCase()) return false;

    return true;
  });

  // Calculate Metrics
  const waiterRevenue = filteredWaiterReports.reduce((sum, o) => sum + (o.total || 0), 0);
  const waiterOrdersServiced = filteredWaiterReports.filter(o => o.status === 'done').length;
  const waiterAvgOrder = filteredWaiterReports.length > 0 ? (waiterRevenue / filteredWaiterReports.length).toFixed(0) : 0;
  const waiterUnpaidCount = filteredWaiterReports.filter(o => o.billingStatus === 'unpaid').length;

  const handleResetFilters = () => {
    setDateStart('');
    setDateEnd('');
    setFilterWaiter('All');
    setFilterTable('All');
    setFilterSource('All');
    setFilterPaymentMode('All');
    setFilterPaymentStatus('All');
    setFilterOrderStatus('All');
  };

  const handleRecordPayment = () => {
    if (!selectedPaymentOrder) return;
    updateOrder(activeRestaurant.id, selectedPaymentOrder.id, { 
      billingStatus: 'paid', 
      paymentMode: offlinePaymentType,
      status: 'done'
    });
    setShowPaymentModal(false);
    setSelectedPaymentOrder(null);
    alert(`Payment of ₹${selectedPaymentOrder.total} settled via ${offlinePaymentType} successfully.`);
  };

  return (
    <section className="panel-view active">

      {/* Filters Block */}
      <div className="premium-filter-card">
        <div className="premium-filter-title">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary)' }}>
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <span>Filter Query Logs</span>
          </div>
          <span className="premium-filter-count-badge">
            {filteredWaiterReports.length} {filteredWaiterReports.length === 1 ? 'record' : 'records'} found
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', flex: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label className="premium-filter-label">Start Date</label>
            <input 
              type="date"
              value={dateStart}
              onChange={e => setDateStart(e.target.value)}
              className="premium-filter-input"
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label className="premium-filter-label">End Date</label>
            <input 
              type="date"
              value={dateEnd}
              onChange={e => setDateEnd(e.target.value)}
              className="premium-filter-input"
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label className="premium-filter-label">Waiter Staff</label>
            <select 
              value={filterWaiter}
              onChange={e => setFilterWaiter(e.target.value)}
              className="premium-filter-select"
            >
              <option value="All">All Waiters</option>
              {waitersList.map(w => <option key={w} value={w}>{w}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label className="premium-filter-label">Table</label>
            <select 
              value={filterTable}
              onChange={e => setFilterTable(e.target.value)}
              className="premium-filter-select"
            >
              <option value="All">All Tables</option>
              {uniqueTables.map(t => <option key={t} value={t}>Table {t}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label className="premium-filter-label">Order Source</label>
            <select 
              value={filterSource}
              onChange={e => setFilterSource(e.target.value)}
              className="premium-filter-select"
            >
              <option value="All">All Sources</option>
              <option value="Dine-In">Dine-In</option>
              <option value="Website">Website</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label className="premium-filter-label">Payment Mode</label>
            <select 
              value={filterPaymentMode}
              onChange={e => setFilterPaymentMode(e.target.value)}
              className="premium-filter-select"
            >
              <option value="All">All Modes</option>
              <option value="UPI">UPI</option>
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label className="premium-filter-label">Payment Status</label>
            <select 
              value={filterPaymentStatus}
              onChange={e => setFilterPaymentStatus(e.target.value)}
              className="premium-filter-select"
            >
              <option value="All">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label className="premium-filter-label">Order Status</label>
            <select 
              value={filterOrderStatus}
              onChange={e => setFilterOrderStatus(e.target.value)}
              className="premium-filter-select"
            >
              <option value="All">All Statuses</option>
              <option value="New">New</option>
              <option value="Preparing">Preparing</option>
              <option value="Ready">Ready</option>
              <option value="Done">Done</option>
            </select>
          </div>
          </div>
          <button 
            className="premium-filter-btn-reset" 
            onClick={handleResetFilters}
            title="Reset Filters"
            style={{ padding: '0', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, borderRadius: '8px' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{margin: 0}}>
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Reports Table */}
      <div style={{ 
        backgroundColor: '#ffffff', 
        border: '1px solid var(--border)', 
        borderRadius: 'var(--border-radius-sm)', 
        padding: '24px', 
        boxShadow: 'var(--card-shadow)' 
      }}>
        <div className="menu-table-wrapper" style={{ overflowX: 'auto' }}>
          <table className="menu-items-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1.5px solid var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
                <th style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>ORDER ID</th>
                <th style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>DATE</th>
                <th style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>TABLE</th>
                <th style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>WAITER</th>
                <th style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>SOURCE</th>
                <th style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>STATUS</th>
                <th style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>PAYMENT MODE</th>
                <th style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>PAYMENT STATUS</th>
                <th style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>AMOUNT</th>
                <th style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredWaiterReports.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                    No records match the active waiter filter query.
                  </td>
                </tr>
              ) : (
                filteredWaiterReports.map(ord => {
                  const date = getOrderDate(ord);
                  const source = ord.source || (parseInt(ord.id) % 2 === 0 ? 'Dine-In' : 'Website');
                  const paymentMode = ord.paymentMode || (ord.billingStatus === 'paid' ? 'UPI' : 'Pending');
                  return (
                    <tr key={ord.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '13px' }}>#ORD-{ord.id}</td>
                      <td style={{ padding: '12px 14px', fontSize: '13px' }}>{date}</td>
                      <td style={{ padding: '12px 14px', fontWeight: 600, fontSize: '13px' }}>Table {ord.table}</td>
                      <td style={{ padding: '12px 14px', fontSize: '13px' }}>{ord.waiter || 'Unassigned'}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ 
                          padding: '2px 8px', 
                          borderRadius: '4px', 
                          fontSize: '11px', 
                          fontWeight: 600, 
                          backgroundColor: source === 'Dine-In' ? '#eff6ff' : '#faf5ff',
                          color: source === 'Dine-In' ? '#1d4ed8' : '#7e22ce'
                        }}>
                          {source}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px' }}><Badge status={ord.status} /></td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ fontWeight: 600, fontSize: '13px' }}>{paymentMode}</span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ 
                          padding: '4px 8px', 
                          borderRadius: '6px', 
                          fontSize: '11px', 
                          fontWeight: 700, 
                          backgroundColor: ord.billingStatus === 'paid' ? 'var(--success-light)' : 'var(--danger-light)',
                          color: ord.billingStatus === 'paid' ? 'var(--success)' : 'var(--danger)'
                        }}>
                          {ord.billingStatus === 'paid' ? 'Paid' : 'Unpaid'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', fontWeight: 700, fontSize: '13px' }}>₹{ord.total}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <IconBtn 
                          icon={<EyeIcon size={18} />} 
                          tooltip="View Timeline" 
                          style={iconBtnViewStyle} 
                          onClick={() => {
                            setSelectedTimelineOrder(ord);
                            setShowTimelineModal(true);
                          }} 
                        />
                        {ord.billingStatus !== 'paid' && (
                          <IconBtn 
                            icon={<DollarIcon size={18} />} 
                            tooltip="Record Offline Payment" 
                            style={{ ...iconBtnStyle, color: '#10b981' }} 
                            onClick={() => {
                              setSelectedPaymentOrder(ord);
                              setOfflinePaymentType('Cash');
                              setShowPaymentModal(true);
                            }} 
                          />
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SERVICE TIMELINE MODAL */}
      {selectedTimelineOrder && (
        <Modal
          isOpen={showTimelineModal}
          onClose={() => {
            setShowTimelineModal(false);
            setSelectedTimelineOrder(null);
          }}
          title={`Service Timeline: #ORD-${selectedTimelineOrder.id}`}
          maxWidth="550px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', color: 'var(--text-main)', marginTop: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>WAITER NAME</span>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--black)' }}>{selectedTimelineOrder.waiter || 'Unassigned'}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>TABLE</span>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--black)' }}>Table {selectedTimelineOrder.table}</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', paddingLeft: '24px', margin: '10px 0' }}>
              <div style={{ position: 'absolute', left: '8px', top: '8px', bottom: '8px', width: '2px', backgroundColor: 'var(--border)' }}></div>

              {/* Step 1: Received */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
                <div style={{ position: 'absolute', left: '-22px', top: '4px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10b981', border: '3px solid #ffffff', boxShadow: '0 0 0 2px #10b981' }}></div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--black)' }}>Order Received</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Customer initialized the KOT</div>
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'monospace' }}>{selectedTimelineOrder.time}</div>
              </div>

              {/* Step 2: Accepted */}
              {(() => {
                const isNew = selectedTimelineOrder.status === 'new';
                const timeStr = isNew ? '--' : addMinutes(selectedTimelineOrder.time, 2);
                const dotColor = isNew ? '#94a3b8' : '#10b981';
                return (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', opacity: isNew ? 0.6 : 1 }}>
                    <div style={{ position: 'absolute', left: '-22px', top: '4px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: dotColor, border: '3px solid #ffffff', boxShadow: `0 0 0 2px ${dotColor}` }}></div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--black)' }}>Order Accepted</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Waiter acknowledged order</div>
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'monospace' }}>{timeStr}</div>
                  </div>
                );
              })()}

              {/* Step 3: Kitchen Assigned */}
              {(() => {
                const isNew = selectedTimelineOrder.status === 'new';
                const timeStr = isNew ? '--' : addMinutes(selectedTimelineOrder.time, 3);
                const dotColor = isNew ? '#94a3b8' : '#10b981';
                return (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', opacity: isNew ? 0.6 : 1 }}>
                    <div style={{ position: 'absolute', left: '-22px', top: '4px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: dotColor, border: '3px solid #ffffff', boxShadow: `0 0 0 2px ${dotColor}` }}></div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--black)' }}>Kitchen Assigned</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>KOT routed to cooking staff</div>
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'monospace' }}>{timeStr}</div>
                  </div>
                );
              })()}

              {/* Step 4: Food Ready */}
              {(() => {
                const isPassed = ['ready', 'done'].includes(selectedTimelineOrder.status);
                const timeStr = isPassed ? addMinutes(selectedTimelineOrder.time, 15) : '--';
                const dotColor = isPassed ? '#10b981' : '#94a3b8';
                return (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', opacity: isPassed ? 1 : 0.6 }}>
                    <div style={{ position: 'absolute', left: '-22px', top: '4px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: dotColor, border: '3px solid #ffffff', boxShadow: `0 0 0 2px ${dotColor}` }}></div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--black)' }}>Food Ready Notification</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Kitchen declared dish completed</div>
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'monospace' }}>{timeStr}</div>
                  </div>
                );
              })()}

              {/* Step 5: Food Pickup */}
              {(() => {
                const isPassed = selectedTimelineOrder.status === 'done';
                const timeStr = isPassed ? addMinutes(selectedTimelineOrder.time, 17) : '--';
                const dotColor = isPassed ? '#10b981' : '#94a3b8';
                return (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', opacity: isPassed ? 1 : 0.6 }}>
                    <div style={{ position: 'absolute', left: '-22px', top: '4px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: dotColor, border: '3px solid #ffffff', boxShadow: `0 0 0 2px ${dotColor}` }}></div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--black)' }}>Food Pickup</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Waiter fetched food from counter</div>
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'monospace' }}>{timeStr}</div>
                  </div>
                );
              })()}

              {/* Step 6: Food Served */}
              {(() => {
                const isPassed = selectedTimelineOrder.status === 'done';
                const timeStr = isPassed ? addMinutes(selectedTimelineOrder.time, 20) : '--';
                const dotColor = isPassed ? '#10b981' : '#94a3b8';
                return (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', opacity: isPassed ? 1 : 0.6 }}>
                    <div style={{ position: 'absolute', left: '-22px', top: '4px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: dotColor, border: '3px solid #ffffff', boxShadow: `0 0 0 2px ${dotColor}` }}></div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--black)' }}>Food Served</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Delivered to table seatings</div>
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'monospace' }}>{timeStr}</div>
                  </div>
                );
              })()}
            </div>

            {/* Total Duration */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-tertiary)', padding: '14px', borderRadius: '10px', marginTop: '10px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--black)' }}>Total Service Duration</span>
              <span style={{ 
                padding: '4px 12px', 
                borderRadius: '20px', 
                fontSize: '12px', 
                fontWeight: 700, 
                backgroundColor: selectedTimelineOrder.status === 'done' ? 'var(--success-light)' : 'var(--warning-light)',
                color: selectedTimelineOrder.status === 'done' ? 'var(--success)' : 'var(--warning)'
              }}>
                {selectedTimelineOrder.status === 'done' ? '20 Minutes' : 'In Progress'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button className="btn btn-black" style={{ padding: '8px 24px' }} onClick={() => {
                setShowTimelineModal(false);
                setSelectedTimelineOrder(null);
              }}>
                Dismiss
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* RECORD PAYMENT MODAL */}
      {selectedPaymentOrder && (
        <Modal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedPaymentOrder(null);
          }}
          title={`Record Payment: #ORD-${selectedPaymentOrder.id}`}
          maxWidth="450px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', color: 'var(--text-main)', marginTop: '10px' }}>
            <div style={{ padding: '14px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Order Amount</span>
              <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--black)' }}>₹{selectedPaymentOrder.total}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--black)' }}>Payment Type</label>
              <select
                value={offlinePaymentType}
                onChange={e => setOfflinePaymentType(e.target.value)}
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
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="UPI">UPI</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1.5px solid var(--border)', paddingTop: '16px', marginTop: '10px' }}>
              <button 
                type="button" 
                className="btn btn-outline" 
                style={{ padding: '10px 20px' }}
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedPaymentOrder(null);
                }}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-black" 
                style={{ padding: '10px 24px', backgroundColor: '#10b981', color: 'white', border: 'none' }}
                onClick={handleRecordPayment}
              >
                Submit Settlement
              </button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}
