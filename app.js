// MULTI-TENANT RESTAURANTS DATABASE
let restaurantsData = {
  "rest-1": {
    id: "rest-1",
    name: "Serviq SaaS",
    ownerName: "Saravana Kumaran",
    email: "admin@saravana.com",
    owner: "admin@saravana.com",
    phone: "9876543210",
    address: "12 Connaught Place",
    city: "New Delhi",
    state: "Delhi",
    gstNumber: "07AAACS1234A1ZX",
    createdDate: "2026-01-15",
    openingTime: "08:00",
    closingTime: "22:00",
    logo: "",
    banner: "",
    plan: "Standard",
    status: "Active",
    settings: {
      name: "Serviq SaaS",
      tagline: "High Quality South Indian Vegetarian Food",
      currency: "₹",
      tablesCount: 5,
      taxRate: 0.025,
      serviceChargeRate: 0.00
    },
    menu: [
      { id: "menu-1", name: "Paneer Tikka", category: "Starters", price: 180, desc: "Marinated cottage cheese cubes grilled in charcoal tandoor with onions and bell peppers.", image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500&auto=format&fit=crop&q=60", available: true, veg: true, bestseller: false },
      { id: "menu-2", name: "Chicken Biryani", category: "Rice Meals", price: 320, desc: "Fragrant basmati rice layered with juicy spiced chicken, saffron, and fresh mint.", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=60", available: true, veg: false, bestseller: true },
      { id: "menu-3", name: "Masala Dosa", category: "Tiffin", price: 120, desc: "Thin crispy rice crepe filled with spiced potato mash. Served with sambar and coconut chutney.", image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500&auto=format&fit=crop&q=60", available: true, veg: true, bestseller: true },
      { id: "menu-4", name: "Dal Makhani", category: "Rice Meals", price: 160, desc: "Creamy slow-cooked black lentils simmered overnight with butter, cream, and tomatoes.", image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60", available: true, veg: true, bestseller: false },
      { id: "menu-full-meals", name: "Full Meals", category: "Rice Meals", price: 120, desc: "Rice, sambar, rasam, 3 curries, papad, pickle & payasam", image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60", available: true, veg: true, bestseller: true },
      { id: "menu-mini-meals", name: "Mini Meals", category: "Rice Meals", price: 90, desc: "Rice, sambar, 1 curry, papad & pickle", image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500&auto=format&fit=crop&q=60", available: true, veg: true, bestseller: false },
      { id: "menu-5", name: "Gulab Jamun", category: "Desserts", price: 80, desc: "Golden fried milk-solid dumplings dipped in warm cardamom-scented sugar syrup.", image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=60", available: true, veg: true, bestseller: false },
      { id: "menu-6", name: "Masala Chai", category: "Drinks", price: 40, desc: "Traditional brewed black tea infused with cardamom, ginger, cloves, and milk.", image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=60", available: true, veg: true, bestseller: false },
      { id: "menu-7", name: "Butter Naan", category: "Rotis", price: 40, desc: "Soft leavened tandoori flatbread brushed with generous butter.", image:  "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=500&auto=format&fit=crop&q=60",available: true, veg: true, bestseller: false },
      { id: "menu-8", name: "Lassi", category: "Drinks", price: 60, desc: "Chilled yogurt beverage blended sweet with cardamom and rose water.", image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=500&auto=format&fit=crop&q=60", available: true, veg: true, bestseller: false }
    ],
    orders: [
      { id: "847", table: "03", time: "1:28 PM", timeAgo: "2 min ago", items: [{ name: "Chicken Biryani", qty: 1, price: 320 }, { name: "Masala Chai", qty: 2, price: 40 }], notes: "Less spicy please", subtotal: 400, tax: 10, charge: 0, total: 420, status: "new", billingStatus: "unpaid" },
      { id: "846", table: "07", time: "1:22 PM", timeAgo: "8 min ago", items: [{ name: "Paneer Tikka", qty: 2, price: 180 }, { name: "Butter Naan", qty: 3, price: 40 }, { name: "Lassi", qty: 1, price: 60 }], notes: "", subtotal: 540, tax: 27, charge: 0, total: 567, status: "preparing", billingStatus: "unpaid" },
      { id: "845", table: "01", time: "1:15 PM", timeAgo: "15 min ago", items: [{ name: "Masala Dosa", qty: 3, price: 120 }, { name: "Filter Coffee", qty: 2, price: 40 }], notes: "Allergy: peanuts", subtotal: 440, tax: 22, charge: 0, total: 462, status: "preparing", billingStatus: "unpaid" },
      { id: "844", table: "05", time: "1:08 PM", timeAgo: "22 min ago", items: [{ name: "Paneer Tikka", qty: 2, price: 180 }, { name: "Chicken Biryani", qty: 1, price: 320 }, { name: "Butter Naan", qty: 3, price: 40 }, { name: "Masala Chai", qty: 2, price: 40 }], notes: "", subtotal: 880, tax: 44, charge: 0, total: 924, status: "ready", billingStatus: "unpaid" },
      { id: "843", table: "02", time: "1:00 PM", timeAgo: "30 min ago", items: [{ name: "Veg Thali", qty: 2, price: 120 }, { name: "Masala Chai", qty: 3, price: 40 }], notes: "", subtotal: 360, tax: 18, charge: 0, total: 378, status: "done", billingStatus: "paid" }
    ],
    tables: [
      { id: "T-01", status: "Occupied", seats: 4 },
      { id: "T-02", status: "Occupied", seats: 2 },
      { id: "T-03", status: "Occupied", seats: 4 },
      { id: "T-04", status: "Free", seats: 6 },
      { id: "T-05", status: "Occupied", seats: 2 }
    ],
    billingData: [
      { table: "Table 01", orders: 2, total: 756, status: "Unpaid" },
      { table: "Table 02", orders: 3, total: 1240, status: "Unpaid" },
      { table: "Table 03", orders: 1, total: 320, status: "Paid" },
      { table: "Table 05", orders: 2, total: 924, status: "Unpaid" },
      { table: "Table 07", orders: 4, total: 2100, status: "Partial" }
    ],
    staff: [
      { id: "S-01", name: "Ramesh Kumar", role: "Waiter", phone: "9876543210", email: "ramesh@serviq.com", status: "On Duty", password: "manager123" },
      { id: "S-02", name: "Suresh Pillai", role: "Kitchen", phone: "9876543211", email: "suresh@serviq.com", status: "On Duty", password: "chef123" },
      { id: "S-03", name: "Anitha Selvam", role: "Waiter", phone: "9876543212", email: "anitha@serviq.com", status: "On Duty", password: "waiter123" },
      { id: "S-04", name: "Vikram Rathore", role: "Waiter", phone: "9876543213", email: "vikram@serviq.com", status: "Off Duty", password: "waiter456" },
      { id: "S-05", name: "Priya Patel", role: "Kitchen", phone: "9876543214", email: "priya@serviq.com", status: "On Duty", password: "chef456" }
    ],
    kitchenLogin: {
      email: "kitchen@saravana.com",
      password: "kitchen123"
    }
  },
  "rest-2": {
    id: "rest-2",
    name: "Tikka Town",
    ownerName: "Rajesh Verma",
    email: "admin@tikkatown.com",
    owner: "admin@tikkatown.com",
    phone: "9876543220",
    address: "45 MG Road",
    city: "Bangalore",
    state: "Karnataka",
    gstNumber: "29AABCT5678B2ZY",
    createdDate: "2026-02-10",
    openingTime: "11:00",
    closingTime: "23:00",
    logo: "",
    banner: "",
    plan: "Premium",
    status: "Active",
    settings: {
      name: "Tikka Town",
      tagline: "The Tandoori Experience",
      currency: "₹",
      tablesCount: 8,
      taxRate: 0.05,
      serviceChargeRate: 0.02
    },
    menu: [
      { id: "menu-2-1", name: "Paneer Tikka", category: "Starters", price: 190, desc: "Spiced cottage cheese cubes grilled with capsicum.", image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500&auto=format&fit=crop&q=60", available: true, veg: true, bestseller: true },
      { id: "menu-2-2", name: "Chicken Tikka", category: "Starters", price: 240, desc: "Boneless chicken chunks marinated in yogurt and tandoori spices.", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=60", available: true, veg: false, bestseller: true },
      { id: "menu-2-3", name: "Tandoori Chicken", category: "Starters", price: 280, desc: "Classic half chicken roasted on skewers in the tandoor clay oven.", image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500&auto=format&fit=crop&q=60", available: true, veg: false, bestseller: false },
      { id: "menu-2-4", name: "Garlic Naan", category: "Rotis", price: 55, desc: "Tandoori flatbread topped with minced garlic and coriander.", image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=500&auto=format&fit=crop&q=60", available: true, veg: true, bestseller: false },
      { id: "menu-2-5", name: "Butter Naan", category: "Rotis", price: 45, desc: "Leavened flatbread brushed with butter.", image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=500&auto=format&fit=crop&q=60", available: true, veg: true, bestseller: false },
      { id: "menu-2-6", name: "Mango Lassi", category: "Drinks", price: 70, desc: "Creamy yogurt drink blended with sweet mango pulp.", image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=500&auto=format&fit=crop&q=60", available: true, veg: true, bestseller: true }
    ],
    orders: [
      { id: "201", table: "04", time: "12:05 PM", timeAgo: "10 min ago", items: [{ name: "Tandoori Chicken", qty: 1, price: 280 }, { name: "Garlic Naan", qty: 3, price: 55 }, { name: "Mango Lassi", qty: 2, price: 70 }], notes: "Spicy", subtotal: 585, tax: 29.25, charge: 11.7, total: 625.95, status: "preparing", billingStatus: "unpaid" },
      { id: "202", table: "02", time: "12:10 PM", timeAgo: "5 min ago", items: [{ name: "Paneer Tikka", qty: 1, price: 190 }, { name: "Butter Naan", qty: 2, price: 45 }], notes: "", subtotal: 280, tax: 14, charge: 5.6, total: 299.6, status: "new", billingStatus: "unpaid" }
    ],
    tables: [
      { id: "T-01", status: "Free", seats: 4 },
      { id: "T-02", status: "Occupied", seats: 2 },
      { id: "T-03", status: "Free", seats: 4 },
      { id: "T-04", status: "Occupied", seats: 6 },
      { id: "T-05", status: "Free", seats: 4 },
      { id: "T-06", status: "Free", seats: 2 },
      { id: "T-07", status: "Free", seats: 4 },
      { id: "T-08", status: "Free", seats: 8 }
    ],
    billingData: [
      { table: "Table 04", orders: 1, total: 625.95, status: "Unpaid" },
      { table: "Table 02", orders: 1, total: 299.6, status: "Unpaid" }
    ],
    staff: [
      { id: "S-21", name: "Vikram Singh", role: "Waiter", phone: "9876543220", email: "vikram@tikka.com", status: "On Duty", password: "waiter123" },
      { id: "S-22", name: "Rajesh Sharma", role: "Kitchen", phone: "9876543221", email: "rajesh@tikka.com", status: "On Duty", password: "chef123" }
    ],
    kitchenLogin: {
      email: "kitchen@tikkatown.com",
      password: "kitchen123"
    }
  },
  "rest-3": {
    id: "rest-3",
    name: "Biryani House",
    ownerName: "Salim Mohammed",
    email: "admin@biryani.com",
    owner: "admin@biryani.com",
    phone: "9876543230",
    address: "78 Charminar Road",
    city: "Hyderabad",
    state: "Telangana",
    gstNumber: "36AABCB9012C3ZW",
    createdDate: "2026-03-05",
    openingTime: "10:00",
    closingTime: "22:30",
    logo: "",
    banner: "",
    plan: "Basic",
    status: "Active",
    settings: {
      name: "Biryani House",
      tagline: "Authentic Dum Biryani",
      currency: "₹",
      tablesCount: 4,
      taxRate: 0.025,
      serviceChargeRate: 0.00
    },
    menu: [
      { id: "menu-3-1", name: "Chicken Biryani", category: "Rice Meals", price: 290, desc: "Classic chicken dum biryani.", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=60", available: true, veg: false, bestseller: true },
      { id: "menu-3-2", name: "Mutton Dum Biryani", category: "Rice Meals", price: 380, desc: "Aromatic basmati rice cooked with tender mutton.", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=60", available: true, veg: false, bestseller: true },
      { id: "menu-3-3", name: "Veg Dum Biryani", category: "Rice Meals", price: 220, desc: "Fragrant rice cooked with fresh seasonal vegetables.", image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60", available: true, veg: true, bestseller: false }
    ],
    orders: [
      { id: "301", table: "01", time: "11:50 AM", timeAgo: "25 min ago", items: [{ name: "Chicken Biryani", qty: 2, price: 290 }], notes: "", subtotal: 580, tax: 14.5, charge: 0, total: 594.5, status: "ready", billingStatus: "unpaid" }
    ],
    tables: [
      { id: "T-01", status: "Occupied", seats: 4 },
      { id: "T-02", status: "Free", seats: 4 },
      { id: "T-03", status: "Free", seats: 4 },
      { id: "T-04", status: "Free", seats: 2 }
    ],
    billingData: [
      { table: "Table 01", orders: 1, total: 594.5, status: "Unpaid" }
    ],
    staff: [
      { id: "S-31", name: "Salim Khan", role: "Kitchen", phone: "9876543230", email: "salim@biryani.com", status: "On Duty", password: "chef123" },
      { id: "S-32", name: "Abdul Rahim", role: "Waiter", phone: "9876543231", email: "abdul@biryani.com", status: "On Duty", password: "waiter123" }
    ],
    kitchenLogin: {
      email: "kitchen@biryani.com",
      password: "kitchen123"
    }
  },
  "rest-4": {
    id: "rest-4",
    name: "Dosa Express",
    ownerName: "Karthik Naidu",
    email: "admin@dosa.com",
    owner: "admin@dosa.com",
    phone: "9876543240",
    address: "23 Anna Salai",
    city: "Chennai",
    state: "Tamil Nadu",
    gstNumber: "33AABCD3456D4ZV",
    createdDate: "2026-04-20",
    openingTime: "06:00",
    closingTime: "21:00",
    logo: "",
    banner: "",
    plan: "Enterprise",
    status: "Suspended",
    settings: {
      name: "Dosa Express",
      tagline: "Fast & Crispy Dosas",
      currency: "₹",
      tablesCount: 15,
      taxRate: 0.05,
      serviceChargeRate: 0.05
    },
    menu: [
      { id: "menu-4-1", name: "Plain Dosa", category: "Tiffin", price: 90, desc: "Crispy thin golden crepe.", image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500&auto=format&fit=crop&q=60", available: true, veg: true, bestseller: false },
      { id: "menu-4-2", name: "Masala Dosa", category: "Tiffin", price: 110, desc: "Dosa filled with spiced potato mash.", image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500&auto=format&fit=crop&q=60", available: true, veg: true, bestseller: true },
      { id: "menu-4-3", name: "Filter Coffee", category: "Drinks", price: 40, desc: "Chicory infused traditional South Indian coffee.", image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=60", available: true, veg: true, bestseller: true }
    ],
    orders: [],
    tables: [
      { id: "T-01", status: "Free", seats: 4 },
      { id: "T-02", status: "Free", seats: 4 }
    ],
    billingData: [],
    staff: [
      { id: "S-41", name: "Karthik Raja", role: "Kitchen", phone: "9876543240", email: "karthik@dosa.com", status: "On Duty", password: "chef123" }
    ],
    kitchenLogin: {
      email: "kitchen@dosa.com",
      password: "kitchen123"
    }
  }
};

// APPLICATION STATE WITH MULTI-TENANT SaaS properties
let state = {
  restaurantSettings: {},
  menu: [],
  orders: [],
  tables: [],
  billingData: [],
  activeBillingTable: "",
  activeIncomingFilter: "All",
  activeMenuCategory: "All Items",
  editingMenuItemId: null,
  selectedTableId: "",
  qrCustomizer: {
    color: "#ff7a00",
    showLogo: true
  },

  cart: [],
  activeCustomerOrder: null,
  activeCustomerTable: "01",

  staff: [],
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
    logo: "ChatGPT Image May 28, 2026, 03_54_23 PM.png",
    supportEmail: "support@serviq.com",
    commission: 2.5,
    gateway: "stripe"
  },
  saasPlans: [
    { id: "plan-basic", name: "Basic", monthlyPrice: 999, annualPrice: 9999, branchLimit: 1, userLimit: 5, orderLimit: 500, features: "Standard Support, Basic Analytics", status: "Active", billingCycle: "mo", autoRenewal: true },
    { id: "plan-standard", name: "Standard", monthlyPrice: 2499, annualPrice: 24999, branchLimit: 3, userLimit: 15, orderLimit: 2000, features: "Priority Support, Advanced Analytics, QR Customizer", status: "Active", billingCycle: "mo", autoRenewal: true },
    { id: "plan-premium", name: "Premium", monthlyPrice: 4999, annualPrice: 49999, branchLimit: 10, userLimit: 50, orderLimit: 10000, features: "24/7 Phone Support, Full Analytics, Custom Branding, API Access", status: "Active", billingCycle: "mo", autoRenewal: true },
    { id: "plan-enterprise", name: "Enterprise", monthlyPrice: 9999, annualPrice: 99999, branchLimit: 100, userLimit: 500, orderLimit: 999999, features: "Dedicated AM, White Label, SLA, Custom Integration, Priority Onboarding", status: "Active", billingCycle: "mo", autoRenewal: true }
  ],
  saasAdmins: [
    { id: "ADM-001", name: "Saravana Kumaran", email: "admin@saravana.com", phone: "9876543210", restaurantName: "Saravana Bhavan", role: "Owner", status: "Active", lastLogin: "2026-06-02 12:15 PM" },
    { id: "ADM-002", name: "Rajesh Verma", email: "admin@tikkatown.com", phone: "9876543220", restaurantName: "Tikka Town", role: "Owner", status: "Active", lastLogin: "2026-06-02 11:30 AM" },
    { id: "ADM-003", name: "Salim Mohammed", email: "admin@biryani.com", phone: "9876543230", restaurantName: "Biryani House", role: "Owner", status: "Active", lastLogin: "2026-06-01 09:45 PM" },
    { id: "ADM-004", name: "Karthik Naidu", email: "admin@dosa.com", phone: "9876543240", restaurantName: "Dosa Express", role: "Owner", status: "Disabled", lastLogin: "2026-05-20 03:10 PM" }
  ],
  saasAdminFilter: "All",
  saasLogs: [
    { time: "12:12 PM", text: "Saravana Bhavan generated bill for Table 02 (₹378)" },
    { time: "11:45 AM", text: "Tikka Town added Ramesh Kumar as a Waiter" },
    { time: "11:30 AM", text: "Biryani House upgraded to Standard Plan" },
    { time: "10:15 AM", text: "Dosa Express account suspended by admin" }
  ],
  saasInvoices: [
    { id: "INV-2026-001", restaurant: "Saravana Bhavan", plan: "Standard", amount: 2499, paymentMethod: "Razorpay", date: "2026-05-28", paymentDate: "2026-05-28", dueDate: "2026-06-28", status: "Paid" },
    { id: "INV-2026-002", restaurant: "Tikka Town", plan: "Premium", amount: 4999, paymentMethod: "Stripe", date: "2026-05-27", paymentDate: "2026-05-27", dueDate: "2026-06-27", status: "Paid" },
    { id: "INV-2026-003", restaurant: "Biryani House", plan: "Basic", amount: 999, paymentMethod: "Razorpay", date: "2026-05-25", paymentDate: "2026-05-25", dueDate: "2026-06-25", status: "Paid" },
    { id: "INV-2026-004", restaurant: "Dosa Express", plan: "Enterprise", amount: 9999, paymentMethod: "Bank Transfer", date: "2026-05-20", paymentDate: "", dueDate: "2026-06-20", status: "Pending" },
    { id: "INV-2026-005", restaurant: "Saravana Bhavan", plan: "Standard", amount: 2499, paymentMethod: "Razorpay", date: "2026-04-28", paymentDate: "2026-04-28", dueDate: "2026-05-28", status: "Paid" },
    { id: "INV-2026-006", restaurant: "Tikka Town", plan: "Premium", amount: 4999, paymentMethod: "Stripe", date: "2026-04-27", paymentDate: "2026-04-27", dueDate: "2026-05-27", status: "Paid" }
  ],
  invoiceFilter: "All"
};

// DOM SELECTIONS
const loginView = document.getElementById("login-view");
const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");
const dashboardView = document.getElementById("dashboard-view");
const sidebarItems = document.querySelectorAll(".sidebar-item");
const activePanelTitle = document.getElementById("active-panel-title");
const panelViews = document.querySelectorAll(".panel-view");

const toggleSimulatorBtn = document.getElementById("toggle-simulator-btn");
const simulatorPanel = document.getElementById("simulator-panel");
const closeSimulatorBtn = document.getElementById("close-simulator-btn");
const logoutBtn = document.getElementById("logout-btn");

// Multi-tenant SaaS state helpers
function saveCurrentTenantData() {
  if (!state.currentRestaurantId) return;
  const rest = restaurantsData[state.currentRestaurantId];
  if (!rest) return;
  
  rest.settings = JSON.parse(JSON.stringify(state.restaurantSettings));
  rest.menu = JSON.parse(JSON.stringify(state.menu));
  rest.orders = JSON.parse(JSON.stringify(state.orders));
  rest.tables = JSON.parse(JSON.stringify(state.tables));
  rest.billingData = JSON.parse(JSON.stringify(state.billingData));
  rest.staff = JSON.parse(JSON.stringify(state.staff));
  rest.kitchenLogin = JSON.parse(JSON.stringify(state.kitchenLogin));
}

function loadTenantData(restaurantId) {
  const rest = restaurantsData[restaurantId];
  if (!rest) return;
  
  state.currentRestaurantId = restaurantId;
  state.restaurantSettings = JSON.parse(JSON.stringify(rest.settings));
  state.menu = JSON.parse(JSON.stringify(rest.menu));
  state.orders = JSON.parse(JSON.stringify(rest.orders));
  state.tables = JSON.parse(JSON.stringify(rest.tables));
  state.billingData = JSON.parse(JSON.stringify(rest.billingData));
  state.staff = JSON.parse(JSON.stringify(rest.staff));
  state.kitchenLogin = JSON.parse(JSON.stringify(rest.kitchenLogin));
  
  // Update UI Selectors for simulation
  const selectSim = document.getElementById("cust-select-table-sim");
  if (selectSim && state.tables.length > 0) {
    selectSim.innerHTML = state.tables.map(t => `<option value="${t.id.replace("T-","")}">${t.id}</option>`).join("");
    const defaultTable = state.tables[0].id.replace("T-","");
    selectSim.value = defaultTable;
    state.activeCustomerTable = defaultTable;
  }
}

// LOGIN ROLE TOGGLE (Super Admin / Admin)
window.switchLoginRole = function(role) {
  const superBtn = document.getElementById("toggle-superadmin");
  const adminBtn = document.getElementById("toggle-admin");
  const demoCreds_SA = document.getElementById("demo-creds-superadmin");
  const demoCreds_Admin = document.getElementById("demo-creds-admin");
  const emailLabel = document.getElementById("login-email-label");
  const pwdLabel = document.getElementById("login-password-label");
  const emailInput = document.getElementById("login-email");
  const pwdInput = document.getElementById("login-password");
  const submitBtn = document.getElementById("login-submit-btn");
  const loginError = document.getElementById("login-error");
  
  // Hide error on switch
  if (loginError) loginError.style.display = "none";
  
  if (role === "superadmin") {
    // Active state for Super Admin button
    superBtn.style.background = "var(--primary)";
    superBtn.style.color = "#fff";
    adminBtn.style.background = "transparent";
    adminBtn.style.color = "var(--primary)";
    
    // Show/hide demo creds
    demoCreds_SA.style.display = "block";
    demoCreds_Admin.style.display = "none";
    
    // Update labels & inputs
    emailLabel.textContent = "Super Admin Email";
    pwdLabel.textContent = "Super Admin Password";
    emailInput.value = "superadmin@serviq.com";
    emailInput.placeholder = "superadmin@serviq.com";
    pwdInput.value = "super123";
    pwdInput.placeholder = "Enter super admin password";
    submitBtn.textContent = "Login as Super Admin";
  } else {
    // Active state for Admin button
    adminBtn.style.background = "var(--primary)";
    adminBtn.style.color = "#fff";
    superBtn.style.background = "transparent";
    superBtn.style.color = "var(--primary)";
    
    // Show/hide demo creds
    demoCreds_SA.style.display = "none";
    demoCreds_Admin.style.display = "block";
    
    // Update labels & inputs
    emailLabel.textContent = "Admin Email";
    pwdLabel.textContent = "Admin Password";
    emailInput.value = "admin@saravana.com";
    emailInput.placeholder = "admin@restaurant.com";
    pwdInput.value = "admin123";
    pwdInput.placeholder = "Enter admin password";
    submitBtn.textContent = "Login as Admin";
  }
};

// BOOTSTRAP INITIAL SETUP
document.addEventListener("DOMContentLoaded", () => {
  // Load first restaurant as standard tenant database bootstrap
  loadTenantData("rest-1");
  initApp();
});

function initApp() {
  setupEventListeners();

  // Save changes to current tenant
  saveCurrentTenantData();

  // Render main widgets
  renderDashboardOverview();
  renderIncomingOrders();
  renderMenuManagement();
  renderBillingPanel();
  renderTablesPage();
  renderStaffPage();

  const selectSim = document.getElementById("cust-select-table-sim");
  if (selectSim && state.tables.length > 0) {
    const firstTable = state.tables[0].id.replace("T-","");
    selectSim.value = firstTable;
    state.activeCustomerTable = firstTable;
  }
  updateSimulatorTableLabels();
}

// ROUTING / TAB STATE MANAGEMENT
function switchTab(tabId) {
  sidebarItems.forEach(item => {
    if (item.getAttribute("data-tab") === tabId) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });

  document.querySelectorAll(".panel-view").forEach(panel => {
    panel.classList.remove("active");
  });

  const targetPanel = document.getElementById(`panel-${tabId}`);
  if (targetPanel) {
    targetPanel.classList.add("active");
  }

  // Format header titles matching user screens
  const titles = {
    overview: "Dashboard",
    orders: "Incoming Orders",
    menu: "Menu Management",
    billing: "Billing Panel",
    saas: "Tables & QR Management",
    staff: "Staff Management",
    settings: "Settings"
  };
  activePanelTitle.textContent = titles[tabId] || "Dashboard";

  if (tabId === "settings") {
    renderSettingsPanel();
  } else if (tabId === "saas") {
    renderTablesPage();
  } else if (tabId === "staff") {
    renderStaffPage();
  }
}

function updateSidebarForRole(role) {
  const allowedTabs = {
    "Admin": ["overview", "orders", "menu", "billing", "saas", "staff", "settings"],
    "Kitchen": ["orders"],
    "Waiter": ["orders", "saas"]
  };

  const allowed = allowedTabs[role] || allowedTabs["Waiter"];

  sidebarItems.forEach(item => {
    const tabId = item.getAttribute("data-tab");
    if (allowed.includes(tabId)) {
      item.style.display = "block";
    } else {
      item.style.display = "none";
    }
  });
}

// EVENT LISTENERS
function setupEventListeners() {
  // Login flow
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value.trim().toLowerCase();
    const password = document.getElementById("login-password").value;

    // 1. Check if SaaS Owner
    if (email === "superadmin@serviq.com" && password === "super123") {
      state.currentUser = { name: "SaaS Owner", email: email, role: "SuperAdmin" };
      loginView.style.display = "none";
      document.getElementById("superadmin-view").style.display = "flex";
      loginError.style.display = "none";
      initSaaSApp();
      return;
    }

    // 2. Check if Tenant owner/admin or staff credentials in mock database
    let loggedInUser = null;
    let role = null;
    let targetRestaurantId = null;

    // Check tenant admins
    for (let id in restaurantsData) {
      const rest = restaurantsData[id];
      if (rest.owner.toLowerCase() === email && password === "admin123") {
        if (rest.status === "Suspended") {
          loginError.textContent = "❌ This restaurant account has been suspended by the platform administration.";
          loginError.style.display = "block";
          return;
        }
        targetRestaurantId = id;
        loggedInUser = { name: rest.name + " Admin", email: email, role: "Admin" };
        role = "Admin";
        break;
      }
    }

    // Check tenant kitchen and staff
    if (!loggedInUser) {
      for (let id in restaurantsData) {
        const rest = restaurantsData[id];
        if (email === rest.kitchenLogin.email.toLowerCase() && password === rest.kitchenLogin.password) {
          if (rest.status === "Suspended") {
            loginError.textContent = "❌ This restaurant account has been suspended by the platform administration.";
            loginError.style.display = "block";
            return;
          }
          targetRestaurantId = id;
          loggedInUser = { name: "Kitchen Station", email: email, role: "Kitchen" };
          role = "Kitchen";
          break;
        }

        const staffMember = rest.staff.find(s => s.email.toLowerCase() === email && s.password === password);
        if (staffMember) {
          if (rest.status === "Suspended") {
            loginError.textContent = "❌ This restaurant account has been suspended by the platform administration.";
            loginError.style.display = "block";
            return;
          }
          targetRestaurantId = id;
          loggedInUser = { name: staffMember.name, email: staffMember.email, role: staffMember.role };
          role = staffMember.role;
          break;
        }
      }
    }

    if (loggedInUser && targetRestaurantId) {
      // Swapping state to selected tenant
      loadTenantData(targetRestaurantId);
      
      state.currentUser = loggedInUser;
      loginView.style.display = "none";
      dashboardView.style.display = "flex";
      loginError.style.display = "none";

      // Seed details inside profile header
      document.getElementById("profile-restaurant-name").textContent = state.restaurantSettings.name;
      document.getElementById("avatar-letter").textContent = state.restaurantSettings.name.charAt(0).toUpperCase();
      document.getElementById("profile-user-email").textContent = `${loggedInUser.name} (${loggedInUser.role})`;

      // Filter sidebar options based on role
      updateSidebarForRole(role);

      // Switch tab to a valid tab for that role
      if (role === "Kitchen") {
        switchTab("orders");
      } else if (role === "Waiter") {
        switchTab("saas");
      } else {
        switchTab("overview");
      }

      renderDashboardOverview();
    } else {
      loginError.textContent = "❌ Invalid email or password. Please try again.";
      loginError.style.display = "block";
    }
  });

  // Toggle Password Visibility
  const togglePasswordBtn = document.getElementById("toggle-password-btn");
  const loginPasswordInput = document.getElementById("login-password");
  if (togglePasswordBtn && loginPasswordInput) {
    togglePasswordBtn.addEventListener("click", () => {
      if (loginPasswordInput.type === "password") {
        loginPasswordInput.type = "text";
        togglePasswordBtn.textContent = "🙈";
      } else {
        loginPasswordInput.type = "password";
        togglePasswordBtn.textContent = "👁️";
      }
    });
  }

  // Logout Flow
  logoutBtn.addEventListener("click", () => {
    saveCurrentTenantData();
    dashboardView.style.display = "none";
    loginView.style.display = "flex";
    document.getElementById("login-password").value = "";
    state.currentUser = null;
    state.currentRestaurantId = null;
    state.isImpersonating = false;
    document.getElementById("saas-impersonation-banner").style.display = "none";
    updateSidebarForRole("Admin");
  });

  // SaaS Logout Flow
  const saasLogoutBtn = document.getElementById("saas-logout-btn");
  if (saasLogoutBtn) {
    saasLogoutBtn.addEventListener("click", () => {
      document.getElementById("superadmin-view").style.display = "none";
      loginView.style.display = "flex";
      document.getElementById("login-password").value = "";
      state.currentUser = null;
    });
  }

  // SaaS Exit Impersonation Button
  const saasExitImpersonationBtn = document.getElementById("saas-exit-impersonation-btn");
  if (saasExitImpersonationBtn) {
    saasExitImpersonationBtn.addEventListener("click", () => {
      exitImpersonation();
    });
  }

  // SaaS Add Restaurant Button listener
  const saasAddRestBtn = document.getElementById("saas-add-restaurant-btn");
  if (saasAddRestBtn) {
    saasAddRestBtn.addEventListener("click", () => {
      document.getElementById("saas-restaurant-form-title").textContent = "Add New Restaurant";
      document.getElementById("saas-edit-rest-id").value = "";
      document.getElementById("saas-input-name").value = "";
      document.getElementById("saas-input-name").readOnly = false;
      document.getElementById("saas-input-owner-name").value = "";
      document.getElementById("saas-input-owner").value = "";
      document.getElementById("saas-input-owner").readOnly = false;
      document.getElementById("saas-input-phone").value = "";
      document.getElementById("saas-input-address").value = "";
      document.getElementById("saas-input-city").value = "";
      document.getElementById("saas-input-state").value = "";
      document.getElementById("saas-input-gst").value = "";
      document.getElementById("saas-input-opening").value = "08:00";
      document.getElementById("saas-input-closing").value = "22:00";
      document.getElementById("saas-input-logo").value = "";
      document.getElementById("saas-input-banner").value = "";
      document.getElementById("saas-input-plan").value = "Standard";
      document.getElementById("saas-input-tables").value = "5";
      document.getElementById("saas-input-status").value = "Active";
      document.getElementById("saas-input-created").value = new Date().toISOString().split('T')[0];
      
      document.getElementById("saas-restaurant-modal").style.display = "flex";
    });
  }

  // SaaS Restaurant Form Submit
  const saasRestForm = document.getElementById("saas-restaurant-form");
  if (saasRestForm) {
    saasRestForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const editId = document.getElementById("saas-edit-rest-id").value;
      const name = document.getElementById("saas-input-name").value.trim();
      const ownerName = document.getElementById("saas-input-owner-name").value.trim();
      const owner = document.getElementById("saas-input-owner").value.trim(); // email
      const phone = document.getElementById("saas-input-phone").value.trim();
      const address = document.getElementById("saas-input-address").value.trim();
      const city = document.getElementById("saas-input-city").value.trim();
      const stateVal = document.getElementById("saas-input-state").value.trim();
      const gstNumber = document.getElementById("saas-input-gst").value.trim();
      const openingTime = document.getElementById("saas-input-opening").value;
      const closingTime = document.getElementById("saas-input-closing").value;
      const logo = document.getElementById("saas-input-logo").value.trim();
      const banner = document.getElementById("saas-input-banner").value.trim();
      const plan = document.getElementById("saas-input-plan").value;
      const tablesLimit = parseInt(document.getElementById("saas-input-tables").value, 10);
      const status = document.getElementById("saas-input-status").value;
      const createdDate = document.getElementById("saas-input-created").value;
      
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      if (editId) {
        // Edit flow
        const rest = restaurantsData[editId];
        if (rest) {
          rest.name = name;
          rest.ownerName = ownerName;
          rest.owner = owner; // Email
          rest.email = owner; // Email
          rest.phone = phone;
          rest.address = address;
          rest.city = city;
          rest.state = stateVal;
          rest.gstNumber = gstNumber;
          rest.plan = plan;
          rest.status = status;
          rest.createdDate = createdDate;
          rest.openingTime = openingTime;
          rest.closingTime = closingTime;
          rest.logo = logo;
          rest.banner = banner;
          
          if (!rest.settings) rest.settings = {};
          rest.settings.name = name;
          rest.settings.tablesCount = tablesLimit;
          
          state.saasLogs.unshift({
            time: timeStr,
            text: `Updated restaurant: ${name}`
          });
          
          alert("Restaurant details updated successfully!");
        }
      } else {
        // Create new flow
        const newId = `rest-${Date.now()}`;
        const cleanKey = name.toLowerCase().replace(/[^a-z0-9]/g, "");
        const emailPrefix = cleanKey || "restaurant";
        
        restaurantsData[newId] = {
          id: newId,
          name: name,
          ownerName: ownerName,
          owner: owner || `admin@${emailPrefix}.com`,
          email: owner || `admin@${emailPrefix}.com`,
          phone: phone,
          address: address,
          city: city,
          state: stateVal,
          gstNumber: gstNumber,
          plan: plan,
          status: status,
          createdDate: createdDate || now.toISOString().split('T')[0],
          openingTime: openingTime || "08:00",
          closingTime: closingTime || "22:00",
          logo: logo || "",
          banner: banner || "",
          settings: {
            name: name,
            tagline: "SaaS Multi-tenant Restaurant",
            currency: "₹",
            tablesCount: tablesLimit,
            taxRate: 0.025,
            serviceChargeRate: 0.00
          },
          menu: [
            { id: "menu-new-1", name: "Paneer Tikka", category: "Starters", price: 180, desc: "Marinated cottage cheese cubes grilled.", available: true, veg: true },
            { id: "menu-new-2", name: "Chicken Biryani", category: "Rice Meals", price: 320, desc: "Fragrant basmati rice layered with chicken.", available: true, veg: false }
          ],
          orders: [],
          tables: Array.from({ length: Math.min(tablesLimit, 4) }, (_, i) => ({
            id: `T-0${i+1}`, status: "Free", seats: 4
          })),
          billingData: [],
          staff: [
            { id: "staff-1", name: "Anitha", role: "Waiter", email: `waiter@${emailPrefix}.com`, password: "waiter123", phone: "9876543211", status: "On Duty" }
          ],
          kitchenLogin: {
            email: `kitchen@${emailPrefix}.com`,
            password: "kitchen123"
          }
        };
        
        state.saasLogs.unshift({
          time: timeStr,
          text: `Provisioned new tenant: ${name} (${plan} Plan)`
        });
        
        alert("New restaurant created successfully!");
      }
      
      document.getElementById("saas-restaurant-modal").style.display = "none";
      renderSaaSRestaurantsDirectory();
      renderSaaSOverview();
    });
  }

  // Sidebar Tabs
  sidebarItems.forEach(item => {
    item.addEventListener("click", () => {
      const tabId = item.getAttribute("data-tab");
      switchTab(tabId);
    });
  });

  // Incoming Orders Filter buttons
  const incomingFilterTabs = document.getElementById("incoming-filter-tabs");
  if (incomingFilterTabs) {
    incomingFilterTabs.addEventListener("click", (e) => {
      const btn = e.target.closest(".filter-btn");
      if (btn) {
        document.querySelectorAll("#incoming-filter-tabs .filter-btn").forEach(b => {
          b.classList.remove("active");
        });
        btn.classList.add("active");
        state.activeIncomingFilter = btn.getAttribute("data-filter");
        renderIncomingOrders();
      }
    });
  }

  // Simulator Toggle
  toggleSimulatorBtn.addEventListener("click", () => {
    simulatorPanel.classList.toggle("collapsed");
    renderCustomerMenu();
  });

  closeSimulatorBtn.addEventListener("click", () => {
    simulatorPanel.classList.add("collapsed");
  });

  // Menu Search
  document.getElementById("menu-search-input").addEventListener("input", (e) => {
    renderMenuList(e.target.value.trim());
  });

  // Category left menu selector click handler
  document.getElementById("menu-categories-list").addEventListener("click", (e) => {
    const li = e.target.closest("li");
    if (li) {
      document.querySelectorAll("#menu-categories-list li").forEach(item => item.classList.remove("active"));
      li.classList.add("active");
      state.activeMenuCategory = li.getAttribute("data-cat");
      renderMenuList();
    }
  });

  // Menu right pane Cancel button
  document.getElementById("menu-cancel-btn").addEventListener("click", () => {
    resetMenuEditForm();
  });

  // Menu right pane Save Changes form handler
  document.getElementById("menu-edit-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const itemId = document.getElementById("edit-item-id").value;
    const name = document.getElementById("edit-input-name").value;
    const desc = document.getElementById("edit-input-desc").value;
    const price = parseFloat(document.getElementById("edit-input-price").value);
    const category = document.getElementById("edit-input-category").value;

    const index = state.menu.findIndex(item => item.id === itemId);
    if (index !== -1) {
      state.menu[index] = { ...state.menu[index], name, desc, price, category };
      alert("Menu item changes saved successfully.");
      resetMenuEditForm();
      renderMenuList();
      renderCustomerMenu();
    } else {
      // Create new if ID not present (Add mode)
      const newDish = {
        id: "menu-" + Date.now(),
        name,
        category,
        price,
        desc,
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60",
        available: true
      };
      state.menu.push(newDish);
      alert("New menu dish successfully created.");
      resetMenuEditForm();
      renderMenuList();
      renderCustomerMenu();
    }
    const modal = document.getElementById("menu-item-modal");
    if (modal) modal.style.display = "none";
  });

  // Add Item top right action button
  document.getElementById("add-menu-item-btn").addEventListener("click", () => {
    document.getElementById("menu-form-title").textContent = "Add New Item";
    document.getElementById("edit-item-id").value = "";
    document.getElementById("edit-input-name").value = "";
    document.getElementById("edit-input-desc").value = "";
    document.getElementById("edit-input-price").value = "";
    document.getElementById("edit-input-category").value = "Starters";
    document.getElementById("edit-image-placeholder-label").textContent = "No Image Selected";
    const modal = document.getElementById("menu-item-modal");
    if (modal) modal.style.display = "flex";
  });

  const closeMenuModalBtn = document.getElementById("close-menu-item-modal");
  if (closeMenuModalBtn) {
    closeMenuModalBtn.addEventListener("click", () => {
      const modal = document.getElementById("menu-item-modal");
      if (modal) modal.style.display = "none";
    });
  }

  const menuCancelBtn = document.getElementById("menu-cancel-btn");
  if (menuCancelBtn) {
    menuCancelBtn.addEventListener("click", () => {
      resetMenuEditForm();
      const modal = document.getElementById("menu-item-modal");
      if (modal) modal.style.display = "none";
    });
  }


  // Billing list selection click handler
  document.getElementById("billing-tables-list").addEventListener("click", (e) => {
    const row = e.target.closest(".table-selection-row");
    if (row) {
      document.querySelectorAll(".table-selection-row").forEach(r => r.classList.remove("active"));
      row.classList.add("active");
      state.activeBillingTable = row.getAttribute("data-table");
      renderBillingSummary();
    }
  });

  // Mark as Paid button
  document.getElementById("bill-pay-btn").addEventListener("click", () => {
    const tableId = state.activeBillingTable;
    const index = state.billingData.findIndex(item => item.table === tableId);

    if (index !== -1) {
      state.billingData[index].status = "Paid";

      // Update order status in orders array
      const rawNum = tableId.replace("Table ", "");
      state.orders.forEach((ord, idx) => {
        if (ord.table === rawNum || parseInt(ord.table) === parseInt(rawNum)) {
          state.orders[idx].billingStatus = "paid";
          state.orders[idx].status = "done";
        }
      });

      // Free the table status
      const cleanTableId = rawNum.length === 1 ? `T-0${rawNum}` : `T-${rawNum}`;
      const tableIdx = state.tables.findIndex(t => t.id === cleanTableId);
      if (tableIdx !== -1) {
        state.tables[tableIdx].status = "Free";
      }

      alert(`Payment complete for ${tableId}. Table status set to Available.`);

      renderBillingPanel();
      renderDashboardOverview();
      renderIncomingOrders();
      renderTablesPage();
    }
  });

  // CUSTOMER SIMULATOR ACTIONS
  document.getElementById("cust-select-table-sim").addEventListener("change", (e) => {
    state.activeCustomerTable = e.target.value;
    updateSimulatorTableLabels();
  });

  document.getElementById("cust-start-btn").addEventListener("click", () => {
    switchCustomerScreen("menu");
    renderCustomerMenu();
  });

  document.getElementById("cust-menu-search-input").addEventListener("input", (e) => {
    renderCustomerMenu(null, e.target.value.trim());
  });

  document.getElementById("qty-minus").addEventListener("click", () => {
    let qtyVal = parseInt(document.getElementById("qty-value").textContent, 10);
    if (qtyVal > 1) {
      qtyVal--;
      document.getElementById("qty-value").textContent = qtyVal;
      updateCustomerItemModalPrice(qtyVal);
    }
  });

  document.getElementById("qty-plus").addEventListener("click", () => {
    let qtyVal = parseInt(document.getElementById("qty-value").textContent, 10);
    qtyVal++;
    document.getElementById("qty-value").textContent = qtyVal;
    updateCustomerItemModalPrice(qtyVal);
  });

  document.getElementById("cust-modal-close").addEventListener("click", () => {
    document.getElementById("cust-item-modal").style.display = "none";
  });

  document.getElementById("cust-view-cart-btn").addEventListener("click", () => {
    switchCustomerScreen("cart");
    renderCustomerCart();
  });

  const headerCartBtn = document.getElementById("cust-header-cart-btn");
  if (headerCartBtn) {
    headerCartBtn.addEventListener("click", () => {
      switchCustomerScreen("cart");
      renderCustomerCart();
    });
  }

  document.getElementById("cust-cart-back-btn").addEventListener("click", () => {
    switchCustomerScreen("menu");
  });

  document.getElementById("cust-place-order-btn").addEventListener("click", () => {
    if (state.cart.length === 0) return;

    // Construct Order
    const randomIdNum = Math.floor(800 + Math.random() * 100);
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let subtotal = 0;
    const orderItems = state.cart.map(cartItem => {
      subtotal += cartItem.price * cartItem.quantity;
      return {
        name: cartItem.name,
        qty: cartItem.quantity,
        price: cartItem.price
      };
    });

    const tax = parseFloat((subtotal * 0.05).toFixed(2)); // 5% GST
    const total = parseFloat((subtotal + tax).toFixed(2));
    const notes = document.getElementById("cust-order-notes").value.trim();

    const newOrder = {
      id: `${randomIdNum}`,
      table: state.activeCustomerTable,
      time: timeNow,
      timeAgo: "1 min ago",
      items: orderItems,
      notes: notes,
      subtotal: subtotal,
      tax: tax,
      charge: 0,
      total: total,
      status: "new",
      billingStatus: "unpaid"
    };

    // Add to state and save
    state.orders.push(newOrder);
    state.activeCustomerOrder = newOrder;

    // Set table as occupied in state.tables
    const tableToSet = state.activeCustomerTable.length === 1 ? `T-0${state.activeCustomerTable}` : `T-${state.activeCustomerTable}`;
    const tableIdx = state.tables.findIndex(t => t.id === tableToSet);
    if (tableIdx !== -1) {
      state.tables[tableIdx].status = "Occupied";
    }

    // Check if table entry exists in billing
    const cleanTableLabel = `Table ${state.activeCustomerTable}`;
    const bIndex = state.billingData.findIndex(b => b.table === cleanTableLabel);
    if (bIndex !== -1) {
      state.billingData[bIndex].orders += 1;
      state.billingData[bIndex].total += total;
      state.billingData[bIndex].status = "Unpaid";
    } else {
      state.billingData.push({
        table: cleanTableLabel,
        orders: 1,
        total: total,
        status: "Unpaid"
      });
    }

    // Reset customer cart
    state.cart = [];
    document.getElementById("cust-order-notes").value = "";

    // Show indicator on sidebar
    document.getElementById("live-orders-badge").style.display = "inline-block";

    // Shift to tracking page
    switchCustomerScreen("confirm");
    renderCustomerTrackingScreen();

    // Re-render admin panels
    renderDashboardOverview();
    renderIncomingOrders();
    renderBillingPanel();
    renderTablesPage();
  });

  document.getElementById("cust-order-more-btn").addEventListener("click", () => {
    switchCustomerScreen("menu");
    renderCustomerMenu();
  });

  document.getElementById("cust-modal-add-btn").addEventListener("click", () => {
    if (!modalItemTemp) return;

    const qty = parseInt(document.getElementById("qty-value").textContent, 10);
    const notes = document.getElementById("cust-modal-notes").value.trim();

    const existingCartIndex = state.cart.findIndex(cartItem => cartItem.id === modalItemTemp.id && cartItem.notes === notes);
    if (existingCartIndex !== -1) {
      state.cart[existingCartIndex].quantity += qty;
    } else {
      state.cart.push({
        id: modalItemTemp.id,
        name: modalItemTemp.name,
        price: modalItemTemp.price,
        quantity: qty,
        notes: notes
      });
    }

    document.getElementById("cust-item-modal").style.display = "none";
    updateCustomerCartBarSticky();
    modalItemTemp = null;
  });

  // --- SETTINGS EVENT LISTENERS ---
  // Live Preview changes
  const inputsToPreview = ["settings-name", "settings-tables", "settings-tax", "settings-service", "settings-currency"];
  inputsToPreview.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", updateSettingsPreview);
      el.addEventListener("change", updateSettingsPreview);
    }
  });

  // Settings Reset Button click
  const resetBtn = document.getElementById("settings-reset-btn");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      renderSettingsPanel();
      alert("Settings reset to currently saved configuration.");
    });
  }

  // Accent Color Theme dots click handler
  // const themeDots = document.querySelectorAll(".theme-dot");
  // themeDots.forEach(dot => {
  //   dot.addEventListener("click", () => {
  //     themeDots.forEach(d => d.classList.remove("active"));
  //     dot.classList.add("active");
  //   });
  // });

  // Settings Save Button click handler
  const saveBtn = document.getElementById("settings-save-btn");
  if (saveBtn) {
    saveBtn.addEventListener("click", (e) => {
      e.preventDefault();

      const name = document.getElementById("settings-name").value.trim();
      const tagline = document.getElementById("settings-tagline").value.trim();
      const currency = document.getElementById("settings-currency").value;
      const tablesCount = parseInt(document.getElementById("settings-tables").value, 10);
      const taxRatePercent = parseFloat(document.getElementById("settings-tax").value);
      const serviceRatePercent = parseFloat(document.getElementById("settings-service").value);

      if (!name) {
        alert("Please enter a valid restaurant name.");
        return;
      }
      if (isNaN(tablesCount) || tablesCount < 1 || tablesCount > 15) {
        alert("Please enter a tables count between 1 and 15.");
        return;
      }
      if (isNaN(taxRatePercent) || taxRatePercent < 0 || taxRatePercent > 30) {
        alert("Please enter a tax rate between 0% and 30%.");
        return;
      }
      if (isNaN(serviceRatePercent) || serviceRatePercent < 0 || serviceRatePercent > 25) {
        alert("Please enter a service charge rate between 0% and 25%.");
        return;
      }

      // Update state settings
      state.restaurantSettings.name = name;
      state.restaurantSettings.tagline = tagline;
      state.restaurantSettings.currency = currency;
      state.restaurantSettings.taxRate = (taxRatePercent / 100) / 2; // Split into CGST and SGST
      state.restaurantSettings.serviceChargeRate = serviceRatePercent / 100;

      // Dynamic Table Count Update (Regenerate tables array in state)
      const oldTablesCount = state.restaurantSettings.tablesCount;
      state.restaurantSettings.tablesCount = tablesCount;

      if (tablesCount > state.tables.length) {
        for (let i = state.tables.length + 1; i <= tablesCount; i++) {
          const displayId = i < 10 ? `0${i}` : i;
          state.tables.push({ id: `T-${displayId}`, status: "Free" });
        }
      } else if (tablesCount < state.tables.length) {
        state.tables = state.tables.slice(0, tablesCount);
      }

      // Re-populate all dining table dropdowns across panels
      populateSaaSTableDropdowns();
      populateDiningTablesSelectDropdown();

      // Update restaurant name in headers and sidebar profile:
      document.getElementById("profile-restaurant-name").textContent = name;
      document.getElementById("avatar-letter").textContent = name.charAt(0).toUpperCase();

      // Update customer simulator welcome panel text if present:
      const custHeader = document.getElementById("cust-restaurant-name");
      if (custHeader) custHeader.textContent = name;
      const custTagline = document.getElementById("cust-restaurant-tagline");
      if (custTagline) custTagline.textContent = tagline;

      // Dark Mode toggle
      const darkToggle = document.getElementById("settings-darkmode");
      if (darkToggle) {
        if (darkToggle.checked) {
          document.body.classList.add("dark-theme");
        } else {
          document.body.classList.remove("dark-theme");
        }
      }

      // Accent Color saving
      // const activeColorDot = document.querySelector(".theme-dot.active");
      // if (activeColorDot) {
      //   const chosenColor = activeColorDot.getAttribute("data-color");
      //   document.documentElement.style.setProperty('--primary', chosenColor);
      // document.documentElement.style.setProperty('--primary-light', chosenColor + "15");
      // }

      // Re-render and refresh views
      renderDashboardOverview();
      renderIncomingOrders();
      renderBillingPanel();

      alert("Settings successfully saved and applied!");
    });
  }

  // Dining Tables & QR select page change event listener
  const saasTableSelect = document.getElementById("saas-table-select-page");
  if (saasTableSelect) {
    saasTableSelect.addEventListener("change", (e) => {
      const selectedIndex = parseInt(e.target.value, 10);
      const displayIndex = selectedIndex < 10 ? `0${selectedIndex}` : selectedIndex;
      const displayLabel = `Table T-${displayIndex}`;

      const labelDisp = document.getElementById("saas-table-label-display");
      if (labelDisp) {
        labelDisp.textContent = displayLabel;
      }

      // Update QR link subtitle text
      const nextSibling = labelDisp ? labelDisp.nextElementSibling : null;
      if (nextSibling) {
        nextSibling.textContent = `http://localhost:3000/menu?table=T-${displayIndex}`;
      }
    });
  }

  // --- NEW TABLES DASHBOARD EVENT LISTENERS ---
  const addTableBtn = document.getElementById("add-table-btn");
  const addTableModal = document.getElementById("add-table-modal");
  const closeAddTableModal = document.getElementById("close-add-table-modal");

  if (addTableBtn && addTableModal) {
    addTableBtn.addEventListener("click", () => {
      addTableModal.style.display = "flex";
      // Auto suggest ID
      const nextNum = state.tables.length + 1;
      const displayNum = nextNum < 10 ? `0${nextNum}` : nextNum;
      document.getElementById("new-table-id").value = `T-${displayNum}`;
      document.getElementById("new-table-seats").value = "4";
    });
  }

  if (closeAddTableModal && addTableModal) {
    closeAddTableModal.addEventListener("click", () => {
      addTableModal.style.display = "none";
    });
  }

  // Add Table Form Submit
  const addTableForm = document.getElementById("add-table-form");
  if (addTableForm) {
    addTableForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const idVal = document.getElementById("new-table-id").value.trim();
      const seatsVal = parseInt(document.getElementById("new-table-seats").value, 10);

      if (addDiningTable(idVal, seatsVal)) {
        addTableModal.style.display = "none";
        addTableForm.reset();
      }
    });
  }

  // Seating Capacity edit change listener
  const seatsEditInput = document.getElementById("table-seats-edit-input");
  if (seatsEditInput) {
    seatsEditInput.addEventListener("input", (e) => {
      const activeId = state.selectedTableId;
      const tableIndex = state.tables.findIndex(t => t.id === activeId);
      if (tableIndex !== -1) {
        state.tables[tableIndex].seats = parseInt(e.target.value, 10) || 4;
        renderTablesPage();
      }
    });
  }

  // Simulator Launch button click
  const simulateBtn = document.getElementById("simulate-table-btn");
  if (simulateBtn) {
    simulateBtn.addEventListener("click", () => {
      simulateCustomerTable(state.selectedTableId);
    });
  }

  // QR code toggle logo
  const qrLogoCheckbox = document.getElementById("qr-toggle-logo");
  if (qrLogoCheckbox) {
    qrLogoCheckbox.addEventListener("change", (e) => {
      state.qrCustomizer.showLogo = e.target.checked;
      renderQRStickerDetails();
    });
  }

  // QR code color dots
  const qrColorContainer = document.querySelector(".qr-color-dots");
  if (qrColorContainer) {
    qrColorContainer.addEventListener("click", (e) => {
      const dot = e.target.closest(".qr-color-dot");
      if (dot) {
        document.querySelectorAll(".qr-color-dot").forEach(d => d.classList.remove("active"));
        dot.classList.add("active");
        state.qrCustomizer.color = dot.getAttribute("data-color");
        renderQRStickerDetails();
      }
    });
  }

  // --- STAFF EVENT LISTENERS ---
  const addStaffBtn = document.getElementById("add-staff-btn");
  if (addStaffBtn) {
    addStaffBtn.addEventListener("click", () => {
      document.getElementById("staff-form-title").textContent = "Add New Staff";
      document.getElementById("edit-staff-id").value = "";
      document.getElementById("edit-staff-name").value = "";
      document.getElementById("edit-staff-role").value = "Waiter";
      document.getElementById("edit-staff-phone").value = "";
      document.getElementById("edit-staff-email").value = "";
      document.getElementById("edit-staff-password").value = "";
      document.getElementById("edit-staff-status").value = "On Duty";

      const staffModal = document.getElementById("staff-item-modal");
      if (staffModal) staffModal.style.display = "flex";
    });
  }

  const editStaffRole = document.getElementById("edit-staff-role");
  if (editStaffRole) {
    editStaffRole.addEventListener("change", (e) => {
      if (e.target.value === "Kitchen") {
        const staffModal = document.getElementById("staff-item-modal");
        if (staffModal) staffModal.style.display = "none";

        const kitchenModal = document.getElementById("kitchen-shared-modal");
        if (kitchenModal) {
          kitchenModal.style.display = "flex";
          const kitchenRoleSelect = document.getElementById("kitchen-shared-role");
          if (kitchenRoleSelect) kitchenRoleSelect.value = "Kitchen";
        }
      }
    });
  }

  const kitchenSharedRole = document.getElementById("kitchen-shared-role");
  if (kitchenSharedRole) {
    kitchenSharedRole.addEventListener("change", (e) => {
      if (e.target.value === "Waiter") {
        const kitchenModal = document.getElementById("kitchen-shared-modal");
        if (kitchenModal) kitchenModal.style.display = "none";

        const staffModal = document.getElementById("staff-item-modal");
        if (staffModal) {
          staffModal.style.display = "flex";
          const editStaffRoleSelect = document.getElementById("edit-staff-role");
          if (editStaffRoleSelect) editStaffRoleSelect.value = "Waiter";
        }
      }
    });
  }

  const closeStaffItemModal = document.getElementById("close-staff-item-modal");
  if (closeStaffItemModal) {
    closeStaffItemModal.addEventListener("click", () => {
      const staffModal = document.getElementById("staff-item-modal");
      if (staffModal) staffModal.style.display = "none";
    });
  }

  const closeKitchenSharedModal = document.getElementById("close-kitchen-shared-modal");
  if (closeKitchenSharedModal) {
    closeKitchenSharedModal.addEventListener("click", () => {
      const kitchenModal = document.getElementById("kitchen-shared-modal");
      if (kitchenModal) kitchenModal.style.display = "none";
    });
  }

  const staffCancelBtn = document.getElementById("staff-cancel-btn");
  if (staffCancelBtn) {
    staffCancelBtn.addEventListener("click", () => {
      resetStaffEditForm();
      const staffModal = document.getElementById("staff-item-modal");
      if (staffModal) staffModal.style.display = "none";
    });
  }

  const kitchenCancelBtn = document.getElementById("kitchen-cancel-btn");
  if (kitchenCancelBtn) {
    kitchenCancelBtn.addEventListener("click", () => {
      const kitchenModal = document.getElementById("kitchen-shared-modal");
      if (kitchenModal) kitchenModal.style.display = "none";
    });
  }

  const staffEditForm = document.getElementById("staff-edit-form");
  if (staffEditForm) {
    staffEditForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const staffId = document.getElementById("edit-staff-id").value;
      const name = document.getElementById("edit-staff-name").value.trim();
      const role = document.getElementById("edit-staff-role").value;
      const phone = document.getElementById("edit-staff-phone").value.trim();
      const email = document.getElementById("edit-staff-email").value.trim();
      const password = document.getElementById("edit-staff-password").value.trim();
      const status = document.getElementById("edit-staff-status").value;

      if (!name || !phone || !email || !password) {
        alert("Please fill in all fields (including login password).");
        return;
      }

      if (staffId) {
        // Edit existing staff
        const index = state.staff.findIndex(s => s.id === staffId);
        if (index !== -1) {
          state.staff[index] = { ...state.staff[index], name, role, phone, email, status, password };
          alert("Staff member details updated successfully.");
        }
      } else {
        // Add new staff
        const nextNum = state.staff.length + 1;
        const newId = `S-${nextNum < 10 ? '0' + nextNum : nextNum}`;
        state.staff.push({ id: newId, name, role, phone, email, status, password });
        alert("New staff member registered successfully.");
      }

      resetStaffEditForm();
      renderStaffPage();
      const staffModal = document.getElementById("staff-item-modal");
      if (staffModal) staffModal.style.display = "none";
    });
  }

  // Kitchen Login Form Update
  const kitchenLoginForm = document.getElementById("kitchen-login-form");
  if (kitchenLoginForm) {
    kitchenLoginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const pwd = document.getElementById("kitchen-login-password").value.trim();
      if (!pwd) {
        alert("Please enter a valid password for Kitchen login.");
        return;
      }
      state.kitchenLogin.password = pwd;
      alert("Kitchen shared login password updated successfully!");
      renderStaffPage();
      const kitchenModal = document.getElementById("kitchen-shared-modal");
      if (kitchenModal) kitchenModal.style.display = "none";
    });
  }
}

// SIMULATOR SWITCH SCREEN
function switchCustomerScreen(screenId) {
  const screens = ["landing", "menu", "cart", "confirm"];
  screens.forEach(s => {
    const el = document.getElementById(`cust-${s}-view`);
    if (el) {
      el.style.display = s === screenId ? "flex" : "none";
    }
  });
}

// SAAS TABLES DROPDOWNS POPULATE
function populateSaaSTableDropdowns() {
  const simSelect = document.getElementById("cust-select-table-sim");
  if (simSelect) {
    simSelect.innerHTML = "";

    state.tables.forEach(table => {
      const rawNum = table.id.replace("T-", "");
      const simOpt = document.createElement("option");
      simOpt.value = rawNum;
      simOpt.textContent = `Table ${rawNum}`;

      if (rawNum === state.activeCustomerTable) {
        simOpt.selected = true;
      }
      simSelect.appendChild(simOpt);
    });
  }
}

// POPULATE DINING TABLES VIEW SELECTOR DROPDOWN
function populateDiningTablesSelectDropdown() {
  const saasTableSelect = document.getElementById("saas-table-select-page");
  if (saasTableSelect) {
    const currentVal = saasTableSelect.value;
    saasTableSelect.innerHTML = "";
    state.tables.forEach((table, index) => {
      const opt = document.createElement("option");
      opt.value = index + 1;
      opt.textContent = `Table ${table.id}`;
      saasTableSelect.appendChild(opt);
    });

    if (currentVal && parseInt(currentVal, 10) <= state.tables.length) {
      saasTableSelect.value = currentVal;
    } else if (state.tables.length > 0) {
      saasTableSelect.value = 1;
    }

    // Trigger display label and QR code update
    if (state.tables.length > 0) {
      const activeIdx = saasTableSelect.value;
      const selectedIndex = parseInt(activeIdx, 10);
      const displayIndex = selectedIndex < 10 ? `0${selectedIndex}` : selectedIndex;
      const displayLabel = `Table T-${displayIndex}`;

      const labelDisp = document.getElementById("saas-table-label-display");
      if (labelDisp) {
        labelDisp.textContent = displayLabel;
      }
      const nextSibling = labelDisp ? labelDisp.nextElementSibling : null;
      if (nextSibling) {
        nextSibling.textContent = `http://localhost:3000/menu?table=T-${displayIndex}`;
      }
    }
  }
}

// RENDER SETTINGS PANEL STATE
function renderSettingsPanel() {
  saveCurrentTenantData();
  const settings = state.restaurantSettings;

  // Fill inputs
  document.getElementById("settings-name").value = settings.name;
  document.getElementById("settings-tagline").value = settings.tagline || "";
  document.getElementById("settings-currency").value = settings.currency || "₹";
  document.getElementById("settings-tables").value = settings.tablesCount || 5;
  document.getElementById("settings-tax").value = (settings.taxRate * 100 * 2).toFixed(1);
  document.getElementById("settings-service").value = (settings.serviceChargeRate * 100).toFixed(1);

  // Sync Dark Mode state
  const darkToggle = document.getElementById("settings-darkmode");
  if (darkToggle) {
    darkToggle.checked = document.body.classList.contains("dark-theme");
  }

  // // Sync Theme Color dot
  // const currentAccentColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
  // const themeDots = document.querySelectorAll(".theme-dot");
  // themeDots.forEach(dot => {
  //   const dotColor = dot.getAttribute("data-color");
  //   if (dotColor === currentAccentColor) {
  //     themeDots.forEach(d => d.classList.remove("active"));
  //     dot.classList.add("active");
  //   }
  // });

  updateSettingsPreview();
}

// UPDATE SETTINGS SUMMARY PREVIEW CARD
function updateSettingsPreview() {
  const nameVal = document.getElementById("settings-name").value;
  const tablesVal = document.getElementById("settings-tables").value;
  const taxVal = document.getElementById("settings-tax").value;
  const serviceVal = document.getElementById("settings-service").value;
  const currencyVal = document.getElementById("settings-currency").value;

  document.getElementById("preview-store-name").textContent = nameVal || "Serviq";
  document.getElementById("preview-store-tables").textContent = `${tablesVal || 5} Tables`;
  document.getElementById("preview-store-tax").textContent = `${taxVal || 0}% (GST)`;
  document.getElementById("preview-store-service").textContent = `${serviceVal || 0}%`;

  let currLabel = currencyVal;
  if (currencyVal === "₹") currLabel = "₹ (INR)";
  if (currencyVal === "$") currLabel = "$ (USD)";
  if (currencyVal === "€") currLabel = "€ (EUR)";
  if (currencyVal === "£") currLabel = "£ (GBP)";
  if (currencyVal === "AED") currLabel = "AED";
  document.getElementById("preview-store-currency").textContent = currLabel;
}

// ==========================================
// 1. RENDER DASHBOARD OVERVIEW
// ==========================================
function renderDashboardOverview() {
  saveCurrentTenantData();
  // Update Current Date & Time
  const now = new Date();
  const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' };
  document.getElementById("dashboard-date-time").textContent = now.toLocaleDateString('en-US', options);

  // Revenue calculation from Paid orders
  const revenueTotal = state.orders
    .filter(o => o.billingStatus === "paid")
    .reduce((acc, curr) => acc + curr.total, 0);

  // Format revenue cleanly
  document.getElementById("dash-val-revenue").innerHTML = `₹${revenueTotal.toLocaleString('en-IN')}`;

  // Total Orders count
  document.getElementById("dash-val-orders").textContent = state.orders.length;
  document.getElementById("dash-val-in-progress").textContent = `${state.orders.filter(o => o.status === "preparing").length} in progress`;

  // Active Tables
  const occupiedTables = state.tables.filter(t => t.status === "Occupied").length;
  document.getElementById("dash-val-tables").textContent = `${occupiedTables} / ${state.tables.length}`;
  document.getElementById("dash-val-table-avail").textContent = `${state.tables.length - occupiedTables} table available`;

  // Pending Orders
  const pendingCount = state.orders.filter(o => o.status === "new").length;
  document.getElementById("dash-val-pending").textContent = pendingCount;

  // Live orders badge in sidebar
  if (pendingCount > 0) {
    document.getElementById("live-orders-badge").style.display = "inline-block";
  } else {
    document.getElementById("live-orders-badge").style.display = "none";
  }

  // Render Table status widget (right sidebar)
  const tablesContainer = document.getElementById("dash-tables-grid-container");
  tablesContainer.innerHTML = "";
  state.tables.forEach(table => {
    const cell = document.createElement("div");
    cell.className = `dash-table-cell ${table.status.toLowerCase()}`;
    cell.innerHTML = `
      <div class="table-cell-id">${table.id}</div>
      <div class="table-cell-status">${table.status}</div>
    `;
    tablesContainer.appendChild(cell);
  });

  // Render Live Order Feed Table
  const feedBody = document.getElementById("dash-order-feed-tbody");
  feedBody.innerHTML = "";

  // Show last 5 orders
  const lastOrders = [...state.orders].slice(-5);
  lastOrders.forEach(ord => {
    const itemSummary = ord.items.map(i => `${i.name} x ${i.qty}`).join(", ");
    let statusClass = "badge-new";
    if (ord.status === "preparing") statusClass = "badge-preparing";
    if (ord.status === "ready") statusClass = "badge-ready";
    if (ord.status === "done") statusClass = "badge-done";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>#${ord.id}</td>
      <td>Table ${ord.table}</td>
      <td class="items-cell" title="${itemSummary}">${itemSummary}</td>
      <td>${ord.timeAgo}</td>
      <td><span class="badge-custom ${statusClass}">${ord.status}</span></td>
    `;
    feedBody.appendChild(tr);
  });
}

// ==========================================
// 2. RENDER INCOMING ORDERS PIPELINE
// ==========================================
function renderIncomingOrders() {
  saveCurrentTenantData();
  const container = document.getElementById("incoming-orders-list");
  container.innerHTML = "";

  const filter = state.activeIncomingFilter; // All, New, Preparing, Ready, Done
  let filtered = state.orders;

  if (filter !== "All") {
    const targetStatus = filter.toLowerCase();
    filtered = filtered.filter(ord => ord.status === targetStatus);
  }

  if (filtered.length === 0) {
    container.innerHTML = `<div style="text-align: center; padding: 40px; color: black !important;">No orders in ${filter} category.</div>`;
    return;
  }

  // Reverse list to show newest on top
  [...filtered].reverse().forEach(ord => {
    const bar = document.createElement("div");
    bar.className = "incoming-order-bar";

    const itemTagsHtml = ord.items.map(item => `
      <span class="order-item-pill">${item.name} × ${item.qty}</span>
    `).join("");

    let notesHtml = "";
    if (ord.notes) {
      notesHtml = `<div class="order-item-note">📝 Note: ${ord.notes}</div>`;
    }

    let statusClass = "badge-new";
    if (ord.status === "preparing") statusClass = "badge-preparing";
    if (ord.status === "ready") statusClass = "badge-ready";
    if (ord.status === "done") statusClass = "badge-done";

    // Setup action buttons mapping
    let completeBtnText = "Mark Complete";
    let nextStatus = "preparing";
    if (ord.status === "new") {
      completeBtnText = "🍳 Prepare";
      nextStatus = "preparing";
    } else if (ord.status === "preparing") {
      completeBtnText = "🔔 Set Ready";
      nextStatus = "ready";
    } else if (ord.status === "ready") {
      completeBtnText = "🍽️ Serve / Done";
      nextStatus = "done";
    }

    const actionHtml = ord.status === "done"
      ? `<span style="font-size: 13px; color: var(--success); font-weight:600;">✔️ Served</span>`
      : `
        <button class="btn-print" onclick="alert('Sending Receipt #${ord.id} to Kitchen Printer...')">🖨️ Print</button>
        <button class="btn-mark-complete" onclick="changeStatus('${ord.id}', '${nextStatus}')">✔️ ${completeBtnText}</button>
      `;

    bar.innerHTML = `
      <div class="order-bar-header">
        <div style="display:flex; align-items:center; gap: 16px;">
          <span class="order-bar-id">#ORD-${ord.id}</span>
          <span class="order-bar-table">📍 Table ${ord.table}</span>
          <span class="order-bar-time">🕒 ${ord.time} · ${ord.timeAgo}</span>
        </div>
        <span class="badge-custom ${statusClass}">${ord.status}</span>
      </div>
      <div class="order-bar-content">
        <div class="order-bar-details">
          <div style="font-size: 11px; font-weight:700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 6px;">Items</div>
          <div style="display:flex; flex-wrap:wrap; gap: 6px;">
            ${itemTagsHtml}
          </div>
          ${notesHtml}
        </div>
        <div class="order-bar-actions">
          ${actionHtml}
        </div>
      </div>
    `;
    container.appendChild(bar);
  });
}

window.changeStatus = function (orderId, newStatus) {
  const index = state.orders.findIndex(ord => ord.id === orderId);
  if (index !== -1) {
    state.orders[index].status = newStatus;

    // Live update for tracking view if this is the active simulator order
    if (state.activeCustomerOrder && state.activeCustomerOrder.id === orderId) {
      state.activeCustomerOrder.status = newStatus === "done" ? "served" : newStatus;
      renderCustomerTrackingScreen();
    }

    // Check if table occupancy state updates
    if (newStatus === "done") {
      // Check if table has any other non-served orders
      const rawNum = state.orders[index].table;
      const activeOrd = state.orders.filter(o => o.table === rawNum && o.status !== "done");
      if (activeOrd.length === 0) {
        const tableIndex = state.tables.findIndex(t => t.id === `T-${rawNum}`);
        if (tableIndex !== -1) {
          state.tables[tableIndex].status = "Free";
        }
      }
    } else {
      // Set table as occupied
      const rawNum = state.orders[index].table;
      const tableIndex = state.tables.findIndex(t => t.id === `T-${rawNum}`);
      if (tableIndex !== -1) {
        state.tables[tableIndex].status = "Occupied";
      }
    }

    renderIncomingOrders();
    renderDashboardOverview();
    renderBillingPanel();
    renderTablesPage();
  }
};

// ==========================================
// 3. RENDER MENU MANAGEMENT PANEL
// ==========================================
function renderMenuManagement() {
  saveCurrentTenantData();
  // Populate category list side column
  const sidebar = document.getElementById("menu-categories-list");
  sidebar.innerHTML = "";

  // Count items per category
  const categories = ["All Items", "Starters", "Rice Meals", "Tiffin", "Rotis", "Desserts", "Drinks"];
  categories.forEach(cat => {
    let count = 0;
    if (cat === "All Items") {
      count = state.menu.length;
    } else {
      count = state.menu.filter(item => item.category === cat).length;
    }

    const li = document.createElement("li");
    li.className = cat === state.activeMenuCategory ? "active" : "";
    li.setAttribute("data-cat", cat);
    li.innerHTML = `
      <span>${cat}</span>
      <span class="cat-count">${count}</span>
    `;
    sidebar.appendChild(li);
  });

  renderMenuList();
  resetMenuEditForm();
}

function renderMenuList(searchQuery = "") {
  const container = document.getElementById("menu-items-tbody");
  container.innerHTML = "";

  let filtered = state.menu;

  // Category filter
  if (state.activeMenuCategory !== "All Items") {
    filtered = filtered.filter(item => item.category === state.activeMenuCategory);
  }

  // Search filter
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(item =>
      item.name.toLowerCase().includes(q) ||
      item.desc.toLowerCase().includes(q)
    );
  }

  if (filtered.length === 0) {
    container.innerHTML = `<div style="text-align: center; padding: 30px; color: var(--text-muted);">No menu items found.</div>`;
    return;
  }

  filtered.forEach(item => {
    const tr = document.createElement("tr");
    tr.className = "menu-item-row";
    tr.innerHTML = `
      <td style="width: 80px;">
        <div class="menu-image-placeholder-box">
          <img src="${item.image}" alt="${item.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
          <div class="photo-placeholder-fallback">Photo</div>
        </div>
      </td>
      <td>
        <div class="menu-item-title-col">
          <span class="name">${item.name}</span>
          <span class="cat-badge">${item.category}</span>
        </div>
      </td>
      <td style="font-weight: 700;">₹${item.price}</td>
      <td>
        <div class="avail-switch-container">
          <label class="switch">
            <input type="checkbox" ${item.available ? "checked" : ""} onchange="toggleItemAvailability('${item.id}', this.checked)">
            <span class="slider"></span>
          </label>
          <span class="avail-status-label">${item.available ? "Available" : "Unavailable"}</span>
        </div>
      </td>
      <td style="width: 100px;">
        <div style="display:flex; gap: 8px;">
          <button class="menu-action-btn edit-btn" onclick="populateEditItemForm('${item.id}')">✏️ Edit</button>
          <button class="menu-action-btn delete-btn" onclick="deleteMenuItem('${item.id}')" title="Delete Item">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display: block;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </td>
    `;
    container.appendChild(tr);
  });
}

window.toggleItemAvailability = function (itemId, isChecked) {
  const index = state.menu.findIndex(item => item.id === itemId);
  if (index !== -1) {
    state.menu[index].available = isChecked;
    renderMenuList(document.getElementById("menu-search-input").value.trim());
    renderCustomerMenu();
  }
};

window.deleteMenuItem = function (itemId) {
  if (confirm("Are you sure you want to delete this food item?")) {
    state.menu = state.menu.filter(item => item.id !== itemId);
    renderMenuManagement();
    renderCustomerMenu();
  }
};

window.populateEditItemForm = function (itemId) {
  const item = state.menu.find(m => m.id === itemId);
  if (item) {
    state.editingMenuItemId = item.id;
    document.getElementById("menu-form-title").textContent = "Edit Item";
    document.getElementById("edit-item-id").value = item.id;
    document.getElementById("edit-input-name").value = item.name;
    document.getElementById("edit-input-desc").value = item.desc;
    document.getElementById("edit-input-price").value = item.price;
    document.getElementById("edit-input-category").value = item.category;
    document.getElementById("edit-image-placeholder-label").textContent = "Image Loaded Successfully";
    const modal = document.getElementById("menu-item-modal");
    if (modal) modal.style.display = "flex";
  }
};

function resetMenuEditForm() {
  state.editingMenuItemId = null;
  document.getElementById("menu-form-title").textContent = "Add New Item";
  document.getElementById("menu-edit-form").reset();
  document.getElementById("edit-item-id").value = "";
  document.getElementById("edit-image-placeholder-label").textContent = "No Image Selected";
}

// ==========================================
// 4. RENDER BILLING PANEL
// ==========================================
function renderBillingPanel() {
  saveCurrentTenantData();
  const listContainer = document.getElementById("billing-tables-list");
  listContainer.innerHTML = "";

  state.billingData.forEach(item => {
    const row = document.createElement("div");
    row.className = `table-selection-row ${item.table === state.activeBillingTable ? "active" : ""}`;
    row.setAttribute("data-table", item.table);

    let statusClass = "billing-badge-unpaid";
    if (item.status === "Paid") statusClass = "billing-badge-paid";
    if (item.status === "Partial") statusClass = "billing-badge-partial";

    row.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:4px;">
        <span class="table-selection-title">${item.table}</span>
        <span class="table-selection-subtitle">${item.orders} orders · ₹${item.total}</span>
      </div>
      <span class="billing-badge ${statusClass}">${item.status}</span>
    `;
    listContainer.appendChild(row);
  });

  renderBillingSummary();
}

function renderBillingSummary() {
  const tableId = state.activeBillingTable; // e.g. Table 05
  const billInfo = state.billingData.find(item => item.table === tableId);

  if (!billInfo) return;

  document.getElementById("bill-title-header").textContent = `${tableId} — Bill Summary`;
  document.getElementById("bill-order-count-sub").textContent = `${billInfo.orders} orders · Last updated at 1:28 PM`;

  // Filter items matching the table orders
  const rawNum = tableId.replace("Table ", "");

  // Set default mockup items if no custom order exists yet
  let displayItems = [];
  if (tableId === "Table 05") {
    displayItems = [
      { name: "Paneer Tikka", qty: 2, price: 180 },
      { name: "Chicken Biryani", qty: 1, price: 320 },
      { name: "Butter Naan", qty: 3, price: 40 },
      { name: "Masala Chai", qty: 2, price: 40 }
    ];
  } else {
    // Find active order for this table
    const tableOrder = state.orders.find(o => parseInt(o.table) === parseInt(rawNum));
    if (tableOrder) {
      displayItems = tableOrder.items;
    } else {
      displayItems = [
        { name: "Standard Meals", qty: 1, price: billInfo.total }
      ];
    }
  }

  // Populate table rows
  const tbody = document.getElementById("billing-summary-items-tbody");
  tbody.innerHTML = "";

  let subtotal = 0;
  displayItems.forEach(item => {
    const cost = item.qty * item.price;
    subtotal += cost;

    const tr = document.createElement("tr");
    const currency = state.restaurantSettings.currency || "₹";
    tr.innerHTML = `
      <td>${item.name}</td>
      <td>${item.qty}</td>
      <td>${currency}${item.price}</td>
      <td style="font-weight:600; text-align:right;">${currency}${cost}</td>
    `;
    tbody.appendChild(tr);
  });

  const taxRate = state.restaurantSettings.taxRate;
  const serviceRate = state.restaurantSettings.serviceChargeRate;
  const currency = state.restaurantSettings.currency || "₹";

  const cgst = parseFloat((subtotal * taxRate).toFixed(2));
  const sgst = parseFloat((subtotal * taxRate).toFixed(2));
  const serviceCharge = parseFloat((subtotal * serviceRate).toFixed(2));
  const grandTotal = subtotal + cgst + sgst + serviceCharge;

  const breakdownContainer = document.getElementById("billing-breakdown-container");
  if (breakdownContainer) {
    let serviceChargeHtml = "";
    if (serviceCharge > 0) {
      serviceChargeHtml = `
        <div class="breakdown-row" style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:13px; color:var(--text-muted);">
          <span>Service Charge (${(serviceRate * 100).toFixed(1)}%)</span>
          <span style="font-weight:500; color:var(--text-main);">${currency}${serviceCharge}</span>
        </div>
      `;
    }

    breakdownContainer.innerHTML = `
      <div class="breakdown-row" style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:13px; color:var(--text-muted);">
        <span>Subtotal</span>
        <span style="font-weight:500; color:var(--text-main);">${currency}${subtotal}</span>
      </div>
      <div class="breakdown-row" style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:13px; color:var(--text-muted);">
        <span>CGST (${(taxRate * 100).toFixed(1)}%)</span>
        <span style="font-weight:500; color:var(--text-main);">${currency}${cgst}</span>
      </div>
      <div class="breakdown-row" style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:13px; color:var(--text-muted);">
        <span>SGST (${(taxRate * 100).toFixed(1)}%)</span>
        <span style="font-weight:500; color:var(--text-main);">${currency}${sgst}</span>
      </div>
      ${serviceChargeHtml}
      <div class="breakdown-row total-row" style="display:flex; justify-content:space-between; border-top:1px solid var(--border); padding-top:10px; margin-top:10px; font-weight:700; font-size:15px; color:var(--text-main);">
        <span>Total</span>
        <span>${currency}${grandTotal}</span>
      </div>
    `;
  }

  // Hide paid status if paid already
  const payBtn = document.getElementById("bill-pay-btn");
  if (billInfo.status === "Paid") {
    payBtn.style.display = "none";
  } else {
    payBtn.style.display = "block";
  }
}

// ==========================================
// CUSTOMER SIDEBAR VIEWS ENGINE
// ==========================================
window.inlineCartChange = function (itemId, delta, event) {
  if (event) event.stopPropagation();
  const item = state.menu.find(m => m.id === itemId);
  if (!item) return;

  const cartIndex = state.cart.findIndex(c => c.id === itemId);
  if (cartIndex !== -1) {
    state.cart[cartIndex].quantity += delta;
    if (state.cart[cartIndex].quantity <= 0) {
      state.cart.splice(cartIndex, 1);
    }
  } else if (delta > 0) {
    state.cart.push({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      notes: ""
    });
  }
  updateCustomerCartBarSticky();
  renderCustomerMenu();
  renderCustomerCart();

  // If we are currently viewing the cart screen, force a re-render of the cart
  const cartView = document.getElementById("cust-cart-view");
  if (cartView && cartView.style.display === "flex") {
    renderCustomerCart();
  }
};

function renderCustomerMenu(activeCategory = null, searchQuery = "") {
  const listContainer = document.getElementById("cust-menu-list-container");
  const pillsContainer = document.getElementById("cust-menu-categories-pills");

  const categories = ["All", "Rice Meals", "Tiffin", "Rotis", "Desserts", "Drinks"];
  const activePill = pillsContainer.querySelector(".cust-cat-pill.active");
  const currentCategory = activeCategory || (activePill ? activePill.getAttribute("data-cat") : "All");

  pillsContainer.innerHTML = "";
  categories.forEach(cat => {
    const pill = document.createElement("button");
    pill.className = `cust-cat-pill ${cat === currentCategory ? "active" : ""}`;
    pill.textContent = cat;
    pill.setAttribute("data-cat", cat);
    pill.addEventListener("click", (e) => {
      e.stopPropagation();
      renderCustomerMenu(cat);
    });
    pillsContainer.appendChild(pill);
  });

  let products = state.menu.filter(item => item.available === true);
  if (currentCategory !== "All") {
    products = products.filter(item => item.category === currentCategory);
  }

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    products = products.filter(item =>
      item.name.toLowerCase().includes(q) ||
      item.desc.toLowerCase().includes(q)
    );
  }

  // Update dynamic category title strip
  const strip = document.getElementById("cust-category-title-strip");
  if (strip) {
    strip.textContent = `${currentCategory} - ${products.length} item${products.length === 1 ? '' : 's'}`;
  }

  listContainer.innerHTML = "";
  if (products.length === 0) {
    listContainer.innerHTML = `<div style="text-align: center; padding: 30px; color: var(--text-muted); font-size: 13px;">No dishes available.</div>`;
    return;
  }

  products.forEach(item => {
    const card = document.createElement("div");
    card.className = "cust-item-card";
    card.addEventListener("click", () => openCustomerItemModal(item.id));

    const cartItem = state.cart.find(c => c.id === item.id);
    let qtyControlHtml = "";
    if (cartItem) {
      qtyControlHtml = `
        <div class="cust-card-qty-control" onclick="event.stopPropagation();">
          <button class="cust-card-qty-btn" onclick="inlineCartChange('${item.id}', -1, event)">-</button>
          <span class="cust-card-qty-val">${cartItem.quantity}</span>
          <button class="cust-card-qty-btn" onclick="inlineCartChange('${item.id}', 1, event)">+</button>
        </div>
      `;
    } else {
      qtyControlHtml = `
        <button class="cust-card-add-btn" onclick="inlineCartChange('${item.id}', 1, event)">ADD</button>
      `;
    }

    card.innerHTML = `
      <div class="cust-item-details">
        <div class="card-top-badges">
          <span class="${item.veg ? 'veg-icon' : 'non-veg-icon'}"></span>
          ${item.bestseller ? '<span class="bestseller-badge">Bestseller</span>' : ''}
        </div>
        <h4 class="cust-item-name">${item.name}</h4>
        <div class="cust-item-desc">${item.desc}</div>
        <div class="cust-item-price">₹${item.price}</div>
        ${qtyControlHtml}
      </div>
      <div class="cust-item-img-wrapper">
        <img src="${item.image}" alt="${item.name}" class="cust-item-img" onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60';">
      </div>
    `;
    listContainer.appendChild(card);
  });

  updateCustomerCartBarSticky();
}

let modalItemTemp = null;
function openCustomerItemModal(itemId) {
  const item = state.menu.find(m => m.id === itemId);
  if (!item) return;

  modalItemTemp = item;
  document.getElementById("cust-modal-item-name").textContent = item.name;
  document.getElementById("cust-modal-item-desc").textContent = item.desc;
  document.getElementById("cust-modal-item-price").textContent = `₹${item.price}`;

  const modalImg = document.getElementById("cust-modal-item-img");
  modalImg.src = item.image;
  modalImg.style.display = "block";

  document.getElementById("qty-value").textContent = "1";
  document.getElementById("cust-modal-notes").value = "";
  document.getElementById("cust-modal-total-price").textContent = `₹${item.price}`;

  document.getElementById("cust-item-modal").style.display = "flex";
}

function updateCustomerItemModalPrice(qty) {
  if (modalItemTemp) {
    const cost = qty * modalItemTemp.price;
    document.getElementById("cust-modal-total-price").textContent = `₹${cost}`;
  }
}

function updateCustomerCartBarSticky() {
  const stickyBar = document.getElementById("cust-cart-bar-sticky");
  const totalCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Update header cart badge
  const headerCartBadge = document.getElementById("cust-cart-badge-count");
  if (headerCartBadge) {
    headerCartBadge.textContent = totalCount;
  }

  if (state.cart.length === 0) {
    stickyBar.style.display = "none";
    return;
  }

  stickyBar.style.display = "block";

  const qtyCircle = document.getElementById("cust-cart-quantity-circle");
  if (qtyCircle) {
    qtyCircle.textContent = totalCount;
  }

  const subtotalEl = document.getElementById("cust-cart-subtotal");
  if (subtotalEl) {
    subtotalEl.textContent = `₹${subtotal}`;
  }
}

function renderCustomerCart() {
  const container = document.getElementById("cust-cart-items-container");
  container.innerHTML = "";

  if (state.cart.length === 0) {
    container.innerHTML = `<div style="text-align: center; padding: 40px 0; color: var(--text-muted);">Your cart is empty. Add dishes from the menu to place an order.</div>`;
    document.getElementById("cust-summary-subtotal").textContent = `₹0.00`;
    document.getElementById("cust-summary-tax").textContent = `₹0.00`;
    document.getElementById("cust-summary-charge").textContent = `₹0.00`;
    document.getElementById("cust-summary-total").textContent = `₹0.00`;
    return;
  }

  let subtotal = 0;

  state.cart.forEach((item, index) => {
    const itemCost = item.price * item.quantity;
    subtotal += itemCost;

    const row = document.createElement("div");
    row.className = "cust-cart-item";

    let notesBadgeHtml = "";
    if (item.notes) {
      notesBadgeHtml = `<div style="font-size: 10px; color: var(--warning); margin-top: 2px;">📝 ${item.notes}</div>`;
    }

    row.innerHTML = `
      <div>
        <div style="font-weight: 600; font-size:13px;">${item.name}</div>
        <div style="font-size:11px; color:var(--text-muted);">₹${item.price} each</div>
        ${notesBadgeHtml}
      </div>
      <div style="display:flex; align-items:center; gap: 10px;">
        <div style="display:flex; align-items:center; gap: 6px; background-color: var(--bg-tertiary); padding: 2px 6px; border-radius: 12px;">
          <button style="border:none; background:transparent; font-weight:700; cursor:pointer;" onclick="changeCartQty(${index}, -1)">-</button>
          <span style="font-size:12px; font-weight:700; min-width: 14px; text-align:center;">${item.quantity}</span>
          <button style="border:none; background:transparent; font-weight:700; cursor:pointer;" onclick="changeCartQty(${index}, 1)">+</button>
        </div>
        <span style="font-weight:700; font-size:13px; min-width:55px; text-align:right;">₹${itemCost}</span>
      </div>
    `;
    container.appendChild(row);
  });

  const tax = parseFloat((subtotal * 0.05).toFixed(2)); // 5% GST
  const total = parseFloat((subtotal + tax).toFixed(2));

  document.getElementById("cust-summary-subtotal").textContent = `₹${subtotal}`;
  document.getElementById("cust-summary-tax").textContent = `₹${tax}`;
  document.getElementById("cust-summary-charge").textContent = `₹0.00`;
  document.getElementById("cust-summary-total").textContent = `₹${total}`;
}

window.changeCartQty = function (index, delta) {
  if (index >= 0 && index < state.cart.length) {
    state.cart[index].quantity += delta;
    if (state.cart[index].quantity <= 0) {
      state.cart.splice(index, 1);
    }
    renderCustomerCart();
    updateCustomerCartBarSticky();
  }
};

function renderCustomerTrackingScreen() {
  const ord = state.activeCustomerOrder;
  if (!ord) return;

  document.getElementById("cust-confirm-order-id").textContent = `Order ID: #${ord.id}`;
  document.getElementById("cust-confirm-table-tag").textContent = `Table ${ord.table}`;

  const steps = ["pending", "preparing", "ready", "delivered"];
  steps.forEach(s => {
    document.getElementById(`step-${s}`).className = "track-step";
  });

  const activeStatus = ord.status;

  if (activeStatus === "new") {
    document.getElementById("step-pending").classList.add("active");
    document.getElementById("cust-est-time").textContent = "15 - 20 mins";
  } else if (activeStatus === "preparing") {
    document.getElementById("step-pending").classList.add("active", "completed");
    document.getElementById("step-preparing").classList.add("active");
    document.getElementById("cust-est-time").textContent = "8 - 10 mins";
  } else if (activeStatus === "ready") {
    document.getElementById("step-pending").classList.add("active", "completed");
    document.getElementById("step-preparing").classList.add("active", "completed");
    document.getElementById("step-ready").classList.add("active");
    document.getElementById("cust-est-time").textContent = "1 - 2 mins";
  } else if (activeStatus === "done") {
    document.getElementById("step-pending").classList.add("active", "completed");
    document.getElementById("step-preparing").classList.add("active", "completed");
    document.getElementById("step-ready").classList.add("active", "completed");
    document.getElementById("step-delivered").classList.add("active", "completed");
    document.getElementById("cust-est-time").textContent = "Food Served!";
  }
}

window.updateSimulatorTableLabels = function () {
  const tableVal = state.activeCustomerTable;
  const labelText = `Table T-${tableVal}`;

  const custTableLabel = document.getElementById("cust-table-label");
  if (custTableLabel) custTableLabel.textContent = `Table ${tableVal}`;

  const custMenuTableLabelTop = document.getElementById("cust-menu-table-label-top");
  if (custMenuTableLabelTop) custMenuTableLabelTop.textContent = labelText;

  const custBrandSubtitle = document.getElementById("cust-brand-subtitle");
  if (custBrandSubtitle) custBrandSubtitle.textContent = `${labelText} · Order anytime`;

  const custConfirmTableTag = document.getElementById("cust-confirm-table-tag");
  if (custConfirmTableTag) custConfirmTableTag.textContent = `Table ${tableVal}`;
};

// ==========================================
// TABLES MANAGEMENT PAGE RENDERING & LOGIC
// ==========================================

function generateFancyQR(tableId, color = "#ff7a00", showLogo = true) {
  const logoDisplay = showLogo
    ? `<rect x="38" y="38" width="24" height="24" fill="white" rx="4" />
       <!-- Stylistic Fork and Spoon Fork representation in SVG -->
       <path d="M46 43 L46 51 M48 43 L48 51 M50 43 L50 51 M44 51 H52" stroke="${color}" stroke-width="2" stroke-linecap="round"/>
       <circle cx="50" cy="51" r="2" fill="${color}"/>
       <path d="M53 43 C53 47, 55 47, 55 53 L55 57" stroke="${color}" stroke-width="1.5" fill="none"/>`
    : '';

  return `
    <svg width="100%" height="100%" viewBox="0 0 100 100" style="display:block;">
      <!-- Corner Finder Top-Left -->
      <rect x="0" y="0" width="30" height="30" fill="${color}" rx="3" />
      <rect x="5" y="5" width="20" height="20" fill="white" rx="1.5" />
      <rect x="10" y="10" width="10" height="10" fill="${color}" rx="1" />
      
      <!-- Corner Finder Top-Right -->
      <rect x="70" y="0" width="30" height="30" fill="${color}" rx="3" />
      <rect x="75" y="5" width="20" height="20" fill="white" rx="1.5" />
      <rect x="80" y="10" width="10" height="10" fill="${color}" rx="1" />
      
      <!-- Corner Finder Bottom-Left -->
      <rect x="0" y="70" width="30" height="30" fill="${color}" rx="3" />
      <rect x="5" y="75" width="20" height="20" fill="white" rx="1.5" />
      <rect x="10" y="80" width="10" height="10" fill="${color}" rx="1" />
      
      <!-- Alignment Pattern -->
      <rect x="74" y="74" width="12" height="12" fill="${color}" rx="2" />
      <rect x="77" y="77" width="6" height="6" fill="white" rx="1" />
      <rect x="79" y="79" width="2" height="2" fill="${color}" rx="0.5" />
      
      <!-- Styled Matrix Dot Patterns -->
      <rect x="36" y="4" width="6" height="6" fill="${color}" rx="1.5" />
      <rect x="46" y="0" width="6" height="6" fill="${color}" rx="1.5" />
      <rect x="56" y="6" width="6" height="6" fill="${color}" rx="1.5" />
      <rect x="36" y="14" width="6" height="6" fill="${color}" rx="1.5" />
      <rect x="46" y="18" width="6" height="6" fill="${color}" rx="1.5" />
      <rect x="56" y="12" width="6" height="6" fill="${color}" rx="1.5" />
      <rect x="36" y="24" width="6" height="6" fill="${color}" rx="1.5" />
      <rect x="46" y="28" width="6" height="6" fill="${color}" rx="1.5" />
      <rect x="56" y="22" width="6" height="6" fill="${color}" rx="1.5" />

      <rect x="4" y="36" width="6" height="6" fill="${color}" rx="1.5" />
      <rect x="14" y="36" width="6" height="6" fill="${color}" rx="1.5" />
      <rect x="24" y="36" width="6" height="6" fill="${color}" rx="1.5" />
      <rect x="0" y="46" width="6" height="6" fill="${color}" rx="1.5" />
      <rect x="18" y="48" width="6" height="6" fill="${color}" rx="1.5" />
      <rect x="28" y="46" width="6" height="6" fill="${color}" rx="1.5" />
      <rect x="6" y="56" width="6" height="6" fill="${color}" rx="1.5" />
      <rect x="14" y="58" width="6" height="6" fill="${color}" rx="1.5" />
      <rect x="24" y="56" width="6" height="6" fill="${color}" rx="1.5" />

      <rect x="36" y="72" width="6" height="6" fill="${color}" rx="1.5" />
      <rect x="46" y="78" width="6" height="6" fill="${color}" rx="1.5" />
      <rect x="56" y="74" width="6" height="6" fill="${color}" rx="1.5" />
      <rect x="38" y="86" width="6" height="6" fill="${color}" rx="1.5" />
      <rect x="48" y="88" width="6" height="6" fill="${color}" rx="1.5" />
      <rect x="58" y="84" width="6" height="6" fill="${color}" rx="1.5" />
      
      <rect x="74" y="36" width="6" height="6" fill="${color}" rx="1.5" />
      <rect x="88" y="36" width="6" height="6" fill="${color}" rx="1.5" />
      <rect x="72" y="46" width="6" height="6" fill="${color}" rx="1.5" />
      <rect x="82" y="44" width="6" height="6" fill="${color}" rx="1.5" />
      <rect x="92" y="48" width="6" height="6" fill="${color}" rx="1.5" />
      <rect x="76" y="56" width="6" height="6" fill="${color}" rx="1.5" />
      <rect x="86" y="58" width="6" height="6" fill="${color}" rx="1.5" />

      <rect x="90" y="74" width="6" height="6" fill="${color}" rx="1.5" />
      <rect x="88" y="86" width="6" height="6" fill="${color}" rx="1.5" />
      <rect x="78" y="90" width="6" height="6" fill="${color}" rx="1.5" />
      
      ${logoDisplay}
    </svg>
  `;
}

function renderTablesPage() {
  saveCurrentTenantData();
  const gridContainer = document.getElementById("dining-tables-grid-container");
  if (!gridContainer) return;

  // Calculate Metrics
  const totalTables = state.tables.length;
  const occupiedCount = state.tables.filter(t => t.status === "Occupied").length;
  const totalSeats = state.tables.reduce((sum, t) => sum + (t.seats || 4), 0);
  const freeCount = totalTables - occupiedCount;

  // Set Metric values
  document.getElementById("metric-total-tables").textContent = totalTables;
  document.getElementById("metric-occupied-tables").textContent = occupiedCount;
  document.getElementById("metric-seating-capacity").textContent = totalSeats;
  document.getElementById("metric-free-tables").textContent = freeCount;

  // Render Grid Cards
  gridContainer.innerHTML = "";

  state.tables.forEach(table => {
    const card = document.createElement("div");
    const isSelected = table.id === state.selectedTableId;
    card.className = `dining-table-card ${isSelected ? 'active' : ''} ${table.status.toLowerCase()}`;
    card.setAttribute("data-id", table.id);

    let orderSummaryText = "No active orders";
    let billAmount = "";

    const tableNumRaw = table.id.replace("T-", "");
    const tableOrder = state.orders.find(o => parseInt(o.table) === parseInt(tableNumRaw) && o.status !== "done");
    if (tableOrder) {
      orderSummaryText = `${tableOrder.items.length} items · ${tableOrder.timeAgo}`;
      billAmount = `₹${tableOrder.total}`;
    } else {
      const billData = state.billingData.find(b => b.table === `Table ${tableNumRaw}`);
      if (billData && billData.status !== "Paid") {
        orderSummaryText = `${billData.orders} orders pending payment`;
        billAmount = `₹${billData.total}`;
      }
    }

    let statusText = "🟢 Available";
    if (table.status === "Occupied") {
      statusText = "🟠 Seated / Ordering";
      const billData = state.billingData.find(b => b.table === `Table ${tableNumRaw}`);
      if (billData && billData.status === "Unpaid" && !tableOrder) {
        statusText = "🔴 Bill Pending";
      }
    }

    card.innerHTML = `
      <div class="card-header-row">
        <span class="table-name-label">Table ${table.id}</span>
        <span class="seats-label">👥 ${table.seats || 4} Seats</span>
      </div>
      <div class="table-card-status">${statusText}</div>
      <div class="table-card-summary">${orderSummaryText}</div>
      ${billAmount ? `<div class="table-card-bill-tag">${billAmount}</div>` : ''}
      
      <!-- Mini QR Preview -->
      <div class="mini-qr-preview-box">
        ${generateFancyQR(table.id, state.qrCustomizer.color, false)}
      </div>

      <div class="table-card-actions">
        <button class="table-action-btn view-btn" onclick="event.stopPropagation(); selectActiveTableQR('${table.id}')">🔍 View QR</button>
        ${table.status === "Occupied" ? `<button class="table-action-btn clear-btn" onclick="event.stopPropagation(); clearTableStatus('${table.id}')">🧼 Clear</button>` : ''}
        <button class="table-action-btn delete-btn" onclick="event.stopPropagation(); deleteDiningTable('${table.id}')" title="Delete Table">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display: block;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </div>
    `;

    card.addEventListener("click", () => {
      selectActiveTableQR(table.id);
    });

    gridContainer.appendChild(card);
  });

  renderQRStickerDetails();
}

function selectActiveTableQR(tableId) {
  state.selectedTableId = tableId;

  document.querySelectorAll(".dining-table-card").forEach(card => {
    if (card.getAttribute("data-id") === tableId) {
      card.classList.add("active");
    } else {
      card.classList.remove("active");
    }
  });

  const title = document.getElementById("customizer-panel-title");
  if (title) title.textContent = `Table ${tableId} Details`;

  renderQRStickerDetails();
}

function renderQRStickerDetails() {
  const tableId = state.selectedTableId;
  const table = state.tables.find(t => t.id === tableId);
  if (!table) return;

  const tableNumRaw = table.id.replace("T-", "");

  document.getElementById("sticker-store-name").textContent = state.restaurantSettings.name;
  document.getElementById("sticker-table-label-display").textContent = `Table ${table.id}`;

  const urlDisplay = document.getElementById("sticker-url-display");
  if (urlDisplay) {
    urlDisplay.textContent = `http://localhost:3000/menu?table=T-${tableNumRaw}`;
  }

  const qrDisplay = document.getElementById("fancy-qr-display");
  if (qrDisplay) {
    qrDisplay.innerHTML = generateFancyQR(tableId, state.qrCustomizer.color, state.qrCustomizer.showLogo);
  }

  const seatsInput = document.getElementById("table-seats-edit-input");
  if (seatsInput) {
    seatsInput.value = table.seats || 4;
  }

  const logoCheckbox = document.getElementById("qr-toggle-logo");
  if (logoCheckbox) {
    logoCheckbox.checked = state.qrCustomizer.showLogo;
  }

  document.querySelectorAll(".qr-color-dot").forEach(dot => {
    if (dot.getAttribute("data-color") === state.qrCustomizer.color) {
      dot.classList.add("active");
    } else {
      dot.classList.remove("active");
    }
  });
}

function addDiningTable(tableId, seats) {
  let cleanId = tableId.trim().toUpperCase();
  if (!cleanId.startsWith("T-")) {
    cleanId = "T-" + cleanId;
  }

  if (state.tables.some(t => t.id === cleanId)) {
    alert(`Table ${cleanId} already exists!`);
    return false;
  }

  state.tables.push({
    id: cleanId,
    status: "Free",
    seats: parseInt(seats, 10) || 4
  });

  state.tables.sort((a, b) => a.id.localeCompare(b.id));
  state.restaurantSettings.tablesCount = state.tables.length;
  state.selectedTableId = cleanId;

  populateSaaSTableDropdowns();
  populateDiningTablesSelectDropdown();

  renderTablesPage();
  renderDashboardOverview();
  renderBillingPanel();
  renderSettingsPanel();

  alert(`Table ${cleanId} created successfully.`);
  return true;
}

function deleteDiningTable(tableId) {
  const table = state.tables.find(t => t.id === tableId);
  if (!table) return;

  if (table.status === "Occupied") {
    if (!confirm(`Warning: Table ${tableId} is currently Occupied. Are you sure you want to delete it?`)) {
      return;
    }
  } else {
    if (!confirm(`Are you sure you want to delete Table ${tableId}?`)) {
      return;
    }
  }

  state.tables = state.tables.filter(t => t.id !== tableId);
  state.restaurantSettings.tablesCount = state.tables.length;

  if (state.selectedTableId === tableId && state.tables.length > 0) {
    state.selectedTableId = state.tables[0].id;
  }

  populateSaaSTableDropdowns();
  populateDiningTablesSelectDropdown();

  renderTablesPage();
  renderDashboardOverview();
  renderBillingPanel();
  renderSettingsPanel();

  alert(`Table ${tableId} deleted successfully.`);
}

function clearTableStatus(tableId) {
  const tableIndex = state.tables.findIndex(t => t.id === tableId);
  if (tableIndex !== -1) {
    state.tables[tableIndex].status = "Free";

    const tableNumRaw = tableId.replace("T-", "");

    state.orders.forEach((ord, idx) => {
      if (parseInt(ord.table) === parseInt(tableNumRaw)) {
        state.orders[idx].billingStatus = "paid";
        state.orders[idx].status = "done";
      }
    });

    const bIndex = state.billingData.findIndex(b => b.table === `Table ${tableNumRaw}`);
    if (bIndex !== -1) {
      state.billingData[bIndex].status = "Paid";
    }

    renderTablesPage();
    renderDashboardOverview();
    renderIncomingOrders();
    renderBillingPanel();
    alert(`Table ${tableId} cleared and marked available.`);
  }
}

function simulateCustomerTable(tableId) {
  const tableNumRaw = tableId.replace("T-", "");
  state.activeCustomerTable = tableNumRaw;

  const simSelect = document.getElementById("cust-select-table-sim");
  if (simSelect) {
    simSelect.value = tableNumRaw;
  }

  updateSimulatorTableLabels();
  switchCustomerScreen("landing");

  const simulator = document.getElementById("simulator-panel");
  if (simulator && simulator.classList.contains("collapsed")) {
    simulator.classList.remove("collapsed");
    renderCustomerMenu();
  }

  alert(`Simulator loaded for Table T-${tableNumRaw}!`);
}

// ==========================================
// STAFF MANAGEMENT PANEL RENDERING & LOGIC
// ==========================================

function renderStaffPage() {
  saveCurrentTenantData();
  const tbody = document.getElementById("staff-items-tbody");
  if (!tbody) return;

  // Calculate Metrics
  const totalStaff = state.staff.length;
  const activeStaff = state.staff.filter(s => s.status === "On Duty").length;
  const kitchenStaff = state.staff.filter(s => s.role === "Kitchen").length;
  const waiterStaff = state.staff.filter(s => s.role === "Waiter").length;

  document.getElementById("metric-total-staff").textContent = totalStaff;
  document.getElementById("metric-active-staff").textContent = activeStaff;
  document.getElementById("metric-chef-staff").textContent = kitchenStaff;
  document.getElementById("metric-waiter-staff").textContent = waiterStaff;

  // Sync Kitchen Shared Login password value in the form input
  const kitchenPwdInput = document.getElementById("kitchen-login-password");
  if (kitchenPwdInput) {
    kitchenPwdInput.value = state.kitchenLogin.password;
  }

  tbody.innerHTML = "";

  state.staff.forEach(member => {
    const tr = document.createElement("tr");
    tr.className = "menu-item-row"; // Reuses hovering and styling from menu table rows

    const statusBadge = member.status === "On Duty"
      ? `<span class="badge-custom" style="background-color: var(--success-light); color: var(--success); border: 1px solid rgba(46, 189, 89, 0.2);">🟢 On Duty</span>`
      : `<span class="badge-custom" style="background-color: var(--bg-tertiary); color: var(--text-muted); border: 1px solid var(--border);">⚪ Off Duty</span>`;

    tr.innerHTML = `
      <td style="padding: 14px; font-weight: 600; font-size: 13px;">${member.id}</td>
      <td style="padding: 14px;">
        <div style="font-weight: 700; font-size: 13px;">${member.name}</div>
      </td>
      <td style="padding: 14px; font-size: 13px;"><span class="cat-badge" style="background: var(--primary-light); color: var(--primary); padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;">${member.role}</span></td>
      <td style="padding: 14px; font-size: 13px; font-weight: 500;">📞 ${member.phone}</td>
      <td style="padding: 14px; font-size: 13px;">
        <div style="font-weight: 500; font-family: monospace;">✉️ ${member.email}</div>
        <div style="font-size: 11px; color: var(--text-muted); font-family: monospace;">🔑 Pwd: <strong>${member.password || 'N/A'}</strong></div>
      </td>
      <td style="padding: 14px;">${statusBadge}</td>
      <td style="padding: 14px; width: 120px; text-align: right;">
        <div style="display:flex; gap: 8px; justify-content: flex-end;">
          <button class="menu-action-btn edit-btn" onclick="event.stopPropagation(); populateEditStaffForm('${member.id}')">✏️ Edit</button>
          <button class="menu-action-btn delete-btn" onclick="event.stopPropagation(); deleteStaffMember('${member.id}')" title="Delete Staff">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display: block;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

window.populateEditStaffForm = function (staffId) {
  const member = state.staff.find(s => s.id === staffId);
  if (member) {
    document.getElementById("staff-form-title").textContent = "Edit Staff Details";
    document.getElementById("edit-staff-id").value = member.id;
    document.getElementById("edit-staff-name").value = member.name;
    document.getElementById("edit-staff-role").value = member.role;
    document.getElementById("edit-staff-phone").value = member.phone;
    document.getElementById("edit-staff-email").value = member.email;
    document.getElementById("edit-staff-password").value = member.password || "";
    document.getElementById("edit-staff-status").value = member.status;
    const kitchenCard = document.getElementById("kitchen-shared-card");
    if (kitchenCard) {
      kitchenCard.style.display = member.role === "Kitchen" ? "block" : "none";
    }
  }
};

window.deleteStaffMember = function (staffId) {
  if (confirm("Are you sure you want to delete this staff member?")) {
    state.staff = state.staff.filter(s => s.id !== staffId);
    renderStaffPage();
    resetStaffEditForm();
  }
};

function resetStaffEditForm() {
  document.getElementById("staff-form-title").textContent = "Add New Staff";
  document.getElementById("staff-edit-form").reset();
  document.getElementById("edit-staff-id").value = "";
  document.getElementById("edit-staff-password").value = "";
  const kitchenCard = document.getElementById("kitchen-shared-card");
  if (kitchenCard) kitchenCard.style.display = "none";
}

// ==========================================================================
// SaaS SUPER ADMIN VIEW RENDERING & CONTROLLER LOGIC
// ==========================================================================

function initSaaSApp() {
  renderSaaSOverview();
  
  // Clean up and bind superadmin sidebar tab items
  document.querySelectorAll(".superadmin-sidebar-item").forEach(item => {
    // Clone to remove duplicate event listeners
    const clone = item.cloneNode(true);
    item.parentNode.replaceChild(clone, item);
  });

  document.querySelectorAll(".superadmin-sidebar-item").forEach(item => {
    item.addEventListener("click", () => {
      const tabId = item.getAttribute("data-tab");
      switchSaaSTab(tabId);
    });
  });
  
  // Set default tab on load
  switchSaaSTab("saas-overview");
}

function switchSaaSTab(tabId) {
  document.querySelectorAll(".superadmin-sidebar-item").forEach(item => {
    if (item.getAttribute("data-tab") === tabId) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });

  document.querySelectorAll(".saas-panel-view").forEach(panel => {
    panel.classList.remove("active");
    panel.style.display = "none";
  });

  const targetPanel = document.getElementById(`panel-${tabId}`);
  if (targetPanel) {
    targetPanel.classList.add("active");
    targetPanel.style.display = "block";
  }

  const titles = {
    "saas-overview": "Dashboard",
    "saas-restaurants": "Restaurant Management",
    "saas-admins": "Admin Management",
    "saas-plans": "Subscription & Plans",
    "saas-invoices": "Revenue & Billing"
  };
  
  const activeTitle = document.getElementById("saas-active-panel-title");
  if (activeTitle) {
    activeTitle.textContent = titles[tabId] || "Dashboard";
  }

  if (tabId === "saas-overview") {
    renderSaaSOverview();
  } else if (tabId === "saas-restaurants") {
    renderSaaSRestaurantsDirectory();
  } else if (tabId === "saas-admins") {
    renderSaaSAdminsManagement();
  } else if (tabId === "saas-plans") {
    renderSaaSPlans();
  } else if (tabId === "saas-invoices") {
    renderSaaSInvoices();
  }
}

function renderSaaSOverview() {
  const now = new Date();
  const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' };
  const saasDateTimeEl = document.getElementById("saas-date-time");
  if (saasDateTimeEl) {
    saasDateTimeEl.textContent = now.toLocaleDateString('en-US', options);
  }

  let totalMrr = 0;
  let activeCount = 0;
  let inactiveCount = 0;
  let totalUsers = state.saasAdmins.length;
  let totalOrdersAllTime = 0;
  
  for (let id in restaurantsData) {
    const rest = restaurantsData[id];
    
    if (rest.staff) totalUsers += rest.staff.length;
    totalUsers += 1; // Count owner
    
    if (rest.orders) totalOrdersAllTime += rest.orders.length;
    
    if (rest.status === "Active") {
      const planObj = state.saasPlans.find(p => p.name === rest.plan);
      totalMrr += planObj ? planObj.monthlyPrice : 0;
      activeCount++;
    } else {
      inactiveCount++;
    }
  }
  
  const totalRestCount = Object.keys(restaurantsData).length;
  const todaysOrders = Math.floor(totalOrdersAllTime * 0.15) || 24; // Simulated today's order count
  
  let totalSubRev = 0;
  state.saasInvoices.forEach(inv => {
    if (inv.status === "Paid") totalSubRev += inv.amount;
  });

  const elTotalRest = document.getElementById("saas-val-total-rest");
  if (elTotalRest) elTotalRest.textContent = totalRestCount;
  
  const elActiveRest = document.getElementById("saas-val-active-rest");
  if (elActiveRest) elActiveRest.textContent = activeCount;
  
  const elInactiveRest = document.getElementById("saas-val-inactive-rest");
  if (elInactiveRest) elInactiveRest.textContent = inactiveCount;
  
  const elUsers = document.getElementById("saas-val-users");
  if (elUsers) elUsers.textContent = totalUsers;
  
  const elTotalOrders = document.getElementById("saas-val-total-orders");
  if (elTotalOrders) elTotalOrders.textContent = totalOrdersAllTime;
  
  const elTodayOrders = document.getElementById("saas-val-today-orders");
  if (elTodayOrders) elTodayOrders.textContent = todaysOrders;
  
  const mrrVal = document.getElementById("saas-val-mrr");
  if (mrrVal) mrrVal.textContent = `₹${totalMrr.toLocaleString('en-IN')}`;
  
  const subRevVal = document.getElementById("saas-val-sub-rev");
  if (subRevVal) subRevVal.textContent = `₹${totalSubRev.toLocaleString('en-IN')}`;
  
  // Render Growth Chart SVG
  const chartContainer = document.getElementById("saas-growth-chart-container");
  if (chartContainer) {
    chartContainer.innerHTML = `
      <svg width="100%" height="100%" viewBox="0 0 500 200" style="overflow: visible;">
        <!-- Grid lines -->
        <line x1="40" y1="20" x2="480" y2="20" stroke="#f1f5f9" stroke-width="1"></line>
        <line x1="40" y1="70" x2="480" y2="70" stroke="#f1f5f9" stroke-width="1"></line>
        <line x1="40" y1="120" x2="480" y2="120" stroke="#f1f5f9" stroke-width="1"></line>
        <line x1="40" y1="170" x2="480" y2="170" stroke="#e2e8f0" stroke-width="1.5"></line>
        
        <!-- Y Axis Labels -->
        <text x="10" y="25" fill="#94a3b8" font-size="10" font-family="Inter">₹20k</text>
        <text x="10" y="75" fill="#94a3b8" font-size="10" font-family="Inter">₹15k</text>
        <text x="10" y="125" fill="#94a3b8" font-size="10" font-family="Inter">₹10k</text>
        <text x="10" y="175" fill="#94a3b8" font-size="10" font-family="Inter">₹0</text>
        
        <!-- Bars (Jan - Jun) -->
        <!-- Jan -->
        <rect class="chart-bar-grow" x="60" y="132" width="32" height="38" rx="4" style="fill: #e2e8f0;"></rect>
        <text x="76" y="190" text-anchor="middle" fill="#64748b" font-size="11" font-family="Inter">Jan</text>
        
        <!-- Feb -->
        <rect class="chart-bar-grow" x="130" y="112" width="32" height="58" rx="4" style="fill: #cbd5e1;"></rect>
        <text x="146" y="190" text-anchor="middle" fill="#64748b" font-size="11" font-family="Inter">Feb</text>
        
        <!-- Mar -->
        <rect class="chart-bar-grow" x="200" y="82" width="32" height="88" rx="4" style="fill: #94a3b8;"></rect>
        <text x="216" y="190" text-anchor="middle" fill="#64748b" font-size="11" font-family="Inter">Mar</text>
        
        <!-- Apr -->
        <rect class="chart-bar-grow" x="270" y="62" width="32" height="108" rx="4" style="fill: #64748b;"></rect>
        <text x="286" y="190" text-anchor="middle" fill="#64748b" font-size="11" font-family="Inter">Apr</text>
        
        <!-- May: Current (mrr) dynamic height -->
        <rect class="chart-bar-grow" x="340" y="${170 - Math.min(150, (totalMrr / 20000 * 150))}" width="32" height="${Math.min(150, (totalMrr / 20000 * 150))}" rx="4" style="fill: var(--primary);"></rect>
        <text x="356" y="190" text-anchor="middle" fill="#64748b" font-size="11" font-family="Inter" font-weight="700">May</text>
        
        <!-- Jun: Proj -->
        <rect class="chart-bar-grow" x="410" y="32" width="32" height="138" rx="4" fill-opacity="0.3" stroke="var(--primary)" stroke-dasharray="3" stroke-width="1.5" style="fill: var(--primary);"></rect>
        <text x="426" y="190" text-anchor="middle" fill="#64748b" font-size="11" font-family="Inter">Jun (P)</text>
      </svg>
    `;
  }
  
  // Render System Audit Logs
  const logsContainer = document.getElementById("saas-logs-container");
  if (logsContainer) {
    logsContainer.innerHTML = state.saasLogs.map(log => `
      <div style="display: flex; gap: 12px; font-size: 12.5px; border-bottom: 1px solid var(--border); padding: 8px 0; align-items: center;">
        <span style="color: var(--text-muted); font-weight: 700; font-family: monospace; white-space: nowrap; background: var(--bg-tertiary); padding: 2px 6px; border-radius: 4px;">${log.time}</span>
        <span style="color: var(--text-main); font-weight: 500;">${log.text}</span>
      </div>
    `).join("");
  }
}

function renderSaaSRestaurantsDirectory() {
  const tbody = document.getElementById("saas-restaurants-tbody");
  if (!tbody) return;
  
  tbody.innerHTML = "";
  
  for (let id in restaurantsData) {
    const rest = restaurantsData[id];
    const planObj = state.saasPlans.find(p => p.name === rest.plan);
    const planPrice = planObj ? planObj.monthlyPrice : 0;
    
    const tr = document.createElement("tr");
    tr.style.borderBottom = "1px solid var(--border)";
    
    let badgeClass = "badge-custom";
    if (rest.status === "Active") {
      badgeClass += " badge-ready";
    } else if (rest.status === "Suspended") {
      badgeClass += " badge-preparing";
    } else {
      badgeClass += " badge-inactive";
    }
    
    // Logo / Banner rendering
    const logoHtml = rest.logo 
      ? `<img src="${rest.logo}" style="width: 32px; height: 32px; object-fit: contain; border-radius: 4px; border: 1px solid var(--border);">`
      : `<span style="color: var(--text-muted); font-size: 11px;">No Logo</span>`;
      
    const bannerHtml = rest.banner 
      ? `<img src="${rest.banner}" style="width: 50px; height: 28px; object-fit: cover; border-radius: 4px; border: 1px solid var(--border);">`
      : `<span style="color: var(--text-muted); font-size: 11px;">No Banner</span>`;
      
    tr.innerHTML = `
      <td style="padding: 10px 8px; font-family: monospace; font-size: 12px; font-weight: 600;">${rest.id}</td>
      <td style="padding: 10px 8px; font-weight: 700; color: var(--black); white-space: nowrap;">${rest.name}</td>
      <td style="padding: 10px 8px; font-size: 13px; color: var(--text-main); white-space: nowrap;">${rest.ownerName || 'N/A'}</td>
      <td style="padding: 10px 8px; font-size: 13px; color: var(--text-main); font-family: monospace;">${rest.owner}</td>
      <td style="padding: 10px 8px; font-size: 13px; color: var(--text-main); white-space: nowrap;">${rest.phone || 'N/A'}</td>
      <td style="padding: 10px 8px; font-size: 13px; color: var(--text-muted); white-space: nowrap; max-width: 150px; overflow: hidden; text-overflow: ellipsis;" title="${rest.address || ''}">${rest.address || 'N/A'}</td>
      <td style="padding: 10px 8px; font-size: 13px; color: var(--text-main); white-space: nowrap;">${rest.city || 'N/A'}</td>
      <td style="padding: 10px 8px; font-size: 13px; color: var(--text-main); white-space: nowrap;">${rest.state || 'N/A'}</td>
      <td style="padding: 10px 8px; font-size: 13px; color: var(--text-main); font-family: monospace; white-space: nowrap;">${rest.gstNumber || 'N/A'}</td>
      <td style="padding: 10px 8px; font-size: 13px; font-weight: 600; color: var(--text-main); white-space: nowrap;"><span style="background: var(--bg-secondary); padding: 4px 8px; border-radius: 12px; border: 1px solid var(--border);">${rest.plan}</span></td>
      <td style="padding: 10px 8px;"><span class="${badgeClass}">${rest.status}</span></td>
      <td style="padding: 10px 8px; font-size: 13px; color: var(--text-muted); white-space: nowrap;">${rest.createdDate || 'N/A'}</td>
      <td style="padding: 10px 8px; font-size: 13px; color: var(--text-muted);">${rest.openingTime || 'N/A'}</td>
      <td style="padding: 10px 8px; font-size: 13px; color: var(--text-muted);">${rest.closingTime || 'N/A'}</td>
      <td style="padding: 10px 8px; text-align: center;">${logoHtml}</td>
      <td style="padding: 10px 8px; text-align: center;">${bannerHtml}</td>
      <td style="padding: 10px 8px; text-align: right; white-space: nowrap;">
        <button class="btn btn-black impersonate-btn" data-id="${id}" style="padding: 4px 8px; font-size: 11px; margin-right: 4px; border-radius: 8px;">
          ⚡ Login
        </button>
        <button class="btn btn-outline detail-rest-btn" data-id="${id}" style="padding: 4px 8px; font-size: 11px; margin-right: 4px; border-radius: 8px;">
          👁️ Details
        </button>
        <button class="btn btn-outline perf-rest-btn" data-id="${id}" style="padding: 4px 8px; font-size: 11px; margin-right: 4px; border-radius: 8px;">
          📈 Perf
        </button>
        <button class="btn btn-outline edit-rest-btn" data-id="${id}" style="padding: 4px 8px; font-size: 11px; margin-right: 4px; border-radius: 8px;">
          ⚙️ Edit
        </button>
        <button class="btn btn-outline toggle-status-btn" data-id="${id}" style="padding: 4px 8px; font-size: 11px; margin-right: 4px; border-radius: 8px;">
          ${rest.status === "Active" ? "Suspend" : "Activate"}
        </button>
        <button class="btn btn-outline delete-rest-btn" data-id="${id}" style="padding: 4px 8px; font-size: 11px; border-radius: 8px; border-color: #ef4444; color: #ef4444;">
          🗑️ Delete
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  }
  
  // Attach event listeners to buttons
  tbody.querySelectorAll(".impersonate-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      impersonateTenant(id);
    });
  });
  
  tbody.querySelectorAll(".detail-rest-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      openSaaSRestaurantDetail(id);
    });
  });

  tbody.querySelectorAll(".perf-rest-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      openSaaSPerformanceModal(id);
    });
  });

  tbody.querySelectorAll(".edit-rest-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      openEditRestaurantModal(id);
    });
  });
  
  tbody.querySelectorAll(".toggle-status-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      toggleRestaurantStatus(id);
    });
  });

  tbody.querySelectorAll(".delete-rest-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      deleteSaaSRestaurant(id);
    });
  });
}

