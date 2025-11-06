import { Router, Request, Response } from 'express';
import Puzzle from '../models/Puzzle';

const router = Router();

/**
 * GET /api/puzzles/random
 * Returns a random puzzle filtered by rating range and optional theme
 * Query params:
 *   - minRating?: number (default 1400, range: 600-3200)
 *   - maxRating?: number (default 2000, range: 600-3200)
 *   - theme?: string (optional)
 */
router.get('/random', async (req: Request, res: Response) => {
  try {
    const minRating = parseInt(req.query.minRating as string) || 1400;
    const maxRating = parseInt(req.query.maxRating as string) || 2000;
    const theme = req.query.theme as string | undefined;

    // Build query filter
    const filter: any = {
      Rating: { $gte: minRating, $lte: maxRating },
    };

    // Add theme filter if provided (Themes is a space-separated string)
    if (theme && theme.trim() !== '') {
      filter.Themes = { $regex: new RegExp(theme.trim(), 'i') };
    }

    // Get random puzzle using aggregation pipeline
    const puzzles = await Puzzle.aggregate([
      { $match: filter },
      { $sample: { size: 1 } },
    ]);

    if (!puzzles || puzzles.length === 0) {
      return res.status(404).json({
        error: 'No puzzles found matching the criteria. Try adjusting the rating range.',
      });
    }

    const puzzle = puzzles[0];

    // Convert Themes string to array
    const themesArray = puzzle.Themes 
      ? puzzle.Themes.split(' ').filter((t: string) => t.trim() !== '')
      : [];

    // Return only needed fields (mapped to frontend format)
    res.json({
      id: puzzle.PuzzleId,
      fen: puzzle.FEN,
      moves: puzzle.Moves,
      rating: puzzle.Rating,
      themes: themesArray,
      url: puzzle.GameUrl,
    });
  } catch (error) {
    console.error('Error fetching random puzzle:', error);
    res.status(500).json({ error: 'Failed to fetch puzzle' });
  }
});

/**
 * GET /api/puzzles/themes
 * Returns all distinct puzzle themes
 */
router.get('/themes', async (_req: Request, res: Response) => {
  try {
    // Get all puzzles and extract unique themes from space-separated strings
    const puzzles = await Puzzle.find({}, { Themes: 1 });
    const themeSet = new Set<string>();

    puzzles.forEach((puzzle) => {
      if (puzzle.Themes) {
        const themes = puzzle.Themes.split(' ').filter((t) => t.trim() !== '');
        themes.forEach((theme) => themeSet.add(theme.trim()));
      }
    });

    // Convert to array and sort
    const themes = Array.from(themeSet).sort();

    res.json(themes);
  } catch (error) {
    console.error('Error fetching themes:', error);
    res.status(500).json({ error: 'Failed to fetch themes' });
  }
});

/**
 * GET /api/puzzles/:id
 * Returns a specific puzzle by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const puzzle = await Puzzle.findOne({ PuzzleId: id });

    if (!puzzle) {
      return res.status(404).json({ error: 'Puzzle not found' });
    }

    // Convert Themes string to array
    const themesArray = puzzle.Themes 
      ? puzzle.Themes.split(' ').filter((t: string) => t.trim() !== '')
      : [];

    res.json({
      id: puzzle.PuzzleId,
      fen: puzzle.FEN,
      moves: puzzle.Moves,
      rating: puzzle.Rating,
      themes: themesArray,
      url: puzzle.GameUrl,
    });
  } catch (error) {
    console.error('Error fetching puzzle:', error);
    res.status(500).json({ error: 'Failed to fetch puzzle' });
  }
});

/**
 * POST /api/puzzles/:id/attempt
 * Records a puzzle attempt (for future analytics)
 * Body: { success: boolean, movesTried: number, timeMs: number, mistakes: number }
 */
router.post('/:id/attempt', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { success, movesTried, timeMs, mistakes } = req.body;

    // Validate request body
    if (
      typeof success !== 'boolean' ||
      typeof movesTried !== 'number' ||
      typeof timeMs !== 'number' ||
      typeof mistakes !== 'number'
    ) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    // Log the attempt (future: save to puzzle_attempts collection)
    console.log(`Puzzle attempt: ${id}`, {
      success,
      movesTried,
      timeMs,
      mistakes,
      timestamp: new Date().toISOString(),
    });

    // TODO: Store in puzzle_attempts collection for analytics
    // const attempt = new PuzzleAttempt({
    //   puzzleId: id,
    //   userId: req.user?.id, // if authenticated
    //   success,
    //   movesTried,
    //   timeMs,
    //   mistakes,
    // });
    // await attempt.save();

    res.json({ success: true, message: 'Attempt recorded' });
  } catch (error) {
    console.error('Error recording puzzle attempt:', error);
    res.status(500).json({ error: 'Failed to record attempt' });
  }
});

export default router;
