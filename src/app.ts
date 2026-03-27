// src/index.ts
import express, { Request, Response } from "express";
import mongoose from "mongoose";
import passport from "./config/passport.js"; // note: import after db connect
import session from "express-session"; // we'll use temporary session for OAuth flow
import authRoutes from "./routes/auth.routes.js";
import cors from "cors";
import testRoutes from "./routes/test.routes.js";

const app = express();

app.get("/", (req, res) => {
  res.send("Hello from modern Express + TypeScript");
});

app.use(
  session({
    secret: process.env.JWT_SECRET!,
    resave: false,
    saveUninitialized: false,
  }),
);

app.use(passport.initialize());
app.use(passport.session());
app.use("/api/test", testRoutes);

// Note: Google OAuth routes are handled in `src/routes/auth.routes.ts`


// ... after app = express()
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5000" }));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

// Test route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", dbConnected: mongoose.connection.readyState === 1 });
});
export default app;
//