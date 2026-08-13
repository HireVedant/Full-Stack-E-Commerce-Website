"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("../app");
const connection_1 = require("../db/connection");
const migrations_1 = require("../db/migrations");
const seed_1 = require("../db/seed");
const product_service_1 = require("../services/product.service");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_middleware_1 = require("../middleware/auth.middleware");
// ─── Shared in-memory DB ──────────────────────────────────────────────────────
let testDb;
let svc;
let app;
beforeAll(() => {
    testDb = (0, connection_1.createTestDb)();
    (0, migrations_1.runMigrations)(testDb);
    (0, seed_1.seedProducts)(testDb);
    svc = new product_service_1.ProductService(testDb);
    app = (0, app_1.createApp)(testDb); // HTTP integration tests share same in-memory DB
});
const adminToken = jsonwebtoken_1.default.sign({ id: 1, role: "admin" }, auth_middleware_1.JWT_SECRET, { expiresIn: "1h" });
afterAll(() => {
    testDb.close();
});
// ─── ProductService unit tests ────────────────────────────────────────────────
describe("ProductService", () => {
    describe("list()", () => {
        it("returns all seeded products by default", () => {
            const result = svc.list({ page: 1, limit: 100 });
            expect(result.products.length).toBeGreaterThanOrEqual(12);
            expect(result.total).toBeGreaterThanOrEqual(12);
        });
        it("searches by partial name (case-insensitive)", () => {
            const result = svc.list({ search: "sneaker", page: 1, limit: 20 });
            expect(result.products.length).toBeGreaterThanOrEqual(1);
            result.products.forEach((p) => expect(p.name.toLowerCase()).toContain("sneaker"));
        });
        it("returns empty list for no matching search", () => {
            const result = svc.list({
                search: "zzznomatchxxx",
                page: 1,
                limit: 20,
            });
            expect(result.products.length).toBe(0);
            expect(result.total).toBe(0);
        });
        it("filters by category", () => {
            const result = svc.list({
                category: "Electronics",
                page: 1,
                limit: 50,
            });
            result.products.forEach((p) => expect(p.category.toLowerCase()).toBe("electronics"));
            expect(result.products.length).toBeGreaterThanOrEqual(1);
        });
        it("sorts by price ascending", () => {
            const result = svc.list({ sort: "price_asc", page: 1, limit: 50 });
            const prices = result.products.map((p) => p.price);
            for (let i = 1; i < prices.length; i++) {
                expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1]);
            }
        });
        it("sorts by price descending", () => {
            const result = svc.list({ sort: "price_desc", page: 1, limit: 50 });
            const prices = result.products.map((p) => p.price);
            for (let i = 1; i < prices.length; i++) {
                expect(prices[i]).toBeLessThanOrEqual(prices[i - 1]);
            }
        });
        it("sorts by name ascending", () => {
            const result = svc.list({ sort: "name_asc", page: 1, limit: 50 });
            const names = result.products.map((p) => p.name.toLowerCase());
            for (let i = 1; i < names.length; i++) {
                expect(names[i].localeCompare(names[i - 1])).toBeGreaterThanOrEqual(0);
            }
        });
        it("paginates correctly", () => {
            const page1 = svc.list({ page: 1, limit: 3 });
            const page2 = svc.list({ page: 2, limit: 3 });
            expect(page1.products.length).toBe(3);
            expect(page2.products.length).toBeGreaterThanOrEqual(1);
            // No overlap
            const ids1 = page1.products.map((p) => p.id);
            const ids2 = page2.products.map((p) => p.id);
            expect(ids1.some((id) => ids2.includes(id))).toBe(false);
        });
    });
    describe("getById()", () => {
        it("returns a product for a valid id", () => {
            const all = svc.list({ page: 1, limit: 100 });
            const first = all.products[0];
            const found = svc.getById(first.id);
            expect(found).not.toBeNull();
            expect(found.id).toBe(first.id);
        });
        it("returns null for nonexistent id", () => {
            expect(svc.getById(999999)).toBeNull();
        });
    });
    describe("create()", () => {
        it("creates a product with correct fields", () => {
            const input = {
                name: "Test Widget",
                description: "A test product description that is long enough",
                price: 99.99,
                category: "Test Category",
                imageUrl: "https://example.com/img.jpg",
                stock: 10,
            };
            const product = svc.create(input);
            expect(product.name).toBe("Test Widget");
            expect(product.price).toBe(99.99);
            expect(product.stock).toBe(10);
            expect(product.availability).toBe("in_stock");
            expect(product.id).toBeGreaterThan(0);
        });
        it("assigns correct availability status", () => {
            const outOfStock = svc.create({
                name: "No Stock Item",
                description: "Description here for testing",
                price: 10,
                category: "Test",
                imageUrl: "https://example.com/img.jpg",
                stock: 0,
            });
            expect(outOfStock.availability).toBe("out_of_stock");
            const lowStock = svc.create({
                name: "Low Stock Item",
                description: "Description here for testing",
                price: 10,
                category: "Test",
                imageUrl: "https://example.com/img.jpg",
                stock: 3,
            });
            expect(lowStock.availability).toBe("low_stock");
        });
    });
    describe("update()", () => {
        it("updates product fields", () => {
            const created = svc.create({
                name: "Update Me",
                description: "Original description",
                price: 100,
                category: "Misc",
                imageUrl: "https://example.com/img.jpg",
                stock: 5,
            });
            const updated = svc.update(created.id, { price: 200, stock: 10 });
            expect(updated).not.toBeNull();
            expect(updated.price).toBe(200);
            expect(updated.stock).toBe(10);
            // Unchanged fields stay
            expect(updated.name).toBe("Update Me");
        });
        it("returns null for nonexistent id", () => {
            expect(svc.update(999999, { price: 50 })).toBeNull();
        });
    });
    describe("delete()", () => {
        it("deletes an existing product", () => {
            const created = svc.create({
                name: "Delete Me",
                description: "To be deleted",
                price: 1,
                category: "Misc",
                imageUrl: "https://example.com/img.jpg",
                stock: 1,
            });
            const deleted = svc.delete(created.id);
            expect(deleted).toBe(true);
            expect(svc.getById(created.id)).toBeNull();
        });
        it("returns false for nonexistent id", () => {
            expect(svc.delete(999999)).toBe(false);
        });
    });
    describe("getStock()", () => {
        it("returns stock for existing product", () => {
            const all = svc.list({ page: 1, limit: 1 });
            const product = all.products[0];
            const stock = svc.getStock(product.id);
            expect(typeof stock).toBe("number");
            expect(stock).toBeGreaterThanOrEqual(0);
        });
        it("returns null for nonexistent product", () => {
            expect(svc.getStock(999999)).toBeNull();
        });
    });
    describe("getCategories()", () => {
        it("returns a non-empty list of categories", () => {
            const cats = svc.getCategories();
            expect(Array.isArray(cats)).toBe(true);
            expect(cats.length).toBeGreaterThan(0);
        });
    });
});
// ─── HTTP Integration tests ───────────────────────────────────────────────────
describe("Product HTTP API", () => {
    it("GET /api/health returns ok", async () => {
        const res = await (0, supertest_1.default)(app).get("/api/health");
        expect(res.status).toBe(200);
        expect(res.body.status).toBe("ok");
    });
    it("GET /api/products returns array with pagination", async () => {
        const res = await (0, supertest_1.default)(app).get("/api/products");
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data.products)).toBe(true);
        expect(typeof res.body.data.total).toBe("number");
    });
    it("GET /api/products?search=... filters results", async () => {
        const res = await (0, supertest_1.default)(app).get("/api/products?search=sneaker");
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });
    it("GET /api/products?sort=price_asc works", async () => {
        const res = await (0, supertest_1.default)(app).get("/api/products?sort=price_asc&limit=5");
        expect(res.status).toBe(200);
        const products = res.body.data.products;
        for (let i = 1; i < products.length; i++) {
            expect(products[i].price).toBeGreaterThanOrEqual(products[i - 1].price);
        }
    });
    it("GET /api/products/categories returns string array", async () => {
        const res = await (0, supertest_1.default)(app).get("/api/products/categories");
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
    });
    it("GET /api/products/:id returns 404 for nonexistent id", async () => {
        const res = await (0, supertest_1.default)(app).get("/api/products/999999");
        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
    });
    it("GET /api/products/abc returns 400 for invalid id", async () => {
        const res = await (0, supertest_1.default)(app).get("/api/products/abc");
        expect(res.status).toBe(400);
    });
    it("POST /api/products creates a product", async () => {
        const payload = {
            name: "Integration Test Product",
            description: "Created during integration test run",
            price: 199,
            category: "Test",
            imageUrl: "https://example.com/test.jpg",
            stock: 10,
        };
        const res = await (0, supertest_1.default)(app)
            .post("/api/products")
            .set("Authorization", `Bearer ${adminToken}`)
            .send(payload);
        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.name).toBe("Integration Test Product");
        expect(res.body.data.id).toBeGreaterThan(0);
    });
    it("POST /api/products returns 400 for invalid data", async () => {
        const res = await (0, supertest_1.default)(app)
            .post("/api/products")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ name: "", price: -5 });
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.errors).toBeDefined();
    });
    it("PUT /api/products/:id updates a product", async () => {
        // First create one
        const created = await (0, supertest_1.default)(app).post("/api/products")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
            name: "Update Target",
            description: "Will be updated",
            price: 50,
            category: "Test",
            imageUrl: "https://example.com/img.jpg",
            stock: 5,
        });
        const id = created.body.data.id;
        const res = await (0, supertest_1.default)(app)
            .put(`/api/products/${id}`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ price: 75 });
        expect(res.status).toBe(200);
        expect(res.body.data.price).toBe(75);
    });
    it("DELETE /api/products/:id deletes a product", async () => {
        const created = await (0, supertest_1.default)(app).post("/api/products")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
            name: "Delete Target",
            description: "Will be deleted",
            price: 1,
            category: "Test",
            imageUrl: "https://example.com/img.jpg",
            stock: 1,
        });
        const id = created.body.data.id;
        const del = await (0, supertest_1.default)(app).delete(`/api/products/${id}`).set("Authorization", `Bearer ${adminToken}`);
        expect(del.status).toBe(200);
        const get = await (0, supertest_1.default)(app).get(`/api/products/${id}`);
        expect(get.status).toBe(404);
    });
    it("GET /api/products/:id/stock returns stock count", async () => {
        const created = await (0, supertest_1.default)(app).post("/api/products")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
            name: "Stock Check Item",
            description: "Testing stock endpoint",
            price: 10,
            category: "Test",
            imageUrl: "https://example.com/img.jpg",
            stock: 7,
        });
        const id = created.body.data.id;
        const res = await (0, supertest_1.default)(app).get(`/api/products/${id}/stock`);
        expect(res.status).toBe(200);
        expect(res.body.data.stock).toBe(7);
    });
});
// ─── Cart logic unit tests (pure functions) ───────────────────────────────────
describe("Cart logic (stock enforcement)", () => {
    function addToCart(cart, product, qty = 1) {
        if (product.stock <= 0) {
            return { cart, error: "This product is out of stock" };
        }
        const existing = cart.find((item) => item.productId === product.id);
        const currentQty = existing?.quantity ?? 0;
        if (currentQty + qty > product.stock) {
            return {
                cart,
                error: `Only ${product.stock} unit(s) available. You already have ${currentQty} in cart.`,
            };
        }
        if (existing) {
            return {
                cart: cart.map((item) => item.productId === product.id
                    ? { ...item, quantity: item.quantity + qty }
                    : item),
            };
        }
        return {
            cart: [
                ...cart,
                {
                    productId: product.id,
                    name: product.name,
                    price: product.price,
                    quantity: qty,
                    stock: product.stock,
                    imageUrl: product.imageUrl,
                },
            ],
        };
    }
    function removeFromCart(cart, productId) {
        return cart.filter((item) => item.productId !== productId);
    }
    function updateQuantity(cart, productId, qty, stock) {
        if (qty < 0)
            return { cart, error: "Quantity cannot be negative" };
        if (qty > stock)
            return { cart, error: `Only ${stock} unit(s) available` };
        if (qty === 0)
            return { cart: removeFromCart(cart, productId) };
        return {
            cart: cart.map((item) => item.productId === productId ? { ...item, quantity: qty } : item),
        };
    }
    function cartTotal(cart) {
        return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }
    const mockProduct = {
        id: 1,
        name: "Test Product",
        price: 100,
        stock: 3,
        imageUrl: "https://example.com/img.jpg",
    };
    it("adds a product to an empty cart", () => {
        const { cart, error } = addToCart([], mockProduct);
        expect(error).toBeUndefined();
        expect(cart.length).toBe(1);
        expect(cart[0].quantity).toBe(1);
    });
    it("increments quantity for existing cart item", () => {
        const { cart: cart1 } = addToCart([], mockProduct);
        const { cart: cart2 } = addToCart(cart1, mockProduct);
        expect(cart2[0].quantity).toBe(2);
    });
    it("blocks adding out-of-stock product", () => {
        const outOfStock = { ...mockProduct, stock: 0 };
        const { cart, error } = addToCart([], outOfStock);
        expect(error).toBeDefined();
        expect(cart.length).toBe(0);
    });
    it("enforces stock limit — cannot exceed stock", () => {
        // stock = 3, try to add 4
        const { cart: cart1 } = addToCart([], mockProduct);
        const { cart: cart2 } = addToCart(cart1, mockProduct);
        const { cart: cart3 } = addToCart(cart2, mockProduct);
        expect(cart3[0].quantity).toBe(3); // at stock limit
        const { cart: cart4, error } = addToCart(cart3, mockProduct);
        expect(error).toBeDefined();
        expect(cart4[0].quantity).toBe(3); // unchanged
    });
    it("removes a product from cart", () => {
        const { cart } = addToCart([], mockProduct);
        const removed = removeFromCart(cart, mockProduct.id);
        expect(removed.length).toBe(0);
    });
    it("calculates cart total correctly", () => {
        const p1 = { id: 1, name: "P1", price: 100, stock: 10, imageUrl: "" };
        const p2 = { id: 2, name: "P2", price: 250, stock: 10, imageUrl: "" };
        const { cart: c1 } = addToCart([], p1, 2);
        const { cart: c2 } = addToCart(c1, p2, 3);
        // 2*100 + 3*250 = 200 + 750 = 950
        expect(cartTotal(c2)).toBe(950);
    });
    it("blocks quantity update beyond stock", () => {
        const { cart } = addToCart([], mockProduct);
        const { error } = updateQuantity(cart, mockProduct.id, 10, mockProduct.stock);
        expect(error).toBeDefined();
    });
    it("removes item when quantity set to 0", () => {
        const { cart } = addToCart([], mockProduct);
        const { cart: updated } = updateQuantity(cart, mockProduct.id, 0, mockProduct.stock);
        expect(updated.length).toBe(0);
    });
});
// ─── Model helper tests ───────────────────────────────────────────────────────
describe("getAvailability()", () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getAvailability } = require("../models/product.model");
    it("returns out_of_stock for 0", () => {
        expect(getAvailability(0)).toBe("out_of_stock");
    });
    it("returns low_stock for 1–5", () => {
        expect(getAvailability(1)).toBe("low_stock");
        expect(getAvailability(5)).toBe("low_stock");
    });
    it("returns in_stock for 6+", () => {
        expect(getAvailability(6)).toBe("in_stock");
        expect(getAvailability(100)).toBe("in_stock");
    });
});
//# sourceMappingURL=products.test.js.map