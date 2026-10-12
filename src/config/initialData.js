// DEFAULT RESTAURANT SAMPLE DATASETS
export const initialTables = [
  { id: 'T-1', _id: 'tbl-1', tableNumber: '1', tableNo: '1', name: 'Table 1', capacity: 4, section: 'AC Dining', status: 'Occupied' },
  { id: 'T-2', _id: 'tbl-2', tableNumber: '2', tableNo: '2', name: 'Table 2', capacity: 2, section: 'AC Dining', status: 'Occupied' },
  { id: 'T-3', _id: 'tbl-3', tableNumber: '3', tableNo: '3', name: 'Table 3', capacity: 6, section: 'Family Hall', status: 'Occupied' },
  { id: 'T-4', _id: 'tbl-4', tableNumber: '4', tableNo: '4', name: 'Table 4', capacity: 4, section: 'Family Hall', status: 'Available' },
  { id: 'T-5', _id: 'tbl-5', tableNumber: '5', tableNo: '5', name: 'Table 5', capacity: 2, section: 'Outdoor Terrace', status: 'Occupied' },
  { id: 'T-6', _id: 'tbl-6', tableNumber: '6', tableNo: '6', name: 'Table 6', capacity: 4, section: 'Outdoor Terrace', status: 'Available' },
  { id: 'T-7', _id: 'tbl-7', tableNumber: '7', tableNo: '7', name: 'Table 7', capacity: 8, section: 'Private Lounge', status: 'Available' },
  { id: 'T-8', _id: 'tbl-8', tableNumber: '8', tableNo: '8', name: 'Table 8', capacity: 4, section: 'AC Dining', status: 'Occupied' },
  { id: 'T-9', _id: 'tbl-9', tableNumber: '9', tableNo: '9', name: 'Table 9', capacity: 2, section: 'AC Dining', status: 'Available' },
  { id: 'T-10', _id: 'tbl-10', tableNumber: '10', tableNo: '10', name: 'Table 10', capacity: 4, section: 'Family Hall', status: 'Available' }
];

export const initialStaff = [
  { id: 'STF-01', _id: 'stf-01', name: 'Ramesh Kumar', staffName: 'Ramesh Kumar', role: 'Waiter', roleName: 'Waiter', employeeCode: 'EMP-01', phone: '9840123456', status: 'Active' },
  { id: 'STF-02', _id: 'stf-02', name: 'Priya Sharma', staffName: 'Priya Sharma', role: 'Cashier', roleName: 'Cashier', employeeCode: 'EMP-02', phone: '9840234567', status: 'Active' },
  { id: 'STF-03', _id: 'stf-03', name: 'Suresh Raina', staffName: 'Suresh Raina', role: 'Waiter', roleName: 'Waiter', employeeCode: 'EMP-03', phone: '9840345678', status: 'Active' },
  { id: 'STF-04', _id: 'stf-04', name: 'Deepak Verma', staffName: 'Deepak Verma', role: 'Chef', roleName: 'Chef', employeeCode: 'EMP-04', phone: '9840456789', status: 'Active' },
  { id: 'STF-05', _id: 'stf-05', name: 'Karthik Raja', staffName: 'Karthik Raja', role: 'Manager', roleName: 'Manager', employeeCode: 'EMP-05', phone: '9840567890', status: 'Active' }
];

export const initialMenu = [
  { id: 'm-1', _id: 'm-1', name: 'Chicken Biryani', category: 'Biryani', foodType: 'Non-Veg', price: 280, status: 'Available' },
  { id: 'm-2', _id: 'm-2', name: 'Mutton Biryani', category: 'Biryani', foodType: 'Non-Veg', price: 380, status: 'Available' },
  { id: 'm-3', _id: 'm-3', name: 'Paneer Butter Masala', category: 'Main Course', foodType: 'Veg', price: 220, status: 'Available' },
  { id: 'm-4', _id: 'm-4', name: 'Butter Naan', category: 'Breads', foodType: 'Veg', price: 45, status: 'Available' },
  { id: 'm-5', _id: 'm-5', name: 'Garlic Naan', category: 'Breads', foodType: 'Veg', price: 55, status: 'Available' },
  { id: 'm-6', _id: 'm-6', name: 'Tandoori Chicken Full', category: 'Starters', foodType: 'Non-Veg', price: 420, status: 'Available' },
  { id: 'm-7', _id: 'm-7', name: 'Chicken 65', category: 'Starters', foodType: 'Non-Veg', price: 210, status: 'Available' },
  { id: 'm-8', _id: 'm-8', name: 'Crispy Veg Corn', category: 'Starters', foodType: 'Veg', price: 170, status: 'Available' },
  { id: 'm-9', _id: 'm-9', name: 'Egg Fried Rice', category: 'Rice', foodType: 'Egg', price: 190, status: 'Available' },
  { id: 'm-10', _id: 'm-10', name: 'Fresh Lime Soda', category: 'Beverages', foodType: 'Veg', price: 60, status: 'Available' },
  { id: 'm-11', _id: 'm-11', name: 'Gulab Jamun with Ice Cream', category: 'Desserts', foodType: 'Veg', price: 110, status: 'Available' },
  { id: 'm-12', _id: 'm-12', name: 'Masala Dosa', category: 'South Indian', foodType: 'Veg', price: 95, status: 'Available' }
];

