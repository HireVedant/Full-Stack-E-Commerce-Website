import { Router } from "express";
import { ReviewService } from "../services/review.service";
import { makeReviewControllers } from "../controllers/review.controller";
import { requireAuth } from "../middleware/auth.middleware";

export function createReviewRouter(svc: ReviewService): Router {
  const router = Router();
  const ctrl = makeReviewControllers(svc);

  router.get("/product/:productId", ctrl.getByProduct);
  router.post("/", requireAuth, ctrl.create);

  return router;
}
