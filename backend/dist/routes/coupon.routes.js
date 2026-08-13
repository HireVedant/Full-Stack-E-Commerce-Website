"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCouponRouter = createCouponRouter;
const express_1 = require("express");
const coupon_controller_1 = require("../controllers/coupon.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
function createCouponRouter(svc) {
    const router = (0, express_1.Router)();
    const ctrl = (0, coupon_controller_1.makeCouponControllers)(svc);
    router.post("/validate", auth_middleware_1.requireAuth, ctrl.validate);
    return router;
}
//# sourceMappingURL=coupon.routes.js.map