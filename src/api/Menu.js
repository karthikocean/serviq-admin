import apiClient from "../config/index.js";
import ShowNotifications from "../helper/ShowNotifications.js";

class MenuApi {
  async getMenuItems(params = {}) {
    try {
      const cleanParams = {};
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '' && params[key] !== 'ALL' && params[key] !== 'All') {
          cleanParams[key] = params[key];
        }
      });
      const searchVal = params.search || params.searchQuery || params.searchTerm;
      if (searchVal && !cleanParams.search) cleanParams.search = searchVal;
      if (params.category && !cleanParams.category && params.category !== 'All' && params.category !== 'ALL') cleanParams.category = params.category;
      if (params.categoryId && !cleanParams.categoryId && params.categoryId !== 'All' && params.categoryId !== 'ALL') cleanParams.categoryId = params.categoryId;
      if (params.status && !cleanParams.status && params.status !== 'All' && params.status !== 'ALL') cleanParams.status = params.status;
      if (cleanParams.page !== undefined) {
        cleanParams.page = Math.max(0, Number(cleanParams.page) || 0);
      }
      if (cleanParams.limit !== undefined) {
        cleanParams.limit = Number(cleanParams.limit) || 10;
      }
      const response = await apiClient.get("/menu", { params: cleanParams });
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
      const response = await apiClient.get("/menu/categories", { params: cleanParams });
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
