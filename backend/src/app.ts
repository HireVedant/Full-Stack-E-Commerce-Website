import express from "express";
import cors from "cors";
import { makeProductRouter } from "./routes/product.routes";
import { makeAuthRouter } from "./routes/auth.routes";
import { makeOrderRouter } from "./routes/order.routes";
import { createWishlistRouter } from "./routes/wishlist.routes";
import { createReviewRouter } from "./routes/review.routes";
import { createCouponRouter } from "./routes/coupon.routes";
import { createAnalyticsRouter } from "./routes/analytics.routes";
import { WishlistService } from "./services/wishlist.service";
import { ReviewService } from "./services/review.service";
import { CouponService } from "./services/coupon.service";
import { AnalyticsService } from "./services/analytics.service";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";
import type Database from "better-sqlite3";

export function createApp(db?: Database.Database) {
  const app = express();

  // ─── Middleware ──────────────────────────────────────────────────────────
  app.use(
    cors({
      origin: [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
      ],
      credentials: true,
    })
  );
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));

  // ─── Health check ────────────────────────────────────────────────────────
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Services
  const wishlistService = new WishlistService(db);
  const reviewService = new ReviewService(db);
  const couponService = new CouponService(db);
  const analyticsService = new AnalyticsService(db);

  // ─── Routes ──────────────────────────────────────────────────────────────
  app.use("/api/products", makeProductRouter(db));
  app.use("/api/auth", makeAuthRouter(db));
  app.use("/api/orders", makeOrderRouter(db));
  app.use("/api/wishlist", createWishlistRouter(wishlistService));
  app.use("/api/reviews", createReviewRouter(reviewService));
  app.use("/api/coupons", createCouponRouter(couponService));
  app.use("/api/analytics", createAnalyticsRouter(analyticsService));

  // ─── Error handlers ──────────────────────────────────────────────────────
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
