import apiClient from "../config/index.js";
import ShowNotifications from "../helper/ShowNotifications.js";

class UploadApi {
  async uploadImage(file) {
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await apiClient.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to upload image. Please try again.";
      ShowNotifications.showAlertNotification(errorMessage, false);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }
}

export default new UploadApi();
