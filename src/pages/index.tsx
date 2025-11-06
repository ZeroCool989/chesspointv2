import { Box, Typography, Container, Grid2 as Grid } from "@mui/material";
import { PageTitle } from "@/components/pageTitle";
import MusicPlayer from "@/components/MusicPlayer";

export default function HomePage() {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <PageTitle title="Chesspoint.io - Home" />

      <Grid container justifyContent="center" alignItems="center" minHeight="60vh">
        <Grid size={12} sx={{ textAlign: 'center' }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              padding: 6,
              borderRadius: 4,
              background: 'linear-gradient(135deg, rgba(124, 90, 240, 0.1) 0%, rgba(167, 139, 250, 0.1) 100%)',
              border: '1px solid rgba(124, 90, 240, 0.2)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(124, 90, 240, 0.1)',
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
          </Box>
        </Grid>
      </Grid>
    </Container>
    <MusicPlayer />
  );
}
