import { Box, Typography, Container, Grid2 as Grid, Card, CardContent, Button, Divider } from "@mui/material";
import { Icon } from "@iconify/react";
import { PageTitle } from "@/components/pageTitle";
import NavLink from "@/components/NavLink";

export default function DonatePage() {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <PageTitle title="Chesspoint - Donate" />
      
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
            <Icon icon="mdi:heart" style={{ fontSize: '48px', color: '#7B5AF0', marginBottom: '16px' }} />
            <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 2 }}>
              Support Chesspoint
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '600px', mx: 'auto' }}>
              Help us continue developing and improving Chesspoint. Your support enables us to add new features, improve performance, and maintain the platform.
            </Typography>
          </Box>
        </Grid>

        <Grid size={12} md={8}>
          <Card sx={{ background: 'rgba(124, 90, 240, 0.05)', border: '1px solid rgba(124, 90, 240, 0.1)' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" component="h2" sx={{ fontWeight: 600, mb: 3 }}>
                Why Support Chesspoint?
              </Typography>
              
              <Grid container spacing={3}>
                <Grid size={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Icon icon="mdi:rocket" style={{ fontSize: '20px', color: '#7B5AF0', marginTop: '4px' }} />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        Feature Development
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Help us develop new analysis features and improve existing tools.
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid size={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Icon icon="mdi:server" style={{ fontSize: '20px', color: '#7B5AF0', marginTop: '4px' }} />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        Server Costs
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Cover hosting and infrastructure costs to keep Chesspoint running smoothly.
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid size={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Icon icon="mdi:shield-check" style={{ fontSize: '20px', color: '#7B5AF0', marginTop: '4px' }} />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        Security & Updates
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Maintain security updates and keep the platform secure.
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid size={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Icon icon="mdi:open-source" style={{ fontSize: '20px', color: '#7B5AF0', marginTop: '4px' }} />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        Open Source
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Support our commitment to open-source chess analysis tools.
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={12} md={4}>
          <Card sx={{ background: 'rgba(124, 90, 240, 0.05)', border: '1px solid rgba(124, 90, 240, 0.1)', height: 'fit-content' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Donation Options
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  sx={{ borderColor: '#7B5AF0', color: '#7B5AF0', py: 1.5 }}
                  startIcon={<Icon icon="mdi:paypal" />}
                >
                  PayPal
                </Button>
                
                <Button 
                  variant="outlined" 
                  fullWidth 
                  sx={{ borderColor: '#7B5AF0', color: '#7B5AF0', py: 1.5 }}
                  startIcon={<Icon icon="mdi:credit-card" />}
                >
                  Credit Card
                </Button>
                
                <Button 
                  variant="outlined" 
                  fullWidth 
                  sx={{ borderColor: '#7B5AF0', color: '#7B5AF0', py: 1.5 }}
                  startIcon={<Icon icon="mdi:bitcoin" />}
                >
                  Cryptocurrency
                </Button>
              </Box>

              <Divider sx={{ my: 3 }} />
              
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                All donations are greatly appreciated and help us continue improving Chesspoint for the chess community.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}


