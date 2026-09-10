import apiClient from "../config/index.js";
import ShowNotifications from "../helper/ShowNotifications.js";

class BillingApi {
  async getBillingHistory(filters = {}) {
    try {
      const cleanParams = { limit: 10, page: 0 };
      Object.keys(filters).forEach(key => {
        const val = filters[key];
        if (val !== undefined && val !== null && val !== '' && val !== 'null' && val !== 'undefined' && val !== 'All' && val !== 'ALL') {
          cleanParams[key] = val;
        }
      });
      const searchVal = filters.search || filters.searchQuery || filters.searchTerm;
      if (searchVal && !cleanParams.search) cleanParams.search = searchVal;
      if (filters.paymentMethod && !cleanParams.paymentMethod && filters.paymentMethod !== 'All' && filters.paymentMethod !== 'ALL') cleanParams.paymentMethod = filters.paymentMethod;
      if (filters.status && !cleanParams.status && filters.status !== 'All' && filters.status !== 'ALL') cleanParams.status = filters.status;
      if (filters.branchId && !cleanParams.branchId && filters.branchId !== 'All' && filters.branchId !== 'ALL') cleanParams.branchId = filters.branchId;
      if (filters.dateStart && !cleanParams.startDate) cleanParams.startDate = filters.dateStart;
      if (filters.dateEnd && !cleanParams.endDate) cleanParams.endDate = filters.dateEnd;
      if (filters.fromDate && !cleanParams.startDate) cleanParams.startDate = filters.fromDate;
      if (filters.toDate && !cleanParams.endDate) cleanParams.endDate = filters.toDate;
      if (filters.customStartDate && !cleanParams.startDate) cleanParams.startDate = filters.customStartDate;
      if (filters.customEndDate && !cleanParams.endDate) cleanParams.endDate = filters.customEndDate;

      if (cleanParams.page !== undefined) {
        cleanParams.page = Math.max(0, Number(cleanParams.page) || 0);
      }
      if (cleanParams.limit !== undefined) {
        cleanParams.limit = Number(cleanParams.limit) || 10;
      }
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

      if (error?.response?.status !== 401) {
        ShowNotifications.showAlertNotification(errorMessage, false);
      }
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async getActiveTables(filters = {}) {
    try {
      const cleanParams = {};
      Object.keys(filters).forEach(key => {
        const val = filters[key];
        if (val !== undefined && val !== null && val !== '' && val !== 'null' && val !== 'undefined') {
          cleanParams[key] = val;
        }
      });
      const queryParams = new URLSearchParams(cleanParams).toString();
      const url = `/billing/active-tables${queryParams ? `?${queryParams}` : ''}`;
      const response = await apiClient.get(url);
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch active tables.";
      if (error?.response?.status !== 401) {
        ShowNotifications.showAlertNotification(errorMessage, false);
      }
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
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