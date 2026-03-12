import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit,
  Eye,
  GripVertical,
  Image as ImageIcon,
  Plus,
  Save,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  type TempleSpecials,
  type TempleUpdate,
  getTempleSpecials,
  saveTempleSpecials,
} from "../../lib/dataStorage";

// Helper function to convert Google Drive/Photos links to direct image URLs
function convertToDirectImageUrl(url: string): string {
  try {
    // Google Drive: https://drive.google.com/file/d/FILE_ID/view
    if (url.includes("drive.google.com")) {
      const fileIdMatch = url.match(/\/d\/([^/]+)/);
      if (fileIdMatch) {
        return `https://drive.google.com/uc?export=view&id=${fileIdMatch[1]}`;
      }
    }

    // Google Photos: Extract direct link if possible
    if (
      url.includes("photos.google.com") ||
      url.includes("lh3.googleusercontent.com")
    ) {
      // If already a direct link, return as is
      if (url.includes("googleusercontent.com")) {
        return url;
      }
    }

    // Return original URL if no conversion needed
    return url;
  } catch {
    return url;
  }
}

export default function TempleSpecialsManagement() {
  const [specials, setSpecials] = useState<TempleSpecials>(getTempleSpecials());
  const [updates, setUpdates] = useState<TempleUpdate[]>(specials.updates);
  const [editingUpdate, setEditingUpdate] = useState<TempleUpdate | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // Form state for new/edit update
  const [formImageLink, setFormImageLink] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formTime, setFormTime] = useState("");

  useEffect(() => {
    const handleUpdate = () => {
      const updated = getTempleSpecials();
      setSpecials(updated);
      setUpdates(updated.updates);
    };
    window.addEventListener("templeSpecialsUpdated", handleUpdate);
    return () =>
      window.removeEventListener("templeSpecialsUpdated", handleUpdate);
  }, []);

  const handleAddNewUpdate = () => {
    if (!formImageLink.trim()) {
      toast.error("Please enter an image URL");
      return;
    }
    if (!formDescription.trim()) {
      toast.error("Please enter a description");
      return;
    }

    try {
      new URL(formImageLink);
      const convertedUrl = convertToDirectImageUrl(formImageLink.trim());

      const newUpdate: TempleUpdate = {
        id: `update-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        imageLink: convertedUrl,
        description: formDescription.trim(),
        time: formTime.trim(),
        order: updates.length + 1,
      };

      setUpdates([...updates, newUpdate]);
      setFormImageLink("");
      setFormDescription("");
      setFormTime("");
      toast.success("Temple update added successfully");
    } catch {
      toast.error("Please enter a valid image URL");
    }
  };

  const handleEditUpdate = (update: TempleUpdate) => {
    setEditingUpdate(update);
    setFormImageLink(update.imageLink);
    setFormDescription(update.description);
    setFormTime(update.time);
  };

  const handleSaveEdit = () => {
    if (!editingUpdate) return;
    if (!formImageLink.trim()) {
      toast.error("Please enter an image URL");
      return;
    }
    if (!formDescription.trim()) {
      toast.error("Please enter a description");
      return;
    }

    try {
      new URL(formImageLink);
      const convertedUrl = convertToDirectImageUrl(formImageLink.trim());

      const updatedList = updates.map((u) =>
        u.id === editingUpdate.id
          ? {
              ...u,
              imageLink: convertedUrl,
              description: formDescription.trim(),
              time: formTime.trim(),
            }
          : u,
      );

      setUpdates(updatedList);
      setEditingUpdate(null);
      setFormImageLink("");
      setFormDescription("");
      setFormTime("");
      toast.success("Temple update edited successfully");
    } catch {
      toast.error("Please enter a valid image URL");
    }
  };

  const handleCancelEdit = () => {
    setEditingUpdate(null);
    setFormImageLink("");
    setFormDescription("");
    setFormTime("");
  };

  const handleDeleteUpdate = (id: string) => {
    const updatedList = updates
      .filter((u) => u.id !== id)
      .map((u, index) => ({ ...u, order: index + 1 }));
    setUpdates(updatedList);
    toast.success("Temple update deleted");
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newUpdates = [...updates];
    [newUpdates[index - 1], newUpdates[index]] = [
      newUpdates[index],
      newUpdates[index - 1],
    ];
    for (const [i, u] of newUpdates.entries()) {
      u.order = i + 1;
    }
    setUpdates(newUpdates);
  };

  const _handleMoveDown = (index: number) => {
    if (index === updates.length - 1) return;
    const newUpdates = [...updates];
    [newUpdates[index], newUpdates[index + 1]] = [
      newUpdates[index + 1],
      newUpdates[index],
    ];
    for (const [i, u] of newUpdates.entries()) {
      u.order = i + 1;
    }
    setUpdates(newUpdates);
  };

  const handleSaveAll = () => {
    if (updates.length === 0) {
      toast.error("Please add at least one temple update");
      return;
    }

    setIsSaving(true);
    const updatedSpecials: TempleSpecials = {
      updates: updates.map((u, index) => ({ ...u, order: index + 1 })),
      lastUpdated: new Date().toISOString(),
    };

    saveTempleSpecials(updatedSpecials);
    setSpecials(updatedSpecials);
    setIsSaving(false);
    toast.success(
      "All temple updates saved successfully! Changes are now live on the Home Page.",
    );
  };

  const handlePreview = () => {
    if (updates.length === 0) {
      toast.error("No updates to preview");
      return;
    }
    setPreviewIndex(0);
    setShowPreview(true);
  };

  const nextPreview = () => {
    setPreviewIndex((prev) => (prev + 1) % updates.length);
  };

  const prevPreview = () => {
    setPreviewIndex((prev) => (prev - 1 + updates.length) % updates.length);
  };

  return (
    <div className="space-y-6">
      <Card className="glass-card bg-slate-900/60 border-slate-800 shadow-saffron-lg">
        <CardHeader className="border-b border-slate-800 bg-gradient-to-r from-primary/10 to-accent/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-saffron-gold flex items-center justify-center shadow-saffron">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl text-slate-100">
                Temple Specials Management
              </CardTitle>
              <p className="text-sm text-slate-400">
                Manage multiple temple updates with carousel display
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Add/Edit Form */}
          <Card className="glass-card bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-lg text-slate-100 flex items-center gap-2">
                {editingUpdate ? (
                  <Edit className="h-5 w-5 text-accent" />
                ) : (
                  <Plus className="h-5 w-5 text-primary" />
                )}
                {editingUpdate ? "Edit Temple Update" : "Add New Temple Update"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Image Link */}
              <div className="space-y-2">
                <Label className="text-slate-300 font-medium flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-primary" />
                  Image Link (Google Photos/Drive or any public URL) *
                </Label>
                <Input
                  value={formImageLink}
                  onChange={(e) => setFormImageLink(e.target.value)}
                  placeholder="Paste image URL here..."
                  className="glass-card bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500"
                />
                <p className="text-xs text-slate-500">
                  16:9 aspect ratio recommended for best display
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label className="text-slate-300 font-medium">
                  Event Description / Matter *
                </Label>
                <Textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Enter event description..."
                  className="glass-card bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500 min-h-[100px]"
                  rows={4}
                />
              </div>

              {/* Time */}
              <div className="space-y-2">
                <Label className="text-slate-300 font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Event Time
                </Label>
                <Input
                  value={formTime}
                  onChange={(e) => setFormTime(e.target.value)}
                  placeholder="e.g., Morning Pooja at 7 AM"
                  className="glass-card bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                {editingUpdate ? (
                  <>
                    <Button
                      onClick={handleSaveEdit}
                      className="gradient-saffron-gold text-white border-0 hover:opacity-90 flex-1"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button
                      onClick={handleCancelEdit}
                      variant="outline"
                      className="border-slate-700 text-slate-300 hover:bg-slate-800"
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={handleAddNewUpdate}
                    className="gradient-saffron-gold text-white border-0 hover:opacity-90 flex-1"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Update
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Updates List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-slate-300 font-medium text-lg">
                Temple Updates ({updates.length})
              </Label>
            </div>

            {updates.length > 0 ? (
              <div className="space-y-3">
                {updates.map((update, index) => (
                  <Card
                    key={update.id}
                    className="glass-card bg-slate-800/50 border-slate-700 group hover:border-primary/50 transition-smooth"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Reorder Controls */}
                        <div className="flex flex-col gap-1 pt-2">
                          <Button
                            onClick={() => handleMoveUp(index)}
                            disabled={index === 0}
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-slate-400 hover:text-slate-200 disabled:opacity-30"
                          >
                            <GripVertical className="h-4 w-4" />
                          </Button>
                          <span className="text-xs text-slate-500 text-center">
                            {index + 1}
                          </span>
                        </div>

                        {/* Preview Image */}
                        <div className="w-32 aspect-video rounded-lg overflow-hidden bg-slate-900 flex-shrink-0">
                          <img
                            src={update.imageLink}
                            alt={`Update ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://via.placeholder.com/128x72?text=Error";
                            }}
                          />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 space-y-2">
                          <p className="text-sm text-slate-300 line-clamp-2">
                            {update.description}
                          </p>
                          {update.time && (
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                              <Clock className="h-3 w-3" />
                              <span>{update.time}</span>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleEditUpdate(update)}
                            variant="ghost"
                            size="sm"
                            className="text-accent hover:text-accent/80 hover:bg-accent/10"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteUpdate(update.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-lg bg-slate-800/30 border border-slate-700/50 text-center">
                <Sparkles className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-400">
                  No temple updates added yet
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Add your first update using the form above
                </p>
              </div>
            )}
          </div>

          {/* Last Updated Info */}
          <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <p className="text-sm text-slate-400">
              Last updated:{" "}
              {new Date(specials.lastUpdated).toLocaleString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          {/* Save All & Preview Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSaveAll}
              disabled={isSaving || updates.length === 0}
              className="gradient-saffron-gold text-white border-0 hover:opacity-90 flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save All Changes"}
            </Button>
            <Button
              onClick={handlePreview}
              disabled={updates.length === 0}
              variant="outline"
              className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-slate-100"
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview Carousel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview Dialog with Carousel */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-5xl glass-card bg-slate-900 border-slate-800 text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              Temple Specials Carousel Preview
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Preview how the temple updates will appear on the Home Page with
              automatic rotation
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            {updates.length > 0 && (
              <div className="relative group">
                <div className="relative w-full aspect-video rounded-xl overflow-hidden border-2 border-slate-700">
                  <img
                    src={updates[previewIndex].imageLink}
                    alt={`Preview ${previewIndex + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://via.placeholder.com/1280x720?text=Error+Loading";
                    }}
                  />

                  {/* Bottom Overlay Preview */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-6">
                    <div className="glass-card bg-white/10 backdrop-blur-md border-white/20 rounded-xl p-4 shadow-saffron-lg">
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <Sparkles className="h-5 w-5 text-accent flex-shrink-0 mt-1" />
                          <div className="flex-1">
                            <p className="text-white text-base leading-relaxed font-medium">
                              {updates[previewIndex].description}
                            </p>
                          </div>
                        </div>

                        {updates[previewIndex].time && (
                          <div className="flex items-center gap-2 text-white/90 text-sm">
                            <Clock className="h-4 w-4 text-accent" />
                            <span className="font-medium">
                              {updates[previewIndex].time}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Navigation Arrows */}
                  {updates.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={prevPreview}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-lg transition-smooth"
                      >
                        <ChevronLeft className="h-6 w-6 text-primary" />
                      </button>
                      <button
                        type="button"
                        onClick={nextPreview}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-lg transition-smooth"
                      >
                        <ChevronRight className="h-6 w-6 text-primary" />
                      </button>
                      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {updates.map((update, index) => (
                          <button
                            type="button"
                            key={update.id || String(index)}
                            onClick={() => setPreviewIndex(index)}
                            className={`w-2 h-2 rounded-full transition-smooth ${
                              index === previewIndex
                                ? "bg-white w-8"
                                : "bg-white/50 hover:bg-white/75"
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
                <p className="text-center text-sm text-slate-400 mt-4">
                  Update {previewIndex + 1} of {updates.length}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
