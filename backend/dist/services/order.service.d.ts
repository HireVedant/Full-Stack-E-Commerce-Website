import type Database from "better-sqlite3";
import { type CreateOrderInput, type Order, type UpdateOrderStatusInput, type VerifyPaymentInput } from "../models/order.model";
export declare class OrderService {
    private db;
    private productService;
    private couponService;
    constructor(db?: Database.Database);
    createOrder(userId: number, input: CreateOrderInput): Promise<Order>;
    verifyPayment(input: VerifyPaymentInput): Order;
    getUserOrders(userId: number): Order[];
    getOrderById(orderId: number, userId?: number, role?: string): Order | null;
    getAllOrders(): Order[];
    updateOrderStatus(orderId: number, input: UpdateOrderStatusInput): Order | null;
    private populateOrderItems;
}
//# sourceMappingURL=order.service.d.ts.map