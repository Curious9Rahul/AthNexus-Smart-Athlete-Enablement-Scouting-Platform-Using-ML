import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const CTA = () => {
  return (
    <section className="relative py-32 bg-[#0f172a]">
      <div className="max-w-3xl mx-auto px-6 sm:px-8 text-center">
        {/* Glow */}
        <div className="absolute left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-lime-400/20 rounded-full blur-3xl" />

        <div className="relative">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Bring Intelligence to<br />
            <span className="text-lime-400">Your College Sports</span>
          </h2>

          <p className="text-xl text-gray-400 mb-10">
            Join 50+ colleges already using SportSphere.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              size="lg"
              className="bg-lime-400 hover:bg-lime-500 text-[#0f172a] font-semibold px-8 h-12"
            >
              Get Started
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 px-8 h-12"
            >
              Contact Sales
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
