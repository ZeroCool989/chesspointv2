import { Schema, model, Document } from 'mongoose';

/**
 * Puzzle document interface (Actual MongoDB format)
 * Stored in MongoDB collection: puzzles
 */
export interface IPuzzle extends Document {
  PuzzleId: string;           // Puzzle ID (e.g., "8")
  FEN: string;                // Initial FEN position
  Moves: string;              // UCI moves space-separated (e.g., "e2e4 e7e5 g1f3")
  Rating: number;             // Puzzle difficulty rating
  RatingDeviation?: number;   // Rating deviation
  Popularity?: number;         // Puzzle popularity
  NbPlays?: number;           // Number of plays
  Themes: string;             // Themes as space-separated string (e.g., "crushing hangingPiece long middlegame")
  GameUrl?: string;           // Lichess game URL
}

const PuzzleSchema = new Schema<IPuzzle>(
  {
    PuzzleId: {
      type: String,
      required: true,
      index: true,
    },
    FEN: {
      type: String,
      required: true,
    },
    Moves: {
      type: String,
      required: true,
    },
    Rating: {
      type: Number,
      required: true,
      index: true, // Index for filtering by rating range
    },
    RatingDeviation: {
      type: Number,
    },
    Popularity: {
      type: Number,
    },
    NbPlays: {
      type: Number,
    },
    Themes: {
      type: String,
      default: '',
      index: true, // Index for filtering by theme
    },
    GameUrl: {
      type: String,
    },
  },
  {
    collection: 'puzzles', // Explicitly set collection name
    strict: false, // Allow fields not in schema
  }
);

// Export the model
export default model<IPuzzle>('Puzzle', PuzzleSchema);
