import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useAppState } from '../../config/AppContext';
import BillingHistoryPanel from '../../components/BillingHistoryPanel';
import BillingApi from '../../api/Billing';
import OrderApi from '../../api/Order';
import TableApi from '../../api/Table';
import UserApi from '../../api/User';
import { formatDateDMY } from '../../helper/DateHelper.js';
import { isBranchMatch } from '../../helper/BranchHelper.js';
import { initialBillingHistory, initialOrders, isMongoId } from '../../config/initialData';

export default function BillingHistory() {
  const { activeRestaurant, selectedBranchId, currentUser, hasPermission } = useAppState();

  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('All');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('All');
  const [paymentStatus, setPaymentStatus] = useState('All');
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
    const rawId = item.invoiceId || item.invoiceNo || item.invoiceNumber || item.billNumber || item.billNo || item._id || item.id || '';
    const displayInvoiceId = rawId ? (String(rawId).startsWith('INV-') ? String(rawId) : (String(rawId).length === 24 ? `INV-${String(rawId).slice(-6).toUpperCase()}` : `INV-${rawId}`)) : '-';

    const rawBillNo = item.billNo || item.billNumber || item.invoiceNo || item.invoiceId || displayInvoiceId;

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
      branchId: item.branchId || item.branch || (typeof item.branchId === 'object' ? item.branchId?._id : selectedBranchId) || '',
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
        paymentStatus: paymentStatus && paymentStatus !== 'All' ? paymentStatus : undefined,
        orderType: orderType && orderType !== 'All' ? orderType : undefined,
        page: page,
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

    // Only fall back to local mock data if the API network call completely failed
    if (!apiSuccess) {
      let fallbackList = [];
      if (Array.isArray(activeRestaurant?.billingHistory) && activeRestaurant.billingHistory.length > 0) {
        fallbackList = activeRestaurant.billingHistory;
      } else if (Array.isArray(activeRestaurant?.orders) && activeRestaurant.orders.length > 0) {
        const paid = activeRestaurant.orders.filter(o => (o.billingStatus || o.paymentStatus || '').toLowerCase() === 'paid' || o.isPaid || o.status === 'completed' || o.status === 'done');
        fallbackList = paid.length > 0 ? paid : activeRestaurant.orders;
      }

      if (fallbackList.length === 0) {
        fallbackList = initialBillingHistory;
      }

      items = fallbackList;
      serverTotal = fallbackList.length;
    }

    const mapped = items.map((it, idx) => mapItemToInvoice(it, idx));
    setRawHistory(mapped);
    setTotalItems(serverTotal > 0 ? serverTotal : mapped.length);
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

  // Derive unique Table options using table._id (ObjectId)
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

    availableTables.forEach(registerTable);

    if (Array.isArray(activeRestaurant?.tables)) {
      activeRestaurant.tables.forEach(registerTable);
    }

    rawHistory.forEach(it => {
      if (typeof it.tableId === 'object' && it.tableId !== null) {
        registerTable(it.tableId);
      } else {
        const mId = isMongoId(String(it.tableId || '')) ? it.tableId : null;
        if (mId && !map.has(String(mId))) {
          const tDisplay = it.table || it.tableNumber || it.tableNo || 'Table';
          const cleanName = String(tDisplay).startsWith('Table') ? String(tDisplay) : `Table ${tDisplay}`;
          map.set(String(mId), {
            value: String(mId),
            label: cleanName,
            code: it.tableId,
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

  // If selectedTable is set to a string code (like TBL-SCB-003) instead of ObjectId, auto-map it to its _id
  useEffect(() => {
    if (selectedTable && selectedTable !== 'All' && !isMongoId(String(selectedTable))) {
      const match = tableOptions.find(opt => opt.code === selectedTable || opt.label.includes(selectedTable) || opt.tableNumber === selectedTable);
      if (match && isMongoId(String(match.value))) {
        setSelectedTable(match.value);
      }
    }
  }, [selectedTable, tableOptions]);

  // Derive unique Cashier / Staff options
  const staffOptions = useMemo(() => {
    const map = new Map();

    const addStaffOption = (s) => {
      if (!s) return;
      const mongoId = (s._id && isMongoId(String(s._id))) ? String(s._id) : (isMongoId(String(s.id)) ? String(s.id) : null);
      const name = s.name || s.staffName || s.fullName || s.userName;
      const code = s.id || s.employeeCode || s.code;

      if (mongoId) {
        const label = name || `Staff (${mongoId.slice(-4)})`;
        map.set(mongoId, { label, code, name });
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
      if (sId && isMongoId(String(sId))) {
        if (!map.has(String(sId))) {
          map.set(String(sId), { label: name || `Staff (${String(sId).slice(-4)})`, code: sId, name });
        }
      }
    });

    const entries = Array.from(map.entries()).map(([value, info]) => ({
      value,
      label: info.label,
      code: info.code,
      name: info.name
    }));

    return [
      { value: 'All', label: 'All Cashier / Staff' },
      ...entries
    ];
  }, [availableStaff, activeRestaurant, rawHistory]);

  // If selectedStaff is set to a string code (like "stf-01" or "STF-01") instead of ObjectId, auto-map it to its _id
  useEffect(() => {
    if (selectedStaff && selectedStaff !== 'All' && !isMongoId(String(selectedStaff))) {
      const match = staffOptions.find(opt => 
        opt.code === selectedStaff || 
        opt.name === selectedStaff || 
        (opt.label && opt.label.toLowerCase().includes(String(selectedStaff).toLowerCase()))
      );
      if (match && isMongoId(String(match.value))) {
        setSelectedStaff(match.value);
      }
    }
  }, [selectedStaff, staffOptions]);

  // Backend API handles all filtering and pagination
  const filteredHistory = rawHistory;

  const effectiveTotal = totalItems > 0 ? totalItems : filteredHistory.length;
  const totalPages = Math.max(1, Math.ceil(effectiveTotal / limit));

  useEffect(() => {
    if (page >= totalPages && totalPages > 0) {
      setPage(Math.max(0, totalPages - 1));
    }
  }, [totalPages, page]);

  // Current page records directly from backend
  const paginatedHistory = filteredHistory;

  // Compute Summary
  const summary = useMemo(() => {
    if (apiSummary && (apiSummary.totalSales !== undefined || apiSummary.cashTotal !== undefined || apiSummary.upiTotal !== undefined || apiSummary.cardTotal !== undefined)) {
      return {
        totalSales: Number(apiSummary.totalSales || 0),
        cashTotal: Number(apiSummary.cashTotal || 0),
        upiTotal: Number(apiSummary.upiTotal || 0),
        cardTotal: Number(apiSummary.cardTotal || 0)
      };
    }
    const totalSales = filteredHistory.reduce((sum, it) => sum + (Number(it.amount) || 0), 0);
    const cashTotal = filteredHistory.filter(it => it.paymentMethod.toLowerCase() === 'cash').reduce((sum, it) => sum + (Number(it.amount) || 0), 0);
    const upiTotal = filteredHistory.filter(it => it.paymentMethod.toLowerCase() === 'upi').reduce((sum, it) => sum + (Number(it.amount) || 0), 0);
    const cardTotal = filteredHistory.filter(it => it.paymentMethod.toLowerCase() === 'card').reduce((sum, it) => sum + (Number(it.amount) || 0), 0);

    return {
      totalSales,
      cashTotal,
      upiTotal,
      cardTotal
    };
  }, [apiSummary, filteredHistory]);

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

  return (
    <BillingHistoryPanel
      billingHistory={paginatedHistory}
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
      hasPermission={hasPermission}
    />
  );
}