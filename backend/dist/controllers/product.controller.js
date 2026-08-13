"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeProductControllers = makeProductControllers;
const zod_1 = require("zod");
const product_model_1 = require("../models/product.model");
// ─── Helpers ─────────────────────────────────────────────────────────────────
function parseId(param) {
    const id = parseInt(param, 10);
    return isNaN(id) || id < 1 ? null : id;
}
function formatZodError(err) {
    const errors = {};
    for (const issue of err.issues) {
        const key = issue.path.join(".") || "root";
        if (!errors[key])
            errors[key] = [];
        errors[key].push(issue.message);
    }
    return errors;
}
// ─── Factory — returns controller functions bound to an injected service ──────
function makeProductControllers(svc) {
    /** GET /api/products */
    function listProducts(req, res) {
        try {
            const query = product_model_1.ProductQuerySchema.parse(req.query);
            const result = svc.list(query);
            res.json({ success: true, data: result });
        }
        catch (err) {
            if (err instanceof zod_1.ZodError) {
                res.status(400).json({ success: false, errors: formatZodError(err) });
            }
            else {
                res
                    .status(500)
                    .json({ success: false, message: "Failed to fetch products" });
            }
        }
    }
    /** GET /api/products/categories */
    function listCategories(_req, res) {
        try {
            const categories = svc.getCategories();
            res.json({ success: true, data: categories });
        }
        catch {
            res
                .status(500)
                .json({ success: false, message: "Failed to fetch categories" });
        }
    }
    /** GET /api/products/:id */
    function getProduct(req, res) {
        const id = parseId(req.params.id);
        if (id === null) {
            res.status(400).json({ success: false, message: "Invalid product ID" });
            return;
        }
        try {
            const product = svc.getById(id);
            if (!product) {
                res.status(404).json({ success: false, message: "Product not found" });
                return;
            }
            res.json({ success: true, data: product });
        }
        catch {
            res
                .status(500)
                .json({ success: false, message: "Failed to fetch product" });
        }
    }
    /** POST /api/products */
    function createProduct(req, res) {
        try {
            const input = product_model_1.CreateProductSchema.parse(req.body);
            const product = svc.create(input);
            res.status(201).json({ success: true, data: product });
        }
        catch (err) {
            if (err instanceof zod_1.ZodError) {
                res.status(400).json({ success: false, errors: formatZodError(err) });
            }
            else {
                res
                    .status(500)
                    .json({ success: false, message: "Failed to create product" });
            }
        }
    }
    /** PUT /api/products/:id */
    function updateProduct(req, res) {
        const id = parseId(req.params.id);
        if (id === null) {
            res.status(400).json({ success: false, message: "Invalid product ID" });
            return;
        }
        try {
            const input = product_model_1.UpdateProductSchema.parse(req.body);
            const product = svc.update(id, input);
            if (!product) {
                res.status(404).json({ success: false, message: "Product not found" });
                return;
            }
            res.json({ success: true, data: product });
        }
        catch (err) {
            if (err instanceof zod_1.ZodError) {
                res.status(400).json({ success: false, errors: formatZodError(err) });
            }
            else {
                res
                    .status(500)
                    .json({ success: false, message: "Failed to update product" });
            }
        }
    }
    /** DELETE /api/products/:id */
    function deleteProduct(req, res) {
        const id = parseId(req.params.id);
        if (id === null) {
            res.status(400).json({ success: false, message: "Invalid product ID" });
            return;
        }
        try {
            const deleted = svc.delete(id);
            if (!deleted) {
                res.status(404).json({ success: false, message: "Product not found" });
                return;
            }
            res.json({ success: true, message: "Product deleted successfully" });
        }
        catch {
            res
                .status(500)
                .json({ success: false, message: "Failed to delete product" });
        }
    }
    /** GET /api/products/:id/stock */
    function getProductStock(req, res) {
        const id = parseId(req.params.id);
        if (id === null) {
            res.status(400).json({ success: false, message: "Invalid product ID" });
            return;
        }
        try {
            const stock = svc.getStock(id);
            if (stock === null) {
                res.status(404).json({ success: false, message: "Product not found" });
                return;
            }
            res.json({ success: true, data: { stock } });
        }
        catch {
            res
                .status(500)
                .json({ success: false, message: "Failed to fetch stock" });
        }
    }
    return {
        listProducts,
        listCategories,
        getProduct,
        createProduct,
        updateProduct,
        deleteProduct,
        getProductStock,
    };
}
//# sourceMappingURL=product.controller.js.map