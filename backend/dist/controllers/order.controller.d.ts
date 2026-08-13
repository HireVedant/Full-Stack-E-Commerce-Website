import { Request, Response } from "express";
import { OrderService } from "../services/order.service";
export declare function makeOrderControllers(svc: OrderService): {
    createOrder: (req: Request, res: Response) => void;
    getMyOrders: (req: Request, res: Response) => void;
    getOrderById: (req: Request, res: Response) => void;
    getAllOrders: (req: Request, res: Response) => void;
    updateOrderStatus: (req: Request, res: Response) => void;
    verifyPayment: (req: Request, res: Response) => void;
};
//# sourceMappingURL=order.controller.d.ts.map