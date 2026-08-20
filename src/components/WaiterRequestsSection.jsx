import React, { useState, useMemo } from 'react';
import { useAppState } from '../config/AppContext';
import { Modal } from './Modal';
import ShowNotifications from '../helper/ShowNotifications';
import {
  BellIcon,
  ConciergeBellIcon,
  ClockIcon,
  CheckCircleIcon,
  TrashIcon,
  PlusIcon,
  UserIcon,
  DownloadIcon,
  AlertCircleIcon
} from './Icons';

export default function WaiterRequestsSection({ initialSubTab = 'live' }) {
  const {
    activeRestaurant,
    selectedBranchId,
    addWaiterRequest,
    updateWaiterRequestStatus,
    deleteWaiterRequest
  } = useAppState();

  const [activeSubTab, setActiveSubTab] = useState(initialSubTab); // 'live' | 'history'
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL | Pending | Accepted | Completed
  const [waiterFilter, setWaiterFilter] = useState('ALL');
  const [tableFilter, setTableFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states for manual/simulated Call Waiter
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRequestForm, setNewRequestForm] = useState({
    table: '01',
    requestType: 'Call Waiter',
    assignedStaff: '',
    notes: '',
    branchId: ''
  });

  const rawRequests = activeRestaurant?.waiterRequests || activeRestaurant?.serviceRequests || [];
  const staffList = (activeRestaurant?.staff || []).filter(s => s.role === 'Waiter' || s.role?.toLowerCase().includes('waiter'));
  const allStaffList = activeRestaurant?.staff || [];
  const tablesList = activeRestaurant?.tables || [];

  // Filter requests by branch if selected
  const branchFilteredRequests = useMemo(() => {
    if (!selectedBranchId || selectedBranchId === 'ALL') return rawRequests;
    return rawRequests.filter(r => !r.branchId || r.branchId === selectedBranchId);
  }, [rawRequests, selectedBranchId]);

  // Live active vs Completed History
  const liveRequests = useMemo(() => {
    return branchFilteredRequests.filter(r => r.status === 'Pending' || r.status === 'Accepted' || r.status === 'In Progress');
  }, [branchFilteredRequests]);

  const historyRequests = useMemo(() => {
    return branchFilteredRequests.filter(r => r.status === 'Completed' || r.status === 'Cancelled');
  }, [branchFilteredRequests]);

  // Apply filters on the current active tab
  const displayedRequests = useMemo(() => {
    const source = activeSubTab === 'live' ? branchFilteredRequests : branchFilteredRequests;

    return source.filter(r => {
      // Status filter
      if (statusFilter !== 'ALL') {
        const normStatus = r.status === 'In Progress' ? 'Accepted' : r.status;
        if (normStatus !== statusFilter) return false;
      }

      // Waiter filter
      if (waiterFilter !== 'ALL') {
        const wName = r.assignedWaiterName || r.assignedStaff || '';
        if (wName !== waiterFilter && r.assignedWaiterId !== waiterFilter) return false;
      }

      // Table filter
      if (tableFilter !== 'ALL') {
        const tNum = String(r.table).replace('Table ', '').replace('T-', '');
        if (tNum !== tableFilter) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const tableMatch = String(r.table).toLowerCase().includes(q);
        const waiterMatch = String(r.assignedWaiterName || r.assignedStaff || '').toLowerCase().includes(q);
        const notesMatch = String(r.notes || '').toLowerCase().includes(q);
        const idMatch = String(r.id || '').toLowerCase().includes(q);
        return tableMatch || waiterMatch || notesMatch || idMatch;
      }

      return true;
    });
  }, [branchFilteredRequests, activeSubTab, statusFilter, waiterFilter, tableFilter, searchQuery]);

  // KPI Metrics
  const totalCallsCount = branchFilteredRequests.length;
  const pendingCount = branchFilteredRequests.filter(r => r.status === 'Pending').length;
  const acceptedCount = branchFilteredRequests.filter(r => r.status === 'Accepted' || r.status === 'In Progress').length;
  const completedCount = branchFilteredRequests.filter(r => r.status === 'Completed').length;

  // Actions
  const handleAcceptRequest = (requestId, waiterName) => {
    if (updateWaiterRequestStatus) {
      updateWaiterRequestStatus(activeRestaurant.id, requestId, 'Accepted', waiterName);
    }
    ShowNotifications.showAlertNotification(`Waiter request #${requestId} accepted. Assigned to ${waiterName || 'Waiter'}.`, true);
  };

  const handleCompleteRequest = (requestId) => {
    if (updateWaiterRequestStatus) {
      updateWaiterRequestStatus(activeRestaurant.id, requestId, 'Completed');
    }
    ShowNotifications.showAlertNotification(`Waiter request #${requestId} marked as Completed.`, true);
  };

  const handleReopenRequest = (requestId) => {
    if (updateWaiterRequestStatus) {
      updateWaiterRequestStatus(activeRestaurant.id, requestId, 'Pending');
    }
    ShowNotifications.showAlertNotification(`Request #${requestId} reopened as Pending.`, true);
  };

  const handleReassignWaiter = (requestId, newWaiterName) => {
    if (updateWaiterRequestStatus) {
      updateWaiterRequestStatus(activeRestaurant.id, requestId, undefined, newWaiterName);
    }
    ShowNotifications.showAlertNotification(`Reassigned request #${requestId} to ${newWaiterName}.`, true);
  };

  const handleDelete = (requestId) => {
    if (window.confirm(`Are you sure you want to delete request ${requestId}?`)) {
      if (deleteWaiterRequest) {
        deleteWaiterRequest(activeRestaurant.id, requestId);
      }
      ShowNotifications.showAlertNotification(`Request ${requestId} deleted.`, true);
    }
  };

  // Manual create Call Waiter submit
  const handleCreateRequestSubmit = (e) => {
    e.preventDefault();
    if (!newRequestForm.table) {
      ShowNotifications.showAlertNotification("Please select a table number.", false);
      return;
    }

    // Lookup table's assigned waiter automatically
    const targetTableNum = String(newRequestForm.table).replace('Table ', '').replace('T-', '');
    const foundTable = tablesList.find(t => String(t.id).replace('T-', '') === targetTableNum || String(t.name || '').includes(targetTableNum));
    let assignedWName = newRequestForm.assignedStaff;

    if (!assignedWName && foundTable?.assignedWaiterId) {
      const wObj = allStaffList.find(s => s.id === foundTable.assignedWaiterId || s._id === foundTable.assignedWaiterId);
      if (wObj) assignedWName = wObj.name;
    }

    if (addWaiterRequest) {
      addWaiterRequest(activeRestaurant.id, {
        table: targetTableNum,
        requestType: 'Call Waiter',
        assignedStaff: assignedWName || 'Unassigned',
        assignedWaiterName: assignedWName || 'Unassigned',
        notes: newRequestForm.notes || 'Customer requested assistance at table',
        branchId: selectedBranchId || '60a1b2c3d4e5f6a7b8c9d0e1'
      });
    }

    ShowNotifications.showAlertNotification(`Call Waiter notification sent for Table ${targetTableNum}! Assigned to: ${assignedWName || 'Unassigned'}`, true);
    setShowAddModal(false);
    setNewRequestForm({
      table: '01',
      requestType: 'Call Waiter',
      assignedStaff: '',
      notes: '',
      branchId: ''
    });
  };

  // Export CSV
  const handleExportCSV = () => {
    if (branchFilteredRequests.length === 0) {
      ShowNotifications.showAlertNotification("No waiter request data available to export.", false);
      return;
    }

    const headers = ["Request ID", "Table", "Assigned Waiter", "Request Type", "Request Time", "Accepted Time", "Completed Time", "Status", "Notes"];
    const rows = branchFilteredRequests.map(r => [
      `"${r.id || ''}"`,
      `"Table ${r.table || ''}"`,
      `"${(r.assignedWaiterName || r.assignedStaff || 'Unassigned').replace(/"/g, '""')}"`,
      `"${r.requestType || 'Call Waiter'}"`,
      `"${r.requestTime || r.requestedTime || ''}"`,
      `"${r.acceptedTime || '—'}"`,
      `"${r.completedTime || '—'}"`,
      `"${r.status || 'Pending'}"`,
      `"${(r.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `waiter_requests_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    ShowNotifications.showAlertNotification("Waiter requests report exported to CSV successfully!", true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return {
          bg: '#fee2e2',
          color: '#b91c1c',
          border: '#fecaca',
          label: 'Pending',
          icon: <ClockIcon size={12} color="#b91c1c" />
        };
      case 'Accepted':
      case 'In Progress':
        return {
          bg: '#eff6ff',
          color: '#1d4ed8',
          border: '#bfdbfe',
          label: 'Accepted (On the way)',
          icon: <UserIcon size={12} color="#1d4ed8" />
        };
      case 'Completed':
        return {
          bg: '#dcfce7',
          color: '#15803d',
          border: '#bbf7d0',
          label: 'Completed',
          icon: <CheckCircleIcon size={12} color="#15803d" />
        };
      default:
        return {
          bg: '#f1f5f9',
          color: '#64748b',
          border: '#e2e8f0',
          label: status,
          icon: null
        };
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Sub-tab Navigation (Live vs History) */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: '14px',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => { setActiveSubTab('live'); setStatusFilter('ALL'); }}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              border: activeSubTab === 'live' ? '2px solid var(--primary)' : '1px solid #e2e8f0',
              background: activeSubTab === 'live' ? '#fff7ed' : '#ffffff',
              color: activeSubTab === 'live' ? 'var(--primary)' : '#475569',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <ConciergeBellIcon size={16} color={activeSubTab === 'live' ? 'var(--primary)' : '#64748b'} />
            Live Waiter Calls
            {pendingCount > 0 && (
              <span style={{
                background: '#ea580c',
                color: '#fff',
                fontSize: '10px',
                fontWeight: 900,
                padding: '2px 7px',
                borderRadius: '10px'
              }}>
                {pendingCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => { setActiveSubTab('history'); setStatusFilter('ALL'); }}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              border: activeSubTab === 'history' ? '2px solid var(--primary)' : '1px solid #e2e8f0',
              background: activeSubTab === 'history' ? '#fff7ed' : '#ffffff',
              color: activeSubTab === 'history' ? 'var(--primary)' : '#475569',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <ClockIcon size={16} color={activeSubTab === 'history' ? 'var(--primary)' : '#64748b'} />
            Request History & Logs
            <span style={{
              background: '#f1f5f9',
              color: '#475569',
              fontSize: '11px',
              fontWeight: 700,
              padding: '2px 7px',
              borderRadius: '10px'
            }}>
              {historyRequests.length}
            </span>
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            type="button"
            onClick={handleExportCSV}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1.5px solid #cbd5e1',
              background: '#ffffff',
              color: '#334155',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <DownloadIcon size={14} />
            Export CSV
          </button>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: 'var(--primary)',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <PlusIcon size={14} color="#fff" />
            Simulate Call Waiter
          </button>
        </div>
      </div>

      {/* KPI Stats Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {/* Total Calls */}
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', borderLeft: '4px solid var(--primary)', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Waiter Calls</span>
            <ConciergeBellIcon size={16} color="var(--primary)" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', marginTop: '6px', fontFamily: "'Outfit', sans-serif" }}>
            {totalCallsCount}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>Live customer requests</div>
        </div>

        {/* Pending Calls */}
        <div style={{ background: '#fff5f5', borderRadius: '12px', padding: '16px 20px', border: '1px solid #fecaca', borderLeft: '4px solid #dc2626', boxShadow: '0 2px 10px rgba(220,38,38,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#b91c1c', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pending (Needs Action)</span>
            <ClockIcon size={16} color="#dc2626" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#dc2626', marginTop: '6px', fontFamily: "'Outfit', sans-serif" }}>
            {pendingCount}
          </div>
          <div style={{ fontSize: '11px', color: '#ef4444', fontWeight: 600, marginTop: '2px' }}>Awaiting waiter acceptance</div>
        </div>

        {/* In Service / Accepted */}
        <div style={{ background: '#eff6ff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #bfdbfe', borderLeft: '4px solid #2563eb', boxShadow: '0 2px 10px rgba(37,99,235,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>In Service (Attending)</span>
            <UserIcon size={16} color="#2563eb" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#2563eb', marginTop: '6px', fontFamily: "'Outfit', sans-serif" }}>
            {acceptedCount}
          </div>
          <div style={{ fontSize: '11px', color: '#3b82f6', fontWeight: 600, marginTop: '2px' }}>Waiter heading to table</div>
        </div>

        {/* Resolved / Completed */}
        <div style={{ background: '#f0fdf4', borderRadius: '12px', padding: '16px 20px', border: '1px solid #bbf7d0', borderLeft: '4px solid #16a34a', boxShadow: '0 2px 10px rgba(22,163,74,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Resolved Today</span>
            <CheckCircleIcon size={16} color="#16a34a" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#16a34a', marginTop: '6px', fontFamily: "'Outfit', sans-serif" }}>
            {completedCount}
          </div>
          <div style={{ fontSize: '11px', color: '#22c55e', fontWeight: 600, marginTop: '2px' }}>Attended successfully</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        padding: '16px 20px',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Left Status Filter Chips */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {['ALL', 'Pending', 'Accepted', 'Completed'].map(st => {
            const isSelected = statusFilter === st;
            const count = st === 'ALL' ? branchFilteredRequests.length : st === 'Pending' ? pendingCount : st === 'Accepted' ? acceptedCount : completedCount;
            return (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: isSelected ? '1.5px solid #0f172a' : '1px solid #e2e8f0',
                  background: isSelected ? '#0f172a' : '#ffffff',
                  color: isSelected ? '#ffffff' : '#64748b',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>{st === 'ALL' ? 'All Statuses' : st}</span>
                <span style={{
                  background: isSelected ? 'rgba(255,255,255,0.2)' : '#f1f5f9',
                  color: isSelected ? '#fff' : '#64748b',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  fontSize: '10px'
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Search, Waiter & Table Selectors */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Waiter Filter */}
          <select
            value={waiterFilter}
            onChange={(e) => setWaiterFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '12px',
              fontWeight: 600,
              background: '#fff',
              color: '#334155'
            }}
          >
            <option value="ALL">All Waiters</option>
            {staffList.map(s => (
              <option key={s.id || s._id} value={s.name}>{s.name}</option>
            ))}
          </select>

          {/* Table Filter */}
          <select
            value={tableFilter}
            onChange={(e) => setTableFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '12px',
              fontWeight: 600,
              background: '#fff',
              color: '#334155'
            }}
          >
            <option value="ALL">All Tables</option>
            {tablesList.map(t => (
              <option key={t.id} value={t.id.replace('T-', '')}>Table {t.id.replace('T-', '')}</option>
            ))}
          </select>

          {/* Search Input */}
          <input
            type="text"
            placeholder="Search table, waiter, notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '12px',
              width: '190px',
              outline: 'none'
            }}
          />

          {(searchQuery || statusFilter !== 'ALL' || waiterFilter !== 'ALL' || tableFilter !== 'ALL') && (
            <button
              type="button"
              onClick={() => { setSearchQuery(''); setStatusFilter('ALL'); setWaiterFilter('ALL'); setTableFilter('ALL'); }}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#f1f5f9',
                color: '#475569',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Requests Table */}
      <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#ffffff', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <th style={{ padding: '14px 14px', width: '12%' }}>REQUEST ID</th>
              <th style={{ padding: '14px 14px', width: '13%' }}>TABLE NUMBER</th>
              <th style={{ padding: '14px 14px', width: '18%' }}>ASSIGNED WAITER</th>
              <th style={{ padding: '14px 14px', width: '14%' }}>REQUEST TIME</th>
              {activeSubTab === 'history' && <th style={{ padding: '14px 14px', width: '14%' }}>COMPLETED TIME</th>}
              <th style={{ padding: '14px 14px', width: '14%', textAlign: 'center' }}>STATUS</th>
              <th style={{ padding: '14px 14px', width: '15%', textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {displayedRequests.map((req) => {
              const statusStyle = getStatusBadge(req.status);
              const assignedWaiterName = req.assignedWaiterName || req.assignedStaff || 'Unassigned';
              const isAssigned = assignedWaiterName && assignedWaiterName !== 'Unassigned';

              return (
                <tr
                  key={req.id || req._id}
                  style={{
                    borderBottom: '1px solid #f1f5f9',
                    transition: 'background 0.15s',
                    background: req.status === 'Pending' ? '#fffaf8' : '#ffffff'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = req.status === 'Pending' ? '#fffaf8' : '#ffffff'}
                >
                  {/* 1. Request ID */}
                  <td style={{ padding: '14px 14px', fontSize: '12px', fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>
                    {req.id}
                  </td>

                  {/* 2. Table Number */}
                  <td style={{ padding: '14px 14px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{
                        background: '#f1f5f9',
                        color: '#0f172a',
                        fontSize: '12px',
                        fontWeight: 800,
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                        display: 'inline-block'
                      }}>
                        Table {String(req.table).replace('Table ', '').padStart(2, '0')}
                      </span>
                    </div>
                    {req.notes && (
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        "{req.notes}"
                      </div>
                    )}
                  </td>

                  {/* 3. Assigned Waiter */}
                  <td style={{ padding: '14px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: isAssigned ? '#dbeafe' : '#fef3c7',
                        color: isAssigned ? '#1d4ed8' : '#b45309',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: 800,
                        flexShrink: 0
                      }}>
                        {isAssigned ? assignedWaiterName.slice(0, 2).toUpperCase() : '?'}
                      </div>

                      <select
                        value={assignedWaiterName}
                        onChange={(e) => handleReassignWaiter(req.id, e.target.value)}
                        style={{
                          padding: '5px 8px',
                          borderRadius: '6px',
                          border: isAssigned ? '1px solid #cbd5e1' : '1px dashed #f59e0b',
                          background: isAssigned ? '#f8fafc' : '#fffbeb',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: isAssigned ? '#0f172a' : '#b45309',
                          cursor: 'pointer',
                          maxWidth: '140px'
                        }}
                      >
                        <option value="Unassigned">Unassigned (First available)</option>
                        {staffList.map(s => (
                          <option key={s.id || s._id} value={s.name}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                  </td>

                  {/* 4. Request Time */}
                  <td style={{ padding: '14px 14px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
                      {req.requestTime || req.requestedTime || 'Just now'}
                    </div>
                    <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
                      {req.timeAgo || 'Recent'}
                    </div>
                  </td>

                  {/* 5. Completed Time (Only in History) */}
                  {activeSubTab === 'history' && (
                    <td style={{ padding: '14px 14px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#16a34a' }}>
                        {req.completedTime || 'Completed'}
                      </div>
                      {req.duration && (
                        <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
                          {req.duration}
                        </div>
                      )}
                    </td>
                  )}

                  {/* 6. Status Badge */}
                  <td style={{ padding: '14px 14px', textAlign: 'center' }}>
                    <span style={{
                      background: statusStyle.bg,
                      color: statusStyle.color,
                      border: `1px solid ${statusStyle.border}`,
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: 800,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}>
                      {statusStyle.icon}
                      <span>{statusStyle.label}</span>
                    </span>
                  </td>

                  {/* 7. Action Buttons */}
                  <td style={{ padding: '14px 14px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                      {req.status === 'Pending' && (
                        <button
                          type="button"
                          onClick={() => handleAcceptRequest(req.id, assignedWaiterName !== 'Unassigned' ? assignedWaiterName : (staffList[0]?.name || 'Waiter'))}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            background: '#eff6ff',
                            border: '1px solid #bfdbfe',
                            color: '#1d4ed8',
                            fontSize: '11px',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <UserIcon size={12} color="#1d4ed8" />
                          Accept Call
                        </button>
                      )}

                      {(req.status === 'Accepted' || req.status === 'In Progress') && (
                        <button
                          type="button"
                          onClick={() => handleCompleteRequest(req.id)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            background: '#dcfce7',
                            border: '1px solid #bbf7d0',
                            color: '#15803d',
                            fontSize: '11px',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <CheckCircleIcon size={12} color="#15803d" />
                          Complete
                        </button>
                      )}

                      {req.status === 'Completed' && (
                        <button
                          type="button"
                          onClick={() => handleReopenRequest(req.id)}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '6px',
                            background: '#f1f5f9',
                            border: '1px solid #e2e8f0',
                            color: '#64748b',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Reopen
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDelete(req.id)}
                        title="Delete Request"
                        style={{
                          padding: '6px 8px',
                          borderRadius: '6px',
                          background: '#fee2e2',
                          border: '1px solid #fecaca',
                          color: '#b91c1c',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <TrashIcon size={12} color="#b91c1c" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {displayedRequests.length === 0 && (
              <tr>
                <td colSpan={activeSubTab === 'history' ? 7 : 6} style={{ textAlign: 'center', padding: '48px 20px', color: '#94a3b8', fontSize: '13px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <ConciergeBellIcon size={28} color="#cbd5e1" />
                    <span>No waiter requests found matching the current filters.</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Manual / Simulate Call Waiter Modal */}
      {showAddModal && (
        <Modal title="Simulate / Log Call Waiter Request" onClose={() => setShowAddModal(false)}>
          <form onSubmit={handleCreateRequestSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                Select Table <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={newRequestForm.table}
                onChange={(e) => {
                  const val = e.target.value;
                  const targetT = tablesList.find(t => String(t.id).replace('T-', '') === val);
                  let matchedWName = '';
                  if (targetT?.assignedWaiterId) {
                    const w = allStaffList.find(s => s.id === targetT.assignedWaiterId || s._id === targetT.assignedWaiterId);
                    if (w) matchedWName = w.name;
                  }
                  setNewRequestForm({ ...newRequestForm, table: val, assignedStaff: matchedWName });
                }}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff', fontWeight: 600 }}
              >
                {tablesList.map(t => {
                  const tNum = t.id.replace('T-', '');
                  const wObj = allStaffList.find(s => s.id === t.assignedWaiterId || s._id === t.assignedWaiterId);
                  return (
                    <option key={t.id} value={tNum}>
                      Table {tNum} ({t.section || 'Main Hall'}) — Assigned: {wObj?.name || 'Unassigned'}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                Assigned Waiter
              </label>
              <select
                value={newRequestForm.assignedStaff}
                onChange={(e) => setNewRequestForm({ ...newRequestForm, assignedStaff: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
              >
                <option value="">Auto-Assign to Table's Waiter</option>
                {staffList.map(s => (
                  <option key={s.id || s._id} value={s.name}>{s.name} (Waiter)</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                Customer Request Details / Notes
              </label>
              <textarea
                rows="3"
                value={newRequestForm.notes}
                onChange={(e) => setNewRequestForm({ ...newRequestForm, notes: e.target.value })}
                placeholder="e.g. Menu guidance, assistance with payment, high chair request..."
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
              ></textarea>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowAddModal(false)}
                style={{ padding: '8px 18px' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-black"
                style={{ padding: '8px 18px' }}
              >
                Send Request
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
