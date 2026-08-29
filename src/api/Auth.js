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

  async forgotPassword(email) {
    try {
      const response = await apiClient.post("/forgot-password", { email });
      if (response.status === 200 || response.status === 201) {
        const isSuccess = response.data?.success !== false;
        const msg = response.data?.data?.message || response.data?.message || "OTP generated successfully.";
        return {
          status: isSuccess,
          message: msg,
          data: response.data?.data,
          otp: response.data?.data?.otp,
          response: response.data
        };
      }
      return {
        status: false,
        message: response.data?.message || "Failed to send reset code.",
        response: response.data
      };
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.data?.message ||
        error?.response?.message ||
        error?.message ||
        "Failed to send reset code. Please try again.";
      return {
        status: false,
        message: errorMessage,
        response: error?.response?.data || error
      };
    }
  }

  async verifyOtp({ email, otp }) {
    try {
      const response = await apiClient.post("/verify-otp", { email, otp });
      if (response.status === 200 || response.status === 201) {
        const isSuccess = response.data?.success !== false;
        return {
          status: isSuccess,
          message: response.data?.message || "OTP verified successfully.",
          data: response.data?.data,
          response: response.data
        };
      }
      return {
        status: false,
        message: response.data?.message || "Invalid verification code.",
        response: response.data
      };
    } catch (error) {
      // In case the backend has /verify-reset-otp endpoint
      try {
        const fallbackRes = await apiClient.post("/verify-reset-otp", { email, otp });
        if (fallbackRes.status === 200 || fallbackRes.status === 201) {
          return {
            status: fallbackRes.data?.success !== false,
            message: fallbackRes.data?.message || "OTP verified successfully.",
            data: fallbackRes.data?.data,
            response: fallbackRes.data
          };
        }
      } catch (e2) {
        // Fallback failed
      }
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.data?.message ||
        error?.response?.message ||
        error?.message ||
        "Invalid verification code.";
      return {
        status: false,
        message: errorMessage,
        response: error?.response?.data || error
      };
    }
  }

  async resetPassword({ email, otp, password }) {
    try {
      const response = await apiClient.post("/reset-password", { 
        email, 
        otp, 
        password,
        newPassword: password,
        confirmPassword: password 
      });
      if (response.status === 200 || response.status === 201) {
        const isSuccess = response.data?.success !== false;
        return {
          status: isSuccess,
          message: response.data?.message || "Password reset successfully!",
          response: response.data
        };
      }
      return {
        status: false,
        message: response.data?.message || "Failed to reset password.",
        response: response.data
      };
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.message ||
        error?.message ||
        "Failed to reset password. Please try again.";
      return {
        status: false,
        message: errorMessage,
        response: error?.response?.data || error
      };
    }
  }
}

export default new AuthApi();
