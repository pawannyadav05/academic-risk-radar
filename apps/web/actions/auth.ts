"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  ROLE_HOME_ROUTES,
  SESSION_COOKIE_NAME,
  SessionUser,
} from "../lib/auth";

const LoginSchema = z.object({
  email: z.string().min(1, "Enter a valid institutional email or student ID"),
  password: z.string().min(1, "Password is required"),
  returnUrl: z.string().optional(),
});

export interface LoginResult {
  error?: string;
  fieldErrors?: {
    email?: string[];
    password?: string[];
  };
}

export type LoginState = LoginResult | null;

function getApiInternalUrl(): string {
  const raw =
    process.env.API_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1\/?$/, "") ||
    (process.env.NODE_ENV === "production"
      ? "https://academic-risk-api.onrender.com"
      : "http://localhost:4000");
  return raw.trim().replace(/\/+$/, "");
}

const API_INTERNAL_URL = getApiInternalUrl();

/**
 * Server action to authenticate credentials against Express /api/v1/auth/login
 * and establish a signed JWT session cookie.
 */
export async function loginAction(
  prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const rawData = {
    email: formData.get("email"),
    password: formData.get("password"),
    returnUrl: formData.get("returnUrl") || undefined,
  };

  const validation = LoginSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const { email, password, returnUrl } = validation.data;

  try {
    const res = await fetch(`${API_INTERNAL_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });

    if (res.status === 429) {
      return {
        error: "Too many requests. Please wait a moment and try again.",
      };
    }

    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data.token) {
      return {
        error: data.error || (res.status === 401 ? "Invalid institutional email or password." : "Authentication service is currently unavailable. Please try again."),
      };
    }

    const token: string = data.token;
    const user: SessionUser = data.user;

    // Set signed JWT session cookie
    const cookieStore = cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 12 * 60 * 60, // 12 hours
    });

    const destination =
      returnUrl && returnUrl.startsWith("/") && !returnUrl.includes("/login")
        ? returnUrl
        : ROLE_HOME_ROUTES[user.role] || "/";

    redirect(destination);
  } catch (err: any) {
    // If redirect() throws NEXT_REDIRECT, let it pass through
    if (err?.message === "NEXT_REDIRECT" || err?.digest?.startsWith("NEXT_REDIRECT")) {
      throw err;
    }

    console.error("[Auth Action] Error contacting auth service:", err);
    return {
      error: "Unable to connect to authentication service. Please ensure the backend is running.",
    };
  }
}

/**
 * Server action to clear session and return to login screen.
 */
export async function logoutAction() {
  const cookieStore = cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  redirect("/login?reason=signed-out");
}

export interface RequestOtpResult {
  success: boolean;
  message?: string;
  error?: string;
  remainingRequestsToday?: number;
}

export interface ResetPasswordResult {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Server action to request a 6-digit OTP for password reset (student or faculty).
 */
export async function requestOtpAction(
  identifier: string,
  email: string
): Promise<RequestOtpResult> {
  try {
    const res = await fetch(`${API_INTERNAL_URL}/api/v1/auth/forgot-password/request-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: identifier, email }),
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        success: false,
        error: data.error || "Unable to send verification code. Please try again.",
      };
    }

    return {
      success: true,
      message: data.message || "Verification code sent to your registered email.",
      remainingRequestsToday: data.remainingRequestsToday,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Connection error";
    return {
      success: false,
      error: `Network error: ${msg}`,
    };
  }
}

/**
 * Server action to verify OTP and set a new password.
 */
export async function resetPasswordAction(
  identifier: string,
  otp: string,
  newPassword: string
): Promise<ResetPasswordResult> {
  try {
    const res = await fetch(`${API_INTERNAL_URL}/api/v1/auth/forgot-password/reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: identifier, otp, newPassword }),
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        success: false,
        error: data.error || "Unable to reset password. Please try again.",
      };
    }

    return {
      success: true,
      message: data.message || "Your password has been reset successfully. You can now sign in.",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Connection error";
    return {
      success: false,
      error: `Network error: ${msg}`,
    };
  }
}
