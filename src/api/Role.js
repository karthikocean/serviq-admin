import apiClient from "../config";
import ShowNotifications from "../helper/ShowNotifications.js";

class RoleApi {
  async getRoles() {
    try {
      const response = await apiClient.get("/roles-permissions");
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || "Failed to fetch roles.";
      if (error?.response?.status !== 401) {
        ShowNotifications.showAlertNotification(errorMessage, false);
      }
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async getRoleById(id) {
    try {
      const response = await apiClient.get(`/roles-permissions/${id}`);
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || "Failed to fetch role details.";
      if (error?.response?.status !== 401) {
        ShowNotifications.showAlertNotification(errorMessage, false);
      }
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async createRole(data, silent = false) {
    try {
      const response = await apiClient.post("/roles-permissions", data);
      if (response.status === 200 || response.status === 201) {
        if (!silent) {
          ShowNotifications.showAlertNotification(
            response.data.message || "Role Created Successfully!",
            true,
          );
        }
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || "Failed to create role.";
      if (!silent && error?.response?.status !== 401) {
        ShowNotifications.showAlertNotification(errorMessage, false);
      }
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async updateRole(id, data) {
    try {
      const response = await apiClient.put(`/roles-permissions/${id}`, data);
      if (response.status === 200 || response.status === 201) {
        ShowNotifications.showAlertNotification(
          response.data.message || "Role Updated Successfully!",
          true,
        );
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || "Failed to update role.";
      if (error?.response?.status !== 401) {
        ShowNotifications.showAlertNotification(errorMessage, false);
      }
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async deleteRole(id) {
    try {
      const response = await apiClient.delete(`/roles-permissions/${id}`);
      if (response.status === 200 || response.status === 201) {
        ShowNotifications.showAlertNotification(
          response.data.message || "Role Deleted Successfully!",
          true,
        );
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || "Failed to delete role.";
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

export default new RoleApi();
