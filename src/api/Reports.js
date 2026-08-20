import apiClient from "../config/index.js";
import ShowNotifications from "../helper/ShowNotifications.js";

class ReportsApi {
  async getWaiterReports(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const url = `/reports/waiter${queryParams ? `?${queryParams}` : ''}`;
      const response = await apiClient.get(url);
      
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch waiter reports.";
        
      if (error?.response?.status !== 401) {
        ShowNotifications.showAlertNotification(errorMessage, false);
      }
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async getKitchenReports(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const url = `/reports/kitchen${queryParams ? `?${queryParams}` : ''}`;
      const response = await apiClient.get(url);
      
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch kitchen reports.";
        
      if (error?.response?.status !== 401) {
        ShowNotifications.showAlertNotification(errorMessage, false);
      }
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }
}

export default new ReportsApi();
