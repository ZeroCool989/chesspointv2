import React, { useState, useEffect, lazy, Suspense } from "react";
import { Box, Container, Typography, Grid, Card, CardContent, CardMedia, Button, Chip, Stack, TextField, InputAdornment, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, useTheme } from "@mui/material";
import { Icon } from "@iconify/react";
import ClientOnly from "@/components/ClientOnly";

// Dynamically import Lesson3DViewer to avoid build issues
const Lesson3DViewer = lazy(() => import("@/components/lessons/Lesson3DViewer").then(module => ({ default: module.default })));

// Preload function - will be called separately
function preloadLessonModel(modelPath: string) {
  if (typeof window === 'undefined') return;
  import("@/components/lessons/Lesson3DViewer")
    .then((module) => {
      if (module.preloadLessonModel) {
        module.preloadLessonModel(modelPath);
      }
    })
    .catch((error) => {
      console.warn(`Failed to preload lesson model ${modelPath}:`, error);
    });
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  videoId: string;
  views: number;
  publishedAt: string;
  modelPath?: string; // Path to 3D model GLB file
  opening?: string; // Chess opening name (e.g., "London System")
}

const mockLessons: Lesson[] = [
  {
    id: '1',
    title: 'Master the London System',
    description: 'Learn the London System opening with interactive 3D visualization of London Parliament. A solid and reliable opening for White.',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    duration: '22:45',
    difficulty: 'Intermediate',
    category: 'Opening',
    videoId: 'dQw4w9WgXcQ',
    views: 89000,
    publishedAt: '2024-01-20',
    modelPath: '/models/lessons/london.glb',
    opening: 'London System'
  },
  {
    id: '2',
    title: 'Master the Sicilian Defense',
    description: 'Learn the Sicilian Defense, one of the most popular and aggressive responses to 1.e4. Explore the rich tactical and strategic possibilities.',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    duration: '25:30',
    difficulty: 'Advanced',
    category: 'Opening',
    videoId: 'dQw4w9WgXcQ',
    views: 120000,
    publishedAt: '2024-01-25',
    modelPath: '/models/lessons/sicilian_defense.glb',
    opening: 'Sicilian Defense'
  }
];

const categories = ['All', 'Opening', 'Tactics', 'Strategy', 'Endgame', 'Psychology'];
const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

