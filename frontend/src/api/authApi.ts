import type { ApiResponse, User } from "../types";

const API_BASE = "/api/auth";

export const authApi = {
  async register(data: any): Promise<ApiResponse<{ user: User; token: string }>> {
    const res = await fetch(`${API_BASE}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async login(data: any): Promise<ApiResponse<{ user: User; token: string }>> {
    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getProfile(token: string): Promise<ApiResponse<User>> {
    const res = await fetch(`${API_BASE}/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  }
};
