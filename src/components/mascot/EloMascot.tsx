'use client';

import { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, useGLTF, useAnimations } from '@react-three/drei';
import { Group } from 'three';
import { Box, CircularProgress, Typography } from '@mui/material';
import { MascotAnimation } from '@/hooks/useMascotAnimations';

interface EloMascotProps {
  modelPath?: string;
  scale?: number;
  position?: [number, number, number];
  onAnimationComplete?: (animation: MascotAnimation) => void;
  onClick?: () => void;
  autoRotate?: boolean;
  enableControls?: boolean;
  forceAnimation?: MascotAnimation | null; // External control for animation
}

// Available mascot animation files
export const MASCOT_ANIMATIONS = {
  idle: '/models/mascot/Elo_Big_Wave_Hello_withSkin.glb', // Wave as default welcome animation
  wave: '/models/mascot/Elo_Big_Wave_Hello_withSkin.glb',
  celebrate: '/models/mascot/Elo_Breakdance_1990_withSkin.glb', // 1990 Breakdance - used when music is playing
  shuffle: '/models/mascot/Elo_Arm_Circle_Shuffle_withSkin.glb',
  run: '/models/mascot/Elo_Running_withSkin.glb',
  helloRun: '/models/mascot/Elo_Hello_Run_withSkin.glb',
} as const;

/**
 * 3D Model component for the mascot
 * Since each animation is in a separate GLB file, we'll switch between models
 */
function MascotModel({
  modelPath = MASCOT_ANIMATIONS.idle,
  scale = 1,
  position = [0, 0, 0],
  onClick,
}: {
  modelPath: string;
  scale: number;
  position: [number, number, number];
  onClick?: () => void;
}) {
  const groupRef = useRef<Group>(null);
  
  console.log('Loading model from:', modelPath);
  
  // Load model
  const { scene, animations } = useGLTF(modelPath);
  
  console.log('Model loaded, animations:', animations.length, animations.map(a => a.name));
  
  // Get animation actions - try common animation name patterns
  const { actions } = useAnimations(animations, groupRef);

  // Play the first available animation (GLB files typically have one animation)
  useEffect(() => {
    console.log('Setting up animation, actions:', Object.keys(actions || {}));
    if (animations.length > 0 && actions) {
      const animationName = animations[0].name;
      const action = actions[animationName];
      
      console.log('Playing animation:', animationName, action);
      
      if (action) {
        // Check if this is a looping animation (wave, shuffle, run, breakdance)
        const shouldLoop = modelPath.includes('Shuffle') || 
                          modelPath.includes('Wave') ||
                          modelPath.includes('Hello') ||
                          modelPath.includes('Running') ||
                          modelPath.includes('Breakdance');
        
        // Slow down running animation
        if (modelPath.includes('Running')) {
          action.timeScale = 0.6; // Run at 60% speed (slower)
        } else {
          action.timeScale = 1.0; // Normal speed for other animations
        }
        
        action.reset().fadeIn(0.5).play();
        if (shouldLoop) {
          action.setLoop(2, Infinity); // Loop welcome/wave/run animations
        } else {
          action.setLoop(0, 1); // Play once for other animations
        }
      } else {
        console.warn('No action found for animation:', animationName);
      }
    } else {
      console.warn('No animations or actions available');
    }
  }, [animations, actions, modelPath]);

  const handleClick = () => {
    onClick?.();
  };

  if (!scene) {
    console.error('Scene is null');
    return null;
  }

  return (
    <group
      ref={groupRef}
      scale={scale}
      position={position}
      onClick={handleClick}
    >
      <primitive object={scene} />
    </group>
  );
}

/**
 * Loading fallback component
 */
function MascotLoader() {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        minHeight: '400px',
      }}
    >
      <CircularProgress />
    </Box>
  );
}

/**
 * Elo Mascot Component
 * Displays the 3D mascot with animations and interactions
 */
export default function EloMascot({
  modelPath = MASCOT_ANIMATIONS.idle,
  scale = 1,
  position = [0, -1, 0],
  onAnimationComplete,
  onClick,
  autoRotate = false,
  enableControls = false,
  forceAnimation = null,
}: EloMascotProps) {
  const [currentModel, setCurrentModel] = useState(modelPath);
  const [isHovering, setIsHovering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle external animation control
  useEffect(() => {
    if (forceAnimation) {
      const animationPath = MASCOT_ANIMATIONS[forceAnimation];
      if (animationPath && animationPath !== currentModel) {
        // Add a small delay for smoother transition
        const transitionTimeout = setTimeout(() => {
          setCurrentModel(animationPath);
        }, 100);
        return () => clearTimeout(transitionTimeout);
      }
    } else if (!forceAnimation && currentModel !== modelPath) {
      // Return to default when no animation is forced
      setCurrentModel(modelPath);
    }
  }, [forceAnimation, currentModel, modelPath]);

  // Keep waving animation as default (already set in modelPath)
  // On click, briefly show celebrate animation then return to wave
  const handleMascotClick = () => {
    if (currentModel === MASCOT_ANIMATIONS.idle || currentModel === MASCOT_ANIMATIONS.wave) {
      setCurrentModel(MASCOT_ANIMATIONS.celebrate);
      setTimeout(() => setCurrentModel(MASCOT_ANIMATIONS.idle), 5000);
    } else {
      setCurrentModel(MASCOT_ANIMATIONS.idle);
    }
    onClick?.();
  };

  // Check if WebGL is supported
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setError('WebGL is not supported in your browser');
      }
    }
  }, []);

  if (error) {
    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          minHeight: '400px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Typography variant="body1" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <MascotLoader />;
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        minHeight: '400px',
        position: 'relative',
        cursor: enableControls ? 'grab' : 'pointer',
        backgroundColor: 'transparent',
        '&:active': {
          cursor: enableControls ? 'grabbing' : 'pointer',
        },
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <Suspense fallback={<MascotLoader />}>
        <Canvas
          gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
          dpr={[1, 2]}
          style={{ 
            background: 'transparent', 
            width: '100%', 
            height: '100%',
            display: 'block',
          }}
          onCreated={(state) => {
            console.log('Canvas created successfully');
            console.log('Model path:', currentModel);
          }}
          onError={(error) => {
            console.error('Canvas error:', error);
            setError('Failed to initialize 3D canvas: ' + String(error));
          }}
        >
          <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={1.2} />
          <pointLight position={[-10, -10, -5]} intensity={0.5} />
          
          <Suspense fallback={null}>
            <MascotModel
              key={currentModel} // Force re-render when model changes
              modelPath={currentModel}
              scale={scale}
              position={position}
              onClick={handleMascotClick}
            />
          </Suspense>
          
          {enableControls && (
            <OrbitControls
              enableZoom={true}
              enablePan={false}
              autoRotate={autoRotate}
              autoRotateSpeed={1}
              minPolarAngle={Math.PI / 3}
              maxPolarAngle={Math.PI / 1.5}
              minDistance={3}
              maxDistance={8}
              enableDamping={true}
              dampingFactor={0.05}
            />
          )}
        </Canvas>
      </Suspense>
    </Box>
  );
}

/**
 * Preload all mascot models
 */
export function preloadEloMascot() {
  if (typeof window === 'undefined') return;
  
  import('@react-three/drei').then(({ useGLTF }) => {
    Object.values(MASCOT_ANIMATIONS).forEach((path) => {
      useGLTF.preload(path);
    });
  });
}

