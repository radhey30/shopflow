import mongoose from "mongoose";
import dns from "node:dns";

const connectDB = async (): Promise<void> => {
  try {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
    const conn = await mongoose.connect(process.env.MONGO_URI as string);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

export default connectDB;
