// SMS Notification System for Room Owners
// Simulates SMS notifications and stores logs in localStorage

export interface SMSNotification {
  id: string;
  recipientName: string;
  recipientPhone: string;
  message: string;
  timestamp: number;
  bookingId: string;
  roomId: string;
  roomName: string;
  customerName: string;
  status: 'sent' | 'pending' | 'failed';
  type: 'booking_confirmation';
}

const SMS_STORAGE_KEY = 'mantralayam_sms_notifications';

// Get all SMS notifications
export function getSMSNotifications(): SMSNotification[] {
  const data = localStorage.getItem(SMS_STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (error) {
    console.error('Error parsing SMS notifications:', error);
    return [];
  }
}

// Send SMS notification to room owner
export function sendBookingNotificationSMS(
  roomId: string,
  roomName: string,
  ownerName: string,
  ownerPhone: string,
  customerName: string,
  bookingId: string,
  checkInDate: string,
  checkOutDate: string
): SMSNotification {
  // Format the SMS message
  const message = `New Booking Alert!\n\nRoom: ${roomName}\nCustomer: ${customerName}\nCheck-in: ${new Date(checkInDate).toLocaleString('en-IN', { 
    dateStyle: 'medium', 
    timeStyle: 'short' 
  })}\nCheck-out: ${new Date(checkOutDate).toLocaleString('en-IN', { 
    dateStyle: 'medium', 
    timeStyle: 'short' 
  })}\nBooking ID: ${bookingId}\n\nThank you for using Mantralayam Booking System.`;

  const notification: SMSNotification = {
    id: `sms-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    recipientName: ownerName,
    recipientPhone: ownerPhone,
    message,
    timestamp: Date.now(),
    bookingId,
    roomId,
    roomName,
    customerName,
    status: 'sent',
    type: 'booking_confirmation',
  };

  // Store notification
  const notifications = getSMSNotifications();
  notifications.push(notification);
  localStorage.setItem(SMS_STORAGE_KEY, JSON.stringify(notifications));

  // Dispatch event for real-time updates
  window.dispatchEvent(new CustomEvent('smsNotificationSent', { detail: notification }));

  return notification;
}

// Get SMS notifications for a specific room
export function getSMSNotificationsForRoom(roomId: string): SMSNotification[] {
  return getSMSNotifications().filter(n => n.roomId === roomId);
}

// Get recent SMS notifications (last 24 hours)
export function getRecentSMSNotifications(): SMSNotification[] {
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  return getSMSNotifications().filter(n => n.timestamp > oneDayAgo);
}

// Clear old SMS notifications (older than 30 days)
export function clearOldSMSNotifications(): void {
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const notifications = getSMSNotifications();
  const filtered = notifications.filter(n => n.timestamp > thirtyDaysAgo);
  localStorage.setItem(SMS_STORAGE_KEY, JSON.stringify(filtered));
}

// Get SMS notification statistics
export function getSMSStatistics() {
  const notifications = getSMSNotifications();
  return {
    total: notifications.length,
    sent: notifications.filter(n => n.status === 'sent').length,
    pending: notifications.filter(n => n.status === 'pending').length,
    failed: notifications.filter(n => n.status === 'failed').length,
    last24Hours: getRecentSMSNotifications().length,
  };
}
