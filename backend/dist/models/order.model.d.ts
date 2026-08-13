import { z } from "zod";
import { Product } from "./product.model";
export type OrderStatus = "Processing" | "Shipped" | "Delivered" | "Cancelled";
export type PaymentStatus = "Pending" | "Paid" | "Failed";
export interface OrderRow {
    id: number;
    user_id: number;
    total_amount: number;
    discount_amount: number;
    coupon_code: string | null;
    status: OrderStatus;
    payment_status: PaymentStatus;
    razorpay_order_id: string | null;
    razorpay_payment_id: string | null;
    created_at: string;
    updated_at: string;
}
export interface OrderItemRow {
    id: number;
    order_id: number;
    product_id: number;
    quantity: number;
    price: number;
}
export interface OrderItem {
    id: number;
    productId: number;
    quantity: number;
    price: number;
    product?: Product;
}
export interface Order {
    id: number;
    userId: number;
    totalAmount: number;
    discountAmount: number;
    couponCode: string | null;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    razorpayOrderId: string | null;
    razorpayPaymentId?: string | null;
    createdAt: string;
    updatedAt: string;
    items: OrderItem[];
}
export declare const OrderItemSchema: z.ZodObject<{
    productId: z.ZodNumber;
    quantity: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    productId: number;
    quantity: number;
}, {
    productId: number;
    quantity: number;
}>;
export declare const CreateOrderSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        productId: z.ZodNumber;
        quantity: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        productId: number;
        quantity: number;
    }, {
        productId: number;
        quantity: number;
    }>, "many">;
    couponCode: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    items: {
        productId: number;
        quantity: number;
    }[];
    couponCode?: string | undefined;
}, {
    items: {
        productId: number;
        quantity: number;
    }[];
    couponCode?: string | undefined;
}>;
export declare const UpdateOrderStatusSchema: z.ZodObject<{
    status: z.ZodEnum<["Processing", "Shipped", "Delivered", "Cancelled"]>;
}, "strip", z.ZodTypeAny, {
    status: "Processing" | "Shipped" | "Delivered" | "Cancelled";
}, {
    status: "Processing" | "Shipped" | "Delivered" | "Cancelled";
}>;
export declare const VerifyPaymentSchema: z.ZodObject<{
    razorpay_order_id: z.ZodString;
    razorpay_payment_id: z.ZodString;
    razorpay_signature: z.ZodString;
}, "strip", z.ZodTypeAny, {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}, {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}>;
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusSchema>;
export type VerifyPaymentInput = z.infer<typeof VerifyPaymentSchema>;
export declare function rowToOrder(row: OrderRow, items?: OrderItem[]): Order;
export declare function rowToOrderItem(row: OrderItemRow): OrderItem;
//# sourceMappingURL=order.model.d.ts.map