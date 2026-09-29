import React from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import InventoryCategoryPanel from '../../components/InventoryCategoryPanel';
import { useAppState } from '../../config/AppContext';
import { isModuleAllowedForPlan } from '../../config/initialData';

export default function InventoryCategoryListPage() {
  const navigate = useNavigate();
  const { activeRestaurant } = useAppState();

  const isPremium = isModuleAllowedForPlan('inventory', activeRestaurant);
  if (!isPremium) {
    return <Navigate to="/inventory" replace />;
  }

  return (
    <div style={{ width: '100%' }}>
      <InventoryCategoryPanel onBack={() => navigate('/inventory')} />
    </div>
  );
}
