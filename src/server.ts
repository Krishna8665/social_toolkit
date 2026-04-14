// src/server.ts
import dotenv from "dotenv";
dotenv.config();
const { default: app } = await import("./app.js");
const { default: connectToDatabase } = await import("./config/db.js");

const port = Number(process.env.PORT ?? 5000);

const start = async () => {
  try {
    console.log(
      "Attempting to connect to MongoDB from server.ts...\n-> env MONGODB_URL:",
      process.env.MONGODB_URL || "(not set, using default)",
    );
    await connectToDatabase();
    console.log("✅ Database connected (server.ts)");
  } catch (err) {
    console.error("Failed to connect to the database, exiting.", err);
    process.exit(1);
  }

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
};

start();
