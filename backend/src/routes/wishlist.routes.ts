import { Router } from "express";
import { WishlistService } from "../services/wishlist.service";
import { makeWishlistControllers } from "../controllers/wishlist.controller";
import { requireAuth } from "../middleware/auth.middleware";

export function createWishlistRouter(svc: WishlistService): Router {
  const router = Router();
  const ctrl = makeWishlistControllers(svc);

  router.use(requireAuth);
  
  router.get("/", ctrl.getWishlist);
  router.post("/", ctrl.add);
  router.delete("/:productId", ctrl.remove);

  return router;
}
