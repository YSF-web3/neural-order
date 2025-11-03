/**
 * MongoDB Connection Utility
 * Handles connection to MongoDB Atlas
 */

import mongoose from "mongoose";

// MongoDB URI - must be set via environment variable
const MONGODB_URI = process.env.MONGODB_URI || '';

// Warn if using old database (check for asterroyale but not asterroyale2)
const dbNameMatch = MONGODB_URI.match(/\/([^?]+)/);
const dbName = dbNameMatch ? dbNameMatch[1] : '';
if (dbName === 'asterroyale') {
  console.warn('⚠️  WARNING: Connected to old database (asterroyale). Update .env.local to use asterroyale2');
}

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections from growing exponentially
 * during API Route usage.
 */
let cached: any = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      // Extract database name from URI for logging
      const dbName = MONGODB_URI.match(/\/([^?]+)/)?.[1] || 'unknown';
      console.log(`✅ Connected to MongoDB (database: ${dbName})`);
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;

