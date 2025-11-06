import dotenv from 'dotenv';
import { connectDatabase } from '../config/database';
import Puzzle from '../models/Puzzle';

// Load environment variables
dotenv.config();

/**
 * Seed script to populate database with test puzzles
 * Usage: npx tsx src/scripts/seedPuzzles.ts
 */
async function seedPuzzles() {
  try {
    console.log('🌱 Starting puzzle seed...\n');

    // Connect to database
    await connectDatabase();

    // Clear existing puzzles (optional - comment out if you want to keep existing puzzles)
    console.log('🗑️  Clearing existing puzzles...');
    await Puzzle.deleteMany({});
    console.log('✓ Cleared existing puzzles\n');

    // Create test puzzles
    console.log('🧩 Creating test puzzles...');

    const testPuzzles = [
      {
        id: 'test001',
        fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3',
        moves: 'f1c4 g8f6 d2d3',
        rating: 1200,
        themes: ['opening', 'development'],
        url: 'https://lichess.org/training/test001',
      },
      {
        id: 'test002',
        fen: 'rnbqkb1r/pppp1ppp/5n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 3 3',
        moves: 'e1g1 f6e4 d2d4',
        rating: 1500,
        themes: ['opening', 'tactics'],
        url: 'https://lichess.org/training/test002',
      },
      {
        id: 'test003',
        fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
        moves: 'c4f7 e8f7 d2d4',
        rating: 1800,
        themes: ['tactics', 'middlegame'],
        url: 'https://lichess.org/training/test003',
      },
      {
        id: 'test004',
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        moves: 'e2e4 e7e5 g1f3 b8c6',
        rating: 1000,
        themes: ['opening'],
        url: 'https://lichess.org/training/test004',
      },
      {
        id: 'test005',
        fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 4',
        moves: 'c4f7 e8f7 b1c3',
        rating: 2000,
        themes: ['tactics', 'middlegame', 'sacrifice'],
        url: 'https://lichess.org/training/test005',
      },
      {
        id: 'test006',
        fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2',
        moves: 'd2d4 e5d4 g1f3',
        rating: 1100,
        themes: ['opening', 'gambit'],
        url: 'https://lichess.org/training/test006',
      },
      {
        id: 'test007',
        fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
        moves: 'c4f7 e8f7 d1f3',
        rating: 1600,
        themes: ['tactics', 'checkmate'],
        url: 'https://lichess.org/training/test007',
      },
      {
        id: 'test008',
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        moves: 'd2d4 d7d5 c1f4',
        rating: 1300,
        themes: ['opening', 'development'],
        url: 'https://lichess.org/training/test008',
      },
      {
        id: 'test009',
        fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
        moves: 'c4f7 e8f7 e1g1',
        rating: 1900,
        themes: ['tactics', 'endgame'],
        url: 'https://lichess.org/training/test009',
      },
      {
        id: 'test010',
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        moves: 'c2c4 e7e5 g1f3',
        rating: 1400,
        themes: ['opening', 'english'],
        url: 'https://lichess.org/training/test010',
      },
    ];

    for (const puzzleData of testPuzzles) {
      const puzzle = await Puzzle.create(puzzleData);
      console.log(`  ✓ Created puzzle: ${puzzle.id} (rating: ${puzzle.rating})`);
    }

    console.log('\n✅ Puzzle seed completed successfully!');
    console.log(`\n📊 Created ${testPuzzles.length} test puzzles`);
    console.log('   Rating range: 1000 - 2000');
    console.log('   Themes: opening, tactics, middlegame, endgame, gambit, checkmate, sacrifice, english, development\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Puzzle seed failed:', error);
    process.exit(1);
  }
}

// Run seed
seedPuzzles();

