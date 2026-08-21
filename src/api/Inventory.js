import apiClient from "../config/index.js";
import ShowNotifications from "../helper/ShowNotifications.js";

class InventoryApi {
  async getItems(params = {}) {
    try {
      const response = await apiClient.get("/inventory/items", { params });
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch inventory items.";
      if (error?.response?.status !== 401) {
        ShowNotifications.showAlertNotification(errorMessage, false);
      }
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async getItemById(id) {
    try {
      const response = await apiClient.get(`/inventory/items/${id}`);
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch inventory item details.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async createItem(data) {
    try {
      const response = await apiClient.post("/inventory/items", data);
      if (response.status === 200 || response.status === 201) {
        ShowNotifications.showAlertNotification(
          response.data.message || "Inventory item created successfully!",
          true
        );
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create inventory item.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async updateItem(id, data) {
    try {
      const response = await apiClient.put(`/inventory/items/${id}`, data);
      if (response.status === 200 || response.status === 201) {
        ShowNotifications.showAlertNotification(
          response.data.message || "Item updated successfully!",
          true
        );
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update inventory item.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async deleteItem(id) {
    try {
      const response = await apiClient.delete(`/inventory/items/${id}`);
      if (response.status === 200 || response.status === 201) {
        ShowNotifications.showAlertNotification(
          response.data.message || "Item deleted successfully!",
          true
        );
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete inventory item.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async recordPurchase(data) {
    try {
      const response = await apiClient.post("/inventory/purchase", data);
      if (response.status === 200 || response.status === 201) {
        ShowNotifications.showAlertNotification(
          response.data.message || "Purchase recorded successfully!",
          true
        );
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to record purchase.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async reduceStock(data) {
    try {
      const response = await apiClient.post("/inventory/reduce", data);
      if (response.status === 200 || response.status === 201) {
        ShowNotifications.showAlertNotification(
          response.data.message || "Stock reduced successfully!",
          true
        );
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to reduce stock.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async getLogs(params = {}) {
    try {
      const response = await apiClient.get("/inventory/logs", { params });
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch inventory logs.";
      if (error?.response?.status !== 401) {
        ShowNotifications.showAlertNotification(errorMessage, false);
      }
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async getStats(params = {}) {
    try {
      const response = await apiClient.get("/inventory/stats", { params });
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch inventory stats.";
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

export default new InventoryApi();
