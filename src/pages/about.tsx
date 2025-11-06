import { Box, Typography, Container, Grid2 as Grid, Card, CardContent, Avatar, Divider } from "@mui/material";
import { Icon } from "@iconify/react";
import { PageTitle } from "@/components/pageTitle";
import NavLink from "@/components/NavLink";

const teamMembers = [
  {
    name: "Development Team",
    role: "Core Development",
    description: "The talented developers behind Chesspoint's powerful analysis engine and intuitive interface.",
    icon: "mdi:code-tags"
  },
  {
    name: "Chess Experts",
    role: "Chess Strategy",
    description: "Grandmasters and chess professionals who help shape our analysis algorithms and features.",
    icon: "mdi:chess-queen"
  },
  {
    name: "Community",
    role: "Open Source Contributors",
    description: "Dedicated community members who contribute to making Chesspoint better for everyone.",
    icon: "mdi:account-group"
  }
];

const features = [
  {
    title: "Advanced Analysis",
    description: "Powerful chess engines provide deep position analysis and move suggestions.",
    icon: "mdi:magnify"
  },
  {
    title: "User-Friendly Interface",
    description: "Intuitive design makes complex chess analysis accessible to players of all levels.",
    icon: "mdi:palette"
  },
  {
    title: "Open Source",
    description: "Completely open source, allowing the community to contribute and improve the platform.",
    icon: "mdi:open-source"
  },
  {
    title: "Cross-Platform",
    description: "Works seamlessly across desktop, tablet, and mobile devices.",
    icon: "mdi:cellphone"
  }
];

export default function AboutPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <PageTitle title="Chesspoint - About" />
      
      <Grid container spacing={6}>
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
            <Icon icon="mdi:information" style={{ fontSize: '48px', color: '#7B5AF0', marginBottom: '16px' }} />
            <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 2 }}>
              About Chesspoint
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '600px', mx: 'auto' }}>
              Chesspoint is an advanced chess analysis platform designed to help players of all levels improve their game through powerful analysis tools and intuitive design.
            </Typography>
          </Box>
        </Grid>

        <Grid size={12}>
          <Card sx={{ background: 'rgba(124, 90, 240, 0.05)', border: '1px solid rgba(124, 90, 240, 0.1)' }}>
            <CardContent sx={{ p: 6 }}>
              <Typography variant="h4" component="h2" sx={{ fontWeight: 600, mb: 4, textAlign: 'center' }}>
                Our Mission
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ textAlign: 'center', lineHeight: 1.6, maxWidth: '800px', mx: 'auto' }}>
                To democratize chess analysis by providing powerful, accessible tools that help players understand and improve their game. We believe that advanced chess analysis should be available to everyone, not just professional players.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={12}>
          <Typography variant="h4" component="h2" sx={{ fontWeight: 600, mb: 4, textAlign: 'center' }}>
            What Makes Chesspoint Special
          </Typography>
        </Grid>

        {features.map((feature, index) => (
          <Grid size={12} md={6} key={index}>
            <Card sx={{ height: '100%', background: 'rgba(124, 90, 240, 0.05)', border: '1px solid rgba(124, 90, 240, 0.1)' }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Icon icon={feature.icon} style={{ fontSize: '24px', color: '#7B5AF0' }} />
                  <Typography variant="h5" component="h3" sx={{ fontWeight: 600 }}>
                    {feature.title}
                  </Typography>
                </Box>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}

        <Grid size={12}>
          <Typography variant="h4" component="h2" sx={{ fontWeight: 600, mb: 4, textAlign: 'center' }}>
            Our Team
          </Typography>
        </Grid>

        {teamMembers.map((member, index) => (
          <Grid size={12} md={4} key={index}>
            <Card sx={{ height: '100%', background: 'rgba(124, 90, 240, 0.05)', border: '1px solid rgba(124, 90, 240, 0.1)' }}>
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Avatar sx={{ width: 64, height: 64, backgroundColor: '#7B5AF0', mx: 'auto', mb: 3 }}>
                  <Icon icon={member.icon} style={{ fontSize: '32px' }} />
                </Avatar>
                <Typography variant="h5" component="h3" sx={{ fontWeight: 600, mb: 1 }}>
                  {member.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {member.role}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  {member.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}

        <Grid size={12}>
          <Divider sx={{ my: 4 }} />
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
              Join Our Community
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: '600px', mx: 'auto' }}>
              Chesspoint is built by and for the chess community. Whether you're a beginner or a grandmaster, 
              we welcome you to join our community and help shape the future of chess analysis.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <NavLink href="/website">
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
                    Learn More
                  </Typography>
                  <Icon icon="mdi:arrow-right" style={{ fontSize: '16px' }} />
                </Box>
              </NavLink>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}


