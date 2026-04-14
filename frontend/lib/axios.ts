import axios from "axios";
import { bypassAuth } from "./flags";
import { toast } from "sonner";

type UiErrorHint = {
  match: string;
  title: string;
  description?: string;
};

const KNOWN_ERROR_UI_HINTS: UiErrorHint[] = [
  {
    match: "An account with this email already exists",
    title: "Account Already Exists",
  },
  {
    match: "Too many signup attempts",
    title: "Too Many Attempts",
  },
  {
    match: "Please enter a valid email address",
    title: "Invalid Email Address",
  },
  {
    match: "Password must be at least",
    title: "Password Too Short",
  },
  {
    match: "This email address could not be validated",
    title: "Email Could Not Be Verified",
  },
  {
    match: "We couldn't send a confirmation email right now",
    title: "Email Delivery Issue",
  },
  {
    match: "Signup failed. Please check your details and try again.",
    title: "Signup Failed",
  },
  {
    match: "Invalid email or password.",
    title: "Invalid Credentials",
  },
  {
    match: "Please verify your email before signing in.",
    title: "Email Not Verified",
  },
  {
    match: "Login failed. Please try again.",
    title: "Login Failed",
  },
];

const findUiErrorHint = (detail: string): UiErrorHint | undefined => {
  const lower = detail.toLowerCase();
  return KNOWN_ERROR_UI_HINTS.find((hint) => lower.includes(hint.match.toLowerCase()));
};

/** Read a cookie value by name from document.cookie (client-side only). */
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(?:^|;\\s*)" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : null;
}

const axiosInstance = axios.create({
  baseURL: "/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(async (config) => {
  if (process.env.NODE_ENV === "production" && bypassAuth) {
    throw new Error(
      "bypassAuth must be disabled in production (axios client). Check NEXT_PUBLIC_BYPASS_AUTH."
    );
  }

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

  // Double-submit cookie CSRF: read the cookie the backend set on /auth/me
  // and echo it as a header for every state-changing request.
  const method = (config.method ?? "get").toLowerCase();
  if (method !== "get" && method !== "head" && method !== "options") {
    const csrfToken = getCookie("csrf_token");
    if (csrfToken) {
      config.headers["X-CSRF-Token"] = csrfToken;
    }
  }

  // Brand scoping: attach the active brand from sessionStorage so the backend
  // can scope inventory / stats queries to the correct brand.
  if (typeof sessionStorage !== "undefined") {
    const activeBrandId = sessionStorage.getItem("active_brand_id");
    if (activeBrandId) {
      config.headers["X-Brand-ID"] = activeBrandId;
    }
  }

  return config;
});

// GLOBAL ERROR MANAGEMENT
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const url = error.config?.url || "unknown";
    const fullUrl = error.config?.baseURL
      ? `${error.config.baseURL.replace(/\/$/, "")}/${url.replace(/^\//, "")}`
      : url;
    const errorStatus = error.response?.status || "Network Error";

    // 1a. Handle gateway errors (502/503/504) — Render worker busy, retry after short wait
    const isGatewayError = error.response?.status === 502 || error.response?.status === 503 || error.response?.status === 504;
    if (isGatewayError) {
      if (!error.config._retry) {
        error.config._retry = true;
        toast.info("Server is busy...", {
          description: "One moment — retrying your request...",
        });
        await new Promise((resolve) => setTimeout(resolve, 3000));
        try {
          return await axiosInstance(error.config);
        } catch {
          // Retry failed — fall through to toast
        }
      }
      toast.error("Server Unavailable", {
        description: "The server is temporarily unavailable. Please try again in a moment.",
      });
      return Promise.reject(error);
    }

    // 1b. Handle network errors (e.g. Render cold start / ECONNRESET)
    if (!error.response) {
      // Retry once after 5s — cold starts on Render free tier take ~10-15s
      if (!error.config._retry) {
        error.config._retry = true;
        toast.info("Waking up server...", {
          description: "Our backend is booting up. This will take about 10-15 seconds...",
        });
        await new Promise((resolve) => setTimeout(resolve, 5000));
        try {
          return await axiosInstance(error.config);
        } catch {
          // Retry failed — fall through to toast
        }
      }
      toast.error("Connection Error", {
        description: "Unable to reach the server. Please check your internet or try again later.",
      });
      return Promise.reject(error);
    }

    // 2. Log unexpected errors (skip 401, 403, 404, 500, 502, 503, 504 — gateway errors are retried above)
    // Note: We skip 500 here because we handle it via toast and want to avoid noisy console logs
    // when the database is disconnected during development.
    if (typeof errorStatus === "number" && errorStatus >= 400 && ![401, 403, 404, 500, 502, 503, 504].includes(errorStatus)) {
      console.error(`[AxiosError] ${errorStatus} - ${fullUrl}`, {
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        method: error.config?.method,
      });
    }

    if (errorStatus === 500) {
      console.warn(`[Backend Connection Issue] 500 - ${fullUrl}: Database might be unreachable.`);
    }

    const detail = error.response?.data?.detail || "An unexpected error occurred.";
    const getFriendlyErrorMessage = (msg: string) => {
      if (msg.includes("Unable to match input value") || msg.includes("metadata") || msg.includes("Prisma")) {
        return "We encountered a data format issue. Please check your inputs and try again.";
      }
      if (msg.includes("Organization not found")) {
        return "Your organization profile could not be found. Please contact support.";
      }
      return msg;
    };

    const friendlyDetail = getFriendlyErrorMessage(detail);

    // Detect auth login endpoint to avoid treating credential errors
    // as session expiry (we want the caller to handle these)
    const isAuthLoginRequest = url.endsWith("/auth/login") || url === "auth/login";

    // 3. Handle 401 — attempt token refresh then retry
    if (errorStatus === 401 && !error.config._retry) {
      // For direct login calls, skip global 401 handling so the
      // signin pages can show their own error / failed screen.
      if (isAuthLoginRequest) {
        return Promise.reject(error);
      }

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
        if (typeof window !== "undefined") {
          const currentPath = window.location.pathname;
          const redirectPath = currentPath.includes("/supplier")
            ? "/auth/supplier/signin"
            : "/auth/restaurant/signin";

          if (currentPath !== redirectPath) {
          toast.warning("Session Expired", { description: "Please sign in again to continue." });
          setTimeout(() => {
              window.location.href = redirectPath;
          }, 1500);
          }
        }
      }
      return Promise.reject(error);
    }

    // 4. Handle specific status codes
    switch (errorStatus) {
      case 401:
        if (!isAuthLoginRequest && typeof window !== "undefined") {
          const currentPath = window.location.pathname;
          const redirectPath = currentPath.includes("/supplier")
            ? "/auth/supplier/signin"
            : "/auth/restaurant/signin";

          if (currentPath !== redirectPath) {
            toast.warning("Session Expired", { description: "Please sign in again to continue." });
          }
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
        if (detail.toLowerCase().includes("csrf")) {
          toast.error("Session Security Error", {
            description: "Security token mismatch. Please reload the page and try again.",
          });
        } else {
          toast.error("Permission Denied", {
            description: "You don't have authorization to perform this action.",
          });
        }
        break;
      default:
        if (typeof errorStatus === "number" && errorStatus >= 400) {
          const hint = findUiErrorHint(friendlyDetail);
          if (hint) {
            toast.error(hint.title, { description: hint.description ?? friendlyDetail });
          } else {
            toast.error(`Error ${errorStatus}`, { description: friendlyDetail });
          }
        }
    }

    return Promise.reject(error);
  }
);

axiosInstance.defaults.withCredentials = true;

export default axiosInstance;