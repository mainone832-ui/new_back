import { db } from "@/lib/firebaseadmin";
import {
  DEVICE_OFFLINE_AVAILABLE,
  DEVICE_UNINSTALLED_AVAILABLE,
} from "@/lib/deviceStatus";

type CheckOnlineRecord = Record<string, unknown>;

export type FailedDeviceStatus = "offline" | "uninstalled";

function getErrorDetails(error: unknown): { code: string; message: string } {
  if (error instanceof Error) {
    const maybeCode =
      "code" in error && typeof error.code === "string" ? error.code : "";

    return {
      code: maybeCode,
      message: error.message,
    };
  }

  return {
    code: "",
    message: typeof error === "string" ? error : "Unknown FCM error",
  };
}

export function getFailedDeviceStatus(error: unknown): FailedDeviceStatus {
  const { code, message } = getErrorDetails(error);
  const normalizedCode = code.toLowerCase();
  const normalizedMessage = message.toLowerCase();

  if (
    normalizedCode.includes("registration-token-not-registered") ||
    normalizedMessage.includes("requested entity was not found")
  ) {
    return "uninstalled";
  }

  return "offline";
}

export function getFailedDeviceAvailability(status: FailedDeviceStatus): string {
  return status === "uninstalled"
    ? DEVICE_UNINSTALLED_AVAILABLE
    : DEVICE_OFFLINE_AVAILABLE;
}

export function getFailedDeviceErrorMessage(error: unknown): string {
  return getErrorDetails(error).message;
}

export async function updateDeviceCheckStatus(
  deviceId: string,
  status: FailedDeviceStatus,
  existingStatus?: CheckOnlineRecord,
) {
  const available = getFailedDeviceAvailability(status);

  await db
    .ref(`registeredDevices/${deviceId}/checkOnline/available`)
    .set(available);

  return { available };
}
