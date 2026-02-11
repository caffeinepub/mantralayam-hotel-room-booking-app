// Frontend-only localStorage module for room data management

export interface Room {
  id: string;
  name: string;
  description: string;
  location: string;
  minPrice: number;
  maxPrice: number;
  fixedPrice?: number; // Optional fixed price field
  photos: string[];
  videos: string[];
  amenities: string[];
  availability: boolean;
  ownerName: string;
  ownerContact: string;
  passcode?: string;
}

const ROOMS_STORAGE_KEY = 'mantralayam_rooms';

// Helper function to get display price (fixed price if available, otherwise range)
export function getRoomDisplayPrice(room: Room): string {
  if (room.fixedPrice !== undefined && room.fixedPrice > 0) {
    return `₹${room.fixedPrice.toLocaleString()}`;
  }
  return `₹${room.minPrice.toLocaleString()} - ₹${room.maxPrice.toLocaleString()}`;
}

export function getRooms(): Room[] {
  try {
    const stored = localStorage.getItem(ROOMS_STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error loading rooms from localStorage:', error);
    return [];
  }
}

export function getRoom(id: string): Room | null {
  const rooms = getRooms();
  return rooms.find(room => room.id === id) || null;
}

export function saveRoom(room: Room): void {
  try {
    const rooms = getRooms();
    const existingIndex = rooms.findIndex(r => r.id === room.id);
    
    if (existingIndex >= 0) {
      rooms[existingIndex] = room;
    } else {
      rooms.push(room);
    }
    
    localStorage.setItem(ROOMS_STORAGE_KEY, JSON.stringify(rooms));
    
    // Dispatch event for real-time updates
    window.dispatchEvent(new Event('roomsUpdated'));
  } catch (error) {
    console.error('Error saving room to localStorage:', error);
  }
}

export function deleteRoom(id: string): void {
  try {
    const rooms = getRooms();
    const filtered = rooms.filter(room => room.id !== id);
    localStorage.setItem(ROOMS_STORAGE_KEY, JSON.stringify(filtered));
    
    // Dispatch event for real-time updates
    window.dispatchEvent(new Event('roomsUpdated'));
  } catch (error) {
    console.error('Error deleting room from localStorage:', error);
  }
}

export function updateRoomAvailability(id: string, availability: boolean): void {
  try {
    const rooms = getRooms();
    const room = rooms.find(r => r.id === id);
    
    if (room) {
      room.availability = availability;
      localStorage.setItem(ROOMS_STORAGE_KEY, JSON.stringify(rooms));
      
      // Dispatch event for real-time updates
      window.dispatchEvent(new Event('roomsUpdated'));
    }
  } catch (error) {
    console.error('Error updating room availability:', error);
  }
}

export function updateRoomPrice(id: string, minPrice: number, maxPrice: number, fixedPrice?: number): void {
  try {
    const rooms = getRooms();
    const room = rooms.find(r => r.id === id);
    
    if (room) {
      room.minPrice = minPrice;
      room.maxPrice = maxPrice;
      if (fixedPrice !== undefined) {
        room.fixedPrice = fixedPrice;
      }
      localStorage.setItem(ROOMS_STORAGE_KEY, JSON.stringify(rooms));
      
      // Dispatch event for real-time updates
      window.dispatchEvent(new Event('roomsUpdated'));
    }
  } catch (error) {
    console.error('Error updating room price:', error);
  }
}

export function updateRoomPasscode(id: string, passcode: string): boolean {
  try {
    const rooms = getRooms();
    const room = rooms.find(r => r.id === id);
    
    if (room) {
      room.passcode = passcode;
      localStorage.setItem(ROOMS_STORAGE_KEY, JSON.stringify(rooms));
      
      // Dispatch event for real-time updates
      window.dispatchEvent(new Event('roomsUpdated'));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error updating room passcode:', error);
    return false;
  }
}

export function searchRooms(query: string, minPrice?: number, maxPrice?: number): Room[] {
  const rooms = getRooms();
  
  return rooms.filter(room => {
    const matchesQuery = !query || 
      room.name.toLowerCase().includes(query.toLowerCase()) ||
      room.description.toLowerCase().includes(query.toLowerCase()) ||
      room.location.toLowerCase().includes(query.toLowerCase());
    
    const matchesPrice = 
      (!minPrice || room.minPrice >= minPrice) &&
      (!maxPrice || room.maxPrice <= maxPrice);
    
    return matchesQuery && matchesPrice && room.availability;
  });
}
