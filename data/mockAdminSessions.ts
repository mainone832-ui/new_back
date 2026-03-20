export type AdminSession = {
  id: string;
  deviceName: string;
  adminName: string;
  status: "active" | "inactive";
  lastSeen: string;
  adminCount: number;
};

export const mockAdminSessions: AdminSession[] = [
  {
    id: "device1",
    deviceName: "device1",
    adminName: "zero",
    status: "active",
    lastSeen: "2026-03-13T00:28:45Z",
    adminCount: 1,
  },
];

export function getActiveDevicesCount(): number {
  return mockAdminSessions.filter((session) => session.status === "active").length;
}

export function getTotalSessionsCount(): number {
  return mockAdminSessions.length;
}

export function getAdminSessions(): AdminSession[] {
  return mockAdminSessions;
}

export function logoutSession(sessionId: string): void {
  const session = mockAdminSessions.find((s) => s.id === sessionId);
  if (session) {
    session.status = "inactive";
  }
}

export function logoutAllSessions(): void {
  mockAdminSessions.forEach((session) => {
    session.status = "inactive";
  });
}
