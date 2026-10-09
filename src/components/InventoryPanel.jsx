import React, { useState } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { useAppState } from '../config/AppContext';
import ShowNotifications from '../helper/ShowNotifications';
import { isUserCompanyUser } from '../helper/BranchHelper.js';

// Modular Inventory Sub-Components
import CompanyInventoryItems from './inventory/CompanyInventoryItems';
import CompanyCentralStock from './inventory/CompanyCentralStock';
import CompanyPurchases from './inventory/CompanyPurchases';
import CompanyBranchRequests from './inventory/CompanyBranchRequests';
import CompanyTransactions from './inventory/CompanyTransactions';
import CompanyVendors from './inventory/CompanyVendors';
import CompanyStockDistribution from './inventory/CompanyStockDistribution';

import BranchMyStock from './inventory/BranchMyStock';
import BranchStockRequest from './inventory/BranchStockRequest';
import BranchTransfer from './inventory/BranchTransfer';
import BranchDirectPurchase from './inventory/BranchDirectPurchase';
import BranchStockReceipt from './inventory/BranchStockReceipt';
import BranchTransactions from './inventory/BranchTransactions';

import { BoxIcon } from './inventory/InventoryCommon';

// Initial Datasets (Empty - Fetched dynamically from database API)
const INITIAL_INVENTORY_ITEMS = [];
const INITIAL_PURCHASES = [];
const INITIAL_BRANCH_REQUESTS = [];
const INITIAL_DISTRIBUTIONS = [];
const INITIAL_TRANSFERS = [];
const INITIAL_RECEIPTS = [];
const INITIAL_TRANSACTIONS = [];

