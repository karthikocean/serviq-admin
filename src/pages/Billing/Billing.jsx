import React, { useState, useEffect } from 'react';
import { useAppState, DEFAULT_ROLES } from '../../config/AppContext';
import BillingPanel from '../../components/BillingPanel';
import BillingApi from '../../api/Billing';
import OrderApi from '../../api/Order';
import { formatDateDMY } from '../../helper/DateHelper.js';
import { isBranchMatch, isBranchFilterActive } from '../../helper/BranchHelper.js';
import './Billing.css';

export default function Billing() {
  const {
    currentUser,
    activeRestaurant,
    selectedBranchId,
    hasPermission
  } = useAppState();

  const [selectedBillingTable, setSelectedBillingTable] = useState('');
  const [billingPaymentMethod, setBillingPaymentMethod] = useState('UPI');
  const [billingData, setBillingData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTable, setSelectedTable] = useState('All');
  const [customerFilter, setCustomerFilter] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('All');
  const [page, setPage] = useState(0);
  const limit = 10;
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    if (activeRestaurant) {
      fetchBillingData();
    }
  }, [
    activeRestaurant,
    selectedBranchId,
    searchTerm,
    selectedTable,
    customerFilter,
    selectedStaff,
    page
  ]);

  // Reset page when filter inputs change
  useEffect(() => {
    setPage(0);
  }, [searchTerm, selectedTable, customerFilter, selectedStaff, selectedBranchId]);

  const fetchBillingData = async () => {
    setIsLoading(true);

    const isSingleBranch = isBranchFilterActive(selectedBranchId);
    const params = {
      branchId: isSingleBranch ? selectedBranchId : undefined,
      search: searchTerm ? searchTerm.trim() : undefined,
      tableId: selectedTable && selectedTable !== 'All' ? selectedTable : undefined,
      customer: customerFilter ? customerFilter.trim() : undefined,
      cashierId: selectedStaff && selectedStaff !== 'All' ? selectedStaff : undefined,
      orderType: 'DINE_IN',
      page: page + 1, // 1-based index
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };

    let fetchedTables = [];
    try {
      const tablesRes = await BillingApi.getCurrentBilling(params);
      if (tablesRes && tablesRes.status && tablesRes.response) {
        const resp = tablesRes.response;
        const d = resp.data || resp.tables || resp;
        const total = Number(resp.totalItems ?? resp.total ?? resp.count ?? (Array.isArray(d) ? d.length : 0));
        setTotalItems(total);
        if (Array.isArray(d)) {
          fetchedTables = d.map((t, idx) => {
            const rawBillDate = t.billDateTime || t.createdAt || t.date || new Date().toISOString();
            const dateObj = new Date(rawBillDate);
            const dateStr = !isNaN(dateObj.getTime()) ? formatDateDMY(dateObj) : formatDateDMY(new Date());
            const timeStr = !isNaN(dateObj.getTime()) ? dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

            const rawItems = (Array.isArray(t.items) ? t.items : []).map(it => {
              const q = Number(it.qty ?? it.quantity ?? 1) || 1;
              const r = Number(it.rate ?? it.price ?? 0) || 0;
              const a = Number(it.amount ?? (q * r)) || 0;
              return {
                name: it.name || it.itemName || 'Item',
                qty: q,
                rate: r,
                amount: a,
                notes: it.notes || ''
              };
            });

            const subtotal = Number(t.subtotal ?? rawItems.reduce((acc, curr) => acc + curr.amount, 0));
            const tax = Number(t.tax ?? 0);
            const discount = Number(t.discount ?? 0);
            const billAmount = Number(t.billAmount ?? t.total ?? (subtotal + tax - discount));
            const paidAmount = Number(t.paidAmount ?? 0);
            const balanceAmount = Math.max(0, billAmount - paidAmount);
            const isPaid = (t.status || '').toLowerCase() === 'paid' || balanceAmount <= 0;

            const cleanTable = String(t.table || t.tableNumber || '').trim();
            const tableDisplay = cleanTable ? (cleanTable.startsWith('Table') ? cleanTable : `Table ${cleanTable}`) : `Table ${idx + 1}`;

            const mongoOrderId = t.orderId || t.order_id || t.id || t._id;
            const mongoTableId = t.tableId || t.id || t._id;

            return {
              ...t,
              id: t.id || t._id,
              _id: t._id || t.id,
              sNo: t.sNo ?? (idx + 1),
              billNo: t.billNo || t.billNumber || '-',
              orderId: t.orderId || t.order_id || '-',
              orderType: t.orderType || 'Dine-In',
              tableId: mongoTableId,
              table: tableDisplay,
              billDateTime: rawBillDate,
              date: dateStr,
              time: timeStr,
              createdAt: rawBillDate,
              subtotal,
              tax,
              discount,
              billAmount,
              total: billAmount,
              amount: billAmount,
              paidAmount,
              balanceAmount,
              status: isPaid ? 'Paid' : (t.status || 'Unpaid'),
              paymentStatus: isPaid ? 'Paid' : (t.status || 'Unpaid'),
              cashier: t.cashier || t.staff || '-',
              staff: t.cashier || t.staff || '-',
              items: rawItems,
              order_id: mongoOrderId,
              rawOrderId: mongoOrderId,
              orderIds: [mongoTableId, mongoOrderId].filter(Boolean),
              customerName: t.customerName || t.customer?.name || t.clientName || '',
              customerPhone: t.customerPhone || t.customerMobile || t.phone || ''
            };
          });
        }
      }
    } catch (e) {
      console.warn("Failed to fetch current billing from BillingApi:", e);
    }

    const finalBillingData = isSingleBranch
      ? fetchedTables.filter(t => isBranchMatch(t, selectedBranchId, activeRestaurant?.branches || []))
      : fetchedTables;

    setBillingData(finalBillingData);

    if (fetchedTables.length > 0) {
      if (!selectedBillingTable || !fetchedTables.some(t => t.tableId === selectedBillingTable || t._id === selectedBillingTable)) {
        setSelectedBillingTable(fetchedTables[0].tableId || fetchedTables[0]._id);
      }
    } else {
      setSelectedBillingTable('');
    }
    setIsLoading(false);
  };



  if (!activeRestaurant) return null;

  return (
    <BillingPanel
      billingData={billingData}
      setBillingData={setBillingData}
      selectedBranchId={selectedBranchId}
      activeRestaurant={activeRestaurant}
      selectedBillingTable={selectedBillingTable}
      setSelectedBillingTable={setSelectedBillingTable}
      billingPaymentMethod={billingPaymentMethod}
      setBillingPaymentMethod={setBillingPaymentMethod}
      hasPermission={hasPermission}
      fetchBillingData={fetchBillingData}
      isLoading={isLoading}
      currentUser={currentUser}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      selectedTable={selectedTable}
      setSelectedTable={setSelectedTable}
      customerFilter={customerFilter}
      setCustomerFilter={setCustomerFilter}
      selectedStaff={selectedStaff}
      setSelectedStaff={setSelectedStaff}
      page={page}
      setPage={setPage}
      limit={limit}
      totalItems={totalItems}
    />
  );
}