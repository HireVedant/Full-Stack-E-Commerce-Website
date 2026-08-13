import type Database from "better-sqlite3";
import { getDb } from "../db/connection";
import { rowToCoupon, type Coupon, type CouponRow } from "../models/coupon.model";

export class CouponService {
  private db: Database.Database;

  constructor(db?: Database.Database) {
    this.db = db ?? getDb();
  }

  validateCode(code: string): Coupon {
    const row = this.db.prepare(
      "SELECT * FROM coupons WHERE code = ? COLLATE NOCASE"
    ).get(code) as CouponRow | undefined;
    
    if (!row) throw new Error("Invalid coupon code");
    if (row.is_active !== 1) throw new Error("Coupon has expired or is inactive");

    return rowToCoupon(row);
  }
}
