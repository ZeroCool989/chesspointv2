import { useState, FormEvent, useEffect } from "react";
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

export default function ResetPassword() {
  const router = useRouter();
  const { token } = router.query;
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Password validation checks
  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const passwordsMatch = password === confirmPassword;

  useEffect(() => {
    // Wait for router to be ready before checking token
    if (router.isReady && !token) {
      setError("Invalid or missing reset token");
    } else if (router.isReady && token) {
      // Clear error if token is present
      setError("");
    }
  }, [token, router.isReady]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!token) {
      setError("Invalid or missing reset token");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!Object.values(passwordChecks).every(Boolean)) {
      setError("Password does not meet all requirements");
      setShowPasswordRequirements(true);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        setError(data.error || "Failed to reset password");
      }
    } catch (err: any) {
      setError(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "transparent",
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
              Reset Password
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
              Enter your new password below
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success ? (
            <Box>
              <Alert severity="success" sx={{ mb: 3 }}>
                Password reset successfully! Redirecting to login page...
              </Alert>
            </Box>
          ) : (
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="New Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setShowPasswordRequirements(true)}
                required
                error={password.length > 0 && !Object.values(passwordChecks).every(Boolean)}
                sx={{
                  mb: showPasswordRequirements ? 2.5 : 1.5,
                  "& .MuiOutlinedInput-root": {
                    "& input": {
                      backgroundColor: "transparent !important",
                      color: "#000000 !important",
                      fontWeight: "500 !important",
                      "&::placeholder": {
                        color: "#6B7280 !important",
                      },
                      "&:-webkit-autofill": {
                        WebkitBoxShadow: "0 0 0 1000px white inset !important",
                        WebkitTextFillColor: "#000000 !important",
                        color: "#000000 !important",
                      },
                    },
                  },
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
                        onClick={() => setShowPassword(!showPassword)}
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
                            color: passwordChecks.length ? "#10B981" : "#9CA3AF",
                          }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary="At least 8 characters"
                        primaryTypographyProps={{
                          variant: "body2",
                          sx: { color: passwordChecks.length ? "#10B981" : "#6B7280" },
                        }}
                      />
                    </ListItem>
                    <ListItem sx={{ py: 0.5, px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <Icon
                          icon={passwordChecks.uppercase ? "mdi:check-circle" : "mdi:circle-outline"}
                          style={{
                            fontSize: "18px",
                            color: passwordChecks.uppercase ? "#10B981" : "#9CA3AF",
                          }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary="One uppercase letter (A-Z)"
                        primaryTypographyProps={{
                          variant: "body2",
                          sx: { color: passwordChecks.uppercase ? "#10B981" : "#6B7280" },
                        }}
                      />
                    </ListItem>
                    <ListItem sx={{ py: 0.5, px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <Icon
                          icon={passwordChecks.lowercase ? "mdi:check-circle" : "mdi:circle-outline"}
                          style={{
                            fontSize: "18px",
                            color: passwordChecks.lowercase ? "#10B981" : "#9CA3AF",
                          }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary="One lowercase letter (a-z)"
                        primaryTypographyProps={{
                          variant: "body2",
                          sx: { color: passwordChecks.lowercase ? "#10B981" : "#6B7280" },
                        }}
                      />
                    </ListItem>
                    <ListItem sx={{ py: 0.5, px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <Icon
                          icon={passwordChecks.number ? "mdi:check-circle" : "mdi:circle-outline"}
                          style={{
                            fontSize: "18px",
                            color: passwordChecks.number ? "#10B981" : "#9CA3AF",
                          }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary="One number (0-9)"
                        primaryTypographyProps={{
                          variant: "body2",
                          sx: { color: passwordChecks.number ? "#10B981" : "#6B7280" },
                        }}
                      />
                    </ListItem>
                    <ListItem sx={{ py: 0.5, px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <Icon
                          icon={passwordChecks.special ? "mdi:check-circle" : "mdi:circle-outline"}
                          style={{
                            fontSize: "18px",
                            color: passwordChecks.special ? "#10B981" : "#9CA3AF",
                          }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary="One special character (!@#$%^&*)"
                        primaryTypographyProps={{
                          variant: "body2",
                          sx: { color: passwordChecks.special ? "#10B981" : "#6B7280" },
                        }}
                      />
                    </ListItem>
                  </List>
                </Box>
              )}

              <TextField
                fullWidth
                label="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                error={confirmPassword.length > 0 && !passwordsMatch}
                helperText={confirmPassword.length > 0 && !passwordsMatch ? "Passwords do not match" : ""}
                sx={{
                  mb: 3,
                  "& .MuiOutlinedInput-root": {
                    "& input": {
                      backgroundColor: "transparent !important",
                      color: "#000000 !important",
                      fontWeight: "500 !important",
                      "&::placeholder": {
                        color: "#6B7280 !important",
                      },
                      "&:-webkit-autofill": {
                        WebkitBoxShadow: "0 0 0 1000px white inset !important",
                        WebkitTextFillColor: "#000000 !important",
                        color: "#000000 !important",
                      },
                    },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Icon icon="mdi:lock-check-outline" style={{ fontSize: "20px", color: "#7B5AF0" }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                        aria-label="toggle confirm password visibility"
                        type="button"
                      >
                        <Icon
                          icon={showConfirmPassword ? "mdi:eye-off" : "mdi:eye"}
                          style={{ fontSize: "22px", color: "#7B5AF0" }}
                        />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading || !token}
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
                {loading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          )}

          {/* Back to Login Link */}
          <Box sx={{ textAlign: "center", mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Remember your password?{" "}
              <MuiLink
                component={Link}
                href="/login"
                sx={{
                  color: "#7B5AF0",
                  fontWeight: 600,
                  textDecoration: "none",
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
              >
                Sign in
              </MuiLink>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

