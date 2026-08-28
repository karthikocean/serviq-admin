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
      baseBranchLimit: 3,
      extraBranchSlots: 0,
      extraBranchPrice: 699,
      userLimit: 15,
      orderLimit: 2000,
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
    menu: [],
    orders: [],
    tables: [],
    qrCodes: [],
    branches: [],
    billingData: [],
    billingHistory: [],
    staff: [],
    users: [],
    kitchenLogin: {
      email: "",
      password: ""
    },
    inventory: [],
    inventoryLogs: [],
    inventoryPurchases: [],
    inventoryReductions: [],
    inventoryCategories: [],
    categories: [],
    roles: {
      Admin: {
        permissions: {
          overview: { view: true, add: true, edit: true, delete: true },
          'branch-management': { view: false, add: false, edit: false, delete: false },
          'plans-management': { view: false, add: false, edit: false, delete: false },
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
    logo: "/logo.png",
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
    branchLimit: 1,
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
    branchLimit: 3,
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
      { name: "Kitchen Management", included: false },
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
    branchLimit: 10,
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
