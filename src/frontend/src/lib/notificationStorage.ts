// Permanent notification storage system for admin portal
// All notifications are stored permanently in localStorage with categorization

export interface PermanentNotification {
  id: string;
  message: string;
  timestamp: number;
  category: 'bookings' | 'payments' | 'partner' | 'logins' | 'issues';
  type: string;
}

const PERMANENT_NOTIFICATIONS_KEY = 'mantralayam_permanent_notifications';

// Load all permanent notifications
export function loadPermanentNotifications(): PermanentNotification[] {
  try {
    const stored = localStorage.getItem(PERMANENT_NOTIFICATIONS_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error loading permanent notifications:', error);
    return [];
  }
}

// Save permanent notifications
function savePermanentNotifications(notifications: PermanentNotification[]): void {
  try {
    localStorage.setItem(PERMANENT_NOTIFICATIONS_KEY, JSON.stringify(notifications));
    // Dispatch event to notify admin dashboard and trigger toasts
    window.dispatchEvent(new CustomEvent('notificationsUpdated', { detail: notifications }));
  } catch (error) {
    console.error('Error saving permanent notifications:', error);
  }
}

// Add a new notification (with optional id for backend sync)
export function addPermanentNotification(
  message: string,
  category: 'bookings' | 'payments' | 'partner' | 'logins' | 'issues',
  type: string,
  id?: string,
  timestamp?: number
): void {
  const notifications = loadPermanentNotifications();
  
  // Check if notification with this id already exists (avoid duplicates during backend sync)
  if (id && notifications.some(n => n.id === id)) {
    return;
  }
  
  const newNotification: PermanentNotification = {
    id: id || `notification_${Date.now()}_${Math.random()}`,
    message,
    timestamp: timestamp || Date.now(),
    category,
    type,
  };
  notifications.push(newNotification);
  savePermanentNotifications(notifications);
  
  // Dispatch a separate event for new notifications (for toast)
  window.dispatchEvent(new CustomEvent('newNotification', { detail: newNotification }));
}

// Delete a specific notification
export function deletePermanentNotification(notificationId: string): void {
  const notifications = loadPermanentNotifications();
  const filtered = notifications.filter(n => n.id !== notificationId);
  savePermanentNotifications(filtered);
}

// Delete all notifications in a category
export function deleteCategoryNotifications(category: 'bookings' | 'payments' | 'partner' | 'logins' | 'issues'): void {
  const notifications = loadPermanentNotifications();
  const filtered = notifications.filter(n => n.category !== category);
  savePermanentNotifications(filtered);
}

// Get notifications by category
export function getNotificationsByCategory(category: 'bookings' | 'payments' | 'partner' | 'logins' | 'issues'): PermanentNotification[] {
  const notifications = loadPermanentNotifications();
  return notifications.filter(n => n.category === category).sort((a, b) => b.timestamp - a.timestamp);
}

// Get notification count by category
export function getNotificationCountByCategory(): Record<string, number> {
  const notifications = loadPermanentNotifications();
  return {
    bookings: notifications.filter(n => n.category === 'bookings').length,
    payments: notifications.filter(n => n.category === 'payments').length,
    partner: notifications.filter(n => n.category === 'partner').length,
    logins: notifications.filter(n => n.category === 'logins').length,
    issues: notifications.filter(n => n.category === 'issues').length,
  };
}

// Clear all notifications (admin only)
export function clearAllNotifications(): void {
  savePermanentNotifications([]);
}
