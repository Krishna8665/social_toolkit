import { config } from "dotenv";
config();

const envConfig = {
  portNumber: process.env.PORT ? parseInt(process.env.PORT, 10) : 4000,
  mongodbString:
    process.env.MONGODB_URL || "mongodb://127.0.0.1:27017/socialmedia",
  JWT_SECRET: process.env.JWT_SECRET,
};

export default envConfig;
