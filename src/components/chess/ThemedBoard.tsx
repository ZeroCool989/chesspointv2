import { useMemo, forwardRef } from 'react';
import { useAtomValue } from 'jotai';
import { Box } from '@mui/material';
import { Chessboard, ChessboardProps, CustomPieces, Piece, Arrow, CustomSquareRenderer, CustomSquareProps } from 'react-chessboard';
import { colorModeAtom } from '@/state/colorMode';
import { boardColors } from './boardColors';
import { Square } from 'react-chessboard/dist/chessboard/types';
import { boardHueAtom, pieceSetAtom } from '@/components/board/states';

/**
 * Themed chessboard wrapper that applies Monarch Knights color scheme
 * Automatically switches colors based on light/dark mode
 */
export interface ThemedBoardProps extends Partial<ChessboardProps> {
  // All standard Chessboard props are supported
  // Additional custom props can be added here
  highlightedSquares?: Square[];
  hintType?: 'move' | 'piece' | null;
  hintMove?: { from: Square; to: Square } | null;
  brainstormArrows?: Array<[Square, Square]>;
}

const PIECE_CODES = [
  'wP',
  'wB',
  'wN',
  'wR',
  'wQ',
  'wK',
  'bP',
  'bB',
  'bN',
  'bR',
  'bQ',
  'bK',
] as const satisfies Piece[];

