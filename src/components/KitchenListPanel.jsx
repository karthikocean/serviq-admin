import React, { useState } from 'react';
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

const KeyIcon = ({ size = 12, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }}>
    <path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4" />
  </svg>
);

const PlusIcon = ({ size = 12, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const UsersIcon = ({ size = 12, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const ChefIcon = ({ size = 12, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }}>
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const BellIcon = ({ size = 12, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }}>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const CheckIcon = ({ size = 12, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }}>
    <polyline points="20 6 9 17 4 12" />
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

export default function KitchenListPanel({
  plan = 'Basic',
  orders = [],
  staff = [],
  activeRestaurant = {},
  upgradeRestaurantPlan,
  updateOrderItemStatus,
  updateStaff,
  deleteStaff,
  openAddStaffModal,
  openEditStaffModal,
  openKitchenModal
}) {
  const isPremium = ['Premium', 'Enterprise'].includes(plan);
  const [activeSubTab, setActiveSubTab] = useState(isPremium ? 'kds' : 'staff'); // 'kds' or 'staff'
  const [kdsFilter, setKdsFilter] = useState('All');

  const kitchenLogin = activeRestaurant?.kitchenLogin || { email: '', password: '' };

  React.useEffect(() => {
    setActiveSubTab(isPremium ? 'kds' : 'staff');
  }, [isPremium]);

  // Filter KDS Cooking Items
  const activeOrders = orders.filter(o => o.billingStatus === 'unpaid' || o.status !== 'done');
  const kdsItems = [];
  activeOrders.forEach(order => {
    order.items.forEach(item => {
      const itemStatus = item.status || order.status || 'new';
      kdsItems.push({
        orderId: order.id,
        table: order.table,
        time: order.time,
        timeAgo: order.timeAgo || 'just now',
        name: item.name,
        qty: item.qty,
        status: itemStatus
      });
    });
  });

  const totalPending = kdsItems.filter(item => ['new', 'preparing'].includes(item.status)).length;
  const totalPreparing = kdsItems.filter(item => item.status === 'preparing').length;
  const totalReady = kdsItems.filter(item => item.status === 'ready').length;
  const totalCompleted = kdsItems.filter(item => ['done', 'served'].includes(item.status)).length;

  let filteredItems = [...kdsItems].reverse();
  if (kdsFilter !== 'All') {
    const matchStatus = kdsFilter.toLowerCase() === 'served' ? 'done' : kdsFilter.toLowerCase();
    filteredItems = filteredItems.filter(item => item.status === matchStatus);
  }

  // Kitchen Staff list
  const kitchenStaff = staff.filter(s => s.role === 'Kitchen');
  const staffOnDuty = kitchenStaff.filter(s => s.status === 'On Duty').length;
  const staffOffDuty = kitchenStaff.filter(s => s.status === 'Off Duty').length;

  const handleToggleDuty = (staffMember) => {
    const nextStatus = staffMember.status === 'On Duty' ? 'Off Duty' : 'On Duty';
    updateStaff(activeRestaurant.id, {
      ...staffMember,
      status: nextStatus
    });
  };

  return (
    <section className="panel-view active">
      {/* Header Navigation Tab Row */}
      <div className="panel-header-flex" style={{ marginBottom: '24px', borderBottom: '1.5px solid var(--border)', paddingBottom: '16px' }}>
        <div className="panel-title-desc">
          <h2 className="panel-inner-title"><ChefIcon size={20} /> Kitchen Management</h2>
          <p className="panel-inner-desc">
            {activeSubTab === 'kds' 
              ? 'Real-time ticket display queue for preparing dishes.' 
              : 'Register culinary professionals, update credentials, and check duty roster.'
            }
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--bg-tertiary)', padding: '4px', borderRadius: '10px' }}>
          <button 
            className={`btn ${activeSubTab === 'kds' ? 'btn-black' : 'btn-outline'}`}
            style={{ border: 'none', borderRadius: '8px', padding: '8px 16px', fontWeight: 600, fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            onClick={() => setActiveSubTab('kds')}
          >
            <ChefIcon size={14} /> Cooking KDS Board
          </button>
          <button 
            className={`btn ${activeSubTab === 'staff' ? 'btn-black' : 'btn-outline'}`}
            style={{ border: 'none', borderRadius: '8px', padding: '8px 16px', fontWeight: 600, fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            onClick={() => setActiveSubTab('staff')}
          >
            <UsersIcon size={14} /> Culinary Staff List
          </button>
        </div>
      </div>

      {activeSubTab === 'kds' ? (
        !isPremium ? (
          <div style={{
            background: 'linear-gradient(135deg, rgba(255, 122, 0, 0.05) 0%, rgba(255, 122, 0, 0.1) 100%)',
            border: '1.5px dashed var(--primary)',
            borderRadius: '16px',
            padding: '40px',
            textAlign: 'center',
            maxWidth: '650px',
            margin: '40px auto',
            boxShadow: '0 10px 30px -10px rgba(255, 122, 0, 0.15)',
            color: 'var(--text-main)'
          }}>
            <div style={{ marginBottom: '16px', color: 'var(--primary)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <h3 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '12px', color: 'var(--black)' }}>
              Upgrade to Premium Plan
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '24px' }}>
              Supercharge your kitchen staff with a real-time digital ticket board. Track preparation statuses at the individual item level, coordinate cooking stages, and notify servers instantly when dishes are ready.
            </p>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '16px',
              textAlign: 'left',
              marginBottom: '32px',
              padding: '20px',
              backgroundColor: 'var(--bg-primary)',
              borderRadius: '12px',
              border: '1px solid var(--border)'
            }}>
              <div style={{ display: 'flex', gap: '8px', fontSize: '13px', fontWeight: '600' }}>
                <span style={{ color: 'var(--primary)' }}>✓</span>
                <span>Item-level preparation tracking</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', fontSize: '13px', fontWeight: '600' }}>
                <span style={{ color: 'var(--primary)' }}>✓</span>
                <span>Automatic parent order syncing</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', fontSize: '13px', fontWeight: '600' }}>
                <span style={{ color: 'var(--primary)' }}>✓</span>
                <span>Real-time flashing KDS indicators</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', fontSize: '13px', fontWeight: '600' }}>
                <span style={{ color: 'var(--primary)' }}>✓</span>
                <span>Preparation statistics & throughput</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button 
                className="btn btn-black" 
                onClick={() => {
                  upgradeRestaurantPlan(activeRestaurant.id, 'Premium');
                  alert('Demo Upgrade Successful! Welcome to Serviq Premium.');
                }}
                style={{ padding: '12px 28px', fontSize: '14px' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg> Start 14-Day Free Trial
              </button>
            </div>
          </div>
        ) : (
          // ================= KDS DISPLAY BOARD =================
          <div className="tables-list-column" style={{ width: '100%' }}>
          <div className="panel-header-flex" style={{ marginBottom: '16px', alignItems: 'center' }}>
            <span className="live-pulse-badge" style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#16a34a',
              backgroundColor: '#dcfce7',
              padding: '4px 12px',
              borderRadius: '20px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span className="pulse-dot" style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#16a34a',
                display: 'inline-block'
              }}></span>
              Live Feed
            </span>

            <div className="filter-tabs-row" style={{ display: 'flex', gap: '6px' }}>
              {['All', 'New', 'Preparing', 'Ready', 'Served'].map(tab => (
                <button
                  key={tab}
                  className={`filter-btn ${kdsFilter === tab ? 'active' : ''}`}
                  onClick={() => setKdsFilter(tab)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border)',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    backgroundColor: kdsFilter === tab ? 'var(--black)' : '#ffffff',
                    color: kdsFilter === tab ? '#ffffff' : 'var(--text-main)'
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
            <div className="stat-card" style={{ borderLeft: '5px solid #3b82f6' }}>
              <div className="stat-main-row">
                <div className="stat-info">
                  <div className="stat-label" style={{ color: '#64748b' }}>Pending items</div>
                  <h3 style={{ color: 'var(--black)', marginTop: '4px', marginBottom: '4px', fontSize: '24px', fontWeight: 700 }}>{totalPending}</h3>
                  <div className="stat-sub-label blue-label">Awaiting cook</div>
                </div>
                <div className="stat-icon-wrapper" style={{ color: 'var(--primary)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                </div>
              </div>
            </div>

            <div className="stat-card" style={{ borderLeft: '5px solid #f59e0b' }}>
              <div className="stat-main-row">
                <div className="stat-info">
                  <div className="stat-label" style={{ color: '#64748b' }}>In Preparation</div>
                  <h3 style={{ color: 'var(--black)', marginTop: '4px', marginBottom: '4px', fontSize: '24px', fontWeight: 700 }}>{totalPreparing}</h3>
                  <div className="stat-sub-label orange-label">Active cooking</div>
                </div>
                <div className="stat-icon-wrapper" style={{ color: '#ef4444' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>
                </div>
              </div>
            </div>

            <div className="stat-card" style={{ borderLeft: '5px solid #10b981' }}>
              <div className="stat-main-row">
                <div className="stat-info">
                  <div className="stat-label" style={{ color: '#64748b' }}>Ready for Service</div>
                  <h3 style={{ color: 'var(--black)', marginTop: '4px', marginBottom: '4px', fontSize: '24px', fontWeight: 700 }}>{totalReady}</h3>
                  <div className="stat-sub-label green-label">Pick up queue</div>
                </div>
                <div className="stat-icon-wrapper" style={{ color: '#f59e0b' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                </div>
              </div>
            </div>

            <div className="stat-card" style={{ borderLeft: '5px solid #64748b' }}>
              <div className="stat-main-row">
                <div className="stat-info">
                  <div className="stat-label" style={{ color: '#64748b' }}>Completed Today</div>
                  <h3 style={{ color: 'var(--black)', marginTop: '4px', marginBottom: '4px', fontSize: '24px', fontWeight: 700 }}>{totalCompleted}</h3>
                  <div className="stat-sub-label green-label">Dispatched</div>
                </div>
                <div className="stat-icon-wrapper" style={{ fontSize: '18px' }}>✔️</div>
              </div>
            </div>
          </div>

          <div className="menu-table-wrapper" style={{ overflowX: 'auto', backgroundColor: '#ffffff', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px' }}>
            <table className="menu-items-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
                  <th style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>ORDER NUMBER</th>
                  <th style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>TABLE</th>
                  <th style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>ITEM NAME</th>
                  <th style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>QUANTITY</th>
                  <th style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>ORDER TIME</th>
                  <th style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>PREPARATION STATUS</th>
                  <th style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item, idx) => {
                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '14px', fontWeight: 700, color: 'var(--text-main)', fontSize: '13px' }}>#ORD-{item.orderId}</td>
                      <td style={{ padding: '14px', fontWeight: 600, color: 'var(--text-main)', fontSize: '13px' }}>Table {item.table}</td>
                      <td style={{ padding: '14px', fontWeight: 700, color: 'var(--text-main)', fontSize: '15px' }}>{item.name}</td>
                      <td style={{ padding: '14px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--primary-light)',
                          color: 'var(--primary)',
                          fontWeight: '700',
                          fontSize: '13px'
                        }}>
                          {item.qty}
                        </span>
                      </td>
                      <td style={{ padding: '14px', color: 'var(--text-muted)', fontSize: '13px' }}>
                        {item.time} <span style={{ fontSize: '11px', display: 'block' }}>({item.timeAgo})</span>
                      </td>
                      <td style={{ padding: '14px' }}>
                        {item.status === 'new' && (
                          <span style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, backgroundColor: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe' }}>
                            New
                          </span>
                        )}
                        {item.status === 'preparing' && (
                          <span style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, backgroundColor: '#fef3c7', color: '#d97706', border: '1px solid #fde68a' }}>
                            Preparing
                          </span>
                        )}
                        {item.status === 'ready' && (
                          <span style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, backgroundColor: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0' }}>
                            Ready
                          </span>
                        )}
                        {(item.status === 'done' || item.status === 'served') && (
                          <span style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, backgroundColor: '#f1f5f9', color: '#64748b', border: '1px solid #cbd5e1' }}>
                            Served
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '14px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center', whiteSpace: 'nowrap' }}>
                          {item.status === 'new' && (
                            <button
                              className="table-action-btn"
                              onClick={() => updateOrderItemStatus(activeRestaurant.id, item.orderId, item.name, 'preparing')}
                              style={{ backgroundColor: '#fef3c7', borderColor: '#fde68a', color: '#d97706', padding: '6px 12px', display: 'inline-flex', alignItems: 'center' }}
                            >
                              <ChefIcon size={12} color="#d97706" /> Prepare
                            </button>
                          )}
                          {item.status === 'preparing' && (
                            <button
                              className="table-action-btn"
                              onClick={() => updateOrderItemStatus(activeRestaurant.id, item.orderId, item.name, 'ready')}
                              style={{ backgroundColor: '#dcfce7', borderColor: '#bbf7d0', color: '#15803d', padding: '6px 12px', display: 'inline-flex', alignItems: 'center' }}
                            >
                              <BellIcon size={12} color="#15803d" /> Ready
                            </button>
                          )}
                          {item.status === 'ready' && (
                            <button
                              className="table-action-btn"
                              onClick={() => updateOrderItemStatus(activeRestaurant.id, item.orderId, item.name, 'done')}
                              style={{ backgroundColor: '#f1f5f9', borderColor: '#cbd5e1', color: '#64748b', padding: '6px 12px', display: 'inline-flex', alignItems: 'center' }}
                            >
                              <CheckIcon size={12} color="#64748b" /> Serve
                            </button>
                          )}
                          {(item.status === 'done' || item.status === 'served') && (
                            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>Completed</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                      No items found in this category.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )
    ) : (
        // ================= KITCHEN STAFF LIST =================
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginBottom: '16px' }}>
            <button className="btn btn-outline" onClick={openKitchenModal} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <KeyIcon size={14} /> Kitchen Shared Login Credentials
            </button>
            <button className="btn btn-black" onClick={() => openAddStaffModal('Kitchen')} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <PlusIcon size={14} /> Add Kitchen Staff
            </button>
          </div>

          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
            <div className="stat-card" style={{ borderLeft: '5px solid var(--primary)' }}>
              <div className="stat-main-row">
                <div className="stat-info">
                  <div className="stat-label" style={{ color: '#64748b' }}>Total Kitchen Staff</div>
                  <h3 style={{ color: 'var(--black)', marginTop: '4px', marginBottom: '4px', fontSize: '20px', fontWeight: '700' }}>{kitchenStaff.length}</h3>
                  <div className="stat-sub-label green-label">Registered team</div>
                </div>
                <div className="stat-icon-wrapper" style={{ color: 'var(--primary)' }}><ChefIcon size={18} /></div>
              </div>
            </div>

            <div className="stat-card" style={{ borderLeft: '5px solid #10b981' }}>
              <div className="stat-main-row">
                <div className="stat-info">
                  <div className="stat-label" style={{ color: '#64748b' }}>On Duty</div>
                  <h3 style={{ color: 'var(--black)', marginTop: '4px', marginBottom: '4px', fontSize: '20px', fontWeight: '700' }}>{staffOnDuty}</h3>
                  <div className="stat-sub-label green-label">Active cooking</div>
                </div>
                <div className="stat-icon-wrapper" style={{ color: '#10b981' }}><UsersIcon size={18} /></div>
              </div>
            </div>

            <div className="stat-card" style={{ borderLeft: '5px solid #ef4444' }}>
              <div className="stat-main-row">
                <div className="stat-info">
                  <div className="stat-label" style={{ color: '#64748b' }}>Off Duty</div>
                  <h3 style={{ color: 'var(--black)', marginTop: '4px', marginBottom: '4px', fontSize: '20px', fontWeight: '700' }}>{staffOffDuty}</h3>
                  <div className="stat-sub-label red-label">Inactive</div>
                </div>
                <div className="stat-icon-wrapper" style={{ color: '#ef4444' }}><UsersIcon size={18} /></div>
              </div>
            </div>

            <div className="stat-card" style={{ borderLeft: '5px solid #3b82f6' }}>
              <div className="stat-main-row">
                <div className="stat-info">
                  <div className="stat-label" style={{ color: '#64748b' }}>Shared Account</div>
                  <h3 style={{ color: 'var(--black)', marginTop: '4px', marginBottom: '4px', fontSize: '16px', fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }}>
                    {kitchenLogin?.email || 'N/A'}
                  </h3>
                  <div className="stat-sub-label blue-label">KDS Screen login</div>
                </div>
                <div className="stat-icon-wrapper" style={{ color: '#3b82f6' }}><KeyIcon size={18} /></div>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--border)', borderRadius: 'var(--border-radius-sm)', padding: '24px', boxShadow: 'var(--card-shadow)' }}>
            <div className="menu-table-wrapper" style={{ overflowX: 'auto' }}>
              <table className="menu-items-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
                    <th style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>STAFF ID</th>
                    <th style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>NAME</th>
                    <th style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>PHONE</th>
                    <th style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>LOGIN EMAIL</th>
                    <th style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>STATUS</th>
                    <th style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textAlign: 'right' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {kitchenStaff.map(s => (
                    <tr key={s.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontSize: '13px' }}>{s.id}</td>
                      <td style={{ padding: '12px 14px', fontWeight: 600, fontSize: '13px' }}>{s.name}</td>
                      <td style={{ padding: '12px 14px', fontSize: '13px' }}>{s.phone}</td>
                      <td style={{ padding: '12px 14px', fontSize: '13px' }}>{s.email}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Badge status={s.status} />
                          <button
                            className="table-action-btn"
                            onClick={() => handleToggleDuty(s)}
                            style={{
                              padding: '3px 8px',
                              fontSize: '10px',
                              fontWeight: '700',
                              backgroundColor: 'var(--bg-tertiary)',
                              color: 'var(--text-main)',
                              border: '1px solid var(--border)',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '4px'}}><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg> Toggle
                          </button>
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <IconBtn icon={<PencilIcon size={18} />} tooltip="Edit Details" style={iconBtnEditStyle} onClick={() => openEditStaffModal(s)} />
                        <IconBtn icon={<TrashIcon size={18} />} tooltip="Delete Staff" style={iconBtnDeleteStyle} onClick={() => {
                          if (window.confirm(`Are you sure you want to delete kitchen staff ${s.name}?`)) {
                            deleteStaff(activeRestaurant.id, s.id);
                          }
                        }} />
                      </td>
                    </tr>
                  ))}
                  {kitchenStaff.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                        No kitchen staff registered. Click "Add Kitchen Staff" to start.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
