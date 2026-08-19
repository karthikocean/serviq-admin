import React from 'react';
import { Badge } from './Badge';
import ShowNotifications from '../helper/ShowNotifications.js';

const PencilIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill={color} viewBox="0 0 16 16" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-3.5 1a.5.5 0 0 0-.374.374l1 3.5a.5.5 0 0 0 .49.49l3.468-1.026z"/>
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

export default function BillingPanel({
  billingData = [],
  selectedBillingTable = '',
  setSelectedBillingTable,
  orders = [],
  activeRestaurant = {},
  billingPaymentMethod = 'UPI',
  setBillingPaymentMethod,
  markBillAsPaid
}) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editItems, setEditItems] = React.useState([]);

  // --- DUMMY DATA INJECTION ---
  const dummyBillingData = [
    { table: 'Table 01', orders: 2, total: 756, status: 'Unpaid' },
    { table: 'Table 02', orders: 3, total: 1239, status: 'Unpaid' },
    { table: 'Table 03', orders: 1, total: 320, status: 'Paid' },
    { table: 'Table 05', orders: 2, total: 924, status: 'Unpaid' },
    { table: 'Table 07', orders: 4, total: 2121, status: 'Unpaid' }
  ];

  const dummyOrders = [
    {
      id: "845", table: "01", status: "preparing", billingStatus: "unpaid",
      items: [{ name: "Masala Dosa", qty: 5, price: 120 }, { name: "Filter Coffee", qty: 3, price: 40 }]
    },
    {
      id: "842", table: "02", status: "preparing", billingStatus: "unpaid",
      items: [{ name: "Chicken Biryani", qty: 2, price: 320 }, { name: "Dal Makhani", qty: 2, price: 160 }, { name: "Paneer Tikka", qty: 1, price: 180 }, { name: "Masala Chai", qty: 1, price: 40 }]
    },
    {
      id: "847", table: "03", status: "done", billingStatus: "paid",
      items: [{ name: "Chicken Biryani", qty: 1, price: 320 }, { name: "Masala Chai", qty: 2, price: 40 }]
    },
    {
      id: "844", table: "05", status: "ready", billingStatus: "unpaid",
      items: [{ name: "Paneer Tikka", qty: 2, price: 180 }, { name: "Chicken Biryani", qty: 1, price: 320 }, { name: "Butter Naan", qty: 3, price: 40 }, { name: "Masala Chai", qty: 2, price: 40 }]
    },
    {
      id: "846", table: "07", status: "preparing", billingStatus: "unpaid",
      items: [{ name: "Chicken Biryani", qty: 4, price: 320 }, { name: "Dal Makhani", qty: 3, price: 160 }, { name: "Paneer Tikka", qty: 1, price: 180 }, { name: "Masala Chai", qty: 2, price: 40 }]
    }
  ];

  const displayBillingData = billingData && billingData.length > 0 ? billingData : dummyBillingData;
  const displayOrders = orders && orders.length > 0 ? orders : dummyOrders;
  // -----------------------------


  const selectedBillData = displayBillingData.find(b => b.table === selectedBillingTable) || { table: selectedBillingTable, orders: 0, total: 0, status: 'Paid' };

  // Find active orders for selected billing table to show details
  const billingNum = selectedBillingTable.replace('Table ', '');
  const activeTableOrders = displayOrders.filter(o => (o.table === billingNum || parseInt(o.table) === parseInt(billingNum)) && o.billingStatus === 'unpaid');

  // Combine items from all unpaid orders of this table
  const billingItems = [];
  activeTableOrders.forEach(o => {
    o.items.forEach(item => {
      const exist = billingItems.find(x => x.name === item.name);
      if (exist) {
        exist.qty += item.qty;
        exist.amount += item.qty * item.price;
      } else {
        billingItems.push({ name: item.name, qty: item.qty, rate: item.price, amount: item.qty * item.price });
      }
    });
  });

  const taxRate = activeRestaurant.settings?.taxRate || 0.025; // split tax
  const serviceRate = activeRestaurant.settings?.serviceChargeRate || 0;

  const subtotal = billingItems.reduce((acc, curr) => acc + curr.amount, 0);
  const taxAmt = parseFloat((subtotal * taxRate * 2).toFixed(2));
  const serviceAmt = parseFloat((subtotal * serviceRate).toFixed(2));
  const totalAmt = subtotal + taxAmt + serviceAmt;

  const handleMarkAsPaidSubmit = () => {
    if (!selectedBillingTable) return;
    markBillAsPaid(activeRestaurant.id, selectedBillingTable);
    ShowNotifications.showAlertNotification(`Marked bill as paid for ${selectedBillingTable}!`, true);
  };

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
              key={b.table}
              onClick={() => setSelectedBillingTable(b.table)}
              style={{
                minWidth: '240px',
                border: selectedBillingTable === b.table ? '2px solid var(--primary)' : '1px solid var(--border)',
                borderRadius: '12px',
                padding: '16px',
                background: selectedBillingTable === b.table ? '#fffcf9' : '#ffffff',
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
                  <span style={{ color: 'var(--primary)', display: 'inline-flex', alignItems: 'center' }}>
                    <PencilIcon size={12} />
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>
                <span>{b.orders} Guests</span>
                <span>•</span>
                <span>30 mins</span>
              </div>
              <div style={{ textAlign: 'right', fontSize: '20px', fontWeight: '800', color: 'var(--black)' }}>
                ₹{b.total}
              </div>
            </div>
          ))}
          {displayBillingData.length === 0 && (
            <div style={{ padding: '20px', color: '#94a3b8' }}>No dining transactions available.</div>
          )}
        </div>
      </div>

      {/* Split Bottom View: Summary & Payment */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
        
        {/* Bill Summary details */}
        <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--black)', marginBottom: '4px' }}>Bill Summary</h3>
              <p style={{ fontSize: '13px', color: '#64748b' }}>Order ID: #ORD-845 • {selectedBillingTable}</p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                title="Edit Bill"
                aria-label="Edit Bill"
                style={{ 
                  padding: '8px 12px', 
                  fontSize: '12px', 
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: '#ffffff',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-main)'; }}
                onClick={() => {
                  setEditItems(billingItems.map(item => ({ ...item })));
                  setIsEditing(true);
                }}
              >
                <PencilIcon size={14} />
              </button>
              <button 
                title="Delete Bill"
                aria-label="Delete Bill"
                style={{ 
                  padding: '8px 12px', 
                  fontSize: '12px', 
                  fontWeight: 600, 
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  borderRadius: '8px',
                  border: '1px solid #fca5a5', 
                  background: '#fff',
                  color: '#ef4444',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; }}
                onClick={() => {
                  ShowNotifications.showAlertNotification('Bill deleted', false);
                }}
              >
                <TrashIcon size={14} color="#000000ff" />
              </button>
            </div>
          </div>

          <table className="bill-items-table" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
            <thead>
              <tr style={{ background: '#111111', color: '#ffffff' }}>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '11px', fontWeight: '700', letterSpacing: '0.5px' }}>ITEM DESCRIPTION</th>
                <th style={{ textAlign: 'center', padding: '12px 16px', fontSize: '11px', fontWeight: '700', letterSpacing: '0.5px' }}>QTY</th>
                <th style={{ textAlign: 'right', padding: '12px 16px', fontSize: '11px', fontWeight: '700', letterSpacing: '0.5px' }}>RATE</th>
                <th style={{ textAlign: 'right', padding: '12px 16px', fontSize: '11px', fontWeight: '700', letterSpacing: '0.5px' }}>AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {billingItems.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '16px', textAlign: 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a' }}></span>
                      <strong style={{ fontSize: '14px', color: 'var(--black)' }}>{item.name}</strong>
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic', marginLeft: '14px', marginTop: '4px' }}>
                      Extra Butter, Sambar separate
                    </div>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center', fontWeight: '600' }}>{item.qty}</td>
                  <td style={{ padding: '16px', textAlign: 'right', color: '#64748b' }}>₹{(item.rate).toFixed(2)}</td>
                  <td style={{ padding: '16px', textAlign: 'right', fontWeight: '700', color: 'var(--black)' }}>₹{(item.amount).toFixed(2)}</td>
                </tr>
              ))}
              {billingItems.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>No unpaid items found. This bill is settled.</td>
                </tr>
              )}
            </tbody>
          </table>

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
              <p style={{ fontSize: '13px', color: '#64748b' }}>Select preference for {selectedBillingTable}</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
              {[
                { 
                  id: 'UPI', 
                  label: 'UPI / QR Code', 
                  icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M0 .5A.5.5 0 0 1 .5 0h3a.5.5 0 0 1 0 1H1v2.5a.5.5 0 0 1-1 0zm12 0a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-1 0V1h-2.5a.5.5 0 0 1-.5-.5M.5 12a.5.5 0 0 1 .5.5V15h2.5a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5v-3a.5.5 0 0 1 .5-.5m15 0a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1 0-1H15v-2.5a.5.5 0 0 1 .5-.5M4 4h1v1H4z"/><path d="M7 2H2v5h5zM3 3h3v3H3zm2 8H4v1h1z"/><path d="M7 9H2v5h5zm-4 1h3v3H3zm8-6h1v1h-1z"/><path d="M9 2h5v5H9zm1 1v3h3V3zM8 8v2h1v1H8v1h2v-2h1v2h1v-1h2v-1h-3V8zm2 2H9V9h1zm4 2h-1v1h-2v1h3zm-4 2v-1H8v1z"/><path d="M12 9h2V8h-2z"/></svg>, 
                  desc: 'Instant digital payment' 
                },
                { 
                  id: 'Card', 
                  label: 'Credit / Debit Card', 
                  icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v1h14V4a1 1 0 0 0-1-1zm13 4H1v5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1z"/><path d="M2 10a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1z"/></svg>, 
                  desc: 'Visa, Mastercard, RuPay' 
                },
                { 
                  id: 'Cash', 
                  label: 'Cash', 
                  icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M1 3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1zm7 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4"/><path d="M0 5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1zm3 0a2 2 0 0 1-2 2v4a2 2 0 0 1 2 2h10a2 2 0 0 1 2-2V7a2 2 0 0 1-2-2z"/></svg>, 
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button 
                  className="btn btn-outline" 
                  onClick={() => ShowNotifications.showAlertNotification('PDF invoice downloaded!', true)}
                  style={{ padding: '12px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: '600' }}
                >
                  Print
                </button>
                <button 
                  className="btn btn-outline" 
                  onClick={() => ShowNotifications.showAlertNotification('Invoice link copied!', true)}
                  style={{ padding: '12px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: '600' }}
                >
                  Share
                </button>
              </div>

              <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '16px' }}>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: '1.5' }}>
                  <strong style={{ color: 'var(--black)' }}>Billing Tip:</strong> Ensure that tips or service charges are explicitly authorized before processing the transaction.
                </p>
              </div>
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

      {isEditing && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '560px',
            border: '3px solid #ff5a1f',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '800', margin: 0, color: '#0f172a' }}>Edit Bill Items</h3>
              <button 
                onClick={() => setIsEditing(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            {/* Table Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 1fr', background: '#111111', color: 'white', borderBottom: '3px solid #ff5a1f' }}>
              <div style={{ padding: '16px 24px', fontSize: '11px', fontWeight: '800', letterSpacing: '0.5px', color: '#ffffff', textTransform: 'uppercase' }}>ITEM NAME</div>
              <div style={{ padding: '16px', fontSize: '11px', fontWeight: '800', letterSpacing: '0.5px', color: '#ffffff', textAlign: 'center', background: '#1a1a1a', textTransform: 'uppercase' }}>QTY</div>
              <div style={{ padding: '16px 24px', fontSize: '11px', fontWeight: '800', letterSpacing: '0.5px', color: '#ffffff', textAlign: 'center', textTransform: 'uppercase' }}>RATE</div>
            </div>

            {/* Table Body */}
            <div style={{ padding: '0 24px', maxHeight: '400px', overflowY: 'auto' }}>
              {editItems.map((item, index) => (
                <div key={index} style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 1fr', gap: '16px', padding: '16px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <input 
                    value={item.name} 
                    onChange={(e) => {
                      const newItems = [...editItems];
                      newItems[index] = { ...newItems[index], name: e.target.value };
                      setEditItems(newItems);
                    }}
                    style={{ padding: '10px 16px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px', outline: 'none', color: '#0f172a' }}
                  />
                  <input 
                    type="number"
                    value={item.qty} 
                    onChange={(e) => {
                      const newItems = [...editItems];
                      newItems[index] = { ...newItems[index], qty: Number(e.target.value) };
                      setEditItems(newItems);
                    }}
                    style={{ padding: '10px 16px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px', textAlign: 'center', outline: 'none', color: '#0f172a' }}
                  />
                  <input 
                    type="number"
                    value={item.rate} 
                    onChange={(e) => {
                      const newItems = [...editItems];
                      newItems[index] = { ...newItems[index], rate: Number(e.target.value) };
                      setEditItems(newItems);
                    }}
                    style={{ padding: '10px 16px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px', textAlign: 'center', outline: 'none', color: '#0f172a' }}
                  />
                </div>
              ))}
            </div>

            {/* Actions */}
            <div style={{ padding: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                onClick={() => setIsEditing(false)}
                style={{ padding: '10px 24px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', fontWeight: '700', color: '#0f172a', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  // In a real app we'd trigger an API to update
                  setIsEditing(false);
                }}
                style={{ padding: '10px 24px', background: '#ff5a1f', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '700', color: 'white', cursor: 'pointer' }}
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
