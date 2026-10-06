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

      const tableVal = filters.tableId || filters.table;
      if (tableVal && tableVal !== 'All' && tableVal !== 'ALL') {
        cleanParams.tableId = tableVal;
      }

      const customerVal = filters.customer || filters.customerFilter;
      if (customerVal && String(customerVal).trim()) {
        cleanParams.customer = String(customerVal).trim();
      }

      const cashierVal = filters.cashierId || filters.cashier || filters.staffId;
      if (cashierVal && cashierVal !== 'All' && cashierVal !== 'ALL') {
        cleanParams.cashierId = cashierVal;
      }

      if (filters.dateRange && filters.dateRange !== 'All' && filters.dateRange !== 'ALL') {
        cleanParams.dateRange = String(filters.dateRange).trim().toUpperCase().replace(/\s+/g, '_');
      }

      const startDateVal = filters.startDate || filters.dateStart || filters.fromDate || filters.customStartDate;
      if (startDateVal) cleanParams.startDate = startDateVal;

      const endDateVal = filters.endDate || filters.dateEnd || filters.toDate || filters.customEndDate;
      if (endDateVal) cleanParams.endDate = endDateVal;

      const pm = filters.paymentMethod || filters.paymentMode;
      if (pm && pm !== 'All' && pm !== 'ALL') {
        cleanParams.paymentMethod = String(pm).toUpperCase();
      }

      const ps = filters.paymentStatus || filters.status;
      if (ps && ps !== 'All' && ps !== 'ALL') {
        cleanParams.paymentStatus = String(ps).toUpperCase();
      } else if (!cleanParams.paymentStatus) {
        cleanParams.paymentStatus = 'PAID';
      }

      cleanParams.orderType = filters.orderType || 'DINE_IN';

      // 1-based page index
      const pageNum = filters.page !== undefined ? Number(filters.page) : 1;
      cleanParams.page = pageNum < 1 ? 1 : pageNum;

      cleanParams.limit = filters.limit !== undefined ? Number(filters.limit) : 10;
      cleanParams.sortBy = filters.sortBy || 'createdAt';
      cleanParams.sortOrder = filters.sortOrder || 'desc';

      if (filters.isExport) cleanParams.isExport = filters.isExport;
      if (filters.limit === 0 || filters.limit === '0') cleanParams.limit = 0;

      // Add any additional non-empty params
      Object.keys(filters).forEach(key => {
        if (!['branchId', 'search', 'searchTerm', 'searchQuery', 'tableId', 'table', 'customer', 'customerFilter', 'cashierId', 'cashier', 'staffId', 'dateRange', 'startDate', 'endDate', 'dateStart', 'dateEnd', 'fromDate', 'toDate', 'customStartDate', 'customEndDate', 'paymentMethod', 'paymentMode', 'paymentStatus', 'status', 'orderType', 'page', 'limit', 'sortBy', 'sortOrder', 'isExport', 'selectedTable', 'selectedStaff', 'selectedPayment'].includes(key)) {
          const val = filters[key];
          if (val !== undefined && val !== null && val !== '' && val !== 'null' && val !== 'undefined' && val !== 'All' && val !== 'ALL') {
            cleanParams[key] = val;
          }
        }
      });

      const queryParams = new URLSearchParams(cleanParams).toString();
      const url = `/billing/history${queryParams ? `?${queryParams}` : ''}`;
      const response = await apiClient.get(url);

      if (response.status === 200 || response.status === 201) {
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
        cleanParams.tableId = tableVal;
      }

      const customerVal = filters.customer || filters.customerFilter;
      if (customerVal && String(customerVal).trim()) {
        cleanParams.customer = String(customerVal).trim();
      }

      const cashierVal = filters.cashierId || filters.cashier || filters.staffId;
      if (cashierVal && cashierVal !== 'All' && cashierVal !== 'ALL') {
        cleanParams.cashierId = cashierVal;
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
        if (!['branchId', 'search', 'searchTerm', 'searchQuery', 'tableId', 'table', 'customer', 'customerFilter', 'cashierId', 'cashier', 'staffId', 'orderType', 'page', 'limit', 'sortBy', 'sortOrder', 'selectedTable', 'selectedStaff'].includes(key)) {
          const val = filters[key];
          if (val !== undefined && val !== null && val !== '' && val !== 'null' && val !== 'undefined' && val !== 'All' && val !== 'ALL') {
            cleanParams[key] = val;
          }
        }
      });

      const queryParams = new URLSearchParams(cleanParams).toString();
      const url = `/billing/current${queryParams ? `?${queryParams}` : ''}`;
      const response = await apiClient.get(url);
      if (response.status === 200 || response.status === 201) {
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
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to process payment.";

      ShowNotifications.showAlertNotification(errorMessage, false);

      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }
}

export default new BillingApi();