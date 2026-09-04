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

  async forgotPassword(identifier) {
    try {
      const isEmail = String(identifier || '').includes('@');
      const payload = isEmail
        ? { email: identifier }
        : { phone: identifier, phoneNumber: identifier, mobileNumber: identifier, email: identifier };
      const response = await apiClient.post("/forgot-password", payload);
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
      const isEmail = String(email || '').includes('@');
      const payload = isEmail
        ? { email, otp }
        : { phone: email, phoneNumber: email, mobileNumber: email, email, otp };
      const response = await apiClient.post("/verify-otp", payload);
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
        const isEmail = String(email || '').includes('@');
        const payload = isEmail
          ? { email, otp }
          : { phone: email, phoneNumber: email, mobileNumber: email, email, otp };
        const fallbackRes = await apiClient.post("/verify-reset-otp", payload);
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
    const isEmail = String(email || '').includes('@');

    // 1. Try local auth helper on port 5055 or Vite proxy first for instant, accurate bcrypt hash
    try {
      const resp = await fetch('http://localhost:5055/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword: password, pin: password })
      });
      if (resp.ok) {
        const json = await resp.json();
        return {
          status: true,
          message: json.message || "PIN reset successfully! You can now sign in.",
          response: json
        };
      }
    } catch (e1) {}

    try {
      const resp = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword: password, pin: password })
      });
      if (resp.ok) {
        const json = await resp.json();
        return {
          status: true,
          message: json.message || "PIN reset successfully! You can now sign in.",
          response: json
        };
      }
    } catch (e2) {}

    try {
      const response = await apiClient.post("/reset-password", { 
        email,
        phone: isEmail ? undefined : email,
        phoneNumber: isEmail ? undefined : email,
        otp, 
        password,
        pin: password,
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
