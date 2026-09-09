import React, { useState, useEffect } from 'react';
import { useAppState, DEFAULT_ROLES } from '../../config/AppContext';
import BillingPanel from '../../components/BillingPanel';
import BillingApi from '../../api/Billing';
import OrderApi from '../../api/Order';
import './Billing.css';

export default function Billing() {
  const {
    currentUser,
    activeRestaurant,
    selectedBranchId
  } = useAppState();

  const [selectedBillingTable, setSelectedBillingTable] = useState('');
  const [billingPaymentMethod, setBillingPaymentMethod] = useState('UPI');
  const [billingData, setBillingData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (activeRestaurant) {
      fetchBillingData();
    }
  }, [activeRestaurant, selectedBranchId]);

  const fetchBillingData = async () => {
    setIsLoading(true);

    const isSingleBranch = selectedBranchId && selectedBranchId !== 'ALL' && selectedBranchId !== 'all';
    const params = isSingleBranch ? { branchId: selectedBranchId } : { branchId: 'ALL' };

    let fetchedTables = [];
    try {
      const tablesRes = await BillingApi.getActiveTables(params);
      if (tablesRes && tablesRes.status && tablesRes.response) {
        const d = tablesRes.response.data || tablesRes.response.tables || tablesRes.response;
        if (Array.isArray(d)) {
          fetchedTables = d;
        }
      }
    } catch (e) {
      console.warn("Failed to fetch active tables from BillingApi:", e);
    }

    // Fallback: If no tables returned by API, derive active tables from OrderApi / activeRestaurant.orders
    if (fetchedTables.length === 0) {
      try {
        const orderParams = isSingleBranch ? { branchId: selectedBranchId, limit: 1000 } : { limit: 1000 };
        const orderRes = await OrderApi.getOrders(orderParams).catch(() => null);
        const oResp = orderRes?.status ? (orderRes.response?.data || orderRes.response?.orders || orderRes.response) : null;
        const orderList = Array.isArray(oResp) ? oResp : (Array.isArray(activeRestaurant?.orders) ? activeRestaurant.orders : []);

        const activeOrders = orderList.filter(o => {
          const st = String(o.status || '').toLowerCase();
          return st !== 'cancelled' && st !== 'rejected';
        });

        const tableMap = new Map();
        activeOrders.forEach(o => {
          const tNum = o.tableNumber || o.tableNo || (typeof o.table === 'object' ? (o.table?.tableNumber || o.table?.name) : o.table) || (typeof o.tableId === 'object' ? (o.tableId?.tableNumber || o.tableId?.name) : o.tableId) || '1';
          const tKey = String(tNum).replace(/^Table\s*/i, '').trim();
          const tId = (typeof o.tableId === 'object' ? (o.tableId?._id || o.tableId?.id) : o.tableId) || tKey;
          
          const items = (Array.isArray(o.items) ? o.items : []).map(it => {
            const q = Number(it.quantity ?? it.qty ?? 1) || 1;
            const r = Number(it.price ?? it.rate ?? it.itemPrice ?? 0) || 0;
            return {
              name: it.name || it.menuItem?.name || it.dishName || 'Item',
              qty: q,
              rate: r,
              amount: q * r,
              notes: it.notes || ''
            };
          });

          const tot = Number(o.total || o.totalAmount || o.grandTotal || items.reduce((s, i) => s + i.amount, 0)) || 0;
          const isPaid = String(o.billingStatus || o.paymentStatus || o.status || '').toLowerCase() === 'paid' || String(o.status || '').toLowerCase() === 'completed';

          if (!tableMap.has(tKey)) {
            tableMap.set(tKey, {
              tableId: tId,
              table: `Table ${tKey}`,
              orders: 1,
              orderId: o.orderId || o.id || (o._id ? `#${String(o._id).slice(-5).toUpperCase()}` : '#ORD-001'),
              rawOrderId: o._id || o.id,
              total: tot,
              status: isPaid ? 'Paid' : 'Unpaid',
              items: items,
              orderIds: [o._id || o.id].filter(Boolean)
            });
          } else {
            const existing = tableMap.get(tKey);
            existing.orders += 1;
            existing.total += tot;
            existing.items.push(...items);
            if (o._id || o.id) existing.orderIds.push(o._id || o.id);
            if (!isPaid) existing.status = 'Unpaid';
          }
        });

        if (tableMap.size > 0) {
          fetchedTables = Array.from(tableMap.values());
        }
      } catch (err) {
        console.warn("Could not derive active tables from orders:", err);
      }
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

  // Permission checks
  const role = currentUser?.role || 'Waiter';
  const hasPermission = (moduleName, action = 'view') => {
    if (role === 'Admin') return true;
    const rolesConfig = activeRestaurant?.roles || DEFAULT_ROLES;
    const userRoleConfig = rolesConfig[role] || DEFAULT_ROLES[role] || { permissions: {} };
    const modulePermissions = userRoleConfig.permissions?.[moduleName] || {};
    return !!modulePermissions[action];
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
    />
  );
}