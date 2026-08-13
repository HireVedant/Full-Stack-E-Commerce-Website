import { request } from "./productApi";

export const analyticsApi = {
  getStats: () => request<any>("/api/analytics"),
};
