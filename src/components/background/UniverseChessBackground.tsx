'use client';

import { useEffect, useRef, useState } from 'react';
import { Box, useTheme } from '@mui/material';

interface Star {
  x: number;
  y: number;
  radius: number;
  speed: number;
  opacity: number;
  twinkleSpeed: number;
}

interface ChessPiece {
  x: number;
  y: number;
  size: number;
  speed: number;
  rotation: number;
  rotationSpeed: number;
  symbol: string;
  opacity: number;
}

export default function UniverseChessBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Chess piece symbols (Unicode)
  const chessPieces = ['♔', '♕', '♖', '♗', '♘', '♙', '♚', '♛', '♜', '♝', '♞', '♟'];

  // Initialize stars
  const starsRef = useRef<Star[]>([]);
  const piecesRef = useRef<ChessPiece[]>([]);

  useEffect(() => {
    const updateDimensions = () => {
      if (canvasRef.current) {
        const width = window.innerWidth;
        const height = window.innerHeight;
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (!canvasRef.current || dimensions.width === 0 || dimensions.height === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    // Initialize stars
    if (starsRef.current.length === 0) {
      const starCount = Math.floor((dimensions.width * dimensions.height) / 15000);
      starsRef.current = Array.from({ length: starCount }, () => ({
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height,
        radius: Math.random() * 1.5 + 0.5,
        speed: Math.random() * 0.5 + 0.2,
        opacity: Math.random() * 0.5 + 0.3,
        twinkleSpeed: Math.random() * 0.02 + 0.01,
      }));
    }

    // Initialize chess pieces
    if (piecesRef.current.length === 0) {
      const pieceCount = 8;
      piecesRef.current = Array.from({ length: pieceCount }, () => ({
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height,
        size: Math.random() * 30 + 20,
        speed: Math.random() * 0.3 + 0.1,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        symbol: chessPieces[Math.floor(Math.random() * chessPieces.length)],
        opacity: Math.random() * 0.3 + 0.2,
      }));
    }

    let animationTime = 0;

    const animate = () => {
      if (!ctx) return;
      animationTime += 0.01;

      // Clear canvas with gradient background - colorful universe
      const gradient = ctx.createLinearGradient(0, 0, 0, dimensions.height);
      if (isDark) {
        // Vibrant purple/blue space gradient - lighter and more visible
        gradient.addColorStop(0, '#2d1b4e');
        gradient.addColorStop(0.3, '#3d2b5e');
        gradient.addColorStop(0.6, '#4a3b6e');
        gradient.addColorStop(1, '#5a4b7e');
      } else {
        // Light purple/blue gradient
        gradient.addColorStop(0, '#f0f4ff');
        gradient.addColorStop(0.5, '#e8edff');
        gradient.addColorStop(1, '#dde5ff');
      }
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);

      // Draw stars
      starsRef.current.forEach((star) => {
        // Twinkle effect
        star.opacity += star.twinkleSpeed;
        if (star.opacity > 1 || star.opacity < 0.3) {
          star.twinkleSpeed = -star.twinkleSpeed;
        }

        // Move stars slowly
        star.y += star.speed;
        if (star.y > dimensions.height) {
          star.y = 0;
          star.x = Math.random() * dimensions.width;
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = isDark
          ? `rgba(255, 255, 255, ${star.opacity})`
          : `rgba(124, 90, 240, ${star.opacity * 0.5})`;
        ctx.fill();

        // Add glow effect for some stars
        if (star.radius > 1) {
          ctx.shadowBlur = 3;
          ctx.shadowColor = isDark ? 'rgba(180, 142, 250, 0.5)' : 'rgba(124, 90, 240, 0.3)';
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      // Draw chess pieces
      piecesRef.current.forEach((piece) => {
        piece.rotation += piece.rotationSpeed;
        piece.y += piece.speed;

        // Wrap around screen
        if (piece.y > dimensions.height + piece.size) {
          piece.y = -piece.size;
          piece.x = Math.random() * dimensions.width;
        }

        // Fade in/out effect
        piece.opacity += Math.sin(animationTime * 2 + piece.x * 0.01) * 0.01;
        if (piece.opacity > 0.4) piece.opacity = 0.4;
        if (piece.opacity < 0.1) piece.opacity = 0.1;

        ctx.save();
        ctx.translate(piece.x, piece.y);
        ctx.rotate(piece.rotation);
        ctx.globalAlpha = piece.opacity;
        ctx.font = `${piece.size}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = isDark
          ? `rgba(180, 142, 250, ${piece.opacity})`
          : `rgba(124, 90, 240, ${piece.opacity})`;
        
        // Add glow to pieces
        ctx.shadowBlur = 8;
        ctx.shadowColor = isDark ? 'rgba(180, 142, 250, 0.6)' : 'rgba(124, 90, 240, 0.4)';
        ctx.fillText(piece.symbol, 0, 0);
        ctx.restore();
      });

      // Draw subtle chess board pattern in background
      const gridSize = 100;
      ctx.globalAlpha = 0.05;
      ctx.strokeStyle = isDark ? 'rgba(180, 142, 250, 0.3)' : 'rgba(124, 90, 240, 0.2)';
      ctx.lineWidth = 1;

      for (let x = 0; x < dimensions.width; x += gridSize) {
        for (let y = 0; y < dimensions.height; y += gridSize) {
          const isLight = ((x / gridSize) + (y / gridSize)) % 2 === 0;
          ctx.fillStyle = isLight
            ? (isDark ? 'rgba(180, 142, 250, 0.05)' : 'rgba(124, 90, 240, 0.03)')
            : 'transparent';
          ctx.fillRect(x, y, gridSize, gridSize);
        }
      }

      ctx.globalAlpha = 1;

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [dimensions, isDark]);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />
    </Box>
  );
}

