import mongoose from 'mongoose';

/**
 * Connect to MongoDB Atlas
 * Uses MONGODB_URI environment variable
 */
export const connectDatabase = async (): Promise<void> => {
  try {
    let mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }

    // Ensure database name is specified in connection string
    // MongoDB URI format: mongodb+srv://user:pass@cluster.mongodb.net/databaseName?options
    // Parse the URI to check if database name exists
    try {
      const url = new URL(mongoUri.replace('mongodb+srv://', 'https://'));
      const pathname = url.pathname;
      
      // If pathname is empty or just '/', add database name
      if (!pathname || pathname === '/' || pathname.trim() === '') {
        // No database name in URI, add /chess
        const separator = mongoUri.includes('?') ? '?' : '';
        const queryString = separator ? mongoUri.split('?')[1] : '';
        const baseUri = mongoUri.split('?')[0];
        
        // Remove trailing slash if present
        const cleanBase = baseUri.endsWith('/') ? baseUri.slice(0, -1) : baseUri;
        mongoUri = queryString ? `${cleanBase}/chess?${queryString}` : `${cleanBase}/chess`;
        console.log('⚠️  No database name in MONGODB_URI, using "chess" database');
      }
    } catch (e) {
      // If URL parsing fails, try simple string manipulation
      // Check if URI ends with cluster name (no /databaseName)
      if (!mongoUri.match(/\/[^\/\?]+(\?|$)/)) {
        // No database name, add it
        if (mongoUri.includes('?')) {
          mongoUri = mongoUri.replace('?', '/chess?');
        } else {
          mongoUri = mongoUri.endsWith('/') ? mongoUri + 'chess' : mongoUri + '/chess';
        }
        console.log('⚠️  No database name in MONGODB_URI, using "chess" database');
      }
    }

    // Connect to MongoDB with recommended options
    await mongoose.connect(mongoUri);

    // Get the actual database name from the connection
    const dbName = mongoose.connection.db?.databaseName || 'unknown';
    console.log(`✓ Connected to MongoDB Atlas (Database: ${dbName})`);
    console.log(`📌 Models (User, LoginLog, Puzzle) will use this database: ${dbName}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    console.warn('⚠️  Server will start WITHOUT database connection (read-only mode)');
    console.warn('⚠️  Authentication and feedback features will not work');
    console.warn('⚠️  Please whitelist your IP in MongoDB Atlas to enable full functionality');
  }
};
