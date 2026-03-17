// src/index.ts
console.log("Backend alive! Using ESM + tsx 🚀");

import dotenv from "dotenv";
import express from "express";

// Load environment variables from .env
dotenv.config();

const app = express();

app.get("/", (req, res) => {
  res.send("Hello from modern Express + TypeScript");
});

// Use PORT from environment or default to 4000
const port = Number(process.env.PORT ?? 4000);

const server = app.listen(port, () => {
  console.log(`Server running → http://localhost:${port}`);
});

server.on("error", (err: any) => {
  if (err && err.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use. `);
    process.exit(1);
  }
  console.error("Server error:", err);
  process.exit(1);
});
