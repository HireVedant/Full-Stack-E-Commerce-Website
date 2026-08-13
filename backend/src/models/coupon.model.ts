import { z } from "zod";

export const ValidateCouponSchema = z.object({
  code: z.string().min(1).max(20)
});
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

export function rowToCoupon(row: CouponRow): Coupon {
  return {
    id: row.id,
    code: row.code,
    discountPercentage: row.discount_percentage,
    isActive: row.is_active === 1,
    createdAt: row.created_at
  };
}
