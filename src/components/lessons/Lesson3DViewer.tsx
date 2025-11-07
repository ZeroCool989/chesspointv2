'use client';

import React, { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, useGLTF, Environment } from '@react-three/drei';
import { Box, CircularProgress, Typography } from '@mui/material';

interface Lesson3DViewerProps {
  modelPath: string;
  scale?: number;
  position?: [number, number, number];
  enableControls?: boolean;
  autoRotate?: boolean;
  showEnvironment?: boolean;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  minHeight?: number | string;
}

/**
 * 3D Model component for lessons
 */
function LessonModel({
  modelPath,
  scale = 1,
  position = [0, 0, 0],
  onLoad,
  onError,
}: {
  modelPath: string;
  scale: number;
  position: [number, number, number];
  onLoad?: () => void;
  onError?: (error: Error) => void;
}) {
  try {
    const { scene } = useGLTF(modelPath);
    
    // Call onLoad when model is loaded
    useEffect(() => {
      if (onLoad) {
        setTimeout(onLoad, 100);
      }
    }, [onLoad]);

    return (
      <primitive
        object={scene}
        scale={scale}
        position={position}
      />
    );
  } catch (error) {
    console.error('Error loading 3D model:', error);
    if (onError) {
      onError(error instanceof Error ? error : new Error('Failed to load model'));
    }
    return null;
  }
}

/**
 * Loading fallback component
 */
function ViewerLoader({ minHeight = '400px' }: { minHeight?: number | string }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        minHeight: minHeight,
        gap: 2,
      }}
    >
      <CircularProgress />
      <Typography variant="body2" color="text.secondary">
        Loading 3D model...
      </Typography>
    </Box>
  );
}

/**
 * Lesson3DViewer Component
 * Displays 3D models for chess opening lessons (e.g., London Parliament for London System)
 */
export default function Lesson3DViewer({
  modelPath,
  scale = 1,
  position = [0, 0, 0],
  enableControls = true,
  autoRotate = false,
  showEnvironment = true,
  onLoad,
  onError,
  minHeight = '400px',
}: Lesson3DViewerProps) {
  if (!modelPath) {
    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          minHeight: minHeight,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          border: '1px dashed',
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          No 3D model available
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        minHeight: minHeight,
        position: 'relative',
        borderRadius: 2,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Suspense fallback={<ViewerLoader minHeight={minHeight} />}>
        <Canvas
          gl={{ antialias: true, alpha: true }}
          dpr={[1, 2]}
          style={{ 
            background: 'transparent',
            width: '100%',
            height: '100%',
          }}
        >
          <PerspectiveCamera makeDefault position={[0, 1, 4]} fov={60} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={1.2} />
          <pointLight position={[-10, -10, -5]} intensity={0.5} />
          
          {showEnvironment && <Environment preset="sunset" />}
          
          <LessonModel
            modelPath={modelPath}
            scale={scale}
            position={position}
            onLoad={onLoad}
            onError={onError}
          />
          
          <OrbitControls
            enableZoom={enableControls}
            enablePan={enableControls}
            autoRotate={autoRotate}
            autoRotateSpeed={0.5}
            minDistance={3}
            maxDistance={10}
          />
        </Canvas>
      </Suspense>
    </Box>
  );
}

/**
 * Preload a lesson model
 * Uses dynamic import to avoid SSR/build issues
 */
export function preloadLessonModel(modelPath: string) {
  if (typeof window === 'undefined') return;
  
  try {
    // Dynamically import useGLTF to avoid SSR issues
    import('@react-three/drei').then(({ useGLTF }) => {
      useGLTF.preload(modelPath);
    }).catch((error) => {
      console.warn(`Failed to preload lesson model ${modelPath}:`, error);
    });
  } catch (error) {
    console.warn(`Failed to preload lesson model ${modelPath}:`, error);
  }
}

