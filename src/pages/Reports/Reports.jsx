import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppState } from '../../config/AppContext';
import ReportsPanel from '../../components/ReportsPanel';
import OrderApi from '../../api/Order';
import MenuApi from '../../api/Menu';
import UserApi from '../../api/User';
import { initialOrders, initialMenu, initialStaff, initialInventory } from '../../config/initialData';
import './Reports.css';

export default function Reports() {
  const { activeRestaurant, selectedBranchId, hasPermission } = useAppState();
  const [searchParams, setSearchParams] = useSearchParams();

  const [liveOrders, setLiveOrders] = useState([]);
  const [liveMenu, setLiveMenu] = useState([]);
  const [liveStaff, setLiveStaff] = useState([]);

  useEffect(() => {
    let isSubscribed = true;
    const fetchLiveReportData = async () => {
      try {
        const isBranchFiltered = selectedBranchId && selectedBranchId !== 'ALL' && selectedBranchId !== 'All' && String(selectedBranchId).toUpperCase() !== 'COMPANY';
        const branchParam = isBranchFiltered ? { branchId: selectedBranchId, limit: 10, page: 0 } : { limit: 10, page: 0 };

        const [orderRes, menuRes, userRes] = await Promise.allSettled([
          OrderApi.getOrders(branchParam),
          MenuApi.getMenuItems({ limit: 10, page: 0 }),
          UserApi.getUsers(branchParam)
        ]);

        if (isSubscribed) {
          if (orderRes.status === 'fulfilled' && orderRes.value?.status) {
            const resp = orderRes.value.response;
            const list = Array.isArray(resp) ? resp : (Array.isArray(resp?.data) ? resp.data : (Array.isArray(resp?.orders) ? resp.orders : (Array.isArray(resp?.data?.orders) ? resp.data.orders : [])));
            if (list.length > 0) setLiveOrders(list);
          }
          if (menuRes.status === 'fulfilled' && menuRes.value?.status) {
            const resp = menuRes.value.response;
            const list = Array.isArray(resp) ? resp : (Array.isArray(resp?.data) ? resp.data : (Array.isArray(resp?.items) ? resp.items : []));
            if (list.length > 0) setLiveMenu(list);
          }
          if (userRes.status === 'fulfilled' && userRes.value?.status) {
            const resp = userRes.value.response;
            const list = Array.isArray(resp) ? resp : (Array.isArray(resp?.data) ? resp.data : (Array.isArray(resp?.users) ? resp.users : (Array.isArray(resp?.staff) ? resp.staff : [])));
            if (list.length > 0) setLiveStaff(list);
          }
        }
      } catch (err) {
        console.warn('Reports page live data fetch note:', err);
      }
    };

    fetchLiveReportData();
    return () => { isSubscribed = false; };
  }, [selectedBranchId, activeRestaurant?.id]);

  const validTabs = [
    { id: 'sales', perm: 'reports_sales' },
    { id: 'items', perm: 'reports_items' },
    { id: 'orders', perm: 'reports_orders' },
    { id: 'inventory', perm: 'reports_inventory' },
    { id: 'staff', perm: 'reports_staff' },
    { id: 'tax', perm: 'reports_tax' }
  ];

  const allowedTabs = validTabs.filter(t => hasPermission(t.perm, 'view')).map(t => t.id);
  const fallbackTab = allowedTabs.length > 0 ? allowedTabs[0] : 'sales';

  const tabParam = searchParams.get('tab');
  const mappedTab = (tabParam === 'waiter' || tabParam === 'kitchen') ? 'staff' : tabParam;
  const activeTab = (allowedTabs.length > 0 && allowedTabs.includes(mappedTab)) 
    ? mappedTab 
    : (allowedTabs.length > 0 ? fallbackTab : (validTabs.map(t => t.id).includes(mappedTab) ? mappedTab : 'sales'));

  if (!activeRestaurant) return null;

  const branches = useMemo(() => activeRestaurant?.branches || [], [activeRestaurant?.branches]);

  const orders = useMemo(() => {
    if (liveOrders.length > 0) return liveOrders;
    if (Array.isArray(activeRestaurant?.orders) && activeRestaurant.orders.length > 0) return activeRestaurant.orders;
    return initialOrders;
  }, [liveOrders, activeRestaurant?.orders]);

  const menu = useMemo(() => {
    if (liveMenu.length > 0) return liveMenu;
    if (Array.isArray(activeRestaurant?.menu) && activeRestaurant.menu.length > 0) return activeRestaurant.menu;
    return initialMenu;
  }, [liveMenu, activeRestaurant?.menu]);

  const staff = useMemo(() => {
    if (liveStaff.length > 0) return liveStaff;
    if (Array.isArray(activeRestaurant?.staff) && activeRestaurant.staff.length > 0) return activeRestaurant.staff;
    if (Array.isArray(activeRestaurant?.users) && activeRestaurant.users.length > 0) return activeRestaurant.users;
    return initialStaff;
  }, [liveStaff, activeRestaurant?.staff, activeRestaurant?.users]);

  const inventory = useMemo(() => {
    if (Array.isArray(activeRestaurant?.inventory) && activeRestaurant.inventory.length > 0) return activeRestaurant.inventory;
    return initialInventory;
  }, [activeRestaurant?.inventory]);

  const handleTabChange = (tabId) => {
    setSearchParams({ tab: tabId });
  };

  return (
    <ReportsPanel
      key={activeTab}
      branches={branches}
      selectedBranchId={selectedBranchId}
      activeRestaurant={activeRestaurant}
      initialTab={activeTab}
      activeTabProp={activeTab}
      onTabChange={handleTabChange}
      orders={orders}
      menu={menu}
      inventory={inventory}
      staff={staff}
    />
  );
}
