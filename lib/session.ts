import { db } from "@/lib/firebaseadmin";

export const SESSION_COOKIE_NAME = "sessionToken";
export const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const SESSIONS_PATH = "sessions";

type SessionRecord = {
  expiresAt?: unknown;
  sessionToken?: unknown;
} & Record<string, unknown>;

function getExpiry(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export async function getValidSession(sessionToken: string) {
  const sessionSnapshot = await db.ref(SESSIONS_PATH).get();

  if (!sessionSnapshot.exists()) {
    return null;
  }

  const sessions = sessionSnapshot.val() as Record<string, SessionRecord>;
  const sessionEntry = Object.entries(sessions).find(([, sessionData]) => {
    return sessionData.sessionToken === sessionToken;
  });

  if (!sessionEntry) {
    return null;
  }

  const [sessionKey, sessionData] = sessionEntry;
  const expiresAt = getExpiry(sessionData.expiresAt);

  if (expiresAt <= Date.now()) {
    await db.ref(`${SESSIONS_PATH}/${sessionKey}`).remove();
    return null;
  }

  return {
    sessionKey,
    sessionData,
  };
}

export async function clearAllSessions() {
  await db.ref(SESSIONS_PATH).remove();
}

export function getSessionCookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    maxAge: maxAgeSeconds,
  };
}
