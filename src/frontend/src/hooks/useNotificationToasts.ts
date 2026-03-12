import { useEffect, useRef } from "react";
import { toast } from "sonner";
import type { PermanentNotification } from "../lib/notificationStorage";

export function useNotificationToasts() {
  const shownNotificationsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const handleNewNotification = (event: Event) => {
      const customEvent = event as CustomEvent<PermanentNotification>;
      const notification = customEvent.detail;

      // Deduplicate by notification id
      if (shownNotificationsRef.current.has(notification.id)) {
        return;
      }

      shownNotificationsRef.current.add(notification.id);

      // Show toast based on category
      const categoryEmoji: Record<string, string> = {
        bookings: "📅",
        payments: "💳",
        partner: "🏢",
        logins: "👤",
        issues: "⚠️",
      };

      const emoji = categoryEmoji[notification.category] || "🔔";

      toast.success(`${emoji} ${notification.message}`, {
        duration: 5000,
      });
    };

    window.addEventListener("newNotification", handleNewNotification);

    return () => {
      window.removeEventListener("newNotification", handleNewNotification);
    };
  }, []);
}
