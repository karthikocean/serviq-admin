import apiClient from "../config/index.js";
import ShowNotifications from "../helper/ShowNotifications.js";

class StaffApi {
  async getStaff(branchId = "") {
    try {
      const url = branchId ? `/staff?branchId=${branchId}` : `/staff`;
      const response = await apiClient.get(url);
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to Fetch Staff. Please try again.";
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

export default new StaffApi();
