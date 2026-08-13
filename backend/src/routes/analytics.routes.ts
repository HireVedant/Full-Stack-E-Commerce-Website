import { Router } from "express";
import { AnalyticsService } from "../services/analytics.service";
import { makeAnalyticsControllers } from "../controllers/analytics.controller";
import { requireAdmin } from "../middleware/auth.middleware";

export function createAnalyticsRouter(svc: AnalyticsService): Router {
  const router = Router();
  const ctrl = makeAnalyticsControllers(svc);

  router.get("/", requireAdmin, ctrl.getStats);

  return router;
}
