import apiClient from "../config/index.js";
import ShowNotifications from "../helper/ShowNotifications.js";

class QrCodeApi {
  async getQrCodes() {
    try {
      const response = await apiClient.get("/qr");
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to Fetch QR Codes. Please try again.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async generateQrCode() {
    try {
      const response = await apiClient.post("/qr");
      if (response.status === 200 || response.status === 201) {
        ShowNotifications.showAlertNotification(
          response.data.message || "QR Code Generated Successfully!",
          true
        );
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to Generate QR Code. Please try again.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async assignQrCode(qrCodeId, tableId) {
    try {
      const response = await apiClient.post("/qr/assign", { qrCodeId, tableId });
      if (response.status === 200 || response.status === 201) {
        ShowNotifications.showAlertNotification(
          response.data.message || "QR Code assigned to table successfully!",
          true
        );
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to Assign QR Code. Please try again.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async revokeQrCode(qrCodeId) {
    try {
      const response = await apiClient.post("/qr/revoke", { qrCodeId });
      if (response.status === 200 || response.status === 201) {
        ShowNotifications.showAlertNotification(
          response.data.message || "QR Code unlinked successfully!",
          true
        );
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to Unlink QR Code. Please try again.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async deleteQrCode(qrCodeId) {
    try {
      const response = await apiClient.delete(`/qr/${qrCodeId}`);
      if (response.status === 200 || response.status === 201) {
        ShowNotifications.showAlertNotification(
          response.data.message || "QR Code Deleted Successfully!",
          true
        );
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to Delete QR Code. Please try again.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }
}

export default new QrCodeApi();
