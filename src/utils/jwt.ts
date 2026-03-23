// src/utils/jwt.ts
import jwt from "jsonwebtoken";
import { IUser } from "../models/Users.js";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in .env");
}

export const generateToken = (user: IUser): string => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      plan: user.plan,
    },
    JWT_SECRET,
    { expiresIn: "7d" }, // or '30d' etc.
  );
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      plan: "free" | "pro" | "premium";
      iat: number;
      exp: number;
    };
  } catch (err) {
    return null;
  }
};
