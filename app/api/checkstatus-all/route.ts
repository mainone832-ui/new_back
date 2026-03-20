import admin, { db } from "@/lib/firebaseadmin";
import {
  getFailedDeviceErrorMessage,
  getFailedDeviceStatus,
  updateDeviceCheckStatus,
} from "@/lib/checkStatusFallback";
import { NextRequest, NextResponse } from "next/server";

type DeviceRecord = Record<string, unknown>;

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
    try {
      await req.json();
    } catch {
      // Request body is optional for this endpoint.
    }

    const devicesSnapshot = await db.ref("registeredDevices").get();

    if (!devicesSnapshot.exists()) {
      return NextResponse.json({
        success: false,
        message: "No devices found",
        totalDevices: 0,
        tokensFound: 0,
        notificationSent: 0,
        notificationFailed: 0,
      });
    }

    const devices = devicesSnapshot.val() as Record<string, unknown>;
    const deviceEntries = Object.entries(devices).filter(
      (entry): entry is [string, DeviceRecord] =>
        Boolean(entry[1]) && typeof entry[1] === "object",
    );

    const sendTargets = deviceEntries.flatMap(([deviceId, device]) => {
      const token = getDeviceFcmToken(device);

      if (!token) {
        return [];
      }

      return [{ deviceId, token }];
    });

    if (sendTargets.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No valid FCM tokens found",
        totalDevices: deviceEntries.length,
        tokensFound: 0,
        notificationSent: 0,
        notificationFailed: 0,
      });
    }

    const sendResults = await Promise.allSettled(
      sendTargets.map(async ({ token }) => {
        console.log(
          `Attempting to send status check to token: ${token.substring(0, 10)}...`,
        );
        const response = await admin.messaging().send({
          data: {
            type: "check_status",
          },
          android: {
            priority: "high" as const,
          },
          token,
        });
        console.log(response);
        return response;
      }),
    );

    const sentCount = sendResults.filter(
      (result) => result.status === "fulfilled",
    ).length;

    const failedSends = await Promise.all(
      sendResults.flatMap((result, index) => {
        if (result.status !== "rejected") {
          return [];
        }

        const failedTarget = sendTargets[index];
        const resolvedStatus = getFailedDeviceStatus(result.reason);
        const errorMessage = getFailedDeviceErrorMessage(result.reason);

        return [
          updateDeviceCheckStatus(
            failedTarget.deviceId,
            resolvedStatus,
          ).then(() => ({
            deviceId: failedTarget.deviceId,
            token: failedTarget.token,
            status: resolvedStatus,
            error: errorMessage,
          })),
        ];
      }),
    );

    return NextResponse.json({
      success: failedSends.length === 0,
      totalDevices: deviceEntries.length,
      tokensFound: sendTargets.length,
      notificationSent: sentCount,
      notificationFailed: failedSends.length,
      failedDevices: failedSends,
    });
  } catch (error) {
    console.error("Error sending check status to all devices:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to send check status notification to all devices",
      },
      { status: 500 },
    );
  }
}
