import type Database from "better-sqlite3";
import { type RegisterInput, type LoginInput, type User } from "../models/user.model";
export declare class UserService {
    private db;
    constructor(db?: Database.Database);
    register(input: RegisterInput): Promise<User>;
    login(input: LoginInput): Promise<User>;
    getById(id: number): User | null;
}
//# sourceMappingURL=user.service.d.ts.map