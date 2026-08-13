"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReviewRouter = createReviewRouter;
const express_1 = require("express");
const review_controller_1 = require("../controllers/review.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
function createReviewRouter(svc) {
    const router = (0, express_1.Router)();
    const ctrl = (0, review_controller_1.makeReviewControllers)(svc);
    router.get("/product/:productId", ctrl.getByProduct);
    router.post("/", auth_middleware_1.requireAuth, ctrl.create);
    return router;
}
//# sourceMappingURL=review.routes.js.map