export const initialOrders = [
  {
    _id: 'ord-1001',
    id: '#ORD-1001',
    orderId: '#ORD-1001',
    orderNumber: 'ORD-1001',
    orderType: 'Dine-In',
    type: 'Dine-In',
    table: 'Table 1',
    tableNumber: '1',
    tableNo: '1',
    time: '12:30 PM',
    date: '2026-10-12',
    createdAt: new Date().toISOString(),
    status: 'completed',
    billingStatus: 'paid',
    paymentStatus: 'paid',
    paymentMethod: 'UPI',
    paymentMode: 'UPI',
    waiter: 'Ramesh Kumar',
    staff: 'Ramesh Kumar',
    customerName: 'Rahul Sharma',
    customerPhone: '9876543210',
    subtotal: 605,
    tax: 30.25,
    discount: 0,
    total: 635.25,
    totalAmount: 635.25,
    grossAmount: 635.25,
    items: [
      { name: 'Chicken Biryani', category: 'Biryani', foodType: 'Non-Veg', qty: 2, quantity: 2, price: 280, rate: 280, amount: 560 },
      { name: 'Butter Naan', category: 'Breads', foodType: 'Veg', qty: 1, quantity: 1, price: 45, rate: 45, amount: 45 }
    ]
  },
  {
    _id: 'ord-1002',
    id: '#ORD-1002',
    orderId: '#ORD-1002',
    orderNumber: 'ORD-1002',
    orderType: 'Dine-In',
    type: 'Dine-In',
    table: 'Table 2',
    tableNumber: '2',
    tableNo: '2',
    time: '12:45 PM',
    date: '2026-10-12',
    createdAt: new Date().toISOString(),
    status: 'completed',
    billingStatus: 'paid',
    paymentStatus: 'paid',
    paymentMethod: 'Cash',
    paymentMode: 'Cash',
    waiter: 'Suresh Raina',
    staff: 'Suresh Raina',
    customerName: 'Sneha Patel',
    customerPhone: '9845123456',
    subtotal: 310,
    tax: 15.50,
    discount: 10,
    total: 315.50,
    totalAmount: 315.50,
    grossAmount: 325.50,
    items: [
      { name: 'Paneer Butter Masala', category: 'Main Course', foodType: 'Veg', qty: 1, quantity: 1, price: 220, rate: 220, amount: 220 },
      { name: 'Butter Naan', category: 'Breads', foodType: 'Veg', qty: 2, quantity: 2, price: 45, rate: 45, amount: 90 }
    ]
  },
  {
    _id: 'ord-1003',
    id: '#ORD-1003',
    orderId: '#ORD-1003',
    orderNumber: 'ORD-1003',
    orderType: 'Dine-In',
    type: 'Dine-In',
    table: 'Table 3',
    tableNumber: '3',
    tableNo: '3',
    time: '01:10 PM',
    date: '2026-10-12',
    createdAt: new Date().toISOString(),
    status: 'preparing',
    billingStatus: 'unpaid',
    paymentStatus: 'unpaid',
    paymentMethod: 'UPI',
    paymentMode: 'UPI',
    waiter: 'Ramesh Kumar',
    staff: 'Ramesh Kumar',
    customerName: 'Anand Verma',
    customerPhone: '9712345678',
    subtotal: 820,
    tax: 41.00,
    discount: 0,
    total: 861.00,
    totalAmount: 861.00,
    grossAmount: 861.00,
    items: [
      { name: 'Mutton Biryani', category: 'Biryani', foodType: 'Non-Veg', qty: 1, quantity: 1, price: 380, rate: 380, amount: 380 },
      { name: 'Tandoori Chicken Full', category: 'Starters', foodType: 'Non-Veg', qty: 1, quantity: 1, price: 420, rate: 420, amount: 420 },
      { name: 'Fresh Lime Soda', category: 'Beverages', foodType: 'Veg', qty: 1, quantity: 1, price: 60, rate: 60, amount: 60 }
    ]
  },
  {
    _id: 'ord-1004',
    id: '#ORD-1004',
    orderId: '#ORD-1004',
    orderNumber: 'ORD-1004',
    orderType: 'Dine-In',
    type: 'Dine-In',
    table: 'Table 5',
    tableNumber: '5',
    tableNo: '5',
    time: '01:25 PM',
    date: '2026-10-12',
    createdAt: new Date().toISOString(),
    status: 'new',
    billingStatus: 'unpaid',
    paymentStatus: 'unpaid',
    paymentMethod: 'Card',
    paymentMode: 'Card',
    waiter: 'Suresh Raina',
    staff: 'Suresh Raina',
    customerName: 'Pooja Reddy',
    customerPhone: '9890123456',
    subtotal: 380,
    tax: 19.00,
    discount: 0,
    total: 399.00,
    totalAmount: 399.00,
    grossAmount: 399.00,
    items: [
      { name: 'Chicken 65', category: 'Starters', foodType: 'Non-Veg', qty: 1, quantity: 1, price: 210, rate: 210, amount: 210 },
      { name: 'Crispy Veg Corn', category: 'Starters', foodType: 'Veg', qty: 1, quantity: 1, price: 170, rate: 170, amount: 170 }
    ]
  },
  {
    _id: 'ord-1005',
    id: '#ORD-1005',
    orderId: '#ORD-1005',
    orderNumber: 'ORD-1005',
    orderType: 'Dine-In',
    type: 'Dine-In',
    table: 'Table 8',
    tableNumber: '8',
    tableNo: '8',
    time: '01:40 PM',
    date: '2026-10-12',
    createdAt: new Date().toISOString(),
    status: 'ready',
    billingStatus: 'unpaid',
    paymentStatus: 'unpaid',
    paymentMethod: 'UPI',
    paymentMode: 'UPI',
    waiter: 'Ramesh Kumar',
    staff: 'Ramesh Kumar',
    customerName: 'Vikas Krishnan',
    customerPhone: '9823456789',
    subtotal: 515,
    tax: 25.75,
    discount: 20,
    total: 520.75,
    totalAmount: 520.75,
    grossAmount: 540.75,
    items: [
      { name: 'Chicken Biryani', category: 'Biryani', foodType: 'Non-Veg', qty: 1, quantity: 1, price: 280, rate: 280, amount: 280 },
      { name: 'Egg Fried Rice', category: 'Rice', foodType: 'Egg', qty: 1, quantity: 1, price: 190, rate: 190, amount: 190 },
      { name: 'Garlic Naan', category: 'Breads', foodType: 'Veg', qty: 1, quantity: 1, price: 55, rate: 55, amount: 55 }
    ]
  },
  {
    _id: 'ord-1006',
    id: '#ORD-1006',
    orderId: '#ORD-1006',
    orderNumber: 'ORD-1006',
    orderType: 'Takeaway',
    type: 'Takeaway',
    table: 'Takeaway',
    tableNumber: '-',
    tableNo: '-',
    time: '02:00 PM',
    date: '2026-10-11',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    status: 'completed',
    billingStatus: 'paid',
    paymentStatus: 'paid',
    paymentMethod: 'Card',
    paymentMode: 'Card',
    waiter: 'Priya Sharma',
    staff: 'Priya Sharma',
    customerName: 'Divya Sundar',
    customerPhone: '9789012345',
    subtotal: 560,
    tax: 28.00,
    discount: 0,
    total: 588.00,
    totalAmount: 588.00,
    grossAmount: 588.00,
    items: [
      { name: 'Chicken Biryani', category: 'Biryani', foodType: 'Non-Veg', qty: 2, quantity: 2, price: 280, rate: 280, amount: 560 }
    ]
  },
  {
    _id: 'ord-1007',
    id: '#ORD-1007',
    orderId: '#ORD-1007',
    orderNumber: 'ORD-1007',
    orderType: 'Delivery',
    type: 'Delivery',
    table: 'Delivery',
    tableNumber: '-',
    tableNo: '-',
    time: '03:15 PM',
    date: '2026-10-11',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    status: 'completed',
    billingStatus: 'paid',
    paymentStatus: 'paid',
    paymentMethod: 'UPI',
    paymentMode: 'UPI',
    waiter: 'Karthik Raja',
    staff: 'Karthik Raja',
    customerName: 'Manojbabu S',
    customerPhone: '9840987654',
    subtotal: 710,
    tax: 35.50,
    discount: 50,
    total: 695.50,
    totalAmount: 695.50,
    grossAmount: 745.50,
    items: [
      { name: 'Mutton Biryani', category: 'Biryani', foodType: 'Non-Veg', qty: 1, quantity: 1, price: 380, rate: 380, amount: 380 },
      { name: 'Paneer Butter Masala', category: 'Main Course', foodType: 'Veg', qty: 1, quantity: 1, price: 220, rate: 220, amount: 220 },
      { name: 'Gulab Jamun with Ice Cream', category: 'Desserts', foodType: 'Veg', qty: 1, quantity: 1, price: 110, rate: 110, amount: 110 }
    ]
  },
  {
    _id: 'ord-1008',
    id: '#ORD-1008',
    orderId: '#ORD-1008',
    orderNumber: 'ORD-1008',
    orderType: 'Dine-In',
    type: 'Dine-In',
    table: 'Table 4',
    tableNumber: '4',
    tableNo: '4',
    time: '07:30 PM',
    date: '2026-10-10',
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    status: 'completed',
    billingStatus: 'paid',
    paymentStatus: 'paid',
    paymentMethod: 'Cash',
    paymentMode: 'Cash',
    waiter: 'Ramesh Kumar',
    staff: 'Ramesh Kumar',
    customerName: 'Sanjay Dutt',
    customerPhone: '9870123456',
    subtotal: 440,
    tax: 22.00,
    discount: 0,
    total: 462.00,
    totalAmount: 462.00,
    grossAmount: 462.00,
    items: [
      { name: 'Paneer Butter Masala', category: 'Main Course', foodType: 'Veg', qty: 2, quantity: 2, price: 220, rate: 220, amount: 440 }
    ]
  }
];

