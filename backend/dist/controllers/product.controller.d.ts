import { Request, Response } from "express";
import { ProductService } from "../services/product.service";
export declare function makeProductControllers(svc: ProductService): {
    listProducts: (req: Request, res: Response) => void;
    listCategories: (_req: Request, res: Response) => void;
    getProduct: (req: Request, res: Response) => void;
    createProduct: (req: Request, res: Response) => void;
    updateProduct: (req: Request, res: Response) => void;
    deleteProduct: (req: Request, res: Response) => void;
    getProductStock: (req: Request, res: Response) => void;
};
//# sourceMappingURL=product.controller.d.ts.map