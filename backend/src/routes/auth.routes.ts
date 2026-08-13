import { Router } from "express";
import { makeAuthControllers } from "../controllers/auth.controller";
import { UserService } from "../services/user.service";
import { requireAuth } from "../middleware/auth.middleware";
import type Database from "better-sqlite3";

export function makeAuthRouter(db?: Database.Database): Router {
  const svc = new UserService(db);
  const ctrl = makeAuthControllers(svc);
  const router = Router();

  router.post("/register", ctrl.register);
  router.post("/login", ctrl.login);
  router.get("/profile", requireAuth, ctrl.getProfile);

  return router;
}
