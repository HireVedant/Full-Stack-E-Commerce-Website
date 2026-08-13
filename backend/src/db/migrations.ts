import type Database from "better-sqlite3";

export function runMigrations(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT    NOT NULL,
      description TEXT    NOT NULL,
      price       REAL    NOT NULL CHECK(price >= 0),
      category    TEXT    NOT NULL,
      image_url   TEXT    NOT NULL,
      stock       INTEGER NOT NULL DEFAULT 0 CHECK(stock >= 0),
      created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TRIGGER IF NOT EXISTS products_updated_at
    AFTER UPDATE ON products
    FOR EACH ROW
    BEGIN
      UPDATE products SET updated_at = datetime('now') WHERE id = OLD.id;
    END;
    CREATE TABLE IF NOT EXISTS users (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT    NOT NULL,
      email      TEXT    NOT NULL UNIQUE,
      password   TEXT    NOT NULL,
      role       TEXT    NOT NULL DEFAULT 'user' CHECK(role IN ('user', 'admin')),
      created_at TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TRIGGER IF NOT EXISTS users_updated_at
    AFTER UPDATE ON users
    FOR EACH ROW
    BEGIN
      UPDATE users SET updated_at = datetime('now') WHERE id = OLD.id;
    END;

    CREATE TABLE IF NOT EXISTS orders (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id      INTEGER NOT NULL,
      total_amount REAL    NOT NULL CHECK(total_amount >= 0),
      discount_amount REAL NOT NULL DEFAULT 0 CHECK(discount_amount >= 0),
      coupon_code  TEXT,
      status       TEXT    NOT NULL DEFAULT 'Processing' CHECK(status IN ('Processing', 'Shipped', 'Delivered', 'Cancelled')),
      payment_status TEXT  NOT NULL DEFAULT 'Pending' CHECK(payment_status IN ('Pending', 'Paid', 'Failed')),
      razorpay_order_id TEXT,
      razorpay_payment_id TEXT,
      created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at   TEXT    NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TRIGGER IF NOT EXISTS orders_updated_at
    AFTER UPDATE ON orders
    FOR EACH ROW
    BEGIN
      UPDATE orders SET updated_at = datetime('now') WHERE id = OLD.id;
    END;

    CREATE TABLE IF NOT EXISTS order_items (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id   INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity   INTEGER NOT NULL CHECK(quantity > 0),
      price      REAL    NOT NULL CHECK(price >= 0),
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS wishlists (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      created_at TEXT    NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, product_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      rating     INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      comment    TEXT    NOT NULL,
      created_at TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT    NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TRIGGER IF NOT EXISTS reviews_updated_at
    AFTER UPDATE ON reviews
    FOR EACH ROW
    BEGIN
      UPDATE reviews SET updated_at = datetime('now') WHERE id = OLD.id;
    END;

    CREATE TABLE IF NOT EXISTS coupons (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      code       TEXT    NOT NULL UNIQUE,
      discount_percentage REAL NOT NULL CHECK(discount_percentage > 0 AND discount_percentage <= 100),
      is_active  INTEGER NOT NULL DEFAULT 1 CHECK(is_active IN (0, 1)),
      created_at TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `);
}