export default function InventoryPanel() {
  const { currentUser, selectedBranchId, hasPermission } = useAppState();
  const location = useLocation();

  const isCompanyUser = isUserCompanyUser(currentUser);
  const isCompanySelected = isCompanyUser && (!selectedBranchId || selectedBranchId === 'ALL' || selectedBranchId === 'All' || String(selectedBranchId).toUpperCase() === 'COMPANY');
  const scope = isCompanySelected ? 'COMPANY' : 'BRANCH';

  // Shared Datasets
  const [items, setItems] = useState(INITIAL_INVENTORY_ITEMS);
  const [purchases, setPurchases] = useState(INITIAL_PURCHASES);
  const [branchRequests, setBranchRequests] = useState(INITIAL_BRANCH_REQUESTS);
  const [distributions, setDistributions] = useState(INITIAL_DISTRIBUTIONS);
  const [transfers, setTransfers] = useState(INITIAL_TRANSFERS);
  const [receipts, setReceipts] = useState(INITIAL_RECEIPTS);
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);

  // Active Path matching
  const currentPath = location.pathname;

  // Valid route lists per scope
  const companyRoutes = [
    '/inventory/items',
    '/inventory/central-stock',
    '/inventory/purchases',
    '/inventory/vendors',
    '/inventory/branch-requests',
    '/inventory/distribution',
    '/inventory/stock-distribution',
    '/inventory/branch-transfer',
    '/inventory/transactions'
  ];

  const branchRoutes = [
    '/inventory/my-stock',
    '/inventory/stock-request',
    '/inventory/branch-transfer',
    '/inventory/direct-purchase',
    '/inventory/stock-receipt',
    '/inventory/transactions'
  ];

  // Auto-redirect if route is invalid for current active scope
  if (scope === 'COMPANY') {
    if (!companyRoutes.includes(currentPath)) {
      return <Navigate to="/inventory/items" replace />;
    }
  } else {
    if (!branchRoutes.includes(currentPath)) {
      return <Navigate to="/inventory/my-stock" replace />;
    }
  }

  // -------------------------------------------------------------
  // HANDLERS FOR COMPANY ACTIONS
  // -------------------------------------------------------------
  const handleSaveCompanyItem = (formData, editingItem) => {
    if (editingItem) {
      setItems(prev => prev.map(i => i.id === editingItem.id ? { ...i, ...formData, minStock: Number(formData.minStock) } : i));
      ShowNotifications.showAlertNotification('Inventory item updated successfully!', true);
    } else {
      const newItem = {
        id: `INV-${String(items.length + 1).padStart(3, '0')}`,
        name: formData.name,
        category: formData.category,
        unit: formData.unit,
        minStock: Number(formData.minStock),
        centralStock: 100,
        branchStock: 20,
        status: formData.status || 'Active'
      };
      setItems(prev => [newItem, ...prev]);
      ShowNotifications.showAlertNotification('New inventory item added successfully!', true);
    }
  };

  const handleDeleteCompanyItem = (item) => {
    setItems(prev => prev.filter(i => i.id !== item.id));
    ShowNotifications.showAlertNotification(`Item ${item.name} deleted!`, true);
  };

  const handleUpdateCentralStock = (itemId, newQty, reason) => {
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, centralStock: newQty } : i));

    const matched = items.find(i => i.id === itemId);
    const newTxn = {
      id: `TXN-${Date.now().toString().slice(-4)}`,
      txnNo: `TXN-${new Date().getFullYear()}-${String(transactions.length + 1).padStart(3, '0')}`,
      date: `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      type: 'Adjustment',
      item: matched ? matched.name : 'Stock Item',
      quantity: newQty,
      unit: matched ? matched.unit : 'kg',
      source: 'Central Audit',
      destination: 'Central Stock',
      refNo: `AUDIT-${Date.now().toString().slice(-4)}`,
      status: 'Completed'
    };
    setTransactions(prev => [newTxn, ...prev]);

    ShowNotifications.showAlertNotification(`Central stock updated to ${newQty}! (${reason})`, true);
  };

  const handleSaveCompanyPurchase = (formData) => {
    const qty = Number(formData.quantity);
    const rate = Number(formData.rate);
    const total = qty * rate;
    const count = purchases.length + 1;
    const poNo = `PU-${String(count).padStart(3, '0')}`;

    const newPO = {
      id: `PUR-${Date.now().toString().slice(-4)}`,
      purchaseNo: poNo,
      purchaseType: formData.purchaseType || 'Material Purchase',
      supplier: formData.supplier,
      date: formData.purchaseDate,
      invoiceNo: formData.invoiceNo || `INV-${Date.now().toString().slice(-4)}`,
      item: formData.item,
      quantity: qty,
      unit: formData.unit || 'kg',
      rate: rate,
      total: total,
      remarks: formData.remarks,
      status: 'Completed'
    };

    setPurchases(prev => [newPO, ...prev]);
    setItems(prev => prev.map(i => i.name === formData.item ? { ...i, centralStock: i.centralStock + qty } : i));

    const newTxn = {
      id: `TXN-${Date.now().toString().slice(-4)}`,
      txnNo: `TXN-${new Date().getFullYear()}-${String(transactions.length + 1).padStart(3, '0')}`,
      date: `${formData.purchaseDate} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      type: 'Purchase',
      item: formData.item,
      quantity: qty,
      unit: formData.unit || 'kg',
      source: `Supplier: ${formData.supplier}`,
      destination: 'Central Stock',
      refNo: poNo,
      status: 'Completed'
    };
    setTransactions(prev => [newTxn, ...prev]);

    ShowNotifications.showAlertNotification(`Purchase ${poNo} (${formData.purchaseType || 'Material Purchase'}) recorded successfully!`, true);
  };

  const handleDeleteCompanyPurchase = (purchase) => {
    setPurchases(prev => prev.filter(p => p.id !== purchase.id));
    ShowNotifications.showAlertNotification(`Purchase ${purchase.purchaseNo} deleted.`, true);
  };

  const handleApproveRequest = (req) => {
    setBranchRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'Approved' } : r));
    ShowNotifications.showAlertNotification(`Branch Request ${req.requestNo} APPROVED!`, true);
  };

  const handleRejectRequest = (req) => {
    setBranchRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'Rejected' } : r));
    ShowNotifications.showAlertNotification(`Branch Request ${req.requestNo} REJECTED.`, false);
  };

  const handleDistributeRequest = (distForm, selectedReq) => {
    const distNo = `DIST-${new Date().getFullYear()}-${String(distributions.length + 1).padStart(3, '0')}`;
    const qty = Number(distForm.distributedQty);

    const newDist = {
      id: `DIST-${Date.now().toString().slice(-4)}`,
      distNo: distNo,
      requestNo: distForm.requestNo,
      branch: distForm.branch,
      item: distForm.item,
      distQty: qty,
      date: distForm.distDate,
      status: 'Dispatched',
      remarks: distForm.remarks
    };

    setDistributions(prev => [newDist, ...prev]);
    setBranchRequests(prev => prev.map(r => r.requestNo === distForm.requestNo ? { ...r, distQty: qty, status: 'Dispatched' } : r));
    setItems(prev => prev.map(i => i.name === distForm.item ? { ...i, centralStock: Math.max(0, i.centralStock - qty) } : i));

    const newTxn = {
      id: `TXN-${Date.now().toString().slice(-4)}`,
      txnNo: `TXN-${new Date().getFullYear()}-${String(transactions.length + 1).padStart(3, '0')}`,
      date: `${distForm.distDate} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      type: 'Distribution',
      item: distForm.item,
      quantity: qty,
      unit: selectedReq ? selectedReq.unit || 'kg' : 'kg',
      source: 'Central Stock',
      destination: distForm.branch,
      refNo: distNo,
      status: 'Dispatched'
    };
    setTransactions(prev => [newTxn, ...prev]);

    ShowNotifications.showAlertNotification(`Stock Distribution ${distNo} DISPATCHED to ${distForm.branch}!`, true);
  };

  // -------------------------------------------------------------
  // HANDLERS FOR BRANCH ACTIONS
  // -------------------------------------------------------------
  const handleUpdateBranchStock = (itemId, newQty) => {
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, branchStock: newQty } : i));
    ShowNotifications.showAlertNotification(`Branch stock updated to ${newQty}!`, true);
  };

  const handleSaveStockRequest = (formData) => {
    const reqNo = `BR-REQ-${String(branchRequests.length + 1).padStart(3, '0')}`;
    const newReq = {
      id: `REQ-${Date.now().toString().slice(-4)}`,
      requestNo: reqNo,
      branch: 'Serviq Chennai Branch',
      date: new Date().toISOString().split('T')[0],
      item: formData.item,
      reqQty: Number(formData.reqQty),
      appQty: Number(formData.reqQty),
      distQty: 0,
      unit: formData.unit || 'kg',
      status: 'Pending',
      remarks: formData.remarks || 'Branch stock replenishment'
    };

    setBranchRequests(prev => [newReq, ...prev]);

    const newTxn = {
      id: `TXN-${Date.now().toString().slice(-4)}`,
      txnNo: `TXN-${new Date().getFullYear()}-${String(transactions.length + 1).padStart(3, '0')}`,
      date: `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      type: 'Stock Request',
      item: formData.item,
      quantity: Number(formData.reqQty),
      unit: formData.unit || 'kg',
      source: 'Serviq Chennai Branch',
      destination: 'Central Warehouse',
      refNo: reqNo,
      status: 'Pending'
    };
    setTransactions(prev => [newTxn, ...prev]);

    ShowNotifications.showAlertNotification(`Stock Request ${reqNo} submitted to Central HQ!`, true);
  };

  const handleSaveTransfer = (formData) => {
    const trfNo = `TRF-${new Date().getFullYear()}-${String(transfers.length + 1).padStart(3, '0')}`;
    const qty = Number(formData.quantity);

    const newTrf = {
      id: `TRF-${Date.now().toString().slice(-4)}`,
      transferNo: trfNo,
      fromBranch: formData.fromBranch,
      toBranch: formData.toBranch,
      date: new Date().toISOString().split('T')[0],
      item: formData.item,
      quantity: qty,
      unit: formData.unit || 'kg',
      status: 'Pending',
      remarks: formData.remarks || 'Inter-branch transfer'
    };

    setTransfers(prev => [newTrf, ...prev]);
    ShowNotifications.showAlertNotification(`Transfer Request ${trfNo} submitted!`, true);
  };

  const handleSaveDirectPurchase = (formData) => {
    const qty = Number(formData.quantity);
    const rate = Number(formData.rate);
    const total = qty * rate;
    const count = purchases.length + 1;
    const poNo = `PU-${String(count).padStart(3, '0')}`;

    const newPO = {
      id: `PUR-${Date.now().toString().slice(-4)}`,
      purchaseNo: poNo,
      purchaseType: formData.purchaseType || 'Vendor Direct Purchase',
      supplier: formData.supplier,
      date: formData.purchaseDate,
      invoiceNo: formData.invoiceNo || `BILL-${Date.now().toString().slice(-4)}`,
      item: formData.item,
      quantity: qty,
      unit: formData.unit || 'kg',
      rate: rate,
      total: total,
      remarks: formData.remarks,
      status: 'Completed'
    };

    setPurchases(prev => [newPO, ...prev]);
    setItems(prev => prev.map(i => i.name === formData.item ? { ...i, branchStock: i.branchStock + qty } : i));

    const newTxn = {
      id: `TXN-${Date.now().toString().slice(-4)}`,
      txnNo: `TXN-${new Date().getFullYear()}-${String(transactions.length + 1).padStart(3, '0')}`,
      date: `${formData.purchaseDate} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      type: 'Direct Purchase',
      item: formData.item,
      quantity: qty,
      unit: formData.unit || 'kg',
      source: `Vendor: ${formData.supplier}`,
      destination: 'Branch Stock',
      refNo: poNo,
      status: 'Completed'
    };
    setTransactions(prev => [newTxn, ...prev]);

    ShowNotifications.showAlertNotification(`Direct Vendor Purchase ${poNo} saved & branch stock updated (+${qty})!`, true);
  };

  const handleSaveReceipt = (formData) => {
    const recNo = `REC-${new Date().getFullYear()}-${String(receipts.length + 1).padStart(3, '0')}`;
    const recQty = Number(formData.receivedQty);

    const newRec = {
      id: `REC-${Date.now().toString().slice(-4)}`,
      receiptNo: recNo,
      reqTrfNo: formData.reqTrfNo,
      source: formData.source,
      item: formData.item,
      sentQty: formData.sentQty || recQty,
      recQty: recQty,
      date: formData.receivedDate,
      status: 'Received',
      remarks: formData.remarks || 'Inspected and verified'
    };

    setReceipts(prev => [newRec, ...prev]);
    setItems(prev => prev.map(i => i.name === formData.item ? { ...i, branchStock: i.branchStock + recQty } : i));
    setBranchRequests(prev => prev.map(r => r.requestNo === formData.reqTrfNo ? { ...r, status: 'Completed' } : r));

    ShowNotifications.showAlertNotification(`Stock Receipt ${recNo} confirmed! Branch stock added (+${recQty}).`, true);
  };

  const handleDeleteReceipt = (receipt) => {
    setReceipts(prev => prev.filter(r => r.id !== receipt.id));
    ShowNotifications.showAlertNotification(`Stock Receipt ${receipt.receiptNo} deleted.`, true);
  };

  return (
    <section className="panel-view active" style={{ padding: scope === 'COMPANY' ? '0 8px 16px 8px' : '0 24px 40px 24px', width: '100%', boxSizing: 'border-box' }}>
      
      {/* 1. TOP MODULE HEADER BAR */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #ff5a1f 0%, #ea580c 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 12px rgba(255, 90, 31, 0.25)'
          }}>
            <BoxIcon size={20} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>
              {scope === 'COMPANY' ? 'Central Inventory HQ' : 'Branch Stock Management'}
            </h2>
            <span style={{ fontSize: '12px', color: '#0b0c0dff' }}>
              {scope === 'COMPANY'
                ? 'Central Warehouse, Multi-Branch Requests & Supplier Valuation'
                : 'Branch Kitchen Ingredients, Restock Requests & Inbound Goods'}
            </span>
          </div>
        </div>

        {/* View Scope Indicator */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: scope === 'COMPANY' ? '#eff6ff' : '#f0fdf4',
          border: scope === 'COMPANY' ? '1px solid #bfdbfe' : '1px solid #bbf7d0',
          padding: '5px 12px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: 700,
          color: scope === 'COMPANY' ? '#1d4ed8' : '#15803d'
        }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: scope === 'COMPANY' ? '#2563eb' : '#16a34a' }}></span>
          <span>{scope === 'COMPANY' ? 'Company HQ Scope' : 'Active Outlet Scope'}</span>
        </div>
      </div>

      {/* 2. MAIN PAGE ROUTE CONTENT */}
      {scope === 'COMPANY' ? (
        <>
          {currentPath === '/inventory/items' && (
            <CompanyInventoryItems
              items={items}
              onSaveItem={handleSaveCompanyItem}
              onDeleteItem={handleDeleteCompanyItem}
              hasPermission={hasPermission}
            />
          )}

          {currentPath === '/inventory/central-stock' && (
            <CompanyCentralStock
              items={items}
              onUpdateStock={handleUpdateCentralStock}
              hasPermission={hasPermission}
            />
          )}

          {currentPath === '/inventory/purchases' && (
            <CompanyPurchases
              purchases={purchases}
              items={items}
              onSavePurchase={handleSaveCompanyPurchase}
              onDeletePurchase={handleDeleteCompanyPurchase}
              hasPermission={hasPermission}
            />
          )}

          {currentPath === '/inventory/vendors' && (
            <CompanyVendors hasPermission={hasPermission} />
          )}

          {currentPath === '/inventory/branch-requests' && (
            <CompanyBranchRequests
              branchRequests={branchRequests}
              onApprove={handleApproveRequest}
              onReject={handleRejectRequest}
              onDistribute={handleDistributeRequest}
              hasPermission={hasPermission}
            />
          )}

          {(currentPath === '/inventory/distribution' || currentPath === '/inventory/stock-distribution') && (
            <CompanyStockDistribution
              distributions={distributions}
              hasPermission={hasPermission}
            />
          )}

          {currentPath === '/inventory/branch-transfer' && (
            <BranchTransfer
              transfers={transfers}
              items={items}
              onSaveTransfer={handleSaveTransfer}
              hasPermission={hasPermission}
            />
          )}

          {currentPath === '/inventory/transactions' && (
            <CompanyTransactions
              transactions={transactions}
              hasPermission={hasPermission}
            />
          )}
        </>
      ) : (
        <>
          {currentPath === '/inventory/my-stock' && (
            <BranchMyStock
              items={items}
              onUpdateBranchStock={handleUpdateBranchStock}
              hasPermission={hasPermission}
            />
          )}

          {currentPath === '/inventory/stock-request' && (
            <BranchStockRequest
              requests={branchRequests}
              items={items}
              onSaveStockRequest={handleSaveStockRequest}
              hasPermission={hasPermission}
            />
          )}

          {currentPath === '/inventory/branch-transfer' && (
            <BranchTransfer
              transfers={transfers}
              items={items}
              onSaveTransfer={handleSaveTransfer}
              hasPermission={hasPermission}
            />
          )}

          {currentPath === '/inventory/direct-purchase' && (
            <BranchDirectPurchase
              purchases={purchases}
              items={items}
              onSaveDirectPurchase={handleSaveDirectPurchase}
              onDeletePurchase={handleDeleteCompanyPurchase}
              hasPermission={hasPermission}
            />
          )}

          {currentPath === '/inventory/stock-receipt' && (
            <BranchStockReceipt
              receipts={receipts}
              distributions={distributions}
              transfers={transfers}
              items={items}
              onSaveReceipt={handleSaveReceipt}
              onDeleteReceipt={handleDeleteReceipt}
              hasPermission={hasPermission}
            />
          )}

          {currentPath === '/inventory/transactions' && (
            <BranchTransactions
              transactions={transactions}
              hasPermission={hasPermission}
            />
          )}
        </>
      )}
    </section>
  );
}
