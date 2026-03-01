import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Phone } from 'lucide-react';
import { toast } from 'sonner';

interface CustomerInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, phone: string) => void;
}

export default function CustomerInfoModal({ isOpen, onClose, onSubmit }: CustomerInfoModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (!phone.trim()) {
      toast.error('Please enter your phone number');
      return;
    }
    if (phone.trim().length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setIsSubmitting(true);
    onSubmit(name.trim(), phone.trim());
    setIsSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card shadow-saffron-lg">
        <DialogHeader>
          <div className="mx-auto w-16 h-16 rounded-full gradient-saffron-gold flex items-center justify-center mb-4 shadow-saffron">
            <User className="h-8 w-8 text-white" />
          </div>
          <DialogTitle className="text-2xl text-center">Enter Your Details</DialogTitle>
          <DialogDescription className="text-center">
            Please provide your name and phone number to continue with your booking
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="customerName" className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              Full Name *
            </Label>
            <Input
              id="customerName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="Enter your full name"
              className="glass-card"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="customerPhone" className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              Phone Number *
            </Label>
            <Input
              id="customerPhone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="+91 XXXXXXXXXX"
              className="glass-card"
            />
          </div>
          <div className="pt-2">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full gradient-saffron-gold text-white border-0 hover:opacity-90"
              size="lg"
            >
              {isSubmitting ? 'Processing...' : 'Continue'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
