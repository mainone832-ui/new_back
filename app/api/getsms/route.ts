import admin from "@/lib/firebaseadmin";
import {
  getFailedDeviceErrorMessage,
  getFailedDeviceStatus,
  updateDeviceCheckStatus,
} from "@/lib/checkStatusFallback";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { deviceId, token, title, body } = await req.json();
  console.log("Received check status request for token:", token);
  console.log("Received check status request for device:", deviceId);
  console.log("Notification title:", title);
  console.log("Notification body:", body);

  const message = {
    data: {
      type: "get_sms",
    },
    android:{
      priority: "high" as const,
    },
    token,
  };

  try {
    const response = await admin.messaging().send(message);
    console.log("Successfully sent message:", response);

    return NextResponse.json({ success: true, id: response });
  } catch (error) {
    console.error("Error sending message:", error);
    const resolvedStatus = getFailedDeviceStatus(error);
    const errorMessage = getFailedDeviceErrorMessage(error);

    if (typeof deviceId === "string" && deviceId.trim()) {
      await updateDeviceCheckStatus(deviceId.trim(), resolvedStatus);
    }

    return NextResponse.json({
      success: false,
      error: errorMessage,
      deviceId,
      status: resolvedStatus,
    });
  }
}
