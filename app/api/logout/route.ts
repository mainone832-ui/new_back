import {
  clearAllSessions,
  getSessionCookieOptions,
  getValidSession,
  SESSION_COOKIE_NAME,
} from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

function buildLogoutResponse(body: Record<string, unknown>, status = 200) {
  const response = NextResponse.json(body, { status });
  response.cookies.set(SESSION_COOKIE_NAME, "", getSessionCookieOptions(0));
  return response;
}

export async function POST(request: NextRequest) {
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value?.trim();

  if (!sessionToken) {
    return buildLogoutResponse({ success: true });
  }

  try {
    const session = await getValidSession(sessionToken);

    if (session) {
      await clearAllSessions();
    }
  } catch (error) {
    console.error("Failed to clear sessions during logout", error);
    return buildLogoutResponse(
      {
        success: false,
        message: "Failed to terminate all active sessions. Please try again.",
      },
      500,
    );
  }

  return buildLogoutResponse({ success: true });
}