export const initialBillingData = [
  {
    _id: 'bill-201',
    id: 'BILL-201',
    sNo: 1,
    billNo: 'BILL-201',
    orderId: '#ORD-1001',
    orderType: 'Dine-In',
    table: 'Table 1',
    tableNo: '1',
    tableId: 'tbl-1',
    billDateTime: new Date().toISOString(),
    date: '12/10/2026',
    time: '12:30 PM',
    subtotal: 605,
    tax: 30.25,
    discount: 0,
    billAmount: 635.25,
    total: 635.25,
    amount: 635.25,
    paidAmount: 635.25,
    balanceAmount: 0,
    status: 'Paid',
    paymentStatus: 'Paid',
    paymentMethod: 'UPI',
    cashier: 'Priya Sharma',
    staff: 'Priya Sharma',
    customerName: 'Rahul Sharma',
    customerPhone: '9876543210',
    orderIds: ['tbl-1', 'ord-1001'],
    items: [
      { name: 'Chicken Biryani', qty: 2, rate: 280, amount: 560 },
      { name: 'Butter Naan', qty: 1, rate: 45, amount: 45 }
    ]
  },
  {
    _id: 'bill-202',
    id: 'BILL-202',
    sNo: 2,
    billNo: 'BILL-202',
    orderId: '#ORD-1003',
    orderType: 'Dine-In',
    table: 'Table 3',
    tableNo: '3',
    tableId: 'tbl-3',
    billDateTime: new Date().toISOString(),
    date: '12/10/2026',
    time: '01:10 PM',
    subtotal: 820,
    tax: 41.00,
    discount: 0,
    billAmount: 861.00,
    total: 861.00,
    amount: 861.00,
    paidAmount: 0,
    balanceAmount: 861.00,
    status: 'Unpaid',
    paymentStatus: 'Unpaid',
    paymentMethod: 'UPI',
    cashier: 'Priya Sharma',
    staff: 'Ramesh Kumar',
    customerName: 'Anand Verma',
    customerPhone: '9712345678',
    orderIds: ['tbl-3', 'ord-1003'],
    items: [
      { name: 'Mutton Biryani', qty: 1, rate: 380, amount: 380 },
      { name: 'Tandoori Chicken Full', qty: 1, rate: 420, amount: 420 },
      { name: 'Fresh Lime Soda', qty: 1, rate: 60, amount: 60 }
    ]
  },
  {
    _id: 'bill-203',
    id: 'BILL-203',
    sNo: 3,
    billNo: 'BILL-203',
    orderId: '#ORD-1004',
    orderType: 'Dine-In',
    table: 'Table 5',
    tableNo: '5',
    tableId: 'tbl-5',
    billDateTime: new Date().toISOString(),
    date: '12/10/2026',
    time: '01:25 PM',
    subtotal: 380,
    tax: 19.00,
    discount: 0,
    billAmount: 399.00,
    total: 399.00,
    amount: 399.00,
    paidAmount: 0,
    balanceAmount: 399.00,
    status: 'Unpaid',
    paymentStatus: 'Unpaid',
    paymentMethod: 'Card',
    cashier: 'Priya Sharma',
    staff: 'Suresh Raina',
    customerName: 'Pooja Reddy',
    customerPhone: '9890123456',
    orderIds: ['tbl-5', 'ord-1004'],
    items: [
      { name: 'Chicken 65', qty: 1, rate: 210, amount: 210 },
      { name: 'Crispy Veg Corn', qty: 1, rate: 170, amount: 170 }
    ]
  },
  {
    _id: 'bill-204',
    id: 'BILL-204',
    sNo: 4,
    billNo: 'BILL-204',
    orderId: '#ORD-1005',
    orderType: 'Dine-In',
    table: 'Table 8',
    tableNo: '8',
    tableId: 'tbl-8',
    billDateTime: new Date().toISOString(),
    date: '12/10/2026',
    time: '01:40 PM',
    subtotal: 515,
    tax: 25.75,
    discount: 20,
    billAmount: 520.75,
    total: 520.75,
    amount: 520.75,
    paidAmount: 0,
    balanceAmount: 520.75,
    status: 'Unpaid',
    paymentStatus: 'Unpaid',
    paymentMethod: 'UPI',
    cashier: 'Priya Sharma',
    staff: 'Ramesh Kumar',
    customerName: 'Vikas Krishnan',
    customerPhone: '9823456789',
    orderIds: ['tbl-8', 'ord-1005'],
    items: [
      { name: 'Chicken Biryani', qty: 1, rate: 280, amount: 280 },
      { name: 'Egg Fried Rice', qty: 1, rate: 190, amount: 190 },
      { name: 'Garlic Naan', qty: 1, rate: 55, amount: 55 }
    ]
  }
];

