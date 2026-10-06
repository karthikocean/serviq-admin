import React from 'react';

// Format number: clean integer if whole, or 2 decimals
export const formatReceiptNum = (val) => {
  const num = Number(val || 0);
  if (isNaN(num)) return '0';
  return num % 1 === 0 ? num.toFixed(0) : num.toFixed(2);
};

// Normalize data from any bill, invoice, or order object
export const normalizeReceiptData = (bill = {}, activeRestaurant = {}) => {
  const restaurantName = activeRestaurant?.name || activeRestaurant?.restaurantName || activeRestaurant?.businessName || '';
  const restaurantAddress = activeRestaurant?.address || activeRestaurant?.location || '';
  const restaurantGst = activeRestaurant?.gstNo || activeRestaurant?.gstin || '';

  // Customer Name
  const rawCust = bill.customerName || bill.customer?.name || bill.clientName || bill.order?.customerName || bill.order?.customer?.name || '';
  const custName = (rawCust && String(rawCust).trim()) ? String(rawCust).trim() : 'Guest';

  // Table
  const rawTable = bill.table || bill.tableNumber || bill.tableNo || (typeof bill.tableId === 'object' ? (bill.tableId?.tableNumber || bill.tableId?.tableNo) : bill.tableId) || '-';
  const tableNo = String(rawTable).replace(/^Table\s*/i, '').trim() || '-';

  // Identify whether this is an Invoice or Bill
  const isInvoice = Boolean(bill.invoiceId || bill.invoiceNo || bill.invoiceNumber);
  const displayNo = bill.invoiceId || bill.invoiceNo || bill.invoiceNumber || bill.billNo || bill.billNumber || bill.id || bill._id || '-';
  const invNo = String(displayNo).replace(/^INV[\/-]*/i, '').replace(/^B[\/-]*/i, '').trim() || displayNo;
  const docTitle = `${isInvoice ? 'Invoice' : 'Bill'} - ${displayNo}`;

  // Date & Time
  const d = bill.billDateTime || bill.createdAt || bill.date || bill.createdDate || bill.timestamp || new Date();
  const dateObj = new Date(d);
  const isValidDate = !isNaN(dateObj.getTime());
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dateStr = isValidDate ? `${dateObj.getDate()} ${months[dateObj.getMonth()]} ${dateObj.getFullYear()}` : '-';
  const timeStr = bill.time || (isValidDate ? dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '-');

  // Items
  const candidateItems = bill.items || bill.order?.items || bill.orderItems || [];
  const billTotalNum = Number(bill.billAmount || bill.totalAmount || bill.total || bill.amount || 0);

  let rawItems = (Array.isArray(candidateItems) && candidateItems.length > 0) ? candidateItems : [];

  const items = rawItems.map(it => {
    const name = it.name || it.itemName || it.dishName || 'Item';
    const qty = Number(it.qty || it.quantity || 1);
    const rate = Number(it.rate || it.price || 0);
    const amount = Number(it.amount || it.total || (qty * rate));
    return { name, qty, rate, amount };
  });

  const subtotal = bill.subtotal !== undefined ? Number(bill.subtotal) : items.reduce((acc, it) => acc + it.amount, 0);
  const taxTotal = bill.tax !== undefined ? Number(bill.tax) : (subtotal * 0.05);
  const cgst = bill.cgst !== undefined ? Number(bill.cgst) : parseFloat((taxTotal / 2).toFixed(2));
  const sgst = bill.sgst !== undefined ? Number(bill.sgst) : parseFloat((taxTotal / 2).toFixed(2));
  const total = billTotalNum > 0
    ? billTotalNum
    : parseFloat((subtotal + cgst + sgst).toFixed(2));

  const payMode = bill.paymentMethod || bill.paymentMode || bill.payMode || 'Cash';
  const isPaid = (bill.status || bill.paymentStatus || '').toLowerCase() === 'paid';

  return {
    restaurantName,
    restaurantAddress,
    restaurantGst,
    custName,
    tableNo,
    invNo,
    displayNo,
    isInvoice,
    docTitle,
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
// Standalone HTML Generator for Window.Print and Download (Pure Black & White Real Bill UI)
export const generateReceiptHtml = (data = {}, activeRestaurant = {}) => {
  const r = normalizeReceiptData(data, activeRestaurant);
  const itemsHtml = r.items.length > 0 ? r.items.map(it => `
    <tr>
      <td style="padding: 5px 0; text-align: left; font-weight: 600; color: #000000; vertical-align: top;">${it.name}</td>
      <td style="padding: 5px 0; text-align: right; color: #000000; vertical-align: top;">₹${formatReceiptNum(it.rate)}</td>
      <td style="padding: 5px 0; text-align: center; color: #000000; vertical-align: top;">${it.qty}</td>
      <td style="padding: 5px 0; text-align: right; font-weight: 700; color: #000000; vertical-align: top;">₹${formatReceiptNum(it.amount)}</td>
    </tr>
  `).join('') : `
    <tr>
      <td colspan="4" style="padding: 10px 0; text-align: center; color: #666; font-size: 11px;">No items recorded</td>
    </tr>
  `;

  return `<!DOCTYPE html>
<html>
<head>
  <title>${r.docTitle}</title>
  <meta charset="utf-8" />
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    @page {
      size: portrait;
      margin: 4mm;
    }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #ffffff;
      color: #000000;
      padding: 16px;
      display: flex;
      justify-content: center;
      font-size: 12.5px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    @media print {
      html, body {
        width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        background: #ffffff !important;
        display: flex !important;
        justify-content: center !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .receipt-box {
        box-shadow: none !important;
        border: none !important;
        width: 320px !important;
        max-width: 320px !important;
        min-width: 320px !important;
        margin: 0 auto !important;
        padding: 4px 6px !important;
      }
      @page {
        size: portrait;
        margin: 4mm;
      }
    }
    .receipt-box {
      width: 100%;
      max-width: 340px;
      background: #ffffff;
      padding: 12px 16px;
      color: #000000;
    }
    .dashed-line {
      border-bottom: 1px dashed #000000;
    }
    .receipt-divider {
      display: flex;
      align-items: center;
      margin: 12px 0 8px 0;
    }
    .receipt-divider .line {
      flex: 1;
      border-bottom: 1px dashed #000000;
    }
    .receipt-divider span {
      padding: 0 8px;
      font-size: 11px;
      font-weight: 800;
      color: #000000;
      letter-spacing: 2px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }
    th {
      font-weight: 700;
      color: #000000;
      padding: 6px 0;
      text-transform: uppercase;
      font-size: 11.5px;
    }
  </style>
</head>
<body>
  <div class="receipt-box">
    <!-- Monochrome Leaf/Emblem icon -->
    <div style="text-align: center; margin-bottom: 4px;">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block;">
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path>
        <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path>
      </svg>
    </div>
    
    <!-- Restaurant Name -->
    <div style="font-size: 16px; font-weight: 800; color: #000000; text-align: center; letter-spacing: -0.2px;">
      ${r.restaurantName}
    </div>
    <!-- Address -->
    <div style="font-size: 11.5px; color: #000000; text-align: center; line-height: 1.35; margin: 3px auto; max-width: 320px;">
      ${r.restaurantAddress}
    </div>
    <!-- GST -->
    <div style="font-size: 11.5px; font-weight: 700; color: #000000; text-align: center;">
      GST No ${r.restaurantGst}
    </div>

    <!-- RECEIPT divider -->
    <div class="receipt-divider">
      <div class="line"></div>
      <span>${r.isInvoice ? 'INVOICE' : 'RECEIPT'}</span>
      <div class="line"></div>
    </div>

    <!-- Metadata -->
    <div style="display: flex; justify-content: space-between; font-size: 11.5px; color: #000000; margin-bottom: 3px;">
      <span>Name: <strong style="color: #000000; font-weight: 700;">${r.custName}</strong></span>
      <span>${r.isInvoice ? 'Invoice No:' : 'Bill No:'} <strong style="color: #000000; font-weight: 700;">${r.displayNo}</strong></span>
    </div>
    <div style="display: flex; justify-content: space-between; font-size: 11.5px; color: #000000;">
      <span>Table: <strong style="color: #000000; font-weight: 700;">#${r.tableNo}</strong></span>
      <span>Date: <strong style="color: #000000; font-weight: 700;">${r.dateStr}</strong></span>
    </div>

    <div class="dashed-line" style="margin: 8px 0 6px 0;"></div>

    <!-- Table -->
    <table>
      <thead>
        <tr style="border-top: 1px dashed #000000; border-bottom: 1px dashed #000000;">
          <th style="text-align: left; width: 46%;">ITEM</th>
          <th style="text-align: right; width: 20%;">PRICE</th>
          <th style="text-align: center; width: 14%;">QTY</th>
          <th style="text-align: right; width: 20%;">TOTAL</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <div class="dashed-line" style="margin: 8px 0 10px 0;"></div>

    <!-- Totals -->
    <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px; font-size: 12px; color: #000000;">
      <div style="display: flex; justify-content: space-between; width: 190px;">
        <span style="font-weight: 600;">Sub-Total:</span>
        <span style="font-weight: 700; color: #000000;">₹ ${formatReceiptNum(r.subtotal)}</span>
      </div>
      <div style="display: flex; justify-content: space-between; width: 190px;">
        <span>CGST:</span>
        <span>2.5% &nbsp; ₹ ${formatReceiptNum(r.cgst)}</span>
      </div>
      <div style="display: flex; justify-content: space-between; width: 190px;">
        <span>SGST:</span>
        <span>2.5% &nbsp; ₹ ${formatReceiptNum(r.sgst)}</span>
      </div>
      <div style="border-bottom: 1px dashed #000000; width: 190px; margin: 4px 0;"></div>
    </div>

    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-top: 6px;">
      <div style="font-size: 12.5px; font-weight: 700; color: #000000; padding-top: 2px;">
        Mode: <span>${r.payMode}</span>
      </div>
      <div style="text-align: right;">
        <div style="font-size: 12px; font-weight: 700; color: #000000;">Total: ₹</div>
        <div style="font-size: 20px; font-weight: 800; color: #000000; line-height: 1.1; margin-top: 2px;">
          ${formatReceiptNum(r.total)}
        </div>
      </div>
    </div>

    <div class="dashed-line" style="margin: 10px 0 8px 0;"></div>

    <!-- Footer -->
    <div style="text-align: center; color: #000000; margin-top: 4px;">
      <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.5px;">**SAVE PAPER SAVE NATURE !!</div>
      <div style="font-size: 11px; margin-top: 2px;">Time: ${r.timeStr}</div>
      <div style="font-size: 11px; font-weight: 700; margin-top: 4px;">*** THANK YOU VISIT AGAIN ***</div>
    </div>

    <div class="dashed-line" style="margin: 8px 0 12px 0;"></div>
  </div>
  <script>
    function triggerPrint() {
      window.focus();
      setTimeout(function() {
        window.print();
      }, 200);
    }
    if (document.readyState === 'complete') {
      triggerPrint();
    } else {
      window.addEventListener('load', triggerPrint);
    }
    window.onafterprint = function() {
      try { window.close(); } catch(e) {}
    };
  </script>
</body>
</html>`;
};

// Opens a print popup window centered on the user's active screen/browser
export const openCenteredPrintWindow = (htmlContent, title = 'Print', width = 480, height = 700) => {
  const dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : (window.screenX || 0);
  const dualScreenTop = window.screenTop !== undefined ? window.screenTop : (window.screenY || 0);

  const screenW = window.outerWidth || window.innerWidth || (window.screen ? window.screen.width : 1280);
  const screenH = window.outerHeight || window.innerHeight || (window.screen ? window.screen.height : 800);

  const left = Math.max(0, Math.round(dualScreenLeft + (screenW - width) / 2));
  const top = Math.max(0, Math.round(dualScreenTop + (screenH - height) / 2));

  const features = `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes`;

  const printWin = window.open('', '_blank', features);
  if (printWin) {
    try {
      printWin.document.title = title;
    } catch (e) {}
    printWin.document.open();
    printWin.document.write(htmlContent);
    printWin.document.close();
    try {
      printWin.document.title = title;
      printWin.focus();
    } catch (e) {}
  }
  return printWin;
};

// React UI Component for Dialog / Modal Display (Pure Black & White Real Bill UI)
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
    <div
      className="real-bill-receipt-card"
      style={{
        background: '#ffffff',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        color: '#000000',
        padding: '2px 0',
        width: '100%',
        maxWidth: '380px',
        margin: '0 auto',
        boxSizing: 'border-box'
      }}
    >
      {/* Monochrome Leaf / Emblem Icon in Pure Black */}
      <div style={{ textAlign: 'center', marginBottom: '4px' }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block' }}>
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path>
          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path>
        </svg>
      </div>

      {/* Restaurant Name */}
      <div style={{ fontSize: '16px', fontWeight: 800, color: '#000000', textAlign: 'center', letterSpacing: '-0.2px' }}>
        {r.restaurantName}
      </div>

      {/* Address */}
      <div style={{ fontSize: '11.5px', color: '#000000', textAlign: 'center', lineHeight: 1.35, margin: '3px auto', maxWidth: '320px' }}>
        {r.restaurantAddress}
      </div>

      {/* GST */}
      <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#000000', textAlign: 'center' }}>
        GST No {r.restaurantGst}
      </div>

      {/* RECEIPT divider */}
      <div style={{ display: 'flex', alignItems: 'center', margin: '12px 0 8px 0' }}>
        <div style={{ flex: 1, borderBottom: '1px dashed #000000' }}></div>
        <span style={{ padding: '0 8px', fontSize: '11px', fontWeight: 800, color: '#000000', letterSpacing: '2px' }}>
          RECEIPT
        </span>
        <div style={{ flex: 1, borderBottom: '1px dashed #000000' }}></div>
      </div>

      {/* Customer & Invoice Meta Details */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#000000', marginBottom: '3px' }}>
        <span>Name: <strong style={{ color: '#000000', fontWeight: 700 }}>{r.custName}</strong></span>
        <span>Invoice No: <strong style={{ color: '#000000', fontWeight: 700 }}>{r.invNo}</strong></span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#000000' }}>
        <span>Table: <strong style={{ color: '#000000', fontWeight: 700 }}>#{r.tableNo}</strong></span>
        <span>Date: <strong style={{ color: '#000000', fontWeight: 700 }}>{r.dateStr}</strong></span>
      </div>

      {/* Dashed Separator */}
      <div style={{ borderBottom: '1px dashed #000000', margin: '8px 0 6px 0' }}></div>

      {/* Items Table - Guaranteed Clean Black & White */}
      <table
        className="real-receipt-table"
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '12px',
          background: 'transparent'
        }}
      >
        <thead style={{ background: 'transparent' }}>
          <tr style={{ borderTop: '1px dashed #000000', borderBottom: '1px dashed #000000', background: 'transparent' }}>
            <th style={{ padding: '6px 0', textAlign: 'left', fontWeight: 700, color: '#000000', width: '46%', background: 'transparent', border: 'none' }}>
              ITEM
            </th>
            <th style={{ padding: '6px 0', textAlign: 'right', fontWeight: 700, color: '#000000', width: '20%', background: 'transparent', border: 'none' }}>
              PRICE
            </th>
            <th style={{ padding: '6px 0', textAlign: 'center', fontWeight: 700, color: '#000000', width: '14%', background: 'transparent', border: 'none' }}>
              QTY
            </th>
            <th style={{ padding: '6px 0', textAlign: 'right', fontWeight: 700, color: '#000000', width: '20%', background: 'transparent', border: 'none' }}>
              TOTAL
            </th>
          </tr>
        </thead>
        <tbody style={{ background: 'transparent' }}>
          {r.items.length > 0 ? (
            r.items.map((it, idx) => (
              <tr key={idx} style={{ background: 'transparent' }}>
                <td style={{ padding: '5px 0', textAlign: 'left', fontWeight: 600, color: '#000000', verticalAlign: 'top', background: 'transparent', border: 'none' }}>
                  {it.name}
                </td>
                <td style={{ padding: '5px 0', textAlign: 'right', color: '#000000', verticalAlign: 'top', background: 'transparent', border: 'none' }}>
                  ₹{formatReceiptNum(it.rate)}
                </td>
                <td style={{ padding: '5px 0', textAlign: 'center', color: '#000000', verticalAlign: 'top', background: 'transparent', border: 'none' }}>
                  {it.qty}
                </td>
                <td style={{ padding: '5px 0', textAlign: 'right', fontWeight: 700, color: '#000000', verticalAlign: 'top', background: 'transparent', border: 'none' }}>
                  ₹{formatReceiptNum(it.amount)}
                </td>
              </tr>
            ))
          ) : (
            <tr style={{ background: 'transparent' }}>
              <td colSpan={4} style={{ padding: '10px 0', textAlign: 'center', color: '#666', fontSize: '11px', background: 'transparent', border: 'none' }}>
                No items recorded
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Dashed Separator */}
      <div style={{ borderBottom: '1px dashed #000000', margin: '8px 0 10px 0' }}></div>

      {/* Totals Section */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', fontSize: '12px', color: '#000000' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '190px' }}>
          <span style={{ fontWeight: 600 }}>Sub-Total:</span>
          <span style={{ fontWeight: 700, color: '#000000' }}>₹ {formatReceiptNum(r.subtotal)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '190px' }}>
          <span>CGST:</span>
          <span>2.5% &nbsp; ₹ {formatReceiptNum(r.cgst)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '190px' }}>
          <span>SGST:</span>
          <span>2.5% &nbsp; ₹ {formatReceiptNum(r.sgst)}</span>
        </div>
        <div style={{ borderBottom: '1px dashed #000000', width: '190px', margin: '4px 0' }}></div>
      </div>

      {/* Payment Mode & Total */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', margin: '6px 0' }}>
        <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#000000', paddingTop: '2px' }}>
          Mode: <span>{r.payMode}</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#000000' }}>Total: ₹</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#000000', lineHeight: 1.1, marginTop: '2px' }}>
            {formatReceiptNum(r.total)}
          </div>
        </div>
      </div>

      {/* Dashed Separator */}
      <div style={{ borderBottom: '1px dashed #000000', margin: '10px 0 8px 0' }}></div>

      {/* Footer Section */}
      <div style={{ textAlign: 'center', color: '#000000', marginTop: '4px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px' }}>
          **SAVE PAPER SAVE NATURE !!
        </div>
        <div style={{ fontSize: '11px', marginTop: '2px' }}>
          Time: {r.timeStr}
        </div>
        <div style={{ fontSize: '11px', fontWeight: 700, marginTop: '4px' }}>
          *** THANK YOU VISIT AGAIN ***
        </div>
      </div>

      {/* Bottom Dashed Separator */}
      <div style={{ borderBottom: '1px dashed #000000', margin: '8px 0 12px 0' }}></div>

      {/* Action Buttons for the Screen Modal (Black & White Monochromatic) */}
      <div style={{ display: 'flex', gap: '8px', paddingTop: '4px' }}>
        {onPrint && (
          <button
            type="button"
            onClick={onPrint}
            style={{
              flex: 1,
              padding: '9px 12px',
              background: '#000000',
              color: '#ffffff',
              border: '1px solid #000000',
              borderRadius: '6px',
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
              color: '#000000',
              border: '1px solid #000000',
              borderRadius: '6px',
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
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
              background: '#000000',
              color: '#ffffff',
              border: '1px solid #000000',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
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

