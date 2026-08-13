import { Request, Response } from "express";
import { ZodError } from "zod";
import { ReviewService } from "../services/review.service";
import { CreateReviewSchema } from "../models/review.model";

export function makeReviewControllers(svc: ReviewService) {
  function getByProduct(req: Request, res: Response): void {
    const productId = parseInt(req.params.productId, 10);
    if (isNaN(productId)) { res.status(400).json({ success: false, message: "Invalid product ID" }); return; }
    
    try {
      const reviews = svc.getByProductId(productId);
      const stats = svc.getAverageRating(productId);
      res.json({ success: true, data: { reviews, stats } });
    } catch {
      res.status(500).json({ success: false, message: "Failed to fetch reviews" });
    }
  }

  function create(req: Request, res: Response): void {
    if (!req.user) { res.status(401).json({ success: false, message: "Unauthorized" }); return; }
    try {
      const input = CreateReviewSchema.parse(req.body);
      const review = svc.create(req.user.id, input);
      res.status(201).json({ success: true, data: review });
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({ success: false, message: "Invalid input" });
      } else if (err instanceof Error) {
        res.status(400).json({ success: false, message: err.message });
      } else {
        res.status(500).json({ success: false, message: "Failed to create review" });
      }
    }
  }

  return { getByProduct, create };
}
