/**
 * Helper to dynamically resolve and format Branch Manager names from API responses
 * without saving or relying on localStorage.
 */

export const resolveBranchManagerName = (branch, users = [], staff = []) => {
  if (!branch) return 'Unassigned';

  // 1. Check all direct candidate manager properties on the branch object
  const candidateFields = [
    branch.managerName,
    branch.branchManager,
    branch.manager,
    branch.branchManagerName,
    branch.contactPerson,
    branch.managerDetails,
    branch.managerInfo
  ];

  for (const candidate of candidateFields) {
    if (!candidate) continue;
    if (typeof candidate === 'object' && candidate !== null) {
      const objName = candidate.name || candidate.managerName || candidate.username || candidate.fullName || candidate.contactPerson;
      if (objName && typeof objName === 'string' && objName.trim() && !['unassigned', 'null', 'undefined', 'none', '-'].includes(objName.trim().toLowerCase())) {
        return objName.trim();
      }
    } else if (typeof candidate === 'string') {
      const trimmed = candidate.trim();
      if (trimmed && !['unassigned', 'null', 'undefined', 'none', '-'].includes(trimmed.toLowerCase())) {
        // If it's a 24-character ObjectId string, try to match it with users or staff
        if (/^[0-9a-fA-F]{24}$/.test(trimmed)) {
          if (Array.isArray(users)) {
            const u = users.find(x => String(x._id || x.id) === trimmed);
            if (u) return (u.name || u.username || u.fullName || '').trim() || trimmed;
          }
          if (Array.isArray(staff)) {
            const s = staff.find(x => String(x._id || x.id) === trimmed);
            if (s) return (s.name || s.fullName || '').trim() || trimmed;
          }
        }
        return trimmed;
      }
    }
  }

  const bId = String(branch._id || branch.id || '');
  const bCode = String(branch.branchCode || branch.code || '').toLowerCase().trim();
  const bEmail = String(branch.email || branch.managerEmail || '').toLowerCase().trim();
  const bPhone = String(branch.mobileNumber || branch.contactNumber || branch.phone || branch.managerMobile || '').replace(/\D/g, '');

  // 2. Check manager ID fields (managerId, branchManagerId, userId, adminId)
  const explicitId = String(branch.managerId || branch.branchManagerId || branch.userId || branch.adminId || branch.assignedManagerId || '');
  if (explicitId) {
    if (Array.isArray(users)) {
      const u = users.find(x => String(x._id || x.id) === explicitId);
      if (u) {
        const name = (u.name || u.username || u.fullName || '').trim();
        if (name) return name;
      }
    }
    if (Array.isArray(staff)) {
      const s = staff.find(x => String(x._id || x.id) === explicitId);
      if (s) {
        const name = (s.name || s.fullName || '').trim();
        if (name) return name;
      }
    }
  }

  // 3. Search in fetched users array from API
  if (Array.isArray(users) && users.length > 0) {
    // 3a. Search user whose branch matches and role is Manager / Branch Manager / Admin
    const managerUser = users.find(u => {
      const uBranchId = typeof u.branchId === 'object' && u.branchId !== null ? String(u.branchId._id || u.branchId.id || '') : String(u.branchId || u.branch || '');
      const uBranchCode = typeof u.branchId === 'object' && u.branchId !== null ? String(u.branchId.branchCode || u.branchId.code || '').toLowerCase() : '';
      const isBranchMatch = (bId && uBranchId === bId) || (bCode && (uBranchCode === bCode || String(u.branch || '').toLowerCase() === bCode));
      
      const roleStr = String(typeof u.role === 'object' && u.role !== null ? (u.role.roleName || u.role.name || '') : (u.role || u.userType || u.designation || '')).toLowerCase();
      const isManager = roleStr.includes('manager') || roleStr.includes('admin') || roleStr.includes('owner') || roleStr.includes('head');
      return isBranchMatch && isManager;
    });

    if (managerUser) {
      const name = (managerUser.name || managerUser.username || managerUser.fullName || '').trim();
      if (name) return name;
    }

    // 3b. Search user by matching email or mobile number
    if (bEmail || (bPhone && bPhone.length >= 7)) {
      const contactUser = users.find(u => {
        const uEmail = String(u.email || '').toLowerCase().trim();
        const uPhone = String(u.phone || u.mobileNumber || u.mobile || '').replace(/\D/g, '');
        return (bEmail && uEmail && uEmail === bEmail) || (bPhone && uPhone && (uPhone === bPhone || uPhone.endsWith(bPhone) || bPhone.endsWith(uPhone)));
      });
      if (contactUser) {
        const name = (contactUser.name || contactUser.username || contactUser.fullName || '').trim();
        if (name) return name;
      }
    }

    // 3c. Fallback: Any user assigned to this branch
    const anyUserInBranch = users.find(u => {
      const uBranchId = typeof u.branchId === 'object' && u.branchId !== null ? String(u.branchId._id || u.branchId.id || '') : String(u.branchId || u.branch || '');
      return bId && uBranchId === bId;
    });
    if (anyUserInBranch) {
      const roleStr = String(typeof anyUserInBranch.role === 'object' && anyUserInBranch.role !== null ? (anyUserInBranch.role.roleName || anyUserInBranch.role.name || '') : (anyUserInBranch.role || anyUserInBranch.userType || '')).toLowerCase();
      if (roleStr.includes('manager') || roleStr.includes('admin') || roleStr.includes('lead')) {
        const name = (anyUserInBranch.name || anyUserInBranch.username || anyUserInBranch.fullName || '').trim();
        if (name) return name;
      }
    }
  }

  // 4. Search in fetched staff array from API
  if (Array.isArray(staff) && staff.length > 0) {
    const managerStaff = staff.find(s => {
      const sBranchId = typeof s.branchId === 'object' && s.branchId !== null ? String(s.branchId._id || s.branchId.id || '') : String(s.branchId || s.branch || '');
      const isBranchMatch = bId && sBranchId === bId;
      const roleStr = String(s.role || s.designation || s.position || '').toLowerCase();
      return isBranchMatch && (roleStr.includes('manager') || roleStr.includes('admin') || roleStr.includes('captain') || roleStr.includes('incharge'));
    });
    if (managerStaff) {
      const name = (managerStaff.name || managerStaff.fullName || '').trim();
      if (name) return name;
    }
  }

  return 'Unassigned';
};

export default {
  resolveBranchManagerName
};
