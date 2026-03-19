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
  (error) => {
      const url = error.config?.url || "unknown";
      const fullUrl = error.config?.baseURL ? `${error.config.baseURL}/${url}` : url;
      const errorStatus = error.response?.status || "Network Error";
      
      if (typeof errorStatus === 'number' && errorStatus >= 400 && ![401, 403, 404].includes(errorStatus)) {
          console.error(`[AxiosError] ${errorStatus} - ${fullUrl}`, {
              url: error.config?.url,
              baseURL: error.config?.baseURL,
              method: error.config?.method,
              data: error.response?.data
          });
      }

      // 1. Check if it's a network error
      if (!error.response) {
          toast.error("Network Error", {
              description: "Unable to reach the server. Please check your internet connection.",
          });
          return Promise.reject(error);
      }

      const detail = error.response?.data?.detail || "An unexpected error occurred.";

      // 2. Handle specific status codes
      switch (errorStatus) {
          case 401:
              // Only toast if not on login page
              if (window.location.pathname !== '/auth/restaurant/signin') {
                toast.warning("Session Expired", { description: "Please sign in again to continue." });
              }
              break;
          case 404:
              // Completely silent for 404s
              break;
          case 500:
              toast.error("Server Error (500)", {
                  description: "Something went wrong on our end. Our team has been notified. Please try again later.",
              });
              break;
          case 403:
              toast.error("Permission Denied", {
                  description: "You don't have authorization to perform this action.",
              });
              break;
          default:
              // Generic error if it doesn't match above and is a 'bad' code
              if (typeof errorStatus === 'number' && errorStatus >= 400) {
                  toast.error(`Error ${errorStatus}`, { description: detail });
              }
      }

      return Promise.reject(error);
  }
);

axiosInstance.defaults.withCredentials = true;

export default axiosInstance;
