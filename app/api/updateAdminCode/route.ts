import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebaseadmin";

const ADMIN_PATH = "admin/admin1";

type ChangeCodePayload = {
  currentCode?: unknown;
  newCode?: unknown;
  confirmCode?: unknown;
};

type AdminRecord = {
  code?: unknown;
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

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as ChangeCodePayload;
    const currentCode = getCode(payload.currentCode);
    const newCode = getCode(payload.newCode);
    const confirmCode = getCode(payload.confirmCode);

    if (!currentCode || !newCode || !confirmCode) {
      return NextResponse.json(
        {
          success: false,
          message: "Current code, new code and confirm code are required.",
        },
        { status: 400 },
      );
    }

    if (newCode !== confirmCode) {
      return NextResponse.json(
        {
          success: false,
          message: "New code and confirm code do not match.",
        },
        { status: 400 },
      );
    }

    if (newCode.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "New code must be at least 6 characters.",
        },
        { status: 400 },
      );
    }

    const adminRef = db.ref(ADMIN_PATH);
    const adminSnapshot = await adminRef.get();

    if (!adminSnapshot.exists() || typeof adminSnapshot.val() !== "object") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Admin setup not found. Complete first login before changing code.",
        },
        { status: 404 },
      );
    }

    const adminData = adminSnapshot.val() as AdminRecord;
    const savedCode = getCode(adminData.code);
    const activeUntil = getTimestamp(adminData.activeUntil);
    const now = Date.now();

    if (!savedCode) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Admin code not initialized. Complete first login before changing code.",
        },
        { status: 404 },
      );
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

    if (currentCode !== savedCode) {
      return NextResponse.json(
        { success: false, message: "Current code is invalid." },
        { status: 401 },
      );
    }

    if (newCode === savedCode) {
      return NextResponse.json(
        {
          success: false,
          message: "New code must be different from current code.",
        },
        { status: 400 },
      );
    }

    await adminRef.update({
      code: newCode,
      codeUpdatedAt: now,
    });

    return NextResponse.json({
      success: true,
      message: "Code updated successfully.",
      activeUntil,
    });
  } catch (error) {
    console.error("Error while updating admin code:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 },
    );
  }
}
