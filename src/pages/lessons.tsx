import { useState } from "react";
import { Box, Container, Typography, Grid, Card, CardContent, CardMedia, Button, Chip, Stack, TextField, InputAdornment, IconButton } from "@mui/material";
import { Icon } from "@iconify/react";
import { useAtomValue } from "jotai";
import { darkModeAtom } from "@/atoms/theme";
import { useScreenSize } from "@/hooks/useScreenSize";

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
}

const mockLessons: Lesson[] = [
  {
    id: '1',
    title: 'Chess Fundamentals: The Opening Principles',
    description: 'Learn the essential opening principles that every chess player should know. Perfect for beginners starting their chess journey.',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    duration: '15:30',
    difficulty: 'Beginner',
    category: 'Opening',
    videoId: 'dQw4w9WgXcQ',
    views: 125000,
    publishedAt: '2024-01-15'
  },
  {
    id: '2',
    title: 'Master the Sicilian Defense',
    description: 'Deep dive into one of the most popular and aggressive openings in chess. Learn key variations and tactical patterns.',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    duration: '22:45',
    difficulty: 'Intermediate',
    category: 'Opening',
    videoId: 'dQw4w9WgXcQ',
    views: 89000,
    publishedAt: '2024-01-20'
  },
  {
    id: '3',
    title: 'Endgame Mastery: King and Pawn Endgames',
    description: 'Essential endgame knowledge for converting winning positions. Learn key techniques and patterns.',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    duration: '18:20',
    difficulty: 'Advanced',
    category: 'Endgame',
    videoId: 'dQw4w9WgXcQ',
    views: 67000,
    publishedAt: '2024-01-25'
  },
  {
    id: '4',
    title: 'Tactical Patterns: The Pin',
    description: 'Master the pin tactic and learn to recognize and execute this powerful tactical motif.',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    duration: '12:15',
    difficulty: 'Beginner',
    category: 'Tactics',
    videoId: 'dQw4w9WgXcQ',
    views: 95000,
    publishedAt: '2024-02-01'
  },
  {
    id: '5',
    title: 'Positional Play: Understanding Weak Squares',
    description: 'Learn to identify and exploit weak squares in your opponent\'s position for long-term advantages.',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    duration: '20:10',
    difficulty: 'Intermediate',
    category: 'Strategy',
    videoId: 'dQw4w9WgXcQ',
    views: 78000,
    publishedAt: '2024-02-05'
  },
  {
    id: '6',
    title: 'Chess Psychology: Managing Time Pressure',
    description: 'Learn to stay calm and make good decisions under time pressure in tournament games.',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    duration: '16:30',
    difficulty: 'Advanced',
    category: 'Psychology',
    videoId: 'dQw4w9WgXcQ',
    views: 54000,
    publishedAt: '2024-02-10'
  }
];

const categories = ['All', 'Opening', 'Tactics', 'Strategy', 'Endgame', 'Psychology'];
const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

export default function Lessons() {
  const darkMode = useAtomValue(darkModeAtom);
  const screenSize = useScreenSize();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

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
        backgroundColor: darkMode ? '#0F0F0F' : '#FAFAFA',
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
        <Grid container spacing={3}>
          {filteredLessons.map((lesson) => (
            <Grid item xs={12} sm={6} md={4} lg={3} xl={2.4} key={lesson.id}>
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
                      background: 'linear-gradient(45deg, rgba(124, 90, 240, 0.8), rgba(167, 139, 250, 0.8))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                    },
                  },
                />
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
                        <Icon icon="mdi:clock-outline" style={{ fontSize: '14px' }} />
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
                        <Icon icon="mdi:eye" style={{ fontSize: '14px' }} />
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
      </Container>
    </Box>
  );
}
