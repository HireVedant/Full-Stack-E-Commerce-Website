import type Database from "better-sqlite3";
import { getDb } from "../db/connection";

export class AnalyticsService {
  private db: Database.Database;

  constructor(db?: Database.Database) {
    this.db = db ?? getDb();
  }

  getDashboardStats() {
    const totalProducts = (this.db.prepare("SELECT COUNT(*) as c FROM products").get() as any).c;
    const totalUsers = (this.db.prepare("SELECT COUNT(*) as c FROM users").get() as any).c;
    const totalOrders = (this.db.prepare("SELECT COUNT(*) as c FROM orders").get() as any).c;
    // Calculate revenue securely server-side (amount minus discount)
    const revenueRow = this.db.prepare(
      "SELECT SUM(total_amount - discount_amount) as rev FROM orders WHERE payment_status = 'Paid'"
    ).get() as any;
    const totalRevenue = revenueRow.rev || 0;

    // Most popular products based on total quantity ordered in paid orders
    const popularProducts = this.db.prepare(`
      SELECT p.id, p.name, p.image_url as imageUrl, SUM(oi.quantity) as totalSold
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      JOIN products p ON p.id = oi.product_id
      WHERE o.payment_status = 'Paid'
      GROUP BY p.id
      ORDER BY totalSold DESC
      LIMIT 5
    `).all() as any[];

    return { totalProducts, totalUsers, totalOrders, totalRevenue, popularProducts };
  }
}
