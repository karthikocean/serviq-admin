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

  // 3. Match by resolved manager name (e.g. "Serviq")
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
  if (!targetBranchId || targetBranchId === 'ALL' || targetBranchId === 'All' || String(targetBranchId).toLowerCase() === 'all branches' || String(targetBranchId).toUpperCase() === 'COMPANY') return true;
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

  const isCustomMenuBranch = targetBranchObj ? (targetBranchObj.useCustomMenu === true || String(targetBranchObj.useCustomMenu) === 'true') : false;

  // If the item itself is marked as a Company Menu item:
  if (itemBranch.isCompanyMenu === true || String(itemBranch.isCompanyMenu) === 'true') {
    // Company Menu item matches all non-custom branches, but NEVER custom menu branches
    return !isCustomMenuBranch;
  }

  const targetKeys = new Set([targetStr]);
  if (targetBranchObj) {
    if (targetBranchObj._id) targetKeys.add(String(targetBranchObj._id).toLowerCase().trim());
    if (targetBranchObj.id) targetKeys.add(String(targetBranchObj.id).toLowerCase().trim());
    if (targetBranchObj.branchCode) targetKeys.add(String(targetBranchObj.branchCode).toLowerCase().trim());
    if (targetBranchObj.code) targetKeys.add(String(targetBranchObj.code).toLowerCase().trim());
    if (targetBranchObj.branchName) targetKeys.add(String(targetBranchObj.branchName).toLowerCase().trim());
    if (targetBranchObj.name) targetKeys.add(String(targetBranchObj.name).toLowerCase().trim());

    // If branch uses Company Menu, also match items belonging to Main Branch or default non-custom branch
    if (!isCustomMenuBranch && Array.isArray(branchesList)) {
      let mainBranch = branchesList.find(b => b.isMainBranch || b.branchType === 'MAIN');
      if (!mainBranch) {
        mainBranch = branchesList.find(b => !b.useCustomMenu && String(b.useCustomMenu) !== 'true');
      }
      if (mainBranch) {
        if (mainBranch._id) targetKeys.add(String(mainBranch._id).toLowerCase().trim());
        if (mainBranch.id) targetKeys.add(String(mainBranch.id).toLowerCase().trim());
        if (mainBranch.branchCode) targetKeys.add(String(mainBranch.branchCode).toLowerCase().trim());
        if (mainBranch.code) targetKeys.add(String(mainBranch.code).toLowerCase().trim());
        if (mainBranch.branchName) targetKeys.add(String(mainBranch.branchName).toLowerCase().trim());
        if (mainBranch.name) targetKeys.add(String(mainBranch.name).toLowerCase().trim());
      }
    }
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
    // 1. Direct object identifiers (in case itemBranch is a branch itself or entity with _id/branchCode/branchName)
    if (itemBranch._id) itemIds.push(String(itemBranch._id).toLowerCase().trim());
    if (itemBranch.id) itemIds.push(String(itemBranch.id).toLowerCase().trim());
    if (itemBranch.branchCode) itemIds.push(String(itemBranch.branchCode).toLowerCase().trim());
    if (itemBranch.code) itemIds.push(String(itemBranch.code).toLowerCase().trim());
    if (itemBranch.branchName) itemIds.push(String(itemBranch.branchName).toLowerCase().trim());
    if (itemBranch.name) itemIds.push(String(itemBranch.name).toLowerCase().trim());

    // 2. Check entity branch reference fields
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
    validBranchFields.forEach(f => extractFromBranchObj(f));
  } else if (typeof itemBranch === 'string') {
    itemIds.push(itemBranch.toLowerCase().trim());
  }

  return itemIds.some(id => targetKeys.has(id));
};

/**
 * Extracts a specific assigned branch ID for a user.
 * Returns empty string if user has no assigned branch or has enterprise/company scope ('ALL'/'COMPANY').
 */
