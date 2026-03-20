export type DeviceMessage = {
  messageId: string;
  deviceId: string;
  mobileModel: string;
  messageContent: string;
  timestamp: string;
};

export const mockMessages: DeviceMessage[] = [
  {
    messageId: "MSG-20001",
    deviceId: "DEV-10001",
    mobileModel: "Samsung Galaxy S24",
    messageContent: "User granted camera permission to monitoring app.",
    timestamp: "2026-03-12T11:15:00Z",
  },
  {
    messageId: "MSG-20002",
    deviceId: "DEV-10002",
    mobileModel: "iPhone 15 Pro",
    messageContent: "SMS sync completed with 12 new records.",
    timestamp: "2026-03-12T10:58:00Z",
  },
  {
    messageId: "MSG-20003",
    deviceId: "DEV-10003",
    mobileModel: "Google Pixel 8",
    messageContent: "Device lost network connectivity.",
    timestamp: "2026-03-12T09:39:00Z",
  },
  {
    messageId: "MSG-20004",
    deviceId: "DEV-10004",
    mobileModel: "OnePlus 12",
    messageContent: "Background service restarted after OS update.",
    timestamp: "2026-03-12T10:53:00Z",
  },
  {
    messageId: "MSG-20005",
    deviceId: "DEV-10005",
    mobileModel: "Xiaomi 14",
    messageContent: "Battery optimization blocked foreground capture.",
    timestamp: "2026-03-12T07:58:00Z",
  },
  {
    messageId: "MSG-20006",
    deviceId: "DEV-10006",
    mobileModel: "Motorola Edge 50",
    messageContent: "New outgoing message captured from SIM slot 1.",
    timestamp: "2026-03-12T10:08:00Z",
  },
  {
    messageId: "MSG-20007",
    deviceId: "DEV-10001",
    mobileModel: "Samsung Galaxy S24",
    messageContent: "Policy check passed for app integrity.",
    timestamp: "2026-03-12T10:05:00Z",
  },
  {
    messageId: "MSG-20008",
    deviceId: "DEV-10002",
    mobileModel: "iPhone 15 Pro",
    messageContent: "iCloud backup started while monitored app active.",
    timestamp: "2026-03-12T09:48:00Z",
  },
];

export function getMessagesByDeviceId(deviceId: string) {
  return mockMessages.filter((message) => message.deviceId === deviceId);
}
