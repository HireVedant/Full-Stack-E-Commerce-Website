"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeAuthRouter = makeAuthRouter;
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const user_service_1 = require("../services/user.service");
const auth_middleware_1 = require("../middleware/auth.middleware");
function makeAuthRouter(db) {
    const svc = new user_service_1.UserService(db);
    const ctrl = (0, auth_controller_1.makeAuthControllers)(svc);
    const router = (0, express_1.Router)();
    router.post("/register", ctrl.register);
    router.post("/login", ctrl.login);
    router.get("/profile", auth_middleware_1.requireAuth, ctrl.getProfile);
    return router;
}
//# sourceMappingURL=auth.routes.js.map