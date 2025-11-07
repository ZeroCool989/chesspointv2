import { useState, useEffect, useRef } from 'react';
import { useAnimations, useGLTF } from '@react-three/drei';
import { AnimationClip, Group } from 'three';

export type MascotAnimation = 'idle' | 'wave' | 'point' | 'celebrate' | 'run' | 'shuffle';

interface UseMascotAnimationsOptions {
  modelPath: string;
  defaultAnimation?: MascotAnimation;
  loopDefault?: boolean;
}

interface UseMascotAnimationsReturn {
  animations: AnimationClip[];
  actions: { [key: string]: any };
  currentAnimation: MascotAnimation;
  playAnimation: (animation: MascotAnimation) => void;
  isPlaying: boolean;
  groupRef: React.RefObject<Group>;
}

/**
 * Hook for managing mascot animations
 * Handles animation switching, looping, and transitions
 */
export function useMascotAnimations(
  options: UseMascotAnimationsOptions
): UseMascotAnimationsReturn {
  const { modelPath, defaultAnimation = 'idle', loopDefault = true } = options;
  
  const [currentAnimation, setCurrentAnimation] = useState<MascotAnimation>(defaultAnimation);
  const [isPlaying, setIsPlaying] = useState(false);
  const groupRef = useRef<Group>(null);
  
  // Load the GLB model
  const { animations } = useGLTF(modelPath);
  
  // Get animation actions
  const { actions, mixer } = useAnimations(animations, groupRef);

  // Initialize default animation
  useEffect(() => {
    if (actions && actions[defaultAnimation]) {
      const action = actions[defaultAnimation];
      action.reset().fadeIn(0.5).play();
      if (loopDefault) {
        action.setLoop(2, Infinity); // Loop forever
      }
      setIsPlaying(true);
    }
  }, [actions, defaultAnimation, loopDefault]);

  // Handle animation completion
  useEffect(() => {
    if (!mixer) return;

    const handleFinished = () => {
      setIsPlaying(false);
      // If current animation is not idle and it finished, return to idle
      if (currentAnimation !== 'idle' && currentAnimation !== defaultAnimation) {
        playAnimation(defaultAnimation);
      }
    };

    mixer.addEventListener('finished', handleFinished);
    return () => mixer.removeEventListener('finished', handleFinished);
  }, [mixer, currentAnimation, defaultAnimation]);

  /**
   * Play a specific animation
   */
  const playAnimation = (animation: MascotAnimation) => {
    if (!actions || !actions[animation]) {
      console.warn(`Animation "${animation}" not found`);
      return;
    }

    // Stop current animation
    Object.values(actions).forEach((action) => {
      if (action && action.isRunning()) {
        action.fadeOut(0.3);
      }
    });

    // Play new animation
    const action = actions[animation];
    action.reset().fadeIn(0.3).play();
    
    // Set loop based on animation type
    if (animation === 'idle') {
      action.setLoop(2, Infinity); // Loop forever
    } else {
      action.setLoop(0, 1); // Play once
    }

    setCurrentAnimation(animation);
    setIsPlaying(true);
  };

  return {
    animations,
    actions,
    currentAnimation,
    playAnimation,
    isPlaying,
    groupRef,
  };
}

