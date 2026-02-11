import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Key, Lock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getHomeStays, saveHomeStays, type HomeStay } from '../../lib/dataStorage';

export default function PasscodeManagement() {
  const [homeStays, setHomeStays] = useState<HomeStay[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedHomeStayId, setSelectedHomeStayId] = useState('');
  const [newPasscode, setNewPasscode] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    loadHomeStays();
    
    const handleHomeStaysUpdated = () => {
      loadHomeStays();
    };
    
    window.addEventListener('homeStaysUpdated', handleHomeStaysUpdated);
    return () => window.removeEventListener('homeStaysUpdated', handleHomeStaysUpdated);
  }, []);

  const loadHomeStays = () => {
    const allHomeStays = getHomeStays();
    setHomeStays(allHomeStays);
  };

  const updateHomeStayPasscode = (homeStayId: string, passcode: string): boolean => {
    const allHomeStays = getHomeStays();
    const index = allHomeStays.findIndex(h => h.id === homeStayId);
    
    if (index === -1) return false;
    
    allHomeStays[index] = { ...allHomeStays[index], passcode };
    saveHomeStays(allHomeStays);
    return true;
  };

  const handleAddPasscode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedHomeStayId || !newPasscode.trim()) {
      toast.error('Please select a homestay and enter a passcode');
      return;
    }

    // Check if passcode already exists for a different homestay
    const existingHomeStay = homeStays.find(h => h.passcode === newPasscode.trim() && h.id !== selectedHomeStayId);
    if (existingHomeStay) {
      toast.error(`This passcode is already in use for homestay: ${existingHomeStay.name}`);
      return;
    }

    try {
      const success = updateHomeStayPasscode(selectedHomeStayId, newPasscode.trim());
      if (success) {
        toast.success('Passcode configured successfully!');
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 5000);
        setIsDialogOpen(false);
        setSelectedHomeStayId('');
        setNewPasscode('');
      } else {
        toast.error('HomeStay not found');
      }
    } catch (error: any) {
      console.error('Set passcode error:', error);
      toast.error(error.message || 'Failed to set passcode');
    }
  };

  const handleRemovePasscode = async (homeStayId: string) => {
    const homeStay = homeStays.find(h => h.id === homeStayId);
    if (!homeStay) return;

    if (!confirm(`Are you sure you want to remove the passcode for "${homeStay.name}"? The partner will lose access to their homestay.`)) {
      return;
    }

    try {
      // Generate a new random passcode to replace the old one
      const randomPasscode = `temp_${Date.now()}`;
      const success = updateHomeStayPasscode(homeStayId, randomPasscode);
      if (success) {
        toast.success('Passcode removed successfully');
      } else {
        toast.error('Failed to remove passcode');
      }
    } catch (error: any) {
      console.error('Remove passcode error:', error);
      toast.error('Failed to remove passcode');
    }
  };

  const getHomeStayName = (homeStay: HomeStay) => {
    return homeStay.name;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-100">
            <Key className="h-6 w-6" />
            Partner Passcode Management
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Configure passcodes for partner homestay access
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 gradient-saffron-gold text-white border-0 hover:opacity-90">
              <Plus className="h-4 w-4" />
              Update Passcode
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-slate-100">Configure HomeStay Passcode</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddPasscode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="homeStayId" className="text-slate-300">Select HomeStay</Label>
                <Select value={selectedHomeStayId} onValueChange={setSelectedHomeStayId}>
                  <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-100">
                    <SelectValue placeholder="Choose a homestay" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {homeStays.length === 0 ? (
                      <div className="p-2 text-sm text-slate-400">No homestays available</div>
                    ) : (
                      homeStays.map((homeStay) => (
                        <SelectItem key={homeStay.id} value={homeStay.id} className="text-slate-100">
                          {getHomeStayName(homeStay)} (Current: {homeStay.passcode || 'None'})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="passcode" className="text-slate-300">New Passcode</Label>
                <Input
                  id="passcode"
                  type="text"
                  value={newPasscode}
                  onChange={(e) => setNewPasscode(e.target.value)}
                  placeholder="Enter a unique passcode"
                  required
                  className="bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500"
                />
                <p className="text-xs text-slate-500">
                  This passcode will grant access to edit only this homestay
                </p>
              </div>

              <Alert className="bg-slate-900 border-slate-700">
                <Lock className="h-4 w-4 text-slate-400" />
                <AlertDescription className="text-slate-300">
                  Partners can use this passcode to log in and manage their homestay's price and availability.
                </AlertDescription>
              </Alert>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="bg-slate-900 border-slate-700 text-slate-300">
                  Cancel
                </Button>
                <Button type="submit" className="gradient-saffron-gold text-white border-0 hover:opacity-90">
                  Save Passcode
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {showSuccessMessage && (
        <Alert className="bg-green-950 border-green-800">
          <CheckCircle className="h-4 w-4 text-green-400" />
          <AlertDescription className="text-green-300">
            Passcode configured successfully! Partners can now use this passcode to access their homestay in the Partner Portal.
          </AlertDescription>
        </Alert>
      )}

      {homeStays.length === 0 ? (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="py-12 text-center">
            <Key className="h-12 w-12 text-slate-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-slate-100">No HomeStays Available</h3>
            <p className="text-sm text-slate-400 mb-4">
              Create homestays first before configuring passcodes
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {homeStays.map((homeStay) => (
            <Card key={homeStay.id} className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg text-slate-100">{getHomeStayName(homeStay)}</CardTitle>
                    <p className="text-sm text-slate-400 mt-1">HomeStay ID: {homeStay.id}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant="outline" className="border-slate-600 text-slate-300">
                        ₹{homeStay.minPrice.toLocaleString()} - ₹{homeStay.maxPrice.toLocaleString()}/night
                      </Badge>
                      <Badge variant={homeStay.availability ? 'default' : 'secondary'}>
                        {homeStay.availability ? 'Available' : 'Not Available'}
                      </Badge>
                    </div>
                  </div>
                  {homeStay.passcode && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRemovePasscode(homeStay.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-400">Passcode:</span>
                  <Badge variant="secondary" className="font-mono bg-slate-900 text-slate-100">
                    {homeStay.passcode || 'Not set'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
