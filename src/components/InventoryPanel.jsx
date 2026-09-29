import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppState } from '../config/AppContext';
import InventoryApi from '../api/Inventory';
import InventoryCategoryApi from '../api/InventoryCategory';
import BranchApi from '../api/Branch';
import { Modal } from './Modal';
import ShowNotifications from '../helper/ShowNotifications';
import { formatDateTimeDMY } from '../helper/DateHelper.js';

// SVG Icons
const BoxIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
    <line x1="12" y1="22.08" x2="12" y2="12"></line>
  </svg>
);

const PlusIcon = ({ size = 15, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const SearchIcon = ({ size = 15, color = '#64748b' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const PencilIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
    <path d="m15 5 4 4"></path>
  </svg>
);

const TrashIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18"></path>
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
  </svg>
);

const EyeIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const CheckCircleIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

const XCircleIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="15" y1="9" x2="9" y2="15"></line>
    <line x1="9" y1="9" x2="15" y2="15"></line>
  </svg>
);

const TruckIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13"></rect>
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
    <circle cx="5.5" cy="18.5" r="2.5"></circle>
    <circle cx="18.5" cy="18.5" r="2.5"></circle>
  </svg>
);

const DownloadIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

const BuildingIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
    <path d="M9 22v-4h6v4"></path>
    <line x1="8" y1="6" x2="10" y2="6"></line>
    <line x1="14" y1="6" x2="16" y2="6"></line>
  </svg>
);

const StoreFrontIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

// Initial Mock Datasets
const INITIAL_INVENTORY_ITEMS = [
  { id: 'INV-001', name: 'Basmati Rice', category: 'Grains', unit: 'kg', minStock: 50, centralStock: 250, branchStock: 35, status: 'Active' },
  { id: 'INV-002', name: 'Refined Oil', category: 'Oils', unit: 'Ltr', minStock: 30, centralStock: 120, branchStock: 15, status: 'Active' },
  { id: 'INV-003', name: 'Garam Masala', category: 'Spices', unit: 'kg', minStock: 10, centralStock: 45, branchStock: 8, status: 'Active' },
  { id: 'INV-004', name: 'Chicken Breast', category: 'Meat', unit: 'kg', minStock: 25, centralStock: 0, branchStock: 0, status: 'Active' },
  { id: 'INV-005', name: 'Fresh Milk', category: 'Dairy', unit: 'Ltr', minStock: 40, centralStock: 80, branchStock: 42, status: 'Active' },
  { id: 'INV-006', name: 'Paneer (Cottage Cheese)', category: 'Dairy', unit: 'kg', minStock: 15, centralStock: 30, branchStock: 5, status: 'Active' },
];

const INITIAL_PURCHASES = [
  { id: 'PUR-101', purchaseNo: 'PO-2026-001', supplier: 'Metro Cash & Carry', date: '2026-09-26', invoiceNo: 'INV-8891', item: 'Basmati Rice', quantity: 200, unit: 'kg', rate: 90, total: 18000, remarks: 'Bulk Monthly Purchase', status: 'Completed' },
  { id: 'PUR-102', purchaseNo: 'PO-2026-002', supplier: 'Fortune Oils Ltd', date: '2026-09-27', invoiceNo: 'INV-4421', item: 'Refined Oil', quantity: 100, unit: 'Ltr', rate: 140, total: 14000, remarks: 'Cooking Oil Stock', status: 'Completed' },
];

const INITIAL_BRANCH_REQUESTS = [
  { id: 'REQ-501', requestNo: 'BR-REQ-001', branch: 'Serviq Chennai Branch', date: '2026-09-28', item: 'Basmati Rice', reqQty: 50, appQty: 50, distQty: 0, unit: 'kg', status: 'Pending', remarks: 'Weekend Demand Spike' },
  { id: 'REQ-502', requestNo: 'BR-REQ-002', branch: 'Serviq Madurai Branch', date: '2026-09-27', item: 'Refined Oil', reqQty: 25, appQty: 25, distQty: 25, unit: 'Ltr', status: 'Completed', remarks: 'Regular Weekly Restock' },
];

const INITIAL_DISTRIBUTIONS = [
  { id: 'DIST-201', distNo: 'DIST-2026-001', requestNo: 'BR-REQ-002', branch: 'Serviq Madurai Branch', item: 'Refined Oil', distQty: 25, date: '2026-09-27', status: 'Dispatched', remarks: 'Sent via Express Logistics' }
];

const INITIAL_TRANSFERS = [
  { id: 'TRF-301', transferNo: 'TRF-2026-001', fromBranch: 'Serviq Chennai Branch', toBranch: 'Serviq Madurai Branch', date: '2026-09-28', item: 'Fresh Milk', quantity: 10, unit: 'Ltr', status: 'Pending', remarks: 'Inter-branch emergency transfer' }
];

const INITIAL_RECEIPTS = [
  { id: 'REC-401', receiptNo: 'REC-2026-001', refNo: 'DIST-2026-001', source: 'Central Warehouse', item: 'Refined Oil', sentQty: 25, recQty: 25, date: '2026-09-27', status: 'Received', remarks: 'Verified & Verified Goods' }
];

const INITIAL_TRANSACTIONS = [
  { id: 'TXN-901', txnNo: 'TXN-2026-001', date: '2026-09-26 10:30 AM', type: 'Purchase', item: 'Basmati Rice', quantity: 200, unit: 'kg', source: 'Supplier: Metro', destination: 'Central Stock', refNo: 'PO-2026-001', status: 'Completed' },
  { id: 'TXN-902', txnNo: 'TXN-2026-002', date: '2026-09-27 02:15 PM', type: 'Distribution', item: 'Refined Oil', quantity: 25, unit: 'Ltr', source: 'Central Warehouse', destination: 'Serviq Madurai Branch', refNo: 'DIST-2026-001', status: 'Dispatched' }
];

