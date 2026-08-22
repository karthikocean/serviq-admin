import React from 'react';
import { Badge } from './Badge';
import { useNavigate } from 'react-router-dom';

const StoreIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const TrendingUpIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const UsersIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export default function OverviewPanel({
  orders = [],
  tables = [],
  staff = [],
  allOrders = [],
  allTables = [],
  allStaff = [],
  branches = [],
  selectedBranchId = null,
  onSelectBranch = () => {},
  todayRevenue = 0,
  activeRestaurant = {}
}) {
  const navigate = useNavigate();

  const selectedBranch = branches.find(b => b.id === selectedBranchId);
  const isAllBranches = !selectedBranchId;

  // Counts
  const preparingOrdersCount = orders.filter(o => o.status === 'preparing').length;
  const occupiedTablesCount = tables.filter(t => t.status === 'Occupied').length;
  const pendingOrdersCount = orders.filter(o => o.status === 'new').length;
  const completedOrdersCount = orders.filter(o => o.status === 'completed').length;
  const onDutyStaffCount = staff.filter(s => s.status === 'On Duty').length;
  const activeBranchesCount = branches.filter(b => b.status === 'Active').length;

  // Calculate dynamic monthly sales
  const monthlySales = todayRevenue + (isAllBranches ? 85400 : 28500);

  // Top ordered menu item
  const getTopOrderedItem = () => {
    const itemCounts = {};
    orders.forEach(order => {
      (order.items || []).forEach(item => {
        itemCounts[item.name] = (itemCounts[item.name] || 0) + (item.qty || 0);
      });
    });
    let topItemName = 'Chicken Biryani';
    let maxCount = 0;
    Object.keys(itemCounts).forEach(name => {
      if (itemCounts[name] > maxCount) {
        maxCount = itemCounts[name];
        topItemName = name;
      }
    });
    return topItemName;
  };

  const topItem = getTopOrderedItem();

  // Branch statistics computation for All Branches view
  const branchAnalytics = branches.map(branch => {
    const branchOrders = allOrders.filter(o => o.branchId === branch.id);
    const branchTables = allTables.filter(t => t.branchId === branch.id);
    const branchStaff = allStaff.filter(s => s.branchId === branch.id);
    const branchRevenue = branchOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const occupied = branchTables.filter(t => t.status === 'Occupied').length;
    const activeStaff = branchStaff.filter(s => s.status === 'On Duty').length;

    return {
      ...branch,
      ordersCount: branchOrders.length,
      revenue: branchRevenue,
      tablesCount: branchTables.length || branch.totalTables || 10,
      occupiedTables: occupied,
      staffCount: branchStaff.length || 5,
      activeStaff: activeStaff || 3
    };
  });

  return (
    <section className="panel-view active" style={{ width: '100%' }}>
      {/* ACTIVE BRANCH SCOPE BANNER */}
      {selectedBranch && (
        <div style={{
          background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
          border: '1.5px solid #fed7aa',
          borderRadius: '16px',
          padding: '16px 24px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'var(--primary)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(255, 122, 0, 0.3)'
            }}>
              <StoreIcon size={22} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                  {selectedBranch.branchName}
                </h3>
                <span style={{ fontSize: '11px', background: '#059669', color: '#ffffff', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                  {selectedBranch.status || 'Active'}
                </span>
                <span style={{ fontSize: '11px', background: '#e2e8f0', color: '#475569', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                  {selectedBranch.branchCode}
                </span>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                📍 {selectedBranch.city || selectedBranch.address} • Manager: <strong>{selectedBranch.branchManager || 'Unassigned'}</strong> • Contact: {selectedBranch.mobileNumber || 'N/A'}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-outline"
            style={{ fontSize: '12px', fontWeight: 700, padding: '8px 16px', background: '#ffffff' }}
            onClick={() => onSelectBranch(null)}
          >
            ← View All Branches
          </button>
        </div>
      )}

      {/* 8 STATS CARDS GRID (2 Rows of 4 Cards) */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '24px' }}>
        
        {/* Card 1: Total Branches (if All Branches) or Branch Today Orders */}
        <div className="stat-card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div className="stat-main-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-info">
              <div className="stat-label" style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                {isAllBranches ? 'Total Branches' : "Today's Orders"}
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: 700, margin: '4px 0', color: 'var(--black)' }}>
                {isAllBranches ? `${branches.length} Outlets` : orders.length}
              </h3>
              <div className="stat-sub-label" style={{ fontSize: '11px', color: 'var(--success)', fontWeight: 600 }}>
                {isAllBranches ? `${activeBranchesCount} Active Locations` : 'Orders received today'}
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Active Tables */}
        <div className="stat-card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div className="stat-main-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-info">
              <div className="stat-label" style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                {isAllBranches ? 'Occupied Tables' : 'Active Tables'}
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: 700, margin: '4px 0', color: 'var(--black)' }}>
                {occupiedTablesCount} <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 500 }}>/ {tables.length} Total</span>
              </h3>
              <div className="stat-sub-label" style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                {isAllBranches ? 'Across all branches' : 'In this branch'}
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Revenue Today */}
        <div className="stat-card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div className="stat-main-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-info">
              <div className="stat-label" style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                {isAllBranches ? 'Org Revenue Today' : 'Branch Revenue Today'}
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: 700, margin: '4px 0', color: 'var(--black)' }}>
                ₹{todayRevenue.toLocaleString('en-IN')}
              </h3>
              <div className="stat-sub-label" style={{ fontSize: '11px', color: 'var(--success)', fontWeight: 600 }}>
                +14.2% vs yesterday
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Revenue This Month */}
        <div className="stat-card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div className="stat-main-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-info">
              <div className="stat-label" style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Revenue This Month</div>
              <h3 style={{ fontSize: '24px', fontWeight: 700, margin: '4px 0', color: 'var(--black)' }}>
                ₹{monthlySales.toLocaleString('en-IN')}
              </h3>
              <div className="stat-sub-label" style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Monthly sales target</div>
            </div>
          </div>
        </div>

        {/* Card 5: Staff On Duty */}
        <div className="stat-card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div className="stat-main-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-info">
              <div className="stat-label" style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Staff On Duty</div>
              <h3 style={{ fontSize: '24px', fontWeight: 700, margin: '4px 0', color: 'var(--black)' }}>
                {onDutyStaffCount} <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 500 }}>/ {staff.length} Total</span>
              </h3>
              <div className="stat-sub-label" style={{ fontSize: '11px', color: '#10b981', fontWeight: 600 }}>
                Waiters & Kitchen Staff
              </div>
            </div>
          </div>
        </div>

        {/* Card 6: Pending Orders */}
        <div className="stat-card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div className="stat-main-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-info">
              <div className="stat-label" style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Pending Orders</div>
              <h3 style={{ fontSize: '24px', fontWeight: 700, margin: '4px 0', color: 'var(--black)' }}>{pendingOrdersCount}</h3>
              <div className="stat-sub-label" style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 600 }}>Awaiting kitchen prep</div>
            </div>
          </div>
        </div>

        {/* Card 7: Completed Orders */}
        <div className="stat-card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div className="stat-main-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-info">
              <div className="stat-label" style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Completed Orders</div>
              <h3 style={{ fontSize: '24px', fontWeight: 700, margin: '4px 0', color: 'var(--black)' }}>{completedOrdersCount}</h3>
              <div className="stat-sub-label" style={{ fontSize: '11px', color: 'var(--success)', fontWeight: 600 }}>Fulfilled & served</div>
            </div>
          </div>
        </div>

        {/* Card 8: Top Items */}
        <div className="stat-card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div className="stat-main-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-info">
              <div className="stat-label" style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Top Item</div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '6px 0', color: 'var(--black)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }} title={topItem}>
                {topItem}
              </h3>
              <div className="stat-sub-label" style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Highest seller</div>
            </div>
          </div>
        </div>

      </div>

      {/* MULTI-BRANCH PERFORMANCE TABLE (WHEN ALL BRANCHES IS VIEWED) */}
      {isAllBranches && (
        <div className="settings-card" style={{ background: 'var(--bg-secondary)', borderRadius: '16px', padding: '24px', border: '1px solid var(--border)', marginBottom: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--black)' }}>
                Branch-wise Performance Overview
              </h3>
            
            </div>
            <button
              type="button"
              className="btn btn-outline"
              style={{ fontSize: '12px', fontWeight: 700, padding: '8px 16px' }}
              onClick={() => navigate('/branch-management')}
            >
              Manage Branches →
            </button>
          </div>

          <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid var(--border)' }}>
            <table className="menu-items-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid var(--border)', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>BRANCH NAME</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>CODE & LOCATION</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>MANAGER</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>STATUS</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>TABLES OCCUPIED</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>STAFF ON DUTY</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>TODAY ORDERS</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>REVENUE</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569', textAlign: 'center' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {branchAnalytics.map(b => (
                  <tr key={b.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0f172a' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <StoreIcon size={16} color="var(--primary)" />
                        <span>{b.branchName}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#64748b' }}>
                      <span style={{ fontSize: '11px', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontWeight: 700, color: '#334155', marginRight: '6px' }}>
                        {b.branchCode}
                      </span>
                      {b.city || 'Tamil Nadu'}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#334155', fontWeight: 600 }}>
                      {b.branchManager || 'Unassigned'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        fontSize: '11px',
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontWeight: 700,
                        backgroundColor: b.status === 'Active' ? '#ecfdf5' : '#fef2f2',
                        color: b.status === 'Active' ? '#059669' : '#dc2626'
                      }}>
                        {b.status || 'Active'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 600 }}>
                      <span style={{ color: b.occupiedTables > 0 ? '#ea580c' : '#10b981' }}>{b.occupiedTables} Occupied</span> / {b.tablesCount}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: '#334155' }}>
                      {b.activeStaff} / {b.staffCount}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0f172a' }}>
                      {b.ordersCount}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 800, color: 'var(--primary)' }}>
                      ₹{b.revenue.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <button
                        type="button"
                        className="btn btn-outline"
                        style={{ padding: '6px 12px', fontSize: '11px', fontWeight: 700 }}
                        onClick={() => onSelectBranch(b.id)}
                      >
                        Drill Down
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CHARTS CONTAINER (Revenue Growth & Order Breakdown) */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '24px' }}>
        
        {/* Revenue Growth Card */}
        <div className="settings-card" style={{ background: 'var(--bg-secondary)', borderRadius: '16px', padding: '24px', border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <h3 className="feed-title" style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--black)' }}>
              {isAllBranches ? 'Branch Revenue Comparison (₹)' : 'Revenue Growth'}
            </h3>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Last 6 Months</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'stretch', height: '180px', padding: '0 10px', marginTop: '20px' }}>
            {isAllBranches ? (
              branchAnalytics.map(b => {
                const maxRev = Math.max(...branchAnalytics.map(x => x.revenue), 1000);
                const pct = Math.max(20, Math.round((b.revenue / maxRev) * 100));
                return (
                  <div key={b.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', flex: 1 }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
                      ₹{(b.revenue / 1000).toFixed(1)}k
                    </span>
                    <div style={{ height: '110px', width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginBottom: '8px' }}>
                      <div style={{ 
                        width: '36px', 
                        height: `${pct}%`, 
                        background: 'linear-gradient(180deg, var(--primary) 0%, rgba(255, 122, 0, 0.15) 100%)', 
                        borderRadius: '6px 6px 0 0',
                        transition: 'height 0.3s ease'
                      }}></div>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textAlign: 'center', maxWidth: '80px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={b.branchName}>
                      {b.branchCode}
                    </span>
                  </div>
                );
              })
            ) : (
              [
                { month: 'Jan', val: '₹12k', pct: 25 },
                { month: 'Feb', val: '₹15k', pct: 32 },
                { month: 'Mar', val: '₹23k', pct: 48 },
                { month: 'Apr', val: '₹32k', pct: 65 },
                { month: 'May', val: '₹45k', pct: 82 },
                { month: 'Jun', val: '₹65k', pct: 98 }
              ].map(item => (
                <div key={item.month} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', flex: 1 }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>{item.val}</span>
                  <div style={{ height: '110px', width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginBottom: '8px' }}>
                    <div style={{ 
                      width: '32px', 
                      height: `${item.pct}%`, 
                      background: 'linear-gradient(180deg, var(--primary) 0%, rgba(255, 122, 0, 0.15) 100%)', 
                      borderRadius: '6px 6px 0 0',
                      transition: 'height 0.3s ease'
                    }}></div>
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>{item.month}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Order Breakdown Card */}
        <div className="settings-card" style={{ background: 'var(--bg-secondary)', borderRadius: '16px', padding: '24px', border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          <h3 className="feed-title" style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--black)' }}>Order Breakdown</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            {[
              { name: 'Starters', pct: 45, color: 'var(--primary)' },
              { name: 'Main Course', pct: 30, color: '#3b82f6' },
              { name: 'Beverages', pct: 15, color: '#10b981' },
              { name: 'Desserts', pct: 10, color: '#8b5cf6' }
            ].map(cat => (
              <div key={cat.name} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600 }}>
                  <span style={{ color: 'var(--text-main)' }}>{cat.name}</span>
                  <span style={{ color: 'var(--text-main)', fontWeight: 700 }}>{cat.pct}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${cat.pct}%`, height: '100%', background: cat.color, borderRadius: '4px' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* LOWER ROW: Live Order Feed & Dining Tables Panel */}
      <div className="dashboard-inner-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        
        {/* Live Order Feed Table */}
        <div className="feed-card" style={{ background: 'var(--bg-secondary)', borderRadius: '16px', padding: '24px', border: '1px solid var(--border)' }}>
          <div className="feed-header" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 className="feed-title" style={{ fontSize: '16px', fontWeight: 700, color: 'var(--black)', margin: 0 }}>
                Live Order Feed {selectedBranch ? `(${selectedBranch.branchCode})` : '(All Branches)'}
              </h2>
            </div>
            <span className="live-dot-indicator"><span className="pulse-dot"></span>Live</span>
          </div>
          <div className="feed-table-wrapper" style={{ borderRadius: '8px', border: '1px solid var(--border)', overflow: 'hidden' }}>
            <table className="menu-items-table feed-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ padding: '12px' }}>ORDER ID</th>
                  <th style={{ padding: '12px' }}>BRANCH</th>
                  <th style={{ padding: '12px' }}>TABLE</th>
                  <th style={{ padding: '12px' }}>ITEMS</th>
                  <th style={{ padding: '12px' }}>TOTAL</th>
                  <th style={{ padding: '12px' }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(-5).reverse().map(ord => {
                  const itemSummary = (ord.items || []).map(i => `${i.name} x ${i.qty}`).join(', ');
                  const branchInfo = branches.find(b => b.id === ord.branchId);
                  return (
                    <tr key={ord.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-main)' }}>#{ord.id}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ fontSize: '10px', background: '#f1f5f9', color: '#475569', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                          {branchInfo ? branchInfo.branchCode : (ord.branchId || 'BR-001')}
                        </span>
                      </td>
                      <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-main)' }}>Table {ord.table}</td>
                      <td className="items-cell" style={{ padding: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }} title={itemSummary}>
                        {itemSummary}
                      </td>
                      <td style={{ padding: '12px', fontWeight: 700, color: 'var(--primary)' }}>
                        ₹{ord.total}
                      </td>
                      <td style={{ padding: '12px' }}><Badge status={ord.status} /></td>
                    </tr>
                  );
                })}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>No live orders found for this branch selection.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dining Tables Grid */}
        <div className="tables-widget-card" style={{ background: 'var(--bg-secondary)', borderRadius: '16px', padding: '24px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 className="feed-title" style={{ fontSize: '16px', fontWeight: 700, color: 'var(--black)', margin: 0 }}>
              Live Tables Status
            </h2>
            <span style={{ fontSize: '11px', color: '#64748b' }}>
              {occupiedTablesCount} Occupied
            </span>
          </div>
          <div className="tables-status-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {tables.slice(0, 6).map(table => (
              <div 
                key={table.id} 
                style={{ 
                  background: 'var(--bg-secondary)', 
                  border: '1.5px solid var(--border)', 
                  borderTop: table.status === 'Occupied' ? '4px solid #ef4444' : '4px solid var(--success)',
                  borderRadius: '8px', 
                  padding: '12px 8px', 
                  textAlign: 'center',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.01)',
                  transition: 'transform 0.2s'
                }}
              >
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '2px' }}>
                  {table.id}
                </div>
                {table.branchId && (
                  <div style={{ fontSize: '9px', color: '#64748b', fontWeight: 600, marginBottom: '4px' }}>
                    {table.branchId}
                  </div>
                )}
                <span style={{ 
                  fontSize: '9px', 
                  fontWeight: 700, 
                  textTransform: 'uppercase',
                  color: table.status === 'Occupied' ? '#ef4444' : 'var(--success)'
                }}>
                  {table.status === 'Occupied' ? 'OCCUPIED' : 'FREE'}
                </span>
              </div>
            ))}
            {tables.length === 0 && (
              <div style={{ gridColumn: 'span 2', textAlign: 'center', color: '#94a3b8', padding: '16px', fontSize: '12px' }}>
                No tables configured.
              </div>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
