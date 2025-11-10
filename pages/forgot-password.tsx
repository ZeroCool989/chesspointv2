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
} from "@mui/material";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        setError(data.error || "Failed to send password reset email");
      }
    } catch (err: any) {
      setError(err.message || "Failed to send password reset email");
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
              Enter your email address and we&apos;ll send you a link to reset your password.
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
                Password reset email sent! Please check your inbox and follow the instructions to reset your password.
              </Alert>
              <Box sx={{ textAlign: "center", mt: 3 }}>
                <Button
                  component={Link}
                  href="/login"
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
                  Back to Login
                </Button>
              </Box>
            </Box>
          ) : (
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
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
                      "&:-webkit-autofill:hover": {
                        WebkitBoxShadow: "0 0 0 1000px white inset !important",
                        WebkitTextFillColor: "#000000 !important",
                        color: "#000000 !important",
                      },
                      "&:-webkit-autofill:focus": {
                        WebkitBoxShadow: "0 0 0 1000px white inset !important",
                        WebkitTextFillColor: "#000000 !important",
                        color: "#000000 !important",
                      },
                      "&:-webkit-autofill:active": {
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
                      <Icon icon="mdi:email-outline" style={{ fontSize: "20px", color: "#7B5AF0" }} />
                    </InputAdornment>
                  ),
                }}
              />

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
                {loading ? "Sending..." : "Send Reset Link"}
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