export const initialBillingHistory = [
  {
    _id: 'inv-8801',
    id: 'INV-8801',
    invoiceId: 'INV-8801',
    invoiceNo: 'INV-8801',
    billNo: 'BILL-101',
    orderId: '#ORD-1001',
    orderRefId: 'ORD-1001',
    orderType: 'Dine-In',
    table: 'Table 1',
    tableNumber: '1',
    date: '12/10/2026',
    time: '12:30 PM',
    createdAt: new Date().toISOString(),
    amount: 635.25,
    totalAmount: 635.25,
    paidAmount: 635.25,
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
    status: 'Paid',
    staff: 'Priya Sharma',
    staffName: 'Priya Sharma',
    customerName: 'Rahul Sharma',
    customerPhone: '9876543210',
    subtotal: 605,
    tax: 30.25,
    discount: 0,
    items: [
      { name: 'Chicken Biryani', qty: 2, rate: 280, price: 280, total: 560, amount: 560 },
      { name: 'Butter Naan', qty: 1, rate: 45, price: 45, total: 45, amount: 45 }
    ]
  },
  {
    _id: 'inv-8802',
    id: 'INV-8802',
    invoiceId: 'INV-8802',
    invoiceNo: 'INV-8802',
    billNo: 'BILL-102',
    orderId: '#ORD-1002',
    orderRefId: 'ORD-1002',
    orderType: 'Dine-In',
    table: 'Table 2',
    tableNumber: '2',
    date: '12/10/2026',
    time: '12:45 PM',
    createdAt: new Date().toISOString(),
    amount: 315.50,
    totalAmount: 315.50,
    paidAmount: 315.50,
    paymentMethod: 'Cash',
    paymentStatus: 'Paid',
    status: 'Paid',
    staff: 'Priya Sharma',
    staffName: 'Priya Sharma',
    customerName: 'Sneha Patel',
    customerPhone: '9845123456',
    subtotal: 310,
    tax: 15.50,
    discount: 10,
    items: [
      { name: 'Paneer Butter Masala', qty: 1, rate: 220, price: 220, total: 220, amount: 220 },
      { name: 'Butter Naan', qty: 2, rate: 45, price: 45, total: 90, amount: 90 }
    ]
  },
  {
    _id: 'inv-8803',
    id: 'INV-8803',
    invoiceId: 'INV-8803',
    invoiceNo: 'INV-8803',
    billNo: 'BILL-103',
    orderId: '#ORD-1006',
    orderRefId: 'ORD-1006',
    orderType: 'Takeaway',
    table: 'Takeaway',
    tableNumber: '-',
    date: '11/10/2026',
    time: '02:00 PM',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    amount: 588.00,
    totalAmount: 588.00,
    paidAmount: 588.00,
    paymentMethod: 'Card',
    paymentStatus: 'Paid',
    status: 'Paid',
    staff: 'Priya Sharma',
    staffName: 'Priya Sharma',
    customerName: 'Divya Sundar',
    customerPhone: '9789012345',
    subtotal: 560,
    tax: 28.00,
    discount: 0,
    items: [
      { name: 'Chicken Biryani', qty: 2, rate: 280, price: 280, total: 560, amount: 560 }
    ]
  },
  {
    _id: 'inv-8804',
    id: 'INV-8804',
    invoiceId: 'INV-8804',
    invoiceNo: 'INV-8804',
    billNo: 'BILL-104',
    orderId: '#ORD-1007',
    orderRefId: 'ORD-1007',
    orderType: 'Delivery',
    table: 'Delivery',
    tableNumber: '-',
    date: '11/10/2026',
    time: '03:15 PM',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    amount: 695.50,
    totalAmount: 695.50,
    paidAmount: 695.50,
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
    status: 'Paid',
    staff: 'Karthik Raja',
    staffName: 'Karthik Raja',
    customerName: 'Manojbabu S',
    customerPhone: '9840987654',
    subtotal: 710,
    tax: 35.50,
    discount: 50,
    items: [
      { name: 'Mutton Biryani', qty: 1, rate: 380, price: 380, total: 380, amount: 380 },
      { name: 'Paneer Butter Masala', qty: 1, rate: 220, price: 220, total: 220, amount: 220 },
      { name: 'Gulab Jamun with Ice Cream', qty: 1, rate: 110, price: 110, total: 110, amount: 110 }
    ]
  },
  {
    _id: 'inv-8805',
    id: 'INV-8805',
    invoiceId: 'INV-8805',
    invoiceNo: 'INV-8805',
    billNo: 'BILL-105',
    orderId: '#ORD-1008',
    orderRefId: 'ORD-1008',
    orderType: 'Dine-In',
    table: 'Table 4',
    tableNumber: '4',
    date: '10/10/2026',
    time: '07:30 PM',
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    amount: 462.00,
    totalAmount: 462.00,
    paidAmount: 462.00,
    paymentMethod: 'Cash',
    paymentStatus: 'Paid',
    status: 'Paid',
    staff: 'Priya Sharma',
    staffName: 'Priya Sharma',
    customerName: 'Sanjay Dutt',
    customerPhone: '9870123456',
    subtotal: 440,
    tax: 22.00,
    discount: 0,
    items: [
      { name: 'Paneer Butter Masala', qty: 2, rate: 220, price: 220, total: 440, amount: 440 }
    ]
  }
];

