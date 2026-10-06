import React, { useEffect, useState, useMemo } from 'react';
import { useAppState } from '../../config/AppContext';
import BillingHistoryPanel from '../../components/BillingHistoryPanel';
import BillingApi from '../../api/Billing';
import OrderApi from '../../api/Order';
import { formatDateDMY } from '../../helper/DateHelper.js';
import { isBranchMatch } from '../../helper/BranchHelper.js';

export default function BillingHistory() {
  const { activeRestaurant, selectedBranchId, hasPermission } = useAppState();

  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('All');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('All');
  const [selectedTable, setSelectedTable] = useState('All');
  const [customerFilter, setCustomerFilter] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('All');

  // Pagination States
  const [page, setPage] = useState(0);
  const limit = 10;
  const [totalItems, setTotalItems] = useState(0);


  // Data States
  const [rawHistory, setRawHistory] = useState([]);
  const [apiSummary, setApiSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Trigger fetch when activeRestaurant, selectedBranchId, date filters, or page change
  useEffect(() => {
    fetchHistory();
  }, [
    activeRestaurant?.id,
    selectedBranchId,
    dateRange,
    customStartDate,
    customEndDate,
    searchTerm,
    selectedPayment,
    selectedTable,
    customerFilter,
    selectedStaff,
    page
  ]);

  // Reset page to 0 if filters change
  useEffect(() => {
    setPage(0);
  }, [searchTerm, dateRange, customStartDate, customEndDate, selectedBranchId, selectedPayment, selectedTable, customerFilter, selectedStaff]);

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

  const fetchHistory = async () => {
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

    try {
      const isSpecificBranch = selectedBranchId && selectedBranchId !== 'ALL' && selectedBranchId !== 'all' && selectedBranchId !== 'COMPANY' && selectedBranchId !== 'Company';
      const filters = {
        branchId: isSpecificBranch ? selectedBranchId : undefined,
        search: searchTerm ? searchTerm.trim() : undefined,
        tableId: selectedTable && selectedTable !== 'All' ? selectedTable : undefined,
        customer: customerFilter ? customerFilter.trim() : undefined,
        cashierId: selectedStaff && selectedStaff !== 'All' ? selectedStaff : undefined,
        dateRange: apiDateRange,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        paymentMethod: selectedPayment && selectedPayment !== 'All' ? selectedPayment.toUpperCase() : undefined,
        paymentStatus: 'PAID',
        orderType: 'DINE_IN',
        page: page + 1, // 1-based page index
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };

      const result = await BillingApi.getBillingHistory(filters);
      if (result && result.status) {
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

    const mapped = items.map((it, idx) => mapItemToInvoice(it, idx));
    setRawHistory(mapped);
    setTotalItems(serverTotal > 0 ? serverTotal : mapped.length);
    setApiSummary(summaryObj);
    setIsLoading(false);
  };

  // Derive unique Table options
  const tableOptions = useMemo(() => {
    const set = new Set();
    rawHistory.forEach(it => {
      if (it.table) set.add(String(it.table).replace(/^Table\s*/i, '').trim());
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
  }, [rawHistory, activeRestaurant]);

  // Derive unique Cashier / Staff options
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
    rawHistory.forEach(it => {
      const id = it.cashierId || it.staffId;
      const name = it.staff || it.staffName;
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
  }, [rawHistory, activeRestaurant]);

  // Filter raw history by search, date range, branch, payment method, dining table, customer, and cashier/staff
  const filteredHistory = useMemo(() => {
    return rawHistory.filter(item => {
      // 1. Branch Filter (robust, using isBranchMatch)
      if (selectedBranchId && selectedBranchId !== 'ALL' && selectedBranchId !== 'all' && selectedBranchId !== 'COMPANY' && selectedBranchId !== 'Company') {
        if (!isBranchMatch(item, selectedBranchId, activeRestaurant?.branches || [])) {
          return false;
        }
      }

      // 2. Payment Method Filter
      if (selectedPayment && selectedPayment !== 'All') {
        if (item.paymentMethod.toLowerCase() !== selectedPayment.toLowerCase()) {
          return false;
        }
      }

      // 3. Dining Table Filter
      if (selectedTable && selectedTable !== 'All') {
        const itemTable = String(item.table || '').replace(/^Table\s*/i, '').trim().toLowerCase();
        const targetTable = String(selectedTable).replace(/^Table\s*/i, '').trim().toLowerCase();
        const itemTableId = String(item.tableId || '').trim().toLowerCase();
        if (itemTable !== targetTable && itemTableId !== targetTable) {
          return false;
        }
      }

      // 4. Cashier / Staff Filter
      if (selectedStaff && selectedStaff !== 'All') {
        const itemStaffId = String(item.cashierId || item.staffId || '').trim();
        const itemStaffName = String(item.staff || item.staffName || '').trim().toLowerCase();
        const selStaffOpt = staffOptions.find(o => o.value === selectedStaff);
        const selLabel = (selStaffOpt?.label || selectedStaff).toLowerCase();
        if (itemStaffId !== selectedStaff && itemStaffName !== String(selectedStaff).toLowerCase() && itemStaffName !== selLabel) {
          return false;
        }
      }

      // 5. Customer Filter
      if (customerFilter && customerFilter.trim()) {
        const cq = customerFilter.toLowerCase().trim();
        const matchesName = (item.customerName || '').toLowerCase().includes(cq);
        const matchesPhone = (item.customerPhone || '').toLowerCase().includes(cq);
        if (!matchesName && !matchesPhone) {
          return false;
        }
      }

      // 6. Search Filter
      if (searchTerm && searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchesId = (item.id || '').toLowerCase().includes(q);
        const matchesBill = (item.billNo || '').toLowerCase().includes(q);
        const matchesOrder = (item.orderId || '').toLowerCase().includes(q);
        const matchesTable = `table ${item.table}`.toLowerCase().includes(q) || (item.table || '').toLowerCase().includes(q);
        const matchesStaff = (item.staff || '').toLowerCase().includes(q);
        const matchesCust = (item.customerName || '').toLowerCase().includes(q) || (item.customerPhone || '').toLowerCase().includes(q);
        const matchesAmount = String(item.amount || '').includes(q);
        if (!matchesId && !matchesBill && !matchesOrder && !matchesTable && !matchesStaff && !matchesCust && !matchesAmount) {
          return false;
        }
      }

      // 7. Date Range Filter
      if (dateRange && dateRange !== 'All') {
        const itemDate = new Date(item.rawDate);
        const now = new Date();

        if (dateRange === 'Today') {
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const itemDay = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate());
          if (itemDay.getTime() !== today.getTime()) return false;
        } else if (dateRange === 'Yesterday') {
          const yest = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
          const itemDay = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate());
          if (itemDay.getTime() !== yest.getTime()) return false;
        } else if (dateRange === 'This Week') {
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (itemDate < sevenDaysAgo) return false;
        } else if (dateRange === 'This Month') {
          if (itemDate.getMonth() !== now.getMonth() || itemDate.getFullYear() !== now.getFullYear()) return false;
        } else if (dateRange === 'Custom') {
          if (customStartDate) {
            const start = new Date(customStartDate);
            start.setHours(0, 0, 0, 0);
            if (itemDate < start) return false;
          }
          if (customEndDate) {
            const end = new Date(customEndDate);
            end.setHours(23, 59, 59, 999);
            if (itemDate > end) return false;
          }
        }
      }

      return true;
    });
  }, [rawHistory, selectedBranchId, selectedPayment, selectedTable, selectedStaff, customerFilter, searchTerm, dateRange, customStartDate, customEndDate]);

  // Compute pagination and current page slice
  const paginatedHistory = useMemo(() => {
    // If server paginated and returned a single page of items, don't slice again
    if (totalItems > limit && rawHistory.length <= limit && filteredHistory.length === rawHistory.length) {
      return filteredHistory;
    }
    const startIndex = page * limit;
    return filteredHistory.slice(startIndex, startIndex + limit);
  }, [filteredHistory, rawHistory.length, page, limit, totalItems]);

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
      totalItems={totalItems || filteredHistory.length}
      summary={summary}
      activeRestaurant={activeRestaurant}
      hasPermission={hasPermission}
    />
  );
}