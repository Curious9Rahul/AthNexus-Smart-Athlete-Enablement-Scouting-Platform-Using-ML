import { Twitter, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="relative bg-[#0a0f1c] border-t border-white/5">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 py-12">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <a href="#" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-lime-400 flex items-center justify-center">
              <span className="text-[#0f172a] font-bold">S</span>
            </div>
            <span className="text-white font-bold">
              Sport<span className="text-lime-400">Sphere</span>
            </span>
          </a>

          <div className="flex items-center gap-8">
            <a href="#features" className="text-gray-400 text-sm hover:text-white transition-colors">Features</a>
            <a href="#athletes" className="text-gray-400 text-sm hover:text-white transition-colors">Athletes</a>
            <a href="#events" className="text-gray-400 text-sm hover:text-white transition-colors">Events</a>
            <a href="#how-it-works" className="text-gray-400 text-sm hover:text-white transition-colors">How It Works</a>
          </div>

          <div className="flex items-center gap-4">
            <a href="#" className="text-gray-400 hover:text-lime-400 transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-lime-400 transition-colors">
              <Linkedin className="w-5 h-5" />
            </a>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/5 text-center">
          <p className="text-gray-500 text-sm">
            (c) 2026 SportSphere. Developed for A.P. Shah Institute of Technology.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