export const initialInventory = [
  { id: 'inv-1', _id: 'inv-1', name: 'Basmati Rice', itemName: 'Basmati Rice', category: 'Raw Food', currentStock: 45, minStock: 20, unit: 'kg', unitPrice: 95, status: 'In Stock' },
  { id: 'inv-2', _id: 'inv-2', name: 'Fresh Chicken', itemName: 'Fresh Chicken', category: 'Meat & Poultry', currentStock: 18, minStock: 15, unit: 'kg', unitPrice: 220, status: 'Low Stock' },
  { id: 'inv-3', _id: 'inv-3', name: 'Paneer', itemName: 'Paneer', category: 'Dairy', currentStock: 12, minStock: 8, unit: 'kg', unitPrice: 340, status: 'In Stock' },
  { id: 'inv-4', _id: 'inv-4', name: 'Cooking Oil', itemName: 'Cooking Oil', category: 'Oils & Ghee', currentStock: 30, minStock: 15, unit: 'litres', unitPrice: 150, status: 'In Stock' },
  { id: 'inv-5', _id: 'inv-5', name: 'Butter', itemName: 'Butter', category: 'Dairy', currentStock: 8, minStock: 5, unit: 'kg', unitPrice: 480, status: 'In Stock' },
  { id: 'inv-6', _id: 'inv-6', name: 'Fresh Lime', itemName: 'Fresh Lime', category: 'Vegetables', currentStock: 100, minStock: 50, unit: 'pieces', unitPrice: 4, status: 'In Stock' }
];

