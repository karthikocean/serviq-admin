import React, { useState, useEffect, useMemo } from 'react';
import { Badge } from './Badge';
import { Modal } from './Modal';
import ShowNotifications from '../helper/ShowNotifications.js';
import SearchableSelect from './SearchableSelect.jsx';
import BillingApi from '../api/Billing.js';
import OrderApi from '../api/Order.js';
import { formatDateDMY } from '../helper/DateHelper.js';
import { isMongoId } from '../config/initialData.js';
import ReceiptCard, { generateReceiptHtml, openCenteredPrintWindow, STANDARD_PRINT_WIDTH, STANDARD_PRINT_HEIGHT } from './ReceiptTemplate.jsx';

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
  availableTables = [],
  billingPaymentMethod = 'UPI',
  setBillingPaymentMethod,
  fetchBillingData,
  triggerRefresh,
  selectedBranchId,
  currentUser = {},
  hasPermission,
  searchTerm: propSearchTerm,
  setSearchTerm: propSetSearchTerm,
  selectedTable: propSelectedTable,
  setSelectedTable: propSetSelectedTable,
  page: propPage,
  setPage: propSetPage,
  limit: propLimit = 10,
  totalItems: propTotalItems = 0,
  onBillPaid
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
  const [paymentSuccessTrigger, setPaymentSuccessTrigger] = useState(0);

  // useEffect invoked whenever payment completes to fetch latest correct status from backend
  useEffect(() => {
    if (paymentSuccessTrigger > 0) {
      if (typeof fetchBillingData === 'function') {
        fetchBillingData();
      }
      if (typeof triggerRefresh === 'function') {
        triggerRefresh();
      }

      // Supplementary sync fetch after 400ms to guarantee database persistence
      const syncTimer = setTimeout(() => {
        if (typeof fetchBillingData === 'function') {
          fetchBillingData();
        }
        if (typeof triggerRefresh === 'function') {
          triggerRefresh();
        }
      }, 400);

      return () => clearTimeout(syncTimer);
    }
  }, [paymentSuccessTrigger]);

  // Filters State: Dining Table, Customer, Cashier/Staff, and Search
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const searchTerm = propSearchTerm !== undefined ? propSearchTerm : localSearchTerm;
  const setSearchTerm = propSetSearchTerm || setLocalSearchTerm;

  const [localSelectedTable, setLocalSelectedTable] = useState('All');
  const selectedTable = propSelectedTable !== undefined ? propSelectedTable : localSelectedTable;
  const setSelectedTable = propSetSelectedTable || setLocalSelectedTable;

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
  }, [searchTerm, selectedTable]);

  const displayBillingData = Array.isArray(billingData) ? billingData : [];

  // Table options derived from availableTables, activeRestaurant, and billing data
  // Option value MUST be the table's MongoDB ObjectId (_id) to avoid Cast to ObjectId failure on backend
  const tableOptions = useMemo(() => {
    const map = new Map(); // id -> { value, label, code, tableNumber }

    const registerTable = (tbl) => {
      if (!tbl) return;
      const mongoId = tbl._id || (isMongoId(String(tbl.id || '')) ? tbl.id : null);
      if (mongoId) {
        const idStr = String(mongoId);
        const tNum = tbl.tableNumber || tbl.tableNo || tbl.name || tbl.tableId;
        const cleanName = tNum ? (String(tNum).startsWith('Table') ? String(tNum) : `Table ${tNum}`) : `Table`;
        const codeSuffix = tbl.tableId && String(tbl.tableId) !== String(tNum) ? ` (${tbl.tableId})` : '';
        map.set(idStr, {
          value: idStr,
          label: `${cleanName}${codeSuffix}`,
          code: tbl.tableId,
          tableNumber: String(tbl.tableNumber || tbl.tableNo || '')
        });
      }
    };

    if (Array.isArray(availableTables)) {
      availableTables.forEach(registerTable);
    }

    if (Array.isArray(activeRestaurant?.tables)) {
      activeRestaurant.tables.forEach(registerTable);
    }

    displayBillingData.forEach(b => {
      if (typeof b.tableId === 'object' && b.tableId !== null) {
        registerTable(b.tableId);
      } else {
        const mId = isMongoId(String(b.tableId || '')) ? b.tableId : (isMongoId(String(b.rawTableId || '')) ? b.rawTableId : null);
        if (mId && !map.has(String(mId))) {
          const tDisplay = b.table || b.tableNumber || b.tableNo || 'Table';
          const cleanName = String(tDisplay).startsWith('Table') ? String(tDisplay) : `Table ${tDisplay}`;
          map.set(String(mId), {
            value: String(mId),
            label: cleanName,
            code: b.tableId,
            tableNumber: String(b.tableNumber || b.tableNo || '')
          });
        }
      }
    });

    const entries = Array.from(map.values());
    entries.sort((a, b) => {
      const numA = parseInt(a.label.replace(/\D/g, ''), 10);
      const numB = parseInt(b.label.replace(/\D/g, ''), 10);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.label.localeCompare(b.label);
    });

    return [
      { value: 'All', label: 'All Tables' },
      ...entries
    ];
  }, [availableTables, activeRestaurant, displayBillingData]);

  // If selectedTable is set to a string code (like TBL-SCB-003) instead of ObjectId, auto-map it to its _id
  useEffect(() => {
    if (selectedTable && selectedTable !== 'All' && !isMongoId(String(selectedTable))) {
      const match = tableOptions.find(opt => opt.code === selectedTable || opt.label.includes(selectedTable) || opt.tableNumber === selectedTable);
      if (match && isMongoId(String(match.value))) {
        setSelectedTable(match.value);
      }
    }
  }, [selectedTable, tableOptions, setSelectedTable]);



  // Strict rule: Only bills with Unpaid status AND Completed order status must show in Current Billing
  const isUnpaidBill = (b) => {
    if (!b) return false;
    const payStatusStr = String(b.paymentStatus || b.payment_status || b.billingStatus || '').toLowerCase().trim();
    const billAmt = Number(b.billAmount ?? b.total ?? b.amount ?? 0);
    const paidAmt = Number(b.paidAmount ?? b.paid ?? 0);
    const balAmt = b.balanceAmount !== undefined ? Number(b.balanceAmount) : Math.max(0, billAmt - paidAmt);

    const isPaid = 
      payStatusStr === 'paid' ||
      b.isPaid === true ||
      b.paid === true ||
      b.is_paid === true ||
      (paidAmt >= billAmt && billAmt > 0) ||
      (balAmt <= 0 && paidAmt > 0);

    if (isPaid) return false;

    // Check Order Status: must be Completed (or served/done)
    let ordStatus = String(b.orderStatus || b.order_status || b.orderState || '').toLowerCase().trim();
    if (!ordStatus && typeof b.order === 'object' && b.order !== null) {
      ordStatus = String(b.order?.status || b.order?.orderStatus || '').toLowerCase().trim();
    }
    if (!ordStatus && Array.isArray(b.orders) && b.orders.length > 0) {
      ordStatus = String(b.orders[0]?.status || b.orders[0]?.orderStatus || '').toLowerCase().trim();
    }
    if (!ordStatus && Array.isArray(activeRestaurant?.orders)) {
      const cleanOrdId = String(b.orderId || b.order_id || b.rawOrderId || b._id || b.id || '').trim().replace(/^(#|ORD-|ord-)/i, '');
      const matchedOrd = activeRestaurant.orders.find(o => {
        const oClean = String(o._id || o.id || o.orderId || '').trim().replace(/^(#|ORD-|ord-)/i, '');
        return oClean && oClean === cleanOrdId;
      });
      if (matchedOrd) {
        ordStatus = String(matchedOrd.status || matchedOrd.orderStatus || '').toLowerCase().trim();
      }
    }
    if (!ordStatus) {
      const orig = String(b.originalStatus || b.originalOrderStatus || '').toLowerCase().trim();
      if (['new', 'preparing', 'ready', 'served', 'completed', 'done', 'cancelled'].includes(orig)) {
        ordStatus = orig;
      }
    }

    if (ordStatus) {
      const isCompleted = ordStatus === 'completed' || ordStatus === 'served' || ordStatus === 'done';
      if (!isCompleted) return false;
    }

    return true;
  };

  const filteredBills = displayBillingData.filter(isUnpaidBill);
  const paginatedBills = filteredBills;

  const totalBillsCount = propTotalItems !== undefined && propTotalItems >= 0 ? filteredBills.length : filteredBills.length;
  const totalPages = Math.max(1, Math.ceil(totalBillsCount / limit));

  useEffect(() => {
    if (page >= totalPages && totalPages > 0) {
      setPage(Math.max(0, totalPages - 1));
    }
  }, [totalPages, page]);

  const getPageNumbers = () => {
    if (totalBillsCount === 0) return [];
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

    // 1. Resolve MongoDB ObjectId for Branch
    let resolvedBranchId = null;
    const branchCandidates = [
      paymentModalBill.branchId,
      typeof paymentModalBill.branch === 'object' ? paymentModalBill.branch?._id || paymentModalBill.branch?.id : paymentModalBill.branch,
      selectedBranchId,
      activeRestaurant?.branches?.[0]?._id,
      activeRestaurant?.branches?.[0]?.id,
      currentUser?.branchId?._id,
      currentUser?.branchId
    ];

    for (const b of branchCandidates) {
      if (b && isMongoId(String(b))) {
        resolvedBranchId = String(b);
        break;
      }
    }

    if (!resolvedBranchId) {
      const bFound = (activeRestaurant?.branches || []).find(b => 
        String(b.id || b._id) === String(selectedBranchId) ||
        String(b.branchCode) === String(selectedBranchId) ||
        String(b.branchName || b.name) === String(selectedBranchId)
      );
      if (bFound && (bFound._id || bFound.id)) {
        resolvedBranchId = String(bFound._id || bFound.id);
      }
    }

    // 2. Resolve MongoDB ObjectId for Table
    let resolvedTableId = null;
    const tableCandidates = [
      paymentModalBill.tableId,
      paymentModalBill.table_id,
      paymentModalBill.rawTableId,
      paymentModalBill._id,
      paymentModalBill.id
    ];

    for (const t of tableCandidates) {
      if (t && isMongoId(String(t))) {
        resolvedTableId = String(t);
        break;
      }
    }

    if (!resolvedTableId) {
      const targetTblStr = String(paymentModalBill.table || paymentModalBill.tableNumber || paymentModalBill.tableId || '')
        .replace(/^Table\s*/i, '')
        .trim();
      const matchedTable = 
        (availableTables || []).find(t => 
          String(t._id || '') === String(paymentModalBill.tableId) ||
          String(t.id || '') === String(paymentModalBill.tableId) ||
          String(t.tableId || '') === String(paymentModalBill.tableId) ||
          String(t.tableNumber || t.tableNo || '').trim() === targetTblStr ||
          String(t.name || '').trim() === targetTblStr
        ) ||
        (activeRestaurant?.tables || []).find(t => 
          String(t._id || '') === String(paymentModalBill.tableId) ||
          String(t.id || '') === String(paymentModalBill.tableId) ||
          String(t.tableId || '') === String(paymentModalBill.tableId) ||
          String(t.tableNumber || t.tableNo || '').trim() === targetTblStr ||
          String(t.name || '').trim() === targetTblStr
        );
      if (matchedTable) {
        resolvedTableId = String(matchedTable._id || (isMongoId(String(matchedTable.id || '')) ? matchedTable.id : ''));
      }
    }

    if (!resolvedTableId) {
      resolvedTableId = paymentModalBill.tableId || paymentModalBill._id || paymentModalBill.id;
    }

    if (!resolvedBranchId) {
      ShowNotifications.showAlertNotification("Branch ID is required to process table billing.", false);
      setIsProcessingPayment(false);
      return;
    }
    if (!resolvedTableId) {
      ShowNotifications.showAlertNotification("Table ID is required to process table billing.", false);
      setIsProcessingPayment(false);
      return;
    }

    const normalizedPaymentMethod = (payMethod || 'cash').toLowerCase();

    // Ensure items is strictly an array (even if incoming was an object)
    const rawItems = Array.isArray(paymentModalBill.items)
      ? paymentModalBill.items
      : (paymentModalBill.items && typeof paymentModalBill.items === 'object' ? Object.values(paymentModalBill.items) : []);

    const formattedItems = rawItems.map(it => {
      const q = Number(it.qty ?? it.quantity ?? 1) || 1;
      const r = Number(it.rate ?? it.price ?? 0) || 0;
      const a = Number(it.amount ?? (q * r)) || (q * r);
      return {
        name: it.name || it.itemName || 'Item',
        qty: q,
        quantity: q,
        price: r,
        rate: r,
        amount: a,
        ...(it.menuId || it._id || it.id ? { menuId: it.menuId || it._id || it.id } : {})
      };
    });

    const calcSubtotal = paymentModalBill.subtotal != null
      ? Number(paymentModalBill.subtotal)
      : formattedItems.reduce((acc, curr) => acc + curr.amount, 0);

    const calcTax = paymentModalBill.tax != null
      ? Number(paymentModalBill.tax)
      : parseFloat((calcSubtotal * 0.05).toFixed(2));

    const totalVal = paymentModalBill.total != null
      ? Number(paymentModalBill.total)
      : (paymentModalBill.billAmount != null ? Number(paymentModalBill.billAmount) : (parseFloat(payAmount) || (calcSubtotal + calcTax)));

    const payload = {
      branchId: resolvedBranchId,
      tableId: resolvedTableId,
      paymentMethod: normalizedPaymentMethod,
      amount: parseFloat(payAmount) || (paymentModalBill.balanceAmount ?? totalVal),
      items: formattedItems,
      subtotal: Number(calcSubtotal) || 0,
      tax: Number(calcTax) || 0,
      total: Number(totalVal) || 0,
      ...(payRefNo && payRefNo.trim() ? { referenceNumber: payRefNo.trim() } : {})
    };

    try {
      const apiRes = await BillingApi.processTablePayment(payload);

      if (!apiRes || apiRes.status === false) {
        setIsProcessingPayment(false);
        return;
      }

      const backendData = apiRes.response?.data || apiRes.response || {};
      const generatedInvoiceNo = 
        backendData.invoiceNo || 
        backendData.invoiceNumber || 
        backendData.taxInvoiceNo || 
        backendData.billNo ||
        backendData.invoice?.invoiceNo ||
        paymentModalBill.invoiceNo || 
        paymentModalBill.billNo || 
        '-';

      const staffName = currentUser?.name || currentUser?.fullName || currentUser?.username || 'Staff';

      // Construct Invoice Data
      const updatedBill = {
        ...paymentModalBill,
        status: 'Paid',
        paymentStatus: 'Paid',
        paidAmount: parseFloat(payAmount) || (paymentModalBill.balanceAmount ?? paymentModalBill.total ?? 0),
        balanceAmount: 0,
        paymentMethod: payMethod,
        referenceNumber: payRefNo,
        invoiceNo: generatedInvoiceNo,
        billedBy: staffName,
        paidAt: new Date().toISOString()
      };

      if (typeof onBillPaid === 'function') {
        onBillPaid(paymentModalBill);
      }

      // Immediately move to Billing History in memory / activeRestaurant state
      if (activeRestaurant) {
        if (Array.isArray(activeRestaurant.billingHistory)) {
          const alreadyInHist = activeRestaurant.billingHistory.some(h => 
            (updatedBill._id && (h._id === updatedBill._id || h.id === updatedBill._id)) ||
            (updatedBill.billNo && (h.billNo === updatedBill.billNo || h.billNumber === updatedBill.billNo))
          );
          if (!alreadyInHist) {
            activeRestaurant.billingHistory = [updatedBill, ...activeRestaurant.billingHistory];
          }
        } else {
          activeRestaurant.billingHistory = [updatedBill];
        }

        // Also update matching order in activeRestaurant.orders to paid
        if (Array.isArray(activeRestaurant.orders)) {
          const targetOrdId = String(paymentModalBill.orderId || paymentModalBill.rawOrderId || paymentModalBill._id || paymentModalBill.id || '').replace(/^(#|ORD-|ord-)/i, '');
          activeRestaurant.orders = activeRestaurant.orders.map(o => {
            const oId = String(o._id || o.id || o.orderId || '').replace(/^(#|ORD-|ord-)/i, '');
            if (oId && oId === targetOrdId) {
              return {
                ...o,
                billingStatus: 'paid',
                paymentStatus: 'paid',
                isPaid: true
              };
            }
            return o;
          });
        }
      }

      if (typeof setBillingData === 'function') {
        // Immediately remove paid bill from Current Billing view
        setBillingData(prev => prev.filter(b => {
          const isTarget = (
            (paymentModalBill.id && (b.id === paymentModalBill.id || b._id === paymentModalBill.id)) ||
            (paymentModalBill._id && (b._id === paymentModalBill._id || b.id === paymentModalBill._id)) ||
            (paymentModalBill.billNo && (b.billNo === paymentModalBill.billNo || b.billNumber === paymentModalBill.billNo)) ||
            (paymentModalBill.orderId && b.orderId && b.orderId !== '-' && b.orderId === paymentModalBill.orderId) ||
            (resolvedTableId && (b.tableId === resolvedTableId || b.id === resolvedTableId || b._id === resolvedTableId)) ||
            (paymentModalBill.tableId && (b.tableId === paymentModalBill.tableId || b.id === paymentModalBill.tableId || b._id === paymentModalBill.tableId)) ||
            (paymentModalBill.table && b.table === paymentModalBill.table)
          );
          return !isTarget;
        }));
      }

      if (typeof setSelectedBillingTable === 'function') {
        setSelectedBillingTable(prev => {
          if (prev && (prev === paymentModalBill.tableId || prev === paymentModalBill._id || prev === resolvedTableId || prev === paymentModalBill.table)) {
            return '';
          }
          return prev;
        });
      }

      ShowNotifications.showAlertNotification(
        apiRes.response?.message || `Payment collected successfully!`,
        true
      );
      setPaymentModalBill(null);
      setInvoiceModalBill(updatedBill); // Show Tax Invoice Popup

      // Invoke useEffect to fetch the latest correct status from backend
      setPaymentSuccessTrigger(prev => prev + 1);
    } catch (err) {
      console.error("Failed to process table payment:", err);
      ShowNotifications.showAlertNotification(
        err?.response?.data?.message || err?.message || "Failed to collect payment",
        false
      );
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Open View Bill Modal & dynamically fetch Invoice if missing
  const handleOpenViewBill = async (bill) => {
    setViewingBill(bill);
    const hasValidInv = bill.invoiceNo && bill.invoiceNo !== '-' && String(bill.invoiceNo).startsWith('INV-');
    if (!hasValidInv) {
      try {
        const histRes = await BillingApi.getBillingHistory({
          branchId: selectedBranchId,
          tableId: bill.tableId || bill.table,
          search: (bill.orderId && bill.orderId !== '-') ? bill.orderId : bill.billNo,
          limit: 10
        });
        if (histRes?.status && histRes?.response) {
          const list = Array.isArray(histRes.response.data) ? histRes.response.data : (Array.isArray(histRes.response) ? histRes.response : []);
          const match = list.find(h => 
            (bill.orderId && bill.orderId !== '-' && (h.orderId === bill.orderId || h.order_id === bill.orderId)) ||
            (bill.billNo && bill.billNo !== '-' && (h.billNo === bill.billNo || h.billNumber === bill.billNo)) ||
            (h.table === bill.table || h.tableId === bill.tableId)
          );
          if (match) {
            const foundInvNo = match.invoiceNo || match.invoiceNumber || match.invoiceId || match.id || '';
            if (foundInvNo) {
              setViewingBill(prev => prev ? { ...prev, invoiceNo: foundInvNo, invoiceId: foundInvNo, isInvoice: true } : prev);
            }
          }
        }
      } catch (err) {
        console.warn("Could not fetch invoice for bill:", err);
      }
    }
  };

  // Print Bill Popup Handler (Centered Thermal Bill Print Window - Before Payment)
  const handlePrintBillPopup = (bill) => {
    const htmlContent = generateReceiptHtml({ ...bill, isPaid: false }, activeRestaurant, currentUser);
    openCenteredPrintWindow(htmlContent, `Print Bill - ${bill?.billNo || bill?.id || 'Doc'}`, STANDARD_PRINT_WIDTH, STANDARD_PRINT_HEIGHT);
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

  // Print Tax Invoice Popup Handler (After Payment)
  const handlePrintInvoicePopup = (invoice) => {
    const htmlContent = generateReceiptHtml({ ...invoice, isPaid: true }, activeRestaurant, currentUser);
    openCenteredPrintWindow(htmlContent, `Tax Invoice - ${invoice?.invoiceNo || invoice?.billNo || invoice?.id || 'Doc'}`, STANDARD_PRINT_WIDTH, STANDARD_PRINT_HEIGHT);
  };

  // Download Invoice/Bill HTML Handler
  const handleDownloadInvoicePopup = (bill) => {
    const isInvoice = (bill.status || bill.paymentStatus || '').toLowerCase() === 'paid' || bill.isInvoice;
    const htmlContent = generateReceiptHtml({ ...bill, isPaid: isInvoice }, activeRestaurant, currentUser);
    const invNo = bill.invoiceNo || bill.invoiceNumber || bill.billNo || bill.id || 'Doc';
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${isInvoice ? 'TaxInvoice' : 'Bill'}-${String(invNo).replace(/[^a-zA-Z0-9_-]/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    ShowNotifications.showAlertNotification(`${isInvoice ? 'Tax Invoice' : 'Bill'} downloaded successfully!`, true);
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

      {/* FILTER BAR: SEARCH & DINING TABLE */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
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
            onChange={(e) => setSearchTerm(e.target.value)}
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
      </div>

      {/* CURRENT BILLING LIST TABLE */}
      <div className="billing-table-card">
        <div className="billing-table-responsive">
          <table className="billing-table" style={{ minWidth: '1720px' }}>
            <colgroup>
              <col style={{ width: '65px' }} />
              <col style={{ width: '185px' }} />
              <col style={{ width: '175px' }} />
              <col style={{ width: '170px' }} />
              <col style={{ width: '130px' }} />
              <col style={{ width: '160px' }} />
              <col style={{ width: '150px' }} />
              <col style={{ width: '145px' }} />
              <col style={{ width: '155px' }} />
              <col style={{ width: '135px' }} />
              <col style={{ width: '135px' }} />
              <col style={{ width: '140px' }} />
            </colgroup>
            <thead>
              <tr>
                <th style={{ textAlign: 'center' }}>S.NO</th>
                <th style={{ textAlign: 'left', paddingLeft: '16px' }}>BILL NO.</th>
                <th style={{ textAlign: 'left', paddingLeft: '16px' }}>ORDER ID</th>
                <th style={{ textAlign: 'center' }}>ORDER TYPE</th>
                <th style={{ textAlign: 'center' }}>TABLE</th>
                <th style={{ textAlign: 'center' }}>BILL DATE & TIME</th>
                <th style={{ textAlign: 'right', paddingRight: '16px' }}>BILL AMOUNT</th>
                <th style={{ textAlign: 'right', paddingRight: '16px' }}>PAID AMOUNT</th>
                <th style={{ textAlign: 'right', paddingRight: '16px' }}>BALANCE AMOUNT</th>
                <th style={{ textAlign: 'center' }}>PAYMENT STATUS</th>
                <th style={{ textAlign: 'center' }}>ORDER STATUS</th>
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

                const rawInvoiceNo = bill.invoiceNo || bill.invoiceNumber || bill.invoiceId || (bill.invoice && typeof bill.invoice === 'object' ? (bill.invoice.invoiceNo || bill.invoice.invoiceNumber || bill.invoice.id) : bill.invoice) || '';
                const fallbackInvoiceNo = rawInvoiceNo || (billNo && billNo !== '-' ? (billNo.startsWith('INV-') ? billNo : `INV-${billNo.replace(/^BILL[-_]*/i, '')}`) : '');

                const currentBill = {
                  ...bill,
                  billNo,
                  invoiceNo: rawInvoiceNo || fallbackInvoiceNo,
                  invoiceId: rawInvoiceNo || fallbackInvoiceNo,
                  subtotal,
                  tax,
                  discount: Number(bill.discount || 0),
                  billAmount,
                  total: billAmount,
                  items: rawItems,
                  orderId: bill.orderId || bill.order_id || '-',
                  orderType: bill.orderType || 'Dine-In',
                  orderStatus: bill.orderStatus || bill.order_status || 'Completed',
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
                  <tr key={bill._id || bill.id || `${bill.tableId || 'tbl'}-${bill.orderId || bill.order_id || index}`}>
                    <td style={{ textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#64748b' }}>
                      {bill.sNo || (page * limit + index + 1)}
                    </td>
                    <td style={{ textAlign: 'left', fontSize: '13px', fontWeight: 800, color: '#0f172a', paddingLeft: '16px', letterSpacing: '0.2px' }}>
                      {billNo}
                    </td>
                    <td style={{ textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#475569', paddingLeft: '16px', letterSpacing: '0.2px' }}>
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
                    <td style={{ textAlign: 'right', fontWeight: 800, color: '#0f172a', fontSize: '13px', fontVariantNumeric: 'tabular-nums', paddingRight: '16px' }}>
                      ₹{billAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#16a34a', fontSize: '13px', fontVariantNumeric: 'tabular-nums', paddingRight: '16px' }}>
                      ₹{paidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: balanceAmount > 0 ? '#ef4444' : '#64748b', fontSize: '13px', fontVariantNumeric: 'tabular-nums', paddingRight: '16px' }}>
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
                    <td style={{ textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '3px 10px',
                        borderRadius: '10px',
                        fontSize: '11px',
                        fontWeight: 700,
                        backgroundColor: '#dcfce7',
                        color: '#15803d',
                        border: '1px solid #bbf7d0'
                      }}>
                        {currentBill.orderStatus || 'Completed'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }} className="sticky-actions-cell">
                      <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center', justifyContent: 'center' }}>
                        {/* 1. View Bill (Icon without text) */}
                        {canView && (
                        <button
                          type="button"
                          onClick={() => handleOpenViewBill(currentBill)}
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
                            {/* Print Invoice / Receipt */}
                            <button
                              type="button"
                              onClick={() => handlePrintInvoicePopup(currentBill)}
                              title="Print Invoice / Receipt"
                              aria-label="Print Invoice / Receipt"
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

                            {/* Disabled Payment Icon for Paid status */}
                            <button
                              type="button"
                              disabled
                              title="Payment Already Collected"
                              aria-label="Payment Already Collected"
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '6px',
                                border: '1px solid #e2e8f0',
                                background: '#f1f5f9',
                                color: '#94a3b8',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'not-allowed',
                                opacity: 0.6
                              }}
                            >
                              <CreditCardIcon size={15} color="#94a3b8" />
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

      {/* VIEW BILL MODAL (Sample Bill Format - Before Payment) */}
      <Modal isOpen={!!viewingBill} onClose={() => setViewingBill(null)} title="Bill Receipt" maxWidth="480px">
        {viewingBill && (
          <ReceiptCard
            data={viewingBill}
            activeRestaurant={activeRestaurant}
            currentUser={currentUser}
            isPaid={false}
            showActions={false}
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

      {/* TAX INVOICE MODAL (Sample Invoice Format - After Payment) */}
      <Modal isOpen={!!invoiceModalBill} onClose={() => setInvoiceModalBill(null)} title="Tax Invoice (After Payment)" maxWidth="480px">
        {invoiceModalBill && (
          <ReceiptCard
            data={invoiceModalBill}
            activeRestaurant={activeRestaurant}
            currentUser={currentUser}
            onPrint={() => handlePrintInvoicePopup(invoiceModalBill)}
            onDownload={() => handleDownloadInvoicePopup(invoiceModalBill)}
            isPaid={true}
          />
        )}
      </Modal>
    </section>
  );
}