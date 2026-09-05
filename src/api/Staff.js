import apiClient from "../config/index.js";
import ShowNotifications from "../helper/ShowNotifications.js";

const extractErrorMessage = (error, defaultMsg) => {
  const errors = error?.response?.data?.errors;
  if (Array.isArray(errors) && errors.length > 0) {
    const detail = errors.map(e => e.message || e.msg).filter(Boolean).join(', ');
    if (detail) return detail;
  }
  return error?.response?.data?.message || error?.message || defaultMsg;
};

class StaffApi {
  async getStaff(branchId = "") {
    try {
      const cleanParams = { limit: 10, page: 0 };
      if (branchId && branchId !== 'ALL') {
        cleanParams.branchId = branchId;
      }
      const response = await apiClient.get("/users", { params: cleanParams });
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage = extractErrorMessage(error, "Failed to Fetch Staff. Please try again.");
      if (error?.response?.status !== 401 && error?.response?.status !== 403) {
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

