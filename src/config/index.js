import axios from "axios";

const APP_ENV = "local";

let IMAGE_BASE_URL = "";
let BASE_URL = "";
let server = "";

switch (APP_ENV) {
  case "dev":
    IMAGE_BASE_URL = "http://192.168.1.24:5000/public";
    BASE_URL = "http://192.168.1.24:5000/api/admin";
    server = "http://192.168.1.24:5000";
    break;

  case "production":
    IMAGE_BASE_URL = "https://api.serviq.tech/public";
    BASE_URL = "https://api.serviq.tech/api/admin";
    server = "https://api.serviq.tech";
    break;

  case "local":
  default:
    IMAGE_BASE_URL = "http://192.168.1.19:5000/public";
    BASE_URL = "http://192.168.1.19:5000/api/admin";
    server = "http://192.168.1.19:5000";
    break;
}

export { IMAGE_BASE_URL, BASE_URL, server };

export const apiClient = axios.create({
  baseURL: BASE_URL,
});

apiClient.interceptors.request.use(
  function (config) {
    const token = localStorage.getItem("userToken") || localStorage.getItem("token");

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      config.headers["Content-Type"] = "multipart/form-data";
    } else {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    // Only redirect if explicitly unauthorized on critical authentication routes,
    // avoiding session disruption during frontend operations
    if (
      error.response?.status === 401 &&
      !error.config?.url?.includes("/login") &&
      !window.location.pathname.includes("/login")
    ) {
      const isLocalUser = localStorage.getItem("serviq_user");
      const hasToken = localStorage.getItem("userToken") || localStorage.getItem("token");
      if (!isLocalUser && !hasToken) {
        localStorage.removeItem("userToken");
        localStorage.removeItem("token");
        localStorage.removeItem("serviq_user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
