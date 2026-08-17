import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';

const EyeIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const ReceiptIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M4 2v20l2-2 2 2 2-2 2 2 2-2 2 2 2-2 2 2V2z" />
    <line x1="8" y1="6" x2="16" y2="6" />
    <line x1="8" y1="10" x2="16" y2="10" />
    <line x1="8" y1="14" x2="12" y2="14" />
  </svg>
);

export default function ReportsPanel({
  orders = [],
  allOrders = [],
  staff = [],
  tables = [],
  menu = [],
  branches = [],
  selectedBranchId = null,
  activeRestaurant = {},
  initialTab = 'waiter'
}) {
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [activeReportTab, setActiveReportTab] = useState(initialTab === 'kitchen' ? 'kitchen' : 'waiter'); // 'waiter' | 'kitchen'
  
  // Waiter & Kitchen filter states
  const [filterWaiter, setFilterWaiter] = useState('All');
  const [filterKitchenCategory, setFilterKitchenCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals for Waiter / Order details
  const [selectedOrderForView, setSelectedOrderForView] = useState(null);
  const [selectedOrderForReceipt, setSelectedOrderForReceipt] = useState(null);
  const [selectedWaiterOrdersModal, setSelectedWaiterOrdersModal] = useState(null);

  const currency = activeRestaurant?.settings?.currency || '₹';

  useEffect(() => {
    if (initialTab === 'kitchen' || initialTab === 'waiter') {
      setActiveReportTab(initialTab);
    }
  }, [initialTab]);

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

  // Filter orders by date range
  const filteredOrders = orders.filter(ord => {
    const date = getOrderDate(ord);
    if (dateStart && date < dateStart) return false;
    if (dateEnd && date > dateEnd) return false;
    return true;
  });

  // 1. Waiter Performance Report Data
  const waiters = staff.filter(s => s.role === 'Waiter');
  const waiterData = waiters.map((waiter, idx) => {
    const waiterOrders = filteredOrders.filter(o => o.waiter === waiter.name);
    const totalRev = waiterOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const avgVal = waiterOrders.length > 0 ? parseFloat((totalRev / waiterOrders.length).toFixed(2)) : 0;
    const assignedTables = tables.filter(t => t.assignedWaiterId === waiter.id || t.assignedWaiter === waiter.name);

    return {
      sno: idx + 1,
      id: waiter.id,
      name: waiter.name,
      email: waiter.email || `${waiter.name.toLowerCase().replace(/\s+/g, '')}@serviq.com`,
      phone: waiter.phone || '9876543210',
      status: waiter.status || 'On Duty',
      assignedTablesCount: assignedTables.length,
      assignedTablesList: assignedTables.map(t => t.id),
      totalOrders: waiterOrders.length,
      revenue: totalRev,
      averageOrderValue: avgVal,
      orders: waiterOrders
    };
  }).filter(w => {
    if (filterWaiter !== 'All' && w.name !== filterWaiter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = w.name.toLowerCase().includes(q);
      const matchEmail = w.email.toLowerCase().includes(q);
      const matchPhone = w.phone.includes(q);
      const matchTable = w.assignedTablesList.some(t => t.toLowerCase().includes(q));
      if (!matchName && !matchEmail && !matchPhone && !matchTable) return false;
    }
    return true;
  }).sort((a, b) => b.revenue - a.revenue);

  // 2. Kitchen Performance Report Data
  const getKitchenReportData = () => {
    const kitchenItemsGrouped = {};
    filteredOrders.forEach(ord => {
      (ord.items || []).forEach(it => {
        const key = it.name;
        if (!kitchenItemsGrouped[key]) {
          const menuItem = menu.find(m => m.name.toLowerCase() === it.name.toLowerCase());
          kitchenItemsGrouped[key] = {
            itemName: it.name,
            category: menuItem ? menuItem.category : 'Starters',
            quantityPrepared: 0,
            revenueGenerated: 0,
            avgPrepTime: '12-15 mins',
            status: ord.status === 'completed' ? 'Prepared & Served' : (ord.status === 'preparing' ? 'In Preparation' : 'Order Received')
          };
        }
        kitchenItemsGrouped[key].quantityPrepared += it.qty || 0;
        kitchenItemsGrouped[key].revenueGenerated += (it.price || 0) * (it.qty || 0);
      });
    });

    return Object.values(kitchenItemsGrouped).filter(k => {
      if (filterKitchenCategory !== 'All' && k.category !== filterKitchenCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchItem = k.itemName.toLowerCase().includes(q);
        const matchCat = k.category.toLowerCase().includes(q);
        if (!matchItem && !matchCat) return false;
      }
      return true;
    }).sort((a, b) => b.quantityPrepared - a.quantityPrepared);
  };

  const kitchenData = getKitchenReportData();

  // Aggregate Stats
  const totalWaiterRevenue = waiterData.reduce((sum, w) => sum + w.revenue, 0);
  const totalWaiterOrders = waiterData.reduce((sum, w) => sum + w.totalOrders, 0);
  const waitersOnDutyCount = waiters.filter(w => w.status === 'On Duty').length;

  const totalKitchenDishes = kitchenData.reduce((sum, k) => sum + k.quantityPrepared, 0);
  const totalKitchenRevenue = kitchenData.reduce((sum, k) => sum + k.revenueGenerated, 0);
  const kitchenCategoriesCount = new Set(kitchenData.map(k => k.category)).size;

  const handleResetFilters = () => {
    setDateStart('');
    setDateEnd('');
    setFilterWaiter('All');
    setFilterKitchenCategory('All');
    setSearchQuery('');
  };

  // Excel / CSV Export
  const exportToExcel = () => {
    let headers = [];
    let rows = [];
    let filename = '';

    if (activeReportTab === 'waiter') {
      headers = ['S.No', 'Waiter Name', 'Duty Status', 'Assigned Tables', 'Orders Served', `Revenue Generated (${currency})`, `Avg Order (${currency})`];
      rows = waiterData.map((r, i) => [i + 1, r.name, r.status, r.assignedTablesList.join('; ') || 'None', r.totalOrders, r.revenue, r.averageOrderValue]);
      filename = 'waiter_reports.csv';
    } else {
      headers = ['S.No', 'Food Item Name', 'Category', 'Quantity Prepared', 'Avg Prep Time', `Revenue (${currency})`, 'Status'];
      rows = kitchenData.map((r, i) => [i + 1, r.itemName, r.category, r.quantityPrepared, r.avgPrepTime, r.revenueGenerated, r.status]);
      filename = 'kitchen_reports.csv';
    }

    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // PDF Export
  const exportToPDF = () => {
    let reportTitle = activeReportTab === 'waiter' ? 'Waiter Performance Reports' : 'Kitchen Preparation Reports';
    let tableHeaders = [];
    let tableRows = [];

    if (activeReportTab === 'waiter') {
      tableHeaders = ['S.No', 'Waiter Name', 'Duty Status', 'Assigned Tables', 'Orders Served', 'Revenue', 'Avg Order Value'];
      tableRows = waiterData.map((r, i) => `
        <tr>
          <td>${i + 1}</td>
          <td><strong>${r.name}</strong></td>
          <td>${r.status}</td>
          <td>${r.assignedTablesList.join(', ') || 'None'}</td>
          <td>${r.totalOrders}</td>
          <td>${currency}${r.revenue.toLocaleString()}</td>
          <td>${currency}${r.averageOrderValue.toLocaleString()}</td>
        </tr>
      `);
    } else {
      tableHeaders = ['S.No', 'Food Item Name', 'Category', 'Quantity Prepared', 'Avg Prep Time', 'Revenue', 'Status'];
      tableRows = kitchenData.map((r, i) => `
        <tr>
          <td>${i + 1}</td>
          <td><strong>${r.itemName}</strong></td>
          <td>${r.category}</td>
          <td>${r.quantityPrepared}</td>
          <td>${r.avgPrepTime}</td>
          <td>${currency}${r.revenueGenerated.toLocaleString()}</td>
          <td>${r.status}</td>
        </tr>
      `);
    }

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>${reportTitle} - ${activeRestaurant.name || 'Serviq'}</title>
          <style>
            body { font-family: 'Inter', system-ui, sans-serif; padding: 40px; color: #0f172a; }
            h1 { font-family: 'Outfit', sans-serif; font-size: 24px; margin-bottom: 4px; }
            p { font-size: 13px; color: #64748b; margin-top: 0; }
            .header-row { display: flex; justify-content: space-between; border-bottom: 2px solid #ff7a00; padding-bottom: 20px; margin-bottom: 30px; }
            .meta-block { text-align: right; font-size: 12px; line-height: 1.6; }
            .summary-bar { display: flex; gap: 20px; margin-bottom: 30px; }
            .summary-box { flex: 1; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 16px; background-color: #f8fafc; }
            .summary-label { font-size: 11px; font-weight: bold; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
            .summary-val { font-size: 20px; font-weight: 800; color: #0f172a; margin-top: 6px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; text-align: left; }
            th { background-color: #f1f5f9; padding: 12px 14px; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; border-bottom: 1.5px solid #cbd5e1; }
            td { padding: 12px 14px; font-size: 13px; border-bottom: 1px solid #e2e8f0; }
            tr:last-child td { border-bottom: none; }
            @media print {
              body { padding: 20px; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header-row">
            <div>
              <h1>${reportTitle}</h1>
              <p>${activeRestaurant.name || 'Serviq'} - Restaurant Operations Reports</p>
            </div>
            <div class="meta-block">
              <strong>Generated on:</strong> ${new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}<br>
              <strong>Date Range:</strong> ${dateStart || 'All Time'} to ${dateEnd || 'Present'}
            </div>
          </div>

          <div class="summary-bar">
            <div class="summary-box">
              <div class="summary-label">${activeReportTab === 'waiter' ? 'Total Waiter Revenue' : 'Total Kitchen Revenue'}</div>
              <div class="summary-val">${currency}${(activeReportTab === 'waiter' ? totalWaiterRevenue : totalKitchenRevenue).toLocaleString()}</div>
            </div>
            <div class="summary-box">
              <div class="summary-label">${activeReportTab === 'waiter' ? 'Orders Fulfilled' : 'Dishes Prepared'}</div>
              <div class="summary-val">${activeReportTab === 'waiter' ? totalWaiterOrders : totalKitchenDishes}</div>
            </div>
            <div class="summary-box">
              <div class="summary-label">${activeReportTab === 'waiter' ? 'Waiters On Duty' : 'Active Food Categories'}</div>
              <div class="summary-val">${activeReportTab === 'waiter' ? `${waitersOnDutyCount} / ${waiters.length}` : kitchenCategoriesCount}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                ${tableHeaders.map(th => `<th>${th}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${tableRows.join('')}
            </tbody>
          </table>

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <section className="panel-view active" style={{ width: '100%', paddingBottom: '24px' }}>
      {/* Top Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: '16px',
        marginBottom: '20px',
        borderBottom: '1.5px solid #fdba74',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>
            Reports
          </h2>
          
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="premium-filter-btn-reset" onClick={exportToExcel} title="Download Excel CSV Sheet">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Export Excel
          </button>
          <button className="premium-filter-btn-reset" onClick={exportToPDF} title="Download PDF print copy">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            Export PDF
          </button>
        </div>
      </div>

      {/* 2 MAIN DEDICATED REPORT TABS */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '20px',
        background: '#fff',
        padding: '8px',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        width: 'fit-content'
      }}>
        <button
          type="button"
          onClick={() => { setActiveReportTab('waiter'); handleResetFilters(); }}
          style={{
            padding: '10px 24px',
            borderRadius: '8px',
            border: activeReportTab === 'waiter' ? '1.5px solid #16a34a' : '1px solid transparent',
            background: activeReportTab === 'waiter' ? '#dcfce7' : 'transparent',
            color: activeReportTab === 'waiter' ? '#166534' : '#64748b',
            fontSize: '14px',
            fontWeight: activeReportTab === 'waiter' ? 800 : 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.15s'
          }}
        >
          🤵 Waiter Reports ({waiters.length})
        </button>

        <button
          type="button"
          onClick={() => { setActiveReportTab('kitchen'); handleResetFilters(); }}
          style={{
            padding: '10px 24px',
            borderRadius: '8px',
            border: activeReportTab === 'kitchen' ? '1.5px solid #ea580c' : '1px solid transparent',
            background: activeReportTab === 'kitchen' ? '#ffedd5' : 'transparent',
            color: activeReportTab === 'kitchen' ? '#9a3412' : '#64748b',
            fontSize: '14px',
            fontWeight: activeReportTab === 'kitchen' ? 800 : 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.15s'
          }}
        >
          👨‍🍳 Kitchen Reports ({kitchenData.length})
        </button>
      </div>

      {/* KPI Overview Cards for Active Report */}
      {activeReportTab === 'waiter' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', borderLeft: '4px solid #16a34a', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Waiter Revenue</div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#16a34a', marginTop: '6px', fontFamily: "'Outfit', sans-serif" }}>{currency}{totalWaiterRevenue.toLocaleString('en-IN')}</div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', fontWeight: 600 }}>Fulfilled by serving team</div>
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', borderLeft: '4px solid #3b82f6', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Orders Served</div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#3b82f6', marginTop: '6px', fontFamily: "'Outfit', sans-serif" }}>{totalWaiterOrders}</div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', fontWeight: 600 }}>Completed order tickets</div>
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', borderLeft: '4px solid var(--primary)', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Waiters On Duty</div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', marginTop: '6px', fontFamily: "'Outfit', sans-serif" }}>{waitersOnDutyCount} <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 600 }}>/ {waiters.length}</span></div>
            <div style={{ fontSize: '11px', color: '#16a34a', marginTop: '2px', fontWeight: 600 }}>Available for table service</div>
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', borderLeft: '4px solid #f59e0b', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Average Order Value</div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#b45309', marginTop: '6px', fontFamily: "'Outfit', sans-serif" }}>
              {currency}{totalWaiterOrders > 0 ? (totalWaiterRevenue / totalWaiterOrders).toFixed(2) : '0.00'}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', fontWeight: 600 }}>Per customer order</div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', borderLeft: '4px solid #ea580c', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Dishes Prepared</div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#ea580c', marginTop: '6px', fontFamily: "'Outfit', sans-serif" }}>{totalKitchenDishes}</div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', fontWeight: 600 }}>Cooked and dispatched</div>
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', borderLeft: '4px solid var(--primary)', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Food Revenue Generated</div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', marginTop: '6px', fontFamily: "'Outfit', sans-serif" }}>{currency}{totalKitchenRevenue.toLocaleString('en-IN')}</div>
            <div style={{ fontSize: '11px', color: '#16a34a', marginTop: '2px', fontWeight: 600 }}>Total value of dishes cooked</div>
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', borderLeft: '4px solid #3b82f6', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Food Categories</div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#3b82f6', marginTop: '6px', fontFamily: "'Outfit', sans-serif" }}>{kitchenCategoriesCount}</div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', fontWeight: 600 }}>Starters, Meals, Drinks, etc.</div>
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', borderLeft: '4px solid #10b981', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Avg Kitchen Preparation Time</div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#10b981', marginTop: '6px', fontFamily: "'Outfit', sans-serif" }}>12 - 15 <span style={{ fontSize: '14px', color: '#64748b' }}>mins</span></div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', fontWeight: 600 }}>Average order fulfillment</div>
          </div>
        </div>
      )}

      {/* Date Filters & Search Row */}
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        padding: '16px 20px',
        marginBottom: '20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr 1fr auto', gap: '12px', alignItems: 'center' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>Start Date</label>
            <input 
              type="date"
              value={dateStart}
              onChange={e => setDateStart(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', backgroundColor: '#f8fafc' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>End Date</label>
            <input 
              type="date"
              value={dateEnd}
              onChange={e => setDateEnd(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', backgroundColor: '#f8fafc' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>
              {activeReportTab === 'waiter' ? 'Filter by Waiter' : 'Filter by Category'}
            </label>
            {activeReportTab === 'waiter' ? (
              <select
                value={filterWaiter}
                onChange={e => setFilterWaiter(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', fontWeight: 600, backgroundColor: '#fff' }}
              >
                <option value="All">All Waiters ({waiters.length})</option>
                {waiters.map(w => (
                  <option key={w.id} value={w.name}>{w.name}</option>
                ))}
              </select>
            ) : (
              <select
                value={filterKitchenCategory}
                onChange={e => setFilterKitchenCategory(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', fontWeight: 600, backgroundColor: '#fff' }}
              >
                <option value="All">All Food Categories</option>
                {Array.from(new Set(menu.map(m => m.category).filter(Boolean))).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>Search</label>
            <input
              type="text"
              placeholder={activeReportTab === 'waiter' ? 'Search waiter, table...' : 'Search food item...'}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', backgroundColor: '#f8fafc' }}
            />
          </div>

          <div style={{ alignSelf: 'flex-end' }}>
            <button
              type="button"
              className="premium-filter-btn-reset"
              onClick={handleResetFilters}
              style={{ padding: '8px 14px', fontSize: '12px' }}
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* REPORT CONTENT TABLES */}
      <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        {/* 1. WAITER PERFORMANCE REPORT TABLE */}
        {activeReportTab === 'waiter' && (
          <table style={{ width: '100%', minWidth: '950px', borderCollapse: 'collapse', textAlign: 'left', tableLayout: 'fixed' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0' }}>
                <th style={{ width: '5%', padding: '14px 12px', fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>S.NO</th>
                <th style={{ width: '22%', padding: '14px 14px', fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>WAITER NAME</th>
                <th style={{ width: '11%', padding: '14px 10px', fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', textAlign: 'center' }}>DUTY STATUS</th>
                <th style={{ width: '16%', padding: '14px 12px', fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>ASSIGNED TABLES</th>
                <th style={{ width: '12%', padding: '14px 12px', fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', textAlign: 'center' }}>ORDERS SERVED</th>
                <th style={{ width: '14%', padding: '14px 12px', fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', textAlign: 'right' }}>TOTAL REVENUE</th>
                <th style={{ width: '12%', padding: '14px 12px', fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', textAlign: 'right' }}>AVG ORDER VALUE</th>
                <th style={{ width: '8%', padding: '14px 12px', fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {waiterData.map((w, index) => (
                <tr key={w.id} style={{ borderBottom: '1px solid #f1f5f9', height: '58px', transition: 'background-color 0.15s' }}>
                  <td style={{ padding: '12px 12px', fontWeight: 800, fontSize: '12px', color: '#0f172a', fontFamily: 'monospace' }}>
                    {index + 1}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: '#ecfdf5',
                        border: '1px solid #a7f3d0',
                        color: '#166534',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '13px',
                        fontWeight: 800,
                        flexShrink: 0
                      }}>
                        {w.name.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {w.name}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {w.email} · {w.phone}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '3px 8px',
                      borderRadius: '12px',
                      fontSize: '10px',
                      fontWeight: 800,
                      backgroundColor: w.status === 'On Duty' ? '#dcfce7' : '#f1f5f9',
                      color: w.status === 'On Duty' ? '#166534' : '#64748b'
                    }}>
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: w.status === 'On Duty' ? '#16a34a' : '#94a3b8' }}></span>
                      {w.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 12px' }}>
                    {w.assignedTablesList.length > 0 ? (
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {w.assignedTablesList.map(t => (
                          <span key={t} style={{ background: '#fff7ed', border: '1px solid #fed7aa', color: '#c2410c', fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic' }}>No tables assigned</span>
                    )}
                  </td>
                  <td style={{ padding: '12px 12px', textAlign: 'center', fontWeight: 700, color: '#0f172a' }}>
                    {w.totalOrders} <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>orders</span>
                  </td>
                  <td style={{ padding: '12px 12px', textAlign: 'right', fontWeight: 800, color: '#16a34a', fontSize: '14px', fontFamily: "'Outfit', sans-serif" }}>
                    {currency}{w.revenue.toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '12px 12px', textAlign: 'right', fontWeight: 700, color: '#475569', fontSize: '13px' }}>
                    {currency}{w.averageOrderValue.toFixed(2)}
                  </td>
                  <td style={{ padding: '12px 12px', textAlign: 'right' }}>
                    {w.orders.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => setSelectedWaiterOrdersModal(w)}
                        style={{
                          padding: '5px 10px',
                          borderRadius: '6px',
                          border: '1px solid #e2e8f0',
                          background: '#fff',
                          color: 'var(--primary)',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Orders ({w.orders.length})
                      </button>
                    ) : (
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>-</span>
                    )}
                  </td>
                </tr>
              ))}

              {waiterData.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    No waiter performance records found for this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* 2. KITCHEN PREPARATION REPORT TABLE */}
        {activeReportTab === 'kitchen' && (
          <table style={{ width: '100%', minWidth: '950px', borderCollapse: 'collapse', textAlign: 'left', tableLayout: 'fixed' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0' }}>
                <th style={{ width: '5%', padding: '14px 12px', fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>S.NO</th>
                <th style={{ width: '25%', padding: '14px 14px', fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>FOOD ITEM</th>
                <th style={{ width: '15%', padding: '14px 12px', fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>CATEGORY</th>
                <th style={{ width: '15%', padding: '14px 12px', fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', textAlign: 'center' }}>QUANTITY PREPARED</th>
                <th style={{ width: '15%', padding: '14px 12px', fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', textAlign: 'center' }}>AVG PREP TIME</th>
                <th style={{ width: '13%', padding: '14px 12px', fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', textAlign: 'right' }}>REVENUE GENERATED</th>
                <th style={{ width: '12%', padding: '14px 12px', fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', textAlign: 'center' }}>KITCHEN STATUS</th>
              </tr>
            </thead>
            <tbody>
              {kitchenData.map((k, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #f1f5f9', height: '58px', transition: 'background-color 0.15s' }}>
                  <td style={{ padding: '12px 12px', fontWeight: 800, fontSize: '12px', color: '#0f172a', fontFamily: 'monospace' }}>
                    {index + 1}
                  </td>
                  <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0f172a', fontSize: '13px' }}>
                    {k.itemName}
                  </td>
                  <td style={{ padding: '12px 12px' }}>
                    <span style={{ fontSize: '11px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#334155', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>
                      {k.category}
                    </span>
                  </td>
                  <td style={{ padding: '12px 12px', textAlign: 'center', fontWeight: 800, color: '#ea580c', fontSize: '14px', fontFamily: "'Outfit', sans-serif" }}>
                    {k.quantityPrepared} <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>dishes</span>
                  </td>
                  <td style={{ padding: '12px 12px', textAlign: 'center', color: '#64748b', fontSize: '12px', fontWeight: 600 }}>
                    {k.avgPrepTime}
                  </td>
                  <td style={{ padding: '12px 12px', textAlign: 'right', fontWeight: 800, color: 'var(--primary)', fontSize: '13px', fontFamily: "'Outfit', sans-serif" }}>
                    {currency}{k.revenueGenerated.toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '12px 12px', textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-flex',
                      padding: '3px 8px',
                      borderRadius: '12px',
                      fontSize: '10px',
                      fontWeight: 800,
                      backgroundColor: k.status === 'Prepared & Served' ? '#dcfce7' : '#ffedd5',
                      color: k.status === 'Prepared & Served' ? '#166534' : '#c2410c'
                    }}>
                      {k.status}
                    </span>
                  </td>
                </tr>
              ))}

              {kitchenData.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    No kitchen preparation records found for this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* WAITER ORDERS POPUP MODAL */}
      <Modal
        isOpen={!!selectedWaiterOrdersModal}
        onClose={() => setSelectedWaiterOrdersModal(null)}
        title={`Orders Fulfilled by ${selectedWaiterOrdersModal?.name || ''}`}
        maxWidth="680px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
          <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '8px 10px', textAlign: 'left' }}>Order ID</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left' }}>Table</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left' }}>Items</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Total</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(selectedWaiterOrdersModal?.orders || []).map(ord => (
                  <tr key={ord.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '8px 10px', fontWeight: 700 }}>#{ord.id}</td>
                    <td style={{ padding: '8px 10px' }}>Table {ord.table}</td>
                    <td style={{ padding: '8px 10px' }}>{(ord.items || []).map(i => `${i.qty}x ${i.name}`).join(', ')}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: 'var(--primary)' }}>{currency}{ord.total}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          type="button"
                          title="View Order Details"
                          onClick={() => setSelectedOrderForView(ord)}
                          style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '4px' }}
                        >
                          <EyeIcon size={16} />
                        </button>
                        <button
                          type="button"
                          title="View Receipt"
                          onClick={() => setSelectedOrderForReceipt(ord)}
                          style={{ background: 'transparent', border: 'none', color: '#16a34a', cursor: 'pointer', padding: '4px' }}
                        >
                          <ReceiptIcon size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button
              type="button"
              className="btn btn-black"
              onClick={() => setSelectedWaiterOrdersModal(null)}
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* VIEW ORDER DETAILS MODAL */}
      <Modal
        isOpen={!!selectedOrderForView}
        onClose={() => setSelectedOrderForView(null)}
        title={`Order Details #${selectedOrderForView?.id || ''}`}
        maxWidth="500px"
      >
        {selectedOrderForView && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>TABLE</span>
                <div style={{ fontWeight: 800, fontSize: '14px' }}>Table {selectedOrderForView.table}</div>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>WAITER</span>
                <div style={{ fontWeight: 800, fontSize: '14px' }}>{selectedOrderForView.waiter}</div>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>STATUS</span>
                <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--primary)' }}>{selectedOrderForView.status?.toUpperCase()}</div>
              </div>
            </div>

            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ padding: '10px 14px', background: '#f1f5f9', fontWeight: 700, fontSize: '13px' }}>Items Ordered</div>
              <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(selectedOrderForView.items || []).map((it, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span>{it.qty}x {it.name}</span>
                    <span style={{ fontWeight: 700 }}>{currency}{(it.price * it.qty).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div style={{ padding: '10px 14px', background: '#fff7ed', borderTop: '1px solid #fed7aa', display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
                <span>Total Amount</span>
                <span style={{ color: 'var(--primary)', fontSize: '16px' }}>{currency}{selectedOrderForView.total}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button
                type="button"
                className="btn btn-black"
                onClick={() => setSelectedOrderForView(null)}
              >
                Done
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* VIEW RECEIPT MODAL */}
      <Modal
        isOpen={!!selectedOrderForReceipt}
        onClose={() => setSelectedOrderForReceipt(null)}
        title={`Receipt #${selectedOrderForReceipt?.id || ''}`}
        maxWidth="400px"
      >
        {selectedOrderForReceipt && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            marginTop: '10px',
            padding: '16px',
            background: '#fafafa',
            border: '1px dashed #cbd5e1',
            borderRadius: '8px',
            fontFamily: 'monospace'
          }}>
            <div style={{ textAlign: 'center', borderBottom: '1px dashed #cbd5e1', paddingBottom: '10px' }}>
              <h3 style={{ margin: 0, fontFamily: "'Outfit', sans-serif" }}>{activeRestaurant.name || 'Serviq Restaurant'}</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#64748b' }}>Tax Invoice / Bill</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span>Order ID: #{selectedOrderForReceipt.id}</span>
              <span>Table: {selectedOrderForReceipt.table}</span>
            </div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              Waiter: {selectedOrderForReceipt.waiter}
            </div>

            <div style={{ borderTop: '1px dashed #cbd5e1', borderBottom: '1px dashed #cbd5e1', padding: '8px 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {(selectedOrderForReceipt.items || []).map((it, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span>{it.qty}x {it.name}</span>
                  <span>{currency}{(it.price * it.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '15px' }}>
              <span>TOTAL</span>
              <span>{currency}{selectedOrderForReceipt.total}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button
                type="button"
                className="btn btn-black"
                style={{ width: '100%' }}
                onClick={() => setSelectedOrderForReceipt(null)}
              >
                Close Receipt
              </button>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}
