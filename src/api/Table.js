import apiClient from "../config/index.js";
import ShowNotifications from "../helper/ShowNotifications.js";

class MemberApi {
  async getTables(params = {}) {
    try {
      const response = await apiClient.get("/tables", { params });
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to Fetch Tables. Please try again.";
      if (error?.response?.status !== 401) {
        ShowNotifications.showAlertNotification(errorMessage, false);
      }
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async createTable(data) {
    try {
      const response = await apiClient.post("/tables", data);
      if (response.status === 200 || response.status === 201) {
        ShowNotifications.showAlertNotification(
          response.data.message || "Table Created Successfully!",
          true,
        );
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to Create Table. Please try again.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async getTableDetails(id) {
    try {
      const response = await apiClient.get(`/tables/${id}`);
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to Get Member Details. Please try again.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async updateTable(id, data) {
    try {
      const response = await apiClient.patch(`/tables/${id}`, data);
      if (response.status === 200 || response.status === 201) {
        ShowNotifications.showAlertNotification(
          response.data.message || "Table Updated Successfully!",
          true,
        );
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to Update Table. Please try again.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async deleteTable(id) {
    try {
      const response = await apiClient.delete(`/tables/${id}`);
      if (response.status === 200 || response.status === 201) {
        ShowNotifications.showAlertNotification(
          response.data.message || "Table Deleted Successfully!",
          true,
        );
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to Delete Table. Please try again.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }
  async statusUpdate(id, reason) {
    try {
      const response = await apiClient.patch(`/tables/${id}/status`, { reason });
      if (response.status === 200 || response.status === 201) {
        ShowNotifications.showAlertNotification(
          response.data.message || "Table Status Updated Successfully!",
          true,
        );
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to Delete Table. Please try again.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
      };
    }
  }

  async assignWaiter(data) {
    try {
      // PUT /api/admin/tables/assign-waiter
      const response = await apiClient.put(`/tables/assign-waiter`, data);
      if (response.status === 200 || response.status === 201) {
        ShowNotifications.showAlertNotification(
          response.data.message || "Waiter Assigned Successfully!",
          true,
        );
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to Assign Waiter. Please try again.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

}

export default new MemberApi();
