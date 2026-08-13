"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDb = getDb;
exports.closeDb = closeDb;
exports.createTestDb = createTestDb;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const DATA_DIR = path_1.default.join(__dirname, "../../data");
const DB_PATH = path_1.default.join(DATA_DIR, "ecommerce.db");
// Ensure data directory exists
if (!fs_1.default.existsSync(DATA_DIR)) {
    fs_1.default.mkdirSync(DATA_DIR, { recursive: true });
}
let _db = null;
function getDb() {
    if (!_db) {
        _db = new better_sqlite3_1.default(DB_PATH);
        _db.pragma("journal_mode = WAL");
        _db.pragma("foreign_keys = ON");
    }
    return _db;
}
function closeDb() {
    if (_db) {
        _db.close();
        _db = null;
    }
}
/** Creates an in-memory DB for testing */
function createTestDb() {
    const db = new better_sqlite3_1.default(":memory:");
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    return db;
}
//# sourceMappingURL=connection.js.map