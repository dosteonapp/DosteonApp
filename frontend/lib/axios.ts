import axios from "axios";
import { bypassAuth } from "./flags";

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

axiosInstance.defaults.withCredentials = true;

export default axiosInstance;
