import apiClient from "../config/index.js";
import ShowNotifications from "../helper/ShowNotifications.js";

class InventoryApi {
  async getItems(params = {}) {
    try {
      const cleanParams = { limit: 10, page: 0 };
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
      if (params.dateStart && !cleanParams.startDate) cleanParams.startDate = params.dateStart;
      if (params.dateEnd && !cleanParams.endDate) cleanParams.endDate = params.dateEnd;
      if (params.fromDate && !cleanParams.startDate) cleanParams.startDate = params.fromDate;
      if (params.toDate && !cleanParams.endDate) cleanParams.endDate = params.toDate;
      if (params.customStartDate && !cleanParams.startDate) cleanParams.startDate = params.customStartDate;
      if (params.customEndDate && !cleanParams.endDate) cleanParams.endDate = params.customEndDate;

      if (cleanParams.page !== undefined) {
        cleanParams.page = Math.max(0, Number(cleanParams.page) || 0);
      }
      if (cleanParams.limit !== undefined) {
        cleanParams.limit = Number(cleanParams.limit) || 10;
      }
      const response = await apiClient.get("/inventory/items", { params: cleanParams });
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

  async createItem(data, options = {}) {
    try {
      const response = await apiClient.post("/inventory/items", data);
      if (response.status === 200 || response.status === 201) {
        if (!options.silent) {
          ShowNotifications.showAlertNotification(
            response.data.message || "Inventory item created successfully!",
            true
          );
        }
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create inventory item.";
      if (!options.silent) {
        ShowNotifications.showAlertNotification(errorMessage, false);
      }
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async updateItem(id, data, options = {}) {
    try {
      const response = await apiClient.put(`/inventory/items/${id}`, data);
      if (response.status === 200 || response.status === 201) {
        if (!options.silent) {
          ShowNotifications.showAlertNotification(
            response.data.message || "Item updated successfully!",
            true
          );
        }
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update inventory item.";
      if (!options.silent) {
        ShowNotifications.showAlertNotification(errorMessage, false);
      }
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async deleteItem(id, options = {}) {
    try {
      const response = await apiClient.delete(`/inventory/items/${id}`);
      if (response.status === 200 || response.status === 201) {
        if (!options.silent) {
          ShowNotifications.showAlertNotification(
            response.data.message || "Item deleted successfully!",
            true
          );
        }
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete inventory item.";
      if (!options.silent) {
        ShowNotifications.showAlertNotification(errorMessage, false);
      }
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async recordPurchase(data, options = {}) {
    try {
      const response = await apiClient.post("/inventory/purchase", data);
      if (response.status === 200 || response.status === 201) {
        if (!options.silent) {
          ShowNotifications.showAlertNotification(
            response.data.message || "Purchase recorded successfully!",
            true
          );
        }
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to record purchase.";
      if (!options.silent) {
        ShowNotifications.showAlertNotification(errorMessage, false);
      }
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async reduceStock(data, options = {}) {
    try {
      const response = await apiClient.post("/inventory/reduce", data);
      if (response.status === 200 || response.status === 201) {
        if (!options.silent) {
          ShowNotifications.showAlertNotification(
            response.data.message || "Stock reduced successfully!",
            true
          );
        }
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to reduce stock.";
      if (!options.silent) {
        ShowNotifications.showAlertNotification(errorMessage, false);
      }
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async getLogs(params = {}) {
    try {
      const cleanParams = { limit: 10, page: 0 };
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '' && params[key] !== 'ALL' && params[key] !== 'All') {
          cleanParams[key] = params[key];
        }
      });
      const searchVal = params.search || params.searchQuery || params.searchTerm;
      if (searchVal && !cleanParams.search) cleanParams.search = searchVal;
      if (params.type && !cleanParams.type && params.type !== 'All' && params.type !== 'ALL') cleanParams.type = params.type;
      if (params.reason && !cleanParams.reason && params.reason !== 'All' && params.reason !== 'ALL') cleanParams.reason = params.reason;
      if (params.category && !cleanParams.category && params.category !== 'All' && params.category !== 'ALL') cleanParams.category = params.category;
      if (params.dateStart && !cleanParams.startDate) cleanParams.startDate = params.dateStart;
      if (params.dateEnd && !cleanParams.endDate) cleanParams.endDate = params.dateEnd;
      if (params.fromDate && !cleanParams.startDate) cleanParams.startDate = params.fromDate;
      if (params.toDate && !cleanParams.endDate) cleanParams.endDate = params.toDate;
      if (params.customStartDate && !cleanParams.startDate) cleanParams.startDate = params.customStartDate;
      if (params.customEndDate && !cleanParams.endDate) cleanParams.endDate = params.customEndDate;

      if (cleanParams.page !== undefined) {
        cleanParams.page = Math.max(0, Number(cleanParams.page) || 0);
      }
      if (cleanParams.limit !== undefined) {
        cleanParams.limit = Number(cleanParams.limit) || 10;
      }
      const response = await apiClient.get("/inventory/logs", { params: cleanParams });
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
      const cleanParams = {};
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '' && params[key] !== 'ALL' && params[key] !== 'All') {
          cleanParams[key] = params[key];
        }
      });
      if (params.dateStart && !cleanParams.startDate) cleanParams.startDate = params.dateStart;
      if (params.dateEnd && !cleanParams.endDate) cleanParams.endDate = params.dateEnd;
      if (params.fromDate && !cleanParams.startDate) cleanParams.startDate = params.fromDate;
      if (params.toDate && !cleanParams.endDate) cleanParams.endDate = params.toDate;
      if (params.customStartDate && !cleanParams.startDate) cleanParams.startDate = params.customStartDate;
      if (params.customEndDate && !cleanParams.endDate) cleanParams.endDate = params.customEndDate;

      const response = await apiClient.get("/inventory/stats", { params: cleanParams });
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
