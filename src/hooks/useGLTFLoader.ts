/**
 * Preload a GLB file for faster loading later
 * This should be called in useEffect or on user interaction
 * @param path - Path to the GLB file (relative to public folder)
 */
export function preloadGLTF(path: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    // Dynamically import useGLTF to avoid SSR issues
    import('@react-three/drei').then(({ useGLTF }) => {
      useGLTF.preload(path);
    }).catch((error) => {
      console.warn(`Failed to preload GLB file ${path}:`, error);
    });
  } catch (error) {
    console.warn(`Failed to preload GLB file ${path}:`, error);
  }
}

/**
 * Preload multiple GLB files
 * @param paths - Array of paths to GLB files
 */
export function preloadGLTFs(paths: string[]): void {
  paths.forEach(preloadGLTF);
}

