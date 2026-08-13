import type Database from "better-sqlite3";
import crypto from "crypto";
import { getDb } from "../db/connection";
import {
  rowToOrder,
  rowToOrderItem,
  type CreateOrderInput,
  type Order,
  type OrderRow,
  type OrderItemRow,
  type UpdateOrderStatusInput,
  type VerifyPaymentInput
} from "../models/order.model";
import { ProductService } from "./product.service";
import { CouponService } from "./coupon.service";

export class OrderService {
  private db: Database.Database;
  private productService: ProductService;
  private couponService: CouponService;

  constructor(db?: Database.Database) {
    this.db = db ?? getDb();
    this.productService = new ProductService(this.db);
    this.couponService = new CouponService(this.db);
  }

  async createOrder(userId: number, input: CreateOrderInput): Promise<Order> {
    let discountPercentage = 0;
    let couponCode: string | null = null;
    
    if (input.couponCode) {
      try {
        const coupon = this.couponService.validateCode(input.couponCode);
        discountPercentage = coupon.discountPercentage;
        couponCode = coupon.code;
      } catch (err) {
        throw new Error("Invalid or expired coupon code");
      }
    }

    // We need to use a transaction to ensure atomicity
    const transaction = this.db.transaction((userId: number, items: CreateOrderInput["items"]) => {
      let subtotal = 0;
      const orderItemsToInsert: { productId: number, quantity: number, price: number }[] = [];

      for (const item of items) {
        const product = this.productService.getById(item.productId);
        if (!product) throw new Error(`Product with ID ${item.productId} not found`);
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
      if (totalAmount < 0) totalAmount = 0;

      const orderRow = this.db.prepare(`
        INSERT INTO orders (user_id, total_amount, discount_amount, coupon_code) 
        VALUES (@user_id, @total_amount, @discount_amount, @coupon_code) RETURNING *
      `).get({ 
        user_id: userId, 
        total_amount: totalAmount, 
        discount_amount: discountAmount, 
        coupon_code: couponCode 
      }) as OrderRow;

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
        }) as OrderItemRow;
      });

      return rowToOrder(orderRow, insertedItems.map(rowToOrderItem));
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
        const rzpData = await response.json() as any;
        if (rzpData.id) {
          this.db.prepare("UPDATE orders SET razorpay_order_id = ? WHERE id = ?").run(rzpData.id, order.id);
          order.razorpayOrderId = rzpData.id;
        }
      } catch (err) {
        console.error("Razorpay order creation failed:", err);
      }
    }

    return order;
  }

  verifyPayment(input: VerifyPaymentInput): Order {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = input;
    const secret = process.env.RAZORPAY_KEY_SECRET || "example_secret";
    
    const generatedSignature = crypto.createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');
      
    const isValid = generatedSignature === razorpay_signature;

    const row = this.db.prepare(`
      UPDATE orders SET payment_status = ?, razorpay_payment_id = ?, updated_at = datetime('now')
      WHERE razorpay_order_id = ? RETURNING *
    `).get(isValid ? "Paid" : "Failed", razorpay_payment_id, razorpay_order_id) as OrderRow | undefined;

    if (!row) throw new Error("Order not found for this payment");
    
    if (!isValid) {
      throw new Error("Payment signature verification failed");
    }

    return rowToOrder(row, []);
  }

  getUserOrders(userId: number): Order[] {
    const orderRows = this.db.prepare(`SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC`).all(userId) as OrderRow[];
    return this.populateOrderItems(orderRows);
  }
  
  getOrderById(orderId: number, userId?: number, role?: string): Order | null {
    const orderRow = this.db.prepare(`SELECT * FROM orders WHERE id = ?`).get(orderId) as OrderRow | undefined;
    if (!orderRow) return null;
    if (role !== "admin" && orderRow.user_id !== userId) return null;
    return this.populateOrderItems([orderRow])[0];
  }

  getAllOrders(): Order[] {
    const orderRows = this.db.prepare(`SELECT * FROM orders ORDER BY created_at DESC`).all() as OrderRow[];
    return this.populateOrderItems(orderRows);
  }

  updateOrderStatus(orderId: number, input: UpdateOrderStatusInput): Order | null {
    const row = this.db.prepare(`UPDATE orders SET status = @status, updated_at = datetime('now') WHERE id = @id RETURNING *`).get({ id: orderId, status: input.status }) as OrderRow | undefined;
    if (!row) return null;
    return this.populateOrderItems([row])[0];
  }

  private populateOrderItems(orderRows: OrderRow[]): Order[] {
    return orderRows.map(row => {
      const itemsRows = this.db.prepare(`SELECT * FROM order_items WHERE order_id = ?`).all(row.id) as OrderItemRow[];
      const items = itemsRows.map(iRow => {
        const item = rowToOrderItem(iRow);
        item.product = this.productService.getById(item.productId) || undefined;
        return item;
      });
      return rowToOrder(row, items);
    });
  }
}
