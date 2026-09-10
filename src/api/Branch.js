import apiClient from "../config/index.js";
import ShowNotifications from "../helper/ShowNotifications.js";

const extractErrorMessage = (error, fallback) => {
  const errors = error?.response?.data?.errors;
  if (Array.isArray(errors) && errors.length > 0) {
    const detail = errors.map(e => e.message || e.msg).filter(Boolean).join(', ');
    if (detail) return detail;
  }
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
};

class BranchApi {
  async getBranches(params = {}) {
    try {
      const cleanParams = {};
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '' && params[key] !== 'ALL' && params[key] !== 'All') {
          cleanParams[key] = params[key];
        }
      });
      const searchVal = params.search || params.searchQuery || params.searchTerm;
      if (searchVal && !cleanParams.search) cleanParams.search = searchVal;
      if (params.status && !cleanParams.status && params.status !== 'All' && params.status !== 'ALL') cleanParams.status = params.status;
      if (cleanParams.page !== undefined) {
        cleanParams.page = Math.max(0, Number(cleanParams.page) || 0);
      }
      if (cleanParams.limit !== undefined) {
        cleanParams.limit = Number(cleanParams.limit) || 10;
      }
      const response = await apiClient.get("/branches", { params: cleanParams });
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage = extractErrorMessage(
        error,
        "Failed to Fetch Branches. Please try again."
      );
      if (error?.response?.status !== 401) {
        ShowNotifications.showAlertNotification(errorMessage, false);
      }
      return {
        status: false,
        response: error?.response?.data || error,
        message: errorMessage
      };
    }
  }

  async createBranch(data) {
    try {
      const response = await apiClient.post("/branches", data);
      if (response.status === 200 || response.status === 201) {
        ShowNotifications.showAlertNotification(
          response.data.message || "Branch Created Successfully!",
          true,
        );
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage = extractErrorMessage(
        error,
        "Failed to Create Branch. Please try again."
      );
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
        message: errorMessage
      };
    }
  }

  async getBranchDetails(id) {
    try {
      const response = await apiClient.get(`/branches/${id}`);
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage = extractErrorMessage(
        error,
        "Failed to Get Branch Details. Please try again."
      );
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
        message: errorMessage
      };
    }
  }

  async updateBranch(id, data) {
    try {
      const response = await apiClient.put(`/branches/${id}`, data);
      if (response.status === 200 || response.status === 201) {
        ShowNotifications.showAlertNotification(
          response.data.message || "Branch Updated Successfully!",
          true,
        );
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage = extractErrorMessage(
        error,
        "Failed to Update Branch. Please try again."
      );
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
        message: errorMessage
      };
    }
  }

  async deleteBranch(id) {
    try {
      const response = await apiClient.delete(`/branches/${id}`);
      if (response.status === 200 || response.status === 201) {
        ShowNotifications.showAlertNotification(
          response.data.message || "Branch Deleted Successfully!",
          true,
        );
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage = extractErrorMessage(
        error,
        "Failed to Delete Branch. Please try again."
      );
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
        message: errorMessage
      };
    }
  }
}

export default new BranchApi();
