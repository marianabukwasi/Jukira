import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { SessionUser, UserRole } from "./types";

const SESSION_COOKIE = "jukira_session";
const SECRET_KEY = new TextEncoder().encode(
  process.env.JUKIRA_SECRET ||
    process.env.LEGASEE_SECRET ||
    "jukira-local-dev-secret-change-in-production"
);

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function signSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    sub: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    funeralHomeId: user.funeralHomeId ?? null,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET_KEY);
}

export async function verifySessionToken(
  token: string
): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    if (!payload.sub || !payload.email || !payload.role) return null;
    return {
      id: String(payload.sub),
      name: String(payload.name || ""),
      email: String(payload.email),
      role: payload.role as UserRole,
      funeralHomeId: payload.funeralHomeId
        ? String(payload.funeralHomeId)
        : null,
    };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function setSessionCookie(user: SessionUser): Promise<void> {
  const token = await signSessionToken(user);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.COOKIE_SECURE === "true" || process.env.VERCEL === "1",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function requireRole(
  allowedRoles: UserRole[]
): Promise<SessionUser | null> {
  const session = await getSession();
  if (!session) return null;
  if (!allowedRoles.includes(session.role)) return null;
  return session;
}
