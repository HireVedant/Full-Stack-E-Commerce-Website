import { z } from "zod";
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
export declare const CreateProductSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodString;
    price: z.ZodNumber;
    category: z.ZodString;
    imageUrl: z.ZodString;
    stock: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl: string;
    stock: number;
}, {
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl: string;
    stock: number;
}>;
export declare const UpdateProductSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    price: z.ZodOptional<z.ZodNumber>;
    category: z.ZodOptional<z.ZodString>;
    imageUrl: z.ZodOptional<z.ZodString>;
    stock: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    description?: string | undefined;
    price?: number | undefined;
    category?: string | undefined;
    imageUrl?: string | undefined;
    stock?: number | undefined;
}, {
    name?: string | undefined;
    description?: string | undefined;
    price?: number | undefined;
    category?: string | undefined;
    imageUrl?: string | undefined;
    stock?: number | undefined;
}>;
export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
export declare const ProductQuerySchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodString>;
    sort: z.ZodOptional<z.ZodEnum<["price_asc", "price_desc", "name_asc", "name_desc"]>>;
    page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    category?: string | undefined;
    sort?: "price_asc" | "price_desc" | "name_asc" | "name_desc" | undefined;
    search?: string | undefined;
}, {
    category?: string | undefined;
    sort?: "price_asc" | "price_desc" | "name_asc" | "name_desc" | undefined;
    search?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
}>;
export type ProductQuery = z.infer<typeof ProductQuerySchema>;
export declare function rowToProduct(row: ProductRow): Product;
export declare function getAvailability(stock: number): AvailabilityStatus;
//# sourceMappingURL=product.model.d.ts.map