import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Key,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import type { RoomPasscodeConfig } from "../../backend";
import { useActor } from "../../hooks/useActor";
import {
  clearPartnerAuthCache,
  clearPartnerCachedData,
  getRooms,
  updateRoomPasscode,
} from "../../lib/roomStorage";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export default function PasscodeManagement() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [passcodes, setPasscodes] = useState<RoomPasscodeConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [newRoomId, setNewRoomId] = useState("");
  const [newPasscode, setNewPasscode] = useState("");
  const [showPasscode, setShowPasscode] = useState(false);
  const [deletingPasscode, setDeletingPasscode] = useState<string | null>(null);
  const [addingPasscode, setAddingPasscode] = useState(false);

  const loadPasscodes = async () => {
    if (!actor) return;
    setLoading(true);
    try {
      const data = await actor.getAllRoomPasscodes();
      setPasscodes(data);
    } catch (err) {
      setError(`Failed to load passcodes: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: loadPasscodes is stable
  useEffect(() => {
    loadPasscodes();
  }, [actor]);

  const handleAddPasscode = async () => {
    if (!newRoomId.trim() || !newPasscode.trim()) {
      setError("Room ID and passcode are required");
      return;
    }
    if (!actor) {
      setError("Actor not available");
      return;
    }

    setAddingPasscode(true);
    setError("");
    setSuccess("");

    try {
      // Check for duplicate passcode in localStorage rooms
      const rooms = getRooms();
      const duplicate = rooms.find(
        (r) =>
          (r.passcode === newPasscode.trim() ||
            r.password === newPasscode.trim()) &&
          r.id !== newRoomId.trim(),
      );
      if (duplicate) {
        setError(
          `Passcode already in use for room: ${duplicate.name || duplicate.id}`,
        );
        return;
      }

      // Set passcode in backend
      await actor.setRoomPasscode(newRoomId.trim(), newPasscode.trim());

      // Update localStorage
      updateRoomPasscode(newRoomId.trim(), newPasscode.trim());

      // Find the partner for this room and clear their auth cache
      const room = rooms.find((r) => r.id === newRoomId.trim());
      if (room?.partnerId) {
        clearPartnerAuthCache(room.partnerId);
      }
      clearPartnerCachedData();

      // Invalidate React Query caches
      queryClient.invalidateQueries({ queryKey: ["roomPasscodes"] });
      queryClient.invalidateQueries({ queryKey: ["allPartnerProfiles"] });
      queryClient.invalidateQueries({ queryKey: ["partnerAuth"] });

      setSuccess(
        `✅ Passcode set for room ${newRoomId.trim()}. Partner can now log in with this passcode.`,
      );
      setNewRoomId("");
      setNewPasscode("");
      await loadPasscodes();
    } catch (err: unknown) {
      setError(
        `Failed to set passcode: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setAddingPasscode(false);
    }
  };

  const handleDeletePasscode = async (passcode: string) => {
    if (!actor) return;
    if (!confirm("Remove this passcode?")) return;

    setDeletingPasscode(passcode);
    setError("");
    setSuccess("");

    try {
      // Find which room this passcode belongs to and clear auth cache
      const matchingConfig = passcodes.find((p) => p.passcode === passcode);
      if (matchingConfig) {
        const rooms = getRooms();
        const room = rooms.find((r) => r.id === matchingConfig.roomId);
        if (room?.partnerId) {
          clearPartnerAuthCache(room.partnerId);
        }
      }

      await actor.removeRoomPasscode(passcode);
      clearPartnerCachedData();

      queryClient.invalidateQueries({ queryKey: ["roomPasscodes"] });
      queryClient.invalidateQueries({ queryKey: ["partnerAuth"] });

      setSuccess("Passcode removed successfully");
      await loadPasscodes();
    } catch (err: unknown) {
      setError(
        `Failed to remove passcode: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setDeletingPasscode(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Key className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold text-foreground">
          Partner Passcode Management
        </h2>
      </div>

      <Card className="border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
        <CardContent className="p-4">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            <strong>How it works:</strong> Set a passcode for a partner room
            here. The partner uses this passcode to log in to their dashboard.
            Passcodes are stored in the backend and take effect immediately — no
            reload needed.
          </p>
        </CardContent>
      </Card>

      {success && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 text-sm">
          <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Add New Passcode */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Set Room Passcode
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Room ID</Label>
              <Input
                value={newRoomId}
                onChange={(e) => setNewRoomId(e.target.value)}
                placeholder="e.g. room_123"
              />
            </div>
            <div>
              <Label>Passcode / Password</Label>
              <div className="relative">
                <Input
                  type={showPasscode ? "text" : "password"}
                  value={newPasscode}
                  onChange={(e) => setNewPasscode(e.target.value)}
                  placeholder="Set partner login passcode"
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPasscode((s) => !s)}
                >
                  {showPasscode ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
          <Button
            onClick={handleAddPasscode}
            disabled={addingPasscode}
            className="gap-2"
          >
            {addingPasscode && <Loader2 className="w-4 h-4 animate-spin" />}
            Set Passcode
          </Button>
        </CardContent>
      </Card>

      {/* Existing Passcodes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Configured Passcodes</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground py-4">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading passcodes...</span>
            </div>
          ) : passcodes.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4 text-center">
              No passcodes configured yet. Add one above.
            </p>
          ) : (
            <div className="space-y-2">
              {passcodes.map((config) => (
                <div
                  key={config.passcode}
                  className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <Key className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <span className="text-sm font-medium">Room: </span>
                      <Badge variant="outline" className="text-xs font-mono">
                        {config.roomId}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Passcode: </span>
                      <Badge variant="secondary" className="text-xs font-mono">
                        ••••••
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDeletePasscode(config.passcode)}
                    disabled={deletingPasscode === config.passcode}
                  >
                    {deletingPasscode === config.passcode ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
