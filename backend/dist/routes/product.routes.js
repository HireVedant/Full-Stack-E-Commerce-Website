"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeProductRouter = makeProductRouter;
const express_1 = require("express");
const product_controller_1 = require("../controllers/product.controller");
const product_service_1 = require("../services/product.service");
const auth_middleware_1 = require("../middleware/auth.middleware");
function makeProductRouter(db) {
    const svc = new product_service_1.ProductService(db);
    const ctrl = (0, product_controller_1.makeProductControllers)(svc);
    const router = (0, express_1.Router)();
    // Collection endpoints
    router.get("/", ctrl.listProducts);
    router.post("/", auth_middleware_1.requireAdmin, ctrl.createProduct);
    router.get("/categories", ctrl.listCategories);
    // Single-resource endpoints
    router.get("/:id", ctrl.getProduct);
    router.put("/:id", auth_middleware_1.requireAdmin, ctrl.updateProduct);
    router.delete("/:id", auth_middleware_1.requireAdmin, ctrl.deleteProduct);
    router.get("/:id/stock", ctrl.getProductStock);
    return router;
}
//# sourceMappingURL=product.routes.js.map