export const getUserAssignedBranchId = (user) => {
  if (!user) return '';
  const bId = typeof user.branchId === 'object' && user.branchId !== null
    ? (user.branchId._id || user.branchId.id)
    : (user.branchId || user.activeBranchId || '');
  if (
    !bId ||
    bId === 'ALL' ||
    bId === 'All' ||
    String(bId).toLowerCase() === 'all branches' ||
    String(bId).toUpperCase() === 'COMPANY'
  ) {
    return '';
  }
  return String(bId);
};

/**
 * Checks whether a user is a Company-level user (Owner, Super Admin, or HQ user without a specific branch).
 * Sub-branch users assigned to a specific branch are strictly NOT Company users.
 */
export const isUserCompanyUser = (user) => {
  if (!user) return false;

  const roleStr = typeof user.role === 'object' && user.role !== null
    ? (user.role.roleName || user.role.name || '')
    : (typeof user.role === 'string' ? user.role : '');
  const userTypeStr = typeof user.userType === 'string' ? user.userType : '';

  const roleLower = (roleStr || '').toLowerCase().trim();
  const typeUpper = (userTypeStr || '').toUpperCase().trim();

  // Super Admin / Restaurant Owner accounts always have full company overview scope
  if (
    typeUpper === 'RESTAURANT_OWNER' ||
    typeUpper === 'OWNER' ||
    typeUpper === 'SUPER ADMIN' ||
    typeUpper === 'SUPER_ADMIN' ||
    roleLower === 'restaurant_owner' ||
    roleLower === 'restaurant owner' ||
    roleLower === 'owner' ||
    roleLower === 'super admin' ||
    roleLower === 'super_admin'
  ) {
    return true;
  }

  const assignedBranchId = getUserAssignedBranchId(user);
  // Any user tied to a specific sub-branch is a Sub-branch user, NOT a Company user
  if (assignedBranchId) {
    return false;
  }

  // Check branch-scoped user roles
  if (
    typeUpper === 'BRANCH_ADMIN' ||
    typeUpper === 'BRANCH' ||
    typeUpper === 'STAFF' ||
    typeUpper === 'WAITER' ||
    typeUpper === 'KITCHEN' ||
    roleLower.includes('branch')
  ) {
    return false;
  }

  // If user has no specific branch assigned and has company-level administrative status
  if (
    typeUpper === 'ADMIN' ||
    typeUpper === 'COMPANY' ||
    typeUpper === 'COMPANY_ADMIN' ||
    roleLower.includes('admin') ||
    roleLower.includes('company')
  ) {
    return true;
  }

  return !assignedBranchId;
};

/**
 * Checks whether a user is a Sub-Branch user (assigned to a specific branch and not a Company user).
 */
export const isSubBranchUser = (user) => {
  return !isUserCompanyUser(user) && Boolean(getUserAssignedBranchId(user));
};

/**
 * Resolves the single primary designated Main Branch from a list of branches.
 * Exactly one branch should be considered the Main Branch.
 */
export const getMainBranch = (branchesList = []) => {
  if (!Array.isArray(branchesList) || branchesList.length === 0) return null;

  // 1. Look for explicit boolean or type flags
  const explicitMain = branchesList.find(b => 
    Boolean(
      b?.isMainBranch === true ||
      b?.isMain === true ||
      b?.isHeadOffice === true ||
      b?.isHQ === true ||
      String(b?.branchType || '').toUpperCase() === 'MAIN' ||
      String(b?.type || '').toUpperCase() === 'MAIN'
    )
  );
  if (explicitMain) return explicitMain;

  // 2. Only if no branch has explicit flags, look for exact branch name matches (never substring)
  const exactNameMain = branchesList.find(b => {
    const name = String(b?.branchName || b?.name || '').trim().toLowerCase();
    return name === 'main branch' || name === 'headquarters' || name === 'head office';
  });
  if (exactNameMain) return exactNameMain;

  return null;
};

/**
 * Checks whether a branch is designated as the Main Branch.
 * If allBranches list is provided, guarantees that ONLY the single designated main branch returns true.
 */
