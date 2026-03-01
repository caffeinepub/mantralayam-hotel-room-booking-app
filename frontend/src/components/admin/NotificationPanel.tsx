import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, CheckCircle, CreditCard, UserPlus, Building2, AlertCircle, LogIn, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useGetNotifications } from '../../hooks/useQueries';
import { Variant_profileUpdate_booking_newLogin_partner_payment } from '../../backend';
import { toast } from 'sonner';
import {
  loadPermanentNotifications,
  addPermanentNotification,
  deletePermanentNotification,
  deleteCategoryNotifications,
  PermanentNotification,
} from '../../lib/notificationStorage';

type NotificationCategory = 'partner' | 'bookings' | 'payments' | 'logins' | 'issues';

export default function NotificationPanel() {
  const { data: backendNotifications = [], isLoading, refetch } = useGetNotifications();
  const [permanentNotifications, setPermanentNotifications] = useState<PermanentNotification[]>([]);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    bookings: true,
    payments: true,
    partner: true,
    logins: true,
    issues: true,
  });

  // Load permanent notifications from storage
  const refreshNotifications = () => {
    setPermanentNotifications(loadPermanentNotifications());
  };

  useEffect(() => {
    refreshNotifications();
  }, []);

  // Sync backend notifications to permanent storage
  useEffect(() => {
    if (backendNotifications.length > 0) {
      backendNotifications.forEach(n => {
        const category = mapNotificationType(n.notificationType);
        addPermanentNotification(
          n.message,
          category as NotificationCategory,
          n.notificationType,
          n.id,
          Number(n.timestamp)
        );
      });
      refreshNotifications();
    }
  }, [backendNotifications]);

  // Listen for storage events - fixed to listen to correct events
  useEffect(() => {
    const handleStorageUpdate = () => {
      refreshNotifications();
    };

    // Listen to all notification storage events
    window.addEventListener('notificationsUpdated', handleStorageUpdate);
    window.addEventListener('newNotification', handleStorageUpdate);
    window.addEventListener('notificationAdded', handleStorageUpdate);
    window.addEventListener('notificationDeleted', handleStorageUpdate);

    return () => {
      window.removeEventListener('notificationsUpdated', handleStorageUpdate);
      window.removeEventListener('newNotification', handleStorageUpdate);
      window.removeEventListener('notificationAdded', handleStorageUpdate);
      window.removeEventListener('notificationDeleted', handleStorageUpdate);
    };
  }, []);

  const mapNotificationType = (type: Variant_profileUpdate_booking_newLogin_partner_payment): string => {
    switch (type) {
      case 'booking': return 'bookings';
      case 'payment': return 'payments';
      case 'partner': return 'partner';
      case 'newLogin': return 'logins';
      case 'profileUpdate': return 'logins';
      default: return 'bookings';
    }
  };

  const handleDelete = (id: string) => {
    deletePermanentNotification(id);
    toast.success('Notification deleted');
    refreshNotifications();
  };

  const handleDeleteCategory = (category: NotificationCategory) => {
    deleteCategoryNotifications(category);
    toast.success(`All ${category} notifications deleted`);
    refreshNotifications();
  };

  const toggleCategory = (category: string) => {
    setOpenCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'bookings': return <CheckCircle className="h-5 w-5" />;
      case 'payments': return <CreditCard className="h-5 w-5" />;
      case 'partner': return <Building2 className="h-5 w-5" />;
      case 'logins': return <LogIn className="h-5 w-5" />;
      case 'issues': return <AlertCircle className="h-5 w-5" />;
      default: return <Bell className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'bookings': return 'text-green-600 dark:text-green-400';
      case 'payments': return 'text-blue-600 dark:text-blue-400';
      case 'partner': return 'text-purple-600 dark:text-purple-400';
      case 'logins': return 'text-amber-600 dark:text-amber-400';
      case 'issues': return 'text-red-600 dark:text-red-400';
      default: return 'text-primary';
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'bookings': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'payments': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'partner': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'logins': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'issues': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-primary/10 text-primary';
    }
  };

  const getCategoryBorderColor = (category: string) => {
    switch (category) {
      case 'issues': return 'border-l-4 border-l-red-500';
      default: return '';
    }
  };

  const groupedNotifications = permanentNotifications.reduce((acc, notif) => {
    if (!acc[notif.category]) {
      acc[notif.category] = [];
    }
    acc[notif.category].push(notif);
    return acc;
  }, {} as Record<string, PermanentNotification[]>);

  const categories: NotificationCategory[] = ['bookings', 'payments', 'partner', 'logins', 'issues'];

  if (isLoading) {
    return (
      <Card className="glass-card shadow-saffron">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Loading notifications...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Notifications</h2>
          <p className="text-sm text-muted-foreground">
            {permanentNotifications.length} total notifications
          </p>
        </div>
        <Button
          onClick={() => refetch()}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Bell className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {permanentNotifications.length === 0 ? (
        <Card className="glass-card shadow-saffron">
          <CardContent className="py-12 text-center">
            <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No notifications yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {categories.map(category => {
            const categoryNotifications = groupedNotifications[category] || [];
            if (categoryNotifications.length === 0) return null;

            return (
              <Card key={category} className="glass-card shadow-saffron">
                <Collapsible
                  open={openCategories[category]}
                  onOpenChange={() => toggleCategory(category)}
                >
                  <CardHeader className="pb-3">
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center justify-between cursor-pointer group">
                        <div className="flex items-center gap-3">
                          <div className={getCategoryColor(category)}>
                            {getCategoryIcon(category)}
                          </div>
                          <div>
                            <CardTitle className="text-lg capitalize">{category}</CardTitle>
                            <p className="text-sm text-muted-foreground">
                              {categoryNotifications.length} notification{categoryNotifications.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCategory(category);
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          {openCategories[category] ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </CollapsibleTrigger>
                  </CardHeader>
                  <CollapsibleContent>
                    <CardContent className="space-y-2 pt-0">
                      {categoryNotifications
                        .sort((a, b) => b.timestamp - a.timestamp)
                        .map((notification) => (
                          <Alert
                            key={notification.id}
                            className={`group hover:bg-accent/50 transition-colors ${getCategoryBorderColor(category)}`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <AlertDescription className="text-sm break-words">
                                  {notification.message}
                                </AlertDescription>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {new Date(notification.timestamp).toLocaleString()}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <Badge className={getCategoryBadgeColor(category)}>
                                  {category}
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(notification.id)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </Alert>
                        ))}
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