// MULTI-TENANT RESTAURANTS DATABASE WITH CLEAN DEFAULT STATE
export const initialRestaurantsData = {
  "rest-1": {
    id: "rest-1",
    name: "Serviq",
    ownerName: "Administrator",
    email: "admin@serviq.com",
    owner: "admin@serviq.com",
    phone: "",
    address: "",
    city: "",
    state: "",
    gstNumber: "",
    createdDate: "2026-01-01",
    openingTime: "08:00",
    closingTime: "22:00",
    logo: "/logo.png",
    banner: "",
    plan: "Standard",
    status: "Active",
    subscription: {
      planId: "plan-standard",
      planName: "Standard",
      status: "Active",
      billingCycle: "monthly",
      price: 1999,
      annualPrice: 19999,
      startDate: "2026-01-01",
      expiryDate: "2027-01-01",
      nextBillingDate: "2026-09-15",
      baseBranchLimit: 5,
      extraBranchSlots: 0,
      extraBranchPrice: 699,
      userLimit: 15,
      orderLimit: 10,
      autoRenew: true,
      paymentMethod: "Credit Card"
    },
    subscriptionInvoices: [],
    settings: {
      name: "Serviq",
      tagline: "",
      currency: "₹",
      tablesCount: 0,
      taxRate: 0.025,
      serviceChargeRate: 0.00
    },
    menu: initialMenu,
    orders: initialOrders,
    tables: initialTables,
    qrCodes: [],
    branches: [],
    billingData: initialBillingData,
    billingHistory: initialBillingHistory,
    staff: initialStaff,
    users: initialStaff,
    kitchenLogin: {
      email: "",
      password: ""
    },
    inventory: initialInventory,
    inventoryLogs: [],
    inventoryPurchases: [],
    inventoryReductions: [],
    inventoryCategories: [],
    categories: ["Biryani", "Starters", "Main Course", "Breads", "Rice", "Beverages", "Desserts"],
    roles: {
      Admin: {
        permissions: {
          overview: { view: true, add: true, edit: true, delete: true },
          'branch-management': { view: true, add: true, edit: true, delete: true },
          'plans-management': { view: true, add: true, edit: true, delete: true },
          orders: { view: true, add: true, edit: true, delete: true },
          menu: { view: true, add: true, edit: true, delete: true },
          tables: { view: true, add: true, edit: true, delete: true },
          billing: { view: true, add: true, edit: true, delete: true },
          waiter: { view: true, add: true, edit: true, delete: true },
          kitchen: { view: true, add: true, edit: true, delete: true },
          Reports: { view: true, add: true, edit: true, delete: true },
          users: { view: true, add: true, edit: true, delete: true },
          'roles-permissions': { view: true, add: true, edit: true, delete: true },
          Settings: { view: true, add: true, edit: true, delete: true }
        }
      },
      Manager: {
        permissions: {
          overview: { view: true, add: false, edit: false, delete: false },
          'branch-management': { view: false, add: false, edit: false, delete: false },
          'plans-management': { view: false, add: false, edit: false, delete: false },
          orders: { view: true, add: true, edit: true, delete: true },
          menu: { view: true, add: true, edit: true, delete: false },
          tables: { view: true, add: true, edit: true, delete: false },
          billing: { view: true, add: true, edit: true, delete: false },
          waiter: { view: true, add: true, edit: true, delete: false },
          kitchen: { view: true, add: true, edit: true, delete: false },
          Reports: { view: true, add: false, edit: false, delete: false },
          users: { view: true, add: true, edit: true, delete: false },
          'roles-permissions': { view: false, add: false, edit: false, delete: false },
          Settings: { view: false, add: false, edit: false, delete: false }
        }
      },
      Waiter: {
        permissions: {
          overview: { view: false, add: false, edit: false, delete: false },
          'branch-management': { view: false, add: false, edit: false, delete: false },
          orders: { view: true, add: true, edit: true, delete: false },
          menu: { view: false, add: false, edit: false, delete: false },
          tables: { view: true, add: false, edit: true, delete: false },
          billing: { view: false, add: false, edit: false, delete: false },
          waiter: { view: true, add: false, edit: false, delete: false },
          kitchen: { view: false, add: false, edit: false, delete: false },
          Reports: { view: false, add: false, edit: false, delete: false },
          users: { view: false, add: false, edit: false, delete: false },
          'roles-permissions': { view: false, add: false, edit: false, delete: false },
          Settings: { view: false, add: false, edit: false, delete: false }
        }
      },
      Kitchen: {
        permissions: {
          overview: { view: false, add: false, edit: false, delete: false },
          'branch-management': { view: false, add: false, edit: false, delete: false },
          orders: { view: true, add: false, edit: true, delete: false },
          menu: { view: false, add: false, edit: false, delete: false },
          tables: { view: false, add: false, edit: false, delete: false },
          billing: { view: false, add: false, edit: false, delete: false },
          waiter: { view: false, add: false, edit: false, delete: false },
          kitchen: { view: true, add: false, edit: true, delete: false },
          Reports: { view: false, add: false, edit: false, delete: false },
          users: { view: false, add: false, edit: false, delete: false },
          'roles-permissions': { view: false, add: false, edit: false, delete: false },
          Settings: { view: false, add: false, edit: false, delete: false }
        }
      }
    }
  }
};

