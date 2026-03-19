import axios from "axios";
import { bypassAuth } from "./flags";
import { toast } from "sonner";

const axiosInstance = axios.create({
  baseURL: "/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(async (config) => {
  if (bypassAuth) {
    const devToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4ifQ.devtokenjules";
    config.headers.Authorization = `Bearer ${devToken}`;
    return config;
  }

  const { createClient } = await import("./supabase/client");
  const supabase = createClient();
  if (!supabase) return config;

  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// GLOBAL ERROR MANAGEMENT
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const url = error.config?.url || "unknown";
    const fullUrl = error.config?.baseURL ? `${error.config.baseURL}/${url}` : url;
    const errorStatus = error.response?.status || "Network Error";

    // 1. Handle network errors (e.g. Render cold start / ECONNRESET)
    if (!error.response) {
      // Retry once after 3s to handle cold starts
      if (!error.config._retry) {
        error.config._retry = true;
        await new Promise((resolve) => setTimeout(resolve, 3000));
        try {
          return await axiosInstance(error.config);
        } catch {
          // Retry failed — fall through to toast
        }
      }
      toast.error("Connection Error", {
        description: "Unable to reach the server. Please try again in a moment.",
      });
      return Promise.reject(error);
    }

    // 2. Log unexpected errors (skip 401, 403, 404)
    if (typeof errorStatus === "number" && errorStatus >= 400 && ![401, 403, 404].includes(errorStatus)) {
      console.error(`[AxiosError] ${errorStatus} - ${fullUrl}`, {
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        method: error.config?.method,
        data: error.response?.data,
      });
    }

    const detail = error.response?.data?.detail || "An unexpected error occurred.";

    // 3. Handle 401 — attempt token refresh then retry
    if (errorStatus === 401 && !error.config._retry) {
      error.config._retry = true;
      try {
        const { createClient } = await import("./supabase/client");
        const supabase = createClient();
        if (!supabase) throw new Error("No supabase client");

        const { data, error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError || !data.session) throw refreshError;

        // Update header with new token and retry
        error.config.headers.Authorization = `Bearer ${data.session.access_token}`;
        return axiosInstance(error.config);
      } catch {
        // Refresh failed — redirect to login
        if (typeof window !== "undefined" && window.location.pathname !== "/auth/restaurant/signin") {
          toast.warning("Session Expired", { description: "Please sign in again to continue." });
          setTimeout(() => {
            window.location.href = "/auth/restaurant/signin";
          }, 1500);
        }
      }
      return Promise.reject(error);
    }

    // 4. Handle specific status codes
    switch (errorStatus) {
      case 401:
        if (typeof window !== "undefined" && window.location.pathname !== "/auth/restaurant/signin") {
          toast.warning("Session Expired", { description: "Please sign in again to continue." });
        }
        break;
      case 404:
        // Silent — expected for unauthenticated state checks
        break;
      case 500:
        toast.error("Server Error", {
          description: "Something went wrong on our end. Please try again later.",
        });
        break;
      case 403:
        toast.error("Permission Denied", {
          description: "You don't have authorization to perform this action.",
        });
        break;
      default:
        if (typeof errorStatus === "number" && errorStatus >= 400) {
          toast.error(`Error ${errorStatus}`, { description: detail });
        }
    }

    return Promise.reject(error);
  }
);

axiosInstance.defaults.withCredentials = true;

export default axiosInstance;