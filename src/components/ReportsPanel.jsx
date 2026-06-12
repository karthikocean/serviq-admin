import React, { useState } from 'react';

export default function ReportsPanel({
  orders = [],
  menu = [],
  activeRestaurant = {}
}) {
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [activeReportTab, setActiveReportTab] = useState('sales'); // 'sales', 'item', 'table'

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

  // Calculate Item Report Data (Grouped by Item Name)
  const getItemReportData = () => {
    const itemsGrouped = {};
    filteredOrders.forEach(ord => {
      ord.items.forEach(it => {
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
  const itemData = getItemReportData();
  const tableData = getTableReportData();

  // Aggregate stats
  const totalRevenue = filteredOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalOrders = filteredOrders.length;
  const totalItemsSold = filteredOrders.reduce((sum, o) => {
    return sum + o.items.reduce((itemSum, it) => itemSum + (it.qty || 0), 0);
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

  // PDF Export (Browser Print Preview Layout)
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
              <p>${activeRestaurant.name} - Store Insights</p>
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
    <section className="panel-view active">
      {/* Upper Overview Metrics summaries */}
      
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
            Reset Date Filters
          </button>
        </div>
      </div>

      {/* Reports Navigation Sub-Tabs & Tabular Grids */}
      <div style={{ 
        backgroundColor: 'var(--bg-secondary)', 
        border: '1px solid var(--border)', 
        borderRadius: 'var(--border-radius-sm)', 
        padding: '24px', 
        boxShadow: 'var(--card-shadow)' 
      }}>
        {/* Navigation row */}
        <div style={{ display: 'flex', gap: '6px', borderBottom: '1.5px solid var(--border)', paddingBottom: '16px', marginBottom: '20px' }}>
          <button 
            className={`btn ${activeReportTab === 'sales' ? 'btn-black' : 'btn-outline'}`}
            style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '8px', fontWeight: 600 }}
            onClick={() => setActiveReportTab('sales')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg> Sales Report
          </button>
          <button 
            className={`btn ${activeReportTab === 'item' ? 'btn-black' : 'btn-outline'}`}
            style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '8px', fontWeight: 600 }}
            onClick={() => setActiveReportTab('item')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg> Item Report
          </button>
          <button 
            className={`btn ${activeReportTab === 'table' ? 'btn-black' : 'btn-outline'}`}
            style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '8px', fontWeight: 600 }}
            onClick={() => setActiveReportTab('table')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg> Table Report
          </button>
        </div>

        {/* Tabular content wrapper */}
        <div className="menu-table-wrapper" style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid var(--border)' }}>
          {activeReportTab === 'sales' && (
            <table className="menu-items-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '14px', width: '50px' }}>S.NO</th>
                  <th style={{ textAlign: 'left', padding: '14px' }}>DATE</th>
                  <th style={{ textAlign: 'right', padding: '14px' }}>TOTAL ORDERS</th>
                  <th style={{ textAlign: 'right', padding: '14px' }}>REVENUE</th>
                  <th style={{ textAlign: 'right', padding: '14px' }}>AVERAGE ORDER VALUE</th>
                </tr>
              </thead>
              <tbody>
                {salesData.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>No transactions recorded for the selected range.</td>
                  </tr>
                ) : (
                  salesData.map((row, index) => (
                    <tr key={row.date} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '14px', fontWeight: 600, color: 'var(--text-muted)' }}>{index + 1}</td>
                      <td style={{ padding: '14px', fontWeight: 600, textAlign: 'left', color: 'var(--text-main)' }}>{row.date}</td>
                      <td style={{ padding: '14px', textAlign: 'right' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', background: 'var(--bg-tertiary)', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)' }}>
                          {row.totalOrders} {row.totalOrders === 1 ? 'order' : 'orders'}
                        </span>
                      </td>
                      <td style={{ padding: '14px', textAlign: 'right' }}>
                        <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '14px' }}>{currency}{row.revenue.toLocaleString()}</span>
                      </td>
                      <td style={{ padding: '14px', textAlign: 'right' }}>
                        <span style={{ color: 'var(--text-main)', fontWeight: 700, fontSize: '14px' }}>{currency}{row.averageOrderValue.toLocaleString()}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeReportTab === 'item' && (
            <table className="menu-items-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '14px', width: '50px' }}>S.NO</th>
                  <th style={{ textAlign: 'left', padding: '14px' }}>ITEM NAME</th>
                  <th style={{ textAlign: 'right', padding: '14px' }}>QUANTITY SOLD</th>
                  <th style={{ textAlign: 'right', padding: '14px' }}>REVENUE GENERATED</th>
                </tr>
              </thead>
              <tbody>
                {itemData.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>No items recorded sold in selected range.</td>
                  </tr>
                ) : (
                  itemData.map((row, index) => (
                    <tr key={row.itemName} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '14px', fontWeight: 600, color: 'var(--text-muted)' }}>{index + 1}</td>
                      <td style={{ padding: '14px', fontWeight: 600, textAlign: 'left', color: 'var(--text-main)' }}>{row.itemName}</td>
                      <td style={{ padding: '14px', textAlign: 'right' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', background: 'var(--bg-tertiary)', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)' }}>
                          {row.quantitySold} {row.quantitySold === 1 ? 'serving' : 'servings'}
                        </span>
                      </td>
                      <td style={{ padding: '14px', textAlign: 'right' }}>
                        <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '14px' }}>{currency}{row.revenue.toLocaleString()}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeReportTab === 'table' && (
            <table className="menu-items-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '14px', width: '50px' }}>S.NO</th>
                  <th style={{ textAlign: 'left', padding: '14px' }}>TABLE NUMBER</th>
                  <th style={{ textAlign: 'right', padding: '14px' }}>ORDERS COUNT</th>
                  <th style={{ textAlign: 'right', padding: '14px' }}>REVENUE GENERATED</th>
                </tr>
              </thead>
              <tbody>
                {tableData.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>No tables recorded transactions in selected range.</td>
                  </tr>
                ) : (
                  tableData.map((row, index) => (
                    <tr key={row.tableNumber} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '14px', fontWeight: 600, color: 'var(--text-muted)' }}>{index + 1}</td>
                      <td style={{ padding: '14px', textAlign: 'left' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', background: 'var(--primary-light)', color: 'var(--primary)', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>
                          {row.tableNumber}
                        </span>
                      </td>
                      <td style={{ padding: '14px', textAlign: 'right' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', background: 'var(--bg-tertiary)', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)' }}>
                          {row.ordersCount} {row.ordersCount === 1 ? 'session' : 'sessions'}
                        </span>
                      </td>
                      <td style={{ padding: '14px', textAlign: 'right' }}>
                        <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '14px' }}>{currency}{row.revenueGenerated.toLocaleString()}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </section>
  );
}


// okay, now need to make these changes

// 1) as i already said manage categories is not working.
// 2) in table management give edit button, to update status and maybe other things too.
// 3) for the table with no id or something, you need to put s.no
// 4) and the table header fields should be in white color clearly visible, but for now some table headers are in grey color. so change that.
// 5)in the billing add some dummy data for tables, because bills should be billed against table. so show how that ui will be in the billing moduls.
// 6) in the menubar the scroll is okay, but the side scroll visual design is not needed. remove that.
// 7) 



