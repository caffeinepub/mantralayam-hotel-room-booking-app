// Frontend-only localStorage module for room/partner data management

export interface Room {
  id: string;
  name: string;
  description: string;
  amenities: string[];
  minPrice: number;
  maxPrice: number;
  photos: string[];
  availability: boolean;
  partnerId?: string;
  partnerName?: string;
  partnerPhone?: string;
  password?: string;
  passcode?: string;
  hotelId?: string;
  roomType?: string;
  capacity?: number;
  googleMapsLink?: string;
  distanceFromTemple?: number;
  ownerMessage?: string;
  videoUrls?: string[];
  ratings?: number[];
}

const ROOMS_KEY = 'homestay_rooms';
const PARTNER_AUTH_CACHE_PREFIX = 'partner_auth_cache_';
const PARTNER_SESSION_KEY = 'partnerAuthState';

export function getRooms(): Room[] {
  try {
    const data = localStorage.getItem(ROOMS_KEY);
    if (!data) return [];
    return JSON.parse(data) as Room[];
  } catch {
    return [];
  }
}

export function saveRooms(rooms: Room[]): void {
  localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms));
  window.dispatchEvent(new CustomEvent('roomsUpdated', { detail: rooms }));
}

export function addRoom(room: Room): void {
  const rooms = getRooms();
  const existing = rooms.findIndex(r => r.id === room.id);
  if (existing >= 0) {
    rooms[existing] = room;
  } else {
    rooms.push(room);
  }
  saveRooms(rooms);
}

export function updateRoom(room: Room): void {
  const rooms = getRooms();
  const idx = rooms.findIndex(r => r.id === room.id);
  if (idx >= 0) {
    rooms[idx] = room;
    saveRooms(rooms);
  }
}

export function saveRoom(room: Room): void {
  addRoom(room);
}

export function deleteRoom(roomId: string): void {
  const rooms = getRooms().filter(r => r.id !== roomId);
  saveRooms(rooms);
}

export function getRoomById(roomId: string): Room | undefined {
  return getRooms().find(r => r.id === roomId);
}

export function updateRoomPasscode(roomId: string, passcode: string): void {
  const rooms = getRooms();
  const idx = rooms.findIndex(r => r.id === roomId);
  if (idx >= 0) {
    rooms[idx] = { ...rooms[idx], passcode, password: passcode };
    saveRooms(rooms);
  }
}

export function getRoomDisplayPrice(room: Room): string {
  if (room.minPrice && room.maxPrice && room.minPrice !== room.maxPrice) {
    return `₹${room.minPrice} - ₹${room.maxPrice}`;
  }
  if (room.minPrice) return `₹${room.minPrice}`;
  if (room.maxPrice) return `₹${room.maxPrice}`;
  return 'Price on request';
}

/**
 * Sync a partner record to localStorage immediately after admin creation/update.
 * This ensures the partner data is available locally for display purposes.
 * Also dispatches a 'partnerDataChanged' event so other components can react.
 */
export function syncPartnerToStorage(partnerId: string, password: string, roomId: string): void {
  // Update the room's password in localStorage
  const rooms = getRooms();
  const idx = rooms.findIndex(r => r.id === roomId);
  if (idx >= 0) {
    rooms[idx] = { ...rooms[idx], password, passcode: password, partnerId };
    saveRooms(rooms);
  }
  // Dispatch event so other components know partner data changed
  window.dispatchEvent(new CustomEvent('partnerDataChanged', {
    detail: { partnerId, password, roomId }
  }));
}

/**
 * Get the latest password for a partner from localStorage.
 * Always re-parses localStorage to avoid stale reads.
 */
export function getLatestPartnerPassword(partnerId: string): string | null {
  // Re-parse localStorage fresh every time
  const rooms = getRooms();
  const partnerRoom = rooms.find(r => r.partnerId === partnerId);
  return partnerRoom?.password ?? partnerRoom?.passcode ?? null;
}

/**
 * Clear any cached partner authentication state from localStorage.
 * Call this whenever a partner's password is updated by admin.
 */
export function clearPartnerAuthCache(partnerId: string): void {
  // Clear partner-specific cache keys
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (
      key.startsWith(PARTNER_AUTH_CACHE_PREFIX) ||
      key.includes(`partner_${partnerId}`) ||
      key.includes(`partnerCache_${partnerId}`)
    )) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(k => localStorage.removeItem(k));

  // If the currently logged-in partner session matches this partnerId, clear it
  try {
    const sessionRaw = localStorage.getItem(PARTNER_SESSION_KEY);
    if (sessionRaw) {
      const session = JSON.parse(sessionRaw);
      if (session?.partnerId === partnerId) {
        localStorage.removeItem(PARTNER_SESSION_KEY);
      }
    }
  } catch {
    // ignore parse errors
  }

  window.dispatchEvent(new CustomEvent('partnerAuthCacheCleared', { detail: { partnerId } }));
}

/**
 * Clear all stale partner cached data (used when password changes).
 * Removes any localStorage keys that look like partner session/cache data.
 */
export function clearPartnerCachedData(): void {
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (
      key.startsWith(PARTNER_AUTH_CACHE_PREFIX) ||
      key.startsWith('partner_cache_') ||
      key.startsWith('partnerCache_')
    )) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(k => localStorage.removeItem(k));
}
