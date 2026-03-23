import "dotenv/config";
import mongoose from "mongoose";

const url = process.env.MONGODB_URL || "mongodb://127.0.0.1:27017/socialmedia";

async function main() {
  try {
    await mongoose.connect(url, { autoIndex: false });
    const users = await mongoose.connection.db
      .collection("users")
      .find()
      .sort({ _id: -1 })
      .limit(20)
      .toArray();

    console.log(`Connected to ${url}`);
    console.log(`Found ${users.length} users (most recent first):`);
    console.dir(users, { depth: 2 });
  } catch (err) {
    console.error("Error querying users:", err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

main();
