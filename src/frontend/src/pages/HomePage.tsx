import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, CreditCard, Shield, MapPin, Building2, Hotel, Search, Sparkles, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { getTempleSpecials, type TempleSpecials } from '../lib/dataStorage';

const LANDMARKS = [
  {
    id: 1,
    name: 'Venkateshwara Swamy Temple',
    caption: 'Sacred pilgrimage site',
    logo: '/assets/generated/venkateshwara-temple-logo.dim_100x100.png',
    mapLink: 'https://maps.app.goo.gl/eGXbznvZDoA8fgcB6',
  },
  {
    id: 2,
    name: 'SRS Mutt',
    caption: 'Historic spiritual center',
    logo: '/assets/generated/srs-mutt-logo.dim_100x100.png',
    mapLink: 'https://maps.app.goo.gl/rmL3GdB8eU5ynXBT6',
  },
  {
    id: 3,
    name: 'Bus Stand',
    caption: 'Main transportation hub',
    logo: '/assets/generated/bus-stand-logo.dim_100x100.png',
    mapLink: 'https://maps.app.goo.gl/WsTE5MySGP5yHTLX6',
  },
  {
    id: 4,
    name: 'River Tungabhadra',
    caption: 'Holy river near SRS Mutt',
    logo: '/assets/generated/tungabhadra-river-logo.dim_100x100.png',
    mapLink: 'https://maps.app.goo.gl/JD7RyxdRTRAZbhSi6',
  },
];

const CAROUSEL_INTERVAL = 5000; // 5 seconds per slide

