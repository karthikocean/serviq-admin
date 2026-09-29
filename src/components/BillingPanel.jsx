import React, { useState } from 'react';
import { Badge } from './Badge';
import { Modal } from './Modal';
import ShowNotifications from '../helper/ShowNotifications.js';
import BillingApi from '../api/Billing.js';
import OrderApi from '../api/Order.js';
import { formatDateDMY } from '../helper/DateHelper.js';

const EyeIcon = ({ size = 15, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const PencilIcon = ({ size = 15, color = 'currentColor' }) => (
  <svg width={size} height={size} fill={color} viewBox="0 0 16 16" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-3.5 1a.5.5 0 0 0-.374.374l1 3.5a.5.5 0 0 0 .49.49l3.468-1.026z" />
  </svg>
);

const PrinterIcon = ({ size = 15, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <polyline points="6 9 6 2 18 2 18 9"></polyline>
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
    <rect x="6" y="14" width="12" height="8"></rect>
  </svg>
);

const DownloadIcon = ({ size = 15, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

export default function BillingPanel({
  billingData = [],
  setBillingData,
  selectedBillingTable = '',
  setSelectedBillingTable,
  activeRestaurant = {},
  billingPaymentMethod = 'UPI',
  setBillingPaymentMethod,
  fetchBillingData,
  selectedBranchId,
  currentUser = {}
}) {
  const [viewingBill, setViewingBill] = useState(null); // Modal for View Bill
  const [paymentModalBill, setPaymentModalBill] = useState(null); // Modal for Collect Payment
  const [invoiceModalBill, setInvoiceModalBill] = useState(null); // Modal for Tax Invoice
  
  // Payment Form States
  const [payMethod, setPayMethod] = useState('UPI');
  const [payAmount, setPayAmount] = useState('');
  const [payRefNo, setPayRefNo] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Pagination for List Table
  const [page, setPage] = useState(0);
  const limit = 10;

  const displayBillingData = Array.isArray(billingData) ? billingData : [];
  const paginatedBills = displayBillingData.slice(page * limit, (page + 1) * limit);
  const totalPages = Math.max(1, Math.ceil(displayBillingData.length / limit));

  const restaurantName = activeRestaurant?.name || activeRestaurant?.restaurantName || activeRestaurant?.businessName || 'XYZ Restaurant';
  const restaurantAddress = activeRestaurant?.address || activeRestaurant?.location || '123 Main Street, City Centre';
  const restaurantGst = activeRestaurant?.gstNo || activeRestaurant?.gstin || '33AAAAA0000A1Z5';

  const staffName = currentUser?.name || currentUser?.userName || 'Admin / Cashier';

  // Helper to open Collect Payment Modal
  const handleOpenCollectPayment = (bill) => {
    const rawItems = bill.items || [];
    const subtotal = rawItems.reduce((acc, curr) => acc + (Number(curr.amount) || ((Number(curr.qty || 1)) * (Number(curr.rate || curr.price || 0)))), 0);
    const taxAmt = parseFloat((subtotal * 0.05).toFixed(2));
    const totalAmt = parseFloat((subtotal + taxAmt).toFixed(2));
    const paidAmt = Number(bill.paidAmount || bill.paid) || 0;
    const balance = Math.max(0, totalAmt - paidAmt);

    setPaymentModalBill(bill);
    setPayMethod('UPI');
    setPayAmount(balance > 0 ? balance.toFixed(2) : totalAmt.toFixed(2));
    setPayRefNo('');
  };

  // Submit Collect Payment
  const handleCollectPaymentSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!paymentModalBill) return;

    if (['UPI', 'Card'].includes(payMethod) && !payRefNo.trim()) {
      ShowNotifications.showAlertNotification(`Payment Reference Number is required for ${payMethod}.`, false);
      return;
    }

    setIsProcessingPayment(true);
    const currentTableId = paymentModalBill.tableId || paymentModalBill._id || paymentModalBill.id;

    try {
      if (currentTableId) {
        await BillingApi.processTablePayment({
          branchId: selectedBranchId,
          tableId: currentTableId,
          paymentMethod: payMethod.toLowerCase(),
          amount: parseFloat(payAmount),
          referenceNumber: payRefNo
        }).catch(() => null);
      }

      // Construct Invoice Data
      const updatedBill = {
        ...paymentModalBill,
        status: 'Paid',
        paymentStatus: 'Paid',
        paidAmount: parseFloat(payAmount),
        balanceAmount: 0,
        paymentMethod: payMethod,
        referenceNumber: payRefNo,
        invoiceNo: `INV/25-26/${String(Math.floor(10000 + Math.random() * 90000))}`,
        billedBy: staffName,
        paidAt: new Date().toISOString()
      };

      if (typeof setBillingData === 'function') {
        setBillingData(prev => prev.map(b => {
          if (b.table === paymentModalBill.table || b.tableId === currentTableId || b.billNo === paymentModalBill.billNo) {
            return updatedBill;
          }
          return b;
        }));
      }

      ShowNotifications.showAlertNotification(`Payment collected successfully!`, true);
      setPaymentModalBill(null);
      setInvoiceModalBill(updatedBill); // Show Tax Invoice Popup
      if (typeof fetchBillingData === 'function') fetchBillingData();
    } catch (err) {
      console.error(err);
      ShowNotifications.showAlertNotification("Failed to collect payment", false);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Print Bill Popup Handler
  const handlePrintBillPopup = (bill) => {
    const rawItems = bill.items || [];
    const subtotal = rawItems.reduce((acc, curr) => acc + (Number(curr.amount) || ((Number(curr.qty || 1)) * (Number(curr.rate || curr.price || 0)))), 0);
    const cgst = parseFloat((subtotal * 0.025).toFixed(2));
    const sgst = parseFloat((subtotal * 0.025).toFixed(2));
    const total = (subtotal + cgst + sgst).toFixed(2);
    const billNo = bill.billNo || bill.billNumber || `B-${String(Math.floor(1000 + Math.random() * 9000))}`;
    const tableNo = String(bill.table || bill.tableNumber || '12').replace(/^Table\s*/i, '');
    const dateStr = formatDateDMY(new Date());
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const itemsHtml = rawItems.map(it => `
      <tr>
        <td style="text-align: left; padding: 4px 0;">${it.name || 'Dish'}</td>
        <td style="text-align: center; padding: 4px 0;">${it.qty || 1}</td>
        <td style="text-align: right; padding: 4px 0;">${Number(it.rate || it.price || 0).toFixed(2)}</td>
        <td style="text-align: right; padding: 4px 0;">${Number(it.amount || ((it.qty || 1) * (it.rate || it.price || 0))).toFixed(2)}</td>
      </tr>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Print Bill - ${billNo}</title>
        <style>
          body { font-family: monospace, Courier, sans-serif; width: 300px; margin: 0 auto; padding: 20px; font-size: 13px; color: #000; }
          .center { text-align: center; }
          .line { border-bottom: 1px dashed #000; margin: 10px 0; }
          table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 12px; }
          .bold { font-weight: bold; }
          @media print { body { width: 100%; padding: 0; } }
        </style>
      </head>
      <body>
        <div class="center bold" style="font-size: 16px;">${restaurantName}</div>
        <div class="center">${restaurantAddress}</div>
        <div class="center">GST No: ${restaurantGst}</div>
        <div class="line"></div>
        <div style="display: flex; justify-space-between;">
          <span>Table No: ${tableNo}</span>
          <span style="float: right;">Bill No: ${billNo}</span>
        </div>
        <div style="display: flex; justify-space-between;">
          <span>Date: ${dateStr}</span>
          <span style="float: right;">Time: ${timeStr}</span>
        </div>
        <div class="line"></div>
        <table>
          <thead>
            <tr style="border-bottom: 1px solid #000;">
              <th style="text-align: left;">Item</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Rate</th>
              <th style="text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        <div class="line"></div>
        <div style="display: flex; justify-content: space-between;">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>CGST @2.5%</span>
          <span>${cgst.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>SGST @2.5%</span>
          <span>${sgst.toFixed(2)}</span>
        </div>
        <div class="line"></div>
        <div style="display: flex; justify-content: space-between;" class="bold">
          <span>Total Payable</span>
          <span>${total}</span>
        </div>
        <div class="line"></div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;

    const printWin = window.open('', '_blank', 'width=450,height=600');
    if (printWin) {
      printWin.document.write(htmlContent);
      printWin.document.close();
    }
  };

  // Print Tax Invoice Popup Handler
  const handlePrintInvoicePopup = (invoice) => {
    const rawItems = invoice.items || [];
    const subtotal = rawItems.reduce((acc, curr) => acc + (Number(curr.amount) || ((Number(curr.qty || 1)) * (Number(curr.rate || curr.price || 0)))), 0);
    const cgst = parseFloat((subtotal * 0.025).toFixed(2));
    const sgst = parseFloat((subtotal * 0.025).toFixed(2));
    const total = (subtotal + cgst + sgst).toFixed(2);
    const invNo = invoice.invoiceNo || invoice.invoiceNumber || `INV/25-26/${String(Math.floor(10000 + Math.random() * 90000))}`;
    const tableNo = String(invoice.table || invoice.tableNumber || '12').replace(/^Table\s*/i, '');
    const dateStr = formatDateDMY(new Date());
    const payMethodStr = invoice.paymentMethod || 'UPI';

    const itemsHtml = rawItems.map(it => `
      <tr>
        <td style="text-align: left; padding: 4px 0;">${it.hsn || '996331'}</td>
        <td style="text-align: left; padding: 4px 0;">${it.name || 'Dish'}</td>
        <td style="text-align: center; padding: 4px 0;">${it.qty || 1}</td>
        <td style="text-align: right; padding: 4px 0;">${Number(it.rate || it.price || 0).toFixed(2)}</td>
        <td style="text-align: right; padding: 4px 0;">${Number(it.amount || ((it.qty || 1) * (it.rate || it.price || 0))).toFixed(2)}</td>
      </tr>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Tax Invoice - ${invNo}</title>
        <style>
          body { font-family: monospace, Courier, sans-serif; width: 340px; margin: 0 auto; padding: 20px; font-size: 13px; color: #000; }
          .center { text-align: center; }
          .line { border-bottom: 1px dashed #000; margin: 10px 0; }
          table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 12px; }
          .bold { font-weight: bold; }
          @media print { body { width: 100%; padding: 0; } }
        </style>
      </head>
      <body>
        <div class="center bold" style="font-size: 16px;">${restaurantName}</div>
        <div class="center">${restaurantAddress}</div>
        <div class="center">GST No: ${restaurantGst}</div>
        <div class="line"></div>
        <div class="center bold" style="font-size: 14px; margin: 5px 0;">TAX INVOICE</div>
        <div class="line"></div>
        <div style="display: flex; justify-content: space-between;">
          <span>Invoice No: ${invNo}</span>
          <span style="float: right;">Date: ${dateStr}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>Table No: ${tableNo}</span>
          <span style="float: right;">Payment: ${payMethodStr}</span>
        </div>
        <div class="line"></div>
        <table>
          <thead>
            <tr style="border-bottom: 1px solid #000;">
              <th style="text-align: left;">HSN</th>
              <th style="text-align: left;">Item</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Rate</th>
              <th style="text-align: right;">Taxable Value</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        <div class="line"></div>
        <div style="display: flex; justify-content: space-between;">
          <span>Taxable Value</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>CGST @2.5%</span>
          <span>${cgst.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>SGST @2.5%</span>
          <span>${sgst.toFixed(2)}</span>
        </div>
        <div class="line"></div>
        <div style="display: flex; justify-content: space-between;" class="bold">
          <span>Total Value</span>
          <span>${total}</span>
        </div>
        <div class="line"></div>
        <div class="center bold" style="margin-top: 15px;">Thank you, visit again!</div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;

    const printWin = window.open('', '_blank', 'width=480,height=650');
    if (printWin) {
      printWin.document.write(htmlContent);
      printWin.document.close();
    }
  };

  return (
    <section className="panel-view active" style={{ width: '100%', boxSizing: 'border-box' }}>
      
      {/* HEADER & SUB MODULE TITLE */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)'
      }}>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>
          Current Billing
        </h2>
        <span style={{ fontSize: '13px', color: '#64748b' }}>Manage active restaurant table billing, collect payments, and print invoices.</span>
      </div>

      {/* CURRENT BILLING LIST TABLE */}
      <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <div style={{ width: '100%', overflowX: 'auto', paddingBottom: '6px' }}>
          <table style={{ width: '100%', minWidth: '1300px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#000000', borderBottom: '3px solid #ff5a1f' }}>
                <th style={{ padding: '14px 12px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', textAlign: 'center', width: '50px' }}>S.NO</th>
                <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', minWidth: '110px' }}>BILL NO.</th>
                <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', minWidth: '120px' }}>ORDER ID</th>
                <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', textAlign: 'center', minWidth: '110px' }}>ORDER TYPE</th>
                <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', textAlign: 'center', minWidth: '100px' }}>TABLE</th>
                <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', textAlign: 'center', minWidth: '140px' }}>BILL DATE & TIME</th>
                <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', textAlign: 'right', minWidth: '110px' }}>BILL AMOUNT</th>
                <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', textAlign: 'right', minWidth: '110px' }}>PAID AMOUNT</th>
                <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', textAlign: 'right', minWidth: '120px' }}>BALANCE AMOUNT</th>
                <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', textAlign: 'center', minWidth: '120px' }}>PAYMENT STATUS</th>
                <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', textAlign: 'center', minWidth: '240px', position: 'sticky', right: 0, zIndex: 10, backgroundColor: '#000000' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {paginatedBills.map((bill, index) => {
                const isPaid = (bill.status || bill.paymentStatus || '').toLowerCase() === 'paid';
                const billNo = bill.billNo || bill.billNumber || `B-${1040 + page * limit + index + 1}`;
                const rawItems = bill.items || [];
                const subtotal = rawItems.reduce((acc, curr) => acc + (Number(curr.amount) || ((Number(curr.qty || 1)) * (Number(curr.rate || curr.price || 0)))), 0);
                const tax = subtotal * 0.05;
                const billAmount = Number(bill.total || bill.amount) || (subtotal + tax);
                const paidAmount = isPaid ? billAmount : (Number(bill.paidAmount) || 0);
                const balanceAmount = Math.max(0, billAmount - paidAmount);

                const dateStr = bill.date || formatDateDMY(bill.createdAt || new Date());
                const timeStr = bill.time || (bill.createdAt ? new Date(bill.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '08:45 PM');

                return (
                  <tr key={bill.tableId || bill._id || index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px 12px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#64748b' }}>{page * limit + index + 1}</td>
                    <td style={{ padding: '16px', fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>{billNo}</td>
                    <td style={{ padding: '16px', fontSize: '13px', fontWeight: 700, color: '#475569' }}>{bill.orderId || `ORD-${100 + index}`}</td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, background: '#eff6ff', color: '#2563eb' }}>
                        {bill.orderType || 'Dine-In'}
                      </span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center', fontWeight: 700, color: '#ea580c' }}>
                      {bill.table ? (bill.table.includes('Table') ? bill.table : `Table ${bill.table}`) : 'Table 12'}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center', fontSize: '12px', color: '#475569' }}>
                      <div>{dateStr}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>{timeStr}</div>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>₹{billAmount.toFixed(2)}</td>
                    <td style={{ padding: '16px', textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>₹{paidAmount.toFixed(2)}</td>
                    <td style={{ padding: '16px', textAlign: 'right', fontWeight: 700, color: balanceAmount > 0 ? '#ef4444' : '#64748b' }}>₹{balanceAmount.toFixed(2)}</td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 800,
                        backgroundColor: isPaid ? '#dcfce7' : '#fef2f2',
                        color: isPaid ? '#166534' : '#dc2626'
                      }}>
                        {isPaid ? 'Paid' : 'Unpaid'}
                      </span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center', position: 'sticky', right: 0, backgroundColor: '#ffffff' }}>
                      <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                        {/* View Bill */}
                        <button
                          type="button"
                          onClick={() => setViewingBill(bill)}
                          style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#334155', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                        >
                          View Bill
                        </button>

                        {!isPaid ? (
                          <>
                            {/* Print Bill */}
                            <button
                              type="button"
                              onClick={() => handlePrintBillPopup(bill)}
                              style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#2563eb', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                            >
                              Print Bill
                            </button>
                            {/* Collect Payment */}
                            <button
                              type="button"
                              onClick={() => handleOpenCollectPayment(bill)}
                              style={{ background: '#ff5a1f', border: 'none', color: '#ffffff', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                            >
                              Collect Payment
                            </button>
                          </>
                        ) : (
                          <>
                            {/* Print Invoice / Receipt */}
                            <button
                              type="button"
                              onClick={() => handlePrintInvoicePopup(bill)}
                              style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                            >
                              Print Invoice
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {paginatedBills.length === 0 && (
                <tr>
                  <td colSpan="11" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No active bills found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
          <span style={{ fontSize: '13px', color: '#64748b' }}>Showing {page * limit + 1} to {Math.min((page + 1) * limit, displayBillingData.length)} of {displayBillingData.length} bills</span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button type="button" disabled={page === 0} onClick={() => setPage(p => p - 1)} style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: page === 0 ? 'not-allowed' : 'pointer' }}>Prev</button>
            <button type="button" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer' }}>Next</button>
          </div>
        </div>
      </div>

      {/* VIEW BILL MODAL (Sample Bill Format) */}
      <Modal isOpen={!!viewingBill} onClose={() => setViewingBill(null)} title="Bill Details" maxWidth="420px">
        {viewingBill && (() => {
          const rawItems = viewingBill.items || [
            { name: 'Paneer Butter Masala', qty: 1, rate: 280, amount: 280 },
            { name: 'Butter Naan', qty: 3, rate: 45, amount: 135 },
            { name: 'Veg Biryani', qty: 1, rate: 220, amount: 220 }
          ];
          const subtotal = rawItems.reduce((acc, curr) => acc + (Number(curr.amount) || ((Number(curr.qty || 1)) * (Number(curr.rate || curr.price || 0)))), 0);
          const cgst = parseFloat((subtotal * 0.025).toFixed(2));
          const sgst = parseFloat((subtotal * 0.025).toFixed(2));
          const totalPayable = (subtotal + cgst + sgst).toFixed(2);
          const billNo = viewingBill.billNo || viewingBill.billNumber || 'B-1042';
          const tableNo = String(viewingBill.table || '12').replace(/^Table\s*/i, '');
          const isPaid = (viewingBill.status || viewingBill.paymentStatus || '').toLowerCase() === 'paid';

          return (
            <div style={{ fontFamily: 'monospace', fontSize: '13px', background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
              <div style={{ textAlign: 'center', fontWeight: 800, fontSize: '16px', color: '#0f172a' }}>{restaurantName}</div>
              <div style={{ textAlign: 'center', color: '#64748b' }}>{restaurantAddress}</div>
              <div style={{ textAlign: 'center', color: '#64748b', marginBottom: '10px' }}>GST No: {restaurantGst}</div>
              <div style={{ borderBottom: '1px dashed #cbd5e1', margin: '10px 0' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Table No: {tableNo}</span>
                <span>Bill No: {billNo}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Date: {formatDateDMY(new Date())}</span>
                <span>Time: 8:45 PM</span>
              </div>
              <div style={{ borderBottom: '1px dashed #cbd5e1', margin: '10px 0' }}></div>

              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                    <th>Item</th>
                    <th style={{ textAlign: 'center' }}>Qty</th>
                    <th style={{ textAlign: 'right' }}>Rate</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {rawItems.map((it, idx) => (
                    <tr key={idx}>
                      <td style={{ padding: '4px 0' }}>{it.name}</td>
                      <td style={{ textAlign: 'center' }}>{it.qty || 1}</td>
                      <td style={{ textAlign: 'right' }}>{Number(it.rate || 0).toFixed(2)}</td>
                      <td style={{ textAlign: 'right' }}>{Number(it.amount || ((it.qty || 1) * (it.rate || 0))).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ borderBottom: '1px dashed #cbd5e1', margin: '10px 0' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal</span><span>{subtotal.toFixed(2)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>CGST @2.5%</span><span>{cgst.toFixed(2)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>SGST @2.5%</span><span>{sgst.toFixed(2)}</span></div>
              <div style={{ borderBottom: '1px dashed #cbd5e1', margin: '10px 0' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '15px', color: '#0f172a' }}>
                <span>Total Payable</span>
                <span>₹{totalPayable}</span>
              </div>

              {/* MODAL ACTION BUTTONS */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '20px', borderTop: '1px solid #cbd5e1', paddingTop: '16px' }}>
                <button type="button" onClick={() => handlePrintBillPopup(viewingBill)} style={{ flex: 1, padding: '8px', background: '#000000', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <PrinterIcon size={14} color="#fff" /> Print Bill
                </button>
                <button type="button" onClick={() => handlePrintBillPopup(viewingBill)} style={{ flex: 1, padding: '8px', background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <DownloadIcon size={14} /> Download
                </button>
                {!isPaid && (
                  <button type="button" onClick={() => { setViewingBill(null); handleOpenCollectPayment(viewingBill); }} style={{ flex: 1, padding: '8px', background: '#ff5a1f', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>
                    Collect Payment
                  </button>
                )}
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* COLLECT PAYMENT POPUP */}
      <Modal isOpen={!!paymentModalBill} onClose={() => !isProcessingPayment && setPaymentModalBill(null)} title="Collect Payment" maxWidth="480px">
        {paymentModalBill && (
          <form onSubmit={handleCollectPaymentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Billing Table</span>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>{paymentModalBill.table}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Total Payable</span>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#ff5a1f' }}>₹{payAmount}</div>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                Payment Method <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={payMethod}
                onChange={e => setPayMethod(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
              >
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Card">Card</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                Payment Amount <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={payAmount}
                onChange={e => setPayAmount(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {['UPI', 'Card'].includes(payMethod) && (
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  Payment Reference Number <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. UPI Ref / Txn ID..."
                  value={payRefNo}
                  onChange={e => setPayRefNo(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: '#f1f5f9', padding: '12px', borderRadius: '8px' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Date & Time (Auto):</span>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>{formatDateDMY(new Date())}, {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Received By (Auto):</span>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>{staffName}</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
              <button type="button" onClick={() => setPaymentModalBill(null)} disabled={isProcessingPayment} style={{ padding: '9px 18px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff' }}>Cancel</button>
              <button type="submit" disabled={isProcessingPayment} style={{ padding: '9px 24px', borderRadius: '8px', border: 'none', background: '#ff5a1f', color: '#fff', fontWeight: 700 }}>
                {isProcessingPayment ? 'Processing...' : 'Confirm Payment'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* TAX INVOICE MODAL (Sample Invoice Format After Payment) */}
      <Modal isOpen={!!invoiceModalBill} onClose={() => setInvoiceModalBill(null)} title="Tax Invoice" maxWidth="450px">
        {invoiceModalBill && (() => {
          const rawItems = invoiceModalBill.items || [
            { hsn: '996331', name: 'Paneer Butter Masala', qty: 1, rate: 280, amount: 280 },
            { hsn: '996331', name: 'Butter Naan', qty: 3, rate: 45, amount: 135 },
            { hsn: '996331', name: 'Veg Biryani', qty: 1, rate: 220, amount: 220 }
          ];
          const subtotal = rawItems.reduce((acc, curr) => acc + (Number(curr.amount) || ((Number(curr.qty || 1)) * (Number(curr.rate || curr.price || 0)))), 0);
          const cgst = parseFloat((subtotal * 0.025).toFixed(2));
          const sgst = parseFloat((subtotal * 0.025).toFixed(2));
          const totalValue = (subtotal + cgst + sgst).toFixed(2);
          const invNo = invoiceModalBill.invoiceNo || 'INV/25-26/00147';
          const tableNo = String(invoiceModalBill.table || '12').replace(/^Table\s*/i, '');
          const payMethodStr = invoiceModalBill.paymentMethod || 'UPI';

          return (
            <div style={{ fontFamily: 'monospace', fontSize: '13px', background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
              <div style={{ textAlign: 'center', fontWeight: 800, fontSize: '16px', color: '#0f172a' }}>{restaurantName}</div>
              <div style={{ textAlign: 'center', color: '#64748b' }}>{restaurantAddress}</div>
              <div style={{ textAlign: 'center', color: '#64748b', marginBottom: '8px' }}>GST No: {restaurantGst}</div>
              <div style={{ borderBottom: '1px dashed #cbd5e1', margin: '8px 0' }}></div>
              <div style={{ textAlign: 'center', fontWeight: 800, fontSize: '14px', color: '#0f172a' }}>TAX INVOICE</div>
              <div style={{ borderBottom: '1px dashed #cbd5e1', margin: '8px 0' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Invoice No: {invNo}</span>
                <span>Date: {formatDateDMY(new Date())}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Table No: {tableNo}</span>
                <span>Payment: {payMethodStr}</span>
              </div>
              <div style={{ borderBottom: '1px dashed #cbd5e1', margin: '8px 0' }}></div>

              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '11px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                    <th>HSN</th>
                    <th>Item</th>
                    <th style={{ textAlign: 'center' }}>Qty</th>
                    <th style={{ textAlign: 'right' }}>Rate</th>
                    <th style={{ textAlign: 'right' }}>Taxable Value</th>
                  </tr>
                </thead>
                <tbody>
                  {rawItems.map((it, idx) => (
                    <tr key={idx}>
                      <td style={{ padding: '4px 0' }}>{it.hsn || '996331'}</td>
                      <td style={{ padding: '4px 0' }}>{it.name}</td>
                      <td style={{ textAlign: 'center' }}>{it.qty || 1}</td>
                      <td style={{ textAlign: 'right' }}>{Number(it.rate || 0).toFixed(2)}</td>
                      <td style={{ textAlign: 'right' }}>{Number(it.amount || ((it.qty || 1) * (it.rate || 0))).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ borderBottom: '1px dashed #cbd5e1', margin: '8px 0' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Taxable Value</span><span>{subtotal.toFixed(2)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>CGST @2.5%</span><span>{cgst.toFixed(2)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>SGST @2.5%</span><span>{sgst.toFixed(2)}</span></div>
              <div style={{ borderBottom: '1px dashed #cbd5e1', margin: '8px 0' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '15px', color: '#0f172a' }}>
                <span>Total Value</span>
                <span>₹{totalValue}</span>
              </div>
              <div style={{ textAlign: 'center', fontWeight: 700, marginTop: '12px', color: '#16a34a' }}>Thank you, visit again!</div>

              {/* MODAL ACTION BUTTONS */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '16px', borderTop: '1px solid #cbd5e1', paddingTop: '14px' }}>
                <button type="button" onClick={() => handlePrintInvoicePopup(invoiceModalBill)} style={{ flex: 1, padding: '9px', background: '#000000', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <PrinterIcon size={14} color="#fff" /> Print Invoice
                </button>
                <button type="button" onClick={() => handlePrintInvoicePopup(invoiceModalBill)} style={{ flex: 1, padding: '9px', background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <DownloadIcon size={14} /> Download Invoice
                </button>
              </div>
            </div>
          );
        })()}
      </Modal>
    </section>
  );
}