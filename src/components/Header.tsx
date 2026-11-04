import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, User, ChevronDown, LogOut, LayoutDashboard, History } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { AuthModal } from '@/components/AuthModal';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const Header = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['common', 'landing']);

  const navItems = [
    { label: t('common:navigation.home'), href: '#home' },
    { label: t('common:navigation.studio'), href: '#packages' },
    { label: t('common:navigation.photobox'), href: '#photobox' },
    { label: t('common:navigation.gallery'), href: '#gallery' },
    { label: t('common:navigation.testimonials'), href: '#testimonials' },
    { label: t('common:navigation.faq'), href: '#faq' },
    { label: t('common:navigation.contact'), href: '#contact' },
  ];
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const { user, profile, loading, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    // Check if we are on dashboard page
    if (window.location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.querySelector(href);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsMobileMenuOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getDisplayName = () => {
    if (profile?.full_name) {
      const firstName = profile.full_name.split(' ')[0];
      return firstName.length > 10 ? firstName.substring(0, 10) + '...' : firstName;
    }
    return t('common:user.user');
  };

  const goToDashboard = () => {
    navigate('/dashboard');
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
          ? 'bg-card/95 backdrop-blur-md shadow-soft py-3'
          : 'bg-transparent py-5'
          }`}
      >
        <div className="container-wide flex items-center justify-between">
          {/* Logo */}
          {/* Logo */}
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('#home');
            }}
            className="flex items-center gap-3 group"
          >
            <img
              src="/images/logoMorain.webp"
              alt="Morain Studio Logo"
              className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105 brightness-[0.8]"
              loading="eager"
              fetchPriority="high"
            />
            <span className="font-display text-2xl font-semibold tracking-tight text-foreground leading-none">
              Morain
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(item.href);
                }}
                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 relative group"
              >
                {item.label}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-3/4" />
              </a>
            ))}
          </nav>

          {/* Auth & CTA */}
          <div className="hidden lg:flex items-center gap-3">
            {loading ? (
              <div className="w-24 h-10 bg-muted animate-pulse rounded-lg" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-full bg-[#5F6F52]/20 flex items-center justify-center transition-colors duration-200 group-hover:bg-[#5F6F52]/20">
                      <User className="w-4 h-4 text-black/60 transition-colors duration-200 group-hover:text-black/80" />
                    </div>
                    <span className="text-sm text-black/60 transition-colors duration-200 group-hover:text-black/80">{t('common:user.hi')}, {getDisplayName()}</span>
                    <ChevronDown className="w-4 h-4 text-black/60 transition-colors duration-200 group-hover:text-black/80" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {profile?.role === 'admin' ? (
                    <DropdownMenuItem onClick={() => navigate('/admin')} className="text-primary focus:text-white cursor-pointer">
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      <span className="font-semibold">{t('common:user.adminDashboard')}</span>
                    </DropdownMenuItem>
                  ) : (
                    <>
                      <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        {t('common:user.dashboard')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/dashboard/riwayat')}>
                        <History className="w-4 h-4 mr-2" />
                        {t('dashboard:sidebar.bookingHistory')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/dashboard/profil')}>
                        <User className="w-4 h-4 mr-2" />
                        {t('common:user.account')}
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="text-destructive hover:bg-destructive/10 focus:bg-destructive/10 transition-colors duration-200"
                  >
                    <LogOut className="w-4 h-4 mr-2 text-destructive" />
                    <span className="text-destructive">{t('common:buttons.logout')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="ghost"
                onClick={() => setShowAuthModal(true)}
              >
                {t('common:buttons.loginRegister')}
              </Button>
            )}
            <LanguageSwitcher />
            <Button
              variant="sage"
              onClick={() => scrollToSection('#packages')}
            >
              {t('common:buttons.bookNow')}
            </Button>
          </div>

          {/* Mobile Actions */}
          <div className="lg:hidden flex items-center gap-2">
            <LanguageSwitcher />
            <button
              className="p-2 text-foreground rounded-lg hover:bg-muted transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden absolute top-full left-0 right-0 bg-white shadow-md border-b border-gray-100 transition-all duration-300 ${isMobileMenuOpen
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-4 pointer-events-none'
            }`}
        >
          <nav className="container-wide py-6 flex flex-col gap-2">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(item.href);
                }}
                className="px-4 py-3 text-foreground hover:bg-muted rounded-lg transition-colors"
              >
                {item.label}
              </a>
            ))}
            <div className="border-t border-border my-2" />
            {user ? (
              <>
                {profile?.role !== 'admin' && (
                  <button
                    onClick={goToDashboard}
                    className="px-4 py-3 text-foreground hover:bg-muted rounded-lg transition-colors text-left flex items-center gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    {t('common:user.dashboard')}
                  </button>
                )}
                {profile?.role === 'admin' && (
                  <button
                    onClick={() => {
                      navigate('/admin');
                      setIsMobileMenuOpen(false);
                    }}
                    className="px-4 py-3 text-foreground hover:bg-muted rounded-lg transition-colors text-left flex items-center gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    {t('common:user.adminDashboard')}
                  </button>
                )}
                {profile?.role !== 'admin' && (
                  <button
                    onClick={goToDashboard}
                    className="px-4 py-3 text-foreground hover:bg-muted rounded-lg transition-colors text-left flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    {t('common:user.account')}
                  </button>
                )}
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsMobileMenuOpen(false);
                  }}
                  className="px-4 py-3 text-destructive hover:bg-muted rounded-lg transition-colors text-left flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  {t('common:buttons.logout')}
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setShowAuthModal(true);
                  setIsMobileMenuOpen(false);
                }}
                className="px-4 py-3 text-foreground hover:bg-muted rounded-lg transition-colors text-left"
              >
                {t('common:buttons.loginRegister')}
              </button>
            )}
            <Button
              variant="sage"
              className="mt-4"
              onClick={() => scrollToSection('#packages')}
            >
              {t('common:buttons.bookNow')}
            </Button>
          </nav>
        </div>
      </header>

      {/* Modals */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
};
