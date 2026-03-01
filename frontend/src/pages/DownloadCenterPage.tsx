import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileCode, Folder, Package, Terminal, CheckCircle2 } from 'lucide-react';

export default function DownloadCenterPage() {
  return (
    <div className="container py-12 animate-fade-in">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-4 shadow-saffron">
            <Download className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium">Project Resources</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Download Center
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Access the complete Mantralayam Room Booking System source code and documentation
          </p>
        </div>

        {/* Project Overview */}
        <Card className="glass-card border-2 shadow-saffron">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Project Overview
            </CardTitle>
            <CardDescription>
              Complete frontend-only booking system with localStorage persistence
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Technology Stack</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• React 19 + TypeScript</li>
                  <li>• TanStack Router & Query</li>
                  <li>• Tailwind CSS + shadcn/ui</li>
                  <li>• Internet Identity Auth</li>
                  <li>• LocalStorage Data Layer</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Key Features</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Customer Booking Flow</li>
                  <li>• Admin Management Portal</li>
                  <li>• Partner Dashboard</li>
                  <li>• Analytics & Notifications</li>
                  <li>• Saffron-Gold Theme</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Project Structure */}
        <Card className="glass-card border-2 shadow-saffron">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Folder className="h-5 w-5 text-primary" />
              Project Structure
            </CardTitle>
            <CardDescription>
              Organized file structure for easy navigation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm space-y-1">
              <div>mantralayam-booking/</div>
              <div className="ml-4">├── frontend/</div>
              <div className="ml-8">├── src/</div>
              <div className="ml-12">├── components/</div>
              <div className="ml-12">├── pages/</div>
              <div className="ml-12">├── hooks/</div>
              <div className="ml-12">├── lib/</div>
              <div className="ml-12">└── index.css</div>
              <div className="ml-8">├── package.json</div>
              <div className="ml-8">└── tailwind.config.js</div>
              <div className="ml-4">└── backend/</div>
              <div className="ml-8">└── main.mo</div>
            </div>
          </CardContent>
        </Card>

        {/* Setup Instructions */}
        <Card className="glass-card border-2 shadow-saffron">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="h-5 w-5 text-primary" />
              Setup Instructions
            </CardTitle>
            <CardDescription>
              Step-by-step guide to run the project locally
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full gradient-saffron-gold flex items-center justify-center text-white font-bold text-sm">
                  1
                </div>
                <div className="flex-1 space-y-2">
                  <h4 className="font-semibold">Install Dependencies</h4>
                  <div className="bg-muted/50 rounded-lg p-3 font-mono text-sm">
                    npm install
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full gradient-saffron-gold flex items-center justify-center text-white font-bold text-sm">
                  2
                </div>
                <div className="flex-1 space-y-2">
                  <h4 className="font-semibold">Start Development Server</h4>
                  <div className="bg-muted/50 rounded-lg p-3 font-mono text-sm">
                    npm run start
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full gradient-saffron-gold flex items-center justify-center text-white font-bold text-sm">
                  3
                </div>
                <div className="flex-1 space-y-2">
                  <h4 className="font-semibold">Access Application</h4>
                  <p className="text-sm text-muted-foreground">
                    Open browser to <code className="bg-muted px-2 py-1 rounded">http://localhost:3000</code>
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full gradient-saffron-gold flex items-center justify-center text-white font-bold text-sm">
                  4
                </div>
                <div className="flex-1 space-y-2">
                  <h4 className="font-semibold">Admin Access</h4>
                  <p className="text-sm text-muted-foreground">
                    Use password: <code className="bg-muted px-2 py-1 rounded font-semibold">VBGRA@1733s</code>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features Checklist */}
        <Card className="glass-card border-2 shadow-saffron">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Implemented Features
            </CardTitle>
            <CardDescription>
              Complete feature set ready to use
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm mb-3">Customer Features</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>Browse & Search Rooms</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>Room Detail View</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>Booking Flow with OTP</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>My Bookings Management</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>UPI Payment Simulation</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm mb-3">Admin Features</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>Dashboard with Analytics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>Hotel & Room Management</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>Booking Management</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>Partner Management</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>Notifications & SMS Logs</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Download Button */}
        <div className="text-center pt-4">
          <Button
            size="lg"
            className="gradient-saffron-gold text-white border-0 hover:opacity-90 gap-2 shadow-saffron-lg px-8 py-6 text-lg"
            onClick={() => window.alert('Source code is available in your project directory')}
          >
            <FileCode className="h-5 w-5" />
            View Source Code
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            All source files are available in your project directory
          </p>
        </div>
      </div>
    </div>
  );
}
