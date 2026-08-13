"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const connection_1 = require("../db/connection");
const user_model_1 = require("../models/user.model");
class UserService {
    constructor(db) {
        this.db = db ?? (0, connection_1.getDb)();
    }
    async register(input) {
        const existing = this.db.prepare("SELECT * FROM users WHERE email = ?").get(input.email);
        if (existing) {
            throw new Error("Email already registered");
        }
        const hashedPassword = await bcrypt_1.default.hash(input.password, 10);
        // First user defaults to admin if we want, or just user. For simplicity, just user.
        // Let's make it standard 'user'
        const role = "user";
        const result = this.db.prepare(`INSERT INTO users (name, email, password, role) VALUES (@name, @email, @password, @role) RETURNING *`).get({
            name: input.name,
            email: input.email,
            password: hashedPassword,
            role
        });
        return (0, user_model_1.rowToUser)(result);
    }
    async login(input) {
        const row = this.db.prepare("SELECT * FROM users WHERE email = ?").get(input.email);
        if (!row || !row.password) {
            throw new Error("Invalid email or password");
        }
        const valid = await bcrypt_1.default.compare(input.password, row.password);
        if (!valid) {
            throw new Error("Invalid email or password");
        }
        return (0, user_model_1.rowToUser)(row);
    }
    getById(id) {
        const row = this.db.prepare("SELECT * FROM users WHERE id = ?").get(id);
        return row ? (0, user_model_1.rowToUser)(row) : null;
    }
}
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map