// APPLICATION STATE WITH MULTI-TENANT SaaS properties
export const initialState = {
  restaurantSettings: {},
  menu: initialMenu,
  orders: initialOrders,
  tables: initialTables,
  billingData: initialBillingData,
  billingHistory: initialBillingHistory,
  activeBillingTable: "Table 1",
  activeIncomingFilter: "All",
  activeMenuCategory: "All Items",
  editingMenuItemId: null,
  selectedTableId: "T-1",
  qrCustomizer: {
    color: "#ff7a00",
    showLogo: true
  },

  staff: initialStaff,
  kitchenLogin: {
    email: "",
    password: ""
  },
  currentUser: null,

  // Multi-tenant SaaS globals
  currentRestaurantId: null,
  isImpersonating: false,
  saasSettings: {
    name: "Serviq SaaS",
    logo: "/logo.png",
    supportEmail: "support@serviq.com",
    commission: 2.5,
    gateway: "stripe"
  },
  saasPlans: [
    { id: "plan-basic", name: "Basic", monthlyPrice: 999, annualPrice: 9999, branchLimit: 3, userLimit: 5, orderLimit: 500, features: "Standard Support, Basic Analytics", status: "Active", billingCycle: "mo", autoRenewal: true },
    { id: "plan-standard", name: "Standard", monthlyPrice: 1999, annualPrice: 19999, branchLimit: 5, userLimit: 15, orderLimit: 2000, features: "Priority Support, Advanced Analytics, QR Customizer", status: "Active", billingCycle: "mo", autoRenewal: true },
    { id: "plan-premium", name: "Premium", monthlyPrice: 4999, annualPrice: 49999, branchLimit: 8, userLimit: 50, orderLimit: 10000, features: "24/7 Phone Support, Full Analytics, Custom Branding, API Access", status: "Active", billingCycle: "mo", autoRenewal: true },
    { id: "plan-enterprise", name: "Enterprise", monthlyPrice: 9999, annualPrice: 99999, branchLimit: 100, userLimit: 500, orderLimit: 999999, features: "Dedicated AM, White Label, SLA, Custom Integration, Priority Onboarding", status: "Active", billingCycle: "mo", autoRenewal: true }
  ],
  saasAdmins: [],
  saasAdminFilter: "All",
  saasLogs: [],
  saasInvoices: [],
  invoiceFilter: "All"
};

export const AVAILABLE_PLANS = [
  {
    id: "plan-basic",
    name: "Basic Plan",
    icon: "zap",
    tagline: "Essential tools for small eateries, QR menu ordering and simple table management.",
    monthlyPrice: 999,
    annualPrice: 9999,
    branchLimit: 3,
    extraBranchAllowed: true,
    extraBranchPrice: 799,
    userLimit: 5,
    orderLimit: 500,
    badge: "Active",
    status: "Active",
    featuresList: [
      { name: "QR Ordering", included: true },
      { name: "Menu Management", included: true },
      { name: "Table Management", included: true },
      { name: "Order Management", included: true },
      { name: "Waiter Management", included: false },
      { name: "Kitchen Management", included: false },
      { name: "Inventory Management", included: false }
    ]
  },
  {
    id: "plan-standard",
    name: "Standard Plan",
    icon: "trending-up",
    tagline: "Includes everything in Basic, plus tableside waiter service and app integrations.",
    monthlyPrice: 1999,
    annualPrice: 19999,
    branchLimit: 5,
    extraBranchAllowed: true,
    extraBranchPrice: 699,
    userLimit: 15,
    orderLimit: 2000,
    badge: "Active",
    status: "Active",
    popular: true,
    featuresList: [
      { name: "QR Ordering", included: true },
      { name: "Menu Management", included: true },
      { name: "Table Management", included: true },
      { name: "Order Management", included: true },
      { name: "Waiter Management", included: true },
      { name: "Kitchen Management", included: true },
      { name: "Inventory Management", included: false }
    ]
  },
  {
    id: "plan-premium",
    name: "Premium Plan",
    icon: "sparkles",
    tagline: "Advanced operations with integrated Kitchen KDS displays, Inventory, and advanced billing.",
    monthlyPrice: 4999,
    annualPrice: 49999,
    branchLimit: 8,
    extraBranchAllowed: true,
    extraBranchPrice: 499,
    userLimit: 50,
    orderLimit: 10000,
    badge: "Active",
    status: "Active",
    featuresList: [
      { name: "QR Ordering", included: true },
      { name: "Menu Management", included: true },
      { name: "Table Management", included: true },
      { name: "Order Management", included: true },
      { name: "Waiter Management", included: true },
      { name: "Kitchen Management", included: true },
      { name: "Inventory Management", included: true }
    ]
  }
];

