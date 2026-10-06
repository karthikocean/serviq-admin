import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppState } from '../../config/AppContext';
import ReportsPanel from '../../components/ReportsPanel';
import './Reports.css';

export default function Reports() {
  const { activeRestaurant, selectedBranchId, hasPermission } = useAppState();
  const [searchParams, setSearchParams] = useSearchParams();
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

  const branches = React.useMemo(() => activeRestaurant?.branches || [], [activeRestaurant?.branches]);

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
    />
  );
}
