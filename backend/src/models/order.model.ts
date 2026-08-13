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

export const OrderItemSchema = z.object({
  productId: z.number().int().positive("Invalid product ID"),
  quantity: z.number().int().positive("Quantity must be at least 1"),
});

export const CreateOrderSchema = z.object({
  items: z.array(OrderItemSchema).min(1, "Cart cannot be empty"),
  couponCode: z.string().optional()
});

export const UpdateOrderStatusSchema = z.object({
  status: z.enum(["Processing", "Shipped", "Delivered", "Cancelled"]),
});

export const VerifyPaymentSchema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string()
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusSchema>;
export type VerifyPaymentInput = z.infer<typeof VerifyPaymentSchema>;

export function rowToOrder(row: OrderRow, items: OrderItem[] = []): Order {
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

export function rowToOrderItem(row: OrderItemRow): OrderItem {
  return {
    id: row.id,
    productId: row.product_id,
    quantity: row.quantity,
    price: row.price,
  };
}
