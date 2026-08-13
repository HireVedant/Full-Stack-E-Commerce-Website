import { Request, Response } from "express";
import { ZodError } from "zod";
import { CouponService } from "../services/coupon.service";
import { ValidateCouponSchema } from "../models/coupon.model";

export function makeCouponControllers(svc: CouponService) {
  function validate(req: Request, res: Response): void {
    if (!req.user) { res.status(401).json({ success: false, message: "Unauthorized" }); return; }
    try {
      const input = ValidateCouponSchema.parse(req.body);
      const coupon = svc.validateCode(input.code);
      res.json({ success: true, data: coupon });
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({ success: false, message: "Invalid input" });
      } else if (err instanceof Error) {
        res.status(400).json({ success: false, message: err.message });
      } else {
        res.status(500).json({ success: false, message: "Failed to validate coupon" });
      }
    }
  }

  return { validate };
}
