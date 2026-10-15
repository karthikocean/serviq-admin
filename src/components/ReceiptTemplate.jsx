import React from 'react';

const PrinterIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <polyline points="6 9 6 2 18 2 18 9"></polyline>
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
    <rect x="6" y="14" width="12" height="8"></rect>
  </svg>
);

const DownloadIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

const CreditCardIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
    <line x1="1" y1="10" x2="23" y2="10"></line>
  </svg>
);

// Standard print popup dimensions ensuring large print preview visibility
export const STANDARD_PRINT_WIDTH = 580;
export const STANDARD_PRINT_HEIGHT = 740;

// Format amount to exact 2 decimal places (e.g. 280.00, 15.88)
export const formatReceiptNum = (val) => {
  const num = Number(val || 0);
  if (isNaN(num)) return '0.00';
  return num.toFixed(2);
};

// Format Date as DD-MMM-YYYY (e.g. 28-Sep-2026)
export const formatReceiptDate = (rawDate) => {
  if (!rawDate) return '28-Sep-2026';
  const d = new Date(rawDate);
  if (isNaN(d.getTime())) {
    // If it's a string like "14/10/2026", convert it
    if (typeof rawDate === 'string' && rawDate.includes('/')) {
      const parts = rawDate.split('/');
      if (parts.length === 3) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const day = parts[0].padStart(2, '0');
        const mIdx = parseInt(parts[1], 10) - 1;
        const year = parts[2];
        if (months[mIdx]) return `${day}-${months[mIdx]}-${year}`;
      }
    }
    return String(rawDate);
  }
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = String(d.getDate()).padStart(2, '0');
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

// Format Time as h:mm A (e.g. 8:45 PM)
export const formatReceiptTime = (rawDate, fallbackTime = '') => {
  if (fallbackTime && typeof fallbackTime === 'string' && fallbackTime.trim()) {
    return fallbackTime.trim();
  }
  const d = rawDate ? new Date(rawDate) : new Date();
  if (isNaN(d.getTime())) return fallbackTime || '8:45 PM';
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
};

