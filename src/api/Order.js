import apiClient from "../config/index.js";
import ShowNotifications from "../helper/ShowNotifications.js";

class OrderApi {
  async getOrders(params = {}) {
    try {
      const cleanParams = { limit: 10, page: 0 };
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '' && String(params[key]).toUpperCase() !== 'ALL' && String(params[key]).toUpperCase() !== 'ALL WAITERS') {
          cleanParams[key] = params[key];
        }
      });
      const searchVal = params.search || params.searchQuery || params.searchTerm;
      if (searchVal && !cleanParams.search) cleanParams.search = searchVal;
      if (params.status && !cleanParams.status && String(params.status).toUpperCase() !== 'ALL') cleanParams.status = params.status;
      if (params.billingStatus && !cleanParams.billingStatus && String(params.billingStatus).toUpperCase() !== 'ALL') cleanParams.billingStatus = params.billingStatus;
      if (params.waiter && !cleanParams.waiter && String(params.waiter).toUpperCase() !== 'ALL' && String(params.waiter).toUpperCase() !== 'ALL WAITERS') cleanParams.waiter = params.waiter;
      if (params.table && !cleanParams.table && String(params.table).toUpperCase() !== 'ALL') cleanParams.table = params.table;
      if (params.category && !cleanParams.category && String(params.category).toUpperCase() !== 'ALL') cleanParams.category = params.category;
      if (params.dateStart && !cleanParams.startDate) cleanParams.startDate = params.dateStart;
      if (params.dateEnd && !cleanParams.endDate) cleanParams.endDate = params.dateEnd;
      if (params.fromDate && !cleanParams.startDate) cleanParams.startDate = params.fromDate;
      if (params.toDate && !cleanParams.endDate) cleanParams.endDate = params.toDate;
      if (params.customStartDate && !cleanParams.startDate) cleanParams.startDate = params.customStartDate;
      if (params.customEndDate && !cleanParams.endDate) cleanParams.endDate = params.customEndDate;

      if (params.page !== undefined) {
        cleanParams.page = Math.max(0, Number(params.page) || 0);
      } else {
        cleanParams.page = 0;
      }
      if (cleanParams.limit !== undefined) {
        cleanParams.limit = Number(cleanParams.limit);
      } else {
        cleanParams.limit = 10;
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
      console.warn("OrderApi getOrders note:", errorMessage);
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

  async updateOrder(idOrObj, data) {
    try {
      let id = typeof idOrObj === 'object' && idOrObj !== null
        ? (idOrObj._id || idOrObj.order_id || idOrObj.rawOrderId || idOrObj.id)
        : idOrObj;

      // If id is not a 24-character hex MongoDB ObjectId, attempt to resolve it
      if (typeof id === 'string' && !/^[0-9a-fA-F]{24}$/.test(id.trim())) {
        try {
          const res = await apiClient.get('/orders', { params: { limit: 10 } });
          const orders = res?.data?.data || res?.data?.orders || [];
          const matched = orders.find(o => 
            o.orderId === id || o.id === id || o.orderNumber === id || o.customOrderId === id
          );
          if (matched && matched._id && /^[0-9a-fA-F]{24}$/.test(matched._id)) {
            id = matched._id;
          }
        } catch (lookupErr) {
          console.warn("OrderApi updateOrder ID resolution error:", lookupErr);
        }
      }

      const targetId = String(id || '').trim();
      let payloadData = typeof data === 'object' && data !== null ? { ...data } : {};
      if (!Array.isArray(payloadData.items)) {
        payloadData.items = [];
      }
      if (payloadData.subtotal === undefined) payloadData.subtotal = 0;
      if (payloadData.tax === undefined) payloadData.tax = 0;
      if (payloadData.total === undefined) payloadData.total = 0;

      let response;
      if (data && typeof data === 'object' && Object.keys(data).length === 1 && data.status) {
        try {
          response = await apiClient.patch(`/orders/${targetId}/status`, { status: data.status });
        } catch (patchErr) {
          response = await apiClient.put(`/orders/${targetId}`, payloadData);
        }
      } else {
        response = await apiClient.put(`/orders/${targetId}`, payloadData);
      }
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

  async deleteOrder(idOrObj) {
    try {
      let id = typeof idOrObj === 'object' && idOrObj !== null
        ? (idOrObj._id || idOrObj.order_id || idOrObj.rawOrderId || idOrObj.id)
        : idOrObj;

      // If id is not a 24-character hex MongoDB ObjectId, attempt to resolve it
      if (typeof id === 'string' && !/^[0-9a-fA-F]{24}$/.test(id.trim())) {
        try {
          const res = await apiClient.get('/orders', { params: { limit: 10 } });
          const orders = res?.data?.data || res?.data?.orders || [];
          const matched = orders.find(o => 
            o.orderId === id || o.id === id || o.orderNumber === id || o.customOrderId === id
          );
          if (matched && matched._id && /^[0-9a-fA-F]{24}$/.test(matched._id)) {
            id = matched._id;
          }
        } catch (lookupErr) {
          console.warn("OrderApi deleteOrder ID resolution error:", lookupErr);
        }
      }

      const targetId = String(id || '').trim();
      const response = await apiClient.delete(`/orders/${targetId}`);
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
          response.data?.message || `Bill for ${tableLabel} paid successfully!`,
          true
        );
        return { status: true, response: response.data };
      }
      return { status: true, response: response?.data || { success: true } };
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to Process Payment. Please try again.";

      if (String(errorMessage).toLowerCase().includes('no unpaid orders')) {
        ShowNotifications.showAlertNotification(
          `Bill for ${tableLabel} is already settled / paid!`,
          true
        );
        return {
          status: true,
          response: error?.response?.data || { success: true, message: `Bill for ${tableLabel} is already settled.` },
          alreadyPaid: true
        };
      }

      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }
}

export default new OrderApi();