export const isBranchMain = (branch, allBranches = null) => {
  if (!branch) return false;

  // If the full branch list is available, resolve the single designated main branch
  if (Array.isArray(allBranches) && allBranches.length > 0) {
    const mainBranch = getMainBranch(allBranches);
    if (!mainBranch) return false;
    const bId = String(branch._id || branch.id || branch.branchCode || '');
    const mainId = String(mainBranch._id || mainBranch.id || mainBranch.branchCode || '');
    return Boolean(bId && mainId && bId === mainId);
  }

  // Standalone check (when branch list is not provided):
  // Check explicit database / backend flags ONLY.
  // Never do loose substring checking on branch name to prevent normal branches
  // named "main" or containing "main" from being falsely treated as the Main Branch.
  return Boolean(
    branch.isMainBranch === true ||
    branch.isMain === true ||
    branch.isHeadOffice === true ||
    branch.isHQ === true ||
    String(branch.branchType || '').toUpperCase() === 'MAIN' ||
    String(branch.type || '').toUpperCase() === 'MAIN'
  );
};

/**
 * Resolves the city or location name for a branch from various possible fields
 * (e.g., branch.city, branch.address.city, branch.location, or activeRestaurant.branches).
 */
export const resolveBranchCity = (branch, restaurantBranches = []) => {
  if (!branch) return '';

  // 1. Direct city property
  if (typeof branch.city === 'string' && branch.city.trim() && branch.city.trim().toLowerCase() !== 'undefined' && branch.city.trim().toLowerCase() !== 'null') {
    return branch.city.trim();
  }

  // 2. Address object (MongoDB address schema: { street, city, state, country, pincode })
  if (branch.address && typeof branch.address === 'object') {
    const addrCity = branch.address.city || branch.address.district || branch.address.town || branch.address.area;
    if (typeof addrCity === 'string' && addrCity.trim() && addrCity.trim().toLowerCase() !== 'undefined' && addrCity.trim().toLowerCase() !== 'null') {
      return addrCity.trim();
    }
    const addrState = branch.address.state;
    if (typeof addrState === 'string' && addrState.trim() && addrState.trim().toLowerCase() !== 'undefined' && addrState.trim().toLowerCase() !== 'null') {
      return addrState.trim();
    }
  }

  // 3. Location / branchLocation property
  if (typeof branch.location === 'string' && branch.location.trim() && branch.location.trim().toLowerCase() !== 'undefined' && branch.location.trim().toLowerCase() !== 'null') {
    return branch.location.trim();
  }
  if (typeof branch.branchLocation === 'string' && branch.branchLocation.trim() && branch.branchLocation.trim().toLowerCase() !== 'undefined' && branch.branchLocation.trim().toLowerCase() !== 'null') {
    return branch.branchLocation.trim();
  }

  // 4. Look up in activeRestaurant / cached restaurant branches
  if (Array.isArray(restaurantBranches) && restaurantBranches.length > 0) {
    const bId = String(branch._id || branch.id || '');
    const bCode = String(branch.branchCode || branch.code || '').toLowerCase().trim();
    const matched = restaurantBranches.find(rb => {
      const rbId = String(rb._id || rb.id || '');
      const rbCode = String(rb.branchCode || rb.code || '').toLowerCase().trim();
      return (bId && (rbId === bId)) || (bCode && (rbCode === bCode));
    });

    if (matched && matched !== branch) {
      const matchedCity = resolveBranchCity(matched, []);
      if (matchedCity) return matchedCity;
    }
  }

  // 5. String address parsing (e.g. "Gandhipuram, Coimbatore, Tamil Nadu")
  if (typeof branch.address === 'string' && branch.address.trim()) {
    const parts = branch.address.split(',').map(p => p.trim()).filter(Boolean);
    if (parts.length > 1) {
      const candidate = parts[parts.length - 2];
      if (candidate && !/^\d+$/.test(candidate) && candidate.length > 2) {
        return candidate;
      }
    }
    return branch.address.trim();
  }

  // 6. Direct state fallback if city not found
  if (typeof branch.state === 'string' && branch.state.trim() && branch.state.trim().toLowerCase() !== 'undefined' && branch.state.trim().toLowerCase() !== 'null') {
    return branch.state.trim();
  }

  return '';
};

