// Complete localStorage-based data management with corruption detection and recovery
// Schema Version 4.4 - Per-room availability, capacity, multi-room booking, and non-destructive migration

export interface RoomAvailability {
  roomIndex: number;
  isAvailable: boolean;
  unavailableDateRanges: Array<{
    startDate: string;
    endDate: string;
  }>;
  personCapacity: number;
}

export interface HomeStay {
  id: string;
  hotelId: string;
  name: string;
  description: string;
  minPrice: number;
  maxPrice: number;
  fixedPrice?: number;
  amenities: string[];
  photos: string[]; // External URLs
  availability: boolean;
  ownerType: "admin" | "partner";
  partnerId?: string;
  passcode?: string;
  googleMapsLink?: string;
  partnerName: string;
  partnerPhoneNumber: string;
  distanceFromTemple?: number; // in kilometers
  photoUrls: string[];
  videoUrls: string[];
  ratings: number[]; // Array of ratings 1-5
  ownerMessage: string;
  roomCount: number;
  adminOverrideAvailability?: boolean;
  roomAvailability?: RoomAvailability[]; // Per-room availability settings
}

export interface Hotel {
  id: string;
  name: string;
  address: string;
  description: string;
  amenities: string[];
  photos: string[]; // External URLs
  googleMapsLink?: string;
  partnerName: string;
  partnerPhoneNumber: string;
  distanceFromTemple?: number; // in kilometers
  photoUrls: string[];
  videoUrls: string[];
  ratings: number[]; // Array of ratings 1-5
  ownerMessage: string;
  roomCount: number;
  adminOverrideAvailability?: boolean;
  ownerType: "admin" | "partner";
  partnerId?: string;
}

export interface Booking {
  id: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  hotelId: string;
  hotelName: string;
  homeStayId: string;
  homeStayName: string;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled";
  bookingDate: string;
  paymentMethod?: "stripe" | "upi";
  roomQuantity?: number; // Number of rooms booked
}

export interface Notification {
  id: string;
  type: "booking" | "payment" | "partner" | "customer";
  message: string;
  timestamp: string;
  read: boolean;
}

export interface Analytics {
  visitors: number;
  bookings: number;
  revenue: number;
  customerLogins: number;
  partnerEdits: number;
  homeStayViews: number;
  payments: number;
}

export interface TempleUpdate {
  id: string;
  imageLink: string;
  description: string;
  time: string;
  order: number;
}

export interface TempleSpecials {
  updates: TempleUpdate[];
  lastUpdated: string;
}

const STORAGE_VERSION = "4.4";
const STORAGE_KEYS = {
  VERSION: "mantralayam_version",
  HOMESTAYS: "mantralayam_homestays",
  HOTELS: "mantralayam_hotels",
  BOOKINGS: "mantralayam_bookings",
  NOTIFICATIONS: "mantralayam_notifications",
  ANALYTICS: "mantralayam_analytics",
  ADMIN_AUTH: "mantralayam_admin_auth",
  PARTNER_AUTH: "mantralayam_partner_auth",
  CUSTOMER_SESSION: "mantralayam_customer_session",
  TEMPLE_SPECIALS: "mantralayam_temple_specials",
};

