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

import ReportsApi from '../api/Reports';

export default function ReportsPanel({
  staff = [],
  menu = [],
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

  const [loading, setLoading] = useState(false);
  const [waiterData, setWaiterData] = useState([]);
  const [kitchenData, setKitchenData] = useState([]);
  const [summary, setSummary] = useState(null);

  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1, totalItems: 0 });

  const currency = activeRestaurant?.settings?.currency || '₹';

  useEffect(() => {
    if (initialTab === 'kitchen' || initialTab === 'waiter') {
      setActiveReportTab(initialTab);
    }
  }, [initialTab]);

  const fetchReports = async (page = 1) => {
    setLoading(true);
    try {
      const filters = {
        startDate: dateStart,
        endDate: dateEnd,
        branchId: selectedBranchId || 'All',
        search: searchQuery,
        page,
        limit: pagination.limit
      };

      if (activeReportTab === 'waiter') {
        filters.waiterId = filterWaiter;
        const res = await ReportsApi.getWaiterReports(filters);
        if (res.status) {
          setWaiterData(res.response.data || []);
          setSummary(res.response.summary || null);
          setPagination(prev => ({
            ...prev,
            page: res.response.page,
            totalPages: res.response.totalPages,
            totalItems: res.response.totalItems
          }));
        }
      } else {
        filters.categoryId = filterKitchenCategory;
        const res = await ReportsApi.getKitchenReports(filters);
        if (res.status) {
          setKitchenData(res.response.data || []);
          setSummary(res.response.summary || null);
          setPagination(prev => ({
            ...prev,
            page: res.response.page,
            totalPages: res.response.totalPages,
            totalItems: res.response.totalItems
          }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(1);
  }, [activeReportTab, dateStart, dateEnd, filterWaiter, filterKitchenCategory, searchQuery, selectedBranchId, pagination.limit]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchReports(newPage);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    const total = pagination.totalPages || 1;
    let startPage = Math.max(1, pagination.page - Math.floor(maxVisible / 2));
    let endPage = Math.min(total, startPage + maxVisible - 1);
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const handleResetFilters = () => {
    setDateStart('');
    setDateEnd('');
    setFilterWaiter('All');
    setFilterKitchenCategory('All');
    setSearchQuery('');
    setPagination(prev => ({ ...prev, page: 1 }));
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
              <div class="summary-val">${currency}${(activeReportTab === 'waiter' ? (summary?.totalWaiterRevenue || 0) : (summary?.foodRevenueGenerated || 0)).toLocaleString()}</div>
            </div>
            <div class="summary-box">
              <div class="summary-label">${activeReportTab === 'waiter' ? 'Orders Fulfilled' : 'Dishes Prepared'}</div>
              <div class="summary-val">${activeReportTab === 'waiter' ? (summary?.totalOrdersServed || 0) : (summary?.totalDishesPrepared || 0)}</div>
            </div>
            <div class="summary-box">
              <div class="summary-label">${activeReportTab === 'waiter' ? 'Waiters On Duty' : 'Active Food Categories'}</div>
              <div class="summary-val">${activeReportTab === 'waiter' ? `${summary?.activeWaitersOnDuty || 0} / ${summary?.totalWaiters || 0}` : (summary?.activeCategories || 0)}</div>
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
          🤵 Waiter Reports ({summary?.totalWaiters || 0})
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
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#16a34a', marginTop: '6px', fontFamily: "'Outfit', sans-serif" }}>{currency}{(summary?.totalWaiterRevenue || 0).toLocaleString('en-IN')}</div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', fontWeight: 600 }}>Fulfilled by serving team</div>
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', borderLeft: '4px solid #3b82f6', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Orders Served</div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#3b82f6', marginTop: '6px', fontFamily: "'Outfit', sans-serif" }}>{summary?.totalOrdersServed || 0}</div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', fontWeight: 600 }}>Completed order tickets</div>
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', borderLeft: '4px solid var(--primary)', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Waiters On Duty</div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', marginTop: '6px', fontFamily: "'Outfit', sans-serif" }}>{summary?.activeWaitersOnDuty || 0} <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 600 }}>/ {summary?.totalWaiters || 0}</span></div>
            <div style={{ fontSize: '11px', color: '#16a34a', marginTop: '2px', fontWeight: 600 }}>Available for table service</div>
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', borderLeft: '4px solid #f59e0b', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Average Order Value</div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#b45309', marginTop: '6px', fontFamily: "'Outfit', sans-serif" }}>
              {currency}{summary?.averageOrderValue || '0.00'}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', fontWeight: 600 }}>Per customer order</div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', borderLeft: '4px solid #ea580c', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Dishes Prepared</div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#ea580c', marginTop: '6px', fontFamily: "'Outfit', sans-serif" }}>{summary?.totalDishesPrepared || 0}</div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', fontWeight: 600 }}>Cooked and dispatched</div>
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', borderLeft: '4px solid var(--primary)', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Food Revenue Generated</div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', marginTop: '6px', fontFamily: "'Outfit', sans-serif" }}>{currency}{(summary?.foodRevenueGenerated || 0).toLocaleString('en-IN')}</div>
            <div style={{ fontSize: '11px', color: '#16a34a', marginTop: '2px', fontWeight: 600 }}>Total value of dishes cooked</div>
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', borderLeft: '4px solid #3b82f6', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Food Categories</div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#3b82f6', marginTop: '6px', fontFamily: "'Outfit', sans-serif" }}>{summary?.activeCategories || 0}</div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', fontWeight: 600 }}>Starters, Meals, Drinks, etc.</div>
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', borderLeft: '4px solid #10b981', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Avg Kitchen Preparation Time</div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#10b981', marginTop: '6px', fontFamily: "'Outfit', sans-serif" }}>{summary?.avgPrepTime || 'N/A'}</div>
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
                <option value="All">All Waiters</option>
                {staff.filter(s => s.role === 'Waiter').map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
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
              onKeyDown={e => {
                if (e.key === ' ' && !e.currentTarget.value) {
                  e.preventDefault();
                }
              }}
              onChange={e => {
                const val = e.target.value.replace(/^\s+/, '');
                setSearchQuery(val);
              }}
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
              <tr style={{ backgroundColor: '#000000', borderBottom: '3px solid #ff5a1f' }}>
                <th style={{ width: '5%', padding: '14px 12px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>S.NO</th>
                <th style={{ width: '22%', padding: '14px 14px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>WAITER NAME</th>
                <th style={{ width: '11%', padding: '14px 10px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>DUTY STATUS</th>
                <th style={{ width: '16%', padding: '14px 12px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ASSIGNED TABLES</th>
                <th style={{ width: '12%', padding: '14px 12px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>ORDERS SERVED</th>
                <th style={{ width: '14%', padding: '14px 12px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>TOTAL REVENUE</th>
                <th style={{ width: '12%', padding: '14px 12px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>AVG ORDER VALUE</th>
                <th style={{ width: '8%', padding: '14px 12px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {waiterData.map((w, index) => (
                <tr key={w.id} style={{ borderBottom: '1px solid #f1f5f9', height: '58px', transition: 'background-color 0.15s' }}>
                  <td style={{ padding: '12px 12px', fontWeight: 800, fontSize: '12px', color: '#0f172a', fontFamily: 'monospace' }}>
                    {(pagination.page - 1) * pagination.limit + index + 1}
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
                      backgroundColor: w.dutyStatus === 'ON_DUTY' ? '#dcfce7' : '#f1f5f9',
                      color: w.dutyStatus === 'ON_DUTY' ? '#166534' : '#64748b'
                    }}>
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: w.dutyStatus === 'ON_DUTY' ? '#16a34a' : '#94a3b8' }}></span>
                      {w.dutyStatus === 'ON_DUTY' ? 'On Duty' : 'Off Duty'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 12px' }}>
                    {/* Waiter assigned tables can be kept as a separate API call or dropped here. We'll show a placeholder. */}
                    <span style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic' }}>Fetched from DB</span>
                  </td>
                  <td style={{ padding: '12px 12px', textAlign: 'center', fontWeight: 700, color: '#0f172a' }}>
                    {w.ordersServed} <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>orders</span>
                  </td>
                  <td style={{ padding: '12px 12px', textAlign: 'right', fontWeight: 800, color: '#16a34a', fontSize: '14px', fontFamily: "'Outfit', sans-serif" }}>
                    {currency}{w.totalRevenue.toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '12px 12px', textAlign: 'right', fontWeight: 700, color: '#475569', fontSize: '13px' }}>
                    {currency}{w.averageOrderValue}
                  </td>
                  <td style={{ padding: '12px 12px', textAlign: 'right' }}>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>-</span>
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
              <tr style={{ backgroundColor: '#000000', borderBottom: '3px solid #ff5a1f' }}>
                <th style={{ width: '5%', padding: '14px 12px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>S.NO</th>
                <th style={{ width: '25%', padding: '14px 14px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>FOOD ITEM</th>
                <th style={{ width: '15%', padding: '14px 12px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>CATEGORY</th>
                <th style={{ width: '15%', padding: '14px 12px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>QUANTITY PREPARED</th>
                <th style={{ width: '15%', padding: '14px 12px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>AVG PREP TIME</th>
                <th style={{ width: '13%', padding: '14px 12px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>REVENUE GENERATED</th>
                <th style={{ width: '12%', padding: '14px 12px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>KITCHEN STATUS</th>
              </tr>
            </thead>
            <tbody>
              {kitchenData.map((k, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #f1f5f9', height: '58px', transition: 'background-color 0.15s' }}>
                  <td style={{ padding: '12px 12px', fontWeight: 800, fontSize: '12px', color: '#0f172a', fontFamily: 'monospace' }}>
                    {(pagination.page - 1) * pagination.limit + index + 1}
                  </td>
                  <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0f172a', fontSize: '13px' }}>
                    {k.foodItem}
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
                      backgroundColor: k.kitchenStatus === 'Completed' ? '#dcfce7' : '#ffedd5',
                      color: k.kitchenStatus === 'Completed' ? '#166534' : '#c2410c'
                    }}>
                      {k.kitchenStatus}
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

      {/* Pagination Footer */}
      {(pagination.totalPages > 1 || pagination.totalItems > 0) && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '20px',
          padding: '12px 20px',
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
            Showing {pagination.totalItems === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.totalItems)} of {pagination.totalItems} records
          </div>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: pagination.page <= 1 ? '#f8fafc' : '#ffffff',
                color: pagination.page <= 1 ? '#cbd5e1' : '#334155',
                fontSize: '13px',
                fontWeight: 600,
                cursor: pagination.page <= 1 ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Prev
            </button>

            {getPageNumbers().map(pageNum => (
              <button
                key={pageNum}
                type="button"
                onClick={() => handlePageChange(pageNum)}
                style={{
                  minWidth: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: pagination.page === pageNum ? 700 : 500,
                  border: pagination.page === pageNum ? 'none' : '1px solid #e2e8f0',
                  background: pagination.page === pageNum ? '#000000' : '#ffffff',
                  color: pagination.page === pageNum ? '#ffffff' : '#334155',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {pageNum}
              </button>
            ))}

            <button
              type="button"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages || pagination.totalPages === 0}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: (pagination.page >= pagination.totalPages || pagination.totalPages === 0) ? '#f8fafc' : '#ffffff',
                color: (pagination.page >= pagination.totalPages || pagination.totalPages === 0) ? '#cbd5e1' : '#334155',
                fontSize: '13px',
                fontWeight: 600,
                cursor: (pagination.page >= pagination.totalPages || pagination.totalPages === 0) ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}

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
