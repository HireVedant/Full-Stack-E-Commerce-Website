import { Router } from "express";
import { makeProductControllers } from "../controllers/product.controller";
import { ProductService } from "../services/product.service";
import type Database from "better-sqlite3";
import { requireAdmin } from "../middleware/auth.middleware";

export function makeProductRouter(db?: Database.Database): Router {
  const svc = new ProductService(db);
  const ctrl = makeProductControllers(svc);
  const router = Router();

  // Collection endpoints
  router.get("/", ctrl.listProducts);
  router.post("/", requireAdmin, ctrl.createProduct);
  router.get("/categories", ctrl.listCategories);

  // Single-resource endpoints
  router.get("/:id", ctrl.getProduct);
  router.put("/:id", requireAdmin, ctrl.updateProduct);
  router.delete("/:id", requireAdmin, ctrl.deleteProduct);
  router.get("/:id/stock", ctrl.getProductStock);

  return router;
}
