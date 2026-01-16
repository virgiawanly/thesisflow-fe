import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { getAuth } from "./auth-helpers";

const getAppLanguage = () => {
  const language = localStorage.getItem("language");
  return ["en", "id"].includes(language || "") ? language : "en";
};

// Create axios instance with default configuration (public)
export const apiPublic: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Create axios instance with default configuration (authenticated)
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add authentication token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get auth data from localStorage
    const auth = getAuth();

    // Add authorization header if token exists
    if (auth?.access_token) {
      config.headers.Authorization = `Bearer ${auth.access_token}`;
    }

    // Add language header
    config.headers["X-Language"] = getAppLanguage();

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common scenarios
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Return successful response as is
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 400 Bad Request with "Bad Token" message
    if (error.response?.status === 400 || error.response?.status === 401) {
      const responseData = error.response.data as any;
      const errorMessage = responseData?.message || responseData?.error || "";

      if (
        errorMessage.toLowerCase().includes("bad token") ||
        errorMessage.toLowerCase().includes("unauthorized")
      ) {
        // Clear auth data and redirect to login
        localStorage.removeItem(
          `${import.meta.env.VITE_APP_NAME}-auth-v${
            import.meta.env.VITE_APP_VERSION || "1.0"
          }`
        );

        // Don't redirect if already on an auth endpoint
        const isAuthEndpoint = originalRequest.url?.includes("/auth/");
        if (!isAuthEndpoint) {
          window.location.href = "/auth/signin?error=auth_token_expired";
        }

        return Promise.reject(error);
      }
    }

    // Handle other common errors
    if (error.response?.status === 403) {
      console.error("Access forbidden:", error.response.data);
    } else if (error.response?.status === 404) {
      console.error("Resource not found:", error.response.data);
    } else if (error.response?.status && error.response.status >= 500) {
      console.error("Server error:", error.response.data);
    }

    return Promise.reject(error);
  }
);

// Export the configured axios instance
export default api;

// Export axios types for convenience
export type { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse };
