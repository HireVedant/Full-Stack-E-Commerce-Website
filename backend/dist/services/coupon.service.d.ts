import type Database from "better-sqlite3";
import { type Coupon } from "../models/coupon.model";
export declare class CouponService {
    private db;
    constructor(db?: Database.Database);
    validateCode(code: string): Coupon;
}
//# sourceMappingURL=coupon.service.d.ts.map