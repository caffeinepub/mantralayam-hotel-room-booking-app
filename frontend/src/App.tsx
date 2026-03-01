import { useEffect, useState } from 'react';
import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { InternetIdentityProvider } from './hooks/useInternetIdentity';
import { LanguageProvider } from './components/LanguageProvider';
import Header from './components/Header';
import Footer from './components/Footer';
import HelpFAQWidget from './components/HelpFAQWidget';
import TimeoutReviewPromptDialog from './components/TimeoutReviewPromptDialog';
import OfflineIndicator from './components/OfflineIndicator';
import RouteTransition from './components/RouteTransition';
import HomePage from './pages/HomePage';
import BrowseRoomsPage from './pages/BrowseRoomsPage';
import RoomDetailPage from './pages/RoomDetailPage';
import BookingPage from './pages/BookingPage';
import BookingConfirmationPage from './pages/BookingConfirmationPage';
import MyBookingsPage from './pages/MyBookingsPage';
import AdminAppPage from './pages/AdminAppPage';
import PartnerLoginPage from './pages/PartnerLoginPage';
import PartnerDashboardPage from './pages/PartnerDashboardPage';
import CustomerLoginPage from './pages/CustomerLoginPage';
import DownloadCenterPage from './pages/DownloadCenterPage';
import { initializeStorage, updateAnalytics, getCustomerSession, clearCustomerSession } from './lib/dataStorage';
import { useInactivityTimeout } from './hooks/useInactivityTimeout';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30000,
    },
  },
});

function RootLayout() {
  const [showTimeoutPrompt, setShowTimeoutPrompt] = useState(false);
  const customerSession = getCustomerSession();
  const isCustomerLoggedIn = !!customerSession;

  const handleInactivityTimeout = () => {
    if (isCustomerLoggedIn) {
      // Clear customer session
      clearCustomerSession();
      // Show review prompt
      setShowTimeoutPrompt(true);
    }
  };

  useInactivityTimeout(handleInactivityTimeout, isCustomerLoggedIn);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <RouteTransition>
          <Outlet />
        </RouteTransition>
      </main>
      <Footer />
      <HelpFAQWidget />
      <OfflineIndicator />
      <TimeoutReviewPromptDialog
        open={showTimeoutPrompt}
        onClose={() => setShowTimeoutPrompt(false)}
      />
    </div>
  );
}

const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const browseRoomsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/browse-rooms',
  component: BrowseRoomsPage,
});

const roomDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/room/$roomId',
  component: RoomDetailPage,
});

const bookingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/booking/$roomId',
  component: BookingPage,
});

const confirmationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/confirmation/$bookingId',
  component: BookingConfirmationPage,
});

const myBookingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/my-bookings',
  component: MyBookingsPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminAppPage,
});

const partnerLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/partner-login',
  component: PartnerLoginPage,
});

const partnerDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/partner-dashboard',
  component: PartnerDashboardPage,
});

const customerLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/customer-login',
  component: CustomerLoginPage,
});

const downloadCenterRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/download-center',
  component: DownloadCenterPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  browseRoomsRoute,
  roomDetailRoute,
  bookingRoute,
  confirmationRoute,
  myBookingsRoute,
  adminRoute,
  partnerLoginRoute,
  partnerDashboardRoute,
  customerLoginRoute,
  downloadCenterRoute,
]);

const router = createRouter({ 
  routeTree,
  defaultPreload: 'intent',
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  useEffect(() => {
    // Complete system reset and initialization with Schema v4.3
    console.log('=== Mantralayam HomeStay Booking System ===');
    console.log('Initializing with Schema v4.3 - Per-room capacity & multilingual support');
    console.log('Features: Help/FAQ, Inactivity timeout, Issue reporting, Language switching');
    initializeStorage();

    // Track visitor once per session
    const hasTrackedVisit = sessionStorage.getItem('visitorTracked');
    if (!hasTrackedVisit) {
      updateAnalytics('visitors');
      sessionStorage.setItem('visitorTracked', 'true');
    }
  }, []);

  return (
    <InternetIdentityProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <LanguageProvider>
            <RouterProvider router={router} />
            <Toaster />
          </LanguageProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </InternetIdentityProvider>
  );
}
