"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const connection_1 = require("../db/connection");
class AnalyticsService {
    constructor(db) {
        this.db = db ?? (0, connection_1.getDb)();
    }
    getDashboardStats() {
        const totalProducts = this.db.prepare("SELECT COUNT(*) as c FROM products").get().c;
        const totalUsers = this.db.prepare("SELECT COUNT(*) as c FROM users").get().c;
        const totalOrders = this.db.prepare("SELECT COUNT(*) as c FROM orders").get().c;
        // Calculate revenue securely server-side (amount minus discount)
        const revenueRow = this.db.prepare("SELECT SUM(total_amount - discount_amount) as rev FROM orders WHERE payment_status = 'Paid'").get();
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
    `).all();
        return { totalProducts, totalUsers, totalOrders, totalRevenue, popularProducts };
    }
}
exports.AnalyticsService = AnalyticsService;
//# sourceMappingURL=analytics.service.js.map