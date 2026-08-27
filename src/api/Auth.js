import apiClient from "../config/index.js";
import ShowNotifications from "../helper/ShowNotifications.js";

class AuthApi {
  async login(email, password) {
    try {
      const response = await apiClient.post("/login", { email, password });
      if (response.status === 200 || response.status === 201) {
        const isSuccess = response.data?.success !== false;
        return { 
          status: isSuccess, 
          message: response.data?.message,
          response: response.data 
        };
      }
      return { 
        status: false, 
        message: response.data?.message,
        response: response.data 
      };
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.message ||
        error?.message ||
        "";
      return {
        status: false,
        message: errorMessage,
        response: error?.response?.data || error,
      };
    }
  }
}

export default new AuthApi();
