import React, { useEffect, useState } from 'react';
import { useAppState } from '../../config/AppContext';
import BillingHistoryPanel from '../../components/BillingHistoryPanel';
import BillingApi from '../../api/Billing';

export default function BillingHistory() {
  const { activeRestaurant, selectedBranchId } = useAppState();

  // States lifted from Panel
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('Today');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('All');

  // Pagination States
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Data States
  const [historyData, setHistoryData] = useState([]);
  const [summary, setSummary] = useState({ totalSales: 0, cashTotal: 0, upiTotal: 0, cardTotal: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Trigger fetch when filters or pagination change
  useEffect(() => {
    if (activeRestaurant) {
      // Small debounce for search term
      const delay = setTimeout(() => {
        fetchHistory();
      }, 300);
      return () => clearTimeout(delay);
    }
  }, [activeRestaurant, page, limit, searchTerm, dateRange, customStartDate, customEndDate, selectedBranchId, selectedPayment]);

  // Reset page to 1 if filters change (except page/limit)
  useEffect(() => {
    setPage(1);
  }, [searchTerm, dateRange, customStartDate, customEndDate, selectedBranchId, selectedPayment]);

  const fetchHistory = async () => {
    setIsLoading(true);

    const filters = {
      page,
      limit,
      search: searchTerm,
      dateRange,
      startDate: customStartDate,
      endDate: customEndDate,
      branchId: selectedBranchId,
      paymentMethod: selectedPayment
    };

    const result = await BillingApi.getBillingHistory(filters);

    if (result.status && result.response.data) {
      const data = result.response.data;
      // Depending on API response, data could be the array directly (if backward compatibility) or {items, summary...}
      const itemsList = Array.isArray(data) ? data : (data.items || []);

      const mappedData = itemsList.map(item => ({
        id: item.invoiceId,
        orderId: item.orderRefId,
        table: item.tableNumber,
        branchId: item.branchId,
        date: new Date(item.createdAt).toLocaleDateString(),
        time: new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        amount: item.totalAmount,
        paymentMethod: item.paymentMethod === 'upi' ? 'UPI' : item.paymentMethod.charAt(0).toUpperCase() + item.paymentMethod.slice(1),
        staff: item.staffName,
        status: item.paymentStatus,
        items: item.items,
        subtotal: item.subtotal,
        tax: item.tax,
        discount: item.discount,
        charge: item.charge
      }));

      setHistoryData(mappedData);

      if (!Array.isArray(data)) {
        setTotalItems(data.totalItems || 0);
        if (data.summary) {
          setSummary(data.summary);
        }
      } else {
        setTotalItems(itemsList.length);
      }
    }
    setIsLoading(false);
  };

  if (!activeRestaurant) return null;

  return (
    <BillingHistoryPanel
      billingHistory={historyData}
      branches={activeRestaurant.branches || []}
      isLoading={isLoading}

      // Pass down states and setters
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
      totalItems={totalItems}
      summary={summary}
    />
  );
}