export const DEVICE_ONLINE_AVAILABLE = "Device is online";
export const DEVICE_OFFLINE_AVAILABLE = "Device is offline";
export const DEVICE_UNINSTALLED_AVAILABLE = "Device is uninstalled";

export type DeviceStatus = "online" | "offline" | "uninstalled";

export function getDeviceStatusFromAvailability(
  availability: unknown,
): DeviceStatus {
  if (availability === DEVICE_ONLINE_AVAILABLE) {
    return "online";
  }

  if (availability === DEVICE_UNINSTALLED_AVAILABLE) {
    return "uninstalled";
  }

  return "offline";
}