/**
 * Resolves the full Location for a branch.
 * Prioritizes the specific Street Address / Location entered by the user
 * (e.g. "Gandhipuram", "T. Nagar", "Saravanampatti") combined with the City if distinct,
 * or the City itself if only city was provided.
 */
export const resolveBranchLocation = (branch, restaurantBranches = []) => {
  if (!branch) return '';

  let matched = null;
  if (Array.isArray(restaurantBranches) && restaurantBranches.length > 0) {
    const bId = String(branch._id || branch.id || '');
    const bCode = String(branch.branchCode || branch.code || '').toLowerCase().trim();
    matched = restaurantBranches.find(rb => {
      const rbId = String(rb._id || rb.id || '');
      const rbCode = String(rb.branchCode || rb.code || '').toLowerCase().trim();
      return (bId && (rbId === bId)) || (bCode && (rbCode === bCode));
    });
  }

  // 1. Resolve Street Address / Location string
  const rawStreet = 
    (typeof branch.street === 'string' && branch.street.trim()) ||
    (typeof branch.address === 'string' && branch.address.trim()) ||
    (branch.address && typeof branch.address === 'object' && typeof branch.address.street === 'string' && branch.address.street.trim()) ||
    (branch.address && typeof branch.address === 'object' && typeof branch.address.addressLine1 === 'string' && branch.address.addressLine1.trim()) ||
    (typeof branch.location === 'string' && branch.location.trim()) ||
    (typeof branch.branchLocation === 'string' && branch.branchLocation.trim()) ||
    (matched && typeof matched.street === 'string' && matched.street.trim()) ||
    (matched && typeof matched.address === 'string' && matched.address.trim()) ||
    (matched && matched.address && typeof matched.address === 'object' && typeof matched.address.street === 'string' && matched.address.street.trim()) ||
    (matched && typeof matched.location === 'string' && matched.location.trim()) ||
    '';

  // 2. Resolve City
  const rawCity = 
    (typeof branch.city === 'string' && branch.city.trim() && branch.city.trim().toLowerCase() !== 'undefined' && branch.city.trim().toLowerCase() !== 'null' && branch.city.trim()) ||
    (branch.address && typeof branch.address === 'object' && typeof branch.address.city === 'string' && branch.address.city.trim()) ||
    (matched && typeof matched.city === 'string' && matched.city.trim() && matched.city.trim().toLowerCase() !== 'undefined' && matched.city.trim()) ||
    (matched && matched.address && typeof matched.address === 'object' && typeof matched.address.city === 'string' && matched.address.city.trim()) ||
    '';

  const cleanStreet = rawStreet && !['undefined', 'null', 'none', '-'].includes(rawStreet.toLowerCase()) ? rawStreet : '';
  const cleanCity = rawCity && !['undefined', 'null', 'none', '-'].includes(rawCity.toLowerCase()) ? rawCity : '';

  // If street address / location is entered:
  if (cleanStreet) {
    if (cleanCity && !cleanStreet.toLowerCase().includes(cleanCity.toLowerCase())) {
      return `${cleanStreet}, ${cleanCity}`;
    }
    return cleanStreet;
  }

  // If only city is entered:
  if (cleanCity) {
    return cleanCity;
  }

  // Fallback to state or country
  const rawState = branch.state || (branch.address && typeof branch.address === 'object' && branch.address.state) || (matched && matched.state) || '';
  if (rawState && typeof rawState === 'string' && rawState.trim() && !['undefined', 'null'].includes(rawState.toLowerCase())) {
    return rawState.trim();
  }

  return '';
};

export default {
  resolveBranchManagerName,
  resolveBranchContactNumber,
  resolveBranchCity,
  resolveBranchLocation,
  isBranchMatch,
  getUserAssignedBranchId,
  isUserCompanyUser,
  isSubBranchUser,
  getMainBranch,
  isBranchMain
};


