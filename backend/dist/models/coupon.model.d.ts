import { z } from "zod";
export declare const ValidateCouponSchema: z.ZodObject<{
    code: z.ZodString;
}, "strip", z.ZodTypeAny, {
    code: string;
}, {
    code: string;
}>;
export type ValidateCouponInput = z.infer<typeof ValidateCouponSchema>;
export interface Coupon {
    id: number;
    code: string;
    discountPercentage: number;
    isActive: boolean;
    createdAt: string;
}
export interface CouponRow {
    id: number;
    code: string;
    discount_percentage: number;
    is_active: number;
    created_at: string;
}
export declare function rowToCoupon(row: CouponRow): Coupon;
//# sourceMappingURL=coupon.model.d.ts.map