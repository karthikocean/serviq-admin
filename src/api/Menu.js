import apiClient from "../config/index.js";
import ShowNotifications from "../helper/ShowNotifications.js";

class MenuApi {
  async getMenuItems(params = {}) {
    try {
      const response = await apiClient.get("/menu", { params });
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch menu items. Please try again.";
      if (error?.response?.status !== 401) {
        ShowNotifications.showAlertNotification(errorMessage, false);
      }
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async getCategories(params = {}) {
    try {
      const response = await apiClient.get("/menu/categories", { params });
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      console.error("Failed to fetch categories", error);
      return { status: false, response: error };
    }
  }

  async createCategory(data) {
    try {
      const response = await apiClient.post("/menu/category", data);
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      console.error("Failed to create category", error);
      return { status: false, response: error };
    }
  }

  async updateCategory(id, data) {
    try {
      const response = await apiClient.put(`/menu/category/${id}`, data);
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      console.error("Failed to update category", error);
      return { status: false, response: error };
    }
  }

  async deleteCategory(id) {
    try {
      const response = await apiClient.delete(`/menu/category/${id}`);
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      console.error("Failed to delete category", error);
      return { status: false, response: error };
    }
  }

  async createMenuItem(data) {
    try {
      const response = await apiClient.post("/menu", data);
      if (response.status === 200 || response.status === 201) {
        ShowNotifications.showAlertNotification(
          response.data.message || "Menu item added successfully!",
          true
        );
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to add menu item. Please try again.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async updateMenuItem(id, data) {
    try {
      const response = await apiClient.put(`/menu/${id}`, data);
      if (response.status === 200 || response.status === 201) {
        ShowNotifications.showAlertNotification(
          response.data.message || "Menu item updated successfully!",
          true
        );
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update menu item. Please try again.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async deleteMenuItem(id) {
    try {
      const response = await apiClient.delete(`/menu/${id}`);
      if (response.status === 200 || response.status === 201) {
        ShowNotifications.showAlertNotification(
          response.data.message || "Menu item deleted successfully!",
          true
        );
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete menu item. Please try again.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }
}

export default new MenuApi();
