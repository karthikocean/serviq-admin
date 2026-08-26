import apiClient from "../config";
import ShowNotifications from "../helper/ShowNotifications.js";

const extractErrorMessage = (error, defaultMsg) => {
  const errors = error?.response?.data?.errors;
  if (Array.isArray(errors) && errors.length > 0) {
    const detail = errors.map(e => e.message || e.msg).filter(Boolean).join(', ');
    if (detail) return detail;
  }
  return error?.response?.data?.message || error?.message || defaultMsg;
};

class UserApi {
  async getUsers(params = {}) {
    try {
      const response = await apiClient.get("/users", { params });
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage = extractErrorMessage(error, "Failed to fetch users.");
      if (error?.response?.status !== 401) {
        ShowNotifications.showAlertNotification(errorMessage, false);
      }
      return { status: false, response: error?.response?.data || error };
    }
  }

  async getStations(params = {}) {
    try {
      const response = await apiClient.get("/users/stations", { params });
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage = extractErrorMessage(error, "Failed to fetch stations.");
      if (error?.response?.status !== 401) {
        ShowNotifications.showAlertNotification(errorMessage, false);
      }
      return { status: false, response: error?.response?.data || error };
    }
  }

  async createUser(data) {
    try {
      const response = await apiClient.post("/users", data);
      if (response.status === 200 || response.status === 201) {
        ShowNotifications.showAlertNotification(response.data.message || "User Created Successfully!", true);
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage = extractErrorMessage(error, "Failed to create user.");
      if (error?.response?.status !== 401) {
        ShowNotifications.showAlertNotification(errorMessage, false);
      }
      return { status: false, response: error?.response?.data || error };
    }
  }

  async updateUser(userId, data) {
    try {
      const response = await apiClient.put(`/users/${userId}`, data);
      if (response.status === 200 || response.status === 201) {
        ShowNotifications.showAlertNotification(response.data.message || "User Updated Successfully!", true);
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage = extractErrorMessage(error, "Failed to update user.");
      if (error?.response?.status !== 401) {
        ShowNotifications.showAlertNotification(errorMessage, false);
      }
      return { status: false, response: error?.response?.data || error };
    }
  }

  async deleteUser(userId) {
    try {
      const response = await apiClient.delete(`/users/${userId}`);
      if (response.status === 200 || response.status === 201) {
        ShowNotifications.showAlertNotification(response.data.message || "User Deleted Successfully!", true);
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage = extractErrorMessage(error, "Failed to delete user.");
      if (error?.response?.status !== 401) {
        ShowNotifications.showAlertNotification(errorMessage, false);
      }
      return { status: false, response: error?.response?.data || error };
    }
  }

  async changePassword(userId, password) {
    try {
      const response = await apiClient.put(`/users/${userId}/password`, { password });
      if (response.status === 200 || response.status === 201) {
        ShowNotifications.showAlertNotification(response.data.message || "Password Updated Successfully!", true);
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage = extractErrorMessage(error, "Failed to update password.");
      if (error?.response?.status !== 401) {
        ShowNotifications.showAlertNotification(errorMessage, false);
      }
      return { status: false, response: error?.response?.data || error };
    }
  }
}

export default new UserApi();
