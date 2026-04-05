import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { isAuthenticated, user, hasProfile } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (!isAuthenticated) {
      navigate('/auth');
    } else if (user?.role === 'verifier') {
      navigate('/verifier/event-approval');
    } else if (hasProfile) {
      navigate('/dashboard');
    } else {
      navigate('/profile-setup');
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.7;
    }
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Video Background - Full visibility */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
          onLoadedData={() => {}}
        >
          <source src="/sports-bg.mp4" type="video/mp4" />
        </video>
        {/* Lighter overlay to show video better */}
        <div className="absolute inset-0 bg-[#0f172a]/50" />
      </div>

      {/* Content - Minimal and centered */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 pt-24 pb-16">
        <div className="text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-lime-400/20 border border-lime-400/30">
            <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
            <span className="text-lime-400 text-sm font-medium tracking-wide">
              AI-Powered Sports Selection
            </span>
          </div>

          {/* Headline - Clean and bold */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight">
            Making College Sports<br />
            <span className="text-lime-400">Intelligent</span>
          </h1>

          {/* Subtext - Short and punchy */}
          <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Showcase athletes. Manage events. Enable fair, data-driven player selection.
          </p>

          {/* CTAs - Simple */}
          <div className="flex flex-wrap gap-4 justify-center pt-4">
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="bg-lime-400 hover:bg-lime-500 text-[#0f172a] font-semibold px-8 h-12 transition-all hover:scale-105"
            >
              Get Started
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 px-8 h-12"
            >
              <Play className="mr-2 w-5 h-5" />
              Watch Demo
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0f172a] to-transparent z-10" />
    </section>
  );
};

export default Hero;
