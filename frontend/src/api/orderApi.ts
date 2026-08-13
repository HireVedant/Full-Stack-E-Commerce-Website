import type { Order } from "../types";
import { request } from "./productApi";

const API_BASE = "/api/orders";

export const orderApi = {
  create: (data: any) => 
    request<Order>(API_BASE, { method: "POST", body: JSON.stringify(data) }),
  
  verifyPayment: (data: any) =>
    request<Order>(`${API_BASE}/verify-payment`, { method: "POST", body: JSON.stringify(data) }),
    
  getMyOrders: () => 
    request<Order[]>(API_BASE),
    
  getOrderById: (id: number) =>
    request<Order>(`${API_BASE}/${id}`),
    
  getAllOrders: () =>
    request<Order[]>(`${API_BASE}/admin`),
    
  updateOrderStatus: (id: number, status: string) =>
    request<Order>(`${API_BASE}/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) })
};
