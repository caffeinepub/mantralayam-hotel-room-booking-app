import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { FileText, Download, Calendar as CalendarIcon, Filter } from 'lucide-react';
import { getBookings, getHomeStays, getHotels, getCustomerSession, type Booking, type HomeStay } from '../../lib/dataStorage';
import { format } from 'date-fns';

type ReportType = 'all-customers' | 'date-range' | 'individual-customer' | 'properties';

export default function ReportsExport() {
  const [reportType, setReportType] = useState<ReportType>('all-customers');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [customerName, setCustomerName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDFContent = (data: any, type: ReportType): string => {
    const timestamp = new Date().toLocaleString('en-IN');
    let content = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Mantralayam HomeStay Report</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 40px;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px solid #FF9933;
          }
          .logo {
            width: 80px;
            height: 80px;
            margin: 0 auto 20px;
            background: linear-gradient(135deg, #FF9933, #DAA520);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 32px;
            font-weight: bold;
          }
          h1 {
            color: #FF9933;
            margin: 0;
            font-size: 28px;
          }
          .subtitle {
            color: #666;
            margin-top: 10px;
          }
          .info-box {
            background: #FFF8DC;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #FF9933;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          th {
            background: linear-gradient(135deg, #FF9933, #DAA520);
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: 600;
          }
          td {
            padding: 12px;
            border-bottom: 1px solid #ddd;
          }
          tr:hover {
            background: #FFF8DC;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #FF9933;
            text-align: center;
            color: #666;
            font-size: 12px;
          }
          .badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
          }
          .badge-confirmed {
            background: #4CAF50;
            color: white;
          }
          .badge-pending {
            background: #FFC107;
            color: #333;
          }
          .badge-cancelled {
            background: #F44336;
            color: white;
          }
          @media print {
            body { margin: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">🏛️</div>
          <h1>Mantralayam HomeStay Booking System</h1>
          <p class="subtitle">Professional Report - Generated on ${timestamp}</p>
        </div>
    `;

    if (type === 'all-customers') {
      const bookings = getBookings();
      const uniqueCustomers = Array.from(new Set(bookings.map(b => b.customerName)));
      
      content += `
        <div class="info-box">
          <h2>All Customers Report</h2>
          <p><strong>Total Customers:</strong> ${uniqueCustomers.length}</p>
          <p><strong>Total Bookings:</strong> ${bookings.length}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Phone Number</th>
              <th>Total Bookings</th>
              <th>Total Spent</th>
            </tr>
          </thead>
          <tbody>
      `;
      
      uniqueCustomers.forEach(customerName => {
        const customerBookings = bookings.filter(b => b.customerName === customerName);
        const totalSpent = customerBookings.reduce((sum, b) => sum + b.totalPrice, 0);
        const phone = customerBookings[0]?.customerPhone || 'N/A';
        
        content += `
          <tr>
            <td>${customerName}</td>
            <td>${phone}</td>
            <td>${customerBookings.length}</td>
            <td>₹${totalSpent.toLocaleString()}</td>
          </tr>
        `;
      });
      
      content += `
          </tbody>
        </table>
      `;
    } else if (type === 'date-range' && startDate && endDate) {
      const bookings = getBookings().filter(b => {
        const bookingDate = new Date(b.bookingDate);
        return bookingDate >= startDate && bookingDate <= endDate;
      });
      
      content += `
        <div class="info-box">
          <h2>Date Range Report</h2>
          <p><strong>Period:</strong> ${format(startDate, 'PPP')} to ${format(endDate, 'PPP')}</p>
          <p><strong>Total Bookings:</strong> ${bookings.length}</p>
          <p><strong>Total Revenue:</strong> ₹${bookings.reduce((sum, b) => sum + b.totalPrice, 0).toLocaleString()}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Customer</th>
              <th>HomeStay</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
      `;
      
      bookings.forEach(booking => {
        const statusClass = booking.status === 'confirmed' ? 'badge-confirmed' : 
                           booking.status === 'pending' ? 'badge-pending' : 'badge-cancelled';
        content += `
          <tr>
            <td>${booking.id}</td>
            <td>${booking.customerName}<br/><small>${booking.customerPhone}</small></td>
            <td>${booking.homeStayName}</td>
            <td>${new Date(booking.checkInDate).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</td>
            <td>${new Date(booking.checkOutDate).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</td>
            <td>₹${booking.totalPrice.toLocaleString()}</td>
            <td><span class="badge ${statusClass}">${booking.status}</span></td>
          </tr>
        `;
      });
      
      content += `
          </tbody>
        </table>
      `;
    } else if (type === 'individual-customer' && customerName) {
      const bookings = getBookings().filter(b => 
        b.customerName.toLowerCase().includes(customerName.toLowerCase())
      );
      
      if (bookings.length > 0) {
        const totalSpent = bookings.reduce((sum, b) => sum + b.totalPrice, 0);
        
        content += `
          <div class="info-box">
            <h2>Customer Details Report</h2>
            <p><strong>Customer Name:</strong> ${bookings[0].customerName}</p>
            <p><strong>Phone:</strong> ${bookings[0].customerPhone}</p>
            <p><strong>Total Bookings:</strong> ${bookings.length}</p>
            <p><strong>Total Spent:</strong> ₹${totalSpent.toLocaleString()}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Booking Date</th>
                <th>HomeStay</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Guests</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
        `;
        
        bookings.forEach(booking => {
          const statusClass = booking.status === 'confirmed' ? 'badge-confirmed' : 
                             booking.status === 'pending' ? 'badge-pending' : 'badge-cancelled';
          content += `
            <tr>
              <td>${new Date(booking.bookingDate).toLocaleDateString('en-IN')}</td>
              <td>${booking.homeStayName}</td>
              <td>${new Date(booking.checkInDate).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</td>
              <td>${new Date(booking.checkOutDate).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</td>
              <td>${booking.guests}</td>
              <td>₹${booking.totalPrice.toLocaleString()}</td>
              <td><span class="badge ${statusClass}">${booking.status}</span></td>
            </tr>
          `;
        });
        
        content += `
            </tbody>
          </table>
        `;
      }
    } else if (type === 'properties') {
      const homeStays = getHomeStays();
      const hotels = getHotels();
      const bookings = getBookings();
      
      content += `
        <div class="info-box">
          <h2>Properties Report</h2>
          <p><strong>Total Hotels:</strong> ${hotels.length}</p>
          <p><strong>Total HomeStays:</strong> ${homeStays.length}</p>
        </div>
        <h3 style="color: #FF9933; margin-top: 30px;">HomeStays Overview</h3>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Partner</th>
              <th>Phone</th>
              <th>Rooms</th>
              <th>Distance (km)</th>
              <th>Total Bookings</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
      `;
      
      homeStays.forEach(hs => {
        const hsBookings = bookings.filter(b => b.homeStayId === hs.id && b.status === 'confirmed');
        const revenue = hsBookings.reduce((sum, b) => sum + b.totalPrice, 0);
        
        content += `
          <tr>
            <td>${hs.name}</td>
            <td>${hs.partnerName}</td>
            <td>${hs.partnerPhoneNumber}</td>
            <td>${hs.roomCount}</td>
            <td>${hs.distanceFromTemple || 'N/A'}</td>
            <td>${hsBookings.length}</td>
            <td>₹${revenue.toLocaleString()}</td>
          </tr>
        `;
      });
      
      content += `
          </tbody>
        </table>
      `;
    }

    content += `
        <div class="footer">
          <p>© 2025 Mantralayam HomeStay Booking System. All rights reserved.</p>
          <p>This is a computer-generated report. For queries, contact admin.</p>
        </div>
      </body>
      </html>
    `;

    return content;
  };

  const handleGenerateReport = () => {
    setIsGenerating(true);

    setTimeout(() => {
      try {
        const htmlContent = generatePDFContent({}, reportType);
        
        // Create a blob and download
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mantralayam-report-${reportType}-${Date.now()}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast.success('Report generated successfully! Opening in new window...');
        
        // Open in new window for printing
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(htmlContent);
          printWindow.document.close();
        }
      } catch (error) {
        console.error('Report generation error:', error);
        toast.error('Failed to generate report');
      } finally {
        setIsGenerating(false);
      }
    }, 1000);
  };

  return (
    <Card className="glass-card bg-slate-900/60 border-slate-800 shadow-saffron-lg">
      <CardHeader className="border-b border-slate-800 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-saffron-gold flex items-center justify-center shadow-saffron">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl text-slate-100">Reports & Exports</CardTitle>
            <p className="text-sm text-slate-400">Generate professional PDF reports</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-slate-300">Report Type</Label>
            <Select value={reportType} onValueChange={(value) => setReportType(value as ReportType)}>
              <SelectTrigger className="glass-card bg-slate-800 border-slate-700 text-slate-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-customers">All Customers</SelectItem>
                <SelectItem value="date-range">Date Range Bookings</SelectItem>
                <SelectItem value="individual-customer">Individual Customer</SelectItem>
                <SelectItem value="properties">Hotels & HomeStays</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {reportType === 'date-range' && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-slate-300">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left glass-card bg-slate-800 border-slate-700 text-slate-100">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={startDate} onSelect={setStartDate} />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left glass-card bg-slate-800 border-slate-700 text-slate-100">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={endDate} onSelect={setEndDate} />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}

          {reportType === 'individual-customer' && (
            <div className="space-y-2">
              <Label className="text-slate-300">Customer Name</Label>
              <Input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter customer name"
                className="glass-card bg-slate-800 border-slate-700 text-slate-100"
              />
            </div>
          )}

          <Button
            onClick={handleGenerateReport}
            disabled={isGenerating || (reportType === 'date-range' && (!startDate || !endDate)) || (reportType === 'individual-customer' && !customerName)}
            className="w-full gradient-saffron-gold text-white gap-2"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Filter className="h-5 w-5 animate-spin" />
                Generating Report...
              </>
            ) : (
              <>
                <Download className="h-5 w-5" />
                Generate & Download Report
              </>
            )}
          </Button>
        </div>

        <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
          <h4 className="text-sm font-semibold text-slate-100 mb-2">Report Features:</h4>
          <ul className="text-sm text-slate-400 space-y-1">
            <li>• Professional PDF-ready HTML format</li>
            <li>• Saffron-gold branded design</li>
            <li>• Print-optimized layout</li>
            <li>• Comprehensive data tables</li>
            <li>• Automatic calculations and summaries</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
