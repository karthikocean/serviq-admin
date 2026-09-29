import React from 'react';
import { Navigate } from 'react-router-dom';
import StockReductionPanel from '../../components/StockReductionPanel';
import { useAppState } from '../../config/AppContext';
import { isModuleAllowedForPlan } from '../../config/initialData';

export default function StockReductionPage() {
  const { activeRestaurant } = useAppState();

  const isPremium = isModuleAllowedForPlan('inventory', activeRestaurant);
  if (!isPremium) {
    return <Navigate to="/inventory" replace />;
  }

  return (
    <div style={{ width: '100%' }}>
      <StockReductionPanel />
    </div>
  );
}
