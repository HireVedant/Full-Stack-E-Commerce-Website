import "dotenv/config";
import { getDb } from "./db/connection";
import { runMigrations } from "./db/migrations";
import { seedProducts } from "./db/seed";
import { createApp } from "./app";

const PORT = parseInt(process.env.PORT ?? "4000", 10);

// Initialize database
const db = getDb();
runMigrations(db);
seedProducts(db);

// Start server
const app = createApp();
app.listen(PORT, () => {
  console.log(`[Server] E-Commerce API running on http://localhost:${PORT}`);
  console.log(`[Server] Health check: http://localhost:${PORT}/api/health`);
  console.log(`[Server] Products API: http://localhost:${PORT}/api/products`);
});