export default function HomePage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const [templeSpecials, setTempleSpecials] = useState<TempleSpecials>(getTempleSpecials());
  const [currentUpdateIndex, setCurrentUpdateIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');

  const isAuthenticated = !!identity;

  useEffect(() => {
    const handleUpdate = () => {
      const updated = getTempleSpecials();
      setTempleSpecials(updated);
      setCurrentUpdateIndex(0);
    };
    window.addEventListener('templeSpecialsUpdated', handleUpdate);
    return () => window.removeEventListener('templeSpecialsUpdated', handleUpdate);
  }, []);

  // Auto-rotate carousel with smooth fade and slide animations
  useEffect(() => {
    if (templeSpecials.updates.length <= 1) return;

    const interval = setInterval(() => {
      setSlideDirection('right');
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentUpdateIndex((prev) => (prev + 1) % templeSpecials.updates.length);
        setTimeout(() => {
          setIsTransitioning(false);
        }, 50);
      }, 400);
    }, CAROUSEL_INTERVAL);

    return () => clearInterval(interval);
  }, [templeSpecials.updates.length]);

  const openGoogleMaps = (mapLink: string) => {
    window.open(mapLink, '_blank');
  };

  const nextUpdate = () => {
    if (templeSpecials.updates.length > 0) {
      setSlideDirection('right');
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentUpdateIndex((prev) => (prev + 1) % templeSpecials.updates.length);
        setTimeout(() => {
          setIsTransitioning(false);
        }, 50);
      }, 400);
    }
  };

  const prevUpdate = () => {
    if (templeSpecials.updates.length > 0) {
      setSlideDirection('left');
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentUpdateIndex((prev) => (prev - 1 + templeSpecials.updates.length) % templeSpecials.updates.length);
        setTimeout(() => {
          setIsTransitioning(false);
        }, 50);
      }, 400);
    }
  };

  const goToUpdate = (index: number) => {
    if (index === currentUpdateIndex) return;
    setSlideDirection(index > currentUpdateIndex ? 'right' : 'left');
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentUpdateIndex(index);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, 400);
  };

  const currentUpdate = templeSpecials.updates[currentUpdateIndex];

  return (
    <div className="flex flex-col animate-fade-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 gradient-saffron-gold-radial"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM4ODg4ODgiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00em0wIDI0YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00ek0xMiAxNmMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHptMCAyNGMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
        <div className="container relative">
          <div className="mx-auto max-w-4xl text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-4 shadow-saffron">
              <Sparkles className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium">Premium Hospitality Experience</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent bg-200% animate-gradient">
                Mantralayam Hotels
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Experience comfort and hospitality in the heart of Mantralayam. Book your perfect stay with us today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Button 
                size="lg" 
                onClick={() => navigate({ to: '/browse-rooms' })} 
                className="gap-2 gradient-saffron-gold text-white border-0 hover:opacity-90 transition-smooth shadow-saffron-lg text-lg px-8 py-6 hover-lift"
              >
                <Search className="h-5 w-5" />
                Search Rooms
              </Button>
              {isAuthenticated && (
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={() => navigate({ to: '/my-bookings' })} 
                  className="gap-2 glass-card hover:bg-primary/10 transition-smooth text-lg px-8 py-6 hover-lift shadow-saffron"
                >
                  <Calendar className="h-5 w-5" />
                  My Bookings
                </Button>
              )}
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => navigate({ to: '/partner-login' })} 
                className="gap-2 glass-card hover:bg-accent/10 transition-smooth text-lg px-8 py-6 hover-lift shadow-saffron"
              >
                <Building2 className="h-5 w-5" />
                Partner Login
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Landmarks Section */}
      <section className="py-16 md:py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background"></div>
        <div className="container relative">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Nearby Landmarks
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Explore the sacred and important places near Mantralayam
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {LANDMARKS.map((landmark) => (
              <div 
                key={landmark.id} 
                className="flex flex-col items-center text-center space-y-4 group"
              >
                <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden glass-card border-2 border-border group-hover:border-primary transition-smooth hover-lift shadow-saffron">
                  <div className="absolute inset-0 gradient-saffron-gold opacity-0 group-hover:opacity-20 transition-smooth"></div>
                  <img
                    src={landmark.logo}
                    alt={`${landmark.name} logo`}
                    title={landmark.name}
                    className="w-full h-full object-cover relative z-10"
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-base md:text-lg line-clamp-2">{landmark.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {landmark.caption}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sm gap-2 h-9 hover:bg-primary/10 transition-smooth"
                  onClick={() => openGoogleMaps(landmark.mapLink)}
                  title={`View ${landmark.name} on Google Maps`}
                >
                  <MapPin className="h-4 w-4" />
                  View on Map
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Temple Specials Section - Enhanced with Smooth Fade and Slide Animations */}
      <section className="w-full py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 gradient-saffron-gold"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMTZjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6bTAgMjRjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6TTEyIDE2YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00em0wIDI0YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
        <div className="container relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-4 shadow-saffron bg-white/10 backdrop-blur-sm">
                <Sparkles className="h-4 w-4 text-white" />
                <span className="text-sm font-medium text-white">Daily Temple Updates</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg mb-4">
                Temple Specials
              </h2>
              <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed drop-shadow">
                Experience divine blessings and special events at Sri Raghavendra Swamy Mutt
              </p>
            </div>

            {/* Enhanced Carousel with Smooth Fade and Slide Animations */}
            {templeSpecials.updates.length > 0 && currentUpdate && (
              <div className="relative group mb-8">
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-saffron-lg border-4 border-white/20">
                  <div 
                    className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                      isTransitioning 
                        ? slideDirection === 'right'
                          ? 'opacity-0 translate-x-full scale-95'
                          : 'opacity-0 -translate-x-full scale-95'
                        : 'opacity-100 translate-x-0 scale-100'
                    }`}
                  >
                    <img
                      src={currentUpdate.imageLink}
                      alt="Temple special event"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/1280x720?text=Error+Loading';
                      }}
                    />
                    
                    {/* Bottom Overlay with Glassmorphic Text and Slide-in Animation */}
                    <div 
                      className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-6 md:p-8 transition-all duration-700 ease-out ${
                        isTransitioning 
                          ? 'opacity-0 translate-y-8'
                          : 'opacity-100 translate-y-0'
                      }`}
                    >
                      <div className="glass-card bg-white/10 backdrop-blur-md border-white/20 rounded-xl p-4 md:p-6 shadow-saffron-lg">
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <Sparkles className="h-5 w-5 text-accent flex-shrink-0 mt-1" />
                            <div className="flex-1">
                              <p className="text-white text-base md:text-lg leading-relaxed font-medium">
                                {currentUpdate.description}
                              </p>
                            </div>
                          </div>
                          
                          {currentUpdate.time && (
                            <div className="flex items-center gap-2 text-white/90 text-sm md:text-base">
                              <Clock className="h-4 w-4 text-accent" />
                              <span className="font-medium">{currentUpdate.time}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Arrows */}
                  {templeSpecials.updates.length > 1 && (
                    <>
                      <button
                        onClick={prevUpdate}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110"
                        aria-label="Previous update"
                      >
                        <ChevronLeft className="h-6 w-6 text-primary" />
                      </button>
                      <button
                        onClick={nextUpdate}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110"
                        aria-label="Next update"
                      >
                        <ChevronRight className="h-6 w-6 text-primary" />
                      </button>
                      
                      {/* Carousel Indicators */}
                      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {templeSpecials.updates.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => goToUpdate(index)}
                            className={`h-2 rounded-full transition-all duration-500 ${
                              index === currentUpdateIndex
                                ? 'bg-white w-8 shadow-lg'
                                : 'bg-white/50 hover:bg-white/75 w-2'
                            }`}
                            aria-label={`Go to update ${index + 1}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Update Counter */}
            {templeSpecials.updates.length > 1 && (
              <p className="text-center text-sm text-white/70 mb-4">
                Update {currentUpdateIndex + 1} of {templeSpecials.updates.length}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 gradient-saffron-gold-radial opacity-50"></div>
        <div className="container relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Why Choose Us
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              We provide the best booking experience with secure payments and excellent service
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="glass-card border-2 hover:border-primary/50 transition-smooth hover-lift shadow-saffron">
              <CardContent className="pt-8 pb-6 text-center space-y-4">
                <div className="mx-auto w-16 h-16 rounded-2xl gradient-saffron-gold flex items-center justify-center shadow-saffron">
                  <Hotel className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-xl">Quality Rooms</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Comfortable accommodations with modern amenities and excellent service
                </p>
              </CardContent>
            </Card>
            <Card className="glass-card border-2 hover:border-primary/50 transition-smooth hover-lift shadow-saffron">
              <CardContent className="pt-8 pb-6 text-center space-y-4">
                <div className="mx-auto w-16 h-16 rounded-2xl gradient-saffron-gold flex items-center justify-center shadow-saffron">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-xl">Flexible Booking</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Choose your check-in and check-out dates with instant confirmation
                </p>
              </CardContent>
            </Card>
            <Card className="glass-card border-2 hover:border-primary/50 transition-smooth hover-lift shadow-saffron">
              <CardContent className="pt-8 pb-6 text-center space-y-4">
                <div className="mx-auto w-16 h-16 rounded-2xl gradient-saffron-gold flex items-center justify-center shadow-saffron">
                  <CreditCard className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-xl">Secure Payments</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Pay safely with Stripe or UPI with encrypted transactions
                </p>
              </CardContent>
            </Card>
            <Card className="glass-card border-2 hover:border-primary/50 transition-smooth hover-lift shadow-saffron">
              <CardContent className="pt-8 pb-6 text-center space-y-4">
                <div className="mx-auto w-16 h-16 rounded-2xl gradient-saffron-gold flex items-center justify-center shadow-saffron">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-xl">Trusted Service</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  24/7 support and guaranteed quality accommodations
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 gradient-saffron-gold"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMTZjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6bTAgMjRjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6TTEyIDE2YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00em0wIDI0YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
        <div className="container relative text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">Ready to Book Your Stay?</h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed drop-shadow">
            Start your journey with us today and experience the best hospitality in Mantralayam
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              size="lg"
              variant="secondary"
              onClick={() => navigate({ to: '/browse-rooms' })}
              className="gap-2 bg-white text-primary hover:bg-white/90 transition-smooth text-lg px-8 py-6 hover-lift shadow-saffron-lg"
            >
              <Search className="h-5 w-5" />
              Search Rooms
            </Button>
            {isAuthenticated && (
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate({ to: '/my-bookings' })}
                className="gap-2 bg-white/10 hover:bg-white/20 border-white/30 text-white transition-smooth text-lg px-8 py-6 hover-lift backdrop-blur-sm"
              >
                <Calendar className="h-5 w-5" />
                My Bookings
              </Button>
            )}
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate({ to: '/partner-login' })}
              className="gap-2 bg-white/10 hover:bg-white/20 border-white/30 text-white transition-smooth text-lg px-8 py-6 hover-lift backdrop-blur-sm"
            >
              <Building2 className="h-5 w-5" />
              List Your Property
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
