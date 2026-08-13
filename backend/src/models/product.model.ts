import { z } from "zod";

// ─── Database row shape ───────────────────────────────────────────────────────
export interface ProductRow {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  stock: number;
  created_at: string;
  updated_at: string;
}

// ─── API-facing shape (camelCase) ────────────────────────────────────────────
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  stock: number;
  availability: "in_stock" | "low_stock" | "out_of_stock";
  createdAt: string;
  updatedAt: string;
}

export type AvailabilityStatus = Product["availability"];

// ─── Zod schemas for validation ───────────────────────────────────────────────
export const CreateProductSchema = z.object({
  name: z.string().min(1, "Product name is required").max(200),
  description: z.string().min(1, "Description is required").max(2000),
  price: z
    .number({ invalid_type_error: "Price must be a number" })
    .nonnegative("Price must be 0 or greater")
    .finite(),
  category: z.string().min(1, "Category is required").max(100),
  imageUrl: z.string().min(1, "Image URL is required").max(500),
  stock: z
    .number({ invalid_type_error: "Stock must be a number" })
    .int("Stock must be an integer")
    .nonnegative("Stock must be 0 or greater"),
});

export const UpdateProductSchema = CreateProductSchema.partial();

export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;

// ─── List-query parameters ────────────────────────────────────────────────────
export const ProductQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  sort: z
    .enum(["price_asc", "price_desc", "name_asc", "name_desc"])
    .optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

export type ProductQuery = z.infer<typeof ProductQuerySchema>;

// ─── Helper ───────────────────────────────────────────────────────────────────
export function rowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    category: row.category,
    imageUrl: row.image_url,
    stock: row.stock,
    availability: getAvailability(row.stock),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function getAvailability(stock: number): AvailabilityStatus {
  if (stock <= 0) return "out_of_stock";
  if (stock <= 5) return "low_stock";
  return "in_stock";
}
