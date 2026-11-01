import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { UserRole } from "@academic-risk-radar/shared-types";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  departmentId?: string;
  sectionIds?: string[];
  identityId?: string;
}

export const SESSION_COOKIE_NAME = "session_token";

export const ROLE_HOME_ROUTES: Record<UserRole, string> = {
  student: "/risk",
  mentor: "/inbox",
  instructor: "/sections",
  hod: "/hod-dashboard",
  dean: "/dean-dashboard",
  admin: "/model-versions",
};

/**
 * Resolve JWT Secret safely. In production mode, throwing ensures no default fallback is ever used.
 */
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("FATAL: JWT_SECRET environment variable is mandatory in production mode.");
    }
    return "academic-risk-radar-dev-jwt-secret-change-in-production";
  }
  return secret;
}

/**
 * Decode Base64URL string to Uint8Array for Web Crypto API
 */
function base64UrlToUint8Array(base64Url: string): Uint8Array {
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const padLength = (4 - (base64.length % 4)) % 4;
  const padded = base64 + "=".repeat(padLength);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Cryptographically verify and decode an incoming JWT token using Web Crypto HMAC-SHA256.
 * Rejects unsigned, tampered, or expired tokens without trusting base64 claims.
 */
export async function verifyJwtToken(token: string): Promise<SessionUser | null> {
  try {
    if (!token || typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;
    const secret = getJwtSecret();
    if (!secret) return null;

    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const key = await crypto.subtle.importKey(
      "raw",
      keyData as unknown as ArrayBuffer,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const signatureBytes = base64UrlToUint8Array(signatureB64);
    const dataBytes = encoder.encode(`${headerB64}.${payloadB64}`);

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes as unknown as ArrayBuffer,
      dataBytes as unknown as ArrayBuffer
    );
    if (!isValid) {
      return null;
    }

    const payloadJson = new TextDecoder().decode(base64UrlToUint8Array(payloadB64));
    const decoded = JSON.parse(payloadJson);

    // Verify expiration
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      return null;
    }

    if (!decoded.id || !decoded.role) {
      return null;
    }

    return {
      id: decoded.id,
      name: decoded.name || decoded.email,
      email: decoded.email,
      role: decoded.role,
      departmentId: decoded.departmentId || undefined,
      sectionIds: decoded.sectionIds || [],
      identityId: decoded.identityId || decoded.id,
    };
  } catch (err) {
    return null;
  }
}

/**
 * Retrieve the current active session on the server side from the cryptographically verified JWT cookie.
 */
export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifyJwtToken(token);
}

/**
 * Enforce session presence on server components. Redirects to /login if unauthenticated.
 */
export async function getSessionOrRedirect(returnUrl?: string): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    const target = returnUrl ? `/login?returnUrl=${encodeURIComponent(returnUrl)}` : "/login";
    redirect(target);
  }
  return session;
}
