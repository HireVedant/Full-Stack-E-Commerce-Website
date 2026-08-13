"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyPaymentSchema = exports.UpdateOrderStatusSchema = exports.CreateOrderSchema = exports.OrderItemSchema = void 0;
exports.rowToOrder = rowToOrder;
exports.rowToOrderItem = rowToOrderItem;
const zod_1 = require("zod");
exports.OrderItemSchema = zod_1.z.object({
    productId: zod_1.z.number().int().positive("Invalid product ID"),
    quantity: zod_1.z.number().int().positive("Quantity must be at least 1"),
});
exports.CreateOrderSchema = zod_1.z.object({
    items: zod_1.z.array(exports.OrderItemSchema).min(1, "Cart cannot be empty"),
    couponCode: zod_1.z.string().optional()
});
exports.UpdateOrderStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(["Processing", "Shipped", "Delivered", "Cancelled"]),
});
exports.VerifyPaymentSchema = zod_1.z.object({
    razorpay_order_id: zod_1.z.string(),
    razorpay_payment_id: zod_1.z.string(),
    razorpay_signature: zod_1.z.string()
});
function rowToOrder(row, items = []) {
    return {
        id: row.id,
        userId: row.user_id,
        totalAmount: row.total_amount,
        discountAmount: row.discount_amount,
        couponCode: row.coupon_code,
        status: row.status,
        paymentStatus: row.payment_status,
        razorpayOrderId: row.razorpay_order_id,
        razorpayPaymentId: row.razorpay_payment_id,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        items,
    };
}
function rowToOrderItem(row) {
    return {
        id: row.id,
        productId: row.product_id,
        quantity: row.quantity,
        price: row.price,
    };
}
//# sourceMappingURL=order.model.js.map