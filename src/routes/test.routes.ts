// src/routes/test.routes.ts
import { Router, Request, Response, NextFunction } from "express";

const router = Router();

// Simple protect middleware fallback for the test route.
// If you have a centralized auth middleware, replace this import with that.
const protect = (req: Request, res: Response, next: NextFunction) => {
  // Example check: require an Authorization header with any value.
  const auth = req.headers.authorization;
  if (!auth) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  // In a real app you'd verify a token here and attach the user to req.user
  // e.g., req.user = verifyToken(auth.split(' ')[1])
  (req as any).user = { id: "test-user", auth };
  return next();
};

router.get("/protected", protect, (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "You are authenticated!",
    user: (req as any).user,
  });
});

export default router;
