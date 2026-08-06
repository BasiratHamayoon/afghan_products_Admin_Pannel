import axios from "axios";

const getToken = () => {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("jwt") ||
    null
  );
};

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "/api",
  timeout: 30000,
});

axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    } else {
      if (!config.headers["Content-Type"]) {
        config.headers["Content-Type"] = "application/json";
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      if (typeof window !== "undefined") {
        const isLoginPage = window.location.pathname === "/login";
        const isAuthRequest = error?.config?.url?.includes("/auth/");

        if (!isLoginPage && !isAuthRequest) {
          localStorage.removeItem("token");
          localStorage.removeItem("authToken");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("jwt");
          window.location.href = "/login";
          return new Promise(() => {});
        }
      }
    }

    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      "Something went wrong";

    return Promise.reject({ message, status });
  }
);

export default axiosInstance;