export default function InventoryPanel() {
  const { currentUser, activeRestaurant, selectedBranchId } = useAppState();

  // Scope State: ONLY 'COMPANY' selected in header gets Company HQ View.
  // All other selections (Spice Route Restaurant, individual outlets) get Branch Login View.
  const isCompanySelected = selectedBranchId === 'COMPANY' || selectedBranchId === 'Company';
  const scope = isCompanySelected ? 'COMPANY' : 'BRANCH';

  const location = useLocation();

  // Sub-Module Active Tab State
  // Company tabs: 'items' | 'central-stock' | 'purchases' | 'branch-requests' | 'distribution' | 'transactions'
  // Branch tabs:  'my-stock' | 'stock-request' | 'branch-transfer' | 'direct-purchase' | 'stock-receipt' | 'transactions'
  const [companyTab, setCompanyTab] = useState('items');
  const [branchTab, setBranchTab] = useState('my-stock');

  // Sync tab with URL search parameter (?tab=...)
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      if (['items', 'central-stock', 'purchases', 'branch-requests', 'distribution', 'stock-distribution', 'transactions'].includes(tabParam)) {
        setCompanyTab(tabParam === 'stock-distribution' ? 'distribution' : tabParam);
      }
      if (['my-stock', 'stock-request', 'branch-transfer', 'direct-purchase', 'stock-receipt', 'transactions'].includes(tabParam)) {
        setBranchTab(tabParam);
      }
    }
  }, [location.search]);

  // Datasets State
  const [items, setItems] = useState(INITIAL_INVENTORY_ITEMS);
  const [purchases, setPurchases] = useState(INITIAL_PURCHASES);
  const [branchRequests, setBranchRequests] = useState(INITIAL_BRANCH_REQUESTS);
  const [distributions, setDistributions] = useState(INITIAL_DISTRIBUTIONS);
  const [transfers, setTransfers] = useState(INITIAL_TRANSFERS);
  const [receipts, setReceipts] = useState(INITIAL_RECEIPTS);
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);

  // Common Filter / Search States
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [itemFilter, setItemFilter] = useState('All');
  const [supplierFilter, setSupplierFilter] = useState('All');
  const [branchFilter, setBranchFilter] = useState('All');
  const [txnTypeFilter, setTxnTypeFilter] = useState('All');
  
  // Purchases Filters & Details View State
  const [purchaseSupplierFilter, setPurchaseSupplierFilter] = useState('All');
  const [purchaseStartDateFilter, setPurchaseStartDateFilter] = useState('');
  const [purchaseEndDateFilter, setPurchaseEndDateFilter] = useState('');
  const [purchaseItemFilter, setPurchaseItemFilter] = useState('All');
  const [isPurchaseDetailModalOpen, setIsPurchaseDetailModalOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);

  // Stock Distribution Detail State
  const [isDistDetailModalOpen, setIsDistDetailModalOpen] = useState(false);
  const [selectedDistribution, setSelectedDistribution] = useState(null);

  // Transaction Detail State
  const [isTxnDetailModalOpen, setIsTxnDetailModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  // Transaction Filters State
  const [txnStartDateFilter, setTxnStartDateFilter] = useState('');
  const [txnEndDateFilter, setTxnEndDateFilter] = useState('');
  const [txnItemFilter, setTxnItemFilter] = useState('All');
  const [txnBranchFilter, setTxnBranchFilter] = useState('All');
  const [txnStatusFilter, setTxnStatusFilter] = useState('All');

  // Branch Requests Filters State
  const [reqBranchFilter, setReqBranchFilter] = useState('All');
  const [reqStatusFilter, setReqStatusFilter] = useState('All');
  const [reqStartDateFilter, setReqStartDateFilter] = useState('');
  const [reqEndDateFilter, setReqEndDateFilter] = useState('');

  const [page, setPage] = useState(0);
  const limit = 10;

  // Reset pagination on filter change
  useEffect(() => {
    setPage(0);
  }, [searchTerm, categoryFilter, statusFilter, itemFilter, supplierFilter, branchFilter, txnTypeFilter, purchaseSupplierFilter, purchaseStartDateFilter, purchaseEndDateFilter, purchaseItemFilter, reqBranchFilter, reqStatusFilter, reqStartDateFilter, reqEndDateFilter, txnStartDateFilter, txnEndDateFilter, txnItemFilter, txnBranchFilter, txnStatusFilter, companyTab, branchTab, scope]);

  // Filtered Purchases Memo
  const filteredPurchases = useMemo(() => {
    return purchases.filter(p => {
      const matchesSearch = !searchTerm.trim() ||
        p.purchaseNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.invoiceNo && p.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesSupplier = purchaseSupplierFilter === 'All' || p.supplier === purchaseSupplierFilter;
      const matchesItem = purchaseItemFilter === 'All' || p.item === purchaseItemFilter;

      let matchesDate = true;
      if (purchaseStartDateFilter) {
        matchesDate = matchesDate && p.date >= purchaseStartDateFilter;
      }
      if (purchaseEndDateFilter) {
        matchesDate = matchesDate && p.date <= purchaseEndDateFilter;
      }

      return matchesSearch && matchesSupplier && matchesItem && matchesDate;
    });
  }, [purchases, searchTerm, purchaseSupplierFilter, purchaseItemFilter, purchaseStartDateFilter, purchaseEndDateFilter]);

  // Filtered Branch Requests Memo
  const filteredBranchRequests = useMemo(() => {
    return branchRequests.filter(r => {
      const matchesSearch = !searchTerm.trim() ||
        r.requestNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.branch.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.item.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesBranch = reqBranchFilter === 'All' || r.branch === reqBranchFilter;
      const matchesStatus = reqStatusFilter === 'All' || r.status === reqStatusFilter;

      let matchesDate = true;
      if (reqStartDateFilter) {
        matchesDate = matchesDate && r.date >= reqStartDateFilter;
      }
      if (reqEndDateFilter) {
        matchesDate = matchesDate && r.date <= reqEndDateFilter;
      }

      return matchesSearch && matchesBranch && matchesStatus && matchesDate;
    });
  }, [branchRequests, searchTerm, reqBranchFilter, reqStatusFilter, reqStartDateFilter, reqEndDateFilter]);

  // Filtered Transactions Memo
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = !searchTerm.trim() ||
        t.txnNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.refNo && t.refNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.source && t.source.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.destination && t.destination.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesType = txnTypeFilter === 'All' || t.type === txnTypeFilter;
      const matchesItem = txnItemFilter === 'All' || t.item === txnItemFilter;
      const matchesBranch = txnBranchFilter === 'All' ||
        (t.source && t.source.toLowerCase().includes(txnBranchFilter.toLowerCase())) ||
        (t.destination && t.destination.toLowerCase().includes(txnBranchFilter.toLowerCase()));
      const matchesStatus = txnStatusFilter === 'All' || (t.status || 'Completed') === txnStatusFilter;

      let matchesDate = true;
      if (txnStartDateFilter) {
        const dateStr = t.date ? t.date.split(' ')[0] : '';
        matchesDate = matchesDate && dateStr >= txnStartDateFilter;
      }
      if (txnEndDateFilter) {
        const dateStr = t.date ? t.date.split(' ')[0] : '';
        matchesDate = matchesDate && dateStr <= txnEndDateFilter;
      }

      return matchesSearch && matchesType && matchesItem && matchesBranch && matchesStatus && matchesDate;
    });
  }, [transactions, searchTerm, txnTypeFilter, txnItemFilter, txnBranchFilter, txnStatusFilter, txnStartDateFilter, txnEndDateFilter]);

  // -------------------------------------------------------------
  // MODALS & FORMS STATES WITH INLINE VALIDATION
  // -------------------------------------------------------------
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemForm, setItemForm] = useState({ name: '', category: 'Grains', unit: 'kg', minStock: '', status: 'Active' });
  const [itemErrors, setItemErrors] = useState({});

  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [purchaseForm, setPurchaseForm] = useState({ supplier: '', purchaseDate: new Date().toISOString().split('T')[0], invoiceNo: '', item: 'Basmati Rice', quantity: '', unit: 'kg', rate: '', remarks: '' });
  const [purchaseErrors, setPurchaseErrors] = useState({});

  const handlePurchaseItemChange = (itemName) => {
    const matchedItem = items.find(i => i.name === itemName);
    setPurchaseForm(prev => ({
      ...prev,
      item: itemName,
      unit: matchedItem ? matchedItem.unit : (prev.unit || 'kg')
    }));
  };

  const [isStockRequestModalOpen, setIsStockRequestModalOpen] = useState(false);
  const [stockReqForm, setStockReqForm] = useState({ item: 'Basmati Rice', reqQty: '', unit: 'kg', remarks: '' });
  const [stockReqErrors, setStockReqErrors] = useState({});

  const [isRequestDetailModalOpen, setIsRequestDetailModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const [isDistributeModalOpen, setIsDistributeModalOpen] = useState(false);
  const [distributeForm, setDistributeForm] = useState({ requestNo: '', branch: '', item: '', requestedQty: 0, approvedQty: 0, distributedQty: '', distDate: new Date().toISOString().split('T')[0], remarks: '' });
  const [distributeErrors, setDistributeErrors] = useState({});

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferForm, setTransferForm] = useState({ fromBranch: 'Serviq Chennai Branch', toBranch: 'Serviq Madurai Branch', item: 'Fresh Milk', quantity: '', unit: 'Ltr', remarks: '' });
  const [transferErrors, setTransferErrors] = useState({});

  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [receiptForm, setReceiptForm] = useState({ refNo: '', source: 'Central Warehouse', item: 'Refined Oil', sentQty: 25, receivedQty: '', recDate: new Date().toISOString().split('T')[0], remarks: '' });
  const [receiptErrors, setReceiptErrors] = useState({});

  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, type: '', id: null, title: '', message: '' });

  // -------------------------------------------------------------
  // INLINE FORM VALIDATION & ACTIONS
  // -------------------------------------------------------------
  const validateItemForm = () => {
    const errors = {};
    if (!itemForm.name.trim()) errors.name = 'Item Name is required';
    if (!itemForm.category.trim()) errors.category = 'Category is required';
    if (!itemForm.unit.trim()) errors.unit = 'Unit is required';
    if (itemForm.minStock === '' || Number(itemForm.minStock) < 0) errors.minStock = 'Valid Minimum Stock Level is required';
    setItemErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveItem = () => {
    if (!validateItemForm()) return;
    if (editingItem) {
      setItems(prev => prev.map(i => i.id === editingItem.id ? { ...i, ...itemForm, minStock: Number(itemForm.minStock) } : i));
      ShowNotifications.showAlertNotification('Inventory item updated successfully!', true);
    } else {
      const newItem = {
        id: `INV-${String(items.length + 1).padStart(3, '0')}`,
        name: itemForm.name,
        category: itemForm.category,
        unit: itemForm.unit,
        minStock: Number(itemForm.minStock),
        centralStock: 100,
        branchStock: 20,
        status: itemForm.status
      };
      setItems(prev => [newItem, ...prev]);
      ShowNotifications.showAlertNotification('New inventory item added successfully!', true);
    }
    setIsAddItemModalOpen(false);
    setEditingItem(null);
    setItemForm({ name: '', category: 'Grains', unit: 'kg', minStock: '', status: 'Active' });
  };

  const validatePurchaseForm = () => {
    const errors = {};
    if (!purchaseForm.supplier.trim()) errors.supplier = 'Supplier name is required';
    if (!purchaseForm.purchaseDate) errors.purchaseDate = 'Purchase Date is required';
    if (!purchaseForm.item) errors.item = 'Please select an item';
    if (!purchaseForm.quantity || Number(purchaseForm.quantity) <= 0) errors.quantity = 'Quantity must be greater than 0';
    if (!purchaseForm.unit.trim()) errors.unit = 'Unit is required';
    if (!purchaseForm.rate || Number(purchaseForm.rate) <= 0) errors.rate = 'Purchase Rate must be greater than 0';
    setPurchaseErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSavePurchase = () => {
    if (!validatePurchaseForm()) return;
    const qty = Number(purchaseForm.quantity);
    const rate = Number(purchaseForm.rate);
    const total = qty * rate;
    const poNo = `PO-${new Date().getFullYear()}-${String(purchases.length + 1).padStart(3, '0')}`;
    
    const newPO = {
      id: `PUR-${Date.now().toString().slice(-4)}`,
      purchaseNo: poNo,
      supplier: purchaseForm.supplier,
      date: purchaseForm.purchaseDate,
      invoiceNo: purchaseForm.invoiceNo || 'INV-DIRECT',
      item: purchaseForm.item,
      quantity: qty,
      unit: purchaseForm.unit || 'kg',
      rate: rate,
      total: total,
      remarks: purchaseForm.remarks,
      status: 'Completed'
    };

    setPurchases(prev => [newPO, ...prev]);
    
    // Auto update Central / Branch stock
    setItems(prev => prev.map(i => {
      if (i.name === purchaseForm.item) {
        return {
          ...i,
          centralStock: scope === 'COMPANY' ? i.centralStock + qty : i.centralStock,
          branchStock: scope === 'BRANCH' ? i.branchStock + qty : i.branchStock
        };
      }
      return i;
    }));

    // Log Transaction
    const newTxn = {
      id: `TXN-${Date.now().toString().slice(-4)}`,
      txnNo: `TXN-${new Date().getFullYear()}-${String(transactions.length + 1).padStart(3, '0')}`,
      date: `${purchaseForm.purchaseDate} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      type: 'Purchase',
      item: purchaseForm.item,
      quantity: qty,
      unit: purchaseForm.unit || 'kg',
      source: `Supplier: ${purchaseForm.supplier}`,
      destination: scope === 'COMPANY' ? 'Central Stock' : 'Branch Stock',
      refNo: poNo,
      status: 'Completed'
    };
    setTransactions(prev => [newTxn, ...prev]);

    ShowNotifications.showAlertNotification(`Purchase ${poNo} recorded & stock updated!`, true);
    setIsPurchaseModalOpen(false);
    setPurchaseForm({ supplier: '', purchaseDate: new Date().toISOString().split('T')[0], invoiceNo: '', item: 'Basmati Rice', quantity: '', unit: 'kg', rate: '', remarks: '' });
  };

  const validateStockReqForm = () => {
    const errors = {};
    if (!stockReqForm.item) errors.item = 'Please select an item';
    if (!stockReqForm.reqQty || Number(stockReqForm.reqQty) <= 0) errors.reqQty = 'Required Quantity must be greater than 0';
    setStockReqErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveStockRequest = () => {
    if (!validateStockReqForm()) return;
    const reqNo = `BR-REQ-${String(branchRequests.length + 1).padStart(3, '0')}`;
    const newReq = {
      id: `REQ-${Date.now().toString().slice(-4)}`,
      requestNo: reqNo,
      branch: 'Serviq Chennai Branch',
      date: new Date().toISOString().split('T')[0],
      item: stockReqForm.item,
      reqQty: Number(stockReqForm.reqQty),
      appQty: Number(stockReqForm.reqQty),
      distQty: 0,
      unit: stockReqForm.unit || 'kg',
      status: 'Pending',
      remarks: stockReqForm.remarks || 'Branch stock replenishment'
    };

    setBranchRequests(prev => [newReq, ...prev]);

    const newTxn = {
      id: `TXN-${Date.now().toString().slice(-4)}`,
      txnNo: `TXN-${new Date().getFullYear()}-${String(transactions.length + 1).padStart(3, '0')}`,
      date: `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      type: 'Stock Request',
      item: stockReqForm.item,
      quantity: Number(stockReqForm.reqQty),
      unit: stockReqForm.unit || 'kg',
      source: 'Serviq Chennai Branch',
      destination: 'Central Warehouse',
      refNo: reqNo,
      status: 'Pending'
    };
    setTransactions(prev => [newTxn, ...prev]);

    ShowNotifications.showAlertNotification(`Stock Request ${reqNo} submitted to Central HQ!`, true);
    setIsStockRequestModalOpen(false);
    setStockReqForm({ item: 'Basmati Rice', reqQty: '', unit: 'kg', remarks: '' });
  };

  const handleApproveRequest = (req) => {
    setBranchRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'Approved' } : r));
    ShowNotifications.showAlertNotification(`Branch Request ${req.requestNo} APPROVED!`, true);
    setIsRequestDetailModalOpen(false);
  };

  const handleRejectRequest = (req) => {
    setConfirmDelete({
      isOpen: true,
      type: 'REJECT_REQ',
      id: req.id,
      title: 'Reject Branch Request',
      message: `Are you sure you want to REJECT request ${req.requestNo}? This action will notify the branch.`
    });
  };

  const validateDistributeForm = () => {
    const errors = {};
    const app = Number(distributeForm.approvedQty);
    const dist = Number(distributeForm.distributedQty);
    const req = Number(distributeForm.requestedQty);

    if (!distributeForm.requestNo || !distributeForm.requestNo.trim()) errors.requestNo = 'Request Number is required';
    if (!distributeForm.branch || !distributeForm.branch.trim()) errors.branch = 'Branch is required';
    if (!distributeForm.item || !distributeForm.item.trim()) errors.item = 'Item is required';
    if (distributeForm.approvedQty === '' || app <= 0) errors.approvedQty = 'Approved Quantity must be greater than 0';
    if (distributeForm.distributedQty === '' || dist <= 0) errors.distributedQty = 'Distributed Quantity must be greater than 0';
    if (dist > app) errors.distributedQty = `Distributed Quantity (${dist}) cannot exceed Approved Quantity (${app})`;
    if (app > req) errors.approvedQty = `Approved Quantity (${app}) cannot exceed Requested Quantity (${req})`;
    if (!distributeForm.distDate) errors.distDate = 'Distribution Date is required';
    setDistributeErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveDistribution = () => {
    if (!validateDistributeForm()) return;
    const distNo = `DIST-${new Date().getFullYear()}-${String(distributions.length + 1).padStart(3, '0')}`;
    const qty = Number(distributeForm.distributedQty);

    const newDist = {
      id: `DIST-${Date.now().toString().slice(-4)}`,
      distNo: distNo,
      requestNo: distributeForm.requestNo,
      branch: distributeForm.branch,
      item: distributeForm.item,
      distQty: qty,
      date: distributeForm.distDate,
      status: 'Dispatched',
      remarks: distributeForm.remarks
    };

    setDistributions(prev => [newDist, ...prev]);

    // Update Request status to Dispatched/Completed
    setBranchRequests(prev => prev.map(r => r.requestNo === distributeForm.requestNo ? { ...r, distQty: qty, status: 'Dispatched' } : r));

    // Deduct stock from Central Stock
    setItems(prev => prev.map(i => i.name === distributeForm.item ? { ...i, centralStock: Math.max(0, i.centralStock - qty) } : i));

    // Log Transaction
    const newTxn = {
      id: `TXN-${Date.now().toString().slice(-4)}`,
      txnNo: `TXN-${new Date().getFullYear()}-${String(transactions.length + 1).padStart(3, '0')}`,
      date: `${distributeForm.distDate} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      type: 'Distribution',
      item: distributeForm.item,
      quantity: qty,
      unit: 'kg',
      source: 'Central Stock',
      destination: distributeForm.branch,
      refNo: distNo,
      status: 'Dispatched'
    };
    setTransactions(prev => [newTxn, ...prev]);

    ShowNotifications.showAlertNotification(`Stock Distribution ${distNo} DISPATCHED to ${distributeForm.branch}!`, true);
    setIsDistributeModalOpen(false);
  };

  const validateTransferForm = () => {
    const errors = {};
    if (transferForm.fromBranch === transferForm.toBranch) errors.toBranch = 'Source and Destination branches must be different';
    if (!transferForm.quantity || Number(transferForm.quantity) <= 0) errors.quantity = 'Transfer quantity must be greater than 0';
    setTransferErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveTransfer = () => {
    if (!validateTransferForm()) return;
    const trfNo = `TRF-${new Date().getFullYear()}-${String(transfers.length + 1).padStart(3, '0')}`;
    const qty = Number(transferForm.quantity);

    const newTrf = {
      id: `TRF-${Date.now().toString().slice(-4)}`,
      transferNo: trfNo,
      fromBranch: transferForm.fromBranch,
      toBranch: transferForm.toBranch,
      date: new Date().toISOString().split('T')[0],
      item: transferForm.item,
      quantity: qty,
      unit: transferForm.unit || 'kg',
      status: 'Pending',
      remarks: transferForm.remarks || 'Branch transfer request'
    };

    setTransfers(prev => [newTrf, ...prev]);

    ShowNotifications.showAlertNotification(`Inter-Branch Transfer ${trfNo} initiated!`, true);
    setIsTransferModalOpen(false);
  };

  const validateReceiptForm = () => {
    const errors = {};
    const sent = Number(receiptForm.sentQty);
    const rec = Number(receiptForm.receivedQty);
    if (!receiptForm.receivedQty || rec < 0) errors.receivedQty = 'Received Quantity is required';
    if (rec > sent) errors.receivedQty = `Received Quantity (${rec}) cannot exceed Sent Quantity (${sent})`;
    setReceiptErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveReceipt = () => {
    if (!validateReceiptForm()) return;
    const recNo = `REC-${new Date().getFullYear()}-${String(receipts.length + 1).padStart(3, '0')}`;
    const recQty = Number(receiptForm.receivedQty);

    const newRec = {
      id: `REC-${Date.now().toString().slice(-4)}`,
      receiptNo: recNo,
      refNo: receiptForm.refNo,
      source: receiptForm.source,
      item: receiptForm.item,
      sentQty: receiptForm.sentQty,
      recQty: recQty,
      date: receiptForm.recDate,
      status: 'Received',
      remarks: receiptForm.remarks || 'Inspected and verified'
    };

    setReceipts(prev => [newRec, ...prev]);

    // Add stock to Branch Stock
    setItems(prev => prev.map(i => i.name === receiptForm.item ? { ...i, branchStock: i.branchStock + recQty } : i));

    // Update status in requests/distributions
    setBranchRequests(prev => prev.map(r => r.requestNo === receiptForm.refNo ? { ...r, status: 'Completed' } : r));

    ShowNotifications.showAlertNotification(`Stock Receipt ${recNo} CONFIRMED! Branch stock added (+${recQty}).`, true);
    setIsReceiptModalOpen(false);
  };

  const handleConfirmDeleteAction = () => {
    if (confirmDelete.type === 'DELETE_ITEM') {
      setItems(prev => prev.filter(i => i.id !== confirmDelete.id));
      ShowNotifications.showAlertNotification('Inventory item deleted!', true);
    } else if (confirmDelete.type === 'REJECT_REQ') {
      setBranchRequests(prev => prev.map(r => r.id === confirmDelete.id ? { ...r, status: 'Rejected' } : r));
      ShowNotifications.showAlertNotification('Branch Request REJECTED.', false);
    } else if (confirmDelete.type === 'DELETE_PURCHASE') {
      setPurchases(prev => prev.filter(p => p.id !== confirmDelete.id));
      ShowNotifications.showAlertNotification('Purchase Order deleted successfully!', true);
    } else if (confirmDelete.type === 'DELETE_DISTRIBUTION') {
      setDistributions(prev => prev.filter(d => d.id !== confirmDelete.id));
      ShowNotifications.showAlertNotification('Stock Distribution deleted successfully!', true);
    } else if (confirmDelete.type === 'DELETE_TRANSACTION') {
      setTransactions(prev => prev.filter(t => t.id !== confirmDelete.id));
      ShowNotifications.showAlertNotification('Transaction record deleted successfully!', true);
    }
    setConfirmDelete({ isOpen: false, type: '', id: null, title: '', message: '' });
  };

  // Export handlers
  const handleExportCSV = (dataList, filename) => {
    if (!dataList || dataList.length === 0) return;
    const keys = Object.keys(dataList[0]);
    const csvContent = "data:text/csv;charset=utf-8," + [keys.join(","), ...dataList.map(row => keys.map(k => `"${row[k]}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    ShowNotifications.showAlertNotification(`Exported ${filename}.csv successfully!`, true);
  };

  // Metric Computations
  const getStockStatus = (cur, min) => {
    if (cur <= 0) return { label: 'Out of Stock', bg: '#fef2f2', color: '#dc2626' };
    if (cur <= min) return { label: 'Low Stock', bg: '#fef3c7', color: '#d97706' };
    return { label: 'In Stock', bg: '#e6f4ea', color: '#16a34a' };
  };

  const totalItemsCount = items.length;
  const centralTotalStock = items.reduce((acc, i) => acc + (i.centralStock || 0), 0);
  const branchTotalStock = items.reduce((acc, i) => acc + (i.branchStock || 0), 0);
  const centralLowStockCount = items.filter(i => i.centralStock > 0 && i.centralStock <= i.minStock).length;
  const centralOutOfStockCount = items.filter(i => i.centralStock <= 0).length;

  const branchLowStockCount = items.filter(i => i.branchStock > 0 && i.branchStock <= i.minStock).length;
  const branchOutOfStockCount = items.filter(i => i.branchStock <= 0).length;

  return (
    <section className="panel-view active" style={{ padding: '0 24px 40px 24px', width: '100%', boxSizing: 'border-box' }}>
      
      {/* 1. TOP MODULE HEADER BAR */}
      <div style={{
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '20px',
        paddingTop: '6px'
      }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0, fontFamily: "'Outfit', sans-serif" }}>
            Inventory Management Module
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
            Complete Restaurant SaaS Stock Tracking, Purchases, Requests, Transfers & Audit Log
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* COMPANY LOGIN MODULE RENDERERS                                            */}
      {/* ========================================================================= */}
      {scope === 'COMPANY' && (
        <>
          {/* COMPANY MODULE 1: INVENTORY ITEMS */}
          {companyTab === 'items' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ position: 'relative', width: '280px', display: 'flex', alignItems: 'center' }}>
                    <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', pointerEvents: 'none', zIndex: 1 }}>
                      <SearchIcon size={15} color="#94a3b8" />
                    </span>
                    <input
                      type="text"
                      placeholder="Search by item name..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px 8px 32px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px', outline: 'none', height: '36px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px', height: '36px', background: '#fff' }}>
                    <option value="All">All Categories</option>
                    <option value="Grains">Grains</option>
                    <option value="Oils">Oils</option>
                    <option value="Spices">Spices</option>
                    <option value="Meat">Meat</option>
                    <option value="Dairy">Dairy</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" onClick={() => handleExportCSV(items, 'Inventory_Items')} style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', height: '36px' }}>
                    <DownloadIcon size={14} /> Export CSV
                  </button>
                  <button type="button" onClick={() => { setEditingItem(null); setItemForm({ name: '', category: 'Grains', unit: 'kg', minStock: '', status: 'Active' }); setItemErrors({}); setIsAddItemModalOpen(true); }} style={{ background: '#0f172a', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', height: '36px' }}>
                    <PlusIcon size={15} /> Add Inventory Item
                  </button>
                </div>
              </div>

              {/* Items Table */}
              <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#000000', color: '#ffffff', borderBottom: '3px solid #ff5a1f' }}>
                      <th style={{ padding: '8px 12px', textAlign: 'left', width: '60px' }}>S.No</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>Item Name</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>Category</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>Unit</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center' }}>Minimum Stock Level</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center' }}>Status</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.filter(i => !searchTerm || i.name.toLowerCase().includes(searchTerm.toLowerCase())).map((item, idx) => (
                      <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '8px 12px', fontWeight: 700 }}>{idx + 1}</td>
                        <td style={{ padding: '8px 12px', fontWeight: 800, color: '#0f172a' }}>{item.name}</td>
                        <td style={{ padding: '8px 12px', color: '#475569' }}>{item.category}</td>
                        <td style={{ padding: '8px 12px', color: '#475569' }}>{item.unit}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700 }}>{item.minStock} {item.unit}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                          <span style={{ background: '#e6f4ea', color: '#16a34a', padding: '3px 9px', borderRadius: '12px', fontSize: '11px', fontWeight: 800 }}>
                            ● {item.status}
                          </span>
                        </td>
                        <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                            <button type="button" onClick={() => { setEditingItem(item); setItemForm({ name: item.name, category: item.category, unit: item.unit, minStock: item.minStock, status: item.status }); setIsAddItemModalOpen(true); }} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '5px', borderRadius: '6px', cursor: 'pointer' }} title="Edit Item">
                              <PencilIcon size={14} color="#475569" />
                            </button>
                            <button type="button" onClick={() => setConfirmDelete({ isOpen: true, type: 'DELETE_ITEM', id: item.id, title: 'Delete Item', message: `Are you sure you want to delete ${item.name}?` })} style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '5px', borderRadius: '6px', cursor: 'pointer' }} title="Delete Item">
                              <TrashIcon size={14} color="#dc2626" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* COMPANY MODULE 2: CENTRAL STOCK */}
          {companyTab === 'central-stock' && (
            <div>
              {/* Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
                <div style={{ background: '#fff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b' }}>TOTAL ITEMS</div>
                  <div style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', marginTop: '4px' }}>{totalItemsCount}</div>
                </div>
                <div style={{ background: '#fff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#16a34a' }}>TOTAL STOCK</div>
                  <div style={{ fontSize: '24px', fontWeight: 900, color: '#16a34a', marginTop: '4px' }}>{centralTotalStock} units</div>
                </div>
                <div style={{ background: '#fff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#d97706' }}>LOW STOCK ITEMS</div>
                  <div style={{ fontSize: '24px', fontWeight: 900, color: '#d97706', marginTop: '4px' }}>{centralLowStockCount}</div>
                </div>
                <div style={{ background: '#fff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#dc2626' }}>OUT OF STOCK</div>
                  <div style={{ fontSize: '24px', fontWeight: 900, color: '#dc2626', marginTop: '4px' }}>{centralOutOfStockCount}</div>
                </div>
              </div>

              {/* Central Stock Table */}
              <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#000000', color: '#ffffff', borderBottom: '3px solid #ff5a1f' }}>
                      <th style={{ padding: '8px 12px', textAlign: 'left', width: '60px' }}>S.No</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>Item Name</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>Category</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>Unit</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center' }}>Current Stock</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center' }}>Minimum Stock</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center' }}>Stock Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => {
                      const statusProps = getStockStatus(item.centralStock, item.minStock);
                      return (
                        <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '8px 12px', fontWeight: 700 }}>{idx + 1}</td>
                          <td style={{ padding: '8px 12px', fontWeight: 800, color: '#0f172a' }}>{item.name}</td>
                          <td style={{ padding: '8px 12px', color: '#475569' }}>{item.category}</td>
                          <td style={{ padding: '8px 12px', color: '#475569' }}>{item.unit}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 900, fontSize: '14px', color: statusProps.color }}>
                            {item.centralStock} {item.unit}
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700 }}>{item.minStock} {item.unit}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                            <span style={{ background: statusProps.bg, color: statusProps.color, padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 800 }}>
                              ● {statusProps.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* COMPANY MODULE 3: PURCHASES */}
          {companyTab === 'purchases' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>Supplier Purchase Orders Log</h3>
                <button type="button" onClick={() => { setPurchaseForm({ supplier: '', purchaseDate: new Date().toISOString().split('T')[0], invoiceNo: '', item: 'Basmati Rice', quantity: '', unit: 'kg', rate: '', remarks: '' }); setPurchaseErrors({}); setIsPurchaseModalOpen(true); }} style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <PlusIcon size={15} /> Add Purchase Order
                </button>
              </div>

              {/* PURCHASES FILTERS BAR: Supplier, Item, Date Range */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                background: '#f8fafc',
                padding: '12px 16px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b' }}>SUPPLIER</label>
                  <select
                    value={purchaseSupplierFilter}
                    onChange={e => setPurchaseSupplierFilter(e.target.value)}
                    style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px', background: '#fff', outline: 'none' }}
                  >
                    <option value="All">All Suppliers</option>
                    {Array.from(new Set(purchases.map(p => p.supplier))).map(sup => (
                      <option key={sup} value={sup}>{sup}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b' }}>ITEM</label>
                  <select
                    value={purchaseItemFilter}
                    onChange={e => setPurchaseItemFilter(e.target.value)}
                    style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px', background: '#fff', outline: 'none' }}
                  >
                    <option value="All">All Items</option>
                    {items.map(item => (
                      <option key={item.id} value={item.name}>{item.name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b' }}>FROM DATE</label>
                  <input
                    type="date"
                    value={purchaseStartDateFilter}
                    onChange={e => setPurchaseStartDateFilter(e.target.value)}
                    style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px', background: '#fff', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b' }}>TO DATE</label>
                  <input
                    type="date"
                    value={purchaseEndDateFilter}
                    onChange={e => setPurchaseEndDateFilter(e.target.value)}
                    style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px', background: '#fff', outline: 'none' }}
                  />
                </div>

                {(purchaseSupplierFilter !== 'All' || purchaseItemFilter !== 'All' || purchaseStartDateFilter || purchaseEndDateFilter) && (
                  <button
                    type="button"
                    onClick={() => {
                      setPurchaseSupplierFilter('All');
                      setPurchaseItemFilter('All');
                      setPurchaseStartDateFilter('');
                      setPurchaseEndDateFilter('');
                    }}
                    style={{
                      marginTop: '18px',
                      background: '#e2e8f0',
                      color: '#475569',
                      border: 'none',
                      padding: '7px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Clear Filters
                  </button>
                )}
              </div>

              {/* PURCHASES TABLE */}
              <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#000000', color: '#ffffff', borderBottom: '3px solid #ff5a1f' }}>
                      <th style={{ padding: '8px 12px', textAlign: 'left', width: '60px' }}>S.No</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>Purchase Date</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>Purchase No.</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>Supplier</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>Item</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center' }}>Quantity</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center' }}>Unit</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right' }}>Purchase Rate</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right' }}>Total Amount</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center' }}>Status</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPurchases.length === 0 ? (
                      <tr>
                        <td colSpan="11" style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
                          No purchases found matching selected filters.
                        </td>
                      </tr>
                    ) : (
                      filteredPurchases.map((p, idx) => (
                        <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '8px 12px', fontWeight: 700 }}>{idx + 1}</td>
                          <td style={{ padding: '8px 12px' }}>{p.date}</td>
                          <td style={{ padding: '8px 12px', fontWeight: 700, color: 'var(--primary)', fontFamily: 'monospace' }}>{p.purchaseNo}</td>
                          <td style={{ padding: '8px 12px', fontWeight: 700 }}>{p.supplier}</td>
                          <td style={{ padding: '8px 12px' }}>{p.item}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700 }}>{p.quantity}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'center', color: '#64748b' }}>{p.unit || 'kg'}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'right' }}>₹{p.rate}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 900, color: '#0f172a' }}>₹{p.total.toLocaleString()}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                            <span style={{ background: '#e6f4ea', color: '#16a34a', padding: '3px 9px', borderRadius: '12px', fontSize: '11px', fontWeight: 800 }}>
                              ● {p.status || 'Completed'}
                            </span>
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                              <button type="button" onClick={() => { setSelectedPurchase(p); setIsPurchaseDetailModalOpen(true); }} title="View Purchase Details" style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '5px 9px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <EyeIcon size={13} /> View
                              </button>
                              <button type="button" onClick={() => setConfirmDelete({ isOpen: true, type: 'DELETE_PURCHASE', id: p.id, title: 'Delete Purchase Order', message: `Are you sure you want to delete purchase order ${p.purchaseNo}?` })} title="Delete Purchase Order" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '5px 9px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <TrashIcon size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* COMPANY MODULE 4: BRANCH REQUESTS */}
          {companyTab === 'branch-requests' && (
            <div>
              {/* SUMMARY CARDS: Pending Requests, Approved, Dispatched, Completed */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
                <div style={{ background: '#fff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#d97706' }}>PENDING REQUESTS</div>
                  <div style={{ fontSize: '24px', fontWeight: 900, color: '#d97706', marginTop: '4px' }}>
                    {branchRequests.filter(r => r.status === 'Pending').length}
                  </div>
                </div>
                <div style={{ background: '#fff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #222224ff' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#2563eb' }}>APPROVED</div>
                  <div style={{ fontSize: '24px', fontWeight: 900, color: '#2563eb', marginTop: '4px' }}>
                    {branchRequests.filter(r => r.status === 'Approved').length}
                  </div>
                </div>
                <div style={{ background: '#fff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#8b5cf6' }}>DISPATCHED</div>
                  <div style={{ fontSize: '24px', fontWeight: 900, color: '#8b5cf6', marginTop: '4px' }}>
                    {branchRequests.filter(r => r.status === 'Dispatched').length}
                  </div>
                </div>
                <div style={{ background: '#fff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#16a34a' }}>COMPLETED</div>
                  <div style={{ fontSize: '24px', fontWeight: 900, color: '#16a34a', marginTop: '4px' }}>
                    {branchRequests.filter(r => r.status === 'Completed').length}
                  </div>
                </div>
              </div>

              {/* BRANCH REQUESTS FILTERS BAR: Branch, Status, Date Range */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                background: '#f8fafc',
                padding: '12px 16px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b' }}>BRANCH</label>
                  <select
                    value={reqBranchFilter}
                    onChange={e => setReqBranchFilter(e.target.value)}
                    style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px', background: '#fff', outline: 'none' }}
                  >
                    <option value="All">All Branches</option>
                    {Array.from(new Set(branchRequests.map(r => r.branch))).map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b' }}>STATUS</label>
                  <select
                    value={reqStatusFilter}
                    onChange={e => setReqStatusFilter(e.target.value)}
                    style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px', background: '#fff', outline: 'none' }}
                  >
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Dispatched">Dispatched</option>
                    <option value="Completed">Completed</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b' }}>FROM DATE</label>
                  <input
                    type="date"
                    value={reqStartDateFilter}
                    onChange={e => setReqStartDateFilter(e.target.value)}
                    style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px', background: '#fff', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b' }}>TO DATE</label>
                  <input
                    type="date"
                    value={reqEndDateFilter}
                    onChange={e => setReqEndDateFilter(e.target.value)}
                    style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px', background: '#fff', outline: 'none' }}
                  />
                </div>

                {(reqBranchFilter !== 'All' || reqStatusFilter !== 'All' || reqStartDateFilter || reqEndDateFilter) && (
                  <button
                    type="button"
                    onClick={() => {
                      setReqBranchFilter('All');
                      setReqStatusFilter('All');
                      setReqStartDateFilter('');
                      setReqEndDateFilter('');
                    }}
                    style={{
                      marginTop: '18px',
                      background: '#e2e8f0',
                      color: '#475569',
                      border: 'none',
                      padding: '7px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Clear Filters
                  </button>
                )}
              </div>

              {/* BRANCH REQUESTS TABLE */}
              <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#000000', color: '#ffffff', borderBottom: '3px solid #ff5a1f' }}>
                      <th style={{ padding: '8px 12px', textAlign: 'left', width: '60px' }}>S.No</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>Request No.</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>Branch</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>Request Date</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>Item</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center' }}>Requested Qty</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center' }}>Status</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBranchRequests.length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
                          No branch requests found matching selected filters.
                        </td>
                      </tr>
                    ) : (
                      filteredBranchRequests.map((r, idx) => (
                        <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '8px 12px', fontWeight: 700 }}>{idx + 1}</td>
                          <td style={{ padding: '8px 12px', fontWeight: 700, color: 'var(--primary)', fontFamily: 'monospace' }}>{r.requestNo}</td>
                          <td style={{ padding: '8px 12px', fontWeight: 700 }}>{r.branch}</td>
                          <td style={{ padding: '8px 12px' }}>{r.date}</td>
                          <td style={{ padding: '8px 12px' }}>{r.item}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700 }}>{r.reqQty} {r.unit}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                            <span style={{
                              background: r.status === 'Completed' ? '#e6f4ea' : r.status === 'Approved' ? '#eff6ff' : r.status === 'Dispatched' ? '#f3e8ff' : r.status === 'Rejected' ? '#fef2f2' : '#fef3c7',
                              color: r.status === 'Completed' ? '#16a34a' : r.status === 'Approved' ? '#2563eb' : r.status === 'Dispatched' ? '#8b5cf6' : r.status === 'Rejected' ? '#dc2626' : '#d97706',
                              padding: '3px 9px', borderRadius: '12px', fontSize: '11px', fontWeight: 800
                            }}>
                              ● {r.status}
                            </span>
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                              <button type="button" onClick={() => { setSelectedRequest(r); setIsRequestDetailModalOpen(true); }} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '5px 10px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <EyeIcon size={13} /> View
                              </button>
                              {r.status === 'Pending' && (
                                <>
                                  <button type="button" onClick={() => handleApproveRequest(r)} style={{ background: '#e6f4ea', border: '1px solid #bbf7d0', color: '#16a34a', padding: '5px 10px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer' }}>
                                    Approve
                                  </button>
                                  <button type="button" onClick={() => handleRejectRequest(r)} style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '5px 10px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer' }}>
                                    Reject
                                  </button>
                                </>
                              )}
                              {r.status === 'Approved' && (
                                <button type="button" onClick={() => { setDistributeForm({ requestNo: r.requestNo, branch: r.branch, item: r.item, requestedQty: r.reqQty, approvedQty: r.appQty, distributedQty: r.appQty, distDate: new Date().toISOString().split('T')[0], remarks: '' }); setDistributeErrors({}); setIsDistributeModalOpen(true); }} style={{ background: '#0f172a', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <TruckIcon size={13} /> Distribute
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* COMPANY MODULE 5: STOCK DISTRIBUTION */}
          {companyTab === 'distribution' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>Central Stock Distribution Log</h3>
                <button
                  type="button"
                  onClick={() => {
                    setDistributeForm({
                      requestNo: 'BR-REQ-001',
                      branch: 'Serviq Chennai Branch',
                      item: 'Basmati Rice',
                      requestedQty: 50,
                      approvedQty: 50,
                      distributedQty: 50,
                      distDate: new Date().toISOString().split('T')[0],
                      remarks: ''
                    });
                    setDistributeErrors({});
                    setIsDistributeModalOpen(true);
                  }}
                  style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <PlusIcon size={15} /> Create Stock Distribution
                </button>
              </div>

              <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#000000', color: '#ffffff', borderBottom: '3px solid #ff5a1f' }}>
                      <th style={{ padding: '8px 12px', textAlign: 'left', width: '60px' }}>S.No</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>Distribution No.</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>Request No.</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>Branch</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>Item</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center' }}>Distributed Qty</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>Distribution Date</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center' }}>Status</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {distributions.map((d, idx) => (
                      <tr key={d.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '8px 12px', fontWeight: 700 }}>{idx + 1}</td>
                        <td style={{ padding: '8px 12px', fontWeight: 700, color: 'var(--primary)', fontFamily: 'monospace' }}>{d.distNo}</td>
                        <td style={{ padding: '8px 12px' }}>{d.requestNo}</td>
                        <td style={{ padding: '8px 12px', fontWeight: 700 }}>{d.branch}</td>
                        <td style={{ padding: '8px 12px' }}>{d.item}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 800 }}>{d.distQty} units</td>
                        <td style={{ padding: '8px 12px' }}>{d.date}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                          <span style={{ background: '#eff6ff', color: '#2563eb', padding: '3px 9px', borderRadius: '12px', fontSize: '11px', fontWeight: 800 }}>
                            ● {d.status}
                          </span>
                        </td>
                        <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <button
                              type="button"
                              onClick={() => { setSelectedDistribution(d); setIsDistDetailModalOpen(true); }}
                              title="View Distribution Details"
                              style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#0f172a', padding: '5px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                              <EyeIcon size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setConfirmDelete({
                                  isOpen: true,
                                  type: 'DELETE_DISTRIBUTION',
                                  id: d.id,
                                  title: 'Delete Stock Distribution',
                                  message: `Are you sure you want to delete distribution log ${d.distNo}?`
                                });
                              }}
                              title="Delete Distribution Log"
                              style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '5px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                              <TrashIcon size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* COMPANY MODULE 6: TRANSACTIONS LOG */}
          {companyTab === 'transactions' && (
            <div>
              {/* TRANSACTIONS FILTERS BAR */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                background: '#f8fafc',
                padding: '12px 16px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b' }}>FROM DATE</label>
                  <input
                    type="date"
                    value={txnStartDateFilter}
                    onChange={e => setTxnStartDateFilter(e.target.value)}
                    style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px', background: '#fff', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b' }}>TO DATE</label>
                  <input
                    type="date"
                    value={txnEndDateFilter}
                    onChange={e => setTxnEndDateFilter(e.target.value)}
                    style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px', background: '#fff', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b' }}>TRANSACTION TYPE</label>
                  <select
                    value={txnTypeFilter}
                    onChange={e => setTxnTypeFilter(e.target.value)}
                    style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px', background: '#fff', outline: 'none' }}
                  >
                    <option value="All">All Types</option>
                    <option value="Purchase">Purchase</option>
                    <option value="Distribution">Distribution</option>
                    <option value="Transfer">Transfer</option>
                    <option value="Receipt">Receipt</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b' }}>ITEM</label>
                  <select
                    value={txnItemFilter}
                    onChange={e => setTxnItemFilter(e.target.value)}
                    style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px', background: '#fff', outline: 'none' }}
                  >
                    <option value="All">All Items</option>
                    {items.map(item => (
                      <option key={item.id} value={item.name}>{item.name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b' }}>BRANCH</label>
                  <select
                    value={txnBranchFilter}
                    onChange={e => setTxnBranchFilter(e.target.value)}
                    style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px', background: '#fff', outline: 'none' }}
                  >
                    <option value="All">All Branches</option>
                    <option value="Serviq Chennai Branch">Serviq Chennai Branch</option>
                    <option value="Serviq Madurai Branch">Serviq Madurai Branch</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b' }}>STATUS</label>
                  <select
                    value={txnStatusFilter}
                    onChange={e => setTxnStatusFilter(e.target.value)}
                    style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px', background: '#fff', outline: 'none' }}
                  >
                    <option value="All">All Statuses</option>
                    <option value="Completed">Completed</option>
                    <option value="Dispatched">Dispatched</option>
                    <option value="Pending">Pending</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                {(txnStartDateFilter || txnEndDateFilter || txnTypeFilter !== 'All' || txnItemFilter !== 'All' || txnBranchFilter !== 'All' || txnStatusFilter !== 'All') && (
                  <button
                    type="button"
                    onClick={() => {
                      setTxnStartDateFilter('');
                      setTxnEndDateFilter('');
                      setTxnTypeFilter('All');
                      setTxnItemFilter('All');
                      setTxnBranchFilter('All');
                      setTxnStatusFilter('All');
                    }}
                    style={{
                      marginTop: '18px',
                      background: '#e2e8f0',
                      color: '#475569',
                      border: 'none',
                      padding: '7px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Clear Filters
                  </button>
                )}
              </div>

              <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#000000', color: '#ffffff', borderBottom: '3px solid #ff5a1f' }}>
                      <th style={{ padding: '8px 12px', textAlign: 'left', width: '60px' }}>S.No</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>Transaction Date</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>Transaction No.</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center' }}>Transaction Type</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>Item</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center' }}>Quantity</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center' }}>Unit</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>Source</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>Destination</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>Reference No.</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center' }}>Status</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.length === 0 ? (
                      <tr>
                        <td colSpan="12" style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
                          No transaction logs found matching selected filters.
                        </td>
                      </tr>
                    ) : (
                      filteredTransactions.map((t, idx) => (
                        <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '8px 12px', fontWeight: 700 }}>{idx + 1}</td>
                          <td style={{ padding: '8px 12px', color: '#64748b', fontSize: '12px' }}>{t.date}</td>
                          <td style={{ padding: '8px 12px', fontWeight: 700, color: 'var(--primary)', fontFamily: 'monospace' }}>{t.txnNo}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                            <span style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 800 }}>
                              {t.type}
                            </span>
                          </td>
                          <td style={{ padding: '8px 12px', fontWeight: 700 }}>{t.item}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 800 }}>{t.quantity}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'center', color: '#64748b' }}>{t.unit || 'kg'}</td>
                          <td style={{ padding: '8px 12px' }}>{t.source || '-'}</td>
                          <td style={{ padding: '8px 12px' }}>{t.destination || '-'}</td>
                          <td style={{ padding: '8px 12px', fontFamily: 'monospace' }}>{t.refNo || '-'}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                            <span style={{
                              background: t.status === 'Completed' ? '#e6f4ea' : t.status === 'Dispatched' ? '#eff6ff' : '#fef3c7',
                              color: t.status === 'Completed' ? '#16a34a' : t.status === 'Dispatched' ? '#2563eb' : '#d97706',
                              padding: '3px 9px', borderRadius: '12px', fontSize: '11px', fontWeight: 800
                            }}>
                              ● {t.status || 'Completed'}
                            </span>
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                              <button
                                type="button"
                                onClick={() => { setSelectedTransaction(t); setIsTxnDetailModalOpen(true); }}
                                title="View Transaction Details"
                                style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#0f172a', padding: '5px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                              >
                                <EyeIcon size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setConfirmDelete({
                                    isOpen: true,
                                    type: 'DELETE_TRANSACTION',
                                    id: t.id,
                                    title: 'Delete Transaction Record',
                                    message: `Are you sure you want to delete transaction record ${t.txnNo}?`
                                  });
                                }}
                                title="Delete Transaction Record"
                                style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '5px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                              >
                                <TrashIcon size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* BRANCH LOGIN MODULE RENDERERS                                             */}
      {/* ========================================================================= */}
      {scope === 'BRANCH' && (
        <>
          {/* BRANCH MODULE 1: MY STOCK */}
          {branchTab === 'my-stock' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
                <div style={{ background: '#fff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b' }}>TOTAL ITEMS</div>
                  <div style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', marginTop: '4px' }}>{totalItemsCount}</div>
                </div>
                <div style={{ background: '#fff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#16a34a' }}>AVAILABLE STOCK</div>
                  <div style={{ fontSize: '24px', fontWeight: 900, color: '#16a34a', marginTop: '4px' }}>{branchTotalStock} units</div>
                </div>
                <div style={{ background: '#fff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#d97706' }}>LOW STOCK</div>
                  <div style={{ fontSize: '24px', fontWeight: 900, color: '#d97706', marginTop: '4px' }}>{branchLowStockCount}</div>
                </div>
                <div style={{ background: '#fff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#dc2626' }}>OUT OF STOCK</div>
                  <div style={{ fontSize: '24px', fontWeight: 900, color: '#dc2626', marginTop: '4px' }}>{branchOutOfStockCount}</div>
                </div>
              </div>

              <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#000000', color: '#ffffff', borderBottom: '3px solid #ff5a1f' }}>
                      <th style={{ padding: '8px 12px', textAlign: 'left', width: '60px' }}>S.No</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>Item Name</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>Category</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>Unit</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center' }}>Current Stock</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center' }}>Minimum Stock</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center' }}>Stock Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => {
                      const statusProps = getStockStatus(item.branchStock, item.minStock);
                      return (
                        <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '8px 12px', fontWeight: 700 }}>{idx + 1}</td>
                          <td style={{ padding: '8px 12px', fontWeight: 800, color: '#0f172a' }}>{item.name}</td>
                          <td style={{ padding: '8px 12px', color: '#475569' }}>{item.category}</td>
                          <td style={{ padding: '8px 12px', color: '#475569' }}>{item.unit}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 900, fontSize: '14px', color: statusProps.color }}>
                            {item.branchStock} {item.unit}
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700 }}>{item.minStock} {item.unit}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                            <span style={{ background: statusProps.bg, color: statusProps.color, padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 800 }}>
                              ● {statusProps.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* BRANCH MODULE 2: STOCK REQUEST */}
          {branchTab === 'stock-request' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>Stock Replenishment Requests to Central HQ</h3>
                <button type="button" onClick={() => { setStockReqForm({ item: 'Basmati Rice', reqQty: '', unit: 'kg', remarks: '' }); setStockReqErrors({}); setIsStockRequestModalOpen(true); }} style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <PlusIcon size={15} /> New Stock Request
                </button>
              </div>

              <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#000000', color: '#ffffff', borderBottom: '3px solid #ff5a1f' }}>
                      <th style={{ padding: '8px 12px', textAlign: 'left', width: '60px' }}>S.No</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>Request No.</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>Request Date</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>Item</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center' }}>Requested Quantity</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center' }}>Unit</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {branchRequests.map((r, idx) => (
                      <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '8px 12px', fontWeight: 700 }}>{idx + 1}</td>
                        <td style={{ padding: '8px 12px', fontWeight: 700, color: 'var(--primary)', fontFamily: 'monospace' }}>{r.requestNo}</td>
                        <td style={{ padding: '8px 12px' }}>{r.date}</td>
                        <td style={{ padding: '8px 12px', fontWeight: 700 }}>{r.item}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 800 }}>{r.reqQty}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'center' }}>{r.unit}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                          <span style={{
                            background: r.status === 'Completed' ? '#e6f4ea' : r.status === 'Approved' ? '#eff6ff' : '#fef3c7',
                            color: r.status === 'Completed' ? '#16a34a' : r.status === 'Approved' ? '#2563eb' : '#d97706',
                            padding: '3px 9px', borderRadius: '12px', fontSize: '11px', fontWeight: 800
                          }}>
                            ● {r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* BRANCH MODULE 3: BRANCH TRANSFER */}
          {branchTab === 'branch-transfer' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>Inter-Branch Stock Transfers</h3>
                <button type="button" onClick={() => { setTransferForm({ fromBranch: 'Serviq Chennai Branch', toBranch: 'Serviq Madurai Branch', item: 'Fresh Milk', quantity: '', unit: 'Ltr', remarks: '' }); setTransferErrors({}); setIsTransferModalOpen(true); }} style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <PlusIcon size={15} /> Transfer Request
                </button>
              </div>

              <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#000000', color: '#ffffff', borderBottom: '3px solid #ff5a1f' }}>
                      <th style={{ padding: '8px 12px', textAlign: 'left', width: '60px' }}>S.No</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>Transfer No.</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>From Branch</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>To Branch</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>Item</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center' }}>Quantity</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transfers.map((t, idx) => (
                      <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '8px 12px', fontWeight: 700 }}>{idx + 1}</td>
                        <td style={{ padding: '8px 12px', fontWeight: 700, color: 'var(--primary)', fontFamily: 'monospace' }}>{t.transferNo}</td>
                        <td style={{ padding: '8px 12px' }}>{t.fromBranch}</td>
                        <td style={{ padding: '8px 12px', fontWeight: 700 }}>{t.toBranch}</td>
                        <td style={{ padding: '8px 12px' }}>{t.item}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 800 }}>{t.quantity} {t.unit}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                          <span style={{ background: '#fef3c7', color: '#d97706', padding: '3px 9px', borderRadius: '12px', fontSize: '11px', fontWeight: 800 }}>
                            ● {t.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* BRANCH MODULE 4: DIRECT PURCHASE */}
          {branchTab === 'direct-purchase' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>Direct Local Supplier Purchases</h3>
                <button type="button" onClick={() => { setPurchaseForm({ supplier: '', purchaseDate: new Date().toISOString().split('T')[0], invoiceNo: '', item: 'Basmati Rice', quantity: '', unit: 'kg', rate: '', remarks: '' }); setPurchaseErrors({}); setIsPurchaseModalOpen(true); }} style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <PlusIcon size={15} /> Add Direct Purchase
                </button>
              </div>

              {/* DIRECT PURCHASES FILTERS BAR */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                background: '#f8fafc',
                padding: '12px 16px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b' }}>SUPPLIER</label>
                  <select
                    value={purchaseSupplierFilter}
                    onChange={e => setPurchaseSupplierFilter(e.target.value)}
                    style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px', background: '#fff', outline: 'none' }}
                  >
                    <option value="All">All Suppliers</option>
                    {Array.from(new Set(purchases.map(p => p.supplier))).map(sup => (
                      <option key={sup} value={sup}>{sup}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b' }}>ITEM</label>
                  <select
                    value={purchaseItemFilter}
                    onChange={e => setPurchaseItemFilter(e.target.value)}
                    style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px', background: '#fff', outline: 'none' }}
                  >
                    <option value="All">All Items</option>
                    {items.map(item => (
                      <option key={item.id} value={item.name}>{item.name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b' }}>FROM DATE</label>
                  <input
                    type="date"
                    value={purchaseStartDateFilter}
                    onChange={e => setPurchaseStartDateFilter(e.target.value)}
                    style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px', background: '#fff', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b' }}>TO DATE</label>
                  <input
                    type="date"
                    value={purchaseEndDateFilter}
                    onChange={e => setPurchaseEndDateFilter(e.target.value)}
                    style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px', background: '#fff', outline: 'none' }}
                  />
                </div>

                {(purchaseSupplierFilter !== 'All' || purchaseItemFilter !== 'All' || purchaseStartDateFilter || purchaseEndDateFilter) && (
                  <button
                    type="button"
                    onClick={() => {
                      setPurchaseSupplierFilter('All');
                      setPurchaseItemFilter('All');
                      setPurchaseStartDateFilter('');
                      setPurchaseEndDateFilter('');
                    }}
                    style={{
                      marginTop: '18px',
                      background: '#e2e8f0',
                      color: '#475569',
                      border: 'none',
                      padding: '7px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Clear Filters
                  </button>
                )}
              </div>

              {/* DIRECT PURCHASES TABLE */}
              <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#000000', color: '#ffffff', borderBottom: '3px solid #ff5a1f' }}>
                      <th style={{ padding: '8px 12px', textAlign: 'left', width: '60px' }}>S.No</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>Purchase Date</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>Purchase No.</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>Supplier</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>Item</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center' }}>Quantity</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center' }}>Unit</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right' }}>Purchase Rate</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right' }}>Total Amount</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center' }}>Status</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPurchases.length === 0 ? (
                      <tr>
                        <td colSpan="11" style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
                          No direct purchases found matching selected filters.
                        </td>
                      </tr>
                    ) : (
                      filteredPurchases.map((p, idx) => (
                        <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '8px 12px', fontWeight: 700 }}>{idx + 1}</td>
                          <td style={{ padding: '8px 12px' }}>{p.date}</td>
                          <td style={{ padding: '8px 12px', fontWeight: 700, color: 'var(--primary)', fontFamily: 'monospace' }}>{p.purchaseNo}</td>
                          <td style={{ padding: '8px 12px', fontWeight: 700 }}>{p.supplier}</td>
                          <td style={{ padding: '8px 12px' }}>{p.item}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700 }}>{p.quantity}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'center', color: '#64748b' }}>{p.unit || 'kg'}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'right' }}>₹{p.rate}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 900, color: '#0f172a' }}>₹{p.total.toLocaleString()}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                            <span style={{ background: '#e6f4ea', color: '#16a34a', padding: '3px 9px', borderRadius: '12px', fontSize: '11px', fontWeight: 800 }}>
                              ● {p.status || 'Completed'}
                            </span>
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                              <button type="button" onClick={() => { setSelectedPurchase(p); setIsPurchaseDetailModalOpen(true); }} title="View Purchase Details" style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '5px 9px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <EyeIcon size={13} /> View
                              </button>
                              <button type="button" onClick={() => setConfirmDelete({ isOpen: true, type: 'DELETE_PURCHASE', id: p.id, title: 'Delete Purchase Order', message: `Are you sure you want to delete purchase order ${p.purchaseNo}?` })} title="Delete Purchase Order" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '5px 9px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <TrashIcon size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* BRANCH MODULE 5: STOCK RECEIPT */}
          {branchTab === 'stock-receipt' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>Goods Stock Receipts</h3>
                <button type="button" onClick={() => { setReceiptForm({ refNo: 'DIST-2026-001', source: 'Central Warehouse', item: 'Refined Oil', sentQty: 25, receivedQty: '', recDate: new Date().toISOString().split('T')[0], remarks: '' }); setReceiptErrors({}); setIsReceiptModalOpen(true); }} style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <PlusIcon size={15} /> Record Stock Receipt
                </button>
              </div>

              <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#000000', color: '#ffffff', borderBottom: '3px solid #ff5a1f' }}>
                      <th style={{ padding: '8px 12px', textAlign: 'left', width: '60px' }}>S.No</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>Receipt No.</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>Ref No.</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>Source</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>Item</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center' }}>Sent Qty</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center' }}>Received Qty</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receipts.map((rc, idx) => (
                      <tr key={rc.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '8px 12px', fontWeight: 700 }}>{idx + 1}</td>
                        <td style={{ padding: '8px 12px', fontWeight: 700, color: 'var(--primary)', fontFamily: 'monospace' }}>{rc.receiptNo}</td>
                        <td style={{ padding: '8px 12px' }}>{rc.refNo}</td>
                        <td style={{ padding: '8px 12px' }}>{rc.source}</td>
                        <td style={{ padding: '8px 12px', fontWeight: 700 }}>{rc.item}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'center' }}>{rc.sentQty}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 900, color: '#16a34a' }}>{rc.recQty}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                          <span style={{ background: '#e6f4ea', color: '#16a34a', padding: '3px 9px', borderRadius: '12px', fontSize: '11px', fontWeight: 800 }}>
                            ● {rc.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* BRANCH MODULE 6: TRANSACTIONS */}
          {branchTab === 'transactions' && (
            <div>
              {/* TRANSACTIONS FILTERS BAR */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                background: '#f8fafc',
                padding: '12px 16px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b' }}>FROM DATE</label>
                  <input
                    type="date"
                    value={txnStartDateFilter}
                    onChange={e => setTxnStartDateFilter(e.target.value)}
                    style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px', background: '#fff', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b' }}>TO DATE</label>
                  <input
                    type="date"
                    value={txnEndDateFilter}
                    onChange={e => setTxnEndDateFilter(e.target.value)}
                    style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px', background: '#fff', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b' }}>TRANSACTION TYPE</label>
                  <select
                    value={txnTypeFilter}
                    onChange={e => setTxnTypeFilter(e.target.value)}
                    style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px', background: '#fff', outline: 'none' }}
                  >
                    <option value="All">All Types</option>
                    <option value="Purchase">Purchase</option>
                    <option value="Distribution">Distribution</option>
                    <option value="Transfer">Transfer</option>
                    <option value="Receipt">Receipt</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b' }}>ITEM</label>
                  <select
                    value={txnItemFilter}
                    onChange={e => setTxnItemFilter(e.target.value)}
                    style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px', background: '#fff', outline: 'none' }}
                  >
                    <option value="All">All Items</option>
                    {items.map(item => (
                      <option key={item.id} value={item.name}>{item.name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b' }}>BRANCH</label>
                  <select
                    value={txnBranchFilter}
                    onChange={e => setTxnBranchFilter(e.target.value)}
                    style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px', background: '#fff', outline: 'none' }}
                  >
                    <option value="All">All Branches</option>
                    <option value="Serviq Chennai Branch">Serviq Chennai Branch</option>
                    <option value="Serviq Madurai Branch">Serviq Madurai Branch</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b' }}>STATUS</label>
                  <select
                    value={txnStatusFilter}
                    onChange={e => setTxnStatusFilter(e.target.value)}
                    style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px', background: '#fff', outline: 'none' }}
                  >
                    <option value="All">All Statuses</option>
                    <option value="Completed">Completed</option>
                    <option value="Dispatched">Dispatched</option>
                    <option value="Pending">Pending</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                {(txnStartDateFilter || txnEndDateFilter || txnTypeFilter !== 'All' || txnItemFilter !== 'All' || txnBranchFilter !== 'All' || txnStatusFilter !== 'All') && (
                  <button
                    type="button"
                    onClick={() => {
                      setTxnStartDateFilter('');
                      setTxnEndDateFilter('');
                      setTxnTypeFilter('All');
                      setTxnItemFilter('All');
                      setTxnBranchFilter('All');
                      setTxnStatusFilter('All');
                    }}
                    style={{
                      marginTop: '18px',
                      background: '#e2e8f0',
                      color: '#475569',
                      border: 'none',
                      padding: '7px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Clear Filters
                  </button>
                )}
              </div>

              <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#000000', color: '#ffffff', borderBottom: '3px solid #ff5a1f' }}>
                      <th style={{ padding: '8px 12px', textAlign: 'left', width: '60px' }}>S.No</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>Transaction Date</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>Transaction No.</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center' }}>Transaction Type</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>Item</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center' }}>Quantity</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center' }}>Unit</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>Source</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>Destination</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>Reference No.</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center' }}>Status</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.length === 0 ? (
                      <tr>
                        <td colSpan="12" style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
                          No transaction logs found matching selected filters.
                        </td>
                      </tr>
                    ) : (
                      filteredTransactions.map((t, idx) => (
                        <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '8px 12px', fontWeight: 700 }}>{idx + 1}</td>
                          <td style={{ padding: '8px 12px', color: '#64748b', fontSize: '12px' }}>{t.date}</td>
                          <td style={{ padding: '8px 12px', fontWeight: 700, color: 'var(--primary)', fontFamily: 'monospace' }}>{t.txnNo}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                            <span style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 800 }}>
                              {t.type}
                            </span>
                          </td>
                          <td style={{ padding: '8px 12px', fontWeight: 700 }}>{t.item}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 800 }}>{t.quantity}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'center', color: '#64748b' }}>{t.unit || 'kg'}</td>
                          <td style={{ padding: '8px 12px' }}>{t.source || '-'}</td>
                          <td style={{ padding: '8px 12px' }}>{t.destination || '-'}</td>
                          <td style={{ padding: '8px 12px', fontFamily: 'monospace' }}>{t.refNo || '-'}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                            <span style={{
                              background: t.status === 'Completed' ? '#e6f4ea' : t.status === 'Dispatched' ? '#eff6ff' : '#fef3c7',
                              color: t.status === 'Completed' ? '#16a34a' : t.status === 'Dispatched' ? '#2563eb' : '#d97706',
                              padding: '3px 9px', borderRadius: '12px', fontSize: '11px', fontWeight: 800
                            }}>
                              ● {t.status || 'Completed'}
                            </span>
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                              <button
                                type="button"
                                onClick={() => { setSelectedTransaction(t); setIsTxnDetailModalOpen(true); }}
                                title="View Transaction Details"
                                style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#0f172a', padding: '5px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                              >
                                <EyeIcon size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setConfirmDelete({
                                    isOpen: true,
                                    type: 'DELETE_TRANSACTION',
                                    id: t.id,
                                    title: 'Delete Transaction Record',
                                    message: `Are you sure you want to delete transaction record ${t.txnNo}?`
                                  });
                                }}
                                title="Delete Transaction Record"
                                style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '5px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                              >
                                <TrashIcon size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* FORM MODALS WITH INLINE RED ERROR MESSAGES BELOW FIELDS                   */}
      {/* ========================================================================= */}

      {/* 1. ADD / EDIT INVENTORY ITEM MODAL */}
      {isAddItemModalOpen && (
        <Modal isOpen={isAddItemModalOpen} onClose={() => setIsAddItemModalOpen(false)} title={editingItem ? "Edit Inventory Item" : "Add Inventory Item"} maxWidth="480px">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>Item Name *</label>
              <input type="text" value={itemForm.name} onChange={e => { setItemForm({ ...itemForm, name: e.target.value }); setItemErrors({ ...itemErrors, name: null }); }} placeholder="e.g. Basmati Rice" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: itemErrors.name ? '1.5px solid #dc2626' : '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }} />
              {itemErrors.name && <span style={{ color: '#dc2626', fontSize: '11px', fontWeight: 600, marginTop: '2px', display: 'block' }}>{itemErrors.name}</span>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>Category *</label>
                <select value={itemForm.category} onChange={e => setItemForm({ ...itemForm, category: e.target.value })} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}>
                  <option value="Grains">Grains</option>
                  <option value="Oils">Oils</option>
                  <option value="Spices">Spices</option>
                  <option value="Meat">Meat</option>
                  <option value="Dairy">Dairy</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>Unit *</label>
                <select value={itemForm.unit} onChange={e => setItemForm({ ...itemForm, unit: e.target.value })} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}>
                  <option value="kg">kg (Kilogram)</option>
                  <option value="Ltr">Ltr (Liter)</option>
                  <option value="pcs">pcs (Pieces)</option>
                  <option value="pkt">pkt (Packets)</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>Minimum Stock Level *</label>
              <input type="number" value={itemForm.minStock} onChange={e => { setItemForm({ ...itemForm, minStock: e.target.value }); setItemErrors({ ...itemErrors, minStock: null }); }} placeholder="e.g. 50" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: itemErrors.minStock ? '1.5px solid #dc2626' : '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }} />
              {itemErrors.minStock && <span style={{ color: '#dc2626', fontSize: '11px', fontWeight: 600, marginTop: '2px', display: 'block' }}>{itemErrors.minStock}</span>}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
              <button type="button" onClick={() => setIsAddItemModalOpen(false)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
              <button type="button" onClick={handleSaveItem} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: '#0f172a', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>Save Item</button>
            </div>
          </div>
        </Modal>
      )}

      {/* 2. ADD PURCHASE MODAL (WITH AUTO CALCULATED TOTAL AMOUNT & UNIT SELECTOR) */}
      {isPurchaseModalOpen && (
        <Modal isOpen={isPurchaseModalOpen} onClose={() => setIsPurchaseModalOpen(false)} title="Add Purchase Order" maxWidth="540px">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '10px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>Supplier Name *</label>
                <input type="text" value={purchaseForm.supplier} onChange={e => { setPurchaseForm({ ...purchaseForm, supplier: e.target.value }); setPurchaseErrors({ ...purchaseErrors, supplier: null }); }} placeholder="e.g. Metro Cash & Carry" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: purchaseErrors.supplier ? '1.5px solid #dc2626' : '1px solid #cbd5e1', fontSize: '13px' }} />
                {purchaseErrors.supplier && <span style={{ color: '#dc2626', fontSize: '11px', fontWeight: 600, marginTop: '2px', display: 'block' }}>{purchaseErrors.supplier}</span>}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>Purchase Date *</label>
                <input type="date" value={purchaseForm.purchaseDate} onChange={e => setPurchaseForm({ ...purchaseForm, purchaseDate: e.target.value })} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>Item *</label>
                <select value={purchaseForm.item} onChange={e => handlePurchaseItemChange(e.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}>
                  {items.map(i => <option key={i.id} value={i.name}>{i.name} ({i.unit})</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>Invoice Number</label>
                <input type="text" value={purchaseForm.invoiceNo} onChange={e => setPurchaseForm({ ...purchaseForm, invoiceNo: e.target.value })} placeholder="e.g. INV-9901" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>Quantity *</label>
                <input type="number" value={purchaseForm.quantity} onChange={e => { setPurchaseForm({ ...purchaseForm, quantity: e.target.value }); setPurchaseErrors({ ...purchaseErrors, quantity: null }); }} placeholder="e.g. 100" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: purchaseErrors.quantity ? '1.5px solid #dc2626' : '1px solid #cbd5e1', fontSize: '13px' }} />
                {purchaseErrors.quantity && <span style={{ color: '#dc2626', fontSize: '11px', fontWeight: 600, marginTop: '2px', display: 'block' }}>{purchaseErrors.quantity}</span>}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>Unit *</label>
                <select value={purchaseForm.unit} onChange={e => { setPurchaseForm({ ...purchaseForm, unit: e.target.value }); setPurchaseErrors({ ...purchaseErrors, unit: null }); }} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: purchaseErrors.unit ? '1.5px solid #dc2626' : '1px solid #cbd5e1', fontSize: '13px' }}>
                  <option value="kg">kg (Kilogram)</option>
                  <option value="Ltr">Ltr (Liter)</option>
                  <option value="pcs">pcs (Pieces)</option>
                  <option value="pkt">pkt (Packets)</option>
                  <option value="box">box (Boxes)</option>
                  <option value="gm">gm (Grams)</option>
                  <option value="bag">bag (Bags)</option>
                  <option value="tin">tin (Tins)</option>
                </select>
                {purchaseErrors.unit && <span style={{ color: '#dc2626', fontSize: '11px', fontWeight: 600, marginTop: '2px', display: 'block' }}>{purchaseErrors.unit}</span>}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>Purchase Rate (₹) *</label>
                <input type="number" value={purchaseForm.rate} onChange={e => { setPurchaseForm({ ...purchaseForm, rate: e.target.value }); setPurchaseErrors({ ...purchaseErrors, rate: null }); }} placeholder="e.g. 90" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: purchaseErrors.rate ? '1.5px solid #dc2626' : '1px solid #cbd5e1', fontSize: '13px' }} />
                {purchaseErrors.rate && <span style={{ color: '#dc2626', fontSize: '11px', fontWeight: 600, marginTop: '2px', display: 'block' }}>{purchaseErrors.rate}</span>}
              </div>
            </div>

            {/* Auto Calculated Total Display */}
            <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>Calculated Total Amount:</span>
              <span style={{ fontSize: '18px', fontWeight: 900, color: 'var(--primary)', fontFamily: "'Outfit', sans-serif" }}>
                ₹{((Number(purchaseForm.quantity) || 0) * (Number(purchaseForm.rate) || 0)).toLocaleString()}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
              <button type="button" onClick={() => setIsPurchaseModalOpen(false)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
              <button type="button" onClick={handleSavePurchase} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: 'var(--primary)', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>Submit Purchase</button>
            </div>
          </div>
        </Modal>
      )}

      {/* VIEW PURCHASE DETAILS MODAL */}
      {isPurchaseDetailModalOpen && selectedPurchase && (
        <Modal isOpen={isPurchaseDetailModalOpen} onClose={() => setIsPurchaseDetailModalOpen(false)} title={`Purchase Order Details (${selectedPurchase.purchaseNo})`} maxWidth="480px">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '10px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b' }}>SUPPLIER</span>
                <p style={{ margin: '2px 0 0 0', fontWeight: 800, color: '#0f172a' }}>{selectedPurchase.supplier}</p>
              </div>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b' }}>PURCHASE DATE</span>
                <p style={{ margin: '2px 0 0 0', fontWeight: 700, color: '#334155' }}>{selectedPurchase.date}</p>
              </div>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b' }}>INVOICE NO.</span>
                <p style={{ margin: '2px 0 0 0', fontWeight: 700, color: '#334155' }}>{selectedPurchase.invoiceNo || 'N/A'}</p>
              </div>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b' }}>STATUS</span>
                <p style={{ margin: '2px 0 0 0' }}>
                  <span style={{ background: '#e6f4ea', color: '#16a34a', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 800 }}>
                    ● {selectedPurchase.status || 'Completed'}
                  </span>
                </p>
              </div>
            </div>

            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>Item:</span>
                <span style={{ fontSize: '13px', fontWeight: 700 }}>{selectedPurchase.item}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: '#64748b' }}>Quantity & Unit:</span>
                <span style={{ fontSize: '13px', fontWeight: 700 }}>{selectedPurchase.quantity} {selectedPurchase.unit || 'kg'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: '#64748b' }}>Purchase Rate:</span>
                <span style={{ fontSize: '13px', fontWeight: 700 }}>₹{selectedPurchase.rate} / {selectedPurchase.unit || 'kg'}</span>
              </div>
              <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '8px', marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>Total Amount:</span>
                <span style={{ fontSize: '18px', fontWeight: 900, color: 'var(--primary)' }}>₹{selectedPurchase.total.toLocaleString()}</span>
              </div>
            </div>

            {selectedPurchase.remarks && (
              <div style={{ background: '#f1f5f9', padding: '10px 12px', borderRadius: '8px', fontSize: '12px', color: '#475569' }}>
                <strong>Remarks:</strong> {selectedPurchase.remarks}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
              <button type="button" onClick={() => setIsPurchaseDetailModalOpen(false)} style={{ padding: '8px 18px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 3. STOCK REQUEST MODAL */}
      {isStockRequestModalOpen && (
        <Modal isOpen={isStockRequestModalOpen} onClose={() => setIsStockRequestModalOpen(false)} title="New Stock Request to Central HQ" maxWidth="460px">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>Item *</label>
              <select value={stockReqForm.item} onChange={e => setStockReqForm({ ...stockReqForm, item: e.target.value })} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}>
                {items.map(i => <option key={i.id} value={i.name}>{i.name} ({i.unit})</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>Required Quantity *</label>
              <input type="number" value={stockReqForm.reqQty} onChange={e => setStockReqForm({ ...stockReqForm, reqQty: e.target.value })} placeholder="e.g. 50" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: stockReqErrors.reqQty ? '1.5px solid #dc2626' : '1px solid #cbd5e1', fontSize: '13px' }} />
              {stockReqErrors.reqQty && <span style={{ color: '#dc2626', fontSize: '11px', fontWeight: 600, marginTop: '2px', display: 'block' }}>{stockReqErrors.reqQty}</span>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>Reason / Remarks</label>
              <textarea value={stockReqForm.remarks} onChange={e => setStockReqForm({ ...stockReqForm, remarks: e.target.value })} placeholder="Reason for replenishment..." rows={3} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
              <button type="button" onClick={() => setIsStockRequestModalOpen(false)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
              <button type="button" onClick={handleSaveStockRequest} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: 'var(--primary)', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>Submit Request</button>
            </div>
          </div>
        </Modal>
      )}

      {/* 4. BRANCH REQUEST DETAILS MODAL */}
      {isRequestDetailModalOpen && selectedRequest && (
        <Modal isOpen={isRequestDetailModalOpen} onClose={() => setIsRequestDetailModalOpen(false)} title={`Request Details (${selectedRequest.requestNo})`} maxWidth="500px">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '10px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b' }}>REQUEST NO.</span>
                <p style={{ margin: '2px 0 0 0', fontWeight: 800, color: 'var(--primary)', fontFamily: 'monospace' }}>{selectedRequest.requestNo}</p>
              </div>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b' }}>BRANCH</span>
                <p style={{ margin: '2px 0 0 0', fontWeight: 800, color: '#0f172a' }}>{selectedRequest.branch}</p>
              </div>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b' }}>REQUEST DATE</span>
                <p style={{ margin: '2px 0 0 0', fontWeight: 700, color: '#334155' }}>{selectedRequest.date}</p>
              </div>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b' }}>STATUS</span>
                <p style={{ margin: '2px 0 0 0' }}>
                  <span style={{
                    background: selectedRequest.status === 'Completed' ? '#e6f4ea' : selectedRequest.status === 'Approved' ? '#eff6ff' : selectedRequest.status === 'Dispatched' ? '#f3e8ff' : selectedRequest.status === 'Rejected' ? '#fef2f2' : '#fef3c7',
                    color: selectedRequest.status === 'Completed' ? '#16a34a' : selectedRequest.status === 'Approved' ? '#2563eb' : selectedRequest.status === 'Dispatched' ? '#8b5cf6' : selectedRequest.status === 'Rejected' ? '#dc2626' : '#d97706',
                    padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 800
                  }}>
                    ● {selectedRequest.status}
                  </span>
                </p>
              </div>
            </div>

            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: '#64748b' }}>Item Name:</span>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>{selectedRequest.item}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: '#64748b' }}>Requested Quantity:</span>
                <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--primary)' }}>{selectedRequest.reqQty}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: '#64748b' }}>Unit:</span>
                <span style={{ fontSize: '13px', fontWeight: 700 }}>{selectedRequest.unit || 'kg'}</span>
              </div>
            </div>

            <div style={{ background: '#f1f5f9', padding: '10px 12px', borderRadius: '8px', fontSize: '12px', color: '#475569' }}>
              <strong>Remarks:</strong> {selectedRequest.remarks || 'No remarks specified.'}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
              {selectedRequest.status === 'Pending' && (
                <>
                  <button type="button" onClick={() => handleApproveRequest(selectedRequest)} style={{ background: '#e6f4ea', border: '1px solid #bbf7d0', color: '#16a34a', padding: '8px 14px', borderRadius: '8px', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer' }}>
                    Approve
                  </button>
                  <button type="button" onClick={() => handleRejectRequest(selectedRequest)} style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '8px 14px', borderRadius: '8px', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer' }}>
                    Reject
                  </button>
                </>
              )}
              {selectedRequest.status === 'Approved' && (
                <button type="button" onClick={() => { setIsRequestDetailModalOpen(false); setDistributeForm({ requestNo: selectedRequest.requestNo, branch: selectedRequest.branch, item: selectedRequest.item, requestedQty: selectedRequest.reqQty, approvedQty: selectedRequest.appQty || selectedRequest.reqQty, distributedQty: selectedRequest.appQty || selectedRequest.reqQty, distDate: new Date().toISOString().split('T')[0], remarks: '' }); setDistributeErrors({}); setIsDistributeModalOpen(true); }} style={{ background: '#0f172a', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <TruckIcon size={14} /> Distribute Stock
                </button>
              )}
              <button type="button" onClick={() => setIsRequestDetailModalOpen(false)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer' }}>
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 5. STOCK DISTRIBUTION FORM MODAL */}
      {isDistributeModalOpen && (
        <Modal isOpen={isDistributeModalOpen} onClose={() => setIsDistributeModalOpen(false)} title="Stock Distribution Order" maxWidth="520px">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '10px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>Request No. *</label>
                <input type="text" value={distributeForm.requestNo} onChange={e => { setDistributeForm({ ...distributeForm, requestNo: e.target.value }); setDistributeErrors({ ...distributeErrors, requestNo: null }); }} placeholder="e.g. BR-REQ-001" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: distributeErrors.requestNo ? '1.5px solid #dc2626' : '1px solid #cbd5e1', fontSize: '13px' }} />
                {distributeErrors.requestNo && <span style={{ color: '#dc2626', fontSize: '11px', fontWeight: 600, marginTop: '2px', display: 'block' }}>{distributeErrors.requestNo}</span>}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>Branch *</label>
                <input type="text" value={distributeForm.branch} onChange={e => { setDistributeForm({ ...distributeForm, branch: e.target.value }); setDistributeErrors({ ...distributeErrors, branch: null }); }} placeholder="e.g. Serviq Chennai Branch" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: distributeErrors.branch ? '1.5px solid #dc2626' : '1px solid #cbd5e1', fontSize: '13px' }} />
                {distributeErrors.branch && <span style={{ color: '#dc2626', fontSize: '11px', fontWeight: 600, marginTop: '2px', display: 'block' }}>{distributeErrors.branch}</span>}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>Item *</label>
                <input type="text" value={distributeForm.item} onChange={e => { setDistributeForm({ ...distributeForm, item: e.target.value }); setDistributeErrors({ ...distributeErrors, item: null }); }} placeholder="e.g. Basmati Rice" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: distributeErrors.item ? '1.5px solid #dc2626' : '1px solid #cbd5e1', fontSize: '13px' }} />
                {distributeErrors.item && <span style={{ color: '#dc2626', fontSize: '11px', fontWeight: 600, marginTop: '2px', display: 'block' }}>{distributeErrors.item}</span>}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>Requested Quantity</label>
                <input type="number" value={distributeForm.requestedQty} readOnly style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: '13px', fontWeight: 700, color: '#64748b' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>Approved Quantity *</label>
                <input type="number" value={distributeForm.approvedQty} onChange={e => { setDistributeForm({ ...distributeForm, approvedQty: e.target.value }); setDistributeErrors({ ...distributeErrors, approvedQty: null }); }} placeholder="e.g. 50" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: distributeErrors.approvedQty ? '1.5px solid #dc2626' : '1px solid #cbd5e1', fontSize: '13px' }} />
                {distributeErrors.approvedQty && <span style={{ color: '#dc2626', fontSize: '11px', fontWeight: 600, marginTop: '2px', display: 'block' }}>{distributeErrors.approvedQty}</span>}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>Distributed Quantity *</label>
                <input type="number" value={distributeForm.distributedQty} onChange={e => { setDistributeForm({ ...distributeForm, distributedQty: e.target.value }); setDistributeErrors({ ...distributeErrors, distributedQty: null }); }} placeholder="e.g. 50" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: distributeErrors.distributedQty ? '1.5px solid #dc2626' : '1px solid #cbd5e1', fontSize: '13px' }} />
                {distributeErrors.distributedQty && <span style={{ color: '#dc2626', fontSize: '11px', fontWeight: 600, marginTop: '2px', display: 'block' }}>{distributeErrors.distributedQty}</span>}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>Distribution Date *</label>
              <input type="date" value={distributeForm.distDate} onChange={e => setDistributeForm({ ...distributeForm, distDate: e.target.value })} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: distributeErrors.distDate ? '1.5px solid #dc2626' : '1px solid #cbd5e1', fontSize: '13px' }} />
              {distributeErrors.distDate && <span style={{ color: '#dc2626', fontSize: '11px', fontWeight: 600, marginTop: '2px', display: 'block' }}>{distributeErrors.distDate}</span>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>Remarks</label>
              <textarea value={distributeForm.remarks} onChange={e => setDistributeForm({ ...distributeForm, remarks: e.target.value })} placeholder="Distribution notes or tracking details..." rows={3} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
              <button type="button" onClick={() => setIsDistributeModalOpen(false)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
              <button type="button" onClick={handleSaveDistribution} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: '#0f172a', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>Dispatch Distribution</button>
            </div>
          </div>
          Working.
          
        </Modal>
      )}

      {/* STOCK DISTRIBUTION DETAIL MODAL */}
      {isDistDetailModalOpen && selectedDistribution && (
        <Modal isOpen={isDistDetailModalOpen} onClose={() => setIsDistDetailModalOpen(false)} title={`Stock Distribution Details - ${selectedDistribution.distNo}`} maxWidth="500px">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '10px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', display: 'block' }}>DISTRIBUTION NO.</span>
                <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--primary)', fontFamily: 'monospace' }}>{selectedDistribution.distNo}</span>
              </div>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', display: 'block' }}>REQUEST NO.</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>{selectedDistribution.requestNo}</span>
              </div>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', display: 'block' }}>BRANCH</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{selectedDistribution.branch}</span>
              </div>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', display: 'block' }}>DISTRIBUTION DATE</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{selectedDistribution.date}</span>
              </div>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', display: 'block' }}>ITEM</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{selectedDistribution.item}</span>
              </div>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', display: 'block' }}>DISTRIBUTED QUANTITY</span>
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#16a34a' }}>{selectedDistribution.distQty} units</span>
              </div>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', display: 'block' }}>STATUS</span>
                <span style={{ background: '#eff6ff', color: '#2563eb', padding: '3px 9px', borderRadius: '12px', fontSize: '11px', fontWeight: 800, display: 'inline-block', marginTop: '2px' }}>
                  ● {selectedDistribution.status}
                </span>
              </div>
            </div>

            <div style={{ background: '#f1f5f9', padding: '10px 12px', borderRadius: '8px', fontSize: '12px', color: '#475569' }}>
              <strong>Remarks:</strong> {selectedDistribution.remarks || 'No remarks specified.'}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
              <button type="button" onClick={() => setIsDistDetailModalOpen(false)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer' }}>
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* TRANSACTION DETAIL MODAL */}
      {isTxnDetailModalOpen && selectedTransaction && (
        <Modal isOpen={isTxnDetailModalOpen} onClose={() => setIsTxnDetailModalOpen(false)} title={`Transaction Details - ${selectedTransaction.txnNo}`} maxWidth="500px">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '10px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', display: 'block' }}>TRANSACTION NO.</span>
                <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--primary)', fontFamily: 'monospace' }}>{selectedTransaction.txnNo}</span>
              </div>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', display: 'block' }}>TRANSACTION DATE</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{selectedTransaction.date}</span>
              </div>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', display: 'block' }}>TRANSACTION TYPE</span>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>{selectedTransaction.type}</span>
              </div>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', display: 'block' }}>REFERENCE NO.</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>{selectedTransaction.refNo || '-'}</span>
              </div>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', display: 'block' }}>ITEM</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{selectedTransaction.item}</span>
              </div>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', display: 'block' }}>QUANTITY & UNIT</span>
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#16a34a' }}>{selectedTransaction.quantity} {selectedTransaction.unit || 'kg'}</span>
              </div>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', display: 'block' }}>SOURCE</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{selectedTransaction.source || '-'}</span>
              </div>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', display: 'block' }}>DESTINATION</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{selectedTransaction.destination || '-'}</span>
              </div>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', display: 'block' }}>STATUS</span>
                <span style={{
                  background: selectedTransaction.status === 'Completed' ? '#e6f4ea' : selectedTransaction.status === 'Dispatched' ? '#eff6ff' : '#fef3c7',
                  color: selectedTransaction.status === 'Completed' ? '#16a34a' : selectedTransaction.status === 'Dispatched' ? '#2563eb' : '#d97706',
                  padding: '3px 9px', borderRadius: '12px', fontSize: '11px', fontWeight: 800, display: 'inline-block', marginTop: '2px'
                }}>
                  ● {selectedTransaction.status || 'Completed'}
                </span>
              </div>
            </div>

            <div style={{ background: '#f1f5f9', padding: '10px 12px', borderRadius: '8px', fontSize: '12px', color: '#475569' }}>
              <strong>Remarks:</strong> {selectedTransaction.remarks || 'Transaction logged automatically by system.'}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
              <button type="button" onClick={() => setIsTxnDetailModalOpen(false)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer' }}>
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 6. CONFIRMATION MODAL FOR DELETE / REJECT */}
      {confirmDelete.isOpen && (
        <Modal isOpen={confirmDelete.isOpen} onClose={() => setConfirmDelete({ isOpen: false, type: '', id: null, title: '', message: '' })} title={confirmDelete.title} maxWidth="400px">
          <div style={{ paddingTop: '10px' }}>
            <p style={{ margin: '0 0 16px 0', fontSize: '13.5px', color: '#334155', lineHeight: 1.5 }}>
              {confirmDelete.message}
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" onClick={() => setConfirmDelete({ isOpen: false, type: '', id: null, title: '', message: '' })} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
              <button type="button" onClick={handleConfirmDeleteAction} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#dc2626', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>Confirm</button>
            </div>
          </div>
        </Modal>
      )}

    </section>
  );
}
