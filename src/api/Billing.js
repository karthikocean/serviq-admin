import apiClient from "../config/index.js";
import ShowNotifications from "../helper/ShowNotifications.js";

class BillingApi {
  async getBillingHistory(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
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
      const queryParams = new URLSearchParams(filters).toString();
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
