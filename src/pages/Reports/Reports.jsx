import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppState } from '../../config/AppContext';
import ReportsPanel from '../../components/ReportsPanel';
import './Reports.css';

export default function Reports() {
  const { activeRestaurant, selectedBranchId } = useAppState();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'kitchen' ? 'kitchen' : 'waiter';

  if (!activeRestaurant) return null;

  const branches = activeRestaurant.branches || [];

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
