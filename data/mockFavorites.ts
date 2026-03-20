export type FavoriteDevice = {
  id: string;
  deviceName: string;
  modelName: string;
  deviceId: string;
  status: "online" | "offline";
  addedAt: string;
};

export const mockFavorites: FavoriteDevice[] = [
  // Empty initially - user can add favorites from device list
];

export function getFavorites(): FavoriteDevice[] {
  return mockFavorites;
}

export function addToFavorites(device: FavoriteDevice): void {
  mockFavorites.push(device);
}

export function removeFromFavorites(deviceId: string): void {
  const index = mockFavorites.findIndex((d) => d.id === deviceId);
  if (index !== -1) {
    mockFavorites.splice(index, 1);
  }
}

export function isFavorite(deviceId: string): boolean {
  return mockFavorites.some((d) => d.id === deviceId);
}
