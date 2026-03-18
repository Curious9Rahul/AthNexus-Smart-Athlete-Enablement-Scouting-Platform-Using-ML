import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, User, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface NavigationProps {
  onSignInClick?: () => void;
}

const Navigation = ({ onSignInClick }: NavigationProps) => {
  const { isAuthenticated, user, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Features', href: '#features' },
    { label: 'Events', href: '#events' },
    { label: 'Athletes', href: '#athletes' },
    { label: 'AI', href: '#ai' },
    { label: 'How It Works', href: '#how-it-works' },
  ];

  const handleSignOut = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
        ? 'bg-[#0f172a] border-b border-white/5 py-0'
        : 'bg-gradient-to-b from-[#0f172a] via-[#0f172a]/85 to-transparent backdrop-blur-[2px] py-2'
        }`}
    >
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-lime-400 flex items-center justify-center">
              <span className="text-[#0f172a] font-bold">S</span>
            </div>
            <span className="text-white font-bold tracking-tight">
              Ath<span className="text-lime-400">Nexus</span>
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-gray-300 hover:text-white text-sm transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-2 text-gray-300">
                  <User className="w-4 h-4" />
                  <span className="text-sm">{user?.email}</span>
                </div>
                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  className="text-gray-300 hover:text-white hover:bg-white/5 text-sm"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={onSignInClick}
                  variant="ghost"
                  className="text-gray-300 hover:text-white hover:bg-white/5 text-sm"
                >
                  Sign in
                </Button>
                <Button
                  onClick={onSignInClick}
                  className="bg-lime-400 hover:bg-lime-500 text-[#0f172a] font-semibold text-sm px-5"
                >
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#0f172a] border-t border-white/5">
          <div className="px-6 py-6 space-y-4">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="block text-white py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <div className="pt-4 border-t border-white/10 space-y-3">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-2 text-gray-300 py-2">
                    <User className="w-4 h-4" />
                    <span className="text-sm">{user?.email}</span>
                  </div>
                  <Button
                    onClick={handleSignOut}
                    variant="outline"
                    className="w-full border-white/20 text-white hover:bg-white/5"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => {
                      onSignInClick?.();
                      setIsMobileMenuOpen(false);
                    }}
                    variant="outline"
                    className="w-full border-white/20 text-white hover:bg-white/5"
                  >
                    Sign in
                  </Button>
                  <Button
                    onClick={() => {
                      onSignInClick?.();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full bg-lime-400 hover:bg-lime-500 text-[#0f172a] font-semibold"
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navigation;
