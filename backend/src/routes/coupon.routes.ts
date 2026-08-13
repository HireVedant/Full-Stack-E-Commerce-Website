import { Router } from "express";
import { CouponService } from "../services/coupon.service";
import { makeCouponControllers } from "../controllers/coupon.controller";
import { requireAuth } from "../middleware/auth.middleware";

export function createCouponRouter(svc: CouponService): Router {
  const router = Router();
  const ctrl = makeCouponControllers(svc);

  router.post("/validate", requireAuth, ctrl.validate);

  return router;
}
