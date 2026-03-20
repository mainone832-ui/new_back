export type DeviceStatus = "online" | "offline";

export type SIMCard = {
  simNumber: number;
  phoneNumber: string | null;
  carrier: string | null;
};

export type Device = {
  deviceId: string;
  modelName: string;
  manufacturer: string;
  osVersion: string;
  batteryLevel: number;
  lastActive: string;
  status: DeviceStatus;
  brand: string;
  model: string;
  androidVersion: string;
  simOperator: string;
  registeredAt: number;
  forwardingSim: "sim1" | "sim2" | null;
  sims: SIMCard[];
  adminPhoneNumbers: string[];
};

export const mockDevices: Device[] = [
  {
    deviceId: "DEV-10001",
    modelName: "Samsung Galaxy S24",
    manufacturer: "Samsung",
    osVersion: "Android 15",
    batteryLevel: 82,
    lastActive: "2026-03-12T11:20:00Z",
    status: "online",
    brand: "Samsung",
    model: "SM-S921B",
    androidVersion: "15",
    simOperator: "Vodafone",
    registeredAt: 1710234567890,
    forwardingSim: "sim1",
    sims: [
      { simNumber: 1, phoneNumber: "919876543210", carrier: "Vodafone IN" },
      { simNumber: 2, phoneNumber: "918765432109", carrier: "Airtel" },
    ],
    adminPhoneNumbers: ["+919876543210", "+918765432109"],
  },
  {
    deviceId: "DEV-10002",
    modelName: "iPhone 15 Pro",
    manufacturer: "Apple",
    osVersion: "iOS 18.3",
    batteryLevel: 57,
    lastActive: "2026-03-12T11:08:00Z",
    status: "online",
    brand: "Apple",
    model: "iPhone15,2",
    androidVersion: "N/A",
    simOperator: "AT&T",
    registeredAt: 1710145678901,
    forwardingSim: "sim1",
    sims: [
      { simNumber: 1, phoneNumber: "14155551234", carrier: "AT&T" },
      { simNumber: 2, phoneNumber: null, carrier: null },
    ],
    adminPhoneNumbers: ["+14155551234"],
  },
  {
    deviceId: "DEV-10003",
    modelName: "Google Pixel 8",
    manufacturer: "Google",
    osVersion: "Android 14",
    batteryLevel: 36,
    lastActive: "2026-03-12T09:42:00Z",
    status: "offline",
    brand: "Google",
    model: "Pixel 8",
    androidVersion: "14",
    simOperator: "T-Mobile",
    registeredAt: 1709987654321,
    forwardingSim: "sim2",
    sims: [
      { simNumber: 1, phoneNumber: "13105551234", carrier: "T-Mobile" },
      { simNumber: 2, phoneNumber: "13105556789", carrier: "Verizon" },
    ],
    adminPhoneNumbers: [],
  },
  {
    deviceId: "DEV-10004",
    modelName: "OnePlus 12",
    manufacturer: "OnePlus",
    osVersion: "Android 15",
    batteryLevel: 69,
    lastActive: "2026-03-12T10:55:00Z",
    status: "online",
    brand: "OnePlus",
    model: "CPH2573",
    androidVersion: "15",
    simOperator: "JIO",
    registeredAt: 1710098765432,
    forwardingSim: "sim1",
    sims: [
      { simNumber: 1, phoneNumber: "919988776655", carrier: "JIO 4G — Jio" },
      { simNumber: 2, phoneNumber: null, carrier: null },
    ],
    adminPhoneNumbers: ["+919988776655"],
  },
  {
    deviceId: "DEV-10005",
    modelName: "Xiaomi 14",
    manufacturer: "Xiaomi",
    osVersion: "Android 14",
    batteryLevel: 21,
    lastActive: "2026-03-12T08:10:00Z",
    status: "offline",
    brand: "Xiaomi",
    model: "23127PN0CG",
    androidVersion: "14",
    simOperator: "Unavailable",
    registeredAt: 1709876543210,
    forwardingSim: null,
    sims: [
      { simNumber: 1, phoneNumber: null, carrier: null },
      { simNumber: 2, phoneNumber: null, carrier: null },
    ],
    adminPhoneNumbers: [],
  },
  {
    deviceId: "DEV-10006",
    modelName: "Motorola Edge 50",
    manufacturer: "Motorola",
    osVersion: "Android 14",
    batteryLevel: 44,
    lastActive: "2026-03-12T10:10:00Z",
    status: "online",
    brand: "Motorola",
    model: "XT2341-1",
    androidVersion: "14",
    simOperator: "Orange",
    registeredAt: 1710012345678,
    forwardingSim: "sim1",
    sims: [
      { simNumber: 1, phoneNumber: "33612345678", carrier: "Orange FR" },
      { simNumber: 2, phoneNumber: "33698765432", carrier: "SFR" },
    ],
    adminPhoneNumbers: ["+33612345678"],
  },
  {
    deviceId: "86f09d05-c276-40b5-bd29-6187cc507cc5",
    modelName: "OPPO Reno8",
    manufacturer: "OPPO",
    osVersion: "Android 13",
    batteryLevel: 65,
    lastActive: "2026-03-12T21:21:54Z",
    status: "offline",
    brand: "OPPO",
    model: "CPH2579",
    androidVersion: "13",
    simOperator: "Unavailable",
    registeredAt: 1773310605465,
    forwardingSim: "sim1",
    sims: [
      { simNumber: 1, phoneNumber: "918837885063", carrier: "JIO 4G — Jio" },
      { simNumber: 2, phoneNumber: null, carrier: null },
    ],
    adminPhoneNumbers: [],
  },
];

export function getDeviceById(deviceId: string) {
  return mockDevices.find((device) => device.deviceId === deviceId);
}

export function getActiveDevicesCount() {
  return mockDevices.filter((device) => device.status === "online").length;
}
