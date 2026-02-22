import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(async (config) => {
  if (require('./flags').bypassAuth) {
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
