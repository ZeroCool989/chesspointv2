import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { connectDatabase } from '../config/database';
import { User } from '../models/User';
import { LoginLog } from '../models/LoginLog';

// Load environment variables
dotenv.config();

/**
 * Seed script to populate database with test data
 * Usage: npm run seed
 */
async function seed() {
  try {
    console.log('🌱 Starting database seed...\n');

    // Connect to database
    await connectDatabase();

    // Clear existing data (CAUTION: This deletes everything!)
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await LoginLog.deleteMany({});
    console.log('✓ Cleared users and login logs\n');

    // Create test users
    console.log('👤 Creating test users...');

    const testUsers = [
      {
        email: 'admin@chesspoint.io',
        password: 'Admin123!',
        username: 'admin',
        roles: ['user', 'admin'],
        emailVerified: true,
      },
      {
        email: 'test@chesspoint.io',
        password: 'Test123!',
        username: 'testuser',
        roles: ['user'],
        emailVerified: true,
      },
      {
        email: 'demo@chesspoint.io',
        password: 'Demo123!',
        username: 'demo',
        roles: ['user'],
        emailVerified: false,
      },
    ];

    for (const userData of testUsers) {
      const passwordHash = await bcrypt.hash(userData.password, 12);

      const user = await User.create({
        email: userData.email,
        passwordHash,
        username: userData.username,
        roles: userData.roles,
        emailVerified: userData.emailVerified,
        refreshTokenVersion: 0,
      });

      console.log(`  ✓ Created user: ${user.email} (${user.username})`);
    }

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('  Admin: admin@chesspoint.io / Admin123!');
    console.log('  User:  test@chesspoint.io / Test123!');
    console.log('  Demo:  demo@chesspoint.io / Demo123!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

// Run seed
seed();
