"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeCouponControllers = makeCouponControllers;
const zod_1 = require("zod");
const coupon_model_1 = require("../models/coupon.model");
function makeCouponControllers(svc) {
    function validate(req, res) {
        if (!req.user) {
            res.status(401).json({ success: false, message: "Unauthorized" });
            return;
        }
        try {
            const input = coupon_model_1.ValidateCouponSchema.parse(req.body);
            const coupon = svc.validateCode(input.code);
            res.json({ success: true, data: coupon });
        }
        catch (err) {
            if (err instanceof zod_1.ZodError) {
                res.status(400).json({ success: false, message: "Invalid input" });
            }
            else if (err instanceof Error) {
                res.status(400).json({ success: false, message: err.message });
            }
            else {
                res.status(500).json({ success: false, message: "Failed to validate coupon" });
            }
        }
    }
    return { validate };
}
//# sourceMappingURL=coupon.controller.js.map