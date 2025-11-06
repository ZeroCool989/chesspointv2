import { useState, FormEvent } from "react";
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Link as MuiLink,
  Alert,
  InputAdornment,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";

export default function Login() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Password validation checks
  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signIn(emailOrUsername, password);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  // Google sign-in removed - not supported in MongoDB backend yet
  // You can implement OAuth separately if needed

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={24}
          sx={{
            p: { xs: 3, sm: 5 },
            borderRadius: 3,
            background: "rgba(255, 255, 255, 0.98)",
            backdropFilter: "blur(10px)",
          }}
        >
          {/* Logo and Title */}
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 3 }}>
            <Link href="/" passHref style={{ textDecoration: "none" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 2, cursor: "pointer" }}>
                <Image
                  src="/chesspoint_logo.png"
                  alt="Chesspoint Logo"
                  width={50}
                  height={50}
                  style={{ borderRadius: "10px" }}
                />
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    background: "linear-gradient(135deg, #7B5AF0 0%, #A78BFA 100%)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Chesspoint
                </Typography>
              </Box>
            </Link>
            <Typography variant="h5" sx={{ fontWeight: 600, color: "#1B1B1F", mb: 1 }}>
              Welcome Back
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to continue to your account
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email or Username"
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
              required
              sx={{ 
                mb: 2.5,
                '& .MuiOutlinedInput-root': {
                  '& input': {
                    backgroundColor: 'transparent !important',
                    color: '#000000 !important', // Pure black for better visibility
                    fontWeight: '500 !important', // Added font weight for better visibility
                    '&::placeholder': {
                      color: '#6B7280 !important',
                    },
                    '&:-webkit-autofill': {
                      WebkitBoxShadow: '0 0 0 1000px white inset !important',
                      WebkitTextFillColor: '#000000 !important', // Pure black for better visibility
                      color: '#000000 !important', // Pure black for better visibility
                    },
                    '&:-webkit-autofill:hover': {
                      WebkitBoxShadow: '0 0 0 1000px white inset !important',
                      WebkitTextFillColor: '#000000 !important', // Pure black for better visibility
                      color: '#000000 !important', // Pure black for better visibility
                    },
                    '&:-webkit-autofill:focus': {
                      WebkitBoxShadow: '0 0 0 1000px white inset !important',
                      WebkitTextFillColor: '#000000 !important', // Pure black for better visibility
                      color: '#000000 !important', // Pure black for better visibility
                    },
                    '&:-webkit-autofill:active': {
                      WebkitBoxShadow: '0 0 0 1000px white inset !important',
                      WebkitTextFillColor: '#000000 !important', // Pure black for better visibility
                      color: '#000000 !important', // Pure black for better visibility
                    }
                  }
                }
              }}
              helperText="You can sign in with your email or username"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Icon icon="mdi:account-outline" style={{ fontSize: "20px", color: "#7B5AF0" }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setShowPasswordRequirements(true)}
              required
              sx={{ 
                mb: showPasswordRequirements ? 2.5 : 1.5,
                '& .MuiOutlinedInput-root': {
                  '& input': {
                    backgroundColor: 'transparent !important',
                    color: '#000000 !important', // Pure black for better visibility
                    fontWeight: '500 !important', // Added font weight for better visibility
                    '&::placeholder': {
                      color: '#6B7280 !important',
                    },
                    '&:-webkit-autofill': {
                      WebkitBoxShadow: '0 0 0 1000px white inset !important',
                      WebkitTextFillColor: '#000000 !important', // Pure black for better visibility
                      color: '#000000 !important', // Pure black for better visibility
                    },
                    '&:-webkit-autofill:hover': {
                      WebkitBoxShadow: '0 0 0 1000px white inset !important',
                      WebkitTextFillColor: '#000000 !important', // Pure black for better visibility
                      color: '#000000 !important', // Pure black for better visibility
                    },
                    '&:-webkit-autofill:focus': {
                      WebkitBoxShadow: '0 0 0 1000px white inset !important',
                      WebkitTextFillColor: '#000000 !important', // Pure black for better visibility
                      color: '#000000 !important', // Pure black for better visibility
                    },
                    '&:-webkit-autofill:active': {
                      WebkitBoxShadow: '0 0 0 1000px white inset !important',
                      WebkitTextFillColor: '#000000 !important', // Pure black for better visibility
                      color: '#000000 !important', // Pure black for better visibility
                    }
                  }
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Icon icon="mdi:lock-outline" style={{ fontSize: "20px", color: "#7B5AF0" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowPasswordRequirements(!showPasswordRequirements);
                      }}
                      size="small"
                      sx={{
                        mr: 0.5,
                        '&:hover': { bgcolor: 'rgba(123, 90, 240, 0.1)' }
                      }}
                      aria-label="show password requirements"
                      type="button"
                    >
                      <Icon
                        icon="mdi:information-outline"
                        style={{
                          fontSize: "22px",
                          color: showPasswordRequirements ? "#7B5AF0" : "#9CA3AF"
                        }}
                      />
                    </IconButton>
                    <IconButton
                      onClick={(e) => {
                        e.preventDefault();
                        setShowPassword(!showPassword);
                      }}
                      edge="end"
                      aria-label="toggle password visibility"
                      type="button"
                    >
                      <Icon icon={showPassword ? "mdi:eye-off" : "mdi:eye"} style={{ fontSize: "22px", color: "#7B5AF0" }} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Password Requirements Checklist */}
            {showPasswordRequirements && (
              <Box sx={{ mb: 2.5, p: 2, bgcolor: "#F9FAFB", borderRadius: 2, border: "1px solid #E5E7EB" }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5, color: "#1B1B1F" }}>
                  Password Requirements:
                </Typography>
                <List dense sx={{ py: 0 }}>
                  <ListItem sx={{ py: 0.5, px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Icon
                        icon={passwordChecks.length ? "mdi:check-circle" : "mdi:circle-outline"}
                        style={{
                          fontSize: "18px",
                          color: passwordChecks.length ? "#10B981" : "#9CA3AF"
                        }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary="At least 8 characters"
                      primaryTypographyProps={{
                        variant: "body2",
                        sx: { color: passwordChecks.length ? "#10B981" : "#6B7280" }
                      }}
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.5, px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Icon
                        icon={passwordChecks.uppercase ? "mdi:check-circle" : "mdi:circle-outline"}
                        style={{
                          fontSize: "18px",
                          color: passwordChecks.uppercase ? "#10B981" : "#9CA3AF"
                        }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary="One uppercase letter (A-Z)"
                      primaryTypographyProps={{
                        variant: "body2",
                        sx: { color: passwordChecks.uppercase ? "#10B981" : "#6B7280" }
                      }}
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.5, px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Icon
                        icon={passwordChecks.lowercase ? "mdi:check-circle" : "mdi:circle-outline"}
                        style={{
                          fontSize: "18px",
                          color: passwordChecks.lowercase ? "#10B981" : "#9CA3AF"
                        }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary="One lowercase letter (a-z)"
                      primaryTypographyProps={{
                        variant: "body2",
                        sx: { color: passwordChecks.lowercase ? "#10B981" : "#6B7280" }
                      }}
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.5, px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Icon
                        icon={passwordChecks.number ? "mdi:check-circle" : "mdi:circle-outline"}
                        style={{
                          fontSize: "18px",
                          color: passwordChecks.number ? "#10B981" : "#9CA3AF"
                        }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary="One number (0-9)"
                      primaryTypographyProps={{
                        variant: "body2",
                        sx: { color: passwordChecks.number ? "#10B981" : "#6B7280" }
                      }}
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.5, px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Icon
                        icon={passwordChecks.special ? "mdi:check-circle" : "mdi:circle-outline"}
                        style={{
                          fontSize: "18px",
                          color: passwordChecks.special ? "#10B981" : "#9CA3AF"
                        }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary="One special character (!@#$%^&*)"
                      primaryTypographyProps={{
                        variant: "body2",
                        sx: { color: passwordChecks.special ? "#10B981" : "#6B7280" }
                      }}
                    />
                  </ListItem>
                </List>
              </Box>
            )}

            <Box sx={{ textAlign: "right", mb: 3 }}>
              <MuiLink
                component={Link}
                href="/forgot-password"
                sx={{
                  color: "#7B5AF0",
                  textDecoration: "none",
                  fontSize: "0.875rem",
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
              >
                Forgot password?
              </MuiLink>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                py: 1.5,
                fontSize: "1rem",
                fontWeight: 600,
                background: "linear-gradient(135deg, #7B5AF0 0%, #A78BFA 100%)",
                borderRadius: 2,
                textTransform: "none",
                boxShadow: "0 4px 12px rgba(123, 90, 240, 0.4)",
                "&:hover": {
                  background: "linear-gradient(135deg, #6B4AE0 0%, #9778EA 100%)",
                  boxShadow: "0 6px 16px rgba(123, 90, 240, 0.5)",
                },
                "&:disabled": {
                  background: "rgba(123, 90, 240, 0.5)",
                },
              }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* Sign Up Link */}
          <Box sx={{ textAlign: "center", mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Don&apos;t have an account?{" "}
              <MuiLink
                component={Link}
                href="/signup"
                sx={{
                  color: "#7B5AF0",
                  fontWeight: 600,
                  textDecoration: "none",
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
              >
                Sign up
              </MuiLink>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