// Default seed data with external image URLs and extended hotel fields
const DEFAULT_HOTELS: Hotel[] = [
  {
    id: "hotel-1",
    name: "Mantralayam Grand Hotel",
    address: "Near SRS Mutt, Mantralayam, Andhra Pradesh",
    description: "Premium hotel with modern amenities near the sacred SRS Mutt",
    amenities: ["WiFi", "AC", "TV", "Hot Water", "Room Service", "Parking"],
    photos: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&fit=crop",
    ],
    googleMapsLink: "https://maps.app.goo.gl/eGXbznvZDoA8fgcB6",
    partnerName: "Admin",
    partnerPhoneNumber: "+91 9876543210",
    distanceFromTemple: 0.3,
    photoUrls: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&fit=crop",
    ],
    videoUrls: [],
    ratings: [5, 5, 4, 5, 5],
    ownerMessage:
      "Welcome to Mantralayam Grand Hotel. We offer premium hospitality with modern amenities.",
    roomCount: 20,
    ownerType: "admin",
  },
  {
    id: "hotel-2",
    name: "Raghavendra Residency",
    address: "Temple Road, Mantralayam, Andhra Pradesh",
    description: "Comfortable stay with spiritual ambiance",
    amenities: ["WiFi", "AC", "TV", "Hot Water", "Breakfast"],
    photos: [
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&fit=crop",
    ],
    googleMapsLink: "https://maps.app.goo.gl/rmL3GdB8eU5ynXBT6",
    partnerName: "Admin",
    partnerPhoneNumber: "+91 9876543210",
    distanceFromTemple: 0.8,
    photoUrls: [
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&fit=crop",
    ],
    videoUrls: [],
    ratings: [4, 5, 4, 4, 5],
    ownerMessage: "Experience spiritual comfort at Raghavendra Residency.",
    roomCount: 15,
    ownerType: "admin",
  },
  {
    id: "hotel-3",
    name: "Sri Guru Lodge",
    address: "Main Street, Mantralayam, Andhra Pradesh",
    description: "Budget-friendly accommodation with essential amenities",
    amenities: ["WiFi", "Fan", "Hot Water", "Parking"],
    photos: [
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&h=600&fit=crop",
    ],
    googleMapsLink: "https://maps.app.goo.gl/WsTE5MySGP5yHTLX6",
    partnerName: "Admin",
    partnerPhoneNumber: "+91 9876543210",
    distanceFromTemple: 1.5,
    photoUrls: [
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&h=600&fit=crop",
    ],
    videoUrls: [],
    ratings: [4, 4, 3, 4, 4],
    ownerMessage: "Affordable and comfortable stay for pilgrims.",
    roomCount: 25,
    ownerType: "admin",
  },
];

