// Lightweight i18n module for multilingual support
// Supports English (default), Telugu, Kannada, Tamil, and Hindi

export type Language = 'en' | 'te' | 'kn' | 'ta' | 'hi';

const LANGUAGE_KEY = 'mantralayam_language';

export const LANGUAGES: Record<Language, string> = {
  en: 'English',
  te: 'తెలుగు',
  kn: 'ಕನ್ನಡ',
  ta: 'தமிழ்',
  hi: 'हिंदी',
};

// Translation dictionary
export const translations: Record<string, Record<Language, string>> = {
  // Header & Navigation
  'nav.home': { en: 'Home', te: 'హోమ్', kn: 'ಮುಖಪುಟ', ta: 'முகப்பு', hi: 'होम' },
  'nav.browseRooms': { en: 'Browse Rooms', te: 'గదులు చూడండి', kn: 'ಕೊಠಡಿಗಳನ್ನು ನೋಡಿ', ta: 'அறைகளைப் பார்க்கவும்', hi: 'कमरे देखें' },
  'nav.myBookings': { en: 'My Bookings', te: 'నా బుకింగ్‌లు', kn: 'ನನ್ನ ಬುಕಿಂಗ್‌ಗಳು', ta: 'எனது முன்பதிவுகள்', hi: 'मेरी बुकिंग' },
  'nav.admin': { en: 'Admin', te: 'అడ్మిన్', kn: 'ನಿರ್ವಾಹಕ', ta: 'நிர்வாகி', hi: 'व्यवस्थापक' },
  'nav.partner': { en: 'Partner', te: 'భాగస్వామి', kn: 'ಪಾಲುದಾರ', ta: 'பங்குதாரர்', hi: 'साझेदार' },
  'nav.logout': { en: 'Logout', te: 'లాగ్అవుట్', kn: 'ಲಾಗ್ ಔಟ್', ta: 'வெளியேறு', hi: 'लॉग आउट' },
  
  // Browse Rooms Page
  'browse.title': { en: 'Browse HomeStays', te: 'హోమ్‌స్టేలు చూడండి', kn: 'ಹೋಮ್‌ಸ್ಟೇಗಳನ್ನು ನೋಡಿ', ta: 'ஹோம்ஸ்டேகளைப் பார்க்கவும்', hi: 'होमस्टे देखें' },
  'browse.subtitle': { en: 'Find your perfect accommodation near the temple', te: 'ఆలయం దగ్గర మీ ఆదర్శ వసతిని కనుగొనండి', kn: 'ದೇವಾಲಯದ ಹತ್ತಿರ ನಿಮ್ಮ ಪರಿಪೂರ್ಣ ವಸತಿ ಹುಡುಕಿ', ta: 'கோவிலுக்கு அருகில் உங்கள் சிறந்த தங்குமிடத்தைக் கண்டறியவும்', hi: 'मंदिर के पास अपना आदर्श आवास खोजें' },
  'browse.search': { en: 'Search homestays...', te: 'హోమ్‌స్టేలను శోధించండి...', kn: 'ಹೋಮ್‌ಸ್ಟೇಗಳನ್ನು ಹುಡುಕಿ...', ta: 'ஹோம்ஸ்டேகளைத் தேடுங்கள்...', hi: 'होमस्टे खोजें...' },
  'browse.available': { en: 'Available', te: 'అందుబాటులో', kn: 'ಲಭ್ಯವಿದೆ', ta: 'கிடைக்கும்', hi: 'उपलब्ध' },
  'browse.viewDetails': { en: 'View Details', te: 'వివరాలు చూడండి', kn: 'ವಿವರಗಳನ್ನು ನೋಡಿ', ta: 'விவரங்களைப் பார்க்கவும்', hi: 'विवरण देखें' },
  'browse.noRooms': { en: 'No homestays available', te: 'హోమ్‌స్టేలు అందుబాటులో లేవు', kn: 'ಹೋಮ್‌ಸ್ಟೇಗಳು ಲಭ್ಯವಿಲ್ಲ', ta: 'ஹோம்ஸ்டேகள் கிடைக்கவில்லை', hi: 'होमस्टे उपलब्ध नहीं' },
  
  // Room Detail Page
  'detail.bookNow': { en: 'Book Now', te: 'ఇప్పుడే బుక్ చేయండి', kn: 'ಈಗ ಬುಕ್ ಮಾಡಿ', ta: 'இப்போது முன்பதிவு செய்யுங்கள்', hi: 'अभी बुक करें' },
  'detail.amenities': { en: 'Amenities', te: 'సౌకర్యాలు', kn: 'ಸೌಲಭ್ಯಗಳು', ta: 'வசதிகள்', hi: 'सुविधाएं' },
  'detail.location': { en: 'Location', te: 'స్థానం', kn: 'ಸ್ಥಳ', ta: 'இடம்', hi: 'स्थान' },
  'detail.contact': { en: 'Contact', te: 'సంప్రదించండి', kn: 'ಸಂಪರ್ಕಿಸಿ', ta: 'தொடர்பு', hi: 'संपर्क करें' },
  'detail.roomsAvailable': { en: 'rooms available', te: 'గదులు అందుబాటులో', kn: 'ಕೊಠಡಿಗಳು ಲಭ್ಯವಿದೆ', ta: 'அறைகள் கிடைக்கும்', hi: 'कमरे उपलब्ध' },
  'detail.noRoomsAvailable': { en: 'No rooms available', te: 'గదులు అందుబాటులో లేవు', kn: 'ಕೊಠಡಿಗಳು ಲಭ್ಯವಿಲ್ಲ', ta: 'அறைகள் கிடைக்கவில்லை', hi: 'कमरे उपलब्ध नहीं' },
  
  // Booking Page
  'booking.title': { en: 'Complete Your Booking', te: 'మీ బుకింగ్ పూర్తి చేయండి', kn: 'ನಿಮ್ಮ ಬುಕಿಂಗ್ ಪೂರ್ಣಗೊಳಿಸಿ', ta: 'உங்கள் முன்பதிவை முடிக்கவும்', hi: 'अपनी बुकिंग पूरी करें' },
  'booking.guestInfo': { en: 'Guest Information', te: 'అతిథి సమాచారం', kn: 'ಅತಿಥಿ ಮಾಹಿತಿ', ta: 'விருந்தினர் தகவல்', hi: 'अतिथि जानकारी' },
  'booking.fullName': { en: 'Full Name', te: 'పూర్తి పేరు', kn: 'ಪೂರ್ಣ ಹೆಸರು', ta: 'முழு பெயர்', hi: 'पूरा नाम' },
  'booking.phoneNumber': { en: 'Phone Number', te: 'ఫోన్ నంబర్', kn: 'ದೂರವಾಣಿ ಸಂಖ್ಯೆ', ta: 'தொலைபேசி எண்', hi: 'फोन नंबर' },
  'booking.numberOfRooms': { en: 'Number of Rooms', te: 'గదుల సంఖ్య', kn: 'ಕೊಠಡಿಗಳ ಸಂಖ್ಯೆ', ta: 'அறைகளின் எண்ணிக்கை', hi: 'कमरों की संख्या' },
  'booking.numberOfGuests': { en: 'Number of Guests', te: 'అతిథుల సంఖ్య', kn: 'ಅತಿಥಿಗಳ ಸಂಖ್ಯೆ', ta: 'விருந்தினர்களின் எண்ணிக்கை', hi: 'मेहमानों की संख्या' },
  'booking.checkInDate': { en: 'Check-in Date', te: 'చెక్-ఇన్ తేదీ', kn: 'ಚೆಕ್-ಇನ್ ದಿನಾಂಕ', ta: 'செக்-இன் தேதி', hi: 'चेक-इन तिथि' },
  'booking.checkInTime': { en: 'Check-in Time', te: 'చెక్-ఇన్ సమయం', kn: 'ಚೆಕ್-ಇನ್ ಸಮಯ', ta: 'செக்-இன் நேரம்', hi: 'चेक-इन समय' },
  'booking.maxGuests': { en: 'Maximum guests allowed', te: 'గరిష్ట అతిథులు అనుమతించబడ్డారు', kn: 'ಗರಿಷ್ಠ ಅತಿಥಿಗಳಿಗೆ ಅನುಮತಿ', ta: 'அதிகபட்ச விருந்தினர்கள் அனுமதிக்கப்படுகிறார்கள்', hi: 'अधिकतम मेहमानों की अनुमति' },
  'booking.proceedToPayment': { en: 'Proceed to Payment', te: 'చెల్లింపుకు కొనసాగండి', kn: 'ಪಾವತಿಗೆ ಮುಂದುವರಿಯಿರಿ', ta: 'பணம் செலுத்துவதற்கு தொடரவும்', hi: 'भुगतान के लिए आगे बढ़ें' },
  'booking.totalAmount': { en: 'Total Amount', te: 'మొత్తం మొత్తం', kn: 'ಒಟ್ಟು ಮೊತ್ತ', ta: 'மொத்த தொகை', hi: 'कुल राशि' },
  
  // My Bookings Page
  'myBookings.title': { en: 'My Bookings', te: 'నా బుకింగ్‌లు', kn: 'ನನ್ನ ಬುಕಿಂಗ್‌ಗಳು', ta: 'எனது முன்பதிவுகள்', hi: 'मेरी बुकिंग' },
  'myBookings.subtitle': { en: 'View and manage your reservations', te: 'మీ రిజర్వేషన్‌లను చూడండి మరియు నిర్వహించండి', kn: 'ನಿಮ್ಮ ಕಾಯ್ದಿರಿಸುವಿಕೆಗಳನ್ನು ವೀಕ್ಷಿಸಿ ಮತ್ತು ನಿರ್ವಹಿಸಿ', ta: 'உங்கள் முன்பதிவுகளைப் பார்க்கவும் நிர்வகிக்கவும்', hi: 'अपने आरक्षण देखें और प्रबंधित करें' },
  'myBookings.viewDetails': { en: 'View Details', te: 'వివరాలు చూడండి', kn: 'ವಿವರಗಳನ್ನು ನೋಡಿ', ta: 'விவரங்களைப் பார்க்கவும்', hi: 'विवरण देखें' },
  'myBookings.cancelBooking': { en: 'Cancel Booking', te: 'బుకింగ్ రద్దు చేయండి', kn: 'ಬುಕಿಂಗ್ ರದ್ದುಮಾಡಿ', ta: 'முன்பதிவை ரத்துசெய்யவும்', hi: 'बुकिंग रद्द करें' },
  'myBookings.reportIssue': { en: 'Report an Issue', te: 'సమస్యను నివేదించండి', kn: 'ಸಮಸ್ಯೆಯನ್ನು ವರದಿ ಮಾಡಿ', ta: 'சிக்கலைப் புகாரளிக்கவும்', hi: 'समस्या की रिपोर्ट करें' },
  'myBookings.noBookings': { en: "You don't have any bookings yet", te: 'మీకు ఇంకా బుకింగ్‌లు లేవు', kn: 'ನಿಮಗೆ ಇನ್ನೂ ಯಾವುದೇ ಬುಕಿಂಗ್‌ಗಳಿಲ್ಲ', ta: 'உங்களிடம் இன்னும் முன்பதிவுகள் இல்லை', hi: 'आपके पास अभी तक कोई बुकिंग नहीं है' },
  
  // Partner Dashboard
  'partner.title': { en: 'Partner Dashboard', te: 'భాగస్వామి డాష్‌బోర్డ్', kn: 'ಪಾಲುದಾರ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್', ta: 'பங்குதாரர் டாஷ்போர்டு', hi: 'साझेदार डैशबोर्ड' },
  'partner.subtitle': { en: 'Manage your homestay and view earnings', te: 'మీ హోమ్‌స్టేను నిర్వహించండి మరియు ఆదాయాలను చూడండి', kn: 'ನಿಮ್ಮ ಹೋಮ್‌ಸ್ಟೇ ನಿರ್ವಹಿಸಿ ಮತ್ತು ಗಳಿಕೆಗಳನ್ನು ವೀಕ್ಷಿಸಿ', ta: 'உங்கள் ஹோம்ஸ்டேயை நிர்வகிக்கவும் வருவாயைப் பார்க்கவும்', hi: 'अपने होमस्टे का प्रबंधन करें और कमाई देखें' },
  'partner.totalBookings': { en: 'Total Bookings', te: 'మొత్తం బుకింగ్‌లు', kn: 'ಒಟ್ಟು ಬುಕಿಂಗ್‌ಗಳು', ta: 'மொத்த முன்பதிவுகள்', hi: 'कुल बुकिंग' },
  'partner.totalRevenue': { en: 'Total Revenue', te: 'మొత్తం ఆదాయం', kn: 'ಒಟ್ಟು ಆದಾಯ', ta: 'மொத்த வருவாய்', hi: 'कुल राजस्व' },
  'partner.roomOccupancy': { en: 'Room Occupancy', te: 'గది ఆక్యుపెన్సీ', kn: 'ಕೊಠಡಿ ಆಕ್ಯುಪೆನ್ಸಿ', ta: 'அறை ஆக்கிரமிப்பு', hi: 'कमरा अधिभोग' },
  'partner.roomAvailability': { en: 'Room Availability', te: 'గది లభ్యత', kn: 'ಕೊಠಡಿ ಲಭ್ಯತೆ', ta: 'அறை கிடைக்கும் தன்மை', hi: 'कमरा उपलब्धता' },
  
  // Admin Dashboard
  'admin.title': { en: 'Admin Dashboard', te: 'అడ్మిన్ డాష్‌బోర్డ్', kn: 'ನಿರ್ವಾಹಕ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್', ta: 'நிர்வாகி டாஷ்போர்டு', hi: 'व्यवस्थापक डैशबोर्ड' },
  'admin.homestays': { en: 'HomeStays', te: 'హోమ్‌స్టేలు', kn: 'ಹೋಮ್‌ಸ್ಟೇಗಳು', ta: 'ஹோம்ஸ்டேகள்', hi: 'होमस्टे' },
  'admin.bookings': { en: 'Bookings', te: 'బుకింగ్‌లు', kn: 'ಬುಕಿಂಗ್‌ಗಳು', ta: 'முன்பதிவுகள்', hi: 'बुकिंग' },
  'admin.issues': { en: 'Issues', te: 'సమస్యలు', kn: 'ಸಮಸ್ಯೆಗಳು', ta: 'சிக்கல்கள்', hi: 'समस्याएं' },
  
  // Common
  'common.loading': { en: 'Loading...', te: 'లోడ్ అవుతోంది...', kn: 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...', ta: 'ஏற்றுகிறது...', hi: 'लोड हो रहा है...' },
  'common.save': { en: 'Save', te: 'సేవ్ చేయండి', kn: 'ಉಳಿಸಿ', ta: 'சேமிக்கவும்', hi: 'सहेजें' },
  'common.cancel': { en: 'Cancel', te: 'రద్దు చేయండి', kn: 'ರದ್ದುಮಾಡಿ', ta: 'ரத்துசெய்யவும்', hi: 'रद्द करें' },
  'common.confirm': { en: 'Confirm', te: 'నిర్ధారించండి', kn: 'ದೃಢೀಕರಿಸಿ', ta: 'உறுதிப்படுத்தவும்', hi: 'पुष्टि करें' },
  'common.close': { en: 'Close', te: 'మూసివేయండి', kn: 'ಮುಚ್ಚಿ', ta: 'மூடு', hi: 'बंद करें' },
  'common.guests': { en: 'guests', te: 'అతిథులు', kn: 'ಅತಿಥಿಗಳು', ta: 'விருந்தினர்கள்', hi: 'मेहमान' },
  'common.rooms': { en: 'rooms', te: 'గదులు', kn: 'ಕೊಠಡಿಗಳು', ta: 'அறைகள்', hi: 'कमरे' },
};

export function getStoredLanguage(): Language {
  try {
    const stored = localStorage.getItem(LANGUAGE_KEY);
    if (stored && (stored === 'en' || stored === 'te' || stored === 'kn' || stored === 'ta' || stored === 'hi')) {
      return stored as Language;
    }
  } catch (error) {
    console.error('Error reading language preference:', error);
  }
  return 'en';
}

export function setStoredLanguage(lang: Language): void {
  try {
    localStorage.setItem(LANGUAGE_KEY, lang);
    window.dispatchEvent(new Event('languageChanged'));
  } catch (error) {
    console.error('Error saving language preference:', error);
  }
}

export function translate(key: string, lang: Language): string {
  return translations[key]?.[lang] || translations[key]?.['en'] || key;
}
