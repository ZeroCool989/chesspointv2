/**
 * Auth API client for Chesspoint (frontend)
 * - Base URL: http://localhost:4001 (or NEXT_PUBLIC_API_URL)
 * - Uses cookies when present (credentials: 'include')
 * - Safe JSON parsing on errors
 * - Automatic access-token refresh + retry
 */

const API_URL =
  (process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:4001") as string;

export interface ApiError {
  error: string;
  details?: Array<{ field: string; message: string }>;
}

export class ValidationError extends Error {
  details: Array<{ field: string; message: string }>;
  constructor(message: string, details: Array<{ field: string; message: string }>) {
    super(message);
    this.name = "ValidationError";
    this.details = details;
  }
}

interface UserShape {
  id: string;
  email: string;
  username?: string | null;
  emailVerified: boolean;
  roles: string[];
  createdAt?: string;
  lastLoginAt?: string;
}

export interface LoginResponse {
  accessToken: string;
  user: UserShape;
}

export interface RegisterResponse {
  accessToken: string;
  user: UserShape;
}

interface RefreshResponse {
  accessToken: string;
}

export interface UserResponse {
  user: UserShape;
}

/** ---------- helpers ---------- */

function toApiUrl(u: string): string {
  // Allow absolute URLs; otherwise prefix with API_URL
  if (/^https?:\/\//i.test(u)) return u;
  return `${API_URL}${u.startsWith("/") ? "" : "/"}${u}`;
}

async function parseJsonSafe<T = unknown>(res: Response): Promise<T | {}> {
  try {
    const text = await res.text();
    return text ? (JSON.parse(text) as T) : {};
  } catch {
    return {};
  }
}

function getErrorMessage(data: unknown, fallback: string) {
  const msg =
    (data as ApiError)?.error ||
    (typeof data === "object" && data && "message" in (data as any) && (data as any).message) ||
    null;
  return (msg as string) || fallback;
}

/** ---------- endpoints ---------- */

/** Register a new user */
export async function register(
  email: string,
  password: string,
  username?: string
): Promise<RegisterResponse> {
  console.log("🟢 [API] register() function ENTERED");

  const url = toApiUrl("/auth/register");
  const payload: any = { email, password };
  // Only include username if provided and non-empty
  if (username && username.trim()) {
    payload.username = username.trim();
  }

  console.log("🟢 [API] register called with:", { email, username, API_URL });
  console.log("🟢 [API] register URL:", url);
  console.log("🟢 [API] register payload:", payload);
  console.log("🟢 [API] About to execute fetch...");

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      credentials: "include", // keep if backend uses cookies (refresh, etc.)
      body: JSON.stringify(payload),
    });
    console.log("🟢 [API] fetch completed successfully");
  } catch (fetchError: any) {
    console.error("🔴 [API] fetch FAILED with error:", fetchError);
    throw new Error(`Network request failed: ${fetchError.message || fetchError}`);
  }

  console.log("🟢 [API] register response status:", res.status);

  const data = (await parseJsonSafe<RegisterResponse | ApiError>(res)) as
    | RegisterResponse
    | ApiError;

  console.log("🟢 [API] register response data:", data);

  if (!res.ok) {
    const errorData = data as ApiError;
    if (errorData.details && errorData.details.length > 0) {
      throw new ValidationError(getErrorMessage(data, "Registration failed"), errorData.details);
    }
    throw new Error(getErrorMessage(data, "Registration failed"));
  }
  return data as RegisterResponse;
}

/** Login with email/username and password */
export async function login(emailOrUsername: string, password: string): Promise<LoginResponse> {
  console.log("🟢 [API] login() function ENTERED");
  const url = toApiUrl("/auth/login");
  console.log("🟢 [API] login URL:", url);
  console.log("🟢 [API] login payload:", { email: emailOrUsername });

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      credentials: "include",
      body: JSON.stringify({ email: emailOrUsername, password }),
    });
    console.log("🟢 [API] login fetch completed successfully");
  } catch (fetchError: any) {
    console.error("🔴 [API] login fetch FAILED with error:", fetchError);
    throw new Error(`Network request failed: ${fetchError.message || fetchError}`);
  }

  console.log("🟢 [API] login response status:", res.status);

  const data = (await parseJsonSafe<LoginResponse | ApiError>(res)) as
    | LoginResponse
    | ApiError;

  console.log("🟢 [API] login response data:", data);

  if (!res.ok) {
    throw new Error(getErrorMessage(data, "Login failed"));
  }
  return data as LoginResponse;
}

