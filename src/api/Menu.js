import apiClient from "../config/index.js";
import ShowNotifications from "../helper/ShowNotifications.js";

const isValidMongoId = (id) => typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);

const sanitizeParams = (params = {}) => {
  const cleanParams = {};
  Object.keys(params).forEach(key => {
    const val = params[key];
    if (val !== undefined && val !== null && val !== '') {
      if (key === 'branchId') {
        const sVal = String(val).toUpperCase();
        if (sVal !== 'ALL' && sVal !== 'COMPANY' && isValidMongoId(val)) {
          cleanParams[key] = val;
        }
      } else {
        const sVal = String(val).toUpperCase();
        if (sVal !== 'ALL' && sVal !== 'COMPANY') {
          cleanParams[key] = val;
        }
      }
    }
  });
  return cleanParams;
};

const sanitizePayload = (data = {}) => {
  if (!data || typeof data !== 'object') return data;
  const cleanData = { ...data };
  if (cleanData.branchId) {
    const sBranch = String(cleanData.branchId).toUpperCase();
    if (sBranch === 'COMPANY' || sBranch === 'ALL' || !isValidMongoId(cleanData.branchId)) {
      delete cleanData.branchId;
    }
  }
  return cleanData;
};

class MenuApi {
  async getMenuItems(params = {}) {
    try {
      const cleanParams = sanitizeParams(params);
      const searchVal = params.search || params.searchQuery || params.searchTerm;
      if (searchVal && !cleanParams.search) cleanParams.search = searchVal;
      if (params.category && !cleanParams.category && params.category !== 'All' && params.category !== 'ALL') cleanParams.category = params.category;
      if (params.categoryId && !cleanParams.categoryId && params.categoryId !== 'All' && params.categoryId !== 'ALL') cleanParams.categoryId = params.categoryId;
      if (params.status && !cleanParams.status && params.status !== 'All' && params.status !== 'ALL') cleanParams.status = params.status;
      if (cleanParams.page !== undefined) {
        cleanParams.page = Math.max(0, Number(cleanParams.page) || 0);
      }
      if (cleanParams.limit !== undefined) {
        cleanParams.limit = Number(cleanParams.limit);
      } else {
        cleanParams.limit = 10;
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
      console.warn("MenuApi getMenuItems note:", errorMessage);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async getCategories(params = {}) {
    try {
      const cleanParams = sanitizeParams(params);
      const searchVal = params.search || params.searchQuery || params.searchTerm;
      if (searchVal && !cleanParams.search) cleanParams.search = searchVal;
      if (params.status && !cleanParams.status && params.status !== 'All' && params.status !== 'ALL') cleanParams.status = params.status;
      if (cleanParams.page !== undefined) {
        cleanParams.page = Math.max(0, Number(cleanParams.page) || 0);
      }
      if (cleanParams.limit !== undefined) {
        cleanParams.limit = Number(cleanParams.limit);
      } else {
        cleanParams.limit = 0;
      }
      let response;
      try {
        response = await apiClient.get("/menu/categories", { params: cleanParams });
      } catch (err1) {
        if (err1?.response?.status === 404 || err1?.response?.status === 405) {
          response = await apiClient.get("/menu/category", { params: cleanParams });
        } else {
          throw err1;
        }
      }
      if (response && (response.status === 200 || response.status === 201)) {
        return { status: true, response: response.data };
      }
      return { status: false, response: response?.data };
    } catch (error) {
      console.error("Failed to fetch categories", error);
      return { status: false, response: error?.response?.data || error };
    }
  }

  async createCategory(data) {
    try {
      const cleanData = sanitizePayload(data);
      let response;
      try {
        response = await apiClient.post("/menu/category", cleanData);
      } catch (err1) {
        if (err1?.response?.status === 404 || err1?.response?.status === 405) {
          response = await apiClient.post("/menu/categories", cleanData);
        } else {
          throw err1;
        }
      }
      if (response && (response.status === 200 || response.status === 201)) {
        return { status: true, response: response.data };
      }
      return { status: false, response: response?.data };
    } catch (error) {
      console.error("Failed to create category", error);
      return { status: false, response: error?.response?.data || error };
    }
  }

  async updateCategory(id, data) {
    try {
      const cleanData = sanitizePayload(data);
      let response;
      try {
        response = await apiClient.put(`/menu/category/${id}`, cleanData);
      } catch (err1) {
        if (err1?.response?.status === 404 || err1?.response?.status === 405) {
          response = await apiClient.put(`/menu/categories/${id}`, cleanData);
        } else {
          throw err1;
        }
      }
      if (response && (response.status === 200 || response.status === 201)) {
        return { status: true, response: response.data };
      }
      return { status: false, response: response?.data };
    } catch (error) {
      console.error("Failed to update category", error);
      return { status: false, response: error?.response?.data || error };
    }
  }

  async deleteCategory(id) {
    try {
      let response;
      try {
        response = await apiClient.delete(`/menu/category/${id}`);
      } catch (err1) {
        if (err1?.response?.status === 404 || err1?.response?.status === 405) {
          response = await apiClient.delete(`/menu/categories/${id}`);
        } else {
          throw err1;
        }
      }
      if (response && (response.status === 200 || response.status === 201)) {
        return { status: true, response: response.data };
      }
      return { status: false, response: response?.data };
    } catch (error) {
      console.error("Failed to delete category", error);
      return { status: false, response: error?.response?.data || error };
    }
  }

  async createMenuItem(data) {
    try {
      const cleanData = sanitizePayload(data);
      const response = await apiClient.post("/menu", cleanData);
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
      const cleanData = sanitizePayload(data);
      const response = await apiClient.put(`/menu/${id}`, cleanData);
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