const DEFAULT_HOMESTAYS: HomeStay[] = [
  {
    id: "homestay-1",
    hotelId: "hotel-1",
    name: "Deluxe Suite",
    description: "Spacious suite with premium amenities and city view",
    minPrice: 2000,
    maxPrice: 3000,
    fixedPrice: 2500,
    amenities: ["King Bed", "AC", "WiFi", "TV", "Mini Bar", "Balcony"],
    photos: [
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&h=600&fit=crop",
    ],
    availability: true,
    ownerType: "admin",
    googleMapsLink: "https://maps.app.goo.gl/eGXbznvZDoA8fgcB6",
    partnerName: "Admin",
    partnerPhoneNumber: "+91 9876543210",
    distanceFromTemple: 0.5,
    photoUrls: [
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&h=600&fit=crop",
    ],
    videoUrls: [],
    ratings: [5, 4, 5, 5, 4],
    ownerMessage:
      "Welcome to our premium suite! We ensure a comfortable and memorable stay.",
    roomCount: 3,
    roomAvailability: [
      {
        roomIndex: 1,
        isAvailable: true,
        unavailableDateRanges: [],
        personCapacity: 2,
      },
      {
        roomIndex: 2,
        isAvailable: true,
        unavailableDateRanges: [],
        personCapacity: 2,
      },
      {
        roomIndex: 3,
        isAvailable: true,
        unavailableDateRanges: [],
        personCapacity: 3,
      },
    ],
  },
  {
    id: "homestay-2",
    hotelId: "hotel-1",
    name: "Standard Room",
    description: "Comfortable room with essential amenities",
    minPrice: 1500,
    maxPrice: 2000,
    amenities: ["Double Bed", "AC", "WiFi", "TV"],
    photos: [
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&fit=crop",
    ],
    availability: true,
    ownerType: "admin",
    partnerName: "Admin",
    partnerPhoneNumber: "+91 9876543210",
    distanceFromTemple: 0.5,
    photoUrls: [
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&fit=crop",
    ],
    videoUrls: [],
    ratings: [4, 4, 5, 4],
    ownerMessage: "Comfortable and affordable accommodation for pilgrims.",
    roomCount: 5,
    roomAvailability: [
      {
        roomIndex: 1,
        isAvailable: true,
        unavailableDateRanges: [],
        personCapacity: 2,
      },
      {
        roomIndex: 2,
        isAvailable: true,
        unavailableDateRanges: [],
        personCapacity: 2,
      },
      {
        roomIndex: 3,
        isAvailable: true,
        unavailableDateRanges: [],
        personCapacity: 2,
      },
      {
        roomIndex: 4,
        isAvailable: true,
        unavailableDateRanges: [],
        personCapacity: 2,
      },
      {
        roomIndex: 5,
        isAvailable: true,
        unavailableDateRanges: [],
        personCapacity: 3,
      },
    ],
  },
  {
    id: "homestay-3",
    hotelId: "hotel-2",
    name: "Family Room",
    description: "Spacious room perfect for families",
    minPrice: 2000,
    maxPrice: 2500,
    amenities: ["Two Double Beds", "AC", "WiFi", "TV", "Hot Water"],
    photos: [
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&h=600&fit=crop",
    ],
    availability: true,
    ownerType: "partner",
    partnerId: "partner-1",
    passcode: "partner123",
    partnerName: "Rajesh Kumar",
    partnerPhoneNumber: "+91 9123456789",
    distanceFromTemple: 1.2,
    photoUrls: [
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&h=600&fit=crop",
    ],
    videoUrls: [],
    ratings: [5, 5, 4, 5, 5],
    ownerMessage:
      "Perfect for families visiting the temple. Clean and spacious rooms with all amenities.",
    roomCount: 4,
    roomAvailability: [
      {
        roomIndex: 1,
        isAvailable: true,
        unavailableDateRanges: [],
        personCapacity: 4,
      },
      {
        roomIndex: 2,
        isAvailable: true,
        unavailableDateRanges: [],
        personCapacity: 4,
      },
      {
        roomIndex: 3,
        isAvailable: true,
        unavailableDateRanges: [],
        personCapacity: 5,
      },
      {
        roomIndex: 4,
        isAvailable: true,
        unavailableDateRanges: [],
        personCapacity: 4,
      },
    ],
  },
  {
    id: "homestay-4",
    hotelId: "hotel-2",
    name: "Executive Suite",
    description: "Luxurious suite with modern amenities",
    minPrice: 3000,
    maxPrice: 4000,
    fixedPrice: 3500,
    amenities: [
      "King Bed",
      "AC",
      "WiFi",
      "TV",
      "Mini Bar",
      "Work Desk",
      "Balcony",
    ],
    photos: [
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop",
    ],
    availability: true,
    ownerType: "admin",
    partnerName: "Admin",
    partnerPhoneNumber: "+91 9876543210",
    distanceFromTemple: 0.8,
    photoUrls: [
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop",
    ],
    videoUrls: [],
    ratings: [5, 5, 5, 4, 5],
    ownerMessage:
      "Luxury accommodation with premium facilities for discerning guests.",
    roomCount: 2,
    roomAvailability: [
      {
        roomIndex: 1,
        isAvailable: true,
        unavailableDateRanges: [],
        personCapacity: 2,
      },
      {
        roomIndex: 2,
        isAvailable: true,
        unavailableDateRanges: [],
        personCapacity: 3,
      },
    ],
  },
  {
    id: "homestay-5",
    hotelId: "hotel-3",
    name: "Budget Room",
    description: "Clean and comfortable budget accommodation",
    minPrice: 800,
    maxPrice: 1200,
    fixedPrice: 1000,
    amenities: ["Double Bed", "Fan", "WiFi", "Hot Water"],
    photos: [
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=600&fit=crop",
    ],
    availability: true,
    ownerType: "partner",
    partnerId: "partner-2",
    passcode: "budget456",
    partnerName: "Srinivas Reddy",
    partnerPhoneNumber: "+91 9234567890",
    distanceFromTemple: 2.0,
    photoUrls: [
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=600&fit=crop",
    ],
    videoUrls: [],
    ratings: [4, 4, 4, 3, 4],
    ownerMessage:
      "Affordable and clean accommodation for budget-conscious travelers.",
    roomCount: 8,
    roomAvailability: [
      {
        roomIndex: 1,
        isAvailable: true,
        unavailableDateRanges: [],
        personCapacity: 2,
      },
      {
        roomIndex: 2,
        isAvailable: true,
        unavailableDateRanges: [],
        personCapacity: 2,
      },
      {
        roomIndex: 3,
        isAvailable: true,
        unavailableDateRanges: [],
        personCapacity: 2,
      },
      {
        roomIndex: 4,
        isAvailable: true,
        unavailableDateRanges: [],
        personCapacity: 2,
      },
      {
        roomIndex: 5,
        isAvailable: true,
        unavailableDateRanges: [],
        personCapacity: 3,
      },
      {
        roomIndex: 6,
        isAvailable: true,
        unavailableDateRanges: [],
        personCapacity: 2,
      },
      {
        roomIndex: 7,
        isAvailable: true,
        unavailableDateRanges: [],
        personCapacity: 2,
      },
      {
        roomIndex: 8,
        isAvailable: true,
        unavailableDateRanges: [],
        personCapacity: 3,
      },
    ],
  },
];

