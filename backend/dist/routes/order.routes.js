"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeOrderRouter = makeOrderRouter;
const express_1 = require("express");
const order_controller_1 = require("../controllers/order.controller");
const order_service_1 = require("../services/order.service");
const auth_middleware_1 = require("../middleware/auth.middleware");
function makeOrderRouter(db) {
    const svc = new order_service_1.OrderService(db);
    const ctrl = (0, order_controller_1.makeOrderControllers)(svc);
    const router = (0, express_1.Router)();
    // Admin routes
    router.get("/admin", auth_middleware_1.requireAdmin, ctrl.getAllOrders);
    router.put("/:id/status", auth_middleware_1.requireAdmin, ctrl.updateOrderStatus);
    // User routes
    router.get("/", auth_middleware_1.requireAuth, ctrl.getMyOrders);
    router.post("/", auth_middleware_1.requireAuth, ctrl.createOrder);
    router.get("/:id", auth_middleware_1.requireAuth, ctrl.getOrderById);
    router.post("/verify-payment", auth_middleware_1.requireAuth, ctrl.verifyPayment);
    return router;
}
//# sourceMappingURL=order.routes.js.map