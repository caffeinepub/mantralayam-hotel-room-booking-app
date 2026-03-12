import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertTriangle,
  Bell,
  Building2,
  CheckCircle,
  CreditCard,
  LogIn,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  type PermanentNotification,
  getNotificationCountByCategory,
  loadPermanentNotifications,
} from "../lib/notificationStorage";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<PermanentNotification[]>(
    [],
  );
  const [counts, setCounts] = useState<Record<string, number>>({});

  const loadNotifications = () => {
    const allNotifications = loadPermanentNotifications();
    setNotifications(
      allNotifications.sort((a, b) => b.timestamp - a.timestamp),
    );
    setCounts(getNotificationCountByCategory());
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: loadNotifications is stable
  useEffect(() => {
    loadNotifications();

    const handleUpdate = () => {
      loadNotifications();
    };

    window.addEventListener("notificationsUpdated", handleUpdate);
    return () =>
      window.removeEventListener("notificationsUpdated", handleUpdate);
  }, []);

  const getNotificationIcon = (category: string) => {
    switch (category) {
      case "bookings":
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case "payments":
        return <CreditCard className="h-5 w-5 text-emerald-400" />;
      case "partner":
        return <Building2 className="h-5 w-5 text-orange-400" />;
      case "logins":
        return <LogIn className="h-5 w-5 text-cyan-400" />;
      case "issues":
        return <AlertTriangle className="h-5 w-5 text-red-400" />;
      default:
        return <Bell className="h-5 w-5 text-slate-400" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "bookings":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "payments":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "partner":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20";
      case "logins":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
      case "issues":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="container py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Notifications
        </h1>
        <p className="text-muted-foreground text-lg">
          View all system notifications and updates
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-5 mb-8">
        <Card className="glass-card shadow-saffron">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold text-primary">
                  {notifications.length}
                </p>
              </div>
              <Bell className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card shadow-saffron">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Bookings</p>
                <p className="text-2xl font-bold text-green-400">
                  {counts.bookings || 0}
                </p>
              </div>
              <CheckCircle className="h-6 w-6 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card shadow-saffron">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Payments</p>
                <p className="text-2xl font-bold text-emerald-400">
                  {counts.payments || 0}
                </p>
              </div>
              <CreditCard className="h-6 w-6 text-emerald-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card shadow-saffron">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Logins</p>
                <p className="text-2xl font-bold text-cyan-400">
                  {counts.logins || 0}
                </p>
              </div>
              <LogIn className="h-6 w-6 text-cyan-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card shadow-saffron">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Issues</p>
                <p className="text-2xl font-bold text-red-400">
                  {counts.issues || 0}
                </p>
              </div>
              <AlertTriangle className="h-6 w-6 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications List */}
      <Card className="glass-card shadow-saffron">
        <CardHeader>
          <CardTitle>All Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="py-12 text-center">
              <Bell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">
                No notifications yet
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Notifications will appear here as events occur
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg border hover:bg-muted/70 transition-colors"
                  >
                    <div className="p-2 bg-background rounded-lg shrink-0">
                      {getNotificationIcon(notification.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-sm font-medium">
                          {notification.message}
                        </p>
                        <Badge
                          variant="outline"
                          className={`shrink-0 ${getCategoryColor(notification.category)}`}
                        >
                          {notification.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatTimestamp(notification.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
