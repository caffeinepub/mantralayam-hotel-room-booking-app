import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, TrendingUp, Calendar, Download, CreditCard, Clock } from 'lucide-react';
import { getBookings, type Booking } from '../../lib/dataStorage';

interface PayoutRecord {
  id: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'processing';
  bookingIds: string[];
}

interface PayoutTrackerProps {
  homeStayId: string;
}

export default function PayoutTracker({ homeStayId }: PayoutTrackerProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [pendingBalance, setPendingBalance] = useState(0);
  const [completedPayouts, setCompletedPayouts] = useState(0);

  useEffect(() => {
    loadPayoutData();
  }, [homeStayId]);

  const loadPayoutData = () => {
    const allBookings = getBookings();
    const homeStayBookings = allBookings.filter(
      b => b.homeStayId === homeStayId && b.status === 'confirmed'
    );
    setBookings(homeStayBookings);

    // Calculate earnings
    const total = homeStayBookings.reduce((sum, b) => sum + b.totalPrice, 0);
    setTotalEarnings(total);

    // Load payout records from localStorage
    const storedPayouts = localStorage.getItem(`mantralayam_payouts_${homeStayId}`);
    if (storedPayouts) {
      const payoutRecords: PayoutRecord[] = JSON.parse(storedPayouts);
      setPayouts(payoutRecords);
      
      const completed = payoutRecords
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0);
      setCompletedPayouts(completed);
      setPendingBalance(total - completed);
    } else {
      setPendingBalance(total);
    }
  };

  const requestPayout = () => {
    if (pendingBalance <= 0) return;

    const newPayout: PayoutRecord = {
      id: `payout-${Date.now()}`,
      amount: pendingBalance,
      date: new Date().toISOString(),
      status: 'pending',
      bookingIds: bookings.map(b => b.id),
    };

    const updatedPayouts = [...payouts, newPayout];
    setPayouts(updatedPayouts);
    localStorage.setItem(`mantralayam_payouts_${homeStayId}`, JSON.stringify(updatedPayouts));
  };

  const getMonthlyEarnings = () => {
    const monthlyData: Record<string, number> = {};
    bookings.forEach(booking => {
      const month = new Date(booking.bookingDate).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
      });
      monthlyData[month] = (monthlyData[month] || 0) + booking.totalPrice;
    });
    return Object.entries(monthlyData).slice(-6);
  };

  const getStatusBadge = (status: PayoutRecord['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className="gradient-saffron-gold text-white border-0">Completed</Badge>;
      case 'processing':
        return <Badge variant="secondary">Processing</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass-card shadow-saffron">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <p className="text-3xl font-bold text-primary">₹{totalEarnings.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 rounded-xl gradient-saffron-gold flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card shadow-saffron">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Balance</p>
                <p className="text-3xl font-bold text-amber-600">₹{pendingBalance.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card shadow-saffron">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed Payouts</p>
                <p className="text-3xl font-bold text-green-600">₹{completedPayouts.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="earnings" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="earnings">Earnings Breakdown</TabsTrigger>
          <TabsTrigger value="payouts">Payout History</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="earnings" className="space-y-4">
          <Card className="glass-card shadow-saffron">
            <CardHeader>
              <CardTitle>Booking-wise Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="p-4 rounded-lg border glass-card">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-semibold">{booking.customerName}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(booking.bookingDate).toLocaleDateString('en-IN')}
                          </p>
                        </div>
                        <p className="text-lg font-bold text-primary">₹{booking.totalPrice}</p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {new Date(booking.checkInDate).toLocaleDateString('en-IN')} - {new Date(booking.checkOutDate).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts" className="space-y-4">
          <Card className="glass-card shadow-saffron">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Payout History</CardTitle>
              <Button
                onClick={requestPayout}
                disabled={pendingBalance <= 0}
                className="gradient-saffron-gold text-white"
              >
                Request Payout
              </Button>
            </CardHeader>
            <CardContent>
              {payouts.length === 0 ? (
                <div className="py-12 text-center">
                  <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No payout history yet</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {payouts.map((payout) => (
                      <div key={payout.id} className="p-4 rounded-lg border glass-card">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-semibold">₹{payout.amount.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(payout.date).toLocaleDateString('en-IN', {
                                dateStyle: 'medium',
                              })}
                            </p>
                          </div>
                          {getStatusBadge(payout.status)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {payout.bookingIds.length} bookings included
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-4">
          <Card className="glass-card shadow-saffron">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Monthly Earnings Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getMonthlyEarnings().map(([month, amount]) => (
                  <div key={month} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{month}</span>
                      <span className="font-bold text-primary">₹{amount.toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full gradient-saffron-gold transition-all duration-500"
                        style={{ width: `${(amount / totalEarnings) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
