import apiClient from "../config/index.js";
import ShowNotifications from "../helper/ShowNotifications.js";

class SubscriptionApi {
  async getPlans(params = {}) {
    try {
      let response;
      try {
        response = await apiClient.get("/subscription/plans", { params });
      } catch (firstErr) {
        // Fallback to /plans if /subscription/plans is not found
        response = await apiClient.get("/plans", { params });
      }
      if (response && (response.status === 200 || response.status === 201)) {
        return { status: true, response: response.data };
      }
      return { status: false, response: response?.data };
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to Fetch Subscription Plans. Please try again.";
      console.warn("SubscriptionApi getPlans note:", errorMessage);
      return {
        status: false,
        response: error?.response?.data || error,
        message: errorMessage
      };
    }
  }

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
      console.warn("SubscriptionApi getDashboard note:", errorMessage);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async renewSubscription(payload = {}) {
    try {
      const planIdentifier = payload.newPlanId || payload._id || payload.planId || payload.plan || payload.id;
      const cleanPayload = {
        newPlanId: planIdentifier,
        planId: planIdentifier,
        plan: planIdentifier,
        _id: planIdentifier,
        billingCycle: payload.billingCycle || 'Monthly',
        paymentMethod: payload.paymentMethod || 'UPI',
        ...payload,
        newPlanId: planIdentifier
      };
      const response = await apiClient.post("/subscription/renew", cleanPayload);
      if (response.status === 200 || response.status === 201) {
        ShowNotifications.showAlertNotification(
          response.data?.message || response.data?.data?.message || "Plan renewed successfully!",
          true
        );
        return { status: true, response: response.data };
      }
      return { status: false, response: response.data };
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to renew subscription plan.";
      if (error?.response?.status !== 401) {
        ShowNotifications.showAlertNotification(errorMessage, false);
      }
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async upgradeSubscription(payload = {}) {
    try {
      const planIdentifier = payload.newPlanId || payload._id || payload.planId || payload.plan || payload.id;
      const rawCycle = payload.billingCycle || payload.cycle || 'Monthly';
      const cleanCycle = String(rawCycle).toLowerCase().includes('annual') || String(rawCycle).toLowerCase().includes('year')
        ? 'Annually'
        : 'Monthly';

      const cleanPayload = {
        newPlanId: planIdentifier,
        paymentMethod: payload.paymentMethod || 'Credit Card',
        billingCycle: cleanCycle
      };

      const response = await apiClient.post("/subscription/upgrade", cleanPayload);
      if (response.status === 200 || response.status === 201) {
        ShowNotifications.showAlertNotification(
          response.data?.message || response.data?.data?.message || "Plan upgraded successfully!",
          true
        );
        return { status: true, response: response.data };
      }
      return { status: false, response: response.data };
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to upgrade subscription plan.";
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
