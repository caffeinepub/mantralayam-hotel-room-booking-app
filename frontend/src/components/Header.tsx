import { useState, useEffect } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Menu, X, Hotel, LogOut, Moon, Sun, Languages } from 'lucide-react';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getCustomerSession, clearCustomerSession } from '../lib/dataStorage';
import { useTranslation } from './LanguageProvider';
import { LANGUAGES, Language } from '../lib/i18n';

export default function Header() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPartnerAuth, setIsPartnerAuth] = useState(false);
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [customerSession, setCustomerSession] = useState<{ name: string; phone: string } | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      setIsPartnerAuth(localStorage.getItem('partnerAuthenticated') === 'true');
      setIsAdminAuth(localStorage.getItem('adminAuthenticated') === 'true');
      const session = getCustomerSession();
      setCustomerSession(session ? { name: session.name, phone: session.phone } : null);
    };

    checkAuth();
    window.addEventListener('partnerAuthChanged', checkAuth);
    window.addEventListener('storage', checkAuth);

    const interval = setInterval(checkAuth, 1000);

    return () => {
      window.removeEventListener('partnerAuthChanged', checkAuth);
      window.removeEventListener('storage', checkAuth);
      clearInterval(interval);
    };
  }, []);

  const handleCustomerLogout = () => {
    clearCustomerSession();
    setCustomerSession(null);
    toast.success(t('nav.logout'));
    navigate({ to: '/' });
  };

  const handlePartnerLogout = () => {
    localStorage.removeItem('partnerAuthenticated');
    localStorage.removeItem('partnerRoomId');
    localStorage.removeItem('partnerPasscode');
    window.dispatchEvent(new Event('partnerAuthChanged'));
    toast.success(t('nav.logout'));
    navigate({ to: '/partner-login' });
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    setIsAdminAuth(false);
    toast.success(t('nav.logout'));
    navigate({ to: '/admin' });
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b glass-card backdrop-blur-xl shadow-saffron">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-full gradient-saffron-gold flex items-center justify-center shadow-saffron group-hover:scale-110 transition-transform">
            <Hotel className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Mantralayam Rooms
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            {t('nav.home')}
          </Link>
          <Link
            to="/browse-rooms"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            {t('nav.browseRooms')}
          </Link>
          {customerSession && (
            <Link
              to="/my-bookings"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              {t('nav.myBookings')}
            </Link>
          )}
          <Link
            to="/admin"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            {t('nav.admin')}
          </Link>
          <Link
            to="/partner-login"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            {t('nav.partner')}
          </Link>
        </nav>

        {/* Auth Buttons, Language & Theme Toggle */}
        <div className="hidden md:flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
              >
                <Languages className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {Object.entries(LANGUAGES).map(([code, name]) => (
                <DropdownMenuItem
                  key={code}
                  onClick={() => setLanguage(code as Language)}
                  className={language === code ? 'bg-primary/10' : ''}
                >
                  {name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            onClick={toggleTheme}
            variant="ghost"
            size="icon"
            className="rounded-full"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
          {isAdminAuth && (
            <Button
              onClick={handleAdminLogout}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              {t('nav.logout')}
            </Button>
          )}
          {isPartnerAuth && (
            <Button
              onClick={handlePartnerLogout}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              {t('nav.logout')}
            </Button>
          )}
          {customerSession ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {customerSession.name}
              </span>
              <Button
                onClick={handleCustomerLogout}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                {t('nav.logout')}
              </Button>
            </div>
          ) : null}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t glass-card">
          <nav className="container py-4 flex flex-col gap-4">
            <Link
              to="/"
              className="text-sm font-medium hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('nav.home')}
            </Link>
            <Link
              to="/browse-rooms"
              className="text-sm font-medium hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('nav.browseRooms')}
            </Link>
            {customerSession && (
              <Link
                to="/my-bookings"
                className="text-sm font-medium hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('nav.myBookings')}
              </Link>
            )}
            <Link
              to="/admin"
              className="text-sm font-medium hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('nav.admin')}
            </Link>
            <Link
              to="/partner-login"
              className="text-sm font-medium hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('nav.partner')}
            </Link>
            <div className="pt-4 border-t space-y-2">
              <div className="text-sm font-medium mb-2">Language / భాష / ಭಾಷೆ</div>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(LANGUAGES).map(([code, name]) => (
                  <Button
                    key={code}
                    onClick={() => {
                      setLanguage(code as Language);
                      setIsMenuOpen(false);
                    }}
                    variant={language === code ? 'default' : 'outline'}
                    size="sm"
                    className="w-full"
                  >
                    {name}
                  </Button>
                ))}
              </div>
              <Button
                onClick={() => {
                  toggleTheme();
                  setIsMenuOpen(false);
                }}
                variant="outline"
                size="sm"
                className="w-full gap-2"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="h-4 w-4" />
                    Light Mode
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4" />
                    Dark Mode
                  </>
                )}
              </Button>
              {isAdminAuth && (
                <Button
                  onClick={() => {
                    handleAdminLogout();
                    setIsMenuOpen(false);
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  {t('nav.logout')}
                </Button>
              )}
              {isPartnerAuth && (
                <Button
                  onClick={() => {
                    handlePartnerLogout();
                    setIsMenuOpen(false);
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  {t('nav.logout')}
                </Button>
              )}
              {customerSession && (
                <>
                  <div className="text-sm text-center text-muted-foreground">
                    {customerSession.name}
                  </div>
                  <Button
                    onClick={() => {
                      handleCustomerLogout();
                      setIsMenuOpen(false);
                    }}
                    variant="outline"
                    size="sm"
                    className="w-full gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    {t('nav.logout')}
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
