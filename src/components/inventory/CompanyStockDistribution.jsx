import React, { useState } from 'react';
import { SearchIcon, EyeIcon, ArrowLeftIcon, filterInputStyle, PaginationBar, preventSpaceInput, actionIconBtnStyle } from './InventoryCommon';

export default function CompanyStockDistribution({ distributions = [], onSaveDistribution }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(0);

  // View Modal State
  const [selectedDist, setSelectedDist] = useState(null);

  // Dynamic filter lists
  const branchesList = ['All', ...new Set(distributions.map(d => d.branch).filter(Boolean))];
  const statusesList = ['All', ...new Set(distributions.map(d => d.status).filter(Boolean))];

  // Filtering
  const filteredDists = distributions.filter(d => {
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch = !q ||
      (d.distNo && d.distNo.toLowerCase().includes(q)) ||
      (d.requestNo && d.requestNo.toLowerCase().includes(q)) ||
      (d.branch && d.branch.toLowerCase().includes(q)) ||
      (d.item && d.item.toLowerCase().includes(q));

    const matchesBranch = branchFilter === 'All' || d.branch === branchFilter;
    const matchesStatus = statusFilter === 'All' || d.status === statusFilter;

    return matchesSearch && matchesBranch && matchesStatus;
  });

  const PAGE_SIZE = 10;
  const paginatedDists = filteredDists.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  return (
    <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', padding: '24px', width: '100%', boxSizing: 'border-box' }}>
      
      {/* 1. Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>
            Stock Distribution
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
            Dispatch and monitor central warehouse stock distributed to outlet branches
          </p>
        </div>
      </div>

      {/* 2. Filter Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '20px', background: '#f8fafc', padding: '14px 18px', borderRadius: '12px', border: '1px solid #edf2f7' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', flex: 1, minWidth: '280px' }}>
          
          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: '220px', flex: 1, maxWidth: '340px' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
              <SearchIcon size={14} color="#94a3b8" />
            </span>
            <input
              type="text"
              placeholder="Search by dist no, branch, item..."
              value={searchTerm}
              onKeyDown={preventSpaceInput}
              onChange={e => { setSearchTerm(e.target.value.replace(/\s/g, '')); setCurrentPage(0); }}
              style={{ ...filterInputStyle, paddingLeft: '34px', width: '100%' }}
            />
          </div>

          {/* Branch Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>Branch:</span>
            <select
              value={branchFilter}
              onChange={e => { setBranchFilter(e.target.value); setCurrentPage(0); }}
              style={filterInputStyle}
            >
              {branchesList.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>Status:</span>
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setCurrentPage(0); }}
              style={filterInputStyle}
            >
              {statusesList.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 3. Distribution Table */}
      <div style={{ overflowX: 'auto', width: '100%' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '850px' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px' }}>
              <th style={{ padding: '12px 16px', fontWeight: 800, width: '50px' }}>S.No</th>
              <th style={{ padding: '12px 16px', fontWeight: 800 }}>Distribution No.</th>
              <th style={{ padding: '12px 16px', fontWeight: 800 }}>Request No.</th>
              <th style={{ padding: '12px 16px', fontWeight: 800 }}>Branch</th>
              <th style={{ padding: '12px 16px', fontWeight: 800 }}>Item</th>
              <th style={{ padding: '12px 16px', fontWeight: 800, textAlign: 'center' }}>Distributed Quantity</th>
              <th style={{ padding: '12px 16px', fontWeight: 800 }}>Distribution Date</th>
              <th style={{ padding: '12px 16px', fontWeight: 800, textAlign: 'center' }}>Status</th>
              <th style={{ padding: '12px 16px', fontWeight: 800, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedDists.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ padding: '36px 14px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                  No stock distributions found. Dispatch requests from the Branch Requests module.
                </td>
              </tr>
            ) : (
              paginatedDists.map((d, index) => (
                <tr
                  key={d.id || index}
                  style={{
                    borderBottom: '1px solid #f1f5f9',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
                >
                  <td style={{ padding: '10px 14px', fontSize: '12.5px', color: '#64748b' }}>
                    {currentPage * PAGE_SIZE + index + 1}
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: '13px', fontWeight: 700, color: 'var(--primary)', fontFamily: 'monospace' }}>
                    {d.distNo}
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: '12.5px', color: '#475569', fontWeight: 600 }}>
                    {d.requestNo || 'Direct Transfer'}
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                    {d.branch}
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                    {d.item}
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: '13px', fontWeight: 800, color: '#0f172a', textAlign: 'center' }}>
                    {d.distQty}
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: '12px', color: '#64748b' }}>
                    {d.date}
                  </td>
                  <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '3px 10px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 700,
                      background: '#eff6ff',
                      color: '#2563eb',
                      border: '1px solid #bfdbfe'
                    }}>
                      {d.status || 'Dispatched'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                    <button
                      type="button"
                      onClick={() => setSelectedDist(d)}
                      title="View Details"
                      style={{
                        ...actionIconBtnStyle,
                        background: '#eff6ff',
                        color: '#2563eb',
                        border: '1px solid #bfdbfe'
                      }}
                    >
                      <EyeIcon size={15} color="#2563eb" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 4. Pagination */}
      <PaginationBar
        totalItems={filteredDists.length}
        pageSize={PAGE_SIZE}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

      {/* 5. Detail Modal */}
      {selectedDist && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '480px', width: '100%', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ padding: '18px 22px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                Stock Distribution Details
              </h3>
              <button
                type="button"
                onClick={() => setSelectedDist(null)}
                style={{ background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Distribution No:</span>
                <span style={{ fontWeight: 800, color: 'var(--primary)', fontFamily: 'monospace' }}>{selectedDist.distNo}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Request No:</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{selectedDist.requestNo || 'Direct Request'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Branch:</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{selectedDist.branch}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Item:</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{selectedDist.item}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Requested Quantity:</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{selectedDist.requestedQty || selectedDist.distQty}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Approved Quantity:</span>
                <span style={{ fontWeight: 700, color: '#0284c7' }}>{selectedDist.approvedQty || selectedDist.distQty}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Distributed Quantity:</span>
                <span style={{ fontWeight: 800, color: '#16a34a', fontSize: '15px' }}>{selectedDist.distQty}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Distribution Date:</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{selectedDist.date}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Status:</span>
                <span style={{ fontWeight: 700, color: '#2563eb' }}>{selectedDist.status || 'Dispatched'}</span>
              </div>
              {selectedDist.remarks && (
                <div style={{ marginTop: '8px', padding: '10px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>Remarks:</span>
                  <span style={{ color: '#64748b' }}>{selectedDist.remarks}</span>
                </div>
              )}
            </div>
            <div style={{ padding: '14px 22px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setSelectedDist(null)}
                style={{ background: '#0f172a', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '8px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
