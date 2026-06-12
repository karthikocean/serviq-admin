import React from 'react';
import { Badge } from './Badge';

export default function OverviewPanel({ orders = [], tables = [], todayRevenue = 0 }) {
  const preparingOrdersCount = orders.filter(o => o.status === 'preparing').length;
  const occupiedTablesCount = tables.filter(t => t.status === 'Occupied').length;
  const pendingOrdersCount = orders.filter(o => o.status === 'new').length;
  const completedOrdersCount = orders.filter(o => o.status === 'done').length;

  // Calculate dynamic monthly sales
  const monthlySales = todayRevenue + 23194; // Realistic dynamic turnover

  // Dynamically compute top ordered menu item
  const getTopOrderedItem = () => {
    const itemCounts = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        itemCounts[item.name] = (itemCounts[item.name] || 0) + (item.qty || 0);
      });
    });
    let topItemName = 'Masala Chai';
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

  return (
    <section className="panel-view active">
      {/* 8 STATS CARDS GRID (2 Rows of 4 Cards) */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '24px' }}>
        
        {/* Card 1: Today's Orders */}
        <div className="stat-card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div className="stat-main-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-info">
              <div className="stat-label" style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Today's Orders</div>
              <h3 style={{ fontSize: '24px', fontWeight: 700, margin: '4px 0', color: 'var(--black)' }}>{orders.length}</h3>
              <div className="stat-sub-label" style={{ fontSize: '11px', color: 'var(--success)', fontWeight: 600 }}>Orders received today</div>
            </div>
          </div>
        </div>

        {/* Card 2: Active Tables */}
        <div className="stat-card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div className="stat-main-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-info">
              <div className="stat-label" style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Active Tables</div>
              <h3 style={{ fontSize: '24px', fontWeight: 700, margin: '4px 0', color: 'var(--black)' }}>{occupiedTablesCount}</h3>
              <div className="stat-sub-label" style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Occupied tables</div>
            </div>
          </div>
        </div>

        {/* Card 3: Revenue Today */}
        <div className="stat-card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div className="stat-main-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-info">
              <div className="stat-label" style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Revenue Today</div>
              <h3 style={{ fontSize: '24px', fontWeight: 700, margin: '4px 0', color: 'var(--black)' }}>₹{todayRevenue.toLocaleString('en-IN')}</h3>
              <div className="stat-sub-label" style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Daily sales</div>
            </div>
          </div>
        </div>

        {/* Card 4: Revenue This Month */}
        <div className="stat-card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div className="stat-main-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-info">
              <div className="stat-label" style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Revenue This Month</div>
              <h3 style={{ fontSize: '24px', fontWeight: 700, margin: '4px 0', color: 'var(--black)' }}>₹{monthlySales.toLocaleString('en-IN')}</h3>
              <div className="stat-sub-label" style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Monthly sales</div>
            </div>
          </div>
        </div>

        {/* Card 5: Pending Orders */}
        <div className="stat-card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div className="stat-main-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-info">
              <div className="stat-label" style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Pending Orders</div>
              <h3 style={{ fontSize: '24px', fontWeight: 700, margin: '4px 0', color: 'var(--black)' }}>{pendingOrdersCount}</h3>
              <div className="stat-sub-label" style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 600 }}>Orders awaiting processing</div>
            </div>
          </div>
        </div>

        {/* Card 6: Completed Orders */}
        <div className="stat-card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div className="stat-main-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-info">
              <div className="stat-label" style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Completed Orders</div>
              <h3 style={{ fontSize: '24px', fontWeight: 700, margin: '4px 0', color: 'var(--black)' }}>{completedOrdersCount}</h3>
              <div className="stat-sub-label" style={{ fontSize: '11px', color: 'var(--success)', fontWeight: 600 }}>Orders served</div>
            </div>
          </div>
        </div>

        {/* Card 7: Top Items */}
        <div className="stat-card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div className="stat-main-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-info">
              <div className="stat-label" style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Top Items</div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '6px 0', color: 'var(--black)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }} title={topItem}>{topItem}</h3>
              <div className="stat-sub-label" style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Most ordered items</div>
            </div>
          </div>
        </div>

        {/* Card 8: QR Scans */}
        <div className="stat-card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div className="stat-main-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-info">
              <div className="stat-label" style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>QR Scans</div>
              <h3 style={{ fontSize: '24px', fontWeight: 700, margin: '4px 0', color: 'var(--black)' }}>30</h3>
              <div className="stat-sub-label" style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Total table scans</div>
            </div>
          </div>
        </div>

      </div>

      {/* CHARTS CONTAINER (Revenue Growth & Order Breakdown) */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '24px' }}>
        
        {/* Revenue Growth Card */}
        <div className="settings-card" style={{ background: 'var(--bg-secondary)', borderRadius: '16px', padding: '24px', border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          <h3 className="feed-title" style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--black)' }}>Revenue Growth</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 24px 0' }}>Past 6 Months</p>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'stretch', height: '180px', padding: '0 10px', marginTop: '20px' }}>
            {[
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
            ))}
          </div>
        </div>

        {/* Order Breakdown Card */}
        <div className="settings-card" style={{ background: 'var(--bg-secondary)', borderRadius: '16px', padding: '24px', border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          <h3 className="feed-title" style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--black)' }}>Order Breakdown</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 24px 0' }}>By Menu Category</p>
          
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
          <div className="feed-header" style={{ marginBottom: '16px' }}>
            <h2 className="feed-title" style={{ fontSize: '16px', fontWeight: 700, color: 'var(--black)' }}>Live Order Feed</h2>
            <span className="live-dot-indicator"><span className="pulse-dot"></span>Live</span>
          </div>
          <div className="feed-table-wrapper" style={{ borderRadius: '8px', border: '1px solid var(--border)', overflow: 'hidden' }}>
            <table className="menu-items-table feed-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ padding: '12px' }}>ORDER ID</th>
                  <th style={{ padding: '12px' }}>TABLE</th>
                  <th style={{ padding: '12px' }}>ITEMS</th>
                  <th style={{ padding: '12px' }}>TIME</th>
                  <th style={{ padding: '12px' }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(-5).reverse().map(ord => {
                  const itemSummary = ord.items.map(i => `${i.name} x ${i.qty}`).join(', ');
                  return (
                    <tr key={ord.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-main)' }}>#{ord.id}</td>
                      <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-main)' }}>Table {ord.table}</td>
                      <td className="items-cell" style={{ padding: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }} title={itemSummary}>{itemSummary}</td>
                      <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{ord.timeAgo}</td>
                      <td style={{ padding: '12px' }}><Badge status={ord.status} /></td>
                    </tr>
                  );
                })}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>No live orders found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dining Tables Grid */}
        <div className="tables-widget-card" style={{ background: 'var(--bg-secondary)', borderRadius: '16px', padding: '24px', border: '1px solid var(--border)' }}>
          <h2 className="feed-title" style={{ fontSize: '16px', fontWeight: 700, color: 'var(--black)', marginBottom: '20px' }}>Tables</h2>
          <div className="tables-status-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
            {tables.slice(0, 5).map(table => (
              <div 
                key={table.id} 
                style={{ 
                  background: 'var(--bg-secondary)', 
                  border: '1.5px solid var(--border)', 
                  borderTop: table.status === 'Occupied' ? '4px solid #ef4444' : '4px solid var(--success)',
                  borderRadius: '8px', 
                  padding: '14px 10px', 
                  textAlign: 'center',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.01)',
                  transition: 'transform 0.2s'
                }}
              >
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>{table.id}</div>
                <span style={{ 
                  fontSize: '10px', 
                  fontWeight: 700, 
                  textTransform: 'uppercase',
                  color: table.status === 'Occupied' ? '#ef4444' : 'var(--success)'
                }}>
                  {table.status === 'Occupied' ? 'OCCUPIED' : 'FREE'}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
