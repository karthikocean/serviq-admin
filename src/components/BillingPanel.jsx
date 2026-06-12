import React from 'react';
import { Badge } from './Badge';

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
  const selectedBillData = billingData.find(b => b.table === selectedBillingTable) || { table: selectedBillingTable, orders: 0, total: 0, status: 'Paid' };

  // Find active orders for selected billing table to show details
  const billingNum = selectedBillingTable.replace('Table ', '');
  const activeTableOrders = orders.filter(o => (o.table === billingNum || parseInt(o.table) === parseInt(billingNum)) && o.billingStatus === 'unpaid');

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
    alert(`Marked bill as paid for ${selectedBillingTable}!`);
  };

  return (
    <section className="panel-view active">
      <div className="panel-header-flex" style={{ marginBottom: '20px' }}>
        <div className="panel-title-desc">
          <h2 className="panel-inner-title">Billing Panel</h2>
          <p className="panel-inner-desc">Manage table bills, GST and payment status</p>
        </div>
      </div>

      {/* Active Tables Row */}
      <div style={{ marginBottom: '24px', background: '#ffffff', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--black)' }}>Active Tables</h3>
          <span style={{ background: 'var(--primary)', color: 'white', fontSize: '11px', fontWeight: 'bold', padding: '4px 10px', borderRadius: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{billingData.length} ACTIVE</span>
        </div>
        
        <div style={{ display: 'flex', overflowX: 'auto', gap: '16px', paddingBottom: '16px', scrollbarWidth: 'thin' }}>
          {billingData.map(b => (
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
                  <span style={{ color: 'var(--primary)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>Edit</span>
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
          {billingData.length === 0 && (
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
              <button className="btn btn-outline" style={{ padding: '8px 12px', fontSize: '12px', fontWeight: 600 }}>Edit</button>
              <button className="btn btn-outline" style={{ padding: '8px 12px', fontSize: '12px', fontWeight: 600, color: '#ef4444', borderColor: '#fca5a5' }}>Delete</button>
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
                { id: 'UPI', label: 'UPI / QR Code', icon: '', desc: 'Instant digital payment' },
                { id: 'Card', label: 'Credit / Debit Card', icon: '', desc: 'Visa, Mastercard, RuPay' },
                { id: 'Cash', label: 'Cash', icon: '', desc: 'Manual reconciliation' }
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
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: isSelected ? 'rgba(255,122,0,0.1)' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
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
                  onClick={() => alert('PDF invoice downloaded!')}
                  style={{ padding: '12px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: '600' }}
                >
                  Print
                </button>
                <button 
                  className="btn btn-outline" 
                  onClick={() => alert('Invoice link copied!')}
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
    </section>
  );
}
