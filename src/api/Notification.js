import apiClient from "../config/index.js";
import ShowNotifications from "../helper/ShowNotifications.js";

class NotificationApi {
  async getNotifications(params = {}) {
    try {
      const cleanParams = {};
      Object.keys(params).forEach((key) => {
        if (
          params[key] !== undefined &&
          params[key] !== null &&
          params[key] !== "" &&
          params[key] !== "ALL" &&
          params[key] !== "all"
        ) {
          cleanParams[key] = params[key];
        }
      });

      const response = await apiClient.get("/notifications", {
        params: cleanParams,
      });

      if (response.status === 200 || response.status === 201) {
        return {
          status: true,
          response: response.data,
          data: response.data?.data || response.data,
        };
      }
      return { status: false, response: response.data };
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch notifications.";
      // Don't show alert toast for standard polling or silent fetching unless needed
      console.warn("NotificationApi getNotifications error:", errorMessage);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async markAsRead(id) {
    try {
      const response = await apiClient.put(`/notifications/${id}/read`);
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      console.warn("NotificationApi markAsRead error:", error);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async markAllAsRead(params = {}) {
    try {
      const response = await apiClient.put("/notifications/mark-all-read", {}, {
        params,
      });
      if (response.status === 200 || response.status === 201) {
        return { status: true, response: response.data };
      }
    } catch (error) {
      console.warn("NotificationApi markAllAsRead error:", error);
      return {
        status: false,
        response: error?.response?.data || error,
      };
    }
  }

  async clearNotifications(params = {}) {
    try {
      const cleanParams = {};
      Object.keys(params).forEach((key) => {
        if (
          params[key] !== undefined &&
          params[key] !== null &&
          params[key] !== "" &&
          params[key] !== "ALL" &&
          params[key] !== "all"
        ) {
          cleanParams[key] = params[key];
        }
      });

      let response;
      try {
        response = await apiClient.delete("/notifications/clear", {
          params: cleanParams,
          data: cleanParams,
        });
      } catch (err) {
        if (err?.response?.status === 404 || err?.response?.status === 405) {
          try {
            response = await apiClient.post("/notifications/clear", cleanParams, {
              params: cleanParams,
            });
          } catch (postErr) {
            if (postErr?.response?.status === 404 || postErr?.response?.status === 405) {
              response = await apiClient.put("/notifications/clear", cleanParams, {
                params: cleanParams,
              });
            } else {
              throw postErr;
            }
          }
        } else {
          throw err;
        }
      }

      if (response && (response.status === 200 || response.status === 201)) {
        return {
          status: true,
          response: response.data,
          message: response.data?.message || "All active notifications cleared successfully.",
          data: response.data?.data,
        };
      }
      return { status: false, response: response?.data };
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to clear notifications.";
      console.warn("NotificationApi clearNotifications error:", errorMessage);
      return {
        status: false,
        response: error?.response?.data || error,
        message: errorMessage,
      };
    }
  }
}

export const isDummyNotification = (item) => {
  if (!item) return true;
  const title = (typeof item.title === 'string' ? item.title : '').trim().toLowerCase();
  const message = (typeof item.message === 'string' ? item.message : '').trim().toLowerCase();

  // Explicit test / dummy tokens
  const dummyTokens = [
    'tyuytt',
    'tertrffdfjktiththjnvfdfhgn',
    'haha',
    'aaaa',
    'bbbb',
    'cccc',
    'test',
    'testing',
    'dummy',
    'sample',
    'asdf',
    'qwerty',
    'zxcv',
    'fake',
    'mock',
    'foobar'
  ];

  if (dummyTokens.some((tok) => title === tok || message === tok)) return true;
  if (dummyTokens.some((tok) => title.includes(tok) && title.length < 15)) return true;
  if (title === 'new' && (message.includes('test') || message.includes('new feature updated') || message === 'new feature updated')) return true;
  if (title === 'new' && message.length < 25) return true;

  // Check for keyboard-smash / high-entropy consonant clusters (e.g. "tertrffdfjktiththjnvfdfhgn")
  const consonantClusterRegex = /[bcdfghjklmnpqrstvwxyz]{6,}/i;
  if (consonantClusterRegex.test(title) || consonantClusterRegex.test(message)) return true;

  // Check for repeated character sequences (e.g. "aaaa", "zzzz")
  const repeatedCharRegex = /(.)\1{3,}/;
  if (repeatedCharRegex.test(title) || repeatedCharRegex.test(message)) return true;

  return false;
};

export const notificationApi = new NotificationApi();
export default NotificationApi;