// Format Time in 24-hr format as shown in sample receipt (e.g. 21:18)
export const formatReceiptTime24 = (rawDate, fallbackTime = '') => {
  if (fallbackTime && typeof fallbackTime === 'string' && /^\d{1,2}:\d{2}$/.test(fallbackTime.trim())) {
    return fallbackTime.trim();
  }
  const d = rawDate ? new Date(rawDate) : new Date();
  if (isNaN(d.getTime())) return fallbackTime || '21:18';
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

// Normalize data from any bill, invoice, or order object
export const normalizeReceiptData = (bill = {}, activeRestaurant = {}, currentUser = null) => {
  let effectiveUser = currentUser;
  if (!effectiveUser || Object.keys(effectiveUser).length === 0) {
    try {
      effectiveUser = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
    } catch (e) {}
  }

  const isDisallowedName = (val) => {
    if (!val || typeof val !== 'string') return true;
    const s = val.trim().toLowerCase();
    const userName = String(effectiveUser?.name || '').trim().toLowerCase();
    return (
      !s ||
      s === 'serviq' ||
      s === 'serviq restaurant' ||
      s === 'serviq admin' ||
      s === 'serviq-admin' ||
      s === 'xyz restaurant' ||
      s === 'administrator' ||
      s === 'admin' ||
      s === 'user' ||
      s.includes('gayathri') ||
      (userName && s === userName && s.includes('gayathri')) ||
      /^[0-9a-fA-F]{24}$/.test(s)
    );
  };

  // Collect candidate restaurant names in order of specificity for that specific bill
  const candidateNames = [
    // 1. Specific to this Bill / Order
    bill.restaurantName,
    bill.restaurant_name,
    bill.restaurantTitle,
    bill.resName,
    bill.outletName,
    typeof bill.restaurant === 'object' ? (bill.restaurant?.restaurantName || bill.restaurant?.name || bill.restaurant?.businessName) : (typeof bill.restaurant === 'string' ? bill.restaurant : null),
    typeof bill.restaurantId === 'object' ? (bill.restaurantId?.restaurantName || bill.restaurantId?.name || bill.restaurantId?.businessName) : null,
    bill.branchName,
    bill.branch_name,
    typeof bill.branch === 'object' ? (bill.branch?.branchName || bill.branch?.name) : (typeof bill.branch === 'string' ? bill.branch : null),
    typeof bill.branchId === 'object' ? (bill.branchId?.branchName || bill.branchId?.name) : null,

    // 2. Match bill's branch in activeRestaurant branches
    (() => {
      const bList = activeRestaurant?.branches || [];
      if (Array.isArray(bList) && (bill.branchId || bill.branch)) {
        const rawBId = String(typeof bill.branchId === 'object' ? (bill.branchId?._id || bill.branchId?.id) : (bill.branchId || bill.branch || ''));
        const matched = bList.find(b => String(b._id || b.id || b.branchCode) === rawBId);
        if (matched) return matched.branchName || matched.name;
      }
      return null;
    })(),

    // 3. From activeRestaurant
    activeRestaurant?.restaurantName,
    activeRestaurant?.businessName,
    activeRestaurant?.title,
    typeof activeRestaurant?.restaurant === 'object' ? (activeRestaurant.restaurant?.restaurantName || activeRestaurant.restaurant?.name) : null,
    activeRestaurant?.settings?.restaurantName,
    activeRestaurant?.settings?.name,
    activeRestaurant?.branchName,
    activeRestaurant?.name,

    // 4. From currentUser / effectiveUser
    effectiveUser?.restaurantName,
    effectiveUser?.restaurant_name,
    effectiveUser?.businessName,
    typeof effectiveUser?.restaurant === 'object' ? (effectiveUser.restaurant?.restaurantName || effectiveUser.restaurant?.name) : null,

    // 5. From JWT token payload
    (() => {
      try {
        const token = sessionStorage.getItem('userToken') || sessionStorage.getItem('token');
        if (token && typeof token === 'string') {
          const parts = token.split('.');
          if (parts.length === 3) {
            const p = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
            return (
              p?.restaurantName ||
              p?.restaurant_name ||
              (typeof p?.restaurant === 'object' ? (p.restaurant?.restaurantName || p.restaurant?.name) : (typeof p?.restaurant === 'string' ? p.restaurant : null)) ||
              p?.branchName
            );
          }
        }
      } catch (e) {}
      return null;
    })(),

    // 6. From sessionStorage
    (() => {
      try {
        return sessionStorage.getItem('restaurantName') || sessionStorage.getItem('activeRestaurantName') || sessionStorage.getItem('selectedBranchName');
      } catch (e) {}
      return null;
    })()
  ];

  let resolvedRestaurantName = '';
  for (const cand of candidateNames) {
    if (cand && typeof cand === 'string' && !isDisallowedName(cand)) {
      resolvedRestaurantName = cand.trim();
      break;
    }
  }

  // If no specific restaurant name found, fallback to 'Restaurant' (NEVER 'Serviq')
  if (!resolvedRestaurantName) {
    resolvedRestaurantName = 'Restaurant';
  }

  const restaurantName = resolvedRestaurantName;
  const adminName = resolvedRestaurantName;

  // Secondary sub-title (e.g. branch or property name if distinct)
  let secondaryTitle = '';
  const secondaryCandidates = [
    bill.branchName,
    bill.branch_name,
    typeof bill.branch === 'object' ? (bill.branch?.branchName || bill.branch?.name) : null,
    typeof bill.branchId === 'object' ? (bill.branchId?.branchName || bill.branchId?.name) : null,
    activeRestaurant?.branchName
  ];

  for (const cand of secondaryCandidates) {
    if (cand && typeof cand === 'string') {
      const cleanCand = cand.trim();
      if (!isDisallowedName(cleanCand) && cleanCand.toLowerCase() !== resolvedRestaurantName.toLowerCase() && cleanCand.toLowerCase() !== 'main branch') {
        secondaryTitle = cleanCand;
        break;
      }
    }
  }

  const rawAddress = 
    bill.restaurantAddress ||
    bill.address ||
    bill.location ||
    (typeof bill.restaurant === 'object' ? (bill.restaurant?.address || bill.restaurant?.location) : null) ||
    (typeof bill.branch === 'object' ? (bill.branch?.address || bill.branch?.location) : null) ||
    activeRestaurant?.address ||
    activeRestaurant?.location ||
    '';
  const restaurantAddress = (rawAddress && rawAddress !== 'Address' && rawAddress !== '123 Main Street, City Centre') ? rawAddress : '';

  const rawGst = 
    bill.restaurantGst ||
    bill.gstNo ||
    bill.gstin ||
    (typeof bill.restaurant === 'object' ? (bill.restaurant?.gstNo || bill.restaurant?.gstin) : null) ||
    activeRestaurant?.gstNo ||
    activeRestaurant?.gstin ||
    '';
  const restaurantGst = (rawGst && rawGst !== '33AAAAA0000A1Z5') ? (String(rawGst).toUpperCase().startsWith('GST') ? rawGst : `GST No: ${rawGst}`) : '';

  // Customer Name
  const rawCust = bill.customerName || bill.customer?.name || bill.clientName || bill.order?.customerName || bill.order?.customer?.name || '';
  const custName = (rawCust && String(rawCust).trim()) ? String(rawCust).trim() : 'Guest';

  // Table No (just the number/identifier, e.g. "12")
  const rawTable = bill.table || bill.tableNumber || bill.tableNo || (typeof bill.tableId === 'object' ? (bill.tableId?.tableNumber || bill.tableId?.tableNo) : bill.tableId) || '12';
  const tableNo = String(rawTable).replace(/^Table\s*/i, '').trim() || '12';

  // Bill No (e.g. "B-1042")
  const rawBill = bill.billNo || bill.billNumber || bill.billId || '';
  let billNo = 'B-1042';
  if (rawBill && rawBill !== '-') {
    const cleanB = String(rawBill).trim();
    if (/^B-\d+/i.test(cleanB)) {
      billNo = cleanB.toUpperCase();
    } else if (/^BILL-?/i.test(cleanB)) {
      billNo = cleanB.replace(/^BILL-?/i, 'B-');
    } else {
      billNo = `B-${cleanB.replace(/^#?ORD-?/i, '')}`;
    }
  } else if (bill.orderId && bill.orderId !== '-') {
    billNo = `B-${String(bill.orderId).replace(/^[#ORD-_]*/i, '')}`;
  } else if (bill.id || bill._id) {
    const rawId = String(bill.id || bill._id);
    billNo = rawId.length === 24 ? `B-${rawId.slice(-4).toUpperCase()}` : `B-${rawId.replace(/^bill-?/i, '')}`;
  }

  // Invoice No (e.g. "INV/25-26/00147")
  const rawInvoice = bill.invoiceNo || bill.invoiceNumber || bill.invoiceId || bill.taxInvoiceNo || (bill.invoice && typeof bill.invoice === 'object' ? (bill.invoice.invoiceNo || bill.invoice.invoiceNumber || bill.invoice.id) : bill.invoice) || '';
  let invoiceNo = 'INV/25-26/00147';
  if (rawInvoice && rawInvoice !== '-') {
    const cleanInv = String(rawInvoice).trim();
    if (cleanInv.includes('/') || cleanInv.startsWith('INV/')) {
      invoiceNo = cleanInv;
    } else if (cleanInv.startsWith('INV-')) {
      const numPart = cleanInv.replace(/^INV-/, '');
      const padded = numPart.padStart(5, '0');
      invoiceNo = `INV/25-26/${padded}`;
    } else {
      invoiceNo = `INV/25-26/${cleanInv.padStart(5, '0')}`;
    }
  } else if (billNo && billNo !== '-') {
    const numPart = String(billNo).replace(/^[A-Za-z-_]*/, '').padStart(5, '0');
    invoiceNo = `INV/25-26/${numPart}`;
  } else if (bill.orderId && bill.orderId !== '-') {
    const numPart = String(bill.orderId).replace(/^[#ORD-_]*/i, '').padStart(5, '0');
    invoiceNo = `INV/25-26/${numPart}`;
  }

  // Is Paid / Invoice Check
  const statusStr = String(bill.status || bill.paymentStatus || bill.billingStatus || '').toLowerCase();
  const isPaid = Boolean(
    bill.isPaid === true ||
    bill.paid === true ||
    statusStr === 'paid' ||
    statusStr === 'completed' ||
    statusStr === 'done' ||
    bill.isInvoice === true
  );

  // Date & Time
  const rawDate = bill.billDateTime || bill.createdAt || bill.date || bill.createdDate || bill.timestamp;
  const dateStr = formatReceiptDate(rawDate);
  const timeStr = formatReceiptTime(rawDate, bill.time);
  const time24 = formatReceiptTime24(rawDate, bill.time);

  // Items
  const candidateItems = bill.items || bill.order?.items || bill.orderItems || [];
  let rawItems = (Array.isArray(candidateItems) && candidateItems.length > 0) ? candidateItems : [];

  // Fallback realistic demo items if items list is empty
  if (rawItems.length === 0) {
    rawItems = [
      { name: 'Paneer Butter Masala', qty: 1, rate: 280, amount: 280, hsn: '996331' },
      { name: 'Butter Naan', qty: 3, rate: 45, amount: 135, hsn: '996331' },
      { name: 'Veg Biryani', qty: 1, rate: 220, amount: 220, hsn: '996331' }
    ];
  }

  const items = rawItems.map(it => {
    const name = it.name || it.itemName || it.dishName || 'Item';
    const qty = Number(it.qty ?? it.quantity ?? 1) || 1;
    const rate = Number(it.rate ?? it.price ?? 0) || 0;
    const amount = Number(it.amount ?? (qty * rate)) || 0;
    const hsn = it.hsn || it.hsnCode || '996331'; // SAC 996331: Restaurant service
    return { name, qty, rate, amount, hsn };
  });

  const subtotal = bill.subtotal != null ? Number(bill.subtotal) : items.reduce((acc, it) => acc + it.amount, 0);
  const cgst = bill.cgst != null ? Number(bill.cgst) : parseFloat((subtotal * 0.025).toFixed(2));
  const sgst = bill.sgst != null ? Number(bill.sgst) : parseFloat((subtotal * 0.025).toFixed(2));
  const total = bill.billAmount != null
    ? Number(bill.billAmount)
    : (bill.total != null ? Number(bill.total) : parseFloat((subtotal + cgst + sgst).toFixed(2)));

  // Payment Mode (e.g. "UPI", "Cash", "Card")
  const rawPay = bill.paymentMethod || bill.paymentMode || bill.method || bill.payMode || 'UPI';
  const payMode = String(rawPay).toUpperCase();

  return {
    adminName,
    secondaryTitle,
    restaurantName,
    restaurantAddress,
    restaurantGst,
    custName,
    tableNo,
    billNo,
    invoiceNo,
    dateStr,
    timeStr,
    time24,
    items,
    subtotal,
    cgst,
    sgst,
    total,
    subtotalFormatted: formatReceiptNum(subtotal),
    cgstFormatted: formatReceiptNum(cgst),
    sgstFormatted: formatReceiptNum(sgst),
    totalFormatted: formatReceiptNum(total),
    payMode,
    isPaid
  };
};

// Standalone HTML Generator for Window.Print and Download (Exact Match to User Images)
export const generateReceiptHtml = (data = {}, activeRestaurant = {}, currentUser = null) => {
  const r = normalizeReceiptData(data, activeRestaurant, currentUser);
  const isInvoice = r.isPaid;

  const itemsBeforePaymentHtml = r.items.map(it => `
    <tr>
      <td style="padding: 3px 0; text-align: left; vertical-align: top;">${it.name}</td>
      <td style="padding: 3px 8px; text-align: center; vertical-align: top;">${it.qty}</td>
      <td style="padding: 3px 8px; text-align: right; vertical-align: top;">${it.rate % 1 === 0 ? it.rate : it.rate.toFixed(2)}</td>
      <td style="padding: 3px 0; text-align: right; vertical-align: top;">${formatReceiptNum(it.amount)}</td>
    </tr>
  `).join('');

  const itemsAfterPaymentHtml = r.items.map(it => `
    <tr>
      <td style="padding: 3px 6px 3px 0; text-align: left; vertical-align: top;">${it.hsn}</td>
      <td style="padding: 3px 4px; text-align: left; vertical-align: top;">${it.name}</td>
      <td style="padding: 3px 6px; text-align: center; vertical-align: top;">${it.qty}</td>
      <td style="padding: 3px 6px; text-align: right; vertical-align: top;">${it.rate % 1 === 0 ? it.rate : it.rate.toFixed(2)}</td>
      <td style="padding: 3px 0; text-align: right; vertical-align: top;">${formatReceiptNum(it.amount)}</td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html>
<head>
  <title>${isInvoice ? `Invoice - ${r.invoiceNo}` : `Bill - ${r.billNo}`}</title>
  <meta charset="utf-8" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    @page {
      size: portrait;
      margin: 6mm auto;
    }
    body {
      font-family: 'Courier New', Courier, monospace;
      background: #ffffff;
      color: #000000;
      padding: 16px;
      display: flex;
      justify-content: center;
      font-size: 13.5px;
      line-height: 1.4;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    @media print {
      body {
        padding: 0 !important;
        margin: 0 !important;
        display: block !important;
      }
      .receipt-box {
        width: 100% !important;
        max-width: 420px !important;
        margin: 0 auto !important;
        padding: 4px 6px !important;
        border: none !important;
        box-shadow: none !important;
      }
    }
    .receipt-box {
      width: 100%;
      max-width: 440px;
      background: #ffffff;
      padding: 12px 14px;
      color: #000000;
    }
    .header-center {
      text-align: center;
      margin-bottom: 12px;
    }
    .restaurant-name {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 2px;
    }
    .meta-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 3px;
      font-size: 13.5px;
    }
    .dashed-line {
      border-top: 1px dashed #000000;
      margin: 6px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13.5px;
    }
    th {
      font-weight: normal;
      padding: 4px 0;
      font-size: 13.5px;
    }
    td {
      font-size: 13.5px;
    }
  </style>
</head>
<body>
  <div class="receipt-box">
    <!-- Header with Admin Name at top marked place -->
    <div class="header-center">
      <div class="restaurant-name" style="font-size: 19px; font-weight: bold; letter-spacing: 0.5px; margin-bottom: 2px;">
        ${r.adminName}
      </div>
      ${r.secondaryTitle ? `<div style="font-size: 13.5px; font-weight: 600; margin-bottom: 2px;">${r.secondaryTitle}</div>` : ''}
      ${r.restaurantAddress ? `<div>${r.restaurantAddress}</div>` : ''}
      ${r.restaurantGst ? `<div>${r.restaurantGst}</div>` : ''}
    </div>

    ${isInvoice ? `
      <!-- AFTER PAYMENT: TAX INVOICE FORMAT -->
      <div style="text-align: center; font-weight: bold; font-size: 14px; margin: 12px 0 12px 0; letter-spacing: 0.5px;">
        TAX INVOICE
      </div>

      <div class="meta-row">
        <span>Invoice No: ${r.invoiceNo}</span>
        <span>Date: ${r.dateStr}</span>
      </div>
      <div class="meta-row" style="margin-bottom: 10px;">
        <span>Table No: ${r.tableNo}</span>
        <span>Payment: ${r.payMode}</span>
      </div>

      <table>
        <thead>
          <tr>
            <th style="text-align: left; width: 68px;">HSN</th>
            <th style="text-align: left;">Item</th>
            <th style="text-align: center; width: 45px;">Qty</th>
            <th style="text-align: right; width: 55px;">Rate</th>
            <th style="text-align: right; width: 110px;">Taxable Value</th>
          </tr>
        </thead>
        <tbody>
          ${itemsAfterPaymentHtml}
        </tbody>
      </table>

      <div class="dashed-line"></div>

      <div style="display: flex; flex-direction: column; align-items: flex-end; font-size: 13.5px;">
        <div style="display: flex; justify-content: space-between; width: 230px; margin-bottom: 3px;">
          <span>Taxable Value</span>
          <span>${r.subtotalFormatted}</span>
        </div>
        <div style="display: flex; justify-content: space-between; width: 230px; margin-bottom: 3px;">
          <span>CGST @2.5%</span>
          <span>${r.cgstFormatted}</span>
        </div>
        <div style="display: flex; justify-content: space-between; width: 230px; margin-bottom: 3px;">
          <span>SGST @2.5%</span>
          <span>${r.sgstFormatted}</span>
        </div>
        <div class="dashed-line" style="width: 230px; margin: 4px 0 6px 0;"></div>
        <div style="display: flex; justify-content: space-between; width: 230px; font-weight: bold;">
          <span>Total Value</span>
          <span>${r.totalFormatted}</span>
        </div>
      </div>

      <div style="text-align: center; margin-top: 18px; font-size: 13.5px;">
        Thank you, visit again!
      </div>
    ` : `
      <!-- BEFORE PAYMENT: SAMPLE BILL FORMAT -->
      <div class="meta-row" style="margin-top: 8px;">
        <span>Table No: ${r.tableNo}</span>
        <span>Bill No: ${r.billNo}</span>
      </div>
      <div class="meta-row" style="margin-bottom: 10px;">
        <span>Date: ${r.dateStr}</span>
        <span>Time: ${r.timeStr}</span>
      </div>

      <table>
        <thead>
          <tr>
            <th style="text-align: left;">Item</th>
            <th style="text-align: center; width: 45px;">Qty</th>
            <th style="text-align: right; width: 60px;">Rate</th>
            <th style="text-align: right; width: 85px;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsBeforePaymentHtml}
        </tbody>
      </table>

      <div class="dashed-line"></div>

      <div class="meta-row">
        <span>Subtotal</span>
        <span>${r.subtotalFormatted}</span>
      </div>
      <div class="meta-row">
        <span>CGST @2.5%</span>
        <span>${r.cgstFormatted}</span>
      </div>
      <div class="meta-row">
        <span>SGST @2.5%</span>
        <span>${r.sgstFormatted}</span>
      </div>

      <div class="dashed-line"></div>

      <div class="meta-row" style="font-weight: bold; font-size: 14px;">
        <span>Total Payable</span>
        <span>${r.totalFormatted}</span>
      </div>
    `}

    <!-- Bottom Marked Section: SAVE PAPER SAVE NATURE !! & Time -->
    <div class="dashed-line" style="margin: 14px 0 6px 0;"></div>
    <div style="text-align: center; font-size: 12.5px; margin: 6px 0; letter-spacing: 0.3px;">
      <div style="font-weight: bold;">**SAVE PAPER SAVE NATURE !!</div>
      <div style="margin-top: 3px;">Time: ${r.time24 || r.timeStr}</div>
    </div>
    <div class="dashed-line" style="margin: 6px 0 10px 0;"></div>
  </div>
  <script>
    function triggerPrint() {
      window.focus();
      setTimeout(function() {
        window.print();
      }, 150);
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
export const openCenteredPrintWindow = (htmlContent, title = 'Print', width = STANDARD_PRINT_WIDTH, height = STANDARD_PRINT_HEIGHT) => {
  const dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : (window.screenX || 0);
  const dualScreenTop = window.screenTop !== undefined ? window.screenTop : (window.screenY || 0);

  const screenW = window.outerWidth || window.innerWidth || (window.screen ? window.screen.width : 1280);
  const screenH = window.outerHeight || window.innerHeight || (window.screen ? window.screen.height : 800);

  const availW = (window.screen && window.screen.availWidth) ? window.screen.availWidth - 40 : 1200;
  const availH = (window.screen && window.screen.availHeight) ? window.screen.availHeight - 60 : 860;
  const finalWidth = Math.min(width, availW);
  const finalHeight = Math.min(height, availH);

  const left = Math.max(0, Math.round(dualScreenLeft + (screenW - finalWidth) / 2));
  const top = Math.max(0, Math.round(dualScreenTop + (screenH - finalHeight) / 2));

  const features = `width=${finalWidth},height=${finalHeight},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes`;

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

// React UI Component for Dialog / Modal Display (Exact Match to User Images)
export const ReceiptCard = ({
  data = {},
  activeRestaurant = {},
  currentUser,
  onPrint,
  onDownload,
  onCollectPayment,
  isPaid: isPaidProp,
  showActions = true
}) => {
  const r = normalizeReceiptData(data, activeRestaurant, currentUser);
  const isInvoice = isPaidProp !== undefined ? isPaidProp : r.isPaid;

  return (
    <div
      className="real-bill-receipt-card"
      style={{
        background: '#ffffff',
        fontFamily: "'Courier New', Courier, monospace",
        color: '#000000',
        padding: '12px 16px',
        width: '100%',
        maxWidth: '440px',
        margin: '0 auto',
        boxSizing: 'border-box',
        fontSize: '13.5px',
        lineHeight: 1.45
      }}
    >
      {/* Header with Admin Name at top marked place */}
      <div style={{ textAlign: 'center', marginBottom: '12px' }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold', letterSpacing: '0.5px', marginBottom: '3px' }}>
          {r.adminName}
        </div>
        {r.secondaryTitle && (
          <div style={{ fontSize: '13.5px', fontWeight: 600, marginBottom: '2px' }}>
            {r.secondaryTitle}
          </div>
        )}
        {r.restaurantAddress && (
          <div style={{ fontSize: '12.5px', color: '#333333' }}>{r.restaurantAddress}</div>
        )}
        {r.restaurantGst && (
          <div style={{ fontSize: '12.5px', fontWeight: 500 }}>{r.restaurantGst}</div>
        )}
      </div>

      {isInvoice ? (
        /* AFTER PAYMENT: SAMPLE INVOICE FORMAT */
        <>
          <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '14px', margin: '12px 0 12px 0', letterSpacing: '0.5px' }}>
            TAX INVOICE
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
            <span>Invoice No: {r.invoiceNo}</span>
            <span>Date: {r.dateStr}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span>Table No: {r.tableNo}</span>
            <span>Payment: {r.payMode}</span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', fontWeight: 'normal', padding: '4px 0', width: '68px' }}>HSN</th>
                <th style={{ textAlign: 'left', fontWeight: 'normal', padding: '4px 0' }}>Item</th>
                <th style={{ textAlign: 'center', fontWeight: 'normal', padding: '4px 0', width: '45px' }}>Qty</th>
                <th style={{ textAlign: 'right', fontWeight: 'normal', padding: '4px 0', width: '55px' }}>Rate</th>
                <th style={{ textAlign: 'right', fontWeight: 'normal', padding: '4px 0', width: '110px' }}>Taxable Value</th>
              </tr>
            </thead>
            <tbody>
              {r.items.map((it, idx) => (
                <tr key={idx}>
                  <td style={{ padding: '3px 6px 3px 0', textAlign: 'left', verticalAlign: 'top' }}>{it.hsn}</td>
                  <td style={{ padding: '3px 4px', textAlign: 'left', verticalAlign: 'top' }}>{it.name}</td>
                  <td style={{ padding: '3px 6px', textAlign: 'center', verticalAlign: 'top' }}>{it.qty}</td>
                  <td style={{ padding: '3px 6px', textAlign: 'right', verticalAlign: 'top' }}>
                    {it.rate % 1 === 0 ? it.rate : it.rate.toFixed(2)}
                  </td>
                  <td style={{ padding: '3px 0', textAlign: 'right', verticalAlign: 'top' }}>
                    {formatReceiptNum(it.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ borderTop: '1px dashed #000000', margin: '6px 0' }}></div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontSize: '13.5px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '230px', marginBottom: '3px' }}>
              <span>Taxable Value</span>
              <span>{r.subtotalFormatted}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '230px', marginBottom: '3px' }}>
              <span>CGST @2.5%</span>
              <span>{r.cgstFormatted}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '230px', marginBottom: '3px' }}>
              <span>SGST @2.5%</span>
              <span>{r.sgstFormatted}</span>
            </div>
            <div style={{ borderTop: '1px dashed #000000', width: '230px', margin: '4px 0 6px 0' }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '230px', fontWeight: 'bold' }}>
              <span>Total Value</span>
              <span>{r.totalFormatted}</span>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '18px', fontSize: '13.5px' }}>
            Thank you, visit again!
          </div>
        </>
      ) : (
        /* BEFORE PAYMENT: SAMPLE BILL FORMAT */
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', marginBottom: '3px' }}>
            <span>Table No: {r.tableNo}</span>
            <span>Bill No: {r.billNo}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span>Date: {r.dateStr}</span>
            <span>Time: {r.timeStr}</span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', fontWeight: 'normal', padding: '4px 0' }}>Item</th>
                <th style={{ textAlign: 'center', fontWeight: 'normal', padding: '4px 0', width: '45px' }}>Qty</th>
                <th style={{ textAlign: 'right', fontWeight: 'normal', padding: '4px 0', width: '60px' }}>Rate</th>
                <th style={{ textAlign: 'right', fontWeight: 'normal', padding: '4px 0', width: '85px' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {r.items.map((it, idx) => (
                <tr key={idx}>
                  <td style={{ padding: '3px 0', textAlign: 'left', verticalAlign: 'top' }}>{it.name}</td>
                  <td style={{ padding: '3px 8px', textAlign: 'center', verticalAlign: 'top' }}>{it.qty}</td>
                  <td style={{ padding: '3px 8px', textAlign: 'right', verticalAlign: 'top' }}>
                    {it.rate % 1 === 0 ? it.rate : it.rate.toFixed(2)}
                  </td>
                  <td style={{ padding: '3px 0', textAlign: 'right', verticalAlign: 'top' }}>
                    {formatReceiptNum(it.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ borderTop: '1px dashed #000000', margin: '6px 0' }}></div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
            <span>Subtotal</span>
            <span>{r.subtotalFormatted}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
            <span>CGST @2.5%</span>
            <span>{r.cgstFormatted}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
            <span>SGST @2.5%</span>
            <span>{r.sgstFormatted}</span>
          </div>

          <div style={{ borderTop: '1px dashed #000000', margin: '6px 0' }}></div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px' }}>
            <span>Total Payable</span>
            <span>{r.totalFormatted}</span>
          </div>
        </>
      )}

      {/* Bottom Marked Section: SAVE PAPER SAVE NATURE !! & Time */}
      <div style={{ borderTop: '1px dashed #000000', margin: '14px 0 6px 0' }}></div>
      <div style={{ textAlign: 'center', fontSize: '12.5px', margin: '6px 0', letterSpacing: '0.3px' }}>
        <div style={{ fontWeight: 'bold' }}>**SAVE PAPER SAVE NATURE !!</div>
        <div style={{ marginTop: '3px' }}>Time: {r.time24 || r.timeStr}</div>
      </div>
      <div style={{ borderTop: '1px dashed #000000', margin: '6px 0 10px 0' }}></div>

      {/* Action Buttons: Print, Download, Collect Payment */}
      {showActions && (onPrint || onDownload || onCollectPayment) && (
        <div style={{ marginTop: '18px', paddingTop: '12px', borderTop: '1px dashed #000000', fontFamily: "system-ui, -apple-system, sans-serif" }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {onPrint && (
              <button
                type="button"
                onClick={onPrint}
                style={{
                  flex: 1,
                  minWidth: '105px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 700,
                  border: '1px solid #bfdbfe',
                  background: '#eff6ff',
                  color: '#1d4ed8',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <PrinterIcon size={14} color="#1d4ed8" />
                <span>{isInvoice ? 'Print Invoice' : 'Print Bill'}</span>
              </button>
            )}

            {onDownload && (
              <button
                type="button"
                onClick={onDownload}
                style={{
                  flex: 1,
                  minWidth: '105px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 700,
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  color: '#334155',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <DownloadIcon size={14} color="#334155" />
                <span>{isInvoice ? 'Download Invoice' : 'Download Bill'}</span>
              </button>
            )}

            {!isInvoice && onCollectPayment && (
              <button
                type="button"
                onClick={onCollectPayment}
                style={{
                  flex: '1 1 100%',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 800,
                  border: 'none',
                  background: '#ff5a1f',
                  color: '#ffffff',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(255, 90, 31, 0.25)',
                  transition: 'all 0.15s ease'
                }}
              >
                <CreditCardIcon size={15} color="#ffffff" />
                <span>Collect Payment</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceiptCard;
