import type Database from "better-sqlite3";
import { type CreateProductInput, type UpdateProductInput, type Product, type ProductQuery } from "../models/product.model";
export interface ProductListResult {
    products: Product[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export declare class ProductService {
    private db;
    constructor(db?: Database.Database);
    list(query: ProductQuery): ProductListResult;
    getCategories(): string[];
    getById(id: number): Product | null;
    create(input: CreateProductInput): Product;
    update(id: number, input: UpdateProductInput): Product | null;
    delete(id: number): boolean;
    getStock(id: number): number | null;
}
//# sourceMappingURL=product.service.d.ts.map