export function ThemedBoard({
  highlightedSquares = [],
  hintType = null,
  hintMove = null,
  brainstormArrows = [],
  customBoardStyle = {},
  customLightSquareStyle = {},
  customDarkSquareStyle = {},
  ...chessboardProps
}: ThemedBoardProps) {
  const colorMode = useAtomValue(colorModeAtom);
  const colors = boardColors[colorMode];
  const pieceSet = useAtomValue(pieceSetAtom);
  const boardHue = useAtomValue(boardHueAtom);

  // Custom board styling with theme colors and glass effect
  const themedBoardStyle = useMemo(
    () => ({
      borderRadius: '12px',
      boxShadow:
        colorMode === 'dark'
          ? '0 8px 24px rgba(0, 0, 0, 0.5)'
          : '0 8px 24px rgba(124, 90, 240, 0.15)',
      border:
        colorMode === 'dark'
          ? '1px solid rgba(255, 255, 255, 0.1)'
          : '1px solid rgba(124, 90, 240, 0.15)',
      ...(boardHue ? { filter: `hue-rotate(${boardHue}deg)` } : {}),
      ...customBoardStyle,
    }),
    [colorMode, customBoardStyle, boardHue]
  );

  // Custom square colors (board hue is applied via filter on board style)
  const themedLightSquareStyle = useMemo(
    () => ({
      backgroundColor: colors.lightSquare,
      ...customLightSquareStyle,
    }),
    [colors.lightSquare, customLightSquareStyle]
  );

  const themedDarkSquareStyle = useMemo(
    () => ({
      backgroundColor: colors.darkSquare,
      ...customDarkSquareStyle,
    }),
    [colors.darkSquare, customDarkSquareStyle]
  );

  // Custom pieces based on piece set
  // Apply counter-rotation to pieces to prevent them from being affected by board hue
  const customPieces = useMemo(
    () =>
      PIECE_CODES.reduce<CustomPieces>((acc, piece) => {
        acc[piece] = ({ squareWidth }) => (
          <Box
            width={squareWidth}
            height={squareWidth}
            sx={{
              backgroundImage: `url(/piece/${pieceSet}/${piece}.svg)`,
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              ...(boardHue ? { filter: `hue-rotate(-${boardHue}deg)` } : {}),
            }}
          />
        );
        return acc;
      }, {}),
    [pieceSet, boardHue]
  );

  // Custom square renderer to add overlay highlights without affecting pieces
  const customSquareRenderer: CustomSquareRenderer = useMemo(() => {
    return forwardRef<HTMLDivElement, CustomSquareProps>((props, ref) => {
      const { children, square, style } = props;
      
      // Determine if this square should be highlighted
      const isHighlighted = highlightedSquares.includes(square);
      let highlightStyle: React.CSSProperties | undefined = undefined;
      
      // Debug logging
      if (isHighlighted) {
        console.log('Rendering highlighted square:', {
          square,
          hintType,
          hintMove,
          highlightedSquares,
        });
      }
      
      if (isHighlighted) {
        // Check if this is a hint square or brainstorming square
        const isHintSquare = (hintType === 'piece' && highlightedSquares.includes(square)) ||
          (hintType === 'move' && hintMove && (square === hintMove.from || square === hintMove.to));
        const isBrainstormSquare = !isHintSquare;

        if (hintType === 'piece') {
          // Piece hint - full square highlight with Chesspoint purple
          highlightStyle = {
            position: 'absolute',
            width: '100%',
            height: '100%',
            backgroundColor: colorMode === 'dark' 
              ? 'rgba(123, 90, 240, 0.5)' // Chesspoint purple for dark mode
              : 'rgba(123, 90, 240, 0.6)', // Chesspoint purple for light mode
            boxShadow: `inset 0 0 0 3px ${colorMode === 'dark' ? 'rgba(123, 90, 240, 0.9)' : 'rgba(123, 90, 240, 1)'}`, // Thick, purple border
            pointerEvents: 'none', // Don't interfere with piece interaction
            zIndex: 1,
          };
        } else if (hintType === 'move' && hintMove) {
          if (square === hintMove.from) {
            // Origin square - full square highlight with Chesspoint purple
            highlightStyle = {
              position: 'absolute',
              width: '100%',
              height: '100%',
              backgroundColor: colorMode === 'dark' 
                ? 'rgba(123, 90, 240, 0.4)' // Chesspoint purple for dark mode
                : 'rgba(123, 90, 240, 0.5)', // Chesspoint purple for light mode
              boxShadow: `inset 0 0 0 2.5px ${colorMode === 'dark' ? 'rgba(123, 90, 240, 0.85)' : 'rgba(123, 90, 240, 0.95)'}`, // Thick border
              pointerEvents: 'none',
              zIndex: 1,
            };
          } else if (square === hintMove.to) {
            // Destination square - very prominent full square highlight with Chesspoint purple
            highlightStyle = {
              position: 'absolute',
              width: '100%',
              height: '100%',
              backgroundColor: colorMode === 'dark' 
                ? 'rgba(123, 90, 240, 0.6)' // Very strong purple for dark mode
                : 'rgba(123, 90, 240, 0.7)', // Very bright purple for light mode
              boxShadow: `inset 0 0 0 4px ${colorMode === 'dark' ? 'rgba(91, 33, 182, 1)' : 'rgba(123, 90, 240, 1)'}`, // Very thick, purple border
              pointerEvents: 'none',
              zIndex: 1,
            };
          }
        } else if (isBrainstormSquare) {
          // Brainstorming highlight - full square with light green
          highlightStyle = {
            position: 'absolute',
            width: '100%',
            height: '100%',
            backgroundColor: colorMode === 'dark' 
              ? 'rgba(144, 238, 144, 0.4)' // Light green for dark mode
              : 'rgba(144, 238, 144, 0.5)', // Light green for light mode
            boxShadow: `inset 0 0 0 2px ${colorMode === 'dark' ? 'rgba(144, 238, 144, 0.7)' : 'rgba(144, 238, 144, 0.8)'}`, // Medium green border
            pointerEvents: 'none',
            zIndex: 1,
          };
        } else {
          // Normal highlight - full square
          highlightStyle = {
            position: 'absolute',
            width: '100%',
            height: '100%',
            backgroundColor: colors.highlightLegal,
            pointerEvents: 'none',
            zIndex: 1,
          };
        }
      }
      
      return (
        <div
          ref={ref}
          style={{
            ...style,
            position: 'relative',
            filter: boardHue ? `hue-rotate(-${boardHue}deg)` : undefined,
          }}
        >
          {children}
          {highlightStyle && <div style={highlightStyle} />}
        </div>
      );
    });
  }, [highlightedSquares, colors.highlightLegal, hintType, hintMove, colorMode, boardHue]);

  // Custom arrows for move hints and brainstorming
  const customArrows = useMemo(() => {
    const arrows: Arrow[] = [];
    
    // Add arrow for move hints
    if (hintType === 'move' && hintMove) {
      arrows.push([hintMove.from, hintMove.to]);
    }
    
    // Add brainstorming arrows
    brainstormArrows.forEach((arrow) => {
      arrows.push(arrow);
    });
    
    // Merge with any existing arrows from props
    if (chessboardProps.customArrows) {
      arrows.push(...chessboardProps.customArrows);
    }
    
    return arrows;
  }, [hintType, hintMove, brainstormArrows, chessboardProps.customArrows]);

  return (
    <Box
      sx={{
        width: '100%',
        aspectRatio: '1 / 1',
        maxWidth: '100%',
        touchAction: 'none', // Prevent default touch behaviors for better drag support
        userSelect: 'none', // Prevent text selection during drag
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none', // Prevent iOS callout menu
      }}
    >
      <Chessboard
        {...chessboardProps}
        customBoardStyle={themedBoardStyle}
        customLightSquareStyle={themedLightSquareStyle}
        customDarkSquareStyle={themedDarkSquareStyle}
        customPieces={customPieces}
        customSquare={customSquareRenderer}
        customSquareStyles={chessboardProps.customSquareStyles}
        customArrows={customArrows}
      />
    </Box>
  );
}

export default ThemedBoard;
