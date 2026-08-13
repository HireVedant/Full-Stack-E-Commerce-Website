import { Request, Response } from "express";
import { ZodError } from "zod";
import { WishlistService } from "../services/wishlist.service";
import { AddToWishlistSchema } from "../models/wishlist.model";

export function makeWishlistControllers(svc: WishlistService) {
  function getWishlist(req: Request, res: Response): void {
    if (!req.user) { res.status(401).json({ success: false, message: "Unauthorized" }); return; }
    try {
      const items = svc.getUserWishlist(req.user.id);
      res.json({ success: true, data: items });
    } catch {
      res.status(500).json({ success: false, message: "Failed to fetch wishlist" });
    }
  }

  function add(req: Request, res: Response): void {
    if (!req.user) { res.status(401).json({ success: false, message: "Unauthorized" }); return; }
    try {
      const input = AddToWishlistSchema.parse(req.body);
      const item = svc.add(req.user.id, input.productId);
      res.status(201).json({ success: true, data: item });
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({ success: false, message: "Invalid input" });
      } else if (err instanceof Error) {
        res.status(400).json({ success: false, message: err.message });
      } else {
        res.status(500).json({ success: false, message: "Failed to add to wishlist" });
      }
    }
  }

  function remove(req: Request, res: Response): void {
    if (!req.user) { res.status(401).json({ success: false, message: "Unauthorized" }); return; }
    const productId = parseInt(req.params.productId, 10);
    if (isNaN(productId)) { res.status(400).json({ success: false, message: "Invalid product ID" }); return; }
    
    try {
      svc.remove(req.user.id, productId);
      res.json({ success: true, message: "Removed from wishlist" });
    } catch {
      res.status(500).json({ success: false, message: "Failed to remove from wishlist" });
    }
  }

  return { getWishlist, add, remove };
}
