import React, { useState, useEffect, useCallback } from 'react';
import { SearchIcon, EyeIcon, ArrowLeftIcon, filterInputStyle, PaginationBar, preventSpaceInput, actionIconBtnStyle } from './InventoryCommon';
import { useAppState } from '../../config/AppContext';
import { isBranchMatch, getUserAssignedBranchId } from '../../helper/BranchHelper';
import InventoryApi from '../../api/Inventory';

const formatDate = (dateVal) => {
  if (!dateVal) return '-';
  const str = String(dateVal).trim();
  const datePart = str.split('T')[0].split(' ')[0].trim();
  const parts = datePart.split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    return `${parts[2].padStart(2, '0')}-${parts[1].padStart(2, '0')}-${parts[0]}`;
  }
  if (parts.length === 3 && parts[2].length === 4) {
    return `${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}-${parts[2]}`;
  }
  try {
    const d = new Date(dateVal);
    if (!isNaN(d.getTime())) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${day}-${m}-${y}`;
    }
  } catch {}
  return datePart || '-';
};

export default function BranchTransactions({ transactions, hasPermission }) {
  const { currentUser, selectedBranchId, activeRestaurant } = useAppState();
  const branches = activeRestaurant?.branches || [];

  const userAssignedBranchId = getUserAssignedBranchId(currentUser);
  const effectiveBranchId = userAssignedBranchId || (selectedBranchId && selectedBranchId !== 'ALL' && selectedBranchId !== 'All' && String(selectedBranchId).toUpperCase() !== 'COMPANY' ? selectedBranchId : '');
  const isBranchFiltered = Boolean(effectiveBranchId);

  const canView = typeof hasPermission === 'function' ? hasPermission('inventory_transactions', 'view') : true;
  const [searchTerm, setSearchTerm] = useState('');
  const [txnTypeFilter, setTxnTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [apiTransactions, setApiTransactions] = useState([]);

  // View Detail State
  const [selectedTxn, setSelectedTxn] = useState(null);

  const txnTypes = ['All', 'Direct Purchase', 'Purchase', 'Stock Request', 'Transfer', 'Stock Receipt', 'Adjustment'];

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const branchParams = effectiveBranchId ? { branchId: effectiveBranchId } : {};

      const [purRes, trfRes] = await Promise.allSettled([
        InventoryApi.getPurchases(branchParams),
        InventoryApi.getBranchTransfers(branchParams)
      ]);

      const loadedTxns = [];

      // 1. Direct Purchases & Purchases — ONLY products bought via direct purchase have monetary amount!
      if (purRes.status === 'fulfilled' && purRes.value?.status && purRes.value?.response) {
        const rawPurchases = purRes.value.response.data || purRes.value.response || [];
        if (Array.isArray(rawPurchases)) {
          const scopedPurchases = isBranchFiltered
            ? rawPurchases.filter(p => isBranchMatch(p, effectiveBranchId, branches))
            : rawPurchases;

          scopedPurchases.forEach(p => {
            const purQty = p.purchaseQty !== undefined ? p.purchaseQty : (p.quantity || 0);
            const purRate = p.unitPrice !== undefined ? p.unitPrice : (p.rate || 0);
            const purTotal = p.totalAmount !== undefined ? p.totalAmount : (p.total !== undefined ? p.total : (Number(purQty) || 0) * purRate);

            loadedTxns.push({
              id: p._id || p.id,
              txnNo: p.purchaseNo ? `TXN-${p.purchaseNo}` : `TXN-PUR-${String(p._id || '').slice(-4).toUpperCase()}`,
              date: p.purchaseDate || p.date || p.createdAt,
              type: p.purchaseType || 'Direct Purchase',
              item: p.itemName || p.item || 'Item',
              quantity: purQty,
              unit: p.unit || 'kg',
              amount: purTotal, // Direct purchase amount is displayed!
              rate: purRate,
              source: p.supplierName || p.supplier || 'Local Vendor',
              destination: p.branchName || 'Branch Stock',
              refNo: p.purchaseNo || p.invoiceNumber || p.invoiceNo || 'N/A',
              status: p.status || 'Completed',
              branchId: p.branchId?._id || p.branchId?.id || p.branchId,
              createdAt: p.createdAt || p.purchaseDate || p.date
            });
          });
        }
      }

      // 2. Inter-Branch Transfers — internal stock movements, no payment / amount: null
      if (trfRes.status === 'fulfilled' && trfRes.value?.status && trfRes.value?.response) {
        const rawTransfers = trfRes.value.response.data || trfRes.value.response || [];
        if (Array.isArray(rawTransfers)) {
          const scopedTransfers = isBranchFiltered
            ? rawTransfers.filter(t => isBranchMatch(t, effectiveBranchId, branches) || isBranchMatch(t.fromBranch, effectiveBranchId, branches) || isBranchMatch(t.toBranch, effectiveBranchId, branches))
            : rawTransfers;

          scopedTransfers.forEach(t => {
            loadedTxns.push({
              id: t._id || t.id,
              txnNo: t.transferNo ? `TXN-${t.transferNo}` : `TXN-TRF-${String(t._id || '').slice(-4).toUpperCase()}`,
              date: t.date || t.createdAt,
              type: 'Transfer',
              item: t.item || 'Item',
              quantity: t.quantity || 0,
              unit: t.unit || 'kg',
              amount: null, // Non-monetary, no amount
              source: t.fromBranch || 'Source Branch',
              destination: t.toBranch || 'Destination Branch',
              refNo: t.transferNo || 'N/A',
              status: t.status || 'Completed',
              branchId: t.branchId,
              createdAt: t.createdAt || t.date
            });
          });
        }
      }

      // Sort by newest first
      loadedTxns.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
      setApiTransactions(loadedTxns);
    } catch (err) {
      console.warn('Branch transactions load error:', err);
    } finally {
      setLoading(false);
    }
  }, [effectiveBranchId, isBranchFiltered, branches]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const sourceTransactions = apiTransactions.length > 0
    ? apiTransactions
    : (transactions || []).map(t => ({
        ...t,
        amount: (t.type === 'Direct Purchase' || t.type === 'Purchase')
          ? (t.amount !== undefined ? t.amount : (t.total !== undefined ? t.total : (Number(t.quantity || 0) * Number(t.rate || 0))))
          : null
      }));

  const branchScopedTransactions = isBranchFiltered
    ? sourceTransactions.filter(t => 
        isBranchMatch(t, effectiveBranchId, branches) ||
        isBranchMatch(t.source, effectiveBranchId, branches) ||
        isBranchMatch(t.destination, effectiveBranchId, branches)
      )
    : sourceTransactions;

  const filteredTransactions = branchScopedTransactions.filter(t => {
    const matchesSearch = !searchTerm.trim() ||
      (t.txnNo && t.txnNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.item && t.item.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.refNo && t.refNo.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = txnTypeFilter === 'All' || t.type === txnTypeFilter;
    const matchesStatus = statusFilter === 'All' || (t.status || 'Completed') === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const PAGE_SIZE = 10;
  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / PAGE_SIZE));

  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm, txnTypeFilter, statusFilter, effectiveBranchId]);

  useEffect(() => {
    if (currentPage >= totalPages && totalPages > 0) {
      setCurrentPage(Math.max(0, totalPages - 1));
    }
  }, [totalPages, currentPage]);

  const paginatedTxns = filteredTransactions.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  // Render View Transaction Detail Page View
  if (selectedTxn) {
    return (
      <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              onClick={() => setSelectedTxn(null)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#475569',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <ArrowLeftIcon size={16} />
              <span>Back to Transactions</span>
            </button>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
              Branch Transaction Log: {selectedTxn.txnNo}
            </h2>
          </div>

          <span style={{
            padding: '4px 14px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 800,
            background: selectedTxn.status === 'Completed' || selectedTxn.status === 'Dispatched' ? '#e6f4ea' : '#fef3c7',
            color: selectedTxn.status === 'Completed' || selectedTxn.status === 'Dispatched' ? '#16a34a' : '#d97706'
          }}>
            {selectedTxn.status || 'Completed'}
          </span>
        </div>

        <div style={{ background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', maxWidth: '700px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '13px' }}>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '12px', marginBottom: '3px' }}>Transaction ID</span>
              <strong style={{ color: '#0f172a', fontSize: '15px' }}>{selectedTxn.txnNo}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '12px', marginBottom: '3px' }}>Reference No</span>
              <strong style={{ color: '#ff5a1f', fontSize: '15px' }}>{selectedTxn.refNo || 'N/A'}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '12px', marginBottom: '3px' }}>Date & Time</span>
              <span style={{ color: '#0f172a', fontWeight: 600 }}>{formatDate(selectedTxn.date)}</span>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '12px', marginBottom: '3px' }}>Type</span>
              <span style={{ color: '#0f172a', fontWeight: 700 }}>{selectedTxn.type}</span>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '12px', marginBottom: '3px' }}>Item</span>
              <span style={{ color: '#0f172a', fontWeight: 800 }}>{selectedTxn.item}</span>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '12px', marginBottom: '3px' }}>Quantity</span>
              <span style={{ color: '#0f172a', fontWeight: 700 }}>{selectedTxn.quantity} {selectedTxn.unit || 'kg'}</span>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '12px', marginBottom: '3px' }}>Amount</span>
              <strong style={{ color: selectedTxn.amount ? '#16a34a' : '#64748b', fontSize: '16px' }}>
                {selectedTxn.amount !== null && selectedTxn.amount !== undefined && Number(selectedTxn.amount) > 0
                  ? `₹${Number(selectedTxn.amount).toLocaleString('en-IN')}`
                  : '— (Non-Monetary)'}
              </strong>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '12px', marginBottom: '3px' }}>Source / Vendor</span>
              <span style={{ color: '#0f172a', fontWeight: 600 }}>{selectedTxn.source || '—'}</span>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '12px', marginBottom: '3px' }}>Destination</span>
              <span style={{ color: '#0f172a', fontWeight: 600 }}>{selectedTxn.destination || '—'}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Table View (Filters: Remove--Branch, Table: Reference no, Status, Actions)
  return (
    <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
      {/* Filters Bar WITHOUT Branch filter */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ position: 'relative', width: '240px' }}>
            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}>
              <SearchIcon size={14} />
            </span>
            <input
              type="text"
              placeholder="Search ref no, item..."
              value={searchTerm}
              onKeyDown={preventSpaceInput}
              onChange={e => { setSearchTerm(e.target.value.replace(/\s/g, '')); setCurrentPage(0); }}
              style={{ ...filterInputStyle, paddingLeft: '32px' }}
            />
          </div>

          {/* Type Filter */}
          <div style={{ width: '170px' }}>
            <select
              value={txnTypeFilter}
              onChange={e => { setTxnTypeFilter(e.target.value); setCurrentPage(0); }}
              style={filterInputStyle}
            >
              {txnTypes.map(t => (
                <option key={t} value={t}>{t === 'All' ? 'All Types' : t}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ width: '150px' }}>
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setCurrentPage(0); }}
              style={filterInputStyle}
            >
              <option value="All">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="Dispatched">Dispatched</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table: Amount column included, smooth scrolling */}
      <div style={{
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        background: '#ffffff',
        width: '100%',
        scrollbarWidth: 'thin'
      }}>
        <table style={{ width: '100%', minWidth: '1260px', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f95e10', color: '#ffffff' }}>
              <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap', width: '60px', minWidth: '60px' }}>S.No</th>
              <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap', minWidth: '130px' }}>Transaction Date</th>
              <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap', minWidth: '130px' }}>Transaction No.</th>
              <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap', minWidth: '150px' }}>Transaction Type</th>
              <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap', minWidth: '180px' }}>Item</th>
              <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap', minWidth: '90px' }}>Quantity</th>
              <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap', minWidth: '70px' }}>Unit</th>
              <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap', minWidth: '130px' }}>Amount</th>
              <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap', minWidth: '130px' }}>Reference No.</th>
              <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap', minWidth: '110px' }}>Status</th>
              <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap', minWidth: '80px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="11" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                  Loading branch transaction records...
                </td>
              </tr>
            ) : paginatedTxns.length === 0 ? (
              <tr>
                <td colSpan="11" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                  No branch transaction logs found.
                </td>
              </tr>
            ) : (
              paginatedTxns.map((t, index) => {
                const hasAmount = t.amount !== null && t.amount !== undefined && Number(t.amount) > 0;
                return (
                  <tr key={t.id || index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#64748b', width: '60px', minWidth: '60px', whiteSpace: 'nowrap' }}>
                      {currentPage * PAGE_SIZE + index + 1}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '12px', minWidth: '130px', whiteSpace: 'nowrap' }}>
                      {formatDate(t.date)}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0f172a', minWidth: '130px', whiteSpace: 'nowrap' }}>
                      {t.txnNo}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: '#0f172a', minWidth: '150px', whiteSpace: 'nowrap' }}>
                      {t.type}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 800, color: '#0f172a', minWidth: '180px', whiteSpace: 'nowrap' }}>
                      {t.item}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#0f172a', fontWeight: 700, minWidth: '90px', whiteSpace: 'nowrap' }}>
                      {t.quantity}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#475569', minWidth: '70px', whiteSpace: 'nowrap' }}>
                      {t.unit || 'kg'}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 800, minWidth: '130px', whiteSpace: 'nowrap' }}>
                      {hasAmount ? (
                        <span style={{ color: '#16a34a' }}>₹{Number(t.amount).toLocaleString('en-IN')}</span>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 800, color: '#ff5a1f', minWidth: '130px', whiteSpace: 'nowrap' }}>
                      {t.refNo || 'N/A'}
                    </td>
                    <td style={{ padding: '14px 16px', minWidth: '110px', whiteSpace: 'nowrap' }}>
                      <span style={{
                        padding: '3px 10px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 700,
                        background: t.status === 'Completed' || t.status === 'Dispatched' ? '#e6f4ea' : '#fef3c7',
                        color: t.status === 'Completed' || t.status === 'Dispatched' ? '#16a34a' : '#d97706'
                      }}>
                        {t.status || 'Completed'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right', minWidth: '80px', whiteSpace: 'nowrap' }}>
                      {canView && (
                      <button
                        type="button"
                        onClick={() => setSelectedTxn(t)}
                        title="View Transaction Details"
                        style={{
                          ...actionIconBtnStyle,
                          background: '#eff6ff',
                          border: '1px solid #bfdbfe',
                          color: '#2563eb'
                        }}
                      >
                        <EyeIcon size={15} color="#2563eb" />
                      </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <PaginationBar
        currentPage={currentPage}
        totalItems={filteredTransactions.length}
        pageSize={PAGE_SIZE}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
