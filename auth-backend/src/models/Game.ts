import mongoose, { Document, Schema } from 'mongoose';
import { getGamesConnection } from '../config/gamesDatabase';

export interface IGame extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  pgn: string;
  event?: string;
  site?: string;
  date?: string;
  round?: string;
  white: {
    name: string;
    rating?: number;
  };
  black: {
    name: string;
    rating?: number;
  };
  result?: string;
  termination?: string;
  timeControl?: string;
  eval?: any; // GameEval structure
  createdAt: Date;
  updatedAt: Date;
}

const gameSchema = new Schema<IGame>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    pgn: {
      type: String,
      required: true,
    },
    event: String,
    site: String,
    date: String,
    round: String,
    white: {
      name: { type: String, required: true },
      rating: Number,
    },
    black: {
      name: { type: String, required: true },
      rating: Number,
    },
    result: String,
    termination: String,
    timeControl: String,
    eval: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast queries by user and date
gameSchema.index({ userId: 1, createdAt: -1 });

// Use separate connection for games database (gamesDB)
export const Game = () => {
  const gamesConnection = getGamesConnection();
  return gamesConnection.model<IGame>('Game', gameSchema);
};

// Export a function that returns the model (lazy initialization)
let GameModel: mongoose.Model<IGame> | null = null;

export const getGameModel = (): mongoose.Model<IGame> => {
  if (!GameModel) {
    const gamesConnection = getGamesConnection();
    GameModel = gamesConnection.model<IGame>('Game', gameSchema);
  }
  return GameModel;
};

