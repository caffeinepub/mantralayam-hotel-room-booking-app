import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Key, ArrowRight, Phone } from 'lucide-react';
import { getHomeStays, updateAnalytics } from '../lib/dataStorage';

export default function PartnerLoginPage() {
  const navigate = useNavigate();
  const [passcode, setPasscode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleLogin = async () => {
    const trimmedPasscode = passcode.trim();
    
    if (!trimmedPasscode) {
      toast.error('Please enter a passcode');
      return;
    }

    setIsProcessing(true);

    try {
      // Always read fresh homestay data at submit time to catch any admin updates
      const homeStays = getHomeStays();
      
      // Normalize passcode comparison - trim and compare as strings
      const homeStay = homeStays.find(h => {
        const homeStayPasscode = h.passcode?.trim() || '';
        return homeStayPasscode === trimmedPasscode && homeStayPasscode !== '';
      });

      if (homeStay) {
        // Store partner auth using consistent identifiers
        localStorage.setItem('partnerAuthenticated', 'true');
        localStorage.setItem('partnerRoomId', homeStay.id);
        localStorage.setItem('partnerId', homeStay.partnerId || homeStay.id);
        localStorage.setItem('partnerPasscode', trimmedPasscode);
        
        // Dispatch auth change event
        window.dispatchEvent(new Event('partnerAuthChanged'));
        
        // Track analytics
        updateAnalytics('partnerEdits');
        
        toast.success('Login successful!');
        navigate({ to: '/partner-dashboard' });
      } else {
        toast.error('Invalid passcode. Please check and try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container py-16 max-w-md animate-fade-in">
      <Card className="glass-card shadow-saffron-lg">
        <CardHeader>
          <div className="mx-auto w-16 h-16 rounded-full gradient-saffron-gold flex items-center justify-center mb-4 shadow-saffron">
            <Key className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl text-center">Partner Login</CardTitle>
          <p className="text-center text-muted-foreground">
            Enter your passcode to manage your homestay
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="passcode">Passcode</Label>
            <Input
              id="passcode"
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="Enter your passcode"
              className="glass-card"
              autoFocus
            />
          </div>
          <Button
            onClick={handleLogin}
            disabled={isProcessing}
            className="w-full gradient-saffron-gold text-white border-0 hover:opacity-90 gap-2"
            size="lg"
          >
            {isProcessing ? 'Logging in...' : 'Login'}
            <ArrowRight className="h-5 w-5" />
          </Button>
          
          {/* Admin Contact Section */}
          <div className="pt-4 border-t space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span className="font-medium">Need help? Contact Admin:</span>
            </div>
            <div className="flex flex-col gap-2">
              <a
                href="tel:6281019435"
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm font-medium"
              >
                <Phone className="h-4 w-4 text-primary" />
                <span>6281019435</span>
              </a>
              <a
                href="tel:9985837477"
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm font-medium"
              >
                <Phone className="h-4 w-4 text-primary" />
                <span>9985837477</span>
              </a>
            </div>
            <p className="text-xs text-center text-muted-foreground mt-2">
              Tap to call for passcode assistance
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
