import { Request, Response } from "express";
import { WishlistService } from "../services/wishlist.service";
export declare function makeWishlistControllers(svc: WishlistService): {
    getWishlist: (req: Request, res: Response) => void;
    add: (req: Request, res: Response) => void;
    remove: (req: Request, res: Response) => void;
};
//# sourceMappingURL=wishlist.controller.d.ts.map