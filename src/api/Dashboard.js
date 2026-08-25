import apiClient from "../config/index.js";
import ShowNotifications from "../helper/ShowNotifications.js";

class DashboardApi {
  async getDashboardStats(params = {}) {
    try {
      const cleanParams = {};
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '' && params[key] !== 'ALL') {
          cleanParams[key] = params[key];
        }
      });
      const queryParams = new URLSearchParams(cleanParams).toString();
      const url = `/dashboard/stats${queryParams ? `?${queryParams}` : ''}`;
      const response = await apiClient.get(url);

      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch dashboard stats.";

      if (error?.response?.status !== 401) {
        console.warn("Dashboard stats fetch note:", errorMessage);
      }
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async getRevenueGrowth(params = {}) {
    try {
      const cleanParams = {};
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '' && params[key] !== 'ALL') {
          cleanParams[key] = params[key];
        }
      });
      const queryParams = new URLSearchParams(cleanParams).toString();
      const url = `/dashboard/revenue-growth${queryParams ? `?${queryParams}` : ''}`;
      const response = await apiClient.get(url);

      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch revenue growth data.";

      if (error?.response?.status !== 401) {
        console.warn("Revenue growth fetch note:", errorMessage);
      }
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async getOrderBreakdown(params = {}) {
    try {
      const cleanParams = {};
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '' && params[key] !== 'ALL') {
          cleanParams[key] = params[key];
        }
      });
      const queryParams = new URLSearchParams(cleanParams).toString();
      const url = `/dashboard/order-breakdown${queryParams ? `?${queryParams}` : ''}`;
      const response = await apiClient.get(url);

      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch order breakdown data.";

      if (error?.response?.status !== 401) {
        console.warn("Order breakdown fetch note:", errorMessage);
      }
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async getLiveOrders(params = {}) {
    try {
      const cleanParams = { limit: 5 };
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '' && params[key] !== 'ALL') {
          cleanParams[key] = params[key];
        }
      });
      const queryParams = new URLSearchParams(cleanParams).toString();
      const url = `/dashboard/live-orders${queryParams ? `?${queryParams}` : ''}`;
      const response = await apiClient.get(url);

      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch live orders.";

      if (error?.response?.status !== 401) {
        console.warn("Live orders fetch note:", errorMessage);
      }
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async getLiveTables(params = {}) {
    try {
      const cleanParams = {};
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '' && params[key] !== 'ALL') {
          cleanParams[key] = params[key];
        }
      });
      const queryParams = new URLSearchParams(cleanParams).toString();
      const url = `/dashboard/live-tables${queryParams ? `?${queryParams}` : ''}`;
      const response = await apiClient.get(url);

      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch live tables status.";

      if (error?.response?.status !== 401) {
        console.warn("Live tables fetch note:", errorMessage);
      }
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }
}

export default new DashboardApi();
