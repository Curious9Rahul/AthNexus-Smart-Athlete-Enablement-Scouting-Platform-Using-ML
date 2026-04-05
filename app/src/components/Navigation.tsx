import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, User, LogOut, Globe, Search, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLocation, Link } from 'react-router-dom';

// ─── Language Data ────────────────────────────────────────────────────────────
const LANGUAGES = [
  { code: 'en',    name: 'English' },
  { code: 'hi',    name: 'Hindi' },
  { code: 'mr',    name: 'Marathi' },
  { code: 'bn',    name: 'Bengali' },
  { code: 'gu',    name: 'Gujarati' },
  { code: 'kn',    name: 'Kannada' },
  { code: 'ml',    name: 'Malayalam' },
  { code: 'pa',    name: 'Punjabi' },
  { code: 'ta',    name: 'Tamil' },
  { code: 'te',    name: 'Telugu' },
  { code: 'ur',    name: 'Urdu' },
  { code: 'es',    name: 'Spanish' },
  { code: 'fr',    name: 'French' },
  { code: 'de',    name: 'German' },
  { code: 'it',    name: 'Italian' },
  { code: 'pt',    name: 'Portuguese' },
  { code: 'ru',    name: 'Russian' },
  { code: 'ar',    name: 'Arabic' },
  { code: 'ja',    name: 'Japanese' },
  { code: 'ko',    name: 'Korean' },
  { code: 'zh-CN', name: 'Chinese (Simplified)' },
  { code: 'nl',    name: 'Dutch' },
  { code: 'tr',    name: 'Turkish' },
  { code: 'vi',    name: 'Vietnamese' },
  { code: 'th',    name: 'Thai' },
  { code: 'id',    name: 'Indonesian' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getActiveLangCode(): string {
  const match = document.cookie.match(/googtrans=\/en\/([^;]+)/);
  return match ? match[1] : 'en';
}

function changeLanguage(code: string): void {
  // Write the googtrans cookie (Google Translate reads this)
  const cookieValue = `/en/${code}`;
  document.cookie = `googtrans=${cookieValue}; path=/`;
  document.cookie = `googtrans=${cookieValue}; path=/; domain=${window.location.hostname}`;

  // Try to trigger the hidden widget's combo-box for an instant, no-reload switch
  const googleCombo = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
  if (googleCombo) {
    googleCombo.value = code;
    googleCombo.dispatchEvent(new Event('change'));
  } else {
    // Widget not mounted yet – reload so the cookie is picked up
    window.location.reload();
  }
}

// ─── LanguageSelector ─────────────────────────────────────────────────────────
const LanguageSelector = () => {
  const [open, setOpen]       = useState(false);
  const [search, setSearch]   = useState('');
  const [active, setActive]   = useState(() => getActiveLangCode());
  const dropdownRef           = useRef<HTMLDivElement>(null);
  const searchRef             = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 80);
  }, [open]);

  const filtered = LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.code.toLowerCase().includes(search.toLowerCase()),
  );

  const activeLang = LANGUAGES.find((l) => l.code === active) ?? LANGUAGES[0];

  const handleSelect = (code: string) => {
    setActive(code);
    setOpen(false);
    setSearch('');
    changeLanguage(code);
  };

  return (
    <div ref={dropdownRef} className="relative" id="language-selector-wrapper">
      {/* Trigger Button */}
      <button
        id="language-selector-btn"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                   text-gray-300 hover:text-white text-sm
                   border border-white/10 hover:border-lime-400/40
                   bg-white/5 hover:bg-white/10
                   transition-all duration-200 group"
      >
        <Globe className="w-3.5 h-3.5 text-lime-400 group-hover:rotate-12 transition-transform duration-300" />
        <span className="hidden sm:inline max-w-[80px] truncate">{activeLang.name}</span>
        <ChevronDown
          className={`w-3 h-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div
          role="listbox"
          className="absolute right-0 mt-2 w-56 rounded-xl
                     bg-[#0f172a] border border-white/10
                     shadow-xl shadow-black/50
                     overflow-hidden z-[200]
                     animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {/* Search */}
          <div className="p-2 border-b border-white/10">
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/5">
              <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search language…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none"
                id="language-search-input"
              />
            </div>
          </div>

          {/* List */}
          <ul className="max-h-60 overflow-y-auto py-1 custom-scrollbar">
            {filtered.length === 0 && (
              <li className="px-4 py-3 text-sm text-gray-500 text-center">No results</li>
            )}
            {filtered.map((lang) => (
              <li
                key={lang.code}
                role="option"
                aria-selected={active === lang.code}
                onMouseDown={() => handleSelect(lang.code)}
                className={`flex items-center justify-between px-4 py-2 cursor-pointer text-sm transition-colors
                  ${active === lang.code
                    ? 'bg-lime-400/10 text-lime-400'
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  }`}
              >
                <span>{lang.name}</span>
                {active === lang.code && (
                  <span className="w-1.5 h-1.5 rounded-full bg-lime-400 shrink-0" />
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// ─── Navigation Props ─────────────────────────────────────────────────────────
interface NavigationProps {
  onSignInClick?: () => void;
}

// ─── Navigation ───────────────────────────────────────────────────────────────
const Navigation = ({ onSignInClick }: NavigationProps) => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const isLandingPage = location.pathname === '/';
  const [isScrolled, setIsScrolled]       = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // ── Scroll handler ──────────────────────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ── Bootstrap Google Translate Widget (once) ────────────────────────────────
  useEffect(() => {
    if (document.getElementById('google-translate-script')) return; // already injected

    // Callback Google calls after its script loads
    (window as any).googleTranslateElementInit = () => {
      new (window as any).google.translate.TranslateElement(
        { pageLanguage: 'en', autoDisplay: false },
        'google_translate_hidden',
      );
    };

    const script = document.createElement('script');
    script.id    = 'google-translate-script';
    script.src   = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const navItems = [
    { label: 'Features',     href: '#features' },
    { label: 'Athletes',     href: '#athletes' },
    { label: 'AI',           href: '#ai' },
    { label: 'How It Works', href: '#how-it-works' },
  ];

  const handleSignOut = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/*
        ── Hidden Google Translate widget container ───────────────────────────
        MUST be in DOM but should NOT be display:none — Google's engine won't
        initialise if it's hidden that way. We push it far off-screen instead.
      */}
      <div
        id="google_translate_hidden"
        style={{ position: 'fixed', top: '-500px', left: '-500px', opacity: 0, pointerEvents: 'none' }}
        aria-hidden="true"
      />

      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isLandingPage
            ? (isScrolled ? 'bg-[#0f172a] border-b border-white/5 py-0' : 'bg-gradient-to-b from-[#0f172a] via-[#0f172a]/85 to-transparent backdrop-blur-[2px] py-2')
            : 'bg-[#0f172a] border-b border-white/5 py-0'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-lime-400 flex items-center justify-center">
                <span className="text-[#0f172a] font-bold">S</span>
              </div>
              <span className="text-white font-bold tracking-tight">
                Ath<span className="text-lime-400">Nexus</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            {isLandingPage && (
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
            )}

            {/* Desktop CTA + Language Selector */}
            <div className="hidden lg:flex items-center gap-3">
              {/* 🌐 Language Selector */}
              <LanguageSelector />

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
              {isLandingPage && navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="block text-white py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}

              {/* 🌐 Language Selector — mobile */}
              <div className="pt-2">
                <p className="text-xs text-gray-500 mb-2 uppercase tracking-widest">Language</p>
                <LanguageSelector />
              </div>

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
                      onClick={() => { onSignInClick?.(); setIsMobileMenuOpen(false); }}
                      variant="outline"
                      className="w-full border-white/20 text-white hover:bg-white/5"
                    >
                      Sign in
                    </Button>
                    <Button
                      onClick={() => { onSignInClick?.(); setIsMobileMenuOpen(false); }}
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
    </>
  );
};

export default Navigation;