const DEFAULT_TEMPLE_SPECIALS: TempleSpecials = {
  updates: [
    {
      id: "update-1",
      imageLink:
        "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1280&h=720&fit=crop",
      description:
        "Experience the divine blessings at Sri Raghavendra Swamy Mutt. Special abhishekam and poojas are conducted throughout the day for devotees.",
      time: "Morning Pooja at 7 AM",
      order: 1,
    },
    {
      id: "update-2",
      imageLink:
        "https://images.unsplash.com/photo-1548013146-72479768bada?w=1280&h=720&fit=crop",
      description:
        "Join us for the evening aarti and experience the divine atmosphere. All devotees are welcome to participate in the sacred rituals.",
      time: "Evening Aarti at 7 PM",
      order: 2,
    },
  ],
  lastUpdated: new Date().toISOString(),
};

// Validation and corruption detection
function isValidJSON(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

function validateSchema(): boolean {
  try {
    const _version = localStorage.getItem(STORAGE_KEYS.VERSION);

    // Check if critical data exists and is valid JSON
    const homeStaysData = localStorage.getItem(STORAGE_KEYS.HOMESTAYS);
    const hotelsData = localStorage.getItem(STORAGE_KEYS.HOTELS);
    const bookingsData = localStorage.getItem(STORAGE_KEYS.BOOKINGS);

    if (!homeStaysData || !hotelsData) {
      console.log("Missing critical data, performing migration");
      return false;
    }

    if (!isValidJSON(homeStaysData) || !isValidJSON(hotelsData)) {
      console.log("Corrupted JSON detected, performing reset");
      return false;
    }

    // Validate data structure
    const homeStays = JSON.parse(homeStaysData);
    const hotels = JSON.parse(hotelsData);

    if (!Array.isArray(homeStays) || !Array.isArray(hotels)) {
      console.log("Invalid data structure, performing reset");
      return false;
    }

    // Validate bookings if present
    if (bookingsData && !isValidJSON(bookingsData)) {
      console.log("Corrupted bookings data detected");
      // Don't fail validation, just log - we'll preserve what we can
    }

    return true;
  } catch (error) {
    console.error("Schema validation error:", error);
    return false;
  }
}

function resetStorage() {
  console.log("=== STORAGE INITIALIZATION ===");
  console.log("Initializing with default data...");

  // Preserve bookings if they exist and are valid
  const existingBookingsData = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
  let bookingsToKeep: Booking[] = [];

  if (existingBookingsData && isValidJSON(existingBookingsData)) {
    try {
      const parsed = JSON.parse(existingBookingsData);
      if (Array.isArray(parsed)) {
        bookingsToKeep = parsed;
        console.log(`Preserving ${bookingsToKeep.length} existing bookings`);
      }
    } catch (e) {
      console.log("Could not preserve bookings:", e);
    }
  }

  // Clear only non-booking data
  const keysToPreserve = [STORAGE_KEYS.BOOKINGS];
  for (const key in localStorage) {
    if (key.startsWith("mantralayam_") && !keysToPreserve.includes(key)) {
      localStorage.removeItem(key);
    }
  }

  // Set new version
  localStorage.setItem(STORAGE_KEYS.VERSION, STORAGE_VERSION);

  // Initialize with fresh default data
  localStorage.setItem(STORAGE_KEYS.HOTELS, JSON.stringify(DEFAULT_HOTELS));
  localStorage.setItem(
    STORAGE_KEYS.HOMESTAYS,
    JSON.stringify(DEFAULT_HOMESTAYS),
  );

  // Restore or initialize bookings
  if (bookingsToKeep.length > 0) {
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookingsToKeep));
  } else {
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify([]));
  }

  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([]));
  localStorage.setItem(
    STORAGE_KEYS.ANALYTICS,
    JSON.stringify({
      visitors: 0,
      bookings: 0,
      revenue: 0,
      customerLogins: 0,
      partnerEdits: 0,
      homeStayViews: 0,
      payments: 0,
    }),
  );
  localStorage.setItem(
    STORAGE_KEYS.TEMPLE_SPECIALS,
    JSON.stringify(DEFAULT_TEMPLE_SPECIALS),
  );

  console.log(`Storage initialized with Schema v${STORAGE_VERSION}`);
  console.log(
    "Default hotels and homestays loaded with per-room availability and capacity",
  );
}

