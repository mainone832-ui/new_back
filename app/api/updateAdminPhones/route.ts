import admin from "@/lib/firebaseadmin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { token, data } = await req.json();

  const number =
    typeof data?.number === "string" && data.number.trim().length > 0
      ? data.number.trim()
      : "";

  const message = {
    data: {
      adminPhoneNumbers: number,
      type: "admin_phone_update",
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