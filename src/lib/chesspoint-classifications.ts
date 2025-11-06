/**
 * Chesspoint Unique Move Classification System
 * 
 * This file defines the unique naming system for chess move classifications
 * that differentiates Chesspoint from standard market terminology.
 */

import { MoveClassification } from "@/types/enums";

/**
 * Unique display names for move classifications
 * These names are designed to be distinctive and memorable,
 * different from standard chess analysis terminology.
 */
export const CHESSPOINT_CLASSIFICATION_NAMES: Record<MoveClassification, string> = {
  [MoveClassification.Splendid]: "Genius",
  [MoveClassification.Perfect]: "Masterstroke", 
  [MoveClassification.Best]: "Optimal",
  [MoveClassification.Excellent]: "Strong",
  [MoveClassification.Okay]: "Solid",
  [MoveClassification.Opening]: "Book",
  [MoveClassification.Forced]: "Only Move",
  [MoveClassification.Inaccuracy]: "Slip",
  [MoveClassification.Mistake]: "Mistake",
  [MoveClassification.Blunder]: "Blunder",
};

/**
 * Descriptive labels for move classifications
 * Used in move analysis text descriptions
 */
export const CHESSPOINT_CLASSIFICATION_LABELS: Record<MoveClassification, string> = {
  [MoveClassification.Splendid]: "a genius move !!",
  [MoveClassification.Perfect]: "a masterstroke !",
  [MoveClassification.Best]: "the optimal move",
  [MoveClassification.Excellent]: "a strong move",
  [MoveClassification.Okay]: "a solid move",
  [MoveClassification.Opening]: "a book move",
  [MoveClassification.Forced]: "the only move",
  [MoveClassification.Inaccuracy]: "a slight slip",
  [MoveClassification.Mistake]: "a tactical mistake",
  [MoveClassification.Blunder]: "a major blunder",
};

/**
 * What makes Chesspoint classifications unique:
 * 
 * 1. "Genius" instead of "Splendid" - more impactful
 * 2. "Masterstroke" instead of "Perfect" - emphasizes skill
 * 3. "Optimal" instead of "Best" - more technical precision
 * 4. "Strong" instead of "Excellent" - clearer meaning
 * 5. "Solid" instead of "Okay" - more positive connotation
 * 6. "Book" instead of "Opening" - chess-specific terminology
 * 7. "Only Move" instead of "Forced" - clearer constraint
 * 8. "Slip" instead of "Inaccuracy" - softer, more human
 * 9. "Mistake" instead of "Error" - more human and relatable
 * 10. "Blunder" remains the same - universally understood
 * 
 * These names create a unique vocabulary that:
 * - Sounds more professional and technical
 * - Uses chess-specific terminology where appropriate
 * - Maintains clear hierarchy of move quality
 * - Differentiates from standard chess sites
 * - Creates memorable brand language
 */
