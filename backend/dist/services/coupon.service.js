"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CouponService = void 0;
const connection_1 = require("../db/connection");
const coupon_model_1 = require("../models/coupon.model");
class CouponService {
    constructor(db) {
        this.db = db ?? (0, connection_1.getDb)();
    }
    validateCode(code) {
        const row = this.db.prepare("SELECT * FROM coupons WHERE code = ? COLLATE NOCASE").get(code);
        if (!row)
            throw new Error("Invalid coupon code");
        if (row.is_active !== 1)
            throw new Error("Coupon has expired or is inactive");
        return (0, coupon_model_1.rowToCoupon)(row);
    }
}
exports.CouponService = CouponService;
//# sourceMappingURL=coupon.service.js.map