"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const connection_1 = require("./db/connection");
const migrations_1 = require("./db/migrations");
const seed_1 = require("./db/seed");
const app_1 = require("./app");
const PORT = parseInt(process.env.PORT ?? "4000", 10);
// Initialize database
const db = (0, connection_1.getDb)();
(0, migrations_1.runMigrations)(db);
(0, seed_1.seedProducts)(db);
// Start server
const app = (0, app_1.createApp)();
app.listen(PORT, () => {
    console.log(`[Server] E-Commerce API running on http://localhost:${PORT}`);
    console.log(`[Server] Health check: http://localhost:${PORT}/api/health`);
    console.log(`[Server] Products API: http://localhost:${PORT}/api/products`);
});
//# sourceMappingURL=index.js.map