function openEditRestaurantModal(id) {
  const rest = restaurantsData[id];
  if (!rest) return;
  
  document.getElementById("saas-restaurant-form-title").textContent = "Edit Restaurant Details";
  document.getElementById("saas-edit-rest-id").value = id;
  
  // Basic Info
  document.getElementById("saas-input-name").value = rest.name || "";
  document.getElementById("saas-input-owner-name").value = rest.ownerName || "";
  document.getElementById("saas-input-owner").value = rest.owner || "";
  document.getElementById("saas-input-phone").value = rest.phone || "";
  
  // Location
  document.getElementById("saas-input-address").value = rest.address || "";
  document.getElementById("saas-input-city").value = rest.city || "";
  document.getElementById("saas-input-state").value = rest.state || "";
  document.getElementById("saas-input-gst").value = rest.gstNumber || "";
  
  // Operations & Branding
  document.getElementById("saas-input-opening").value = rest.openingTime || "08:00";
  document.getElementById("saas-input-closing").value = rest.closingTime || "22:00";
  document.getElementById("saas-input-logo").value = rest.logo || "";
  document.getElementById("saas-input-banner").value = rest.banner || "";
  
  // SaaS Settings
  document.getElementById("saas-input-plan").value = rest.plan || "Standard";
  document.getElementById("saas-input-tables").value = (rest.settings && rest.settings.tablesCount) ? rest.settings.tablesCount : (rest.tables ? rest.tables.length : 5);
  document.getElementById("saas-input-status").value = rest.status || "Active";
  document.getElementById("saas-input-created").value = rest.createdDate || new Date().toISOString().split('T')[0];
  
  document.getElementById("saas-restaurant-modal").style.display = "flex";
}