export const isMongoId = (str) => {
  return typeof str === 'string' && /^[0-9a-fA-F]{24}$/.test(str.trim());
};

export const resolveHumanPlanName = (rawInput, defaultName = 'Standard') => {
  if (!rawInput) return defaultName;
  if (typeof rawInput === 'object') {
    const candidate = rawInput.name || rawInput.planName || rawInput.cleanName || rawInput.title;
    if (candidate && !isMongoId(candidate)) {
      return resolveHumanPlanName(candidate, defaultName);
    }
    const idCandidate = rawInput._id || rawInput.id || rawInput.planId;
    if (idCandidate) {
      return resolveHumanPlanName(idCandidate, defaultName);
    }
    return defaultName;
  }
  
  const str = String(rawInput).trim();
  if (!str || str === 'undefined' || str === 'null') return defaultName;
  
  if (isMongoId(str)) {
    const matched = AVAILABLE_PLANS.find(p => p.id === str || p._id === str || p.id === `plan-${str}`);
    if (matched && matched.name && !isMongoId(matched.name)) {
      return matched.name.replace(/\s*plan$/i, '').trim();
    }
    return defaultName;
  }
  
  const cleaned = str.replace(/^plan-/i, '').replace(/\s*plan$/i, '').trim();
  if (isMongoId(cleaned)) {
    return defaultName;
  }
  
  if (cleaned.toLowerCase().includes('premium')) return 'Premium';
  if (cleaned.toLowerCase().includes('standard')) return 'Standard';
  if (cleaned.toLowerCase().includes('basic')) return 'Basic';
  if (cleaned.toLowerCase().includes('enterprise')) return 'Enterprise';

  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
};

export const getPlanBranchLimit = (planName, defaultLimit = 5) => {
  const name = (planName || '').toLowerCase();
  if (name.includes('premium')) return 8;
  if (name.includes('standard')) return 5;
  if (name.includes('basic')) return 3;
  if (name.includes('enterprise')) return 100;
  return defaultLimit;
};

export const isModuleAllowedForPlan = (moduleKey, planSource = 'Standard') => {
  let planStr = '';
  let features = null;

  let sessionUser = null;
  try {
    const raw = sessionStorage.getItem('currentUser');
    if (raw) sessionUser = JSON.parse(raw);
  } catch (e) {}

  if (typeof planSource === 'string') {
    planStr = planSource;
    if (sessionUser && sessionUser.plan) {
      planStr = sessionUser.plan;
    }
    if (sessionUser && sessionUser.subscription?.features) {
      features = sessionUser.subscription.features;
    }
  } else if (planSource && typeof planSource === 'object') {
    const candidates = [
      planSource.subscription?.planName,
      planSource.subscription?.planId,
      planSource.subscription?.plan,
      planSource.activePlan?.planName,
      planSource.planName,
      planSource.plan,
      planSource.planId,
      sessionUser?.subscription?.planName,
      sessionUser?.plan
    ];
    planStr = candidates.find(c => Boolean(c) && typeof c === 'string') || '';
    features = planSource.features || 
      planSource.subscription?.features || 
      planSource.activePlan?.features || 
      sessionUser?.subscription?.features ||
      null;
  }

  const allPlanValues = [
    typeof planSource === 'object' && planSource ? planSource.plan : null,
    typeof planSource === 'object' && planSource ? planSource.planName : null,
    typeof planSource === 'object' && planSource ? planSource.planId : null,
    typeof planSource === 'object' && planSource ? planSource.subscription?.plan : null,
    typeof planSource === 'object' && planSource ? planSource.subscription?.planName : null,
    typeof planSource === 'object' && planSource ? planSource.subscription?.planId : null,
    typeof planSource === 'object' && planSource ? planSource.activePlan?.planName : null,
    sessionUser?.plan,
    sessionUser?.subscription?.planName,
    planStr
  ].map(v => (v || '').toString().toLowerCase());

  const isPremiumOrEnterprise = allPlanValues.some(v => v.includes('premium') || v.includes('enterprise'));
  const isBasic = allPlanValues.some(v => v.includes('basic'));
  const key = (moduleKey || '').toLowerCase().replace(/[-_]/g, '');

  // Inventory Management: Strictly available ONLY in Premium or Enterprise plans
  if (key.includes('inventory') || key.includes('stock')) {
    return isPremiumOrEnterprise;
  }

  // Staff / Waiter / Kitchen: Available in Standard, Premium, and Enterprise (Disabled on Basic)
  if (key.includes('staff') || key.includes('waiter') || key.includes('kitchen')) {
    if (features && typeof features === 'object') {
      if (features['waiter-list'] === true || features['kitchen-list'] === true || features['staff'] === true) {
        return true;
      }
    }
    return !isBasic;
  }

  // Core administrative modules (Dashboard, Tables, Menu, Orders, Billing, Reports, Branches, Plans, Settings)
  return true;
};
