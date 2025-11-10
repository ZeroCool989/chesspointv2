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
  Checkbox,
  FormControlLabel,
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
import { ValidationError } from "@/lib/api";

export default function SignUp() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Password validation checks
  const passwordChecks = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
  };

  const allPasswordChecksPassed = Object.values(passwordChecks).every(Boolean);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (!allPasswordChecksPassed) {
      setError("Password does not meet all requirements");
      setShowPasswordRequirements(true);
      return false;
    }
    if (!agreedToTerms) {
      setError("Please agree to the Terms of Service and Privacy Policy");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    console.log("🚀 FORM SUBMIT TRIGGERED!");
    e.preventDefault();
    setError("");
    setFieldErrors({});

    console.log("📝 Form submitted successfully");
    console.log("✅ Agreed to terms:", agreedToTerms);
    console.log("🔍 signUp function available:", typeof signUp);

    if (!validateForm()) {
      console.log("❌ Form validation failed");
      return;
    }

    console.log("✅ Form validation passed, attempting signup...");
    setLoading(true);

    try {
      console.log("🔄 Calling signUp function...");
      await signUp(formData.email, formData.password, formData.username);
      console.log("🎉 Signup successful!");
      router.push("/");
    } catch (err: any) {
      console.error("💥 SIGNUP ERROR:", err);
      console.error("💥 Error details:", err.message);
      console.error("💥 Error stack:", err.stack);

      if (err instanceof ValidationError) {
        // Map backend validation errors to field-level errors
        const errors: Record<string, string> = {};
        err.details.forEach((detail) => {
          errors[detail.field] = detail.message;
        });
        setFieldErrors(errors);
        setError("Please fix the errors below");
      } else {
      setError(err.message || "Failed to create account");
      }
    } finally {
      setLoading(false);
    }
  };

  // Google sign-up removed - not supported in MongoDB backend yet
  // You can implement OAuth separately if needed

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
              Create Account
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Join Chesspoint and start improving your chess
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Sign Up Form */}
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Username"
              value={formData.username}
              onChange={handleChange("username")}
              required
              error={!!fieldErrors.username}
              helperText={fieldErrors.username}
              sx={{
                mb: 2.5,
                '& .MuiOutlinedInput-root': {
                  '& input': {
                    backgroundColor: 'transparent !important',
                    color: '#000000 !important', // Pure black for better visibility
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
                    <Icon icon="mdi:account-outline" style={{ fontSize: "20px", color: "#7B5AF0" }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={handleChange("email")}
              required
              error={!!fieldErrors.email}
              helperText={fieldErrors.email}
              sx={{
                mb: 2.5,
                '& .MuiOutlinedInput-root': {
                  '& input': {
                    backgroundColor: 'transparent !important',
                    color: '#000000 !important', // Pure black for better visibility
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
                    <Icon icon="mdi:email-outline" style={{ fontSize: "20px", color: "#7B5AF0" }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange("password")}
              onFocus={() => setShowPasswordRequirements(true)}
              required
              error={!!fieldErrors.password}
              sx={{
                mb: 2.5,
                '& .MuiOutlinedInput-root': {
                  '& input': {
                    backgroundColor: 'transparent !important',
                    color: '#000000 !important', // Pure black for better visibility
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
              helperText={fieldErrors.password}
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

            <TextField
              fullWidth
              label="Confirm Password"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={handleChange("confirmPassword")}
              required
              sx={{
                mb: 2.5,
                '& .MuiOutlinedInput-root': {
                  '& input': {
                    backgroundColor: 'transparent !important',
                    color: '#000000 !important', // Pure black for better visibility
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
                    <Icon icon="mdi:lock-check-outline" style={{ fontSize: "20px", color: "#7B5AF0" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                      aria-label="toggle confirm password visibility"
                    >
                      <Icon icon={showConfirmPassword ? "mdi:eye" : "mdi:eye-off"} style={{ fontSize: "22px", color: "#7B5AF0" }} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  sx={{
                    color: "#7B5AF0",
                    "&.Mui-checked": {
                      color: "#7B5AF0",
                    },
                  }}
                />
              }
              label={
                <Typography variant="body2" color="text.secondary">
                  I agree to the{" "}
                  <MuiLink
                    href="/terms"
                    target="_blank"
                    sx={{
                      color: "#7B5AF0",
                      textDecoration: "none",
                      "&:hover": { textDecoration: "underline" },
                    }}
                  >
                    Terms of Service
                  </MuiLink>{" "}
                  and{" "}
                  <MuiLink
                    href="/privacy"
                    target="_blank"
                    sx={{
                      color: "#7B5AF0",
                      textDecoration: "none",
                      "&:hover": { textDecoration: "underline" },
                    }}
                  >
                    Privacy Policy
                  </MuiLink>
                </Typography>
              }
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              onClick={() => console.log("🔘 SUBMIT BUTTON CLICKED!")}
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
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          {/* Login Link */}
          <Box sx={{ textAlign: "center", mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{" "}
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