function toggleRestaurantStatus(id) {
  const rest = restaurantsData[id];
  if (!rest) return;
  
  rest.status = rest.status === "Active" ? "Suspended" : "Active";
  
  // Add log entry
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  state.saasLogs.unshift({
    time: timeStr,
    text: `${rest.name} account status changed to ${rest.status} by SaaS admin`
  });
  
  renderSaaSRestaurantsDirectory();
  renderSaaSOverview();
}

function renderSaaSPlans() {
  const tbody = document.getElementById("saas-plans-tbody");
  if (!tbody) return;
  
  tbody.innerHTML = "";
  
  state.saasPlans.forEach(plan => {
    // Ensure autoRenewal field exists
    if (plan.autoRenewal === undefined) plan.autoRenewal = true;
    
    const tr = document.createElement("tr");
    tr.style.borderBottom = "1px solid var(--border)";
    
    let statusClass = "badge-custom";
    if (plan.status === "Active") {
      statusClass += " badge-ready";
    } else {
      statusClass += " badge-preparing";
    }
    
    // Truncate features for table display
    const featuresList = plan.features.split(',').map(f => f.trim()).filter(f => f);
    const featuresDisplay = featuresList.length <= 2 
      ? featuresList.join(', ') 
      : featuresList.slice(0, 2).join(', ') + ` +${featuresList.length - 2} more`;
    
    tr.innerHTML = `
      <td style="padding: 10px 8px; font-weight: 700; color: var(--black); white-space: nowrap;">
        <span style="background: var(--bg-secondary); padding: 4px 10px; border-radius: 12px; border: 1px solid var(--border); font-size: 13px;">${plan.name}</span>
      </td>
      <td style="padding: 10px 8px; font-size: 13px; font-weight: 700; color: var(--black); white-space: nowrap;">₹${plan.monthlyPrice.toLocaleString('en-IN')}<span style="font-weight:400; color: var(--text-muted); font-size:11px;"> /mo</span></td>
      <td style="padding: 10px 8px; font-size: 13px; font-weight: 700; color: var(--black); white-space: nowrap;">₹${plan.annualPrice.toLocaleString('en-IN')}<span style="font-weight:400; color: var(--text-muted); font-size:11px;"> /yr</span></td>
      <td style="padding: 10px 8px; font-size: 13px; font-weight: 600; color: var(--text-main); text-align: center;">${plan.branchLimit}</td>
      <td style="padding: 10px 8px; font-size: 13px; font-weight: 600; color: var(--text-main); text-align: center;">${plan.userLimit}</td>
      <td style="padding: 10px 8px; font-size: 13px; font-weight: 600; color: var(--text-main); text-align: center;">${plan.orderLimit === 999999 ? 'Unlimited' : plan.orderLimit.toLocaleString('en-IN')}</td>
      <td style="padding: 10px 8px; font-size: 12px; color: var(--text-muted); max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${plan.features}">${featuresDisplay}</td>
      <td style="padding: 10px 8px;"><span class="${statusClass}">${plan.status}</span></td>
      <td style="padding: 10px 8px; text-align: right; white-space: nowrap;">
        <button class="btn btn-outline modify-plan-btn" data-id="${plan.id}" style="padding: 4px 8px; font-size: 11px; margin-right: 4px; border-radius: 8px;">
          ⚙️ Modify
        </button>
        <button class="btn btn-outline upgrade-plan-btn" data-id="${plan.id}" style="padding: 4px 8px; font-size: 11px; margin-right: 4px; border-radius: 8px;">
          ⬆️ Upgrade/Downgrade
        </button>
        <button class="btn btn-outline renewal-plan-btn" data-id="${plan.id}" style="padding: 4px 8px; font-size: 11px; margin-right: 4px; border-radius: 8px; ${plan.autoRenewal ? 'border-color: #22c55e; color: #22c55e;' : 'border-color: #ef4444; color: #ef4444;'}">
          ${plan.autoRenewal ? '🔄 Auto ON' : '⏸️ Auto OFF'}
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
  
  // Event listeners
  tbody.querySelectorAll(".modify-plan-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      openEditPlanModal(btn.getAttribute("data-id"));
    });
  });
  
  tbody.querySelectorAll(".upgrade-plan-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      openUpgradeModal(btn.getAttribute("data-id"));
    });
  });
  
  tbody.querySelectorAll(".renewal-plan-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      toggleAutoRenewal(btn.getAttribute("data-id"));
    });
  });
}

// Open Upgrade/Downgrade Modal
function openUpgradeModal(planId) {
  const plan = state.saasPlans.find(p => p.id === planId);
  if (!plan) return;
  
  document.getElementById("saas-upgrade-plan-id").value = planId;
  
  // Populate restaurant dropdown
  const select = document.getElementById("saas-upgrade-restaurant");
  select.innerHTML = "";
  for (let id in restaurantsData) {
    const rest = restaurantsData[id];
    const opt = document.createElement("option");
    opt.value = id;
    opt.textContent = `${rest.name} (Current: ${rest.plan})`;
    select.appendChild(opt);
  }
  
  // Show info
  document.getElementById("saas-upgrade-info").innerHTML = `Assigning <strong>${plan.name}</strong> plan (₹${plan.monthlyPrice.toLocaleString('en-IN')}/mo) to the selected restaurant.`;
  
  // Show restaurant current plan on change
  select.onchange = function() {
    const rest = restaurantsData[this.value];
    if (rest) {
      document.getElementById("saas-upgrade-info").innerHTML = `<strong>${rest.name}</strong> is currently on <strong>${rest.plan}</strong> plan. Changing to <strong>${plan.name}</strong> (₹${plan.monthlyPrice.toLocaleString('en-IN')}/mo).`;
    }
  };
  
  document.getElementById("saas-upgrade-modal").style.display = "flex";
}

// Apply Plan Upgrade/Downgrade
window.applyPlanUpgrade = function() {
  const planId = document.getElementById("saas-upgrade-plan-id").value;
  const restId = document.getElementById("saas-upgrade-restaurant").value;
  
  const plan = state.saasPlans.find(p => p.id === planId);
  const rest = restaurantsData[restId];
  
  if (!plan || !rest) {
    alert("Invalid selection.");
    return;
  }
  
  const oldPlan = rest.plan;
  rest.plan = plan.name;
  
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  state.saasLogs.unshift({
    time: timeStr,
    text: `${rest.name} plan changed: ${oldPlan} → ${plan.name}`
  });
  
  document.getElementById("saas-upgrade-modal").style.display = "none";
  alert(`${rest.name} has been ${plan.name > oldPlan ? 'upgraded' : 'changed'} to ${plan.name} plan successfully!`);
  
  renderSaaSRestaurantsDirectory();
  renderSaaSOverview();
};

// Toggle Auto Renewal
function toggleAutoRenewal(planId) {
  const plan = state.saasPlans.find(p => p.id === planId);
  if (!plan) return;
  
  plan.autoRenewal = !plan.autoRenewal;
  
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  state.saasLogs.unshift({
    time: timeStr,
    text: `Auto Renewal ${plan.autoRenewal ? 'enabled' : 'disabled'} for ${plan.name} plan`
  });
  
  alert(`Auto Renewal for ${plan.name} plan is now ${plan.autoRenewal ? 'ON' : 'OFF'}.`);
  renderSaaSPlans();
}

function impersonateTenant(restaurantId) {
  const rest = restaurantsData[restaurantId];
  if (!rest) return;
  
  if (rest.status === "Suspended") {
    alert("❌ Cannot impersonate suspended restaurant.");
    return;
  }
  
  // Save current active state back to database (if any)
  saveCurrentTenantData();
  
  // Load target restaurant data
  loadTenantData(restaurantId);
  
  // Set impersonating states
  state.isImpersonating = true;
  state.currentUser = { name: "Super Admin", email: "superadmin@serviq.com", role: "Admin" };
  
  // Update UI Elements
  document.getElementById("profile-restaurant-name").textContent = state.restaurantSettings.name;
  document.getElementById("avatar-letter").textContent = state.restaurantSettings.name.charAt(0).toUpperCase();
  document.getElementById("profile-user-email").textContent = "Super Admin (Impersonating)";
  
  // Show exit banner & set store name
  const banner = document.getElementById("saas-impersonation-banner");
  banner.style.display = "flex";
  document.getElementById("impersonation-rest-name").textContent = rest.name;
  
  // Hide superadmin view, show tenant dashboard view
  document.getElementById("superadmin-view").style.display = "none";
  dashboardView.style.display = "flex";
  
  // Update sidebar rules
  updateSidebarForRole("Admin");
  switchTab("overview");
  
  // Re-render
  initApp();
  
  // Add log
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  state.saasLogs.unshift({
    time: timeStr,
    text: `Super Admin logged into ${rest.name}`
  });
}

function exitImpersonation() {
  // Save current impersonated state changes back to database
  saveCurrentTenantData();
  
  // Clear impersonating states
  state.isImpersonating = false;
  state.currentRestaurantId = null;
  state.currentUser = { name: "SaaS Owner", email: "superadmin@serviq.com", role: "SuperAdmin" };
  
  // Hide warning banner
  document.getElementById("saas-impersonation-banner").style.display = "none";
  
  // Hide tenant view, show superadmin view
  dashboardView.style.display = "none";
  document.getElementById("superadmin-view").style.display = "flex";
  
  // Refresh SaaS view
  initSaaSApp();
}

// Global SaaS Settings view & save functionality
function renderSaaSSettings() {
  document.getElementById("saas-set-name").value = state.saasSettings.name;
  document.getElementById("saas-set-email").value = state.saasSettings.supportEmail;
  document.getElementById("saas-set-commission").value = state.saasSettings.commission;
  document.getElementById("saas-set-gateway").value = state.saasSettings.gateway;
  
  // Make sure to bind save button listener once
  const saveBtn = document.querySelector("#panel-saas-settings .btn-black");
  if (saveBtn && !saveBtn.dataset.bound) {
    saveBtn.dataset.bound = "true";
    saveBtn.onclick = null; // remove inline alert
    saveBtn.addEventListener("click", () => {
      state.saasSettings.name = document.getElementById("saas-set-name").value.trim();
      state.saasSettings.supportEmail = document.getElementById("saas-set-email").value.trim();
      state.saasSettings.commission = parseFloat(document.getElementById("saas-set-commission").value);
      state.saasSettings.gateway = document.getElementById("saas-set-gateway").value;
      
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      state.saasLogs.unshift({
        time: timeStr,
        text: "Global SaaS system settings updated"
      });
      
      alert("Global SaaS configuration saved successfully!");
      renderSaaSSettings();
    });
  }
}

// Invoices & Billing view & filtering
function renderSaaSInvoices() {
  const tbody = document.getElementById("saas-invoices-tbody");
  if (!tbody) return;
  
  tbody.innerHTML = "";
  
  // Update invoice statistics
  let totalRevenue = 0;
  let pendingCount = 0;
  let projectedMrr = 0;
  
  state.saasInvoices.forEach(inv => {
    if (inv.status === "Paid") {
      totalRevenue += inv.amount;
    } else if (inv.status === "Pending") {
      pendingCount++;
    }
  });
  
  // Projected MRR is the sum of plans of all ACTIVE restaurants
  for (let id in restaurantsData) {
    const rest = restaurantsData[id];
    if (rest.status === "Active") {
      const planObj = state.saasPlans.find(p => p.name === rest.plan);
      projectedMrr += planObj ? planObj.monthlyPrice : 0;
    }
  }
  
  document.getElementById("saas-invoice-total-revenue").textContent = `₹${totalRevenue.toLocaleString('en-IN')}`;
  document.getElementById("saas-invoice-pending-count").textContent = pendingCount;
  document.getElementById("saas-invoice-projected").textContent = `₹${projectedMrr.toLocaleString('en-IN')}`;
  
  // Active states for filters
  document.querySelectorAll("[id^='btn-filter-invoices-']").forEach(btn => {
    btn.classList.remove("btn-black");
    btn.classList.add("btn-outline");
    btn.style.backgroundColor = "";
    btn.style.color = "";
  });
  
  const activeFilterBtn = document.getElementById(`btn-filter-invoices-${state.invoiceFilter.toLowerCase()}`);
  if (activeFilterBtn) {
    activeFilterBtn.classList.remove("btn-outline");
    activeFilterBtn.classList.add("btn-black");
    activeFilterBtn.style.backgroundColor = "var(--primary)";
    activeFilterBtn.style.color = "#ffffff";
  }
  
  // Filter invoices
  const filtered = state.saasInvoices.filter(inv => {
    if (state.invoiceFilter === "All") return true;
    return inv.status === state.invoiceFilter;
  });
  
  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="padding: 24px; text-align: center; color: var(--text-muted);">No invoices found.</td>
      </tr>
    `;
    return;
  }
  
  filtered.forEach(inv => {
    const tr = document.createElement("tr");
    tr.style.borderBottom = "1px solid var(--border)";
    
    let statusClass = "badge-custom";
    if (inv.status === "Paid") {
      statusClass += " badge-ready";
    } else {
      statusClass += " badge-preparing"; // orange/suspended style
    }
    
    tr.innerHTML = `
      <td style="padding: 14px; font-weight: 700; font-family: monospace; color: var(--text-main);">${inv.id}</td>
      <td style="padding: 14px; font-weight: 600; color: var(--black);">${inv.restaurant}</td>
      <td style="padding: 14px; font-size: 13px; color: var(--text-main);"><span style="background: var(--bg-secondary); padding: 2px 6px; border-radius: 4px; border: 1px solid var(--border);">${inv.plan}</span></td>
      <td style="padding: 14px; font-size: 13.5px; font-weight: 700; color: var(--black);">₹${inv.amount.toLocaleString('en-IN')}</td>
      <td style="padding: 14px; font-size: 13px; color: var(--text-muted);">${inv.paymentMethod}</td>
      <td style="padding: 14px; font-size: 13px; color: var(--text-muted);">${inv.paymentDate || '-'}</td>
      <td style="padding: 14px; font-size: 13px; color: var(--text-muted); font-weight: 600;">${inv.dueDate}</td>
      <td style="padding: 14px;"><span class="${statusClass}">${inv.status}</span></td>
      <td style="padding: 14px; text-align: right; white-space: nowrap;">
        <button class="btn btn-outline" onclick="openSaaSInvoiceDetail('${inv.id}')" style="padding: 4px 8px; font-size: 11px; border-radius: 12px; margin-right: 4px;">
          👁️
        </button>
        <button class="btn btn-outline" onclick="downloadSaaSInvoice('${inv.id}')" style="padding: 4px 8px; font-size: 11px; border-radius: 12px; margin-right: 4px;">
          ⬇️ PDF
        </button>
        ${inv.status === "Pending" ? `
        <button class="btn btn-black" onclick="markInvoiceAsPaid('${inv.id}')" style="padding: 4px 8px; font-size: 11px; border-radius: 12px;">
          ✅ Pay
        </button>` : inv.status === "Paid" ? `
        <button class="btn btn-outline" onclick="refundSaaSInvoice('${inv.id}')" style="padding: 4px 8px; font-size: 11px; border-radius: 12px; border-color: #ef4444; color: #ef4444;">
          ↩️ Refund
        </button>` : ''}
      </td>
    `;
    tbody.appendChild(tr);
  });
}

window.filterSaaSInvoices = function(status) {
  state.invoiceFilter = status;
  renderSaaSInvoices();
};

window.markInvoiceAsPaid = function(invoiceId) {
  const inv = state.saasInvoices.find(i => i.id === invoiceId);
  if (inv) {
    inv.status = "Paid";
    
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    state.saasLogs.unshift({
      time: timeStr,
      text: `Invoice ${invoiceId} for ${inv.restaurant} marked as PAID`
    });
    
    alert(`Invoice ${invoiceId} marked as Paid!`);
    renderSaaSInvoices();
  }
};

window.downloadSaaSInvoice = function(invoiceId) {
  alert(`Downloading PDF for Invoice ${invoiceId}...`);
};

window.refundSaaSInvoice = function(invoiceId) {
  if (confirm(`Are you sure you want to refund Invoice ${invoiceId}?`)) {
    const inv = state.saasInvoices.find(i => i.id === invoiceId);
    if (inv) {
      inv.status = "Refunded";
      state.saasLogs.unshift({
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `Invoice ${invoiceId} for ${inv.restaurant} was refunded`
      });
      alert(`Invoice ${invoiceId} has been successfully refunded.`);
      renderSaaSInvoices();
    }
  }
};

// Platform Audit Logs view & searching
function renderSaaSFullLogs() {
  const container = document.getElementById("saas-full-logs-container");
  if (!container) return;
  
  container.innerHTML = "";
  
  const searchInput = document.getElementById("saas-logs-search");
  const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
  
  // Make sure search input keyup triggers search
  if (searchInput && !searchInput.dataset.bound) {
    searchInput.dataset.bound = "true";
    searchInput.addEventListener("input", () => {
      renderSaaSFullLogs();
    });
  }
  
  const filteredLogs = state.saasLogs.filter(log => {
    if (!query) return true;
    return log.text.toLowerCase().includes(query) || log.time.toLowerCase().includes(query);
  });
  
  if (filteredLogs.length === 0) {
    container.innerHTML = `
      <div style="padding: 30px; text-align: center; color: var(--text-muted); font-size: 14px;">
        No system events found matching your search.
      </div>
    `;
    return;
  }
  
  filteredLogs.forEach(log => {
    const item = document.createElement("div");
    item.style.display = "flex";
    item.style.gap = "16px";
    item.style.padding = "10px 14px";
    item.style.borderBottom = "1px solid var(--border)";
    item.style.fontSize = "13px";
    item.style.alignItems = "center";
    
    // Choose icons based on log text
    let icon = "⚙️";
    if (log.text.includes("suspended") || log.text.includes("status")) icon = "🛡️";
    else if (log.text.includes("bill") || log.text.includes("Invoice") || log.text.includes("paid")) icon = "₹";
    else if (log.text.includes("add") || log.text.includes("upgraded")) icon = "🏪";
    
    item.innerHTML = `
      <span style="font-weight: 700; font-family: monospace; color: var(--text-muted); background: var(--bg-tertiary); padding: 2px 8px; border-radius: 4px; white-space: nowrap;">${log.time}</span>
      <span style="display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 50%; background: var(--bg-secondary); border: 1px solid var(--border); font-size: 11px;">${icon}</span>
      <span style="color: var(--text-main); font-weight: 500; flex: 1;">${log.text}</span>
    `;
    container.appendChild(item);
  });
}

window.clearPlatformLogs = function() {
  if (confirm("Are you sure you want to clear all platform logs?")) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    state.saasLogs = [
      { time: timeStr, text: "Platform logs cleared by administrator" }
    ];
    renderSaaSFullLogs();
  }
};


