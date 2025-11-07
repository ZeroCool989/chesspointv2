'use client';

import { useState, useEffect, ComponentType } from 'react';
import { Box, CircularProgress } from '@mui/material';

interface EloMascotProps {
  modelPath?: string;
  scale?: number;
  position?: [number, number, number];
  onAnimationComplete?: (animation: string) => void;
  onClick?: () => void;
  enableControls?: boolean;
  autoRotate?: boolean;
}

/**
 * Wrapper component that dynamically loads EloMascot only on the client side
 * This prevents webpack from trying to resolve React Three Fiber during SSR
 */
export default function EloMascotWrapper(props: EloMascotProps) {
  const [MascotComponent, setMascotComponent] = useState<ComponentType<EloMascotProps> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only load on client side
    if (typeof window === 'undefined') {
      return;
    }

    // Use a string-based dynamic import that webpack can't statically analyze
    // This prevents webpack from trying to resolve React Three Fiber during build
    const loadMascot = async () => {
      try {
        // Use Function constructor to create a dynamic import that webpack can't analyze
        const importFn = new Function('return import("@/components/mascot/EloMascot")');
        const module = await importFn();
        setMascotComponent(() => module.default);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load EloMascot:', err);
        setError('Failed to load 3D mascot');
        setIsLoading(false);
      }
    };

    loadMascot();
  }, []);

  if (typeof window === 'undefined') {
    return (
      <Box
        sx={{
          width: '100%',
          height: '400px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box
        sx={{
          width: '100%',
          height: '400px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !MascotComponent) {
    return (
      <Box
        sx={{
          width: '100%',
          height: '400px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'text.secondary',
        }}
      >
        {error || '3D mascot unavailable'}
      </Box>
    );
  }

  return <MascotComponent {...props} />;
}

