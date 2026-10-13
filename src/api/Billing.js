import apiClient from "../config/index.js";
import ShowNotifications from "../helper/ShowNotifications.js";

class BillingApi {
  async getBillingHistory(filters = {}) {
    try {
      const cleanParams = {};

      if (filters.branchId && filters.branchId !== 'All' && filters.branchId !== 'ALL' && String(filters.branchId).toUpperCase() !== 'COMPANY') {
        cleanParams.branchId = filters.branchId;
      }

      const searchVal = filters.search || filters.searchTerm || filters.searchQuery;
      if (searchVal && String(searchVal).trim()) {
        cleanParams.search = String(searchVal).trim();
      }

      const tableVal = filters.tableId || filters.table || filters.tableNumber;
      if (tableVal && tableVal !== 'All' && tableVal !== 'ALL') {
        const rawTableId = typeof tableVal === 'object' && tableVal !== null ? (tableVal._id || tableVal.id) : tableVal;
        const strTableId = String(rawTableId || '').trim();
        if (/^[0-9a-fA-F]{24}$/.test(strTableId)) {
          cleanParams.tableId = strTableId;
        } else {
          cleanParams.table = strTableId;
          cleanParams.tableNumber = strTableId;
        }
      }

      const customerVal = filters.customer || filters.customerFilter || filters.customerName || filters.customerPhone;
      if (customerVal && String(customerVal).trim()) {
        cleanParams.customer = String(customerVal).trim();
        cleanParams.customerName = String(customerVal).trim();
      }

      const cashierVal = filters.cashierId || filters.cashier || filters.staffId || filters.waiterId;
      if (cashierVal && cashierVal !== 'All' && cashierVal !== 'ALL') {
        const rawStaffId = typeof cashierVal === 'object' && cashierVal !== null ? (cashierVal._id || cashierVal.id) : cashierVal;
        const strStaffId = String(rawStaffId || '').trim();
        // waiterId / cashierId / staffId MUST be a valid 24-hex MongoDB ObjectId (_id) for Mongoose Order model
        if (/^[0-9a-fA-F]{24}$/.test(strStaffId)) {
          cleanParams.cashierId = strStaffId;
          cleanParams.waiterId = strStaffId;
          cleanParams.staffId = strStaffId;
        } else {
          // Do NOT send non-ObjectId string as waiterId/cashierId/staffId to prevent "Cast to ObjectId failed" error
          cleanParams.cashier = strStaffId;
          cleanParams.staff = strStaffId;
          cleanParams.staffName = strStaffId;
        }
      }

      if (filters.dateRange && filters.dateRange !== 'All' && filters.dateRange !== 'ALL') {
        cleanParams.dateRange = String(filters.dateRange).trim().toUpperCase().replace(/\s+/g, '_');
      }

      const startDateVal = filters.startDate || filters.dateStart || filters.fromDate || filters.customStartDate;
      if (startDateVal) {
        cleanParams.startDate = startDateVal;
        cleanParams.fromDate = startDateVal;
      }

      const endDateVal = filters.endDate || filters.dateEnd || filters.toDate || filters.customEndDate;
      if (endDateVal) {
        cleanParams.endDate = endDateVal;
        cleanParams.toDate = endDateVal;
      }

      const pm = filters.paymentMethod || filters.paymentMode;
      if (pm && pm !== 'All' && pm !== 'ALL') {
        cleanParams.paymentMethod = String(pm).toUpperCase();
        cleanParams.paymentMode = String(pm).toUpperCase();
      }

      const ps = filters.paymentStatus || filters.status;
      if (ps && ps !== 'All' && ps !== 'ALL' && ps !== 'All Statuses') {
        cleanParams.paymentStatus = String(ps).toUpperCase();
        cleanParams.status = String(ps).toUpperCase();
        cleanParams.billingStatus = String(ps).toUpperCase();
      }

      const ot = filters.orderType;
      if (ot && ot !== 'All' && ot !== 'ALL' && ot !== 'All Types') {
        cleanParams.orderType = String(ot).toUpperCase().replace('-', '_');
      }

      // 0-based page index (starts with 0, limit is 10)
      const pageNum = filters.page !== undefined ? Number(filters.page) : 0;
      cleanParams.page = pageNum < 0 ? 0 : pageNum;

      cleanParams.limit = filters.limit !== undefined ? (Number(filters.limit) || 10) : 10;
      cleanParams.sortBy = filters.sortBy || 'createdAt';
      cleanParams.sortOrder = filters.sortOrder || 'desc';

      if (filters.isExport) cleanParams.isExport = filters.isExport;
      if (filters.limit === 0 || filters.limit === '0') cleanParams.limit = 0;

      // Add any additional non-empty params
      Object.keys(filters).forEach(key => {
        if (!['branchId', 'search', 'searchTerm', 'searchQuery', 'tableId', 'table', 'tableNumber', 'customer', 'customerFilter', 'customerName', 'customerPhone', 'cashierId', 'cashier', 'staffId', 'waiterId', 'staff', 'staffName', 'dateRange', 'startDate', 'endDate', 'dateStart', 'dateEnd', 'fromDate', 'toDate', 'customStartDate', 'customEndDate', 'paymentMethod', 'paymentMode', 'paymentStatus', 'status', 'billingStatus', 'orderType', 'page', 'limit', 'sortBy', 'sortOrder', 'isExport', 'selectedTable', 'selectedStaff', 'selectedPayment'].includes(key)) {
          const val = filters[key];
          if (val !== undefined && val !== null && val !== '' && val !== 'null' && val !== 'undefined' && val !== 'All' && val !== 'ALL') {
            cleanParams[key] = val;
          }
        }
      });

      const queryParams = new URLSearchParams(cleanParams).toString();
      const url = `/billing/history${queryParams ? `?${queryParams}` : ''}`;
      let response;
      try {
        response = await apiClient.get(url);
      } catch (err1) {
        if (err1?.response?.status === 404 || err1?.response?.status === 405 || !err1?.response) {
          const orderParams = { ...cleanParams };
          if (!orderParams.limit) orderParams.limit = 50;
          const ordersRes = await apiClient.get('/orders', { params: orderParams }).catch(() => null);
          if (ordersRes?.data) {
            const rawOrders = Array.isArray(ordersRes.data) ? ordersRes.data : (ordersRes.data?.data || ordersRes.data?.orders || []);
            const paidOrders = rawOrders.filter(o => (o.billingStatus || o.paymentStatus || '').toLowerCase() === 'paid' || o.isPaid || o.status === 'completed' || o.status === 'done');
            const resultOrders = paidOrders.length > 0 ? paidOrders : rawOrders;
            return { status: true, response: { data: resultOrders, total: resultOrders.length } };
          }
        }
        throw err1;
      }

      if (response && (response.status === 200 || response.status === 201)) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch billing history.";

      console.warn("BillingApi getBillingHistory note:", errorMessage);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async getCurrentBilling(filters = {}) {
    try {
      const cleanParams = {};

      if (filters.branchId && filters.branchId !== 'All' && filters.branchId !== 'ALL' && String(filters.branchId).toUpperCase() !== 'COMPANY') {
        cleanParams.branchId = filters.branchId;
      }

      const searchVal = filters.search || filters.searchTerm || filters.searchQuery;
      if (searchVal && String(searchVal).trim()) {
        cleanParams.search = String(searchVal).trim();
      }

      const tableVal = filters.tableId || filters.table;
      if (tableVal && tableVal !== 'All' && tableVal !== 'ALL') {
        const rawTableId = typeof tableVal === 'object' && tableVal !== null ? (tableVal._id || tableVal.id) : tableVal;
        const strTableId = String(rawTableId || '').trim();
        // tableId MUST be a valid 24-hex MongoDB ObjectId (_id) for Mongoose Order model
        if (/^[0-9a-fA-F]{24}$/.test(strTableId)) {
          cleanParams.tableId = strTableId;
        } else {
          // Do NOT send non-ObjectId string as tableId to prevent "Cast to ObjectId failed" error
          cleanParams.table = strTableId;
          cleanParams.tableNumber = strTableId;
        }
      }

      const customerVal = filters.customer || filters.customerFilter;
      if (customerVal && String(customerVal).trim()) {
        cleanParams.customer = String(customerVal).trim();
      }

      const cashierVal = filters.cashierId || filters.cashier || filters.staffId || filters.waiterId;
      if (cashierVal && cashierVal !== 'All' && cashierVal !== 'ALL') {
        const rawStaffId = typeof cashierVal === 'object' && cashierVal !== null ? (cashierVal._id || cashierVal.id) : cashierVal;
        const strStaffId = String(rawStaffId || '').trim();
        // waiterId / cashierId / staffId MUST be a valid 24-hex MongoDB ObjectId (_id) for Mongoose Order model
        if (/^[0-9a-fA-F]{24}$/.test(strStaffId)) {
          cleanParams.cashierId = strStaffId;
          cleanParams.waiterId = strStaffId;
          cleanParams.staffId = strStaffId;
        } else {
          // Do NOT send non-ObjectId string as waiterId/cashierId/staffId to prevent "Cast to ObjectId failed" error
          cleanParams.cashier = strStaffId;
          cleanParams.staff = strStaffId;
          cleanParams.staffName = strStaffId;
        }
      }

      cleanParams.orderType = filters.orderType || 'DINE_IN';

      // 1-based page index
      const pageNum = filters.page !== undefined ? Number(filters.page) : 1;
      cleanParams.page = pageNum < 1 ? 1 : pageNum;

      cleanParams.limit = filters.limit !== undefined ? Number(filters.limit) : 10;
      cleanParams.sortBy = filters.sortBy || 'createdAt';
      cleanParams.sortOrder = filters.sortOrder || 'desc';

      // Add any additional non-empty params
      Object.keys(filters).forEach(key => {
        if (!['branchId', 'search', 'searchTerm', 'searchQuery', 'tableId', 'table', 'tableNumber', 'customer', 'customerFilter', 'cashierId', 'cashier', 'staffId', 'waiterId', 'staff', 'staffName', 'orderType', 'page', 'limit', 'sortBy', 'sortOrder', 'selectedTable', 'selectedStaff'].includes(key)) {
          const val = filters[key];
          if (val !== undefined && val !== null && val !== '' && val !== 'null' && val !== 'undefined' && val !== 'All' && val !== 'ALL') {
            cleanParams[key] = val;
          }
        }
      });

      const queryParams = new URLSearchParams(cleanParams).toString();
      const url = `/billing/current${queryParams ? `?${queryParams}` : ''}`;
      let response;
      try {
        response = await apiClient.get(url);
      } catch (err1) {
        if (err1?.response?.status === 404 || err1?.response?.status === 405) {
          try {
            const fallbackBillingUrl = `/billing${queryParams ? `?${queryParams}` : ''}`;
            response = await apiClient.get(fallbackBillingUrl);
          } catch (err2) {
            const ordersRes = await apiClient.get('/orders').catch(() => null);
            if (ordersRes?.data) {
              const rawOrders = Array.isArray(ordersRes.data) ? ordersRes.data : (ordersRes.data?.data || ordersRes.data?.orders || []);
              return { status: true, response: { data: rawOrders, tables: rawOrders, total: rawOrders.length } };
            }
            throw err2;
          }
        } else if (!err1?.response) {
          const ordersRes = await apiClient.get('/orders').catch(() => null);
          if (ordersRes?.data) {
            const rawOrders = Array.isArray(ordersRes.data) ? ordersRes.data : (ordersRes.data?.data || ordersRes.data?.orders || []);
            return { status: true, response: { data: rawOrders, tables: rawOrders, total: rawOrders.length } };
          }
        }
        throw err1;
      }

      if (response && (response.status === 200 || response.status === 201)) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch current billing.";
      console.warn("BillingApi getCurrentBilling note:", errorMessage);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async getActiveTables(filters = {}) {
    return this.getCurrentBilling(filters);
  }

  async processTablePayment(payload) {
    try {
      const response = await apiClient.post(`/billing/process-table`, payload);
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
      return { status: true, response: response?.data || { success: true } };
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to process payment.";

      if (String(errorMessage).toLowerCase().includes('no unpaid orders')) {
        return {
          status: true,
          response: error?.response?.data || { success: true, message: "No unpaid orders found. Table is already settled." },
          alreadyPaid: true
        };
      }

      ShowNotifications.showAlertNotification(errorMessage, false);

      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }
}

export default new BillingApi();