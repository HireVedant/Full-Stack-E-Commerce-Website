"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedProducts = seedProducts;
const connection_1 = require("./connection");
/**
 * Seed the database with sample products if the products table is empty.
 */
function seedProducts(db) {
    const database = db ?? (0, connection_1.getDb)();
    const userCount = database.prepare("SELECT COUNT(*) as c FROM users").get().c;
    if (userCount === 0) {
        const bcrypt = require("bcrypt");
        const hash = bcrypt.hashSync("admin123", 10);
        const userHash = bcrypt.hashSync("user123", 10);
        database.prepare(`
      INSERT INTO users (name, email, password, role) 
      VALUES ('Admin User', 'admin@example.com', ?, 'admin'),
             ('Test User', 'user@example.com', ?, 'user')
    `).run(hash, userHash);
    }
    const count = database.prepare("SELECT COUNT(*) as c FROM products").get().c;
    if (count === 0) {
        const insert = database.prepare(`
      INSERT INTO products (name, description, price, category, image_url, stock)
      VALUES (@name, @description, @price, @category, @image_url, @stock)
    `);
        // (Seed data array is omitted for brevity, but it's passed here)
        const seedData = [
            { name: "Classic White Sneakers", description: "Premium leather white sneakers with cushioned sole. Perfect for casual wear or light sports activities. Features breathable mesh lining and durable rubber outsole.", price: 2499, category: "Footwear", image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80", stock: 15 },
            { name: "Slim Fit Denim Jeans", description: "Modern slim-fit jeans crafted from premium stretch denim. Features five-pocket styling with a comfortable mid-rise waist. Machine washable.", price: 1899, category: "Clothing", image_url: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80", stock: 30 },
            { name: "Wireless Bluetooth Headphones", description: "Over-ear noise-cancelling headphones with 30-hour battery life. Superior sound quality with deep bass and crisp highs. Foldable design for portability.", price: 4999, category: "Electronics", image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80", stock: 8 },
            { name: "Stainless Steel Water Bottle", description: "Double-wall vacuum insulated bottle keeps drinks cold 24 hours or hot 12 hours. BPA-free, leak-proof lid. 750ml capacity.", price: 799, category: "Sports & Outdoors", image_url: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=80", stock: 50 },
            { name: "Leather Crossbody Bag", description: "Genuine leather crossbody bag with adjustable strap. Multiple compartments for organized storage. Suitable for everyday use or travel.", price: 3299, category: "Accessories", image_url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80", stock: 12 },
            { name: "Smart Fitness Watch", description: "Track your health with heart rate monitoring, sleep tracking, and GPS. 7-day battery life. Compatible with iOS and Android. IP68 water-resistant.", price: 7999, category: "Electronics", image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80", stock: 5 },
            { name: "Organic Cotton T-Shirt", description: "Soft 100% organic cotton t-shirt with relaxed fit. Available in multiple colors. Sustainably sourced and ethically manufactured. Pre-shrunk fabric.", price: 599, category: "Clothing", image_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80", stock: 100 },
            { name: "Running Shoes - Pro Series", description: "Lightweight performance running shoes with energy-return foam midsole. Breathable engineered knit upper. Suitable for road and track running.", price: 5499, category: "Footwear", image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80", stock: 20 },
            { name: "Portable Bluetooth Speaker", description: "360° surround sound with 12-hour playtime. IPX7 waterproof rating. Built-in microphone for hands-free calls. USB-C charging.", price: 2199, category: "Electronics", image_url: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=80", stock: 3 },
            { name: "Yoga Mat Premium", description: "6mm thick non-slip yoga mat made from eco-friendly TPE material. Includes carrying strap. Suitable for yoga, pilates, and floor exercises.", price: 1299, category: "Sports & Outdoors", image_url: "https://images.unsplash.com/photo-1601925228100-13d70af54c2a?w=600&q=80", stock: 0 },
            { name: "Ceramic Coffee Mug Set", description: "Set of 4 hand-crafted ceramic mugs, 350ml each. Microwave and dishwasher safe. Minimalist design complements any kitchen aesthetic.", price: 899, category: "Home & Kitchen", image_url: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&q=80", stock: 25 },
            { name: "Mechanical Keyboard", description: "TKL mechanical keyboard with Cherry MX Blue switches. RGB backlit with 16.7M color options. Aluminum top plate for durability.", price: 6499, category: "Electronics", image_url: "https://images.unsplash.com/photo-1595044426077-d36d9236d44a?w=600&q=80", stock: 2 },
        ];
        const insertMany = database.transaction((products) => {
            for (const product of products) {
                insert.run(product);
            }
        });
        insertMany(seedData);
    }
    const couponCount = database.prepare("SELECT COUNT(*) as c FROM coupons").get().c;
    if (couponCount === 0) {
        database.prepare(`
      INSERT INTO coupons (code, discount_percentage) VALUES ('ACM10', 10)
    `).run();
    }
}
//# sourceMappingURL=seed.js.map