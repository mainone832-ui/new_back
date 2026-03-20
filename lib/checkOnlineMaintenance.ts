import { db } from "@/lib/firebaseadmin";
import {
  DEVICE_OFFLINE_AVAILABLE,
  DEVICE_UNINSTALLED_AVAILABLE,
} from "@/lib/deviceStatus";

const DEFAULT_OFFLINE_THRESHOLD_MS = 15 * 60 * 1000;

type CheckOnlineStatus = Record<string, unknown>;
type DeviceRecord = {
  checkOnline?: CheckOnlineStatus;
} & Record<string, unknown>;

export type CheckOnlineMaintenanceResult = {
  scannedCount: number;
  staleCount: number;
  updatedCount: number;
  thresholdMinutes: number;
  processedAt: number;
};

function parseCheckedAtTimestamp(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return value;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (!trimmed) {
      return null;
    }

    const numericValue = Number(trimmed);

    if (Number.isFinite(numericValue) && numericValue > 0) {
      return numericValue;
    }

    const parsedDateValue = Date.parse(trimmed);

    if (!Number.isNaN(parsedDateValue)) {
      return parsedDateValue;
    }
  }

  return null;
}

export async function markStaleDevicesOffline(
  thresholdMs: number = DEFAULT_OFFLINE_THRESHOLD_MS,
): Promise<CheckOnlineMaintenanceResult> {
  const processedAt = Date.now();

  const [devicesSnapshot] = await Promise.all([
    db.ref("registeredDevices").get(),
  ]);

  if (!devicesSnapshot.exists()) {
    return {
      scannedCount: 0,
      staleCount: 0,
      updatedCount: 0,
      thresholdMinutes: Math.floor(thresholdMs / (60 * 1000)),
      processedAt,
    };
  }

  const devices = devicesSnapshot.val() as Record<string, unknown>;

  const updates: Record<string, unknown> = {};

  let staleCount = 0;
  let updatedCount = 0;

  for (const [deviceId, rawDevice] of Object.entries(devices)) {
    if (!rawDevice || typeof rawDevice !== "object") {
      continue;
    }

    const device = rawDevice as DeviceRecord;
    const status =
      device.checkOnline && typeof device.checkOnline === "object"
        ? device.checkOnline
        : null;

    if (!status) {
      continue;
    }

    const checkedAt = parseCheckedAtTimestamp(
      status.checkedAt ?? status.lastChecked,
    );

    if (!checkedAt) {
      continue;
    }

    if (processedAt - checkedAt <= thresholdMs) {
      continue;
    }

    staleCount += 1;

    if (
      status.available === DEVICE_OFFLINE_AVAILABLE ||
      status.available === DEVICE_UNINSTALLED_AVAILABLE
    ) {
      continue;
    }

    updatedCount += 1;

    updates[`registeredDevices/${deviceId}/checkOnline/available`] =
      DEVICE_OFFLINE_AVAILABLE;
  }

  if (Object.keys(updates).length > 0) {
    await db.ref().update(updates);
  }

  return {
    scannedCount: Object.keys(devices).length,
    staleCount,
    updatedCount,
    thresholdMinutes: Math.floor(thresholdMs / (60 * 1000)),
    processedAt,
  };
}
