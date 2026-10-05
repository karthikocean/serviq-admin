import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppState } from '../../config/AppContext';
import ReportsPanel from '../../components/ReportsPanel';
import './Reports.css';

export default function Reports() {
  const { activeRestaurant, selectedBranchId } = useAppState();
  const [searchParams, setSearchParams] = useSearchParams();
  const validTabs = ['sales', 'items', 'orders', 'inventory', 'staff', 'tax'];
  const tabParam = searchParams.get('tab');
  const mappedTab = (tabParam === 'waiter' || tabParam === 'kitchen') ? 'staff' : tabParam;
  const activeTab = validTabs.includes(mappedTab) ? mappedTab : 'sales';

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
