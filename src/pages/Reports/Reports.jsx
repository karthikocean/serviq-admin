import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppState } from '../../config/AppContext';
import ReportsPanel from '../../components/ReportsPanel';
import './Reports.css';

export default function Reports() {
  const { activeRestaurant, selectedBranchId } = useAppState();
  const [searchParams] = useSearchParams();
  const validTabs = ['sales', 'items', 'orders', 'waiter', 'kitchen', 'tax'];
  const tabParam = searchParams.get('tab');
  const initialTab = validTabs.includes(tabParam) ? tabParam : 'sales';

  if (!activeRestaurant) return null;

  const branches = React.useMemo(() => activeRestaurant?.branches || [], [activeRestaurant?.branches]);

  return (
    <ReportsPanel
      key={initialTab}
      branches={branches}
      selectedBranchId={selectedBranchId}
      activeRestaurant={activeRestaurant}
      initialTab={initialTab}
    />
  );
}
