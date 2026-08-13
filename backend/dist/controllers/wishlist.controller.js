"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeWishlistControllers = makeWishlistControllers;
const zod_1 = require("zod");
const wishlist_model_1 = require("../models/wishlist.model");
function makeWishlistControllers(svc) {
    function getWishlist(req, res) {
        if (!req.user) {
            res.status(401).json({ success: false, message: "Unauthorized" });
            return;
        }
        try {
            const items = svc.getUserWishlist(req.user.id);
            res.json({ success: true, data: items });
        }
        catch {
            res.status(500).json({ success: false, message: "Failed to fetch wishlist" });
        }
    }
    function add(req, res) {
        if (!req.user) {
            res.status(401).json({ success: false, message: "Unauthorized" });
            return;
        }
        try {
            const input = wishlist_model_1.AddToWishlistSchema.parse(req.body);
            const item = svc.add(req.user.id, input.productId);
            res.status(201).json({ success: true, data: item });
        }
        catch (err) {
            if (err instanceof zod_1.ZodError) {
                res.status(400).json({ success: false, message: "Invalid input" });
            }
            else if (err instanceof Error) {
                res.status(400).json({ success: false, message: err.message });
            }
            else {
                res.status(500).json({ success: false, message: "Failed to add to wishlist" });
            }
        }
    }
    function remove(req, res) {
        if (!req.user) {
            res.status(401).json({ success: false, message: "Unauthorized" });
            return;
        }
        const productId = parseInt(req.params.productId, 10);
        if (isNaN(productId)) {
            res.status(400).json({ success: false, message: "Invalid product ID" });
            return;
        }
        try {
            svc.remove(req.user.id, productId);
            res.json({ success: true, message: "Removed from wishlist" });
        }
        catch {
            res.status(500).json({ success: false, message: "Failed to remove from wishlist" });
        }
    }
    return { getWishlist, add, remove };
}
//# sourceMappingURL=wishlist.controller.js.map