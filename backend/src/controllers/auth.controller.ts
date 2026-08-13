import { Request, Response } from "express";
import { ZodError } from "zod";
import jwt from "jsonwebtoken";
import { UserService } from "../services/user.service";
import { RegisterSchema, LoginSchema } from "../models/user.model";
import { JWT_SECRET } from "../middleware/auth.middleware";

function formatZodError(err: ZodError): Record<string, string[]> {
  const errors: Record<string, string[]> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "root";
    if (!errors[key]) errors[key] = [];
    errors[key].push(issue.message);
  }
  return errors;
}

export function makeAuthControllers(svc: UserService) {
  function register(req: Request, res: Response): void {
    try {
      const input = RegisterSchema.parse(req.body);
      svc.register(input)
        .then(user => {
          const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
          res.status(201).json({ success: true, data: { user, token } });
        })
        .catch(err => {
          res.status(400).json({ success: false, message: err.message });
        });
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({ success: false, errors: formatZodError(err) });
      } else {
        res.status(500).json({ success: false, message: "Registration failed" });
      }
    }
  }

  function login(req: Request, res: Response): void {
    try {
      const input = LoginSchema.parse(req.body);
      svc.login(input)
        .then(user => {
          const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
          res.json({ success: true, data: { user, token } });
        })
        .catch(err => {
          res.status(401).json({ success: false, message: err.message });
        });
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({ success: false, errors: formatZodError(err) });
      } else {
        res.status(500).json({ success: false, message: "Login failed" });
      }
    }
  }

  function getProfile(req: Request, res: Response): void {
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
    } catch {
      res.status(500).json({ success: false, message: "Failed to fetch profile" });
    }
  }

  return { register, login, getProfile };
}
