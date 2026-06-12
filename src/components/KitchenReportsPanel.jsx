import React, { useState } from 'react';
import { Badge } from './Badge';
import { Modal } from './Modal';

const EyeIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const InfoIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
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
  const isBlue = style?.color === '#3b82f6';
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
        } else if (isBlue) {
          e.currentTarget.style.backgroundColor = '#eff6ff';
          e.currentTarget.style.color = '#2563eb';
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

export default function KitchenReportsPanel({
  orders = [],
  staff = [],
  menu = []
}) {
  // Filters local states
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [filterStaff, setFilterStaff] = useState('All');
  const [filterDish, setFilterDish] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');

  // Modals local states
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [selectedTimelineOrder, setSelectedTimelineOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDetailsOrder, setSelectedDetailsOrder] = useState(null);

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

  const getOrderPriority = (ord) => {
    if (ord.priority) return ord.priority;
    return ord.notes && (ord.notes.toLowerCase().includes('urgent') || ord.notes.toLowerCase().includes('priority')) ? 'Urgent' : 'Normal';
  };

  // Filter dropdown lists
  const kitchenStaffList = staff.filter(s => s.role === 'Kitchen').map(s => s.name);
  const uniqueDishes = Array.from(new Set(menu.map(m => m.name))).sort();

  // Get filtered orders
  const filteredKitchenReports = orders.filter(ord => {
    const date = getOrderDate(ord);
    const kitchenStaffName = ord.kitchenStaff || (parseInt(ord.id) % 2 === 0 ? 'Suresh Pillai' : 'Priya Patel');
    const priority = getOrderPriority(ord);

    if (dateStart && date < dateStart) return false;
    if (dateEnd && date > dateEnd) return false;
    if (filterStaff !== 'All' && kitchenStaffName !== filterStaff) return false;
    if (filterDish !== 'All') {
      const hasDish = ord.items.some(item => item.name === filterDish);
      if (!hasDish) return false;
    }
    if (filterPriority !== 'All' && priority !== filterPriority) return false;

    return true;
  });

  // Calculate Metrics
  const kitchenTotalKots = filteredKitchenReports.length;
  const kitchenUrgentCount = filteredKitchenReports.filter(o => getOrderPriority(o) === 'Urgent').length;
  const kitchenPreparingCount = filteredKitchenReports.filter(o => o.status === 'preparing').length;
  const kitchenReadyCount = filteredKitchenReports.filter(o => o.status === 'ready').length;

  const handleResetFilters = () => {
    setDateStart('');
    setDateEnd('');
    setFilterStaff('All');
    setFilterDish('All');
    setFilterPriority('All');
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
            {filteredKitchenReports.length} {filteredKitchenReports.length === 1 ? 'record' : 'records'} found
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
            <label className="premium-filter-label">Kitchen Staff</label>
            <select 
              value={filterStaff}
              onChange={e => setFilterStaff(e.target.value)}
              className="premium-filter-select"
            >
              <option value="All">All Staff</option>
              {kitchenStaffList.map(w => <option key={w} value={w}>{w}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label className="premium-filter-label">Dish / Menu Item</label>
            <select 
              value={filterDish}
              onChange={e => setFilterDish(e.target.value)}
              className="premium-filter-select"
            >
              <option value="All">All Dishes</option>
              {uniqueDishes.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label className="premium-filter-label">Priority Level</label>
            <select 
              value={filterPriority}
              onChange={e => setFilterPriority(e.target.value)}
              className="premium-filter-select"
            >
              <option value="All">All Priorities</option>
              <option value="Normal">Normal</option>
              <option value="Urgent">Urgent</option>
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
                <th style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>KOT NUMBER</th>
                <th style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>ORDER ID</th>
                <th style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>ITEMS</th>
                <th style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>TABLE</th>
                <th style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>WAITER</th>
                <th style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>KITCHEN STAFF</th>
                <th style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>PRIORITY</th>
                <th style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredKitchenReports.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                    No records match the active kitchen filter query.
                  </td>
                </tr>
              ) : (
                filteredKitchenReports.map(ord => {
                  const kitchenStaffName = ord.kitchenStaff || (parseInt(ord.id) % 2 === 0 ? 'Suresh Pillai' : 'Priya Patel');
                  const priority = getOrderPriority(ord);
                  return (
                    <tr key={ord.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '13px' }}>KOT-{ord.id}</td>
                      <td style={{ padding: '12px 14px', fontWeight: 600, fontFamily: 'monospace', fontSize: '13px' }}>#ORD-{ord.id}</td>
                      <td style={{ padding: '12px 14px', maxWidth: '240px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {ord.items.map((it, i) => (
                            <span key={i} style={{ 
                              fontSize: '11px', 
                              backgroundColor: 'var(--bg-tertiary)', 
                              padding: '2px 6px', 
                              borderRadius: '4px',
                              fontWeight: 500,
                              color: 'var(--text-main)'
                            }}>
                              {it.name} × {it.qty}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px', fontWeight: 600, fontSize: '13px' }}>Table {ord.table}</td>
                      <td style={{ padding: '12px 14px', fontSize: '13px' }}>{ord.waiter || 'Unassigned'}</td>
                      <td style={{ padding: '12px 14px', fontWeight: 500, fontSize: '13px' }}>{kitchenStaffName}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ 
                          padding: '2px 8px', 
                          borderRadius: '4px', 
                          fontSize: '11px', 
                          fontWeight: 700, 
                          backgroundColor: priority === 'Urgent' ? 'var(--danger-light)' : 'var(--bg-tertiary)',
                          color: priority === 'Urgent' ? 'var(--danger)' : '#64748b'
                        }}>
                          {priority}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <IconBtn 
                          icon={<EyeIcon size={18} />} 
                          tooltip="View KOT Timeline" 
                          style={iconBtnViewStyle} 
                          onClick={() => {
                            setSelectedTimelineOrder(ord);
                            setShowTimelineModal(true);
                          }} 
                        />
                        <IconBtn 
                          icon={<InfoIcon size={18} />} 
                          tooltip="Item Details" 
                          style={{ ...iconBtnStyle, color: '#3b82f6' }} 
                          onClick={() => {
                            setSelectedDetailsOrder(ord);
                            setShowDetailsModal(true);
                          }} 
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* KITCHEN TIMELINE MODAL */}
      {selectedTimelineOrder && (
        <Modal
          isOpen={showTimelineModal}
          onClose={() => {
            setShowTimelineModal(false);
            setSelectedTimelineOrder(null);
          }}
          title={`Kitchen preparation log: #ORD-${selectedTimelineOrder.id}`}
          maxWidth="550px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', color: 'var(--text-main)', marginTop: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>CHEF / STAFF</span>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--black)' }}>
                  {selectedTimelineOrder.kitchenStaff || (parseInt(selectedTimelineOrder.id) % 2 === 0 ? 'Suresh Pillai' : 'Priya Patel')}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>TABLE</span>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--black)' }}>Table {selectedTimelineOrder.table}</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', paddingLeft: '24px', margin: '10px 0' }}>
              <div style={{ position: 'absolute', left: '8px', top: '8px', bottom: '8px', width: '2px', backgroundColor: 'var(--border)' }}></div>

              {/* Step 1: Kitchen Assigned */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
                <div style={{ position: 'absolute', left: '-22px', top: '4px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ff7a00', border: '3px solid #ffffff', boxShadow: '0 0 0 2px #ff7a00' }}></div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--black)' }}>Kitchen Assigned Time</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>KOT received by chef panel</div>
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'monospace' }}>{selectedTimelineOrder.time}</div>
              </div>

              {/* Step 2: Prep Start */}
              {(() => {
                const isPassed = ['preparing', 'ready', 'done'].includes(selectedTimelineOrder.status);
                const timeStr = isPassed ? addMinutes(selectedTimelineOrder.time, 2) : '--';
                const dotColor = isPassed ? '#ff7a00' : '#94a3b8';
                return (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', opacity: isPassed ? 1 : 0.6 }}>
                    <div style={{ position: 'absolute', left: '-22px', top: '4px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: dotColor, border: '3px solid #ffffff', boxShadow: `0 0 0 2px ${dotColor}` }}></div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--black)' }}>Preparation Start Time</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Chef marked order as "preparing"</div>
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'monospace' }}>{timeStr}</div>
                  </div>
                );
              })()}

              {/* Step 3: Prep End */}
              {(() => {
                const isPassed = ['ready', 'done'].includes(selectedTimelineOrder.status);
                const timeStr = isPassed ? addMinutes(selectedTimelineOrder.time, 12) : '--';
                const dotColor = isPassed ? '#ff7a00' : '#94a3b8';
                return (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', opacity: isPassed ? 1 : 0.6 }}>
                    <div style={{ position: 'absolute', left: '-22px', top: '4px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: dotColor, border: '3px solid #ffffff', boxShadow: `0 0 0 2px ${dotColor}` }}></div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--black)' }}>Preparation End Time</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Plating and quality check complete</div>
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'monospace' }}>{timeStr}</div>
                  </div>
                );
              })()}

              {/* Step 4: Food Ready */}
              {(() => {
                const isPassed = ['ready', 'done'].includes(selectedTimelineOrder.status);
                const timeStr = isPassed ? addMinutes(selectedTimelineOrder.time, 14) : '--';
                const dotColor = isPassed ? '#ff7a00' : '#94a3b8';
                return (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', opacity: isPassed ? 1 : 0.6 }}>
                    <div style={{ position: 'absolute', left: '-22px', top: '4px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: dotColor, border: '3px solid #ffffff', boxShadow: `0 0 0 2px ${dotColor}` }}></div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--black)' }}>Food Ready Time</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Notification dispatched to waiter</div>
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'monospace' }}>{timeStr}</div>
                  </div>
                );
              })()}

              {/* Step 5: Waiter Pickup */}
              {(() => {
                const isPassed = selectedTimelineOrder.status === 'done';
                const timeStr = isPassed ? addMinutes(selectedTimelineOrder.time, 17) : '--';
                const dotColor = isPassed ? '#ff7a00' : '#94a3b8';
                return (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', opacity: isPassed ? 1 : 0.6 }}>
                    <div style={{ position: 'absolute', left: '-22px', top: '4px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: dotColor, border: '3px solid #ffffff', boxShadow: `0 0 0 2px ${dotColor}` }}></div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--black)' }}>Waiter Pickup Time</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Food removed from pickup counter</div>
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'monospace' }}>{timeStr}</div>
                  </div>
                );
              })()}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px' }}>
              <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>PREPARATION DURATION</span>
                <div style={{ fontSize: '14px', fontWeight: 700, marginTop: '4px', color: 'var(--black)' }}>
                  {['ready', 'done'].includes(selectedTimelineOrder.status) ? '10 Minutes' : selectedTimelineOrder.status === 'preparing' ? 'In Progress' : '--'}
                </div>
              </div>
              <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>PICKUP DELAY DURATION</span>
                <div style={{ fontSize: '14px', fontWeight: 700, marginTop: '4px', color: 'var(--black)' }}>
                  {selectedTimelineOrder.status === 'done' ? '3 Minutes' : '--'}
                </div>
              </div>
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

      {/* KITCHEN ITEM DETAILS MODAL */}
      {selectedDetailsOrder && (
        <Modal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedDetailsOrder(null);
          }}
          title={`Dish Details: KOT-${selectedDetailsOrder.id}`}
          maxWidth="550px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', color: 'var(--text-main)', marginTop: '10px' }}>
            <div style={{ overflowX: 'auto', border: '1.5px solid var(--border)', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-tertiary)', borderBottom: '1.5px solid var(--border)' }}>
                    <th style={{ padding: '10px 12px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>DISH NAME</th>
                    <th style={{ padding: '10px 12px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>CATEGORY</th>
                    <th style={{ padding: '10px 12px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>QTY</th>
                    <th style={{ padding: '10px 12px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>PRIORITY</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedDetailsOrder.items.map((it, idx) => {
                    const cat = menu.find(m => m.name === it.name)?.category || 'Main Course';
                    const priority = getOrderPriority(selectedDetailsOrder);
                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 600 }}>{it.name}</td>
                        <td style={{ padding: '10px 12px' }}>{cat}</td>
                        <td style={{ padding: '10px 12px', fontWeight: 'bold' }}>{it.qty}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{ 
                            padding: '2px 6px', 
                            borderRadius: '4px', 
                            fontSize: '11px', 
                            fontWeight: 700, 
                            backgroundColor: priority === 'Urgent' ? 'var(--danger-light)' : 'var(--bg-tertiary)',
                            color: priority === 'Urgent' ? 'var(--danger)' : '#64748b'
                          }}>
                            {priority}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '14px', borderRadius: '10px' }}>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Special Instructions</span>
              <p style={{ fontSize: '13px', margin: '6px 0 0 0', fontWeight: 600, color: selectedDetailsOrder.notes ? 'var(--black)' : '#64748b', fontStyle: selectedDetailsOrder.notes ? 'normal' : 'italic' }}>
                {selectedDetailsOrder.notes || 'No special instructions recorded for this order.'}
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
              <button 
                className="btn btn-black" 
                style={{ padding: '8px 24px' }}
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedDetailsOrder(null);
                }}
              >
                Dismiss
              </button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}
