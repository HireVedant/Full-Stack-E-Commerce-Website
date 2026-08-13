import { Request, Response } from "express";
import { ZodError } from "zod";
import { ProductService } from "../services/product.service";
import {
  CreateProductSchema,
  UpdateProductSchema,
  ProductQuerySchema,
} from "../models/product.model";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function parseId(param: string): number | null {
  const id = parseInt(param, 10);
  return isNaN(id) || id < 1 ? null : id;
}

function formatZodError(err: ZodError): Record<string, string[]> {
  const errors: Record<string, string[]> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "root";
    if (!errors[key]) errors[key] = [];
    errors[key].push(issue.message);
  }
  return errors;
}

// ─── Factory — returns controller functions bound to an injected service ──────
export function makeProductControllers(svc: ProductService) {
  /** GET /api/products */
  function listProducts(req: Request, res: Response): void {
    try {
      const query = ProductQuerySchema.parse(req.query);
      const result = svc.list(query);
      res.json({ success: true, data: result });
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({ success: false, errors: formatZodError(err) });
      } else {
        res
          .status(500)
          .json({ success: false, message: "Failed to fetch products" });
      }
    }
  }

  /** GET /api/products/categories */
  function listCategories(_req: Request, res: Response): void {
    try {
      const categories = svc.getCategories();
      res.json({ success: true, data: categories });
    } catch {
      res
        .status(500)
        .json({ success: false, message: "Failed to fetch categories" });
    }
  }

  /** GET /api/products/:id */
  function getProduct(req: Request, res: Response): void {
    const id = parseId(req.params.id);
    if (id === null) {
      res.status(400).json({ success: false, message: "Invalid product ID" });
      return;
    }
    try {
      const product = svc.getById(id);
      if (!product) {
        res.status(404).json({ success: false, message: "Product not found" });
        return;
      }
      res.json({ success: true, data: product });
    } catch {
      res
        .status(500)
        .json({ success: false, message: "Failed to fetch product" });
    }
  }

  /** POST /api/products */
  function createProduct(req: Request, res: Response): void {
    try {
      const input = CreateProductSchema.parse(req.body);
      const product = svc.create(input);
      res.status(201).json({ success: true, data: product });
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({ success: false, errors: formatZodError(err) });
      } else {
        res
          .status(500)
          .json({ success: false, message: "Failed to create product" });
      }
    }
  }

  /** PUT /api/products/:id */
  function updateProduct(req: Request, res: Response): void {
    const id = parseId(req.params.id);
    if (id === null) {
      res.status(400).json({ success: false, message: "Invalid product ID" });
      return;
    }
    try {
      const input = UpdateProductSchema.parse(req.body);
      const product = svc.update(id, input);
      if (!product) {
        res.status(404).json({ success: false, message: "Product not found" });
        return;
      }
      res.json({ success: true, data: product });
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({ success: false, errors: formatZodError(err) });
      } else {
        res
          .status(500)
          .json({ success: false, message: "Failed to update product" });
      }
    }
  }

  /** DELETE /api/products/:id */
  function deleteProduct(req: Request, res: Response): void {
    const id = parseId(req.params.id);
    if (id === null) {
      res.status(400).json({ success: false, message: "Invalid product ID" });
      return;
    }
    try {
      const deleted = svc.delete(id);
      if (!deleted) {
        res.status(404).json({ success: false, message: "Product not found" });
        return;
      }
      res.json({ success: true, message: "Product deleted successfully" });
    } catch {
      res
        .status(500)
        .json({ success: false, message: "Failed to delete product" });
    }
  }

  /** GET /api/products/:id/stock */
  function getProductStock(req: Request, res: Response): void {
    const id = parseId(req.params.id);
    if (id === null) {
      res.status(400).json({ success: false, message: "Invalid product ID" });
      return;
    }
    try {
      const stock = svc.getStock(id);
      if (stock === null) {
        res.status(404).json({ success: false, message: "Product not found" });
        return;
      }
      res.json({ success: true, data: { stock } });
    } catch {
      res
        .status(500)
        .json({ success: false, message: "Failed to fetch stock" });
    }
  }

  return {
    listProducts,
    listCategories,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductStock,
  };
}
