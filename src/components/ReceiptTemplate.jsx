import React from 'react';

// Format number: clean integer if whole, or 2 decimals
export const formatReceiptNum = (val) => {
  const num = Number(val || 0);
  if (isNaN(num)) return '0';
  return num % 1 === 0 ? num.toFixed(0) : num.toFixed(2);
};

// Normalize data from any bill, invoice, or order object
export const normalizeReceiptData = (bill = {}, activeRestaurant = {}) => {
  const restaurantName = activeRestaurant?.name || activeRestaurant?.restaurantName || activeRestaurant?.businessName || 'Sriganda Palace';
  const restaurantAddress = activeRestaurant?.address || activeRestaurant?.location || 'Service Rd, T K Reddy Layout, Annaiah Reddy Layout, Banaswadi, Bengaluru, Karnataka 560043';
  const restaurantGst = activeRestaurant?.gstNo || activeRestaurant?.gstin || '29ADDPR8125K1Z2';

  // Customer Name
  const rawCust = bill.customerName || bill.customer?.name || bill.clientName || bill.order?.customerName || bill.order?.customer?.name || '';
  const custName = (rawCust && String(rawCust).trim()) ? String(rawCust).trim() : 'Siva Shankar';

  // Table
  const rawTable = bill.table || bill.tableNumber || bill.tableNo || (typeof bill.tableId === 'object' ? (bill.tableId?.tableNumber || bill.tableId?.tableNo) : bill.tableId) || '37';
  const tableNo = String(rawTable).replace(/^Table\s*/i, '').trim() || '37';

  // Invoice / Bill No
  const rawInv = bill.invoiceNo || bill.invoiceNumber || bill.billNo || bill.billNumber || bill.id || bill._id || '7767';
  const invNo = String(rawInv).replace(/^INV[\/-]*/i, '').replace(/^B[\/-]*/i, '').trim() || '7767';

  // Date & Time
  const d = bill.createdAt || bill.date || bill.createdDate || bill.timestamp || new Date();
  const dateObj = new Date(d);
  const isValidDate = !isNaN(dateObj.getTime());
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dateStr = isValidDate ? `${dateObj.getDate()} ${months[dateObj.getMonth()]} ${dateObj.getFullYear()}` : '16 May 2024';
  const timeStr = bill.time || (isValidDate ? dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '21:18');

  // Items
  const candidateItems = bill.items || bill.order?.items || bill.orderItems || [];
  const rawItems = Array.isArray(candidateItems) && candidateItems.length > 0 ? candidateItems : [
    { name: 'Mutton biriyani', qty: 4, rate: 400, amount: 1600 },
    { name: 'Tandoori Roti', qty: 5, rate: 30, amount: 150 },
    { name: 'Chilly chicken', qty: 2, rate: 250, amount: 500 },
    { name: 'Chicken pepper', qty: 3, rate: 250, amount: 750 }
  ];

  const items = rawItems.map(it => {
    const name = it.name || it.itemName || it.dishName || 'Item';
    const qty = Number(it.qty || it.quantity || 1);
    const rate = Number(it.rate || it.price || 0);
    const amount = Number(it.amount || it.total || (qty * rate));
    return { name, qty, rate, amount };
  });

  const subtotal = items.reduce((acc, it) => acc + it.amount, 0);
  const cgst = bill.cgst !== undefined ? Number(bill.cgst) : parseFloat((subtotal * 0.025).toFixed(2));
  const sgst = bill.sgst !== undefined ? Number(bill.sgst) : parseFloat((subtotal * 0.025).toFixed(2));
  const total = (bill.total !== undefined && Number(bill.total) > 0)
    ? Number(bill.total)
    : (bill.amount !== undefined && Number(bill.amount) > 0
      ? Number(bill.amount)
      : parseFloat((subtotal + cgst + sgst).toFixed(2)));

  const payMode = bill.paymentMethod || bill.paymentMode || bill.payMode || 'Cash';
  const isPaid = (bill.status || bill.paymentStatus || '').toLowerCase() === 'paid';

  return {
    restaurantName,
    restaurantAddress,
    restaurantGst,
    custName,
    tableNo,
    invNo,
    dateStr,
    timeStr,
    items,
    subtotal,
    cgst,
    sgst,
    total,
    payMode,
    isPaid
  };
};

