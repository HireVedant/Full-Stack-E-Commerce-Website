import type Database from "better-sqlite3";
import { getDb } from "../db/connection";
import { rowToReview, type CreateReviewInput, type Review, type ReviewRow } from "../models/review.model";
import { UserService } from "./user.service";

export class ReviewService {
  private db: Database.Database;
  private userService: UserService;

  constructor(db?: Database.Database) {
    this.db = db ?? getDb();
    this.userService = new UserService(this.db);
  }

  create(userId: number, input: CreateReviewInput): Review {
    // Only one review per product per user
    const existing = this.db.prepare(
      "SELECT * FROM reviews WHERE user_id = ? AND product_id = ?"
    ).get(userId, input.productId);
    
    if (existing) {
      throw new Error("You have already reviewed this product");
    }

    const row = this.db.prepare(`
      INSERT INTO reviews (user_id, product_id, rating, comment)
      VALUES (@userId, @productId, @rating, @comment)
      RETURNING *
    `).get({
      userId,
      productId: input.productId,
      rating: input.rating,
      comment: input.comment
    }) as ReviewRow;

    const review = rowToReview(row);
    review.user = this.userService.getById(userId) || undefined;
    return review;
  }

  getByProductId(productId: number): Review[] {
    const rows = this.db.prepare(
      "SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC"
    ).all(productId) as ReviewRow[];

    return rows.map(row => {
      const review = rowToReview(row);
      const user = this.userService.getById(review.userId);
      if (user) {
        // Strip sensitive info
        review.user = { id: user.id, name: user.name, email: "", role: "user", createdAt: "" } as any;
      }
      return review;
    });
  }

  getAverageRating(productId: number): { average: number; count: number } {
    const row = this.db.prepare(
      "SELECT AVG(rating) as avg, COUNT(*) as cnt FROM reviews WHERE product_id = ?"
    ).get(productId) as { avg: number | null; cnt: number };

    return {
      average: row.avg ? Number(row.avg.toFixed(1)) : 0,
      count: row.cnt
    };
  }
}
