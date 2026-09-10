import apiClient from "../config/index.js";
import ShowNotifications from "../helper/ShowNotifications.js";

class ReportsApi {
  async getWaiterReports(filters = {}) {
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
      if (filters.waiter && !cleanParams.waiter && filters.waiter !== 'All' && filters.waiter !== 'ALL') cleanParams.waiter = filters.waiter;
      if (filters.category && !cleanParams.category && filters.category !== 'All' && filters.category !== 'ALL') cleanParams.category = filters.category;
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
      const url = `/reports/waiter${queryParams ? `?${queryParams}` : ''}`;
      const response = await apiClient.get(url);
      
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async getKitchenReports(filters = {}) {
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
      if (filters.category && !cleanParams.category && filters.category !== 'All' && filters.category !== 'ALL') cleanParams.category = filters.category;
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
      const url = `/reports/kitchen${queryParams ? `?${queryParams}` : ''}`;
      const response = await apiClient.get(url);
      
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }
}

export default new ReportsApi();
