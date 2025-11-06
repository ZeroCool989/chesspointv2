import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from '../models/User';

dotenv.config();

/**
 * Database setup script
 * Creates necessary indexes and applies schema validation
 *
 * Run with: npm run setup-db
 */

async function setupDatabase() {
  try {
    console.log('Setting up database...');

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }

    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB');

    // Create indexes
    console.log('\nCreating indexes...');

    // Case-insensitive unique index on email
    await User.collection.createIndex(
      { email: 1 },
      {
        unique: true,
        collation: { locale: 'en', strength: 2 },
        name: 'email_unique_case_insensitive',
      }
    );
    console.log('✓ Created unique case-insensitive index on email');

    // Optional: Index on refreshTokenVersion for faster lookups
    await User.collection.createIndex(
      { refreshTokenVersion: 1 },
      { name: 'refreshTokenVersion_index' }
    );
    console.log('✓ Created index on refreshTokenVersion');

    // List all indexes
    console.log('\nCurrent indexes on users collection:');
    const indexes = await User.collection.indexes();
    indexes.forEach((index) => {
      console.log(`  - ${index.name}:`, JSON.stringify(index.key));
    });

    // Optional: Apply JSON schema validation
    console.log('\nApplying JSON schema validation...');
    if (!mongoose.connection.db) {
      throw new Error('Database connection not established');
    }
    await mongoose.connection.db.command({
      collMod: 'users',
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['email', 'passwordHash', 'emailVerified', 'roles'],
          properties: {
            email: {
              bsonType: 'string',
              pattern: '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$',
              description: 'Must be a valid lowercase email address',
            },
            passwordHash: {
              bsonType: 'string',
              minLength: 50,
              description: 'Must be a bcrypt hash (60 characters)',
            },
            username: {
              bsonType: ['string', 'null'],
              maxLength: 40,
              description: 'Optional username, max 40 characters',
            },
            emailVerified: {
              bsonType: 'bool',
              description: 'Email verification status',
            },
            roles: {
              bsonType: 'array',
              items: {
                bsonType: 'string',
              },
              description: 'Array of user roles',
            },
            refreshToken: {
              bsonType: ['string', 'null'],
              description: 'Hashed refresh token',
            },
            refreshTokenVersion: {
              bsonType: 'int',
              minimum: 0,
              description: 'Token version for invalidation',
            },
            lastLoginAt: {
              bsonType: ['date', 'null'],
              description: 'Last login timestamp',
            },
            createdAt: {
              bsonType: 'date',
              description: 'Account creation timestamp',
            },
            updatedAt: {
              bsonType: 'date',
              description: 'Last update timestamp',
            },
          },
        },
      },
      validationLevel: 'moderate', // Only validate inserts and updates
      validationAction: 'error', // Reject invalid documents
    });
    console.log('✓ JSON schema validation applied');

    console.log('\n✅ Database setup completed successfully!');
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n✓ Disconnected from MongoDB');
  }
}

setupDatabase();
