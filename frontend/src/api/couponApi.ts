import { request } from "./productApi";

export const couponApi = {
  validate: (code: string) => request<any>("/api/coupons/validate", { method: "POST", body: JSON.stringify({ code }) }),
};
