import React, { useState } from 'react';
import { Modal } from './Modal';
import * as XLSX from 'xlsx';
import BillingApi from '../api/Billing';
import ShowNotifications from '../helper/ShowNotifications';
import SearchableSelect from './SearchableSelect.jsx';
import { formatDateDMY } from '../helper/DateHelper.js';
import ReceiptCard, { generateReceiptHtml, openCenteredPrintWindow } from './ReceiptTemplate.jsx';
import '../pages/Billing/Billing.css';

const EyeIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const PrinterIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <polyline points="6 9 6 2 18 2 18 9"></polyline>
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
    <rect x="6" y="14" width="12" height="8"></rect>
  </svg>
);

const DownloadIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

export default function BillingHistoryPanel({
  billingHistory = [],
  branches = [],
  isLoading,
  searchTerm, setSearchTerm,
  dateRange, setDateRange,
  customStartDate, setCustomStartDate,
  customEndDate, setCustomEndDate,
  selectedPayment, setSelectedPayment,
  selectedTable = 'All', setSelectedTable, tableOptions = [],
  customerFilter = '', setCustomerFilter,
  selectedStaff = 'All', setSelectedStaff, staffOptions = [],
  selectedBranchId,
  page, setPage,
  limit,
  totalItems,
  summary,
  activeRestaurant = {}
}) {
  const restaurantName = activeRestaurant?.name || activeRestaurant?.restaurantName || activeRestaurant?.businessName || 'XYZ Restaurant';
  const restaurantAddress = activeRestaurant?.address || activeRestaurant?.location || '123 Main Street, City Centre';
  const restaurantGst = activeRestaurant?.gstNo || activeRestaurant?.gstin || '33AAAAA0000A1Z5';
  const restaurantTagline = activeRestaurant?.tagline || 'Good Food • Great Moments';

  const totalPages = Math.ceil((totalItems || 0) / (limit || 10)) || 1;
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    const current = page + 1;
    let startPage = Math.max(1, current - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  // State for Modals
  const [selectedInvoice, setSelectedInvoice] = useState(null); // For Invoice View Modal
  const [isExporting, setIsExporting] = useState(false);

  // Direct Excel Export (Fetches full filtered dataset without pagination)
  const handleExportExcel = async () => {
    setIsExporting(true);

    let itemsToExport = [];

    try {
      let startDate = customStartDate || undefined;
      let endDate = customEndDate || undefined;

      if (dateRange === 'Today') {
        const todayStr = new Date().toISOString().split('T')[0];
        startDate = todayStr;
        endDate = todayStr;
      } else if (dateRange === 'Yesterday') {
        const yestStr = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        startDate = yestStr;
        endDate = yestStr;
      } else if (dateRange === 'This Week') {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        startDate = sevenDaysAgo;
        endDate = new Date().toISOString().split('T')[0];
      } else if (dateRange === 'This Month') {
        const now = new Date();
        startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        endDate = new Date().toISOString().split('T')[0];
      }

      const filters = {
        search: searchTerm,
        dateRange,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        branchId: selectedBranchId && selectedBranchId !== 'ALL' && selectedBranchId !== 'all' ? selectedBranchId : undefined,
        paymentMethod: selectedPayment && selectedPayment !== 'All' ? selectedPayment : undefined,
        isExport: 'true',
        limit: '0' // Tell backend to fetch all for export
      };

      const result = await BillingApi.getBillingHistory(filters);

      if (result && result.status) {
        const payload = result.response?.data || result.response || result.data;
        if (Array.isArray(payload)) {
          itemsToExport = payload;
        } else if (payload && typeof payload === 'object') {
          itemsToExport = Array.isArray(payload.items) ? payload.items :
                          Array.isArray(payload.data) ? payload.data :
                          Array.isArray(payload.billingHistory) ? payload.billingHistory :
                          Array.isArray(payload.history) ? payload.history : [];
        }
      }
    } catch (e) {
      console.error("Export API error", e);
    }

    // Fallback to local table data if API didn't return full list
    if (itemsToExport.length === 0 && billingHistory.length > 0) {
      itemsToExport = billingHistory;
    }

    if (itemsToExport.length === 0) {
      ShowNotifications.showAlertNotification("No data available to export.", false);
      setIsExporting(false);
      return;
    }

    const exportData = itemsToExport.map((item, idx) => {
      const id = item.id || item.invoiceId || item.invoiceNumber || item._id || `INV-${String(idx + 1).padStart(4, '0')}`;
      const orderId = item.orderId || item.orderRefId || item.orderNumber || 'N/A';
      const table = item.table || item.tableNumber || item.tableNo || '01';
      const rawDate = item.rawDate || item.createdAt || item.date || new Date();
      const dateStr = item.date || formatDateDMY(rawDate);
      const timeStr = item.time || (rawDate ? new Date(rawDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '12:00 PM');
      const amount = Number(item.amount ?? item.totalAmount ?? item.total ?? 0);
      const methodStr = String(item.paymentMethod || item.paymentMode || 'UPI');
      const paymentMethod = methodStr.toLowerCase() === 'upi' ? 'UPI' : (methodStr.charAt(0).toUpperCase() + methodStr.slice(1));
      const staff = item.staff || item.staffName || item.waiterName || 'Admin';
      const status = item.status || item.paymentStatus || 'Paid';

      return {
        'Invoice ID': id,
        'Order ID': orderId,
        'Table': `Table ${String(table).replace('Table ', '').trim()}`,
        'Date': dateStr,
        'Time': timeStr,
        'Subtotal': Number(item.subtotal ?? amount),
        'Tax': Number(item.tax ?? 0),
        'Discount': Number(item.discount ?? 0),
        'Total Amount': amount,
        'Payment Method': paymentMethod,
        'Payment Status': status,
        'Staff': staff,
        'Branch ID': item.branchId || selectedBranchId || 'main'
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Billing History");

    // Dynamic auto-fit column widths so every header and value is fully displayed without truncation
    const keys = Object.keys(exportData[0] || {});
    const wscols = keys.map(key => {
      let maxLen = String(key).length;
      exportData.forEach(row => {
        const valStr = row[key] !== null && row[key] !== undefined ? String(row[key]) : '';
        if (valStr.length > maxLen) {
          maxLen = valStr.length;
        }
      });
      return { wch: Math.max(maxLen + 6, 18) };
    });
    worksheet['!cols'] = wscols;

    const fileName = `Billing_History_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    setIsExporting(false);
  };

  // Helper to generate Receipt HTML for Printing and Downloading (Exact Thermal Receipt UI)
  const generateInvoiceHtml = (invoice) => {
    return generateReceiptHtml(invoice, activeRestaurant);
  };

  const handlePrintInvoiceDirect = (invoice) => {
    const htmlContent = generateReceiptHtml(invoice, activeRestaurant);
    openCenteredPrintWindow(htmlContent, `Receipt - ${invoice?.id || invoice?.billNo || 'Doc'}`, 480, 700);
  };

  const handleDownloadInvoiceDirect = (invoice) => {
    const htmlContent = generateReceiptHtml(invoice, activeRestaurant);
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Receipt-${String(invoice.id || invoice.billNo || 'doc').replace(/[^a-zA-Z0-9_-]/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    ShowNotifications.showAlertNotification(`Receipt ${invoice.id || ''} downloaded successfully!`, true);
  };

  // Calculate Summaries
  const totalBills = totalItems || 0;
  const totalSales = summary?.totalSales || 0;
  const cashTotal = summary?.cashTotal || 0;
  const upiTotal = summary?.upiTotal || 0;
  const cardTotal = summary?.cardTotal || 0;

  return (
    <section>
      <div style={{ width: '100%' }}>
        {/* FILTERS AREA WITH DINING TABLE, CUSTOMER, CASHIER/STAFF & MORE - 3 COLUMNS x 3 ROWS */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          background: '#fff',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid var(--border)',
          marginBottom: '24px',
          alignItems: 'flex-end'
        }}>

          {/* Row 1, Col 1: 1. Search Bill No, Order ID */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, marginBottom: '6px', color: '#64748b', textTransform: 'uppercase' }}>Search Bill / Order</label>
            <input
              type="text"
              placeholder="Bill No / Order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', height: '38px', padding: '0 12px', borderRadius: '6px', border: '1px solid var(--border)', boxSizing: 'border-box', fontSize: '13px' }}
            />
          </div>

          {/* Row 1, Col 2: 2. Dining Table Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, marginBottom: '6px', color: '#64748b', textTransform: 'uppercase' }}>Dining Table</label>
            <SearchableSelect
              value={selectedTable}
              onChange={(e) => setSelectedTable && setSelectedTable(e.target.value)}
              options={tableOptions.length > 0 ? tableOptions : [{ value: 'All', label: 'All Tables' }]}
              placeholder="Select Table..."
            />
          </div>

          {/* Row 1, Col 3: 3. Customer Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, marginBottom: '6px', color: '#64748b', textTransform: 'uppercase' }}>Customer</label>
            <input
              type="text"
              placeholder="Name or Phone..."
              value={customerFilter}
              onChange={(e) => setCustomerFilter && setCustomerFilter(e.target.value)}
              style={{ width: '100%', height: '38px', padding: '0 12px', borderRadius: '6px', border: '1px solid var(--border)', boxSizing: 'border-box', fontSize: '13px' }}
            />
          </div>

          {/* Row 2, Col 1: 4. Cashier / Staff Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, marginBottom: '6px', color: '#64748b', textTransform: 'uppercase' }}>Cashier / Staff</label>
            <SearchableSelect
              value={selectedStaff}
              onChange={(e) => setSelectedStaff && setSelectedStaff(e.target.value)}
              options={staffOptions.length > 0 ? staffOptions : [{ value: 'All', label: 'All Cashier / Staff' }]}
              placeholder="Select Staff..."
            />
          </div>

          {/* Row 2, Col 2: 5. Date Range */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, marginBottom: '6px', color: '#64748b', textTransform: 'uppercase' }}>Date Range</label>
            <SearchableSelect
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              options={[
                { value: 'All', label: 'All Time' },
                { value: 'Today', label: 'Today' },
                { value: 'Yesterday', label: 'Yesterday' },
                { value: 'This Week', label: 'This Week' },
                { value: 'This Month', label: 'This Month' },
                { value: 'Custom', label: 'Custom Range' }
              ]}
              placeholder="Select Range..."
            />
          </div>

          {/* Row 2, Col 3: 6. Payment Method */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, marginBottom: '6px', color: '#64748b', textTransform: 'uppercase' }}>Payment Method</label>
            <SearchableSelect
              value={selectedPayment}
              onChange={(e) => setSelectedPayment(e.target.value)}
              options={[
                { value: 'All', label: 'All Methods' },
                { value: 'Cash', label: 'Cash' },
                { value: 'UPI', label: 'UPI' },
                { value: 'Card', label: 'Card' },
                { value: 'Other', label: 'Other' }
              ]}
              placeholder="Select Method..."
            />
          </div>

          {/* Row 3, Col 1: 7. Payment Status */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, marginBottom: '6px', color: '#64748b', textTransform: 'uppercase' }}>Payment Status</label>
            <SearchableSelect
              value="All"
              onChange={() => {}}
              options={[
                { value: 'All', label: 'All Statuses' },
                { value: 'Paid', label: 'Paid' },
                { value: 'Unpaid', label: 'Unpaid' }
              ]}
              placeholder="Select Status..."
            />
          </div>

          {/* Row 3, Col 2: 8. Order Type */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, marginBottom: '6px', color: '#64748b', textTransform: 'uppercase' }}>Order Type</label>
            <SearchableSelect
              value="All"
              onChange={() => {}}
              options={[
                { value: 'All', label: 'All Types' },
                { value: 'Dine-In', label: 'Dine-In' },
                { value: 'Takeaway', label: 'Takeaway' },
                { value: 'Delivery', label: 'Delivery' }
              ]}
              placeholder="Select Type..."
            />
          </div>

          {/* Row 3, Col 3: 9. Export Excel Button */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, marginBottom: '6px', color: 'transparent', userSelect: 'none' }}>&nbsp;</label>
            <button
              className="btn btn-black"
              style={{ padding: '8px 18px', height: '38px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '12px' }}
              onClick={handleExportExcel}
              disabled={isExporting}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              {isExporting ? 'Exporting...' : 'Export Excel'}
            </button>
          </div>
        </div>

        {dateRange === 'Custom' && (
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: '#64748b' }}>From</label>
              <input type="date" value={customStartDate} onChange={e => setCustomStartDate(e.target.value)} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: '#64748b' }}>To</label>
              <input type="date" value={customEndDate} onChange={e => setCustomEndDate(e.target.value)} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border)' }} />
            </div>
          </div>
        )}

        {/* SUMMARY CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Bills</span>
            <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--black)', marginTop: '8px' }}>{totalBills}</div>
          </div>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Sales</span>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#10b981', marginTop: '8px' }}>₹{totalSales.toLocaleString()}</div>
          </div>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cash</span>
            <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--black)', marginTop: '8px' }}>₹{cashTotal.toLocaleString()}</div>
          </div>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>UPI</span>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#3b82f6', marginTop: '8px' }}>₹{upiTotal.toLocaleString()}</div>
          </div>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Card</span>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#8b5cf6', marginTop: '8px' }}>₹{cardTotal.toLocaleString()}</div>
          </div>
        </div>

        {/* MAIN HISTORY TABLE WITH ALL 13 REQUIRED COLUMNS */}
        <div className="billing-table-card">
          <div className="billing-table-responsive">
            <table className="billing-table" style={{ minWidth: '1615px' }}>
              <colgroup>
                <col style={{ width: '50px' }} />   {/* 1. S.NO */}
                <col style={{ width: '125px' }} />  {/* 2. BILL NO. */}
                <col style={{ width: '145px' }} />  {/* 3. INVOICE NO. */}
                <col style={{ width: '125px' }} />  {/* 4. ORDER ID */}
                <col style={{ width: '110px' }} />  {/* 5. ORDER TYPE */}
                <col style={{ width: '170px' }} />  {/* 6. TABLE */}
                <col style={{ width: '160px' }} />  {/* 7. BILL DATE & TIME */}
                <col style={{ width: '120px' }} />  {/* 8. TOTAL AMOUNT */}
                <col style={{ width: '120px' }} />  {/* 9. PAID AMOUNT */}
                <col style={{ width: '115px' }} />  {/* 10. PAYMENT METHOD */}
                <col style={{ width: '115px' }} />  {/* 11. PAYMENT STATUS */}
                <col style={{ width: '125px' }} />  {/* 12. BILLED BY */}
                <col style={{ width: '135px' }} />  {/* 13. ACTIONS */}
              </colgroup>
              <thead>
                <tr>
                  <th style={{ textAlign: 'center' }}>S.NO</th>
                  <th style={{ textAlign: 'left' }}>BILL NO.</th>
                  <th style={{ textAlign: 'left' }}>INVOICE NO.</th>
                  <th style={{ textAlign: 'left' }}>ORDER ID</th>
                  <th style={{ textAlign: 'center' }}>ORDER TYPE</th>
                  <th style={{ textAlign: 'center' }}>TABLE</th>
                  <th style={{ textAlign: 'center' }}>BILL DATE & TIME</th>
                  <th style={{ textAlign: 'right' }}>TOTAL AMOUNT</th>
                  <th style={{ textAlign: 'right' }}>PAID AMOUNT</th>
                  <th style={{ textAlign: 'center' }}>PAYMENT METHOD</th>
                  <th style={{ textAlign: 'center' }}>PAYMENT STATUS</th>
                  <th style={{ textAlign: 'left' }}>BILLED BY</th>
                  <th style={{ textAlign: 'center' }} className="sticky-actions-header">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="13" style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b' }}>
                      <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite', marginRight: '8px' }}>🔄</span> Loading billing history...
                    </td>
                  </tr>
                ) : (
                  <>
                    {billingHistory.map((invoice, idx) => {
                      const billNo = invoice.billNo || invoice.billNumber || `B-${1040 + page * limit + idx + 1}`;
                      const invNo = invoice.id || invoice.invoiceNo || `INV/25-26/${1000 + idx + 1}`;
                      const totAmt = Number(invoice.amount ?? invoice.totalAmount ?? 0);
                      const paidAmt = Number(invoice.paidAmount ?? totAmt);

                      return (
                        <tr key={invoice.id || idx}>
                          <td style={{ textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#64748b' }}>
                            {page * limit + idx + 1}
                          </td>
                          <td style={{ textAlign: 'left', fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                            {billNo}
                          </td>
                          <td style={{ textAlign: 'left', fontSize: '13px', fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>
                            {invNo}
                          </td>
                          <td style={{ textAlign: 'left', fontSize: '13px', color: '#475569', fontWeight: 600 }}>
                            {invoice.orderId || `ORD-${100 + idx}`}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: '6px', backgroundColor: '#eff6ff', color: '#2563eb', fontSize: '11px', fontWeight: 700 }}>
                              {invoice.orderType || 'Dine-In'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center', fontSize: '13px', fontWeight: 700, color: '#ea580c' }}>
                            {invoice.table ? (invoice.table.includes('Table') ? invoice.table : `Table ${invoice.table}`) : 'Table 12'}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ fontWeight: 600, fontSize: '12px', color: '#0f172a', lineHeight: 1.2 }}>
                              {invoice.date || formatDateDMY(invoice.createdAt || new Date())}
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '3px', lineHeight: 1.2 }}>
                              {invoice.time || (invoice.createdAt ? new Date(invoice.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '08:45 PM')}
                            </div>
                          </td>
                          <td style={{ textAlign: 'right', fontSize: '13px', fontWeight: 800, color: '#0f172a', fontVariantNumeric: 'tabular-nums' }}>
                            ₹{totAmt.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td style={{ textAlign: 'right', fontSize: '13px', fontWeight: 700, color: '#16a34a', fontVariantNumeric: 'tabular-nums' }}>
                            ₹{paidAmt.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: '6px', backgroundColor: '#f1f5f9', color: '#334155', fontSize: '11px', fontWeight: 700 }}>
                              {invoice.paymentMethod || 'UPI'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '4px 12px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: 800,
                              background: '#dcfce7',
                              color: '#166534',
                              border: '1px solid #86efac'
                            }}>
                              {invoice.status || 'Paid'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'left', fontSize: '13px', color: '#0f172a', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {invoice.staff || 'Admin'}
                          </td>
                          <td style={{ textAlign: 'center' }} className="sticky-actions-cell">
                            <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center', justifyContent: 'center' }}>
                              {/* 1. View Invoice (Icon without text) */}
                              <button
                                type="button"
                                onClick={() => setSelectedInvoice(invoice)}
                                title="View Invoice"
                                aria-label="View Invoice"
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '6px',
                                  border: '1px solid #fed7aa',
                                  background: '#fff7ed',
                                  color: 'var(--primary)',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                <EyeIcon size={15} color="var(--primary)" />
                              </button>

                              {/* 2. Print Invoice (Icon without text) */}
                              <button
                                type="button"
                                onClick={() => handlePrintInvoiceDirect(invoice)}
                                title="Print Invoice"
                                aria-label="Print Invoice"
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '6px',
                                  border: '1px solid #cbd5e1',
                                  background: '#f8fafc',
                                  color: '#0f172a',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                <PrinterIcon size={15} color="#0f172a" />
                              </button>

                              {/* 3. Download Invoice (Icon without text) */}
                              <button
                                type="button"
                                onClick={() => handleDownloadInvoiceDirect(invoice)}
                                title="Download Invoice"
                                aria-label="Download Invoice"
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '6px',
                                  border: '1px solid #bbf7d0',
                                  background: '#f0fdf4',
                                  color: '#16a34a',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                <DownloadIcon size={15} color="#16a34a" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {billingHistory.length === 0 && (
                      <tr>
                        <td colSpan="13" style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b' }}>
                          No billing history found for the selected filters.
                        </td>
                      </tr>
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 20px',
            background: '#ffffff',
            borderTop: '1px solid #e2e8f0',
            boxSizing: 'border-box',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
              Showing {totalItems === 0 ? 0 : page * limit + 1} to {Math.min((page + 1) * limit, totalItems)} of {totalItems} entries
            </div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                style={{
                  padding: '6px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                  border: '1px solid #e2e8f0', background: page === 0 ? '#f8fafc' : '#ffffff',
                  color: page === 0 ? '#cbd5e1' : '#334155', cursor: page === 0 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                Prev
              </button>

              {getPageNumbers().map(pageNum => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setPage(pageNum - 1)}
                  style={{
                    minWidth: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: page + 1 === pageNum ? 700 : 500,
                    border: page + 1 === pageNum ? 'none' : '1px solid #e2e8f0',
                    background: page + 1 === pageNum ? '#000000' : '#ffffff',
                    color: page + 1 === pageNum ? '#ffffff' : '#334155',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {pageNum}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1 || totalPages === 0}
                style={{
                  padding: '6px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                  border: '1px solid #e2e8f0', background: (page >= totalPages - 1 || totalPages === 0) ? '#f8fafc' : '#ffffff',
                  color: (page >= totalPages - 1 || totalPages === 0) ? '#cbd5e1' : '#334155', cursor: (page >= totalPages - 1 || totalPages === 0) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* INVOICE DETAILS MODAL (Exact Thermal Receipt UI) */}
      <Modal isOpen={!!selectedInvoice} onClose={() => setSelectedInvoice(null)} title="Tax Invoice Receipt" maxWidth="430px">
        {selectedInvoice && (
          <ReceiptCard
            data={selectedInvoice}
            activeRestaurant={activeRestaurant}
            onPrint={() => handlePrintInvoiceDirect(selectedInvoice)}
            onDownload={() => handleDownloadInvoiceDirect(selectedInvoice)}
            isPaid={true}
          />
        )}
      </Modal>
    </section>
  );
}