/** Global refresh promise for de-duplication (prevents multiple simultaneous refresh calls) */
let refreshPromise: Promise<string> | null = null;

/** Refresh access token using refresh token (typically in httpOnly cookie) */
export async function refreshAccessToken(): Promise<string> {
  // If a refresh is already in progress, return that promise
  if (refreshPromise) {
    return refreshPromise;
  }

  // Start new refresh
  refreshPromise = (async () => {
    try {
      const res = await fetch(toApiUrl("/auth/refresh"), {
        method: "POST",
        credentials: "include",
        headers: { Accept: "application/json" },
      });

      const data = (await parseJsonSafe<RefreshResponse | ApiError>(res)) as
        | RefreshResponse
        | ApiError;

      if (!res.ok) {
        throw new Error(getErrorMessage(data, "Token refresh failed"));
      }
      return (data as RefreshResponse).accessToken;
    } finally {
      // Reset the promise after completion (success or failure)
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/** Get current authenticated user (requires a valid access token) */
export async function getCurrentUser(accessToken: string): Promise<UserShape> {
  const res = await fetch(toApiUrl("/me"), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
    credentials: "include",
  });

  const data = (await parseJsonSafe<UserResponse | ApiError>(res)) as
    | UserResponse
    | ApiError;

  if (!res.ok) {
    throw new Error(getErrorMessage(data, "Failed to fetch user"));
  }
  return (data as UserResponse).user;
}

/** Logout user (invalidates refresh token server-side) */
export async function logout(): Promise<void> {
  const res = await fetch(toApiUrl("/auth/logout"), {
    method: "POST",
    credentials: "include",
    headers: { Accept: "application/json" },
  });

  // Remove access token from localStorage
  if (typeof window !== "undefined") {
    localStorage.removeItem("accessToken");
  }

  if (!res.ok) {
    const data = (await parseJsonSafe<ApiError>(res)) as ApiError;
    throw new Error(getErrorMessage(data, "Logout failed"));
  }
}

/**
 * Safely get current user - guards against missing/invalid tokens
 * Returns null if no token or if the token is invalid
 */
export async function safeGetCurrentUser(): Promise<UserShape | null> {
  try {
    // Check for token in localStorage
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken")?.trim()
        : null;

    // If no token, return null (guest user)
    if (!token) {
      return null;
    }

    // Try to fetch user with the token
    return await getCurrentUser(token);
  } catch (error) {
    // On error, remove the bad token and return null
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
    }
    console.error("Failed to get current user:", error);
    return null;
  }
}

export interface FetchWithAuthOptions {
  /** If true, automatically refresh token on 401. If false (default), return 401 without refresh. */
  tryRefresh?: boolean;
}

/**
 * Fetch with Authorization header and optional refresh on 401.
 * - `url` can be relative (e.g., "/protected") or absolute.
 * - `onTokenRefresh` is called with the new token after a successful refresh.
 * - `authOptions.tryRefresh` (default FALSE): if true, attempt refresh on 401; if false, return 401 immediately.
 */
export async function fetchWithAuth(
  url: string,
  options: RequestInit = {},
  accessToken: string | undefined,
  onTokenRefresh?: (newToken: string) => void,
  authOptions: FetchWithAuthOptions = { tryRefresh: false }
): Promise<Response> {
  const tryRefresh = authOptions.tryRefresh === true; // default false

  // If no token, immediately return a 401-style Response (do NOT hit refresh)
  if (!accessToken || !accessToken.trim()) {
    return new Response(JSON.stringify({ error: "No access token" }), {
      status: 401,
      statusText: "No access token",
      headers: { "Content-Type": "application/json" },
    });
  }

  const makeRequest = async (token: string) =>
    fetch(toApiUrl(url), {
      ...options,
      headers: {
        Accept: "application/json",
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });

  let res = await makeRequest(accessToken);

  // If expired/invalid access token, try refresh once and retry (if enabled)
  if (res.status === 401 && tryRefresh) {
    const newToken = await refreshAccessToken(); // will throw if refresh fails
    onTokenRefresh?.(newToken);
    res = await makeRequest(newToken);
  }

  return res;
}
