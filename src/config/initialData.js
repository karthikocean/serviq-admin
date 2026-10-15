// DEFAULT RESTAURANT DATASETS (POPULATED COMPREHENSIVE INITIAL DATA)
export const initialTables = [
  { id: "T-01", _id: "661234567890123456789001", tableNumber: "01", tableNo: "01", name: "Table 01", status: "Occupied", seats: 4, seatingCapacity: 4 },
  { id: "T-02", _id: "661234567890123456789002", tableNumber: "02", tableNo: "02", name: "Table 02", status: "Occupied", seats: 2, seatingCapacity: 2 },
  { id: "T-03", _id: "661234567890123456789003", tableNumber: "03", tableNo: "03", name: "Table 03", status: "Occupied", seats: 4, seatingCapacity: 4 },
  { id: "T-04", _id: "661234567890123456789004", tableNumber: "04", tableNo: "04", name: "Table 04", status: "Free", seats: 6, seatingCapacity: 6 },
  { id: "T-05", _id: "661234567890123456789005", tableNumber: "05", tableNo: "05", name: "Table 05", status: "Occupied", seats: 2, seatingCapacity: 2 },
  { id: "T-07", _id: "661234567890123456789007", tableNumber: "07", tableNo: "07", name: "Table 07", status: "Occupied", seats: 4, seatingCapacity: 4 }
];

export const initialStaff = [
  { id: "S-01", _id: "661234567890123456789101", name: "Ramesh Kumar", role: "Waiter", phone: "9876543210", email: "ramesh@serviq.com", status: "On Duty" },
  { id: "S-02", _id: "661234567890123456789102", name: "Suresh Pillai", role: "Kitchen", phone: "9876543211", email: "suresh@serviq.com", status: "On Duty" },
  { id: "S-03", _id: "661234567890123456789103", name: "Anitha Selvam", role: "Waiter", phone: "9876543212", email: "anitha@serviq.com", status: "On Duty" },
  { id: "S-04", _id: "661234567890123456789104", name: "Vikram Rathore", role: "Waiter", phone: "9876543213", email: "vikram@serviq.com", status: "Off Duty" },
  { id: "S-05", _id: "661234567890123456789105", name: "Priya Patel", role: "Kitchen", phone: "9876543214", email: "priya@serviq.com", status: "On Duty" }
];

