import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Calendar,
  CheckCircle,
  Clock,
  MessageSquare,
  Phone,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  type SMSNotification,
  getRecentSMSNotifications,
  getSMSNotifications,
  getSMSStatistics,
} from "../../lib/smsNotifications";

export default function SMSNotificationPanel() {
  const [notifications, setNotifications] = useState<SMSNotification[]>([]);
  const [statistics, setStatistics] = useState({
    total: 0,
    sent: 0,
    pending: 0,
    failed: 0,
    last24Hours: 0,
  });

  const loadNotifications = () => {
    const recent = getRecentSMSNotifications();
    setNotifications(recent);
    setStatistics(getSMSStatistics());
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: loadNotifications is stable
  useEffect(() => {
    loadNotifications();

    // Listen for new SMS notifications
    const handleSMSNotification = () => {
      loadNotifications();
    };

    window.addEventListener("smsNotificationSent", handleSMSNotification);

    // Poll for updates every 10 seconds
    const interval = setInterval(loadNotifications, 10000);

    return () => {
      window.removeEventListener("smsNotificationSent", handleSMSNotification);
      clearInterval(interval);
    };
  }, []);

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60)
      return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    return date.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const getStatusBadge = (status: SMSNotification["status"]) => {
    switch (status) {
      case "sent":
        return (
          <Badge variant="default" className="bg-green-500">
            Sent
          </Badge>
        );
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-slate-100 mb-2">
          SMS Notifications
        </h3>
        <p className="text-sm text-slate-400">
          Automatic SMS notifications sent to room owners when bookings are
          confirmed
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-slate-900 border-slate-700">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-100">
                {statistics.total}
              </p>
              <p className="text-xs text-slate-400 mt-1">Total SMS</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-700">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">
                {statistics.sent}
              </p>
              <p className="text-xs text-slate-400 mt-1">Sent</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-700">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-400">
                {statistics.pending}
              </p>
              <p className="text-xs text-slate-400 mt-1">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-700">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-400">
                {statistics.failed}
              </p>
              <p className="text-xs text-slate-400 mt-1">Failed</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-700">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-400">
                {statistics.last24Hours}
              </p>
              <p className="text-xs text-slate-400 mt-1">Last 24h</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <Alert className="bg-slate-900 border-slate-700">
          <MessageSquare className="h-4 w-4 text-slate-400" />
          <AlertDescription className="text-slate-300">
            No SMS notifications sent in the last 24 hours.
          </AlertDescription>
        </Alert>
      ) : (
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg text-slate-100 flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Recent SMS Notifications (Last 24 Hours)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className="bg-slate-800 border-slate-700"
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                              <MessageSquare className="h-4 w-4 text-blue-400" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-100">
                                {notification.roomName}
                              </p>
                              <p className="text-xs text-slate-400">
                                Booking #{notification.bookingId.slice(-8)}
                              </p>
                            </div>
                          </div>
                          {getStatusBadge(notification.status)}
                        </div>

                        {/* Recipient Info */}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-slate-300">
                            <User className="h-3 w-3 text-slate-500" />
                            <span>{notification.recipientName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-300">
                            <Phone className="h-3 w-3 text-slate-500" />
                            <span>{notification.recipientPhone}</span>
                          </div>
                        </div>

                        {/* Customer Info */}
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                          <User className="h-3 w-3 text-slate-500" />
                          <span>Customer: {notification.customerName}</span>
                        </div>

                        {/* Message Preview */}
                        <div className="bg-slate-900 rounded-lg p-3">
                          <p className="text-xs text-slate-400 mb-1">
                            Message:
                          </p>
                          <p className="text-sm text-slate-200 whitespace-pre-line line-clamp-3">
                            {notification.message}
                          </p>
                        </div>

                        {/* Timestamp */}
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Clock className="h-3 w-3" />
                          <span>{formatTimestamp(notification.timestamp)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Info Alert */}
      <Alert className="bg-slate-900 border-slate-700">
        <CheckCircle className="h-4 w-4 text-green-400" />
        <AlertDescription className="text-slate-300">
          <strong>Automatic SMS System:</strong> When a booking is confirmed
          after successful payment, an SMS notification is automatically sent to
          the room owner with booking details including customer name,
          check-in/check-out times, and booking reference number.
        </AlertDescription>
      </Alert>
    </div>
  );
}
