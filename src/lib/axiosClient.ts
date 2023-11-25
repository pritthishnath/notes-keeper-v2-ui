import axios from "axios";

export const apiBaseUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3101"
    : "https://gateway.pnath.in";

export const axiosClient = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});

// createAuthRefreshInterceptor(axiosClient, () =>
//   refresh().then((data) => {
//     if (!data.error) {
//       return Promise.resolve();
//     } else {
//       return Promise.reject();
//     }
//   })
// );

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalReq = error.config;

    if (error?.response?.status === 401) {
      const data = await refresh();

      if (data.error) return Promise.reject(error);

      return axiosClient(originalReq);
    }
    throw error;
  }
);

async function refresh() {
  const res = await axiosClient.post("/auth/refresh");

  return res.data;
}