// Standalone HTML Generator for Window.Print and Download
export const generateReceiptHtml = (data = {}, activeRestaurant = {}) => {
  const r = normalizeReceiptData(data, activeRestaurant);
  const itemsHtml = r.items.map(it => `
    <tr>
      <td style="padding: 6px 0; text-align: left; font-weight: 500; color: #1e293b; vertical-align: top;">${it.name}</td>
      <td style="padding: 6px 0; text-align: right; color: #1e293b; vertical-align: top;">₹${formatReceiptNum(it.rate)}</td>
      <td style="padding: 6px 0; text-align: center; color: #1e293b; vertical-align: top;">${it.qty}</td>
      <td style="padding: 6px 0; text-align: right; font-weight: 600; color: #0f172a; vertical-align: top;">₹${formatReceiptNum(it.amount)}</td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html>
<head>
  <title>Receipt - ${r.invNo}</title>
  <meta charset="utf-8" />
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #ffffff;
      color: #0f172a;
      padding: 24px;
      display: flex;
      justify-content: center;
      font-size: 13px;
    }
    @media print {
      body { padding: 0; background: transparent; }
      .receipt-box { box-shadow: none !important; border: none !important; width: 100% !important; max-width: 100% !important; padding: 0 !important; }
      @page { margin: 6mm; size: auto; }
    }
    .receipt-box {
      width: 100%;
      max-width: 380px;
      background: #ffffff;
      padding: 16px 20px;
    }
    .dashed-line {
      border-bottom: 1px dashed #94a3b8;
    }
    .receipt-divider {
      display: flex;
      align-items: center;
      margin: 14px 0 10px 0;
    }
    .receipt-divider .line {
      flex: 1;
      border-bottom: 1px dashed #94a3b8;
    }
    .receipt-divider span {
      padding: 0 10px;
      font-size: 11px;
      font-weight: 800;
      color: #334155;
      letter-spacing: 1.5px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12.5px;
    }
    th {
      font-weight: 700;
      color: #0f172a;
      padding: 5px 0;
    }
  </style>
</head>
<body>
  <div class="receipt-box">
    <!-- Green Sprout / Leaf icon -->
    <div style="text-align: center; margin-bottom: 4px;">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block;">
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path>
        <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path>
      </svg>
    </div>
    
    <!-- Restaurant Name -->
    <div style="font-size: 16px; font-weight: 800; color: #0f172a; text-align: center; letter-spacing: -0.2px;">
      ${r.restaurantName}
    </div>
    <!-- Address -->
    <div style="font-size: 12px; color: #475569; text-align: center; line-height: 1.4; margin: 4px auto; max-width: 320px;">
      ${r.restaurantAddress}
    </div>
    <!-- GST -->
    <div style="font-size: 12px; font-weight: 600; color: #334155; text-align: center;">
      GST No ${r.restaurantGst}
    </div>

    <!-- RECEIPT divider -->
    <div class="receipt-divider">
      <div class="line"></div>
      <span>RECEIPT</span>
      <div class="line"></div>
    </div>

    <!-- Metadata -->
    <div style="display: flex; justify-content: space-between; font-size: 12px; color: #334155; margin-bottom: 4px;">
      <span>Name: <strong style="color: #0f172a; font-weight: 600;">${r.custName}</strong></span>
      <span>Invoice No: <strong style="color: #0f172a; font-weight: 600;">${r.invNo}</strong></span>
    </div>
    <div style="display: flex; justify-content: space-between; font-size: 12px; color: #334155;">
      <span>Table: <strong style="color: #0f172a; font-weight: 600;">#${r.tableNo}</strong></span>
      <span>Date: <strong style="color: #0f172a; font-weight: 600;">${r.dateStr}</strong></span>
    </div>

    <div class="dashed-line" style="margin: 10px 0 8px 0;"></div>

    <!-- Table -->
    <table>
      <thead>
        <tr style="border-bottom: 1px dashed #94a3b8;">
          <th style="text-align: left; width: 46%;">Item</th>
          <th style="text-align: right; width: 20%;">Price</th>
          <th style="text-align: center; width: 14%;">Qty</th>
          <th style="text-align: right; width: 20%;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <div class="dashed-line" style="margin: 10px 0 12px 0;"></div>

    <!-- Totals -->
    <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 5px; font-size: 12.5px; color: #334155;">
      <div style="display: flex; justify-content: space-between; width: 190px;">
        <span style="font-weight: 600;">Sub-Total:</span>
        <span style="font-weight: 700; color: #0f172a;">₹ ${formatReceiptNum(r.subtotal)}</span>
      </div>
      <div style="display: flex; justify-content: space-between; width: 190px;">
        <span>CGST:</span>
        <span>2.5% &nbsp; ₹ ${formatReceiptNum(r.cgst)}</span>
      </div>
      <div style="display: flex; justify-content: space-between; width: 190px;">
        <span>SGST:</span>
        <span>2.5% &nbsp; ₹ ${formatReceiptNum(r.sgst)}</span>
      </div>
      <div style="border-bottom: 1px dashed #94a3b8; width: 190px; margin: 4px 0;"></div>
    </div>

    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-top: 6px;">
      <div style="font-size: 13px; font-weight: 700; color: #0f172a; padding-top: 2px;">
        Mode: <span>${r.payMode}</span>
      </div>
      <div style="text-align: right;">
        <div style="font-size: 13px; font-weight: 700; color: #0f172a;">Total: ₹</div>
        <div style="font-size: 20px; font-weight: 800; color: #0f172a; line-height: 1.1; margin-top: 2px;">
          ${formatReceiptNum(r.total)}
        </div>
      </div>
    </div>

    <div class="dashed-line" style="margin: 12px 0 10px 0;"></div>

    <!-- Footer -->
    <div style="text-align: center; color: #94a3b8; margin-top: 4px;">
      <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.5px;">**SAVE PAPER SAVE NATURE !!</div>
      <div style="font-size: 11px; margin-top: 3px;">Time: ${r.timeStr}</div>
    </div>

    <div class="dashed-line" style="margin: 10px 0 14px 0;"></div>
  </div>
  <script>
    window.onload = function() { window.print(); };
  </script>
</body>
</html>`;
};

// React UI Component for Dialog / Modal Display
export const ReceiptCard = ({
  data = {},
  activeRestaurant = {},
  onPrint,
  onDownload,
  onCollectPayment,
  isPaid = false
}) => {
  const r = normalizeReceiptData(data, activeRestaurant);

  return (
    <div style={{
      background: '#ffffff',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      color: '#0f172a',
      padding: '4px 0',
      width: '100%',
      maxWidth: '380px',
      margin: '0 auto',
      boxSizing: 'border-box'
    }}>
      {/* Green Sprout / Leaf Icon */}
      <div style={{ textAlign: 'center', marginBottom: '4px' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block' }}>
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path>
          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path>
        </svg>
      </div>

      {/* Restaurant Name */}
      <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', textAlign: 'center', letterSpacing: '-0.2px' }}>
        {r.restaurantName}
      </div>

      {/* Address */}
      <div style={{ fontSize: '12px', color: '#475569', textAlign: 'center', lineHeight: 1.4, margin: '4px auto', maxWidth: '320px' }}>
        {r.restaurantAddress}
      </div>

      {/* GST */}
      <div style={{ fontSize: '12px', fontWeight: 600, color: '#334155', textAlign: 'center' }}>
        GST No {r.restaurantGst}
      </div>

      {/* RECEIPT divider */}
      <div style={{ display: 'flex', alignItems: 'center', margin: '14px 0 10px 0' }}>
        <div style={{ flex: 1, borderBottom: '1px dashed #94a3b8' }}></div>
        <span style={{ padding: '0 10px', fontSize: '11px', fontWeight: 800, color: '#334155', letterSpacing: '1.5px' }}>
          RECEIPT
        </span>
        <div style={{ flex: 1, borderBottom: '1px dashed #94a3b8' }}></div>
      </div>

      {/* Customer & Invoice Meta Details */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#334155', marginBottom: '4px' }}>
        <span>Name: <strong style={{ color: '#0f172a', fontWeight: 600 }}>{r.custName}</strong></span>
        <span>Invoice No: <strong style={{ color: '#0f172a', fontWeight: 600 }}>{r.invNo}</strong></span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#334155' }}>
        <span>Table: <strong style={{ color: '#0f172a', fontWeight: 600 }}>#{r.tableNo}</strong></span>
        <span>Date: <strong style={{ color: '#0f172a', fontWeight: 600 }}>{r.dateStr}</strong></span>
      </div>

      {/* Dashed Separator */}
      <div style={{ borderBottom: '1px dashed #94a3b8', margin: '10px 0 8px 0' }}></div>

      {/* Items Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
        <thead>
          <tr style={{ borderBottom: '1px dashed #94a3b8' }}>
            <th style={{ padding: '5px 0', textAlign: 'left', fontWeight: 700, color: '#0f172a', width: '46%' }}>Item</th>
            <th style={{ padding: '5px 0', textAlign: 'right', fontWeight: 700, color: '#0f172a', width: '20%' }}>Price</th>
            <th style={{ padding: '5px 0', textAlign: 'center', fontWeight: 700, color: '#0f172a', width: '14%' }}>Qty</th>
            <th style={{ padding: '5px 0', textAlign: 'right', fontWeight: 700, color: '#0f172a', width: '20%' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {r.items.map((it, idx) => (
            <tr key={idx}>
              <td style={{ padding: '6px 0', textAlign: 'left', fontWeight: 500, color: '#1e293b', verticalAlign: 'top' }}>
                {it.name}
              </td>
              <td style={{ padding: '6px 0', textAlign: 'right', color: '#1e293b', verticalAlign: 'top' }}>
                ₹{formatReceiptNum(it.rate)}
              </td>
              <td style={{ padding: '6px 0', textAlign: 'center', color: '#1e293b', verticalAlign: 'top' }}>
                {it.qty}
              </td>
              <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: 600, color: '#0f172a', verticalAlign: 'top' }}>
                ₹{formatReceiptNum(it.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Dashed Separator */}
      <div style={{ borderBottom: '1px dashed #94a3b8', margin: '10px 0 12px 0' }}></div>

      {/* Totals Section */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px', fontSize: '12.5px', color: '#334155' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '190px' }}>
          <span style={{ fontWeight: 600 }}>Sub-Total:</span>
          <span style={{ fontWeight: 700, color: '#0f172a' }}>₹ {formatReceiptNum(r.subtotal)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '190px' }}>
          <span>CGST:</span>
          <span>2.5% &nbsp; ₹ {formatReceiptNum(r.cgst)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '190px' }}>
          <span>SGST:</span>
          <span>2.5% &nbsp; ₹ {formatReceiptNum(r.sgst)}</span>
        </div>
        <div style={{ borderBottom: '1px dashed #94a3b8', width: '190px', margin: '4px 0' }}></div>
      </div>

      {/* Payment Mode & Total */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', margin: '6px 0' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', paddingTop: '2px' }}>
          Mode: <span>{r.payMode}</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>Total: ₹</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', lineHeight: 1.1, marginTop: '2px' }}>
            {formatReceiptNum(r.total)}
          </div>
        </div>
      </div>

      {/* Dashed Separator */}
      <div style={{ borderBottom: '1px dashed #94a3b8', margin: '12px 0 10px 0' }}></div>

      {/* Footer Section */}
      <div style={{ textAlign: 'center', color: '#94a3b8', marginTop: '4px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px' }}>
          **SAVE PAPER SAVE NATURE !!
        </div>
        <div style={{ fontSize: '11px', marginTop: '3px' }}>
          Time: {r.timeStr}
        </div>
      </div>

      {/* Bottom Dashed Separator */}
      <div style={{ borderBottom: '1px dashed #94a3b8', margin: '10px 0 16px 0' }}></div>

      {/* Action Buttons for the Screen Modal */}
      <div style={{ display: 'flex', gap: '8px', paddingTop: '8px' }}>
        {onPrint && (
          <button
            type="button"
            onClick={onPrint}
            style={{
              flex: 1,
              padding: '9px 12px',
              background: '#000000',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'background 0.15s ease'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9"></polyline>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
              <rect x="6" y="14" width="12" height="8"></rect>
            </svg>
            Print
          </button>
        )}
        {onDownload && (
          <button
            type="button"
            onClick={onDownload}
            style={{
              flex: 1,
              padding: '9px 12px',
              background: '#ffffff',
              color: '#0f172a',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Download
          </button>
        )}
        {!r.isPaid && onCollectPayment && (
          <button
            type="button"
            onClick={onCollectPayment}
            style={{
              flex: 1,
              padding: '9px 12px',
              background: '#ff5a1f',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'background 0.15s ease'
            }}
          >
            Collect
          </button>
        )}
      </div>
    </div>
  );
};

export default ReceiptCard;
