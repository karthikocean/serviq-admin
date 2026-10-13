import React, { useState, useEffect } from 'react';
import { useAppState, DEFAULT_ROLES } from '../../config/AppContext';
import BillingPanel from '../../components/BillingPanel';
import BillingApi from '../../api/Billing';
import OrderApi from '../../api/Order';
import TableApi from '../../api/Table';
import UserApi from '../../api/User';
import { formatDateDMY } from '../../helper/DateHelper.js';
import { isBranchMatch } from '../../helper/BranchHelper.js';
import { isMongoId } from '../../config/initialData';
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
  const [availableTables, setAvailableTables] = useState([]);
  const [availableStaff, setAvailableStaff] = useState([]);

  // Fetch tables and staff from backend to map human codes to MongoDB _id
  useEffect(() => {
    let isMounted = true;
    const fetchMetadata = async () => {
      try {
        const isSingleBranch = selectedBranchId && selectedBranchId !== 'ALL' && selectedBranchId !== 'all' && selectedBranchId !== 'COMPANY' && selectedBranchId !== 'Company';
        const params = {
          limit: 0,
          ...(isSingleBranch ? { branchId: selectedBranchId } : {})
        };
        const [tablesRes, staffRes] = await Promise.all([
          TableApi.getTables(params).catch(() => null),
          UserApi.getUsers(params).catch(() => null)
        ]);
        if (isMounted) {
          if (tablesRes && tablesRes.status) {
            const raw = tablesRes.response?.data || tablesRes.response?.tables || tablesRes.response || [];
            const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : []);
            setAvailableTables(list);
          }
          if (staffRes && staffRes.status) {
            const rawS = staffRes.response?.data || staffRes.response?.users || staffRes.response || [];
            const listS = Array.isArray(rawS) ? rawS : (Array.isArray(rawS?.data) ? rawS.data : []);
            setAvailableStaff(listS);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch dropdown metadata in Billing:", err);
      }
    };
    fetchMetadata();
    return () => { isMounted = false; };
  }, [selectedBranchId]);

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (!activeRestaurant) return;

    const isTextTyping = Boolean((searchTerm && searchTerm.trim()) || (customerFilter && customerFilter.trim()));
    const delay = isTextTyping ? 300 : 0;

    const timer = setTimeout(() => {
      fetchBillingData();
    }, delay);

    return () => clearTimeout(timer);
  }, [
    activeRestaurant,
    selectedBranchId,
    searchTerm,
    selectedTable,
    customerFilter,
    selectedStaff,
    page,
    refreshTrigger
  ]);

  // Reset page to 0 when filter inputs change
  useEffect(() => {
    setPage(0);
  }, [searchTerm, selectedTable, customerFilter, selectedStaff, selectedBranchId]);

  const fetchBillingData = async () => {
    setIsLoading(true);

    const isSingleBranch = selectedBranchId && selectedBranchId !== 'ALL' && selectedBranchId !== 'all' && selectedBranchId !== 'COMPANY' && selectedBranchId !== 'Company';

    // Resolve tableId: MUST send table._id (MongoDB ObjectId), NOT string like "TBL-SCB-003"
    let resolvedTableId = undefined;
    if (selectedTable && selectedTable !== 'All' && selectedTable !== 'ALL') {
      if (typeof selectedTable === 'object' && selectedTable !== null) {
        resolvedTableId = selectedTable._id || selectedTable.id;
      } else if (isMongoId(String(selectedTable))) {
        resolvedTableId = String(selectedTable);
      } else {
        // Resolve custom string code (e.g. TBL-SCB-003) to its table._id ObjectId
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

    const params = {
      branchId: isSingleBranch ? selectedBranchId : undefined,
      search: searchTerm ? searchTerm.trim() : undefined,
      q: searchTerm ? searchTerm.trim() : undefined,
      tableId: resolvedTableId,
      table: resolvedTableId,
      customer: customerFilter ? customerFilter.trim() : undefined,
      customerName: customerFilter ? customerFilter.trim() : undefined,
      cashierId: resolvedStaffId,
      waiterId: resolvedStaffId,
      staffId: resolvedStaffId,
      orderType: 'DINE_IN',
      page: page !== undefined ? page : 0,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };

    let fetchedTables = [];
    let apiSuccess = false;
    try {
      const tablesRes = await BillingApi.getCurrentBilling(params);
      if (tablesRes && tablesRes.status && tablesRes.response) {
        apiSuccess = true;
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
            const rawPaidAmount = Number(t.paidAmount ?? t.paid ?? 0);
            const rawStatus = String(t.status || '').toLowerCase();
            const rawPaymentStatus = String(t.paymentStatus || t.payment_status || '').toLowerCase();
            const hasPaidFlag = t.isPaid === true || t.paid === true || t.is_paid === true;

            const isPaid = 
              rawStatus === 'paid' || 
              rawPaymentStatus === 'paid' || 
              hasPaidFlag || 
              (rawPaidAmount >= billAmount && billAmount > 0) ||
              (rawPaidAmount > 0 && Math.max(0, billAmount - rawPaidAmount) <= 0);

            const paidAmount = isPaid ? (rawPaidAmount > 0 ? rawPaidAmount : billAmount) : rawPaidAmount;
            const balanceAmount = isPaid ? 0 : Math.max(0, billAmount - paidAmount);

            const cleanTable = String(t.table || t.tableNumber || '').trim();
            const tableDisplay = cleanTable ? (cleanTable.startsWith('Table') ? cleanTable : `Table ${cleanTable}`) : `Table ${idx + 1}`;

            const mongoOrderId = t.orderId || t.order_id || t.id || t._id;
            const mongoTableId = t.tableId || t.id || t._id;

            const rawBillNo = t.billNo || t.billNumber || '-';
            const rawInvoiceNo = t.invoiceNo || t.invoiceNumber || t.invoiceId || t.taxInvoiceNo || (t.invoice && typeof t.invoice === 'object' ? (t.invoice.invoiceNo || t.invoice.invoiceNumber || t.invoice.id) : t.invoice) || '';
            const fallbackInvoiceNo = rawInvoiceNo || (rawBillNo && rawBillNo !== '-' ? (rawBillNo.startsWith('INV-') ? rawBillNo : `INV-${rawBillNo.replace(/^BILL[-_]*/i, '')}`) : '');

            return {
              ...t,
              id: t.id || t._id,
              _id: t._id || t.id,
              sNo: t.sNo ?? (idx + 1),
              billNo: rawBillNo,
              invoiceNo: rawInvoiceNo || fallbackInvoiceNo,
              invoiceId: rawInvoiceNo || fallbackInvoiceNo,
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

    const hasActiveFilters = Boolean(
      (searchTerm && searchTerm.trim()) ||
      (selectedTable && selectedTable !== 'All' && selectedTable !== 'ALL') ||
      (customerFilter && customerFilter.trim()) ||
      (selectedStaff && selectedStaff !== 'All' && selectedStaff !== 'ALL')
    );

    // ONLY fall back to mock data if API completely failed (network/server error) AND no filter is applied
    if (!apiSuccess && !hasActiveFilters && fetchedTables.length === 0) {
      const sourceBills = (Array.isArray(activeRestaurant?.billingData) && activeRestaurant.billingData.length > 0)
        ? activeRestaurant.billingData
        : [];

      if (sourceBills.length > 0) {
        fetchedTables = sourceBills.map((b, idx) => {
          const rawBillDate = b.billDateTime || b.createdAt || b.date || new Date().toISOString();
          const dateObj = new Date(rawBillDate);
          const dateStr = !isNaN(dateObj.getTime()) ? formatDateDMY(dateObj) : (b.date || formatDateDMY(new Date()));
          const timeStr = b.time || (!isNaN(dateObj.getTime()) ? dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '12:30 PM');

          const rawItems = (Array.isArray(b.items) ? b.items : []).map(it => ({
            name: it.name || it.itemName || 'Item',
            qty: Number(it.qty ?? it.quantity ?? 1) || 1,
            rate: Number(it.rate ?? it.price ?? 0) || 0,
            amount: Number(it.amount ?? it.total ?? ((Number(it.qty ?? 1)) * (Number(it.rate ?? it.price ?? 0)))) || 0
          }));

          const subtotal = Number(b.subtotal ?? rawItems.reduce((acc, curr) => acc + curr.amount, 0));
          const tax = Number(b.tax ?? Math.round(subtotal * 0.05));
          const discount = Number(b.discount ?? 0);
          const billAmount = Number(b.billAmount ?? b.total ?? b.amount ?? (subtotal + tax - discount));
          const paidAmount = Number(b.paidAmount ?? ((b.status || '').toLowerCase() === 'paid' ? billAmount : 0));
          const balanceAmount = Number(b.balanceAmount ?? Math.max(0, billAmount - paidAmount));
          const isPaid = (b.status || b.paymentStatus || '').toLowerCase() === 'paid' || balanceAmount <= 0;

          const cleanTable = String(b.table || b.tableNumber || b.tableNo || '').trim();
          const tableDisplay = cleanTable ? (cleanTable.startsWith('Table') ? cleanTable : `Table ${cleanTable}`) : `Table ${idx + 1}`;
          const tId = b.tableId || b._id || b.id || `tbl-${idx + 1}`;
          const ordId = b.orderId || b.order_id || `#ORD-${1000 + idx + 1}`;

          const rawBillNo = b.billNo || b.billNumber || `BILL-${200 + idx + 1}`;
          const rawInvoiceNo = b.invoiceNo || b.invoiceNumber || b.invoiceId || (b.invoice && typeof b.invoice === 'object' ? (b.invoice.invoiceNo || b.invoice.invoiceNumber) : b.invoice) || '';
          const fallbackInvoiceNo = rawInvoiceNo || (rawBillNo ? (rawBillNo.startsWith('INV-') ? rawBillNo : `INV-${rawBillNo.replace(/^BILL[-_]*/i, '')}`) : `INV-${200 + idx + 1}`);

          return {
            ...b,
            id: b.id || b._id || `bill-${idx + 1}`,
            _id: b._id || b.id || `bill-${idx + 1}`,
            sNo: b.sNo ?? (idx + 1),
            billNo: rawBillNo,
            invoiceNo: rawInvoiceNo || fallbackInvoiceNo,
            invoiceId: rawInvoiceNo || fallbackInvoiceNo,
            orderId: ordId,
            orderType: b.orderType || 'Dine-In',
            tableId: tId,
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
            status: isPaid ? 'Paid' : (b.status || 'Unpaid'),
            paymentStatus: isPaid ? 'Paid' : (b.paymentStatus || 'Unpaid'),
            cashier: b.cashier || b.staff || '-',
            staff: b.staff || b.cashier || '-',
            items: rawItems,
            order_id: ordId,
            rawOrderId: ordId,
            orderIds: [tId, ordId].filter(Boolean),
            customerName: b.customerName || `Guest (${tableDisplay})`,
            customerPhone: b.customerPhone || ''
          };
        });

        setTotalItems(fetchedTables.length);
      } else {
        fetchedTables = [];
        setTotalItems(0);
      }
    } else if (apiSuccess) {
      // API call succeeded: preserve fetchedTables (which could be empty if filter matched 0 items)
    } else {
      fetchedTables = [];
      setTotalItems(0);
    }

    setBillingData(fetchedTables);

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

  const isOwner = currentUser?.userType === 'RESTAURANT_OWNER' || currentUser?.userType === 'OWNER' || currentUser?.role === 'RESTAURANT_OWNER';
  const canViewBilling = isOwner || (typeof hasPermission === 'function' ? (hasPermission('billing_current', 'view') || hasPermission('billing', 'view')) : true);

  if (!canViewBilling) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>Access Denied</h3>
        <p style={{ fontSize: '14px' }}>You do not have permission to view Current Billing.</p>
      </div>
    );
  }

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
      triggerRefresh={() => setRefreshTrigger(prev => prev + 1)}
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
      availableTables={availableTables}
      availableStaff={availableStaff}
    />
  );
}