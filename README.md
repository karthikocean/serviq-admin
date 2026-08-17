# Serviq – SaaS Restaurant Ordering and Management Panel

Serviq is a beautiful, highly interactive Single Page Application (SPA) showcasing the end-to-end workflows of a QR-code-based restaurant ordering and management platform. It incorporates both the **Restaurant Admin Panel** and a fully functional **Customer Ordering Simulator** to demonstrate real-time workflow status changes.

## 🚀 Features Implemented

### 1. Customer Workflow Simulator
Built inside a beautiful smartphone device mockup that can be toggled on/off, allowing you to walk through the entire customer flow side-by-side with the Admin dashboard:
- **QR Landing Screen**: Table selection dropdown (simulating the physical QR code scan) and a branding welcome display.
- **Menu Browsing Screen**: Live catalog showing items grouped by category with search filtering.
- **Food Item Detail Modal**: Quantity controller and custom cooking instruction fields.
- **Cart Screen**: Subtotal, GST (5% tax), Service Charge (2%) automatically calculated, notes, and a submit button.
- **Order Confirmation & Tracking**: Real-time progress bar showing order states (`Order Received` ➔ `Preparing` ➔ `Ready to Serve` ➔ `Served`).

### 2. Admin Workspace Dashboard
- **Admin Login Screen**: Secure-looking login interface. (Use credentials: **Email**: `admin@serviq.com` / **Password**: `admin123`).
- **Dashboard Overview Panel**:
  - Highlights critical KPIs: **Total Revenue**, **Total Orders Count**, **Active Dining Tables**, and **Pending kitchen orders**.
  - Dynamic interactive SVG graph depicting daily sales analytics.
  - Recent activity logs highlighting the latest orders placed.
- **Incoming Orders Pipeline (KDS)**:
  - Kanban-style board categorizing live orders into: `Incoming Orders`, `Preparing in Kitchen`, `Ready to Serve`, and `Served/Delivered`.
  - Actions to advance order status: `Prepare` (Pending ➔ Preparing), `Ready` (Preparing ➔ Ready), `Serve` (Ready ➔ Served).
  - Status updates instantly update the Customer Simulator tracking step.
- **Menu Management Panel**:
  - Live CRUD table of food items.
  - Add and Edit dishes with a modal form.
  - Real-time **Availability control toggle** (instantly removes/restores the dish on the customer ordering menu).
- **Billing & Invoice Panel**:
  - Formulates receipt details automatically for completed services.
  - Detailed GST/tax computations.
  - Actions to mark receipts as "Paid", which immediately updates Dashboard revenue statistics.
- **SaaS Settings Panel**:
  - Custom branding changes (modify name, tagline, currency codes, table limits).
  - Dedicated QR Code Generator that updates links/print-outs based on the selected table number.

---

## 🛠️ Technology Stack
- **Structure**: Semantic HTML5 markup
- **Styling**: Modern CSS3 using Custom Properties (CSS variables), Flex box, CSS Grid layouts, and custom keyframe animations.
- **Logic**: Vanilla JavaScript managing application state, client-side routing, and real-time simulator updates.

---

## 💻 How to Run
1. Open the project folder `D:\Nivi folder\serviq-super-admin`.
2. Open `index.html` in any web browser of your choice, or run a local development server.
3. Log in using:
   - **Email**: `admin@serviq.com`
   - **Password**: `admin123`
4. Click **Toggle Customer Simulator** in the header to display the simulated smartphone panel. Try placing an order, then processing it in the Admin Dashboard!
