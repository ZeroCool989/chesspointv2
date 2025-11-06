/**
 * MongoDB connection helper for feedback feature
 * Self-contained to avoid conflicts with existing code
 */

import { MongoClient, Db } from "mongodb";

// Use environment variables if available, otherwise use defaults for development
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const MONGODB_DB = process.env.MONGODB_DB || "chesspoint";

// Cached connection pattern (Next.js best practice)
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  // Return cached connection if available
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  try {
    // Create new connection
    const client = await MongoClient.connect(MONGODB_URI);
    const db = client.db(MONGODB_DB);

    // Cache for reuse
    cachedClient = client;
    cachedDb = db;

    return { client, db };
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    throw new Error('Database connection failed. Please check your MongoDB configuration.');
  }
}

/**
 * Get feedback collections
 */
export async function getFeedbackCollections() {
  const { db } = await connectToDatabase();

  return {
    threads: db.collection("feedback_threads"),
    comments: db.collection("feedback_comments"),
  };
}
