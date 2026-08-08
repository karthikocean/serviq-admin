import React, { useState } from 'react';
import { useAppState } from '../../config/AppContext';
import OrdersPanel from '../../components/OrdersPanel';
import { Badge } from '../../components/Badge';
import ShowNotifications from '../../helper/ShowNotifications.js';
import './OrderManagement.css';

export default function OrderManagement() {
  const {
    activeRestaurant,
    updateOrder,
    deleteOrder,
    updateOrderStatus
  } = useAppState();

  const [orderFilter, setOrderFilter] = useState('All');
  const [selectedWaiterFilter, setSelectedWaiterFilter] = useState('All Waiters');
  const [waiterDropdownOpen, setWaiterDropdownOpen] = useState(false);
  
  const [activeViewOrder, setActiveViewOrder] = useState(null);
  const [activeEditOrder, setActiveEditOrder] = useState(null);
  const [editOrderForm, setEditOrderForm] = useState({ table: '', notes: '', waiter: 'Unassigned' });
  const [activePage, setActivePage] = useState(null); // null | 'order-edit-form' | 'order-view'

  if (!activeRestaurant) return null;

  const { orders = [], staff = [], plan = 'Standard' } = activeRestaurant;

  const getWaiterLabel = (s) => {
    const activeOrdersForWaiters = orders.filter(o => o.status !== 'done');
    if (s.status === 'Off Duty') {
      return `${s.name} (Off Duty)`;
    }
    const assigned = activeOrdersForWaiters
      .filter(o => o.waiter === s.name)
      .map(o => `Table ${o.table}`);
    const uniqueTables = [...new Set(assigned)];
    if (uniqueTables.length > 0) {
      return `${s.name} (Serving ${uniqueTables.join(', ')})`;
    } else {
      return `${s.name} (Available)`;
    }
  };

  const sty = {
    pageInlineHeader: { display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '2px solid var(--primary-light)' },
    pageBackBtn: { background: '#fff', border: '1.5px solid var(--border)', borderRadius: '10px', width: '38px', height: '38px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '16px', transition: 'all 0.2s', flexShrink: 0 },
    pageCard: { background: '#fff', borderRadius: '16px', padding: '32px', border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' },
  };

  const PageHeader = ({ title, subtitle }) => (
    <div style={sty.pageInlineHeader}>
      <button style={sty.pageBackBtn} onClick={() => { setActivePage(null); setActiveEditOrder(null); }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'inherit'; }}
      >→</button>
      <div>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, fontFamily: "'Outfit', sans-serif" }}>{title}</h2>
        {subtitle && <span style={{ fontSize: '12px', color: '#64748b' }}>{subtitle}</span>}
      </div>
    </div>
  );

  return (
    <div style={{ width: '100%' }}>
      {activePage === 'order-edit-form' && activeEditOrder ? (
        <section>
          <div style={{ width: '100%' }}>
            <PageHeader title="Edit Order Details" subtitle={`Modify details for order #ORD-${activeEditOrder.id}`} />
            <div style={sty.pageCard}>
              <form onSubmit={(e) => {
                e.preventDefault();
                updateOrder(activeRestaurant.id, activeEditOrder.id, {
                  table: editOrderForm.table,
                  notes: editOrderForm.notes,
                  waiter: editOrderForm.waiter
                });
                setActiveEditOrder(null);
                setActivePage(null);
                ShowNotifications.showAlertNotification('Order updated successfully!', true);
              }} style={{ width: '100%' }}>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-main)' }}>Table Number</label>
                  <input
                    type="text"
                    value={editOrderForm.table}
                    readOnly
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--bg-tertiary)',
                      color: 'var(--text-main)',
                      cursor: 'not-allowed',
                      opacity: 0.8
                    }}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-main)' }}>Assigned Waiter</label>
                  <select
                    value={editOrderForm.waiter}
                    onChange={e => setEditOrderForm({ ...editOrderForm, waiter: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'white', color: 'black' }}
                  >
                    <option value="Unassigned">Unassigned</option>
                    {staff.filter(s => s.role === 'Waiter').map(s => (
                      <option key={s.id} value={s.name} disabled={s.status === 'Off Duty'}>
                        {getWaiterLabel(s)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-main)' }}>Notes</label>
                  <textarea
                    value={editOrderForm.notes}
                    onChange={e => setEditOrderForm({ ...editOrderForm, notes: e.target.value })}
                    rows="3"
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => {
                      setActiveEditOrder(null);
                      setActivePage(null);
                    }}
                    style={{ padding: '10px 24px' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-black"
                    style={{ padding: '10px 24px' }}
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      ) : activePage === 'order-view' && activeViewOrder ? (
        <section>
          <div style={{ width: '100%' }}>
            <div style={sty.pageCard}>
              {/* Order Info Bar */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '16px', 
                padding: '20px 24px', 
                background: '#f8fafc', 
                borderRadius: '12px', 
                border: '1px solid var(--border)', 
                marginBottom: '28px' 
              }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Table Number</span>
                  <strong style={{ fontSize: '16px', color: 'var(--text-main)' }}>Table {activeViewOrder.table}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Order Time</span>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>
                    {activeViewOrder.time} <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary)' }}>({activeViewOrder.timeAgo})</span>
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Order Status</span>
                  <Badge status={activeViewOrder.status} />
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Assigned Waiter</span>
                  <strong style={{ fontSize: '14px', color: 'var(--text-main)' }}>{activeViewOrder.waiter || 'Unassigned'}</strong>
                </div>
              </div>

              {activeViewOrder.notes && (
                <div style={{ padding: '12px 16px', background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: '10px', marginBottom: '24px', fontSize: '13px', color: '#d48806' }}>
                  <strong>Order Notes:</strong> {activeViewOrder.notes}
                </div>
              )}

              {/* Items Table */}
              <div style={{ marginBottom: '28px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 14px 0', color: 'var(--text-main)', fontFamily: "'Outfit', sans-serif" }}>Items Summary</h3>
                <div className="menu-table-wrapper" style={{ maxHeight: 'none' }}>
                  <table className="menu-items-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left', padding: '14px 16px' }}>Item Name</th>
                        <th style={{ textAlign: 'center', padding: '14px 16px' }}>Qty</th>
                        <th style={{ textAlign: 'right', padding: '14px 16px' }}>Unit Price</th>
                        <th style={{ textAlign: 'right', padding: '14px 16px' }}>Total Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeViewOrder.items.map((item, idx) => (
                        <tr key={idx}>
                          <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-main)' }}>{item.name}</td>
                          <td style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 700 }}>{item.qty}</td>
                          <td style={{ padding: '14px 16px', textAlign: 'right', color: '#64748b' }}>₹{(item.price || 0).toFixed(2)}</td>
                          <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 700, color: 'var(--text-main)' }}>₹{((item.price || 0) * item.qty).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Calculation & Total Box */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
                <div style={{ width: '100%', maxWidth: '340px', background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#64748b' }}>
                    <span>Subtotal</span>
                    <strong style={{ color: 'var(--text-main)' }}>₹{(activeViewOrder.subtotal || 0).toFixed(2)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#64748b' }}>
                    <span>Tax</span>
                    <strong style={{ color: 'var(--text-main)' }}>₹{(activeViewOrder.tax || 0).toFixed(2)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 800, borderTop: '2px solid var(--border)', paddingTop: '12px', marginTop: '4px' }}>
                    <span style={{ color: 'var(--primary)' }}>Grand Total</span>
                    <span style={{ color: 'var(--primary)' }}>₹{(activeViewOrder.total || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '28px' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setActiveViewOrder(null);
                    setActivePage(null);
                  }}
                  style={{ padding: '10px 24px' }}
                >
                  Back to Orders
                </button>
                <button
                  type="button"
                  className="btn btn-black"
                  onClick={() => ShowNotifications.showAlertNotification('Printing order receipt...', true)}
                  style={{ padding: '10px 24px' }}
                >
                  Print Receipt
                </button>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <OrdersPanel
          orders={orders}
          staff={staff}
          orderFilter={orderFilter}
          setOrderFilter={setOrderFilter}
          selectedWaiterFilter={selectedWaiterFilter}
          setSelectedWaiterFilter={setSelectedWaiterFilter}
          waiterDropdownOpen={waiterDropdownOpen}
          setWaiterDropdownOpen={setWaiterDropdownOpen}
          setActiveViewOrder={(ord) => {
            setActiveViewOrder(ord);
            setActivePage('order-view');
          }}
          setActivePage={setActivePage}
          setActiveEditOrder={setActiveEditOrder}
          setEditOrderForm={setEditOrderForm}
          deleteOrder={deleteOrder}
          activeRestaurant={activeRestaurant}
          updateOrderStatus={updateOrderStatus}
          plan={plan}
        />
      )}
    </div>
  );
}
