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
    settings: {
      name: "Serviq",
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
      { id: "menu-7", name: "Butter Naan", category: "Rotis", price: 40, desc: "Soft leavened tandoori flatbread brushed with generous butter.", image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500&auto=format&fit=crop&q=60", available: true, veg: true, bestseller: false },
      { id: "menu-8", name: "Lassi", category: "Drinks", price: 60, desc: "Chilled yogurt beverage blended sweet with cardamom and rose water.", image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=500&auto=format&fit=crop&q=60", available: true, veg: true, bestseller: false }
    ],
    orders: [
      { id: "847", table: "03", time: "1:28 PM", timeAgo: "2 min ago", items: [{ name: "Chicken Biryani", qty: 1, price: 320 }, { name: "Masala Chai", qty: 2, price: 40 }], notes: "Less spicy please", subtotal: 400, tax: 10, charge: 0, total: 420, status: "new", billingStatus: "unpaid", waiter: "Unassigned" },
      { id: "846", table: "07", time: "1:22 PM", timeAgo: "8 min ago", items: [{ name: "Chicken Biryani", qty: 4, price: 320 }, { name: "Dal Makhani", qty: 3, price: 160 }, { name: "Paneer Tikka", qty: 1, price: 180 }, { name: "Masala Chai", qty: 2, price: 40 }], notes: "", subtotal: 2020, tax: 101, charge: 0, total: 2121, status: "preparing", billingStatus: "unpaid", waiter: "Ravi M." },
      { id: "845", table: "01", time: "1:15 PM", timeAgo: "15 min ago", items: [{ name: "Masala Dosa", qty: 5, price: 120 }, { name: "Filter Coffee", qty: 3, price: 40 }], notes: "Allergy: peanuts", subtotal: 720, tax: 36, charge: 0, total: 756, status: "preparing", billingStatus: "unpaid", waiter: "Rahul S." },
      { id: "844", table: "05", time: "1:08 PM", timeAgo: "22 min ago", items: [{ name: "Paneer Tikka", qty: 2, price: 180 }, { name: "Chicken Biryani", qty: 1, price: 320 }, { name: "Butter Naan", qty: 3, price: 40 }, { name: "Masala Chai", qty: 2, price: 40 }], notes: "", subtotal: 880, tax: 44, charge: 0, total: 924, status: "ready", billingStatus: "unpaid", waiter: "Arjun K." },
      { id: "843", table: "02", time: "1:00 PM", timeAgo: "30 min ago", items: [{ name: "Veg Thali", qty: 2, price: 120 }, { name: "Masala Chai", qty: 3, price: 40 }], notes: "", subtotal: 360, tax: 18, charge: 0, total: 378, status: "done", billingStatus: "paid", waiter: "Ravi M." },
      { id: "842", table: "02", time: "12:55 PM", timeAgo: "35 min ago", items: [{ name: "Chicken Biryani", qty: 2, price: 320 }, { name: "Dal Makhani", qty: 2, price: 160 }, { name: "Paneer Tikka", qty: 1, price: 180 }, { name: "Masala Chai", qty: 1, price: 40 }], notes: "", subtotal: 1180, tax: 59, charge: 0, total: 1239, status: "preparing", billingStatus: "unpaid", waiter: "Ravi M." }
    ],
    tables: [
      { id: "T-01", status: "Occupied", seats: 4, assignedQrId: "QR-101" },
      { id: "T-02", status: "Occupied", seats: 2, assignedQrId: "QR-102" },
      { id: "T-03", status: "Occupied", seats: 4, assignedQrId: "QR-103" },
      { id: "T-04", status: "Free", seats: 6, assignedQrId: "QR-104" },
      { id: "T-05", status: "Occupied", seats: 2, assignedQrId: "QR-105" }
    ],
    qrCodes: [
      { id: "QR-101", status: "Assigned", tableId: "T-01", scansCount: 42, createdAt: "2026-06-01" },
      { id: "QR-102", status: "Assigned", tableId: "T-02", scansCount: 28, createdAt: "2026-06-01" },
      { id: "QR-103", status: "Assigned", tableId: "T-03", scansCount: 15, createdAt: "2026-06-02" },
      { id: "QR-104", status: "Assigned", tableId: "T-04", scansCount: 8, createdAt: "2026-06-03" },
      { id: "QR-105", status: "Assigned", tableId: "T-05", scansCount: 33, createdAt: "2026-06-03" },
      { id: "QR-106", status: "Unassigned", tableId: null, scansCount: 0, createdAt: "2026-06-05" },
      { id: "QR-107", status: "Unassigned", tableId: null, scansCount: 0, createdAt: "2026-06-05" }
    ],
    billingData: [
      { table: "Table 01", orders: 2, total: 756, status: "Unpaid" },
      { table: "Table 02", orders: 3, total: 1239, status: "Unpaid" },
      { table: "Table 03", orders: 1, total: 320, status: "Paid" },
      { table: "Table 05", orders: 2, total: 924, status: "Unpaid" },
      { table: "Table 07", orders: 4, total: 2121, status: "Partial" }
    ],
    staff: [
      { id: "S-01", name: "Ramesh Kumar", role: "Waiter", phone: "9876543210", email: "ramesh@serviq.com", status: "On Duty", password: "manager123" },
      { id: "S-02", name: "Suresh Pillai", role: "Kitchen", phone: "9876543211", email: "suresh@serviq.com", status: "On Duty", password: "chef123" },
      { id: "S-03", name: "Anitha Selvam", role: "Waiter", phone: "9876543212", email: "anitha@serviq.com", status: "On Duty", password: "waiter123" },
      { id: "S-04", name: "Vikram Rathore", role: "Waiter", phone: "9876543213", email: "vikram@serviq.com", status: "Off Duty", password: "waiter456" },
      { id: "S-05", name: "Priya Patel", role: "Kitchen", phone: "9876543214", email: "priya@serviq.com", status: "On Duty", password: "chef456" },
      { id: "S-06", name: "Ravi M.", role: "Waiter", phone: "9876543215", email: "ravi@serviq.com", status: "On Duty", password: "waiter123" },
      { id: "S-07", name: "Rahul S.", role: "Waiter", phone: "9876543216", email: "rahul@serviq.com", status: "On Duty", password: "waiter123" },
      { id: "S-08", name: "Arjun K.", role: "Waiter", phone: "9876543217", email: "arjun@serviq.com", status: "On Duty", password: "waiter123" }
    ],
    kitchenLogin: {
      email: "kitchen@saravana.com",
      password: "kitchen123"
    },
    categories: ['Starters', 'Rice Meals', 'Tiffin', 'Rotis', 'Desserts', 'Drinks'],
    roles: {
      Admin: {
        permissions: {
          overview: { view: true, add: true, edit: true, delete: true },
          orders: { view: true, add: true, edit: true, delete: true },
          menu: { view: true, add: true, edit: true, delete: true },
          tables: { view: true, add: true, edit: true, delete: true },
          billing: { view: true, add: true, edit: true, delete: true },
          waiter: { view: true, add: true, edit: true, delete: true },
          kitchen: { view: true, add: true, edit: true, delete: true },
          reports: { view: true, add: true, edit: true, delete: true },
          users: { view: true, add: true, edit: true, delete: true },
          'roles-permissions': { view: true, add: true, edit: true, delete: true },
          settings: { view: true, add: true, edit: true, delete: true }
        }
      },
      Manager: {
        permissions: {
          overview: { view: true, add: false, edit: false, delete: false },
          orders: { view: true, add: true, edit: true, delete: true },
          menu: { view: true, add: true, edit: true, delete: false },
          tables: { view: true, add: true, edit: true, delete: false },
          billing: { view: true, add: true, edit: true, delete: false },
          waiter: { view: true, add: true, edit: true, delete: false },
          kitchen: { view: true, add: true, edit: true, delete: false },
          reports: { view: true, add: false, edit: false, delete: false },
          users: { view: true, add: true, edit: true, delete: false },
          'roles-permissions': { view: false, add: false, edit: false, delete: false },
          settings: { view: false, add: false, edit: false, delete: false }
        }
      },
      Waiter: {
        permissions: {
          overview: { view: false, add: false, edit: false, delete: false },
          orders: { view: true, add: true, edit: true, delete: false },
          menu: { view: false, add: false, edit: false, delete: false },
          tables: { view: true, add: false, edit: true, delete: false },
          billing: { view: false, add: false, edit: false, delete: false },
          waiter: { view: true, add: false, edit: false, delete: false },
          kitchen: { view: false, add: false, edit: false, delete: false },
          reports: { view: false, add: false, edit: false, delete: false },
          users: { view: false, add: false, edit: false, delete: false },
          'roles-permissions': { view: false, add: false, edit: false, delete: false },
          settings: { view: false, add: false, edit: false, delete: false }
        }
      },
      Kitchen: {
        permissions: {
          overview: { view: false, add: false, edit: false, delete: false },
          orders: { view: true, add: false, edit: true, delete: false },
          menu: { view: false, add: false, edit: false, delete: false },
          tables: { view: false, add: false, edit: false, delete: false },
          billing: { view: false, add: false, edit: false, delete: false },
          waiter: { view: false, add: false, edit: false, delete: false },
          kitchen: { view: true, add: false, edit: true, delete: false },
          reports: { view: false, add: false, edit: false, delete: false },
          users: { view: false, add: false, edit: false, delete: false },
          'roles-permissions': { view: false, add: false, edit: false, delete: false },
          settings: { view: false, add: false, edit: false, delete: false }
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
    tables: [
      { id: "T-01", status: "Free", seats: 4, assignedQrId: "QR-201" },
      { id: "T-02", status: "Occupied", seats: 2, assignedQrId: "QR-202" },
      { id: "T-03", status: "Free", seats: 4, assignedQrId: "QR-203" },
      { id: "T-04", status: "Occupied", seats: 6, assignedQrId: "QR-204" },
      { id: "T-05", status: "Free", seats: 4, assignedQrId: "QR-205" },
      { id: "T-06", status: "Free", seats: 2, assignedQrId: "QR-206" },
      { id: "T-07", status: "Free", seats: 4, assignedQrId: "QR-207" },
      { id: "T-08", status: "Free", seats: 8, assignedQrId: "QR-208" }
    ],
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
    tables: [
      { id: "T-01", status: "Occupied", seats: 4, assignedQrId: "QR-301" },
      { id: "T-02", status: "Free", seats: 4, assignedQrId: "QR-302" },
      { id: "T-03", status: "Free", seats: 4, assignedQrId: "QR-303" },
      { id: "T-04", status: "Free", seats: 2, assignedQrId: "QR-304" }
    ],
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
    tables: [
      { id: "T-01", status: "Free", seats: 4, assignedQrId: "QR-401" },
      { id: "T-02", status: "Free", seats: 4, assignedQrId: "QR-402" }
    ],
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