window.deleteSaaSRestaurant = function(id) {
  const rest = restaurantsData[id];
  if (!rest) return;

  if (confirm(`⚠️ WARNING: Are you sure you want to delete "${rest.name}"?\n\nThis will permanently delete all menus, tables, staff credentials, and order history associated with this restaurant. This action cannot be undone.`)) {
    delete restaurantsData[id];

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    state.saasLogs.unshift({
      time: timeStr,
      text: `Deleted restaurant/tenant: ${rest.name}`
    });

    alert(`"${rest.name}" has been successfully deleted.`);
    renderSaaSRestaurantsDirectory();
    renderSaaSOverview();
  }
};

window.openSaaSInvoiceDetail = function(invoiceId) {
  const inv = state.saasInvoices.find(i => i.id === invoiceId);
  if (!inv) return;

  // Retrieve restaurant info if available to show matching email
  let ownerEmail = "admin@serviq.com";
  for (let key in restaurantsData) {
    if (restaurantsData[key].name === inv.restaurant) {
      ownerEmail = restaurantsData[key].owner;
      break;
    }
  }

  document.getElementById("invoice-receipt-restaurant").textContent = inv.restaurant;
  document.getElementById("invoice-receipt-owner").textContent = ownerEmail;
  document.getElementById("invoice-receipt-id").textContent = inv.id;
  document.getElementById("invoice-receipt-date").textContent = new Date(inv.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  
  document.getElementById("invoice-receipt-desc").textContent = `SaaS Subscription - ${inv.plan} Plan`;
  
  const formattedAmt = `₹${inv.amount.toLocaleString('en-IN')}`;
  document.getElementById("invoice-receipt-amount").textContent = formattedAmt;
  document.getElementById("invoice-receipt-subtotal").textContent = formattedAmt;
  
  // 18% inclusive GST calculation: Amt - (Amt / 1.18)
  const gstInclusive = inv.amount - (inv.amount / 1.18);
  document.getElementById("invoice-receipt-tax").textContent = `₹${gstInclusive.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (GST 18% Incl.)`;
  document.getElementById("invoice-receipt-total").textContent = formattedAmt;

  const statusSpan = document.getElementById("invoice-receipt-status");
  statusSpan.className = "badge-custom " + (inv.status === "Paid" ? "badge-ready" : "badge-preparing");
  statusSpan.textContent = inv.status.toUpperCase();

  document.getElementById("saas-invoice-detail-modal").style.display = "flex";
};

// ==========================================================================
// RESTAURANT ADMIN MANAGEMENT
// ==========================================================================

function renderSaaSAdminsManagement() {
  const tbody = document.getElementById("saas-admins-tbody");
  if (!tbody) return;
  
  tbody.innerHTML = "";
  
  // Populate restaurant dropdown in admin modal
  const restSelect = document.getElementById("saas-admin-input-restaurant");
  if (restSelect) {
    restSelect.innerHTML = "";
    for (let id in restaurantsData) {
      const opt = document.createElement("option");
      opt.value = restaurantsData[id].name;
      opt.textContent = restaurantsData[id].name;
      restSelect.appendChild(opt);
    }
  }
  
  state.saasAdmins.forEach(admin => {
    const tr = document.createElement("tr");
    tr.style.borderBottom = "1px solid var(--border)";
    
    let statusClass = "badge-custom";
    if (admin.status === "Active") {
      statusClass += " badge-ready";
    } else {
      statusClass += " badge-preparing";
    }
    
    tr.innerHTML = `
      <td style="padding: 10px 8px; font-family: monospace; font-size: 12px; font-weight: 600; color: var(--text-main);">${admin.id}</td>
      <td style="padding: 10px 8px; font-weight: 700; color: var(--black); white-space: nowrap;">${admin.name}</td>
      <td style="padding: 10px 8px; font-size: 13px; color: var(--text-main); font-family: monospace;">${admin.email}</td>
      <td style="padding: 10px 8px; font-size: 13px; color: var(--text-muted); white-space: nowrap;">${admin.phone}</td>
      <td style="padding: 10px 8px; font-size: 13px; color: var(--text-main); white-space: nowrap;">${admin.restaurantName}</td>
      <td style="padding: 10px 8px; font-size: 13px; white-space: nowrap;"><span style="background: var(--bg-secondary); padding: 4px 8px; border-radius: 12px; border: 1px solid var(--border);">${admin.role}</span></td>
      <td style="padding: 10px 8px;"><span class="${statusClass}">${admin.status}</span></td>
      <td style="padding: 10px 8px; font-size: 13px; color: var(--text-muted); white-space: nowrap;">${admin.lastLogin}</td>
      <td style="padding: 10px 8px; text-align: right; white-space: nowrap;">
        <button class="btn btn-outline edit-admin-btn" data-id="${admin.id}" style="padding: 4px 8px; font-size: 11px; margin-right: 4px; border-radius: 8px;">
          ✏️ Edit
        </button>
        <button class="btn btn-outline reset-pw-btn" data-id="${admin.id}" style="padding: 4px 8px; font-size: 11px; margin-right: 4px; border-radius: 8px;">
          🔑 Reset PW
        </button>
        <button class="btn btn-outline toggle-admin-btn" data-id="${admin.id}" style="padding: 4px 8px; font-size: 11px; border-radius: 8px; ${admin.status === 'Disabled' ? 'border-color: #22c55e; color: #22c55e;' : 'border-color: #ef4444; color: #ef4444;'}">
          ${admin.status === "Active" ? "🚫 Disable" : "✅ Enable"}
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
  
  // Attach event listeners
  tbody.querySelectorAll(".edit-admin-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      openEditAdminModal(btn.getAttribute("data-id"));
    });
  });
  
  tbody.querySelectorAll(".reset-pw-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      openResetPasswordModal(btn.getAttribute("data-id"));
    });
  });
  
  tbody.querySelectorAll(".toggle-admin-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      toggleAdminStatus(btn.getAttribute("data-id"));
    });
  });
  
  // Bind create admin button
  const addAdminBtn = document.getElementById("saas-add-admin-btn");
  if (addAdminBtn && !addAdminBtn.dataset.bound) {
    addAdminBtn.dataset.bound = "true";
    addAdminBtn.addEventListener("click", () => {
      document.getElementById("saas-admin-form-title").textContent = "Create New Admin";
      document.getElementById("saas-edit-admin-id").value = "";
      document.getElementById("saas-admin-input-name").value = "";
      document.getElementById("saas-admin-input-email").value = "";
      document.getElementById("saas-admin-input-phone").value = "";
      document.getElementById("saas-admin-input-role").value = "Owner";
      document.getElementById("saas-admin-input-status").value = "Active";
      document.getElementById("saas-admin-modal").style.display = "flex";
    });
  }
  
  // Bind admin form submit
  const adminForm = document.getElementById("saas-admin-form");
  if (adminForm && !adminForm.dataset.bound) {
    adminForm.dataset.bound = "true";
    adminForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const editId = document.getElementById("saas-edit-admin-id").value;
      const name = document.getElementById("saas-admin-input-name").value.trim();
      const email = document.getElementById("saas-admin-input-email").value.trim();
      const phone = document.getElementById("saas-admin-input-phone").value.trim();
      const role = document.getElementById("saas-admin-input-role").value;
      const restaurant = document.getElementById("saas-admin-input-restaurant").value;
      const status = document.getElementById("saas-admin-input-status").value;
      
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      if (editId) {
        const admin = state.saasAdmins.find(a => a.id === editId);
        if (admin) {
          admin.name = name;
          admin.email = email;
          admin.phone = phone;
          admin.role = role;
          admin.restaurantName = restaurant;
          admin.status = status;
          
          state.saasLogs.unshift({ time: timeStr, text: `Updated admin account: ${name} (${restaurant})` });
        }
      } else {
        const newId = `ADM-${String(state.saasAdmins.length + 1).padStart(3, '0')}`;
        state.saasAdmins.push({
          id: newId,
          name,
          email,
          phone,
          restaurantName: restaurant,
          role,
          status,
          lastLogin: "Never"
        });
        
        state.saasLogs.unshift({ time: timeStr, text: `Created new admin: ${name} for ${restaurant}` });
      }
      
      document.getElementById("saas-admin-modal").style.display = "none";
      renderSaaSAdminsManagement();
      alert(editId ? "Admin updated successfully!" : "New admin created successfully!");
    });
  }
}

function openEditAdminModal(adminId) {
  const admin = state.saasAdmins.find(a => a.id === adminId);
  if (!admin) return;
  
  document.getElementById("saas-admin-form-title").textContent = "Edit Admin";
  document.getElementById("saas-edit-admin-id").value = admin.id;
  document.getElementById("saas-admin-input-name").value = admin.name;
  document.getElementById("saas-admin-input-email").value = admin.email;
  document.getElementById("saas-admin-input-phone").value = admin.phone;
  document.getElementById("saas-admin-input-role").value = admin.role;
  document.getElementById("saas-admin-input-status").value = admin.status;
  
  // Set restaurant dropdown
  const restSelect = document.getElementById("saas-admin-input-restaurant");
  if (restSelect) {
    restSelect.value = admin.restaurantName;
  }
  
  document.getElementById("saas-admin-modal").style.display = "flex";
}

function openResetPasswordModal(adminId) {
  const admin = state.saasAdmins.find(a => a.id === adminId);
  if (!admin) return;
  
  document.getElementById("reset-pw-admin-id").value = admin.id;
  document.getElementById("reset-pw-admin-label").innerHTML = `Resetting password for: <strong>${admin.name}</strong> (${admin.email})`;
  document.getElementById("saas-reset-pw-input").value = "";
  document.getElementById("saas-reset-password-modal").style.display = "flex";
}

window.resetAdminPassword = function() {
  const adminId = document.getElementById("reset-pw-admin-id").value;
  const newPw = document.getElementById("saas-reset-pw-input").value;
  
  if (!newPw || newPw.length < 6) {
    alert("Password must be at least 6 characters long.");
    return;
  }
  
  const admin = state.saasAdmins.find(a => a.id === adminId);
  if (admin) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    state.saasLogs.unshift({ time: timeStr, text: `Password reset for admin: ${admin.name} (${admin.email})` });
    
    alert(`Password for ${admin.name} has been reset successfully.`);
    document.getElementById("saas-reset-password-modal").style.display = "none";
  }
};

function toggleAdminStatus(adminId) {
  const admin = state.saasAdmins.find(a => a.id === adminId);
  if (!admin) return;
  
  admin.status = admin.status === "Active" ? "Disabled" : "Active";
  
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  state.saasLogs.unshift({
    time: timeStr,
    text: `Admin account ${admin.name} ${admin.status === "Active" ? "enabled" : "disabled"}`
  });
  
  renderSaaSAdminsManagement();
}

window.openSaaSRestaurantDetail = function(id) {
  const rest = restaurantsData[id];
  if (!rest) return;

  document.getElementById("saas-detail-name").textContent = rest.name + " Details";
  document.getElementById("saas-detail-id").textContent = id;
  document.getElementById("saas-detail-created").textContent = rest.createdDate || "N/A";
  document.getElementById("saas-detail-status").textContent = rest.status;
  document.getElementById("saas-detail-plan").textContent = rest.plan;
  document.getElementById("saas-detail-owner-name").textContent = rest.ownerName || "N/A";
  document.getElementById("saas-detail-owner").textContent = rest.owner;
  document.getElementById("saas-detail-phone").textContent = rest.phone || "N/A";
  document.getElementById("saas-detail-address").textContent = rest.address || "N/A";
  document.getElementById("saas-detail-location").textContent = (rest.city && rest.state) ? `${rest.city}, ${rest.state}` : "N/A";
  document.getElementById("saas-detail-gst").textContent = rest.gstNumber || "N/A";
  document.getElementById("saas-detail-opening").textContent = rest.openingTime || "N/A";
  document.getElementById("saas-detail-closing").textContent = rest.closingTime || "N/A";
  
  // Set logo and banner
  const logoEl = document.getElementById("saas-detail-logo");
  if (rest.logo) {
    logoEl.style.backgroundImage = `url(${rest.logo})`;
  } else {
    logoEl.style.backgroundImage = "none";
  }
  
  const bannerEl = document.getElementById("saas-detail-banner");
  if (rest.banner) {
    bannerEl.style.backgroundImage = `url(${rest.banner})`;
  } else {
    bannerEl.style.backgroundImage = "none";
  }

  // Usage limits
  document.getElementById("saas-detail-tables").textContent = `${rest.tables ? rest.tables.length : 0} / ${rest.settings ? rest.settings.tablesCount : 5}`;
  document.getElementById("saas-detail-staff").textContent = `${rest.staff ? rest.staff.length : 0} members`;
  document.getElementById("saas-detail-menu").textContent = `${rest.menu ? rest.menu.length : 0} items`;
  document.getElementById("saas-detail-orders").textContent = `${rest.orders ? rest.orders.length : 0} orders`;

  const impBtn = document.getElementById("saas-detail-btn-impersonate");
  if (impBtn) {
    impBtn.onclick = () => {
      document.getElementById("saas-restaurant-detail-modal").style.display = "none";
      impersonateTenant(id);
    };
  }

  document.getElementById("saas-restaurant-detail-modal").style.display = "flex";
};

window.openSaaSPerformanceModal = function(id) {
  const rest = restaurantsData[id];
  if (!rest) return;

  document.getElementById("saas-perf-name").textContent = `${rest.name} Performance`;
  
  // Mock performance metrics
  const totalOrders = rest.orders ? rest.orders.length : Math.floor(Math.random() * 50);
  const revenue = totalOrders * (Math.floor(Math.random() * 200) + 150);
  const aov = totalOrders > 0 ? (revenue / totalOrders).toFixed(0) : 0;
  
  document.getElementById("saas-perf-revenue").textContent = `₹${revenue.toLocaleString('en-IN')}`;
  document.getElementById("saas-perf-orders").textContent = totalOrders;
  document.getElementById("saas-perf-aov").textContent = `₹${aov}`;
  document.getElementById("saas-perf-tables").textContent = `${rest.tables ? rest.tables.length : 0} / ${rest.settings ? rest.settings.tablesCount : 5}`;

  document.getElementById("saas-performance-modal").style.display = "flex";
};

// ==========================================================================
// BIND SaaS EVENTS (used in setupEventListeners)
// ==========================================================================
function bindSaaSEvents() {
  // Plan Management Bindings
  const addPlanBtn = document.getElementById("saas-add-plan-btn");
  if (addPlanBtn && !addPlanBtn.dataset.bound) {
    addPlanBtn.dataset.bound = "true";
    addPlanBtn.addEventListener("click", () => {
      document.getElementById("saas-plan-form-title").textContent = "Create Subscription Plan";
      document.getElementById("saas-edit-plan-id").value = "";
      document.getElementById("saas-plan-input-name").value = "";
      document.getElementById("saas-plan-input-status").value = "Active";
      document.getElementById("saas-plan-input-monthly").value = "";
      document.getElementById("saas-plan-input-annual").value = "";
      document.getElementById("saas-plan-input-branch").value = "";
      document.getElementById("saas-plan-input-users").value = "";
      document.getElementById("saas-plan-input-orders").value = "";
      document.getElementById("saas-plan-input-features").value = "";
      document.getElementById("saas-plan-modal").style.display = "flex";
    });
  }

  const planForm = document.getElementById("saas-plan-form");
  if (planForm && !planForm.dataset.bound) {
    planForm.dataset.bound = "true";
    planForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const editId = document.getElementById("saas-edit-plan-id").value;
      const planData = {
        name: document.getElementById("saas-plan-input-name").value.trim(),
        status: document.getElementById("saas-plan-input-status").value,
        monthlyPrice: parseInt(document.getElementById("saas-plan-input-monthly").value, 10),
        annualPrice: parseInt(document.getElementById("saas-plan-input-annual").value, 10),
        branchLimit: parseInt(document.getElementById("saas-plan-input-branch").value, 10),
        userLimit: parseInt(document.getElementById("saas-plan-input-users").value, 10),
        orderLimit: parseInt(document.getElementById("saas-plan-input-orders").value, 10),
        features: document.getElementById("saas-plan-input-features").value.trim(),
        billingCycle: "mo"
      };

      if (editId) {
        const plan = state.saasPlans.find(p => p.id === editId);
        if (plan) {
          Object.assign(plan, planData);
          state.saasLogs.unshift({ time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: `Updated subscription plan: ${plan.name}` });
          alert("Plan updated successfully!");
        }
      } else {
        const newId = `plan-${Date.now()}`;
        state.saasPlans.push({ id: newId, ...planData });
        state.saasLogs.unshift({ time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: `Created new subscription plan: ${planData.name}` });
        alert("New plan created successfully!");
      }
      
      document.getElementById("saas-plan-modal").style.display = "none";
      renderSaaSPlans();
      renderSaaSOverview(); // Because projected MRR uses plan prices
    });
  }
}

window.openEditPlanModal = function(id) {
  const plan = state.saasPlans.find(p => p.id === id);
  if (!plan) return;
  
  document.getElementById("saas-plan-form-title").textContent = "Edit Subscription Plan";
  document.getElementById("saas-edit-plan-id").value = id;
  document.getElementById("saas-plan-input-name").value = plan.name;
  document.getElementById("saas-plan-input-status").value = plan.status;
  document.getElementById("saas-plan-input-monthly").value = plan.monthlyPrice;
  document.getElementById("saas-plan-input-annual").value = plan.annualPrice;
  document.getElementById("saas-plan-input-branch").value = plan.branchLimit;
  document.getElementById("saas-plan-input-users").value = plan.userLimit;
  document.getElementById("saas-plan-input-orders").value = plan.orderLimit;
  document.getElementById("saas-plan-input-features").value = plan.features;
  
  document.getElementById("saas-plan-modal").style.display = "flex";
};
