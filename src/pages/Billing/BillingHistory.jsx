import React, { useEffect, useState } from 'react';
import { useAppState } from '../../config/AppContext';
import BillingHistoryPanel from '../../components/BillingHistoryPanel';
import BillingApi from '../../api/Billing';

export default function BillingHistory() {
  const { activeRestaurant } = useAppState();
  const [historyData, setHistoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (activeRestaurant) {
      fetchHistory();
    }
  }, [activeRestaurant]);

  const fetchHistory = async () => {
    setIsLoading(true);
    const result = await BillingApi.getBillingHistory();
    if (result.status && result.response.data) {
      const mappedData = result.response.data.map(item => ({
        id: item.invoiceId,
        orderId: item.orderRefId,
        table: item.tableNumber,
        branchId: item.branchId,
        date: new Date(item.createdAt).toLocaleDateString(),
        time: new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        amount: item.totalAmount,
        paymentMethod: item.paymentMethod === 'upi' ? 'UPI' : item.paymentMethod.charAt(0).toUpperCase() + item.paymentMethod.slice(1),
        staff: item.staffName,
        status: item.paymentStatus,
        items: item.items,
        subtotal: item.subtotal,
        tax: item.tax,
        discount: item.discount,
        charge: item.charge
      }));
      setHistoryData(mappedData);
    }
    setIsLoading(false);
  };

  if (!activeRestaurant) return null;

  return (
    <BillingHistoryPanel
      billingHistory={historyData}
      branches={activeRestaurant.branches || []}
      isLoading={isLoading}
    />
  );
}
