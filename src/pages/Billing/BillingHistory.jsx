import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useAppState } from '../../config/AppContext';
import BillingHistoryPanel from '../../components/BillingHistoryPanel';
import BillingApi from '../../api/Billing';
import OrderApi from '../../api/Order';
import TableApi from '../../api/Table';
import UserApi from '../../api/User';
import apiClient from '../../config/index.js';
import ShowNotifications from '../../helper/ShowNotifications.js';
import { formatDateDMY } from '../../helper/DateHelper.js';
import { isBranchMatch } from '../../helper/BranchHelper.js';
import { isMongoId, initialBillingHistory } from '../../config/initialData';

export default function BillingHistory() {
  const { activeRestaurant, selectedBranchId, currentUser, hasPermission } = useAppState();

  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('All');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('All');
  const [paymentStatus, setPaymentStatus] = useState('Paid');
  const [orderType, setOrderType] = useState('All');
  const [selectedTable, setSelectedTable] = useState('All');
  const [customerFilter, setCustomerFilter] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('All');

  // Tables and Staff for Dropdowns
  const [availableTables, setAvailableTables] = useState([]);
  const [availableStaff, setAvailableStaff] = useState([]);

  // Pagination States
  const [page, setPage] = useState(0);
  const limit = 10;
  const [totalItems, setTotalItems] = useState(0);

  // Data States
  const [rawHistory, setRawHistory] = useState([]);
  const [apiSummary, setApiSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Tables and Staff from backend for dropdowns
  useEffect(() => {
    let isMounted = true;
    const fetchMetadata = async () => {
      try {
        const isSpecificBranch = selectedBranchId && selectedBranchId !== 'ALL' && selectedBranchId !== 'all' && selectedBranchId !== 'COMPANY' && selectedBranchId !== 'Company';
        const branchParam = isSpecificBranch ? { branchId: selectedBranchId } : {};

        const [tablesRes, staffRes] = await Promise.all([
          TableApi.getTables({ ...branchParam, limit: 0 }).catch(() => null),
          UserApi.getUsers({ ...branchParam, limit: 0 }).catch(() => null)
        ]);

        if (isMounted) {
          if (tablesRes?.status) {
            const tData = tablesRes.response?.data || tablesRes.response?.tables || tablesRes.response || [];
            if (Array.isArray(tData)) setAvailableTables(tData);
          }
          if (staffRes?.status) {
            const sData = staffRes.response?.data || staffRes.response?.users || staffRes.response || [];
            if (Array.isArray(sData)) setAvailableStaff(sData);
          }
        }
      } catch (e) {
        console.warn("Failed to fetch dropdown metadata:", e);
      }
    };
    fetchMetadata();
    return () => { isMounted = false; };
  }, [selectedBranchId]);
  useEffect(() => {
    setPage(0);
  }, [searchTerm, dateRange, customStartDate, customEndDate, selectedBranchId, selectedPayment, paymentStatus, orderType, selectedTable, customerFilter, selectedStaff]);

  // Safe mapping function for any invoice / order / bill record
  const mapItemToInvoice = (item, index = 0) => {
    const rawInvoice = item.invoiceId || item.invoiceNo || item.invoiceNumber || item.taxInvoiceNo || item.gstInvoiceNo || (item.invoice && typeof item.invoice === 'object' ? (item.invoice.invoiceNo || item.invoice.invoiceNumber || item.invoice.id) : item.invoice) || '';
    const rawBill = item.billNo || item.billNumber || '';

    let displayInvoiceId = rawInvoice ? String(rawInvoice).trim() : '';
    if (!displayInvoiceId) {
      if (rawBill) {
        displayInvoiceId = rawBill.startsWith('INV-') ? rawBill : `INV-${rawBill.replace(/^BILL[-_]*/i, '')}`;
      } else if (item.orderRefId || item.orderNumber || item.orderId) {
        const ord = String(item.orderRefId || item.orderNumber || item.orderId).replace(/^[#ORD-_]*/i, '');
        displayInvoiceId = `INV-${ord}`;
      } else if (item._id || item.id) {
        const rawId = String(item._id || item.id);
        displayInvoiceId = rawId.length === 24 ? `INV-${rawId.slice(-6).toUpperCase()}` : `INV-${rawId}`;
      } else {
        displayInvoiceId = `INV-${1000 + index + 1}`;
      }
    }

    let rawBillNo = rawBill ? String(rawBill).trim() : '';
    if (!rawBillNo) {
      rawBillNo = displayInvoiceId.startsWith('INV-') ? `BILL-${displayInvoiceId.replace(/^INV[-_]*/i, '')}` : displayInvoiceId;
    }

    const rawOrderId = item.orderRefId || item.orderNumber || item.orderId || (item.order?._id || item.order?.orderId || item.order?.orderNumber) || item._id || item.id || '';
    const displayOrderId = rawOrderId ? (String(rawOrderId).startsWith('#ORD-') ? String(rawOrderId) : (String(rawOrderId).startsWith('ORD-') ? `#${rawOrderId}` : (String(rawOrderId).length === 24 ? `#ORD-${String(rawOrderId).slice(-6).toUpperCase()}` : `#ORD-${rawOrderId}`))) : '-';

    const rawTableNum = item.tableNumber || item.tableNo || item.table || (typeof item.tableId === 'object' ? (item.tableId?.tableNumber || item.tableId?.tableNo) : item.tableId) || '';
    const cleanTable = rawTableNum ? String(rawTableNum).replace(/^Table\s*/i, '').trim() : '-';

    const rawDate = item.createdAt || item.date || item.createdDate || item.timestamp || item.updatedAt || new Date().toISOString();
    const dateStr = formatDateDMY(rawDate);
    const timeStr = item.time || (rawDate ? new Date(rawDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '');

    const totalAmount = Number(item.totalAmount ?? item.amount ?? item.total ?? item.grandTotal ?? item.billAmount ?? item.netAmount ?? 0);

    const rawMethod = String(item.paymentMethod || item.paymentMode || item.method || item.mode || item.payment?.method || item.payment?.mode || item.paymentType || 'UPI');
    const paymentMethod = rawMethod.toLowerCase() === 'upi' ? 'UPI' : (rawMethod.toLowerCase() === 'cash' ? 'Cash' : (rawMethod.toLowerCase() === 'card' ? 'Card' : (rawMethod.charAt(0).toUpperCase() + rawMethod.slice(1))));

    const staffName = item.staffName || item.waiterName || item.waiter || item.staff || (typeof item.waiterId === 'object' ? (item.waiterId?.name || item.waiterId?.staffName) : item.waiterId) || item.server || item.billedBy || '-';

    const customerName = item.customerName || item.customer?.name || item.clientName || item.guestName || (typeof item.customer === 'string' ? item.customer : '') || (item.order?.customerName || item.order?.customer?.name) || '';
    const customerPhone = item.customerPhone || item.customerMobile || item.phone || item.customer?.phone || item.customer?.mobile || (item.order?.customerPhone || item.order?.phone) || '';

    const status = item.paymentStatus || item.billingStatus || item.status || 'Paid';
    const orderType = item.orderType || item.type || item.order?.orderType || 'Dine-In';

    const rawItems = Array.isArray(item.items) ? item.items : (Array.isArray(item.orderItems) ? item.orderItems : []);
    const itemsList = rawItems.map(it => {
      const q = Number(it.qty ?? it.quantity ?? 1) || 1;
      const p = Number(it.price ?? it.rate ?? 0) || 0;
      const t = Number(it.total ?? it.amount ?? (q * p)) || 0;
      return {
        ...it,
        name: it.name || it.itemName || 'Item',
        qty: q,
        price: p,
        rate: p,
        total: t,
        amount: t
      };
    });

    const subtotal = Number(item.subtotal ?? item.subTotal ?? item.itemTotal ?? totalAmount);
    const tax = Number(item.tax ?? item.taxes ?? item.taxAmount ?? 0);
    const discount = Number(item.discount ?? item.discountAmount ?? 0);
    const charge = Number(item.charge ?? item.serviceCharge ?? 0);

    const cashierId = item.cashierId || item.staffId || item.waiterId || (typeof item.waiterId === 'object' ? item.waiterId?._id : undefined) || (typeof item.cashier === 'object' ? item.cashier?._id : undefined);

    return {
      _id: item._id || item.id,
      id: displayInvoiceId,
      invoiceId: displayInvoiceId,
      invoiceNo: displayInvoiceId,
      billNo: rawBillNo,
      orderId: displayOrderId,
      orderRefId: rawOrderId,
      orderType,
      table: cleanTable,
      tableId: item.tableId || cleanTable,
      tableNumber: rawTableNum,
      branchId: typeof item.branchId === 'object' && item.branchId !== null ? (item.branchId._id || item.branchId.id || '') : (item.branchId || item.branch || item.restaurantBranchId || (typeof item.tableId === 'object' ? item.tableId?.branchId : null) || ''),
      branch: item.branch || item.branchId || (typeof item.tableId === 'object' ? item.tableId?.branchId : null) || '',
      date: dateStr,
      time: timeStr,
      rawDate: new Date(rawDate),
      createdAt: rawDate,
      amount: totalAmount,
      totalAmount,
      total: totalAmount,
      paymentMethod,
      staff: staffName,
      staffName,
      cashierId,
      customerName,
      customerPhone,
      status: (String(status).toLowerCase() === 'paid' || String(status).toLowerCase() === 'completed') ? 'Paid' : 'Unpaid',
      paymentStatus: (String(status).toLowerCase() === 'paid' || String(status).toLowerCase() === 'completed') ? 'Paid' : 'Unpaid',
      items: itemsList,
      subtotal,
      tax,
      discount,
      charge
    };
  };

  // Debounced fetchHistory trigger
  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    let items = [];
    let summaryObj = null;
    let serverTotal = 0;

    let startDate = customStartDate || undefined;
    let endDate = customEndDate || undefined;

    const pad = (n) => String(n).padStart(2, '0');
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

    let apiDateRange = undefined;

    if (dateRange === 'Today') {
      apiDateRange = 'TODAY';
      startDate = todayStr;
      endDate = todayStr;
    } else if (dateRange === 'Yesterday') {
      apiDateRange = 'YESTERDAY';
      const yest = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const yestStr = `${yest.getFullYear()}-${pad(yest.getMonth() + 1)}-${pad(yest.getDate())}`;
      startDate = yestStr;
      endDate = yestStr;
    } else if (dateRange === 'This Week') {
      apiDateRange = 'THIS_WEEK';
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const weekStartStr = `${sevenDaysAgo.getFullYear()}-${pad(sevenDaysAgo.getMonth() + 1)}-${pad(sevenDaysAgo.getDate())}`;
      startDate = weekStartStr;
      endDate = todayStr;
    } else if (dateRange === 'This Month') {
      apiDateRange = 'THIS_MONTH';
      const year = now.getFullYear();
      const month = now.getMonth();
      const lastDay = new Date(year, month + 1, 0);
      startDate = `${year}-${pad(month + 1)}-01`;
      endDate = `${year}-${pad(month + 1)}-${pad(lastDay.getDate())}`;
    } else if (dateRange === 'Custom') {
      apiDateRange = 'CUSTOM';
      startDate = customStartDate || undefined;
      endDate = customEndDate || undefined;
    }

    let apiSuccess = false;
    try {
      const isSpecificBranch = selectedBranchId && selectedBranchId !== 'ALL' && selectedBranchId !== 'all' && selectedBranchId !== 'COMPANY' && selectedBranchId !== 'Company';

      // Resolve tableId: MUST send table._id (MongoDB ObjectId), NOT string like "TBL-SCB-003"
      let resolvedTableId = undefined;
      if (selectedTable && selectedTable !== 'All' && selectedTable !== 'ALL') {
        if (typeof selectedTable === 'object' && selectedTable !== null) {
          resolvedTableId = selectedTable._id || selectedTable.id;
        } else if (isMongoId(String(selectedTable))) {
          resolvedTableId = String(selectedTable);
        } else {
          const found =
            availableTables.find(t =>
              t.tableId === selectedTable ||
              String(t.tableNumber || t.tableNo) === String(selectedTable) ||
              t.name === selectedTable ||
              String(t.id) === String(selectedTable)
            ) ||
            (Array.isArray(activeRestaurant?.tables) ? activeRestaurant.tables.find(t =>
              t.tableId === selectedTable ||
              String(t.tableNumber || t.tableNo) === String(selectedTable) ||
              t.name === selectedTable
            ) : null);
          if (found && (found._id || isMongoId(String(found.id || '')))) {
            resolvedTableId = String(found._id || found.id);
          }
        }
      }

      // Resolve cashierId / waiterId: MUST send staff._id (MongoDB ObjectId), NOT string like "stf-01"
      let resolvedStaffId = undefined;
      if (selectedStaff && selectedStaff !== 'All' && selectedStaff !== 'ALL') {
        if (typeof selectedStaff === 'object' && selectedStaff !== null) {
          const sCandidate = selectedStaff._id || selectedStaff.id;
          if (isMongoId(String(sCandidate))) {
            resolvedStaffId = String(sCandidate);
          }
        } else if (isMongoId(String(selectedStaff))) {
          resolvedStaffId = String(selectedStaff);
        } else {
          // Resolve custom string code (e.g. stf-01, STF-01, or name) to staff._id ObjectId
          const found =
            availableStaff.find(s =>
              (s._id && isMongoId(String(s._id))) && (
                String(s._id) === String(selectedStaff) ||
                String(s.id) === String(selectedStaff) ||
                String(s.employeeCode || s.code) === String(selectedStaff) ||
                String(s.name || s.staffName || s.fullName) === String(selectedStaff)
              )
            ) ||
            (Array.isArray(activeRestaurant?.staff) ? activeRestaurant.staff.find(s =>
              (s._id && isMongoId(String(s._id))) && (
                String(s._id) === String(selectedStaff) ||
                String(s.id) === String(selectedStaff) ||
                String(s.employeeCode || s.code) === String(selectedStaff) ||
                String(s.name || s.staffName || s.fullName) === String(selectedStaff)
              )
            ) : null);
          if (found && found._id && isMongoId(String(found._id))) {
            resolvedStaffId = String(found._id);
          }
        }
      }

      const filters = {
        branchId: isSpecificBranch ? selectedBranchId : undefined,
        search: searchTerm ? searchTerm.trim() : undefined,
        tableId: resolvedTableId,
        table: resolvedTableId,
        customer: customerFilter ? customerFilter.trim() : undefined,
        cashierId: resolvedStaffId,
        waiterId: resolvedStaffId,
        staffId: resolvedStaffId,
        dateRange: apiDateRange,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        paymentMethod: selectedPayment && selectedPayment !== 'All' ? selectedPayment.toUpperCase() : undefined,
        paymentStatus: paymentStatus && paymentStatus !== 'All' ? paymentStatus : 'Paid',
        status: paymentStatus && paymentStatus !== 'All' ? paymentStatus : 'Paid',
        billingStatus: paymentStatus && paymentStatus !== 'All' ? paymentStatus : 'Paid',
        orderType: orderType && orderType !== 'All' ? orderType : undefined,
        page: 0,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };

      const result = await BillingApi.getBillingHistory(filters);
      if (result && result.status) {
        apiSuccess = true;
        const payload = result.response?.data || result.response || result.data;
        if (Array.isArray(payload)) {
          items = payload;
          serverTotal = payload.length;
        } else if (payload && typeof payload === 'object') {
          items = Array.isArray(payload.items) ? payload.items :
            Array.isArray(payload.data) ? payload.data :
              Array.isArray(payload.billingHistory) ? payload.billingHistory :
                Array.isArray(payload.history) ? payload.history :
                  Array.isArray(payload.orders) ? payload.orders : [];
          serverTotal = Number(payload.totalItems ?? payload.total ?? payload.count ?? items.length);
          if (payload.summary) {
            summaryObj = payload.summary;
          }
        }
      }
    } catch (e) {
      console.error('Failed to fetch billing history from API', e);
    }

    // Fall back to local active restaurant records or initial billing history if API returned no items
    if (!apiSuccess || items.length === 0) {
      let fallbackList = [];
      if (Array.isArray(activeRestaurant?.billingHistory) && activeRestaurant.billingHistory.length > 0) {
        fallbackList = activeRestaurant.billingHistory;
      } else if (Array.isArray(activeRestaurant?.orders) && activeRestaurant.orders.length > 0) {
        const paid = activeRestaurant.orders.filter(o => {
          const payStatus = String(o.billingStatus || o.paymentStatus || '').toLowerCase();
          if (payStatus === 'unpaid') return false;
          return payStatus === 'paid' || o.isPaid || o.status === 'paid' || o.status === 'done';
        });
        fallbackList = paid.length > 0 ? paid : [];
      } else if (Array.isArray(initialBillingHistory) && initialBillingHistory.length > 0) {
        fallbackList = initialBillingHistory;
      }

      if (items.length === 0 && fallbackList.length > 0) {
        let pool = fallbackList;

        if (isSpecificBranch) {
          pool = pool.filter(h => isBranchMatch(h, selectedBranchId, activeRestaurant?.branches || []));
        }

        if (searchTerm && searchTerm.trim()) {
          const st = searchTerm.trim().toLowerCase();
          pool = pool.filter(h =>
            String(h.id || h.invoiceId || h.invoiceNo || '').toLowerCase().includes(st) ||
            String(h.billNo || '').toLowerCase().includes(st) ||
            String(h.orderId || '').toLowerCase().includes(st) ||
            String(h.table || h.tableNumber || '').toLowerCase().includes(st) ||
            String(h.customerName || '').toLowerCase().includes(st)
          );
        }

        if (selectedTable && selectedTable !== 'All' && selectedTable !== 'ALL') {
          const st = String(selectedTable).toLowerCase();
          pool = pool.filter(h =>
            String(h.tableId || '').toLowerCase() === st ||
            String(h.table || '').toLowerCase().includes(st) ||
            String(h.tableNumber || '').toLowerCase() === st
          );
        }

        if (customerFilter && customerFilter.trim()) {
          const cf = customerFilter.trim().toLowerCase();
          pool = pool.filter(h =>
            String(h.customerName || '').toLowerCase().includes(cf) ||
            String(h.customerPhone || '').includes(cf)
          );
        }

        if (selectedStaff && selectedStaff !== 'All' && selectedStaff !== 'ALL') {
          const ss = String(selectedStaff).toLowerCase();
          pool = pool.filter(h =>
            String(h.staff || h.staffName || '').toLowerCase().includes(ss) ||
            String(h.cashierId || '').toLowerCase() === ss
          );
        }

        if (selectedPayment && selectedPayment !== 'All') {
          const sp = selectedPayment.toLowerCase();
          pool = pool.filter(h => String(h.paymentMethod || '').toLowerCase() === sp);
        }

        items = pool;
        serverTotal = pool.length;
      }
    }

    // Strict requirement: Only Paid bills should be displayed in Billing History
    const paidOnlyItems = items.filter(it => {
      const payStatus = String(it.paymentStatus || it.billingStatus || '').toLowerCase();
      if (payStatus === 'unpaid' || payStatus === 'pending' || payStatus === 'pending_payment') {
        return false;
      }
      const statusStr = String(it.status || '').toLowerCase();
      const isPaid =
        it.isPaid === true ||
        it.paid === true ||
        it.is_paid === true ||
        payStatus === 'paid' ||
        statusStr === 'paid' ||
        statusStr === 'done' ||
        (Number(it.paidAmount || 0) >= Number(it.billAmount || it.total || it.totalAmount || 0) && Number(it.billAmount || it.total || it.totalAmount || 0) > 0) ||
        (Number(it.balanceAmount || 0) <= 0 && Number(it.paidAmount || 0) > 0);
      return isPaid;
    });

    const mapped = paidOnlyItems.map((it, idx) => mapItemToInvoice(it, idx));
    setRawHistory(mapped);
    setTotalItems(serverTotal > 0 ? Math.min(serverTotal, mapped.length) : mapped.length);
    setApiSummary(summaryObj);
    setIsLoading(false);
  }, [
    activeRestaurant,
    selectedBranchId,
    searchTerm,
    dateRange,
    customStartDate,
    customEndDate,
    selectedPayment,
    paymentStatus,
    orderType,
    selectedTable,
    customerFilter,
    selectedStaff,
    page
  ]);

  // Debounce API calls on user typing / changing filters
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchHistory();
    }, 300);
    return () => clearTimeout(handler);
  }, [fetchHistory]);

  // Helper to match an item against the selected table
  const matchesTable = (it, selTable, tblOpts = []) => {
    if (!selTable || selTable === 'All' || selTable === 'ALL') return true;

    const selStr = String(selTable).trim().toLowerCase();
    const opt = tblOpts.find(o =>
      String(o.value).toLowerCase() === selStr ||
      String(o.code || '').toLowerCase() === selStr ||
      String(o.label || '').toLowerCase() === selStr ||
      String(o.tableNumber || '').toLowerCase() === selStr
    );

    const itId = String(typeof it.tableId === 'object' && it.tableId !== null ? (it.tableId._id || it.tableId.id || '') : (it.tableId || '')).trim().toLowerCase();
    const itTable = String(it.table || '').replace(/^Table\s*/i, '').trim().toLowerCase();
    const itTableNum = String(it.tableNumber || it.tableNo || '').replace(/^Table\s*/i, '').trim().toLowerCase();
    const itFullTable = String(it.table || '').trim().toLowerCase();

    // Direct equality or substring check
    if (itId && (itId === selStr || itId.includes(selStr) || selStr.includes(itId))) return true;
    if (itTable && (itTable === selStr || itTable.includes(selStr) || selStr.includes(itTable))) return true;
    if (itTableNum && (itTableNum === selStr || itTableNum.includes(selStr) || selStr.includes(itTableNum))) return true;
    if (itFullTable && (itFullTable === selStr || itFullTable.includes(selStr) || selStr.includes(itFullTable))) return true;

    // Check against all attributes from matched option
    if (opt) {
      const optVal = String(opt.value || '').trim().toLowerCase();
      const optCode = String(opt.code || '').trim().toLowerCase();
      const optLabel = String(opt.label || '').replace(/^Table\s*/i, '').trim().toLowerCase();
      const optNum = String(opt.tableNumber || '').replace(/^Table\s*/i, '').trim().toLowerCase();

      const targets = [optVal, optCode, optLabel, optNum].filter(Boolean);
      const itemCandidates = [itId, itTable, itTableNum, itFullTable].filter(Boolean);

      for (const target of targets) {
        for (const cand of itemCandidates) {
          if (target === cand || target.includes(cand) || cand.includes(target)) return true;
        }
      }

      // Digit-based match (e.g. "TBL-004" -> 4, "Table 4" -> 4, "04" -> 4)
      const optDigits = (optCode || optLabel || optNum).replace(/\D/g, '');
      const itDigits = (itTable || itTableNum || itId).replace(/\D/g, '');
      if (optDigits && itDigits && parseInt(optDigits, 10) === parseInt(itDigits, 10)) {
        return true;
      }
    }

    return false;
  };

  // Helper to match an item against the selected staff
  const matchesStaff = (it, selStaff, stfOpts = []) => {
    if (!selStaff || selStaff === 'All' || selStaff === 'ALL') return true;

    const selStr = String(selStaff).trim().toLowerCase();
    const opt = stfOpts.find(o =>
      String(o.value).toLowerCase() === selStr ||
      String(o.code || '').toLowerCase() === selStr ||
      String(o.name || '').toLowerCase() === selStr ||
      String(o.label || '').toLowerCase() === selStr
    );

    const itStaffId = String(it.cashierId || it.staffId || it.waiterId || '').trim().toLowerCase();
    const itStaffName = String(it.staff || it.staffName || '').trim().toLowerCase();

    if (itStaffId && (itStaffId === selStr || itStaffId.includes(selStr) || selStr.includes(itStaffId))) return true;
    if (itStaffName && (itStaffName === selStr || itStaffName.includes(selStr) || selStr.includes(itStaffName))) return true;

    if (opt) {
      const optVal = String(opt.value || '').trim().toLowerCase();
      const optCode = String(opt.code || '').trim().toLowerCase();
      const optName = String(opt.name || '').trim().toLowerCase();
      const optLabel = String(opt.label || '').trim().toLowerCase();

      const targets = [optVal, optCode, optName, optLabel].filter(Boolean);
      const itemCandidates = [itStaffId, itStaffName].filter(Boolean);

      for (const target of targets) {
        for (const cand of itemCandidates) {
          if (target === cand || target.includes(cand) || cand.includes(target)) return true;
        }
      }
    }

    return false;
  };

  // Derive unique Table options from available tables and history items
  const tableOptions = useMemo(() => {
    const map = new Map();

    const registerTable = (tbl) => {
      if (!tbl) return;
      const keyVal = tbl._id || tbl.id || tbl.tableId || tbl.tableNumber || tbl.tableNo || tbl.name;
      if (!keyVal) return;
      const keyStr = String(keyVal);
      const tNum = tbl.tableNumber || tbl.tableNo || tbl.name || tbl.tableId;
      const cleanName = tNum ? (String(tNum).startsWith('Table') ? String(tNum) : `Table ${tNum}`) : `Table ${keyStr}`;
      const codeSuffix = tbl.tableId && String(tbl.tableId) !== String(tNum) && !cleanName.includes(String(tbl.tableId)) ? ` (${tbl.tableId})` : '';

      if (!map.has(keyStr)) {
        map.set(keyStr, {
          value: keyStr,
          label: `${cleanName}${codeSuffix}`,
          code: String(tbl.tableId || ''),
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

    rawHistory.forEach(it => {
      if (typeof it.tableId === 'object' && it.tableId !== null) {
        registerTable(it.tableId);
      } else {
        const val = it.tableId || it.tableNumber || it.table;
        if (val && !map.has(String(val))) {
          const tDisplay = it.table || it.tableNumber || it.tableNo || val;
          const cleanName = String(tDisplay).startsWith('Table') ? String(tDisplay) : `Table ${tDisplay}`;
          map.set(String(val), {
            value: String(val),
            label: cleanName,
            code: String(it.tableId || ''),
            tableNumber: String(it.tableNumber || it.tableNo || '')
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
  }, [availableTables, activeRestaurant, rawHistory]);

  // Derive unique Cashier / Staff options
  const staffOptions = useMemo(() => {
    const map = new Map();

    const addStaffOption = (s) => {
      if (!s) return;
      const val = s._id || s.id || s.employeeCode || s.code || s.name;
      if (!val) return;
      const name = s.name || s.staffName || s.fullName || s.userName;
      const code = s.id || s.employeeCode || s.code;
      const label = name || `Staff (${String(val).slice(-4)})`;

      if (!map.has(String(val))) {
        map.set(String(val), { value: String(val), label, code, name });
      }
    };

    if (Array.isArray(availableStaff)) {
      availableStaff.forEach(addStaffOption);
    }
    if (Array.isArray(activeRestaurant?.staff)) {
      activeRestaurant.staff.forEach(addStaffOption);
    }
    rawHistory.forEach(it => {
      const sId = it.cashierId || it.staffId || it.waiterId;
      const name = it.staff || it.staffName;
      const val = sId || name;
      if (val && !map.has(String(val))) {
        map.set(String(val), {
          value: String(val),
          label: name || `Staff (${String(val).slice(-4)})`,
          code: sId || '',
          name: name || ''
        });
      }
    });

    const entries = Array.from(map.values());
    return [
      { value: 'All', label: 'All Staff' },
      ...entries
    ];
  }, [availableStaff, activeRestaurant, rawHistory]);

  // Reset pagination to first page whenever any filter criteria changes
  useEffect(() => {
    setPage(0);
  }, [
    searchTerm,
    dateRange,
    customStartDate,
    customEndDate,
    selectedPayment,
    paymentStatus,
    orderType,
    selectedTable,
    customerFilter,
    selectedStaff,
    selectedBranchId
  ]);

  // Client-side reactive filtering on rawHistory across all 8 filter criteria
  const filteredHistory = useMemo(() => {
    return rawHistory.filter(it => {
      // 1. Search Bill No / Order ID / Table / Customer / Dish name
      if (searchTerm && searchTerm.trim()) {
        const q = searchTerm.trim().toLowerCase();
        const matchesSearch =
          String(it.invoiceNo || it.invoiceId || it.id || '').toLowerCase().includes(q) ||
          String(it.billNo || '').toLowerCase().includes(q) ||
          String(it.orderId || it.orderRefId || '').toLowerCase().includes(q) ||
          String(it.table || it.tableNumber || '').toLowerCase().includes(q) ||
          String(it.customerName || '').toLowerCase().includes(q) ||
          String(it.customerPhone || '').toLowerCase().includes(q) ||
          String(it.staff || it.staffName || '').toLowerCase().includes(q) ||
          (Array.isArray(it.items) && it.items.some(dish => String(dish.name || '').toLowerCase().includes(q)));
        if (!matchesSearch) return false;
      }

      // 2. Dining Table Filter
      if (!matchesTable(it, selectedTable, tableOptions)) {
        return false;
      }

      // 3. Customer Filter
      if (customerFilter && customerFilter.trim()) {
        const cf = customerFilter.trim().toLowerCase();
        const matchesCustomer =
          String(it.customerName || '').toLowerCase().includes(cf) ||
          String(it.customerPhone || '').includes(cf);
        if (!matchesCustomer) return false;
      }

      // 4. Cashier / Staff Filter
      if (!matchesStaff(it, selectedStaff, staffOptions)) {
        return false;
      }

      // 5. Date Range Filter
      if (dateRange && dateRange !== 'All' && dateRange !== 'All Time') {
        const itDate = it.rawDate ? new Date(it.rawDate) : (it.createdAt ? new Date(it.createdAt) : null);
        if (itDate && !isNaN(itDate.getTime())) {
          const now = new Date();
          if (dateRange === 'Today') {
            if (itDate.toDateString() !== now.toDateString()) return false;
          } else if (dateRange === 'Yesterday') {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            if (itDate.toDateString() !== yesterday.toDateString()) return false;
          } else if (dateRange === 'This Week') {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            oneWeekAgo.setHours(0, 0, 0, 0);
            if (itDate < oneWeekAgo || itDate > now) return false;
          } else if (dateRange === 'This Month') {
            if (itDate.getMonth() !== now.getMonth() || itDate.getFullYear() !== now.getFullYear()) return false;
          } else if (dateRange === 'Custom') {
            if (customStartDate) {
              const start = new Date(customStartDate);
              start.setHours(0, 0, 0, 0);
              if (itDate < start) return false;
            }
            if (customEndDate) {
              const end = new Date(customEndDate);
              end.setHours(23, 59, 59, 999);
              if (itDate > end) return false;
            }
          }
        }
      }

      // 6. Payment Method Filter
      if (selectedPayment && selectedPayment !== 'All' && selectedPayment !== 'ALL' && selectedPayment !== 'All Methods') {
        if (String(it.paymentMethod || '').toLowerCase() !== String(selectedPayment).toLowerCase()) {
          return false;
        }
      }

      // 7. Payment Status Filter - Strictly ensure Paid bills in Billing History
      const itStatus = String(it.status || it.paymentStatus || '').toLowerCase();
      if (paymentStatus && paymentStatus !== 'All' && paymentStatus !== 'ALL' && paymentStatus !== 'All Statuses') {
        const targetStatus = String(paymentStatus).toLowerCase();
        if (itStatus !== targetStatus) {
          return false;
        }
      } else {
        if (itStatus !== 'paid' && it.isPaid !== true) {
          return false;
        }
      }

      // 8. Order Type Filter
      if (orderType && orderType !== 'All' && orderType !== 'ALL' && orderType !== 'All Types') {
        const itType = String(it.orderType || '').toLowerCase().replace(/[-_\s]/g, '');
        const targetType = String(orderType).toLowerCase().replace(/[-_\s]/g, '');
        if (itType !== targetType) {
          return false;
        }
      }

      // 9. Branch Filter: If 'All Branches' / 'COMPANY', show all data. If specific sub-branch, show ONLY that sub-branch's data.
      const isSpecificBranch = selectedBranchId && selectedBranchId !== 'ALL' && selectedBranchId !== 'All' && String(selectedBranchId).toUpperCase() !== 'COMPANY' && String(selectedBranchId).toLowerCase() !== 'all branches';
      if (isSpecificBranch) {
        let matchesBranch = isBranchMatch(it, selectedBranchId, activeRestaurant?.branches || []);
        if (!matchesBranch && (it.table || it.tableId)) {
          const tbl = availableTables.find(t =>
            String(t._id || t.id || '') === String(it.tableId || '') ||
            String(t.tableNumber || t.tableNo || '') === String(it.table || it.tableNumber || '') ||
            String(t.tableId || '') === String(it.tableId || '')
          ) || (Array.isArray(activeRestaurant?.tables) ? activeRestaurant.tables.find(t =>
            String(t._id || t.id || '') === String(it.tableId || '') ||
            String(t.tableNumber || t.tableNo || '') === String(it.table || it.tableNumber || '') ||
            String(t.tableId || '') === String(it.tableId || '')
          ) : null);
          if (tbl && (tbl.branchId || tbl.branch)) {
            matchesBranch = isBranchMatch(tbl.branchId || tbl.branch, selectedBranchId, activeRestaurant?.branches || []);
          }
        }
        if (!matchesBranch) return false;
      }

      return true;
    });
  }, [
    rawHistory,
    searchTerm,
    selectedTable,
    tableOptions,
    customerFilter,
    selectedStaff,
    staffOptions,
    dateRange,
    customStartDate,
    customEndDate,
    selectedPayment,
    paymentStatus,
    orderType,
    selectedBranchId,
    activeRestaurant?.branches,
    availableTables
  ]);

  const effectiveTotal = filteredHistory.length;
  const totalPages = Math.max(1, Math.ceil(effectiveTotal / limit));

  useEffect(() => {
    if (page >= totalPages && totalPages > 0) {
      setPage(Math.max(0, totalPages - 1));
    }
  }, [totalPages, page]);

  // Current page records sliced from filteredHistory
  const paginatedHistory = useMemo(() => {
    const start = page * limit;
    return filteredHistory.slice(start, start + limit);
  }, [filteredHistory, page, limit]);

  // Compute Summary directly from filtered results
  const summary = useMemo(() => {
    const totalSales = filteredHistory.reduce((sum, it) => sum + (Number(it.amount) || 0), 0);
    const cashTotal = filteredHistory.filter(it => String(it.paymentMethod || '').toLowerCase() === 'cash').reduce((sum, it) => sum + (Number(it.amount) || 0), 0);
    const upiTotal = filteredHistory.filter(it => String(it.paymentMethod || '').toLowerCase() === 'upi').reduce((sum, it) => sum + (Number(it.amount) || 0), 0);
    const cardTotal = filteredHistory.filter(it => String(it.paymentMethod || '').toLowerCase() === 'card').reduce((sum, it) => sum + (Number(it.amount) || 0), 0);

    return {
      totalSales,
      cashTotal,
      upiTotal,
      cardTotal
    };
  }, [filteredHistory]);

  const isOwner = currentUser?.userType === 'RESTAURANT_OWNER' || currentUser?.userType === 'OWNER' || currentUser?.role === 'RESTAURANT_OWNER';
  const canViewHistory = isOwner || (typeof hasPermission === 'function' ? (hasPermission('billing_history', 'view') || hasPermission('billing', 'view')) : true);

  if (!canViewHistory) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>Access Denied</h3>
        <p style={{ fontSize: '14px' }}>You do not have permission to view Billing History.</p>
      </div>
    );
  }

  const handleDeleteInvoice = async (invoice) => {
    if (!invoice) return;
    try {
      const targetId = invoice.rawOrderId || invoice.orderId || invoice.order_id || invoice._id || invoice.id;
      const cleanId = String(targetId || '').replace(/^[#ORD-_]*/i, '');
      if (cleanId) {
        await apiClient.delete(`/orders/${cleanId}`).catch(() => null);
        await apiClient.delete(`/billing/${cleanId}`).catch(() => null);
      }

      setRawHistory(prev => prev.filter(item => {
        const match =
          (invoice.id && (item.id === invoice.id || item._id === invoice.id)) ||
          (invoice._id && (item._id === invoice._id || item.id === invoice._id)) ||
          (invoice.billNo && (item.billNo === invoice.billNo || item.billNumber === invoice.billNo)) ||
          (invoice.invoiceNo && (item.invoiceNo === invoice.invoiceNo || item.invoiceId === invoice.invoiceNo)) ||
          (targetId && (item.orderId === targetId || item._id === targetId || item.id === targetId));
        return !match;
      }));

      if (Array.isArray(activeRestaurant?.billingHistory)) {
        activeRestaurant.billingHistory = activeRestaurant.billingHistory.filter(item => {
          return item.billNo !== invoice.billNo && item.invoiceNo !== invoice.invoiceNo && item.id !== invoice.id;
        });
      }

      ShowNotifications.showAlertNotification("Bill deleted successfully.", true);
    } catch (err) {
      console.error("Failed to delete bill:", err);
      ShowNotifications.showAlertNotification("Failed to delete bill.", false);
    }
  };

  return (
    <BillingHistoryPanel
      billingHistory={paginatedHistory}
      allFilteredHistory={filteredHistory}
      branches={activeRestaurant?.branches || []}
      isLoading={isLoading}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      dateRange={dateRange}
      setDateRange={setDateRange}
      customStartDate={customStartDate}
      setCustomStartDate={setCustomStartDate}
      customEndDate={customEndDate}
      setCustomEndDate={setCustomEndDate}
      selectedBranchId={selectedBranchId}
      selectedPayment={selectedPayment}
      setSelectedPayment={setSelectedPayment}
      paymentStatus={paymentStatus}
      setPaymentStatus={setPaymentStatus}
      orderType={orderType}
      setOrderType={setOrderType}
      selectedTable={selectedTable}
      setSelectedTable={setSelectedTable}
      tableOptions={tableOptions}
      customerFilter={customerFilter}
      setCustomerFilter={setCustomerFilter}
      selectedStaff={selectedStaff}
      setSelectedStaff={setSelectedStaff}
      staffOptions={staffOptions}
      page={page}
      setPage={setPage}
      limit={limit}
      totalItems={effectiveTotal}
      totalPages={totalPages}
      summary={summary}
      activeRestaurant={activeRestaurant}
      currentUser={currentUser}
      hasPermission={hasPermission}
      onDeleteInvoice={handleDeleteInvoice}
    />
  );
}