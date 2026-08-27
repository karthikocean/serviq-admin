import apiClient from "../config/index.js";
import ShowNotifications from "../helper/ShowNotifications.js";

class SubscriptionApi {
  async getDashboard() {
    try {
      const response = await apiClient.get("/subscription/dashboard");
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
      return { status: false, response: response.data };
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to Fetch Subscription Dashboard. Please try again.";
      if (error?.response?.status !== 401) {
        ShowNotifications.showAlertNotification(errorMessage, false);
      }
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async purchaseAddons(payload) {
    try {
      const response = await apiClient.post("/subscription/addons", payload);
      if (response.status === 200 || response.status === 201) {
        ShowNotifications.showAlertNotification(
          response.data?.message || "Successfully purchased additional branch slots.",
          true
        );
        return { status: true, response: response.data };
      }
      return { status: false, response: response.data };
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to purchase additional branch slots.";
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

export default new SubscriptionApi();
