import { Box, Typography, Container, Grid2 as Grid, Card, CardContent, Chip, Avatar } from "@mui/material";
import { Icon } from "@iconify/react";
import { PageTitle } from "@/components/pageTitle";
import NavLink from "@/components/NavLink";

const blogPosts = [
  {
    id: 1,
    title: "Introducing Chesspoint's New Analysis Engine",
    excerpt: "Discover the powerful new features in our latest update that make chess analysis faster and more accurate.",
    author: "Chesspoint Team",
    date: "2024-01-15",
    category: "Updates",
    readTime: "5 min read"
  },
  {
    id: 2,
    title: "Understanding Chess Position Evaluation",
    excerpt: "Learn how to interpret engine evaluations and use them to improve your chess understanding.",
    author: "Chess Expert",
    date: "2024-01-10",
    category: "Tutorial",
    readTime: "8 min read"
  },
  {
    id: 3,
    title: "The Future of Chess Analysis Technology",
    excerpt: "Exploring upcoming developments in chess analysis and how they will change the game.",
    author: "Tech Team",
    date: "2024-01-05",
    category: "Technology",
    readTime: "6 min read"
  },
  {
    id: 4,
    title: "Chesspoint Community Highlights",
    excerpt: "Celebrating the amazing contributions from our community of chess enthusiasts and developers.",
    author: "Community Team",
    date: "2024-01-01",
    category: "Community",
    readTime: "4 min read"
  }
];

export default function BlogPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <PageTitle title="Chesspoint - Blog" />
      
      <Grid container spacing={4}>
        <Grid size={12}>
          <Box
            sx={{
              textAlign: 'center',
              mb: 6,
              padding: 6,
              borderRadius: 4,
              background: 'linear-gradient(135deg, rgba(124, 90, 240, 0.1) 0%, rgba(167, 139, 250, 0.1) 100%)',
              border: '1px solid rgba(124, 90, 240, 0.2)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Icon icon="mdi:blog" style={{ fontSize: '48px', color: '#7B5AF0', marginBottom: '16px' }} />
            <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 2 }}>
              Chesspoint Blog
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '600px', mx: 'auto' }}>
              Stay updated with the latest news, tutorials, and insights from the Chesspoint team and community.
            </Typography>
          </Box>
        </Grid>

        {blogPosts.map((post) => (
          <Grid size={{ xs: 12, md: 6 }} key={post.id}>
            <Card 
              sx={{ 
                height: '100%', 
                background: 'rgba(124, 90, 240, 0.05)', 
                border: '1px solid rgba(124, 90, 240, 0.1)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 24px rgba(124, 90, 240, 0.15)'
                }
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Chip 
                    label={post.category} 
                    size="small" 
                    sx={{ 
                      backgroundColor: '#7B5AF0', 
                      color: 'white',
                      fontWeight: 500
                    }} 
                  />
                  <Typography variant="body2" color="text.secondary">
                    {post.readTime}
                  </Typography>
                </Box>

                <Typography variant="h5" component="h2" sx={{ fontWeight: 600, mb: 2, lineHeight: 1.3 }}>
                  {post.title}
                </Typography>

                <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
                  {post.excerpt}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Avatar sx={{ width: 32, height: 32, backgroundColor: '#7B5AF0' }}>
                    <Icon icon="mdi:account" style={{ fontSize: '16px' }} />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {post.author}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(post.date).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>

                <NavLink href={`/blog/${post.id}`}>
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 1,
                      color: '#7B5AF0',
                      cursor: 'pointer',
                      '&:hover': { opacity: 0.8 }
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Read More
                    </Typography>
                    <Icon icon="mdi:arrow-right" style={{ fontSize: '16px' }} />
                  </Box>
                </NavLink>
              </CardContent>
            </Card>
          </Grid>
        ))}

        <Grid size={12}>
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Want to contribute to our blog?
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              We're always looking for chess enthusiasts to share their knowledge and insights.
            </Typography>
            <NavLink href="/about">
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  color: '#7B5AF0',
                  cursor: 'pointer',
                  '&:hover': { opacity: 0.8 }
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Contact Us
                </Typography>
                <Icon icon="mdi:arrow-right" style={{ fontSize: '16px' }} />
              </Box>
            </NavLink>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}


