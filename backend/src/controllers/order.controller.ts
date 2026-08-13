import { Request, Response } from "express";
import { ZodError } from "zod";
import { OrderService } from "../services/order.service";
import { CreateOrderSchema, UpdateOrderStatusSchema, VerifyPaymentSchema } from "../models/order.model";

function formatZodError(err: ZodError): Record<string, string[]> {
  const errors: Record<string, string[]> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "root";
    if (!errors[key]) errors[key] = [];
    errors[key].push(issue.message);
  }
  return errors;
}

function parseId(param: string): number | null {
  const id = parseInt(param, 10);
  return isNaN(id) || id < 1 ? null : id;
}

export function makeOrderControllers(svc: OrderService) {
  function createOrder(req: Request, res: Response): void {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    try {
      const input = CreateOrderSchema.parse(req.body);
      const order = svc.createOrder(req.user.id, input);
      res.status(201).json({ success: true, data: order });
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({ success: false, errors: formatZodError(err) });
      } else if (err instanceof Error) {
        res.status(400).json({ success: false, message: err.message });
      } else {
        res.status(500).json({ success: false, message: "Failed to create order" });
      }
    }
  }

  function getMyOrders(req: Request, res: Response): void {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }
    
    try {
      const orders = svc.getUserOrders(req.user.id);
      res.json({ success: true, data: orders });
    } catch (err) {
      res.status(500).json({ success: false, message: "Failed to fetch orders" });
    }
  }

  function getOrderById(req: Request, res: Response): void {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }
    const id = parseId(req.params.id);
    if (!id) {
      res.status(400).json({ success: false, message: "Invalid order ID" });
      return;
    }
    try {
      const order = svc.getOrderById(id, req.user.id, req.user.role);
      if (!order) {
        res.status(404).json({ success: false, message: "Order not found" });
        return;
      }
      res.json({ success: true, data: order });
    } catch (err) {
      res.status(500).json({ success: false, message: "Failed to fetch order" });
    }
  }

  function getAllOrders(req: Request, res: Response): void {
    try {
      const orders = svc.getAllOrders();
      res.json({ success: true, data: orders });
    } catch (err) {
      res.status(500).json({ success: false, message: "Failed to fetch orders" });
    }
  }

  function updateOrderStatus(req: Request, res: Response): void {
    const id = parseId(req.params.id);
    if (!id) {
      res.status(400).json({ success: false, message: "Invalid order ID" });
      return;
    }
    try {
      const input = UpdateOrderStatusSchema.parse(req.body);
      const order = svc.updateOrderStatus(id, input);
      if (!order) {
        res.status(404).json({ success: false, message: "Order not found" });
        return;
      }
      res.json({ success: true, data: order });
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({ success: false, errors: formatZodError(err) });
      } else {
        res.status(500).json({ success: false, message: "Failed to update order status" });
      }
    }
  }

  function verifyPayment(req: Request, res: Response): void {
    try {
      const input = VerifyPaymentSchema.parse(req.body);
      const order = svc.verifyPayment(input);
      res.json({ success: true, data: order });
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({ success: false, errors: formatZodError(err) });
      } else if (err instanceof Error) {
        res.status(400).json({ success: false, message: err.message });
      } else {
        res.status(500).json({ success: false, message: "Payment verification failed" });
      }
    }
  }

  return { createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus, verifyPayment };
}
