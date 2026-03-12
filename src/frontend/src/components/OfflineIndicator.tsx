import { Badge } from "@/components/ui/badge";
import { RefreshCw, Wifi, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSync, setPendingSync] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Connection restored");

      // Check for pending sync
      const hasPendingData = localStorage.getItem("mantralayam_pending_sync");
      if (hasPendingData) {
        setPendingSync(true);
        setTimeout(() => {
          syncPendingData();
        }, 1000);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning(
        "You are offline. Data will sync when connection is restored.",
      );
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const syncPendingData = () => {
    try {
      // Simulate sync process
      setTimeout(() => {
        localStorage.removeItem("mantralayam_pending_sync");
        setPendingSync(false);
        toast.success("Data synchronized successfully");
        window.dispatchEvent(new Event("dataSync"));
      }, 2000);
    } catch (error) {
      console.error("Sync error:", error);
      toast.error("Failed to sync data");
    }
  };

  if (isOnline && !pendingSync) return null;

  return (
    <div className="fixed top-20 right-6 z-50 animate-fade-in">
      {!isOnline ? (
        <Badge variant="destructive" className="gap-2 px-4 py-2 shadow-lg">
          <WifiOff className="h-4 w-4" />
          Offline Mode
        </Badge>
      ) : pendingSync ? (
        <Badge className="gap-2 px-4 py-2 shadow-lg gradient-saffron-gold text-white border-0">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Syncing data...
        </Badge>
      ) : null}
    </div>
  );
}
