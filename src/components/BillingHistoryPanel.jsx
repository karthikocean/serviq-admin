import React, { useState } from 'react';
import { Modal } from './Modal';
import * as XLSX from 'xlsx';
import BillingApi from '../api/Billing';
import ShowNotifications from '../helper/ShowNotifications';

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
    let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
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

    if (result.status && result.response.data && result.response.data.items) {
      const itemsToExport = result.response.data.items;

      if (itemsToExport.length === 0) {
        ShowNotifications.showAlertNotification("No data available to export.", false);
        setIsExporting(false);
        return;
      }

      const exportData = itemsToExport.map(item => ({
        'Invoice ID': item.invoiceId,
        'Order ID': item.orderRefId,
        'Table': `Table ${item.tableNumber}`,
        'Date': new Date(item.createdAt).toLocaleDateString(),
        'Time': new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        'Subtotal': item.subtotal,
        'Tax': item.tax,
        'Discount': item.discount,
        'Total Amount': item.totalAmount,
        'Payment Method': item.paymentMethod === 'upi' ? 'UPI' : (item.paymentMethod || '').charAt(0).toUpperCase() + (item.paymentMethod || '').slice(1),
        'Payment Status': item.paymentStatus,
        'Staff': item.staffName,
        'Branch ID': item.branchId
      }));

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
    } else {
      ShowNotifications.showAlertNotification("Failed to fetch data for export.", false);
    }

    setIsExporting(false);
  };

  // Calculate Summaries
  const totalBills = totalItems || 0;
  const totalSales = summary?.totalSales || 0;
  const cashTotal = summary?.cashTotal || 0;
  const upiTotal = summary?.upiTotal || 0;

  return (
    <section>
      <div style={{ width: '100%' }}>
        {/* FILTERS AREA */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '24px', alignItems: 'flex-end' }}>

          <div style={{ flex: '1', minWidth: '200px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-main)' }}>Search Invoice / Order</label>
            <input
              type="text"
              placeholder="e.g. INV-10245"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)' }}
            />
          </div>

          <div style={{ flex: '1', minWidth: '150px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-main)' }}>Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: '#fff' }}
            >
              <option value="Today">Today</option>
              <option value="Yesterday">Yesterday</option>
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
              <option value="Custom">Custom Range</option>
            </select>
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

          <div style={{ flex: '1', minWidth: '150px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-main)' }}>Payment Method</label>
            <select
              value={selectedPayment}
              onChange={(e) => setSelectedPayment(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: '#fff' }}
            >
              <option value="All">All Methods</option>
              <option value="UPI">UPI</option>
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
            </select>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
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
        </div>

        {/* MAIN HISTORY TABLE */}
        <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
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
                            onClick={() => setSelectedInvoice(invoice)}
                            style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '700', fontSize: '14px', cursor: 'pointer', textDecoration: 'underline' }}
                          >
                            View
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
            Showing {totalItems === 0 ? 0 : (page - 1) * limit + 1} to {Math.min(page * limit, totalItems)} of {totalItems} entries
          </div>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                padding: '6px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                border: '1px solid #e2e8f0', background: page === 1 ? '#f8fafc' : '#ffffff',
                color: page === 1 ? '#cbd5e1' : '#334155', cursor: page === 1 ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Prev
            </button>

            {getPageNumbers().map(pageNum => (
              <button
                key={pageNum}
                type="button"
                onClick={() => setPage(pageNum)}
                style={{
                  minWidth: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: page === pageNum ? 700 : 500,
                  border: page === pageNum ? 'none' : '1px solid #e2e8f0',
                  background: page === pageNum ? '#000000' : '#ffffff',
                  color: page === pageNum ? '#ffffff' : '#334155',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {pageNum}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || totalPages === 0}
              style={{
                padding: '6px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                border: '1px solid #e2e8f0', background: (page >= totalPages || totalPages === 0) ? '#f8fafc' : '#ffffff',
                color: (page >= totalPages || totalPages === 0) ? '#cbd5e1' : '#334155', cursor: (page >= totalPages || totalPages === 0) ? 'not-allowed' : 'pointer',
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