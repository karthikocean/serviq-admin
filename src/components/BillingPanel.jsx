import React, { useState } from 'react';
import { Badge } from './Badge';
import { Modal } from './Modal';
import ShowNotifications from '../helper/ShowNotifications.js';
import BillingApi from '../api/Billing.js';
import OrderApi from '../api/Order.js';

const PencilIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill={color} viewBox="0 0 16 16" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-3.5 1a.5.5 0 0 0-.374.374l1 3.5a.5.5 0 0 0 .49.49l3.468-1.026z" />
  </svg>
);

const TrashIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    <line x1="10" x2="10" y1="11" y2="17" />
    <line x1="14" x2="14" y1="11" y2="17" />
  </svg>
);

const PlusIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export default function BillingPanel({
  billingData = [],
  setBillingData,
  selectedBillingTable = '',
  setSelectedBillingTable,
  activeRestaurant = {},
  billingPaymentMethod = 'UPI',
  setBillingPaymentMethod,
  fetchBillingData,
  selectedBranchId
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editItems, setEditItems] = useState([]);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const displayBillingData = billingData || [];

  const selectedBillData = displayBillingData.find(b => 
    (selectedBillingTable && (
      b.tableId === selectedBillingTable ||
      b._id === selectedBillingTable ||
      b.id === selectedBillingTable ||
      b.table === selectedBillingTable ||
      String(b.tableNumber) === String(selectedBillingTable) ||
      String(b.tableNo) === String(selectedBillingTable)
    ))
  ) || displayBillingData[0] || {
    tableId: selectedBillingTable,
    table: 'Unknown Table',
    orders: 0,
    total: 0,
    status: 'Paid',
    items: [],
    orderIds: []
  };

  const isSettled = selectedBillData.status !== 'Unpaid';
  const billingItems = selectedBillData.items || [];
  const orderIdDisplay = selectedBillData.orderId ? `${selectedBillData.orderId}` : '';

  // Pagination for bill items
  const [itemsPage, setItemsPage] = useState(0);
  const itemsPerPage = 6;
  const totalItemsPages = Math.ceil(billingItems.length / itemsPerPage) || 1;
  const paginatedBillingItems = billingItems.slice(itemsPage * itemsPerPage, (itemsPage + 1) * itemsPerPage);

  React.useEffect(() => {
    setItemsPage(0);
  }, [selectedBillingTable]);

  const taxRate = activeRestaurant.settings?.taxRate || 0.025; // split tax (5% total)
  const serviceRate = activeRestaurant.settings?.serviceChargeRate || 0;

  const subtotal = billingItems.reduce((acc, curr) => acc + (Number(curr.amount) || ((Number(curr.qty || curr.quantity || 1)) * (Number(curr.rate || curr.price || 0)))), 0);
  const taxAmt = parseFloat((subtotal * taxRate * 2).toFixed(2));
  const serviceAmt = parseFloat((subtotal * serviceRate).toFixed(2));
  const totalAmt = subtotal + taxAmt + serviceAmt;

  // Mark as Paid
  const handleMarkAsPaidSubmit = async () => {
    const currentTableId = selectedBillData.tableId || selectedBillData._id || selectedBillingTable;
    if (!currentTableId) return;
    const response = await BillingApi.processTablePayment({
      branchId: selectedBranchId,
      tableId: currentTableId,
      paymentMethod: billingPaymentMethod.toLowerCase()
    });

    if (response.status) {
      ShowNotifications.showAlertNotification(`Marked bill as paid for ${selectedBillData.table}!`, true);
      if (typeof fetchBillingData === 'function') {
        fetchBillingData();
      }
    }
  };

  // Open Edit Modal
  const handleOpenEditModal = () => {
    const rawItems = selectedBillData.items || [];
    if (rawItems.length === 0) {
      if (Number(selectedBillData.total) > 0) {
        setEditItems([{
          name: `${selectedBillData.table} Order`,
          qty: 1,
          rate: Number(selectedBillData.total) || 0,
          amount: Number(selectedBillData.total) || 0
        }]);
        setIsEditing(true);
        return;
      }
      setEditItems([{
        name: '',
        qty: 1,
        rate: 0,
        amount: 0
      }]);
      setIsEditing(true);
      return;
    }
    const cloned = rawItems.map(item => {
      const q = Number(item.qty ?? item.quantity ?? item.count ?? 1) || 1;
      const r = Number(item.rate ?? item.price ?? item.itemPrice ?? item.unitPrice ?? 0) || 0;
      return {
        ...item,
        name: item.name || item.menuItem?.name || item.dishName || item.title || 'Item',
        qty: q,
        rate: r,
        amount: Number(item.amount) || (q * r)
      };
    });
    setEditItems(cloned);
    setIsEditing(true);
  };

  // Add Item in Edit Modal
  const handleAddItemToEdit = () => {
    setEditItems(prev => [
      ...prev,
      { name: '', qty: 1, rate: 0, amount: 0 }
    ]);
  };

  // Remove Item in Edit Modal
  const handleRemoveItemFromEdit = (index) => {
    setEditItems(prev => prev.filter((_, i) => i !== index));
  };

  // Update Item in Edit Modal
  const handleEditItemChange = (index, field, value) => {
    setEditItems(prev => {
      const updated = [...prev];
      const cur = { ...updated[index] };
      if (field === 'qty') {
        const q = Math.max(1, Number(value) || 1);
        cur.qty = q;
        cur.amount = q * (Number(cur.rate) || 0);
      } else if (field === 'rate') {
        const r = Math.max(0, Number(value) || 0);
        cur.rate = r;
        cur.amount = (Number(cur.qty) || 1) * r;
      } else {
        cur[field] = value;
      }
      updated[index] = cur;
      return updated;
    });
  };

  // Save Edit Changes
  const handleSaveEditBill = async () => {
    const validItems = editItems.filter(it => it.name && it.name.trim() && Number(it.qty) > 0);
    if (validItems.length === 0) {
      ShowNotifications.showAlertNotification('Please add at least one item with a valid name and quantity.', false);
      return;
    }

    setIsSavingEdit(true);
    try {
      const processedItems = validItems.map(it => {
        const q = Number(it.qty) || 1;
        const r = Number(it.rate) || 0;
        return {
          ...it,
          name: it.name.trim(),
          qty: q,
          quantity: q,
          rate: r,
          price: r,
          amount: q * r
        };
      });

      const newSub = processedItems.reduce((sum, it) => sum + it.amount, 0);
      const newTax = parseFloat((newSub * taxRate * 2).toFixed(2));
      const newService = parseFloat((newSub * serviceRate).toFixed(2));
      const newTot = parseFloat((newSub + newTax + newService).toFixed(2));

      // 1. Update backend order if targetOrderId exists
      const targetOrderId = selectedBillData.rawOrderId || selectedBillData.orderId || (selectedBillData.orderIds && selectedBillData.orderIds[0]);
      if (targetOrderId && typeof targetOrderId === 'string' && targetOrderId.length >= 10 && !targetOrderId.startsWith('#')) {
        try {
          await OrderApi.updateOrder(targetOrderId, {
            items: processedItems,
            total: newTot,
            subtotal: newSub,
            totalAmount: newTot
          });
        } catch (e) {
          console.warn("Backend order update notice:", e);
        }
      }

      // 2. Update local state
      const currentTableIdentifier = selectedBillData.tableId || selectedBillData._id || selectedBillData.id || selectedBillingTable;
      if (typeof setBillingData === 'function') {
        setBillingData(prev => prev.map(b => {
          const isTarget = 
            (b.tableId && b.tableId === currentTableIdentifier) ||
            (b._id && b._id === currentTableIdentifier) ||
            (b.id && b.id === currentTableIdentifier) ||
            (b.table && b.table === selectedBillData.table) ||
            (selectedBillingTable && (b.tableId === selectedBillingTable || b._id === selectedBillingTable));

          if (isTarget) {
            return {
              ...b,
              items: processedItems,
              total: newTot,
              subtotal: newSub
            };
          }
          return b;
        }));
      }

      setIsEditing(false);
      ShowNotifications.showAlertNotification(`Bill items updated for ${selectedBillData.table}!`, true);
    } catch (err) {
      console.error("Failed to save edited bill:", err);
      ShowNotifications.showAlertNotification('Failed to update bill items.', false);
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Open Delete Modal
  const handleOpenDeleteModal = () => {
    if (!selectedBillData || (!selectedBillingTable && displayBillingData.length === 0)) {
      ShowNotifications.showAlertNotification('No active bill to delete.', false);
      return;
    }
    setShowDeleteModal(true);
  };

  // Confirm Delete Bill
  const handleConfirmDeleteBill = async () => {
    setIsDeleting(true);
    try {
      const targetOrderId = selectedBillData.rawOrderId || selectedBillData.orderId || (selectedBillData.orderIds && selectedBillData.orderIds[0]);
      
      // Delete all associated orders from backend if valid ObjectId
      if (Array.isArray(selectedBillData.orderIds) && selectedBillData.orderIds.length > 0) {
        for (const oId of selectedBillData.orderIds) {
          if (oId && typeof oId === 'string' && oId.length >= 10 && !oId.startsWith('#')) {
            try {
              await OrderApi.deleteOrder(oId);
            } catch (err) {
              console.warn("Could not delete order on backend:", err);
            }
          }
        }
      } else if (targetOrderId && typeof targetOrderId === 'string' && targetOrderId.length >= 10 && !targetOrderId.startsWith('#')) {
        try {
          await OrderApi.deleteOrder(targetOrderId);
        } catch (err) {
          console.warn("Could not delete order on backend:", err);
        }
      }

      // Remove table bill from local state
      const currentTableIdentifier = selectedBillData.tableId || selectedBillData._id || selectedBillData.id || selectedBillingTable;
      if (typeof setBillingData === 'function') {
        setBillingData(prev => {
          const updated = prev.filter(b => 
            (b.tableId || b._id || b.id || b.table) !== currentTableIdentifier &&
            b.table !== selectedBillData.table &&
            b.tableId !== selectedBillingTable &&
            b._id !== selectedBillingTable
          );
          if (updated.length > 0) {
            setSelectedBillingTable(updated[0].tableId || updated[0]._id || updated[0].id || updated[0].table);
          } else {
            setSelectedBillingTable('');
          }
          return updated;
        });
      }

      setShowDeleteModal(false);
      ShowNotifications.showAlertNotification(`Bill for ${selectedBillData.table} deleted successfully.`, true);
    } catch (err) {
      console.error("Failed to delete bill:", err);
      ShowNotifications.showAlertNotification('Failed to delete bill.', false);
    } finally {
      setIsDeleting(false);
    }
  };

  // Live calculation for edit modal
  const editSubtotal = editItems.reduce((sum, it) => sum + (Number(it.qty || 1) * Number(it.rate || 0)), 0);
  const editTax = parseFloat((editSubtotal * taxRate * 2).toFixed(2));
  const editService = parseFloat((editSubtotal * serviceRate).toFixed(2));
  const editTotal = editSubtotal + editTax + editService;

  return (
    <section className="panel-view active">
      <div className="panel-header-flex" style={{ marginBottom: '20px' }}>
        <div className="panel-title-desc">
          <h2 className="panel-inner-title">Billing</h2>
        </div>
      </div>

      {/* Active Tables Row */}
      <div style={{ marginBottom: '24px', background: '#ffffff', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--black)' }}>Active Tables</h3>
          <span style={{ background: 'var(--primary)', color: 'white', fontSize: '11px', fontWeight: 'bold', padding: '4px 10px', borderRadius: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{displayBillingData.length} ACTIVE</span>
        </div>

        <div style={{ display: 'flex', overflowX: 'auto', gap: '16px', paddingBottom: '16px', scrollbarWidth: 'thin' }}>
          {displayBillingData.map(b => (
            <div
              key={b.tableId || b._id || b.table}
              onClick={() => setSelectedBillingTable(b.tableId || b._id || b.table)}
              style={{
                minWidth: '240px',
                border: (selectedBillingTable === (b.tableId || b._id || b.table) || selectedBillData.table === b.table) ? '2px solid var(--primary)' : '1px solid var(--border)',
                borderRadius: '12px',
                padding: '16px',
                background: (selectedBillingTable === (b.tableId || b._id || b.table) || selectedBillData.table === b.table) ? '#fffcf9' : '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <strong style={{ fontSize: '16px', fontWeight: '700', color: 'var(--black)' }}>{b.table}</strong>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: '800',
                    color: b.status === 'Paid' ? '#16a34a' : '#ef4444',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {b.status}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>
                <span title={b.orderId}>{b.orderId || 'No Order'}</span>
                <span>•</span>
                <span>{b.items?.length || 0} items</span>
              </div>
              <div style={{ textAlign: 'right', fontSize: '20px', fontWeight: '800', color: 'var(--black)' }}>
                ₹{Number(b.total || 0).toLocaleString('en-IN')}
              </div>
            </div>
          ))}
          {displayBillingData.length === 0 && (
            <div style={{ padding: '20px', color: '#94a3b8' }}>No active dining transactions available.</div>
          )}
        </div>
      </div>

      {/* Split Bottom View: Summary & Payment */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>

        {/* Bill Summary details */}
        <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--black)', margin: 0 }}>Bill Summary</h3>
                {isSettled && (
                  <span style={{ fontSize: '10px', fontWeight: '800', background: '#dcfce7', color: '#16a34a', padding: '2px 8px', borderRadius: '6px' }}>
                    SETTLED / PAID
                  </span>
                )}
              </div>
              <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                {orderIdDisplay ? `Order ID: ${orderIdDisplay}` : 'Order Summary'} • {selectedBillData.table}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                title="Edit Bill Items"
                aria-label="Edit Bill"
                style={{
                  padding: '8px 14px',
                  fontSize: '12px',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  borderRadius: '8px',
                  border: '1.5px solid #fed7aa',
                  background: '#fff7ed',
                  color: '#ea580c',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#ffedd5'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#fff7ed'; }}
                onClick={handleOpenEditModal}
              >
                <PencilIcon size={14} color="#ea580c" />
                <span>Edit</span>
              </button>
              <button
                type="button"
                title="Delete Bill"
                aria-label="Delete Bill"
                style={{
                  padding: '8px 14px',
                  fontSize: '12px',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  borderRadius: '8px',
                  border: '1.5px solid #fecaca',
                  background: '#fef2f2',
                  color: '#dc2626',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#fef2f2'; }}
                onClick={handleOpenDeleteModal}
              >
                <TrashIcon size={14} color="#dc2626" />
                <span>Delete</span>
              </button>
            </div>
          </div>

          <table className="bill-items-table" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
            <thead>
              <tr style={{ backgroundColor: '#000000', color: '#ffffff', borderBottom: '3px solid #ff5a1f' }}>
                <th style={{ textAlign: 'left', padding: '14px 16px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff' }}>ITEM DESCRIPTION</th>
                <th style={{ textAlign: 'center', padding: '14px 16px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff' }}>QTY</th>
                <th style={{ textAlign: 'right', padding: '14px 16px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff' }}>RATE</th>
                <th style={{ textAlign: 'right', padding: '14px 16px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff' }}>AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {paginatedBillingItems.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '16px', textAlign: 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a' }}></span>
                      <strong style={{ fontSize: '14px', color: 'var(--black)' }}>{item.name}</strong>
                    </div>
                    {item.notes && (
                      <div style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic', marginLeft: '14px', marginTop: '4px' }}>
                        {item.notes}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center', fontWeight: '600' }}>{item.qty}</td>
                  <td style={{ padding: '16px', textAlign: 'right', color: '#64748b' }}>₹{Number(item.rate || 0).toFixed(2)}</td>
                  <td style={{ padding: '16px', textAlign: 'right', fontWeight: '700', color: 'var(--black)' }}>₹{Number(item.amount || (item.qty * item.rate) || 0).toFixed(2)}</td>
                </tr>
              ))}
              {billingItems.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>No items found for this table.</td>
                </tr>
              )}
            </tbody>
          </table>

          {billingItems.length > itemsPerPage && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              padding: '8px 12px',
              background: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
                Showing {billingItems.length === 0 ? 0 : itemsPage * itemsPerPage + 1} to {Math.min((itemsPage + 1) * itemsPerPage, billingItems.length)} of {billingItems.length} items
              </span>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => setItemsPage(p => Math.max(0, p - 1))}
                  disabled={itemsPage === 0}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: itemsPage === 0 ? '#f1f5f9' : '#ffffff',
                    color: itemsPage === 0 ? '#94a3b8' : '#0f172a',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: itemsPage === 0 ? 'not-allowed' : 'pointer'
                  }}
                >
                  Prev
                </button>
                <span style={{
                  minWidth: '24px',
                  height: '24px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 700,
                  background: '#000000',
                  color: '#ffffff'
                }}>
                  {itemsPage + 1}
                </span>
                <button
                  type="button"
                  onClick={() => setItemsPage(p => Math.min(totalItemsPages - 1, p + 1))}
                  disabled={itemsPage >= totalItemsPages - 1 || totalItemsPages === 0}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: (itemsPage >= totalItemsPages - 1 || totalItemsPages === 0) ? '#f1f5f9' : '#ffffff',
                    color: (itemsPage >= totalItemsPages - 1 || totalItemsPages === 0) ? '#94a3b8' : '#0f172a',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: (itemsPage >= totalItemsPages - 1 || totalItemsPages === 0) ? 'not-allowed' : 'pointer'
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {subtotal > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: '#64748b', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal</span>
                <span style={{ fontWeight: '700', color: 'var(--black)' }}>₹{subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>GST ({(taxRate * 100 * 2).toFixed(1)}%)</span>
                <span style={{ fontWeight: '700', color: 'var(--black)' }}>₹{taxAmt.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Service Charge ({(serviceRate * 100).toFixed(1)}%)</span>
                <span style={{ fontWeight: '700', color: 'var(--black)' }}>₹{serviceAmt.toFixed(2)}</span>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '18px', fontWeight: '700', color: 'var(--primary)' }}>Grand Total</span>
            <span style={{ fontSize: '24px', fontWeight: '800', color: 'var(--primary)' }}>₹{totalAmt.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Method */}
        {subtotal > 0 ? (
          <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--black)', marginBottom: '4px' }}>Payment Method</h3>
              <p style={{ fontSize: '13px', color: '#64748b' }}>Select preference for {selectedBillData.table}</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
              {[
                {
                  id: 'UPI',
                  label: 'UPI / QR Code',
                  icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M0 .5A.5.5 0 0 1 .5 0h3a.5.5 0 0 1 0 1H1v2.5a.5.5 0 0 1-1 0zm12 0a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-1 0V1h-2.5a.5.5 0 0 1-.5-.5M.5 12a.5.5 0 0 1 .5.5V15h2.5a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5v-3a.5.5 0 0 1 .5-.5m15 0a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1 0-1H15v-2.5a.5.5 0 0 1 .5-.5M4 4h1v1H4z" /><path d="M7 2H2v5h5zM3 3h3v3H3zm2 8H4v1h1z" /><path d="M7 9H2v5h5zm-4 1h3v3H3zm8-6h1v1h-1z" /><path d="M9 2h5v5H9zm1 1v3h3V3zM8 8v2h1v1H8v1h2v-2h1v2h1v-1h2v-1h-3V8zm2 2H9V9h1zm4 2h-1v1h-2v1h3zm-4 2v-1H8v1z" /><path d="M12 9h2V8h-2z" /></svg>,
                  desc: 'Instant digital payment'
                },
                {
                  id: 'Card',
                  label: 'Credit / Debit Card',
                  icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v1h14V4a1 1 0 0 0-1-1zm13 4H1v5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1z" /><path d="M2 10a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1z" /></svg>,
                  desc: 'Visa, Mastercard, RuPay'
                },
                {
                  id: 'Cash',
                  label: 'Cash',
                  icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M1 3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1zm7 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4" /><path d="M0 5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1zm3 0a2 2 0 0 1-2 2v4a2 2 0 0 1 2 2h10a2 2 0 0 1 2-2V7a2 2 0 0 1-2-2z" /></svg>,
                  desc: 'Manual reconciliation'
                }
              ].map(method => {
                const isSelected = billingPaymentMethod === method.id;
                return (
                  <div
                    key={method.id}
                    onClick={() => setBillingPaymentMethod(method.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '16px',
                      borderRadius: '12px',
                      border: isSelected ? '2px solid var(--primary)' : '1px solid #e2e8f0',
                      background: isSelected ? '#fffcf9' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: isSelected ? 'rgba(255,122,0,0.1)' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isSelected ? 'var(--primary)' : '#94a3b8' }}>
                      {method.icon}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--black)' }}>{method.label}</span>
                      <span style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{method.desc}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <button
                className="btn"
                onClick={handleMarkAsPaidSubmit}
                style={{
                  width: '100%',
                  padding: '16px',
                  fontSize: '16px',
                  fontWeight: '700',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  boxShadow: '0 4px 14px rgba(255, 122, 0, 0.3)',
                  cursor: 'pointer'
                }}
              >
                Mark as Paid
              </button>

            </div>
          </div>
        ) : (
          <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', color: '#94a3b8' }}>
              <div style={{ marginBottom: '16px', color: 'var(--primary)' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z"></path><path d="M16 14H8"></path><path d="M16 10H8"></path></svg>
              </div>
              <p>No active bill to settle.</p>
            </div>
          </div>
        )}
      </div>

      {/* EDIT BILL MODAL */}
      <Modal
        isOpen={isEditing}
        onClose={() => !isSavingEdit && setIsEditing(false)}
        title={`Edit Bill - ${selectedBillData.table || 'Table'}`}
        maxWidth="640px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: '#64748b' }}>Modify items, quantities, or prices:</span>
            <button
              type="button"
              onClick={handleAddItemToEdit}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 700,
                borderRadius: '6px',
                border: '1px solid #fed7aa',
                background: '#fff7ed',
                color: '#ea580c',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <PlusIcon size={13} color="#ea580c" />
              <span>Add Item</span>
            </button>
          </div>

          {/* Items Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 80px 100px 80px 36px', gap: '10px', background: '#000000', color: '#ffffff', padding: '10px 12px', borderRadius: '8px 8px 0 0', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            <div>Item Name</div>
            <div style={{ textAlign: 'center' }}>Qty</div>
            <div style={{ textAlign: 'right' }}>Rate (₹)</div>
            <div style={{ textAlign: 'right' }}>Total (₹)</div>
            <div></div>
          </div>

          {/* Items List */}
          <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', padding: '4px' }}>
            {editItems.map((item, index) => (
              <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 80px 100px 80px 36px', gap: '10px', alignItems: 'center', background: '#f8fafc', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <input
                  type="text"
                  placeholder="Item Name"
                  value={item.name}
                  onChange={e => handleEditItemChange(index, 'name', e.target.value)}
                  style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
                <input
                  type="number"
                  min="1"
                  value={item.qty}
                  onChange={e => handleEditItemChange(index, 'qty', e.target.value)}
                  style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', textAlign: 'center', boxSizing: 'border-box' }}
                />
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={item.rate}
                  onChange={e => handleEditItemChange(index, 'rate', e.target.value)}
                  style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', textAlign: 'right', boxSizing: 'border-box' }}
                />
                <div style={{ fontSize: '13px', fontWeight: 800, textAlign: 'right', color: '#0f172a' }}>
                  ₹{(Number(item.qty || 1) * Number(item.rate || 0)).toFixed(2)}
                </div>
                <button
                  type="button"
                  title="Remove item"
                  onClick={() => handleRemoveItemFromEdit(index)}
                  style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}
                >
                  ✕
                </button>
              </div>
            ))}
            {editItems.length === 0 && (
              <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: '13px' }}>
                No items in bill. Click "+ Add Item" to add an item.
              </div>
            )}
          </div>

          {/* Live Summary Preview */}
          <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '12px 16px', border: '1px solid #e2e8f0', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
              <span>Subtotal:</span>
              <strong style={{ color: '#0f172a' }}>₹{editSubtotal.toFixed(2)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
              <span>GST (5%):</span>
              <strong style={{ color: '#0f172a' }}>₹{editTax.toFixed(2)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ea580c', borderTop: '1px solid #e2e8f0', paddingTop: '6px', fontSize: '15px' }}>
              <strong>Grand Total:</strong>
              <strong>₹{editTotal.toFixed(2)}</strong>
            </div>
          </div>

          {/* Modal Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
            <button
              type="button"
              disabled={isSavingEdit}
              onClick={() => setIsEditing(false)}
              style={{
                padding: '9px 18px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#334155',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSavingEdit}
              onClick={handleSaveEditBill}
              style={{
                padding: '9px 24px',
                borderRadius: '8px',
                border: 'none',
                background: '#ff5a1f',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 700,
                cursor: isSavingEdit ? 'not-allowed' : 'pointer',
                opacity: isSavingEdit ? 0.7 : 1
              }}
            >
              {isSavingEdit ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </Modal>

      {/* DELETE BILL CONFIRMATION MODAL */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => !isDeleting && setShowDeleteModal(false)}
        title="Delete Bill"
        maxWidth="460px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: '#fef2f2', padding: '14px 16px', borderRadius: '10px', border: '1px solid #fecaca' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
              ⚠️
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#991b1b' }}>
                Are you sure you want to delete this bill?
              </div>
              <div style={{ fontSize: '12px', color: '#b91c1c', marginTop: '2px' }}>
                This will delete the active order and clear items for <strong>{selectedBillData.table}</strong> (Amount: ₹{Number(selectedBillData.total || 0).toLocaleString('en-IN')}).
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => setShowDeleteModal(false)}
              style={{
                padding: '9px 18px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#334155',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleConfirmDeleteBill}
              style={{
                padding: '9px 22px',
                borderRadius: '8px',
                border: 'none',
                background: '#dc2626',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 700,
                cursor: isDeleting ? 'not-allowed' : 'pointer',
                opacity: isDeleting ? 0.7 : 1
              }}
            >
              {isDeleting ? 'Deleting...' : 'Yes, Delete Bill'}
            </button>
          </div>
        </div>
      </Modal>
    </section>
  );
}