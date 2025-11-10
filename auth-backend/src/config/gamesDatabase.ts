import mongoose, { Connection } from 'mongoose';

/**
 * Separate MongoDB connection for Games database (gamesDB)
 * This allows Games to be stored in a different database than Users/LoginLogs
 */
let gamesConnection: Connection | null = null;

export const connectGamesDatabase = async (): Promise<void> => {
  try {
    // Get base MongoDB URI (without database name)
    let baseUri = process.env.MONGODB_URI;
    
    if (!baseUri) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }

    // Extract base URI and replace database name with gamesDB
    // Format: mongodb+srv://user:pass@cluster.mongodb.net/databaseName?options
    let mongoUri: string;
    
    // Remove existing database name and add gamesDB
    // Pattern: mongodb+srv://...@cluster.net[/database]?options
    const match = baseUri.match(/^(mongodb\+srv:\/\/[^\/]+)(\/[^\/\?]+)?(\?.*)?$/);
    if (match) {
      const [, base, , query] = match;
      mongoUri = query ? `${base}/gamesDB${query}` : `${base}/gamesDB`;
    } else {
      // Fallback: append /gamesDB
      mongoUri = baseUri.endsWith('/') 
        ? `${baseUri}gamesDB` 
        : `${baseUri}/gamesDB`;
    }
    
    console.log(`🔗 Connecting to Games Database: gamesDB`);

    // Create separate connection for games database
    gamesConnection = mongoose.createConnection(mongoUri);
    
    // Wait for connection to be established
    await new Promise<void>((resolve, reject) => {
      if (gamesConnection!.readyState === 1) {
        // Already connected
        resolve();
        return;
      }
      
      gamesConnection!.once('connected', () => {
        const dbName = gamesConnection!.db?.databaseName || 'unknown';
        console.log(`✓ Connected to Games Database: ${dbName}`);
        console.log(`📌 Game Model will use this database: ${dbName}`);
        resolve();
      });
      gamesConnection!.once('error', reject);
    });

    // Handle connection events
    gamesConnection.on('error', (err) => {
      console.error('Games database connection error:', err);
    });

    gamesConnection.on('disconnected', () => {
      console.log('Games database disconnected');
    });
  } catch (error) {
    console.error('Failed to connect to Games database:', error);
    console.warn('⚠️  Games will not be saved to MongoDB');
  }
};

export const getGamesConnection = (): Connection => {
  if (!gamesConnection) {
    throw new Error('Games database not initialized. Call connectGamesDatabase() first.');
  }
  return gamesConnection;
};

export const disconnectGamesDatabase = async (): Promise<void> => {
  if (gamesConnection) {
    await gamesConnection.close();
    gamesConnection = null;
  }
};

