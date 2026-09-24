/**
 * Helper to dynamically resolve and format Branch Manager names from API responses
 * without saving or relying on localStorage.
 */

export const resolveBranchManagerName = (branch, users = [], staff = []) => {
  if (!branch) return 'Unassigned';

  // 1. Direct managerName property (Highest priority)
  if (branch.managerName) {
    if (typeof branch.managerName === 'string') {
      const trimmed = branch.managerName.trim();
      if (trimmed && !['unassigned', 'null', 'undefined', 'none', '-'].includes(trimmed.toLowerCase())) {
        if (!/^[0-9a-fA-F]{24}$/.test(trimmed)) {
          return trimmed;
        }
      }
    } else if (typeof branch.managerName === 'object' && branch.managerName !== null) {
      const objName = branch.managerName.name || branch.managerName.managerName || branch.managerName.fullName || branch.managerName.username;
      if (objName && typeof objName === 'string' && objName.trim() && !['unassigned', 'null', 'undefined', 'none', '-'].includes(objName.trim().toLowerCase())) {
        return objName.trim();
      }
    }
  }

  // 2. Check other candidate manager properties on the branch object
  const candidateFields = [
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

export const resolveBranchContactNumber = (branch, users = [], staff = []) => {
  if (!branch) return 'N/A';

  const cleanPhone = (val) => {
    if (!val) return null;
    if (typeof val === 'number') val = String(val);
    if (typeof val !== 'string') return null;
    const trimmed = val.trim();
    if (!trimmed || ['n/a', 'na', 'null', 'undefined', 'none', '-', 'empty'].includes(trimmed.toLowerCase())) return null;
    const digits = trimmed.replace(/\D/g, '');
    if (digits.length >= 7) {
      return trimmed;
    }
    return null;
  };

  // 1. Direct candidate phone fields on branch object
  const directCandidates = [
    branch.mobileNumber,
    branch.contactNumber,
    branch.phoneNumber,
    branch.phone,
    branch.mobile,
    branch.managerMobile,
    branch.managerPhone,
    branch.contactPhone,
    branch.contactPersonPhone,
    branch.telephone,
    branch.contact?.phone,
    branch.contact?.mobileNumber,
    branch.contact?.mobile,
    branch.contact?.phoneNumber,
    branch.contact?.contactNumber,
    typeof branch.contact === 'string' ? branch.contact : null,
    branch.managerDetails?.phone,
    branch.managerDetails?.mobileNumber,
    branch.managerDetails?.phoneNumber,
    branch.managerDetails?.mobile,
    branch.managerInfo?.phone,
    branch.managerInfo?.mobileNumber,
    branch.managerInfo?.phoneNumber,
    branch.managerInfo?.mobile,
    branch.manager?.phone,
    branch.manager?.mobileNumber,
    branch.manager?.phoneNumber,
    branch.manager?.mobile,
    branch.branchManager?.phone,
    branch.branchManager?.mobileNumber,
    branch.branchManager?.phoneNumber,
    branch.branchManager?.mobile
  ];

  for (const cand of directCandidates) {
    const valid = cleanPhone(cand);
    if (valid) return valid;
  }

  const bId = String(branch._id || branch.id || '');
  const bCode = String(branch.branchCode || branch.code || '').toLowerCase().trim();
  const bEmail = String(branch.email || branch.managerEmail || '').toLowerCase().trim();

  // 2. Check explicit manager ID fields (managerId, branchManagerId, userId, adminId, assignedManagerId)
  const explicitId = String(branch.managerId || branch.branchManagerId || branch.userId || branch.adminId || branch.assignedManagerId || '');
  if (explicitId) {
    if (Array.isArray(users)) {
      const u = users.find(x => String(x._id || x.id) === explicitId);
      if (u) {
        const uContact = cleanPhone(u.phone || u.phoneNumber || u.mobileNumber || u.mobile || u.contactNumber);
        if (uContact) return uContact;
      }
    }
    if (Array.isArray(staff)) {
      const s = staff.find(x => String(x._id || x.id) === explicitId);
      if (s) {
        const sContact = cleanPhone(s.phone || s.phoneNumber || s.mobileNumber || s.mobile || s.contactNumber);
        if (sContact) return sContact;
      }
    }
  }

  // 3. Match by resolved manager name (e.g. "Gayathri Ranganathan")
  const resolvedMgrName = resolveBranchManagerName(branch, users, staff);
  if (resolvedMgrName && resolvedMgrName !== 'Unassigned') {
    const mgrNameLower = resolvedMgrName.toLowerCase().trim();
    if (Array.isArray(users)) {
      const matchedUser = users.find(u => {
        const uName = String(u.name || u.username || u.fullName || '').toLowerCase().trim();
        return uName === mgrNameLower;
      });
      if (matchedUser) {
        const uContact = cleanPhone(matchedUser.phone || matchedUser.phoneNumber || matchedUser.mobileNumber || matchedUser.mobile || matchedUser.contactNumber);
        if (uContact) return uContact;
      }
    }
    if (Array.isArray(staff)) {
      const matchedStaff = staff.find(s => {
        const sName = String(s.name || s.fullName || '').toLowerCase().trim();
        return sName === mgrNameLower;
      });
      if (matchedStaff) {
        const sContact = cleanPhone(matchedStaff.phone || matchedStaff.phoneNumber || matchedStaff.mobileNumber || matchedStaff.mobile || matchedStaff.contactNumber);
        if (sContact) return sContact;
      }
    }
  }

  // 4. Search in users array for branch manager or branch user
  if (Array.isArray(users) && users.length > 0) {
    // 4a. User with matching branch and manager role
    const managerUser = users.find(u => {
      const uBranchId = typeof u.branchId === 'object' && u.branchId !== null ? String(u.branchId._id || u.branchId.id || '') : String(u.branchId || u.branch || '');
      const uBranchCode = typeof u.branchId === 'object' && u.branchId !== null ? String(u.branchId.branchCode || u.branchId.code || '').toLowerCase() : '';
      const isBranchMatch = (bId && uBranchId === bId) || (bCode && (uBranchCode === bCode || String(u.branch || '').toLowerCase() === bCode));
      
      const roleStr = String(typeof u.role === 'object' && u.role !== null ? (u.role.roleName || u.role.name || '') : (u.role || u.userType || u.designation || '')).toLowerCase();
      const isManager = roleStr.includes('manager') || roleStr.includes('admin') || roleStr.includes('owner') || roleStr.includes('head');
      return isBranchMatch && isManager;
    });

    if (managerUser) {
      const uContact = cleanPhone(managerUser.phone || managerUser.phoneNumber || managerUser.mobileNumber || managerUser.mobile || managerUser.contactNumber);
      if (uContact) return uContact;
    }

    // 4b. User with matching branch email
    if (bEmail) {
      const emailUser = users.find(u => String(u.email || '').toLowerCase().trim() === bEmail);
      if (emailUser) {
        const uContact = cleanPhone(emailUser.phone || emailUser.phoneNumber || emailUser.mobileNumber || emailUser.mobile || emailUser.contactNumber);
        if (uContact) return uContact;
      }
    }

    // 4c. Any user assigned to this branch with contact
    const anyBranchUser = users.find(u => {
      const uBranchId = typeof u.branchId === 'object' && u.branchId !== null ? String(u.branchId._id || u.branchId.id || '') : String(u.branchId || u.branch || '');
      return bId && uBranchId === bId;
    });
    if (anyBranchUser) {
      const uContact = cleanPhone(anyBranchUser.phone || anyBranchUser.phoneNumber || anyBranchUser.mobileNumber || anyBranchUser.mobile || anyBranchUser.contactNumber);
      if (uContact) return uContact;
    }
  }

  // 5. Search in staff array for manager or staff in this branch
  if (Array.isArray(staff) && staff.length > 0) {
    const managerStaff = staff.find(s => {
      const sBranchId = typeof s.branchId === 'object' && s.branchId !== null ? String(s.branchId._id || s.branchId.id || '') : String(s.branchId || s.branch || '');
      const isBranchMatch = bId && sBranchId === bId;
      const roleStr = String(s.role || s.designation || s.position || '').toLowerCase();
      return isBranchMatch && (roleStr.includes('manager') || roleStr.includes('admin') || roleStr.includes('captain') || roleStr.includes('incharge'));
    });
    if (managerStaff) {
      const sContact = cleanPhone(managerStaff.phone || managerStaff.phoneNumber || managerStaff.mobileNumber || managerStaff.mobile || managerStaff.contactNumber);
      if (sContact) return sContact;
    }

    const anyBranchStaff = staff.find(s => {
      const sBranchId = typeof s.branchId === 'object' && s.branchId !== null ? String(s.branchId._id || s.branchId.id || '') : String(s.branchId || s.branch || '');
      return bId && sBranchId === bId;
    });
    if (anyBranchStaff) {
      const sContact = cleanPhone(anyBranchStaff.phone || anyBranchStaff.phoneNumber || anyBranchStaff.mobileNumber || anyBranchStaff.mobile || anyBranchStaff.contactNumber);
      if (sContact) return sContact;
    }
  }

  return 'N/A';
};

export const isBranchMatch = (itemBranch, targetBranchId, branchesList = []) => {
  if (!targetBranchId || targetBranchId === 'ALL' || targetBranchId === 'All' || String(targetBranchId).toLowerCase() === 'all branches') return true;
  if (!itemBranch) return false;
  if (itemBranch.isServerReport === true) return true;

  const targetStr = String(typeof targetBranchId === 'object' && targetBranchId !== null ? (targetBranchId._id || targetBranchId.id || targetBranchId.branchCode || '') : targetBranchId).toLowerCase().trim();
  const targetBranchObj = Array.isArray(branchesList)
    ? branchesList.find(b => 
        String(b._id || b.id || '').toLowerCase().trim() === targetStr ||
        String(b.branchCode || b.code || '').toLowerCase().trim() === targetStr ||
        String(b.branchName || b.name || '').toLowerCase().trim() === targetStr
      )
    : (typeof targetBranchId === 'object' && targetBranchId !== null ? targetBranchId : null);

  const targetKeys = new Set([targetStr]);
  if (targetBranchObj) {
    if (targetBranchObj._id) targetKeys.add(String(targetBranchObj._id).toLowerCase().trim());
    if (targetBranchObj.id) targetKeys.add(String(targetBranchObj.id).toLowerCase().trim());
    if (targetBranchObj.branchCode) targetKeys.add(String(targetBranchObj.branchCode).toLowerCase().trim());
    if (targetBranchObj.code) targetKeys.add(String(targetBranchObj.code).toLowerCase().trim());
    if (targetBranchObj.branchName) targetKeys.add(String(targetBranchObj.branchName).toLowerCase().trim());
    if (targetBranchObj.name) targetKeys.add(String(targetBranchObj.name).toLowerCase().trim());
  }

  // Extract candidate branch identifiers
  let itemIds = [];

  const extractFromBranchObj = (obj) => {
    if (!obj) return;
    if (typeof obj === 'string' || typeof obj === 'number') {
      itemIds.push(String(obj).toLowerCase().trim());
    } else if (typeof obj === 'object') {
      if (obj._id) itemIds.push(String(obj._id).toLowerCase().trim());
      if (obj.id) itemIds.push(String(obj.id).toLowerCase().trim());
      if (obj.branchId) extractFromBranchObj(obj.branchId);
      if (obj.branchCode) itemIds.push(String(obj.branchCode).toLowerCase().trim());
      if (obj.code) itemIds.push(String(obj.code).toLowerCase().trim());
      if (obj.branchName) itemIds.push(String(obj.branchName).toLowerCase().trim());
      if (obj.name) itemIds.push(String(obj.name).toLowerCase().trim());
    }
  };

  if (typeof itemBranch === 'object' && itemBranch !== null) {
    // Check entity branch reference fields first
    const branchFields = [
      itemBranch.branchId,
      itemBranch.branch,
      itemBranch.restaurantBranchId,
      itemBranch.activeBranchId,
      itemBranch.branch_id,
      itemBranch.outletId,
      typeof itemBranch.table === 'object' ? (itemBranch.table?.branchId || itemBranch.table?.branch) : null,
      typeof itemBranch.tableId === 'object' ? (itemBranch.tableId?.branchId || itemBranch.tableId?.branch) : null
    ];

    if (Array.isArray(itemBranch.branches)) {
      itemBranch.branches.forEach(b => branchFields.push(b));
    }
    if (Array.isArray(itemBranch.branchIds)) {
      itemBranch.branchIds.forEach(b => branchFields.push(b));
    }

    const validBranchFields = branchFields.filter(f => f !== undefined && f !== null && f !== '');
    if (validBranchFields.length > 0) {
      validBranchFields.forEach(f => extractFromBranchObj(f));
    } else if (itemBranch.branchCode || itemBranch.branchName || itemBranch.managerName || itemBranch.city || itemBranch.address) {
      // It is an actual branch object
      extractFromBranchObj(itemBranch);
    }
  } else if (typeof itemBranch === 'string') {
    itemIds.push(itemBranch.toLowerCase().trim());
  }

  return itemIds.some(id => targetKeys.has(id));
};

export default {
  resolveBranchManagerName,
  resolveBranchContactNumber,
  isBranchMatch
};

