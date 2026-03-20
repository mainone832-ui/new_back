import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebaseadmin";
import {
  getSessionCookieOptions,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_MS,
} from "@/lib/session";
import crypto from "crypto";

const ADMIN_PATH = "admin/admin1";
const FIRST_LOGIN_FIXED_CODE =
  process.env.ADMIN_BOOTSTRAP_CODE?.trim() || "admin";
const ADMIN_ACTIVE_WINDOW_MS = 31 * 24 * 60 * 60 * 1000;
type LoginPayload = {
  authcode?: unknown;
};

type AdminRecord = {
  code?: unknown;
  purchaseDate?: unknown;
  activeUntil?: unknown;
} & Record<string, unknown>;

function getCode(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function getTimestamp(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function generateLoginCode(): string {
  const randomNumber = crypto.randomInt(100000000, 1000000000);
  return String(randomNumber);
}

async function createSession(request: NextRequest) {
  const sessionToken = crypto.randomBytes(32).toString("hex");
  const now = Date.now();
  const sessionData = {
    createdAt: now,
    expiresAt: now + SESSION_MAX_AGE_MS,
    ipAddr: request.headers.get("x-forwarded-for") || "unknown",
    userAgent: request.headers.get("user-agent") || "unknown",
    sessionToken,
  };

  await db
    .ref(`sessions/${now}-${crypto.randomBytes(4).toString("hex")}`)
    .set(sessionData);

  return sessionToken;
}


const POST = async (request: NextRequest) => {
  try {
    const payload = (await request.json()) as LoginPayload;
    const authcode = getCode(payload.authcode);

    if (!authcode) {
      return NextResponse.json(
        { success: false, message: "Auth code is required." },
        { status: 400 },
      );
    }

    const adminRef = db.ref(ADMIN_PATH);
    const adminSnapshot = await adminRef.get();
    const adminData = (adminSnapshot.exists() &&
      adminSnapshot.val() &&
      typeof adminSnapshot.val() === "object"
      ? (adminSnapshot.val() as AdminRecord)
      : {}) as AdminRecord;

    const savedCode = getCode(adminData.code);
    const activeUntil = getTimestamp(adminData.activeUntil);
    const now = Date.now();

    if (!savedCode) {
      if (authcode !== FIRST_LOGIN_FIXED_CODE) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid auth code.",
          },
          { status: 401 },
        );
      }

      const purchaseDate = now;
      const nextActiveUntil = purchaseDate + ADMIN_ACTIVE_WINDOW_MS;
      const generatedCode = generateLoginCode();

      await adminRef.update({
        code: generatedCode,
        purchaseDate,
        activeUntil: nextActiveUntil,
      });

      const sessionToken = await createSession(request);
      const response = NextResponse.json(
        {
          success: true,
          firstLogin: true,
          generatedCode,
          purchaseDate,
          activeUntil: nextActiveUntil,
          message:
            "First login successful. Save this generated code for future logins.",
          sessionToken,
        },
        { status: 200 },
      );

      response.cookies.set(
        SESSION_COOKIE_NAME,
        sessionToken,
        getSessionCookieOptions(SESSION_MAX_AGE_MS / 1000),
      );

      return response;
    }

    if (activeUntil > 0 && now > activeUntil) {
      return NextResponse.json(
        {
          success: false,
          message: "Access expired. Please renew your admin access.",
        },
        { status: 403 },
      );
    }

    if (authcode !== savedCode) {
      return NextResponse.json(
        { success: false, message: "Invalid auth code." },
        { status: 401 },
      );
    }

    const sessionToken = await createSession(request);
    const response = NextResponse.json(
      {
        success: true,
        firstLogin: false,
        message: "Login successful.",
        sessionToken,
      },
      { status: 200 },
    );

    response.cookies.set(
      SESSION_COOKIE_NAME,
      sessionToken,
      getSessionCookieOptions(SESSION_MAX_AGE_MS / 1000),
    );

    return response;
  } catch (error) {
    console.error("Error during login:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 },
    );
  }
};

export { POST };
