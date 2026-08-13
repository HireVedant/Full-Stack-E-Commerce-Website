"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWishlistRouter = createWishlistRouter;
const express_1 = require("express");
const wishlist_controller_1 = require("../controllers/wishlist.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
function createWishlistRouter(svc) {
    const router = (0, express_1.Router)();
    const ctrl = (0, wishlist_controller_1.makeWishlistControllers)(svc);
    router.use(auth_middleware_1.requireAuth);
    router.get("/", ctrl.getWishlist);
    router.post("/", ctrl.add);
    router.delete("/:productId", ctrl.remove);
    return router;
}
//# sourceMappingURL=wishlist.routes.js.map