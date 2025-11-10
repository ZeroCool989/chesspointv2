import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Box, Typography, Container, Grid2 as Grid, useTheme, CircularProgress } from "@mui/material";
import { PageTitle } from "@/components/pageTitle";
import MusicPlayer from "@/components/MusicPlayer";
import MascotNavigation from "@/components/mascot/MascotNavigation";
import MascotNavigationButton from "@/components/mascot/MascotNavigationButton";
import { preloadMascotModels } from "@/utils/modelPreloader";

// Dynamically import EloMascot with SSR disabled using string path
// This prevents webpack from statically analyzing the import during build
const EloMascot = dynamic(
  () => import("@/components/mascot/EloMascot").catch((err) => {
    console.error('Failed to load EloMascot:', err);
    // Return a fallback component
    return { default: () => (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '400px', color: 'text.secondary' }}>
        3D mascot unavailable
      </Box>
    ) };
  }),
  {
    ssr: false,
    loading: () => (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '400px' }}>
        <CircularProgress />
      </Box>
    ),
  }
);

export default function HomePage() {
  const theme = useTheme();
  const [showNavigation, setShowNavigation] = useState(false);
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false);
  const [eloAnimation, setEloAnimation] = useState<'run' | 'celebrate' | 'shuffle' | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [hasOpenedCompass, setHasOpenedCompass] = useState(false); // Track if compass was ever opened

  useEffect(() => {
    // Preload mascot models for better performance
    preloadMascotModels();
    
    // Check if user has seen welcome message before
    if (typeof window !== 'undefined') {
      const seen = localStorage.getItem('chesspoint:welcome-seen');
      if (!seen) {
        // Show navigation after a short delay for first-time visitors
        setTimeout(() => {
          setShowNavigation(true);
          setHasSeenWelcome(true);
          localStorage.setItem('chesspoint:welcome-seen', 'true');
        }, 2000);
      }

      // Listen for music playing state changes
      const handleMusicPlaying = (event: CustomEvent) => {
        const playing = event.detail?.playing ?? false;
        setIsMusicPlaying(playing);
        if (playing) {
          // Music started playing - start with shuffle animation
          setEloAnimation('shuffle');
        } else {
          // Music stopped - continue walking (will be handled by useEffect)
          // The useEffect will check hasOpenedCompass and set animation accordingly
        }
      };

      window.addEventListener('elo-music-playing', handleMusicPlaying as EventListener);
      return () => {
        window.removeEventListener('elo-music-playing', handleMusicPlaying as EventListener);
      };
    }
  }, []);

  const handleMascotClick = () => {
    const newState = !showNavigation;
    setShowNavigation(newState);
    // When navigation opens, start walking (unless music is playing)
    if (newState && !isMusicPlaying) {
      setHasOpenedCompass(true);
      setEloAnimation('run');
    } else if (!newState && !isMusicPlaying && hasOpenedCompass) {
      // When navigation closes and compass was opened, continue walking
      setEloAnimation('run');
    }
    // If music is playing, don't change animation
  };

  const handleNavigationClick = () => {
    const newState = !showNavigation;
    setShowNavigation(newState);
    // When navigation opens, start walking (unless music is playing)
    if (newState && !isMusicPlaying) {
      setHasOpenedCompass(true);
      setEloAnimation('run');
    } else if (!newState && !isMusicPlaying && hasOpenedCompass) {
      // When navigation closes and compass was opened, continue walking
      setEloAnimation('run');
    }
    // If music is playing, don't change animation
  };

  // Keep shuffle animation active when music is playing
  useEffect(() => {
    if (isMusicPlaying) {
      // Music is playing - use shuffle animation continuously
      setEloAnimation('shuffle');
    }
  }, [isMusicPlaying]);

  // Handle animation priority: Music > Navigation > Default (waving)
  useEffect(() => {
    if (isMusicPlaying) {
      // Music is playing - use shuffle animation continuously
      setEloAnimation('shuffle');
    } else if (showNavigation || hasOpenedCompass) {
      // Navigation is open OR compass was opened before - use walking
      setEloAnimation('run');
    } else {
      // Nothing active - return to waving (idle)
      setEloAnimation(null);
    }
  }, [showNavigation, isMusicPlaying, hasOpenedCompass]);

  try {
    return (
      <>
        <Container maxWidth="lg" sx={{ py: 8, position: 'relative', zIndex: 1 }}>
          <PageTitle title="Chesspoint.io - Home" />

        <Grid container spacing={4} alignItems="center" justifyContent="center" minHeight="60vh">
          {/* Mascot Section - Centered */}
          <Grid size={{ xs: 12 }}>
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                height: '500px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <EloMascot
                  scale={1.5}
                  position={[0, -1, 0]}
                  onClick={handleMascotClick}
                  enableControls={true}
                  forceAnimation={eloAnimation}
                />
                <MascotNavigation
                  open={showNavigation}
                  onClose={() => {
                    setShowNavigation(false);
                    // When navigation closes, continue walking if no music
                    if (!isMusicPlaying && hasOpenedCompass) {
                      setEloAnimation('run');
                    }
                  }}
                  position="right"
                />
                <MascotNavigationButton
                  onClick={handleNavigationClick}
                  isOpen={showNavigation}
                />
              </Box>
            </Box>
          </Grid>
        </Grid>
        </Container>
      </>
    );
  } catch (error) {
    console.error('[home] error', error);
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h4" color="error" gutterBottom>
            Welcome to Chesspoint.io
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Your advanced chess analysis platform. Navigate to Play, Analysis, or Database to get started with your chess journey.
          </Typography>
        </Box>
      </Container>
    );
  }
}
