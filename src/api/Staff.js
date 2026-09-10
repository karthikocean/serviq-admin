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
  async getStaff(params = "") {
    try {
      const cleanParams = { limit: 10, page: 0 };
      if (typeof params === 'string') {
        if (params && params !== 'ALL' && params !== 'All') {
          cleanParams.branchId = params;
        }
      } else if (params && typeof params === 'object') {
        Object.keys(params).forEach(key => {
          if (params[key] !== undefined && params[key] !== null && params[key] !== '' && params[key] !== 'ALL' && params[key] !== 'All') {
            cleanParams[key] = params[key];
          }
        });
        const searchVal = params.search || params.searchQuery || params.searchTerm;
        if (searchVal && !cleanParams.search) cleanParams.search = searchVal;
        const roleVal = params.role || params.roleFilter;
        if (roleVal && !cleanParams.role && roleVal !== 'All' && roleVal !== 'ALL') cleanParams.role = roleVal;
        if (cleanParams.page !== undefined) {
          cleanParams.page = Math.max(0, Number(cleanParams.page) || 0);
        }
        if (cleanParams.limit !== undefined) {
          cleanParams.limit = Number(cleanParams.limit) || 10;
        }
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

