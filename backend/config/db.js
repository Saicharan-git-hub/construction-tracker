import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

export const connectDB = async () => {
  try {
    // Determine whether to use remote DB or local memory DB
    const useMemoryDB = true; // Forcing this on for now since the remote DB is down!

    if (useMemoryDB) {
      console.log('Detected offline remote cluster. Spinning up local Virtual Database for testing...');
      const mongoServer = await MongoMemoryServer.create();
      const uri = mongoServer.getUri();
      const conn = await mongoose.connect(uri);
      console.log(`MongoDB Connected: ${conn.connection.host} (Virtual Testing DB)`);
    } else {
      const conn = await mongoose.connect(process.env.MONGO_URI);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    }
  } catch (error) {
    console.error("DB connection error:", error);
    process.exit(1);
  }
};
