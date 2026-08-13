import type Database from "better-sqlite3";
import bcrypt from "bcrypt";
import { getDb } from "../db/connection";
import { rowToUser, type RegisterInput, type LoginInput, type User, type UserRow } from "../models/user.model";

export class UserService {
  private db: Database.Database;

  constructor(db?: Database.Database) {
    this.db = db ?? getDb();
  }

  async register(input: RegisterInput): Promise<User> {
    const existing = this.db.prepare("SELECT * FROM users WHERE email = ?").get(input.email);
    if (existing) {
      throw new Error("Email already registered");
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);
    
    // First user defaults to admin if we want, or just user. For simplicity, just user.
    // Let's make it standard 'user'
    const role = "user";

    const result = this.db.prepare(
      `INSERT INTO users (name, email, password, role) VALUES (@name, @email, @password, @role) RETURNING *`
    ).get({
      name: input.name,
      email: input.email,
      password: hashedPassword,
      role
    }) as UserRow;

    return rowToUser(result);
  }

  async login(input: LoginInput): Promise<User> {
    const row = this.db.prepare("SELECT * FROM users WHERE email = ?").get(input.email) as UserRow | undefined;
    if (!row || !row.password) {
      throw new Error("Invalid email or password");
    }

    const valid = await bcrypt.compare(input.password, row.password);
    if (!valid) {
      throw new Error("Invalid email or password");
    }

    return rowToUser(row);
  }

  getById(id: number): User | null {
    const row = this.db.prepare("SELECT * FROM users WHERE id = ?").get(id) as UserRow | undefined;
    return row ? rowToUser(row) : null;
  }
}
