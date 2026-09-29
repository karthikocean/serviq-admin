import React, { useState } from 'react';
import { SearchIcon, EyeIcon, ArrowLeftIcon, filterInputStyle, PaginationBar } from './InventoryCommon';

export default function CompanyTransactions({ transactions }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [txnTypeFilter, setTxnTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(0);

  // View Detail State
  const [selectedTxn, setSelectedTxn] = useState(null);

  const txnTypes = ['All', 'Purchase', 'Distribution', 'Stock Request', 'Transfer', 'Adjustment', 'Receipt'];

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = !searchTerm.trim() ||
      t.txnNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.refNo && t.refNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.source && t.source.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.destination && t.destination.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = txnTypeFilter === 'All' || t.type === txnTypeFilter;
    const matchesStatus = statusFilter === 'All' || (t.status || 'Completed') === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
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
              <span style={{ color: '#64748b', display: 'block', fontSize: '12px' }}>Date & Time</span>
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
              <span style={{ color: '#64748b', display: 'block', fontSize: '12px' }}>Quantity</span>
              <span style={{ color: '#0f172a', fontWeight: 700 }}>{selectedTxn.quantity} {selectedTxn.unit}</span>
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
      {/* Filters Bar */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ position: 'relative', width: '240px' }}>
            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}>
              <SearchIcon size={14} />
            </span>
            <input
              type="text"
              placeholder="Search reference, item, txn..."
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(0); }}
              style={{ ...filterInputStyle, paddingLeft: '32px' }}
            />
          </div>

          {/* Type Filter */}
          <div style={{ width: '160px' }}>
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

      {/* Transactions Table: Reference no, Status, Action */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px' }}>
              <th style={{ padding: '12px 16px', fontWeight: 800 }}>Txn ID</th>
              <th style={{ padding: '12px 16px', fontWeight: 800 }}>Date & Time</th>
              <th style={{ padding: '12px 16px', fontWeight: 800 }}>Type</th>
              <th style={{ padding: '12px 16px', fontWeight: 800 }}>Item</th>
              <th style={{ padding: '12px 16px', fontWeight: 800 }}>Qty</th>
              <th style={{ padding: '12px 16px', fontWeight: 800 }}>Reference No</th>
              <th style={{ padding: '12px 16px', fontWeight: 800 }}>Status</th>
              <th style={{ padding: '12px 16px', fontWeight: 800, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTxns.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                  No transactions found matching criteria.
                </td>
              </tr>
            ) : (
              paginatedTxns.map(t => (
                <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0f172a' }}>{t.txnNo}</td>
                  <td style={{ padding: '14px 16px', color: '#64748b' }}>{t.date}</td>
                  <td style={{ padding: '14px 16px', fontWeight: 600, color: '#0f172a' }}>{t.type}</td>
                  <td style={{ padding: '14px 16px', fontWeight: 800, color: '#0f172a' }}>{t.item}</td>
                  <td style={{ padding: '14px 16px', color: '#0f172a' }}>{t.quantity} {t.unit}</td>
                  <td style={{ padding: '14px 16px', fontWeight: 800, color: '#ff5a1f' }}>{t.refNo || 'N/A'}</td>
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
                    <button
                      type="button"
                      onClick={() => setSelectedTxn(t)}
                      style={{
                        background: '#f1f5f9',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        color: '#0f172a',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <EyeIcon size={13} />
                      <span>View</span>
                    </button>
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
