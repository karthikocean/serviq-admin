import apiClient, { server } from "../config/index.js";
import ShowNotifications from "../helper/ShowNotifications.js";
import { cleanRelativeImagePath, getImageUrl } from "../helper/ImageHelper.js";

class UploadApi {
  async uploadImage(file, moduleName = "menu", type = "image") {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("moduleName", moduleName || "menu");
      formData.append("type", type || "image");
      formData.append("image", file);

      const response = await apiClient.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200 || response.status === 201) {
        const resData = response.data;
        const rawPath = resData?.data?.path || resData?.path || resData?.data?.url || resData?.url || "";
        const relativePath = cleanRelativeImagePath(rawPath);
        const fullUrl = getImageUrl(relativePath);

        return {
          status: true,
          response: resData,
          data: {
            fileName: resData?.data?.fileName || file?.name || "upload.png",
            path: relativePath,
            url: fullUrl,
            originalName: resData?.data?.originalName || file?.name || "upload.png",
            ...resData?.data,
            path: relativePath
          },
          url: fullUrl,
          path: relativePath
        };
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