export const initialMenu = [
  { id: "menu-1", name: "Paneer Tikka", category: "Starters", price: 180, desc: "Marinated cottage cheese cubes grilled in charcoal tandoor with onions and bell peppers.", image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500&auto=format&fit=crop&q=60", available: true, veg: true, bestseller: false },
  { id: "menu-2", name: "Chicken Biryani", category: "Rice Meals", price: 320, desc: "Fragrant basmati rice layered with juicy spiced chicken, saffron, and fresh mint.", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=60", available: true, veg: false, bestseller: true },
  { id: "menu-3", name: "Masala Dosa", category: "Tiffin", price: 120, desc: "Thin crispy rice crepe filled with spiced potato mash. Served with sambar and coconut chutney.", image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500&auto=format&fit=crop&q=60", available: true, veg: true, bestseller: true },
  { id: "menu-4", name: "Dal Makhani", category: "Rice Meals", price: 160, desc: "Creamy slow-cooked black lentils simmered overnight with butter, cream, and tomatoes.", image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60", available: true, veg: true, bestseller: false },
  { id: "menu-5", name: "Gulab Jamun", category: "Desserts", price: 80, desc: "Golden fried milk-solid dumplings dipped in warm cardamom-scented sugar syrup.", image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=60", available: true, veg: true, bestseller: false },
  { id: "menu-6", name: "Masala Chai", category: "Drinks", price: 40, desc: "Traditional brewed black tea infused with cardamom, ginger, cloves, and milk.", image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=60", available: true, veg: true, bestseller: false },
  { id: "menu-7", name: "Butter Naan", category: "Rotis", price: 40, desc: "Soft leavened tandoori flatbread brushed with generous butter.", image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=500&auto=format&fit=crop&q=60", available: true, veg: true, bestseller: false },
  { id: "menu-8", name: "Lassi", category: "Drinks", price: 60, desc: "Chilled yogurt beverage blended sweet with cardamom and rose water.", image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=500&auto=format&fit=crop&q=60", available: true, veg: true, bestseller: false }
];

export const initialOrders = [
  { id: "847", orderId: "847", table: "Table 03", tableNo: "03", time: "01:28 PM", timeAgo: "2 min ago", items: [{ name: "Chicken Biryani", qty: 1, price: 320 }, { name: "Masala Chai", qty: 2, price: 40 }], notes: "Less spicy please", subtotal: 400, tax: 20, charge: 0, total: 420, billAmount: 420, paidAmount: 0, balanceAmount: 420, status: "new", billingStatus: "unpaid", paymentStatus: "unpaid", waiter: "Unassigned", cashier: "Unassigned" },
  { id: "846", orderId: "846", table: "Table 07", tableNo: "07", time: "01:22 PM", timeAgo: "8 min ago", items: [{ name: "Chicken Biryani", qty: 4, price: 320 }, { name: "Dal Makhani", qty: 3, price: 160 }, { name: "Paneer Tikka", qty: 1, price: 180 }, { name: "Masala Chai", qty: 2, price: 40 }], notes: "", subtotal: 2020, tax: 101, charge: 0, total: 2121, billAmount: 2121, paidAmount: 0, balanceAmount: 2121, status: "preparing", billingStatus: "unpaid", paymentStatus: "unpaid", waiter: "Ravi M.", cashier: "Anitha Selvam" },
  { id: "845", orderId: "845", table: "Table 01", tableNo: "01", time: "01:15 PM", timeAgo: "15 min ago", items: [{ name: "Masala Dosa", qty: 5, price: 120 }, { name: "Filter Coffee", qty: 3, price: 40 }], notes: "Allergy: peanuts", subtotal: 720, tax: 36, charge: 0, total: 756, billAmount: 756, paidAmount: 0, balanceAmount: 756, status: "preparing", billingStatus: "unpaid", paymentStatus: "unpaid", waiter: "Rahul S.", cashier: "Anitha Selvam" },
  { id: "844", orderId: "844", table: "Table 05", tableNo: "05", time: "01:08 PM", timeAgo: "22 min ago", items: [{ name: "Paneer Tikka", qty: 2, price: 180 }, { name: "Chicken Biryani", qty: 1, price: 320 }, { name: "Butter Naan", qty: 3, price: 40 }, { name: "Masala Chai", qty: 2, price: 40 }], notes: "", subtotal: 880, tax: 44, charge: 0, total: 924, billAmount: 924, paidAmount: 0, balanceAmount: 924, status: "ready", billingStatus: "unpaid", paymentStatus: "unpaid", waiter: "Arjun K.", cashier: "Vikram Rathore" },
  { id: "843", orderId: "843", table: "Table 02", tableNo: "02", time: "01:00 PM", timeAgo: "30 min ago", items: [{ name: "Veg Thali", qty: 2, price: 120 }, { name: "Masala Chai", qty: 3, price: 40 }], notes: "", subtotal: 360, tax: 18, charge: 0, total: 378, billAmount: 378, paidAmount: 378, balanceAmount: 0, status: "done", billingStatus: "paid", paymentStatus: "paid", waiter: "Ravi M.", cashier: "Ramesh Kumar" },
  { id: "842", orderId: "842", table: "Table 02", tableNo: "02", time: "12:55 PM", timeAgo: "35 min ago", items: [{ name: "Chicken Biryani", qty: 2, price: 320 }, { name: "Dal Makhani", qty: 2, price: 160 }, { name: "Paneer Tikka", qty: 1, price: 180 }, { name: "Masala Chai", qty: 1, price: 40 }], notes: "", subtotal: 1180, tax: 59, charge: 0, total: 1239, billAmount: 1239, paidAmount: 0, balanceAmount: 1239, status: "preparing", billingStatus: "unpaid", paymentStatus: "unpaid", waiter: "Ravi M.", cashier: "Ramesh Kumar" }
];

export const initialBillingData = [
  {
    _id: "bill-01",
    id: "bill-01",
    sNo: 1,
    billNo: "BILL-101",
    invoiceNo: "INV-101",
    invoiceId: "INV-101",
    orderId: "845",
    order_id: "845",
    table: "Table 01",
    tableId: "T-01",
    tableNumber: "01",
    billDateTime: "2026-10-14T13:15:00",
    date: "14/10/2026",
    time: "01:15 PM",
    subtotal: 720,
    tax: 36,
    discount: 0,
    billAmount: 756,
    total: 756,
    amount: 756,
    paidAmount: 0,
    balanceAmount: 756,
    status: "Unpaid",
    paymentStatus: "Unpaid",
    cashier: "Anitha Selvam",
    staff: "Anitha Selvam",
    customerName: "Karthik Raj",
    customerPhone: "9876543210",
    orderType: "Dine-In",
    items: [
      { name: "Masala Dosa", qty: 5, rate: 120, price: 120, amount: 600 },
      { name: "Filter Coffee", qty: 3, rate: 40, price: 40, amount: 120 }
    ]
  },
  {
    _id: "bill-02",
    id: "bill-02",
    sNo: 2,
    billNo: "BILL-102",
    invoiceNo: "INV-102",
    invoiceId: "INV-102",
    orderId: "842",
    order_id: "842",
    table: "Table 02",
    tableId: "T-02",
    tableNumber: "02",
    billDateTime: "2026-10-14T12:55:00",
    date: "14/10/2026",
    time: "12:55 PM",
    subtotal: 1180,
    tax: 59,
    discount: 0,
    billAmount: 1239,
    total: 1239,
    amount: 1239,
    paidAmount: 0,
    balanceAmount: 1239,
    status: "Unpaid",
    paymentStatus: "Unpaid",
    cashier: "Ramesh Kumar",
    staff: "Ramesh Kumar",
    customerName: "Priya Sharma",
    customerPhone: "9876543211",
    orderType: "Dine-In",
    items: [
      { name: "Chicken Biryani", qty: 2, rate: 320, price: 320, amount: 640 },
      { name: "Dal Makhani", qty: 2, rate: 160, price: 160, amount: 320 },
      { name: "Paneer Tikka", qty: 1, rate: 180, price: 180, amount: 180 },
      { name: "Masala Chai", qty: 1, rate: 40, price: 40, amount: 40 }
    ]
  },
  {
    _id: "bill-03",
    id: "bill-03",
    sNo: 3,
    billNo: "BILL-103",
    invoiceNo: "INV-103",
    invoiceId: "INV-103",
    orderId: "847",
    order_id: "847",
    table: "Table 03",
    tableId: "T-03",
    tableNumber: "03",
    billDateTime: "2026-10-14T13:28:00",
    date: "14/10/2026",
    time: "01:28 PM",
    subtotal: 400,
    tax: 20,
    discount: 0,
    billAmount: 420,
    total: 420,
    amount: 420,
    paidAmount: 0,
    balanceAmount: 420,
    status: "Unpaid",
    paymentStatus: "Unpaid",
    cashier: "Suresh Pillai",
    staff: "Suresh Pillai",
    customerName: "Manoj Kumar",
    customerPhone: "9876543212",
    orderType: "Dine-In",
    items: [
      { name: "Chicken Biryani", qty: 1, rate: 320, price: 320, amount: 320 },
      { name: "Masala Chai", qty: 2, rate: 40, price: 40, amount: 80 }
    ]
  },
  {
    _id: "bill-04",
    id: "bill-04",
    sNo: 4,
    billNo: "BILL-104",
    invoiceNo: "INV-104",
    invoiceId: "INV-104",
    orderId: "844",
    order_id: "844",
    table: "Table 05",
    tableId: "T-05",
    tableNumber: "05",
    billDateTime: "2026-10-14T13:08:00",
    date: "14/10/2026",
    time: "01:08 PM",
    subtotal: 880,
    tax: 44,
    discount: 0,
    billAmount: 924,
    total: 924,
    amount: 924,
    paidAmount: 0,
    balanceAmount: 924,
    status: "Unpaid",
    paymentStatus: "Unpaid",
    cashier: "Vikram Rathore",
    staff: "Vikram Rathore",
    customerName: "Deepak Verma",
    customerPhone: "9876543213",
    orderType: "Dine-In",
    items: [
      { name: "Paneer Tikka", qty: 2, rate: 180, price: 180, amount: 360 },
      { name: "Chicken Biryani", qty: 1, rate: 320, price: 320, amount: 320 },
      { name: "Butter Naan", qty: 3, rate: 40, price: 40, amount: 120 },
      { name: "Masala Chai", qty: 2, rate: 40, price: 40, amount: 80 }
    ]
  },
  {
    _id: "bill-05",
    id: "bill-05",
    sNo: 5,
    billNo: "BILL-105",
    invoiceNo: "INV-105",
    invoiceId: "INV-105",
    orderId: "846",
    order_id: "846",
    table: "Table 07",
    tableId: "T-07",
    tableNumber: "07",
    billDateTime: "2026-10-14T13:22:00",
    date: "14/10/2026",
    time: "01:22 PM",
    subtotal: 2020,
    tax: 101,
    discount: 0,
    billAmount: 2121,
    total: 2121,
    amount: 2121,
    paidAmount: 0,
    balanceAmount: 2121,
    status: "Unpaid",
    paymentStatus: "Unpaid",
    cashier: "Anitha Selvam",
    staff: "Anitha Selvam",
    customerName: "Sneha Reddy",
    customerPhone: "9876543214",
    orderType: "Dine-In",
    items: [
      { name: "Chicken Biryani", qty: 4, rate: 320, price: 320, amount: 1280 },
      { name: "Dal Makhani", qty: 3, rate: 160, price: 160, amount: 480 },
      { name: "Paneer Tikka", qty: 1, rate: 180, price: 180, amount: 180 },
      { name: "Masala Chai", qty: 2, rate: 40, price: 40, amount: 80 }
    ]
  }
];

export const initialBillingHistory = [
  {
    _id: "hist-01",
    id: "INV-2026-001",
    invoiceId: "INV-2026-001",
    invoiceNo: "INV-2026-001",
    billNo: "BILL-098",
    orderId: "843",
    order_id: "843",
    table: "Table 02",
    tableNumber: "02",
    date: "14/10/2026",
    time: "01:00 PM",
    rawDate: "2026-10-14T13:00:00",
    createdAt: "2026-10-14T13:00:00",
    subtotal: 360,
    tax: 18,
    discount: 0,
    charge: 0,
    totalAmount: 378,
    amount: 378,
    total: 378,
    paymentMethod: "UPI",
    paymentMode: "UPI",
    staff: "Ravi M.",
    staffName: "Ravi M.",
    customerName: "Arun Prasad",
    customerPhone: "9876543215",
    status: "Paid",
    paymentStatus: "Paid",
    orderType: "Dine-In",
    items: [
      { name: "Veg Thali", qty: 2, rate: 120, price: 120, amount: 240, total: 240 },
      { name: "Masala Chai", qty: 3, rate: 40, price: 40, amount: 120, total: 120 }
    ]
  },
  {
    _id: "hist-02",
    id: "INV-2026-002",
    invoiceId: "INV-2026-002",
    invoiceNo: "INV-2026-002",
    billNo: "BILL-097",
    orderId: "841",
    order_id: "841",
    table: "Table 04",
    tableNumber: "04",
    date: "14/10/2026",
    time: "12:30 PM",
    rawDate: "2026-10-14T12:30:00",
    createdAt: "2026-10-14T12:30:00",
    subtotal: 680,
    tax: 34,
    discount: 0,
    charge: 0,
    totalAmount: 714,
    amount: 714,
    total: 714,
    paymentMethod: "Cash",
    paymentMode: "Cash",
    staff: "Suresh Pillai",
    staffName: "Suresh Pillai",
    customerName: "Venkatesh S",
    customerPhone: "9876543216",
    status: "Paid",
    paymentStatus: "Paid",
    orderType: "Dine-In",
    items: [
      { name: "Chicken Biryani", qty: 2, rate: 320, price: 320, amount: 640, total: 640 },
      { name: "Masala Chai", qty: 1, rate: 40, price: 40, amount: 40, total: 40 }
    ]
  },
  {
    _id: "hist-03",
    id: "INV-2026-003",
    invoiceId: "INV-2026-003",
    invoiceNo: "INV-2026-003",
    billNo: "BILL-096",
    orderId: "840",
    order_id: "840",
    table: "Table 01",
    tableNumber: "01",
    date: "14/10/2026",
    time: "12:15 PM",
    rawDate: "2026-10-14T12:15:00",
    createdAt: "2026-10-14T12:15:00",
    subtotal: 500,
    tax: 25,
    discount: 0,
    charge: 0,
    totalAmount: 525,
    amount: 525,
    total: 525,
    paymentMethod: "Card",
    paymentMode: "Card",
    staff: "Anitha Selvam",
    staffName: "Anitha Selvam",
    customerName: "Serviq",
    customerPhone: "9876543217",
    status: "Paid",
    paymentStatus: "Paid",
    orderType: "Dine-In",
    items: [
      { name: "Masala Dosa", qty: 3, rate: 120, price: 120, amount: 360, total: 360 },
      { name: "Masala Chai", qty: 2, rate: 40, price: 40, amount: 80, total: 80 },
      { name: "Gulab Jamun", qty: 1, rate: 60, price: 60, amount: 60, total: 60 }
    ]
  },
  {
    _id: "hist-04",
    id: "INV-2026-004",
    invoiceId: "INV-2026-004",
    invoiceNo: "INV-2026-004",
    billNo: "BILL-095",
    orderId: "839",
    order_id: "839",
    table: "Table 03",
    tableNumber: "03",
    date: "13/10/2026",
    time: "08:45 PM",
    rawDate: "2026-10-13T20:45:00",
    createdAt: "2026-10-13T20:45:00",
    subtotal: 400,
    tax: 20,
    discount: 0,
    charge: 0,
    totalAmount: 420,
    amount: 420,
    total: 420,
    paymentMethod: "UPI",
    paymentMode: "UPI",
    staff: "Ramesh Kumar",
    staffName: "Ramesh Kumar",
    customerName: "Siddharth N",
    customerPhone: "9876543218",
    status: "Paid",
    paymentStatus: "Paid",
    orderType: "Dine-In",
    items: [
      { name: "Chicken Biryani", qty: 1, rate: 320, price: 320, amount: 320, total: 320 },
      { name: "Gulab Jamun", qty: 1, rate: 80, price: 80, amount: 80, total: 80 },
      { name: "Masala Chai", qty: 1, rate: 20, price: 20, amount: 20, total: 20 }
    ]
  },
  {
    _id: "hist-05",
    id: "INV-2026-005",
    invoiceId: "INV-2026-005",
    invoiceNo: "INV-2026-005",
    billNo: "BILL-094",
    orderId: "838",
    order_id: "838",
    table: "Table 05",
    tableNumber: "05",
    date: "13/10/2026",
    time: "07:30 PM",
    rawDate: "2026-10-13T19:30:00",
    createdAt: "2026-10-13T19:30:00",
    subtotal: 800,
    tax: 40,
    discount: 0,
    charge: 0,
    totalAmount: 840,
    amount: 840,
    total: 840,
    paymentMethod: "Cash",
    paymentMode: "Cash",
    staff: "Vikram Rathore",
    staffName: "Vikram Rathore",
    customerName: "Divya Nair",
    customerPhone: "9876543219",
    status: "Paid",
    paymentStatus: "Paid",
    orderType: "Dine-In",
    items: [
      { name: "Paneer Tikka", qty: 2, rate: 180, price: 180, amount: 360, total: 360 },
      { name: "Butter Naan", qty: 4, rate: 40, price: 40, amount: 160, total: 160 },
      { name: "Dal Makhani", qty: 1, rate: 160, price: 160, amount: 160, total: 160 },
      { name: "Lassi", qty: 2, rate: 60, price: 60, amount: 120, total: 120 }
    ]
  }
];
export const initialInventory = [];


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
    categories: [],
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
  activeBillingTable: "",
  activeIncomingFilter: "All",
  activeMenuCategory: "All Items",
  editingMenuItemId: null,
  selectedTableId: null,
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
