// src/config/passport.ts
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/Users.js";
import { generateToken } from "../utils/jwt.js";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL =
  process.env.GOOGLE_CALLBACK_URL ||
  "http://localhost:5000/api/auth/google/callback";

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.warn("Google OAuth credentials missing — skipping setup");
} else {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: GOOGLE_CALLBACK_URL,
        scope: ["profile", "email"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            // Existing Google user — update email if changed
            if (user.email !== profile.emails?.[0].value) {
              user.email = profile.emails?.[0].value || user.email;
              await user.save();
            }
          } else {
            // New user via Google — create free plan
            const email = profile.emails?.[0].value;
            if (!email) return done(new Error("No email from Google"));

            user = await User.create({
              googleId: profile.id,
              email,
              plan: "free",
              credits: 10,
              lastCreditReset: new Date(),
            });
          }

          done(null, user);
        } catch (err) {
          done(err);
        }
      },
    ),
  );

  // Serialize user to session (but since we use JWT, we mostly won't need sessions)
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
}

export default passport;
