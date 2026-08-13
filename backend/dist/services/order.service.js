"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const connection_1 = require("../db/connection");
const order_model_1 = require("../models/order.model");
const product_service_1 = require("./product.service");
const coupon_service_1 = require("./coupon.service");
class OrderService {
    constructor(db) {
        this.db = db ?? (0, connection_1.getDb)();
        this.productService = new product_service_1.ProductService(this.db);
        this.couponService = new coupon_service_1.CouponService(this.db);
    }
    async createOrder(userId, input) {
        let discountPercentage = 0;
        let couponCode = null;
        if (input.couponCode) {
            try {
                const coupon = this.couponService.validateCode(input.couponCode);
                discountPercentage = coupon.discountPercentage;
                couponCode = coupon.code;
            }
            catch (err) {
                throw new Error("Invalid or expired coupon code");
            }
        }
        // We need to use a transaction to ensure atomicity
        const transaction = this.db.transaction((userId, items) => {
            let subtotal = 0;
            const orderItemsToInsert = [];
            for (const item of items) {
                const product = this.productService.getById(item.productId);
                if (!product)
                    throw new Error(`Product with ID ${item.productId} not found`);
                if (product.stock < item.quantity) {
                    throw new Error(`Insufficient stock for product "${product.name}".`);
                }
                const updateStock = this.db.prepare(`
          UPDATE products SET stock = stock - @quantity WHERE id = @id AND stock >= @quantity
        `);
                const result = updateStock.run({ id: product.id, quantity: item.quantity });
                if (result.changes === 0) {
                    throw new Error(`Failed to deduct stock for product "${product.name}".`);
                }
                const price = product.price;
                subtotal += price * item.quantity;
                orderItemsToInsert.push({ productId: product.id, quantity: item.quantity, price });
            }
            const discountAmount = Number((subtotal * (discountPercentage / 100)).toFixed(2));
            let totalAmount = subtotal - discountAmount;
            if (totalAmount < 0)
                totalAmount = 0;
            const orderRow = this.db.prepare(`
        INSERT INTO orders (user_id, total_amount, discount_amount, coupon_code) 
        VALUES (@user_id, @total_amount, @discount_amount, @coupon_code) RETURNING *
      `).get({
                user_id: userId,
                total_amount: totalAmount,
                discount_amount: discountAmount,
                coupon_code: couponCode
            });
            const insertItem = this.db.prepare(`
        INSERT INTO order_items (order_id, product_id, quantity, price)
        VALUES (@order_id, @product_id, @quantity, @price) RETURNING *
      `);
            const insertedItems = orderItemsToInsert.map(oi => {
                return insertItem.get({
                    order_id: orderRow.id,
                    product_id: oi.productId,
                    quantity: oi.quantity,
                    price: oi.price
                });
            });
            return (0, order_model_1.rowToOrder)(orderRow, insertedItems.map(order_model_1.rowToOrderItem));
        });
        const order = transaction(userId, input.items);
        // Call Razorpay API to create order
        if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
            try {
                const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64');
                const response = await fetch("https://api.razorpay.com/v1/orders", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "Authorization": `Basic ${auth}` },
                    body: JSON.stringify({
                        amount: Math.round(order.totalAmount * 100),
                        currency: "INR",
                        receipt: `receipt_order_${order.id}`
                    })
                });
                const rzpData = await response.json();
                if (rzpData.id) {
                    this.db.prepare("UPDATE orders SET razorpay_order_id = ? WHERE id = ?").run(rzpData.id, order.id);
                    order.razorpayOrderId = rzpData.id;
                }
            }
            catch (err) {
                console.error("Razorpay order creation failed:", err);
            }
        }
        return order;
    }
    verifyPayment(input) {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = input;
        const secret = process.env.RAZORPAY_KEY_SECRET || "example_secret";
        const generatedSignature = crypto_1.default.createHmac('sha256', secret)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');
        const isValid = generatedSignature === razorpay_signature;
        const row = this.db.prepare(`
      UPDATE orders SET payment_status = ?, razorpay_payment_id = ?, updated_at = datetime('now')
      WHERE razorpay_order_id = ? RETURNING *
    `).get(isValid ? "Paid" : "Failed", razorpay_payment_id, razorpay_order_id);
        if (!row)
            throw new Error("Order not found for this payment");
        if (!isValid) {
            throw new Error("Payment signature verification failed");
        }
        return (0, order_model_1.rowToOrder)(row, []);
    }
    getUserOrders(userId) {
        const orderRows = this.db.prepare(`SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC`).all(userId);
        return this.populateOrderItems(orderRows);
    }
    getOrderById(orderId, userId, role) {
        const orderRow = this.db.prepare(`SELECT * FROM orders WHERE id = ?`).get(orderId);
        if (!orderRow)
            return null;
        if (role !== "admin" && orderRow.user_id !== userId)
            return null;
        return this.populateOrderItems([orderRow])[0];
    }
    getAllOrders() {
        const orderRows = this.db.prepare(`SELECT * FROM orders ORDER BY created_at DESC`).all();
        return this.populateOrderItems(orderRows);
    }
    updateOrderStatus(orderId, input) {
        const row = this.db.prepare(`UPDATE orders SET status = @status, updated_at = datetime('now') WHERE id = @id RETURNING *`).get({ id: orderId, status: input.status });
        if (!row)
            return null;
        return this.populateOrderItems([row])[0];
    }
    populateOrderItems(orderRows) {
        return orderRows.map(row => {
            const itemsRows = this.db.prepare(`SELECT * FROM order_items WHERE order_id = ?`).all(row.id);
            const items = itemsRows.map(iRow => {
                const item = (0, order_model_1.rowToOrderItem)(iRow);
                item.product = this.productService.getById(item.productId) || undefined;
                return item;
            });
            return (0, order_model_1.rowToOrder)(row, items);
        });
    }
}
exports.OrderService = OrderService;
//# sourceMappingURL=order.service.js.map