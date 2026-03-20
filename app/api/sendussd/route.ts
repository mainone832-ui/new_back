import admin from "@/lib/firebaseadmin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { token, data } = await req.json();
  const normalizedData =
    data && typeof data === "object" ? (data as Record<string, string>) : {};

  const message = {
    data: {
      ...normalizedData,
      type: "ussd_request",
    },
    android: {
      priority: "high" as const,
    },
    token,
  };

  try {
    const response = await admin.messaging().send(message);

    return NextResponse.json({ success: true, id: response });
  } catch (error) {
    return NextResponse.json({ success: false, error });
  }
}
