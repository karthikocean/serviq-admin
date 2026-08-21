import apiClient from "../config/index.js";
import ShowNotifications from "../helper/ShowNotifications.js";

class InventoryCategoryApi {
  async getCategories(params = {}) {
    try {
      const response = await apiClient.get("/inventory/categories", { params });
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch inventory categories.";
      if (error?.response?.status !== 401) {
        ShowNotifications.showAlertNotification(errorMessage, false);
      }
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async createCategory(data) {
    try {
      const response = await apiClient.post("/inventory/categories", data);
      if (response.status === 200 || response.status === 201) {
        ShowNotifications.showAlertNotification(
          response.data.message || "Inventory category created successfully!",
          true
        );
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create inventory category.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async updateCategory(id, data) {
    try {
      const response = await apiClient.put(`/inventory/categories/${id}`, data);
      if (response.status === 200 || response.status === 201) {
        ShowNotifications.showAlertNotification(
          response.data.message || "Inventory category updated successfully!",
          true
        );
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update inventory category.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async deleteCategory(id) {
    try {
      const response = await apiClient.delete(`/inventory/categories/${id}`);
      if (response.status === 200 || response.status === 201) {
        ShowNotifications.showAlertNotification(
          response.data.message || "Inventory category deleted successfully!",
          true
        );
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete inventory category.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }
}

export default new InventoryCategoryApi();