export default function Lessons() {
  const theme = useTheme();
  const darkMode = theme.palette.mode === 'dark';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  // Preload lesson models when component mounts
  useEffect(() => {
    mockLessons.forEach((lesson) => {
      if (lesson.modelPath) {
        preloadLessonModel(lesson.modelPath);
      }
    });
  }, []);

  const filteredLessons = mockLessons.filter(lesson => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lesson.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || lesson.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'All' || lesson.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return '#10A34A';
      case 'Intermediate': return '#F59E0B';
      case 'Advanced': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'transparent',
        paddingTop: '80px',
        paddingBottom: '40px',
      }}
    >
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: darkMode ? 'white' : '#1B1B1F',
              mb: 2,
              textAlign: 'center',
              background: 'linear-gradient(135deg, #7B5AF0 0%, #A78BFA 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Chess Lessons
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(27, 27, 31, 0.7)',
              textAlign: 'center',
              maxWidth: '600px',
              mx: 'auto',
            }}
          >
            Master chess with our comprehensive video lessons. From beginner fundamentals to advanced strategies.
          </Typography>
        </Box>

        {/* Search and Filters */}
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search lessons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Icon icon="mdi:magnify" style={{ color: darkMode ? 'white' : '#1B1B1F' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(124, 90, 240, 0.05)',
                    border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(124, 90, 240, 0.1)',
                    borderRadius: '12px',
                    '&:hover': {
                      border: darkMode ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(124, 90, 240, 0.2)',
                    },
                    '&.Mui-focused': {
                      border: darkMode ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(124, 90, 240, 0.3)',
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                SelectProps={{
                  native: true,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(124, 90, 240, 0.05)',
                    border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(124, 90, 240, 0.1)',
                    borderRadius: '12px',
                  },
                }}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                SelectProps={{
                  native: true,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(124, 90, 240, 0.05)',
                    border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(124, 90, 240, 0.1)',
                    borderRadius: '12px',
                  },
                }}
              >
                {difficulties.map((difficulty) => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty}
                  </option>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </Box>

        {/* Results Count */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="body1"
            sx={{
              color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(27, 27, 31, 0.7)',
            }}
          >
            {filteredLessons.length} lesson{filteredLessons.length !== 1 ? 's' : ''} found
          </Typography>
        </Box>

        {/* Lessons Grid */}
        <Grid container spacing={3} justifyContent="center">
          {filteredLessons.map((lesson) => (
            <Grid item xs={12} sm={6} md={5} lg={4} key={lesson.id}>
              <Card
                sx={{
                  backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)',
                  border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(124, 90, 240, 0.1)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: darkMode 
                      ? '0 8px 32px rgba(124, 90, 240, 0.3)' 
                      : '0 8px 32px rgba(124, 90, 240, 0.2)',
                  },
                }}
                onClick={() => setSelectedLesson(lesson)}
              >
                {lesson.modelPath ? (
                  <Box
                    sx={{
                      height: '200px',
                      width: '100%',
                      position: 'relative',
                      overflow: 'hidden',
                      backgroundColor: darkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.05)',
                      '& > div': {
                        height: '200px !important',
                        minHeight: '200px !important',
                      },
                    }}
                  >
                    <ClientOnly>
                      <Suspense
                        fallback={
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              height: '200px',
                              width: '100%',
                            }}
                          >
                            <CircularProgress size={40} />
                          </Box>
                        }
                      >
                        <Lesson3DViewer
                          modelPath={lesson.modelPath}
                          scale={1.5}
                          position={[0, 0, 0]}
                          enableControls={false}
                          autoRotate={true}
                          showEnvironment={false}
                          minHeight="200px"
                        />
                      </Suspense>
                    </ClientOnly>
                  </Box>
                ) : (
                  <CardMedia
                    component="img"
                    height="200"
                    image={lesson.thumbnail}
                    alt={lesson.title}
                    sx={{
                      position: 'relative',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background:
                          'linear-gradient(45deg, rgba(124, 90, 240, 0.8), rgba(167, 139, 250, 0.8))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0,
                        transition: 'opacity 0.3s ease',
                      },
                    }}
                  />
                )}
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                    <Chip
                      label={lesson.difficulty}
                      size="small"
                      sx={{
                        backgroundColor: getDifficultyColor(lesson.difficulty),
                        color: 'white',
                        fontWeight: 600,
                      }}
                    />
                    <Chip
                      label={lesson.category}
                      size="small"
                      variant="outlined"
                      sx={{
                        borderColor: darkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(124, 90, 240, 0.3)',
                        color: darkMode ? 'white' : '#1B1B1F',
                      }}
                    />
                    {lesson.modelPath && (
                      <Chip
                        label="3D"
                        size="small"
                        icon={<Icon icon="mdi:cube-outline" style={{ fontSize: '18px' }} />}
                        sx={{
                          backgroundColor: darkMode ? 'rgba(124, 90, 240, 0.2)' : 'rgba(124, 90, 240, 0.1)',
                          color: darkMode ? 'white' : '#1B1B1F',
                          '& .MuiChip-icon': {
                            fontSize: '18px',
                          },
                        }}
                      />
                    )}
                  </Stack>
                  
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: darkMode ? 'white' : '#1B1B1F',
                      mb: 1,
                      lineHeight: 1.3,
                    }}
                  >
                    {lesson.title}
                  </Typography>
                  
                  <Typography
                    variant="body2"
                    sx={{
                      color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(27, 27, 31, 0.7)',
                      mb: 2,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {lesson.description}
                  </Typography>
                  
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Typography
                        variant="body2"
                        sx={{
                          color: darkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(27, 27, 31, 0.6)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                        }}
                      >
                        <Icon icon="mdi:clock-outline" style={{ fontSize: '20px' }} />
                        {lesson.duration}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: darkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(27, 27, 31, 0.6)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                        }}
                      >
                        <Icon icon="mdi:eye" style={{ fontSize: '20px' }} />
                        {formatViews(lesson.views)}
                      </Typography>
                    </Stack>
                    <Typography
                      variant="body2"
                      sx={{
                        color: darkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(27, 27, 31, 0.6)',
                      }}
                    >
                      {formatDate(lesson.publishedAt)}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* No Results */}
        {filteredLessons.length === 0 && (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
            }}
          >
            <Icon
              icon="mdi:video-off"
              style={{
                fontSize: '64px',
                color: darkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(27, 27, 31, 0.3)',
                marginBottom: '16px',
              }}
            />
            <Typography
              variant="h6"
              sx={{
                color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(27, 27, 31, 0.7)',
                mb: 1,
              }}
            >
              No lessons found
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(27, 27, 31, 0.5)',
              }}
            >
              Try adjusting your search criteria
            </Typography>
          </Box>
        )}

        {/* Lesson Detail Dialog */}
        <Dialog
          open={!!selectedLesson}
          onClose={() => setSelectedLesson(null)}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              backgroundColor: darkMode ? 'rgba(15, 15, 15, 0.95)' : 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(10px)',
            },
          }}
        >
          {selectedLesson && (
            <>
              <DialogTitle>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: darkMode ? 'white' : '#1B1B1F' }}>
                    {selectedLesson.title}
                  </Typography>
                  <IconButton onClick={() => setSelectedLesson(null)}>
                    <Icon icon="mdi:close" style={{ color: darkMode ? 'white' : '#1B1B1F' }} />
                  </IconButton>
                </Box>
                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                  <Chip
                    label={selectedLesson.difficulty}
                    size="small"
                    sx={{
                      backgroundColor: getDifficultyColor(selectedLesson.difficulty),
                      color: 'white',
                      fontWeight: 600,
                    }}
                  />
                  <Chip
                    label={selectedLesson.category}
                    size="small"
                    variant="outlined"
                    sx={{
                      borderColor: darkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(124, 90, 240, 0.3)',
                      color: darkMode ? 'white' : '#1B1B1F',
                    }}
                  />
                  {selectedLesson.opening && (
                    <Chip
                      label={selectedLesson.opening}
                      size="small"
                      icon={<Icon icon="mdi:chess-pawn" />}
                      sx={{
                        backgroundColor: darkMode ? 'rgba(124, 90, 240, 0.2)' : 'rgba(124, 90, 240, 0.1)',
                        color: darkMode ? 'white' : '#1B1B1F',
                      }}
                    />
                  )}
                </Stack>
              </DialogTitle>
              <DialogContent>
                <Grid container spacing={3}>
                  {/* 3D Model Viewer */}
                  {selectedLesson.modelPath && (
                    <Grid item xs={12} md={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, color: darkMode ? 'white' : '#1B1B1F' }}>
                          Interactive 3D Visualization
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 2, color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(27, 27, 31, 0.7)' }}>
                          Explore the 3D model associated with this opening
                        </Typography>
                      </Box>
                      <ClientOnly>
                        <Suspense fallback={
                          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                            <CircularProgress />
                          </Box>
                        }>
                          <Lesson3DViewer
                            modelPath={selectedLesson.modelPath}
                            scale={1}
                            position={[0, 0, 0]}
                            enableControls={true}
                            autoRotate={false}
                            showEnvironment={true}
                          />
                        </Suspense>
                      </ClientOnly>
                    </Grid>
                  )}
                  
                  {/* Lesson Content */}
                  <Grid item xs={12} md={selectedLesson.modelPath ? 6 : 12}>
                    <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, color: darkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(27, 27, 31, 0.8)' }}>
                      {selectedLesson.description}
                    </Typography>
                    
                    {/* London System Specific Content */}
                    {selectedLesson.opening === 'London System' && (
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: darkMode ? 'white' : '#1B1B1F' }}>
                          About the London System
                        </Typography>
                        
                        <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8, color: darkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(27, 27, 31, 0.8)' }}>
                          The London System is a solid, reliable opening for White that can be played against almost any Black defense. 
                          It's characterized by a quick development of the dark-squared bishop to f4, followed by pawn moves to d4, e3, and c3, 
                          creating a strong pawn structure and flexible piece development.
                        </Typography>

                        <Box sx={{ mb: 3, p: 2, backgroundColor: darkMode ? 'rgba(124, 90, 240, 0.1)' : 'rgba(124, 90, 240, 0.05)', borderRadius: 2 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: darkMode ? 'white' : '#1B1B1F' }}>
                            Basic Setup
                          </Typography>
                          <Typography variant="body2" component="div" sx={{ fontFamily: 'monospace', mb: 1, color: darkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(27, 27, 31, 0.9)' }}>
                            1. d4 d5<br />
                            2. Bf4 Nf6<br />
                            3. e3 e6<br />
                            4. Nf3 c5<br />
                            5. c3 Nc6<br />
                            6. Nbd2
                          </Typography>
                        </Box>

                        <Box sx={{ mb: 3 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: darkMode ? 'white' : '#1B1B1F' }}>
                            Key Concepts
                          </Typography>
                          <Stack spacing={1.5}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                              <Icon icon="mdi:circle-small" style={{ fontSize: '20px', marginTop: '2px', color: darkMode ? 'rgba(124, 90, 240, 0.8)' : 'rgba(124, 90, 240, 0.8)' }} />
                              <Typography variant="body2" sx={{ lineHeight: 1.7, color: darkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(27, 27, 31, 0.8)' }}>
                                <strong>Quick Development:</strong> The bishop on f4 develops early, controlling key squares and supporting the center.
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                              <Icon icon="mdi:circle-small" style={{ fontSize: '20px', marginTop: '2px', color: darkMode ? 'rgba(124, 90, 240, 0.8)' : 'rgba(124, 90, 240, 0.8)' }} />
                              <Typography variant="body2" sx={{ lineHeight: 1.7, color: darkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(27, 27, 31, 0.8)' }}>
                                <strong>Solid Pawn Structure:</strong> The pawns on d4, e3, and c3 create a strong foundation that's hard to break down.
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                              <Icon icon="mdi:circle-small" style={{ fontSize: '20px', marginTop: '2px', color: darkMode ? 'rgba(124, 90, 240, 0.8)' : 'rgba(124, 90, 240, 0.8)' }} />
                              <Typography variant="body2" sx={{ lineHeight: 1.7, color: darkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(27, 27, 31, 0.8)' }}>
                                <strong>Flexible Plans:</strong> White can choose between kingside or queenside expansion depending on Black's setup.
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                              <Icon icon="mdi:circle-small" style={{ fontSize: '20px', marginTop: '2px', color: darkMode ? 'rgba(124, 90, 240, 0.8)' : 'rgba(124, 90, 240, 0.8)' }} />
                              <Typography variant="body2" sx={{ lineHeight: 1.7, color: darkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(27, 27, 31, 0.8)' }}>
                                <strong>Safe and Sound:</strong> The London System avoids sharp theoretical lines, making it perfect for players who want a solid, positional game.
                              </Typography>
                            </Box>
                          </Stack>
                        </Box>

                        <Box sx={{ mb: 3 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: darkMode ? 'white' : '#1B1B1F' }}>
                            Common Variations
                          </Typography>
                          <Stack spacing={1.5}>
                            <Box sx={{ p: 1.5, backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)', borderRadius: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: darkMode ? 'white' : '#1B1B1F' }}>
                                Main Line
                              </Typography>
                              <Typography variant="body2" component="div" sx={{ fontFamily: 'monospace', fontSize: '0.85rem', color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(27, 27, 31, 0.7)' }}>
                                1.d4 d5 2.Bf4 Nf6 3.e3 e6 4.Nf3 c5 5.c3 Nc6 6.Nbd2
                              </Typography>
                            </Box>
                            <Box sx={{ p: 1.5, backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)', borderRadius: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: darkMode ? 'white' : '#1B1B1F' }}>
                                Against King's Indian Setup
                              </Typography>
                              <Typography variant="body2" component="div" sx={{ fontFamily: 'monospace', fontSize: '0.85rem', color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(27, 27, 31, 0.7)' }}>
                                1.d4 Nf6 2.Bf4 g6 3.e3 Bg7 4.Nf3 d6 5.h3
                              </Typography>
                            </Box>
                            <Box sx={{ p: 1.5, backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)', borderRadius: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: darkMode ? 'white' : '#1B1B1F' }}>
                                Torre Attack (Related System)
                              </Typography>
                              <Typography variant="body2" component="div" sx={{ fontFamily: 'monospace', fontSize: '0.85rem', color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(27, 27, 31, 0.7)' }}>
                                1.d4 Nf6 2.Nf3 e6 3.Bg5 (similar ideas, different bishop placement)
                              </Typography>
                            </Box>
                          </Stack>
                        </Box>

                        <Box sx={{ p: 2, backgroundColor: darkMode ? 'rgba(124, 90, 240, 0.15)' : 'rgba(124, 90, 240, 0.08)', borderRadius: 2, border: `1px solid ${darkMode ? 'rgba(124, 90, 240, 0.3)' : 'rgba(124, 90, 240, 0.2)'}` }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: darkMode ? 'white' : '#1B1B1F', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Icon icon="mdi:lightbulb-on" style={{ fontSize: '20px' }} />
                            Pro Tips
                          </Typography>
                          <Typography variant="body2" sx={{ lineHeight: 1.7, color: darkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(27, 27, 31, 0.9)' }}>
                            • Castle kingside early to ensure your king's safety<br />
                            • Look for opportunities to play h3 and g4 for a kingside attack<br />
                            • The bishop on f4 can be repositioned to g3 or h2 if needed<br />
                            • Be patient - the London System rewards positional understanding over tactical fireworks
                          </Typography>
                        </Box>
                      </Box>
                    )}

                    {/* Sicilian Defense Specific Content */}
                    {selectedLesson.opening === 'Sicilian Defense' && (
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: darkMode ? 'white' : '#1B1B1F' }}>
                          About the Sicilian Defense
                        </Typography>
                        
                        <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8, color: darkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(27, 27, 31, 0.8)' }}>
                          The Sicilian Defense is one of the most popular and aggressive responses to 1.e4. 
                          It's characterized by the move 1...c5, immediately challenging White's central control. 
                          The Sicilian leads to sharp, tactical positions with rich strategic possibilities for both sides.
                        </Typography>

                        <Box sx={{ mb: 3, p: 2, backgroundColor: darkMode ? 'rgba(124, 90, 240, 0.1)' : 'rgba(124, 90, 240, 0.05)', borderRadius: 2 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: darkMode ? 'white' : '#1B1B1F' }}>
                            Basic Setup
                          </Typography>
                          <Typography variant="body2" component="div" sx={{ fontFamily: 'monospace', mb: 1, color: darkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(27, 27, 31, 0.9)' }}>
                            1. e4 c5<br />
                            2. Nf3 d6<br />
                            3. d4 cxd4<br />
                            4. Nxd4 Nf6<br />
                            5. Nc3 g6<br />
                            6. Be3 Bg7
                          </Typography>
                        </Box>

                        <Box sx={{ mb: 3 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: darkMode ? 'white' : '#1B1B1F' }}>
                            Key Concepts
                          </Typography>
                          <Stack spacing={1.5}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                              <Icon icon="mdi:circle-small" style={{ fontSize: '20px', marginTop: '2px', color: darkMode ? 'rgba(124, 90, 240, 0.8)' : 'rgba(124, 90, 240, 0.8)' }} />
                              <Typography variant="body2" sx={{ lineHeight: 1.7, color: darkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(27, 27, 31, 0.8)' }}>
                                <strong>Asymmetric Positions:</strong> The Sicilian creates unbalanced positions where both sides have winning chances, leading to exciting, fighting chess.
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                              <Icon icon="mdi:circle-small" style={{ fontSize: '20px', marginTop: '2px', color: darkMode ? 'rgba(124, 90, 240, 0.8)' : 'rgba(124, 90, 240, 0.8)' }} />
                              <Typography variant="body2" sx={{ lineHeight: 1.7, color: darkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(27, 27, 31, 0.8)' }}>
                                <strong>Rich Theory:</strong> The Sicilian has been extensively analyzed, with countless variations offering different strategic and tactical paths.
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                              <Icon icon="mdi:circle-small" style={{ fontSize: '20px', marginTop: '2px', color: darkMode ? 'rgba(124, 90, 240, 0.8)' : 'rgba(124, 90, 240, 0.8)' }} />
                              <Typography variant="body2" sx={{ lineHeight: 1.7, color: darkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(27, 27, 31, 0.8)' }}>
                                <strong>Tactical Complexity:</strong> Many Sicilian lines lead to sharp, tactical battles where calculation and pattern recognition are crucial.
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                              <Icon icon="mdi:circle-small" style={{ fontSize: '20px', marginTop: '2px', color: darkMode ? 'rgba(124, 90, 240, 0.8)' : 'rgba(124, 90, 240, 0.8)' }} />
                              <Typography variant="body2" sx={{ lineHeight: 1.7, color: darkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(27, 27, 31, 0.8)' }}>
                                <strong>Dynamic Play:</strong> Black often gets active piece play and counterattacking chances, making the Sicilian a favorite of aggressive players.
                              </Typography>
                            </Box>
                          </Stack>
                        </Box>

                        <Box sx={{ mb: 3 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: darkMode ? 'white' : '#1B1B1F' }}>
                            Common Variations
                          </Typography>
                          <Stack spacing={1.5}>
                            <Box sx={{ p: 1.5, backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)', borderRadius: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: darkMode ? 'white' : '#1B1B1F' }}>
                                Dragon Variation
                              </Typography>
                              <Typography variant="body2" component="div" sx={{ fontFamily: 'monospace', fontSize: '0.85rem', color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(27, 27, 31, 0.7)' }}>
                                1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 g6
                              </Typography>
                            </Box>
                            <Box sx={{ p: 1.5, backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)', borderRadius: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: darkMode ? 'white' : '#1B1B1F' }}>
                                Najdorf Variation
                              </Typography>
                              <Typography variant="body2" component="div" sx={{ fontFamily: 'monospace', fontSize: '0.85rem', color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(27, 27, 31, 0.7)' }}>
                                1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 a6
                              </Typography>
                            </Box>
                            <Box sx={{ p: 1.5, backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)', borderRadius: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: darkMode ? 'white' : '#1B1B1F' }}>
                                Scheveningen Variation
                              </Typography>
                              <Typography variant="body2" component="div" sx={{ fontFamily: 'monospace', fontSize: '0.85rem', color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(27, 27, 31, 0.7)' }}>
                                1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 e6
                              </Typography>
                            </Box>
                          </Stack>
                        </Box>

                        <Box sx={{ p: 2, backgroundColor: darkMode ? 'rgba(124, 90, 240, 0.15)' : 'rgba(124, 90, 240, 0.08)', borderRadius: 2, border: `1px solid ${darkMode ? 'rgba(124, 90, 240, 0.3)' : 'rgba(124, 90, 240, 0.2)'}` }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: darkMode ? 'white' : '#1B1B1F', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Icon icon="mdi:lightbulb-on" style={{ fontSize: '20px' }} />
                            Pro Tips
                          </Typography>
                          <Typography variant="body2" sx={{ lineHeight: 1.7, color: darkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(27, 27, 31, 0.9)' }}>
                            • Study the main variations (Dragon, Najdorf, Scheveningen) to understand the different strategic ideas<br />
                            • Be prepared for sharp tactical battles - calculation skills are essential<br />
                            • Pay attention to pawn breaks and piece activity - the Sicilian rewards dynamic play<br />
                            • Don't be afraid of complications - the Sicilian is designed to create winning chances for Black
                          </Typography>
                        </Box>
                      </Box>
                    )}
                    
                    <Stack spacing={2} sx={{ mt: selectedLesson.opening === 'London System' || selectedLesson.opening === 'Sicilian Defense' ? 0 : 0 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: darkMode ? 'white' : '#1B1B1F' }}>
                          Duration
                        </Typography>
                        <Typography variant="body2" sx={{ color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(27, 27, 31, 0.7)' }}>
                          {selectedLesson.duration}
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: darkMode ? 'white' : '#1B1B1F' }}>
                          Views
                        </Typography>
                        <Typography variant="body2" sx={{ color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(27, 27, 31, 0.7)' }}>
                          {formatViews(selectedLesson.views)}
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: darkMode ? 'white' : '#1B1B1F' }}>
                          Published
                        </Typography>
                        <Typography variant="body2" sx={{ color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(27, 27, 31, 0.7)' }}>
                          {formatDate(selectedLesson.publishedAt)}
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions sx={{ p: 3 }}>
                <Button onClick={() => setSelectedLesson(null)} sx={{ color: darkMode ? 'white' : '#1B1B1F' }}>
                  Close
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Icon icon="mdi:play" />}
                  href={`https://www.youtube.com/watch?v=${selectedLesson.videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    background: 'linear-gradient(135deg, #7B5AF0 0%, #A78BFA 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #6B4AE0 0%, #9778EA 100%)',
                    },
                  }}
                >
                  Watch Video
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Container>
    </Box>
  );
}

