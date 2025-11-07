import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import { useState } from "react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/router";
import NavLink from "@/components/NavLink";
import Image from "next/image";
import { styled } from "@mui/material/styles";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  darkMode: boolean;
  switchDarkMode: () => void;
}

// Styled component to make the link look like a button
const StyledIconButtonLink = styled("a")({
  color: "inherit",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  textDecoration: "none", // Remove underline from link
  "&:hover": {
    cursor: "pointer", // Change cursor on hover
  },
});

export default function NavBar({ darkMode, switchDarkMode }: Props) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Debug: log user state
  console.log("NavBar user state:", user);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      closeMobileMenu();
      router.push("/");
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  const navItems = [
    { label: 'Home', icon: 'mdi:home', href: '/' },
    { label: 'Analysis', icon: 'mdi:magnify', href: '/analysis' },
    { label: 'Play', icon: 'mdi:play', href: '/play' },
    { label: 'Puzzles', icon: 'mdi:puzzle', href: '/puzzles' },
    { label: 'Database', icon: 'mdi:database', href: '/database' },
    { label: 'Lessons', icon: 'mdi:school', href: '/lessons' },
    { label: 'Blog', icon: 'mdi:blog', href: '/blog' },
    { label: 'About', icon: 'mdi:information', href: '/about' },
    { label: 'Feedback', icon: 'mdi:message-reply-text', href: '/feedback' },
  ];

  return (
    <Box sx={{ flexGrow: 1, display: "flex" }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: darkMode 
            ? 'rgba(15, 15, 15, 0.95)' 
            : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: darkMode 
            ? '1px solid rgba(255, 255, 255, 0.1)' 
            : '1px solid rgba(124, 90, 240, 0.15)',
          boxShadow: darkMode 
            ? '0 2px 8px rgba(0, 0, 0, 0.3)' 
            : '0 2px 8px rgba(124, 90, 240, 0.1)',
          color: darkMode ? "white" : "#1B1B1F",
        }}
        enableColorOnDark
      >
        <Toolbar 
          sx={{
            minHeight: { xs: '64px', sm: '72px' },
            py: { xs: 1, sm: 1.5 },
            px: { xs: 1, sm: 2 },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <NavLink href="/">
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                padding: '6px 12px',
                borderRadius: '8px',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: darkMode ? 'rgba(123, 90, 240, 0.15)' : 'rgba(123, 90, 240, 0.1)',
                  transform: 'translateY(-1px)',
                  boxShadow: darkMode ? '0 2px 8px rgba(123, 90, 240, 0.3)' : '0 2px 8px rgba(123, 90, 240, 0.25)'
                }
              }}>
                <Image
                  src="/chesspoint_logo.png"
                  alt="Chesspoint Logo"
                  width={40}
                  height={40}
                  style={{ borderRadius: '8px' }}
                />
                <Typography
                  variant="h6"
                  component="div"
                  sx={{
                    fontSize: { xs: "1.1rem", sm: "1.3rem" },
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #7B5AF0 0%, #A78BFA 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                  }}
                >
                  Chesspoint
                </Typography>
              </Box>
            </NavLink>
          </Box>

          {/* Desktop Navigation Items */}
          <Box sx={{ 
            display: { xs: 'none', lg: 'flex' },
            alignItems: 'center', 
            gap: 1.5,
            ml: 3, 
            flex: 1,
            overflow: 'hidden',
          }}>
            {/* Main Navigation */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              padding: '8px 16px',
              borderRadius: '12px',
              backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(124, 90, 240, 0.05)',
              border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(124, 90, 240, 0.1)',
              backdropFilter: 'blur(10px)',
              flexWrap: 'nowrap',
            }}>
              {/* Home */}
              <NavLink href="/">
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                  padding: '6px 10px',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                  '&:hover': {
                    backgroundColor: darkMode ? 'rgba(200, 180, 255, 0.15)' : 'rgba(200, 180, 255, 0.25)',
                    transform: 'translateY(-1px)',
                    boxShadow: darkMode ? '0 2px 8px rgba(200, 180, 255, 0.2)' : '0 2px 8px rgba(200, 180, 255, 0.3)'
                  }
                }}>
                  <Icon icon="mdi:home" style={{ fontSize: '18px', color: '#7B5AF0' }} />
                  <Typography variant="body2" sx={{ color: darkMode ? 'white' : '#1B1B1F', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>Home</Typography>
                </Box>
              </NavLink>

              {/* Analysis */}
              <NavLink href="/analysis">
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                  padding: '6px 10px',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                  '&:hover': {
                    backgroundColor: darkMode ? 'rgba(200, 180, 255, 0.15)' : 'rgba(200, 180, 255, 0.25)',
                    transform: 'translateY(-1px)',
                    boxShadow: darkMode ? '0 2px 8px rgba(200, 180, 255, 0.2)' : '0 2px 8px rgba(200, 180, 255, 0.3)'
                  }
                }}>
                  <Icon icon="mdi:magnify" style={{ fontSize: '18px', color: '#7B5AF0' }} />
                  <Typography variant="body2" sx={{ color: darkMode ? 'white' : '#1B1B1F', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>Analysis</Typography>
                </Box>
              </NavLink>

              {/* Play */}
              <NavLink href="/play">
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                  padding: '6px 10px',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                  '&:hover': {
                    backgroundColor: darkMode ? 'rgba(200, 180, 255, 0.15)' : 'rgba(200, 180, 255, 0.25)',
                    transform: 'translateY(-1px)',
                    boxShadow: darkMode ? '0 2px 8px rgba(200, 180, 255, 0.2)' : '0 2px 8px rgba(200, 180, 255, 0.3)'
                  }
                }}>
                  <Icon icon="mdi:play" style={{ fontSize: '18px', color: '#7B5AF0' }} />
                  <Typography variant="body2" sx={{ color: darkMode ? 'white' : '#1B1B1F', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>Play</Typography>
                </Box>
              </NavLink>

              {/* Puzzles */}
              <NavLink href="/puzzles">
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                  padding: '6px 10px',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                  '&:hover': {
                    backgroundColor: darkMode ? 'rgba(200, 180, 255, 0.15)' : 'rgba(200, 180, 255, 0.25)',
                    transform: 'translateY(-1px)',
                    boxShadow: darkMode ? '0 2px 8px rgba(200, 180, 255, 0.2)' : '0 2px 8px rgba(200, 180, 255, 0.3)'
                  }
                }}>
                  <Icon icon="mdi:puzzle" style={{ fontSize: '18px', color: '#7B5AF0' }} />
                  <Typography variant="body2" sx={{ color: darkMode ? 'white' : '#1B1B1F', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>Puzzles</Typography>
                </Box>
              </NavLink>

              {/* Database */}
              <NavLink href="/database">
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                  padding: '6px 10px',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                  '&:hover': {
                    backgroundColor: darkMode ? 'rgba(200, 180, 255, 0.15)' : 'rgba(200, 180, 255, 0.25)',
                    transform: 'translateY(-1px)',
                    boxShadow: darkMode ? '0 2px 8px rgba(200, 180, 255, 0.2)' : '0 2px 8px rgba(200, 180, 255, 0.3)'
                  }
                }}>
                  <Icon icon="mdi:database" style={{ fontSize: '18px', color: '#7B5AF0' }} />
                  <Typography variant="body2" sx={{ color: darkMode ? 'white' : '#1B1B1F', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>Database</Typography>
                </Box>
              </NavLink>

              {/* Lessons */}
              {router.pathname !== '/lessons' && (
                <NavLink href="/lessons">
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.75,
                    padding: '6px 10px',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap',
                    '&:hover': {
                      backgroundColor: darkMode ? 'rgba(200, 180, 255, 0.15)' : 'rgba(200, 180, 255, 0.25)',
                      transform: 'translateY(-1px)',
                      boxShadow: darkMode ? '0 2px 8px rgba(200, 180, 255, 0.2)' : '0 2px 8px rgba(200, 180, 255, 0.3)'
                    }
                  }}>
                    <Icon icon="mdi:school" style={{ fontSize: '18px', color: '#7B5AF0' }} />
                    <Typography variant="body2" sx={{ color: darkMode ? 'white' : '#1B1B1F', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>Lessons</Typography>
                  </Box>
                </NavLink>
              )}

              {/* Donate */}
              <NavLink href="/donate">
                <Button
                  variant="contained"
                  startIcon={<Icon icon="mdi:heart" style={{ fontSize: '16px' }} />}
                    sx={{
                    textTransform: "none",
                      fontWeight: 600,
                    fontSize: "0.9rem",
                    background: "linear-gradient(135deg, #7B5AF0 0%, #A78BFA 100%)",
                    boxShadow: "0 2px 8px rgba(123, 90, 240, 0.3)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #6B4AE0 0%, #9778EA 100%)",
                      boxShadow: "0 4px 12px rgba(123, 90, 240, 0.4)",
                    },
                    }}
                  >
                    Donate
                </Button>
              </NavLink>
            </Box>
          </Box>

          {/* Right side controls - grouped together */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1.5,
            ml: 'auto',
            flexWrap: 'nowrap',
            whiteSpace: 'nowrap',
            minWidth: 'fit-content',
          }}>
            {/* Mobile Hamburger Menu */}
            <IconButton
              sx={{
                display: { xs: 'flex', lg: 'none' },
                ml: 2,
                background: 'linear-gradient(135deg, #7B5AF0 0%, #A78BFA 100%)',
                color: 'white',
                boxShadow: '0 4px 12px rgba(123, 90, 240, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #6D4EDB 0%, #9C7BFA 100%)',
                  boxShadow: '0 6px 16px rgba(123, 90, 240, 0.4)',
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
              onClick={toggleMobileMenu}
            >
              <Icon icon="mdi:menu" style={{ fontSize: '24px', color: 'white' }} />
            </IconButton>
            {/* Authentication Buttons - Hidden on mobile, shown on desktop */}
            <Box sx={{ display: { xs: 'none', lg: 'flex' }, alignItems: 'center', gap: 1 }}>
          {user ? (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #7B5AF0 0%, #A78BFA 100%)',
                    boxShadow: '0 2px 8px rgba(123, 90, 240, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #6D4EDB 0%, #9C7BFA 100%)',
                      boxShadow: '0 4px 12px rgba(123, 90, 240, 0.4)',
                      transform: 'translateY(-1px)',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  <Icon 
                    icon="mdi:account-circle" 
                    style={{ 
                      color: 'white', 
                      fontSize: '28px' 
                    }} 
                  />
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: darkMode ? "white" : "#1B1B1F",
                    fontWeight: 600,
                  }}
                >
                  {user.displayName || user.email}
                </Typography>
              </Box>
              <Button
                    variant="contained"
                onClick={handleLogout}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                      ml: 2, // Add left margin for spacing
                      background: "linear-gradient(135deg, #7B5AF0 0%, #A78BFA 100%)",
                      boxShadow: "0 2px 8px rgba(123, 90, 240, 0.3)",
                  "&:hover": {
                        background: "linear-gradient(135deg, #6B4AE0 0%, #9778EA 100%)",
                        boxShadow: "0 4px 12px rgba(123, 90, 240, 0.4)",
                  },
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <NavLink href="/login">
                <Button
                  sx={{
                    color: darkMode ? "white" : "#1B1B1F",
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    "&:hover": {
                      backgroundColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(123, 90, 240, 0.1)",
                    },
                  }}
                >
                  Login
                </Button>
              </NavLink>
              <NavLink href="/signup">
                <Button
                  variant="contained"
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    background: "linear-gradient(135deg, #7B5AF0 0%, #A78BFA 100%)",
                    boxShadow: "0 2px 8px rgba(123, 90, 240, 0.3)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #6B4AE0 0%, #9778EA 100%)",
                      boxShadow: "0 4px 12px rgba(123, 90, 240, 0.4)",
                    },
                  }}
                >
                  Sign Up
                </Button>
              </NavLink>
            </> 
          )}

            <IconButton
              onClick={switchDarkMode}
              edge="end"
              sx={{
                ml: 1,
                padding: '8px',
                backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(124, 90, 240, 0.05)',
                border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(124, 90, 240, 0.1)',
                '&:hover': {
                  backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(124, 90, 240, 0.1)',
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              {darkMode ? (
                <Icon icon="mdi:brightness-7" style={{ color: '#7B5AF0', fontSize: '24px' }} />
              ) : (
                <Icon icon="mdi:brightness-4" style={{ color: '#7B5AF0', fontSize: '24px' }} />
              )}
            </IconButton>
          </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={closeMobileMenu}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': {
            width: 280,
            backgroundColor: darkMode ? '#1B1B1F' : 'white',
            backgroundImage: darkMode
              ? 'linear-gradient(rgba(123, 90, 240, 0.05), rgba(123, 90, 240, 0.05))'
              : 'linear-gradient(rgba(123, 90, 240, 0.02), rgba(123, 90, 240, 0.02))',
          }
        }}
      >
        <Box sx={{ pt: 2, pb: 2 }}>
          {/* Logo in Drawer */}
          <Box sx={{ px: 2, mb: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Image
              src="/chesspoint_logo.png"
              alt="Chesspoint Logo"
              width={40}
              height={40}
              style={{ borderRadius: '8px' }}
            />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                background: 'linear-gradient(135deg, #7B5AF0 0%, #A78BFA 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Chesspoint
            </Typography>
          </Box>

          <Divider sx={{ mb: 1 }} />

          {/* Navigation Items */}
          <List>
            {navItems.map((item) => (
              <NavLink key={item.href} href={item.href}>
                  <ListItem
                    component="div"
                    onClick={closeMobileMenu}
                  sx={{
                    py: 1.5,
                    px: 2,
                    '&:hover': {
                      backgroundColor: darkMode ? 'rgba(123, 90, 240, 0.15)' : 'rgba(123, 90, 240, 0.1)',
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Icon icon={item.icon} style={{ fontSize: '22px', color: '#7B5AF0' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      sx: {
                        color: darkMode ? 'white' : '#1B1B1F',
                        fontWeight: 600,
                      }
                    }}
                  />
                </ListItem>
              </NavLink>
            ))}

            {/* Donate */}
            <NavLink href="/donate">
              <ListItem
                component="div"
                onClick={closeMobileMenu}
                sx={{
                  py: 1.5,
                  px: 2,
                  '&:hover': {
                    backgroundColor: darkMode ? 'rgba(123, 90, 240, 0.15)' : 'rgba(123, 90, 240, 0.1)',
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Icon icon="mdi:heart" style={{ fontSize: '22px', color: '#7B5AF0' }} />
                </ListItemIcon>
                <ListItemText
                  primary="Donate"
                  primaryTypographyProps={{
                    sx: {
                      color: darkMode ? 'white' : '#1B1B1F',
                      fontWeight: 600,
                    }
                  }}
                />
              </ListItem>
            </NavLink>
          </List>

          <Divider sx={{ my: 2 }} />

          {/* Auth Buttons in Drawer */}
          <Box sx={{ px: 2 }}>
            {user ? (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, px: 1 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #7B5AF0 0%, #A78BFA 100%)',
                      boxShadow: '0 2px 8px rgba(123, 90, 240, 0.3)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #6D4EDB 0%, #9C7BFA 100%)',
                        boxShadow: '0 4px 12px rgba(123, 90, 240, 0.4)',
                        transform: 'translateY(-1px)',
                      },
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    <Icon 
                      icon="mdi:account-circle" 
                      style={{ 
                        color: 'white', 
                        fontSize: '30px' 
                      }} 
                    />
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: darkMode ? 'white' : '#1B1B1F',
                      fontWeight: 600,
                    }}
                  >
                    {user.displayName || user.email}
                  </Typography>
                </Box>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleLogout}
                  startIcon={<Icon icon="mdi:logout" style={{ fontSize: '18px' }} />}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #7B5AF0 0%, #A78BFA 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #6B4AE0 0%, #9778EA 100%)',
                    },
                  }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  fullWidth
                  onClick={() => {
                    closeMobileMenu();
                    router.push('/login');
                  }}
                  startIcon={<Icon icon="mdi:login" style={{ fontSize: '18px' }} />}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    mb: 1,
                    color: '#7B5AF0',
                    border: '1px solid #7B5AF0',
                    '&:hover': {
                      backgroundColor: 'rgba(123, 90, 240, 0.1)',
                    },
                  }}
                >
                  Login
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => {
                    closeMobileMenu();
                    router.push('/signup');
                  }}
                  startIcon={<Icon icon="mdi:account-plus" style={{ fontSize: '18px' }} />}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #7B5AF0 0%, #A78BFA 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #6B4AE0 0%, #9778EA 100%)',
                    },
                  }}
                >
                  Sign Up
                </Button>
              </>
            )}
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Social & Theme Toggle */}
          <Box sx={{ px: 2, display: 'flex', justifyContent: 'space-around' }}>
            <IconButton onClick={switchDarkMode}>
              {darkMode ? (
                <Icon icon="mdi:brightness-7" style={{ color: '#7B5AF0', fontSize: '28px' }} />
              ) : (
                <Icon icon="mdi:brightness-4" style={{ color: '#7B5AF0', fontSize: '28px' }} />
              )}
            </IconButton>
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
}
