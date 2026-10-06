import React, { useState } from 'react';
import { SearchIcon, EyeIcon, ArrowLeftIcon, filterInputStyle, PaginationBar, preventSpaceInput, actionIconBtnStyle } from './InventoryCommon';

export default function CompanyTransactions({ transactions = [], hasPermission }) {
  const canView = typeof hasPermission === 'function' ? hasPermission('inventory_transactions', 'view') : true;
  const [searchTerm, setSearchTerm] = useState('');
  const [txnTypeFilter, setTxnTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [itemFilter, setItemFilter] = useState('All');
  const [branchFilter, setBranchFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(0);

  // View Detail State
  const [selectedTxn, setSelectedTxn] = useState(null);

  const txnTypes = ['All', 'Purchase', 'Distribution', 'Stock Request', 'Transfer', 'Adjustment', 'Receipt'];
  const itemsList = ['All', ...new Set(transactions.map(t => t.item).filter(Boolean))];
  const branchesList = ['All', ...new Set(transactions.flatMap(t => [t.branch, t.source, t.destination]).filter(b => Boolean(b) && b !== 'Central Warehouse'))];

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = !searchTerm.trim() ||
      (t.txnNo && t.txnNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.item && t.item.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.refNo && t.refNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.source && t.source.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.destination && t.destination.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = txnTypeFilter === 'All' || t.type === txnTypeFilter;
    const matchesStatus = statusFilter === 'All' || (t.status || 'Completed') === statusFilter;
    const matchesItem = itemFilter === 'All' || t.item === itemFilter;
    const matchesBranch = branchFilter === 'All' || t.branch === branchFilter || t.source === branchFilter || t.destination === branchFilter;

    const tDate = t.date ? t.date.split(' ')[0] : '';
    const matchesStartDate = !startDate || (tDate >= startDate);
    const matchesEndDate = !endDate || (tDate <= endDate);

    return matchesSearch && matchesType && matchesStatus && matchesItem && matchesBranch && matchesStartDate && matchesEndDate;
  });

  const PAGE_SIZE = 10;
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
              Transaction Log Details: {selectedTxn.txnNo}
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
              <span style={{ color: '#64748b', display: 'block', fontSize: '12px' }}>Transaction No</span>
              <strong style={{ color: '#0f172a', fontSize: '15px' }}>{selectedTxn.txnNo}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '12px' }}>Reference No</span>
              <strong style={{ color: '#ff5a1f', fontSize: '15px' }}>{selectedTxn.refNo || 'N/A'}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '12px' }}>Transaction Date</span>
              <span style={{ color: '#0f172a', fontWeight: 600 }}>{selectedTxn.date}</span>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '12px' }}>Transaction Type</span>
              <span style={{ color: '#0f172a', fontWeight: 700 }}>{selectedTxn.type}</span>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '12px' }}>Item</span>
              <span style={{ color: '#0f172a', fontWeight: 800 }}>{selectedTxn.item}</span>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '12px' }}>Quantity & Unit</span>
              <span style={{ color: '#0f172a', fontWeight: 700 }}>{selectedTxn.quantity} {selectedTxn.unit || 'kg'}</span>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '12px' }}>Source</span>
              <span style={{ color: '#475569' }}>{selectedTxn.source || 'N/A'}</span>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '12px' }}>Destination</span>
              <span style={{ color: '#475569' }}>{selectedTxn.destination || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Table / List View
  return (
    <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
      {/* Filters Bar: Date Range, Transaction Type, Item, Branch, Status */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ position: 'relative', width: '200px' }}>
            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}>
              <SearchIcon size={14} />
            </span>
            <input
              type="text"
              placeholder="Search reference, item..."
              value={searchTerm}
              onKeyDown={preventSpaceInput}
              onChange={e => { setSearchTerm(e.target.value.replace(/\s/g, '')); setCurrentPage(0); }}
              style={{ ...filterInputStyle, paddingLeft: '32px' }}
            />
          </div>

          {/* Filter 1: Date Range */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <input
              type="date"
              value={startDate}
              onChange={e => { setStartDate(e.target.value); setCurrentPage(0); }}
              style={{ ...filterInputStyle, width: '135px' }}
              title="From Date"
            />
            <span style={{ color: '#94a3b8', fontSize: '12px' }}>to</span>
            <input
              type="date"
              value={endDate}
              onChange={e => { setEndDate(e.target.value); setCurrentPage(0); }}
              style={{ ...filterInputStyle, width: '135px' }}
              title="To Date"
            />
          </div>

          {/* Filter 2: Transaction Type */}
          <div style={{ width: '150px' }}>
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

          {/* Filter 3: Item */}
          <div style={{ width: '140px' }}>
            <select
              value={itemFilter}
              onChange={e => { setItemFilter(e.target.value); setCurrentPage(0); }}
              style={filterInputStyle}
            >
              <option value="All">All Items</option>
              {itemsList.filter(i => i !== 'All').map(itm => (
                <option key={itm} value={itm}>{itm}</option>
              ))}
            </select>
          </div>

          {/* Filter 4: Branch */}
          <div style={{ width: '150px' }}>
            <select
              value={branchFilter}
              onChange={e => { setBranchFilter(e.target.value); setCurrentPage(0); }}
              style={filterInputStyle}
            >
              <option value="All">All Branches</option>
              {branchesList.filter(b => b !== 'All').map(br => (
                <option key={br} value={br}>{br}</option>
              ))}
            </select>
          </div>

          {/* Filter 5: Status */}
          <div style={{ width: '140px' }}>
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

      {/* Transactions — Table */}
      <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', paddingBottom: '4px' }}>
        <table style={{ width: '100%', minWidth: '1050px', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f95e10', color: '#ffffff' }}>
              <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap', width: '50px' }}>S.No</th>
              <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap' }}>Transaction Date</th>
              <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap' }}>Transaction No.</th>
              <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap' }}>Transaction Type</th>
              <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap' }}>Item</th>
              <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap' }}>Quantity</th>
              <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap' }}>Unit</th>
              <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap' }}>Source</th>
              <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap' }}>Destination</th>
              <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap' }}>Reference No.</th>
              <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap' }}>Status</th>
              <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', whiteSpace: 'nowrap', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTxns.length === 0 ? (
              <tr>
                <td colSpan="12" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                  No transactions found matching criteria.
                </td>
              </tr>
            ) : (
              paginatedTxns.map((t, index) => (
                <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: '#64748b' }}>
                    {currentPage * PAGE_SIZE + index + 1}
                  </td>
                  <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '12px', whiteSpace: 'nowrap' }}>
                    {t.date}
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: 800, color: '#0f172a' }}>
                    {t.txnNo}
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: 600, color: '#0f172a' }}>
                    {t.type}
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: 800, color: '#0f172a' }}>
                    {t.item}
                  </td>
                  <td style={{ padding: '14px 16px', color: '#0f172a', fontWeight: 700 }}>
                    {t.quantity}
                  </td>
                  <td style={{ padding: '14px 16px', color: '#475569', fontWeight: 600 }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      background: '#f1f5f9',
                      borderRadius: '6px',
                      fontSize: '12px',
                      color: '#334155'
                    }}>
                      {t.unit || 'kg'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', color: '#475569' }}>
                    {t.source || '—'}
                  </td>
                  <td style={{ padding: '14px 16px', color: '#475569' }}>
                    {t.destination || '—'}
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: 800, color: '#ff5a1f' }}>
                    {t.refNo || 'N/A'}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
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
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
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
              ))
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
