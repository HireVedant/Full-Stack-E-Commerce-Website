"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeAuthControllers = makeAuthControllers;
const zod_1 = require("zod");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = require("../models/user.model");
const auth_middleware_1 = require("../middleware/auth.middleware");
function formatZodError(err) {
    const errors = {};
    for (const issue of err.issues) {
        const key = issue.path.join(".") || "root";
        if (!errors[key])
            errors[key] = [];
        errors[key].push(issue.message);
    }
    return errors;
}
function makeAuthControllers(svc) {
    function register(req, res) {
        try {
            const input = user_model_1.RegisterSchema.parse(req.body);
            svc.register(input)
                .then(user => {
                const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, auth_middleware_1.JWT_SECRET, { expiresIn: "7d" });
                res.status(201).json({ success: true, data: { user, token } });
            })
                .catch(err => {
                res.status(400).json({ success: false, message: err.message });
            });
        }
        catch (err) {
            if (err instanceof zod_1.ZodError) {
                res.status(400).json({ success: false, errors: formatZodError(err) });
            }
            else {
                res.status(500).json({ success: false, message: "Registration failed" });
            }
        }
    }
    function login(req, res) {
        try {
            const input = user_model_1.LoginSchema.parse(req.body);
            svc.login(input)
                .then(user => {
                const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, auth_middleware_1.JWT_SECRET, { expiresIn: "7d" });
                res.json({ success: true, data: { user, token } });
            })
                .catch(err => {
                res.status(401).json({ success: false, message: err.message });
            });
        }
        catch (err) {
            if (err instanceof zod_1.ZodError) {
                res.status(400).json({ success: false, errors: formatZodError(err) });
            }
            else {
                res.status(500).json({ success: false, message: "Login failed" });
            }
        }
    }
    function getProfile(req, res) {
        if (!req.user) {
            res.status(401).json({ success: false, message: "Unauthorized" });
            return;
        }
        try {
            const user = svc.getById(req.user.id);
            if (!user) {
                res.status(404).json({ success: false, message: "User not found" });
                return;
            }
            res.json({ success: true, data: user });
        }
        catch {
            res.status(500).json({ success: false, message: "Failed to fetch profile" });
        }
    }
    return { register, login, getProfile };
}
//# sourceMappingURL=auth.controller.js.map