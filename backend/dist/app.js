"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const product_routes_1 = require("./routes/product.routes");
const auth_routes_1 = require("./routes/auth.routes");
const order_routes_1 = require("./routes/order.routes");
const wishlist_routes_1 = require("./routes/wishlist.routes");
const review_routes_1 = require("./routes/review.routes");
const coupon_routes_1 = require("./routes/coupon.routes");
const analytics_routes_1 = require("./routes/analytics.routes");
const wishlist_service_1 = require("./services/wishlist.service");
const review_service_1 = require("./services/review.service");
const coupon_service_1 = require("./services/coupon.service");
const analytics_service_1 = require("./services/analytics.service");
const error_middleware_1 = require("./middleware/error.middleware");
function createApp(db) {
    const app = (0, express_1.default)();
    // ─── Middleware ──────────────────────────────────────────────────────────
    app.use((0, cors_1.default)({
        origin: [
            "http://localhost:5173",
            "http://localhost:3000",
            "http://127.0.0.1:5173",
        ],
        credentials: true,
    }));
    app.use(express_1.default.json({ limit: "2mb" }));
    app.use(express_1.default.urlencoded({ extended: true }));
    // ─── Health check ────────────────────────────────────────────────────────
    app.get("/api/health", (_req, res) => {
        res.json({ status: "ok", timestamp: new Date().toISOString() });
    });
    // Services
    const wishlistService = new wishlist_service_1.WishlistService(db);
    const reviewService = new review_service_1.ReviewService(db);
    const couponService = new coupon_service_1.CouponService(db);
    const analyticsService = new analytics_service_1.AnalyticsService(db);
    // ─── Routes ──────────────────────────────────────────────────────────────
    app.use("/api/products", (0, product_routes_1.makeProductRouter)(db));
    app.use("/api/auth", (0, auth_routes_1.makeAuthRouter)(db));
    app.use("/api/orders", (0, order_routes_1.makeOrderRouter)(db));
    app.use("/api/wishlist", (0, wishlist_routes_1.createWishlistRouter)(wishlistService));
    app.use("/api/reviews", (0, review_routes_1.createReviewRouter)(reviewService));
    app.use("/api/coupons", (0, coupon_routes_1.createCouponRouter)(couponService));
    app.use("/api/analytics", (0, analytics_routes_1.createAnalyticsRouter)(analyticsService));
    // ─── Error handlers ──────────────────────────────────────────────────────
    app.use(error_middleware_1.notFoundHandler);
    app.use(error_middleware_1.errorHandler);
    return app;
}
//# sourceMappingURL=app.js.map