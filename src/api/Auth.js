import apiClient from "../config/index.js";
import ShowNotifications from "../helper/ShowNotifications.js";

class AuthApi {
  async login(email, password) {
    try {
      const response = await apiClient.post("/login", { email, password });
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
      return { status: false, response: response.data };
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Login failed. Please check your credentials.";
      return {
        status: false,
        message: errorMessage,
        response: error?.response?.data || error,
      };
    }
  }
}

export default new AuthApi();