// Initialize storage on app startup with non-destructive migration
export function initializeStorage() {
  try {
    console.log("Initializing Mantralayam HomeStay Booking System...");
    const currentVersion = localStorage.getItem(STORAGE_KEYS.VERSION);

    if (currentVersion !== STORAGE_VERSION) {
      console.log(
        `Schema version change detected: ${currentVersion} -> ${STORAGE_VERSION}`,
      );
      if (!validateSchema()) {
        resetStorage();
      } else {
        // Update version and migrate
        localStorage.setItem(STORAGE_KEYS.VERSION, STORAGE_VERSION);
        migrateToPerRoomAvailability();
        console.log(`Storage migrated successfully to v${STORAGE_VERSION}`);
      }
    } else if (!validateSchema()) {
      resetStorage();
    } else {
      console.log(
        `Storage validated successfully - Schema v${STORAGE_VERSION}`,
      );
      // Ensure temple specials exists even in validated storage
      if (!localStorage.getItem(STORAGE_KEYS.TEMPLE_SPECIALS)) {
        localStorage.setItem(
          STORAGE_KEYS.TEMPLE_SPECIALS,
          JSON.stringify(DEFAULT_TEMPLE_SPECIALS),
        );
      }
      // Migrate existing data to include new fields
      migrateToPerRoomAvailability();
    }
  } catch (error) {
    console.error("Storage initialization error:", error);
    resetStorage();
  }
}

// Migration function to add per-room availability to existing homestays
function migrateToPerRoomAvailability() {
  try {
    const homeStaysData = localStorage.getItem(STORAGE_KEYS.HOMESTAYS);
    if (!homeStaysData) return;

    const homeStays: HomeStay[] = JSON.parse(homeStaysData);
    let migrated = false;

    const updated = homeStays.map((homeStay) => {
      // Add roomAvailability if missing
      if (
        !homeStay.roomAvailability ||
        homeStay.roomAvailability.length === 0
      ) {
        migrated = true;
        const roomCount = homeStay.roomCount || 1;
        const roomAvailability: RoomAvailability[] = [];

        for (let i = 1; i <= roomCount; i++) {
          roomAvailability.push({
            roomIndex: i,
            isAvailable: true,
            unavailableDateRanges: [],
            personCapacity: 2, // Default capacity
          });
        }

        return {
          ...homeStay,
          roomAvailability,
        };
      }
      return homeStay;
    });

    if (migrated) {
      localStorage.setItem(STORAGE_KEYS.HOMESTAYS, JSON.stringify(updated));
      console.log("Migrated homestays to include per-room availability");
    }
  } catch (error) {
    console.error("Migration error:", error);
  }
}

// Helper function to normalize homestay data
export function normalizeHomeStay(homeStay: HomeStay): HomeStay {
  return {
    ...homeStay,
    roomAvailability: homeStay.roomAvailability || [],
    roomCount: homeStay.roomCount || 1,
    fixedPrice: homeStay.fixedPrice,
    minPrice: homeStay.minPrice || 0,
    maxPrice: homeStay.maxPrice || 0,
  };
}

// CRUD Operations for Hotels
export function getHotels(): Hotel[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.HOTELS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error loading hotels:", error);
    return [];
  }
}

export function saveHotels(hotels: Hotel[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.HOTELS, JSON.stringify(hotels));
    window.dispatchEvent(new Event("hotelsUpdated"));
  } catch (error) {
    console.error("Error saving hotels:", error);
  }
}

// CRUD Operations for HomeStays
export function getHomeStays(): HomeStay[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.HOMESTAYS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error loading homestays:", error);
    return [];
  }
}

export function saveHomeStays(homeStays: HomeStay[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.HOMESTAYS, JSON.stringify(homeStays));
    window.dispatchEvent(new Event("homeStaysUpdated"));
  } catch (error) {
    console.error("Error saving homestays:", error);
  }
}

