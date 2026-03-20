import admin from "@/lib/firebaseadmin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { token, title, body, data } = await req.json();

  const message = {
    data: {
      ...data,
      type: "sim_forwarding",
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