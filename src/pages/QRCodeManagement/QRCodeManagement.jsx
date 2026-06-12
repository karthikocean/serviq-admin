import React from 'react';
import { useAppState } from '../../config/AppContext';
import QRManagementPanel from '../../components/QRManagementPanel';
import './QRCodeManagement.css';

export default function QRCodeManagement() {
  const {
    activeRestaurant,
    generateQrCode,
    assignQrCode,
    revokeQrCode,
    deleteQrCode
  } = useAppState();

  if (!activeRestaurant) return null;

  return (
    <QRManagementPanel
      activeRestaurant={activeRestaurant}
      generateQrCode={generateQrCode}
      assignQrCode={assignQrCode}
      revokeQrCode={revokeQrCode}
      deleteQrCode={deleteQrCode}
    />
  );
}
