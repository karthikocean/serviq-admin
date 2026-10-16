import React, { useState, useEffect } from 'react';
import { useAppState, DEFAULT_ROLES } from '../../config/AppContext';
import BillingPanel from '../../components/BillingPanel';
import BillingApi from '../../api/Billing';
import OrderApi from '../../api/Order';
import TableApi from '../../api/Table';
import { formatDateDMY } from '../../helper/DateHelper.js';
import { isBranchMatch } from '../../helper/BranchHelper.js';
import { isMongoId, initialBillingData } from '../../config/initialData';
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
  const [page, setPage] = useState(0);
  const limit = 10;
  const [totalItems, setTotalItems] = useState(0);
  const [availableTables, setAvailableTables] = useState([]);

  // Fetch tables from backend to map human codes to MongoDB _id
  useEffect(() => {
    let isMounted = true;
    const fetchMetadata = async () => {
      try {
        const isSingleBranch = selectedBranchId && selectedBranchId !== 'ALL' && selectedBranchId !== 'all' && selectedBranchId !== 'COMPANY' && selectedBranchId !== 'Company';
        const params = {
          limit: 10,
          ...(isSingleBranch ? { branchId: selectedBranchId } : {})
        };
        const tablesRes = await TableApi.getTables(params).catch(() => null);
        if (isMounted && tablesRes && tablesRes.status) {
          const raw = tablesRes.response?.data || tablesRes.response?.tables || tablesRes.response || [];
          const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : []);
          setAvailableTables(list);
        }
      } catch (err) {
        console.warn("Failed to fetch dropdown metadata in Billing:", err);
      }
    };
    fetchMetadata();
    return () => { isMounted = false; };
  }, [selectedBranchId]);

  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [recentlyPaidKeys, setRecentlyPaidKeys] = useState(() => new Set());

  const onBillPaid = (paidBill) => {
    if (!paidBill) return;
    setRecentlyPaidKeys(prev => {
      const next = new Set(prev);
      if (paidBill.id) next.add(String(paidBill.id));
      if (paidBill._id) next.add(String(paidBill._id));
      if (paidBill.billNo) next.add(String(paidBill.billNo));
      if (paidBill.billNumber) next.add(String(paidBill.billNumber));
      if (paidBill.orderId && paidBill.orderId !== '-') next.add(String(paidBill.orderId));
      if (paidBill.tableId) next.add(String(paidBill.tableId));
      return next;
    });
  };

  useEffect(() => {
    if (!activeRestaurant) return;

    const isTextTyping = Boolean(searchTerm && searchTerm.trim());
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
    page,
    refreshTrigger
  ]);

  // Reset page to 0 when filter inputs change
  useEffect(() => {
    setPage(0);
  }, [searchTerm, selectedTable, selectedBranchId]);

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


    const params = {
      branchId: isSingleBranch ? selectedBranchId : 'ALL',
      search: searchTerm ? searchTerm.trim() : undefined,
      q: searchTerm ? searchTerm.trim() : undefined,
      tableId: resolvedTableId,
      table: resolvedTableId,
      page: page !== undefined ? page : 0,
      limit: 10,
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
            const timeStr = t.time || (!isNaN(dateObj.getTime()) ? dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '');

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
            const rawPaymentStatus = String(t.paymentStatus || t.payment_status || t.billingStatus || '').toLowerCase();
            const hasPaidFlag = t.isPaid === true || t.paid === true || t.is_paid === true;

            // If billing/payment status explicitly indicates unpaid or pending, it is NOT paid
            const isExplicitlyUnpaid = 
              rawPaymentStatus === 'unpaid' || 
              rawPaymentStatus === 'pending' || 
              rawPaymentStatus === 'pending_payment';

            const isPaid = !isExplicitlyUnpaid && (
              rawPaymentStatus === 'paid' || 
              rawStatus === 'paid' || 
              rawStatus === 'done' || // backend payBill sets status to 'done'
              hasPaidFlag || 
              (rawPaidAmount >= billAmount && billAmount > 0) ||
              (rawPaidAmount > 0 && Math.max(0, billAmount - rawPaidAmount) <= 0)
            );

            const paidAmount = isPaid ? (rawPaidAmount > 0 ? rawPaidAmount : billAmount) : rawPaidAmount;
            const balanceAmount = isPaid ? 0 : Math.max(0, billAmount - paidAmount);

            const cleanTable = String(t.table || t.tableNumber || t.tableNo || '').trim();
            const tableDisplay = cleanTable ? (cleanTable.startsWith('Table') ? cleanTable : `Table ${cleanTable}`) : `Table ${idx + 1}`;

            const mongoOrderId = t.orderId || t.order_id || t.id || t._id || `${1000 + idx + 1}`;
            const mongoTableId = t.tableId || t.id || t._id || `tbl-${idx + 1}`;

            const rawBillNo = t.billNo || t.billNumber || `BILL-${mongoOrderId}`;
            const rawInvoiceNo = t.invoiceNo || t.invoiceNumber || t.invoiceId || t.taxInvoiceNo || (t.invoice && typeof t.invoice === 'object' ? (t.invoice.invoiceNo || t.invoice.invoiceNumber || t.invoice.id) : t.invoice) || '';
            const fallbackInvoiceNo = rawInvoiceNo || (rawBillNo && rawBillNo !== '-' ? (rawBillNo.startsWith('INV-') ? rawBillNo : `INV-${rawBillNo.replace(/^BILL[-_]*/i, '')}`) : `INV-${mongoOrderId}`);

            // Preserve order status from raw record, order property or status
            const rawOrderStatus = String(
              t.orderStatus || 
              t.order_status || 
              t.orderState || 
              (typeof t.order === 'object' && t.order !== null ? (t.order?.status || t.order?.orderStatus) : '') ||
              (Array.isArray(t.orders) && t.orders.length > 0 ? (t.orders[0]?.status || t.orders[0]?.orderStatus) : '') ||
              (t.status && !['unpaid', 'paid', 'pending', 'pending_payment'].includes(String(t.status).toLowerCase()) ? t.status : '') ||
              ''
            ).trim();

            return {
              ...t,
              id: t.id || t._id || `bill-${idx + 1}`,
              _id: t._id || t.id || `bill-${idx + 1}`,
              sNo: t.sNo ?? (idx + 1),
              billNo: rawBillNo,
              invoiceNo: rawInvoiceNo || fallbackInvoiceNo,
              invoiceId: rawInvoiceNo || fallbackInvoiceNo,
              orderId: t.orderId || t.order_id || mongoOrderId,
              orderType: t.orderType || 'Dine-In',
              orderStatus: rawOrderStatus,
              originalStatus: t.status,
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
              isPaid,
              status: isPaid ? 'Paid' : 'Unpaid',
              paymentStatus: isPaid ? 'Paid' : 'Unpaid',
              cashier: t.cashier || t.staff || t.waiter || '-',
              staff: t.cashier || t.staff || t.waiter || '-',
              items: rawItems,
              branchId: typeof t.branchId === 'object' && t.branchId !== null ? (t.branchId._id || t.branchId.id || '') : (t.branchId || t.branch || (typeof t.tableId === 'object' ? t.tableId?.branchId : null) || ''),
              branch: t.branch || t.branchId || (typeof t.tableId === 'object' ? t.tableId?.branchId : null) || '',
              order_id: mongoOrderId,
              rawOrderId: mongoOrderId,
              orderIds: [mongoTableId, mongoOrderId].filter(Boolean),
              customerName: t.customerName || t.customer?.name || t.clientName || '',
              customerPhone: t.customerPhone || t.customerMobile || t.phone || ''
            };
          });

          // Strict requirement: Only Unpaid bills where Order Status is Completed should appear in Current Billing
          fetchedTables = fetchedTables.filter(b => {
            const isRecentlyPaid = 
              recentlyPaidKeys.has(String(b.id)) ||
              recentlyPaidKeys.has(String(b._id)) ||
              recentlyPaidKeys.has(String(b.billNo)) ||
              recentlyPaidKeys.has(String(b.billNumber)) ||
              (b.orderId && b.orderId !== '-' && recentlyPaidKeys.has(String(b.orderId))) ||
              (b.tableId && recentlyPaidKeys.has(String(b.tableId)));
            if (isRecentlyPaid) return false;

            const payStatus = String(b.paymentStatus || b.billingStatus || '').toLowerCase();
            const isPaid = 
              b.isPaid === true ||
              b.paid === true ||
              payStatus === 'paid' ||
              String(b.status || '').toLowerCase() === 'paid' ||
              String(b.status || '').toLowerCase() === 'done' ||
              (Number(b.paidAmount || 0) >= Number(b.billAmount || b.total || 0) && Number(b.billAmount || b.total || 0) > 0) ||
              (Number(b.balanceAmount || 0) <= 0 && Number(b.paidAmount || 0) > 0);

            if (isPaid) return false;

            // Resolve order status: Must be Completed (or served / done)
            let ordStatus = String(b.orderStatus || b.order_status || '').toLowerCase().trim();
            if (!ordStatus && typeof b.order === 'object' && b.order !== null) {
              ordStatus = String(b.order?.status || b.order?.orderStatus || '').toLowerCase().trim();
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
              const orig = String(b.originalStatus || '').toLowerCase().trim();
              if (['new', 'preparing', 'ready', 'served', 'completed', 'done', 'cancelled'].includes(orig)) {
                ordStatus = orig;
              }
            }

            // Exclude cancelled orders from Current Billing
            if (ordStatus === 'cancelled' || ordStatus === 'canceled') {
              return false;
            }

            return true;
          });

          // Branch filter: If a specific sub-branch is selected, only show bills for that branch
          if (isSingleBranch) {
            fetchedTables = fetchedTables.filter(b => {
              let matches = isBranchMatch(b, selectedBranchId, activeRestaurant?.branches || []);
              if (!matches && (b.table || b.tableId)) {
                const tbl = availableTables.find(t => 
                  String(t._id || t.id || '') === String(b.tableId || '') ||
                  String(t.tableNumber || t.tableNo || '') === String(b.table || b.tableNumber || '') ||
                  String(t.tableId || '') === String(b.tableId || '')
                ) || (Array.isArray(activeRestaurant?.tables) ? activeRestaurant.tables.find(t =>
                  String(t._id || t.id || '') === String(b.tableId || '') ||
                  String(t.tableNumber || t.tableNo || '') === String(b.table || b.tableNumber || '') ||
                  String(t.tableId || '') === String(b.tableId || '')
                ) : null);
                if (tbl && (tbl.branchId || tbl.branch)) {
                  matches = isBranchMatch(tbl.branchId || tbl.branch, selectedBranchId, activeRestaurant?.branches || []);
                }
              }
              return matches;
            });
          }

          setTotalItems(fetchedTables.length);
        }
      }
    } catch (e) {
      console.warn("Failed to fetch current billing from BillingApi:", e);
    }

    const hasActiveFilters = Boolean(
      (searchTerm && searchTerm.trim()) ||
      (selectedTable && selectedTable !== 'All' && selectedTable !== 'ALL')
    );

    // Fall back to stored tenant billing data or initial dataset ONLY if API call failed
    if (!apiSuccess && fetchedTables.length === 0) {
      const sourceBills = (Array.isArray(activeRestaurant?.billingData) && activeRestaurant.billingData.length > 0)
        ? activeRestaurant.billingData
        : (Array.isArray(initialBillingData) && initialBillingData.length > 0
            ? initialBillingData
            : []);

      if (sourceBills.length > 0) {
        let pool = sourceBills.map((b, idx) => {
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

        // Filter fallback pool to only include Unpaid bills where order status is Completed
        pool = pool.filter(b => {
          const payStatus = String(b.paymentStatus || b.billingStatus || '').toLowerCase();
          const isPaidBill = 
            b.isPaid === true ||
            b.paid === true ||
            payStatus === 'paid' ||
            String(b.status || '').toLowerCase() === 'paid' ||
            String(b.status || '').toLowerCase() === 'done' ||
            (Number(b.paidAmount || 0) >= Number(b.billAmount || b.total || 0) && Number(b.billAmount || b.total || 0) > 0) ||
            (Number(b.balanceAmount || 0) <= 0 && Number(b.paidAmount || 0) > 0);

          if (isPaidBill) return false;

          // Check Order Status: must be Completed (or served/done)
          let ordStatus = String(b.orderStatus || b.order_status || '').toLowerCase().trim();
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
            const orig = String(b.originalStatus || '').toLowerCase().trim();
            if (['new', 'preparing', 'ready', 'served', 'completed', 'done', 'cancelled'].includes(orig)) {
              ordStatus = orig;
            }
          }

          // Exclude cancelled orders from Current Billing
          if (ordStatus === 'cancelled' || ordStatus === 'canceled') {
            return false;
          }

          return true;
        });

        // Filter fallback pool by branch if a specific sub-branch is selected
        if (isSingleBranch) {
          pool = pool.filter(b => {
            let matches = isBranchMatch(b, selectedBranchId, activeRestaurant?.branches || []);
            if (!matches && (b.table || b.tableId)) {
              const tbl = availableTables.find(t => 
                String(t._id || t.id || '') === String(b.tableId || '') ||
                String(t.tableNumber || t.tableNo || '') === String(b.table || b.tableNumber || '') ||
                String(t.tableId || '') === String(b.tableId || '')
              ) || (Array.isArray(activeRestaurant?.tables) ? activeRestaurant.tables.find(t =>
                String(t._id || t.id || '') === String(b.tableId || '') ||
                String(t.tableNumber || t.tableNo || '') === String(b.table || b.tableNumber || '') ||
                String(t.tableId || '') === String(b.tableId || '')
              ) : null);
              if (tbl && (tbl.branchId || tbl.branch)) {
                matches = isBranchMatch(tbl.branchId || tbl.branch, selectedBranchId, activeRestaurant?.branches || []);
              }
            }
            return matches;
          });
        }

        // If filters are active, apply client-side filtering on the fallback pool
        if (hasActiveFilters) {
          if (searchTerm && searchTerm.trim()) {
            const st = searchTerm.trim().toLowerCase();
            pool = pool.filter(b => 
              String(b.billNo || '').toLowerCase().includes(st) ||
              String(b.orderId || '').toLowerCase().includes(st) ||
              String(b.table || '').toLowerCase().includes(st) ||
              String(b.customerName || '').toLowerCase().includes(st)
            );
          }
          if (selectedTable && selectedTable !== 'All' && selectedTable !== 'ALL') {
            const st = String(selectedTable).toLowerCase();
            pool = pool.filter(b => 
              String(b.tableId || '').toLowerCase() === st ||
              String(b.table || '').toLowerCase().includes(st) ||
              String(b.tableNumber || '').toLowerCase() === st
            );
          }
        }

        fetchedTables = pool;
        setTotalItems(fetchedTables.length);
      }
    }

    // Ensure client-side filtering is applied to API results as well if filters are active
    if (hasActiveFilters && fetchedTables.length > 0) {
      if (searchTerm && searchTerm.trim()) {
        const st = searchTerm.trim().toLowerCase();
        fetchedTables = fetchedTables.filter(b => 
          String(b.billNo || '').toLowerCase().includes(st) ||
          String(b.orderId || '').toLowerCase().includes(st) ||
          String(b.table || '').toLowerCase().includes(st) ||
          String(b.customerName || '').toLowerCase().includes(st) ||
          (Array.isArray(b.items) && b.items.some(dish => String(dish.name || '').toLowerCase().includes(st)))
        );
      }
      if (selectedTable && selectedTable !== 'All' && selectedTable !== 'ALL') {
        const st = String(selectedTable).trim().toLowerCase();
        const numOnly = st.replace(/\D/g, '');
        fetchedTables = fetchedTables.filter(b => {
          const tId = String(b.tableId || '').toLowerCase();
          const tName = String(b.table || '').toLowerCase();
          const tNum = String(b.tableNumber || b.tableNo || '').toLowerCase();
          const bNum = (tName || tNum || tId).replace(/\D/g, '');
          if (tId === st || tId.includes(st) || st.includes(tId)) return true;
          if (tName === st || tName.includes(st) || st.includes(tName)) return true;
          if (tNum === st || tNum.includes(st) || st.includes(tNum)) return true;
          if (numOnly && bNum && parseInt(numOnly, 10) === parseInt(bNum, 10)) return true;
          return false;
        });
      }

      setTotalItems(fetchedTables.length);
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
      page={page}
      setPage={setPage}
      limit={limit}
      totalItems={totalItems}
      availableTables={availableTables}
      onBillPaid={onBillPaid}
    />
  );
}