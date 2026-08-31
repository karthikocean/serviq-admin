import React, { useEffect, useState, useMemo } from 'react';
import { useAppState } from '../../config/AppContext';
import BillingHistoryPanel from '../../components/BillingHistoryPanel';
import BillingApi from '../../api/Billing';
import OrderApi from '../../api/Order';
import { formatDateDMY } from '../../helper/DateHelper.js';

export default function BillingHistory() {
  const { activeRestaurant, selectedBranchId } = useAppState();

  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('All');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('All');

  // Pagination States
  const [page, setPage] = useState(0);
  const limit = 10;
  const [totalItems, setTotalItems] = useState(0);

  // Data States
  const [rawHistory, setRawHistory] = useState([]);
  const [apiSummary, setApiSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Trigger fetch when activeRestaurant, selectedBranchId, or date filters change
  useEffect(() => {
    fetchHistory();
  }, [activeRestaurant?.id, selectedBranchId]);

  // Reset page to 0 if filters change
  useEffect(() => {
    setPage(0);
  }, [searchTerm, dateRange, customStartDate, customEndDate, selectedBranchId, selectedPayment]);

  // Safe mapping function for any invoice / order / bill record
  const mapItemToInvoice = (item, index = 0) => {
    const rawId = item.invoiceId || item.invoiceNo || item.invoiceNumber || item.billNumber || item.billNo || item._id || item.id || `INV-${String(index + 1).padStart(4, '0')}`;
    const displayInvoiceId = String(rawId).startsWith('INV-') ? String(rawId) : (String(rawId).length === 24 ? `INV-${String(rawId).slice(-6).toUpperCase()}` : `INV-${rawId}`);

    const rawOrderId = item.orderRefId || item.orderNumber || item.orderId || (item.order?._id || item.order?.orderId || item.order?.orderNumber) || item._id || item.id || 'N/A';
    const displayOrderId = String(rawOrderId).startsWith('#ORD-') ? String(rawOrderId) : (String(rawOrderId).startsWith('ORD-') ? `#${rawOrderId}` : (String(rawOrderId).length === 24 ? `#ORD-${String(rawOrderId).slice(-6).toUpperCase()}` : `#ORD-${rawOrderId}`));

    const tableNum = item.tableNumber || item.tableNo || item.table || (typeof item.tableId === 'object' ? (item.tableId?.tableNumber || item.tableId?.tableNo) : item.tableId) || '01';

    const rawDate = item.createdAt || item.date || item.createdDate || item.timestamp || item.updatedAt || new Date().toISOString();
    const dateStr = formatDateDMY(rawDate);
    const timeStr = item.time || (rawDate ? new Date(rawDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '12:00 PM');

    const totalAmount = Number(item.totalAmount ?? item.amount ?? item.total ?? item.grandTotal ?? item.billAmount ?? item.netAmount ?? 0);

    const rawMethod = String(item.paymentMethod || item.paymentMode || item.method || item.mode || item.payment?.method || item.payment?.mode || item.paymentType || 'UPI');
    const paymentMethod = rawMethod.toLowerCase() === 'upi' ? 'UPI' : (rawMethod.toLowerCase() === 'cash' ? 'Cash' : (rawMethod.toLowerCase() === 'card' ? 'Card' : (rawMethod.charAt(0).toUpperCase() + rawMethod.slice(1))));

    const staffName = item.staffName || item.waiterName || item.waiter || item.staff || (typeof item.waiterId === 'object' ? (item.waiterId?.name || item.waiterId?.staffName) : item.waiterId) || item.server || 'Admin';

    const status = item.paymentStatus || item.billingStatus || item.status || 'Paid';

    const itemsList = Array.isArray(item.items) ? item.items : (Array.isArray(item.orderItems) ? item.orderItems : []);
    const subtotal = Number(item.subtotal ?? item.subTotal ?? item.itemTotal ?? totalAmount);
    const tax = Number(item.tax ?? item.taxes ?? item.taxAmount ?? 0);
    const discount = Number(item.discount ?? item.discountAmount ?? 0);
    const charge = Number(item.charge ?? item.serviceCharge ?? 0);

    return {
      id: displayInvoiceId,
      orderId: displayOrderId,
      table: String(tableNum).replace('Table ', '').trim(),
      branchId: item.branchId || item.branch || (typeof item.branchId === 'object' ? item.branchId?._id : selectedBranchId) || 'main',
      date: dateStr,
      time: timeStr,
      rawDate: new Date(rawDate),
      amount: totalAmount,
      paymentMethod,
      staff: staffName,
      status: (String(status).toLowerCase() === 'paid' || String(status).toLowerCase() === 'completed') ? 'Paid' : 'Unpaid',
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

    try {
      const filters = {
        branchId: selectedBranchId && selectedBranchId !== 'ALL' && selectedBranchId !== 'all' ? selectedBranchId : undefined
      };

      const result = await BillingApi.getBillingHistory(filters);
      if (result && result.status) {
        const payload = result.response?.data || result.response || result.data;
        if (Array.isArray(payload)) {
          items = payload;
        } else if (payload && typeof payload === 'object') {
          items = Array.isArray(payload.items) ? payload.items :
                  Array.isArray(payload.data) ? payload.data :
                  Array.isArray(payload.billingHistory) ? payload.billingHistory :
                  Array.isArray(payload.history) ? payload.history :
                  Array.isArray(payload.orders) ? payload.orders : [];
          if (payload.summary) {
            summaryObj = payload.summary;
          }
        }
      }
    } catch (e) {
      console.error('Failed to fetch billing history from API', e);
    }

    // Fallback: If API returned empty, derive from activeRestaurant / orders
    if (items.length === 0) {
      const localHistory = activeRestaurant?.billingHistory || [];
      if (localHistory.length > 0) {
        items = localHistory;
      } else {
        // Find paid orders
        const allOrders = activeRestaurant?.orders || [];
        const paidOrders = allOrders.filter(o => {
          const bStat = (o.billingStatus || o.paymentStatus || o.status || '').toLowerCase();
          return bStat === 'paid' || bStat === 'completed' || o.isPaid === true;
        });

        if (paidOrders.length > 0) {
          items = paidOrders;
        } else {
          // Attempt OrderApi fetch as backup
          try {
            const orderRes = await OrderApi.getOrders();
            if (orderRes && orderRes.status) {
              const oPayload = orderRes.response || {};
              const fetchedOrders = Array.isArray(oPayload) ? oPayload :
                Array.isArray(oPayload.data) ? oPayload.data :
                Array.isArray(oPayload.data?.orders) ? oPayload.data.orders :
                Array.isArray(oPayload.orders) ? oPayload.orders : [];
              const paid = fetchedOrders.filter(o => {
                const bStat = (o.billingStatus || o.paymentStatus || o.status || '').toLowerCase();
                return bStat === 'paid' || bStat === 'completed' || o.isPaid === true;
              });
              if (paid.length > 0) {
                items = paid;
              }
            }
          } catch (err) {
            // Ignore backup fetch error
          }
        }
      }
    }

    const mapped = items.map((it, idx) => mapItemToInvoice(it, idx));
    setRawHistory(mapped);
    setApiSummary(summaryObj);
    setIsLoading(false);
  };

  // Filter raw history by search, date range, branch, and payment method
  const filteredHistory = useMemo(() => {
    return rawHistory.filter(item => {
      // 1. Branch Filter
      if (selectedBranchId && selectedBranchId !== 'ALL' && selectedBranchId !== 'all') {
        if (item.branchId && String(item.branchId) !== String(selectedBranchId)) {
          return false;
        }
      }

      // 2. Payment Method Filter
      if (selectedPayment && selectedPayment !== 'All') {
        if (item.paymentMethod.toLowerCase() !== selectedPayment.toLowerCase()) {
          return false;
        }
      }

      // 3. Search Filter
      if (searchTerm && searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchesId = (item.id || '').toLowerCase().includes(q);
        const matchesOrder = (item.orderId || '').toLowerCase().includes(q);
        const matchesTable = `table ${item.table}`.toLowerCase().includes(q) || (item.table || '').toLowerCase().includes(q);
        const matchesStaff = (item.staff || '').toLowerCase().includes(q);
        const matchesAmount = String(item.amount || '').includes(q);
        if (!matchesId && !matchesOrder && !matchesTable && !matchesStaff && !matchesAmount) {
          return false;
        }
      }

      // 4. Date Range Filter
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
  }, [rawHistory, selectedBranchId, selectedPayment, searchTerm, dateRange, customStartDate, customEndDate]);

  // Compute pagination and current page slice
  const paginatedHistory = useMemo(() => {
    const startIndex = page * limit;
    return filteredHistory.slice(startIndex, startIndex + limit);
  }, [filteredHistory, page, limit]);

  // Compute Summary
  const summary = useMemo(() => {
    if (apiSummary && (apiSummary.totalSales > 0 || apiSummary.cashTotal > 0 || apiSummary.upiTotal > 0)) {
      return apiSummary;
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
      page={page}
      setPage={setPage}
      limit={limit}
      totalItems={filteredHistory.length}
      summary={summary}
    />
  );
}