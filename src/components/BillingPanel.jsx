import React, { useState, useEffect, useMemo } from 'react';
import { Badge } from './Badge';
import { Modal } from './Modal';
import ShowNotifications from '../helper/ShowNotifications.js';
import SearchableSelect from './SearchableSelect.jsx';
import BillingApi from '../api/Billing.js';
import OrderApi from '../api/Order.js';
import { formatDateDMY } from '../helper/DateHelper.js';
import ReceiptCard, { generateReceiptHtml, openCenteredPrintWindow } from './ReceiptTemplate.jsx';

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

const CreditCardIcon = ({ size = 15, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
    <line x1="1" y1="10" x2="23" y2="10"></line>
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
  currentUser = {},
  hasPermission,
  searchTerm: propSearchTerm,
  setSearchTerm: propSetSearchTerm,
  selectedTable: propSelectedTable,
  setSelectedTable: propSetSelectedTable,
  customerFilter: propCustomerFilter,
  setCustomerFilter: propSetCustomerFilter,
  selectedStaff: propSelectedStaff,
  setSelectedStaff: propSetSelectedStaff,
  page: propPage,
  setPage: propSetPage,
  limit: propLimit = 10,
  totalItems: propTotalItems = 0
}) {
  const canView = typeof hasPermission === 'function' ? hasPermission('billing_current', 'view') : true;
  const canEdit = typeof hasPermission === 'function' ? (hasPermission('billing_current', 'edit') || hasPermission('billing_current', 'add')) : true;
  const [viewingBill, setViewingBill] = useState(null); // Modal for View Bill
  const [paymentModalBill, setPaymentModalBill] = useState(null); // Modal for Collect Payment
  const [invoiceModalBill, setInvoiceModalBill] = useState(null); // Modal for Tax Invoice
  
  // Payment Form States
  const [payMethod, setPayMethod] = useState('UPI');
  const [payAmount, setPayAmount] = useState('');
  const [payRefNo, setPayRefNo] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Filters State: Dining Table, Customer, Cashier/Staff, and Search
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const searchTerm = propSearchTerm !== undefined ? propSearchTerm : localSearchTerm;
  const setSearchTerm = propSetSearchTerm || setLocalSearchTerm;

  const [localSelectedTable, setLocalSelectedTable] = useState('All');
  const selectedTable = propSelectedTable !== undefined ? propSelectedTable : localSelectedTable;
  const setSelectedTable = propSetSelectedTable || setLocalSelectedTable;

  const [localCustomerFilter, setLocalCustomerFilter] = useState('');
  const customerFilter = propCustomerFilter !== undefined ? propCustomerFilter : localCustomerFilter;
  const setCustomerFilter = propSetCustomerFilter || setLocalCustomerFilter;

  const [localSelectedStaff, setLocalSelectedStaff] = useState('All');
  const selectedStaff = propSelectedStaff !== undefined ? propSelectedStaff : localSelectedStaff;
  const setSelectedStaff = propSetSelectedStaff || setLocalSelectedStaff;

  // Pagination for List Table
  const [localPage, setLocalPage] = useState(0);
  const page = propPage !== undefined ? propPage : localPage;
  const setPage = propSetPage || setLocalPage;
  const limit = propLimit || 10;

  // Reset page when local filters change
  useEffect(() => {
    if (propPage === undefined) {
      setLocalPage(0);
    }
  }, [searchTerm, selectedTable, customerFilter, selectedStaff]);

  const displayBillingData = Array.isArray(billingData) ? billingData : [];

  // Table options derived from data & active restaurant
  const tableOptions = useMemo(() => {
    const set = new Set();
    displayBillingData.forEach(b => {
      const t = b.table || b.tableNumber || b.tableNo;
      if (t) set.add(String(t).replace(/^Table\s*/i, '').trim());
    });
    if (Array.isArray(activeRestaurant?.tables)) {
      activeRestaurant.tables.forEach(t => {
        const tNum = t.tableNumber || t.tableNo || t.name;
        if (tNum) set.add(String(tNum).replace(/^Table\s*/i, '').trim());
      });
    }
    const sorted = Array.from(set).sort((a, b) => {
      const numA = parseInt(a, 10);
      const numB = parseInt(b, 10);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.localeCompare(b);
    });
    return [
      { value: 'All', label: 'All Tables' },
      ...sorted.map(t => ({ value: t, label: `Table ${t}` }))
    ];
  }, [displayBillingData, activeRestaurant]);

  // Cashier / Staff options
  const staffOptions = useMemo(() => {
    const map = new Map();
    if (Array.isArray(activeRestaurant?.staff)) {
      activeRestaurant.staff.forEach(s => {
        const id = s._id || s.id;
        const name = s.name || s.staffName || s.fullName || s.userName;
        if (id && name) {
          map.set(String(id), name);
        } else if (name) {
          map.set(name, name);
        }
      });
    }
    displayBillingData.forEach(b => {
      const id = b.cashierId || b.staffId || b.waiterId;
      const name = b.cashier || b.staff || b.waiter || b.billedBy;
      if (id && name) {
        map.set(String(id), String(name));
      } else if (name && !Array.from(map.values()).includes(String(name))) {
        map.set(String(name), String(name));
      }
    });
    return [
      { value: 'All', label: 'All Cashier / Staff' },
      ...Array.from(map.entries()).map(([value, label]) => ({ value, label }))
    ];
  }, [displayBillingData, activeRestaurant]);

  // Filter bills by Dining Table, Customer, Cashier/Staff, and Search
  const filteredBills = useMemo(() => {
    return displayBillingData.filter(bill => {
      // 1. Table Filter
      if (selectedTable && selectedTable !== 'All') {
        const bTable = String(bill.table || bill.tableNumber || bill.tableNo || '').replace(/^Table\s*/i, '').trim().toLowerCase();
        const sTable = String(selectedTable).replace(/^Table\s*/i, '').trim().toLowerCase();
        const bTableId = String(bill.tableId || '').trim().toLowerCase();
        if (bTable !== sTable && bTableId !== sTable) return false;
      }

      // 2. Customer Filter
      if (customerFilter && customerFilter.trim()) {
        const cq = customerFilter.toLowerCase().trim();
        const cName = (bill.customerName || bill.customer?.name || bill.clientName || '').toLowerCase();
        const cPhone = (bill.customerPhone || bill.customerMobile || bill.phone || '').toLowerCase();
        if (!cName.includes(cq) && !cPhone.includes(cq)) return false;
      }

      // 3. Cashier / Staff Filter
      if (selectedStaff && selectedStaff !== 'All') {
        const itemStaffId = String(bill.cashierId || bill.staffId || bill.waiterId || '').trim();
        const itemStaffName = String(bill.staff || bill.cashier || bill.waiter || bill.billedBy || bill.waiterName || '').trim().toLowerCase();
        const selStaffOpt = staffOptions.find(o => o.value === selectedStaff);
        const selLabel = (selStaffOpt?.label || selectedStaff).toLowerCase();
        if (itemStaffId !== selectedStaff && itemStaffName !== String(selectedStaff).toLowerCase() && itemStaffName !== selLabel) {
          return false;
        }
      }

      // 4. Search Term
      if (searchTerm && searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchesBill = (bill.billNo || bill.billNumber || '').toLowerCase().includes(q);
        const matchesOrd = (bill.orderId || '').toLowerCase().includes(q);
        const matchesTab = (bill.table || '').toLowerCase().includes(q) || `table ${bill.table}`.toLowerCase().includes(q);
        const matchesStaff = (bill.staff || bill.cashier || bill.waiter || bill.billedBy || '').toLowerCase().includes(q);
        const matchesCust = (bill.customerName || '').toLowerCase().includes(q) || (bill.customerPhone || '').toLowerCase().includes(q);
        if (!matchesBill && !matchesOrd && !matchesTab && !matchesStaff && !matchesCust) return false;
      }

      return true;
    });
  }, [displayBillingData, selectedTable, customerFilter, selectedStaff, searchTerm, staffOptions]);

  const totalBillsCount = propTotalItems > 0 ? propTotalItems : filteredBills.length;
  const totalPages = Math.max(1, Math.ceil(totalBillsCount / limit));

  useEffect(() => {
    if (page >= totalPages && totalPages > 0) {
      setPage(Math.max(0, totalPages - 1));
    }
  }, [totalPages, page]);

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

  const paginatedBills = displayBillingData.length > limit
    ? filteredBills.slice(page * limit, (page + 1) * limit)
    : filteredBills;

  const restaurantName = activeRestaurant?.name || activeRestaurant?.restaurantName || activeRestaurant?.businessName || 'XYZ Restaurant';
  const restaurantAddress = activeRestaurant?.address || activeRestaurant?.location || '123 Main Street, City Centre';
  const restaurantGst = activeRestaurant?.gstNo || activeRestaurant?.gstin || '33AAAAA0000A1Z5';
  const restaurantTagline = activeRestaurant?.tagline || 'Good Food • Great Moments';

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
        invoiceNo: paymentModalBill.invoiceNo || paymentModalBill.billNo || paymentModalBill.id || '-',
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

  // Print Bill Popup Handler (Centered Thermal Bill Print Window)
  const handlePrintBillPopup = (bill) => {
    const htmlContent = generateReceiptHtml(bill, activeRestaurant);
    openCenteredPrintWindow(htmlContent, `Print Bill - ${bill?.billNo || bill?.id || 'Doc'}`, 480, 700);
  };

  // Modern Tax Invoice HTML Generator (matching Admin theme and screenshot design)
  const generateTaxInvoiceHtml = (invoice) => {
    const rawItems = (invoice.items && Array.isArray(invoice.items) && invoice.items.length > 0) ? invoice.items : [];
    const subtotal = invoice.subtotal != null ? Number(invoice.subtotal) : rawItems.reduce((acc, curr) => acc + (Number(curr.amount) || ((Number(curr.qty || 1)) * (Number(curr.rate || curr.price || 0)))), 0);
    const cgst = invoice.cgst != null ? Number(invoice.cgst) : (invoice.tax != null ? Number(invoice.tax) / 2 : parseFloat((subtotal * 0.025).toFixed(2)));
    const sgst = invoice.sgst != null ? Number(invoice.sgst) : (invoice.tax != null ? Number(invoice.tax) / 2 : parseFloat((subtotal * 0.025).toFixed(2)));
    const total = invoice.billAmount != null ? Number(invoice.billAmount).toFixed(2) : (subtotal + cgst + sgst).toFixed(2);
    const invNo = invoice.invoiceNo || invoice.invoiceNumber || invoice.billNo || invoice.id || '-';
    const tableNo = String(invoice.table || invoice.tableNumber || '-').replace(/^Table\s*/i, '');
    const payMethodStr = invoice.paymentMethod || payMethod || 'UPI';

    const d = invoice.createdAt || invoice.date || invoice.billDateTime ? new Date(invoice.createdAt || invoice.date || invoice.billDateTime) : new Date();
    const dateObj = isNaN(d.getTime()) ? new Date() : d;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dateStr = `${String(dateObj.getDate()).padStart(2, '0')}-${months[dateObj.getMonth()]}-${dateObj.getFullYear()}`;

    const itemsHtml = rawItems.length > 0 ? rawItems.map(it => `
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 10px 14px; text-align: left; font-size: 13px; color: #475569;">${it.hsn || '-'}</td>
        <td style="padding: 10px 14px; text-align: left; font-size: 13px; font-weight: 600; color: #0f172a;">${it.name || 'Item'}</td>
        <td style="padding: 10px 10px; text-align: center; font-size: 13px; color: #0f172a;">${it.qty || 1}</td>
        <td style="padding: 10px 14px; text-align: right; font-size: 13px; color: #0f172a; font-variant-numeric: tabular-nums;">${Number(it.rate || it.price || 0).toFixed(2)}</td>
        <td style="padding: 10px 14px; text-align: right; font-size: 13px; font-weight: 600; color: #0f172a; font-variant-numeric: tabular-nums;">${Number(it.amount || ((it.qty || 1) * (it.rate || it.price || 0))).toFixed(2)}</td>
      </tr>
    `).join('') : `
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td colspan="5" style="padding: 16px; text-align: center; color: #94a3b8; font-size: 13px;">No items recorded</td>
      </tr>
    `;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Tax Invoice - ${invNo}</title>
        <meta charset="utf-8" />
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #ffffff;
            color: #0f172a;
            padding: 24px;
            display: flex;
            justify-content: center;
          }
          @media print {
            body { padding: 0; background: transparent; }
            .card { box-shadow: none !important; border: 1px solid #fed7aa !important; }
            @page { size: portrait; margin: 8mm; }
          }
          .card {
            width: 100%;
            max-width: 660px;
            background: #ffffff;
            border: 1.5px solid #fed7aa;
            border-radius: 16px;
            padding: 28px 32px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.06);
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 20px;
          }
          .logo-wrap {
            display: flex;
            align-items: center;
            gap: 16px;
          }
          .circle-logo {
            width: 56px;
            height: 56px;
            border-radius: 50%;
            border: 2.5px solid #ff5a1f;
            background: #fff7ed;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }
          .info-box {
            background: #f8fafc;
            border: 1px solid #fed7aa;
            border-radius: 12px;
            padding: 12px 18px;
            margin: 18px 0;
            display: grid;
            grid-template-columns: 1.2fr 1fr;
            gap: 8px 24px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
            margin-bottom: 14px;
          }
          th {
            background: #f8fafc;
            border-top: 1px solid #f1f5f9;
            border-bottom: 1.5px solid #e2e8f0;
            padding: 10px 14px;
            font-size: 12px;
            font-weight: 800;
            color: #334155;
            text-transform: uppercase;
          }
          .totals-card {
            width: 320px;
            background: #f8fafc;
            border: 1px solid #fed7aa;
            border-radius: 12px;
            overflow: hidden;
            margin-left: auto;
            margin-top: 14px;
          }
          .footer-note {
            margin-top: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 16px;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <!-- Header -->
          <div class="header">
            <div class="logo-wrap">
              <div class="circle-logo">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ff5a1f" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M6 3v5c0 1.1.9 2 2 2s2-.9 2-2V3"></path>
                  <line x1="8" y1="3" x2="8" y2="8"></line>
                  <line x1="8" y1="10" x2="8" y2="21"></line>
                  <path d="M16 3a2.5 2.5 0 0 1 2.5 2.5c0 1.8-1.2 3.2-2.5 3.5v12"></path>
                  <path d="M16 3a2.5 2.5 0 0 0-2.5 2.5c0 1.8 1.2 3.2 2.5 3.5"></path>
                </svg>
              </div>
              <div>
                <h2 style="font-size: 22px; font-weight: 800; color: #0f172a; letter-spacing: -0.3px;">${restaurantName}</h2>
                <p style="font-size: 13px; color: #64748b; font-weight: 500; margin-top: 2px;">${restaurantTagline}</p>
              </div>
            </div>
            <div style="display: flex; flex-direction: column; align-items: flex-end; text-align: right;">
              <div style="display: flex; align-items: flex-start; gap: 8px;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="#ff5a1f" stroke="#ff5a1f" stroke-width="1" style="margin-top: 2px; flex-shrink: 0;">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3" fill="#ffffff"></circle>
                </svg>
                <div style="font-size: 12px; color: #475569; line-height: 1.45; text-align: left;">
                  <div style="font-weight: 700; color: #0f172a;">${restaurantName}</div>
                  <div>${restaurantAddress}</div>
                  <div>GST No: <span style="font-weight: 600;">${restaurantGst}</span></div>
                </div>
              </div>
              <div style="width: 100%; height: 1.5px; background: #e2e8f0; margin: 8px 0 6px 0;"></div>
              <div style="font-size: 13px; font-weight: 800; color: #ff5a1f; letter-spacing: 1px; text-transform: uppercase;">TAX INVOICE</div>
            </div>
          </div>

          <!-- Info Grid -->
          <div class="info-box">
            <div style="display: flex; align-items: center;">
              <span style="min-width: 95px; font-size: 13px; font-weight: 700; color: #475569;">Invoice No:</span>
              <span style="font-size: 13px; font-weight: 700; color: #0f172a;">${invNo}</span>
            </div>
            <div style="display: flex; align-items: center;">
              <span style="min-width: 85px; font-size: 13px; font-weight: 700; color: #475569;">Date:</span>
              <span style="font-size: 13px; font-weight: 700; color: #0f172a;">${dateStr}</span>
            </div>
            <div style="display: flex; align-items: center;">
              <span style="min-width: 95px; font-size: 13px; font-weight: 700; color: #475569;">Table No:</span>
              <span style="font-size: 13px; font-weight: 700; color: #0f172a;">${tableNo}</span>
            </div>
            <div style="display: flex; align-items: center;">
              <span style="min-width: 85px; font-size: 13px; font-weight: 700; color: #475569;">Payment:</span>
              <span style="font-size: 13px; font-weight: 700; color: #0f172a;">${payMethodStr}</span>
            </div>
          </div>

          <!-- Table -->
          <table>
            <colgroup>
              <col style="width: 15%;" />
              <col style="width: 43%;" />
              <col style="width: 10%;" />
              <col style="width: 16%;" />
              <col style="width: 16%;" />
            </colgroup>
            <thead>
              <tr>
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

          <!-- Totals Card -->
          <div class="totals-card">
            <div style="padding: 12px 18px; display: flex; flex-direction: column; gap: 8px;">
              <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; color: #334155;">
                <span>Taxable Value</span>
                <span style="font-weight: 800; color: #0f172a;">${subtotal.toFixed(2)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 13px; color: #475569;">
                <span>CGST @2.5%</span>
                <span style="font-weight: 600; color: #0f172a;">${cgst.toFixed(2)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 13px; color: #475569;">
                <span>SGST @2.5%</span>
                <span style="font-weight: 600; color: #0f172a;">${sgst.toFixed(2)}</span>
              </div>
            </div>
            <div style="background: #fff2ea; border-top: 1.5px solid #fed7aa; padding: 12px 18px; display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 15px; font-weight: 800; color: #0f172a;">Total Value</span>
              <span style="font-size: 20px; font-weight: 900; color: #ff5a1f;">₹${total}</span>
            </div>
          </div>

          <!-- Footer -->
          <div class="footer-note">
            <div style="flex: 1; max-width: 120px; height: 1px; background: #cbd5e1;"></div>
            <span style="font-style: italic; font-family: 'Brush Script MT', 'Outfit', cursive, sans-serif; font-size: 20px; color: #ff5a1f; font-weight: 700; letter-spacing: 0.5px;">
              Thank you, visit again!
            </span>
            <div style="flex: 1; max-width: 120px; height: 1px; background: #cbd5e1;"></div>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  // Print Tax Invoice Popup Handler (Opens centered on screen)
  const handlePrintInvoicePopup = (invoice) => {
    const htmlContent = generateTaxInvoiceHtml(invoice);
    const script = `<script>window.onload = function() { setTimeout(function(){ window.print(); }, 100); }; window.onafterprint = function() { try{ window.close(); }catch(e){} };</script>`;
    openCenteredPrintWindow(htmlContent + script, 'Tax Invoice', 760, 840);
  };

  // Download Invoice HTML Handler
  const handleDownloadInvoicePopup = (bill) => {
    const htmlContent = generateTaxInvoiceHtml(bill);
    const invNo = bill.invoiceNo || bill.invoiceNumber || bill.id || 'INV-Doc';
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TaxInvoice-${String(invNo).replace(/[^a-zA-Z0-9_-]/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    ShowNotifications.showAlertNotification("Tax Invoice downloaded successfully!", true);
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

      {/* FILTER BAR: DINING TABLE, CUSTOMER, CASHIER/STAFF & SEARCH */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '12px',
        alignItems: 'flex-end',
        marginBottom: '20px',
        background: '#ffffff',
        padding: '16px',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)'
      }}>
        {/* Search */}
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, marginBottom: '4px', color: '#64748b', textTransform: 'uppercase' }}>Search</label>
          <input
            type="search"
            data-search="true"
            placeholder="Search Bill No / Order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value.replace(/\s+/g, ''))}
            onKeyDown={(e) => { if (e.key === ' ' || e.code === 'Space') e.preventDefault(); }}
            style={{ width: '100%', height: '38px', padding: '0 12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '13px' }}
          />
        </div>

        {/* Dining Table */}
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, marginBottom: '4px', color: '#64748b', textTransform: 'uppercase' }}>Dining Table</label>
          <SearchableSelect
            value={selectedTable}
            onChange={(e) => setSelectedTable(e.target.value)}
            options={tableOptions}
            placeholder="Select Table..."
          />
        </div>

        {/* Customer */}
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, marginBottom: '4px', color: '#64748b', textTransform: 'uppercase' }}>Customer</label>
          <input
            type="text"
            placeholder="Name or Phone..."
            value={customerFilter}
            onChange={(e) => setCustomerFilter(e.target.value)}
            style={{ width: '100%', height: '38px', padding: '0 12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '13px' }}
          />
        </div>

        {/* Cashier / Staff */}
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, marginBottom: '4px', color: '#64748b', textTransform: 'uppercase' }}>Cashier / Staff</label>
          <SearchableSelect
            value={selectedStaff}
            onChange={(e) => setSelectedStaff(e.target.value)}
            options={staffOptions}
            placeholder="Select Staff..."
          />
        </div>
      </div>

      {/* CURRENT BILLING LIST TABLE */}
      <div className="billing-table-card">
        <div className="billing-table-responsive">
          <table className="billing-table" style={{ minWidth: '1350px' }}>
            <colgroup>
              <col style={{ width: '60px' }} />   {/* 1. S.NO */}
              <col style={{ width: '130px' }} />  {/* 2. BILL NO. */}
              <col style={{ width: '130px' }} />  {/* 3. ORDER ID */}
              <col style={{ width: '115px' }} />  {/* 4. ORDER TYPE */}
              <col style={{ width: '170px' }} />  {/* 5. TABLE */}
              <col style={{ width: '160px' }} />  {/* 6. BILL DATE & TIME */}
              <col style={{ width: '135px' }} />  {/* 7. BILL AMOUNT */}
              <col style={{ width: '135px' }} />  {/* 8. PAID AMOUNT */}
              <col style={{ width: '135px' }} />  {/* 9. BALANCE AMOUNT */}
              <col style={{ width: '130px' }} />  {/* 10. PAYMENT STATUS */}
              <col style={{ width: '145px' }} />  {/* 11. ACTIONS */}
            </colgroup>
            <thead>
              <tr>
                <th style={{ textAlign: 'center' }}>S.NO</th>
                <th style={{ textAlign: 'left' }}>BILL NO.</th>
                <th style={{ textAlign: 'left' }}>ORDER ID</th>
                <th style={{ textAlign: 'center' }}>ORDER TYPE</th>
                <th style={{ textAlign: 'center' }}>TABLE</th>
                <th style={{ textAlign: 'center' }}>BILL DATE & TIME</th>
                <th style={{ textAlign: 'right' }}>BILL AMOUNT</th>
                <th style={{ textAlign: 'right' }}>PAID AMOUNT</th>
                <th style={{ textAlign: 'right' }}>BALANCE AMOUNT</th>
                <th style={{ textAlign: 'center' }}>PAYMENT STATUS</th>
                <th style={{ textAlign: 'center' }} className="sticky-actions-header">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {paginatedBills.map((bill, index) => {
                const isPaid = (bill.status || bill.paymentStatus || '').toLowerCase() === 'paid';
                const billNo = bill.billNo || bill.billNumber || '-';
                const rawItems = bill.items || [];
                const subtotal = bill.subtotal !== undefined ? Number(bill.subtotal) : rawItems.reduce((acc, curr) => acc + (Number(curr.amount) || ((Number(curr.qty || 1)) * (Number(curr.rate || curr.price || 0)))), 0);
                const tax = bill.tax !== undefined ? Number(bill.tax) : subtotal * 0.05;
                const billAmount = Number(bill.billAmount ?? bill.total ?? bill.amount) || (subtotal + tax);
                const paidAmount = isPaid ? billAmount : (Number(bill.paidAmount) || 0);
                const balanceAmount = bill.balanceAmount !== undefined ? Number(bill.balanceAmount) : Math.max(0, billAmount - paidAmount);

                const dateStr = bill.date || formatDateDMY(bill.billDateTime || bill.createdAt || new Date());
                const timeStr = bill.time || (bill.billDateTime ? new Date(bill.billDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (bill.createdAt ? new Date(bill.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'));

                const currentBill = {
                  ...bill,
                  billNo,
                  subtotal,
                  tax,
                  discount: Number(bill.discount || 0),
                  billAmount,
                  total: billAmount,
                  items: rawItems,
                  orderId: bill.orderId || bill.order_id || '-',
                  orderType: bill.orderType || 'Dine-In',
                  table: bill.table || (bill.tableNo ? `Table ${bill.tableNo}` : '-'),
                  date: dateStr,
                  time: timeStr,
                  paidAmount,
                  balanceAmount,
                  status: isPaid ? 'Paid' : (bill.status || 'Unpaid'),
                  paymentStatus: isPaid ? 'Paid' : (bill.paymentStatus || 'Unpaid'),
                  cashier: bill.cashier || bill.staff || '-',
                  staff: bill.cashier || bill.staff || '-'
                };

                return (
                  <tr key={bill.tableId || bill._id || index}>
                    <td style={{ textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#64748b' }}>
                      {bill.sNo || (page * limit + index + 1)}
                    </td>
                    <td style={{ textAlign: 'left', fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                      {billNo}
                    </td>
                    <td style={{ textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                      {bill.orderId || bill.order_id || '-'}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, background: '#eff6ff', color: '#2563eb' }}>
                        {bill.orderType || 'Dine-In'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 700, color: '#ea580c', fontSize: '13px' }}>
                      {bill.table ? (String(bill.table).includes('Table') ? bill.table : `Table ${bill.table}`) : (bill.tableNo ? `Table ${bill.tableNo}` : '-')}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: 600, fontSize: '12px', color: '#0f172a', lineHeight: 1.2 }}>{dateStr}</div>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '3px', lineHeight: 1.2 }}>{timeStr}</div>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 800, color: '#0f172a', fontSize: '13px', fontVariantNumeric: 'tabular-nums' }}>
                      ₹{billAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#16a34a', fontSize: '13px', fontVariantNumeric: 'tabular-nums' }}>
                      ₹{paidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: balanceAmount > 0 ? '#ef4444' : '#64748b', fontSize: '13px', fontVariantNumeric: 'tabular-nums' }}>
                      ₹{balanceAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 800,
                        backgroundColor: isPaid ? '#dcfce7' : '#fef2f2',
                        color: isPaid ? '#166534' : '#dc2626',
                        border: isPaid ? '1px solid #86efac' : '1px solid #fecaca'
                      }}>
                        {isPaid ? 'Paid' : 'Unpaid'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }} className="sticky-actions-cell">
                      <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center', justifyContent: 'center' }}>
                        {/* 1. View Bill (Icon without text) */}
                        {canView && (
                        <button
                          type="button"
                          onClick={() => setViewingBill(currentBill)}
                          title="View Bill"
                          aria-label="View Bill"
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            background: '#f8fafc',
                            color: '#334155',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <EyeIcon size={15} color="#334155" />
                        </button>
                        )}

                        {!isPaid ? (
                          <>
                            {/* 2. Print Bill (Icon without text) */}
                            <button
                              type="button"
                              onClick={() => handlePrintBillPopup(currentBill)}
                              title="Print Bill"
                              aria-label="Print Bill"
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '6px',
                                border: '1px solid #bfdbfe',
                                background: '#eff6ff',
                                color: '#2563eb',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <PrinterIcon size={15} color="#2563eb" />
                            </button>
                            {/* 3. Collect Payment (Icon without text) */}
                            {canEdit && (
                            <button
                              type="button"
                              onClick={() => handleOpenCollectPayment(currentBill)}
                              title="Collect Payment"
                              aria-label="Collect Payment"
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '6px',
                                border: 'none',
                                background: '#ff5a1f',
                                color: '#ffffff',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <CreditCardIcon size={15} color="#ffffff" />
                            </button>
                            )}
                          </>
                        ) : (
                          <>
                            {/* 4. Print Invoice (Icon without text) */}
                            <button
                              type="button"
                              onClick={() => handlePrintInvoicePopup(currentBill)}
                              title="Print Invoice"
                              aria-label="Print Invoice"
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
                              <PrinterIcon size={15} color="#16a34a" />
                            </button>
                            {/* 5. Download Invoice (Icon without text) */}
                            <button
                              type="button"
                              onClick={() => handleDownloadInvoicePopup(currentBill)}
                              title="Download Invoice"
                              aria-label="Download Invoice"
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '6px',
                                border: '1px solid #fed7aa',
                                background: '#fff7ed',
                                color: '#ea580c',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <DownloadIcon size={15} color="#ea580c" />
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
                  <td colSpan="11" style={{ textAlign: 'center', padding: '48px 16px', color: '#64748b', fontSize: '13px' }}>
                    No active bills found for the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 20px',
          background: '#ffffff',
          borderTop: '1px solid #e2e8f0',
          boxSizing: 'border-box'
        }}>
          <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
            Showing {totalBillsCount === 0 ? 0 : page * limit + 1} to {Math.min((page + 1) * limit, totalBillsCount)} of {totalBillsCount} bills
          </span>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage(p => Math.max(0, p - 1))}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                border: '1px solid #e2e8f0',
                background: page === 0 ? '#f8fafc' : '#ffffff',
                color: page === 0 ? '#cbd5e1' : '#334155',
                cursor: page === 0 ? 'not-allowed' : 'pointer',
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
              disabled={page >= totalPages - 1 || totalPages === 0}
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                border: '1px solid #e2e8f0',
                background: (page >= totalPages - 1 || totalPages === 0) ? '#f8fafc' : '#ffffff',
                color: (page >= totalPages - 1 || totalPages === 0) ? '#cbd5e1' : '#334155',
                cursor: (page >= totalPages - 1 || totalPages === 0) ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* VIEW BILL MODAL (Exact Thermal Receipt UI) */}
      <Modal isOpen={!!viewingBill} onClose={() => setViewingBill(null)} title="Bill Receipt" maxWidth="430px">
        {viewingBill && (
          <ReceiptCard
            data={viewingBill}
            activeRestaurant={activeRestaurant}
            onPrint={() => handlePrintBillPopup(viewingBill)}
            onDownload={() => handleDownloadInvoicePopup(viewingBill)}
            onCollectPayment={() => {
              const b = viewingBill;
              setViewingBill(null);
              handleOpenCollectPayment(b);
            }}
            isPaid={(viewingBill.status || viewingBill.paymentStatus || '').toLowerCase() === 'paid'}
          />
        )}
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

      {/* TAX INVOICE MODAL (Exact Thermal Receipt UI) */}
      <Modal isOpen={!!invoiceModalBill} onClose={() => setInvoiceModalBill(null)} title="Tax Invoice Receipt" maxWidth="430px">
        {invoiceModalBill && (
          <ReceiptCard
            data={invoiceModalBill}
            activeRestaurant={activeRestaurant}
            onPrint={() => handlePrintInvoicePopup(invoiceModalBill)}
            onDownload={() => handleDownloadInvoicePopup(invoiceModalBill)}
            isPaid={true}
          />
        )}
      </Modal>
    </section>
  );
}