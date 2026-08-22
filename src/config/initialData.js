// MULTI-TENANT RESTAURANTS DATABASE
export const initialRestaurantsData = {
  "rest-1": {
    id: "rest-1",
    name: "Serviq",
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
    logo: "/logo.png",
    banner: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=60",
    plan: "Standard",
    status: "Active",
    subscription: {
      planId: "plan-standard",
      planName: "Standard",
      status: "Active",
      billingCycle: "monthly",
      price: 1999,
      annualPrice: 19999,
      startDate: "2026-01-15",
      expiryDate: "2027-01-15",
      nextBillingDate: "2026-09-15",
      baseBranchLimit: 3,
      extraBranchSlots: 0,
      extraBranchPrice: 699,
      userLimit: 15,
      orderLimit: 2000,
      autoRenew: true,
      paymentMethod: "Credit Card (•••• 4242)"
    },
    subscriptionInvoices: [
      { id: "INV-PLN-2026-003", planName: "Standard Plan", description: "Standard Plan - Monthly Subscription Renewal", branchesIncluded: 3, amount: 1999, date: "2026-08-15", paymentMethod: "Credit Card (•••• 4242)", status: "Paid" },
      { id: "INV-PLN-2026-002", planName: "Standard Plan", description: "Standard Plan - Monthly Subscription Renewal", branchesIncluded: 3, amount: 1999, date: "2026-07-15", paymentMethod: "Credit Card (•••• 4242)", status: "Paid" },
      { id: "INV-PLN-2026-001", planName: "Standard Plan", description: "Standard Plan - Initial Subscription Activation", branchesIncluded: 3, amount: 1999, date: "2026-06-15", paymentMethod: "Razorpay UPI", status: "Paid" }
    ],
    settings: {
      name: "Serviq",
      tagline: "High Quality South Indian Vegetarian Food",
      currency: "₹",
      tablesCount: 5,
      taxRate: 0.025,
      serviceChargeRate: 0.00
    },
    menu: [
      { id: "menu-1", name: "Paneer Tikka", category: "Starters", price: 180, gst: 5, desc: "Marinated cottage cheese cubes grilled in charcoal tandoor with onions and bell peppers.", image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500&auto=format&fit=crop&q=60", available: true, veg: true, bestseller: false },
      { id: "menu-2", name: "Chicken Biryani", category: "Rice Meals", price: 320, gst: 5, desc: "Fragrant basmati rice layered with juicy spiced chicken, saffron, and fresh mint.", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=60", available: true, veg: false, bestseller: true },
      { id: "menu-3", name: "Masala Dosa", category: "Tiffin", price: 120, gst: 5, desc: "Thin crispy rice crepe filled with spiced potato mash. Served with sambar and coconut chutney.", image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500&auto=format&fit=crop&q=60", available: true, veg: true, bestseller: true },
      { id: "menu-4", name: "Dal Makhani", category: "Rice Meals", price: 160, gst: 5, desc: "Creamy slow-cooked black lentils simmered overnight with butter, cream, and tomatoes.", image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60", available: true, veg: true, bestseller: false },
      { id: "menu-full-meals", name: "Full Meals", category: "Rice Meals", price: 120, gst: 5, desc: "Rice, sambar, rasam, 3 curries, papad, pickle & payasam", image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60", available: true, veg: true, bestseller: true },
      { id: "menu-mini-meals", name: "Mini Meals", category: "Rice Meals", price: 90, gst: 5, desc: "Rice, sambar, 1 curry, papad & pickle", image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500&auto=format&fit=crop&q=60", available: true, veg: true, bestseller: false },
      { id: "menu-5", name: "Gulab Jamun", category: "Desserts", price: 80, gst: 5, desc: "Golden fried milk-solid dumplings dipped in warm cardamom-scented sugar syrup.", image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=60", available: true, veg: true, bestseller: false },
      { id: "menu-6", name: "Masala Chai", category: "Drinks", price: 40, gst: 5, desc: "Traditional brewed black tea infused with cardamom, ginger, cloves, and milk.", image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=60", available: true, veg: true, bestseller: false },
      { id: "menu-7", name: "Butter Naan", category: "Rotis", price: 40, gst: 5, desc: "Soft leavened tandoori flatbread brushed with generous butter.", image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500&auto=format&fit=crop&q=60", available: true, veg: true, bestseller: false },
      { id: "menu-8", name: "Lassi", category: "Drinks", price: 60, gst: 5, desc: "Chilled yogurt beverage blended sweet with cardamom and rose water.", image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=500&auto=format&fit=crop&q=60", available: true, veg: true, bestseller: false }
    ],
    orders: [
      { id: "847", branchId: "BR-001", table: "03", time: "1:28 PM", timeAgo: "2 min ago", items: [{ name: "Chicken Biryani", qty: 1, price: 320 }, { name: "Masala Chai", qty: 2, price: 40 }], notes: "Less spicy please", subtotal: 400, tax: 10, charge: 0, total: 420, status: "new", billingStatus: "unpaid", waiter: "Unassigned" },
      { id: "846", branchId: "BR-001", table: "07", time: "1:22 PM", timeAgo: "8 min ago", items: [{ name: "Chicken Biryani", qty: 4, price: 320 }, { name: "Dal Makhani", qty: 3, price: 160 }, { name: "Paneer Tikka", qty: 1, price: 180 }, { name: "Masala Chai", qty: 2, price: 40 }], notes: "", subtotal: 2020, tax: 101, charge: 0, total: 2121, status: "preparing", billingStatus: "unpaid", waiter: "Ravi M." },
      { id: "845", branchId: "BR-001", table: "01", time: "1:15 PM", timeAgo: "15 min ago", items: [{ name: "Masala Dosa", qty: 5, price: 120 }, { name: "Filter Coffee", qty: 3, price: 40 }], notes: "Allergy: peanuts", subtotal: 720, tax: 36, charge: 0, total: 756, status: "preparing", billingStatus: "unpaid", waiter: "Rahul S." },
      { id: "844", branchId: "BR-002", table: "05", time: "1:08 PM", timeAgo: "22 min ago", items: [{ name: "Paneer Tikka", qty: 2, price: 180 }, { name: "Chicken Biryani", qty: 1, price: 320 }, { name: "Butter Naan", qty: 3, price: 40 }, { name: "Masala Chai", qty: 2, price: 40 }], notes: "", subtotal: 880, tax: 44, charge: 0, total: 924, status: "ready", billingStatus: "unpaid", waiter: "Arjun K." },
      { id: "843", branchId: "BR-003", table: "02", time: "1:00 PM", timeAgo: "30 min ago", items: [{ name: "Veg Thali", qty: 2, price: 120 }, { name: "Masala Chai", qty: 3, price: 40 }], notes: "", subtotal: 360, tax: 18, charge: 0, total: 378, status: "completed", billingStatus: "paid", waiter: "Ravi M." },
      { id: "842", branchId: "BR-001", table: "02", time: "12:55 PM", timeAgo: "35 min ago", items: [{ name: "Chicken Biryani", qty: 2, price: 320 }, { name: "Dal Makhani", qty: 2, price: 160 }, { name: "Paneer Tikka", qty: 1, price: 180 }, { name: "Masala Chai", qty: 1, price: 40 }], notes: "", subtotal: 1180, tax: 59, charge: 0, total: 1239, status: "preparing", billingStatus: "unpaid", waiter: "Ravi M." }
    ],
    tables: [
      { id: "T-01", branchId: "60a1b2c3d4e5f6a7b8c9d0e1", seats: 4, section: "Main Hall", status: "Occupied", assignedWaiterId: "S-01" },
      { id: "T-02", branchId: "60a1b2c3d4e5f6a7b8c9d0e1", seats: 2, section: "Main Hall", status: "Occupied", assignedWaiterId: "S-06" },
      { id: "T-03", branchId: "60a1b2c3d4e5f6a7b8c9d0e1", seats: 6, section: "Family Section", status: "Free", assignedWaiterId: "S-01" },
      { id: "T-04", branchId: "60a1b2c3d4e5f6a7b8c9d0e1", seats: 4, section: "AC Dining", status: "Free", assignedWaiterId: "S-06" },
      { id: "T-05", branchId: "60a1b2c3d4e5f6a7b8c9d0e2", seats: 4, section: "Outdoor Terrace", status: "Occupied", assignedWaiterId: "S-03" },
      { id: "T-06", branchId: "60a1b2c3d4e5f6a7b8c9d0e2", seats: 4, section: "Main Hall", status: "Free", assignedWaiterId: "S-07" },
      { id: "T-07", branchId: "60a1b2c3d4e5f6a7b8c9d0e2", seats: 6, section: "Main Hall", status: "Occupied", assignedWaiterId: "S-03" },
      { id: "T-08", branchId: "60a1b2c3d4e5f6a7b8c9d0e3", seats: 4, section: "Main Hall", status: "Occupied", assignedWaiterId: "S-08" },
      { id: "T-09", branchId: "60a1b2c3d4e5f6a7b8c9d0e3", seats: 2, section: "Window Section", status: "Free", assignedWaiterId: "S-08" },
      { id: "T-10", branchId: "60a1b2c3d4e5f6a7b8c9d0e3", seats: 8, section: "VIP Lounge", status: "Free", assignedWaiterId: "S-08" }
    ],
    qrCodes: [
      { id: "QR-101", branchId: "60a1b2c3d4e5f6a7b8c9d0e1", status: "Assigned", tableId: "T-01", scansCount: 42, createdAt: "2026-06-01" },
      { id: "QR-102", branchId: "60a1b2c3d4e5f6a7b8c9d0e1", status: "Assigned", tableId: "T-02", scansCount: 28, createdAt: "2026-06-01" },
      { id: "QR-103", branchId: "60a1b2c3d4e5f6a7b8c9d0e1", status: "Assigned", tableId: "T-03", scansCount: 15, createdAt: "2026-06-02" },
      { id: "QR-104", branchId: "60a1b2c3d4e5f6a7b8c9d0e1", status: "Assigned", tableId: "T-04", scansCount: 8, createdAt: "2026-06-03" },
      { id: "QR-105", branchId: "60a1b2c3d4e5f6a7b8c9d0e2", status: "Assigned", tableId: "T-05", scansCount: 33, createdAt: "2026-06-03" },
      { id: "QR-106", branchId: "60a1b2c3d4e5f6a7b8c9d0e2", status: "Assigned", tableId: "T-06", scansCount: 19, createdAt: "2026-06-04" },
      { id: "QR-107", branchId: "60a1b2c3d4e5f6a7b8c9d0e2", status: "Assigned", tableId: "T-07", scansCount: 25, createdAt: "2026-06-04" },
      { id: "QR-108", branchId: "60a1b2c3d4e5f6a7b8c9d0e3", status: "Assigned", tableId: "T-08", scansCount: 12, createdAt: "2026-06-05" },
      { id: "QR-109", branchId: "60a1b2c3d4e5f6a7b8c9d0e3", status: "Assigned", tableId: "T-09", scansCount: 6, createdAt: "2026-06-05" },
      { id: "QR-110", branchId: "60a1b2c3d4e5f6a7b8c9d0e3", status: "Assigned", tableId: "T-10", scansCount: 14, createdAt: "2026-06-05" }
    ],
    branches: [
      {
        id: "60a1b2c3d4e5f6a7b8c9d0e1",
        branchCode: "BR-CHE-01",
        branchName: "Serviq Chennai Main Branch",
        branchManager: "Saravana Kumaran",
        mobileNumber: "9876543210",
        email: "chennai@serviq.com",
        address: "12 Connaught Place, T. Nagar",
        country: "India",
        state: "Tamil Nadu",
        city: "Chennai",
        pincode: "600017",
        openingDate: "2026-01-15",
        status: "Active",
        totalTables: 15,
        username: "branch_chennai",
        password: "branchpassword123",
        gstNumber: "33AAACS1234A1ZX",
        fssaiNumber: "12421008000123",
        operationalData: {
          tablesCount: 15,
          activeOrders: 12,
          staffCount: 14,
          kitchenStations: 3,
          todayRevenue: "₹24,500"
        }
      },
      {
        id: "60a1b2c3d4e5f6a7b8c9d0e2",
        branchCode: "BR-CBE-02",
        branchName: "Serviq Coimbatore Outlet",
        branchManager: "Karthik Raja",
        mobileNumber: "9876543220",
        email: "coimbatore@serviq.com",
        address: "45 Avinashi Road, Peelamedu",
        country: "India",
        state: "Tamil Nadu",
        city: "Coimbatore",
        pincode: "641004",
        openingDate: "2026-03-10",
        status: "Active",
        totalTables: 12,
        username: "branch_coimbatore",
        password: "branchpassword123",
        gstNumber: "33AAACS1234A2ZY",
        fssaiNumber: "12421008000456",
        operationalData: {
          tablesCount: 12,
          activeOrders: 8,
          staffCount: 10,
          kitchenStations: 2,
          todayRevenue: "₹18,200"
        }
      },
      {
        id: "60a1b2c3d4e5f6a7b8c9d0e3",
        branchCode: "BR-MDU-03",
        branchName: "Serviq Madurai Branch",
        branchManager: "Ramesh V.",
        mobileNumber: "9876543230",
        email: "madurai@serviq.com",
        address: "88 KK Nagar Main Road",
        country: "India",
        state: "Tamil Nadu",
        city: "Madurai",
        pincode: "625020",
        openingDate: "2026-05-01",
        status: "Active",
        totalTables: 10,
        username: "branch_madurai",
        password: "branchpassword123",
        gstNumber: "33AAACS1234A3ZZ",
        fssaiNumber: "12421008000789",
        operationalData: {
          tablesCount: 10,
          activeOrders: 6,
          staffCount: 8,
          kitchenStations: 2,
          todayRevenue: "₹12,800"
        }
      }
    ],
    billingData: [
      { table: "Table 01", branchId: "60a1b2c3d4e5f6a7b8c9d0e2", orders: 2, total: 756, status: "Unpaid" },
      { table: "Table 02", branchId: "60a1b2c3d4e5f6a7b8c9d0e1", orders: 3, total: 1239, status: "Unpaid" },
      { table: "Table 03", branchId: "60a1b2c3d4e5f6a7b8c9d0e1", orders: 1, total: 320, status: "Paid" },
      { table: "Table 05", branchId: "60a1b2c3d4e5f6a7b8c9d0e2", orders: 2, total: 924, status: "Unpaid" },
      { table: "Table 07", branchId: "60a1b2c3d4e5f6a7b8c9d0e1", orders: 4, total: 2121, status: "Partial" }
    ],
    billingHistory: [
      { id: "INV-10245", orderId: "ORD-845", table: "02", branchId: "60a1b2c3d4e5f6a7b8c9d0e1", date: "2026-08-19", time: "10:15 AM", amount: 1239, paymentMethod: "UPI", staff: "Arun", status: "Paid", items: [{ name: "Chicken Biryani", qty: 2, price: 320, total: 640 }, { name: "Dal Makhani", qty: 2, price: 160, total: 320 }, { name: "Paneer Tikka", qty: 1, price: 180, total: 180 }, { name: "Masala Chai", qty: 1, price: 40, total: 40 }], subtotal: 1180, tax: 59 },
      { id: "INV-10244", orderId: "ORD-844", table: "05", branchId: "60a1b2c3d4e5f6a7b8c9d0e2", date: "2026-08-19", time: "09:42 AM", amount: 924, paymentMethod: "Cash", staff: "Kumar", status: "Paid", items: [{ name: "Paneer Tikka", qty: 2, price: 180, total: 360 }, { name: "Chicken Biryani", qty: 1, price: 320, total: 320 }, { name: "Butter Naan", qty: 3, price: 40, total: 120 }, { name: "Masala Chai", qty: 2, price: 40, total: 80 }], subtotal: 880, tax: 44 },
      { id: "INV-10243", orderId: "ORD-843", table: "01", branchId: "60a1b2c3d4e5f6a7b8c9d0e2", date: "2026-08-19", time: "09:20 AM", amount: 756, paymentMethod: "Card", staff: "Ravi", status: "Paid", items: [{ name: "Masala Dosa", qty: 5, price: 120, total: 600 }, { name: "Filter Coffee", qty: 3, price: 40, total: 120 }], subtotal: 720, tax: 36 },
      { id: "INV-10242", orderId: "ORD-842", table: "03", branchId: "60a1b2c3d4e5f6a7b8c9d0e1", date: "2026-08-18", time: "08:15 PM", amount: 420, paymentMethod: "UPI", staff: "Arun", status: "Paid", items: [{ name: "Chicken Biryani", qty: 1, price: 320, total: 320 }, { name: "Masala Chai", qty: 2, price: 40, total: 80 }], subtotal: 400, tax: 20 },
      { id: "INV-10241", orderId: "ORD-841", table: "08", branchId: "60a1b2c3d4e5f6a7b8c9d0e3", date: "2026-08-18", time: "07:30 PM", amount: 2121, paymentMethod: "Cash", staff: "Vikram", status: "Paid", items: [{ name: "Chicken Biryani", qty: 4, price: 320, total: 1280 }, { name: "Dal Makhani", qty: 3, price: 160, total: 480 }, { name: "Paneer Tikka", qty: 1, price: 180, total: 180 }, { name: "Masala Chai", qty: 2, price: 40, total: 80 }], subtotal: 2020, tax: 101 }
    ],
    staff: [
      { id: "S-01", branchId: "60a1b2c3d4e5f6a7b8c9d0e1", name: "Ramesh Kumar", role: "Waiter", phone: "9876543210", email: "ramesh@serviq.com", status: "On Duty", password: "manager123" },
      { id: "S-02", branchId: "60a1b2c3d4e5f6a7b8c9d0e1", name: "Suresh Pillai", role: "Kitchen", phone: "9876543211", email: "suresh@serviq.com", status: "On Duty", password: "chef123" },
      { id: "S-03", branchId: "60a1b2c3d4e5f6a7b8c9d0e2", name: "Anitha Selvam", role: "Waiter", phone: "9876543212", email: "anitha@serviq.com", status: "On Duty", password: "waiter123" },
      { id: "S-04", branchId: "60a1b2c3d4e5f6a7b8c9d0e3", name: "Vikram Rathore", role: "Waiter", phone: "9876543213", email: "vikram@serviq.com", status: "Off Duty", password: "waiter456" },
      { id: "S-05", branchId: "60a1b2c3d4e5f6a7b8c9d0e2", name: "Priya Patel", role: "Kitchen", phone: "9876543214", email: "priya@serviq.com", status: "On Duty", password: "chef456" },
      { id: "S-06", branchId: "60a1b2c3d4e5f6a7b8c9d0e1", name: "Ravi M.", role: "Waiter", phone: "9876543215", email: "ravi@serviq.com", status: "On Duty", password: "waiter123" },
      { id: "S-07", branchId: "60a1b2c3d4e5f6a7b8c9d0e2", name: "Rahul S.", role: "Waiter", phone: "9876543216", email: "rahul@serviq.com", status: "On Duty", password: "waiter123" },
      { id: "S-08", branchId: "60a1b2c3d4e5f6a7b8c9d0e3", name: "Arjun K.", role: "Waiter", phone: "9876543217", email: "arjun@serviq.com", status: "On Duty", password: "waiter123" }
    ],
    users: [
      { id: "USR-001", branchId: "ALL", name: "Saravana Kumaran", email: "admin@saravana.com", phone: "+91 98765 43210", role: "Super Admin", status: "Active", lastLogin: "2026-06-02 12:45 PM" },
      { id: "USR-002", branchId: "60a1b2c3d4e5f6a7b8c9d0e1", name: "Ramesh Kumar", email: "ramesh.admin@serviq.com", phone: "+91 98765 11111", role: "Branch Admin", status: "Active", lastLogin: "2026-06-02 11:30 AM" },
      { id: "USR-003", branchId: "60a1b2c3d4e5f6a7b8c9d0e2", name: "Karthik Raja", email: "karthik.admin@serviq.com", phone: "+91 98765 22222", role: "Branch Admin", status: "Active", lastLogin: "2026-06-01 09:15 PM" },
      { id: "USR-004", branchId: "60a1b2c3d4e5f6a7b8c9d0e3", name: "Ramesh V.", email: "rameshv.admin@serviq.com", phone: "+91 98765 33333", role: "Branch Admin", status: "Active", lastLogin: "2026-05-30 08:20 AM" },
      { id: "USR-005", branchId: "60a1b2c3d4e5f6a7b8c9d0e1", name: "Suresh Pillai", email: "suresh.mgr@serviq.com", phone: "+91 98765 44444", role: "Manager", status: "Active", lastLogin: "2026-06-02 10:15 AM" }
    ],
    kitchenLogin: {
      email: "kitchen@saravana.com",
      password: "kitchen123"
    },
    inventory: [
      { id: "INV-001", sku: "ING-PNR-01", name: "Fresh Paneer (Cottage Cheese)", category: "Dairy", branchId: "60a1b2c3d4e5f6a7b8c9d0e1", currentStock: 12.5, minStockLevel: 5.0, unit: "kg", costPerUnit: 320, supplierName: "Nandini Dairy Supplies", supplierPhone: "+91 98450 12345", lastRestocked: "2026-08-14", status: "In Stock" },
      { id: "INV-002", sku: "ING-RCE-01", name: "Basmati Rice (Classic Grade A)", category: "Grains & Rice", branchId: "60a1b2c3d4e5f6a7b8c9d0e1", currentStock: 4.0, minStockLevel: 15.0, unit: "kg", costPerUnit: 110, supplierName: "Royal Grain Traders", supplierPhone: "+91 98765 43210", lastRestocked: "2026-08-10", status: "Low Stock" },
      { id: "INV-003", sku: "ING-OIL-01", name: "Refined Sunflower Cooking Oil", category: "Oils & Ghee", branchId: "60a1b2c3d4e5f6a7b8c9d0e1", currentStock: 28.0, minStockLevel: 10.0, unit: "L", costPerUnit: 145, supplierName: "Fortune Wholesale Agency", supplierPhone: "+91 98200 98765", lastRestocked: "2026-08-12", status: "In Stock" },
      { id: "INV-004", sku: "ING-CHK-01", name: "Fresh Chicken (Curry Cut)", category: "Meat & Poultry", branchId: "60a1b2c3d4e5f6a7b8c9d0e1", currentStock: 2.0, minStockLevel: 8.0, unit: "kg", costPerUnit: 220, supplierName: "Fresh Farms Hatchery", supplierPhone: "+91 99001 22334", lastRestocked: "2026-08-15", status: "Low Stock" },
      { id: "INV-005", sku: "ING-TOM-01", name: "Fresh Hybrid Tomatoes", category: "Vegetables", branchId: "60a1b2c3d4e5f6a7b8c9d0e1", currentStock: 22.0, minStockLevel: 10.0, unit: "kg", costPerUnit: 35, supplierName: "Mandi Fresh Produce", supplierPhone: "+91 94432 11223", lastRestocked: "2026-08-14", status: "In Stock" },
      { id: "INV-006", sku: "ING-TEA-01", name: "Premium Assam CTC Tea Leaves", category: "Beverages", branchId: "60a1b2c3d4e5f6a7b8c9d0e1", currentStock: 0.0, minStockLevel: 3.0, unit: "kg", costPerUnit: 420, supplierName: "Assam Valley Tea Co.", supplierPhone: "+91 97890 55443", lastRestocked: "2026-08-01", status: "Out of Stock" },
      { id: "INV-007", sku: "PKG-BOX-01", name: "Eco Meal Delivery Containers (3-CP)", category: "Packaging", branchId: "60a1b2c3d4e5f6a7b8c9d0e1", currentStock: 450, minStockLevel: 100, unit: "pcs", costPerUnit: 8.5, supplierName: "GreenPack Solutions", supplierPhone: "+91 98401 77665", lastRestocked: "2026-08-11", status: "In Stock" },
      { id: "INV-008", sku: "ING-BUT-01", name: "Pasteurized Salted Cooking Butter", category: "Dairy", branchId: "60a1b2c3d4e5f6a7b8c9d0e2", currentStock: 3.5, minStockLevel: 6.0, unit: "kg", costPerUnit: 480, supplierName: "Amul Distribution Hub", supplierPhone: "+91 98111 22334", lastRestocked: "2026-08-13", status: "Low Stock" },
      { id: "INV-009", sku: "ING-GAR-01", name: "Peeled Garlic Cloves", category: "Spices & Condiments", branchId: "60a1b2c3d4e5f6a7b8c9d0e2", currentStock: 14.0, minStockLevel: 5.0, unit: "kg", costPerUnit: 160, supplierName: "City Spice Mart", supplierPhone: "+91 98333 44556", lastRestocked: "2026-08-14", status: "In Stock" },
      { id: "INV-010", sku: "ING-MILK-01", name: "Full Cream Dairy Milk", category: "Dairy", branchId: "60a1b2c3d4e5f6a7b8c9d0e3", currentStock: 35.0, minStockLevel: 15.0, unit: "L", costPerUnit: 62, supplierName: "Aavin Dairy Milk", supplierPhone: "+91 98555 66778", lastRestocked: "2026-08-15", status: "In Stock" }
    ],
    inventoryLogs: [
      { id: "LOG-101", itemId: "INV-001", itemName: "Fresh Paneer (Cottage Cheese)", type: "Stock In", quantity: 10, unit: "kg", date: "2026-08-14 10:30 AM", reason: "Supplier Purchase", user: "Saravana Kumaran", notes: "Invoice #NDS-8834" },
      { id: "LOG-102", itemId: "INV-004", itemName: "Fresh Chicken (Curry Cut)", type: "Stock Out", quantity: 6, unit: "kg", date: "2026-08-15 11:45 AM", reason: "Kitchen Issue", user: "Suresh Pillai", notes: "Lunch prep biryani batch" },
      { id: "LOG-103", itemId: "INV-006", itemName: "Premium Assam CTC Tea Leaves", type: "Stock Out", quantity: 2, unit: "kg", date: "2026-08-14 06:00 PM", reason: "Kitchen Issue", user: "Ravi M.", notes: "Daily tea service" },
      { id: "LOG-104", itemId: "INV-003", itemName: "Refined Sunflower Cooking Oil", type: "Stock In", quantity: 20, unit: "L", date: "2026-08-12 02:15 PM", reason: "Supplier Purchase", user: "Saravana Kumaran", notes: "Invoice #FW-9021" }
    ],
    inventoryPurchases: [
      {
        id: "PUR-2026-001",
        itemId: "INV-001",
        itemName: "Fresh Paneer (Cottage Cheese)",
        category: "Dairy",
        branchId: "BR-001",
        supplierName: "Nandini Dairy Supplies",
        supplierPhone: "+91 98450 12345",
        supplierEmail: "orders@nandinidairy.com",
        quantity: 15.0,
        unit: "kg",
        unitPrice: 320,
        totalAmount: 4800,
        invoiceNumber: "INV-NDS-8834",
        purchaseDate: "2026-08-14",
        paymentStatus: "Paid",
        addedBy: "Saravana Kumaran",
        notes: "Morning dairy delivery batch A"
      },
      {
        id: "PUR-2026-002",
        itemId: "INV-003",
        itemName: "Refined Sunflower Cooking Oil",
        category: "Oils & Ghee",
        branchId: "BR-001",
        supplierName: "Fortune Wholesale Agency",
        supplierPhone: "+91 98200 98765",
        supplierEmail: "sales@fortunewholesale.in",
        quantity: 30.0,
        unit: "L",
        unitPrice: 145,
        totalAmount: 4350,
        invoiceNumber: "INV-FW-9021",
        purchaseDate: "2026-08-12",
        paymentStatus: "Paid",
        addedBy: "Saravana Kumaran",
        notes: "2 x 15L tin procurement"
      },
      {
        id: "PUR-2026-003",
        itemId: "INV-002",
        itemName: "Basmati Rice (Classic Grade A)",
        category: "Grains & Rice",
        branchId: "BR-001",
        supplierName: "Royal Grain Traders",
        supplierPhone: "+91 98765 43210",
        supplierEmail: "contact@royalgrains.com",
        quantity: 50.0,
        unit: "kg",
        unitPrice: 110,
        totalAmount: 5500,
        invoiceNumber: "INV-RGT-4102",
        purchaseDate: "2026-08-10",
        paymentStatus: "Paid",
        addedBy: "Suresh Pillai",
        notes: "2 bags 25kg aged basmati"
      },
      {
        id: "PUR-2026-004",
        itemId: "INV-005",
        itemName: "Fresh Hybrid Tomatoes",
        category: "Vegetables",
        branchId: "BR-001",
        supplierName: "Mandi Fresh Produce",
        supplierPhone: "+91 94432 11223",
        supplierEmail: "mandifresh@gmail.com",
        quantity: 30.0,
        unit: "kg",
        unitPrice: 35,
        totalAmount: 1050,
        invoiceNumber: "INV-MFP-1092",
        purchaseDate: "2026-08-14",
        paymentStatus: "Paid",
        addedBy: "Saravana Kumaran",
        notes: "Daily fresh veggies crate"
      }
    ],
    inventoryReductions: [
      {
        id: "RED-2026-001",
        itemId: "INV-004",
        itemName: "Fresh Chicken (Curry Cut)",
        category: "Meat & Poultry",
        branchId: "BR-001",
        quantity: 4.0,
        unit: "kg",
        remainingStock: 2.0,
        reason: "Kitchen Usage",
        date: "2026-08-15 11:45 AM",
        reducedBy: "Suresh Pillai",
        notes: "Lunch special biryani preparation"
      },
      {
        id: "RED-2026-002",
        itemId: "INV-005",
        itemName: "Fresh Hybrid Tomatoes",
        category: "Vegetables",
        branchId: "BR-001",
        quantity: 2.5,
        unit: "kg",
        remainingStock: 22.0,
        reason: "Wastage",
        date: "2026-08-15 09:30 AM",
        reducedBy: "Ravi M.",
        notes: "Trimming waste and soft/damaged pieces"
      },
      {
        id: "RED-2026-003",
        itemId: "INV-006",
        itemName: "Premium Assam CTC Tea Leaves",
        category: "Beverages",
        branchId: "BR-001",
        quantity: 1.0,
        unit: "kg",
        remainingStock: 0.0,
        reason: "Expired",
        date: "2026-08-14 06:00 PM",
        reducedBy: "Saravana Kumaran",
        notes: "Moisture leak spoiled remaining tea pack"
      },
      {
        id: "RED-2026-004",
        itemId: "INV-007",
        itemName: "Eco Meal Delivery Containers (3-CP)",
        category: "Packaging",
        branchId: "BR-001",
        quantity: 25.0,
        unit: "pcs",
        remainingStock: 450,
        reason: "Damage",
        date: "2026-08-13 03:20 PM",
        reducedBy: "Arjun K.",
        notes: "Crushed carton box during transit"
      },
      {
        id: "RED-2026-005",
        itemId: "INV-001",
        itemName: "Fresh Paneer (Cottage Cheese)",
        category: "Dairy",
        branchId: "BR-001",
        quantity: 2.5,
        unit: "kg",
        remainingStock: 12.5,
        reason: "Manual Adjustment",
        date: "2026-08-12 10:00 PM",
        reducedBy: "Saravana Kumaran",
        notes: "End of day physical scale recount"
      }
    ],
    inventoryCategories: [
      { id: "INV-CAT-001", name: "Dairy", description: "Milk, butter, paneer, cream, yogurt", status: "AVAILABLE" },
      { id: "INV-CAT-002", name: "Grains & Rice", description: "Basmati rice, wheat flour, grains, pulses", status: "AVAILABLE" },
      { id: "INV-CAT-003", name: "Oils & Ghee", description: "Cooking oil, mustard oil, pure desi ghee", status: "AVAILABLE" },
      { id: "INV-CAT-004", name: "Meat & Poultry", description: "Fresh chicken, mutton, seafood", status: "AVAILABLE" },
      { id: "INV-CAT-005", name: "Vegetables", description: "Farm fresh onions, tomatoes, potatoes, herbs", status: "AVAILABLE" },
      { id: "INV-CAT-006", name: "Spices & Condiments", description: "Cardamom, clove, whole & ground spices", status: "AVAILABLE" },
      { id: "INV-CAT-007", name: "Beverages", description: "Tea leaves, coffee beans, syrups, juices", status: "AVAILABLE" },
      { id: "INV-CAT-008", name: "Packaging", description: "Containers, paper bags, foil rolls, cups", status: "AVAILABLE" }
    ],
    categories: ['Starters', 'Rice Meals', 'Tiffin', 'Rotis', 'Desserts', 'Drinks'],
    roles: {
      Admin: {
        permissions: {
          overview: { view: true, add: true, edit: true, delete: true },
          'branch-management': { view: true, add: true, edit: true, delete: true },
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
          'branch-management': { view: true, add: true, edit: true, delete: false },
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
    logo: "/logo.png",
    banner: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=60",
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
    tables: [],
    qrCodes: [
      { id: "QR-201", status: "Assigned", tableId: "T-01", scansCount: 12, createdAt: "2026-06-01" },
      { id: "QR-202", status: "Assigned", tableId: "T-02", scansCount: 19, createdAt: "2026-06-01" },
      { id: "QR-203", status: "Assigned", tableId: "T-03", scansCount: 4, createdAt: "2026-06-02" },
      { id: "QR-204", status: "Assigned", tableId: "T-04", scansCount: 25, createdAt: "2026-06-02" },
      { id: "QR-205", status: "Assigned", tableId: "T-05", scansCount: 8, createdAt: "2026-06-03" },
      { id: "QR-206", status: "Assigned", tableId: "T-06", scansCount: 0, createdAt: "2026-06-03" },
      { id: "QR-207", status: "Assigned", tableId: "T-07", scansCount: 14, createdAt: "2026-06-04" },
      { id: "QR-208", status: "Assigned", tableId: "T-08", scansCount: 30, createdAt: "2026-06-04" },
      { id: "QR-209", status: "Unassigned", tableId: null, scansCount: 0, createdAt: "2026-06-05" }
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
    logo: "/logo.png",
    banner: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=60",
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
    tables: [],
    qrCodes: [
      { id: "QR-301", status: "Assigned", tableId: "T-01", scansCount: 5, createdAt: "2026-06-01" },
      { id: "QR-302", status: "Assigned", tableId: "T-02", scansCount: 2, createdAt: "2026-06-01" },
      { id: "QR-303", status: "Assigned", tableId: "T-03", scansCount: 0, createdAt: "2026-06-02" },
      { id: "QR-304", status: "Assigned", tableId: "T-04", scansCount: 11, createdAt: "2026-06-02" }
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
    tables: [],
    qrCodes: [
      { id: "QR-401", status: "Assigned", tableId: "T-01", scansCount: 0, createdAt: "2026-06-01" },
      { id: "QR-402", status: "Assigned", tableId: "T-02", scansCount: 0, createdAt: "2026-06-01" }
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

