// src/types/express.d.ts
import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        plan: "free" | "pro" | "premium";
        // we can add more fields later
      };
    }
  }
}

export {};
