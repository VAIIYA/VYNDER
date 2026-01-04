import mongoose from "mongoose";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function connectDB(): Promise<typeof mongoose> {
  // Only access process.env on the server side when function is called
  const MONGODB_URI: string = process.env.MONGODB_URI || "";

  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not set. Please add it to your environment variables.");
  }

  // Return existing connection if available
  if (cached.conn) {
    // Check if connection is still alive
    if (mongoose.connection.readyState === 1) {
      return cached.conn;
    } else {
      // Connection is dead, reset cache
      cached.conn = null;
      cached.promise = null;
    }
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log("✅ MongoDB connected successfully");
        return mongoose;
      })
      .catch((error) => {
        cached.promise = null;
        console.error("❌ MongoDB connection error:", error.message);
        // Provide helpful error message
        if (error.message.includes("authentication failed")) {
          console.error("Check your MongoDB username and password");
        } else if (error.message.includes("ENOTFOUND") || error.message.includes("getaddrinfo")) {
          console.error("Check your MongoDB connection string and network access");
        } else if (error.message.includes("timeout")) {
          console.error("MongoDB connection timeout - check network access in MongoDB Atlas");
        }
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e: any) {
    cached.promise = null;
    console.error("❌ MongoDB connection failed:", e?.message || e);
    throw e;
  }

  return cached.conn;
}

export default connectDB;


