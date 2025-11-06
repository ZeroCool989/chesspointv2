import dotenv from 'dotenv';
import { connectDatabase } from '../config/database';
import Puzzle from '../models/Puzzle';

// Load environment variables
dotenv.config();

/**
 * Test script to verify puzzle connection and data
 * Usage: npx tsx src/scripts/testPuzzles.ts
 */
async function testPuzzles() {
  try {
    console.log('🧪 Testing puzzle connection...\n');

    // Connect to database
    await connectDatabase();

    // Test 1: Count total puzzles
    const totalCount = await Puzzle.countDocuments({});
    console.log(`📊 Total puzzles in database: ${totalCount}`);

    if (totalCount === 0) {
      console.log('❌ No puzzles found in database!');
      process.exit(1);
    }

    // Test 2: Get a sample puzzle
    const samplePuzzle = await Puzzle.findOne({});
    if (samplePuzzle) {
      console.log('\n📝 Sample puzzle structure:');
      console.log({
        PuzzleId: samplePuzzle.PuzzleId,
        Rating: samplePuzzle.Rating,
        RatingType: typeof samplePuzzle.Rating,
        FEN: samplePuzzle.FEN ? 'exists' : 'missing',
        Moves: samplePuzzle.Moves ? 'exists' : 'missing',
        Themes: samplePuzzle.Themes,
        GameUrl: samplePuzzle.GameUrl,
      });
    }

    // Test 3: Test rating filter
    const minRating = 1000;
    const maxRating = 2000;
    const filter = {
      Rating: { $gte: minRating, $lte: maxRating },
    };
    
    const matchingCount = await Puzzle.countDocuments(filter);
    console.log(`\n🔍 Puzzles with Rating between ${minRating}-${maxRating}: ${matchingCount}`);

    // Test 4: Get a random puzzle with the filter
    const puzzles = await Puzzle.aggregate([
      { $match: filter },
      { $sample: { size: 1 } },
    ]);

    if (puzzles && puzzles.length > 0) {
      console.log('\n✅ Found matching puzzle:');
      console.log({
        PuzzleId: puzzles[0].PuzzleId,
        Rating: puzzles[0].Rating,
        FEN: puzzles[0].FEN?.substring(0, 50) + '...',
        Moves: puzzles[0].Moves?.substring(0, 30) + '...',
      });
    } else {
      console.log('\n❌ No puzzles found matching the filter');
      
      // Show rating range in database
      const ratingStats = await Puzzle.aggregate([
        {
          $group: {
            _id: null,
            minRating: { $min: '$Rating' },
            maxRating: { $max: '$Rating' },
            avgRating: { $avg: '$Rating' },
          },
        },
      ]);
      
      if (ratingStats && ratingStats.length > 0) {
        console.log('\n📊 Rating statistics in database:');
        console.log(ratingStats[0]);
      }
    }

    console.log('\n✅ Test completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run test
testPuzzles();

