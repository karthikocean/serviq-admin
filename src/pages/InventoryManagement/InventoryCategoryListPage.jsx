import React from 'react';
import { useNavigate } from 'react-router-dom';
import InventoryCategoryPanel from '../../components/InventoryCategoryPanel';

export default function InventoryCategoryListPage() {
  const navigate = useNavigate();

  return (
    <div style={{ width: '100%' }}>
      <InventoryCategoryPanel onBack={() => navigate('/inventory')} />
    </div>
  );
}
