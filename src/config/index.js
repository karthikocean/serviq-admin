import axios from "axios";

const APP_ENV = "local";

let IMAGE_BASE_URL = "";
let BASE_URL = "";
let server = "";

switch (APP_ENV) {
  case "dev":
    IMAGE_BASE_URL = "http://192.168.1.16:5000/public";
    BASE_URL = "http://192.168.1.16:5000/api/admin";
    server = "http://192.168.1.16:5000";
    break;

  case "production":
    IMAGE_BASE_URL = "https://api.serviq.tech/public";
    BASE_URL = "https://api.serviq.tech/api/admin";
    server = "https://api.serviq.tech";
    break;

  case "local":
  default:
    IMAGE_BASE_URL = "http://192.168.1.17:5000/public";
    BASE_URL = "http://192.168.1.17:5000/api/admin";
    server = "http://192.168.1.17:5000";
    break;
}

export { IMAGE_BASE_URL, BASE_URL, server };

export const apiClient = axios.create({
  baseURL: BASE_URL
});

apiClient.interceptors.request.use(
  function (config) {
    const token = localStorage.getItem("userToken") || localStorage.getItem("token") || sessionStorage.getItem("userToken") || sessionStorage.getItem("token");

    if (token && token !== "null" && token !== "undefined") {
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

export const isTokenExpired = (token) => {
  if (!token || typeof token !== 'string') return true;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (payload.exp) {
      return Date.now() >= payload.exp * 1000;
    }
  } catch (e) {
    return false;
  }
  return false;
};

apiClient.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      const errorMsg = String(error.response.data?.message || error.response.data?.error || '').toLowerCase();
      const isAuthIssue =
        errorMsg.includes('expired') ||
        errorMsg.includes('jwt') ||
        errorMsg.includes('unauthorized') ||
        errorMsg.includes('invalid token') ||
        errorMsg.includes('token missing') ||
        error.response.status === 401;

      const token = localStorage.getItem("userToken") || localStorage.getItem("token");

      if (token && isAuthIssue) {
        localStorage.removeItem("userToken");
        localStorage.removeItem("token");
        localStorage.removeItem("currentUser");
        try { sessionStorage.clear(); } catch (e) { }

        // Automatically redirect to login page when token is expired/invalid
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
