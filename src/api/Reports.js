import apiClient from "../config/index.js";
import ShowNotifications from "../helper/ShowNotifications.js";

class ReportsApi {
  async getWaiterReports(filters = {}) {
    try {
      const cleanParams = {};
      Object.keys(filters).forEach(key => {
        const val = filters[key];
        if (val !== undefined && val !== null && val !== '' && val !== 'null' && val !== 'undefined' && val !== 'All' && val !== 'ALL') {
          cleanParams[key] = val;
        }
      });
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
      const cleanParams = {};
      Object.keys(filters).forEach(key => {
        const val = filters[key];
        if (val !== undefined && val !== null && val !== '' && val !== 'null' && val !== 'undefined' && val !== 'All' && val !== 'ALL') {
          cleanParams[key] = val;
        }
      });
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
