import { Request, Response } from "express";
import { AnalyticsService } from "../services/analytics.service";

export function makeAnalyticsControllers(svc: AnalyticsService) {
  function getStats(req: Request, res: Response): void {
    try {
      const stats = svc.getDashboardStats();
      res.json({ success: true, data: stats });
    } catch {
      res.status(500).json({ success: false, message: "Failed to load analytics" });
    }
  }

  return { getStats };
}
