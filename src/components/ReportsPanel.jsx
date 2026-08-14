import React, { useState } from 'react';

export default function ReportsPanel({
  orders = [],
  allOrders = [],
  menu = [],
  branches = [],
  selectedBranchId = null,
  activeRestaurant = {}
}) {
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [activeReportTab, setActiveReportTab] = useState('sales'); // 'sales', 'branch', 'item', 'table'

  const currency = activeRestaurant?.settings?.currency || '₹';

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

  // Calculate Sales Report Data (Grouped by Date)
  const getSalesReportData = () => {
    const grouped = {};
    filteredOrders.forEach(ord => {
      const date = getOrderDate(ord);
      if (!grouped[date]) {
        grouped[date] = { date, totalOrders: 0, revenue: 0 };
      }
      grouped[date].totalOrders += 1;
      grouped[date].revenue += ord.total || 0;
    });

    return Object.values(grouped).sort((a, b) => b.date.localeCompare(a.date)).map(day => ({
      ...day,
      averageOrderValue: day.totalOrders > 0 ? parseFloat((day.revenue / day.totalOrders).toFixed(2)) : 0
    }));
  };

  // Calculate Branch Performance Report Data
  const getBranchReportData = () => {
    const totalOrgRev = branches.reduce((sum, b) => {
      const bOrders = (allOrders.length > 0 ? allOrders : filteredOrders).filter(o => o.branchId === b.id);
      return sum + bOrders.reduce((bSum, o) => bSum + (o.total || 0), 0);
    }, 0) || 1;

    return branches.map(branch => {
      const bOrders = (allOrders.length > 0 ? allOrders : filteredOrders).filter(o => {
        if (o.branchId !== branch.id) return false;
        const date = getOrderDate(o);
        if (dateStart && date < dateStart) return false;
        if (dateEnd && date > dateEnd) return false;
        return true;
      });

      const bRevenue = bOrders.reduce((sum, o) => sum + (o.total || 0), 0);
      const avgValue = bOrders.length > 0 ? parseFloat((bRevenue / bOrders.length).toFixed(2)) : 0;
      const sharePct = Math.round((bRevenue / totalOrgRev) * 100);

      return {
        branchId: branch.id,
        branchName: branch.branchName,
        branchCode: branch.branchCode,
        city: branch.city || 'Tamil Nadu',
        manager: branch.branchManager || 'Unassigned',
        status: branch.status || 'Active',
        totalOrders: bOrders.length,
        revenue: bRevenue,
        averageOrderValue: avgValue,
        revenueShare: sharePct
      };
    }).sort((a, b) => b.revenue - a.revenue);
  };

  // Calculate Item Report Data (Grouped by Item Name)
  const getItemReportData = () => {
    const itemsGrouped = {};
    filteredOrders.forEach(ord => {
      (ord.items || []).forEach(it => {
        if (!itemsGrouped[it.name]) {
          itemsGrouped[it.name] = { itemName: it.name, quantitySold: 0, revenue: 0 };
        }
        itemsGrouped[it.name].quantitySold += it.qty || 0;
        itemsGrouped[it.name].revenue += (it.price || 0) * (it.qty || 0);
      });
    });

    return Object.values(itemsGrouped).sort((a, b) => b.quantitySold - a.quantitySold);
  };

  // Calculate Table Report Data (Grouped by Table Number)
  const getTableReportData = () => {
    const tablesGrouped = {};
    filteredOrders.forEach(ord => {
      const tableNum = ord.table ? `Table ${ord.table}` : 'Unknown Table';
      if (!tablesGrouped[tableNum]) {
        tablesGrouped[tableNum] = { tableNumber: tableNum, ordersCount: 0, revenueGenerated: 0 };
      }
      tablesGrouped[tableNum].ordersCount += 1;
      tablesGrouped[tableNum].revenueGenerated += ord.total || 0;
    });

    return Object.values(tablesGrouped).sort((a, b) => b.revenueGenerated - a.revenueGenerated);
  };

  const salesData = getSalesReportData();
  const branchData = getBranchReportData();
  const itemData = getItemReportData();
  const tableData = getTableReportData();

  // Aggregate stats
  const totalRevenue = filteredOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalOrders = filteredOrders.length;
  const totalItemsSold = filteredOrders.reduce((sum, o) => {
    return sum + (o.items || []).reduce((itemSum, it) => itemSum + (it.qty || 0), 0);
  }, 0);

  const handleResetFilters = () => {
    setDateStart('');
    setDateEnd('');
  };

  // Excel (CSV) Export
  const exportToExcel = () => {
    let headers = [];
    let rows = [];
    let filename = '';

    if (activeReportTab === 'sales') {
      headers = ['Date', 'Total Orders', `Revenue (${currency})`, `Average Order Value (${currency})`];
      rows = salesData.map(r => [r.date, r.totalOrders, r.revenue, r.averageOrderValue]);
      filename = 'sales_report.csv';
    } else if (activeReportTab === 'branch') {
      headers = ['Branch Name', 'Branch Code', 'City', 'Manager', 'Status', 'Total Orders', `Revenue (${currency})`, `Avg Order (${currency})`, 'Revenue Share %'];
      rows = branchData.map(r => [r.branchName, r.branchCode, r.city, r.manager, r.status, r.totalOrders, r.revenue, r.averageOrderValue, `${r.revenueShare}%`]);
      filename = 'branch_performance_report.csv';
    } else if (activeReportTab === 'item') {
      headers = ['Item Name', 'Quantity Sold', `Revenue (${currency})`];
      rows = itemData.map(r => [r.itemName, r.quantitySold, r.revenue]);
      filename = 'item_report.csv';
    } else {
      headers = ['Table Number', 'Orders Count', `Revenue Generated (${currency})`];
      rows = tableData.map(r => [r.tableNumber, r.ordersCount, r.revenueGenerated]);
      filename = 'table_report.csv';
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
    let reportTitle = '';
    let tableHeaders = [];
    let tableRows = [];

    if (activeReportTab === 'sales') {
      reportTitle = 'Sales Report';
      tableHeaders = ['Date', 'Total Orders', 'Revenue', 'Average Order Value'];
      tableRows = salesData.map(r => `
        <tr>
          <td>${r.date}</td>
          <td>${r.totalOrders}</td>
          <td>${currency}${r.revenue.toLocaleString()}</td>
          <td>${currency}${r.averageOrderValue.toLocaleString()}</td>
        </tr>
      `);
    } else if (activeReportTab === 'branch') {
      reportTitle = 'Branch Performance Report';
      tableHeaders = ['Branch Name', 'Code', 'Location', 'Orders', 'Revenue', 'Share %'];
      tableRows = branchData.map(r => `
        <tr>
          <td><strong>${r.branchName}</strong></td>
          <td>${r.branchCode}</td>
          <td>${r.city}</td>
          <td>${r.totalOrders}</td>
          <td>${currency}${r.revenue.toLocaleString()}</td>
          <td>${r.revenueShare}%</td>
        </tr>
      `);
    } else if (activeReportTab === 'item') {
      reportTitle = 'Item Performance Report';
      tableHeaders = ['Item Name', 'Quantity Sold', 'Revenue Generated'];
      tableRows = itemData.map(r => `
        <tr>
          <td><strong>${r.itemName}</strong></td>
          <td>${r.quantitySold}</td>
          <td>${currency}${r.revenue.toLocaleString()}</td>
        </tr>
      `);
    } else {
      reportTitle = 'Table Performance Report';
      tableHeaders = ['Table Number', 'Orders Count', 'Revenue Generated'];
      tableRows = tableData.map(r => `
        <tr>
          <td><strong>${r.tableNumber}</strong></td>
          <td>${r.ordersCount}</td>
          <td>${currency}${r.revenueGenerated.toLocaleString()}</td>
        </tr>
      `);
    }

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>${reportTitle} - ${activeRestaurant.name}</title>
          <style>
            body { font-family: 'Inter', system-ui, sans-serif; padding: 40px; color: #0f172a; }
            h1 { font-family: 'Outfit', sans-serif; font-size: 26px; margin-bottom: 4px; }
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
              <p>${activeRestaurant.name} - Multi-Branch Operations Analytics</p>
            </div>
            <div class="meta-block">
              <strong>Generated on:</strong> ${new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}<br>
              <strong>Date Filters:</strong> ${dateStart || 'All Time'} to ${dateEnd || 'Present'}
            </div>
          </div>

          <div class="summary-bar">
            <div class="summary-box">
              <div class="summary-label">Total Period Revenue</div>
              <div class="summary-val">${currency}${totalRevenue.toLocaleString()}</div>
            </div>
            <div class="summary-box">
              <div class="summary-label">Total Orders Placed</div>
              <div class="summary-val">${totalOrders}</div>
            </div>
            <div class="summary-box">
              <div class="summary-label">Items Sold</div>
              <div class="summary-val">${totalItemsSold}</div>
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
    <section className="panel-view active" style={{ width: '100%' }}>
      {/* Filter Options & Export Buttons */}
      <div className="premium-filter-card">
        <div className="premium-filter-title">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary)' }}>
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <span>Report Configurations & Date Filters</span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="premium-filter-btn-reset" onClick={exportToExcel} title="Download Excel CSV Sheet">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Export Excel
            </button>
            <button className="premium-filter-btn-reset" onClick={exportToPDF} title="Download PDF print copy">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              Export PDF
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
          <button className="premium-filter-btn-reset" onClick={handleResetFilters}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
            </svg>
            Reset Dates
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', margin: '24px 0' }}>
        <div className="stat-card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div className="stat-label">Filtered Period Revenue</div>
          <h3 style={{ margin: '8px 0', fontSize: '24px', fontWeight: 800 }}>{currency}{totalRevenue.toLocaleString('en-IN')}</h3>
          <div className="stat-sub-label" style={{ color: 'var(--success)', fontWeight: 600 }}>Total verified billing</div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #3b82f6' }}>
          <div className="stat-label">Total Orders Placed</div>
          <h3 style={{ margin: '8px 0', fontSize: '24px', fontWeight: 800 }}>{totalOrders}</h3>
          <div className="stat-sub-label" style={{ color: '#3b82f6', fontWeight: 600 }}>Processed and fulfilled</div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #10b981' }}>
          <div className="stat-label">Total Items Sold</div>
          <h3 style={{ margin: '8px 0', fontSize: '24px', fontWeight: 800 }}>{totalItemsSold}</h3>
          <div className="stat-sub-label" style={{ color: '#10b981', fontWeight: 600 }}>Across all categories</div>
        </div>
      </div>

      {/* REPORT TABS NAVIGATION */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #e2e8f0', marginBottom: '20px' }}>
        <button
          type="button"
          onClick={() => setActiveReportTab('sales')}
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: activeReportTab === 'sales' ? '3px solid var(--primary)' : '3px solid transparent',
            padding: '12px 18px',
            marginBottom: '-2px',
            fontSize: '14px',
            fontWeight: activeReportTab === 'sales' ? 800 : 600,
            color: activeReportTab === 'sales' ? 'var(--primary)' : '#64748b',
            cursor: 'pointer'
          }}
        >
          📅 Daily Sales Breakdown
        </button>

        <button
          type="button"
          onClick={() => setActiveReportTab('branch')}
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: activeReportTab === 'branch' ? '3px solid var(--primary)' : '3px solid transparent',
            padding: '12px 18px',
            marginBottom: '-2px',
            fontSize: '14px',
            fontWeight: activeReportTab === 'branch' ? 800 : 600,
            color: activeReportTab === 'branch' ? 'var(--primary)' : '#64748b',
            cursor: 'pointer'
          }}
        >
          🏬 Branch Performance
        </button>

        <button
          type="button"
          onClick={() => setActiveReportTab('item')}
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: activeReportTab === 'item' ? '3px solid var(--primary)' : '3px solid transparent',
            padding: '12px 18px',
            marginBottom: '-2px',
            fontSize: '14px',
            fontWeight: activeReportTab === 'item' ? 800 : 600,
            color: activeReportTab === 'item' ? 'var(--primary)' : '#64748b',
            cursor: 'pointer'
          }}
        >
          🍲 Item-wise Analytics
        </button>

        <button
          type="button"
          onClick={() => setActiveReportTab('table')}
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: activeReportTab === 'table' ? '3px solid var(--primary)' : '3px solid transparent',
            padding: '12px 18px',
            marginBottom: '-2px',
            fontSize: '14px',
            fontWeight: activeReportTab === 'table' ? 800 : 600,
            color: activeReportTab === 'table' ? 'var(--primary)' : '#64748b',
            cursor: 'pointer'
          }}
        >
          🪑 Table Utilization
        </button>
      </div>

      {/* REPORT CONTENT TABLES */}
      <div className="settings-card" style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
        {/* 1. DAILY SALES REPORT */}
        {activeReportTab === 'sales' && (
          <div style={{ overflowX: 'auto' }}>
            <table className="menu-items-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ padding: '12px' }}>DATE</th>
                  <th style={{ padding: '12px' }}>TOTAL ORDERS</th>
                  <th style={{ padding: '12px' }}>REVENUE</th>
                  <th style={{ padding: '12px' }}>AVERAGE ORDER VALUE</th>
                </tr>
              </thead>
              <tbody>
                {salesData.map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', fontWeight: 600 }}>{row.date}</td>
                    <td style={{ padding: '12px' }}>{row.totalOrders} orders</td>
                    <td style={{ padding: '12px', fontWeight: 700, color: 'var(--primary)' }}>{currency}{row.revenue.toLocaleString()}</td>
                    <td style={{ padding: '12px' }}>{currency}{row.averageOrderValue.toLocaleString()}</td>
                  </tr>
                ))}
                {salesData.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>No sales data available for this range.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 2. BRANCH PERFORMANCE REPORT */}
        {activeReportTab === 'branch' && (
          <div style={{ overflowX: 'auto' }}>
            <table className="menu-items-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ padding: '12px' }}>BRANCH NAME</th>
                  <th style={{ padding: '12px' }}>CODE</th>
                  <th style={{ padding: '12px' }}>LOCATION</th>
                  <th style={{ padding: '12px' }}>MANAGER</th>
                  <th style={{ padding: '12px' }}>STATUS</th>
                  <th style={{ padding: '12px' }}>ORDERS</th>
                  <th style={{ padding: '12px' }}>TOTAL REVENUE</th>
                  <th style={{ padding: '12px' }}>AVG ORDER</th>
                  <th style={{ padding: '12px' }}>REVENUE SHARE</th>
                </tr>
              </thead>
              <tbody>
                {branchData.map(b => (
                  <tr key={b.branchId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', fontWeight: 700, color: '#0f172a' }}>{b.branchName}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ fontSize: '11px', background: '#f1f5f9', color: '#334155', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                        {b.branchCode}
                      </span>
                    </td>
                    <td style={{ padding: '12px', color: '#64748b' }}>{b.city}</td>
                    <td style={{ padding: '12px', color: '#334155' }}>{b.manager}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontWeight: 700,
                        backgroundColor: b.status === 'Active' ? '#ecfdf5' : '#fef2f2',
                        color: b.status === 'Active' ? '#059669' : '#dc2626'
                      }}>
                        {b.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontWeight: 600 }}>{b.totalOrders}</td>
                    <td style={{ padding: '12px', fontWeight: 800, color: 'var(--primary)' }}>{currency}{b.revenue.toLocaleString()}</td>
                    <td style={{ padding: '12px' }}>{currency}{b.averageOrderValue.toLocaleString()}</td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: 1, background: '#e2e8f0', height: '6px', borderRadius: '3px', overflow: 'hidden', minWidth: '60px' }}>
                          <div style={{ width: `${b.revenueShare}%`, background: 'var(--primary)', height: '100%' }}></div>
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: 700, minWidth: '35px' }}>{b.revenueShare}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. ITEM PERFORMANCE REPORT */}
        {activeReportTab === 'item' && (
          <div style={{ overflowX: 'auto' }}>
            <table className="menu-items-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ padding: '12px' }}>ITEM NAME</th>
                  <th style={{ padding: '12px' }}>QUANTITY SOLD</th>
                  <th style={{ padding: '12px' }}>REVENUE GENERATED</th>
                </tr>
              </thead>
              <tbody>
                {itemData.map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', fontWeight: 600 }}>{row.itemName}</td>
                    <td style={{ padding: '12px' }}>{row.quantitySold} units</td>
                    <td style={{ padding: '12px', fontWeight: 700, color: 'var(--primary)' }}>{currency}{row.revenue.toLocaleString()}</td>
                  </tr>
                ))}
                {itemData.length === 0 && (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>No item sales recorded for this period.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. TABLE PERFORMANCE REPORT */}
        {activeReportTab === 'table' && (
          <div style={{ overflowX: 'auto' }}>
            <table className="menu-items-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ padding: '12px' }}>TABLE</th>
                  <th style={{ padding: '12px' }}>ORDERS COUNT</th>
                  <th style={{ padding: '12px' }}>TOTAL REVENUE</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', fontWeight: 600 }}>{row.tableNumber}</td>
                    <td style={{ padding: '12px' }}>{row.ordersCount} orders</td>
                    <td style={{ padding: '12px', fontWeight: 700, color: 'var(--primary)' }}>{currency}{row.revenueGenerated.toLocaleString()}</td>
                  </tr>
                ))}
                {tableData.length === 0 && (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>No table data recorded for this period.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
