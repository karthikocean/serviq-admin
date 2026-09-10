import apiClient from "../config/index.js";
import ShowNotifications from "../helper/ShowNotifications.js";

class OrderApi {
  async getOrders(params = {}) {
    try {
      const cleanParams = { limit: 10, page: 0 };
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '' && params[key] !== 'ALL' && params[key] !== 'All') {
          cleanParams[key] = params[key];
        }
      });
      const searchVal = params.search || params.searchQuery || params.searchTerm;
      if (searchVal && !cleanParams.search) cleanParams.search = searchVal;
      if (params.status && !cleanParams.status && params.status !== 'All' && params.status !== 'ALL') cleanParams.status = params.status;
      if (params.billingStatus && !cleanParams.billingStatus && params.billingStatus !== 'All' && params.billingStatus !== 'ALL') cleanParams.billingStatus = params.billingStatus;
      if (params.waiter && !cleanParams.waiter && params.waiter !== 'All' && params.waiter !== 'ALL') cleanParams.waiter = params.waiter;
      if (params.table && !cleanParams.table && params.table !== 'All' && params.table !== 'ALL') cleanParams.table = params.table;
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
      const response = await apiClient.get("/orders", { params: cleanParams });
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to Fetch Orders. Please try again.";
      if (error?.response?.status !== 401) {
        ShowNotifications.showAlertNotification(errorMessage, false);
      }
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async createOrder(data) {
    try {
      const response = await apiClient.post("/orders", data);
      if (response.status === 200 || response.status === 201) {
        ShowNotifications.showAlertNotification(
          response.data.message || "Order Created Successfully!",
          true
        );
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to Create Order. Please try again.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async updateOrder(id, data) {
    try {
      const response = await apiClient.put(`/orders/${id}`, data);
      if (response.status === 200 || response.status === 201) {
        ShowNotifications.showAlertNotification(
          response.data.message || "Order Updated Successfully!",
          true
        );
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to Update Order. Please try again.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async deleteOrder(id) {
    try {
      const response = await apiClient.delete(`/orders/${id}`);
      if (response.status === 200 || response.status === 201) {
        ShowNotifications.showAlertNotification(
          response.data.message || "Order Deleted Successfully!",
          true
        );
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to Delete Order. Please try again.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async payBill(tableLabel) {
    try {
      const response = await apiClient.post("/billing/pay", { tableLabel });
      if (response.status === 200 || response.status === 201) {
        ShowNotifications.showAlertNotification(
          response.data.message || `Bill for ${tableLabel} paid successfully!`,
          true
        );
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to Process Payment. Please try again.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }
}

export default new OrderApi();
