import type Database from "better-sqlite3";
import { getDb } from "../db/connection";
import {
  rowToProduct,
  type CreateProductInput,
  type UpdateProductInput,
  type Product,
  type ProductRow,
  type ProductQuery,
} from "../models/product.model";

export interface ProductListResult {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class ProductService {
  private db: Database.Database;

  constructor(db?: Database.Database) {
    this.db = db ?? getDb();
  }

  // ─── List (search + filter + sort + paginate) ────────────────────────────
  list(query: ProductQuery): ProductListResult {
    const { search, category, sort, page, limit } = query;

    const conditions: string[] = [];
    const params: Record<string, unknown> = {};

    if (search && search.trim()) {
      conditions.push("LOWER(name) LIKE LOWER(@search)");
      params.search = `%${search.trim()}%`;
    }

    if (category && category.trim()) {
      conditions.push("LOWER(category) = LOWER(@category)");
      params.category = category.trim();
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const orderMap: Record<NonNullable<ProductQuery["sort"]>, string> = {
      price_asc: "price ASC, id ASC",
      price_desc: "price DESC, id ASC",
      name_asc: "LOWER(name) ASC",
      name_desc: "LOWER(name) DESC",
    };
    const orderBy = sort ? orderMap[sort] : "id ASC";

    const offset = (page - 1) * limit;

    const countRow = this.db
      .prepare(`SELECT COUNT(*) as total FROM products ${where}`)
      .get(params) as { total: number };

    const rows = this.db
      .prepare(
        `SELECT * FROM products ${where} ORDER BY ${orderBy} LIMIT @limit OFFSET @offset`
      )
      .all({ ...params, limit, offset }) as ProductRow[];

    return {
      products: rows.map(rowToProduct),
      total: countRow.total,
      page,
      limit,
      totalPages: Math.ceil(countRow.total / limit),
    };
  }

  // ─── Get all categories ───────────────────────────────────────────────────
  getCategories(): string[] {
    const rows = this.db
      .prepare(
        "SELECT DISTINCT category FROM products ORDER BY category ASC"
      )
      .all() as { category: string }[];
    return rows.map((r) => r.category);
  }

  // ─── Get single product ───────────────────────────────────────────────────
  getById(id: number): Product | null {
    const row = this.db
      .prepare("SELECT * FROM products WHERE id = ?")
      .get(id) as ProductRow | undefined;
    return row ? rowToProduct(row) : null;
  }

  // ─── Create ───────────────────────────────────────────────────────────────
  create(input: CreateProductInput): Product {
    const result = this.db
      .prepare(
        `INSERT INTO products (name, description, price, category, image_url, stock)
         VALUES (@name, @description, @price, @category, @image_url, @stock)
         RETURNING *`
      )
      .get({
        name: input.name,
        description: input.description,
        price: input.price,
        category: input.category,
        image_url: input.imageUrl,
        stock: input.stock,
      }) as ProductRow;

    return rowToProduct(result);
  }

  // ─── Update ───────────────────────────────────────────────────────────────
  update(id: number, input: UpdateProductInput): Product | null {
    const existing = this.getById(id);
    if (!existing) return null;

    const merged = {
      name: input.name ?? existing.name,
      description: input.description ?? existing.description,
      price: input.price ?? existing.price,
      category: input.category ?? existing.category,
      image_url: input.imageUrl ?? existing.imageUrl,
      stock: input.stock ?? existing.stock,
      id,
    };

    const updated = this.db
      .prepare(
        `UPDATE products
         SET name = @name,
             description = @description,
             price = @price,
             category = @category,
             image_url = @image_url,
             stock = @stock,
             updated_at = datetime('now')
         WHERE id = @id
         RETURNING *`
      )
      .get(merged) as ProductRow;

    return rowToProduct(updated);
  }

  // ─── Delete ───────────────────────────────────────────────────────────────
  delete(id: number): boolean {
    const result = this.db
      .prepare("DELETE FROM products WHERE id = ?")
      .run(id);
    return result.changes > 0;
  }

  // ─── Stock check (atomic) ─────────────────────────────────────────────────
  getStock(id: number): number | null {
    const row = this.db
      .prepare("SELECT stock FROM products WHERE id = ?")
      .get(id) as { stock: number } | undefined;
    return row !== undefined ? row.stock : null;
  }
}
