import React, { useState } from 'react';
import { Modal } from './Modal';
import * as XLSX from 'xlsx';
import BillingApi from '../api/Billing';
import ShowNotifications from '../helper/ShowNotifications';
import SearchableSelect from './SearchableSelect.jsx';
import { formatDateDMY } from '../helper/DateHelper.js';

const EyeIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
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
  selectedBranchId,
  page, setPage,
  limit,
  totalItems,
  summary
}) {

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
      const filters = {
        search: searchTerm,
        dateRange,
        startDate: customStartDate,
        endDate: customEndDate,
        branchId: selectedBranchId,
        paymentMethod: selectedPayment,
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

    // Auto-size columns loosely
    const wscols = [
      { wch: 15 }, { wch: 15 }, { wch: 10 }, { wch: 12 }, { wch: 12 },
      { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 15 }, { wch: 15 },
      { wch: 15 }, { wch: 15 }, { wch: 25 }
    ];
    worksheet['!cols'] = wscols;

    const fileName = `Billing_History_${new Date().getTime()}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    setIsExporting(false);
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
        {/* FILTERS AREA */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '24px', alignItems: 'flex-end' }}>

          <div style={{ width: '320px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-main)' }}>Search Invoice / Order</label>
            <input
              type="text"
              placeholder="e.g. INV-10245"
              value={searchTerm}
              onKeyDown={e => {
                if (e.key === ' ' && !e.currentTarget.value) {
                  e.preventDefault();
                }
              }}
              onChange={(e) => {
                const val = e.target.value.replace(/^\s+/, '');
                setSearchTerm(val);
              }}
              style={{ width: '100%', height: '38px', padding: '0 14px', borderRadius: '8px', border: '1px solid var(--border)', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ flex: '1', minWidth: '160px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-main)' }}>Date Range</label>
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
              placeholder="Select Date Range..."
            />
          </div>

          {dateRange === 'Custom' && (
            <div style={{ display: 'flex', gap: '8px', flex: '2', minWidth: '250px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-main)' }}>From</label>
                <input type="date" value={customStartDate} onChange={e => setCustomStartDate(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-main)' }}>To</label>
                <input type="date" value={customEndDate} onChange={e => setCustomEndDate(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)' }} />
              </div>
            </div>
          )}

          <div style={{ flex: '1', minWidth: '160px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-main)' }}>Payment Method</label>
            <SearchableSelect
              value={selectedPayment}
              onChange={(e) => setSelectedPayment(e.target.value)}
              options={[
                { value: 'All', label: 'All Methods' },
                { value: 'UPI', label: 'UPI' },
                { value: 'Cash', label: 'Cash' },
                { value: 'Card', label: 'Card' }
              ]}
              placeholder="Select Payment Method..."
            />
          </div>

          <div>
            <button
              className="btn btn-black"
              style={{ padding: '10px 24px', height: '42px', display: 'flex', alignItems: 'center', gap: '8px' }}
              onClick={handleExportExcel}
              disabled={isExporting}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              {isExporting ? 'Exporting...' : 'Export to Excel'}
            </button>
          </div>
        </div>

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

        {/* MAIN HISTORY TABLE */}
        <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)' }}>
          <div style={{ overflowX: 'auto', paddingBottom: '6px' }}>
            <table style={{ width: '100%', minWidth: '1000px', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#000000', borderBottom: '3px solid #ff5a1f' }}>
                  <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>INVOICE</th>
                  <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ORDER ID</th>
                  <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>TABLE</th>
                  <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>DATE & TIME</th>
                  <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>AMOUNT</th>
                  <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>PAYMENT</th>
                  <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>STAFF</th>
                  <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>STATUS</th>
                  <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="9" style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b' }}>
                      Loading billing history...
                    </td>
                  </tr>
                ) : (
                  <>
                    {billingHistory.map((invoice, idx) => (
                      <tr key={invoice.id} style={{ borderBottom: idx !== billingHistory.length - 1 ? '1px solid var(--border)' : 'none' }}>
                        <td style={{ padding: '16px 20px', fontSize: '14px', fontWeight: '700', color: 'var(--black)' }}>{invoice.id}</td>
                        <td style={{ padding: '16px 20px', fontSize: '14px', color: '#64748b' }}>{invoice.orderId}</td>
                        <td style={{ padding: '16px 20px', fontSize: '14px', fontWeight: '600' }}>Table {invoice.table}</td>
                        <td style={{ padding: '16px 20px', fontSize: '14px', color: '#64748b' }}>{invoice.date}, {invoice.time}</td>
                        <td style={{ padding: '16px 20px', fontSize: '14px', fontWeight: '700', color: 'var(--black)' }}>₹{invoice.amount.toLocaleString()}</td>
                        <td style={{ padding: '16px 20px', fontSize: '14px', fontWeight: '600' }}>{invoice.paymentMethod}</td>
                        <td style={{ padding: '16px 20px', fontSize: '14px', color: '#64748b' }}>{invoice.staff}</td>
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '700',
                            background: invoice.status === 'Paid' ? '#dcfce7' : '#fef08a',
                            color: invoice.status === 'Paid' ? '#166534' : '#854d0e'
                          }}>
                            {invoice.status}
                          </span>
                        </td>
                        <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                          <button
                            type="button"
                            onClick={() => setSelectedInvoice(invoice)}
                            title="View Invoice Details"
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              border: '1px solid #fed7aa',
                              background: '#fff7ed',
                              color: 'var(--primary)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = 'var(--primary)';
                              e.currentTarget.style.color = '#ffffff';
                              e.currentTarget.style.borderColor = 'var(--primary)';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = '#fff7ed';
                              e.currentTarget.style.color = 'var(--primary)';
                              e.currentTarget.style.borderColor = '#fed7aa';
                            }}
                          >
                            <EyeIcon size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {billingHistory.length === 0 && (
                      <tr>
                        <td colSpan="9" style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b' }}>
                          No billing history found for the selected filters.
                        </td>
                      </tr>
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', padding: '10px 20px', background: '#fff', borderRadius: '10px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '13px', color: '#64748b' }}>
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

      {/* INVOICE DETAILS MODAL */}
      <Modal isOpen={!!selectedInvoice} onClose={() => setSelectedInvoice(null)} title="Invoice Details" maxWidth="450px">
        {selectedInvoice && (
          <div style={{ marginTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '16px', fontWeight: '800', color: 'var(--black)' }}>Invoice #{selectedInvoice.id}</span>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Order #{selectedInvoice.orderId}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', fontSize: '13px', color: '#64748b' }}>
              <span>Table {selectedInvoice.table}</span>
              <span>{selectedInvoice.date} • {selectedInvoice.time}</span>
            </div>

            <div style={{ borderTop: '1px dashed #cbd5e1', borderBottom: '1px dashed #cbd5e1', padding: '16px 0', marginBottom: '24px' }}>
              {selectedInvoice.items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px' }}>
                  <div style={{ fontWeight: '600', color: 'var(--black)' }}>
                    {item.name} <span style={{ color: '#64748b', fontWeight: '500', marginLeft: '8px' }}>{item.qty} × ₹{item.price}</span>
                  </div>
                  <div style={{ fontWeight: '700' }}>₹{item.total}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#64748b' }}>
                <span>Subtotal</span>
                <span style={{ fontWeight: '600' }}>₹{selectedInvoice.subtotal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#64748b' }}>
                <span>GST 5%</span>
                <span style={{ fontWeight: '600' }}>₹{selectedInvoice.tax}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: '800', color: 'var(--primary)', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
                <span>Grand Total</span>
                <span>₹{selectedInvoice.amount}</span>
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '24px' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--black)', marginBottom: '8px' }}>Payment</div>
              <div style={{ fontSize: '14px', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Method</span> <span style={{ fontWeight: '600', color: 'var(--black)' }}>{selectedInvoice.paymentMethod}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Paid by</span> <span style={{ fontWeight: '600', color: 'var(--black)' }}>{selectedInvoice.staff}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Status</span> <span style={{ fontWeight: '700', color: '#166534' }}>{selectedInvoice.status}</span>
                </div>
              </div>
            </div>

            {/* <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-outline" style={{ flex: 1, padding: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                Print Invoice
              </button>
              <button className="btn btn-black" style={{ flex: 1, padding: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Download PDF
              </button>
            </div> */}
          </div>
        )}
      </Modal>
    </section>
  );
}