import { Router } from "express";
import { makeOrderControllers } from "../controllers/order.controller";
import { OrderService } from "../services/order.service";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware";
import type Database from "better-sqlite3";

export function makeOrderRouter(db?: Database.Database): Router {
  const svc = new OrderService(db);
  const ctrl = makeOrderControllers(svc);
  const router = Router();

  // Admin routes
  router.get("/admin", requireAdmin, ctrl.getAllOrders);
  router.put("/:id/status", requireAdmin, ctrl.updateOrderStatus);

  // User routes
  router.get("/", requireAuth, ctrl.getMyOrders);
  router.post("/", requireAuth, ctrl.createOrder);
  router.get("/:id", requireAuth, ctrl.getOrderById);
  
  router.post("/verify-payment", requireAuth, ctrl.verifyPayment);

  return router;
}
