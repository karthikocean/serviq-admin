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
        cleanParams.limit = Number(cleanParams.limit);
      } else {
        cleanParams.limit = 10;
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
        cleanParams.limit = Number(cleanParams.limit);
      } else {
        cleanParams.limit = 10;
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

  async getTaxSettlementReport(filters = {}) {
    try {
      const cleanParams = {};
      if (filters.branchId && filters.branchId !== 'ALL' && filters.branchId !== 'All') {
        cleanParams.branchId = filters.branchId;
      }
      if (filters.startDate || filters.dateStart || filters.fromDate) {
        cleanParams.startDate = filters.startDate || filters.dateStart || filters.fromDate;
      }
      if (filters.endDate || filters.dateEnd || filters.toDate) {
        cleanParams.endDate = filters.endDate || filters.dateEnd || filters.toDate;
      }
      if (filters.paymentMethod && filters.paymentMethod !== 'ALL' && filters.paymentMethod !== 'All') {
        cleanParams.paymentMethod = filters.paymentMethod;
      }
      if (filters.taxType && filters.taxType !== 'ALL' && filters.taxType !== 'All') {
        cleanParams.taxType = filters.taxType;
      }
      const searchVal = filters.search || filters.searchQuery || filters.searchTerm;
      if (searchVal) cleanParams.search = searchVal;
      cleanParams.page = filters.page !== undefined ? Math.max(0, Number(filters.page) || 0) : 0;
      cleanParams.limit = filters.limit !== undefined ? Number(filters.limit) : 10;

      const queryParams = new URLSearchParams(cleanParams).toString();
      const url = `/reports/tax-settlement${queryParams ? `?${queryParams}` : ''}`;
      const response = await apiClient.get(url);
      
      if (response.status === 200 || response.status === 201) {
        if (response.data && response.data.success === false) {
          return { status: false, response: response.data };
        }
        return { status: true, response: response.data };
      }
      return { status: false, response: response?.data };
    } catch (error) {
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async getSalesReport(filters = {}) {
    try {
      const cleanParams = {};
      if (filters.branchId && filters.branchId !== 'ALL' && filters.branchId !== 'All') cleanParams.branchId = filters.branchId;
      if (filters.startDate) cleanParams.startDate = filters.startDate;
      if (filters.endDate) cleanParams.endDate = filters.endDate;
      if (filters.paymentMethod && filters.paymentMethod !== 'ALL' && filters.paymentMethod !== 'All') cleanParams.paymentMethod = filters.paymentMethod;
      if (filters.orderType && filters.orderType !== 'ALL' && filters.orderType !== 'All') cleanParams.orderType = filters.orderType;
      if (filters.search) cleanParams.search = filters.search;
      cleanParams.page = filters.page !== undefined ? Math.max(0, Number(filters.page) || 0) : 0;
      cleanParams.limit = filters.limit !== undefined ? Number(filters.limit) : 10;

      const queryParams = new URLSearchParams(cleanParams).toString();
      const url = `/reports/sales-revenue${queryParams ? `?${queryParams}` : ''}`;
      const response = await apiClient.get(url);
      if (response.status === 200 || response.status === 201) {
        if (response.data && response.data.success === false) {
          return { status: false, response: response.data };
        }
        return { status: true, response: response.data };
      }
      return { status: false, response: response?.data };
    } catch (error) {
      return { status: false, response: error?.response?.data || error };
    }
  }

  async getDishPerformanceReport(filters = {}) {
    try {
      const cleanParams = {};
      if (filters.branchId && filters.branchId !== 'ALL' && filters.branchId !== 'All') cleanParams.branchId = filters.branchId;
      if (filters.startDate || filters.dateStart || filters.fromDate) cleanParams.startDate = filters.startDate || filters.dateStart || filters.fromDate;
      if (filters.endDate || filters.dateEnd || filters.toDate) cleanParams.endDate = filters.endDate || filters.dateEnd || filters.toDate;
      if (filters.category && filters.category !== 'ALL' && filters.category !== 'All') cleanParams.category = filters.category;
      if (filters.dish && filters.dish !== 'ALL' && filters.dish !== 'All') cleanParams.dish = filters.dish;
      if (filters.foodType && filters.foodType !== 'ALL' && filters.foodType !== 'All') cleanParams.foodType = filters.foodType;
      if (filters.orderType && filters.orderType !== 'ALL' && filters.orderType !== 'All') cleanParams.orderType = filters.orderType;
      const searchVal = filters.search || filters.searchQuery || filters.searchTerm;
      if (searchVal) cleanParams.search = searchVal;
      cleanParams.page = filters.page !== undefined ? Math.max(0, Number(filters.page) || 0) : 0;
      cleanParams.limit = filters.limit !== undefined ? Number(filters.limit) : 10;

      const queryParams = new URLSearchParams(cleanParams).toString();
      const url = `/reports/dish-performance${queryParams ? `?${queryParams}` : ''}`;
      const response = await apiClient.get(url);
      if (response.status === 200 || response.status === 201) {
        if (response.data && response.data.success === false) {
          return { status: false, response: response.data };
        }
        return { status: true, response: response.data };
      }
      return { status: false, response: response?.data };
    } catch (error) {
      return { status: false, response: error?.response?.data || error };
    }
  }

  async getOrderAnalyticsReport(filters = {}) {
    try {
      const cleanParams = {};
      if (filters.branchId && filters.branchId !== 'ALL' && filters.branchId !== 'All') cleanParams.branchId = filters.branchId;
      if (filters.startDate || filters.dateStart || filters.fromDate) cleanParams.startDate = filters.startDate || filters.dateStart || filters.fromDate;
      if (filters.endDate || filters.dateEnd || filters.toDate) cleanParams.endDate = filters.endDate || filters.dateEnd || filters.toDate;
      if (filters.orderType && filters.orderType !== 'ALL' && filters.orderType !== 'All') cleanParams.orderType = filters.orderType;
      if (filters.orderStatus && filters.orderStatus !== 'ALL' && filters.orderStatus !== 'All') cleanParams.orderStatus = filters.orderStatus;
      const searchVal = filters.search || filters.searchQuery || filters.searchTerm;
      if (searchVal) cleanParams.search = searchVal;
      cleanParams.page = filters.page !== undefined ? Math.max(0, Number(filters.page) || 0) : 0;
      cleanParams.limit = filters.limit !== undefined ? Number(filters.limit) : 10;

      const queryParams = new URLSearchParams(cleanParams).toString();
      const url = `/reports/order-analytics${queryParams ? `?${queryParams}` : ''}`;
      const response = await apiClient.get(url);
      if (response.status === 200 || response.status === 201) {
        if (response.data && response.data.success === false) {
          return { status: false, response: response.data };
        }
        return { status: true, response: response.data };
      }
      return { status: false, response: response?.data };
    } catch (error) {
      return { status: false, response: error?.response?.data || error };
    }
  }

  async getInventoryStockReport(filters = {}) {
    try {
      const cleanParams = {};
      if (filters.branchId && filters.branchId !== 'ALL' && filters.branchId !== 'All') cleanParams.branchId = filters.branchId;
      if (filters.startDate || filters.dateStart || filters.fromDate) cleanParams.startDate = filters.startDate || filters.dateStart || filters.fromDate;
      if (filters.endDate || filters.dateEnd || filters.toDate) cleanParams.endDate = filters.endDate || filters.dateEnd || filters.toDate;
      if (filters.category && filters.category !== 'ALL' && filters.category !== 'All') cleanParams.category = filters.category;
      if (filters.item && filters.item !== 'ALL' && filters.item !== 'All') cleanParams.item = filters.item;
      if (filters.stockStatus && filters.stockStatus !== 'ALL' && filters.stockStatus !== 'All') cleanParams.stockStatus = filters.stockStatus;
      const searchVal = filters.search || filters.searchQuery || filters.searchTerm;
      if (searchVal) cleanParams.search = searchVal;
      cleanParams.page = filters.page !== undefined ? Math.max(0, Number(filters.page) || 0) : 0;
      cleanParams.limit = filters.limit !== undefined ? Number(filters.limit) : 10;

      const queryParams = new URLSearchParams(cleanParams).toString();
      const url = `/reports/inventory-stock${queryParams ? `?${queryParams}` : ''}`;
      const response = await apiClient.get(url);
      if (response.status === 200 || response.status === 201) {
        if (response.data && response.data.success === false) {
          return { status: false, response: response.data };
        }
        return { status: true, response: response.data };
      }
      return { status: false, response: response?.data };
    } catch (error) {
      return { status: false, response: error?.response?.data || error };
    }
  }

  async getStaffPerformanceReport(filters = {}) {
    try {
      const cleanParams = {};
      if (filters.branchId && filters.branchId !== 'ALL' && filters.branchId !== 'All') cleanParams.branchId = filters.branchId;
      if (filters.startDate || filters.dateStart || filters.fromDate) cleanParams.startDate = filters.startDate || filters.dateStart || filters.fromDate;
      if (filters.endDate || filters.dateEnd || filters.toDate) cleanParams.endDate = filters.endDate || filters.dateEnd || filters.toDate;
      if (filters.staff && filters.staff !== 'ALL' && filters.staff !== 'All') cleanParams.staff = filters.staff;
      if (filters.role && filters.role !== 'ALL' && filters.role !== 'All') cleanParams.role = filters.role;
      const searchVal = filters.search || filters.searchQuery || filters.searchTerm;
      if (searchVal) cleanParams.search = searchVal;
      cleanParams.page = filters.page !== undefined ? Math.max(0, Number(filters.page) || 0) : 0;
      cleanParams.limit = filters.limit !== undefined ? Number(filters.limit) : 10;

      const queryParams = new URLSearchParams(cleanParams).toString();
      const url = `/reports/staff-performance${queryParams ? `?${queryParams}` : ''}`;
      const response = await apiClient.get(url);
      if (response.status === 200 || response.status === 201) {
        if (response.data && response.data.success === false) {
          return { status: false, response: response.data };
        }
        return { status: true, response: response.data };
      }
      return { status: false, response: response?.data };
    } catch (error) {
      return { status: false, response: error?.response?.data || error };
    }
  }

}

export default new ReportsApi();