// CRUD Operations for Bookings
export function getBookings(): Booking[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error loading bookings:", error);
    return [];
  }
}

export function saveBookings(bookings: Booking[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    window.dispatchEvent(new Event("bookingsUpdated"));
  } catch (error) {
    console.error("Error saving bookings:", error);
  }
}

// CRUD Operations for Notifications
export function getNotifications(): Notification[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error loading notifications:", error);
    return [];
  }
}

export function saveNotifications(notifications: Notification[]) {
  try {
    localStorage.setItem(
      STORAGE_KEYS.NOTIFICATIONS,
      JSON.stringify(notifications),
    );
    window.dispatchEvent(new Event("notificationsUpdated"));
  } catch (error) {
    console.error("Error saving notifications:", error);
  }
}

// Add notification helper
export function addNotification(
  message: string,
  type: "booking" | "payment" | "partner" | "customer" = "booking",
) {
  try {
    const notifications = getNotifications();
    const newNotification: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      message,
      timestamp: new Date().toISOString(),
      read: false,
    };
    notifications.push(newNotification);
    saveNotifications(notifications);
  } catch (error) {
    console.error("Error adding notification:", error);
  }
}

// Analytics Operations
export function getAnalytics(): Analytics {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ANALYTICS);
    return data
      ? JSON.parse(data)
      : {
          visitors: 0,
          bookings: 0,
          revenue: 0,
          customerLogins: 0,
          partnerEdits: 0,
          homeStayViews: 0,
          payments: 0,
        };
  } catch (error) {
    console.error("Error loading analytics:", error);
    return {
      visitors: 0,
      bookings: 0,
      revenue: 0,
      customerLogins: 0,
      partnerEdits: 0,
      homeStayViews: 0,
      payments: 0,
    };
  }
}

export function updateAnalytics(metric: keyof Analytics, increment = 1) {
  try {
    const analytics = getAnalytics();
    analytics[metric] = (analytics[metric] || 0) + increment;
    localStorage.setItem(STORAGE_KEYS.ANALYTICS, JSON.stringify(analytics));
    window.dispatchEvent(new Event("analyticsUpdated"));
  } catch (error) {
    console.error("Error updating analytics:", error);
  }
}

// Admin Authentication
export function getAdminAuth(): { authenticated: boolean; timestamp?: number } {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH);
    return data ? JSON.parse(data) : { authenticated: false };
  } catch (error) {
    console.error("Error loading admin auth:", error);
    return { authenticated: false };
  }
}

export function setAdminAuth(authenticated: boolean) {
  try {
    const authData = {
      authenticated,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, JSON.stringify(authData));
    window.dispatchEvent(new Event("adminAuthChanged"));
  } catch (error) {
    console.error("Error saving admin auth:", error);
  }
}

// Partner Authentication with consistent identifier storage
export function getPartnerAuth(): {
  authenticated: boolean;
  partnerId?: string;
  partnerRoomId?: string;
} {
  try {
    const authenticated =
      localStorage.getItem("partnerAuthenticated") === "true";
    const partnerId = localStorage.getItem("partnerId") || undefined;
    const partnerRoomId = localStorage.getItem("partnerRoomId") || undefined;

    return {
      authenticated,
      partnerId,
      partnerRoomId,
    };
  } catch (error) {
    console.error("Error loading partner auth:", error);
    return { authenticated: false };
  }
}

export function setPartnerAuth(
  authenticated: boolean,
  partnerId?: string,
  partnerRoomId?: string,
) {
  try {
    if (authenticated) {
      localStorage.setItem("partnerAuthenticated", "true");
      if (partnerId) localStorage.setItem("partnerId", partnerId);
      if (partnerRoomId) localStorage.setItem("partnerRoomId", partnerRoomId);
    } else {
      localStorage.removeItem("partnerAuthenticated");
      localStorage.removeItem("partnerId");
      localStorage.removeItem("partnerRoomId");
      localStorage.removeItem("partnerPasscode");
    }
    window.dispatchEvent(new Event("partnerAuthChanged"));
  } catch (error) {
    console.error("Error saving partner auth:", error);
  }
}

