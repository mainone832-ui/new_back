
import type { DeviceStatus } from "@/lib/deviceStatus";

interface Device {
  deviceId: string,
  model: string,
  brand: string,
  androidVersion: string,
  joinedAt: string,
  fcmToken: string,
  manufacturer: string,
  sim1Carrier: string,
  sim1number: string,
  sim2Carrier: string,
  sim2number: string,
  forwardingSim: "sim1" | "sim2" | null,
  onlineStatus: DeviceStatus,
  lastChecked: string,
  adminPhoneNumber: string[],
  isfavorite?: boolean,
}

export default Device;
