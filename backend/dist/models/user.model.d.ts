import { z } from "zod";
export interface UserRow {
    id: number;
    name: string;
    email: string;
    password?: string;
    role: "user" | "admin";
    created_at: string;
    updated_at: string;
}
export interface User {
    id: number;
    name: string;
    email: string;
    role: "user" | "admin";
    createdAt: string;
    updatedAt: string;
}
export declare const RegisterSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    email: string;
    password: string;
}, {
    name: string;
    email: string;
    password: string;
}>;
export declare const LoginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export declare function rowToUser(row: UserRow): User;
//# sourceMappingURL=user.model.d.ts.map