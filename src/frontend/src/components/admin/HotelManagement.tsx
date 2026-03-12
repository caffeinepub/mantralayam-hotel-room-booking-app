import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Edit,
  Hotel as HotelIcon,
  MapPin,
  Plus,
  Star,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { type Hotel as BackendHotel, ExternalBlob } from "../../backend";
import {
  useAddHotel,
  useDeleteHotel,
  useGetAdminHotels,
  useUpdateHotel,
} from "../../hooks/useQueries";

export default function HotelManagement() {
  const { data: hotels = [], isLoading } = useGetAdminHotels();
  const addHotel = useAddHotel();
  const updateHotel = useUpdateHotel();
  const deleteHotel = useDeleteHotel();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<BackendHotel | null>(null);

  const [hotelName, setHotelName] = useState("");
  const [hotelAddress, setHotelAddress] = useState("");
  const [hotelDescription, setHotelDescription] = useState("");
  const [hotelAmenities, setHotelAmenities] = useState("");
  const [hotelPhotos, setHotelPhotos] = useState<ExternalBlob[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{
    [key: number]: number;
  }>({});

  const resetForm = () => {
    setHotelName("");
    setHotelAddress("");
    setHotelDescription("");
    setHotelAmenities("");
    setHotelPhotos([]);
    setUploadProgress({});
    setEditingHotel(null);
  };

  const handleOpenDialog = (hotel?: BackendHotel) => {
    if (hotel) {
      setEditingHotel(hotel);
      setHotelName(hotel.name);
      setHotelAddress(hotel.address);
      setHotelDescription(hotel.description);
      setHotelAmenities(hotel.amenities.join(", "));
      setHotelPhotos(hotel.photos || []);
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newPhotos: ExternalBlob[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image file`);
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`);
        continue;
      }

      try {
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        const photoIndex = hotelPhotos.length + newPhotos.length;
        const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress(
          (percentage) => {
            setUploadProgress((prev) => ({
              ...prev,
              [photoIndex]: percentage,
            }));
          },
        );

        newPhotos.push(blob);
      } catch (error) {
        console.error("Error processing file:", error);
        toast.error(`Failed to process ${file.name}`);
      }
    }

    if (newPhotos.length > 0) {
      setHotelPhotos((prev) => [...prev, ...newPhotos]);
      toast.success(`${newPhotos.length} photo(s) added`);
    }

    e.target.value = "";
  };

  const handleRemovePhoto = (index: number) => {
    setHotelPhotos((prev) => prev.filter((_, i) => i !== index));
    setUploadProgress((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  };

  const handleSaveHotel = async () => {
    if (!hotelName.trim()) {
      toast.error("Hotel name is required");
      return;
    }

    try {
      const hotelData: BackendHotel = {
        id: editingHotel?.id || `hotel-${Date.now()}`,
        name: hotelName.trim(),
        address: hotelAddress.trim(),
        description: hotelDescription.trim(),
        amenities: hotelAmenities
          .split(",")
          .map((a) => a.trim())
          .filter(Boolean),
        photos: hotelPhotos,
      };

      if (editingHotel) {
        await updateHotel.mutateAsync(hotelData);
      } else {
        await addHotel.mutateAsync(hotelData);
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error: unknown) {
      console.error("Error saving hotel:", error);
    }
  };

  const handleDeleteHotel = async (hotelId: string) => {
    if (!confirm("Are you sure you want to delete this hotel?")) return;
    try {
      await deleteHotel.mutateAsync(hotelId);
    } catch (error: unknown) {
      console.error("Error deleting hotel:", error);
    }
  };

  const isSaving = addHotel.isPending || updateHotel.isPending;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">
            Hotel Management
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Manage your hotel properties
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => handleOpenDialog()}
              className="gradient-saffron-gold text-white border-0 hover:opacity-90 gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Hotel
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-700 max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-slate-100 text-xl">
                {editingHotel ? "Edit Hotel" : "Add New Hotel"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                  <HotelIcon className="h-5 w-5 text-primary" />
                  Basic Information
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="hotelName" className="text-slate-300">
                      Hotel Name *
                    </Label>
                    <Input
                      id="hotelName"
                      value={hotelName}
                      onChange={(e) => setHotelName(e.target.value)}
                      placeholder="Enter hotel name"
                      className="glass-card bg-slate-800 border-slate-700 text-slate-100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hotelAddress" className="text-slate-300">
                      Address
                    </Label>
                    <Input
                      id="hotelAddress"
                      value={hotelAddress}
                      onChange={(e) => setHotelAddress(e.target.value)}
                      placeholder="Enter address"
                      className="glass-card bg-slate-800 border-slate-700 text-slate-100"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hotelDescription" className="text-slate-300">
                    Description
                  </Label>
                  <Textarea
                    id="hotelDescription"
                    value={hotelDescription}
                    onChange={(e) => setHotelDescription(e.target.value)}
                    placeholder="Enter hotel description"
                    className="glass-card bg-slate-800 border-slate-700 text-slate-100"
                    rows={3}
                  />
                </div>
              </div>

              {/* Amenities */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  Amenities
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="hotelAmenities" className="text-slate-300">
                    Amenities (comma-separated)
                  </Label>
                  <Input
                    id="hotelAmenities"
                    value={hotelAmenities}
                    onChange={(e) => setHotelAmenities(e.target.value)}
                    placeholder="WiFi, AC, Parking, etc."
                    className="glass-card bg-slate-800 border-slate-700 text-slate-100"
                  />
                </div>
              </div>

              {/* Photo Upload */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                  <Upload className="h-5 w-5 text-primary" />
                  Photos
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Label
                      htmlFor="photoUpload"
                      className="cursor-pointer px-4 py-2 rounded-lg bg-primary text-white hover:opacity-90 transition-opacity flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Upload Photos
                    </Label>
                    <Input
                      id="photoUpload"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <span className="text-sm text-slate-400">
                      {hotelPhotos.length} photo(s) selected
                    </span>
                  </div>

                  {hotelPhotos.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {hotelPhotos.map((photo, index) => (
                        <div
                          key={photo.getDirectURL() || String(index)}
                          className="relative group"
                        >
                          <div className="aspect-video rounded-lg overflow-hidden bg-slate-800 border border-slate-700">
                            <img
                              src={photo.getDirectURL()}
                              alt={`Hotel view ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <Button
                            size="icon"
                            variant="destructive"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleRemovePhoto(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          {uploadProgress[index] !== undefined &&
                            uploadProgress[index] < 100 && (
                              <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-700">
                                <div
                                  className="h-full bg-primary transition-all duration-300"
                                  style={{ width: `${uploadProgress[index]}%` }}
                                />
                              </div>
                            )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="border-slate-700 text-slate-300"
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveHotel}
                className="gradient-saffron-gold text-white border-0 hover:opacity-90"
                disabled={isSaving}
              >
                {isSaving
                  ? "Saving..."
                  : editingHotel
                    ? "Update Hotel"
                    : "Add Hotel"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <Card className="glass-card bg-slate-900/50 border-slate-800">
          <CardContent className="py-12 text-center">
            <p className="text-slate-400">Loading hotels...</p>
          </CardContent>
        </Card>
      ) : hotels.length === 0 ? (
        <Card className="glass-card bg-slate-900/50 border-slate-800">
          <CardContent className="py-12 text-center">
            <HotelIcon className="h-12 w-12 text-slate-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-slate-100">
              No Hotels Yet
            </h3>
            <p className="text-slate-400 mb-4">
              Add your first hotel to get started
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {hotels.map((hotel) => (
            <Card
              key={hotel.id}
              className="glass-card bg-slate-900/50 border-slate-800 hover:border-primary/50 transition-colors"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-slate-100 flex items-center gap-2">
                      <HotelIcon className="h-5 w-5 text-primary" />
                      {hotel.name}
                    </CardTitle>
                    {hotel.address && (
                      <p className="text-sm text-slate-400 mt-1 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {hotel.address}
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {hotel.description && (
                  <p className="text-sm text-slate-300 line-clamp-2">
                    {hotel.description}
                  </p>
                )}

                {hotel.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {hotel.amenities.slice(0, 3).map((amenity) => (
                      <Badge
                        key={amenity}
                        variant="secondary"
                        className="text-xs"
                      >
                        {amenity}
                      </Badge>
                    ))}
                    {hotel.amenities.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{hotel.amenities.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}

                {hotel.photos && hotel.photos.length > 0 && (
                  <div className="text-sm text-slate-400">
                    {hotel.photos.length} photo(s)
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenDialog(hotel)}
                    className="flex-1 border-slate-700 text-slate-300 hover:text-slate-100"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteHotel(hotel.id)}
                    disabled={deleteHotel.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
