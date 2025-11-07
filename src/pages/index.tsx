import { useState, useEffect } from "react";
import { Box, Typography, Container, Grid2 as Grid, useTheme } from "@mui/material";
import { PageTitle } from "@/components/pageTitle";
import MusicPlayer from "@/components/MusicPlayer";
import EloMascot from "@/components/mascot/EloMascot";
import MascotNavigation from "@/components/mascot/MascotNavigation";
import ClientOnly from "@/components/ClientOnly";
import { preloadMascotModels } from "@/utils/modelPreloader";

export default function HomePage() {
  const theme = useTheme();
  const [showNavigation, setShowNavigation] = useState(false);
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false);

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
    }
  }, []);

  const handleMascotClick = () => {
    setShowNavigation(!showNavigation);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <PageTitle title="Chesspoint.io - Home" />

      <Grid container spacing={4} alignItems="center" minHeight="60vh">
        {/* Mascot Section */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: '500px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 2,
            }}
          >
            {/* Welcome Text Above Mascot */}
            <Typography
              variant="h4"
              component="h2"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #7B5AF0 0%, #A78BFA 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1,
                textAlign: 'center',
                animation: 'fadeInDown 0.8s ease-out',
                '@keyframes fadeInDown': {
                  '0%': {
                    opacity: 0,
                    transform: 'translateY(-20px)',
                  },
                  '100%': {
                    opacity: 1,
                    transform: 'translateY(0)',
                  },
                },
              }}
            >
              Welcome to Chesspoint!
            </Typography>
            
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                height: '400px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <ClientOnly>
                <EloMascot
                  scale={1.5}
                  position={[0, -1, 0]}
                  onClick={handleMascotClick}
                  enableControls={false}
                />
              </ClientOnly>
              <MascotNavigation
                open={showNavigation}
                onClose={() => setShowNavigation(false)}
                position="right"
              />
            </Box>
          </Box>
        </Grid>

        {/* Welcome Content */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: { xs: 'center', md: 'flex-start' },
              gap: 4,
              padding: { xs: 4, md: 6 },
              borderRadius: 4,
              background: 'linear-gradient(135deg, rgba(124, 90, 240, 0.1) 0%, rgba(167, 139, 250, 0.1) 100%)',
              border: '1px solid rgba(124, 90, 240, 0.2)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(124, 90, 240, 0.1)',
              textAlign: { xs: 'center', md: 'left' },
            }}
          >
            <Typography
              variant="h3"
              component="h1"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #7B5AF0 0%, #A78BFA 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2,
              }}
            >
              Welcome to Chesspoint.io
            </Typography>

            <Typography
              variant="h6"
              sx={{
                color: 'text.secondary',
                maxWidth: '600px',
                lineHeight: 1.6,
              }}
            >
              Your advanced chess analysis platform. Navigate to Play, Analysis, or Database to get started with your chess journey.
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: 'text.secondary',
                maxWidth: '600px',
                lineHeight: 1.8,
                mt: 2,
              }}
            >
              Click on Elo to get navigation help, or explore our features:
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}
