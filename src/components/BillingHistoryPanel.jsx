import React, { useState, useMemo } from 'react';
import { Modal } from './Modal';

export default function BillingHistoryPanel({ billingHistory = [], branches = [] }) {
  // State for Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('Today');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('All');
  const [selectedPayment, setSelectedPayment] = useState('All');
  
  // State for Modals
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState('Excel');
  const [selectedInvoice, setSelectedInvoice] = useState(null); // For Invoice View Modal

  // Dummy Handle Export (ready for API integration)
  const handleExport = () => {
    // In future: await api.exportBillingHistory({ dateRange, selectedBranch, selectedPayment, format: exportFormat })
    alert(`Downloading ${exportFormat} file for Billing History...`);
    setShowExportModal(false);
  };

  // Filter Logic
  const filteredHistory = useMemo(() => {
    return billingHistory.filter(invoice => {
      // Branch filter
      if (selectedBranch !== 'All' && invoice.branchId !== selectedBranch) return false;
      // Payment filter
      if (selectedPayment !== 'All' && invoice.paymentMethod !== selectedPayment) return false;
      // Search filter
      if (searchTerm) {
        const lowerSearch = searchTerm.toLowerCase();
        if (!invoice.id.toLowerCase().includes(lowerSearch) && 
            !invoice.orderId.toLowerCase().includes(lowerSearch)) {
          return false;
        }
      }
      return true;
    });
  }, [billingHistory, selectedBranch, selectedPayment, searchTerm, dateRange, customStartDate, customEndDate]);

  // Calculate Summaries
  const totalBills = filteredHistory.length;
  const totalSales = filteredHistory.reduce((acc, curr) => acc + curr.amount, 0);
  const cashTotal = filteredHistory.filter(i => i.paymentMethod === 'Cash').reduce((acc, curr) => acc + curr.amount, 0);
  const upiTotal = filteredHistory.filter(i => i.paymentMethod === 'UPI').reduce((acc, curr) => acc + curr.amount, 0);

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
              onClick={() => setShowExportModal(true)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Export
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
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Invoice</th>
                  <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Order ID</th>
                  <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Table</th>
                  <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Date & Time</th>
                  <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Amount</th>
                  <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Payment</th>
                  <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Staff</th>
                  <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((invoice, idx) => (
                  <tr key={invoice.id} style={{ borderBottom: idx !== filteredHistory.length - 1 ? '1px solid var(--border)' : 'none' }}>
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
                {filteredHistory.length === 0 && (
                  <tr>
                    <td colSpan="9" style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b' }}>
                      No billing history found for the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* EXPORT MODAL */}
      <Modal isOpen={showExportModal} onClose={() => setShowExportModal(false)} title="Export Billing History" maxWidth="400px">
        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>Date Range</label>
            <input type="text" value={dateRange === 'Custom' ? `${customStartDate} to ${customEndDate}` : dateRange} readOnly style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: '#f8fafc', color: '#64748b' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>Payment Method</label>
            <input type="text" value={selectedPayment === 'All' ? 'All Methods' : selectedPayment} readOnly style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: '#f8fafc', color: '#64748b' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>Format</label>
            <div style={{ display: 'flex', gap: '16px' }}>
              {['Excel', 'PDF', 'CSV'].map(fmt => (
                <label key={fmt} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
                  <input type="radio" name="format" checked={exportFormat === fmt} onChange={() => setExportFormat(fmt)} style={{ accentColor: 'var(--primary)' }} />
                  {fmt}
                </label>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
            <button className="btn btn-outline" style={{ padding: '10px 20px' }} onClick={() => setShowExportModal(false)}>Cancel</button>
            <button className="btn btn-black" style={{ padding: '10px 24px' }} onClick={handleExport}>Export</button>
          </div>
        </div>
      </Modal>

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

            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-outline" style={{ flex: 1, padding: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                Print Invoice
              </button>
              <button className="btn btn-black" style={{ flex: 1, padding: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Download PDF
              </button>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}
