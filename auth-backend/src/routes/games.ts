import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { getGameModel } from '../models/Game';

const router = Router();

// GET /games - Get all games for authenticated user
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const Game = getGameModel();
    const games = await Game.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    // Convert MongoDB _id to id for frontend compatibility
    const formattedGames = games.map((game: any) => ({
      ...game,
      id: game._id.toString(),
      _id: undefined,
    }));

    res.json({ games: formattedGames });
  } catch (error) {
    console.error('Get games error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /games/:id - Get single game
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const Game = getGameModel();
    const game = await Game.findOne({
      _id: req.params.id,
      userId: req.user.id,
    }).lean();

    if (!game) {
      res.status(404).json({ error: 'Game not found' });
      return;
    }

    // Convert _id to id
    const formattedGame = {
      ...game,
      id: game._id.toString(),
      _id: undefined,
    };

    res.json({ game: formattedGame });
  } catch (error) {
    console.error('Get game error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /games - Create new game
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const Game = getGameModel();
    const gameData = {
      ...req.body,
      userId: req.user.id,
    };

    const game = await Game.create(gameData);
    
    // Convert _id to id
    const formattedGame = {
      ...game.toObject(),
      id: game._id.toString(),
      _id: undefined,
    };

    res.status(201).json({ game: formattedGame });
  } catch (error) {
    console.error('Create game error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /games/:id/eval - Update game evaluation
router.put('/:id/eval', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const Game = getGameModel();
    const game = await Game.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { eval: req.body.eval },
      { new: true }
    ).lean();

    if (!game) {
      res.status(404).json({ error: 'Game not found' });
      return;
    }

    const formattedGame = {
      ...game,
      id: game._id.toString(),
      _id: undefined,
    };

    res.json({ game: formattedGame });
  } catch (error) {
    console.error('Update game eval error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /games/:id - Delete game
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const Game = getGameModel();
    const game = await Game.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!game) {
      res.status(404).json({ error: 'Game not found' });
      return;
    }

    res.json({ message: 'Game deleted successfully' });
  } catch (error) {
    console.error('Delete game error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

