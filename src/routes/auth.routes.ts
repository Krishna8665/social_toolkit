// src/routes/auth.routes.ts
import { Router, Request, Response } from "express";
import passport from "../config/passport.js";
import { register, login } from "../controllers/auth.controller.js";
import { generateToken } from "../utils/jwt.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);

// Google OAuth — initiate
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

// Google OAuth callback — register or login and redirect with JWT
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.FRONTEND_URL || "http://localhost:3000"}/login?error=google_failed`,
  }),
  (req: Request, res: Response) => {
    const user = req.user as any;
    if (!user)
      return res.redirect(
        `${process.env.FRONTEND_URL || "http://localhost:3000"}/login?error=no_user`,
      );

    const token = generateToken(user);
    // Redirect to frontend with token (frontend should store it)
    res.redirect(
      `${process.env.FRONTEND_URL || "http://localhost:3000"}/dashboard?token=${token}`,
    );
  },
);

export default router;
