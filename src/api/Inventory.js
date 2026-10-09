import apiClient from "../config/index.js";
import ShowNotifications from "../helper/ShowNotifications.js";

class InventoryApi {
  // --- ITEMS ---
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
      if (params.isActive !== undefined && params.isActive !== 'All' && params.isActive !== 'ALL') cleanParams.isActive = params.isActive;

      cleanParams.page = cleanParams.page !== undefined ? Math.max(0, Number(cleanParams.page) || 0) : 0;
      cleanParams.limit = cleanParams.limit !== undefined ? (Number(cleanParams.limit) || 10) : 10;
      const response = await apiClient.get("/inventory/items", { params: cleanParams });
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch inventory items.";
      console.warn("InventoryApi getItems note:", errorMessage);
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
      console.warn("InventoryApi getItemById note:", errorMessage);
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

  // --- VENDORS ---
  async getVendors(params = {}) {
    try {
      const response = await apiClient.get("/inventory/vendors", { params });
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      console.warn("InventoryApi getVendors note:", error);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async createVendor(data, options = {}) {
    try {
      const response = await apiClient.post("/inventory/vendors", data);
      if (response.status === 200 || response.status === 201) {
        if (!options.silent) {
          ShowNotifications.showAlertNotification(
            response.data.message || "Vendor created successfully!",
            true
          );
        }
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create vendor.";
      if (!options.silent) {
        ShowNotifications.showAlertNotification(errorMessage, false);
      }
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async updateVendor(id, data, options = {}) {
    try {
      const response = await apiClient.put(`/inventory/vendors/${id}`, data);
      if (response.status === 200 || response.status === 201) {
        if (!options.silent) {
          ShowNotifications.showAlertNotification(
            response.data.message || "Vendor updated successfully!",
            true
          );
        }
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update vendor.";
      if (!options.silent) {
        ShowNotifications.showAlertNotification(errorMessage, false);
      }
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async deleteVendor(id, options = {}) {
    try {
      const response = await apiClient.delete(`/inventory/vendors/${id}`);
      if (response.status === 200 || response.status === 201) {
        if (!options.silent) {
          ShowNotifications.showAlertNotification(
            response.data.message || "Vendor deleted successfully!",
            true
          );
        }
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete vendor.";
      if (!options.silent) {
        ShowNotifications.showAlertNotification(errorMessage, false);
      }
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  // --- PURCHASES ---
  async getPurchases(params = {}) {
    try {
      const response = await apiClient.get("/inventory/purchases", { params });
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      console.warn("InventoryApi getPurchases note:", error);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async recordPurchase(data, options = {}) {
    try {
      const response = await apiClient.post("/inventory/purchases", data);
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

  async deletePurchase(id, options = {}) {
    try {
      const response = await apiClient.delete(`/inventory/purchases/${id}`);
      if (response.status === 200 || response.status === 201) {
        if (!options.silent) {
          ShowNotifications.showAlertNotification(
            response.data.message || "Purchase deleted successfully!",
            true
          );
        }
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete purchase.";
      if (!options.silent) {
        ShowNotifications.showAlertNotification(errorMessage, false);
      }
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  // --- STOCK REQUESTS & DISTRIBUTIONS ---
  async getStockRequests(params = {}) {
    try {
      const response = await apiClient.get("/inventory/requests", { params });
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      console.warn("InventoryApi getStockRequests note:", error);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async createStockRequest(data, options = {}) {
    try {
      const response = await apiClient.post("/inventory/requests", data);
      if (response.status === 200 || response.status === 201) {
        if (!options.silent) {
          ShowNotifications.showAlertNotification(
            response.data.message || "Stock request submitted successfully!",
            true
          );
        }
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to submit stock request.";
      if (!options.silent) {
        ShowNotifications.showAlertNotification(errorMessage, false);
      }
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async approveStockRequest(id, data = {}, options = {}) {
    try {
      const response = await apiClient.put(`/inventory/requests/${id}/approve`, data);
      if (response.status === 200 || response.status === 201) {
        if (!options.silent) {
          ShowNotifications.showAlertNotification(
            response.data.message || "Stock request approved! Ready for distribution.",
            true
          );
        }
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to approve stock request.";
      if (!options.silent) {
        ShowNotifications.showAlertNotification(errorMessage, false);
      }
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async distributeStockRequest(id, data = {}, options = {}) {
    try {
      const response = await apiClient.put(`/inventory/requests/${id}/distribute`, data);
      if (response.status === 200 || response.status === 201) {
        if (!options.silent) {
          ShowNotifications.showAlertNotification(
            response.data.message || "Stock distributed successfully! Central stock updated.",
            true
          );
        }
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to distribute stock.";
      if (!options.silent) {
        ShowNotifications.showAlertNotification(errorMessage, false);
      }
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async rejectStockRequest(id, options = {}) {
    try {
      const response = await apiClient.put(`/inventory/requests/${id}/reject`);
      if (response.status === 200 || response.status === 201) {
        if (!options.silent) {
          ShowNotifications.showAlertNotification(
            response.data.message || "Stock request rejected.",
            false
          );
        }
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to reject stock request.";
      if (!options.silent) {
        ShowNotifications.showAlertNotification(errorMessage, false);
      }
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  // --- REDUCTIONS & OTHER ---
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
      const response = await apiClient.get("/inventory/logs", { params: cleanParams });
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      console.warn("InventoryApi getLogs note:", error);
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
      console.warn("InventoryApi getStats note:", error);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }
}

export default new InventoryApi();
