import React, { useState } from 'react';
import { useAppState } from '../../config/AppContext';
import OrdersPanel from '../../components/OrdersPanel';
import { Badge } from '../../components/Badge';
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
                alert('Order updated successfully!');
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

      {/* MODAL OVERLAY FOR ORDER VIEW */}
      {activePage === 'order-view' && activeViewOrder && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '32px',
            border: '1px solid var(--border)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflowY: 'auto',
            position: 'relative'
          }}>
            <button
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'transparent',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: '#64748b'
              }}
              onClick={() => {
                setActiveViewOrder(null);
                setActivePage(null);
              }}
            >
              ✕
            </button>

            <h2 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: 800, fontFamily: "'Outfit', sans-serif", color: 'var(--black)' }}>
              Order Details
            </h2>
            <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '20px' }}>
              View details for order #ORD-{activeViewOrder.id}
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', marginBottom: '20px', color: '#000000' }}>
              <div><strong>Table:</strong> Table {activeViewOrder.table}</div>
              <div><strong>Time:</strong> {activeViewOrder.time} ({activeViewOrder.timeAgo})</div>
              <div><strong>Status:</strong> <Badge status={activeViewOrder.status} /></div>
              <div><strong>Assigned Waiter:</strong> {activeViewOrder.waiter || 'Unassigned'}</div>
              {activeViewOrder.notes && <div><strong>Notes:</strong> {activeViewOrder.notes}</div>}

              <div style={{ borderTop: '1px dashed var(--border)', paddingTop: '12px', marginTop: '8px' }}>
                <strong style={{ display: 'block', marginBottom: '8px' }}>Items Summary:</strong>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', fontSize: '12px', color: '#64748b' }}>
                      <th style={{ padding: '6px 0', background: 'transparent', color: '#64748b !important' }}>Item Name</th>
                      <th style={{ padding: '6px 0', textAlign: 'center', background: 'transparent', color: '#64748b !important' }}>Qty</th>
                      <th style={{ padding: '6px 0', textAlign: 'right', background: 'transparent', color: '#64748b !important' }}>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeViewOrder.items.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '13px' }}>
                        <td style={{ padding: '8px 0', color: 'black' }}>{item.name}</td>
                        <td style={{ padding: '8px 0', textAlign: 'center', color: 'black' }}>{item.qty}</td>
                        <td style={{ padding: '8px 0', textAlign: 'right', color: 'black' }}>₹{item.price * item.qty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', borderTop: '1px dashed var(--border)', paddingTop: '12px', marginTop: '8px', alignItems: 'flex-end' }}>
                <div>Subtotal: <strong>₹{activeViewOrder.subtotal}</strong></div>
                <div>Tax: <strong>₹{activeViewOrder.tax}</strong></div>
                <div>Total: <strong style={{ fontSize: '16px', color: 'var(--primary)' }}>₹{activeViewOrder.total}</strong></div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
              <button
                className="btn btn-black"
                style={{ padding: '10px 24px' }}
                onClick={() => {
                  setActiveViewOrder(null);
                  setActivePage(null);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
