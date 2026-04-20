// src/middleware/plan.middleware.ts
import { Request, Response, NextFunction } from "express";
import { User } from "../models/Users.js";

// Note: We use `req as any` below when attaching runtime properties to avoid
// having to add a global declaration file. If you prefer, we can add
// `src/types/express.d.ts` with proper augmentation instead.

export interface AiRequestBody {
  // common fields for caption/hashtags/etc.
  topic?: string;
  tone?: string;
  keyword?: string;
  // add others as needed
}

export const checkAiAccess = async (
  req: Request<{}, {}, AiRequestBody>,
  res: Response,
  next: NextFunction,
) => {

  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, error: "Authentication required" });
    }

    const user = await User.findById((req.user as any).id);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // frontend can force mock with ?mock=true; default is real AI
    const forceMock = req.query.mock === "true";

    // Free users always get mock responses regardless of query
    if (user.plan === "free") {
      (req as any).isMock = true;
      (req as any).remainingCredits = user.credits ?? 0;
      return next();
    }

    // If client requested mock, honor it for all plans
    if (forceMock) {
      (req as any).isMock = true;
      (req as any).remainingCredits = user.credits ?? 0;
      return next();
    }

    // From here: client requested real AI
    (req as any).isMock = false;

    if (user.plan === "premium") {
      // Unlimited — no deduction
      (req as any).remainingCredits = Infinity as any;
      return next();
    }

    // Pro: check & deduct credits (1 credit per request)
    if ((user.credits ?? 0) <= 0) {
      return res.status(402).json({
        success: false,
        error:
          "No credits remaining. Upgrade to Premium or wait for monthly reset.",
        remainingCredits: 0,
        plan: user.plan,
      });
    }

    user.credits = (user.credits ?? 0) - 1;
    await user.save();

    (req as any).remainingCredits = user.credits;
    return next();
  } catch (err) {
    console.error("plan middleware error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};