// Customer Session Management
export interface CustomerSession {
  name: string;
  phone: string;
  timestamp: number;
  verified?: boolean;
}

export function getCustomerSession(): CustomerSession | null {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CUSTOMER_SESSION);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Error loading customer session:", error);
    return null;
  }
}

export function setCustomerSession(name: string, phone: string) {
  try {
    const session: CustomerSession = {
      name,
      phone,
      timestamp: Date.now(),
      verified: true,
    };
    localStorage.setItem(
      STORAGE_KEYS.CUSTOMER_SESSION,
      JSON.stringify(session),
    );
    window.dispatchEvent(new Event("customerSessionChanged"));
  } catch (error) {
    console.error("Error saving customer session:", error);
  }
}

export function clearCustomerSession() {
  try {
    localStorage.removeItem(STORAGE_KEYS.CUSTOMER_SESSION);
    window.dispatchEvent(new Event("customerSessionChanged"));
  } catch (error) {
    console.error("Error clearing customer session:", error);
  }
}

// Temple Specials Management
export function getTempleSpecials(): TempleSpecials {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TEMPLE_SPECIALS);
    return data ? JSON.parse(data) : DEFAULT_TEMPLE_SPECIALS;
  } catch (error) {
    console.error("Error loading temple specials:", error);
    return DEFAULT_TEMPLE_SPECIALS;
  }
}

export function saveTempleSpecials(specials: TempleSpecials) {
  try {
    localStorage.setItem(
      STORAGE_KEYS.TEMPLE_SPECIALS,
      JSON.stringify(specials),
    );
    window.dispatchEvent(new Event("templeSpecialsUpdated"));
  } catch (error) {
    console.error("Error saving temple specials:", error);
  }
}

// Helper function to get booking statistics for a homestay
export function getHomeStayBookingStats(homeStayId: string): {
  totalRooms: number;
  bookedRooms: number;
  availableRooms: number;
} {
  const homeStays = getHomeStays();
  const homeStay = homeStays.find((h) => h.id === homeStayId);

  if (!homeStay) {
    return { totalRooms: 0, bookedRooms: 0, availableRooms: 0 };
  }

  const totalRooms = homeStay.roomCount || 1;
  const roomAvailability = homeStay.roomAvailability || [];

  // Count available rooms based on per-room availability
  const availableRooms = roomAvailability.filter((r) => r.isAvailable).length;
  const bookedRooms = totalRooms - availableRooms;

  return {
    totalRooms,
    bookedRooms,
    availableRooms,
  };
}

// Helper function to get available rooms count for booking validation
export function getAvailableRoomsCount(homeStayId: string): number {
  const stats = getHomeStayBookingStats(homeStayId);
  return stats.availableRooms;
}

// Helper function to get total capacity for selected rooms
export function getTotalCapacityForRooms(
  homeStayId: string,
  roomQuantity: number,
): number {
  const homeStays = getHomeStays();
  const homeStay = homeStays.find((h) => h.id === homeStayId);

  if (!homeStay || !homeStay.roomAvailability) {
    return roomQuantity * 2; // Default capacity
  }

  // Get available rooms sorted by capacity
  const availableRooms = homeStay.roomAvailability
    .filter((r) => r.isAvailable)
    .sort((a, b) => b.personCapacity - a.personCapacity);

  // Sum capacity of the requested number of rooms
  let totalCapacity = 0;
  for (let i = 0; i < Math.min(roomQuantity, availableRooms.length); i++) {
    totalCapacity += availableRooms[i].personCapacity;
  }

  return totalCapacity;
}

// Helper function to get display price for homestay
export function getHomeStayDisplayPrice(homeStay: HomeStay): string {
  if (homeStay.fixedPrice) {
    return `₹${homeStay.fixedPrice.toLocaleString()}`;
  }
  if (homeStay.minPrice === homeStay.maxPrice) {
    return `₹${homeStay.minPrice.toLocaleString()}`;
  }
  return `₹${homeStay.minPrice.toLocaleString()} - ₹${homeStay.maxPrice.toLocaleString()}`;
}

// Helper function to calculate average rating
export function getAverageRating(ratings: number[]): number {
  if (!ratings || ratings.length === 0) return 0;
  const sum = ratings.reduce((acc, rating) => acc + rating, 0);
  return Math.round((sum / ratings.length) * 10) / 10;
}
