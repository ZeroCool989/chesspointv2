import mongoose from 'mongoose';

/**
 * Connect to MongoDB Atlas
 * Uses MONGODB_URI environment variable
 */
export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }

    // Connect to MongoDB with recommended options
    await mongoose.connect(mongoUri);

    console.log('✓ Connected to MongoDB Atlas (Database: chesspoint)');

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
