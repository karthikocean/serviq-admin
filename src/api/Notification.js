import apiClient from "../config/index.js";
import ShowNotifications from "../helper/ShowNotifications.js";

class NotificationApi {
  async getNotifications(params = {}) {
    try {
      const cleanParams = {};
      Object.keys(params).forEach((key) => {
        if (
          params[key] !== undefined &&
          params[key] !== null &&
          params[key] !== "" &&
          params[key] !== "ALL" &&
          params[key] !== "all"
        ) {
          cleanParams[key] = params[key];
        }
      });

      const response = await apiClient.get("/notifications", {
        params: cleanParams,
      });

      if (response.status === 200 || response.status === 201) {
        return {
          status: true,
          response: response.data,
          data: response.data?.data || response.data,
        };
      }
      return { status: false, response: response.data };
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch notifications.";
      // Don't show alert toast for standard polling or silent fetching unless needed
      console.warn("NotificationApi getNotifications error:", errorMessage);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async markAsRead(id) {
    try {
      const response = await apiClient.patch(`/notifications/${id}/read`);
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      console.warn("NotificationApi markAsRead error:", error);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async markAllAsRead(params = {}) {
    try {
      const response = await apiClient.patch("/notifications/mark-all-read", {
        params,
      });
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      console.warn("NotificationApi markAllAsRead error:", error);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }
}

export const notificationApi = new NotificationApi();
export default NotificationApi;
