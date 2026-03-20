export type Device = {
  id: string;
  model: string;
  owner: string;
  os: string;
  osVersion: string;
  status: "online" | "offline";
  lastSeen: string;
  location: string;
  carrier: string;
  battery: number;
  risk: "low" | "medium" | "high";
};

export type Message = {
  id: string;
  deviceId: string;
  direction: "inbound" | "outbound";
  body: string;
  timestamp: string;
};

export const devices: Device[] = [
  {
    id: "D-24831",
    model: "Pixel 8 Pro",
    owner: "Rahul Sharma",
    os: "Android",
    osVersion: "14",
    status: "online",
    lastSeen: "2026-03-12T08:45:00Z",
    location: "Bengaluru, IN",
    carrier: "Jio",
    battery: 82,
    risk: "low",
  },
  {
    id: "D-24832",
    model: "iPhone 15 Pro",
    owner: "Ananya Verma",
    os: "iOS",
    osVersion: "18.2",
    status: "online",
    lastSeen: "2026-03-12T08:40:00Z",
    location: "Mumbai, IN",
    carrier: "Airtel",
    battery: 57,
    risk: "medium",
  },
  {
    id: "D-24833",
    model: "Galaxy S24 Ultra",
    owner: "Vikram Rao",
    os: "Android",
    osVersion: "15",
    status: "offline",
    lastSeen: "2026-03-12T06:10:00Z",
    location: "Delhi, IN",
    carrier: "Vodafone",
    battery: 34,
    risk: "low",
  },
  {
    id: "D-24834",
    model: "OnePlus 12",
    owner: "Sara Ali",
    os: "Android",
    osVersion: "15",
    status: "online",
    lastSeen: "2026-03-12T08:50:00Z",
    location: "Hyderabad, IN",
    carrier: "Jio",
    battery: 65,
    risk: "high",
  },
  {
    id: "D-24835",
    model: "iPhone 14",
    owner: "Mohit Jain",
    os: "iOS",
    osVersion: "17.6",
    status: "offline",
    lastSeen: "2026-03-11T21:25:00Z",
    location: "Pune, IN",
    carrier: "Airtel",
    battery: 18,
    risk: "medium",
  },
];

export const messages: Message[] = [
  {
    id: "M-1001",
    deviceId: "D-24831",
    direction: "outbound",
    body: "App deployment completed successfully.",
    timestamp: "2026-03-12T08:30:00Z",
  },
  {
    id: "M-1002",
    deviceId: "D-24831",
    direction: "inbound",
    body: "Battery optimizing in background.",
    timestamp: "2026-03-12T08:25:00Z",
  },
  {
    id: "M-1003",
    deviceId: "D-24832",
    direction: "outbound",
    body: "Alert: New SIM detected on device.",
    timestamp: "2026-03-12T07:58:00Z",
  },
  {
    id: "M-1004",
    deviceId: "D-24834",
    direction: "inbound",
    body: "Screenshot captured for policy audit.",
    timestamp: "2026-03-12T07:30:00Z",
  },
  {
    id: "M-1005",
    deviceId: "D-24833",
    direction: "inbound",
    body: "Device switched to roaming network.",
    timestamp: "2026-03-12T06:05:00Z",
  },
  {
    id: "M-1006",
    deviceId: "D-24835",
    direction: "outbound",
    body: "Security patch scheduled for tonight.",
    timestamp: "2026-03-11T20:40:00Z",
  },
];

export function getDeviceById(id: string) {
  return devices.find((device) => device.id === id);
}

export function getMessagesForDevice(id: string) {
  return messages.filter((message) => message.deviceId === id);
}
