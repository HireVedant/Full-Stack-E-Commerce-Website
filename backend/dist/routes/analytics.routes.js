"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAnalyticsRouter = createAnalyticsRouter;
const express_1 = require("express");
const analytics_controller_1 = require("../controllers/analytics.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
function createAnalyticsRouter(svc) {
    const router = (0, express_1.Router)();
    const ctrl = (0, analytics_controller_1.makeAnalyticsControllers)(svc);
    router.get("/", auth_middleware_1.requireAdmin, ctrl.getStats);
    return router;
}
//# sourceMappingURL=analytics.routes.js.map