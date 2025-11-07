import { preloadGLTF, preloadGLTFs } from '@/hooks/useGLTFLoader';

/**
 * Preload all mascot models for better performance
 */
export function preloadMascotModels() {
  const mascotModels = [
    '/models/mascot/Elo_Big_Wave_Hello_withSkin.glb',
    '/models/mascot/Elo_Breakdance_1990_withSkin.glb',
    '/models/mascot/Elo_Arm_Circle_Shuffle_withSkin.glb',
    '/models/mascot/Elo_Running_withSkin.glb',
    '/models/mascot/Elo_Hello_Run_withSkin.glb',
  ];
  
  preloadGLTFs(mascotModels);
}

/**
 * Preload lesson models
 * Call this when user navigates to lessons page
 */
export function preloadLessonModels() {
  const lessonModels = [
    '/models/lessons/london.glb',
    // Add more lesson models here as they are added
  ];
  
  // Use the same preload function from useGLTFLoader
  preloadGLTFs(lessonModels);
}

/**
 * Preload all 3D models
 * Call this on app initialization for best performance
 */
export function preloadAllModels() {
  if (typeof window !== 'undefined') {
    // Preload on next tick to avoid blocking initial render
    setTimeout(() => {
      preloadMascotModels();
      preloadLessonModels();
    }, 1000);
  }
}

