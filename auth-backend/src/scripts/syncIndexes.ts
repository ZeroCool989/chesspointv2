import dotenv from 'dotenv';
import { connectDatabase } from '../config/database';
import { User } from '../models/User';
import { LoginLog } from '../models/LoginLog';

// Load environment variables
dotenv.config();

/**
 * Sync MongoDB indexes with schema definitions
 * This removes old/duplicate indexes and creates new ones
 * Usage: npm run sync-indexes
 */
async function syncIndexes() {
  try {
    console.log('🔄 Syncing MongoDB indexes...\n');

    // Connect to database
    await connectDatabase();

    // List current indexes
    console.log('📋 Current indexes:');
    const userIndexes = await User.collection.getIndexes();
    console.log('  Users collection:', Object.keys(userIndexes).join(', '));

    const loginLogIndexes = await LoginLog.collection.getIndexes();
    console.log('  LoginLogs collection:', Object.keys(loginLogIndexes).join(', '));

    // Drop all indexes except _id
    console.log('\n🗑️  Dropping all custom indexes...');
    await User.collection.dropIndexes();
    await LoginLog.collection.dropIndexes();
    console.log('  ✓ Indexes dropped');

    // Recreate indexes from schema
    console.log('\n🔨 Creating indexes from schema...');
    await User.syncIndexes();
    await LoginLog.syncIndexes();
    console.log('  ✓ Indexes created');

    // Show new indexes
    console.log('\n✅ New indexes:');
    const newUserIndexes = await User.collection.getIndexes();
    console.log('  Users collection:', Object.keys(newUserIndexes).join(', '));

    const newLoginLogIndexes = await LoginLog.collection.getIndexes();
    console.log('  LoginLogs collection:', Object.keys(newLoginLogIndexes).join(', '));

    console.log('\n✨ Index sync complete!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Index sync failed:', error);
    process.exit(1);
  }
}

// Run sync
syncIndexes();
